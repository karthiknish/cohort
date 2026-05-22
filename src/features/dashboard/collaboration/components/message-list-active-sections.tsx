'use client'

import { useMemo } from 'react'

import {
  MessageListJumpToLatest,
  MessageListScrollBody,
} from './message-list-scroll-sections'
import type { UseMessageListControllerArgs } from './use-message-list-controller'
import { useMessageListController } from './use-message-list-controller'

type MessageListActiveBodyProps = UseMessageListControllerArgs & {
  variant?: 'channel' | 'dm'
  currentUserId: string | null
  showAvatars?: boolean
  editingMessageId?: string | null
  deletingMessageId?: string | null
  updatingMessageId?: string | null
}

export function MessageListActiveBody({
  variant = 'dm',
  currentUserId,
  showAvatars = true,
  editingMessageId,
  deletingMessageId,
  updatingMessageId,
  ...controllerArgs
}: MessageListActiveBodyProps) {
  const {
    scrollRef,
    messagesEndRef,
    groupedMessages,
    renderers,
    localReactionPending,
    highlightedMessageId,
    showJumpToLatest,
    reactionPendingByMessage: effectiveReactionPending,
    requestLoadOlder,
    scrollToLatest,
    handleScroll,
    handleReaction,
  } = useMessageListController(controllerArgs)

  const isChannel = variant === 'channel'

  const groupedMessagesProps = useMemo(
    () => ({
      currentUserId,
      highlightedMessageId,
      editingMessageId,
      deletingMessageId,
      updatingMessageId,
      localReactionPending,
      reactionPendingByMessage: effectiveReactionPending,
      renderers: renderers ?? {},
      showAvatars,
      onReact: handleReaction,
    }),
    [
      currentUserId,
      highlightedMessageId,
      editingMessageId,
      deletingMessageId,
      updatingMessageId,
      localReactionPending,
      effectiveReactionPending,
      renderers,
      showAvatars,
      handleReaction,
    ],
  )

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <MessageListScrollBody
        scrollRef={scrollRef}
        messagesEndRef={messagesEndRef}
        isChannel={isChannel}
        hasMore={controllerArgs.hasMore}
        isLoading={controllerArgs.isLoading}
        groupedMessages={groupedMessages}
        typingIndicatorText={controllerArgs.typingIndicatorText}
        onScroll={handleScroll}
        onLoadMore={requestLoadOlder}
        groupedMessagesProps={groupedMessagesProps}
      />

      <MessageListJumpToLatest visible={showJumpToLatest} onClick={scrollToLatest} />
    </div>
  )
}
