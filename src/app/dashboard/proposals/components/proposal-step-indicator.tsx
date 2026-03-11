'use client'

import { memo } from 'react'
import {
  ProposalStepIndicatorProgressBar,
  ProposalStepIndicatorSummary,
} from './proposal-step-indicator-sections'
import type { ProposalStepId } from './proposal-step-types'

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

function ProposalStepIndicatorComponent({
  steps,
  currentStep,
  submitted,
}: ProposalStepIndicatorProps) {
  const progress = ((currentStep + 1) / steps.length) * 100
  const activeStep = steps[currentStep]
  const percentage = submitted ? 100 : progress

  return (
    <div className="space-y-4">
      <ProposalStepIndicatorSummary
        activeStepTitle={activeStep?.title ?? 'Proposal step'}
        currentStep={currentStep}
        percentage={percentage}
        totalSteps={steps.length}
      />
      <ProposalStepIndicatorProgressBar percentage={percentage} />
    </div>
  )
}

export const ProposalStepIndicator = memo(ProposalStepIndicatorComponent)
