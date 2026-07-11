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
import { requireIdentity } from '../../lib/functions/auth'

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
        subtype: audience.subtype ?? null,
      }))
    }, 'adsAudiencesMeta:listAudiences'),
})

export const createLookalikeAudience = action({
  args: {
    workspaceId: v.string(),
    providerId: v.literal('facebook'),
    clientId: v.optional(v.union(v.string(), v.null())),
    name: v.string(),
    originAudienceId: v.string(),
    country: v.string(),
    ratio: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; id: string }> =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [
        accessToken,
        adAccountId,
        { createMetaLookalikeAudience },
        { buildMetaLookalikeSpec },
      ] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        requireFacebookAdAccount(integration),
        import('@/services/integrations/meta-ads/campaign-modules/audiences'),
        import('@/lib/meta-lookalike-spec'),
      ])
      buildMetaLookalikeSpec(args.country, args.ratio)

      const result = await createMetaLookalikeAudience({
        accessToken,
        adAccountId,
        name: args.name.trim(),
        originAudienceId: args.originAudienceId,
        country: args.country,
        ratio: args.ratio,
        description: args.description,
      })

      if (!result.id) {
        throw Errors.integration.error('facebook', 'Meta did not return a lookalike audience id')
      }

      return { success: true, id: result.id }
    }, 'adsAudiencesMeta:createLookalikeAudience'),
})

export const uploadAudienceUsers = action({
  args: {
    workspaceId: v.string(),
    providerId: v.literal('facebook'),
    clientId: v.optional(v.union(v.string(), v.null())),
    audienceId: v.string(),
    emails: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; numReceived?: number }> =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [
        accessToken,
        { uploadMetaAudienceUsers },
        { hashMetaCustomerEmail, normalizeValidMetaCustomerEmails },
      ] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/campaign-modules/audiences'),
        import('../../lib/metaAudienceHash'),
      ])
      const validEmails = normalizeValidMetaCustomerEmails(args.emails)

      const hashes = await Promise.all(
        validEmails.map((normalized) => hashMetaCustomerEmail(normalized)),
      )

      if (hashes.length === 0) {
        throw Errors.base.badRequest('Add at least one valid email address.')
      }

      const result = await uploadMetaAudienceUsers({
        accessToken,
        audienceId: args.audienceId,
        emailHashes: hashes,
      })

      if (!result.success) {
        throw Errors.integration.error('facebook', result.error ?? 'Failed to upload audience users')
      }

      return { success: true, numReceived: result.numReceived }
    }, 'adsAudiencesMeta:uploadAudienceUsers'),
})

export const deleteAudience = action({
  args: {
    workspaceId: v.string(),
    providerId: v.literal('facebook'),
    clientId: v.optional(v.union(v.string(), v.null())),
    audienceId: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const clientId = normalizeClientId(args.clientId ?? null)
      const integration = await getFacebookIntegration(ctx, args.workspaceId, clientId)
      const [accessToken, { deleteMetaAudience }] = await Promise.all([
        resolveFacebookAccessToken(args.workspaceId, integration, clientId),
        import('@/services/integrations/meta-ads/campaign-modules/audiences'),
      ])

      const result = await deleteMetaAudience({
        accessToken,
        audienceId: args.audienceId,
      })

      if (!result.success) {
        throw Errors.integration.error('facebook', 'Failed to delete custom audience')
      }

      return { success: true }
    }, 'adsAudiencesMeta:deleteAudience'),
})
