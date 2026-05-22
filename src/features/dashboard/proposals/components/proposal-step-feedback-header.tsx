'use client'

import { CircleAlert, CircleCheck } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { cn } from '@/lib/utils'

export function ProposalStepFeedbackHeader({
  completedRequiredFields,
  currentStep,
  hasErrors,
  requiredFieldCount,
  stepDescription,
  stepTitle,
  totalSteps,
  validationMessageCount,
}: {
  completedRequiredFields: number
  currentStep: number
  hasErrors: boolean
  requiredFieldCount: number
  stepDescription: string
  stepTitle: string
  totalSteps: number
  validationMessageCount: number
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Step {currentStep + 1} of {totalSteps}</Badge>
          <Badge variant={hasErrors ? 'outline' : 'secondary'}>{completedRequiredFields}/{requiredFieldCount} required ready</Badge>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{stepTitle}</h3>
          <p className="text-sm text-muted-foreground">{stepDescription}</p>
        </div>
      </div>
      <div className={cn('rounded-xl border px-3 py-2 text-sm', hasErrors ? 'border-destructive/35 bg-destructive/5 text-destructive' : 'border-success/25 bg-success/5 text-success')}>
        <div className="flex items-center gap-2">
          {hasErrors ? <CircleAlert className="size-4" /> : <CircleCheck className="size-4" />}
          <span className="font-medium">{hasErrors ? `${validationMessageCount} required input${validationMessageCount === 1 ? '' : 's'} still needed` : 'Required inputs complete'}</span>
        </div>
      </div>
    </div>
  )
}
