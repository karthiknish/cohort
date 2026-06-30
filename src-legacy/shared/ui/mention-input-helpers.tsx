'use client';
import { useMemo } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { HoverPreview } from '@/shared/ui/hover-preview';
import type { MentionableUser } from './mention-input-types';
export function MentionUserNameTrigger({ name }: {
    name: string;
}) {
    return <span className="block truncate font-medium">{name}</span>;
}
export function MentionUserHoverPreview({ user }: {
    user: MentionableUser;
}) {
    const trigger = <MentionUserNameTrigger name={user.name}/>;
    return (<HoverPreview trigger={trigger} className="w-56">
      <div className="flex items-center gap-3">
        <Avatar className="size-9 shrink-0">
          {user.avatar ? <AvatarImage src={user.avatar} alt="" className="object-cover"/> : null}
          <AvatarFallback className="bg-muted">
            <User className="size-4 text-muted-foreground"/>
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 space-y-0.5">
          <p className="font-medium text-foreground">{user.name}</p>
          {user.email ? <p className="text-xs text-muted-foreground">{user.email}</p> : null}
          {user.role ? <p className="text-xs text-muted-foreground">{user.role}</p> : null}
        </div>
      </div>
    </HoverPreview>);
}
