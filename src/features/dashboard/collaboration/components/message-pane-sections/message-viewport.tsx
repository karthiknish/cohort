'use client'

'use client'

import type { RefObject } from 'react'
import { createContext, use, useCallback, useMemo } from 'react'

import { LoaderCircle, RefreshCw } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'
import type { CollaborationMessage } from '@/types/collaboration'

import {
  extractUrlsFromContent,
  isLikelyImageUrl,
} from '../../utils'
import { MessageAttachments } from '../message-attachments'
import { ChatTypingIndicator } from '@/shared/ui/chat-typing-indicator'
import {
  DateSeparator,
  EmptyMessagesState,
  MessagesErrorState,
  NoSearchResultsState,
} from '../message-pane-parts'
import {
  DeletingOverlay,
  DeletedMessageInfo,
  MessageActionsBar,
  MessageAvatar,
  MessageEditForm,
  MessageHeader,
  ReplyActionsBar,
} from '../message-item-parts'
import { MessageList } from '../message-list'
import { toMessageContentComponent } from '../message-list-render-utils'
import { collaborationToUnifiedMessage } from '../message-list-utils'
import { MessageContent } from '../message-content'
import { MessageReactions } from '../message-reactions'
import { SharedPlatformIcons } from '../message-share-button'
import { ThreadSection } from '../thread-section'
import { ImageUrlPreview } from '../image-url-preview'
import { LinkPreviewCard } from '../link-preview-card'
import type { CollaborationFlattenedMessageItem } from './types'
import { CollaborationMessageItem } from './message-item-bundle'
import { CollaborationSearchMessageList } from './search-message-list'
import {
  COLLABORATION_MESSAGE_GROUP_CONTINUATION_DISPLAY,
  COLLABORATION_MESSAGE_GROUP_HEADER_DISPLAY,
} from '../message-pane-display-state'

type CollaborationMessageViewportProps = {
  canLoadMore: boolean
  channelMessages: CollaborationMessage[]
  currentUserId?: string | null
  currentUserRole?: string | null
  editingMessageId: string | null
  editingPreview: string
  editingValue: string
  expandedThreadIds: Record<string, boolean>
  flattenedMessages: CollaborationFlattenedMessageItem[]
  isLoading: boolean
  isSearchActive: boolean
  loadingMore: boolean
  messageDeletingId: string | null
  messageUpdatingId: string | null
  messagesEndRef: RefObject<HTMLDivElement | null>
  messagesError: string | null
  onRetryMessages?: () => void
  messagesRetrying?: boolean
  onConfirmDelete: (messageId: string) => void
  onConfirmEdit: () => void
  onCreateTask: (message: CollaborationMessage) => void
  onEditingValueChange: (value: string) => void
  onLoadMore?: () => void
  onLoadMoreThread: (threadRootId: string) => void
  onReply: (message: CollaborationMessage) => void
  onRetryThreadLoad: (threadRootId: string) => void
  onStartEdit: (message: CollaborationMessage) => void
  onThreadToggle: (threadRootId: string) => void
  onToggleReaction: (messageId: string, emoji: string) => void
  onCancelEdit: () => void
  reactionPendingByMessage: Record<string, string | null>
  threadErrorsByRootId: Record<string, string | null>
  threadLoadingByRootId: Record<string, boolean>
  threadMessagesByRootId: Record<string, CollaborationMessage[]>
  threadNextCursorByRootId: Record<string, string | null>
  visibleMessages: CollaborationMessage[]
  typingIndicator?: string
}

