import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

import { db } from '@/lib/firebase'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { mergeProposalForm } from '@/lib/proposals'
import { geminiAI } from '@/services/gemini'

interface SubmitBody {
  delivery?: 'summary' | 'summary_and_pdf'
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const proposalId = params.id

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

    const proposalRef = doc(db, `users/${auth.uid}/proposals/${proposalId}`)
    const proposalSnap = await getDoc(proposalRef)

    if (!proposalSnap.exists()) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    const proposalData = proposalSnap.data()

    if (proposalData.ownerId && proposalData.ownerId !== auth.uid) {
      return NextResponse.json({ error: 'Not authorized to submit this proposal' }, { status: 403 })
    }

    const formData = mergeProposalForm(proposalData.formData)

    await updateDoc(proposalRef, {
      status: 'in_progress',
      updatedAt: serverTimestamp(),
    })

    const summaryPrompt = buildProposalSummaryPrompt(formData)

    let summary: string | null = null
    try {
      summary = await geminiAI.generateContent(summaryPrompt)
    } catch (err) {
      console.error('[ProposalSubmit] AI generation failed', err)
      summary = null
    }

    const aiInsights = summary
      ? {
          type: 'summary',
          content: summary,
          generatedAt: serverTimestamp(),
        }
      : proposalData.aiInsights ?? null

    const updates: Record<string, unknown> = {
      status: summary ? 'ready' : 'in_progress',
      aiInsights,
      updatedAt: serverTimestamp(),
    }

    if (deliveryMode === 'summary_and_pdf') {
      // Placeholder for future PDF generation
      updates.pdfUrl = proposalData.pdfUrl ?? null
    }

    await updateDoc(proposalRef, updates)

    return NextResponse.json({
      ok: true,
      status: updates.status,
      aiInsights: summary,
    })
  } catch (error: any) {
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
