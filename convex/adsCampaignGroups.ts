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

export type CampaignGroup = {
  id: string
  name: string
  status: string
  totalBudget?: number
  currency?: string
}

export const listCampaignGroups = action({
  args: {
    workspaceId: v.string(),
    providerId: v.literal('linkedin'),
    clientId: v.optional(v.union(v.string(), v.null())),
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

    if (!integration.accessToken || !integration.accountId) {
      throw Errors.integration.notConfigured('LinkedIn', 'LinkedIn credentials not configured')
    }

    if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
      throw Errors.integration.expired('LinkedIn')
    }

    const { listLinkedInCampaignGroups } = await import('@/services/integrations/linkedin-ads')

    const groups = await listLinkedInCampaignGroups({
      accessToken: integration.accessToken,
      accountId: integration.accountId,
    })

    return groups.map(
      (group: any): CampaignGroup => ({
        id: group.id,
        name: group.name,
        status: group.status,
        totalBudget: group.totalBudget,
        currency: group.currency,
      })
    )
  }, 'adsCampaignGroups:listCampaignGroups', { maxRetries: 3 }),
})

export const updateCampaignGroup = action({
  args: {
    workspaceId: v.string(),
    providerId: v.literal('linkedin'),
    clientId: v.optional(v.union(v.string(), v.null())),
    campaignGroupId: v.string(),
    action: v.union(v.literal('enable'), v.literal('pause'), v.literal('updateBudget')),
    budget: v.optional(v.number()),
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
      throw Errors.integration.missingToken('LinkedIn')
    }

    if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
      throw Errors.integration.expired('LinkedIn')
    }

    const { updateLinkedInCampaignGroupBudget, updateLinkedInCampaignGroupStatus } = await import(
      '@/services/integrations/linkedin-ads'
    )

    if (args.action === 'enable' || args.action === 'pause') {
      await updateLinkedInCampaignGroupStatus({
        accessToken: integration.accessToken,
        campaignGroupId: args.campaignGroupId,
        status: args.action === 'enable' ? 'ACTIVE' : 'PAUSED',
      })
    } else if (args.action === 'updateBudget' && args.budget !== undefined) {
      await updateLinkedInCampaignGroupBudget({
        accessToken: integration.accessToken,
        campaignGroupId: args.campaignGroupId,
        totalBudget: args.budget,
      })
    }

    return { success: true }
  }, 'adsCampaignGroups:updateCampaignGroup', { maxRetries: 3 }),
})
