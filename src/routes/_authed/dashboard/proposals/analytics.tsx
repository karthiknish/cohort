import { createFileRoute } from '@tanstack/react-router'
import ProposalsAnalyticsPage from '@/features/dashboard/proposals/analytics/page'

export const Route = createFileRoute('/_authed/dashboard/proposals/analytics')({
  head: () => ({
    meta: [{ title: 'Proposals Analytics | Cohorts' }],
  }),
  component: () => <ProposalsAnalyticsPage />,
})
