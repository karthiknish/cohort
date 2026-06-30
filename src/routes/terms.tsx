import { createFileRoute } from '@tanstack/react-router'
import TermsPageClient from '@/features/marketing/terms/page.client'

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [
      { title: 'Terms of Service | Cohorts' },
      {
        name: 'description',
        content: 'Terms of service for the Cohort platform.',
      },
    ],
  }),
  component: () => <TermsPageClient />,
})
