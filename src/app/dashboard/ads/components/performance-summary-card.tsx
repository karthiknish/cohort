'use client'

import { BarChart3, Download, RefreshCw } from 'lucide-react'
import Link from 'next/link'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatProviderName, normalizeProviderId } from '@/lib/themes'
import { cn, formatCurrency } from '@/lib/utils'

import type { ProviderSummary } from './types'

interface PerformanceSummaryCardProps {
  providerSummaries: Record<string, ProviderSummary>
  currency?: string
  providerCurrencies?: Record<string, string>
  hasMetrics: boolean
  initialMetricsLoading: boolean
  metricsLoading: boolean
  metricError: string | null
  onRefresh: () => void
  onExport: () => void
  title?: string
  description?: string
  emptyMessage?: string
  emptyCtaLabel?: string
  emptyCtaHref?: string
}

export function PerformanceSummaryCard({
  providerSummaries,
  currency = 'USD',
  providerCurrencies,
  hasMetrics,
  initialMetricsLoading,
  metricsLoading,
  metricError,
  onRefresh,
  onExport,
  title = 'Ad performance summary',
  description = 'Aggregated spend, clicks, and conversions over the last synced period',
  emptyMessage = 'No synced performance data yet. Connect an ad platform and run a sync to populate these insights.',
  emptyCtaLabel = 'Run first sync',
  emptyCtaHref = '#connect-ad-platforms',
}: PerformanceSummaryCardProps) {
  const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value)

  return (
    <Card className="overflow-hidden border-muted/60 shadow-sm">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between pb-4">
        <div className="flex flex-col gap-2">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-muted/60 bg-muted/30">
              <BarChart3 className="h-5 w-5 text-foreground" />
            </div>
            {title}
          </CardTitle>
          <CardDescription className="text-sm">
            {description}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={metricsLoading}
            className="h-10 px-4 inline-flex items-center gap-2 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none hover:shadow-md"
          >
            <RefreshCw className={cn('h-4 w-4', metricsLoading && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-10 px-4 inline-flex items-center gap-2 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none hover:shadow-md"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {initialMetricsLoading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {['summary-skeleton-1', 'summary-skeleton-2', 'summary-skeleton-3'].map((key) => (
              <Skeleton key={key} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        ) : metricError ? (
          <Alert variant="destructive" className="rounded-xl">
            <AlertTitle>Unable to load metrics</AlertTitle>
            <AlertDescription>{metricError}</AlertDescription>
          </Alert>
        ) : !hasMetrics ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted/60 bg-muted/20 p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <BarChart3 className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">
              {emptyMessage}
            </p>
            <Button asChild size="sm" variant="outline" className="h-10">
              <Link href={emptyCtaHref}>{emptyCtaLabel}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {Object.entries(providerSummaries).map(([providerId, summary], index) => {
              const providerCurrency = providerCurrencies?.[normalizeProviderId(providerId)] ?? currency
              const ctr = summary.impressions > 0 ? (summary.clicks / summary.impressions) * 100 : null
              const cpc = summary.clicks > 0 ? summary.spend / summary.clicks : null
              const cpa = summary.conversions > 0 ? summary.spend / summary.conversions : null
              const roas =
                summary.spend > 0 && Number.isFinite(summary.revenue) ? summary.revenue / summary.spend : null

              const dynamicStats = [
                { id: 'impressions', label: 'Impressions', value: formatNumber(summary.impressions) },
                { id: 'clicks', label: 'Clicks', value: formatNumber(summary.clicks) },
                { id: 'conversions', label: 'Conversions', value: formatNumber(summary.conversions) },
                { id: 'ctr', label: 'CTR', value: ctr !== null ? `${ctr.toFixed(2)}%` : '—' },
                { id: 'avg-cpc', label: 'Avg CPC', value: cpc !== null ? formatCurrency(cpc, providerCurrency) : '—' },
                { id: 'cpa', label: 'CPA', value: cpa !== null ? formatCurrency(cpa, providerCurrency) : '—' },
                { id: 'roas', label: 'ROAS', value: roas !== null ? `${roas.toFixed(2)}x` : '—' },
              ]

              return (
                <div
                  key={providerId}
                  className="animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <Card
                    className={cn(
                      'rounded-xl border border-muted/60 bg-card transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
                      'hover:border-muted hover:shadow-md'
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-muted/60 bg-muted/30">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-base">
                          {formatProviderName(providerId)}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs">Since last sync</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Total Spend</div>
                        <div className="text-3xl font-bold tracking-tight tabular-nums mt-1">
                          {formatCurrency(summary.spend, providerCurrency)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {dynamicStats.map((stat) => (
                          <div key={stat.id} className="rounded-lg border border-muted/50 bg-muted/20 p-2">
                            <div className="text-[10px] font-medium text-muted-foreground/70 uppercase">{stat.label}</div>
                            <div className="text-sm font-semibold tabular-nums mt-0.5">{stat.value}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
