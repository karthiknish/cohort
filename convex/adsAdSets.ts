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
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, adAccountId] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        requireFacebookAdAccount(integration),
      ])

      const { listMetaAdSets } = await import('@/services/integrations/meta-ads/campaign-modules/adsets')
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
    name: v.string(),
    status: v.optional(v.union(v.literal('ACTIVE'), v.literal('PAUSED'))),
    dailyBudget: v.optional(v.number()),
    lifetimeBudget: v.optional(v.number()),
    optimizationGoal: v.optional(v.string()),
    billingEvent: v.optional(v.string()),
    bidAmount: v.optional(v.number()),
    targeting: v.optional(v.any()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; adSetId?: string }> =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, adAccountId] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        requireFacebookAdAccount(integration),
      ])

      const { createMetaAdSet } = await import('@/services/integrations/meta-ads/campaign-modules/adsets')
      const result = await createMetaAdSet({
        accessToken,
        adAccountId,
        campaignId: args.campaignId,
        name: args.name,
        status: args.status ?? 'PAUSED',
        dailyBudget: args.dailyBudget,
        lifetimeBudget: args.lifetimeBudget,
        optimizationGoal: args.optimizationGoal,
        billingEvent: args.billingEvent,
        bidAmount: args.bidAmount,
        targeting: args.targeting as Record<string, unknown> | undefined,
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
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const accessToken = await resolveFacebookAccessToken(args.workspaceId, integration, clientId)

      const { updateMetaAdSet } = await import('@/services/integrations/meta-ads/campaign-modules/adsets')
      const result = await updateMetaAdSet({
        accessToken,
        adSetId: args.adSetId,
        targeting: args.targeting as Record<string, unknown>,
      })

      if (!result.success) {
        throw Errors.integration.error('facebook', result.error ?? 'Failed to update ad set targeting')
      }

      return { success: true }
    }, 'adsAdSets:updateAdSetTargeting'),
})
