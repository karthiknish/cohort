'use node'

import { action } from '../../../_generated/server'
import { api, internal } from '/_generated/api'
import { v } from 'convex/values'
import { Errors, withErrorHandling } from '../../../errors'

import { isTokenExpiringSoon, normalizeClientId, requireIdentity } from './shared'

export const uploadMedia = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(v.literal('google'), v.literal('tiktok'), v.literal('linkedin'), v.literal('facebook')),
    clientId: v.optional(v.union(v.string(), v.null())),
    fileName: v.string(),
    fileData: v.bytes(),
    mimeType: v.optional(v.string()),
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

    if (args.providerId === 'facebook') {
      const { uploadMediaToMeta } = await import('@/services/integrations/meta-ads')

      const adAccountId = integration.accountId
      if (!adAccountId) {
        throw Errors.integration.notConfigured('Meta', 'Meta ad account ID not configured')
      }

      let accessToken = integration.accessToken
      if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
        const { refreshMetaAccessToken } = await import('@/lib/integration-token-refresh-meta')
        accessToken = await refreshMetaAccessToken({ userId: args.workspaceId, clientId })
      }

      const result = await uploadMediaToMeta({
        accessToken,
        adAccountId,
        fileName: args.fileName,
        fileData: new Uint8Array(args.fileData),
        mimeType: args.mimeType,
      })

      if (!result.success) {
        throw Errors.integration.error(args.providerId, result.error || 'Failed to upload media')
      }

      return {
        success: true,
        creativeSpec: result.creativeSpec,
        videoId: result.videoId,
        mediaType: result.mediaType,
      }
    }

    throw Errors.base.notImplemented(`Upload media for ${args.providerId}`)
  }, 'adsCreatives:uploadMedia'),
})
