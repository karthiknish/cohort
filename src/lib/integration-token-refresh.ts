
import { getAdIntegration, updateIntegrationCredentials } from '@/lib/ads-admin'
import { logger } from '@/lib/logger'
import { calculateBackoffDelay as calculateBackoffDelayLib, sleep } from '@/lib/retry-utils'

interface RefreshParams {
  userId: string
  clientId?: string | null
  forceRefresh?: boolean
}

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const META_TOKEN_ENDPOINT = 'https://graph.facebook.com/v18.0/oauth/access_token'
const TIKTOK_REFRESH_ENDPOINT = 'https://business-api.tiktok.com/open_api/v1.3/oauth2/refresh_token/'
const LINKEDIN_TOKEN_ENDPOINT = 'https://www.linkedin.com/oauth/v2/accessToken'

// Promise deduplication map
const refreshPromises = new Map<string, Promise<string>>()
// Track when each promise was created for TTL-based cleanup
const refreshPromiseTimestamps = new Map<string, number>()

// Retry configuration for token refresh operations
const TOKEN_REFRESH_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
}

// TTL for stale promise cleanup (5 minutes)
const PROMISE_TTL_MS = 5 * 60 * 1000

/**
 * Clean up stale promise entries that may have been orphaned due to
 * network hangs or other issues preventing the finally block from running.
 */
function cleanupStalePromises(): void {
  const now = Date.now()
  for (const [key, timestamp] of refreshPromiseTimestamps.entries()) {
    if (now - timestamp > PROMISE_TTL_MS) {
      refreshPromises.delete(key)
      refreshPromiseTimestamps.delete(key)
      console.warn(`[Token Refresh] Cleaned up stale promise for ${key}`)
    }
  }
}

function computeExpiry(expiresInSeconds?: number): Date | null {
  if (!expiresInSeconds || !Number.isFinite(expiresInSeconds)) {
    return null
  }
  // Subtract 30 seconds buffer to ensure we refresh before actual expiry
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000 - 30 * 1000)
  return expiresAt
}

function calculateBackoffDelay(attempt: number): number {
  return calculateBackoffDelayLib(attempt, {
    maxRetries: TOKEN_REFRESH_CONFIG.maxRetries,
    baseDelayMs: TOKEN_REFRESH_CONFIG.baseDelayMs,
    maxDelayMs: TOKEN_REFRESH_CONFIG.maxDelayMs,
    jitterFactor: 0.3,
  })
}

export class IntegrationTokenError extends Error {
  userId?: string
  providerId?: string
  isRetryable: boolean
  httpStatus?: number

  constructor(
    message: string,
    providerId?: string,
    userId?: string,
    options?: { isRetryable?: boolean; httpStatus?: number }
  ) {
    super(message)
    this.name = 'IntegrationTokenError'
    this.providerId = providerId
    this.userId = userId
    this.isRetryable = options?.isRetryable ?? false
    this.httpStatus = options?.httpStatus
  }
}

type AnyTimestamp = { toMillis: () => number } | { toDate: () => Date } | Date | string | number

export function isTokenExpiringSoon(expiresAt?: AnyTimestamp | null | string, bufferMs = 5 * 60 * 1000): boolean {
  if (!expiresAt) return true

  let expiryMs: number | null = null

  if (expiresAt instanceof Date) {
    expiryMs = expiresAt.getTime()
  } else if (typeof (expiresAt as { toMillis?: () => number }).toMillis === 'function') {
    try {
      expiryMs = (expiresAt as { toMillis: () => number }).toMillis()
    } catch {
      expiryMs = null
    }
  } else if (typeof (expiresAt as { toDate?: () => Date }).toDate === 'function') {
    try {
      const date = (expiresAt as { toDate: () => Date }).toDate()
      expiryMs = date instanceof Date ? date.getTime() : null
    } catch {
      expiryMs = null
    }
  } else if (typeof expiresAt === 'number') {
    // Convex-backed storage uses numeric millis (or occasionally seconds).
    expiryMs = expiresAt < 1_000_000_000_000 ? expiresAt * 1000 : expiresAt
  } else if (typeof expiresAt === 'string') {
    const parsed = Date.parse(expiresAt)
    expiryMs = Number.isNaN(parsed) ? null : parsed
  }

  if (!expiryMs) return true

  return Date.now() + bufferMs >= expiryMs
}

