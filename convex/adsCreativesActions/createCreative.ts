'use node'

import { action } from '../_generated/server'
import { api, internal } from '/_generated/api'
import { v } from 'convex/values'
import { Errors, withErrorHandling } from '../errors'

import {
  buildCreateCreativeIdempotencyKey,
  isTokenExpiringSoon,
  normalizeClientId,
  requireIdentity,
  type CreateCreativeResult,
  type IdempotencyClaimResult,
} from './shared'

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
    leadgenFormId: v.optional(v.string()),
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
      const claimResult = await ctx.runMutation(internal.apiIdempotency.checkAndClaimInternal, {
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
        await ctx.runMutation(internal.apiIdempotency.completeInternal, {
          key: idempotencyKey,
          response,
          httpStatus: 200,
        })
      } catch (commitError) {
        console.warn('[adsCreatives:createCreative] Failed to persist idempotency completion', commitError)
        try {
          await ctx.runMutation(internal.apiIdempotency.releaseInternal, { key: idempotencyKey })
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
          leadgenFormId: args.leadgenFormId,
        })

        if (!creativeResult.success) {
          throw Errors.integration.error(args.providerId, creativeResult.error || 'Failed to create creative')
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
            throw Errors.integration.error(args.providerId, adResult.error || 'Failed to create ad')
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

      throw Errors.base.notImplemented(`Create creative for ${args.providerId}`)
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
          await ctx.runMutation(internal.apiIdempotency.releaseInternal, { key: idempotencyKey })
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

