import { authService } from '@/services/auth'
import type { ProposalVersion, ProposalVersionInput } from '@/types/proposal-versions'

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

export async function fetchProposalVersions(proposalId: string): Promise<ProposalVersion[]> {
  const response = await authorizedFetch(`/api/proposal-versions?proposalId=${encodeURIComponent(proposalId)}`)

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to fetch versions')
  }

  const payload = await response.json()
  return payload.versions ?? []
}

export async function fetchProposalVersion(proposalId: string, versionId: string): Promise<ProposalVersion> {
  const response = await authorizedFetch(
    `/api/proposal-versions/${encodeURIComponent(versionId)}?proposalId=${encodeURIComponent(proposalId)}`
  )

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to fetch version')
  }

  const payload = await response.json()
  return payload.version
}

export async function createProposalVersion(input: ProposalVersionInput): Promise<ProposalVersion> {
  const response = await authorizedFetch('/api/proposal-versions', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to create version')
  }

  const payload = await response.json()
  return payload.version
}

export async function restoreProposalVersion(
  proposalId: string,
  versionId: string
): Promise<{ success: boolean; restoredFromVersion: number; newVersion: number }> {
  const response = await authorizedFetch(`/api/proposal-versions/${encodeURIComponent(versionId)}`, {
    method: 'POST',
    body: JSON.stringify({ proposalId }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to restore version')
  }

  return response.json()
}
