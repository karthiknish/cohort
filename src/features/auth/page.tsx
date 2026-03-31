import type { Metadata } from 'next'

import AuthPageClient from './page.client'

export const metadata: Metadata = {
  title: 'Sign In | Cohorts',
  description: 'Sign in or create your Cohorts workspace to manage campaigns, proposals, collaboration, and analytics.',
}

export default function AuthPage() {
  return <AuthPageClient />
}