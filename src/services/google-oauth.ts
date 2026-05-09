import { decrypt, encrypt, generateCodeVerifier } from '@/lib/crypto'
import { enqueueSyncJob, getAdIntegration, persistIntegrationTokens } from '@/lib/ads-admin'
import { getGoogleAnalyticsIntegration, persistGoogleAnalyticsTokens } from '@/lib/analytics-admin'

// =============================================================================
// GOOGLE OAUTH CONFIGURATION
// =============================================================================

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'

// Required scope for Google Ads API access
export const GOOGLE_ADS_SCOPES = [
  'https://www.googleapis.com/auth/adwords',
  'openid',
  'email',
] as const

export const GOOGLE_ANALYTICS_SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'openid',
  'email',
] as const

function readEnvValue(key: string): string | null {
  const value = process.env[key]
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function firstEnvValue(keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = readEnvValue(key)
    if (value) {
      return value
    }
  }

  return null
}

function normalizeAppUrl(appUrl?: string | null): string | null {
  if (typeof appUrl !== 'string') {
    return null
  }

  const normalized = appUrl.trim().replace(/\/+$/, '')
  return normalized.length > 0 ? normalized : null
}

export function resolveGoogleAdsOAuthCredentials(): {
  clientId: string | null
  clientSecret: string | null
} {
  return {
    clientId: firstEnvValue(['GOOGLE_ADS_CLIENT_ID', 'GOOGLE_CLIENT_ID']),
    clientSecret: firstEnvValue(['GOOGLE_ADS_CLIENT_SECRET', 'GOOGLE_CLIENT_SECRET']),
  }
}

export function resolveGoogleAnalyticsOAuthCredentials(): {
  clientId: string | null
  clientSecret: string | null
} {
  return {
    clientId: firstEnvValue(['GOOGLE_ANALYTICS_CLIENT_ID', 'GOOGLE_CLIENT_ID', 'GOOGLE_ADS_CLIENT_ID']),
    clientSecret: firstEnvValue([
      'GOOGLE_ANALYTICS_CLIENT_SECRET',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_ADS_CLIENT_SECRET',
    ]),
  }
}

export function resolveGoogleAdsOAuthRedirectUri(appUrl?: string | null): string | null {
  const explicit = firstEnvValue(['GOOGLE_ADS_OAUTH_REDIRECT_URI', 'GOOGLE_OAUTH_REDIRECT_URI'])
  if (explicit) {
    return explicit
  }

  const normalizedAppUrl = normalizeAppUrl(appUrl)
  if (!normalizedAppUrl) {
    return null
  }

  return `${normalizedAppUrl}/api/integrations/google/oauth/callback`
}

export function resolveGoogleAnalyticsOAuthRedirectUri(appUrl?: string | null): string | null {
  // Keep GA callback distinct from Ads callback unless explicitly overridden.
  const explicit = firstEnvValue(['GOOGLE_ANALYTICS_OAUTH_REDIRECT_URI'])
  if (explicit) {
    return explicit
  }

  const normalizedAppUrl = normalizeAppUrl(appUrl)
  if (!normalizedAppUrl) {
    return null
  }

  return `${normalizedAppUrl}/api/integrations/google-analytics/oauth/callback`
}

export function parseGoogleScopeList(scopeValue: string | undefined | null, fallback: string[] = []): string[] {
  const scopes = typeof scopeValue === 'string'
    ? scopeValue.split(' ').flatMap((scope) => {
        const normalizedScope = scope.trim()
        return normalizedScope ? [normalizedScope] : []
      })
    : []

  if (scopes.length > 0) {
    return scopes
  }

  return fallback
}

// =============================================================================
// TYPES
// =============================================================================

interface GoogleOAuthContext {
  state: string
  redirect?: string
  clientId?: string | null
  codeVerifier?: string
  createdAt: number
}

interface BuildGoogleAuthUrlOptions {
  clientId: string
  redirectUri: string
  state?: string
  scopes?: string[]
  accessType?: 'online' | 'offline'
  prompt?: 'none' | 'consent' | 'select_account'
}

interface ExchangeCodeOptions {
  clientId: string
  clientSecret: string
  redirectUri: string
  code: string
}

interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  scope?: string
  id_token?: string
}

interface GoogleErrorResponse {
  error?: string
  error_description?: string
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STATE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// =============================================================================
// ERROR CLASS
// =============================================================================

export class GoogleTokenExchangeError extends Error {
  readonly code?: string
  readonly description?: string

