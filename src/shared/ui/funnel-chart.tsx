'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { CHART_COLORS } from '@/lib/colors'

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
}: FunnelChartProps) {
  const loadingSlots = ['loading-1', 'loading-2', 'loading-3', 'loading-4']

  // Calculate totals and percentages
  const funnelData = useMemo(() => {
    const total = steps[0]?.count || 1

    return steps.map((step, index) => {
      const previousCount = index > 0 ? (steps[index - 1]?.count ?? total) : total
      const percentage = total > 0 ? (step.count / total) * 100 : 0
      const dropOff = index > 0 ? previousCount - step.count : 0
      const dropOffPercent = previousCount > 0 ? (dropOff / previousCount) * 100 : 0

      return {
        ...step,
        percentage,
        dropOff,
        dropOffPercent,
        width: percentage,
        previousCount,
      }
    })
  }, [steps])

  const defaultColor = 'var(--primary)'
  const legendDotStyle = useMemo(() => ({ backgroundColor: defaultColor }), [defaultColor])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loadingSlots.map((slot) => (
              <Skeleton key={slot} className="h-12 w-full" />
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
          {funnelData.map((step, index) => (
            <FunnelStepRow
              key={step.id}
              defaultColor={defaultColor}
              index={index}
              showPercentages={showPercentages}
              step={step}
              totalSteps={steps.length}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-muted/20">
          <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={legendDotStyle} />
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

export function createAdSpendFunnel(impressions: number, clicks: number, conversions: number): FunnelStep[] {
  return [
    { id: 'impressions', name: 'Impressions', count: impressions || 0, color: CHART_COLORS.funnel.impressions },
    { id: 'clicks', name: 'Clicks', count: clicks || 0, color: CHART_COLORS.funnel.clicks },
    { id: 'conversions', name: 'Conversions', count: conversions || 0, color: CHART_COLORS.funnel.conversions },
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
    { id: 'visitors', name: 'Visitors', count: visitors || 0, color: CHART_COLORS.funnel.visitors },
    { id: 'views', name: 'Product Views', count: productViews || 0, color: CHART_COLORS.funnel.views },
    { id: 'cart', name: 'Add to Cart', count: addToCart || 0, color: CHART_COLORS.funnel.cart },
    { id: 'checkout', name: 'Checkout', count: checkout || 0, color: CHART_COLORS.funnel.checkout },
    { id: 'purchase', name: 'Purchase', count: purchase || 0, color: CHART_COLORS.funnel.purchase },
  ]
}

function FunnelStepRow({
  defaultColor,
  index,
  showPercentages,
  step,
  totalSteps,
}: {
  defaultColor: string
  index: number
  showPercentages: boolean
  step: FunnelDataStep
  totalSteps: number
}) {
  const stepColor = step.color || defaultColor
  const widthStyle = useMemo(() => ({ width: `${step.width}%` }), [step.width])
  const fillStyle = useMemo(() => ({ backgroundColor: stepColor }), [stepColor])
  const labelStyle = useMemo(
    () => ({
      justifyContent: step.width < 15 ? 'flex-start' : step.width < 30 ? 'center' : 'flex-end',
    }),
    [step.width]
  )

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">{step.name}</span>
        <div className="flex items-center gap-3">
          {showPercentages && <span className="text-muted-foreground">{step.percentage.toFixed(1)}%</span>}
          <span className="font-mono font-bold text-foreground">{step.count.toLocaleString()}</span>
        </div>
      </div>
      <div className="relative h-8 w-full overflow-hidden rounded-lg bg-muted/30">
        {/* Background track */}
        <div className="absolute inset-y-0 left-0 w-full bg-muted/20" />

        {/* Filled segment + label (clipped to bar width so light label never sits on muted track) */}
        <div
          className="absolute inset-y-0 left-0 h-full min-w-0 overflow-hidden rounded-lg transition-[width] duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none"
          style={widthStyle}
        >
          <div className="h-full w-full rounded-lg" style={fillStyle} />
          <div
            className="pointer-events-none absolute inset-0 flex min-w-0 items-center px-3 text-[10px] font-medium text-viewer-chrome drop-shadow-[0_1px_2px_rgb(0_0_0/0.55)]"
            style={labelStyle}
          >
            <span className="min-w-0 truncate">{step.label || step.name}</span>
          </div>
        </div>
      </div>

      {/* Drop-off indicator */}
      {index < totalSteps - 1 && (
        <div className="flex items-center justify-end text-[10px] text-muted-foreground">
          <span className="mr-1">Drop-off:</span>
          <span className="font-mono font-medium">
            {step.dropOff.toLocaleString()} ({step.dropOffPercent.toFixed(1)}%)
          </span>
        </div>
      )}
    </div>
  )
}

type FunnelDataStep = FunnelStep & {
  percentage: number
  dropOff: number
  dropOffPercent: number
  width: number
  previousCount: number
}
