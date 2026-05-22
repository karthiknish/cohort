import { SocialsPageLoadingFallback } from '@/features/dashboard/socials/components/socials-page-loading-fallback'
import { Skeleton } from '@/shared/ui/skeleton'

export default function SocialsLoading() {
  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-2xl border border-muted/40 p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <Skeleton className="size-12 shrink-0 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
          </div>
          <Skeleton className="h-9 w-44 rounded-xl" />
        </div>
      </div>
      <SocialsPageLoadingFallback />
    </div>
  )
}
