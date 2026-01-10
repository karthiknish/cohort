import { CampaignMetrics } from '@/types'
import { fetchGoogleAdsMetrics } from '@/services/integrations/google-ads'
import { fetchMetaAdsMetrics } from '@/services/integrations/meta-ads'
import { fetchTikTokAdsMetrics } from '@/services/integrations/tiktok-ads'
import { fetchLinkedInAdsMetrics } from '@/services/integrations/linkedin-ads'
import { NormalizedMetric } from '@/types/integrations'
import { BadRequestError } from '@/lib/api-errors'

export type PlatformCredentials = Record<string, string>

export interface CampaignOverview {
  id: string
  name?: string
  referenceId?: string
  [key: string]: unknown
}

export interface AdPlatform {
  name: string
  authenticate: (credentials: PlatformCredentials) => Promise<boolean>
  getCampaigns: (accountId: string, credentials?: PlatformCredentials) => Promise<CampaignOverview[]>
  getMetrics: (campaignId: string, dateRange: { start: Date; end: Date }, credentials?: PlatformCredentials) => Promise<CampaignMetrics[]>
}

function mapToCampaignMetrics(metric: NormalizedMetric): CampaignMetrics {
  const spend = metric.spend || 0
  const clicks = metric.clicks || 0
  const impressions = metric.impressions || 0
  const conversions = metric.conversions || 0
  const revenue = metric.revenue || 0

  return {
    campaignId: metric.campaignId || 'unknown',
    platform: metric.providerId,
    date: new Date(metric.date),
    budget: 0, // Not available in NormalizedMetric
    spend,
    clicks,
    impressions,
    conversions,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    cpc: clicks > 0 ? spend / clicks : 0,
    cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
    conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
    cpl: conversions > 0 ? spend / conversions : 0,
    revenue,
    roas: spend > 0 ? revenue / spend : 0,
  }
}

export class GoogleAdsService implements AdPlatform {
  name = 'Google Ads'

  async authenticate(credentials: PlatformCredentials) {
    return !!credentials.accessToken
  }

  async getCampaigns(accountId: string, credentials?: PlatformCredentials): Promise<CampaignOverview[]> {
    if (!credentials?.accessToken) return []
    try {
      // Fetch metrics for last 30 days to discover campaigns
      const metrics = await fetchGoogleAdsMetrics({
        accessToken: credentials.accessToken,
        developerToken: credentials.developerToken,
        customerId: accountId,
        timeframeDays: 30,
      })

      const campaigns = new Map<string, CampaignOverview>()
      metrics.forEach(m => {
        if (m.campaignId && !campaigns.has(m.campaignId)) {
          campaigns.set(m.campaignId, {
            id: m.campaignId,
            name: m.campaignName
          })
        }
      })
      return Array.from(campaigns.values())
    } catch (error) {
      console.error('Failed to fetch Google Ads campaigns:', error)
      return []
    }
  }

  async getMetrics(campaignId: string, dateRange: { start: Date; end: Date }, credentials?: PlatformCredentials) {
    if (!credentials?.accessToken) return []
    try {
      const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
      const metrics = await fetchGoogleAdsMetrics({
        accessToken: credentials.accessToken,
        developerToken: credentials.developerToken,
        customerId: credentials.accountId || '', // Assuming accountId is passed in credentials or we need to change interface
        timeframeDays: days,
      })

      return metrics
        .filter(m => m.campaignId === campaignId)
        .map(mapToCampaignMetrics)
    } catch (error) {
      console.error('Failed to fetch Google Ads metrics:', error)
      return []
    }
  }
}

export class MetaAdsService implements AdPlatform {
  name = 'Meta Ads'

  async authenticate(credentials: PlatformCredentials) {
    return !!credentials.accessToken
  }

  async getCampaigns(accountId: string, credentials?: PlatformCredentials): Promise<CampaignOverview[]> {
    if (!credentials?.accessToken) return []
    try {
      const metrics = await fetchMetaAdsMetrics({
        accessToken: credentials.accessToken,
        adAccountId: accountId,
        timeframeDays: 30,
      })

      const campaigns = new Map<string, CampaignOverview>()
      metrics.forEach(m => {
        if (m.campaignId && !campaigns.has(m.campaignId)) {
          campaigns.set(m.campaignId, {
            id: m.campaignId,
            name: m.campaignName
          })
        }
      })
      return Array.from(campaigns.values())
    } catch (error) {
      console.error('Failed to fetch Meta Ads campaigns:', error)
      return []
    }
  }

  async getMetrics(campaignId: string, dateRange: { start: Date; end: Date }, credentials?: PlatformCredentials) {
    if (!credentials?.accessToken || !credentials?.accountId) return []
    try {
      const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
      const metrics = await fetchMetaAdsMetrics({
        accessToken: credentials.accessToken,
        adAccountId: credentials.accountId,
        timeframeDays: days,
      })

      return metrics
        .filter(m => m.campaignId === campaignId)
        .map(mapToCampaignMetrics)
    } catch (error) {
      console.error('Failed to fetch Meta Ads metrics:', error)
      return []
    }
  }
}

export class TikTokAdsService implements AdPlatform {
  name = 'TikTok Ads'

