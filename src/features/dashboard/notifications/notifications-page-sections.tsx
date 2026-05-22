'use client'

import { notifyFailure } from '@/lib/notifications'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  CheckCheck,
  LoaderCircle,
  Settings2,
  Trash2,
  MessageSquare,
  Filter,
} from 'lucide-react'
import Link from 'next/link'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useConvex, useMutation } from 'convex/react'

import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import type { WorkspaceNotification } from '@/types/notifications'
import { cn } from '@/lib/utils'
import { DASHBOARD_THEME, PAGE_TITLES, getButtonClasses } from '@/lib/dashboard-theme'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { LiveRegion } from '@/shared/ui/live-region'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Skeleton } from '@/shared/ui/skeleton'
import { useToast } from '@/shared/ui/use-toast'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Badge } from '@/shared/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'

import { notificationsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { parsePageSize } from '@/lib/pagination'
import { getPreviewNotifications } from '@/lib/preview-data'
import { usePersistedTab } from '@/shared/hooks/use-persisted-tab'
import { RevealTransition, RevealTransitionFallback } from '@/shared/ui/page-transition'
import { NotificationItem } from '@/features/notifications/components/notification-item'
import { NotificationEmptyState } from '@/features/notifications/components/notification-empty-state'
import { useNotificationNavigation } from '@/features/notifications/hooks/use-notification-navigation'
import { NOTIFICATIONS_PAGE_PAGE_SIZE } from '@/lib/notifications/pagination'

type NotificationsCursor = {
  createdAtMs: number
  legacyId: string
  scanCursor?: string | null
  overflowLegacyIds?: string[]
}

const MAX_NOTIFICATION_PAGES = 10
const VIRTUAL_NOTIFICATIONS_THRESHOLD = 24
export const FILTER_VALUES = ['all', 'unread', 'mentions', 'tasks', 'collaboration', 'system'] as const

export type AckAction = 'read' | 'dismiss'
export type FilterType = (typeof FILTER_VALUES)[number]

const FILTER_EMPTY_LABELS: Partial<Record<FilterType, string>> = {
  unread: 'unread',
  mentions: 'mention',
  tasks: 'task',
  collaboration: 'collaboration',
  system: 'system',
}

export function NotificationVirtualRow({
  start,
  dataIndex,
  measureRef,
  children,
}: {
  start: number
  dataIndex: number
  measureRef: (element: Element | null) => void
  children: ReactNode
}) {
  const style = useMemo(() => ({ transform: `translateY(${start}px)` }), [start])

  return (
    <div data-index={dataIndex} ref={measureRef} className="absolute left-0 top-0 w-full pb-2" style={style}>
      {children}
    </div>
  )
}

export function NotificationsLoadingSkeleton() {
  return (
    <output
      className="block space-y-3 py-2"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading notifications"
    >
      {['n-sk-1', 'n-sk-2', 'n-sk-3', 'n-sk-4', 'n-sk-5'].map((key) => (
        <div key={key} className="flex items-start gap-4 rounded-lg border p-4">
          <Skeleton className="size-12 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-full max-w-[240px]" />
            <Skeleton className="h-3 w-full max-w-[320px]" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </output>
  )
}

export function NotificationsPageFallback() {
  return (
    <RevealTransition>
      <div className={DASHBOARD_THEME.layout.container}>
        <Card>
          <CardContent className="pt-6">
            <NotificationsLoadingSkeleton />
          </CardContent>
        </Card>
      </div>
    </RevealTransition>
  )
}

export const NOTIFICATIONS_PAGE_FALLBACK = (
  <RevealTransitionFallback>
    <NotificationsPageFallback />
  </RevealTransitionFallback>
)

export function useNotificationsPage() {
  const { user } = useAuth()
  const { selectedClientId } = useClientContext()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()

  const filterTabs = usePersistedTab<FilterType>({
    param: 'tab',
    defaultValue: 'all',
    allowedValues: FILTER_VALUES,
    storageNamespace: 'dashboard:notifications',
    syncToUrl: true,
  })

  const activeFilter = filterTabs.value
  const setActiveFilter = filterTabs.setValue
  const [ackInFlight, setAckInFlight] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [notificationAnnouncement, setNotificationAnnouncement] = useState('')
  const handleOpenNotification = useNotificationNavigation()
  const [previewNotificationState, setPreviewNotificationState] = useState<{
    sourceKey: string
    notifications: WorkspaceNotification[]
  } | null>(null)
  const previewSourceKey = `preview:${selectedClientId ?? 'all'}`
  const basePreviewNotifications = useMemo(
    () => getPreviewNotifications(selectedClientId ?? null),
    [selectedClientId],
  )
  const previewNotifications = useMemo(() => {
    if (previewNotificationState?.sourceKey === previewSourceKey) {
      return previewNotificationState.notifications
    }

    return basePreviewNotifications
  }, [basePreviewNotifications, previewNotificationState, previewSourceKey])

  const convex = useConvex()
  const workspaceId = user?.agencyId

  const notificationsInfiniteQuery = useInfiniteQuery({
    queryKey: ['notificationsPage', workspaceId, user?.role, selectedClientId, activeFilter],
    enabled: !isPreviewMode && Boolean(workspaceId),
    initialPageParam: null as NotificationsCursor | null,
    maxPages: MAX_NOTIFICATION_PAGES,
    queryFn: async ({ pageParam }) => {
      if (!workspaceId) {
        return { notifications: [], nextCursor: null as NotificationsCursor | null }
      }

      return convex.query(notificationsApi.list, {
        workspaceId,
        pageSize: parsePageSize(NOTIFICATIONS_PAGE_PAGE_SIZE, {
          defaultValue: NOTIFICATIONS_PAGE_PAGE_SIZE,
          max: 100,
        }),
        role: user?.role ?? undefined,
        clientId: user?.role === 'client' ? (selectedClientId ?? undefined) : undefined,
        unread: activeFilter === 'unread' ? true : undefined,
        afterCreatedAtMs: pageParam?.createdAtMs,
        afterLegacyId: pageParam?.legacyId,
        scanCursor: pageParam?.scanCursor ?? undefined,
        overflowLegacyIds: pageParam?.overflowLegacyIds,
      })
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
  })

  const liveNotifications = useMemo(
    () => notificationsInfiniteQuery.data?.pages.flatMap((page) => page.notifications ?? []) ?? [],
    [notificationsInfiniteQuery.data?.pages],
  )

  const notifications = useMemo(() => {
    let items = isPreviewMode ? previewNotifications : liveNotifications

    if (activeFilter === 'mentions') {
      items = items.filter(
        (n: WorkspaceNotification) => n.kind === 'collaboration.mention' || n.kind === 'task.mention',
      )
    } else if (activeFilter === 'tasks') {
      items = items.filter((n: WorkspaceNotification) => n.kind.startsWith('task.'))
    } else if (activeFilter === 'collaboration') {
      items = items.filter((n: WorkspaceNotification) => n.kind.startsWith('collaboration.'))
    } else if (activeFilter === 'system') {
      items = items.filter(
        (n: WorkspaceNotification) =>
          n.kind === 'proposal.deck.ready' || n.kind === 'report.generated' || n.kind === 'project.created',
      )
    }

    return items
  }, [activeFilter, isPreviewMode, liveNotifications, previewNotifications])

  const ackNotifications = useMutation(notificationsApi.ack)

  const loading = isPreviewMode ? false : notificationsInfiniteQuery.isLoading
  const loadingMore = isPreviewMode ? false : notificationsInfiniteQuery.isFetchingNextPage
  const error = isPreviewMode
    ? null
    : notificationsInfiniteQuery.isError
      ? notificationsInfiniteQuery.error instanceof Error
        ? notificationsInfiniteQuery.error.message
        : 'Failed to load notifications'
      : null
  const nextCursor = isPreviewMode ? false : notificationsInfiniteQuery.hasNextPage

  const updateNotificationStatus = useCallback(
    (ids: string[], action: AckAction, label?: string) => {
      if (isPreviewMode) {
        if (ids.length === 0) {
          return Promise.resolve()
        }

        const announcementLabel = label ?? `${ids.length} notification${ids.length > 1 ? 's' : ''}`
        setNotificationAnnouncement(
          action === 'dismiss'
            ? `Dismissing ${announcementLabel}.`
            : `Marking ${announcementLabel} as read.`,
        )

        setPreviewNotificationState((current) => {
          const currentNotifications =
            current?.sourceKey === previewSourceKey ? current.notifications : basePreviewNotifications

          if (action === 'dismiss') {
            return {
              sourceKey: previewSourceKey,
              notifications: currentNotifications.filter((notification) => !ids.includes(notification.id)),
            }
          }

          return {
            sourceKey: previewSourceKey,
            notifications: currentNotifications.map((notification) =>
              ids.includes(notification.id)
                ? { ...notification, read: true, acknowledged: true }
                : notification,
            ),
          }
        })

        toast({
          title: action === 'dismiss' ? 'Notifications cleared' : 'Marked as read',
          description: `${ids.length} notification${ids.length > 1 ? 's' : ''} ${action === 'dismiss' ? 'removed' : 'updated'} successfully.`,
        })

        setNotificationAnnouncement(
          action === 'dismiss'
            ? `${announcementLabel} dismissed.`
            : `${announcementLabel} marked as read.`,
        )

        return Promise.resolve()
      }

      if (!workspaceId || ids.length === 0) {
        return Promise.resolve()
      }

      const announcementLabel = label ?? `${ids.length} notification${ids.length > 1 ? 's' : ''}`
      setNotificationAnnouncement(
        action === 'dismiss'
          ? `Dismissing ${announcementLabel}.`
          : `Marking ${announcementLabel} as read.`,
      )

      setAckInFlight(true)

      return ackNotifications({
        workspaceId,
        ids,
        action,
        ...(user?.role === 'client' && selectedClientId ? { clientId: selectedClientId } : {}),
      })
        .then(() => notificationsInfiniteQuery.refetch())
        .then(() => {
          toast({
            title: action === 'dismiss' ? 'Notifications cleared' : 'Marked as read',
            description: `${ids.length} notification${ids.length > 1 ? 's' : ''} ${action === 'dismiss' ? 'removed' : 'updated'} successfully.`,
          })
          setNotificationAnnouncement(
            action === 'dismiss'
              ? `${announcementLabel} dismissed.`
              : `${announcementLabel} marked as read.`,
          )
        })
        .catch((updateError) => {
          logError(updateError, 'Notifications:updateStatus')
          const message = asErrorMessage(updateError)
          notifyFailure({
            title: 'Notification error',
            message,
          })
          setNotificationAnnouncement(`Could not update ${announcementLabel}. ${message}`)
        })
        .finally(() => {
          setAckInFlight(false)
        })
    },
    [
      ackNotifications,
      basePreviewNotifications,
      isPreviewMode,
      notificationsInfiniteQuery,
      previewSourceKey,
      selectedClientId,
      toast,
      user?.role,
      workspaceId,
    ],
  )

  const handleRefresh = useCallback(() => {
    if (isPreviewMode) {
      setPreviewNotificationState({
        sourceKey: previewSourceKey,
        notifications: basePreviewNotifications,
      })
      toast({ title: 'Preview data refreshed', description: 'Showing sample notifications.' })
      return
    }

    void notificationsInfiniteQuery.refetch()
  }, [basePreviewNotifications, isPreviewMode, notificationsInfiniteQuery, previewSourceKey, toast])

  const handleRetryNotificationsQuery = useCallback(() => {
    void notificationsInfiniteQuery.refetch()
  }, [notificationsInfiniteQuery])

  const handleLoadMore = useCallback(() => {
    if (isPreviewMode) {
      return
    }

    if (!notificationsInfiniteQuery.hasNextPage || notificationsInfiniteQuery.isFetchingNextPage) {
      return
    }

    void notificationsInfiniteQuery.fetchNextPage()
  }, [isPreviewMode, notificationsInfiniteQuery])

  const handleDismiss = useCallback(
    (id: string, title?: string) => {
      void updateNotificationStatus([id], 'dismiss', title ? `${title} notification` : 'notification')
    },
    [updateNotificationStatus],
  )

  const handleMarkAsRead = useCallback(
    (id: string, title?: string) => {
      void updateNotificationStatus([id], 'read', title ? `${title} notification` : 'notification')
    },
    [updateNotificationStatus],
  )

  const handleMarkAllRead = useCallback(() => {
    const unreadIds = notifications.flatMap((item) => (!item.read ? [item.id] : []))
    if (unreadIds.length === 0) {
      toast({ title: 'All caught up!', description: 'You have no unread notifications.' })
      return
    }
    void updateNotificationStatus(unreadIds, 'read', `${unreadIds.length} notifications`)
  }, [notifications, updateNotificationStatus, toast])

  const handleActiveFilterChange = useCallback(
    (value: string) => {
      setActiveFilter(value as FilterType)
    },
    [setActiveFilter],
  )

  const handleClearAll = useCallback(() => {
    const allIds = notifications.map((item) => item.id)
    if (allIds.length === 0) {
      toast({ title: 'Inbox empty', description: 'There are no notifications to clear.' })
      return
    }
    void updateNotificationStatus(allIds, 'dismiss', `${allIds.length} notifications`)
  }, [notifications, updateNotificationStatus, toast])

  const unreadCount = notifications.filter((item) => !item.read).length

  const handleSelectToggle = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleBulkMarkRead = useCallback(() => {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    void updateNotificationStatus(ids, 'read').then(() => setSelectedIds(new Set()))
  }, [selectedIds, updateNotificationStatus])

  const handleBulkDismiss = useCallback(() => {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    void updateNotificationStatus(ids, 'dismiss').then(() => setSelectedIds(new Set()))
  }, [selectedIds, updateNotificationStatus])

  const notificationScrollRef = useRef<HTMLDivElement | null>(null)
  const shouldVirtualizeNotifications = notifications.length > VIRTUAL_NOTIFICATIONS_THRESHOLD
  const notificationVirtualizer = useVirtualizer({
    count: shouldVirtualizeNotifications ? notifications.length : 0,
    getScrollElement: () => notificationScrollRef.current,
    estimateSize: () => 128,
    overscan: 6,
  })

  useEffect(() => {
    if (!shouldVirtualizeNotifications) {
      return
    }
    notificationVirtualizer.measure()
  }, [notificationVirtualizer, shouldVirtualizeNotifications, notifications.length])

  const virtualTotalSize = notificationVirtualizer.getTotalSize()
  const virtualContainerStyle = useMemo(() => ({ height: virtualTotalSize }), [virtualTotalSize])

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  return {
    activeFilter,
    ackInFlight,
    error,
    handleActiveFilterChange,
    handleBulkDismiss,
    handleBulkMarkRead,
    handleClearAll,
    handleClearSelection,
    handleDismiss,
    handleLoadMore,
    handleMarkAllRead,
    handleMarkAsRead,
    handleOpenNotification,
    handleRefresh,
    handleRetryNotificationsQuery,
    handleSelectToggle,
    isPreviewMode,
    loading,
    loadingMore,
    nextCursor,
    notificationAnnouncement,
    notificationScrollRef,
    notifications,
    notificationsInfiniteQuery,
    notificationVirtualizer,
    selectedIds,
    shouldVirtualizeNotifications,
    unreadCount,
    virtualContainerStyle,
  }
}

export function NotificationsPageHeader({
  onRefresh,
  onMarkAllRead,
  onClearAll,
  refreshing,
  unreadCount,
  notificationsCount,
  ackInFlight,
}: {
  onRefresh: () => void
  onMarkAllRead: () => void
  onClearAll: () => void
  refreshing: boolean
  unreadCount: number
  notificationsCount: number
  ackInFlight: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className={DASHBOARD_THEME.layout.title}>
          {PAGE_TITLES.notifications?.title ?? 'Notifications'}
        </h1>
        <p className={DASHBOARD_THEME.layout.subtitle}>
          {PAGE_TITLES.notifications?.description ?? 'Stay updated on what matters most'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" asChild className={getButtonClasses('outline')}>
          <Link href="/settings?tab=notifications">
            <Settings2 className="mr-2 size-4" aria-hidden />
            Settings
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
          className={getButtonClasses('outline')}
        >
          {refreshing ? <LoaderCircle className={cn('mr-2 size-4', DASHBOARD_THEME.animations.spin)} /> : null}
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkAllRead}
          disabled={unreadCount === 0 || ackInFlight}
          className={getButtonClasses('outline')}
        >
          <CheckCheck className="mr-2 size-4" />
          Mark all read
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          disabled={notificationsCount === 0 || ackInFlight}
          className={getButtonClasses('outline')}
        >
          <Trash2 className="mr-2 size-4" />
          Clear all
        </Button>
      </div>
    </div>
  )
}

export function NotificationsPreviewAlert() {
  return (
    <Alert>
      <AlertTitle>Preview mode</AlertTitle>
      <AlertDescription>
        Notifications on this page use sample data. Read and dismiss actions update the local preview only.
      </AlertDescription>
    </Alert>
  )
}

export function NotificationsErrorAlert({
  error,
  isPreviewMode,
  retrying,
  onRetry,
}: {
  error: string
  isPreviewMode: boolean
  retrying: boolean
  onRetry: () => void
}) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Failed to load notifications</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span className="min-w-0 flex-1">{error}</span>
        {!isPreviewMode ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border-destructive/40"
            onClick={onRetry}
            disabled={retrying}
          >
            {retrying ? <LoaderCircle className={cn('mr-2 size-4', DASHBOARD_THEME.animations.spin)} /> : null}
            Try again
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}

export function NotificationsFilterTabsList({
  activeFilter,
  notificationsCount,
  unreadCount,
}: {
  activeFilter: FilterType
  notificationsCount: number
  unreadCount: number
}) {
  return (
    <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
      <TabsTrigger value="all" className="relative">
        All
        {activeFilter === 'all' && notificationsCount > 0 ? (
          <Badge variant="secondary" className="ml-2">
            {notificationsCount}
          </Badge>
        ) : null}
      </TabsTrigger>
      <TabsTrigger value="unread" className="relative">
        Unread
        {unreadCount > 0 ? (
          <Badge variant="default" className="ml-2">
            {unreadCount}
          </Badge>
        ) : null}
      </TabsTrigger>
      <TabsTrigger value="mentions">
        <MessageSquare className="mr-2 size-4" />
        Mentions
      </TabsTrigger>
      <TabsTrigger value="tasks">Tasks</TabsTrigger>
      <TabsTrigger value="collaboration">Chat</TabsTrigger>
      <TabsTrigger value="system">
        <Filter className="mr-1 size-4" aria-hidden />
        System
      </TabsTrigger>
    </TabsList>
  )
}

function getFilterCardTitle(activeFilter: FilterType) {
  switch (activeFilter) {
    case 'all':
      return 'All notifications'
    case 'unread':
      return 'Unread notifications'
    case 'mentions':
      return 'Mentions'
    case 'tasks':
      return 'Task notifications'
    case 'collaboration':
      return 'Collaboration notifications'
    case 'system':
      return 'System notifications'
    default:
      return 'Notifications'
  }
}

function getFilterCardDescription(activeFilter: FilterType) {
  switch (activeFilter) {
    case 'all':
      return 'Everything that happened in your workspace'
    case 'unread':
      return "Notifications you haven't read yet"
    case 'mentions':
      return 'Times you were mentioned in conversations'
    case 'tasks':
      return 'Updates on tasks assigned to you or your team'
    case 'collaboration':
      return 'Channel messages, threads, and collaboration activity'
    case 'system':
      return 'Automated updates about generated proposal decks'
    default:
      return ''
  }
}

export function NotificationsBulkSelectionBar({
  selectedCount,
  ackInFlight,
  onBulkMarkRead,
  onBulkDismiss,
  onClearSelection,
}: {
  selectedCount: number
  ackInFlight: boolean
  onBulkMarkRead: () => void
  onBulkDismiss: () => void
  onClearSelection: () => void
}) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
      <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onBulkMarkRead} disabled={ackInFlight}>
          Mark read
        </Button>
        <Button size="sm" variant="outline" onClick={onBulkDismiss} disabled={ackInFlight}>
          Dismiss
        </Button>
        <Button size="sm" variant="ghost" onClick={onClearSelection}>
          Clear
        </Button>
      </div>
    </div>
  )
}

export function NotificationsFeedList({
  page,
}: {
  page: ReturnType<typeof useNotificationsPage>
}) {
  const {
    ackInFlight,
    activeFilter,
    error,
    handleDismiss,
    handleLoadMore,
    handleMarkAsRead,
    handleOpenNotification,
    handleSelectToggle,
    loading,
    loadingMore,
    nextCursor,
    notificationScrollRef,
    notifications,
    notificationVirtualizer,
    selectedIds,
    shouldVirtualizeNotifications,
    virtualContainerStyle,
  } = page

  if (loading) {
    return <NotificationsLoadingSkeleton />
  }

  if (notifications.length === 0 && !error) {
    return <NotificationEmptyState filterLabel={FILTER_EMPTY_LABELS[activeFilter]} />
  }

  if (notifications.length === 0) {
    return null
  }

  if (shouldVirtualizeNotifications) {
    return (
      <>
        <div ref={notificationScrollRef} className="h-[calc(100vh-24rem)] overflow-y-auto">
          <div className="relative w-full" style={virtualContainerStyle}>
            {notificationVirtualizer.getVirtualItems().map((vi) => {
              const notification = notifications[vi.index]
              if (!notification) {
                return null
              }

              return (
                <NotificationVirtualRow
                  key={notification.id}
                  start={vi.start}
                  dataIndex={vi.index}
                  measureRef={notificationVirtualizer.measureElement}
                >
                  <NotificationItem
                    notification={notification}
                    ackInFlight={ackInFlight}
                    selected={selectedIds.has(notification.id)}
                    onOpen={handleOpenNotification}
                    onDismiss={handleDismiss}
                    onMarkRead={handleMarkAsRead}
                    onSelectToggle={handleSelectToggle}
                  />
                </NotificationVirtualRow>
              )
            })}
          </div>
        </div>
        <NotificationsFeedFooter
          loading={loading}
          loadingMore={loadingMore}
          nextCursor={Boolean(nextCursor)}
          notificationsCount={notifications.length}
          onLoadMore={handleLoadMore}
        />
      </>
    )
  }

  return (
    <>
      <ScrollArea className="h-[calc(100vh-24rem)]">
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              ackInFlight={ackInFlight}
              selected={selectedIds.has(notification.id)}
              onOpen={handleOpenNotification}
              onDismiss={handleDismiss}
              onMarkRead={handleMarkAsRead}
              onSelectToggle={handleSelectToggle}
            />
          ))}
        </div>
      </ScrollArea>
      <NotificationsFeedFooter
        loading={loading}
        loadingMore={loadingMore}
        nextCursor={Boolean(nextCursor)}
        notificationsCount={notifications.length}
        onLoadMore={handleLoadMore}
      />
    </>
  )
}

