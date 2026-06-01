'use client';
import { Skeleton } from '@/shared/ui/skeleton';
export function MarketingLegalPageSkeleton() {
    const sectionSlots = ['section-1', 'section-2', 'section-3', 'section-4', 'section-5'];
    return (<div className="mx-auto max-w-4xl space-y-8 px-6 py-12 md:py-20">
      <div className="space-y-4">
        <Skeleton className="h-4 w-28"/>
        <Skeleton className="h-10 w-64 max-w-full"/>
        <Skeleton className="h-4 w-40"/>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 shadow-xl shadow-black/[0.04]">
        <div className="border-b bg-muted/30 px-8 py-8">
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-2xl"/>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48"/>
              <Skeleton className="h-4 w-80 max-w-full"/>
            </div>
          </div>
        </div>
        <div className="space-y-0 p-8">
          {sectionSlots.map((slot) => (<div key={slot} className="border-b border-border/40 py-6 last:border-0">
              <Skeleton className="h-5 w-40"/>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-full"/>
                <Skeleton className="h-4 w-full"/>
                <Skeleton className="h-4 w-5/6"/>
              </div>
            </div>))}
        </div>
      </div>
    </div>);
}
