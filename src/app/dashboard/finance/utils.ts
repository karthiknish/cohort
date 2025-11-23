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
  return totals[0]
}

export const normalizeMonthly = (amount: number, cadence: FinanceCostEntry['cadence']): number => {
  if (cadence === 'monthly') return amount
  if (cadence === 'quarterly') return amount / 3
  return amount / 12
}

export const formatCadence = (cadence: FinanceCostEntry['cadence']): string => {
  switch (cadence) {
    case 'monthly':
      return 'Monthly'
    case 'quarterly':
      return 'Quarterly'
    case 'annual':
    default:
      return 'Annual'
  }
}
