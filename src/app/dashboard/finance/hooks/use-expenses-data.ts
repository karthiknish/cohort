'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useToast } from '@/components/ui/use-toast'
import { toErrorMessage } from '@/lib/error-utils'
import { useAuth } from '@/contexts/auth-context'
import type { Expense, ExpenseCategory, Vendor } from '@/types/expenses'
import {
  createExpense,
  deleteExpense,
  listExpenseCategories,
  listExpenses,
  listVendors,
  transitionExpense,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  createVendor,
  updateVendor,
  deleteVendor,
} from '@/services/expenses'

export type ExpenseFormState = {
  description: string
  amount: string
  currency: string
  costType: Expense['costType']
  incurredDate: string
  categoryId: string
  vendorId: string
  attachments: Expense['attachments']
}

const INITIAL_FORM: ExpenseFormState = {
  description: '',
  amount: '',
  currency: 'USD',
  costType: 'variable',
  incurredDate: '',
  categoryId: '',
  vendorId: '',
  attachments: [],
}

export function useExpensesData() {
  const { user } = useAuth()
  const { toast } = useToast()

  const isAdmin = user?.role === 'admin'

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])

  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [employeeFilter, setEmployeeFilter] = useState<string>('')

  const [newExpense, setNewExpense] = useState<ExpenseFormState>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [actingExpenseId, setActingExpenseId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setLoadError(null)

    try {
      const [expenseRes, categoryRes, vendorRes] = await Promise.all([
        listExpenses({
          status: statusFilter === 'all' ? undefined : statusFilter,
          employeeId: employeeFilter.trim() ? employeeFilter.trim() : undefined,
          limit: 100,
        }),
        listExpenseCategories({ includeInactive: isAdmin }),
        listVendors({ includeInactive: isAdmin }),
      ])

      setExpenses(Array.isArray(expenseRes.expenses) ? expenseRes.expenses : [])
      setCategories(Array.isArray(categoryRes.categories) ? categoryRes.categories : [])
      setVendors(Array.isArray(vendorRes.vendors) ? vendorRes.vendors : [])
    } catch (error) {
      const message = toErrorMessage(error, 'Failed to load expenses')
      setLoadError(message)
    } finally {
      setLoading(false)
    }
  }, [employeeFilter, isAdmin, statusFilter])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const categoryLookup = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories])
  const vendorLookup = useMemo(() => new Map(vendors.map((v) => [v.id, v.name])), [vendors])

  const handleCreateExpense = useCallback(async () => {
    if (!user?.id) {
      toast({ title: 'Not signed in', description: 'Please sign in and try again.', variant: 'destructive' })
      return
    }

    const amount = Number(newExpense.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: 'Invalid amount', description: 'Enter a positive number.', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const incurredAt = newExpense.incurredDate
        ? new Date(`${newExpense.incurredDate}T00:00:00.000Z`).toISOString()
        : null

      const payload = await createExpense({
        description: newExpense.description,
        amount,
        currency: newExpense.currency,
        costType: newExpense.costType,
        incurredAt,
        categoryId: newExpense.categoryId || null,
        vendorId: newExpense.vendorId || null,
        employeeId: user.id,
        attachments: newExpense.attachments,
      })

      setExpenses((prev) => [payload.expense, ...prev])
      setNewExpense(INITIAL_FORM)
      toast({ title: 'Expense created', description: 'Saved as draft.' })
    } catch (error) {
      toast({ title: 'Create failed', description: toErrorMessage(error), variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }, [newExpense, toast, user?.id])

  const handleDeleteExpense = useCallback(
    async (expenseId: string) => {
      const confirmed = window.confirm('Delete this expense? This can only be undone by re-creating it.')
      if (!confirmed) return

      setActingExpenseId(expenseId)
      try {
        await deleteExpense(expenseId)
        setExpenses((prev) => prev.filter((e) => e.id !== expenseId))
        toast({ title: 'Expense deleted' })
      } catch (error) {
        toast({ title: 'Delete failed', description: toErrorMessage(error), variant: 'destructive' })
      } finally {
        setActingExpenseId(null)
      }
    },
    [toast]
  )

  const handleTransition = useCallback(
    async (expenseId: string, action: 'submit' | 'approve' | 'reject' | 'mark_paid', note?: string) => {
      setActingExpenseId(expenseId)
      try {
        await transitionExpense(expenseId, action, note ?? null)
        await refresh()
        toast({ title: 'Updated', description: 'Expense status updated.' })
      } catch (error) {
        toast({ title: 'Update failed', description: toErrorMessage(error), variant: 'destructive' })
      } finally {
        setActingExpenseId(null)
      }
    },
    [refresh, toast]
  )

  const adminCategoryActions = useMemo(() => {
    return {
      async create(input: { name: string; code?: string | null; description?: string | null; sortOrder?: number }) {
        const res = await createExpenseCategory(input)
        setCategories((prev) => [...prev, res.category].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)))
      },
      async update(id: string, input: Partial<Omit<ExpenseCategory, 'id'>>) {
        await updateExpenseCategory(id, input)
        await refresh()
      },
      async remove(id: string) {
        await deleteExpenseCategory(id)
        setCategories((prev) => prev.filter((c) => c.id !== id))
      },
    }
  }, [refresh])

  const adminVendorActions = useMemo(() => {
    return {
      async create(input: { name: string; email?: string | null; phone?: string | null; website?: string | null; notes?: string | null }) {
        const res = await createVendor(input)
        setVendors((prev) => [...prev, res.vendor].sort((a, b) => a.name.localeCompare(b.name)))
      },
      async update(id: string, input: Partial<Omit<Vendor, 'id'>>) {
        await updateVendor(id, input)
        await refresh()
      },
      async remove(id: string) {
        await deleteVendor(id)
        setVendors((prev) => prev.filter((v) => v.id !== id))
      },
    }
  }, [refresh])

  return {
    isAdmin,
    expenses,
    categories,
    vendors,
    categoryLookup,
    vendorLookup,
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
  }
}
