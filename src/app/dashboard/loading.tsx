import { Skeleton } from '@/shared/ui/skeleton'

/**
 * Dashboard loading skeleton for streaming SSR.
 * Shows immediately while the page content is loading.
 */
export default function DashboardLoading() {
  const statCardSlots = ['stat-1', 'stat-2', 'stat-3', 'stat-4']
  const attentionSlots = ['attention-1', 'attention-2', 'attention-3', 'attention-4']
  const comparisonSlots = ['comparison-1', 'comparison-2', 'comparison-3', 'comparison-4']
  const platformSlots = ['platform-1', 'platform-2', 'platform-3']
  const actionSlots = ['action-1', 'action-2', 'action-3', 'action-4']
  const taskSlots = ['task-1', 'task-2', 'task-3']
  const activitySlots = ['activity-1', 'activity-2', 'activity-3', 'activity-4']

  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCardSlots.map((slot) => (
          <div key={slot} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Attention summary skeleton */}
      <div className="rounded-lg border p-4 space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-4">
          {attentionSlots.map((slot) => (
            <Skeleton key={slot} className="h-10 w-24" />
          ))}
        </div>
      </div>

      {/* Main content grid skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance chart skeleton */}
          <div className="rounded-lg border p-4 space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-[300px] w-full" />
          </div>

          {/* Comparison section skeleton */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-9 w-32" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {comparisonSlots.map((slot) => (
                <Skeleton key={slot} className="h-24 w-full" />
              ))}
            </div>
            <div className="rounded-lg border p-4">
              <Skeleton className="h-5 w-48 mb-4" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          </div>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          {/* Platform comparison skeleton */}
          <div className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-2">
              {platformSlots.map((slot) => (
                <Skeleton key={slot} className="h-12 w-full" />
              ))}
            </div>
          </div>

          {/* Quick actions skeleton */}
          <div className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-5 w-28" />
            <div className="grid grid-cols-2 gap-2">
              {actionSlots.map((slot) => (
                <Skeleton key={slot} className="h-10 w-full" />
              ))}
            </div>
          </div>

          {/* Tasks skeleton */}
          <div className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-5 w-24" />
            <div className="space-y-2">
              {taskSlots.map((slot) => (
                <Skeleton key={slot} className="h-16 w-full" />
              ))}
            </div>
          </div>

          {/* Activity skeleton */}
          <div className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
              {activitySlots.map((slot) => (
                <Skeleton key={slot} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
