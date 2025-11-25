export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'annually'

export interface RecurringInvoiceSchedule {
  id: string
  clientId: string
  clientName: string
  amount: number
  currency: string
  description: string | null
  frequency: RecurringFrequency
  dayOfMonth: number | null // For monthly/quarterly/annually - day of month (1-28)
  dayOfWeek: number | null // For weekly - day of week (0-6, 0=Sunday)
  startDate: string
  endDate: string | null // null = indefinite
  nextRunDate: string
  lastRunDate: string | null
  lastInvoiceId: string | null
  isActive: boolean
  totalInvoicesGenerated: number
  createdBy: string
  createdAt: string | null
  updatedAt: string | null
}

export interface RecurringInvoiceScheduleInput {
  clientId: string
  clientName?: string
  amount: number
  currency?: string
  description?: string | null
  frequency: RecurringFrequency
  dayOfMonth?: number | null
  dayOfWeek?: number | null
  startDate: string
  endDate?: string | null
}

export interface RecurringInvoiceScheduleUpdateInput {
  amount?: number
  currency?: string
  description?: string | null
  frequency?: RecurringFrequency
  dayOfMonth?: number | null
  dayOfWeek?: number | null
  endDate?: string | null
  isActive?: boolean
}

export interface RecurringInvoiceRunResult {
  scheduleId: string
  invoiceId: string
  clientId: string
  amount: number
  currency: string
  generatedAt: string
}
