import { createFileRoute } from '@tanstack/react-router'
import AdsPage from '@/features/dashboard/ads/page'

export const Route = createFileRoute('/_authed/dashboard/ads/')({
  head: () => ({
    meta: [{ title: 'Ads | Cohorts' }],
  }),
  component: () => <AdsPage />,
})
