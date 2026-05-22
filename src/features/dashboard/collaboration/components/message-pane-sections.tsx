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
} from '../utils'
import { MessageAttachments } from './message-attachments'
import { ChatTypingIndicator } from '@/shared/ui/chat-typing-indicator'
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
import { MessageList } from './message-list'
import { toMessageContentComponent } from './message-list-render-utils'
import { collaborationToUnifiedMessage } from './message-list-utils'
import { MessageContent } from './message-content'
import { MessageReactions } from './message-reactions'
import { SharedPlatformIcons } from './message-share-button'
import { ThreadSection } from './thread-section'
import { ImageUrlPreview } from './image-url-preview'
import { LinkPreviewCard } from './link-preview-card'

export type CollaborationFlattenedMessageItem =
  | { id: string; type: 'separator'; label: string }
  | { id: string; type: 'message'; message: CollaborationMessage; isFirstInGroup: boolean }

import type { CollaborationMessageDisplayState } from './message-pane-display-state'
import {
  COLLABORATION_MESSAGE_GROUP_CONTINUATION_DISPLAY,
  COLLABORATION_MESSAGE_GROUP_HEADER_DISPLAY,
  SEARCH_THREAD_REPLY_DISPLAY,
} from './message-pane-display-state'

const DEFAULT_COLLABORATION_MESSAGE_DISPLAY: Required<CollaborationMessageDisplayState> = {
  isReply: false,
  isSearchResult: false,
  showAvatar: true,
  showHeader: true,
}

