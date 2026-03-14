import type { Metadata } from 'next'
import ResetPasswordPageClient from './page.client'

export const metadata: Metadata = {
  title: 'Reset Password | Cohorts',
  description: 'Set a new password for your Cohorts account using a secure reset link.',
}

export default function ResetPasswordPage() {
  return <ResetPasswordPageClient />
}
