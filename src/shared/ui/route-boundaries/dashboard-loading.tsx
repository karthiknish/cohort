import { DashboardSkeleton } from '@/features/dashboard/home/components/dashboard-skeleton'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

export function DashboardLoading() {
  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <DashboardSkeleton />
    </div>
  )
}

export default DashboardLoading
