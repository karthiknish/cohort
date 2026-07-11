/**
 * Integration Error Parser
 * Unified error parsing for all ad platform APIs
 */
import { logger } from '@/lib/logger';
import { META_AUTH_CODE_VALUES, META_RATE_LIMIT_CODE_VALUES, META_RETRYABLE_CODE_VALUES, type MetaErrorCode } from '@/services/integrations/meta-ads/types';
import { parseMetaRateLimitHeaders } from '@/services/integrations/meta-ads/rate-limit-headers';
import { extractGoogleAdsErrorPayload, classifyGoogleAdsError, parseGoogleAdsRateLimitHeaders } from '@/services/integrations/google-ads/error-parser';
import { UnifiedError, type IntegrationPlatform } from './unified-error';
// =============================================================================
// PLATFORM ERROR CODE MAPS
// =============================================================================
const META_AUTH_CODES = META_AUTH_CODE_VALUES;
const META_RATE_LIMIT_CODES = META_RATE_LIMIT_CODE_VALUES;
const META_RETRYABLE_CODES = META_RETRYABLE_CODE_VALUES;
const LINKEDIN_AUTH_CODES = [401, 403];
const LINKEDIN_RATE_LIMIT_CODES = [429];
const LINKEDIN_RETRYABLE_CODES = [500, 502, 503, 504];
const TIKTOK_AUTH_CODES = [40001, 40002, 40100];
const TIKTOK_RATE_LIMIT_CODES = [40029];
const TIKTOK_RETRYABLE_CODES = [50000, 50001];
// =============================================================================
// PAYLOAD EXTRACTORS
// =============================================================================
interface ParsedPayload {
    message: string;
    code?: number | string;
    status?: string;
    subcode?: number;
    type?: string;
    traceId?: string;
    requestId?: string;
}
type UnknownRecord = Record<string, unknown>;
function asRecord(value: unknown): UnknownRecord | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    return value as UnknownRecord;
}
function asString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
}
function asNumber(value: unknown): number | undefined {
    return typeof value === 'number' ? value : undefined;
}
function asCode(value: unknown): number | string | undefined {
    if (typeof value === 'number' || typeof value === 'string') {
        return value;
    }
    return undefined;
}
function extractMetaPayload(payload: unknown): ParsedPayload {
    // Handle null/undefined payload - log for debugging
    if (payload == null) {
        logger.error('[Meta Error Parser] Payload is null/undefined, raw response unavailable');
        return { message: 'Meta API request failed - unable to parse error details' };
    }
    // Handle string payload (e.g., plain text error response)
    if (typeof payload === 'string') {
        logger.error('[Meta Error Parser] Payload is a string', undefined, { payload: payload.slice(0, 500) });
        return { message: payload.slice(0, 200) || 'Meta API error' };
    }
    const data = asRecord(payload);
    if (!data) {
        return { message: 'Meta API error' };
    }
    // Check for standard Meta error format
    const error = asRecord(data.error);
    if (error) {
        // Prefer Meta's user-facing fields over generic `message` (often "Invalid parameter").
        const message = asString(error.error_user_msg)
            || asString(error.error_user_title)
            || asString(error.message)
            || 'Meta API error';
        return {
            message,
            code: asCode(error.code),
            subcode: asNumber(error.error_subcode),
            type: asString(error.type),
            traceId: asString(error.fbtrace_id),
        };
    }
    // Check for alternate error format (data.error_code, data.error_msg)
    const errorCode = asCode(data.error_code);
    if (errorCode !== undefined) {
        return {
            message: String(asString(data.error_msg) || asString(data.error_message) || 'Meta API error'),
            code: errorCode,
        };
    }
    // Check for response-level errors
    const responseCode = asCode(data.code);
    if (responseCode !== undefined && responseCode !== 200 && responseCode !== '200') {
        return {
            message: String(asString(data.message) || asString(data.error_description) || 'Meta API request failed'),
            code: responseCode,
        };
    }
    // Fallback: search for generic message/error strings
    if (data.message && typeof data.message === 'string') {
        return { message: data.message };
    }
    // Log unparseable payload for debugging
    const rawPayload = JSON.stringify(data).slice(0, 200);
    logger.error('[Meta Error Parser] Unable to parse payload', undefined, { rawPayload });
    return { message: `Meta API error (Payload: ${rawPayload})` };
}
function extractGooglePayload(payload: unknown): ParsedPayload {
    const parsed = extractGoogleAdsErrorPayload(payload);
    return {
        message: parsed.message,
        code: parsed.code,
        status: parsed.status,
        traceId: parsed.requestId,
        requestId: parsed.requestId,
    };
}
function extractLinkedInPayload(payload: unknown): ParsedPayload {
    if (payload == null) {
        return { message: 'LinkedIn API error' };
    }
    if (typeof payload === 'string') {
        return { message: payload.slice(0, 200) || 'LinkedIn API error' };
    }
    const data = payload as {
        message?: string;
        code?: string;
        status?: number;
        serviceErrorCode?: number;
    };
    return {
        message: data.message ?? 'LinkedIn API error',
        code: data.serviceErrorCode ?? data.status ?? data.code,
        status: data.status ? String(data.status) : undefined,
    };
}
function extractTikTokPayload(payload: unknown): ParsedPayload {
    if (payload == null) {
        return { message: 'TikTok API error' };
    }
    const data = payload as {
        message?: string;
        code?: number;
        request_id?: string;
    };
    return {
        message: data.message ?? 'TikTok API error',
        code: data.code,
        traceId: data.request_id,
    };
}
// =============================================================================
// ERROR CLASSIFICATION
// =============================================================================
interface Classification {
    isAuthError: boolean;
    isRateLimitError: boolean;
    isRetryable: boolean;
}
function classifyMetaError(code?: number | string): Classification {
    const numCode = typeof code === 'number' ? code : parseInt(String(code), 10);
    const typedCode = Number.isFinite(numCode) ? (numCode as MetaErrorCode) : undefined;
    const isAuthError = typedCode !== undefined && META_AUTH_CODES.includes(typedCode);
    const isRateLimitError = typedCode !== undefined && META_RATE_LIMIT_CODES.includes(typedCode);
    const isRetryable = isRateLimitError || (typedCode !== undefined && !isAuthError && META_RETRYABLE_CODES.includes(typedCode));
    return { isAuthError, isRateLimitError, isRetryable };
}
function classifyGoogleError(code?: number | string, status?: string, httpStatus?: number): Classification {
    const google = classifyGoogleAdsError(
        typeof code === 'string' ? code : undefined,
        status,
        httpStatus ?? 0,
    );
    return google;
}
function classifyLinkedInError(code?: number | string, httpStatus?: number): Classification {
    const parsedCode = typeof code === 'number' ? code : parseInt(String(code), 10);
    const numCode = parsedCode || httpStatus || 0;
    const isAuthError = LINKEDIN_AUTH_CODES.includes(numCode) || LINKEDIN_AUTH_CODES.includes(httpStatus || 0);
    const isRateLimitError = LINKEDIN_RATE_LIMIT_CODES.includes(numCode) || LINKEDIN_RATE_LIMIT_CODES.includes(httpStatus || 0);
    const isRetryable = isRateLimitError || LINKEDIN_RETRYABLE_CODES.includes(numCode) || LINKEDIN_RETRYABLE_CODES.includes(httpStatus || 0);
    return { isAuthError, isRateLimitError, isRetryable };
}
function classifyTikTokError(code?: number | string): Classification {
    const numCode = typeof code === 'number' ? code : parseInt(String(code), 10);
    const isAuthError = TIKTOK_AUTH_CODES.includes(numCode);
    const isRateLimitError = TIKTOK_RATE_LIMIT_CODES.includes(numCode);
    const isRetryable = isRateLimitError || TIKTOK_RETRYABLE_CODES.includes(numCode);
    return { isAuthError, isRateLimitError, isRetryable };
}
// =============================================================================
// MAIN PARSER
// =============================================================================
/**
 * Parse an integration API error into a UnifiedError
 */
