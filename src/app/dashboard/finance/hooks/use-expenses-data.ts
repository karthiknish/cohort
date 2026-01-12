'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useToast } from '@/components/ui/use-toast'
import { toErrorMessage } from '@/lib/error-utils'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import type { Expense, ExpenseCategory, Vendor, ExpenseAttachment } from '@/types/expenses'
import { useQuery, useMutation } from 'convex/react'
import { financeExpensesApi, financeExpenseCategoriesApi, financeVendorsApi } from '@/lib/convex-api'

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
  const { workspaceId } = useClientContext()
  const { toast } = useToast()

  const isAdmin = user?.role === 'admin'

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [employeeFilter, setEmployeeFilter] = useState<string>('')

  const convexCategories = useQuery(
    financeExpenseCategoriesApi.list,
    workspaceId
      ? {
        workspaceId,
        includeInactive: isAdmin,
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

  const convexExpenses = useQuery(
    financeExpensesApi.list,
    workspaceId
      ? {
        workspaceId,
        status: statusFilter === 'all' ? undefined : statusFilter,
        employeeId: employeeFilter.trim() ? employeeFilter.trim() : undefined,
        limit: 100,
      }
      : 'skip'
  )

  const convexUpsertExpense = useMutation(financeExpensesApi.upsert)
  const convexRemoveExpense = useMutation(financeExpensesApi.remove)

  const convexUpsertCategory = useMutation(financeExpenseCategoriesApi.upsert)
  const convexRemoveCategory = useMutation(financeExpenseCategoriesApi.remove)

  const convexUpsertVendor = useMutation(financeVendorsApi.upsert)
  const convexRemoveVendor = useMutation(financeVendorsApi.remove)

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])

  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [newExpense, setNewExpense] = useState<ExpenseFormState>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [actingExpenseId, setActingExpenseId] = useState<string | null>(null)


  const refresh = useCallback(async () => {
    // With Convex hooks, refresh is effectively a no-op.
    // Keep it for the existing UI contract.
    return
  }, [])

  useEffect(() => {
    if (!workspaceId) {
      setExpenses([])
      setCategories([])
      setVendors([])
      return
    }

    if (convexExpenses === undefined || convexCategories === undefined || convexVendors === undefined) {
      setLoading(true)
      setLoadError(null)
      return
    }

    setLoading(false)
    setLoadError(null)

    setExpenses(Array.isArray((convexExpenses as any)?.expenses) ? (convexExpenses as any).expenses : [])
    setCategories(Array.isArray(convexCategories) ? (convexCategories as any[]).map(mapConvexCategory) : [])
    setVendors(Array.isArray(convexVendors) ? (convexVendors as any[]).map(mapConvexVendor) : [])
  }, [workspaceId, convexExpenses, convexCategories, convexVendors])

  const categoryLookup = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories])
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

  function mapConvexCategory(row: any): ExpenseCategory {
    return {
      id: row.legacyId,
      name: row.name,
      code: row.code ?? null,
      description: row.description ?? null,
      isActive: typeof row.isActive === 'boolean' ? row.isActive : true,
      isSystem: typeof row.isSystem === 'boolean' ? row.isSystem : false,
      sortOrder: typeof row.sortOrder === 'number' ? row.sortOrder : 0,
      createdAt: typeof row.createdAt === 'number' ? new Date(row.createdAt).toISOString() : null,
      updatedAt: typeof row.updatedAt === 'number' ? new Date(row.updatedAt).toISOString() : null,
    }
  }

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

      if (!workspaceId) {
        throw new Error('Missing workspace')
      }

      const category = newExpense.categoryId ? categories.find((c) => c.id === newExpense.categoryId) : null
      const vendor = newExpense.vendorId ? vendors.find((v) => v.id === newExpense.vendorId) : null

      const legacyId = crypto.randomUUID()
      const timestampMs = Date.now()

      const categoryName = category?.name ?? null
      const vendorName = vendor?.name ?? null

      const expense: Expense = {
        id: legacyId,
        description: newExpense.description.trim(),
        amount,
        currency: newExpense.currency,
        costType: newExpense.costType,
        incurredAt,
        categoryId: newExpense.categoryId || null,
        categoryName,
        vendorId: newExpense.vendorId || null,
        vendorName,
        status: 'draft',
        employeeId: user.id,
        submittedAt: null,
        approvedAt: null,
        rejectedAt: null,
        decidedBy: null,
        decisionNote: null,
        attachments: (newExpense.attachments ?? []) as ExpenseAttachment[],
        createdBy: user.id,
        createdAt: new Date(timestampMs).toISOString(),
        updatedAt: new Date(timestampMs).toISOString(),
      }

      await convexUpsertExpense({
        workspaceId,
        legacyId: expense.id,
        description: expense.description,
        amount: expense.amount,
        currency: expense.currency,
        costType: expense.costType,
        incurredAt: expense.incurredAt,
        categoryId: expense.categoryId,
        categoryName: expense.categoryName,
        vendorId: expense.vendorId,
        vendorName: expense.vendorName,
        status: expense.status,
        employeeId: expense.employeeId,
        submittedAt: null,
        approvedAt: null,
        rejectedAt: null,
        decidedBy: null,
        decisionNote: null,
        attachments: expense.attachments,
        createdBy: expense.createdBy,
      })

      setExpenses((prev) => [expense, ...prev])
      setNewExpense(INITIAL_FORM)
      toast({ title: 'Expense created', description: 'Saved as draft.' })
    } catch (error) {
      toast({ title: 'Create failed', description: toErrorMessage(error), variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }, [categories, convexUpsertExpense, newExpense, toast, user?.id, vendors, workspaceId])

  const handleDeleteExpense = useCallback(
    async (expenseId: string) => {
      const confirmed = window.confirm('Delete this expense? This can only be undone by re-creating it.')
      if (!confirmed) return

      setActingExpenseId(expenseId)
      try {
        if (!workspaceId) {
          throw new Error('Missing workspace')
        }

        await convexRemoveExpense({ workspaceId, legacyId: expenseId })
        setExpenses((prev) => prev.filter((e) => e.id !== expenseId))
        toast({ title: 'Expense deleted' })
      } catch (error) {
        toast({ title: 'Delete failed', description: toErrorMessage(error), variant: 'destructive' })
      } finally {
        setActingExpenseId(null)
      }
    },
    [convexRemoveExpense, toast, workspaceId]
  )


  const handleTransition = useCallback(
    async (expenseId: string, action: 'submit' | 'approve' | 'reject' | 'mark_paid', note?: string) => {
      setActingExpenseId(expenseId)
      try {
        if (!workspaceId) {
          throw new Error('Missing workspace')
        }

        const existing = expenses.find((expense) => expense.id === expenseId)
        if (!existing) {
          throw new Error('Expense not found')
        }

        const nextStatus: Expense['status'] =
          action === 'submit'
            ? 'submitted'
            : action === 'approve'
              ? 'approved'
              : action === 'reject'
                ? 'rejected'
                : 'paid'

        const timestampMs = Date.now()

        await convexUpsertExpense({
          workspaceId,
          legacyId: existing.id,
          description: existing.description,
          amount: existing.amount,
          currency: existing.currency,
          costType: existing.costType,
          incurredAt: existing.incurredAt,
          categoryId: existing.categoryId,
          categoryName: existing.categoryName,
          vendorId: existing.vendorId,
          vendorName: existing.vendorName,
          status: nextStatus,
          employeeId: existing.employeeId,
          submittedAt: action === 'submit' ? timestampMs : existing.submittedAt ? new Date(existing.submittedAt).getTime() : null,
          approvedAt: action === 'approve' ? timestampMs : existing.approvedAt ? new Date(existing.approvedAt).getTime() : null,
          rejectedAt: action === 'reject' ? timestampMs : existing.rejectedAt ? new Date(existing.rejectedAt).getTime() : null,
          decidedBy: isAdmin ? user?.id ?? null : existing.decidedBy ?? null,
          decisionNote: action === 'reject' ? note ?? null : existing.decisionNote ?? null,
          attachments: (existing.attachments ?? []) as ExpenseAttachment[],
          createdBy: existing.createdBy,
        })
        toast({ title: 'Updated', description: 'Expense status updated.' })
      } catch (error) {
        toast({ title: 'Update failed', description: toErrorMessage(error), variant: 'destructive' })
      } finally {
        setActingExpenseId(null)
      }
    },
    [expenses, convexUpsertExpense, isAdmin, toast, user?.id, workspaceId]
  )


  const adminCategoryActions = useMemo(() => {
    return {
      async create(input: { name: string; code?: string | null; description?: string | null; sortOrder?: number }) {
        if (!workspaceId) throw new Error('Missing workspace')

        const legacyId = crypto.randomUUID()
        const sortOrder = typeof input.sortOrder === 'number' ? input.sortOrder : 0

        try {
          await convexUpsertCategory({
            workspaceId,
            legacyId,
            name: input.name,
            code: input.code ?? null,
            description: input.description ?? null,
            isActive: true,
            isSystem: false,
            sortOrder,
            createdBy: user?.id ?? undefined,
          })
          toast({ title: 'Category created', description: `"${input.name}" added successfully.` })
        } catch (error) {
          toast({
            title: 'Failed to create category',
            description: toErrorMessage(error),
            variant: 'destructive',
          })
        }
      },
      async update(id: string, input: Partial<Omit<ExpenseCategory, 'id'>>) {
        if (!workspaceId) throw new Error('Missing workspace')

        const existing = categories.find((category) => category.id === id)
        if (!existing) throw new Error('Category not found')
        if (existing.isSystem) throw new Error('System categories cannot be modified')

        try {
          await convexUpsertCategory({
            workspaceId,
            legacyId: id,
            name: input.name ?? existing.name,
            code: input.code ?? existing.code,
            description: input.description ?? existing.description,
            isActive: input.isActive ?? existing.isActive,
            isSystem: existing.isSystem,
            sortOrder: input.sortOrder ?? existing.sortOrder,
            createdBy: user?.id ?? undefined,
          })
          toast({ title: 'Category updated' })
        } catch (error) {
          toast({
            title: 'Update failed',
            description: toErrorMessage(error),
            variant: 'destructive',
          })
        }
      },
      async remove(id: string) {
        if (!workspaceId) throw new Error('Missing workspace')

        const existing = categories.find((category) => category.id === id)
        if (existing?.isSystem) throw new Error('System categories cannot be deleted')

        try {
          await convexRemoveCategory({ workspaceId, legacyId: id })
          toast({ title: 'Category removed' })
        } catch (error) {
          toast({
            title: 'Delete failed',
            description: toErrorMessage(error),
            variant: 'destructive',
          })
        }
      },
    }
  }, [categories, convexRemoveCategory, convexUpsertCategory, user?.id, workspaceId])

  const adminVendorActions = useMemo(() => {
    return {
      async create(input: { name: string; email?: string | null; phone?: string | null; website?: string | null; notes?: string | null }) {
        if (!workspaceId) throw new Error('Missing workspace')

        try {
          await convexUpsertVendor({
            workspaceId,
            name: input.name,
            email: input.email ?? null,
            phone: input.phone ?? null,
            website: input.website ?? null,
            notes: input.notes ?? null,
            isActive: true,
            createdBy: user?.id ?? null,
          })
          toast({ title: 'Vendor created', description: `"${input.name}" added successfully.` })
        } catch (error) {
          toast({
            title: 'Failed to create vendor',
            description: toErrorMessage(error),
            variant: 'destructive',
          })
        }
      },
      async update(id: string, input: Partial<Omit<Vendor, 'id'>>) {
        if (!workspaceId) throw new Error('Missing workspace')

        const existing = vendors.find((vendor) => vendor.id === id)
        if (!existing) throw new Error('Vendor not found')

        try {
          await convexUpsertVendor({
            workspaceId,
            legacyId: id,
            name: input.name ?? existing.name,
            email: input.email ?? existing.email,
            phone: input.phone ?? existing.phone,
            website: input.website ?? existing.website,
            notes: input.notes ?? existing.notes,
            isActive: input.isActive ?? existing.isActive,
            createdBy: user?.id ?? null,
          })
          toast({ title: 'Vendor updated' })
        } catch (error) {
          toast({
            title: 'Update failed',
            description: toErrorMessage(error),
            variant: 'destructive',
          })
        }
      },
      async remove(id: string) {
        if (!workspaceId) throw new Error('Missing workspace')

        try {
          await convexRemoveVendor({ workspaceId, legacyId: id })
          toast({ title: 'Vendor removed' })
        } catch (error) {
          toast({
            title: 'Delete failed',
            description: toErrorMessage(error),
            variant: 'destructive',
          })
        }
      },
    }
  }, [convexRemoveVendor, convexUpsertVendor, user?.id, vendors, workspaceId])

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
