'use client'

import {
  ProposalStepFeedbackHeader,
  ProposalStepFeedbackRequiredBadges,
  ProposalStepFeedbackValidationBody,
} from './proposal-step-feedback-sections'

export function ProposalStepFeedback(props: {
  currentStep: number
  totalSteps: number
  stepTitle: string
  stepDescription: string
  requiredFieldLabels: string[]
  validationMessages: string[]
}) {
  const {
    currentStep,
    totalSteps,
    stepTitle,
    stepDescription,
    requiredFieldLabels,
    validationMessages,
  } = props
  const hasErrors = validationMessages.length > 0
  const completedRequiredFields = Math.max(requiredFieldLabels.length - validationMessages.length, 0)

  return (
    <div className="space-y-4 rounded-2xl border border-muted/50 bg-muted/10 p-4 sm:p-5">
      <ProposalStepFeedbackHeader
        completedRequiredFields={completedRequiredFields}
        currentStep={currentStep}
        hasErrors={hasErrors}
        requiredFieldCount={requiredFieldLabels.length}
        stepDescription={stepDescription}
        stepTitle={stepTitle}
        totalSteps={totalSteps}
        validationMessageCount={validationMessages.length}
      />

      <ProposalStepFeedbackRequiredBadges requiredFieldLabels={requiredFieldLabels} />

      <ProposalStepFeedbackValidationBody hasErrors={hasErrors} validationMessages={validationMessages} />
    </div>
  )
}