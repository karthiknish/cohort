// =============================================================================
// LINKEDIN ADS CAMPAIGNS - Creative and Metrics Operations
// =============================================================================

import {
  buildTimeRange,
  formatDate,
  normalizeCurrency,
  coerceNumber,
} from '../client'
import { linkedinAdsClient } from '@/services/integrations/shared/base-client'
import {
  LinkedInCreative,
  LinkedInCreativeMetric,
} from '../types'

// =============================================================================
// URN RESOLUTION
// =============================================================================

export async function resolveLinkedInUrns(options: {
  accessToken: string
  urns: string[]
  maxRetries?: number
}): Promise<Record<string, string>> {
  const { accessToken, urns, maxRetries = 3 } = options
  if (urns.length === 0) return {}

  const uniqueUrns = Array.from(new Set(urns))
  const results: Record<string, string> = {}

  const videoUrns = uniqueUrns.filter(u => u.includes('digitalmediaAsset'))
  const imageUrns = uniqueUrns.filter(u => u.includes('image'))

  await Promise.all([
    ...videoUrns.map(async (urn) => {
      try {
        const id = urn.split(':').pop()
        const url = `https://api.linkedin.com/v2/videos/${id}`
        const { payload } = await linkedinAdsClient.executeRequest<{ downloadUrl?: string }>({
          url,
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}` },
          operation: 'resolveVideo',
          maxRetries,
        })
        if (payload.downloadUrl) results[urn] = payload.downloadUrl
      } catch (e) {
        console.warn(`Failed to resolve video URN: ${urn}`, e)
      }
    }),
    ...imageUrns.map(async (urn) => {
      try {
        const id = urn.split(':').pop()
        const url = `https://api.linkedin.com/v2/images/${id}`
        const { payload } = await linkedinAdsClient.executeRequest<{ downloadUrl?: string }>({
          url,
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}` },
          operation: 'resolveImage',
          maxRetries,
        })
        if (payload.downloadUrl) results[urn] = payload.downloadUrl
      } catch (e) {
        console.warn(`Failed to resolve image URN: ${urn}`, e)
      }
    })
  ])

  return results
}

// =============================================================================
// FETCH CREATIVE-LEVEL METRICS
// =============================================================================

export async function fetchLinkedInCreativeMetrics(options: {
  accessToken: string
  accountId: string
  campaignId?: string
  timeframeDays: number
  maxRetries?: number
}): Promise<LinkedInCreativeMetric[]> {
  const {
    accessToken,
    accountId,
    campaignId,
    timeframeDays,
    maxRetries = 3,
  } = options

  const timeRange = buildTimeRange(timeframeDays)

  const params = new URLSearchParams({
    q: 'statistics',
    accounts: `urn:li:sponsoredAccount:${accountId}`,
    pivot: 'CREATIVE',
    timeGranularity: 'DAILY',
    start: timeRange.start,
    end: timeRange.end,
  })

  if (campaignId) {
    params.set('campaigns', `urn:li:sponsoredCampaign:${campaignId}`)
  }

  const url = `https://api.linkedin.com/v2/adAnalytics?${params.toString()}`

  const { payload } = await linkedinAdsClient.executeRequest<{
    elements?: Array<{
      creative?: string
      campaignGroup?: string
      campaign?: string
      timeRange?: { start?: string }
      costInLocalCurrency?: unknown
      impressions?: unknown
      clicks?: unknown
      conversions?: unknown
      externalWebsiteConversionsValue?: unknown
    }>
  }>({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    operation: 'fetchCreativeMetrics',
    maxRetries,
  })

  const elements = Array.isArray(payload?.elements) ? payload.elements : []

  return elements.map((row) => {
    const creativeId = row.creative?.replace('urn:li:sponsoredCreative:', '') ?? ''
    const campaignIdFromRow = row.campaign?.replace('urn:li:sponsoredCampaign:', '') ?? ''
    const campaignGroupId = row.campaignGroup?.replace('urn:li:sponsoredCampaignGroup:', '')
    const date = row.timeRange?.start ? formatDate(row.timeRange.start, 'yyyy-MM-dd') : ''

    return {
      creativeId,
      campaignId: campaignIdFromRow,
      campaignGroupId,
      date,
      impressions: coerceNumber(row.impressions),
      clicks: coerceNumber(row.clicks),
      spend: normalizeCurrency(row.costInLocalCurrency),
      conversions: coerceNumber(row.conversions),
      revenue: normalizeCurrency(row.externalWebsiteConversionsValue),
    }
  })
}

// =============================================================================
// FETCH CREATIVES
// =============================================================================

export async function fetchLinkedInCreatives(options: {
  accessToken: string
  accountId: string
  campaignId?: string
  statusFilter?: ('ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'CANCELED' | 'DRAFT')[]
  maxRetries?: number
}): Promise<LinkedInCreative[]> {
  const {
    accessToken,
    accountId,
    campaignId,
    statusFilter = ['ACTIVE', 'PAUSED', 'ARCHIVED', 'CANCELED', 'DRAFT'],
    maxRetries = 3,
  } = options

  const params = new URLSearchParams({
    q: 'search',
    'search.account.values[0]': `urn:li:sponsoredAccount:${accountId}`,
    count: '100',
  })

  statusFilter.forEach((status, index) => {
    params.set(`search.status.values[${index}]`, status)
  })

  if (campaignId) {
    params.set('search.campaign.values[0]', `urn:li:sponsoredCampaign:${campaignId}`)
  }

  const url = `https://api.linkedin.com/v2/adCreativesV2?${params.toString()}`

  const { payload } = await linkedinAdsClient.executeRequest<{
    elements?: Array<{
      id?: string
      campaign?: string
      campaignGroup?: string
      status?: string
      type?: string
      reference?: string
      variables?: {
        data?: {
          'com.linkedin.ads.SponsoredUpdateCreativeVariables'?: {
            activity?: string
          }
          'com.linkedin.ads.TextAdCreativeVariables'?: {
            title?: string
            text?: string
            vectorImage?: string
          }
          'com.linkedin.ads.VideoCreativeVariables'?: {
            videoUrn?: string
          }
        }
      }
      callToAction?: {
        labelType?: string
        target?: string
      }
    }>
  }>({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202310',
    },
    operation: 'fetchCreatives',
    maxRetries,
  })

  const elements = Array.isArray(payload?.elements) ? payload.elements : []

  // Collect all URNs that need resolution
  const urnsToResolve: string[] = []
  elements.forEach(item => {
    const textAdVars = item.variables?.data?.['com.linkedin.ads.TextAdCreativeVariables']
    const videoVars = item.variables?.data?.['com.linkedin.ads.VideoCreativeVariables']
    if (textAdVars?.vectorImage) urnsToResolve.push(textAdVars.vectorImage)
    if (videoVars?.videoUrn) urnsToResolve.push(videoVars.videoUrn)
  })

  // Resolve URNs in batch
  const resolvedUrls = await resolveLinkedInUrns({ accessToken, urns: urnsToResolve, maxRetries })

  return elements.map((item) => {
    const creativeId = item.id?.replace('urn:li:sponsoredCreative:', '') ?? ''
    const campaignIdFromItem = item.campaign?.replace('urn:li:sponsoredCampaign:', '') ?? ''
    const campaignGroupId = item.campaignGroup?.replace('urn:li:sponsoredCampaignGroup:', '')

    // Determine creative type
    let type: LinkedInCreative['type'] = 'OTHER'
    if (item.type === 'SPONSORED_STATUS_UPDATE') {
      type = 'SPONSORED_STATUS_UPDATE'
    } else if (item.type === 'TEXT_AD') {
      type = 'TEXT_AD'
    } else if (item.type === 'VIDEO') {
      type = 'VIDEO'
    } else if (item.type === 'SPONSORED_INMAILS') {
      type = 'SPONSORED_INMAILS'
    } else if (item.type === 'DYNAMIC') {
      type = 'DYNAMIC'
    }

    // Extract content based on type
    const textAdVars = item.variables?.data?.['com.linkedin.ads.TextAdCreativeVariables']
    const videoVars = item.variables?.data?.['com.linkedin.ads.VideoCreativeVariables']

    const imageUrl = textAdVars?.vectorImage ? resolvedUrls[textAdVars.vectorImage] : undefined
    const videoUrl = videoVars?.videoUrn ? resolvedUrls[videoVars.videoUrn] : undefined

    return {
      creativeId,
      campaignId: campaignIdFromItem,
      campaignGroupId,
      status: (item.status ?? 'PAUSED') as 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT',
      type,
      title: textAdVars?.title,
      description: textAdVars?.text,
      headline: textAdVars?.title,
      callToAction: item.callToAction?.labelType,
      landingPageUrl: item.callToAction?.target,
      imageUrl,
      videoUrl,
    }
  })
}
