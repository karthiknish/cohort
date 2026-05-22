'use client'

import { useCallback, useMemo } from 'react'

import type { CollaborationMessage } from '@/types/collaboration'

import type { MessageListRenderers } from './message-list-render-context'
import type { UnifiedMessage } from './message-list-types'
import {
  SwipeableMessageRenderer,
  UnifiedThreadSectionRenderer,
} from './unified-message-pane-renderers'
import {
  renderDeletedMessageInfo,
  renderMessageAttachmentsContent,
  renderMessageContentBlock,
  renderMessageEditForm,
} from './unified-message-pane-render-utils'
import { SharedPlatformBadges, UnifiedMessageActionBar } from './unified-message-pane-sections'

type UseUnifiedMessagePaneRenderersArgs = {
  activeDeletingMessageId: string | null
  channelMessagesById: Map<string, CollaborationMessage>
  currentUserId: string | null
  deletedInfoByMessage?: Record<string, { deletedBy: string | null; deletedAt: string | null }>
  editingMessageId: string | null
  editingPreview: string
  editingValue: string
  expandedThreadIds: Record<string, boolean>
  headerType?: 'channel' | 'dm'
  isMessageSearchActive: boolean
  messageSearchHighlights: string[]
  messageUpdatingId: string | null
  onDeleteMessage?: (messageId: string) => Promise<void>
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>
  onReply?: (message: UnifiedMessage) => void
  onShareToPlatform?: (message: UnifiedMessage, platform: 'email') => Promise<void>
  reactionPendingByMessage: Record<string, string | null>
  resolveThreadRootId: (message: UnifiedMessage) => string
  setEditingValue: (value: string) => void
  sharingTo: string | null
  threadErrorsByRootId: Record<string, string | null>
  threadLoadingByRootId: Record<string, boolean>
  threadMessagesByRootId: Record<string, CollaborationMessage[]>
  threadNextCursorByRootId: Record<string, string | null>
  threadUnreadCountsByRootId: Record<string, number>
  handleCancelEdit: () => void
  handleConfirmEdit: () => void
  handleLoadMoreThread: (threadRootId: string) => void
  handleReaction: (messageId: string, emoji: string) => Promise<void>
  handleReply: (message: UnifiedMessage) => void
  handleRequestDelete: (messageId: string) => void
  handleRetryThreadLoad: (threadRootId: string) => void
  handleShare: (message: UnifiedMessage, platform: 'email') => Promise<void>
  handleStartEdit: (message: UnifiedMessage) => void
  handleThreadToggle: (threadRootId: string, beforeMs?: number) => void
}

