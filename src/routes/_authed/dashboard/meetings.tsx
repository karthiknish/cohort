import { createFileRoute } from '@tanstack/react-router'
import MeetingsPage from '@/features/dashboard/meetings/page'

export const Route = createFileRoute('/_authed/dashboard/meetings')({
  validateSearch: (search: Record<string, unknown>) => ({
    room: typeof search.room === 'string' ? search.room : undefined,
    oauth_success: typeof search.oauth_success === 'string' ? search.oauth_success : undefined,
    oauth_error: typeof search.oauth_error === 'string' ? search.oauth_error : undefined,
    provider: typeof search.provider === 'string' ? search.provider : undefined,
    message: typeof search.message === 'string' ? search.message : undefined,
  }),
  head: () => ({
    meta: [{ title: 'Meetings | Cohorts' }],
  }),
  component: () => <MeetingsPage />,
})
