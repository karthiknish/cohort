import { Buffer } from 'node:buffer'

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
  pptStorageId: string | null
  pdfStorageId: string | null
}

const FALLBACK_GAMMA_INSTRUCTIONS = `Slide 1: Executive Summary\nSlide 2: Objectives & KPIs\nSlide 3: Strategy Overview\nSlide 4: Budget Allocation (distribute 100% across channels and note any testing allowance)\nSlide 5: Execution Roadmap\nSlide 6: Optimization & Testing\nSlide 7: Next Steps & Call-to-Action`

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

export function parseGammaDeckPayload(value: unknown): GammaDeckPayload | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const generationId = typeof record.generationId === 'string' ? record.generationId : ''
  if (!generationId) return null

  return {
    generationId,
    status: typeof record.status === 'string' ? record.status : 'unknown',
    instructions: typeof record.instructions === 'string' ? record.instructions : '',
    webUrl: typeof record.webUrl === 'string' ? record.webUrl : null,
    shareUrl: typeof record.shareUrl === 'string' ? record.shareUrl : null,
    pptxUrl: typeof record.pptxUrl === 'string' ? record.pptxUrl : null,
    pdfUrl: typeof record.pdfUrl === 'string' ? record.pdfUrl : null,
    generatedFiles: Array.isArray(record.generatedFiles)
      ? (record.generatedFiles as Array<any>)
          .map((entry) => ({
            fileType: typeof entry?.fileType === 'string' ? normalizeGammaFileType(entry.fileType) : '',
            fileUrl: typeof entry?.fileUrl === 'string' ? entry.fileUrl : '',
          }))
          .filter((entry) => entry.fileType && entry.fileUrl)
      : [],
    pptStorageId: typeof record.pptStorageId === 'string' ? record.pptStorageId : null,
    pdfStorageId: typeof record.pdfStorageId === 'string' ? record.pdfStorageId : null,
  }
}

function truncateGammaInstructions(value: string): string {
  const cleaned = value.trim()
  if (!cleaned) return ''
  return cleaned.length > 5000 ? cleaned.slice(0, 5000) : cleaned
}

async function resolveGammaInstructions(formData: ProposalFormData, candidate?: string | null): Promise<string> {
  const trimmedCandidate = typeof candidate === 'string' ? truncateGammaInstructions(candidate) : ''
  if (trimmedCandidate.length > 0) {
    return trimmedCandidate
  }

  try {
    const prompt = buildGammaInstructionPrompt(formData)
    const raw = await geminiAI.generateContent(prompt)
    const generated = truncateGammaInstructions(raw)
    if (generated.length > 0) {
      return generated
    }
  } catch {
    // Ignore and fall back.
  }

  return truncateGammaInstructions(FALLBACK_GAMMA_INSTRUCTIONS)
}

function buildGammaInstructionPrompt(formData: ProposalFormData): string {
  const company = formData.company?.name?.trim() || 'Client'
  return `Create a concise slide-by-slide outline for a marketing proposal deck for ${company}.\n\nUse 7-10 slides. Keep each slide title under 8 words, followed by 2-3 bullet points. Return plain text only.`
}

function buildGammaInputText(formData: ProposalFormData, summary?: string): string {
  const companyName = formData.company?.name?.trim() || 'Client'
  const goals = Array.isArray((formData as any)?.goals) ? (formData as any).goals.join(', ') : ''
  const budget = (formData as any)?.budget?.total ? `Budget: ${(formData as any).budget.total}` : ''

  return [
    `Client: ${companyName}`,
    goals ? `Goals: ${goals}` : null,
    budget || null,
    summary ? `Summary: ${summary}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

export type NormalizedGammaFile = {
  fileType: string
  fileUrl: string
}

export async function findGammaFile(args: {
  generationId: string
  fileType: 'pptx' | 'pdf'
}): Promise<NormalizedGammaFile | null> {
  const status = (await gammaService.getGeneration(args.generationId)) as GammaGenerationStatus
  const files = Array.isArray((status as any)?.generatedFiles) ? ((status as any).generatedFiles as any[]) : []

  for (const file of files) {
    if (!file) continue
    const normalizedType = normalizeGammaFileType(String(file.fileType ?? ''))
    const url = typeof file.fileUrl === 'string' ? file.fileUrl : ''
    if (normalizedType === args.fileType && url) {
      return { fileType: normalizedType, fileUrl: url }
    }
  }

  const directUrl = args.fileType === 'pptx' ? (status as any)?.pptxUrl : (status as any)?.pdfUrl
  if (typeof directUrl === 'string' && directUrl) {
    return { fileType: args.fileType, fileUrl: directUrl }
  }

  return null
}

export async function downloadGammaPresentation(url: string, retries = 3, backoffMs = 2000): Promise<Buffer> {
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
      const response = await fetch(url, {
        headers: {
          'X-API-KEY': apiKey,
          accept: 'application/octet-stream',
        },
      })

      if (!response.ok) {
        const details = await response.text().catch(() => '')
        if (retryableStatuses.has(response.status) && attempt <= retries) {
          await new Promise((resolve) => setTimeout(resolve, backoffMs * attempt))
          continue
        }

        throw new Error(`Gamma file download failed (${response.status}): ${details || 'Unknown error'}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error: unknown) {
      lastError = error
      if (attempt > retries) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, backoffMs * attempt))
    }
  }

  throw (lastError instanceof Error ? lastError : new Error('Gamma file download failed after retries'))
}

export async function generateGammaInstructions(formData: ProposalFormData, existing?: string | null): Promise<string> {
  return resolveGammaInstructions(formData, existing)
}

export async function generateProposalSuggestions(formData: ProposalFormData, summary: string | null | undefined): Promise<string | null> {
  try {
    const baseContext = buildGammaInputText(formData, summary ?? undefined)
    const prompt = `You are a senior marketing strategist. Based on the client context and AI outline below, produce three concise recommendations the account team should act on next. Each recommendation must:\n- Start with "- "\n- Stay under 120 characters\n- Focus on high-impact actions (budget, messaging, channel, measurement, or collaboration)\n- Reference missing data when appropriate\n\nKeep the tone confident and collaborative. Do not include introductions or conclusions.\n\nClient context:\n${baseContext}\n\nAI outline:\n${summary ?? 'Not available'}`

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

    return lines
      .map((line) => {
        if (line.startsWith('-')) return line
        const trimmed = line.replace(/^\s*(?:[-•*]|\d+[\.\)])\s*/, '')
        return `- ${trimmed}`
      })
      .join('\n')
  } catch {
    return null
  }
}
