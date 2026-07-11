'use node'

import { action } from '../../../_generated/server'
import { api, internal } from '/_generated/api'
import { v } from 'convex/values'
import { Errors, withErrorHandling } from '../../../errors'
import { resolveLinkedInAccessToken } from '../../../lib/linkedinAdsAccess'
import { resolveTikTokAccessToken } from '../../../lib/tiktokAdsAccess'

import {
  isTokenExpiringSoon,
  normalizeClientId,
  normalizeGoogleCreatives,
  normalizeLinkedInAds,
  normalizeLinkedInCreatives,
  normalizeMetaCreatives,
  normalizeTikTokCreatives,
  requireIdentity,
} from './shared'

export const listCreatives = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(v.literal('google'), v.literal('tiktok'), v.literal('linkedin'), v.literal('facebook')),
    clientId: v.optional(v.union(v.string(), v.null())),
    campaignId: v.optional(v.string()),
    adGroupId: v.optional(v.string()),
    status: v.optional(v.string()),
    includeMedia: v.optional(v.boolean()),
    /** Meta only: max Graph pages (100 ads each), clamped 1–100. Default 25. */
    maxMetaCreativePages: v.optional(v.number()),
    /** Google only: max `googleAds:search` pages (pageSize 1000 each), clamped 1–50. Default 10. */
    maxGoogleAdsSearchPages: v.optional(v.number()),
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

    console.log(`[adsCreatives:listCreatives] Fetched integration for ${args.providerId}:`, {
      hasAccessToken: !!integration.accessToken,
      accountId: integration.accountId,
      workspaceId: args.workspaceId,
    })

    if (!integration.accessToken) {
      throw Errors.integration.missingToken(args.providerId)
    }

    if (
      args.providerId !== 'linkedin' &&
      args.providerId !== 'tiktok' &&
      isTokenExpiringSoon(integration.accessTokenExpiresAtMs)
    ) {
      throw Errors.integration.expired(args.providerId)
    }

    if (args.providerId === 'google') {
      const { fetchGoogleCreatives } = await import('@/services/integrations/google-ads')

      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''
      const customerId = integration.accountId ?? ''
      const loginCustomerId = integration.loginCustomerId

      if (!customerId) {
        throw Errors.integration.notConfigured('Google', 'Google Ads customer ID not configured')
      }

      const maxGooglePagesRaw = args.maxGoogleAdsSearchPages ?? 10
      const maxGooglePages = Math.min(50, Math.max(1, Math.floor(Number.isFinite(maxGooglePagesRaw) ? maxGooglePagesRaw : 10)))

      const googleCreatives = await fetchGoogleCreatives({
        accessToken: integration.accessToken,
        developerToken,
        customerId,
        campaignId: args.campaignId,
        adGroupId: args.adGroupId,
        loginCustomerId,
        maxSearchPages: maxGooglePages,
      })

      return normalizeGoogleCreatives(googleCreatives)
    }

    if (args.providerId === 'tiktok') {
      const { fetchTikTokCreatives } = await import('@/services/integrations/tiktok-ads')

      const advertiserId = integration.accountId
      if (!advertiserId) {
        throw Errors.integration.notConfigured('TikTok', 'TikTok credentials not configured')
      }

      const tiktokAccessToken = await resolveTikTokAccessToken(args.workspaceId, integration, clientId)
      const tiktokCreatives = await fetchTikTokCreatives({
        accessToken: tiktokAccessToken,
        advertiserId,
        campaignId: args.campaignId,
        adGroupId: args.adGroupId,
      })

      return normalizeTikTokCreatives(tiktokCreatives)
    }

    if (args.providerId === 'linkedin') {
      const { fetchLinkedInAds, fetchLinkedInCreatives } = await import('@/services/integrations/linkedin-ads')

      const accountId = integration.accountId
      if (!accountId) {
        throw Errors.integration.notConfigured('LinkedIn', 'LinkedIn credentials not configured')
      }

      const linkedInAccessToken = await resolveLinkedInAccessToken(args.workspaceId, integration, clientId)

      // Legacy route used ads when campaignId is specified; keep same semantics.
      if (args.campaignId) {
        const ads = await fetchLinkedInAds({
          accessToken: linkedInAccessToken,
          accountId,
          campaignId: args.campaignId,
        })
        return normalizeLinkedInAds(ads)
      }

      const creatives = await fetchLinkedInCreatives({
        accessToken: linkedInAccessToken,
        accountId,
        campaignId: args.campaignId,
      })

      return normalizeLinkedInCreatives(creatives)
    }

    // facebook
    const { fetchMetaCreatives } = await import('@/services/integrations/meta-ads')

    const adAccountId = integration.accountId
    if (!adAccountId) {
      throw Errors.integration.notConfigured('Meta', 'Meta ad account ID not configured. Finish setup to select an ad account.')
    }

    const maxPagesRaw = args.maxMetaCreativePages ?? 25
    const maxPages = Math.min(100, Math.max(1, Math.floor(Number.isFinite(maxPagesRaw) ? maxPagesRaw : 25)))

    const metaCreatives = await fetchMetaCreatives({
      accessToken: integration.accessToken,
      adAccountId,
      campaignId: args.campaignId,
      adSetId: args.adGroupId,
      includeVideoMedia: args.includeMedia ?? true, // Default to true for better UX
      maxPages,
    })

    return normalizeMetaCreatives(metaCreatives)
  }, 'adsCreatives:listCreatives', { maxRetries: 3 }),
})

