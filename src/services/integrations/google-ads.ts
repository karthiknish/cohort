import { NormalizedMetric } from '@/types/integrations'

const GOOGLE_API_VERSION = 'v15'
const GOOGLE_API_BASE = `https://googleads.googleapis.com/${GOOGLE_API_VERSION}`

// =============================================================================
// GOOGLE ADS API ERROR CODES
// Reference: https://developers.google.com/google-ads/api/docs/common-errors
// =============================================================================

export const GOOGLE_ADS_ERROR_CODES = {
  // Authentication Errors
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  OAUTH_TOKEN_INVALID: 'OAUTH_TOKEN_INVALID',
  OAUTH_TOKEN_EXPIRED: 'OAUTH_TOKEN_EXPIRED',
  OAUTH_TOKEN_REVOKED: 'OAUTH_TOKEN_REVOKED',
  CUSTOMER_NOT_ENABLED: 'CUSTOMER_NOT_ENABLED',
  USER_PERMISSION_DENIED: 'USER_PERMISSION_DENIED',
  DEVELOPER_TOKEN_NOT_APPROVED: 'DEVELOPER_TOKEN_NOT_APPROVED',
  DEVELOPER_TOKEN_PROHIBITED: 'DEVELOPER_TOKEN_PROHIBITED',
  
  // Rate Limiting
  RATE_EXCEEDED: 'RATE_EXCEEDED',
  RESOURCE_EXHAUSTED: 'RESOURCE_EXHAUSTED',
  RESOURCE_TEMPORARILY_EXHAUSTED: 'RESOURCE_TEMPORARILY_EXHAUSTED',
  
  // Request Errors
  REQUEST_ERROR: 'REQUEST_ERROR',
  INVALID_CUSTOMER_ID: 'INVALID_CUSTOMER_ID',
  CUSTOMER_NOT_FOUND: 'CUSTOMER_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  TRANSIENT_ERROR: 'TRANSIENT_ERROR',
  UNKNOWN: 'UNKNOWN',
  
  // Query Errors
  QUERY_ERROR: 'QUERY_ERROR',
  UNSPECIFIED: 'UNSPECIFIED',
} as const

export type GoogleAdsErrorCode = (typeof GOOGLE_ADS_ERROR_CODES)[keyof typeof GOOGLE_ADS_ERROR_CODES]

// =============================================================================
// CUSTOM ERROR CLASS
// =============================================================================

interface GoogleAdsErrorDetail {
  errorCode?: {
    [key: string]: string | undefined
  }
  message?: string
  trigger?: string
  location?: {
    fieldPathElements?: Array<{ fieldName?: string; index?: number }>
  }
}

interface GoogleAdsApiErrorResponse {
  error?: {
    code?: number
    message?: string
    status?: string
    details?: Array<{
      '@type'?: string
      errors?: GoogleAdsErrorDetail[]
      requestId?: string
    }>
  }
}

export class GoogleAdsApiError extends Error {
  readonly httpStatus: number
  readonly grpcStatus?: string
  readonly errorCode?: string
  readonly requestId?: string
  readonly details?: GoogleAdsErrorDetail[]
  readonly isRetryable: boolean
  readonly isAuthError: boolean
  readonly isRateLimitError: boolean
  readonly retryAfterMs?: number

  constructor(options: {
    message: string
    httpStatus: number
    grpcStatus?: string
    errorCode?: string
    requestId?: string
    details?: GoogleAdsErrorDetail[]
    retryAfterMs?: number
  }) {
    super(options.message)
    this.name = 'GoogleAdsApiError'
    this.httpStatus = options.httpStatus
    this.grpcStatus = options.grpcStatus
    this.errorCode = options.errorCode
    this.requestId = options.requestId
    this.details = options.details
    this.retryAfterMs = options.retryAfterMs

    // Classify error type
    this.isAuthError = this.checkIsAuthError()
    this.isRateLimitError = this.checkIsRateLimitError()
    this.isRetryable = this.checkIsRetryable()
  }

