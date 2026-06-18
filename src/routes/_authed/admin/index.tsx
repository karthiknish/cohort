import { createFileRoute } from '@tanstack/react-router'
import AdminOverviewPage from '@/features/admin/home/page'

export const Route = createFileRoute('/_authed/admin/')({
  head: () => ({
    meta: [{ title: 'Admin | Cohorts' }],
  }),
  component: () => <AdminOverviewPage />,
})
