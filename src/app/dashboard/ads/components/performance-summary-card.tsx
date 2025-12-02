'use client'

import Link from 'next/link'
import { Download, RefreshCw } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, cn } from '@/lib/utils'

import type { ProviderSummary } from './types'
import { formatProviderName } from './utils'

interface PerformanceSummaryCardProps {
  providerSummaries: Record<string, ProviderSummary>
  hasMetrics: boolean
  initialMetricsLoading: boolean
  metricsLoading: boolean
  metricError: string | null
  onRefresh: () => void
  onExport: () => void
}

export function PerformanceSummaryCard({
  providerSummaries,
  hasMetrics,
  initialMetricsLoading,
  metricsLoading,
  metricError,
  onRefresh,
  onExport,
}: PerformanceSummaryCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">Ad performance summary</CardTitle>
          <CardDescription>
            Aggregated spend, clicks, and conversions over the last synced period.
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={metricsLoading}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', metricsLoading && 'animate-spin')} />{' '}
            Refresh metrics
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            className="inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {initialMetricsLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : metricError ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load metrics</AlertTitle>
            <AlertDescription>{metricError}</AlertDescription>
          </Alert>
        ) : !hasMetrics ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
            <p>
              No synced performance data yet. Connect an ad platform and run a sync to
              populate these insights.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="#connect-ad-platforms">Run first sync</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(providerSummaries).map(([providerId, summary]) => (
              <Card key={providerId} className="border-muted/60 bg-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {formatProviderName(providerId)} overview
                  </CardTitle>
                  <CardDescription>Aggregated performance since last sync</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-semibold">
                    {formatCurrency(summary.spend)}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                    <div>
                      <div className="font-medium text-foreground">Impressions</div>
                      <div>{summary.impressions.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Clicks</div>
                      <div>{summary.clicks.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Conversions</div>
                      <div>{summary.conversions.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
