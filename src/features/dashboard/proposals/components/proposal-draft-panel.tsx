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
    <>
      <ProposalDraftStatusStrip autosaveLabel={autosaveLabel} autosaveStatus={autosaveStatus} draftId={draftId} />

      <ProposalDraftContentShell
        currentStep={currentStep}
        requiredFieldLabels={requiredFieldLabels}
        stepContent={stepContent}
        stepDescription={stepDescription}
        stepTitle={stepTitle}
        totalSteps={totalSteps}
        validationMessages={validationMessages}
      />

      <ProposalDraftFooter
        currentStep={currentStep}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isSubmitting={isSubmitting}
        onBack={onBack}
        onNext={onNext}
        totalSteps={totalSteps}
      />
    </>
  )
}
