'use client';
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { usePrevious } from '@/shared/hooks/use-previous';
import type { ReactNode } from 'react';
import { AlertCircle, Hash, Inbox, MessageCircle, Plus, Search, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
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
import type { ClientTeamMember } from '@/types/clients';
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration';
import type { DirectConversation, DirectMessage } from '../../hooks/use-direct-messages';
import { directMessageToCollaborationMessage } from '../../lib/direct-message-collaboration';
import type { PendingAttachment, ReactionPendingState, SendMessageOptions, ThreadCursorsState, ThreadErrorsState, ThreadLoadingState, ThreadMessagesState } from '../../hooks/types';
import type { Channel } from '../../types';
import { buildCollaborationChannelShareUrl, buildCollaborationDmShareUrl, CHANNEL_TYPE_COLORS, CHAT_CONVERSATION_ROW_CLASS, CHAT_LIST_PREVIEW_CLASS, formatConversationSnippet, } from '../../utils';
import { collaborationToUnifiedMessage } from '../message-list-utils';
import { EmptyMessagesState, MessagesErrorState, NoSearchResultsState } from '../message-pane-parts';
import type { UnifiedMessage } from '../message-list-types';
import { UnifiedMessagePane } from '../unified-message-pane';
import type { ConversationListPaneProps, SourceFilter, UnifiedItem } from './types';
import { SOURCE_ICONS, getInitials } from './types';
export function ConversationListPane({ channelCount, dmCount, filteredItems, isLoading, isSelected, onNewDM, onSearchQueryChange, onSelectItem, onSourceFilterChange, searchQuery, sourceFilter, totalUnread, className, }: ConversationListPaneProps & {
    className?: string;
}) {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const previousUnread = usePrevious(totalUnread);
    const handleSearchChange = (event: {
        target: {
            value: string;
        };
    }) => {
        onSearchQueryChange(event.target.value);
    };
    const handleSourceFilterChange = (value: string) => {
        onSourceFilterChange(value as SourceFilter);
    };
    const createSelectItemHandler = (item: UnifiedItem) => () => {
        onSelectItem(item);
    };
    const selectInboxItem = useEffectEvent(onSelectItem);
    useEffect(() => {
        const onGlobalKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const tag = target?.tagName;
            const inEditableField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable;
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                if (inEditableField) {
                    return;
                }
                event.preventDefault();
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
                return;
            }
            if (inEditableField || filteredItems.length === 0) {
                return;
            }
            const selectedIndex = filteredItems.findIndex((item) => isSelected(item));
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                const nextIndex = selectedIndex < filteredItems.length - 1 ? selectedIndex + 1 : 0;
                selectInboxItem(filteredItems[nextIndex]!);
                return;
            }
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                const nextIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredItems.length - 1;
                selectInboxItem(filteredItems[nextIndex]!);
            }
        };
        window.addEventListener('keydown', onGlobalKeyDown);
        return () => window.removeEventListener('keydown', onGlobalKeyDown);
    }, [filteredItems, isSelected]);
    const unreadAnnouncement = (() => {
        if (isLoading || previousUnread === undefined) {
            return '';
        }
        if (totalUnread > previousUnread) {
            const newMessages = totalUnread - previousUnread;
            return `${newMessages} new ${newMessages === 1 ? 'message has' : 'messages have'} arrived. ${totalUnread} unread ${totalUnread === 1 ? 'conversation' : 'conversations'} in inbox.`;
        }
        if (totalUnread === 0 && previousUnread > 0) {
            return 'All inbox conversations are marked as read.';
        }
        return '';
    })();
    const showRecentLabel = sourceFilter === 'all' && !searchQuery.trim();
    return (<div className={cn('flex h-full min-h-0 w-full flex-col overflow-hidden border-b border-muted/40 bg-muted/15 max-lg:min-h-[min(72dvh,640px)] lg:w-[min(100%,20rem)] lg:border-b-0 lg:border-r', className)}>
      <LiveRegion message={unreadAnnouncement}/>
      <div className="space-y-3 border-b border-muted/30 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-primary ring-1 ring-primary/15">
              <Inbox className="size-4"/>
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold tracking-tight">Inbox</h3>
              <p className="text-[11px] text-muted-foreground">Channels & direct messages</p>
            </div>
            {totalUnread > 0 ? (<Badge variant="default" className="h-5 shrink-0 px-1.5 text-xs" aria-label={`${totalUnread} unread ${totalUnread === 1 ? 'conversation' : 'conversations'}`}>
                {totalUnread}
              </Badge>) : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onNewDM} title="New direct message" aria-label="Start a new direct message">
            <Plus className="size-4"/>
          </Button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
          <Input ref={searchInputRef} value={searchQuery} onChange={handleSearchChange} placeholder="Search conversations…" className="pl-9 pr-14" aria-label="Search conversations"/>
          <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none rounded border border-muted/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline">
            ⌘/Ctrl K
          </span>
        </div>

        <Tabs value={sourceFilter} onValueChange={handleSourceFilterChange}>
          <TabsList className="flex h-auto w-full flex-wrap gap-0.5 bg-muted/50 p-1">
            <TabsTrigger value="all" className="group flex-1 text-xs data-[active]:shadow-sm">
              All <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px] group-data-[active]:bg-primary-foreground/20 group-data-[active]:text-primary-foreground">{channelCount + dmCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="channel" className="group flex-1 text-xs data-[active]:shadow-sm">
              <Hash className="mr-0.5 size-3"/>
              {channelCount}
            </TabsTrigger>
            <TabsTrigger value="direct_message" className="group flex-1 text-xs data-[active]:shadow-sm">
              <MessageCircle className="mr-0.5 size-3"/>
              {dmCount}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="min-h-0 w-full max-w-full flex-1 overflow-x-hidden">
        {isLoading ? (<output className="block space-y-3 p-4" aria-live="polite" aria-busy="true" aria-label="Loading conversations">
            {['inbox-skeleton-1', 'inbox-skeleton-2', 'inbox-skeleton-3', 'inbox-skeleton-4', 'inbox-skeleton-5'].map((slotKey) => (<div key={slotKey} className="flex items-center gap-3 p-3">
                <Skeleton className="size-10 shrink-0 rounded-full"/>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24"/>
                  <Skeleton className="h-3 w-32"/>
                </div>
              </div>))}
          </output>) : filteredItems.length === 0 ? (<div className="p-8 text-center">
            <Inbox className="mx-auto mb-3 size-12 text-muted-foreground/40"/>
            <p className="text-sm text-muted-foreground">{searchQuery ? 'No conversations match your search.' : sourceFilter === 'channel' ? 'No channels yet.' : sourceFilter === 'direct_message' ? 'No direct messages yet.' : 'No conversations yet.'}</p>
            {sourceFilter === 'all' ? (<Button variant="outline" size="sm" className="mt-3" onClick={onNewDM}>
                <Plus className="mr-1 size-4"/>
                Start a conversation
              </Button>) : sourceFilter === 'direct_message' ? (<Button variant="outline" size="sm" className="mt-3" onClick={onNewDM}>
                <Plus className="mr-1 size-4"/>
                Start a direct message
              </Button>) : null}
          </div>) : (<div className="space-y-1 p-2">
            {showRecentLabel ? (<div className="px-2 pb-1 pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90">Recent</p>
              </div>) : null}
            {filteredItems.map((item) => {
                const hasUnread = !item.isRead || item.unreadCount > 0;
                const selected = isSelected(item);
                return (<button key={`${item.type}-${item.legacyId}`} type="button" aria-current={selected ? 'true' : undefined} onClick={createSelectItemHandler(item)} className={cn(CHAT_CONVERSATION_ROW_CLASS, 'cv-scroll-item-compact', chromaticTransitionClass, 'hover:bg-muted/60', selected && 'border border-accent/25 bg-accent/8 shadow-sm ring-1 ring-primary/10', hasUnread && !selected && 'bg-muted/25')}>
                  <Avatar className="size-10 shrink-0">
                    {item.type === 'channel' && item.metadata.channelAvatarUrl ? (<AvatarImage src={item.metadata.channelAvatarUrl} alt={item.name} className="object-cover"/>) : null}
                    <AvatarFallback className={cn('text-xs font-medium', hasUnread && 'bg-accent/10 text-primary', item.type === 'channel' && 'bg-muted')}>
                      {item.type === 'channel' ? SOURCE_ICONS.channel : getInitials(item.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('truncate text-sm', hasUnread ? 'font-semibold' : 'font-medium', selected && 'text-primary')}>{item.name}</span>
                      {item.lastMessageAtMs ? (<ClientRelativeTime value={item.lastMessageAtMs} className="shrink-0 text-[10px] text-muted-foreground"/>) : null}
                    </div>

                    <div className="mt-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden">
                      {item.type === 'channel' ? (<Badge variant="outline" className={cn('h-4 shrink-0 px-1 py-0 text-[10px]', CHANNEL_TYPE_COLORS[item.metadata.channelType || 'team'])}>
                          {item.metadata.channelType || 'channel'}
                        </Badge>) : item.metadata.otherParticipantRole ? (<Badge variant="outline" className="h-4 shrink-0 px-1 py-0 text-[10px]">
                          {item.metadata.otherParticipantRole}
                        </Badge>) : null}
                      <p className={CHAT_LIST_PREVIEW_CLASS} title={item.lastMessageSnippet ?? undefined}>
                        {item.lastMessageSnippet
                        ? formatConversationSnippet(item.lastMessageSnippet)
                        : 'No messages yet'}
                      </p>
                    </div>
                  </div>

                  {hasUnread ? (<div className="flex shrink-0 items-center gap-1">
                      {item.unreadCount > 0 ? <Badge variant="default" className="h-5 px-1.5 text-xs">{item.unreadCount}</Badge> : null}
                      <div className="size-2 rounded-full bg-primary"/>
                    </div>) : null}
                </button>);
            })}
          </div>)}
      </ScrollArea>
    </div>);
}
