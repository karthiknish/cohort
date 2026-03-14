'use client'

import { useCallback, useMemo, type ReactNode } from 'react'

import type { CollaborationMessage } from '@/types/collaboration'

import type { MessageListRenderers } from './message-list-render-context'
import type { UnifiedMessage } from './message-list'
import { SwipeableMessage } from './swipeable-message'
import { ThreadSection } from './thread-section'
import {
  renderDeletedMessageInfo,
  renderMessageAttachmentsContent,
  renderMessageContentBlock,
  renderMessageEditForm,
  SharedPlatformBadges,
  UnifiedMessageActionBar,
  UnifiedThreadReplyCard,
} from './unified-message-pane-sections'

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

  const renderMessageContent = useCallback(
    (message: UnifiedMessage) => {
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

  const renderThreadReply = useCallback(
    (reply: CollaborationMessage) => (
      <UnifiedThreadReplyCard
        reply={reply}
        currentUserId={currentUserId}
        editingMessageId={editingMessageId}
        activeDeletingMessageId={activeDeletingMessageId}
        messageUpdatingId={messageUpdatingId}
        reactionPendingEmoji={reactionPendingByMessage[reply.id] ?? null}
        onToggleReaction={(messageId, emoji) => {
          void handleReaction(messageId, emoji)
        }}
        onStartEdit={onEditMessage ? handleStartEdit : undefined}
        onRequestDelete={onDeleteMessage ? handleRequestDelete : undefined}
      />
    ),
    [
      activeDeletingMessageId,
      currentUserId,
      editingMessageId,
      handleReaction,
      handleRequestDelete,
      handleStartEdit,
      messageUpdatingId,
      onDeleteMessage,
      onEditMessage,
      reactionPendingByMessage,
    ],
  )

  const renderThreadSection = useCallback(
    (message: UnifiedMessage) => {
      if (headerType !== 'channel' || message.deleted) {
        return null
      }

      const original = channelMessagesById.get(message.id)
      const threadRootId = resolveThreadRootId(message)
      const threadReplies = threadMessagesByRootId[threadRootId] ?? []
      const threadLoading = threadLoadingByRootId[threadRootId] ?? false
      const threadError = threadErrorsByRootId[threadRootId] ?? null
      const threadNextCursor = threadNextCursorByRootId[threadRootId] ?? null
      const replyCount = Math.max(
        typeof original?.threadReplyCount === 'number'
          ? original.threadReplyCount
          : (typeof message.threadReplyCount === 'number' ? message.threadReplyCount : 0),
        threadReplies.length,
      )
      const lastReplyIso =
        original?.threadLastReplyAt ??
        message.threadLastReplyAt ??
        (threadReplies.length > 0 ? threadReplies[threadReplies.length - 1]?.createdAt ?? null : null)
      const unreadCount = Math.max(0, threadUnreadCountsByRootId[threadRootId] ?? 0)
      const beforeMs = lastReplyIso ? Date.parse(lastReplyIso) : NaN

      return (
        <ThreadSection
          threadRootId={threadRootId}
          replyCount={replyCount}
          unreadCount={unreadCount}
          lastReplyIso={lastReplyIso}
          isOpen={Boolean(expandedThreadIds[threadRootId])}
          isLoading={threadLoading}
          error={threadError}
          hasNextCursor={Boolean(threadNextCursor)}
          replies={threadReplies}
          onToggle={() => handleThreadToggle(threadRootId, Number.isFinite(beforeMs) ? beforeMs : undefined)}
          onRetry={() => handleRetryThreadLoad(threadRootId)}
          onLoadMore={() => handleLoadMoreThread(threadRootId)}
          onReply={() => handleReply(message)}
          canReply={Boolean(onReply)}
          renderReply={renderThreadReply}
        />
      )
    },
    [
      channelMessagesById,
      expandedThreadIds,
      handleLoadMoreThread,
      handleReply,
      handleRetryThreadLoad,
      handleThreadToggle,
      headerType,
      onReply,
      resolveThreadRootId,
      renderThreadReply,
      threadErrorsByRootId,
      threadLoadingByRootId,
      threadMessagesByRootId,
      threadNextCursorByRootId,
      threadUnreadCountsByRootId,
    ],
  )

  const renderMessageWrapper = useCallback(
    (message: UnifiedMessage, children: ReactNode) => (
      <SwipeableMessage
        key={message.id}
        message={message}
        currentUserId={currentUserId}
        canDelete={!message.deleted && message.senderId === currentUserId && !!onDeleteMessage}
        onReply={!message.deleted && onReply ? () => handleReply(message) : undefined}
        onDelete={!message.deleted && onDeleteMessage ? () => handleRequestDelete(message.id) : undefined}
      >
        {children}
      </SwipeableMessage>
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