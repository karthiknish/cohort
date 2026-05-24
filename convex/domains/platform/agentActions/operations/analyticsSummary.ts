import { api, internal } from '/_generated/api'
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
  computeAggregateMetricsFromRows,
  filterAnalyticsMetricRows,
  getPreviousDateWindow,
  resolveAdsSyncTimeframeDays,
  type AggregateMetrics,
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

function resolveAnalyticsCurrencyCode(rows: Record<string, unknown>[]): string {
  for (const row of rows) {
    const currency = asNonEmptyString(row.currency)
    if (currency && /^[A-Z]{3}$/i.test(currency)) {
      return currency.toUpperCase()
    }
  }
  return 'USD'
}

function metricsToAnalyticsTotals(metrics: AggregateMetrics): AnalyticsTotals {
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

function buildAnalyticsSituation(totals: AnalyticsTotals, currencyCode = 'USD'): string {
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
      parts.push(
        `${formatCurrency(totals.revenue, currencyCode)} revenue (${formatCurrency(totals.revenuePerSession, currencyCode)} per session).`,
      )
    }
    if (totals.sessionsPerUser >= 1.4) {
      parts.push('Users are returning for multiple sessions.')
    } else if (totals.sessionsPerUser > 0 && totals.sessionsPerUser < 1.1) {
      parts.push('Engagement depth is shallow — many users only had one session.')
    }
  }

  return parts.join(' ')
}

function hasAnalyticsTotals(totals: AnalyticsTotals): boolean {
  return totals.users > 0 || totals.sessions > 0 || totals.conversions > 0 || totals.revenue > 0
}

