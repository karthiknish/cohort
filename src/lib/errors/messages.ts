/**
 * Centralized Status Messages
 * Single source of truth for HTTP status code messages
 */

// =============================================================================
// STATUS MESSAGE MAPS
// =============================================================================

/**
 * Technical error messages (for server-side / API responses)
 */
export const API_STATUS_MESSAGES: Record<number, string> = {
    400: 'Bad request',
    401: 'Authentication required',
    403: 'Permission denied',
    404: 'Resource not found',
    409: 'Conflict occurred',
    422: 'Validation failed',
    429: 'Too many requests',
    500: 'Internal server error',
    502: 'Bad gateway',
    503: 'Service temporarily unavailable',
    504: 'Gateway timeout',
}

/**
 * User-friendly messages (for client-side toast/UI)
 */
export const USER_FRIENDLY_MESSAGES: Record<number, string> = {
    400: 'Something was wrong with your request. Please check and try again.',
    401: 'Please sign in to continue.',
    403: "You don't have permission to do that.",
    404: 'We could not find what you were looking for.',
    409: 'This action conflicts with another operation. Please refresh and try again.',
    422: 'Some fields need attention. Please correct the highlighted fields.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Something went wrong on our side. Please try again.',
    502: 'We are having trouble connecting. Please try again shortly.',
    503: 'The service is temporarily unavailable. Please try again shortly.',
    504: 'The request took too long. Please try again.',
}

/**
 * Error codes mapped to HTTP status
 */
export const ERROR_CODES: Record<string, number> = {
    VALIDATION_ERROR: 400,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    RATE_LIMIT_EXCEEDED: 429,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
    NETWORK_ERROR: 0,
}

/**
 * Suggested actions by status code
 */
export const SUGGESTED_ACTIONS: Record<number, string[]> = {
    400: ['Review your input', 'Try again'],
    401: ['Sign in', 'Contact support'],
    403: ['Contact your admin', 'Request access'],
    404: ['Go back', 'Contact support'],
    429: ['Wait a moment', 'Try again'],
    500: ['Try again', 'Report bug'],
    503: ['Wait a moment', 'Try again'],
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get API/technical status message
 */
export function getStatusMessage(status: number): string {
    return API_STATUS_MESSAGES[status] ?? 'An error occurred'
}

/**
 * Get user-friendly message for display
 */
export function getUserFriendlyMessage(status: number): string {
    return USER_FRIENDLY_MESSAGES[status] ?? 'Something went wrong. Please try again.'
}

/**
 * Get suggested actions for a status code
 */
export function getSuggestedActions(status: number): string[] {
    return SUGGESTED_ACTIONS[status] ?? ['Try again', 'Contact support']
}

/**
 * Check if status code is retryable
 */
export function isRetryableStatus(status: number): boolean {
    return status === 429 || status === 502 || status === 503 || status === 504
}

/**
 * Check if status indicates auth error
 */
export function isAuthStatus(status: number): boolean {
    return status === 401 || status === 403
}

/**
 * Check if status is a validation error
 */
export function isValidationStatus(status: number): boolean {
    return status === 400 || status === 422
}
