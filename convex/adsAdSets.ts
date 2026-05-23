'use node'

import { action } from './_generated/server'
import { v } from 'convex/values'
import { Errors, withErrorHandling } from './errors'
import {
  getFacebookIntegration,
  normalizeClientId,
  requireFacebookAdAccount,
  resolveFacebookAccessToken,
} from './lib/facebookAdsAccess'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

export type NormalizedAdSet = {
  id: string
  name: string
  campaignId: string
  status: string
  dailyBudget?: number
  lifetimeBudget?: number
  bidAmount?: number
  optimizationGoal?: string
}

export const listAdSets = action({
  args: {
    workspaceId: v.string(),
    providerId: v.literal('facebook'),
    clientId: v.optional(v.union(v.string(), v.null())),
    campaignId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<NormalizedAdSet[]> =>
    withErrorHandling(async (): Promise<NormalizedAdSet[]> => {
      const clientId = normalizeClientId(args.clientId ?? null)
      const [identity, integration, { listMetaAdSets }] = await Promise.all([
        ctx.auth.getUserIdentity(),
        getFacebookIntegration(ctx, args.workspaceId, clientId),
        import('@/services/integrations/meta-ads/campaign-modules/adsets'),
      ])
      requireIdentity(identity)
      const [accessToken, adAccountId] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        requireFacebookAdAccount(integration),
      ])

      const adSets = await listMetaAdSets({
        accessToken,
        adAccountId,
        campaignId: args.campaignId,
      })

      return adSets.map((adSet) => ({
        id: adSet.id,
        name: adSet.name,
        campaignId: adSet.campaignId,
        status: adSet.status,
        dailyBudget: adSet.dailyBudget,
        lifetimeBudget: adSet.lifetimeBudget,
        bidAmount: adSet.bidAmount,
        optimizationGoal: adSet.optimization_goal,
      }))
    }, 'adsAdSets:listAdSets'),
})

export const createAdSet = action({
  args: {
    workspaceId: v.string(),
    providerId: v.literal('facebook'),
    clientId: v.optional(v.union(v.string(), v.null())),
    campaignId: v.string(),
    campaignObjective: v.optional(v.union(v.string(), v.null())),
    name: v.string(),
    status: v.optional(v.union(v.literal('ACTIVE'), v.literal('PAUSED'))),
    dailyBudget: v.optional(v.number()),
    lifetimeBudget: v.optional(v.number()),
    optimizationGoal: v.optional(v.string()),
    billingEvent: v.optional(v.string()),
    bidAmount: v.optional(v.number()),
    targeting: v.optional(v.any()),
    pageId: v.optional(v.string()),
    engagementType: v.optional(v.string()),
    postId: v.optional(v.string()),
    eventId: v.optional(v.string()),
    leadFormId: v.optional(v.string()),
    pixelId: v.optional(v.string()),
    conversionEvent: v.optional(v.string()),
    productCatalogId: v.optional(v.string()),
    productSetId: v.optional(v.string()),
    salesOptimizationMode: v.optional(v.union(v.literal('pixel'), v.literal('catalog'))),
  },
  handler: async (ctx, args): Promise<{ success: boolean; adSetId?: string }> =>
    withErrorHandling(async () => {
      const clientId = normalizeClientId(args.clientId ?? null)
      const [
        identity,
        integration,
        { createMetaAdSet },
        {
          buildMetaAdSetPromotedObject,
          resolveMetaAdSetObjectiveGoals,
          validateMetaAdSetObjective,
        },
      ] = await Promise.all([
        ctx.auth.getUserIdentity(),
        getFacebookIntegration(ctx, args.workspaceId, clientId),
        import('@/services/integrations/meta-ads/campaign-modules/adsets'),
        import('@/lib/meta-ad-set-objective'),
      ])
      requireIdentity(identity)
      const [accessToken, adAccountId] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        requireFacebookAdAccount(integration),
      ])

      const objectiveFields = {
        pageId: args.pageId,
        engagementType: args.engagementType as
          | 'POST_ENGAGEMENT'
          | 'PAGE_ENGAGEMENT'
          | 'EVENT_RESPONSES'
          | 'OFFER_CLAIMS'
          | undefined,
        postId: args.postId,
        eventId: args.eventId,
        pixelId: args.pixelId,
        conversionEvent: args.conversionEvent,
        salesOptimizationMode: args.salesOptimizationMode,
        productCatalogId: args.productCatalogId,
        productSetId: args.productSetId,
      }

      const validationErrors = validateMetaAdSetObjective(args.campaignObjective, objectiveFields)
      if (validationErrors.length > 0) {
        throw Errors.base.badRequest(validationErrors.join(' '))
      }

      const derivedGoals = resolveMetaAdSetObjectiveGoals(args.campaignObjective, objectiveFields)
      const promotedObject = buildMetaAdSetPromotedObject(args.campaignObjective, objectiveFields)

      const result = await createMetaAdSet({
        accessToken,
        adAccountId,
        campaignId: args.campaignId,
        name: args.name,
        status: args.status ?? 'PAUSED',
        dailyBudget: args.dailyBudget,
        lifetimeBudget: args.lifetimeBudget,
        optimizationGoal: args.optimizationGoal ?? derivedGoals.optimizationGoal,
        billingEvent: args.billingEvent ?? derivedGoals.billingEvent,
        bidAmount: args.bidAmount,
        targeting: args.targeting as Record<string, unknown> | undefined,
        promotedObject,
      })

      if (!result.success) {
        throw Errors.integration.error('facebook', result.error ?? 'Failed to create ad set')
      }

      return { success: true, adSetId: result.adSetId }
    }, 'adsAdSets:createAdSet'),
})

