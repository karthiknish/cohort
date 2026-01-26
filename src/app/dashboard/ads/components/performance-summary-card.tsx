'use client'

import Link from 'next/link'
import { Download, RefreshCw, BarChart3 } from 'lucide-react'

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

const providerThemes: Record<string, { bg: string; border: string; accent: string; iconBg: string }> = {
  google: {
    bg: 'bg-gradient-to-br from-blue-50/50 to-cyan-50/30 dark:from-blue-950/30 dark:to-cyan-950/20',
    border: 'border-blue-200/60 dark:border-blue-800/40',
    accent: 'text-blue-600 dark:text-blue-400',
    iconBg: 'from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50',
  },
  facebook: {
    bg: 'bg-gradient-to-br from-indigo-50/50 to-violet-50/30 dark:from-indigo-950/30 dark:to-violet-950/20',
    border: 'border-indigo-200/60 dark:border-indigo-800/40',
    accent: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'from-indigo-100 to-violet-100 dark:from-indigo-900/50 dark:to-violet-900/50',
  },
  meta: {
    bg: 'bg-gradient-to-br from-indigo-50/50 to-violet-50/30 dark:from-indigo-950/30 dark:to-violet-950/20',
    border: 'border-indigo-200/60 dark:border-indigo-800/40',
    accent: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'from-indigo-100 to-violet-100 dark:from-indigo-900/50 dark:to-violet-900/50',
  },
  linkedin: {
    bg: 'bg-gradient-to-br from-sky-50/50 to-blue-50/30 dark:from-sky-950/30 dark:to-blue-950/20',
    border: 'border-sky-200/60 dark:border-sky-800/40',
    accent: 'text-sky-600 dark:text-sky-400',
    iconBg: 'from-sky-100 to-blue-100 dark:from-sky-900/50 dark:to-blue-900/50',
  },
  tiktok: {
    bg: 'bg-gradient-to-br from-rose-50/50 to-pink-50/30 dark:from-rose-950/30 dark:to-pink-950/20',
    border: 'border-rose-200/60 dark:border-rose-800/40',
    accent: 'text-rose-600 dark:text-rose-400',
    iconBg: 'from-rose-100 to-pink-100 dark:from-rose-900/50 dark:to-pink-900/50',
  },
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
    <Card className="shadow-lg border-muted/80 overflow-hidden">
      {/* Subtle gradient accent at top */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-rose-500" />

      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between pb-4">
        <div className="flex flex-col gap-2">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Ad performance summary
          </CardTitle>
          <CardDescription className="text-sm">
            Aggregated spend, clicks, and conversions over the last synced period
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={metricsLoading}
            className="h-10 px-4 inline-flex items-center gap-2 transition-all duration-200 hover:shadow-md"
          >
            <RefreshCw className={cn('h-4 w-4', metricsLoading && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-10 px-4 inline-flex items-center gap-2 transition-all duration-200 hover:shadow-md"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {initialMetricsLoading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-36 w-full rounded-xl" />
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
              No synced performance data yet. Connect an ad platform and run a sync to populate these insights.
            </p>
            <Button asChild size="sm" variant="outline" className="h-10">
              <Link href="#connect-ad-platforms">Run first sync</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {Object.entries(providerSummaries).map(([providerId, summary], index) => {
              const theme = providerThemes[providerId] || providerThemes.google

              return (
                <div
                  key={providerId}
                  className="animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <Card
                    className={cn(
                      'group relative overflow-hidden rounded-xl border transition-all duration-300',
                      'hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1',
                      theme.bg, theme.border
                    )}
                  >
                    {/* Subtle inner glow on hover */}
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-tr from-white/60 to-transparent dark:from-white/10" />

                    <CardHeader className="pb-3 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm transition-transform duration-300',
                          'group-hover:scale-110 group-hover:shadow-md',
                          theme.iconBg
                        )}>
                          <BarChart3 className={cn('h-4 w-4', theme.accent)} />
                        </div>
                        <CardTitle className="text-base">
                          {formatProviderName(providerId)}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs">Since last sync</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Total Spend</div>
                        <div className="text-3xl font-bold tracking-tight tabular-nums mt-1">
                          {formatCurrency(summary.spend)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg bg-background/50 p-2 transition-colors group-hover:bg-background/80">
                          <div className="text-[10px] font-medium text-muted-foreground/70 uppercase">Impressions</div>
                          <div className="text-sm font-semibold tabular-nums mt-0.5">{summary.impressions.toLocaleString()}</div>
                        </div>
                        <div className="rounded-lg bg-background/50 p-2 transition-colors group-hover:bg-background/80">
                          <div className="text-[10px] font-medium text-muted-foreground/70 uppercase">Clicks</div>
                          <div className="text-sm font-semibold tabular-nums mt-0.5">{summary.clicks.toLocaleString()}</div>
                        </div>
                        <div className="rounded-lg bg-background/50 p-2 transition-colors group-hover:bg-background/80">
                          <div className="text-[10px] font-medium text-muted-foreground/70 uppercase">Conversions</div>
                          <div className="text-sm font-semibold tabular-nums mt-0.5">{summary.conversions.toLocaleString()}</div>
                        </div>
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
