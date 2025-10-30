'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Search,
  Send,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import type { ClientRecord, ClientTeamMember } from '@/types/clients'
import type {
  CollaborationAttachment,
  CollaborationChannelType,
  CollaborationMessage,
} from '@/types/collaboration'

type Channel = {
  id: string
  name: string
  type: CollaborationChannelType
  clientId: string | null
  teamMembers: ClientTeamMember[]
}

const channelTypeColors: Record<CollaborationChannelType, string> = {
  client: 'bg-blue-100 text-blue-800',
  team: 'bg-emerald-100 text-emerald-800',
  project: 'bg-purple-100 text-purple-800',
}

function normalizeTeamMembers(members: ClientTeamMember[] = []): ClientTeamMember[] {
  const map = new Map<string, ClientTeamMember>()

  members.forEach((member) => {
    const name = typeof member.name === 'string' ? member.name.trim() : ''
    if (!name) return
    const role = typeof member.role === 'string' ? member.role.trim() : ''
    const key = name.toLowerCase()

    if (!map.has(key)) {
      map.set(key, {
        name,
        role: role || 'Contributor',
      })
    }
  })

  return Array.from(map.values())
}

function aggregateTeamMembers(clients: ClientRecord[], fallbackName: string, fallbackRole: string): ClientTeamMember[] {
  const map = new Map<string, ClientTeamMember>()

  clients.forEach((client) => {
    normalizeTeamMembers(client.teamMembers).forEach((member) => {
      const key = member.name.toLowerCase()
      if (!map.has(key)) {
        map.set(key, member)
      }
    })
  })

  const normalizedFallback = fallbackName.trim()
  if (normalizedFallback.length > 0) {
    const key = normalizedFallback.toLowerCase()
    if (!map.has(key)) {
      map.set(key, { name: normalizedFallback, role: fallbackRole })
    }
  }

  return Array.from(map.values())
}

function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return 'TM'
  const parts = trimmed.split(' ').filter(Boolean)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

