'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Hash, Inbox, MessageCircle, Plus, Search } from 'lucide-react';
import { CreateChannelDialog } from '@/features/dashboard/collaboration/components/create-channel-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { LiveRegion } from '@/shared/ui/live-region';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { ClientRelativeTime } from '@/shared/components/client-relative-time';
import { chromaticTransitionClass } from '@/lib/motion';
import { cn } from '@/lib/utils';
import {
  CHANNEL_TYPE_COLORS,
  CHAT_CONVERSATION_ROW_CLASS,
  CHAT_LIST_PREVIEW_CLASS,
  formatConversationSnippet,
  getInitials,
} from '@/features/dashboard/collaboration/utils';
import type { Channel } from '../types';
import type { DirectConversation } from '@/types/collaboration';

export type SourceFilter = 'all' | 'channel' | 'direct_message';

export type InboxItem = {
  key: string;
  type: 'channel' | 'direct_message';
  legacyId: string;
  name: string;
  lastMessageSnippet: string | null;
  lastMessageAtMs: number | null;
  isRead: boolean;
  unreadCount: number;
  avatarUrl?: string | null;
  channelType?: Channel['type'];
  otherParticipantRole?: string | null;
};

export type ConversationListPaneProps = {
  channelCount: number;
  dmCount: number;
  filteredItems: InboxItem[];
  isLoading: boolean;
  selectedKey: string | null;
  onSelectItem: (item: InboxItem) => void;
  onSearchQueryChange: (value: string) => void;
  onSourceFilterChange: (value: SourceFilter) => void;
  searchQuery: string;
  sourceFilter: SourceFilter;
  totalUnread: number;
  onNewDM: () => void;
  createChannelProps?: {
    workspaceId: string | null;
    userId: string | null;
    teamMembers: Array<{ id: string; name: string; email?: string; role?: string }>;
    onCreate: (channel: {
      name: string;
      description?: string;
      visibility: 'public' | 'private';
      memberIds: string[];
    }) => Promise<void> | void;
  };
  crossChannelSearchSlot?: React.ReactNode;
  className?: string;
};

