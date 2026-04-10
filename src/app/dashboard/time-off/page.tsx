import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Time Off | Cohorts',
  description: 'Time-off requests and approvals inside Cohorts.',
}

export { default } from '@/features/dashboard/time-off/page'
