import {
  aggregateMetricFinancials,
  formatAggregatedMoney,
  isFinancialComparable,
  type MetricFinancialRow,
} from '@/domain/ads/aggregate-financials'
import type { FinancialTotals } from '@/domain/ads/types'
import { formatCurrency } from '@/lib/utils'

export type AnalyticsMoneyRow = {
  spend?: number
  revenue?: number | null
  currency?: string | null
}

export type AnalyticsMoneyDisplay = {
  financialTotals: FinancialTotals
  displayCurrency: string | null
  formatRevenue: (amount: number | null | undefined) => string
  /** Comparable total revenue, or null when currencies cannot be combined. */
  totalRevenue: number | null
  revenueComparable: boolean
}

function toFinancialRows(
  metrics: AnalyticsMoneyRow[],
  integrationCurrency?: string | null,
): MetricFinancialRow[] {
  const fallback =
    typeof integrationCurrency === 'string' && integrationCurrency.trim().length > 0
      ? integrationCurrency.trim().toUpperCase()
      : null

  return metrics.map((metric) => ({
    spend: Number(metric.spend ?? 0),
    revenue: metric.revenue ?? 0,
    currency:
      typeof metric.currency === 'string' && metric.currency.trim().length > 0
        ? metric.currency.trim().toUpperCase()
        : fallback,
    impressions: 0,
    clicks: 0,
    conversions: 0,
  }))
}

/**
 * Resolve display currency and safe revenue formatting for analytics metrics.
 * Uses the same comparability rules as the dashboard and ads read model.
 */
export function buildAnalyticsMoneyDisplay(
  metrics: AnalyticsMoneyRow[],
  options?: {
    integrationCurrency?: string | null
    preferenceCurrency?: string
  },
): AnalyticsMoneyDisplay {
  const preferenceCurrency = options?.preferenceCurrency ?? 'USD'
  let { financialTotals } = aggregateMetricFinancials(
    toFinancialRows(metrics, options?.integrationCurrency),
  )

  const integrationCurrency =
    typeof options?.integrationCurrency === 'string' && options.integrationCurrency.trim().length > 0
      ? options.integrationCurrency.trim().toUpperCase()
      : null

  if (
    !isFinancialComparable(financialTotals.comparability) &&
    financialTotals.comparability === 'unknown_currency' &&
    metrics.some((row) => (row.revenue ?? 0) > 0 || (row.spend ?? 0) > 0)
  ) {
    const fallbackCurrency = integrationCurrency ?? preferenceCurrency
    const preferenceTotals = aggregateMetricFinancials(
      metrics.map((row) => ({
        spend: Number(row.spend ?? 0),
        revenue: row.revenue ?? 0,
        currency: fallbackCurrency,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      })),
    )
    if (isFinancialComparable(preferenceTotals.financialTotals.comparability)) {
      financialTotals = preferenceTotals.financialTotals
    }
  }

  const formatRevenue = (amount: number | null | undefined) =>
    formatAggregatedMoney(amount ?? null, financialTotals, formatCurrency)

  return {
    financialTotals,
    displayCurrency: financialTotals.primaryCurrency,
    formatRevenue,
    totalRevenue: financialTotals.revenue,
    revenueComparable: isFinancialComparable(financialTotals.comparability),
  }
}
