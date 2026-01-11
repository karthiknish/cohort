'use client'

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { CreditCard, DollarSign, FileText, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useToast } from '@/components/ui/use-toast'
import { useClientContext } from '@/contexts/client-context'
import { usePreview } from '@/contexts/preview-context'
import { toErrorMessage } from '@/lib/error-utils'
import { useAction, useMutation, useQuery } from 'convex/react'

import { api } from '../../../../../convex/_generated/api'
import { financeInvoicesApi } from '@/lib/convex-api'
import type {
  FinanceCostEntry,
  FinanceBudget,
  FinanceInvoice,
  FinanceInvoiceStatus,
  FinancePaymentSummary,
  FinanceRevenueRecord,
} from '@/types/finance'

import { formatCurrency, formatCurrencyDistribution, getPrimaryCurrencyTotals, normalizeMonthly, sumByCategory, buildFinanceForecast } from '../utils'

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
}

const INITIAL_COST_FORM: CostFormState = {
  category: '',
  amount: '',
  cadence: 'monthly',
  currency: 'USD',
}

const EMPTY_PAYMENT_SUMMARY: FinancePaymentSummary = {
  totals: [],
  overdueCount: 0,
  paidCount: 0,
  openCount: 0,
  nextDueAt: null,
  lastPaymentAt: null,
}

export type CostFormState = {
  category: string
  amount: string
  cadence: FinanceCostEntry['cadence']
  currency: string
}

type StatCard = {
  name: string
  value: string
  helper: string
  icon: LucideIcon
}

type FinanceHookReturn = {
  selectedPeriod: string
  setSelectedPeriod: (value: string) => void
  invoiceStatusFilter: FinanceInvoiceStatus | 'all'
  setInvoiceStatusFilter: (value: FinanceInvoiceStatus | 'all') => void
  stats: {
    cards: StatCard[]
    totalOutstanding: number
    currencyTotals: FinancePaymentSummary['totals']
    primaryCurrency: string
  }
  paymentSummary: FinancePaymentSummary
  chartData: Array<{
    label: string
    period: string
    revenue: number
    operatingExpenses: number
    companyCosts: number
    totalExpenses: number
    profit: number
  }>
  filteredInvoices: FinanceInvoice[]
  invoices: FinanceInvoice[]
  costs: Array<FinanceCostEntry & { monthlyValue: number }>
  monthlyCostTotal: number
  revenueByClient: Array<{ name: string; revenue: number; percentage: number }>
  categorySpend: Record<string, number>
  budget: FinanceBudget
  updateBudgetTarget: (amount: number) => void
  updateCategoryBudget: (category: string, amount: number) => void
  forecast: Array<{ label: string; revenue: number; profit: number }>
  upcomingPayments: FinanceInvoice[]
  newCost: CostFormState
  setNewCost: (value: CostFormState | ((prev: CostFormState) => CostFormState)) => void
  handleAddCost: (event: FormEvent<HTMLFormElement>) => void
  handleRemoveCost: (id: string) => Promise<void>
  removingCostId: string | null
  isSubmittingCost: boolean
  isLoading: boolean
  hasAttemptedLoad: boolean
  loadError: string | null
  refresh: () => Promise<void>
  hasMoreInvoices: boolean
  hasMoreCosts: boolean
  loadMoreInvoices: () => Promise<void>
  loadMoreCosts: () => Promise<void>
  loadingMoreInvoices: boolean
  loadingMoreCosts: boolean
  sendingInvoiceId: string | null
  refundingInvoiceId: string | null
  sendInvoiceReminder: (invoiceId: string) => Promise<void>
  issueInvoiceRefund: (invoiceId: string) => Promise<void>
}