async function loadAnalyticsMetrics(
  ctx: Parameters<OperationHandler>[0],
  args: {
    workspaceId: string
    clientId: string | null
    startDate: string
    endDate: string
  },
) {
  const metricsRaw = await ctx.runQuery(api.adsMetrics.listMetricsWithSummary, {
    workspaceId: args.workspaceId,
    clientId: args.clientId ?? undefined,
    providerIds: [ANALYTICS_PROVIDER_ID],
    startDate: args.startDate,
    endDate: args.endDate,
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

  return { metricsPayload, metricsRows }
}

async function syncConnectedGoogleAnalytics(
  ctx: Parameters<OperationHandler>[0],
  args: {
    workspaceId: string
    clientId: string | null
    startDate: string
    endDate: string
  },
): Promise<{ synced: boolean; timeframeDays: number | null; syncHint: string | null }> {
  const status = asRecord(
    await ctx.runQuery(api.analyticsIntegrations.getGoogleAnalyticsStatus, {
      workspaceId: args.workspaceId,
      clientId: args.clientId,
    }),
  )

  if (!status) {
    return {
      synced: false,
      timeframeDays: null,
      syncHint: 'Connect Google Analytics on the Analytics page, then select a property.',
    }
  }

  if (!asNonEmptyString(status.accountId)) {
    return {
      synced: false,
      timeframeDays: null,
      syncHint: 'Google Analytics is linked but no property is selected yet. Finish setup on the Analytics page.',
    }
  }

  const timeframeDays = resolveAdsSyncTimeframeDays(args.startDate, args.endDate)

  await ctx.runMutation(api.adsIntegrations.requestManualSync, {
    workspaceId: args.workspaceId,
    providerId: ANALYTICS_PROVIDER_ID,
    clientId: args.clientId,
    timeframeDays,
  })

  await ctx.runAction(internal.adSyncWorkerActions.processNextQueuedSyncJobInternal, {
    workspaceId: args.workspaceId,
  })

  return {
    synced: true,
    timeframeDays,
    syncHint: `Synced the last ${timeframeDays} days from ${asNonEmptyString(status.accountName) ?? 'your GA4 property'}.`,
  }
}

export const requestAnalyticsSyncHandler: OperationHandler = async (ctx, input) => {
  const period = normalizeReportPeriod(input.params.period)
  const { startDate, endDate } = resolveReportWindow(period, input.params)
  const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)

  const syncResult = await syncConnectedGoogleAnalytics(ctx, {
    workspaceId: input.workspaceId,
    clientId,
    startDate,
    endDate,
  })

  if (!syncResult.synced) {
    return {
      success: false,
      retryable: false,
      route: '/dashboard/analytics',
      data: { connected: false, syncHint: syncResult.syncHint },
      userMessage: syncResult.syncHint ?? 'Connect Google Analytics before requesting a sync.',
    }
  }

  return {
    success: true,
    route: '/dashboard/analytics',
    data: {
      syncTimeframeDays: syncResult.timeframeDays,
      startDate,
      endDate,
      syncHint: syncResult.syncHint,
      suggestedActionRoute: '/dashboard/analytics',
    },
    userMessage:
      syncResult.syncHint ??
      `Queued a Google Analytics sync for the last ${syncResult.timeframeDays ?? 30} days.`,
  }
}

export const summarizeAnalyticsPerformanceHandler: OperationHandler = async (ctx, input) => {
  const period = normalizeReportPeriod(input.params.period)
  const { periodLabel, startDate, endDate } = resolveReportWindow(period, input.params)
  const previousWindow = getPreviousDateWindow(startDate, endDate)
  const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)

  let { metricsRows } = await loadAnalyticsMetrics(ctx, {
    workspaceId: input.workspaceId,
    clientId,
    startDate,
    endDate,
  })

  const gaStatus = asRecord(
    await ctx.runQuery(api.analyticsIntegrations.getGoogleAnalyticsStatus, {
      workspaceId: input.workspaceId,
      clientId,
    }),
  )

  let syncTimeframeDays: number | null = null
  let syncHint: string | null = null

  let totals = metricsToAnalyticsTotals(computeAggregateMetricsFromRows(metricsRows))
  if (!hasAnalyticsTotals(totals)) {
    const syncResult = await syncConnectedGoogleAnalytics(ctx, {
      workspaceId: input.workspaceId,
      clientId,
      startDate,
      endDate,
    })
    syncTimeframeDays = syncResult.timeframeDays
    syncHint = syncResult.syncHint

    if (syncResult.synced) {
      const reloaded = await loadAnalyticsMetrics(ctx, {
        workspaceId: input.workspaceId,
        clientId,
        startDate,
        endDate,
      })
      metricsRows = reloaded.metricsRows
      totals = metricsToAnalyticsTotals(computeAggregateMetricsFromRows(metricsRows))
    }
  }

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

  const previousTotals = metricsToAnalyticsTotals(computeAggregateMetricsFromRows(previousMetricsRows))
  const comparison = buildAnalyticsComparison(totals, previousTotals, previousWindow)
  const dayCount = new Set(
    metricsRows.flatMap((row) => {
      const date = asNonEmptyString(row.date)
      return date ? [date] : []
    }),
  ).size
  const currencyCode = resolveAnalyticsCurrencyCode(metricsRows)
  const currentSituation = buildAnalyticsSituation(totals, currencyCode)

  const connection = gaStatus
    ? {
        accountId: asNonEmptyString(gaStatus.accountId),
        accountName: asNonEmptyString(gaStatus.accountName),
        currency: asNonEmptyString(gaStatus.currency),
        lastSyncStatus: asNonEmptyString(gaStatus.lastSyncStatus),
      }
    : null

  if (!hasAnalyticsTotals(totals)) {
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
        currentSituation,
        metricsAvailable: false,
        syncedDays: dayCount,
        currencyCode,
        providerLabel: 'Google Analytics',
        connection,
        syncTimeframeDays,
        syncHint,
        suggestedActionRoute: '/dashboard/analytics',
      },
      userMessage: [
        `Google Analytics (${periodLabel}, ${startDate} to ${endDate}): no synced traffic in this window yet.`,
        syncTimeframeDays !== null
          ? `Synced the last ${syncTimeframeDays} days but still found no traffic rows for this range.`
          : syncHint ?? 'Connect a property and run a sync from Analytics.',
      ]
        .filter((line): line is string => Boolean(line))
        .join(' '),
    }
  }

  const headline = `Google Analytics (${periodLabel}, ${startDate} to ${endDate}): ${formatWholeNumber(totals.users)} users · ${formatWholeNumber(totals.sessions)} sessions · ${formatWholeNumber(totals.conversions)} conversions · ${formatCurrency(totals.revenue, currencyCode)} revenue.`

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
      currencyCode,
      providerLabel: 'Google Analytics',
      connection,
      syncTimeframeDays,
      syncHint,
    },
    userMessage: headline,
  }
}
