'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePrevious } from '@/shared/hooks/use-previous';
import type { ReactNode } from 'react';
import { AlertCircle, Hash, Inbox, Info, MessageCircle, Plus, Search } from 'lucide-react';
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
import { convertMentionsToMarkdown } from '../../utils/mentions';
import type { PendingAttachment, ReactionPendingState, SendMessageOptions, ThreadCursorsState, ThreadErrorsState, ThreadLoadingState, ThreadMessagesState } from '../../hooks/types';
import { useChannelPresence } from '../../hooks/use-channel-presence';
import { usePreview } from '@/shared/contexts/preview-context';
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
    const { isPreviewMode } = usePreview();
    const handleDmSend = async () => {
        const content = convertMentionsToMarkdown(dmMessageInput.trim(), mentionParticipants);
        if (!content && pendingAttachments.length === 0) {
            return;
        }
        await handleSendDirectMessage(content);
    };
    const handleDmEditMessage = dmEditMessage
        ? async (messageLegacyId: string, newContent: string) => {
            await dmEditMessage(messageLegacyId, convertMentionsToMarkdown(newContent, mentionParticipants));
        }
        : undefined;
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
    const presenceMembers = useChannelPresence({
        workspaceId: workspaceId ?? null,
        userId: currentUserId,
        conversationLegacyId: selectedDM.legacyId,
    });
    const dmHeader = ({
        conversationKey: selectedDM.legacyId,
        name: selectedDM.otherParticipantName,
        type: 'dm' as const,
        role: selectedDM.otherParticipantRole,
        presenceMembers,
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
        const errorBanner = messagesError ? (<div className="mx-4 mt-4">
        <MessagesErrorState error={messagesError} onRetry={onRetryMessages} isRetrying={dmSearchingMessages && isDmSearchActive}/>
      </div>) : null;
        const previewBanner = isPreviewMode ? (<Alert className="mx-4 mt-4 border-primary/20 bg-primary/5 text-primary">
        <Info className="size-4"/>
        <AlertTitle>Preview mode</AlertTitle>
        <AlertDescription>
          Live presence, typing, and real-time updates are not available in the sample workspace.
        </AlertDescription>
      </Alert>) : null;
        if (!errorBanner && !previewBanner) {
            return null;
        }
        return (<>
        {previewBanner}
        {errorBanner}
      </>);
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
    return (<UnifiedMessagePane header={dmHeader} messages={dmMessagesForPane.map(directMessageToUnifiedMessage)} channelMessages={dmChannelMessages} currentUserId={currentUserId} currentUserRole={currentUserRole} workspaceId={workspaceId} dmParticipantName={selectedDM.otherParticipantName} focusMessageId={deepLinkMessageId} onCreateTask={onCreateTask} listState={dmListState} onLoadMore={dmLoadMoreMessages} messageSearchQuery={dmMessageSearchQuery} onMessageSearchChange={onDmMessageSearchChange} messageSearchHighlights={dmSearchHighlights} messageInput={dmMessageInput} onMessageInputChange={setActiveDmMessageInput} onSendMessage={handleDmSend} emptyState={dmEmptyState} participants={mentionParticipants} composerState={dmComposerState} pendingAttachments={pendingAttachments} onAddAttachments={onAddAttachments} onRemoveAttachment={onRemoveAttachment} onToggleReaction={dmToggleReaction} onDeleteMessage={dmDeleteMessage} onEditMessage={handleDmEditMessage} onShareToPlatform={onShareToPlatform} onComposerFocus={onComposerFocus} onComposerBlur={onComposerBlur} typingIndicator={typingIndicatorText} placeholder={`Message ${selectedDM.otherParticipantName}...`} statusBanner={dmStatusBanner}/>);
}
