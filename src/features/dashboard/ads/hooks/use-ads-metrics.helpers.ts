import { endOfDay, isWithinInterval, startOfDay } from 'date-fns'

import { normalizeAdsProviderId, isCanonicalAdsProvider } from '@/domain/ads/provider'

import type { AdsInsightsSummary, MetricRecord, MetricsSummary, ProviderSummary, Totals } from '../components/types'
import type { DateRange } from '../components/date-range-picker'

const NON_ADS_PROVIDER_ALIASES = new Set([
  'google_analytics',
  'google-analytics',
  'googleanalytics',
  'ga',
  'ga4',
])

export type RealtimeMetricRow = {
  providerId?: string | null
  accountId?: string | null
  currency?: string | null
  currencySource?: string | null
  surfaceId?: string | null
  publisherPlatform?: string | null
  campaignId?: string | null
  date?: string | null
  spend?: number | null
  impressions?: number | null
  clicks?: number | null
  conversions?: number | null
  revenue?: number | null
  createdAtMs?: number | null
}

export function isAdsProviderId(providerId: string | null | undefined): boolean {
  const raw = String(providerId ?? '').trim().toLowerCase()
  if (!raw || NON_ADS_PROVIDER_ALIASES.has(raw)) return false
  return isCanonicalAdsProvider(raw)
}

export function mapRealtimeMetricRow(row: RealtimeMetricRow): MetricRecord {
  const normalizedProviderId =
    normalizeAdsProviderId(String(row.providerId ?? 'unknown')) ?? String(row.providerId ?? 'unknown')
  const accountId = typeof row.accountId === 'string' ? row.accountId : null
  const currency = typeof row.currency === 'string' && row.currency.length > 0 ? row.currency : null
  const currencySource = typeof row.currencySource === 'string' ? row.currencySource : null
  const surfaceId = typeof row.surfaceId === 'string' && row.surfaceId.length > 0
    ? row.surfaceId
    : null
  const publisherPlatform = typeof row.publisherPlatform === 'string' && row.publisherPlatform.length > 0
    ? row.publisherPlatform
    : null
  const campaignId = typeof row.campaignId === 'string' && row.campaignId.length > 0
    ? row.campaignId
    : null
  const createdAtMs = typeof row.createdAtMs === 'number' ? row.createdAtMs : null
  const date = String(row.date ?? '')

  // Dedup key includes surfaceId (canonical) so Meta surface breakdowns are preserved.
  const surface = surfaceId ?? publisherPlatform ?? ''

  return {
    id: `${normalizedProviderId}:${accountId ?? ''}:${surface}:${campaignId ?? ''}:${date}:${createdAtMs ?? ''}`,
    providerId: normalizedProviderId,
    accountId,
    currency,
    currencySource: currencySource as MetricRecord['currencySource'],
    surfaceId,
    publisherPlatform,
    campaignId,
    date,
    spend: Number(row.spend ?? 0),
    impressions: Number(row.impressions ?? 0),
    clicks: Number(row.clicks ?? 0),
    conversions: Number(row.conversions ?? 0),
    revenue: row.revenue === null || row.revenue === undefined ? null : Number(row.revenue),
    createdAt: createdAtMs === null ? null : new Date(createdAtMs).toISOString(),
  }
}

/** Parse YYYY-MM-DD (and ISO prefixes) as a local calendar day — avoids UTC shift dropping rows. */
export function parseMetricDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || dateStr === 'unknown') {
    return null
  }

  const datePart = dateStr.split('T')[0]?.trim() ?? ''
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart)
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    if (year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return startOfDay(new Date(year, month - 1, day))
    }
  }

  const parsed = new Date(dateStr)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return startOfDay(parsed)
}

export function isMetricDateInRange(dateStr: string, range: DateRange): boolean {
  const parsed = parseMetricDate(dateStr)
  if (!parsed) {
    return false
  }

  return isWithinInterval(parsed, {
    start: startOfDay(range.start),
    end: endOfDay(range.end),
  })
}

