'use client'

import { cn } from '@/lib/utils'

import { MessageListDayGroup } from './message-list-group-sections'
import type { MessageListRenderers } from './message-list-sections'
import type { UnifiedMessage } from './message-list-types'

export type MessageListGroupedMessagesProps = {
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
        <MessageListDayGroup
          key={date}
          date={date}
          messages={msgs}
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
  )
}
