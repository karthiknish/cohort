import { createFileRoute } from '@tanstack/react-router'
import ProjectsDebugPage from '@/features/dashboard/projects-v2/debug-page'

export const Route = createFileRoute('/_authed/dashboard/projects-debug')({
  head: () => ({ meta: [{ title: 'Projects Debug' }] }),
  component: () => <ProjectsDebugPage />,
})
