import { createFileRoute } from '@tanstack/react-router'
import AdminUsersPage from '@/features/admin/users/page'

export const Route = createFileRoute('/_authed/admin/users')({
  head: () => ({
    meta: [{ title: 'Admin Users | Cohorts' }],
  }),
  component: () => <AdminUsersPage />,
})
