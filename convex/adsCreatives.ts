import { action } from './_generated/server'
import { api } from './_generated/api'
import { v } from 'convex/values'
import { Errors, withErrorHandling } from './errors'
import { optimizeMetaImageUrl } from '../src/services/integrations/meta-ads'
import type { GoogleCreative } from '../src/services/integrations/google-ads'
import type { TikTokCreative } from '../src/services/integrations/tiktok-ads'
import type { LinkedInAd, LinkedInCreative } from '../src/services/integrations/linkedin-ads'
import type { MetaCreative } from '../src/services/integrations/meta-ads'

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

function sanitizeIdempotencyToken(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_')
}

function buildCreateCreativeIdempotencyKey(args: {
  workspaceId: string
  providerId: string
  idempotencyKey?: string
}): string | null {
  if (typeof args.idempotencyKey !== 'string') return null

  const trimmed = args.idempotencyKey.trim()
  if (trimmed.length === 0) return null

  const safeKey = sanitizeIdempotencyToken(trimmed).slice(0, 128)
  if (safeKey.length === 0) return null

  const safeWorkspaceId = sanitizeIdempotencyToken(args.workspaceId).slice(0, 64)
  const safeProviderId = sanitizeIdempotencyToken(args.providerId).slice(0, 32)

  return `adsCreative_${safeWorkspaceId}_${safeProviderId}_${safeKey}`
}

export type NormalizedCreative = {
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
  thumbnailUrl?: string
  videoUrl?: string
  videoId?: string
  imageHash?: string
  landingPageUrl?: string
  callToAction?: string
  pageName?: string
  pageProfileImageUrl?: string
  objectType?: string
  pageId?: string
  instagramActorId?: string
  assetFeedSpec?: string
  destinationSpec?: {
    url?: string
    fallback_url?: string
    additional_urls?: string[]
  }
  // Lead gen and additional fields
  isLeadGen?: boolean
  leadgenFormId?: string
  instagramPermalinkUrl?: string
}

type CreateCreativeResult = {
  success: boolean
  creativeId: string
  adId?: string
  status?: 'ACTIVE' | 'PAUSED'
}

type IdempotencyClaimResult =
  | { type: 'new' }
  | { type: 'pending' }
  | { type: 'completed'; response: unknown; httpStatus: number | null }

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

