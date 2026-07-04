'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePrevious } from '@/shared/hooks/use-previous';
import type { ReactNode } from 'react';
import { AlertCircle, Hash, Inbox, MessageCircle, Plus, Search, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { LiveRegion } from '@/shared/ui/live-region';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { ClientRelativeTime } from '@/shared/components/client-relative-time';
import { chromaticTransitionClass } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { ClientTeamMember } from '@/types/clients';
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration';
import type { DirectConversation, DirectMessage } from '../../hooks/use-direct-messages';
import { directMessageToCollaborationMessage } from '../../lib/direct-message-collaboration';
import type { PendingAttachment, ReactionPendingState, SendMessageOptions, ThreadCursorsState, ThreadErrorsState, ThreadLoadingState, ThreadMessagesState } from '../../hooks/types';
import { useChannelPresence } from '../../hooks/use-channel-presence';
import type { Channel } from '../../types';
import { buildCollaborationChannelShareUrl, buildCollaborationDmShareUrl, CHANNEL_TYPE_COLORS, CHAT_CONVERSATION_ROW_CLASS, CHAT_LIST_PREVIEW_CLASS, formatConversationSnippet, } from '../../utils';
import { collaborationToUnifiedMessage } from '../message-list-utils';
import { EmptyMessagesState, MessagesErrorState, NoSearchResultsState } from '../message-pane-parts';
import type { MessagePoll } from '../message-polls';
import type { UnifiedMessage } from '../message-list-types';
import { UnifiedMessagePane } from '../unified-message-pane';
import type { ChannelConversationPaneProps } from './channel-conversation-pane-types';
export type { ChannelConversationPaneProps, ChannelPaneComposerState, ChannelPaneListState, ChannelPaneSearchState, } from './channel-conversation-pane-types';
function hasRequestedDeepLinkTarget(channelMessages: CollaborationMessage[], threadMessagesByRootId: ThreadMessagesState, deepLinkMessageId: string | null, deepLinkThreadId: string | null): boolean {
    const normalizedMessageId = typeof deepLinkMessageId === 'string' ? deepLinkMessageId.trim() : '';
    const normalizedThreadId = typeof deepLinkThreadId === 'string' ? deepLinkThreadId.trim() : '';
    if (!normalizedMessageId && !normalizedThreadId) {
        return false;
    }
    const allMessages = [...channelMessages, ...Object.values(threadMessagesByRootId).flat()];
    return allMessages.some((message) => {
        if (normalizedMessageId && message.id === normalizedMessageId) {
            return true;
        }
        if (!normalizedThreadId) {
            return false;
        }
        const threadRootId = typeof message.threadRootId === 'string' && message.threadRootId.trim().length > 0
            ? message.threadRootId.trim()
            : message.id;
        return (threadRootId === normalizedThreadId
            || message.parentMessageId === normalizedThreadId
            || message.id === normalizedThreadId);
    });
}
export function ChannelConversationPane(props: ChannelConversationPaneProps) {
    return <ChannelConversationPaneInner key={props.selectedChannel.id} {...props}/>;
}
function ChannelConversationPaneInner({ listState, searchState, composerState, channelMessages, channelMessagesForPane, channelParticipants, mentionParticipants, currentUserId, currentUserRole, deepLinkMessageId, deepLinkThreadId, messageDeletingId, messageInput, messageSearchQuery, messageUpdatingId, onAddAttachments, onBackToInbox, onClearDeepLink, onComposerBlur, onComposerFocus, onDeleteMessage, onEditMessage, onLoadMore, onLoadMoreThreadReplies, onLoadThreadReplies, onMarkThreadAsRead, onMessageInputChange, onMessageSearchChange, onRemoveAttachment, onSendMessage, onShareToPlatform, onCreateTask, onForwardMessage, onCreatePoll, onExportChannel, onOpenChannelMessage, onToggleReaction, pendingAttachments, reactionPendingByMessage, searchHighlights, selectedChannel, sharedFiles, canManageMembers, onManageMembers, workspaceId, isAdmin, threadErrorsByRootId, threadLoadingByRootId, threadMessagesByRootId, threadNextCursorByRootId, threadUnreadCountsByRootId, typingIndicatorText, messagesError, onRetryMessages, channelUnreadCount, onMarkChannelRead, markChannelReadPending, }: ChannelConversationPaneProps) {
    const { canLoadMore, loading: isCurrentChannelLoading, loadingMore } = listState;
    const { active: isChannelSearchActive, searching: searchingMessages } = searchState;
    const { sending, uploading } = composerState;
    const [replyingToMessage, setReplyingToMessage] = useState<CollaborationMessage | null>(null);
    const threadMessagesById = (() => {
        const byId = new Map<string, CollaborationMessage>();
        for (const replies of Object.values(threadMessagesByRootId)) {
            for (const entry of replies) {
                byId.set(entry.id, entry);
            }
        }
        return byId;
    })();
    const resolveCollaborationMessage = (message: UnifiedMessage): CollaborationMessage | null => {
        const fromChannel = channelMessages.find((entry) => entry.id === message.id);
        if (fromChannel) {
            return fromChannel;
        }
        return threadMessagesById.get(message.id) ?? null;
    };
    const handleReply = (message: UnifiedMessage) => {
        setReplyingToMessage(resolveCollaborationMessage(message));
    };
    const handleCancelReply = () => {
        setReplyingToMessage(null);
    };
    const handleCreatePoll = async (poll: Omit<MessagePoll, 'id' | 'createdAt'>) => {
        await onCreatePoll?.(poll);
    };
    const channelEmptyState = (() => {
        if (isCurrentChannelLoading || searchingMessages) {
            return undefined;
        }
        if (channelMessages.length > 0) {
            return undefined;
        }
        if (isChannelSearchActive) {
            return <NoSearchResultsState />;
        }
        return <EmptyMessagesState />;
    })();
    const showMissingDeepLinkNotice = (Boolean(deepLinkMessageId?.trim()) || Boolean(deepLinkThreadId?.trim())) &&
        !isCurrentChannelLoading &&
        !searchingMessages &&
        !hasRequestedDeepLinkTarget(channelMessages, threadMessagesByRootId, deepLinkMessageId, deepLinkThreadId);
    const presenceMembers = useChannelPresence({
        workspaceId: workspaceId ?? null,
        userId: currentUserId,
        selectedChannel,
    });
    const channelHeader = ({
        conversationKey: selectedChannel.id,
        name: selectedChannel.name,
        type: 'channel' as const,
        channelKind: selectedChannel.type,
        participantCount: channelParticipants.length,
        messageCount: channelMessages.length,
        presenceMembers,
        onExport: onExportChannel,
        buildShareableUrl: () => buildCollaborationChannelShareUrl(selectedChannel),
        channelUnreadCount,
        onMarkChannelRead,
        markChannelReadPending,
        onBack: onBackToInbox,
        channelInfo: workspaceId != null
            ? {
                channel: selectedChannel,
                channelMessages,
                channelParticipants,
                currentUserId,
                onPinnedMessageClick: onOpenChannelMessage
                    ? (messageId: string) => {
                        onOpenChannelMessage(messageId);
                    }
                    : undefined,
                sharedFiles,
                workspaceId,
                isAdmin,
                canManageMembers,
                onManageMembers,
            }
            : undefined,
    });
    const missingDeepLinkBanner = (() => {
        if (!showMissingDeepLinkNotice)
            return null;
        return (<Alert className="mx-4 mt-4 border-warning/20 bg-warning/10 text-warning-foreground">
        <AlertCircle className="size-4"/>
        <AlertTitle>Linked message unavailable</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>We couldn&apos;t open the requested message in #{selectedChannel.name}. It may no longer be available in this channel.</p>
          {onClearDeepLink ? (<Button type="button" variant="outline" size="sm" onClick={onClearDeepLink}>
              Clear link
            </Button>) : null}
        </AlertDescription>
      </Alert>);
    })();
    const combinedStatusBanner = (() => {
        const errorBanner = messagesError ? (<div className="mx-4 mt-4">
        <MessagesErrorState error={messagesError} onRetry={onRetryMessages} isRetrying={searchingMessages && isChannelSearchActive}/>
      </div>) : null;
        if (!missingDeepLinkBanner && !errorBanner) {
            return null;
        }
        return (<>
        {missingDeepLinkBanner}
        {errorBanner}
      </>);
    })();
    const handleLoadMore = () => {
        onLoadMore(selectedChannel.id);
    };
    const handleSendMessage = async () => {
        await onSendMessage({ parentMessageId: replyingToMessage?.id });
        setReplyingToMessage(null);
    };
    const handleToggleReaction = async (messageId: string, emoji: string) => {
        await onToggleReaction(selectedChannel.id, messageId, emoji);
    };
    const handleDeleteMessage = async (messageId: string) => {
        await onDeleteMessage(selectedChannel.id, messageId);
    };
    const handleEditMessage = async (messageId: string, newContent: string) => {
        await onEditMessage(selectedChannel.id, messageId, newContent);
    };
    const channelListState = ({
        loading: isCurrentChannelLoading || (isChannelSearchActive && searchingMessages),
        loadingMore: !isChannelSearchActive && loadingMore,
        hasMore: !isChannelSearchActive && canLoadMore,
    });
    const channelComposerState = ({
        sending: sending || uploading,
        pendingAttachments: pendingAttachments.length > 0,
        uploadingAttachments: uploading,
    });
    return (<UnifiedMessagePane header={channelHeader} messages={channelMessagesForPane.map(collaborationToUnifiedMessage)} currentUserId={currentUserId} currentUserRole={currentUserRole} listState={channelListState} onLoadMore={handleLoadMore} messageSearchQuery={messageSearchQuery} onMessageSearchChange={onMessageSearchChange} messageSearchHighlights={searchHighlights} messageInput={messageInput} onMessageInputChange={onMessageInputChange} onSendMessage={handleSendMessage} onReply={handleReply} replyingToMessage={replyingToMessage} onCancelReply={handleCancelReply} emptyState={channelEmptyState} composerState={channelComposerState} pendingAttachments={pendingAttachments} onAddAttachments={onAddAttachments} onRemoveAttachment={onRemoveAttachment} typingIndicator={typingIndicatorText} onComposerFocus={onComposerFocus} onComposerBlur={onComposerBlur} onToggleReaction={handleToggleReaction} onShareToPlatform={onShareToPlatform} onCreateTask={onCreateTask} onForwardMessage={onForwardMessage} onCreatePoll={onCreatePoll ? handleCreatePoll : undefined} workspaceId={workspaceId} reactionPendingByMessage={reactionPendingByMessage} onDeleteMessage={handleDeleteMessage} onEditMessage={handleEditMessage} participants={mentionParticipants} statusBanner={combinedStatusBanner} channelMessages={channelMessages} threadMessagesByRootId={threadMessagesByRootId} threadNextCursorByRootId={threadNextCursorByRootId} threadLoadingByRootId={threadLoadingByRootId} threadErrorsByRootId={threadErrorsByRootId} threadUnreadCountsByRootId={threadUnreadCountsByRootId} onLoadThreadReplies={onLoadThreadReplies} onLoadMoreThreadReplies={onLoadMoreThreadReplies} onMarkThreadAsRead={onMarkThreadAsRead} focusMessageId={deepLinkMessageId} focusThreadId={deepLinkThreadId} messageUpdatingId={messageUpdatingId} messageDeletingId={messageDeletingId}/>);
}
