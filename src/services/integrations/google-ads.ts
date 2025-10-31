import { NormalizedMetric } from '@/types/integrations'

const GOOGLE_API_VERSION = 'v15'
const GOOGLE_API_BASE = `https://googleads.googleapis.com/${GOOGLE_API_VERSION}`

interface GoogleAdsOptions {
  accessToken: string
  developerToken?: string | null
  customerId: string
  loginCustomerId?: string | null
  managerCustomerId?: string | null
  timeframeDays: number
  pageSize?: number
  maxPages?: number
  refreshAccessToken?: () => Promise<string>
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
  return status === 429 || status >= 500
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function googleAdsSearch(options: {
  accessToken: string
  developerToken: string
  customerId: string
  query: string
  loginCustomerId?: string | null
  pageSize?: number
  maxPages?: number
}): Promise<GoogleAdsResult[]> {
  const {
    accessToken,
    developerToken,
    customerId,
    query,
    loginCustomerId,
    pageSize = 1000,
    maxPages = 1,
  } = options

  let pageToken: string | undefined
  const results: GoogleAdsResult[] = []

  for (let page = 0; page < maxPages; page += 1) {
    const url = `${GOOGLE_API_BASE}/customers/${customerId}/googleAds:search`
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    }

    if (loginCustomerId) {
      headers['login-customer-id'] = loginCustomerId
    }

    const body = {
      query,
      pageSize,
      pageToken,
      returnTotalResultsCount: false,
    }

    let response: Response | null = null
    let attempt = 0

    while (attempt < 3) {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok && isRetryableStatus(response.status) && attempt < 2) {
        attempt += 1
        await sleep(200 * 2 ** attempt)
        continue
      }

      break
    }

    if (!response) {
      throw new Error('Google Ads API request failed without a response')
    }

    if (!response.ok) {
      const errorPayload = await response.text()
      throw new Error(`Google Ads API error (${response.status}): ${errorPayload}`)
    }

    const payload = (await response.json()) as GoogleAdsSearchResponse

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
}): Promise<CustomerSummary | null> {
  const { accessToken, developerToken, customerId } = options
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
      })
    } catch (innerError) {
      console.error(`[google-ads] failed to load customer metadata for ${customerId}`, innerError)
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
}): Promise<GoogleAdAccount[]> {
  const { accessToken, developerToken, managerId } = options
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
    console.error(`[google-ads] failed to fetch manager client list for ${managerId}`, error)
    return []
  }
}

export async function fetchGoogleAdAccounts(options: {
  accessToken: string
  developerToken?: string | null
}): Promise<GoogleAdAccount[]> {
  const { accessToken, developerToken } = options

  if (!accessToken) {
    throw new Error('Missing Google Ads access token')
  }

  const resolvedDeveloperToken = resolveDeveloperToken(developerToken)

  const response = await fetch(`${GOOGLE_API_BASE}/customers:listAccessibleCustomers`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': resolvedDeveloperToken,
    },
  })

  if (!response.ok) {
    const errorPayload = await response.text().catch(() => '')
    throw new Error(`Google Ads accessible customers request failed (${response.status}): ${errorPayload}`)
  }

  const payload = (await response.json()) as GoogleAccessibleCustomersResponse
  const resourceNames = Array.isArray(payload?.resourceNames) ? payload.resourceNames : []

  const accountsById = new Map<string, GoogleAdAccount>()

  for (const resourceName of resourceNames) {
    const customerId = typeof resourceName === 'string' ? resourceName.split('/')[1] : null
    if (!customerId) {
      continue
    }

    const summary = await fetchCustomerSummary({
      accessToken,
      developerToken: resolvedDeveloperToken,
      customerId,
    })

    if (!summary) {
      continue
    }

    accountsById.set(summary.id, {
      id: summary.id,
      name: summary.name,
      currencyCode: summary.currencyCode ?? null,
      manager: summary.manager,
      loginCustomerId: summary.manager ? summary.id : null,
      managerCustomerId: summary.manager ? summary.id : null,
    })
  }

  const managerAccounts = Array.from(accountsById.values()).filter((account) => account.manager)

  for (const manager of managerAccounts) {
    const clients = await fetchManagerClients({
      accessToken,
      developerToken: resolvedDeveloperToken,
      managerId: manager.id,
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
    refreshAccessToken,
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
  let attemptedRefresh = false
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

    const body = {
      query,
      pageSize,
      pageToken,
      returnTotalResultsCount: false,
    }

    let response: Response | null = null
    let attempt = 0

    while (attempt < 3) {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      if ((response.status === 401 || response.status === 403) && refreshAccessToken && !attemptedRefresh) {
        attemptedRefresh = true
        activeAccessToken = await refreshAccessToken()
        headers.Authorization = `Bearer ${activeAccessToken}`
        attempt = 0
        continue
      }

      if (!response.ok && isRetryableStatus(response.status) && attempt < 2) {
        attempt += 1
        await sleep(200 * 2 ** attempt)
        continue
      }

      break
    }

    if (!response) {
      throw new Error('Google Ads API request failed without a response')
    }

    if (!response.ok) {
      const errorPayload = await response.text()
      throw new Error(`Google Ads API error (${response.status}): ${errorPayload}`)
    }

    const payload = (await response.json()) as GoogleAdsSearchResponse
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
