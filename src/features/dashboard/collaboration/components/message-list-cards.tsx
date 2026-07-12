'use client';
import { LoaderCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { chromaticTransitionClass, listRowEnterAnimationClass, } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { CHAT_MESSAGE_BODY_CLASS } from '../lib/chat-text';
import type { MessageListRenderers } from './message-list-render-context';
import type { UnifiedMessage } from './message-list-types';
import { MessageContentBody, MessageReactionPickerActions, MessageReactionRow } from './message-list-reactions';
import { ClientFormattedDate } from '@/shared/components/client-formatted-date';

export type ChannelMessagePendingState = {
    deleting: boolean;
    editing: boolean;
    updating: boolean;
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

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
    return (<div data-message-id={message.id} data-thread-root-id={message.threadRootId ?? message.id} className={cn('group relative flex max-w-full items-start gap-3 overflow-hidden border-b border-muted/20 px-6 py-2.5', listRowEnterAnimationClass, chromaticTransitionClass, !message.deleted && 'hover:bg-muted/20', highlighted && 'rounded-lg bg-accent/10 ring-1 ring-primary/30')}>
      {showAvatars ? (<div className="shrink-0 pt-1">
          <Avatar className="size-8">
            <AvatarFallback className="bg-muted text-xs">{getInitials(message.senderName)}</AvatarFallback>
          </Avatar>
        </div>) : null}

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{message.senderName}</span>
          {message.senderRole ? <span className="text-xs text-muted-foreground">({message.senderRole})</span> : null}
          <ClientFormattedDate value={message.createdAtMs} formatStr="h:mm a" className="text-xs text-muted-foreground" fallback="" />
          {message.edited && !message.deleted ? <span className="text-xs text-muted-foreground">(edited)</span> : null}
        </div>

        {message.deleted ? (renderers.renderDeletedInfo ? renderers.renderDeletedInfo(message) : <p className="text-sm italic text-muted-foreground">Message removed</p>) : (<>
            {renderers.renderMessageContent ? (<MessageContentBody message={message} Content={renderers.renderMessageContent}/>) : (<p className={cn(CHAT_MESSAGE_BODY_CLASS, 'whitespace-pre-wrap text-sm')}>{message.content}</p>)}
            {renderers.renderMessageAttachments?.(message)}
          </>)}

        {!isEditing && !message.deleted ? (<MessageReactionRow currentUserId={currentUserId} disabled={Boolean(isPendingThis) || isDeleting || isUpdating} localReactionPending={localReactionPending} message={message} onReact={onReact} reactionPendingByMessage={reactionPendingByMessage}/>) : null}

        {renderers.renderMessageExtras?.(message)}
        {!isEditing && !message.deleted ? renderers.renderThreadSection?.(message) : null}
        {renderers.renderMessageFooter?.(message)}
      </div>

      {!isEditing && !message.deleted ? (<MessageReactionPickerActions actions={renderers.renderMessageActions?.(message)} disabled={isDeleting || isUpdating} message={message} onReact={onReact} alwaysVisible/>) : null}

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
        <div className={cn('max-w-full min-w-0 overflow-hidden rounded-lg border px-3 py-2', chromaticTransitionClass, message.deleted
            ? 'border-dashed border-muted/60 bg-background/70 text-muted-foreground'
            : isOwn
                ? 'border-primary/20 bg-primary text-primary-foreground shadow-sm'
                : 'border-muted/40 bg-muted shadow-sm')}>
          {message.deleted ? (renderers.renderDeletedInfo ? renderers.renderDeletedInfo(message) : <p className="text-sm italic text-muted-foreground">Message removed</p>) : (<>
            {renderers.renderMessageContent ? (<MessageContentBody message={message} Content={renderers.renderMessageContent}/>) : (<p className={cn(CHAT_MESSAGE_BODY_CLASS, 'whitespace-pre-wrap text-sm')}>{message.content}</p>)}
            {message.attachments && message.attachments.length > 0 ? (
              <div className="mt-2 border-t border-border/20 pt-2">
                {renderers.renderMessageAttachments?.(message)}
              </div>
            ) : null}
          </>)}
        </div>

        <div className={cn('mt-1 flex items-center gap-1', isOwn && 'justify-end')}>
          <ClientFormattedDate value={message.createdAtMs} formatStr="h:mm a" className="text-[10px] text-muted-foreground" fallback="" />
          {message.edited && !message.deleted ? <span className="text-[10px] text-muted-foreground">(edited)</span> : null}
        </div>

        {!isEditing && !message.deleted && message.reactions && message.reactions.length > 0 ? (<div className={cn('mt-1 flex flex-wrap gap-1', isOwn && 'justify-end')}>
            <MessageReactionRow currentUserId={currentUserId} disabled={Boolean(isPendingThis)} localReactionPending={localReactionPending} message={message} onReact={onReact} reactionPendingByMessage={reactionPendingByMessage}/>
          </div>) : null}

        {renderers.renderMessageExtras?.(message)}
        {renderers.renderMessageFooter?.(message)}

        {!isEditing && !message.deleted ? (<div className={cn('mt-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-sm:opacity-100', isOwn && 'justify-end')}>
            <MessageReactionPickerActions actions={renderers.renderMessageActions?.(message)} align={isOwn ? 'end' : 'start'} alwaysVisible message={message} onReact={onReact}/>
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
