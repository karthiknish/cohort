'use client'

import { PageMotionShell } from '@/shared/components/page-motion-shell'

import { AnalyticsPageProvider } from './components/analytics-page-provider'
import { AnalyticsPageShell } from './components/analytics-page-shell'

export default function AnalyticsPage() {
  return (
    <PageMotionShell reveal={false}>
      <AnalyticsPageProvider>
        <AnalyticsPageShell />
      </AnalyticsPageProvider>
    </PageMotionShell>
  )
}