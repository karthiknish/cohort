/**
 * Retry-enabled fetch utility with exponential backoff.
 * Distinguishes network errors from API errors for better UX.
 */

import { sleepWithSignal } from '@/lib/retry-utils'
import { UnifiedError } from '@/lib/errors/unified-error'
import { isNetworkError } from '@/lib/error-utils'

const DEFAULT_MAX_RETRIES = 3
const DEFAULT_BASE_DELAY_MS = 1000
const DEFAULT_MAX_DELAY_MS = 10000

const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504]

export interface RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  signal?: AbortSignal
  onRetry?: (attempt: number, error: Error, delayMs: number) => void
}

function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt)
  const jitter = exponentialDelay * (0.75 + Math.random() * 0.5)
  return Math.min(jitter, maxDelay)
}

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
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      const response = await fetch(input, {
        ...init,
        credentials: init?.credentials ?? 'same-origin',
        signal: signal ?? init?.signal,
      })

      if (response.ok) {
        return response
      }

      let responseBody: unknown = null
      try {
        responseBody = await response.clone().json()
      } catch {
        // Ignore JSON parse errors
      }

      const errorMessage =
        (responseBody && typeof responseBody === 'object' && 'error' in responseBody
          ? String((responseBody as { error: unknown }).error)
          : null) ??
        (responseBody && typeof responseBody === 'object' && 'message' in responseBody
          ? String((responseBody as { message: unknown }).message)
          : null) ??
        `Request failed with status ${response.status}`

      const apiError = new UnifiedError({
        message: errorMessage,
        status: response.status,
        code: `HTTP_${response.status}`,
        isRetryable: RETRYABLE_STATUS_CODES.includes(response.status),
      })

      if (!apiError.isRetryable) {
        throw apiError
      }

      lastError = apiError

      if (attempt === maxRetries) {
        throw apiError
      }

      const delayMs = calculateDelay(attempt, baseDelayMs, maxDelayMs)
      onRetry?.(attempt + 1, apiError, delayMs)
      await sleepWithSignal(delayMs, signal)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error
      }

      if (isNetworkError(error)) {
        const networkError = new UnifiedError({
          message: 'Unable to connect. Check your internet connection.',
          status: 0,
          code: 'NETWORK_ERROR',
          isRetryable: true,
          cause: error instanceof Error ? error : undefined,
        })
        lastError = networkError

        if (attempt === maxRetries) {
          throw networkError
        }

        const delayMs = calculateDelay(attempt, baseDelayMs, maxDelayMs)
        onRetry?.(attempt + 1, networkError, delayMs)
        await sleepWithSignal(delayMs, signal)
        continue
      }

      if (error instanceof UnifiedError) {
        throw error
      }

      throw error
    }
  }

  throw lastError ?? new Error('Request failed after retries')
}

export function getRetryableErrorMessage(error: unknown): string {
  if (error instanceof UnifiedError) {
    if (error.isRateLimitError) {
      return 'Too many requests. Please wait a moment and try again.'
    }
    if (error.status >= 500) {
      return 'Server error. Please try again in a few moments.'
    }
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred.'
}
