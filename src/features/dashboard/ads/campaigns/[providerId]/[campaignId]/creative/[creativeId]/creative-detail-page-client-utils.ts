import type { Creative } from '@/features/dashboard/ads/creative/components/types'
import { normalizeStringList } from '@/features/dashboard/ads/creative/components/creative-editing-utils'
import { normalizeCreativeCtaValue } from '@/features/dashboard/ads/creative/components/helpers'
import { toAdsProviderId, type AdsConvexProviderId } from '@/features/dashboard/ads/components/utils'
import { isoDaysAgo } from '@/lib/preview-data'

export type NormalizedAdMetric = {
  providerId: string
  adId: string
  adGroupId?: string
  campaignId: string
  name?: string
  date: string
  impressions: number
  clicks: number
  spend: number
  conversions: number
  revenue: number
  ctr?: number
  cpc?: number
  roas?: number
}

export type ProviderId = AdsConvexProviderId

export function resolveRouteProviderId(value: string): ProviderId | null {
  if (value === 'google' || value === 'tiktok' || value === 'linkedin' || value === 'facebook') {
    return value
  }
  if (value === 'meta') {
    return 'facebook'
  }
  try {
    return toAdsProviderId(value)
  } catch {
    return null
  }
}

export function buildPreviewCreative(
  providerId: ProviderId,
  campaignId: string,
  creativeId: string,
  campaignName: string,
): Creative {
  const baseCreative = {
    providerId,
    creativeId,
    campaignId,
    campaignName,
    status: providerId === 'google' ? 'ENABLED' : 'ACTIVE',
  }

  switch (providerId) {
    case 'linkedin':
      return {
        ...baseCreative,
        name: 'Executive Pipeline Narrative',
        type: 'image',
        headlines: ['Turn paid media into qualified pipeline, not vanity clicks'],
        descriptions: [
          'Position your team as the clear category leader with proof-led creative, sharper ICP targeting, and landing pages designed for decision makers.',
        ],
        imageUrl: 'https://placehold.co/1200x1200/png?text=LinkedIn+Creative',
        landingPageUrl: 'https://techcorp.example/demo',
        callToAction: 'LEARN_MORE',
        pageName: 'Tech Corp',
        pageProfileImageUrl: 'https://placehold.co/80x80/png?text=TC',
        metrics: {
          impressions: 48200,
          clicks: 912,
          spend: 1240,
          conversions: 38,
        },
      }
    case 'google':
      return {
        ...baseCreative,
        name: 'Brand Search Expansion',
        type: 'search',
        headlines: ['Capture demand already looking for you'],
        descriptions: [
          'Tighten intent capture, lower wasted spend, and direct high-intent traffic into a conversion-first landing flow.',
        ],
        landingPageUrl: 'https://startupxyz.example/waitlist',
        callToAction: 'SIGN_UP',
        pageName: 'StartupXYZ',
        metrics: {
          impressions: 36100,
          clicks: 1348,
          spend: 880,
          conversions: 71,
        },
      }
    case 'tiktok':
      return {
        ...baseCreative,
        name: 'Launch Momentum Cutdown',
        type: 'video',
        headlines: ['Make launch week impossible to ignore'],
        descriptions: [
          'Fast-paced product proof, creator energy, and a simple CTA built for waitlist growth during launch week.',
        ],
        imageUrl: 'https://placehold.co/1080x1920/png?text=TikTok+Preview',
        thumbnailUrl: 'https://placehold.co/1080x1920/png?text=TikTok+Preview',
        landingPageUrl: 'https://startupxyz.example/app',
        callToAction: 'DOWNLOAD',
        pageName: 'StartupXYZ',
        pageProfileImageUrl: 'https://placehold.co/80x80/png?text=SX',
        metrics: {
          impressions: 112000,
          clicks: 2840,
          spend: 940,
          conversions: 54,
        },
      }
    case 'facebook':
    default:
      return {
        ...baseCreative,
        name: 'Spring Collection Hero',
        type: 'image',
        headlines: ['Make every scroll feel like a store visit'],
        descriptions: [
          'Showcase your spring collection with dynamic product storytelling, stronger urgency, and repeat-purchase messaging built for higher AOV.',
        ],
        imageUrl: 'https://placehold.co/1200x1200/png?text=Meta+Creative',
        landingPageUrl: 'https://retailstore.example/spring',
        callToAction: 'SHOP_NOW',
        pageName: 'Retail Store',
        pageProfileImageUrl: 'https://placehold.co/80x80/png?text=RS',
        metrics: {
          impressions: 84600,
          clicks: 1834,
          spend: 640,
          conversions: 96,
        },
      }
  }
}

