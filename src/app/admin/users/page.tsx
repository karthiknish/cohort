'use client'

import { useMemo, useState } from 'react'
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react'
import {
  CircleAlert,
  MoreHorizontal,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { DATE_FORMATS, formatDate as formatDateLib } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { ADMIN_USER_ROLES, ADMIN_USER_STATUSES, type AdminUserRecord, type AdminUserRole, type AdminUserStatus } from '@/types/admin'

type StatusFilter = 'all' | AdminUserStatus
type RoleFilter = 'all' | AdminUserRole
type InvitationLifecycleStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

type AdminInvitationRecord = {
  id: string
  email: string
  role: AdminUserRole
  name: string | null
  message: string | null
  status: InvitationLifecycleStatus
  effectiveStatus: InvitationLifecycleStatus
  invitedBy: string
  invitedByName: string | null
  expiresAtMs: number
  createdAtMs: number
  acceptedAtMs: number | null
}

const ROLE_ASSIGNABLE: AdminUserRole[] = ['team', 'client']

const STATUS_OPTIONS: StatusFilter[] = ['all', ...ADMIN_USER_STATUSES]
const INVITATION_STATUSES: InvitationLifecycleStatus[] = ['pending', 'accepted', 'expired', 'revoked']

function normalizeAdminRole(value: string | null | undefined): AdminUserRole {
  if (typeof value === 'string' && ADMIN_USER_ROLES.includes(value as AdminUserRole)) {
    return value as AdminUserRole
  }
  return 'team'
}

function normalizeAdminStatus(value: string | null | undefined): AdminUserStatus {
  if (typeof value === 'string' && ADMIN_USER_STATUSES.includes(value as AdminUserStatus)) {
    return value as AdminUserStatus
  }
  return 'pending'
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [usersOverride, setUsersOverride] = useState<AdminUserRecord[] | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [invitationSearchTerm, setInvitationSearchTerm] = useState('')
  const [invitationStatusFilter, setInvitationStatusFilter] = useState<InvitationLifecycleStatus>('pending')
  const [error] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [invitationActionKey, setInvitationActionKey] = useState<string | null>(null)
  const workspaceContext = useQuery(api.users.getMyWorkspaceContext, user ? {} : 'skip')
  const workspaceId = workspaceContext?.workspaceId ?? null
  const includeAllWorkspaces = workspaceContext?.role === 'admin'

  const { results: usersPage, status, loadMore, isLoading } = usePaginatedQuery(
    api.adminUsers.listUsers,
    workspaceId
      ? {
          workspaceId,
          includeAllWorkspaces,
        }
      : 'skip',
    { initialNumItems: 50 }
  )

  const updateUserRoleStatus = useMutation(api.adminUsers.updateUserRoleStatus)
  const createInvitation = useMutation(api.adminInvitations.createInvitation)
  const resendInvitation = useMutation(api.adminInvitations.resendInvitation)
  const revokeInvitation = useMutation(api.adminInvitations.revokeInvitation)
  const invitationResponse = useQuery(api.adminInvitations.listInvitations, { limit: 100 }) as
    | { invitations?: Array<Record<string, unknown>> }
    | undefined

  // Dialog states
  const [inviteOpen, setInviteOpen] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<AdminUserRole>('team')
  const [inviteSending, setInviteSending] = useState(false)

  const users: AdminUserRecord[] = useMemo(() => {
    if (usersOverride) return usersOverride

    return (Array.isArray(usersPage) ? usersPage : []).map((row) => ({
      id: row.legacyId,
      email: row.email ?? '',
      name: row.name ?? '',
      role: normalizeAdminRole(row.role),
      status: normalizeAdminStatus(row.status),
      agencyId: row.agencyId ?? null,
      createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
      updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null,
      lastLoginAt: null,
    }))
  }, [usersOverride, usersPage])

  const loading = (user != null && workspaceContext === undefined) || isLoading
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
    const internal = users.filter((record) => record.role !== 'client').length
    const clients = users.filter((record) => record.role === 'client').length
    return { total, pending, active, internal, clients }
  }, [users])

  const invitationsLoading = invitationResponse === undefined

  const invitations: AdminInvitationRecord[] = useMemo(() => {
    const rows = Array.isArray(invitationResponse?.invitations) ? invitationResponse.invitations : []

    return rows
      .map((row) => {
        const invitation = row as {
          id?: string
          email?: string
          role?: AdminUserRole
          name?: string | null
          message?: string | null
          status?: InvitationLifecycleStatus
          effectiveStatus?: InvitationLifecycleStatus
          invitedBy?: string
          invitedByName?: string | null
          expiresAtMs?: number
          createdAtMs?: number
          acceptedAtMs?: number | null
        }

        const status = invitation.status ?? 'pending'
        const expiresAtMs = typeof invitation.expiresAtMs === 'number' ? invitation.expiresAtMs : 0
        const effectiveStatus =
          invitation.effectiveStatus ??
          status

        return {
          id: invitation.id ?? '',
          email: invitation.email ?? '',
          role: invitation.role ?? 'team',
          name: invitation.name ?? null,
          message: invitation.message ?? null,
          status,
          effectiveStatus,
          invitedBy: invitation.invitedBy ?? '',
          invitedByName: invitation.invitedByName ?? null,
          expiresAtMs,
          createdAtMs: typeof invitation.createdAtMs === 'number' ? invitation.createdAtMs : 0,
          acceptedAtMs: typeof invitation.acceptedAtMs === 'number' ? invitation.acceptedAtMs : null,
        }
      })
      .filter((invitation) => invitation.id.length > 0)
  }, [invitationResponse])

  const invitationSummary = useMemo(() => {
    return invitations.reduce<Record<InvitationLifecycleStatus, number>>(
      (acc, invitation) => {
        acc[invitation.effectiveStatus] += 1
        return acc
      },
      {
        pending: 0,
        accepted: 0,
        expired: 0,
        revoked: 0,
      }
    )
  }, [invitations])

  const filteredInvitations = useMemo(() => {
    const search = invitationSearchTerm.trim().toLowerCase()

    return invitations.filter((invitation) => {
      if (invitation.effectiveStatus !== invitationStatusFilter) {
        return false
      }

      if (search.length === 0) {
        return true
      }

      const haystack = `${invitation.email} ${invitation.name ?? ''}`.toLowerCase()
      return haystack.includes(search)
    })
  }, [invitations, invitationSearchTerm, invitationStatusFilter])

  const handleRoleChange = (record: AdminUserRecord, nextRole: AdminUserRole) => {
    if (record.role === nextRole) {
      return
    }

    if (!ROLE_ASSIGNABLE.includes(nextRole) && record.role !== nextRole) {
      // Only admin can assign admin role from team page
      toast({ title: 'Unsupported role', description: 'This page only manages team or client roles.', variant: 'destructive' })
      return
    }

    setSavingId(record.id)

    void updateUserRoleStatus({ legacyId: record.id, role: nextRole })
      .then(() => {
        setUsersOverride((prev) => {
          const base = prev ?? users
          return base.map((userRecord) => (userRecord.id === record.id ? { ...userRecord, role: nextRole } : userRecord))
        })
        toast({ title: 'Role updated', description: `${record.name} is now ${nextRole}.` })
      })
      .catch((err: unknown) => {
        const message = asErrorMessage(err)
        toast({ title: 'Admin error', description: message, variant: 'destructive' })
      })
      .finally(() => {
        setSavingId(null)
      })
  }

  const handleApprovalToggle = (record: AdminUserRecord, approved: boolean) => {
    if (record.role === 'admin' && !approved) {
      toast({ title: 'Cannot disable admin', description: 'Admin accounts must remain active.', variant: 'destructive' })
      return
    }

    const nextStatus: AdminUserStatus = approved ? 'active' : 'pending'
    if (record.status === nextStatus) {
      return
    }

    setSavingId(record.id)

    void updateUserRoleStatus({ legacyId: record.id, status: nextStatus })
      .then(() => {
        setUsersOverride((prev) => {
          const base = prev ?? users
          return base.map((userRecord) => (userRecord.id === record.id ? { ...userRecord, status: nextStatus } : userRecord))
        })
        toast({ title: approved ? 'Account approved' : 'Approval revoked', description: `${record.name} status set to ${nextStatus}.` })
        setRevokeOpen(false)
      })
      .catch((err: unknown) => {
        logError(err, 'AdminUsers:handleApprovalToggle')
        const message = asErrorMessage(err)
        toast({ title: 'Admin error', description: message, variant: 'destructive' })
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
          title: 'Invitation created',
          description: `Invitation created for ${inviteEmail} as ${inviteRole}. Email delivery depends on server integration settings.`,
        })
        setInviteOpen(false)
        setInviteEmail('')
        setInviteRole('team')
      })
      .catch((err: unknown) => {
        logError(err, 'AdminUsers:handleInviteUser')
        const message = asErrorMessage(err)
        toast({ title: 'Invitation error', description: message, variant: 'destructive' })
      })
      .finally(() => {
        setInviteSending(false)
      })
  }

  const handleResendInvitation = (invitation: AdminInvitationRecord) => {
    const actionKey = `resend:${invitation.id}`
    setInvitationActionKey(actionKey)

    void resendInvitation({ id: invitation.id })
      .then(() => {
        toast({
          title: 'Invitation resent',
          description: `A fresh invitation was created for ${invitation.email}. Email delivery depends on server integration settings.`,
        })
      })
      .catch((err: unknown) => {
        logError(err, 'AdminUsers:handleResendInvitation')
        const message = asErrorMessage(err)
        toast({ title: 'Resend failed', description: message, variant: 'destructive' })
      })
      .finally(() => {
        setInvitationActionKey((current) => (current === actionKey ? null : current))
      })
  }

  const handleRevokeInvitation = (invitation: AdminInvitationRecord) => {
    const actionKey = `revoke:${invitation.id}`
    setInvitationActionKey(actionKey)

    void revokeInvitation({ id: invitation.id })
      .then(() => {
        toast({
          title: 'Invitation revoked',
          description: `${invitation.email} can no longer use this invitation token.`,
        })
      })
      .catch((err: unknown) => {
        logError(err, 'AdminUsers:handleRevokeInvitation')
        const message = asErrorMessage(err)
        toast({ title: 'Revoke failed', description: message, variant: 'destructive' })
      })
      .finally(() => {
        setInvitationActionKey((current) => (current === actionKey ? null : current))
      })
  }

  const handleRefresh = () => {
    if (loading) return
    setStatusFilter('all')
    setRoleFilter('all')
    setSearchTerm('')
    setInvitationStatusFilter('pending')
    setInvitationSearchTerm('')
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
            <h1 className="text-3xl font-bold tracking-tight">Users & approvals</h1>
            <p className="text-muted-foreground">Approve new accounts and assign access. Use Team Management for internal staffing and Client Workspaces for client allocation.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/team">Team management</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/clients">Client workspaces</Link>
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              <CardTitle className="text-sm font-medium">Internal team</CardTitle>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.internal}</div>
              <p className="text-xs text-muted-foreground">Admins and internal team accounts</p>
            </CardContent>
          </Card>

          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Client access</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.clients}</div>
              <p className="text-xs text-muted-foreground">Accounts currently marked as client users</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-lg">Account directory</CardTitle>
              <CardDescription>Filter by status or role, approve users, and assign access. Internal staffing and client ownership are managed on the Team and Client pages.</CardDescription>
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
                   onClick={() => {
                     if (loadingMore) return
                     setLoadingMore(true)

                      void Promise.resolve()
                        .then(() => loadMore(50))
                        .catch((err: unknown) => {
                          logError(err, 'AdminUsers:loadMore')
                        })
                        .finally(() => {
                          setLoadingMore(false)
                        })
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

        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-lg">Invitation lifecycle</CardTitle>
              <CardDescription>
                Track pending, accepted, expired, and revoked invitations. Resend expired invites or revoke outstanding ones.
              </CardDescription>
            </div>
            <Input
              value={invitationSearchTerm}
              onChange={(event) => setInvitationSearchTerm(event.target.value)}
              placeholder="Search invitations by name or email"
              className="lg:w-72"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              value={invitationStatusFilter}
              onValueChange={(value) => setInvitationStatusFilter(value as InvitationLifecycleStatus)}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                {INVITATION_STATUSES.map((status) => (
                  <TabsTrigger key={status} value={status} className="capitalize">
                    {invitationStatusLabel(status)} ({invitationSummary[status]})
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed text-left text-sm">
                <thead>
                  <tr className="border-b border-muted/40">
                    <th className="w-64 py-2 pr-3 font-medium">Invitee</th>
                    <th className="w-28 py-2 pr-3 font-medium">Role</th>
                    <th className="w-28 py-2 pr-3 font-medium">Status</th>
                    <th className="w-36 py-2 pr-3 font-medium">Sent</th>
                    <th className="w-36 py-2 pr-3 font-medium">Expires</th>
                    <th className="w-44 py-2 pr-3 font-medium">Invited by</th>
                    <th className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvitations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        {invitationsLoading
                          ? 'Loading invitation lifecycle…'
                          : 'No invitations match this lifecycle status and search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredInvitations.map((invitation) => {
                      const resendKey = `resend:${invitation.id}`
                      const revokeKey = `revoke:${invitation.id}`
                      const isResending = invitationActionKey === resendKey
                      const isRevoking = invitationActionKey === revokeKey
                      const canRevoke = invitation.effectiveStatus === 'pending'
                      const canResend = invitation.effectiveStatus === 'expired' || invitation.effectiveStatus === 'revoked'

                      return (
                        <tr key={invitation.id} className="border-b border-muted/30">
                          <td className="py-3 pr-3 align-top">
                            <div className="font-medium text-foreground">{invitation.name || invitation.email}</div>
                            <div className="text-xs text-muted-foreground">{invitation.email}</div>
                          </td>
                          <td className="py-3 pr-3 align-middle">
                            <Badge variant="outline" className="capitalize">
                              {invitation.role}
                            </Badge>
                          </td>
                          <td className="py-3 pr-3 align-middle">
                            <Badge variant={invitationStatusToVariant(invitation.effectiveStatus)} className="capitalize">
                              {invitationStatusLabel(invitation.effectiveStatus)}
                            </Badge>
                          </td>
                          <td className="py-3 pr-3 align-middle text-xs text-muted-foreground">
                            {formatDateMs(invitation.createdAtMs)}
                          </td>
                          <td className="py-3 pr-3 align-middle text-xs text-muted-foreground">
                            {formatDateMs(invitation.expiresAtMs)}
                          </td>
                          <td className="py-3 pr-3 align-middle text-xs text-muted-foreground">
                            {invitation.invitedByName || invitation.invitedBy}
                          </td>
                          <td className="py-3 text-right align-middle">
                            <div className="flex justify-end gap-2">
                              {canResend ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResendInvitation(invitation)}
                                  disabled={isResending || isRevoking}
                                >
                                  {isResending ? 'Resending…' : 'Resend'}
                                </Button>
                              ) : null}
                              {canRevoke ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRevokeInvitation(invitation)}
                                  disabled={isResending || isRevoking}
                                >
                                  {isRevoking ? 'Revoking…' : 'Revoke'}
                                </Button>
                              ) : null}
                              {!canResend && !canRevoke ? (
                                <span className="text-xs text-muted-foreground">No actions</span>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
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
      return 'destructive' as const
  }
}

function invitationStatusLabel(status: InvitationLifecycleStatus): string {
  return status.replace('_', ' ')
}

function invitationStatusToVariant(status: InvitationLifecycleStatus) {
  switch (status) {
    case 'accepted':
      return 'default' as const
    case 'pending':
      return 'secondary' as const
    case 'expired':
    case 'revoked':
      return 'destructive' as const
  }
}

function formatDateMs(value: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—'
  }
  return formatDate(new Date(value).toISOString())
}

function formatDate(value: string | null): string {
  return formatDateLib(value, DATE_FORMATS.WITH_TIME, undefined, '—')
}
