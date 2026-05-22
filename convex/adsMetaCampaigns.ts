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
import type { CampaignObjective } from '@/services/integrations/meta-ads/campaign-modules/types'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

export const createMetaCampaign = action({
  args: {
    workspaceId: v.string(),
    providerId: v.literal('facebook'),
    clientId: v.optional(v.union(v.string(), v.null())),
    name: v.string(),
    objective: v.string(),
    status: v.optional(v.union(v.literal('ACTIVE'), v.literal('PAUSED'))),
    dailyBudget: v.optional(v.number()),
    lifetimeBudget: v.optional(v.number()),
    startTime: v.optional(v.string()),
    stopTime: v.optional(v.string()),
    specialAdCategories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args): Promise<{ success: boolean; campaignId?: string }> =>
    withErrorHandling(async () => {
      const clientId = normalizeClientId(args.clientId ?? null)
      const [identity, integration, { createMetaCampaign: createCampaignOnMeta }] =
        await Promise.all([
          ctx.auth.getUserIdentity(),
          getFacebookIntegration(ctx, args.workspaceId, clientId),
          import('@/services/integrations/meta-ads/campaign-modules/core'),
        ])
      requireIdentity(identity)
      const [accessToken, adAccountId] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        requireFacebookAdAccount(integration),
      ])

      const result = await createCampaignOnMeta({
        accessToken,
        adAccountId,
        name: args.name,
        objective: args.objective as CampaignObjective,
        status: args.status ?? 'PAUSED',
        dailyBudget: args.dailyBudget,
        lifetimeBudget: args.lifetimeBudget,
        startTime: args.startTime,
        stopTime: args.stopTime,
        specialAdCategories: args.specialAdCategories,
      })

      if (!result.success) {
        throw Errors.integration.error('facebook', result.error ?? 'Failed to create campaign')
      }

      return { success: true, campaignId: result.campaignId }
    }, 'adsMetaCampaigns:createMetaCampaign', { maxRetries: 2 }),
})
