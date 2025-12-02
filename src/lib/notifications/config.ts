// Notification configuration and utility functions

// =============================================================================
// CONFIGURATION
// =============================================================================

export const EMAIL_WEBHOOK_URL = process.env.CONTACT_EMAIL_WEBHOOK_URL
export const SLACK_WEBHOOK_URL = process.env.CONTACT_SLACK_WEBHOOK_URL
export const WHATSAPP_API_VERSION = process.env.WHATSAPP_BUSINESS_API_VERSION ?? 'v18.0'
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

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay with decorrelated jitter
 */
export function calculateBackoffDelay(attempt: number): number {
  const baseDelay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt)
  const jitter = Math.random() * Math.min(RETRY_CONFIG.maxDelayMs, baseDelay)
  return Math.min(RETRY_CONFIG.maxDelayMs, baseDelay + jitter)
}

/**
 * Parse Retry-After header value
 */
export function parseRetryAfter(header: string | null): number | null {
  if (!header) return null

  // Try parsing as seconds
  const seconds = parseInt(header, 10)
  if (!isNaN(seconds)) {
    return seconds * 1000
  }

  // Try parsing as HTTP date
  const date = new Date(header)
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now())
  }

  return null
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
