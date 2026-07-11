'use client';
import type { ComponentType, MouseEvent, ReactNode } from 'react';
import { useState } from 'react';
import { LoaderCircle, Smile } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Button } from '@/shared/ui/button';
import { chromaticTransitionClass } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { COLLABORATION_REACTIONS } from '@/constants/collaboration-reactions';
import { CHAT_MESSAGE_BODY_CLASS } from '../lib/chat-text';
import type { UnifiedMessage } from './message-list-types';

export function MessageReactionRow({ currentUserId, disabled, localReactionPending, message, onReact, reactionPendingByMessage, }: {
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

export function MessageReactionPickerActions({ actions, align = 'start', alwaysVisible, disabled, message, onReact, }: {
    actions?: ReactNode;
    align?: 'start' | 'end';
    alwaysVisible?: boolean;
    disabled?: boolean;
    message: UnifiedMessage;
    onReact: (messageId: string, emoji: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const handleEmojiClick = (emoji: string) => () => {
        setOpen(false);
        onReact(message.id, emoji);
    };
    return (<div className={cn('flex gap-1 transition-opacity shrink-0', alwaysVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100')}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="size-6" disabled={disabled} aria-label="Add reaction">
            <Smile className="size-3"/>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align={align}>
          <div className="flex gap-1">
            {COLLABORATION_REACTIONS.map((emoji) => (<Button key={emoji} type="button" variant="ghost" size="sm" className="size-8 text-base" disabled={disabled} aria-label={`React with ${emoji}`} onClick={handleEmojiClick(emoji)}>
                {emoji}
              </Button>))}
          </div>
        </PopoverContent>
      </Popover>

      {actions}
    </div>);
}

export function MessageContentBody({ message, Content, }: {
    message: UnifiedMessage;
    Content: ComponentType<{
        message: UnifiedMessage;
    }>;
}) {
    return (<div className={CHAT_MESSAGE_BODY_CLASS}>
      <Content message={message}/>
    </div>);
}
