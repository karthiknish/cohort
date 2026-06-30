import { createFileRoute } from '@tanstack/react-router'
import CreativePage from '@/features/dashboard/ads/campaigns/[providerId]/[campaignId]/creative/[creativeId]/page'

export const Route = createFileRoute(
  '/_authed/dashboard/ads/campaigns/$providerId/$campaignId/creative/$creativeId',
)({
  component: () => <CreativePage />,
})
