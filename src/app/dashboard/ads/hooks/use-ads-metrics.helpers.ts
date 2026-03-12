import { normalizeAdsProviderId, isCanonicalAdsProvider } from '@/domain/ads/provider'

import type { MetricRecord, ProviderSummary } from '../components/types'

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