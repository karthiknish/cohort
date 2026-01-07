// =============================================================================
// LINKEDIN ADS API ERROR CLASS
// =============================================================================

import { LINKEDIN_ERROR_CODES } from './types'

import { IntegrationApiErrorBase } from '../shared/api-error-base'

export class LinkedInApiError extends IntegrationApiErrorBase {
  readonly httpStatus: number
  readonly errorCode?: string
  readonly serviceErrorCode?: number

  constructor(options: {
    message: string
    httpStatus: number
    errorCode?: string
    serviceErrorCode?: number
    retryAfterMs?: number
  }) {
    const isAuthError =
      options.httpStatus === LINKEDIN_ERROR_CODES.UNAUTHORIZED ||
      options.httpStatus === LINKEDIN_ERROR_CODES.FORBIDDEN ||
      options.errorCode === LINKEDIN_ERROR_CODES.PERMISSION_DENIED

    const isRateLimitError = options.httpStatus === LINKEDIN_ERROR_CODES.RATE_LIMITED

    const isRetryable =
      isRateLimitError ||
      (options.httpStatus >= 500 && options.httpStatus < 600)

    super({
      name: 'LinkedInApiError',
      message: options.message,
      isRetryable: isAuthError ? false : isRetryable,
      isAuthError,
      isRateLimitError,
      retryAfterMs: options.retryAfterMs,
    })

    this.httpStatus = options.httpStatus
    this.errorCode = options.errorCode
    this.serviceErrorCode = options.serviceErrorCode
  }

  toJSON() {
    return this.toJSONBase({
      httpStatus: this.httpStatus,
      errorCode: this.errorCode,
      serviceErrorCode: this.serviceErrorCode,
    })
  }
}
