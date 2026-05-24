'use node'

import { action } from '../../_generated/server'
import { v } from 'convex/values'
import { Errors, withErrorHandling } from '../../errors'
import {
  getFacebookIntegration,
  normalizeClientId,
  requireFacebookAdAccount,
  resolveFacebookAccessToken,
} from '../../lib/facebookAdsAccess'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

export const searchTargetingInterests = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { searchMetaAdInterests }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/targeting-search'),
      ])
      return searchMetaAdInterests({
        accessToken,
        query: args.query,
        limit: args.limit ?? 25,
      })
    }, 'adsMetaTools:searchTargetingInterests'),
})

export const searchTargetingGeolocations = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { searchMetaAdGeolocations }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/targeting-search'),
      ])
      return searchMetaAdGeolocations({
        accessToken,
        query: args.query,
        limit: args.limit ?? 25,
      })
    }, 'adsMetaTools:searchTargetingGeolocations'),
})

export const listLeadgenForms = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    pageId: v.string(),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { listMetaLeadgenForms }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/leadgen-forms'),
      ])
      return listMetaLeadgenForms({ accessToken, pageId: args.pageId })
    }, 'adsMetaTools:listLeadgenForms'),
})

export const createLeadgenForm = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    pageId: v.string(),
    name: v.string(),
    privacyPolicyUrl: v.string(),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { createMetaLeadgenForm }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/leadgen-forms'),
      ])
      const result = await createMetaLeadgenForm({
        accessToken,
        pageId: args.pageId,
        name: args.name,
        privacyPolicyUrl: args.privacyPolicyUrl,
        locale: args.locale,
      })

      if (!result.success) {
        throw Errors.integration.error('facebook', result.error ?? 'Failed to create lead form')
      }

      return { success: true, formId: result.formId }
    }, 'adsMetaTools:createLeadgenForm'),
})

export const listPagePosts = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    pageId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { listMetaPagePosts }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/page-engagement-resources'),
      ])
      return listMetaPagePosts({
        accessToken,
        pageId: args.pageId,
        limit: args.limit,
      })
    }, 'adsMetaTools:listPagePosts'),
})

export const listPageEvents = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    pageId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { listMetaPageEvents }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/page-engagement-resources'),
      ])
      return listMetaPageEvents({
        accessToken,
        pageId: args.pageId,
        limit: args.limit,
      })
    }, 'adsMetaTools:listPageEvents'),
})

export const listMetaAds = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    campaignId: v.optional(v.string()),
    adSetId: v.optional(v.string()),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, adAccountId, { listMetaAds: listAdsOnMeta }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        requireFacebookAdAccount(integration),
        import('@/services/integrations/meta-ads/campaign-modules/ads'),
      ])
      return listAdsOnMeta({
        accessToken,
        adAccountId,
        campaignId: args.campaignId,
        adSetId: args.adSetId,
        statusFilter: [
          'ACTIVE',
          'PAUSED',
          'ARCHIVED',
          'PENDING_REVIEW',
          'DISAPPROVED',
          'WITH_ISSUES',
          'PREAPPROVED',
        ],
      })
    }, 'adsMetaTools:listMetaAds'),
})

export const listAdPixels = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, adAccountId, { listMetaAdPixels }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        requireFacebookAdAccount(integration),
        import('@/services/integrations/meta-ads/pixels'),
      ])
      return listMetaAdPixels({ accessToken, adAccountId })
    }, 'adsMetaTools:listAdPixels'),
})

export const listProductCatalogs = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, adAccountId, { listMetaProductCatalogs }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        requireFacebookAdAccount(integration),
        import('@/services/integrations/meta-ads/catalogs'),
      ])
      return listMetaProductCatalogs({ accessToken, adAccountId })
    }, 'adsMetaTools:listProductCatalogs'),
})

export const listProductSets = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    catalogId: v.string(),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { listMetaProductSets }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/catalogs'),
      ])
      return listMetaProductSets({ accessToken, catalogId: args.catalogId })
    }, 'adsMetaTools:listProductSets'),
})

export const getPixelDetails = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    pixelId: v.string(),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { getMetaPixelDetails }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/pixels'),
      ])
      return getMetaPixelDetails({ accessToken, pixelId: args.pixelId.trim() })
    }, 'adsMetaTools:getPixelDetails'),
})

export const getPixelStats = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    pixelId: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { getMetaPixelStats }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/pixels'),
      ])
      return getMetaPixelStats({
        accessToken,
        pixelId: args.pixelId.trim(),
        days: args.days,
      })
    }, 'adsMetaTools:getPixelStats'),
})

export const listBusinesses = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { listMetaBusinesses }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/business-manager'),
      ])
      return listMetaBusinesses({ accessToken })
    }, 'adsMetaTools:listBusinesses'),
})

export const listBusinessAdAccounts = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    businessId: v.string(),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { listMetaBusinessAdAccounts }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/business-manager'),
      ])
      return listMetaBusinessAdAccounts({
        accessToken,
        businessId: args.businessId.trim(),
      })
    }, 'adsMetaTools:listBusinessAdAccounts'),
})

export const searchAdLibrary = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    searchTerms: v.string(),
    adReachedCountries: v.array(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      if (!args.searchTerms.trim()) {
        throw Errors.base.badRequest('Enter search terms for the Ad Library.')
      }

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { searchMetaAdLibrary }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/ad-library'),
      ])

      try {
        return await searchMetaAdLibrary({
          accessToken,
          searchTerms: args.searchTerms,
          adReachedCountries: args.adReachedCountries,
          limit: args.limit,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Ad Library search failed'
        throw Errors.integration.error('facebook', message)
      }
    }, 'adsMetaTools:searchAdLibrary'),
})

export const listAdAccountWebhooks = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, adAccountId, { listMetaAdAccountWebhookSubscriptions }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        requireFacebookAdAccount(integration),
        import('@/services/integrations/meta-ads/webhooks'),
      ])
      return listMetaAdAccountWebhookSubscriptions({ accessToken, adAccountId })
    }, 'adsMetaTools:listAdAccountWebhooks'),
})

export const updateAdAccountWebhooks = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    subscribedFields: v.array(v.string()),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, adAccountId, { updateMetaAdAccountWebhookSubscriptions }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        requireFacebookAdAccount(integration),
        import('@/services/integrations/meta-ads/webhooks'),
      ])
      return updateMetaAdAccountWebhookSubscriptions({
        accessToken,
        adAccountId,
        subscribedFields: args.subscribedFields,
      })
    }, 'adsMetaTools:updateAdAccountWebhooks'),
})

export const clearAdAccountWebhooks = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, adAccountId, { clearMetaAdAccountWebhookSubscriptions }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        requireFacebookAdAccount(integration),
        import('@/services/integrations/meta-ads/webhooks'),
      ])
      return clearMetaAdAccountWebhookSubscriptions({ accessToken, adAccountId })
    }, 'adsMetaTools:clearAdAccountWebhooks'),
})
