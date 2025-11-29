import { createHmac } from 'node:crypto'

import { NormalizedMetric } from '@/types/integrations'

// =============================================================================
// META API ERROR CODES
// Reference: https://developers.facebook.com/docs/marketing-api/error-reference
// =============================================================================

export const META_ERROR_CODES = {
  // OAuth & Authentication
  OAUTH_EXCEPTION: 190,
  INVALID_ACCESS_TOKEN: 190,
  ACCESS_TOKEN_EXPIRED: 463,
  PASSWORD_CHANGED: 464,
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 4,
  TOO_MANY_CALLS: 17,
  USER_RATE_LIMIT: 17,
  APP_RATE_LIMIT: 4,
  ACCOUNT_RATE_LIMIT: 32,
  
  // Permission Errors
  PERMISSION_DENIED: 10,
  PERMISSION_ERROR: 200,
  UNSUPPORTED_GET_REQUEST: 100,
  
  // API Errors
  UNKNOWN_ERROR: 1,
  SERVICE_UNAVAILABLE: 2,
  METHOD_UNKNOWN: 3,
  APPLICATION_REQUEST_LIMIT: 4,
  TOO_MANY_DATA_REQUESTS: 613,
  
  // Business Errors
  AD_ACCOUNT_NOT_FOUND: 1487390,
  AD_ACCOUNT_ACCESS_DENIED: 275,
  CAMPAIGN_NOT_FOUND: 100,
  
  // Transient Errors
  TEMPORARY_ERROR: 2,
  ASYNC_JOB_UNKNOWN: 2601,
} as const

export type MetaErrorCode = (typeof META_ERROR_CODES)[keyof typeof META_ERROR_CODES]

// =============================================================================
// CUSTOM ERROR CLASS
// =============================================================================

export class MetaApiError extends Error {
  readonly code: number
  readonly subcode?: number
  readonly type?: string
  readonly fbTraceId?: string
  readonly isRetryable: boolean
  readonly isAuthError: boolean
  readonly isRateLimitError: boolean
  readonly retryAfterMs?: number

  constructor(options: {
    message: string
    code: number
    subcode?: number
    type?: string
    fbTraceId?: string
    retryAfterMs?: number
  }) {
    super(options.message)
    this.name = 'MetaApiError'
    this.code = options.code
    this.subcode = options.subcode
    this.type = options.type
    this.fbTraceId = options.fbTraceId
    this.retryAfterMs = options.retryAfterMs

    // Classify error type
    this.isAuthError = this.checkIsAuthError()
    this.isRateLimitError = this.checkIsRateLimitError()
    this.isRetryable = this.checkIsRetryable()
  }

  private checkIsAuthError(): boolean {
    const authCodes: number[] = [
      META_ERROR_CODES.OAUTH_EXCEPTION,
      META_ERROR_CODES.ACCESS_TOKEN_EXPIRED,
      META_ERROR_CODES.PASSWORD_CHANGED,
    ]
    return this.code !== undefined && authCodes.includes(this.code)
  }

  private checkIsRateLimitError(): boolean {
    const rateLimitCodes: number[] = [
      META_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      META_ERROR_CODES.TOO_MANY_CALLS,
      META_ERROR_CODES.ACCOUNT_RATE_LIMIT,
      META_ERROR_CODES.TOO_MANY_DATA_REQUESTS,
    ]
    return this.code !== undefined && rateLimitCodes.includes(this.code)
  }

  private checkIsRetryable(): boolean {
    // Rate limit errors are retryable after a delay
    if (this.isRateLimitError) return true
    
    // Temporary/service errors
    const retryableCodes: number[] = [
      META_ERROR_CODES.TEMPORARY_ERROR,
      META_ERROR_CODES.SERVICE_UNAVAILABLE,
      META_ERROR_CODES.UNKNOWN_ERROR,
    ]
    if (this.code !== undefined && retryableCodes.includes(this.code)) {
      return true
    }
    
    // Auth errors are NOT retryable without token refresh
    if (this.isAuthError) return false
    
    return false
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      subcode: this.subcode,
      type: this.type,
      fbTraceId: this.fbTraceId,
      isRetryable: this.isRetryable,
      isAuthError: this.isAuthError,
      isRateLimitError: this.isRateLimitError,
      retryAfterMs: this.retryAfterMs,
    }
  }
}

