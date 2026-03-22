'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import {
  Download,
  RefreshCcw,
  Settings,
  Users as UsersIcon,
} from 'lucide-react'

import { ClientAccessGate } from '@/features/dashboard/home/components/client-access-gate'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { useToast } from '@/shared/ui/use-toast'
import { exportToCsv, cn } from '@/lib/utils'
import { DASHBOARD_THEME, getButtonClasses } from '@/lib/dashboard-theme'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

import {
  ClientsDashboardSkeleton,
  TeamMembersCard,
  ClientStatsGrid,
  ClientDetailsCard,
  ClientOnboardingChecklist,
} from './components'
import { ClientPipelineBoard } from './components/client-pipeline-board'
import { useClientsData } from './use-clients-data'
import { formatDate, getRelativeTimeString } from './utils'
import type { OnboardingItem } from './types'

type ClientsDashboardPageClientProps = {
  initialClientId?: string | null
}

export default function ClientsDashboardPageClient({ initialClientId = null }: ClientsDashboardPageClientProps) {
  return (
    <ClientAccessGate>
      <Suspense fallback={<ClientsDashboardSkeleton />}>
        <ClientsDashboardContent initialClientId={initialClientId} />
      </Suspense>
    </ClientAccessGate>
  )
}

function ClientsDashboardContent({ initialClientId }: ClientsDashboardPageClientProps) {
  const { selectedClient, refreshClients, clients, selectClient, selectedClientId, loading } = useClientContext()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()

  const [refreshing, setRefreshing] = useState(false)
  const [teamSearch, setTeamSearch] = useState('')

  const clientsData = useClientsData(selectedClient, isPreviewMode)

  // Handle URL param sync
  useEffect(() => {
    if (initialClientId && initialClientId !== selectedClientId) {
      selectClient(initialClientId)
    }
  }, [initialClientId, selectedClientId, selectClient])

  // Onboarding items
  const onboardingItems: OnboardingItem[] = useMemo(() => {
    if (!selectedClient) return []

    const teamMembers = selectedClient?.teamMembers ?? []

    const contactInfoComplete = Boolean(selectedClient.accountManager)
    const teamMembersInvited = teamMembers.length > 0
    const firstProjectCreated = (clientsData.stats?.totalProjects ?? 0) > 0
    const adsConnected = clientsData.adAccountsConnected === true

    return [
      {
        id: 'contact-info',
        label: 'Contact info complete',
        done: contactInfoComplete,
        helper: contactInfoComplete ? 'Core ownership details are set.' : 'Assign a clear account owner.',
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
    clientsData.adAccountsConnected,
    clientsData.adStatusLoading,
  ])

  const handleRefresh = () => {
    if (refreshing) return
    setRefreshing(true)

    void refreshClients()
      .then(() => {
        toast({
          title: 'Refreshed',
          description: 'Client data has been updated.',
        })
      })
      .catch(() => {
        toast({
          title: 'Refresh failed',
          description: 'Unable to update client data. Please try again.',
          variant: 'destructive',
        })
      })
      .finally(() => {
        setRefreshing(false)
      })
  }

  const handleExport = () => {
    if (!selectedClient) return

    const teamMembers = selectedClient?.teamMembers ?? []
    const data = [
      {
        Name: selectedClient.name,
        'Account Manager': selectedClient.accountManager || 'Unassigned',
        'Team Size': teamMembers.length,
        'Active Projects': clientsData.stats?.activeProjects ?? '—',
        'Total Projects': clientsData.stats?.totalProjects ?? '—',
        'Open Tasks': clientsData.stats?.openTasks ?? '—',
        'Completed Tasks': clientsData.stats?.completedTasks ?? '—',
        'Created At': selectedClient.createdAt ? formatDate(selectedClient.createdAt) : '—',
      },
    ]

    exportToCsv(data, `client-${selectedClient.name.toLowerCase().replace(/\s+/g, '-')}-overview.csv`)
    toast({
      title: 'Export complete',
      description: 'Client overview has been downloaded.',
    })
  }

  const teamMembers = useMemo(() => selectedClient?.teamMembers ?? [], [selectedClient?.teamMembers])
  const filteredTeamMembers = useMemo(() => {
    if (!teamSearch.trim()) return teamMembers
    const query = teamSearch.toLowerCase()
    return teamMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query)
    )
  }, [teamMembers, teamSearch])

  // Show skeleton while loading
  if (loading && !selectedClient) {
    return <ClientsDashboardSkeleton />
  }

  if (!selectedClient) {
    return (
      <Card className={cn('mx-auto max-w-2xl', DASHBOARD_THEME.cards.base, 'bg-gradient-to-br from-muted/20 to-background')}>
        <CardHeader className="text-center">
          <div className={DASHBOARD_THEME.icons.container}>
            <UsersIcon className={DASHBOARD_THEME.icons.medium} />
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
      <div className={cn(DASHBOARD_THEME.layout.container, DASHBOARD_THEME.animations.fadeIn)}>
        {/* Header */}
        <div className={DASHBOARD_THEME.layout.header}>
          <div className="flex items-center gap-4">
            <div className={DASHBOARD_THEME.icons.container}>
              <UsersIcon className={DASHBOARD_THEME.icons.small} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className={DASHBOARD_THEME.layout.title}>{selectedClient.name}</h1>
              </div>
              <p className={DASHBOARD_THEME.layout.subtitle}>
                Managed by <span className="font-bold text-foreground/80">{selectedClient.accountManager || 'your team'}</span>
                {clientAge && <span className="text-muted-foreground/70 font-normal"> · Partnered {clientAge}</span>}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn(getButtonClasses('outline'), 'h-10 px-4')}>
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
                  className={cn(getButtonClasses('outline'), 'h-10 w-10 p-0')}
                >
                  <RefreshCcw className={cn('h-4 w-4', refreshing && DASHBOARD_THEME.animations.pulse)} />
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
            className={cn(getButtonClasses('outline'), 'h-9 px-4')}
          >
            <Link href={`/dashboard/projects?clientId=${selectedClient.id}`}>Projects</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className={cn(getButtonClasses('outline'), 'h-9 px-4')}
          >
            <Link href={`/dashboard/tasks?clientId=${selectedClient.id}`}>Tasks</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className={cn(getButtonClasses('outline'), 'h-9 px-4')}
          >
            <Link href={`/dashboard/proposals?clientId=${selectedClient.id}`}>Proposals</Link>
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
            <ClientOnboardingChecklist items={onboardingItems} />

            {/* Client Details Card */}
            <ClientDetailsCard
              teamMembersCount={teamMembers.length}
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