export function CollaborationMessageViewport({
  canLoadMore,
  channelMessages,
  currentUserId,
  currentUserRole,
  editingMessageId,
  editingPreview,
  editingValue,
  expandedThreadIds,
  flattenedMessages,
  isLoading,
  isSearchActive,
  loadingMore,
  messageDeletingId,
  messageUpdatingId,
  messagesEndRef,
  messagesError,
  onRetryMessages,
  messagesRetrying,
  onCancelEdit,
  onConfirmDelete,
  onConfirmEdit,
  onCreateTask,
  onEditingValueChange,
  onLoadMore,
  onLoadMoreThread,
  onReply,
  onRetryThreadLoad,
  onStartEdit,
  onThreadToggle,
  onToggleReaction,
  reactionPendingByMessage,
  threadErrorsByRootId,
  threadLoadingByRootId,
  threadMessagesByRootId,
  threadNextCursorByRootId,
  visibleMessages,
  typingIndicator,
}: CollaborationMessageViewportProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-4 p-4">
        {isLoading ? (
          <div className="flex justify-center py-6 text-muted-foreground">
            <LoaderCircle className="size-5 animate-spin" />
          </div>
        ) : null}

        {!isLoading && channelMessages.length === 0 && !messagesError && !isSearchActive ? <EmptyMessagesState /> : null}
        {!isLoading && isSearchActive && visibleMessages.length === 0 && !messagesError ? <NoSearchResultsState /> : null}
        {messagesError ? (
          <MessagesErrorState error={messagesError} onRetry={onRetryMessages} isRetrying={messagesRetrying} />
        ) : null}

        {!isLoading && !messagesError && !isSearchActive && canLoadMore && onLoadMore ? (
          <div className="flex justify-center">
            <Button type="button" variant="ghost" size="sm" onClick={onLoadMore} disabled={loadingMore} className="inline-flex items-center gap-2 text-xs">
              <RefreshCw className={loadingMore ? 'size-3.5 animate-spin' : 'size-3.5'} />
              {loadingMore ? 'Loading older messages…' : 'Load older messages'}
            </Button>
          </div>
        ) : null}

        {!isSearchActive ? (
          <div className="space-y-1">
            {flattenedMessages.map((item) => {
              if (item.type === 'separator') {
                return (
                  <div key={item.id} data-index={item.id}>
                    <DateSeparator label={item.label} />
                  </div>
                )
              }

              return (
                <div key={item.id} data-index={item.id}>
                  <CollaborationMessageItem
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                    editingMessageId={editingMessageId}
                    editingPreview={editingPreview}
                    editingValue={editingValue}
                    expandedThreadIds={expandedThreadIds}
                    message={item.message}
                    messageDeletingId={messageDeletingId}
                    messageUpdatingId={messageUpdatingId}
                    onCancelEdit={onCancelEdit}
                    onConfirmDelete={onConfirmDelete}
                    onConfirmEdit={onConfirmEdit}
                    onCreateTask={onCreateTask}
                    onEditingValueChange={onEditingValueChange}
                    onLoadMoreThread={onLoadMoreThread}
                    onReply={onReply}
                    onRetryThreadLoad={onRetryThreadLoad}
                    onStartEdit={onStartEdit}
                    onThreadToggle={onThreadToggle}
                    onToggleReaction={onToggleReaction}
                    reactionPendingByMessage={reactionPendingByMessage}
                    display={
                      item.isFirstInGroup
                        ? COLLABORATION_MESSAGE_GROUP_HEADER_DISPLAY
                        : COLLABORATION_MESSAGE_GROUP_CONTINUATION_DISPLAY
                    }
                    threadErrorsByRootId={threadErrorsByRootId}
                    threadLoadingByRootId={threadLoadingByRootId}
                    threadMessagesByRootId={threadMessagesByRootId}
                    threadNextCursorByRootId={threadNextCursorByRootId}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <CollaborationSearchMessageList
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            editingMessageId={editingMessageId}
            editingPreview={editingPreview}
            editingValue={editingValue}
            expandedThreadIds={expandedThreadIds}
            messageDeletingId={messageDeletingId}
            messageUpdatingId={messageUpdatingId}
            onCancelEdit={onCancelEdit}
            onConfirmDelete={onConfirmDelete}
            onConfirmEdit={onConfirmEdit}
            onCreateTask={onCreateTask}
            onEditingValueChange={onEditingValueChange}
            onLoadMoreThread={onLoadMoreThread}
            onReply={onReply}
            onRetryThreadLoad={onRetryThreadLoad}
            onStartEdit={onStartEdit}
            onThreadToggle={onThreadToggle}
            onToggleReaction={onToggleReaction}
            reactionPendingByMessage={reactionPendingByMessage}
            threadErrorsByRootId={threadErrorsByRootId}
            threadLoadingByRootId={threadLoadingByRootId}
            threadMessagesByRootId={threadMessagesByRootId}
            threadNextCursorByRootId={threadNextCursorByRootId}
            visibleMessages={visibleMessages}
          />
        )}

        {typingIndicator && !isSearchActive ? (
          <ChatTypingIndicator label={typingIndicator} variant="bubble" className="mt-2" />
        ) : null}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
