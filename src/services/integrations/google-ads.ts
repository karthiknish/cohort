import { NormalizedMetric } from '@/types/integrations'

interface GoogleAdsOptions {
  accessToken: string
  developerToken?: string | null
  loginCustomerId?: string | null
  timeframeDays: number
}

interface GoogleAdsMetric {
  campaignId: string
  campaignName: string
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue?: number
}

function buildGaqlQuery(timeframeDays: number) {
  if (timeframeDays <= 0) {
    timeframeDays = 7
  }

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
    WHERE segments.date DURING LAST_${timeframeDays}_DAYS
  `
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeCost(costMicros?: string | number | null) {
  if (costMicros == null) return 0
  const value = typeof costMicros === 'string' ? parseFloat(costMicros) : costMicros
  return Number.isFinite(value) ? value / 1_000_000 : 0
}

export async function fetchGoogleAdsMetrics(options: GoogleAdsOptions): Promise<NormalizedMetric[]> {
  const { accessToken, developerToken, loginCustomerId, timeframeDays } = options

  if (!accessToken) {
    throw new Error('Missing Google Ads access token')
  }

  const resolvedDeveloperToken = developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  if (!resolvedDeveloperToken) {
    throw new Error('Google Ads developer token is required via integration data or GOOGLE_ADS_DEVELOPER_TOKEN env')
  }

  if (!loginCustomerId) {
    throw new Error('Google Ads login customer ID is required to fetch metrics')
  }

  const body = {
    query: buildGaqlQuery(timeframeDays),
  }

  const response = await fetch(
    `https://googleads.googleapis.com/v15/customers/${loginCustomerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': resolvedDeveloperToken,
        'login-customer-id': loginCustomerId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    const errorPayload = await response.text()
    throw new Error(`Google Ads API error (${response.status}): ${errorPayload}`)
  }

  const payload = await response.text()
  const lines = payload
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const metrics: NormalizedMetric[] = []

  lines.forEach((line) => {
    try {
      const parsed = JSON.parse(line)
      const results = Array.isArray(parsed.results) ? parsed.results : []
      results.forEach((item: any) => {
        const date = item?.segments?.date
        const spend = normalizeCost(item?.metrics?.costMicros ?? item?.metrics?.cost_micros)
        const conversions = typeof item?.metrics?.conversions === 'number' ? item.metrics.conversions : 0
        const conversionsValue = typeof item?.metrics?.conversionsValue === 'number' ? item.metrics.conversionsValue : null
        const campaignId = item?.campaign?.id ?? 'unknown'
        const campaignName = item?.campaign?.name ?? 'Unknown campaign'

        if (date) {
          metrics.push({
            providerId: 'google',
            date,
            spend,
            impressions: Number(item?.metrics?.impressions ?? 0),
            clicks: Number(item?.metrics?.clicks ?? 0),
            conversions,
            revenue: conversionsValue,
            creatives: undefined,
            rawPayload: item,
          })
        }
      })
    } catch (error) {
      console.error('Failed to parse Google Ads stream chunk:', error)
    }
  })

  return metrics
}
