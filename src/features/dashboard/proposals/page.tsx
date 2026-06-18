'use client';
import { Suspense, useEffect } from 'react';
import { useSearchParams } from '@/shared/ui/navigation';
import { DashboardSkeleton } from '@/features/dashboard/home/components/dashboard-skeleton';
import { PageMotionShell } from '@/shared/components/page-motion-shell';
import { useClientContext } from '@/shared/contexts/client-context';
import { useProposalsPageContent } from './hooks/use-proposals-page-content';
function ProposalsPageContent() {
    const clientIdParam = useSearchParams().get('clientId');
    const { selectClient } = useClientContext();
    useEffect(() => {
        if (clientIdParam) {
            selectClient(clientIdParam);
        }
    }, [clientIdParam, selectClient]);
    return useProposalsPageContent();
}
export default function ProposalsPage() {
    const dashboardSkeleton = <DashboardSkeleton />;
    return (<PageMotionShell reveal={false}>
      <Suspense fallback={dashboardSkeleton}>
        <ProposalsPageContent />
      </Suspense>
    </PageMotionShell>);
}