type CollaborationMessageItemProps = {
  currentUserId?: string | null
  currentUserRole?: string | null
  editingMessageId: string | null
  editingPreview: string
  editingValue: string
  expandedThreadIds: Record<string, boolean>
  display?: CollaborationMessageDisplayState
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

type CollaborationThreadReplyContextValue = Omit<CollaborationMessageReplyItemProps, 'message'>

const CollaborationThreadReplyContext = createContext<CollaborationThreadReplyContextValue | null>(null)

function CollaborationThreadReplyRenderer({ reply }: { reply: CollaborationMessage }) {
  const context = use(CollaborationThreadReplyContext)
  if (!context) {
    throw new Error('CollaborationThreadReplyRenderer requires CollaborationThreadReplyContext')
  }

  return <CollaborationMessageReplyItem message={reply} {...context} />
}

type SearchThreadReplyContextValue = Omit<CollaborationMessageItemProps, 'message'>

const SearchThreadReplyContext = createContext<SearchThreadReplyContextValue | null>(null)

function SearchThreadReplyRenderer({ reply }: { reply: CollaborationMessage }) {
  const context = use(SearchThreadReplyContext)
  if (!context) {
    throw new Error('SearchThreadReplyRenderer requires SearchThreadReplyContext')
  }

  return (
    <CollaborationMessageItem
      {...context}
      message={reply}
      display={SEARCH_THREAD_REPLY_DISPLAY}
    />
  )
}

export function CollaborationMessageItem({
  currentUserId,
  currentUserRole,
  editingMessageId,
  editingPreview,
  editingValue,
  expandedThreadIds,
  display,
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
  threadErrorsByRootId,
  threadLoadingByRootId,
  threadMessagesByRootId,
  threadNextCursorByRootId,
}: CollaborationMessageItemProps) {
  const resolvedDisplay = useMemo(
    () => ({ ...DEFAULT_COLLABORATION_MESSAGE_DISPLAY, ...display }),
    [display],
  )
  const { isReply, isSearchResult, showAvatar, showHeader } = resolvedDisplay
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

  const handleReaction = useCallback((emoji: string) => onToggleReaction(message.id, emoji), [onToggleReaction, message.id])
  const handleReply = useCallback(() => onReply(message), [onReply, message])
  const handleEdit = useCallback(() => onStartEdit(message), [onStartEdit, message])
  const handleDelete = useCallback(() => onConfirmDelete(message.id), [onConfirmDelete, message.id])
  const handleCreateTask = useCallback(() => onCreateTask(message), [onCreateTask, message])

  const handleThreadToggle = useCallback(() => onThreadToggle(threadRootId), [onThreadToggle, threadRootId])
  const handleRetryThreadLoad = useCallback(() => onRetryThreadLoad(threadRootId), [onRetryThreadLoad, threadRootId])
  const handleLoadMoreThread = useCallback(() => onLoadMoreThread(threadRootId), [onLoadMoreThread, threadRootId])
  const permissions = useMemo(
    () => ({ canReact, canManage: canManageMessage }),
    [canReact, canManageMessage],
  )
  const pending = useMemo(
    () => ({
      updating: isUpdating,
      deleting: isDeleting,
      disableReactions: disableReactionActions,
    }),
    [isUpdating, isDeleting, disableReactionActions],
  )
  const threadPanel = useMemo(
    () => ({
      isOpen: isThreadOpen,
      isLoading: threadLoading,
      hasNextCursor: !!threadNextCursor,
    }),
    [isThreadOpen, threadLoading, threadNextCursor],
  )
  const threadReplyContext = useMemo(
    (): CollaborationThreadReplyContextValue => ({
      currentUserId,
      currentUserRole,
      editingMessageId,
      editingPreview,
      editingValue,
      expandedThreadIds,
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
      threadErrorsByRootId,
      threadLoadingByRootId,
      threadMessagesByRootId,
      threadNextCursorByRootId,
    }),
    [
      currentUserId,
      currentUserRole,
      editingMessageId,
      editingPreview,
      editingValue,
      expandedThreadIds,
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
      threadErrorsByRootId,
      threadLoadingByRootId,
      threadMessagesByRootId,
      threadNextCursorByRootId,
    ],
  )

  const containerClass = cn(
    'relative group flex items-start gap-3 px-6 py-2.5 motion-chromatic',
    isSearchResult && 'bg-accent/5 ring-1 ring-primary/20',
    !showAvatar && !isReply && 'py-1',
    isReply && 'ml-14 mt-2',
  )

  const bubbleClass = cn(
    'relative min-w-0 max-w-full flex-1 overflow-hidden flex flex-col space-y-1.5 rounded-2xl p-4 motion-chromatic',
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
            permissions={permissions}
            pending={pending}
            onReaction={handleReaction}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreateTask={handleCreateTask}
          />
        ) : (
          <ReplyActionsBar
            message={message}
            canManage={canManageMessage}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
            onToggle={handleReaction}
          />
        ) : null}

        {!message.isDeleted && message.sharedTo && message.sharedTo.length > 0 ? (
          <SharedPlatformIcons sharedTo={message.sharedTo} />
        ) : null}

        {message.isDeleted ? <DeletedMessageInfo deletedBy={message.deletedBy} deletedAt={message.deletedAt} /> : null}

        {!isReply && !message.isDeleted ? (
          <CollaborationThreadReplyContext.Provider value={threadReplyContext}>
          <ThreadSection
            threadRootId={threadRootId}
            replyCount={replyCount}
            lastReplyIso={lastReplyIso}
              panel={threadPanel}
            error={threadError}
            replies={threadReplies}
            onToggle={handleThreadToggle}
            onRetry={handleRetryThreadLoad}
            onLoadMore={handleLoadMoreThread}
            onReply={handleReply}
              ReplyRenderer={CollaborationThreadReplyRenderer}
          />
          </CollaborationThreadReplyContext.Provider>
        ) : null}
      </div>

      {!message.isDeleted ? <DeletingOverlay isDeleting={isDeleting} /> : null}
    </div>
  )
}

type CollaborationMessageReplyItemProps = {
  currentUserId?: string | null
  currentUserRole?: string | null
  editingMessageId: string | null
  editingPreview: string
  editingValue: string
  expandedThreadIds: Record<string, boolean>
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
  threadErrorsByRootId: Record<string, string | null>
  threadLoadingByRootId: Record<string, boolean>
  threadMessagesByRootId: Record<string, CollaborationMessage[]>
  threadNextCursorByRootId: Record<string, string | null>
}