export function NotificationsFeedFooter({
  loading,
  loadingMore,
  nextCursor,
  notificationsCount,
  onLoadMore,
}: {
  loading: boolean
  loadingMore: boolean
  nextCursor: boolean
  notificationsCount: number
  onLoadMore: () => void
}) {
  return (
    <>
      {!loading && notificationsCount > 0 && nextCursor ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
            Load more
          </Button>
        </div>
      ) : null}

      {!loading && notificationsCount > 0 ? (
        <div className="mt-4 text-center text-xs text-muted-foreground">
          Showing {notificationsCount} notification{notificationsCount !== 1 ? 's' : ''}
        </div>
      ) : null}
    </>
  )
}

export function NotificationsFilterPanel({
  page,
}: {
  page: ReturnType<typeof useNotificationsPage>
}) {
  const { activeFilter, selectedIds, unreadCount, notifications } = page

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{getFilterCardTitle(activeFilter)}</CardTitle>
            <CardDescription>{getFilterCardDescription(activeFilter)}</CardDescription>
          </div>
          {unreadCount > 0 && activeFilter !== 'unread' ? (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <NotificationsBulkSelectionBar
          selectedCount={selectedIds.size}
          ackInFlight={page.ackInFlight}
          onBulkMarkRead={page.handleBulkMarkRead}
          onBulkDismiss={page.handleBulkDismiss}
          onClearSelection={page.handleClearSelection}
        />
        <NotificationsFeedList page={page} />
      </CardContent>
    </Card>
  )
}
