// Gamma Generate API docs: https://developers.gamma.app/docs/getting-started
const GAMMA_BASE_URL = 'https://public-api.gamma.app/v0.2'

export type GammaFormat = 'presentation' | 'document' | 'social'
export type GammaTextMode = 'generate' | 'condense' | 'preserve'
export type GammaExportFormat = 'pdf' | 'pptx'

export interface GammaGenerationRequest {
  inputText: string
  format?: GammaFormat
  textMode?: GammaTextMode
  themeName?: string
  numCards?: number
  cardSplit?: 'auto' | 'inputTextBreaks'
  additionalInstructions?: string
  exportAs?: GammaExportFormat | GammaExportFormat[]
  textOptions?: Record<string, unknown>
  imageOptions?: Record<string, unknown>
  cardOptions?: Record<string, unknown>
  sharingOptions?: Record<string, unknown>
}

export interface GammaGenerationResponse {
  generationId: string
}

export interface GammaGeneratedFile {
  fileType: string
  fileUrl: string
}

export interface GammaGenerationStatus {
  generationId: string
  status: string
  webAppUrl: string | null
  shareUrl: string | null
  generatedFiles: GammaGeneratedFile[]
  raw: Record<string, unknown>
}

export interface GammaGenerationOptions {
  poll?: boolean
  pollIntervalMs?: number
  timeoutMs?: number
}

const DEFAULT_OPTIONS: Required<Pick<GammaGenerationOptions, 'pollIntervalMs' | 'timeoutMs'>> = {
  pollIntervalMs: 5000,
  timeoutMs: 300000, // 5 minutes to allow for export processing
}

const FAILURE_STATUSES = new Set(['failed', 'error', 'cancelled', 'canceled', 'timeout'])
const SUCCESS_STATUSES = new Set(['completed', 'succeeded', 'ready', 'finished'])

function normalizeExportFormats(exportAs: GammaGenerationRequest['exportAs']): string[] {
  if (!exportAs) {
    return []
  }

  const entries = Array.isArray(exportAs) ? exportAs : [exportAs]
  return entries.map((entry) => entry.toLowerCase())
}

function normalizeGammaFileType(fileType: string): string {
  const value = fileType.toLowerCase()
  if (value.includes('ppt')) {
    return 'pptx'
  }
  if (value.includes('pdf')) {
    return 'pdf'
  }
  return value
}

function hasAllRequiredExports(files: GammaGeneratedFile[], required: Set<string>): boolean {
  if (!files.length) {
    return required.size === 0
  }

  if (required.size === 0) {
    return true
  }

  const available = new Set(files.map((file) => normalizeGammaFileType(file.fileType)))
  return [...required].every((entry) => available.has(normalizeGammaFileType(entry)))
}

export class GammaService {
  private apiKey: string

  constructor(apiKey: string = process.env.GAMMA_API_KEY ?? '') {
    this.apiKey = apiKey
  }

  private resolveApiKey(): string {
    if (this.apiKey) {
      return this.apiKey
    }

    const candidate = process.env.GAMMA_API_KEY
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      this.apiKey = candidate.trim()
      return this.apiKey
    }

