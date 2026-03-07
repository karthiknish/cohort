'use client'

import { useMemo, useState } from 'react'
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react'
import {
  CircleAlert,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserMinus,
  UserPlus,
  Users as UsersIcon,
} from 'lucide-react'
import Link from 'next/link'

import { api } from '../../../../convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { DATE_FORMATS, formatDate as formatDateLib } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { ADMIN_USER_ROLES, ADMIN_USER_STATUSES, type AdminUserRecord, type AdminUserRole, type AdminUserStatus } from '@/types/admin'
import { buildClientAllocationSummary } from '../lib/client-allocation'

type UserStatus = AdminUserStatus

type StatusFilter = 'all' | AdminUserStatus

type RoleFilter = 'all' | AdminUserRole

const ROLE_OPTIONS = ADMIN_USER_ROLES.filter((role) => role !== 'client')
const STATUS_OPTIONS: StatusFilter[] = ['all', ...ADMIN_USER_STATUSES]

type AdminUserRow = {
  legacyId: string
  email?: string | null
  name?: string | null
  role?: string | null
  status?: string | null
  agencyId?: string | null
  createdAtMs?: number | null
  updatedAtMs?: number | null
}

function isAdminUserRole(value: unknown): value is AdminUserRole {
  return typeof value === 'string' && ADMIN_USER_ROLES.includes(value as AdminUserRole)
}

function isAdminUserStatus(value: unknown): value is AdminUserStatus {
  return typeof value === 'string' && ADMIN_USER_STATUSES.includes(value as AdminUserStatus)
}

