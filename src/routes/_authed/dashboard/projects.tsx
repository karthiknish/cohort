import { createFileRoute } from '@tanstack/react-router'
import ProjectsPage from '@/features/dashboard/projects/page'

export const Route = createFileRoute('/_authed/dashboard/projects')({
  head: () => ({
    meta: [{ title: 'Projects | Cohorts' }],
  }),
  component: () => <ProjectsPage />,
})
