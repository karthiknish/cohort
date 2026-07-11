'use node'

import { action } from '../../../_generated/server'
import { api, internal } from '/_generated/api'
import { v } from 'convex/values'
import { Errors, withErrorHandling } from '../../../errors'

import { resolveLinkedInAccessToken } from '../../../lib/linkedinAdsAccess'
import { isTokenExpiringSoon, normalizeClientId, requireIdentity } from './shared'

export const updateCreativeStatus = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(v.literal('google'), v.literal('tiktok'), v.literal('linkedin'), v.literal('facebook')),
    clientId: v.optional(v.union(v.string(), v.null())),
    creativeId: v.string(),
    adGroupId: v.optional(v.string()),
    status: v.union(
      v.literal('ACTIVE'),
      v.literal('PAUSED'),
      v.literal('ENABLED'),
      v.literal('DISABLED'),
      v.literal('ENABLE'),
      v.literal('DISABLE')
    ),
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

    if (args.providerId !== 'linkedin' && isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
      throw Errors.integration.expired(args.providerId)
    }

    const status = args.status

    if (args.providerId === 'google') {
      if (!args.adGroupId) {
        throw Errors.validation.invalidInput('adGroupId is required for Google Ads')
      }
      const { updateGoogleAdStatus } = await import('@/services/integrations/google-ads')

      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''
      const customerId = integration.accountId ?? ''
      const loginCustomerId = integration.loginCustomerId

      if (!customerId) {
        throw Errors.integration.notConfigured('Google', 'Google Ads customer ID not configured')
      }

      const googleStatus = status === 'ACTIVE' || status === 'ENABLE' || status === 'ENABLED' ? 'ENABLED' : 'PAUSED'

      await updateGoogleAdStatus({
        accessToken: integration.accessToken,
        developerToken,
        customerId,
        adId: args.creativeId,
        adGroupId: args.adGroupId,
        status: googleStatus as 'ENABLED' | 'PAUSED',
        loginCustomerId,
      })

      return { success: true, creativeId: args.creativeId, status: googleStatus }
    }

    if (args.providerId === 'tiktok') {
      const { updateTikTokAdStatus } = await import('@/services/integrations/tiktok-ads')

      const advertiserId = integration.accountId
      if (!advertiserId) {
        throw Errors.integration.notConfigured('TikTok', 'TikTok credentials not configured')
      }

      const tiktokStatus = status === 'ACTIVE' || status === 'ENABLE' || status === 'ENABLED' ? 'ENABLE' : 'DISABLE'

      await updateTikTokAdStatus({
        accessToken: integration.accessToken,
        advertiserId,
        adId: args.creativeId,
        status: tiktokStatus as 'ENABLE' | 'DISABLE',
      })

      return { success: true, creativeId: args.creativeId, status: tiktokStatus }
    }

    if (args.providerId === 'linkedin') {
      const { updateLinkedInAdStatus } = await import('@/services/integrations/linkedin-ads')

      const accountId = integration.accountId
      if (!accountId) {
        throw Errors.integration.notConfigured('LinkedIn', 'LinkedIn credentials not configured')
      }

      const linkedInAccessToken = await resolveLinkedInAccessToken(args.workspaceId, integration, clientId)

      const linkedinStatus = status === 'ACTIVE' || status === 'ENABLE' || status === 'ENABLED' ? 'ACTIVE' : 'PAUSED'

      await updateLinkedInAdStatus({
        accessToken: linkedInAccessToken,
        creativeId: args.creativeId,
        status: linkedinStatus as 'ACTIVE' | 'PAUSED',
      })

      return { success: true, creativeId: args.creativeId, status: linkedinStatus }
    }

    // facebook
    const { updateMetaAdStatus } = await import('@/services/integrations/meta-ads')

    const metaStatus = status === 'ACTIVE' || status === 'ENABLE' || status === 'ENABLED' ? 'ACTIVE' : 'PAUSED'

    await updateMetaAdStatus({
      accessToken: integration.accessToken,
      adId: args.creativeId,
      status: metaStatus as 'ACTIVE' | 'PAUSED',
    })

    return { success: true, creativeId: args.creativeId, status: metaStatus }
  }, 'adsCreatives:updateCreativeStatus', { maxRetries: 3 }),
})

// =============================================================================
// CREATE CREATIVE
// =============================================================================

