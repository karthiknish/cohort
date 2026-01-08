import { decrypt, encrypt } from '@/lib/crypto'
import { persistIntegrationTokens, enqueueSyncJob } from '@/lib/firestore/admin'
import { exchangeMetaCodeForToken } from '@/services/facebook-oauth'
import { calculateBackoffDelay as calculateBackoffDelayLib, sleep } from '@/lib/retry-utils'

interface MetaOAuthContext {
  state: string
  redirect?: string
  clientId?: string | null
  createdAt: number
}

const STATE_TTL_MS = 5 * 60 * 1000

// Retry configuration for OAuth operations
const OAUTH_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 5000,
  jitterFactor: 0.2,
}

function calculateBackoffDelay(attempt: number): number {
  return calculateBackoffDelayLib(attempt, OAUTH_RETRY_CONFIG)
}

type MetaOAuthStatePayload = Omit<MetaOAuthContext, 'createdAt'> & { createdAt?: number }

/**
 * Create an encrypted OAuth state for Meta Business Login.
 * Note: Meta Business Login does NOT support PKCE, so we don't generate a code verifier.
 */
export function createMetaOAuthState(payload: MetaOAuthStatePayload): string {
  const data: MetaOAuthContext = {
    ...payload,
    createdAt: payload.createdAt ?? Date.now(),
  }
  return encodeURIComponent(encrypt(JSON.stringify(data)))
}

export function validateMetaOAuthState(state: string): MetaOAuthContext {
  if (!state) {
    throw new Error('Missing OAuth state')
  }

  const decoded = decodeURIComponent(state)
  let parsed: MetaOAuthContext
  try {
    parsed = JSON.parse(decrypt(decoded)) as MetaOAuthContext
  } catch {
    throw new Error('Invalid state payload')
  }

  if (!parsed?.state || !parsed.createdAt) {
    throw new Error('Malformed state payload')
  }

  if (Date.now() - parsed.createdAt > STATE_TTL_MS) {
    throw new Error('OAuth state has expired')
  }

  return parsed
}

export class MetaOAuthError extends Error {
  readonly code?: number
  readonly isRetryable: boolean

  constructor(message: string, code?: number, isRetryable = false) {
    super(message)
    this.name = 'MetaOAuthError'
    this.code = code
    this.isRetryable = isRetryable
  }
}

export async function completeMetaOAuthFlow(options: {
  code: string
  userId: string
  clientId?: string | null
  redirectUri: string
}): Promise<void> {
  const { code, userId, clientId, redirectUri } = options
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET

  if (!appId || !appSecret) {
    throw new MetaOAuthError('Meta app credentials are not configured')
  }

  // Exchange code for short-lived token
  let tokenResponse
  try {
    tokenResponse = await exchangeMetaCodeForToken({
      appId,
      appSecret,
      redirectUri,
      code,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token exchange failed'
    console.error('[Meta OAuth] Code exchange failed:', message)
    throw new MetaOAuthError(`Failed to exchange authorization code: ${message}`)
  }

  if (!tokenResponse.access_token) {
    throw new MetaOAuthError('No access token received from Meta')
  }

  // Exchange for long-lived token with retry logic
  let longLivedToken: string = tokenResponse.access_token
  let expiresIn: number | undefined = tokenResponse.expires_in

  for (let attempt = 0; attempt < OAUTH_RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const longLivedResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(
          appId,
        )}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(tokenResponse.access_token)}`,
      )

      if (!longLivedResponse.ok) {
        const errorPayload = await longLivedResponse.text()
        let parsedError: { error?: { message?: string; code?: number } } = {}

        try {
          parsedError = JSON.parse(errorPayload)
        } catch {
          // Not JSON
        }

        const errorMessage = parsedError?.error?.message ?? errorPayload
        const isRetryable = longLivedResponse.status >= 500 || longLivedResponse.status === 429

        if (isRetryable && attempt < OAUTH_RETRY_CONFIG.maxRetries - 1) {
          console.warn(`[Meta OAuth] Long-lived token exchange attempt ${attempt + 1} failed (${longLivedResponse.status}), retrying...`)
          await sleep(calculateBackoffDelay(attempt))
          continue
        }

        // If we can't get long-lived token, we can still proceed with short-lived
        console.warn(`[Meta OAuth] Failed to get long-lived token, using short-lived: ${errorMessage}`)
        break
      }

      const extended = (await longLivedResponse.json()) as { access_token?: string; expires_in?: number }

      if (extended.access_token) {
        longLivedToken = extended.access_token
        expiresIn = extended.expires_in
        console.log(`[Meta OAuth] Successfully obtained long-lived token, expires in ${expiresIn} seconds`)
      }

      break
    } catch (networkError) {
      const message = networkError instanceof Error ? networkError.message : 'Network error'
      console.warn(`[Meta OAuth] Network error on attempt ${attempt + 1}: ${message}`)

      if (attempt < OAUTH_RETRY_CONFIG.maxRetries - 1) {
        await sleep(calculateBackoffDelay(attempt))
        continue
      }

      // Use short-lived token if long-lived exchange fails
      console.warn('[Meta OAuth] All attempts to get long-lived token failed, using short-lived token')
      break
    }
  }

  // Persist the tokens
  await persistIntegrationTokens({
    userId,
    providerId: 'facebook',
    clientId: clientId ?? null,
    accessToken: longLivedToken,
    scopes: ['ads_management', 'ads_read', 'business_management'],
    accessTokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
  })

  console.log(`[Meta OAuth] Successfully persisted integration for user ${userId}`)

  // Enqueue initial sync job
  await enqueueSyncJob({ userId, providerId: 'facebook', clientId: clientId ?? null, jobType: 'initial-backfill' })
}
