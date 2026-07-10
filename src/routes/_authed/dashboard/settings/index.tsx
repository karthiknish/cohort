import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/dashboard/settings/')({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: '/settings',
      search: {
        tab: new URLSearchParams(location.search).get('tab') ?? undefined,
      },
    })
  },
})
