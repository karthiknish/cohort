'use client';
import { Skeleton } from '@/shared/ui/skeleton';
export function AdminTablePageSkeleton() {
    const statSlots = ['stat-1', 'stat-2', 'stat-3', 'stat-4'];
    const filterSlots = ['filter-1', 'filter-2', 'filter-3'];
    const rowSlots = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6'];
    return (<div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48"/>
        <Skeleton className="h-4 w-96 max-w-full"/>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statSlots.map((slot) => (<div key={slot} className="rounded-lg border border-border/60 bg-card p-5">
            <Skeleton className="h-4 w-28"/>
            <Skeleton className="mt-3 h-8 w-16"/>
            <Skeleton className="mt-2 h-3 w-40"/>
          </div>))}
      </div>

      <div className="flex flex-wrap gap-2">
        {filterSlots.map((slot) => (<Skeleton key={slot} className="h-10 w-36 rounded-md"/>))}
        <Skeleton className="ml-auto h-10 w-28 rounded-md"/>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/60">
        <div className="border-b border-border/60 bg-muted/20 px-4 py-3">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32"/>
            <Skeleton className="h-4 w-24"/>
            <Skeleton className="h-4 w-28"/>
            <Skeleton className="ml-auto h-4 w-20"/>
          </div>
        </div>
        <div className="divide-y divide-border/60">
          {rowSlots.map((slot) => (<div key={slot} className="flex items-center gap-4 px-4 py-4">
              <Skeleton className="size-9 rounded-full"/>
              <Skeleton className="h-4 w-40"/>
              <Skeleton className="h-4 w-24"/>
              <Skeleton className="ml-auto h-8 w-20 rounded-md"/>
            </div>))}
        </div>
      </div>
    </div>);
}
