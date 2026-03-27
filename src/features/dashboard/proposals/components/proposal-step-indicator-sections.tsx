'use client'

import { useMemo } from 'react'

export function ProposalStepIndicatorSummary({
  activeStepTitle,
  currentStep,
  percentage,
  totalSteps,
}: {
  activeStepTitle: string
  currentStep: number
  percentage: number
  totalSteps: number
}) {
  return (
    <div className="flex items-center justify-between text-xs font-medium">
      <div className="flex items-center gap-2">
        <span className="font-bold text-primary">Step {currentStep + 1}</span>
        <span className="text-muted-foreground">of {totalSteps}</span>
        <span className="mx-1 text-muted-foreground/30">•</span>
        <span className="text-foreground">{activeStepTitle}</span>
      </div>
      <span className="text-primary/70">{Math.round(percentage)}%</span>
    </div>
  )
}

export function ProposalStepIndicatorProgressBar({ percentage }: { percentage: number }) {
  const progressStyle = useMemo(() => ({ width: `${percentage}%` }), [percentage])

  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
      <div
        className="h-full bg-primary transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-in-out)] motion-reduce:transition-none"
        style={progressStyle}
      />
    </div>
  )
}