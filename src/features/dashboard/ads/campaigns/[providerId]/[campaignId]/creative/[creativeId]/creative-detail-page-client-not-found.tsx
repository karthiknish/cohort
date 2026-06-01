'use client';
import Link from 'next/link';
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
export function CreativeDetailPageNotFoundState({ backUrl }: {
    backUrl: string;
}) {
    return (<div className={ADS_PAGE_THEME.innerContainer}>
      <div className={cn(ADS_PAGE_THEME.emptyState, 'mx-auto max-w-md py-16')}>
        <p className="text-lg font-semibold text-foreground">Creative not found</p>
        <p className="text-sm text-muted-foreground">This asset may have been removed on the ad platform.</p>
        <Button asChild variant="outline" className="mt-2 rounded-full">
          <Link href={backUrl}>Back to campaign</Link>
        </Button>
      </div>
    </div>);
}