  private checkIsAuthError(): boolean {
    const authErrors: string[] = [
      GOOGLE_ADS_ERROR_CODES.AUTHENTICATION_ERROR,
      GOOGLE_ADS_ERROR_CODES.AUTHORIZATION_ERROR,
      GOOGLE_ADS_ERROR_CODES.OAUTH_TOKEN_INVALID,
      GOOGLE_ADS_ERROR_CODES.OAUTH_TOKEN_EXPIRED,
      GOOGLE_ADS_ERROR_CODES.OAUTH_TOKEN_REVOKED,
      GOOGLE_ADS_ERROR_CODES.USER_PERMISSION_DENIED,
    ]
    return this.httpStatus === 401 || 
           this.httpStatus === 403 || 
           (this.errorCode !== undefined && authErrors.includes(this.errorCode))
  }

  private checkIsRateLimitError(): boolean {
    const rateLimitErrors: string[] = [
      GOOGLE_ADS_ERROR_CODES.RATE_EXCEEDED,
      GOOGLE_ADS_ERROR_CODES.RESOURCE_EXHAUSTED,
      GOOGLE_ADS_ERROR_CODES.RESOURCE_TEMPORARILY_EXHAUSTED,
    ]
    return this.httpStatus === 429 || 
           this.grpcStatus === 'RESOURCE_EXHAUSTED' ||
           (this.errorCode !== undefined && rateLimitErrors.includes(this.errorCode))
  }

