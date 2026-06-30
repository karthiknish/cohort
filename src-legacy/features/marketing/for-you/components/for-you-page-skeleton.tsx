'use client';
import { Skeleton } from '@/shared/ui/skeleton';
export function ForYouPageSkeleton() {
    return (<div className="space-y-10">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40"/>
        <Skeleton className="h-8 w-56"/>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-28"/>
        <div className="flex gap-2">
          {['c1', 'c2', 'c3', 'c4'].map((key) => (<Skeleton key={key} className="h-[7.5rem] w-[8.5rem] shrink-0 rounded-xl"/>))}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-24"/>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {['q1', 'q2', 'q3', 'q4'].map((key) => (<Skeleton key={key} className="h-24 rounded-xl"/>))}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-32"/>
        <Skeleton className="h-64 w-full rounded-xl"/>
      </div>
    </div>);
}
