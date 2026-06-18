'use client';
import { Link } from '@/shared/ui/link';
import { Download, RefreshCcw, Settings, Users as UsersIcon } from 'lucide-react';
import { DashboardPageHero } from '@/shared/components/dashboard-page-hero';
import { BackLink } from '@/shared/components/back-link';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/shared/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger, } from '@/shared/ui/tooltip';
import { cn } from '@/lib/utils';
import { DASHBOARD_THEME, getButtonClasses } from '@/lib/dashboard-theme';
import { ClientDetailsCard } from './components/client-details-card';
import { ClientOnboardingChecklist } from './components/client-onboarding-card';
import { ClientStatsGrid } from './components/client-stats-grid';
import { TeamMembersCard } from './components/team-members-card';
import { ClientPipelineBoard } from './components/client-pipeline-board';
import { getRelativeTimeString } from './utils';
import type { OnboardingItem } from './types';
import type { useClientsData } from './use-clients-data';
import type { useClientContext } from '@/shared/contexts/client-context';
type ClientsDashboardReadyViewProps = {
    selectedClient: NonNullable<ReturnType<typeof useClientContext>['selectedClient']>;
    clients: ReturnType<typeof useClientContext>['clients'];
    clientsData: ReturnType<typeof useClientsData>;
    onboardingItems: OnboardingItem[];
    teamMembers: NonNullable<ReturnType<typeof useClientContext>['selectedClient']>['teamMembers'];
    filteredTeamMembers: NonNullable<ReturnType<typeof useClientContext>['selectedClient']>['teamMembers'];
    teamSearch: string;
    onTeamSearchChange: (value: string) => void;
    refreshing: boolean;
    onRefresh: () => void;
    onBackToClients: () => void;
    onExport: () => void;
};
export function ClientsDashboardReadyView({ selectedClient, clients, clientsData, onboardingItems, teamMembers, filteredTeamMembers, teamSearch, onTeamSearchChange, refreshing, onRefresh, onBackToClients, onExport, }: ClientsDashboardReadyViewProps) {
    const clientIndex = clients.findIndex((record) => record.id === selectedClient.id);
    const clientAge = selectedClient.createdAt
        ? getRelativeTimeString(new Date(selectedClient.createdAt))
        : null;
    const managersCount = teamMembers.filter((member) => member.role?.toLowerCase().includes('manager')).length;
    return (<div className={cn(DASHBOARD_THEME.layout.container, DASHBOARD_THEME.animations.fadeIn)}>
      <DashboardPageHero>
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <BackLink label="Back to clients" onClick={onBackToClients}/>
            <div className="flex items-center gap-4">
              <div className={DASHBOARD_THEME.icons.container}>
                <UsersIcon className={DASHBOARD_THEME.icons.small}/>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className={DASHBOARD_THEME.layout.title}>{selectedClient.name}</h1>
                </div>
                <p className={DASHBOARD_THEME.layout.subtitle}>
                  Managed by{' '}
                  <span className="font-bold text-foreground/80">
                    {selectedClient.accountManager || 'your team'}
                  </span>
                  {clientAge ? (<span className="font-normal text-muted-foreground/70"> · Partnered {clientAge}</span>) : null}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn(getButtonClasses('outline'), 'h-10 px-4')}>
                <Settings className="mr-2 size-3.5"/>
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-muted/40 shadow-xl backdrop-blur-md">
              <DropdownMenuItem asChild className="rounded-lg text-[11px] font-bold uppercase tracking-wider focus:bg-accent/5 focus:text-primary">
                <Link href="/admin/clients" className="flex items-center">
                  <Settings className="mr-2 size-4 opacity-70"/>
                  Manage client
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport} className="rounded-lg text-[11px] font-bold uppercase tracking-wider focus:bg-accent/5 focus:text-primary">
                <Download className="mr-2 size-4 opacity-70"/>
                Export data
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-lg text-[11px] font-bold uppercase tracking-wider focus:bg-accent/5 focus:text-primary">
                <Link href={`/dashboard/collaboration?clientId=${selectedClient.id}`} className="flex items-center">
                  <UsersIcon className="mr-2 size-4 opacity-70"/>
                  Collaboration
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing} className={cn(getButtonClasses('outline'), 'size-10 p-0')}>
                <RefreshCcw className={cn('size-4', refreshing && DASHBOARD_THEME.animations.pulse)}/>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="rounded-lg border-muted/40 font-bold uppercase tracking-widest text-[10px]">
              Refresh data
            </TooltipContent>
          </Tooltip>
        </div>
      </DashboardPageHero>

      {clientsData.workspaceMissing ? (<Alert variant="destructive">
          <AlertDescription>
            Sign in again to load live project and task stats for this client.
          </AlertDescription>
        </Alert>) : null}

      <ClientStatsGrid stats={clientsData.stats} statsLoading={clientsData.statsLoading} teamMembersCount={teamMembers.length} managersCount={managersCount}/>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className={cn(getButtonClasses('outline'), 'h-9 px-4')}>
          <Link href={`/dashboard/projects?clientId=${selectedClient.id}`}>Projects</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className={cn(getButtonClasses('outline'), 'h-9 px-4')}>
          <Link href={`/dashboard/tasks?clientId=${selectedClient.id}`}>Tasks</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className={cn(getButtonClasses('outline'), 'h-9 px-4')}>
          <Link href={`/dashboard/proposals?clientId=${selectedClient.id}`}>Proposals</Link>
        </Button>
      </div>

      <ClientPipelineBoard clients={clients} selectedClientId={selectedClient.id}/>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <TeamMembersCard teamMembers={teamMembers} filteredTeamMembers={filteredTeamMembers} teamSearch={teamSearch} onTeamSearchChange={onTeamSearchChange}/>

        <div className="space-y-6">
          <ClientOnboardingChecklist items={onboardingItems}/>

          <ClientDetailsCard teamMembersCount={teamMembers.length} clientIndex={clientIndex} totalClients={clients.length} createdAt={selectedClient.createdAt ?? null}/>
        </div>
      </div>
    </div>);
}
