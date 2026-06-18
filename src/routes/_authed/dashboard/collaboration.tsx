import { createFileRoute } from '@tanstack/react-router'
import CollaborationPage from '@/features/dashboard/collaboration/page'

export const Route = createFileRoute('/_authed/dashboard/collaboration')({
  head: () => ({
    meta: [{ title: 'Collaboration | Cohorts' }],
  }),
  component: () => <CollaborationPage />,
})
