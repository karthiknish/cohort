'use client'

import { useCallback, useMemo, useState } from 'react'
import { LoaderCircle, Plus, Trash, CheckCircle2, XCircle, Send, DollarSign, Settings, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { CurrencySelect } from '@/components/ui/currency-select'
import type { CurrencyCode } from '@/constants/currencies'

import { useExpensesData } from '../hooks/use-expenses-data'
import { useAuth } from '@/contexts/auth-context'
import { uploadExpenseReceipt } from '@/services/expense-attachments'
import { formatCurrency } from '../utils'

function StatusBadge({ status }: { status: string }) {
  const variant = status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'
  return <Badge variant={variant as any} className="capitalize">{status}</Badge>
}

export function FinanceExpensesCard({ currency, embedded = false }: { currency: string; embedded?: boolean }) {
  const { user } = useAuth()
  const {
    isAdmin,
    expenses,
    categories,
    vendors,
    loading,
    loadError,
    refresh,
    statusFilter,
    setStatusFilter,
    employeeFilter,
    setEmployeeFilter,
    newExpense,
    setNewExpense,
    submitting,
    actingExpenseId,
    handleCreateExpense,
    handleDeleteExpense,
    handleTransition,
    adminCategoryActions,
    adminVendorActions,
  } = useExpensesData()

  const [managingCategories, setManagingCategories] = useState(false)
  const [managingVendors, setManagingVendors] = useState(false)
  const [categoryForm, setCategoryForm] = useState({ name: '', code: '', isActive: true })
  const [vendorForm, setVendorForm] = useState({ name: '', email: '', isActive: true })

  const resolvedCurrency = currency ?? 'USD'

  const totalByStatus = useMemo(() => {
    const totals = new Map<string, number>()
    expenses.forEach((e) => {
      const cur = (e.currency ?? resolvedCurrency).toUpperCase()
      const key = `${e.status}:${cur}`
      totals.set(key, (totals.get(key) ?? 0) + (e.amount ?? 0))
    })
    return totals
  }, [expenses, resolvedCurrency])

  const handleAddReceipt = useCallback(
    async (file: File | null) => {
      if (!file || !user?.id) return
      const attachment = await uploadExpenseReceipt({ userId: user.id, file })
      setNewExpense((prev) => ({ ...prev, attachments: [...prev.attachments, attachment] }))
    },
    [setNewExpense, user?.id]
  )

  const canApprove = isAdmin

  const Wrapper = embedded ? 'div' : Card
  const HeaderWrapper = embedded ? 'div' : CardHeader
  const ContentWrapper = embedded ? 'div' : CardContent

  return (
    <Wrapper className={embedded ? 'space-y-6' : 'border-muted/60 bg-background shadow-sm hover:shadow-md transition-shadow'}>
      {!embedded && (
        <HeaderWrapper className="flex flex-col gap-4 border-b border-muted/40 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">Expenses</CardTitle>
            <CardDescription>
              Track variable costs, time-based costs, reimbursements, and attach receipts.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button variant="outline" onClick={() => void refresh()} disabled={loading} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            {isAdmin ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setManagingCategories(true)} className="gap-2">
                  <Settings className="h-4 w-4" /> Categories
                </Button>
                <Button variant="outline" onClick={() => setManagingVendors(true)} className="gap-2">
                  <Settings className="h-4 w-4" /> Vendors
                </Button>
              </div>
            ) : null}
          </div>
        </HeaderWrapper>
      )}

      <ContentWrapper className={embedded ? '' : 'space-y-6 pt-6'}>
        {loadError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive flex items-center justify-between">
            <span>{loadError}</span>
            <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className="h-3 w-3 mr-1" /> Retry
            </Button>
          </div>
        ) : null}

        {/* Add New Expense Form - Two Row Layout for Better Readability */}
        <div className="rounded-lg border border-muted/60 bg-muted/5 p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Plus className="h-4 w-4" />
            Add expense
          </div>
          
          {/* Primary fields */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="expense-desc">Description *</Label>
              <Input
                id="expense-desc"
                value={newExpense.description}
                onChange={(e) => setNewExpense((p) => ({ ...p, description: e.target.value }))}
                placeholder="e.g. Stripe fees for December"
                className="bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-amount">Amount *</Label>
              <Input
                id="expense-amount"
                type="number"
                min="0"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) => setNewExpense((p) => ({ ...p, amount: e.target.value }))}
                placeholder="125.50"
                className="bg-background tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-currency">Currency</Label>
              <CurrencySelect
                value={(newExpense.currency ?? resolvedCurrency) as CurrencyCode}
                onValueChange={(value) => setNewExpense((p) => ({ ...p, currency: value }))}
                showPopular
              />
            </div>
          </div>

          {/* Secondary fields */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={newExpense.costType}
                onValueChange={(value) => setNewExpense((p) => ({ ...p, costType: value as any }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Variable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="variable">Variable</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="time">Time-based</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="reimbursement">Reimbursement</SelectItem>
                  <SelectItem value="employee_reimbursement">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={newExpense.categoryId || 'none'}
                onValueChange={(value) => setNewExpense((p) => ({ ...p, categoryId: value === 'none' ? '' : value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Uncategorized</SelectItem>
                  {categories
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Vendor</Label>
              <Select
                value={newExpense.vendorId || 'none'}
                onValueChange={(value) => setNewExpense((p) => ({ ...p, vendorId: value === 'none' ? '' : value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
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
              <Label htmlFor="expense-date">Date</Label>
              <Input
                id="expense-date"
                type="date"
                value={newExpense.incurredDate}
                onChange={(e) => setNewExpense((p) => ({ ...p, incurredDate: e.target.value }))}
                className="bg-background"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                className="w-full"
                disabled={submitting || !newExpense.description.trim() || !newExpense.amount}
                onClick={() => void handleCreateExpense()}
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Add Expense
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Receipt upload */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="expense-receipt" className="text-xs text-muted-foreground">Receipt (optional)</Label>
              <Input
                id="expense-receipt"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => void handleAddReceipt(e.target.files?.[0] ?? null)}
                className="text-xs mt-1"
              />
            </div>
            {newExpense.attachments.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">{newExpense.attachments.length} file(s) attached</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr,1fr,1fr]">
          <div className="space-y-1.5">
            <Label>Vendor</Label>
            <Select
              value={newExpense.vendorId || 'none'}
              onValueChange={(value) => setNewExpense((p) => ({ ...p, vendorId: value === 'none' ? '' : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
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
            <Label htmlFor="expense-date">Incurred date</Label>
            <Input
              id="expense-date"
              type="date"
              value={newExpense.incurredDate}
              onChange={(e) => setNewExpense((p) => ({ ...p, incurredDate: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense-receipt">Receipt (optional)</Label>
            <Input
              id="expense-receipt"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => void handleAddReceipt(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        {newExpense.attachments.length ? (
          <div className="rounded-md border border-muted/40 bg-muted/10 p-3">
            <div className="text-sm font-medium mb-2">Attachments</div>
            <div className="space-y-2">
              {newExpense.attachments.map((a, idx) => (
                <div key={`${a.url}-${idx}`} className="flex items-center justify-between gap-3 text-sm">
                  <a className="truncate text-primary underline" href={a.url} target="_blank" rel="noreferrer">
                    {a.name}
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setNewExpense((p) => ({ ...p, attachments: p.attachments.filter((_, i) => i !== idx) }))
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Status filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="employee-filter">Employee ID</Label>
              <Input
                id="employee-filter"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                placeholder="(optional) uid"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Total (by status)</Label>
              <div className="flex flex-wrap gap-2">
                {['draft', 'submitted', 'approved', 'rejected', 'paid'].map((s) => {
                  const key = `${s}:${resolvedCurrency}`
                  const total = totalByStatus.get(key) ?? 0
                  return (
                    <Badge key={s} variant="secondary" className="gap-1">
                      <DollarSign className="h-3 w-3" /> {s}: {formatCurrency(Math.round(total), resolvedCurrency)}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-muted/40 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
                    No expenses yet.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div className="font-medium">{e.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {e.categoryName || (e.categoryId ? 'Category set' : 'Uncategorized')}
                        {e.vendorName ? ` · ${e.vendorName}` : ''}
                        {e.attachments?.length ? ` · ${e.attachments.length} attachment(s)` : ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={e.status} />
                    </TableCell>
                    <TableCell className="capitalize">{String(e.costType).replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      {formatCurrency(Math.round(e.amount), (e.currency ?? resolvedCurrency).toUpperCase())}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{e.employeeId ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {e.status === 'draft' ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            disabled={actingExpenseId === e.id}
                            onClick={() => void handleTransition(e.id, 'submit')}
                          >
                            {actingExpenseId === e.id ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            Submit
                          </Button>
                        ) : null}

                        {e.status === 'submitted' && canApprove ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              className="gap-2"
                              disabled={actingExpenseId === e.id}
                              onClick={() => void handleTransition(e.id, 'approve')}
                            >
                              <CheckCircle2 className="h-4 w-4" /> Approve
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="gap-2"
                              disabled={actingExpenseId === e.id}
                              onClick={() => {
                                const note = window.prompt('Rejection note (optional):') || undefined
                                void handleTransition(e.id, 'reject', note)
                              }}
                            >
                              <XCircle className="h-4 w-4" /> Reject
                            </Button>
                          </>
                        ) : null}

                        {e.status === 'approved' && canApprove ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            disabled={actingExpenseId === e.id}
                            onClick={() => void handleTransition(e.id, 'mark_paid')}
                          >
                            Mark paid
                          </Button>
                        ) : null}

                        {e.status === 'draft' ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={actingExpenseId === e.id}
                              >
                                <Trash className="h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete expense?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the expense &quot;{e.description}&quot;. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => void handleDeleteExpense(e.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Categories dialog */}
        <Dialog open={managingCategories} onOpenChange={setManagingCategories}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Manage expense categories</DialogTitle>
              <DialogDescription>Admin-only categories CRUD (Firestore-backed).</DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 md:grid-cols-[2fr,1fr,auto]">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={categoryForm.name} onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Code</Label>
                <Input value={categoryForm.code} onChange={(e) => setCategoryForm((p) => ({ ...p, code: e.target.value }))} placeholder="taxes" />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={() =>
                    void adminCategoryActions
                      .create({ name: categoryForm.name.trim(), code: categoryForm.code.trim() || null })
                      .then(() => setCategoryForm({ name: '', code: '', isActive: true }))
                  }
                  disabled={!categoryForm.name.trim()}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-muted/40 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.code ?? '—'}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={c.isActive}
                          disabled={c.isSystem}
                          onChange={() => void adminCategoryActions.update(c.id, { isActive: !c.isActive })}
                        />
                      </TableCell>
                      <TableCell className="text-xs">{c.isSystem ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          disabled={c.isSystem}
                          onClick={() => void adminCategoryActions.remove(c.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setManagingCategories(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Vendors dialog */}
        <Dialog open={managingVendors} onOpenChange={setManagingVendors}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Manage vendors</DialogTitle>
              <DialogDescription>Admin-only vendor management.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 md:grid-cols-[2fr,2fr,auto]">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={vendorForm.name} onChange={(e) => setVendorForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Email (optional)</Label>
                <Input value={vendorForm.email} onChange={(e) => setVendorForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={() =>
                    void adminVendorActions
                      .create({ name: vendorForm.name.trim(), email: vendorForm.email.trim() || null })
                      .then(() => setVendorForm({ name: '', email: '', isActive: true }))
                  }
                  disabled={!vendorForm.name.trim()}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-muted/40 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{v.email ?? '—'}</TableCell>
                      <TableCell>
                        <Checkbox checked={v.isActive} onChange={() => void adminVendorActions.update(v.id, { isActive: !v.isActive })} />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => void adminVendorActions.remove(v.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setManagingVendors(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ContentWrapper>
    </Wrapper>
  )
}
