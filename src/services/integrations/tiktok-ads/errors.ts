// =============================================================================
// TIKTOK ADS API ERROR CLASS
// =============================================================================

import { TIKTOK_ERROR_CODES } from './types'

import { IntegrationApiErrorBase } from '../shared/api-error-base'

export class TikTokApiError extends IntegrationApiErrorBase {
  readonly httpStatus: number
  readonly errorCode: number
  readonly requestId?: string

  constructor(options: {
    message: string
    httpStatus: number
    errorCode: number
    requestId?: string
    retryAfterMs?: number
  }) {
    const authErrors: number[] = [
      TIKTOK_ERROR_CODES.UNAUTHORIZED,
      TIKTOK_ERROR_CODES.ACCESS_TOKEN_INVALID,
      TIKTOK_ERROR_CODES.ACCESS_TOKEN_EXPIRED,
      TIKTOK_ERROR_CODES.TOKEN_REVOKED,
    ]
    const isAuthError =
      options.httpStatus === 401 ||
      options.httpStatus === 403 ||
      authErrors.includes(options.errorCode)

    const rateLimitErrors: number[] = [
      TIKTOK_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      TIKTOK_ERROR_CODES.QPS_LIMIT,
      TIKTOK_ERROR_CODES.DAILY_LIMIT,
    ]
    const isRateLimitError = options.httpStatus === 429 || rateLimitErrors.includes(options.errorCode)

    const serverErrors: number[] = [
      TIKTOK_ERROR_CODES.INTERNAL_ERROR,
      TIKTOK_ERROR_CODES.SERVICE_UNAVAILABLE,
      TIKTOK_ERROR_CODES.GATEWAY_TIMEOUT,
    ]
    const isRetryable =
      isRateLimitError ||
      (options.httpStatus >= 500 && options.httpStatus < 600) ||
      serverErrors.includes(options.errorCode)

    super({
      name: 'TikTokApiError',
      message: options.message,
      isRetryable: isAuthError ? false : isRetryable,
      isAuthError,
      isRateLimitError,
      retryAfterMs: options.retryAfterMs,
    })

    this.httpStatus = options.httpStatus
    this.errorCode = options.errorCode
    this.requestId = options.requestId
  }

  toJSON() {
    return this.toJSONBase({
      httpStatus: this.httpStatus,
      errorCode: this.errorCode,
      requestId: this.requestId,
    })
  }
}
