import { action } from './_generated/server'
import { v } from 'convex/values'
import { Errors, withErrorHandling } from './errors'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

function normalizeClientId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function isTokenExpiringSoon(expiresAtMs: number | null | undefined): boolean {
  if (typeof expiresAtMs !== 'number' || !Number.isFinite(expiresAtMs)) return false
  const fiveMinutes = 5 * 60 * 1000
  return expiresAtMs - Date.now() <= fiveMinutes
}

function asErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Unknown error'
}

export type NormalizedCreative = {
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

function normalizeGoogleCreatives(creatives: any[]): NormalizedCreative[] {
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

function normalizeTikTokCreatives(creatives: any[]): NormalizedCreative[] {
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

function normalizeLinkedInCreatives(creatives: any[]): NormalizedCreative[] {
  return creatives.map((c) => ({
    providerId: 'linkedin',
    creativeId: c.creativeId,
    adGroupId: c.campaignGroupId,
    campaignId: c.campaignId,
    campaignName: c.campaignName,
    name: c.title || c.headline || `LinkedIn Creative ${c.creativeId}`,
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

function normalizeLinkedInAds(ads: any[]): NormalizedCreative[] {
  return ads.map((a) => ({
    providerId: 'linkedin',
    creativeId: a.creativeId,
    adGroupId: a.campaignGroupId,
    campaignId: a.campaignId,
    name: a.name || `LinkedIn Ad ${a.id}`,
    type: a.type || 'ad',
    status: a.status,
  }))
}

function normalizeMetaCreatives(creatives: any[]): NormalizedCreative[] {
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

export const listCreatives = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(v.literal('google'), v.literal('tiktok'), v.literal('linkedin'), v.literal('facebook')),
    clientId: v.optional(v.union(v.string(), v.null())),
    campaignId: v.optional(v.string()),
    adGroupId: v.optional(v.string()),
    status: v.optional(v.string()),
    includeMedia: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const clientId = normalizeClientId(args.clientId ?? null)

    const integration = await ctx.runQuery('adsIntegrations:getAdIntegration' as any, {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
    })

    if (!integration.accessToken) {
      throw Errors.integration.missingToken(args.providerId)
    }

    if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
      throw Errors.integration.expired(args.providerId)
    }

    if (args.providerId === 'google') {
      const { fetchGoogleCreatives } = await import('@/services/integrations/google-ads')

      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''
      const customerId = integration.accountId ?? ''
      const loginCustomerId = integration.loginCustomerId

      if (!customerId) {
        throw Errors.integration.notConfigured('Google', 'Google Ads customer ID not configured')
      }

      const googleCreatives = await fetchGoogleCreatives({
        accessToken: integration.accessToken,
        developerToken,
        customerId,
        campaignId: args.campaignId,
        adGroupId: args.adGroupId,
        loginCustomerId,
      })

      return normalizeGoogleCreatives(googleCreatives)
    }

    if (args.providerId === 'tiktok') {
      const { fetchTikTokCreatives } = await import('@/services/integrations/tiktok-ads')

      const advertiserId = integration.accountId
      if (!advertiserId) {
        throw Errors.integration.notConfigured('TikTok', 'TikTok credentials not configured')
      }

      const tiktokCreatives = await fetchTikTokCreatives({
        accessToken: integration.accessToken,
        advertiserId,
        campaignId: args.campaignId,
        adGroupId: args.adGroupId,
      })

      return normalizeTikTokCreatives(tiktokCreatives)
    }

    if (args.providerId === 'linkedin') {
      const { fetchLinkedInAds, fetchLinkedInCreatives } = await import('@/services/integrations/linkedin-ads')

      const accountId = integration.accountId
      if (!accountId) {
        throw Errors.integration.notConfigured('LinkedIn', 'LinkedIn credentials not configured')
      }

      // Legacy route used ads when campaignId is specified; keep same semantics.
      if (args.campaignId) {
        const ads = await fetchLinkedInAds({
          accessToken: integration.accessToken,
          accountId,
          campaignId: args.campaignId,
        })
        return normalizeLinkedInAds(ads)
      }

      const creatives = await fetchLinkedInCreatives({
        accessToken: integration.accessToken,
        accountId,
        campaignId: args.campaignId,
      })

      return normalizeLinkedInCreatives(creatives)
    }

    // facebook
    const { fetchMetaCreatives } = await import('@/services/integrations/meta-ads')

    const adAccountId = integration.accountId
    if (!adAccountId) {
      throw Errors.integration.notConfigured('Meta', 'Meta ad account ID not configured. Finish setup to select an ad account.')
    }

    const metaCreatives = await fetchMetaCreatives({
      accessToken: integration.accessToken,
      adAccountId,
      campaignId: args.campaignId,
      adSetId: args.adGroupId,
      includeVideoMedia: args.includeMedia ?? true, // Default to true for better UX
    })

    return normalizeMetaCreatives(metaCreatives)
  }, 'adsCreatives:listCreatives'),
})

export const updateCreativeStatus = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(v.literal('google'), v.literal('tiktok'), v.literal('linkedin'), v.literal('facebook')),
    clientId: v.optional(v.union(v.string(), v.null())),
    creativeId: v.string(),
    adGroupId: v.optional(v.string()),
    status: v.union(
      v.literal('ACTIVE'),
      v.literal('PAUSED'),
      v.literal('ENABLED'),
      v.literal('DISABLED'),
      v.literal('ENABLE'),
      v.literal('DISABLE')
    ),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const clientId = normalizeClientId(args.clientId ?? null)

    const integration = await ctx.runQuery('adsIntegrations:getAdIntegration' as any, {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
    })

    if (!integration.accessToken) {
      throw Errors.integration.missingToken(args.providerId)
    }

    if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
      throw Errors.integration.expired(args.providerId)
    }

    const status = args.status

    if (args.providerId === 'google') {
      if (!args.adGroupId) {
        throw Errors.validation.invalidInput('adGroupId is required for Google Ads')
      }
      const { updateGoogleAdStatus } = await import('@/services/integrations/google-ads')

      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''
      const customerId = integration.accountId ?? ''
      const loginCustomerId = integration.loginCustomerId

      if (!customerId) {
        throw Errors.integration.notConfigured('Google', 'Google Ads customer ID not configured')
      }

      const googleStatus = status === 'ACTIVE' || status === 'ENABLE' || status === 'ENABLED' ? 'ENABLED' : 'PAUSED'

      await updateGoogleAdStatus({
        accessToken: integration.accessToken,
        developerToken,
        customerId,
        adId: args.creativeId,
        adGroupId: args.adGroupId,
        status: googleStatus as 'ENABLED' | 'PAUSED',
        loginCustomerId,
      })

      return { success: true, creativeId: args.creativeId, status: googleStatus }
    }

    if (args.providerId === 'tiktok') {
      const { updateTikTokAdStatus } = await import('@/services/integrations/tiktok-ads')

      const advertiserId = integration.accountId
      if (!advertiserId) {
        throw Errors.integration.notConfigured('TikTok', 'TikTok credentials not configured')
      }

      const tiktokStatus = status === 'ACTIVE' || status === 'ENABLE' || status === 'ENABLED' ? 'ENABLE' : 'DISABLE'

      await updateTikTokAdStatus({
        accessToken: integration.accessToken,
        advertiserId,
        adId: args.creativeId,
        status: tiktokStatus as 'ENABLE' | 'DISABLE',
      })

      return { success: true, creativeId: args.creativeId, status: tiktokStatus }
    }

    if (args.providerId === 'linkedin') {
      const { updateLinkedInAdStatus } = await import('@/services/integrations/linkedin-ads')

      const accountId = integration.accountId
      if (!accountId) {
        throw Errors.integration.notConfigured('LinkedIn', 'LinkedIn credentials not configured')
      }

      const linkedinStatus = status === 'ACTIVE' || status === 'ENABLE' || status === 'ENABLED' ? 'ACTIVE' : 'PAUSED'

      await updateLinkedInAdStatus({
        accessToken: integration.accessToken,
        creativeId: args.creativeId,
        status: linkedinStatus as 'ACTIVE' | 'PAUSED',
      })

      return { success: true, creativeId: args.creativeId, status: linkedinStatus }
    }

    // facebook
    const { updateMetaAdStatus } = await import('@/services/integrations/meta-ads')

    const metaStatus = status === 'ACTIVE' || status === 'ENABLE' || status === 'ENABLED' ? 'ACTIVE' : 'PAUSED'

    await updateMetaAdStatus({
      accessToken: integration.accessToken,
      adId: args.creativeId,
      status: metaStatus as 'ACTIVE' | 'PAUSED',
    })

    return { success: true, creativeId: args.creativeId, status: metaStatus }
  }, 'adsCreatives:updateCreativeStatus'),
})