function CollaborationMessageReplyItem({
  currentUserId,
  currentUserRole,
  editingMessageId,
  editingPreview,
  editingValue,
  expandedThreadIds,
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
  threadErrorsByRootId,
  threadLoadingByRootId,
  threadMessagesByRootId,
  threadNextCursorByRootId,
}: CollaborationMessageReplyItemProps) {
  return (
    <CollaborationMessageItem
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
      editingMessageId={editingMessageId}
      editingPreview={editingPreview}
      editingValue={editingValue}
      expandedThreadIds={expandedThreadIds}
      message={message}
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
  )
}

type SearchMessageActionsBarProps = {
  currentUserId?: string | null
  currentUserRole?: string | null
  message: CollaborationMessage
  messageDeletingId: string | null
  messageUpdatingId: string | null
  onConfirmDelete: (messageId: string) => void
  onCreateTask: (message: CollaborationMessage) => void
  onReply: (message: CollaborationMessage) => void
  onStartEdit: (message: CollaborationMessage) => void
  onToggleReaction: (messageId: string, emoji: string) => void
}

function SearchMessageActionsBar({
  currentUserId,
  currentUserRole,
  message,
  messageDeletingId,
  messageUpdatingId,
  onConfirmDelete,
  onCreateTask,
  onReply,
  onStartEdit,
  onToggleReaction,
}: SearchMessageActionsBarProps) {
  const canManageMessage =
    !message.isDeleted &&
    ((message.senderId && message.senderId === currentUserId) || currentUserRole === 'admin')

  const handleReaction = useCallback((emoji: string) => onToggleReaction(message.id, emoji), [onToggleReaction, message.id])
  const handleReply = useCallback(() => onReply(message), [onReply, message])
  const handleEdit = useCallback(() => onStartEdit(message), [onStartEdit, message])
  const handleDelete = useCallback(() => onConfirmDelete(message.id), [onConfirmDelete, message.id])
  const handleCreateTask = useCallback(() => onCreateTask(message), [onCreateTask, message])

  const permissions = useMemo(
    () => ({
      canReact: !message.isDeleted && !!currentUserId,
      canManage: canManageMessage,
    }),
    [message.isDeleted, currentUserId, canManageMessage],
  )
  const pending = useMemo(
    () => ({
      updating: messageUpdatingId === message.id,
      deleting: messageDeletingId === message.id,
      disableReactions: message.isDeleted || !currentUserId,
    }),
    [messageUpdatingId, message.id, messageDeletingId, message.isDeleted, currentUserId],
  )

  return (
    <MessageActionsBar
      message={message}
      permissions={permissions}
      pending={pending}
      onReaction={handleReaction}
      onReply={handleReply}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreateTask={handleCreateTask}
    />
  )
}

type SearchThreadSectionProps = {
  currentUserId?: string | null
  currentUserRole?: string | null
  editingMessageId: string | null
  editingPreview: string
  editingValue: string
  expandedThreadIds: Record<string, boolean>
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
  originalMessage: CollaborationMessage
  reactionPendingByMessage: Record<string, string | null>
  threadErrorsByRootId: Record<string, string | null>
  threadLoadingByRootId: Record<string, boolean>
  threadMessagesByRootId: Record<string, CollaborationMessage[]>
  threadNextCursorByRootId: Record<string, string | null>
}

