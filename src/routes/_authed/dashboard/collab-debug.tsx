import { createFileRoute } from '@tanstack/react-router'
import CollabDebugPage from '@/features/dashboard/collaboration/debug-page'

export const Route = createFileRoute('/_authed/dashboard/collab-debug')({
  head: () => ({ meta: [{ title: 'Collab Debug' }] }),
  component: () => <CollabDebugPage />,
})
