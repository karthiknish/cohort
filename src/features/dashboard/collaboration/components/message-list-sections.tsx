'use client';
import { useCallback, useMemo, type ComponentType, type MouseEvent, type ReactNode } from 'react';
import { LoaderCircle, RefreshCw, Smile } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import EmojiPicker, { Theme, type EmojiClickData } from '@/shared/ui/emoji-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { FadeIn } from '@/shared/ui/animate-in';
import { Separator } from '@/shared/ui/separator';
import { chromaticTransitionClass, listRowEnterAnimationClass, } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { CHAT_MESSAGE_BODY_CLASS } from '../lib/chat-text';
import type { MessageListRenderers } from './message-list-render-context';
import type { UnifiedMessage } from './message-list-types';
export type { MessageListRenderers } from './message-list-render-context';
function formatTime(ms: number): string {
    const date = new Date(ms);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
function MessageContentBody({ message, Content, }: {
    message: UnifiedMessage;
    Content: ComponentType<{
        message: UnifiedMessage;
    }>;
}) {
    return (<div className={CHAT_MESSAGE_BODY_CLASS}>
      <Content message={message}/>
    </div>);
}
function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
export function MessageListLoadingState({ loadingSkeleton }: {
    loadingSkeleton?: ReactNode;
}) {
    const loadingRowSlots = ['loading-row-1', 'loading-row-2', 'loading-row-3'] as const;
    return (<div className="flex-1 min-h-0 overflow-y-auto p-4">
      {loadingSkeleton || (<div className="space-y-4">
          {loadingRowSlots.map((slot, index) => (<div key={slot} className={cn('flex gap-2', index % 2 === 1 && 'justify-end')}>
              <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted"/>
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted"/>
                <div className="h-16 w-48 animate-pulse rounded-lg bg-muted"/>
              </div>
            </div>))}
        </div>)}
    </div>);
}
export function MessageListEmptyState({ emptyState }: {
    emptyState?: ReactNode;
}) {
    return (<div className="flex-1 min-h-0 overflow-y-auto p-4">
      {emptyState || (<div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No messages yet</p>
        </div>)}
    </div>);
}
export function MessageListLoadMoreButton({ disabled, isLoading, onLoadMore, }: {
    disabled: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
}) {
    return (<div className="flex justify-center pb-4">
      <Button variant="ghost" size="sm" onClick={onLoadMore} disabled={disabled}>
        {isLoading ? (<>
            <LoaderCircle className="mr-2 size-3.5 animate-spin"/>
            Loading…
          </>) : (<>
            <RefreshCw className="mr-2 size-3.5"/>
            Load older messages
          </>)}
      </Button>
    </div>);
}
export function MessageDateSeparator({ date }: {
    date: string;
}) {
    return (<FadeIn y={6} duration={0.18}>
      <div className="mb-4 flex items-center gap-2">
        <Separator className="flex-1"/>
        <span className="text-xs font-medium text-muted-foreground">{date}</span>
        <Separator className="flex-1"/>
      </div>
    </FadeIn>);
}
function MessageReactionRow({ currentUserId, disabled, localReactionPending, message, onReact, reactionPendingByMessage, }: {
    currentUserId: string | null;
    disabled: boolean;
    localReactionPending: string | null;
    message: UnifiedMessage;
    onReact: (messageId: string, emoji: string) => void;
    reactionPendingByMessage: Record<string, string | null>;
}) {
    const handleReactionClick = (event: MouseEvent<HTMLButtonElement>) => {
        const messageId = event.currentTarget.dataset.messageId;
        const emoji = event.currentTarget.dataset.emoji;
        if (!messageId || !emoji)
            return;
        onReact(messageId, emoji);
    };
    if (!message.reactions || message.reactions.length === 0) {
        return null;
    }
    return (<div className="mt-1 flex flex-wrap gap-1">
      {message.reactions.map((reaction) => {
            const isPending = localReactionPending === `${message.id}-${reaction.emoji}` || reactionPendingByMessage[message.id] === reaction.emoji;
            return (<button key={reaction.emoji} type="button" onClick={handleReactionClick} data-message-id={message.id} data-emoji={reaction.emoji} disabled={disabled} className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs', chromaticTransitionClass, reaction.userIds.includes(currentUserId ?? '') ? 'border border-accent/20 bg-accent/10' : 'bg-muted hover:bg-muted/80')}>
            {isPending ? <LoaderCircle className="size-3 animate-spin"/> : <span>{reaction.emoji}</span>}
            <span className="text-muted-foreground">{reaction.count}</span>
          </button>);
        })}
    </div>);
}
function MessageReactionPickerActions({ actions, align = 'start', disabled, message, onReact, }: {
    actions?: ReactNode;
    align?: 'start' | 'end';
    disabled?: boolean;
    message: UnifiedMessage;
    onReact: (messageId: string, emoji: string) => void;
}) {
    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onReact(message.id, emojiData.emoji);
    };
    return (<div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="size-6" disabled={disabled} aria-label="Add reaction">
            <Smile className="size-3"/>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.LIGHT} width={300} height={350}/>
        </PopoverContent>
      </Popover>

      {actions}
    </div>);
}
export type ChannelMessagePendingState = {
    deleting: boolean;
    editing: boolean;
    updating: boolean;
};
type ChannelMessageCardWithPendingProps = Omit<Parameters<typeof ChannelMessageCard>[0], 'pending'> & {
    isDeleting: boolean;
    isEditing: boolean;
    isUpdating: boolean;
};
export function ChannelMessageCardWithPending({ isDeleting, isEditing, isUpdating, ...props }: ChannelMessageCardWithPendingProps) {
    const pending = ({ deleting: isDeleting, editing: isEditing, updating: isUpdating });
    return <ChannelMessageCard pending={pending} {...props}/>;
}
export function ChannelMessageCard({ currentUserId, highlighted, pending, localReactionPending, message, onReact, reactionPendingByMessage, renderers, showAvatars, }: {
    currentUserId: string | null;
    highlighted: boolean;
    pending: ChannelMessagePendingState;
    localReactionPending: string | null;
    message: UnifiedMessage;
    onReact: (messageId: string, emoji: string) => void;
    reactionPendingByMessage: Record<string, string | null>;
    renderers: MessageListRenderers;
    showAvatars: boolean;
}) {
    const { deleting: isDeleting, editing: isEditing, updating: isUpdating } = pending;
    const isPendingThis = localReactionPending?.startsWith(message.id) || reactionPendingByMessage[message.id];
    return (<div data-message-id={message.id} data-thread-root-id={message.threadRootId ?? message.id} className={cn('group relative flex max-w-full items-start gap-3 overflow-hidden px-6 py-2.5', listRowEnterAnimationClass, chromaticTransitionClass, !message.deleted && 'hover:bg-muted/5', highlighted && 'rounded-lg bg-accent/10 ring-1 ring-primary/30')}>
      {showAvatars ? (<div className="shrink-0 pt-1">
          <Avatar className="size-8">
            <AvatarFallback className="bg-muted text-xs">{getInitials(message.senderName)}</AvatarFallback>
          </Avatar>
        </div>) : null}

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{message.senderName}</span>
          {message.senderRole ? <span className="text-xs text-muted-foreground">({message.senderRole})</span> : null}
          <span className="text-xs text-muted-foreground">{formatTime(message.createdAtMs)}</span>
          {message.edited && !message.deleted ? <span className="text-xs text-muted-foreground">(edited)</span> : null}
        </div>

        {isEditing && renderers.renderEditForm ? (renderers.renderEditForm(message)) : message.deleted ? (renderers.renderDeletedInfo ? renderers.renderDeletedInfo(message) : <p className="text-sm italic text-muted-foreground">Message removed</p>) : (<>
            {renderers.renderMessageContent ? (<MessageContentBody message={message} Content={renderers.renderMessageContent}/>) : (<p className={cn(CHAT_MESSAGE_BODY_CLASS, 'whitespace-pre-wrap text-sm')}>{message.content}</p>)}
            {renderers.renderMessageAttachments?.(message)}
          </>)}

        {!isEditing && !message.deleted ? (<MessageReactionRow currentUserId={currentUserId} disabled={Boolean(isPendingThis) || isDeleting || isUpdating} localReactionPending={localReactionPending} message={message} onReact={onReact} reactionPendingByMessage={reactionPendingByMessage}/>) : null}

        {renderers.renderMessageExtras?.(message)}
        {!isEditing && !message.deleted ? renderers.renderThreadSection?.(message) : null}
        {renderers.renderMessageFooter?.(message)}
      </div>

      {!isEditing && !message.deleted ? (<MessageReactionPickerActions actions={renderers.renderMessageActions?.(message)} disabled={isDeleting || isUpdating} message={message} onReact={onReact}/>) : null}

      {isDeleting ? (<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
          <LoaderCircle className="size-4 animate-spin text-muted-foreground"/>
        </div>) : null}
    </div>);
}
export function DirectMessageCard({ currentUserId, isDeleting, isEditing, localReactionPending, message, onReact, reactionPendingByMessage, renderers, showAvatars, }: {
    currentUserId: string | null;
    isDeleting: boolean;
    isEditing: boolean;
    localReactionPending: string | null;
    message: UnifiedMessage;
    onReact: (messageId: string, emoji: string) => void;
    reactionPendingByMessage: Record<string, string | null>;
    renderers: MessageListRenderers;
    showAvatars: boolean;
}) {
    const isOwn = message.senderId === currentUserId;
    const isPendingThis = localReactionPending?.startsWith(message.id) || reactionPendingByMessage[message.id];
    return (<div data-message-id={message.id} data-thread-root-id={message.threadRootId ?? message.id} className={cn('group relative flex max-w-full gap-2 overflow-hidden', listRowEnterAnimationClass, isOwn && 'justify-end')}>
      {showAvatars && !isOwn ? (<Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-muted text-xs">{getInitials(message.senderName)}</AvatarFallback>
        </Avatar>) : null}

      <div className={cn('flex min-w-0 max-w-[min(70%,100%)] flex-col', isOwn && 'items-end')}>
        <div className={cn('max-w-full min-w-0 overflow-hidden rounded-lg px-3 py-2', chromaticTransitionClass, message.deleted
            ? 'border border-dashed border-muted/60 bg-background/70 text-muted-foreground'
            : isOwn
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted shadow-sm')}>
          {isEditing && renderers.renderEditForm ? (renderers.renderEditForm(message)) : message.deleted ? (renderers.renderDeletedInfo ? renderers.renderDeletedInfo(message) : <p className="text-sm italic text-muted-foreground">Message removed</p>) : renderers.renderMessageContent ? (<MessageContentBody message={message} Content={renderers.renderMessageContent}/>) : (<p className={cn(CHAT_MESSAGE_BODY_CLASS, 'whitespace-pre-wrap text-sm')}>{message.content}</p>)}
        </div>

        <div className={cn('mt-1 flex items-center gap-1', isOwn && 'justify-end')}>
          <span className="text-[10px] text-muted-foreground">{formatTime(message.createdAtMs)}</span>
          {message.edited && !message.deleted ? <span className="text-[10px] text-muted-foreground">(edited)</span> : null}
        </div>

        {!isEditing && !message.deleted ? renderers.renderMessageAttachments?.(message) : null}

        {!isEditing && !message.deleted && message.reactions && message.reactions.length > 0 ? (<div className={cn('mt-1 flex flex-wrap gap-1', isOwn && 'justify-end')}>
            <MessageReactionRow currentUserId={currentUserId} disabled={Boolean(isPendingThis)} localReactionPending={localReactionPending} message={message} onReact={onReact} reactionPendingByMessage={reactionPendingByMessage}/>
          </div>) : null}

        {renderers.renderMessageExtras?.(message)}
        {renderers.renderMessageFooter?.(message)}

        {!isEditing && !message.deleted ? (<div className={cn('mt-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100', isOwn && 'justify-end')}>
            <MessageReactionPickerActions actions={renderers.renderMessageActions?.(message)} align="start" message={message} onReact={onReact}/>
          </div>) : null}
      </div>

      {showAvatars && isOwn ? (<Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">{getInitials(message.senderName)}</AvatarFallback>
        </Avatar>) : null}

      {isDeleting ? (<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
          <LoaderCircle className="size-4 animate-spin text-muted-foreground"/>
        </div>) : null}
    </div>);
}
