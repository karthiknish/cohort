/**
 * Gamma Generate API Service
 * API Docs: https://developers.gamma.app/docs/getting-started
 * API Reference: https://developers.gamma.app/reference
 * 
 * Supports:
 * - Generate API (POST /v1.0/generations)
 * - Create from Template API (POST /v1.0/generations/from-template)
 * - List Themes API (GET /v1.0/themes)
 * - List Folders API (GET /v1.0/folders)
 */

const GAMMA_BASE_URL = 'https://public-api.gamma.app/v1.0'

// ============================================================================
// FORMAT & MODE TYPES
// ============================================================================

export type GammaFormat = 'presentation' | 'document' | 'social' | 'webpage'
export type GammaTextMode = 'generate' | 'condense' | 'preserve'
export type GammaExportFormat = 'pdf' | 'pptx'
export type GammaTextAmount = 'brief' | 'medium' | 'detailed' | 'extensive'
export type GammaAccessLevel = 'noAccess' | 'view' | 'comment' | 'edit' | 'fullAccess'

// ============================================================================
// IMAGE OPTIONS TYPES
// ============================================================================

export type GammaImageSource = 
  | 'aiGenerated'
  | 'pictographic'
  | 'unsplash'
  | 'giphy'
  | 'webAllImages'
  | 'webFreeToUse'
  | 'webFreeToUseCommercially'
  | 'placeholder'
  | 'noImages'

export type GammaImageModel = 
  | 'flux-1-quick'        // Flux Fast 1.1 (2 credits)
  | 'flux-kontext-fast'   // Flux Kontext Fast (2 credits)
  | 'imagen-3-flash'      // Imagen 3 Fast (2 credits)
  | 'luma-photon-flash-1' // Luma Photon Flash (2 credits)
  | 'flux-1-pro'          // Flux Pro (8 credits)
  | 'imagen-3-pro'        // Imagen 3 (8 credits)
  | 'ideogram-v3-turbo'   // Ideogram 3 Turbo (10 credits)
  | 'luma-photon-1'       // Luma Photon (10 credits)
  | 'leonardo-phoenix'    // Leonardo Phoenix (15 credits)
  | 'flux-kontext-pro'    // Flux Kontext Pro (20 credits)
  | 'gemini-2.5-flash-image' // Gemini 2.5 Flash (20 credits)
  | 'ideogram-v3'         // Ideogram 3 (20 credits)
  | 'imagen-4-pro'        // Imagen 4 (20 credits)
  | 'recraft-v3'          // Recraft (20 credits)
  | 'gpt-image-1-medium'  // GPT Image (30 credits)
  | 'flux-1-ultra'        // Flux Ultra - Ultra plan only (30 credits)
  | 'imagen-4-ultra'      // Imagen 4 Ultra - Ultra plan only (30 credits)
  | 'dall-e-3'            // DALL-E 3 (33 credits)
  | 'flux-kontext-max'    // Flux Kontext Max - Ultra plan only (40 credits)
  | 'recraft-v3-svg'      // Recraft Vector Illustration (40 credits)
  | 'ideogram-v3-quality' // Ideogram 3.0 Quality - Ultra plan only (45 credits)
  | 'gpt-image-1-high'    // GPT Image Detailed - Ultra plan only (120 credits)

export interface GammaImageOptions {
  /** Image source type */
  source?: GammaImageSource
  /** AI model for image generation (only when source is 'aiGenerated') */
  model?: GammaImageModel
  /** Artistic style description (only when source is 'aiGenerated'), 1-500 chars */
  style?: string
}

// ============================================================================
// TEXT OPTIONS TYPES
// ============================================================================

