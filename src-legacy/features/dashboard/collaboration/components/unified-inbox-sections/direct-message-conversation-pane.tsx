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
import type { Channel } from '../../types';
import { buildCollaborationChannelShareUrl, buildCollaborationDmShareUrl, CHANNEL_TYPE_COLORS, CHAT_CONVERSATION_ROW_CLASS, CHAT_LIST_PREVIEW_CLASS, formatConversationSnippet, } from '../../utils';
import { collaborationToUnifiedMessage } from '../message-list-utils';
import { EmptyMessagesState, MessagesErrorState, NoSearchResultsState } from '../message-pane-parts';
import type { UnifiedMessage } from '../message-list-types';
import { UnifiedMessagePane } from '../unified-message-pane';
import type { DirectMessageConversationPaneProps } from './direct-message-conversation-pane-types';
import { directMessageToUnifiedMessage } from './unified-inbox-dm-utils';
export type { DirectMessageConversationPaneProps } from './direct-message-conversation-pane-types';
export function DirectMessageConversationPane({ mentionParticipants, currentUserId, dmDeleteMessage, dmEditMessage, dmHasMoreMessages, dmIsLoadingMessages, dmIsLoadingMore, dmIsSending, dmLoadMoreMessages, dmMessageInput, dmMessageSearchQuery, dmMessagesForPane, dmMuteConversation, dmSearchHighlights, dmSearchingMessages, dmToggleReaction, handleSendDirectMessage, isDmSearchActive, onAddAttachments, onArchiveConversation, onBackToInbox, onDmMessageSearchChange, onRemoveAttachment, pendingAttachments, selectedDM, setActiveDmMessageInput, uploading, onStartNewDM, messagesError, onRetryMessages, onShareToPlatform, onComposerFocus, onComposerBlur, typingIndicatorText, onCreateTask, currentUserRole, workspaceId, deepLinkMessageId, onClearDeepLink, }: DirectMessageConversationPaneProps) {
    const handleDmSend = async () => {
        const content = dmMessageInput.trim();
        if (!content && pendingAttachments.length === 0) {
            return;
        }
        await handleSendDirectMessage(content);
    };
    const dmEmptyState = (() => {
        if (dmIsLoadingMessages || dmSearchingMessages) {
            return undefined;
        }
        if (dmMessagesForPane.length > 0) {
            return undefined;
        }
        if (isDmSearchActive) {
            return <NoSearchResultsState />;
        }
        return <EmptyMessagesState />;
    })();
    const dmHeader = ({
        conversationKey: selectedDM.legacyId,
        name: selectedDM.otherParticipantName,
        type: 'dm' as const,
        role: selectedDM.otherParticipantRole,
        isArchived: selectedDM.isArchived,
        isMuted: selectedDM.isMuted,
        onArchive: onArchiveConversation,
        onMute: dmMuteConversation,
        primaryActionLabel: 'New chat',
        onPrimaryAction: onStartNewDM,
        buildShareableUrl: () => buildCollaborationDmShareUrl(selectedDM.legacyId),
        onBack: onBackToInbox,
    });
    const dmStatusBanner = (() => {
        if (!messagesError) {
            return null;
        }
        return (<div className="mx-4 mt-4">
        <MessagesErrorState error={messagesError} onRetry={onRetryMessages} isRetrying={dmSearchingMessages && isDmSearchActive}/>
      </div>);
    })();
    const dmListState = ({
        loading: dmIsLoadingMessages || (isDmSearchActive && dmSearchingMessages),
        loadingMore: !isDmSearchActive && dmIsLoadingMore,
        hasMore: !isDmSearchActive && dmHasMoreMessages,
    });
    const dmComposerState = ({
        sending: dmIsSending || uploading,
        pendingAttachments: pendingAttachments.length > 0,
        uploadingAttachments: uploading,
    });
    const dmChannelMessages = dmMessagesForPane.map(directMessageToCollaborationMessage);
    return (<UnifiedMessagePane header={dmHeader} messages={dmMessagesForPane.map(directMessageToUnifiedMessage)} channelMessages={dmChannelMessages} currentUserId={currentUserId} currentUserRole={currentUserRole} workspaceId={workspaceId} dmParticipantName={selectedDM.otherParticipantName} focusMessageId={deepLinkMessageId} onCreateTask={onCreateTask} listState={dmListState} onLoadMore={dmLoadMoreMessages} messageSearchQuery={dmMessageSearchQuery} onMessageSearchChange={onDmMessageSearchChange} messageSearchHighlights={dmSearchHighlights} messageInput={dmMessageInput} onMessageInputChange={setActiveDmMessageInput} onSendMessage={handleDmSend} emptyState={dmEmptyState} participants={mentionParticipants} composerState={dmComposerState} pendingAttachments={pendingAttachments} onAddAttachments={onAddAttachments} onRemoveAttachment={onRemoveAttachment} onToggleReaction={dmToggleReaction} onDeleteMessage={dmDeleteMessage} onEditMessage={dmEditMessage} onShareToPlatform={onShareToPlatform} onComposerFocus={onComposerFocus} onComposerBlur={onComposerBlur} typingIndicator={typingIndicatorText} placeholder={`Message ${selectedDM.otherParticipantName}...`} statusBanner={dmStatusBanner}/>);
}
