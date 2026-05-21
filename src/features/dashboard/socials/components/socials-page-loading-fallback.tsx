import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { Skeleton } from '@/shared/ui/skeleton'

const KPI_SLOTS = ['reach', 'impressions', 'engaged', 'followers'] as const

export function SocialsPageLoadingFallback() {
  return (
    <div className="space-y-10" aria-busy aria-label="Loading socials">
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className={DASHBOARD_THEME.stats.container}>
          {KPI_SLOTS.map((id) => (
            <Skeleton key={id} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