export function dedupeAndFilterMetrics(metrics: MetricRecord[], dateRange: DateRange): MetricRecord[] {
  const uniqueMap = new Map<string, MetricRecord>()
  metrics.forEach((m) => {
    const accountId = m.accountId ?? ''
    const platform = m.publisherPlatform ?? m.surfaceId ?? ''
    const campaign = m.campaignId ?? ''
    const key = `${m.providerId}|${accountId}|${platform}|${campaign}|${m.date}`
    const existing = uniqueMap.get(key)
    if (!existing || (m.createdAt && existing.createdAt && m.createdAt > existing.createdAt)) {
      uniqueMap.set(key, m)
    } else if (!existing?.createdAt && m.createdAt) {
      uniqueMap.set(key, m)
    }
  })

  return Array.from(uniqueMap.values())
    .filter((m) => isMetricDateInRange(m.date, dateRange))
    .sort((a, b) => {
      const aDate = parseMetricDate(a.date)?.getTime() ?? 0
      const bDate = parseMetricDate(b.date)?.getTime() ?? 0
      return bDate - aDate
    })
}

const EMPTY_TOTALS: Totals = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }

export function metricsSummaryFromV2Insights(summary: AdsInsightsSummary | null | undefined): MetricsSummary | null {
  if (!summary) {
    return null
  }

  const providers: Record<string, Totals> = {}
  for (const provider of summary.providers) {
    const normalized = normalizeAdsProviderId(provider.providerId) ?? provider.providerId
    const delivery = provider.deliveryTotals
    const financial = provider.financialTotals
    providers[normalized] = {
      spend: financial.comparability === 'single_currency' ? Number(financial.spend ?? 0) : 0,
      impressions: delivery.impressions,
      clicks: delivery.clicks,
      conversions: delivery.conversions,
      revenue: financial.comparability === 'single_currency' ? Number(financial.revenue ?? 0) : 0,
    }
  }

  const delivery = summary.deliveryTotals
  const financial = summary.financialTotals

  return {
    totals: {
      spend: financial.comparability === 'single_currency' ? Number(financial.spend ?? 0) : 0,
      impressions: delivery.impressions,
      clicks: delivery.clicks,
      conversions: delivery.conversions,
      revenue: financial.comparability === 'single_currency' ? Number(financial.revenue ?? 0) : 0,
    },
    providers,
    count: summary.count,
  }
}

export function hasAdsMetricActivity(
  processedMetrics: MetricRecord[],
  serverSideSummary: MetricsSummary | null | undefined,
  adsInsightsSummary: AdsInsightsSummary | null | undefined,
): boolean {
  if (processedMetrics.length > 0) {
    return true
  }

  const legacy = serverSideSummary?.totals
  if (legacy && (legacy.spend > 0 || legacy.impressions > 0 || legacy.clicks > 0)) {
    return true
  }

  const v2 = adsInsightsSummary
  if (!v2) {
    return false
  }

  const delivery = v2.deliveryTotals
  if (delivery.impressions > 0 || delivery.clicks > 0 || delivery.conversions > 0) {
    return true
  }

  const financial = v2.financialTotals
  return financial.comparability === 'single_currency' && Number(financial.spend ?? 0) > 0
}

export function buildProviderSummariesFromServer(
  providers: Record<string, ProviderSummary> | null | undefined,
): Record<string, ProviderSummary> {
  if (!providers) {
    return {}
  }

  return Object.entries(providers).reduce<Record<string, ProviderSummary>>((acc, [providerId, totals]) => {
    if (!isAdsProviderId(providerId)) {
      return acc
    }

    const normalizedProviderId =
      normalizeAdsProviderId(providerId) ?? providerId
    const providerSummary = acc[normalizedProviderId] ?? {
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
    }
    providerSummary.spend += Number(totals.spend ?? 0)
    providerSummary.impressions += Number(totals.impressions ?? 0)
    providerSummary.clicks += Number(totals.clicks ?? 0)
    providerSummary.conversions += Number(totals.conversions ?? 0)
    providerSummary.revenue += Number(totals.revenue ?? 0)
    acc[normalizedProviderId] = providerSummary
    return acc
  }, {})
}