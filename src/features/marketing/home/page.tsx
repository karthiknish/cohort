import type { Metadata } from 'next'

import { marketingHomeMetadata } from '@/features/marketing/lib/marketing-home-metadata'
import HomePageClient from './page.client'

export const metadata: Metadata = marketingHomeMetadata

export default function HomePage() {
  return <HomePageClient />
}
