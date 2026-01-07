import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/api-errors'
import { getAdIntegration } from '@/lib/firestore/admin'
import { ensureGoogleAccessToken } from '@/lib/integration-token-refresh'

import {
  fetchGoogleCreatives,
  GoogleCreative,
} from '@/services/integrations/google-ads'

import {
  fetchTikTokCreatives,
  TikTokCreative,
} from '@/services/integrations/tiktok-ads'

import {
  fetchLinkedInCreatives,
  LinkedInCreative,
} from '@/services/integrations/linkedin-ads'

import {
  fetchMetaCreatives,
  MetaCreative,
} from '@/services/integrations/meta-ads'

// =============================================================================
// SCHEMAS
// =============================================================================

const querySchema = z.object({
  providerId: z.enum(['google', 'tiktok', 'linkedin', 'facebook']),
  campaignId: z.string().optional(),
  adGroupId: z.string().optional(),
  status: z.string().optional(),
})

// =============================================================================
// TYPES
// =============================================================================

type NormalizedCreative = {
  providerId: string
  creativeId: string
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
  landingPageUrl?: string
  callToAction?: string
}

// =============================================================================
// HELPERS
// =============================================================================

function normalizeGoogleCreatives(creatives: GoogleCreative[]): NormalizedCreative[] {
  return creatives.map((c) => ({
    providerId: 'google',
    creativeId: c.adId,
    adGroupId: c.adGroupId,
    campaignId: c.campaignId,
    campaignName: c.campaignName,
    name: c.adGroupName,
    type: c.type,
    status: c.status,
    headlines: c.headlines,
    descriptions: c.descriptions,
    imageUrl: c.imageUrl,
    videoUrl: c.videoId ? `https://www.youtube.com/watch?v=${c.videoId}` : undefined,
    landingPageUrl: c.finalUrls?.[0],
    callToAction: c.callToAction,
  }))
}

function normalizeTikTokCreatives(creatives: TikTokCreative[]): NormalizedCreative[] {
  return creatives.map((c) => ({
    providerId: 'tiktok',
    creativeId: c.adId,
    adGroupId: c.adGroupId,
    campaignId: c.campaignId,
    campaignName: c.campaignName,
    name: c.adName,
    type: c.format ?? 'video',
    status: c.status,
    headlines: c.title ? [c.title] : undefined,
    descriptions: c.description ? [c.description] : undefined,
    imageUrl: c.thumbnailUrl,
    videoUrl: c.videoUrl,
    landingPageUrl: c.landingPageUrl,
    callToAction: c.callToAction,
  }))
}

function normalizeLinkedInCreatives(creatives: LinkedInCreative[]): NormalizedCreative[] {
  return creatives.map((c) => ({
    providerId: 'linkedin',
    creativeId: c.creativeId,
    adGroupId: c.campaignGroupId,
    campaignId: c.campaignId,
    campaignName: c.campaignName,
    name: c.title,
    type: c.type,
    status: c.status,
    headlines: c.headline ? [c.headline] : undefined,
    descriptions: c.description ? [c.description] : undefined,
    imageUrl: c.imageUrl,
    videoUrl: c.videoUrl,
    landingPageUrl: c.landingPageUrl,
    callToAction: c.callToAction,
  }))
}

function normalizeMetaCreatives(creatives: MetaCreative[]): NormalizedCreative[] {
  return creatives.map((c) => ({
    providerId: 'facebook',
    creativeId: c.adId,
    adGroupId: c.adSetId,
    campaignId: c.campaignId,
    campaignName: c.campaignName,
    name: c.adName ?? c.creativeName,
    type: 'sponsored_content',
    status: c.status,
    headlines: undefined,
    descriptions: c.message ? [c.message] : undefined,
    imageUrl: c.thumbnailUrl,
    videoUrl: c.videoId ? `https://www.facebook.com/video.php?v=${c.videoId}` : undefined,
    landingPageUrl: c.landingPageUrl,
    callToAction: c.callToAction,
  }))
}

// =============================================================================
// GET - Fetch Creatives
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

    const { providerId, campaignId, adGroupId } = query

    const integration = await getAdIntegration({ userId: auth.uid, providerId })
    if (!integration) {
      throw new NotFoundError(`${providerId} integration not found`)
    }

    let creatives: NormalizedCreative[] = []

    if (providerId === 'google') {
      const accessToken = await ensureGoogleAccessToken({ userId: auth.uid })
      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''
      const customerId = integration.accountId ?? ''
      const loginCustomerId = integration.loginCustomerId

      if (!customerId) {
        throw new BadRequestError('Google Ads customer ID not configured')
      }

      const googleCreatives = await fetchGoogleCreatives({
        accessToken,
        developerToken,
        customerId,
        campaignId,
        adGroupId,
        loginCustomerId,
      })

      creatives = normalizeGoogleCreatives(googleCreatives)
    } else if (providerId === 'tiktok') {
      const accessToken = integration.accessToken
      const advertiserId = integration.accountId

      if (!accessToken || !advertiserId) {
        throw new BadRequestError('TikTok credentials not configured')
      }

      const tiktokCreatives = await fetchTikTokCreatives({
        accessToken,
        advertiserId,
        campaignId,
        adGroupId,
      })

      creatives = normalizeTikTokCreatives(tiktokCreatives)
    } else if (providerId === 'linkedin') {
      const accessToken = integration.accessToken
      const accountId = integration.accountId

      if (!accessToken || !accountId) {
        throw new BadRequestError('LinkedIn credentials not configured')
      }

      const linkedInCreatives = await fetchLinkedInCreatives({
        accessToken,
        accountId,
        campaignId,
      })

      creatives = normalizeLinkedInCreatives(linkedInCreatives)
    } else if (providerId === 'facebook') {
      const accessToken = integration.accessToken
      const adAccountId = integration.accountId

      if (!accessToken || !adAccountId) {
        throw new BadRequestError('Meta credentials not configured')
      }

      const metaCreatives = await fetchMetaCreatives({
        accessToken,
        adAccountId,
        campaignId,
      })

      creatives = normalizeMetaCreatives(metaCreatives)
    }

    return {
      creatives,
      summary: {
        total: creatives.length,
        byType: creatives.reduce((acc, c) => {
          acc[c.type] = (acc[c.type] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        byStatus: creatives.reduce((acc, c) => {
          acc[c.status] = (acc[c.status] || 0) + 1
          return acc
        }, {} as Record<string, number>),
      },
    }
  }
)