function SearchThreadSection({
  currentUserId,
  currentUserRole,
  editingMessageId,
  editingPreview,
  editingValue,
  expandedThreadIds,
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
  originalMessage,
  reactionPendingByMessage,
  threadErrorsByRootId,
  threadLoadingByRootId,
  threadMessagesByRootId,
  threadNextCursorByRootId,
}: SearchThreadSectionProps) {
  const threadRootId = getThreadRootId(originalMessage)
  const threadReplies = threadMessagesByRootId[threadRootId] ?? []
  const threadLoading = threadLoadingByRootId[threadRootId] ?? false
  const threadError = threadErrorsByRootId[threadRootId] ?? null
  const threadNextCursor = threadNextCursorByRootId[threadRootId] ?? null
  const replyCount = Math.max(typeof originalMessage.threadReplyCount === 'number' ? originalMessage.threadReplyCount : 0, threadReplies.length)
  const lastReplyIso =
    originalMessage.threadLastReplyAt ?? (threadReplies.length > 0 ? threadReplies[threadReplies.length - 1]?.createdAt ?? null : null)

  const handleToggle = useCallback(() => onThreadToggle(threadRootId), [onThreadToggle, threadRootId])
  const handleRetry = useCallback(() => onRetryThreadLoad(threadRootId), [onRetryThreadLoad, threadRootId])
  const handleLoadMore = useCallback(() => onLoadMoreThread(threadRootId), [onLoadMoreThread, threadRootId])
  const handleReply = useCallback(() => onReply(originalMessage), [onReply, originalMessage])
  const searchThreadPanel = useMemo(
    () => ({
      isOpen: Boolean(expandedThreadIds[threadRootId]),
      isLoading: threadLoading,
      hasNextCursor: !!threadNextCursor,
    }),
    [expandedThreadIds, threadLoading, threadNextCursor, threadRootId],
  )
  const searchThreadReplyContext = useMemo(
    (): SearchThreadReplyContextValue => ({
      currentUserId,
      currentUserRole,
      editingMessageId,
      editingPreview,
      editingValue,
      expandedThreadIds,
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
      threadErrorsByRootId,
      threadLoadingByRootId,
      threadMessagesByRootId,
      threadNextCursorByRootId,
    }),
    [
      currentUserId,
      currentUserRole,
      editingMessageId,
      editingPreview,
      editingValue,
      expandedThreadIds,
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
      threadErrorsByRootId,
      threadLoadingByRootId,
      threadMessagesByRootId,
      threadNextCursorByRootId,
    ],
  )

  return (
    <SearchThreadReplyContext.Provider value={searchThreadReplyContext}>
    <ThreadSection
      threadRootId={threadRootId}
      replyCount={replyCount}
      lastReplyIso={lastReplyIso}
        panel={searchThreadPanel}
      error={threadError}
      replies={threadReplies}
      onToggle={handleToggle}
      onRetry={handleRetry}
      onLoadMore={handleLoadMore}
      onReply={handleReply}
        ReplyRenderer={SearchThreadReplyRenderer}
    />
    </SearchThreadReplyContext.Provider>
  )
}

type CollaborationSearchMessageListProps = {
  currentUserId?: string | null
  currentUserRole?: string | null
  editingMessageId: string | null
  editingPreview: string
  editingValue: string
  expandedThreadIds: Record<string, boolean>
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
  threadErrorsByRootId: Record<string, string | null>
  threadLoadingByRootId: Record<string, boolean>
  threadMessagesByRootId: Record<string, CollaborationMessage[]>
  threadNextCursorByRootId: Record<string, string | null>
  visibleMessages: CollaborationMessage[]
}

