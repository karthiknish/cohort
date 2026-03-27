import { Skeleton } from '@/shared/ui/skeleton'

/**
 * Projects page loading skeleton for streaming SSR.
 */
export default function ProjectsLoading() {
  const cardSlots = ['card-1', 'card-2', 'card-3', 'card-4', 'card-5', 'card-6']
  const avatarSlots = ['avatar-1', 'avatar-2', 'avatar-3']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Projects grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cardSlots.map((slot) => (
          <div key={slot} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex -space-x-2">
                {avatarSlots.map((slot) => (
                  <Skeleton key={slot} className="h-7 w-7 rounded-full border-2 border-background" />
                ))}
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
