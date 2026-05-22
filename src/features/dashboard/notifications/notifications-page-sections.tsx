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

import { useNotificationsPage } from './notifications-page-hooks'
import { FILTER_EMPTY_LABELS, type FilterType } from './notifications-page-constants'

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

export function NotificationsPageContent() {
  const page = useNotificationsPage()

  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <LiveRegion message={page.notificationAnnouncement} />

      <NotificationsPageHeader
        onRefresh={page.handleRefresh}
        onMarkAllRead={page.handleMarkAllRead}
        onClearAll={page.handleClearAll}
        refreshing={!page.isPreviewMode && page.notificationsInfiniteQuery.isFetching}
        unreadCount={page.unreadCount}
        notificationsCount={page.notifications.length}
        ackInFlight={page.ackInFlight}
      />

      {page.isPreviewMode ? <NotificationsPreviewAlert /> : null}

      {page.error ? (
        <NotificationsErrorAlert
          error={page.error}
          isPreviewMode={page.isPreviewMode}
          retrying={page.notificationsInfiniteQuery.isFetching}
          onRetry={page.handleRetryNotificationsQuery}
        />
      ) : null}

      <Tabs value={page.activeFilter} onValueChange={page.handleActiveFilterChange}>
        <NotificationsFilterTabsList
          activeFilter={page.activeFilter}
          notificationsCount={page.notifications.length}
          unreadCount={page.unreadCount}
        />

        <TabsContent value={page.activeFilter} className="mt-6">
          <NotificationsFilterPanel page={page} />
        </TabsContent>
      </Tabs>
    </div>
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
