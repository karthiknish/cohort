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
import { CollaborationMessageItem } from './message-item-bundle'
import { getThreadRootId } from './message-thread-utils'
import { SearchThreadReplyRenderer } from './search-thread-reply'
import {
  SearchThreadReplyContext,
  type SearchThreadReplyContextValue,
} from './search-thread-reply-context'

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

export function CollaborationSearchMessageList({
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
