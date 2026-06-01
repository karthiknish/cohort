'use client';
import { BarChart3, Download, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme';
import { formatProviderName } from '@/lib/themes';
import { normalizeAdsProviderId } from '@/domain/ads/provider';
import { listItemEnterClass } from '@/lib/motion';
import { MotionCard } from '@/shared/ui/motion-primitives';
import { EN_US_NUMBER_FORMATTER } from '@/lib/intl/formatters';
import { cn, formatCurrency } from '@/lib/utils';
import type { ProviderSummary } from './types';
import { getProviderIcon } from '../constants';
function formatNumber(value: number): string {
    return EN_US_NUMBER_FORMATTER.format(value);
}
interface PerformanceSummaryCardProps {
    providerSummaries: Record<string, ProviderSummary>;
    currency?: string;
    providerCurrencies?: Record<string, string>;
    hasMetrics: boolean;
    initialMetricsLoading: boolean;
    metricsLoading: boolean;
    metricError: string | null;
    onRefresh: () => void;
    onExport: () => void;
    title?: string;
    description?: string;
    emptyMessage?: string;
    emptyCtaLabel?: string;
    emptyCtaHref?: string;
    showActions?: boolean;
}
export function PerformanceSummaryCard({ providerSummaries, currency = 'USD', providerCurrencies, hasMetrics, initialMetricsLoading, metricsLoading, metricError, onRefresh, onExport, title = 'Ad performance summary', description = 'Aggregated spend, clicks, and conversions over the last synced period', emptyMessage = 'No synced performance data yet. Connect an ad platform and run a sync to populate these insights.', emptyCtaLabel = 'Run first sync', emptyCtaHref = '#connect-ad-platforms', showActions = true, }: PerformanceSummaryCardProps) {
    return (<MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <CardHeader className="flex flex-col gap-4 border-b border-border/50 pb-5 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <p className={ADS_PAGE_THEME.sectionEyebrow}>By platform</p>
          <CardTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight">
            <div className="flex size-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
              <BarChart3 className="size-5 text-primary" aria-hidden/>
            </div>
            {title}
          </CardTitle>
          <CardDescription className="max-w-xl text-pretty leading-relaxed">
            {description}
          </CardDescription>
        </div>
        {showActions ? (<div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={metricsLoading} className="h-10 px-4 inline-flex items-center gap-2 motion-chromatic hover:shadow-md">
              <RefreshCw className={cn('size-4', metricsLoading && 'animate-spin')}/>
              Refresh
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onExport} className="h-10 px-4 inline-flex items-center gap-2 motion-chromatic hover:shadow-md">
              <Download className="size-4"/>
              Export Excel
            </Button>
          </div>) : null}
      </CardHeader>
      <CardContent className="pt-6">
        {initialMetricsLoading ? (<div className="grid gap-4 md:grid-cols-3">
            {['summary-skeleton-1', 'summary-skeleton-2', 'summary-skeleton-3'].map((key) => (<Skeleton key={key} className="h-40 w-full rounded-2xl"/>))}
          </div>) : metricError ? (<Alert variant="destructive" className="rounded-2xl">
            <AlertTitle>Unable to load metrics</AlertTitle>
            <AlertDescription>{metricError}</AlertDescription>
          </Alert>) : !hasMetrics ? (<div className={ADS_PAGE_THEME.emptyState}>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border/50">
              <BarChart3 className="size-6 text-muted-foreground/60" aria-hidden/>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{emptyMessage}</p>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href={emptyCtaHref}>{emptyCtaLabel}</Link>
            </Button>
          </div>) : (<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(providerSummaries).map(([providerId, summary], index) => {
                const providerCurrency = providerCurrencies?.[normalizeAdsProviderId(providerId) ?? providerId] ?? currency;
                const ctr = summary.impressions > 0 ? (summary.clicks / summary.impressions) * 100 : null;
                const cpc = summary.clicks > 0 ? summary.spend / summary.clicks : null;
                const cpa = summary.conversions > 0 ? summary.spend / summary.conversions : null;
                const roas = summary.spend > 0 && Number.isFinite(summary.revenue) ? summary.revenue / summary.spend : null;
                const ProviderIcon = getProviderIcon(providerId);
                const dynamicStats = [
                    { id: 'impressions', label: 'Impressions', value: formatNumber(summary.impressions) },
                    { id: 'clicks', label: 'Clicks', value: formatNumber(summary.clicks) },
                    { id: 'conversions', label: 'Conversions', value: formatNumber(summary.conversions) },
                    { id: 'ctr', label: 'CTR', value: ctr !== null ? `${ctr.toFixed(2)}%` : '—' },
                    { id: 'avg-cpc', label: 'Avg CPC', value: cpc !== null ? formatCurrency(cpc, providerCurrency) : '—' },
                    { id: 'cpa', label: 'CPA', value: cpa !== null ? formatCurrency(cpa, providerCurrency) : '—' },
                    { id: 'roas', label: 'ROAS', value: roas !== null ? `${roas.toFixed(2)}x` : '—' },
                ];
                return (<div key={providerId} className={listItemEnterClass}>
                  <Card className={cn(ADS_PAGE_THEME.providerTile, 'motion-chromatic-lg')}>
                    <CardHeader className="border-b border-border/40 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
                          {ProviderIcon ? (<ProviderIcon className="size-4 text-primary" aria-hidden/>) : (<BarChart3 className="size-4 text-primary" aria-hidden/>)}
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">
                            {formatProviderName(providerId)}
                          </CardTitle>
                          <CardDescription className="text-xs">Since last sync</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div>
                        <div className={ADS_PAGE_THEME.kpiLabel}>Total spend</div>
                        <div className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
                          {formatCurrency(summary.spend, providerCurrency)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {dynamicStats.map((stat) => (<div key={stat.id} className="rounded-xl border border-border/50 bg-muted/20 px-2.5 py-2">
                            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {stat.label}
                            </div>
                            <div className="mt-0.5 text-sm font-semibold tabular-nums">{stat.value}</div>
                          </div>))}
                      </div>
                    </CardContent>
                  </Card>
                </div>);
            })}
          </div>)}
      </CardContent>
    </MotionCard>);
}
