import { NormalizedMetric } from '@/types/integrations'

const GOOGLE_API_VERSION = 'v15'

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