function formatRelativeTime(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  if (diffSeconds < 60) return `${diffSeconds}s ago`
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatTimestamp(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export default function CollaborationPage() {
  const { user, getIdToken } = useAuth()
  const { clients, selectedClient } = useClientContext()
  const { toast } = useToast()

  const fallbackDisplayName = useMemo(() => {
    if (user?.name && user.name.trim().length > 0) {
      return user.name.trim()
    }
    if (user?.email && user.email.trim().length > 0) {
      return user.email.trim()
    }
    return 'You'
  }, [user?.email, user?.name])

  const fallbackRole = 'Account Owner'

  const aggregatedTeamMembers = useMemo(
    () => aggregateTeamMembers(clients, fallbackDisplayName, fallbackRole),
    [clients, fallbackDisplayName]
  )

  const channels = useMemo<Channel[]>(() => {
    const teamChannel: Channel = {
      id: 'team-agency',
      name: 'Agency Team',
      type: 'team',
      clientId: null,
      teamMembers: aggregatedTeamMembers,
    }

    const clientChannels = clients.map<Channel>((client) => ({
      id: `client-${client.id}`,
      name: client.name,
      type: 'client',
      clientId: client.id,
      teamMembers: normalizeTeamMembers(client.teamMembers),
    }))

    return [teamChannel, ...clientChannels]
  }, [aggregatedTeamMembers, clients])

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, CollaborationMessage[]>>({})
  const [loadingChannelId, setLoadingChannelId] = useState<string | null>(null)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [senderSelection, setSenderSelection] = useState('')
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) ?? null,
    [channels, selectedChannelId]
  )

  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) {
      return channels
    }
    const query = searchQuery.toLowerCase().trim()
    return channels.filter((channel) => channel.name.toLowerCase().includes(query))
  }, [channels, searchQuery])

  const channelSummaries = useMemo(() => {
    const result = new Map<string, { lastMessage: string; lastTimestamp: string | null }>()
    Object.entries(messagesByChannel).forEach(([channelId, list]) => {
      if (list && list.length > 0) {
        const last = list[list.length - 1]
        result.set(channelId, {
          lastMessage: last.content,
          lastTimestamp: last.createdAt,
        })
      }
    })
    return result
  }, [messagesByChannel])

  const channelMessages = selectedChannel ? messagesByChannel[selectedChannel.id] ?? [] : []
  const isCurrentChannelLoading = selectedChannel ? loadingChannelId === selectedChannel.id : false

  const channelParticipants = useMemo(() => {
    if (!selectedChannel) return []

    const map = new Map<string, ClientTeamMember>()
    selectedChannel.teamMembers.forEach((member) => {
      const name = member.name.trim()
      if (!name) return
      const key = name.toLowerCase()
      if (!map.has(key)) {
        map.set(key, {
          name,
          role: member.role?.trim() || 'Contributor',
        })
      }
    })

    if (fallbackDisplayName) {
      const key = fallbackDisplayName.toLowerCase()
      if (!map.has(key)) {
        map.set(key, { name: fallbackDisplayName, role: fallbackRole })
      }
    }

    return Array.from(map.values())
  }, [fallbackDisplayName, fallbackRole, selectedChannel])

  const sharedFiles = useMemo(() => {
    const map = new Map<string, CollaborationAttachment>()
    channelMessages.forEach((message) => {
      if (!Array.isArray(message.attachments)) return
      message.attachments.forEach((attachment) => {
        if (!attachment?.url) return
        const key = `${attachment.url}-${attachment.name}`
        if (!map.has(key)) {
          map.set(key, attachment)
        }
      })
    })
    return Array.from(map.values())
  }, [channelMessages])

  const totalChannels = channels.length
  const totalParticipants = aggregatedTeamMembers.length

  const fetchMessages = useCallback(
    async (channel: Channel) => {
      setMessagesError(null)
      setLoadingChannelId(channel.id)

      try {
        const token = await getIdToken()
        const params = new URLSearchParams()
        params.set('channelType', channel.type)
        if (channel.type === 'client' && channel.clientId) {
          params.set('clientId', channel.clientId)
        }

        const response = await fetch(`/api/collaboration/messages?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          const message = typeof payload?.error === 'string' ? payload.error : 'Unable to load messages'
          throw new Error(message)
        }

        const payload = (await response.json()) as { messages?: CollaborationMessage[] }
        const list = Array.isArray(payload.messages) ? payload.messages : []

        setMessagesByChannel((prev) => ({
          ...prev,
          [channel.id]: list,
        }))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load messages'
        setMessagesError(message)
        toast({ title: 'Collaboration error', description: message, variant: 'destructive' })
      } finally {
        setLoadingChannelId(null)
      }
    },
    [getIdToken, toast]
  )

  const handleSendMessage = useCallback(async () => {
    if (!selectedChannel) return
    const content = messageInput.trim()
    if (!content) return

    const senderName = senderSelection.trim() || fallbackDisplayName
    if (!senderName) {
      toast({ title: 'Select a teammate', description: 'Choose who is speaking before sending a message.', variant: 'destructive' })
      return
    }

    const sender = channelParticipants.find((member) => member.name === senderName)
    const senderRole = sender?.role ?? null

    try {
      setSending(true)
      const token = await getIdToken()
      const response = await fetch('/api/collaboration/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          channelType: selectedChannel.type,
          clientId: selectedChannel.type === 'client' ? selectedChannel.clientId : undefined,
          senderName,
          senderRole,
          content,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        const message = typeof payload?.error === 'string' ? payload.error : 'Unable to send message'
        throw new Error(message)
      }

      const payload = (await response.json()) as { message?: CollaborationMessage }
      const created = payload.message
      if (!created) {
        throw new Error('Invalid response from server')
      }

      const messageRecord: CollaborationMessage = {
        ...created,
        senderRole: created.senderRole ?? senderRole,
      }

      setMessagesByChannel((prev) => {
        const previous = prev[selectedChannel.id] ?? []
        return {
          ...prev,
          [selectedChannel.id]: [...previous, messageRecord],
        }
      })
      setMessageInput('')

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send message'
      toast({ title: 'Collaboration error', description: message, variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }, [channelParticipants, fallbackDisplayName, getIdToken, messageInput, selectedChannel, senderSelection, toast])

  useEffect(() => {
    if (channels.length === 0) {
      setSelectedChannelId(null)
      return
    }

    setSelectedChannelId((current) => {
      if (current && channels.some((channel) => channel.id === current)) {
        return current
      }

      if (selectedClient) {
        const clientChannel = channels.find(
          (channel) => channel.type === 'client' && channel.clientId === selectedClient.id
        )
        if (clientChannel) {
          return clientChannel.id
        }
      }

      return channels[0]?.id ?? null
    })
  }, [channels, selectedClient])

  useEffect(() => {
    if (!selectedChannel) return
    if (messagesByChannel[selectedChannel.id]) return
    void fetchMessages(selectedChannel)
  }, [fetchMessages, messagesByChannel, selectedChannel])

  useEffect(() => {
    if (!selectedChannel) {
      setSenderSelection('')
      return
    }

    if (!senderSelection || !channelParticipants.some((member) => member.name === senderSelection)) {
      const fallback = channelParticipants[0]?.name ?? fallbackDisplayName
      setSenderSelection(fallback)
    }
  }, [channelParticipants, fallbackDisplayName, selectedChannel, senderSelection])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [channelMessages.length, selectedChannel?.id])

  const isSendDisabled = sending || !selectedChannel || messageInput.trim().length === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Team collaboration</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Coordinate with teammates and clients in dedicated workspaces tied to each account.
          </p>
        </div>
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="border-b border-muted/40 pb-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" /> {totalChannels} channels
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {totalParticipants} teammates
            </Badge>
            {selectedChannel && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> {channelMessages.length} messages in current thread
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-0 lg:flex-row">
          <div className="flex h-full w-full flex-col border-b border-muted/40 lg:h-[640px] lg:w-80 lg:border-b-0 lg:border-r">
            <div className="p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search channels…"
                  className="pl-9"
                />
              </div>
            </div>
            <Separator className="lg:hidden" />
            <ScrollArea className="flex-1">
              {filteredChannels.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">No channels match your search.</p>
              ) : (
                <div className="space-y-2 p-3">
                  {filteredChannels.map((channel) => {
                    const summary = channelSummaries.get(channel.id)
                    const isSelected = selectedChannel?.id === channel.id
                    return (
                      <Button
                        key={channel.id}
                        type="button"
                        variant="ghost"
                        onClick={() => setSelectedChannelId(channel.id)}
                        className={cn(
                          'h-auto w-full justify-start rounded-lg border border-transparent bg-transparent px-3 py-3 text-left shadow-none transition hover:bg-muted',
                          isSelected && 'border-primary/40 bg-muted'
                        )}
                      >
                        <div className="flex w-full items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-foreground">{channel.name}</p>
                              <Badge variant="outline" className={channelTypeColors[channel.type]}>
                                {channel.type}
                              </Badge>
                            </div>
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {summary?.lastMessage ?? 'No messages yet'}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {summary?.lastTimestamp ? formatRelativeTime(summary.lastTimestamp) : ''}
                            </span>
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="flex min-h-[480px] flex-1 flex-col lg:h-[640px]">
            {selectedChannel ? (
              <>
                <div className="flex items-start justify-between gap-3 border-b border-muted/40 p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg font-semibold text-foreground">{selectedChannel.name}</CardTitle>
                      <Badge variant="outline" className={channelTypeColors[selectedChannel.type]}>
                        {selectedChannel.type}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {channelParticipants.map((member) => member.name).join(', ')}
                    </CardDescription>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="space-y-4 p-4">
                    {isCurrentChannelLoading && (
                      <div className="flex justify-center py-6 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    )}

                    {!isCurrentChannelLoading && channelMessages.length === 0 && !messagesError && (
                      <div className="rounded-md border border-dashed border-muted/50 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                        Start the conversation by posting the first update for this workspace.
                      </div>
                    )}

                    {messagesError && (
                      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                        {messagesError}
                      </div>
                    )}

                    {channelMessages.map((message) => (
                      <div key={message.id} className="flex items-start gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                          {getInitials(message.senderName)}
                        </span>
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{message.senderName}</p>
                            {message.senderRole && (
                              <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                                {message.senderRole}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{formatTimestamp(message.createdAt)}</span>
                          </div>
                          <p className="whitespace-pre-line text-sm text-foreground">{message.content}</p>
                          {Array.isArray(message.attachments) && message.attachments.length > 0 && (
                            <div className="space-y-2">
                              {message.attachments.map((attachment) => (
                                <Card key={`${attachment.url}-${attachment.name}`} className="border-muted/60 bg-muted/20">
                                  <CardContent className="flex items-center justify-between gap-3 p-3 text-sm">
                                    <div className="flex items-center gap-2 truncate">
                                      {attachment.type?.toLowerCase() === 'image' ? (
                                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      <span className="truncate">{attachment.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      {attachment.size && <span>{attachment.size}</span>}
                                      <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                                        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                          <Download className="h-4 w-4" />
                                          <span className="sr-only">Download {attachment.name}</span>
                                        </a>
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="border-t border-muted/40 p-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <Select
                        value={senderSelection}
                        onValueChange={setSenderSelection}
                        disabled={channelParticipants.length === 0 || sending}
                      >
                        <SelectTrigger className="w-full sm:w-56">
                          <SelectValue placeholder="Choose teammate" />
                        </SelectTrigger>
                        <SelectContent>
                          {channelParticipants.map((participant) => (
                            <SelectItem key={participant.name} value={participant.name}>
                              {participant.name}
                              {participant.role ? ` • ${participant.role}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <Textarea
                        value={messageInput}
                        onChange={(event) => setMessageInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault()
                            void handleSendMessage()
                          }
                        }}
                        placeholder="Share an update, add context, or ask a question…"
                        className="min-h-[72px] flex-1"
                        disabled={!selectedChannel || sending}
                        maxLength={2000}
                      />
                      <Button onClick={() => void handleSendMessage()} disabled={isSendDisabled} className="sm:self-stretch">
                        {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
                Add a client to start a shared collaboration workspace.
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="hidden h-[640px] lg:block" />

          <div className="flex w-full flex-col gap-6 border-t border-muted/40 p-4 text-sm text-muted-foreground lg:h-[640px] lg:w-64 lg:border-t-0">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Participants</p>
              {selectedChannel ? (
                channelParticipants.length > 0 ? (
                  <div className="space-y-2">
                    {channelParticipants.map((participant) => (
                      <div key={participant.name} className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-foreground">
                          {getInitials(participant.name)}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">{participant.name}</span>
                          {participant.role && (
                            <span className="text-xs text-muted-foreground">{participant.role}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No teammates added yet.</p>
                )
              ) : (
                <p className="text-sm text-muted-foreground">Select a channel to view its roster.</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Shared files</p>
              {sharedFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">Files shared in messages will appear here automatically.</p>
              ) : (
                sharedFiles.map((file) => (
                  <Card key={`${file.url}-${file.name}`} className="border-muted/40 bg-muted/10">
                    <CardContent className="flex items-center gap-2 p-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-xs text-foreground hover:underline"
                      >
                        {file.name}
                      </a>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
