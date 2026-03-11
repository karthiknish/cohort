'use client'

import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { ProposalStepFeedback } from './proposal-step-feedback'

interface ProposalDraftPanelProps {
  draftId: string | null
  autosaveStatus: 'idle' | 'saving' | 'saved' | 'error'
  stepContent: ReactNode
  onBack: () => void
  onNext: () => void
  isFirstStep: boolean
  isLastStep: boolean
  currentStep: number
  totalSteps: number
  isSubmitting: boolean
  stepTitle: string
  stepDescription: string
  requiredFieldLabels: string[]
  validationMessages: string[]
}

export function ProposalDraftPanel({
  draftId,
  autosaveStatus,
  stepContent,
  onBack,
  onNext,
  isFirstStep,
  isLastStep,
  currentStep,
  totalSteps,
  isSubmitting,
  stepTitle,
  stepDescription,
  requiredFieldLabels,
  validationMessages,
}: ProposalDraftPanelProps) {
  const autosaveLabel = autosaveStatus === 'saving'
    ? 'Saving progress…'
    : autosaveStatus === 'error'
      ? 'Autosave needs attention'
      : autosaveStatus === 'saved'
        ? 'All changes saved'
        : 'Draft ready to save'

  return (
    <>
      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 px-1">
        <div className="flex items-center gap-2">
          <div className={cn(
             'h-1.5 w-1.5 rounded-full transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none',
             autosaveStatus === 'saving' ? 'bg-primary animate-pulse' : autosaveStatus === 'error' ? 'bg-destructive' : autosaveStatus === 'idle' ? 'bg-amber-500' : 'bg-emerald-500',
          )} />
          <span>{autosaveLabel}</span>
        </div>
        <span>Draft #{draftId?.slice(0, 8).toUpperCase() ?? 'NEW'}</span>
      </div>

      <div className="relative min-h-[300px] rounded-xl border border-muted/40 bg-muted/5 p-4 sm:p-6 backdrop-blur-sm shadow-inner transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none">
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

      <div className="flex items-center justify-between pt-4 mt-2 border-t border-muted/20">
        <Button 
          variant="outline" 
          onClick={onBack} 
          disabled={isFirstStep}
          className="h-10 px-6 font-medium transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:bg-primary/5 hover:text-primary hover:border-primary/20"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Step {currentStep + 1}</span>
            <span className="text-xs font-medium text-primary">{Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete</span>
          </div>
          <Button 
            onClick={onNext} 
            disabled={isSubmitting}
            className={cn(
               'h-10 px-8 font-semibold shadow-lg transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] active:scale-[0.98]',
               isLastStep && 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
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
                {!isSubmitting && <ChevronRight className="ml-2 h-4 w-4" />}
              </span>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