// =============================================================================
// TYPES
// =============================================================================

interface MetaAdsOptions {
  accessToken: string
  adAccountId: string
  timeframeDays: number
  maxPages?: number
  maxRetries?: number
  refreshAccessToken?: () => Promise<string>
  onRateLimitHit?: (retryAfterMs: number) => void
  onTokenRefresh?: () => void
}

interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  jitterFactor: number
}

type MetaInsightAction = {
  action_type?: string
  value?: unknown
}

type MetaInsightsRow = {
  date_start?: string
  date_stop?: string
  campaign_id?: string
  campaign_name?: string
  spend?: unknown
  impressions?: unknown
  clicks?: unknown
  actions?: MetaInsightAction[]
  action_values?: MetaInsightAction[]
}

type MetaApiErrorResponse = {
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
    fbtrace_id?: string
  }
}

type MetaInsightsResponse = {
  data?: MetaInsightsRow[]
  paging?: {
    cursors?: {
      before?: string
      after?: string
    }
    next?: string
  }
}

type MetaAdCreative = {
  id?: string
  name?: string
  thumbnail_url?: string
}

type MetaAdInsight = {
  actions?: MetaInsightAction[]
  action_values?: MetaInsightAction[]
  spend?: unknown
  impressions?: unknown
  clicks?: unknown
}

type MetaAdData = {
  id?: string
  name?: string
  status?: string
  effective_status?: string
  adcreatives?: {
    data?: MetaAdCreative[]
  }
  insights?: {
    data?: MetaAdInsight[]
  }
}

type MetaAdsListResponse = {
  data?: MetaAdData[]
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitterFactor: 0.3,
}

function buildTimeRange(timeframeDays: number) {
  const today = new Date()
  const since = new Date(today)
  since.setUTCDate(since.getUTCDate() - Math.max(timeframeDays - 1, 0))

  const format = (date: Date) => date.toISOString().slice(0, 10)

  return {
    since: format(since),
    until: format(today),
  }
}

type MetaPagingState = {
  after?: string
  next?: string
}

function coerceNumber(value: unknown): number {
  const parsed = typeof value === 'string' ? parseFloat(value) : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay with jitter
 * Uses decorrelated jitter for better distribution
 */
function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  rateLimitRetryAfter?: number
): number {
  // If rate limit provides specific retry-after, use it
  if (rateLimitRetryAfter && rateLimitRetryAfter > 0) {
    return Math.min(rateLimitRetryAfter, config.maxDelayMs)
  }

  // Exponential backoff: base * 2^attempt
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt)
  
  // Add jitter (randomization) to prevent thundering herd
  const jitter = exponentialDelay * config.jitterFactor * Math.random()
  
  // Cap at max delay
  return Math.min(exponentialDelay + jitter, config.maxDelayMs)
}

/**
 * Parse Meta API error response and create a typed error
 */
function parseMetaApiError(
  response: Response,
  payload: MetaApiErrorResponse | string
): MetaApiError {
  const errorData = typeof payload === 'string' 
    ? { error: { message: payload, code: response.status } }
    : payload

  const error = errorData?.error ?? {}
  
  // Check for Retry-After header (in seconds)
  const retryAfterHeader = response.headers.get('Retry-After')
  const retryAfterMs = retryAfterHeader 
    ? parseInt(retryAfterHeader, 10) * 1000 
    : undefined

  return new MetaApiError({
    message: error.message ?? `Meta API error (${response.status})`,
    code: error.code ?? response.status,
    subcode: error.error_subcode,
    type: error.type,
    fbTraceId: error.fbtrace_id,
    retryAfterMs,
  })
}

/**
 * Log Meta API request for debugging
 */
function logMetaApiRequest(context: {
  operation: string
  url: string
  attempt: number
  maxRetries: number
  duration?: number
  error?: MetaApiError | Error
  statusCode?: number
}) {
  const { operation, url, attempt, maxRetries, duration, error, statusCode } = context
  const urlObj = new URL(url)
  const sanitizedUrl = `${urlObj.origin}${urlObj.pathname}` // Remove query params with tokens

  if (error) {
    console.error(`[Meta API] ${operation} failed`, {
      url: sanitizedUrl,
      attempt: `${attempt + 1}/${maxRetries}`,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
      error: error instanceof MetaApiError ? error.toJSON() : { message: error.message },
    })
  } else {
    console.log(`[Meta API] ${operation} completed`, {
      url: sanitizedUrl,
      attempt: `${attempt + 1}/${maxRetries}`,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
    })
  }
}

