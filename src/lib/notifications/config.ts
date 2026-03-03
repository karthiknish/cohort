// Notification configuration and utility functions

import { calculateBackoffDelay as calculateBackoffDelayLib, parseRetryAfterMs, sleep } from '@/lib/retry-utils'

// =============================================================================
// CONFIGURATION
// =============================================================================

export const EMAIL_WEBHOOK_URL = process.env.CONTACT_EMAIL_WEBHOOK_URL

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  requestTimeoutMs: 10000,
} as const

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export { sleep }

/**
 * Calculate exponential backoff delay with decorrelated jitter
 */
export function calculateBackoffDelay(attempt: number): number {
  return calculateBackoffDelayLib(attempt, {
    maxRetries: RETRY_CONFIG.maxRetries,
    baseDelayMs: RETRY_CONFIG.baseDelayMs,
    maxDelayMs: RETRY_CONFIG.maxDelayMs,
    jitterFactor: 1,
  })
}

/**
 * Parse Retry-After header value
 */
export function parseRetryAfter(header: string | null): number | null {
  if (!header) return null

  const headers = new Headers({ 'Retry-After': header })
  return parseRetryAfterMs(headers) ?? null
}

/**
 * Execute a fetch request with timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = RETRY_CONFIG.requestTimeoutMs
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

