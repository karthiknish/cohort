import { CampaignInsightsPageSkeleton } from '@/features/dashboard/ads/campaigns/components/campaign-insights-page-skeleton';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
export default function CampaignInsightsLoading() {
    return (<div className={DASHBOARD_THEME.layout.container}>
      <CampaignInsightsPageSkeleton />
    </div>);
}
