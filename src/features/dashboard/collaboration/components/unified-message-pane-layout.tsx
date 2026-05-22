'use client'

import { useCallback } from 'react'
import type { ChangeEvent, ClipboardEvent, DragEvent, ReactNode, RefObject } from 'react'
import { Send } from 'lucide-react'

import type { ClientTeamMember } from '@/types/clients'

import type { PendingAttachment } from '../hooks/types'
import type { MessageListRenderers } from './message-list-render-context'
import { MessageList } from './message-list'
import type { UnifiedMessage } from './message-list-types'
import { MessageListRenderProvider } from './message-list-render-context'
import { UnifiedComposerSection, UnifiedConversationHeader } from './unified-message-pane-sections'
import type { MessagePaneHeaderInfo } from './unified-message-pane-types'
import {
  resolveUnifiedMessagePaneEmptyState,
  UnifiedMessagePaneDeleteConfirm,
  useUnifiedMessagePaneAttachHandler,
  useUnifiedMessagePaneMessageSearch,
} from './unified-message-pane-layout-sections'

export function UnifiedMessagePaneEmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center border-muted/40 h-full bg-background/50">
      <div className="text-center p-8">
        <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <Send className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">Select a conversation</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a conversation from the sidebar to start messaging
        </p>
      </div>
    </div>
  )
}

export type MessagePaneListState = {
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
}

export type MessagePaneComposerState = {
  focused: boolean
  sending: boolean
  pendingAttachments: boolean
  uploadingAttachments: boolean
}

export type MessagePaneSearchState = {
  canSearch: boolean
  active: boolean
}

type UnifiedMessagePaneConversationLayoutProps = {
  activeDeletingMessageId: string | null
  confirmingDeleteMessageId: string | null
  currentUserId: string | null
  currentUserRole?: string | null
  editingMessageId: string | null
  effectiveFocusMessageId: string | null
  effectiveFocusThreadId: string | null
  emptyState?: ReactNode
  fileInputRef: RefObject<HTMLInputElement | null>
  handleAttachmentInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleCancelDelete: () => void
  handleComposerBlurInternal: () => void
  handleComposerDragOver: (event: DragEvent<HTMLTextAreaElement>) => void
  handleComposerDrop: (event: DragEvent<HTMLTextAreaElement>) => void
  handleComposerFocusInternal: () => void
  handleComposerPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void
  handleConfirmDelete: () => void
  handleReaction: (messageId: string, emoji: string) => Promise<void>
  handleSend: () => Promise<void>
  listState: MessagePaneListState
  composerState: MessagePaneComposerState
  searchState: MessagePaneSearchState
  header: MessagePaneHeaderInfo
  messageInput: string
  messageListRenderers: MessageListRenderers
  messageSearchQuery: string
  messageUpdatingId: string | null
  messages: UnifiedMessage[]
  onAddAttachments?: (files: FileList | File[]) => void
  onDeleteMessage?: (messageId: string) => Promise<void>
  onLoadMore: () => void
  onMessageInputChange: (value: string) => void
  onMessageSearchChange?: (value: string) => void
  onRefresh?: () => Promise<void> | void
  onRemoveAttachment?: (attachmentId: string) => void
  onReply?: (message: UnifiedMessage) => void
  participants: ClientTeamMember[]
  pendingAttachments: PendingAttachment[]
  placeholder: string
  reactionPendingByMessage: Record<string, string | null>
  statusBanner?: ReactNode
  typingIndicator?: string
  uploadingAttachments: boolean
}

export function UnifiedMessagePaneConversationLayout({
  activeDeletingMessageId,
  confirmingDeleteMessageId,
  currentUserId,
  currentUserRole,
  editingMessageId,
  effectiveFocusMessageId,
  effectiveFocusThreadId,
  emptyState,
  fileInputRef,
  handleAttachmentInputChange,
  handleCancelDelete,
  handleComposerBlurInternal,
  handleComposerDragOver,
  handleComposerDrop,
  handleComposerFocusInternal,
  handleComposerPaste,
  handleConfirmDelete,
  handleReaction,
  handleSend,
  listState,
  composerState,
  searchState,
  header,
  messageInput,
  messageListRenderers,
  messageSearchQuery,
  messageUpdatingId,
  messages,
  onAddAttachments,
  onDeleteMessage,
  onLoadMore,
  onMessageInputChange,
  onMessageSearchChange,
  onRefresh,
  onRemoveAttachment,
  onReply,
  participants,
  pendingAttachments,
  placeholder,
  reactionPendingByMessage,
  statusBanner,
  typingIndicator,
}: UnifiedMessagePaneConversationLayoutProps) {
  const { loading: isLoading, loadingMore: isLoadingMore, hasMore } = listState
  const {
    focused: isComposerFocused,
    sending: isSending,
    pendingAttachments: hasPendingAttachments,
    uploadingAttachments,
  } = composerState
  const { canSearch: canSearchMessages, active: isMessageSearchActive } = searchState

  const { messageSearchOpen, handleToggleMessageSearch, searchBar } = useUnifiedMessagePaneMessageSearch({
    canSearchMessages,
    headerType: header.type,
    messageSearchQuery,
    messageSearchActive: isMessageSearchActive,
    resultCount: messages.length,
    onMessageSearchChange,
  })

  const handleAttachClick = useUnifiedMessagePaneAttachHandler({ fileInputRef })

  const handleConfirmDeleteChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleCancelDelete()
      }
    },
    [handleCancelDelete],
  )

  const resolvedEmptyState = resolveUnifiedMessagePaneEmptyState(isMessageSearchActive, emptyState)

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background/50 max-lg:min-h-[min(72dvh,640px)] lg:h-[640px]">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[100%] -left-[100%] size-[300%] animate-shimmer bg-gradient-to-br from-transparent via-muted/30 to-transparent opacity-50" />
      </div>
      <UnifiedConversationHeader
        header={header}
        canSearchMessages={canSearchMessages}
        messageSearchOpen={messageSearchOpen}
        onToggleMessageSearch={canSearchMessages && onMessageSearchChange ? handleToggleMessageSearch : undefined}
      />

      {statusBanner}

      {searchBar}

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <MessageListRenderProvider value={messageListRenderers}>
          <MessageList
            key={`${header.type}-${header.name}`}
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
            emptyState={resolvedEmptyState}
            variant={header.type === 'channel' ? 'channel' : 'dm'}
            editingMessageId={editingMessageId}
            focusMessageId={effectiveFocusMessageId}
            focusThreadId={effectiveFocusThreadId}
            typingIndicatorText={typingIndicator}
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
        onAttachClick={onAddAttachments ? handleAttachClick : undefined}
        fileInputRef={fileInputRef}
        onAttachmentInputChange={handleAttachmentInputChange}
        typingIndicator={typingIndicator}
      />

      <UnifiedMessagePaneDeleteConfirm
        confirmingDeleteMessageId={confirmingDeleteMessageId}
        activeDeletingMessageId={activeDeletingMessageId}
        onOpenChange={handleConfirmDeleteChange}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}
