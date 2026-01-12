'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Bell, Check, LoaderCircle, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useMutation, useQuery as useConvexQuery, useConvex } from 'convex/react'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import type { WorkspaceNotification } from '@/types/notifications'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

import { notificationsApi } from '@/lib/convex-api'
import { parsePageSize } from '@/lib/pagination'
import { useToast } from '@/components/ui/use-toast'

const PAGE_SIZE = 20

type NotificationsCursor = {
  createdAtMs: number
  legacyId: string
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

  const unreadCountQuery = useConvexQuery(
    notificationsApi.getUnreadCount,
    workspaceId
      ? {
          workspaceId,
          role: user?.role ?? undefined,
          clientId: user?.role === 'client' ? selectedClientId ?? undefined : undefined,
        }
      : 'skip'
  ) as { unreadCount: number } | undefined

  const notificationsInfiniteQuery = useInfiniteQuery({
    queryKey: ['notifications', workspaceId, user?.role, selectedClientId],
    enabled: Boolean(open && workspaceId),
    initialPageParam: null as NotificationsCursor | null,
    queryFn: async ({ pageParam }) => {
      if (!workspaceId) {
        return { notifications: [], nextCursor: null } as { notifications: WorkspaceNotification[]; nextCursor: NotificationsCursor | null }
      }

      const data = (await convex.query(notificationsApi.list, {
        workspaceId,
        pageSize: parsePageSize(PAGE_SIZE, { defaultValue: PAGE_SIZE, max: 100 }),
        role: user?.role ?? undefined,
        clientId: user?.role === 'client' ? selectedClientId ?? undefined : undefined,
        afterCreatedAtMs: pageParam?.createdAtMs,
        afterLegacyId: pageParam?.legacyId,
      })) as { notifications: WorkspaceNotification[]; nextCursor: NotificationsCursor | null }

      return data
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
  })

  const notifications = useMemo(
    () => notificationsInfiniteQuery.data?.pages.flatMap((page) => page.notifications ?? []) ?? [],
    [notificationsInfiniteQuery.data?.pages]
  )

  const unreadCount = unreadCountQuery?.unreadCount ?? notifications.filter((item) => !item.read).length

  const fetchNotifications = useCallback(async () => {
    await notificationsInfiniteQuery.refetch()
  }, [notificationsInfiniteQuery])

  const ackNotifications = useMutation(notificationsApi.ack)

  const updateNotificationStatus = useCallback(
    async (ids: string[], action: AckAction, options: AckOptions = {}) => {
      if (!workspaceId || ids.length === 0) {
        return
      }

      try {
        setAckInFlight(true)
        await ackNotifications({ workspaceId, ids, action })

        await notificationsInfiniteQuery.refetch()

        if (!options.silent) {
          toast({ title: action === 'dismiss' ? 'Dismissed' : 'Marked as read' })
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Notification update failed'
        toast({ title: 'Update failed', description: message, variant: 'destructive' })
      } finally {
        setAckInFlight(false)
      }
    },
    [ackNotifications, notificationsInfiniteQuery, toast, workspaceId]
  )

  const handleOpenChange = useCallback(
    (value: boolean) => {
      setOpen(value)
      if (value) {
        void fetchNotifications()
      }
    },
    [fetchNotifications]
  )

  useEffect(() => {
    if (!open || ackInFlight) {
      return
    }

    const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id)
    if (unreadIds.length === 0) {
      return
    }

    void updateNotificationStatus(unreadIds, 'read', { silent: true })
  }, [ackInFlight, notifications, open, updateNotificationStatus])

  const handleRefresh = useCallback(() => {
    void notificationsInfiniteQuery.refetch()
  }, [notificationsInfiniteQuery])

  const handleLoadMore = useCallback(() => {
    if (!notificationsInfiniteQuery.hasNextPage || notificationsInfiniteQuery.isFetchingNextPage) {
      return
    }

    void notificationsInfiniteQuery.fetchNextPage()
  }, [notificationsInfiniteQuery])

  const handleDismiss = useCallback(
    (id: string) => {
      void updateNotificationStatus([id], 'dismiss')
    },
    [updateNotificationStatus]
  )

  const handleMarkAllRead = useCallback(() => {
    const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id)
    if (unreadIds.length === 0) {
      return
    }
    void updateNotificationStatus(unreadIds, 'read')
  }, [notifications, updateNotificationStatus])

  const triggerDisabled = !user

  const isLoadingInitial = notificationsInfiniteQuery.isLoading && notifications.length === 0

  const renderTimestamp = (input: string | null) => {
    if (!input) {
      return 'Just now'
    }

    const date = new Date(input)
    if (Number.isNaN(date.getTime())) {
      return 'Just now'
    }
    return formatDistanceToNow(date, { addSuffix: true })
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" disabled={triggerDisabled}>
          <Bell className="h-5 w-5" />
          <span className="sr-only">View notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <DropdownMenuLabel className="flex items-center justify-between gap-3 border-b px-4 py-3 text-sm font-semibold">
          <span>Notifications</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={notificationsInfiniteQuery.isFetching || notificationsInfiniteQuery.isFetchingNextPage}
            >
              Refresh
            </Button>
            <Button size="sm" variant="ghost" onClick={handleMarkAllRead} disabled={unreadCount === 0 || ackInFlight}>
              <Check className="mr-1 h-4 w-4" /> Mark all read
            </Button>
          </div>
        </DropdownMenuLabel>
        <ScrollArea className="max-h-80">
          {isLoadingInitial ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Loading notifications…
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">No notifications yet.</div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 focus:bg-muted/60',
                    !notification.read && 'bg-muted/40'
                  )}
                  onSelect={(event) => event.preventDefault()}
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.body}</p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{renderTimestamp(notification.createdAt)}</span>
                      {notification.recipients.clientId && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground/80">
                          Client
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDismiss(notification.id)}
                    disabled={ackInFlight}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Dismiss notification</span>
                  </Button>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
          <span>{notifications.length} shown</span>
          <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                disabled={notificationsInfiniteQuery.isFetchingNextPage || !notificationsInfiniteQuery.hasNextPage}
              >
                {notificationsInfiniteQuery.isFetchingNextPage ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Load more
              </Button>
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                View all
              </Button>
            </Link>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
