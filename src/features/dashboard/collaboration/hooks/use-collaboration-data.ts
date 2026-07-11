'use client';
import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { collaborationChannelAvatarsApi, collaborationChannelsApi } from '@/lib/convex-api';
import { mergeQueryErrors, useConvexQueryError } from '@/lib/hooks/use-convex-query-error';
import { collectSharedFiles } from '../utils';
import type { UseCollaborationDataReturn } from './types';
import { useAttachmentsData } from './use-attachments-data';
import { useChannelsData } from './use-channels-data';
import { useMessagesData } from './use-messages-data';
import { useProjectsData } from './use-projects-data';
type CustomChannel = {
    legacyId: string;
    name: string;
    description: string | null;
    visibility: 'public' | 'private';
    memberIds: string[];
    memberSummaries: Array<{
        id: string;
        name: string;
        role: string | null;
    }>;
};
export function useCollaborationData(): UseCollaborationDataReturn {
    const { user } = useAuth();
    const { clients, selectedClient, loading: clientsLoading } = useClientContext();
    const { isPreviewMode } = usePreview();
    const workspaceId = user?.agencyId ? String(user.agencyId) : null;
    const userId = user?.id ?? null;
    const fallbackRole = 'Account Owner';
    const fallbackDisplayName = user?.name && user.name.trim().length > 0
        ? user.name.trim()
        : user?.email && user.email.trim().length > 0
            ? user.email.trim()
            : 'You';
    const currentUserId = user?.id ?? null;
    const currentUserRole = user?.role ?? null;
    const selectedClientId = selectedClient?.id ?? null;
    const { projects, projectsLoading } = useProjectsData({
        workspaceId,
        userId,
        selectedClientId,
        isPreviewMode,
    });
    const customChannelsResult = useQuery(collaborationChannelsApi.listAccessible, !isPreviewMode && workspaceId
        ? {
            workspaceId: String(workspaceId),
            channelType: 'team',
        }
        : 'skip') as Array<{
        legacyId?: string;
        name?: string;
        description?: string | null;
        visibility?: 'public' | 'private';
        memberIds?: string[];
        memberSummaries?: Array<{
            id?: string;
            name?: string;
            role?: string | null;
            email?: string | null;
        }>;
    }> | undefined;
    const channelAvatarsResult = useQuery(collaborationChannelAvatarsApi.listForWorkspace, !isPreviewMode && workspaceId ? { workspaceId: String(workspaceId) } : 'skip') as Array<{
        channelKey?: string;
        avatarUrl?: string | null;
    }> | undefined;
    const customChannelsQueryError = useConvexQueryError({
        data: customChannelsResult,
        skipped: isPreviewMode || !workspaceId,
        fallbackMessage: 'Unable to load collaboration channels.',
    });
    const channelAvatarsQueryError = useConvexQueryError({
        data: channelAvatarsResult,
        skipped: isPreviewMode || !workspaceId,
        fallbackMessage: 'Unable to load channel avatars.',
    });
    const channelsQueryError = mergeQueryErrors(customChannelsQueryError, channelAvatarsQueryError);
    const channelAvatars = (() => {
        const map = new Map<string, string>();
        for (const row of channelAvatarsResult ?? []) {
            if (typeof row?.channelKey === 'string' && typeof row?.avatarUrl === 'string' && row.avatarUrl.length > 0) {
                map.set(row.channelKey, row.avatarUrl);
            }
        }
        return map;
    })();
    const customChannels: CustomChannel[] = (customChannelsResult ?? []).flatMap((channel) => typeof channel?.legacyId === 'string' && typeof channel?.name === 'string'
        ? [{
                legacyId: String(channel.legacyId),
                name: String(channel.name),
                description: typeof channel.description === 'string' ? channel.description : null,
                visibility: channel.visibility === 'public' ? 'public' : 'private',
                memberIds: Array.isArray(channel.memberIds)
                    ? channel.memberIds.filter((memberId): memberId is string => typeof memberId === 'string')
                    : [],
                memberSummaries: Array.isArray(channel.memberSummaries)
                    ? channel.memberSummaries.flatMap((member) => typeof member?.id === 'string' && typeof member?.name === 'string'
                        ? [{
                                id: member.id,
                                name: member.name,
                                role: typeof member.role === 'string' ? member.role : null,
                            }]
                        : [])
                    : [],
            }]
        : []);
    const { channels, selectedChannel, searchQuery, setSearchQuery, filteredChannels, selectChannel, channelParticipants, totalChannels, totalParticipants, } = useChannelsData({
        clients,
        projects,
        customChannels,
        fallbackDisplayName,
        fallbackRole,
        visibleClientId: selectedClientId,
        channelAvatars,
    });
    const { pendingAttachments, uploading, handleAddAttachments, handleRemoveAttachment, clearAttachments, uploadAttachments, } = useAttachmentsData({
        userId: currentUserId,
        workspaceId,
    });
    const messages = useMessagesData({
        workspaceId,
        currentUserId,
        selectedChannel,
        channels,
        channelParticipants,
        fallbackDisplayName,
        fallbackRole,
        pendingAttachments,
        uploading,
        clearAttachments,
        uploadAttachments,
    });
    const isBootstrapping = (clientsLoading || projectsLoading) && channels.length === 0;
    const sharedFiles = useMemo(() => {
        const attachmentGroups = messages.channelMessages.flatMap((message) => !message.isDeleted && Array.isArray(message.attachments) && message.attachments.length > 0
            ? [message.attachments ?? []]
            : []);
        return collectSharedFiles(attachmentGroups);
    }, [messages.channelMessages]);
    return useMemo(() => ({
        channels,
        filteredChannels,
        searchQuery,
        setSearchQuery,
        selectedChannel,
        selectChannel,
        channelSummaries: messages.channelSummaries,
        channelUnreadCounts: messages.channelUnreadCounts,
        channelMessages: messages.channelMessages,
        visibleMessages: messages.visibleMessages,
        searchingMessages: messages.searchingMessages,
        searchHighlights: messages.searchHighlights,
        isCurrentChannelLoading: messages.isCurrentChannelLoading,
        isBootstrapping,
        messagesError: mergeQueryErrors(messages.messagesError, channelsQueryError),
        retryMessagesError: messages.retryMessagesError,
        messageSearchQuery: messages.messageSearchQuery,
        setMessageSearchQuery: messages.setMessageSearchQuery,
        totalChannels,
        totalParticipants,
        channelParticipants,
        sharedFiles,
        messageInput: messages.messageInput,
        setMessageInput: messages.setMessageInput,
        pendingAttachments,
        handleAddAttachments,
        handleRemoveAttachment,
        clearPendingAttachments: clearAttachments,
        uploadPendingAttachments: uploadAttachments,
        uploading,
        typingParticipants: messages.typingParticipants,
        handleComposerFocus: messages.handleComposerFocus,
        handleComposerBlur: messages.handleComposerBlur,
        handleSendMessage: messages.handleSendMessage,
        sending: messages.sending,
        isSendDisabled: messages.isSendDisabled,
        messagesEndRef: messages.messagesEndRef,
        handleEditMessage: messages.handleEditMessage,
        handleDeleteMessage: messages.handleDeleteMessage,
        handleToggleReaction: messages.handleToggleReaction,
        messageUpdatingId: messages.messageUpdatingId,
        messageDeletingId: messages.messageDeletingId,
        handleLoadMore: messages.handleLoadMore,
        canLoadMore: messages.canLoadMore,
        loadingMore: messages.loadingMore,
        currentUserId,
        currentUserRole,
        threadMessagesByRootId: messages.threadMessagesByRootId,
        threadNextCursorByRootId: messages.threadNextCursorByRootId,
        threadLoadingByRootId: messages.threadLoadingByRootId,
        threadErrorsByRootId: messages.threadErrorsByRootId,
        threadUnreadCountsByRootId: messages.threadUnreadCountsByRootId,
        loadThreadReplies: messages.loadThreadReplies,
        loadMoreThreadReplies: messages.loadMoreThreadReplies,
        markThreadAsRead: messages.markThreadAsRead,
        clearThreadReplies: messages.clearThreadReplies,
        markChannelRead: messages.markChannelRead,
        markChannelReadPending: messages.markChannelReadPending,
        reactionPendingByMessage: messages.reactionPendingByMessage,
    }), [
        channels,
        filteredChannels,
        searchQuery,
        setSearchQuery,
        selectedChannel,
        selectChannel,
        messages,
        isBootstrapping,
        channelsQueryError,
        totalChannels,
        totalParticipants,
        channelParticipants,
        sharedFiles,
        pendingAttachments,
        handleAddAttachments,
        handleRemoveAttachment,
        clearAttachments,
        uploadAttachments,
        uploading,
        currentUserId,
        currentUserRole,
    ]);
}
