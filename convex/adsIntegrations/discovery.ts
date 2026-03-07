import { internal } from '../_generated/api'

import {
  Errors,
  action,
  normalizeClientId,
  resolveGoogleAdsDeveloperToken,
  v,
  withErrorHandling,
} from './shared'

export const listMetaAdAccounts = action({
  args: {
    workspaceId: v.string(),
    providerId: v.literal('facebook'),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw Errors.auth.unauthorized()
    }

    const clientId = normalizeClientId(args.clientId ?? null)

    const integration = await ctx.runQuery(internal.adsIntegrations.getAdIntegrationInternal, {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
    })

    if (!integration.accessToken) {
      throw Errors.integration.missingToken('Meta')
    }

    const { fetchMetaAdAccounts } = await import('@/services/integrations/meta-ads')
    const accounts = await fetchMetaAdAccounts({ accessToken: integration.accessToken })

    return accounts.map((account) => ({
      id: account.id,
      name: account.name,
      currency: account.currency ?? null,
      accountStatus: account.account_status ?? null,
      isActive: account.account_status === 1,
    }))
  }, 'adsIntegrations:listMetaAdAccounts', { maxRetries: 3 }),
})

export const listGoogleAdAccounts = action({
  args: {
    workspaceId: v.string(),
    providerId: v.literal('google'),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw Errors.auth.unauthorized()
    }

    const clientId = normalizeClientId(args.clientId ?? null)

    const integration = await ctx.runQuery(internal.adsIntegrations.getAdIntegrationInternal, {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
    })

    if (!integration.accessToken) {
      throw Errors.integration.missingToken('Google Ads')
    }

    const developerToken = resolveGoogleAdsDeveloperToken(integration.developerToken)
    const { fetchGoogleAdAccounts } = await import('@/services/integrations/google-ads')
    const accounts = await fetchGoogleAdAccounts({
      accessToken: integration.accessToken,
      developerToken,
    })

    return accounts
      .map((account) => ({
        id: account.id,
        name: account.name,
        currencyCode: account.currencyCode ?? null,
        isManager: Boolean(account.manager),
        loginCustomerId: account.loginCustomerId ?? null,
        managerCustomerId: account.managerCustomerId ?? null,
      }))
      .sort((a, b) => Number(a.isManager) - Number(b.isManager) || a.name.localeCompare(b.name))
  }, 'adsIntegrations:listGoogleAdAccounts', { maxRetries: 3 }),
})

export const listGoogleAnalyticsProperties = action({
  args: {
    workspaceId: v.string(),
    providerId: v.literal('google-analytics'),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw Errors.auth.unauthorized()
    }

    const clientId = normalizeClientId(args.clientId ?? null)

    const integration = await ctx.runQuery(internal.adsIntegrations.getAdIntegrationInternal, {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
    })

    if (!integration.accessToken) {
      throw Errors.integration.missingToken('Google Analytics')
    }

    const { fetchGoogleAnalyticsProperties } = await import('@/services/integrations/google-analytics/properties')
    const properties = await fetchGoogleAnalyticsProperties({ accessToken: integration.accessToken })

    return properties.map((property) => ({
      id: property.id,
      name: property.name,
      resourceName: property.resourceName,
    }))
  }, 'adsIntegrations:listGoogleAnalyticsProperties', { maxRetries: 3 }),
})

