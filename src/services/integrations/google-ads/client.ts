// =============================================================================
// GOOGLE ADS API CLIENT - Core request execution with retry logic
// =============================================================================

import {
  GOOGLE_API_BASE,
  GoogleAdsSearchResponse,
  GoogleAdsResult,
} from './types'
import { googleAdsClient } from '../shared/base-client'
import { executeIntegrationRequest } from '../shared/execute-integration-request'

import { DEFAULT_RETRY_CONFIG } from '../shared/retry'

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

// =============================================================================
// EXECUTE GOOGLE ADS API REQUEST WITH RETRY LOGIC
// =============================================================================

interface ExecuteRequestOptions {
  url: string
  method: 'GET' | 'POST'
  headers: Record<string, string>
  body?: string
  operation: string
  maxRetries?: number
  onAuthError?: () => Promise<{ retry: boolean; newToken?: string }>
  onRateLimitHit?: (retryAfterMs: number) => void
}

export async function executeGoogleAdsApiRequest<T>(
  options: ExecuteRequestOptions
): Promise<{ response: Response; payload: T }> {
  return executeIntegrationRequest<T>(googleAdsClient, options)
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
