'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration'
import type { ProjectRecord } from '@/types/projects'

import { aggregateTeamMembers, collectSharedFiles, normalizeTeamMembers } from '../utils'
import type { Channel } from '../types'
import { extractMentionsFromContent } from '../utils/mentions'

import type {
  ChannelSummary,
  MessagesByChannelState,
  PendingAttachment,
  SendMessageOptions,
  UseCollaborationDataReturn,
} from './types'
import { readSessionTokenCookie } from './utils'
import { useRealtimeMessages, useRealtimeTyping } from './use-realtime'
import { useThreads } from './use-threads'
import { useTyping } from './use-typing'
import { useAttachments } from './use-attachments'
import { useMessageActions } from './use-message-actions'

export function useCollaborationData(): UseCollaborationDataReturn {
  const { user, getIdToken } = useAuth()
  const { clients, selectedClient, loading: clientsLoading } = useClientContext()
  const { toast } = useToast()

  // ─────────────────────────────────────────────────────────────────────────────
  // Projects state
  // ─────────────────────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)

  // ─────────────────────────────────────────────────────────────────────────────
  // User identity
  // ─────────────────────────────────────────────────────────────────────────────
  const fallbackRole = 'Account Owner'
  const fallbackDisplayName = useMemo(() => {
    if (user?.name && user.name.trim().length > 0) return user.name.trim()
    if (user?.email && user.email.trim().length > 0) return user.email.trim()
    return 'You'
  }, [user?.email, user?.name])

  const currentUserId = user?.id ?? null
  const currentUserRole = user?.role ?? null

  const aggregatedTeamMembers = useMemo(
    () => aggregateTeamMembers(clients, fallbackDisplayName, fallbackRole),
    [clients, fallbackDisplayName]
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Channels
  // ─────────────────────────────────────────────────────────────────────────────
  const channels = useMemo<Channel[]>(() => {
    const teamChannel: Channel = {
      id: 'team-agency',
      name: 'Agency Team',
      type: 'team',
      clientId: null,
      projectId: null,
      teamMembers: aggregatedTeamMembers,
    }

    const clientChannels = clients.map<Channel>((client) => ({
      id: `client-${client.id}`,
      name: client.name,
      type: 'client',
      clientId: client.id,
      projectId: null,
      teamMembers: normalizeTeamMembers(client.teamMembers),
    }))

    const projectChannels = projects.map<Channel>((project) => {
      const relatedClient = clients.find((client) => client.id === project.clientId)
      return {
        id: `project-${project.id}`,
        name: project.name,
        type: 'project',
        clientId: project.clientId,
        projectId: project.id,
        teamMembers: relatedClient ? normalizeTeamMembers(relatedClient.teamMembers) : aggregatedTeamMembers,
      }
    })

    return [teamChannel, ...clientChannels, ...projectChannels]
  }, [aggregatedTeamMembers, clients, projects])

  // ─────────────────────────────────────────────────────────────────────────────
  // Channel selection and search
  // ─────────────────────────────────────────────────────────────────────────────
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) ?? null,
    [channels, selectedChannelId]
  )

  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels
    const query = searchQuery.toLowerCase().trim()
    return channels.filter((channel) => channel.name.toLowerCase().includes(query))
  }, [channels, searchQuery])

  const selectChannel = useCallback((channelId: string | null) => {
    setSelectedChannelId(channelId)
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // Messages state
  // ─────────────────────────────────────────────────────────────────────────────
  const [messagesByChannel, setMessagesByChannel] = useState<MessagesByChannelState>({})
  const [nextCursorByChannel, setNextCursorByChannel] = useState<Record<string, string | null>>({})
  const [loadingMoreChannelId, setLoadingMoreChannelId] = useState<string | null>(null)
  const [loadingChannelId, setLoadingChannelId] = useState<string | null>(null)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [messageInput, setMessageInputState] = useState('')
  const [senderSelection, setSenderSelection] = useState('')
  const [sending, setSending] = useState(false)
  const [messageSearchQuery, setMessageSearchQuery] = useState('')

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // ─────────────────────────────────────────────────────────────────────────────
  // Session token state
  // ─────────────────────────────────────────────────────────────────────────────
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const sessionTokenRef = useRef<string | null>(null)
  const pendingSessionPromiseRef = useRef<Promise<string> | null>(null)

  useEffect(() => {
    sessionTokenRef.current = sessionToken
  }, [sessionToken])

  useEffect(() => {
    if (!user) {
      pendingSessionPromiseRef.current = null
      sessionTokenRef.current = null
      setSessionToken(null)
      return
    }

    const cookieToken = readSessionTokenCookie()
    if (cookieToken) {
      sessionTokenRef.current = cookieToken
      setSessionToken(cookieToken)
    } else {
      sessionTokenRef.current = null
      setSessionToken(null)
    }
  }, [user])

  const ensureSessionToken = useCallback(async (): Promise<string> => {
    if (!user) throw new Error('You must be signed in to access collaboration data.')
    if (sessionTokenRef.current) return sessionTokenRef.current

    const cookieToken = readSessionTokenCookie()
    if (cookieToken) {
      sessionTokenRef.current = cookieToken
      setSessionToken(cookieToken)
      return cookieToken
    }

    if (pendingSessionPromiseRef.current) return pendingSessionPromiseRef.current

    const promise = getIdToken()
      .then((token) => {
        sessionTokenRef.current = token
        setSessionToken(token)
        pendingSessionPromiseRef.current = null
        return token
      })
      .catch((error) => {
        pendingSessionPromiseRef.current = null
        throw error
      })

    pendingSessionPromiseRef.current = promise
    return promise
  }, [getIdToken, user])

  // ─────────────────────────────────────────────────────────────────────────────
  // Derived state
  // ─────────────────────────────────────────────────────────────────────────────
  const channelMessages = selectedChannel ? messagesByChannel[selectedChannel.id] ?? [] : []

  const normalizedMessageSearch = messageSearchQuery.trim().toLowerCase()
  const visibleMessages = useMemo(() => {
    if (!normalizedMessageSearch) return channelMessages

    return channelMessages.filter((message) => {
      const haystacks: string[] = []
      if (message.content) haystacks.push(message.content)
      if (message.senderName) haystacks.push(message.senderName)
      if (message.senderRole) haystacks.push(message.senderRole)
      if (Array.isArray(message.attachments)) {
        haystacks.push(...message.attachments.map((a) => a.name))
      }
      if (Array.isArray(message.mentions)) {
        haystacks.push(...message.mentions.map((m) => m.name))
      }
      return haystacks.some((value) => value.toLowerCase().includes(normalizedMessageSearch))
    })
  }, [channelMessages, normalizedMessageSearch])

  const channelSummaries = useMemo<Map<string, ChannelSummary>>(() => {
    const result = new Map<string, ChannelSummary>()
    Object.entries(messagesByChannel).forEach(([channelId, list]) => {
      if (list && list.length > 0) {
        const last = list[list.length - 1]
        result.set(channelId, { lastMessage: last.content, lastTimestamp: last.createdAt })
      }
    })
    return result
  }, [messagesByChannel])

  const isCurrentChannelLoading = selectedChannel ? loadingChannelId === selectedChannel.id : false
  const loadingMore = selectedChannel ? loadingMoreChannelId === selectedChannel.id : false
  const canLoadMore = selectedChannel ? Boolean(nextCursorByChannel[selectedChannel.id]) : false
  const isBootstrapping = (clientsLoading || projectsLoading) && channels.length === 0

  const channelParticipants = useMemo(() => {
    if (!selectedChannel) return []

    const map = new Map<string, ClientTeamMember>()
    selectedChannel.teamMembers.forEach((member) => {
      const name = member.name.trim()
      if (!name) return
      const key = name.toLowerCase()
      if (!map.has(key)) {
        map.set(key, { name, role: member.role?.trim() || 'Contributor' })
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
    const attachmentGroups = channelMessages
      .filter((m) => !m.isDeleted && Array.isArray(m.attachments) && m.attachments.length > 0)
      .map((m) => m.attachments ?? [])
    return collectSharedFiles(attachmentGroups)
  }, [channelMessages])

  const totalChannels = channels.length
  const totalParticipants = aggregatedTeamMembers.length

  // ─────────────────────────────────────────────────────────────────────────────
  // Sender resolution
  // ─────────────────────────────────────────────────────────────────────────────
  const resolveSenderDetails = useCallback(() => {
    const resolvedName = senderSelection.trim() || fallbackDisplayName
    const participant = channelParticipants.find((member) => member.name === resolvedName)
    return { senderName: resolvedName, senderRole: participant?.role ?? null }
  }, [channelParticipants, fallbackDisplayName, senderSelection])

  // ─────────────────────────────────────────────────────────────────────────────
  // Use split hooks
  // ─────────────────────────────────────────────────────────────────────────────

  // Attachments
  const {
    pendingAttachments,
    uploading,
    handleAddAttachments,
    handleRemoveAttachment,
    clearAttachments,
    uploadAttachments: uploadAttachmentsBase,
  } = useAttachments({ userId: currentUserId })

  // Typing
  const {
    stopTyping,
    notifyTyping,
    handleComposerFocus,
    handleComposerBlur,
  } = useTyping({
    userId: currentUserId,
    selectedChannel,
    resolveSenderDetails,
  })

  // Threads
  const {
    threadMessagesByRootId,
    threadNextCursorByRootId,
    threadLoadingByRootId,
    threadErrorsByRootId,
    loadThreadReplies,
    loadMoreThreadReplies,
    clearThreadReplies,
  } = useThreads({ ensureSessionToken })

  // Mutate channel messages helper
  const mutateChannelMessages = useCallback(
    (channelId: string, updater: (messages: CollaborationMessage[]) => CollaborationMessage[]) => {
      setMessagesByChannel((prev) => {
        const current = prev[channelId] ?? []
        const next = updater(current)
        if (current === next) return prev
        return { ...prev, [channelId]: next }
      })
    },
    []
  )

  // Message actions (edit, delete, reactions)
  const {
    messageUpdatingId,
    messageDeletingId,
    reactionUpdatingByMessage,
    handleEditMessage: handleEditMessageBase,
    handleDeleteMessage: handleDeleteMessageBase,
    handleToggleReaction: handleToggleReactionBase,
  } = useMessageActions({
    ensureSessionToken,
    channels,
    channelParticipants,
    mutateChannelMessages,
  })

  // Realtime messages subscription
  useRealtimeMessages({
    userId: currentUserId,
    selectedChannel,
    setMessagesByChannel,
    setNextCursorByChannel,
    setLoadingChannelId,
    setMessagesError,
    onError: () => {},
  })

  // Realtime typing subscription
  const { typingParticipants } = useRealtimeTyping({
    userId: currentUserId,
    selectedChannel,
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // Wrapper handlers to match expected signatures
  // ─────────────────────────────────────────────────────────────────────────────

  const handleEditMessage = useCallback(
    async (channelId: string, messageId: string, nextContent: string) => {
      await handleEditMessageBase(channelId, messageId, nextContent)
    },
    [handleEditMessageBase]
  )

  const handleDeleteMessage = useCallback(
    async (channelId: string, messageId: string) => {
      await handleDeleteMessageBase(channelId, messageId)
    },
    [handleDeleteMessageBase]
  )

  const handleToggleReaction = useCallback(
    async (channelId: string, messageId: string, emoji: string) => {
      await handleToggleReactionBase(channelId, messageId, emoji)
    },
    [handleToggleReactionBase]
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // isSendDisabled
  // ─────────────────────────────────────────────────────────────────────────────
  const isSendDisabled = useMemo(() => {
    if (sending || uploading) return true
    const hasContent = messageInput.trim().length > 0
    const hasAttachments = pendingAttachments.length > 0
    return !hasContent && !hasAttachments
  }, [messageInput, pendingAttachments.length, sending, uploading])

  // ─────────────────────────────────────────────────────────────────────────────
  // Message sending
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (options?: SendMessageOptions) => {
      const trimmedContent = messageInput.trim()
      const channelId = selectedChannel?.id

      if (!trimmedContent && pendingAttachments.length === 0) {
        toast({ title: '✍️ Message required', description: 'Enter a message before sending.', variant: 'destructive' })
        return
      }

      if (!channelId || !channels.some((c) => c.id === channelId)) {
        toast({ title: '⚠️ Channel unavailable', description: 'Select a channel and try again.', variant: 'destructive' })
        return
      }

      setSending(true)

      try {
        await stopTyping()

        // Upload attachments
        const uploadedAttachments = await uploadAttachmentsBase(pendingAttachments)

        // Extract mentions
        const mentionMatches = extractMentionsFromContent(trimmedContent)
        const mentionMetadata = mentionMatches.map((mention) => {
          const participant = channelParticipants.find(
            (member) => member.name.toLowerCase() === mention.name.toLowerCase()
          )
          return { slug: mention.slug, name: participant?.name ?? mention.name, role: participant?.role ?? null }
        })

        const token = await ensureSessionToken()
        const response = await fetch('/api/collaboration/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            channelId,
            content: trimmedContent,
            format: 'markdown',
            senderName: resolveSenderDetails().senderName,
            senderRole: resolveSenderDetails().senderRole,
            attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
            mentions: mentionMetadata.length > 0 ? mentionMetadata : undefined,
            parentMessageId: options?.parentMessageId,
          }),
        })

        const payload = (await response.json().catch(() => null)) as
          | { message?: CollaborationMessage; error?: string }
          | null

        if (!response.ok || !payload?.message) {
          const message = typeof payload?.error === 'string' ? payload.error : 'Unable to send message'
          throw new Error(message)
        }

        const serverMessage = payload.message

        mutateChannelMessages(channelId, (messages) => {
          if (messages.some((m) => m.id === serverMessage.id)) return messages
          return [...messages, serverMessage]
        })

        clearAttachments()
        setMessageInputState('')

        toast({ title: 'Message sent', description: 'Your message is live for the team.' })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to send message'
        toast({ title: 'Collaboration error', description: message, variant: 'destructive' })
      } finally {
        setSending(false)
      }
    },
    [
      channels,
      channelParticipants,
      clearAttachments,
      ensureSessionToken,
      messageInput,
      mutateChannelMessages,
      pendingAttachments,
      resolveSenderDetails,
      selectedChannel,
      stopTyping,
      toast,
      uploadAttachmentsBase,
    ]
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Load more messages
  // ─────────────────────────────────────────────────────────────────────────────
  const handleLoadMore = useCallback(
    async (channelId: string) => {
      const cursor = nextCursorByChannel[channelId]
      if (!cursor) return

      setLoadingMoreChannelId(channelId)

      try {
        const token = await ensureSessionToken()
        const params = new URLSearchParams({ channelId, cursor, limit: '50' })
        const response = await fetch(`/api/collaboration/messages?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const payload = (await response.json().catch(() => null)) as
          | { messages?: CollaborationMessage[]; nextCursor?: string | null; error?: string }
          | null

        if (!response.ok || !payload) {
          throw new Error(typeof payload?.error === 'string' ? payload.error : 'Unable to load older messages')
        }

        const messages = Array.isArray(payload.messages) ? payload.messages : []
        const newCursor = payload.nextCursor ?? null

        mutateChannelMessages(channelId, (existing) => {
          const existingIds = new Set(existing.map((m) => m.id))
          const newMessages = messages.filter((m) => !existingIds.has(m.id))
          return [...newMessages, ...existing]
        })

        setNextCursorByChannel((prev) => ({ ...prev, [channelId]: newCursor }))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load older messages'
        toast({ title: 'Load error', description: message, variant: 'destructive' })
      } finally {
        setLoadingMoreChannelId(null)
      }
    },
    [ensureSessionToken, mutateChannelMessages, nextCursorByChannel, toast]
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch projects
  // ─────────────────────────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    if (!user) return

    setProjectsLoading(true)
    try {
      const token = await ensureSessionToken()
      const response = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const payload = (await response.json().catch(() => null)) as
        | { projects?: ProjectRecord[]; error?: string }
        | null

      if (!response.ok || !payload) {
        throw new Error(typeof payload?.error === 'string' ? payload.error : 'Unable to load projects')
      }

      setProjects(Array.isArray(payload.projects) ? payload.projects : [])
    } catch (error) {
      console.error('[collaboration] failed to fetch projects', error)
    } finally {
      setProjectsLoading(false)
    }
  }, [ensureSessionToken, user])

  useEffect(() => {
    void fetchProjects()
  }, [fetchProjects])

  // ─────────────────────────────────────────────────────────────────────────────
  // Auto-select sender when channel changes
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!senderSelection || !channelParticipants.some((member) => member.name === senderSelection)) {
      const fallback = channelParticipants[0]?.name ?? fallbackDisplayName
      setSenderSelection(fallback)
    }
  }, [channelParticipants, fallbackDisplayName, selectedChannel, senderSelection])

  // ─────────────────────────────────────────────────────────────────────────────
  // Message input with typing notification
  // ─────────────────────────────────────────────────────────────────────────────
  const setMessageInput = useCallback(
    (value: string) => {
      setMessageInputState(value)
      if (value.trim().length > 0) notifyTyping()
    },
    [notifyTyping]
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────────────────────────────────────────
  return {
    // Channels
    channels,
    filteredChannels,
    searchQuery,
    setSearchQuery,
    selectedChannel,
    selectChannel,
    channelSummaries,

    // Messages
    channelMessages,
    visibleMessages,
    isCurrentChannelLoading,
    isBootstrapping,
    messagesError,
    messageSearchQuery,
    setMessageSearchQuery,

    // Stats
    totalChannels,
    totalParticipants,
    channelParticipants,
    sharedFiles,

    // Composer
    senderSelection,
    setSenderSelection,
    messageInput,
    setMessageInput,
    pendingAttachments,
    handleAddAttachments,
    handleRemoveAttachment,
    uploading,

    // Typing
    typingParticipants,
    handleComposerFocus,
    handleComposerBlur,

    // Message actions
    handleSendMessage,
    sending,
    isSendDisabled,
    messagesEndRef,
    handleEditMessage,
    handleDeleteMessage,
    handleToggleReaction,
    messageUpdatingId,
    messageDeletingId,

    // Pagination
    handleLoadMore,
    canLoadMore,
    loadingMore,

    // User info
    currentUserId,
    currentUserRole,

    // Threads
    threadMessagesByRootId,
    threadNextCursorByRootId,
    threadLoadingByRootId,
    threadErrorsByRootId,
    loadThreadReplies,
    loadMoreThreadReplies,
    clearThreadReplies,

    // Reactions
    reactionPendingByMessage: reactionUpdatingByMessage,
  }
}
