'use client'

import { useCallback } from 'react'
import { Check, Trash2 } from 'lucide-react'

import { kindToCategory } from '@/lib/notifications/preferences'
import type { WorkspaceNotification } from '@/types/notifications'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

import { formatNotificationTimestamp } from '../lib/group-notifications'

const CATEGORY_CHIP_LABEL: Record<string, string> = {
  tasks: 'Task',
  collaboration: 'Chat',
  ads: 'Ads',
  digest: 'Digest',
  projects: 'Project',
  meetings: 'Meeting',
}

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/).filter((part) => part.length > 0)
  if (parts.length === 0) return '?'
  if (parts.length === 1) {
    const single = parts[0] ?? ''
    return single.slice(0, 2).toUpperCase()
  }
  const first = parts[0] ?? ''
  const second = parts[1] ?? ''
  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase()
}

type NotificationItemProps = {
  notification: WorkspaceNotification
  compact?: boolean
  selected?: boolean
  ackInFlight?: boolean
  onOpen?: (notification: WorkspaceNotification) => void
  onDismiss?: (id: string, title?: string) => void
  onMarkRead?: (id: string, title?: string) => void
  onSelectToggle?: (id: string) => void
}

export function NotificationItem({
  notification,
  compact = false,
  selected = false,
  ackInFlight = false,
  onOpen,
  onDismiss,
  onMarkRead,
  onSelectToggle,
}: NotificationItemProps) {
  const category = kindToCategory(notification.kind)
  const chipLabel = CATEGORY_CHIP_LABEL[category] ?? 'Update'

  const handleClick = useCallback(() => {
    onOpen?.(notification)
  }, [notification, onOpen])

  const handleDismiss = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      onDismiss?.(notification.id, notification.title)
    },
    [notification.id, notification.title, onDismiss],
  )

  const handleMarkRead = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      onMarkRead?.(notification.id, notification.title)
    },
    [notification.id, notification.title, onMarkRead],
  )

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleClick()
        }
      }}
      className={cn(
        'group relative flex w-full cursor-pointer gap-3 border-b border-border/50 text-left transition-colors hover:bg-muted/40',
        compact ? 'px-4 py-3' : 'rounded-lg border px-4 py-4',
        !notification.read && 'bg-muted/25',
        selected && 'ring-2 ring-primary/30',
      )}
    >
      {!notification.read ? (
        <span
          className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary"
          aria-hidden
        />
      ) : null}

      {onSelectToggle ? (
        <input
          type="checkbox"
          checked={selected}
          className="mt-1 h-4 w-4 shrink-0 accent-primary"
          onChange={() => onSelectToggle(notification.id)}
          onClick={(event) => event.stopPropagation()}
          aria-label={`Select ${notification.title}`}
        />
      ) : null}

      <Avatar className={cn('shrink-0', compact ? 'h-9 w-9' : 'h-10 w-10')}>
        <AvatarFallback className="text-xs font-medium">
          {getInitials(notification.actor.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn('font-medium text-foreground', compact ? 'text-sm' : 'text-[15px]')}>
            {notification.title}
          </p>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium uppercase tracking-wide">
            {chipLabel}
          </Badge>
        </div>
        <p className={cn('line-clamp-2 text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
          {notification.body}
        </p>
        <p className="text-[11px] text-muted-foreground/80">
          {formatNotificationTimestamp(notification.createdAt)}
          {notification.actor.name ? ` · ${notification.actor.name}` : ''}
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {!notification.read && onMarkRead ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={ackInFlight}
            onClick={handleMarkRead}
            aria-label="Mark as read"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        ) : null}
        {onDismiss ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            disabled={ackInFlight}
            onClick={handleDismiss}
            aria-label="Dismiss notification"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>
    </article>
  )
}