export function parseIntegrationError(response: Response, payload: unknown, platform: IntegrationPlatform): UnifiedError {
    const httpStatus = response.status;
    // Log for debugging - help identify why payload might be null
    if (payload == null) {
        logger.error(`[Error Parser] ${platform.toUpperCase()} error response has null payload`, undefined, {
            url: response.url,
            status: httpStatus,
            contentType: response.headers.get('content-type'),
        });
    }
    // Extract platform-specific payload
    let parsed: ParsedPayload;
    let classification: Classification;
    switch (platform) {
        case 'meta':
            parsed = extractMetaPayload(payload);
            classification = classifyMetaError(parsed.code);
            break;
        case 'google':
            parsed = extractGooglePayload(payload);
            classification = classifyGoogleError(parsed.code, parsed.status, httpStatus);
            break;
        case 'linkedin':
            parsed = extractLinkedInPayload(payload);
            classification = classifyLinkedInError(parsed.code, httpStatus);
            break;
        case 'tiktok':
            parsed = extractTikTokPayload(payload);
            classification = classifyTikTokError(parsed.code);
            break;
        default:
            parsed = { message: 'Unknown integration error' };
            classification = { isAuthError: false, isRateLimitError: false, isRetryable: false };
    }
    // Extract retry-after / platform-specific rate-limit headers
    let rateLimitDetails = platform === 'meta'
        ? parseMetaRateLimitHeaders(response.headers)
        : platform === 'google'
            ? parseGoogleAdsRateLimitHeaders(response.headers)
            : undefined;
    let retryAfterMs = rateLimitDetails?.retryAfterMs;
    if (retryAfterMs === undefined) {
        const retryAfterHeader = response.headers.get('retry-after');
        if (retryAfterHeader) {
            const seconds = parseInt(retryAfterHeader, 10);
            if (Number.isFinite(seconds) && seconds >= 0) {
                retryAfterMs = seconds * 1000;
            }
        }
    }
    if (retryAfterMs === undefined && classification.isRateLimitError) {
        retryAfterMs = 60000; // Default 1 minute for rate limits
    }
    const details: Record<string, string[]> = {};
    if (parsed.traceId) details.traceId = [parsed.traceId];
    if (parsed.requestId) details.requestId = [parsed.requestId];
    if (parsed.code !== undefined) details.errorCode = [String(parsed.code)];
    return new UnifiedError({
        message: parsed.message,
        status: httpStatus,
        code: `${platform.toUpperCase()}_API_ERROR`,
        platform,
        isRetryable: classification.isRetryable,
        isAuthError: classification.isAuthError,
        isRateLimitError: classification.isRateLimitError,
        retryAfterMs,
        rateLimitDetails,
        details: Object.keys(details).length > 0 ? details : undefined,
    });
}
/**
 * Read response payload safely for error parsing
 */
export async function readResponsePayloadSafe(response: Response): Promise<unknown> {
    try {
        const contentType = response.headers.get('content-type') || '';
        // Clone response before reading to avoid "body stream already read" errors
        const responseClone = response.clone();
        if (contentType.includes('application/json')) {
            const text = await responseClone.text();
            // Log for debugging empty responses
            if (!text || text.trim() === '') {
                logger.error('[Response Parser] Empty JSON response', undefined, { url: response.url, status: response.status });
                return null;
            }
            try {
                return JSON.parse(text);
            }
            catch {
                logger.error('[Response Parser] Failed to parse JSON', undefined, { text: text.slice(0, 500) });
                return null;
            }
        }
        const text = await responseClone.text();
        return text || null;
    }
    catch (error) {
        logger.error('[Response Parser] Error reading response', error);
        return null;
    }
}
/**
 * Parse response errors for all platforms
 */
export async function parseResponseError(response: Response, platform: IntegrationPlatform): Promise<UnifiedError> {
    const payload = await readResponsePayloadSafe(response);
    return parseIntegrationError(response, payload, platform);
}
