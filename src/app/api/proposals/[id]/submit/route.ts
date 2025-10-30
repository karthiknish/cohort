import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'

import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'

import { adminDb, adminStorage } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { mergeProposalForm } from '@/lib/proposals'
import type { ProposalFormData } from '@/lib/proposals'
import { geminiAI } from '@/services/gemini'

interface SubmitBody {
  delivery?: 'summary' | 'summary_and_pdf'
}

async function storeProposalPdf(userId: string, proposalId: string, pdfBuffer: Buffer) {
  const bucket = adminStorage.bucket()
  const filePath = `proposals/${userId}/${proposalId}.pdf`
  const file = bucket.file(filePath)
  const downloadToken = randomUUID()

  await file.save(pdfBuffer, {
    resumable: false,
    contentType: 'application/pdf',
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  })

  const encodedPath = encodeURIComponent(filePath)
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`
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

    let generatedPdfUrl: string | null = null

    if (deliveryMode === 'summary_and_pdf') {
      try {
        const pdfBuffer = await generateProposalPdf(formData, summary ?? undefined)
        const pdfDownloadUrl = await storeProposalPdf(auth.uid, proposalId, pdfBuffer)
        generatedPdfUrl = pdfDownloadUrl
        updates.pdfUrl = pdfDownloadUrl
      } catch (pdfError) {
        console.error('[ProposalSubmit] PDF generation failed', pdfError)
        updates.pdfUrl = typeof proposalData.pdfUrl === 'string' ? proposalData.pdfUrl : null
      }
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
      pdfUrl:
        deliveryMode === 'summary_and_pdf'
          ? generatedPdfUrl ?? (typeof updates.pdfUrl === 'string' ? updates.pdfUrl : null)
          : typeof proposalData.pdfUrl === 'string'
            ? proposalData.pdfUrl
            : null,
    })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[ProposalSubmit] POST failed', error)
    return NextResponse.json({ error: 'Failed to submit proposal' }, { status: 500 })
  }
}

async function generateProposalPdf(formData: ReturnType<typeof mergeProposalForm>, summary?: string | null) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const marginX = 40
  const maxWidth = 515
  let cursorY = 60

  const addHeading = (text: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(text, marginX, cursorY)
    cursorY += 24
  }

  const addSubheading = (text: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text(text, marginX, cursorY)
    cursorY += 18
  }

  const addParagraph = (text: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    const lines = doc.splitTextToSize(text, maxWidth)
    lines.forEach((line: string) => {
      if (cursorY > 780) {
        doc.addPage()
        cursorY = 60
      }
      doc.text(line, marginX, cursorY)
      cursorY += 14
    })
    cursorY += 8
  }

  const addList = (items: string[]) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    items.forEach((item: string) => {
      if (cursorY > 780) {
        doc.addPage()
        cursorY = 60
      }
      doc.text(`• ${item}`, marginX, cursorY)
      cursorY += 14
    })
    cursorY += 6
  }

  addHeading('Cohorts Proposal Overview')
  addParagraph(`Generated on ${new Date().toLocaleString()}`)

  addSubheading('Executive Summary')
  addParagraph(summary && summary.trim().length > 0 ? summary : 'Summary currently unavailable. Regenerate the proposal to include AI insights.')

  const { company, marketing, goals, scope, timelines, value } = formData

  addSubheading('Company Snapshot')
  addParagraph(`Name: ${company.name || '—'}`)
  addParagraph(`Industry: ${company.industry || '—'}`)
  addParagraph(`Size: ${company.size || '—'}`)
  addParagraph(`Website: ${company.website || '—'}`)
  addParagraph(`Locations: ${company.locations || '—'}`)

  addSubheading('Marketing & Advertising')
  addParagraph(`Monthly Budget: ${marketing.budget || '—'}`)
  addParagraph(`Active Platforms: ${marketing.platforms.length ? marketing.platforms.join(', ') : 'None provided'}`)
  addParagraph(`Ad Accounts in Place: ${marketing.adAccounts}`)
  if (Object.keys(marketing.socialHandles ?? {}).length) {
    addParagraph('Social Handles:')
    addList(Object.entries(marketing.socialHandles).map(([network, handle]) => `${network}: ${handle}`))
  }

  addSubheading('Business Goals & Challenges')
  addParagraph(`Objectives: ${goals.objectives.length ? goals.objectives.join(', ') : 'Not specified'}`)
  addParagraph(`Target Audience: ${goals.audience || 'Not specified'}`)
  addParagraph(`Challenges: ${goals.challenges.length ? goals.challenges.join(', ') : 'Not specified'}`)
  if (goals.customChallenge) {
    addParagraph(`Additional Notes: ${goals.customChallenge}`)
  }

  addSubheading('Scope of Work')
  addParagraph(`Requested Services: ${scope.services.length ? scope.services.join(', ') : 'Not specified'}`)
  if (scope.otherService) {
    addParagraph(`Additional Services: ${scope.otherService}`)
  }

  addSubheading('Timelines & Priorities')
  addParagraph(`Start Time: ${timelines.startTime || 'Flexible'}`)
  addParagraph(`Upcoming Events: ${timelines.upcomingEvents || 'None noted'}`)

  addSubheading('Value & Engagement')
  addParagraph(`Proposal Value: ${value.proposalSize || 'Not specified'}`)
  addParagraph(`Engagement Type: ${value.engagementType || 'Not specified'}`)
  if (value.additionalNotes) {
    addParagraph(`Additional Notes: ${value.additionalNotes}`)
  }

  const arrayBuffer = doc.output('arraybuffer') as ArrayBuffer
  return Buffer.from(arrayBuffer)
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
