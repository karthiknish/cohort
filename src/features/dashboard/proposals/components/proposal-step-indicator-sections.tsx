'use client'

import { useMemo } from 'react'

import { cn } from '@/lib/utils'

import type { ProposalStep } from './proposal-step-types'

export function ProposalStepIndicatorRail({
  steps,
  currentStep,
  submitted,
}: {
  steps: ProposalStep[]
  currentStep: number
  submitted: boolean
}) {
  return (
    <ol className="flex flex-wrap items-center gap-2" aria-label="Proposal steps overview">
      {steps.map((step, index) => {
        const isComplete = submitted || index < currentStep
        const isCurrent = !submitted && index === currentStep

        return (
          <li key={step.id} aria-current={isCurrent ? 'step' : undefined}>
            <span
              title={step.title}
              className={cn(
                'block h-2.5 w-2.5 rounded-full transition-[background-color,box-shadow,transform] duration-200 motion-reduce:transition-none',
                isComplete && 'bg-success shadow-[0_0_0_1px_hsl(var(--success)/0.25)]',
                isCurrent && 'scale-110 bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]',
                !isComplete && !isCurrent && 'bg-muted-foreground/25',
              )}
            />
            <span className="sr-only">
              {index + 1}. {step.title}
              {isComplete ? ' (completed)' : isCurrent ? ' (current)' : ''}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

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
        className="h-full bg-primary transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-(--motion-duration-slow) ease-(--motion-ease-in-out) motion-reduce:transition-none"
        style={progressStyle}
      />
    </div>
  )
}