  async authenticate(credentials: PlatformCredentials) {
    return !!credentials.accessToken
  }

  async getCampaigns(accountId: string, credentials?: PlatformCredentials): Promise<CampaignOverview[]> {
    if (!credentials?.accessToken) return []
    try {
      const metrics = await fetchTikTokAdsMetrics({
        accessToken: credentials.accessToken,
        advertiserId: accountId,
        timeframeDays: 30,
      })

      const campaigns = new Map<string, CampaignOverview>()
      metrics.forEach(m => {
        if (m.campaignId && !campaigns.has(m.campaignId)) {
          campaigns.set(m.campaignId, {
            id: m.campaignId,
            name: m.campaignName
          })
        }
      })
      return Array.from(campaigns.values())
    } catch (error) {
      console.error('Failed to fetch TikTok Ads campaigns:', error)
      return []
    }
  }

  async getMetrics(campaignId: string, dateRange: { start: Date; end: Date }, credentials?: PlatformCredentials) {
    if (!credentials?.accessToken || !credentials?.accountId) return []
    try {
      const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
      const metrics = await fetchTikTokAdsMetrics({
        accessToken: credentials.accessToken,
        advertiserId: credentials.accountId,
        timeframeDays: days,
      })

      return metrics
        .filter(m => m.campaignId === campaignId)
        .map(mapToCampaignMetrics)
    } catch (error) {
      console.error('Failed to fetch TikTok Ads metrics:', error)
      return []
    }
  }
}

export class LinkedInAdsService implements AdPlatform {
  name = 'LinkedIn Ads'

  async authenticate(credentials: PlatformCredentials) {
    return !!credentials.accessToken
  }

  async getCampaigns(accountId: string, credentials?: PlatformCredentials): Promise<CampaignOverview[]> {
    if (!credentials?.accessToken) return []
    try {
      const metrics = await fetchLinkedInAdsMetrics({
        accessToken: credentials.accessToken,
        accountId: accountId,
        timeframeDays: 30,
      })

      // LinkedIn metrics might not always have campaign breakdown depending on the API call
      // But NormalizedMetric has campaignId field
      const campaigns = new Map<string, CampaignOverview>()
      metrics.forEach(m => {
        if (m.campaignId && !campaigns.has(m.campaignId)) {
          campaigns.set(m.campaignId, {
            id: m.campaignId,
            name: m.campaignName
          })
        }
      })
      return Array.from(campaigns.values())
    } catch (error) {
      console.error('Failed to fetch LinkedIn Ads campaigns:', error)
      return []
    }
  }

  async getMetrics(campaignId: string, dateRange: { start: Date; end: Date }, credentials?: PlatformCredentials) {
    if (!credentials?.accessToken || !credentials?.accountId) return []
    try {
      const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
      const metrics = await fetchLinkedInAdsMetrics({
        accessToken: credentials.accessToken,
        accountId: credentials.accountId,
        timeframeDays: days,
      })

      return metrics
        .filter(m => m.campaignId === campaignId)
        .map(mapToCampaignMetrics)
    } catch (error) {
      console.error('Failed to fetch LinkedIn Ads metrics:', error)
      return []
    }
  }
}

export class AdsManager {
  private platforms: Map<string, AdPlatform> = new Map()

  constructor() {
    this.platforms.set('google', new GoogleAdsService())
    this.platforms.set('meta', new MetaAdsService())
    this.platforms.set('tiktok', new TikTokAdsService())
    this.platforms.set('linkedin', new LinkedInAdsService())
  }

  getPlatform(platform: string): AdPlatform | undefined {
    return this.platforms.get(platform)
  }

  async getAllMetrics(
    connectedAccounts: Array<{ platform: string; accountId: string; credentials?: PlatformCredentials }>,
    dateRange: { start: Date; end: Date }
  ): Promise<CampaignMetrics[]> {
    const allMetrics: CampaignMetrics[] = []

    for (const account of connectedAccounts) {
      const platform = this.getPlatform(account.platform)
      if (!platform) continue

      try {
        // We need to fetch campaigns first to get IDs, or we can modify getMetrics to fetch all if no campaignId is provided
        // But getMetrics signature requires campaignId.
        // Let's assume we want all metrics for the account.
        // The underlying fetch...Metrics functions return all metrics for the account.
        // So we can expose a new method or reuse getMetrics with a dummy ID or modify the interface.
        // For now, let's iterate campaigns.
        const campaigns = await platform.getCampaigns(account.accountId, account.credentials)

        for (const campaign of campaigns) {
          const metrics = await platform.getMetrics(campaign.id, dateRange, account.credentials)
          allMetrics.push(...metrics)
        }
      } catch (error) {
        console.error(`Failed to fetch metrics for ${account.platform}:`, error)
      }
    }

    return allMetrics
  }

  async authenticatePlatform(platform: string, credentials: PlatformCredentials): Promise<boolean> {
    const service = this.getPlatform(platform)
    if (!service) {
      throw new BadRequestError(`Unsupported platform: ${platform}`)
    }

    return await service.authenticate(credentials)
  }
}

export const adsManager = new AdsManager()
