import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import { mergeProposalForm } from '@/lib/proposals'
import type { ProposalFormData } from '@/lib/proposals'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { geminiAI } from '@/services/gemini'
import { gammaService } from '@/services/gamma'
import {
  buildGammaInputText,
  buildGammaInstructionPrompt,
  downloadGammaPresentation,
  estimateGammaSlideCount,
  GammaDeckPayload,
  mapGammaDeckPayload,
  storeGammaPresentation,
  truncateGammaInstructions,
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

    const existingGammaDeck = parseGammaDeckPayload(proposalData.gammaDeck)
    const storedPptUrl = typeof proposalData.pptUrl === 'string' ? proposalData.pptUrl : null
    const existingStorageUrl = storedPptUrl ?? existingGammaDeck?.storageUrl ?? null

    if (existingStorageUrl) {
      return NextResponse.json({
        ok: true,
        storageUrl: existingStorageUrl,
        gammaDeck: existingGammaDeck ? { ...existingGammaDeck, storageUrl: existingStorageUrl } : null,
      })
    }

    if (existingGammaDeck?.pptxUrl) {
      try {
        const pptBuffer = await downloadGammaPresentation(existingGammaDeck.pptxUrl)
        const storedUrl = await storeGammaPresentation(auth.uid, proposalId, pptBuffer)
        await proposalRef.update({
          pptUrl: storedUrl,
          updatedAt: FieldValue.serverTimestamp(),
          gammaDeck: {
            ...existingGammaDeck,
            storageUrl: storedUrl,
            generatedAt: FieldValue.serverTimestamp(),
          },
        })

        return NextResponse.json({
          ok: true,
          storageUrl: storedUrl,
          gammaDeck: { ...existingGammaDeck, storageUrl: storedUrl },
        })
      } catch (reuseError) {
        console.error('[ProposalDeck] reuse existing Gamma deck failed', reuseError)
        return NextResponse.json({ error: 'Failed to save existing Gamma deck to storage' }, { status: 502 })
      }
    }

    if (!process.env.GAMMA_API_KEY) {
      return NextResponse.json({
        error: 'Gamma integration is not configured',
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

    let instructions = existingGammaDeck?.instructions && existingGammaDeck.instructions.trim().length
      ? existingGammaDeck.instructions
      : null

    if (!instructions) {
      try {
        const instructionPrompt = buildGammaInstructionPrompt(formData)
        const rawInstructions = await geminiAI.generateContent(instructionPrompt)
        instructions = truncateGammaInstructions(rawInstructions)
      } catch (instructionError) {
        console.error('[ProposalDeck] instruction generation failed', instructionError)
      }
    }

    if (!instructions) {
      instructions = truncateGammaInstructions(`Slide 1: Executive Summary\nSlide 2: Objectives & KPIs\nSlide 3: Strategy Overview\nSlide 4: Budget Allocation (include 10-20% testing buffer)\nSlide 5: Execution Roadmap\nSlide 6: Optimization & Testing\nSlide 7: Next Steps & Call-to-Action`)
    }

    const gammaInputText = buildGammaInputText(formData, summary)

    let gammaDeck: GammaDeckPayload | null = null
    let storedDeckUrl: string | null = null

    try {
      const deckResult = await gammaService.generatePresentation({
        inputText: gammaInputText,
        additionalInstructions: instructions,
        format: 'presentation',
        textMode: 'generate',
        numCards: estimateGammaSlideCount(formData),
        exportAs: 'pptx',
      })

      gammaDeck = mapGammaDeckPayload(deckResult, instructions)
    } catch (gammaError) {
      console.error('[ProposalDeck] Gamma generation failed', gammaError)
      return NextResponse.json({ error: 'Failed to start Gamma deck generation' }, { status: 502 })
    }

    if (gammaDeck?.pptxUrl) {
      try {
        const pptBuffer = await downloadGammaPresentation(gammaDeck.pptxUrl)
        storedDeckUrl = await storeGammaPresentation(auth.uid, proposalId, pptBuffer)
        gammaDeck = { ...gammaDeck, storageUrl: storedDeckUrl }
      } catch (storageError) {
        console.error('[ProposalDeck] PPT storage failed', storageError)
        return NextResponse.json({ error: 'Failed to save Gamma deck to storage' }, { status: 502 })
      }
    }

    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
      gammaDeck: gammaDeck
        ? {
            ...gammaDeck,
            generatedAt: FieldValue.serverTimestamp(),
          }
        : FieldValue.delete(),
    }

    if (storedDeckUrl) {
      updates.pptUrl = storedDeckUrl
    }

    await proposalRef.update(updates)

    return NextResponse.json({
      ok: true,
      storageUrl: storedDeckUrl,
      gammaDeck,
    })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[ProposalDeck] POST failed', error)
    return NextResponse.json({ error: 'Failed to prepare Gamma deck' }, { status: 500 })
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

function parseGammaDeckPayload(input: unknown): GammaDeckPayload | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const record = input as Record<string, unknown>
  const generatedFilesRaw = Array.isArray(record.generatedFiles) ? record.generatedFiles : []
  const generatedFiles = generatedFilesRaw
    .map((file) => {
      if (!file || typeof file !== 'object') {
        return null
      }
      const entry = file as Record<string, unknown>
      const fileType = typeof entry.fileType === 'string' ? entry.fileType : typeof entry.type === 'string' ? entry.type : null
      const fileUrl = typeof entry.fileUrl === 'string' ? entry.fileUrl : typeof entry.url === 'string' ? entry.url : null
      if (!fileType || !fileUrl) {
        return null
      }
      return { fileType, fileUrl }
    })
    .filter((value): value is { fileType: string; fileUrl: string } => Boolean(value))

  return {
    generationId: typeof record.generationId === 'string' ? record.generationId : '',
    status: typeof record.status === 'string' ? record.status : 'unknown',
    instructions: typeof record.instructions === 'string' ? record.instructions : '',
    webUrl: typeof record.webUrl === 'string' ? record.webUrl : null,
    shareUrl: typeof record.shareUrl === 'string' ? record.shareUrl : null,
    pptxUrl: typeof record.pptxUrl === 'string' ? record.pptxUrl : null,
    pdfUrl: typeof record.pdfUrl === 'string' ? record.pdfUrl : null,
    generatedFiles,
    storageUrl: typeof record.storageUrl === 'string' ? record.storageUrl : null,
  }
}
