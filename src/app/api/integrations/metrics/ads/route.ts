import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/api-errors'
import { getAdIntegration } from '@/lib/firestore-integrations-admin'
import { ensureGoogleAccessToken } from '@/lib/integration-token-refresh'

import { fetchGoogleAdMetrics, fetchGoogleAdGroupMetrics, GoogleAdMetric } from '@/services/integrations/google-ads'
import { fetchTikTokAdMetrics, TikTokAdMetric } from '@/services/integrations/tiktok-ads'
import { fetchLinkedInCreativeMetrics, LinkedInCreativeMetric } from '@/services/integrations/linkedin-ads'


// =============================================================================
// SCHEMAS
// =============================================================================

const querySchema = z.object({
  providerId: z.enum(['google', 'tiktok', 'linkedin']),
  campaignId: z.string().optional(),
  adGroupId: z.string().optional(),
  level: z.enum(['ad', 'adGroup', 'creative']).optional().default('ad'),
  days: z.string().optional().default('7'),
})

// =============================================================================
// TYPES
// =============================================================================

type NormalizedAdMetric = {
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

// =============================================================================
// HELPERS
// =============================================================================

function normalizeGoogleMetrics(metrics: GoogleAdMetric[]): NormalizedAdMetric[] {
  return metrics.map((m) => {
    const ctr = m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0
    const cpc = m.clicks > 0 ? m.spend / m.clicks : 0
    const roas = m.spend > 0 ? m.revenue / m.spend : 0

    return {
      providerId: 'google',
      adId: m.adId,
      adGroupId: m.adGroupId,
      campaignId: m.campaignId,
      name: m.headline,
      date: m.date,
      impressions: m.impressions,
      clicks: m.clicks,
      spend: m.spend,
      conversions: m.conversions,
      revenue: m.revenue,
      ctr,
      cpc,
      roas,
    }
  })
}

function normalizeTikTokMetrics(metrics: TikTokAdMetric[]): NormalizedAdMetric[] {
  return metrics.map((m) => {
    const ctr = m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0
    const cpc = m.clicks > 0 ? m.spend / m.clicks : 0
    const roas = m.spend > 0 ? m.revenue / m.spend : 0

    return {
      providerId: 'tiktok',
      adId: m.adId,
      adGroupId: m.adGroupId,
      campaignId: m.campaignId,
      name: m.adName,
      date: m.date,
      impressions: m.impressions,
      clicks: m.clicks,
      spend: m.spend,
      conversions: m.conversions,
      revenue: m.revenue,
      ctr,
      cpc,
      roas,
    }
  })
}

function normalizeLinkedInMetrics(metrics: LinkedInCreativeMetric[]): NormalizedAdMetric[] {
  return metrics.map((m) => {
    const ctr = m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0
    const cpc = m.clicks > 0 ? m.spend / m.clicks : 0
    const roas = m.spend > 0 ? m.revenue / m.spend : 0

    return {
      providerId: 'linkedin',
      adId: m.creativeId,
      adGroupId: m.campaignGroupId,
      campaignId: m.campaignId,
      name: undefined,
      date: m.date,
      impressions: m.impressions,
      clicks: m.clicks,
      spend: m.spend,
      conversions: m.conversions,
      revenue: m.revenue,
      ctr,
      cpc,
      roas,
    }
  })
}

// =============================================================================
// GET - Fetch Ad-Level Metrics
// =============================================================================

export const GET = createApiHandler(
  {
    querySchema,
    rateLimit: 'standard',
  },
  async (req, { auth, query }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const { providerId, campaignId, adGroupId, level, days } = query
    const timeframeDays = parseInt(days, 10) || 7

    const integration = await getAdIntegration({ userId: auth.uid, providerId })
    if (!integration) {
      throw new NotFoundError(`${providerId} integration not found`)
    }

    let metrics: NormalizedAdMetric[] = []

    if (providerId === 'google') {
      const accessToken = await ensureGoogleAccessToken({ userId: auth.uid })
      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''
      const customerId = integration.accountId ?? ''
      const loginCustomerId = integration.loginCustomerId

      if (!customerId) {
        throw new BadRequestError('Google Ads customer ID not configured')
      }

      if (level === 'adGroup') {
        const googleMetrics = await fetchGoogleAdGroupMetrics({
          accessToken,
          developerToken,
          customerId,
          campaignId,
          loginCustomerId,
          timeframeDays,
        })
        metrics = normalizeGoogleMetrics(googleMetrics)
      } else {
        const googleMetrics = await fetchGoogleAdMetrics({
          accessToken,
          developerToken,
          customerId,
          campaignId,
          adGroupId,
          loginCustomerId,
          timeframeDays,
        })
        metrics = normalizeGoogleMetrics(googleMetrics)
      }
    } else if (providerId === 'tiktok') {
      const accessToken = integration.accessToken
      const advertiserId = integration.accountId

      if (!accessToken || !advertiserId) {
        throw new BadRequestError('TikTok credentials not configured')
      }

      const tiktokMetrics = await fetchTikTokAdMetrics({
        accessToken,
        advertiserId,
        campaignId,
        timeframeDays,
      })

      metrics = normalizeTikTokMetrics(tiktokMetrics)
    } else if (providerId === 'linkedin') {
      const accessToken = integration.accessToken
      const accountId = integration.accountId

      if (!accessToken || !accountId) {
        throw new BadRequestError('LinkedIn credentials not configured')
      }

      const linkedInMetrics = await fetchLinkedInCreativeMetrics({
        accessToken,
        accountId,
        campaignId,
        timeframeDays,
      })

      metrics = normalizeLinkedInMetrics(linkedInMetrics)
    }

    return {
      metrics,
      summary: {
        totalImpressions: metrics.reduce((sum, m) => sum + m.impressions, 0),
        totalClicks: metrics.reduce((sum, m) => sum + m.clicks, 0),
        totalSpend: metrics.reduce((sum, m) => sum + m.spend, 0),
        totalConversions: metrics.reduce((sum, m) => sum + m.conversions, 0),
        totalRevenue: metrics.reduce((sum, m) => sum + m.revenue, 0),
      },
    }
  }
)
