import { createFileRoute } from '@tanstack/react-router'
import AdminClientsPage from '@/features/admin/clients/page'

export const Route = createFileRoute('/_authed/admin/clients')({
  head: () => ({
    meta: [{ title: 'Admin Clients | Cohorts' }],
  }),
  component: () => <AdminClientsPage />,
})
