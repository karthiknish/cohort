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

export const listAudiences = action({
  args: {
    workspaceId: v.string(),
    providerId: v.literal('facebook'),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, adAccountId, { listMetaAudiences }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        requireFacebookAdAccount(integration),
        import('@/services/integrations/meta-ads/campaign-modules/audiences'),
      ])
      const audiences = await listMetaAudiences({ accessToken, adAccountId })

      return audiences.map((audience) => ({
        id: audience.id,
        name: audience.name,
        description: audience.description,
        approximateCount: audience.approximateCount,
        status: audience.status,
      }))
    }, 'adsAudiencesMeta:listAudiences'),
})
