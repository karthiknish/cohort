import type { Metadata } from 'next'

import ForYouPageClient from './page.client'

export const metadata: Metadata = {
  title: 'For You | Cohorts',
  description: 'Review your activity feed, client work, meeting momentum, and dashboard priorities in one place.',
}

export default function ForYouPage() {
  return <ForYouPageClient />
}
