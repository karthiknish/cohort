'use client'

import { useCallback, useMemo } from 'react'
import { LoaderCircle, Plus, RefreshCw, Send, Trash, CheckCircle2, XCircle, PackageCheck, PackageOpen, Ban } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { CurrencySelect } from '@/components/ui/currency-select'
import type { CurrencyCode } from '@/constants/currencies'

import { usePurchaseOrdersData } from '../hooks/use-purchase-orders-data'
import type { PurchaseOrderStatus } from '@/types/purchase-orders'
import { formatCurrency } from '../utils'

function StatusBadge({ status }: { status: PurchaseOrderStatus }) {
  const variant =
    status === 'approved' || status === 'ordered' || status === 'received' || status === 'closed'
      ? 'default'
      : status === 'rejected' || status === 'cancelled'
        ? 'destructive'
        : 'secondary'
  return <Badge variant={variant as any} className="capitalize">{status}</Badge>
}

export function FinancePurchaseOrdersCard({ currency }: { currency: string }) {
  const {
    isAdmin,
    purchaseOrders,
    vendors,
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
  } = usePurchaseOrdersData()

  const resolvedCurrency = (currency ?? 'USD').toUpperCase()

  const draftTotal = useMemo(() => {
    const sum = newPO.items.reduce((acc, item) => {
      const qty = Number(item.quantity)
      const price = Number(item.unitPrice)
      if (!Number.isFinite(qty) || qty <= 0) return acc
      if (!Number.isFinite(price) || price < 0) return acc
      return acc + qty * price
    }, 0)
    return sum
  }, [newPO.items])

  const addLineItem = useCallback(() => {
    setNewPO((prev) => ({ ...prev, items: [...prev.items, { description: '', quantity: '1', unitPrice: '' }] }))
  }, [setNewPO])

  const removeLineItem = useCallback(
    (index: number) => {
      setNewPO((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
    },
    [setNewPO]
  )

  return (
    <Card className="border-muted/60 bg-background shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-col gap-4 border-b border-muted/40 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold">Purchase Orders</CardTitle>
          <CardDescription>Create draft POs, submit for approval, and track ordered/received.</CardDescription>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" onClick={() => void refresh()} disabled={loading} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {loadError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {loadError}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-[1fr,1fr,1fr]">
          <div className="space-y-1.5">
            <Label htmlFor="po-number">PO number (optional)</Label>
            <Input id="po-number" value={newPO.number} onChange={(e) => setNewPO((p) => ({ ...p, number: e.target.value }))} placeholder="e.g. PO-2026-001" />
          </div>

          <div className="space-y-1.5">
            <Label>Vendor</Label>
            <Select value={newPO.vendorId || 'none'} onValueChange={(value) => setNewPO((p) => ({ ...p, vendorId: value === 'none' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select vendor later</SelectItem>
                {vendors
                  .filter((v) => v.isActive)
                  .map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Currency</Label>
            <CurrencySelect
              value={(newPO.currency ?? resolvedCurrency) as CurrencyCode}
              onValueChange={(value) => setNewPO((p) => ({ ...p, currency: value }))}
              showPopular
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Line items</div>
            <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="gap-2">
              <Plus className="h-4 w-4" /> Add item
            </Button>
          </div>

          <div className="rounded-md border border-muted/40 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px] text-right">Qty</TableHead>
                  <TableHead className="w-[140px] text-right">Unit price</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newPO.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          setNewPO((p) => ({
                            ...p,
                            items: p.items.map((it, i) => (i === idx ? { ...it, description: e.target.value } : it)),
                          }))
                        }
                        placeholder="e.g. Figma subscription"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          setNewPO((p) => ({
                            ...p,
                            items: p.items.map((it, i) => (i === idx ? { ...it, quantity: e.target.value } : it)),
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          setNewPO((p) => ({
                            ...p,
                            items: p.items.map((it, i) => (i === idx ? { ...it, unitPrice: e.target.value } : it)),
                          }))
                        }
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLineItem(idx)}
                        disabled={newPO.items.length <= 1}
                        title="Remove line item"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Draft total</div>
            <div className="text-sm font-semibold">{formatCurrency(draftTotal, (newPO.currency || resolvedCurrency).toUpperCase())}</div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr,auto]">
          <div className="space-y-1.5">
            <Label htmlFor="po-notes">Notes</Label>
            <Textarea
              id="po-notes"
              value={newPO.notes}
              onChange={(e) => setNewPO((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Optional context for approver/vendor"
            />
          </div>

          <div className="flex items-end">
            <Button type="button" className="w-full" disabled={submitting} onClick={() => void create()}>
              {submitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Create PO
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <Label>Status filter</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border border-muted/40 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                    {loading ? 'Loading…' : 'No purchase orders yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                purchaseOrders.map((po) => {
                  const poCurrency = (po.currency ?? resolvedCurrency).toUpperCase()
                  const isActing = actingId === po.id

                  const canSubmit = po.status === 'draft'
                  const canApprove = isAdmin && po.status === 'submitted'
                  const canReject = isAdmin && po.status === 'submitted'
                  const canMarkOrdered = isAdmin && po.status === 'approved'
                  const canMarkReceived = isAdmin && po.status === 'ordered'
                  const canClose = isAdmin && po.status === 'received'
                  const canCancel = po.status === 'draft' || po.status === 'submitted'
                  const canDelete = po.status === 'draft'

                  return (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.number ?? po.id}</TableCell>
                      <TableCell>{po.vendorName ?? '—'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(po.totalAmount ?? 0, poCurrency)}</TableCell>
                      <TableCell>
                        <StatusBadge status={po.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 flex-wrap">
                          {canSubmit ? (
                            <Button variant="outline" size="sm" disabled={isActing} onClick={() => void transition(po.id, 'submit')} className="gap-2">
                              <Send className="h-4 w-4" /> Submit
                            </Button>
                          ) : null}
                          {canApprove ? (
                            <Button variant="outline" size="sm" disabled={isActing} onClick={() => void transition(po.id, 'approve')} className="gap-2">
                              <CheckCircle2 className="h-4 w-4" /> Approve
                            </Button>
                          ) : null}
                          {canReject ? (
                            <Button variant="outline" size="sm" disabled={isActing} onClick={() => void transition(po.id, 'reject')} className="gap-2">
                              <XCircle className="h-4 w-4" /> Reject
                            </Button>
                          ) : null}
                          {canMarkOrdered ? (
                            <Button variant="outline" size="sm" disabled={isActing} onClick={() => void transition(po.id, 'mark_ordered')} className="gap-2">
                              <PackageOpen className="h-4 w-4" /> Ordered
                            </Button>
                          ) : null}
                          {canMarkReceived ? (
                            <Button variant="outline" size="sm" disabled={isActing} onClick={() => void transition(po.id, 'mark_received')} className="gap-2">
                              <PackageCheck className="h-4 w-4" /> Received
                            </Button>
                          ) : null}
                          {canClose ? (
                            <Button variant="outline" size="sm" disabled={isActing} onClick={() => void transition(po.id, 'close')} className="gap-2">
                              <CheckCircle2 className="h-4 w-4" /> Close
                            </Button>
                          ) : null}
                          {canCancel ? (
                            <Button variant="outline" size="sm" disabled={isActing} onClick={() => void transition(po.id, 'cancel')} className="gap-2">
                              <Ban className="h-4 w-4" /> Cancel
                            </Button>
                          ) : null}
                          {canDelete ? (
                            <Button variant="ghost" size="icon" disabled={isActing} onClick={() => void remove(po.id)} title="Delete">
                              <Trash className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
