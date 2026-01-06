// =============================================================================
// META ADS API CLIENT - Core request execution with retry logic
// =============================================================================

// Use dynamic import for crypto to avoid Edge Runtime issues
// Note: appsecret_proof is only computed when running in Node.js environment

import { formatDate } from '@/lib/dates'
import { coerceNumber as coerceNumberNullable } from '@/lib/utils'

import { MetaApiError } from './errors'
import { RetryConfig, MetaApiErrorResponse } from './types'

// =============================================================================
// CONSTANTS
// =============================================================================

export const META_API_VERSION = 'v18.0'
export const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitterFactor: 0.3,
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function buildTimeRange(timeframeDays: number) {
  const today = new Date()
  const since = new Date(today)
  since.setUTCDate(since.getUTCDate() - Math.max(timeframeDays - 1, 0))

  return {
    since: formatDate(since, 'yyyy-MM-dd'),
    until: formatDate(today, 'yyyy-MM-dd'),
  }
}

export const coerceNumber = (value: unknown): number => coerceNumberNullable(value) ?? 0

export function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function calculateBackoffDelay(
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

// Compute HMAC using Web Crypto API (Edge Runtime compatible)
async function computeHmacSha256(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(data)
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData)
  const hashArray = Array.from(new Uint8Array(signature))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function appendMetaAuthParams(options: { 
  params: URLSearchParams
  accessToken: string
  appSecret?: string | null 
}): Promise<void> {
  const { params, accessToken, appSecret } = options
  params.set('access_token', accessToken)

  if (!appSecret) return

  try {
    const proof = await computeHmacSha256(appSecret, accessToken)
    params.set('appsecret_proof', proof)
  } catch (error) {
    console.warn('[Meta API] Failed to compute appsecret_proof', error)
  }
}

function parseMetaApiError(
  response: Response,
  payload: MetaApiErrorResponse | string
): MetaApiError {
  const errorData = typeof payload === 'string' 
    ? { error: { message: payload, code: response.status } }
    : payload

  const error = errorData?.error ?? {}
  
  const retryAfterHeader = response.headers.get('Retry-After')
  const retryAfterMs = retryAfterHeader 
    ? parseInt(retryAfterHeader, 10) * 1000 
    : undefined

  return new MetaApiError({
    message: error.message ?? `Meta API error (${response.status})`,
    code: error.code ?? response.status,
    subcode: error.error_subcode,
    type: error.type,
    fbTraceId: error.fbtrace_id,
    retryAfterMs,
  })
}

function logMetaApiRequest(context: {
  operation: string
  url: string
  attempt: number
  maxRetries: number
  duration?: number
  error?: MetaApiError | Error
  statusCode?: number
}) {
  const { operation, url, attempt, maxRetries, duration, error, statusCode } = context
  const urlObj = new URL(url)
  const sanitizedUrl = `${urlObj.origin}${urlObj.pathname}`

  if (error) {
    console.error(`[Meta API] ${operation} failed`, {
      url: sanitizedUrl,
      attempt: `${attempt + 1}/${maxRetries}`,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
      error: error instanceof MetaApiError ? error.toJSON() : { message: error.message },
    })
  } else {
    console.log(`[Meta API] ${operation} completed`, {
      url: sanitizedUrl,
      attempt: `${attempt + 1}/${maxRetries}`,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
    })
  }
}

// =============================================================================
// EXECUTE META API REQUEST WITH RETRY LOGIC
// =============================================================================

interface ExecuteRequestOptions<T> {
  url: string
  accessToken: string
  operation: string
  maxRetries?: number
  method?: 'GET' | 'POST'
  body?: string
  onAuthError?: () => Promise<{ retry: boolean; newToken?: string }>
  onRateLimitHit?: (retryAfterMs: number) => void
}

export async function executeMetaApiRequest<T>(
  options: ExecuteRequestOptions<T>
): Promise<{ response: Response; payload: T }> {
  const {
    url,
    accessToken,
    operation,
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    method = 'GET',
    body,
    onAuthError,
    onRateLimitHit,
  } = options

  let currentToken = accessToken
  let lastError: MetaApiError | Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const startTime = Date.now()
    let response: Response

    try {
      const requestUrl = attempt > 0 && currentToken !== accessToken
        ? url.replace(encodeURIComponent(accessToken), encodeURIComponent(currentToken))
        : url

      response = await fetch(requestUrl, {
        method,
        headers: {
          Authorization: `Bearer ${currentToken}`,
          ...(body && { 'Content-Type': 'application/json' }),
        },
        ...(body && { body }),
      })
    } catch (networkError) {
      lastError = networkError instanceof Error 
        ? networkError 
        : new Error('Network request failed')
      
      logMetaApiRequest({
        operation,
        url,
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
      const payload = await response.json() as T
      logMetaApiRequest({
        operation,
        url,
        attempt,
        maxRetries,
        duration,
        statusCode: response.status,
      })
      return { response, payload }
    }

    let errorPayload: MetaApiErrorResponse
    try {
      errorPayload = await response.json() as MetaApiErrorResponse
    } catch {
      errorPayload = { error: { message: await response.text(), code: response.status } }
    }

    const metaError = parseMetaApiError(response, errorPayload)
    lastError = metaError

    logMetaApiRequest({
      operation,
      url,
      attempt,
      maxRetries,
      duration,
      statusCode: response.status,
      error: metaError,
    })

    if (metaError.isAuthError && onAuthError) {
      const result = await onAuthError()
      if (result.retry && result.newToken) {
        currentToken = result.newToken
        attempt = -1
        continue
      }
      throw metaError
    }

    if (metaError.isRateLimitError) {
      const retryAfterMs = metaError.retryAfterMs ?? calculateBackoffDelay(attempt)
      onRateLimitHit?.(retryAfterMs)
      
      if (attempt < maxRetries - 1) {
        console.warn(`[Meta API] Rate limited, waiting ${retryAfterMs}ms before retry`)
        await sleep(retryAfterMs)
        continue
      }
      throw metaError
    }

    if ((metaError.isRetryable || isRetryableStatus(response.status)) && attempt < maxRetries - 1) {
      const delay = calculateBackoffDelay(attempt)
      await sleep(delay)
      continue
    }

    throw metaError
  }

  throw lastError ?? new Error('Meta API request failed after all retries')
}
