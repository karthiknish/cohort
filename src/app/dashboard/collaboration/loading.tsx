import { Skeleton } from '@/components/ui/skeleton'

const CHANNELS = ['ch-1', 'ch-2', 'ch-3', 'ch-4']
const DMS = ['dm-1', 'dm-2', 'dm-3']
const MESSAGES = ['m-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6']

export default function CollaborationLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Channel sidebar skeleton */}
      <div className="hidden w-64 shrink-0 flex-col border-r bg-muted/20 md:flex">
        {/* Workspace header */}
        <div className="flex h-14 items-center gap-3 border-b px-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Sections */}
        <div className="flex-1 space-y-4 overflow-y-auto p-3">
          {/* Channels section */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-16 mb-2" />
            {CHANNELS.map((id) => (
              <div key={id} className="flex items-center gap-2 rounded-md px-2 py-1.5">
                <Skeleton className="h-4 w-4 shrink-0" />
                <Skeleton className="h-3.5 w-24" />
              </div>
            ))}
          </div>

          {/* Direct Messages section */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-24 mb-2" />
            {DMS.map((id) => (
              <div key={id} className="flex items-center gap-2 rounded-md px-2 py-1.5">
                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main message area skeleton */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Channel header */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {MESSAGES.map((id, idx) => (
            <div key={id} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-3 w-14" />
                </div>
                <Skeleton className={`h-4 ${idx % 2 === 0 ? 'w-[70%]' : 'w-[50%]'}`} />
                {idx % 3 === 0 && <Skeleton className="h-4 w-2/5" />}
              </div>
            </div>
          ))}
        </div>

        {/* Message input skeleton */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
            <Skeleton className="flex-1 h-5" />
            <Skeleton className="h-7 w-7 rounded-md shrink-0" />
          </div>
        </div>
      </div>
    </div>
  )
}
