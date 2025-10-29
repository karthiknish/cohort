import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { mergeProposalForm } from '@/lib/proposals'
import type { ProposalFormData } from '@/lib/proposals'
import { geminiAI } from '@/services/gemini'

interface SubmitBody {
  delivery?: 'summary' | 'summary_and_pdf'
}

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

    const body = (await request.json().catch(() => ({}))) as SubmitBody
    const deliveryMode = body.delivery ?? 'summary'

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
    let generationError: unknown = null
    try {
      summary = await geminiAI.generateContent(summaryPrompt)
    } catch (err) {
      console.error('[ProposalSubmit] AI generation failed', err)
      generationError = err ?? new Error('Failed to generate proposal summary')
      summary = null
    }

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
    }

    if (deliveryMode === 'summary_and_pdf') {
      // Placeholder for future PDF generation
      updates.pdfUrl = typeof proposalData.pdfUrl === 'string' ? proposalData.pdfUrl : null
    }

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

  return `You are an expert marketing consultant creating a polished proposal summary.

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

Create a concise, client-facing summary that includes:
1. Opening paragraph summarising the client's situation and goals.
2. Recommended approach highlighting services and strategic priorities.
3. Next steps and timeline expectations.

Keep the tone professional, confident, and collaborative. Use markdown headings and bullet points for readability.`
}
