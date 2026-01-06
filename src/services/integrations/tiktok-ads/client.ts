// =============================================================================
// TIKTOK ADS API CLIENT - Core request execution with retry logic
// =============================================================================

import { RetryConfig, TikTokApiErrorResponse } from './types'
import { TikTokApiError } from './errors'

// =============================================================================
// RETRY CONFIGURATION
// =============================================================================

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitterFactor: 0.3,
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function coerceNumber(value: unknown): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  rateLimitRetryAfter?: number
): number {
  if (rateLimitRetryAfter && rateLimitRetryAfter > 0) {
    return Math.min(rateLimitRetryAfter, config.maxDelayMs)
  }
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt)
  const jitter = exponentialDelay * config.jitterFactor * Math.random()
  return Math.min(exponentialDelay + jitter, config.maxDelayMs)
}

function parseTikTokApiError(
  response: Response,
  payload: TikTokApiErrorResponse
): TikTokApiError {
  const retryAfterHeader = response.headers.get('Retry-After')
  const retryAfterMs = retryAfterHeader 
    ? parseInt(retryAfterHeader, 10) * 1000 
    : undefined

  return new TikTokApiError({
    message: payload?.message ?? `TikTok API error (${response.status})`,
    httpStatus: response.status,
    errorCode: payload?.code ?? response.status,
    requestId: payload?.request_id,
    retryAfterMs,
  })
}

function logTikTokApiRequest(context: {
  operation: string
  advertiserId?: string
  attempt: number
  maxRetries: number
  duration?: number
  error?: TikTokApiError | Error
  statusCode?: number
  requestId?: string
}) {
  const { operation, advertiserId, attempt, maxRetries, duration, error, statusCode, requestId } = context

  if (error) {
    console.error(`[TikTok API] ${operation} failed`, {
      advertiserId,
      attempt: `${attempt + 1}/${maxRetries}`,
      statusCode,
      requestId,
      duration: duration ? `${duration}ms` : undefined,
      error: error instanceof TikTokApiError ? error.toJSON() : { message: error.message },
    })
  } else {
    console.log(`[TikTok API] ${operation} completed`, {
      advertiserId,
      attempt: `${attempt + 1}/${maxRetries}`,
      statusCode,
      requestId,
      duration: duration ? `${duration}ms` : undefined,
    })
  }
}

// =============================================================================
// EXECUTE TIKTOK API REQUEST WITH RETRY LOGIC
// =============================================================================

interface ExecuteRequestOptions<T> {
  url: string
  method?: 'GET' | 'POST'
  headers: Record<string, string>
  body?: string
  operation: string
  advertiserId?: string
  maxRetries?: number
  onAuthError?: () => Promise<{ retry: boolean; newToken?: string }>
  onRateLimitHit?: (retryAfterMs: number) => void
}

export async function executeTikTokApiRequest<T extends TikTokApiErrorResponse>(
  options: ExecuteRequestOptions<T>
): Promise<{ response: Response; payload: T }> {
  const {
    url,
    method = 'POST',
    headers: initialHeaders,
    body,
    operation,
    advertiserId,
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    onAuthError,
    onRateLimitHit,
  } = options

  let headers = { ...initialHeaders }
  let lastError: TikTokApiError | Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const startTime = Date.now()
    let response: Response

    try {
      response = await fetch(url, {
        method,
        headers,
        ...(body && { body }),
      })
    } catch (networkError) {
      lastError = networkError instanceof Error 
        ? networkError 
        : new Error('Network request failed')
      
      logTikTokApiRequest({
        operation,
        advertiserId,
        attempt,
        maxRetries,
        duration: Date.now() - startTime,
        error: lastError,
      })

      if (attempt < maxRetries - 1) {
        const delay = calculateBackoffDelay(attempt)
        await sleep(delay)
        continue
      }
      throw lastError
    }

    const duration = Date.now() - startTime

    let payload: T
    try {
      payload = await response.json() as T
    } catch {
      payload = { code: response.status, message: await response.text() } as T
    }

    const isSuccess = response.ok && (!payload.code || payload.code === 0)

    if (isSuccess) {
      logTikTokApiRequest({
        operation,
        advertiserId,
        attempt,
        maxRetries,
        duration,
        statusCode: response.status,
        requestId: payload.request_id,
      })
      return { response, payload }
    }

    const tiktokError = parseTikTokApiError(response, payload)
    lastError = tiktokError

    logTikTokApiRequest({
      operation,
      advertiserId,
      attempt,
      maxRetries,
      duration,
      statusCode: response.status,
      requestId: payload.request_id,
      error: tiktokError,
    })

    if (tiktokError.isAuthError && onAuthError) {
      const result = await onAuthError()
      if (result.retry && result.newToken) {
        headers = { ...headers, 'Access-Token': result.newToken }
        attempt = -1
        continue
      }
      throw tiktokError
    }

    if (tiktokError.isRateLimitError) {
      const retryAfterMs = tiktokError.retryAfterMs ?? calculateBackoffDelay(attempt) * 2
      onRateLimitHit?.(retryAfterMs)
      
      if (attempt < maxRetries - 1) {
        console.warn(`[TikTok API] Rate limited, waiting ${retryAfterMs}ms before retry`)
        await sleep(retryAfterMs)
        continue
      }
      throw tiktokError
    }

    if ((tiktokError.isRetryable || isRetryableStatus(response.status)) && attempt < maxRetries - 1) {
      const delay = calculateBackoffDelay(attempt)
      await sleep(delay)
      continue
    }

    throw tiktokError
  }

  throw lastError ?? new Error('TikTok API request failed after all retries')
}
