import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'

import { adminStorage } from '@/lib/firebase-admin'
import type { ProposalFormData } from '@/lib/proposals'
import { geminiAI } from '@/services/gemini'
import { gammaService } from '@/services/gamma'
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

export type GammaDeckProcessResult = {
  gammaDeck: GammaDeckPayload | null
  storageUrl: string | null
  instructions: string | null
  reused: boolean
}

export interface EnsureProposalGammaDeckArgs {
  userId: string
  proposalId: string
  formData: ProposalFormData
  summary?: string | null
  existingDeck?: GammaDeckPayload | null
  existingStorageUrl?: string | null
  instructions?: string | null
  logContext?: string
}

const FALLBACK_GAMMA_INSTRUCTIONS = `Slide 1: Executive Summary\nSlide 2: Objectives & KPIs\nSlide 3: Strategy Overview\nSlide 4: Budget Allocation (distribute 100% across channels and note any testing allowance)\nSlide 5: Execution Roadmap\nSlide 6: Optimization & Testing\nSlide 7: Next Steps & Call-to-Action`

const DEFAULT_GAMMA_THEME = 'Oasis'
const DEFAULT_IMAGE_SOURCE = 'unsplash'

export async function downloadGammaPresentation(url: string, retries = 3, backoffMs = 2000): Promise<Buffer> {
  console.log('[GammaUtils] Starting download from Gamma URL:', url)
  const apiKey = process.env.GAMMA_API_KEY
  if (!apiKey) {
    throw new Error('GAMMA_API_KEY is not configured')
  }

  const retryableStatuses = new Set([404, 423, 425, 429, 500, 502, 503, 504])
  let attempt = 0
  let lastError: unknown = null

  while (attempt <= retries) {
    attempt += 1
    try {
      console.log('[GammaUtils] Making request to Gamma API', { attempt, retries })
      const response = await fetch(url, {
        headers: {
          'X-API-KEY': apiKey,
          accept: 'application/octet-stream',
        },
      })

      if (!response.ok) {
        const details = await response.text().catch(() => '')
        console.error('[GammaUtils] Download failed:', {
          status: response.status,
          statusText: response.statusText,
          details,
          attempt,
        })

        if (retryableStatuses.has(response.status) && attempt <= retries) {
          const delayMs = backoffMs * attempt
          console.log('[GammaUtils] Retrying download after backoff', { delayMs })
          await delay(delayMs)
          continue
        }

        throw new Error(`Gamma file download failed (${response.status}): ${details || 'Unknown error'}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      console.log('[GammaUtils] Successfully downloaded PPT buffer:', {
        size: buffer.length,
        contentType: response.headers.get('content-type'),
        attempt,
      })
      return buffer
    } catch (error: unknown) {
      lastError = error
      console.error('[GammaUtils] Download attempt failed', { attempt, error })
      if (attempt > retries) {
        break
      }
      const delayMs = backoffMs * attempt
      console.log('[GammaUtils] Waiting before retrying download', { delayMs })
      await delay(delayMs)
    }
  }

  throw (lastError instanceof Error ? lastError : new Error('Gamma file download failed after retries'))
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function storeGammaPresentation(userId: string, proposalId: string, pptBuffer: Buffer): Promise<string> {
  console.log('[GammaUtils] Starting storage for proposal:', {
    userId,
    proposalId,
    bufferSize: pptBuffer.length
  })
  
  const bucket = adminStorage.bucket()
  const filePath = `proposals/${userId}/${proposalId}.pptx`
  const file = bucket.file(filePath)
  const downloadToken = randomUUID()

  console.log('[GammaUtils] Saving file to Firebase Storage:', filePath)
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
  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`
  
  console.log('[GammaUtils] Successfully stored file with public URL:', {
    filePath,
    downloadToken,
    publicUrl: publicUrl.substring(0, 100) + '...'
  })
  
  return publicUrl
}

function normalizeGammaFileType(value: string): string {
  const lower = value.toLowerCase()
  if (lower.includes('ppt')) {
    return 'pptx'
  }
  if (lower.includes('pdf')) {
    return 'pdf'
  }
  return lower
}

function defaultGammaInstructions(): string {
  return truncateGammaInstructions(FALLBACK_GAMMA_INSTRUCTIONS)
}

async function resolveGammaInstructions(formData: ProposalFormData, candidate?: string | null, logPrefix = '[GammaUtils]'): Promise<string> {
  const trimmedCandidate = typeof candidate === 'string' ? truncateGammaInstructions(candidate) : ''
  if (trimmedCandidate.length > 0) {
    return trimmedCandidate
  }

  try {
    const prompt = buildGammaInstructionPrompt(formData)
    console.log(`${logPrefix} Generating Gamma instructions via Gemini`)
    const raw = await geminiAI.generateContent(prompt)
    const generated = truncateGammaInstructions(raw)
    if (generated.length > 0) {
      return generated
    }
  } catch (error) {
    console.error(`${logPrefix} Gemini instruction generation failed`, error)
  }

  console.warn(`${logPrefix} Falling back to default Gamma instructions`)
  return defaultGammaInstructions()
}

export async function generateGammaInstructions(formData: ProposalFormData, existing?: string | null, logPrefix?: string): Promise<string> {
  return resolveGammaInstructions(formData, existing, logPrefix)
}

export async function generateProposalSuggestions(
  formData: ProposalFormData,
  summary: string | null | undefined,
  logPrefix = '[GammaUtils]'
): Promise<string | null> {
  try {
    const baseContext = buildGammaInputText(formData, summary ?? undefined)
    const prompt = `You are a senior marketing strategist. Based on the client context and AI outline below, produce three concise recommendations the account team should act on next. Each recommendation must:
- Start with "- "
- Stay under 120 characters
- Focus on high-impact actions (budget, messaging, channel, measurement, or collaboration)
- Reference missing data when appropriate

Keep the tone confident and collaborative. Do not include introductions or conclusions.

Client context:
${baseContext}

AI outline:
${summary ?? 'Not available'}`

    console.log(`${logPrefix} Generating Gemini recommendations`)
    const raw = await geminiAI.generateContent(prompt)
    const cleaned = raw.trim()
    if (!cleaned) {
      return null
    }

    const lines = cleaned
      .split(/\r?\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (!lines.length) {
      return cleaned
    }

    const normalized = lines
      .map((line) => {
        if (line.startsWith('-')) {
          return line
        }
        const cleaned = line.replace(/^\s*(?:[-•*]|\d+[\.\)])\s*/, '')
        return `- ${cleaned}`
      })
      .join('\n')

    return normalized
  } catch (error) {
    console.error(`${logPrefix} Gemini recommendation generation failed`, error)
    return null
  }
}

export async function ensureProposalGammaDeck(args: EnsureProposalGammaDeckArgs): Promise<GammaDeckProcessResult> {
  const {
    userId,
    proposalId,
    formData,
    summary,
    existingDeck,
    existingStorageUrl,
    instructions,
    logContext = '[GammaPipeline]'
  } = args

  const storageUrlFromRecord = existingStorageUrl ?? existingDeck?.storageUrl ?? null
  if (storageUrlFromRecord) {
    console.log(`${logContext} Reusing stored Gamma deck`, { proposalId, storageUrl: storageUrlFromRecord })
    const deck = existingDeck
      ? { ...existingDeck, storageUrl: storageUrlFromRecord }
      : null
    return {
      gammaDeck: deck,
      storageUrl: storageUrlFromRecord,
      instructions: deck?.instructions ?? instructions ?? null,
      reused: true,
    }
  }

  const logDetails = { proposalId, hasExistingDeck: Boolean(existingDeck), summaryLength: summary?.length ?? 0 }
  console.log(`${logContext} Preparing Gamma deck`, logDetails)

  const resolvedInstructions = await resolveGammaInstructions(formData, instructions ?? existingDeck?.instructions, logContext)

  if (existingDeck?.pptxUrl) {
    console.log(`${logContext} Attempting to store existing Gamma deck PPT`, {
      proposalId,
      generationId: existingDeck.generationId,
      pptxUrl: existingDeck.pptxUrl,
    })
    try {
      const buffer = await downloadGammaPresentation(existingDeck.pptxUrl)
      const storedUrl = await storeGammaPresentation(userId, proposalId, buffer)
      const deckWithStorage: GammaDeckPayload = {
        ...existingDeck,
        instructions: resolvedInstructions,
        storageUrl: storedUrl,
      }
      console.log(`${logContext} Stored PPT from existing Gamma deck`, {
        proposalId,
        generationId: existingDeck.generationId,
        storageUrl: storedUrl.substring(0, 96),
      })
      return {
        gammaDeck: deckWithStorage,
        storageUrl: storedUrl,
        instructions: resolvedInstructions,
        reused: false,
      }
    } catch (reuseError) {
      console.error(`${logContext} Failed to store existing Gamma deck PPT, will regenerate`, reuseError)
    }
  }

  const gammaInputText = buildGammaInputText(formData, summary ?? undefined)
  console.log(`${logContext} Triggering Gamma generation`, {
    proposalId,
    inputLength: gammaInputText.length,
    instructionsLength: resolvedInstructions.length,
  })

  const deckResult = await gammaService.generatePresentation({
    inputText: gammaInputText,
    additionalInstructions: resolvedInstructions,
    format: 'presentation',
    textMode: 'generate',
    numCards: estimateGammaSlideCount(formData),
    exportAs: 'pptx',
    themeName: DEFAULT_GAMMA_THEME,
    cardOptions: {
      dimensions: '16x9',
    },
    imageOptions: {
      source: DEFAULT_IMAGE_SOURCE,
    },
  }, {
    timeoutMs: 360000, // 6 minutes for complex presentations
    pollIntervalMs: 8000, // Slightly longer intervals for export processing
  })

  const gammaDeck = mapGammaDeckPayload(deckResult, resolvedInstructions)

  if (!gammaDeck.pptxUrl) {
    console.error(`${logContext} Gamma generation missing PPT export`, {
      proposalId,
      generationId: gammaDeck.generationId,
      status: gammaDeck.status,
      generatedFiles: gammaDeck.generatedFiles,
      availableFileTypes: gammaDeck.generatedFiles.map(f => f.fileType),
    })
    
    // Try to poll a few more times specifically for PPTX export
    const retryResult = await retryForPptxExport(gammaDeck.generationId, logContext)
    if (retryResult?.pptxUrl) {
      Object.assign(gammaDeck, retryResult)
      console.log(`${logContext} PPT export became available during retry`, {
        proposalId,
        generationId: gammaDeck.generationId,
        fileTypes: retryResult.generatedFiles?.map((file) => normalizeGammaFileType(file.fileType)),
      })
    } else {
      throw new Error(`Gamma deck generation completed without a PPT export. Status: ${gammaDeck.status}, Available files: ${gammaDeck.generatedFiles.map(f => f.fileType).join(', ')}`)
    }
  }

  console.log(`${logContext} Downloading newly generated Gamma PPT`, {
    proposalId,
    generationId: gammaDeck.generationId,
    pptxUrl: gammaDeck.pptxUrl,
  })
  const pptSource = gammaDeck.pptxUrl
  if (!pptSource) {
    throw new Error(`${logContext} Gamma deck is missing a PPT URL after validation`)
  }

  const pptBuffer = await downloadGammaPresentation(pptSource)

  console.log(`${logContext} Storing Gamma PPT to Firebase Storage`, {
    proposalId,
    generationId: gammaDeck.generationId,
    bufferSize: pptBuffer.length,
  })
  const storedUrl = await storeGammaPresentation(userId, proposalId, pptBuffer)

  console.log(`${logContext} Stored Gamma PPT`, {
    proposalId,
    storedUrl: storedUrl.substring(0, 96),
  })

  const deckWithStorage: GammaDeckPayload = {
    ...gammaDeck,
    storageUrl: storedUrl,
  }

  return {
    gammaDeck: deckWithStorage,
    storageUrl: storedUrl,
    instructions: resolvedInstructions,
    reused: false,
  }
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

Write concise slide-by-slide guidance (Slide 1, Slide 2, etc.) capped at 8 slides. Ensure coverage of industry benchmark comparisons, budget allocation that totals 100% (call out any testing allowance inside the 100%), goal feasibility with suggested targets, agency service recommendations, and a closing CTA. Highlight where assumptions are made because data is missing.

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
  const normalizedDesired = normalizeGammaFileType(desiredType)
  const match = files.find((file) => normalizeGammaFileType(file.fileType) === normalizedDesired)
  return match?.fileUrl
}

export function parseGammaDeckPayload(input: unknown): GammaDeckPayload | null {
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
      const fileTypeRaw = typeof entry.fileType === 'string' ? entry.fileType : typeof entry.type === 'string' ? entry.type : null
      const fileUrl = typeof entry.fileUrl === 'string' ? entry.fileUrl : typeof entry.url === 'string' ? entry.url : null
      if (!fileTypeRaw || !fileUrl) {
        return null
      }
      return { fileType: normalizeGammaFileType(fileTypeRaw), fileUrl }
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

async function retryForPptxExport(generationId: string, logContext: string, maxRetries = 5): Promise<Partial<GammaDeckPayload> | null> {
  console.log(`${logContext} Retrying for PPTX export availability...`)
  
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds between retries
    
    try {
      const status = await gammaService.getGeneration(generationId)
      const pptxUrl = findGammaFile(status.generatedFiles, 'pptx')
      
      console.log(`${logContext} Retry ${i + 1}/${maxRetries} - PPTX available: ${!!pptxUrl}`, {
        generationId,
        status: status.status,
        fileTypes: status.generatedFiles.map((file) => normalizeGammaFileType(file.fileType)),
      })
      
      if (pptxUrl) {
        return {
          pptxUrl,
          generatedFiles: status.generatedFiles,
          status: status.status
        }
      }
    } catch (error) {
      console.warn(`${logContext} Retry ${i + 1} failed:`, error)
    }
  }
  console.warn(`${logContext} PPTX export still unavailable after retries`, {
    generationId,
    maxRetries,
  })
  
  return null
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
