import { createFileRoute, redirect } from '@tanstack/react-router'
import AuthPageClient from '@/features/auth/page.client'
import { getServerRequest } from '@/lib/server-request.server'
import { hasValidSession } from '@/lib/auth-session.server'

export const Route = createFileRoute('/auth/')({
  beforeLoad: async () => {
    let request: Request | undefined
    try {
      request = getServerRequest()
    } catch {
      // SPA navigation — no server request; client auth handles protection
      return
    }
    if (await hasValidSession(request)) {
      throw redirect({ to: '/for-you' })
    }
  },
  head: () => ({
    meta: [
      { title: 'Sign In | Cohorts' },
      {
        name: 'description',
        content:
          'Sign in or create your Cohorts workspace to manage campaigns, proposals, collaboration, and analytics.',
      },
    ],
  }),
  component: () => <AuthPageClient />,
})
