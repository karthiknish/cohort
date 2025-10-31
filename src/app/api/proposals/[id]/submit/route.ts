import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { mergeProposalForm } from '@/lib/proposals'
import type { ProposalFormData } from '@/lib/proposals'
import { geminiAI } from '@/services/gemini'
import {
  ensureProposalGammaDeck,
  generateProposalSuggestions,
  parseGammaDeckPayload,
  type GammaDeckPayload,
  type GammaDeckProcessResult,
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
    const previousGammaDeck = parseGammaDeckPayload(proposalData.gammaDeck)
    const previousPptUrl = typeof proposalData.pptUrl === 'string' ? proposalData.pptUrl : null

    if (ownerId && ownerId !== auth.uid) {
      return NextResponse.json({ error: 'Not authorized to submit this proposal' }, { status: 403 })
    }

    const formDataRaw = proposalData.formData
    const formData = mergeProposalForm(
      formDataRaw && typeof formDataRaw === 'object'
        ? (formDataRaw as Partial<ProposalFormData>)
        : null
    )

    await proposalRef.update({
      status: 'in_progress',
      updatedAt: FieldValue.serverTimestamp(),
    })

    const summaryPrompt = buildProposalSummaryPrompt(formData)

    let summary: string | null = null
    let suggestions: string | null = null
    let generationError: unknown = null
    try {
      summary = await geminiAI.generateContent(summaryPrompt)
      suggestions = await generateProposalSuggestions(formData, summary, '[ProposalSubmit]')
    } catch (err) {
      console.error('[ProposalSubmit] AI generation failed', err)
      generationError = err ?? new Error('Failed to generate proposal summary')
      summary = null
      if (!suggestions) {
        try {
          suggestions = await generateProposalSuggestions(formData, null, '[ProposalSubmit]')
        } catch (suggestionError) {
          console.error('[ProposalSubmit] Gemini suggestions fallback failed', suggestionError)
        }
      }
    }

    let gammaDeckResult: GammaDeckProcessResult | null = null
    if (process.env.GAMMA_API_KEY) {
      try {
        gammaDeckResult = await ensureProposalGammaDeck({
          userId: auth.uid,
          proposalId,
          formData,
          summary,
          existingDeck: previousGammaDeck ?? undefined,
          existingStorageUrl: previousPptUrl ?? previousGammaDeck?.storageUrl ?? null,
          logContext: '[ProposalSubmit]',
        })
      } catch (gammaError) {
        console.error('[ProposalSubmit] Gamma deck pipeline failed', gammaError)
        return NextResponse.json({ error: 'Failed to prepare Gamma deck' }, { status: 502 })
      }
    }

    const gammaDeck: GammaDeckPayload | null = gammaDeckResult?.gammaDeck
      ?? (previousGammaDeck
        ? { ...previousGammaDeck, storageUrl: previousGammaDeck.storageUrl ?? previousPptUrl ?? null }
        : null)

    const storedPptUrl: string | null = gammaDeckResult?.storageUrl
      ?? previousPptUrl
      ?? previousGammaDeck?.storageUrl
      ?? null

    const existingInsights = proposalData.aiInsights
    const aiInsights = summary
      ? {
          type: 'summary',
          content: summary,
          generatedAt: FieldValue.serverTimestamp(),
        }
      : (typeof existingInsights === 'object' && existingInsights !== null ? existingInsights : null)

    const nextStatus: 'ready' | 'in_progress' = summary ? 'ready' : 'in_progress'

    const updates: Record<string, unknown> = {
      status: nextStatus,
      aiInsights,
      updatedAt: FieldValue.serverTimestamp(),
      pptUrl: storedPptUrl ?? previousPptUrl,
    }

    if (gammaDeck) {
      updates.gammaDeck = {
        ...gammaDeck,
        generatedAt: FieldValue.serverTimestamp(),
      }
    }

    updates.aiSuggestions = suggestions ?? null

    await proposalRef.update(updates)

    if (generationError) {
      const message = 'Unable to generate an AI summary right now. Please try again in a few minutes.'
      return NextResponse.json(
        {
          ok: false,
          status: nextStatus,
          aiInsights: null,
          error: message,
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      ok: true,
      status: nextStatus,
      aiInsights: summary,
      pptUrl: storedPptUrl ?? previousPptUrl,
      gammaDeck,
      aiSuggestions: suggestions,
    })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[ProposalSubmit] POST failed', error)
    return NextResponse.json({ error: 'Failed to submit proposal' }, { status: 500 })
  }
}

function buildProposalSummaryPrompt(formData: ReturnType<typeof mergeProposalForm>) {
  const { company, marketing, goals, scope, timelines, value } = formData

  return `You are an expert marketing consultant creating a presentation-ready proposal outline.

Client Company:
- Name: ${company.name || 'N/A'}
- Industry: ${company.industry || 'N/A'}
- Size: ${company.size || 'N/A'}
- Website: ${company.website || 'N/A'}
- Locations: ${company.locations || 'N/A'}

Marketing Context:
- Monthly budget: ${marketing.budget || 'Not specified'}
- Active platforms: ${marketing.platforms.length ? marketing.platforms.join(', ') : 'None provided'}
- Ad accounts in place: ${marketing.adAccounts}

Business Goals:
- Primary objectives: ${goals.objectives.length ? goals.objectives.join(', ') : 'Not specified'}
- Target audience: ${goals.audience || 'Not specified'}
- Key challenges: ${goals.challenges.length ? goals.challenges.join(', ') : 'Not specified'}

Scope of Work:
- Requested services: ${scope.services.length ? scope.services.join(', ') : 'Not specified'}
- Additional details: ${scope.otherService || 'None'}

Timeline & Priorities:
- Desired start time: ${timelines.startTime || 'Flexible'}
- Upcoming events: ${timelines.upcomingEvents || 'Not specified'}

Proposal Value:
- Expected value: ${value.proposalSize || 'Not specified'}
- Engagement type: ${value.engagementType || 'Not specified'}
- Additional notes: ${value.additionalNotes || 'None'}

Structured Output Requirements:
- Produce slide-by-slide markdown optimised for Gamma ingestion.
- Each slide must begin with "Slide X: Title" followed by 3-5 bullet points using "- ".
- Maintain a professional, confident, collaborative tone.
- Call out missing or ambiguous inputs so the client knows what to clarify.

Mandatory Content Coverage:
1. Executive context that frames the client's situation and priority goals.
2. Comparison of client budget/metrics against industry-standard benchmarks for ${company.industry || 'their industry'}, highlighting gaps or advantages.
3. Budget allocation guidance that states the recommended working budget, the portion earmarked for core execution, and 10-20% reserved for experimentation/A/B testing.
4. Goal feasibility review that challenges or validates stated targets; if budget and expected revenue are misaligned, propose an ideal budget range and achievable revenue projection, or request additional data if none was provided.
5. Agency value proposition outlining services the agency can deliver (requested and recommended add-ons) and why they matter.
6. Next steps / call-to-action covering timeline expectations and stakeholder asks.

If numerical inputs are unclear, make reasonable assumptions and note them explicitly.`
}
