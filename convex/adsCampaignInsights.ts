import { action } from './_generated/server'
import { v } from 'convex/values'

import { appendMetaAuthParams, calculateMetaAdsInsights, coerceNumber, META_API_BASE } from '@/services/integrations/meta-ads'
import type { MetaInsightsResponse, MetaInsightsRow } from '@/services/integrations/meta-ads'
import { metaAdsClient } from '@/services/integrations/shared/base-client'
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

function todayIsoDate(): string {
  return new Date().toISOString().split('T')[0]!
}

function daysAgoIsoDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]!
}

type SeriesRow = {
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  reach: number | null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

export const getCampaignInsights = action({
  args: {
    workspaceId: v.string(),
    providerId: v.union(v.literal('google'), v.literal('tiktok'), v.literal('linkedin'), v.literal('facebook')),
    campaignId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => withErrorHandling(async () => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const startDate = args.startDate ?? daysAgoIsoDate(6)
    const endDate = args.endDate ?? todayIsoDate()

    if (startDate > endDate) {
      throw Errors.validation.error('startDate must be <= endDate')
    }

    if (args.providerId !== 'facebook') {
      throw Errors.base.notImplemented('Campaign insights for non-Meta providers')
    }

    const clientId = normalizeClientId(args.clientId ?? null)

    const integration = await ctx.runQuery('adsIntegrations:getAdIntegration' as any, {
      workspaceId: args.workspaceId,
      providerId: args.providerId,
      clientId,
    })

    if (!integration.accessToken) {
      throw Errors.integration.missingToken(args.providerId)
    }

    const adAccountId = integration.accountId
    if (!adAccountId) {
      throw Errors.integration.notConfigured('Meta', 'Ad account ID not configured')
    }

    const params = new URLSearchParams({
      level: 'campaign',
      fields: [
        'date_start',
        'date_stop',
        'campaign_id',
        'campaign_name',
        'impressions',
        'clicks',
        'spend',
        'reach',
        'actions',
        'action_values',
      ].join(','),
      time_range: JSON.stringify({ since: startDate, until: endDate }),
      time_increment: '1',
      limit: '500',
      filtering: JSON.stringify([{ field: 'campaign.id', operator: 'EQUAL', value: args.campaignId }]),
    })

    await appendMetaAuthParams({ params, accessToken: integration.accessToken, appSecret: process.env.META_APP_SECRET })

    const url = `${META_API_BASE}/${adAccountId}/insights?${params.toString()}`

    const accountParams = new URLSearchParams()
    await appendMetaAuthParams({
      params: accountParams,
      accessToken: integration.accessToken,
      appSecret: process.env.META_APP_SECRET,
    })
    const accountUrl = `${META_API_BASE}/${adAccountId}?fields=currency&${accountParams.toString()}`

    const [insightsRes, accountRes] = await Promise.all([
      metaAdsClient.executeRequest<MetaInsightsResponse>({
        url,
        operation: 'fetchCampaignInsights',
        maxRetries: 3,
      }),
      metaAdsClient
        .executeRequest<{ currency?: string }>({
          url: accountUrl,
          operation: 'fetchAdAccountCurrency',
          maxRetries: 2,
        })
        .catch((err) => {
          console.error('[fetchAdAccountCurrency]', err)
          return { payload: { currency: integration.currency || 'USD' } }
        }),
    ])

    const rows: MetaInsightsRow[] = Array.isArray(insightsRes.payload?.data) ? insightsRes.payload.data : []
    const accountCurrency = accountRes.payload?.currency || integration.currency || 'USD'

    const series: SeriesRow[] = rows
      .map((row): SeriesRow | null => {
        const date =
          typeof row?.date_start === 'string'
            ? row.date_start
            : typeof row?.date_stop === 'string'
              ? row.date_stop
              : null
        if (!date) return null

        const rowRecord = asRecord(row) ?? {}

        const spend = coerceNumber(row?.spend)
        const impressions = coerceNumber(row?.impressions)
        const clicks = coerceNumber(row?.clicks)
        const reachRaw = rowRecord.reach
        const reach = reachRaw === undefined || reachRaw === null ? null : coerceNumber(reachRaw)

        const actionsRaw = rowRecord.actions
        const actions = Array.isArray(actionsRaw) ? actionsRaw : []
        const conversions = actions.reduce((acc: number, actionUnknown: unknown) => {
          const action = asRecord(actionUnknown)
          const actionType = typeof action?.action_type === 'string' ? action.action_type : ''
          if (actionType === 'offsite_conversion' || actionType === 'purchase') {
            return acc + coerceNumber(action?.value)
          }
          return acc
        }, 0)

        const actionValuesRaw = rowRecord.action_values
        const actionValues = Array.isArray(actionValuesRaw) ? actionValuesRaw : []
        const revenue = actionValues.reduce((acc: number, actionUnknown: unknown) => {
          const action = asRecord(actionUnknown)
          const actionType = typeof action?.action_type === 'string' ? action.action_type : ''
          if (actionType === 'offsite_conversion.purchase' || actionType === 'omni_purchase') {
            return acc + coerceNumber(action?.value)
          }
          return acc
        }, 0)

        return {
          date,
          spend,
          impressions,
          clicks,
          conversions,
          revenue,
          reach: reach !== null && Number.isFinite(reach) ? reach : null,
        }
      })
      .filter((row): row is SeriesRow => Boolean(row))
      .sort((a, b) => a.date.localeCompare(b.date))

    const totals = series.reduce(
      (acc, row) => {
        acc.spend += row.spend
        acc.impressions += row.impressions
        acc.clicks += row.clicks
        acc.conversions += row.conversions
        acc.revenue += row.revenue
        acc.reach = acc.reach === null ? row.reach : Math.max(acc.reach ?? 0, row.reach ?? 0)
        return acc
      },
      { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0, reach: null as number | null }
    )

    const insights = calculateMetaAdsInsights({
      impressions: totals.impressions,
      clicks: totals.clicks,
      spend: totals.spend,
      conversions: totals.conversions,
      revenue: totals.revenue,
      reach: totals.reach,
      results: totals.conversions,
    })

    return {
      providerId: args.providerId,
      campaignId: args.campaignId,
      startDate,
      endDate,
      totals,
      series,
      insights,
      currency: accountCurrency,
    }
  }, 'adsCampaignInsights:getCampaignInsights', { maxRetries: 3 }),
})
