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

import type {
    GammaExportFormat,
    GammaFolder,
    GammaGeneratedFile,
    GammaGenerationOptions,
    GammaGenerationRequest,
    GammaGenerationResponse,
    GammaGenerationStatus,
    GammaImageModel,
    GammaListOptions,
    GammaPaginatedResponse,
    GammaTemplateRequest,
    GammaTheme,
} from './types'

const GAMMA_BASE_URL = 'https://public-api.gamma.app/v1.0'

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
     * Get the status of a generation with retry for network failures
     */
    async getGeneration(generationId: string, retries = 3): Promise<GammaGenerationStatus> {
        const headers = this.ensureRequestHeaders()
        let lastError: unknown = null

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
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
            } catch (error: unknown) {
                lastError = error
                const isNetworkError = error instanceof TypeError && 
                    (error.message.includes('fetch failed') || error.message.includes('network'))
                
                if (isNetworkError && attempt < retries) {
                    const backoffMs = 2000 * attempt
                    console.warn(`[GammaService] Network error on getGeneration attempt ${attempt}, retrying in ${backoffMs}ms...`, error)
                    await wait(backoffMs)
                    continue
                }
                
                throw error
            }
        }

        throw lastError
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
 * Common theme presets
 * NOTE: Theme availability varies by account. Use listThemes() to get available themes.
 */
export const GAMMA_STANDARD_THEMES = [
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
