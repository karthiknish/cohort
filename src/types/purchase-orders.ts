export type PurchaseOrderStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'ordered'
  | 'received'
  | 'closed'
  | 'cancelled'

export type PurchaseOrderLineItem = {
  description: string
  quantity: number
  unitPrice: number
}

export type PurchaseOrder = {
  id: string
  number: string | null
  status: PurchaseOrderStatus
  vendorId: string | null
  vendorName: string | null
  currency: string
  items: PurchaseOrderLineItem[]
  totalAmount: number
  notes: string | null
  requestedBy: string | null
  submittedAt?: string | null
  approvedAt?: string | null
  rejectedAt?: string | null
  decidedBy?: string | null
  decisionNote?: string | null
  orderedAt?: string | null
  receivedAt?: string | null
  createdBy: string | null
  createdAt?: string | null
  updatedAt?: string | null
}
