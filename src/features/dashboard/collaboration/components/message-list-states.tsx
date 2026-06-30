'use client';
import type { ReactNode } from 'react';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { FadeIn } from '@/shared/ui/animate-in';
import { Separator } from '@/shared/ui/separator';
import { cn } from '@/lib/utils';

export function MessageListLoadingState({ loadingSkeleton }: {
    loadingSkeleton?: ReactNode;
}) {
    const loadingRowSlots = ['loading-row-1', 'loading-row-2', 'loading-row-3'] as const;
    return (<div className="flex-1 min-h-0 overflow-y-auto p-4">
      {loadingSkeleton || (<div className="space-y-4">
          {loadingRowSlots.map((slot, index) => (<div key={slot} className={cn('flex gap-2 rounded-lg border border-muted/20 p-2', index % 2 === 1 && 'justify-end')}>
              <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted"/>
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted"/>
                <div className="h-16 w-48 animate-pulse rounded-lg bg-muted"/>
              </div>
            </div>))}
        </div>)}
    </div>);
}

export function MessageListEmptyState({ emptyState }: {
    emptyState?: ReactNode;
}) {
    return (<div className="flex-1 min-h-0 overflow-y-auto p-4">
      {emptyState || (<div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No messages yet</p>
        </div>)}
    </div>);
}

export function MessageListLoadMoreButton({ disabled, isLoading, onLoadMore, }: {
    disabled: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
}) {
    return (<div className="flex justify-center pb-4">
      <Button variant="ghost" size="sm" onClick={onLoadMore} disabled={disabled}>
        {isLoading ? (<>
            <LoaderCircle className="mr-2 size-3.5 animate-spin"/>
            Loading…
          </>) : (<>
            <RefreshCw className="mr-2 size-3.5"/>
            Load older messages
          </>)}
      </Button>
    </div>);
}

export function MessageDateSeparator({ date }: {
    date: string;
}) {
    return (<FadeIn y={6} duration={0.18}>
      <div className="mb-4 flex items-center gap-2">
        <Separator className="flex-1"/>
        <span className="text-xs font-medium text-muted-foreground">{date}</span>
        <Separator className="flex-1"/>
      </div>
    </FadeIn>);
}
