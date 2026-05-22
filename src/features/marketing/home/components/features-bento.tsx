import { FeaturesBentoReachColumn } from './features-bento-reach-column'
import { FeaturesBentoRevenueColumn } from './features-bento-revenue-column'
import { FeaturesBentoSpotlightColumn } from './features-bento-spotlight-column'

export function FeaturesBento() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <FeaturesBentoReachColumn />
      <FeaturesBentoRevenueColumn />
      <FeaturesBentoSpotlightColumn />
    </div>
  )
}
