'use client'

import { useMemo } from 'react'
import { ArrowDown } from 'lucide-react'

import { cn } from '@/lib/utils'

import { funnelStageHexFill } from './ads-chart-configs'

export type ProportionalFunnelStage = {
  name: string
  value: number
  dropOff: number
}

const MIN_VISUAL_WIDTH_PCT = 20
const MAX_VISUAL_WIDTH_PCT = 100

/**
 * Log-scaled widths so 19k impressions → few conversions still forms a readable funnel
 * (raw linear widths collapse the bottom into a needle).
 */
export function computeFunnelVisualWidths(values: number[]): number[] {
  const top = values[0] ?? 0
  if (top <= 0) {
    return values.map(() => 0)
  }

  return values.map((value, index) => {
    if (index === 0) {
      return MAX_VISUAL_WIDTH_PCT
    }
    if (value <= 0) {
      return MIN_VISUAL_WIDTH_PCT
    }
    const logRatio =
      Math.log10(value + 1) / Math.log10(top + 1)
    const scaled = logRatio * MAX_VISUAL_WIDTH_PCT
    return Math.max(MIN_VISUAL_WIDTH_PCT, Math.min(MAX_VISUAL_WIDTH_PCT, scaled))
  })
}

type LayoutStage = ProportionalFunnelStage & {
  visualWidthPct: number
  fill: string
  shareOfTopPct: number
}

function buildLayoutStages(stages: ProportionalFunnelStage[]): LayoutStage[] {
  const values = stages.map((s) => s.value)
  const visualWidths = computeFunnelVisualWidths(values)
  const top = values[0] ?? 1

  return stages.map((stage, index) => ({
    ...stage,
    visualWidthPct: visualWidths[index] ?? 0,
    fill: funnelStageHexFill(index),
    shareOfTopPct: top > 0 ? (stage.value / top) * 100 : 0,
  }))
}

function TrapezoidSegment({
  stage,
  nextWidthPct,
  segmentHeight,
}: {
  stage: LayoutStage
  nextWidthPct: number
  segmentHeight: number
}) {
  const top = stage.visualWidthPct
  const bottom = nextWidthPct
  const containerStyle = useMemo(() => ({ height: segmentHeight }), [segmentHeight])

  return (
    <div className="relative flex w-full justify-center" style={containerStyle}>
      <svg
        className="h-full w-full max-w-md"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polygon
          points={`${50 - top / 2},0 ${50 + top / 2},0 ${50 + bottom / 2},100 ${50 - bottom / 2},100`}
          fill={stage.fill}
          stroke="hsl(var(--border))"
          strokeWidth={0.6}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}

function StageMetrics({ stage, isLast }: { stage: LayoutStage; isLast: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs">
      <span className="font-medium text-foreground">{stage.name}</span>
      <div className="flex flex-wrap items-baseline gap-2 tabular-nums text-muted-foreground">
        <span className="font-mono font-semibold text-foreground">
          {stage.value.toLocaleString()}
        </span>
        <span>{stage.shareOfTopPct.toFixed(2)}% of top</span>
        {!isLast && stage.dropOff > 0 ? (
          <span className="text-amber-600 dark:text-amber-500">
            −{stage.dropOff.toFixed(1)}% step drop
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function InsightsProportionalFunnel({
  stages,
  className,
}: {
  stages: ProportionalFunnelStage[]
  className?: string
}) {
  const layoutStages = useMemo(() => buildLayoutStages(stages), [stages])
  const segmentHeight = Math.max(56, Math.floor(220 / Math.max(layoutStages.length, 1)))

  return (
    <div className={cn('space-y-4', className)}>
      <p className="text-[11px] text-muted-foreground">
        Bar widths use a log scale for readability; counts and percentages show actual sync
        data.
      </p>
      <div
        className="mx-auto flex w-full max-w-lg flex-col gap-1"
        role="img"
        aria-label="Conversion funnel chart"
      >
        {layoutStages.map((stage, index) => {
          const nextWidth =
            index < layoutStages.length - 1
              ? (layoutStages[index + 1]?.visualWidthPct ?? MIN_VISUAL_WIDTH_PCT)
              : Math.max(MIN_VISUAL_WIDTH_PCT, stage.visualWidthPct * 0.72)

          return (
            <div key={stage.name} className="space-y-2">
              <StageMetrics stage={stage} isLast={index === layoutStages.length - 1} />
              <TrapezoidSegment
                stage={stage}
                nextWidthPct={nextWidth}
                segmentHeight={segmentHeight}
              />
              {index < layoutStages.length - 1 ? (
                <ArrowDown
                  className="mx-auto h-3.5 w-3.5 text-muted-foreground/35"
                  aria-hidden
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
