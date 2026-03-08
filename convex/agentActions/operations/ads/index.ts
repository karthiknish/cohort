import { api } from '../../../_generated/api'
import {
  asNonEmptyString,
  asNumber,
  asRecord,
  formatCurrency,
  formatPercent,
  formatRatio,
  formatWholeNumber,
  getProviderSummaryLabel,
  normalizeCampaignAction,
  normalizeCreativeStatus,
  normalizeProviderId,
  normalizeProviderIds,
  normalizeReportPeriod,
  resolveReportWindow,
  unwrapConvexResult,
} from '../../helpers'
import type { OperationHandler } from '../../types'
import {
  ALL_PROVIDER_IDS,
  buildAggregateComparison,
  buildCampaignRoute,
  buildProviderBreakdown,
  buildProviderBreakdownFromRows,
  computeAggregateMetrics,
  computeAggregateMetricsFromRows,
  getPreviousDateWindow,
  isActiveCampaignStatus,
  isPausedCampaignStatus,
  matchesCampaignQuery,
  normalizeCampaignLookupText,
} from '../shared'

export const adsOperationHandlers: Record<string, OperationHandler> = {
  async updateAdsCampaignStatus(ctx, input) {
    const providerId = normalizeProviderId(input.params.providerId ?? input.params.provider)
    const campaignId = asNonEmptyString(input.params.campaignId) ?? asNonEmptyString(input.params.id)
    if (!providerId || !campaignId) {
      return {
        success: false,
        data: { error: 'providerId and campaignId are required.' },
        userMessage: 'Please provide providerId and campaignId for the campaign update.',
      }
    }

    const action = normalizeCampaignAction(input.params.action) ?? normalizeCampaignAction(input.params.status)
    if (!action) {
      return {
        success: false,
        data: { error: 'A supported action/status is required.' },
        userMessage: 'Use action/status like enable, pause, updateBudget, updateBidding, or remove.',
      }
    }

    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)
    const budget = asNumber(input.params.budget)
    const biddingValue = asNumber(input.params.biddingValue)

    const rawResult = await ctx.runAction(api.adsCampaigns.updateCampaign, {
      workspaceId: input.workspaceId,
      providerId,
      clientId: clientId ?? null,
      campaignId,
      action,
      budget: budget ?? undefined,
      budgetMode: asNonEmptyString(input.params.budgetMode) ?? undefined,
      biddingType: asNonEmptyString(input.params.biddingType) ?? undefined,
      biddingValue: biddingValue ?? undefined,
    })

    const result = asRecord(unwrapConvexResult(rawResult))

    return {
      success: true,
      data: { providerId, campaignId, action, result },
      userMessage: `Campaign ${campaignId} updated on ${providerId}.`,
    }
  },

  async updateAdsCreativeStatus(ctx, input) {
    const providerId = normalizeProviderId(input.params.providerId ?? input.params.provider)
    const creativeId = asNonEmptyString(input.params.creativeId) ?? asNonEmptyString(input.params.id)
    if (!providerId || !creativeId) {
      return {
        success: false,
        data: { error: 'providerId and creativeId are required.' },
        userMessage: 'Please provide providerId and creativeId for the creative update.',
      }
    }

    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)
    const status = normalizeCreativeStatus(input.params.status)

    const rawResult = await ctx.runAction(api.adsCreatives.updateCreativeStatus, {
      workspaceId: input.workspaceId,
      providerId,
      clientId: clientId ?? null,
      creativeId,
      adGroupId: asNonEmptyString(input.params.adGroupId) ?? undefined,
      status,
    })

    const result = asRecord(unwrapConvexResult(rawResult))

    return {
      success: true,
      data: { providerId, creativeId, status, result },
      userMessage: `Creative ${creativeId} updated on ${providerId}.`,
    }
  },

  async summarizeAdsPerformance(ctx, input) {
    const period = normalizeReportPeriod(input.params.period)
    const { periodLabel, startDate, endDate } = resolveReportWindow(period, input.params)
    const previousWindow = getPreviousDateWindow(startDate, endDate)

    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)
    const explicitProvider = normalizeProviderId(input.params.providerId)
    const providerIds = normalizeProviderIds(input.params.providerIds)
    const focus = asNonEmptyString(input.params.focus)?.toLowerCase() ?? 'summary'
    const campaignQuery = asNonEmptyString(input.params.campaignQuery)
    const normalizedCampaignQuery = normalizeCampaignLookupText(campaignQuery)

    if (explicitProvider && !providerIds.includes(explicitProvider)) {
      providerIds.unshift(explicitProvider)
    }

    const metricsRaw = await ctx.runQuery(api.adsMetrics.listMetricsWithSummary, {
      workspaceId: input.workspaceId,
      clientId: clientId ?? undefined,
      providerIds: providerIds.length > 0 ? providerIds : undefined,
      startDate,
      endDate,
      aggregate: true,
      limit: 500,
    })

    const metricsPayload = asRecord(unwrapConvexResult(metricsRaw)) ?? asRecord(metricsRaw) ?? {}
    const metricsSummary = asRecord(metricsPayload.summary) ?? {}
    const metricsRows = Array.isArray(metricsPayload.metrics)
      ? metricsPayload.metrics.map((item) => asRecord(item)).filter((item): item is Record<string, unknown> => item !== null)
      : []

    const previousSummaryPayload = previousWindow
      ? asRecord(unwrapConvexResult(await ctx.runQuery(api.adsMetrics.listMetricsWithSummary, {
          workspaceId: input.workspaceId,
          clientId: clientId ?? undefined,
          providerIds: providerIds.length > 0 ? providerIds : undefined,
          startDate: previousWindow.startDate,
          endDate: previousWindow.endDate,
          aggregate: true,
          limit: 500,
        })))
      : null
    const previousSummary = asRecord(previousSummaryPayload?.summary) ?? {}
    const previousMetricsRows = Array.isArray(previousSummaryPayload?.metrics)
      ? previousSummaryPayload.metrics.map((item) => asRecord(item)).filter((item): item is Record<string, unknown> => item !== null)
      : []

    let campaignCounts: { total: number | null; active: number | null; paused: number | null } = {
      total: null,
      active: null,
      paused: null,
    }
    const campaignProviders = providerIds.length > 0 ? providerIds : [...ALL_PROVIDER_IDS]
    const campaignResults = await Promise.allSettled(
      campaignProviders.map(async (providerId) => {
        const campaignsRaw = await ctx.runAction(api.adsCampaigns.listCampaigns, {
          workspaceId: input.workspaceId,
          providerId,
          clientId: clientId ?? undefined,
        })

        return Array.isArray(campaignsRaw)
          ? campaignsRaw.map((item) => asRecord(item)).filter((item): item is Record<string, unknown> => item !== null)
          : []
      }),
    )

    const allCampaigns = campaignResults.flatMap((result, index) => {
      if (result.status !== 'fulfilled') return []

      return result.value.map((campaign) => ({
        providerId: campaignProviders[index],
        id: asNonEmptyString(campaign.id),
        name: asNonEmptyString(campaign.name) ?? 'Unnamed campaign',
        status: asNonEmptyString(campaign.status),
        route: buildCampaignRoute({
          providerId: campaignProviders[index],
          campaignId: asNonEmptyString(campaign.id),
          campaignName: asNonEmptyString(campaign.name),
          startDate,
          endDate,
          clientId,
        }),
      }))
    })

    if (allCampaigns.length > 0) {
      const active = allCampaigns.filter((campaign) => isActiveCampaignStatus(campaign.status))
      const paused = allCampaigns.filter((campaign) => isPausedCampaignStatus(campaign.status))
      campaignCounts = { total: allCampaigns.length, active: active.length, paused: paused.length }
    }

    const matchingCampaigns = normalizedCampaignQuery
      ? allCampaigns.filter((campaign) => matchesCampaignQuery(campaign.name, normalizedCampaignQuery))
      : []
    const matchingCampaignIds = new Set(matchingCampaigns.map((campaign) => campaign.id).filter((id): id is string => Boolean(id)))

    const filteredMetricsRows = normalizedCampaignQuery
      ? metricsRows.filter((row) => {
          const campaignId = asNonEmptyString(row.campaignId)
          if (campaignId && matchingCampaignIds.has(campaignId)) return true
          return matchesCampaignQuery(asNonEmptyString(row.campaignName), normalizedCampaignQuery)
        })
      : metricsRows
    const filteredPreviousMetricsRows = normalizedCampaignQuery
      ? previousMetricsRows.filter((row) => {
          const campaignId = asNonEmptyString(row.campaignId)
          if (campaignId && matchingCampaignIds.has(campaignId)) return true
          return matchesCampaignQuery(asNonEmptyString(row.campaignName), normalizedCampaignQuery)
        })
      : previousMetricsRows

    const currentTotals = normalizedCampaignQuery
      ? computeAggregateMetricsFromRows(filteredMetricsRows)
      : computeAggregateMetrics(asRecord(metricsSummary.totals))
    const previousTotals = normalizedCampaignQuery
      ? computeAggregateMetricsFromRows(filteredPreviousMetricsRows)
      : computeAggregateMetrics(asRecord(previousSummary.totals))
    const totalsComparison = buildAggregateComparison(currentTotals, previousTotals)
    const providerBreakdown = normalizedCampaignQuery
      ? buildProviderBreakdownFromRows(filteredMetricsRows, filteredPreviousMetricsRows)
      : buildProviderBreakdown({
          currentProviders: asRecord(metricsSummary.providers),
          previousProviders: asRecord(previousSummary.providers),
        })

    const { spend, impressions, clicks, conversions, revenue, roas, ctr, cpc, cpa } = currentTotals
    const campaignMap = new Map<string, {
      id: string | null
      name: string
      providerId: string | null
      spend: number
      clicks: number
      conversions: number
      revenue: number
      impressions: number
    }>()

    for (const row of filteredMetricsRows) {
      const campaignId = asNonEmptyString(row.campaignId) ?? null
      const campaignName = asNonEmptyString(row.campaignName) ?? campaignId ?? 'Unlabeled campaign'
      const campaignKey = campaignId ?? campaignName
      const existing = campaignMap.get(campaignKey) ?? {
        id: campaignId,
        name: campaignName,
        providerId: asNonEmptyString(row.providerId),
        spend: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        impressions: 0,
      }

      existing.spend += asNumber(row.spend) ?? 0
      existing.clicks += asNumber(row.clicks) ?? 0
      existing.conversions += asNumber(row.conversions) ?? 0
      existing.revenue += asNumber(row.revenue) ?? 0
      existing.impressions += asNumber(row.impressions) ?? 0
      campaignMap.set(campaignKey, existing)
    }

    const topCampaigns = Array.from(campaignMap.values())
      .map((campaign) => ({
        ...campaign,
        roas: campaign.spend > 0 ? campaign.revenue / campaign.spend : 0,
        ctr: campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0,
      }))
      .sort((left, right) => {
        if (right.spend !== left.spend) return right.spend - left.spend
        if (right.clicks !== left.clicks) return right.clicks - left.clicks
        return right.conversions - left.conversions
      })
      .slice(0, 3)

    const activeCampaignPool = allCampaigns.filter((campaign) => isActiveCampaignStatus(campaign.status))
    const matchingActiveCampaigns = normalizedCampaignQuery
      ? activeCampaignPool.filter((campaign) => matchesCampaignQuery(campaign.name, normalizedCampaignQuery))
      : []
    const activeCampaigns = normalizedCampaignQuery
      ? (matchingActiveCampaigns.length > 0 ? matchingActiveCampaigns : activeCampaignPool).slice(0, 6)
      : activeCampaignPool.slice(0, 6)

    const providerLabel = getProviderSummaryLabel(providerIds)
    const matchingSummary = normalizedCampaignQuery
      ? matchingActiveCampaigns.length > 0
        ? `I found ${matchingActiveCampaigns.length} active ${matchingActiveCampaigns.length === 1 ? 'campaign' : 'campaigns'} matching “${campaignQuery}”.`
        : matchingCampaigns.length > 0
          ? `I found ${matchingCampaigns.length} ${matchingCampaigns.length === 1 ? 'campaign' : 'campaigns'} matching “${campaignQuery}”, but none are currently active.`
          : `I couldn’t find a campaign matching “${campaignQuery}”, so here are the current active ${providerLabel} campaigns instead.`
      : null

    if (spend <= 0 && impressions <= 0 && clicks <= 0 && conversions <= 0 && revenue <= 0) {
      const activeCampaignLines = activeCampaigns.length > 0
        ? activeCampaigns.map((campaign, index) => `${index + 1}. ${campaign.name} (${campaign.providerId})`)
        : ['No active campaigns were returned from the connected providers.']

      return {
        success: true,
        route: '/dashboard/analytics',
        data: {
          period,
          periodLabel,
          providerIds,
          providerLabel,
          startDate,
          endDate,
          previousWindow,
          comparison: { ...totalsComparison, previousWindow },
          providerBreakdown,
          metricsAvailable: false,
          campaignCounts,
          campaignQuery,
          matchedCampaignCount: normalizedCampaignQuery ? matchingCampaigns.length : null,
          activeCampaigns,
        },
        userMessage: [
          normalizedCampaignQuery ? `${providerLabel} Campaign Check` : focus === 'active' ? `${providerLabel} Active Ads` : `${providerLabel} Snapshot`,
          `${periodLabel} window: ${startDate} to ${endDate}`,
          ...(matchingSummary ? [matchingSummary] : []),
          normalizedCampaignQuery
            ? 'I don’t have synced metrics for that campaign and date window yet.'
            : 'No synced metrics are available for this window yet.',
          ...(focus === 'active' || normalizedCampaignQuery ? [normalizedCampaignQuery ? 'Best matching campaigns:' : 'Active campaigns:', ...activeCampaignLines] : []),
          normalizedCampaignQuery
            ? 'You can open a matching campaign below, widen the date range, or check that recent syncs have completed.'
            : 'Check that the integration is connected and that recent syncs have completed.',
        ].join('\n'),
      }
    }

    const currentSituation = [
      spend > 0
        ? roas >= 3
          ? 'ROAS is strong right now.'
          : roas >= 1.5
            ? 'ROAS is stable but still has room to improve.'
            : 'ROAS is soft and needs attention.'
        : 'Spend has not started flowing yet.',
      ctr >= 1.5
        ? 'CTR is healthy.'
        : impressions > 0
          ? 'CTR is light, so creative or audience tuning may help.'
          : 'Delivery is still light.',
      conversions > 0
        ? `${formatWholeNumber(conversions)} conversions are tracked in this window.`
        : clicks > 0
          ? 'Traffic is coming in, but conversions are still thin.'
          : 'Clicks are still light in this window.',
    ].join(' ')

    const topCampaignLines = topCampaigns.length > 0
      ? topCampaigns.map((campaign, index) => `${index + 1}. ${campaign.name}: ${formatCurrency(campaign.spend)} spend, ${formatWholeNumber(campaign.clicks)} clicks, ${formatWholeNumber(campaign.conversions)} conversions, ${formatRatio(campaign.roas)} ROAS`)
      : ['Top campaigns: unavailable from current synced metrics.']

    const campaignStateLine = campaignCounts.total !== null
      ? `Campaigns: ${campaignCounts.total} total, ${campaignCounts.active ?? 0} active, ${campaignCounts.paused ?? 0} paused`
      : null
    const activeCampaignLines = activeCampaigns.length > 0
      ? activeCampaigns.map((campaign, index) => `${index + 1}. ${campaign.name} (${campaign.providerId})`)
      : ['No active campaigns were returned from the connected providers.']
    const leaderLine = topCampaigns[0] ? `Leading campaign: ${topCampaigns[0].name}` : null

    return {
      success: true,
      route: '/dashboard/analytics',
      data: {
        period,
        periodLabel,
        providerIds,
        providerLabel,
        startDate,
        endDate,
        previousWindow,
        totals: { spend, impressions, clicks, conversions, revenue, roas, ctr, cpc, cpa },
        comparison: { ...totalsComparison, previousWindow },
        providerBreakdown,
        campaignCounts,
        campaignQuery,
        matchedCampaignCount: normalizedCampaignQuery ? matchingCampaigns.length : null,
        activeCampaigns,
        topCampaigns: topCampaigns.map((campaign) => ({
          id: campaign.id,
          name: campaign.name,
          providerId: campaign.providerId,
          spend: campaign.spend,
          clicks: campaign.clicks,
          conversions: campaign.conversions,
          revenue: campaign.revenue,
          impressions: campaign.impressions,
          roas: campaign.roas,
          ctr: campaign.ctr,
          route: buildCampaignRoute({
            providerId: campaign.providerId,
            campaignId: campaign.id,
            campaignName: campaign.name,
            startDate,
            endDate,
            clientId,
          }),
        })),
        currentSituation,
      },
      userMessage: [
        focus === 'active' ? `${providerLabel} Active Ads` : `${providerLabel} Snapshot`,
        `${periodLabel} window: ${startDate} to ${endDate}`,
        `Spend: ${formatCurrency(spend)}`,
        `Revenue: ${formatCurrency(revenue)}`,
        `ROAS: ${formatRatio(roas)}`,
        `Impressions: ${formatWholeNumber(impressions)}`,
        `Clicks: ${formatWholeNumber(clicks)}`,
        `CTR: ${formatPercent(ctr)}`,
        `CPC: ${formatCurrency(cpc)}`,
        `CPA: ${conversions > 0 ? formatCurrency(cpa) : 'N/A'}`,
        `Conversions: ${formatWholeNumber(conversions)}`,
        campaignStateLine,
        leaderLine,
        ...(focus === 'active' ? ['Active campaigns:', ...activeCampaignLines] : []),
        'Top campaigns:',
        ...topCampaignLines,
        `Current situation: ${currentSituation}`,
      ].filter((line): line is string => Boolean(line)).join('\n'),
    }
  },
}