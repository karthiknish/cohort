import type { Metadata } from 'next'
import ForgotPasswordPageClient from './page.client'

export const metadata: Metadata = {
  title: 'Forgot Password | Cohorts',
  description: 'Request a secure password reset link for your Cohorts account.',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />
}


