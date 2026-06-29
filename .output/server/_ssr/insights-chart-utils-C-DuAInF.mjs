import { ot as normalizeCurrencyCode } from "./preview-data-CXkRNfsX.mjs";
import { u as formatCurrency } from "./utils-hh4sibN0.mjs";
import { i as normalizeProviderId } from "./themes-DBvmOGm7.mjs";
import { h as normalizeAdsProviderId } from "./ad-algorithms-CKFe3XXP.mjs";
import { r as formatAggregatedMoney, t as aggregateMetricFinancials } from "./aggregate-financials-Cj14Bj_Z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/insights-chart-utils-C-DuAInF.js
var EMPTY_TOTALS = {
	spend: 0,
	impressions: 0,
	clicks: 0,
	conversions: 0,
	revenue: 0
};
function totalsHaveDeliveryActivity(totals) {
	return totals.spend > 0 || totals.impressions > 0 || totals.clicks > 0 || totals.conversions > 0;
}
/** Sum server summary to connected (and optionally selected) providers only. */
function totalsFromServerSummary(summary, connectedIds, selectedProviderIds = []) {
	if (!summary) return null;
	const providers = summary.providers ?? {};
	const providerKeys = Object.keys(providers);
	const selected = new Set(selectedProviderIds.map((id) => normalizeAdsProviderId(id) ?? id));
	const connected = new Set(connectedIds);
	const keysToSum = (() => {
		if (selected.size > 0) return providerKeys.filter((key) => selected.has(normalizeAdsProviderId(key) ?? key));
		if (connected.size > 0) return providerKeys.filter((key) => {
			const canonical = normalizeAdsProviderId(key);
			return canonical !== null && connected.has(canonical);
		});
		return providerKeys;
	})();
	if (keysToSum.length === 0) {
		if (connected.size === 0 && selected.size === 0 && summary.totals) return summary.totals;
		return null;
	}
	return keysToSum.reduce((acc, key) => {
		const row = providers[key];
		if (!row) return acc;
		acc.spend += Number(row.spend ?? 0);
		acc.impressions += Number(row.impressions ?? 0);
		acc.clicks += Number(row.clicks ?? 0);
		acc.conversions += Number(row.conversions ?? 0);
		acc.revenue += Number(row.revenue ?? 0);
		return acc;
	}, { ...EMPTY_TOTALS });
}
/** Prefer daily rows; fall back to one synthetic row from server summary for KPI cards. */
function metricsForOverviewDisplay(dailyMetrics, summary, connectedIds, selectedProviderIds, defaultCurrency) {
	if (dailyMetrics.length > 0) return dailyMetrics;
	const totals = totalsFromServerSummary(summary, connectedIds, selectedProviderIds);
	if (!totals || !totalsHaveDeliveryActivity(totals)) return [];
	return [{
		id: "overview-summary",
		providerId: (selectedProviderIds[0] ? normalizeAdsProviderId(selectedProviderIds[0]) : null) ?? connectedIds[0] ?? "unknown",
		date: "summary",
		spend: totals.spend,
		impressions: totals.impressions,
		clicks: totals.clicks,
		conversions: totals.conversions,
		revenue: totals.revenue,
		currency: defaultCurrency ?? null
	}];
}
function buildCanonicalConnectedIds(rawIds) {
	const ids = rawIds.flatMap((id) => {
		const normalized = normalizeAdsProviderId(id);
		return normalized !== null ? [normalized] : [];
	});
	return [...new Set(ids)].toSorted();
}
function filterMetricsToConnected(metrics, connectedIds) {
	if (connectedIds.length === 0) return metrics;
	const connected = new Set(connectedIds);
	return metrics.filter((metric) => {
		const canonical = normalizeAdsProviderId(metric.providerId);
		return canonical !== null && connected.has(canonical);
	});
}
function filterMetricsByProviders(metrics, selectedProviderIds) {
	if (selectedProviderIds.length === 0) return metrics;
	const selected = new Set(selectedProviderIds.map((id) => normalizeAdsProviderId(id) ?? id));
	return metrics.filter((metric) => {
		const canonical = normalizeAdsProviderId(metric.providerId) ?? metric.providerId;
		return selected.has(canonical);
	});
}
function metricRowsForAggregation(metrics) {
	return metrics.map((metric) => ({
		spend: metric.spend,
		revenue: metric.revenue,
		currency: metric.currency,
		impressions: metric.impressions,
		clicks: metric.clicks,
		conversions: metric.conversions
	}));
}
function computeCtrParts(clicks, impressions) {
	if (impressions <= 0) return {
		rate: 0,
		clicksExceedImpressions: false
	};
	const raw = clicks / impressions;
	return {
		rate: Math.min(raw, 1),
		clicksExceedImpressions: clicks > impressions
	};
}
function buildCrossChannelSummaryCards(metrics, displayState = "has_delivery") {
	const aggregate = aggregateMetricFinancials(metricRowsForAggregation(metrics));
	const delivery = aggregate.deliveryTotals;
	const financial = aggregate.financialTotals;
	const spend = financial.spend ?? 0;
	const revenue = financial.revenue ?? 0;
	const fmtMoney = (amount) => formatAggregatedMoney(amount, financial, formatCurrency);
	const hasDeliveryData = metrics.length > 0 && (delivery.impressions > 0 || delivery.clicks > 0 || spend > 0 || delivery.conversions > 0);
	const showSyncedEmptyState = displayState === "synced_no_delivery";
	const showNeedsSyncState = displayState === "needs_sync";
	const showNeedsConnectionState = displayState === "needs_connection";
	const hasData = hasDeliveryData || showSyncedEmptyState;
	const { rate: ctr, clicksExceedImpressions } = computeCtrParts(delivery.clicks, delivery.impressions);
	const averageCpc = delivery.clicks > 0 && spend > 0 ? spend / delivery.clicks : 0;
	const roas = spend > 0 && revenue > 0 ? revenue / spend : 0;
	const conversionRate = delivery.clicks > 0 ? delivery.conversions / delivery.clicks : 0;
	const cpa = delivery.conversions > 0 && spend > 0 ? spend / delivery.conversions : 0;
	const spendHelper = (() => {
		if (showSyncedEmptyState) return "No spend recorded in this date range — campaigns may be paused or inactive";
		if (showNeedsSyncState) return "Run a sync to pull spend for the selected date range";
		if (showNeedsConnectionState) return "Connect a platform to populate";
		if (hasDeliveryData) return metrics.length > 1 || metrics[0]?.date !== "summary" ? "Connected platforms in this date range" : "Totals from your latest sync — run sync again for daily trends";
		return "Connect a platform to populate";
	})();
	const impressionsHelper = (() => {
		if (showSyncedEmptyState) return "Account synced, but no impressions were returned for these dates";
		if (showNeedsSyncState) return "Run a sync to populate delivery metrics";
		if (showNeedsConnectionState) return "Awaiting your first sync";
		return hasDeliveryData ? "Total times ads were served" : "Awaiting your first sync";
	})();
	return {
		cards: [
			{
				id: "spend",
				label: "Total Spend",
				value: spend > 0 ? fmtMoney(spend) : showSyncedEmptyState ? fmtMoney(0) : hasData ? fmtMoney(0) : "—",
				helper: spendHelper
			},
			{
				id: "impressions",
				label: "Impressions",
				value: delivery.impressions > 0 ? delivery.impressions.toLocaleString() : showSyncedEmptyState ? "0" : "—",
				helper: impressionsHelper
			},
			{
				id: "ctr",
				label: "CTR",
				value: ctr > 0 ? `${(ctr * 100).toFixed(2)}%` : showSyncedEmptyState ? "0.00%" : "—",
				helper: clicksExceedImpressions ? "Clicks exceed impressions in synced data — CTR capped at 100%" : ctr > 0 ? "Clicks ÷ impressions" : showSyncedEmptyState ? "No clicks or impressions in this date range" : "Needs impressions and clicks data"
			},
			{
				id: "avg-cpc",
				label: "Avg CPC",
				value: delivery.clicks > 0 && spend > 0 ? fmtMoney(averageCpc) : showSyncedEmptyState ? fmtMoney(0) : "—",
				helper: delivery.clicks > 0 ? "What each click cost on average" : showSyncedEmptyState ? "No clicks recorded in this date range" : "Need click data to calculate"
			},
			{
				id: "cpa",
				label: "CPA",
				value: cpa > 0 ? fmtMoney(cpa) : showSyncedEmptyState ? "—" : "—",
				helper: cpa > 0 ? "Spend ÷ conversions (lower is better)" : showSyncedEmptyState ? "No conversions recorded in this date range" : "Needs spend and conversions data"
			},
			{
				id: "conv-rate",
				label: "Conv. Rate",
				value: conversionRate > 0 ? `${(conversionRate * 100).toFixed(2)}%` : showSyncedEmptyState ? "0.00%" : "—",
				helper: conversionRate > 0 ? "Conversions ÷ clicks" : showSyncedEmptyState ? "No conversions in this date range" : "Needs clicks and conversions data"
			},
			{
				id: "roas",
				label: "ROAS",
				value: roas > 0 ? `${roas.toFixed(2)}x` : showSyncedEmptyState ? "0.00x" : "—",
				helper: roas > 0 ? "Revenue ÷ spend (higher is better)" : showSyncedEmptyState ? "No attributed revenue in this date range" : "Needs revenue and spend data"
			}
		],
		chartCurrency: financial.comparability === "single_currency" && financial.primaryCurrency ? financial.primaryCurrency : void 0
	};
}
var PROVIDER_DISPLAY_NAMES = {
	google: "Google Ads",
	facebook: "Meta Ads",
	meta: "Meta Ads",
	linkedin: "LinkedIn Ads",
	tiktok: "TikTok Ads",
	all: "All platforms"
};
function getProviderDisplayName(providerId) {
	return PROVIDER_DISPLAY_NAMES[providerId.toLowerCase()] ?? providerId.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
/** Resolve display currency for insights charts from provider map and selection. */
function resolveInsightsChartCurrency(selectedProvider, fallbackCurrency, providerCurrencyMap) {
	if (selectedProvider !== "all") {
		const providerCurrency = providerCurrencyMap[normalizeAdsProviderId(selectedProvider) ?? selectedProvider];
		return normalizeCurrencyCode(providerCurrency ?? fallbackCurrency);
	}
	const currencies = [...new Set(Object.values(providerCurrencyMap).filter(Boolean))];
	if (currencies.length === 1) return normalizeCurrencyCode(currencies[0]);
	if (currencies.length > 1) return normalizeCurrencyCode(fallbackCurrency);
	return normalizeCurrencyCode(fallbackCurrency);
}
/** Per-provider currency from synced metric rows (same rules as cross-channel overview). */
function buildProviderCurrencyMapFromMetrics(metrics) {
	const rowsByProvider = /* @__PURE__ */ new Map();
	for (const metric of metrics) {
		const key = normalizeAdsProviderId(metric.providerId) ?? metric.providerId;
		const rows = rowsByProvider.get(key) ?? [];
		rows.push(metric);
		rowsByProvider.set(key, rows);
	}
	const map = {};
	for (const [providerId, rows] of rowsByProvider) {
		const { financialTotals } = aggregateMetricFinancials(metricRowsForAggregation(rows));
		if (financialTotals.comparability === "single_currency" && financialTotals.primaryCurrency) map[providerId] = financialTotals.primaryCurrency;
	}
	return map;
}
/** Global display currency from processed metric rows when V2 summary is incomplete. */
function resolveCurrencyFromProcessedMetrics(metrics) {
	const { financialTotals } = aggregateMetricFinancials(metricRowsForAggregation(metrics));
	return financialTotals.comparability === "single_currency" ? financialTotals.primaryCurrency : null;
}
/**
* Resolve a display currency for ads KPI surfaces (custom insights, formula builder, etc.).
* Returns undefined when currency cannot be determined — never invents USD.
*/
function resolveAdsDisplayCurrency(fallbackCurrency, metrics, providerCurrencyMap = {}) {
	if (typeof fallbackCurrency === "string" && fallbackCurrency.trim().length > 0) return normalizeCurrencyCode(fallbackCurrency);
	const fromMetrics = resolveCurrencyFromProcessedMetrics(metrics);
	if (fromMetrics) return fromMetrics;
	const currencies = [...new Set(Object.values(providerCurrencyMap).filter(Boolean))];
	if (currencies.length === 1) return normalizeCurrencyCode(currencies[0]);
}
/** Map UI selection to chart-data keys (handles meta/facebook aliases and "all"). */
function resolveChartProviderKey(selected, chartKeys) {
	if (selected === "all") {
		if (chartKeys.includes("all")) return "all";
		return chartKeys[0] ?? "all";
	}
	const normalized = normalizeProviderId(selected);
	if (chartKeys.includes(normalized)) return normalized;
	for (const key of chartKeys) if (normalizeProviderId(key) === normalized) return key;
	return chartKeys[0] ?? normalized;
}
function providerSummariesToSyntheticMetrics(summaries) {
	const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0] ?? "";
	return Object.entries(summaries).flatMap(([providerId, totals], index) => totals.impressions > 0 || totals.spend > 0 || totals.clicks > 0 ? [{
		id: `summary-${providerId}-${index}`,
		providerId: normalizeProviderId(providerId),
		date: today,
		spend: totals.spend,
		impressions: totals.impressions,
		clicks: totals.clicks,
		conversions: totals.conversions,
		revenue: totals.revenue
	}] : []);
}
function pickDefaultInsightsTab(chartData) {
	if (!chartData) return "comparison";
	if (chartData.providerComparison.some((p) => p.metrics.spend > 0 || p.metrics.revenue > 0)) return "comparison";
	if (Object.values(chartData.funnelCharts).some((stages) => stages.some((s) => s.value > 0))) return "funnel";
	if (Object.values(chartData.trendCharts).some((rows) => rows.length > 1)) return "trends";
	if (Object.values(chartData.efficiencyBreakdown).some((rows) => rows.length > 0)) return "efficiency";
	if (Object.values(chartData.benchmarkCharts).some((rows) => rows.length > 0)) return "benchmarks";
	return "funnel";
}
function tabHasChartData(tab, chartData, providerKey) {
	switch (tab) {
		case "comparison": return chartData.providerComparison.some((p) => p.metrics.spend > 0 || p.metrics.revenue > 0);
		case "funnel": {
			const stages = chartData.funnelCharts[providerKey];
			return Boolean(stages?.some((s) => s.value > 0));
		}
		case "trends": return (chartData.trendCharts[providerKey]?.length ?? 0) > 1;
		case "efficiency": return (chartData.efficiencyBreakdown[providerKey]?.length ?? 0) > 0;
		case "benchmarks": return (chartData.benchmarkCharts[providerKey]?.length ?? 0) > 0;
		default: return false;
	}
}
//#endregion
export { filterMetricsToConnected as a, pickDefaultInsightsTab as c, resolveChartProviderKey as d, resolveCurrencyFromProcessedMetrics as f, totalsHaveDeliveryActivity as g, totalsFromServerSummary as h, filterMetricsByProviders as i, providerSummariesToSyntheticMetrics as l, tabHasChartData as m, buildCrossChannelSummaryCards as n, getProviderDisplayName as o, resolveInsightsChartCurrency as p, buildProviderCurrencyMapFromMetrics as r, metricsForOverviewDisplay as s, buildCanonicalConnectedIds as t, resolveAdsDisplayCurrency as u };
