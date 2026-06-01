import Link from 'next/link';
import { memo, startTransition, useCallback, useMemo, useState, ViewTransition } from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { FadeInItem, FadeInStagger } from '@/shared/ui/animate-in';
import { cn } from '@/lib/utils';
import type { SummaryStat } from '@/types/dashboard';
interface StatsCardsProps {
    stats: SummaryStat[];
    loading: boolean;
    primaryCount?: number;
    /** When true, stats render as plain cards without navigation links. */
    linkless?: boolean;
}
export function StatsCards({ stats, loading, primaryCount = 4, linkless = false }: StatsCardsProps) {
    const [expanded, setExpanded] = useState(false);
    const handleToggleExpanded = () => {
        startTransition(() => {
            setExpanded((current) => !current);
        });
    };
    const { visibleStats, hiddenCount } = (() => {
        if (!stats || stats.length === 0) {
            return { visibleStats: [], hiddenCount: 0 };
        }
        const clampedPrimary = Math.max(1, Math.min(primaryCount, stats.length));
        const hasHidden = stats.length > clampedPrimary;
        return {
            visibleStats: expanded || !hasHidden ? stats : stats.slice(0, clampedPrimary),
            hiddenCount: hasHidden ? stats.length - clampedPrimary : 0,
        };
    })();
    return (<div className="space-y-4">
      <FadeInStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleStats.map((stat) => (<FadeInItem key={stat.id}>
            <ViewTransition>
              <StatsCard stat={stat} loading={loading} linkless={linkless}/>
            </ViewTransition>
          </FadeInItem>))}
      </FadeInStagger>

      {hiddenCount > 0 && (<div className="flex justify-center">
          <Button type="button" variant="ghost" size="sm" className="text-primary" onClick={handleToggleExpanded}>
            {expanded ? 'Show less' : `Show more (${hiddenCount})`}
          </Button>
        </div>)}
    </div>);
}
const StatsCard = function StatsCard({ stat, loading, linkless = false, }: {
    stat: SummaryStat;
    loading: boolean;
    linkless?: boolean;
}) {
    const Icon = stat.icon;
    const valueClasses = cn('text-3xl font-bold tracking-tight', !loading && stat.emphasis === 'positive' && 'text-success', !loading && stat.emphasis === 'negative' && 'text-destructive');
    const cardBody = (<Card className={cn('shadow-sm transition-colors', !linkless && stat.href && 'group-hover:border-accent/60 group-hover:shadow-md')}>
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-2">
          <CardDescription className="text-xs font-medium uppercase text-muted-foreground">
            <span className="flex items-center gap-2">
              {stat.urgency && (<span className={cn('size-2.5 rounded-full', getUrgencyDotClass(stat.urgency))} aria-hidden="true" title={`${stat.urgency} urgency`}/>)}
              {stat.label}
            </span>
          </CardDescription>
          <div className={valueClasses}>{loading ? <Skeleton className="h-8 w-20"/> : stat.value}</div>
          <div className="text-xs text-muted-foreground">
            {loading ? <Skeleton className="h-4 w-32"/> : stat.helper}
          </div>
          {!loading && !linkless && stat.href && stat.featureLabel ? (<div className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              {stat.featureLabel}
              <ArrowRight className="size-3.5"/>
            </div>) : null}
        </div>
        <div className="rounded-full bg-info/10 p-3">
          <Icon className="size-6 text-primary"/>
        </div>
      </CardContent>
    </Card>);
    if (!linkless && stat.href) {
        return (<Link href={stat.href} transitionTypes={['nav-forward']} className="group block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        {cardBody}
      </Link>);
    }
    return cardBody;
};
function getUrgencyDotClass(level: SummaryStat['urgency']): string {
    switch (level) {
        case 'high':
            return 'bg-destructive ring-4 ring-destructive/12';
        case 'medium':
            return 'bg-warning ring-4 ring-warning/16';
        case 'low':
            return 'bg-success ring-4 ring-success/14';
        default:
            return 'bg-muted-foreground';
    }
}
