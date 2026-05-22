export type CampaignAd = {
  providerId: string
  creativeId: string
  adId?: string
  platformCreativeId?: string
  adGroupId?: string
  campaignId: string
  campaignName?: string
  name?: string
  type: string
  status: string
  headlines?: string[]
  descriptions?: string[]
  imageUrl?: string
  videoUrl?: string
  videoId?: string
  imageHash?: string
  landingPageUrl?: string
  callToAction?: string
  pageName?: string
  pageProfileImageUrl?: string
  instagramPermalinkUrl?: string
  objectStoryId?: string
  objectType?: string
  pageId?: string
  instagramActorId?: string
  assetFeedSpec?: string
  destinationSpec?: {
    url?: string
    fallback_url?: string
    additional_urls?: string[]
  }
  metrics?: {
    spend: number
    impressions: number
    clicks: number
    conversions: number
    revenue: number
    ctr: number
    cpc: number
    roas: number
  }
}

export type CreativePerformanceMetrics = {
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  cpc: number
  cpa: number
  roas: number
}

export type CreativeSortKey = 'spend' | 'conversions' | 'ctr' | 'roas' | 'name'

export type CreativeInsightKind = 'top-spend' | 'best-roas' | 'high-ctr' | 'needs-review'

export type CreativeTotals = CreativePerformanceMetrics & {
  activeAds: number
  adsWithSpend: number
}

export function deriveCreativeMetrics(raw?: {
  spend?: number
  impressions?: number
  clicks?: number
  conversions?: number
  revenue?: number
} | null): CreativePerformanceMetrics | null {
  if (!raw) return null

  const spend = raw.spend ?? 0
  const impressions = raw.impressions ?? 0
  const clicks = raw.clicks ?? 0
  const conversions = raw.conversions ?? 0
  const revenue = raw.revenue ?? 0

  return {
    spend,
    impressions,
    clicks,
    conversions,
    revenue,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    cpc: clicks > 0 ? spend / clicks : 0,
    cpa: conversions > 0 ? spend / conversions : 0,
    roas: spend > 0 ? revenue / spend : 0,
  }
}

export function getMetricsForAd(
  ad: CampaignAd,
  adMetrics: Record<string, CreativePerformanceMetrics | undefined>,
): CreativePerformanceMetrics | null {
  return adMetrics[ad.creativeId] ?? deriveCreativeMetrics(ad.metrics) ?? null
}

export function computeCreativeTotals(
  ads: CampaignAd[],
  adMetrics: Record<string, CreativePerformanceMetrics | undefined>,
): CreativeTotals {
  const empty: CreativeTotals = {
    spend: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
    ctr: 0,
    cpc: 0,
    cpa: 0,
    roas: 0,
    activeAds: ads.length,
    adsWithSpend: 0,
  }

  let adsWithSpend = 0

  const totals = ads.reduce((acc, ad) => {
    const metrics = getMetricsForAd(ad, adMetrics)
    if (!metrics || metrics.spend <= 0) return acc
    adsWithSpend += 1
    acc.spend += metrics.spend
    acc.impressions += metrics.impressions
    acc.clicks += metrics.clicks
    acc.conversions += metrics.conversions
    acc.revenue += metrics.revenue
    return acc
  }, empty)

  totals.adsWithSpend = adsWithSpend
  totals.ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
  totals.cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0
  totals.cpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0
  totals.roas = totals.spend > 0 ? totals.revenue / totals.spend : 0

  return totals
}

export function sortCreativesByMetric(
  ads: CampaignAd[],
  adMetrics: Record<string, CreativePerformanceMetrics | undefined>,
  sortKey: CreativeSortKey,
): CampaignAd[] {
  const sorted = [...ads]

  sorted.sort((a, b) => {
    if (sortKey === 'name') {
      const nameA = (a.name || a.headlines?.[0] || a.creativeId).toLowerCase()
      const nameB = (b.name || b.headlines?.[0] || b.creativeId).toLowerCase()
      return nameA.localeCompare(nameB)
    }

    const metricsA = getMetricsForAd(a, adMetrics)
    const metricsB = getMetricsForAd(b, adMetrics)

    const valueA = metricsA?.[sortKey] ?? -1
    const valueB = metricsB?.[sortKey] ?? -1

    if (valueB !== valueA) return valueB - valueA
    return (metricsB?.spend ?? 0) - (metricsA?.spend ?? 0)
  })

  return sorted
}

export function resolveCreativeInsights(
  ads: CampaignAd[],
  adMetrics: Record<string, CreativePerformanceMetrics | undefined>,
): Map<string, CreativeInsightKind> {
  const insights = new Map<string, CreativeInsightKind>()
  const withMetrics = ads.flatMap((ad) => {
    const metrics = getMetricsForAd(ad, adMetrics)
    return metrics ? [{ ad, metrics }] : []
  })

  if (withMetrics.length === 0) return insights

  const totals = computeCreativeTotals(ads, adMetrics)
  const avgCtr = totals.ctr

  let topSpendId: string | null = null
  let topSpend = -1
  let bestRoasId: string | null = null
  let bestRoas = -1
  let highCtrId: string | null = null
  let highCtr = -1

  for (const { ad, metrics } of withMetrics) {
    if (metrics.spend > topSpend) {
      topSpend = metrics.spend
      topSpendId = ad.creativeId
    }

    if (metrics.spend >= 5 && metrics.roas > bestRoas) {
      bestRoas = metrics.roas
      bestRoasId = ad.creativeId
    }

    if (metrics.impressions >= 500 && metrics.ctr > highCtr) {
      highCtr = metrics.ctr
      highCtrId = ad.creativeId
    }

    const needsReview =
      metrics.spend >= 25 &&
      (metrics.conversions === 0 || (avgCtr > 0 && metrics.ctr < avgCtr * 0.5))

    if (needsReview) {
      insights.set(ad.creativeId, 'needs-review')
    }
  }

  if (topSpendId) insights.set(topSpendId, 'top-spend')
  if (bestRoasId && bestRoasId !== topSpendId) insights.set(bestRoasId, 'best-roas')
  if (highCtrId && !insights.has(highCtrId)) insights.set(highCtrId, 'high-ctr')

  return insights
}

export const CREATIVE_INSIGHT_LABELS: Record<CreativeInsightKind, { label: string; className: string }> = {
  'top-spend': {
    label: 'Top spend',
    className: 'border-primary/25 bg-primary/10 text-primary',
  },
  'best-roas': {
    label: 'Best ROAS',
    className: 'border-success/25 bg-success/10 text-success',
  },
  'high-ctr': {
    label: 'High CTR',
    className: 'border-info/25 bg-info/10 text-info',
  },
  'needs-review': {
    label: 'Review',
    className: 'border-warning/25 bg-warning/10 text-warning',
  },
}
