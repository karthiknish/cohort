'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency, exportToCsv, cn } from '@/lib/utils'
import {
  Card,
  CardDescription,
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
  type InvoiceData,
  type CreateInvoiceForm,
  type InvoiceSummary,
} from './components'

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
  const { getIdToken } = useAuth()
  const { toast } = useToast()

  const [refreshing, setRefreshing] = useState(false)
  const [teamSearch, setTeamSearch] = useState('')
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // Invoice management state
  const [invoiceHistory, setInvoiceHistory] = useState<InvoiceData[]>([])
  const [invoiceHistoryLoading, setInvoiceHistoryLoading] = useState(false)
  const [showInvoiceHistory, setShowInvoiceHistory] = useState(false)
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false)
  const [createInvoiceLoading, setCreateInvoiceLoading] = useState(false)
  const [sendingReminder, setSendingReminder] = useState(false)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [refundLoading, setRefundLoading] = useState(false)
  const [createInvoiceForm, setCreateInvoiceForm] = useState<CreateInvoiceForm>({
    amount: '',
    email: '',
    description: '',
    dueDate: '',
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
      const token = await getIdToken()
      const headers = { Authorization: `Bearer ${token}` }

      const [projectsRes, tasksRes, proposalsRes] = await Promise.all([
        fetch(`/api/projects?clientId=${selectedClient.id}&pageSize=100`, { headers }).catch(() => null),
        fetch(`/api/tasks?clientId=${selectedClient.id}&pageSize=100`, { headers }).catch(() => null),
        fetch(`/api/proposals?clientId=${selectedClient.id}&pageSize=100`, { headers }).catch(() => null),
      ])

      let activeProjects = 0
      let totalProjects = 0
      let openTasks = 0
      let completedTasks = 0
      let pendingProposals = 0

      if (projectsRes?.ok) {
        const data = await projectsRes.json()
        const projects = Array.isArray(data.projects) ? data.projects : []
        totalProjects = projects.length
        activeProjects = projects.filter((p: { status?: string }) => 
          p.status === 'active' || p.status === 'in_progress'
        ).length
      }

      if (tasksRes?.ok) {
        const data = await tasksRes.json()
        const tasks = Array.isArray(data.tasks) ? data.tasks : []
        openTasks = tasks.filter((t: { status?: string }) => 
          t.status === 'todo' || t.status === 'in_progress'
        ).length
        completedTasks = tasks.filter((t: { status?: string }) => 
          t.status === 'done' || t.status === 'completed'
        ).length
      }

      if (proposalsRes?.ok) {
        const data = await proposalsRes.json()
        const proposals = Array.isArray(data.proposals) ? data.proposals : []
        pendingProposals = proposals.filter((p: { status?: string }) => 
          p.status === 'draft' || p.status === 'pending' || p.status === 'sent'
        ).length
      }

      setStats({ activeProjects, totalProjects, openTasks, completedTasks, pendingProposals })
    } catch (error) {
      console.error('Failed to fetch client stats:', error)
      setStats(null)
    } finally {
      setStatsLoading(false)
    }
  }, [selectedClient, getIdToken])

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
      const token = await getIdToken()
      const response = await fetch(`/api/finance/summary?clientId=${selectedClient.id}&pageSize=10`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const invoices = Array.isArray(data.invoices) ? data.invoices : []
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
      }
    } catch (error) {
      console.error('Failed to fetch invoice history:', error)
    } finally {
      setInvoiceHistoryLoading(false)
    }
  }, [selectedClient, getIdToken])

  // Initialize email from client when opening create invoice dialog
  useEffect(() => {
    if (createInvoiceOpen && selectedClient) {
      setCreateInvoiceForm((prev) => ({
        ...prev,
        email: selectedClient.billingEmail || '',
      }))
    }
  }, [createInvoiceOpen, selectedClient])

  // Create a new invoice
  const handleCreateInvoice = async () => {
    if (!selectedClient) return

    const amount = parseFloat(createInvoiceForm.amount)
    if (isNaN(amount) || amount < 1) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter an amount of at least $1.',
        variant: 'destructive',
      })
      return
    }

    if (!createInvoiceForm.email || !createInvoiceForm.email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid billing email.',
        variant: 'destructive',
      })
      return
    }

    setCreateInvoiceLoading(true)
    try {
      const token = await getIdToken()
      const response = await fetch(`/api/clients/${selectedClient.id}/invoice`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          email: createInvoiceForm.email.trim(),
          description: createInvoiceForm.description.trim() || undefined,
          dueDate: createInvoiceForm.dueDate || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create invoice')
      }

      const result = await response.json()

      toast({
        title: 'Invoice created',
        description: `Invoice ${result.invoice?.number || ''} has been sent to ${createInvoiceForm.email}.`,
      })

      setCreateInvoiceOpen(false)
      setCreateInvoiceForm({ amount: '', email: '', description: '', dueDate: '' })
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
      const token = await getIdToken()
      const response = await fetch(`/api/finance/invoices/${targetInvoiceId}/remind`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to send reminder')
      }

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
      const token = await getIdToken()
      const response = await fetch(`/api/finance/invoices/${invoiceId}/refund`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to issue refund')
      }

      const result = await response.json()

      toast({
        title: 'Refund issued',
        description: `Refund of ${formatCurrency(result.refund?.amount || 0, result.refund?.currency || 'usd')} has been processed.`,
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
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{selectedClient.name}</h1>
              {invoiceSummary?.isOutstanding && (
                <Badge variant="destructive" className="animate-pulse">
                  Payment Due
                </Badge>
              )}
              {invoiceSummary?.isPaid && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Paid
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Managed by {selectedClient.accountManager || 'your team'}
              {clientAge && <span className="text-muted-foreground/60"> · Client since {clientAge}</span>}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                  <MoreHorizontal className="h-4 w-4 sm:hidden" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/admin/clients">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage client
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/collaboration?clientId=${selectedClient.id}`}>
                    <UsersIcon className="mr-2 h-4 w-4" />
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
                  className="gap-2"
                >
                  <RefreshCcw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh client data</TooltipContent>
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

// Utility Functions
function formatDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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
