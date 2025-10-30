export type FinanceCostCadence = 'monthly' | 'quarterly' | 'annual'

export type FinanceCostEntry = {
  id: string
  category: string
  amount: number
  cadence: FinanceCostCadence
  clientId: string | null
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
  issuedDate: string | null
  dueDate: string | null
  description: string | null
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
  createdAt?: string | null
  updatedAt?: string | null
}

export type FinanceSummaryResponse = {
  revenue: FinanceRevenueRecord[]
  invoices: FinanceInvoice[]
  costs: FinanceCostEntry[]
}
