import { MeetingsPageSkeleton } from '@/features/dashboard/meetings/components/meetings-page-skeleton';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
export default function MeetingsLoading() {
    return (<div className={DASHBOARD_THEME.layout.container}>
      <MeetingsPageSkeleton />
    </div>);
}
