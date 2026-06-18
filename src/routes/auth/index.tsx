import { createFileRoute } from '@tanstack/react-router'
import AuthPageClient from '@/features/auth/page.client'

export const Route = createFileRoute('/auth/')({
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
