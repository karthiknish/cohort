'use client'

import { useMemo, useState } from 'react'
import { CircleAlert, RefreshCw, ShieldCheck, UserCheck, Users as UsersIcon, UserPlus, MoreHorizontal, Trash2 } from 'lucide-react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { ADMIN_USER_ROLES, ADMIN_USER_STATUSES, type AdminUserRecord, type AdminUserRole, type AdminUserStatus } from '@/types/admin'
import { cn } from '@/lib/utils'

type StatusFilter = 'all' | AdminUserStatus
type RoleFilter = 'all' | AdminUserRole

const ROLE_ASSIGNABLE: AdminUserRole[] = ['team', 'client']

const STATUS_OPTIONS: StatusFilter[] = ['all', ...ADMIN_USER_STATUSES]

export default function AdminUsersPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [usersOverride, setUsersOverride] = useState<AdminUserRecord[] | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const { results: usersPage, status, loadMore, isLoading } = usePaginatedQuery(
    api.adminUsers.listUsers,
    {},
    { initialNumItems: 50 }
  )

  const updateUserRoleStatus = useMutation(api.adminUsers.updateUserRoleStatus)
  const createInvitation = useMutation(api.adminInvitations.createInvitation)

  // Dialog states
  const [inviteOpen, setInviteOpen] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<AdminUserRole>('team')
  const [inviteSending, setInviteSending] = useState(false)

  const users: AdminUserRecord[] = useMemo(() => {
    if (usersOverride) return usersOverride

    return (usersPage ?? []).map((row: any) => ({
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
    return users.filter((record) => {
      if (statusFilter !== 'all' && record.status !== statusFilter) {
        return false
      }
      if (roleFilter !== 'all' && record.role !== roleFilter) {
        return false
      }
      if (search.length > 0) {
        const haystack = `${record.name} ${record.email}`.toLowerCase()
        return haystack.includes(search)
      }
      return true
    })
  }, [users, statusFilter, roleFilter, searchTerm])

  const summary = useMemo(() => {
    const pending = users.filter((record) => record.status === 'pending' || record.status === 'invited').length
    const active = users.filter((record) => record.status === 'active').length
    const total = users.length
    return { total, pending, active }
  }, [users])

  const handleRoleChange = async (record: AdminUserRecord, nextRole: AdminUserRole) => {
    if (record.role === nextRole) {
      return
    }

    if (!ROLE_ASSIGNABLE.includes(nextRole) && record.role !== nextRole) {
      // Only admin can assign admin role from team page
      toast({ title: 'Unsupported role', description: 'This page only manages team or client roles.', variant: 'destructive' })
      return
    }

    setSavingId(record.id)
    try {
      await updateUserRoleStatus({ legacyId: record.id, role: nextRole })

      setUsersOverride((prev) => {
        const base = prev ?? users
        return base.map((userRecord) => (userRecord.id === record.id ? { ...userRecord, role: nextRole } : userRecord))
      })
      toast({ title: 'Role updated', description: `${record.name} is now ${nextRole}.` })
    } catch (err: unknown) {
      const message = asErrorMessage(err)
      toast({ title: 'Admin error', description: message, variant: 'destructive' })
    } finally {
      setSavingId(null)
    }
  }

  const handleApprovalToggle = async (record: AdminUserRecord, approved: boolean) => {
    if (record.role === 'admin' && !approved) {
      toast({ title: 'Cannot disable admin', description: 'Admin accounts must remain active.', variant: 'destructive' })
      return
    }

    const nextStatus: AdminUserStatus = approved ? 'active' : 'pending'
    if (record.status === nextStatus) {
      return
    }

    setSavingId(record.id)
    try {
      await updateUserRoleStatus({ legacyId: record.id, status: nextStatus })

      setUsersOverride((prev) => {
        const base = prev ?? users
        return base.map((userRecord) => (userRecord.id === record.id ? { ...userRecord, status: nextStatus } : userRecord))
      })
      toast({ title: approved ? 'Account approved' : 'Approval revoked', description: `${record.name} status set to ${nextStatus}.` })
      setRevokeOpen(false)
    } catch (err: unknown) {
      logError(err, 'AdminUsers:handleApprovalToggle')
      const message = asErrorMessage(err)
      toast({ title: 'Admin error', description: message, variant: 'destructive' })
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
        title: 'Invitation created',
        description: emailSent 
          ? `Invitation sent to ${inviteEmail} as ${inviteRole}.`
          : `Invitation created for ${inviteEmail}. Email notification could not be sent.`,
      })
      setInviteOpen(false)
      setInviteEmail('')
      setInviteRole('team')
    } catch (err: unknown) {
      logError(err, 'AdminUsers:handleInviteUser')
      const message = asErrorMessage(err)
      toast({ title: 'Invitation error', description: message, variant: 'destructive' })
    } finally {
      setInviteSending(false)
    }
  }

  const handleRefresh = () => {
    if (loading) return
    setStatusFilter('pending')
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
            <CardDescription>Log in to an admin account to approve new users.</CardDescription>
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
            <h1 className="text-3xl font-bold tracking-tight">User approvals</h1>
            <p className="text-muted-foreground">Approve pending accounts, assign workspace roles, and keep access aligned with your team structure.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
              <CardTitle className="text-sm font-medium">Total users</CardTitle>
              <UsersIcon className={cn('h-4 w-4 text-muted-foreground', loading && 'animate-spin')} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">All accounts in your organisation</p>
            </CardContent>
          </Card>

          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending approval</CardTitle>
              <CircleAlert className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting activation</p>
            </CardContent>
          </Card>

          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active users</CardTitle>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.active}</div>
              <p className="text-xs text-muted-foreground">Currently able to sign in</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-lg">Account directory</CardTitle>
              <CardDescription>Filter by status or role, approve users, and assign them to team or client access.</CardDescription>
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
                      {status === 'all' ? 'All statuses' : statusLabel(status)}
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
                  {ADMIN_USER_ROLES.map((role) => (
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
                    <th className="w-72 py-2 pr-3 font-medium">User</th>
                    <th className="w-32 py-2 pr-3 font-medium">Role</th>
                    <th className="w-32 py-2 pr-3 text-center font-medium">Approved</th>
                    <th className="w-32 py-2 pr-3 font-medium">Status</th>
                    <th className="w-40 py-2 pr-3 font-medium">Last active</th>
                    <th className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        {loading
                          ? 'Loading users…'
                          : error
                          ? `Unable to load users: ${error}`
                          : 'No users match the current filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((record) => {
                      const approvalDisabled = savingId === record.id || record.role === 'admin'

                      return (
                        <tr key={record.id} className="border-b border-muted/30">
                          <td className="py-3 pr-3 align-top">
                            <div className="font-medium text-foreground">{record.name}</div>
                            <div className="text-xs text-muted-foreground">{record.email || 'No email on file'}</div>
                            {record.agencyId && (
                              <div className="text-xs text-muted-foreground">Agency: {record.agencyId}</div>
                            )}
                          </td>
                          <td className="py-3 pr-3 align-middle">
                            <Select
                              value={record.role}
                              onValueChange={(value) => handleRoleChange(record, value as AdminUserRole)}
                              disabled={savingId === record.id || record.role === 'admin'}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_ASSIGNABLE.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                  </SelectItem>
                                ))}
                                {record.role === 'admin' && <SelectItem value="admin">Admin</SelectItem>}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 pr-3 text-center align-middle">
                            <Checkbox
                              checked={record.status === 'active'}
                              onChange={(e) => {
                                const checked = e.target.checked
                                if (checked === false) {
                                  setSelectedUser(record)
                                  setRevokeOpen(true)
                                } else {
                                  handleApprovalToggle(record, true)
                                }
                              }}
                              disabled={approvalDisabled}
                              aria-label={`Toggle approval for ${record.name}`}
                            />
                          </td>
                          <td className="py-3 pr-3 align-middle">
                            <Badge variant={statusToVariant(record.status)} className="capitalize">
                              {statusLabel(record.status)}
                            </Badge>
                          </td>
                          <td className="py-3 pr-3 align-middle text-xs text-muted-foreground">
                            {formatDate(record.lastLoginAt)}
                          </td>
                          <td className="py-3 text-right align-middle">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(record.email)}>
                                  Copy email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {record.status !== 'active' ? (
                                  <DropdownMenuItem onClick={() => handleApprovalToggle(record, true)}>
                                    <UserCheck className="mr-2 h-4 w-4" /> Approve user
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedUser(record)
                                      setRevokeOpen(true)
                                    }}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Revoke access
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                   onClick={async () => {
                     if (loadingMore) return
                     setLoadingMore(true)
                      try {
                        await loadMore(50)
                      } catch (err) {
                        logError(err, 'AdminUsers:loadMore')
                      } finally {
                        setLoadingMore(false)
                      }
                   }}

                  disabled={loadingMore}
                  className="inline-flex items-center gap-2"
                >
                  {loadingMore ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  {loadingMore ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke access?</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke access for <strong>{selectedUser?.name}</strong>? They will no longer be able to sign in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedUser) {
                  handleApprovalToggle(selectedUser, false)
                }
              }}
            >
              Revoke Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function statusLabel(status: AdminUserStatus | 'all'): string {
  if (status === 'all') {
    return 'All'
  }
  return status.replace('_', ' ')
}

function statusToVariant(status: AdminUserStatus) {
  switch (status) {
    case 'active':
      return 'default' as const
    case 'pending':
    case 'invited':
      return 'secondary' as const
    case 'disabled':
    case 'suspended':
    default:
      return 'destructive' as const
  }
}

function formatDate(value: string | null): string {
  return formatDateLib(value, DATE_FORMATS.WITH_TIME, undefined, '—')
}
