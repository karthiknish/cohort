// =============================================================================
// META ADS API ERRORS
// =============================================================================

import { META_ERROR_CODES } from './types'

// =============================================================================
// CUSTOM ERROR CLASS
// =============================================================================

export class MetaApiError extends Error {
  readonly code: number
  readonly subcode?: number
  readonly type?: string
  readonly fbTraceId?: string
  readonly isRetryable: boolean
  readonly isAuthError: boolean
  readonly isRateLimitError: boolean
  readonly retryAfterMs?: number

  constructor(options: {
    message: string
    code: number
    subcode?: number
    type?: string
    fbTraceId?: string
    retryAfterMs?: number
  }) {
    super(options.message)
    this.name = 'MetaApiError'
    this.code = options.code
    this.subcode = options.subcode
    this.type = options.type
    this.fbTraceId = options.fbTraceId
    this.retryAfterMs = options.retryAfterMs

    // Classify error type
    this.isAuthError = this.checkIsAuthError()
    this.isRateLimitError = this.checkIsRateLimitError()
    this.isRetryable = this.checkIsRetryable()
  }

  private checkIsAuthError(): boolean {
    const authCodes: number[] = [
      META_ERROR_CODES.OAUTH_EXCEPTION,
      META_ERROR_CODES.ACCESS_TOKEN_EXPIRED,
      META_ERROR_CODES.PASSWORD_CHANGED,
    ]
    return this.code !== undefined && authCodes.includes(this.code)
  }

  private checkIsRateLimitError(): boolean {
    const rateLimitCodes: number[] = [
      META_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      META_ERROR_CODES.TOO_MANY_CALLS,
      META_ERROR_CODES.ACCOUNT_RATE_LIMIT,
      META_ERROR_CODES.TOO_MANY_DATA_REQUESTS,
    ]
    return this.code !== undefined && rateLimitCodes.includes(this.code)
  }

  private checkIsRetryable(): boolean {
    // Rate limit errors are retryable after a delay
    if (this.isRateLimitError) return true
    
    // Temporary/service errors
    const retryableCodes: number[] = [
      META_ERROR_CODES.TEMPORARY_ERROR,
      META_ERROR_CODES.SERVICE_UNAVAILABLE,
      META_ERROR_CODES.UNKNOWN_ERROR,
    ]
    if (this.code !== undefined && retryableCodes.includes(this.code)) {
      return true
    }
    
    // Auth errors are NOT retryable without token refresh
    if (this.isAuthError) return false
    
    return false
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      subcode: this.subcode,
      type: this.type,
      fbTraceId: this.fbTraceId,
      isRetryable: this.isRetryable,
      isAuthError: this.isAuthError,
      isRateLimitError: this.isRateLimitError,
      retryAfterMs: this.retryAfterMs,
    }
  }
}
