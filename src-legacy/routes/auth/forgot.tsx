import { createFileRoute } from '@tanstack/react-router'
import ForgotPasswordPageClient from '@/features/auth/forgot/page.client'

export const Route = createFileRoute('/auth/forgot')({
  head: () => ({
    meta: [
      { title: 'Forgot Password | Cohorts' },
      { name: 'description', content: 'Reset your Cohorts account password.' },
    ],
  }),
  component: () => <ForgotPasswordPageClient />,
})
