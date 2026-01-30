import { URLSearchParams } from 'node:url'

import { logger } from '@/lib/logger'

interface BuildMetaAuthUrlOptions {
  businessConfigId: string
  appId: string
  redirectUri: string
  state?: string
  scopes?: string[]
}

const DEFAULT_SCOPES = ['ads_management', 'ads_read', 'business_management']

// Meta Graph API version - updated to v24.0 (latest as of January 2026)
// Changelog: https://developers.facebook.com/docs/graph-api/changelog/
const META_GRAPH_API_VERSION = 'v24.0'

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
    // Meta Business Login expects a configuration id parameter.
    // Using the legacy /login/connect/authorize endpoint can lead to "This page isn't available".
    config_id: businessConfigId,
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(','),
  })

  if (state) {
    params.set('state', state)
  }

  const finalUrl = `https://www.facebook.com/${META_GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`

  // Debug: Log all OAuth parameters (sanitized)
  logger.debug('[Meta OAuth] Generated login URL', {
    config_id: businessConfigId,
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scopes: scopes.join(','),
    state_present: !!state,
    api_version: META_GRAPH_API_VERSION,
  })

  return finalUrl
}

interface ExchangeCodeOptions {
  appId: string
  appSecret: string
  redirectUri: string
  code: string
}

interface MetaTokenResponse {
  access_token: string
  token_type?: string
  expires_in?: number
}

interface MetaErrorResponse {
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
    fbtrace_id?: string
  }
}

export class MetaTokenExchangeError extends Error {
  readonly code?: number
  readonly subcode?: number
  readonly type?: string
  readonly fbTraceId?: string

  constructor(options: {
    message: string
    code?: number
    subcode?: number
    type?: string
    fbTraceId?: string
  }) {
    super(options.message)
    this.name = 'MetaTokenExchangeError'
    this.code = options.code
    this.subcode = options.subcode
    this.type = options.type
    this.fbTraceId = options.fbTraceId
  }
}

export async function exchangeMetaCodeForToken(options: ExchangeCodeOptions): Promise<MetaTokenResponse> {
  const { appId, appSecret, redirectUri, code } = options

  logger.info('[Meta OAuth] Starting code exchange', { apiVersion: META_GRAPH_API_VERSION })

  if (!appId || !appSecret) {
    logger.error('[Meta OAuth] Missing app credentials')
    throw new MetaTokenExchangeError({
      message: 'Meta app credentials are required to exchange the code'
    })
  }

  if (!code) {
    logger.error('[Meta OAuth] Missing authorization code')
    throw new MetaTokenExchangeError({
      message: 'Authorization code is required'
    })
  }

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  })

  const url = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/oauth/access_token?${params.toString()}`

  logger.debug('[Meta OAuth] Token exchange request', { 
    apiVersion: META_GRAPH_API_VERSION,
    redirectUri 
  })

  let response: Response
  try {
    response = await fetch(url)
  } catch (networkError) {
    const message = networkError instanceof Error ? networkError.message : 'Network error'
    logger.error('[Meta OAuth] Network error during token exchange', { error: message })
    throw new MetaTokenExchangeError({
      message: `Network error during Meta token exchange: ${message}`
    })
  }

  const responseText = await response.text()
  let responseData: MetaTokenResponse | MetaErrorResponse

  try {
    responseData = JSON.parse(responseText) as MetaTokenResponse | MetaErrorResponse
  } catch {
    throw new MetaTokenExchangeError({
      message: `Invalid response from Meta: ${responseText.substring(0, 200)}`
    })
  }

  if (!response.ok) {
    const errorData = responseData as MetaErrorResponse
    const error = errorData?.error ?? {}

    throw new MetaTokenExchangeError({
      message: error.message ?? `Meta token exchange failed (${response.status})`,
      code: error.code ?? response.status,
      subcode: error.error_subcode,
      type: error.type,
      fbTraceId: error.fbtrace_id,
    })
  }

  const tokenData = responseData as MetaTokenResponse

  if (!tokenData.access_token) {
    logger.error('[Meta OAuth] Token response missing access_token')
    throw new MetaTokenExchangeError({
      message: 'Meta token response missing access_token'
    })
  }

  logger.info('[Meta OAuth] Token exchange successful', { 
    hasToken: true,
    expiresIn: tokenData.expires_in,
    tokenType: tokenData.token_type 
  })

  return tokenData
}
