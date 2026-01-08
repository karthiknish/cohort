import { apiFetch } from '@/lib/api-client'
import type { PurchaseOrder, PurchaseOrderLineItem } from '@/types/purchase-orders'

export type CreatePurchaseOrderInput = {
  number?: string | null
  vendorId?: string | null
  currency?: string
  items?: PurchaseOrderLineItem[]
  notes?: string | null
  requestedBy?: string | null
}

export type UpdatePurchaseOrderInput = Partial<CreatePurchaseOrderInput>

export async function listPurchaseOrders(options?: { status?: string; vendorId?: string; createdBy?: string; limit?: number }) {
  const search = new URLSearchParams()
  if (options?.status) search.set('status', options.status)
  if (options?.vendorId) search.set('vendorId', options.vendorId)
  if (options?.createdBy) search.set('createdBy', options.createdBy)
  if (typeof options?.limit === 'number') search.set('limit', String(options.limit))
  const url = search.size ? `/api/finance/purchase-orders?${search.toString()}` : '/api/finance/purchase-orders'
  return apiFetch<{ purchaseOrders: PurchaseOrder[] }>(url)
}

export async function createPurchaseOrder(input: CreatePurchaseOrderInput) {
  return apiFetch<{ purchaseOrder: PurchaseOrder }>('/api/finance/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updatePurchaseOrder(id: string, input: UpdatePurchaseOrderInput) {
  return apiFetch<{ ok: true }>(`/api/finance/purchase-orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deletePurchaseOrder(id: string) {
  return apiFetch<{ ok: true }>(`/api/finance/purchase-orders/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function transitionPurchaseOrder(
  id: string,
  action: 'submit' | 'approve' | 'reject' | 'mark_ordered' | 'mark_received' | 'close' | 'cancel',
  note?: string | null
) {
  return apiFetch<{ ok: true }>(`/api/finance/purchase-orders/${encodeURIComponent(id)}`, {
    method: 'POST',
    body: JSON.stringify({ action, note: note ?? null }),
  })
}