export async function refreshGoogleAccessToken({ userId, clientId }: RefreshParams): Promise<string> {
  const integration = await getAdIntegration({ userId, providerId: 'google', clientId })

  if (!integration?.refreshToken) {
    throw new IntegrationTokenError('No Google Ads refresh token available', 'google', userId)
  }

  const googleClientId = process.env.GOOGLE_ADS_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET

  if (!googleClientId || !googleClientSecret) {
    throw new IntegrationTokenError('Google Ads client credentials are not configured', 'google', userId)
  }

  const params = new URLSearchParams({
    client_id: googleClientId,
    client_secret: googleClientSecret,
    grant_type: 'refresh_token',
    refresh_token: integration.refreshToken,
  })

  let lastError: Error | null = null

  for (let attempt = 0; attempt < TOKEN_REFRESH_CONFIG.maxRetries; attempt++) {
    try {
      const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      if (!response.ok) {
        const errorPayload = await response.text()
        let parsedError: { error?: string; error_description?: string } = {}

        try {
          parsedError = JSON.parse(errorPayload)
        } catch {
          // Not JSON
        }

        const errorMessage = parsedError.error_description ?? parsedError.error ?? errorPayload

        // Check if error is retryable (5xx errors)
        const isRetryable = response.status >= 500 || response.status === 429

        if (isRetryable && attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
          logger.warn(`[Google Token Refresh] Attempt ${attempt + 1} failed (${response.status}), retrying...`, { userId })
          lastError = new IntegrationTokenError(
            `Failed to refresh Google Ads token (${response.status}): ${errorMessage}`,
            'google',
            userId,
            { isRetryable: true, httpStatus: response.status }
          )
          await sleep(calculateBackoffDelay(attempt))
          continue
        }

        // Check for specific error types
        if (parsedError.error === 'invalid_grant') {
          throw new IntegrationTokenError(
            'Google refresh token has been revoked or expired. Please reconnect your Google Ads account.',
            'google',
            userId,
            { isRetryable: false, httpStatus: response.status }
          )
        }

        throw new IntegrationTokenError(
          `Failed to refresh Google Ads token (${response.status}): ${errorMessage}`,
          'google',
          userId,
          { isRetryable: false, httpStatus: response.status }
        )
      }

      const tokenPayload = (await response.json()) as {
        access_token?: string
        expires_in?: number
        refresh_token?: string
        id_token?: string
      }

      if (!tokenPayload.access_token) {
        throw new IntegrationTokenError('Google Ads token response missing access_token', 'google', userId)
      }

      const expiresAt = computeExpiry(tokenPayload.expires_in)

      await updateIntegrationCredentials({
        userId,
        providerId: 'google',
        clientId,
        accessToken: tokenPayload.access_token,
        accessTokenExpiresAt: expiresAt ?? undefined,
        refreshToken: tokenPayload.refresh_token ?? undefined,
        idToken: tokenPayload.id_token ?? undefined,
      })

      logger.info(`[Google Token Refresh] Successfully refreshed token for user ${userId}`, { expiresIn: tokenPayload.expires_in })

      return tokenPayload.access_token
    } catch (error) {
      if (error instanceof IntegrationTokenError) {
        throw error
      }

      // Network errors are retryable
      lastError = error instanceof Error ? error : new Error('Unknown error')

      if (attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
        console.warn(`[Google Token Refresh] Network error on attempt ${attempt + 1}, retrying...`, lastError.message)
        await sleep(calculateBackoffDelay(attempt))
        continue
      }
    }
  }

  throw lastError ?? new IntegrationTokenError('Google token refresh failed after all retries', 'google', userId)
}

