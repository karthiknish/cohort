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

const CATEGORY_ACCENT: Record<string, string> = {
  tasks: 'border-l-primary bg-primary/[0.04]',
  collaboration: 'border-l-info bg-info/[0.05]',
  ads: 'border-l-warning bg-warning/[0.06]',
  digest: 'border-l-muted-foreground bg-muted/20',
  projects: 'border-l-primary/70 bg-primary/[0.03]',
  meetings: 'border-l-info/80 bg-info/[0.04]',
}

const CATEGORY_BADGE: Record<string, string> = {
  tasks: 'border-primary/20 bg-primary/10 text-primary',
  collaboration: 'border-info/25 bg-info/10 text-info',
  ads: 'border-warning/30 bg-warning/10 text-warning-foreground',
  digest: 'border-border bg-muted text-muted-foreground',
  projects: 'border-primary/15 bg-primary/8 text-primary',
  meetings: 'border-info/20 bg-info/10 text-info',
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
  const accentClass = CATEGORY_ACCENT[category] ?? 'border-l-border bg-muted/15'
  const badgeClass = CATEGORY_BADGE[category] ?? 'border-border bg-muted text-muted-foreground'

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
        'group relative flex w-full cursor-pointer gap-3 border-b border-border/50 border-l-[3px] text-left transition-[background-color,box-shadow]',
        accentClass,
        compact ? 'px-3.5 py-3' : 'rounded-lg border px-4 py-4',
        !notification.read && 'shadow-sm',
        selected && 'ring-2 ring-primary/25 ring-inset',
        'hover:bg-muted/35',
      )}
    >
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

      <Avatar className={cn('shrink-0 ring-1 ring-border/40', compact ? 'h-9 w-9' : 'h-10 w-10')}>
        <AvatarFallback className="bg-muted/40 text-xs font-semibold">
          {getInitials(notification.actor.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-start gap-1.5 pr-14">
          <p className={cn('font-medium leading-snug text-foreground', compact ? 'text-sm' : 'text-[15px]')}>
            {notification.title}
          </p>
          <Badge
            variant="outline"
            className={cn('h-5 shrink-0 px-1.5 text-[10px] font-semibold uppercase tracking-wide', badgeClass)}
          >
            {chipLabel}
          </Badge>
        </div>
        <p className={cn('line-clamp-2 leading-relaxed text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
          {notification.body}
        </p>
        <p className="text-[11px] tabular-nums text-muted-foreground/80">
          {formatNotificationTimestamp(notification.createdAt)}
          {notification.actor.name ? ` · ${notification.actor.name}` : ''}
        </p>
      </div>

      <div className="absolute right-2 top-2 flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {!notification.read && onMarkRead ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md bg-background/80 shadow-sm"
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
            className="h-7 w-7 rounded-md bg-background/80 text-muted-foreground shadow-sm hover:text-destructive"
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
