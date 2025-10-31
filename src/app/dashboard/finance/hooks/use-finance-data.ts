'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

import { CreditCard, DollarSign, FileText, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useToast } from '@/components/ui/use-toast'
import { useClientContext } from '@/contexts/client-context'
import {
  createFinanceCost,
  deleteFinanceCost,
  fetchFinanceSummary,
  issueInvoiceRefund,
  sendInvoiceReminder,
} from '@/services/finance'
import type {
  FinanceCostEntry,
  FinanceInvoice,
  FinanceInvoiceStatus,
  FinancePaymentSummary,
  FinanceRevenueRecord,
} from '@/types/finance'

import { formatCurrency, normalizeMonthly } from '../utils'

const INITIAL_COST_FORM: CostFormState = {
  category: '',
  amount: '',
  cadence: 'monthly',
}

const EMPTY_PAYMENT_SUMMARY: FinancePaymentSummary = {
  totalInvoiced: 0,
  totalPaid: 0,
  totalOutstanding: 0,
  overdueCount: 0,
  paidCount: 0,
  openCount: 0,
  refundTotal: 0,
  nextDueAt: null,
  lastPaymentAt: null,
  currency: 'usd',
}

export type CostFormState = {
  category: string
  amount: string
  cadence: FinanceCostEntry['cadence']
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
  sendingInvoiceId: string | null
  refundingInvoiceId: string | null
  sendInvoiceReminder: (invoiceId: string) => Promise<void>
  issueInvoiceRefund: (invoiceId: string) => Promise<void>
}