export function useFinanceData(): FinanceHookReturn {
  const { clients, selectedClientId, workspaceId } = useClientContext()
  const { toast } = useToast()

  const [selectedPeriod, setSelectedPeriod] = useState('6m')
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<FinanceInvoiceStatus | 'all'>('all')
  const [newCost, setNewCost] = useState<CostFormState>(INITIAL_COST_FORM)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmittingCost, setIsSubmittingCost] = useState(false)
  const [removingCostId, setRemovingCostId] = useState<string | null>(null)
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null)
  const [refundingInvoiceId, setRefundingInvoiceId] = useState<string | null>(null)
  const [budget, setBudget] = useState<FinanceBudget>({ totalMonthlyBudget: 0, categoryBudgets: {} })

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)

  const resolvedWorkspaceId = workspaceId ? String(workspaceId) : null

  const revenue = useQuery(
    api.financeRevenue.list,
    resolvedWorkspaceId
      ? {
          workspaceId: resolvedWorkspaceId,
          clientId: selectedClientId ?? null,
          limit: 36,
        }
      : 'skip'
  )

  const invoicePage = useQuery(
    api.financeInvoices.list,
    resolvedWorkspaceId
      ? {
          workspaceId: resolvedWorkspaceId,
          clientId: selectedClientId ?? null,
          limit: 200,
        }
      : 'skip'
  )

  const costPage = useQuery(
    api.financeCosts.list,
    resolvedWorkspaceId
      ? {
          workspaceId: resolvedWorkspaceId,
          clientId: selectedClientId ?? null,
          limit: 200,
        }
      : 'skip'
  )

  const createCostMutation = useMutation(api.financeCosts.create)
  const deleteCostMutation = useMutation(api.financeCosts.remove)

  const remindInvoiceAction = useAction(financeInvoicesApi.remind)
  const refundInvoiceAction = useAction(financeInvoicesApi.refund)

  const clientNameLookup = useMemo(() => new Map(clients.map((client) => [client.id, client.name])), [clients])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  // With Convex, data loads reactively via `useQuery`, so we no longer
  // need imperative loaders. We preserve the old retry/toast scaffolding
  // by surfacing a simple `loadError` based on query results.
  useEffect(() => {
    if (revenue === undefined || invoicePage === undefined || costPage === undefined) {
      return
    }

    setHasAttemptedLoad(true)
    setLoadError(null)
    retryCountRef.current = 0
  }, [costPage, invoicePage, revenue])

  // TODO(convex): implement cursor-based pagination in the UI.
  const loadMoreInvoices = useCallback(async () => {}, [])
  const loadMoreCosts = useCallback(async () => {}, [])

  const invoices: FinanceInvoice[] = useMemo(() => {
    if (!invoicePage) return []
    return invoicePage.invoices.map((row) => ({
      id: row.legacyId,
      clientId: row.clientId,
      clientName: row.clientName,
      amount: row.amount,
      status: row.status as FinanceInvoice['status'],
      stripeStatus: row.stripeStatus,
      issuedDate: row.issuedDate,
      dueDate: row.dueDate,
      paidDate: row.paidDate,
      amountPaid: row.amountPaid,
      amountRemaining: row.amountRemaining,
      amountRefunded: row.amountRefunded,
      currency: row.currency,
      description: row.description,
      hostedInvoiceUrl: row.hostedInvoiceUrl,
      number: row.number,
      paymentIntentId: row.paymentIntentId,
      collectionMethod: row.collectionMethod,
      createdAt: new Date(row.createdAt).toISOString(),
      updatedAt: new Date(row.updatedAt).toISOString(),
    }))
  }, [invoicePage])

  const filteredInvoices = useMemo(() => {
    if (invoiceStatusFilter === 'all') {
      return invoices
    }
    return invoices.filter((invoice) => invoice.status === invoiceStatusFilter)
  }, [invoices, invoiceStatusFilter])

  const companyCosts: FinanceCostEntry[] = useMemo(() => {
    if (!costPage) return []
    return costPage.costs.map((row) => ({
      id: row.legacyId,
      clientId: row.clientId,
      category: row.category,
      amount: row.amount,
      cadence: row.cadence as FinanceCostEntry['cadence'],
      currency: row.currency,
      createdAt: new Date(row.createdAt).toISOString(),
      updatedAt: new Date(row.updatedAt).toISOString(),
    }))
  }, [costPage])

  const revenueRecords: FinanceRevenueRecord[] = useMemo(() => {
    if (!revenue) return []
    return revenue.revenue.map((row) => ({
      id: row.legacyId,
      clientId: row.clientId,
      period: row.period,
      label: row.label,
      revenue: row.revenue,
      operatingExpenses: row.operatingExpenses,
      currency: row.currency,
      createdAt: new Date(row.createdAt).toISOString(),
      updatedAt: new Date(row.updatedAt).toISOString(),
    }))
  }, [revenue])

  const monthlyCostTotal = useMemo(
    () => companyCosts.reduce((sum, cost) => sum + normalizeMonthly(cost.amount, cost.cadence), 0),
    [companyCosts]
  )

  const chartData = useMemo(() => {
    if (!revenueRecords.length) {
      return []
    }

    return revenueRecords.map((record) => {
      const companyCostsValue = monthlyCostTotal
      const totalExpenses = record.operatingExpenses + companyCostsValue
      return {
        label: record.label ?? record.period,
        period: record.period,
        revenue: record.revenue,
        operatingExpenses: record.operatingExpenses,
        companyCosts: companyCostsValue,
        totalExpenses,
        profit: record.revenue - totalExpenses,
      }
    })
  }, [monthlyCostTotal, revenueRecords])

  const totalRevenue = useMemo(
    () => revenueRecords.reduce((sum, entry) => sum + entry.revenue, 0),
    [revenueRecords]
  )
  const totalExpenses = useMemo(
    () => chartData.reduce((sum, entry) => sum + entry.totalExpenses, 0),
    [chartData]
  )
  const totalCompanyCosts = useMemo(
    () => monthlyCostTotal * (revenueRecords.length || 1),
    [monthlyCostTotal, revenueRecords.length]
  )
  const categorySpend = useMemo(() => sumByCategory(companyCosts), [companyCosts])
  const paymentSummary = useMemo(() => calculatePaymentSummary(invoices), [invoices])

  const primaryCurrencyTotals = useMemo(
    () =>
      getPrimaryCurrencyTotals(paymentSummary.totals) ?? {
        currency: 'USD',
        totalInvoiced: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        refundTotal: 0,
      },
    [paymentSummary.totals]
  )

  const hasMultipleCurrencies = paymentSummary.totals.length > 1
  const hasRefunds = paymentSummary.totals.some((entry) => entry.refundTotal > 0)
  const collectedTotal = primaryCurrencyTotals.totalPaid
  const totalOutstanding = primaryCurrencyTotals.totalOutstanding
  const refundTotal = primaryCurrencyTotals.refundTotal
  const netProfit = collectedTotal - totalExpenses // For display (actual cash received)
  const netProfitForMargin = totalRevenue - totalExpenses // For margin calculation (based on revenue)
  const collectedDisplay = formatCurrencyDistribution(paymentSummary.totals, 'totalPaid', primaryCurrencyTotals.currency)
  const outstandingDisplay = formatCurrencyDistribution(
    paymentSummary.totals,
    'totalOutstanding',
    primaryCurrencyTotals.currency,
  )
  const refundDisplay = formatCurrencyDistribution(paymentSummary.totals, 'refundTotal', primaryCurrencyTotals.currency)

  // Calculate profit margin percentage
  const profitMarginPercentage = totalRevenue > 0 ? Math.round((netProfitForMargin / totalRevenue) * 100) : 0

  // Calculate period-over-period growth (would need historical data for real implementation)
  // For now, we'll remove the growth indicator to avoid showing misleading data

  const statCards: StatCard[] = useMemo(
    () => [
      {
        name: 'Total Collected',
        value: collectedDisplay,
        helper: hasMultipleCurrencies
          ? hasRefunds
            ? `Refunds ${refundDisplay}`
            : 'Multi-currency totals'
          : refundTotal > 0
            ? `Net of ${formatCurrency(refundTotal, primaryCurrencyTotals.currency)} refunds`
            : `${selectedPeriod.toUpperCase()} lookback`,
        icon: DollarSign,
      },
      {
        name: 'Outstanding',
        value: outstandingDisplay,
        helper: `${paymentSummary.openCount} open · ${paymentSummary.overdueCount} overdue`,
        icon: CreditCard,
      },
      {
        name: 'Company Costs',
        value: formatCurrency(totalCompanyCosts, primaryCurrencyTotals.currency),
        helper: `${formatCurrency(Math.round(monthlyCostTotal), primaryCurrencyTotals.currency)} average per month`,
        icon: FileText,
      },
      {
        name: 'Net Profit',
        value: formatCurrency(netProfit, primaryCurrencyTotals.currency),
        helper: hasMultipleCurrencies
          ? `Primary currency (${primaryCurrencyTotals.currency}) · ${profitMarginPercentage}% margin`
          : netProfit >= 0
            ? `Positive margin · ${profitMarginPercentage}% profit`
            : `Review costs · ${profitMarginPercentage}% margin`,
        icon: TrendingUp,
      },
    ],
    [
      netProfit,
      refundDisplay,
      paymentSummary.openCount,
      paymentSummary.overdueCount,
      hasMultipleCurrencies,
      hasRefunds,
      selectedPeriod,
      totalCompanyCosts,
      monthlyCostTotal,
      primaryCurrencyTotals.currency,
      outstandingDisplay,
      collectedDisplay,
      profitMarginPercentage,
      refundTotal,
      paymentSummary.totals.length,
    ]
  )

  const revenueByClient = useMemo(() => {
    const totals = new Map<string, { name: string; revenue: number }>()

    revenueRecords.forEach((record) => {
      const key = record.clientId ?? 'unassigned'
      const clientName = record.clientId
        ? clientNameLookup.get(record.clientId) ?? 'Unassigned client'
        : 'Unassigned revenue'
      const aggregate = totals.get(key)
      if (aggregate) {
        aggregate.revenue += record.revenue
      } else {
        totals.set(key, { name: clientName, revenue: record.revenue })
      }
    })

    if (totals.size === 0 && invoices.length) {
      invoices.forEach((invoice) => {
        const key = invoice.clientId ?? invoice.clientName
        const aggregate = totals.get(key)
        const displayName =
          invoice.clientName || clientNameLookup.get(invoice.clientId ?? '') || 'Unassigned client'
        if (aggregate) {
          aggregate.revenue += invoice.amount
        } else {
          totals.set(key, { name: displayName, revenue: invoice.amount })
        }
      })
    }

    const sorted = Array.from(totals.values()).sort((a, b) => b.revenue - a.revenue)
    const total = sorted.reduce((sum, entry) => sum + entry.revenue, 0) || 1

    return sorted.slice(0, 6).map((entry) => ({
      name: entry.name,
      revenue: entry.revenue,
      percentage: Math.round((entry.revenue / total) * 100),
    }))
  }, [clientNameLookup, invoices, revenueRecords])

  const upcomingPayments = useMemo(
    () =>
      invoices
        .filter((inv) => {
          const outstanding =
            typeof inv.amountRemaining === 'number'
              ? inv.amountRemaining
              : typeof inv.amountPaid === 'number'
                ? Math.max(inv.amount - inv.amountPaid, 0)
                : inv.amount

          return (inv.status === 'sent' || inv.status === 'overdue') && outstanding > 0.01
        })
        .sort((a, b) => {
          const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY
          const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY
          return aDue - bDue
        })
        .slice(0, 3),
    [invoices]
  )

  const handleAddCost = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const amountValue = Number(newCost.amount)
      if (!newCost.category.trim() || !Number.isFinite(amountValue) || amountValue <= 0) {
        toast({
          title: 'Missing information',
          description: 'Please enter a category name and a positive amount.',
          variant: 'destructive',
        })
        return
      }

      try {
        setIsSubmittingCost(true)
        if (!resolvedWorkspaceId) {
          throw new Error('Missing workspace')
        }

        const result = await createCostMutation({
          workspaceId: resolvedWorkspaceId,
          clientId: selectedClientId ?? null,
          category: newCost.category.trim(),
          amount: amountValue,
          cadence: newCost.cadence,
          currency: newCost.currency || 'USD',
        })

        setNewCost(INITIAL_COST_FORM)
        toast({ title: 'Cost added', description: `"${result.legacyId}" has been recorded.` })
      } catch (error: unknown) {
        toast({
          title: 'Failed to add cost',
          description: toErrorMessage(error, 'Unable to add cost entry'),
          variant: 'destructive',
        })
      } finally {
        setIsSubmittingCost(false)
      }
    },
    [newCost, selectedClientId, toast]
  )

  const handleRemoveCost = useCallback(
    async (id: string) => {
      try {
        setRemovingCostId(id)
        if (!resolvedWorkspaceId) {
          throw new Error('Missing workspace')
        }

        await deleteCostMutation({ workspaceId: resolvedWorkspaceId, legacyId: id })

        toast({ title: 'Cost removed', description: 'The cost entry has been deleted.' })
      } catch (error: unknown) {
        toast({
          title: 'Failed to delete cost',
          description: toErrorMessage(error, 'Unable to delete cost entry'),
          variant: 'destructive',
        })
      } finally {
        setRemovingCostId(null)
      }
    },
    [toast]
  )

  const handleSendInvoiceReminder = useCallback(async (invoiceId: string) => {
    if (!invoiceId) {
      return
    }

    try {
      setSendingInvoiceId(invoiceId)
      if (!resolvedWorkspaceId) {
        throw new Error('Missing workspace')
      }

      await remindInvoiceAction({ workspaceId: resolvedWorkspaceId, invoiceId })
      toast({
        title: 'Reminder sent!',
        description: 'Payment reminder email will be sent to the client shortly.',
      })
    } catch (error: unknown) {
      toast({
        title: 'Reminder failed',
        description: toErrorMessage(error, 'Unable to send invoice reminder'),
        variant: 'destructive',
      })
    } finally {
      setSendingInvoiceId(null)
    }
  }, [remindInvoiceAction, toast])

  const handleIssueInvoiceRefund = useCallback(async (invoiceId: string) => {
    if (!invoiceId) {
      return
    }

    try {
      setRefundingInvoiceId(invoiceId)
      if (!resolvedWorkspaceId) {
        throw new Error('Missing workspace')
      }

      const result = await refundInvoiceAction({ workspaceId: resolvedWorkspaceId, invoiceId })
      toast({
        title: 'Refund initiated',
        description: `${formatCurrency(result.refund.amount, primaryCurrencyTotals.currency)} refund is being processed.`,
      })
    } catch (error: unknown) {
      toast({
        title: 'Refund failed',
        description: toErrorMessage(error, 'Unable to issue refund'),
        variant: 'destructive',
      })
    } finally {
      setRefundingInvoiceId(null)
    }
  }, [refundInvoiceAction, toast, primaryCurrencyTotals.currency])

  const costsWithMonthly = useMemo(
    () =>
      companyCosts.map((cost) => ({
        ...cost,
        monthlyValue: normalizeMonthly(cost.amount, cost.cadence),
      })),
    [companyCosts]
  )

  const forecast = useMemo(
    () =>
      buildFinanceForecast(
        chartData.map((entry) => ({
          revenue: entry.revenue,
          totalExpenses: entry.totalExpenses,
          period: entry.period,
        }))
      ),
    [chartData]
  )

  const updateBudgetTarget = useCallback((amount: number) => {
    setBudget((prev) => ({
      ...prev,
      totalMonthlyBudget: Number.isFinite(amount) && amount > 0 ? amount : 0,
    }))
  }, [])

  const updateCategoryBudget = useCallback((category: string, amount: number) => {
    const key = category?.trim().toLowerCase() || 'other'
    setBudget((prev) => ({
      ...prev,
      categoryBudgets: {
        ...prev.categoryBudgets,
        [key]: Number.isFinite(amount) && amount > 0 ? amount : 0,
      },
    }))
  }, [])

  return {
    selectedPeriod,
    setSelectedPeriod,
    invoiceStatusFilter,
    setInvoiceStatusFilter,
    stats: {
      cards: statCards,
      totalOutstanding,
      currencyTotals: paymentSummary.totals,
      primaryCurrency: primaryCurrencyTotals.currency,
    },
    paymentSummary,
    chartData,
    filteredInvoices,
    invoices,
    costs: costsWithMonthly,
    monthlyCostTotal,
    revenueByClient,
    categorySpend,
    budget,
    updateBudgetTarget,
    updateCategoryBudget,
    forecast,
    upcomingPayments,
    newCost,
    setNewCost,
    handleAddCost,
    handleRemoveCost,
    removingCostId,
    isSubmittingCost,
    isLoading: revenue === undefined || invoicePage === undefined || costPage === undefined,
    hasAttemptedLoad,
    loadError,
    refresh: async () => {},
    hasMoreInvoices: false,
    hasMoreCosts: false,
    loadMoreInvoices,
    loadMoreCosts,
    loadingMoreInvoices: false,
    loadingMoreCosts: false,
    sendingInvoiceId,
    refundingInvoiceId,
    sendInvoiceReminder: handleSendInvoiceReminder,
    issueInvoiceRefund: handleIssueInvoiceRefund,
  }
}

