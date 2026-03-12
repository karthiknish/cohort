import { decrypt, encrypt } from '@/lib/crypto'
import { persistIntegrationTokens } from '@/lib/ads-admin'
import { exchangeMetaCodeForToken } from '@/services/facebook-oauth'
import { calculateBackoffDelay as calculateBackoffDelayLib, sleep } from '@/lib/retry-utils'
import { logger } from '@/lib/logger'

// Meta Graph API version - updated to v24.0 (latest as of January 2026)
const META_API_VERSION = 'v24.0'

interface MetaOAuthContext {
  state: string
  redirect?: string
  clientId?: string | null
  /** Which Meta surface initiated the login (for routing post-auth). */
  surface?: 'facebook' | 'instagram'
  /** Which app entry point initiated the login (determines default redirect). */
  entryPoint?: 'socials' | 'ads'
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

  // Exchange for long-lived token with retry logic.
  // We intentionally fail setup if this exchange fails to avoid storing short-lived tokens.
  let longLivedToken: string | null = null
  let expiresIn: number | undefined = tokenResponse.expires_in
  let finalExchangeError: MetaOAuthError | null = null

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

        throw new MetaOAuthError(
          `Failed to exchange long-lived Meta token: ${errorMessage.substring(0, 200)}`,
          parsedError?.error?.code ?? longLivedResponse.status,
          isRetryable,
        )
      }

      const extended = (await longLivedResponse.json()) as { access_token?: string; expires_in?: number }

      if (!extended.access_token) {
        throw new MetaOAuthError('Meta did not return a long-lived access token')
      }

      longLivedToken = extended.access_token
      expiresIn = extended.expires_in
      logger.info('[Meta OAuth Flow] Long-lived token obtained successfully', { userId, expiresIn })

      break
    } catch (exchangeError) {
      const message = exchangeError instanceof Error ? exchangeError.message : 'Long-lived token exchange failed'
      const isRetryable = exchangeError instanceof MetaOAuthError
        ? exchangeError.isRetryable
        : true

      logger.warn('[Meta OAuth Flow] Long-lived token exchange error', {
        userId,
        attempt: attempt + 1,
        error: message,
        isRetryable,
      })

      if (isRetryable && attempt < OAUTH_RETRY_CONFIG.maxRetries - 1) {
        const delayMs = calculateBackoffDelay(attempt)
        await sleep(delayMs)
        continue
      }

      finalExchangeError = exchangeError instanceof MetaOAuthError
        ? exchangeError
        : new MetaOAuthError(message)
      break
    }
  }

  if (!longLivedToken) {
    throw finalExchangeError ?? new MetaOAuthError('Failed to exchange long-lived Meta token')
  }

  // Persist tokens only. Account selection happens explicitly in setup UI.

  await persistIntegrationTokens({
    userId,
    providerId: 'facebook',
    clientId: clientId ?? null,
    accessToken: longLivedToken,
    scopes: ['ads_management', 'ads_read', 'business_management'],
    accountId: null,
    accountName: null,
    status: 'pending',
    accessTokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
  })

  logger.info('[Meta OAuth Flow] Integration persisted successfully; awaiting account selection', {
    userId,
    clientId,
  })
}
