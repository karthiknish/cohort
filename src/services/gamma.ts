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
  timeoutMs: 60000,
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

    const webAppUrl = typeof payload.webAppUrl === 'string' ? payload.webAppUrl : typeof payload.webUrl === 'string' ? payload.webUrl : null
    const shareUrl = typeof payload.shareUrl === 'string' ? payload.shareUrl : typeof payload.webAppUrl === 'string' ? payload.webAppUrl : null

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
    const creation = await this.createGeneration({
      ...request,
      format: request.format ?? 'presentation',
      textMode: request.textMode ?? 'generate',
    })

    if (!poll) {
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

    while (true) {
      const result = await this.getGeneration(creation.generationId)
      if (result.status && result.status.toLowerCase() !== 'pending' && result.status.toLowerCase() !== 'processing') {
        return result
      }

      if (Date.now() - startedAt > pollTimeout) {
        return result
      }

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
