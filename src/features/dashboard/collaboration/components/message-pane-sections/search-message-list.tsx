'use client';
'use client';
import type { RefObject } from 'react';
import { createContext, use, useCallback, useMemo } from 'react';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';
import type { CollaborationMessage } from '@/types/collaboration';
import { extractUrlsFromContent, isLikelyImageUrl, } from '../../utils';
import { MessageAttachments } from '../message-attachments';
import { ChatTypingIndicator } from '@/shared/ui/chat-typing-indicator';
import { DateSeparator, EmptyMessagesState, MessagesErrorState, NoSearchResultsState, } from '../message-pane-parts';
import { DeletingOverlay, DeletedMessageInfo, MessageActionsBar, MessageAvatar, MessageEditForm, MessageHeader, ReplyActionsBar, } from '../message-item-parts';
import { MessageList } from '../message-list';
import { toMessageContentComponent } from '../message-list-render-utils';
import { collaborationToUnifiedMessage } from '../message-list-utils';
import { MessageContent } from '../message-content';
import { MessageReactions } from '../message-reactions';
import { SharedPlatformIcons } from '../message-share-button';
import { ThreadSection } from '../thread-section';
import { ImageUrlPreview } from '../image-url-preview';
import { LinkPreviewCard } from '../link-preview-card';
import { CollaborationMessageItem } from './message-item-bundle';
import { getThreadRootId } from './message-thread-utils';
import { SearchThreadReplyRenderer } from './search-thread-reply';
import { SearchThreadReplyContext, type SearchThreadReplyContextValue, } from './search-thread-reply-context';
type SearchMessageActionsBarProps = {
    currentUserId?: string | null;
    currentUserRole?: string | null;
    message: CollaborationMessage;
    messageDeletingId: string | null;
    messageUpdatingId: string | null;
    onConfirmDelete: (messageId: string) => void;
    onCreateTask: (message: CollaborationMessage) => void;
    onReply: (message: CollaborationMessage) => void;
    onStartEdit: (message: CollaborationMessage) => void;
    onToggleReaction: (messageId: string, emoji: string) => void;
};
function SearchMessageActionsBar({ currentUserId, currentUserRole, message, messageDeletingId, messageUpdatingId, onConfirmDelete, onCreateTask, onReply, onStartEdit, onToggleReaction, }: SearchMessageActionsBarProps) {
    const canManageMessage = !message.isDeleted &&
        ((message.senderId && message.senderId === currentUserId) || currentUserRole === 'admin');
    const handleReaction = (emoji: string) => onToggleReaction(message.id, emoji);
    const handleReply = () => onReply(message);
    const handleEdit = () => onStartEdit(message);
    const handleDelete = () => onConfirmDelete(message.id);
    const handleCreateTask = () => onCreateTask(message);
    const permissions = ({
        canReact: !message.isDeleted && !!currentUserId,
        canManage: canManageMessage,
    });
    const pending = ({
        updating: messageUpdatingId === message.id,
        deleting: messageDeletingId === message.id,
        disableReactions: message.isDeleted || !currentUserId,
    });
    return (<MessageActionsBar message={message} permissions={permissions} pending={pending} onReaction={handleReaction} onReply={handleReply} onEdit={handleEdit} onDelete={handleDelete} onCreateTask={handleCreateTask}/>);
}
type SearchThreadSectionProps = {
    currentUserId?: string | null;
    currentUserRole?: string | null;
    editingMessageId: string | null;
    editingPreview: string;
    editingValue: string;
    expandedThreadIds: Record<string, boolean>;
    messageDeletingId: string | null;
    messageUpdatingId: string | null;
    onCancelEdit: () => void;
    onConfirmDelete: (messageId: string) => void;
    onConfirmEdit: () => void;
    onCreateTask: (message: CollaborationMessage) => void;
    onEditingValueChange: (value: string) => void;
    onLoadMoreThread: (threadRootId: string) => void;
    onReply: (message: CollaborationMessage) => void;
    onRetryThreadLoad: (threadRootId: string) => void;
    onStartEdit: (message: CollaborationMessage) => void;
    onThreadToggle: (threadRootId: string) => void;
    onToggleReaction: (messageId: string, emoji: string) => void;
    originalMessage: CollaborationMessage;
    reactionPendingByMessage: Record<string, string | null>;
    threadErrorsByRootId: Record<string, string | null>;
    threadLoadingByRootId: Record<string, boolean>;
    threadMessagesByRootId: Record<string, CollaborationMessage[]>;
    threadNextCursorByRootId: Record<string, string | null>;
};
function SearchThreadSection({ currentUserId, currentUserRole, editingMessageId, editingPreview, editingValue, expandedThreadIds, messageDeletingId, messageUpdatingId, onCancelEdit, onConfirmDelete, onConfirmEdit, onCreateTask, onEditingValueChange, onLoadMoreThread, onReply, onRetryThreadLoad, onStartEdit, onThreadToggle, onToggleReaction, originalMessage, reactionPendingByMessage, threadErrorsByRootId, threadLoadingByRootId, threadMessagesByRootId, threadNextCursorByRootId, }: SearchThreadSectionProps) {
    const threadRootId = getThreadRootId(originalMessage);
    const threadReplies = threadMessagesByRootId[threadRootId] ?? [];
    const threadLoading = threadLoadingByRootId[threadRootId] ?? false;
    const threadError = threadErrorsByRootId[threadRootId] ?? null;
    const threadNextCursor = threadNextCursorByRootId[threadRootId] ?? null;
    const replyCount = Math.max(typeof originalMessage.threadReplyCount === 'number' ? originalMessage.threadReplyCount : 0, threadReplies.length);
    const lastReplyIso = originalMessage.threadLastReplyAt ?? (threadReplies.length > 0 ? threadReplies[threadReplies.length - 1]?.createdAt ?? null : null);
    const handleToggle = () => onThreadToggle(threadRootId);
    const handleRetry = () => onRetryThreadLoad(threadRootId);
    const handleLoadMore = () => onLoadMoreThread(threadRootId);
    const handleReply = () => onReply(originalMessage);
    const searchThreadPanel = ({
        isOpen: Boolean(expandedThreadIds[threadRootId]),
        isLoading: threadLoading,
        hasNextCursor: !!threadNextCursor,
    });
    const searchThreadReplyContext = ({
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
    });
    return (<SearchThreadReplyContext.Provider value={searchThreadReplyContext}>
    <ThreadSection threadRootId={threadRootId} replyCount={replyCount} lastReplyIso={lastReplyIso} panel={searchThreadPanel} error={threadError} replies={threadReplies} onToggle={handleToggle} onRetry={handleRetry} onLoadMore={handleLoadMore} onReply={handleReply} ReplyRenderer={SearchThreadReplyRenderer}/>
    </SearchThreadReplyContext.Provider>);
}
type CollaborationSearchMessageListProps = {
    currentUserId?: string | null;
    currentUserRole?: string | null;
    editingMessageId: string | null;
    editingPreview: string;
    editingValue: string;
    expandedThreadIds: Record<string, boolean>;
    messageDeletingId: string | null;
    messageUpdatingId: string | null;
    onCancelEdit: () => void;
    onConfirmDelete: (messageId: string) => void;
    onConfirmEdit: () => void;
    onCreateTask: (message: CollaborationMessage) => void;
    onEditingValueChange: (value: string) => void;
    onLoadMoreThread: (threadRootId: string) => void;
    onReply: (message: CollaborationMessage) => void;
    onRetryThreadLoad: (threadRootId: string) => void;
    onStartEdit: (message: CollaborationMessage) => void;
    onThreadToggle: (threadRootId: string) => void;
    onToggleReaction: (messageId: string, emoji: string) => void;
    reactionPendingByMessage: Record<string, string | null>;
    threadErrorsByRootId: Record<string, string | null>;
    threadLoadingByRootId: Record<string, boolean>;
    threadMessagesByRootId: Record<string, CollaborationMessage[]>;
    threadNextCursorByRootId: Record<string, string | null>;
    visibleMessages: CollaborationMessage[];
};
const SEARCH_EMPTY_STATE = <NoSearchResultsState />;
const HANDLE_NOOP_LOAD_MORE = () => { };
export function CollaborationSearchMessageList({ currentUserId, currentUserRole, editingMessageId, editingPreview, editingValue, expandedThreadIds, messageDeletingId, messageUpdatingId, onCancelEdit, onConfirmDelete, onConfirmEdit, onCreateTask, onEditingValueChange, onLoadMoreThread, onReply, onRetryThreadLoad, onStartEdit, onThreadToggle, onToggleReaction, reactionPendingByMessage, threadErrorsByRootId, threadLoadingByRootId, threadMessagesByRootId, threadNextCursorByRootId, visibleMessages, }: CollaborationSearchMessageListProps) {
    const handleToggleReaction = async (messageId: string, emoji: string) => {
        await onToggleReaction(messageId, emoji);
    };
    const renderMessageContent = (message: {
        id: string;
    }) => {
        const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id);
        return originalMsg ? <MessageContent content={originalMsg.content ?? ''} mentions={originalMsg.mentions}/> : null;
    };
    const renderMessageAttachments = (message: {
        id: string;
    }) => {
        const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id);
        return originalMsg?.attachments && originalMsg.attachments.length > 0 ? <MessageAttachments attachments={originalMsg.attachments}/> : null;
    };
    const renderMessageExtras = (message: {
        id: string;
    }) => {
        const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id);
        return originalMsg?.sharedTo && originalMsg.sharedTo.length > 0 ? <SharedPlatformIcons sharedTo={originalMsg.sharedTo}/> : null;
    };
    const renderThreadSection = (message: {
        id: string;
        deleted?: boolean;
    }) => {
        const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id);
        if (!originalMsg || message.deleted)
            return null;
        return (<SearchThreadSection currentUserId={currentUserId} currentUserRole={currentUserRole} editingMessageId={editingMessageId} editingPreview={editingPreview} editingValue={editingValue} expandedThreadIds={expandedThreadIds} messageDeletingId={messageDeletingId} messageUpdatingId={messageUpdatingId} onCancelEdit={onCancelEdit} onConfirmDelete={onConfirmDelete} onConfirmEdit={onConfirmEdit} onCreateTask={onCreateTask} onEditingValueChange={onEditingValueChange} onLoadMoreThread={onLoadMoreThread} onReply={onReply} onRetryThreadLoad={onRetryThreadLoad} onStartEdit={onStartEdit} onThreadToggle={onThreadToggle} onToggleReaction={onToggleReaction} originalMessage={originalMsg} reactionPendingByMessage={reactionPendingByMessage} threadErrorsByRootId={threadErrorsByRootId} threadLoadingByRootId={threadLoadingByRootId} threadMessagesByRootId={threadMessagesByRootId} threadNextCursorByRootId={threadNextCursorByRootId}/>);
    };
    const renderMessageActions = (message: {
        id: string;
    }) => {
        const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id);
        if (!originalMsg)
            return null;
        return (<SearchMessageActionsBar currentUserId={currentUserId} currentUserRole={currentUserRole} message={originalMsg} messageDeletingId={messageDeletingId} messageUpdatingId={messageUpdatingId} onConfirmDelete={onConfirmDelete} onCreateTask={onCreateTask} onReply={onReply} onStartEdit={onStartEdit} onToggleReaction={onToggleReaction}/>);
    };
    const renderEditForm = (message: {
        id: string;
    }) => {
        if (editingMessageId !== message.id)
            return null;
        return (<MessageEditForm value={editingValue} onChange={onEditingValueChange} onConfirm={onConfirmEdit} onCancel={onCancelEdit} isUpdating={messageUpdatingId === message.id} editingPreview={editingPreview}/>);
    };
    const renderDeletedInfo = (message: {
        id: string;
    }) => {
        const originalMsg = visibleMessages.find((candidate) => candidate.id === message.id);
        return originalMsg ? <DeletedMessageInfo deletedBy={originalMsg.deletedBy} deletedAt={originalMsg.deletedAt}/> : null;
    };
    const messageListRenderers = ({
        renderMessageContent: toMessageContentComponent(renderMessageContent),
        renderMessageAttachments,
        renderMessageExtras,
        renderThreadSection,
        renderMessageActions,
        renderEditForm,
        renderDeletedInfo,
    });
    return (<MessageList messages={visibleMessages.map(collaborationToUnifiedMessage)} currentUserId={currentUserId ?? null} currentUserRole={currentUserRole} isLoading={false} hasMore={false} onLoadMore={HANDLE_NOOP_LOAD_MORE} onToggleReaction={handleToggleReaction} reactionPendingByMessage={reactionPendingByMessage} variant="channel" showAvatars={true} renderers={messageListRenderers} editingMessageId={editingMessageId} deletingMessageId={messageDeletingId} updatingMessageId={messageUpdatingId} emptyState={SEARCH_EMPTY_STATE}/>);
}