export type GammaLanguageCode = 
  | 'en' | 'en-gb' | 'en-in'  // English variants
  | 'es' | 'es-es' | 'es-mx' | 'es-419'  // Spanish variants
  | 'fr' | 'de' | 'it' | 'pt-br' | 'pt-pt'  // Major European
  | 'zh-cn' | 'zh-tw' | 'ja' | 'ja-da' | 'ko'  // East Asian
  | 'ar' | 'ar-sa' | 'he' | 'fa'  // Middle Eastern
  | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu' | 'kn' | 'ml' | 'ur'  // South Asian
  | 'ru' | 'uk' | 'pl' | 'cs' | 'sk' | 'bg' | 'sr' | 'hr' | 'sl' | 'bs' | 'mk'  // Slavic
  | 'nl' | 'sv' | 'da' | 'nb' | 'fi' | 'is'  // Nordic/Germanic
  | 'el' | 'ro' | 'hu' | 'tr'  // Other European
  | 'id' | 'ms' | 'vi' | 'th' | 'tl'  // Southeast Asian
  | 'sw' | 'ha' | 'yo' | 'af'  // African
  | 'et' | 'lv' | 'lt' | 'kk' | 'uz' | 'cy' | 'sq' | 'ca'  // Other

export interface GammaTextOptions {
  /** Content density: brief, medium, detailed, extensive */
  amount?: GammaTextAmount
  /** Mood/voice of output, 1-500 chars (only when textMode is 'generate') */
  tone?: string
  /** Target audience description, 1-500 chars (only when textMode is 'generate') */
  audience?: string
  /** Output language code */
  language?: GammaLanguageCode
}

// ============================================================================
// CARD OPTIONS TYPES
// ============================================================================

export type GammaPresentationDimensions = 'fluid' | '16x9' | '4x3'
export type GammaDocumentDimensions = 'fluid' | 'pageless' | 'letter' | 'a4'
export type GammaSocialDimensions = '1x1' | '4x5' | '9x16'
export type GammaCardDimensions = GammaPresentationDimensions | GammaDocumentDimensions | GammaSocialDimensions

export type GammaHeaderFooterPosition = 'topLeft' | 'topRight' | 'topCenter' | 'bottomLeft' | 'bottomRight' | 'bottomCenter'
export type GammaHeaderFooterSize = 'sm' | 'md' | 'lg' | 'xl'

export interface GammaHeaderFooterText {
  type: 'text'
  value: string
}

export interface GammaHeaderFooterImage {
  type: 'image'
  source: 'themeLogo' | 'custom'
  size?: GammaHeaderFooterSize
  /** Required when source is 'custom' */
  src?: string
}

export interface GammaHeaderFooterCardNumber {
  type: 'cardNumber'
}

export type GammaHeaderFooterContent = GammaHeaderFooterText | GammaHeaderFooterImage | GammaHeaderFooterCardNumber

export interface GammaHeaderFooterOptions {
  topLeft?: GammaHeaderFooterContent
  topRight?: GammaHeaderFooterContent
  topCenter?: GammaHeaderFooterContent
  bottomLeft?: GammaHeaderFooterContent
  bottomRight?: GammaHeaderFooterContent
  bottomCenter?: GammaHeaderFooterContent
  hideFromFirstCard?: boolean
  hideFromLastCard?: boolean
}

export interface GammaCardOptions {
  /** Card aspect ratio (options depend on format) */
  dimensions?: GammaCardDimensions
  /** Header/footer configuration */
  headerFooter?: GammaHeaderFooterOptions
}

// ============================================================================
// SHARING OPTIONS TYPES
// ============================================================================

export interface GammaEmailOptions {
  /** Email addresses to share with */
  recipients?: string[]
  /** Access level for email recipients */
  access?: GammaAccessLevel
}

export interface GammaSharingOptions {
  /** Access level for workspace members */
  workspaceAccess?: GammaAccessLevel
  /** Access level for external users (excludes 'fullAccess') */
  externalAccess?: Exclude<GammaAccessLevel, 'fullAccess'>
  /** Email sharing configuration */
  emailOptions?: GammaEmailOptions
}

