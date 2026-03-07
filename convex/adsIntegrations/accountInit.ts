import { internal } from '../_generated/api'

import {
  Errors,
  action,
  normalizeClientId,
  normalizeGoogleAdsAccountId,
  normalizeGoogleAnalyticsPropertyId,
  normalizeMetaAccountId,
  nowMs,
  resolveGoogleAdsDeveloperToken,
  v,
  withErrorHandling,
} from './shared'

export const initializeAdAccount = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(
      v.literal('google'),
      v.literal('google-analytics'),
      v.literal('linkedin'),
      v.literal('facebook'),
      v.literal('tiktok')
    ),
    clientId: v.optional(v.union(v.string(), v.null())),
    accountId: v.optional(v.union(v.string(), v.null())),
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

    // Make sure linkedAt is set so the UI considers it connected.
    const linkedAtMs = typeof integration.linkedAtMs === 'number' ? integration.linkedAtMs : nowMs()

    if (args.providerId === 'google') {
      if (!integration.accessToken) {
        throw Errors.integration.missingToken('Google Ads')
      }

      const developerToken = resolveGoogleAdsDeveloperToken(integration.developerToken)

      const { fetchGoogleAdAccounts } = await import('@/services/integrations/google-ads')

      const accounts = await fetchGoogleAdAccounts({
        accessToken: integration.accessToken,
        developerToken,
      })

      if (!accounts.length) {
        throw Errors.integration.notConfigured('Google Ads', 'No ad accounts available')
      }

      const selectedAccountId = normalizeGoogleAdsAccountId(args.accountId ?? null)
      if (!selectedAccountId) {
        throw Errors.validation.invalidInput('Please select a Google Ads account to finish setup')
      }

      const selectedAccount =
        accounts.find((account) => normalizeGoogleAdsAccountId(account.id) === selectedAccountId) ?? null

      if (!selectedAccount) {
        throw Errors.validation.invalidInput('Selected Google Ads account is not available for this integration token')
      }

      const accountId = selectedAccount.id
      const loginCustomerId = selectedAccount.loginCustomerId ?? (selectedAccount.manager ? selectedAccount.id : null)
      const managerCustomerId = selectedAccount.managerCustomerId ?? (selectedAccount.manager ? selectedAccount.id : null)

      await ctx.runMutation(internal.adsIntegrations.updateIntegrationCredentialsInternal, {
        workspaceId: args.workspaceId,
        providerId: 'google',
        clientId,
        accountId,
        accountName: selectedAccount.name,
        developerToken,
        loginCustomerId: loginCustomerId ?? null,
        managerCustomerId: managerCustomerId ?? null,
        linkedAtMs,
      })

      await ctx.runMutation(internal.adsIntegrations.enqueueSyncJob, {
        workspaceId: args.workspaceId,
        providerId: 'google',
        clientId,
        jobType: 'initial-backfill',
        timeframeDays: 90,
      })

      return {
        accountId,
        accountName: selectedAccount.name,
        loginCustomerId,
        managerCustomerId,
        accounts,
      }
    }

    if (args.providerId === 'google-analytics') {
      if (!integration.accessToken) {
        throw Errors.integration.missingToken('Google Analytics')
      }

      const { fetchGoogleAnalyticsProperties } = await import('@/services/integrations/google-analytics/properties')
      const properties = await fetchGoogleAnalyticsProperties({ accessToken: integration.accessToken })

      if (!properties.length) {
        throw Errors.integration.notConfigured('Google Analytics', 'No Google Analytics properties available')
      }

      const selectedPropertyId = normalizeGoogleAnalyticsPropertyId(args.accountId ?? null)
      if (!selectedPropertyId) {
        throw Errors.validation.invalidInput('Please select a Google Analytics property to finish setup')
      }

      const selectedProperty =
        properties.find((property) => normalizeGoogleAnalyticsPropertyId(property.id) === selectedPropertyId) ?? null

      if (!selectedProperty) {
        throw Errors.validation.invalidInput('Selected Google Analytics property is not available for this integration token')
      }

      await ctx.runMutation(internal.adsIntegrations.updateIntegrationCredentialsInternal, {
        workspaceId: args.workspaceId,
        providerId: 'google-analytics',
        clientId,
        accountId: selectedProperty.id,
        accountName: selectedProperty.name,
        linkedAtMs,
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
    }

    if (args.providerId === 'linkedin') {
      if (!integration.accessToken) {
        throw Errors.integration.missingToken('LinkedIn')
      }

      const { fetchLinkedInAdAccounts } = await import('@/services/integrations/linkedin-ads')

      const accounts = await fetchLinkedInAdAccounts({ accessToken: integration.accessToken })
      if (!accounts.length) {
        throw Errors.integration.notConfigured('LinkedIn', 'No ad accounts available')
      }

      const firstAccount = accounts[0]
      if (!firstAccount) {
        throw Errors.integration.notConfigured('LinkedIn', 'No ad accounts available')
      }
      const preferredAccount = accounts.find((account) => account.status?.toUpperCase() === 'ACTIVE') ?? firstAccount

      await ctx.runMutation(internal.adsIntegrations.updateIntegrationCredentialsInternal, {
        workspaceId: args.workspaceId,
        providerId: 'linkedin',
        clientId,
        accountId: preferredAccount.id,
        accountName: preferredAccount.name,
        linkedAtMs,
      })

      await ctx.runMutation(internal.adsIntegrations.enqueueSyncJob, {
        workspaceId: args.workspaceId,
        providerId: 'linkedin',
        clientId,
        jobType: 'initial-backfill',
        timeframeDays: 90,
      })

      return {
        accountId: preferredAccount.id,
        accountName: preferredAccount.name,
        accounts,
      }
    }

    if (args.providerId === 'facebook') {
      if (!integration.accessToken) {
        throw Errors.integration.missingToken('Meta')
      }

      const { fetchMetaAdAccounts } = await import('@/services/integrations/meta-ads')

      const accounts = await fetchMetaAdAccounts({ accessToken: integration.accessToken })
      if (!accounts.length) {
        throw Errors.integration.notConfigured('Meta', 'No ad accounts available')
      }

      const selectedAccountId = normalizeMetaAccountId(args.accountId ?? null)
      if (!selectedAccountId) {
        throw Errors.validation.invalidInput('Please select a Meta ad account to finish setup')
      }

      const selectedAccount =
        accounts.find((account) => normalizeMetaAccountId(account.id) === selectedAccountId) ?? null

      if (!selectedAccount) {
        throw Errors.validation.invalidInput('Selected Meta ad account is not available for this integration token')
      }

      if (selectedAccount.account_status !== 1) {
        throw Errors.validation.invalidInput('Selected Meta ad account is not active')
      }

      await ctx.runMutation(internal.adsIntegrations.updateIntegrationCredentialsInternal, {
        workspaceId: args.workspaceId,
        providerId: 'facebook',
        clientId,
        accountId: selectedAccount.id,
        accountName: selectedAccount.name,
        linkedAtMs,
      })

      await ctx.runMutation(internal.adsIntegrations.enqueueSyncJob, {
        workspaceId: args.workspaceId,
        providerId: 'facebook',
        clientId,
        jobType: 'initial-backfill',
        timeframeDays: 90,
      })

      return {
        accountId: selectedAccount.id,
        accountName: selectedAccount.name,
        accounts,
      }
    }

    // tiktok
    if (!integration.accessToken) {
      throw Errors.integration.missingToken('TikTok')
    }

    const { fetchTikTokAdAccounts } = await import('@/services/integrations/tiktok-ads')

    const accounts = await fetchTikTokAdAccounts({ accessToken: integration.accessToken })
    if (!accounts.length) {
      throw Errors.integration.notConfigured('TikTok', 'No ad accounts available')
    }

    const firstAccount = accounts[0]
    if (!firstAccount) {
      throw Errors.integration.notConfigured('TikTok', 'No ad accounts available')
    }
    const preferredAccount = accounts.find((account) => account.status?.toUpperCase() === 'ENABLE') ?? firstAccount

    await ctx.runMutation(internal.adsIntegrations.updateIntegrationCredentialsInternal, {
      workspaceId: args.workspaceId,
      providerId: 'tiktok',
      clientId,
      accountId: preferredAccount.id,
      accountName: preferredAccount.name,
      linkedAtMs,
    })

      await ctx.runMutation(internal.adsIntegrations.enqueueSyncJob, {
        workspaceId: args.workspaceId,
        providerId: 'tiktok',
        clientId,
        jobType: 'initial-backfill',
        timeframeDays: 90,
      })

    return {
      accountId: preferredAccount.id,
      accountName: preferredAccount.name,
      accounts,
    }
  }, 'adsIntegrations:initializeAdAccount'),
})


