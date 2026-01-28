'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  Download,
  MoreHorizontal,
  RefreshCcw,
  Settings,
  Users as UsersIcon,
} from 'lucide-react'

import { ClientAccessGate } from '@/components/dashboard/client-access-gate'
import { useClientContext } from '@/contexts/client-context'
import { usePreview } from '@/contexts/preview-context'
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
  ClientStatsGrid,
  ClientDetailsCard,
  ClientOnboardingChecklist,
} from './components'
import { ClientPipelineBoard } from './components/client-pipeline-board'
import { useClientsData } from './use-clients-data'
import { formatDate, getRelativeTimeString } from './utils'
import type { InvoiceSummary, OnboardingItem } from './types'
import type { ClientRecord } from '@/types/clients'

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
  const [showInvoiceHistory, setShowInvoiceHistory] = useState(false)

  const clientsData = useClientsData(selectedClient, isPreviewMode)

  // Handle URL param sync
  useEffect(() => {
    const clientIdParam = searchParams.get('clientId')
    if (clientIdParam && clientIdParam !== selectedClientId) {
      selectClient(clientIdParam)
    }
  }, [searchParams, selectedClientId, selectClient])

  // Fetch stats and invoices on mount or client change
  useEffect(() => {
    if (selectedClient) {
      clientsData.fetchClientStats()
    }
  }, [selectedClient, clientsData.fetchClientStats])

  // Invoice summary
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

  // Onboarding items
  const onboardingItems: OnboardingItem[] = useMemo(() => {
    if (!selectedClient) return []

    const teamMembers = selectedClient?.teamMembers ?? []

    const contactInfoComplete = Boolean(selectedClient.billingEmail && selectedClient.accountManager)
    const billingInfoAdded = Boolean(selectedClient.stripeCustomerId || selectedClient.billingEmail)
    const teamMembersInvited = teamMembers.length > 0
    const firstProjectCreated = (clientsData.stats?.totalProjects ?? 0) > 0
    const firstInvoiceSent = Boolean(
      selectedClient.lastInvoiceIssuedAt || selectedClient.lastInvoiceStatus || clientsData.invoiceHistory.length > 0
    )
    const adsConnected = clientsData.adAccountsConnected === true

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
        loading: clientsData.adStatusLoading,
      },
    ]
  }, [
    selectedClient,
    clientsData.stats?.totalProjects,
    clientsData.invoiceHistory.length,
    clientsData.adAccountsConnected,
    clientsData.adStatusLoading,
  ])

  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    try {
      await Promise.all([refreshClients(), clientsData.fetchClientStats()])
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

    const teamMembers = selectedClient?.teamMembers ?? []
    const data = [
      {
        Name: selectedClient.name,
        'Account Manager': selectedClient.accountManager || 'Unassigned',
        'Billing Email': selectedClient.billingEmail || 'Not provided',
        'Team Size': teamMembers.length,
        'Active Projects': clientsData.stats?.activeProjects ?? '—',
        'Total Projects': clientsData.stats?.totalProjects ?? '—',
        'Open Tasks': clientsData.stats?.openTasks ?? '—',
        'Completed Tasks': clientsData.stats?.completedTasks ?? '—',
        'Last Invoice Status': selectedClient.lastInvoiceStatus || 'None',
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
    if (!showInvoiceHistory && clientsData.invoiceHistory.length === 0) {
      clientsData.fetchInvoiceHistory()
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

  const teamMembers = selectedClient?.teamMembers ?? []
  const filteredTeamMembers = useMemo(() => {
    if (!teamSearch.trim()) return teamMembers
    const query = teamSearch.toLowerCase()
    return teamMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        (member.role && member.role.toLowerCase().includes(query))
    )
  }, [teamMembers, teamSearch])

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
          stats={clientsData.stats}
          statsLoading={clientsData.statsLoading}
          teamMembersCount={teamMembers.length}
          managersCount={managersCount}
        />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-muted/40 bg-background px-4 text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all hover:bg-muted/5 hover:text-primary active:scale-[0.98]"
          >
            <Link href={`/dashboard/projects?clientId=${selectedClient.id}`}>Projects</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-muted/40 bg-background px-4 text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all hover:bg-muted/5 hover:text-primary active:scale-[0.98]"
          >
            <Link href={`/dashboard/tasks?clientId=${selectedClient.id}`}>Tasks</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-muted/40 bg-background px-4 text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all hover:bg-muted/5 hover:text-primary active:scale-[0.98]"
          >
            <Link href={`/dashboard/proposals?clientId=${selectedClient.id}`}>Proposals</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-muted/40 bg-background px-4 text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all hover:bg-muted/5 hover:text-primary active:scale-[0.98]"
          >
            <Link href={`/dashboard/finance?clientId=${selectedClient.id}`}>Finance</Link>
          </Button>
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
              invoiceHistory={clientsData.invoiceHistory}
              invoiceHistoryLoading={clientsData.invoiceHistoryLoading}
              showInvoiceHistory={showInvoiceHistory}
              createInvoiceOpen={clientsData.createInvoiceOpen}
              createInvoiceLoading={clientsData.createInvoiceLoading}
              createInvoiceForm={clientsData.createInvoiceForm}
              sendingReminder={clientsData.sendingReminder}
              refundDialogOpen={clientsData.refundDialogOpen}
              refundLoading={clientsData.refundLoading}
              suggestedEmail={selectedClient.billingEmail ?? null}
              onCreateInvoiceOpenChange={clientsData.setCreateInvoiceOpen}
              onCreateInvoiceFormChange={clientsData.setCreateInvoiceForm}
              onCreateInvoice={() => clientsData.handleCreateInvoice(refreshClients)}
              onSendReminder={() => clientsData.handleSendReminder(invoiceSummary)}
              onRefundDialogOpenChange={clientsData.setRefundDialogOpen}
              onIssueRefund={() => clientsData.handleIssueRefund(invoiceSummary, refreshClients)}
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
