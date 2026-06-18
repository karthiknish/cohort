import { createFileRoute } from '@tanstack/react-router'
import MeetingsPage from '@/features/dashboard/meetings/page'

export const Route = createFileRoute('/_authed/dashboard/meetings')({
  head: () => ({
    meta: [{ title: 'Meetings | Cohorts' }],
  }),
  component: () => <MeetingsPage />,
})
