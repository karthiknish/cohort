import { createFileRoute } from '@tanstack/react-router'
import NotificationsPage from '@/features/dashboard/notifications/page'

export const Route = createFileRoute('/_authed/dashboard/notifications')({
  head: () => ({
    meta: [{ title: 'Notifications | Cohorts' }],
  }),
  component: () => <NotificationsPage />,
})
