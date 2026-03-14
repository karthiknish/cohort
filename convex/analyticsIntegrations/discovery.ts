import { internal } from '/_generated/api'

import {
  action,
  Errors,
  normalizeClientId,
  v,
  withErrorHandling,
} from './shared'

export const listGoogleAnalyticsProperties = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw Errors.auth.unauthorized()
    const integration = await ctx.runQuery(internal.analyticsIntegrations.getGoogleAnalyticsIntegrationInternal, {
      workspaceId: args.workspaceId,
      clientId: normalizeClientId(args.clientId ?? null),
    })
    if (!integration?.accessToken) throw Errors.integration.missingToken('Google Analytics')
    const { fetchGoogleAnalyticsProperties } = await import('@/services/integrations/google-analytics/properties')
    const properties = await fetchGoogleAnalyticsProperties({ accessToken: integration.accessToken })
    return properties.map((property) => ({
      id: property.id,
      name: property.name,
      resourceName: property.resourceName,
    }))
  }, 'analyticsIntegrations:listGoogleAnalyticsProperties', { maxRetries: 3 }),
})
