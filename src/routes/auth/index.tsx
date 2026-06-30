import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import AuthPageClient from '@/features/auth/page.client'
import { getToken } from '@/lib/auth-server'

const checkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const token = await getToken()
  return { isAuthenticated: !!token }
})

export const Route = createFileRoute('/auth/')({
  beforeLoad: async () => {
    // On client navigation, skip SSR auth check — client auth handles it
    if (typeof document !== 'undefined') return

    const { isAuthenticated } = await checkAuth()
    if (isAuthenticated) {
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
