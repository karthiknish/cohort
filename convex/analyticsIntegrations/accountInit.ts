import { internal } from '/_generated/api'

import {
  action,
  Errors,
  normalizeClientId,
  normalizeGoogleAnalyticsPropertyId,
  nowMs,
  v,
  withErrorHandling,
} from './shared'

export const initializeGoogleAnalyticsProperty = action({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    accountId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw Errors.auth.unauthorized()
    const clientId = normalizeClientId(args.clientId ?? null)
    const integration = await ctx.runQuery(internal.analyticsIntegrations.getGoogleAnalyticsIntegrationInternal, {
      workspaceId: args.workspaceId,
      clientId,
    })
    if (!integration?.accessToken) throw Errors.integration.missingToken('Google Analytics')
    const { fetchGoogleAnalyticsProperties } = await import('@/services/integrations/google-analytics/properties')
    const properties = await fetchGoogleAnalyticsProperties({ accessToken: integration.accessToken })
    if (!properties.length) {
      throw Errors.integration.notConfigured('Google Analytics', 'No Google Analytics properties available')
    }
    const selectedPropertyId = normalizeGoogleAnalyticsPropertyId(args.accountId ?? null)
    if (!selectedPropertyId) {
      throw Errors.validation.invalidInput('Please select a Google Analytics property to finish setup')
    }
    const selectedProperty = properties.find((property) => normalizeGoogleAnalyticsPropertyId(property.id) === selectedPropertyId) ?? null
    if (!selectedProperty) {
      throw Errors.validation.invalidInput('Selected Google Analytics property is not available for this integration token')
    }
    await ctx.runMutation(internal.analyticsIntegrations.updateGoogleAnalyticsCredentialsInternal, {
      workspaceId: args.workspaceId,
      clientId,
      accountId: selectedProperty.id,
      accountName: selectedProperty.name,
      linkedAtMs: integration.linkedAtMs ?? nowMs(),
    })
    await ctx.runMutation(internal.adsIntegrations.enqueueSyncJob, {
      workspaceId: args.workspaceId,
      providerId: 'google-analytics',
      clientId,
      jobType: 'initial-backfill',
      timeframeDays: 90,
    })
    return {
      accountId: selectedProperty.id,
      accountName: selectedProperty.name,
      properties,
    }
  }, 'analyticsIntegrations:initializeGoogleAnalyticsProperty', { maxRetries: 3 }),
})
