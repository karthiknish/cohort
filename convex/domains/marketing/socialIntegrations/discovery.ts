'use node'

import { action } from '../../../_generated/server'
import { internal } from '/_generated/api'
import { v } from 'convex/values'
import { Errors, withErrorHandling } from '../../../errors'
import { requireWorkspaceActionAccess } from '../../../functions'

function normalizeClientId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const discoverPages = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      await requireWorkspaceActionAccess(ctx, args.workspaceId)

      const clientId = normalizeClientId(args.clientId ?? null)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const socialInternal = internal as any
      const integration = await ctx.runQuery(
        socialInternal['domains/marketing/socialIntegrations/queries'].getSocialIntegrationInternal,
        {
          workspaceId: args.workspaceId,
          clientId,
        },
      )

      if (!integration?.accessToken) {
        throw Errors.integration.missingToken('Meta Social')
      }

      const { discoverMetaPages } = await import('@/services/integrations/meta-social/discovery')
      const pages = await discoverMetaPages({ accessToken: integration.accessToken })

      return pages.map((page) => ({
        id: page.id,
        name: page.name,
        instagramBusinessId: page.instagramBusinessAccount?.id ?? null,
        instagramBusinessName:
          page.instagramBusinessAccount?.username ??
          page.instagramBusinessAccount?.name ??
          null,
      }))
    }, 'socialIntegrations:discoverPages', { maxRetries: 2 }),
})
