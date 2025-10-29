'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react'

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
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

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

export default function AdminPage() {
  const { user, getIdToken } = useAuth()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const { toast } = useToast()

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