function normalizeLinkedInAds(ads: LinkedInAd[]): NormalizedCreative[] {
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

function normalizeMetaCreatives(creatives: MetaCreative[]): NormalizedCreative[] {
  return creatives.map((c) => ({
    providerId: 'facebook',
    creativeId: c.adId,
    adId: c.adId,
    platformCreativeId: c.creativeId,
    adGroupId: c.adSetId,
    campaignId: c.campaignId,
    campaignName: c.campaignName,
    name: c.adName ?? c.creativeName,
    type: c.type ?? 'sponsored_content',
    status: c.status,
    headlines: c.headlines,
    descriptions: c.descriptions ?? (c.message ? [c.message] : undefined),
    // Try to get best quality image, fallback to thumbnail
    imageUrl: optimizeMetaImageUrl(c.imageUrl) ?? optimizeMetaImageUrl(c.videoThumbnailUrl) ?? optimizeMetaImageUrl(c.thumbnailUrl),
    // Keep original thumbnail for fallback if optimized fails
    thumbnailUrl: c.thumbnailUrl,
    videoUrl: c.videoSourceUrl ?? (c.videoId ? `https://www.facebook.com/video.php?v=${c.videoId}` : undefined),
    videoId: c.videoId,
    imageHash: c.imageHash,
    landingPageUrl: c.landingPageUrl,
    callToAction: c.callToAction,
    pageName: c.pageName,
    pageProfileImageUrl: optimizeMetaImageUrl(c.pageProfileImageUrl),
    objectType: c.objectType,
    pageId: c.pageId,
    instagramActorId: c.instagramActorId,
    assetFeedSpec: c.assetFeedSpec,
    destinationSpec: c.destinationSpec,
    // Lead gen specific fields
    isLeadGen: c.isLeadGen,
    leadgenFormId: c.leadgenFormId,
    instagramPermalinkUrl: c.instagramPermalinkUrl,
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

    const integration = await ctx.runQuery(api.adsIntegrations.getAdIntegration, {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
    })

    console.log(`[adsCreatives:listCreatives] Fetched integration for ${args.providerId}:`, {
      hasAccessToken: !!integration.accessToken,
      accountId: integration.accountId,
      workspaceId: args.workspaceId,
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
  }, 'adsCreatives:listCreatives', { maxRetries: 3 }),
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

    const integration = await ctx.runQuery(api.adsIntegrations.getAdIntegration, {
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
  }, 'adsCreatives:updateCreativeStatus', { maxRetries: 3 }),
})

// =============================================================================
// CREATE CREATIVE
// =============================================================================

export const listMetaPageActors = action({
  args: {
    workspaceId: v.string(),
    providerId: v.literal('facebook'),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const clientId = normalizeClientId(args.clientId ?? null)

    const integration = await ctx.runQuery(api.adsIntegrations.getAdIntegration, {
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

    const { fetchMetaPageActors } = await import('@/services/integrations/meta-ads')

    const pageActors = await fetchMetaPageActors({
      accessToken: integration.accessToken,
    })

    return pageActors.map((actor) => ({
      id: actor.id,
      name: actor.name,
      tasks: actor.tasks,
      instagramBusinessAccountId: actor.instagramBusinessAccount?.id ?? null,
      instagramBusinessAccountName: actor.instagramBusinessAccount?.name ?? null,
      instagramUsername: actor.instagramBusinessAccount?.username ?? null,
    }))
  }, 'adsCreatives:listMetaPageActors', { maxRetries: 3 }),
})

export const createCreative = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(v.literal('google'), v.literal('tiktok'), v.literal('linkedin'), v.literal('facebook')),
    clientId: v.optional(v.union(v.string(), v.null())),
    idempotencyKey: v.optional(v.string()),
    campaignId: v.string(),
    adSetId: v.optional(v.string()),
    name: v.string(),
    objectType: v.optional(
      v.union(
        v.literal('IMAGE'),
        v.literal('VIDEO'),
        v.literal('CAROUSEL_IMAGE'),
        v.literal('CAROUSEL_VIDEO'),
        v.literal('DYNAMIC_CAROUSEL')
      )
    ),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    description: v.optional(v.string()),
    callToActionType: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageHash: v.optional(v.string()),
    videoId: v.optional(v.string()),
    pageId: v.optional(v.string()),
    instagramActorId: v.optional(v.string()),
    assetFeedSpec: v.optional(v.string()),
    status: v.optional(v.union(v.literal('ACTIVE'), v.literal('PAUSED'))),
  },
  handler: async (ctx, args): Promise<CreateCreativeResult> => withErrorHandling(async (): Promise<CreateCreativeResult> => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const idempotencyKey = buildCreateCreativeIdempotencyKey({
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      idempotencyKey: args.idempotencyKey,
    })
    let idempotencyClaimed = false

    if (idempotencyKey) {
      const claimResult = await ctx.runMutation(api.apiIdempotency.checkAndClaim, {
        key: idempotencyKey,
        requestId: `adsCreatives_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        method: 'ACTION',
        path: 'adsCreatives:createCreative',
      }) as IdempotencyClaimResult

      if (claimResult.type === 'completed') {
        return claimResult.response as CreateCreativeResult
      }

      if (claimResult.type === 'pending') {
        throw Errors.base.conflict('Creative creation request already in progress. Please wait and retry.')
      }

      idempotencyClaimed = true
    }

    const clientId = normalizeClientId(args.clientId ?? null)

    const integration = await ctx.runQuery(api.adsIntegrations.getAdIntegration, {
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

    const completeIdempotency = async (response: CreateCreativeResult) => {
      if (!idempotencyKey || !idempotencyClaimed) return

      try {
        await ctx.runMutation(api.apiIdempotency.complete, {
          key: idempotencyKey,
          response,
          httpStatus: 200,
        })
      } catch (commitError) {
        console.warn('[adsCreatives:createCreative] Failed to persist idempotency completion', commitError)
        try {
          await ctx.runMutation(api.apiIdempotency.release, { key: idempotencyKey })
        } catch (releaseAfterCommitError) {
          console.warn('[adsCreatives:createCreative] Failed to release idempotency key after commit failure', releaseAfterCommitError)
        }
      }
    }

    let createdMetaCreativeId: string | null = null
    let createdMetaAdId: string | null = null

    try {
      if (args.providerId === 'facebook') {
        const { createMetaAdCreative, createMetaAd, fetchMetaPageActors } = await import('@/services/integrations/meta-ads')

        const adAccountId = integration.accountId
        if (!adAccountId) {
          throw Errors.integration.notConfigured('Meta', 'Meta ad account ID not configured')
        }

        if (!args.pageId || args.pageId.trim().length === 0) {
          throw Errors.validation.invalidInput('A Facebook Page is required to create a Meta creative')
        }

        const pageActors = await fetchMetaPageActors({ accessToken: integration.accessToken })
        const selectedPage = pageActors.find((actor) => actor.id === args.pageId)

        if (!selectedPage) {
          throw Errors.validation.invalidInput('Selected Facebook Page is not accessible with the current integration token')
        }

        if (args.instagramActorId) {
          const instagramAllowed = pageActors.some((actor) => actor.instagramBusinessAccount?.id === args.instagramActorId)
          if (!instagramAllowed) {
            throw Errors.validation.invalidInput('Selected Instagram account is not accessible with the current integration token')
          }
        }

        const resolvedInstagramActorId = args.instagramActorId ?? selectedPage.instagramBusinessAccount?.id

        // Step 1: create creative. If later ad creation fails, this is explicitly cleaned up.
        const creativeResult = await createMetaAdCreative({
          accessToken: integration.accessToken,
          adAccountId,
          name: args.name,
          objectType: args.objectType ?? 'IMAGE',
          title: args.title,
          body: args.body,
          description: args.description,
          callToActionType: args.callToActionType,
          linkUrl: args.linkUrl,
          imageUrl: args.imageUrl,
          imageHash: args.imageHash,
          videoId: args.videoId,
          pageId: selectedPage.id,
          instagramActorId: resolvedInstagramActorId,
          assetFeedSpec: args.assetFeedSpec,
        })

        if (!creativeResult.success) {
          throw new Error(creativeResult.error || 'Failed to create creative')
        }

        createdMetaCreativeId = creativeResult.creativeId

        // Step 2: create ad if adSetId is provided.
        if (args.adSetId) {
          const adResult = await createMetaAd({
            accessToken: integration.accessToken,
            adAccountId,
            adSetId: args.adSetId,
            creativeId: creativeResult.creativeId,
            name: args.name,
            status: args.status ?? 'PAUSED',
          })

          if (!adResult.success) {
            throw new Error(adResult.error || 'Failed to create ad')
          }

          createdMetaAdId = adResult.adId

          const response = {
            success: true,
            creativeId: creativeResult.creativeId,
            adId: adResult.adId,
            status: args.status || 'PAUSED',
          }

          await completeIdempotency(response)

          return response
        }

        const response = {
          success: true,
          creativeId: creativeResult.creativeId,
          status: args.status || 'PAUSED',
        }

        await completeIdempotency(response)

        return response
      }

      throw new Error(`Create creative not yet implemented for ${args.providerId}`)
    } catch (error) {
      if (args.providerId === 'facebook' && createdMetaCreativeId && !createdMetaAdId && args.adSetId) {
        try {
          const { deleteMetaAdCreative } = await import('@/services/integrations/meta-ads')
          const cleanupResult = await deleteMetaAdCreative({
            accessToken: integration.accessToken,
            creativeId: createdMetaCreativeId,
          })

          if (!cleanupResult.success) {
            console.warn('[adsCreatives:createCreative] Failed to cleanup partially created Meta creative', {
              creativeId: createdMetaCreativeId,
              error: cleanupResult.error,
            })
          }
        } catch (cleanupError) {
          console.warn('[adsCreatives:createCreative] Cleanup threw after partial failure', {
            creativeId: createdMetaCreativeId,
            error: cleanupError,
          })
        }
      }

      if (idempotencyKey && idempotencyClaimed) {
        try {
          await ctx.runMutation(api.apiIdempotency.release, { key: idempotencyKey })
        } catch (releaseError) {
          console.warn('[adsCreatives:createCreative] Failed to release idempotency key', releaseError)
        }
      }

      throw error
    }
  }, 'adsCreatives:createCreative', { maxRetries: 3 }),
})

// =============================================================================
// UPDATE CREATIVE CONTENT
// =============================================================================

export const updateCreative = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(v.literal('google'), v.literal('tiktok'), v.literal('linkedin'), v.literal('facebook')),
    clientId: v.optional(v.union(v.string(), v.null())),
    creativeId: v.string(),
    adId: v.optional(v.string()),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    description: v.optional(v.string()),
    callToActionType: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    objectType: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageHash: v.optional(v.string()),
    videoId: v.optional(v.string()),
    pageId: v.optional(v.string()),
    instagramActorId: v.optional(v.string()),
    assetFeedSpec: v.optional(v.string()),
    destinationSpec: v.optional(v.object({
      url: v.optional(v.string()),
      fallback_url: v.optional(v.string()),
      additional_urls: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const clientId = normalizeClientId(args.clientId ?? null)

    const integration = await ctx.runQuery(api.adsIntegrations.getAdIntegration, {
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

    if (args.providerId === 'facebook') {
      const { recreateMetaAdCreativeForEdit } = await import('@/services/integrations/meta-ads')

      const adAccountId = integration.accountId
      if (!adAccountId) {
        throw Errors.integration.notConfigured('Meta', 'Meta ad account ID not configured')
      }

      if (!args.adId) {
        throw Errors.validation.invalidInput('adId is required for Meta creative updates')
      }

      const result = await recreateMetaAdCreativeForEdit({
        accessToken: integration.accessToken,
        adAccountId,
        adId: args.adId,
        creativeId: args.creativeId,
        name: args.name,
        title: args.title,
        body: args.body,
        description: args.description,
        callToActionType: args.callToActionType,
        linkUrl: args.linkUrl,
        objectType: args.objectType,
        imageUrl: args.imageUrl,
        imageHash: args.imageHash,
        videoId: args.videoId,
        pageId: args.pageId,
        instagramActorId: args.instagramActorId,
        assetFeedSpec: args.assetFeedSpec,
        destinationSpec: args.destinationSpec,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to update creative')
      }

      return {
        success: true,
        creativeId: result.creativeId,
        adId: args.adId,
      }
    }

    throw new Error(`Update creative not yet implemented for ${args.providerId}`)
  }, 'adsCreatives:updateCreative'),
})

// =============================================================================
// UPLOAD MEDIA
// =============================================================================

export const uploadMedia = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(v.literal('google'), v.literal('tiktok'), v.literal('linkedin'), v.literal('facebook')),
    clientId: v.optional(v.union(v.string(), v.null())),
    fileName: v.string(),
    fileData: v.bytes(),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const clientId = normalizeClientId(args.clientId ?? null)

    const integration = await ctx.runQuery(api.adsIntegrations.getAdIntegration, {
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

    if (args.providerId === 'facebook') {
      const { uploadMediaToMeta } = await import('@/services/integrations/meta-ads')

      const adAccountId = integration.accountId
      if (!adAccountId) {
        throw Errors.integration.notConfigured('Meta', 'Meta ad account ID not configured')
      }

      const result = await uploadMediaToMeta({
        accessToken: integration.accessToken,
        adAccountId,
        fileName: args.fileName,
        fileData: new Uint8Array(args.fileData),
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload media')
      }

      return {
        success: true,
        creativeSpec: result.creativeSpec,
      }
    }

    throw new Error(`Upload media not yet implemented for ${args.providerId}`)
  }, 'adsCreatives:uploadMedia'),
})
