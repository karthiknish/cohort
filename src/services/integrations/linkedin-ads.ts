import { NormalizedMetric } from '@/types/integrations'

// =============================================================================
// LINKEDIN ADS API ERROR CODES
// Reference: https://learn.microsoft.com/en-us/linkedin/shared/api-guide/concepts/error-handling
// =============================================================================

export const LINKEDIN_ERROR_CODES = {
  // Authentication Errors
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INVALID_ACCESS_TOKEN: 'INVALID_ACCESS_TOKEN',
  EXPIRED_ACCESS_TOKEN: 'EXPIRED_ACCESS_TOKEN',
  REVOKED_ACCESS_TOKEN: 'REVOKED_ACCESS_TOKEN',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 429,
  THROTTLE_LIMIT: 'THROTTLE_LIMIT',
  
  // Request Errors
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  
  // LinkedIn Specific
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
} as const

export type LinkedInErrorCode = (typeof LINKEDIN_ERROR_CODES)[keyof typeof LINKEDIN_ERROR_CODES]

// =============================================================================
// CUSTOM ERROR CLASS
// =============================================================================

interface LinkedInApiErrorDetail {
  code?: string
  message?: string
  status?: number
  serviceErrorCode?: number
}

interface LinkedInApiErrorResponse {
  status?: number
  serviceErrorCode?: number
  code?: string
  message?: string
}

export class LinkedInApiError extends Error {
  readonly httpStatus: number
  readonly errorCode?: string
  readonly serviceErrorCode?: number
  readonly isRetryable: boolean
  readonly isAuthError: boolean
  readonly isRateLimitError: boolean
  readonly retryAfterMs?: number

  constructor(options: {
    message: string
    httpStatus: number
    errorCode?: string
    serviceErrorCode?: number
    retryAfterMs?: number
  }) {
    super(options.message)
    this.name = 'LinkedInApiError'
    this.httpStatus = options.httpStatus
    this.errorCode = options.errorCode
    this.serviceErrorCode = options.serviceErrorCode
    this.retryAfterMs = options.retryAfterMs

    // Classify error type
    this.isAuthError = this.checkIsAuthError()
    this.isRateLimitError = this.checkIsRateLimitError()
    this.isRetryable = this.checkIsRetryable()
  }

  private checkIsAuthError(): boolean {
    const authErrors: string[] = [
      LINKEDIN_ERROR_CODES.INVALID_ACCESS_TOKEN,
      LINKEDIN_ERROR_CODES.EXPIRED_ACCESS_TOKEN,
      LINKEDIN_ERROR_CODES.REVOKED_ACCESS_TOKEN,
    ]
    return this.httpStatus === 401 || 
           this.httpStatus === 403 || 
           (this.errorCode !== undefined && authErrors.includes(this.errorCode))
  }

  private checkIsRateLimitError(): boolean {
    return this.httpStatus === 429 || 
           this.errorCode === LINKEDIN_ERROR_CODES.THROTTLE_LIMIT
  }

