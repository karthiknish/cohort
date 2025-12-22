import { apiFetch } from '@/lib/api-client'
import type { ProposalVersion, ProposalVersionInput } from '@/types/proposal-versions'

export async function fetchProposalVersions(proposalId: string): Promise<ProposalVersion[]> {
  const data = await apiFetch<{ versions: ProposalVersion[] }>(`/api/proposal-versions?proposalId=${encodeURIComponent(proposalId)}`)
  return data.versions ?? []
}

export async function fetchProposalVersion(proposalId: string, versionId: string): Promise<ProposalVersion> {
  const data = await apiFetch<{ version: ProposalVersion }>(
    `/api/proposal-versions/${encodeURIComponent(versionId)}?proposalId=${encodeURIComponent(proposalId)}`
  )
  return data.version
}

export async function createProposalVersion(input: ProposalVersionInput): Promise<ProposalVersion> {
  const data = await apiFetch<{ version: ProposalVersion }>('/api/proposal-versions', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.version
}

export async function restoreProposalVersion(
  proposalId: string,
  versionId: string
): Promise<{ success: boolean; restoredFromVersion: number; newVersion: number }> {
  return apiFetch<{ success: boolean; restoredFromVersion: number; newVersion: number }>(`/api/proposal-versions/${encodeURIComponent(versionId)}`, {
    method: 'POST',
    body: JSON.stringify({ proposalId }),
  })
}