// ============================================================================
// GENERATION REQUEST TYPES
// ============================================================================

export interface GammaGenerationRequest {
  /** Content to generate from (required), max 100,000 tokens (~400,000 chars) */
  inputText: string
  /** Output format type */
  format?: GammaFormat
  /** How input text is processed: generate (expand), condense (summarize), preserve (keep exact) */
  textMode?: GammaTextMode
  /** Theme ID (use listThemes() to get available themes) */
  themeId?: string
  /** Number of cards (1-60 for Pro, 1-75 for Ultra) */
  numCards?: number
  /** How content is split: 'auto' uses numCards, 'inputTextBreaks' uses \n---\n markers */
  cardSplit?: 'auto' | 'inputTextBreaks'
  /** Additional generation instructions, 1-2000 chars */
  additionalInstructions?: string
  /** Folder IDs to store gamma in (use listFolders() to get available folders) */
  folderIds?: string[]
  /** Export format(s) - pdf or pptx */
  exportAs?: GammaExportFormat | GammaExportFormat[]
  /** Text generation options */
  textOptions?: GammaTextOptions
  /** Image generation options */
  imageOptions?: GammaImageOptions
  /** Card dimension and header/footer options */
  cardOptions?: GammaCardOptions
  /** Sharing and access control options */
  sharingOptions?: GammaSharingOptions
}

export interface GammaTemplateRequest {
  /** The gamma ID of the template to use (required) */
  gammaId: string
  /** Instructions for how to modify the template (required), max 100,000 tokens */
  prompt: string
  /** Theme ID (defaults to template's theme) */
  themeId?: string
  /** Folder IDs to store gamma in */
  folderIds?: string[]
  /** Export format(s) - pdf or pptx */
  exportAs?: GammaExportFormat | GammaExportFormat[]
  /** Image options (only for templates with AI-generated images) */
  imageOptions?: Pick<GammaImageOptions, 'model' | 'style'>
  /** Sharing and access control options */
  sharingOptions?: GammaSharingOptions
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface GammaGenerationResponse {
  generationId: string
}

export interface GammaGeneratedFile {
  fileType: string
  fileUrl: string
}

export interface GammaGenerationStatus {
  generationId: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | string
  webAppUrl: string | null
  shareUrl: string | null
  generatedFiles: GammaGeneratedFile[]
  warnings?: string[]
  raw: Record<string, unknown>
}

// ============================================================================
// THEMES & FOLDERS TYPES
// ============================================================================

export interface GammaTheme {
  id: string
  name: string
  type: 'standard' | 'custom'
  colorKeywords?: string[]
  toneKeywords?: string[]
}

export interface GammaFolder {
  id: string
  name: string
}

export interface GammaPaginatedResponse<T> {
  data: T[]
  hasMore: boolean
  nextCursor: string | null
}

export interface GammaListOptions {
  /** Search by name (case-insensitive) */
  query?: string
  /** Number of items per page (max 50) */
  limit?: number
  /** Cursor for next page (from previous response's nextCursor) */
  after?: string
}

// ============================================================================
// SERVICE OPTIONS
// ============================================================================

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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

async function wait(delayMs: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, delayMs)
  })
}

