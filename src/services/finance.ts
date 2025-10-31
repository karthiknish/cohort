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
  clientId?: string | null
}

async function authorizedFetch(input: string, init: RequestInit = {}) {
  const token = await authService.getIdToken()
  if (!token) {
    throw new Error('Authentication required to load finance data')
  }

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(input, {
    ...init,
    headers,
    cache: 'no-store',
  })

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const errorMessage =
      payload && typeof payload === 'object' && 'error' in payload && typeof (payload as { error?: unknown }).error === 'string'
        ? (payload as { error?: string }).error
        : 'Failed to process finance request'
    throw new Error(errorMessage)
  }

  return payload
}

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
  const payload = await authorizedFetch(url)
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid finance summary response')
  }
  return payload as FinanceSummaryResponse
}

export async function createFinanceCost(input: CreateFinanceCostInput): Promise<FinanceCostEntry> {
  const payload = await authorizedFetch('/api/finance/costs', {
    method: 'POST',
    body: JSON.stringify({
      category: input.category,
      amount: input.amount,
      cadence: input.cadence,
      clientId: input.clientId ?? null,
    }),
  })

  if (!payload || typeof payload !== 'object' || !('cost' in payload)) {
    throw new Error('Invalid finance cost response')
  }

  return (payload as { cost: FinanceCostEntry }).cost
}

export async function deleteFinanceCost(costId: string): Promise<void> {
  if (!costId) {
    throw new Error('Cost id is required')
  }

  const search = new URLSearchParams({ id: costId })
  await authorizedFetch(`/api/finance/costs?${search.toString()}`, {
    method: 'DELETE',
  })
}

export async function createBillingPortalSession(clientId: string | null): Promise<{ url: string }> {
  const payload = await authorizedFetch('/api/billing/portal', {
    method: 'POST',
    body: JSON.stringify({ clientId }),
  })

  if (!payload || typeof payload !== 'object' || !('url' in payload) || typeof (payload as { url?: unknown }).url !== 'string') {
    throw new Error('Failed to create billing portal session')
  }

  return { url: (payload as { url: string }).url }
}

export async function sendInvoiceReminder(invoiceId: string): Promise<void> {
  if (!invoiceId) {
    throw new Error('Invoice id is required')
  }

  await authorizedFetch(`/api/finance/invoices/${encodeURIComponent(invoiceId)}/remind`, {
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

  const payload = await authorizedFetch(`/api/finance/invoices/${encodeURIComponent(invoiceId)}/refund`, {
    method: 'POST',
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  })

  if (!payload || typeof payload !== 'object' || !('refund' in payload)) {
    throw new Error('Failed to process refund')
  }

  const refund = (payload as { refund: { id: string; amount: number } }).refund
  if (!refund || typeof refund.id !== 'string') {
    throw new Error('Invalid refund response')
  }

  return { refundId: refund.id, amount: refund.amount }
}
