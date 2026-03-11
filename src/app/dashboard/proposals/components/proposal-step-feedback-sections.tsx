'use client'

import { CircleAlert, CircleCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
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
      <div className={cn('rounded-xl border px-3 py-2 text-sm', hasErrors ? 'border-destructive/35 bg-destructive/5 text-destructive' : 'border-emerald-500/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300')}>
        <div className="flex items-center gap-2">
          {hasErrors ? <CircleAlert className="h-4 w-4" /> : <CircleCheck className="h-4 w-4" />}
          <span className="font-medium">{hasErrors ? `${validationMessageCount} required input${validationMessageCount === 1 ? '' : 's'} still needed` : 'Required inputs complete'}</span>
        </div>
      </div>
    </div>
  )
}

export function ProposalStepFeedbackRequiredBadges({ requiredFieldLabels }: { requiredFieldLabels: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {requiredFieldLabels.map((label) => (
        <Badge key={label} variant="secondary" className="rounded-full">{label}</Badge>
      ))}
    </div>
  )
}

export function ProposalStepFeedbackValidationBody({
  hasErrors,
  validationMessages,
}: {
  hasErrors: boolean
  validationMessages: string[]
}) {
  if (hasErrors) {
    return (
      <ul className="space-y-1 text-sm text-muted-foreground">
        {validationMessages.map((message) => (
          <li key={message} className="flex items-start gap-2">
            <CircleAlert className="mt-0.5 h-3.5 w-3.5 text-destructive" />
            <span>{message}</span>
          </li>
        ))}
      </ul>
    )
  }

  return <p className="text-sm text-muted-foreground">Everything required for this step is in place. You can continue now or refine the optional details first.</p>
}