// ============================================================================
// GAMMA SERVICE CLASS
// ============================================================================

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

  // ==========================================================================
  // THEMES API
  // ==========================================================================

  /**
   * List available themes from your workspace
   * Returns both workspace-specific (custom) and global (standard) themes
   */
  async listThemes(options: GammaListOptions = {}): Promise<GammaPaginatedResponse<GammaTheme>> {
    const headers = this.ensureRequestHeaders()
    const params = new URLSearchParams()
    
    if (options.query) {
      params.set('query', options.query)
    }
    if (options.limit) {
      params.set('limit', String(Math.min(options.limit, 50)))
    }
    if (options.after) {
      params.set('after', options.after)
    }

    const url = `${GAMMA_BASE_URL}/themes${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const details = await response.text().catch(() => '')
      throw new Error(`Gamma API listThemes failed (${response.status}): ${details || 'Unknown error'}`)
    }

    const payload = await response.json().catch(() => ({})) as Record<string, unknown>
    const data = Array.isArray(payload.data) 
      ? (payload.data as GammaTheme[])
      : []

    return {
      data,
      hasMore: Boolean(payload.hasMore),
      nextCursor: typeof payload.nextCursor === 'string' ? payload.nextCursor : null,
    }
  }

  /**
   * Get all themes (handles pagination automatically)
   */
  async getAllThemes(query?: string): Promise<GammaTheme[]> {
    const themes: GammaTheme[] = []
    let cursor: string | undefined

    do {
      const response = await this.listThemes({ query, limit: 50, after: cursor })
      themes.push(...response.data)
      cursor = response.hasMore && response.nextCursor ? response.nextCursor : undefined
    } while (cursor)

    return themes
  }

  /**
   * Search for a theme by name
   */
  async findTheme(name: string): Promise<GammaTheme | null> {
    const response = await this.listThemes({ query: name, limit: 10 })
    return response.data.find(t => t.name.toLowerCase() === name.toLowerCase()) || response.data[0] || null
  }

  // ==========================================================================
  // FOLDERS API
  // ==========================================================================

  /**
   * List available folders in your workspace
   */
  async listFolders(options: GammaListOptions = {}): Promise<GammaPaginatedResponse<GammaFolder>> {
    const headers = this.ensureRequestHeaders()
    const params = new URLSearchParams()
    
    if (options.query) {
      params.set('query', options.query)
    }
    if (options.limit) {
      params.set('limit', String(Math.min(options.limit, 50)))
    }
    if (options.after) {
      params.set('after', options.after)
    }

    const url = `${GAMMA_BASE_URL}/folders${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const details = await response.text().catch(() => '')
      throw new Error(`Gamma API listFolders failed (${response.status}): ${details || 'Unknown error'}`)
    }

    const payload = await response.json().catch(() => ({})) as Record<string, unknown>
    const data = Array.isArray(payload.data) 
      ? (payload.data as GammaFolder[])
      : []

    return {
      data,
      hasMore: Boolean(payload.hasMore),
      nextCursor: typeof payload.nextCursor === 'string' ? payload.nextCursor : null,
    }
  }

  /**
   * Get all folders (handles pagination automatically)
   */
  async getAllFolders(query?: string): Promise<GammaFolder[]> {
    const folders: GammaFolder[] = []
    let cursor: string | undefined

    do {
      const response = await this.listFolders({ query, limit: 50, after: cursor })
      folders.push(...response.data)
      cursor = response.hasMore && response.nextCursor ? response.nextCursor : undefined
    } while (cursor)

    return folders
  }

  /**
   * Search for a folder by name
   */
  async findFolder(name: string): Promise<GammaFolder | null> {
    const response = await this.listFolders({ query: name, limit: 10 })
    return response.data.find(f => f.name.toLowerCase() === name.toLowerCase()) || response.data[0] || null
  }

  // ==========================================================================
  // GENERATION API
  // ==========================================================================

  /**
   * Create a new generation (does not wait for completion)
   */
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

    if (request.themeId) {
      body.themeId = request.themeId
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

    if (request.folderIds?.length) {
      body.folderIds = request.folderIds
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

  // ==========================================================================
  // TEMPLATE API (Beta)
  // ==========================================================================

  /**
   * Create a gamma from an existing template
   * Note: This API is currently in beta
   */
  async createFromTemplate(request: GammaTemplateRequest): Promise<GammaGenerationResponse> {
    const headers = this.ensureRequestHeaders()

    const body: Record<string, unknown> = {
      gammaId: request.gammaId,
      prompt: request.prompt,
    }

    if (request.themeId) {
      body.themeId = request.themeId
    }

    if (request.folderIds?.length) {
      body.folderIds = request.folderIds
    }

    if (request.exportAs) {
      body.exportAs = request.exportAs
    }

    if (request.imageOptions) {
      body.imageOptions = request.imageOptions
    }

    if (request.sharingOptions) {
      body.sharingOptions = request.sharingOptions
    }

    const response = await fetch(`${GAMMA_BASE_URL}/generations/from-template`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const details = await response.text().catch(() => '')
      throw new Error(`Gamma API createFromTemplate failed (${response.status}): ${details || 'Unknown error'}`)
    }

    const payload = (await response.json().catch(() => null)) as { generationId?: unknown } | null
    const generationId = typeof payload?.generationId === 'string' ? payload.generationId : null

    if (!generationId) {
      throw new Error('Gamma API did not return a generationId')
    }

    return { generationId }
  }

  // ==========================================================================
  // GET GENERATION STATUS
  // ==========================================================================

  /**
   * Get the status of a generation
   */
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

    // Extract warnings if present
    const warnings = Array.isArray(payload.warnings) 
      ? (payload.warnings as unknown[]).filter((w): w is string => typeof w === 'string')
      : undefined

    return {
      generationId,
      status,
      webAppUrl,
      shareUrl,
      generatedFiles,
      warnings,
      raw: payload,
    }
  }

  // ==========================================================================
  // HIGH-LEVEL GENERATION METHODS
  // ==========================================================================

  /**
   * Generate a presentation with polling
   */
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

    return this.pollGeneration(creation.generationId, request.exportAs, pollIntervalMs, timeoutMs)
  }

  /**
   * Generate a document with polling
   */
  async generateDocument(request: GammaGenerationRequest, options: GammaGenerationOptions = {}): Promise<GammaGenerationStatus> {
    return this.generatePresentation({
      ...request,
      format: 'document',
    }, options)
  }

  /**
   * Generate a social post with polling
   */
  async generateSocialPost(request: GammaGenerationRequest, options: GammaGenerationOptions = {}): Promise<GammaGenerationStatus> {
    return this.generatePresentation({
      ...request,
      format: 'social',
    }, options)
  }

  /**
   * Generate a webpage with polling
   */
  async generateWebpage(request: GammaGenerationRequest, options: GammaGenerationOptions = {}): Promise<GammaGenerationStatus> {
    return this.generatePresentation({
      ...request,
      format: 'webpage',
    }, options)
  }

  /**
   * Generate from a template with polling
   */
  async generateFromTemplate(request: GammaTemplateRequest, options: GammaGenerationOptions = {}): Promise<GammaGenerationStatus> {
    const { poll = true, pollIntervalMs, timeoutMs } = { ...DEFAULT_OPTIONS, ...options }
    console.log('[GammaService] Starting template generation with options:', {
      poll,
      pollIntervalMs,
      timeoutMs,
      gammaId: request.gammaId,
    })
    
    const creation = await this.createFromTemplate(request)
    console.log('[GammaService] Created template generation with ID:', creation.generationId)

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

    return this.pollGeneration(creation.generationId, request.exportAs, pollIntervalMs, timeoutMs)
  }

  /**
   * Poll a generation until completion or timeout
   */
  private async pollGeneration(
    generationId: string,
    exportAs?: GammaExportFormat | GammaExportFormat[],
    pollIntervalMs: number = DEFAULT_OPTIONS.pollIntervalMs,
    timeoutMs: number = DEFAULT_OPTIONS.timeoutMs
  ): Promise<GammaGenerationStatus> {
    const startedAt = Date.now()
    const pollDelay = pollIntervalMs
    const pollTimeout = timeoutMs
    const requiredExports = new Set(normalizeExportFormats(exportAs))
    let pollCount = 0

    while (true) {
      pollCount++
      console.log(`[GammaService] Poll attempt ${pollCount} for generation ${generationId}`)

      const result = await this.getGeneration(generationId)
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
          generationId,
          fileCount: result.generatedFiles.length,
        })
        return result
      }

      if (normalizedStatus && FAILURE_STATUSES.has(normalizedStatus)) {
        console.warn('[GammaService] Generation reached terminal failure state; returning latest result', {
          generationId,
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
          generationId,
          lastStatus: result.status,
          fileTypes: result.generatedFiles.map((file) => normalizeGammaFileType(file.fileType)),
        })
        return result
      }

      console.log(`[GammaService] Waiting ${pollDelay}ms before next poll`)
      await wait(pollDelay)
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return Boolean(this.resolveApiKey())
  }

  /**
   * Validate that the API key works by listing themes
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.listThemes({ limit: 1 })
      return true
    } catch {
      return false
    }
  }
}

// Default singleton instance
export const gammaService = new GammaService()

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

/**
 * Image model credit costs
 */
