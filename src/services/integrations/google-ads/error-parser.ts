// =============================================================================
// GOOGLE ADS API ERROR PARSER
// Shared parsing and classification for Google Ads API errors.
// Handles the standard REST error envelope and MutateGoogleAdsResponse
// partialFailureError payloads.
// Reference: https://developers.google.com/google-ads/api/docs/common-errors
// =============================================================================
import type { RateLimitDetails } from '@/lib/retry-utils';
import { parseRetryAfterMs } from '@/lib/retry-utils';
import type { GoogleAdsApiErrorResponse, GoogleAdsFailure, GoogleAdsMutateResponse } from './types';

export interface GoogleAdsErrorInfo {
    message: string;
    code?: string;
    status?: string;
    requestId?: string;
    details?: GoogleAdsFailure;
}

export interface GoogleAdsErrorClassification {
    isAuthError: boolean;
    isRateLimitError: boolean;
    isRetryable: boolean;
}

const GOOGLE_AUTH_KEYS = ['authentication', 'authorization', 'unauthenticated', 'permission_denied', 'oauth_token', 'user_permission_denied', 'customer_not_enabled', 'developer_token'];
const GOOGLE_RATE_LIMIT_KEYS = ['rate_limit', 'quota', 'resource_exhausted', 'too_many_requests', 'resource_temporarily_exhausted'];
const GOOGLE_RETRYABLE_KEYS = ['internal', 'transient', 'unavailable', 'deadline_exceeded', 'gateway_timeout', 'service_unavailable'];

function hasErrorKey(code: string | undefined, status: string | undefined, keys: string[]): boolean {
    const haystack = [String(code ?? ''), String(status ?? '')].join(' ').toLowerCase();
    return keys.some((key) => haystack.includes(key));
}

function firstErrorCodeValue(errorCode?: Record<string, string | undefined>): string | undefined {
    if (!errorCode || typeof errorCode !== 'object') {
        return undefined;
    }
    const keys = Object.keys(errorCode);
    const firstKey = keys[0];
    if (!firstKey) {
        return undefined;
    }
    return `${firstKey}${errorCode[firstKey] ? `.${errorCode[firstKey]}` : ''}`;
}

function extractFailure(failure?: GoogleAdsFailure): Pick<GoogleAdsErrorInfo, 'code' | 'message' | 'requestId' | 'details'> | undefined {
    if (!failure) {
        return undefined;
    }
    const firstError = failure.errors?.[0];
    if (!firstError) {
        return undefined;
    }
    return {
        message: firstError.message ?? 'Google Ads API operation failed',
        code: firstError.errorCode ? firstErrorCodeValue(firstError.errorCode) : undefined,
        requestId: failure.requestId,
        details: failure,
    };
}

export function extractGoogleAdsErrorPayload(payload: unknown): GoogleAdsErrorInfo {
    if (payload == null || typeof payload !== 'object') {
        return { message: 'Google Ads API error' };
    }
    const data = payload as GoogleAdsApiErrorResponse | GoogleAdsMutateResponse | Record<string, unknown>;

    // Successful mutate response with partial failures
    const partialFailure = 'partialFailureError' in data ? data.partialFailureError : undefined;
    if (partialFailure) {
        const failure = extractFailure(partialFailure);
        if (failure) {
            return { message: failure.message, code: failure.code, requestId: failure.requestId, details: failure.details };
        }
    }

    // Standard REST error envelope
    const error = 'error' in data ? data.error : undefined;
    if (error && typeof error === 'object') {
        const err = error as GoogleAdsApiErrorResponse['error'];
        const topLevelMessage = err?.message ?? 'Google Ads API error';
        const status = err?.status;

        // Google Ads API details are GoogleAdsFailure objects
        const details = err?.details?.find((d) => Array.isArray(d.errors) && d.errors.length > 0);
        const failure = details ? extractFailure(details) : undefined;

        return {
            message: failure?.message ?? topLevelMessage,
            code: failure?.code ?? status,
            status: status,
            requestId: failure?.requestId ?? details?.requestId,
            details: failure?.details,
        };
    }

    return { message: 'Google Ads API error' };
}

export function classifyGoogleAdsError(code: string | undefined, status: string | undefined, httpStatus: number): GoogleAdsErrorClassification {
    const isAuthError = httpStatus === 401 ||
        httpStatus === 403 ||
        hasErrorKey(code, status, GOOGLE_AUTH_KEYS);
    const isRateLimitError = httpStatus === 429 ||
        hasErrorKey(code, status, GOOGLE_RATE_LIMIT_KEYS);
    const isRetryable = isRateLimitError ||
        (httpStatus >= 500 && httpStatus < 600) ||
        hasErrorKey(code, status, GOOGLE_RETRYABLE_KEYS);
    return { isAuthError, isRateLimitError, isRetryable };
}

export function parseGoogleAdsRateLimitHeaders(headers: Headers): RateLimitDetails | undefined {
    const retryAfterMs = parseRetryAfterMs(headers);
    if (retryAfterMs === undefined) {
        return undefined;
    }
    return { source: 'google', retryAfterMs };
}
