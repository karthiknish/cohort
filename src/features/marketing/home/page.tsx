import type { Metadata } from 'next'
import HomePageClient from './page.client'

export const metadata: Metadata = {
  title: 'Cohorts | Agency Operations Platform',
  description: 'Manage campaigns, clients, proposals, collaboration, and analytics from one AI-native workspace.',
}

export default function HomePage() {
  return <HomePageClient />
}
