import { createFileRoute } from '@tanstack/react-router'
import ProposalsPage from '@/features/dashboard/proposals/page'

export const Route = createFileRoute('/_authed/dashboard/proposals/')({
  head: () => ({
    meta: [{ title: 'Proposals | Cohorts' }],
  }),
  component: () => <ProposalsPage />,
})
