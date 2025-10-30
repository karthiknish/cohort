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

Write concise slide-by-slide guidance (Slide 1, Slide 2, etc.) capped at 8 slides. Ensure coverage of industry benchmark comparisons, budget allocation with a 10-20% testing buffer, goal feasibility with suggested targets, agency service recommendations, and a closing CTA. Highlight where assumptions are made because data is missing.

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

  sections.push(`Strategic Requirements:\n- Benchmark the client's budget and marketing performance against industry standards for ${company.industry || 'their sector'}.\n- Recommend an efficient budget split with 10-20% reserved for experimentation and A/B testing.\n- Validate whether stated goals and revenue expectations are achievable; suggest an ideal budget or revenue range when misaligned.\n- Highlight agency-deliverable services (requested and additional recommendations) mapped to the client's objectives.\n- Present insights so they translate cleanly into Gamma slide content.`)

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
