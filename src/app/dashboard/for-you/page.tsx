import type { Metadata } from 'next'

import ForYouPageClient from '@/features/marketing/for-you/page.client'

export const metadata: Metadata = {
  title: 'For You | Cohorts',
  description: 'Review your activity feed, client work, meeting momentum, and dashboard priorities in one place.',
}

export default function DashboardForYouPage() {
  return <ForYouPageClient />
}
