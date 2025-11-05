/**
 * Feature Flags Configuration
 * 
 * Phase 1 Navigation Enhancements
 * - BREADCRUMBS: Mobile-responsive navigation breadcrumbs
 * - BIDIRECTIONAL_NAV: Reverse navigation from tasks/collaboration to projects
 * - NAVIGATION_PERSISTENCE: localStorage for remembering context per client
 */

export const FEATURES = {
  BREADCRUMBS: process.env.NEXT_PUBLIC_FEATURE_BREADCRUMBS === 'true',
  BIDIRECTIONAL_NAV: process.env.NEXT_PUBLIC_FEATURE_BIDIRECTIONAL_NAV === 'true',
  NAVIGATION_PERSISTENCE: process.env.NEXT_PUBLIC_FEATURE_NAVIGATION_PERSISTENCE === 'true',
  ACTIVITY_WIDGET: process.env.NEXT_PUBLIC_FEATURE_ACTIVITY_WIDGET === 'true',
} as const

export type FeatureName = keyof typeof FEATURES

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: FeatureName): boolean {
  return FEATURES[feature]
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): FeatureName[] {
  return Object.entries(FEATURES)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name as FeatureName)
}

/**
 * Feature flag debugging helper
 */
export function debugFeatures(): void {
  if (process.env.NODE_ENV === 'development') {
    console.table(FEATURES)
    console.log('Enabled features:', getEnabledFeatures())
  }
}
