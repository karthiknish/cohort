import type { ProposalFormData } from '@/lib/proposals'

export type ProposalTemplate = {
  id: string
  name: string
  description: string | null
  formData: ProposalFormData
  industry: string | null
  tags: string[]
  isDefault: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type ProposalTemplateInput = {
  name: string
  description?: string | null
  formData: Partial<ProposalFormData>
  industry?: string | null
  tags?: string[]
  isDefault?: boolean
}

export type ProposalTemplateUpdateInput = {
  name?: string
  description?: string | null
  formData?: Partial<ProposalFormData>
  industry?: string | null
  tags?: string[]
  isDefault?: boolean
}
