import type { ProposalFormData } from '@/lib/proposals'

export interface ProposalVersion {
  id: string
  proposalId: string
  versionNumber: number
  formData: ProposalFormData
  status: string
  stepProgress: number
  changeDescription: string | null
  createdBy: string
  createdByName: string | null
  createdAt: string | null
}

export interface ProposalVersionInput {
  proposalId: string
  changeDescription?: string | null
}

export interface ProposalVersionDiff {
  section: keyof ProposalFormData
  field: string
  oldValue: unknown
  newValue: unknown
}
