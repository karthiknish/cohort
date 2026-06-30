import { createFileRoute } from '@tanstack/react-router'
import AdminIssuesPage from '@/features/admin/issues/page'

export const Route = createFileRoute('/_authed/admin/issues')({
  head: () => ({
    meta: [{ title: 'Admin Issues | Cohorts' }],
  }),
  component: () => <AdminIssuesPage />,
})
