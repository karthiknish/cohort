'use client';
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/shared/ui/skeleton';
export function CreativeDetailPageLoadingState() {
    return (<div className={ADS_PAGE_THEME.innerContainer}>
      <div className={cn(ADS_PAGE_THEME.innerHero, 'space-y-4')}>
        <Skeleton className="size-10 rounded-xl"/>
        <Skeleton className="h-8 w-64 max-w-full rounded-lg"/>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Skeleton className="aspect-square rounded-3xl"/>
        </div>
        <div className="space-y-4 lg:col-span-7">
          <Skeleton className="h-[400px] rounded-2xl"/>
        </div>
      </div>
    </div>);
}
