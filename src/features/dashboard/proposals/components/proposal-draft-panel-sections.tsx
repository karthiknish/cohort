'use client'

import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import type { ReactNode } from 'react'

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
    <div className="flex items-center justify-between gap-3 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 sm:text-[11px]">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'h-1.5 w-1.5 rounded-full motion-chromatic-slow',
            autosaveStatus === 'saving'
              ? 'animate-pulse bg-primary'
              : autosaveStatus === 'error'
                ? 'bg-destructive'
                : autosaveStatus === 'idle'
                  ? 'bg-warning'
                  : 'bg-success',
          )}
        />
        <span>{autosaveLabel}</span>
      </div>
      <span className="tabular-nums tracking-tight text-muted-foreground/80">
        Draft #{draftId?.slice(0, 8).toUpperCase() ?? 'NEW'}
      </span>
    </div>
  )
}

export function ProposalDraftContentShell({
  currentStep,
  requiredFieldLabels,
  stepContent,
  stepDescription,
  stepTitle,
  totalSteps,
  validationMessages,
}: {
  currentStep: number
  requiredFieldLabels: string[]
  stepContent: ReactNode
  stepDescription: string
  stepTitle: string
  totalSteps: number
  validationMessages: string[]
}) {
  return (
    <div className="relative min-h-[300px] rounded-xl border border-muted/40 bg-muted/5 p-4 shadow-inner backdrop-blur-sm motion-chromatic-lg sm:p-6">
      <div className="space-y-5">
        <ProposalStepFeedback
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitle={stepTitle}
          stepDescription={stepDescription}
          requiredFieldLabels={requiredFieldLabels}
          validationMessages={validationMessages}
        />
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
  return (
    <div className="mt-auto flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-muted/30 bg-background/95 pt-4 pb-1 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={isFirstStep}
        className="h-10 px-6 font-medium motion-chromatic hover:border-accent/20 hover:bg-accent/5 hover:text-primary"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
      </Button>
      <div className="flex items-center gap-4">
        <div className="mr-2 hidden flex-col items-end sm:flex">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Step {currentStep + 1}</span>
          <span className="text-xs font-medium text-primary">{Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete</span>
        </div>
        <Button
          onClick={onNext}
          disabled={isSubmitting}
          className={cn(
            'h-10 px-8 font-semibold shadow-lg motion-chromatic active:scale-[0.98]',
            isLastStep && 'bg-success shadow-success/20 hover:bg-success/90',
          )}
        >
          {isLastStep ? (
            <span className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Generate Strategy
            </span>
          ) : (
            <span className="flex items-center">
              {isSubmitting ? 'Submitting…' : 'Continue'}
              {!isSubmitting ? <ChevronRight className="ml-2 h-4 w-4" /> : null}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
