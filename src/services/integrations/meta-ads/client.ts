// =============================================================================
// META ADS API CLIENT - Core request execution with retry logic
// =============================================================================

// Use dynamic import for crypto to avoid Edge Runtime issues
// Note: appsecret_proof is only computed when running in Node.js environment

import { formatDate } from '@/lib/dates'
import { coerceNumber as coerceNumberNullable } from '@/lib/utils'

import { metaAdsClient } from '../shared/base-client'
import { executeIntegrationRequest } from '../shared/execute-integration-request'

export { DEFAULT_RETRY_CONFIG, calculateBackoffDelay, isRetryableStatus, sleep } from '../shared/retry'

// =============================================================================
// CONSTANTS
// =============================================================================

export const META_API_VERSION = 'v24.0'
export const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`

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
    // Log the error with more context for debugging
    // This can happen in environments where crypto.subtle is unavailable
    console.error('[Meta API] Failed to compute appsecret_proof - API requests will proceed without proof', {
      error: error instanceof Error ? error.message : 'Unknown error',
      // Security note: Without appsecret_proof, the request is less secure
      // and may be subject to stricter rate limits from Meta
    })
  }
}

// =============================================================================
// EXECUTE META API REQUEST WITH RETRY LOGIC
// =============================================================================

interface ExecuteRequestOptions {
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
  options: ExecuteRequestOptions
): Promise<{ response: Response; payload: T }> {
  const {
    url,
    accessToken,
    operation,
    maxRetries,
    method = 'GET',
    body,
    onAuthError,
    onRateLimitHit,
  } = options

  return executeIntegrationRequest<T>(metaAdsClient, {
    url,
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body && { 'Content-Type': 'application/json' }),
    },
    body,
    operation,
    maxRetries,
    onAuthError,
    onRateLimitHit,
  })
}
