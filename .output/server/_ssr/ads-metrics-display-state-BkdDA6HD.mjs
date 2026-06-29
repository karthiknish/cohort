//#region node_modules/.nitro/vite/services/ssr/assets/ads-metrics-display-state-BkdDA6HD.js
function resolveAdsMetricsDisplayState({ metricsLoading, connectedAccountCount, hasSuccessfulSync, hasMetricData }) {
	if (metricsLoading) return "loading";
	if (connectedAccountCount <= 0) return "needs_connection";
	if (hasMetricData) return "has_delivery";
	if (hasSuccessfulSync) return "synced_no_delivery";
	return "needs_sync";
}
var ADS_METRICS_EMPTY_COPY = {
	needs_connection: {
		title: "Connect an ad platform",
		description: "Link Google, Meta, LinkedIn, or TikTok above, then run a sync to populate spend, delivery, and conversion KPIs.",
		actionLabel: "Connect an account",
		actionHref: "#connect-ad-platforms"
	},
	needs_sync: {
		title: "Ready to sync",
		description: "Your ad account is connected. Run a sync to pull spend, impressions, and clicks for the date range in the header.",
		actionLabel: "Run sync",
		actionHref: "#connect-ad-platforms"
	},
	synced_no_delivery: {
		title: "No ad activity in this period",
		description: "This account synced successfully, but Meta returned no spend or delivery for the selected dates. The account may be paused, dormant, or had no live campaigns during this window. Try widening the date range or confirm campaigns are active in Ads Manager.",
		actionLabel: "Widen date range",
		actionHref: "#connect-ad-platforms"
	}
};
function adsMetricsEmptyCopy(state) {
	return ADS_METRICS_EMPTY_COPY[state];
}
//#endregion
export { resolveAdsMetricsDisplayState as n, adsMetricsEmptyCopy as t };
