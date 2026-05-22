'use client'

import { useCallback, useMemo } from 'react'
import { BarChart3, MousePointerClick, Percent, Sparkles, Target, TrendingUp, Wallet } from 'lucide-react'

import { cn, formatCurrency } from '@/lib/utils'
import { EN_US_COMPACT_NUMBER_FORMATTER } from '@/lib/intl/formatters'
import { Badge } from '@/shared/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

import {
  CREATIVE_INSIGHT_LABELS,
  type CreativeInsightKind,
  type CreativeSortKey,
  type CreativeTotals,
} from './campaign-creative-metrics'

const SORT_OPTIONS: Array<{ value: CreativeSortKey; label: string }> = [
  { value: 'spend', label: 'Spend (high → low)' },
  { value: 'conversions', label: 'Conversions' },
  { value: 'ctr', label: 'CTR' },
  { value: 'roas', label: 'ROAS' },
  { value: 'name', label: 'Name (A → Z)' },
]

const PERIOD_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
] as const

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

function formatCompactNumber(value: number): string {
  return EN_US_COMPACT_NUMBER_FORMATTER.format(value)
}

function KpiTile({
  label,
  value,
  subValue,
  icon: Icon,
}: {
  label: string
  value: string
  subValue?: string
  icon: typeof Wallet
}) {
  return (
    <div className="flex min-w-[7.5rem] flex-1 flex-col gap-1 rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 shadow-sm">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3 shrink-0" aria-hidden />
        {label}
      </div>
      <p className="text-sm font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
      {subValue ? <p className="text-[10px] text-muted-foreground">{subValue}</p> : null}
    </div>
  )
}

export function CampaignCreativesPerformanceStrip({
  totals,
  currency,
  periodDays,
  onPeriodChange,
  sortKey,
  onSortChange,
  metricsLoading,
  isMeta,
}: {
  totals: CreativeTotals | null
  currency: string
  periodDays: string
  onPeriodChange: (days: string) => void
  sortKey: CreativeSortKey
  onSortChange: (key: CreativeSortKey) => void
  metricsLoading: boolean
  isMeta: boolean
}) {
  const handleSortValueChange = useCallback(
    (value: string) => onSortChange(value as CreativeSortKey),
    [onSortChange],
  )

  return (
    <section
      className="space-y-3 rounded-2xl border border-border/60 bg-gradient-to-br from-muted/25 via-card to-card p-4"
      aria-label="Creative performance summary"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" aria-hidden />
            <h3 className="text-sm font-semibold text-foreground">
              {isMeta ? 'Meta ad performance' : 'Ad performance'}
            </h3>
          </div>
          <p className="max-w-xl text-xs text-muted-foreground">
            Spend and delivery metrics are attributed per ad (Meta ad id). Last {periodDays} days — compare
            creatives to spot budget drainers and winners.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={periodDays} onValueChange={onPeriodChange}>
            <SelectTrigger className="h-8 w-[9.5rem] border-border/60 bg-background text-xs shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortKey} onValueChange={handleSortValueChange}>
            <SelectTrigger className="h-8 w-[11rem] border-border/60 bg-background text-xs shadow-sm">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {metricsLoading && !totals ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {['kpi-1', 'kpi-2', 'kpi-3', 'kpi-4', 'kpi-5', 'kpi-6'].map((id) => (
            <Skeleton key={id} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : totals ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <KpiTile
            label="Spend"
            value={formatCurrency(totals.spend, currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            subValue={`${totals.adsWithSpend} ads with spend`}
            icon={Wallet}
          />
          <KpiTile
            label="Impressions"
            value={formatCompactNumber(totals.impressions)}
            icon={Target}
          />
          <KpiTile
            label="Clicks"
            value={formatCompactNumber(totals.clicks)}
            icon={MousePointerClick}
          />
          <KpiTile
            label="Conversions"
            value={formatCompactNumber(totals.conversions)}
            subValue={totals.cpa > 0 ? `CPA ${formatCurrency(totals.cpa, currency)}` : undefined}
            icon={TrendingUp}
          />
          <KpiTile label="CTR" value={formatPercent(totals.ctr)} subValue={`CPC ${formatCurrency(totals.cpc, currency)}`} icon={Percent} />
          <KpiTile
            label="ROAS"
            value={totals.roas > 0 ? `${totals.roas.toFixed(2)}×` : '—'}
            subValue={
              totals.revenue > 0
                ? formatCurrency(totals.revenue, currency, { maximumFractionDigits: 0 })
                : 'No revenue tracked'
            }
            icon={Sparkles}
          />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
          No spend data for this period yet. Sync metrics or widen the date range.
        </p>
      )}
    </section>
  )
}

export function CreativeInsightBadge({ kind }: { kind: CreativeInsightKind }) {
  const config = CREATIVE_INSIGHT_LABELS[kind]
  return (
    <Badge variant="outline" className={cn('h-5 px-1.5 text-[9px] font-semibold uppercase tracking-wide', config.className)}>
      {config.label}
    </Badge>
  )
}

export function CreativeSpendShareBar({ share }: { share: number }) {
  const width = Math.min(Math.max(share, 4), 100)
  const widthStyle = useMemo(() => ({ width: `${width}%` }), [width])

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between text-[9px] uppercase tracking-wide text-muted-foreground">
        <span>Spend share</span>
        <span className="tabular-nums">{share.toFixed(0)}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary/80 transition-all" style={widthStyle} />
      </div>
    </div>
  )
}

export function CreativeMetricsGrid({
  metrics,
  currency,
  compact = false,
}: {
  metrics: Pick<CreativeTotals, 'spend' | 'impressions' | 'clicks' | 'conversions' | 'ctr' | 'roas' | 'cpc'>
  currency: string
  compact?: boolean
}) {
  const cells = [
    { label: 'Spend', value: formatCurrency(metrics.spend, currency) },
    { label: 'Impr.', value: formatCompactNumber(metrics.impressions) },
    { label: 'CTR', value: formatPercent(metrics.ctr) },
    { label: 'Conv.', value: metrics.conversions.toLocaleString() },
    { label: 'ROAS', value: metrics.roas > 0 ? `${metrics.roas.toFixed(2)}×` : '—' },
    { label: 'CPC', value: metrics.clicks > 0 ? formatCurrency(metrics.cpc, currency) : '—' },
  ]

  return (
    <div
      className={cn(
        'grid gap-x-2 gap-y-1 border-t border-border/50 pt-2',
        compact ? 'grid-cols-2' : 'grid-cols-3 sm:grid-cols-6',
      )}
    >
      {cells.map((cell) => (
        <div key={cell.label} className="flex flex-col">
          <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">{cell.label}</span>
          <span className="text-[11px] font-semibold tabular-nums text-foreground">{cell.value}</span>
        </div>
      ))}
    </div>
  )
}