export default function AdminTeamPage() {
  const { user } = useAuth()
  const [usersOverride, setUsersOverride] = useState<AdminUserRecord[] | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const workspaceId = user?.agencyId ?? user?.id
  const { toast } = useToast()

  const { results: usersPage, status, loadMore, isLoading } = usePaginatedQuery(
    api.adminUsers.listUsers,
    {
      workspaceId,
      includeAllWorkspaces: false,
    },
    { initialNumItems: 50 }
  )

  const updateUserRoleStatus = useMutation(api.adminUsers.updateUserRoleStatus)
  const createInvitation = useMutation(api.adminInvitations.createInvitation)
  const clientsData = useQuery(api.clients.list, workspaceId ? {
    workspaceId,
    limit: 200,
    cursor: null,
    includeAllWorkspaces: false,
  } : 'skip')

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<AdminUserRole>('team')
  const [inviteSending, setInviteSending] = useState(false)

  const users: AdminUserRecord[] = useMemo(() => {
    if (usersOverride) return usersOverride

    // Convex returns a simplified record; adapt to existing AdminUserRecord expectations.
    return (Array.isArray(usersPage) ? usersPage : []).map((row) => {
      const typedRow = row as AdminUserRow
      return {
      id: typedRow.legacyId,
      email: typedRow.email ?? '',
      name: typedRow.name ?? '',
      role: isAdminUserRole(typedRow.role) ? typedRow.role : 'team',
      status: isAdminUserStatus(typedRow.status) ? typedRow.status : 'pending',
      agencyId: typedRow.agencyId ?? null,
      createdAt: typedRow.createdAtMs ? new Date(typedRow.createdAtMs).toISOString() : null,
      updatedAt: typedRow.updatedAtMs ? new Date(typedRow.updatedAtMs).toISOString() : null,
      lastLoginAt: null,
    }})
  }, [usersOverride, usersPage])

  const loading = isLoading

  const internalUsers = useMemo(() => users.filter((candidate) => candidate.role !== 'client'), [users])

  const allocationSummary = useMemo(() => {
    const clientRows = Array.isArray(clientsData?.items) ? clientsData.items : []

    return buildClientAllocationSummary(
      internalUsers.map((record) => ({
        id: record.id,
        name: record.name,
        email: record.email,
        role: record.role,
        status: record.status,
      })),
      clientRows.map((client) => ({
        id: client.legacyId,
        name: client.name,
        accountManager: client.accountManager,
        teamMembers: client.teamMembers ?? [],
      }))
    )
  }, [clientsData?.items, internalUsers])

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return internalUsers.filter((candidate) => {
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
  }, [internalUsers, roleFilter, searchTerm, statusFilter])

  const summary = useMemo(() => {
    const active = internalUsers.filter((record) => record.status === 'active').length
    const admins = internalUsers.filter((record) => record.role === 'admin').length
    const allocated = internalUsers.filter((record) => (allocationSummary.byUserId[record.id]?.totalClientNames.length ?? 0) > 0).length

    return {
      total: internalUsers.length,
      active,
      admins,
      allocated,
    }
  }, [allocationSummary.byUserId, internalUsers])

  const handleRoleChange = (userId: string, role: AdminUserRecord['role']) => {
    setSavingId(userId)
    setError(null)

    void updateUserRoleStatus({ legacyId: userId, role })
      .then(() => {
        setUsersOverride((prev) => {
          const base = prev ?? users
          return base.map((record) => (record.id === userId ? { ...record, role } : record))
        })
        toast({ title: 'Role updated', description: `Member is now a ${role}.` })
      })
      .catch((err: unknown) => {
        logError(err, 'AdminTeamPage:handleRoleChange')
        const message = asErrorMessage(err)
        setError(message)
        toast({ title: 'Role update failed', description: message, variant: 'destructive' })
      })
      .finally(() => {
        setSavingId(null)
      })
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

  const handleStatusAction = (userRecord: AdminUserRecord) => {
    setSavingId(userRecord.id)
    setError(null)

    const nextStatus = deriveNextStatus(userRecord.status)

    void updateUserRoleStatus({ legacyId: userRecord.id, status: nextStatus })
      .then(() => {
        setUsersOverride((prev) => {
          const base = prev ?? users
          return base.map((record) => (record.id === userRecord.id ? { ...record, status: nextStatus } : record))
        })
        toast({
          title: 'Status updated',
          description: `Member is now ${nextStatus.replace('_', ' ')}.`,
        })
      })
      .catch((err: unknown) => {
        logError(err, 'AdminTeamPage:handleStatusAction')
        const message = asErrorMessage(err)
        setError(message)
        toast({ title: 'Status update failed', description: message, variant: 'destructive' })
      })
      .finally(() => {
        setSavingId(null)
      })
  }

  const handleInviteUser = () => {
    if (!inviteEmail || !user?.id) return
    
    setInviteSending(true)

    void createInvitation({
      email: inviteEmail,
      role: inviteRole,
      invitedBy: user.id,
      invitedByName: user?.name ?? null,
    })
      .then(() => {
        toast({
          title: 'Invitation sent!',
          description: `Invitation created for ${inviteEmail} as ${inviteRole}. Email delivery depends on server integration settings.`,
        })
        setInviteOpen(false)
        setInviteEmail('')
        setInviteRole('team')
      })
      .catch((err: unknown) => {
        logError(err, 'AdminTeamPage:handleInviteUser')
        const message = asErrorMessage(err)
        toast({ title: 'Invitation failed', description: message, variant: 'destructive' })
      })
      .finally(() => {
        setInviteSending(false)
      })
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
            <p className="text-muted-foreground">Manage internal staff, their roles, and how they are allocated across client workspaces.</p>
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total teammates</CardTitle>
              <UsersIcon className={cn('h-4 w-4 text-muted-foreground', loading && 'animate-spin')} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">In this workspace</p>
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

          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Allocated to clients</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.allocated}</div>
              <p className="text-xs text-muted-foreground">Internal users attached to at least one client</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-lg">Team directory</CardTitle>
              <CardDescription>Search internal teammates, manage permissions, and review their current client allocation load.</CardDescription>
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
                    <th className="w-40 py-2 pr-3 font-medium">Client allocation</th>
                    <th className="w-40 py-2 pr-3 font-medium">Last active</th>
                    <th className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                        {loading
                          ? 'Loading team…'
                          : error
                          ? `Unable to load teammates: ${error}`
                          : 'No teammates match the current filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((record) => {
                      const allocation = allocationSummary.byUserId[record.id] ?? {
                        managedClientNames: [],
                        supportingClientNames: [],
                        totalClientNames: [],
                      }

                      return (
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
                          <td className="py-3 pr-3 align-middle">
                            {allocation.totalClientNames.length > 0 ? (
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-foreground">
                                  {allocation.totalClientNames.length} client{allocation.totalClientNames.length === 1 ? '' : 's'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Owner {allocation.managedClientNames.length} · Support {allocation.supportingClientNames.length}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Unassigned</span>
                            )}
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
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {status === 'CanLoadMore' ? (
              <div className="mt-6 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                   onClick={() => {
                     if (loadingMore) return
                     setLoadingMore(true)

                     void Promise.resolve()
                       .then(() => loadMore(50))
                       .catch((err: unknown) => {
                         logError(err, 'AdminTeamPage:loadMore')
                       })
                       .finally(() => {
                         setLoadingMore(false)
                       })
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
