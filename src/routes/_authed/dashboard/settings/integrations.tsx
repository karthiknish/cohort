import { createFileRoute, redirect } from '@tanstack/react-router'

/** Legacy path used in integration alert emails — ads is where reconnect lives. */
export const Route = createFileRoute('/_authed/dashboard/settings/integrations')({
  beforeLoad: () => {
    throw redirect({ to: '/dashboard/ads' })
  },
})
