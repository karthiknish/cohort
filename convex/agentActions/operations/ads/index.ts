import { api, internal } from '/_generated/api'
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
import { normalizeAdsProviderId } from '@/domain/ads/provider'

import {
  ALL_PROVIDER_IDS,
  buildAggregateComparison,
  buildCampaignRoute,
  buildProviderBreakdown,
  buildProviderBreakdownFromRows,
  computeAggregateMetrics,
  computeAggregateMetricsFromRows,
  extractV2InsightsSnapshot,
  filterAdsMetricRows,
  formatProviderDisplayName,
  getPreviousDateWindow,
  isActiveCampaignStatus,
  isPausedCampaignStatus,
  matchesCampaignQuery,
  normalizeCampaignLookupText,
  resolveAdsSyncTimeframeDays,
} from '../shared'

type AdsMetricsBundle = {
  metricsPayload: Record<string, unknown>
  metricsSummary: Record<string, unknown>
  metricsRows: Record<string, unknown>[]
  v2Snapshot: ReturnType<typeof extractV2InsightsSnapshot>
  previousSummaryPayload: Record<string, unknown> | null
  previousSummary: Record<string, unknown>
  previousMetricsRows: Record<string, unknown>[]
  previousV2Snapshot: ReturnType<typeof extractV2InsightsSnapshot>
}

async function loadAdsMetricsBundle(
  ctx: Parameters<OperationHandler>[0],
  args: {
    workspaceId: string
    clientId?: string
    providerIds: string[]
    startDate: string
    endDate: string
    previousWindow: { startDate: string; endDate: string } | null
  },
): Promise<AdsMetricsBundle> {
  const metricsRaw = await ctx.runQuery(api.adsMetrics.listMetricsWithSummaryV2, {
    workspaceId: args.workspaceId,
    clientId: args.clientId,
    providerIds: args.providerIds,
    startDate: args.startDate,
    endDate: args.endDate,
    aggregate: true,
    limit: 500,
  })

  const metricsPayload = asRecord(unwrapConvexResult(metricsRaw)) ?? asRecord(metricsRaw) ?? {}
  const metricsSummary = asRecord(metricsPayload.summary) ?? {}
  const v2Snapshot = extractV2InsightsSnapshot(metricsSummary)
  const metricsRows = filterAdsMetricRows(
    Array.isArray(metricsPayload.metrics)
      ? metricsPayload.metrics.flatMap((item) => {
          const record = asRecord(item)
          return record !== null ? [record] : []
        })
      : [],
  )

  const previousSummaryPayload = args.previousWindow
    ? asRecord(
        unwrapConvexResult(
          await ctx.runQuery(api.adsMetrics.listMetricsWithSummaryV2, {
            workspaceId: args.workspaceId,
            clientId: args.clientId,
            providerIds: args.providerIds,
            startDate: args.previousWindow.startDate,
            endDate: args.previousWindow.endDate,
            aggregate: true,
            limit: 500,
          }),
        ),
      )
    : null
  const previousSummary = asRecord(previousSummaryPayload?.summary) ?? {}
  const previousV2Snapshot = extractV2InsightsSnapshot(previousSummary)
  const previousMetricsRows = filterAdsMetricRows(
    Array.isArray(previousSummaryPayload?.metrics)
      ? previousSummaryPayload.metrics.flatMap((item) => {
          const record = asRecord(item)
          return record !== null ? [record] : []
        })
      : [],
  )

  return {
    metricsPayload,
    metricsSummary,
    metricsRows,
    v2Snapshot,
    previousSummaryPayload,
    previousSummary,
    previousMetricsRows,
    previousV2Snapshot,
  }
}

function hasPaidAdsTotals(metrics: ReturnType<typeof computeAggregateMetrics>): boolean {
  return (
    metrics.spend > 0 ||
    metrics.impressions > 0 ||
    metrics.clicks > 0 ||
    metrics.conversions > 0 ||
    metrics.revenue > 0
  )
}

function formatSyncTimestamp(valueMs: number | null): string | null {
  if (!valueMs || !Number.isFinite(valueMs)) return null
  return new Date(valueMs).toISOString().slice(0, 10)
}

