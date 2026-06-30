import { createFileRoute } from '@tanstack/react-router'
import AnalyticsPage from '@/features/dashboard/analytics/page'

export const Route = createFileRoute('/_authed/dashboard/analytics')({
  head: () => ({
    meta: [{ title: 'Analytics | Cohorts' }],
  }),
  component: () => <AnalyticsPage />,
})
