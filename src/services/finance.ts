import { authService } from '@/services/auth'
import type {
  FinanceCostCadence,
  FinanceCostEntry,
  FinanceSummaryResponse,
} from '@/types/finance'

type FetchFinanceSummaryOptions = {
  clientId?: string | null
  invoiceAfter?: string | null
  costAfter?: string | null
  invoicePageSize?: number
  costPageSize?: number
}

type CreateFinanceCostInput = {
  category: string
  amount: number
  cadence: FinanceCostCadence
  currency?: string
  clientId?: string | null
}

import { apiFetch } from '@/lib/api-client'

export async function fetchFinanceSummary(options: FetchFinanceSummaryOptions = {}): Promise<FinanceSummaryResponse> {
  const search = new URLSearchParams()
  if (options.clientId) {
    search.set('clientId', options.clientId)
  }
  if (options.invoiceAfter) {
    search.set('invoiceAfter', options.invoiceAfter)
  }
  if (options.costAfter) {
    search.set('costAfter', options.costAfter)
  }
  if (typeof options.invoicePageSize === 'number') {
    search.set('invoicePageSize', String(options.invoicePageSize))
  }
  if (typeof options.costPageSize === 'number') {
    search.set('costPageSize', String(options.costPageSize))
  }

  const url = search.size > 0 ? `/api/finance?${search.toString()}` : '/api/finance'
  const payload = await apiFetch<FinanceSummaryResponse>(url)
  return payload
}

export async function createFinanceCost(input: CreateFinanceCostInput): Promise<FinanceCostEntry> {
  const payload = await apiFetch<{ cost: FinanceCostEntry }>('/api/finance/costs', {
    method: 'POST',
    body: JSON.stringify({
      category: input.category,
      amount: input.amount,
      cadence: input.cadence,
      currency: input.currency ?? 'USD',
      clientId: input.clientId ?? null,
    }),
  })

  return payload.cost
}

export async function deleteFinanceCost(costId: string): Promise<void> {
  if (!costId) {
    throw new Error('Cost id is required')
  }

  await apiFetch(`/api/finance/costs/${encodeURIComponent(costId)}`, {
    method: 'DELETE',
  })
}

export async function createBillingPortalSession(clientId: string | null): Promise<{ url: string }> {
  return apiFetch<{ url: string }>('/api/billing/portal', {
    method: 'POST',
    body: JSON.stringify({ clientId }),
  })
}

export async function sendInvoiceReminder(invoiceId: string): Promise<void> {
  if (!invoiceId) {
    throw new Error('Invoice id is required')
  }

  await apiFetch(`/api/finance/invoices/${encodeURIComponent(invoiceId)}/remind`, {
    method: 'POST',
  })
}

export async function issueInvoiceRefund(invoiceId: string, amount?: number): Promise<{ refundId: string; amount: number }> {
  if (!invoiceId) {
    throw new Error('Invoice id is required')
  }

  const body: Record<string, unknown> = {}
  if (typeof amount === 'number' && Number.isFinite(amount) && amount > 0) {
    body.amount = amount
  }

  const payload = await apiFetch<{ refund: { id: string; amount: number } }>(`/api/finance/invoices/${encodeURIComponent(invoiceId)}/refund`, {
    method: 'POST',
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  })

  return { refundId: payload.refund.id, amount: payload.refund.amount }
}
