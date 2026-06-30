'use client';

import { PageMotionShell } from '@/shared/components/page-motion-shell';
import { ProjectsPageProvider } from './components/projects-page-provider';
import { ProjectsDashboard } from './components/projects-dashboard';

export default function ProjectsPage() {
  return (
    <PageMotionShell reveal={false}>
      <ProjectsPageProvider>
        <ProjectsDashboard />
      </ProjectsPageProvider>
    </PageMotionShell>
  );
}
