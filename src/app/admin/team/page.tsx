'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  CircleAlert,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserMinus,
  Users as UsersIcon,
  UserPlus,
} from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { useMutation, usePaginatedQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { DATE_FORMATS, formatDate as formatDateLib } from '@/lib/dates'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { ADMIN_USER_ROLES, ADMIN_USER_STATUSES, type AdminUserRecord, type AdminUserRole, type AdminUserStatus } from '@/types/admin'

type UserStatus = AdminUserStatus

type StatusFilter = 'all' | AdminUserStatus

type RoleFilter = 'all' | AdminUserRole

const ROLE_OPTIONS = ADMIN_USER_ROLES
const STATUS_OPTIONS: StatusFilter[] = ['all', ...ADMIN_USER_STATUSES]

export default function AdminTeamPage() {
  const { user } = useAuth()
  const [usersOverride, setUsersOverride] = useState<AdminUserRecord[] | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const { toast } = useToast()

  const { results: usersPage, status, loadMore, isLoading } = usePaginatedQuery(
    api.adminUsers.listUsers as any,
    {},
    { initialNumItems: 50 }
  )

  const updateUserRoleStatus = useMutation(api.adminUsers.updateUserRoleStatus)
  const createInvitation = useMutation(api.adminInvitations.createInvitation)

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<AdminUserRole>('team')
  const [inviteSending, setInviteSending] = useState(false)

  const users: AdminUserRecord[] = useMemo(() => {
    if (usersOverride) return usersOverride

    // Convex returns a simplified record; adapt to existing AdminUserRecord expectations.
    return (Array.isArray(usersPage) ? usersPage : []).map((row: any) => ({
      id: row.legacyId,
      email: row.email ?? '',
      name: row.name ?? '',
      role: row.role ?? 'team',
      status: row.status ?? 'pending',
      agencyId: row.agencyId ?? null,
      createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
      updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null,
      lastLoginAt: null,
    }))
  }, [usersOverride, usersPage])

  const loading = isLoading

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return users.filter((candidate) => {
      if (statusFilter !== 'all' && candidate.status !== statusFilter) {
        return false
      }
      if (roleFilter !== 'all' && candidate.role !== roleFilter) {
        return false
      }
      if (search.length > 0) {
        const haystack = `${candidate.name} ${candidate.email}`.toLowerCase()
        return haystack.includes(search)
      }
      return true
    })
  }, [users, statusFilter, roleFilter, searchTerm])

  const summary = useMemo(() => {
    const active = users.filter((record) => record.status === 'active').length
    const admins = users.filter((record) => record.role === 'admin').length
    const disabled = users.filter((record) => record.status === 'disabled' || record.status === 'suspended').length

    return {
      total: users.length,
      active,
      admins,
      disabled,
    }
  }, [users])

  const handleRoleChange = async (userId: string, role: AdminUserRecord['role']) => {
    setSavingId(userId)
    setError(null)

    try {
      await updateUserRoleStatus({ legacyId: userId, role })

      setUsersOverride((prev) => {
        const base = prev ?? users
        return base.map((record) => (record.id === userId ? { ...record, role } : record))
      })
      toast({ title: 'Role updated', description: `Member is now a ${role}.` })
    } catch (err: unknown) {
      logError(err, 'AdminTeamPage:handleRoleChange')
      const message = asErrorMessage(err)
      setError(message)
      toast({ title: 'Role update failed', description: message, variant: 'destructive' })
    } finally {
      setSavingId(null)
    }
  }

  const handleAdminToggle = (record: AdminUserRecord, makeAdmin: boolean) => {
    if (makeAdmin && record.role === 'admin') {
      return
    }

    if (!makeAdmin && record.role !== 'admin') {
      return
    }

    const fallbackRole: AdminUserRecord['role'] = makeAdmin ? 'admin' : 'team'
    void handleRoleChange(record.id, fallbackRole)
  }

  const handleStatusAction = async (userRecord: AdminUserRecord) => {
    setSavingId(userRecord.id)
    setError(null)

    const nextStatus = deriveNextStatus(userRecord.status)

    try {
      await updateUserRoleStatus({ legacyId: userRecord.id, status: nextStatus })

      setUsersOverride((prev) => {
        const base = prev ?? users
        return base.map((record) => (record.id === userRecord.id ? { ...record, status: nextStatus } : record))
      })
      toast({
        title: 'Status updated',
        description: `Member is now ${nextStatus.replace('_', ' ')}.`,
      })
    } catch (err: unknown) {
      logError(err, 'AdminTeamPage:handleStatusAction')
      const message = asErrorMessage(err)
      setError(message)
      toast({ title: 'Status update failed', description: message, variant: 'destructive' })
    } finally {
      setSavingId(null)
    }
  }

  const handleInviteUser = async () => {
    if (!inviteEmail) return
    
    setInviteSending(true)
    try {
      await createInvitation({
        email: inviteEmail,
        role: inviteRole,
        invitedBy: user!.id,
        invitedByName: user?.name ?? null,
      })

      const emailSent = true
      
      toast({
        title: 'Invitation sent!',
        description: emailSent 
          ? `${inviteEmail} will receive an invite to join as ${inviteRole}.`
          : `Invitation created for ${inviteEmail}, but email delivery failed.`,
      })
      setInviteOpen(false)
      setInviteEmail('')
      setInviteRole('team')
    } catch (err: unknown) {
      logError(err, 'AdminTeamPage:handleInviteUser')
      const message = asErrorMessage(err)
      toast({ title: 'Invitation failed', description: message, variant: 'destructive' })
    } finally {
      setInviteSending(false)
    }
  }

  const handleRefresh = () => {
    if (loading) return
    setStatusFilter('all')
    setRoleFilter('all')
    setSearchTerm('')
    setUsersOverride(null)
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16">
        <Card className="max-w-md border-muted/60">
          <CardHeader>
            <CardTitle className="text-lg">Sign in required</CardTitle>
            <CardDescription>Log in to an admin account to manage your team.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-muted/40">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team management</h1>
            <p className="text-muted-foreground">Review active teammates, adjust roles, and keep access aligned with responsibilities.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/clients">Client workspaces</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">Back to admin home</Link>
            </Button>
            <Button type="button" variant="outline" onClick={handleRefresh} disabled={loading} className="inline-flex items-center gap-2">
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
            </Button>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" /> Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite new user</DialogTitle>
                  <DialogDescription>
                    Send an invitation email to add a new member to your organization.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AdminUserRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team">Team Member</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={inviteSending}>Cancel</Button>
                  <Button onClick={handleInviteUser} disabled={!inviteEmail || inviteSending}>
                    {inviteSending ? 'Sending…' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total teammates</CardTitle>
              <UsersIcon className={cn('h-4 w-4 text-muted-foreground', loading && 'animate-spin')} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">Across all agencies</p>
            </CardContent>
          </Card>

          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active accounts</CardTitle>
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.active}</div>
              <p className="text-xs text-muted-foreground">Currently enabled</p>
            </CardContent>
          </Card>

          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.admins}</div>
              <p className="text-xs text-muted-foreground">Including yourself</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-lg">Team directory</CardTitle>
              <CardDescription>Search and manage permissions across your organisation.</CardDescription>
            </div>
            <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
              <Input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="lg:w-64"
              />
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger className="lg:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'All statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
                <SelectTrigger className="lg:w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed text-left text-sm">
                <thead>
                  <tr className="border-b border-muted/40">
                    <th className="w-64 py-2 pr-3 font-medium">Team member</th>
                    <th className="w-32 py-2 pr-3 font-medium">Role</th>
                    <th className="w-24 py-2 pr-3 text-center font-medium">Admin</th>
                    <th className="w-32 py-2 pr-3 font-medium">Status</th>
                    <th className="w-40 py-2 pr-3 font-medium">Joined</th>
                    <th className="w-40 py-2 pr-3 font-medium">Last active</th>
                    <th className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        {loading
                          ? 'Loading team…'
                          : error
                          ? `Unable to load teammates: ${error}`
                          : 'No teammates match the current filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((record) => (
                      <tr key={record.id} className="border-b border-muted/30">
                        <td className="py-3 pr-3">
                          <div className="font-medium text-foreground">{record.name}</div>
                          <div className="text-xs text-muted-foreground">{record.email || 'No email on file'}</div>
                          {record.agencyId && (
                            <div className="text-xs text-muted-foreground">Agency: {record.agencyId}</div>
                          )}
                        </td>
                        <td className="py-3 pr-3 align-middle">
                          <Select
                            value={record.role}
                            onValueChange={(value) => handleRoleChange(record.id, value as AdminUserRecord['role'])}
                            disabled={savingId === record.id}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 pr-3 text-center align-middle">
                          <Checkbox
                            checked={record.role === 'admin'}
                            onChange={(event) => handleAdminToggle(record, event.target.checked)}
                            disabled={savingId === record.id}
                            aria-label={`Toggle admin role for ${record.name}`}
                          />
                        </td>
                        <td className="py-3 pr-3 align-middle">
                          <Badge variant={statusToVariant(record.status)} className="capitalize">
                            {record.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 pr-3 align-middle text-xs text-muted-foreground">
                          {formatDate(record.createdAt)}
                        </td>
                        <td className="py-3 pr-3 align-middle text-xs text-muted-foreground">
                          {formatDate(record.lastLoginAt)}
                        </td>
                        <td className="py-3 align-middle text-right">
                          <Button
                            type="button"
                            variant={record.status === 'active' ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => handleStatusAction(record)}
                            disabled={savingId === record.id}
                            className="inline-flex items-center gap-2"
                          >
                            {savingId === record.id ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <ActionIcon status={record.status} />
                            )}
                            {statusActionLabel(record.status)}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {status === 'CanLoadMore' ? (
              <div className="mt-6 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                   onClick={async () => {
                     if (loadingMore) return
                     setLoadingMore(true)
                     try {
                       await loadMore(50)
                     } finally {
                       setLoadingMore(false)
                     }
                   }}

                  disabled={loadingMore}
                  className="inline-flex items-center gap-2"
                >
                  {loadingMore ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  {loadingMore ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function deriveNextStatus(status: UserStatus): UserStatus {
  if (status === 'disabled' || status === 'suspended') {
    return 'active'
  }
  if (status === 'active') {
    return 'disabled'
  }
  return 'active'
}

function statusActionLabel(status: UserStatus): string {
  switch (status) {
    case 'active':
      return 'Disable access'
    case 'disabled':
      return 'Activate'
    case 'suspended':
      return 'Reinstate'
    case 'pending':
      return 'Approve access'
    case 'invited':
      return 'Activate'
    default:
      return 'Activate'
  }
}

function statusToVariant(status: UserStatus) {
  switch (status) {
    case 'active':
      return 'default' as const
    case 'disabled':
    case 'suspended':
      return 'destructive' as const
    case 'invited':
    case 'pending':
    default:
      return 'secondary' as const
  }
}

function formatDate(value: string | null): string {
  return formatDateLib(value, DATE_FORMATS.WITH_TIME, undefined, '—')
}

function ActionIcon({ status }: { status: UserStatus }) {
  if (status === 'active') {
    return <UserMinus className="h-4 w-4" />
  }
  if (status === 'disabled' || status === 'suspended') {
    return <UserCheck className="h-4 w-4" />
  }
  return <CircleAlert className="h-4 w-4" />
}
