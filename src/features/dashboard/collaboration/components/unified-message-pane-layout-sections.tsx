'use client'

import {
  createElement,
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { Send } from 'lucide-react'

import type { ClientTeamMember } from '@/types/clients'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

import type { PendingAttachment } from '../hooks/types'
import type { MessageListRenderers } from './message-list-render-context'
import { MessageList } from './message-list'
import type { UnifiedMessage } from './message-list-types'
import { MessageListRenderProvider } from './message-list-render-context'
import { MessageSearchBar, NoSearchResultsState } from './message-pane-parts'
import { UnifiedComposerSection, UnifiedConversationHeader } from './unified-message-pane-sections'
import type { MessagePaneHeaderInfo } from './unified-message-pane-types'

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

export function UnifiedMessagePaneShimmerBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-[100%] -left-[100%] size-[300%] animate-shimmer bg-gradient-to-br from-transparent via-muted/30 to-transparent opacity-50" />
    </div>
  )
}

type UnifiedMessagePaneConversationHeaderSectionProps = {
  header: MessagePaneHeaderInfo
  canSearchMessages: boolean
  messageSearchOpen: boolean
  onToggleMessageSearch?: () => void
  statusBanner?: ReactNode
  searchBar: ReactNode
}

export function UnifiedMessagePaneConversationHeaderSection({
  header,
  canSearchMessages,
  messageSearchOpen,
  onToggleMessageSearch,
  statusBanner,
  searchBar,
}: UnifiedMessagePaneConversationHeaderSectionProps) {
  return (
    <>
      <UnifiedConversationHeader
        header={header}
        canSearchMessages={canSearchMessages}
        messageSearchOpen={messageSearchOpen}
        onToggleMessageSearch={onToggleMessageSearch}
      />
      {statusBanner}
      {searchBar}
    </>
  )
}

type UnifiedMessagePaneMessagesSectionProps = {
  header: MessagePaneHeaderInfo
  messageListRenderers: MessageListRenderers
  messages: UnifiedMessage[]
  currentUserId: string | null
  currentUserRole?: string | null
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onRefresh?: () => Promise<void> | void
  onToggleReaction: (messageId: string, emoji: string) => Promise<void>
  reactionPendingByMessage: Record<string, string | null>
  onReply?: (message: UnifiedMessage) => void
  onDeleteMessage?: (messageId: string) => Promise<void>
  activeDeletingMessageId: string | null
  messageUpdatingId: string | null
  emptyState?: ReactNode
  editingMessageId: string | null
  effectiveFocusMessageId: string | null
  effectiveFocusThreadId: string | null
  typingIndicator?: string
}

export function UnifiedMessagePaneMessagesSection({
  header,
  messageListRenderers,
  messages,
  currentUserId,
  currentUserRole,
  isLoading,
  hasMore,
  onLoadMore,
  onRefresh,
  onToggleReaction,
  reactionPendingByMessage,
  onReply,
  onDeleteMessage,
  activeDeletingMessageId,
  messageUpdatingId,
  emptyState,
  editingMessageId,
  effectiveFocusMessageId,
  effectiveFocusThreadId,
  typingIndicator,
}: UnifiedMessagePaneMessagesSectionProps) {
  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      <MessageListRenderProvider value={messageListRenderers}>
        <MessageList
          key={`${header.type}-${header.name}`}
          messages={messages}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          onRefresh={onRefresh}
          onToggleReaction={onToggleReaction}
          reactionPendingByMessage={reactionPendingByMessage}
          onReply={onReply}
          onDeleteMessage={onDeleteMessage}
          deletingMessageId={activeDeletingMessageId}
          updatingMessageId={messageUpdatingId}
          emptyState={emptyState}
          variant={header.type === 'channel' ? 'channel' : 'dm'}
          editingMessageId={editingMessageId}
          focusMessageId={effectiveFocusMessageId}
          focusThreadId={effectiveFocusThreadId}
          typingIndicatorText={typingIndicator}
        />
      </MessageListRenderProvider>
    </div>
  )
}

type UnifiedMessagePaneComposerSectionProps = {
  pendingAttachments: PendingAttachment[]
  uploadingAttachments: boolean
  isSending: boolean
  onRemoveAttachment?: (attachmentId: string) => void
  isComposerFocused: boolean
  hasPendingAttachments: boolean
  messageInput: string
  onMessageInputChange: (value: string) => void
  onSend: () => Promise<void>
  placeholder: string
  participants: ClientTeamMember[]
  onFocus: () => void
  onBlur: () => void
  onDrop: (event: DragEvent<HTMLTextAreaElement>) => void
  onDragOver: (event: DragEvent<HTMLTextAreaElement>) => void
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void
  onAttachClick?: () => void
  fileInputRef: RefObject<HTMLInputElement | null>
  onAttachmentInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  typingIndicator?: string
  confirmingDeleteMessageId: string | null
  activeDeletingMessageId: string | null
  onDeleteConfirmOpenChange: (open: boolean) => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
}

export function UnifiedMessagePaneComposerSection({
  pendingAttachments,
  uploadingAttachments,
  isSending,
  onRemoveAttachment,
  isComposerFocused,
  hasPendingAttachments,
  messageInput,
  onMessageInputChange,
  onSend,
  placeholder,
  participants,
  onFocus,
  onBlur,
  onDrop,
  onDragOver,
  onPaste,
  onAttachClick,
  fileInputRef,
  onAttachmentInputChange,
  typingIndicator,
  confirmingDeleteMessageId,
  activeDeletingMessageId,
  onDeleteConfirmOpenChange,
  onConfirmDelete,
  onCancelDelete,
}: UnifiedMessagePaneComposerSectionProps) {
  return (
    <>
      <UnifiedComposerSection
        pendingAttachments={pendingAttachments}
        uploadingAttachments={uploadingAttachments}
        isSending={isSending}
        onRemoveAttachment={onRemoveAttachment}
        isComposerFocused={isComposerFocused}
        hasPendingAttachments={hasPendingAttachments}
        messageInput={messageInput}
        onMessageInputChange={onMessageInputChange}
        onSend={onSend}
        placeholder={placeholder}
        participants={participants}
        onFocus={onFocus}
        onBlur={onBlur}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaste={onPaste}
        onAttachClick={onAttachClick}
        fileInputRef={fileInputRef}
        onAttachmentInputChange={onAttachmentInputChange}
        typingIndicator={typingIndicator}
      />

      <UnifiedMessagePaneDeleteConfirm
        confirmingDeleteMessageId={confirmingDeleteMessageId}
        activeDeletingMessageId={activeDeletingMessageId}
        onOpenChange={onDeleteConfirmOpenChange}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </>
  )
}

type UnifiedMessagePaneDeleteConfirmProps = {
  confirmingDeleteMessageId: string | null
  activeDeletingMessageId: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
}

export function UnifiedMessagePaneDeleteConfirm({
  confirmingDeleteMessageId,
  activeDeletingMessageId,
  onOpenChange,
  onConfirm,
  onCancel,
}: UnifiedMessagePaneDeleteConfirmProps) {
  return (
    <ConfirmDialog
      open={Boolean(confirmingDeleteMessageId)}
      onOpenChange={onOpenChange}
      title="Delete message"
      description="This removes the message content for everyone in the conversation and keeps a deleted placeholder in the timeline."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      isLoading={activeDeletingMessageId === confirmingDeleteMessageId}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
