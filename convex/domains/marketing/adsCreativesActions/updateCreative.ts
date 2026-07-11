'use node'

import { action } from '../../../_generated/server'
import { api, internal } from '/_generated/api'
import { v } from 'convex/values'
import { Errors, withErrorHandling } from '../../../errors'

import { isTokenExpiringSoon, normalizeClientId, requireIdentity } from './shared'

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
      website: v.optional(v.object({
        optimization: v.optional(v.object({
          status: v.optional(v.string()),
          type: v.optional(v.string()),
        })),
      })),
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

    if (args.providerId === 'facebook' && isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
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

      const { mergeMetaDestinationSpec } = await import('@/services/integrations/meta-ads')

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
        destinationSpec: mergeMetaDestinationSpec(args.destinationSpec, args.linkUrl),
      })

      if (!result.success) {
        throw Errors.integration.error(args.providerId, result.error || 'Failed to update creative')
      }

      return {
        success: true,
        creativeId: result.creativeId,
        adId: args.adId,
      }
    }

    throw Errors.base.notImplemented(`Update creative for ${args.providerId}`)
  }, 'adsCreatives:updateCreative'),
})

// =============================================================================
// UPLOAD MEDIA
// =============================================================================

