'use client'

import { useState } from 'react'
import {
  ChevronDown,
  CreditCard,
  Target,
  MousePointerClick,
  Eye,
  TrendingUp,
  Users,
} from 'lucide-react'
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { Skeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible'
import { MetricCardPreview } from '@/shared/ui/hover-preview'
import { normalizeCurrencyCode } from '@/constants/currencies'
import {
  EN_US_NUMBER_MAX_2_FORMATTER,
  formatEnUsCurrencyMaxFractionDigits,
} from '@/lib/intl/formatters'

interface CalculatedMetrics {
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  cpc: number
  cpa: number
  roas: number
  convRate: number
  reach?: number
}

interface MetricCardsSectionProps {
  metrics: CalculatedMetrics | null
  loading: boolean
  currency?: string
  efficiencyScore?: number | null
  /** Expand secondary metrics on first paint (e.g. tests). */
  defaultMoreMetricsOpen?: boolean
}

function formatCurrency(value: number, currency: string = 'USD'): string {
  return formatEnUsCurrencyMaxFractionDigits(value, currency, 2)
}

function formatNumber(value: number): string {
  return EN_US_NUMBER_MAX_2_FORMATTER.format(value)
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

function MetricCard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  loading,
  description,
  featured = false,
}: {
  label: string
  value: string
  subValue?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
  description?: string
  featured?: boolean
}) {
  const content = (
    <div
      className={cn(
        ADS_PAGE_THEME.kpiTile,
        'group',
        featured && 'border-primary/20 bg-linear-to-br from-primary/[0.04] via-card to-muted/15 ring-1 ring-primary/10',
      )}
    >
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className={ADS_PAGE_THEME.kpiLabel}>{label}</p>
            <p className={cn(ADS_PAGE_THEME.kpiValue, featured && 'text-3xl')}>{value}</p>
            {subValue ? <p className="text-xs font-medium text-muted-foreground">{subValue}</p> : null}
          </div>
          <div
            className={cn(
              'rounded-xl p-2.5 ring-1',
              trend === 'up'
                ? 'bg-success/10 text-success ring-success/15'
                : trend === 'down'
                  ? 'bg-destructive/10 text-destructive ring-destructive/15'
                  : 'bg-primary/10 text-primary ring-primary/15',
            )}
          >
            <Icon className="size-5" aria-hidden />
          </div>
        </div>
      )}
    </div>
  )

  if (!description) {
    return content
  }

  return <MetricCardPreview description={description}>{content}</MetricCardPreview>
}

export function MetricCardsSection({
  metrics,
  loading,
  currency,
  efficiencyScore,
  defaultMoreMetricsOpen = false,
}: MetricCardsSectionProps) {
  const [hasUserToggled, setHasUserToggled] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const effectiveMoreOpen = hasUserToggled ? moreOpen : defaultMoreMetricsOpen
  const handleMoreOpenChange = (next: boolean) => {
    setHasUserToggled(true)
    setMoreOpen(next)
  }
  const displayCurrency = normalizeCurrencyCode(currency)
  const displayEfficiencyScore =
    typeof efficiencyScore === 'number' && Number.isFinite(efficiencyScore)
      ? Math.max(0, Math.min(100, Math.round(efficiencyScore)))
      : null

  const secondaryMetrics = (
    <>
      <MetricCard
        label="Impressions"
        value={metrics ? formatNumber(metrics.impressions) : '—'}
        icon={Eye}
        loading={loading}
        description="Number of times your ad was shown to potential customers"
      />
      <MetricCard
        label="Conv. Rate"
        value={metrics ? formatPercent(metrics.convRate) : '—'}
        subValue={metrics ? `${formatNumber(metrics.conversions)} conv.` : undefined}
        icon={TrendingUp}
        loading={loading}
        description="Conversion Rate - percentage of clicks that resulted in a conversion"
      />
      <MetricCard
        label="Avg. CPC"
        value={metrics ? formatCurrency(metrics.cpc, displayCurrency) : '—'}
        icon={CreditCard}
        loading={loading}
        description="Average Cost Per Click - average cost each time someone clicks your ad"
      />
      {metrics?.reach !== undefined ? (
        <MetricCard
          label="Total Reach"
          value={formatNumber(metrics.reach)}
          icon={Users}
          loading={loading}
          subValue={
            metrics
              ? `${((metrics.reach / metrics.impressions) * 100).toFixed(1)}% of impressions`
              : undefined
          }
          description="Number of unique people who saw your ad at least once"
        />
      ) : null}
      <MetricCard
        label="Efficiency Score"
        value={displayEfficiencyScore !== null ? `${displayEfficiencyScore}%` : '—'}
        icon={TrendingUp}
        loading={loading}
        description="Overall performance health rating combining spend, revenue, conversions, and other metrics"
      />
    </>
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Spend"
          value={metrics ? formatCurrency(metrics.spend, displayCurrency) : '—'}
          icon={CreditCard}
          loading={loading}
          featured
          description="Total amount spent on advertising during the selected time period"
        />
        <MetricCard
          label="ROAS"
          value={metrics ? `${metrics.roas.toFixed(2)}x` : '—'}
          trend={metrics && metrics.roas > 2 ? 'up' : 'neutral'}
          icon={TrendingUp}
          loading={loading}
          featured
          description="Return on Ad Spend - revenue generated per dollar spent. Higher is better."
        />
        <MetricCard
          label="CTR"
          value={metrics ? formatPercent(metrics.ctr) : '—'}
          subValue={metrics ? `${formatNumber(metrics.clicks)} clicks` : undefined}
          icon={MousePointerClick}
          loading={loading}
          featured
          description="Click-Through Rate - percentage of people who clicked after seeing your ad"
        />
        <MetricCard
          label="CPA"
          value={metrics ? formatCurrency(metrics.cpa, displayCurrency) : '—'}
          trend={metrics && metrics.cpa < 20 ? 'up' : 'down'}
          icon={Target}
          loading={loading}
          featured
          description="Cost Per Acquisition - average cost to get one conversion. Lower is better."
        />
      </div>

      <Collapsible open={effectiveMoreOpen} onOpenChange={handleMoreOpenChange}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full gap-1.5 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <ChevronDown
              className={cn('size-4 transition-transform', effectiveMoreOpen && 'rotate-180')}
              aria-hidden
            />
            {effectiveMoreOpen ? 'Hide additional metrics' : 'Show additional metrics'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {secondaryMetrics}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
