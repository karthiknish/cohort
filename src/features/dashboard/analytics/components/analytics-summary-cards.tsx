'use client';
import { Activity, DollarSign, Info, Minus, TrendingDown, TrendingUp, Users, type LucideIcon } from 'lucide-react';
import { DASHBOARD_THEME, getIconContainerClasses } from '@/lib/dashboard-theme';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/shared/ui/tooltip';
import type { MetricDelta } from '../lib/google-analytics-story';
interface AnalyticsSummaryCardsProps {
    totals: {
        users: number;
        sessions: number;
        revenue: number | null;
        conversions: number;
    };
    deltas: {
        users: MetricDelta;
        sessions: MetricDelta;
        conversions: MetricDelta;
        revenue: MetricDelta;
    };
    formatRevenue: (amount: number | null | undefined) => string;
    isLoading: boolean;
}
function formatDeltaLabel(delta: MetricDelta): string | null {
    if (delta.direction === 'new')
        return 'New in period';
    if (delta.deltaPercent == null)
        return null;
    return `${delta.deltaPercent > 0 ? '+' : ''}${delta.deltaPercent.toFixed(1)}%`;
}
function DeltaBadge({ delta }: {
    delta: MetricDelta;
}) {
    const label = formatDeltaLabel(delta);
    if (!label) {
        return <span className="text-xs text-muted-foreground">vs previous period</span>;
    }
    const isUp = delta.direction === 'up' || delta.direction === 'new';
    const isDown = delta.direction === 'down';
    const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
    return (<span className={cn('inline-flex items-center gap-1 text-xs font-semibold', isUp && 'text-success', isDown && 'text-destructive', !isUp && !isDown && 'text-muted-foreground')}>
      <Icon className="size-3.5" aria-hidden/>
      {label}
      <span className="font-normal text-muted-foreground">vs previous period</span>
    </span>);
}
function SummaryStatCard({ label, tooltip, value, delta, icon: Icon, isLoading, }: {
    label: string;
    tooltip: string;
    value: string;
    delta: MetricDelta;
    icon: LucideIcon;
    isLoading: boolean;
}) {
    return (<Card className={DASHBOARD_THEME.stats.card}>
      <CardHeader className="flex flex-row items-start justify-between gap-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className={DASHBOARD_THEME.stats.label}>{label}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="size-3.5 text-muted-foreground/60 transition-colors hover:text-primary"/>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className={cn(getIconContainerClasses('small'), 'size-9 rounded-lg')}>
          <Icon className="size-4"/>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (<>
            <Skeleton className="h-8 w-24 rounded-md"/>
            <Skeleton className="h-3 w-32 rounded-md"/>
          </>) : (<>
            <div className={DASHBOARD_THEME.stats.value}>{value}</div>
            <DeltaBadge delta={delta}/>
          </>)}
      </CardContent>
    </Card>);
}
export function AnalyticsSummaryCards({ totals, deltas, formatRevenue, isLoading }: AnalyticsSummaryCardsProps) {
    return (<div className={DASHBOARD_THEME.stats.container}>
      <SummaryStatCard label="Total users" tooltip="Unique users in Google Analytics for the selected period, compared with the prior period of equal length." value={totals.users.toLocaleString()} delta={deltas.users} icon={Users} isLoading={isLoading}/>
      <SummaryStatCard label="Sessions" tooltip="Total sessions in the selected range. Sessions can exceed users when people return multiple times." value={totals.sessions.toLocaleString()} delta={deltas.sessions} icon={Activity} isLoading={isLoading}/>
      <SummaryStatCard label="Conversions" tooltip="Completed conversion events imported from your connected Google Analytics property." value={totals.conversions.toLocaleString()} delta={deltas.conversions} icon={TrendingUp} isLoading={isLoading}/>
      <SummaryStatCard label="Revenue" tooltip="Revenue attributed in Google Analytics for the selected period." value={formatRevenue(totals.revenue)} delta={deltas.revenue} icon={DollarSign} isLoading={isLoading}/>
    </div>);
}