export async function refreshMetaAccessToken({ userId, clientId }: RefreshParams): Promise<string> {
  const integration = await getAdIntegration({ userId, providerId: 'facebook', clientId })

  if (!integration?.accessToken) {
    throw new IntegrationTokenError('No Meta Ads access token available', 'facebook', userId)
  }

  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET

  if (!appId || !appSecret) {
    throw new IntegrationTokenError('Meta app credentials are not configured', 'facebook', userId)
  }

  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: integration.accessToken,
  })

  let lastError: Error | null = null

  for (let attempt = 0; attempt < TOKEN_REFRESH_CONFIG.maxRetries; attempt++) {
    try {
      const response = await fetch(`${META_TOKEN_ENDPOINT}?${params.toString()}`)

      if (!response.ok) {
        const errorPayload = await response.text()
        let parsedError: { error?: { message?: string; code?: number } } = {}

        try {
          parsedError = JSON.parse(errorPayload)
        } catch {
          // Not JSON, use raw text
        }

        const errorMessage = parsedError?.error?.message ?? errorPayload


        // Check if error is retryable (5xx errors or specific Meta error codes)
        const isRetryable = response.status >= 500 || response.status === 429

        if (isRetryable && attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
          console.warn(`[Meta Token Refresh] Attempt ${attempt + 1} failed (${response.status}), retrying...`)
          lastError = new IntegrationTokenError(
            `Failed to refresh Meta Ads token (${response.status}): ${errorMessage}`,
            'facebook',
            userId,
            { isRetryable: true, httpStatus: response.status }
          )
          await sleep(calculateBackoffDelay(attempt))
          continue
        }

        // Non-retryable error or exhausted retries
        throw new IntegrationTokenError(
          `Failed to refresh Meta Ads token (${response.status}): ${errorMessage}`,
          'facebook',
          userId,
          { isRetryable: false, httpStatus: response.status }
        )
      }

      const tokenPayload = (await response.json()) as {
        access_token?: string
        expires_in?: number
        token_type?: string
      }

      if (!tokenPayload.access_token) {
        throw new IntegrationTokenError('Meta token response missing access_token', 'facebook', userId)
      }

      const expiresAt = computeExpiry(tokenPayload.expires_in)

      await updateIntegrationCredentials({
        userId,
        providerId: 'facebook',
        clientId,
        accessToken: tokenPayload.access_token,
        accessTokenExpiresAt: expiresAt ?? undefined,
      })

      console.log(`[Meta Token Refresh] Successfully refreshed token for user ${userId}, expires in ${tokenPayload.expires_in ?? 'unknown'} seconds`)

      return tokenPayload.access_token
    } catch (error) {
      if (error instanceof IntegrationTokenError) {
        throw error
      }

      // Network errors are retryable
      lastError = error instanceof Error ? error : new Error('Unknown error')

      if (attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
        console.warn(`[Meta Token Refresh] Network error on attempt ${attempt + 1}, retrying...`, lastError.message)
        await sleep(calculateBackoffDelay(attempt))
        continue
      }
    }
  }

  throw lastError ?? new IntegrationTokenError('Meta token refresh failed after all retries', 'facebook', userId)
}

