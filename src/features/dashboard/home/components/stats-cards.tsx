import { Link } from '@/shared/ui/link';
import { startTransition, useState } from 'react';
import { ViewTransition } from '@/shared/ui/view-transition';
import { ArrowRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
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

export function StatsCards({
  stats,
  loading,
  primaryCount = 4,
  linkless = false,
}: StatsCardsProps) {
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
      visibleStats:
        expanded || !hasHidden ? stats : stats.slice(0, clampedPrimary),
      hiddenCount: hasHidden ? stats.length - clampedPrimary : 0,
    };
  })();
  return (
    <div className="space-y-4">
      <FadeInStagger className="grid grid-cols-1 gap-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {visibleStats.map((stat) => (
          <FadeInItem key={stat.id}>
            <ViewTransition>
              <StatsCard stat={stat} loading={loading} linkless={linkless} />
            </ViewTransition>
          </FadeInItem>
        ))}
      </FadeInStagger>

      {hiddenCount > 0 && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={handleToggleExpanded}
          >
            {expanded ? 'Show less' : `Show more (${hiddenCount})`}
          </Button>
        </div>
      )}
    </div>
  );
}

const TrendIcon = {
  positive: TrendingUp,
  negative: TrendingDown,
  neutral: Minus,
} as const;

const TrendBadge = function TrendBadge({
  emphasis,
  loading,
}: {
  emphasis?: SummaryStat['emphasis'];
  loading: boolean;
}) {
  if (loading || !emphasis) return null;
  const Icon = TrendIcon[emphasis] ?? Minus;
  const tone =
    emphasis === 'positive'
      ? 'text-success border-success/30 bg-success/10'
      : emphasis === 'negative'
        ? 'text-destructive border-destructive/30 bg-destructive/10'
        : 'text-muted-foreground border-muted-foreground/30 bg-muted/40';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums',
        tone,
      )}
    >
      <Icon className="size-3" aria-hidden />
    </span>
  );
};

const StatsCard = function StatsCard({
  stat,
  loading,
  linkless = false,
}: {
  stat: SummaryStat;
  loading: boolean;
  linkless?: boolean;
}) {
  const Icon = stat.icon;
  const cardBody = (
    <Card
      data-slot="card"
      className={cn(
        '@container/card transition-colors',
        !linkless &&
          stat.href &&
          'group-hover:border-accent/60 group-hover:shadow-md',
      )}
    >
      <CardHeader>
        <CardDescription className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
          {stat.urgency && (
            <span
              className={cn('size-2.5 rounded-full', getUrgencyDotClass(stat.urgency))}
              aria-hidden="true"
              title={`${stat.urgency} urgency`}
            />
          )}
          {stat.label}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums tracking-tight @[250px]/card:text-3xl">
          {loading ? <Skeleton className="h-8 w-20" /> : stat.value}
        </CardTitle>
        <CardAction>
          <TrendBadge emphasis={stat.emphasis} loading={loading} />
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex items-center gap-2 font-medium">
          {loading ? (
            <Skeleton className="h-4 w-28" />
          ) : (
            <>
              <Icon className="size-4 text-primary" aria-hidden />
              <span className="truncate">{stat.helper}</span>
            </>
          )}
        </div>
        {!loading && !linkless && stat.href && stat.featureLabel ? (
          <div className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            {stat.featureLabel}
            <ArrowRight className="size-3.5" />
          </div>
        ) : null}
      </CardFooter>
    </Card>
  );
  if (!linkless && stat.href) {
    return (
      <Link
        href={stat.href}
        transitionTypes={['nav-forward']}
        className="group block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {cardBody}
      </Link>
    );
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
