'use client'

import { type ChangeEvent, useCallback, useMemo, useRef } from 'react'
import { Send } from 'lucide-react'

import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { CollaborationMessage } from '@/types/collaboration'
import type { ClientTeamMember } from '@/types/clients'

import type { PendingAttachment } from '../hooks/types'
import { MessageList, type UnifiedMessage } from './message-list'
import { MessageListRenderProvider } from './message-list-render-context'
import { MessageSearchBar, NoSearchResultsState } from './message-pane-parts'
import { SwipeableMessage } from './swipeable-message'
import { ThreadSection } from './thread-section'
import {
  renderDeletedMessageInfo,
  renderMessageAttachmentsContent,
  renderMessageContentBlock,
  renderMessageEditForm,
  SharedPlatformBadges,
  UnifiedComposerSection,
  UnifiedConversationHeader,
  UnifiedMessageActionBar,
  UnifiedThreadReplyCard,
} from './unified-message-pane-sections'
import type { MessagePaneHeaderInfo } from './unified-message-pane-types'
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
  const scrollContainerRef = useRef<HTMLDivElement>(null)
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

  const renderMessageExtras = useCallback(
    (message: UnifiedMessage) => <SharedPlatformBadges platforms={message.sharedTo as Array<'email'> | undefined} />,
    [],
  )

  const renderMessageActions = useCallback(
    (message: UnifiedMessage) => (
      <UnifiedMessageActionBar
        headerType={header?.type ?? 'dm'}
        message={message}
        currentUserId={currentUserId}
        activeDeletingMessageId={activeDeletingMessageId}
        messageUpdatingId={messageUpdatingId}
        sharingTo={sharingTo}
        onReply={onReply ? handleReply : undefined}
        onStartEdit={onEditMessage ? handleStartEdit : undefined}
        onRequestDelete={onDeleteMessage ? handleRequestDelete : undefined}
        onShare={onShareToPlatform ? handleShare : undefined}
      />
    ),
    [activeDeletingMessageId, currentUserId, handleReply, handleRequestDelete, handleShare, handleStartEdit, header?.type, messageUpdatingId, onDeleteMessage, onEditMessage, onReply, onShareToPlatform, sharingTo],
  )

  const renderMessageContent = useCallback((message: UnifiedMessage) => {
    const originalMessage = channelMessagesById.get(message.id)

    return renderMessageContentBlock(
      message,
      originalMessage,
      isMessageSearchActive ? messageSearchHighlights : undefined,
    )
  }, [channelMessagesById, isMessageSearchActive, messageSearchHighlights])

  const renderMessageAttachments = useCallback((message: UnifiedMessage) => {
    return renderMessageAttachmentsContent(message)
  }, [])

  const renderDeletedInfo = useCallback((message: UnifiedMessage) => {
    return renderDeletedMessageInfo(message, deletedInfoByMessage)
  }, [deletedInfoByMessage])

  const renderEditForm = useCallback((message: UnifiedMessage) => {
    return renderMessageEditForm(
      message,
      editingMessageId,
      editingValue,
      setEditingValue,
      handleConfirmEdit,
      handleCancelEdit,
      messageUpdatingId === message.id,
      editingPreview,
    )
  }, [editingMessageId, editingPreview, editingValue, handleCancelEdit, handleConfirmEdit, messageUpdatingId, setEditingValue])

  const renderThreadReply = useCallback((reply: CollaborationMessage) => {
    return (
      <UnifiedThreadReplyCard
        reply={reply}
        currentUserId={currentUserId}
        editingMessageId={editingMessageId}
        activeDeletingMessageId={activeDeletingMessageId}
        messageUpdatingId={messageUpdatingId}
        reactionPendingEmoji={reactionPendingByMessage[reply.id] ?? null}
        onToggleReaction={(messageId, emoji) => {
          void handleReaction(messageId, emoji)
        }}
        onStartEdit={onEditMessage ? handleStartEdit : undefined}
        onRequestDelete={onDeleteMessage ? handleRequestDelete : undefined}
      />
    )
  }, [activeDeletingMessageId, currentUserId, editingMessageId, handleReaction, handleRequestDelete, handleStartEdit, messageUpdatingId, onDeleteMessage, onEditMessage, reactionPendingByMessage])

  const renderThreadSection = useCallback((message: UnifiedMessage) => {
    if (header?.type !== 'channel' || message.deleted) {
      return null
    }

    const original = channelMessagesById.get(message.id)
    const threadRootId = resolveThreadRootId(message)
    const threadReplies = threadMessagesByRootId[threadRootId] ?? []
    const threadLoading = threadLoadingByRootId[threadRootId] ?? false
    const threadError = threadErrorsByRootId[threadRootId] ?? null
    const threadNextCursor = threadNextCursorByRootId[threadRootId] ?? null
    const replyCount = Math.max(
      typeof original?.threadReplyCount === 'number'
        ? original.threadReplyCount
        : (typeof message.threadReplyCount === 'number' ? message.threadReplyCount : 0),
      threadReplies.length,
    )
    const lastReplyIso =
      original?.threadLastReplyAt ??
      message.threadLastReplyAt ??
      (threadReplies.length > 0 ? threadReplies[threadReplies.length - 1]?.createdAt ?? null : null)
    const unreadCount = Math.max(0, threadUnreadCountsByRootId[threadRootId] ?? 0)
    const beforeMs = lastReplyIso ? Date.parse(lastReplyIso) : NaN

    return (
      <ThreadSection
        threadRootId={threadRootId}
        replyCount={replyCount}
        unreadCount={unreadCount}
        lastReplyIso={lastReplyIso}
        isOpen={Boolean(expandedThreadIds[threadRootId])}
        isLoading={threadLoading}
        error={threadError}
        hasNextCursor={Boolean(threadNextCursor)}
        replies={threadReplies}
        onToggle={() =>
          handleThreadToggle(threadRootId, Number.isFinite(beforeMs) ? beforeMs : undefined)
        }
        onRetry={() => handleRetryThreadLoad(threadRootId)}
        onLoadMore={() => handleLoadMoreThread(threadRootId)}
        onReply={() => handleReply(message)}
        canReply={Boolean(onReply)}
        renderReply={renderThreadReply}
      />
    )
  }, [
    channelMessagesById,
    expandedThreadIds,
    handleLoadMoreThread,
    handleReply,
    handleRetryThreadLoad,
    handleThreadToggle,
    header?.type,
    onReply,
    resolveThreadRootId,
    renderThreadReply,
    threadErrorsByRootId,
    threadLoadingByRootId,
    threadMessagesByRootId,
    threadNextCursorByRootId,
    threadUnreadCountsByRootId,
  ])

  const renderMessageWrapper = useCallback((message: UnifiedMessage, children: React.ReactNode) => (
    <SwipeableMessage
      key={message.id}
      message={message}
      currentUserId={currentUserId}
      canDelete={!message.deleted && message.senderId === currentUserId && !!onDeleteMessage}
      onReply={!message.deleted && onReply ? () => handleReply(message) : undefined}
      onDelete={!message.deleted && onDeleteMessage ? () => handleRequestDelete(message.id) : undefined}
    >
      {children}
    </SwipeableMessage>
  ), [currentUserId, handleReply, handleRequestDelete, onDeleteMessage, onReply])

  const messageListRenderers = useMemo(() => ({
    renderDeletedInfo,
    renderEditForm,
    renderMessageActions,
    renderMessageAttachments,
    renderMessageContent,
    renderMessageExtras,
    renderMessageWrapper,
    renderThreadSection: header?.type === 'channel' ? renderThreadSection : undefined,
  }), [
    header?.type,
    renderDeletedInfo,
    renderEditForm,
    renderMessageActions,
    renderMessageAttachments,
    renderMessageContent,
    renderMessageExtras,
    renderMessageWrapper,
    renderThreadSection,
  ])

  if (!header) {
    return (
      <div className="flex-1 flex items-center justify-center border-muted/40 h-full bg-background/50">
        <div className="text-center p-8">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Select a conversation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[480px] flex-1 flex-col bg-background/50 lg:h-[640px] relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] animate-shimmer bg-gradient-to-br from-transparent via-muted/30 to-transparent opacity-50" />
      </div>
      <UnifiedConversationHeader header={header} />

      {canSearchMessages && onMessageSearchChange ? (
        <MessageSearchBar
          value={messageSearchQuery}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onMessageSearchChange(event.target.value)}
          resultCount={messages.length}
          isActive={isMessageSearchActive}
          placeholder={header.type === 'dm' ? 'Search messages in this conversation…' : 'Search messages in this channel…'}
        />
      ) : null}

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex flex-1 min-h-0 overflow-hidden">
        <MessageListRenderProvider value={messageListRenderers}>
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            isLoading={isLoading || isLoadingMore}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
            onRefresh={onRefresh}
            onToggleReaction={handleReaction}
            reactionPendingByMessage={reactionPendingByMessage}
            onReply={onReply}
            onDeleteMessage={onDeleteMessage}
            deletingMessageId={activeDeletingMessageId}
            updatingMessageId={messageUpdatingId}
            emptyState={isMessageSearchActive ? <NoSearchResultsState /> : emptyState}
            variant={header.type === 'channel' ? 'channel' : 'dm'}
            editingMessageId={editingMessageId}
            focusMessageId={effectiveFocusMessageId}
            focusThreadId={effectiveFocusThreadId}
          />
        </MessageListRenderProvider>
      </div>

      <UnifiedComposerSection
        pendingAttachments={pendingAttachments}
        uploadingAttachments={uploadingAttachments}
        isSending={isSending}
        onRemoveAttachment={onRemoveAttachment}
        isComposerFocused={isComposerFocused}
        hasPendingAttachments={hasPendingAttachments}
        messageInput={messageInput}
        onMessageInputChange={onMessageInputChange}
        onSend={handleSend}
        placeholder={placeholder}
        participants={participants}
        onFocus={handleComposerFocusInternal}
        onBlur={handleComposerBlurInternal}
        onDrop={handleComposerDrop}
        onDragOver={handleComposerDragOver}
        onPaste={handleComposerPaste}
        onAttachClick={onAddAttachments ? () => fileInputRef.current?.click() : undefined}
        fileInputRef={fileInputRef}
        onAttachmentInputChange={handleAttachmentInputChange}
        typingIndicator={typingIndicator}
      />

      <ConfirmDialog
        open={Boolean(confirmingDeleteMessageId)}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelDelete()
          }
        }}
        title="Delete message"
        description="This removes the message content for everyone in the conversation and keeps a deleted placeholder in the timeline."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={activeDeletingMessageId === confirmingDeleteMessageId}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}
