/**
 * Unified Error Class
 * Base error class that consolidates all error handling patterns
 */

import { getStatusMessage, isRetryableStatus, isAuthStatus } from './messages'

// =============================================================================
// TYPES
// =============================================================================

export type IntegrationPlatform = 'meta' | 'google' | 'tiktok' | 'linkedin'

export interface UnifiedErrorOptions {
    message: string
    status?: number
    code?: string
    details?: Record<string, string[]>
    isRetryable?: boolean
    isAuthError?: boolean
    retryAfterMs?: number
    platform?: IntegrationPlatform
    cause?: unknown
}

// =============================================================================
// UNIFIED ERROR CLASS
// =============================================================================

/**
 * UnifiedError - Consolidated error class for all error scenarios
 * 
 * Combines features from:
 * - ApiError (server-side status, code, details)
 * - ApiClientError (client-side formatting)
 * - IntegrationApiErrorBase (retryable, auth error detection)
 */
export class UnifiedError extends Error {
    readonly status: number
    readonly code: string
    readonly details?: Record<string, string[]>
    readonly isRetryable: boolean
    readonly isAuthError: boolean
    readonly retryAfterMs?: number
    readonly platform?: IntegrationPlatform

    constructor(options: UnifiedErrorOptions) {
        super(options.message || getStatusMessage(options.status ?? 500))
        this.name = 'UnifiedError'

        this.status = options.status ?? 500
        this.code = options.code ?? 'INTERNAL_ERROR'
        this.details = options.details
        this.platform = options.platform
        this.retryAfterMs = options.retryAfterMs

        // Auto-detect if not explicitly provided
        this.isRetryable = options.isRetryable ?? isRetryableStatus(this.status)
        this.isAuthError = options.isAuthError ?? isAuthStatus(this.status)

        // Preserve cause for debugging
        if (options.cause) {
            ; (this as { cause?: unknown }).cause = options.cause
        }

        Error.captureStackTrace?.(this, this.constructor)
    }

    /**
     * Create from an existing error
     */
    static from(error: unknown, defaults?: Partial<UnifiedErrorOptions>): UnifiedError {
        if (error instanceof UnifiedError) {
            return error
        }

        if (error instanceof Error) {
            const anyError = error as {
                status?: number
                code?: string
                details?: Record<string, string[]>
                isRetryable?: boolean
                isAuthError?: boolean
                retryAfterMs?: number
            }

            return new UnifiedError({
                message: error.message,
                status: anyError.status ?? defaults?.status,
                code: anyError.code ?? defaults?.code,
                details: anyError.details ?? defaults?.details,
                isRetryable: anyError.isRetryable ?? defaults?.isRetryable,
                isAuthError: anyError.isAuthError ?? defaults?.isAuthError,
                retryAfterMs: anyError.retryAfterMs ?? defaults?.retryAfterMs,
                platform: defaults?.platform,
                cause: error,
            })
        }

        return new UnifiedError({
            message: typeof error === 'string' ? error : 'An error occurred',
            ...defaults,
            cause: error,
        })
    }

    /**
     * Serialize for API response
     */
    toJSON(): Record<string, unknown> {
        return {
            error: this.message,
            code: this.code,
            status: this.status,
            details: this.details,
            ...(this.platform && { platform: this.platform }),
            ...(this.isRetryable && { isRetryable: this.isRetryable }),
            ...(this.retryAfterMs && { retryAfterMs: this.retryAfterMs }),
        }
    }
}

// =============================================================================
// CONVENIENCE CONSTRUCTORS
// =============================================================================

export function validationError(message = 'Validation failed', details?: Record<string, string[]>): UnifiedError {
    return new UnifiedError({ message, status: 400, code: 'VALIDATION_ERROR', details })
}

export function badRequestError(message = 'Bad request'): UnifiedError {
    return new UnifiedError({ message, status: 400, code: 'BAD_REQUEST' })
}

export function unauthorizedError(message = 'Authentication required'): UnifiedError {
    return new UnifiedError({ message, status: 401, code: 'UNAUTHORIZED', isAuthError: true })
}

export function forbiddenError(message = 'Permission denied'): UnifiedError {
    return new UnifiedError({ message, status: 403, code: 'FORBIDDEN', isAuthError: true })
}

export function notFoundError(message = 'Resource not found', resourceType?: string, resourceId?: string): UnifiedError {
    const finalMessage = message || (resourceType && resourceId
        ? `${resourceType} with ID '${resourceId}' not found`
        : resourceType
            ? `${resourceType} not found`
            : 'Resource not found')
    return new UnifiedError({ message: finalMessage, status: 404, code: 'NOT_FOUND' })
}

export function conflictError(message = 'Conflict occurred'): UnifiedError {
    return new UnifiedError({ message, status: 409, code: 'CONFLICT' })
}

export function rateLimitError(message = 'Too many requests', retryAfterMs?: number): UnifiedError {
    return new UnifiedError({ message, status: 429, code: 'RATE_LIMIT_EXCEEDED', isRetryable: true, retryAfterMs })
}

export function serviceUnavailableError(message = 'Service temporarily unavailable'): UnifiedError {
    return new UnifiedError({ message, status: 503, code: 'SERVICE_UNAVAILABLE', isRetryable: true })
}

export function integrationError(
    message: string,
    platform: IntegrationPlatform,
    options?: { isRetryable?: boolean; isAuthError?: boolean; retryAfterMs?: number }
): UnifiedError {
    return new UnifiedError({
        message,
        status: 502,
        code: 'INTEGRATION_ERROR',
        platform,
        ...options,
    })
}
