import { decrypt, encrypt, generateCodeVerifier } from '@/lib/crypto'
import { enqueueSyncJob, persistIntegrationTokens } from '@/lib/firestore/admin'
import { fetchTikTokAdAccounts, TikTokAdAccount } from '@/services/integrations/tiktok-ads'

const STATE_TTL_MS = 5 * 60 * 1000

interface TikTokOAuthContext {
  state: string
  clientId?: string | null
  redirect?: string
  codeVerifier?: string
  createdAt: number
}

type TikTokStatePayload = Omit<TikTokOAuthContext, 'createdAt'> & { createdAt?: number }

export function createTikTokOAuthState(payload: TikTokStatePayload): string {
  const data: TikTokOAuthContext = {
    ...payload,
    codeVerifier: payload.codeVerifier ?? generateCodeVerifier(),
    createdAt: payload.createdAt ?? Date.now(),
  }
  return encodeURIComponent(encrypt(JSON.stringify(data)))
}

export function validateTikTokOAuthState(state: string): TikTokOAuthContext {
  if (!state) {
    throw new Error('Missing OAuth state')
  }

  const decoded = decodeURIComponent(state)
  let parsed: TikTokOAuthContext

  try {
    parsed = JSON.parse(decrypt(decoded)) as TikTokOAuthContext
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

export interface TikTokTokenExchangeResult {
  accessToken: string
  refreshToken?: string | null
  expiresIn?: number | null
  refreshTokenExpiresIn?: number | null
  scopes?: string[]
  advertiserIds?: string[]
}

export async function exchangeTikTokCodeForToken(options: {
  clientKey: string
  clientSecret: string
  code: string
  redirectUri: string
}): Promise<TikTokTokenExchangeResult> {
  const { clientKey, clientSecret, code, redirectUri } = options

  if (!clientKey || !clientSecret) {
    throw new Error('TikTok client credentials are not configured')
  }

  const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: clientKey,
      secret: clientSecret,
      auth_code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    const errorPayload = await response.text()
    throw new Error(`TikTok token exchange failed (${response.status}): ${errorPayload}`)
  }

  const payload = (await response.json()) as {
    code?: number
    message?: string
    data?: {
      access_token?: string
      refresh_token?: string
      expires_in?: number
      refresh_token_expires_in?: number
      scope?: string | string[]
      advertiser_ids?: string[]
    }
  }

  if (payload.code && payload.code !== 0) {
    throw new Error(payload.message || `TikTok token exchange returned code ${payload.code}`)
  }

  const data = payload.data ?? {}

  if (!data.access_token) {
    throw new Error('TikTok token response missing access_token')
  }

  const scopesArray = Array.isArray(data.scope)
    ? data.scope
    : typeof data.scope === 'string'
      ? data.scope.split(',').map((scope) => scope.trim()).filter(Boolean)
      : []

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresIn: data.expires_in ?? null,
    refreshTokenExpiresIn: data.refresh_token_expires_in ?? null,
    scopes: scopesArray,
    advertiserIds: Array.isArray(data.advertiser_ids) ? data.advertiser_ids : undefined,
  }
}

function computeExpiryDate(seconds?: number | null): Date | null {
  if (!seconds || !Number.isFinite(seconds)) {
    return null
  }
  const durationMs = Math.max(0, seconds * 1000 - 30 * 1000)
  return new Date(Date.now() + durationMs)
}

export async function completeTikTokOAuthFlow(options: {
  code: string
  userId: string
  redirectUri: string
  clientId?: string | null
}): Promise<{ account: TikTokAdAccount | null }> {
  const { code, userId, redirectUri, clientId } = options

  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET

  if (!clientKey || !clientSecret) {
    throw new Error('TikTok OAuth credentials are not configured')
  }

  const tokenResult = await exchangeTikTokCodeForToken({
    clientKey,
    clientSecret,
    code,
    redirectUri,
  })

  const accessTokenExpiresAt = computeExpiryDate(tokenResult.expiresIn)
  const refreshTokenExpiresAt = computeExpiryDate(tokenResult.refreshTokenExpiresIn)

  let selectedAccount: TikTokAdAccount | null = null

  const advertiserIds = tokenResult.advertiserIds ?? []
  if (tokenResult.accessToken && advertiserIds.length > 0) {
    try {
      const accounts = await fetchTikTokAdAccounts({
        accessToken: tokenResult.accessToken,
        advertiserIds,
      })

      selectedAccount =
        accounts.find((account) => account.status?.toUpperCase() === 'ENABLE') ?? accounts[0] ?? null
    } catch (error) {
      console.error('[tiktok.oauth] failed to load advertiser accounts', error)
      selectedAccount = null
    }
  }

  await persistIntegrationTokens({
    userId,
    providerId: 'tiktok',
    clientId: clientId ?? null,
    accessToken: tokenResult.accessToken,
    refreshToken: tokenResult.refreshToken ?? null,
    scopes: tokenResult.scopes ?? [],
    accountId: selectedAccount?.id ?? null,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  })

  await enqueueSyncJob({ userId, providerId: 'tiktok', jobType: 'initial-backfill', clientId: clientId ?? null })

  return { account: selectedAccount }
}

export function buildTikTokOAuthUrl(options: {
  clientKey: string
  redirectUri: string
  state: string
  scopes?: string[]
}): string {
  const { clientKey, redirectUri, state, scopes } = options

  if (!clientKey) {
    throw new Error('TikTok client key is required')
  }

  if (!redirectUri) {
    throw new Error('TikTok redirect URI is required')
  }

  const scopeList = scopes && scopes.length > 0 ? scopes : getDefaultTikTokScopes()

  const params = new URLSearchParams({
    app_id: clientKey,
    redirect_uri: redirectUri,
    state,
    response_type: 'code',
    scope: scopeList.join(','),
  })

  return `https://ads.tiktok.com/marketing_api/auth?${params.toString()}`
}

function getDefaultTikTokScopes(): string[] {
  const envScopes = process.env.TIKTOK_OAUTH_SCOPES
  if (typeof envScopes === 'string' && envScopes.trim().length > 0) {
    return envScopes.split(',').map((scope) => scope.trim()).filter(Boolean)
  }
  return ['ad.manage', 'ad.read', 'report.advertiser']
}
