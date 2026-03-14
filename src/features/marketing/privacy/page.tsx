import type { Metadata } from 'next'
import PrivacyPageClient from './page.client'

export const metadata: Metadata = {
  title: 'Privacy Policy | Cohorts',
  description: 'Learn how Cohorts collects, uses, and protects your information.',
}

export default function PrivacyPage() {
  return <PrivacyPageClient />
}
