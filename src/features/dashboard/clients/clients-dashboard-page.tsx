'use client';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { useRouter } from '@/shared/ui/navigation';
import { Suspense, createElement, useCallback, useEffectEvent, useLayoutEffect, useMemo, useState } from 'react';
import { Users as UsersIcon } from 'lucide-react';
import { ClientAccessGate } from '@/features/dashboard/home/components/client-access-gate';
import { PageMotionShell } from '@/shared/components/page-motion-shell';
import { useClientContext } from '@/shared/contexts/client-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary';
import { ClientsDashboardSkeleton } from './components/clients-dashboard-skeleton';
import { buildMetricSnapshotChart } from '@/lib/export/cohorts-spreadsheet-charts';
import { exportToCsv } from '@/lib/export/export-to-spreadsheet';
import { cn } from '@/lib/utils';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
import { Card, CardDescription, CardHeader, CardTitle, } from '@/shared/ui/card';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { ClientsDashboardReadyView } from './clients-dashboard-ready-view';
import { useClientsData } from './use-clients-data';
import { formatDate } from './utils';
import type { OnboardingItem } from './types';
type ClientsDashboardPageClientProps = {
    initialClientId?: string | null;
};
export default function ClientsDashboardPageClient({ initialClientId = null }: ClientsDashboardPageClientProps) {
    return (<PageMotionShell reveal={false}>
      <ClientAccessGate>
        <Suspense fallback={createElement(ClientsDashboardSkeleton)}>
          <ClientsDashboardContent key={initialClientId ?? 'default'} initialClientId={initialClientId}/>
        </Suspense>
      </ClientAccessGate>
    </PageMotionShell>);
}
function ClientsDashboardContent({ initialClientId }: ClientsDashboardPageClientProps) {
    const { push } = useRouter();
    const { selectedClient, refreshClients, clients, selectClient, loading } = useClientContext();
    const { isPreviewMode } = usePreview();
    const [refreshing, setRefreshing] = useState(false);
    const [teamSearch, setTeamSearch] = useState('');
    const clientsData = useClientsData(selectedClient, isPreviewMode);
    const applyInitialClient = useEffectEvent(() => {
        if (initialClientId) {
            selectClient(initialClientId);
        }
    });
    useLayoutEffect(() => {
        applyInitialClient();
    }, [initialClientId]);
    const onboardingItems: OnboardingItem[] = (() => {
        if (!selectedClient)
            return [];
        const teamMembers = selectedClient.teamMembers ?? [];
        const contactInfoComplete = Boolean(selectedClient.accountManager);
        const teamMembersInvited = teamMembers.length > 0;
        const firstProjectCreated = (clientsData.stats?.totalProjects ?? 0) > 0;
        const adsConnected = clientsData.adAccountsConnected === true;
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
        ];
    })();
    const handleRefresh = () => {
        if (refreshing)
            return;
        setRefreshing(true);
        void refreshClients()
            .then(() => {
            notifySuccess({
                title: 'Refreshed',
                message: 'Client data has been updated.',
            });
        })
            .catch(() => {
            notifyFailure({
                title: 'Refresh failed',
                message: 'Unable to update client data. Please try again.',
            });
        })
            .finally(() => {
            setRefreshing(false);
        });
    };
    const handleBackToClients = () => {
        selectClient(null);
        push('/dashboard/clients');
    };
    const handleExport = () => {
        if (!selectedClient)
            return;
        const teamMembers = selectedClient.teamMembers ?? [];
        const stats = clientsData.stats;
        const data = [
            {
                Name: selectedClient.name,
                'Account Manager': selectedClient.accountManager || 'Unassigned',
                'Team Size': teamMembers.length,
                'Active Projects': stats?.activeProjects ?? '—',
                'Total Projects': stats?.totalProjects ?? '—',
                'Open Tasks': stats?.openTasks ?? '—',
                'Completed Tasks': stats?.completedTasks ?? '—',
                'Created At': selectedClient.createdAt ? formatDate(selectedClient.createdAt) : '—',
            },
        ];
        const snapshotChart = buildMetricSnapshotChart({
            'Team Size': teamMembers.length,
            'Active Projects': typeof stats?.activeProjects === 'number' ? stats.activeProjects : 0,
            'Total Projects': typeof stats?.totalProjects === 'number' ? stats.totalProjects : 0,
            'Open Tasks': typeof stats?.openTasks === 'number' ? stats.openTasks : 0,
            'Completed Tasks': typeof stats?.completedTasks === 'number' ? stats.completedTasks : 0,
        }, 'Client workload snapshot');
        void exportToCsv(data, `client-${selectedClient.name.toLowerCase().replace(/\s+/g, '-')}-overview.xlsx`, undefined, {
            title: `${selectedClient.name} overview`,
            subtitle: 'Client workspace snapshot',
            charts: snapshotChart ? [snapshotChart] : [],
        });
        notifySuccess({
            title: 'Export complete',
            message: 'Client overview has been downloaded.',
        });
    };
    const teamMembers = selectedClient?.teamMembers ?? [];
    const filteredTeamMembers = (() => {
        if (!teamSearch.trim())
            return teamMembers;
        const query = teamSearch.toLowerCase();
        return teamMembers.filter((member) => member.name.toLowerCase().includes(query) ||
            member.role?.toLowerCase().includes(query));
    })();
    const isInitialLoading = loading && !selectedClient;
    if (!selectedClient && !isInitialLoading) {
        return (<Card className={cn('mx-auto max-w-2xl', DASHBOARD_THEME.cards.base, 'bg-gradient-to-br from-muted/20 to-background')}>
        <CardHeader className="text-center">
          <div className={DASHBOARD_THEME.icons.container}>
            <UsersIcon className={DASHBOARD_THEME.icons.medium}/>
          </div>
          <CardTitle className="text-xl">Select a client workspace</CardTitle>
          <CardDescription className="text-base">
            Use the selector above to choose a client and unlock their workspace overview.
          </CardDescription>
        </CardHeader>
      </Card>);
    }
    const readyContent = selectedClient ? (<ClientsDashboardReadyView selectedClient={selectedClient} clients={clients} clientsData={clientsData} onboardingItems={onboardingItems} teamMembers={teamMembers} filteredTeamMembers={filteredTeamMembers} teamSearch={teamSearch} onTeamSearchChange={setTeamSearch} refreshing={refreshing} onRefresh={handleRefresh} onBackToClients={handleBackToClients} onExport={handleExport}/>) : null;
    return (<TooltipProvider>
      <PageSkeletonBoundary loading={isInitialLoading} loadingContent={<ClientsDashboardSkeleton />}>
        {readyContent}
      </PageSkeletonBoundary>
    </TooltipProvider>);
}
