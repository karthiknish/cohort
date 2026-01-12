'use client'

import { useCallback, useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  LoaderCircle,
  Trash2,
  Filter,
  MessageSquare,
  DollarSign,
  BarChart,
  CircleCheck,
  Mail,
} from 'lucide-react'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useConvex, useMutation } from 'convex/react'

type NotificationsCursor = {
  createdAtMs: number
  legacyId: string
}

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import type { WorkspaceNotification } from '@/types/notifications'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { notificationsApi } from '@/lib/convex-api'
import { parsePageSize } from '@/lib/pagination'
import { usePersistedTab } from '@/hooks/use-persisted-tab'

const PAGE_SIZE = 25


type AckAction = 'read' | 'dismiss'

type FilterType = 'all' | 'unread' | 'mentions' | 'system'

export default function NotificationsPage() {
  const { user } = useAuth()
  const { selectedClientId } = useClientContext()
  const { toast } = useToast()

  const filterTabs = usePersistedTab<FilterType>({
    param: 'tab',
    defaultValue: 'all',
    allowedValues: ['all', 'unread', 'mentions', 'system'] as const,
    storageNamespace: 'dashboard:notifications',
    syncToUrl: true,
  })

  const activeFilter = filterTabs.value
  const setActiveFilter = filterTabs.setValue
  const [ackInFlight, setAckInFlight] = useState(false)

  const convex = useConvex()
  const workspaceId = user?.agencyId

  const notificationsInfiniteQuery = useInfiniteQuery({
    queryKey: ['notificationsPage', workspaceId, user?.role, selectedClientId, activeFilter],
    enabled: Boolean(workspaceId),
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
      })
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
  })

  const notifications = useMemo(() => {
    let items = notificationsInfiniteQuery.data?.pages.flatMap((page) => page.notifications ?? []) ?? []

    if (activeFilter === 'mentions') {
      items = items.filter((n: WorkspaceNotification) => n.kind === 'collaboration.mention' || n.kind === 'task.mention')
    } else if (activeFilter === 'system') {
      items = items.filter(
        (n: WorkspaceNotification) => n.kind === 'invoice.sent' || n.kind === 'invoice.paid' || n.kind === 'proposal.deck.ready'
      )
    }

    return items
  }, [activeFilter, notificationsInfiniteQuery.data?.pages])

  const ackNotifications = useMutation(notificationsApi.ack)

  const loading = notificationsInfiniteQuery.isLoading
  const loadingMore = notificationsInfiniteQuery.isFetchingNextPage
  const error = notificationsInfiniteQuery.isError
    ? notificationsInfiniteQuery.error instanceof Error
      ? notificationsInfiniteQuery.error.message
      : 'Failed to load notifications'
    : null
  const nextCursor = notificationsInfiniteQuery.hasNextPage

  const updateNotificationStatus = useCallback(
    async (ids: string[], action: AckAction) => {
      if (!workspaceId || ids.length === 0) {
        return
      }

      try {
        setAckInFlight(true)
        await ackNotifications({ workspaceId, ids, action })
        await notificationsInfiniteQuery.refetch()

        toast({
          title: action === 'dismiss' ? 'Notifications cleared' : 'Marked as read',
          description: `${ids.length} notification${ids.length > 1 ? 's' : ''} ${action === 'dismiss' ? 'removed' : 'updated'} successfully.`,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Notification update failed'
        toast({ title: 'Notification error', description: message, variant: 'destructive' })
      } finally {
        setAckInFlight(false)
      }
    },
    [ackNotifications, notificationsInfiniteQuery, toast, workspaceId]
  )

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

  const handleMarkAsRead = useCallback(
    (id: string) => {
      void updateNotificationStatus([id], 'read')
    },
    [updateNotificationStatus]
  )

  const handleMarkAllRead = useCallback(() => {
    const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id)
    if (unreadIds.length === 0) {
      toast({ title: 'All caught up!', description: 'You have no unread notifications.' })
      return
    }
    void updateNotificationStatus(unreadIds, 'read')
  }, [notifications, updateNotificationStatus, toast])

  const handleClearAll = useCallback(() => {
    const allIds = notifications.map((item) => item.id)
    if (allIds.length === 0) {
      toast({ title: 'Inbox empty', description: 'There are no notifications to clear.' })
      return
    }
    void updateNotificationStatus(allIds, 'dismiss')
  }, [notifications, updateNotificationStatus, toast])

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications])

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

  const getNotificationIcon = (kind: WorkspaceNotification['kind']) => {
    switch (kind) {
      case 'collaboration.mention':
      case 'task.mention':
        return <MessageSquare className="h-6 w-6" />
      case 'task.comment':
        return <MessageSquare className="h-6 w-6" />
      case 'invoice.sent':
      case 'invoice.paid':
        return <DollarSign className="h-6 w-6" />
      case 'proposal.deck.ready':
        return <BarChart className="h-6 w-6" />
      case 'task.created':
      case 'task.updated':
        return <CircleCheck className="h-6 w-6" />
      default:
        return <Mail className="h-6 w-6" />
    }
  }

  const getNotificationCategory = (kind: WorkspaceNotification['kind']) => {
    if (kind === 'collaboration.mention' || kind === 'task.mention') return 'Mention'
    if (kind === 'invoice.sent' || kind === 'invoice.paid' || kind === 'proposal.deck.ready') return 'System'
    if (kind === 'task.created' || kind === 'task.updated' || kind === 'task.comment') return 'Task'
    return 'General'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on what matters most</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0 || ackInFlight}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll} disabled={notifications.length === 0 || ackInFlight}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load notifications</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterType)}>
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
                    {activeFilter === 'system' && 'Automated updates about invoices, proposals, and more'}
                  </CardDescription>
                </div>
                {unreadCount > 0 && activeFilter !== 'unread' && (
                  <Badge variant="destructive">{unreadCount} unread</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <LoaderCircle className="h-5 w-5 animate-spin" /> Loading notifications…
                </div>
              ) : notifications.length === 0 ? (
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
              ) : (
                <ScrollArea className="h-[calc(100vh-24rem)]">
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
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
                                {!notification.read && (
                                  <Badge variant="default" className="h-5 text-[10px]">
                                    NEW
                                  </Badge>
                                )}
                                <Badge variant="outline" className="h-5 text-[10px]">
                                  {getNotificationCategory(notification.kind)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{notification.body}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{renderTimestamp(notification.createdAt)}</span>
                            {notification.actor.name && (
                              <>
                                <span>•</span>
                                <span>by {notification.actor.name}</span>
                              </>
                            )}
                            {notification.recipients.clientId && (
                              <>
                                <span>•</span>
                                <Badge variant="secondary" className="h-4 text-[10px]">
                                  Client
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={ackInFlight}
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDismiss(notification.id)}
                            disabled={ackInFlight}
                            title="Dismiss"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

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
