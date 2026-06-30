'use client';
import { Link } from '@/shared/ui/link';
import { BellOff, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
type NotificationEmptyStateProps = {
    filterLabel?: string;
    className?: string;
};
export function NotificationEmptyState({ filterLabel, className }: NotificationEmptyStateProps) {
    const title = filterLabel ? `No ${filterLabel} notifications` : 'You’re all caught up';
    return (<div className={cn('flex flex-col items-center justify-center gap-4 px-6 py-14 text-center', className)}>
      <div className="flex size-12 items-center justify-center rounded-xl border border-border/60 bg-muted/25 text-muted-foreground shadow-sm">
        <BellOff className="size-6" aria-hidden/>
      </div>
      <div className="space-y-1.5">
        <p className="text-base font-medium text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          When something needs your attention, it will show up here and in the bell menu.
        </p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link href="/settings?tab=notifications">
          <Settings2 className="mr-2 size-4" aria-hidden/>
          Notification settings
        </Link>
      </Button>
    </div>);
}
