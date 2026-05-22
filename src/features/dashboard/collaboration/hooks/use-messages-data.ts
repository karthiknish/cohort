'use client'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useConvex, useQuery } from 'convex/react'

import { usePreview } from '@/shared/contexts/preview-context'
import { collaborationApi } from '@/lib/convex-api'
import { getPreviewCollaborationMessages } from '@/lib/preview-data'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration'

import type { Channel } from '../types'
import { formatConversationSnippet } from '../lib/chat-text'
import { useChannelMessageSearch } from './use-channel-message-search'
import { useMessageActions } from './use-message-actions'
import { useRealtimeMessages, useRealtimeTyping } from './use-realtime'
import { useThreads } from './use-threads'
import { useTyping } from './use-typing'
import { useCollaborationExternalNotify } from './use-collaboration-external-notify'
import { useChannelMessageSend } from './use-channel-message-send'
import { useChannelMessagesQuery } from './use-channel-messages-query'
import { useChannelReadReceipts } from './use-channel-read-receipts'
import type { ChannelSummary, MessagesByChannelState, PendingAttachment } from './types'

type ChannelMessagesSlice = {
  messagesByChannel: MessagesByChannelState
  nextCursorByChannel: Record<string, string | null>
  loadingChannelId: string | null
  messagesError: string | null
}

function createInitialChannelMessagesSlice(): ChannelMessagesSlice {
  return {
    messagesByChannel: {},
    nextCursorByChannel: {},
    loadingChannelId: null,
    messagesError: null,
  }
}