export function useUnifiedMessagePaneRenderers({
  activeDeletingMessageId,
  channelMessagesById,
  currentUserId,
  deletedInfoByMessage,
  editingMessageId,
  editingPreview,
  editingValue,
  expandedThreadIds,
  headerType,
  isMessageSearchActive,
  messageSearchHighlights,
  messageUpdatingId,
  onDeleteMessage,
  onEditMessage,
  onReply,
  onShareToPlatform,
  reactionPendingByMessage,
  resolveThreadRootId,
  setEditingValue,
  sharingTo,
  threadErrorsByRootId,
  threadLoadingByRootId,
  threadMessagesByRootId,
  threadNextCursorByRootId,
  threadUnreadCountsByRootId,
  handleCancelEdit,
  handleConfirmEdit,
  handleLoadMoreThread,
  handleReaction,
  handleReply,
  handleRequestDelete,
  handleRetryThreadLoad,
  handleShare,
  handleStartEdit,
  handleThreadToggle,
}: UseUnifiedMessagePaneRenderersArgs): MessageListRenderers {
  const renderMessageExtras = useCallback(
    (message: UnifiedMessage) => <SharedPlatformBadges platforms={message.sharedTo as Array<'email'> | undefined} />,
    [],
  )

  const renderMessageActions = useCallback(
    (message: UnifiedMessage) => (
      <UnifiedMessageActionBar
        headerType={headerType ?? 'dm'}
        message={message}
        currentUserId={currentUserId}
        activeDeletingMessageId={activeDeletingMessageId}
        messageUpdatingId={messageUpdatingId}
        sharingTo={sharingTo}
        onReply={onReply ? handleReply : undefined}
        onStartEdit={onEditMessage ? handleStartEdit : undefined}
        onRequestDelete={onDeleteMessage ? handleRequestDelete : undefined}
        onShare={onShareToPlatform ? handleShare : undefined}
      />
    ),
    [
      activeDeletingMessageId,
      currentUserId,
      handleReply,
      handleRequestDelete,
      handleShare,
      handleStartEdit,
      headerType,
      messageUpdatingId,
      onDeleteMessage,
      onEditMessage,
      onReply,
      onShareToPlatform,
      sharingTo,
    ],
  )

  const renderMessageContent = useMemo(
    () =>
      function PaneMessageContent({ message }: { message: UnifiedMessage }) {
        const originalMessage = channelMessagesById.get(message.id)
        return renderMessageContentBlock(
          message,
          originalMessage,
          isMessageSearchActive ? messageSearchHighlights : undefined,
        )
      },
    [channelMessagesById, isMessageSearchActive, messageSearchHighlights],
  )

  const renderMessageAttachments = useCallback((message: UnifiedMessage) => renderMessageAttachmentsContent(message), [])

  const renderDeletedInfo = useCallback(
    (message: UnifiedMessage) => renderDeletedMessageInfo(message, deletedInfoByMessage),
    [deletedInfoByMessage],
  )

  const renderEditForm = useCallback(
    (message: UnifiedMessage) => renderMessageEditForm(
      message,
      editingMessageId,
      editingValue,
      setEditingValue,
      handleConfirmEdit,
      handleCancelEdit,
      messageUpdatingId === message.id,
      editingPreview,
    ),
    [editingMessageId, editingPreview, editingValue, handleCancelEdit, handleConfirmEdit, messageUpdatingId, setEditingValue],
  )

  const renderThreadSection = useCallback(
    (message: UnifiedMessage) => {
      return (
        <UnifiedThreadSectionRenderer
          activeDeletingMessageId={activeDeletingMessageId}
          currentUserId={currentUserId}
          editingMessageId={editingMessageId}
          expanded={expandedThreadIds}
          handleLoadMoreThread={handleLoadMoreThread}
          handleReaction={handleReaction}
          handleReply={handleReply}
          handleRequestDelete={handleRequestDelete}
          handleRetryThreadLoad={handleRetryThreadLoad}
          handleStartEdit={handleStartEdit}
          handleThreadToggle={handleThreadToggle}
          headerType={headerType}
          message={message}
          onReply={onReply}
          onDeleteMessage={onDeleteMessage}
          onEditMessage={onEditMessage}
          reactionPendingByMessage={reactionPendingByMessage}
          resolveThreadRootId={resolveThreadRootId}
          threadErrorsByRootId={threadErrorsByRootId}
          threadLoadingByRootId={threadLoadingByRootId}
          threadMessagesByRootId={threadMessagesByRootId}
          threadNextCursorByRootId={threadNextCursorByRootId}
          threadUnreadCountsByRootId={threadUnreadCountsByRootId}
          messageUpdatingId={messageUpdatingId}
        />
      )
    },
    [
      activeDeletingMessageId,
      currentUserId,
      editingMessageId,
      expandedThreadIds,
      handleLoadMoreThread,
      handleReaction,
      handleReply,
      handleRequestDelete,
      handleRetryThreadLoad,
      handleThreadToggle,
      handleStartEdit,
      headerType,
      messageUpdatingId,
      onReply,
      onDeleteMessage,
      onEditMessage,
      reactionPendingByMessage,
      resolveThreadRootId,
      threadErrorsByRootId,
      threadLoadingByRootId,
      threadMessagesByRootId,
      threadNextCursorByRootId,
      threadUnreadCountsByRootId,
    ],
  )

  const renderMessageWrapper = useCallback(
    (message: UnifiedMessage, children: React.ReactNode) => (
      <SwipeableMessageRenderer
        currentUserId={currentUserId}
        handleReply={handleReply}
        handleRequestDelete={handleRequestDelete}
        message={message}
        onDeleteMessage={onDeleteMessage}
        onReply={onReply}
      >
        {children}
      </SwipeableMessageRenderer>
    ),
    [currentUserId, handleReply, handleRequestDelete, onDeleteMessage, onReply],
  )

  return useMemo(
    () => ({
      renderDeletedInfo,
      renderEditForm,
      renderMessageActions,
      renderMessageAttachments,
      renderMessageContent,
      renderMessageExtras,
      renderMessageWrapper,
      renderThreadSection: headerType === 'channel' ? renderThreadSection : undefined,
    }),
    [
      headerType,
      renderDeletedInfo,
      renderEditForm,
      renderMessageActions,
      renderMessageAttachments,
      renderMessageContent,
      renderMessageExtras,
      renderMessageWrapper,
      renderThreadSection,
    ],
  )
}
