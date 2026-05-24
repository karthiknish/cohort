import { AnalyticsPageSkeleton } from '@/features/dashboard/analytics/components/analytics-page-skeleton'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

export default function AnalyticsLoading() {
  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <AnalyticsPageSkeleton />
    </div>
  )
}
