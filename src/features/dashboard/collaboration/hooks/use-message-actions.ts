'use client';
import { notifyFailure, notifyInfo, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useState } from 'react';
import { useMutation } from 'convex/react';
import { collaborationApi } from '@/lib/convex-api';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import type { CollaborationMessage, CollaborationReaction } from '@/types/collaboration';
import { COLLABORATION_REACTION_SET } from '@/constants/collaboration-reactions';
import type { Channel } from '../types';
import type { ReactionPendingState } from './types';
import { extractMentionsFromContent } from '../utils/mentions';
import type { ClientTeamMember } from '@/types/clients';
interface UseMessageActionsOptions {
    workspaceId: string | null;
    userId: string | null;
    isPreviewMode: boolean;
    channels: Channel[];
    channelParticipants: ClientTeamMember[];
    mutateChannelMessages: (channelId: string, updater: (messages: CollaborationMessage[]) => CollaborationMessage[]) => void;
    mutateThreadMessageById?: (messageId: string, updater: (message: CollaborationMessage) => CollaborationMessage) => void;
}
export function useMessageActions({ workspaceId, userId, isPreviewMode, channels, channelParticipants, mutateChannelMessages, mutateThreadMessageById, }: UseMessageActionsOptions) {
    const updateMessage = useMutation(collaborationApi.updateMessage);
    const softDeleteMessage = useMutation(collaborationApi.softDeleteMessage);
    const toggleReaction = useMutation(collaborationApi.toggleReaction);
    const [messageUpdatingId, setMessageUpdatingId] = useState<string | null>(null);
    const [messageDeletingId, setMessageDeletingId] = useState<string | null>(null);
    const [reactionUpdatingByMessage, setReactionUpdatingByMessage] = useState<ReactionPendingState>({});
    const applyMessageUpdate = (channelId: string, messageId: string, updater: (message: CollaborationMessage) => CollaborationMessage) => {
        mutateChannelMessages(channelId, (messages) => {
            const index = messages.findIndex((entry) => entry.id === messageId);
            if (index === -1) {
                return messages;
            }
            const currentMessage = messages[index];
            if (!currentMessage) {
                return messages;
            }
            const updatedMessage = updater(currentMessage);
            if (updatedMessage === currentMessage) {
                return messages;
            }
            const next = [...messages];
            next[index] = updatedMessage;
            return next;
        });
        mutateThreadMessageById?.(messageId, updater);
    };
    const handleToggleReaction = async (channelId: string, messageId: string, emoji: string) => {
        if (!channels.some((channel) => channel.id === channelId)) {
            notifyFailure({
                title: 'Channel unavailable',
                message: 'Refresh and try reacting again.',
            });
            return;
        }
        if (!COLLABORATION_REACTION_SET.has(emoji)) {
            notifyFailure({
                title: 'Reaction unavailable',
                message: 'That emoji is not supported for reactions.',
            });
            return;
        }
        setReactionUpdatingByMessage((prev) => ({
            ...prev,
            [messageId]: emoji,
        }));
        try {
            if (isPreviewMode) {
                const reactionUserId = userId ?? 'preview-current-user';
                applyMessageUpdate(channelId, messageId, (currentMessage) => {
                    const currentReactions = currentMessage.reactions ?? [];
                    const existingReaction = currentReactions.find((reaction) => reaction.emoji === emoji);
                    let nextReactions: CollaborationReaction[];
                    if (existingReaction) {
                        const hasReacted = existingReaction.userIds.includes(reactionUserId);
                        nextReactions = currentReactions.flatMap<CollaborationReaction>((reaction) => {
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
                    return {
                        ...currentMessage,
                        reactions: nextReactions,
                    };
                });
                return;
            }
            if (!workspaceId) {
                throw new Error('Workspace unavailable');
            }
            if (!userId) {
                throw new Error('You must be signed in to react');
            }
            const result = (await toggleReaction({
                workspaceId: String(workspaceId),
                legacyId: messageId,
                emoji,
                userId: String(userId),
            })) as {
                ok?: boolean;
                reactions?: CollaborationReaction[];
            };
            const reactions = Array.isArray(result?.reactions) ? result.reactions : [];
            applyMessageUpdate(channelId, messageId, (currentMessage) => ({
                ...currentMessage,
                reactions,
            }));
        }
        catch (error) {
            reportConvexFailure({
                error: error,
                context: 'useMessageActions:handleToggleReaction',
                title: 'Reaction failed',
                fallbackMessage: 'Reaction failed',
            });
            throw error;
        }
        finally {
            setReactionUpdatingByMessage((prev) => {
                const next = { ...prev };
                if (next[messageId] === emoji) {
                    delete next[messageId];
                }
                return next;
            });
        }
    };
    const handleEditMessage = async (channelId: string, messageId: string, nextContent: string) => {
        const trimmedContent = nextContent.trim();
        if (!trimmedContent) {
            notifyFailure({
                title: 'Message required',
                message: 'Enter a message before saving.',
            });
            return;
        }
        if (!channels.some((channel) => channel.id === channelId)) {
            notifyFailure({
                title: 'Channel unavailable',
                message: 'Refresh the page and try editing again.',
            });
            return;
        }
        setMessageUpdatingId(messageId);
        try {
            const mentionMatches = extractMentionsFromContent(trimmedContent);
            const mentionMetadata = mentionMatches.map((mention) => {
                const participant = channelParticipants.find((member) => member.name.toLowerCase() === mention.name.toLowerCase());
                return {
                    slug: mention.slug,
                    name: participant?.name ?? mention.name,
                    role: participant?.role ?? null,
                };
            });
            if (isPreviewMode) {
                applyMessageUpdate(channelId, messageId, (currentMessage) => ({
                    ...currentMessage,
                    content: trimmedContent,
                    format: 'markdown',
                    mentions: mentionMetadata,
                    updatedAt: new Date().toISOString(),
                    isEdited: true,
                }));
                notifyInfo({ title: 'Preview message updated', message: 'Changes apply only in sample mode.' });
                return;
            }
            if (!workspaceId) {
                throw new Error('Workspace unavailable');
            }
            if (!userId) {
                throw new Error('You must be signed in to edit messages');
            }
            await updateMessage({
                workspaceId: String(workspaceId),
                legacyId: messageId,
                content: trimmedContent,
                format: 'markdown',
                mentions: mentionMetadata,
            });
            applyMessageUpdate(channelId, messageId, (currentMessage) => ({
                ...currentMessage,
                content: trimmedContent,
                format: 'markdown',
                mentions: mentionMetadata,
                updatedAt: new Date().toISOString(),
                isEdited: true,
            }));
            notifySuccess({ title: 'Message updated', message: 'Your edit is live for the team.' });
        }
        catch (error) {
            reportConvexFailure({
                error: error,
                context: 'useMessageActions:handleEditMessage',
                title: 'Collaboration error',
                fallbackMessage: 'Collaboration error',
            });
            throw error;
        }
        finally {
            setMessageUpdatingId((current) => (current === messageId ? null : current));
        }
    };
    const handleDeleteMessage = async (channelId: string, messageId: string) => {
        if (!channels.some((channel) => channel.id === channelId)) {
            notifyFailure({
                title: 'Channel unavailable',
                message: 'Refresh and try deleting again.',
            });
            return;
        }
        setMessageDeletingId(messageId);
        try {
            if (isPreviewMode) {
                applyMessageUpdate(channelId, messageId, (currentMessage) => ({
                    ...currentMessage,
                    content: '',
                    isDeleted: true,
                    deletedAt: new Date().toISOString(),
                    deletedBy: userId ?? 'preview-current-user',
                    attachments: [],
                    reactions: [],
                }));
                notifyInfo({ title: 'Preview message removed', message: 'This only changes the sample conversation.' });
                return;
            }
            if (!workspaceId) {
                throw new Error('Workspace unavailable');
            }
            if (!userId) {
                throw new Error('You must be signed in to delete messages');
            }
            await softDeleteMessage({
                workspaceId: String(workspaceId),
                legacyId: messageId,
                deletedBy: String(userId),
            });
            applyMessageUpdate(channelId, messageId, (currentMessage) => ({
                ...currentMessage,
                content: '',
                isDeleted: true,
                deletedAt: new Date().toISOString(),
                deletedBy: String(userId),
                updatedAt: new Date().toISOString(),
                isEdited: false,
                attachments: [],
                reactions: [],
            }));
            notifySuccess({ title: 'Message removed', message: 'The message is no longer visible to teammates.' });
        }
        catch (error) {
            reportConvexFailure({
                error: error,
                context: 'useMessageActions:handleDeleteMessage',
                title: 'Collaboration error',
                fallbackMessage: 'Collaboration error',
            });
            throw error;
        }
        finally {
            setMessageDeletingId((current) => (current === messageId ? null : current));
        }
    };
    const clearReactionState = () => {
        setReactionUpdatingByMessage({});
    };
    return {
        messageUpdatingId,
        messageDeletingId,
        reactionUpdatingByMessage,
        handleEditMessage,
        handleDeleteMessage,
        handleToggleReaction,
        clearReactionState,
    };
}
