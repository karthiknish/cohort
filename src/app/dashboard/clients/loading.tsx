import { ClientsDashboardSkeleton } from '@/features/dashboard/clients/components/clients-dashboard-skeleton'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

export default function ClientsLoading() {
  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <ClientsDashboardSkeleton />
    </div>
  )
}
