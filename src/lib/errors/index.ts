/**
 * Errors Module Barrel File
 * Unified exports for all error handling utilities
 */

// Centralized messages
export {
    API_STATUS_MESSAGES,
    USER_FRIENDLY_MESSAGES,
    ERROR_CODES,
    SUGGESTED_ACTIONS,
    getStatusMessage,
    getUserFriendlyMessage,
    getSuggestedActions,
    isRetryableStatus,
    isAuthStatus,
    isValidationStatus,
} from './messages'

// Unified error class
export {
    UnifiedError,
    type IntegrationPlatform,
    type UnifiedErrorOptions,
    // Convenience constructors
    validationError,
    badRequestError,
    unauthorizedError,
    forbiddenError,
    notFoundError,
    conflictError,
    rateLimitError,
    serviceUnavailableError,
    integrationError,
} from './unified-error'

// Integration error parser
export {
    parseIntegrationError,
    readResponsePayloadSafe,
    parseResponseError,
} from './integration-parser'

// Re-export legacy classes for backward compatibility
export {
    ApiError,
    ValidationError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    ServiceUnavailableError,
} from '@/lib/api-errors'

export {
    ApiClientError,
    buildUserFacingError,
    formatUserFacingErrorMessage,
    type UserFacingError,
} from '@/lib/user-friendly-error'

export { IntegrationApiErrorBase } from '@/lib/error-utils'
