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

function UnifiedThreadSectionRenderer({
  activeDeletingMessageId,
  expanded,
  handleLoadMoreThread,
  handleReaction,
  handleReply,
  handleRequestDelete,
  handleRetryThreadLoad,
  handleThreadToggle,
  handleStartEdit,
  headerType,
  message,
  onReply,
  resolveThreadRootId,
  threadErrorsByRootId,
  threadLoadingByRootId,
  threadMessagesByRootId,
  threadNextCursorByRootId,
  threadUnreadCountsByRootId,
  currentUserId,
  editingMessageId,
  messageUpdatingId,
  onDeleteMessage,
  onEditMessage,
  reactionPendingByMessage,
}: {
  activeDeletingMessageId: string | null
  expanded: Record<string, boolean>
  handleLoadMoreThread: (threadRootId: string) => void
  handleReaction: (messageId: string, emoji: string) => Promise<void>
  handleReply: (message: UnifiedMessage) => void
  handleRequestDelete: (messageId: string) => void
  handleRetryThreadLoad: (threadRootId: string) => void
  handleThreadToggle: (threadRootId: string, beforeMs?: number) => void
  handleStartEdit: (message: UnifiedMessage) => void
  headerType?: 'channel' | 'dm'
  message: UnifiedMessage
  onReply?: (message: UnifiedMessage) => void
  resolveThreadRootId: (message: UnifiedMessage) => string
  threadErrorsByRootId: Record<string, string | null>
  threadLoadingByRootId: Record<string, boolean>
  threadMessagesByRootId: Record<string, CollaborationMessage[]>
  threadNextCursorByRootId: Record<string, string | null>
  threadUnreadCountsByRootId: Record<string, number>
  currentUserId: string | null
  editingMessageId: string | null
  messageUpdatingId: string | null
  onDeleteMessage?: (messageId: string) => Promise<void>
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>
  reactionPendingByMessage: Record<string, string | null>
}) {
  const threadRootId = resolveThreadRootId(message)
  const threadReplies = threadMessagesByRootId[threadRootId] ?? []
  const threadLoading = threadLoadingByRootId[threadRootId] ?? false
  const threadError = threadErrorsByRootId[threadRootId] ?? null
  const threadNextCursor = threadNextCursorByRootId[threadRootId] ?? null
  const threadReplyCount = (message as UnifiedMessage & { threadReplyCount?: number }).threadReplyCount
  const replyCount = Math.max(
    typeof threadReplyCount === 'number' ? threadReplyCount : 0,
    threadReplies.length,
  )
  const lastReplyIso =
    message.threadLastReplyAt ??
    (threadReplies.length > 0 ? threadReplies[threadReplies.length - 1]?.createdAt ?? null : null)
  const unreadCount = Math.max(0, threadUnreadCountsByRootId[threadRootId] ?? 0)
  const beforeMs = lastReplyIso ? Date.parse(lastReplyIso) : NaN

  const handleToggle = useCallback(() => {
    const resolvedBeforeMs = Number.isFinite(beforeMs) ? beforeMs : Date.now()
    handleThreadToggle(threadRootId, resolvedBeforeMs)
  }, [beforeMs, handleThreadToggle, threadRootId])

  const handleRetry = useCallback(() => {
    handleRetryThreadLoad(threadRootId)
  }, [handleRetryThreadLoad, threadRootId])

  const handleLoadMore = useCallback(() => {
    handleLoadMoreThread(threadRootId)
  }, [handleLoadMoreThread, threadRootId])

  const handleReplyClick = useCallback(() => {
    handleReply(message)
  }, [handleReply, message])

  const renderReply = useCallback(
    (reply: CollaborationMessage) => (
      <UnifiedThreadReplyCard
        reply={reply}
        currentUserId={currentUserId}
        editingMessageId={editingMessageId}
        activeDeletingMessageId={activeDeletingMessageId}
        messageUpdatingId={messageUpdatingId}
        reactionPendingEmoji={reactionPendingByMessage[reply.id] ?? null}
        onToggleReaction={handleReaction}
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

  if (headerType !== 'channel' || message.deleted) {
    return null
  }

  return (
    <ThreadSection
      threadRootId={threadRootId}
      replyCount={replyCount}
      unreadCount={unreadCount}
      lastReplyIso={lastReplyIso}
      isOpen={Boolean(expanded[threadRootId])}
      isLoading={threadLoading}
      error={threadError}
      hasNextCursor={Boolean(threadNextCursor)}
      replies={threadReplies}
      onToggle={handleToggle}
      onRetry={handleRetry}
      onLoadMore={handleLoadMore}
      onReply={handleReplyClick}
      canReply={Boolean(onReply)}
      renderReply={renderReply}
    />
  )
}

function SwipeableMessageRenderer({
  children,
  currentUserId,
  handleReply,
  handleRequestDelete,
  message,
  onDeleteMessage,
  onReply,
}: {
  children: ReactNode
  currentUserId: string | null
  handleReply: (message: UnifiedMessage) => void
  handleRequestDelete: (messageId: string) => void
  message: UnifiedMessage
  onDeleteMessage?: (messageId: string) => Promise<void>
  onReply?: (message: UnifiedMessage) => void
}) {
  const handleMessageReply = useCallback(() => {
    handleReply(message)
  }, [handleReply, message])

  const handleMessageDelete = useCallback(() => {
    handleRequestDelete(message.id)
  }, [handleRequestDelete, message.id])

  return (
    <SwipeableMessage
      key={message.id}
      message={message}
      currentUserId={currentUserId}
      canDelete={!message.deleted && message.senderId === currentUserId && !!onDeleteMessage}
      onReply={!message.deleted && onReply ? handleMessageReply : undefined}
      onDelete={!message.deleted && onDeleteMessage ? handleMessageDelete : undefined}
    >
      {children}
    </SwipeableMessage>
  )
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
        onToggleReaction={handleReaction}
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
    (message: UnifiedMessage, children: ReactNode) => (
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
