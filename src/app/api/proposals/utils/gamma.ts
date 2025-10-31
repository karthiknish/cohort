import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'

import { adminStorage } from '@/lib/firebase-admin'
import type { ProposalFormData } from '@/lib/proposals'
import type { GammaGenerationStatus } from '@/services/gamma'

export type GammaDeckPayload = {
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

export async function downloadGammaPresentation(url: string): Promise<Buffer> {
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

export async function storeGammaPresentation(userId: string, proposalId: string, pptBuffer: Buffer): Promise<string> {
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

export function truncateGammaInstructions(value: string, limit = 440): string {
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

export function buildGammaInputText(formData: ProposalFormData, summary?: string): string {
  const { company, marketing, goals, scope, timelines, value } = formData
  const sections: string[] = []

  sections.push(
    `Company Overview:\n- Name: ${company.name || 'N/A'}\n- Industry: ${company.industry || 'N/A'}\n- Size: ${company.size || 'N/A'}\n- Locations: ${company.locations || 'N/A'}\n- Website: ${company.website || 'N/A'}`
  )

  sections.push(
    `Marketing Snapshot:\n- Monthly Budget: ${marketing.budget || 'N/A'}\n- Platforms: ${marketing.platforms.length ? marketing.platforms.join(', ') : 'Not specified'}\n- Ad Accounts: ${marketing.adAccounts}\n- Social Handles: ${formatSocialHandles(marketing.socialHandles)}`
  )

  sections.push(
    `Goals & Challenges:\n- Objectives: ${goals.objectives.length ? goals.objectives.join(', ') : 'Not specified'}\n- Target Audience: ${goals.audience || 'Not specified'}\n- Challenges: ${goals.challenges.length ? goals.challenges.join(', ') : 'Not specified'}\n- Additional Notes: ${goals.customChallenge || 'None'}`
  )

  sections.push(
    `Scope & Value:\n- Requested Services: ${scope.services.length ? scope.services.join(', ') : 'Not specified'}\n- Extra Services: ${scope.otherService || 'None'}\n- Proposal Value: ${value.proposalSize || 'Not specified'}\n- Engagement Type: ${value.engagementType || 'Not specified'}\n- Additional Notes: ${value.additionalNotes || 'None'}`
  )

  sections.push(`Timelines:\n- Desired Start: ${timelines.startTime || 'Flexible'}\n- Upcoming Events: ${timelines.upcomingEvents || 'None'}`)

  if (summary && summary.trim().length > 0) {
    sections.push(`Executive Summary:\n${summary.trim()}`)
  }

  return sections.join('\n\n')
}

export function estimateGammaSlideCount(formData: ProposalFormData): number {
  const base = 8
  const serviceWeight = Math.min(formData.scope.services.length * 2, 8)
  const challengeWeight = Math.min(formData.goals.challenges.length, 4)
  const objectiveWeight = Math.min(formData.goals.objectives.length, 4)
  const total = base + serviceWeight + Math.floor((challengeWeight + objectiveWeight) / 2)
  return Math.max(6, Math.min(total, 20))
}

export function buildGammaInstructionPrompt(formData: ProposalFormData): string {
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

export function mapGammaDeckPayload(result: GammaGenerationStatus, instructions: string): GammaDeckPayload {
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

export function findGammaFile(files: Array<{ fileType: string; fileUrl: string }>, desiredType: string): string | undefined {
  const match = files.find((file) => file.fileType.toLowerCase() === desiredType.toLowerCase())
  return match?.fileUrl
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
