'use client';
import { notifyFailure, notifyInfo, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useConvex, useMutation } from 'convex/react';
import { v4 as uuidv4 } from 'uuid';
import { collaborationApi } from '@/lib/convex-api';
import { getPreviewCollaborationAutoReply } from '@/lib/preview-data';
import type { ClientTeamMember } from '@/types/clients';
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration';
import type { Channel } from '../types';
import { convertMentionsToMarkdown, extractMentionsFromContent } from '../utils/mentions';
import { mapCollaborationMessageRow, previewPendingAttachmentToCollaborationAttachment } from './message-mappers';
import type { PendingAttachment, SendMessageOptions } from './types';
type UseChannelMessageSendOptions = {
    workspaceId: string | null;
    currentUserId: string | null;
    selectedChannel: Channel | null;
    channels: Channel[];
    channelMessages: CollaborationMessage[];
    channelParticipants: ClientTeamMember[];
    fallbackDisplayName: string;
    fallbackRole: string;
    messageInput: string;
    setMessageInput: (value: string) => void;
    pendingAttachments: PendingAttachment[];
    uploading: boolean;
    clearAttachments: () => void;
    uploadAttachments: (attachments: PendingAttachment[]) => Promise<CollaborationAttachment[]>;
    isPreviewMode: boolean;
    stopTyping: () => void | Promise<void>;
    mutateChannelMessages: (channelId: string, updater: (messages: CollaborationMessage[]) => CollaborationMessage[]) => void;
    addThreadReplyToState: (threadRootId: string, message: CollaborationMessage) => void;
    sendToExternalPlatforms: (message: CollaborationMessage, workspaceId: string) => void;
};
export function useChannelMessageSend({ workspaceId, currentUserId, selectedChannel, channels, channelMessages, channelParticipants, fallbackDisplayName, fallbackRole, messageInput, setMessageInput, pendingAttachments, uploading, clearAttachments, uploadAttachments, isPreviewMode, stopTyping, mutateChannelMessages, addThreadReplyToState, sendToExternalPlatforms, }: UseChannelMessageSendOptions) {
    const convex = useConvex();
    const createMessage = useMutation(collaborationApi.createMessage);
    const [sending, setSending] = useState(false);
    const previewReplyTimersRef = useRef<number[]>([]);
    const participantNameMap = new Map(channelParticipants.map((participant) => [participant.name.toLowerCase(), participant]));
    const resolveSenderDetails = () => {
        const participant = participantNameMap.get(fallbackDisplayName.toLowerCase());
        return { senderName: fallbackDisplayName, senderRole: participant?.role ?? fallbackRole };
    };
    const isSendDisabled = (() => {
        if (sending || uploading)
            return true;
        const hasContent = messageInput.trim().length > 0;
        const hasAttachments = pendingAttachments.length > 0;
        return !hasContent && !hasAttachments;
    })();
    const schedulePreviewAutoReply = (params: {
        channelId: string;
        channelType: Channel['type'];
        clientId: string | null;
        projectId: string | null;
        content: string;
        parentMessageId?: string | null;
        threadRootId?: string | null;
    }) => {
        if (typeof window === 'undefined')
            return;
        const timerId = window.setTimeout(() => {
            previewReplyTimersRef.current = previewReplyTimersRef.current.filter((id) => id !== timerId);
            const reply = getPreviewCollaborationAutoReply({
                channelType: params.channelType,
                clientId: params.clientId,
                projectId: params.projectId,
                content: params.content,
                viewerId: currentUserId,
                parentMessageId: params.parentMessageId ?? null,
                threadRootId: params.threadRootId ?? null,
            });
            mutateChannelMessages(params.channelId, (messages) => {
                if (reply.parentMessageId && reply.threadRootId) {
                    return messages.map((message) => {
                        if (message.id !== reply.threadRootId) {
                            return message;
                        }
                        return {
                            ...message,
                            threadReplyCount: (message.threadReplyCount ?? 0) + 1,
                            threadLastReplyAt: reply.createdAt,
                        };
                    });
                }
                return [...messages, reply];
            });
            if (reply.threadRootId) {
                addThreadReplyToState(reply.threadRootId, reply);
            }
        }, 900);
        previewReplyTimersRef.current.push(timerId);
    };
    const handleSendMessage = async (options?: SendMessageOptions) => {
        const trimmedContent = convertMentionsToMarkdown((options?.content ?? messageInput).trim(), channelParticipants);
        const channelId = selectedChannel?.id;
        if (!trimmedContent && pendingAttachments.length === 0) {
            notifyFailure({
                title: 'Message required',
                message: 'Enter a message before sending.',
            });
            return;
        }
        if (!channelId || !channels.some((c) => c.id === channelId)) {
            notifyFailure({
                title: 'Channel unavailable',
                message: 'Select a channel and try again.',
            });
            return;
        }
        setSending(true);
        try {
            await stopTyping();
            const senderDetails = resolveSenderDetails();
            const uploadedAttachments = isPreviewMode
                ? pendingAttachments.map(previewPendingAttachmentToCollaborationAttachment)
                : await uploadAttachments(pendingAttachments);
            const mentionMatches = extractMentionsFromContent(trimmedContent);
            const mentionMetadata = mentionMatches.map((mention) => {
                const participant = participantNameMap.get(mention.name.toLowerCase());
                return { slug: mention.slug, name: participant?.name ?? mention.name, role: participant?.role ?? null };
            });
            if (!currentUserId || (!isPreviewMode && !workspaceId) || !selectedChannel) {
                return;
            }
            const parentMessage = options?.parentMessageId
                ? channelMessages.find((message) => message.id === options.parentMessageId)
                : null;
            const resolvedThreadRootId = options?.parentMessageId
                ? (parentMessage?.threadRootId || parentMessage?.id || options.parentMessageId)
                : null;
            if (isPreviewMode) {
                const messageId = uuidv4();
                const createdMessage: CollaborationMessage = {
                    id: messageId,
                    channelType: selectedChannel.type,
                    clientId: selectedChannel.clientId ?? null,
                    projectId: selectedChannel.projectId ?? null,
                    senderId: String(currentUserId),
                    senderName: senderDetails.senderName,
                    senderRole: senderDetails.senderRole,
                    content: trimmedContent,
                    createdAt: new Date().toISOString(),
                    updatedAt: null,
                    isEdited: false,
                    deletedAt: null,
                    deletedBy: null,
                    isDeleted: false,
                    attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
                    format: 'markdown',
                    mentions: mentionMetadata.length > 0 ? mentionMetadata : undefined,
                    reactions: [],
                    readBy: [String(currentUserId)],
                    deliveredTo: [String(currentUserId)],
                    isPinned: false,
                    pinnedAt: null,
                    pinnedBy: null,
                    sharedTo: undefined,
                    parentMessageId: options?.parentMessageId ?? null,
                    threadRootId: resolvedThreadRootId,
                    threadReplyCount: undefined,
                    threadLastReplyAt: null,
                };
                mutateChannelMessages(channelId, (messages) => {
                    if (createdMessage.parentMessageId) {
                        return messages.map((message) => {
                            if (message.id !== resolvedThreadRootId) {
                                return message;
                            }
                            return {
                                ...message,
                                threadReplyCount: (message.threadReplyCount ?? 0) + 1,
                                threadLastReplyAt: createdMessage.createdAt,
                            };
                        });
                    }
                    return [...messages, createdMessage];
                });
                if (resolvedThreadRootId) {
                    addThreadReplyToState(resolvedThreadRootId, createdMessage);
                }
                schedulePreviewAutoReply({
                    channelId,
                    channelType: selectedChannel.type,
                    clientId: selectedChannel.clientId ?? null,
                    projectId: selectedChannel.projectId ?? null,
                    content: trimmedContent,
                    parentMessageId: options?.parentMessageId ? createdMessage.id : null,
                    threadRootId: resolvedThreadRootId,
                });
                clearAttachments();
                setMessageInput('');
                notifyInfo({ title: 'Preview message sent', message: 'This only updates the sample collaboration feed.' });
                return;
            }
            const messageId = uuidv4();
            await createMessage({
                workspaceId: String(workspaceId),
                legacyId: messageId,
                channelId: selectedChannel.isCustom ? selectedChannel.id : null,
                channelType: selectedChannel.type,
                clientId: selectedChannel.clientId ?? null,
                projectId: selectedChannel.projectId ?? null,
                senderId: String(currentUserId),
                senderName: senderDetails.senderName,
                senderRole: senderDetails.senderRole,
                content: trimmedContent,
                attachments: (uploadedAttachments as CollaborationAttachment[]) ?? [],
                format: 'markdown',
                mentions: mentionMetadata,
                parentMessageId: options?.parentMessageId ?? null,
                threadRootId: resolvedThreadRootId,
                isThreadRoot: !options?.parentMessageId,
            });
            const createdRow = await convex.query(collaborationApi.getByLegacyId, {
                workspaceId: String(workspaceId),
                legacyId: messageId,
            });
            const createdMessage = createdRow
                ? mapCollaborationMessageRow(createdRow, {
                    fallbackChannelType: selectedChannel.type,
                    fallbackClientId: selectedChannel.clientId ?? null,
                    fallbackProjectId: selectedChannel.projectId ?? null,
                    fallbackSenderId: String(currentUserId),
                    fallbackSenderName: senderDetails.senderName,
                    fallbackSenderRole: senderDetails.senderRole,
                    fallbackThreadRootId: resolvedThreadRootId,
                    fallbackCreatedAtIso: new Date().toISOString(),
                })
                : null;
            const safeCreatedMessage: CollaborationMessage = createdMessage ?? {
                id: messageId,
                channelType: selectedChannel.type,
                clientId: selectedChannel.clientId ?? null,
                projectId: selectedChannel.projectId ?? null,
                senderId: String(currentUserId),
                senderName: senderDetails.senderName,
                senderRole: senderDetails.senderRole,
                content: trimmedContent,
                createdAt: new Date().toISOString(),
                updatedAt: null,
                isEdited: false,
                deletedAt: null,
                deletedBy: null,
                isDeleted: false,
                attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
                format: 'markdown',
                mentions: mentionMetadata.length > 0 ? mentionMetadata : undefined,
                reactions: [],
                readBy: [String(currentUserId)],
                deliveredTo: [String(currentUserId)],
                isPinned: false,
                pinnedAt: null,
                pinnedBy: null,
                sharedTo: undefined,
                parentMessageId: options?.parentMessageId ?? null,
                threadRootId: resolvedThreadRootId,
            };
            mutateChannelMessages(channelId, (messages) => {
                if (messages.some((m) => m.id === safeCreatedMessage.id))
                    return messages;
                return [...messages, safeCreatedMessage];
            });
            if (resolvedThreadRootId) {
                addThreadReplyToState(resolvedThreadRootId, safeCreatedMessage);
            }
            clearAttachments();
            setMessageInput('');
            if (workspaceId) {
                void sendToExternalPlatforms(safeCreatedMessage, workspaceId);
            }
            notifySuccess({ title: 'Message sent', message: 'Your message is live for the team.' });
        }
        catch (error) {
            reportConvexFailure({
                error,
                context: 'useChannelMessageSend:handleSendMessage',
                title: 'Collaboration error',
                fallbackMessage: 'Collaboration error',
            });
        }
        finally {
            setSending(false);
        }
    };
    return {
        handleSendMessage,
        sending,
        isSendDisabled,
    };
}
