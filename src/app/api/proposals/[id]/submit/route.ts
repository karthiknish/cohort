import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'

import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'

import { adminDb, adminStorage } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { mergeProposalForm } from '@/lib/proposals'
import type { ProposalFormData } from '@/lib/proposals'
import { geminiAI } from '@/services/gemini'
import { gammaService } from '@/services/gamma'
import type { GammaGenerationStatus } from '@/services/gamma'

type GammaDeckPayload = {
  generationId: string
  status: string
  instructions: string
  webUrl: string | null
  shareUrl: string | null
  pptxUrl: string | null
  pdfUrl: string | null
  generatedFiles: Array<{ fileType: string; fileUrl: string }>
  storageUrl: string | null
}

async function downloadGammaPresentation(url: string): Promise<Buffer> {
  const apiKey = process.env.GAMMA_API_KEY
  if (!apiKey) {
    throw new Error('GAMMA_API_KEY is not configured')
  }

  const response = await fetch(url, {
    headers: {
      'X-API-KEY': apiKey,
      accept: 'application/octet-stream',
    },
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(`Gamma file download failed (${response.status}): ${details || 'Unknown error'}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function storeProposalPresentation(userId: string, proposalId: string, pptBuffer: Buffer) {
  const bucket = adminStorage.bucket()
  const filePath = `proposals/${userId}/${proposalId}.pptx`
  const file = bucket.file(filePath)
  const downloadToken = randomUUID()

  await file.save(pptBuffer, {
    resumable: false,
    contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
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
    const previousGammaDeck = (typeof proposalData.gammaDeck === 'object' && proposalData.gammaDeck !== null
      ? (proposalData.gammaDeck as Partial<GammaDeckPayload>)
      : null)
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
    let generationError: unknown = null
    try {
      summary = await geminiAI.generateContent(summaryPrompt)
    } catch (err) {
      console.error('[ProposalSubmit] AI generation failed', err)
      generationError = err ?? new Error('Failed to generate proposal summary')
      summary = null
    }

    let gammaDeck: GammaDeckPayload | null = null
    let storedPptUrl: string | null = null
    if (process.env.GAMMA_API_KEY) {
      try {
        const gammaInputText = buildGammaInputText(formData, summary ?? undefined)
        const instructionPrompt = buildGammaInstructionPrompt(formData)
        const rawInstructions = await geminiAI.generateContent(instructionPrompt)
        const instructions = truncateGammaInstructions(rawInstructions)

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
        console.error('[ProposalSubmit] Gamma generation failed', gammaError)
      }
    }

    if (gammaDeck?.pptxUrl) {
      try {
        const pptBuffer = await downloadGammaPresentation(gammaDeck.pptxUrl)
        storedPptUrl = await storeProposalPresentation(auth.uid, proposalId, pptBuffer)
        gammaDeck = { ...gammaDeck, storageUrl: storedPptUrl }
      } catch (pptError) {
        console.error('[ProposalSubmit] PPT storage failed', pptError)
      }
    }

    if (gammaDeck && !gammaDeck.storageUrl && typeof previousGammaDeck?.storageUrl === 'string') {
      gammaDeck = { ...gammaDeck, storageUrl: previousGammaDeck.storageUrl }
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
      pptUrl: storedPptUrl ?? previousPptUrl,
    }

    if (gammaDeck) {
      updates.gammaDeck = {
        ...gammaDeck,
        generatedAt: FieldValue.serverTimestamp(),
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
      pptUrl: storedPptUrl ?? previousPptUrl,
      gammaDeck,
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

function buildGammaInstructionPrompt(formData: ReturnType<typeof mergeProposalForm>) {
  const { company, goals, scope, timelines, value } = formData
  const services = scope.services.length ? scope.services.join(', ') : 'general marketing support'
  const objectives = goals.objectives.length ? goals.objectives.join(', ') : 'brand growth and lead generation'

  return `You are a senior presentation designer preparing instructions for Gamma, an AI slide generator.

Client: ${company.name || 'Unnamed company'} (${company.industry || 'industry not specified'})
Primary services: ${services}
Primary objectives: ${objectives}
Timeline note: ${timelines.startTime || 'flexible start'}
Engagement type: ${value.engagementType || 'not specified'}

Write concise slide-by-slide guidance (Slide 1, Slide 2, etc.) capped at 8 slides. Focus on a strategic marketing proposal tailored to the client. Include:
- Slide titles that feel executive-ready.
- Bullet points per slide highlighting key talking points.
- A professional, optimistic tone with clear next steps.
- References to provided goals, challenges, and value expectations when relevant.

Output plain text only. Avoid markdown, numbering beyond "Slide X", and keep total length under 450 characters. End with a call-to-action slide.`
}

function buildGammaInputText(formData: ReturnType<typeof mergeProposalForm>, summary?: string) {
  const { company, marketing, goals, scope, timelines, value } = formData
  const sections: string[] = []

  sections.push(`Company Overview:\n- Name: ${company.name || 'N/A'}\n- Industry: ${company.industry || 'N/A'}\n- Size: ${company.size || 'N/A'}\n- Locations: ${company.locations || 'N/A'}\n- Website: ${company.website || 'N/A'}`)

  sections.push(`Marketing Snapshot:\n- Monthly Budget: ${marketing.budget || 'N/A'}\n- Platforms: ${marketing.platforms.length ? marketing.platforms.join(', ') : 'Not specified'}\n- Ad Accounts: ${marketing.adAccounts}\n- Social Handles: ${formatSocialHandles(marketing.socialHandles)}`)

  sections.push(`Goals & Challenges:\n- Objectives: ${goals.objectives.length ? goals.objectives.join(', ') : 'Not specified'}\n- Target Audience: ${goals.audience || 'Not specified'}\n- Challenges: ${goals.challenges.length ? goals.challenges.join(', ') : 'Not specified'}\n- Additional Notes: ${goals.customChallenge || 'None'}`)

  sections.push(`Scope & Value:\n- Requested Services: ${scope.services.length ? scope.services.join(', ') : 'Not specified'}\n- Extra Services: ${scope.otherService || 'None'}\n- Proposal Value: ${value.proposalSize || 'Not specified'}\n- Engagement Type: ${value.engagementType || 'Not specified'}\n- Additional Notes: ${value.additionalNotes || 'None'}`)

  sections.push(`Timelines:\n- Desired Start: ${timelines.startTime || 'Flexible'}\n- Upcoming Events: ${timelines.upcomingEvents || 'None'}`)

  if (summary && summary.trim().length > 0) {
    sections.push(`Executive Summary:\n${summary.trim()}`)
  }

  return sections.join('\n\n')
}

function formatSocialHandles(handles: Record<string, string> | undefined): string {
  if (!handles || typeof handles !== 'object') {
    return 'Not provided'
  }

  const entries = Object.entries(handles).filter(([network, value]) => network && value)
  if (!entries.length) {
    return 'Not provided'
  }

  return entries.map(([network, value]) => `${network}: ${value}`).join(', ')
}

function truncateGammaInstructions(value: string, limit = 440): string {
  if (!value) {
    return ''
  }

  const sanitized = value.replace(/\r/g, '').trim()
  if (sanitized.length <= limit) {
    return sanitized
  }

  const truncated = sanitized.slice(0, limit)
  return truncated.replace(/\s+\S*$/, '').trimEnd()
}

function estimateGammaSlideCount(formData: ReturnType<typeof mergeProposalForm>): number {
  const base = 8
  const serviceWeight = Math.min(formData.scope.services.length * 2, 8)
  const challengeWeight = Math.min(formData.goals.challenges.length, 4)
  const objectiveWeight = Math.min(formData.goals.objectives.length, 4)
  const total = base + serviceWeight + Math.floor((challengeWeight + objectiveWeight) / 2)
  return Math.max(6, Math.min(total, 20))
}

function mapGammaDeckPayload(result: GammaGenerationStatus, instructions: string): GammaDeckPayload {
  const pptx = findGammaFile(result.generatedFiles, 'pptx')
  const pdf = findGammaFile(result.generatedFiles, 'pdf')

  return {
    generationId: result.generationId,
    status: result.status,
    instructions,
    webUrl: result.webAppUrl,
    shareUrl: result.shareUrl,
    pptxUrl: pptx ?? null,
    pdfUrl: pdf ?? null,
    generatedFiles: result.generatedFiles,
    storageUrl: null,
  }
}

function findGammaFile(files: Array<{ fileType: string; fileUrl: string }>, desiredType: string): string | undefined {
  const match = files.find((file) => file.fileType.toLowerCase() === desiredType.toLowerCase())
  return match?.fileUrl
}
