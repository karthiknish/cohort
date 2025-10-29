import { NormalizedMetric } from '@/types/integrations'

interface LinkedInAdsOptions {
  accessToken: string
  accountId: string
  timeframeDays: number
}

function buildTimeRange(timeframeDays: number) {
  const end = new Date()
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - Math.max(timeframeDays - 1, 0))

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

function normalizeCurrency(value: any): number {
  if (!value) return 0
  if (typeof value === 'object' && 'amount' in value) {
    const amount = (value as any).amount
    return typeof amount === 'number' ? amount : parseFloat(amount)
  }
  if (typeof value === 'string') {
    return parseFloat(value)
  }
  return Number(value) || 0
}

function coerceNumber(value: unknown): number {
  const parsed = typeof value === 'string' ? parseFloat(value) : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function fetchLinkedInAdsMetrics(options: LinkedInAdsOptions): Promise<NormalizedMetric[]> {
  const { accessToken, accountId, timeframeDays } = options

  if (!accessToken) {
    throw new Error('Missing LinkedIn access token')
  }

  if (!accountId) {
    throw new Error('Missing LinkedIn ad account ID on integration')
  }

  const timeRange = buildTimeRange(timeframeDays)

  const params = new URLSearchParams({
    q: 'statistics',
    accounts: `urn:li:sponsoredAccount:${accountId}`,
    timeGranularity: 'DAILY',
    start: timeRange.start,
    end: timeRange.end,
  })

  const response = await fetch(`https://api.linkedin.com/v2/adAnalytics?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
  })

  if (!response.ok) {
    const errorPayload = await response.text()
    throw new Error(`LinkedIn Ads API error (${response.status}): ${errorPayload}`)
  }

  const payload = await response.json()
  const rows: any[] = Array.isArray(payload?.elements) ? payload.elements : []

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
