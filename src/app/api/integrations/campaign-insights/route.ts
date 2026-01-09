import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/api-errors'
import { getAdIntegration } from '@/lib/firestore/admin'
import { ensureMetaAccessToken, IntegrationTokenError } from '@/lib/integration-token-refresh'

import { metaAdsClient } from '@/services/integrations/shared/base-client'
import { appendMetaAuthParams, coerceNumber, META_API_BASE } from '@/services/integrations/meta-ads'
import type { MetaInsightsResponse, MetaInsightsRow } from '@/services/integrations/meta-ads'
import { calculateMetaAdsInsights } from '@/services/integrations/meta-ads'

const querySchema = z.object({
  providerId: z.enum(['google', 'tiktok', 'linkedin', 'facebook']),
  campaignId: z.string().min(1),
  clientId: z.string().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})

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

function todayIsoDate(): string {
  return new Date().toISOString().split('T')[0]
}

function daysAgoIsoDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

export const GET = createApiHandler(
  {
    querySchema,
    rateLimit: 'standard',
  },
  async (_req, { auth, query }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const clientId = typeof query.clientId === 'string' && query.clientId.trim().length > 0
      ? query.clientId.trim()
      : null

    const startDate = query.startDate ?? daysAgoIsoDate(6)
    const endDate = query.endDate ?? todayIsoDate()

    if (startDate > endDate) {
      throw new BadRequestError('startDate must be <= endDate')
    }

    const integration = await getAdIntegration({ userId: auth.uid, providerId: query.providerId, clientId })
    if (!integration) {
      throw new NotFoundError(`${query.providerId} integration not found`)
    }

    if (query.providerId !== 'facebook') {
      throw new BadRequestError('Campaign insights are currently only supported for Meta (facebook).')
    }

    let accessToken: string
    try {
      accessToken = await ensureMetaAccessToken({ userId: auth.uid, clientId })
    } catch (error: unknown) {
      if (error instanceof IntegrationTokenError) {
        throw new BadRequestError(error.message)
      }
      throw error
    }

    const adAccountId = integration.accountId
    if (!adAccountId) {
      throw new BadRequestError('Meta ad account ID not configured. Finish setup to select an ad account.')
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
      filtering: JSON.stringify([
        { field: 'campaign.id', operator: 'EQUAL', value: query.campaignId },
      ]),
    })

    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

    const url = `${META_API_BASE}/${adAccountId}/insights?${params.toString()}`
    
    // Fetch account currency if needed
    const accountParams = new URLSearchParams()
    await appendMetaAuthParams({ params: accountParams, accessToken, appSecret: process.env.META_APP_SECRET })
    const accountUrl = `${META_API_BASE}/${adAccountId}?fields=currency&${accountParams.toString()}`

    const [insightsRes, accountRes] = await Promise.all([
      metaAdsClient.executeRequest<MetaInsightsResponse>({
        url,
        operation: 'fetchCampaignInsights',
        maxRetries: 3,
      }),
      metaAdsClient.executeRequest<{ currency?: string }>({
        url: accountUrl,
        operation: 'fetchAdAccountCurrency',
        maxRetries: 2,
      }).catch(() => ({ payload: { currency: integration.currency || 'USD' } }))
    ])

    const { payload } = insightsRes
    const accountCurrency = accountRes.payload?.currency || integration.currency || 'USD'

    const rows: MetaInsightsRow[] = Array.isArray(payload?.data) ? payload.data : []

    const series: SeriesRow[] = rows
      .map((row): SeriesRow | null => {
        const date = typeof row?.date_start === 'string' ? row.date_start : (typeof row?.date_stop === 'string' ? row.date_stop : null)
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
      providerId: query.providerId,
      campaignId: query.campaignId,
      startDate,
      endDate,
      totals,
      series,
      insights,
      currency: accountCurrency,
    }
  }
)
