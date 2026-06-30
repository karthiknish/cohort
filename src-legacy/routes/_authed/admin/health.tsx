import { createFileRoute } from '@tanstack/react-router'
import AdminHealthPage from '@/features/admin/health/page'

export const Route = createFileRoute('/_authed/admin/health')({
  head: () => ({
    meta: [{ title: 'Admin Health | Cohorts' }],
  }),
  component: () => <AdminHealthPage />,
})
