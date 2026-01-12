'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useAction } from 'convex/react'
import { useAuth } from '@/contexts/auth-context'
import { financeInvoicesApi, projectsApi, proposalsApi, tasksApi, api } from '@/lib/convex-api'
import {
  Briefcase,
  CheckSquare,
  Download,
  FileText,
  MoreHorizontal,
  RefreshCcw,
  Settings,
  TrendingUp,
  Users as UsersIcon,
} from 'lucide-react'

import { ClientAccessGate } from '@/components/dashboard/client-access-gate'
import { useClientContext } from '@/contexts/client-context'
import { usePreview } from '@/contexts/preview-context'

import { getPreviewProjects, getPreviewTasks, getPreviewProposals, getPreviewFinanceSummary } from '@/lib/preview-data'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency, exportToCsv, cn } from '@/lib/utils'
import { DATE_FORMATS, formatDate as formatDateLib } from '@/lib/dates'
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import {
  ClientsDashboardSkeleton,
  InvoiceManagementCard,
  TeamMembersCard,
  QuickActionCard,
  ClientStatsGrid,
  ClientDetailsCard,
  ClientOnboardingChecklist,
  type InvoiceData,
  type CreateInvoiceForm,
  type InvoiceSummary,
} from './components'
import type { ClientRecord } from '@/types/clients'

// Types for client stats
interface ClientStats {
  activeProjects: number
  totalProjects: number
  openTasks: number
  completedTasks: number
  pendingProposals: number
}

export default function ClientsDashboardPage() {
  return (
    <ClientAccessGate>
      <ClientsDashboardContent />
    </ClientAccessGate>
  )
}

