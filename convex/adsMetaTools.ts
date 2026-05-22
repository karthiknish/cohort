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
      const accessToken = await resolveFacebookAccessToken(args.workspaceId, integration, clientId)

      const { searchMetaAdInterests } = await import('@/services/integrations/meta-ads/targeting-search')
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
      const accessToken = await resolveFacebookAccessToken(args.workspaceId, integration, clientId)

      const { searchMetaAdGeolocations } = await import('@/services/integrations/meta-ads/targeting-search')
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
      const accessToken = await resolveFacebookAccessToken(args.workspaceId, integration, clientId)

      const { listMetaLeadgenForms } = await import('@/services/integrations/meta-ads/leadgen-forms')
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
      const accessToken = await resolveFacebookAccessToken(args.workspaceId, integration, clientId)

      const { createMetaLeadgenForm } = await import('@/services/integrations/meta-ads/leadgen-forms')
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
