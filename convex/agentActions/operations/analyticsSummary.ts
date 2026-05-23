import { api } from '/_generated/api'
import {
  asNonEmptyString,
  asRecord,
  formatCurrency,
  formatPercent,
  formatWholeNumber,
  normalizeReportPeriod,
  resolveReportWindow,
  unwrapConvexResult,
} from '../helpers'
import type { OperationHandler } from '../types'
import {
  ANALYTICS_PROVIDER_ID,
  buildAggregateComparison,
  computeAggregateMetrics,
  computeAggregateMetricsFromRows,
  filterAnalyticsMetricRows,
  getPreviousDateWindow,
} from './shared'

export type AnalyticsTotals = {
  users: number
  sessions: number
  conversions: number
  revenue: number
  conversionRate: number
  revenuePerSession: number
  sessionsPerUser: number
}

function metricsToAnalyticsTotals(metrics: ReturnType<typeof computeAggregateMetrics>): AnalyticsTotals {
  const users = metrics.impressions
  const sessions = metrics.clicks
  return {
    users,
    sessions,
    conversions: metrics.conversions,
    revenue: metrics.revenue,
    conversionRate: sessions > 0 ? (metrics.conversions / sessions) * 100 : 0,
    revenuePerSession: sessions > 0 ? metrics.revenue / sessions : 0,
    sessionsPerUser: users > 0 ? sessions / users : 0,
  }
}

function buildAnalyticsComparison(
  current: AnalyticsTotals,
  previous: AnalyticsTotals,
  previousWindow: { startDate: string; endDate: string } | null,
) {
  const keys: Array<keyof AnalyticsTotals> = [
    'users',
    'sessions',
    'conversions',
    'revenue',
    'conversionRate',
    'revenuePerSession',
    'sessionsPerUser',
  ]
  const deltaPercent: Partial<Record<keyof AnalyticsTotals, number | null>> = {}

  for (const key of keys) {
    const prior = previous[key]
    const next = current[key]
    deltaPercent[key] =
      Number.isFinite(prior) && Number.isFinite(next) && prior !== 0
        ? ((next - prior) / prior) * 100
        : null
  }

  return { previousTotals: previous, deltaPercent, previousWindow }
}

function buildAnalyticsSituation(totals: AnalyticsTotals): string {
  const parts: string[] = []

  if (totals.users <= 0 && totals.sessions <= 0) {
    parts.push('No synced Google Analytics traffic in this window yet.')
  } else {
    parts.push(
      `${formatWholeNumber(totals.users)} users and ${formatWholeNumber(totals.sessions)} sessions in this window.`,
    )
    if (totals.conversions > 0) {
      parts.push(
        `${formatWholeNumber(totals.conversions)} conversions (${formatPercent(totals.conversionRate)} of sessions).`,
      )
    } else if (totals.sessions > 0) {
      parts.push('Sessions are coming in, but conversions are still light.')
    }
    if (totals.revenue > 0) {
      parts.push(`${formatCurrency(totals.revenue)} revenue (${formatCurrency(totals.revenuePerSession)} per session).`)
    }
    if (totals.sessionsPerUser >= 1.4) {
      parts.push('Users are returning for multiple sessions.')
    } else if (totals.sessionsPerUser > 0 && totals.sessionsPerUser < 1.1) {
      parts.push('Engagement depth is shallow — many users only had one session.')
    }
  }

  return parts.join(' ')
}

export const summarizeAnalyticsPerformanceHandler: OperationHandler = async (ctx, input) => {
  const period = normalizeReportPeriod(input.params.period)
  const { periodLabel, startDate, endDate } = resolveReportWindow(period, input.params)
  const previousWindow = getPreviousDateWindow(startDate, endDate)
  const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)

  const metricsRaw = await ctx.runQuery(api.adsMetrics.listMetricsWithSummary, {
    workspaceId: input.workspaceId,
    clientId: clientId ?? undefined,
    providerIds: [ANALYTICS_PROVIDER_ID],
    startDate,
    endDate,
    aggregate: true,
    limit: 500,
  })

  const metricsPayload = asRecord(unwrapConvexResult(metricsRaw)) ?? asRecord(metricsRaw) ?? {}
  const metricsRows = filterAnalyticsMetricRows(
    Array.isArray(metricsPayload.metrics)
      ? metricsPayload.metrics.flatMap((item) => {
          const record = asRecord(item)
          return record !== null ? [record] : []
        })
      : [],
  )

  const previousSummaryPayload = previousWindow
    ? asRecord(
        unwrapConvexResult(
          await ctx.runQuery(api.adsMetrics.listMetricsWithSummary, {
            workspaceId: input.workspaceId,
            clientId: clientId ?? undefined,
            providerIds: [ANALYTICS_PROVIDER_ID],
            startDate: previousWindow.startDate,
            endDate: previousWindow.endDate,
            aggregate: true,
            limit: 500,
          }),
        ),
      )
    : null
  const previousMetricsRows = filterAnalyticsMetricRows(
    Array.isArray(previousSummaryPayload?.metrics)
      ? previousSummaryPayload.metrics.flatMap((item) => {
          const record = asRecord(item)
          return record !== null ? [record] : []
        })
      : [],
  )

  const currentMetrics = computeAggregateMetricsFromRows(metricsRows)
  const previousMetrics = computeAggregateMetricsFromRows(previousMetricsRows)
  const totals = metricsToAnalyticsTotals(currentMetrics)
  const previousTotals = metricsToAnalyticsTotals(previousMetrics)
  const comparison = buildAnalyticsComparison(totals, previousTotals, previousWindow)
  const currentSituation = buildAnalyticsSituation(totals)
  const dayCount = new Set(metricsRows.map((row) => asNonEmptyString(row.date)).filter(Boolean)).size

  if (totals.users <= 0 && totals.sessions <= 0 && totals.conversions <= 0 && totals.revenue <= 0) {
    return {
      success: true,
      route: '/dashboard/analytics',
      data: {
        dataKind: 'analytics',
        period,
        periodLabel,
        startDate,
        endDate,
        previousWindow,
        comparison,
        totals,
        metricsAvailable: false,
        syncedDays: dayCount,
      },
      userMessage: `Google Analytics (${startDate} to ${endDate}): no synced traffic in this window yet. Connect a property and run a sync from Analytics.`,
    }
  }

  const headline = `Google Analytics ${periodLabel}: ${formatWholeNumber(totals.users)} users · ${formatWholeNumber(totals.sessions)} sessions · ${formatWholeNumber(totals.conversions)} conversions · ${formatCurrency(totals.revenue)} revenue.`

  return {
    success: true,
    route: '/dashboard/analytics',
    data: {
      dataKind: 'analytics',
      period,
      periodLabel,
      startDate,
      endDate,
      previousWindow,
      totals,
      comparison,
      currentSituation,
      metricsAvailable: true,
      syncedDays: dayCount,
      providerLabel: 'Google Analytics',
    },
    userMessage: headline,
  }
}
