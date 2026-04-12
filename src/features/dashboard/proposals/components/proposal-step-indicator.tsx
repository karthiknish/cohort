'use client'

import { memo } from 'react'
import {
  ProposalStepIndicatorProgressBar,
  ProposalStepIndicatorRail,
  ProposalStepIndicatorSummary,
} from './proposal-step-indicator-sections'
import type { ProposalStep } from './proposal-step-types'

export type { ProposalStep } from './proposal-step-types'

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
      <ProposalStepIndicatorRail currentStep={currentStep} steps={steps} submitted={submitted} />
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
