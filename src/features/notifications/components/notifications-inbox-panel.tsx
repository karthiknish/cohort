'use client'

import { Check, ExternalLink, LoaderCircle, Settings2 } from 'lucide-react'
import Link from 'next/link'

import type { WorkspaceNotification } from '@/types/notifications'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'

import { NotificationEmptyState } from '@/features/notifications/components/notification-empty-state'
import { NotificationGroupList } from '@/features/notifications/components/notification-group'
import type { GroupedNotifications } from '@/features/notifications/lib/group-notifications'

type NotificationsInboxPanelProps = {
  unreadCount: number
  ackInFlight: boolean
  isLoadingInitial: boolean
  notifications: WorkspaceNotification[]
  groupedNotifications: GroupedNotifications
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onMarkAllRead: () => void
  onLoadMore: () => void
  onOpen: (notification: WorkspaceNotification) => void
  onDismiss: (id: string) => void
  /** Tighter padding for dropdown; roomier for drawer. */
  variant?: 'dropdown' | 'drawer'
}

export function NotificationsInboxPanel({
  unreadCount,
  ackInFlight,
  isLoadingInitial,
  notifications,
  groupedNotifications,
  hasNextPage,
  isFetchingNextPage,
  onMarkAllRead,
  onLoadMore,
  onOpen,
  onDismiss,
  variant = 'dropdown',
}: NotificationsInboxPanelProps) {
  const scrollMaxHeight =
    variant === 'drawer' ? 'min(28rem,calc(85dvh - 10rem))' : 'min(24rem,70vh)'

  return (
    <>
      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-popover px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {unreadCount > 0 ? (
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          ) : (
            <p className="text-xs text-muted-foreground">You&apos;re caught up</p>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs"
          onClick={onMarkAllRead}
          disabled={unreadCount === 0 || ackInFlight}
        >
          <Check className="mr-1 h-3.5 w-3.5" aria-hidden />
          Mark all read
        </Button>
      </div>

      <ScrollArea style={{ maxHeight: scrollMaxHeight }}>
        {isLoadingInitial ? (
          <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            Loading…
          </div>
        ) : notifications.length === 0 ? (
          <NotificationEmptyState className="py-12" />
        ) : (
          <NotificationGroupList
            groups={groupedNotifications}
            compact
            ackInFlight={ackInFlight}
            onOpen={onOpen}
            onDismiss={onDismiss}
          />
        )}
      </ScrollArea>

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={onLoadMore}
          disabled={isFetchingNextPage || !hasNextPage}
        >
          {isFetchingNextPage ? (
            <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : null}
          Load more
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
            <Link href="/settings?tab=notifications">
              <Settings2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Settings
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
            <Link href="/dashboard/notifications">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              View all
            </Link>
          </Button>
        </div>
      </div>
    </>
  )
}
