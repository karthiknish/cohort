'use client';

import { useEffect, useEffectEvent, useRef } from 'react';
import { Hash, Inbox, MessageCircle, Plus, Search } from 'lucide-react';
import { CreateChannelDialog } from '@/features/dashboard/collaboration/components/create-channel-dialog';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { LiveRegion } from '@/shared/ui/live-region';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { cn } from '@/lib/utils';
import type { Channel } from '../types';
import { ConversationListItem } from './conversation-list-item';
import { buildInboxItems, filterInboxItems, useInboxItems } from './conversation-list-utils';

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

  const selectInboxItem = useEffectEvent(onSelectItem);
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
        selectInboxItem(filteredItems[nextIndex]!);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const nextIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredItems.length - 1;
        selectInboxItem(filteredItems[nextIndex]!);
      }
    };
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  }, [filteredItems, selectedKey]);

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
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-primary shadow-sm ring-1 ring-primary/15">
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
            <TabsTrigger value="all" className="group flex-1 text-xs data-[active]:bg-primary data-[active]:text-primary-foreground data-[active]:shadow-sm">
              All <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px] group-data-[active]:bg-primary-foreground/20 group-data-[active]:text-primary-foreground">{channelCount + dmCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="channel" className="group flex-1 text-xs data-[active]:bg-primary data-[active]:text-primary-foreground data-[active]:shadow-sm">
              <Hash className="mr-0.5 size-3" />
              {channelCount}
            </TabsTrigger>
            <TabsTrigger value="direct_message" className="group flex-1 text-xs data-[active]:bg-primary data-[active]:text-primary-foreground data-[active]:shadow-sm">
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
            {filteredItems.map((item) => (
              <ConversationListItem
                key={item.key}
                item={item}
                selected={item.key === selectedKey}
                onSelect={onSelectItem}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Re-export utilities for backward compatibility
export { buildInboxItems, filterInboxItems, useInboxItems } from './conversation-list-utils';