export const updateAdSetTargeting = action({
  args: {
    workspaceId: v.string(),
    providerId: v.literal('facebook'),
    clientId: v.optional(v.union(v.string(), v.null())),
    adSetId: v.string(),
    targeting: v.any(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const [integration, { fetchMetaAdSetTargeting, updateMetaAdSet }, { mergeMetaTargetingWithExisting }] =
        await Promise.all([
          getFacebookIntegration(ctx, args.workspaceId, clientId),
          import('@/services/integrations/meta-ads/campaign-modules/adsets'),
          import('@/services/integrations/meta-ads/meta-targeting-serialize'),
        ])
      const accessToken = await resolveFacebookAccessToken(args.workspaceId, integration, clientId)

      const patch = args.targeting as Record<string, unknown>
      const existing = await fetchMetaAdSetTargeting({
        accessToken,
        adSetId: args.adSetId,
      })
      const targeting = mergeMetaTargetingWithExisting(existing, patch)

      const result = await updateMetaAdSet({
        accessToken,
        adSetId: args.adSetId,
        targeting,
      })

      if (!result.success) {
        throw Errors.integration.error('facebook', result.error ?? 'Failed to update ad set targeting')
      }

      return { success: true }
    }, 'adsAdSets:updateAdSetTargeting'),
})

export const updateAdSetStatus = action({
  args: {
    workspaceId: v.string(),
    providerId: v.literal('facebook'),
    clientId: v.optional(v.union(v.string(), v.null())),
    adSetId: v.string(),
    status: v.union(v.literal('ACTIVE'), v.literal('PAUSED')),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const [integration, { updateMetaAdSetStatus }] = await Promise.all([
        getFacebookIntegration(ctx, args.workspaceId, clientId),
        import('@/services/integrations/meta-ads/campaign-modules/adsets'),
      ])
      const accessToken = await resolveFacebookAccessToken(args.workspaceId, integration, clientId)

      const result = await updateMetaAdSetStatus({
        accessToken,
        adSetId: args.adSetId,
        status: args.status,
      })

      if (!result.success) {
        throw Errors.integration.error('facebook', 'Failed to update ad set status')
      }

      return { success: true }
    }, 'adsAdSets:updateAdSetStatus'),
})
