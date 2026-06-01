'use client';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useMemo, useState } from 'react';
import { asErrorMessage } from '@/lib/convex-errors';
import { useToast } from '@/shared/ui/use-toast';
import type { DirectConversation, DirectMessage } from '../hooks/use-direct-messages';
import type { UnifiedMessage } from './message-list-types';
import type { MessagePaneHeaderInfo } from './unified-message-pane-types';
import { UnifiedMessagePane } from './unified-message-pane';
import type { MessagePaneListState } from './unified-message-pane-layout';
function toUnifiedMessage(msg: DirectMessage): UnifiedMessage {
    return {
        id: msg.legacyId,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderRole: msg.senderRole,
        content: msg.content,
        createdAtMs: msg.createdAtMs,
        edited: msg.edited,
        deleted: msg.deleted,
        deletedBy: msg.deletedBy ?? undefined,
        deletedAt: typeof msg.deletedAtMs === 'number' ? new Date(msg.deletedAtMs).toISOString() : undefined,
        reactions: msg.reactions ?? undefined,
        attachments: msg.attachments?.map(a => ({
            url: a.url,
            name: a.name,
            mimeType: a.type ?? undefined,
            size: a.size ? parseInt(a.size, 10) : undefined,
        })) ?? undefined,
        sharedTo: msg.sharedTo ?? undefined,
    };
}
interface DMMessagePaneProps {
    conversation: DirectConversation | null;
    messages: DirectMessage[];
    listState: MessagePaneListState;
    onLoadMore: () => void;
    onSendMessage: (content: string) => Promise<void>;
    composerState: {
        sending: boolean;
    };
    onToggleReaction: (messageLegacyId: string, emoji: string) => Promise<void>;
    onDeleteMessage?: (messageLegacyId: string) => Promise<void>;
    onEditMessage?: (messageLegacyId: string, newContent: string) => Promise<void>;
    onArchive: (archived: boolean) => Promise<void>;
    onMute: (muted: boolean) => Promise<void>;
    currentUserId: string | null;
    onShareToPlatform?: (message: DirectMessage, platform: 'email') => Promise<void>;
}
export function DMMessagePane({ conversation, messages, listState, onLoadMore, onSendMessage, composerState, onToggleReaction, onDeleteMessage, onEditMessage, onArchive, onMute, currentUserId, onShareToPlatform, }: DMMessagePaneProps) {
    const { sending: isSending } = composerState;
    const layoutComposerState = ({
        focused: false,
        sending: isSending,
        pendingAttachments: false,
        uploadingAttachments: false,
    });
    const { toast } = useToast();
    const [inputValue, setInputValue] = useState('');
    const header: MessagePaneHeaderInfo | null = (() => {
        if (!conversation) {
            return null;
        }
        return {
            name: conversation.otherParticipantName,
            type: 'dm',
            role: conversation.otherParticipantRole,
            isArchived: conversation.isArchived,
            isMuted: conversation.isMuted,
            onArchive,
            onMute,
        };
    })();
    const unifiedMessages = messages.map(toUnifiedMessage);
    const handleSend = async () => {
        const trimmedContent = inputValue.trim();
        if (!trimmedContent || isSending)
            return;
        setInputValue('');
        try {
            await onSendMessage(trimmedContent);
        }
        catch (error) {
            setInputValue(trimmedContent);
            reportConvexFailure({
                error: error,
                context: 'dm-message-pane.tsx:catch',
                title: 'Message not sent',
                fallbackMessage: 'Message not sent',
            });
            throw error;
        }
    };
    const handleReaction = async (messageId: string, emoji: string) => {
        await onToggleReaction(messageId, emoji);
    };
    const handleShare = async (message: UnifiedMessage, platform: 'email') => {
        if (!onShareToPlatform)
            return;
        const originalMessage = messages.find((entry) => entry.legacyId === message.id);
        if (!originalMessage) {
            throw new Error('Message unavailable');
        }
        await onShareToPlatform(originalMessage, platform);
    };
    return (<UnifiedMessagePane header={header} messages={unifiedMessages} currentUserId={currentUserId} listState={listState} onLoadMore={onLoadMore} messageInput={inputValue} onMessageInputChange={setInputValue} onSendMessage={handleSend} composerState={layoutComposerState} onToggleReaction={handleReaction} onDeleteMessage={onDeleteMessage} onEditMessage={onEditMessage} onShareToPlatform={onShareToPlatform ? handleShare : undefined} placeholder={conversation ? `Message ${conversation.otherParticipantName}...` : 'Type a message...'}/>);
}
