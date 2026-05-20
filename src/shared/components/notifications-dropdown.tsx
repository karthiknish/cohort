'use client'

import { useCallback, useEffect, useEffectEvent, useMemo, useState } from 'react'
import { Bell, Check, ExternalLink, LoaderCircle, Settings2 } from 'lucide-react'
import Link from 'next/link'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useMutation, useQuery as useConvexQuery, useConvex } from 'convex/react'

import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import type { WorkspaceNotification } from '@/types/notifications'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ScrollArea } from '@/shared/ui/scroll-area'

import { notificationsApi } from '@/lib/convex-api'
import { parsePageSize } from '@/lib/pagination'
import { useToast } from '@/shared/ui/use-toast'
import { NotificationEmptyState } from '@/features/notifications/components/notification-empty-state'
import { NotificationGroupList } from '@/features/notifications/components/notification-group'
import { groupNotificationsByDate } from '@/features/notifications/lib/group-notifications'
import { useNotificationNavigation } from '@/features/notifications/hooks/use-notification-navigation'

const PAGE_SIZE = 20

type NotificationsCursor = {
  createdAtMs: number
  legacyId: string
  scanCursor?: string | null
  overflowLegacyIds?: string[]
}

type AckAction = 'read' | 'dismiss'

type AckOptions = {
  silent?: boolean
}

export function NotificationsDropdown() {
  const { user } = useAuth()
  const { selectedClientId } = useClientContext()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [ackInFlight, setAckInFlight] = useState(false)

  const workspaceId = user?.agencyId
  const convex = useConvex()
  const handleOpenNotification = useNotificationNavigation(() => setOpen(false))

  const unreadCountQuery = useConvexQuery(
    notificationsApi.getUnreadCount,
    workspaceId
      ? {
          workspaceId,
          role: user?.role ?? undefined,
          clientId: user?.role === 'client' ? selectedClientId ?? undefined : undefined,
        }
      : 'skip',
  ) as { unreadCount: number } | undefined

  const notificationsInfiniteQuery = useInfiniteQuery({
    queryKey: ['notifications', workspaceId, user?.role, selectedClientId],
    enabled: Boolean(open && workspaceId),
    initialPageParam: null as NotificationsCursor | null,
    queryFn: async ({ pageParam }) => {
      if (!workspaceId) {
        return { notifications: [], nextCursor: null } as {
          notifications: WorkspaceNotification[]
          nextCursor: NotificationsCursor | null
        }
      }

      return (await convex.query(notificationsApi.list, {
        workspaceId,
        pageSize: parsePageSize(PAGE_SIZE, { defaultValue: PAGE_SIZE, max: 100 }),
        role: user?.role ?? undefined,
        clientId: user?.role === 'client' ? selectedClientId ?? undefined : undefined,
        afterCreatedAtMs: pageParam?.createdAtMs,
        afterLegacyId: pageParam?.legacyId,
        scanCursor: pageParam?.scanCursor ?? undefined,
        overflowLegacyIds: pageParam?.overflowLegacyIds,
      })) as { notifications: WorkspaceNotification[]; nextCursor: NotificationsCursor | null }
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
  })

  const notifications = useMemo(
    () => notificationsInfiniteQuery.data?.pages.flatMap((page) => page.notifications ?? []) ?? [],
    [notificationsInfiniteQuery.data?.pages],
  )

  const groupedNotifications = useMemo(
    () => groupNotificationsByDate(notifications),
    [notifications],
  )

  const unreadCount = unreadCountQuery?.unreadCount ?? notifications.filter((item) => !item.read).length

  const ackNotifications = useMutation(notificationsApi.ack)

  const updateNotificationStatus = useCallback(
    (ids: string[], action: AckAction, options: AckOptions = {}) => {
      if (!workspaceId || ids.length === 0) {
        return Promise.resolve()
      }

      setAckInFlight(true)

      return ackNotifications({
        workspaceId,
        ids,
        action,
        ...(user?.role === 'client' && selectedClientId ? { clientId: selectedClientId } : {}),
      })
        .then(() => notificationsInfiniteQuery.refetch())
        .then(() => {
          if (!options.silent) {
            toast({ title: action === 'dismiss' ? 'Dismissed' : 'Marked as read' })
          }
        })
        .catch((error) => {
          const message = error instanceof Error ? error.message : 'Notification update failed'
          toast({ title: 'Update failed', description: message, variant: 'destructive' })
        })
        .finally(() => {
          setAckInFlight(false)
        })
    },
    [ackNotifications, notificationsInfiniteQuery, selectedClientId, toast, user?.role, workspaceId],
  )

  const handleOpenChange = useCallback(
    (value: boolean) => {
      setOpen(value)
      if (value) {
        void notificationsInfiniteQuery.refetch()
      }
    },
    [notificationsInfiniteQuery],
  )

  const markUnreadNotificationsRead = useEffectEvent((ids: string[]) => {
    void updateNotificationStatus(ids, 'read', { silent: true })
  })

  useEffect(() => {
    if (!open || ackInFlight) return

    const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id)
    if (unreadIds.length === 0) return

    const frame = requestAnimationFrame(() => {
      markUnreadNotificationsRead(unreadIds)
    })

    return () => cancelAnimationFrame(frame)
  }, [ackInFlight, notifications, open])

  const handleDismiss = useCallback(
    (id: string) => {
      void updateNotificationStatus([id], 'dismiss')
    },
    [updateNotificationStatus],
  )

  const handleMarkAllRead = useCallback(() => {
    const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id)
    if (unreadIds.length === 0) return
    void updateNotificationStatus(unreadIds, 'read')
  }, [notifications, updateNotificationStatus])

  const handleLoadMore = useCallback(() => {
    if (!notificationsInfiniteQuery.hasNextPage || notificationsInfiniteQuery.isFetchingNextPage) {
      return
    }
    void notificationsInfiniteQuery.fetchNextPage()
  }, [notificationsInfiniteQuery])

  const triggerDisabled = !user
  const isLoadingInitial = notificationsInfiniteQuery.isLoading && notifications.length === 0

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          disabled={triggerDisabled}
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-0" sideOffset={8}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border/60 bg-popover px-4 py-3">
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
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || ackInFlight}
          >
            <Check className="mr-1 h-3.5 w-3.5" aria-hidden />
            Mark all read
          </Button>
        </div>

        <ScrollArea className="max-h-[min(24rem,70vh)]">
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
              onOpen={handleOpenNotification}
              onDismiss={handleDismiss}
            />
          )}
        </ScrollArea>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={handleLoadMore}
            disabled={
              notificationsInfiniteQuery.isFetchingNextPage ||
              !notificationsInfiniteQuery.hasNextPage
            }
          >
            {notificationsInfiniteQuery.isFetchingNextPage ? (
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
