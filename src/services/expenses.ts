import type { Expense, ExpenseCategory, ExpenseReportResponse, Vendor } from '@/types/expenses'
import { apiFetch } from '@/lib/api-client'

export type CreateExpenseInput = {
  description: string
  amount: number
  currency?: string
  costType?: Expense['costType']
  incurredAt?: string | null
  categoryId?: string | null
  vendorId?: string | null
  employeeId?: string | null
  attachments?: Expense['attachments']
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>

export async function listExpenseCategories(options?: { includeInactive?: boolean }) {
  const search = new URLSearchParams()
  if (options?.includeInactive) search.set('includeInactive', 'true')
  const url = search.size ? `/api/finance/expense-categories?${search.toString()}` : '/api/finance/expense-categories'
  return apiFetch<{ categories: ExpenseCategory[] }>(url)
}

export async function createExpenseCategory(input: {
  name: string
  code?: string | null
  description?: string | null
  isActive?: boolean
  sortOrder?: number
}) {
  return apiFetch<{ category: ExpenseCategory }>('/api/finance/expense-categories', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateExpenseCategory(id: string, input: Partial<Omit<ExpenseCategory, 'id'>>) {
  return apiFetch<{ ok: true }>(`/api/finance/expense-categories/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteExpenseCategory(id: string) {
  return apiFetch<{ ok: true }>(`/api/finance/expense-categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function listVendors(options?: { includeInactive?: boolean; q?: string }) {
  const search = new URLSearchParams()
  if (options?.includeInactive) search.set('includeInactive', 'true')
  if (options?.q) search.set('q', options.q)
  const url = search.size ? `/api/finance/vendors?${search.toString()}` : '/api/finance/vendors'
  return apiFetch<{ vendors: Vendor[] }>(url)
}

export async function createVendor(input: {
  name: string
  email?: string | null
  phone?: string | null
  website?: string | null
  notes?: string | null
  isActive?: boolean
}) {
  return apiFetch<{ vendor: Vendor }>('/api/finance/vendors', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateVendor(id: string, input: Partial<Omit<Vendor, 'id'>>) {
  return apiFetch<{ ok: true }>(`/api/finance/vendors/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteVendor(id: string) {
  return apiFetch<{ ok: true }>(`/api/finance/vendors/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function listExpenses(options?: { employeeId?: string; status?: string; limit?: number }) {
  const search = new URLSearchParams()
  if (options?.employeeId) search.set('employeeId', options.employeeId)
  if (options?.status) search.set('status', options.status)
  if (typeof options?.limit === 'number') search.set('limit', String(options.limit))
  const url = search.size ? `/api/finance/expenses?${search.toString()}` : '/api/finance/expenses'
  return apiFetch<{ expenses: Expense[] }>(url)
}

export async function createExpense(input: CreateExpenseInput) {
  return apiFetch<{ expense: Expense }>('/api/finance/expenses', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateExpense(id: string, input: UpdateExpenseInput) {
  return apiFetch<{ ok: true }>(`/api/finance/expenses/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteExpense(id: string) {
  return apiFetch<{ ok: true }>(`/api/finance/expenses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function transitionExpense(id: string, action: 'submit' | 'approve' | 'reject' | 'mark_paid', note?: string | null) {
  return apiFetch<{ ok: true }>(`/api/finance/expenses/${encodeURIComponent(id)}`, {
    method: 'POST',
    body: JSON.stringify({ action, note: note ?? null }),
  })
}

export async function fetchExpenseReport(options?: { from?: string; to?: string }) {
  const search = new URLSearchParams()
  if (options?.from) search.set('from', options.from)
  if (options?.to) search.set('to', options.to)
  const url = search.size ? `/api/finance/expenses/report?${search.toString()}` : '/api/finance/expenses/report'
  return apiFetch<ExpenseReportResponse>(url)
}
