/**
 * Gamma Generate API Types
 * API Docs: https://developers.gamma.app/docs/getting-started
 * API Reference: https://developers.gamma.app/reference
 */

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
