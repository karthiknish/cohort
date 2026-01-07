/**
 * Integration Error Parser
 * Unified error parsing for all ad platform APIs
 */

import { UnifiedError, type IntegrationPlatform } from './unified-error'

// =============================================================================
// PLATFORM ERROR CODE MAPS
// =============================================================================

const META_AUTH_CODES = [190, 102, 2500]
const META_RATE_LIMIT_CODES = [4, 17, 32, 613]
const META_RETRYABLE_CODES = [1, 2, 503]

const GOOGLE_AUTH_ERRORS = ['AUTHENTICATION_ERROR', 'AUTHORIZATION_ERROR']
const GOOGLE_RATE_LIMIT_ERRORS = ['QUOTA_ERROR', 'RATE_LIMIT_ERROR']
const GOOGLE_RETRYABLE_ERRORS = ['INTERNAL_ERROR', 'TRANSIENT_ERROR']

const LINKEDIN_AUTH_CODES = [401, 403]
const LINKEDIN_RATE_LIMIT_CODES = [429]
const LINKEDIN_RETRYABLE_CODES = [500, 502, 503, 504]

const TIKTOK_AUTH_CODES = [40001, 40002, 40100]
const TIKTOK_RATE_LIMIT_CODES = [40029]
const TIKTOK_RETRYABLE_CODES = [50000, 50001]

// =============================================================================
// PAYLOAD EXTRACTORS
// =============================================================================

interface ParsedPayload {
    message: string
    code?: number | string
    subcode?: number
    type?: string
    traceId?: string
}

function extractMetaPayload(payload: unknown): ParsedPayload {
    const error = (payload as { error?: Record<string, unknown> })?.error
    if (!error) {
        return { message: 'Unknown Meta API error' }
    }

    return {
        message: String(error.message ?? 'Meta API error'),
        code: error.code as number | undefined,
        subcode: error.error_subcode as number | undefined,
        type: error.type as string | undefined,
        traceId: error.fbtrace_id as string | undefined,
    }
}

function extractGooglePayload(payload: unknown): ParsedPayload {
    const error = (payload as { error?: { errors?: Array<{ message?: string; domain?: string }> } })?.error
    const firstError = error?.errors?.[0]

    return {
        message: firstError?.message ?? 'Google API error',
        code: firstError?.domain,
    }
}

function extractLinkedInPayload(payload: unknown): ParsedPayload {
    const data = payload as { message?: string; code?: string; status?: number }

    return {
        message: data.message ?? 'LinkedIn API error',
        code: data.code ?? data.status,
    }
}

function extractTikTokPayload(payload: unknown): ParsedPayload {
    const data = payload as { message?: string; code?: number; request_id?: string }

    return {
        message: data.message ?? 'TikTok API error',
        code: data.code,
        traceId: data.request_id,
    }
}

// =============================================================================
// ERROR CLASSIFICATION
// =============================================================================

interface Classification {
    isAuthError: boolean
    isRateLimitError: boolean
    isRetryable: boolean
}

function classifyMetaError(code?: number | string): Classification {
    const numCode = typeof code === 'number' ? code : parseInt(String(code), 10)
    const isAuthError = META_AUTH_CODES.includes(numCode)
    const isRateLimitError = META_RATE_LIMIT_CODES.includes(numCode)
    const isRetryable = isRateLimitError || (!isAuthError && META_RETRYABLE_CODES.includes(numCode))

    return { isAuthError, isRateLimitError, isRetryable }
}

function classifyGoogleError(code?: number | string): Classification {
    const strCode = String(code ?? '')
    const isAuthError = GOOGLE_AUTH_ERRORS.some((c) => strCode.includes(c))
    const isRateLimitError = GOOGLE_RATE_LIMIT_ERRORS.some((c) => strCode.includes(c))
    const isRetryable = isRateLimitError || GOOGLE_RETRYABLE_ERRORS.some((c) => strCode.includes(c))

    return { isAuthError, isRateLimitError, isRetryable }
}

function classifyLinkedInError(code?: number | string, httpStatus?: number): Classification {
    const numCode = typeof code === 'number' ? code : parseInt(String(code), 10) || httpStatus || 0
    const isAuthError = LINKEDIN_AUTH_CODES.includes(numCode)
    const isRateLimitError = LINKEDIN_RATE_LIMIT_CODES.includes(numCode)
    const isRetryable = isRateLimitError || LINKEDIN_RETRYABLE_CODES.includes(numCode)

    return { isAuthError, isRateLimitError, isRetryable }
}

function classifyTikTokError(code?: number | string): Classification {
    const numCode = typeof code === 'number' ? code : parseInt(String(code), 10)
    const isAuthError = TIKTOK_AUTH_CODES.includes(numCode)
    const isRateLimitError = TIKTOK_RATE_LIMIT_CODES.includes(numCode)
    const isRetryable = isRateLimitError || TIKTOK_RETRYABLE_CODES.includes(numCode)

    return { isAuthError, isRateLimitError, isRetryable }
}

// =============================================================================
// MAIN PARSER
// =============================================================================

/**
 * Parse an integration API error into a UnifiedError
 */
export function parseIntegrationError(
    response: Response,
    payload: unknown,
    platform: IntegrationPlatform
): UnifiedError {
    const httpStatus = response.status

    // Extract platform-specific payload
    let parsed: ParsedPayload
    let classification: Classification

    switch (platform) {
        case 'meta':
            parsed = extractMetaPayload(payload)
            classification = classifyMetaError(parsed.code)
            break
        case 'google':
            parsed = extractGooglePayload(payload)
            classification = classifyGoogleError(parsed.code)
            break
        case 'linkedin':
            parsed = extractLinkedInPayload(payload)
            classification = classifyLinkedInError(parsed.code, httpStatus)
            break
        case 'tiktok':
            parsed = extractTikTokPayload(payload)
            classification = classifyTikTokError(parsed.code)
            break
        default:
            parsed = { message: 'Unknown integration error' }
            classification = { isAuthError: false, isRateLimitError: false, isRetryable: false }
    }

    // Extract retry-after header if available
    const retryAfterHeader = response.headers.get('retry-after')
    const retryAfterMs = retryAfterHeader
        ? parseInt(retryAfterHeader, 10) * 1000 || undefined
        : classification.isRateLimitError
            ? 60000 // Default 1 minute for rate limits
            : undefined

    return new UnifiedError({
        message: parsed.message,
        status: httpStatus,
        code: `${platform.toUpperCase()}_API_ERROR`,
        platform,
        isRetryable: classification.isRetryable,
        isAuthError: classification.isAuthError,
        retryAfterMs,
        details: parsed.traceId ? { traceId: [parsed.traceId] } : undefined,
    })
}

/**
 * Read response payload safely for error parsing
 */
export async function readResponsePayloadSafe(response: Response): Promise<unknown> {
    try {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
            return await response.json()
        }
        return await response.text()
    } catch {
        return null
    }
}

/**
 * Parse response errors for any platform
 */
export async function parseResponseError(
    response: Response,
    platform: IntegrationPlatform
): Promise<UnifiedError> {
    const payload = await readResponsePayloadSafe(response)
    return parseIntegrationError(response, payload, platform)
}
