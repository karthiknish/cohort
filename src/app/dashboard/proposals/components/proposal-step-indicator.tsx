'use client'

import { memo } from 'react'
import { CheckCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { ProposalStepId } from './proposal-step-content'

export interface ProposalStep {
  id: ProposalStepId
  title: string
  description: string
}

interface ProposalStepIndicatorProps {
  steps: ProposalStep[]
  currentStep: number
  submitted: boolean
}

function ProposalStepIndicatorComponent({ steps, currentStep, submitted }: ProposalStepIndicatorProps) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {steps.map((item, index) => {
        const isCurrent = index === currentStep
        const isComplete = index < currentStep || submitted
        return (
          <li
            key={item.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-3 transition',
              isCurrent ? 'border-primary bg-primary/5' : 'border-muted/60 bg-muted/10 hover:bg-muted/20'
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                isComplete
                  ? 'border-primary bg-primary text-primary-foreground'
                  : isCurrent
                    ? 'border-primary/60 text-primary'
                    : 'border-muted/70 text-muted-foreground'
              )}
            >
              {isComplete ? <CheckCircle className="h-4 w-4" /> : index + 1}
            </span>
            <div className="space-y-1">
              <p className={cn('text-sm font-semibold leading-tight', isCurrent ? 'text-foreground' : 'text-muted-foreground')}>
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground leading-snug">{item.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export const ProposalStepIndicator = memo(ProposalStepIndicatorComponent)