// =============================================================================
// MAIN API: FETCH META ADS METRICS
// =============================================================================

export async function fetchMetaAdsMetrics(options: MetaAdsOptions): Promise<NormalizedMetric[]> {
  const { 
    accessToken, 
    adAccountId, 
    timeframeDays, 
    maxPages = 10, 
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    refreshAccessToken,
    onRateLimitHit,
    onTokenRefresh,
  } = options

  if (!accessToken) {
    throw new Error('Missing Meta access token')
  }

  if (!adAccountId) {
    throw new Error('Missing Meta ad account ID on integration')
  }

  const timeRange = buildTimeRange(timeframeDays)
  let paging: MetaPagingState | undefined
  let activeAccessToken = accessToken
  let tokenRefreshAttempted = false
  const metrics: NormalizedMetric[] = []
  const appSecret = process.env.META_APP_SECRET

  for (let page = 0; page < maxPages; page += 1) {
    const params = new URLSearchParams({
      level: 'campaign',
      fields: [
        'date_start',
        'date_stop',
        'campaign_id',
        'campaign_name',
        'impressions',
        'clicks',
        'spend',
        'actions',
        'action_values',
      ].join(','),
      time_range: JSON.stringify(timeRange),
      time_increment: '1',
      breakdowns: 'publisher_platform',
      limit: '500',
    })

    appendMetaAuthParams({ params, accessToken: activeAccessToken, appSecret })

    if (paging?.after) {
      params.set('after', paging.after)
    }

    const url = `https://graph.facebook.com/v18.0/${adAccountId}/insights?${params.toString()}`
    
    const { response, payload } = await executeMetaApiRequest<MetaInsightsResponse>({
      url,
      accessToken: activeAccessToken,
      operation: `fetchInsights:page${page}`,
      maxRetries,
      onAuthError: async () => {
        if (refreshAccessToken && !tokenRefreshAttempted) {
          tokenRefreshAttempted = true
          activeAccessToken = await refreshAccessToken()
          onTokenRefresh?.()
          return { retry: true, newToken: activeAccessToken }
        }
        return { retry: false }
      },
      onRateLimitHit,
    })

    if (!response.ok) {
      // This shouldn't happen as executeMetaApiRequest throws on non-ok responses
      // but adding for safety
      throw new Error(`Meta Ads API error (${response.status})`)
    }

    const rows: MetaInsightsRow[] = Array.isArray(payload?.data) ? payload.data : []

    const creativesMap = await fetchCampaignCreatives({
      accessToken: activeAccessToken,
      campaignIds: rows
        .map((row) => row?.campaign_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
      appSecret,
      maxRetries,
    })

    rows.forEach((row) => {
      const spend = coerceNumber(row?.spend)
      const impressions = coerceNumber(row?.impressions)
      const clicks = coerceNumber(row?.clicks)

      const actions = Array.isArray(row?.actions) ? row.actions : []
      const conversions = actions.reduce((acc: number, action) => {
        if (action?.action_type === 'offsite_conversion' || action?.action_type === 'purchase') {
          return acc + coerceNumber(action?.value)
        }
        return acc
      }, 0)

      const actionValues = Array.isArray(row?.action_values) ? row.action_values : []
      const revenue = actionValues.reduce((acc: number, action) => {
        if (action?.action_type === 'offsite_conversion.purchase' || action?.action_type === 'omni_purchase') {
          return acc + coerceNumber(action?.value)
        }
        return acc
      }, 0)

      const campaignId = typeof row?.campaign_id === 'string' && row.campaign_id.length > 0 ? row.campaign_id : undefined
      const campaignName = typeof row?.campaign_name === 'string' && row.campaign_name.length > 0 ? row.campaign_name : undefined
      const creatives = campaignId ? creativesMap.get(campaignId) : undefined

      metrics.push({
        providerId: 'facebook',
        date: row?.date_start ?? row?.date_stop ?? new Date().toISOString().slice(0, 10),
        spend,
        impressions,
        clicks,
        conversions,
        revenue,
        campaignId,
        campaignName,
        creatives,
        rawPayload: row,
      })
    })

    const nextCursor = payload?.paging?.cursors?.after ?? null
    const nextLink = payload?.paging?.next ?? null
    paging = nextCursor ? { after: nextCursor, next: nextLink ?? undefined } : undefined

    if (!paging?.after) {
      break
    }
  }

  return metrics
}

// =============================================================================
// EXECUTE META API REQUEST WITH RETRY LOGIC
// =============================================================================

interface ExecuteRequestOptions<T> {
  url: string
  accessToken: string
  operation: string
  maxRetries?: number
  method?: 'GET' | 'POST'
  body?: string
  onAuthError?: () => Promise<{ retry: boolean; newToken?: string }>
  onRateLimitHit?: (retryAfterMs: number) => void
}

async function executeMetaApiRequest<T>(
  options: ExecuteRequestOptions<T>
): Promise<{ response: Response; payload: T }> {
  const {
    url,
    accessToken,
    operation,
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    method = 'GET',
    body,
    onAuthError,
    onRateLimitHit,
  } = options

  let currentToken = accessToken
  let lastError: MetaApiError | Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const startTime = Date.now()
    let response: Response

    try {
      // Update URL with new token if refreshed
      const requestUrl = attempt > 0 && currentToken !== accessToken
        ? url.replace(encodeURIComponent(accessToken), encodeURIComponent(currentToken))
        : url

      response = await fetch(requestUrl, {
        method,
        headers: {
          Authorization: `Bearer ${currentToken}`,
          ...(body && { 'Content-Type': 'application/json' }),
        },
        ...(body && { body }),
      })
    } catch (networkError) {
      // Network-level errors (DNS, connection refused, etc.)
      lastError = networkError instanceof Error 
        ? networkError 
        : new Error('Network request failed')
      
      logMetaApiRequest({
        operation,
        url,
        attempt,
        maxRetries,
        duration: Date.now() - startTime,
        error: lastError,
      })

      if (attempt < maxRetries - 1) {
        const delay = calculateBackoffDelay(attempt)
        await sleep(delay)
        continue
      }
      throw lastError
    }

    const duration = Date.now() - startTime

    // Success case
    if (response.ok) {
      const payload = await response.json() as T
      logMetaApiRequest({
        operation,
        url,
        attempt,
        maxRetries,
        duration,
        statusCode: response.status,
      })
      return { response, payload }
    }

    // Error handling
    let errorPayload: MetaApiErrorResponse
    try {
      errorPayload = await response.json() as MetaApiErrorResponse
    } catch {
      errorPayload = { error: { message: await response.text(), code: response.status } }
    }

    const metaError = parseMetaApiError(response, errorPayload)
    lastError = metaError

    logMetaApiRequest({
      operation,
      url,
      attempt,
      maxRetries,
      duration,
      statusCode: response.status,
      error: metaError,
    })

    // Handle auth errors - try token refresh
    if (metaError.isAuthError && onAuthError) {
      const result = await onAuthError()
      if (result.retry && result.newToken) {
        currentToken = result.newToken
        // Reset attempt counter after successful token refresh
        attempt = -1 // Will become 0 on next iteration
        continue
      }
      // If no refresh available or failed, throw immediately
      throw metaError
    }

    // Handle rate limits
    if (metaError.isRateLimitError) {
      const retryAfterMs = metaError.retryAfterMs ?? calculateBackoffDelay(attempt)
      onRateLimitHit?.(retryAfterMs)
      
      if (attempt < maxRetries - 1) {
        console.warn(`[Meta API] Rate limited, waiting ${retryAfterMs}ms before retry`)
        await sleep(retryAfterMs)
        continue
      }
      throw metaError
    }

    // Handle other retryable errors (5xx, network issues)
    if ((metaError.isRetryable || isRetryableStatus(response.status)) && attempt < maxRetries - 1) {
      const delay = calculateBackoffDelay(attempt)
      await sleep(delay)
      continue
    }

    // Non-retryable error or exhausted retries
    throw metaError
  }

  // Should never reach here, but just in case
  throw lastError ?? new Error('Meta API request failed after all retries')
}

