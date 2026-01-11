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

export type PurchaseOrderServices = {
  listPurchaseOrders: (options?: { status?: string; vendorId?: string; createdBy?: string; limit?: number }) => Promise<{ purchaseOrders: PurchaseOrder[] }>
  createPurchaseOrder: (input: CreatePurchaseOrderInput) => Promise<{ purchaseOrder: PurchaseOrder }>
  updatePurchaseOrder: (id: string, input: UpdatePurchaseOrderInput) => Promise<{ ok: true }>
  deletePurchaseOrder: (id: string) => Promise<{ ok: true }>
  transitionPurchaseOrder: (
    id: string,
    action: 'submit' | 'approve' | 'reject' | 'mark_ordered' | 'mark_received' | 'close' | 'cancel',
    note?: string | null
  ) => Promise<{ ok: true }>
}

let provider: PurchaseOrderServices | null = null

export function setPurchaseOrderServices(next: PurchaseOrderServices) {
  provider = next
}

function requireProvider(): PurchaseOrderServices {
  if (!provider) {
    throw new Error('Purchase order services not initialised (missing Convex provider)')
  }
  return provider
}

export async function listPurchaseOrders(options?: { status?: string; vendorId?: string; createdBy?: string; limit?: number }) {
  return requireProvider().listPurchaseOrders(options)
}

export async function createPurchaseOrder(input: CreatePurchaseOrderInput) {
  return requireProvider().createPurchaseOrder(input)
}

export async function updatePurchaseOrder(id: string, input: UpdatePurchaseOrderInput) {
  return requireProvider().updatePurchaseOrder(id, input)
}

export async function deletePurchaseOrder(id: string) {
  return requireProvider().deletePurchaseOrder(id)
}

export async function transitionPurchaseOrder(
  id: string,
  action: 'submit' | 'approve' | 'reject' | 'mark_ordered' | 'mark_received' | 'close' | 'cancel',
  note?: string | null
) {
  return requireProvider().transitionPurchaseOrder(id, action, note)
}
