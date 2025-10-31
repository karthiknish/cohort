export type FinanceCostCadence = 'monthly' | 'quarterly' | 'annual'

export type FinanceCostEntry = {
  id: string
  category: string
  amount: number
  cadence: FinanceCostCadence
  clientId: string | null
  currency?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type FinanceInvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export type FinanceInvoice = {
  id: string
  clientId: string | null
  clientName: string
  amount: number
  status: FinanceInvoiceStatus
  stripeStatus?: string | null
  issuedDate: string | null
  dueDate: string | null
  paidDate?: string | null
  amountPaid?: number | null
  amountRemaining?: number | null
  amountRefunded?: number | null
  currency?: string | null
  description: string | null
  hostedInvoiceUrl?: string | null
  number?: string | null
  paymentIntentId?: string | null
  collectionMethod?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type FinanceRevenueRecord = {
  id: string
  clientId: string | null
  period: string
  label?: string | null
  revenue: number
  operatingExpenses: number
  currency?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type FinanceCurrencyTotals = {
  currency: string
  totalInvoiced: number
  totalPaid: number
  totalOutstanding: number
  refundTotal: number
}

export type FinanceSummaryResponse = {
  revenue: FinanceRevenueRecord[]
  invoices: FinanceInvoice[]
  costs: FinanceCostEntry[]
  payments: FinancePaymentSummary
  invoiceNextCursor?: string | null
  costNextCursor?: string | null
}

export type FinancePaymentSummary = {
  totals: FinanceCurrencyTotals[]
  overdueCount: number
  paidCount: number
  openCount: number
  nextDueAt: string | null
  lastPaymentAt: string | null
}
