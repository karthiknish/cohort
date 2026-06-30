'use client';
import { useCallback } from 'react';
import type { MouseEvent } from 'react';
import { format } from 'date-fns';
import { Link } from '@/shared/ui/link';
import { Heart, MessageCircle, MoreHorizontal, Pin, PinOff, Check, ArrowUpRight, } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/shared/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ACTIVITY_ICONS, ACTIVITY_COLORS, REACTION_EMOJIS } from '../constants';
import { ACTIVITY_LABELS } from '../types';
import type { EnhancedActivity } from '../types';
import { ActivityComments } from './activity-comments';
interface ActivityComment {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: string;
}
interface ActivityItemProps {
    activity: EnhancedActivity;
    isSelected: boolean;
    showReactions: string | null;
    comments: ActivityComment[];
    onSelectionChange: (id: string, checked: boolean) => void;
    onTogglePin: (id: string) => void;
    onMarkAsRead: (id: string) => void;
    onAddReaction: (id: string, emoji: string) => void;
    onAddComment: (activityId: string, text: string) => void;
    onShowReactionsChange: (id: string | null) => void;
    onViewDetails: (activity: EnhancedActivity) => void;
    currentUserName?: string;
}
export function ActivityItem({ activity, isSelected, showReactions, comments, onSelectionChange, onTogglePin, onMarkAsRead, onAddReaction, onAddComment, onShowReactionsChange, onViewDetails, currentUserName, }: ActivityItemProps) {
    const Icon = ACTIVITY_ICONS[activity.type];
    const colorClass = ACTIVITY_COLORS[activity.type];
    const mobileCheckboxId = `activity-select-mobile-${activity.id}`;
    const desktopCheckboxId = `activity-select-desktop-${activity.id}`;
    const handleSelectionChange = (checked: boolean | 'indeterminate') => onSelectionChange(activity.id, checked === true);
    const handleViewDetails = () => onViewDetails(activity);
    const handleAddReaction = (emoji: string) => onAddReaction(activity.id, emoji);
    const handleReactionMenuOpenChange = (open: boolean) => onShowReactionsChange(open ? activity.id : null);
    const handleStopPropagation = (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
    };
    const handleTogglePin = () => onTogglePin(activity.id);
    const handleMarkAsRead = () => onMarkAsRead(activity.id);
    const createReactionButtonClickHandler = (emoji: string) => (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        handleAddReaction(emoji);
        onShowReactionsChange(null);
    };
    const createReactionMenuItemClickHandler = (emoji: string) => () => {
        handleAddReaction(emoji);
        onShowReactionsChange(null);
    };
    const createTogglePinClickHandler = () => (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        handleTogglePin();
    };
    const createMarkAsReadClickHandler = () => (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        handleMarkAsRead();
    };
    return (<div className={cn('cv-scroll-item-activity relative group', !activity.isRead && 'bg-muted/30')}>
      {/* Selection checkbox with larger touch target */}
      <div className="absolute left-[-32px] sm:left-[-34px] top-3 sm:top-4">
        <label htmlFor={mobileCheckboxId} className="sm:hidden block p-2 -m-2 cursor-pointer">
          <Checkbox id={mobileCheckboxId} checked={isSelected} onCheckedChange={handleSelectionChange} aria-label={`Select ${activity.description}`}/>
        </label>
        <Checkbox id={desktopCheckboxId} checked={isSelected} onCheckedChange={handleSelectionChange} aria-label={`Select ${activity.description}`} className="hidden sm:block"/>
      </div>

      {/* Pinned indicator */}
      {activity.isPinned && (<div className="absolute left-[-52px] sm:left-[-58px] top-4 text-warning">
          <Pin className="size-4"/>
        </div>)}

      {/* Activity icon */}
      <div className={`absolute -left-[26px] sm:left-[-31px] flex size-8 items-center justify-center rounded-full border-2 border-background ${colorClass}`}>
        <Icon className="size-4"/>
      </div>

      {/* Activity content */}
      <div className={cn('flex flex-col gap-1 rounded-lg border p-3 transition-colors', activity.isRead
            ? 'border-transparent bg-transparent hover:bg-muted/50 hover:border-muted'
            : 'border-accent/20 bg-accent/5 hover:bg-accent/10', isSelected && 'ring-2 ring-primary ring-offset-2')}>
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <button type="button" onClick={handleViewDetails} className="block min-w-0 rounded-md text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2" aria-label={`Open activity ${activity.description}`}>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[10px]">
                  {ACTIVITY_LABELS[activity.type]}
                </Badge>
                {!activity.isRead && (<Badge variant="default" className="h-5 px-1.5 py-0 text-[10px]">
                    New
                  </Badge>)}
                <span className="text-xs text-muted-foreground">
                  <time dateTime={activity.timestamp} suppressHydrationWarning>
                    {format(new Date(activity.timestamp), 'h:mm a')}
                  </time>
                </span>
              </div>
              <p className="mt-1 text-sm font-medium leading-none hover:text-primary">
                {activity.description}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {activity.entityName}
              </p>
            </button>

            {/* Reactions */}
            {activity.reactions && activity.reactions.length > 0 && (<div className="flex items-center gap-1 mt-1">
                {activity.reactions.map((reaction) => (<button key={`${reaction.emoji}-${reaction.count}`} type="button" onClick={createReactionButtonClickHandler(reaction.emoji)} className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted hover:bg-muted/70 text-xs">
                    <span>{reaction.emoji}</span>
                    <span className="text-muted-foreground">{reaction.count}</span>
                  </button>))}
              </div>)}

            {/* Comments count */}
            {typeof activity.comments === 'number' && activity.comments > 0 && (<div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MessageCircle aria-hidden="true" className="size-3"/>
                <span>{activity.comments} comment{activity.comments !== 1 ? 's' : ''}</span>
              </div>)}

            {/* Comments section */}
            <ActivityComments activity={activity} comments={comments} onAddComment={onAddComment} currentUserName={currentUserName}/>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Reactions picker */}
            <DropdownMenu open={showReactions === activity.id} onOpenChange={handleReactionMenuOpenChange}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9 sm:h-7 sm:w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleStopPropagation} aria-label="Add reaction">
                  <Heart className="size-4"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top">
                {REACTION_EMOJIS.map((emoji) => (<DropdownMenuItem key={emoji} onClick={createReactionMenuItemClickHandler(emoji)}>
                    {emoji} Add reaction
                  </DropdownMenuItem>))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Pin/Unpin */}
            <Button variant="ghost" size="icon" className="size-9 sm:h-7 sm:w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={createTogglePinClickHandler()} aria-label={activity.isPinned ? 'Unpin activity' : 'Pin activity'}>
              {activity.isPinned ? (<PinOff aria-hidden="true" className="size-4 text-warning"/>) : (<Pin aria-hidden="true" className="size-4"/>)}
            </Button>

            {/* Mark as read/unread */}
            {!activity.isRead && (<Button variant="ghost" size="icon" className="size-9 sm:h-7 sm:w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={createMarkAsReadClickHandler()} aria-label="Mark as read">
                <Check aria-hidden="true" className="size-4"/>
              </Button>)}

            {/* More options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9 sm:h-7 sm:w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleStopPropagation} aria-label="More activity actions">
                  <MoreHorizontal className="size-4"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={createTogglePinClickHandler()}>
                  {activity.isPinned ? (<>
                      <PinOff className="size-4 mr-2"/>
                      Unpin
                    </>) : (<>
                      <Pin className="size-4 mr-2"/>
                      Pin
                    </>)}
                </DropdownMenuItem>
                {!activity.isRead && (<DropdownMenuItem onClick={createMarkAsReadClickHandler()}>
                    <Check className="size-4 mr-2"/>
                    Mark as read
                  </DropdownMenuItem>)}
                <DropdownMenuItem onClick={handleViewDetails}>
                  View details
                </DropdownMenuItem>
                {activity.navigationUrl && (<DropdownMenuItem asChild>
                    <Link href={activity.navigationUrl}>
                      <ArrowUpRight className="size-4 mr-2"/>
                      Go to {activity.entityName}
                    </Link>
                  </DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>);
}
