'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useToast } from '@/components/ui/use-toast'
import { toErrorMessage } from '@/lib/error-utils'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'

import type { PurchaseOrder, PurchaseOrderLineItem } from '@/types/purchase-orders'
import type { Vendor } from '@/types/expenses'

import { useQuery, useMutation } from 'convex/react'
import { financePurchaseOrdersApi, financeVendorsApi } from '@/lib/convex-api'

export type PurchaseOrderFormState = {
  number: string
  vendorId: string
  currency: string
  notes: string
  items: Array<{ description: string; quantity: string; unitPrice: string }>
}

const INITIAL_FORM: PurchaseOrderFormState = {
  number: '',
  vendorId: '',
  currency: 'USD',
  notes: '',
  items: [{ description: '', quantity: '1', unitPrice: '' }],
}

function coerceLineItems(items: PurchaseOrderFormState['items']): PurchaseOrderLineItem[] {
  return items
    .map((i) => {
      const description = i.description.trim()
      const quantity = Number(i.quantity)
      const unitPrice = Number(i.unitPrice)
      if (!description) return null
      if (!Number.isFinite(quantity) || quantity <= 0) return null
      if (!Number.isFinite(unitPrice) || unitPrice < 0) return null
      return { description, quantity, unitPrice }
    })
    .filter(Boolean) as PurchaseOrderLineItem[]
}

