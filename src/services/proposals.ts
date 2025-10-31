import { ProposalFormData } from '@/lib/proposals'
import { authService } from '@/services/auth'

export type ProposalStatus = 'draft' | 'in_progress' | 'ready' | 'sent'

export interface ProposalGammaDeck {
  generationId: string | null
  status: string
  instructions: string | null
  webUrl: string | null
  shareUrl: string | null
  pptxUrl: string | null
  pdfUrl: string | null
  generatedFiles: Array<{ fileType: string; fileUrl: string }>
  storageUrl: string | null
}

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
  gammaDeck?: ProposalGammaDeck | null
}

async function authorizedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = await authService.getIdToken()
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Content-Type') && init.method && init.method !== 'GET') {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(input, {
    ...init,
    headers,
  })
}

export async function listProposals(params: { status?: ProposalStatus; clientId?: string } = {}) {
  const search = new URLSearchParams()
  if (params.status) {
    search.set('status', params.status)
  }
  if (params.clientId) {
    search.set('clientId', params.clientId)
  }

  const response = await authorizedFetch(`/api/proposals${search.toString() ? `?${search}` : ''}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to load proposals')
  }

  const payload = await response.json()
  return (payload.proposals as ProposalDraft[]).map(resolveProposalDeck)
}

export async function createProposalDraft(body: Partial<ProposalDraft> = {}) {
  const response = await authorizedFetch('/api/proposals', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to create proposal draft')
  }

  const payload = await response.json()
  return payload.id as string
}

export async function updateProposalDraft(id: string, body: Partial<ProposalDraft>) {
  const response = await authorizedFetch('/api/proposals', {
    method: 'PATCH',
    body: JSON.stringify({ id, ...body }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to update proposal draft')
  }

  return true
}

export async function submitProposalDraft(id: string, delivery: 'summary' | 'summary_and_pdf' = 'summary') {
  const response = await authorizedFetch(`/api/proposals/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ delivery }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to submit proposal draft')
  }

  const payload = await response.json() as {
    ok: boolean
    status: ProposalStatus
    aiInsights: string | null
    pdfUrl?: string | null
    pptUrl?: string | null
    gammaDeck?: ProposalGammaDeck | null
    aiSuggestions?: string | null
  }

  return resolveProposalDeck(payload)
}

export async function deleteProposalDraft(id: string) {
  const response = await authorizedFetch('/api/proposals', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to delete proposal')
  }

  return true
}

export async function prepareProposalDeck(id: string) {
  const response = await authorizedFetch(`/api/proposals/${id}/deck`, {
    method: 'POST',
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to prepare proposal deck')
  }

  const payload = await response.json() as {
    ok: boolean
    storageUrl: string | null
    gammaDeck?: ProposalGammaDeck | null
    aiSuggestions?: string | null
  }

  return resolveProposalDeck(payload)
}

function resolveProposalDeck<T extends { pptUrl?: string | null; gammaDeck?: ProposalGammaDeck | null; aiSuggestions?: string | null }>(payload: T): T {
  const gammaDeck = payload.gammaDeck
  if (!gammaDeck) {
    const fallbackUrl = payload.pptUrl ?? null
    if (fallbackUrl && payload.pptUrl !== fallbackUrl) {
      return { ...payload, pptUrl: fallbackUrl, aiSuggestions: payload.aiSuggestions ?? null }
    }
    return { ...payload, aiSuggestions: payload.aiSuggestions ?? null }
  }

  const resolvedStorage = gammaDeck.storageUrl ?? payload.pptUrl ?? null
  if (!resolvedStorage || (gammaDeck.storageUrl === resolvedStorage && payload.pptUrl === resolvedStorage)) {
    return { ...payload, aiSuggestions: payload.aiSuggestions ?? null }
  }

  return {
    ...payload,
    pptUrl: payload.pptUrl ?? resolvedStorage,
    gammaDeck: {
      ...gammaDeck,
      storageUrl: resolvedStorage,
    },
    aiSuggestions: payload.aiSuggestions ?? null,
  }
}
