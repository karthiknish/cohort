import { formatUserFacingErrorMessage } from './user-friendly-error'

export function getErrorMessage(error: unknown, fallback: string): string {
  return formatUserFacingErrorMessage(error, fallback)
}

export function toErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error && typeof (error as Record<string, unknown>).message === 'string') {
    const message = ((error as Record<string, unknown>).message as string).trim()
    return message.length > 0 ? message : fallback
  }
  return fallback
}

export async function readResponsePayloadSafe(response: Response): Promise<unknown> {
  try {
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return await response.json()
    }

    const text = await response.text()
    return text
  } catch {
    return null
  }
}

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