export async function refreshTikTokAccessToken({ userId, clientId }: RefreshParams): Promise<string> {
  const integration = await getAdIntegration({ userId, providerId: 'tiktok', clientId })

  if (!integration?.refreshToken) {
    throw new IntegrationTokenError('No TikTok refresh token available', 'tiktok', userId)
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET

  if (!clientKey || !clientSecret) {
    throw new IntegrationTokenError('TikTok client credentials are not configured', 'tiktok', userId)
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt < TOKEN_REFRESH_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`[TikTok Token Refresh] Attempt ${attempt + 1}/${TOKEN_REFRESH_CONFIG.maxRetries} for user ${userId}`)

      const response = await fetch(TIKTOK_REFRESH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: clientKey,
          secret: clientSecret,
          refresh_token: integration.refreshToken,
          grant_type: 'refresh_token',
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.text()
        let parsedError: { code?: number; message?: string } = {}
        try {
          parsedError = JSON.parse(errorPayload) as { code?: number; message?: string }
        } catch {
          // Non-JSON error response
        }

        // Check for retryable status codes (5xx, rate limits)
        const isRetryable = response.status >= 500 || response.status === 429

        if (isRetryable && attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
          // Check for Retry-After header
          const retryAfter = response.headers.get('Retry-After')
          let delayMs = calculateBackoffDelay(attempt)

          if (retryAfter) {
            const retryAfterSeconds = parseInt(retryAfter, 10)
            if (!isNaN(retryAfterSeconds)) {
              delayMs = Math.max(delayMs, retryAfterSeconds * 1000)
            }
          }

          console.warn(`[TikTok Token Refresh] Server error ${response.status} on attempt ${attempt + 1}, retrying in ${delayMs}ms...`)
          await sleep(delayMs)
          continue
        }

        // Check for specific TikTok error codes (40001 = invalid token, 40100 = rate limited)
        if (parsedError.code === 40001) {
          throw new IntegrationTokenError(
            'TikTok refresh token has been revoked or expired. Please reconnect your TikTok Ads account.',
            'tiktok',
            userId,
            { isRetryable: false, httpStatus: response.status }
          )
        }

        throw new IntegrationTokenError(
          `Failed to refresh TikTok access token (${response.status}): ${parsedError.message || errorPayload}`,
          'tiktok',
          userId,
          { isRetryable: false, httpStatus: response.status }
        )
      }

      const payload = (await response.json()) as {
        code?: number
        message?: string
        data?: {
          access_token?: string
          expires_in?: number
          refresh_token?: string
          refresh_token_expires_in?: number
        }
      }

      // TikTok API returns code 0 for success, non-zero for errors
      if (payload.code && payload.code !== 0) {
        // Check for retryable TikTok error codes (40100 = rate limited)
        const isRetryableCode = payload.code === 40100

        if (isRetryableCode && attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
          console.warn(`[TikTok Token Refresh] TikTok error code ${payload.code} on attempt ${attempt + 1}, retrying...`)
          await sleep(calculateBackoffDelay(attempt))
          continue
        }

        throw new IntegrationTokenError(
          payload.message || `TikTok refresh token response returned code ${payload.code}`,
          'tiktok',
          userId,
          { isRetryable: false }
        )
      }

      const data = payload.data ?? {}

      if (!data.access_token) {
        throw new IntegrationTokenError('TikTok refresh response missing access_token', 'tiktok', userId)
      }

      const accessTokenExpiresAt = computeExpiry(data.expires_in)
      const refreshTokenExpiresAt = computeExpiry(data.refresh_token_expires_in)

      await updateIntegrationCredentials({
        userId,
        providerId: 'tiktok',
        clientId,
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? undefined,
        accessTokenExpiresAt: accessTokenExpiresAt ?? undefined,
        refreshTokenExpiresAt: refreshTokenExpiresAt ?? undefined,
      })

      console.log(`[TikTok Token Refresh] Successfully refreshed token for user ${userId}, expires in ${data.expires_in ?? 'unknown'} seconds`)

      return data.access_token
    } catch (error) {
      if (error instanceof IntegrationTokenError) {
        throw error
      }

      // Network errors are retryable
      lastError = error instanceof Error ? error : new Error('Unknown error')

      if (attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
        console.warn(`[TikTok Token Refresh] Network error on attempt ${attempt + 1}, retrying...`, lastError.message)
        await sleep(calculateBackoffDelay(attempt))
        continue
      }
    }
  }

  throw lastError ?? new IntegrationTokenError('TikTok token refresh failed after all retries', 'tiktok', userId)
}

export async function ensureGoogleAccessToken({ userId, clientId, forceRefresh }: RefreshParams): Promise<string> {
  cleanupStalePromises()
  const promiseKey = `google:${userId}:${clientId ?? 'workspace'}`
  const existingPromise = refreshPromises.get(promiseKey)
  if (existingPromise) return existingPromise

  const refreshPromise = (async () => {
    try {
      const integration = await getAdIntegration({ userId, providerId: 'google', clientId })
      if (!integration?.accessToken) {
        throw new IntegrationTokenError('Google Ads integration missing access token', 'google', userId)
      }

      // Force refresh if requested or token is expiring soon
      // Use a 10-minute buffer for pre-emptive refresh
      const PRE_EMPTIVE_REFRESH_BUFFER_MS = 10 * 60 * 1000

      if (forceRefresh || isTokenExpiringSoon(integration.accessTokenExpiresAt, PRE_EMPTIVE_REFRESH_BUFFER_MS)) {
        console.log(`[Google Token] Token expiring soon or force refresh requested for user ${userId}, refreshing...`)
        return await refreshGoogleAccessToken({ userId, clientId })
      }

      return integration.accessToken
    } finally {
      refreshPromises.delete(promiseKey)
      refreshPromiseTimestamps.delete(promiseKey)
    }
  })()

  refreshPromises.set(promiseKey, refreshPromise)
  refreshPromiseTimestamps.set(promiseKey, Date.now())
  return refreshPromise
}

