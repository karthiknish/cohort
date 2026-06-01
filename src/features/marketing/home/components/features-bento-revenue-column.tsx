import { FeaturesBentoClientPerformanceCard, FeaturesBentoRevenueGoalsCard, } from './features-bento-sections';
export function FeaturesBentoRevenueColumn() {
    return (<div className="flex h-full flex-col gap-6">
      <FeaturesBentoRevenueGoalsCard />
      <FeaturesBentoClientPerformanceCard />
    </div>);
}
