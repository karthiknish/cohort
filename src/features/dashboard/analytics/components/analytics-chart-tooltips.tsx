'use client'

import type { ReactNode } from 'react'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { AnalyticsChartPoint, AnalyticsChartTooltipProps } from './analytics-chart-tooltips-types'

function resolveChartPoint(payload: AnalyticsChartTooltipProps['payload']): AnalyticsChartPoint | null {
  if (!payload?.length) return null
  for (const entry of payload) {
    const candidate = entry?.payload
    if (candidate && typeof candidate === 'object' && 'date' in candidate) {
      return candidate as AnalyticsChartPoint
    }
  }
  return null
}

function formatTooltipDate(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function dayOverDayPercent(
  chartData: AnalyticsChartPoint[],
  date: string,
  key: keyof Pick<AnalyticsChartPoint, 'users' | 'sessions' | 'revenue' | 'conversions' | 'conversionRate'>,
): number | null {
  const index = chartData.findIndex((row) => row.date === date)
  if (index <= 0) return null
  const previous = chartData[index - 1]
  const current = chartData[index]
  if (!previous || !current) return null
  const prevValue = previous[key]
  const currValue = current[key]
  if (typeof prevValue !== 'number' || typeof currValue !== 'number' || prevValue === 0) return null
  return ((currValue - prevValue) / prevValue) * 100
}

function DayChange({ value }: { value: number | null }) {
  if (value == null || !Number.isFinite(value)) return null
  const isUp = value > 0
  const isDown = value < 0
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-medium',
        isUp && 'text-success',
        isDown && 'text-destructive',
        !isUp && !isDown && 'text-muted-foreground',
      )}
    >
      <Icon className="size-3" aria-hidden />
      {isUp ? '+' : ''}
      {value.toFixed(1)}% vs prior day
    </span>
  )
}

function TooltipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  )
}

function TooltipTip({ children }: { children: string }) {
  return (
    <p className="mt-2 border-t border-border/60 pt-2 text-[11px] leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}

function TooltipPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid min-w-[12rem] gap-1.5 rounded-lg border border-border/60 bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-lg">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {children}
    </div>
  )
}

export function AnalyticsUsersSessionsTooltip({
  active,
  payload,
  chartData,
}: AnalyticsChartTooltipProps & { chartData: AnalyticsChartPoint[] }) {
  if (!active || !payload?.length) return null
  const point = resolveChartPoint(payload)
  if (!point) return null

  const sessionsPerUser = point.users > 0 ? point.sessions / point.users : 0

  return (
    <TooltipPanel title={formatTooltipDate(point.date)}>
      <div className="space-y-1">
        <TooltipRow label="Users" value={point.users.toLocaleString()} />
        <TooltipRow label="Sessions" value={point.sessions.toLocaleString()} />
        <TooltipRow label="Sessions / user" value={sessionsPerUser.toFixed(2)} />
      </div>
      <div className="space-y-0.5">
        <DayChange value={dayOverDayPercent(chartData, point.date, 'users')} />
        <DayChange value={dayOverDayPercent(chartData, point.date, 'sessions')} />
      </div>
      <TooltipTip>
        {sessionsPerUser > 1.2
          ? 'Strong repeat visits this day — check campaigns and landing pages that drove returns.'
          : 'Daily users and sessions for the selected range.'}
      </TooltipTip>
    </TooltipPanel>
  )
}

export function AnalyticsRevenueTooltip({
  active,
  payload,
  chartData,
  formatRevenue,
}: AnalyticsChartTooltipProps & {
  chartData: AnalyticsChartPoint[]
  formatRevenue: (amount: number | null | undefined) => string
}) {
  if (!active || !payload?.length) return null
  const point = resolveChartPoint(payload)
  if (!point) return null

  const revenuePerSession = point.sessions > 0 ? point.revenue / point.sessions : 0

  return (
    <TooltipPanel title={formatTooltipDate(point.date)}>
      <div className="space-y-1">
        <TooltipRow label="Revenue" value={formatRevenue(point.revenue)} />
        <TooltipRow label="Conversions" value={point.conversions.toLocaleString()} />
        <TooltipRow label="Revenue / session" value={formatRevenue(revenuePerSession)} />
        <TooltipRow label="Conv. rate" value={`${point.conversionRate.toFixed(2)}%`} />
      </div>
      <DayChange value={dayOverDayPercent(chartData, point.date, 'revenue')} />
      <TooltipTip>
        {point.revenue > 0 && point.conversions === 0
          ? 'Revenue without conversions — verify GA4 purchase events are mapped.'
          : 'Revenue synced from Google Analytics for this day.'}
      </TooltipTip>
    </TooltipPanel>
  )
}

export function AnalyticsConversionsTooltip({
  active,
  payload,
  chartData,
  formatRevenue,
}: AnalyticsChartTooltipProps & {
  chartData: AnalyticsChartPoint[]
  formatRevenue: (amount: number | null | undefined) => string
}) {
  if (!active || !payload?.length) return null
  const point = resolveChartPoint(payload)
  if (!point) return null

  return (
    <TooltipPanel title={formatTooltipDate(point.date)}>
      <div className="space-y-1">
        <TooltipRow label="Conversions" value={point.conversions.toLocaleString()} />
        <TooltipRow label="Sessions" value={point.sessions.toLocaleString()} />
        <TooltipRow label="Conv. rate" value={`${point.conversionRate.toFixed(2)}%`} />
        <TooltipRow label="Revenue" value={formatRevenue(point.revenue)} />
      </div>
      <DayChange value={dayOverDayPercent(chartData, point.date, 'conversions')} />
      <TooltipTip>
        {point.conversionRate >= 5
          ? 'Strong conversion day — compare traffic sources from this date.'
          : 'Conversion count based on sessions for this day.'}
      </TooltipTip>
    </TooltipPanel>
  )
}

export function AnalyticsConversionRateTooltip({
  active,
  payload,
  chartData,
}: AnalyticsChartTooltipProps & { chartData: AnalyticsChartPoint[] }) {
  if (!active || !payload?.length) return null
  const point = resolveChartPoint(payload)
  if (!point) return null

  return (
    <TooltipPanel title={formatTooltipDate(point.date)}>
      <div className="space-y-1">
        <TooltipRow label="Conv. rate" value={`${point.conversionRate.toFixed(2)}%`} />
        <TooltipRow label="Conversions" value={point.conversions.toLocaleString()} />
        <TooltipRow label="Sessions" value={point.sessions.toLocaleString()} />
      </div>
      <DayChange value={dayOverDayPercent(chartData, point.date, 'conversionRate')} />
      <TooltipTip>
        {point.sessions < 10
          ? 'Low session volume — daily rate can swing; interpret with caution.'
          : 'Conversion rate = conversions ÷ sessions for this day.'}
      </TooltipTip>
    </TooltipPanel>
  )
}
