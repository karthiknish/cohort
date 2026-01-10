import { ProposalFormData, mergeProposalForm } from '@/lib/proposals'

export type ProposalStatus = 'draft' | 'in_progress' | 'ready' | 'sent'

export interface ProposalPresentationDeck {
  generationId: string | null
  status: string
  instructions: string | null
  webUrl: string | null
  shareUrl: string | null
  pptxUrl: string | null
  pdfUrl: string | null
  generatedFiles: Array<{ fileType: string; fileUrl: string }>
  storageUrl: string | null
  pdfStorageUrl?: string | null
}

/** @deprecated Use ProposalPresentationDeck instead */
export type ProposalGammaDeck = ProposalPresentationDeck

export interface ProposalDraft {
  id: string
  status: ProposalStatus
  stepProgress: number
  formData: ProposalFormData
  aiInsights: unknown
  aiSuggestions: string | null
  pdfUrl?: string | null
  pptUrl?: string | null
  createdAt: string | null
  updatedAt: string | null
  lastAutosaveAt: string | null
  clientId: string | null
  clientName: string | null
  presentationDeck?: ProposalPresentationDeck | null
  /** @deprecated Use presentationDeck instead */
  gammaDeck?: ProposalPresentationDeck | null
}

import { apiFetch } from '@/lib/api-client'

function normalizeProposalDraft(input: ProposalDraft): ProposalDraft {
  // The API payload may contain partial/missing formData depending on legacy docs.
  // Normalise to full shape so consumers can safely read nested fields.
  return {
    ...input,
    formData: mergeProposalForm((input as { formData?: unknown })?.formData ?? null),
  }
}


export async function listProposals(params: { status?: ProposalStatus; clientId?: string; pageSize?: number } = {}) {
  const search = new URLSearchParams()
  if (params.status) {
    search.set('status', params.status)
  }
  if (params.clientId) {
    search.set('clientId', params.clientId)
  }
  if (typeof params.pageSize === 'number' && Number.isFinite(params.pageSize)) {
    search.set('pageSize', String(params.pageSize))
  }

  const payload = await apiFetch<{ proposals: ProposalDraft[] }>(`/api/proposals${search.toString() ? `?${search}` : ''}`, {
    cache: 'no-store',
  })

  return payload.proposals.map((proposal) => resolveProposalDeck(normalizeProposalDraft(proposal)))
}

export async function getProposalById(id: string) {
  const payload = await apiFetch<{ proposal: ProposalDraft }>(`/api/proposals?id=${encodeURIComponent(id)}`, {
    cache: 'no-store',
  })

  if (!payload.proposal) {
    throw new Error('Proposal not found')
  }

  return resolveProposalDeck(normalizeProposalDraft(payload.proposal))
}

export async function createProposalDraft(body: Partial<ProposalDraft> = {}) {
  const payload = await apiFetch<{ id: string }>('/api/proposals', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return payload.id
}

export async function updateProposalDraft(id: string, body: Partial<ProposalDraft>) {
  await apiFetch(`/api/proposals/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

  return true
}

export async function submitProposalDraft(id: string, delivery: 'summary' | 'summary_and_pdf' = 'summary') {
  const payload = await apiFetch<ProposalDraft>(`/api/proposals/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ delivery }),
  })

  return resolveProposalDeck(normalizeProposalDraft(payload))
}

export async function deleteProposalDraft(id: string) {
  await apiFetch(`/api/proposals/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })

  return true
}

export async function prepareProposalDeck(id: string) {
  const payload = await apiFetch<ProposalDraft>(`/api/proposals/${id}/deck`, {
    method: 'POST',
  })

  return resolveProposalDeck(normalizeProposalDraft(payload))
}

function resolveProposalDeck<T extends { pptUrl?: string | null; presentationDeck?: ProposalPresentationDeck | null; gammaDeck?: ProposalPresentationDeck | null; aiSuggestions?: string | null }>(payload: T): T & { presentationDeck?: ProposalPresentationDeck | null } {
  // Support both new presentationDeck and legacy gammaDeck
  const deck = payload.presentationDeck ?? payload.gammaDeck
  if (!deck) {
    const fallbackUrl = payload.pptUrl ?? null
    if (fallbackUrl && payload.pptUrl !== fallbackUrl) {
      return { ...payload, pptUrl: fallbackUrl, aiSuggestions: payload.aiSuggestions ?? null }
    }
    return { ...payload, aiSuggestions: payload.aiSuggestions ?? null }
  }

  const resolvedStorage = deck.storageUrl ?? payload.pptUrl ?? null
  if (!resolvedStorage || (deck.storageUrl === resolvedStorage && payload.pptUrl === resolvedStorage)) {
    return { ...payload, presentationDeck: deck, aiSuggestions: payload.aiSuggestions ?? null }
  }

  return {
    ...payload,
    pptUrl: payload.pptUrl ?? resolvedStorage,
    presentationDeck: {
      ...deck,
      storageUrl: resolvedStorage,
    },
    aiSuggestions: payload.aiSuggestions ?? null,
  }
}
