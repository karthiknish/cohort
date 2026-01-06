'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CircleAlert,
  ArrowUpDown,
  CircleCheck,
  Clock,
  ExternalLink,
  Filter,
  Inbox,
  LoaderCircle,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  User,
  Users,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

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

const STATUS_CONFIG = {
  new: {
    label: 'New',
    color: 'bg-blue-100 text-blue-700',
    icon: Inbox,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-amber-100 text-amber-700',
    icon: Clock,
  },
  resolved: {
    label: 'Resolved',
    color: 'bg-emerald-100 text-emerald-700',
    icon: CircleCheck,
  },
}

type StatusFilter = 'all' | ContactMessage['status']

export default function AdminLeadsPage() {
  const { user, getIdToken } = useAuth()
  const { toast } = useToast()

  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<ContactMessage | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const fetchMessages = useCallback(
    async ({ cursor, append = false }: { cursor?: string | null; append?: boolean } = {}) => {
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
        if (statusFilter !== 'all') {
          params.set('status', statusFilter)
        }
        if (cursor) {
          params.set('cursor', cursor)
        }
        params.set('pageSize', '50')

        const query = params.toString()
        const url = query ? `/api/admin/contact-messages?${query}` : '/api/admin/contact-messages'
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        const payload = (await response.json().catch(() => null)) as
          | { messages?: ContactMessage[]; nextCursor?: string | null; error?: string }
          | null

        if (!response.ok || !payload || !Array.isArray(payload.messages)) {
          const message = typeof payload?.error === 'string' ? payload.error : 'Failed to load contact leads'
          throw new Error(message)
        }

        setMessages((prev) => (append ? [...prev, ...payload.messages!] : payload.messages!))
        setNextCursor(payload.nextCursor ?? null)
      } catch (err: unknown) {
        const message = extractErrorMessage(err, 'Unable to fetch leads')
        setError(message)
        toast({ title: 'Error', description: message, variant: 'destructive' })
      } finally {
        if (append) {
          setIsLoadingMore(false)
        } else {
          setIsLoading(false)
        }
      }
    },
    [user?.id, getIdToken, statusFilter, toast]
  )

  useEffect(() => {
    if (!user?.id) return
    setMessages([])
    setNextCursor(null)
    void fetchMessages()
  }, [user?.id, statusFilter, fetchMessages])

  const summary = useMemo(() => {
    return {
      total: messages.length,
      new: messages.filter((msg) => msg.status === 'new').length,
      in_progress: messages.filter((msg) => msg.status === 'in_progress').length,
      resolved: messages.filter((msg) => msg.status === 'resolved').length,
    }
  }, [messages])

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages
    const query = searchQuery.toLowerCase()
    return messages.filter(
      (msg) =>
        msg.name.toLowerCase().includes(query) ||
        msg.email.toLowerCase().includes(query) ||
        msg.company?.toLowerCase().includes(query) ||
        msg.message.toLowerCase().includes(query)
    )
  }, [messages, searchQuery])

  const handleStatusUpdate = async (id: string, nextStatus: ContactMessage['status']) => {
    setSavingId(id)
    setError(null)

    try {
      const token = await getIdToken()
      const response = await fetch('/api/admin/contact-messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: nextStatus }),
      })

      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to update lead'
        throw new Error(message)
      }

      setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, status: nextStatus } : msg)))
      toast({
        title: 'Status updated',
        description: `Lead marked as ${nextStatus.replace('_', ' ')}.`
      })

      // Update selected lead if it's the one being modified
      if (selectedLead?.id === id) {
        setSelectedLead((prev) => prev ? { ...prev, status: nextStatus } : null)
      }
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Unable to update lead')
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setSavingId(null)
    }
  }

  const handleRefresh = () => {
    setSearchQuery('')
    setMessages([])
    setNextCursor(null)
    void fetchMessages()
  }

  const openLeadDetail = (lead: ContactMessage) => {
    setSelectedLead(lead)
    setIsDetailOpen(true)
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ShieldAlert className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Access Required</CardTitle>
            <CardDescription>Sign in with an admin account to manage leads.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead Pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage inbound inquiries and track follow-up progress.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => setStatusFilter('all')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{summary.total}</p>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            statusFilter === 'new' && 'ring-2 ring-blue-500'
          )}
          onClick={() => setStatusFilter(statusFilter === 'new' ? 'all' : 'new')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New</p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-blue-600">{summary.new}</p>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Inbox className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            statusFilter === 'in_progress' && 'ring-2 ring-amber-500'
          )}
          onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-amber-600">{summary.in_progress}</p>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            statusFilter === 'resolved' && 'ring-2 ring-emerald-500'
          )}
          onClick={() => setStatusFilter(statusFilter === 'resolved' ? 'all' : 'resolved')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-emerald-600">{summary.resolved}</p>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CircleCheck className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      <span className="flex items-center gap-2">
                        {status === 'new' && <Inbox className="h-3 w-3" />}
                        {status === 'in_progress' && <Clock className="h-3 w-3" />}
                        {status === 'resolved' && <CircleCheck className="h-3 w-3" />}
                        {STATUS_CONFIG[status].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading && messages.length === 0 ? (
            <div className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Inbox className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-foreground">No leads found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : statusFilter !== 'all'
                    ? 'No leads with this status'
                    : 'New leads will appear here'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {filteredMessages.map((lead) => {
                  const config = STATUS_CONFIG[lead.status]
                  const StatusIcon = config.icon
                  return (
                    <div
                      key={lead.id}
                      className="group flex items-start gap-4 p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <button
                              onClick={() => openLeadDetail(lead)}
                              className="font-medium text-foreground hover:underline"
                            >
                              {lead.name}
                            </button>
                            {lead.company && (
                              <span className="ml-2 text-sm text-muted-foreground">
                                at {lead.company}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={cn('text-xs', config.color)}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{lead.email}</p>
                        <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{lead.message}</p>
                        <div className="mt-2 flex items-center gap-4">
                          <span className="text-xs text-muted-foreground">
                            {lead.createdAt ? formatRelativeTime(lead.createdAt) : 'Unknown date'}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => openLeadDetail(lead)}
                            >
                              View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 px-2">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {STATUS_OPTIONS.map((status) => (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() => handleStatusUpdate(lead.id, status)}
                                    disabled={savingId === lead.id || lead.status === status}
                                  >
                                    {status === 'new' && <Inbox className="mr-2 h-4 w-4" />}
                                    {status === 'in_progress' && <Clock className="mr-2 h-4 w-4" />}
                                    {status === 'resolved' && <CircleCheck className="mr-2 h-4 w-4" />}
                                    Mark as {STATUS_CONFIG[status].label}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <a href={`mailto:${lead.email}`}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Email
                                  </a>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}

          {!isLoading && nextCursor && (
            <div className="border-t p-4 text-center">
              <Button
                variant="outline"
                onClick={() => fetchMessages({ cursor: nextCursor, append: true })}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more leads'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div>{selectedLead.name}</div>
                    {selectedLead.company && (
                      <div className="text-sm font-normal text-muted-foreground">
                        {selectedLead.company}
                      </div>
                    )}
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${selectedLead.email}`} className="hover:underline">
                      {selectedLead.email}
                    </a>
                  </div>
                  <Badge className={cn('text-xs', STATUS_CONFIG[selectedLead.status].color)}>
                    {STATUS_CONFIG[selectedLead.status].label}
                  </Badge>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm leading-relaxed">{selectedLead.message}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Received {selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleString() : 'Unknown'}
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <div className="flex flex-1 gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <Button
                      key={status}
                      variant={selectedLead.status === status ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleStatusUpdate(selectedLead.id, status)}
                      disabled={savingId === selectedLead.id}
                    >
                      {savingId === selectedLead.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        STATUS_CONFIG[status].label
                      )}
                    </Button>
                  ))}
                </div>
                <Button asChild variant="secondary">
                  <a href={`mailto:${selectedLead.email}`}>
                    <Send className="mr-2 h-4 w-4" />
                    Reply
                  </a>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
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

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
