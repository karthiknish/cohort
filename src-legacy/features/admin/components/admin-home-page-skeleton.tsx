'use client';
import { Skeleton } from '@/shared/ui/skeleton';
export function AdminHomePageSkeleton() {
    const linkSlots = ['link-1', 'link-2', 'link-3', 'link-4', 'link-5', 'link-6'];
    return (<div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32"/>
        <Skeleton className="h-4 w-64"/>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Skeleton className="h-4 w-24"/>
        <Skeleton className="h-4 w-24"/>
      </div>

      <div className="divide-y divide-border rounded-lg border border-border">
        {linkSlots.map((slot) => (<div key={slot} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="size-4 shrink-0 rounded"/>
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-28"/>
              <Skeleton className="h-3 w-48"/>
            </div>
            <Skeleton className="size-4 shrink-0"/>
          </div>))}
      </div>
    </div>);
}
