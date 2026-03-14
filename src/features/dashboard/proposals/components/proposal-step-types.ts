import type { ProposalFormData } from '@/lib/proposals'

export type ProposalStepId = 'company' | 'marketing' | 'goals' | 'scope' | 'timelines' | 'value'

export interface ProposalStepContentProps {
  stepId: ProposalStepId
  formState: ProposalFormData
  summary: ProposalFormData
  validationErrors: Record<string, string>
  onUpdateField: (path: string[], value: string) => void
  onToggleArrayValue: (path: string[], value: string) => void
  onChangeSocialHandle: (handle: string, value: string) => void
}

export type ProposalStepSectionProps = Omit<ProposalStepContentProps, 'stepId'>