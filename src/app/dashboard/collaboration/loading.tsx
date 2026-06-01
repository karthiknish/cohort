import { CollaborationSkeleton } from '@/features/dashboard/collaboration/components/collaboration-skeleton';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
export default function CollaborationLoading() {
    return (<div className={DASHBOARD_THEME.layout.container}>
      <CollaborationSkeleton />
    </div>);
}
