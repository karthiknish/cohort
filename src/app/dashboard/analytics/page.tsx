'use client'

import { AnalyticsPageProvider } from './components/analytics-page-provider'
import { AnalyticsPageShell } from './components/analytics-page-shell'

export default function AnalyticsPage() {
  return (
    <AnalyticsPageProvider>
      <AnalyticsPageShell />
    </AnalyticsPageProvider>
  )
}