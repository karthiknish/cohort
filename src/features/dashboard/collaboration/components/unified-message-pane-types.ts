'use client';
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration';
import type { ClientTeamMember } from '@/types/clients';
import type { Channel } from '../types';
import type { ChannelPresenceMember } from '../hooks/use-channel-presence';
export type ChannelInfoHeaderConfig = {
    channel: Channel;
    channelMessages: CollaborationMessage[];
    channelParticipants: ClientTeamMember[];
    sharedFiles: CollaborationAttachment[];
    workspaceId: string;
    currentUserId: string | null;
    isAdmin: boolean;
    canManageMembers?: boolean;
    onManageMembers?: () => void;
    onPinnedMessageClick?: (messageId: string) => void;
};
export interface MessagePaneHeaderInfo {
    /** Stable id for list keys and scroll reset (channel id or DM legacy id). */
    conversationKey?: string;
    name: string;
    type: 'channel' | 'dm';
    role?: string | null;
    /** Channel workspace kind (team / client / project) for header badge */
    channelKind?: 'team' | 'client' | 'project';
    isArchived?: boolean;
    isMuted?: boolean;
    onArchive?: (archived: boolean) => void;
    onMute?: (muted: boolean) => void;
    primaryActionLabel?: string;
    onPrimaryAction?: () => void;
    participantCount?: number;
    messageCount?: number;
    onExport?: () => void;
    /** When set, header shows “Copy link” using this URL (built on demand on the client). */
    buildShareableUrl?: () => string;
    /** Channel: server-backed unread count for selected channel (badge). */
    channelUnreadCount?: number;
    onMarkChannelRead?: () => void | Promise<void>;
    markChannelReadPending?: boolean;
    onBack?: () => void;
    /** Opens channel info modal with roster and asset library (channels only). */
    channelInfo?: ChannelInfoHeaderConfig;
    /** Live presence members for the conversation (online users). `undefined`
     *  while loading, `null` when presence is disabled, or an array once loaded. */
    presenceMembers?: ChannelPresenceMember[] | null;
}
