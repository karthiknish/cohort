import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your Cohort account.',
}

export { default } from '@/features/auth/reset/page'
