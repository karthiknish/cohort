'use client'

import { useMemo } from 'react'
import { Info, LoaderCircle, TrendingUp } from 'lucide-react'

import {
  DashboardEmptyPerformanceCard,
  DashboardSectionHeading,
} from '@/features/dashboard/home/components/dashboard-empty-performance-card'
import {
  DashboardSnapshotMetricGrid,
  type DashboardSnapshotMetric,
} from '@/features/dashboard/home/components/dashboard-snapshot-metric-grid'
import { PerformanceChart } from '@/features/dashboard/home/components/performance-chart'
import { StatsCards } from '@/features/dashboard/home/components/stats-cards'
import type { buildChartData } from '@/features/dashboard/home/lib/dashboard-calculations'
import { FadeIn } from '@/shared/ui/animate-in'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

export function DashboardOverviewErrorsAlert({
  errors,
  isRefreshing,
  onRetry,
}: {
  errors: string[]
  isRefreshing: boolean
  onRetry: () => void
}) {
  if (errors.length === 0) return null

  return (
    <FadeIn>
      <Alert variant="destructive">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <AlertTitle>Some data could not be loaded</AlertTitle>
            <AlertDescription>{errors.join(' ')}</AlertDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border-destructive/40 bg-background hover:bg-destructive/10"
            onClick={onRetry}
            disabled={isRefreshing}
          >
            {isRefreshing ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
            Try again
          </Button>
        </div>
      </Alert>
    </FadeIn>
  )
}

export function DashboardOverviewPerformanceSection({
  hasChartData,
  hasAdsData,
  hasAnalyticsData,
  metricsLoading,
  chartMetrics,
  displayCurrency,
  adsMetricsList,
  adsLoading,
  analyticsMetricsList,
  analyticsLoading,
}: {
  hasChartData: boolean
  hasAdsData: boolean
  hasAnalyticsData: boolean
  metricsLoading: boolean
  chartMetrics: ReturnType<typeof buildChartData>
  displayCurrency: string | null
  adsMetricsList: DashboardSnapshotMetric[]
  adsLoading: boolean
  analyticsMetricsList: DashboardSnapshotMetric[]
  analyticsLoading: boolean
}) {
  return (
    <section className="space-y-5" aria-label="Performance metrics">
      {hasChartData ? (
        <FadeIn id="tour-performance-chart">
          <Card className="overflow-hidden border-muted/40 bg-card shadow-sm ring-1 ring-muted/20">
            <CardHeader className="border-b border-muted/40 bg-muted/[0.02] pb-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                      <TrendingUp className="size-4" aria-hidden />
                    </span>
                    <CardTitle className="text-lg tracking-tight">Spend & revenue</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-4 cursor-help text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          Daily ad spend and revenue from synced platforms for the current client.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <CardDescription>Trend over the synced reporting window</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[320px] pt-6 sm:h-[340px]">
              <PerformanceChart
                metrics={chartMetrics}
                loading={metricsLoading}
                currency={displayCurrency ?? undefined}
                dataSource="ads"
                showDetailLink={false}
                hideHeader
              />
            </CardContent>
          </Card>
        </FadeIn>
      ) : null}

      {(hasAdsData || hasAnalyticsData) && !hasChartData ? (
        <div className="grid gap-8 lg:grid-cols-2">
          {hasAdsData ? (
            <FadeIn>
              <div className="space-y-4">
                <DashboardSectionHeading
                  eyebrow="Paid media"
                  title="Ad platforms"
                  description="Spend, delivery, and conversions from synced channels."
                />
                <DashboardSnapshotMetricGrid metrics={adsMetricsList} loading={adsLoading} />
              </div>
            </FadeIn>
          ) : null}
          {hasAnalyticsData ? (
            <FadeIn>
              <div className="space-y-4">
                <DashboardSectionHeading
                  eyebrow="Site traffic"
                  title="Analytics"
                  description="Users, sessions, and conversion rate for the selected period."
                />
                <DashboardSnapshotMetricGrid metrics={analyticsMetricsList} loading={analyticsLoading} />
              </div>
            </FadeIn>
          ) : null}
        </div>
      ) : null}

      {!hasChartData && !hasAdsData && !hasAnalyticsData && !metricsLoading ? (
        <FadeIn>
          <DashboardEmptyPerformanceCard />
        </FadeIn>
      ) : null}
    </section>
  )
}

export function DashboardOverviewSummarySection({
  displayStats,
  statsLoading,
}: {
  displayStats: Array<{
    label: string
    value: string
    helper?: string
    accent?: string
    href?: undefined
    featureLabel?: undefined
  }>
  statsLoading: boolean
}) {
  if (displayStats.length === 0) return null

  return (
    <FadeIn>
      <section className="space-y-4" aria-label="Summary statistics">
        <DashboardSectionHeading
          eyebrow="Signals"
          title="Summary"
          description="Cross-channel KPIs rolled up for this workspace."
        />
        <StatsCards stats={displayStats} loading={statsLoading} primaryCount={4} linkless />
      </section>
    </FadeIn>
  )
}

export function useDashboardDisplayStats(
  orderedStats: Array<{
    label: string
    value: string
    helper?: string
    accent?: string
    href?: string
    featureLabel?: string
  }>,
) {
  return useMemo(
    () =>
      orderedStats.map((stat) => ({
        ...stat,
        href: undefined,
        featureLabel: undefined,
      })),
    [orderedStats],
  )
}
