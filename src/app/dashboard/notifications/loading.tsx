import { NotificationsLoadingSkeleton } from '@/features/dashboard/notifications/notifications-page-sections';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
export default function NotificationsLoading() {
    return (<div className={DASHBOARD_THEME.layout.container}>
      <NotificationsLoadingSkeleton />
    </div>);
}
