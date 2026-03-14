'use client'

import { useMemo } from 'react'
import { useQuery } from 'convex/react'

import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { collaborationChannelsApi } from '@/lib/convex-api'

import { collectSharedFiles } from '../utils'

import type { UseCollaborationDataReturn } from './types'
import { useAttachmentsData } from './use-attachments-data'
import { useChannelsData } from './use-channels-data'
import { useMessagesData } from './use-messages-data'
import { useProjectsData } from './use-projects-data'

type CustomChannel = {
  legacyId: string
  name: string
  description: string | null
  visibility: 'public' | 'private'
  memberIds: string[]
  memberSummaries: Array<{
    id: string
    name: string
    role: string | null
  }>
}

export function useCollaborationData(): UseCollaborationDataReturn {
  const { user } = useAuth()
  const { clients, selectedClient, loading: clientsLoading } = useClientContext()
  const { isPreviewMode } = usePreview()

  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const userId = user?.id ?? null

  const fallbackRole = 'Account Owner'
  const fallbackDisplayName = useMemo(() => {
    if (user?.name && user.name.trim().length > 0) return user.name.trim()
    if (user?.email && user.email.trim().length > 0) return user.email.trim()
    return 'You'
  }, [user?.email, user?.name])

  const currentUserId = user?.id ?? null
  const currentUserRole = user?.role ?? null

  const { projects, projectsLoading } = useProjectsData({
    workspaceId,
    userId,
    selectedClientId: selectedClient?.id ?? null,
    isPreviewMode,
  })

  const customChannelsResult = useQuery(
    collaborationChannelsApi.listAccessible,
    !isPreviewMode && workspaceId
      ? {
          workspaceId: String(workspaceId),
          channelType: 'team',
        }
      : 'skip',
  ) as
    | Array<{
        legacyId?: string
        name?: string
        description?: string | null
        visibility?: 'public' | 'private'
        memberIds?: string[]
        memberSummaries?: Array<{ id?: string; name?: string; role?: string | null; email?: string | null }>
      }>
    | undefined

  const customChannels = useMemo<CustomChannel[]>(
    () =>
      (customChannelsResult ?? [])
        .filter((channel) => typeof channel?.legacyId === 'string' && typeof channel?.name === 'string')
        .map((channel): CustomChannel => ({
          legacyId: String(channel.legacyId),
          name: String(channel.name),
          description: typeof channel.description === 'string' ? channel.description : null,
          visibility: channel.visibility === 'public' ? 'public' : 'private',
          memberIds: Array.isArray(channel.memberIds)
            ? channel.memberIds.filter((memberId): memberId is string => typeof memberId === 'string')
            : [],
          memberSummaries: Array.isArray(channel.memberSummaries)
            ? channel.memberSummaries
                .filter(
                  (member): member is { id: string; name: string; role?: string | null } =>
                    typeof member?.id === 'string' && typeof member?.name === 'string',
                )
                .map((member) => ({
                  id: member.id,
                  name: member.name,
                  role: typeof member.role === 'string' ? member.role : null,
                }))
            : [],
        })),
    [customChannelsResult],
  )

  const {
    channels,
    selectedChannel,
    searchQuery,
    setSearchQuery,
    filteredChannels,
    selectChannel,
    channelParticipants,
    totalChannels,
    totalParticipants,
  } = useChannelsData({
    clients,
    projects,
    customChannels,
    fallbackDisplayName,
    fallbackRole,
  })

  const {
    pendingAttachments,
    uploading,
    handleAddAttachments,
    handleRemoveAttachment,
    clearAttachments,
    uploadAttachments,
  } = useAttachmentsData({
    userId: currentUserId,
    workspaceId,
  })

  const messages = useMessagesData({
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
  })

  const isBootstrapping = (clientsLoading || projectsLoading) && channels.length === 0

  const sharedFiles = useMemo(() => {
    const attachmentGroups = messages.channelMessages
      .filter((message) => !message.isDeleted && Array.isArray(message.attachments) && message.attachments.length > 0)
      .map((message) => message.attachments ?? [])
    return collectSharedFiles(attachmentGroups)
  }, [messages.channelMessages])

  return {
    channels,
    filteredChannels,
    searchQuery,
    setSearchQuery,
    selectedChannel,
    selectChannel,
    channelSummaries: messages.channelSummaries,
    channelUnreadCounts: messages.channelUnreadCounts,

    channelMessages: messages.channelMessages,
    visibleMessages: messages.visibleMessages,
    searchingMessages: messages.searchingMessages,
    searchHighlights: messages.searchHighlights,
    isCurrentChannelLoading: messages.isCurrentChannelLoading,
    isBootstrapping,
    messagesError: messages.messagesError,
    messageSearchQuery: messages.messageSearchQuery,
    setMessageSearchQuery: messages.setMessageSearchQuery,

    totalChannels,
    totalParticipants,
    channelParticipants,
    sharedFiles,

    messageInput: messages.messageInput,
    setMessageInput: messages.setMessageInput,
    pendingAttachments,
    handleAddAttachments,
    handleRemoveAttachment,
    clearPendingAttachments: clearAttachments,
    uploadPendingAttachments: uploadAttachments,
    uploading,

    typingParticipants: messages.typingParticipants,
    handleComposerFocus: messages.handleComposerFocus,
    handleComposerBlur: messages.handleComposerBlur,

    handleSendMessage: messages.handleSendMessage,
    sending: messages.sending,
    isSendDisabled: messages.isSendDisabled,
    messagesEndRef: messages.messagesEndRef,
    handleEditMessage: messages.handleEditMessage,
    handleDeleteMessage: messages.handleDeleteMessage,
    handleToggleReaction: messages.handleToggleReaction,
    messageUpdatingId: messages.messageUpdatingId,
    messageDeletingId: messages.messageDeletingId,

    handleLoadMore: messages.handleLoadMore,
    canLoadMore: messages.canLoadMore,
    loadingMore: messages.loadingMore,

    currentUserId,
    currentUserRole,

    threadMessagesByRootId: messages.threadMessagesByRootId,
    threadNextCursorByRootId: messages.threadNextCursorByRootId,
    threadLoadingByRootId: messages.threadLoadingByRootId,
    threadErrorsByRootId: messages.threadErrorsByRootId,
    threadUnreadCountsByRootId: messages.threadUnreadCountsByRootId,
    loadThreadReplies: messages.loadThreadReplies,
    loadMoreThreadReplies: messages.loadMoreThreadReplies,
    markThreadAsRead: messages.markThreadAsRead,
    clearThreadReplies: messages.clearThreadReplies,

    reactionPendingByMessage: messages.reactionPendingByMessage,
  }
}
