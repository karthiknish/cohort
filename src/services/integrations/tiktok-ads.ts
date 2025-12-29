import { formatDate } from '@/lib/dates'
import { coerceNumber as coerceNumberNullable } from '@/lib/utils'
import { NormalizedMetric } from '@/types/integrations'

// =============================================================================
// TIKTOK ADS API ERROR CODES
// Reference: https://business-api.tiktok.com/portal/docs?id=1737172488964097
// =============================================================================

export const TIKTOK_ERROR_CODES = {
  // Success
  OK: 0,
  
  // Authentication Errors
  UNAUTHORIZED: 40001,
  ACCESS_TOKEN_INVALID: 40002,
  ACCESS_TOKEN_EXPIRED: 40003,
  TOKEN_REVOKED: 40004,
  PERMISSION_DENIED: 40100,
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 40100,
  QPS_LIMIT: 40101,
  DAILY_LIMIT: 40102,
  
  // Request Errors
  INVALID_PARAMS: 40000,
  RESOURCE_NOT_FOUND: 40400,
  METHOD_NOT_ALLOWED: 40500,
  
  // Server Errors
  INTERNAL_ERROR: 50000,
  SERVICE_UNAVAILABLE: 50300,
  GATEWAY_TIMEOUT: 50400,
  
  // Business Errors
  ADVERTISER_NOT_FOUND: 40401,
  CAMPAIGN_NOT_FOUND: 40402,
  INSUFFICIENT_BALANCE: 40301,
} as const

export type TikTokErrorCode = (typeof TIKTOK_ERROR_CODES)[keyof typeof TIKTOK_ERROR_CODES]

// =============================================================================
// CUSTOM ERROR CLASS
// =============================================================================

interface TikTokApiErrorResponse {
  code?: number
  message?: string
  request_id?: string
  data?: unknown
}

export class TikTokApiError extends Error {
  readonly httpStatus: number
  readonly errorCode: number
  readonly requestId?: string
  readonly isRetryable: boolean
  readonly isAuthError: boolean
  readonly isRateLimitError: boolean
  readonly retryAfterMs?: number

  constructor(options: {
    message: string
    httpStatus: number
    errorCode: number
    requestId?: string
    retryAfterMs?: number
  }) {
    super(options.message)
    this.name = 'TikTokApiError'
    this.httpStatus = options.httpStatus
    this.errorCode = options.errorCode
    this.requestId = options.requestId
    this.retryAfterMs = options.retryAfterMs

    // Classify error type
    this.isAuthError = this.checkIsAuthError()
    this.isRateLimitError = this.checkIsRateLimitError()
    this.isRetryable = this.checkIsRetryable()
  }

  private checkIsAuthError(): boolean {
    const authErrors: number[] = [
      TIKTOK_ERROR_CODES.UNAUTHORIZED,
      TIKTOK_ERROR_CODES.ACCESS_TOKEN_INVALID,
      TIKTOK_ERROR_CODES.ACCESS_TOKEN_EXPIRED,
      TIKTOK_ERROR_CODES.TOKEN_REVOKED,
    ]
    return this.httpStatus === 401 || 
           this.httpStatus === 403 || 
           (this.errorCode !== undefined && authErrors.includes(this.errorCode))
  }

  private checkIsRateLimitError(): boolean {
    const rateLimitErrors: number[] = [
      TIKTOK_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      TIKTOK_ERROR_CODES.QPS_LIMIT,
      TIKTOK_ERROR_CODES.DAILY_LIMIT,
    ]
    return this.httpStatus === 429 || 
           (this.errorCode !== undefined && rateLimitErrors.includes(this.errorCode))
  }

