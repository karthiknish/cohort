'use client'

import { Suspense } from 'react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { LiveRegion } from '@/shared/ui/live-region'
import { Tabs, TabsContent } from '@/shared/ui/tabs'

import {
  NOTIFICATIONS_PAGE_FALLBACK,
  NotificationsErrorAlert,
  NotificationsFilterPanel,
  NotificationsFilterTabsList,
  NotificationsPageHeader,
  NotificationsPreviewAlert,
  useNotificationsPage,
} from './notifications-page-sections'

export default function NotificationsPage() {
  return (
    <Suspense fallback={NOTIFICATIONS_PAGE_FALLBACK}>
      <NotificationsPageContent />
    </Suspense>
  )
}

function NotificationsPageContent() {
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
