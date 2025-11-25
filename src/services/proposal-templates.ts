import type { ProposalTemplate, ProposalTemplateInput, ProposalTemplateUpdateInput } from '@/types/proposal-templates'

export async function fetchProposalTemplates(token: string): Promise<ProposalTemplate[]> {
  const response = await fetch('/api/proposal-templates', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Failed to fetch templates' }))
    throw new Error(data.error || 'Failed to fetch templates')
  }

  const data = await response.json()
  return data.templates ?? []
}

export async function fetchProposalTemplate(token: string, templateId: string): Promise<ProposalTemplate> {
  const response = await fetch(`/api/proposal-templates/${templateId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Failed to fetch template' }))
    throw new Error(data.error || 'Failed to fetch template')
  }

  const data = await response.json()
  return data.template
}

export async function createProposalTemplate(
  token: string,
  input: ProposalTemplateInput
): Promise<ProposalTemplate> {
  const response = await fetch('/api/proposal-templates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Failed to create template' }))
    throw new Error(data.error || 'Failed to create template')
  }

  const data = await response.json()
  return data.template
}

export async function updateProposalTemplate(
  token: string,
  templateId: string,
  input: ProposalTemplateUpdateInput
): Promise<ProposalTemplate> {
  const response = await fetch(`/api/proposal-templates/${templateId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Failed to update template' }))
    throw new Error(data.error || 'Failed to update template')
  }

  const data = await response.json()
  return data.template
}

export async function deleteProposalTemplate(token: string, templateId: string): Promise<void> {
  const response = await fetch(`/api/proposal-templates/${templateId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Failed to delete template' }))
    throw new Error(data.error || 'Failed to delete template')
  }
}
