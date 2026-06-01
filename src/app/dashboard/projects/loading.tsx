import { ProjectsPageSkeleton } from '@/features/dashboard/projects/components/projects-page-skeleton';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
export default function ProjectsLoading() {
    return (<div className={DASHBOARD_THEME.layout.container}>
      <ProjectsPageSkeleton />
    </div>);
}
