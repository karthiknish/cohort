'use client';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useEffect, useEffectEvent, useRef } from 'react';
import { useMutation } from 'convex/react';
import { usePreview } from '@/shared/contexts/preview-context';
import { api } from '@/lib/convex-api';
import { logError } from '@/lib/convex-errors';
import { getPreviewDirectAutoReply } from '@/lib/preview-data';
import type { DirectConversation, DirectMessage } from '@/types/collaboration';
import { formatConversationSnippet } from '../lib/chat-text';
import type { UseDirectMessagesOptions } from './use-direct-messages';
import type { useDirectConversationsQuery } from './use-direct-conversations-query';
type DirectConversationsQueryState = ReturnType<typeof useDirectConversationsQuery>;
type UseDirectMessageActionsOptions = UseDirectMessagesOptions & DirectConversationsQueryState;
type PreviewMessageLocation = {
    conversationLegacyId: string;
    index: number;
};
function buildPreviewMessageIndex(conversations: Record<string, DirectMessage[]>): Map<string, PreviewMessageLocation> {
    const index = new Map<string, PreviewMessageLocation>();
    for (const [conversationLegacyId, messages] of Object.entries(conversations)) {
        for (let messageIndex = 0; messageIndex < messages.length; messageIndex += 1) {
            const message = messages[messageIndex];
            if (message) {
                index.set(message.legacyId, { conversationLegacyId, index: messageIndex });
            }
        }
    }
    return index;
}
export function useDirectMessageActions(options: UseDirectMessageActionsOptions) {
    const { workspaceId, currentUserId, currentUserName, currentUserRole, isPreviewMode, selectedConversation, setSelectedConversation, isSending, setIsSending, previewConversations, setPreviewConversations, previewMessagesByConversation, setPreviewMessagesByConversation, previewReplyTimersRef, conversations, selectConversation, normalizedMessageSearch, searchError, unreadCountQuery, } = options;
    const getOrCreateConversationMutation = useMutation(api.directMessages.getOrCreateConversation);
    const sendMessageMutation = useMutation(api.directMessages.sendMessage);
    const markAsReadMutation = useMutation(api.directMessages.markAsRead);
    const editMessageMutation = useMutation(api.directMessages.editMessage);
    const deleteMessageMutation = useMutation(api.directMessages.deleteMessage);
    const toggleReactionMutation = useMutation(api.directMessages.toggleReaction);
    const setArchiveStatusMutation = useMutation(api.directMessages.setArchiveStatus);
    const setMuteStatusMutation = useMutation(api.directMessages.setMuteStatus);
    const getOrCreateConversation = async (otherUserId: string, otherUserName: string, otherUserRole?: string | null) => {
        if (isPreviewMode) {
            const existingConversation = previewConversations.find((conversation) => conversation.otherParticipantId === otherUserId);
            if (existingConversation) {
                return { legacyId: existingConversation.legacyId, isNew: false };
            }
            const legacyId = `preview-dm-${otherUserId}-${Date.now()}`;
            const newConversation: DirectConversation = {
                id: legacyId,
                legacyId,
                otherParticipantId: otherUserId,
                otherParticipantName: otherUserName,
                otherParticipantRole: otherUserRole ?? null,
                lastMessageSnippet: null,
                lastMessageAtMs: null,
                lastMessageSenderId: null,
                isRead: true,
                isArchived: false,
                isMuted: false,
                createdAtMs: Date.now(),
                updatedAtMs: Date.now(),
            };
            setPreviewConversations((prev) => [newConversation, ...prev]);
            setPreviewMessagesByConversation((prev) => ({
                ...prev,
                [legacyId]: [],
            }));
            return { legacyId, isNew: true };
        }
        if (!workspaceId)
            throw new Error('No workspace selected');
        try {
            const result = await getOrCreateConversationMutation({
                workspaceId: String(workspaceId),
                otherUserId,
                otherUserName,
                otherUserRole,
            });
            return { legacyId: result.legacyId, isNew: result.isNew };
        }
        catch (error: unknown) {
            reportConvexFailure({
                error: error,
                context: 'useDirectMessages:getOrCreateConversation',
                title: 'Unable to start conversation',
                fallbackMessage: 'Unable to start conversation',
            });
            throw error;
        }
    };
    const startNewDM = async (user: {
        id: string;
        name: string;
        role?: string | null;
    }) => {
        const result = await getOrCreateConversation(user.id, user.name, user.role);
        const newConversation: DirectConversation = {
            id: result.legacyId,
            legacyId: result.legacyId,
            otherParticipantId: user.id,
            otherParticipantName: user.name,
            otherParticipantRole: user.role ?? null,
            lastMessageSnippet: null,
            lastMessageAtMs: null,
            lastMessageSenderId: null,
            isRead: true,
            isArchived: false,
            isMuted: false,
            createdAtMs: Date.now(),
            updatedAtMs: Date.now(),
        };
        selectConversation(newConversation);
    };
    const sendMessage = async (content: string, attachments?: DirectMessage['attachments']) => {
        if (!selectedConversation || (!isPreviewMode && !workspaceId))
            return;
        setIsSending(true);
        try {
            if (isPreviewMode) {
                const now = Date.now();
                const previewMessage: DirectMessage = {
                    id: `preview-dm-message-${now}`,
                    legacyId: `preview-dm-message-${now}`,
                    senderId: currentUserId ?? 'preview-current-user',
                    senderName: currentUserName?.trim() || 'You',
                    senderRole: currentUserRole ?? null,
                    content,
                    edited: false,
                    editedAtMs: null,
                    deleted: false,
                    deletedAtMs: null,
                    deletedBy: null,
                    attachments: attachments ?? null,
                    reactions: null,
                    readBy: [currentUserId ?? 'preview-current-user'],
                    deliveredTo: [currentUserId ?? 'preview-current-user', selectedConversation.otherParticipantId],
                    readAtMs: now,
                    sharedTo: null,
                    createdAtMs: now,
                    updatedAtMs: now,
                };
                setPreviewMessagesByConversation((prev) => {
                    const existing = prev[selectedConversation.legacyId] ?? [];
                    return {
                        ...prev,
                        [selectedConversation.legacyId]: [...existing, previewMessage].sort((a, b) => b.createdAtMs - a.createdAtMs),
                    };
                });
                setPreviewConversations((prev) => [...prev]
                    .map((conversation) => conversation.legacyId === selectedConversation.legacyId
                    ? {
                        ...conversation,
                        lastMessageSnippet: formatConversationSnippet(content, 160),
                        lastMessageAtMs: now,
                        lastMessageSenderId: currentUserId ?? 'preview-current-user',
                        isRead: true,
                        updatedAtMs: now,
                    }
                    : conversation)
                    .sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0)));
                if (typeof window !== 'undefined') {
                    const conversationSnapshot = selectedConversation;
                    const timerId = window.setTimeout(() => {
                        previewReplyTimersRef.current = previewReplyTimersRef.current.filter((id) => id !== timerId);
                        const autoReply = getPreviewDirectAutoReply({
                            conversationLegacyId: conversationSnapshot.legacyId,
                            otherParticipantId: conversationSnapshot.otherParticipantId,
                            otherParticipantName: conversationSnapshot.otherParticipantName,
                            otherParticipantRole: conversationSnapshot.otherParticipantRole,
                            content,
                            currentUserId,
                        });
                        setPreviewMessagesByConversation((prev) => {
                            const existing = prev[conversationSnapshot.legacyId] ?? [];
                            return {
                                ...prev,
                                [conversationSnapshot.legacyId]: [...existing, autoReply].sort((a, b) => b.createdAtMs - a.createdAtMs),
                            };
                        });
                        setPreviewConversations((prev) => [...prev]
                            .map((conversation) => conversation.legacyId === conversationSnapshot.legacyId
                            ? {
                                ...conversation,
                                lastMessageSnippet: formatConversationSnippet(autoReply.content, 160),
                                lastMessageAtMs: autoReply.createdAtMs,
                                lastMessageSenderId: autoReply.senderId,
                                isRead: true,
                                updatedAtMs: autoReply.updatedAtMs ?? autoReply.createdAtMs,
                            }
                            : conversation)
                            .sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0)));
                    }, 900);
                    previewReplyTimersRef.current.push(timerId);
                }
                return;
            }
            await sendMessageMutation({
                workspaceId: String(workspaceId),
                conversationLegacyId: selectedConversation.legacyId,
                content,
                attachments: attachments ?? null,
            });
        }
        catch (error: unknown) {
            logError(error, 'useDirectMessages:sendMessage');
            throw error;
        }
        finally {
            setIsSending(false);
        }
    };
    const markAsRead = useEffectEvent(async () => {
        if (!selectedConversation || (!isPreviewMode && !workspaceId))
            return;
        if (isPreviewMode) {
            setPreviewConversations((prev) => prev.map((conversation) => conversation.legacyId === selectedConversation.legacyId
                ? { ...conversation, isRead: true }
                : conversation));
            return;
        }
        try {
            await markAsReadMutation({
                workspaceId: String(workspaceId),
                conversationLegacyId: selectedConversation.legacyId,
            });
        }
        catch (error: unknown) {
            reportConvexFailure({
                error: error,
                context: 'useDirectMessages:markAsRead',
                title: 'Unable to mark read',
                fallbackMessage: 'Unable to mark read',
            });
        }
    });
    const editMessage = async (messageLegacyId: string, newContent: string) => {
        if (isPreviewMode) {
            setPreviewMessagesByConversation((prev) => {
                const location = buildPreviewMessageIndex(prev).get(messageLegacyId);
                if (!location)
                    return prev;
                const messages = prev[location.conversationLegacyId];
                const existingMessage = messages?.[location.index];
                if (!messages || !existingMessage)
                    return prev;
                const updatedMessages = [...messages];
                updatedMessages[location.index] = {
                    ...existingMessage,
                    content: newContent,
                    edited: true,
                    editedAtMs: Date.now(),
                    updatedAtMs: Date.now(),
                };
                return {
                    ...prev,
                    [location.conversationLegacyId]: updatedMessages,
                };
            });
            return;
        }
        if (!workspaceId)
            return;
        try {
            await editMessageMutation({
                workspaceId: String(workspaceId),
                messageLegacyId,
                newContent,
            });
        }
        catch (error: unknown) {
            reportConvexFailure({
                error: error,
                context: 'useDirectMessages:editMessage',
                title: 'Edit failed',
                fallbackMessage: 'Edit failed',
            });
        }
    };
    const deleteMessage = async (messageLegacyId: string) => {
        if (isPreviewMode) {
            setPreviewMessagesByConversation((prev) => {
                const location = buildPreviewMessageIndex(prev).get(messageLegacyId);
                if (!location)
                    return prev;
                const messages = prev[location.conversationLegacyId];
                const existingMessage = messages?.[location.index];
                if (!messages || !existingMessage)
                    return prev;
                const updatedMessages = [...messages];
                updatedMessages[location.index] = {
                    ...existingMessage,
                    content: '',
                    deleted: true,
                    deletedAtMs: Date.now(),
                    deletedBy: currentUserId ?? 'preview-current-user',
                    updatedAtMs: Date.now(),
                };
                return {
                    ...prev,
                    [location.conversationLegacyId]: updatedMessages,
                };
            });
            return;
        }
        if (!workspaceId)
            return;
        try {
            await deleteMessageMutation({
                workspaceId: String(workspaceId),
                messageLegacyId,
            });
        }
        catch (error: unknown) {
            reportConvexFailure({
                error: error,
                context: 'useDirectMessages:deleteMessage',
                title: 'Delete failed',
                fallbackMessage: 'Delete failed',
            });
        }
    };
    const toggleReaction = async (messageLegacyId: string, emoji: string) => {
        if (isPreviewMode) {
            const reactionUserId = currentUserId ?? 'preview-current-user';
            setPreviewMessagesByConversation((prev) => {
                const location = buildPreviewMessageIndex(prev).get(messageLegacyId);
                if (!location)
                    return prev;
                const messages = prev[location.conversationLegacyId];
                const currentMessage = messages?.[location.index];
                if (!messages || !currentMessage)
                    return prev;
                const currentReactions = currentMessage.reactions ?? [];
                const reactionsByEmoji = new Map(currentReactions.map((reaction) => [reaction.emoji, reaction]));
                const existingReaction = reactionsByEmoji.get(emoji);
                let nextReactions = currentReactions;
                if (existingReaction) {
                    const existingReactionUserIds = new Set(existingReaction.userIds);
                    const hasReacted = existingReactionUserIds.has(reactionUserId);
                    nextReactions = currentReactions.flatMap<NonNullable<DirectMessage['reactions']>[number]>((reaction) => {
                        if (reaction.emoji !== emoji) {
                            return [reaction];
                        }
                        const nextUserIds = hasReacted
                            ? reaction.userIds.filter((entry) => entry !== reactionUserId)
                            : [...reaction.userIds, reactionUserId];
                        if (nextUserIds.length === 0) {
                            return [];
                        }
                        return [{
                                ...reaction,
                                count: nextUserIds.length,
                                userIds: nextUserIds,
                            }];
                    });
                }
                else {
                    nextReactions = [...currentReactions, { emoji, count: 1, userIds: [reactionUserId] }];
                }
                const updatedMessages = [...messages];
                updatedMessages[location.index] = {
                    ...currentMessage,
                    reactions: nextReactions,
                    updatedAtMs: Date.now(),
                };
                return {
                    ...prev,
                    [location.conversationLegacyId]: updatedMessages,
                };
            });
            return;
        }
        if (!workspaceId)
            return;
        try {
            await toggleReactionMutation({
                workspaceId: String(workspaceId),
                messageLegacyId,
                emoji,
            });
        }
        catch (error: unknown) {
            reportConvexFailure({
                error: error,
                context: 'useDirectMessages:toggleReaction',
                title: 'Reaction failed',
                fallbackMessage: 'Reaction failed',
            });
        }
    };
    const archiveConversation = async (archived: boolean) => {
        if (!selectedConversation || (!isPreviewMode && !workspaceId))
            return;
        if (isPreviewMode) {
            setPreviewConversations((prev) => prev.map((conversation) => conversation.legacyId === selectedConversation.legacyId
                ? { ...conversation, isArchived: archived }
                : conversation));
            return;
        }
        try {
            await setArchiveStatusMutation({
                workspaceId: String(workspaceId),
                conversationLegacyId: selectedConversation.legacyId,
                archived,
            });
            setSelectedConversation((prev) => prev ? { ...prev, isArchived: archived } : null);
        }
        catch (error: unknown) {
            reportConvexFailure({
                error: error,
                context: 'useDirectMessages:archiveConversation',
                title: 'Archive update failed',
                fallbackMessage: 'Archive update failed',
            });
        }
    };
    const muteConversation = async (muted: boolean) => {
        if (!selectedConversation || (!isPreviewMode && !workspaceId))
            return;
        if (isPreviewMode) {
            setPreviewConversations((prev) => prev.map((conversation) => conversation.legacyId === selectedConversation.legacyId
                ? { ...conversation, isMuted: muted }
                : conversation));
            return;
        }
        try {
            await setMuteStatusMutation({
                workspaceId: String(workspaceId),
                conversationLegacyId: selectedConversation.legacyId,
                muted,
            });
            setSelectedConversation((prev) => prev ? { ...prev, isMuted: muted } : null);
        }
        catch (error: unknown) {
            reportConvexFailure({
                error: error,
                context: 'useDirectMessages:muteConversation',
                title: 'Mute update failed',
                fallbackMessage: 'Mute update failed',
            });
        }
    };
    const markedReadConversationRef = useRef<string | null>(null);
    useEffect(() => {
        if (!selectedConversation || selectedConversation.isRead) {
            return;
        }
        if (markedReadConversationRef.current === selectedConversation.legacyId) {
            return;
        }
        markedReadConversationRef.current = selectedConversation.legacyId;
        void markAsRead();
    }, [selectedConversation]);
    return {
        sendMessage,
        isSending,
        markAsRead,
        editMessage,
        deleteMessage,
        toggleReaction,
        archiveConversation,
        muteConversation,
        getOrCreateConversation,
        unreadCount: isPreviewMode ? conversations.filter((conversation) => !conversation.isRead).length : unreadCountQuery ?? 0,
        startNewDM,
    };
}