export function calculatePaymentSummary(invoices: FinanceInvoice[]): FinancePaymentSummary {
  type CurrencyAccumulator = {
    currency: string
    totalInvoiced: number
    paidGross: number
    refundTotal: number
    totalOutstanding: number
  }

  const currencyMap = new Map<string, CurrencyAccumulator>()
  let overdueCount = 0
  let paidCount = 0
  let openCount = 0
  let nextDueAt: string | null = null
  let lastPaymentAt: string | null = null

  invoices.forEach((invoice) => {
    const normalizedCurrency = (invoice.currency ?? 'USD').toUpperCase()
    let accumulator = currencyMap.get(normalizedCurrency)
    if (!accumulator) {
      accumulator = {
        currency: normalizedCurrency,
        totalInvoiced: 0,
        paidGross: 0,
        refundTotal: 0,
        totalOutstanding: 0,
      }
      currencyMap.set(normalizedCurrency, accumulator)
    }

    accumulator.totalInvoiced += invoice.amount

    if (invoice.status === 'paid') {
      paidCount += 1
    } else if (invoice.status === 'overdue') {
      overdueCount += 1
      openCount += 1
    } else if (invoice.status === 'sent') {
      openCount += 1
    }

    if (typeof invoice.amountPaid === 'number') {
      accumulator.paidGross += invoice.amountPaid
    }

    if (typeof invoice.amountRefunded === 'number') {
      accumulator.refundTotal += invoice.amountRefunded
    }

    const outstanding =
      typeof invoice.amountRemaining === 'number'
        ? invoice.amountRemaining
        : typeof invoice.amountPaid === 'number'
          ? Math.max(invoice.amount - invoice.amountPaid, 0)
          : invoice.status === 'paid'
            ? 0
            : invoice.amount

    if (outstanding > 0) {
      accumulator.totalOutstanding += outstanding
      if (invoice.dueDate) {
        const dueMillis = new Date(invoice.dueDate).getTime()
        if (!Number.isNaN(dueMillis)) {
          if (nextDueAt === null || dueMillis < new Date(nextDueAt).getTime()) {
            nextDueAt = new Date(dueMillis).toISOString()
          }
        }
      }
    }

    if (invoice.paidDate) {
      if (!lastPaymentAt || new Date(invoice.paidDate).getTime() > new Date(lastPaymentAt).getTime()) {
        lastPaymentAt = new Date(invoice.paidDate).toISOString()
      }
    }
  })

  return {
    totals: Array.from(currencyMap.values()).map((entry) => ({
      currency: entry.currency,
      totalInvoiced: entry.totalInvoiced,
      totalOutstanding: entry.totalOutstanding,
      refundTotal: entry.refundTotal,
      totalPaid: Math.max(entry.paidGross - entry.refundTotal, 0),
    })),
    overdueCount,
    paidCount,
    openCount,
    nextDueAt,
    lastPaymentAt,
  }
}
