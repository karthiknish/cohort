import { Skeleton } from '@/shared/ui/skeleton'

/**
 * Admin panel loading skeleton for streaming SSR.
 * Shows immediately while the admin page content is loading.
 */
export default function AdminLoading() {
  const statCardSlots = ['stat-card-1', 'stat-card-2', 'stat-card-3', 'stat-card-4']
  const tabSlots = ['tab-1', 'tab-2', 'tab-3', 'tab-4', 'tab-5']
  const tableRowSlots = Array.from({ length: 8 }, (_, index) => `table-row-${index + 1}`)
  const summarySlots = ['summary-1', 'summary-2', 'summary-3', 'summary-4']
  const activitySlots = ['activity-1', 'activity-2', 'activity-3', 'activity-4', 'activity-5']

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* Header skeleton — matches AdminPageShell */}
      <div className="space-y-4 border-b border-border/60 pb-8">
        <Skeleton className="h-3 w-32" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-10 w-56 max-w-full sm:h-11 sm:w-72" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCardSlots.map((slot) => (
          <div key={slot} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 border-b pb-2">
        {tabSlots.map((slot) => (
          <Skeleton key={slot} className="h-9 w-24" />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Table skeleton */}
          <div className="rounded-lg border">
            <div className="p-4 border-b">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="p-4 space-y-3">
              {/* Table header */}
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
              {/* Table rows */}
              {tableRowSlots.map((slot) => (
                <div key={slot} className="flex gap-4 border-t py-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          {/* Quick stats card */}
          <div className="rounded-lg border p-4 space-y-4">
            <Skeleton className="h-5 w-28" />
            <div className="space-y-3">
              {summarySlots.map((slot) => (
                <div key={slot} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity card */}
          <div className="rounded-lg border p-4 space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-3">
              {activitySlots.map((slot) => (
                <div key={slot} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
