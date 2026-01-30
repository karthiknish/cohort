import { decrypt, encrypt } from '@/lib/crypto'
import { persistIntegrationTokens, enqueueSyncJob } from '@/lib/ads-admin'
import { fetchMetaAdAccounts } from '@/services/integrations/meta-ads'
import { exchangeMetaCodeForToken } from '@/services/facebook-oauth'
import { calculateBackoffDelay as calculateBackoffDelayLib, sleep } from '@/lib/retry-utils'
import { logger } from '@/lib/logger'

// Meta Graph API version - updated to v24.0 (latest as of January 2026)
const META_API_VERSION = 'v24.0'

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

  logger.info('[Meta OAuth Flow] Starting OAuth completion', { userId, clientId, apiVersion: META_API_VERSION })

  if (!appId || !appSecret) {
    logger.error('[Meta OAuth Flow] App credentials not configured')
    throw new MetaOAuthError('Meta app credentials are not configured')
  }

  // Exchange code for short-lived token
  let tokenResponse
  try {
    logger.debug('[Meta OAuth Flow] Exchanging code for short-lived token', { userId })
    tokenResponse = await exchangeMetaCodeForToken({
      appId,
      appSecret,
      redirectUri,
      code,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token exchange failed'
    logger.error('[Meta OAuth Flow] Code exchange failed', { userId, error: message })
    throw new MetaOAuthError(`Failed to exchange authorization code: ${message}`)
  }

  if (!tokenResponse.access_token) {
    logger.error('[Meta OAuth Flow] No access token received', { userId })
    throw new MetaOAuthError('No access token received from Meta')
  }

  logger.info('[Meta OAuth Flow] Short-lived token obtained', { userId, expiresIn: tokenResponse.expires_in })

  // Exchange for long-lived token with retry logic
  let longLivedToken: string = tokenResponse.access_token
  let expiresIn: number | undefined = tokenResponse.expires_in

  for (let attempt = 0; attempt < OAUTH_RETRY_CONFIG.maxRetries; attempt++) {
    try {
      logger.debug('[Meta OAuth Flow] Attempting long-lived token exchange', { userId, attempt: attempt + 1 })
      
      const longLivedResponse = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(
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

        logger.warn('[Meta OAuth Flow] Long-lived token exchange failed', { 
          userId, 
          attempt: attempt + 1,
          status: longLivedResponse.status,
          isRetryable,
          errorMessage: errorMessage.substring(0, 200)
        })

        if (isRetryable && attempt < OAUTH_RETRY_CONFIG.maxRetries - 1) {
          const delayMs = calculateBackoffDelay(attempt)
          logger.info('[Meta OAuth Flow] Retrying long-lived token exchange', { userId, delayMs })
          await sleep(delayMs)
          continue
        }

        // If we can't get long-lived token, we can still proceed with short-lived
        logger.warn('[Meta OAuth Flow] Using short-lived token instead', { userId, error: errorMessage.substring(0, 200) })
        break
      }

      const extended = (await longLivedResponse.json()) as { access_token?: string; expires_in?: number }

      if (extended.access_token) {
        longLivedToken = extended.access_token
        expiresIn = extended.expires_in
        logger.info('[Meta OAuth Flow] Long-lived token obtained successfully', { userId, expiresIn })
      }

      break
    } catch (networkError) {
      const message = networkError instanceof Error ? networkError.message : 'Network error'
      logger.warn('[Meta OAuth Flow] Network error during long-lived token exchange', { userId, attempt: attempt + 1, error: message })

      if (attempt < OAUTH_RETRY_CONFIG.maxRetries - 1) {
        const delayMs = calculateBackoffDelay(attempt)
        await sleep(delayMs)
        continue
      }

      // Use short-lived token if long-lived exchange fails
      logger.warn('[Meta OAuth Flow] All long-lived token attempts failed, using short-lived', { userId })
      break
    }
  }

  // Persist the tokens
  let accountId: string | null = null
  let accountName: string | null = null
  try {
    if (longLivedToken) {
      logger.debug('[Meta OAuth Flow] Fetching ad accounts', { userId })
      const accounts = await fetchMetaAdAccounts({ accessToken: longLivedToken })
      const preferredAccount = accounts.find((account) => account.account_status === 1) ?? accounts[0]
      accountId = preferredAccount?.id ?? null
      accountName = preferredAccount?.name ?? null
      logger.info('[Meta OAuth Flow] Ad accounts resolved', { userId, accountId, accountName })
    }
  } catch (error) {
    logger.warn('[Meta OAuth Flow] Failed to resolve account name', { userId, error: error instanceof Error ? error.message : 'Unknown error' })
  }

  await persistIntegrationTokens({
    userId,
    providerId: 'facebook',
    clientId: clientId ?? null,
    accessToken: longLivedToken,
    scopes: ['ads_management', 'ads_read', 'business_management'],
    accountId,
    accountName,
    accessTokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
  })

  logger.info('[Meta OAuth Flow] Integration persisted successfully', { userId, clientId, accountId })

  // Enqueue initial sync job
  await enqueueSyncJob({ userId, providerId: 'facebook', clientId: clientId ?? null, jobType: 'initial-backfill' })
  logger.info('[Meta OAuth Flow] Initial sync job enqueued', { userId, clientId })
}
