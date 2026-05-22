'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useConvex, useQuery } from 'convex/react'

import { usePreview } from '@/shared/contexts/preview-context'
import { api, directMessagesApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { getPreviewDirectConversations, getPreviewDirectMessages } from '@/lib/preview-data'
import type { DirectConversation, DirectMessage } from '@/types/collaboration'
import { formatConversationSnippet } from '../lib/chat-text'
import { MESSAGE_PAGE_SIZE } from './constants'
import { filterDirectMessagesForSearch, parseDirectMessageSearchQuery } from './direct-message-search'
import type { UseDirectMessagesOptions } from './use-direct-messages'

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

export function useDirectConversationsQuery({
  workspaceId,
  currentUserId,
  currentUserName,
  currentUserRole,
}: UseDirectMessagesOptions) {
  const { isPreviewMode } = usePreview()
  const convex = useConvex()
  const [selectedConversation, setSelectedConversation] = useState<DirectConversation | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [feed, setFeed] = useState({
    pagination: {
      messageCursor: null as MessageCursor,
      allMessages: [] as DirectMessage[],
      hasMore: true,
      isLoadingMore: false,
    },
    previewData: {
      conversations: [] as DirectConversation[],
      messagesByConversation: {} as Record<string, DirectMessage[]>,
    },
    search: {
      results: [] as DirectMessage[],
      highlights: [] as string[],
      searching: false,
      error: null as string | null,
    },
  })
  const { pagination, previewData, search } = feed
  const { messageCursor, allMessages, hasMore, isLoadingMore } = pagination
  const { conversations: previewConversations, messagesByConversation: previewMessagesByConversation } = previewData
  const { results: searchResults, highlights: searchHighlights, searching: searchingMessages, error: searchError } = search
  const [messageSearchQuery, setMessageSearchQuery] = useState('')
  const [searchRetryNonce, setSearchRetryNonce] = useState(0)
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

    setFeed((prev) => ({
      ...prev,
      previewData: { conversations, messagesByConversation },
      pagination: {
        messageCursor: null,
        allMessages: [],
        hasMore: false,
        isLoadingMore: false,
      },
    }))
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
      
      setFeed((prev) => {
        const byLegacyId = new Map(prev.pagination.allMessages.map((m) => [m.legacyId, m]))
        const loadingMore = prev.pagination.isLoadingMore && prev.pagination.messageCursor

        if (loadingMore) {
          for (const msg of newMessages) {
            if (!byLegacyId.has(msg.legacyId)) {
              byLegacyId.set(msg.legacyId, msg)
            }
          }
        } else {
          byLegacyId.clear()
          for (const msg of newMessages) {
            byLegacyId.set(msg.legacyId, msg)
          }
        }

        return {
          ...prev,
          pagination: {
            ...prev.pagination,
            allMessages: Array.from(byLegacyId.values()).sort((a, b) => b.createdAtMs - a.createdAtMs),
            hasMore: !!typedMessagesQuery.nextCursor,
            isLoadingMore: loadingMore ? false : prev.pagination.isLoadingMore,
          },
        }
      })
    }
  }, [typedMessagesQuery, isLoadingMore, isPreviewMode, messageCursor])

  useEffect(() => {
    setFeed((prev) => ({
      ...prev,
      pagination: {
        messageCursor: null,
        allMessages: [],
        hasMore: !isPreviewMode,
        isLoadingMore: false,
      },
    }))
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

    setFeed((prev) => ({
      ...prev,
      previewData: {
        ...prev.previewData,
        conversations: [...prev.previewData.conversations]
        .map((conversation) => {
          const messages = previewMessagesByConversation[conversation.legacyId] ?? []
          const lastMessage = messages.reduce<typeof messages[number] | null>((latest, message) => {
            if (latest === null || message.createdAtMs > latest.createdAtMs) {
              return message
            }

            return latest
          }, null)
          const isRead = !messages.some(
            (message) => message.senderId !== previewUserId && !message.readBy.includes(previewUserId)
          )

          return {
            ...conversation,
            lastMessageSnippet: lastMessage?.deleted
              ? 'Message deleted'
              : lastMessage?.content
                ? formatConversationSnippet(lastMessage.content, 160)
                : null,
            lastMessageAtMs: lastMessage?.createdAtMs ?? conversation.lastMessageAtMs,
            lastMessageSenderId: lastMessage?.senderId ?? conversation.lastMessageSenderId,
            isRead,
            updatedAtMs: lastMessage?.updatedAtMs ?? conversation.updatedAtMs,
          }
        })
        .sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0)),
      },
    }))
  }, [currentUserId, isPreviewMode, previewMessagesByConversation])

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
  const currentMessages = isPreviewMode
    ? (selectedConversation ? previewMessagesByConversation[selectedConversation.legacyId] ?? [] : [])
    : allMessages
  const visibleMessages = normalizedMessageSearch ? searchResults : currentMessages

  const retryDirectMessageSearch = useCallback(() => {
    setSearchRetryNonce((n) => n + 1)
  }, [])

  const resolvedSyncSearch = useMemo(() => {
    if (!selectedConversation || !normalizedMessageSearch) {
      return { results: [] as DirectMessage[], highlights: [] as string[], searching: false, error: null as string | null }
    }

    const parsed = parseDirectMessageSearchQuery(normalizedMessageSearch)

    if (isPreviewMode) {
      const previewMessages = previewMessagesByConversation[selectedConversation.legacyId] ?? []
      return {
        results: filterDirectMessagesForSearch(previewMessages, parsed),
        highlights: parsed.highlights,
        searching: false,
        error: null,
      }
    }

    if (!workspaceId) {
      return {
        results: [] as DirectMessage[],
        highlights: parsed.highlights,
        searching: false,
        error: null,
      }
    }

    return null
  }, [isPreviewMode, normalizedMessageSearch, previewMessagesByConversation, selectedConversation, workspaceId])

  useEffect(() => {
    if (resolvedSyncSearch === null) return
    setFeed((prev) => ({ ...prev, search: resolvedSyncSearch }))
  }, [resolvedSyncSearch])

  const fetchDirectMessageSearch = useCallback(
    async (isCancelled: () => boolean) => {
      if (!selectedConversation || !normalizedMessageSearch || !workspaceId) return

      const parsed = parseDirectMessageSearchQuery(normalizedMessageSearch)
      const startMs = parsed.start ? Date.parse(parsed.start) : NaN
      const endMs = parsed.end ? Date.parse(parsed.end) : NaN

      setFeed((prev) => ({
        ...prev,
        search: { ...prev.search, searching: true, error: null },
      }))

      try {
        const payload = (await convex.query(directMessagesApi.searchMessages, {
          workspaceId: String(workspaceId),
          conversationLegacyId: selectedConversation.legacyId,
          q: parsed.q || null,
          sender: parsed.sender ?? null,
          attachment: parsed.attachment ?? null,
          startMs: Number.isFinite(startMs) ? startMs : null,
          endMs: Number.isFinite(endMs) ? endMs : null,
          limit: 200,
        })) as { rows?: unknown[]; highlights?: unknown[] }

        if (isCancelled()) return

        const rows = Array.isArray(payload?.rows) ? payload.rows : []
        const highlights = Array.isArray(payload?.highlights)
          ? payload.highlights.filter((entry): entry is string => typeof entry === 'string')
          : parsed.highlights

        const mapped = rows
          .flatMap((row: unknown) => {
            const item = (row ?? {}) as Record<string, unknown>
            const legacyId = String(item.legacyId ?? '')
            if (!legacyId) return []
            return [{
              id: String(item._id ?? ''),
              legacyId,
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
            } satisfies DirectMessage]
          })
          .sort((a, b) => b.createdAtMs - a.createdAtMs)

        setFeed((prev) => ({
          ...prev,
          search: {
            results: mapped,
            highlights,
            searching: false,
            error: null,
          },
        }))
      } catch (error: unknown) {
        if (isCancelled()) return
        logError(error, 'useDirectMessages:searchMessages')
        setFeed((prev) => ({
          ...prev,
          search: {
            results: [],
            highlights: parsed.highlights,
            searching: false,
            error: asErrorMessage(error),
          },
        }))
      }
    },
    [convex, normalizedMessageSearch, selectedConversation, workspaceId],
  )

  useEffect(() => {
    if (resolvedSyncSearch !== null) return

    let cancelled = false
    void fetchDirectMessageSearch(() => cancelled)

    return () => {
      cancelled = true
    }
  }, [fetchDirectMessageSearch, resolvedSyncSearch, searchRetryNonce])

  const selectConversation = useCallback((conversation: DirectConversation | null) => {
    setSelectedConversation(conversation)
  }, [])

  const loadMoreMessages = useCallback(() => {
    if (isPreviewMode) {
      return
    }

    if (typedMessagesQuery?.nextCursor && hasMore && !isLoadingMore) {
      setFeed((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          isLoadingMore: true,
          messageCursor: typedMessagesQuery.nextCursor,
        },
      }))
    }
  }, [typedMessagesQuery, hasMore, isLoadingMore, isPreviewMode])
  return {
    convex,
    isPreviewMode,
    workspaceId,
    currentUserId,
    currentUserName,
    currentUserRole,
    selectedConversation,
    setSelectedConversation,
    isSending,
    setIsSending,
    messageCursor,
    setMessageCursor: (cursor: MessageCursor) =>
      setFeed((prev) => ({ ...prev, pagination: { ...prev.pagination, messageCursor: cursor } })),
    allMessages,
    setAllMessages: (messages: DirectMessage[] | ((prev: DirectMessage[]) => DirectMessage[])) =>
      setFeed((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          allMessages: typeof messages === 'function' ? messages(prev.pagination.allMessages) : messages,
        },
      })),
    hasMore,
    setHasMore: (value: boolean) =>
      setFeed((prev) => ({ ...prev, pagination: { ...prev.pagination, hasMore: value } })),
    isLoadingMore,
    setIsLoadingMore: (value: boolean) =>
      setFeed((prev) => ({ ...prev, pagination: { ...prev.pagination, isLoadingMore: value } })),
    messageSearchQuery,
    setMessageSearchQuery,
    searchResults,
    setSearchResults: (results: DirectMessage[]) =>
      setFeed((prev) => ({ ...prev, search: { ...prev.search, results } })),
    searchHighlights,
    setSearchHighlights: (highlights: string[]) =>
      setFeed((prev) => ({ ...prev, search: { ...prev.search, highlights } })),
    searchingMessages,
    setSearchingMessages: (searching: boolean) =>
      setFeed((prev) => ({ ...prev, search: { ...prev.search, searching } })),
    searchError,
    setSearchError: (error: string | null) =>
      setFeed((prev) => ({ ...prev, search: { ...prev.search, error } })),
    searchRetryNonce,
    setSearchRetryNonce,
    previewConversations,
    setPreviewConversations: (value: DirectConversation[] | ((prev: DirectConversation[]) => DirectConversation[])) =>
      setFeed((prev) => ({
        ...prev,
        previewData: {
          ...prev.previewData,
          conversations: typeof value === 'function' ? value(prev.previewData.conversations) : value,
        },
      })),
    previewMessagesByConversation,
    setPreviewMessagesByConversation: (
      value:
        | Record<string, DirectMessage[]>
        | ((prev: Record<string, DirectMessage[]>) => Record<string, DirectMessage[]>)
    ) =>
      setFeed((prev) => ({
        ...prev,
        previewData: {
          ...prev.previewData,
          messagesByConversation:
            typeof value === 'function' ? value(prev.previewData.messagesByConversation) : value,
        },
      })),
    previewReplyTimersRef,
    conversationsQuery,
    unreadCountQuery,
    typedMessagesQuery,
    conversations,
    currentMessages,
    visibleMessages,
    selectConversation,
    loadMoreMessages,
    retryDirectMessageSearch,
    normalizedMessageSearch,
    isLoadingConversations: isPreviewMode ? false : conversationsQuery === undefined,
    isLoadingMessages: isPreviewMode ? false : typedMessagesQuery === undefined && messageCursor === null,
    hasMoreMessages: isPreviewMode ? false : hasMore,
    messagesError: normalizedMessageSearch ? searchError : null,
  }
}
