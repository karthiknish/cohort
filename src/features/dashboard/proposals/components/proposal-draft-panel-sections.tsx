'use client'

import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'

import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'

import { ProposalStepFeedback } from './proposal-step-feedback'

export function ProposalDraftStatusStrip({
  autosaveLabel,
  autosaveStatus,
  draftId,
}: {
  autosaveLabel: string
  autosaveStatus: 'idle' | 'saving' | 'saved' | 'error'
  draftId: string | null
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <div
          className={cn(
            'h-2 w-2 shrink-0 rounded-full',
            autosaveStatus === 'saving'
              ? 'animate-pulse bg-primary'
              : autosaveStatus === 'error'
                ? 'bg-destructive'
                : autosaveStatus === 'idle'
                  ? 'bg-warning'
                  : 'bg-success',
          )}
          aria-hidden
        />
        <span>{autosaveLabel}</span>
      </div>
      <span className="font-mono text-[10px] tracking-tight text-muted-foreground/80">
        Draft #{draftId?.slice(0, 8).toUpperCase() ?? 'NEW'}
      </span>
    </div>
  )
}

export function ProposalDraftContentShell({
  stepContent,
  validationMessages,
}: {
  stepContent: ReactNode
  validationMessages: string[]
}) {
  return (
    <div className="relative min-h-[280px] rounded-2xl border border-border/50 bg-background p-4 shadow-sm sm:p-6">
      <div className="space-y-5">
        <ProposalStepFeedback validationMessages={validationMessages} />
        {stepContent}
      </div>
    </div>
  )
}

export function ProposalDraftFooter({
  currentStep,
  isFirstStep,
  isLastStep,
  isSubmitting,
  onBack,
  onNext,
  totalSteps,
}: {
  currentStep: number
  isFirstStep: boolean
  isLastStep: boolean
  isSubmitting: boolean
  onBack: () => void
  onNext: () => void
  totalSteps: number
}) {
  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100)
  const progressStyle = useMemo(() => ({ width: `${progressPercent}%` }), [progressPercent])

  return (
    <div className="mt-auto shrink-0 space-y-3 border-t border-border/50 pt-4">
      <div className="h-1 overflow-hidden rounded-full bg-muted/60" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={progressStyle}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isFirstStep}
          className="h-10 gap-1.5 rounded-full px-4 font-medium"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </Button>
        <p className="hidden text-center text-xs text-muted-foreground sm:block">
          Step {currentStep + 1} of {totalSteps}
          <span className="mx-1.5 text-border">·</span>
          <span className="font-medium text-foreground">{progressPercent}%</span>
        </p>
        <Button
          onClick={onNext}
          disabled={isSubmitting}
          className={cn(
            'h-10 gap-1.5 rounded-full px-6 font-semibold shadow-sm',
            isLastStep && 'bg-success text-success-foreground hover:bg-success/90',
          )}
        >
          {isLastStep ? (
            <>
              <FileText className="h-4 w-4" aria-hidden />
              {isSubmitting ? 'Generating…' : 'Generate strategy'}
            </>
          ) : (
            <>
              {isSubmitting ? 'Saving…' : 'Continue'}
              {!isSubmitting ? <ChevronRight className="h-4 w-4" aria-hidden /> : null}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
