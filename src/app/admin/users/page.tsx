'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, RefreshCw, ShieldCheck, UserCheck, Users as UsersIcon } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
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
import { useToast } from '@/components/ui/use-toast'
import { ADMIN_USER_ROLES, ADMIN_USER_STATUSES, type AdminUserRecord, type AdminUserRole, type AdminUserStatus } from '@/types/admin'
import { cn } from '@/lib/utils'

type StatusFilter = 'all' | AdminUserStatus
type RoleFilter = 'all' | AdminUserRole

const ROLE_ASSIGNABLE: AdminUserRole[] = ['team', 'client']

const STATUS_OPTIONS: StatusFilter[] = ['all', ...ADMIN_USER_STATUSES]

export default function AdminUsersPage() {
  const { user, getIdToken } = useAuth()
  const { toast } = useToast()

  const [users, setUsers] = useState<AdminUserRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  const fetchUsers = useCallback(
    async ({ cursor, append = false }: { cursor?: string | null; append?: boolean } = {}) => {
      if (!user?.id) return
      if (append && !cursor) return

      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setError(null)
      }

      try {
        const token = await getIdToken()
        const params = new URLSearchParams()
        params.set('pageSize', '50')
        if (cursor) {
          params.set('cursor', cursor)
        }

        const response = await fetch(`/api/admin/users?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        const payload = (await response.json().catch(() => null)) as
          | { users?: AdminUserRecord[]; nextCursor?: string | null; error?: string }
          | null

        if (!response.ok || !payload || !Array.isArray(payload.users)) {
          const message = typeof payload?.error === 'string' ? payload.error : 'Failed to load users'
          throw new Error(message)
        }

        setUsers((prev) => (append ? [...prev, ...payload.users!] : payload.users!))
        setNextCursor(payload.nextCursor ?? null)
      } catch (err: unknown) {
        const message = extractErrorMessage(err, 'Unable to load users')
        setError(message)
        toast({ title: 'Admin error', description: message, variant: 'destructive' })
      } finally {
        if (append) {
          setLoadingMore(false)
        } else {
          setLoading(false)
        }
      }
    },
    [getIdToken, toast, user?.id]
  )

  useEffect(() => {
    if (!user?.id) {
      setUsers([])
      return
    }
    setUsers([])
    setNextCursor(null)
    void fetchUsers()
  }, [fetchUsers, user?.id])

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
      const token = await getIdToken()
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: record.id, role: nextRole }),
      })

      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to update role'
        throw new Error(message)
      }

      setUsers((prev) => prev.map((userRecord) => (userRecord.id === record.id ? { ...userRecord, role: nextRole } : userRecord)))
      toast({ title: 'Role updated', description: `${record.name} is now ${nextRole}.` })
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Unable to update role')
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
      const token = await getIdToken()
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: record.id, status: nextStatus }),
      })

      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to update status'
        throw new Error(message)
      }

      setUsers((prev) => prev.map((userRecord) => (userRecord.id === record.id ? { ...userRecord, status: nextStatus } : userRecord)))
      toast({ title: approved ? 'Account approved' : 'Approval revoked', description: `${record.name} status set to ${nextStatus}.` })
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Unable to update status')
      toast({ title: 'Admin error', description: message, variant: 'destructive' })
    } finally {
      setSavingId(null)
    }
  }

  const handleRefresh = () => {
    if (loading) return
    setStatusFilter('pending')
    setRoleFilter('all')
    setSearchTerm('')
    setNextCursor(null)
    void fetchUsers()
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
              <AlertCircle className="h-4 w-4 text-amber-500" />
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
                              onChange={(event) => handleApprovalToggle(record, event.target.checked)}
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
                            <Button
                              type="button"
                              size="sm"
                              variant={record.status === 'active' ? 'destructive' : 'outline'}
                              onClick={() => handleApprovalToggle(record, record.status !== 'active')}
                              disabled={savingId === record.id || record.role === 'admin'}
                              className="inline-flex items-center gap-2"
                            >
                              {savingId === record.id ? <UserCheck className="h-4 w-4 animate-pulse" /> : <UserCheck className="h-4 w-4" />}
                              {record.status === 'active' ? 'Revoke access' : 'Approve user'}
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {nextCursor && (
              <div className="mt-6 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchUsers({ cursor: nextCursor, append: true })}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2"
                >
                  {loadingMore ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  {loadingMore ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return date.toLocaleString()
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }
  return fallback
}