  private checkIsRetryable(): boolean {
    // Rate limit errors are retryable after a delay
    if (this.isRateLimitError) return true
    
    // Server errors (5xx) are generally retryable
    if (this.httpStatus >= 500 && this.httpStatus < 600) return true
    
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
      serviceErrorCode: this.serviceErrorCode,
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

interface LinkedInAdsOptions {
  accessToken: string
  accountId: string
  timeframeDays: number
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

export type LinkedInAdAccount = {
  id: string
  name: string
  status?: string
  currency?: string
}

type LinkedInAnalyticsRow = {
  timeRange?: {
    start?: string
    end?: string
  }
  costInLocalCurrency?: unknown
  impressions?: unknown
  clicks?: unknown
  conversions?: unknown
  [key: string]: unknown
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

function buildTimeRange(timeframeDays: number) {
  const end = new Date()
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - Math.max(timeframeDays - 1, 0))

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

function normalizeCurrency(value: unknown): number {
  if (!value) return 0
  if (typeof value === 'object' && 'amount' in value) {
    const amount = (value as { amount?: unknown }).amount
    if (typeof amount === 'number') return amount
    if (typeof amount === 'string') {
      const parsed = parseFloat(amount)
      return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return Number(value) || 0
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
 * Parse LinkedIn API error response and create a typed error
 */
function parseLinkedInApiError(
  response: Response,
  payload: LinkedInApiErrorResponse | string
): LinkedInApiError {
  const errorData = typeof payload === 'string' 
    ? { message: payload, status: response.status }
    : payload

  // Check for Retry-After header (in seconds)
  const retryAfterHeader = response.headers.get('Retry-After')
  const retryAfterMs = retryAfterHeader 
    ? parseInt(retryAfterHeader, 10) * 1000 
    : undefined

  return new LinkedInApiError({
    message: errorData?.message ?? `LinkedIn API error (${response.status})`,
    httpStatus: errorData?.status ?? response.status,
    errorCode: errorData?.code,
    serviceErrorCode: errorData?.serviceErrorCode,
    retryAfterMs,
  })
}

/**
 * Log LinkedIn API request for debugging
 */
function logLinkedInApiRequest(context: {
  operation: string
  accountId?: string
  attempt: number
  maxRetries: number
  duration?: number
  error?: LinkedInApiError | Error
  statusCode?: number
}) {
  const { operation, accountId, attempt, maxRetries, duration, error, statusCode } = context

  if (error) {
    console.error(`[LinkedIn API] ${operation} failed`, {
      accountId,
      attempt: `${attempt + 1}/${maxRetries}`,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
      error: error instanceof LinkedInApiError ? error.toJSON() : { message: error.message },
    })
  } else {
    console.log(`[LinkedIn API] ${operation} completed`, {
      accountId,
      attempt: `${attempt + 1}/${maxRetries}`,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
    })
  }
}

// =============================================================================
// EXECUTE LINKEDIN API REQUEST WITH RETRY LOGIC
// =============================================================================

interface ExecuteRequestOptions<T> {
  url: string
  method?: 'GET' | 'POST'
  headers: Record<string, string>
  body?: string
  operation: string
  accountId?: string
  maxRetries?: number
  onAuthError?: () => Promise<{ retry: boolean; newToken?: string }>
  onRateLimitHit?: (retryAfterMs: number) => void
}

async function executeLinkedInApiRequest<T>(
  options: ExecuteRequestOptions<T>
): Promise<{ response: Response; payload: T }> {
  const {
    url,
    method = 'GET',
    headers: initialHeaders,
    body,
    operation,
    accountId,
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    onAuthError,
    onRateLimitHit,
  } = options

  let headers = { ...initialHeaders }
  let lastError: LinkedInApiError | Error | null = null

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
      
      logLinkedInApiRequest({
        operation,
        accountId,
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
      logLinkedInApiRequest({
        operation,
        accountId,
        attempt,
        maxRetries,
        duration,
        statusCode: response.status,
      })
      return { response, payload }
    }

    // Error handling
    let errorPayload: LinkedInApiErrorResponse
    try {
      errorPayload = await response.json() as LinkedInApiErrorResponse
    } catch {
      errorPayload = { message: await response.text(), status: response.status }
    }

    const linkedInError = parseLinkedInApiError(response, errorPayload)
    lastError = linkedInError

    logLinkedInApiRequest({
      operation,
      accountId,
      attempt,
      maxRetries,
      duration,
      statusCode: response.status,
      error: linkedInError,
    })

    // Handle auth errors - try token refresh
    if (linkedInError.isAuthError && onAuthError) {
      const result = await onAuthError()
      if (result.retry && result.newToken) {
        headers = { ...headers, Authorization: `Bearer ${result.newToken}` }
        // Reset attempt counter after successful token refresh
        attempt = -1 // Will become 0 on next iteration
        continue
      }
      // If no refresh available or failed, throw immediately
      throw linkedInError
    }

    // Handle rate limits
    if (linkedInError.isRateLimitError) {
      // LinkedIn uses a daily rate limit, so use longer backoff
      const retryAfterMs = linkedInError.retryAfterMs ?? calculateBackoffDelay(attempt) * 2
      onRateLimitHit?.(retryAfterMs)
      
      if (attempt < maxRetries - 1) {
        console.warn(`[LinkedIn API] Rate limited, waiting ${retryAfterMs}ms before retry`)
        await sleep(retryAfterMs)
        continue
      }
      throw linkedInError
    }

    // Handle other retryable errors (5xx)
    if ((linkedInError.isRetryable || isRetryableStatus(response.status)) && attempt < maxRetries - 1) {
      const delay = calculateBackoffDelay(attempt)
      await sleep(delay)
      continue
    }

    // Non-retryable error or exhausted retries
    throw linkedInError
  }

  // Should never reach here, but just in case
  throw lastError ?? new Error('LinkedIn API request failed after all retries')
}

// =============================================================================
// MAIN API: FETCH LINKEDIN ADS METRICS
// =============================================================================

export async function fetchLinkedInAdsMetrics(options: LinkedInAdsOptions): Promise<NormalizedMetric[]> {
  const { 
    accessToken, 
    accountId, 
    timeframeDays,
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    refreshAccessToken,
    onRateLimitHit,
    onTokenRefresh,
  } = options

  if (!accessToken) {
    throw new Error('Missing LinkedIn access token')
  }

  if (!accountId) {
    throw new Error('Missing LinkedIn ad account ID on integration')
  }

  let activeAccessToken = accessToken
  let tokenRefreshAttempted = false

  const timeRange = buildTimeRange(timeframeDays)

  const params = new URLSearchParams({
    q: 'statistics',
    accounts: `urn:li:sponsoredAccount:${accountId}`,
    timeGranularity: 'DAILY',
    start: timeRange.start,
    end: timeRange.end,
  })

  const url = `https://api.linkedin.com/v2/adAnalytics?${params.toString()}`
  
  const { payload } = await executeLinkedInApiRequest<{ elements?: LinkedInAnalyticsRow[] }>({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${activeAccessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    operation: 'fetchMetrics',
    accountId,
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

  const rows: LinkedInAnalyticsRow[] = Array.isArray(payload?.elements) ? payload.elements : []

  const metrics: NormalizedMetric[] = rows.map((row) => {
    const date = row?.timeRange?.start ? new Date(row.timeRange.start).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
    const spend = normalizeCurrency(row?.costInLocalCurrency)
    const impressions = coerceNumber(row?.impressions)
    const clicks = coerceNumber(row?.clicks)
    const conversions = coerceNumber(row?.conversions)

    return {
      providerId: 'linkedin',
      date,
      spend,
      impressions,
      clicks,
      conversions,
      revenue: undefined,
      creatives: undefined,
      rawPayload: row,
    }
  })

  return metrics
}

// =============================================================================
// FETCH LINKEDIN AD ACCOUNTS
// =============================================================================

export async function fetchLinkedInAdAccounts(options: { 
  accessToken: string
  statusFilter?: string[]
  maxRetries?: number
}): Promise<LinkedInAdAccount[]> {
  const { 
    accessToken, 
    statusFilter = ['ACTIVE', 'DRAFT', 'PAUSED'],
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
  } = options

  if (!accessToken) {
    throw new Error('Missing LinkedIn access token')
  }

  const params = new URLSearchParams({
    q: 'search',
    count: '50',
  })

  statusFilter.forEach((status, index) => {
    params.set(`search.accountStatuses[${index}]`, status)
  })

  const url = `https://api.linkedin.com/v2/adAccountsV2?${params.toString()}`
  
  const { payload } = await executeLinkedInApiRequest<{
    elements?: Array<{
      id?: string
      name?: string
      status?: string
      currency?: string
    }>
  }>({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Linkedin-Version': '202310',
    },
    operation: 'fetchAdAccounts',
    maxRetries,
  })

  const accounts = Array.isArray(payload?.elements) ? payload.elements : []

  const normalized: LinkedInAdAccount[] = []

  accounts.forEach((account) => {
    const id = typeof account?.id === 'string' ? account.id.replace('urn:li:sponsoredAccount:', '') : null
    if (!id) {
      return
    }

    normalized.push({
      id,
      name: typeof account?.name === 'string' && account.name.length > 0 ? account.name : `LinkedIn account ${id}`,
      status: typeof account?.status === 'string' ? account.status : undefined,
      currency: typeof account?.currency === 'string' ? account.currency : undefined,
    })
  })

  return normalized
}

// =============================================================================
// HEALTH CHECK FOR LINKEDIN INTEGRATION
// =============================================================================

export async function checkLinkedInIntegrationHealth(options: {
  accessToken: string
  accountId?: string
}): Promise<{
  healthy: boolean
  tokenValid: boolean
  accountAccessible: boolean
  error?: string
}> {
  const { accessToken, accountId } = options
  
  try {
    // First check if token is valid by fetching user profile
    const profileUrl = 'https://api.linkedin.com/v2/me'
    const profileResponse = await fetch(profileUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    })
    
    if (!profileResponse.ok) {
      const errorData = await profileResponse.json().catch(() => ({})) as LinkedInApiErrorResponse
      return {
        healthy: false,
        tokenValid: false,
        accountAccessible: false,
        error: errorData?.message ?? 'Token validation failed',
      }
    }
    
    // If we have an account ID, check if it's accessible
    if (accountId) {
      const accountUrl = `https://api.linkedin.com/v2/adAccountsV2/${encodeURIComponent(`urn:li:sponsoredAccount:${accountId}`)}`
      const accountResponse = await fetch(accountUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Linkedin-Version': '202310',
        },
      })
      
      if (!accountResponse.ok) {
        const errorData = await accountResponse.json().catch(() => ({})) as LinkedInApiErrorResponse
        return {
          healthy: false,
          tokenValid: true,
          accountAccessible: false,
          error: errorData?.message ?? 'Ad account not accessible',
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
