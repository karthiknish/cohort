'use client'

import { useState, useCallback, useEffect } from 'react'
import { useMutation, useQuery, usePaginatedQuery } from 'convex/react'
import { api } from '@/lib/convex-api'
import type { DirectConversation, DirectMessage } from '@/types/collaboration'
import { MESSAGE_PAGE_SIZE } from './constants'

export type { DirectConversation, DirectMessage }

export type UseDirectMessagesOptions = {
  workspaceId: string | null
  currentUserId: string | null
}

export type UseDirectMessagesReturn = {
  conversations: DirectConversation[]
  selectedConversation: DirectConversation | null
  selectConversation: (conversation: DirectConversation | null) => void
  isLoadingConversations: boolean
  messages: DirectMessage[]
  isLoadingMessages: boolean
  loadMoreMessages: () => void
  hasMoreMessages: boolean
  sendMessage: (content: string, attachments?: any[]) => Promise<void>
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

export function useDirectMessages({
  workspaceId,
  currentUserId,
}: UseDirectMessagesOptions): UseDirectMessagesReturn {
  const [selectedConversation, setSelectedConversation] = useState<DirectConversation | null>(null)
  const [isSending, setIsSending] = useState(false)

  const conversationsQuery = useQuery(
    (api as any).directMessages.listConversations,
    workspaceId ? { workspaceId, includeArchived: false } : 'skip'
  )

  const unreadCountQuery = useQuery(
    (api as any).directMessages.getUnreadCount,
    workspaceId ? { workspaceId } : 'skip'
  )

  const messagesQuery = usePaginatedQuery(
    (api as any).directMessages.listMessages,
    selectedConversation && workspaceId
      ? { workspaceId, conversationLegacyId: selectedConversation.legacyId }
      : 'skip',
    { initialNumItems: MESSAGE_PAGE_SIZE }
  )

  const getOrCreateConversationMutation = useMutation((api as any).directMessages.getOrCreateConversation)
  const sendMessageMutation = useMutation((api as any).directMessages.sendMessage)
  const markAsReadMutation = useMutation((api as any).directMessages.markAsRead)
  const editMessageMutation = useMutation((api as any).directMessages.editMessage)
  const deleteMessageMutation = useMutation((api as any).directMessages.deleteMessage)
  const toggleReactionMutation = useMutation((api as any).directMessages.toggleReaction)
  const setArchiveStatusMutation = useMutation((api as any).directMessages.setArchiveStatus)
  const setMuteStatusMutation = useMutation((api as any).directMessages.setMuteStatus)

  const conversations: DirectConversation[] = (conversationsQuery ?? []).map((c: any) => ({
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

  const messages: DirectMessage[] = (messagesQuery.results ?? []).map((m: any) => ({
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

  const selectConversation = useCallback((conversation: DirectConversation | null) => {
    setSelectedConversation(conversation)
  }, [])

  const getOrCreateConversation = useCallback(
    async (otherUserId: string, otherUserName: string, otherUserRole?: string | null) => {
      if (!workspaceId) throw new Error('No workspace selected')
      
      const result = await getOrCreateConversationMutation({
        workspaceId,
        otherUserId,
        otherUserName,
        otherUserRole,
      })

      return { legacyId: result.legacyId, isNew: result.isNew }
    },
    [workspaceId, getOrCreateConversationMutation]
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
    async (content: string, attachments?: any[]) => {
      if (!selectedConversation || !workspaceId) return

      setIsSending(true)
      try {
        await sendMessageMutation({
          workspaceId,
          conversationLegacyId: selectedConversation.legacyId,
          content,
          attachments: attachments ?? null,
        })
      } finally {
        setIsSending(false)
      }
    },
    [selectedConversation, workspaceId, sendMessageMutation]
  )

  const markAsRead = useCallback(async () => {
    if (!selectedConversation || !workspaceId) return

    await markAsReadMutation({
      workspaceId,
      conversationLegacyId: selectedConversation.legacyId,
    })
  }, [selectedConversation, workspaceId, markAsReadMutation])

  const editMessage = useCallback(
    async (messageLegacyId: string, newContent: string) => {
      if (!workspaceId) return

      await editMessageMutation({
        workspaceId,
        messageLegacyId,
        newContent,
      })
    },
    [workspaceId, editMessageMutation]
  )

  const deleteMessage = useCallback(
    async (messageLegacyId: string) => {
      if (!workspaceId) return

      await deleteMessageMutation({
        workspaceId,
        messageLegacyId,
      })
    },
    [workspaceId, deleteMessageMutation]
  )

  const toggleReaction = useCallback(
    async (messageLegacyId: string, emoji: string) => {
      if (!workspaceId) return

      await toggleReactionMutation({
        workspaceId,
        messageLegacyId,
        emoji,
      })
    },
    [workspaceId, toggleReactionMutation]
  )

  const archiveConversation = useCallback(
    async (archived: boolean) => {
      if (!selectedConversation || !workspaceId) return

      await setArchiveStatusMutation({
        workspaceId,
        conversationLegacyId: selectedConversation.legacyId,
        archived,
      })
      
      setSelectedConversation((prev) =>
        prev ? { ...prev, isArchived: archived } : null
      )
    },
    [selectedConversation, workspaceId, setArchiveStatusMutation]
  )

  const muteConversation = useCallback(
    async (muted: boolean) => {
      if (!selectedConversation || !workspaceId) return

      await setMuteStatusMutation({
        workspaceId,
        conversationLegacyId: selectedConversation.legacyId,
        muted,
      })
      
      setSelectedConversation((prev) =>
        prev ? { ...prev, isMuted: muted } : null
      )
    },
    [selectedConversation, workspaceId, setMuteStatusMutation]
  )

  useEffect(() => {
    if (selectedConversation && !selectedConversation.isRead) {
      markAsRead()
    }
  }, [selectedConversation, markAsRead])

  return {
    conversations,
    selectedConversation,
    selectConversation,
    isLoadingConversations: conversationsQuery === undefined,
    messages,
    isLoadingMessages: messagesQuery.isLoading,
    loadMoreMessages: () => messagesQuery.loadMore(MESSAGE_PAGE_SIZE),
    hasMoreMessages: messagesQuery.status === 'CanLoadMore',
    sendMessage,
    isSending,
    markAsRead,
    editMessage,
    deleteMessage,
    toggleReaction,
    archiveConversation,
    muteConversation,
    getOrCreateConversation,
    unreadCount: unreadCountQuery ?? 0,
    startNewDM,
  }
}
