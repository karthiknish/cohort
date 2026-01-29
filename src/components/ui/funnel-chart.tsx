'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface FunnelStep {
  id: string
  name: string
  count: number
  label?: string
  color?: string
}

interface FunnelChartProps {
  steps: FunnelStep[]
  isLoading?: boolean
  title?: string
  description?: string
  className?: string
  showPercentages?: boolean
  showPrevious?: boolean
}

export function FunnelChart({
  steps,
  isLoading = false,
  title = 'Conversion Funnel',
  description = 'Track user journey through each stage',
  className,
  showPercentages = true,
  showPrevious = false,
}: FunnelChartProps) {
  // Calculate totals and percentages
  const funnelData = useMemo(() => {
    const total = steps[0]?.count || 1
    let previousCount = total

    return steps.map((step, index) => {
      const percentage = total > 0 ? (step.count / total) * 100 : 0
      const dropOff = index > 0 ? previousCount - step.count : 0
      const dropOffPercent = previousCount > 0 ? (dropOff / previousCount) * 100 : 0

      const result = {
        ...step,
        percentage,
        dropOff,
        dropOffPercent,
        width: percentage,
        previousCount,
      }

      previousCount = step.count
      return result
    })
  }, [steps, showPrevious])

  const defaultColor = 'hsl(var(--primary))'

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (steps.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No funnel data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {funnelData.map((step, index) => {
            const stepColor = step.color || defaultColor

            return (
              <div key={step.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{step.name}</span>
                  <div className="flex items-center gap-3">
                    {showPercentages && (
                      <span className="text-muted-foreground">
                        {step.percentage.toFixed(1)}%
                      </span>
                    )}
                    <span className="font-mono font-bold text-foreground">{step.count.toLocaleString()}</span>
                  </div>
                </div>
                <div className="relative h-8 w-full overflow-hidden rounded-lg bg-muted/30">
                  {/* Background track */}
                  <div className="absolute inset-y-0 left-0 w-full bg-muted/20" />

                  {/* Filled bar */}
                  <div
                    className="absolute inset-y-0 left-0 h-full rounded-lg transition-all duration-500"
                    style={{
                      width: `${step.width}%`,
                      backgroundColor: stepColor,
                    }}
                  />

                  {/* Labels inside bar */}
                  <div
                    className="absolute inset-0 flex items-center px-3 text-[10px] font-medium text-white mix-blend-plus-lighter"
                    style={{
                      justifyContent: step.width < 15 ? 'flex-start' : step.width < 30 ? 'center' : 'flex-end',
                    }}
                  >
                    {step.label || step.name}
                  </div>
                </div>

                {/* Drop-off indicator */}
                {index < steps.length - 1 && (
                  <div className="flex items-center justify-end text-[10px] text-muted-foreground">
                    <span className="mr-1">Drop-off:</span>
                    <span className="font-mono font-medium">
                      {step.dropOff.toLocaleString()} ({step.dropOffPercent.toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-muted/20">
          <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: defaultColor }} />
              <span>Conversion Stage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Bar width = % of initial traffic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Drop-off = users lost from previous stage</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Predefined funnel templates
export function createAdSpendFunnel(impressions: number, clicks: number, conversions: number): FunnelStep[] {
  return [
    { id: 'impressions', name: 'Impressions', count: impressions || 0, color: '#3b82f6' },
    { id: 'clicks', name: 'Clicks', count: clicks || 0, color: '#8b5cf6' },
    { id: 'conversions', name: 'Conversions', count: conversions || 0, color: '#10b981' },
  ]
}

export function createEcommerceFunnel(
  visitors: number,
  productViews: number,
  addToCart: number,
  checkout: number,
  purchase: number
): FunnelStep[] {
  return [
    { id: 'visitors', name: 'Visitors', count: visitors || 0, color: '#3b82f6' },
    { id: 'views', name: 'Product Views', count: productViews || 0, color: '#6366f1' },
    { id: 'cart', name: 'Add to Cart', count: addToCart || 0, color: '#8b5cf6' },
    { id: 'checkout', name: 'Checkout', count: checkout || 0, color: '#a855f7' },
    { id: 'purchase', name: 'Purchase', count: purchase || 0, color: '#10b981' },
  ]
}
