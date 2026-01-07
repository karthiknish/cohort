// =============================================================================
// META ADS API ERRORS
// =============================================================================

import { META_ERROR_CODES } from './types'

import { IntegrationApiErrorBase } from '../shared/api-error-base'

// =============================================================================
// CUSTOM ERROR CLASS
// =============================================================================

export class MetaApiError extends IntegrationApiErrorBase {
  readonly code: number
  readonly subcode?: number
  readonly type?: string
  readonly fbTraceId?: string

  constructor(options: {
    message: string
    code: number
    subcode?: number
    type?: string
    fbTraceId?: string
    retryAfterMs?: number
  }) {
    const authCodes: number[] = [
      META_ERROR_CODES.OAUTH_EXCEPTION,
      META_ERROR_CODES.ACCESS_TOKEN_EXPIRED,
      META_ERROR_CODES.PASSWORD_CHANGED,
    ]
    const rateLimitCodes: number[] = [
      META_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      META_ERROR_CODES.TOO_MANY_CALLS,
      META_ERROR_CODES.ACCOUNT_RATE_LIMIT,
      META_ERROR_CODES.TOO_MANY_DATA_REQUESTS,
    ]
    const retryableCodes: number[] = [
      META_ERROR_CODES.TEMPORARY_ERROR,
      META_ERROR_CODES.SERVICE_UNAVAILABLE,
      META_ERROR_CODES.UNKNOWN_ERROR,
    ]

    const isAuthError = authCodes.includes(options.code)
    const isRateLimitError = rateLimitCodes.includes(options.code)
    const isRetryable = isRateLimitError || (!isAuthError && retryableCodes.includes(options.code))

    super({
      name: 'MetaApiError',
      message: options.message,
      isRetryable,
      isAuthError,
      isRateLimitError,
      retryAfterMs: options.retryAfterMs,
    })

    this.code = options.code
    this.subcode = options.subcode
    this.type = options.type
    this.fbTraceId = options.fbTraceId
  }

  toJSON() {
    return this.toJSONBase({
      code: this.code,
      subcode: this.subcode,
      type: this.type,
      fbTraceId: this.fbTraceId,
    })
  }
}
