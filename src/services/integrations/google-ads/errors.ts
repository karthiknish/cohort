// =============================================================================
// GOOGLE ADS API ERROR CLASS
// =============================================================================

import { GOOGLE_ADS_ERROR_CODES, GoogleAdsErrorDetail } from './types'

import { IntegrationApiErrorBase } from '../shared/api-error-base'

export class GoogleAdsApiError extends IntegrationApiErrorBase {
  readonly httpStatus: number
  readonly grpcStatus?: string
  readonly errorCode?: string
  readonly requestId?: string
  readonly details?: GoogleAdsErrorDetail[]

  constructor(options: {
    message: string
    httpStatus: number
    grpcStatus?: string
    errorCode?: string
    requestId?: string
    details?: GoogleAdsErrorDetail[]
    retryAfterMs?: number
  }) {
    const authErrors: string[] = [
      GOOGLE_ADS_ERROR_CODES.AUTHENTICATION_ERROR,
      GOOGLE_ADS_ERROR_CODES.AUTHORIZATION_ERROR,
      GOOGLE_ADS_ERROR_CODES.OAUTH_TOKEN_INVALID,
      GOOGLE_ADS_ERROR_CODES.OAUTH_TOKEN_EXPIRED,
      GOOGLE_ADS_ERROR_CODES.OAUTH_TOKEN_REVOKED,
      GOOGLE_ADS_ERROR_CODES.USER_PERMISSION_DENIED,
    ]

    const isAuthError =
      options.httpStatus === 401 ||
      options.httpStatus === 403 ||
      (options.errorCode !== undefined && authErrors.includes(options.errorCode))

    const rateLimitErrors: string[] = [
      GOOGLE_ADS_ERROR_CODES.RATE_EXCEEDED,
      GOOGLE_ADS_ERROR_CODES.RESOURCE_EXHAUSTED,
      GOOGLE_ADS_ERROR_CODES.RESOURCE_TEMPORARILY_EXHAUSTED,
    ]
    const isRateLimitError =
      options.httpStatus === 429 ||
      options.grpcStatus === 'RESOURCE_EXHAUSTED' ||
      (options.errorCode !== undefined && rateLimitErrors.includes(options.errorCode))

    const isRetryable =
      isRateLimitError ||
      (options.httpStatus >= 500 && options.httpStatus < 600) ||
      options.errorCode === GOOGLE_ADS_ERROR_CODES.TRANSIENT_ERROR ||
      options.errorCode === GOOGLE_ADS_ERROR_CODES.INTERNAL_ERROR

    super({
      name: 'GoogleAdsApiError',
      message: options.message,
      isRetryable: isAuthError ? false : isRetryable,
      isAuthError,
      isRateLimitError,
      retryAfterMs: options.retryAfterMs,
    })

    this.httpStatus = options.httpStatus
    this.grpcStatus = options.grpcStatus
    this.errorCode = options.errorCode
    this.requestId = options.requestId
    this.details = options.details
  }

  toJSON() {
    return this.toJSONBase({
      httpStatus: this.httpStatus,
      grpcStatus: this.grpcStatus,
      errorCode: this.errorCode,
      requestId: this.requestId,
    })
  }
}
