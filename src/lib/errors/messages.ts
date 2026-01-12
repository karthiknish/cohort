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
    408: 'Request timeout',
    409: 'Conflict occurred',
    413: 'File too large',
    415: 'Unsupported file type',
    422: 'Validation failed',
    429: 'Too many requests',
    500: 'Internal server error',
    502: 'Bad gateway',
    503: 'Service temporarily unavailable',
    504: 'Gateway timeout',
}

/**
 * User-friendly messages (for client-side toast/UI)
 * These are written in a friendly, helpful tone without technical jargon
 */
export const USER_FRIENDLY_MESSAGES: Record<number, string> = {
    400: "We couldn't process that request. Please double-check your information and try again.",
    401: 'Your session has ended. Please sign in again to continue.',
    403: "You don't have access to this feature. Contact your administrator if you need permission.",
    404: "We couldn't find what you're looking for. It may have been moved or deleted.",
    408: 'This is taking longer than expected. Please check your connection and try again.',
    409: 'Someone else may have made changes. Please refresh the page to see the latest version.',
    413: 'This file is too large to upload. Please try a smaller file (under 10MB).',
    415: "This file type isn't supported. Please use a different format.",
    422: 'Please review the highlighted fields and make the necessary corrections.',
    429: "You're doing that too quickly. Please wait a few seconds and try again.",
    500: "Something unexpected happened. We're looking into it — please try again in a moment.",
    502: "We're having trouble connecting to our servers. Please try again in a few moments.",
    503: "We're temporarily down for maintenance. Please check back shortly.",
    504: 'The server took too long to respond. Please try again.',
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
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    PAYLOAD_TOO_LARGE: 413,
    UNSUPPORTED_MEDIA_TYPE: 415,
    RATE_LIMIT_EXCEEDED: 429,
    INTERNAL_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    NETWORK_ERROR: 0,
}

/**
 * Suggested actions by status code
 * These provide clear, actionable next steps for users
 */
export const SUGGESTED_ACTIONS: Record<number, string[]> = {
    400: ['Check your input', 'Try again'],
    401: ['Sign in again', 'Reset password'],
    403: ['Contact admin', 'Request access'],
    404: ['Go back', 'Search for it'],
    408: ['Check connection', 'Try again'],
    409: ['Refresh page', 'Try again'],
    413: ['Use smaller file', 'Compress file'],
    415: ['Use different format', 'Check requirements'],
    422: ['Fix highlighted fields', 'Try again'],
    429: ['Wait 30 seconds', 'Try again'],
    500: ['Refresh page', 'Try again later'],
    502: ['Wait a moment', 'Try again'],
    503: ['Check back soon', 'Contact support'],
    504: ['Check connection', 'Try again'],
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
    return USER_FRIENDLY_MESSAGES[status] ?? "Something didn't work as expected. Please try again, or contact support if the problem continues."
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