export function useFinanceData(): FinanceHookReturn {
  const { clients, selectedClientId } = useClientContext()
  const { toast } = useToast()

  const [selectedPeriod, setSelectedPeriod] = useState('6m')
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<FinanceInvoiceStatus | 'all'>('all')
  const [revenueRecords, setRevenueRecords] = useState<FinanceRevenueRecord[]>([])
  const [invoices, setInvoices] = useState<FinanceInvoice[]>([])
  const [companyCosts, setCompanyCosts] = useState<FinanceCostEntry[]>([])
  const [paymentSummary, setPaymentSummary] = useState<FinancePaymentSummary>(EMPTY_PAYMENT_SUMMARY)
  const [newCost, setNewCost] = useState<CostFormState>(INITIAL_COST_FORM)
  const [isLoading, setIsLoading] = useState(false)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmittingCost, setIsSubmittingCost] = useState(false)
  const [removingCostId, setRemovingCostId] = useState<string | null>(null)
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null)
  const [refundingInvoiceId, setRefundingInvoiceId] = useState<string | null>(null)

  const clientNameLookup = useMemo(() => new Map(clients.map((client) => [client.id, client.name])), [clients])

  const loadFinanceSummary = useCallback(async (options?: { quiet?: boolean }) => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const summary = await fetchFinanceSummary({ clientId: selectedClientId ?? null })
      setRevenueRecords(summary.revenue)
      setInvoices(summary.invoices)
      setCompanyCosts(summary.costs)
      setPaymentSummary(summary.payments ?? EMPTY_PAYMENT_SUMMARY)
    } catch (error: unknown) {
      const message = extractErrorMessage(error, 'Failed to load finance data')
      setLoadError(message)
      setRevenueRecords([])
      setInvoices([])
      setCompanyCosts([])
      setPaymentSummary(EMPTY_PAYMENT_SUMMARY)
      if (!options?.quiet) {
        toast({ title: 'Unable to load finance data', description: message, variant: 'destructive' })
      }
    } finally {
      setIsLoading(false)
      setHasAttemptedLoad(true)
    }
  }, [selectedClientId, toast])

  useEffect(() => {
    void loadFinanceSummary({ quiet: true })
  }, [loadFinanceSummary])

  const filteredInvoices = useMemo(() => {
    if (invoiceStatusFilter === 'all') {
      return invoices
    }
    return invoices.filter((invoice) => invoice.status === invoiceStatusFilter)
  }, [invoices, invoiceStatusFilter])

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
  const collectedTotal = paymentSummary.totalPaid
  const totalOutstanding = paymentSummary.totalOutstanding
  const netProfit = collectedTotal - totalExpenses

  const statCards: StatCard[] = useMemo(
    () => [
      {
        name: 'Total Collected',
        value: formatCurrency(collectedTotal),
        helper:
          paymentSummary.refundTotal > 0
            ? `Net of ${formatCurrency(paymentSummary.refundTotal)} refunds`
            : `${selectedPeriod.toUpperCase()} lookback`,
        icon: DollarSign,
      },
      {
        name: 'Outstanding',
        value: formatCurrency(totalOutstanding),
        helper: `${paymentSummary.openCount} open · ${paymentSummary.overdueCount} overdue`,
        icon: CreditCard,
      },
      {
        name: 'Company Costs',
        value: formatCurrency(totalCompanyCosts),
        helper: `${formatCurrency(Math.round(monthlyCostTotal))} average per month`,
        icon: FileText,
      },
      {
        name: 'Net Profit',
        value: formatCurrency(netProfit),
        helper: netProfit >= 0 ? 'Positive margin' : 'Review costs',
        icon: TrendingUp,
      },
    ],
    [
      collectedTotal,
      netProfit,
      paymentSummary.openCount,
      paymentSummary.overdueCount,
      paymentSummary.refundTotal,
      selectedPeriod,
      totalCompanyCosts,
      monthlyCostTotal,
      totalOutstanding,
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
          title: 'Invalid cost',
          description: 'Please provide a valid category and positive amount.',
          variant: 'destructive',
        })
        return
      }

      try {
        setIsSubmittingCost(true)
        const created = await createFinanceCost({
          category: newCost.category.trim(),
          amount: amountValue,
          cadence: newCost.cadence,
          clientId: selectedClientId ?? null,
        })

        setCompanyCosts((prev) => {
          const next = [...prev, created]
          return next.sort((a, b) => {
            const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return bCreated - aCreated
          })
        })
        setNewCost(INITIAL_COST_FORM)
        toast({ title: 'Cost added', description: `${created.category} recorded successfully.` })
      } catch (error: unknown) {
        toast({
          title: 'Cost add failed',
          description: extractErrorMessage(error, 'Unable to add cost entry'),
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
        await deleteFinanceCost(id)
        setCompanyCosts((prev) => prev.filter((cost) => cost.id !== id))
        toast({ title: 'Cost removed', description: 'The cost entry has been deleted.' })
      } catch (error: unknown) {
        toast({
          title: 'Cost delete failed',
          description: extractErrorMessage(error, 'Unable to delete cost entry'),
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
      await sendInvoiceReminder(invoiceId)
      toast({
        title: 'Reminder sent',
        description: 'Stripe will email this invoice again shortly.',
      })
      await loadFinanceSummary({ quiet: true })
    } catch (error: unknown) {
      toast({
        title: 'Reminder failed',
        description: extractErrorMessage(error, 'Unable to send invoice reminder'),
        variant: 'destructive',
      })
    } finally {
      setSendingInvoiceId(null)
    }
  }, [loadFinanceSummary, toast])

  const handleIssueInvoiceRefund = useCallback(async (invoiceId: string) => {
    if (!invoiceId) {
      return
    }

    try {
      setRefundingInvoiceId(invoiceId)
      const result = await issueInvoiceRefund(invoiceId)
      toast({
        title: 'Refund initiated',
        description: `Stripe refund ${result.refundId} created for ${formatCurrency(result.amount)}`,
      })
      await loadFinanceSummary({ quiet: true })
    } catch (error: unknown) {
      toast({
        title: 'Refund failed',
        description: extractErrorMessage(error, 'Unable to issue refund'),
        variant: 'destructive',
      })
    } finally {
      setRefundingInvoiceId(null)
    }
  }, [loadFinanceSummary, toast])

  const costsWithMonthly = useMemo(
    () =>
      companyCosts.map((cost) => ({
        ...cost,
        monthlyValue: normalizeMonthly(cost.amount, cost.cadence),
      })),
    [companyCosts]
  )

  return {
    selectedPeriod,
    setSelectedPeriod,
    invoiceStatusFilter,
    setInvoiceStatusFilter,
    stats: {
      cards: statCards,
      totalOutstanding,
    },
    paymentSummary,
    chartData,
    filteredInvoices,
    invoices,
    costs: costsWithMonthly,
    monthlyCostTotal,
    revenueByClient,
    upcomingPayments,
    newCost,
    setNewCost,
    handleAddCost,
    handleRemoveCost,
    removingCostId,
    isSubmittingCost,
    isLoading,
    hasAttemptedLoad,
    loadError,
    refresh: () => loadFinanceSummary(),
    sendingInvoiceId,
    refundingInvoiceId,
    sendInvoiceReminder: handleSendInvoiceReminder,
    issueInvoiceRefund: handleIssueInvoiceRefund,
  }
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }
  return fallback
}
