//#region node_modules/.nitro/vite/services/ssr/assets/features-DXQ1HU1z.js
/**
* Feature Flags Configuration
*
* Phase 1 Navigation Enhancements
* - BREADCRUMBS: Mobile-responsive navigation breadcrumbs
* - BIDIRECTIONAL_NAV: Reverse navigation from tasks/collaboration to projects
* - NAVIGATION_PERSISTENCE: localStorage for remembering context per client
*/
var FEATURES = {
	BREADCRUMBS: process.env.NEXT_PUBLIC_FEATURE_BREADCRUMBS !== "false",
	BIDIRECTIONAL_NAV: process.env.NEXT_PUBLIC_FEATURE_BIDIRECTIONAL_NAV !== "false",
	NAVIGATION_PERSISTENCE: process.env.NEXT_PUBLIC_FEATURE_NAVIGATION_PERSISTENCE !== "false",
	ACTIVITY_WIDGET: process.env.NEXT_PUBLIC_FEATURE_ACTIVITY_WIDGET === "true"
};
/**
* Check if a feature is enabled
*/
function isFeatureEnabled(feature) {
	return FEATURES[feature];
}
//#endregion
export { isFeatureEnabled as t };
