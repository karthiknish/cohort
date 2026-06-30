import { createFileRoute } from '@tanstack/react-router'
import CampaignInsightsPage from '@/features/dashboard/ads/campaigns/[providerId]/[campaignId]/page'

export const Route = createFileRoute(
  '/_authed/dashboard/ads/campaigns/$providerId/$campaignId',
)({
  component: () => <CampaignInsightsPage />,
})
