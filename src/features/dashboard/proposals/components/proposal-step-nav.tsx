'use client'

import { memo, useCallback } from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { ProposalStep } from './proposal-step-types'

type ProposalStepNavProps = {
  steps: ProposalStep[]
  currentStep: number
  submitted: boolean
  onGoToStep: (index: number) => void
}

function ProposalStepNavComponent({ steps, currentStep, submitted, onGoToStep }: ProposalStepNavProps) {
  return (
    <nav aria-label="Proposal steps" className="relative flex flex-col gap-1 pl-1">
      <div className="pointer-events-none absolute left-[1.15rem] top-4 bottom-4 w-px bg-border/70" aria-hidden />
      {steps.map((step, index) => (
        <ProposalStepNavItem
          key={step.id}
          step={step}
          index={index}
          submitted={submitted}
          currentStep={currentStep}
          onGoToStep={onGoToStep}
        />
      ))}
    </nav>
  )
}

function ProposalStepNavItem({
  step,
  index,
  submitted,
  currentStep,
  onGoToStep,
}: {
  step: ProposalStep
  index: number
  submitted: boolean
  currentStep: number
  onGoToStep: (index: number) => void
}) {
  const isComplete = submitted || index < currentStep
  const isCurrent = !submitted && index === currentStep
  const canNavigate = !submitted && index <= currentStep

  const onGoToProposalStep = useCallback(() => {
    onGoToStep(index)
  }, [index, onGoToStep])

  return (
    <button
      type="button"
      disabled={!canNavigate}
      onClick={onGoToProposalStep}
      aria-current={isCurrent ? 'step' : undefined}
      className={cn(
        'relative z-[1] flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow]',
        isCurrent && 'border-primary/35 bg-primary/[0.06] shadow-sm ring-1 ring-primary/10',
        !isCurrent && canNavigate && 'border-transparent bg-background/80 hover:border-border/60 hover:bg-muted/40',
        !canNavigate && 'cursor-default border-transparent bg-transparent opacity-55',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
          isComplete && 'bg-success/15 text-success',
          isCurrent && 'bg-primary text-primary-foreground',
          !isComplete && !isCurrent && 'bg-muted text-muted-foreground',
        )}
      >
        {isComplete && !isCurrent ? <Check className="size-3.5" aria-hidden /> : index + 1}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{step.title}</span>
        <span className="line-clamp-2 text-xs text-muted-foreground">{step.description}</span>
      </span>
    </button>
  )
}

export const ProposalStepNav = memo(ProposalStepNavComponent)
