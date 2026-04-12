'use client'

import type { ReactNode } from 'react'

import {
  ProposalDraftContentShell,
  ProposalDraftFooter,
  ProposalDraftStatusStrip,
} from './proposal-draft-panel-sections'

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
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ProposalDraftStatusStrip autosaveLabel={autosaveLabel} autosaveStatus={autosaveStatus} draftId={draftId} />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-0.5 [-webkit-overflow-scrolling:touch]">
        <ProposalDraftContentShell
          currentStep={currentStep}
          requiredFieldLabels={requiredFieldLabels}
          stepContent={stepContent}
          stepDescription={stepDescription}
          stepTitle={stepTitle}
          totalSteps={totalSteps}
          validationMessages={validationMessages}
        />
      </div>

      <ProposalDraftFooter
        currentStep={currentStep}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isSubmitting={isSubmitting}
        onBack={onBack}
        onNext={onNext}
        totalSteps={totalSteps}
      />
    </div>
  )
}
