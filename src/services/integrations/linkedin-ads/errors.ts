// =============================================================================
// LINKEDIN ADS API ERROR CLASS
// =============================================================================

import { LINKEDIN_ERROR_CODES } from './types'

export class LinkedInApiError extends Error {
  readonly httpStatus: number
  readonly errorCode?: string
  readonly serviceErrorCode?: number
  readonly isRetryable: boolean
  readonly isAuthError: boolean
  readonly isRateLimitError: boolean
  readonly retryAfterMs?: number

  constructor(options: {
    message: string
    httpStatus: number
    errorCode?: string
    serviceErrorCode?: number
    retryAfterMs?: number
  }) {
    super(options.message)
    this.name = 'LinkedInApiError'
    this.httpStatus = options.httpStatus
    this.errorCode = options.errorCode
    this.serviceErrorCode = options.serviceErrorCode
    this.retryAfterMs = options.retryAfterMs

    this.isAuthError = this.checkIsAuthError()
    this.isRateLimitError = this.checkIsRateLimitError()
    this.isRetryable = this.checkIsRetryable()
  }

  private checkIsAuthError(): boolean {
    return this.httpStatus === LINKEDIN_ERROR_CODES.UNAUTHORIZED || 
           this.httpStatus === LINKEDIN_ERROR_CODES.FORBIDDEN ||
           this.errorCode === LINKEDIN_ERROR_CODES.PERMISSION_DENIED
  }

  private checkIsRateLimitError(): boolean {
    return this.httpStatus === LINKEDIN_ERROR_CODES.RATE_LIMITED
  }

  private checkIsRetryable(): boolean {
    if (this.isRateLimitError) return true
    if (this.httpStatus >= 500 && this.httpStatus < 600) return true
    if (this.isAuthError) return false
    return false
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      httpStatus: this.httpStatus,
      errorCode: this.errorCode,
      serviceErrorCode: this.serviceErrorCode,
      isRetryable: this.isRetryable,
      isAuthError: this.isAuthError,
      isRateLimitError: this.isRateLimitError,
      retryAfterMs: this.retryAfterMs,
    }
  }
}
