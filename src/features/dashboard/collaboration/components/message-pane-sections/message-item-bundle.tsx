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
import type { CollaborationMessageDisplayState } from '../message-pane-display-state';
import type { CollaborationMessageItemProps } from './collaboration-message-item-props';
import { getThreadRootId } from './message-thread-utils';
const DEFAULT_COLLABORATION_MESSAGE_DISPLAY: Required<CollaborationMessageDisplayState> = {
    isReply: false,
    isSearchResult: false,
    showAvatar: true,
    showHeader: true,
};
type CollaborationThreadReplyContextValue = Omit<CollaborationMessageReplyItemProps, 'message'>;
const CollaborationThreadReplyContext = createContext<CollaborationThreadReplyContextValue | null>(null);
function CollaborationThreadReplyRenderer({ reply }: {
    reply: CollaborationMessage;
}) {
    const context = use(CollaborationThreadReplyContext);
    if (!context) {
        throw new Error('CollaborationThreadReplyRenderer requires CollaborationThreadReplyContext');
    }
    return <CollaborationMessageReplyItem message={reply} {...context}/>;
}
export function CollaborationMessageItem({ currentUserId, currentUserRole, editingMessageId, editingPreview, editingValue, expandedThreadIds, display, message, messageDeletingId, messageUpdatingId, onCancelEdit, onConfirmDelete, onConfirmEdit, onCreateTask, onEditingValueChange, onLoadMoreThread, onReply, onRetryThreadLoad, onStartEdit, onThreadToggle, onToggleReaction, reactionPendingByMessage, threadErrorsByRootId, threadLoadingByRootId, threadMessagesByRootId, threadNextCursorByRootId, }: CollaborationMessageItemProps) {
    const resolvedDisplay = ({ ...DEFAULT_COLLABORATION_MESSAGE_DISPLAY, ...display });
    const { isReply, isSearchResult, showAvatar, showHeader } = resolvedDisplay;
    const canManageMessage = !message.isDeleted &&
        ((message.senderId && message.senderId === currentUserId) || currentUserRole === 'admin');
    const canReact = !message.isDeleted && !!currentUserId;
    const isDeleting = messageDeletingId === message.id;
    const isUpdating = messageUpdatingId === message.id;
    const reactionPendingEmoji = reactionPendingByMessage[message.id] ?? null;
    const disableReactionActions = message.isDeleted || !currentUserId || Boolean(reactionPendingEmoji) || isDeleting || isUpdating;
    const allUrlsFromContent = extractUrlsFromContent(message.content);
    const imageUrlPreviews = allUrlsFromContent.filter((url) => isLikelyImageUrl(url));
    const linkPreviews = allUrlsFromContent.filter((url) => !isLikelyImageUrl(url));
    const threadRootId = getThreadRootId(message);
    const threadReplies = threadMessagesByRootId[threadRootId] ?? [];
    const threadLoading = threadLoadingByRootId[threadRootId] ?? false;
    const threadError = threadErrorsByRootId[threadRootId] ?? null;
    const threadNextCursor = threadNextCursorByRootId[threadRootId] ?? null;
    const replyCount = Math.max(typeof message.threadReplyCount === 'number' ? message.threadReplyCount : 0, threadReplies.length);
    const isThreadOpen = Boolean(expandedThreadIds[threadRootId]);
    const lastReplyIso = message.threadLastReplyAt ?? (threadReplies.length > 0 ? threadReplies[threadReplies.length - 1]?.createdAt ?? null : null);
    const handleReaction = (emoji: string) => onToggleReaction(message.id, emoji);
    const handleReply = () => onReply(message);
    const handleEdit = () => onStartEdit(message);
    const handleDelete = () => onConfirmDelete(message.id);
    const handleCreateTask = () => onCreateTask(message);
    const handleThreadToggle = () => onThreadToggle(threadRootId);
    const handleRetryThreadLoad = () => onRetryThreadLoad(threadRootId);
    const handleLoadMoreThread = () => onLoadMoreThread(threadRootId);
    const permissions = ({ canReact, canManage: canManageMessage });
    const pending = ({
        updating: isUpdating,
        deleting: isDeleting,
        disableReactions: disableReactionActions,
    });
    const threadPanel = ({
        isOpen: isThreadOpen,
        isLoading: threadLoading,
        hasNextCursor: !!threadNextCursor,
    });
    const threadReplyContext = ({
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
    const containerClass = cn('relative group flex items-start gap-3 px-6 py-2.5 motion-chromatic', isSearchResult && 'bg-accent/5 ring-1 ring-primary/20', !showAvatar && !isReply && 'py-1', isReply && 'ml-14 mt-2');
    const bubbleClass = cn('relative min-w-0 max-w-full flex-1 overflow-hidden flex flex-col space-y-1.5 rounded-2xl p-4 motion-chromatic', isReply ? 'border border-muted/30 bg-muted/10' : 'border border-transparent bg-muted/5 group-hover:border-muted/20 group-hover:bg-muted/10', (isSearchResult || isReply) && 'shadow-sm');
    return (<div className={containerClass}>
      {showAvatar ? (<div className="shrink-0 pt-1">
          <MessageAvatar senderName={message.senderName} isReply={isReply}/>
        </div>) : (<div className="w-10 flex-shrink-0"/>)}

      <div className={bubbleClass}>
        {showHeader ? (<MessageHeader senderName={message.senderName} senderRole={message.senderRole} createdAt={message.createdAt} isEdited={message.isEdited} isDeleted={message.isDeleted}/>) : null}

        {!isReply ? (<MessageActionsBar message={message} permissions={permissions} pending={pending} onReaction={handleReaction} onReply={handleReply} onEdit={handleEdit} onDelete={handleDelete} onCreateTask={handleCreateTask}/>) : (<ReplyActionsBar message={message} canManage={canManageMessage} isUpdating={isUpdating} isDeleting={isDeleting} onEdit={handleEdit} onDelete={handleDelete}/>)}

        {editingMessageId === message.id ? (<MessageEditForm value={editingValue} onChange={onEditingValueChange} onConfirm={onConfirmEdit} onCancel={onCancelEdit} isUpdating={isUpdating} editingPreview={editingPreview}/>) : message.isDeleted ? (<p className="text-sm italic text-muted-foreground">Message removed</p>) : (<MessageContent content={message.content ?? ''} mentions={message.mentions}/>)}

        {!message.isDeleted && editingMessageId !== message.id && imageUrlPreviews.length > 0 ? (<div className="mt-2 flex flex-wrap gap-2">
            {imageUrlPreviews.map((url) => (<ImageUrlPreview key={`${message.id}-img-${url}`} url={url}/>))}
          </div>) : null}

        {!message.isDeleted && Array.isArray(message.attachments) && message.attachments.length > 0 ? (<MessageAttachments attachments={message.attachments}/>) : null}

        {!message.isDeleted && linkPreviews.length > 0 ? (<div className="space-y-3">
            {linkPreviews.map((url) => (<LinkPreviewCard key={`${message.id}-${url}`} url={url}/>))}
          </div>) : null}

        {!message.isDeleted && editingMessageId !== message.id ? (<MessageReactions reactions={message.reactions ?? []} currentUserId={currentUserId} pendingEmoji={reactionPendingEmoji} disabled={disableReactionActions} onToggle={handleReaction}/>) : null}

        {!message.isDeleted && message.sharedTo && message.sharedTo.length > 0 ? (<SharedPlatformIcons sharedTo={message.sharedTo}/>) : null}

        {message.isDeleted ? <DeletedMessageInfo deletedBy={message.deletedBy} deletedAt={message.deletedAt}/> : null}

        {!isReply && !message.isDeleted ? (<CollaborationThreadReplyContext.Provider value={threadReplyContext}>
          <ThreadSection threadRootId={threadRootId} replyCount={replyCount} lastReplyIso={lastReplyIso} panel={threadPanel} error={threadError} replies={threadReplies} onToggle={handleThreadToggle} onRetry={handleRetryThreadLoad} onLoadMore={handleLoadMoreThread} onReply={handleReply} ReplyRenderer={CollaborationThreadReplyRenderer}/>
          </CollaborationThreadReplyContext.Provider>) : null}
      </div>

      {!message.isDeleted ? <DeletingOverlay isDeleting={isDeleting}/> : null}
    </div>);
}
type CollaborationMessageReplyItemProps = {
    currentUserId?: string | null;
    currentUserRole?: string | null;
    editingMessageId: string | null;
    editingPreview: string;
    editingValue: string;
    expandedThreadIds: Record<string, boolean>;
    message: CollaborationMessage;
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
};
function CollaborationMessageReplyItem({ currentUserId, currentUserRole, editingMessageId, editingPreview, editingValue, expandedThreadIds, message, messageDeletingId, messageUpdatingId, onCancelEdit, onConfirmDelete, onConfirmEdit, onCreateTask, onEditingValueChange, onLoadMoreThread, onReply, onRetryThreadLoad, onStartEdit, onThreadToggle, onToggleReaction, reactionPendingByMessage, threadErrorsByRootId, threadLoadingByRootId, threadMessagesByRootId, threadNextCursorByRootId, }: CollaborationMessageReplyItemProps) {
    return (<CollaborationMessageItem currentUserId={currentUserId} currentUserRole={currentUserRole} editingMessageId={editingMessageId} editingPreview={editingPreview} editingValue={editingValue} expandedThreadIds={expandedThreadIds} message={message} messageDeletingId={messageDeletingId} messageUpdatingId={messageUpdatingId} onCancelEdit={onCancelEdit} onConfirmDelete={onConfirmDelete} onConfirmEdit={onConfirmEdit} onCreateTask={onCreateTask} onEditingValueChange={onEditingValueChange} onLoadMoreThread={onLoadMoreThread} onReply={onReply} onRetryThreadLoad={onRetryThreadLoad} onStartEdit={onStartEdit} onThreadToggle={onThreadToggle} onToggleReaction={onToggleReaction} reactionPendingByMessage={reactionPendingByMessage} threadErrorsByRootId={threadErrorsByRootId} threadLoadingByRootId={threadLoadingByRootId} threadMessagesByRootId={threadMessagesByRootId} threadNextCursorByRootId={threadNextCursorByRootId}/>);
}