  private checkIsRetryable(): boolean {
    // Rate limit errors are retryable after a delay
    if (this.isRateLimitError) return true
    
    // Server errors (5xx) are generally retryable
    if (this.httpStatus >= 500 && this.httpStatus < 600) return true
    
    // TikTok specific server errors
    const serverErrors: number[] = [
      TIKTOK_ERROR_CODES.INTERNAL_ERROR,
      TIKTOK_ERROR_CODES.SERVICE_UNAVAILABLE,
      TIKTOK_ERROR_CODES.GATEWAY_TIMEOUT,
    ]
    if (this.errorCode !== undefined && serverErrors.includes(this.errorCode)) return true
    
    // Auth errors are NOT retryable without token refresh
    if (this.isAuthError) return false
    
    return false
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      httpStatus: this.httpStatus,
      errorCode: this.errorCode,
      requestId: this.requestId,
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

export interface TikTokAdAccount {
  id: string
  name: string
  status?: string
  currency?: string
  timezone?: string
}

interface TikTokMetricsOptions {
  accessToken: string
  advertiserId: string
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

type TikTokReportRow = {
  metrics?: Record<string, unknown>
  dimensions?: Record<string, unknown>
}

type TikTokReportResponse = {
  code?: number
  message?: string
  request_id?: string
  data?: {
    list?: TikTokReportRow[]
    page_info?: {
      page?: number
      page_size?: number
      total_number?: number
      total_page?: number
      has_more?: boolean
    }
    cursor?: string
  }
}

// =============================================================================
// RETRY CONFIGURATION
// =============================================================================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitterFactor: 0.3,
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const coerceNumber = (value: unknown): number => coerceNumberNullable(value) ?? 0

function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay with jitter
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
 * Parse TikTok API error response and create a typed error
 */
function parseTikTokApiError(
  response: Response,
  payload: TikTokApiErrorResponse
): TikTokApiError {
  // Check for Retry-After header (in seconds)
  const retryAfterHeader = response.headers.get('Retry-After')
  const retryAfterMs = retryAfterHeader 
    ? parseInt(retryAfterHeader, 10) * 1000 
    : undefined

  return new TikTokApiError({
    message: payload?.message ?? `TikTok API error (${response.status})`,
    httpStatus: response.status,
    errorCode: payload?.code ?? response.status,
    requestId: payload?.request_id,
    retryAfterMs,
  })
}

/**
 * Log TikTok API request for debugging
 */
function logTikTokApiRequest(context: {
  operation: string
  advertiserId?: string
  attempt: number
  maxRetries: number
  duration?: number
  error?: TikTokApiError | Error
  statusCode?: number
  requestId?: string
}) {
  const { operation, advertiserId, attempt, maxRetries, duration, error, statusCode, requestId } = context

  if (error) {
    console.error(`[TikTok API] ${operation} failed`, {
      advertiserId,
      attempt: `${attempt + 1}/${maxRetries}`,
      statusCode,
      requestId,
      duration: duration ? `${duration}ms` : undefined,
      error: error instanceof TikTokApiError ? error.toJSON() : { message: error.message },
    })
  } else {
    console.log(`[TikTok API] ${operation} completed`, {
      advertiserId,
      attempt: `${attempt + 1}/${maxRetries}`,
      statusCode,
      requestId,
      duration: duration ? `${duration}ms` : undefined,
    })
  }
}

// =============================================================================
// EXECUTE TIKTOK API REQUEST WITH RETRY LOGIC
// =============================================================================

interface ExecuteRequestOptions<T> {
  url: string
  method?: 'GET' | 'POST'
  headers: Record<string, string>
  body?: string
  operation: string
  advertiserId?: string
  maxRetries?: number
  onAuthError?: () => Promise<{ retry: boolean; newToken?: string }>
  onRateLimitHit?: (retryAfterMs: number) => void
}

async function executeTikTokApiRequest<T extends TikTokApiErrorResponse>(
  options: ExecuteRequestOptions<T>
): Promise<{ response: Response; payload: T }> {
  const {
    url,
    method = 'POST',
    headers: initialHeaders,
    body,
    operation,
    advertiserId,
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    onAuthError,
    onRateLimitHit,
  } = options

  let headers = { ...initialHeaders }
  let lastError: TikTokApiError | Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const startTime = Date.now()
    let response: Response

    try {
      response = await fetch(url, {
        method,
        headers,
        ...(body && { body }),
      })
    } catch (networkError) {
      // Network-level errors (DNS, connection refused, etc.)
      lastError = networkError instanceof Error 
        ? networkError 
        : new Error('Network request failed')
      
      logTikTokApiRequest({
        operation,
        advertiserId,
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

    // Parse response
    let payload: T
    try {
      payload = await response.json() as T
    } catch {
      payload = { code: response.status, message: await response.text() } as T
    }

    // TikTok returns 200 even for errors, check the code field
    const isSuccess = response.ok && (!payload.code || payload.code === 0)

    if (isSuccess) {
      logTikTokApiRequest({
        operation,
        advertiserId,
        attempt,
        maxRetries,
        duration,
        statusCode: response.status,
        requestId: payload.request_id,
      })
      return { response, payload }
    }

    // Error handling
    const tiktokError = parseTikTokApiError(response, payload)
    lastError = tiktokError

    logTikTokApiRequest({
      operation,
      advertiserId,
      attempt,
      maxRetries,
      duration,
      statusCode: response.status,
      requestId: payload.request_id,
      error: tiktokError,
    })

    // Handle auth errors - try token refresh
    if (tiktokError.isAuthError && onAuthError) {
      const result = await onAuthError()
      if (result.retry && result.newToken) {
        headers = { ...headers, 'Access-Token': result.newToken }
        // Reset attempt counter after successful token refresh
        attempt = -1 // Will become 0 on next iteration
        continue
      }
      // If no refresh available or failed, throw immediately
      throw tiktokError
    }

    // Handle rate limits
    if (tiktokError.isRateLimitError) {
      // TikTok has daily limits, use longer backoff
      const retryAfterMs = tiktokError.retryAfterMs ?? calculateBackoffDelay(attempt) * 2
      onRateLimitHit?.(retryAfterMs)
      
      if (attempt < maxRetries - 1) {
        console.warn(`[TikTok API] Rate limited, waiting ${retryAfterMs}ms before retry`)
        await sleep(retryAfterMs)
        continue
      }
      throw tiktokError
    }

    // Handle other retryable errors (5xx, transient)
    if ((tiktokError.isRetryable || isRetryableStatus(response.status)) && attempt < maxRetries - 1) {
      const delay = calculateBackoffDelay(attempt)
      await sleep(delay)
      continue
    }

    // Non-retryable error or exhausted retries
    throw tiktokError
  }

  // Should never reach here, but just in case
  throw lastError ?? new Error('TikTok API request failed after all retries')
}

// =============================================================================
// FETCH TIKTOK AD ACCOUNTS
// =============================================================================

export async function fetchTikTokAdAccounts(options: {
  accessToken: string
  advertiserIds?: string[]
  maxRetries?: number
}): Promise<TikTokAdAccount[]> {
  const { accessToken, advertiserIds, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries } = options

  if (!accessToken) {
    throw new Error('TikTok access token is required to load advertisers')
  }

  const url = 'https://business-api.tiktok.com/open_api/v1.3/advertiser/info/'
  
  const { payload } = await executeTikTokApiRequest<{
    code?: number
    message?: string
    request_id?: string
    data?: {
      list?: Array<{
        advertiser_id?: string
        name?: string
        status?: string
        currency?: string
        timezone?: string
      }>
    }
  }>({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': accessToken,
    },
    body: JSON.stringify({
      advertiser_ids: advertiserIds,
      page_size: 50,
    }),
    operation: 'fetchAdAccounts',
    maxRetries,
  })

  const list = Array.isArray(payload?.data?.list) ? payload.data?.list ?? [] : []

  const accounts = list
    .map((candidate): TikTokAdAccount | null => {
      const id = typeof candidate?.advertiser_id === 'string' ? candidate.advertiser_id : null
      if (!id) return null
      return {
        id,
        name: typeof candidate?.name === 'string' && candidate.name.length > 0 ? candidate.name : `TikTok advertiser ${id}`,
        status: typeof candidate?.status === 'string' ? candidate.status : undefined,
        currency: typeof candidate?.currency === 'string' ? candidate.currency : undefined,
        timezone: typeof candidate?.timezone === 'string' ? candidate.timezone : undefined,
      }
    })
    .filter((account): account is TikTokAdAccount => Boolean(account))

  if (!accounts.length && Array.isArray(advertiserIds)) {
    return advertiserIds
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
      .map((id) => ({ id, name: `TikTok advertiser ${id}` }))
  }

  return accounts
}

// =============================================================================
// MAIN API: FETCH TIKTOK ADS METRICS
// =============================================================================

export async function fetchTikTokAdsMetrics(options: TikTokMetricsOptions): Promise<NormalizedMetric[]> {
  const { 
    accessToken, 
    advertiserId, 
    timeframeDays, 
    maxPages = 20, 
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    refreshAccessToken,
    onRateLimitHit,
    onTokenRefresh,
  } = options

  if (!accessToken) {
    throw new Error('TikTok access token is required to fetch metrics')
  }

  if (!advertiserId) {
    throw new Error('TikTok advertiser ID is required')
  }

  const metrics: NormalizedMetric[] = []
  const today = new Date()
  const start = new Date(today)
  start.setUTCDate(start.getUTCDate() - Math.max(0, timeframeDays - 1))

  let cursor: string | undefined
  let page = 0
  let activeToken = accessToken
  let tokenRefreshAttempted = false

  while (page < maxPages) {
    page += 1

    const requestPayload = {
      advertiser_id: advertiserId,
      data_level: 'AUCTION_CAMPAIGN',
      dimensions: ['campaign_id', 'campaign_name', 'stat_time_day'],
      metrics: ['spend', 'impressions', 'clicks', 'conversion', 'total_complete_payment'],
      start_date: formatDate(start, 'yyyy-MM-dd'),
      end_date: formatDate(today, 'yyyy-MM-dd'),
      page_size: 200,
      time_granularity: 'STAT_TIME_DAY',
      cursor,
      order_field: 'spend',
      order_type: 'DESC',
    }

    const { payload: body } = await executeTikTokApiRequest<TikTokReportResponse>({
      url: 'https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': activeToken,
      },
      body: JSON.stringify(requestPayload),
      operation: `fetchMetrics:page${page}`,
      advertiserId,
      maxRetries,
      onAuthError: async () => {
        if (refreshAccessToken && !tokenRefreshAttempted) {
          tokenRefreshAttempted = true
          activeToken = await refreshAccessToken()
          onTokenRefresh?.()
          return { retry: true, newToken: activeToken }
        }
        return { retry: false }
      },
      onRateLimitHit,
    })

    const rows = Array.isArray(body?.data?.list) ? body.data?.list ?? [] : []

    rows.forEach((row) => {
      const dimensions = row?.dimensions ?? {}
      const metricsBlock = row?.metrics ?? {}

      const date = typeof dimensions?.stat_time_day === 'string' ? dimensions.stat_time_day : formatDate(today, 'yyyy-MM-dd')
      const campaignId = typeof dimensions?.campaign_id === 'string' ? dimensions.campaign_id : undefined
      const campaignName = typeof dimensions?.campaign_name === 'string' ? dimensions.campaign_name : undefined

      const spend = coerceNumber(metricsBlock?.spend)
      const impressions = coerceNumber(metricsBlock?.impressions)
      const clicks = coerceNumber(metricsBlock?.clicks)
      const conversions = coerceNumber(metricsBlock?.conversion)
      const revenue = coerceNumber(metricsBlock?.total_complete_payment)

      metrics.push({
        providerId: 'tiktok',
        date,
        spend,
        impressions,
        clicks,
        conversions,
        revenue: revenue || null,
        campaignId,
        campaignName,
        rawPayload: row,
      })
    })

    const hasMore = Boolean(body?.data?.page_info?.has_more) || Boolean(body?.data?.cursor)
    cursor = typeof body?.data?.cursor === 'string' && body.data.cursor.length > 0 ? body.data.cursor : undefined

    if (!hasMore || !cursor) {
      break
    }
  }

  return metrics
}

// =============================================================================
// HEALTH CHECK FOR TIKTOK INTEGRATION
// =============================================================================

export async function checkTikTokIntegrationHealth(options: {
  accessToken: string
  advertiserId?: string
}): Promise<{
  healthy: boolean
  tokenValid: boolean
  accountAccessible: boolean
  error?: string
}> {
  const { accessToken, advertiserId } = options
  
  try {
    // Check if token is valid by fetching user info
    const userUrl = 'https://business-api.tiktok.com/open_api/v1.3/user/info/'
    const userResponse = await fetch(userUrl, {
      method: 'GET',
      headers: {
        'Access-Token': accessToken,
      },
    })
    
    if (!userResponse.ok) {
      const errorData = await userResponse.json().catch(() => ({})) as TikTokApiErrorResponse
      return {
        healthy: false,
        tokenValid: false,
        accountAccessible: false,
        error: errorData?.message ?? 'Token validation failed',
      }
    }
    
    const userData = await userResponse.json() as TikTokApiErrorResponse
    if (userData.code && userData.code !== 0) {
      return {
        healthy: false,
        tokenValid: false,
        accountAccessible: false,
        error: userData.message ?? `Token validation failed with code ${userData.code}`,
      }
    }
    
    // If we have an advertiser ID, check if it's accessible
    if (advertiserId) {
      const accountResponse = await fetch('https://business-api.tiktok.com/open_api/v1.3/advertiser/info/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': accessToken,
        },
        body: JSON.stringify({
          advertiser_ids: [advertiserId],
        }),
      })
      
      if (!accountResponse.ok) {
        const errorData = await accountResponse.json().catch(() => ({})) as TikTokApiErrorResponse
        return {
          healthy: false,
          tokenValid: true,
          accountAccessible: false,
          error: errorData?.message ?? 'Advertiser not accessible',
        }
      }
      
      const accountData = await accountResponse.json() as TikTokApiErrorResponse & {
        data?: { list?: Array<{ advertiser_id?: string }> }
      }
      
      if (accountData.code && accountData.code !== 0) {
        return {
          healthy: false,
          tokenValid: true,
          accountAccessible: false,
          error: accountData.message ?? `Advertiser check failed with code ${accountData.code}`,
        }
      }
      
      const list = accountData.data?.list ?? []
      if (!list.some(a => a.advertiser_id === advertiserId)) {
        return {
          healthy: false,
          tokenValid: true,
          accountAccessible: false,
          error: 'Advertiser not found in accessible accounts',
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
