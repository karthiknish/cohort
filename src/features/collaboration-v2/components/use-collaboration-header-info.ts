'use client';

import { useMemo } from 'react';
import type { MessagePaneHeaderInfo } from '@/features/dashboard/collaboration/components/unified-message-pane-types';
import { collectSharedFiles } from '@/features/dashboard/collaboration/lib/utils';
import type { Channel } from '../types';
import type { CollaborationMessage, DirectConversation } from '@/types/collaboration';
import type { ClientTeamMember } from '@/types/clients';
import type { useCollaborationUrlState } from '../hooks/use-collaboration-url-state';

type UrlState = ReturnType<typeof useCollaborationUrlState>;

export type BuildHeaderInfoArgs = {
  effectiveSelectedChannel: Channel | null;
  channelParticipants: ClientTeamMember[];
  channelMessages: CollaborationMessage[];
  channelUnreadCounts: Record<string, number>;
  handleMarkChannelRead: () => Promise<void>;
  handleExportChannel: () => void;
  urlState: UrlState;
  selectedDM: DirectConversation | null;
  workspaceId: string | null;
  currentUserId: string | null;
  currentUserRole: string | null;
  archiveConversation: (args: {
    workspaceId: string;
    conversationLegacyId: string;
    archived: boolean;
  }) => Promise<unknown>;
  muteConversation: (args: {
    workspaceId: string;
    conversationLegacyId: string;
    muted: boolean;
  }) => Promise<unknown>;
};

export function useCollaborationHeaderInfo({
  effectiveSelectedChannel,
  channelParticipants,
  channelMessages,
  channelUnreadCounts,
  handleMarkChannelRead,
  handleExportChannel,
  urlState,
  selectedDM,
  workspaceId,
  currentUserId,
  currentUserRole,
  archiveConversation,
  muteConversation,
}: BuildHeaderInfoArgs) {
  return useMemo<MessagePaneHeaderInfo | null>(() => {
    if (effectiveSelectedChannel) {
      const channel = effectiveSelectedChannel;
      const sharedFiles = collectSharedFiles(
        channelMessages.flatMap((message) =>
          !message.isDeleted && message.attachments && message.attachments.length > 0
            ? [message.attachments]
            : []
        )
      );
      const isAdmin = currentUserRole === 'admin';
      return {
        conversationKey: `channel:${channel.id}`,
        name: channel.name,
        type: 'channel',
        channelKind: channel.type,
        participantCount: channelParticipants.length,
        messageCount: channelMessages.length,
        channelUnreadCount: channelUnreadCounts[channel.id] ?? 0,
        onMarkChannelRead: handleMarkChannelRead,
        onExport: handleExportChannel,
        onBack: () => urlState.setChannelId(null),
        channelInfo:
          workspaceId != null
            ? {
                channel,
                channelMessages,
                channelParticipants,
                currentUserId,
                sharedFiles,
                workspaceId,
                isAdmin,
                canManageMembers: false,
                onManageMembers: undefined,
                onPinnedMessageClick: (messageId: string) => {
                  urlState.setDeepLinkMessage(messageId, null);
                },
              }
            : undefined,
      };
    }
    if (selectedDM) {
      const dm = selectedDM;
      return {
        conversationKey: `dm:${dm.legacyId}`,
        name: dm.otherParticipantName,
        type: 'dm',
        role: dm.otherParticipantRole ?? null,
        isArchived: dm.isArchived,
        isMuted: dm.isMuted,
        onArchive: async (archived: boolean) => {
          if (!workspaceId) return;
          await archiveConversation({
            workspaceId: String(workspaceId),
            conversationLegacyId: dm.legacyId,
            archived,
          });
        },
        onMute: async (muted: boolean) => {
          if (!workspaceId) return;
          await muteConversation({
            workspaceId: String(workspaceId),
            conversationLegacyId: dm.legacyId,
            muted,
          });
        },
        onBack: () => urlState.setConversationLegacyId(null),
      };
    }
    return null;
  }, [
    effectiveSelectedChannel,
    channelParticipants,
    channelMessages,
    channelUnreadCounts,
    handleMarkChannelRead,
    handleExportChannel,
    urlState,
    selectedDM,
    workspaceId,
    currentUserId,
    currentUserRole,
    archiveConversation,
    muteConversation,
  ]);
}
