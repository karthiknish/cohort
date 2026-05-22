'use client'

import { Fragment } from 'react'

import { cn } from '@/lib/utils'

import {
  ChannelMessageCardWithPending,
  DirectMessageCard,
  MessageDateSeparator,
} from './message-list-sections'
import type { MessageListRenderers } from './message-list-sections'
import type { UnifiedMessage } from './message-list-types'

type MessageListMessageEntryProps = {
  message: UnifiedMessage
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

export function MessageListMessageEntry({
  message,
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
}: MessageListMessageEntryProps) {
  const isEditing = editingMessageId === message.id
  const isDeleting = deletingMessageId === message.id
  const isUpdating = updatingMessageId === message.id

  const content = isChannel ? (
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
  ) : (
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
      {renderMessageWrapper ? renderMessageWrapper(message, content) : content}
    </Fragment>
  )
}

type MessageListDayGroupProps = {
  date: string
  messages: UnifiedMessage[]
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

export function MessageListDayGroup({
  date,
  messages,
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
}: MessageListDayGroupProps) {
  return (
    <div key={date}>
      <MessageDateSeparator date={date} />

      <div className={cn('space-y-3', isChannel && 'space-y-1')}>
        {messages.map((message) => (
          <MessageListMessageEntry
            key={message.id}
            message={message}
            isChannel={isChannel}
            currentUserId={currentUserId}
            highlightedMessageId={highlightedMessageId}
            editingMessageId={editingMessageId}
            deletingMessageId={deletingMessageId}
            updatingMessageId={updatingMessageId}
            localReactionPending={localReactionPending}
            reactionPendingByMessage={reactionPendingByMessage}
            renderers={renderers}
            showAvatars={showAvatars}
            onReact={onReact}
            renderMessageWrapper={renderMessageWrapper}
          />
        ))}
      </div>
    </div>
  )
}
