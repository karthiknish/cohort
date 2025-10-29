import { decrypt, encrypt } from '@/lib/crypto'
import { persistIntegrationTokens, enqueueSyncJob } from '@/lib/firestore-integrations-admin'
import { exchangeMetaCodeForToken } from '@/services/facebook-oauth'

interface MetaOAuthContext {
  state: string
  redirect?: string
  createdAt: number
}

const STATE_TTL_MS = 5 * 60 * 1000

type MetaOAuthStatePayload = Omit<MetaOAuthContext, 'createdAt'> & { createdAt?: number }

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

export async function completeMetaOAuthFlow(options: {
  code: string
  userId: string
  redirectUri: string
}): Promise<void> {
  const { code, userId, redirectUri } = options
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error('Meta app credentials are not configured')
  }

  const tokenResponse = await exchangeMetaCodeForToken({
    appId,
    appSecret,
    redirectUri,
    code,
  })

  const longLived = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(
      appId,
    )}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(tokenResponse.access_token)}`,
  )

  if (!longLived.ok) {
    const errorPayload = await longLived.text()
    throw new Error(`Failed to extend Meta access token (${longLived.status}): ${errorPayload}`)
  }

  const extended = (await longLived.json()) as { access_token?: string; expires_in?: number }
  const accessToken = extended.access_token ?? tokenResponse.access_token

  await persistIntegrationTokens({
    userId,
    providerId: 'facebook',
    accessToken,
    scopes: ['ads_management', 'ads_read', 'business_management'],
    accessTokenExpiresAt: extended.expires_in ? new Date(Date.now() + extended.expires_in * 1000) : null,
  })

  await enqueueSyncJob({ userId, providerId: 'facebook', jobType: 'initial-backfill' })
}
