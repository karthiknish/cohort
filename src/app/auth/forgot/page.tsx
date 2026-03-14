import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Request a password reset link for your Cohort account.',
}

export { default } from '@/features/auth/forgot/page'
