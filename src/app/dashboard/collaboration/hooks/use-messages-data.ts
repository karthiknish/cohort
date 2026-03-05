'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useConvex, useMutation, useQuery } from 'convex/react'
import { v4 as uuidv4 } from 'uuid'

import { useToast } from '@/components/ui/use-toast'
import { api, collaborationApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { decodeTimestampIdCursor, encodeTimestampIdCursor } from '@/lib/pagination'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration'
import type { CollaborationChannelType } from '@/types/collaboration'
import type { CollaborationMessageFormat } from '@/types/collaboration'

import type { Channel } from '../types'
import { extractMentionsFromContent } from '../utils/mentions'
import type { ChannelSummary, MessagesByChannelState, SendMessageOptions } from './types'
import { useRealtimeMessages, useRealtimeTyping } from './use-realtime'
import { useThreads } from './use-threads'
import { useTyping } from './use-typing'
import { useMessageActions } from './use-message-actions'
import type { PendingAttachment } from './types'

interface UseMessagesDataOptions {
  workspaceId: string | null
  currentUserId: string | null
  selectedChannel: Channel | null
  selectedChannelId: string | null
  channels: Channel[]
  channelParticipants: ClientTeamMember[]
  fallbackDisplayName: string
  fallbackRole: string
  pendingAttachments: PendingAttachment[]
  uploading: boolean
  clearAttachments: () => void
  uploadAttachments: (attachments: PendingAttachment[]) => Promise<CollaborationAttachment[]>
}

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined
  const normalized = value.filter((entry): entry is string => typeof entry === 'string')
  return normalized.length > 0 ? normalized : undefined
}

function toSharedPlatforms(value: unknown): Array<'email'> | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined
  const normalized = value.filter((entry): entry is 'email' => entry === 'email')
  return normalized.length > 0 ? normalized : undefined
}

function toChannelType(value: unknown, fallback: CollaborationChannelType): CollaborationChannelType {
  if (value === 'client' || value === 'team' || value === 'project') {
    return value
  }
  return fallback
}

