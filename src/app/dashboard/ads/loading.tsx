import { AdsSkeleton } from '@/features/dashboard/ads/components/ads-skeleton'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

export default function AdsLoading() {
  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <AdsSkeleton />
    </div>
  )
}
