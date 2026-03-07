import { mergeProposalForm } from '../../../src/lib/proposals'

import type { AgentRequestContextType } from '../types'

import { asNonEmptyString, asRecord, toStringRecord } from './values'

function mergeProposalPatch(existingForm: Record<string, unknown>, patch: Record<string, unknown>) {
  const safeExisting = mergeProposalForm(existingForm)
  const next = {
    ...safeExisting,
    ...patch,
    company: {
      ...safeExisting.company,
      ...(asRecord(patch.company) ?? {}),
    },
    marketing: {
      ...safeExisting.marketing,
      ...(asRecord(patch.marketing) ?? {}),
      socialHandles: {
        ...safeExisting.marketing.socialHandles,
        ...toStringRecord(asRecord(patch.marketing)?.socialHandles),
      },
    },
    goals: {
      ...safeExisting.goals,
      ...(asRecord(patch.goals) ?? {}),
    },
    scope: {
      ...safeExisting.scope,
      ...(asRecord(patch.scope) ?? {}),
    },
    timelines: {
      ...safeExisting.timelines,
      ...(asRecord(patch.timelines) ?? {}),
    },
    value: {
      ...safeExisting.value,
      ...(asRecord(patch.value) ?? {}),
    },
  }

  return mergeProposalForm(next)
}

function resolveProposalId(params: Record<string, unknown>, context?: AgentRequestContextType): string | null {
  return (
    asNonEmptyString(params.proposalId) ??
    asNonEmptyString(params.legacyId) ??
    asNonEmptyString(params.id) ??
    asNonEmptyString(context?.activeProposalId ?? null)
  )
}

export {
  mergeProposalPatch,
  resolveProposalId,
}