export async function ensureMetaAccessToken({ userId, clientId, forceRefresh }: RefreshParams): Promise<string> {
  cleanupStalePromises()
  const promiseKey = `facebook:${userId}:${clientId ?? 'workspace'}`
  const existingPromise = refreshPromises.get(promiseKey)
  if (existingPromise) return existingPromise

  const refreshPromise = (async () => {
    try {
      const integration = await getAdIntegration({ userId, providerId: 'facebook', clientId })
      if (!integration?.accessToken) {
        throw new IntegrationTokenError('Meta Ads integration missing access token', 'facebook', userId)
      }

      // Force refresh if requested or token is expiring soon
      // Use a 10-minute buffer for pre-emptive refresh
      const PRE_EMPTIVE_REFRESH_BUFFER_MS = 10 * 60 * 1000

      if (forceRefresh || isTokenExpiringSoon(integration.accessTokenExpiresAt, PRE_EMPTIVE_REFRESH_BUFFER_MS)) {
        console.log(`[Meta Token] Token expiring soon or force refresh requested for user ${userId}, refreshing...`)
        return await refreshMetaAccessToken({ userId, clientId })
      }

      return integration.accessToken
    } finally {
      refreshPromises.delete(promiseKey)
      refreshPromiseTimestamps.delete(promiseKey)
    }
  })()

  refreshPromises.set(promiseKey, refreshPromise)
  refreshPromiseTimestamps.set(promiseKey, Date.now())
  return refreshPromise
}

export async function ensureTikTokAccessToken({ userId, clientId }: RefreshParams): Promise<string> {
  cleanupStalePromises()
  const promiseKey = `tiktok:${userId}:${clientId ?? 'workspace'}`
  const existingPromise = refreshPromises.get(promiseKey)
  if (existingPromise) return existingPromise

  const refreshPromise = (async () => {
    try {
      const integration = await getAdIntegration({ userId, providerId: 'tiktok', clientId })

      if (!integration?.accessToken) {
        throw new IntegrationTokenError('TikTok integration missing access token', 'tiktok', userId)
      }

      if (isTokenExpiringSoon(integration.accessTokenExpiresAt)) {
        return await refreshTikTokAccessToken({ userId, clientId })
      }

      return integration.accessToken
    } finally {
      refreshPromises.delete(promiseKey)
      refreshPromiseTimestamps.delete(promiseKey)
    }
  })()

  refreshPromises.set(promiseKey, refreshPromise)
  refreshPromiseTimestamps.set(promiseKey, Date.now())
  return refreshPromise
}

// =============================================================================
// LINKEDIN TOKEN REFRESH
// =============================================================================

