'use client';
import type { ReactNode } from 'react';
import { Hash, MessageCircle } from 'lucide-react';
import type { DirectConversation } from '../../hooks/use-direct-messages';
import type { Channel } from '../../types';
export type SourceFilter = 'all' | 'direct_message' | 'channel';
export type ChannelParticipant = {
    name: string;
    role: string;
};
export type UnifiedItem = {
    id: string;
    legacyId: string;
    type: 'channel' | 'direct_message';
    name: string;
    lastMessageSnippet: string | null;
    lastMessageAtMs: number | null;
    isRead: boolean;
    unreadCount: number;
    metadata: {
        channelType?: 'team' | 'client' | 'project';
        channelAvatarUrl?: string | null;
        otherParticipantRole?: string | null;
    };
    originalData: Channel | DirectConversation;
};
export const SOURCE_ICONS: Record<string, ReactNode> = {
    direct_message: <MessageCircle className="size-4"/>,
    channel: <Hash className="size-4"/>,
};
export function getInitials(name: string | null | undefined): string {
    if (!name)
        return '?';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
export type ConversationListPaneProps = {
    channelCount: number;
    dmCount: number;
    filteredItems: UnifiedItem[];
    isLoading: boolean;
    isSelected: (item: UnifiedItem) => boolean;
    onNewDM: () => void;
    onSearchQueryChange: (value: string) => void;
    onSelectItem: (item: UnifiedItem) => void;
    onSourceFilterChange: (value: SourceFilter) => void;
    searchQuery: string;
    sourceFilter: SourceFilter;
    totalUnread: number;
};
