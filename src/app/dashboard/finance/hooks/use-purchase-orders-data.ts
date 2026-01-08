'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useToast } from '@/components/ui/use-toast'
import { toErrorMessage } from '@/lib/error-utils'
import { useAuth } from '@/contexts/auth-context'

import type { PurchaseOrder, PurchaseOrderLineItem } from '@/types/purchase-orders'
import type { Vendor } from '@/types/expenses'

import { listVendors } from '@/services/expenses'
import {
  createPurchaseOrder,
  deletePurchaseOrder,
  listPurchaseOrders,
  transitionPurchaseOrder,
  updatePurchaseOrder,
} from '@/services/purchase-orders'

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
  const { toast } = useToast()

  const isAdmin = user?.role === 'admin'

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])

  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [newPO, setNewPO] = useState<PurchaseOrderFormState>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)

  // Use ref for status filter to avoid infinite loop in useEffect
  const statusFilterRef = useRef(statusFilter)
  statusFilterRef.current = statusFilter

  const refresh = useCallback(async () => {
    setLoading(true)
    setLoadError(null)

    try {
      const [posRes, vendorsRes] = await Promise.all([
        listPurchaseOrders({ status: statusFilterRef.current === 'all' ? undefined : statusFilterRef.current, limit: 100 }),
        listVendors({ includeInactive: isAdmin }),
      ])

      setPurchaseOrders(Array.isArray(posRes.purchaseOrders) ? posRes.purchaseOrders : [])
      setVendors(Array.isArray(vendorsRes.vendors) ? vendorsRes.vendors : [])
    } catch (error) {
      setLoadError(toErrorMessage(error, 'Failed to load purchase orders'))
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  // Separate effect for initial load
  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Separate effect for filter changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void refresh()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [statusFilter, refresh])

  const vendorLookup = useMemo(() => new Map(vendors.map((v) => [v.id, v.name])), [vendors])

  const create = useCallback(async () => {
    if (!user?.id) {
      toast({ title: 'Not signed in', description: 'Please sign in and try again.', variant: 'destructive' })
      return
    }

    const items = coerceLineItems(newPO.items)

    setSubmitting(true)
    try {
      const res = await createPurchaseOrder({
        number: newPO.number.trim() ? newPO.number.trim() : null,
        vendorId: newPO.vendorId.trim() ? newPO.vendorId.trim() : null,
        currency: newPO.currency,
        notes: newPO.notes.trim() ? newPO.notes.trim() : null,
        items,
        requestedBy: user.id,
      })

      setPurchaseOrders((prev) => [res.purchaseOrder, ...prev])
      setNewPO(INITIAL_FORM)
      toast({ title: 'Purchase order created', description: 'Saved as draft.' })
    } catch (error) {
      toast({ title: 'Create failed', description: toErrorMessage(error), variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }, [newPO.currency, newPO.items, newPO.notes, newPO.number, newPO.vendorId, toast, user?.id])

  const remove = useCallback(
    async (id: string) => {
      const confirmed = window.confirm('Delete this purchase order? This can only be undone by re-creating it.')
      if (!confirmed) return

      setActingId(id)
      try {
        await deletePurchaseOrder(id)
        setPurchaseOrders((prev) => prev.filter((po) => po.id !== id))
        toast({ title: 'Purchase order deleted' })
      } catch (error) {
        toast({ title: 'Delete failed', description: toErrorMessage(error), variant: 'destructive' })
      } finally {
        setActingId(null)
      }
    },
    [toast]
  )

  const transition = useCallback(
    async (
      id: string,
      action: 'submit' | 'approve' | 'reject' | 'mark_ordered' | 'mark_received' | 'close' | 'cancel',
      note?: string
    ) => {
      setActingId(id)
      try {
        await transitionPurchaseOrder(id, action, note ?? null)
        await refresh()
        toast({ title: 'Updated', description: 'Purchase order status updated.' })
      } catch (error) {
        toast({ title: 'Update failed', description: toErrorMessage(error), variant: 'destructive' })
      } finally {
        setActingId(null)
      }
    },
    [refresh, toast]
  )

  const updateDraft = useCallback(
    async (id: string, patch: { vendorId?: string | null; currency?: string; notes?: string | null; number?: string | null; items?: PurchaseOrderLineItem[] }) => {
      setActingId(id)
      try {
        await updatePurchaseOrder(id, patch)
        await refresh()
        toast({ title: 'Updated', description: 'Draft updated.' })
      } catch (error) {
        toast({ title: 'Update failed', description: toErrorMessage(error), variant: 'destructive' })
      } finally {
        setActingId(null)
      }
    },
    [refresh, toast]
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
