'use client'

import type { CollaborationMessage } from '@/types/collaboration'
import type { ClientTeamMember } from '@/types/clients'

import type { PendingAttachment } from '../hooks/types'
import type { UnifiedMessage } from './message-list'
import {
  UnifiedMessagePaneConversationLayout,
  UnifiedMessagePaneEmptyState,
} from './unified-message-pane-layout'
import type { MessagePaneHeaderInfo } from './unified-message-pane-types'
import { useUnifiedMessagePaneRenderers } from './unified-message-pane-renderers'
import { useUnifiedMessagePaneController } from './use-unified-message-pane-controller'

const EMPTY_PENDING_ATTACHMENTS: PendingAttachment[] = []
const EMPTY_MESSAGE_SEARCH_HIGHLIGHTS: string[] = []
const EMPTY_REACTION_PENDING_BY_MESSAGE: Record<string, string | null> = {}
const EMPTY_PARTICIPANTS: ClientTeamMember[] = []
const EMPTY_THREAD_MESSAGES_BY_ROOT_ID: Record<string, CollaborationMessage[]> = {}
const EMPTY_THREAD_NEXT_CURSOR_BY_ROOT_ID: Record<string, string | null> = {}
const EMPTY_THREAD_LOADING_BY_ROOT_ID: Record<string, boolean> = {}
const EMPTY_THREAD_ERRORS_BY_ROOT_ID: Record<string, string | null> = {}
const EMPTY_THREAD_UNREAD_COUNTS_BY_ROOT_ID: Record<string, number> = {}

export interface UnifiedMessagePaneProps {
  header: MessagePaneHeaderInfo | null
  messages: UnifiedMessage[]
  currentUserId: string | null
  currentUserRole?: string | null
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  onRefresh?: () => Promise<void> | void
  messageSearchQuery?: string
  onMessageSearchChange?: (value: string) => void
  messageSearchHighlights?: string[]
  messageInput: string
  onMessageInputChange: (value: string) => void
  onSendMessage: (content: string) => Promise<void>
  isSending: boolean
  pendingAttachments?: PendingAttachment[]
  uploadingAttachments?: boolean
  onAddAttachments?: (files: FileList | File[]) => void
  onRemoveAttachment?: (attachmentId: string) => void
  onToggleReaction: (messageId: string, emoji: string) => Promise<void>
  reactionPendingByMessage?: Record<string, string | null>
  onReply?: (message: UnifiedMessage) => void
  onDeleteMessage?: (messageId: string) => Promise<void>
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>
  onShareToPlatform?: (message: UnifiedMessage, platform: 'email') => Promise<void>
  onCreateTask?: (message: UnifiedMessage) => void
  typingIndicator?: string
  onComposerFocus?: () => void
  onComposerBlur?: () => void
  emptyState?: React.ReactNode
  statusBanner?: React.ReactNode
  placeholder?: string
  participants?: ClientTeamMember[]
  channelMessages?: CollaborationMessage[]
  deletedInfoByMessage?: Record<string, { deletedBy: string | null; deletedAt: string | null }>
  threadMessagesByRootId?: Record<string, CollaborationMessage[]>
  threadNextCursorByRootId?: Record<string, string | null>
  threadLoadingByRootId?: Record<string, boolean>
  threadErrorsByRootId?: Record<string, string | null>
  threadUnreadCountsByRootId?: Record<string, number>
  onLoadThreadReplies?: (threadRootId: string) => Promise<void> | void
  onLoadMoreThreadReplies?: (threadRootId: string) => Promise<void> | void
  onMarkThreadAsRead?: (threadRootId: string, beforeMs?: number) => Promise<void> | void
  focusMessageId?: string | null
  focusThreadId?: string | null
  messageUpdatingId?: string | null
  messageDeletingId?: string | null
}

