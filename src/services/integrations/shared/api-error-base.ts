export class IntegrationApiErrorBase extends Error {
  readonly isRetryable: boolean
  readonly isAuthError: boolean
  readonly isRateLimitError: boolean
  readonly retryAfterMs?: number

  constructor(options: {
    name: string
    message: string
    isRetryable: boolean
    isAuthError: boolean
    isRateLimitError: boolean
    retryAfterMs?: number
  }) {
    super(options.message)
    this.name = options.name
    this.isRetryable = options.isRetryable
    this.isAuthError = options.isAuthError
    this.isRateLimitError = options.isRateLimitError
    this.retryAfterMs = options.retryAfterMs
  }

  protected toJSONBase(extra: Record<string, unknown>) {
    return {
      name: this.name,
      message: this.message,
      ...extra,
      isRetryable: this.isRetryable,
      isAuthError: this.isAuthError,
      isRateLimitError: this.isRateLimitError,
      retryAfterMs: this.retryAfterMs,
    }
  }
}
