import { decrypt, encrypt, generateCodeVerifier } from '@/lib/crypto'
import { persistIntegrationTokens, enqueueSyncJob } from '@/lib/firestore/admin'

// =============================================================================
// LINKEDIN OAUTH CONFIGURATION
// =============================================================================

const LINKEDIN_AUTH_ENDPOINT = 'https://www.linkedin.com/oauth/v2/authorization'
const LINKEDIN_TOKEN_ENDPOINT = 'https://www.linkedin.com/oauth/v2/accessToken'

// Required scopes for LinkedIn Ads API access
const LINKEDIN_ADS_SCOPES = [
  'r_ads',
  'r_ads_reporting',
  'r_organization_admin',
]

// =============================================================================
// TYPES
// =============================================================================

interface LinkedInOAuthContext {
  state: string
  redirect?: string
  clientId?: string | null
  codeVerifier?: string
  createdAt: number
}

interface BuildLinkedInAuthUrlOptions {
  clientId: string
  redirectUri: string
  state?: string
  scopes?: string[]
}

interface ExchangeCodeOptions {
  clientId: string
  clientSecret: string
  redirectUri: string
  code: string
}

interface LinkedInTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  refresh_token_expires_in?: number
  scope?: string
}

interface LinkedInErrorResponse {
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

export class LinkedInTokenExchangeError extends Error {
  readonly code?: string
  readonly description?: string

  constructor(options: {
    message: string
    code?: string
    description?: string
  }) {
    super(options.message)
    this.name = 'LinkedInTokenExchangeError'
    this.code = options.code
    this.description = options.description
  }
}

export class LinkedInOAuthError extends Error {
  readonly code?: string
  readonly isRetryable: boolean

  constructor(message: string, code?: string, isRetryable = false) {
    super(message)
    this.name = 'LinkedInOAuthError'
    this.code = code
    this.isRetryable = isRetryable
  }
}

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

type LinkedInOAuthStatePayload = Omit<LinkedInOAuthContext, 'createdAt'> & { createdAt?: number }

export function createLinkedInOAuthState(payload: LinkedInOAuthStatePayload): string {
  const data: LinkedInOAuthContext = {
    ...payload,
    codeVerifier: payload.codeVerifier ?? generateCodeVerifier(),
    createdAt: payload.createdAt ?? Date.now(),
  }
  return encodeURIComponent(encrypt(JSON.stringify(data)))
}

export function validateLinkedInOAuthState(state: string): LinkedInOAuthContext {
  if (!state) {
    throw new Error('Missing OAuth state')
  }

  const decoded = decodeURIComponent(state)
  let parsed: LinkedInOAuthContext
  try {
    parsed = JSON.parse(decrypt(decoded)) as LinkedInOAuthContext
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

export function buildLinkedInOAuthUrl(options: BuildLinkedInAuthUrlOptions): string {
  const {
    clientId,
    redirectUri,
    state,
    scopes = LINKEDIN_ADS_SCOPES,
  } = options

  if (!clientId) {
    throw new Error('LinkedIn client ID is required')
  }

  if (!redirectUri) {
    throw new Error('LinkedIn redirect URI is required')
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
  })

  if (state) {
    params.set('state', state)
  }

  return `${LINKEDIN_AUTH_ENDPOINT}?${params.toString()}`
}

// =============================================================================
// TOKEN EXCHANGE
// =============================================================================

export async function exchangeLinkedInCodeForTokens(
  options: ExchangeCodeOptions
): Promise<LinkedInTokenResponse> {
  const { clientId, clientSecret, redirectUri, code } = options

  if (!clientId || !clientSecret) {
    throw new LinkedInTokenExchangeError({
      message: 'LinkedIn OAuth credentials are required',
    })
  }

  if (!code) {
    throw new LinkedInTokenExchangeError({
      message: 'Authorization code is required',
    })
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  })

  let response: Response
  try {
    response = await fetch(LINKEDIN_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })
  } catch (networkError) {
    const message = networkError instanceof Error ? networkError.message : 'Network error'
    throw new LinkedInTokenExchangeError({
      message: `Network error during LinkedIn token exchange: ${message}`,
    })
  }

  const responseText = await response.text()
  let responseData: LinkedInTokenResponse | LinkedInErrorResponse

  try {
    responseData = JSON.parse(responseText) as LinkedInTokenResponse | LinkedInErrorResponse
  } catch {
    throw new LinkedInTokenExchangeError({
      message: `Invalid response from LinkedIn: ${responseText.substring(0, 200)}`,
    })
  }

  if (!response.ok) {
    const errorData = responseData as LinkedInErrorResponse
    throw new LinkedInTokenExchangeError({
      message: errorData?.error_description ?? `LinkedIn token exchange failed (${response.status})`,
      code: errorData?.error,
      description: errorData?.error_description,
    })
  }

  const tokenData = responseData as LinkedInTokenResponse

  if (!tokenData.access_token) {
    throw new LinkedInTokenExchangeError({
      message: 'LinkedIn token response missing access_token',
    })
  }

  return tokenData
}

// =============================================================================
// COMPLETE OAUTH FLOW
// =============================================================================

export async function completeLinkedInOAuthFlow(options: {
  code: string
  userId: string
  clientId?: string | null
  redirectUri: string
}): Promise<void> {
  const { code, userId, clientId: integrationClientId, redirectUri } = options
  const linkedInClientId = process.env.LINKEDIN_CLIENT_ID
  const linkedInClientSecret = process.env.LINKEDIN_CLIENT_SECRET

  if (!linkedInClientId || !linkedInClientSecret) {
    throw new LinkedInOAuthError('LinkedIn OAuth credentials are not configured')
  }

  // Exchange code for tokens
  let tokenResponse: LinkedInTokenResponse
  try {
    tokenResponse = await exchangeLinkedInCodeForTokens({
      clientId: linkedInClientId,
      clientSecret: linkedInClientSecret,
      redirectUri,
      code,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token exchange failed'
    console.error('[LinkedIn OAuth] Code exchange failed:', message)
    throw new LinkedInOAuthError(`Failed to exchange authorization code: ${message}`)
  }

  if (!tokenResponse.access_token) {
    throw new LinkedInOAuthError('No access token received from LinkedIn')
  }

  // Calculate token expiration (LinkedIn tokens typically expire in 60 days)
  const expiresAt = tokenResponse.expires_in
    ? new Date(Date.now() + tokenResponse.expires_in * 1000)
    : null

  // Calculate refresh token expiration (LinkedIn refresh tokens expire in 365 days)
  const refreshTokenExpiresAt = tokenResponse.refresh_token_expires_in
    ? new Date(Date.now() + tokenResponse.refresh_token_expires_in * 1000)
    : null

  // Persist the tokens
  await persistIntegrationTokens({
    userId,
    providerId: 'linkedin',
    clientId: integrationClientId ?? null,
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token ?? null,
    scopes: LINKEDIN_ADS_SCOPES,
    accessTokenExpiresAt: expiresAt,
    refreshTokenExpiresAt: refreshTokenExpiresAt,
  })

  console.log(`[LinkedIn OAuth] Successfully persisted integration for user ${userId}`)

  // Enqueue initial sync job
  await enqueueSyncJob({
    userId,
    providerId: 'linkedin',
    jobType: 'initial-backfill',
    clientId: integrationClientId ?? null,
  })
}
