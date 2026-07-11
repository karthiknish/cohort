// =============================================================================
// META ADS API ERROR CODES
// Reference: https://developers.facebook.com/docs/marketing-api/error-reference
// =============================================================================
export const META_ERROR_CODES = {
    // OAuth & Authentication
    OAUTH_EXCEPTION: 190,
    INVALID_ACCESS_TOKEN: 190,
    ACCESS_TOKEN_EXPIRED: 463,
    PASSWORD_CHANGED: 464,
    // Rate Limiting
    RATE_LIMIT_EXCEEDED: 4,
    TOO_MANY_CALLS: 17,
    USER_RATE_LIMIT: 17,
    APP_RATE_LIMIT: 4,
    ACCOUNT_RATE_LIMIT: 32,
    // Permission Errors
    PERMISSION_DENIED: 10,
    PERMISSION_ERROR: 200,
    UNSUPPORTED_GET_REQUEST: 100,
    // API Errors
    UNKNOWN_ERROR: 1,
    SERVICE_UNAVAILABLE: 2,
    METHOD_UNKNOWN: 3,
    APPLICATION_REQUEST_LIMIT: 4,
    TOO_MANY_DATA_REQUESTS: 613,
    // Business Errors
    AD_ACCOUNT_NOT_FOUND: 1487390,
    AD_ACCOUNT_ACCESS_DENIED: 275,
    CAMPAIGN_NOT_FOUND: 100,
    // Transient Errors
    TEMPORARY_ERROR: 2,
    ASYNC_JOB_UNKNOWN: 2601,
    // Business Use Case (BUC) rate limits
    BUC_LIMIT_REACHED: 80000,
    BUC_TEMPORARILY_BLOCKED: 80003,
    BUC_ACCOUNT_DISABLED: 80004,
    BUC_APP_RATE_LIMIT: 80014,
} as const;

export type MetaErrorCode = (typeof META_ERROR_CODES)[keyof typeof META_ERROR_CODES];

// =============================================================================
// CLASSIFICATION SETS
// Used by error parser and custom MetaApiError to keep behavior in sync.
// =============================================================================

/** Auth error codes that should trigger token refresh. */
export const META_AUTH_CODE_VALUES: number[] = [
    META_ERROR_CODES.OAUTH_EXCEPTION,
    META_ERROR_CODES.ACCESS_TOKEN_EXPIRED,
    META_ERROR_CODES.PASSWORD_CHANGED,
    // Session invalid / active access-token required
    102,
    2500,
];

/** Rate-limit error codes that should trigger backoff and retry. */
export const META_RATE_LIMIT_CODE_VALUES: number[] = [
    META_ERROR_CODES.RATE_LIMIT_EXCEEDED,
    META_ERROR_CODES.TOO_MANY_CALLS,
    META_ERROR_CODES.ACCOUNT_RATE_LIMIT,
    META_ERROR_CODES.TOO_MANY_DATA_REQUESTS,
    META_ERROR_CODES.BUC_LIMIT_REACHED,
    META_ERROR_CODES.BUC_TEMPORARILY_BLOCKED,
    META_ERROR_CODES.BUC_ACCOUNT_DISABLED,
    META_ERROR_CODES.BUC_APP_RATE_LIMIT,
];

/** Transient/infra error codes that are safe to retry. */
export const META_RETRYABLE_CODE_VALUES: number[] = [
    META_ERROR_CODES.UNKNOWN_ERROR,
    META_ERROR_CODES.SERVICE_UNAVAILABLE,
    META_ERROR_CODES.TEMPORARY_ERROR,
];
