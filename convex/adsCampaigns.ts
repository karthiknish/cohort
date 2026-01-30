import { action } from './_generated/server'
import { v } from 'convex/values'
import { Errors, withErrorHandling } from './errors'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

function normalizeClientId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function isTokenExpiringSoon(expiresAtMs: number | null | undefined): boolean {
  if (typeof expiresAtMs !== 'number' || !Number.isFinite(expiresAtMs)) return false
  const fiveMinutes = 5 * 60 * 1000
  return expiresAtMs - Date.now() <= fiveMinutes
}

function asErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Unknown error'
}

export type NormalizedCampaign = {
  id: string
  name: string
  providerId: string
  status: string
  budget?: number
  budgetType?: string
  currency?: string
  objective?: string
  startTime?: string
  stopTime?: string
  accountName?: string
  accountLogoUrl?: string
  biddingStrategy?: {
    type: string
    targetCpa?: number
    targetRoas?: number
  }
  schedule?: Array<{
    dayOfWeek: string
    startHour: number
    endHour: number
  }>
}

export const listCampaigns = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(v.literal('google'), v.literal('tiktok'), v.literal('linkedin'), v.literal('facebook')),
    clientId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const clientId = normalizeClientId(args.clientId ?? null)

    const integration = await ctx.runQuery('adsIntegrations:getAdIntegration' as any, {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
    })

    if (!integration.accessToken) {
      throw Errors.integration.missingToken(args.providerId)
    }

    if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
      throw Errors.integration.expired(args.providerId)
    }

    if (args.providerId === 'google') {
      const { listGoogleCampaigns } = await import('@/services/integrations/google-ads')

      const customerId = integration.accountId
      if (!customerId) throw Errors.integration.notConfigured('Google', 'Google Ads customer ID not configured')

      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''

      const googleCampaigns = await listGoogleCampaigns({
        accessToken: integration.accessToken,
        developerToken,
        customerId,
        loginCustomerId: integration.loginCustomerId,
      })

      const currency = integration.currency ?? undefined

      return googleCampaigns.map(
        (c): NormalizedCampaign => ({
          id: c.id,
          name: c.name,
          providerId: 'google',
          status: c.status,
          budget: c.budgetAmountMicros ? c.budgetAmountMicros / 1_000_000 : undefined,
          budgetType: c.biddingStrategyType,
          currency,
          objective: c.advertisingChannelType,
          biddingStrategy: c.biddingStrategyType
            ? {
                type: c.biddingStrategyType,
                targetCpa: c.biddingStrategyInfo?.targetCpaMicros
                  ? c.biddingStrategyInfo.targetCpaMicros / 1_000_000
                  : undefined,
                targetRoas: c.biddingStrategyInfo?.targetRoas,
              }
            : undefined,
          schedule: c.adSchedule,
        })
      )
    }

    if (args.providerId === 'tiktok') {
      const { listTikTokCampaigns } = await import('@/services/integrations/tiktok-ads')

      const advertiserId = integration.accountId
      if (!advertiserId) throw Errors.integration.notConfigured('TikTok', 'TikTok advertiser ID not configured')

      const tiktokCampaigns = await listTikTokCampaigns({
        accessToken: integration.accessToken,
        advertiserId,
      })

      const currency = integration.currency ?? undefined

      return tiktokCampaigns.map(
        (c): NormalizedCampaign => ({
          id: c.id,
          name: c.name,
          providerId: 'tiktok',
          status: c.status,
          budget: c.budget,
          budgetType: c.budgetMode,
          currency,
          objective: c.objective,
        })
      )
    }

    if (args.providerId === 'linkedin') {
      const { listLinkedInCampaigns } = await import('@/services/integrations/linkedin-ads')

      const accountId = integration.accountId
      if (!accountId) throw Errors.integration.notConfigured('LinkedIn', 'LinkedIn account ID not configured')

      const linkedInCampaigns = await listLinkedInCampaigns({
        accessToken: integration.accessToken,
        accountId,
      })

      const currency = integration.currency ?? undefined

      return linkedInCampaigns.map(
        (c): NormalizedCampaign => ({
          id: c.id,
          name: c.name,
          providerId: 'linkedin',
          status: c.status,
          budget: c.dailyBudget ?? c.totalBudget,
          budgetType: c.dailyBudget ? 'daily' : 'total',
          currency,
          objective: c.objectiveType,
        })
      )
    }

    // facebook
    const { listMetaCampaigns } = await import('@/services/integrations/meta-ads')

    const adAccountId = integration.accountId
    if (!adAccountId) {
      throw Errors.integration.notConfigured('Meta', 'Meta ad account ID not configured. Finish setup to select an ad account.')
    }

    const [metaCampaigns, accountMeta] = await Promise.all([
      listMetaCampaigns({ accessToken: integration.accessToken, adAccountId }),
      (async () => {
        try {
          const res = await fetch(
            `https://graph.facebook.com/v24.0/${adAccountId}?fields=currency,name,promote_pages{name,picture}&access_token=${integration.accessToken}`
          )
          const data =
            (await res.json().catch(() => ({}))) as {
              currency?: string
              name?: string
              promote_pages?: { data: Array<{ name: string; picture?: { data: { url: string } } }> }
            }

          const firstPage = data?.promote_pages?.data?.[0]
          return {
            currency: data?.currency ?? integration.currency ?? 'USD',
            accountName: firstPage?.name || data?.name || integration.providerId,
            accountLogoUrl: firstPage?.picture?.data?.url,
          }
        } catch {
          return {
            currency: integration.currency ?? 'USD',
            accountName: integration.providerId,
            accountLogoUrl: undefined,
          }
        }
      })(),
    ])

    return metaCampaigns.map(
      (c): NormalizedCampaign => ({
        id: c.id,
        name: c.name,
        providerId: 'facebook',
        status: c.status,
        budget: c.dailyBudget ?? c.lifetimeBudget,
        budgetType: c.dailyBudget ? 'daily' : c.lifetimeBudget ? 'lifetime' : undefined,
        currency: accountMeta.currency,
        accountName: accountMeta.accountName,
        accountLogoUrl: accountMeta.accountLogoUrl,
        objective: c.objective,
        startTime: c.startTime,
        stopTime: c.stopTime,
        biddingStrategy: c.bidStrategy
          ? { type: c.bidStrategy }
          : undefined,
      })
    )
  }, 'adsCampaigns:listCampaigns'),
})

