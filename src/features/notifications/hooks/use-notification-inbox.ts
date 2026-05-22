'use client'

import { reportConvexFailure } from '@/lib/handle-convex-error'
import {
  mergeQueryErrors,
  queryErrorFromUnknown,
  useConvexQueryError,
} from '@/lib/hooks/use-convex-query-error'
import { useCallback, useEffect, useEffectEvent, useMemo, useState } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useMutation, useQuery as useConvexQuery, useConvex } from 'convex/react'

import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import type { WorkspaceNotification } from '@/types/notifications'
import { notificationsApi } from '@/lib/convex-api'
import { parsePageSize } from '@/lib/pagination'
import { useToast } from '@/shared/ui/use-toast'
import { groupNotificationsByDate } from '@/features/notifications/lib/group-notifications'
import { useNotificationNavigation } from '@/features/notifications/hooks/use-notification-navigation'

import { NOTIFICATIONS_INBOX_PAGE_SIZE } from '@/lib/notifications/pagination'

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

export function useNotificationInbox() {
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

  const unreadCountQueryError = useConvexQueryError({
    data: unreadCountQuery,
    skipped: !workspaceId,
    fallbackMessage: 'Unable to load notification count.',
  })

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
        pageSize: parsePageSize(NOTIFICATIONS_INBOX_PAGE_SIZE, {
          defaultValue: NOTIFICATIONS_INBOX_PAGE_SIZE,
          max: 100,
        }),
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

  const notificationsListQueryError = useMemo(() => {
    if (!open || !workspaceId) {
      return null
    }
    if (!notificationsInfiniteQuery.isError) {
      return null
    }
    return queryErrorFromUnknown(
      notificationsInfiniteQuery.error,
      'Unable to load notifications.',
    )
  }, [
    notificationsInfiniteQuery.error,
    notificationsInfiniteQuery.isError,
    open,
    workspaceId,
  ])

  const inboxQueryError = mergeQueryErrors(unreadCountQueryError, notificationsListQueryError)

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
          reportConvexFailure({
            error,
            context: 'useNotificationInbox:ack',
            title: 'Update failed',
            fallbackMessage: 'Notification update failed',
          })
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
  const hasUnread = unreadCount > 0

  return {
    open,
    setOpen,
    handleOpenChange,
    handleOpenNotification,
    unreadCount,
    hasUnread,
    ackInFlight,
    isLoadingInitial,
    notifications,
    groupedNotifications,
    triggerDisabled,
    handleDismiss,
    handleMarkAllRead,
    handleLoadMore,
    hasNextPage: notificationsInfiniteQuery.hasNextPage,
    isFetchingNextPage: notificationsInfiniteQuery.isFetchingNextPage,
    inboxQueryError,
  }
}
