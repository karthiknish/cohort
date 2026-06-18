'use client';
import { useCallback } from 'react';
import { Link } from '@/shared/ui/link';
import { Filter, Info, X } from 'lucide-react';
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme';
import { FadeInItem, FadeInStagger } from '@/shared/ui/animate-in';
import { SvglExcelIcon } from '@/shared/components/svgl-brand-logo';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/shared/ui/dropdown-menu';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { PerformanceChart } from '@/features/dashboard/home/components/performance-chart';
import { cn } from '@/lib/utils';
import type { MetricRecord, SummaryCard } from './types';
import { DateRangePicker, type DateRange } from './date-range-picker';
import { getProviderIcon, formatProviderName } from './utils';
import { adsMetricsEmptyCopy, type AdsMetricsDisplayState, } from './ads-metrics-display-state';
function ProviderFilterOption({ providerId, selectedProviders, onToggleProvider, }: {
    providerId: string;
    selectedProviders: string[];
    onToggleProvider: (providerId: string) => void;
}) {
    const ProviderIcon = getProviderIcon(providerId);
    const handleCheckedChange = () => {
        onToggleProvider(providerId);
    };
    return (<DropdownMenuCheckboxItem checked={selectedProviders.includes(providerId)} onCheckedChange={handleCheckedChange}>
      <span className="flex items-center gap-2">
        {ProviderIcon ? <ProviderIcon className="size-4"/> : null}
        {formatProviderName(providerId)}
      </span>
    </DropdownMenuCheckboxItem>);
}
function SelectedProviderChip({ providerId, onToggleProvider, }: {
    providerId: string;
    onToggleProvider: (providerId: string) => void;
}) {
    const handleRemove = () => {
        onToggleProvider(providerId);
    };
    return (<Badge key={providerId} variant="secondary" className="gap-1 rounded-full border border-border/50 px-2.5">
      {formatProviderName(providerId)}
      <button type="button" onClick={handleRemove} className="ml-0.5 rounded-full p-0.5 hover:bg-muted hover:text-foreground" aria-label={`Remove ${formatProviderName(providerId)} filter`}>
        <X className="size-3" aria-hidden/>
      </button>
    </Badge>);
}
export function CrossChannelOverviewHeader({ availableProviders, dateRange, hasMetricData, hasProviderFilter, onDateRangeChange, onExport, onToggleProvider, selectedProviders, showDateAndExport = true, }: {
    availableProviders: string[];
    dateRange: DateRange;
    hasMetricData: boolean;
    hasProviderFilter: boolean;
    onDateRangeChange: (range: DateRange) => void;
    onExport: () => void;
    onToggleProvider: (providerId: string) => void;
    selectedProviders: string[];
    showDateAndExport?: boolean;
}) {
    return (<CardHeader className="flex flex-col gap-3 border-b border-border/50 pb-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className={ADS_PAGE_THEME.sectionEyebrow}>Overview</p>
          <CardTitle className="text-lg font-semibold tracking-tight">Cross-channel KPIs</CardTitle>
          <CardDescription className="max-w-xl text-pretty leading-relaxed">
            Totals and trends from your latest successful sync - filter by platform without leaving this view.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {availableProviders.length > 0 ? (<DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl border-border/70">
                  <Filter className="size-4" aria-hidden/>
                  Providers
                  {hasProviderFilter ? (<Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                      {selectedProviders.length}
                    </Badge>) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by Provider</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableProviders.map((providerId) => (<ProviderFilterOption key={providerId} providerId={providerId} selectedProviders={selectedProviders} onToggleProvider={onToggleProvider}/>))}
              </DropdownMenuContent>
            </DropdownMenu>) : null}
          {showDateAndExport ? (<>
              <DateRangePicker value={dateRange} onChange={onDateRangeChange}/>
              <Button variant="outline" size="icon" onClick={onExport} disabled={!hasMetricData} aria-label="Export metrics as Excel">
                <SvglExcelIcon className="size-4"/>
              </Button>
            </>) : null}
        </div>
      </div>
      {hasProviderFilter ? (<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Showing:</span>
          {selectedProviders.map((providerId) => (<SelectedProviderChip key={providerId} providerId={providerId} onToggleProvider={onToggleProvider}/>))}
        </div>) : null}
    </CardHeader>);
}
export function CrossChannelOverviewLoadingState() {
    return (<CardContent className="space-y-6 pt-6">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((slot) => (<Skeleton key={slot} className="h-28 w-full rounded-2xl"/>))}
      </div>
      <Skeleton className="h-[300px] w-full rounded-2xl"/>
    </CardContent>);
}
export function CrossChannelOverviewEmptyState({ displayState = 'needs_connection', }: {
    displayState?: Exclude<AdsMetricsDisplayState, 'loading' | 'has_delivery'>;
}) {
    const copy = displayState === 'needs_sync' || displayState === 'synced_no_delivery'
        ? adsMetricsEmptyCopy(displayState)
        : adsMetricsEmptyCopy('needs_connection');
    return (<CardContent className="pt-6">
      <div className={ADS_PAGE_THEME.emptyState}>
        <p className="text-sm font-medium text-foreground">{copy.title}</p>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{copy.description}</p>
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link href={copy.actionHref}>{copy.actionLabel}</Link>
        </Button>
      </div>
    </CardContent>);
}
function CrossChannelOverviewStatusBanner({ displayState, }: {
    displayState: AdsMetricsDisplayState;
}) {
    if (displayState !== 'synced_no_delivery' && displayState !== 'needs_sync') {
        return null;
    }
    const copy = adsMetricsEmptyCopy(displayState);
    return (<div className="rounded-2xl border border-warning/20 bg-warning/5 px-4 py-3 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">{copy.title}</p>
      <p className="mt-1 leading-relaxed">{copy.description}</p>
    </div>);
}
function SummaryCardTile({ card }: {
    card: SummaryCard;
}) {
    return (<FadeInItem>
      <div className={ADS_PAGE_THEME.kpiTile}>
        <div className="flex items-start justify-between gap-2">
          <p className={ADS_PAGE_THEME.kpiLabel}>{card.label}</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger aria-label={`Metric information: ${card.helper}`}>
                <Info className="size-3.5 text-muted-foreground/70" aria-hidden/>
              </TooltipTrigger>
              <TooltipContent>
                <p>{card.helper}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className={cn(ADS_PAGE_THEME.kpiValue, 'mt-2')}>{card.value}</p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{card.helper}</p>
      </div>
    </FadeInItem>);
}
export function CrossChannelOverviewContent({ currency, chartMetrics, metricsLoading, summaryCards, hasAggregateChartFallback = false, hasConnectedAds = false, displayState = 'has_delivery', }: {
    currency?: string;
    chartMetrics: MetricRecord[];
    metricsLoading: boolean;
    summaryCards: SummaryCard[];
    hasAggregateChartFallback?: boolean;
    hasConnectedAds?: boolean;
    displayState?: AdsMetricsDisplayState;
}) {
    return (<CardContent className="space-y-6 pt-6">
      <CrossChannelOverviewStatusBanner displayState={displayState}/>
      <FadeInStagger className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (<SummaryCardTile key={card.id} card={card}/>))}
      </FadeInStagger>
      <div className="h-[300px] w-full min-w-0 rounded-2xl border border-border/50 bg-muted/15 p-3 sm:p-4">
        <PerformanceChart metrics={chartMetrics} loading={metricsLoading} currency={currency} dataSource="ads" hasAggregateData={hasAggregateChartFallback} adsAccountConnected={hasConnectedAds} metricsDisplayState={displayState}/>
      </div>
    </CardContent>);
}
