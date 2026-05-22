'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useConvexAuth, useQuery } from 'convex/react'
import { Bell, Circle } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { notificationsApi } from '@/lib/convex-api'
import { getPreviewNotifications } from '@/lib/preview-data'
import { cn, getWorkspaceId } from '@/lib/utils'
import type { WorkspaceNotification } from '@/types/notifications'

import { NOTIFICATIONS_FOR_YOU_PAGE_SIZE } from '@/lib/notifications/pagination'

function sortNotifications(items: WorkspaceNotification[]): WorkspaceNotification[] {
  return items.toSorted((a, b) => {
    if (a.read !== b.read) {
      return a.read ? 1 : -1
    }
    const aMs = a.createdAt ? Date.parse(a.createdAt) : 0
    const bMs = b.createdAt ? Date.parse(b.createdAt) : 0
    return bMs - aMs
  })
}

function NotificationRow({ notification }: { notification: WorkspaceNotification }) {
  const href = notification.navigationUrl ?? '/dashboard/notifications'
  const createdLabel = notification.createdAt
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : ''

  return (
    <li>
      <Link
        href={href}
        className="group flex gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50"
      >
        <div className="relative mt-1 flex size-2 shrink-0 items-center justify-center">
          {!notification.read ? (
            <Circle className="size-2 fill-primary text-primary" aria-label="Unread" />
          ) : (
            <span className="size-1.5 rounded-full bg-border" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm leading-snug', !notification.read ? 'font-semibold text-foreground' : 'text-foreground')}>
            {notification.title}
          </p>
          {notification.body ? (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{notification.body}</p>
          ) : null}
          <p className="mt-1.5 text-[11px] text-muted-foreground/90">
            {notification.actor.name ? `${notification.actor.name} · ` : ''}
            {createdLabel}
          </p>
        </div>
      </Link>
    </li>
  )
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-2">
      {['n1', 'n2', 'n3', 'n4', 'n5'].map((key) => (
        <div key={key} className="flex gap-3 p-2">
          <Skeleton className="size-2 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="size-4/5" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ForYouNotifications() {
  const { user } = useAuth()
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth()
  const { isPreviewMode } = usePreview()
  const workspaceId = getWorkspaceId(user)
  const canQuery = isAuthenticated && !isConvexLoading && !!workspaceId && !!user?.id

  const livePage = useQuery(
    notificationsApi.list,
    canQuery && !isPreviewMode
      ? {
          workspaceId,
          pageSize: NOTIFICATIONS_FOR_YOU_PAGE_SIZE,
          role: user?.role ?? undefined,
        }
      : 'skip',
  ) as { notifications?: WorkspaceNotification[] } | undefined

  const notifications = useMemo(() => {
    const items = isPreviewMode
      ? getPreviewNotifications(null)
      : (livePage?.notifications ?? [])

    return sortNotifications(items).slice(0, NOTIFICATIONS_FOR_YOU_PAGE_SIZE)
  }, [isPreviewMode, livePage?.notifications])

  const unreadCount = notifications.filter((n) => !n.read).length
  const isLoading = !isPreviewMode && livePage === undefined

  if (isLoading) {
    return <NotificationsSkeleton />
  }

  return (
    <section aria-labelledby="for-you-notifications-heading" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="for-you-notifications-heading" className="text-lg font-semibold tracking-tight text-foreground">
              Recent updates
            </h2>
            {unreadCount > 0 ? (
              <Badge variant="default" className="h-5 rounded-full px-2 text-[10px]">
                {unreadCount} new
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Mentions, assignments, and activity across your workspace.</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="shrink-0 text-xs">
          <Link href="/dashboard/notifications">View all</Link>
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 px-4 py-10 text-center">
          <Bell className="mb-2 size-6 text-muted-foreground/50" aria-hidden />
          <p className="text-sm text-muted-foreground">No recent updates. You&apos;re all caught up.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border/50 rounded-lg border border-border/60 bg-card">
          {notifications.map((notification) => (
            <NotificationRow key={notification.id} notification={notification} />
          ))}
        </ul>
      )}
    </section>
  )
}
