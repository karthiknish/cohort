import { Timestamp } from 'firebase/firestore'

import { getAdIntegration, updateIntegrationCredentials } from '@/lib/firestore-integrations-admin'

interface RefreshParams {
  userId: string
}

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const META_TOKEN_ENDPOINT = 'https://graph.facebook.com/v18.0/oauth/access_token'

function computeExpiry(expiresInSeconds?: number): Date | null {
  if (!expiresInSeconds || !Number.isFinite(expiresInSeconds)) {
    return null
  }
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000 - 30 * 1000)
  return expiresAt
}

export class IntegrationTokenError extends Error {
  userId?: string
  providerId?: string

  constructor(message: string, providerId?: string, userId?: string) {
    super(message)
    this.name = 'IntegrationTokenError'
    this.providerId = providerId
    this.userId = userId
  }
}

type AnyTimestamp = Timestamp | { toMillis: () => number } | { toDate: () => Date }

export function isTokenExpiringSoon(expiresAt?: AnyTimestamp | null | string, bufferMs = 5 * 60 * 1000): boolean {
  if (!expiresAt) return true

  let expiryMs: number | null = null

  if (expiresAt instanceof Timestamp) {
    expiryMs = expiresAt.toMillis()
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
  } else if (typeof expiresAt === 'string') {
    const parsed = Date.parse(expiresAt)
    expiryMs = Number.isNaN(parsed) ? null : parsed
  }

  if (!expiryMs) return true

  return Date.now() + bufferMs >= expiryMs
}

export async function refreshGoogleAccessToken({ userId }: RefreshParams): Promise<string> {
  const integration = await getAdIntegration({ userId, providerId: 'google' })

  if (!integration?.refreshToken) {
    throw new IntegrationTokenError('No Google Ads refresh token available', 'google', userId)
  }

  const clientId = process.env.GOOGLE_ADS_CLIENT_ID
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new IntegrationTokenError('Google Ads client credentials are not configured', 'google', userId)
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: integration.refreshToken,
  })

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const errorPayload = await response.text()
    throw new IntegrationTokenError(
      `Failed to refresh Google Ads token (${response.status}): ${errorPayload}`,
      'google',
      userId,
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
    accessToken: tokenPayload.access_token,
    accessTokenExpiresAt: expiresAt ?? undefined,
    refreshToken: tokenPayload.refresh_token ?? undefined,
    idToken: tokenPayload.id_token ?? undefined,
  })

  return tokenPayload.access_token
}

export async function refreshMetaAccessToken({ userId }: RefreshParams): Promise<string> {
  const integration = await getAdIntegration({ userId, providerId: 'facebook' })

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

  const response = await fetch(`${META_TOKEN_ENDPOINT}?${params.toString()}`)

  if (!response.ok) {
    const errorPayload = await response.text()
    throw new IntegrationTokenError(
      `Failed to refresh Meta Ads token (${response.status}): ${errorPayload}`,
      'facebook',
      userId,
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
    accessToken: tokenPayload.access_token,
    accessTokenExpiresAt: expiresAt ?? undefined,
  })

  return tokenPayload.access_token
}

export async function ensureGoogleAccessToken({ userId }: RefreshParams): Promise<string> {
  const integration = await getAdIntegration({ userId, providerId: 'google' })
  if (!integration?.accessToken) {
    throw new IntegrationTokenError('Google Ads integration missing access token', 'google', userId)
  }

  if (isTokenExpiringSoon(integration.accessTokenExpiresAt)) {
    return refreshGoogleAccessToken({ userId })
  }

  return integration.accessToken
}

export async function ensureMetaAccessToken({ userId }: RefreshParams): Promise<string> {
  const integration = await getAdIntegration({ userId, providerId: 'facebook' })
  if (!integration?.accessToken) {
    throw new IntegrationTokenError('Meta Ads integration missing access token', 'facebook', userId)
  }

  if (isTokenExpiringSoon(integration.accessTokenExpiresAt)) {
    return refreshMetaAccessToken({ userId })
  }

  return integration.accessToken
}
