// =============================================================================
// CLIENTS PAGE - Data Management Hook
// =============================================================================

import { useCallback, useEffect, useState } from 'react'
import { useQuery, useAction } from 'convex/react'
import { useAuth } from '@/contexts/auth-context'
import { usePreview } from '@/contexts/preview-context'
import { financeInvoicesApi, projectsApi, proposalsApi, tasksApi, api } from '@/lib/convex-api'
import { getPreviewProjects, getPreviewTasks, getPreviewProposals, getPreviewFinanceSummary } from '@/lib/preview-data'
import { useToast } from '@/components/ui/use-toast'
import type { ClientStats, InvoiceData, CreateInvoiceForm } from './types'

export function useClientsData(selectedClient: any, isPreviewMode: boolean) {
  const { toast } = useToast()
  const { user } = useAuth()
  const workspaceId = user?.agencyId ?? null

  // Real-time queries
  const proposalsRealtime = useQuery(
    proposalsApi.list,
    workspaceId && selectedClient ? { workspaceId, clientId: selectedClient.id, limit: 100 } : 'skip'
  )

  const tasksRealtime = useQuery(
    tasksApi.listByClient,
    !isPreviewMode && workspaceId && selectedClient
      ? { workspaceId, clientId: selectedClient.id, limit: 200 }
      : 'skip'
  ) as Array<any> | undefined

  const projectsRealtime = useQuery(
    projectsApi.list,
    !isPreviewMode && workspaceId && selectedClient
      ? { workspaceId, clientId: selectedClient.id, limit: 200 }
      : 'skip'
  ) as Array<any> | undefined

  const invoicesRealtime = useQuery(
    financeInvoicesApi.list,
    !isPreviewMode && workspaceId && selectedClient
      ? { workspaceId, clientId: selectedClient.id, limit: 10 }
      : 'skip'
  )

  // Actions
  const remindInvoice = useAction(financeInvoicesApi.remind)
  const refundInvoice = useAction(financeInvoicesApi.refund)
  const createInvoice = useAction(financeInvoicesApi.createAndSend)

  // Local state
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [invoiceHistory, setInvoiceHistory] = useState<InvoiceData[]>([])
  const [invoiceHistoryLoading, setInvoiceHistoryLoading] = useState(false)
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false)
  const [createInvoiceLoading, setCreateInvoiceLoading] = useState(false)
  const [createInvoiceForm, setCreateInvoiceForm] = useState<CreateInvoiceForm>({
    amount: '',
    email: '',
    description: '',
    dueDate: '',
    lineItems: [],
  })
  const [sendingReminder, setSendingReminder] = useState(false)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [refundLoading, setRefundLoading] = useState(false)
  const [adStatusLoading, setAdStatusLoading] = useState(false)
  const [adAccountsConnected, setAdAccountsConnected] = useState<boolean | null>(null)

  // Formulas connectivity check
  const formulasConnectivity = useQuery(
    (api as any).customFormulas.listByWorkspace,
    selectedClient ? { workspaceId: selectedClient.id, activeOnly: true } : 'skip'
  )

  // Check ad connectivity
  useEffect(() => {
    if (!selectedClient) {
      setAdAccountsConnected(null)
      return
    }

    if (formulasConnectivity === undefined) {
      setAdStatusLoading(true)
      return
    }

    setAdAccountsConnected(Array.isArray(formulasConnectivity) ? formulasConnectivity.length > 0 : false)
    setAdStatusLoading(false)
  }, [selectedClient, formulasConnectivity])

  // Initialize email from client
  useEffect(() => {
    if (selectedClient?.billingEmail) {
      setCreateInvoiceForm((prev) => ({
        ...prev,
        email: prev.email || selectedClient.billingEmail || '',
      }))
    }
  }, [selectedClient])

  // Fetch client stats
  const fetchClientStats = useCallback(async () => {
    if (!selectedClient) {
      setStats(null)
      return
    }

    setStatsLoading(true)
    try {
      let projects: { status?: string }[] = []
      let tasks: { status?: string }[] = []
      let proposals: { status?: string }[] = []

      if (isPreviewMode) {
        projects = getPreviewProjects(selectedClient.id)
        tasks = getPreviewTasks(selectedClient.id)
        proposals = getPreviewProposals(selectedClient.id)
      } else {
        projects = Array.isArray(projectsRealtime) ? projectsRealtime : []
        tasks = Array.isArray(tasksRealtime) ? tasksRealtime : []
        proposals = Array.isArray(proposalsRealtime) ? proposalsRealtime : []
      }

      const totalProjects = projects.length
      const activeProjects = projects.filter((p: { status?: string }) =>
        p.status === 'active' || p.status === 'in_progress'
      ).length

      const openTasks = tasks.filter((t: { status?: string }) =>
        t.status === 'todo' || t.status === 'in-progress'
      ).length
      const completedTasks = tasks.filter((t: { status?: string }) =>
        t.status === 'done' || t.status === 'completed'
      ).length

      const pendingProposals = proposals.filter((p: { status?: string }) =>
        p.status === 'draft' || p.status === 'pending' || p.status === 'sent'
      ).length

      setStats({ activeProjects, totalProjects, openTasks, completedTasks, pendingProposals })
    } catch (error) {
      console.error('Failed to fetch client stats:', error)
      setStats(null)
    } finally {
      setStatsLoading(false)
    }
  }, [selectedClient, isPreviewMode, proposalsRealtime, tasksRealtime, projectsRealtime])

  // Fetch invoice history
  const fetchInvoiceHistory = useCallback(async () => {
    if (!selectedClient) {
      setInvoiceHistory([])
      return
    }

    setInvoiceHistoryLoading(true)
    try {
      let invoices: any[] = []

      if (isPreviewMode) {
        const previewFinance = getPreviewFinanceSummary(selectedClient.id)
        invoices = previewFinance.invoices ?? []
      } else {
        invoices = invoicesRealtime?.invoices ?? []
      }

      setInvoiceHistory(invoices.map((inv: Record<string, unknown>) => ({
        id: inv.id as string || '',
        number: inv.number as string | null,
        status: inv.status as string || 'draft',
        amount: typeof inv.amount === 'number' ? inv.amount : 0,
        currency: inv.currency as string || 'usd',
        issuedDate: inv.issuedDate as string | null,
        dueDate: inv.dueDate as string | null,
        paidDate: inv.paidDate as string | null,
        hostedInvoiceUrl: inv.hostedInvoiceUrl as string | null,
        description: inv.description as string | null,
        clientName: inv.clientName as string || selectedClient.name,
        amountPaid: typeof inv.amountPaid === 'number' ? inv.amountPaid : null,
        amountRefunded: typeof inv.amountRefunded === 'number' ? inv.amountRefunded : null,
        amountRemaining: typeof inv.amountRemaining === 'number' ? inv.amountRemaining : null,
      })))
    } catch (error) {
      console.error('Failed to fetch invoice history:', error)
    } finally {
      setInvoiceHistoryLoading(false)
    }
  }, [selectedClient, isPreviewMode, invoicesRealtime])

  // Create invoice handler
  const handleCreateInvoice = async (refreshClients: () => Promise<any[]>) => {
    if (!selectedClient || !workspaceId) return

    const amountValue = Number(createInvoiceForm.amount)
    if (!amountValue || Number.isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Enter a positive amount for the invoice.',
        variant: 'destructive',
      })
      return
    }

    if (!createInvoiceForm.email?.trim()) {
      toast({
        title: 'Billing email required',
        description: 'Add a billing email before sending an invoice.',
        variant: 'destructive',
      })
      return
    }

    setCreateInvoiceLoading(true)
    try {
      await createInvoice({
        workspaceId,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        amount: amountValue,
        email: createInvoiceForm.email.trim(),
        description: createInvoiceForm.description?.trim() || undefined,
        dueDate: createInvoiceForm.dueDate || undefined,
        stripeCustomerId: selectedClient.stripeCustomerId ?? null,
      })

      toast({
        title: 'Invoice created',
        description: 'Your invoice has been created and sent.',
      })

      setCreateInvoiceOpen(false)
      setCreateInvoiceForm((prev) => ({ ...prev, amount: '', description: '', dueDate: '', lineItems: [] }))
      await Promise.all([refreshClients(), fetchInvoiceHistory()])
    } catch (error) {
      console.error('Failed to create invoice:', error)
      toast({
        title: 'Failed to create invoice',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setCreateInvoiceLoading(false)
    }
  }

  // Send reminder handler
  const handleSendReminder = async (invoiceSummary: any) => {
    const targetInvoiceId = invoiceSummary?.identifier?.replace(/^#/, '')
    if (!targetInvoiceId || !selectedClient) return

    setSendingReminder(true)
    try {
      await remindInvoice({
        workspaceId: workspaceId as string,
        invoiceId: targetInvoiceId,
      })

      toast({
        title: 'Reminder sent',
        description: 'Invoice reminder has been sent to the client.',
      })
    } catch (error) {
      console.error('Failed to send reminder:', error)
      toast({
        title: 'Failed to send reminder',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSendingReminder(false)
    }
  }

  // Issue refund handler
  const handleIssueRefund = async (invoiceSummary: any, refreshClients: () => Promise<any[]>) => {
    const invoiceId = invoiceSummary?.identifier?.replace(/^#/, '')
    if (!invoiceId || !selectedClient) return

    setRefundLoading(true)
    try {
      const result = await refundInvoice({
        workspaceId: workspaceId as string,
        invoiceId,
      })

      const refundAmount = typeof result?.refund?.amount === 'number' ? result.refund.amount : 0
      const refundCurrency = typeof result?.refund?.currency === 'string' ? result.refund.currency : 'usd'

      toast({
        title: 'Refund issued',
        description: `Refund of $${refundAmount.toFixed(2)} ${refundCurrency.toUpperCase()} has been processed.`,
      })

      setRefundDialogOpen(false)
      await Promise.all([refreshClients(), fetchInvoiceHistory()])
    } catch (error) {
      console.error('Failed to issue refund:', error)
      toast({
        title: 'Failed to issue refund',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setRefundLoading(false)
    }
  }

  return {
    // Queries
    proposalsRealtime,
    tasksRealtime,
    projectsRealtime,
    invoicesRealtime,
    // State
    stats,
    statsLoading,
    invoiceHistory,
    invoiceHistoryLoading,
    createInvoiceOpen,
    createInvoiceLoading,
    createInvoiceForm,
    sendingReminder,
    refundDialogOpen,
    refundLoading,
    adStatusLoading,
    adAccountsConnected,
    // Setters
    setCreateInvoiceOpen,
    setCreateInvoiceForm,
    setRefundDialogOpen,
    // Handlers
    fetchClientStats,
    fetchInvoiceHistory,
    handleCreateInvoice,
    handleSendReminder,
    handleIssueRefund,
  }
}
