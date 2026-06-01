import { TasksPageSkeleton } from '@/features/dashboard/tasks/tasks-page-skeleton';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
export default function TasksLoading() {
    return (<div className={DASHBOARD_THEME.layout.container}>
      <TasksPageSkeleton />
    </div>);
}