// =============================================================================
// FETCH CAMPAIGN CREATIVES
// =============================================================================

async function fetchCampaignCreatives(options: {
  accessToken: string
  campaignIds: string[]
  appSecret?: string | null
  maxRetries?: number
}): Promise<Map<string, NormalizedMetric['creatives']>> {
  const { accessToken, campaignIds, appSecret, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries } = options
  const creativeMap = new Map<string, NormalizedMetric['creatives']>()

  if (!campaignIds.length) {
    return creativeMap
  }

  // Meta recommends batching via async job, but for simplicity we page small sets of creative stats per campaign
  // Limit concurrent requests to avoid rate limiting
  const CONCURRENT_LIMIT = 5
  const uniqueCampaignIds = [...new Set(campaignIds)].slice(0, 20)
  
  for (let i = 0; i < uniqueCampaignIds.length; i += CONCURRENT_LIMIT) {
    const batch = uniqueCampaignIds.slice(i, i + CONCURRENT_LIMIT)
    
    await Promise.all(
      batch.map(async (campaignId) => {
        if (!campaignId) return
        try {
          const timeRange = buildTimeRange(30)
          const timeRangeLiteral = `{"since":"${timeRange.since}","until":"${timeRange.until}"}`
          const params = new URLSearchParams()
          params.set(
            'fields',
            [
              'name',
              'objective',
              'status',
              `ads{adcreatives{name,object_story_spec},insights.time_range(${timeRangeLiteral}){spend,impressions,clicks,actions,action_values}}`,
            ].join(',')
          )
          params.set('limit', '25')

          appendMetaAuthParams({ params, accessToken, appSecret })

          const url = `https://graph.facebook.com/v18.0/${campaignId}/ads?${params.toString()}`
          
          const { payload } = await executeMetaApiRequest<MetaAdsListResponse>({
            url,
            accessToken,
            operation: `fetchCreatives:${campaignId}`,
            maxRetries: Math.min(maxRetries, 2), // Fewer retries for creatives to avoid blocking
          })

          const ads: MetaAdData[] = Array.isArray(payload?.data) ? payload.data : []
          const creatives: NonNullable<NormalizedMetric['creatives']> = []

          ads.forEach((ad) => {
            const adCreative = Array.isArray(ad?.adcreatives?.data) ? ad.adcreatives?.data[0] : undefined
            const insight = Array.isArray(ad?.insights?.data) ? ad.insights.data[0] : undefined

            if (!adCreative && !insight) {
              return
            }

            const actions = Array.isArray(insight?.actions) ? insight.actions : []
            const actionValues = Array.isArray(insight?.action_values) ? insight.action_values : []

            const conversions = actions.reduce((acc: number, action) => {
              if (typeof action?.action_type === 'string' && (action.action_type.includes('purchase') || action.action_type === 'offsite_conversion')) {
                return acc + coerceNumber(action?.value)
              }
              return acc
            }, 0)

            const revenue = actionValues.reduce((acc: number, action) => {
              if (typeof action?.action_type === 'string' && action.action_type.includes('purchase')) {
                return acc + coerceNumber(action?.value)
              }
              return acc
            }, 0)

            creatives.push({
              id: adCreative?.id ?? ad?.id ?? `${campaignId}-${creatives.length}`,
              name: adCreative?.name || ad?.name || 'Meta ad creative',
              type: ad?.status || ad?.effective_status || 'active',
              url: adCreative?.thumbnail_url,
              spend: insight ? coerceNumber(insight.spend) : undefined,
              impressions: insight ? coerceNumber(insight.impressions) : undefined,
              clicks: insight ? coerceNumber(insight.clicks) : undefined,
              conversions,
              revenue,
            })
          })

          if (creatives.length) {
            creativeMap.set(campaignId, creatives)
          }
        } catch (error) {
          // Log but don't fail the entire operation for creative fetch failures
          console.error(`[Meta API] Error fetching creatives for campaign ${campaignId}:`, 
            error instanceof MetaApiError ? error.toJSON() : error
          )
        }
      })
    )
    
    // Small delay between batches to be respectful of rate limits
    if (i + CONCURRENT_LIMIT < uniqueCampaignIds.length) {
      await sleep(100)
    }
  }

  return creativeMap
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function appendMetaAuthParams(options: { params: URLSearchParams; accessToken: string; appSecret?: string | null }) {
  const { params, accessToken, appSecret } = options
  params.set('access_token', accessToken)

  if (!appSecret) {
    return
  }

  try {
    const proof = createHmac('sha256', appSecret).update(accessToken).digest('hex')
    params.set('appsecret_proof', proof)
  } catch (error) {
    console.warn('[Meta API] Failed to compute appsecret_proof', error)
  }
}

// =============================================================================
// FETCH META AD ACCOUNTS
// =============================================================================

export type MetaAdAccount = {
  id: string
  name: string
  account_status?: number
  currency?: string
}

export async function fetchMetaAdAccounts(options: {
  accessToken: string
  appSecret?: string | null
  limit?: number
  maxRetries?: number
}): Promise<MetaAdAccount[]> {
  const { 
    accessToken, 
    appSecret = process.env.META_APP_SECRET, 
    limit = 25,
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
  } = options

  if (!accessToken) {
    throw new Error('Missing Meta access token')
  }

  const params = new URLSearchParams({
    fields: ['id', 'name', 'account_status', 'currency'].join(','),
    limit: String(limit),
  })

  appendMetaAuthParams({ params, accessToken, appSecret })

  const url = `https://graph.facebook.com/v18.0/me/adaccounts?${params.toString()}`
  
  const { payload } = await executeMetaApiRequest<{
    data?: Array<{
      id?: unknown
      name?: unknown
      account_status?: unknown
      currency?: unknown
    }>
  }>({
    url,
    accessToken,
    operation: 'fetchAdAccounts',
    maxRetries,
  })

  const accounts = Array.isArray(payload?.data) ? payload.data : []

  return (accounts ?? [])
    .map((candidate): MetaAdAccount | null => {
      const id = typeof candidate?.id === 'string' ? candidate.id : null
      const name = typeof candidate?.name === 'string' ? candidate.name : 'Meta ad account'
      const accountStatusRaw = candidate?.account_status
      const accountStatus = typeof accountStatusRaw === 'number' ? accountStatusRaw : Number(accountStatusRaw)
      const currency = typeof candidate?.currency === 'string' ? candidate.currency : undefined

      if (!id) {
        return null
      }

      return {
        id,
        name,
        account_status: Number.isFinite(accountStatus) ? Number(accountStatus) : undefined,
        currency,
      } satisfies MetaAdAccount
    })
    .filter((account): account is MetaAdAccount => Boolean(account))
}

// =============================================================================
// HEALTH CHECK FOR META INTEGRATION
// =============================================================================

export async function checkMetaIntegrationHealth(options: {
  accessToken: string
  adAccountId?: string
}): Promise<{
  healthy: boolean
  tokenValid: boolean
  accountAccessible: boolean
  error?: string
}> {
  const { accessToken, adAccountId } = options
  
  try {
    // First check if token is valid by fetching user info
    const userParams = new URLSearchParams({
      fields: 'id,name',
      access_token: accessToken,
    })
    
    const userUrl = `https://graph.facebook.com/v18.0/me?${userParams.toString()}`
    const userResponse = await fetch(userUrl)
    
    if (!userResponse.ok) {
      const errorData = await userResponse.json() as MetaApiErrorResponse
      return {
        healthy: false,
        tokenValid: false,
        accountAccessible: false,
        error: errorData?.error?.message ?? 'Token validation failed',
      }
    }
    
    // If we have an ad account ID, check if it's accessible
    if (adAccountId) {
      const accountParams = new URLSearchParams({
        fields: 'id,account_status',
        access_token: accessToken,
      })
      
      const accountUrl = `https://graph.facebook.com/v18.0/${adAccountId}?${accountParams.toString()}`
      const accountResponse = await fetch(accountUrl)
      
      if (!accountResponse.ok) {
        const errorData = await accountResponse.json() as MetaApiErrorResponse
        return {
          healthy: false,
          tokenValid: true,
          accountAccessible: false,
          error: errorData?.error?.message ?? 'Ad account not accessible',
        }
      }
    }
    
    return {
      healthy: true,
      tokenValid: true,
      accountAccessible: true,
    }
  } catch (error) {
    return {
      healthy: false,
      tokenValid: false,
      accountAccessible: false,
      error: error instanceof Error ? error.message : 'Health check failed',
    }
  }
}
