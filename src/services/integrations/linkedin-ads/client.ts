// =============================================================================
// LINKEDIN ADS API CLIENT - Core request execution with retry logic
// =============================================================================

import { formatDate, toISO } from '@/lib/dates'
import { RetryConfig, LinkedInApiErrorResponse } from './types'
import { LinkedInApiError } from './errors'

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

export function buildTimeRange(timeframeDays: number): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now)
  start.setUTCDate(start.getUTCDate() - Math.max(0, timeframeDays - 1))
  
  return {
    start: toISO(start).split('T')[0],
    end: toISO(now).split('T')[0],
  }
}

export function normalizeCurrency(value: unknown): number {
  if (value === null || value === undefined) return 0
  
  if (typeof value === 'object' && value !== null) {
    const currencyObj = value as { amount?: unknown; currencyCode?: string }
    if (currencyObj.amount !== undefined) {
      const amount = typeof currencyObj.amount === 'string' 
        ? parseFloat(currencyObj.amount) 
        : Number(currencyObj.amount)
      return Number.isFinite(amount) ? amount : 0
    }
  }
  
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  
  return 0
}

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

function parseLinkedInApiError(
  response: Response,
  payload: LinkedInApiErrorResponse | string
): LinkedInApiError {
  const errorData = typeof payload === 'string' 
    ? { message: payload, status: response.status }
    : payload

  const retryAfterHeader = response.headers.get('Retry-After')
  const retryAfterMs = retryAfterHeader 
    ? parseInt(retryAfterHeader, 10) * 1000 
    : undefined

  return new LinkedInApiError({
    message: errorData?.message ?? `LinkedIn API error (${response.status})`,
    httpStatus: errorData?.status ?? response.status,
    errorCode: errorData?.code,
    serviceErrorCode: errorData?.serviceErrorCode,
    retryAfterMs,
  })
}

function logLinkedInApiRequest(context: {
  operation: string
  accountId?: string
  attempt: number
  maxRetries: number
  duration?: number
  error?: LinkedInApiError | Error
  statusCode?: number
}) {
  const { operation, accountId, attempt, maxRetries, duration, error, statusCode } = context

  if (error) {
    console.error(`[LinkedIn API] ${operation} failed`, {
      accountId,
      attempt: `${attempt + 1}/${maxRetries}`,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
      error: error instanceof LinkedInApiError ? error.toJSON() : { message: error.message },
    })
  } else {
    console.log(`[LinkedIn API] ${operation} completed`, {
      accountId,
      attempt: `${attempt + 1}/${maxRetries}`,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
    })
  }
}

// =============================================================================
// EXECUTE LINKEDIN API REQUEST WITH RETRY LOGIC
// =============================================================================

interface ExecuteRequestOptions<T> {
  url: string
  method: 'GET' | 'POST'
  headers: Record<string, string>
  body?: string
  operation: string
  accountId?: string
  maxRetries?: number
  onAuthError?: () => Promise<{ retry: boolean; newToken?: string }>
  onRateLimitHit?: (retryAfterMs: number) => void
}

export async function executeLinkedInApiRequest<T>(
  options: ExecuteRequestOptions<T>
): Promise<{ response: Response; payload: T }> {
  const {
    url,
    method,
    headers: initialHeaders,
    body,
    operation,
    accountId,
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    onAuthError,
    onRateLimitHit,
  } = options

  let headers = { ...initialHeaders }
  let lastError: LinkedInApiError | Error | null = null

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
      
      logLinkedInApiRequest({
        operation,
        accountId,
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

    if (response.ok) {
      let payload: T
      try {
        payload = await response.json() as T
      } catch {
        payload = {} as T
      }
      logLinkedInApiRequest({
        operation,
        accountId,
        attempt,
        maxRetries,
        duration,
        statusCode: response.status,
      })
      return { response, payload }
    }

    let errorPayload: LinkedInApiErrorResponse | string
    try {
      errorPayload = await response.json() as LinkedInApiErrorResponse
    } catch {
      errorPayload = await response.text()
    }

    const linkedInError = parseLinkedInApiError(response, errorPayload)
    lastError = linkedInError

    logLinkedInApiRequest({
      operation,
      accountId,
      attempt,
      maxRetries,
      duration,
      statusCode: response.status,
      error: linkedInError,
    })

    if (linkedInError.isAuthError && onAuthError) {
      const result = await onAuthError()
      if (result.retry && result.newToken) {
        headers = { ...headers, Authorization: `Bearer ${result.newToken}` }
        attempt = -1
        continue
      }
      throw linkedInError
    }

    if (linkedInError.isRateLimitError) {
      const retryAfterMs = linkedInError.retryAfterMs ?? calculateBackoffDelay(attempt)
      onRateLimitHit?.(retryAfterMs)
      
      if (attempt < maxRetries - 1) {
        console.warn(`[LinkedIn API] Rate limited, waiting ${retryAfterMs}ms before retry`)
        await sleep(retryAfterMs)
        continue
      }
      throw linkedInError
    }

    if ((linkedInError.isRetryable || isRetryableStatus(response.status)) && attempt < maxRetries - 1) {
      const delay = calculateBackoffDelay(attempt)
      await sleep(delay)
      continue
    }

    throw linkedInError
  }

  throw lastError ?? new Error('LinkedIn API request failed after all retries')
}

// Re-export formatDate for metrics module
export { formatDate }
