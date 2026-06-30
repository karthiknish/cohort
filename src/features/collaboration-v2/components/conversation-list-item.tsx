'use client';

import { Hash } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
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
import type { InboxItem } from './conversation-list-pane';

export type ConversationListItemProps = {
  item: InboxItem;
  selected: boolean;
  onSelect: (item: InboxItem) => void;
};

export function ConversationListItem({ item, selected, onSelect }: ConversationListItemProps) {
  const hasUnread = !item.isRead || item.unreadCount > 0;
  return (
    <button
      key={item.key}
      type="button"
      aria-current={selected ? 'true' : undefined}
      onClick={() => onSelect(item)}
      className={cn(
        CHAT_CONVERSATION_ROW_CLASS,
        'cv-scroll-item-compact',
        'border border-transparent',
        chromaticTransitionClass,
        'hover:bg-muted/60 hover:border-muted/60',
        selected && 'border-accent/25 bg-accent/8 shadow-sm ring-1 ring-primary/10',
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
}