  constructor(options: {
    message: string
    code?: string
    description?: string
  }) {
    super(options.message)
    this.name = 'GoogleTokenExchangeError'
    this.code = options.code
    this.description = options.description
  }
}

export class GoogleOAuthError extends Error {
  readonly code?: string
  readonly isRetryable: boolean

  constructor(message: string, code?: string, isRetryable = false) {
    super(message)
    this.name = 'GoogleOAuthError'
    this.code = code
    this.isRetryable = isRetryable
  }
}

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

type GoogleOAuthStatePayload = Omit<GoogleOAuthContext, 'createdAt'> & { createdAt?: number }

export function createGoogleOAuthState(payload: GoogleOAuthStatePayload): string {
  const data: GoogleOAuthContext = {
    ...payload,
    codeVerifier: payload.codeVerifier ?? generateCodeVerifier(),
    createdAt: payload.createdAt ?? Date.now(),
  }
  return encodeURIComponent(encrypt(JSON.stringify(data)))
}

export function validateGoogleOAuthState(state: string): GoogleOAuthContext {
  if (!state) {
    throw new Error('Missing OAuth state')
  }

  const decoded = decodeURIComponent(state)
  let parsed: GoogleOAuthContext
  try {
    parsed = JSON.parse(decrypt(decoded)) as GoogleOAuthContext
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

// =============================================================================
// URL BUILDING
// =============================================================================

export function buildGoogleOAuthUrl(options: BuildGoogleAuthUrlOptions): string {
  const {
    clientId,
    redirectUri,
    state,
    scopes = GOOGLE_ADS_SCOPES,
    accessType = 'offline',
    prompt = 'consent',
  } = options

  if (!clientId) {
    throw new Error('Google client ID is required')
  }

  if (!redirectUri) {
    throw new Error('Google redirect URI is required')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: accessType,
    prompt,
  })

  if (state) {
    params.set('state', state)
  }

  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`
}

export function buildGoogleAnalyticsOAuthUrl(options: BuildGoogleAuthUrlOptions): string {
  return buildGoogleOAuthUrl({
    ...options,
    scopes: options.scopes ?? [...GOOGLE_ANALYTICS_SCOPES],
  })
}

// =============================================================================
// TOKEN EXCHANGE
// =============================================================================

export async function exchangeGoogleCodeForTokens(
  options: ExchangeCodeOptions
): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret, redirectUri, code } = options

  if (!clientId || !clientSecret) {
    throw new GoogleTokenExchangeError({
      message: 'Google OAuth credentials are required',
    })
  }

  if (!code) {
    throw new GoogleTokenExchangeError({
      message: 'Authorization code is required',
    })
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
    grant_type: 'authorization_code',
  })

  let response: Response
  try {
    response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })
  } catch (networkError) {
    const message = networkError instanceof Error ? networkError.message : 'Network error'
    throw new GoogleTokenExchangeError({
      message: `Network error during Google token exchange: ${message}`,
    })
  }

  const responseText = await response.text()
  let responseData: GoogleTokenResponse | GoogleErrorResponse

  try {
    responseData = JSON.parse(responseText) as GoogleTokenResponse | GoogleErrorResponse
  } catch {
    throw new GoogleTokenExchangeError({
      message: `Invalid response from Google: ${responseText.substring(0, 200)}`,
    })
  }

  if (!response.ok) {
    const errorData = responseData as GoogleErrorResponse
    throw new GoogleTokenExchangeError({
      message: errorData?.error_description ?? `Google token exchange failed (${response.status})`,
      code: errorData?.error,
      description: errorData?.error_description,
    })
  }

  const tokenData = responseData as GoogleTokenResponse

  if (!tokenData.access_token) {
    throw new GoogleTokenExchangeError({
      message: 'Google token response missing access_token',
    })
  }

  return tokenData
}

// =============================================================================
// COMPLETE OAUTH FLOW
// =============================================================================

export async function completeGoogleOAuthFlow(options: {
  code: string
  userId: string
  clientId?: string | null
  redirectUri: string
}): Promise<void> {
  const { code, userId, clientId: integrationClientId, redirectUri } = options
  const { clientId: googleClientId, clientSecret: googleClientSecret } = resolveGoogleAdsOAuthCredentials()

  if (!googleClientId || !googleClientSecret) {
    throw new GoogleOAuthError('Google OAuth credentials are not configured')
  }

  // Exchange code for tokens
  let tokenResponse: GoogleTokenResponse
  try {
    tokenResponse = await exchangeGoogleCodeForTokens({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      redirectUri,
      code,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token exchange failed'
    console.error('[Google OAuth] Code exchange failed:', message)
    throw new GoogleOAuthError(`Failed to exchange authorization code: ${message}`)
  }

  if (!tokenResponse.access_token) {
    throw new GoogleOAuthError('No access token received from Google')
  }

  const existingIntegration = await getAdIntegration({
    userId,
    providerId: 'google',
    clientId: integrationClientId ?? null,
  })

  const developerTokenFromEnv = typeof process.env.GOOGLE_ADS_DEVELOPER_TOKEN === 'string'
    ? process.env.GOOGLE_ADS_DEVELOPER_TOKEN.trim()
    : ''
  const developerToken = developerTokenFromEnv || existingIntegration?.developerToken || null

  // Persist the tokens
  await persistIntegrationTokens({
    userId,
    providerId: 'google',
    clientId: integrationClientId ?? null,
    accessToken: tokenResponse.access_token,
    idToken: tokenResponse.id_token ?? null,
    refreshToken: tokenResponse.refresh_token ?? null,
    scopes: parseGoogleScopeList(tokenResponse.scope, [...GOOGLE_ADS_SCOPES]),
    accountId: existingIntegration?.accountId ?? null,
    accountName: existingIntegration?.accountName ?? null,
    developerToken,
    loginCustomerId: existingIntegration?.loginCustomerId ?? null,
    managerCustomerId: existingIntegration?.managerCustomerId ?? null,
    accessTokenExpiresAt: tokenResponse.expires_in
      ? new Date(Date.now() + tokenResponse.expires_in * 1000)
      : null,
  })

  console.log(`[Google OAuth] Successfully persisted integration for user ${userId}`)

  // Only auto-enqueue when reconnecting an already configured account.
  if (existingIntegration?.accountId) {
    await enqueueSyncJob({
      userId,
      providerId: 'google',
      jobType: 'initial-backfill',
      clientId: integrationClientId ?? null,
    })
  }
}

export async function completeGoogleAnalyticsOAuthFlow(options: {
  code: string
  userId: string
  clientId?: string | null
  redirectUri: string
}): Promise<void> {
  const { code, userId, clientId: integrationClientId, redirectUri } = options
  const { clientId: googleClientId, clientSecret: googleClientSecret } = resolveGoogleAnalyticsOAuthCredentials()

  if (!googleClientId || !googleClientSecret) {
    throw new GoogleOAuthError('Google Analytics OAuth credentials are not configured')
  }

  let tokenResponse: GoogleTokenResponse
  try {
    tokenResponse = await exchangeGoogleCodeForTokens({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      redirectUri,
      code,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token exchange failed'
    console.error('[Google Analytics OAuth] Code exchange failed:', message)
    throw new GoogleOAuthError(`Failed to exchange authorization code: ${message}`)
  }

  if (!tokenResponse.access_token) {
    throw new GoogleOAuthError('No access token received from Google Analytics OAuth')
  }

  const existingIntegration = await getGoogleAnalyticsIntegration({
    userId,
    clientId: integrationClientId ?? null,
  })

  await persistGoogleAnalyticsTokens({
    userId,
    clientId: integrationClientId ?? null,
    accessToken: tokenResponse.access_token,
    idToken: tokenResponse.id_token ?? null,
    refreshToken: tokenResponse.refresh_token ?? null,
    scopes: parseGoogleScopeList(tokenResponse.scope, [...GOOGLE_ANALYTICS_SCOPES]),
    accountId: existingIntegration?.accountId ?? null,
    accountName: existingIntegration?.accountName ?? null,
    accessTokenExpiresAt: tokenResponse.expires_in
      ? new Date(Date.now() + tokenResponse.expires_in * 1000)
      : null,
  })

  console.log(`[Google Analytics OAuth] Successfully persisted integration for user ${userId}`)

  if (existingIntegration?.accountId) {
    await enqueueSyncJob({
      userId,
      providerId: 'google-analytics',
      jobType: 'initial-backfill',
      clientId: integrationClientId ?? null,
    })
  }
}
