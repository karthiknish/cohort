'use client';
import { useCallback, useMemo } from 'react';
import type { ChangeEvent, ClipboardEvent, DragEvent, ReactNode, RefObject } from 'react';
import { QuickPollButton, type MessagePoll } from './message-polls';
import type { ClientTeamMember } from '@/types/clients';
import type { PendingAttachment } from '../hooks/types';
import type { CollaborationMessage } from '@/types/collaboration';
import type { MessageListRenderers } from './message-list-render-context';
import type { UnifiedMessage } from './message-list-types';
import type { MessagePaneHeaderInfo } from './unified-message-pane-types';
import { UnifiedMessagePaneComposerSection, UnifiedMessagePaneConversationHeaderSection, UnifiedMessagePaneEmptyState, UnifiedMessagePaneMessagesSection, UnifiedMessagePaneShimmerBackdrop, } from './unified-message-pane-layout-sections';
import { useUnifiedMessagePaneAttachHandler } from './unified-message-pane-layout-hooks';
import { UnifiedMessagePaneMessageSearchBindings, type UnifiedMessagePaneMessageSearchApi, } from './unified-message-pane-message-search-slot';
import { resolveUnifiedMessagePaneEmptyState } from './unified-message-pane-layout-utils';
export { UnifiedMessagePaneEmptyState } from './unified-message-pane-layout-sections';
export type MessagePaneListState = {
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
};
export type MessagePaneComposerState = {
    focused: boolean;
    sending: boolean;
    pendingAttachments: boolean;
    uploadingAttachments: boolean;
};
export type MessagePaneSearchState = {
    canSearch: boolean;
    active: boolean;
};
type UnifiedMessagePaneConversationLayoutProps = {
    activeDeletingMessageId: string | null;
    confirmingDeleteMessageId: string | null;
    currentUserId: string | null;
    currentUserRole?: string | null;
    editingMessageId: string | null;
    effectiveFocusMessageId: string | null;
    effectiveFocusThreadId: string | null;
    emptyState?: ReactNode;
    fileInputRef: RefObject<HTMLInputElement | null>;
    handleAttachmentInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleCancelDelete: () => void;
    handleComposerBlurInternal: () => void;
    handleComposerDragOver: (event: DragEvent<HTMLTextAreaElement>) => void;
    handleComposerDrop: (event: DragEvent<HTMLTextAreaElement>) => void;
    handleComposerFocusInternal: () => void;
    handleComposerPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
    handleConfirmDelete: () => void;
    handleReaction: (messageId: string, emoji: string) => Promise<void>;
    handleSend: () => Promise<void>;
    listState: MessagePaneListState;
    composerState: MessagePaneComposerState;
    searchState: MessagePaneSearchState;
    header: MessagePaneHeaderInfo;
    messageInput: string;
    messageListRenderers: MessageListRenderers;
    messageSearchQuery: string;
    messageUpdatingId: string | null;
    messages: UnifiedMessage[];
    onAddAttachments?: (files: FileList | File[]) => void;
    onDeleteMessage?: (messageId: string) => Promise<void>;
    onLoadMore: () => void;
    onMessageInputChange: (value: string) => void;
    onMessageSearchChange?: (value: string) => void;
    onRefresh?: () => Promise<void> | void;
    onRemoveAttachment?: (attachmentId: string) => void;
    onReply?: (message: UnifiedMessage) => void;
    replyingToMessage?: CollaborationMessage | null;
    onCancelReply?: () => void;
    participants: ClientTeamMember[];
    pendingAttachments: PendingAttachment[];
    placeholder: string;
    reactionPendingByMessage: Record<string, string | null>;
    statusBanner?: ReactNode;
    typingIndicator?: string;
    uploadingAttachments: boolean;
    onCreatePoll?: (poll: Omit<MessagePoll, 'id' | 'createdAt'>) => Promise<void>;
    workspaceId?: string | null;
};
export function UnifiedMessagePaneConversationLayout({ activeDeletingMessageId, confirmingDeleteMessageId, currentUserId, currentUserRole, editingMessageId, effectiveFocusMessageId, effectiveFocusThreadId, emptyState, fileInputRef, handleAttachmentInputChange, handleCancelDelete, handleComposerBlurInternal, handleComposerDragOver, handleComposerDrop, handleComposerFocusInternal, handleComposerPaste, handleConfirmDelete, handleReaction, handleSend, listState, composerState, searchState, header, messageInput, messageListRenderers, messageSearchQuery, messageUpdatingId, messages, onAddAttachments, onDeleteMessage, onLoadMore, onMessageInputChange, onMessageSearchChange, onRefresh, onRemoveAttachment, onReply, replyingToMessage, onCancelReply, participants, pendingAttachments, placeholder, reactionPendingByMessage, statusBanner, typingIndicator, onCreatePoll, workspaceId, }: UnifiedMessagePaneConversationLayoutProps) {
    const { loading: isLoading, loadingMore: isLoadingMore, hasMore } = listState;
    const { focused: isComposerFocused, sending: isSending, pendingAttachments: hasPendingAttachments, uploadingAttachments, } = composerState;
    const { canSearch: canSearchMessages, active: isMessageSearchActive } = searchState;
    const composerToolbar = (() => {
        if (header.type !== 'channel' || !onCreatePoll) {
            return null;
        }
        return (<QuickPollButton workspaceId={workspaceId ?? null} userId={currentUserId} onCreate={onCreatePoll}/>);
    })();
    const handleAttachClick = useUnifiedMessagePaneAttachHandler({ fileInputRef });
    const handleConfirmDeleteChange = (open: boolean) => {
        if (!open) {
            handleCancelDelete();
        }
    };
    const resolvedEmptyState = resolveUnifiedMessagePaneEmptyState(isMessageSearchActive, emptyState);
    const messageSearchKey = header.conversationKey ?? header.type;
    return (<UnifiedMessagePaneMessageSearchBindings key={messageSearchKey} canSearchMessages={canSearchMessages} conversationKey={header.conversationKey} headerType={header.type} messageSearchQuery={messageSearchQuery} messageSearchActive={isMessageSearchActive} resultCount={messages.length} onMessageSearchChange={onMessageSearchChange}>
      {(messageSearch: UnifiedMessagePaneMessageSearchApi) => (<div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-muted/40 bg-background/50 shadow-sm max-lg:min-h-[min(72dvh,640px)] lg:h-[640px]">
      <UnifiedMessagePaneShimmerBackdrop />

      <UnifiedMessagePaneConversationHeaderSection header={header} canSearchMessages={canSearchMessages} messageSearchOpen={messageSearch.messageSearchOpen} onToggleMessageSearch={canSearchMessages && onMessageSearchChange ? messageSearch.handleToggleMessageSearch : undefined} statusBanner={statusBanner} searchBar={messageSearch.searchBar}/>

      <UnifiedMessagePaneMessagesSection header={header} messageListRenderers={messageListRenderers} messages={messages} currentUserId={currentUserId} currentUserRole={currentUserRole} isLoading={isLoading || isLoadingMore} hasMore={hasMore} onLoadMore={onLoadMore} onRefresh={onRefresh} onToggleReaction={handleReaction} reactionPendingByMessage={reactionPendingByMessage} onReply={onReply} onDeleteMessage={onDeleteMessage} activeDeletingMessageId={activeDeletingMessageId} messageUpdatingId={messageUpdatingId} emptyState={resolvedEmptyState} editingMessageId={editingMessageId} effectiveFocusMessageId={effectiveFocusMessageId} effectiveFocusThreadId={effectiveFocusThreadId}/>

      <UnifiedMessagePaneComposerSection pendingAttachments={pendingAttachments} uploadingAttachments={uploadingAttachments} isSending={isSending} onRemoveAttachment={onRemoveAttachment} isComposerFocused={isComposerFocused} hasPendingAttachments={hasPendingAttachments} messageInput={messageInput} onMessageInputChange={onMessageInputChange} onSend={handleSend} replyingToMessage={replyingToMessage} onCancelReply={onCancelReply} placeholder={placeholder} participants={participants} onFocus={handleComposerFocusInternal} onBlur={handleComposerBlurInternal} onDrop={handleComposerDrop} onDragOver={handleComposerDragOver} onPaste={handleComposerPaste} onAttachClick={onAddAttachments ? handleAttachClick : undefined} fileInputRef={fileInputRef} onAttachmentInputChange={handleAttachmentInputChange} typingIndicator={typingIndicator} composerToolbar={composerToolbar} confirmingDeleteMessageId={confirmingDeleteMessageId} activeDeletingMessageId={activeDeletingMessageId} onDeleteConfirmOpenChange={handleConfirmDeleteChange} onConfirmDelete={handleConfirmDelete} onCancelDelete={handleCancelDelete}/>
    </div>)}
    </UnifiedMessagePaneMessageSearchBindings>);
}