function ClientsDashboardContent() {
  const searchParams = useSearchParams()
  const { selectedClient, refreshClients, clients, selectClient, selectedClientId, loading } = useClientContext()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()

  const [refreshing, setRefreshing] = useState(false)
  const [teamSearch, setTeamSearch] = useState('')
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const { user } = useAuth()
  const workspaceId = user?.agencyId ?? null

  const proposalsRealtime = useQuery(
    proposalsApi.list,
    workspaceId && selectedClient ? { workspaceId, clientId: selectedClient.id, limit: 100 } : 'skip'
  )

  const tasksRealtime = useQuery(
    tasksApi.listByClient,
    !isPreviewMode && workspaceId && selectedClient ? { workspaceId, clientId: selectedClient.id } : 'skip'
  ) as Array<any> | undefined

  const projectsRealtime = useQuery(
    projectsApi.list,
    !isPreviewMode && workspaceId && selectedClient
      ? { workspaceId, clientId: selectedClient.id, limit: 200 }
      : 'skip'
  ) as Array<any> | undefined

  // Invoice management state
  const invoicesRealtime = useQuery(
    financeInvoicesApi.list,
    !isPreviewMode && workspaceId && selectedClient
      ? { workspaceId, clientId: selectedClient.id, limit: 10 }
      : 'skip'
  )

  const remindInvoice = useAction(financeInvoicesApi.remind)
  const refundInvoice = useAction(financeInvoicesApi.refund)
  const createInvoice = useAction(financeInvoicesApi.createAndSend)

  const [invoiceHistory, setInvoiceHistory] = useState<InvoiceData[]>([])
  const [invoiceHistoryLoading, setInvoiceHistoryLoading] = useState(false)
  const [showInvoiceHistory, setShowInvoiceHistory] = useState(false)
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false)
  const [createInvoiceLoading, setCreateInvoiceLoading] = useState(false)
  const [sendingReminder, setSendingReminder] = useState(false)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [refundLoading, setRefundLoading] = useState(false)
  const [adStatusLoading, setAdStatusLoading] = useState(false)
  const [adAccountsConnected, setAdAccountsConnected] = useState<boolean | null>(null)
  const [createInvoiceForm, setCreateInvoiceForm] = useState<CreateInvoiceForm>({
    amount: '',
    email: '',
    description: '',
    dueDate: '',
    lineItems: [],
  })

  // Handle URL param sync
  useEffect(() => {
    const clientIdParam = searchParams.get('clientId')
    if (clientIdParam && clientIdParam !== selectedClientId) {
      selectClient(clientIdParam)
    }
  }, [searchParams, selectedClientId, selectClient])

  // Fetch client stats (projects, tasks counts)
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
        // Use preview data functions
        projects = getPreviewProjects(selectedClient.id)
        tasks = getPreviewTasks(selectedClient.id)
        proposals = getPreviewProposals(selectedClient.id)
      } else {
        const projectsData = projectsRealtime
        projects = Array.isArray(projectsData) ? projectsData : []

        const tasksData = tasksRealtime
        tasks = Array.isArray(tasksData) ? tasksData : []

        const proposalsData = proposalsRealtime
        proposals = Array.isArray(proposalsData) ? proposalsData : []
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

  useEffect(() => {
    fetchClientStats()
  }, [fetchClientStats])

  // Fetch invoice history for the client
  const fetchInvoiceHistory = useCallback(async () => {
    if (!selectedClient) {
      setInvoiceHistory([])
      return
    }

    setInvoiceHistoryLoading(true)
    try {
      let invoices: any[] = []

      if (isPreviewMode) {
        // Use preview finance data
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


  // Initialize email from client when opening create invoice dialog
  useEffect(() => {
    if (selectedClient?.billingEmail) {
      setCreateInvoiceForm((prev) => ({
        ...prev,
        email: prev.email || selectedClient.billingEmail || '',
      }))
    }
  }, [selectedClient])

  // Check formulas connectivity for onboarding checklist
  const formulasConnectivity = useQuery(
    (api as any).customFormulas.listByWorkspace,
    selectedClient ? { workspaceId: selectedClient.id, activeOnly: true } : 'skip'
  )

  useEffect(() => {
    if (!selectedClient) {
      setAdAccountsConnected(null)
      return
    }

    if (formulasConnectivity === undefined) {
      setAdStatusLoading(true)
      // Query still loading.
      return
    }

    setAdAccountsConnected(Array.isArray(formulasConnectivity) ? formulasConnectivity.length > 0 : false)
    setAdStatusLoading(false)
  }, [selectedClient, formulasConnectivity])

  const handleCreateInvoice = async () => {
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

  // Send invoice reminder
  const handleSendReminder = async (invoiceId?: string) => {
    const targetInvoiceId = invoiceId || invoiceSummary?.identifier?.replace(/^#/, '')
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

  // Issue refund for the current invoice
  const handleIssueRefund = async () => {
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
        description: `Refund of ${formatCurrency(refundAmount, refundCurrency)} has been processed.`,
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

  const teamMembers = selectedClient?.teamMembers ?? []
  const lastInvoiceStatus = selectedClient?.lastInvoiceStatus ?? null

  // Filter team members by search
  const filteredTeamMembers = useMemo(() => {
    if (!teamSearch.trim()) return teamMembers
    const query = teamSearch.toLowerCase()
    return teamMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        (member.role && member.role.toLowerCase().includes(query))
    )
  }, [teamMembers, teamSearch])

  const invoiceSummary: InvoiceSummary | null = useMemo(() => {
    if (!selectedClient) return null

    const status = selectedClient.lastInvoiceStatus ?? 'draft'
    const isOutstanding = status === 'open' || status === 'uncollectible' || status === 'overdue'
    const isPaid = status === 'paid'

    return {
      status,
      isOutstanding,
      isPaid,
      amount: selectedClient.lastInvoiceAmount ?? null,
      currency: selectedClient.lastInvoiceCurrency ?? 'usd',
      issuedAt: selectedClient.lastInvoiceIssuedAt ?? null,
      paidAt: selectedClient.lastInvoicePaidAt ?? null,
      identifier: selectedClient.lastInvoiceNumber ?? null,
      url: selectedClient.lastInvoiceUrl ?? null,
    }
  }, [selectedClient])

  const onboardingItems = useMemo(() => {
    if (!selectedClient) return []

    const contactInfoComplete = Boolean(selectedClient.billingEmail && selectedClient.accountManager)
    const billingInfoAdded = Boolean(selectedClient.stripeCustomerId || selectedClient.billingEmail)
    const teamMembersInvited = teamMembers.length > 0
    const firstProjectCreated = (stats?.totalProjects ?? 0) > 0
    const firstInvoiceSent = Boolean(
      selectedClient.lastInvoiceIssuedAt || selectedClient.lastInvoiceStatus || invoiceHistory.length > 0
    )
    const adsConnected = adAccountsConnected === true

    return [
      {
        id: 'contact-info',
        label: 'Contact info complete',
        done: contactInfoComplete,
        helper: contactInfoComplete ? 'Contact details are set.' : 'Add billing contact and owner details.',
      },
      {
        id: 'billing-info',
        label: 'Billing info added',
        done: billingInfoAdded,
        helper: billingInfoAdded ? 'Billing details saved.' : 'Add billing email or customer ID.',
      },
      {
        id: 'team-members',
        label: 'Team members invited',
        done: teamMembersInvited,
        helper: teamMembersInvited ? 'Team is collaborating.' : 'Invite at least one teammate.',
      },
      {
        id: 'first-project',
        label: 'First project created',
        done: firstProjectCreated,
        helper: firstProjectCreated ? 'Projects underway.' : 'Create the first project.',
      },
      {
        id: 'first-invoice',
        label: 'First invoice sent',
        done: firstInvoiceSent,
        helper: firstInvoiceSent ? 'Invoicing started.' : 'Send your first invoice.',
      },
      {
        id: 'ad-accounts',
        label: 'Ad accounts connected',
        done: adsConnected,
        helper: adsConnected ? 'Ad data will sync automatically.' : 'Connect at least one ad platform.',
        loading: adStatusLoading,
      },
    ]
  }, [
    selectedClient,
    teamMembers.length,
    stats?.totalProjects,
    selectedClient?.lastInvoiceIssuedAt,
    selectedClient?.lastInvoiceStatus,
    invoiceHistory.length,
    adAccountsConnected,
    adStatusLoading,
  ])

  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    try {
      await Promise.all([refreshClients(), fetchClientStats()])
      toast({
        title: 'Refreshed',
        description: 'Client data has been updated.',
      })
    } catch {
      toast({
        title: 'Refresh failed',
        description: 'Unable to update client data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleExport = () => {
    if (!selectedClient) return

    const data = [
      {
        Name: selectedClient.name,
        'Account Manager': selectedClient.accountManager || 'Unassigned',
        'Billing Email': selectedClient.billingEmail || 'Not provided',
        'Team Size': teamMembers.length,
        'Active Projects': stats?.activeProjects ?? '—',
        'Total Projects': stats?.totalProjects ?? '—',
        'Open Tasks': stats?.openTasks ?? '—',
        'Completed Tasks': stats?.completedTasks ?? '—',
        'Last Invoice Status': lastInvoiceStatus || 'None',
        'Last Invoice Amount': selectedClient.lastInvoiceAmount
          ? formatCurrency(selectedClient.lastInvoiceAmount, selectedClient.lastInvoiceCurrency || 'USD')
          : '—',
        'Last Invoice Date': selectedClient.lastInvoiceIssuedAt
          ? formatDate(selectedClient.lastInvoiceIssuedAt)
          : '—',
        'Created At': selectedClient.createdAt ? formatDate(selectedClient.createdAt) : '—',
      },
    ]

    exportToCsv(data, `client-${selectedClient.name.toLowerCase().replace(/\s+/g, '-')}-overview.csv`)
    toast({
      title: 'Export complete',
      description: 'Client overview has been downloaded.',
    })
  }

  const handleToggleInvoiceHistory = () => {
    if (!showInvoiceHistory && invoiceHistory.length === 0) {
      fetchInvoiceHistory()
    }
    setShowInvoiceHistory(!showInvoiceHistory)
  }

  // Show skeleton while loading
  if (loading && !selectedClient) {
    return <ClientsDashboardSkeleton />
  }

  if (!selectedClient) {
    return (
      <Card className="mx-auto max-w-2xl border-muted/60 bg-gradient-to-br from-muted/20 to-background">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 rounded-full bg-primary/10 p-4">
            <UsersIcon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Select a client workspace</CardTitle>
          <CardDescription className="text-base">
            Use the selector above to choose a client and unlock their workspace overview.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const clientIndex = clients.findIndex((record) => record.id === selectedClient.id)
  const clientAge = selectedClient.createdAt
    ? getRelativeTimeString(new Date(selectedClient.createdAt))
    : null
  const managersCount = teamMembers.filter((m) => m.role?.toLowerCase().includes('manager')).length

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{selectedClient.name}</h1>
                {invoiceSummary?.isOutstanding && (
                  <Badge variant="destructive" className="animate-pulse rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border-2 border-background shadow-sm">
                    Payment Due
                  </Badge>
                )}
                 {invoiceSummary?.isPaid && (
                   <Badge variant="secondary" className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border border-primary/20 shadow-sm">
                     Paid
                   </Badge>
                 )}
              </div>
              <p className="text-sm font-medium text-muted-foreground/70">
                Managed by <span className="font-bold text-foreground/80">{selectedClient.accountManager || 'your team'}</span>
                {clientAge && <span className="text-muted-foreground/40 font-normal"> · Partnered {clientAge}</span>}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 rounded-xl border-muted/30 bg-background px-4 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all hover:bg-muted/5 hover:text-primary active:scale-[0.98]">
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-muted/40 shadow-xl backdrop-blur-md">
                <DropdownMenuItem asChild className="rounded-lg text-[11px] font-bold uppercase tracking-wider focus:bg-primary/5 focus:text-primary">
                  <Link href="/admin/clients" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4 opacity-70" />
                    Manage client
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport} className="rounded-lg text-[11px] font-bold uppercase tracking-wider focus:bg-primary/5 focus:text-primary">
                  <Download className="mr-2 h-4 w-4 opacity-70" />
                  Export data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg text-[11px] font-bold uppercase tracking-wider focus:bg-primary/5 focus:text-primary">
                  <Link href={`/dashboard/collaboration?clientId=${selectedClient.id}`} className="flex items-center">
                    <UsersIcon className="mr-2 h-4 w-4 opacity-70" />
                    Collaboration
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-10 w-10 rounded-xl border-muted/30 bg-background p-0 shadow-sm transition-all hover:bg-muted/5 hover:text-primary active:scale-[0.98]"
                >
                  <RefreshCcw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="rounded-lg border-muted/40 font-bold uppercase tracking-widest text-[10px]">Refresh data</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Stats Grid */}
        <ClientStatsGrid
          stats={stats}
          statsLoading={statsLoading}
          teamMembersCount={teamMembers.length}
          managersCount={managersCount}
        />

        {/* Quick Actions */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            href={`/dashboard/projects?clientId=${selectedClient.id}`}
            icon={Briefcase}
            title="Projects"
            description="View and manage projects"
            color="blue"
          />
          <QuickActionCard
            href={`/dashboard/tasks?clientId=${selectedClient.id}`}
            icon={CheckSquare}
            title="Tasks"
            description="Track deliverables"
            color="emerald"
          />
          <QuickActionCard
            href={`/dashboard/proposals?clientId=${selectedClient.id}`}
            icon={FileText}
            title="Proposals"
            description="Create and send proposals"
            color="amber"
          />
          <QuickActionCard
            href={`/dashboard/finance?clientId=${selectedClient.id}`}
            icon={TrendingUp}
            title="Finance"
            description="Revenue and invoicing"
            color="violet"
          />
        </div>

        <ClientPipelineBoard clients={clients} selectedClientId={selectedClient.id} />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          {/* Team Members */}
          <TeamMembersCard
            teamMembers={teamMembers}
            filteredTeamMembers={filteredTeamMembers}
            teamSearch={teamSearch}
            onTeamSearchChange={setTeamSearch}
          />

          {/* Sidebar */}
          <div className="space-y-6">
            <ClientOnboardingChecklist clientName={selectedClient.name} items={onboardingItems} />

            {/* Invoice Management Card */}
            <InvoiceManagementCard
              clientName={selectedClient.name}
              invoiceSummary={invoiceSummary}
              invoiceHistory={invoiceHistory}
              invoiceHistoryLoading={invoiceHistoryLoading}
              showInvoiceHistory={showInvoiceHistory}
              createInvoiceOpen={createInvoiceOpen}
              createInvoiceLoading={createInvoiceLoading}
              createInvoiceForm={createInvoiceForm}
              sendingReminder={sendingReminder}
              refundDialogOpen={refundDialogOpen}
              refundLoading={refundLoading}
              suggestedEmail={selectedClient.billingEmail ?? null}
              onCreateInvoiceOpenChange={setCreateInvoiceOpen}
              onCreateInvoiceFormChange={setCreateInvoiceForm}
              onCreateInvoice={handleCreateInvoice}
              onSendReminder={handleSendReminder}
              onRefundDialogOpenChange={setRefundDialogOpen}
              onIssueRefund={handleIssueRefund}
              onToggleInvoiceHistory={handleToggleInvoiceHistory}
            />

            {/* Client Details Card */}
            <ClientDetailsCard
              billingEmail={selectedClient.billingEmail ?? null}
              clientIndex={clientIndex}
              totalClients={clients.length}
              createdAt={selectedClient.createdAt ?? null}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

type ClientPipelineBoardProps = {
  clients: ClientRecord[]
  selectedClientId: string
}

function ClientPipelineBoard({ clients, selectedClientId }: ClientPipelineBoardProps) {
  const stages = [
    { id: 'onboarding', label: 'Onboarding', helper: 'No invoices yet' },
    { id: 'invoicing', label: 'Invoicing', helper: 'Draft or open invoices' },
    { id: 'paying', label: 'Paying', helper: 'Paid or recurring' },
  ] as const

  const deriveStage = (client: ClientRecord): (typeof stages)[number]['id'] => {
    const status = client.lastInvoiceStatus?.toLowerCase() ?? ''
    if (['paid', 'succeeded', 'settled'].includes(status)) return 'paying'
    if (['open', 'uncollectible', 'overdue', 'draft', 'pending', 'sent'].includes(status)) return 'invoicing'
    return 'onboarding'
  }

  const groups = stages.map((stage) => ({
    stage,
    items: clients.filter((client) => deriveStage(client) === stage.id),
  }))

  return (
    <Card className="overflow-hidden border-muted/30 bg-background shadow-sm transition-all hover:shadow-md">
      <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Client pipeline</CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground/60 leading-tight">CRM overview stage transition tracking</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-3">
          {groups.map(({ stage, items }) => (
            <div key={stage.id} className="flex flex-col gap-4 rounded-2xl border border-muted/20 bg-muted/5 p-4 transition-all hover:bg-muted/[0.07]">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">{stage.label}</span>
                  <Badge variant="outline" className="h-5 rounded-full border-muted/30 bg-background px-2 text-[10px] font-black text-primary shadow-sm">
                    {items.length}
                  </Badge>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
              </div>

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted/30 bg-background/50 py-10 px-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Stage Empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((client) => (
                    <Link
                      key={client.id}
                      href={`/dashboard/clients?clientId=${client.id}`}
                      className={cn(
                        'group block rounded-xl border border-muted/30 bg-background p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99]',
                        client.id === selectedClientId && 'border-primary/50 bg-primary/[0.02] shadow-md ring-1 ring-primary/20'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary" title={client.name}>
                            {client.name}
                          </span>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                              {client.accountManager ? client.accountManager : 'Unassigned'}
                            </span>
                          </div>
                        </div>
                        {client.id === selectedClientId && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-muted/10 pt-3">
                          <span className={cn(
                           "text-[9px] font-black uppercase tracking-[0.15em]",
                           client.lastInvoiceStatus === 'paid' ? "text-primary" : "text-muted-foreground/40"
                         )}>
                          {client.lastInvoiceStatus ?? 'No Billing'}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">
                          {client.createdAt ? new Date(client.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'NEW'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Utility Functions
function formatDate(value: string | null): string {
  return formatDateLib(value, DATE_FORMATS.SHORT, undefined, '—')
}

function getRelativeTimeString(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 1) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}
