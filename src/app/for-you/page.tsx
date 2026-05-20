import type { Metadata } from 'next'

import ForYouPageClient from '@/features/marketing/for-you/page.client'

export const metadata: Metadata = {
  title: 'For You | Cohorts',
  description: 'Your workspace summary — meetings, tasks, clients, and what needs attention first.',
  robots: { index: false, follow: false },
}

export default function ForYouPage() {
  return <ForYouPageClient />
}
