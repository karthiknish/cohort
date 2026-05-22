import {
  FeaturesBentoAudienceSegmentsCard,
  FeaturesBentoCampaignReachCard,
} from './features-bento-sections'

export function FeaturesBentoReachColumn() {
  return (
    <div className="flex flex-col gap-6">
      <FeaturesBentoCampaignReachCard />
      <FeaturesBentoAudienceSegmentsCard />
    </div>
  )
}
