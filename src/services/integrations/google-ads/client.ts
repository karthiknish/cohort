// =============================================================================
// GOOGLE ADS API CLIENT - Core request execution with retry logic
// =============================================================================

import {
  GOOGLE_API_BASE,
  GOOGLE_ADS_ERROR_CODES,
  RetryConfig,
  GoogleAdsApiErrorResponse,
  GoogleAdsErrorDetail,
  GoogleAdsSearchResponse,
  GoogleAdsResult,
} from './types'
import { GoogleAdsApiError } from './errors'

import {
  calculateBackoffDelay,
  DEFAULT_RETRY_CONFIG,
  isRetryableStatus,
  parseRetryAfterMs,
  sleep,
} from '../shared/retry'

// =============================================================================
// RETRY CONFIGURATION
// =============================================================================

export { DEFAULT_RETRY_CONFIG }

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function normalizeCost(costMicros?: string | number | null): number {
  if (costMicros == null) return 0
  const value = typeof costMicros === 'string' ? parseFloat(costMicros) : costMicros
  return Number.isFinite(value) ? value / 1_000_000 : 0
}

export function extractNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}


function parseGoogleAdsApiError(
  response: Response,
  payload: GoogleAdsApiErrorResponse | string
): GoogleAdsApiError {
  const errorData = typeof payload === 'string' 
    ? { error: { message: payload, code: response.status } }
    : payload

  const error = errorData?.error ?? {}
  const details = error.details ?? []
  
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
          const codeEntry = Object.entries(err.errorCode).find(([, v]) => v !== undefined)
          if (codeEntry) {
            errorCode = codeEntry[1]
            break
          }
        }
      }
    }
  }

  const retryAfterMs = parseRetryAfterMs(response.headers)

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

export async function executeGoogleAdsApiRequest<T>(
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

    if (googleError.isAuthError && onAuthError) {
      const result = await onAuthError()
      if (result.retry && result.newToken) {
        headers = { ...headers, Authorization: `Bearer ${result.newToken}` }
        attempt = -1
        continue
      }
      throw googleError
    }

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

    if ((googleError.isRetryable || isRetryableStatus(response.status)) && attempt < maxRetries - 1) {
      const delay = calculateBackoffDelay(attempt)
      await sleep(delay)
      continue
    }

    throw googleError
  }

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

export async function googleAdsSearch(options: {
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
