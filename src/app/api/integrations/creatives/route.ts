import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/api-errors'
import { getAdIntegration } from '@/lib/firestore/admin'
import { ensureGoogleAccessToken, ensureMetaAccessToken, IntegrationTokenError } from '@/lib/integration-token-refresh'

import {
  fetchGoogleCreatives,
  updateGoogleAdStatus,
  GoogleCreative,
} from '@/services/integrations/google-ads'

import {
  fetchTikTokCreatives,
  updateTikTokAdStatus,
  TikTokCreative,
} from '@/services/integrations/tiktok-ads'

import {
  fetchLinkedInCreatives,
  updateLinkedInAdStatus,
  LinkedInCreative,
} from '@/services/integrations/linkedin-ads'

import {
  fetchMetaCreatives,
  updateMetaAdStatus,
  MetaCreative,
} from '@/services/integrations/meta-ads'

// =============================================================================
// SCHEMAS
// =============================================================================

const querySchema = z.object({
  providerId: z.enum(['google', 'tiktok', 'linkedin', 'facebook']),
  clientId: z.string().optional(),
  campaignId: z.string().optional(),
  adGroupId: z.string().optional(),
  status: z.string().optional(),
  includeMedia: z.union([z.literal('1'), z.literal('true'), z.literal('0'), z.literal('false')]).optional(),
})

