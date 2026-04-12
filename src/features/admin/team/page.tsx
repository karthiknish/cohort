'use client'

import { useCallback, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
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

import { api } from '/_generated/api'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { useToast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { DATE_FORMATS, formatDate as formatDateLib } from '@/lib/dates'
import { getPreviewAdminClients, getPreviewAdminUsers } from '@/lib/preview-data'
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
  const { isPreviewMode } = usePreview()
  const [usersOverride, setUsersOverride] = useState<AdminUserRecord[] | null>(null)
  const [previewUsers, setPreviewUsers] = useState<AdminUserRecord[]>(() => getPreviewAdminUsers())
  const [loadingMore, setLoadingMore] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const workspaceContext = useQuery(api.users.getMyWorkspaceContext, !isPreviewMode && user ? {} : 'skip')
  const workspaceId = workspaceContext?.workspaceId ?? null
  const includeAllWorkspaces = workspaceContext?.role === 'admin'
  const { toast } = useToast()

  const { results: usersPage, status, loadMore, isLoading } = usePaginatedQuery(
    api.adminUsers.listUsers,
    !isPreviewMode && workspaceId
      ? {
          workspaceId,
          includeAllWorkspaces,
        }
      : 'skip',
    { initialNumItems: 50 }
  )

  const updateUserRoleStatus = useMutation(api.adminUsers.updateUserRoleStatus)
  const createInvitation = useMutation(api.adminInvitations.createInvitation)
  const clientsData = useQuery(
    api.clients.list,
    !isPreviewMode && workspaceId
      ? {
          workspaceId,
          limit: 200,
          cursor: null,
          includeAllWorkspaces,
        }
      : 'skip'
  )

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<AdminUserRole>('team')
  const [inviteSending, setInviteSending] = useState(false)

  const handleInviteEmailChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setInviteEmail(event.target.value)
  }, [])

  const handleInviteRoleChange = useCallback((value: string) => {
    setInviteRole(value as AdminUserRole)
  }, [])

  const handleCloseInviteDialog = useCallback(() => {
    setInviteOpen(false)
  }, [])

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }, [])

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value as StatusFilter)
  }, [])

  const handleRoleFilterChange = useCallback((value: string) => {
    setRoleFilter(value as RoleFilter)
  }, [])

  const createRoleChangeHandler = (userId: string) => (value: string) => {
    handleRoleChange(userId, value as AdminUserRecord['role'])
  }

  const createAdminToggleHandler = (record: AdminUserRecord) => (event: ChangeEvent<HTMLInputElement>) => {
    handleAdminToggle(record, event.target.checked)
  }

  const createStatusActionHandler = (record: AdminUserRecord) => () => {
    handleStatusAction(record)
  }

  const handleLoadMore = useCallback(() => {
    if (isPreviewMode) return
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
  }, [isPreviewMode, loadMore, loadingMore])

  const users: AdminUserRecord[] = useMemo(() => {
    if (isPreviewMode) return previewUsers
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
  }, [isPreviewMode, previewUsers, usersOverride, usersPage])

  const loading = isPreviewMode ? false : (user != null && workspaceContext === undefined) || isLoading
  const clientItems = isPreviewMode
    ? getPreviewAdminClients().map((client) => ({
        legacyId: client.id,
        name: client.name,
        accountManager: client.accountManager,
        teamMembers: client.teamMembers,
      }))
    : clientsData?.items

  const internalUsers = useMemo(() => users.filter((candidate) => candidate.role !== 'client'), [users])

  const allocationSummary = useMemo(() => {
    const clientRows = Array.isArray(clientItems) ? clientItems : []

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
  }, [clientItems, internalUsers])

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
    if (isPreviewMode) {
      setPreviewUsers((current) => current.map((record) => (
        record.id === userId ? { ...record, role, updatedAt: new Date().toISOString() } : record
      )))
      toast({ title: 'Preview mode', description: `Member role updated to ${role} in the sample workspace.` })
      return
    }

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
    const nextStatus = deriveNextStatus(userRecord.status)

    if (isPreviewMode) {
      setPreviewUsers((current) => current.map((record) => (
        record.id === userRecord.id ? { ...record, status: nextStatus, updatedAt: new Date().toISOString() } : record
      )))
      toast({
        title: 'Preview mode',
        description: `Member is now ${nextStatus.replace('_', ' ')} in the sample workspace.`,
      })
      return
    }

    setSavingId(userRecord.id)
    setError(null)

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

  const handleInviteUser = useCallback(() => {
    if (!inviteEmail) return

    if (isPreviewMode) {
      setPreviewUsers((current) => [
        {
          id: `preview-user-${Date.now()}`,
          email: inviteEmail,
          name: inviteEmail.split('@')[0] ?? 'Preview User',
          role: inviteRole,
          status: 'invited',
          agencyId: 'preview-agency',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: null,
        },
        ...current,
      ])
      toast({
        title: 'Preview mode',
        description: `Invitation created for ${inviteEmail} in the sample workspace.`,
      })
      setInviteOpen(false)
      setInviteEmail('')
      setInviteRole('team')
      return
    }

    if (!user?.id) return

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
  }, [createInvitation, inviteEmail, inviteRole, isPreviewMode, toast, user])

  const handleRefresh = useCallback(() => {
    if (loading) return
    setStatusFilter('all')
    setRoleFilter('all')
    setSearchTerm('')
    setUsersOverride(null)

    if (isPreviewMode) {
      setPreviewUsers(getPreviewAdminUsers())
    }
  }, [isPreviewMode, loading])

  if (!user && !isPreviewMode) {
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
            <p className="text-muted-foreground">
              Manage internal staff, their roles, and how they are allocated across client workspaces.
              {isPreviewMode ? ' Preview mode keeps staffing changes local to this session.' : ''}
            </p>
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
                      onChange={handleInviteEmailChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={handleInviteRoleChange}>
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
                  <Button variant="outline" onClick={handleCloseInviteDialog} disabled={inviteSending}>Cancel</Button>
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
              <UserCheck className="h-4 w-4 text-success" />
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
                onChange={handleSearchChange}
                className="lg:w-64"
              />
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
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
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
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
            <div className="overflow-x-auto rounded-md border border-muted/40">
              <table className="min-w-full table-fixed text-left text-sm">
                <caption className="sr-only">Team members, roles, and client allocation</caption>
                <thead>
                  <tr className="border-b border-muted/40">
                    <th scope="col" className="w-64 py-2 pr-3 font-medium">Team member</th>
                    <th scope="col" className="w-32 py-2 pr-3 font-medium">Role</th>
                    <th scope="col" className="w-24 py-2 pr-3 text-center font-medium">Admin</th>
                    <th scope="col" className="w-32 py-2 pr-3 font-medium">Status</th>
                    <th scope="col" className="w-40 py-2 pr-3 font-medium">Joined</th>
                    <th scope="col" className="w-40 py-2 pr-3 font-medium">Client allocation</th>
                    <th scope="col" className="w-40 py-2 pr-3 font-medium">Last active</th>
                    <th scope="col" className="py-2 text-right font-medium">Actions</th>
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
                          <th scope="row" className="py-3 pr-3 text-left font-normal">
                            <div className="font-medium text-foreground">{record.name}</div>
                            <div className="text-xs text-muted-foreground">{record.email || 'No email on file'}</div>
                            {record.agencyId && (
                              <div className="text-xs text-muted-foreground">Agency: {record.agencyId}</div>
                            )}
                          </th>
                          <td className="py-3 pr-3 align-middle">
                            <Select
                              value={record.role}
                              onValueChange={createRoleChangeHandler(record.id)}
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
                              onChange={createAdminToggleHandler(record)}
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
                              onClick={createStatusActionHandler(record)}
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
                   onClick={handleLoadMore}

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
