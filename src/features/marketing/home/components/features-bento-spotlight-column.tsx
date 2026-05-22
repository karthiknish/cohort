import {
  FeaturesBentoClientSpotlightCard,
  FeaturesBentoLiveActivityCard,
} from './features-bento-sections'

export function FeaturesBentoSpotlightColumn() {
  return (
    <div className="flex flex-col gap-6 md:max-xl:col-span-2">
      <FeaturesBentoClientSpotlightCard />
      <FeaturesBentoLiveActivityCard />
    </div>
  )
}
