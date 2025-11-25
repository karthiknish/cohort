import { authService } from '@/services/auth'
import type {
  RecurringInvoiceSchedule,
  RecurringInvoiceScheduleInput,
  RecurringInvoiceScheduleUpdateInput,
} from '@/types/recurring-invoices'

async function authorizedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = await authService.getIdToken()
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Content-Type') && init.method && init.method !== 'GET') {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(input, {
    ...init,
    headers,
  })
}

export async function fetchRecurringSchedules(options?: {
  activeOnly?: boolean
  clientId?: string
}): Promise<RecurringInvoiceSchedule[]> {
  const params = new URLSearchParams()
  if (options?.activeOnly) params.set('activeOnly', 'true')
  if (options?.clientId) params.set('clientId', options.clientId)

  const url = `/api/recurring-invoices${params.toString() ? `?${params}` : ''}`
  const response = await authorizedFetch(url)

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to fetch recurring schedules')
  }

  const payload = await response.json()
  return payload.schedules ?? []
}

export async function fetchRecurringSchedule(scheduleId: string): Promise<RecurringInvoiceSchedule> {
  const response = await authorizedFetch(`/api/recurring-invoices/${encodeURIComponent(scheduleId)}`)

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to fetch schedule')
  }

  const payload = await response.json()
  return payload.schedule
}

export async function createRecurringSchedule(
  input: RecurringInvoiceScheduleInput
): Promise<RecurringInvoiceSchedule> {
  const response = await authorizedFetch('/api/recurring-invoices', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to create schedule')
  }

  const payload = await response.json()
  return payload.schedule
}

export async function updateRecurringSchedule(
  scheduleId: string,
  input: RecurringInvoiceScheduleUpdateInput
): Promise<RecurringInvoiceSchedule> {
  const response = await authorizedFetch(`/api/recurring-invoices/${encodeURIComponent(scheduleId)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to update schedule')
  }

  const payload = await response.json()
  return payload.schedule
}

export async function deleteRecurringSchedule(scheduleId: string): Promise<void> {
  const response = await authorizedFetch(`/api/recurring-invoices/${encodeURIComponent(scheduleId)}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to delete schedule')
  }
}

export async function triggerRecurringInvoice(
  scheduleId: string
): Promise<{ success: boolean; invoiceId: string; nextRunDate: string }> {
  const response = await authorizedFetch(`/api/recurring-invoices/${encodeURIComponent(scheduleId)}`, {
    method: 'POST',
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to generate invoice')
  }

  return response.json()
}
