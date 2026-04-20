'use client'

import { AlertTriangle, TrendingDown, TrendingUp, Zap } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'
import type { KpiTheme } from '@/lib/themes'
import { cn, formatCurrency } from '@/lib/utils'

export type KpiTileData = {
  label: string
  value: number | null
  format: 'currency' | 'percent' | 'number' | 'ratio'
  icon: React.ReactNode
  trend?: number | null
  benchmark?: number
  invertTrend?: boolean
  theme?: KpiTheme
}

function formatValue(value: number | null, format: KpiTileData['format'], currency = 'USD') {
  if (value === null || !Number.isFinite(value)) return '—'
  if (format === 'currency') return formatCurrency(value, currency)
  if (format === 'percent') return `${(value * 100).toFixed(2)}%`
  if (format === 'ratio') return value.toFixed(2)
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function getTrendStatus(trend: number | null | undefined, invertTrend?: boolean): 'up' | 'down' | 'neutral' {
  if (trend === null || trend === undefined || Math.abs(trend) < 0.01) return 'neutral'
  const isPositive = trend > 0
  return invertTrend ? (isPositive ? 'down' : 'up') : (isPositive ? 'up' : 'down')
}

function isAnomaly(value: number | null, benchmark: number | undefined | null, threshold = 0.5) {
  if (value === null || benchmark === undefined || benchmark === null || benchmark === 0) return false
  return Math.abs((value - benchmark) / benchmark) > threshold
}

function KpiTile({ benchmark, currency = 'USD', format, icon, invertTrend, label, trend, value }: KpiTileData & { currency?: string }) {
  const trendStatus = getTrendStatus(trend ?? null, invertTrend)
  const hasAnomaly = isAnomaly(value, benchmark ?? null)
  return <div className={cn('group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-muted/60 bg-card p-5 motion-chromatic duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none hover:border-muted hover:shadow-md', hasAnomaly && 'ring-2 ring-warning/50 ring-offset-2 ring-offset-background')}>{hasAnomaly ? <TooltipProvider><Tooltip><TooltipTrigger asChild><div className="absolute right-3 top-3 z-10"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-warning/10"><AlertTriangle className="h-3.5 w-3.5 text-warning" /></div></div></TooltipTrigger><TooltipContent><p>This metric deviates significantly from benchmark</p></TooltipContent></Tooltip></TooltipProvider> : null}<div className="relative z-10 flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-muted/60 bg-muted/30 text-muted-foreground">{icon}</div><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{label}</span></div><div className="relative z-10 flex items-end justify-between gap-2"><div className="flex flex-col"><span className="text-3xl font-bold tracking-tight tabular-nums">{formatValue(value, format, currency)}</span><span className="mt-1 text-xs text-muted-foreground/60">{format === 'currency' && 'Cost per acquisition'}{format === 'percent' && 'Rate percentage'}{format === 'ratio' && 'Return multiplier'}</span></div>{trend !== null && trend !== undefined && Math.abs(trend) >= 0.01 ? <Badge variant="secondary" className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', trendStatus === 'up' && 'border border-success/20 bg-success/10 text-success', trendStatus === 'down' && 'border border-destructive/20 bg-destructive/10 text-destructive')}>{trendStatus === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}{Math.abs(trend * 100).toFixed(1)}%</Badge> : null}</div></div>
}

export function CustomInsightsCardHeader({ anomalyCount }: { anomalyCount: number }) {
  return <CardHeader className="flex flex-col gap-4 pb-4 md:flex-row md:items-start md:justify-between"><div className="flex flex-col gap-2"><CardTitle className="flex items-center gap-3 text-xl"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-muted/60 bg-muted/30"><Zap className="h-5 w-5 text-foreground" /></div>Custom Insights{anomalyCount > 0 ? <Badge className="ml-2 border-warning/20 bg-warning/10 text-warning"><AlertTriangle className="mr-1.5 h-3.5 w-3.5" />{anomalyCount} anomal{anomalyCount === 1 ? 'y' : 'ies'}</Badge> : null}</CardTitle><CardDescription className="text-sm">Real-time calculated metrics and KPIs based on your ad performance</CardDescription></div></CardHeader>
}

export function CustomInsightsLoadingState() {
  return <CardContent className="pt-2"><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3, 4, 5, 6, 7].map((slot) => <Skeleton key={slot} className="h-32 w-full rounded-xl" />)}</div></CardContent>
}

export function CustomInsightsEmptyState() {
  return <CardContent className="pt-2"><div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted/60 bg-muted/20 p-12 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"><Zap className="h-6 w-6 text-muted-foreground/50" /></div><p className="text-sm text-muted-foreground">No metrics data available to calculate insights.</p></div></CardContent>
}

export function CustomInsightsGrid({ currency = 'USD', items }: { currency?: string; items: KpiTileData[] }) {
  return <CardContent className="pt-2"><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{items.map((item) => <div key={item.label} className="animate-in fade-in slide-in-from-bottom-2"><KpiTile currency={currency} {...item} /></div>)}</div></CardContent>
}
