import { api } from '/_generated/api'
import {
  asNonEmptyString,
  asNumber,
  asRecord,
  formatCurrency,
  formatPercent,
  formatRatio,
  formatWholeNumber,
  normalizeProviderId,
  normalizeProviderIds,
  normalizeReportPeriod,
  resolveReportWindow,
  unwrapConvexResult,
} from '../../helpers'
import type { OperationHandler } from '../../types'
import {
  buildAggregateComparison,
  buildProviderBreakdown,
  computeAggregateMetrics,
  extractV2InsightsSnapshot,
  getPreviousDateWindow,
} from '../shared'

function buildMixedCurrencyHeadline(
  providerLabel: string,
  periodLabel: string,
  startDate: string,
  endDate: string,
  impressions: number,
  clicks: number,
  conversions: number,
): string {
  return `${providerLabel} (${periodLabel}, ${startDate} to ${endDate}): ${formatWholeNumber(impressions)} impressions · ${formatWholeNumber(clicks)} clicks · ${formatWholeNumber(conversions)} conversions. Spend and revenue are broken down by currency below.`
}

export const reportOperationHandlers: Record<string, OperationHandler> = {
  async generatePerformanceReport(ctx, input) {
    const period = normalizeReportPeriod(input.params.period)
    const { periodLabel, startDate, endDate, startDateMs, endDateMs } = resolveReportWindow(period, input.params)
    const previousWindow = getPreviousDateWindow(startDate, endDate)

    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)
    const explicitProvider = normalizeProviderId(input.params.providerId)
    const providerIds = normalizeProviderIds(input.params.providerIds)
    if (explicitProvider && !providerIds.includes(explicitProvider)) {
      providerIds.unshift(explicitProvider)
    }

    const metricsRaw = await ctx.runQuery(api.adsMetrics.listMetricsWithSummaryV2, {
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
    const v2Snapshot = extractV2InsightsSnapshot(metricsSummary)
    const metricsRecordCount = Math.max(0, Math.trunc(asNumber(metricsSummary.count) ?? 0))
    const metricsAvailable =
      metricsRecordCount > 0 &&
      (v2Snapshot.spend > 0 ||
        v2Snapshot.revenue > 0 ||
        v2Snapshot.impressions > 0 ||
        v2Snapshot.clicks > 0 ||
        v2Snapshot.conversions > 0)

    const previousSummaryPayload = previousWindow
      ? asRecord(unwrapConvexResult(await ctx.runQuery(api.adsMetrics.listMetricsWithSummaryV2, {
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
    const previousV2Snapshot = extractV2InsightsSnapshot(previousSummary)
    const currencyCode = v2Snapshot.currency ?? 'USD'
    const currentTotals = computeAggregateMetrics({
      spend: v2Snapshot.spend,
      impressions: v2Snapshot.impressions,
      clicks: v2Snapshot.clicks,
      conversions: v2Snapshot.conversions,
      revenue: v2Snapshot.revenue,
    })
    const previousTotals = computeAggregateMetrics({
      spend: previousV2Snapshot.spend,
      impressions: previousV2Snapshot.impressions,
      clicks: previousV2Snapshot.clicks,
      conversions: previousV2Snapshot.conversions,
      revenue: previousV2Snapshot.revenue,
    })
    const totalsComparison = buildAggregateComparison(currentTotals, previousTotals)
    const providerBreakdown = buildProviderBreakdown({
      currentProviders: asRecord(metricsSummary.providers),
      previousProviders: asRecord(previousSummary.providers),
    })

    const { spend, impressions, clicks, conversions, revenue, roas, ctr, cpc, cpa } = currentTotals

    const proposalRaw = await ctx.runQuery(api.proposalAnalytics.summarize, {
      workspaceId: input.workspaceId,
      startDateMs,
      endDateMs,
      clientId: clientId ?? null,
      limit: 500,
    })
    const proposalPayload = asRecord(unwrapConvexResult(proposalRaw)) ?? asRecord(proposalRaw) ?? {}
    const proposalSummary = asRecord(proposalPayload.summary) ?? {}
    const proposalCount = Math.max(0, Math.trunc(asNumber(proposalSummary.totalSubmitted) ?? 0))

    const reportText = [
      `${periodLabel} Performance Report (${startDate} to ${endDate})`,
      metricsAvailable ? `Ad Spend: ${formatCurrency(spend, currencyCode)}` : 'Ad Spend: No synced metrics in this window',
      metricsAvailable ? `Revenue: ${formatCurrency(revenue, currencyCode)}` : 'Revenue: No synced metrics in this window',
      metricsAvailable ? `ROAS: ${formatRatio(roas)}` : 'ROAS: No synced metrics in this window',
      metricsAvailable ? `Impressions: ${formatWholeNumber(impressions)}` : 'Impressions: No synced metrics in this window',
      metricsAvailable ? `Clicks: ${formatWholeNumber(clicks)}` : 'Clicks: No synced metrics in this window',
      metricsAvailable ? `CTR: ${formatPercent(ctr)}` : 'CTR: No synced metrics in this window',
      metricsAvailable ? `Conversions: ${formatWholeNumber(conversions)}` : 'Conversions: No synced metrics in this window',
      `Proposals Submitted: ${proposalCount}`,
      `Proposal AI Success Rate: ${Number(asNumber(proposalSummary.aiSuccessRate) ?? 0).toFixed(2)}%`,
    ].join('\n')

    const notificationLegacyId = `agent_report_${period}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    let inAppDelivered = false

    try {
      await ctx.runMutation(api.notifications.create, {
        workspaceId: input.workspaceId,
        legacyId: notificationLegacyId,
        kind: 'report.generated',
        title: `${periodLabel} report is ready`,
        body: metricsAvailable
          ? `Spend ${formatCurrency(spend, currencyCode)} · Revenue ${formatCurrency(revenue, currencyCode)} · ROAS ${formatRatio(roas)}`
          : `No synced ads metrics yet · ${proposalCount} proposal${proposalCount === 1 ? '' : 's'} submitted`,
        actorId: input.userId,
        actorName: null,
        resourceType: 'report',
        resourceId: notificationLegacyId,
        recipientRoles: ['admin', 'team'],
        recipientClientId: clientId ?? null,
        recipientClientIds: clientId ? [clientId] : undefined,
        recipientUserIds: [input.userId],
        metadata: {
          period,
          startDate,
          endDate,
          reportText,
          totals: {
            spend,
            revenue,
            roas,
            impressions,
            clicks,
            ctr,
            conversions,
          },
          metricsAvailable,
          metricsRecordCount,
          proposalSummary,
        },
        createdAtMs: Date.now(),
        updatedAtMs: Date.now(),
      })
      inAppDelivered = true
    } catch {
      inAppDelivered = false
    }

    const currentSituation = metricsAvailable
      ? [
          spend > 0
            ? roas >= 3
              ? 'ROAS is strong for this period.'
              : roas >= 1.5
                ? 'ROAS is stable with room to optimize.'
                : 'ROAS is soft and needs attention.'
            : 'Spend has not started flowing in this window.',
          ctr >= 1.5 ? 'CTR looks healthy.' : impressions > 0 ? 'CTR is light — creative or audience tuning may help.' : null,
          conversions > 0
            ? `${formatWholeNumber(conversions)} conversions recorded.`
            : clicks > 0
              ? 'Traffic is coming in, but conversions are still thin.'
              : null,
        ]
          .filter((line): line is string => Boolean(line))
          .join(' ')
      : 'No synced ads metrics were available for this window. Proposal activity is still included below.'

    return {
      success: true,
      route: '/dashboard/ads',
      data: {
        reportId: notificationLegacyId,
        period,
        periodLabel,
        startDate,
        endDate,
        reportText,
        metricsSummary,
        metricsAvailable,
        metricsRecordCount,
        dataKind: 'ads',
        currencyCode,
        insightsWarnings: v2Snapshot.warnings,
        currencyBreakdown: v2Snapshot.currencyBreakdown,
        totals: { spend, impressions, clicks, conversions, revenue, roas, ctr, cpc, cpa },
        previousWindow,
        comparison: { ...totalsComparison, previousWindow },
        providerBreakdown,
        proposalSummary,
        currentSituation,
        delivery: {
          inApp: inAppDelivered,
          email: false,
        },
      },
      userMessage: metricsAvailable
        ? v2Snapshot.comparability === 'mixed_currency'
          ? `${buildMixedCurrencyHeadline('Report', periodLabel, startDate, endDate, impressions, clicks, conversions)}${inAppDelivered ? ' Shared in-app.' : ''}`
          : `${periodLabel} report (${startDate} to ${endDate}): ${formatCurrency(spend, currencyCode)} spend · ${formatCurrency(revenue, currencyCode)} revenue · ${formatRatio(roas)} ROAS · ${formatWholeNumber(conversions)} conversions.${inAppDelivered ? ' Shared in-app.' : ''}`
        : `${periodLabel} report is ready, but no synced ads metrics were found for ${startDate} to ${endDate}.${inAppDelivered ? ' Shared in-app.' : ''}`,
    }
  },
}