export function buildPreviewCreativeMetrics(
  providerId: ProviderId,
  creativeId: string,
  campaignId: string,
  days: string,
): NormalizedAdMetric[] {
  const dayCount = Math.max(1, Number.parseInt(days, 10) || 7)
  const baseByProvider: Record<
    ProviderId,
    { impressions: number; clicks: number; spend: number; conversions: number; revenue: number }
  > = {
    google: { impressions: 5200, clicks: 180, spend: 126, conversions: 9, revenue: 950 },
    facebook: { impressions: 9800, clicks: 220, spend: 88, conversions: 11, revenue: 760 },
    linkedin: { impressions: 2600, clicks: 52, spend: 178, conversions: 3, revenue: 1100 },
    tiktok: { impressions: 13200, clicks: 320, spend: 104, conversions: 6, revenue: 620 },
  }

  const base = baseByProvider[providerId]

  return Array.from({ length: dayCount }, (_, index) => {
    const impressions = Math.round(base.impressions * (0.88 + index * 0.03))
    const clicks = Math.round(base.clicks * (0.9 + index * 0.025))
    const spend = Math.round(base.spend * (0.92 + index * 0.02) * 100) / 100
    const conversions = Math.round(base.conversions * (0.86 + index * 0.04))
    const revenue = Math.round(base.revenue * (0.9 + index * 0.03))

    return {
      providerId,
      adId: creativeId,
      campaignId,
      date: isoDaysAgo(dayCount - index - 1).split('T')[0] ?? isoDaysAgo(dayCount - index - 1),
      impressions,
      clicks,
      spend,
      conversions,
      revenue,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      roas: spend > 0 ? revenue / spend : 0,
    }
  })
}

export function buildPreviewCopySuggestions(
  kind: 'headlines' | 'captions',
  creative: Creative,
  campaignName: string,
): string[] {
  const baseName = creative.pageName || creative.campaignName || creative.name || campaignName

  if (kind === 'headlines') {
    return [
      `${baseName} with clearer performance proof`,
      `The fastest route from impression to action for ${baseName}`,
      `Creative built to convert high-intent buyers, not just attract clicks`,
    ]
  }

  return [
    `Give ${baseName} a stronger hook, sharper social proof, and a cleaner CTA so the ad does more than win attention. It should push people into the next step with less friction.`,
    `Use this version when you want the first sentence to establish urgency, the middle section to prove credibility, and the close to point directly at the offer.`,
    `This sample caption keeps the message concise while still covering the customer problem, the core promise, and the action worth taking right now.`,
  ]
}
export function buildCreativePreviewCreative(
  creative: Creative,
  editedHeadlines: string[],
  editedDescriptions: string[],
  editedCta: string,
  editedLandingPage: string,
  previewHeadlineIndex: number,
  previewDescriptionIndex: number,
): Creative {
  const headlines = normalizeStringList(editedHeadlines)
  const descriptions = normalizeStringList(editedDescriptions)
  const safeHeadlineIndex = Math.min(Math.max(0, previewHeadlineIndex), Math.max(0, headlines.length - 1))
  const safeDescriptionIndex = Math.min(
    Math.max(0, previewDescriptionIndex),
    Math.max(0, descriptions.length - 1),
  )

  const orderedHeadlines =
    headlines.length > 0
      ? [headlines[safeHeadlineIndex]!, ...headlines.filter((_, i) => i !== safeHeadlineIndex)]
      : creative.headlines
  const orderedDescriptions =
    descriptions.length > 0
      ? [descriptions[safeDescriptionIndex]!, ...descriptions.filter((_, i) => i !== safeDescriptionIndex)]
      : creative.descriptions

  return {
    ...creative,
    headlines: orderedHeadlines,
    descriptions: orderedDescriptions,
    callToAction: editedCta.trim() || creative.callToAction,
    landingPageUrl: editedLandingPage.trim() || creative.landingPageUrl,
  }
}

export function buildCreativePerformanceSummary(
  creativeMetrics: NormalizedAdMetric[] | null,
  convexProviderId: ProviderId | null,
  days: string,
  currency?: string | null,
) {
  if (!creativeMetrics || !convexProviderId) return null

  const totals = creativeMetrics.reduce(
    (acc, m) => {
      acc.impressions += m.impressions
      acc.clicks += m.clicks
      acc.spend += m.spend
      acc.conversions += m.conversions
      acc.revenue += m.revenue
      return acc
    },
    { impressions: 0, clicks: 0, spend: 0, conversions: 0, revenue: 0 },
  )

  const averageRoaS = totals.spend > 0 ? totals.revenue / totals.spend : 0
  const averageCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0

  return {
    providerId: convexProviderId,
    totalSpend: totals.spend,
    totalRevenue: totals.revenue,
    totalClicks: totals.clicks,
    totalConversions: totals.conversions,
    totalImpressions: totals.impressions,
    averageRoaS,
    averageCpc,
    averageCtr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
    averageConvRate: totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0,
    period: `Last ${days} days`,
    dayCount: Number(days),
    ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
    roas: averageRoaS,
    cpc: averageCpc,
    currency: currency ?? undefined,
  }
}