function buildAdsIntegrationSyncHint(
  statuses: Array<{
    providerId: string
    lastSyncStatus: string
    lastSyncedAtMs: number | null
    lastSyncMessage: string | null
  }>,
  providerIds: string[],
): string | null {
  const targets = providerIds.length > 0 ? providerIds : [...ALL_PROVIDER_IDS]
  const lines = targets.flatMap((providerId) => {
    const canonical = normalizeAdsProviderId(providerId)
    const row = statuses.find((status) => normalizeAdsProviderId(status.providerId) === canonical)
    if (!row) {
      return [`${formatProviderDisplayName(providerId)} is not linked for this scope.`]
    }
    const syncedThrough = formatSyncTimestamp(row.lastSyncedAtMs)
    const status = row.lastSyncStatus || 'unknown'
    if (status === 'success' && syncedThrough) {
      return [`${formatProviderDisplayName(providerId)} last synced through ${syncedThrough}.`]
    }
    if (row.lastSyncMessage) {
      return [`${formatProviderDisplayName(providerId)} sync: ${status} — ${row.lastSyncMessage}`]
    }
    return [`${formatProviderDisplayName(providerId)} sync status: ${status}.`]
  })

  return lines.length > 0 ? lines.join(' ') : null
}

async function syncConnectedAdsProviders(
  ctx: Parameters<OperationHandler>[0],
  args: {
    workspaceId: string
    clientId: string | null
    providerIds: string[]
    startDate: string
    endDate: string
    integrationStatuses: Array<{ providerId: string; accountId: string | null }>
  },
): Promise<number | null> {
  const connected = args.integrationStatuses.filter(
    (row) =>
      args.providerIds.includes(row.providerId) &&
      typeof row.accountId === 'string' &&
      row.accountId.trim().length > 0,
  )
  if (connected.length === 0) return null

  const timeframeDays = resolveAdsSyncTimeframeDays(args.startDate, args.endDate)

  await Promise.all(
    connected.map((row) =>
      ctx.runMutation(api.adsIntegrations.requestManualSync, {
        workspaceId: args.workspaceId,
        providerId: row.providerId,
        clientId: args.clientId,
        timeframeDays,
      }),
    ),
  )

  await Promise.all(
    connected.map(() =>
      ctx.runAction(internal.adSyncWorkerActions.processNextQueuedSyncJobInternal, {
        workspaceId: args.workspaceId,
      }),
    ),
  )

  return timeframeDays
}

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

    const adsProviderIds = providerIds.length > 0 ? providerIds : [...ALL_PROVIDER_IDS]

    let metricsScopeNote: string | null = null
    let {
      metricsPayload,
      metricsSummary,
      metricsRows,
      v2Snapshot,
      previousSummaryPayload,
      previousSummary,
      previousMetricsRows,
      previousV2Snapshot,
    } = await loadAdsMetricsBundle(ctx, {
      workspaceId: input.workspaceId,
      clientId: clientId ?? undefined,
      providerIds: adsProviderIds,
      startDate,
      endDate,
      previousWindow,
    })

    const initialTotals = metricsRows.length > 0
      ? computeAggregateMetricsFromRows(metricsRows)
      : computeAggregateMetrics({
          spend: v2Snapshot.spend,
          impressions: v2Snapshot.impressions,
          clicks: v2Snapshot.clicks,
          conversions: v2Snapshot.conversions,
          revenue: v2Snapshot.revenue,
        })

    if (!hasPaidAdsTotals(initialTotals) && clientId) {
      const workspaceScoped = await loadAdsMetricsBundle(ctx, {
        workspaceId: input.workspaceId,
        providerIds: adsProviderIds,
        startDate,
        endDate,
        previousWindow,
      })
      const workspaceTotals = workspaceScoped.metricsRows.length > 0
        ? computeAggregateMetricsFromRows(workspaceScoped.metricsRows)
        : computeAggregateMetrics({
            spend: workspaceScoped.v2Snapshot.spend,
            impressions: workspaceScoped.v2Snapshot.impressions,
            clicks: workspaceScoped.v2Snapshot.clicks,
            conversions: workspaceScoped.v2Snapshot.conversions,
            revenue: workspaceScoped.v2Snapshot.revenue,
          })

      if (hasPaidAdsTotals(workspaceTotals)) {
        metricsPayload = workspaceScoped.metricsPayload
        metricsSummary = workspaceScoped.metricsSummary
        metricsRows = workspaceScoped.metricsRows
        v2Snapshot = workspaceScoped.v2Snapshot
        previousSummaryPayload = workspaceScoped.previousSummaryPayload
        previousSummary = workspaceScoped.previousSummary
        previousMetricsRows = workspaceScoped.previousMetricsRows
        previousV2Snapshot = workspaceScoped.previousV2Snapshot
        metricsScopeNote =
          'Showing workspace-level synced metrics because this client has no tagged rows in that window.'
      }
    }

    const integrationStatusesRaw = await ctx.runQuery(api.adsIntegrations.listStatuses, {
      workspaceId: input.workspaceId,
      clientId: clientId ?? null,
    })
    let integrationStatuses = Array.isArray(integrationStatusesRaw) ? integrationStatusesRaw : []
    if (integrationStatuses.length === 0 && clientId) {
      const workspaceStatusesRaw = await ctx.runQuery(api.adsIntegrations.listStatuses, {
        workspaceId: input.workspaceId,
        clientId: null,
      })
      integrationStatuses = Array.isArray(workspaceStatusesRaw) ? workspaceStatusesRaw : []
    }

    let syncTimeframeDays: number | null = null
    const metricsAfterScope = metricsRows.length > 0
      ? computeAggregateMetricsFromRows(metricsRows)
      : computeAggregateMetrics({
          spend: v2Snapshot.spend,
          impressions: v2Snapshot.impressions,
          clicks: v2Snapshot.clicks,
          conversions: v2Snapshot.conversions,
          revenue: v2Snapshot.revenue,
        })

    if (!hasPaidAdsTotals(metricsAfterScope)) {
      const syncStatuses = integrationStatuses.flatMap((row) => {
        const record = asRecord(row)
        if (!record) return []
        const providerId = asNonEmptyString(record.providerId)
        if (!providerId) return []
        return [{ providerId, accountId: asNonEmptyString(record.accountId) }]
      })

      syncTimeframeDays = await syncConnectedAdsProviders(ctx, {
        workspaceId: input.workspaceId,
        clientId,
        providerIds: adsProviderIds,
        startDate,
        endDate,
        integrationStatuses: syncStatuses,
      })

      if (syncTimeframeDays !== null) {
        const reloaded = await loadAdsMetricsBundle(ctx, {
          workspaceId: input.workspaceId,
          clientId: clientId ?? undefined,
          providerIds: adsProviderIds,
          startDate,
          endDate,
          previousWindow,
        })
        metricsPayload = reloaded.metricsPayload
        metricsSummary = reloaded.metricsSummary
        metricsRows = reloaded.metricsRows
        v2Snapshot = reloaded.v2Snapshot
        previousSummaryPayload = reloaded.previousSummaryPayload
        previousSummary = reloaded.previousSummary
        previousMetricsRows = reloaded.previousMetricsRows
        previousV2Snapshot = reloaded.previousV2Snapshot

        if (clientId) {
          const reloadedTotals = metricsRows.length > 0
            ? computeAggregateMetricsFromRows(metricsRows)
            : computeAggregateMetrics({
                spend: v2Snapshot.spend,
                impressions: v2Snapshot.impressions,
                clicks: v2Snapshot.clicks,
                conversions: v2Snapshot.conversions,
                revenue: v2Snapshot.revenue,
              })
          if (!hasPaidAdsTotals(reloadedTotals)) {
            const workspaceScoped = await loadAdsMetricsBundle(ctx, {
              workspaceId: input.workspaceId,
              providerIds: adsProviderIds,
              startDate,
              endDate,
              previousWindow,
            })
            const workspaceTotals = workspaceScoped.metricsRows.length > 0
              ? computeAggregateMetricsFromRows(workspaceScoped.metricsRows)
              : computeAggregateMetrics({
                  spend: workspaceScoped.v2Snapshot.spend,
                  impressions: workspaceScoped.v2Snapshot.impressions,
                  clicks: workspaceScoped.v2Snapshot.clicks,
                  conversions: workspaceScoped.v2Snapshot.conversions,
                  revenue: workspaceScoped.v2Snapshot.revenue,
                })
            if (hasPaidAdsTotals(workspaceTotals)) {
              metricsPayload = workspaceScoped.metricsPayload
              metricsSummary = workspaceScoped.metricsSummary
              metricsRows = workspaceScoped.metricsRows
              v2Snapshot = workspaceScoped.v2Snapshot
              previousSummaryPayload = workspaceScoped.previousSummaryPayload
              previousSummary = workspaceScoped.previousSummary
              previousMetricsRows = workspaceScoped.previousMetricsRows
              previousV2Snapshot = workspaceScoped.previousV2Snapshot
              metricsScopeNote =
                'Showing workspace-level synced metrics because this client has no tagged rows in that window.'
            }
          }
        }
      }
    }

    const syncHint = buildAdsIntegrationSyncHint(integrationStatuses, adsProviderIds)

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
          ? campaignsRaw.flatMap((item) => {
              const record = asRecord(item)
              return record !== null ? [record] : []
            })
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
    const matchingCampaignIds = new Set(
      matchingCampaigns.flatMap((campaign) => (campaign.id ? [campaign.id] : [])),
    )

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

    const currentTotals = filteredMetricsRows.length > 0
      ? computeAggregateMetricsFromRows(filteredMetricsRows)
      : computeAggregateMetrics({
          spend: v2Snapshot.spend,
          impressions: v2Snapshot.impressions,
          clicks: v2Snapshot.clicks,
          conversions: v2Snapshot.conversions,
          revenue: v2Snapshot.revenue,
        })
    const previousTotals = filteredPreviousMetricsRows.length > 0
      ? computeAggregateMetricsFromRows(filteredPreviousMetricsRows)
      : computeAggregateMetrics({
          spend: previousV2Snapshot.spend,
          impressions: previousV2Snapshot.impressions,
          clicks: previousV2Snapshot.clicks,
          conversions: previousV2Snapshot.conversions,
          revenue: previousV2Snapshot.revenue,
        })
    const integrationCurrency = integrationStatuses
      .flatMap((row) => {
        const record = asRecord(row)
        const currency = asNonEmptyString(record?.currency)
        return currency ? [currency.toUpperCase()] : []
      })
      .find((currency) => currency.length === 3)
    const currencyCode = v2Snapshot.currency ?? integrationCurrency ?? 'USD'
    const totalsComparison = buildAggregateComparison(currentTotals, previousTotals)
    const providerBreakdown = filteredMetricsRows.length > 0
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

    const hasPaidAdsSignal = spend > 0 || revenue > 0
    const hasDeliveryWithoutSpend =
      !hasPaidAdsSignal && (impressions > 0 || clicks > 0 || conversions > 0)

    if (spend <= 0 && impressions <= 0 && clicks <= 0 && conversions <= 0 && revenue <= 0) {
      const activeCampaignLines = activeCampaigns.length > 0
        ? activeCampaigns.map((campaign, index) => `${index + 1}. ${campaign.name} (${campaign.providerId})`)
        : ['No active campaigns were returned from the connected providers.']

      return {
        success: true,
        route: '/dashboard/ads',
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
          dataKind: 'ads',
          currencyCode,
          metricsAvailable: false,
          campaignCounts,
          campaignQuery,
          matchedCampaignCount: normalizedCampaignQuery ? matchingCampaigns.length : null,
          activeCampaigns,
          metricsScopeNote,
          currentSituation: syncTimeframeDays !== null
            ? `Synced the last ${syncTimeframeDays} days from connected ad accounts but found no delivery in ${startDate} to ${endDate}.`
            : syncHint ?? 'No synced ad metrics in this window yet.',
          currencyBreakdown: v2Snapshot.currencyBreakdown,
          syncTimeframeDays,
          syncHint,
          suggestedActionRoute: '/dashboard/ads',
        },
        userMessage: [
          normalizedCampaignQuery
            ? `${providerLabel} campaign check (${startDate} to ${endDate}): no synced metrics yet.`
            : `${providerLabel} (${periodLabel}, ${startDate} to ${endDate}): no synced metrics in this window yet.`,
          matchingSummary,
          normalizedCampaignQuery
            ? 'Open a matching campaign below or widen the date range after sync completes.'
            : syncTimeframeDays !== null
              ? `Synced the last ${syncTimeframeDays} days from connected ad accounts but still found no delivery in this range.`
              : syncHint ?? 'Connect an ad account on the Ads page, then sync metrics for this date range.',
        ]
          .filter((line): line is string => Boolean(line))
          .join(' '),
      }
    }

    const currentSituation = hasDeliveryWithoutSpend
      ? [
          'Paid spend is not synced for this window yet.',
          clicks > 0 || impressions > 0
            ? `${formatWholeNumber(clicks)} clicks and ${formatWholeNumber(impressions)} impressions are recorded — confirm ad platform sync completed.`
            : 'Delivery metrics are partial.',
          conversions > 0
            ? `${formatWholeNumber(conversions)} conversions are tracked.`
            : 'No conversions recorded yet.',
        ].join(' ')
      : [
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
      ? topCampaigns.map((campaign, index) => `${index + 1}. ${campaign.name}: ${formatCurrency(campaign.spend, currencyCode)} spend, ${formatWholeNumber(campaign.clicks)} clicks, ${formatWholeNumber(campaign.conversions)} conversions, ${formatRatio(campaign.roas)} ROAS`)
      : ['Top campaigns: unavailable from current synced metrics.']

    const campaignStateLine = campaignCounts.total !== null
      ? `Campaigns: ${campaignCounts.total} total, ${campaignCounts.active ?? 0} active, ${campaignCounts.paused ?? 0} paused`
      : null
    const activeCampaignLines = activeCampaigns.length > 0
      ? activeCampaigns.map((campaign, index) => `${index + 1}. ${campaign.name} (${campaign.providerId})`)
      : ['No active campaigns were returned from the connected providers.']
    const leaderLine = topCampaigns[0] ? `Leading campaign: ${topCampaigns[0].name}` : null
    const headline =
      v2Snapshot.comparability === 'mixed_currency'
        ? `${providerLabel} (${periodLabel}, ${startDate} to ${endDate}): ${formatWholeNumber(impressions)} impressions · ${formatWholeNumber(clicks)} clicks · ${formatWholeNumber(conversions)} conversions. Spend and revenue are broken down by currency below.`
        : `${providerLabel} (${periodLabel}, ${startDate} to ${endDate}): ${formatCurrency(spend, currencyCode)} spend · ${formatCurrency(revenue, currencyCode)} revenue · ${formatRatio(roas)} ROAS · ${formatWholeNumber(conversions)} conversions.`

    return {
      success: true,
      route: '/dashboard/ads',
      data: {
        period,
        periodLabel,
        providerIds,
        providerLabel,
        startDate,
        endDate,
        previousWindow,
        dataKind: 'ads',
        currencyCode,
        insightsWarnings: v2Snapshot.warnings,
        metricsScopeNote,
        currencyBreakdown: v2Snapshot.currencyBreakdown,
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
        metricsAvailable: true,
      },
      userMessage: headline,
    }
  },

  async requestAdsSync(ctx, input) {
    const period = normalizeReportPeriod(input.params.period)
    const { startDate, endDate } = resolveReportWindow(period, input.params)
    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)
    const adsProviderIds = normalizeProviderIds(input.params.providerIds ?? input.params.providerId ?? ALL_PROVIDER_IDS)

    const integrationStatusesRaw = await ctx.runQuery(api.adsIntegrations.listStatuses, {
      workspaceId: input.workspaceId,
      clientId: clientId ?? null,
    })
    let integrationStatuses = Array.isArray(integrationStatusesRaw) ? integrationStatusesRaw : []
    if (integrationStatuses.length === 0 && clientId) {
      const workspaceStatusesRaw = await ctx.runQuery(api.adsIntegrations.listStatuses, {
        workspaceId: input.workspaceId,
        clientId: null,
      })
      integrationStatuses = Array.isArray(workspaceStatusesRaw) ? workspaceStatusesRaw : []
    }

    const syncStatuses = integrationStatuses.flatMap((row) => {
      const record = asRecord(row)
      if (!record) return []
      const providerId = normalizeProviderId(record.providerId)
      if (!providerId || !adsProviderIds.includes(providerId)) return []
      return [{ providerId, accountId: asNonEmptyString(record.accountId) }]
    })

    const connected = syncStatuses.filter((row) => typeof row.accountId === 'string' && row.accountId.length > 0)
    if (connected.length === 0) {
      return {
        success: false,
        retryable: false,
        route: '/dashboard/ads',
        data: { connected: false, providerIds: adsProviderIds },
        userMessage: 'Connect an ad platform on the Ads page before requesting a sync.',
      }
    }

    const syncTimeframeDays = await syncConnectedAdsProviders(ctx, {
      workspaceId: input.workspaceId,
      clientId,
      providerIds: adsProviderIds,
      startDate,
      endDate,
      integrationStatuses: connected,
    })

    const providerLabel = getProviderSummaryLabel(
      connected.flatMap((row) => {
        const providerId = normalizeProviderId(row.providerId)
        return providerId ? [providerId] : []
      }),
    )

    return {
      success: true,
      route: '/dashboard/ads',
      data: {
        syncTimeframeDays,
        providerIds: adsProviderIds,
        startDate,
        endDate,
        suggestedActionRoute: '/dashboard/ads',
      },
      userMessage:
        syncTimeframeDays !== null
          ? `Queued a ${providerLabel} sync for the last ${syncTimeframeDays} days. Metrics will refresh on Ads shortly.`
          : `Queued a ${providerLabel} sync. Metrics will refresh on Ads shortly.`,
    }
  },
}