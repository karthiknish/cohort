'use client'

import { Download, Megaphone, RefreshCw } from 'lucide-react'

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
}

export function AdsPageHeader({
  dateRange,
  onDateRangeChange,
  onRefresh,
  onExport,
  refreshing = false,
  canExport = false,
}: AdsPageHeaderProps) {
  return (
    <header className={cn(DASHBOARD_THEME.layout.header, 'gap-4 border-b border-muted/40 pb-6')}>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <div className={getIconContainerClasses('medium')}>
            <Megaphone className="h-6 w-6" aria-hidden />
          </div>
          <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.ads?.title ?? 'Ads'}</h1>
        </div>
        <p className={cn(DASHBOARD_THEME.layout.subtitle, 'max-w-2xl text-sm text-pretty')}>
          {PAGE_TITLES.ads?.description ??
            'Connect paid media accounts, sync campaign data, and review cross-channel performance.'}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
        <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onRefresh}
            disabled={refreshing}
            aria-busy={refreshing}
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} aria-hidden />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={onExport}
            disabled={!canExport}
            aria-label="Export metrics as CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