export function ConversationListPane({
  channelCount,
  dmCount,
  filteredItems,
  isLoading,
  selectedKey,
  onSelectItem,
  onSearchQueryChange,
  onSourceFilterChange,
  searchQuery,
  sourceFilter,
  totalUnread,
  onNewDM,
  createChannelProps,
  crossChannelSearchSlot,
  className,
}: ConversationListPaneProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      const inEditableField =
        tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        if (inEditableField) return;
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }
      if (inEditableField || filteredItems.length === 0) return;
      const selectedIndex = filteredItems.findIndex((item) => item.key === selectedKey);
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = selectedIndex < filteredItems.length - 1 ? selectedIndex + 1 : 0;
        onSelectItem(filteredItems[nextIndex]!);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const nextIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredItems.length - 1;
        onSelectItem(filteredItems[nextIndex]!);
      }
    };
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  }, [filteredItems, selectedKey, onSelectItem]);

  const showRecentLabel = sourceFilter === 'all' && !searchQuery.trim();

  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-full flex-col overflow-hidden border-b border-muted/40 bg-muted/15 max-lg:min-h-[min(72dvh,640px)] lg:w-[min(100%,20rem)] lg:border-b-0 lg:border-r',
        className,
      )}
    >
      <LiveRegion message={totalUnread > 0 ? `${totalUnread} unread conversations` : ''} />
      <div className="space-y-3 border-b border-muted/30 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-primary ring-1 ring-primary/15">
              <Inbox className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold tracking-tight">Inbox</h3>
              <p className="text-[11px] text-muted-foreground">Channels & direct messages</p>
            </div>
            {totalUnread > 0 ? (
              <Badge
                variant="default"
                className="h-5 shrink-0 px-1.5 text-xs"
                aria-label={`${totalUnread} unread conversations`}
              >
                {totalUnread}
              </Badge>
            ) : null}
          </div>
          <div className="flex items-center gap-1">
            {createChannelProps ? (
              <CreateChannelDialog
                workspaceId={createChannelProps.workspaceId}
                userId={createChannelProps.userId}
                teamMembers={createChannelProps.teamMembers}
                onCreate={createChannelProps.onCreate}
              />
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewDM}
              title="New direct message"
              aria-label="Start a new direct message"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search conversations…"
            className="pl-9 pr-14"
            aria-label="Search conversations"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none rounded border border-muted/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline">
            ⌘/Ctrl K
          </span>
        </div>

        {crossChannelSearchSlot ? (
          <div className="px-1">{crossChannelSearchSlot}</div>
        ) : null}

        <Tabs value={sourceFilter} onValueChange={(value) => onSourceFilterChange(value as SourceFilter)}>
          <TabsList className="flex h-auto w-full flex-wrap gap-0.5 bg-muted/50 p-1">
            <TabsTrigger value="all" className="flex-1 text-xs data-[state=active]:shadow-sm">
              All <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{channelCount + dmCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="channel" className="flex-1 text-xs data-[state=active]:shadow-sm">
              <Hash className="mr-0.5 size-3" />
              {channelCount}
            </TabsTrigger>
            <TabsTrigger value="direct_message" className="flex-1 text-xs data-[state=active]:shadow-sm">
              <MessageCircle className="mr-0.5 size-3" />
              {dmCount}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="min-h-0 w-full max-w-full flex-1 overflow-x-hidden">
        {isLoading ? (
          <output
            className="block space-y-3 p-4"
            aria-live="polite"
            aria-busy="true"
            aria-label="Loading conversations"
          >
            {['inbox-skeleton-1', 'inbox-skeleton-2', 'inbox-skeleton-3', 'inbox-skeleton-4', 'inbox-skeleton-5'].map(
              (slotKey) => (
                <div key={slotKey} className="flex items-center gap-3 p-3">
                  <Skeleton className="size-10 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ),
            )}
          </output>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <Inbox className="mx-auto mb-3 size-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? 'No conversations match your search.'
                : sourceFilter === 'channel'
                  ? 'No channels yet.'
                  : sourceFilter === 'direct_message'
                    ? 'No direct messages yet.'
                    : 'No conversations yet.'}
            </p>
            {sourceFilter === 'all' || sourceFilter === 'direct_message' ? (
              <Button variant="outline" size="sm" className="mt-3" onClick={onNewDM}>
                <Plus className="mr-1 size-4" />
                {sourceFilter === 'all' ? 'Start a conversation' : 'Start a direct message'}
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {showRecentLabel ? (
              <div className="px-2 pb-1 pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90">
                  Recent
                </p>
              </div>
            ) : null}
            {filteredItems.map((item) => {
              const hasUnread = !item.isRead || item.unreadCount > 0;
              const selected = item.key === selectedKey;
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-current={selected ? 'true' : undefined}
                  onClick={() => onSelectItem(item)}
                  className={cn(
                    CHAT_CONVERSATION_ROW_CLASS,
                    'cv-scroll-item-compact',
                    chromaticTransitionClass,
                    'hover:bg-muted/60',
                    selected && 'border border-accent/25 bg-accent/8 shadow-sm ring-1 ring-primary/10',
                    hasUnread && !selected && 'bg-muted/25',
                  )}
                >
                  <Avatar className="size-10 shrink-0">
                    {item.type === 'channel' && item.avatarUrl ? (
                      <AvatarImage src={item.avatarUrl} alt={item.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback
                      className={cn(
                        'text-xs font-medium',
                        hasUnread && 'bg-accent/10 text-primary',
                        item.type === 'channel' && 'bg-muted',
                      )}
                    >
                      {item.type === 'channel' ? <Hash className="size-4" /> : getInitials(item.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'truncate text-sm',
                          hasUnread ? 'font-semibold' : 'font-medium',
                          selected && 'text-primary',
                        )}
                      >
                        {item.name}
                      </span>
                      {item.lastMessageAtMs ? (
                        <ClientRelativeTime
                          value={item.lastMessageAtMs}
                          className="shrink-0 text-[10px] text-muted-foreground"
                        />
                      ) : null}
                    </div>

                    <div className="mt-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden">
                      {item.type === 'channel' ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            'h-4 shrink-0 px-1 py-0 text-[10px]',
                            CHANNEL_TYPE_COLORS[item.channelType ?? 'team'],
                          )}
                        >
                          {item.channelType ?? 'channel'}
                        </Badge>
                      ) : item.otherParticipantRole ? (
                        <Badge variant="outline" className="h-4 shrink-0 px-1 py-0 text-[10px]">
                          {item.otherParticipantRole}
                        </Badge>
                      ) : null}
                      <p
                        className={CHAT_LIST_PREVIEW_CLASS}
                        title={item.lastMessageSnippet ?? undefined}
                      >
                        {item.lastMessageSnippet
                          ? formatConversationSnippet(item.lastMessageSnippet)
                          : 'No messages yet'}
                      </p>
                    </div>
                  </div>

                  {hasUnread ? (
                    <div className="flex shrink-0 items-center gap-1">
                      {item.unreadCount > 0 ? (
                        <Badge variant="default" className="h-5 px-1.5 text-xs">
                          {item.unreadCount}
                        </Badge>
                      ) : null}
                      <div className="size-2 rounded-full bg-primary" />
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

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
