'use client'

import { memo } from 'react'
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
    <nav aria-label="Proposal steps" className="flex flex-col gap-1">
      {steps.map((step, index) => {
        const isComplete = submitted || index < currentStep
        const isCurrent = !submitted && index === currentStep
        const canNavigate = !submitted && index <= currentStep

        return (
          <button
            key={step.id}
            type="button"
            disabled={!canNavigate}
            onClick={() => onGoToStep(index)}
            aria-current={isCurrent ? 'step' : undefined}
            className={cn(
              'flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
              isCurrent && 'border-primary/30 bg-primary/5 shadow-sm',
              !isCurrent && canNavigate && 'border-transparent hover:border-border/60 hover:bg-muted/30',
              !canNavigate && 'cursor-default border-transparent opacity-60',
            )}
          >
            <span
              className={cn(
                'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                isComplete && 'bg-success/15 text-success',
                isCurrent && 'bg-primary text-primary-foreground',
                !isComplete && !isCurrent && 'bg-muted text-muted-foreground',
              )}
            >
              {isComplete && !isCurrent ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">{step.title}</span>
              <span className="line-clamp-2 text-xs text-muted-foreground">{step.description}</span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}

export const ProposalStepNav = memo(ProposalStepNavComponent)
