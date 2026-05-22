import {
  FeaturesBentoAudienceSegmentsCard,
  FeaturesBentoCampaignReachCard,
  FeaturesBentoClientPerformanceCard,
  FeaturesBentoClientSpotlightCard,
  FeaturesBentoLiveActivityCard,
  FeaturesBentoRevenueGoalsCard,
} from './features-bento-sections'

export function FeaturesBento() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <div className="flex flex-col gap-6">
        <FeaturesBentoCampaignReachCard />
        <FeaturesBentoAudienceSegmentsCard />
      </div>

      <div className="flex h-full flex-col gap-6">
        <FeaturesBentoRevenueGoalsCard />
        <FeaturesBentoClientPerformanceCard />
      </div>

      <div className="flex flex-col gap-6 md:max-xl:col-span-2">
        <FeaturesBentoClientSpotlightCard />
        <FeaturesBentoLiveActivityCard />
      </div>
    </div>
  )
}
