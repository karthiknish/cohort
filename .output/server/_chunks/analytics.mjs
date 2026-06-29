import { r as __exportAll } from "../_runtime.mjs";
import { n as da } from "../_libs/posthog-js.mjs";
//#region src/lib/analytics.ts
var analytics_exports = /* @__PURE__ */ __exportAll({
	logAnalyticsEvent: () => logAnalyticsEvent,
	logPageView: () => logPageView,
	setAnalyticsUserId: () => setAnalyticsUserId
});
function getGtag() {
	if (typeof window === "undefined") return null;
	if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return null;
	return typeof window.gtag === "function" ? window.gtag : null;
}
async function logAnalyticsEvent(eventName, parameters) {
	if (typeof window === "undefined") return;
	da.capture(eventName, parameters);
	const gtag = getGtag();
	if (gtag) gtag("event", eventName, parameters);
}
async function logPageView(path, parameters) {
	if (typeof window === "undefined") return;
	const location = window.location.href;
	const defaultParams = {
		page_path: path,
		page_location: location
	};
	da.capture("$pageview", {
		...defaultParams,
		...parameters
	});
	const gtag = getGtag();
	const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
	if (gtag && measurementId) gtag("config", measurementId, {
		page_path: path,
		page_location: location,
		...parameters
	});
}
async function setAnalyticsUserId(userId) {
	if (typeof window === "undefined") return;
	if (userId) da.identify(userId);
	else da.reset();
	const gtag = getGtag();
	if (gtag) gtag("set", "user_id", { user_id: userId ?? void 0 });
}
//#endregion
export { logPageView as n, setAnalyticsUserId as r, analytics_exports as t };
