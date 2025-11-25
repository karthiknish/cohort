import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import { mergeProposalForm } from '@/lib/proposals'
import { recordProposalDeckReadyNotification } from '@/lib/notifications'
import { resolveWorkspaceIdForUser } from '@/lib/workspace'
import type { ProposalFormData } from '@/lib/proposals'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import {
  ensureProposalGammaDeck,
  parseGammaDeckPayload,
} from '@/app/api/proposals/utils/gamma'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: proposalId } = await context.params

  if (!proposalId) {
    return NextResponse.json({ error: 'Proposal id is required' }, { status: 400 })
  }

  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const proposalRef = adminDb
      .collection('users')
      .doc(auth.uid)
      .collection('proposals')
      .doc(proposalId)
    const proposalSnap = await proposalRef.get()

    if (!proposalSnap.exists) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    const proposalData = proposalSnap.data() as Record<string, unknown>
    const ownerId = typeof proposalData.ownerId === 'string' ? proposalData.ownerId : null

    if (ownerId && ownerId !== auth.uid) {
      return NextResponse.json({ error: 'Not authorized to prepare this deck' }, { status: 403 })
    }

    const clientIdRaw = typeof proposalData.clientId === 'string' ? proposalData.clientId.trim() : ''
    const clientId = clientIdRaw.length > 0 ? clientIdRaw : null
    const clientName = typeof proposalData.clientName === 'string' && proposalData.clientName.trim().length > 0
      ? proposalData.clientName.trim()
      : null

    const workspaceId = await resolveWorkspaceIdForUser(auth.uid)

    const existingGammaDeck = parseGammaDeckPayload(proposalData.gammaDeck)
    const storedPptUrl = typeof proposalData.pptUrl === 'string' ? proposalData.pptUrl : null
    const existingStorageUrl = storedPptUrl ?? existingGammaDeck?.storageUrl ?? null

    if (existingStorageUrl) {
      console.log('[ProposalDeck] Returning existing storage URL:', existingStorageUrl)
      return NextResponse.json({
        ok: true,
        storageUrl: existingStorageUrl,
        presentationDeck: existingGammaDeck ? { ...existingGammaDeck, storageUrl: existingStorageUrl } : null,
      })
    }

    if (!process.env.GAMMA_API_KEY) {
      return NextResponse.json({
        error: 'Presentation generation is not configured',
      }, { status: 503 })
    }

    const summary = extractAiSummary(proposalData.aiInsights)

    if (!summary) {
      return NextResponse.json({
        error: 'AI summary not available for this proposal',
      }, { status: 409 })
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
      userId: auth.uid,
      proposalId,
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

    return NextResponse.json({
      ok: true,
      storageUrl: existingStorageUrl,
      presentationDeck: existingGammaDeck ? { ...existingGammaDeck, storageUrl: existingStorageUrl } : null,
      queued: true,
    })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[ProposalDeck] POST failed for proposal:', proposalId, error)
    return NextResponse.json({ error: 'Failed to prepare presentation deck' }, { status: 500 })
  }
}

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
