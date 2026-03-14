import { Skeleton } from '@/components/ui/skeleton'

const KPI_CARDS = ['kpi-reach', 'kpi-impressions', 'kpi-engagement', 'kpi-clicks']

export default function SocialsLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Page header with date range picker */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>

      {/* Connection panel */}
      <div className="flex items-center gap-4 rounded-lg border p-4">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Platform tabs */}
      <div className="flex gap-2 border-b pb-0">
        <Skeleton className="h-9 w-28 rounded-t-md" />
        <Skeleton className="h-9 w-28 rounded-t-md" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {KPI_CARDS.map((id) => (
          <div key={id} className="rounded-lg border p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
        <Skeleton className="h-52 w-full rounded-md" />
      </div>
    </div>
  )
}