  private checkIsRetryable(): boolean {
    // Rate limit errors are retryable after a delay
    if (this.isRateLimitError) return true
    
    // Server errors (5xx) are generally retryable
    if (this.httpStatus >= 500 && this.httpStatus < 600) return true
    
    // Transient errors
    if (this.errorCode === GOOGLE_ADS_ERROR_CODES.TRANSIENT_ERROR ||
        this.errorCode === GOOGLE_ADS_ERROR_CODES.INTERNAL_ERROR) {
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
      httpStatus: this.httpStatus,
      grpcStatus: this.grpcStatus,
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

interface GoogleAdsOptions {
  accessToken: string
  developerToken?: string | null
  customerId: string
  loginCustomerId?: string | null
  managerCustomerId?: string | null
  timeframeDays: number
  pageSize?: number
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

type GoogleAdsResult = {
  segments?: {
    date?: string
  }
  metrics?: {
    costMicros?: unknown
    cost_micros?: unknown
    conversions?: unknown
    conversionsValue?: unknown
    conversions_value?: unknown
    impressions?: unknown
    clicks?: unknown
  }
  campaign?: {
    id?: string
    name?: string
  }
  [key: string]: unknown
}

type GoogleAdsSearchResponse = {
  results?: GoogleAdsResult[]
  nextPageToken?: string
  fieldMask?: string
}

type CustomerSummary = {
  id: string
  name: string
  currencyCode?: string | null
  manager: boolean
}

export type GoogleAdAccount = {
  id: string
  name: string
  currencyCode?: string | null
  manager: boolean
  loginCustomerId?: string | null
  managerCustomerId?: string | null
}

type GoogleAccessibleCustomersResponse = {
  resourceNames?: string[]
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

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function buildGaqlQuery(timeframeDays: number): string {
  const days = timeframeDays > 0 ? timeframeDays : 7

  return `
    SELECT
      segments.date,
      campaign.id,
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE segments.date DURING LAST_${days}_DAYS
  `
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeCost(costMicros?: string | number | null): number {
  if (costMicros == null) return 0
  const value = typeof costMicros === 'string' ? parseFloat(costMicros) : costMicros
  return Number.isFinite(value) ? value / 1_000_000 : 0
}

function extractNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
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
 * Parse Google Ads API error response and create a typed error
 */
function parseGoogleAdsApiError(
  response: Response,
  payload: GoogleAdsApiErrorResponse | string
): GoogleAdsApiError {
  const errorData = typeof payload === 'string' 
    ? { error: { message: payload, code: response.status } }
    : payload

  const error = errorData?.error ?? {}
  const details = error.details ?? []
  
  // Extract error code from details
  let errorCode: string | undefined
  let requestId: string | undefined
  const errorDetails: GoogleAdsErrorDetail[] = []
  
  for (const detail of details) {
    if (detail.requestId) {
      requestId = detail.requestId
    }
    if (Array.isArray(detail.errors)) {
      errorDetails.push(...detail.errors)
      for (const err of detail.errors) {
        if (err.errorCode) {
          // Get the first non-undefined error code value
          const codeEntry = Object.entries(err.errorCode).find(([, v]) => v !== undefined)
          if (codeEntry) {
            errorCode = codeEntry[1]
            break
          }
        }
      }
    }
  }

  // Check for Retry-After header (in seconds)
  const retryAfterHeader = response.headers.get('Retry-After')
  const retryAfterMs = retryAfterHeader 
    ? parseInt(retryAfterHeader, 10) * 1000 
    : undefined

  return new GoogleAdsApiError({
    message: error.message ?? `Google Ads API error (${response.status})`,
    httpStatus: error.code ?? response.status,
    grpcStatus: error.status,
    errorCode,
    requestId,
    details: errorDetails.length > 0 ? errorDetails : undefined,
    retryAfterMs,
  })
}

/**
 * Log Google Ads API request for debugging
 */
function logGoogleAdsApiRequest(context: {
  operation: string
  customerId: string
  attempt: number
  maxRetries: number
  duration?: number
  error?: GoogleAdsApiError | Error
  statusCode?: number
}) {
  const { operation, customerId, attempt, maxRetries, duration, error, statusCode } = context

  if (error) {
    console.error(`[Google Ads API] ${operation} failed`, {
      customerId,
      attempt: `${attempt + 1}/${maxRetries}`,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
      error: error instanceof GoogleAdsApiError ? error.toJSON() : { message: error.message },
    })
  } else {
    console.log(`[Google Ads API] ${operation} completed`, {
      customerId,
      attempt: `${attempt + 1}/${maxRetries}`,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
    })
  }
}

// =============================================================================
// EXECUTE GOOGLE ADS API REQUEST WITH RETRY LOGIC
// =============================================================================

interface ExecuteRequestOptions<T> {
  url: string
  method: 'GET' | 'POST'
  headers: Record<string, string>
  body?: string
  operation: string
  customerId: string
  maxRetries?: number
  onAuthError?: () => Promise<{ retry: boolean; newToken?: string }>
  onRateLimitHit?: (retryAfterMs: number) => void
}

async function executeGoogleAdsApiRequest<T>(
  options: ExecuteRequestOptions<T>
): Promise<{ response: Response; payload: T }> {
  const {
    url,
    method,
    headers: initialHeaders,
    body,
    operation,
    customerId,
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    onAuthError,
    onRateLimitHit,
  } = options

  let headers = { ...initialHeaders }
  let lastError: GoogleAdsApiError | Error | null = null

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
      
      logGoogleAdsApiRequest({
        operation,
        customerId,
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
      logGoogleAdsApiRequest({
        operation,
        customerId,
        attempt,
        maxRetries,
        duration,
        statusCode: response.status,
      })
      return { response, payload }
    }

    // Error handling
    let errorPayload: GoogleAdsApiErrorResponse
    try {
      errorPayload = await response.json() as GoogleAdsApiErrorResponse
    } catch {
      errorPayload = { error: { message: await response.text(), code: response.status } }
    }

    const googleError = parseGoogleAdsApiError(response, errorPayload)
    lastError = googleError

    logGoogleAdsApiRequest({
      operation,
      customerId,
      attempt,
      maxRetries,
      duration,
      statusCode: response.status,
      error: googleError,
    })

    // Handle auth errors - try token refresh
    if (googleError.isAuthError && onAuthError) {
      const result = await onAuthError()
      if (result.retry && result.newToken) {
        headers = { ...headers, Authorization: `Bearer ${result.newToken}` }
        // Reset attempt counter after successful token refresh
        attempt = -1 // Will become 0 on next iteration
        continue
      }
      // If no refresh available or failed, throw immediately
      throw googleError
    }

    // Handle rate limits
    if (googleError.isRateLimitError) {
      const retryAfterMs = googleError.retryAfterMs ?? calculateBackoffDelay(attempt)
      onRateLimitHit?.(retryAfterMs)
      
      if (attempt < maxRetries - 1) {
        console.warn(`[Google Ads API] Rate limited, waiting ${retryAfterMs}ms before retry`)
        await sleep(retryAfterMs)
        continue
      }
      throw googleError
    }

    // Handle other retryable errors (5xx, transient)
    if ((googleError.isRetryable || isRetryableStatus(response.status)) && attempt < maxRetries - 1) {
      const delay = calculateBackoffDelay(attempt)
      await sleep(delay)
      continue
    }

    // Non-retryable error or exhausted retries
    throw googleError
  }

  // Should never reach here, but just in case
  const finalError = lastError ?? new Error('Google Ads API request failed after all retries')
  if (finalError instanceof GoogleAdsApiError) {
    throw finalError
  }
  
  throw new GoogleAdsApiError({
    message: finalError.message,
    httpStatus: 500,
    errorCode: GOOGLE_ADS_ERROR_CODES.UNKNOWN,
    details: [{ message: 'Request failed after all retries' }]
  })
}

// =============================================================================
// GOOGLE ADS SEARCH
// =============================================================================

async function googleAdsSearch(options: {
  accessToken: string
  developerToken: string
  customerId: string
  query: string
  loginCustomerId?: string | null
  pageSize?: number
  maxPages?: number
  maxRetries?: number
  onAuthError?: () => Promise<{ retry: boolean; newToken?: string }>
  onRateLimitHit?: (retryAfterMs: number) => void
}): Promise<GoogleAdsResult[]> {
  const {
    accessToken,
    developerToken,
    customerId,
    query,
    loginCustomerId,
    pageSize = 1000,
    maxPages = 1,
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    onAuthError,
    onRateLimitHit,
  } = options

  let pageToken: string | undefined
  const results: GoogleAdsResult[] = []
  let currentAccessToken = accessToken

  for (let page = 0; page < maxPages; page += 1) {
    const url = `${GOOGLE_API_BASE}/customers/${customerId}/googleAds:search`
    const headers: Record<string, string> = {
      Authorization: `Bearer ${currentAccessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    }

    if (loginCustomerId) {
      headers['login-customer-id'] = loginCustomerId
    }

    const body = JSON.stringify({
      query,
      pageSize,
      pageToken,
      returnTotalResultsCount: false,
    })

    const { payload } = await executeGoogleAdsApiRequest<GoogleAdsSearchResponse>({
      url,
      method: 'POST',
      headers,
      body,
      operation: `search:page${page}`,
      customerId,
      maxRetries,
      onAuthError: async () => {
        if (onAuthError) {
          const result = await onAuthError()
          if (result.newToken) {
            currentAccessToken = result.newToken
          }
          return result
        }
        return { retry: false }
      },
      onRateLimitHit,
    })

    if (Array.isArray(payload.results)) {
      results.push(...payload.results)
    }

    pageToken = payload.nextPageToken ?? undefined
    if (!pageToken) {
      break
    }
  }

  return results
}

function resolveDeveloperToken(token?: string | null): string {
  const resolved = token ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  if (!resolved) {
    throw new Error('Google Ads developer token is required via integration data or GOOGLE_ADS_DEVELOPER_TOKEN env')
  }
  return resolved
}

async function fetchCustomerSummary(options: {
  accessToken: string
  developerToken: string
  customerId: string
  maxRetries?: number
}): Promise<CustomerSummary | null> {
  const { accessToken, developerToken, customerId, maxRetries = 2 } = options
  const query = `
    SELECT
      customer.id,
      customer.descriptive_name,
      customer.currency_code,
      customer.manager
    FROM customer
    LIMIT 1
  `
    .replace(/\s+/g, ' ')
    .trim()

  let rows: GoogleAdsResult[] = []

  try {
    rows = await googleAdsSearch({
      accessToken,
      developerToken,
      customerId,
      query,
      loginCustomerId: customerId,
      pageSize: 1,
      maxPages: 1,
      maxRetries,
    })
  } catch {
    try {
      rows = await googleAdsSearch({
        accessToken,
        developerToken,
        customerId,
        query,
        loginCustomerId: undefined,
        pageSize: 1,
        maxPages: 1,
        maxRetries,
      })
    } catch (innerError) {
      console.error(`[Google Ads API] Failed to load customer metadata for ${customerId}:`, 
        innerError instanceof GoogleAdsApiError ? innerError.toJSON() : innerError
      )
      return null
    }
  }

  const customer = rows[0]?.customer as
    | {
        id?: string
        descriptiveName?: string
        currencyCode?: string
        manager?: boolean
      }
    | undefined

  if (!customer) {
    return {
      id: customerId,
      name: `Customer ${customerId}`,
      currencyCode: null,
      manager: false,
    }
  }

  const id = customer.id ?? customerId
  const name = customer.descriptiveName ?? `Customer ${id}`
  const currencyCode = customer.currencyCode ?? null
  const manager = Boolean(customer.manager)

  return {
    id,
    name,
    currencyCode,
    manager,
  }
}

async function fetchManagerClients(options: {
  accessToken: string
  developerToken: string
  managerId: string
  maxRetries?: number
}): Promise<GoogleAdAccount[]> {
  const { accessToken, developerToken, managerId, maxRetries = 2 } = options
  const query = `
    SELECT
      customer_client.client_customer,
      customer_client.descriptive_name,
      customer_client.currency_code,
      customer_client.manager,
      customer_client.level
    FROM customer_client
    WHERE customer_client.hidden = FALSE
  `
    .replace(/\s+/g, ' ')
    .trim()

  try {
    const rows = await googleAdsSearch({
      accessToken,
      developerToken,
      customerId: managerId,
      loginCustomerId: managerId,
      query,
      pageSize: 1000,
      maxPages: 5,
      maxRetries,
    })

    const accounts: GoogleAdAccount[] = []

    rows.forEach((row) => {
      const customerClient = row?.customerClient as
        | {
            clientCustomer?: string
            descriptiveName?: string
            currencyCode?: string
            manager?: boolean
          }
        | undefined

      const clientResource = customerClient?.clientCustomer ?? null
      const clientId = clientResource?.split('/')?.[1]
      if (!clientId) {
        return
      }

      const manager = Boolean(customerClient?.manager)

      accounts.push({
        id: clientId,
        name: customerClient?.descriptiveName ?? `Customer ${clientId}`,
        currencyCode: customerClient?.currencyCode ?? null,
        manager,
        loginCustomerId: manager ? clientId : managerId,
        managerCustomerId: manager ? clientId : managerId,
      })
    })

    return accounts
  } catch (error) {
    console.error(`[Google Ads API] Failed to fetch manager client list for ${managerId}:`,
      error instanceof GoogleAdsApiError ? error.toJSON() : error
    )
    return []
  }
}

export async function fetchGoogleAdAccounts(options: {
  accessToken: string
  developerToken?: string | null
  maxRetries?: number
}): Promise<GoogleAdAccount[]> {
  const { accessToken, developerToken, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries } = options

  if (!accessToken) {
    throw new Error('Missing Google Ads access token')
  }

  const resolvedDeveloperToken = resolveDeveloperToken(developerToken)

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': resolvedDeveloperToken,
  }

  const url = `${GOOGLE_API_BASE}/customers:listAccessibleCustomers`
  
  const { payload } = await executeGoogleAdsApiRequest<GoogleAccessibleCustomersResponse>({
    url,
    method: 'GET',
    headers,
    operation: 'listAccessibleCustomers',
    customerId: 'me',
    maxRetries,
  })

  const resourceNames = Array.isArray(payload?.resourceNames) ? payload.resourceNames : []

  const accountsById = new Map<string, GoogleAdAccount>()

  // Fetch customer details with limited concurrency to avoid rate limits
  const CONCURRENT_LIMIT = 3
  const customerIds = resourceNames
    .map(rn => typeof rn === 'string' ? rn.split('/')[1] : null)
    .filter((id): id is string => id !== null)

  for (let i = 0; i < customerIds.length; i += CONCURRENT_LIMIT) {
    const batch = customerIds.slice(i, i + CONCURRENT_LIMIT)
    
    await Promise.all(
      batch.map(async (customerId) => {
        const summary = await fetchCustomerSummary({
          accessToken,
          developerToken: resolvedDeveloperToken,
          customerId,
          maxRetries: Math.min(maxRetries, 2), // Fewer retries for individual customers
        })

        if (!summary) return

        accountsById.set(summary.id, {
          id: summary.id,
          name: summary.name,
          currencyCode: summary.currencyCode ?? null,
          manager: summary.manager,
          loginCustomerId: summary.manager ? summary.id : null,
          managerCustomerId: summary.manager ? summary.id : null,
        })
      })
    )
    
    // Small delay between batches
    if (i + CONCURRENT_LIMIT < customerIds.length) {
      await sleep(100)
    }
  }

  const managerAccounts = Array.from(accountsById.values()).filter((account) => account.manager)

  for (const manager of managerAccounts) {
    const clients = await fetchManagerClients({
      accessToken,
      developerToken: resolvedDeveloperToken,
      managerId: manager.id,
      maxRetries: Math.min(maxRetries, 2),
    })

    clients.forEach((client) => {
      const existing = accountsById.get(client.id)
      if (existing) {
        accountsById.set(client.id, {
          ...existing,
          loginCustomerId: existing.loginCustomerId ?? client.loginCustomerId,
          managerCustomerId: existing.managerCustomerId ?? client.managerCustomerId,
          manager: existing.manager || client.manager,
        })
        return
      }

      accountsById.set(client.id, client)
    })
  }

  return Array.from(accountsById.values())
}

// =============================================================================
// MAIN API: FETCH GOOGLE ADS METRICS
// =============================================================================

export async function fetchGoogleAdsMetrics(options: GoogleAdsOptions): Promise<NormalizedMetric[]> {
  const {
    accessToken,
    developerToken,
    customerId,
    loginCustomerId,
    managerCustomerId,
    timeframeDays,
    pageSize = 1000,
    maxPages = 8,
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    refreshAccessToken,
    onRateLimitHit,
    onTokenRefresh,
  } = options

  if (!accessToken) {
    throw new Error('Missing Google Ads access token')
  }

  if (!customerId) {
    throw new Error('Google Ads customer ID (accountId) is required to fetch metrics')
  }

  const resolvedDeveloperToken = developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  if (!resolvedDeveloperToken) {
    throw new Error('Google Ads developer token is required via integration data or GOOGLE_ADS_DEVELOPER_TOKEN env')
  }

  let activeAccessToken = accessToken
  let tokenRefreshAttempted = false
  const metrics: NormalizedMetric[] = []
  const query = buildGaqlQuery(timeframeDays)
  let pageToken: string | undefined
  let page = 0

  while (page < maxPages) {
    const url = `https://googleads.googleapis.com/${GOOGLE_API_VERSION}/customers/${customerId}/googleAds:search`
    const headers: Record<string, string> = {
      Authorization: `Bearer ${activeAccessToken}`,
      'developer-token': resolvedDeveloperToken,
      'Content-Type': 'application/json',
    }

    const loginIdForHeader = managerCustomerId ?? loginCustomerId
    if (loginIdForHeader) {
      headers['login-customer-id'] = loginIdForHeader
    }

    const body = JSON.stringify({
      query,
      pageSize,
      pageToken,
      returnTotalResultsCount: false,
    })

    const { payload } = await executeGoogleAdsApiRequest<GoogleAdsSearchResponse>({
      url,
      method: 'POST',
      headers,
      body,
      operation: `fetchMetrics:page${page}`,
      customerId,
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

    const rows = Array.isArray(payload?.results) ? payload.results : []

    rows.forEach((item) => {
      const date = item?.segments?.date
      if (!date) {
        return
      }

      const spend = normalizeCost((item?.metrics?.costMicros ?? item?.metrics?.cost_micros) as string | number | null)
      const conversions = extractNumber(item?.metrics?.conversions) ?? 0
      const conversionsValue = extractNumber(item?.metrics?.conversionsValue ?? item?.metrics?.conversions_value)
      const impressions = extractNumber(item?.metrics?.impressions) ?? 0
      const clicks = extractNumber(item?.metrics?.clicks) ?? 0
      const campaignId = item?.campaign?.id ?? 'unknown'
      const campaignName = item?.campaign?.name ?? 'Unknown campaign'

      metrics.push({
        providerId: 'google',
        date,
        campaignId,
        campaignName,
        spend,
        impressions,
        clicks,
        conversions,
        revenue: conversionsValue,
        creatives: undefined,
        rawPayload: item,
      })
    })

    pageToken = payload?.nextPageToken ?? undefined
    page += 1

    if (!pageToken) {
      break
    }
  }

  return metrics
}

// =============================================================================
// HEALTH CHECK FOR GOOGLE ADS INTEGRATION
// =============================================================================

export async function checkGoogleAdsIntegrationHealth(options: {
  accessToken: string
  developerToken?: string | null
  customerId?: string
  loginCustomerId?: string | null
}): Promise<{
  healthy: boolean
  tokenValid: boolean
  developerTokenValid: boolean
  accountAccessible: boolean
  error?: string
}> {
  const { accessToken, developerToken, customerId, loginCustomerId } = options
  
  try {
    const resolvedDeveloperToken = resolveDeveloperToken(developerToken)
    
    // First check if we can list accessible customers (validates token and developer token)
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': resolvedDeveloperToken,
    }
    
    const listUrl = `${GOOGLE_API_BASE}/customers:listAccessibleCustomers`
    const listResponse = await fetch(listUrl, { headers })
    
    if (!listResponse.ok) {
      const errorData = await listResponse.json().catch(() => ({})) as GoogleAdsApiErrorResponse
      const errorMessage = errorData?.error?.message ?? `HTTP ${listResponse.status}`
      
      // Check if it's a developer token issue
      if (errorMessage.toLowerCase().includes('developer') || 
          errorMessage.toLowerCase().includes('token')) {
        return {
          healthy: false,
          tokenValid: true,
          developerTokenValid: false,
          accountAccessible: false,
          error: errorMessage,
        }
      }
      
      return {
        healthy: false,
        tokenValid: false,
        developerTokenValid: false,
        accountAccessible: false,
        error: errorMessage,
      }
    }
    
    // If we have a customer ID, check if it's accessible
    if (customerId) {
      const query = 'SELECT customer.id FROM customer LIMIT 1'
      const searchHeaders: Record<string, string> = {
        ...headers,
        'Content-Type': 'application/json',
      }
      
      if (loginCustomerId) {
        searchHeaders['login-customer-id'] = loginCustomerId
      }
      
      const searchUrl = `${GOOGLE_API_BASE}/customers/${customerId}/googleAds:search`
      const searchResponse = await fetch(searchUrl, {
        method: 'POST',
        headers: searchHeaders,
        body: JSON.stringify({ query, pageSize: 1 }),
      })
      
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json().catch(() => ({})) as GoogleAdsApiErrorResponse
        return {
          healthy: false,
          tokenValid: true,
          developerTokenValid: true,
          accountAccessible: false,
          error: errorData?.error?.message ?? 'Account not accessible',
        }
      }
    }
    
    return {
      healthy: true,
      tokenValid: true,
      developerTokenValid: true,
      accountAccessible: true,
    }
  } catch (error) {
    return {
      healthy: false,
      tokenValid: false,
      developerTokenValid: false,
      accountAccessible: false,
      error: error instanceof Error ? error.message : 'Health check failed',
    }
  }
}
