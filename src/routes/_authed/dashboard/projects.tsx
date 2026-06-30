import { createFileRoute } from '@tanstack/react-router'
import ProjectsPage from '@/features/dashboard/projects-v2/page'

export const Route = createFileRoute('/_authed/dashboard/projects')({
  validateSearch: (search: Record<string, unknown>) => ({
    projectId: typeof search.projectId === 'string' ? search.projectId : undefined,
    projectName: typeof search.projectName === 'string' ? search.projectName : undefined,
  }),
  head: () => ({
    meta: [{ title: 'Projects | Cohorts' }],
  }),
  component: () => <ProjectsPage />,
})
