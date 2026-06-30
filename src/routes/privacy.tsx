import { createFileRoute } from '@tanstack/react-router'
import PrivacyPageClient from '@/features/marketing/privacy/page.client'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy Policy | Cohorts' },
      {
        name: 'description',
        content: 'Learn how Cohorts collects, uses, and protects your information.',
      },
    ],
  }),
  component: () => <PrivacyPageClient />,
})
