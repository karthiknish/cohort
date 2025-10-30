import type {
  FinanceCostEntry,
  FinanceInvoice,
  FinanceRevenueRecord,
  FinanceSummaryResponse,
} from '@/types/finance'

export type FinanceSummary = FinanceSummaryResponse

export type FinanceRevenue = FinanceRevenueRecord

export type FinanceInvoiceWithComputed = FinanceInvoice & {
  overdue?: boolean
}

export type FinanceCost = FinanceCostEntry & {
  monthlyValue: number
}