    return ''
  }

  private ensureRequestHeaders(headers?: HeadersInit): Headers {
    const apiKey = this.resolveApiKey()
    if (!apiKey) {
      throw new Error('GAMMA_API_KEY is not configured')
    }

    const merged = new Headers(headers)
    merged.set('Content-Type', 'application/json')
    merged.set('accept', 'application/json')
    merged.set('X-API-KEY', apiKey)
    return merged
  }

  async createGeneration(request: GammaGenerationRequest): Promise<GammaGenerationResponse> {
    const headers = this.ensureRequestHeaders()

    const body: Record<string, unknown> = {
      inputText: request.inputText,
    }

    if (request.format) {
      body.format = request.format
    }

    if (request.textMode) {
      body.textMode = request.textMode
    }

    if (request.themeName) {
      body.themeName = request.themeName
    }

    if (typeof request.numCards === 'number') {
      body.numCards = request.numCards
    }

    if (request.cardSplit) {
      body.cardSplit = request.cardSplit
    }

    if (request.additionalInstructions) {
      body.additionalInstructions = request.additionalInstructions
    }

    if (request.exportAs) {
      body.exportAs = request.exportAs
    }

    if (request.textOptions) {
      body.textOptions = request.textOptions
    }

    if (request.imageOptions) {
      body.imageOptions = request.imageOptions
    }

    if (request.cardOptions) {
      body.cardOptions = request.cardOptions
    }

    if (request.sharingOptions) {
      body.sharingOptions = request.sharingOptions
    }

    const response = await fetch(`${GAMMA_BASE_URL}/generations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const details = await response.text().catch(() => '')
      throw new Error(`Gamma API generation failed (${response.status}): ${details || 'Unknown error'}`)
    }

    const payload = (await response.json().catch(() => null)) as { generationId?: unknown } | null
    const generationId = typeof payload?.generationId === 'string' ? payload.generationId : null

    if (!generationId) {
      throw new Error('Gamma API did not return a generationId')
    }

    return { generationId }
  }

  async getGeneration(generationId: string): Promise<GammaGenerationStatus> {
    const headers = this.ensureRequestHeaders()

    const response = await fetch(`${GAMMA_BASE_URL}/generations/${encodeURIComponent(generationId)}`, {
      headers,
      method: 'GET',
    })

    if (!response.ok) {
      const details = await response.text().catch(() => '')
      throw new Error(`Gamma API status failed (${response.status}): ${details || 'Unknown error'}`)
    }

    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>
    const status = typeof payload.status === 'string' ? payload.status : 'unknown'

    const generatedFiles = Array.isArray(payload.generatedFiles)
      ? (payload.generatedFiles as Array<Record<string, unknown>>)
          .map((entry) => {
            const fileType = typeof entry.fileType === 'string' ? entry.fileType : typeof entry.type === 'string' ? entry.type : 'unknown'
            const fileUrl = typeof entry.fileUrl === 'string' ? entry.fileUrl : typeof entry.url === 'string' ? entry.url : ''
            return fileUrl ? { fileType, fileUrl } : null
          })
          .filter((value): value is GammaGeneratedFile => Boolean(value))
      : []

    // Handle legacy exportUrl field (single export URL returned as string instead of array)
    if (generatedFiles.length === 0 && typeof payload.exportUrl === 'string' && payload.exportUrl) {
      const exportUrl = payload.exportUrl
      const fileType = exportUrl.includes('.pptx') ? 'pptx' : exportUrl.includes('.pdf') ? 'pdf' : 'unknown'
      generatedFiles.push({ fileType, fileUrl: exportUrl })
    }

    const webAppUrl = typeof payload.webAppUrl === 'string' ? payload.webAppUrl : typeof payload.webUrl === 'string' ? payload.webUrl : typeof payload.gammaUrl === 'string' ? payload.gammaUrl : null
    const shareUrl = typeof payload.shareUrl === 'string' ? payload.shareUrl : typeof payload.webAppUrl === 'string' ? payload.webAppUrl : typeof payload.gammaUrl === 'string' ? payload.gammaUrl : null

    return {
      generationId,
      status,
      webAppUrl,
      shareUrl,
      generatedFiles,
      raw: payload,
    }
  }

  async generatePresentation(request: GammaGenerationRequest, options: GammaGenerationOptions = {}): Promise<GammaGenerationStatus> {
    const { poll = true, pollIntervalMs, timeoutMs } = { ...DEFAULT_OPTIONS, ...options }
    console.log('[GammaService] Starting presentation generation with options:', {
      poll,
      pollIntervalMs,
      timeoutMs,
      request,
    })
    
    const creation = await this.createGeneration({
      ...request,
      format: request.format ?? 'presentation',
      textMode: request.textMode ?? 'generate',
    })

    console.log('[GammaService] Created generation with ID:', creation.generationId)

    if (Array.isArray(request.exportAs)) {
      console.log('[GammaService] Requested export formats:', request.exportAs)
    } else if (request.exportAs) {
      console.log('[GammaService] Requested export format:', request.exportAs)
    }

    if (!poll) {
      console.log('[GammaService] Polling disabled, returning pending status')
      return {
        generationId: creation.generationId,
        status: 'pending',
        webAppUrl: null,
        shareUrl: null,
        generatedFiles: [],
        raw: {},
      }
    }

    const startedAt = Date.now()
    const pollDelay = pollIntervalMs ?? DEFAULT_OPTIONS.pollIntervalMs
    const pollTimeout = timeoutMs ?? DEFAULT_OPTIONS.timeoutMs
    const requiredExports = new Set(normalizeExportFormats(request.exportAs))
    let pollCount = 0

    while (true) {
      pollCount++
      console.log(`[GammaService] Poll attempt ${pollCount} for generation ${creation.generationId}`)

      const result = await this.getGeneration(creation.generationId)
      const normalizedStatus = typeof result.status === 'string' ? result.status.toLowerCase() : 'unknown'
      const elapsed = Date.now() - startedAt
      const hasRequiredFiles = hasAllRequiredExports(result.generatedFiles, requiredExports)

      console.log(`[GammaService] Poll ${pollCount} result:`, {
        status: result.status,
        hasFiles: result.generatedFiles.length > 0,
        hasRequiredFiles,
        fileCount: result.generatedFiles.length,
        fileTypes: result.generatedFiles.map((file) => normalizeGammaFileType(file.fileType)),
        elapsed,
      })

      if (hasRequiredFiles) {
        console.log(`[GammaService] Required exports ready after ${pollCount} polls, ${elapsed}ms`, {
          generationId: creation.generationId,
          fileCount: result.generatedFiles.length,
        })
        return result
      }

      if (normalizedStatus && FAILURE_STATUSES.has(normalizedStatus)) {
        console.warn('[GammaService] Generation reached terminal failure state; returning latest result', {
          generationId: creation.generationId,
          status: result.status,
          fileTypes: result.generatedFiles.map((file) => normalizeGammaFileType(file.fileType)),
          elapsed,
        })
        return result
      }

      // If generation is marked as completed but exports aren't ready yet, give it more time
      if (SUCCESS_STATUSES.has(normalizedStatus)) {
        console.log(`[GammaService] Generation completed (${normalizedStatus}) but exports not ready yet, continuing to poll...`)
        // Continue polling for exports even after completion status
      }

      if (elapsed > pollTimeout) {
        console.log(`[GammaService] Generation timeout after ${pollCount} polls, ${elapsed}ms`, {
          generationId: creation.generationId,
          lastStatus: result.status,
          fileTypes: result.generatedFiles.map((file) => normalizeGammaFileType(file.fileType)),
        })
        return result
      }

      console.log(`[GammaService] Waiting ${pollDelay}ms before next poll`)
      await wait(pollDelay)
    }
  }
}

export const gammaService = new GammaService()

async function wait(delayMs: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, delayMs)
  })
}
