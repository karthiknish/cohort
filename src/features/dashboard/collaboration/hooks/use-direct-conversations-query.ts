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
        .sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0))
    )
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
    setMessageCursor,
    allMessages,
    setAllMessages,
    hasMore,
    setHasMore,
    isLoadingMore,
    setIsLoadingMore,
    messageSearchQuery,
    setMessageSearchQuery,
    searchResults,
    setSearchResults,
    searchHighlights,
    setSearchHighlights,
    searchingMessages,
    setSearchingMessages,
    searchError,
    setSearchError,
    searchRetryNonce,
    setSearchRetryNonce,
    previewConversations,
    setPreviewConversations,
    previewMessagesByConversation,
    setPreviewMessagesByConversation,
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