const patchBodySchema = z.object({
  providerId: z.enum(['google', 'tiktok', 'linkedin', 'facebook']),
  clientId: z.string().optional(),
  creativeId: z.string(),
  adGroupId: z.string().optional(), // Required for Google
  status: z.enum(['ACTIVE', 'PAUSED', 'ENABLED', 'DISABLED', 'ENABLE', 'DISABLE']),
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
  pageName?: string
  pageProfileImageUrl?: string
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
    headlines: c.headlines,
    descriptions: c.message ? [c.message] : undefined,
    imageUrl: c.imageUrl ?? c.videoThumbnailUrl ?? c.thumbnailUrl,
    videoUrl: c.videoSourceUrl ?? (c.videoId ? `https://www.facebook.com/video.php?v=${c.videoId}` : undefined),
    landingPageUrl: c.landingPageUrl,
    callToAction: c.callToAction,
    pageName: c.pageName,
    pageProfileImageUrl: c.pageProfileImageUrl,
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
    console.log('[api/integrations/creatives] GET request:', { uid: auth.uid, query })
    const debug = process.env.DEBUG_AD_CREATIVE_API === '1'

    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const { providerId, campaignId, adGroupId } = query
    const includeMedia = query.includeMedia === '1' || query.includeMedia === 'true'
    const clientId = typeof query.clientId === 'string' && query.clientId.trim().length > 0
      ? query.clientId.trim()
      : null

    if (debug) {
      console.info('[ad-creatives] request', {
        userId: auth.uid,
        providerId,
        clientId,
        campaignId,
        adGroupId,
        includeMedia,
      })
    }

    const integration = await getAdIntegration({ userId: auth.uid, providerId, clientId })
    if (!integration) {
      if (debug) {
        console.info('[ad-creatives] integration not found', { userId: auth.uid, providerId, clientId })
      }
      throw new NotFoundError(`${providerId} integration not found`)
    }

    if (debug) {
      console.info('[ad-creatives] integration found', {
        userId: auth.uid,
        providerId,
        clientId,
        accountIdPresent: Boolean(integration.accountId),
      })
    }

    let creatives: NormalizedCreative[] = []

    if (providerId === 'google') {
      let accessToken: string
      try {
        accessToken = await ensureGoogleAccessToken({ userId: auth.uid, clientId })
      } catch (error: unknown) {
        if (error instanceof IntegrationTokenError) {
          if (debug) {
            console.info('[ad-creatives] google token error', { userId: auth.uid, clientId, message: error.message })
          }
          throw new BadRequestError(error.message)
        }
        throw error
      }
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
      let accessToken: string
      try {
        accessToken = await ensureMetaAccessToken({ userId: auth.uid, clientId })
      } catch (error: unknown) {
        if (error instanceof IntegrationTokenError) {
          if (debug) {
            console.info('[ad-creatives] meta token error', { userId: auth.uid, clientId, message: error.message })
          }
          throw new BadRequestError(error.message)
        }
        throw error
      }
      const adAccountId = integration.accountId

      if (!accessToken || !adAccountId) {
        throw new BadRequestError('Meta credentials not configured')
      }

      const metaCreatives = await fetchMetaCreatives({
        accessToken,
        adAccountId,
        campaignId,
        includeVideoMedia: includeMedia || debug,
      })

      if (debug) {
        console.info('[ad-creatives] meta raw images', {
          providerId,
          clientId,
          campaignId,
          total: metaCreatives.length,
          sample: metaCreatives.slice(0, 5).map((c) => ({
            adId: c.adId,
            creativeId: c.creativeId,
            thumbnailUrl: c.thumbnailUrl,
            imageUrl: c.imageUrl,
            videoThumbnailUrl: c.videoThumbnailUrl,
            videoSourceUrlPresent: Boolean(c.videoSourceUrl),
            landingPageUrl: c.landingPageUrl,
            videoId: c.videoId,
          })),
        })
      }

      creatives = normalizeMetaCreatives(metaCreatives)
    }

    const result = {
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

    console.log('[api/integrations/creatives] GET response summary:', result.summary)
    return result
  }
)

// =============================================================================
// PATCH - Update Creative Status
// =============================================================================

export const PATCH = createApiHandler(
  {
    bodySchema: patchBodySchema,
    rateLimit: 'standard',
  },
  async (req, { auth, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const { providerId, creativeId, adGroupId, status } = body
    const clientId = typeof body.clientId === 'string' && body.clientId.trim().length > 0
      ? body.clientId.trim()
      : null

    const integration = await getAdIntegration({ userId: auth.uid, providerId, clientId })
    if (!integration) {
      throw new NotFoundError(`${providerId} integration not found`)
    }

    if (providerId === 'google') {
      if (!adGroupId) {
        throw new BadRequestError('adGroupId is required for Google Ads')
      }
      let accessToken: string
      try {
        accessToken = await ensureGoogleAccessToken({ userId: auth.uid, clientId })
      } catch (error: unknown) {
        if (error instanceof IntegrationTokenError) {
          throw new BadRequestError(error.message)
        }
        throw error
      }
      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''
      const customerId = integration.accountId ?? ''
      const loginCustomerId = integration.loginCustomerId

      if (!customerId) {
        throw new BadRequestError('Google Ads customer ID not configured')
      }

      const googleStatus = status === 'ACTIVE' || status === 'ENABLE' || status === 'ENABLED' ? 'ENABLED' : 'PAUSED'

      await updateGoogleAdStatus({
        accessToken,
        developerToken,
        customerId,
        adId: creativeId,
        adGroupId,
        status: googleStatus as 'ENABLED' | 'PAUSED',
        loginCustomerId,
      })
    } else if (providerId === 'tiktok') {
      const accessToken = integration.accessToken
      const advertiserId = integration.accountId

      if (!accessToken || !advertiserId) {
        throw new BadRequestError('TikTok credentials not configured')
      }

      const tiktokStatus = status === 'ACTIVE' || status === 'ENABLE' || status === 'ENABLED' ? 'ENABLE' : 'DISABLE'

      await updateTikTokAdStatus({
        accessToken,
        advertiserId,
        adId: creativeId,
        status: tiktokStatus as 'ENABLE' | 'DISABLE',
      })
    } else if (providerId === 'linkedin') {
      const accessToken = integration.accessToken
      const accountId = integration.accountId

      if (!accessToken || !accountId) {
        throw new BadRequestError('LinkedIn credentials not configured')
      }

      const linkedinStatus = status === 'ACTIVE' || status === 'ENABLE' || status === 'ENABLED' ? 'ACTIVE' : 'PAUSED'

      await updateLinkedInAdStatus({
        accessToken,
        creativeId,
        status: linkedinStatus as 'ACTIVE' | 'PAUSED',
      })
    } else if (providerId === 'facebook') {
      let accessToken: string
      try {
        accessToken = await ensureMetaAccessToken({ userId: auth.uid, clientId })
      } catch (error: unknown) {
        if (error instanceof IntegrationTokenError) {
          throw new BadRequestError(error.message)
        }
        throw error
      }
      const adAccountId = integration.accountId

      if (!accessToken || !adAccountId) {
        throw new BadRequestError('Meta credentials not configured')
      }

      const metaStatus = status === 'ACTIVE' || status === 'ENABLE' || status === 'ENABLED' ? 'ACTIVE' : 'PAUSED'

      await updateMetaAdStatus({
        accessToken,
        adId: creativeId,
        status: metaStatus as 'ACTIVE' | 'PAUSED',
      })
    }

    return { success: true, creativeId, status }
  }
)
