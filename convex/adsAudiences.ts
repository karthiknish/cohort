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

export const createAudience = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(v.literal('google'), v.literal('tiktok'), v.literal('linkedin'), v.literal('facebook')),
    clientId: v.optional(v.union(v.string(), v.null())),

    name: v.string(),
    description: v.optional(v.string()),
    segments: v.array(v.string()),

    locations: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          lat: v.optional(v.number()),
          lng: v.optional(v.number()),
        })
      )
    ),
    interests: v.optional(v.array(v.string())),
    demographics: v.optional(
      v.object({
        ageMin: v.optional(v.number()),
        ageMax: v.optional(v.number()),
        genders: v.optional(v.array(v.string())),
      })
    ),
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
      throw Errors.integration.missingToken(args.providerId)
    }

    if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
      throw Errors.integration.expired(args.providerId)
    }

    let result: { success: boolean; id?: string; resourceName?: string }

    if (args.providerId === 'google') {
      const { createGoogleAudience } = await import('@/services/integrations/google-ads')

      const customerId = integration.accountId ?? ''
      if (!customerId) {
        throw Errors.integration.notConfigured('Google', 'Google Ads customer ID not configured')
      }

      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''

      result = await createGoogleAudience({
        accessToken: integration.accessToken,
        developerToken,
        customerId,
        name: args.name,
        description: args.description,
        segments: args.segments,
        loginCustomerId: integration.loginCustomerId,
      })
    } else if (args.providerId === 'tiktok') {
      const { createTikTokAudience } = await import('@/services/integrations/tiktok-ads')

      const advertiserId = integration.accountId ?? ''
      if (!advertiserId) {
        throw Errors.integration.notConfigured('TikTok', 'TikTok advertiser id not configured')
      }

      result = await createTikTokAudience({
        accessToken: integration.accessToken,
        advertiserId,
        name: args.name,
        description: args.description,
        segments: args.segments,
      })
    } else if (args.providerId === 'linkedin') {
      const { createLinkedInAudience } = await import('@/services/integrations/linkedin-ads')

      const accountId = integration.accountId ?? ''
      if (!accountId) {
        throw Errors.integration.notConfigured('LinkedIn', 'LinkedIn account id not configured')
      }

      result = await createLinkedInAudience({
        accessToken: integration.accessToken,
        accountId,
        name: args.name,
        description: args.description,
        segments: args.segments,
      })
    } else if (args.providerId === 'facebook') {
      const { createMetaAudience } = await import('@/services/integrations/meta-ads')

      const adAccountId = integration.accountId ?? ''
      if (!adAccountId) {
        throw Errors.integration.notConfigured('Meta', 'Meta ad account ID not configured. Finish setup to select an ad account.')
      }

      result = await createMetaAudience({
        accessToken: integration.accessToken,
        adAccountId,
        name: args.name,
        description: args.description,
        segments: args.segments,
      })
    } else {
      throw Errors.base.badRequest('Unsupported provider')
    }

    return {
      success: true,
      message: `Audience "${args.name}" created on ${args.providerId}`,
      id: result.id || result.resourceName,
    }
  }, 'adsAudiences:createAudience'),
})
