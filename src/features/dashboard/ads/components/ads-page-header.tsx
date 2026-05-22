'use client'

import { Download, Megaphone, RefreshCw } from 'lucide-react'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { DASHBOARD_THEME, PAGE_TITLES, getIconContainerClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui/button'

import { DateRangePicker, type DateRange } from './date-range-picker'

type AdsPageHeaderProps = {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  onRefresh: () => void
  onExport: () => void
  refreshing?: boolean
  canExport?: boolean
  connectedCount?: number
  totalProviders?: number
  pendingSetupCount?: number
}

export function AdsPageHeader({
  dateRange,
  onDateRangeChange,
  onRefresh,
  onExport,
  refreshing = false,
  canExport = false,
  connectedCount = 0,
  totalProviders = 0,
  pendingSetupCount = 0,
}: AdsPageHeaderProps) {
  const allConnected = totalProviders > 0 && connectedCount >= totalProviders && pendingSetupCount === 0

  return (
    <header className={ADS_PAGE_THEME.hero}>
      <div className={ADS_PAGE_THEME.heroGlow} aria-hidden />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <p className={ADS_PAGE_THEME.sectionEyebrow}>Paid media</p>
          <div className="flex flex-wrap items-center gap-3">
            <div className={getIconContainerClasses('medium')}>
              <Megaphone className="size-6 text-primary" aria-hidden />
            </div>
            <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.ads?.title ?? 'Ads'}</h1>
          </div>
          <p className={cn(ADS_PAGE_THEME.sectionDescription, 'text-pretty')}>
            {PAGE_TITLES.ads?.description ??
              'Connect paid media accounts, sync campaign data, and review cross-channel performance in one command center.'}
          </p>
          {totalProviders > 0 ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/60 bg-background/80 px-2.5 py-1 font-medium tabular-nums text-foreground">
                {connectedCount} / {totalProviders} platforms linked
              </span>
              {pendingSetupCount > 0 ? (
                <span className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 font-medium text-warning">
                  {pendingSetupCount} setup step{pendingSetupCount === 1 ? '' : 's'} pending
                </span>
              ) : allConnected ? (
                <span className="rounded-full border border-success/25 bg-success/10 px-2.5 py-1 font-medium text-success">
                  Ready to sync
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          <DateRangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            className="w-full sm:w-auto [&_button]:h-10 [&_button]:rounded-xl [&_button]:border-border/70 [&_button]:bg-background/90"
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 flex-1 gap-1.5 rounded-xl border-border/70 sm:flex-none"
              onClick={onRefresh}
              disabled={refreshing}
              aria-busy={refreshing}
            >
              <RefreshCw className={cn('size-4', refreshing && 'animate-spin')} aria-hidden />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Sync</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 shrink-0 rounded-xl border-border/70"
              onClick={onExport}
              disabled={!canExport}
              aria-label="Export metrics as CSV"
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
