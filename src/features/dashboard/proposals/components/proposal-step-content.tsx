'use client'

import { memo } from 'react'

import {
  ProposalCompanyStepSection,
  ProposalGoalsStepSection,
  ProposalMarketingStepSection,
  ProposalScopeStepSection,
  ProposalTimelinesStepSection,
  ProposalValueStepSection,
} from './proposal-step-content-sections'
import type { ProposalStepContentProps } from './proposal-step-types'

export type { ProposalStepId } from './proposal-step-types'

function ProposalStepContentComponent({
  stepId,
  formState,
  summary,
  validationErrors,
  onUpdateField,
  onToggleArrayValue,
  onChangeSocialHandle,
}: ProposalStepContentProps) {
  switch (stepId) {
    case 'company':
      return <ProposalCompanyStepSection formState={formState} summary={summary} validationErrors={validationErrors} onUpdateField={onUpdateField} onToggleArrayValue={onToggleArrayValue} onChangeSocialHandle={onChangeSocialHandle} />

    case 'marketing':
      return <ProposalMarketingStepSection formState={formState} summary={summary} validationErrors={validationErrors} onUpdateField={onUpdateField} onToggleArrayValue={onToggleArrayValue} onChangeSocialHandle={onChangeSocialHandle} />

    case 'goals':
      return <ProposalGoalsStepSection formState={formState} summary={summary} validationErrors={validationErrors} onUpdateField={onUpdateField} onToggleArrayValue={onToggleArrayValue} onChangeSocialHandle={onChangeSocialHandle} />

    case 'scope':
      return <ProposalScopeStepSection formState={formState} summary={summary} validationErrors={validationErrors} onUpdateField={onUpdateField} onToggleArrayValue={onToggleArrayValue} onChangeSocialHandle={onChangeSocialHandle} />

    case 'timelines':
      return <ProposalTimelinesStepSection formState={formState} summary={summary} validationErrors={validationErrors} onUpdateField={onUpdateField} onToggleArrayValue={onToggleArrayValue} onChangeSocialHandle={onChangeSocialHandle} />

    case 'value':
      return <ProposalValueStepSection formState={formState} summary={summary} validationErrors={validationErrors} onUpdateField={onUpdateField} onToggleArrayValue={onToggleArrayValue} onChangeSocialHandle={onChangeSocialHandle} />

    default:
      return null
  }
}

export const ProposalStepContent = memo(ProposalStepContentComponent)
