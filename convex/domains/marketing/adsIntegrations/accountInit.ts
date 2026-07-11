'use node'

import { internal } from '/_generated/api'
import type { ActionCtx } from '../../../_generated/server'

import {
  Errors,
  action,
  normalizeClientId,
  normalizeGoogleAdsAccountId,
  normalizeMetaAccountId,
  normalizeLinkedInAccountId,
  normalizeTikTokAccountId,
  nowMs,
  resolveGoogleAdsDeveloperToken,
  v,
  withErrorHandling,
} from './shared'
import { resolveLinkedInAccessToken } from '../../../lib/linkedinAdsAccess'
import { resolveTikTokAccessToken } from '../../../lib/tiktokAdsAccess'

async function enqueueInitialSyncAndRun(
  ctx: ActionCtx,
  args: {
    workspaceId: string
    providerId: 'google' | 'linkedin' | 'facebook' | 'tiktok'
    clientId: string | null
  },
): Promise<void> {
  await ctx.runMutation(internal.adsIntegrations.enqueueSyncJob, {
    workspaceId: args.workspaceId,
    providerId: args.providerId,
    clientId: args.clientId,
    jobType: 'initial-backfill',
    timeframeDays: 90,
  })

  await ctx.runMutation(internal.adsIntegrations.updateIntegrationStatusInternal, {
    workspaceId: args.workspaceId,
    providerId: args.providerId,
    clientId: args.clientId,
    status: 'pending',
    message: null,
  })

  // Best-effort inline kick-off of the initial backfill. Any failure is
  // already recorded on the sync job by processNextQueuedSyncJob (status:
  // 'error' + message). The cron-driven processAllQueuedJobs will pick up
  // the queued job on the next tick. We must NOT let this failure propagate
  // to the caller — the initialization itself (account selection +
  // credential save) has already succeeded.
  try {
    await ctx.runAction(internal.adSyncWorkerActions.processNextQueuedSyncJobInternal, {
      workspaceId: args.workspaceId,
    })
  } catch (syncError) {
    console.warn(
      `[initializeAdAccount] Initial backfill kick-off failed for ${args.providerId}; job remains queued for cron retry.`,
      syncError,
    )
  }
}

export const initializeAdAccount = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(
      v.literal('google'),
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

      if (selectedAccount.manager) {
        throw Errors.validation.invalidInput(
          'Manager accounts cannot be selected as the sync target. Choose a client account under the manager.',
        )
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
        currency: selectedAccount.currencyCode ?? null,
        developerToken,
        loginCustomerId: loginCustomerId ?? null,
        managerCustomerId: managerCustomerId ?? null,
        linkedAtMs,
      })

      await enqueueInitialSyncAndRun(ctx, {
        workspaceId: args.workspaceId,
        providerId: 'google',
        clientId,
      })

      return {
        accountId,
        accountName: selectedAccount.name,
        loginCustomerId,
        managerCustomerId,
        accounts,
      }
    }

    if (args.providerId === 'linkedin') {
      if (!integration.accessToken) {
        throw Errors.integration.missingToken('LinkedIn')
      }

      const { fetchLinkedInAdAccounts } = await import('@/services/integrations/linkedin-ads')

      const linkedInAccessToken = await resolveLinkedInAccessToken(args.workspaceId, integration, clientId)
      const accounts = await fetchLinkedInAdAccounts({ accessToken: linkedInAccessToken })
      if (!accounts.length) {
        throw Errors.integration.notConfigured('LinkedIn', 'No ad accounts available')
      }

      const selectedAccountId = normalizeLinkedInAccountId(args.accountId ?? null)
      const selectedAccount = selectedAccountId
        ? accounts.find((account) => account.id === selectedAccountId) ?? null
        : null

      if (selectedAccountId && !selectedAccount) {
        throw Errors.validation.invalidInput('Selected LinkedIn ad account is not available for this integration token')
      }

      const preferredAccount = selectedAccount ?? accounts.find((account) => account.status?.toUpperCase() === 'ACTIVE') ?? accounts[0]
      if (!preferredAccount) {
        throw Errors.integration.notConfigured('LinkedIn', 'No ad accounts available')
      }

      await ctx.runMutation(internal.adsIntegrations.updateIntegrationCredentialsInternal, {
        workspaceId: args.workspaceId,
        providerId: 'linkedin',
        clientId,
        accountId: preferredAccount.id,
        accountName: preferredAccount.name,
        currency: preferredAccount.currency ?? null,
        linkedAtMs,
      })

      await enqueueInitialSyncAndRun(ctx, {
        workspaceId: args.workspaceId,
        providerId: 'linkedin',
        clientId,
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
        currency: selectedAccount.currency ?? null,
        linkedAtMs,
      })

      await enqueueInitialSyncAndRun(ctx, {
        workspaceId: args.workspaceId,
        providerId: 'facebook',
        clientId,
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

    const tiktokAccessToken = await resolveTikTokAccessToken(args.workspaceId, integration, clientId)
    const accounts = await fetchTikTokAdAccounts({ accessToken: tiktokAccessToken })
    if (!accounts.length) {
      throw Errors.integration.notConfigured('TikTok', 'No ad accounts available')
    }

    const selectedAccountId = normalizeTikTokAccountId(args.accountId ?? null)
    const selectedAccount = selectedAccountId
      ? accounts.find((account) => normalizeTikTokAccountId(account.id) === selectedAccountId) ?? null
      : null

    if (selectedAccountId && !selectedAccount) {
      throw Errors.validation.invalidInput('Selected TikTok ad account is not available for this integration token')
    }

    const preferredAccount = selectedAccount ?? accounts.find((account) => account.status?.toUpperCase() === 'ENABLE') ?? accounts[0]
    if (!preferredAccount) {
      throw Errors.integration.notConfigured('TikTok', 'No ad accounts available')
    }

    await ctx.runMutation(internal.adsIntegrations.updateIntegrationCredentialsInternal, {
      workspaceId: args.workspaceId,
      providerId: 'tiktok',
      clientId,
      accountId: preferredAccount.id,
      accountName: preferredAccount.name,
      currency: preferredAccount.currency ?? null,
      linkedAtMs,
    })

    await enqueueInitialSyncAndRun(ctx, {
      workspaceId: args.workspaceId,
      providerId: 'tiktok',
      clientId,
    })

    return {
      accountId: preferredAccount.id,
      accountName: preferredAccount.name,
      accounts,
    }
  }, 'adsIntegrations:initializeAdAccount'),
})


