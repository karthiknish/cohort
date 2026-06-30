'use client';
import { Activity, ArrowUpRight, CalendarRange, DollarSign, Sparkles, TrendingUp, Users } from 'lucide-react';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import type { GoogleAnalyticsStory } from '../lib/google-analytics-story';
function formatDeltaLabel(deltaPercent: number | null, direction: GoogleAnalyticsStory['deltas']['users']['direction']) {
    if (direction === 'new')
        return 'New in range';
    if (deltaPercent == null)
        return 'No prior data';
    return `${deltaPercent > 0 ? '+' : ''}${deltaPercent.toFixed(1)}% vs previous`;
}
function formatDayLabel(value: string | null | undefined) {
    if (!value)
        return 'Not enough data';
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
const HIGHLIGHT_CARD = 'rounded-lg border border-border/60 bg-muted/30 p-4';
const HIGHLIGHT_LABEL = 'mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground';
export function AnalyticsDeepDiveSection({ story, formatRevenue, hasRevenue, }: {
    story: GoogleAnalyticsStory;
    formatRevenue: (amount: number | null | undefined) => string;
    hasRevenue: boolean;
}) {
    const momentumVariant = story.momentum === 'up' ? 'success' : story.momentum === 'down' ? 'warning' : 'secondary';
    const deltaItems = [
        { key: 'users', label: 'Users', icon: Users, delta: story.deltas.users },
        { key: 'sessions', label: 'Sessions', icon: Activity, delta: story.deltas.sessions },
        { key: 'conversions', label: 'Conversions', icon: TrendingUp, delta: story.deltas.conversions },
        ...(hasRevenue ? [{ key: 'revenue' as const, label: 'Revenue', icon: DollarSign, delta: story.deltas.revenue }] : []),
    ];
    return (<div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className={DASHBOARD_THEME.cards.base}>
        <CardHeader className={DASHBOARD_THEME.cards.header}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">Performance context</CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                How this property behaved over the selected range.
              </CardDescription>
            </div>
            <Badge variant={momentumVariant}>
              {story.momentum === 'up' ? 'Momentum up' : story.momentum === 'down' ? 'Momentum mixed' : 'Momentum steady'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-2 md:grid-cols-2">
          {deltaItems.map((item) => (<div key={item.key} className={HIGHLIGHT_CARD}>
              <div className={HIGHLIGHT_LABEL}>
                <item.icon className="size-3.5"/>
                {item.label}
              </div>
              <p className="text-sm font-semibold text-foreground">
                {formatDeltaLabel(item.delta.deltaPercent, item.delta.direction)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Previous range:{' '}
                {item.key === 'revenue' ? formatRevenue(item.delta.previous) : item.delta.previous.toLocaleString()}
              </p>
            </div>))}
        </CardContent>
      </Card>

      <Card className={DASHBOARD_THEME.cards.base}>
        <CardHeader className={DASHBOARD_THEME.cards.header}>
          <CardTitle className="text-sm font-semibold text-foreground">Highlights</CardTitle>
          <CardDescription className="mt-1 text-sm text-muted-foreground">
            Best days and data coverage for this Google Analytics property.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={HIGHLIGHT_CARD}>
              <div className={HIGHLIGHT_LABEL}>
                <CalendarRange className="size-3.5"/>
                Coverage
              </div>
              <p className="text-lg font-semibold text-foreground">{Math.round(story.coverageRatio * 100)}%</p>
              <p className="text-xs text-muted-foreground">{story.activeDays} active day(s) in range</p>
            </div>
            <div className={HIGHLIGHT_CARD}>
              <div className={HIGHLIGHT_LABEL}>
                <ArrowUpRight className="size-3.5"/>
                Peak sessions
              </div>
              <p className="text-lg font-semibold text-foreground">
                {story.topSessionsDay?.sessions.toLocaleString() ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground">{formatDayLabel(story.topSessionsDay?.date)}</p>
            </div>
            {hasRevenue ? (<div className={HIGHLIGHT_CARD}>
              <div className={HIGHLIGHT_LABEL}>
                <Sparkles className="size-3.5"/>
                Peak revenue
              </div>
              <p className="text-lg font-semibold text-foreground">
                {story.topRevenueDay ? formatRevenue(story.topRevenueDay.revenue) : '—'}
              </p>
              <p className="text-xs text-muted-foreground">{formatDayLabel(story.topRevenueDay?.date)}</p>
            </div>) : (<div className={HIGHLIGHT_CARD}>
              <div className={HIGHLIGHT_LABEL}>
                <Users className="size-3.5"/>
                Peak users
              </div>
              <p className="text-lg font-semibold text-foreground">
                {story.topUsersDay?.users.toLocaleString() ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground">{formatDayLabel(story.topUsersDay?.date)}</p>
            </div>)}
          </div>
          <div className={HIGHLIGHT_CARD}>
            <div className={HIGHLIGHT_LABEL}>Top conversion day</div>
            <p className="text-sm font-semibold text-foreground">
              {story.topConversionDay?.conversions.toLocaleString() ?? '—'} conversions on{' '}
              {formatDayLabel(story.topConversionDay?.date)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use this day as a reference when comparing landing pages, campaigns, or acquisition sources.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>);
}
