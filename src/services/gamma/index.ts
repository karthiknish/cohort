/**
 * Gamma Generate API - Public Exports
 * 
 * Re-exports all types and the service from the gamma module.
 */

// Re-export all types
export type {
    GammaAccessLevel,
    GammaCardDimensions,
    GammaCardOptions,
    GammaDocumentDimensions,
    GammaEmailOptions,
    GammaExportFormat,
    GammaFolder,
    GammaFormat,
    GammaGeneratedFile,
    GammaGenerationOptions,
    GammaGenerationRequest,
    GammaGenerationResponse,
    GammaGenerationStatus,
    GammaHeaderFooterCardNumber,
    GammaHeaderFooterContent,
    GammaHeaderFooterImage,
    GammaHeaderFooterOptions,
    GammaHeaderFooterPosition,
    GammaHeaderFooterSize,
    GammaHeaderFooterText,
    GammaImageModel,
    GammaImageOptions,
    GammaImageSource,
    GammaLanguageCode,
    GammaListOptions,
    GammaPaginatedResponse,
    GammaPresentationDimensions,
    GammaSharingOptions,
    GammaSocialDimensions,
    GammaTemplateRequest,
    GammaTextAmount,
    GammaTextMode,
    GammaTextOptions,
    GammaTheme,
} from './types'

// Re-export service and utilities
export {
    createPresentationRequest,
    createTemplateRequest,
    GAMMA_IMAGE_MODEL_CREDITS,
    GAMMA_RECOMMENDED_MODELS,
    GAMMA_STANDARD_THEMES,
    gammaService,
    GammaService,
} from './api'

export {
    CircuitBreaker,
    getGammaCircuitBreaker,
    resetGammaCircuitBreaker,
} from './circuit-breaker'
