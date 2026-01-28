/**
 * Retry-enabled fetch utility with exponential backoff.
 * Distinguishes network errors from API errors for better UX.
 */

import { sleepWithSignal } from '@/lib/retry-utils'

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Thrown when the network request fails (e.g., no internet, DNS failure).
 */
export class NetworkError extends Error {
  override name = 'NetworkError' as const
  constructor(message: string, public override readonly cause?: Error) {
    super(message)
  }
}

/**
 * Thrown when the API returns an error response (4xx or 5xx).
 */
export class ApiError extends Error {
  override name = 'ApiError' as const
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly responseBody?: unknown
  ) {
    super(message)
  }

  get isRetryable(): boolean {
    return RETRYABLE_STATUS_CODES.includes(this.statusCode)
  }

  get isRateLimited(): boolean {
    return this.statusCode === 429
  }

  get isServerError(): boolean {
    return this.statusCode >= 500
  }

  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500
  }
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_MAX_RETRIES = 3
const DEFAULT_BASE_DELAY_MS = 1000
const DEFAULT_MAX_DELAY_MS = 10000

/**
 * HTTP status codes that are typically transient and worth retrying.
 */
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504]

// =============================================================================
// TYPES
// =============================================================================

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number
  /** Base delay in ms, doubles each retry (default: 1000) */
  baseDelayMs?: number
  /** Maximum delay cap in ms (default: 10000) */
  maxDelayMs?: number
  /** AbortSignal to cancel retries */
  signal?: AbortSignal
  /** Callback fired before each retry attempt */
  onRetry?: (attempt: number, error: Error, delayMs: number) => void
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate delay with exponential backoff and jitter.
 */
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  // Exponential: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt)
  // Add jitter (±25%)
  const jitter = exponentialDelay * (0.75 + Math.random() * 0.5)
  return Math.min(jitter, maxDelay)
}



/**
 * Check if an error is a network error (fetch failed entirely).
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    // fetch() throws TypeError for network failures
    const message = error.message.toLowerCase()
    return (
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('internet') ||
      message.includes('offline') ||
      message.includes('no connection')
    )
  }
  return false
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Fetch with automatic retry on transient failures.
 * 
 * @example
 * ```ts
 * const data = await retryFetch('/api/data', {
 *   method: 'POST',
 *   body: JSON.stringify({ foo: 'bar' }),
 * }, {
 *   maxRetries: 3,
 *   onRetry: (attempt, error, delayMs) => {
 *     console.log(`Retry ${attempt} after ${delayMs}ms due to: ${error.message}`)
 *   }
 * })
 * ```
 */
export async function retryFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: RetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    baseDelayMs = DEFAULT_BASE_DELAY_MS,
    maxDelayMs = DEFAULT_MAX_DELAY_MS,
    signal,
    onRetry,
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Check if aborted before attempting
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      // Merge abort signal into request and ensure credentials are sent
      const response = await fetch(input, {
        ...init,
        credentials: init?.credentials ?? 'same-origin',
        signal: signal ?? init?.signal,
      })

      // Successful response (2xx or 3xx) - return it
      if (response.ok) {
        return response
      }

      // Parse error response body
      let responseBody: unknown = null
      try {
        responseBody = await response.clone().json()
      } catch {
        // Ignore JSON parse errors
      }

      // Extract error message from response
      const errorMessage = 
        (responseBody && typeof responseBody === 'object' && 'error' in responseBody
          ? String((responseBody as { error: unknown }).error)
          : null) ?? 
        (responseBody && typeof responseBody === 'object' && 'message' in responseBody
          ? String((responseBody as { message: unknown }).message)
          : null) ??
        `Request failed with status ${response.status}`

      const apiError = new ApiError(errorMessage, response.status, responseBody)

      // Non-retryable status codes - throw immediately
      if (!apiError.isRetryable) {
        throw apiError
      }

      lastError = apiError

      // Last attempt - throw the error
      if (attempt === maxRetries) {
        throw apiError
      }

      // Calculate delay and wait before retry
      const delayMs = calculateDelay(attempt, baseDelayMs, maxDelayMs)
      onRetry?.(attempt + 1, apiError, delayMs)
      await sleepWithSignal(delayMs, signal)

    } catch (error) {
      // Check if it's an abort
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error
      }

      // Network errors are always retryable
      if (isNetworkError(error)) {
        const networkError = new NetworkError(
          'Unable to connect. Check your internet connection.',
          error as Error
        )
        lastError = networkError

        // Last attempt - throw the error
        if (attempt === maxRetries) {
          throw networkError
        }

        // Wait before retry
        const delayMs = calculateDelay(attempt, baseDelayMs, maxDelayMs)
        onRetry?.(attempt + 1, networkError, delayMs)
        await sleepWithSignal(delayMs, signal)
        continue
      }

      // API errors were already handled above
      if (error instanceof ApiError) {
        throw error
      }

      // Unknown errors - don't retry
      throw error
    }
  }

  // This shouldn't be reached, but just in case
  throw lastError ?? new Error('Request failed after retries')
}

/**
 * Get a user-friendly error message based on error type.
 */
export function getRetryableErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return 'Unable to connect. Check your internet connection.'
  }

  if (error instanceof ApiError) {
    if (error.isRateLimited) {
      return 'Too many requests. Please wait a moment and try again.'
    }
    if (error.isServerError) {
      return 'Server error. Please try again in a few moments.'
    }
    // Use the API error message for client errors
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred.'
}