export const GAMMA_IMAGE_MODEL_CREDITS: Record<GammaImageModel, number> = {
  'flux-1-quick': 2,
  'flux-kontext-fast': 2,
  'imagen-3-flash': 2,
  'luma-photon-flash-1': 2,
  'flux-1-pro': 8,
  'imagen-3-pro': 8,
  'ideogram-v3-turbo': 10,
  'luma-photon-1': 10,
  'leonardo-phoenix': 15,
  'flux-kontext-pro': 20,
  'gemini-2.5-flash-image': 20,
  'ideogram-v3': 20,
  'imagen-4-pro': 20,
  'recraft-v3': 20,
  'gpt-image-1-medium': 30,
  'flux-1-ultra': 30,
  'imagen-4-ultra': 30,
  'dall-e-3': 33,
  'flux-kontext-max': 40,
  'recraft-v3-svg': 40,
  'ideogram-v3-quality': 45,
  'gpt-image-1-high': 120,
}

/**
 * Recommended image models by use case
 */
export const GAMMA_RECOMMENDED_MODELS = {
  /** Fast, budget-friendly options */
  fast: ['flux-1-quick', 'flux-kontext-fast', 'imagen-3-flash'] as GammaImageModel[],
  /** Balanced quality and cost */
  balanced: ['flux-1-pro', 'imagen-3-pro', 'imagen-4-pro'] as GammaImageModel[],
  /** Highest quality */
  premium: ['ideogram-v3-quality', 'gpt-image-1-high'] as GammaImageModel[],
  /** Vector/illustration */
  vector: ['recraft-v3-svg'] as GammaImageModel[],
}

/**
 * Common theme presets (from Gamma's standard themes)
 */
export const GAMMA_STANDARD_THEMES = [
  'Oasis',
  'Prism',
  'Chisel',
  'Standard Dark',
  'Dark Gradient',
] as const

/**
 * Helper to build a generation request with sensible defaults for presentations
 */
export function createPresentationRequest(
  inputText: string,
  options: Partial<Omit<GammaGenerationRequest, 'inputText'>> = {}
): GammaGenerationRequest {
  return {
    inputText,
    format: 'presentation',
    textMode: 'generate',
    numCards: 10,
    cardSplit: 'auto',
    exportAs: 'pptx',
    cardOptions: {
      dimensions: '16x9',
    },
    imageOptions: {
      source: 'aiGenerated',
      model: 'imagen-3-flash',
    },
    textOptions: {
      amount: 'medium',
      language: 'en',
    },
    ...options,
  }
}

/**
 * Helper to build a template request with sensible defaults
 */
export function createTemplateRequest(
  gammaId: string,
  prompt: string,
  options: Partial<Omit<GammaTemplateRequest, 'gammaId' | 'prompt'>> = {}
): GammaTemplateRequest {
  return {
    gammaId,
    prompt,
    exportAs: 'pptx',
    ...options,
  }
}