export const updateCampaign = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(v.literal('google'), v.literal('tiktok'), v.literal('linkedin'), v.literal('facebook')),
    clientId: v.optional(v.union(v.string(), v.null())),
    campaignId: v.string(),
    action: v.union(
      v.literal('enable'),
      v.literal('pause'),
      v.literal('updateBudget'),
      v.literal('updateBidding'),
      v.literal('remove')
    ),
    budget: v.optional(v.number()),
    budgetMode: v.optional(v.string()),
    biddingType: v.optional(v.string()),
    biddingValue: v.optional(v.number()),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const clientId = normalizeClientId(args.clientId ?? null)

    const integration = await ctx.runQuery('adsIntegrations:getAdIntegration' as any, {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
    })

    if (!integration.accessToken) {
      throw Errors.integration.missingToken(args.providerId)
    }

    if (isTokenExpiringSoon(integration.accessTokenExpiresAtMs)) {
      throw Errors.integration.expired(args.providerId)
    }

    const normalizedBudgetMode = typeof args.budgetMode === 'string' ? args.budgetMode.trim().toLowerCase() : undefined

    if (args.providerId === 'google') {
      const {
        updateGoogleCampaignStatus,
        updateGoogleCampaignBudgetByCampaign,
        updateGoogleCampaignBidding,
        removeGoogleCampaign,
      } = await import('@/services/integrations/google-ads')

      const customerId = integration.accountId
      if (!customerId) throw Errors.integration.notConfigured('Google', 'Google Ads customer ID not configured')

      const developerToken = integration.developerToken ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''

      if (args.action === 'enable' || args.action === 'pause') {
        await updateGoogleCampaignStatus({
          accessToken: integration.accessToken,
          developerToken,
          customerId,
          campaignId: args.campaignId,
          status: args.action === 'enable' ? 'ENABLED' : 'PAUSED',
          loginCustomerId: integration.loginCustomerId,
        })
      } else if (args.action === 'updateBudget' && args.budget !== undefined) {
        await updateGoogleCampaignBudgetByCampaign({
          accessToken: integration.accessToken,
          developerToken,
          customerId,
          campaignId: args.campaignId,
          amountMicros: Math.round(args.budget * 1_000_000),
          loginCustomerId: integration.loginCustomerId,
        })
      } else if (args.action === 'updateBidding' && args.biddingType) {
        await updateGoogleCampaignBidding({
          accessToken: integration.accessToken,
          developerToken,
          customerId,
          campaignId: args.campaignId,
          biddingType: args.biddingType,
          biddingValue: args.biddingValue ?? 0,
          loginCustomerId: integration.loginCustomerId,
        })
      } else if (args.action === 'remove') {
        await removeGoogleCampaign({
          accessToken: integration.accessToken,
          developerToken,
          customerId,
          campaignId: args.campaignId,
          loginCustomerId: integration.loginCustomerId,
        })
      }

      return { success: true, campaignId: args.campaignId, action: args.action }
    }

    if (args.providerId === 'tiktok') {
      const {
        updateTikTokCampaignStatus,
        updateTikTokCampaignBudget,
        updateTikTokCampaignBidding,
        removeTikTokCampaign,
      } = await import('@/services/integrations/tiktok-ads')

      const advertiserId = integration.accountId
      if (!advertiserId) throw Errors.integration.notConfigured('TikTok', 'TikTok advertiser ID not configured')

      if (args.action === 'enable' || args.action === 'pause') {
        await updateTikTokCampaignStatus({
          accessToken: integration.accessToken,
          advertiserId,
          campaignId: args.campaignId,
          status: args.action === 'enable' ? 'ENABLE' : 'DISABLE',
        })
      } else if (args.action === 'updateBudget' && args.budget !== undefined) {
        const mode = normalizedBudgetMode
        const mappedBudgetMode =
          mode === 'daily'
            ? 'BUDGET_MODE_DAY'
            : mode === 'total'
              ? 'BUDGET_MODE_TOTAL'
              : (args.budgetMode as 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL' | undefined)

        await updateTikTokCampaignBudget({
          accessToken: integration.accessToken,
          advertiserId,
          campaignId: args.campaignId,
          budget: args.budget,
          budgetMode: mappedBudgetMode,
        })
      } else if (args.action === 'updateBidding' && args.biddingType) {
        await updateTikTokCampaignBidding({
          accessToken: integration.accessToken,
          advertiserId,
          campaignId: args.campaignId,
          biddingType: args.biddingType,
          biddingValue: args.biddingValue ?? 0,
        })
      } else if (args.action === 'remove') {
        await removeTikTokCampaign({
          accessToken: integration.accessToken,
          advertiserId,
          campaignId: args.campaignId,
        })
      }

      return { success: true, campaignId: args.campaignId, action: args.action }
    }

    if (args.providerId === 'linkedin') {
      const {
        updateLinkedInCampaignStatus,
        updateLinkedInCampaignBudget,
        updateLinkedInCampaignBidding,
        removeLinkedInCampaign,
      } = await import('@/services/integrations/linkedin-ads')

      if (args.action === 'enable' || args.action === 'pause') {
        await updateLinkedInCampaignStatus({
          accessToken: integration.accessToken,
          campaignId: args.campaignId,
          status: args.action === 'enable' ? 'ACTIVE' : 'PAUSED',
        })
      } else if (args.action === 'updateBudget' && args.budget !== undefined) {
        const mode = normalizedBudgetMode
        await updateLinkedInCampaignBudget(
          mode === 'total'
            ? { accessToken: integration.accessToken, campaignId: args.campaignId, totalBudget: args.budget }
            : { accessToken: integration.accessToken, campaignId: args.campaignId, dailyBudget: args.budget }
        )
      } else if (args.action === 'updateBidding' && args.biddingType) {
        await updateLinkedInCampaignBidding({
          accessToken: integration.accessToken,
          campaignId: args.campaignId,
          biddingType: args.biddingType,
          biddingValue: args.biddingValue ?? 0,
        })
      } else if (args.action === 'remove') {
        await removeLinkedInCampaign({
          accessToken: integration.accessToken,
          campaignId: args.campaignId,
        })
      }

      return { success: true, campaignId: args.campaignId, action: args.action }
    }

    // facebook
    const { updateMetaCampaignStatus, updateMetaCampaignBudget, updateMetaCampaignBidding, removeMetaCampaign } =
      await import('@/services/integrations/meta-ads')

    if (args.action === 'enable' || args.action === 'pause') {
      await updateMetaCampaignStatus({
        accessToken: integration.accessToken,
        campaignId: args.campaignId,
        status: args.action === 'enable' ? 'ACTIVE' : 'PAUSED',
      })
    } else if (args.action === 'updateBudget' && args.budget !== undefined) {
      const mode = normalizedBudgetMode
      await updateMetaCampaignBudget(
        mode === 'lifetime'
          ? { accessToken: integration.accessToken, campaignId: args.campaignId, lifetimeBudget: args.budget }
          : { accessToken: integration.accessToken, campaignId: args.campaignId, dailyBudget: args.budget }
      )
    } else if (args.action === 'updateBidding' && args.biddingType) {
      await updateMetaCampaignBidding({
        accessToken: integration.accessToken,
        campaignId: args.campaignId,
        biddingType: args.biddingType,
        biddingValue: args.biddingValue ?? 0,
      })
    } else if (args.action === 'remove') {
      await removeMetaCampaign({
        accessToken: integration.accessToken,
        campaignId: args.campaignId,
      })
    }

    return { success: true, campaignId: args.campaignId, action: args.action }
  }, 'adsCampaigns:updateCampaign'),
})
