import { authService } from '@/services/auth'
import type {
  RecurringInvoiceSchedule,
  RecurringInvoiceScheduleInput,
  RecurringInvoiceScheduleUpdateInput,
} from '@/types/recurring-invoices'

import { apiFetch } from '@/lib/api-client'

export async function fetchRecurringSchedules(options?: {
  activeOnly?: boolean
  clientId?: string
}): Promise<RecurringInvoiceSchedule[]> {
  const params = new URLSearchParams()
  if (options?.activeOnly) params.set('activeOnly', 'true')
  if (options?.clientId) params.set('clientId', options.clientId)

  const url = `/api/recurring-invoices${params.toString() ? `?${params}` : ''}`
  const payload = await apiFetch<{ schedules: RecurringInvoiceSchedule[] }>(url)
  return payload.schedules ?? []
}

export async function fetchRecurringSchedule(scheduleId: string): Promise<RecurringInvoiceSchedule> {
  const payload = await apiFetch<{ schedule: RecurringInvoiceSchedule }>(`/api/recurring-invoices/${encodeURIComponent(scheduleId)}`)
  return payload.schedule
}

export async function createRecurringSchedule(
  input: RecurringInvoiceScheduleInput
): Promise<RecurringInvoiceSchedule> {
  const payload = await apiFetch<{ schedule: RecurringInvoiceSchedule }>('/api/recurring-invoices', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return payload.schedule
}

export async function updateRecurringSchedule(
  scheduleId: string,
  input: RecurringInvoiceScheduleUpdateInput
): Promise<RecurringInvoiceSchedule> {
  const payload = await apiFetch<{ schedule: RecurringInvoiceSchedule }>(`/api/recurring-invoices/${encodeURIComponent(scheduleId)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })

  return payload.schedule
}

export async function deleteRecurringSchedule(scheduleId: string): Promise<void> {
  await apiFetch(`/api/recurring-invoices/${encodeURIComponent(scheduleId)}`, {
    method: 'DELETE',
  })
}

export async function triggerRecurringInvoice(
  scheduleId: string
): Promise<{ success: boolean; invoiceId: string; nextRunDate: string }> {
  return apiFetch<{ success: boolean; invoiceId: string; nextRunDate: string }>(`/api/recurring-invoices/${encodeURIComponent(scheduleId)}`, {
    method: 'POST',
  })
}