function CollaborationSearchMessageList({
  currentUserId,
  currentUserRole,
  editingMessageId,
  editingPreview,
  editingValue,
  expandedThreadIds,
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
  threadErrorsByRootId,
  threadLoadingByRootId,
  threadMessagesByRootId,
  threadNextCursorByRootId,
  visibleMessages,
}: CollaborationSearchMessageListProps) {
  const handleToggleReaction = useCallback(async (messageId: string, emoji: string) => {
    await onToggleReaction(messageId, emoji)
  }, [onToggleReaction])
  const emptyState = useMemo(() => <NoSearchResultsState />, [])
  const handleNoopLoadMore = useCallback(() => {}, [])

  const renderMessageContent = useCallback(
    (message: { id: string }) => {
      const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id)
      return originalMsg ? <MessageContent content={originalMsg.content ?? ''} mentions={originalMsg.mentions} /> : null
    },
    [visibleMessages],
  )

  const renderMessageAttachments = useCallback(
    (message: { id: string }) => {
      const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id)
      return originalMsg?.attachments && originalMsg.attachments.length > 0 ? <MessageAttachments attachments={originalMsg.attachments} /> : null
    },
    [visibleMessages],
  )

  const renderMessageExtras = useCallback(
    (message: { id: string }) => {
      const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id)
      return originalMsg?.sharedTo && originalMsg.sharedTo.length > 0 ? <SharedPlatformIcons sharedTo={originalMsg.sharedTo} /> : null
    },
    [visibleMessages],
  )

  const renderThreadSection = useCallback(
    (message: { id: string; deleted?: boolean }) => {
      const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id)
      if (!originalMsg || message.deleted) return null

      return (
        <SearchThreadSection
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
          originalMessage={originalMsg}
          reactionPendingByMessage={reactionPendingByMessage}
          threadErrorsByRootId={threadErrorsByRootId}
          threadLoadingByRootId={threadLoadingByRootId}
          threadMessagesByRootId={threadMessagesByRootId}
          threadNextCursorByRootId={threadNextCursorByRootId}
        />
      )
    },
    [
      currentUserId,
      currentUserRole,
      editingMessageId,
      editingPreview,
      editingValue,
      expandedThreadIds,
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
      threadErrorsByRootId,
      threadLoadingByRootId,
      threadMessagesByRootId,
      threadNextCursorByRootId,
      visibleMessages,
    ],
  )

  const renderMessageActions = useCallback(
    (message: { id: string }) => {
      const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id)
      if (!originalMsg) return null

      return (
        <SearchMessageActionsBar
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          message={originalMsg}
          messageDeletingId={messageDeletingId}
          messageUpdatingId={messageUpdatingId}
          onConfirmDelete={onConfirmDelete}
          onCreateTask={onCreateTask}
          onReply={onReply}
          onStartEdit={onStartEdit}
          onToggleReaction={onToggleReaction}
        />
      )
    },
    [currentUserId, currentUserRole, messageDeletingId, messageUpdatingId, onConfirmDelete, onCreateTask, onReply, onStartEdit, onToggleReaction, visibleMessages],
  )

  const renderEditForm = useCallback(
    (message: { id: string }) => {
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
    },
    [editingMessageId, editingPreview, editingValue, messageUpdatingId, onCancelEdit, onConfirmEdit, onEditingValueChange],
  )

  const renderDeletedInfo = useCallback(
    (message: { id: string }) => {
      const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id)
      return originalMsg ? <DeletedMessageInfo deletedBy={originalMsg.deletedBy} deletedAt={originalMsg.deletedAt} /> : null
    },
    [visibleMessages],
  )

  const messageListRenderers = useMemo(
    () => ({
      renderMessageContent: toMessageContentComponent(renderMessageContent),
      renderMessageAttachments,
      renderMessageExtras,
      renderThreadSection,
      renderMessageActions,
      renderEditForm,
      renderDeletedInfo,
    }),
    [
      renderDeletedInfo,
      renderEditForm,
      renderMessageActions,
      renderMessageAttachments,
      renderMessageContent,
      renderMessageExtras,
      renderThreadSection,
    ],
  )

  return (
    <MessageList
      messages={visibleMessages.map(collaborationToUnifiedMessage)}
      currentUserId={currentUserId ?? null}
      currentUserRole={currentUserRole}
      isLoading={false}
      hasMore={false}
      onLoadMore={handleNoopLoadMore}
      onToggleReaction={handleToggleReaction}
      reactionPendingByMessage={reactionPendingByMessage}
      variant="channel"
      showAvatars={true}
      renderers={messageListRenderers}
      editingMessageId={editingMessageId}
      deletingMessageId={messageDeletingId}
      updatingMessageId={messageUpdatingId}
      emptyState={emptyState}
    />
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
