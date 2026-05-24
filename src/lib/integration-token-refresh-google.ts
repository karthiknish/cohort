/**
 * Google Ads / Analytics token refresh without importing `@/services/google-oauth`
 * (which pulls in `@/lib/crypto`). Used from Convex `"use node"` actions.
 */
import { getAdIntegration, updateIntegrationCredentials } from '@/lib/ads-admin'
import { getGoogleAnalyticsIntegration, updateGoogleAnalyticsCredentials } from '@/lib/analytics-admin'
import { logger } from '@/lib/logger'
import { calculateBackoffDelay as calculateBackoffDelayLib, sleep } from '@/lib/retry-utils'

import { IntegrationTokenError, type RefreshParams } from './integration-token-refresh-shared'

const GOOGLE_TOKEN_ENDPOINT = process.env.GOOGLE_TOKEN_ENDPOINT ?? 'https://oauth2.googleapis.com/token'

const TOKEN_REFRESH_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
}

function readEnvValue(key: string): string | null {
  const value = process.env[key]
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function firstEnvValue(keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = readEnvValue(key)
    if (value) return value
  }
  return null
}

function resolveGoogleAdsOAuthCredentials(): {
  clientId: string | null
  clientSecret: string | null
} {
  return {
    clientId: firstEnvValue(['GOOGLE_ADS_CLIENT_ID', 'GOOGLE_CLIENT_ID']),
    clientSecret: firstEnvValue(['GOOGLE_ADS_CLIENT_SECRET', 'GOOGLE_CLIENT_SECRET']),
  }
}

function resolveGoogleAnalyticsOAuthCredentials(): {
  clientId: string | null
  clientSecret: string | null
} {
  return {
    clientId: firstEnvValue(['GOOGLE_ANALYTICS_CLIENT_ID', 'GOOGLE_CLIENT_ID']),
    clientSecret: firstEnvValue(['GOOGLE_ANALYTICS_CLIENT_SECRET', 'GOOGLE_CLIENT_SECRET']),
  }
}

function computeExpiry(expiresInSeconds?: number): Date | null {
  if (!expiresInSeconds || !Number.isFinite(expiresInSeconds)) {
    return null
  }
  return new Date(Date.now() + expiresInSeconds * 1000 - 30 * 1000)
}

function calculateBackoffDelay(attempt: number): number {
  return calculateBackoffDelayLib(attempt, {
    maxRetries: TOKEN_REFRESH_CONFIG.maxRetries,
    baseDelayMs: TOKEN_REFRESH_CONFIG.baseDelayMs,
    maxDelayMs: TOKEN_REFRESH_CONFIG.maxDelayMs,
    jitterFactor: 0.3,
  })
}

function resolveGoogleProvider(providerId?: 'google' | 'google-analytics'): 'google' | 'google-analytics' {
  return providerId === 'google-analytics' ? 'google-analytics' : 'google'
}

function formatGoogleProviderName(providerId: 'google' | 'google-analytics'): string {
  return providerId === 'google-analytics' ? 'Google Analytics' : 'Google Ads'
}

export async function refreshGoogleAccessToken({ userId, clientId, providerId }: RefreshParams): Promise<string> {
  const resolvedProviderId = resolveGoogleProvider(providerId)
  const providerName = formatGoogleProviderName(resolvedProviderId)
  const integration = resolvedProviderId === 'google-analytics'
    ? await getGoogleAnalyticsIntegration({ userId, clientId })
    : await getAdIntegration({ userId, providerId: resolvedProviderId, clientId })

  if (!integration?.refreshToken) {
    throw new IntegrationTokenError(`No ${providerName} refresh token available`, resolvedProviderId, userId)
  }

  const credentials =
    resolvedProviderId === 'google-analytics'
      ? resolveGoogleAnalyticsOAuthCredentials()
      : resolveGoogleAdsOAuthCredentials()

  const googleClientId = credentials.clientId
  const googleClientSecret = credentials.clientSecret

  if (!googleClientId || !googleClientSecret) {
    throw new IntegrationTokenError(`${providerName} client credentials are not configured`, resolvedProviderId, userId)
  }

  const params = new URLSearchParams({
    client_id: googleClientId,
    client_secret: googleClientSecret,
    grant_type: 'refresh_token',
    refresh_token: integration.refreshToken,
  })

  let lastError: Error | null = null

  const attemptRefresh = async (attempt: number): Promise<string> => {
    try {
      const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
        const isRetryable = response.status >= 500 || response.status === 429

        if (isRetryable && attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
          logger.warn(`[Google Token Refresh] Attempt ${attempt + 1} failed (${response.status}), retrying...`, { userId })
          lastError = new IntegrationTokenError(
            `Failed to refresh ${providerName} token (${response.status}): ${errorMessage}`,
            resolvedProviderId,
            userId,
            { isRetryable: true, httpStatus: response.status },
          )
          await sleep(calculateBackoffDelay(attempt))
          return attemptRefresh(attempt + 1)
        }

        if (parsedError.error === 'invalid_grant') {
          throw new IntegrationTokenError(
            `${providerName} refresh token has been revoked or expired. Please reconnect your account.`,
            resolvedProviderId,
            userId,
            { isRetryable: false, httpStatus: response.status },
          )
        }

        throw new IntegrationTokenError(
          `Failed to refresh ${providerName} token (${response.status}): ${errorMessage}`,
          resolvedProviderId,
          userId,
          { isRetryable: false, httpStatus: response.status },
        )
      }

      const tokenPayload = (await response.json()) as {
        access_token?: string
        expires_in?: number
        refresh_token?: string
        id_token?: string
      }

      if (!tokenPayload.access_token) {
        throw new IntegrationTokenError(`${providerName} token response missing access_token`, resolvedProviderId, userId)
      }

      const expiresAt = computeExpiry(tokenPayload.expires_in)

      if (resolvedProviderId === 'google-analytics') {
        await updateGoogleAnalyticsCredentials({
          userId,
          clientId,
          accessToken: tokenPayload.access_token,
          accessTokenExpiresAt: expiresAt ?? undefined,
          refreshToken: tokenPayload.refresh_token ?? undefined,
          idToken: tokenPayload.id_token ?? undefined,
        })
      } else {
        await updateIntegrationCredentials({
          userId,
          providerId: resolvedProviderId,
          clientId,
          accessToken: tokenPayload.access_token,
          accessTokenExpiresAt: expiresAt ?? undefined,
          refreshToken: tokenPayload.refresh_token ?? undefined,
          idToken: tokenPayload.id_token ?? undefined,
        })
      }

      logger.info(`[Google Token Refresh] Successfully refreshed token for user ${userId}`, {
        expiresIn: tokenPayload.expires_in,
      })

      return tokenPayload.access_token
    } catch (error) {
      if (error instanceof IntegrationTokenError) {
        throw error
      }

      lastError = error instanceof Error ? error : new Error('Unknown error')

      if (attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
        console.warn(`[Google Token Refresh] Network error on attempt ${attempt + 1}, retrying...`, lastError.message)
        await sleep(calculateBackoffDelay(attempt))
        return attemptRefresh(attempt + 1)
      }
    }

    throw lastError ?? new IntegrationTokenError('Google token refresh failed after all retries', resolvedProviderId, userId)
  }

  return attemptRefresh(0)
}
