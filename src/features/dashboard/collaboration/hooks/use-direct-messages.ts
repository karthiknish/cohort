'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useConvex, useMutation, useQuery } from 'convex/react'

import { usePreview } from '@/shared/contexts/preview-context'
import { api, directMessagesApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { getPreviewDirectAutoReply, getPreviewDirectConversations, getPreviewDirectMessages } from '@/lib/preview-data'
import type { DirectConversation, DirectMessage } from '@/types/collaboration'
import { MESSAGE_PAGE_SIZE } from './constants'
import { filterDirectMessagesForSearch, parseDirectMessageSearchQuery } from './direct-message-search'

export type { DirectConversation, DirectMessage }

export type UseDirectMessagesOptions = {
  workspaceId: string | null
  currentUserId: string | null
  currentUserName?: string | null
  currentUserRole?: string | null
}

export type UseDirectMessagesReturn = {
  conversations: DirectConversation[]
  selectedConversation: DirectConversation | null
  selectConversation: (conversation: DirectConversation | null) => void
  isLoadingConversations: boolean
  messages: DirectMessage[]
  visibleMessages: DirectMessage[]
  isLoadingMessages: boolean
  isLoadingMore: boolean
  loadMoreMessages: () => void
  hasMoreMessages: boolean
  messageSearchQuery: string
  setMessageSearchQuery: (value: string) => void
  searchHighlights: string[]
  searchingMessages: boolean
  messagesError: string | null
  retryMessagesError: () => void
  sendMessage: (content: string, attachments?: DirectMessage['attachments']) => Promise<void>
  isSending: boolean
  markAsRead: () => Promise<void>
  editMessage: (messageLegacyId: string, newContent: string) => Promise<void>
  deleteMessage: (messageLegacyId: string) => Promise<void>
  toggleReaction: (messageLegacyId: string, emoji: string) => Promise<void>
  archiveConversation: (archived: boolean) => Promise<void>
  muteConversation: (muted: boolean) => Promise<void>
  getOrCreateConversation: (otherUserId: string, otherUserName: string, otherUserRole?: string | null) => Promise<{ legacyId: string; isNew: boolean }>
  unreadCount: number
  startNewDM: (user: { id: string; name: string; role?: string | null }) => Promise<void>
}

type MessageCursor = {
  fieldValue: number | string
  legacyId: string
} | null

type DirectMessageRow = Omit<DirectMessage, 'id'> & {
  _id: string
}

type DirectConversationRow = Omit<DirectConversation, 'id'> & {
  _id: string
}

type DirectMessagesQueryResult = {
  items: DirectMessageRow[]
  nextCursor: MessageCursor
}

export function useDirectMessages({
  workspaceId,
  currentUserId,
  currentUserName,
  currentUserRole,
}: UseDirectMessagesOptions): UseDirectMessagesReturn {
  const { isPreviewMode } = usePreview()
  const convex = useConvex()
  const [selectedConversation, setSelectedConversation] = useState<DirectConversation | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [messageCursor, setMessageCursor] = useState<MessageCursor>(null)
  const [allMessages, setAllMessages] = useState<DirectMessage[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [messageSearchQuery, setMessageSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DirectMessage[]>([])
  const [searchHighlights, setSearchHighlights] = useState<string[]>([])
  const [searchingMessages, setSearchingMessages] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchRetryNonce, setSearchRetryNonce] = useState(0)
  const [previewConversations, setPreviewConversations] = useState<DirectConversation[]>([])
  const [previewMessagesByConversation, setPreviewMessagesByConversation] = useState<Record<string, DirectMessage[]>>({})
  const previewReplyTimersRef = useRef<number[]>([])

  const conversationsQuery = useQuery(
    api.directMessages.listConversations,
    !isPreviewMode && workspaceId ? { workspaceId, includeArchived: false } : 'skip'
  )

  const unreadCountQuery = useQuery(
    api.directMessages.getUnreadCount,
    !isPreviewMode && workspaceId ? { workspaceId } : 'skip'
  )

  const messagesQuery = useQuery(
    api.directMessages.listMessages,
    !isPreviewMode && selectedConversation && workspaceId
      ? { workspaceId, conversationLegacyId: selectedConversation.legacyId, cursor: messageCursor, limit: MESSAGE_PAGE_SIZE }
      : 'skip'
  )

  const typedMessagesQuery = messagesQuery as DirectMessagesQueryResult | undefined
  const conversationRows = useMemo(
    () => (conversationsQuery ?? []) as DirectConversationRow[],
    [conversationsQuery]
  )
  const selectedConversationLegacyId = selectedConversation?.legacyId ?? null
  const normalizedMessageSearch = messageSearchQuery.trim()

  useEffect(() => {
    return () => {
      previewReplyTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
      previewReplyTimersRef.current = []
    }
  }, [])

  useEffect(() => {
    if (!isPreviewMode) {
      return
    }

    const previewSelf = {
      id: currentUserId,
      name: currentUserName,
      role: currentUserRole,
    }
    const conversations = getPreviewDirectConversations(previewSelf)
    const messagesByConversation = Object.fromEntries(
      conversations.map((conversation) => [
        conversation.legacyId,
        getPreviewDirectMessages(conversation.legacyId, previewSelf),
      ])
    ) as Record<string, DirectMessage[]>

    setPreviewConversations(conversations)
    setPreviewMessagesByConversation(messagesByConversation)
    setHasMore(false)
    setIsLoadingMore(false)
    setMessageCursor(null)
    setAllMessages([])
  }, [currentUserId, currentUserName, currentUserRole, isPreviewMode])

  useEffect(() => {
    if (isPreviewMode) {
      return
    }

    if (typedMessagesQuery) {
      const newMessages = (typedMessagesQuery.items ?? []).map((m) => ({
        id: m._id,
        legacyId: m.legacyId,
        senderId: m.senderId,
        senderName: m.senderName,
        senderRole: m.senderRole,
        content: m.content,
        edited: m.edited,
        editedAtMs: m.editedAtMs,
        deleted: m.deleted,
        deletedAtMs: m.deletedAtMs,
        deletedBy: m.deletedBy,
        attachments: m.attachments,
        reactions: m.reactions,
        readBy: m.readBy,
        deliveredTo: m.deliveredTo,
        readAtMs: m.readAtMs,
        sharedTo: m.sharedTo,
        createdAtMs: m.createdAtMs,
        updatedAtMs: m.updatedAtMs,
      }))
      
      setAllMessages(prev => {
        const byLegacyId = new Map(prev.map(m => [m.legacyId, m]))
        
        if (isLoadingMore && messageCursor) {
          for (const msg of newMessages) {
            if (!byLegacyId.has(msg.legacyId)) {
              byLegacyId.set(msg.legacyId, msg)
            }
          }
          setIsLoadingMore(false)
        } else {
          byLegacyId.clear()
          for (const msg of newMessages) {
            byLegacyId.set(msg.legacyId, msg)
          }
        }
        
        return Array.from(byLegacyId.values())
          .sort((a, b) => b.createdAtMs - a.createdAtMs)
      })
      
      setHasMore(!!typedMessagesQuery.nextCursor)
    }
  }, [typedMessagesQuery, isLoadingMore, isPreviewMode, messageCursor])

  useEffect(() => {
    setMessageCursor(null)
    setAllMessages([])
    setHasMore(!isPreviewMode)
    setIsLoadingMore(false)
    if (selectedConversationLegacyId === null) {
      return
    }
  }, [isPreviewMode, selectedConversationLegacyId])

  useEffect(() => {
    setSelectedConversation((previous) => {
      if (!previous) {
        return previous
      }

      const pool = isPreviewMode
        ? previewConversations
        : conversationRows.map((c) => ({
            id: c._id,
            legacyId: c.legacyId,
            otherParticipantId: c.otherParticipantId,
            otherParticipantName: c.otherParticipantName,
            otherParticipantRole: c.otherParticipantRole,
            lastMessageSnippet: c.lastMessageSnippet,
            lastMessageAtMs: c.lastMessageAtMs,
            lastMessageSenderId: c.lastMessageSenderId,
            isRead: c.isRead,
            isArchived: c.isArchived,
            isMuted: c.isMuted,
            createdAtMs: c.createdAtMs,
            updatedAtMs: c.updatedAtMs,
          }))
      const next = pool.find((conversation) => conversation.legacyId === previous.legacyId) ?? null
      return next
    })
  }, [conversationRows, isPreviewMode, previewConversations])

  useEffect(() => {
    if (!isPreviewMode) {
      return
    }

    const previewUserId = currentUserId ?? 'preview-current-user'

    setPreviewConversations((prev) =>
      [...prev]
        .map((conversation) => {
          const messages = previewMessagesByConversation[conversation.legacyId] ?? []
          const lastMessage = [...messages].sort((a, b) => b.createdAtMs - a.createdAtMs)[0] ?? null
          const isRead = !messages.some(
            (message) => message.senderId !== previewUserId && !message.readBy.includes(previewUserId)
          )

          return {
            ...conversation,
            lastMessageSnippet: lastMessage?.deleted ? 'Message deleted' : (lastMessage?.content ?? null),
            lastMessageAtMs: lastMessage?.createdAtMs ?? conversation.lastMessageAtMs,
            lastMessageSenderId: lastMessage?.senderId ?? conversation.lastMessageSenderId,
            isRead,
            updatedAtMs: lastMessage?.updatedAtMs ?? conversation.updatedAtMs,
          }
        })
        .sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0))
    )
  }, [currentUserId, isPreviewMode, previewMessagesByConversation])

  const getOrCreateConversationMutation = useMutation(api.directMessages.getOrCreateConversation)
  const sendMessageMutation = useMutation(api.directMessages.sendMessage)
  const markAsReadMutation = useMutation(api.directMessages.markAsRead)
  const editMessageMutation = useMutation(api.directMessages.editMessage)
  const deleteMessageMutation = useMutation(api.directMessages.deleteMessage)
  const toggleReactionMutation = useMutation(api.directMessages.toggleReaction)
  const setArchiveStatusMutation = useMutation(api.directMessages.setArchiveStatus)
  const setMuteStatusMutation = useMutation(api.directMessages.setMuteStatus)

  const liveConversations: DirectConversation[] = conversationRows
    .map((c) => ({
      id: c._id,
      legacyId: c.legacyId,
      otherParticipantId: c.otherParticipantId,
      otherParticipantName: c.otherParticipantName,
      otherParticipantRole: c.otherParticipantRole,
      lastMessageSnippet: c.lastMessageSnippet,
      lastMessageAtMs: c.lastMessageAtMs,
      lastMessageSenderId: c.lastMessageSenderId,
      isRead: c.isRead,
      isArchived: c.isArchived,
      isMuted: c.isMuted,
      createdAtMs: c.createdAtMs,
      updatedAtMs: c.updatedAtMs,
    }))
    .sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0))

  const conversations = isPreviewMode ? previewConversations : liveConversations
  const currentMessages = useMemo(
    () => (isPreviewMode
      ? (selectedConversation ? previewMessagesByConversation[selectedConversation.legacyId] ?? [] : [])
      : allMessages),
    [allMessages, isPreviewMode, previewMessagesByConversation, selectedConversation],
  )
  const visibleMessages = useMemo(() => {
    return normalizedMessageSearch ? searchResults : currentMessages
  }, [currentMessages, normalizedMessageSearch, searchResults])

  const retryDirectMessageSearch = useCallback(() => {
    setSearchRetryNonce((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!selectedConversation || !normalizedMessageSearch) {
      setSearchResults([])
      setSearchHighlights([])
      setSearchingMessages(false)
      setSearchError(null)
      return
    }

    const parsed = parseDirectMessageSearchQuery(normalizedMessageSearch)
    setSearchingMessages(true)
    setSearchError(null)

    if (isPreviewMode) {
      const previewMessages = previewMessagesByConversation[selectedConversation.legacyId] ?? []
      setSearchResults(filterDirectMessagesForSearch(previewMessages, parsed))
      setSearchHighlights(parsed.highlights)
      setSearchingMessages(false)
      return
    }

    if (!workspaceId) {
      setSearchResults([])
      setSearchHighlights(parsed.highlights)
      setSearchingMessages(false)
      return
    }

    const startMs = parsed.start ? Date.parse(parsed.start) : NaN
    const endMs = parsed.end ? Date.parse(parsed.end) : NaN
    let cancelled = false

    void convex
      .query(directMessagesApi.searchMessages, {
        workspaceId: String(workspaceId),
        conversationLegacyId: selectedConversation.legacyId,
        q: parsed.q || null,
        sender: parsed.sender ?? null,
        attachment: parsed.attachment ?? null,
        startMs: Number.isFinite(startMs) ? startMs : null,
        endMs: Number.isFinite(endMs) ? endMs : null,
        limit: 200,
      })
      .then((payload: { rows?: unknown[]; highlights?: unknown[] }) => {
        if (cancelled) return

        const rows = Array.isArray(payload?.rows) ? payload.rows : []
        const highlights = Array.isArray(payload?.highlights)
          ? payload.highlights.filter((entry): entry is string => typeof entry === 'string')
          : parsed.highlights

        const mapped = rows
          .map((row: unknown) => {
            const item = (row ?? {}) as Record<string, unknown>
            return {
              id: String(item._id ?? ''),
              legacyId: String(item.legacyId ?? ''),
              senderId: String(item.senderId ?? ''),
              senderName: typeof item.senderName === 'string' ? item.senderName : 'Unknown teammate',
              senderRole: typeof item.senderRole === 'string' ? item.senderRole : null,
              content: typeof item.content === 'string' ? item.content : '',
              edited: Boolean(item.edited),
              editedAtMs: typeof item.editedAtMs === 'number' ? item.editedAtMs : null,
              deleted: Boolean(item.deleted),
              deletedAtMs: typeof item.deletedAtMs === 'number' ? item.deletedAtMs : null,
              deletedBy: typeof item.deletedBy === 'string' ? item.deletedBy : null,
              attachments: Array.isArray(item.attachments) ? item.attachments as DirectMessage['attachments'] : null,
              reactions: Array.isArray(item.reactions) ? item.reactions as DirectMessage['reactions'] : null,
              readBy: Array.isArray(item.readBy) ? item.readBy.filter((value): value is string => typeof value === 'string') : [],
              deliveredTo: Array.isArray(item.deliveredTo) ? item.deliveredTo.filter((value): value is string => typeof value === 'string') : [],
              readAtMs: typeof item.readAtMs === 'number' ? item.readAtMs : null,
              sharedTo: Array.isArray(item.sharedTo) ? item.sharedTo.filter((value): value is 'email' => value === 'email') : null,
              createdAtMs: typeof item.createdAtMs === 'number' ? item.createdAtMs : 0,
              updatedAtMs: typeof item.updatedAtMs === 'number' ? item.updatedAtMs : 0,
            } satisfies DirectMessage
          })
          .filter((message) => message.legacyId)
          .sort((a, b) => b.createdAtMs - a.createdAtMs)

        setSearchResults(mapped)
        setSearchHighlights(highlights)
        setSearchError(null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        logError(error, 'useDirectMessages:searchMessages')
        setSearchError(asErrorMessage(error))
        setSearchResults([])
        setSearchHighlights(parsed.highlights)
      })
      .finally(() => {
        if (!cancelled) {
          setSearchingMessages(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [convex, isPreviewMode, normalizedMessageSearch, previewMessagesByConversation, searchRetryNonce, selectedConversation, workspaceId])

  const selectConversation = useCallback((conversation: DirectConversation | null) => {
    setSelectedConversation(conversation)
  }, [])

  const loadMoreMessages = useCallback(() => {
    if (isPreviewMode) {
      return
    }

    if (typedMessagesQuery?.nextCursor && hasMore && !isLoadingMore) {
      setIsLoadingMore(true)
      setMessageCursor(typedMessagesQuery.nextCursor)
    }
  }, [typedMessagesQuery, hasMore, isLoadingMore, isPreviewMode])

  const getOrCreateConversation = useCallback(
    async (otherUserId: string, otherUserName: string, otherUserRole?: string | null) => {
      if (isPreviewMode) {
        const existingConversation = previewConversations.find(
          (conversation) => conversation.otherParticipantId === otherUserId
        )

        if (existingConversation) {
          return { legacyId: existingConversation.legacyId, isNew: false }
        }

        const legacyId = `preview-dm-${otherUserId}-${Date.now()}`
        const newConversation: DirectConversation = {
          id: legacyId,
          legacyId,
          otherParticipantId: otherUserId,
          otherParticipantName: otherUserName,
          otherParticipantRole: otherUserRole ?? null,
          lastMessageSnippet: null,
          lastMessageAtMs: null,
          lastMessageSenderId: null,
          isRead: true,
          isArchived: false,
          isMuted: false,
          createdAtMs: Date.now(),
          updatedAtMs: Date.now(),
        }

        setPreviewConversations((prev) => [newConversation, ...prev])
        setPreviewMessagesByConversation((prev) => ({
          ...prev,
          [legacyId]: [],
        }))
        return { legacyId, isNew: true }
      }

      if (!workspaceId) throw new Error('No workspace selected')
      
      const result = await getOrCreateConversationMutation({
        workspaceId: String(workspaceId),
        otherUserId,
        otherUserName,
        otherUserRole,
      })

      return { legacyId: result.legacyId, isNew: result.isNew }
    },
    [getOrCreateConversationMutation, isPreviewMode, previewConversations, workspaceId]
  )

  const startNewDM = useCallback(
    async (user: { id: string; name: string; role?: string | null }) => {
      const result = await getOrCreateConversation(user.id, user.name, user.role)
      
      const newConversation: DirectConversation = {
        id: result.legacyId,
        legacyId: result.legacyId,
        otherParticipantId: user.id,
        otherParticipantName: user.name,
        otherParticipantRole: user.role ?? null,
        lastMessageSnippet: null,
        lastMessageAtMs: null,
        lastMessageSenderId: null,
        isRead: true,
        isArchived: false,
        isMuted: false,
        createdAtMs: Date.now(),
        updatedAtMs: Date.now(),
      }
      
      selectConversation(newConversation)
    },
    [getOrCreateConversation, selectConversation]
  )

  const sendMessage = useCallback(
    async (content: string, attachments?: DirectMessage['attachments']) => {
      if (!selectedConversation || (!isPreviewMode && !workspaceId)) return

      setIsSending(true)
      try {
        if (isPreviewMode) {
          const now = Date.now()
          const previewMessage: DirectMessage = {
            id: `preview-dm-message-${now}`,
            legacyId: `preview-dm-message-${now}`,
            senderId: currentUserId ?? 'preview-current-user',
            senderName: currentUserName?.trim() || 'You',
            senderRole: currentUserRole ?? null,
            content,
            edited: false,
            editedAtMs: null,
            deleted: false,
            deletedAtMs: null,
            deletedBy: null,
            attachments: attachments ?? null,
            reactions: null,
            readBy: [currentUserId ?? 'preview-current-user'],
            deliveredTo: [currentUserId ?? 'preview-current-user', selectedConversation.otherParticipantId],
            readAtMs: now,
            sharedTo: null,
            createdAtMs: now,
            updatedAtMs: now,
          }

          setPreviewMessagesByConversation((prev) => {
            const existing = prev[selectedConversation.legacyId] ?? []
            return {
              ...prev,
              [selectedConversation.legacyId]: [...existing, previewMessage].sort(
                (a, b) => b.createdAtMs - a.createdAtMs
              ),
            }
          })

          setPreviewConversations((prev) =>
            [...prev]
              .map((conversation) =>
                conversation.legacyId === selectedConversation.legacyId
                  ? {
                      ...conversation,
                      lastMessageSnippet: content,
                      lastMessageAtMs: now,
                      lastMessageSenderId: currentUserId ?? 'preview-current-user',
                      isRead: true,
                      updatedAtMs: now,
                    }
                  : conversation
              )
              .sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0))
          )

          if (typeof window !== 'undefined') {
            const conversationSnapshot = selectedConversation
            const timerId = window.setTimeout(() => {
              previewReplyTimersRef.current = previewReplyTimersRef.current.filter((id) => id !== timerId)

              const autoReply = getPreviewDirectAutoReply({
                conversationLegacyId: conversationSnapshot.legacyId,
                otherParticipantId: conversationSnapshot.otherParticipantId,
                otherParticipantName: conversationSnapshot.otherParticipantName,
                otherParticipantRole: conversationSnapshot.otherParticipantRole,
                content,
                currentUserId,
              })

              setPreviewMessagesByConversation((prev) => {
                const existing = prev[conversationSnapshot.legacyId] ?? []
                return {
                  ...prev,
                  [conversationSnapshot.legacyId]: [...existing, autoReply].sort(
                    (a, b) => b.createdAtMs - a.createdAtMs
                  ),
                }
              })

              setPreviewConversations((prev) =>
                [...prev]
                  .map((conversation) =>
                    conversation.legacyId === conversationSnapshot.legacyId
                      ? {
                          ...conversation,
                          lastMessageSnippet: autoReply.content,
                          lastMessageAtMs: autoReply.createdAtMs,
                          lastMessageSenderId: autoReply.senderId,
                          isRead: true,
                          updatedAtMs: autoReply.updatedAtMs ?? autoReply.createdAtMs,
                        }
                      : conversation
                  )
                  .sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0))
              )
            }, 900)

            previewReplyTimersRef.current.push(timerId)
          }

          return
        }

        await sendMessageMutation({
          workspaceId: String(workspaceId),
          conversationLegacyId: selectedConversation.legacyId,
          content,
          attachments: attachments ?? null,
        })
      } finally {
        setIsSending(false)
      }
    },
    [currentUserId, currentUserName, currentUserRole, isPreviewMode, selectedConversation, sendMessageMutation, workspaceId]
  )

  const markAsRead = useCallback(async () => {
    if (!selectedConversation || (!isPreviewMode && !workspaceId)) return

    if (isPreviewMode) {
      setPreviewConversations((prev) =>
        prev.map((conversation) =>
          conversation.legacyId === selectedConversation.legacyId
            ? { ...conversation, isRead: true }
            : conversation
        )
      )
      return
    }

    await markAsReadMutation({
      workspaceId: String(workspaceId),
      conversationLegacyId: selectedConversation.legacyId,
    })
  }, [isPreviewMode, markAsReadMutation, selectedConversation, workspaceId])

  const editMessage = useCallback(
    async (messageLegacyId: string, newContent: string) => {
      if (isPreviewMode) {
        setPreviewMessagesByConversation((prev) => {
          const next: Record<string, DirectMessage[]> = { ...prev }

          for (const [conversationLegacyId, messages] of Object.entries(next)) {
            const index = messages.findIndex((message) => message.legacyId === messageLegacyId)
            if (index === -1) {
              continue
            }

            const existingMessage = messages[index]
            if (!existingMessage) {
              continue
            }

            const updatedMessages = [...messages]
            updatedMessages[index] = {
              ...existingMessage,
              content: newContent,
              edited: true,
              editedAtMs: Date.now(),
              updatedAtMs: Date.now(),
            }
            next[conversationLegacyId] = updatedMessages
            break
          }

          return next
        })
        return
      }

      if (!workspaceId) return

      await editMessageMutation({
        workspaceId: String(workspaceId),
        messageLegacyId,
        newContent,
      })
    },
    [editMessageMutation, isPreviewMode, workspaceId]
  )

  const deleteMessage = useCallback(
    async (messageLegacyId: string) => {
      if (isPreviewMode) {
        setPreviewMessagesByConversation((prev) => {
          const next: Record<string, DirectMessage[]> = { ...prev }

          for (const [conversationLegacyId, messages] of Object.entries(next)) {
            const index = messages.findIndex((message) => message.legacyId === messageLegacyId)
            if (index === -1) {
              continue
            }

            const existingMessage = messages[index]
            if (!existingMessage) {
              continue
            }

            const updatedMessages = [...messages]
            updatedMessages[index] = {
              ...existingMessage,
              content: '',
              deleted: true,
              deletedAtMs: Date.now(),
              deletedBy: currentUserId ?? 'preview-current-user',
              updatedAtMs: Date.now(),
            }
            next[conversationLegacyId] = updatedMessages
            break
          }

          return next
        })
        return
      }

      if (!workspaceId) return

      await deleteMessageMutation({
        workspaceId: String(workspaceId),
        messageLegacyId,
      })
    },
    [currentUserId, deleteMessageMutation, isPreviewMode, workspaceId]
  )

  const toggleReaction = useCallback(
    async (messageLegacyId: string, emoji: string) => {
      if (isPreviewMode) {
        const reactionUserId = currentUserId ?? 'preview-current-user'
        setPreviewMessagesByConversation((prev) => {
          const next: Record<string, DirectMessage[]> = { ...prev }

          for (const [conversationLegacyId, messages] of Object.entries(next)) {
            const index = messages.findIndex((message) => message.legacyId === messageLegacyId)
            if (index === -1) {
              continue
            }

            const currentMessage = messages[index]
            if (!currentMessage) {
              continue
            }
            const currentReactions = currentMessage.reactions ?? []
            const existingReaction = currentReactions.find((reaction) => reaction.emoji === emoji)
            let nextReactions = currentReactions

            if (existingReaction) {
              const hasReacted = existingReaction.userIds.includes(reactionUserId)
              nextReactions = currentReactions
                .map((reaction) => {
                  if (reaction.emoji !== emoji) {
                    return reaction
                  }

                  const nextUserIds = hasReacted
                    ? reaction.userIds.filter((entry) => entry !== reactionUserId)
                    : [...reaction.userIds, reactionUserId]

                  if (nextUserIds.length === 0) {
                    return null
                  }

                  return {
                    ...reaction,
                    count: nextUserIds.length,
                    userIds: nextUserIds,
                  }
                })
                .filter(Boolean) as NonNullable<DirectMessage['reactions']>
            } else {
              nextReactions = [...currentReactions, { emoji, count: 1, userIds: [reactionUserId] }]
            }

            const updatedMessages = [...messages]
            updatedMessages[index] = {
              ...currentMessage,
              reactions: nextReactions,
              updatedAtMs: Date.now(),
            }
            next[conversationLegacyId] = updatedMessages
            break
          }

          return next
        })
        return
      }

      if (!workspaceId) return

      await toggleReactionMutation({
        workspaceId: String(workspaceId),
        messageLegacyId,
        emoji,
      })
    },
    [currentUserId, isPreviewMode, toggleReactionMutation, workspaceId]
  )

  const archiveConversation = useCallback(
    async (archived: boolean) => {
      if (!selectedConversation || (!isPreviewMode && !workspaceId)) return

      if (isPreviewMode) {
        setPreviewConversations((prev) =>
          prev.map((conversation) =>
            conversation.legacyId === selectedConversation.legacyId
              ? { ...conversation, isArchived: archived }
              : conversation
          )
        )
        return
      }

      await setArchiveStatusMutation({
        workspaceId: String(workspaceId),
        conversationLegacyId: selectedConversation.legacyId,
        archived,
      })
      
      setSelectedConversation((prev) =>
        prev ? { ...prev, isArchived: archived } : null
      )
    },
    [isPreviewMode, selectedConversation, setArchiveStatusMutation, workspaceId]
  )

  const muteConversation = useCallback(
    async (muted: boolean) => {
      if (!selectedConversation || (!isPreviewMode && !workspaceId)) return

      if (isPreviewMode) {
        setPreviewConversations((prev) =>
          prev.map((conversation) =>
            conversation.legacyId === selectedConversation.legacyId
              ? { ...conversation, isMuted: muted }
              : conversation
          )
        )
        return
      }

      await setMuteStatusMutation({
        workspaceId: String(workspaceId),
        conversationLegacyId: selectedConversation.legacyId,
        muted,
      })
      
      setSelectedConversation((prev) =>
        prev ? { ...prev, isMuted: muted } : null
      )
    },
    [isPreviewMode, selectedConversation, setMuteStatusMutation, workspaceId]
  )

  useEffect(() => {
    if (selectedConversation && !selectedConversation.isRead) {
      markAsRead()
    }
  }, [selectedConversation, markAsRead])

  const messagesError = normalizedMessageSearch ? searchError : null

  return {
    conversations,
    selectedConversation,
    selectConversation,
    isLoadingConversations: isPreviewMode ? false : conversationsQuery === undefined,
    messages: currentMessages,
    visibleMessages,
    isLoadingMessages: isPreviewMode ? false : typedMessagesQuery === undefined && messageCursor === null,
    isLoadingMore,
    loadMoreMessages,
    hasMoreMessages: isPreviewMode ? false : hasMore,
    messageSearchQuery,
    setMessageSearchQuery,
    searchHighlights,
    searchingMessages,
    messagesError,
    retryMessagesError: retryDirectMessageSearch,
    sendMessage,
    isSending,
    markAsRead,
    editMessage,
    deleteMessage,
    toggleReaction,
    archiveConversation,
    muteConversation,
    getOrCreateConversation,
    unreadCount: isPreviewMode ? conversations.filter((conversation) => !conversation.isRead).length : unreadCountQuery ?? 0,
    startNewDM,
  }
}
