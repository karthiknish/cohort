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
    // Handle null/undefined payload - log for debugging
    if (payload == null) {
        console.error('[Meta Error Parser] Payload is null/undefined, raw response unavailable')
        return { message: 'Meta API request failed - unable to parse error details' }
    }

    // Handle string payload (e.g., plain text error response)
    if (typeof payload === 'string') {
        console.error('[Meta Error Parser] Payload is a string:', payload)
        return { message: payload.slice(0, 200) || 'Meta API error' }
    }

    const data = payload as any

    // Check for standard Meta error format
    if (data.error) {
        const error = data.error
        return {
            message: String(error.message || error.error_user_msg || 'Meta API error'),
            code: error.code as number | undefined,
            subcode: error.error_subcode as number | undefined,
            type: error.type as string | undefined,
            traceId: error.fbtrace_id as string | undefined,
        }
    }

    // Check for alternate error format (data.error_code, data.error_msg)
    if (data.error_code) {
        return {
            message: String(data.error_msg || data.error_message || 'Meta API error'),
            code: data.error_code as number | undefined,
        }
    }

    // Check for response-level errors
    if (data.code && data.code !== 200) {
        return {
            message: String(data.message || data.error_description || 'Meta API request failed'),
            code: data.code,
        }
    }

    // Fallback: search for any "message" or "error" related string
    if (data.message && typeof data.message === 'string') {
        return { message: data.message }
    }

    // Log unparseable payload for debugging
    const rawPayload = JSON.stringify(data).slice(0, 200)
    console.error('[Meta Error Parser] Unable to parse payload:', rawPayload)

    return { message: `Meta API error (Payload: ${rawPayload})` }
}

function extractGooglePayload(payload: unknown): ParsedPayload {
    // Handle null/undefined payload
    if (payload == null) {
        return { message: 'Google API error' }
    }

    const data = payload as { error?: { errors?: Array<{ message?: string; domain?: string }> } | null }
    const error = data?.error

    // Handle null error object
    if (error == null) {
        return { message: 'Google API error' }
    }

    const firstError = error?.errors?.[0]

    return {
        message: firstError?.message ?? 'Google API error',
        code: firstError?.domain,
    }
}

function extractLinkedInPayload(payload: unknown): ParsedPayload {
    if (payload == null) {
        return { message: 'LinkedIn API error' }
    }

    const data = payload as { message?: string; code?: string; status?: number }

    return {
        message: data.message ?? 'LinkedIn API error',
        code: data.code ?? data.status,
    }
}

function extractTikTokPayload(payload: unknown): ParsedPayload {
    if (payload == null) {
        return { message: 'TikTok API error' }
    }

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

    // Log for debugging - help identify why payload might be null
    if (payload == null) {
        console.error(`[Error Parser] ${platform.toUpperCase()} error response has null payload`, {
            url: response.url,
            status: httpStatus,
            contentType: response.headers.get('content-type'),
        })
    }

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
            const text = await response.text()
            // Log for debugging empty responses
            if (!text || text.trim() === '') {
                console.error('[Response Parser] Empty JSON response from', response.url, 'status:', response.status)
                return null
            }
            try {
                return JSON.parse(text)
            } catch (parseError) {
                console.error('[Response Parser] Failed to parse JSON:', text.slice(0, 500))
                return null
            }
        }
        const text = await response.text()
        return text || null
    } catch (error) {
        console.error('[Response Parser] Error reading response:', error)
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
