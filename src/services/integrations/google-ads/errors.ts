// =============================================================================
// GOOGLE ADS API ERROR CLASS
// =============================================================================

import { GOOGLE_ADS_ERROR_CODES, GoogleAdsErrorDetail } from './types'

export class GoogleAdsApiError extends Error {
  readonly httpStatus: number
  readonly grpcStatus?: string
  readonly errorCode?: string
  readonly requestId?: string
  readonly details?: GoogleAdsErrorDetail[]
  readonly isRetryable: boolean
  readonly isAuthError: boolean
  readonly isRateLimitError: boolean
  readonly retryAfterMs?: number

  constructor(options: {
    message: string
    httpStatus: number
    grpcStatus?: string
    errorCode?: string
    requestId?: string
    details?: GoogleAdsErrorDetail[]
    retryAfterMs?: number
  }) {
    super(options.message)
    this.name = 'GoogleAdsApiError'
    this.httpStatus = options.httpStatus
    this.grpcStatus = options.grpcStatus
    this.errorCode = options.errorCode
    this.requestId = options.requestId
    this.details = options.details
    this.retryAfterMs = options.retryAfterMs

    this.isAuthError = this.checkIsAuthError()
    this.isRateLimitError = this.checkIsRateLimitError()
    this.isRetryable = this.checkIsRetryable()
  }

  private checkIsAuthError(): boolean {
    const authErrors: string[] = [
      GOOGLE_ADS_ERROR_CODES.AUTHENTICATION_ERROR,
      GOOGLE_ADS_ERROR_CODES.AUTHORIZATION_ERROR,
      GOOGLE_ADS_ERROR_CODES.OAUTH_TOKEN_INVALID,
      GOOGLE_ADS_ERROR_CODES.OAUTH_TOKEN_EXPIRED,
      GOOGLE_ADS_ERROR_CODES.OAUTH_TOKEN_REVOKED,
      GOOGLE_ADS_ERROR_CODES.USER_PERMISSION_DENIED,
    ]
    return this.httpStatus === 401 || 
           this.httpStatus === 403 || 
           (this.errorCode !== undefined && authErrors.includes(this.errorCode))
  }

  private checkIsRateLimitError(): boolean {
    const rateLimitErrors: string[] = [
      GOOGLE_ADS_ERROR_CODES.RATE_EXCEEDED,
      GOOGLE_ADS_ERROR_CODES.RESOURCE_EXHAUSTED,
      GOOGLE_ADS_ERROR_CODES.RESOURCE_TEMPORARILY_EXHAUSTED,
    ]
    return this.httpStatus === 429 || 
           this.grpcStatus === 'RESOURCE_EXHAUSTED' ||
           (this.errorCode !== undefined && rateLimitErrors.includes(this.errorCode))
  }

  private checkIsRetryable(): boolean {
    if (this.isRateLimitError) return true
    if (this.httpStatus >= 500 && this.httpStatus < 600) return true
    if (this.errorCode === GOOGLE_ADS_ERROR_CODES.TRANSIENT_ERROR ||
        this.errorCode === GOOGLE_ADS_ERROR_CODES.INTERNAL_ERROR) {
      return true
    }
    if (this.isAuthError) return false
    return false
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      httpStatus: this.httpStatus,
      grpcStatus: this.grpcStatus,
      errorCode: this.errorCode,
      requestId: this.requestId,
      isRetryable: this.isRetryable,
      isAuthError: this.isAuthError,
      isRateLimitError: this.isRateLimitError,
      retryAfterMs: this.retryAfterMs,
    }
  }
}
