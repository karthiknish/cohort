import { Skeleton } from '@/components/ui/skeleton'

const TABS = ['tab-all', 'tab-unread', 'tab-mentions', 'tab-system']
const ROWS = ['n-1', 'n-2', 'n-3', 'n-4', 'n-5', 'n-6', 'n-7', 'n-8']

export default function NotificationsLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="grid w-full grid-cols-4 rounded-md bg-muted p-1">
        {TABS.map((id) => (
          <Skeleton key={id} className="h-8 rounded-sm" />
        ))}
      </div>

      {/* Notification list card */}
      <div className="rounded-lg border">
        <div className="border-b p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-1 h-3 w-56" />
        </div>
        <div className="p-4 space-y-3">
          {ROWS.map((id) => (
            <div key={id} className="flex items-start gap-4 rounded-lg border p-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-10 rounded-full" />
                </div>
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
