'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface MetricCardData {
  label: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: React.ReactNode
  trend?: number
  prefix?: string
  suffix?: string
  onClick?: () => void
  drillDownKey?: string
}

interface InteractiveMetricCardsProps {
  metrics: MetricCardData[]
  isLoading?: boolean
  onDrillDown?: (key: string, label: string) => void
  drilledDownKey?: string | null
  onReset?: () => void
  className?: string
}

export function InteractiveMetricCards({
  metrics,
  isLoading = false,
  onDrillDown,
  drilledDownKey,
  onReset,
  className,
}: InteractiveMetricCardsProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 gap-4 lg:grid-cols-4', className)}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-28 w-full" />
        ))}
      </div>
    )
  }

  if (drilledDownKey && onReset) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-1"
        >
          <ChevronRight className="h-3 w-3 rotate-180" />
          Back to overview
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          Filtering by: <strong>{drilledDownKey}</strong>
        </span>
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-2 gap-4 lg:grid-cols-4', className)}>
      {metrics.map((metric) => {
        const isClickable = metric.onClick || (onDrillDown && metric.drillDownKey)
        const isHovered = hoveredKey === metric.drillDownKey

        return (
          <Card
            key={metric.label}
            className={cn(
              'transition-all duration-200',
              isClickable && 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
              isHovered && 'ring-2 ring-primary/20'
            )}
            onClick={() => {
              if (metric.onClick) {
                metric.onClick()
              } else if (onDrillDown && metric.drillDownKey) {
                onDrillDown(metric.drillDownKey, metric.label)
              }
            }}
            onMouseEnter={() => metric.drillDownKey && setHoveredKey(metric.drillDownKey)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {metric.icon && (
                    <div className="mb-2 text-muted-foreground">{metric.icon}</div>
                  )}
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold tabular-nums mt-1">
                    {metric.prefix}
                    {metric.value}
                    {metric.suffix}
                  </p>
                </div>

                {metric.change !== undefined && (
                  <div
                    className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    metric.changeType === 'increase' && 'text-emerald-600',
                    metric.changeType === 'decrease' && 'text-red-600',
                    metric.changeType === 'neutral' && 'text-muted-foreground'
                  )}
                  >
                    {metric.changeType === 'increase' && <TrendingUp className="h-3 w-3" />}
                    {metric.changeType === 'decrease' && <TrendingDown className="h-3 w-3" />}
                    {metric.changeType === 'neutral' && <Minus className="h-3 w-3" />}
                    <span className="tabular-nums">{Math.abs(metric.change)}%</span>
                  </div>
                )}
              </div>

              {isClickable && (
                <div className="mt-2 flex items-center text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100">
                  Click to {onDrillDown ? 'drill down' : 'view details'}
                  <ChevronRight className="ml-0.5 h-3 w-3" />
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
