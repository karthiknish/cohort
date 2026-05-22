'use client'

import { Fragment } from 'react'
import { ArrowDown } from 'lucide-react'

import { ChatTypingIndicator } from '@/shared/ui/chat-typing-indicator'
import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'

import {
  ChannelMessageCardWithPending,
  DirectMessageCard,
  MessageDateSeparator,
  MessageListLoadMoreButton,
} from './message-list-sections'
import type { MessageListRenderers } from './message-list-sections'
import type { UnifiedMessage } from './message-list-types'

type MessageListJumpToLatestProps = {
  visible: boolean
  onClick: () => void
}

export function MessageListJumpToLatest({ visible, onClick }: MessageListJumpToLatestProps) {
  if (!visible) {
    return null
  }

  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-10">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="pointer-events-auto gap-1.5 shadow-md ring-1 ring-border/60"
        onClick={onClick}
      >
        <ArrowDown className="size-3.5" />
        Latest
      </Button>
    </div>
  )
}

type MessageListGroupedMessagesProps = {
  groupedMessages: Map<string, UnifiedMessage[]>
  isChannel: boolean
  currentUserId: string | null
  highlightedMessageId: string | null
  editingMessageId?: string | null
  deletingMessageId?: string | null
  updatingMessageId?: string | null
  localReactionPending: string | null
  reactionPendingByMessage: Record<string, string | null>
  renderers: MessageListRenderers
  showAvatars: boolean
  onReact: (messageId: string, emoji: string) => Promise<void>
  renderMessageWrapper?: (message: UnifiedMessage, children: React.ReactNode) => React.ReactNode
}

export function MessageListGroupedMessages({
  groupedMessages,
  isChannel,
  currentUserId,
  highlightedMessageId,
  editingMessageId,
  deletingMessageId,
  updatingMessageId,
  localReactionPending,
  reactionPendingByMessage,
  renderers,
  showAvatars,
  onReact,
  renderMessageWrapper,
}: MessageListGroupedMessagesProps) {
  return (
    <div className={cn('space-y-6', isChannel && 'space-y-1')}>
      {Array.from(groupedMessages.entries()).map(([date, msgs]) => (
        <div key={date}>
          <MessageDateSeparator date={date} />

          <div className={cn('space-y-3', isChannel && 'space-y-1')}>
            {msgs.map((message) => {
              const isEditing = editingMessageId === message.id
              const isDeleting = deletingMessageId === message.id
              const isUpdating = updatingMessageId === message.id

              if (isChannel) {
                const content = (
                  <ChannelMessageCardWithPending
                    currentUserId={currentUserId}
                    highlighted={message.id === highlightedMessageId}
                    isDeleting={isDeleting}
                    isEditing={isEditing}
                    isUpdating={isUpdating}
                    localReactionPending={localReactionPending}
                    message={message}
                    onReact={onReact}
                    reactionPendingByMessage={reactionPendingByMessage}
                    renderers={renderers}
                    showAvatars={showAvatars}
                  />
                )

                return (
                  <Fragment key={message.id}>
                    {renderMessageWrapper ? renderMessageWrapper(message, content) : content}
                  </Fragment>
                )
              }

              const messageContent = (
                <DirectMessageCard
                  currentUserId={currentUserId}
                  isDeleting={isDeleting}
                  isEditing={isEditing}
                  localReactionPending={localReactionPending}
                  message={message}
                  onReact={onReact}
                  reactionPendingByMessage={reactionPendingByMessage}
                  renderers={renderers}
                  showAvatars={showAvatars}
                />
              )

              return (
                <Fragment key={message.id}>
                  {renderMessageWrapper ? renderMessageWrapper(message, messageContent) : messageContent}
                </Fragment>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

type MessageListScrollBodyProps = {
  scrollRef: React.RefObject<HTMLDivElement | null>
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  isChannel: boolean
  hasMore: boolean
  isLoading: boolean
  groupedMessages: Map<string, UnifiedMessage[]>
  typingIndicatorText?: string
  onScroll: () => void
  onLoadMore: () => void
  groupedMessagesProps: Omit<MessageListGroupedMessagesProps, 'groupedMessages' | 'isChannel'>
}

export function MessageListScrollBody({
  scrollRef,
  messagesEndRef,
  isChannel,
  hasMore,
  isLoading,
  groupedMessages,
  typingIndicatorText,
  onScroll,
  onLoadMore,
  groupedMessagesProps,
}: MessageListScrollBodyProps) {
  return (
    <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
      <div className={cn('min-w-0 max-w-full p-4', isChannel && 'space-y-4')}>
        {hasMore && (
          <MessageListLoadMoreButton disabled={isLoading} isLoading={isLoading} onLoadMore={onLoadMore} />
        )}

        <MessageListGroupedMessages groupedMessages={groupedMessages} isChannel={isChannel} {...groupedMessagesProps} />

        {typingIndicatorText ? (
          <ChatTypingIndicator label={typingIndicatorText} variant="bubble" className="mt-2" />
        ) : null}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
