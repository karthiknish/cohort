'use client';

import { useMemo } from 'react';
import type { Channel } from '../types';
import type { DirectConversation } from '@/types/collaboration';
import type { InboxItem, SourceFilter } from './conversation-list-pane';

/** Build the list of inbox items from channels and DM conversations. */
export function buildInboxItems(
  channels: Channel[],
  channelUnreadCounts: Record<string, number>,
  channelLastMessages: Record<string, { content: string; createdAtMs: number } | undefined>,
  conversations: DirectConversation[],
): InboxItem[] {
  const channelItems: InboxItem[] = channels.map((channel) => {
    const lastMessage = channelLastMessages[channel.id];
    return {
      key: `channel:${channel.id}`,
      type: 'channel',
      legacyId: channel.id,
      name: channel.name,
      lastMessageSnippet: lastMessage?.content ?? null,
      lastMessageAtMs: lastMessage?.createdAtMs ?? null,
      isRead: (channelUnreadCounts[channel.id] ?? 0) === 0,
      unreadCount: channelUnreadCounts[channel.id] ?? 0,
      avatarUrl: channel.avatarUrl ?? null,
      channelType: channel.type,
    };
  });

  const dmItems: InboxItem[] = conversations.map((conversation) => ({
    key: `dm:${conversation.legacyId}`,
    type: 'direct_message',
    legacyId: conversation.legacyId,
    name: conversation.otherParticipantName,
    lastMessageSnippet: conversation.lastMessageSnippet ?? null,
    lastMessageAtMs: conversation.lastMessageAtMs ?? null,
    isRead: conversation.isRead,
    unreadCount: conversation.unreadCount ?? 0,
    otherParticipantRole: conversation.otherParticipantRole ?? null,
  }));

  return [...channelItems, ...dmItems];
}

/** Filter and sort inbox items based on the current filter and search query. */
export function filterInboxItems(
  items: InboxItem[],
  sourceFilter: SourceFilter,
  searchQuery: string,
): InboxItem[] {
  const trimmed = searchQuery.trim().toLowerCase();
  return items
    .filter((item) => {
      if (sourceFilter === 'channel' && item.type !== 'channel') return false;
      if (sourceFilter === 'direct_message' && item.type !== 'direct_message') return false;
      if (trimmed && !item.name.toLowerCase().includes(trimmed)) return false;
      return true;
    })
    .sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0));
}

/** Memoized helper combining buildInboxItems + filterInboxItems. */
export function useInboxItems(
  channels: Channel[],
  channelUnreadCounts: Record<string, number>,
  channelLastMessages: Record<string, { content: string; createdAtMs: number } | undefined>,
  conversations: DirectConversation[],
  sourceFilter: SourceFilter,
  searchQuery: string,
) {
  return useMemo(() => {
    const all = buildInboxItems(channels, channelUnreadCounts, channelLastMessages, conversations);
    return filterInboxItems(all, sourceFilter, searchQuery);
  }, [channels, channelUnreadCounts, channelLastMessages, conversations, sourceFilter, searchQuery]);
}
