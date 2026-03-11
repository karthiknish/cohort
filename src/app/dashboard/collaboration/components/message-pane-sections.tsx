'use client'

import type { RefObject } from 'react'

import { LoaderCircle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CollaborationMessage } from '@/types/collaboration'

import {
  extractUrlsFromContent,
  isLikelyImageUrl,
} from '../utils'
import { MessageAttachments } from './message-attachments'
import {
  DateSeparator,
  EmptyMessagesState,
  MessagesErrorState,
  NoSearchResultsState,
} from './message-pane-parts'
import {
  DeletingOverlay,
  DeletedMessageInfo,
  MessageActionsBar,
  MessageAvatar,
  MessageEditForm,
  MessageHeader,
  ReplyActionsBar,
} from './message-item-parts'
import { MessageList, collaborationToUnifiedMessage } from './message-list'
import { MessageContent } from './message-content'
import { MessageReactions } from './message-reactions'
import { SharedPlatformIcons } from './message-share-button'
import { ThreadSection } from './thread-section'
import { ImageUrlPreview } from './image-url-preview'
import { LinkPreviewCard } from './link-preview-card'

export type CollaborationFlattenedMessageItem =
  | { id: string; type: 'separator'; label: string }
  | { id: string; type: 'message'; message: CollaborationMessage; isFirstInGroup: boolean }

type CollaborationMessageItemProps = {
  currentUserId?: string | null
  currentUserRole?: string | null
  editingMessageId: string | null
  editingPreview: string
  editingValue: string
  expandedThreadIds: Record<string, boolean>
  isReply?: boolean
  isSearchResult?: boolean
  message: CollaborationMessage
  messageDeletingId: string | null
  messageUpdatingId: string | null
  onCancelEdit: () => void
  onConfirmDelete: (messageId: string) => void
  onConfirmEdit: () => void
  onCreateTask: (message: CollaborationMessage) => void
  onEditingValueChange: (value: string) => void
  onLoadMoreThread: (threadRootId: string) => void
  onReply: (message: CollaborationMessage) => void
  onRetryThreadLoad: (threadRootId: string) => void
  onStartEdit: (message: CollaborationMessage) => void
  onThreadToggle: (threadRootId: string) => void
  onToggleReaction: (messageId: string, emoji: string) => void
  reactionPendingByMessage: Record<string, string | null>
  showAvatar?: boolean
  showHeader?: boolean
  threadErrorsByRootId: Record<string, string | null>
  threadLoadingByRootId: Record<string, boolean>
  threadMessagesByRootId: Record<string, CollaborationMessage[]>
  threadNextCursorByRootId: Record<string, string | null>
}

function getThreadRootId(message: CollaborationMessage): string {
  return typeof message.threadRootId === 'string' && message.threadRootId.trim().length > 0
    ? message.threadRootId.trim()
    : message.id
}

