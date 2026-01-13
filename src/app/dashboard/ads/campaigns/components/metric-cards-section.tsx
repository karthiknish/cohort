'use client'

import {
  CreditCard,
  Target,
  MousePointerClick,
  Eye,
  TrendingUp,
  TrendingDown,
  Users
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

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
}

function formatCurrency(value: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value)
  } catch (err) {
    // Fallback if currency code is invalid
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)
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
}: {
  label: string
  value: string
  subValue?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
}) {
  return (
    <Card className="overflow-hidden border-muted/40 shadow-sm transition-all hover:shadow-md">
      <CardContent className="p-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                {label}
              </p>
              <p className="text-2xl font-black tracking-tight">{value}</p>
              {subValue && (
                <p className="text-xs font-medium text-muted-foreground/60">{subValue}</p>
              )}
            </div>
            <div className={cn(
              "rounded-full p-2.5",
              trend === 'up' ? "bg-emerald-500/10 text-emerald-600" :
                trend === 'down' ? "bg-red-500/10 text-red-600" :
                  "bg-muted/50 text-muted-foreground/70"
            )}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function MetricCardsSection({ metrics, loading, currency, efficiencyScore }: MetricCardsSectionProps) {
  const displayCurrency = currency?.toUpperCase() || 'USD'
  const displayEfficiencyScore =
    typeof efficiencyScore === 'number' && Number.isFinite(efficiencyScore)
      ? Math.max(0, Math.min(100, Math.round(efficiencyScore)))
      : null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Total Spend"
        value={metrics ? formatCurrency(metrics.spend, displayCurrency) : '—'}
        icon={CreditCard}
        loading={loading}
      />
      <MetricCard
        label="ROAS"
        value={metrics ? `${metrics.roas.toFixed(2)}x` : '—'}
        trend={metrics && metrics.roas > 2 ? 'up' : 'neutral'}
        icon={TrendingUp}
        loading={loading}
      />
      <MetricCard
        label="CTR"
        value={metrics ? formatPercent(metrics.ctr) : '—'}
        subValue={metrics ? `${formatNumber(metrics.clicks)} clicks` : undefined}
        icon={MousePointerClick}
        loading={loading}
      />
      <MetricCard
        label="CPA"
        value={metrics ? formatCurrency(metrics.cpa, displayCurrency) : '—'}
        trend={metrics && metrics.cpa < 20 ? 'up' : 'down'}
        icon={Target}
        loading={loading}
      />
      <MetricCard
        label="Impressions"
        value={metrics ? formatNumber(metrics.impressions) : '—'}
        icon={Eye}
        loading={loading}
      />
      <MetricCard
        label="Conv. Rate"
        value={metrics ? formatPercent(metrics.convRate) : '—'}
        subValue={metrics ? `${formatNumber(metrics.conversions)} conv.` : undefined}
        icon={TrendingUp}
        loading={loading}
      />
      <MetricCard
        label="Avg. CPC"
        value={metrics ? formatCurrency(metrics.cpc, displayCurrency) : '—'}
        icon={CreditCard}
        loading={loading}
      />
      {metrics?.reach !== undefined && (
        <MetricCard
          label="Total Reach"
          value={formatNumber(metrics.reach)}
          icon={Users}
          loading={loading}
          subValue={metrics ? `${((metrics.reach / metrics.impressions) * 100).toFixed(1)}% of impressions` : undefined}
        />
      )}
      <MetricCard
        label="Efficiency Score"
        value={displayEfficiencyScore !== null ? `${displayEfficiencyScore}%` : '—'}
        icon={TrendingUp}
        loading={loading}
      />
    </div>
  )
}
