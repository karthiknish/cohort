'use client'

import { useMemo } from 'react'
import { Bell, Check, ExternalLink, LoaderCircle, Settings2 } from 'lucide-react'
import Link from 'next/link'

import type { WorkspaceNotification } from '@/types/notifications'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { cn } from '@/lib/utils'
import { HEADER_DROPDOWN_THEME } from '@/shared/layout/header-dropdown-theme'
import { getIconContainerClasses } from '@/lib/dashboard-theme'

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
    variant === 'drawer' ? 'min(28rem,calc(85dvh - 11rem))' : 'min(22rem,68vh)'
  const scrollAreaStyle = useMemo(() => ({ maxHeight: scrollMaxHeight }), [scrollMaxHeight])

  return (
    <>
      <div className={HEADER_DROPDOWN_THEME.header}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className={cn(getIconContainerClasses('medium'), 'size-9 shrink-0')}>
              <Bell className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className={HEADER_DROPDOWN_THEME.headerTitle}>Notifications</p>
              <p className={HEADER_DROPDOWN_THEME.headerSubtitle}>
                {unreadCount > 0
                  ? `${unreadCount} unread · opens mark items read`
                  : "You're caught up"}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 shrink-0 gap-1 border-border/60 text-xs shadow-sm"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0 || ackInFlight}
          >
            <Check className="size-3.5" aria-hidden />
            Mark read
          </Button>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1" style={scrollAreaStyle}>
        <div className={HEADER_DROPDOWN_THEME.inboxBody}>
          {isLoadingInitial ? (
            <div className="flex items-center justify-center gap-2 px-3 py-12 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Loading…
            </div>
          ) : notifications.length === 0 ? (
            <NotificationEmptyState />
          ) : (
            <NotificationGroupList
              groups={groupedNotifications}
              compact
              ackInFlight={ackInFlight}
              onOpen={onOpen}
              onDismiss={onDismiss}
            />
          )}
        </div>
      </ScrollArea>

      <div className={HEADER_DROPDOWN_THEME.footer}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground hover:text-foreground"
          onClick={onLoadMore}
          disabled={isFetchingNextPage || !hasNextPage}
        >
          {isFetchingNextPage ? (
            <LoaderCircle className="mr-1.5 size-3.5 animate-spin" aria-hidden />
          ) : null}
          {hasNextPage ? 'Load more' : 'End of list'}
        </Button>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" asChild>
            <Link href="/settings?tab=notifications">
              <Settings2 className="size-3.5" aria-hidden />
              Settings
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" asChild>
            <Link href="/dashboard/notifications">
              <ExternalLink className="size-3.5" aria-hidden />
              View all
            </Link>
          </Button>
        </div>
      </div>
    </>
  )
}
