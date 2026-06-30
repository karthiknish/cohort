import { createFileRoute } from '@tanstack/react-router'
import AdminTeamPage from '@/features/admin/team/page'

export const Route = createFileRoute('/_authed/admin/team')({
  head: () => ({
    meta: [{ title: 'Admin Team | Cohorts' }],
  }),
  component: () => <AdminTeamPage />,
})
