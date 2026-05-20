'use client'

import { notifyFailure } from '@/lib/notifications'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
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

type NotificationsCursor = {
  createdAtMs: number
  legacyId: string
  scanCursor?: string | null
  overflowLegacyIds?: string[]
}

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

const PAGE_SIZE = 25
const MAX_NOTIFICATION_PAGES = 10
const VIRTUAL_NOTIFICATIONS_THRESHOLD = 24
const FILTER_VALUES = ['all', 'unread', 'mentions', 'tasks', 'collaboration', 'system'] as const
const NOTIFICATIONS_PAGE_FALLBACK = (
  <RevealTransitionFallback>
    <NotificationsPageFallback />
  </RevealTransitionFallback>
)


type AckAction = 'read' | 'dismiss'

type FilterType = (typeof FILTER_VALUES)[number]

const FILTER_EMPTY_LABELS: Partial<Record<FilterType, string>> = {
  unread: 'unread',
  mentions: 'mention',
  tasks: 'task',
  collaboration: 'collaboration',
  system: 'system',
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={NOTIFICATIONS_PAGE_FALLBACK}>
      <NotificationsPageContent />
    </Suspense>
  )
}

function NotificationsLoadingSkeleton() {
  return (
    <div
      className="space-y-3 py-2"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading notifications"
    >
      {['n-sk-1', 'n-sk-2', 'n-sk-3', 'n-sk-4', 'n-sk-5'].map((key) => (
        <div key={key} className="flex items-start gap-4 rounded-lg border p-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-full max-w-[240px]" />
            <Skeleton className="h-3 w-full max-w-[320px]" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

function NotificationsPageFallback() {
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

function NotificationsPageContent() {
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
    [selectedClientId]
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
        pageSize: parsePageSize(PAGE_SIZE, { defaultValue: PAGE_SIZE, max: 100 }),
        role: user?.role ?? undefined,
        clientId: user?.role === 'client' ? selectedClientId ?? undefined : undefined,
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
    [notificationsInfiniteQuery.data?.pages]
  )

  const notifications = useMemo(() => {
    let items = isPreviewMode ? previewNotifications : liveNotifications

    if (activeFilter === 'mentions') {
      items = items.filter((n: WorkspaceNotification) => n.kind === 'collaboration.mention' || n.kind === 'task.mention')
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
            : `Marking ${announcementLabel} as read.`
        )

        setPreviewNotificationState((current) => {
          const notifications = current?.sourceKey === previewSourceKey
            ? current.notifications
            : basePreviewNotifications

          if (action === 'dismiss') {
            return {
              sourceKey: previewSourceKey,
              notifications: notifications.filter((notification) => !ids.includes(notification.id)),
            }
          }

          return {
            sourceKey: previewSourceKey,
            notifications: notifications.map((notification) => (
              ids.includes(notification.id)
                ? { ...notification, read: true, acknowledged: true }
                : notification
            )),
          }
        })

        toast({
          title: action === 'dismiss' ? 'Notifications cleared' : 'Marked as read',
          description: `${ids.length} notification${ids.length > 1 ? 's' : ''} ${action === 'dismiss' ? 'removed' : 'updated'} successfully.`,
        })

        setNotificationAnnouncement(
          action === 'dismiss'
            ? `${announcementLabel} dismissed.`
            : `${announcementLabel} marked as read.`
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
          : `Marking ${announcementLabel} as read.`
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
              : `${announcementLabel} marked as read.`
          )
        })
        .catch((error) => {
          logError(error, 'Notifications:updateStatus')
          const message = asErrorMessage(error)
          notifyFailure({
        title: 'Notification error',
        message: message,
      })
          setNotificationAnnouncement(`Could not update ${announcementLabel}. ${message}`)
        })
        .finally(() => {
          setAckInFlight(false)
        })
    },
    [ackNotifications, basePreviewNotifications, isPreviewMode, notificationsInfiniteQuery, previewSourceKey, selectedClientId, toast, user?.role, workspaceId]
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
    [updateNotificationStatus]
  )

  const handleMarkAsRead = useCallback(
    (id: string, title?: string) => {
      void updateNotificationStatus([id], 'read', title ? `${title} notification` : 'notification')
    },
    [updateNotificationStatus]
  )

  const handleMarkAllRead = useCallback(() => {
    const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id)
    if (unreadIds.length === 0) {
      toast({ title: 'All caught up!', description: 'You have no unread notifications.' })
      return
    }
    void updateNotificationStatus(unreadIds, 'read', `${unreadIds.length} notifications`)
  }, [notifications, updateNotificationStatus, toast])

  const handleActiveFilterChange = useCallback((value: string) => {
    setActiveFilter(value as FilterType)
  }, [setActiveFilter])

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

  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <LiveRegion message={notificationAnnouncement} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.notifications?.title ?? 'Notifications'}</h1>
          <p className={DASHBOARD_THEME.layout.subtitle}>{PAGE_TITLES.notifications?.description ?? 'Stay updated on what matters most'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild className={getButtonClasses('outline')}>
            <Link href="/settings?tab=notifications">
              <Settings2 className="mr-2 h-4 w-4" aria-hidden />
              Settings
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || (!isPreviewMode && notificationsInfiniteQuery.isFetching)}
            className={getButtonClasses('outline')}
          >
            {!isPreviewMode && notificationsInfiniteQuery.isFetching ? (
              <LoaderCircle className={cn('mr-2 h-4 w-4', DASHBOARD_THEME.animations.spin)} />
            ) : null}
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0 || ackInFlight} className={getButtonClasses('outline')}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll} disabled={notifications.length === 0 || ackInFlight} className={getButtonClasses('outline')}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        </div>
      </div>

      {isPreviewMode && (
        <Alert>
          <AlertTitle>Preview mode</AlertTitle>
          <AlertDescription>
            Notifications on this page use sample data. Read and dismiss actions update the local preview only.
          </AlertDescription>
        </Alert>
      )}

      {error && (
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
                onClick={handleRetryNotificationsQuery}
                disabled={notificationsInfiniteQuery.isFetching}
              >
                {notificationsInfiniteQuery.isFetching ? (
                  <LoaderCircle className={cn('mr-2 h-4 w-4', DASHBOARD_THEME.animations.spin)} />
                ) : null}
                Try again
              </Button>
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeFilter} onValueChange={handleActiveFilterChange}>
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="all" className="relative">
            All
            {activeFilter === 'all' && notifications.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread" className="relative">
            Unread
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="mentions">
            <MessageSquare className="mr-2 h-4 w-4" />
            Mentions
          </TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="collaboration">Chat</TabsTrigger>
          <TabsTrigger value="system">
            <Filter className="mr-1 h-4 w-4" aria-hidden />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {activeFilter === 'all' && 'All notifications'}
                    {activeFilter === 'unread' && 'Unread notifications'}
                    {activeFilter === 'mentions' && 'Mentions'}
                    {activeFilter === 'system' && 'System notifications'}
                  </CardTitle>
                  <CardDescription>
                    {activeFilter === 'all' && 'Everything that happened in your workspace'}
                    {activeFilter === 'unread' && 'Notifications you haven\'t read yet'}
                    {activeFilter === 'mentions' && 'Times you were mentioned in conversations'}
                    {activeFilter === 'system' && 'Automated updates about generated proposal decks'}
                  </CardDescription>
                </div>
                {unreadCount > 0 && activeFilter !== 'unread' && (
                  <Badge variant="destructive">{unreadCount} unread</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedIds.size > 0 ? (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                  <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleBulkMarkRead} disabled={ackInFlight}>
                      Mark read
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleBulkDismiss} disabled={ackInFlight}>
                      Dismiss
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                      Clear
                    </Button>
                  </div>
                </div>
              ) : null}
              {loading ? (
                <NotificationsLoadingSkeleton />
              ) : notifications.length === 0 && !error ? (
                <NotificationEmptyState filterLabel={FILTER_EMPTY_LABELS[activeFilter]} />
              ) : notifications.length > 0 ? (
                shouldVirtualizeNotifications ? (
                  <div
                    ref={notificationScrollRef}
                    className="h-[calc(100vh-24rem)] overflow-y-auto"
                  >
                    <div
                      className="relative w-full"
                      style={{ height: notificationVirtualizer.getTotalSize() }}
                    >
                      {notificationVirtualizer.getVirtualItems().map((vi) => {
                        const notification = notifications[vi.index]
                        if (!notification) {
                          return null
                        }
                        return (
                          <div
                            key={notification.id}
                            data-index={vi.index}
                            ref={notificationVirtualizer.measureElement}
                            className="absolute left-0 top-0 w-full pb-2"
                            style={{ transform: `translateY(${vi.start}px)` }}
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
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
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
                )
              ) : null}

              {!loading && notifications.length > 0 && nextCursor && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Load more
                  </Button>
                </div>
              )}

              {!loading && notifications.length > 0 && (
                <div className="mt-4 text-center text-xs text-muted-foreground">
                  Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
