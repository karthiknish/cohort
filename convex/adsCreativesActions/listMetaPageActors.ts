'use node'

import { action } from '../_generated/server'
import { api, internal } from '/_generated/api'
import { v } from 'convex/values'
import { Errors, withErrorHandling } from '../errors'

import { isTokenExpiringSoon, normalizeClientId, requireIdentity } from './shared'

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

