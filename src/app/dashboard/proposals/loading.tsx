import { ProposalsPageSkeleton } from '@/features/dashboard/proposals/components/proposals-page-skeleton'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

export default function ProposalsLoading() {
  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <ProposalsPageSkeleton />
    </div>
  )
}