export function useMessagesData({
  workspaceId,
  currentUserId,
  selectedChannel,
  selectedChannelId,
  channels,
  channelParticipants,
  fallbackDisplayName,
  fallbackRole,
  pendingAttachments,
  uploading,
  clearAttachments,
  uploadAttachments,
}: UseMessagesDataOptions) {
  const { toast } = useToast()
  const convex = useConvex()
  const createMessage = useMutation(collaborationApi.createMessage)
  const updateSharedTo = useMutation(collaborationApi.updateSharedTo)
  const markChannelAsRead = useMutation(collaborationApi.markChannelAsRead)
  const markThreadAsReadMutation = useMutation(collaborationApi.markThreadAsRead)

  const [messagesByChannel, setMessagesByChannel] = useState<MessagesByChannelState>({})
  const [nextCursorByChannel, setNextCursorByChannel] = useState<Record<string, string | null>>({})
  const [loadingMoreChannelId, setLoadingMoreChannelId] = useState<string | null>(null)
  const [loadingChannelId, setLoadingChannelId] = useState<string | null>(null)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [messageInput, setMessageInputState] = useState('')
  const [sending, setSending] = useState(false)
  const [messageSearchQuery, setMessageSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CollaborationMessage[]>([])
  const [searchHighlights, setSearchHighlights] = useState<string[]>([])
  const [searchingMessages, setSearchingMessages] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const lastMarkedMessageByChannelRef = useRef<Record<string, string>>({})

  const unreadCountsResult = useQuery(
    collaborationApi.getUnreadCountsByChannel,
    workspaceId && currentUserId
      ? {
          workspaceId: String(workspaceId),
          userId: String(currentUserId),
        }
      : 'skip'
  )

  const channelMessages = useMemo(
    () => (selectedChannel ? messagesByChannel[selectedChannel.id] ?? [] : []),
    [messagesByChannel, selectedChannel],
  )
  const threadRootIdsForUnread = useMemo(() => {
    const ids = new Set<string>()
    for (const message of channelMessages) {
      if (message.parentMessageId) continue

      const rootId =
        typeof message.threadRootId === 'string' && message.threadRootId.trim().length > 0
          ? message.threadRootId.trim()
          : message.id
      if (rootId) {
        ids.add(rootId)
      }
    }

    return Array.from(ids).slice(0, 200)
  }, [channelMessages])
  const normalizedMessageSearch = messageSearchQuery.trim()

  const threadUnreadCountsResult = useQuery(
    collaborationApi.getThreadUnreadCounts,
    workspaceId && currentUserId && selectedChannel && threadRootIdsForUnread.length > 0
      ? {
          workspaceId: String(workspaceId),
          channelType: selectedChannel.type,
          clientId: selectedChannel.type === 'client' ? (selectedChannel.clientId ?? null) : null,
          projectId: selectedChannel.type === 'project' ? (selectedChannel.projectId ?? null) : null,
          threadRootIds: threadRootIdsForUnread,
          userId: String(currentUserId),
        }
      : 'skip'
  )

  const participantNameMap = useMemo(
    () => new Map(channelParticipants.map((participant) => [participant.name.toLowerCase(), participant])),
    [channelParticipants]
  )

  const visibleMessages = useMemo(() => {
    if (normalizedMessageSearch) {
      if (searchResults.length > 0) return searchResults
      if (searchingMessages) return searchResults
      if (searchError) return []
      return searchResults
    }
    return channelMessages
  }, [channelMessages, normalizedMessageSearch, searchError, searchResults, searchingMessages])

  const isSearchActive = Boolean(normalizedMessageSearch)
  const activeMessagesError = isSearchActive ? searchError : messagesError
  const channelUnreadCounts = useMemo(() => {
    const source = (unreadCountsResult as { countsByChannelId?: Record<string, number> } | null)?.countsByChannelId
    if (!source || typeof source !== 'object') {
      return {} as Record<string, number>
    }

    return Object.fromEntries(
      Object.entries(source).map(([channelId, count]) => [
        channelId,
        Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0,
      ]),
    )
  }, [unreadCountsResult])
  const threadUnreadCountsByRootId = useMemo(() => {
    const source =
      (threadUnreadCountsResult as { countsByThreadRootId?: Record<string, number> } | null)?.countsByThreadRootId
    if (!source || typeof source !== 'object') {
      return {} as Record<string, number>
    }

    return Object.fromEntries(
      Object.entries(source).map(([threadRootId, count]) => [
        threadRootId,
        Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0,
      ]),
    )
  }, [threadUnreadCountsResult])

  const parseSearchQuery = useCallback((input: string) => {
    const tokens = input.split(/\s+/).filter(Boolean)
    const terms: string[] = []
    let sender: string | null = null
    let attachment: string | null = null
    let mention: string | null = null
    let start: string | null = null
    let end: string | null = null

    tokens.forEach((token) => {
      const lower = token.toLowerCase()
      if (lower.startsWith('from:')) {
        sender = token.slice(5)
      } else if (lower.startsWith('attachment:')) {
        attachment = token.slice(11)
      } else if (lower.startsWith('mention:')) {
        mention = token.slice(8)
      } else if (lower.startsWith('before:')) {
        end = token.slice(7)
      } else if (lower.startsWith('after:')) {
        start = token.slice(6)
      } else {
        terms.push(token)
      }
    })

    const highlights = [...terms]
    if (sender) highlights.push(sender)
    if (attachment) highlights.push(attachment)
    if (mention) highlights.push(mention)

    const normalizeField = (value: string | null): string | null => {
      if (!value) return null
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : null
    }

    return {
      q: terms.join(' ').trim(),
      sender: normalizeField(sender),
      attachment: normalizeField(attachment),
      mention: normalizeField(mention),
      start: normalizeField(start),
      end: normalizeField(end),
      highlights: highlights.filter(Boolean),
    }
  }, [])

  useEffect(() => {
    if (!selectedChannel || !normalizedMessageSearch) {
      setSearchResults([])
      setSearchHighlights([])
      setSearchError(null)
      setSearchingMessages(false)
      return
    }

    setSearchingMessages(true)
    setSearchError(null)

    const parsed = parseSearchQuery(normalizedMessageSearch)

    const startMs = parsed.start ? Date.parse(parsed.start) : NaN
    const endMs = parsed.end ? Date.parse(parsed.end) : NaN

    void convex
      .query(collaborationApi.searchChannel, {
        workspaceId: String(workspaceId),
        channelType: selectedChannel.type,
        clientId: selectedChannel.type === 'client' ? (selectedChannel.clientId ?? null) : null,
        projectId: selectedChannel.type === 'project' ? (selectedChannel.projectId ?? null) : null,
        q: parsed.q || null,
        sender: parsed.sender ?? null,
        attachment: parsed.attachment ?? null,
        mention: parsed.mention ?? null,
        startMs: Number.isFinite(startMs) ? startMs : null,
        endMs: Number.isFinite(endMs) ? endMs : null,
        limit: 200,
      })
      .then((payload: { rows?: unknown[]; highlights?: unknown[] }) => {
        const rows = Array.isArray(payload?.rows) ? payload.rows : []
        const highlights = Array.isArray(payload?.highlights)
          ? payload.highlights.filter((entry): entry is string => typeof entry === 'string')
          : parsed.highlights

        const mapped: CollaborationMessage[] = rows
          .map((row: unknown) => {
            const item = (row ?? {}) as Record<string, unknown>
            return {
            id: String(item.legacyId ?? ''),
            channelType: toChannelType(item.channelType, 'team'),
            clientId: typeof item.clientId === 'string' ? item.clientId : null,
            projectId: typeof item.projectId === 'string' ? item.projectId : null,
            senderId: typeof item.senderId === 'string' ? item.senderId : null,
            senderName: typeof item.senderName === 'string' ? item.senderName : 'Unknown teammate',
            senderRole: typeof item.senderRole === 'string' ? item.senderRole : null,
            content: Boolean(item.deleted || item.deletedAtMs) ? '' : String(item.content ?? ''),
            createdAt: typeof item.createdAtMs === 'number' ? new Date(item.createdAtMs).toISOString() : null,
            updatedAt: typeof item.updatedAtMs === 'number' ? new Date(item.updatedAtMs).toISOString() : null,
            isEdited: Boolean(item.updatedAtMs && item.createdAtMs && item.updatedAtMs !== item.createdAtMs),
            deletedAt: typeof item.deletedAtMs === 'number' ? new Date(item.deletedAtMs).toISOString() : null,
            deletedBy: typeof item.deletedBy === 'string' ? item.deletedBy : null,
            isDeleted: Boolean(item.deleted || item.deletedAtMs),
            attachments:
              Array.isArray(item.attachments) && item.attachments.length > 0
                ? (item.attachments as CollaborationAttachment[])
                : undefined,
            format: (item.format === 'plaintext' ? 'plaintext' : 'markdown') as CollaborationMessageFormat,
            mentions: Array.isArray(item.mentions) && item.mentions.length > 0 ? item.mentions : undefined,
            reactions: Array.isArray(item.reactions) && item.reactions.length > 0 ? item.reactions : undefined,
            readBy: toStringArray(item.readBy),
            deliveredTo: toStringArray(item.deliveredTo),
            isPinned: Boolean(item.isPinned),
            pinnedAt: typeof item.pinnedAtMs === 'number' ? new Date(item.pinnedAtMs).toISOString() : null,
            pinnedBy: typeof item.pinnedBy === 'string' ? item.pinnedBy : null,
            sharedTo: toSharedPlatforms(item.sharedTo),
            parentMessageId: typeof item.parentMessageId === 'string' ? item.parentMessageId : null,
            threadRootId: typeof item.threadRootId === 'string' ? item.threadRootId : null,
            threadReplyCount: typeof item.threadReplyCount === 'number' ? item.threadReplyCount : undefined,
            threadLastReplyAt:
              typeof item.threadLastReplyAtMs === 'number' ? new Date(item.threadLastReplyAtMs).toISOString() : null,
          }
          })
          .filter((m) => m.id)
          .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())

        setSearchResults(mapped)
        setSearchHighlights(highlights)
        setSearchError(null)
      })
      .catch((error: unknown) => {
        logError(error, 'useCollaborationData:searchChannel')
        setSearchError(asErrorMessage(error))
        setSearchResults([])
      })
      .finally(() => {
        setSearchingMessages(false)
      })

    return
    // eslint_disable-next-line react-hooks/exhaustive-deps
  }, [normalizedMessageSearch, parseSearchQuery, selectedChannelId])

  const channelSummaries = useMemo<Map<string, ChannelSummary>>(() => {
    const result = new Map<string, ChannelSummary>()
    Object.entries(messagesByChannel).forEach(([channelId, list]) => {
      if (list && list.length > 0) {
        const last = list[list.length - 1]! // Safe: we verified list.length > 0
        result.set(channelId, { lastMessage: last.content, lastTimestamp: last.createdAt })
      }
    })
    return result
  }, [messagesByChannel])

  const isCurrentChannelLoading = selectedChannel ? loadingChannelId === selectedChannel.id : false
  const loadingMore = selectedChannel ? loadingMoreChannelId === selectedChannel.id : false
  const canLoadMore = selectedChannel ? Boolean(nextCursorByChannel[selectedChannel.id]) : false

  const resolveSenderDetails = useCallback(() => {
    const participant = participantNameMap.get(fallbackDisplayName.toLowerCase())
    return { senderName: fallbackDisplayName, senderRole: participant?.role ?? fallbackRole }
  }, [fallbackDisplayName, fallbackRole, participantNameMap])

  const {
    stopTyping,
    notifyTyping,
    handleComposerFocus,
    handleComposerBlur,
  } = useTyping({
    userId: currentUserId,
    workspaceId,
    selectedChannel,
    resolveSenderDetails,
  })

  const {
    threadMessagesByRootId,
    threadNextCursorByRootId,
    threadLoadingByRootId,
    threadErrorsByRootId,
    loadThreadReplies,
    loadMoreThreadReplies,
    clearThreadReplies,
    addThreadReplyToState,
  } = useThreads({ workspaceId })

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

  const {
    messageUpdatingId,
    messageDeletingId,
    reactionUpdatingByMessage,
    handleEditMessage: handleEditMessageBase,
    handleDeleteMessage: handleDeleteMessageBase,
    handleToggleReaction: handleToggleReactionBase,
  } = useMessageActions({
    workspaceId,
    userId: currentUserId,
    channels,
    channelParticipants,
    mutateChannelMessages,
  })

  useRealtimeMessages({
    workspaceId,
    selectedChannel,
    setMessagesByChannel,
    setNextCursorByChannel,
    setLoadingChannelId,
    setMessagesError,
    onError: () => {},
  })

  const { typingParticipants } = useRealtimeTyping({
    userId: currentUserId,
    workspaceId,
    selectedChannel,
  })

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

  const handleMarkSelectedChannelAsRead = useCallback(async () => {
    if (!workspaceId || !currentUserId || !selectedChannel) {
      return
    }

    const latestUnread = [...channelMessages]
      .reverse()
      .find((message) => {
        if (message.isDeleted) return false
        if (message.senderId === currentUserId) return false

        const readBy = Array.isArray(message.readBy) ? message.readBy : []
        return !readBy.includes(currentUserId)
      })

    if (!latestUnread) {
      return
    }

    const alreadyMarked = lastMarkedMessageByChannelRef.current[selectedChannel.id]
    if (alreadyMarked === latestUnread.id) {
      return
    }

    const createdAtMs = latestUnread.createdAt ? Date.parse(latestUnread.createdAt) : NaN

    try {
      await markChannelAsRead({
        workspaceId: String(workspaceId),
        channelType: selectedChannel.type,
        clientId: selectedChannel.type === 'client' ? (selectedChannel.clientId ?? null) : null,
        projectId: selectedChannel.type === 'project' ? (selectedChannel.projectId ?? null) : null,
        userId: String(currentUserId),
        beforeMs: Number.isFinite(createdAtMs) ? createdAtMs : undefined,
      })

      lastMarkedMessageByChannelRef.current[selectedChannel.id] = latestUnread.id
    } catch (error) {
      logError(error, 'useCollaborationData:handleMarkSelectedChannelAsRead')
    }
  }, [channelMessages, currentUserId, markChannelAsRead, selectedChannel, workspaceId])

  const handleMarkThreadAsRead = useCallback(
    async (threadRootId: string, beforeMs?: number) => {
      if (!workspaceId || !currentUserId || !selectedChannel) {
        return
      }

      const normalizedThreadRootId = typeof threadRootId === 'string' ? threadRootId.trim() : ''
      if (!normalizedThreadRootId) {
        return
      }

      try {
        await markThreadAsReadMutation({
          workspaceId: String(workspaceId),
          channelType: selectedChannel.type,
          clientId: selectedChannel.type === 'client' ? (selectedChannel.clientId ?? null) : null,
          projectId: selectedChannel.type === 'project' ? (selectedChannel.projectId ?? null) : null,
          threadRootId: normalizedThreadRootId,
          userId: String(currentUserId),
          beforeMs,
        })
      } catch (error) {
        logError(error, 'useCollaborationData:handleMarkThreadAsRead')
      }
    },
    [currentUserId, markThreadAsReadMutation, selectedChannel, workspaceId],
  )

  useEffect(() => {
    if (!selectedChannel) {
      return
    }

    const timer = window.setTimeout(() => {
      void handleMarkSelectedChannelAsRead()
    }, 250)

    return () => {
      window.clearTimeout(timer)
    }
  }, [channelMessages, handleMarkSelectedChannelAsRead, selectedChannel])

  // Send message to external channels based on notification preferences
  const sendToExternalPlatforms = useCallback(
    async (message: CollaborationMessage, wsId: string) => {
      try {
        // Fetch notification preferences
        const prefs = await convex.query(api.settings.getMyNotificationPreferences, {})

        if (!prefs) return

        // Send to Email if enabled
        if (!prefs.emailCollaboration) {
          return
        }

        try {
          const response = await fetch('/api/integrations/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messageType: 'collaboration',
              text: message.content,
              metadata: {
                senderName: message.senderName,
                conversationUrl: `${window.location.origin}/dashboard/collaboration`,
              },
            }),
          })

          if (!response.ok) {
            return
          }

          try {
            await updateSharedTo({
              workspaceId: wsId,
              legacyId: message.id,
              sharedTo: ['email'],
            })
          } catch (error) {
            console.error('Failed to update message sharedTo:', error)
          }
        } catch (error) {
          console.error('Failed to send to Email:', error)
        }
      } catch (error) {
        console.error('Error sending to external platforms:', error)
      }
    },
    [convex, updateSharedTo]
  )

  const isSendDisabled = useMemo(() => {
    if (sending || uploading) return true
    const hasContent = messageInput.trim().length > 0
    const hasAttachments = pendingAttachments.length > 0
    return !hasContent && !hasAttachments
  }, [messageInput, pendingAttachments.length, sending, uploading])

  const handleSendMessage = useCallback(
    async (options?: SendMessageOptions) => {
      const trimmedContent = messageInput.trim()
      const channelId = selectedChannel?.id

      if (!trimmedContent && pendingAttachments.length === 0) {
        toast({ title: 'Message required', description: 'Enter a message before sending.', variant: 'destructive' })
        return
      }

      if (!channelId || !channels.some((c) => c.id === channelId)) {
        toast({ title: 'Channel unavailable', description: 'Select a channel and try again.', variant: 'destructive' })
        return
      }

      setSending(true)

      try {
        await stopTyping()

        const uploadedAttachments = await uploadAttachments(pendingAttachments)

        const mentionMatches = extractMentionsFromContent(trimmedContent)
        const mentionMetadata = mentionMatches.map((mention) => {
          const participant = participantNameMap.get(mention.name.toLowerCase())
          return { slug: mention.slug, name: participant?.name ?? mention.name, role: participant?.role ?? null }
        })

        if (!workspaceId || !currentUserId) {
          return
        }

        const parentMessage = options?.parentMessageId
          ? channelMessages.find((message) => message.id === options.parentMessageId)
          : null
        const resolvedThreadRootId = options?.parentMessageId
          ? (parentMessage?.threadRootId || parentMessage?.id || options.parentMessageId)
          : null

        const messageId = uuidv4()
        await createMessage({
          workspaceId: String(workspaceId),
          legacyId: messageId,
          channelType: selectedChannel.type,
          clientId: selectedChannel.clientId ?? null,
          projectId: selectedChannel.projectId ?? null,
          senderId: String(currentUserId),
          senderName: resolveSenderDetails().senderName,
          senderRole: resolveSenderDetails().senderRole,
          content: trimmedContent,
          attachments: (uploadedAttachments as CollaborationAttachment[]) ?? [],
          format: 'markdown',
          mentions: mentionMetadata,
          parentMessageId: options?.parentMessageId ?? null,
          threadRootId: resolvedThreadRootId,
          isThreadRoot: options?.parentMessageId ? false : true,
        })

        const createdRow = await convex.query(collaborationApi.getByLegacyId, {
          workspaceId: String(workspaceId),
          legacyId: messageId,
        })

        const createdMessage: CollaborationMessage = createdRow
          ? {
              id: String(createdRow?.legacyId ?? messageId),
              channelType: typeof createdRow?.channelType === 'string' ? createdRow.channelType : selectedChannel.type,
              clientId: typeof createdRow?.clientId === 'string' ? createdRow.clientId : selectedChannel.clientId ?? null,
              projectId: typeof createdRow?.projectId === 'string' ? createdRow.projectId : selectedChannel.projectId ?? null,
              senderId: typeof createdRow?.senderId === 'string' ? createdRow.senderId : String(currentUserId),
              senderName: typeof createdRow?.senderName === 'string' ? createdRow.senderName : resolveSenderDetails().senderName,
              senderRole: typeof createdRow?.senderRole === 'string' ? createdRow.senderRole : resolveSenderDetails().senderRole,
              content: Boolean(createdRow?.deleted || createdRow?.deletedAtMs)
                ? ''
                : String(createdRow?.content ?? ''),
              createdAt:
                typeof createdRow?.createdAtMs === 'number'
                  ? new Date(createdRow.createdAtMs).toISOString()
                  : new Date().toISOString(),
              updatedAt: typeof createdRow?.updatedAtMs === 'number' ? new Date(createdRow.updatedAtMs).toISOString() : null,
              isEdited: Boolean(createdRow?.updatedAtMs && createdRow?.createdAtMs && createdRow.updatedAtMs !== createdRow.createdAtMs),
              deletedAt: typeof createdRow?.deletedAtMs === 'number' ? new Date(createdRow.deletedAtMs).toISOString() : null,
              deletedBy: typeof createdRow?.deletedBy === 'string' ? createdRow.deletedBy : null,
              isDeleted: Boolean(createdRow?.deleted || createdRow?.deletedAtMs),
              attachments:
                Array.isArray(createdRow?.attachments) && createdRow.attachments.length > 0
                  ? createdRow.attachments
                  : undefined,
              format: createdRow?.format === 'plaintext' ? 'plaintext' : 'markdown',
              mentions: Array.isArray(createdRow?.mentions) && createdRow.mentions.length > 0 ? createdRow.mentions : undefined,
              reactions: Array.isArray(createdRow?.reactions) && createdRow.reactions.length > 0 ? createdRow.reactions : undefined,
              readBy: toStringArray(createdRow?.readBy),
              deliveredTo: toStringArray(createdRow?.deliveredTo),
              isPinned: Boolean(createdRow?.isPinned),
              pinnedAt: typeof createdRow?.pinnedAtMs === 'number' ? new Date(createdRow.pinnedAtMs).toISOString() : null,
              pinnedBy: typeof createdRow?.pinnedBy === 'string' ? createdRow.pinnedBy : null,
              sharedTo: toSharedPlatforms(createdRow?.sharedTo),
              parentMessageId: typeof createdRow?.parentMessageId === 'string' ? createdRow.parentMessageId : null,
              threadRootId:
                typeof createdRow?.threadRootId === 'string'
                  ? createdRow.threadRootId
                  : resolvedThreadRootId,
              threadReplyCount: typeof createdRow?.threadReplyCount === 'number' ? createdRow.threadReplyCount : undefined,
              threadLastReplyAt:
                typeof createdRow?.threadLastReplyAtMs === 'number'
                  ? new Date(createdRow.threadLastReplyAtMs).toISOString()
                  : null,
            }
          : {
              id: messageId,
              channelType: selectedChannel.type,
              clientId: selectedChannel.clientId ?? null,
              projectId: selectedChannel.projectId ?? null,
              senderId: String(currentUserId),
              senderName: resolveSenderDetails().senderName,
              senderRole: resolveSenderDetails().senderRole,
              content: trimmedContent,
              createdAt: new Date().toISOString(),
              updatedAt: null,
              isEdited: false,
              deletedAt: null,
              deletedBy: null,
              isDeleted: false,
              attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
              format: 'markdown',
              mentions: mentionMetadata.length > 0 ? mentionMetadata : undefined,
              reactions: [],
              readBy: [String(currentUserId)],
              deliveredTo: [String(currentUserId)],
              isPinned: false,
              pinnedAt: null,
              pinnedBy: null,
              sharedTo: undefined,
              parentMessageId: options?.parentMessageId ?? null,
              threadRootId: resolvedThreadRootId,
            }

        mutateChannelMessages(channelId, (messages) => {
          if (messages.some((m) => m.id === createdMessage.id)) return messages
          return [...messages, createdMessage]
        })

        // Also add to thread replies if this is a reply
        if (resolvedThreadRootId) {
          addThreadReplyToState(resolvedThreadRootId, createdMessage)
        }

        clearAttachments()
        setMessageInputState('')

        // Send to external platforms based on notification preferences
        if (workspaceId) {
          void sendToExternalPlatforms(createdMessage, workspaceId)
        }

        toast({ title: 'Message sent', description: 'Your message is live for the team.' })
      } catch (error) {
        logError(error, 'useCollaborationData:handleSendMessage')
        toast({ title: 'Collaboration error', description: asErrorMessage(error), variant: 'destructive' })
      } finally {
        setSending(false)
      }
    },
    [
      addThreadReplyToState,
      channels,
      channelMessages,
      clearAttachments,
      createMessage,
      convex,
      currentUserId,
      messageInput,
      mutateChannelMessages,
      pendingAttachments,
      participantNameMap,
      resolveSenderDetails,
      sendToExternalPlatforms,
      selectedChannel,
      stopTyping,
      toast,
      uploadAttachments,
      workspaceId,
    ]
  )

  const handleLoadMore = useCallback(
    async (channelId: string) => {
      const nextCursor = nextCursorByChannel[channelId]
      if (!nextCursor) return

      setLoadingMoreChannelId(channelId)

      try {
        const channel = channels.find((c) => c.id === channelId)
        if (!channel) throw new Error('Channel not found')

        if (!workspaceId) throw new Error('Workspace unavailable')

        const decoded = decodeTimestampIdCursor(nextCursor)
        const afterCreatedAtMs = decoded ? decoded.time.getTime() : undefined
        const afterLegacyId = decoded ? decoded.id : undefined

        const rows = (await convex.query(collaborationApi.listChannel, {
          workspaceId: String(workspaceId),
          channelType: channel.type,
          clientId: channel.type === 'client' ? (channel.clientId ?? null) : null,
          projectId: channel.type === 'project' ? (channel.projectId ?? null) : null,
          limit: 50 + 1,
          afterCreatedAtMs,
          afterLegacyId,
        })) as Array<Record<string, unknown>>

        const hasMore = rows.length > 50
        const pageRows = hasMore ? rows.slice(0, 50) : rows

        const mapped: CollaborationMessage[] = pageRows
          .map((row: unknown) => {
            const item = (row ?? {}) as Record<string, unknown>
            return {
            id: String(item.legacyId ?? ''),
            channelType: toChannelType(item.channelType, channel.type),
            clientId: typeof item.clientId === 'string' ? item.clientId : null,
            projectId: typeof item.projectId === 'string' ? item.projectId : null,
            senderId: typeof item.senderId === 'string' ? item.senderId : null,
            senderName: typeof item.senderName === 'string' ? item.senderName : 'Unknown teammate',
            senderRole: typeof item.senderRole === 'string' ? item.senderRole : null,
            content: Boolean(item.deleted || item.deletedAtMs) ? '' : String(item.content ?? ''),
            createdAt: typeof item.createdAtMs === 'number' ? new Date(item.createdAtMs).toISOString() : null,
            updatedAt: typeof item.updatedAtMs === 'number' ? new Date(item.updatedAtMs).toISOString() : null,
            isEdited: Boolean(item.updatedAtMs && item.createdAtMs && item.updatedAtMs !== item.createdAtMs),
            deletedAt: typeof item.deletedAtMs === 'number' ? new Date(item.deletedAtMs).toISOString() : null,
            deletedBy: typeof item.deletedBy === 'string' ? item.deletedBy : null,
            isDeleted: Boolean(item.deleted || item.deletedAtMs),
            attachments:
              Array.isArray(item.attachments) && item.attachments.length > 0
                ? (item.attachments as CollaborationAttachment[])
                : undefined,
            format: (item.format === 'plaintext' ? 'plaintext' : 'markdown') as CollaborationMessageFormat,
            mentions: Array.isArray(item.mentions) && item.mentions.length > 0 ? item.mentions : undefined,
            reactions: Array.isArray(item.reactions) && item.reactions.length > 0 ? item.reactions : undefined,
            readBy: toStringArray(item.readBy),
            deliveredTo: toStringArray(item.deliveredTo),
            isPinned: Boolean(item.isPinned),
            pinnedAt: typeof item.pinnedAtMs === 'number' ? new Date(item.pinnedAtMs).toISOString() : null,
            pinnedBy: typeof item.pinnedBy === 'string' ? item.pinnedBy : null,
            sharedTo: toSharedPlatforms(item.sharedTo),
            parentMessageId: typeof item.parentMessageId === 'string' ? item.parentMessageId : null,
            threadRootId: typeof item.threadRootId === 'string' ? item.threadRootId : null,
            threadReplyCount: typeof item.threadReplyCount === 'number' ? item.threadReplyCount : undefined,
            threadLastReplyAt:
              typeof item.threadLastReplyAtMs === 'number' ? new Date(item.threadLastReplyAtMs).toISOString() : null,
          }
          })
          .filter((m) => m.id)
          .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())

        const oldestRow = pageRows.length ? pageRows[pageRows.length - 1] : null
        const oldestCreatedAtMs = oldestRow && typeof oldestRow.createdAtMs === 'number' ? oldestRow.createdAtMs : null
        const oldestLegacyId = oldestRow && typeof oldestRow.legacyId === 'string' ? oldestRow.legacyId : ''
        const newCursor =
          hasMore && oldestCreatedAtMs !== null
            ? encodeTimestampIdCursor(
                new Date(oldestCreatedAtMs).toISOString(),
                String(oldestLegacyId)
              )
            : null

        mutateChannelMessages(channelId, (existing) => {
          const existingIds = new Set(existing.map((m) => m.id))
          const newMessages = mapped.filter((m) => !existingIds.has(m.id))
          return [...newMessages, ...existing]
        })

        setNextCursorByChannel((prev) => ({ ...prev, [channelId]: newCursor }))
      } catch (error) {
        logError(error, 'useCollaborationData:handleLoadMore')
        toast({ title: 'Load error', description: asErrorMessage(error), variant: 'destructive' })
      } finally {
        setLoadingMoreChannelId(null)
      }
    },
    [channels, convex, mutateChannelMessages, nextCursorByChannel, toast, workspaceId]
  )

  const setMessageInput = useCallback(
    (value: string) => {
      setMessageInputState(value)
      if (value.trim().length > 0) notifyTyping()
    },
    [notifyTyping]
  )

  return {
    channelMessages,
    visibleMessages,
    searchingMessages,
    searchHighlights,
    messageSearchQuery,
    setMessageSearchQuery,
    isCurrentChannelLoading,
    messagesError: activeMessagesError,
    channelSummaries,
    messageInput,
    setMessageInput,
    typingParticipants,
    handleComposerFocus,
    handleComposerBlur,
    handleSendMessage,
    sending,
    isSendDisabled,
    messagesEndRef,
    handleEditMessage,
    handleDeleteMessage,
    handleToggleReaction,
    messageUpdatingId,
    messageDeletingId,
    handleLoadMore,
    canLoadMore,
    loadingMore,
    threadMessagesByRootId,
    threadNextCursorByRootId,
    threadLoadingByRootId,
    threadErrorsByRootId,
    threadUnreadCountsByRootId,
    loadThreadReplies,
    loadMoreThreadReplies,
    markThreadAsRead: handleMarkThreadAsRead,
    clearThreadReplies,
    reactionPendingByMessage: reactionUpdatingByMessage,
    channelUnreadCounts,
  }
}
