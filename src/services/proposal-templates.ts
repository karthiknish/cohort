import { apiFetch } from '@/lib/api-client'
import type { ProposalTemplate, ProposalTemplateInput, ProposalTemplateUpdateInput } from '@/types/proposal-templates'

export async function fetchProposalTemplates(): Promise<ProposalTemplate[]> {
  const data = await apiFetch<{ templates: ProposalTemplate[] }>('/api/proposal-templates')
  return data.templates ?? []
}

export async function fetchProposalTemplate(templateId: string): Promise<ProposalTemplate> {
  const data = await apiFetch<{ template: ProposalTemplate }>(`/api/proposal-templates/${templateId}`)
  return data.template
}

export async function createProposalTemplate(
  input: ProposalTemplateInput
): Promise<ProposalTemplate> {
  const data = await apiFetch<{ template: ProposalTemplate }>('/api/proposal-templates', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.template
}

export async function updateProposalTemplate(
  templateId: string,
  input: ProposalTemplateUpdateInput
): Promise<ProposalTemplate> {
  const data = await apiFetch<{ template: ProposalTemplate }>(`/api/proposal-templates/${templateId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  return data.template
}

export async function deleteProposalTemplate(templateId: string): Promise<void> {
  await apiFetch(`/api/proposal-templates/${templateId}`, {
    method: 'DELETE',
  })
}
