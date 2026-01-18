'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useConvex, useMutation } from 'convex/react'
import { v4 as uuidv4 } from 'uuid'

import { useToast } from '@/components/ui/use-toast'
import { collaborationApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { decodeTimestampIdCursor, encodeTimestampIdCursor } from '@/lib/pagination'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration'
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
  const createMessage = useMutation((collaborationApi as any).createMessage)

  const [messagesByChannel, setMessagesByChannel] = useState<MessagesByChannelState>({})
  const [nextCursorByChannel, setNextCursorByChannel] = useState<Record<string, string | null>>({})
  const [loadingMoreChannelId, setLoadingMoreChannelId] = useState<string | null>(null)
  const [loadingChannelId, setLoadingChannelId] = useState<string | null>(null)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [messageInput, setMessageInputState] = useState('')
  const [senderSelection, setSenderSelection] = useState('')
  const [sending, setSending] = useState(false)
  const [messageSearchQuery, setMessageSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CollaborationMessage[]>([])
  const [searchHighlights, setSearchHighlights] = useState<string[]>([])
  const [searchingMessages, setSearchingMessages] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const channelMessages = selectedChannel ? messagesByChannel[selectedChannel.id] ?? [] : []
  const normalizedMessageSearch = messageSearchQuery.trim()

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
      .query((collaborationApi as any).searchChannel, {
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
      .then((payload: any) => {
        const rows = Array.isArray(payload?.rows) ? payload.rows : []
        const highlights = Array.isArray(payload?.highlights) ? payload.highlights : parsed.highlights

        const mapped: CollaborationMessage[] = rows
          .map((row: any) => ({
            id: String(row?.legacyId ?? ''),
            channelType: typeof row?.channelType === 'string' ? row.channelType : 'team',
            clientId: typeof row?.clientId === 'string' ? row.clientId : null,
            projectId: typeof row?.projectId === 'string' ? row.projectId : null,
            senderId: typeof row?.senderId === 'string' ? row.senderId : null,
            senderName: typeof row?.senderName === 'string' ? row.senderName : 'Unknown teammate',
            senderRole: typeof row?.senderRole === 'string' ? row.senderRole : null,
            content: Boolean(row?.deleted || row?.deletedAtMs) ? '' : String(row?.content ?? ''),
            createdAt: typeof row?.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null,
            updatedAt: typeof row?.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null,
            isEdited: Boolean(row?.updatedAtMs && row?.createdAtMs && row.updatedAtMs !== row.createdAtMs),
            deletedAt: typeof row?.deletedAtMs === 'number' ? new Date(row.deletedAtMs).toISOString() : null,
            deletedBy: typeof row?.deletedBy === 'string' ? row.deletedBy : null,
            isDeleted: Boolean(row?.deleted || row?.deletedAtMs),
            attachments: Array.isArray(row?.attachments) && row.attachments.length > 0 ? (row.attachments as any) : undefined,
            format: (row?.format === 'plaintext' ? 'plaintext' : 'markdown') as CollaborationMessageFormat,
            mentions: Array.isArray(row?.mentions) && row.mentions.length > 0 ? row.mentions : undefined,
            reactions: Array.isArray(row?.reactions) && row.reactions.length > 0 ? row.reactions : undefined,
            parentMessageId: typeof row?.parentMessageId === 'string' ? row.parentMessageId : null,
            threadRootId: typeof row?.threadRootId === 'string' ? row.threadRootId : null,
            threadReplyCount: typeof row?.threadReplyCount === 'number' ? row.threadReplyCount : undefined,
            threadLastReplyAt:
              typeof row?.threadLastReplyAtMs === 'number' ? new Date(row.threadLastReplyAtMs).toISOString() : null,
          }))
          .filter((m: CollaborationMessage) => m.id)
          .sort(
            (a: CollaborationMessage, b: CollaborationMessage) =>
              new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
          )

        setSearchResults(mapped)
        setSearchHighlights(highlights)
        setSearchError(null)
      })
      .catch((error: any) => {
        logError(error, 'useCollaborationData:searchChannel')
        setSearchError(asErrorMessage(error))
        setSearchResults([])
      })
      .finally(() => {
        setSearchingMessages(false)
      })

    return
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedMessageSearch, parseSearchQuery, selectedChannelId])

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

  const resolveSenderDetails = useCallback(() => {
    const resolvedName = senderSelection.trim() || fallbackDisplayName
    const participant = participantNameMap.get(resolvedName.toLowerCase())
    return { senderName: resolvedName, senderRole: participant?.role ?? null }
  }, [fallbackDisplayName, participantNameMap, senderSelection])

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
        const mentionMetadata = mentionMatches.map((mention: any) => {
          const participant = participantNameMap.get(mention.name.toLowerCase())
          return { slug: mention.slug, name: participant?.name ?? mention.name, role: participant?.role ?? null }
        })

        if (!workspaceId || !currentUserId) {
          return
        }

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
          threadRootId: null,
          isThreadRoot: options?.parentMessageId ? false : true,
        })

        const createdRow = await convex.query((collaborationApi as any).getByLegacyId, {
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
              parentMessageId: typeof createdRow?.parentMessageId === 'string' ? createdRow.parentMessageId : null,
              threadRootId: typeof createdRow?.threadRootId === 'string' ? createdRow.threadRootId : null,
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
              parentMessageId: options?.parentMessageId ?? null,
              threadRootId: null,
            }

        mutateChannelMessages(channelId, (messages) => {
          if (messages.some((m) => m.id === createdMessage.id)) return messages
          return [...messages, createdMessage]
        })

        clearAttachments()
        setMessageInputState('')

        toast({ title: 'Message sent', description: 'Your message is live for the team.' })
      } catch (error) {
        logError(error, 'useCollaborationData:handleSendMessage')
        toast({ title: 'Collaboration error', description: asErrorMessage(error), variant: 'destructive' })
      } finally {
        setSending(false)
      }
    },
    [
      channels,
      channelParticipants,
      clearAttachments,
      createMessage,
      convex,
      currentUserId,
      messageInput,
      mutateChannelMessages,
      pendingAttachments,
      resolveSenderDetails,
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

        const rows = (await convex.query((collaborationApi as any).listChannel, {
          workspaceId: String(workspaceId),
          channelType: channel.type,
          clientId: channel.type === 'client' ? (channel.clientId ?? null) : null,
          projectId: channel.type === 'project' ? (channel.projectId ?? null) : null,
          limit: 50 + 1,
          afterCreatedAtMs,
          afterLegacyId,
        })) as any[]

        const hasMore = rows.length > 50
        const pageRows = hasMore ? rows.slice(0, 50) : rows

        const mapped: CollaborationMessage[] = pageRows
          .map((row: any) => ({
            id: String(row?.legacyId ?? ''),
            channelType: typeof row?.channelType === 'string' ? row.channelType : channel.type,
            clientId: typeof row?.clientId === 'string' ? row.clientId : null,
            projectId: typeof row?.projectId === 'string' ? row.projectId : null,
            senderId: typeof row?.senderId === 'string' ? row.senderId : null,
            senderName: typeof row?.senderName === 'string' ? row.senderName : 'Unknown teammate',
            senderRole: typeof row?.senderRole === 'string' ? row.senderRole : null,
            content: Boolean(row?.deleted || row?.deletedAtMs) ? '' : String(row?.content ?? ''),
            createdAt: typeof row?.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null,
            updatedAt: typeof row?.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null,
            isEdited: Boolean(row?.updatedAtMs && row?.createdAtMs && row.updatedAtMs !== row.createdAtMs),
            deletedAt: typeof row?.deletedAtMs === 'number' ? new Date(row.deletedAtMs).toISOString() : null,
            deletedBy: typeof row?.deletedBy === 'string' ? row.deletedBy : null,
            isDeleted: Boolean(row?.deleted || row?.deletedAtMs),
            attachments: Array.isArray(row?.attachments) && row.attachments.length > 0 ? row.attachments : undefined,
            format: (row?.format === 'plaintext' ? 'plaintext' : 'markdown') as CollaborationMessageFormat,
            mentions: Array.isArray(row?.mentions) && row.mentions.length > 0 ? row.mentions : undefined,
            reactions: Array.isArray(row?.reactions) && row.reactions.length > 0 ? row.reactions : undefined,
            parentMessageId: typeof row?.parentMessageId === 'string' ? row.parentMessageId : null,
            threadRootId: typeof row?.threadRootId === 'string' ? row.threadRootId : null,
            threadReplyCount: typeof row?.threadReplyCount === 'number' ? row.threadReplyCount : undefined,
            threadLastReplyAt:
              typeof row?.threadLastReplyAtMs === 'number' ? new Date(row.threadLastReplyAtMs).toISOString() : null,
          }))
          .filter((m) => m.id)
          .sort(
            (a: CollaborationMessage, b: CollaborationMessage) =>
              new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
          )

        const oldestRow = pageRows.length ? pageRows[pageRows.length - 1] : null
        const newCursor =
          hasMore && oldestRow && typeof oldestRow.createdAtMs === 'number'
            ? encodeTimestampIdCursor(
                new Date(oldestRow.createdAtMs).toISOString(),
                String(oldestRow.legacyId ?? '')
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

  useEffect(() => {
    if (!selectedChannelId) return

    setSenderSelection((current) => {
      if (current && channelParticipants.some((member) => member.name === current)) {
        return current
      }
      return channelParticipants[0]?.name ?? fallbackDisplayName
    })
  }, [selectedChannelId, channelParticipants, fallbackDisplayName])

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
    senderSelection,
    setSenderSelection,
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
    loadThreadReplies,
    loadMoreThreadReplies,
    clearThreadReplies,
    reactionPendingByMessage: reactionUpdatingByMessage,
  }
}
