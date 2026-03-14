import { Skeleton } from '@/shared/ui/skeleton'

const ROOMS = ['room-1', 'room-2', 'room-3', 'room-4', 'room-5', 'room-6']
const AVATARS = ['av-1', 'av-2', 'av-3']

export default function MeetingsLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* Integration status banner */}
      <div className="flex items-center gap-3 rounded-lg border p-4">
        <Skeleton className="h-5 w-5 rounded-full shrink-0" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="ml-auto h-8 w-24 rounded-md" />
      </div>

      {/* Rooms grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ROOMS.map((id) => (
          <div key={id} className="rounded-lg border p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {AVATARS.map((avId) => (
                  <Skeleton key={avId} className="h-7 w-7 rounded-full ring-2 ring-background" />
                ))}
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
