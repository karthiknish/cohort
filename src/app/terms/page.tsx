import type { Metadata } from 'next'
import TermsPageClient from './page.client'

export const metadata: Metadata = {
  title: 'Terms of Service | Cohorts',
  description: 'Read the terms and conditions for using the Cohorts platform.',
}

export default function TermsPage() {
  return <TermsPageClient />
}
