'use client';
import { PageMotionShell } from '@/shared/components/page-motion-shell';
import { ProjectsPageProvider } from './components/projects-page-provider';
import { ProjectsPageShell } from './components/projects-page-shell';
export default function ProjectsPage() {
    return (<PageMotionShell reveal={false}>
      <ProjectsPageProvider>
        <ProjectsPageShell />
      </ProjectsPageProvider>
    </PageMotionShell>);
}
