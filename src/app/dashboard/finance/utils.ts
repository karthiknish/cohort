import type { FinanceCostEntry } from '@/types/finance'

export const formatCurrency = (value: number, options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    ...options,
  }).format(value)

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
