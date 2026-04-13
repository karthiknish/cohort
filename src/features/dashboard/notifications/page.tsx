'use client'

import { Suspense, useCallback, useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  BellOff,
  Check,
  CheckCheck,
  LoaderCircle,
  Trash2,
  Filter,
  MessageSquare,
  BarChart,
  CircleCheck,
  Mail,
  ExternalLink,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useInfiniteQuery } from '@tanstack/react-query'
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

const PAGE_SIZE = 25
const FILTER_VALUES = ['all', 'unread', 'mentions', 'system'] as const
const NOTIFICATIONS_PAGE_FALLBACK = (
  <RevealTransitionFallback>
    <NotificationsPageFallback />
  </RevealTransitionFallback>
)


type AckAction = 'read' | 'dismiss'

type FilterType = 'all' | 'unread' | 'mentions' | 'system'

function getNotificationIcon(kind: WorkspaceNotification['kind']) {
  switch (kind) {
    case 'collaboration.mention':
    case 'task.mention':
      return <MessageSquare className="h-6 w-6" />
    case 'task.comment':
      return <MessageSquare className="h-6 w-6" />
    case 'proposal.deck.ready':
      return <BarChart className="h-6 w-6" />
    case 'task.created':
    case 'task.updated':
      return <CircleCheck className="h-6 w-6" />
    default:
      return <Mail className="h-6 w-6" />
  }
}

function getNotificationCategory(kind: WorkspaceNotification['kind']) {
  if (kind === 'collaboration.mention' || kind === 'task.mention') return 'Mention'
  if (kind === 'proposal.deck.ready') return 'System'
  if (kind === 'task.created' || kind === 'task.updated' || kind === 'task.comment') return 'Task'
  return 'General'
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
  const router = useRouter()
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
    } else if (activeFilter === 'system') {
      items = items.filter((n: WorkspaceNotification) => n.kind === 'proposal.deck.ready')
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
    (ids: string[], action: AckAction) => {
      if (isPreviewMode) {
        if (ids.length === 0) {
          return Promise.resolve()
        }

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

        return Promise.resolve()
      }

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
          toast({
            title: action === 'dismiss' ? 'Notifications cleared' : 'Marked as read',
            description: `${ids.length} notification${ids.length > 1 ? 's' : ''} ${action === 'dismiss' ? 'removed' : 'updated'} successfully.`,
          })
        })
        .catch((error) => {
          logError(error, 'Notifications:updateStatus')
          const message = asErrorMessage(error)
          toast({ title: 'Notification error', description: message, variant: 'destructive' })
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
    (id: string) => {
      void updateNotificationStatus([id], 'dismiss')
    },
    [updateNotificationStatus]
  )

  const handleMarkAsRead = useCallback(
    (id: string) => {
      void updateNotificationStatus([id], 'read')
    },
    [updateNotificationStatus]
  )

  const handleOpenNotification = useCallback((notification: WorkspaceNotification) => {
    const target = typeof notification.navigationUrl === 'string' ? notification.navigationUrl : null
    if (!target) return

    if (target.startsWith('/')) {
      router.push(target)
      return
    }

    if (typeof window !== 'undefined') {
      window.location.assign(target)
    }
  }, [router])

  const handleMarkAllRead = useCallback(() => {
    const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id)
    if (unreadIds.length === 0) {
      toast({ title: 'All caught up!', description: 'You have no unread notifications.' })
      return
    }
    void updateNotificationStatus(unreadIds, 'read')
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
    void updateNotificationStatus(allIds, 'dismiss')
  }, [notifications, updateNotificationStatus, toast])

  const unreadCount = notifications.filter((item) => !item.read).length

  const renderTimestamp = useCallback((input: string | null) => {
    if (!input) {
      return 'Just now'
    }

    const date = new Date(input)
    if (Number.isNaN(date.getTime())) {
      return 'Just now'
    }
    return formatDistanceToNow(date, { addSuffix: true })
  }, [])

  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.notifications?.title ?? 'Notifications'}</h1>
          <p className={DASHBOARD_THEME.layout.subtitle}>{PAGE_TITLES.notifications?.description ?? 'Stay updated on what matters most'}</p>
        </div>
        <div className="flex items-center gap-2">
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
        <TabsList className="grid w-full grid-cols-4">
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
          <TabsTrigger value="system">
            <Filter className="mr-2 h-4 w-4" />
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
              {loading ? (
                <NotificationsLoadingSkeleton />
              ) : notifications.length === 0 && !error ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="rounded-full bg-muted p-4">
                    <BellOff className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">No notifications yet</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeFilter === 'unread' && 'You\'re all caught up! No unread notifications.'}
                      {activeFilter === 'mentions' && 'No one has mentioned you recently.'}
                      {activeFilter === 'system' && 'No system notifications at this time.'}
                      {activeFilter === 'all' && 'When something happens, you\'ll see it here.'}
                    </p>
                  </div>
                </div>
              ) : notifications.length > 0 ? (
                <ScrollArea className="h-[calc(100vh-24rem)]">
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <NotificationRow
                        key={notification.id}
                        ackInFlight={ackInFlight}
                        getNotificationCategory={getNotificationCategory}
                        getNotificationIcon={getNotificationIcon}
                        handleDismiss={handleDismiss}
                        handleMarkAsRead={handleMarkAsRead}
                        handleOpenNotification={handleOpenNotification}
                        notification={notification}
                        renderTimestamp={renderTimestamp}
                      />
                    ))}
                  </div>
                </ScrollArea>
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

function NotificationRow({
  ackInFlight,
  getNotificationCategory,
  getNotificationIcon,
  handleDismiss,
  handleMarkAsRead,
  handleOpenNotification,
  notification,
  renderTimestamp,
}: {
  ackInFlight: boolean
  getNotificationCategory: (kind: WorkspaceNotification['kind']) => string
  getNotificationIcon: (kind: WorkspaceNotification['kind']) => React.ReactNode
  handleDismiss: (id: string) => void
  handleMarkAsRead: (id: string) => void
  handleOpenNotification: (notification: WorkspaceNotification) => void
  notification: WorkspaceNotification
  renderTimestamp: (input: string | null) => string
}) {
  const handleOpen = useCallback(() => {
    handleOpenNotification(notification)
  }, [handleOpenNotification, notification])

  const handleRead = useCallback(() => {
    handleMarkAsRead(notification.id)
  }, [handleMarkAsRead, notification.id])

  const handleRemove = useCallback(() => {
    handleDismiss(notification.id)
  }, [handleDismiss, notification.id])

  return (
    <div
      className={cn(
        'group flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50',
        !notification.read && 'border-primary/30 bg-primary/5'
      )}
    >
      <div className="text-2xl">{getNotificationIcon(notification.kind)}</div>
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{notification.title}</p>
              {!notification.read ? (
                <Badge variant="default" className="h-5 text-[10px]">
                  NEW
                </Badge>
              ) : null}
              <Badge variant="outline" className="h-5 text-[10px]">
                {getNotificationCategory(notification.kind)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{notification.body}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{renderTimestamp(notification.createdAt)}</span>
          {notification.actor.name ? (
            <>
              <span>•</span>
              <span>by {notification.actor.name}</span>
            </>
          ) : null}
          {notification.recipients.clientId ? (
            <>
              <span>•</span>
              <Badge variant="secondary" className="h-4 text-[10px]">
                Client
              </Badge>
            </>
          ) : null}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {notification.navigationUrl ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleOpen}
            title="Open"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        ) : null}
        {!notification.read ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRead}
            disabled={ackInFlight}
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={handleRemove}
          disabled={ackInFlight}
          title="Dismiss"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