interface UseMessagesDataOptions {
  workspaceId: string | null
  currentUserId: string | null
  selectedChannel: Channel | null
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
  channels,
  channelParticipants,
  fallbackDisplayName,
  fallbackRole,
  pendingAttachments,
  uploading,
  clearAttachments,
  uploadAttachments,
}: UseMessagesDataOptions) {
  const { isPreviewMode } = usePreview()
  const convex = useConvex()
  const [channelMessagesState, setChannelMessagesState] = useState<ChannelMessagesSlice>(
    createInitialChannelMessagesSlice,
  )
  const {
    messagesByChannel,
    nextCursorByChannel,
    loadingChannelId,
    messagesError,
  } = channelMessagesState
  const [loadingMoreChannelId, setLoadingMoreChannelId] = useState<string | null>(null)

  const setMessagesByChannel = useCallback(
    (action: React.SetStateAction<MessagesByChannelState>) => {
      setChannelMessagesState((prev) => ({
        ...prev,
        messagesByChannel:
          typeof action === 'function' ? action(prev.messagesByChannel) : action,
      }))
    },
    [],
  )

  const setNextCursorByChannel = useCallback(
    (action: React.SetStateAction<Record<string, string | null>>) => {
      setChannelMessagesState((prev) => ({
        ...prev,
        nextCursorByChannel:
          typeof action === 'function' ? action(prev.nextCursorByChannel) : action,
      }))
    },
    [],
  )

  const applyRealtimeChannelLoading = useCallback((channelId: string) => {
    setChannelMessagesState((prev) => ({
      ...prev,
      loadingChannelId: channelId,
      messagesError: null,
    }))
  }, [])

  const applyRealtimeChannelSuccess = useCallback(
    (
      channelId: string,
      messages: CollaborationMessage[],
      nextCursor: string | null,
    ) => {
      setChannelMessagesState((prev) => {
        const existing = prev.messagesByChannel[channelId] ?? []
        const serverMessageIds = new Set(messages.map((message) => message.id))
        const localOnlyMessages = existing.filter((message) => !serverMessageIds.has(message.id))
        const merged = [...messages, ...localOnlyMessages].sort(
          (a, b) =>
            new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
        )

        return {
          ...prev,
          messagesByChannel: {
            ...prev.messagesByChannel,
            [channelId]: merged,
          },
          nextCursorByChannel: {
            ...prev.nextCursorByChannel,
            [channelId]: nextCursor,
          },
          loadingChannelId: prev.loadingChannelId === channelId ? null : prev.loadingChannelId,
          messagesError: null,
        }
      })
    },
    [],
  )

  const applyRealtimeChannelError = useCallback((channelId: string, errorMessage: string) => {
    setChannelMessagesState((prev) => ({
      ...prev,
      loadingChannelId: prev.loadingChannelId === channelId ? null : prev.loadingChannelId,
      messagesError: errorMessage,
    }))
  }, [])

  const applyRealtimePreviewChannel = useCallback(
    (channelId: string, previewMessages: CollaborationMessage[]) => {
      setChannelMessagesState((prev) => {
        const existing = prev.messagesByChannel[channelId]
        const messagesByChannel = Array.isArray(existing)
          ? prev.messagesByChannel
          : {
              ...prev.messagesByChannel,
              [channelId]: previewMessages,
            }

        const nextCursorByChannel =
          prev.nextCursorByChannel[channelId] === null
            ? prev.nextCursorByChannel
            : {
                ...prev.nextCursorByChannel,
                [channelId]: null,
              }

        return {
          messagesByChannel,
          nextCursorByChannel,
          loadingChannelId: null,
          messagesError: null,
        }
      })
    },
    [],
  )
  const [channelListRetryNonce, setChannelListRetryNonce] = useState(0)
  const [messageInput, setMessageInputState] = useState('')
  const [messageSearchQuery, setMessageSearchQuery] = useState('')

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const previewReplyTimersRef = useRef<number[]>([])
  const lastRealtimeErrorToastKeyRef = useRef<string | null>(null)

  const unreadCountsResult = useQuery(
    collaborationApi.getUnreadCountsByChannel,
    !isPreviewMode && workspaceId && currentUserId
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
  const selectedChannelIdArg = selectedChannel?.isCustom ? selectedChannel.id : null

  const threadUnreadCountsResult = useQuery(
    collaborationApi.getThreadUnreadCounts,
    !isPreviewMode && workspaceId && currentUserId && selectedChannel && threadRootIdsForUnread.length > 0
      ? {
          workspaceId: String(workspaceId),
          channelId: selectedChannelIdArg,
          channelType: selectedChannel.type,
          clientId: selectedChannel.type === 'client' ? (selectedChannel.clientId ?? null) : null,
          projectId: selectedChannel.type === 'project' ? (selectedChannel.projectId ?? null) : null,
          threadRootIds: threadRootIdsForUnread,
          userId: String(currentUserId),
        }
      : 'skip'
  )

  useEffect(() => {
    if (!isPreviewMode || channels.length === 0) {
      return
    }

    setMessagesByChannel((prev) => {
      let changed = false
      const next = { ...prev }

      for (const channel of channels) {
        if (Array.isArray(next[channel.id])) {
          continue
        }

        next[channel.id] = getPreviewCollaborationMessages(
          channel.type,
          channel.clientId ?? null,
          channel.projectId ?? null,
          currentUserId,
        )
        changed = true
      }

      return changed ? next : prev
    })

    setNextCursorByChannel((prev) => {
      let changed = false
      const next = { ...prev }

      for (const channel of channels) {
        if (next[channel.id] === null) {
          continue
        }

        next[channel.id] = null
        changed = true
      }

      return changed ? next : prev
    })
  }, [channels, currentUserId, isPreviewMode])

  useEffect(() => {
    return () => {
      previewReplyTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
      previewReplyTimersRef.current = []
    }
  }, [])

  const participantNameMap = useMemo(
    () => new Map(channelParticipants.map((participant) => [participant.name.toLowerCase(), participant])),
    [channelParticipants]
  )

  const {
    normalizedMessageSearch,
    visibleMessages,
    searchingMessages,
    searchHighlights,
    searchError,
    retrySearch,
  } = useChannelMessageSearch({
    convex,
    workspaceId,
    selectedChannel,
    channelMessages,
    messagesByChannel,
    messageSearchQuery,
    isPreviewMode,
  })

  const isSearchActive = Boolean(normalizedMessageSearch)
  const activeMessagesError = isSearchActive ? searchError : messagesError

  const retryMessagesError = useCallback(() => {
    if (isSearchActive) {
      retrySearch()
      return
    }

    if (selectedChannel) {
      applyRealtimeChannelLoading(selectedChannel.id)
    } else {
      setChannelMessagesState((prev) => ({ ...prev, messagesError: null }))
    }
    setChannelListRetryNonce((n) => n + 1)
  }, [applyRealtimeChannelLoading, isSearchActive, retrySearch, selectedChannel])

  useEffect(() => {
    setChannelListRetryNonce(0)
  }, [selectedChannel?.id])
  const channelUnreadCounts = useMemo(() => {
    if (isPreviewMode) {
      return Object.fromEntries(
        channels.map((channel) => {
          const unreadCount = (messagesByChannel[channel.id] ?? []).filter((message) => {
            if (message.isDeleted || message.parentMessageId) return false
            if (!currentUserId) return false
            if (message.senderId === currentUserId) return false

            const readBy = Array.isArray(message.readBy) ? message.readBy : []
            return !readBy.includes(currentUserId)
          }).length

          return [channel.id, unreadCount]
        })
      )
    }

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
  }, [channels, currentUserId, isPreviewMode, messagesByChannel, unreadCountsResult])
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

  const channelSummaries = useMemo<Map<string, ChannelSummary>>(() => {
    const result = new Map<string, ChannelSummary>()
    Object.entries(messagesByChannel).forEach(([channelId, list]) => {
      if (list && list.length > 0) {
        const last = list[list.length - 1]
        if (last) {
          result.set(channelId, {
            lastMessage: formatConversationSnippet(last.content ?? '', 160),
            lastTimestamp: last.createdAt,
          })
        }
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
    mutateThreadMessageById,
  } = useThreads({ workspaceId, currentUserId })

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
    isPreviewMode,
    channels,
    channelParticipants,
    mutateChannelMessages,
    mutateThreadMessageById,
  })

  const handleRealtimeMessagesError = useCallback(
    (channel: Channel, errorMessage: string) => {
      const toastKey = `${channel.id}:${channelListRetryNonce}:${errorMessage}`
      if (lastRealtimeErrorToastKeyRef.current === toastKey) {
        return
      }

      lastRealtimeErrorToastKeyRef.current = toastKey
      notifyFailure({
        title: 'Unable to load messages',
        message: '${channel.name}: ${errorMessage}',
      })
    },
    [channelListRetryNonce],
  )

  useRealtimeMessages({
    workspaceId,
    selectedChannel,
    currentUserId,
    channelListRetryNonce,
    applyRealtimeChannelLoading,
    applyRealtimeChannelSuccess,
    applyRealtimeChannelError,
    applyRealtimePreviewChannel,
    onError: handleRealtimeMessagesError,
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

  const { markChannelRead, markChannelReadPending, markThreadAsRead } = useChannelReadReceipts({
    workspaceId,
    currentUserId,
    selectedChannel,
    channelMessages,
    isPreviewMode,
    mutateChannelMessages,
  })

  const { sendCollaborationEmailCopy } = useCollaborationExternalNotify()

  const { handleSendMessage, sending, isSendDisabled } = useChannelMessageSend({
    workspaceId,
    currentUserId,
    selectedChannel,
    channels,
    channelMessages,
    channelParticipants,
    fallbackDisplayName,
    fallbackRole,
    messageInput,
    setMessageInput: setMessageInputState,
    pendingAttachments,
    uploading,
    clearAttachments,
    uploadAttachments,
    isPreviewMode,
    stopTyping,
    mutateChannelMessages,
    addThreadReplyToState,
    sendToExternalPlatforms: sendCollaborationEmailCopy,
  })

  const { handleLoadMore } = useChannelMessagesQuery({
    convex,
    workspaceId,
    channels,
    isPreviewMode,
    nextCursorByChannel,
    setLoadingMoreChannelId,
    mutateChannelMessages,
    setNextCursorByChannel,
  })

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
    retryMessagesError,
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
    markThreadAsRead,
    clearThreadReplies,
    reactionPendingByMessage: reactionUpdatingByMessage,
    channelUnreadCounts,
    markChannelRead,
    markChannelReadPending,
  }
}
