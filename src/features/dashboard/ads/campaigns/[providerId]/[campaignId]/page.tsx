'use client'

import { Suspense, createElement } from 'react'

import { CampaignHeader } from '../../components/campaign-header'
import {
  ADS_PAGE_THEME,
  CampaignInsightsErrorBanner,
  CampaignInsightsPageBody,
  useCampaignInsightsPage,
} from '../../components/campaign-insights-page-sections'
import { DirectionalPageTransition, RevealTransition, RevealTransitionFallback } from '@/shared/ui/page-transition'

const campaignInsightsSuspenseFallback = createElement('div', {
  className: 'min-h-[320px] rounded-xl border border-muted/50 bg-muted/20',
  'aria-busy': 'true',
})
const campaignInsightsRevealFallback = (
  <RevealTransitionFallback>{campaignInsightsSuspenseFallback}</RevealTransitionFallback>
)

function CampaignInsightsPageContent() {
  const page = useCampaignInsightsPage()

  return (
    <div className={ADS_PAGE_THEME.innerContainer}>
      <CampaignHeader
        campaign={page.campaign}
        loading={page.campaignLoading}
        dateRange={page.dateRange}
        onDateRangeChange={page.handleDateRangeChange}
        onRefresh={page.loadInsights}
        refreshing={page.insightsLoading}
      />

      {page.campaignError && !page.isPreviewMode ? (
        <CampaignInsightsErrorBanner
          message={page.campaignError}
          onRetry={page.handleRetryCampaign}
        />
      ) : null}

      <CampaignInsightsPageBody page={page} />
    </div>
  )
}

export default function CampaignInsightsPage() {
  return (
    <DirectionalPageTransition>
      <Suspense fallback={campaignInsightsRevealFallback}>
        <RevealTransition>
          <CampaignInsightsPageContent />
        </RevealTransition>
      </Suspense>
    </DirectionalPageTransition>
  )
}
