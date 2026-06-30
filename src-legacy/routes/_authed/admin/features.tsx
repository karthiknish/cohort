import { createFileRoute } from '@tanstack/react-router'
import AdminFeaturesPage from '@/features/admin/features/page'

export const Route = createFileRoute('/_authed/admin/features')({
  head: () => ({
    meta: [{ title: 'Admin Features | Cohorts' }],
  }),
  component: () => <AdminFeaturesPage />,
})
