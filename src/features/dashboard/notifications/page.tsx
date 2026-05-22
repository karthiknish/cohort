'use client'

import { Suspense } from 'react'

import { NOTIFICATIONS_PAGE_FALLBACK } from './notifications-page-fallback'
import { NotificationsPageContent } from './notifications-page-sections'

export default function NotificationsPage() {
  return (
    <Suspense fallback={NOTIFICATIONS_PAGE_FALLBACK}>
      <NotificationsPageContent />
    </Suspense>
  )
}
