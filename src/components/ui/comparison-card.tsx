'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

export interface ComparisonMetric {
  label: string
  current: number
  previous: number
  prefix?: string
  suffix?: string
  format?: 'currency' | 'number' | 'percent'
}

interface ComparisonProps {
  title: string
  description?: string
  metrics: ComparisonMetric[]
  isLoading?: boolean
  className?: string
}

function formatValue(value: number, format?: string, prefix?: string, suffix?: string): string {
  if (format === 'currency') {
    return prefix + formatCurrency(value) + suffix
  }
  if (format === 'percent') {
    return value.toFixed(1) + '%'
  }
  return prefix + value.toLocaleString() + suffix
}

function calculateChange(current: number, previous: number): { value: number; type: 'up' | 'down' | 'neutral' } {
  if (previous === 0) return { value: 0, type: 'neutral' }
  const change = ((current - previous) / previous) * 100
  if (change > 0.1) return { value: change, type: 'up' }
  if (change < -0.1) return { value: Math.abs(change), type: 'down' }
  return { value: 0, type: 'neutral' }
}

export function ComparisonCard({ title, description, metrics, isLoading, className }: ComparisonProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (metrics.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No comparison data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const change = calculateChange(metric.current, metric.previous)
            const ChangeIcon = change.type === 'up' ? TrendingUp : change.type === 'down' ? TrendingDown : Minus

            return (
              <div key={index} className="flex items-center justify-between py-2 border-b border-muted/10 last:border-0">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium text-foreground">{metric.label}</span>
                  <div className="flex flex-col items-end gap-1 text-right text-sm">
                    <span className="font-bold text-foreground tabular-nums">
                      {formatValue(metric.current, metric.format, metric.prefix, metric.suffix)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs {formatValue(metric.previous, metric.format, metric.prefix, metric.suffix)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase',
                      change.type === 'up' && 'bg-emerald-500/10 text-emerald-600',
                      change.type === 'down' && 'bg-red-500/10 text-red-600',
                      change.type === 'neutral' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    <ChangeIcon className="h-3 w-3" />
                    {change.value.toFixed(1)}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Side-by-side comparison component for comparing two platforms or periods
interface SideBySideComparisonProps {
  leftLabel: string
  rightLabel: string
  metrics: Array<{
    label: string
    left: number
    right: number
    prefix?: string
    suffix?: string
    format?: 'currency' | 'number' | 'percent'
  }>
  isLoading?: boolean
  title?: string
  className?: string
}

export function SideBySideComparison({
  leftLabel,
  rightLabel,
  metrics,
  isLoading = false,
  title = 'Side by Side Comparison',
  className,
}: SideBySideComparisonProps) {
  const processedMetrics = metrics.map((metric) => {
    const leftValue = metric.left
    const rightValue = metric.right
    const diff = rightValue - leftValue
    const diffPercent = leftValue !== 0 ? (diff / leftValue) * 100 : 0

    return {
      ...metric,
      leftValue,
      rightValue,
      diff,
      diffPercent,
      hasImprovement: metric.format === 'currency'
        ? diff < 0 // Lower cost/spend is good
        : diff > 0, // Higher revenue/conversions is good
    }
  })

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
          {title}
        </CardTitle>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">{leftLabel}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">{rightLabel}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-4">Metric</div>
            <div className="col-span-3 text-right">{leftLabel}</div>
            <div className="col-span-3 text-right">{rightLabel}</div>
            <div className="col-span-2 text-right">Change</div>
          </div>

          {/* Data rows */}
          {processedMetrics.map((metric, index) => (
            <div
              key={index}
              className={cn(
                'grid grid-cols-12 gap-2 px-3 py-3 rounded-lg transition-colors hover:bg-muted/30',
                index % 2 === 0 && 'bg-muted/20'
              )}
            >
              <div className="col-span-4 text-sm font-medium text-foreground">{metric.label}</div>
              <div className="col-span-3 text-right text-sm tabular-nums text-muted-foreground">
                {formatValue(metric.leftValue, metric.format, metric.prefix, metric.suffix)}
              </div>
              <div className="col-span-3 text-right text-sm tabular-nums font-semibold text-foreground">
                {formatValue(metric.rightValue, metric.format, metric.prefix, metric.suffix)}
              </div>
              <div className="col-span-2 text-right">
                <Badge
                  variant={metric.hasImprovement ? 'default' : 'secondary'}
                  className={cn(
                    'text-[10px] font-bold',
                    metric.diffPercent > 0
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-600 border-red-500/20'
                  )}
                >
                  {metric.diffPercent > 0 ? '+' : ''}{metric.diffPercent.toFixed(1)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
