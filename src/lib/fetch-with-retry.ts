'use client'

import { AgentAuthError, AgentNetworkError, AgentRateLimitError, AgentServerError, parseAgentError, type AgentError } from './agent-errors'

/**
 * Fetch wrapper with exponential backoff retry logic.
 * Handles network errors, rate limiting, auth expiration, and server errors.
 */

export interface FetchWithRetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number
  /** Base delay in milliseconds for exponential backoff (default: 1000) */
  baseDelayMs?: number
  /** Maximum delay cap in milliseconds (default: 10000) */
  maxDelayMs?: number
  /** Function to get fresh auth token for retry on 401 */
  getAuthToken?: (forceRefresh?: boolean) => Promise<string>
  /** Callback fired on each retry attempt */
  onRetry?: (attempt: number, error: AgentError, delayMs: number) => void
  /** Callback fired on final failure after all retries */
  onFinalFailure?: (error: AgentError) => void
  /** AbortSignal to cancel the request */
  signal?: AbortSignal
}

export interface FetchWithRetryResult<T> {
  data: T | null
  error: AgentError | null
  response: Response | null
  attempts: number
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateBackoffDelay(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  // Exponential: 1s, 2s, 4s, 8s...
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1)
  // Add jitter (±20%) to prevent thundering herd
  const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5)
  const delayWithJitter = exponentialDelay + jitter
  // Cap at max delay
  return Math.min(delayWithJitter, maxDelayMs)
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: AgentError): boolean {
  // Rate limit errors should wait for retryAfter, but are retryable
  if (error instanceof AgentRateLimitError) return true
  // Network and server errors are retryable
  if (error instanceof AgentNetworkError) return true
  if (error instanceof AgentServerError) return true
  // Auth errors should trigger token refresh, not retry
  if (error instanceof AgentAuthError) return false
  // Use the retryable flag for other errors
  return error.retryable
}

/**
 * Wait for a specified duration
 */
function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timeout)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

/**
 * Perform a fetch request with automatic retry on transient failures
 */
export async function fetchWithRetry<T = unknown>(
  url: string,
  init: RequestInit,
  options: FetchWithRetryOptions = {}
): Promise<FetchWithRetryResult<T>> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
    getAuthToken,
    onRetry,
    onFinalFailure,
    signal,
  } = options

  let attempts = 0
  let lastError: AgentError | null = null
  let lastResponse: Response | null = null
  let authRefreshed = false

  while (attempts <= maxRetries) {
    attempts++

    try {
      // Check if aborted before starting
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      const response = await fetch(url, {
        ...init,
        signal,
      })

      lastResponse = response

      // Success case
      if (response.ok) {
        const data = await response.json() as T
        return { data, error: null, response, attempts }
      }

      // Handle specific status codes
      const error = parseAgentError(new Error(`HTTP ${response.status}`), response)
      lastError = error

      // 401 - Try token refresh once, then retry
      if (response.status === 401 && getAuthToken && !authRefreshed) {
        try {
          const newToken = await getAuthToken(true)
          authRefreshed = true

          // Update headers with new token
          const headers = new Headers(init.headers)
          headers.set('Authorization', `Bearer ${newToken}`)
          init = { ...init, headers }

          // Don't count this as a retry attempt
          attempts--
          continue
        } catch {
          // Token refresh failed, return auth error
          return { data: null, error, response, attempts }
        }
      }

      // 429 - Wait for Retry-After header
      if (response.status === 429) {
        const retryAfter = error.retryAfter || 60
        if (attempts < maxRetries) {
          const delayMs = retryAfter * 1000
          onRetry?.(attempts, error, delayMs)
          await wait(delayMs, signal)
          continue
        }
      }

      // 5xx - Retry with backoff
      if (response.status >= 500 && isRetryableError(error)) {
        if (attempts < maxRetries) {
          const delayMs = calculateBackoffDelay(attempts, baseDelayMs, maxDelayMs)
          onRetry?.(attempts, error, delayMs)
          await wait(delayMs, signal)
          continue
        }
      }

      // Non-retryable error (4xx except 429)
      return { data: null, error, response, attempts }
    } catch (fetchError) {
      // Aborted - don't retry
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        throw fetchError
      }

      // Network error - retry with backoff
      lastError = parseAgentError(fetchError, null)

      if (isRetryableError(lastError) && attempts < maxRetries) {
        const delayMs = calculateBackoffDelay(attempts, baseDelayMs, maxDelayMs)
        onRetry?.(attempts, lastError, delayMs)
        await wait(delayMs, signal)
        continue
      }

      // Final failure
      break
    }
  }

  // All retries exhausted
  const finalError = lastError || new AgentServerError('Request failed after multiple attempts')
  onFinalFailure?.(finalError)

  return {
    data: null,
    error: finalError,
    response: lastResponse,
    attempts,
  }
}

/**
 * Convenience wrapper for JSON POST requests
 */
export async function postWithRetry<T = unknown>(
  url: string,
  body: unknown,
  token: string,
  options: FetchWithRetryOptions = {}
): Promise<FetchWithRetryResult<T>> {
  return fetchWithRetry<T>(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    },
    options
  )
}

/**
 * Convenience wrapper for JSON GET requests
 */
export async function getWithRetry<T = unknown>(
  url: string,
  token: string,
  options: FetchWithRetryOptions = {}
): Promise<FetchWithRetryResult<T>> {
  return fetchWithRetry<T>(
    url,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    },
    options
  )
}
