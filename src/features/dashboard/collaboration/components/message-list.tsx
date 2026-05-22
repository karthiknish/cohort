'use client'

import {
  MessageListEmptyState,
  MessageListLoadingState,
} from './message-list-sections'
import { MessageListActiveBody } from './message-list-active-sections'
import type { MessageListProps } from './message-list-props'
import { useMessageListRenderers } from './message-list-render-utils'

export type { MessageListProps } from './message-list-props'

export function MessageList({
  messages,
  currentUserId,
  isLoading,
  hasMore,
  onLoadMore,
  onToggleReaction,
  reactionPendingByMessage,
  renderers: renderersProp,
  renderMessageExtras,
  renderMessageActions,
  renderMessageContent,
  renderMessageAttachments,
  renderMessageFooter,
  renderThreadSection,
  renderEditForm,
  renderDeletedInfo,
  renderMessageWrapper,
  emptyState,
  loadingSkeleton,
  variant = 'dm',
  showAvatars = true,
  editingMessageId,
  deletingMessageId,
  updatingMessageId,
  focusMessageId,
  focusThreadId,
  typingIndicatorText,
}: MessageListProps) {
  const renderers = useMessageListRenderers({
    renderers: renderersProp,
    renderMessageExtras,
    renderMessageActions,
    renderMessageContent,
    renderMessageAttachments,
    renderMessageFooter,
    renderThreadSection,
    renderEditForm,
    renderDeletedInfo,
    renderMessageWrapper,
  })

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <MessageListLoadingState loadingSkeleton={loadingSkeleton} />
      </div>
    )
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <MessageListEmptyState emptyState={emptyState} />
      </div>
    )
  }

  return (
    <MessageListActiveBody
      messages={messages}
      hasMore={hasMore}
      isLoading={isLoading}
      onLoadMore={onLoadMore}
      onToggleReaction={onToggleReaction}
      reactionPendingByMessage={reactionPendingByMessage}
      renderers={renderers}
      focusMessageId={focusMessageId}
      focusThreadId={focusThreadId}
      typingIndicatorText={typingIndicatorText}
      variant={variant}
      currentUserId={currentUserId}
      showAvatars={showAvatars}
      editingMessageId={editingMessageId}
      deletingMessageId={deletingMessageId}
      updatingMessageId={updatingMessageId}
    />
  )
}
