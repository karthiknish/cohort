// =============================================================================
// TIKTOK ADS API ERROR CLASS
// =============================================================================

import { TIKTOK_ERROR_CODES } from './types'

export class TikTokApiError extends Error {
  readonly httpStatus: number
  readonly errorCode: number
  readonly requestId?: string
  readonly isRetryable: boolean
  readonly isAuthError: boolean
  readonly isRateLimitError: boolean
  readonly retryAfterMs?: number

  constructor(options: {
    message: string
    httpStatus: number
    errorCode: number
    requestId?: string
    retryAfterMs?: number
  }) {
    super(options.message)
    this.name = 'TikTokApiError'
    this.httpStatus = options.httpStatus
    this.errorCode = options.errorCode
    this.requestId = options.requestId
    this.retryAfterMs = options.retryAfterMs

    this.isAuthError = this.checkIsAuthError()
    this.isRateLimitError = this.checkIsRateLimitError()
    this.isRetryable = this.checkIsRetryable()
  }

  private checkIsAuthError(): boolean {
    const authErrors: number[] = [
      TIKTOK_ERROR_CODES.UNAUTHORIZED,
      TIKTOK_ERROR_CODES.ACCESS_TOKEN_INVALID,
      TIKTOK_ERROR_CODES.ACCESS_TOKEN_EXPIRED,
      TIKTOK_ERROR_CODES.TOKEN_REVOKED,
    ]
    return this.httpStatus === 401 || 
           this.httpStatus === 403 || 
           (this.errorCode !== undefined && authErrors.includes(this.errorCode))
  }

  private checkIsRateLimitError(): boolean {
    const rateLimitErrors: number[] = [
      TIKTOK_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      TIKTOK_ERROR_CODES.QPS_LIMIT,
      TIKTOK_ERROR_CODES.DAILY_LIMIT,
    ]
    return this.httpStatus === 429 || 
           (this.errorCode !== undefined && rateLimitErrors.includes(this.errorCode))
  }

  private checkIsRetryable(): boolean {
    if (this.isRateLimitError) return true
    if (this.httpStatus >= 500 && this.httpStatus < 600) return true
    
    const serverErrors: number[] = [
      TIKTOK_ERROR_CODES.INTERNAL_ERROR,
      TIKTOK_ERROR_CODES.SERVICE_UNAVAILABLE,
      TIKTOK_ERROR_CODES.GATEWAY_TIMEOUT,
    ]
    if (this.errorCode !== undefined && serverErrors.includes(this.errorCode)) return true
    if (this.isAuthError) return false
    
    return false
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      httpStatus: this.httpStatus,
      errorCode: this.errorCode,
      requestId: this.requestId,
      isRetryable: this.isRetryable,
      isAuthError: this.isAuthError,
      isRateLimitError: this.isRateLimitError,
      retryAfterMs: this.retryAfterMs,
    }
  }
}
