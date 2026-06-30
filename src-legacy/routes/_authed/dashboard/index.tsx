import { createFileRoute } from '@tanstack/react-router'
import DashboardOverviewPage from '@/features/dashboard/home/page'

export const Route = createFileRoute('/_authed/dashboard/')({
  head: () => ({
    meta: [{ title: 'Dashboard | Cohorts' }],
  }),
  component: () => <DashboardOverviewPage />,
})
