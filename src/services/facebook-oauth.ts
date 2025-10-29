import { URLSearchParams } from 'node:url'

interface BuildMetaAuthUrlOptions {
  businessConfigId: string
  appId: string
  redirectUri: string
  state?: string
  scopes?: string[]
}

const DEFAULT_SCOPES = ['ads_management', 'ads_read', 'business_management']

export function buildMetaBusinessLoginUrl(options: BuildMetaAuthUrlOptions): string {
  const { businessConfigId, appId, redirectUri, state, scopes = DEFAULT_SCOPES } = options

  if (!businessConfigId) {
    throw new Error('Meta business configuration ID is required')
  }

  if (!appId) {
    throw new Error('Meta app ID is required')
  }

  if (!redirectUri) {
    throw new Error('Meta redirect URI is required')
  }

  const params = new URLSearchParams({
    business_config_id: businessConfigId,
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(','),
  })

  if (state) {
    params.set('state', state)
  }

  return `https://business.facebook.com/login/connect/authorize?${params.toString()}`
}

interface ExchangeCodeOptions {
  appId: string
  appSecret: string
  redirectUri: string
  code: string
}

export async function exchangeMetaCodeForToken(options: ExchangeCodeOptions): Promise<{
  access_token: string
  token_type?: string
  expires_in?: number
}> {
  const { appId, appSecret, redirectUri, code } = options

  if (!appId || !appSecret) {
    throw new Error('Meta app credentials are required to exchange the code')
  }

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  })

  const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`)

  if (!response.ok) {
    const errorPayload = await response.text()
    throw new Error(`Meta token exchange failed (${response.status}): ${errorPayload}`)
  }

  return (await response.json()) as {
    access_token: string
    token_type?: string
    expires_in?: number
  }
}
