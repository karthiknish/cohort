// Webhook notification functions (Email and Slack)

import { NotificationError, NOTIFICATION_ERROR_CODES } from './errors'
import {
  EMAIL_WEBHOOK_URL,
  SLACK_WEBHOOK_URL,
  RETRY_CONFIG,
  sleep,
  calculateBackoffDelay,
  parseRetryAfter,
  fetchWithTimeout,
} from './config'
import type { ContactPayload } from './types'

// =============================================================================
// EMAIL WEBHOOK
// =============================================================================

export async function notifyContactEmail(payload: ContactPayload): Promise<void> {
  if (!EMAIL_WEBHOOK_URL) {
    console.info('[notifications] email webhook not configured, skipping')
    return
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(EMAIL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact.created', payload }),
      })

      if (response.ok) {
        console.log(`[notifications] email webhook sent successfully`)
        return
      }

      // Check for rate limiting
      if (response.status === 429) {
        const retryAfter = parseRetryAfter(response.headers.get('Retry-After'))
        const delayMs = retryAfter ?? calculateBackoffDelay(attempt)

        if (attempt < RETRY_CONFIG.maxRetries - 1) {
          console.warn(`[notifications] email webhook rate limited, retrying in ${delayMs}ms...`)
          await sleep(delayMs)
          continue
        }
      }

      // Retry on server errors
      if (response.status >= 500 && attempt < RETRY_CONFIG.maxRetries - 1) {
        console.warn(`[notifications] email webhook failed (${response.status}), retrying...`)
        await sleep(calculateBackoffDelay(attempt))
        continue
      }

      const errorText = await response.text().catch(() => 'Unknown error')
      throw new NotificationError({
        message: `Email webhook failed (${response.status}): ${errorText}`,
        errorCode: NOTIFICATION_ERROR_CODES.WEBHOOK_FAILED,
        httpStatus: response.status,
        channel: 'email',
      })
    } catch (error) {
      if (error instanceof NotificationError) {
        throw error
      }

      lastError = error instanceof Error ? error : new Error('Unknown error')

      // Retry on network errors
      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        const isAbortError = lastError.name === 'AbortError'
        console.warn(
          `[notifications] email webhook ${isAbortError ? 'timed out' : 'network error'}, retrying...`
        )
        await sleep(calculateBackoffDelay(attempt))
        continue
      }
    }
  }

  console.error('[notifications] email webhook failed after all retries', lastError)
}

// =============================================================================
// SLACK WEBHOOK
// =============================================================================

export async function notifyContactSlack(payload: ContactPayload): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.info('[notifications] slack webhook not configured, skipping')
    return
  }

  const text = `:wave: *New contact message*\n*Name:* ${payload.name}\n*Email:* ${payload.email}\n*Company:* ${payload.company ?? '—'}\n*Message:* ${payload.message}`

  let lastError: Error | null = null

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (response.ok) {
        console.log(`[notifications] slack webhook sent successfully`)
        return
      }

      // Check for rate limiting
      if (response.status === 429) {
        const retryAfter = parseRetryAfter(response.headers.get('Retry-After'))
        const delayMs = retryAfter ?? calculateBackoffDelay(attempt)

        if (attempt < RETRY_CONFIG.maxRetries - 1) {
          console.warn(`[notifications] slack webhook rate limited, retrying in ${delayMs}ms...`)
          await sleep(delayMs)
          continue
        }
      }

      // Retry on server errors
      if (response.status >= 500 && attempt < RETRY_CONFIG.maxRetries - 1) {
        console.warn(`[notifications] slack webhook failed (${response.status}), retrying...`)
        await sleep(calculateBackoffDelay(attempt))
        continue
      }

      const errorText = await response.text().catch(() => 'Unknown error')
      throw new NotificationError({
        message: `Slack webhook failed (${response.status}): ${errorText}`,
        errorCode: NOTIFICATION_ERROR_CODES.WEBHOOK_FAILED,
        httpStatus: response.status,
        channel: 'slack',
      })
    } catch (error) {
      if (error instanceof NotificationError) {
        throw error
      }

      lastError = error instanceof Error ? error : new Error('Unknown error')

      // Retry on network errors
      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        const isAbortError = lastError.name === 'AbortError'
        console.warn(
          `[notifications] slack webhook ${isAbortError ? 'timed out' : 'network error'}, retrying...`
        )
        await sleep(calculateBackoffDelay(attempt))
        continue
      }
    }
  }

  console.error('[notifications] slack webhook failed after all retries', lastError)
}
