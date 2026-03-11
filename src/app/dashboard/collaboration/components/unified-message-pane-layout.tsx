'use client'

import type { ChangeEvent, ClipboardEvent, DragEvent, ReactNode, RefObject } from 'react'
import { Send } from 'lucide-react'

import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { ClientTeamMember } from '@/types/clients'

import type { PendingAttachment } from '../hooks/types'
import type { MessageListRenderers } from './message-list-render-context'
import { MessageList, type UnifiedMessage } from './message-list'
import { MessageListRenderProvider } from './message-list-render-context'
import { MessageSearchBar, NoSearchResultsState } from './message-pane-parts'
import { UnifiedComposerSection, UnifiedConversationHeader } from './unified-message-pane-sections'
import type { MessagePaneHeaderInfo } from './unified-message-pane-types'

export function UnifiedMessagePaneEmptyState() {
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

type UnifiedMessagePaneConversationLayoutProps = {
  activeDeletingMessageId: string | null
  canSearchMessages: boolean
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
  hasMore: boolean
  hasPendingAttachments: boolean
  header: MessagePaneHeaderInfo
  isComposerFocused: boolean
  isLoading: boolean
  isLoadingMore: boolean
  isMessageSearchActive: boolean
  isSending: boolean
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
  canSearchMessages,
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
  hasMore,
  hasPendingAttachments,
  header,
  isComposerFocused,
  isLoading,
  isLoadingMore,
  isMessageSearchActive,
  isSending,
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
  uploadingAttachments,
}: UnifiedMessagePaneConversationLayoutProps) {
  return (
    <div className="flex min-h-[480px] flex-1 flex-col bg-background/50 lg:h-[640px] relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] animate-shimmer bg-gradient-to-br from-transparent via-muted/30 to-transparent opacity-50" />
      </div>
      <UnifiedConversationHeader header={header} />

      {statusBanner}

      {canSearchMessages && onMessageSearchChange ? (
        <MessageSearchBar
          value={messageSearchQuery}
          onChange={(event) => onMessageSearchChange(event.target.value)}
          resultCount={messages.length}
          isActive={isMessageSearchActive}
          placeholder={header.type === 'dm' ? 'Search messages in this conversation…' : 'Search messages in this channel…'}
        />
      ) : null}

      <div className="flex flex-1 min-h-0 overflow-hidden">
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