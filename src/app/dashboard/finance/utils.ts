import type { FinanceCostEntry, FinanceCurrencyTotals } from '@/types/finance'
import { formatCurrency } from '@/lib/utils'

export { formatCurrency }

type CurrencyTotalKey = Exclude<keyof FinanceCurrencyTotals, 'currency'>

export const formatCurrencyDistribution = (
  totals: FinanceCurrencyTotals[] | undefined,
  key: CurrencyTotalKey,
  fallbackCurrency = 'USD',
) => {
  if (!totals || totals.length === 0) {
    return formatCurrency(0, fallbackCurrency)
  }

  return totals
    .filter((entry) => Number.isFinite(entry[key]))
    .map((entry) => formatCurrency(Number(entry[key]), entry.currency))
    .join(' · ')
}

export const getPrimaryCurrencyTotals = (totals: FinanceCurrencyTotals[] | undefined): FinanceCurrencyTotals | null => {
  if (!totals || totals.length === 0) {
    return null
  }
  return totals[0]!
}

export const normalizeMonthly = (amount: number, cadence: FinanceCostEntry['cadence']): number => {
  if (cadence === 'monthly') return amount
  if (cadence === 'quarterly') return amount / 3
  if (cadence === 'annual') return amount / 12
  return 0 // 'one-off' is not recurring monthly
}

export const formatCadence = (cadence: FinanceCostEntry['cadence']): string => {
  switch (cadence) {
    case 'one-off':
      return 'One-off'
    case 'monthly':
      return 'Monthly'
    case 'quarterly':
      return 'Quarterly'
    case 'annual':
    default:
      return 'Annual'
  }
}

export function sumByCategory(costs: FinanceCostEntry[]): Record<string, number> {
  return costs.reduce<Record<string, number>>((acc, cost) => {
    const key = (cost.category || 'other').trim().toLowerCase()
    const monthlyValue = normalizeMonthly(cost.amount, cost.cadence)
    acc[key] = (acc[key] ?? 0) + monthlyValue
    return acc
  }, {})
}

export function buildFinanceForecast(entries: Array<{ revenue: number; totalExpenses: number; period: string }>) {
  if (!entries || entries.length === 0) {
    return [] as Array<{ label: string; revenue: number; profit: number }>
  }

  const recent = entries.slice(-4)
  const growthRates: number[] = []
  for (let i = 1; i < recent.length; i += 1) {
    const prev = recent[i - 1]!.revenue
    const curr = recent[i]!.revenue
    if (prev > 0 && curr > 0) {
      growthRates.push((curr - prev) / prev)
    }
  }

  const avgGrowth = growthRates.length ? growthRates.reduce((a, b) => a + b, 0) / growthRates.length : 0
  const last = recent[recent.length - 1]!
  const results: Array<{ label: string; revenue: number; profit: number }> = []
  let projectedRevenue = last.revenue
  let projectedExpenses = last.totalExpenses

  for (let i = 1; i <= 3; i += 1) {
    projectedRevenue = projectedRevenue * (1 + avgGrowth)
    // assume expenses grow slower (half the revenue growth)
    projectedExpenses = projectedExpenses * (1 + avgGrowth / 2)
    results.push({
      label: `Forecast +${i} mo`,
      revenue: projectedRevenue,
      profit: projectedRevenue - projectedExpenses,
    })
  }

  return results
}