export function usePurchaseOrdersData() {
  const { user } = useAuth()
  const { workspaceId } = useClientContext()
  const { toast } = useToast()

  const isAdmin = user?.role === 'admin'

  const [statusFilter, setStatusFilter] = useState<string>('all')

  const convexPurchaseOrders = useQuery(
    financePurchaseOrdersApi.list,
    workspaceId
      ? {
          workspaceId,
          status: statusFilter === 'all' ? undefined : statusFilter,
          limit: 100,
        }
      : 'skip'
  )

  const convexVendors = useQuery(
    financeVendorsApi.list,
    workspaceId
      ? {
          workspaceId,
          includeInactive: isAdmin,
        }
      : 'skip'
  )

  const convexUpsertPurchaseOrder = useMutation(financePurchaseOrdersApi.upsert)
  const convexRemovePurchaseOrder = useMutation(financePurchaseOrdersApi.remove)

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])

  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [newPO, setNewPO] = useState<PurchaseOrderFormState>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    // With Convex queries, refresh is a no-op; keep for UI contract.
    return
  }, [])

  useEffect(() => {
    if (!workspaceId) {
      setPurchaseOrders([])
      setVendors([])
      return
    }

    if (convexPurchaseOrders === undefined || convexVendors === undefined) {
      setLoading(true)
      setLoadError(null)
      return
    }

    setLoading(false)
    setLoadError(null)

    setPurchaseOrders(
      Array.isArray((convexPurchaseOrders as any)?.purchaseOrders) ? (convexPurchaseOrders as any).purchaseOrders : []
    )

    setVendors(Array.isArray(convexVendors) ? (convexVendors as any[]).map(mapConvexVendor) : [])
  }, [convexPurchaseOrders, convexVendors, workspaceId])

  const vendorLookup = useMemo(() => new Map(vendors.map((v) => [v.id, v.name])), [vendors])

  function mapConvexVendor(row: any): Vendor {
    return {
      id: row.legacyId,
      name: row.name,
      email: row.email ?? null,
      phone: row.phone ?? null,
      website: row.website ?? null,
      notes: row.notes ?? null,
      isActive: typeof row.isActive === 'boolean' ? row.isActive : true,
      createdAt: typeof row.createdAt === 'number' ? new Date(row.createdAt).toISOString() : null,
      updatedAt: typeof row.updatedAt === 'number' ? new Date(row.updatedAt).toISOString() : null,
    }
  }

  const create = useCallback(async () => {
    if (!user?.id) {
      toast({ title: 'Not signed in', description: 'Please sign in and try again.', variant: 'destructive' })
      return
    }

    const items = coerceLineItems(newPO.items)

    setSubmitting(true)
    try {
      if (!workspaceId) {
        throw new Error('Missing workspace')
      }

      const vendor = newPO.vendorId ? vendors.find((v) => v.id === newPO.vendorId) : null

      const legacyId = crypto.randomUUID()
      const timestampMs = Date.now()

      const po: PurchaseOrder = {
        id: legacyId,
        number: newPO.number.trim() ? newPO.number.trim() : null,
        status: 'draft',
        vendorId: newPO.vendorId.trim() ? newPO.vendorId.trim() : null,
        vendorName: vendor?.name ?? null,
        currency: newPO.currency,
        items,
        totalAmount: items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
        notes: newPO.notes.trim() ? newPO.notes.trim() : null,
        requestedBy: user.id,
        createdBy: user.id,
        createdAt: new Date(timestampMs).toISOString(),
        updatedAt: new Date(timestampMs).toISOString(),
      }

      await convexUpsertPurchaseOrder({
        workspaceId,
        legacyId: po.id,
        number: po.number,
        status: po.status,
        vendorId: po.vendorId,
        vendorName: po.vendorName,
        currency: po.currency,
        items: po.items,
        totalAmount: po.totalAmount,
        notes: po.notes,
        requestedBy: po.requestedBy ?? null,
        submittedAt: null,
        approvedAt: null,
        rejectedAt: null,
        decidedBy: null,
        decisionNote: null,
        orderedAt: null,
        receivedAt: null,
        createdBy: po.createdBy,
      })

      setPurchaseOrders((prev) => [po, ...prev])
      setNewPO(INITIAL_FORM)
      toast({ title: 'Purchase order created', description: 'Saved as draft.' })
    } catch (error) {
      toast({ title: 'Create failed', description: toErrorMessage(error), variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }, [convexUpsertPurchaseOrder, newPO.currency, newPO.items, newPO.notes, newPO.number, newPO.vendorId, toast, user?.id, vendors, workspaceId])

  const updateDraft = useCallback(
    async (id: string, patch: Partial<Omit<PurchaseOrder, 'id'>>) => {
      setActingId(id)
      try {
        if (!workspaceId) {
          throw new Error('Missing workspace')
        }

        const existing = purchaseOrders.find((po) => po.id === id)
        if (!existing) {
          throw new Error('Purchase order not found')
        }

        const vendorId = patch.vendorId ?? existing.vendorId
        const vendorName = vendorId ? vendorLookup.get(vendorId) ?? patch.vendorName ?? existing.vendorName : null

        const items = patch.items ?? existing.items
        const totalAmount = typeof patch.totalAmount === 'number'
          ? patch.totalAmount
          : items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

        await convexUpsertPurchaseOrder({
          workspaceId,
          legacyId: existing.id,
          number: patch.number ?? existing.number,
          status: existing.status,
          vendorId,
          vendorName,
          currency: patch.currency ?? existing.currency,
          items,
          totalAmount,
          notes: patch.notes ?? existing.notes,
          requestedBy: existing.requestedBy ?? null,
          submittedAt: existing.submittedAt ? new Date(existing.submittedAt).getTime() : null,
          approvedAt: existing.approvedAt ? new Date(existing.approvedAt).getTime() : null,
          rejectedAt: existing.rejectedAt ? new Date(existing.rejectedAt).getTime() : null,
          decidedBy: existing.decidedBy ?? null,
          decisionNote: existing.decisionNote ?? null,
          orderedAt: existing.orderedAt ? new Date(existing.orderedAt).getTime() : null,
          receivedAt: existing.receivedAt ? new Date(existing.receivedAt).getTime() : null,
          createdBy: existing.createdBy,
        })

        setPurchaseOrders((prev) =>
          prev.map((po) =>
            po.id === id
              ? {
                  ...po,
                  ...patch,
                  vendorId,
                  vendorName,
                  items,
                  totalAmount,
                  updatedAt: new Date().toISOString(),
                }
              : po
          )
        )
      } catch (error) {
        toast({ title: 'Update failed', description: toErrorMessage(error), variant: 'destructive' })
      } finally {
        setActingId(null)
      }
    },
    [convexUpsertPurchaseOrder, purchaseOrders, toast, vendorLookup, workspaceId]
  )

  const remove = useCallback(
    async (id: string) => {
      const confirmed = window.confirm('Delete this purchase order? This can only be undone by re-creating it.')
      if (!confirmed) return

      setActingId(id)
      try {
        if (!workspaceId) {
          throw new Error('Missing workspace')
        }

        await convexRemovePurchaseOrder({ workspaceId, legacyId: id })
        setPurchaseOrders((prev) => prev.filter((po) => po.id !== id))
        toast({ title: 'Purchase order deleted' })
      } catch (error) {
        toast({ title: 'Delete failed', description: toErrorMessage(error), variant: 'destructive' })
      } finally {
        setActingId(null)
      }
    },
    [convexRemovePurchaseOrder, toast, workspaceId]
  )

  const transition = useCallback(
    async (
      id: string,
      action: 'submit' | 'approve' | 'reject' | 'mark_ordered' | 'mark_received' | 'close' | 'cancel',
      note?: string
    ) => {
      setActingId(id)
      try {
        if (!workspaceId) {
          throw new Error('Missing workspace')
        }

        const existing = purchaseOrders.find((po) => po.id === id)
        if (!existing) {
          throw new Error('Purchase order not found')
        }

        const nextStatus: PurchaseOrder['status'] =
          action === 'submit'
            ? 'submitted'
            : action === 'approve'
              ? 'approved'
              : action === 'reject'
                ? 'rejected'
                : action === 'mark_ordered'
                  ? 'ordered'
                  : action === 'mark_received'
                    ? 'received'
                    : action === 'close'
                      ? 'closed'
                      : 'cancelled'

        const timestampMs = Date.now()

        await convexUpsertPurchaseOrder({
          workspaceId,
          legacyId: existing.id,
          number: existing.number,
          status: nextStatus,
          vendorId: existing.vendorId,
          vendorName: existing.vendorName,
          currency: existing.currency,
          items: existing.items,
          totalAmount: existing.totalAmount,
          notes: existing.notes,
          requestedBy: existing.requestedBy ?? null,
          submittedAt: action === 'submit' ? timestampMs : existing.submittedAt ? new Date(existing.submittedAt).getTime() : null,
          approvedAt: action === 'approve' ? timestampMs : existing.approvedAt ? new Date(existing.approvedAt).getTime() : null,
          rejectedAt: action === 'reject' ? timestampMs : existing.rejectedAt ? new Date(existing.rejectedAt).getTime() : null,
          decidedBy: isAdmin ? user?.id ?? null : existing.decidedBy ?? null,
          decisionNote: action === 'reject' ? note ?? null : existing.decisionNote ?? null,
          orderedAt: action === 'mark_ordered' ? timestampMs : existing.orderedAt ? new Date(existing.orderedAt).getTime() : null,
          receivedAt: action === 'mark_received' ? timestampMs : existing.receivedAt ? new Date(existing.receivedAt).getTime() : null,
          createdBy: existing.createdBy,
        })
        toast({ title: 'Updated', description: 'Purchase order status updated.' })
      } catch (error) {
        toast({ title: 'Update failed', description: toErrorMessage(error), variant: 'destructive' })
      } finally {
        setActingId(null)
      }
    },
    [convexUpsertPurchaseOrder, isAdmin, purchaseOrders, toast, user?.id, workspaceId]
  )


  return {
    isAdmin,
    purchaseOrders,
    vendors,
    vendorLookup,
    loading,
    loadError,
    refresh,
    statusFilter,
    setStatusFilter,
    newPO,
    setNewPO,
    submitting,
    actingId,
    create,
    remove,
    transition,
    updateDraft,
  }
}