export async function refreshLinkedInAccessToken({ userId, clientId }: RefreshParams): Promise<string> {
  const integration = await getAdIntegration({ userId, providerId: 'linkedin', clientId })

  if (!integration?.refreshToken) {
    throw new IntegrationTokenError(
      'No LinkedIn refresh token available. LinkedIn tokens expire after 60 days - please reconnect your account.',
      'linkedin',
      userId,
      { isRetryable: false }
    )
  }

  const linkedInClientId = process.env.LINKEDIN_CLIENT_ID
  const linkedInClientSecret = process.env.LINKEDIN_CLIENT_SECRET

  if (!linkedInClientId || !linkedInClientSecret) {
    throw new IntegrationTokenError('LinkedIn client credentials are not configured', 'linkedin', userId)
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: integration.refreshToken,
    client_id: linkedInClientId,
    client_secret: linkedInClientSecret,
  })

  let lastError: Error | null = null

  for (let attempt = 0; attempt < TOKEN_REFRESH_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`[LinkedIn Token Refresh] Attempt ${attempt + 1}/${TOKEN_REFRESH_CONFIG.maxRetries} for user ${userId}`)

      const response = await fetch(LINKEDIN_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      if (!response.ok) {
        const errorPayload = await response.text()
        let parsedError: { error?: string; error_description?: string } = {}

        try {
          parsedError = JSON.parse(errorPayload)
        } catch {
          // Not JSON
        }

        const errorMessage = parsedError.error_description ?? parsedError.error ?? errorPayload

        // Check if error is retryable (5xx errors or rate limiting)
        const isRetryable = response.status >= 500 || response.status === 429

        if (isRetryable && attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
          logger.warn(`[LinkedIn Token Refresh] Attempt ${attempt + 1} failed (${response.status}), retrying...`, { userId })
          lastError = new IntegrationTokenError(
            `Failed to refresh LinkedIn token (${response.status}): ${errorMessage}`,
            'linkedin',
            userId,
            { isRetryable: true, httpStatus: response.status }
          )
          await sleep(calculateBackoffDelay(attempt))
          continue
        }

        // Check for invalid_grant (token revoked or expired)
        if (parsedError.error === 'invalid_grant') {
          throw new IntegrationTokenError(
            'LinkedIn refresh token has expired or been revoked. Please reconnect your LinkedIn Ads account.',
            'linkedin',
            userId,
            { isRetryable: false, httpStatus: response.status }
          )
        }

        throw new IntegrationTokenError(
          `Failed to refresh LinkedIn token (${response.status}): ${errorMessage}`,
          'linkedin',
          userId,
          { isRetryable: false, httpStatus: response.status }
        )
      }

      const tokenPayload = (await response.json()) as {
        access_token?: string
        expires_in?: number
        refresh_token?: string
        refresh_token_expires_in?: number
      }

      if (!tokenPayload.access_token) {
        throw new IntegrationTokenError('LinkedIn token response missing access_token', 'linkedin', userId)
      }

      const accessTokenExpiresAt = computeExpiry(tokenPayload.expires_in)
      const refreshTokenExpiresAt = computeExpiry(tokenPayload.refresh_token_expires_in)

      await updateIntegrationCredentials({
        userId,
        providerId: 'linkedin',
        clientId,
        accessToken: tokenPayload.access_token,
        refreshToken: tokenPayload.refresh_token ?? undefined,
        accessTokenExpiresAt: accessTokenExpiresAt ?? undefined,
        refreshTokenExpiresAt: refreshTokenExpiresAt ?? undefined,
      })

      logger.info(`[LinkedIn Token Refresh] Successfully refreshed token for user ${userId}`, { expiresIn: tokenPayload.expires_in })

      return tokenPayload.access_token
    } catch (error) {
      if (error instanceof IntegrationTokenError) {
        throw error
      }

      // Network errors are retryable
      lastError = error instanceof Error ? error : new Error('Unknown error')

      if (attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
        console.warn(`[LinkedIn Token Refresh] Network error on attempt ${attempt + 1}, retrying...`, lastError.message)
        await sleep(calculateBackoffDelay(attempt))
        continue
      }
    }
  }

  throw lastError ?? new IntegrationTokenError('LinkedIn token refresh failed after all retries', 'linkedin', userId)
}

export async function ensureLinkedInAccessToken({ userId, clientId, forceRefresh }: RefreshParams): Promise<string> {
  cleanupStalePromises()
  const promiseKey = `linkedin:${userId}:${clientId ?? 'workspace'}`
  const existingPromise = refreshPromises.get(promiseKey)
  if (existingPromise) return existingPromise

  const refreshPromise = (async () => {
    try {
      const integration = await getAdIntegration({ userId, providerId: 'linkedin', clientId })

      if (!integration?.accessToken) {
        throw new IntegrationTokenError('LinkedIn integration missing access token', 'linkedin', userId)
      }

      // LinkedIn tokens have a 60-day lifespan. Check if refresh is needed.
      // Use a 1-day buffer for pre-emptive refresh to avoid sync failures
      const PRE_EMPTIVE_REFRESH_BUFFER_MS = 24 * 60 * 60 * 1000 // 1 day

      if (forceRefresh || isTokenExpiringSoon(integration.accessTokenExpiresAt, PRE_EMPTIVE_REFRESH_BUFFER_MS)) {
        // Check if we have a refresh token
        if (!integration.refreshToken) {
          throw new IntegrationTokenError(
            'LinkedIn access token is expiring and no refresh token is available. Please reconnect your LinkedIn Ads account.',
            'linkedin',
            userId,
            { isRetryable: false }
          )
        }
        console.log(`[LinkedIn Token] Token expiring soon or force refresh requested for user ${userId}, refreshing...`)
        return await refreshLinkedInAccessToken({ userId, clientId })
      }

      return integration.accessToken
    } finally {
      refreshPromises.delete(promiseKey)
      refreshPromiseTimestamps.delete(promiseKey)
    }
  })()

  refreshPromises.set(promiseKey, refreshPromise)
  refreshPromiseTimestamps.set(promiseKey, Date.now())
  return refreshPromise
}
