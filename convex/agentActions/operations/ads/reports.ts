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
  getPreviousDateWindow,
} from '../shared'

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
    const metricsRecordCount = Math.max(0, Math.trunc(asNumber(metricsSummary.count) ?? 0))
    const metricsAvailable = metricsRecordCount > 0

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
    const currentTotals = computeAggregateMetrics(asRecord(metricsSummary.totals))
    const previousTotals = computeAggregateMetrics(asRecord(previousSummary.totals))
    const totalsComparison = buildAggregateComparison(currentTotals, previousTotals)
    const providerBreakdown = buildProviderBreakdown({
      currentProviders: asRecord(metricsSummary.providers),
      previousProviders: asRecord(previousSummary.providers),
    })

    const { spend, impressions, clicks, conversions, revenue, roas, ctr } = currentTotals

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
      metricsAvailable ? `Ad Spend: ${formatCurrency(spend)}` : 'Ad Spend: No synced metrics in this window',
      metricsAvailable ? `Revenue: ${formatCurrency(revenue)}` : 'Revenue: No synced metrics in this window',
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
          ? `Spend ${formatCurrency(spend)} · Revenue ${formatCurrency(revenue)} · ROAS ${formatRatio(roas)}`
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

    return {
      success: true,
      route: '/dashboard/analytics',
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
        previousWindow,
        comparison: { ...totalsComparison, previousWindow },
        providerBreakdown,
        proposalSummary,
        delivery: {
          inApp: inAppDelivered,
          email: false,
        },
      },
      userMessage: metricsAvailable
        ? `Generated your ${periodLabel.toLowerCase()} performance report${inAppDelivered ? ' and shared it in-app.' : '.'}`
        : `Generated your ${periodLabel.toLowerCase()} report${inAppDelivered ? ' and shared it in-app.' : '.'} No synced ads metrics were available for that window yet.`,
    }
  },
}