'use client';
import { Hash } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { cn } from '@/lib/utils';
import type { Channel } from '../types';
import { getInitials } from '../utils';
type ChannelAvatarProps = {
    channel: Pick<Channel, 'name' | 'avatarUrl' | 'type'>;
    className?: string;
    fallbackClassName?: string;
};
export function ChannelAvatar({ channel, className, fallbackClassName }: ChannelAvatarProps) {
    return (<Avatar className={className}>
      {channel.avatarUrl ? (<AvatarImage src={channel.avatarUrl} alt={channel.name} className="object-cover"/>) : null}
      <AvatarFallback className={cn('bg-muted text-muted-foreground', fallbackClassName)}>
        <Hash className="size-4" aria-hidden/>
        <span className="sr-only">{getInitials(channel.name)}</span>
      </AvatarFallback>
    </Avatar>);
}
