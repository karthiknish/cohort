'use client';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { logError } from '@/lib/convex-errors';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { notifySuccess } from '@/lib/notifications';
import { collaborationApi } from '@/lib/convex-api';
import type { CollaborationMessage } from '@/types/collaboration';
import type { Channel } from '../types';
type UseChannelReadReceiptsOptions = {
    workspaceId: string | null;
    currentUserId: string | null;
    selectedChannel: Channel | null;
    channelMessages: CollaborationMessage[];
    isPreviewMode: boolean;
    mutateChannelMessages: (channelId: string, updater: (messages: CollaborationMessage[]) => CollaborationMessage[]) => void;
};
export function useChannelReadReceipts({ workspaceId, currentUserId, selectedChannel, channelMessages, isPreviewMode, mutateChannelMessages, }: UseChannelReadReceiptsOptions) {
    const markChannelAsRead = useMutation(collaborationApi.markChannelAsRead);
    const markThreadAsReadMutation = useMutation(collaborationApi.markThreadAsRead);
    const [markChannelReadPending, setMarkChannelReadPending] = useState(false);
    const lastMarkedMessageByChannelRef = useRef<Record<string, string>>({});
    const handleMarkSelectedChannelAsRead = useEffectEvent(async (options?: {
        force?: boolean;
    }): Promise<boolean> => {
        const force = Boolean(options?.force);
        if (!currentUserId || !selectedChannel || (!isPreviewMode && !workspaceId)) {
            return false;
        }
        const markPreviewLoadedMessagesRead = () => {
            mutateChannelMessages(selectedChannel.id, (messages) => messages.map((message) => {
                if (message.isDeleted || message.senderId === currentUserId) {
                    return message;
                }
                const readBy = Array.isArray(message.readBy) ? message.readBy : [];
                if (readBy.includes(currentUserId)) {
                    return message;
                }
                return {
                    ...message,
                    readBy: [...readBy, currentUserId],
                };
            }));
        };
        const latestUnread = [...channelMessages]
            .reverse()
            .find((message) => {
            if (message.isDeleted)
                return false;
            if (message.senderId === currentUserId)
                return false;
            const readBy = Array.isArray(message.readBy) ? message.readBy : [];
            return !readBy.includes(currentUserId);
        });
        if (!latestUnread) {
            if (!force) {
                return false;
            }
            try {
                if (isPreviewMode) {
                    markPreviewLoadedMessagesRead();
                    lastMarkedMessageByChannelRef.current[selectedChannel.id] = '__all__';
                    return true;
                }
                await markChannelAsRead({
                    workspaceId: String(workspaceId),
                    channelId: selectedChannel.isCustom ? selectedChannel.id : null,
                    channelType: selectedChannel.type,
                    clientId: selectedChannel.type === 'client' ? (selectedChannel.clientId ?? null) : null,
                    projectId: selectedChannel.type === 'project' ? (selectedChannel.projectId ?? null) : null,
                    userId: String(currentUserId),
                });
                lastMarkedMessageByChannelRef.current[selectedChannel.id] = '__all__';
                return true;
            }
            catch (error) {
                logError(error, 'useChannelReadReceipts:handleMarkSelectedChannelAsRead');
                if (force) {
                    throw error;
                }
                return false;
            }
        }
        const alreadyMarked = lastMarkedMessageByChannelRef.current[selectedChannel.id];
        if (!force && alreadyMarked === latestUnread.id) {
            return false;
        }
        const createdAtMs = latestUnread.createdAt ? Date.parse(latestUnread.createdAt) : NaN;
        try {
            if (isPreviewMode) {
                markPreviewLoadedMessagesRead();
                lastMarkedMessageByChannelRef.current[selectedChannel.id] = latestUnread.id;
                return true;
            }
            await markChannelAsRead({
                workspaceId: String(workspaceId),
                channelId: selectedChannel.isCustom ? selectedChannel.id : null,
                channelType: selectedChannel.type,
                clientId: selectedChannel.type === 'client' ? (selectedChannel.clientId ?? null) : null,
                projectId: selectedChannel.type === 'project' ? (selectedChannel.projectId ?? null) : null,
                userId: String(currentUserId),
                beforeMs: Number.isFinite(createdAtMs) ? createdAtMs : undefined,
            });
            lastMarkedMessageByChannelRef.current[selectedChannel.id] = latestUnread.id;
            return true;
        }
        catch (error) {
            logError(error, 'useChannelReadReceipts:handleMarkSelectedChannelAsRead');
            if (force) {
                throw error;
            }
            return false;
        }
    });
    const markChannelRead = async () => {
        setMarkChannelReadPending(true);
        try {
            const didMark = await handleMarkSelectedChannelAsRead({ force: true });
            if (didMark) {
                notifySuccess({ title: 'Marked as read', message: 'Channel read state updated for you.' });
            }
        }
        catch (error) {
            reportConvexFailure({
                error,
                context: 'useChannelReadReceipts:markChannelRead',
                title: 'Could not mark read',
                fallbackMessage: 'Could not mark read',
            });
        }
        finally {
            setMarkChannelReadPending(false);
        }
    };
    const markThreadAsRead = async (threadRootId: string, beforeMs?: number) => {
        if (!currentUserId || !selectedChannel || (!isPreviewMode && !workspaceId)) {
            return;
        }
        const normalizedThreadRootId = typeof threadRootId === 'string' ? threadRootId.trim() : '';
        if (!normalizedThreadRootId) {
            return;
        }
        try {
            if (isPreviewMode) {
                return;
            }
            await markThreadAsReadMutation({
                workspaceId: String(workspaceId),
                channelId: selectedChannel.isCustom ? selectedChannel.id : null,
                channelType: selectedChannel.type,
                clientId: selectedChannel.type === 'client' ? (selectedChannel.clientId ?? null) : null,
                projectId: selectedChannel.type === 'project' ? (selectedChannel.projectId ?? null) : null,
                threadRootId: normalizedThreadRootId,
                userId: String(currentUserId),
                beforeMs,
            });
        }
        catch (error) {
            reportConvexFailure({
                error,
                context: 'useChannelReadReceipts:markThreadAsRead',
                title: 'Could not mark thread read',
                fallbackMessage: 'Could not mark thread read',
            });
        }
    };
    const selectedChannelId = selectedChannel?.id ?? null;
    useEffect(() => {
        if (!selectedChannelId) {
            return;
        }
        const timer = window.setTimeout(() => {
            void handleMarkSelectedChannelAsRead();
        }, 250);
        return () => {
            window.clearTimeout(timer);
        };
        // handleMarkSelectedChannelAsRead is a useEffectEvent that reads the latest
        // channelMessages and selectedChannel. Only depend on stable primitives so
        // the 250ms timeout isn't reset on every render (both channelMessages and
        // selectedChannel are new object references each render).
    }, [selectedChannelId, channelMessages.length]);
    return {
        markChannelRead,
        markChannelReadPending,
        markThreadAsRead,
    };
}
