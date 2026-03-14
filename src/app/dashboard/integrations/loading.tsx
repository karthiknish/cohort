import { Skeleton } from '@/shared/ui/skeleton'

const STEPS = ['step-1', 'step-2', 'step-3']
const PLATFORMS = ['platform-1', 'platform-2', 'platform-3']

export default function IntegrationsLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Status / setup progress bar */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          {STEPS.map((id) => (
            <div key={id} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-full shrink-0" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      </div>

      {/* Platform cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((id) => (
          <div key={id} className="rounded-lg border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
