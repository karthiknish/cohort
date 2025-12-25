import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import { mergeProposalForm } from '@/lib/proposals'
import { recordProposalDeckReadyNotification } from '@/lib/notifications'
import { resolveWorkspaceIdForUser } from '@/lib/workspace'
import type { ProposalFormData } from '@/lib/proposals'
import {
  ensureProposalGammaDeck,
  parseGammaDeckPayload,
} from '@/app/api/proposals/utils/gamma'
import { createApiHandler } from '@/lib/api-handler'
import { ConflictError, ForbiddenError, NotFoundError, ServiceUnavailableError, ValidationError } from '@/lib/api-errors'

export const POST = createApiHandler(
  { auth: 'required', rateLimit: 'sensitive' },
  async (req, { auth, params }) => {
    const proposalId = params.id as string

    if (!proposalId) {
      throw new ValidationError('Proposal id is required')
    }

    const proposalRef = adminDb
      .collection('users')
      .doc(auth.uid!)
      .collection('proposals')
      .doc(proposalId as string)
    const proposalSnap = await proposalRef.get()

    if (!proposalSnap.exists) {
      throw new NotFoundError('Proposal not found')
    }

    const proposalData = proposalSnap.data() as Record<string, unknown>
    const ownerId = typeof proposalData.ownerId === 'string' ? proposalData.ownerId : null

    if (ownerId && ownerId !== auth.uid) {
      throw new ForbiddenError('Not authorized to prepare this deck')
    }

    const clientIdRaw = typeof proposalData.clientId === 'string' ? proposalData.clientId.trim() : ''
    const clientId = clientIdRaw.length > 0 ? clientIdRaw : null
    const clientName = typeof proposalData.clientName === 'string' && proposalData.clientName.trim().length > 0
      ? proposalData.clientName.trim()
      : null

    const workspaceId = await resolveWorkspaceIdForUser(auth.uid!)

    const existingGammaDeck = parseGammaDeckPayload(proposalData.gammaDeck)
    const storedPptUrl = typeof proposalData.pptUrl === 'string' ? proposalData.pptUrl : null
    const existingStorageUrl = storedPptUrl ?? existingGammaDeck?.storageUrl ?? null

    if (existingStorageUrl) {
      console.log('[ProposalDeck] Returning existing storage URL:', existingStorageUrl)
      return {
        ok: true,
        storageUrl: existingStorageUrl,
        presentationDeck: existingGammaDeck ? { ...existingGammaDeck, storageUrl: existingStorageUrl } : null,
      }
    }

    if (!process.env.GAMMA_API_KEY) {
      throw new ServiceUnavailableError('Presentation generation is not configured')
    }

    const summary = extractAiSummary(proposalData.aiInsights)

    if (!summary) {
      throw new ConflictError('AI summary not available for this proposal')
    }

    const formDataRaw = proposalData.formData
    const formData = mergeProposalForm(
      formDataRaw && typeof formDataRaw === 'object'
        ? (formDataRaw as Partial<ProposalFormData>)
        : null
    )
    const proposalTitle = formData.company.name && formData.company.name.trim().length > 0
      ? formData.company.name.trim()
      : clientName

    void ensureProposalGammaDeck({
      userId: auth.uid!,
      proposalId: proposalId as string,
      formData,
      summary,
      existingDeck: existingGammaDeck,
      existingStorageUrl,
      logContext: '[ProposalDeck]'
    }).then(async (deckResult) => {
      if (deckResult.reused && !deckResult.storageUrl && !deckResult.gammaDeck) {
        return
      }

      const updates: Record<string, unknown> = {
        updatedAt: FieldValue.serverTimestamp(),
      }

      if (deckResult.storageUrl) {
        updates.pptUrl = deckResult.storageUrl
      }

      if (deckResult.gammaDeck) {
        updates.gammaDeck = {
          ...deckResult.gammaDeck,
          generatedAt: FieldValue.serverTimestamp(),
        }
      }

      await proposalRef.update(updates)

      if (!deckResult.reused && deckResult.storageUrl) {
        try {
          await recordProposalDeckReadyNotification({
            workspaceId,
            proposalId,
            proposalTitle: proposalTitle ?? null,
            clientId,
            clientName,
            storageUrl: deckResult.storageUrl,
          })
        } catch (notificationError) {
          console.error('[ProposalDeck] Notification dispatch failed', notificationError)
        }
      }
    }).catch((error) => {
      console.error('[ProposalDeck] Deferred Gamma deck generation failed', error)
    })

    return {
      ok: true,
      storageUrl: existingStorageUrl,
      presentationDeck: existingGammaDeck ? { ...existingGammaDeck, storageUrl: existingStorageUrl } : null,
      queued: true,
    }
  }
)

function extractAiSummary(insights: unknown, depth = 0): string | null {
  if (!insights || depth > 4) {
    return null
  }

  if (typeof insights === 'string') {
    const trimmed = insights.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (typeof insights !== 'object') {
    return null
  }

  if (Array.isArray(insights)) {
    for (const entry of insights) {
      const match = extractAiSummary(entry, depth + 1)
      if (match) {
        return match
      }
    }
    return null
  }

  const record = insights as Record<string, unknown>
  const preferredKeys = ['content', 'summary', 'proposalSummary', 'executiveSummary', 'overview']

  for (const key of preferredKeys) {
    const value = record[key]
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.length > 0) {
        return trimmed
      }
    }
  }

  for (const value of Object.values(record)) {
    const match = extractAiSummary(value, depth + 1)
    if (match) {
      return match
    }
  }

  return null
}
