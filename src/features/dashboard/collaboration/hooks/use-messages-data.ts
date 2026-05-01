'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useConvex, useMutation, useQuery } from 'convex/react'
import { v4 as uuidv4 } from 'uuid'

import { useToast } from '@/shared/ui/use-toast'
import { usePreview } from '@/shared/contexts/preview-context'
import { api, collaborationApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { decodeTimestampIdCursor, encodeTimestampIdCursor } from '@/lib/pagination'
import { getPreviewCollaborationAutoReply, getPreviewCollaborationMessages } from '@/lib/preview-data'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration'

import type { Channel } from '../types'
import { extractMentionsFromContent } from '../utils/mentions'
import { mapCollaborationMessageRow, previewPendingAttachmentToCollaborationAttachment } from './message-mappers'
import { useChannelMessageSearch } from './use-channel-message-search'
import { useMessageActions } from './use-message-actions'
import { useRealtimeMessages, useRealtimeTyping } from './use-realtime'
import { useThreads } from './use-threads'
import { useTyping } from './use-typing'
import type { ChannelSummary, MessagesByChannelState, PendingAttachment, SendMessageOptions } from './types'

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
  const { toast } = useToast()
  const { isPreviewMode } = usePreview()
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
  const [channelListRetryNonce, setChannelListRetryNonce] = useState(0)
  const [messageInput, setMessageInputState] = useState('')
  const [sending, setSending] = useState(false)
  const [markChannelReadPending, setMarkChannelReadPending] = useState(false)
  const [messageSearchQuery, setMessageSearchQuery] = useState('')

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const lastMarkedMessageByChannelRef = useRef<Record<string, string>>({})
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

    setMessagesError(null)
    if (selectedChannel) {
      setLoadingChannelId(selectedChannel.id)
    }
    setChannelListRetryNonce((n) => n + 1)
  }, [isSearchActive, retrySearch, selectedChannel])

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
          result.set(channelId, { lastMessage: last.content, lastTimestamp: last.createdAt })
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
      toast({
        title: 'Unable to load messages',
        description: `${channel.name}: ${errorMessage}`,
        variant: 'destructive',
      })
    },
    [channelListRetryNonce, toast],
  )

  useRealtimeMessages({
    workspaceId,
    selectedChannel,
    currentUserId,
    channelListRetryNonce,
    setMessagesByChannel,
    setNextCursorByChannel,
    setLoadingChannelId,
    setMessagesError,
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

  const handleMarkSelectedChannelAsRead = useCallback(
    async (options?: { force?: boolean }): Promise<boolean> => {
      const force = Boolean(options?.force)
      if (!currentUserId || !selectedChannel || (!isPreviewMode && !workspaceId)) {
        return false
      }

      const markPreviewLoadedMessagesRead = () => {
        mutateChannelMessages(selectedChannel.id, (messages) =>
          messages.map((message) => {
            if (message.isDeleted || message.senderId === currentUserId) {
              return message
            }

            const readBy = Array.isArray(message.readBy) ? message.readBy : []
            if (readBy.includes(currentUserId)) {
              return message
            }

            return {
              ...message,
              readBy: [...readBy, currentUserId],
            }
          }),
        )
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
        if (!force) {
          return false
        }

        try {
          if (isPreviewMode) {
            markPreviewLoadedMessagesRead()
            lastMarkedMessageByChannelRef.current[selectedChannel.id] = '__all__'
            return true
          }

          await markChannelAsRead({
            workspaceId: String(workspaceId),
            channelId: selectedChannel.isCustom ? selectedChannel.id : null,
            channelType: selectedChannel.type,
            clientId: selectedChannel.type === 'client' ? (selectedChannel.clientId ?? null) : null,
            projectId: selectedChannel.type === 'project' ? (selectedChannel.projectId ?? null) : null,
            userId: String(currentUserId),
          })
          lastMarkedMessageByChannelRef.current[selectedChannel.id] = '__all__'
          return true
        } catch (error) {
          logError(error, 'useCollaborationData:handleMarkSelectedChannelAsRead')
          if (force) {
            throw error
          }
          return false
        }
      }

      const alreadyMarked = lastMarkedMessageByChannelRef.current[selectedChannel.id]
      if (!force && alreadyMarked === latestUnread.id) {
        return false
      }

      const createdAtMs = latestUnread.createdAt ? Date.parse(latestUnread.createdAt) : NaN

      try {
        if (isPreviewMode) {
          markPreviewLoadedMessagesRead()
          lastMarkedMessageByChannelRef.current[selectedChannel.id] = latestUnread.id
          return true
        }

        await markChannelAsRead({
          workspaceId: String(workspaceId),
          channelId: selectedChannel.isCustom ? selectedChannel.id : null,
          channelType: selectedChannel.type,
          clientId: selectedChannel.type === 'client' ? (selectedChannel.clientId ?? null) : null,
          projectId: selectedChannel.type === 'project' ? (selectedChannel.projectId ?? null) : null,
          userId: String(currentUserId),
          beforeMs: Number.isFinite(createdAtMs) ? createdAtMs : undefined,
        })

        lastMarkedMessageByChannelRef.current[selectedChannel.id] = latestUnread.id
        return true
      } catch (error) {
        logError(error, 'useCollaborationData:handleMarkSelectedChannelAsRead')
        if (force) {
          throw error
        }
        return false
      }
    },
    [channelMessages, currentUserId, isPreviewMode, markChannelAsRead, mutateChannelMessages, selectedChannel, workspaceId],
  )

  const markChannelRead = useCallback(async () => {
    setMarkChannelReadPending(true)
    try {
      const didMark = await handleMarkSelectedChannelAsRead({ force: true })
      if (didMark) {
        toast({ title: 'Marked as read', description: 'Channel read state updated for you.' })
      }
    } catch (error) {
      logError(error, 'useMessagesData:markChannelRead')
      toast({
        title: 'Could not mark read',
        description: asErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setMarkChannelReadPending(false)
    }
  }, [handleMarkSelectedChannelAsRead, toast])

  const handleMarkThreadAsRead = useCallback(
    async (threadRootId: string, beforeMs?: number) => {
      if (!currentUserId || !selectedChannel || (!isPreviewMode && !workspaceId)) {
        return
      }

      const normalizedThreadRootId = typeof threadRootId === 'string' ? threadRootId.trim() : ''
      if (!normalizedThreadRootId) {
        return
      }

      try {
        if (isPreviewMode) {
          return
        }

        await markThreadAsReadMutation({
          workspaceId: String(workspaceId),
          channelId: selectedChannel.isCustom ? selectedChannel.id : null,
          channelType: selectedChannel.type,
          clientId: selectedChannel.type === 'client' ? (selectedChannel.clientId ?? null) : null,
          projectId: selectedChannel.type === 'project' ? (selectedChannel.projectId ?? null) : null,
          threadRootId: normalizedThreadRootId,
          userId: String(currentUserId),
          beforeMs,
        })
      } catch (error) {
        logError(error, 'useCollaborationData:handleMarkThreadAsRead')
        toast({
          title: 'Could not mark thread read',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      }
    },
    [currentUserId, isPreviewMode, markThreadAsReadMutation, selectedChannel, toast, workspaceId],
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
  }, [handleMarkSelectedChannelAsRead, selectedChannel])

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
            const detail =
              typeof response.status === 'number' ? `Server returned ${response.status}.` : 'Request failed.'
            toast({
              title: 'Email collaboration copy failed',
              description: detail,
              variant: 'destructive',
            })
            return
          }

          try {
            await updateSharedTo({
              workspaceId: wsId,
              legacyId: message.id,
              sharedTo: ['email'],
            })
          } catch (error) {
            logError(error, 'useCollaborationData:sendToExternalPlatforms:updateSharedTo')
            toast({
              title: 'Could not tag message as emailed',
              description: asErrorMessage(error),
              variant: 'destructive',
            })
          }
        } catch (error) {
          logError(error, 'useCollaborationData:sendToExternalPlatforms:email')
          toast({
            title: 'Email collaboration copy failed',
            description: asErrorMessage(error),
            variant: 'destructive',
          })
        }
      } catch (error) {
        logError(error, 'useCollaborationData:sendToExternalPlatforms')
        toast({
          title: 'Collaboration email unavailable',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      }
    },
    [convex, toast, updateSharedTo]
  )

  const isSendDisabled = useMemo(() => {
    if (sending || uploading) return true
    const hasContent = messageInput.trim().length > 0
    const hasAttachments = pendingAttachments.length > 0
    return !hasContent && !hasAttachments
  }, [messageInput, pendingAttachments.length, sending, uploading])

  const schedulePreviewAutoReply = useCallback((params: {
    channelId: string
    channelType: Channel['type']
    clientId: string | null
    projectId: string | null
    content: string
    parentMessageId?: string | null
    threadRootId?: string | null
  }) => {
    if (typeof window === 'undefined') return

    const timerId = window.setTimeout(() => {
      previewReplyTimersRef.current = previewReplyTimersRef.current.filter((id) => id !== timerId)

      const reply = getPreviewCollaborationAutoReply({
        channelType: params.channelType,
        clientId: params.clientId,
        projectId: params.projectId,
        content: params.content,
        viewerId: currentUserId,
        parentMessageId: params.parentMessageId ?? null,
        threadRootId: params.threadRootId ?? null,
      })

      mutateChannelMessages(params.channelId, (messages) => {
        if (reply.parentMessageId && reply.threadRootId) {
          return messages.map((message) => {
            if (message.id !== reply.threadRootId) {
              return message
            }

            return {
              ...message,
              threadReplyCount: (message.threadReplyCount ?? 0) + 1,
              threadLastReplyAt: reply.createdAt,
            }
          })
        }

        return [...messages, reply]
      })

      if (reply.threadRootId) {
        addThreadReplyToState(reply.threadRootId, reply)
      }
    }, 900)

    previewReplyTimersRef.current.push(timerId)
  }, [addThreadReplyToState, currentUserId, mutateChannelMessages])

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

        const senderDetails = resolveSenderDetails()
        const uploadedAttachments = isPreviewMode
          ? pendingAttachments.map(previewPendingAttachmentToCollaborationAttachment)
          : await uploadAttachments(pendingAttachments)

        const mentionMatches = extractMentionsFromContent(trimmedContent)
        const mentionMetadata = mentionMatches.map((mention) => {
          const participant = participantNameMap.get(mention.name.toLowerCase())
          return { slug: mention.slug, name: participant?.name ?? mention.name, role: participant?.role ?? null }
        })

        if (!currentUserId || (!isPreviewMode && !workspaceId)) {
          return
        }

        const parentMessage = options?.parentMessageId
          ? channelMessages.find((message) => message.id === options.parentMessageId)
          : null
        const resolvedThreadRootId = options?.parentMessageId
          ? (parentMessage?.threadRootId || parentMessage?.id || options.parentMessageId)
          : null

        if (isPreviewMode) {
          const messageId = uuidv4()
          const createdMessage: CollaborationMessage = {
            id: messageId,
            channelType: selectedChannel.type,
            clientId: selectedChannel.clientId ?? null,
            projectId: selectedChannel.projectId ?? null,
            senderId: String(currentUserId),
            senderName: senderDetails.senderName,
            senderRole: senderDetails.senderRole,
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
            threadReplyCount: undefined,
            threadLastReplyAt: null,
          }

          mutateChannelMessages(channelId, (messages) => {
            if (createdMessage.parentMessageId) {
              return messages.map((message) => {
                if (message.id !== resolvedThreadRootId) {
                  return message
                }

                return {
                  ...message,
                  threadReplyCount: (message.threadReplyCount ?? 0) + 1,
                  threadLastReplyAt: createdMessage.createdAt,
                }
              })
            }

            return [...messages, createdMessage]
          })

          if (resolvedThreadRootId) {
            addThreadReplyToState(resolvedThreadRootId, createdMessage)
          }

          schedulePreviewAutoReply({
            channelId,
            channelType: selectedChannel.type,
            clientId: selectedChannel.clientId ?? null,
            projectId: selectedChannel.projectId ?? null,
            content: trimmedContent,
            parentMessageId: options?.parentMessageId ? createdMessage.id : null,
            threadRootId: resolvedThreadRootId,
          })

          clearAttachments()
          setMessageInputState('')
          toast({ title: 'Preview message sent', description: 'This only updates the sample collaboration feed.' })
          return
        }

        const messageId = uuidv4()
        await createMessage({
          workspaceId: String(workspaceId),
          legacyId: messageId,
          channelId: selectedChannel.isCustom ? selectedChannel.id : null,
          channelType: selectedChannel.type,
          clientId: selectedChannel.clientId ?? null,
          projectId: selectedChannel.projectId ?? null,
          senderId: String(currentUserId),
          senderName: senderDetails.senderName,
          senderRole: senderDetails.senderRole,
          content: trimmedContent,
          attachments: (uploadedAttachments as CollaborationAttachment[]) ?? [],
          format: 'markdown',
          mentions: mentionMetadata,
          parentMessageId: options?.parentMessageId ?? null,
          threadRootId: resolvedThreadRootId,
          isThreadRoot: !options?.parentMessageId,
        })

        const createdRow = await convex.query(collaborationApi.getByLegacyId, {
          workspaceId: String(workspaceId),
          legacyId: messageId,
        })

        const createdMessage = createdRow
          ? mapCollaborationMessageRow(createdRow, {
              fallbackChannelType: selectedChannel.type,
              fallbackClientId: selectedChannel.clientId ?? null,
              fallbackProjectId: selectedChannel.projectId ?? null,
              fallbackSenderId: String(currentUserId),
              fallbackSenderName: senderDetails.senderName,
              fallbackSenderRole: senderDetails.senderRole,
              fallbackThreadRootId: resolvedThreadRootId,
              fallbackCreatedAtIso: new Date().toISOString(),
            })
          : null

        const safeCreatedMessage: CollaborationMessage = createdMessage ?? {
              id: messageId,
              channelType: selectedChannel.type,
              clientId: selectedChannel.clientId ?? null,
              projectId: selectedChannel.projectId ?? null,
              senderId: String(currentUserId),
              senderName: senderDetails.senderName,
              senderRole: senderDetails.senderRole,
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
          if (messages.some((m) => m.id === safeCreatedMessage.id)) return messages
          return [...messages, safeCreatedMessage]
        })

        // Also add to thread replies if this is a reply
        if (resolvedThreadRootId) {
          addThreadReplyToState(resolvedThreadRootId, safeCreatedMessage)
        }

        clearAttachments()
        setMessageInputState('')

        // Send to external platforms based on notification preferences
        if (workspaceId) {
          void sendToExternalPlatforms(safeCreatedMessage, workspaceId)
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
      isPreviewMode,
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
      schedulePreviewAutoReply,
    ]
  )

  const handleLoadMore = useCallback(
    async (channelId: string) => {
      if (isPreviewMode) {
        return
      }

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
          channelId: channel.isCustom ? channel.id : null,
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
          .map((row) => mapCollaborationMessageRow(row, { fallbackChannelType: channel.type }))
          .filter((message): message is CollaborationMessage => Boolean(message))
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
    [channels, convex, isPreviewMode, mutateChannelMessages, nextCursorByChannel, toast, workspaceId]
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
    markThreadAsRead: handleMarkThreadAsRead,
    clearThreadReplies,
    reactionPendingByMessage: reactionUpdatingByMessage,
    channelUnreadCounts,
    markChannelRead,
    markChannelReadPending,
  }
}
