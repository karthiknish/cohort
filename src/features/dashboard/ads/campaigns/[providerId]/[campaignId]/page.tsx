'use client';
import { Suspense, createElement } from 'react';
import { CampaignInsightsPageContent, } from '../../components/campaign-insights-page-sections';
import { DirectionalPageTransition, RevealTransition, RevealTransitionFallback } from '@/shared/ui/page-transition';
const campaignInsightsSuspenseFallback = createElement('div', {
    className: 'min-h-[320px] rounded-xl border border-muted/50 bg-muted/20',
    'aria-busy': 'true',
});
const campaignInsightsRevealFallback = (<RevealTransitionFallback>{campaignInsightsSuspenseFallback}</RevealTransitionFallback>);
export default function CampaignInsightsPage() {
    return (<DirectionalPageTransition>
      <Suspense fallback={campaignInsightsRevealFallback}>
        <RevealTransition>
          <CampaignInsightsPageContent />
        </RevealTransition>
      </Suspense>
    </DirectionalPageTransition>);
}
