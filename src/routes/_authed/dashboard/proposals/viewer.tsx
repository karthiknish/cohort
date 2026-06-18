import { createFileRoute } from '@tanstack/react-router'
import ProposalsViewerPage from '@/features/dashboard/proposals/viewer/page'

export const Route = createFileRoute('/_authed/dashboard/proposals/viewer')({
  head: () => ({
    meta: [{ title: 'Proposal Viewer | Cohorts' }],
  }),
  component: () => <ProposalsViewerPage />,
})
