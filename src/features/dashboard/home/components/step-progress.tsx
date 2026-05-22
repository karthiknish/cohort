'use client'

import { cn } from '@/lib/utils'

/**
 * Step progress indicator showing numbered steps
 */
export function StepProgress({
  steps,
  currentStep,
  className,
}: {
  steps: Array<{ id: string; label: string }>
  currentStep: number
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center flex-1">
          <div
            className={cn(
              'size-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0',
              idx < currentStep
                ? 'bg-primary text-primary-foreground'
                : idx === currentStep
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {idx < currentStep ? '✓' : idx + 1}
          </div>

          {step.label && (
            <span
              className={cn(
                'ml-2 text-sm',
                idx <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
          )}

          {idx < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 mx-2',
                idx < currentStep ? 'bg-primary' : 'bg-muted'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
