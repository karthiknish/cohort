// Notification configuration and utility functions

import { calculateBackoffDelay as calculateBackoffDelayLib, parseRetryAfterMs, sleep } from '@/lib/retry-utils'

// =============================================================================
// CONFIGURATION
// =============================================================================

export const EMAIL_WEBHOOK_URL = process.env.CONTACT_EMAIL_WEBHOOK_URL
export const SLACK_WEBHOOK_URL = process.env.CONTACT_SLACK_WEBHOOK_URL
// Updated to v24.0 (latest as of January 2026)
// Changelog: https://developers.facebook.com/docs/whatsapp/business-platform/changelog
export const WHATSAPP_API_VERSION = process.env.WHATSAPP_BUSINESS_API_VERSION ?? 'v24.0'
export const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN
export const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID

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

/**
 * Sanitize a WhatsApp phone number to digits only
 */
export function sanitizeWhatsAppNumber(input: unknown): string | null {
  if (typeof input !== 'string') {
    return null
  }
  const digits = input.replace(/\D+/g, '')
  if (digits.length < 8) {
    return null
  }
  return digits
}
