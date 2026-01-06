// =============================================================================
// GOOGLE ADS METRICS - Fetching ad metrics from Google Ads API
// =============================================================================

import { googleAdsSearch, normalizeCost, DEFAULT_RETRY_CONFIG } from './client'
import {
  GoogleAdsOptions,
  GoogleAdsResult,
  NormalizedMetric,
  CustomerSummary,
  GoogleAdAccount,
  GoogleAccessibleCustomersResponse,
  GOOGLE_API_BASE,
} from './types'

// =============================================================================
// MAIN API: FETCH GOOGLE ADS METRICS
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

function resolveDeveloperToken(token?: string | null): string {
  const resolved = token ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  if (!resolved) {
    throw new Error('Google Ads developer token is required via integration data or GOOGLE_ADS_DEVELOPER_TOKEN env')
  }
  return resolved
}

export async function fetchGoogleAdsMetrics(options: GoogleAdsOptions): Promise<NormalizedMetric[]> {
  const {
    accessToken,
    developerToken,
    customerId,
    loginCustomerId,
    timeframeDays,
    pageSize = 1000,
    maxPages = 5,
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    refreshAccessToken,
    onRateLimitHit,
    onTokenRefresh,
  } = options

  const resolvedDeveloperToken = resolveDeveloperToken(developerToken)
  const query = buildGaqlQuery(timeframeDays)

  let activeAccessToken = accessToken
  let tokenRefreshAttempted = false

  const rows = await googleAdsSearch({
    accessToken: activeAccessToken,
    developerToken: resolvedDeveloperToken,
    customerId,
    loginCustomerId,
    query,
    pageSize,
    maxPages,
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

  const metrics: NormalizedMetric[] = rows.map((row) => {
    const segments = row?.segments ?? {}
    const metricsBlock = row?.metrics ?? {}
    const campaign = row?.campaign

    const date = segments?.date ?? ''
    const costMicros = metricsBlock?.costMicros ?? metricsBlock?.cost_micros
    const spend = normalizeCost(costMicros as string | number | null | undefined)
    const impressions = Number(metricsBlock?.impressions) || 0
    const clicks = Number(metricsBlock?.clicks) || 0
    const conversions = Number(metricsBlock?.conversions) || 0
    const convValue = metricsBlock?.conversionsValue ?? metricsBlock?.conversions_value
    const revenue = typeof convValue === 'number' ? convValue : parseFloat(String(convValue)) || 0

    return {
      providerId: 'google',
      date,
      spend,
      impressions,
      clicks,
      conversions,
      revenue: revenue > 0 ? revenue : undefined,
      campaignId: typeof campaign?.id === 'string' ? campaign.id : undefined,
      campaignName: typeof campaign?.name === 'string' ? campaign.name : undefined,
      rawPayload: row,
    }
  })

  return metrics
}

// =============================================================================
// FETCH GOOGLE AD ACCOUNTS
// =============================================================================

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
      console.error(`[Google Ads API] Failed to load customer metadata for ${customerId}:`, innerError)
      return null
    }
  }

  const customer = rows[0]?.customer

  if (!customer) {
    return {
      id: customerId,
      name: `Customer ${customerId}`,
      currencyCode: null,
      manager: false,
    }
  }

  return {
    id: customer.id ?? customerId,
    name: customer.descriptiveName ?? `Customer ${customer.id ?? customerId}`,
    currencyCode: customer.currencyCode ?? null,
    manager: Boolean(customer.manager),
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
      const customerClient = row?.customerClient
      const clientResource = customerClient?.clientCustomer ?? null
      const clientId = clientResource?.split('/')?.[1]
      if (!clientId) return

      const manager = Boolean(customerClient?.manager)

      accounts.push({
        id: clientId,
        name: customerClient?.descriptiveName ?? `Customer ${clientId}`,
        currencyCode: customerClient?.currencyCode ?? null,
        manager,
        loginCustomerId: managerId,
        managerCustomerId: managerId,
      })
    })

    return accounts
  } catch (error) {
    console.error(`[Google Ads API] Failed to load manager clients for ${managerId}:`, error)
    return []
  }
}

export async function fetchGoogleAdAccounts(options: {
  accessToken: string
  developerToken?: string | null
  maxRetries?: number
}): Promise<GoogleAdAccount[]> {
  const { accessToken, developerToken, maxRetries = 2 } = options
  const resolvedDeveloperToken = resolveDeveloperToken(developerToken)

  const listUrl = `${GOOGLE_API_BASE}/customers:listAccessibleCustomers`
  const listResponse = await fetch(listUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': resolvedDeveloperToken,
    },
  })

  if (!listResponse.ok) {
    throw new Error(`Failed to list accessible customers: ${listResponse.status}`)
  }

  const listData = (await listResponse.json()) as GoogleAccessibleCustomersResponse
  const resourceNames = listData.resourceNames ?? []
  const customerIds = resourceNames
    .map((r) => r.replace('customers/', ''))
    .filter((id) => id.length > 0)

  if (customerIds.length === 0) {
    return []
  }

  const accounts: GoogleAdAccount[] = []

  for (const customerId of customerIds) {
    const summary = await fetchCustomerSummary({
      accessToken,
      developerToken: resolvedDeveloperToken,
      customerId,
      maxRetries,
    })

    if (!summary) continue

    if (summary.manager) {
      const clients = await fetchManagerClients({
        accessToken,
        developerToken: resolvedDeveloperToken,
        managerId: customerId,
        maxRetries,
      })
      accounts.push(...clients)
      accounts.push({
        id: summary.id,
        name: summary.name,
        currencyCode: summary.currencyCode,
        manager: true,
        loginCustomerId: null,
        managerCustomerId: null,
      })
    } else {
      accounts.push({
        id: summary.id,
        name: summary.name,
        currencyCode: summary.currencyCode,
        manager: false,
        loginCustomerId: null,
        managerCustomerId: null,
      })
    }
  }

  return accounts
}

// =============================================================================
// HEALTH CHECK
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
    
    const listUrl = `${GOOGLE_API_BASE}/customers:listAccessibleCustomers`
    const listResponse = await fetch(listUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': resolvedDeveloperToken,
      },
    })
    
    if (!listResponse.ok) {
      const errorData = await listResponse.json().catch(() => ({})) as { error?: { message?: string } }
      const isDeveloperTokenError = listResponse.status === 401 && 
        (errorData?.error?.message?.toLowerCase().includes('developer') ?? false)
      
      return {
        healthy: false,
        tokenValid: !isDeveloperTokenError,
        developerTokenValid: !isDeveloperTokenError,
        accountAccessible: false,
        error: errorData?.error?.message ?? 'Token validation failed',
      }
    }
    
    if (customerId) {
      const query = 'SELECT customer.id FROM customer LIMIT 1'
      const searchHeaders: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': resolvedDeveloperToken,
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
        const errorData = await searchResponse.json().catch(() => ({})) as { error?: { message?: string } }
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