export function CollaborationMessageItem({
  currentUserId,
  currentUserRole,
  editingMessageId,
  editingPreview,
  editingValue,
  expandedThreadIds,
  isReply = false,
  isSearchResult = false,
  message,
  messageDeletingId,
  messageUpdatingId,
  onCancelEdit,
  onConfirmDelete,
  onConfirmEdit,
  onCreateTask,
  onEditingValueChange,
  onLoadMoreThread,
  onReply,
  onRetryThreadLoad,
  onStartEdit,
  onThreadToggle,
  onToggleReaction,
  reactionPendingByMessage,
  showAvatar = true,
  showHeader = true,
  threadErrorsByRootId,
  threadLoadingByRootId,
  threadMessagesByRootId,
  threadNextCursorByRootId,
}: CollaborationMessageItemProps) {
  const canManageMessage =
    !message.isDeleted &&
    ((message.senderId && message.senderId === currentUserId) || currentUserRole === 'admin')
  const canReact = !message.isDeleted && !!currentUserId
  const isDeleting = messageDeletingId === message.id
  const isUpdating = messageUpdatingId === message.id
  const reactionPendingEmoji = reactionPendingByMessage[message.id] ?? null
  const disableReactionActions =
    message.isDeleted || !currentUserId || Boolean(reactionPendingEmoji) || isDeleting || isUpdating

  const allUrlsFromContent = extractUrlsFromContent(message.content)
  const imageUrlPreviews = allUrlsFromContent.filter((url) => isLikelyImageUrl(url))
  const linkPreviews = allUrlsFromContent.filter((url) => !isLikelyImageUrl(url))

  const threadRootId = getThreadRootId(message)
  const threadReplies = threadMessagesByRootId[threadRootId] ?? []
  const threadLoading = threadLoadingByRootId[threadRootId] ?? false
  const threadError = threadErrorsByRootId[threadRootId] ?? null
  const threadNextCursor = threadNextCursorByRootId[threadRootId] ?? null
  const replyCount = Math.max(typeof message.threadReplyCount === 'number' ? message.threadReplyCount : 0, threadReplies.length)
  const isThreadOpen = Boolean(expandedThreadIds[threadRootId])
  const lastReplyIso =
    message.threadLastReplyAt ?? (threadReplies.length > 0 ? threadReplies[threadReplies.length - 1]?.createdAt ?? null : null)

  const containerClass = cn(
    'relative group flex items-start gap-3 px-6 py-2.5 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
    isSearchResult && 'bg-primary/5 ring-1 ring-primary/20',
    !showAvatar && !isReply && 'py-1',
    isReply && 'ml-14 mt-2',
  )

  const bubbleClass = cn(
    'relative min-w-0 flex-1 flex flex-col space-y-1.5 rounded-2xl p-4 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
    isReply ? 'border border-muted/30 bg-muted/10' : 'border border-transparent bg-muted/5 group-hover:border-muted/20 group-hover:bg-muted/10',
    (isSearchResult || isReply) && 'shadow-sm',
  )

  return (
    <div className={containerClass}>
      {showAvatar ? (
        <div className="shrink-0 pt-1">
          <MessageAvatar senderName={message.senderName} isReply={isReply} />
        </div>
      ) : (
        <div className="w-10 flex-shrink-0" />
      )}

      <div className={bubbleClass}>
        {showHeader ? (
          <MessageHeader
            senderName={message.senderName}
            senderRole={message.senderRole}
            createdAt={message.createdAt}
            isEdited={message.isEdited}
            isDeleted={message.isDeleted}
          />
        ) : null}

        {!isReply ? (
          <MessageActionsBar
            message={message}
            canReact={canReact}
            canManage={canManageMessage}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            disableReactionActions={disableReactionActions}
            onReaction={(emoji) => onToggleReaction(message.id, emoji)}
            onReply={() => onReply(message)}
            onEdit={() => onStartEdit(message)}
            onDelete={() => onConfirmDelete(message.id)}
            onCreateTask={() => onCreateTask(message)}
          />
        ) : (
          <ReplyActionsBar
            message={message}
            canManage={canManageMessage}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            onEdit={() => onStartEdit(message)}
            onDelete={() => onConfirmDelete(message.id)}
          />
        )}

        {editingMessageId === message.id ? (
          <MessageEditForm
            value={editingValue}
            onChange={onEditingValueChange}
            onConfirm={onConfirmEdit}
            onCancel={onCancelEdit}
            isUpdating={isUpdating}
            editingPreview={editingPreview}
          />
        ) : message.isDeleted ? (
          <p className="text-sm italic text-muted-foreground">Message removed</p>
        ) : (
          <MessageContent content={message.content ?? ''} mentions={message.mentions} />
        )}

        {!message.isDeleted && editingMessageId !== message.id && imageUrlPreviews.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {imageUrlPreviews.map((url) => (
              <ImageUrlPreview key={`${message.id}-img-${url}`} url={url} />
            ))}
          </div>
        ) : null}

        {!message.isDeleted && Array.isArray(message.attachments) && message.attachments.length > 0 ? (
          <MessageAttachments attachments={message.attachments} />
        ) : null}

        {!message.isDeleted && linkPreviews.length > 0 ? (
          <div className="space-y-3">
            {linkPreviews.map((url) => (
              <LinkPreviewCard key={`${message.id}-${url}`} url={url} />
            ))}
          </div>
        ) : null}

        {!message.isDeleted && editingMessageId !== message.id ? (
          <MessageReactions
            reactions={message.reactions ?? []}
            currentUserId={currentUserId}
            pendingEmoji={reactionPendingEmoji}
            disabled={disableReactionActions}
            onToggle={(emoji) => onToggleReaction(message.id, emoji)}
          />
        ) : null}

        {!message.isDeleted && message.sharedTo && message.sharedTo.length > 0 ? (
          <SharedPlatformIcons sharedTo={message.sharedTo} />
        ) : null}

        {message.isDeleted ? <DeletedMessageInfo deletedBy={message.deletedBy} deletedAt={message.deletedAt} /> : null}

        {!isReply && !message.isDeleted ? (
          <ThreadSection
            threadRootId={threadRootId}
            replyCount={replyCount}
            lastReplyIso={lastReplyIso}
            isOpen={isThreadOpen}
            isLoading={threadLoading}
            error={threadError}
            hasNextCursor={!!threadNextCursor}
            replies={threadReplies}
            onToggle={() => onThreadToggle(threadRootId)}
            onRetry={() => onRetryThreadLoad(threadRootId)}
            onLoadMore={() => onLoadMoreThread(threadRootId)}
            onReply={() => onReply(message)}
            renderReply={(reply) => (
              <CollaborationMessageItem
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                editingMessageId={editingMessageId}
                editingPreview={editingPreview}
                editingValue={editingValue}
                expandedThreadIds={expandedThreadIds}
                isReply={true}
                isSearchResult={isSearchResult}
                message={reply}
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
                showAvatar={true}
                showHeader={true}
                threadErrorsByRootId={threadErrorsByRootId}
                threadLoadingByRootId={threadLoadingByRootId}
                threadMessagesByRootId={threadMessagesByRootId}
                threadNextCursorByRootId={threadNextCursorByRootId}
              />
            )}
          />
        ) : null}
      </div>

      {!message.isDeleted ? <DeletingOverlay isDeleting={isDeleting} /> : null}
    </div>
  )
}

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
}: CollaborationMessageViewportProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-4 p-4">
        {isLoading ? (
          <div className="flex justify-center py-6 text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin" />
          </div>
        ) : null}

        {!isLoading && channelMessages.length === 0 && !messagesError && !isSearchActive ? <EmptyMessagesState /> : null}
        {!isLoading && isSearchActive && visibleMessages.length === 0 && !messagesError ? <NoSearchResultsState /> : null}
        {messagesError ? <MessagesErrorState error={messagesError} /> : null}

        {!isLoading && !messagesError && !isSearchActive && canLoadMore && onLoadMore ? (
          <div className="flex justify-center">
            <Button type="button" variant="ghost" size="sm" onClick={onLoadMore} disabled={loadingMore} className="inline-flex items-center gap-2 text-xs">
              <RefreshCw className={loadingMore ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
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
                    showAvatar={item.isFirstInGroup}
                    showHeader={item.isFirstInGroup}
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
          <MessageList
            messages={visibleMessages.map(collaborationToUnifiedMessage)}
            currentUserId={currentUserId ?? null}
            currentUserRole={currentUserRole}
            isLoading={false}
            hasMore={false}
            onLoadMore={() => {}}
            onToggleReaction={async (messageId, emoji) => onToggleReaction(messageId, emoji)}
            reactionPendingByMessage={reactionPendingByMessage}
            variant="channel"
            showAvatars={true}
            renderMessageContent={(message) => {
              const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id)
              return originalMsg ? <MessageContent content={originalMsg.content ?? ''} mentions={originalMsg.mentions} /> : null
            }}
            renderMessageAttachments={(message) => {
              const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id)
              return originalMsg?.attachments && originalMsg.attachments.length > 0 ? <MessageAttachments attachments={originalMsg.attachments} /> : null
            }}
            renderMessageExtras={(message) => {
              const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id)
              return originalMsg?.sharedTo && originalMsg.sharedTo.length > 0 ? <SharedPlatformIcons sharedTo={originalMsg.sharedTo} /> : null
            }}
            renderThreadSection={(message) => {
              const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id)
              if (!originalMsg || message.deleted) return null

              const threadRootId = getThreadRootId(originalMsg)
              const threadReplies = threadMessagesByRootId[threadRootId] ?? []
              const threadLoading = threadLoadingByRootId[threadRootId] ?? false
              const threadError = threadErrorsByRootId[threadRootId] ?? null
              const threadNextCursor = threadNextCursorByRootId[threadRootId] ?? null
              const replyCount = Math.max(typeof originalMsg.threadReplyCount === 'number' ? originalMsg.threadReplyCount : 0, threadReplies.length)
              const lastReplyIso =
                originalMsg.threadLastReplyAt ?? (threadReplies.length > 0 ? threadReplies[threadReplies.length - 1]?.createdAt ?? null : null)

              return (
                <ThreadSection
                  threadRootId={threadRootId}
                  replyCount={replyCount}
                  lastReplyIso={lastReplyIso}
                  isOpen={Boolean(expandedThreadIds[threadRootId])}
                  isLoading={threadLoading}
                  error={threadError}
                  hasNextCursor={!!threadNextCursor}
                  replies={threadReplies}
                  onToggle={() => onThreadToggle(threadRootId)}
                  onRetry={() => onRetryThreadLoad(threadRootId)}
                  onLoadMore={() => onLoadMoreThread(threadRootId)}
                  onReply={() => onReply(originalMsg)}
                  renderReply={(reply) => (
                    <CollaborationMessageItem
                      currentUserId={currentUserId}
                      currentUserRole={currentUserRole}
                      editingMessageId={editingMessageId}
                      editingPreview={editingPreview}
                      editingValue={editingValue}
                      expandedThreadIds={expandedThreadIds}
                      isReply={true}
                      isSearchResult={true}
                      message={reply}
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
                    />
                  )}
                />
              )
            }}
            renderMessageActions={(message) => {
              const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id)
              if (!originalMsg) return null

              const canManageMessage =
                !originalMsg.isDeleted &&
                ((originalMsg.senderId && originalMsg.senderId === currentUserId) || currentUserRole === 'admin')

              return (
                <MessageActionsBar
                  message={originalMsg}
                  canReact={!originalMsg.isDeleted && !!currentUserId}
                  canManage={canManageMessage}
                  isUpdating={messageUpdatingId === originalMsg.id}
                  isDeleting={messageDeletingId === originalMsg.id}
                  disableReactionActions={originalMsg.isDeleted || !currentUserId}
                  onReaction={(emoji) => onToggleReaction(originalMsg.id, emoji)}
                  onReply={() => onReply(originalMsg)}
                  onEdit={() => onStartEdit(originalMsg)}
                  onDelete={() => onConfirmDelete(originalMsg.id)}
                  onCreateTask={() => onCreateTask(originalMsg)}
                />
              )
            }}
            renderEditForm={(message) => {
              if (editingMessageId !== message.id) return null
              return (
                <MessageEditForm
                  value={editingValue}
                  onChange={onEditingValueChange}
                  onConfirm={onConfirmEdit}
                  onCancel={onCancelEdit}
                  isUpdating={messageUpdatingId === message.id}
                  editingPreview={editingPreview}
                />
              )
            }}
            renderDeletedInfo={(message) => {
              const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id)
              return originalMsg ? <DeletedMessageInfo deletedBy={originalMsg.deletedBy} deletedAt={originalMsg.deletedAt} /> : null
            }}
            editingMessageId={editingMessageId}
            deletingMessageId={messageDeletingId}
            updatingMessageId={messageUpdatingId}
            emptyState={<NoSearchResultsState />}
          />
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}