export function UnifiedMessagePane({
  header,
  messages,
  currentUserId,
  currentUserRole,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onRefresh,
  messageSearchQuery = '',
  onMessageSearchChange,
  messageSearchHighlights = EMPTY_MESSAGE_SEARCH_HIGHLIGHTS,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  isSending,
  pendingAttachments = EMPTY_PENDING_ATTACHMENTS,
  uploadingAttachments = false,
  onAddAttachments,
  onRemoveAttachment,
  onToggleReaction,
  reactionPendingByMessage = EMPTY_REACTION_PENDING_BY_MESSAGE,
  onReply,
  onDeleteMessage,
  onEditMessage,
  onShareToPlatform,
  typingIndicator,
  onComposerFocus,
  onComposerBlur,
  emptyState,
  statusBanner,
  placeholder = 'Type a message...',
  participants = EMPTY_PARTICIPANTS,
  channelMessages,
  deletedInfoByMessage,
  threadMessagesByRootId = EMPTY_THREAD_MESSAGES_BY_ROOT_ID,
  threadNextCursorByRootId = EMPTY_THREAD_NEXT_CURSOR_BY_ROOT_ID,
  threadLoadingByRootId = EMPTY_THREAD_LOADING_BY_ROOT_ID,
  threadErrorsByRootId = EMPTY_THREAD_ERRORS_BY_ROOT_ID,
  threadUnreadCountsByRootId = EMPTY_THREAD_UNREAD_COUNTS_BY_ROOT_ID,
  onLoadThreadReplies,
  onLoadMoreThreadReplies,
  onMarkThreadAsRead,
  focusMessageId = null,
  focusThreadId = null,
  messageUpdatingId = null,
  messageDeletingId = null,
}: UnifiedMessagePaneProps) {
  const {
    activeDeletingMessageId,
    channelMessagesById,
    confirmingDeleteMessageId,
    editingMessageId,
    editingPreview,
    editingValue,
    effectiveFocusMessageId,
    effectiveFocusThreadId,
    expandedThreadIds,
    fileInputRef,
    handleAttachmentInputChange,
    handleCancelDelete,
    handleCancelEdit,
    handleComposerBlurInternal,
    handleComposerDragOver,
    handleComposerDrop,
    handleComposerFocusInternal,
    handleComposerPaste,
    handleConfirmDelete,
    handleConfirmEdit,
    handleLoadMoreThread,
    handleReaction,
    handleReply,
    handleRequestDelete,
    handleRetryThreadLoad,
    handleSend,
    handleShare,
    handleStartEdit,
    handleThreadToggle,
    hasPendingAttachments,
    isComposerFocused,
    setEditingValue,
    sharingTo,
    resolveThreadRootId,
  } = useUnifiedMessagePaneController({
    header,
    channelMessages,
    threadMessagesByRootId,
    threadLoadingByRootId,
    threadErrorsByRootId,
    focusMessageId,
    focusThreadId,
    onToggleReaction,
    onReply,
    onDeleteMessage,
    onEditMessage,
    onShareToPlatform,
    messageInput,
    onSendMessage,
    isSending,
    uploadingAttachments,
    onComposerFocus,
    onComposerBlur,
    onAddAttachments,
    onLoadThreadReplies,
    onMarkThreadAsRead,
    onLoadMoreThreadReplies,
    pendingAttachments,
    messageDeletingId,
    messageUpdatingId,
  })
  const canSearchMessages = Boolean(onMessageSearchChange)
  const isMessageSearchActive = messageSearchQuery.trim().length > 0

  const messageListRenderers = useUnifiedMessagePaneRenderers({
    activeDeletingMessageId,
    channelMessagesById,
    currentUserId,
    deletedInfoByMessage,
    editingMessageId,
    editingPreview,
    editingValue,
    expandedThreadIds,
    headerType: header?.type,
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
  })

  if (!header) {
    return <UnifiedMessagePaneEmptyState />
  }

  return (
    <UnifiedMessagePaneConversationLayout
      activeDeletingMessageId={activeDeletingMessageId}
      canSearchMessages={canSearchMessages}
      confirmingDeleteMessageId={confirmingDeleteMessageId}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
      editingMessageId={editingMessageId}
      effectiveFocusMessageId={effectiveFocusMessageId}
      effectiveFocusThreadId={effectiveFocusThreadId}
      emptyState={emptyState}
      fileInputRef={fileInputRef}
      handleAttachmentInputChange={handleAttachmentInputChange}
      handleCancelDelete={handleCancelDelete}
      handleComposerBlurInternal={handleComposerBlurInternal}
      handleComposerDragOver={handleComposerDragOver}
      handleComposerDrop={handleComposerDrop}
      handleComposerFocusInternal={handleComposerFocusInternal}
      handleComposerPaste={handleComposerPaste}
      handleConfirmDelete={handleConfirmDelete}
      handleReaction={handleReaction}
      handleSend={handleSend}
      hasMore={hasMore}
      hasPendingAttachments={hasPendingAttachments}
      header={header}
      isComposerFocused={isComposerFocused}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      isMessageSearchActive={isMessageSearchActive}
      isSending={isSending}
      messageInput={messageInput}
      messageListRenderers={messageListRenderers}
      messageSearchQuery={messageSearchQuery}
      messageUpdatingId={messageUpdatingId}
      messages={messages}
      onAddAttachments={onAddAttachments}
      onDeleteMessage={onDeleteMessage}
      onLoadMore={onLoadMore}
      onMessageInputChange={onMessageInputChange}
      onMessageSearchChange={onMessageSearchChange}
      onRefresh={onRefresh}
      onRemoveAttachment={onRemoveAttachment}
      onReply={onReply}
      participants={participants}
      pendingAttachments={pendingAttachments}
      placeholder={placeholder}
      reactionPendingByMessage={reactionPendingByMessage}
      statusBanner={statusBanner}
      typingIndicator={typingIndicator}
      uploadingAttachments={uploadingAttachments}
    />
  )
}
