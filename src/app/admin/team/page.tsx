'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserMinus,
  Users as UsersIcon,
} from 'lucide-react'

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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface AdminUserRecord {
  id: string
  name: string
  email: string
  role: 'admin' | 'team' | 'client'
  status: UserStatus
  agencyId: string | null
  createdAt: string | null
  updatedAt?: string | null
  lastLoginAt: string | null
}

type UserStatus = 'active' | 'invited' | 'pending' | 'disabled' | 'suspended'

type StatusFilter = 'all' | UserStatus

type RoleFilter = 'all' | AdminUserRecord['role']

const ROLE_OPTIONS: AdminUserRecord['role'][] = ['admin', 'team', 'client']
const STATUS_OPTIONS: StatusFilter[] = ['all', 'active', 'invited', 'pending', 'disabled', 'suspended']

export default function AdminTeamPage() {
  const { user, getIdToken } = useAuth()
  const [users, setUsers] = useState<AdminUserRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const { toast } = useToast()

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
          const message = typeof payload?.error === 'string' ? payload.error : 'Failed to load team members'
          throw new Error(message)
        }

        setUsers((prev) => (append ? [...prev, ...payload.users!] : payload.users!))
        setNextCursor(payload.nextCursor ?? null)
      } catch (err: unknown) {
        const message = extractErrorMessage(err, 'Unable to fetch team members')
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
    [user?.id, getIdToken, toast]
  )

  useEffect(() => {
    if (!user?.id) return
    setUsers([])
    setNextCursor(null)
    void fetchUsers()
  }, [user?.id, fetchUsers])

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
      const token = await getIdToken()
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: userId, role }),
      })

      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to update team member role'
        throw new Error(message)
      }

      setUsers((prev) => prev.map((record) => (record.id === userId ? { ...record, role } : record)))
      toast({ title: 'Role updated', description: `Role changed to ${role}.` })
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Unable to update role')
      setError(message)
      toast({ title: 'Admin error', description: message, variant: 'destructive' })
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
      const token = await getIdToken()
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: userRecord.id, status: nextStatus }),
      })

      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to update team member status'
        throw new Error(message)
      }

      setUsers((prev) => prev.map((record) => (record.id === userRecord.id ? { ...record, status: nextStatus } : record)))
      toast({
        title: 'Status updated',
        description: `Member status set to ${nextStatus.replace('_', ' ')}.`,
      })
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Unable to update status')
      setError(message)
      toast({ title: 'Admin error', description: message, variant: 'destructive' })
    } finally {
      setSavingId(null)
    }
  }

  const handleRefresh = () => {
    if (loading) return
    setStatusFilter('all')
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
              <Link href="/admin/leads">Contact leads</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/clients">Client workspaces</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">Back to admin home</Link>
            </Button>
            <Button type="button" variant="outline" onClick={handleRefresh} disabled={loading} className="inline-flex items-center gap-2">
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
            </Button>
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
                              <Loader2 className="h-4 w-4 animate-spin" />
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

            {nextCursor && (
              <div className="mt-6 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchUsers({ cursor: nextCursor, append: true })}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2"
                >
                  {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
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

function ActionIcon({ status }: { status: UserStatus }) {
  if (status === 'active') {
    return <UserMinus className="h-4 w-4" />
  }
  if (status === 'disabled' || status === 'suspended') {
    return <UserCheck className="h-4 w-4" />
  }
  return <AlertCircle className="h-4 w-4" />
}
