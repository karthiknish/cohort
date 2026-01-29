'use client'

import { format } from 'date-fns'
import Link from 'next/link'
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pin,
  PinOff,
  Check,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ACTIVITY_ICONS, ACTIVITY_COLORS, REACTION_EMOJIS } from '../constants'
import { ACTIVITY_LABELS } from '../types'
import type { EnhancedActivity } from '../types'
import { ActivityComments } from './activity-comments'

interface ActivityComment {
  id: string
  userId: string
  userName: string
  text: string
  timestamp: string
}

interface ActivityItemProps {
  activity: EnhancedActivity
  isSelected: boolean
  showReactions: string | null
  comments: ActivityComment[]
  onSelectionChange: (id: string, checked: boolean) => void
  onClick: (activity: EnhancedActivity, e: React.MouseEvent) => void
  onTogglePin: (id: string) => void
  onMarkAsRead: (id: string) => void
  onAddReaction: (id: string, emoji: string) => void
  onAddComment: (activityId: string, text: string) => void
  onShowReactionsChange: (id: string | null) => void
  onViewDetails: (activity: EnhancedActivity) => void
  currentUserName?: string
}

export function ActivityItem({
  activity,
  isSelected,
  showReactions,
  comments,
  onSelectionChange,
  onClick,
  onTogglePin,
  onMarkAsRead,
  onAddReaction,
  onAddComment,
  onShowReactionsChange,
  onViewDetails,
  currentUserName,
}: ActivityItemProps) {
  const Icon = ACTIVITY_ICONS[activity.type]
  const colorClass = ACTIVITY_COLORS[activity.type]

  return (
    <div className={cn('relative group', !activity.isRead && 'bg-muted/20/50')}>
      {/* Selection checkbox with larger touch target */}
      <div className="absolute left-[-32px] sm:left-[-34px] top-3 sm:top-4">
        <div className="sm:hidden p-2 -m-2 cursor-pointer" onClick={() => onSelectionChange(activity.id, !isSelected)}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              onSelectionChange(activity.id, checked as boolean)
            }
            aria-label={`Select ${activity.description}`}
          />
        </div>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) =>
            onSelectionChange(activity.id, checked as boolean)
          }
          aria-label={`Select ${activity.description}`}
          className="hidden sm:block"
        />
      </div>

      {/* Pinned indicator */}
      {activity.isPinned && (
        <div className="absolute left-[-52px] sm:left-[-58px] top-4 text-amber-500">
          <Pin className="h-4 w-4" />
        </div>
      )}

      {/* Activity icon */}
      <div
        className={`absolute -left-[26px] sm:left-[-31px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-background ${colorClass}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Activity content */}
      <div
        onClick={(e) => onClick(activity, e)}
        className={cn(
          'flex flex-col gap-1 rounded-lg border p-3 transition-colors cursor-pointer',
          activity.isRead
            ? 'border-transparent bg-transparent hover:bg-muted/50 hover:border-muted'
            : 'border-primary/20 bg-primary/5/30 hover:bg-primary/10',
          isSelected && 'ring-2 ring-primary ring-offset-2'
        )}
      >
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                {ACTIVITY_LABELS[activity.type]}
              </Badge>
              {!activity.isRead && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5">
                  New
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {format(new Date(activity.timestamp), 'h:mm a')}
              </span>
            </div>
            <p className="text-sm font-medium leading-none">
              {activity.description}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {activity.entityName}
            </p>

            {/* Reactions */}
            {activity.reactions && activity.reactions.length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {activity.reactions.map((reaction, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddReaction(activity.id, reaction.emoji)
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted hover:bg-muted-70 text-xs"
                  >
                    <span>{reaction.emoji}</span>
                    <span className="text-muted-foreground">{reaction.count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Comments count */}
            {(!activity.comments || activity.comments === 0) && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                0
              </div>
            )}

            {/* Comments section */}
            <ActivityComments
              activity={activity}
              comments={comments}
              onAddComment={onAddComment}
              currentUserName={currentUserName}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Reactions picker */}
            <DropdownMenu
              open={showReactions === activity.id}
              onOpenChange={(open) =>
                onShowReactionsChange(open ? activity.id : null)
              }
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 sm:h-7 sm:w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top">
                {REACTION_EMOJIS.map((emoji) => (
                  <DropdownMenuItem
                    key={emoji}
                    onClick={() => {
                      onAddReaction(activity.id, emoji)
                      onShowReactionsChange(null)
                    }}
                  >
                    {emoji} Add reaction
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Pin/Unpin */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-7 sm:w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onTogglePin(activity.id)
              }}
              title={activity.isPinned ? 'Unpin activity' : 'Pin activity'}
            >
              {activity.isPinned ? (
                <PinOff className="h-4 w-4 text-amber-500" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
            </Button>

            {/* Mark as read/unread */}
            {!activity.isRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-7 sm:w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkAsRead(activity.id)
                }}
                title="Mark as read"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}

            {/* More options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 sm:h-7 sm:w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onTogglePin(activity.id)
                  }}
                >
                  {activity.isPinned ? (
                    <>
                      <PinOff className="h-4 w-4 mr-2" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4 mr-2" />
                      Pin
                    </>
                  )}
                </DropdownMenuItem>
                {!activity.isRead && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onMarkAsRead(activity.id)
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark as read
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onViewDetails(activity)}>
                  View details
                </DropdownMenuItem>
                {activity.navigationUrl && (
                  <DropdownMenuItem asChild>
                    <Link href={activity.navigationUrl}>
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Go to {activity.entityName}
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
