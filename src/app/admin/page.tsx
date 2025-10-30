'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, ShieldAlert, CheckCircle2, Plus, Trash2, Users as UsersIcon } from 'lucide-react'

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import type { ClientRecord, ClientTeamMember } from '@/types/clients'

interface ContactMessage {
  id: string
  name: string
  email: string
  company: string | null
  message: string
  status: 'new' | 'in_progress' | 'resolved'
  createdAt: string | null
}

const STATUS_OPTIONS: ContactMessage['status'][] = ['new', 'in_progress', 'resolved']

type TeamMemberField = ClientTeamMember & { key: string }

function createEmptyMemberField(): TeamMemberField {
  return {
    key: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    name: '',
    role: '',
  }
}

export default function AdminPage() {
  const { user, getIdToken } = useAuth()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [clientsLoading, setClientsLoading] = useState(false)
  const [clientsError, setClientsError] = useState<string | null>(null)
  const [clientSaving, setClientSaving] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientAccountManager, setClientAccountManager] = useState('')
  const [teamMemberFields, setTeamMemberFields] = useState<TeamMemberField[]>([createEmptyMemberField()])
  const { toast } = useToast()

  const loadClients = useCallback(async () => {
    if (!user?.id) {
      setClients([])
      return
    }

    setClientsLoading(true)
    setClientsError(null)

    try {
      const token = await getIdToken()
      const response = await fetch('/api/clients', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Failed to load clients')
      }

      const payload = (await response.json()) as { clients?: ClientRecord[] }
      const list = Array.isArray(payload.clients) ? payload.clients : []
      const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name))
      setClients(sorted)
    } catch (clientError: unknown) {
      const message = extractErrorMessage(clientError, 'Unable to load clients')
      setClientsError(message)
      toast({ title: 'Client load failed', description: message, variant: 'destructive' })
    } finally {
      setClientsLoading(false)
    }
  }, [getIdToken, toast, user?.id])

  const resetClientForm = () => {
    setClientName('')
    setClientAccountManager('')
    setTeamMemberFields([createEmptyMemberField()])
  }

  const addTeamMemberField = () => {
    setTeamMemberFields((prev) => [...prev, createEmptyMemberField()])
  }

  const updateTeamMemberField = (key: string, field: keyof ClientTeamMember, value: string) => {
    setTeamMemberFields((prev) => prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)))
  }

  const removeTeamMemberField = (key: string) => {
    setTeamMemberFields((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.key !== key)))
  }

  const handleCreateClient = async () => {
    const name = clientName.trim()
    const accountManager = clientAccountManager.trim()

    if (!name || !accountManager) {
      toast({ title: 'Missing details', description: 'Client name and account manager are required.', variant: 'destructive' })
      return
    }

    const teamMembers = teamMemberFields
      .map((member) => ({
        name: member.name.trim(),
        role: member.role.trim(),
      }))
      .filter((member) => member.name.length > 0)
      .map((member) => ({ ...member, role: member.role || 'Contributor' }))

    setClientSaving(true)

    try {
      const token = await getIdToken()
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, accountManager, teamMembers }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Failed to create client')
      }

      const payload = (await response.json()) as { client: ClientRecord }
      const created = payload.client
      setClients((prev) => {
        const next = [...prev, created]
        return next.sort((a, b) => a.name.localeCompare(b.name))
      })
      toast({ title: 'Client created', description: `${created.name} is ready to use.` })
      resetClientForm()
    } catch (clientError: unknown) {
      const message = extractErrorMessage(clientError, 'Unable to create client')
      toast({ title: 'Client create failed', description: message, variant: 'destructive' })
    } finally {
      setClientSaving(false)
    }
  }

  const fetchMessages = async ({ cursor, append = false }: { cursor?: string | null; append?: boolean } = {}) => {
    if (!user?.id) return
    if (append && !cursor) return

    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
      setError(null)
    }

    try {
      const token = await getIdToken()
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      if (cursor) params.set('cursor', cursor)
      params.set('pageSize', '20')
      const queryString = params.toString()
      const url = queryString ? `/api/admin/contact-messages?${queryString}` : '/api/admin/contact-messages'
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to load contact messages')
      }

      const payload = await response.json()
      setMessages((prev) => (append ? [...prev, ...payload.messages] : payload.messages))
      setNextCursor(payload.nextCursor ?? null)
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Unable to load admin data')
      setError(message)
      toast({ title: 'Admin error', description: message, variant: 'destructive' })
    } finally {
      if (append) {
        setIsLoadingMore(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!user?.id) return
    setMessages([])
    setNextCursor(null)
    void fetchMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, statusFilter])

  useEffect(() => {
    if (!user?.id) {
      setClients([])
      return
    }

    void loadClients()
  }, [loadClients, user?.id])

  const summary = useMemo(() => {
    const totals = {
      total: messages.length,
      new: messages.filter((msg) => msg.status === 'new').length,
      in_progress: messages.filter((msg) => msg.status === 'in_progress').length,
      resolved: messages.filter((msg) => msg.status === 'resolved').length,
    }
    return totals
  }, [messages])

  const handleStatusUpdate = async (id: string, nextStatus: ContactMessage['status']) => {
    try {
      setSavingId(id)
      const token = await getIdToken()
      const response = await fetch('/api/admin/contact-messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: nextStatus }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to update message')
      }

      setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, status: nextStatus } : msg)))
      toast({
        title: 'Status updated',
        description: `Marked message as ${nextStatus.replace('_', ' ')}`,
      })
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Unable to update message')
      setError(message)
      toast({ title: 'Admin error', description: message, variant: 'destructive' })
    } finally {
      setSavingId(null)
    }
  }

  const handleRefresh = () => {
    setStatusFilter('all')
    setMessages([])
    setNextCursor(null)
    void fetchMessages()
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16">
        <Card className="max-w-md border-muted/60">
          <CardHeader>
            <CardTitle className="text-lg">Sign in required</CardTitle>
            <CardDescription>Log in to an admin account to manage contact messages.</CardDescription>
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
            <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
            <p className="text-muted-foreground">Review inbound contact requests and keep your follow-ups organized.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              Refresh
            </Button>
            <Button asChild>
              <Link href="/admin/users">Manage users</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total inquiries</CardTitle>
              <Loader2 className={cn('h-4 w-4 text-muted-foreground', isLoading && 'animate-spin')} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">Past 200 messages</p>
            </CardContent>
          </Card>

          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Awaiting response</CardTitle>
              <ShieldAlert className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.new}</div>
              <p className="text-xs text-muted-foreground">New submissions</p>
            </CardContent>
          </Card>

          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.resolved}</div>
              <p className="text-xs text-muted-foreground">Closed conversations</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Client workspaces</CardTitle>
              <CardDescription>Create new clients and assign their delivery team.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => void loadClients()} disabled={clientsLoading}>
              {clientsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refreshing
                </>
              ) : (
                'Refresh list'
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                void handleCreateClient()
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-client-name">Client name</Label>
                  <Input
                    id="admin-client-name"
                    placeholder="e.g. Horizon Ventures"
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-client-owner">Account manager</Label>
                  <Input
                    id="admin-client-owner"
                    placeholder="Primary owner"
                    value={clientAccountManager}
                    onChange={(event) => setClientAccountManager(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label className="text-sm font-medium">Team members</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addTeamMemberField} disabled={clientSaving}>
                    <Plus className="mr-2 h-4 w-4" /> Add teammate
                  </Button>
                </div>
                <div className="space-y-2">
                  {teamMemberFields.map((member, index) => (
                    <div key={member.key} className="flex flex-col gap-2 rounded-md border border-muted/60 bg-muted/10 p-3 sm:flex-row sm:items-center">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`team-member-name-${member.key}`} className="text-xs uppercase tracking-wide text-muted-foreground">
                          Name
                        </Label>
                        <Input
                          id={`team-member-name-${member.key}`}
                          placeholder={index === 0 ? 'Alex Chen' : 'Teammate name'}
                          value={member.name}
                          onChange={(event) => updateTeamMemberField(member.key, 'name', event.target.value)}
                          disabled={clientSaving}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`team-member-role-${member.key}`} className="text-xs uppercase tracking-wide text-muted-foreground">
                          Role
                        </Label>
                        <Input
                          id={`team-member-role-${member.key}`}
                          placeholder={index === 0 ? 'Paid Media Lead' : 'Role (optional)'}
                          value={member.role}
                          onChange={(event) => updateTeamMemberField(member.key, 'role', event.target.value)}
                          disabled={clientSaving}
                        />
                      </div>
                      <div className="flex items-center justify-end pt-2 sm:pt-6">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeTeamMemberField(member.key)}
                          disabled={teamMemberFields.length <= 1 || clientSaving}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove team member</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Include anyone collaborating with this client. Account managers are automatically added if missing.</p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={clientSaving}>
                  {clientSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create client
                </Button>
              </div>
            </form>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <UsersIcon className="h-4 w-4" />
                <span>Existing client workspaces</span>
                <Badge variant="secondary">{clients.length}</Badge>
              </div>
              {clientsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading clients…
                </div>
              ) : clientsError ? (
                <p className="text-sm text-destructive">{clientsError}</p>
              ) : clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No clients yet. Add a workspace to get started.</p>
              ) : (
                <div className="space-y-3">
                  {clients.map((client) => (
                    <div key={client.id} className="rounded-md border border-muted/60 bg-muted/10 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{client.name}</p>
                          <p className="text-xs text-muted-foreground">Managed by {client.accountManager}</p>
                        </div>
                        <Badge variant="outline">Team {client.teamMembers.length}</Badge>
                      </div>
                      {client.teamMembers.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {client.teamMembers.map((member) => (
                            <span
                              key={`${client.id}-${member.name}-${member.role}`}
                              className="rounded-full border border-muted/60 bg-background px-3 py-1 text-xs text-muted-foreground"
                            >
                              <span className="font-medium text-foreground">{member.name}</span>
                              {member.role && <span className="ml-2 text-muted-foreground">{member.role}</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle className="text-lg">Contact messages</CardTitle>
            <CardDescription>Set statuses as you triage responses and follow-ups.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed text-left text-sm">
                <thead>
                  <tr className="border-b border-muted/40">
                    <th className="w-40 py-2 pr-2 font-medium">Received</th>
                    <th className="w-48 py-2 pr-2 font-medium">Sender</th>
                    <th className="w-40 py-2 pr-2 font-medium">Status</th>
                    <th className="py-2 pr-2 font-medium">Message</th>
                    <th className="w-32 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length === 0 && !isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        {error
                          ? `Unable to load contact messages: ${error}`
                          : statusFilter !== 'all'
                          ? 'No messages match this status.'
                          : 'No contact messages yet.'}
                      </td>
                    </tr>
                  ) : (
                    messages.map((msg) => (
                      <tr key={msg.id} className="border-b border-muted/30 align-top">
                        <td className="py-3 pr-2 text-xs text-muted-foreground">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : '—'}
                        </td>
                        <td className="py-3 pr-2">
                          <div className="font-medium text-foreground">{msg.name}</div>
                          <div className="text-xs text-muted-foreground">{msg.email}</div>
                          {msg.company && <div className="text-xs text-muted-foreground">{msg.company}</div>}
                        </td>
                        <td className="py-3 pr-2">
                          <Badge
                            variant={
                              msg.status === 'resolved' ? 'default' : msg.status === 'in_progress' ? 'secondary' : 'outline'
                            }
                            className="capitalize"
                          >
                            {msg.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 pr-2 text-sm leading-relaxed text-muted-foreground">
                          {msg.message}
                        </td>
                        <td className="py-3 text-right">
                          <Select
                            value={msg.status}
                            onValueChange={(value) => handleStatusUpdate(msg.id, value as ContactMessage['status'])}
                            disabled={savingId === msg.id}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.replace('_', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {isLoading && (
              <div className="mt-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && nextCursor && (
              <div className="mt-6 flex justify-center">
                <Button variant="outline" onClick={() => fetchMessages({ cursor: nextCursor, append: true })} disabled={isLoadingMore}>
                  {isLoadingMore ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
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
