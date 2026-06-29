import { c as cn } from "./utils-hh4sibN0.mjs";
import { g as formatDistanceToNow } from "../_libs/date-fns.mjs";
import "./themes-DBvmOGm7.mjs";
import { r as createSvglBrandIcon } from "./svgl-brand-logo-rIFZzPiw.mjs";
import { i as PROVIDER_COLORS, r as GRAYS, t as CHART_COLORS } from "./colors-DH3BrJD1.mjs";
import { t as DASHBOARD_THEME } from "./dashboard-theme-DM5oBGdY.mjs";
import { c as generateAudienceInsights, d as generateEfficiencyInsights, f as generateFunnelInsights, l as generateBenchmarkInsights, m as getEfficiencyBreakdown, o as combineInsights, p as generateTrendInsights, s as enrichSummaryWithMetrics, u as generateCreativeInsights } from "./insights-D9NfALlV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ad-algorithms-CKFe3XXP.js
var CANONICAL_IDS = new Set([
	"google",
	"facebook",
	"linkedin",
	"tiktok"
]);
/**
* All known provider aliases → canonical id.
* google-analytics variants are intentionally excluded: GA is not an ads provider.
*/
var PROVIDER_ALIASES = {
	google_ads: "google",
	"google-ads": "google",
	googleads: "google",
	adwords: "google",
	meta: "facebook",
	meta_ads: "facebook",
	"meta-ads": "facebook",
	metaads: "facebook",
	facebook_ads: "facebook",
	"facebook-ads": "facebook",
	linkedin_ads: "linkedin",
	"linkedin-ads": "linkedin",
	tiktok_ads: "tiktok",
	"tiktok-ads": "tiktok"
};
/**
* Non-ads provider aliases that must NOT be resolved to an ads provider id.
* These strings map to google-analytics in the theme layer but are not ad networks.
*/
var NON_ADS_ALIASES = new Set([
	"google_analytics",
	"google-analytics",
	"googleanalytics",
	"ga",
	"ga4"
]);
/**
* Canonicalize a raw provider string to a CanonicalAdsProviderId.
* Returns null for unknown or non-ads providers (e.g. google-analytics).
*/
function normalizeAdsProviderId(raw) {
	const normalized = String(raw ?? "").trim().toLowerCase();
	if (!normalized || NON_ADS_ALIASES.has(normalized)) return null;
	if (CANONICAL_IDS.has(normalized)) return normalized;
	return PROVIDER_ALIASES[normalized] ?? null;
}
/**
* Returns true when raw resolves to a known ads provider.
*/
function isCanonicalAdsProvider(raw) {
	return normalizeAdsProviderId(raw) !== null;
}
var FREQUENCY_OPTIONS = [
	{
		label: "Every 1 hour",
		value: 60
	},
	{
		label: "Every 3 hours",
		value: 180
	},
	{
		label: "Every 6 hours",
		value: 360
	},
	{
		label: "Every 12 hours",
		value: 720
	},
	{
		label: "Once per day",
		value: 1440
	}
];
var TIMEFRAME_OPTIONS = [
	{
		label: "Past day",
		value: 1
	},
	{
		label: "Past 3 days",
		value: 3
	},
	{
		label: "Past week",
		value: 7
	},
	{
		label: "Past 14 days",
		value: 14
	},
	{
		label: "Past 30 days",
		value: 30
	},
	{
		label: "Past 90 days",
		value: 90
	}
];
/** Provider marks from https://svgl.app (see /public/svgl). */
var PROVIDER_ICON_MAP = {
	google: createSvglBrandIcon("google"),
	facebook: createSvglBrandIcon("meta"),
	meta: createSvglBrandIcon("meta"),
	linkedin: createSvglBrandIcon("linkedin"),
	tiktok: createSvglBrandIcon("tiktok")
};
function getProviderIcon(providerId) {
	return PROVIDER_ICON_MAP[normalizeAdsProviderId(providerId) ?? providerId];
}
var DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric"
});
var ADS_WORKFLOW_STEPS = [
	{
		title: "Connect your ad accounts",
		description: "Hook up Google, Meta, LinkedIn, or TikTok so Cohorts can pull spend and performance data."
	},
	{
		title: "Enable auto-sync",
		description: "Turn on automatic syncs to keep campaign metrics and reports fresh without manual exports."
	},
	{
		title: "Review cross-channel insights",
		description: "Use the overview cards and tables below to compare performance and spot optimisation wins."
	}
];
var ADS_CONVEX_PROVIDER_IDS = new Set([
	"google",
	"facebook",
	"linkedin",
	"tiktok",
	"meta"
]);
function toAdsProviderId(providerId) {
	if (providerId === "meta") return "facebook";
	if (ADS_CONVEX_PROVIDER_IDS.has(providerId)) return providerId;
	throw new Error(`Unsupported ads provider: ${providerId}`);
}
function normalizeFrequency(value) {
	if (typeof value === "number" && Number.isFinite(value)) return Math.min(Math.max(Math.round(value), FREQUENCY_OPTIONS[0].value), FREQUENCY_OPTIONS.at(-1)?.value ?? 1440);
	return 360;
}
function normalizeTimeframe(value) {
	if (typeof value === "number" && Number.isFinite(value)) return Math.min(Math.max(Math.round(value), TIMEFRAME_OPTIONS[0].value), TIMEFRAME_OPTIONS.at(-1)?.value ?? 7);
	return 7;
}
function formatRelativeTimestamp(iso) {
	if (!iso) return "Never synced";
	const parsed = new Date(iso);
	if (Number.isNaN(parsed.getTime())) return "Unknown";
	return `${formatDistanceToNow(parsed, { addSuffix: true })}`;
}
function getStatusBadgeVariant(status) {
	switch (status) {
		case "success": return "default";
		case "pending": return "secondary";
		case "error": return "destructive";
		default: return "outline";
	}
}
function getStatusLabel(status) {
	switch (status) {
		case "success": return "Healthy";
		case "pending": return "In progress";
		case "error": return "Failed";
		case "never": return "Not run yet";
		default: return status.charAt(0).toUpperCase() + status.slice(1);
	}
}
function describeFrequency(minutes) {
	const match = FREQUENCY_OPTIONS.find((option) => option.value === minutes);
	if (match) return match.label;
	if (minutes % 1440 === 0) {
		const days = minutes / 1440;
		return days === 1 ? "Once per day" : `Every ${days} days`;
	}
	if (minutes % 60 === 0) {
		const hours = minutes / 60;
		return hours === 1 ? "Every hour" : `Every ${hours} hours`;
	}
	return `Every ${minutes} minutes`;
}
function describeTimeframe(days) {
	const match = TIMEFRAME_OPTIONS.find((option) => option.value === days);
	if (match) return match.label.replace("Past", "Last");
	if (days === 1) return "Last day";
	if (days === 7) return "Last 7 days";
	return `Last ${days} days`;
}
function formatDisplayDate(value) {
	if (value === "summary") return "Period total";
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;
	return DISPLAY_DATE_FORMATTER.format(parsed);
}
/** Paid-media workspace — command-center surfaces aligned with dashboard tokens. */
var ADS_PAGE_THEME = {
	hero: DASHBOARD_THEME.pageHero,
	heroGlow: DASHBOARD_THEME.pageHeroGlow,
	sectionEyebrow: DASHBOARD_THEME.sectionEyebrow,
	sectionTitle: "text-lg font-semibold tracking-tight text-foreground",
	sectionDescription: DASHBOARD_THEME.sectionDescription,
	surfaceCard: cn(DASHBOARD_THEME.cards.base, "overflow-hidden border-border/60 shadow-sm ring-1 ring-border/30"),
	surfaceCardHighlight: cn("overflow-hidden rounded-2xl border border-primary/15", "bg-linear-to-br from-primary/[0.05] via-card to-background", "shadow-sm ring-1 ring-primary/10"),
	kpiTile: cn("rounded-2xl border border-border/60 bg-card/90 p-5", "shadow-sm transition-[border-color,box-shadow] hover:border-primary/20 hover:shadow-md", "motion-reduce:transition-none"),
	kpiLabel: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
	kpiValue: "text-2xl font-semibold tracking-tight tabular-nums text-foreground",
	providerTile: cn("relative overflow-hidden rounded-2xl border border-border/60 bg-card/95", "shadow-sm transition-[border-color,box-shadow,opacity]", "hover:shadow-md motion-reduce:transition-none"),
	emptyState: cn("flex flex-col items-center justify-center gap-4 rounded-2xl", "border border-dashed border-border/70 bg-muted/15 p-10 text-center"),
	mobileTabs: "inline-flex h-auto w-full flex-nowrap items-stretch gap-1 rounded-xl bg-muted/40 p-1",
	mobileTabTrigger: "min-w-0 flex-1 gap-1.5 rounded-lg px-2 text-xs sm:px-3 sm:text-sm data-[state=active]:shadow-sm",
	advancedPanel: cn("overflow-hidden rounded-2xl border border-border/60", "bg-card/50 shadow-sm ring-1 ring-border/30"),
	/** Campaign & creative detail routes */
	innerContainer: "mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-20 pt-2 sm:px-6",
	stickyTabBar: cn("sticky top-0 z-10 -mx-4 border-b border-border/50 bg-background/90 px-4 py-3", "backdrop-blur-md supports-backdrop-filter:bg-background/75 sm:-mx-6 sm:px-6"),
	innerHero: cn("relative overflow-hidden rounded-2xl border border-border/50", "bg-linear-to-br from-primary/[0.06] via-card/90 to-info/[0.04]", "p-5 sm:px-6 sm:py-6", "shadow-sm ring-1 ring-border/40"),
	innerHeroGlow: "pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-primary/10 blur-3xl",
	chartCard: cn("overflow-hidden rounded-2xl border border-border/60 bg-card/95", "shadow-sm ring-1 ring-border/30"),
	chartCardHeader: "border-b border-border/50 pb-4",
	sectionBlock: "space-y-5",
	sectionHeader: "space-y-1 border-b border-border/50 pb-4",
	/** Campaign budget / audience control panels */
	controlHeaderIcon: cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", "bg-linear-to-br from-primary/15 via-primary/8 to-transparent", "ring-1 ring-primary/20 shadow-sm"),
	controlPreviewBanner: cn("flex items-start gap-3 rounded-xl border border-warning/25", "bg-warning/6 px-4 py-3 text-sm text-muted-foreground"),
	controlHighlightTile: cn("relative overflow-hidden rounded-2xl border border-primary/15", "bg-linear-to-br from-primary/[0.08] via-card to-card/80", "px-5 py-4 shadow-sm ring-1 ring-primary/10"),
	controlFormPanel: cn("rounded-2xl border border-border/60 bg-muted/15 p-5", "ring-1 ring-border/30"),
	controlStatChip: cn("inline-flex min-w-0 flex-col gap-0.5 rounded-xl border border-border/50", "bg-card/80 px-3 py-2 shadow-sm"),
	controlStatChipLabel: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
	controlStatChipValue: "text-sm font-semibold tabular-nums text-foreground",
	controlMapFrame: cn("overflow-hidden rounded-2xl border border-border/60", "bg-linear-to-b from-muted/30 to-card shadow-inner ring-1 ring-border/40"),
	controlCollapsibleTrigger: cn("flex w-full items-center justify-between gap-3 rounded-xl border border-border/60", "bg-card/60 px-4 py-3 text-left shadow-sm transition-colors", "hover:border-primary/25 hover:bg-card", "motion-reduce:transition-none"),
	controlCollapsibleBody: cn("rounded-xl border border-border/50 bg-muted/10 p-4", "ring-1 ring-border/20"),
	controlSectionLabel: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"
};
/**
* Calculate linear regression for trend analysis
*/
function linearRegression(points) {
	const n = points.length;
	if (n < 2) return {
		slope: 0,
		intercept: points[0] || 0,
		r2: 0
	};
	let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
	for (let i = 0; i < n; i++) {
		sumX += i;
		sumY += points[i];
		sumXY += i * points[i];
		sumX2 += i * i;
	}
	const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
	const intercept = (sumY - slope * sumX) / n;
	const yMean = sumY / n;
	let ssRes = 0, ssTot = 0;
	for (let i = 0; i < n; i++) {
		const predicted = intercept + slope * i;
		ssRes += (points[i] - predicted) ** 2;
		ssTot += (points[i] - yMean) ** 2;
	}
	return {
		slope,
		intercept,
		r2: ssTot > 0 ? 1 - ssRes / ssTot : 0
	};
}
/**
* Calculate exponential moving average
*/
function exponentialMovingAverage(points, alpha = .3) {
	if (points.length === 0) return [];
	const ema = [points[0]];
	for (let i = 1; i < points.length; i++) ema.push(alpha * points[i] + (1 - alpha) * ema[i - 1]);
	return ema;
}
/**
* Calculate momentum (weighted recent trend strength)
*/
function calculateMomentum(points) {
	if (points.length < 3) return 50;
	const recentCount = Math.min(7, Math.floor(points.length / 2));
	const recent = points.slice(-recentCount);
	const older = points.slice(0, -recentCount);
	const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
	const olderAvg = older.length > 0 ? older.reduce((s, v) => s + v, 0) / older.length : recentAvg;
	if (olderAvg === 0) return 50;
	const change = (recentAvg - olderAvg) / olderAvg;
	return Math.round(Math.min(100, Math.max(0, 50 + change * 100)));
}
/**
* Detect anomalies using z-score
*/
function detectAnomalies(points, threshold = 2) {
	if (points.length < 5) return [];
	const values = points.map((p) => p.value);
	const mean = values.reduce((s, v) => s + v, 0) / values.length;
	const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length);
	if (stdDev === 0) return [];
	const anomalies = [];
	for (const point of points) {
		const zScore = (point.value - mean) / stdDev;
		if (Math.abs(zScore) > threshold) anomalies.push({
			date: point.date,
			value: point.value,
			expectedValue: mean,
			deviation: zScore,
			severity: Math.abs(zScore) > 3 ? "high" : Math.abs(zScore) > 2.5 ? "medium" : "low"
		});
	}
	return anomalies;
}
/**
* Detect seasonality (weekly patterns)
*/
function detectSeasonality(points) {
	if (points.length < 14) return false;
	const byDayOfWeek = {};
	for (const point of points) {
		const day = new Date(point.date).getDay();
		if (!byDayOfWeek[day]) byDayOfWeek[day] = [];
		byDayOfWeek[day].push(point.value);
	}
	const allValues = points.map((p) => p.value);
	const overallMean = allValues.reduce((s, v) => s + v, 0) / allValues.length;
	const overallVar = allValues.reduce((s, v) => s + (v - overallMean) ** 2, 0) / allValues.length;
	let withinDayVar = 0;
	let dayCount = 0;
	for (const values of Object.values(byDayOfWeek)) {
		if (values.length < 2) continue;
		const dayMean = values.reduce((s, v) => s + v, 0) / values.length;
		withinDayVar += values.reduce((s, v) => s + (v - dayMean) ** 2, 0);
		dayCount += values.length;
	}
	withinDayVar /= dayCount;
	return overallVar > 0 && withinDayVar / overallVar < .6;
}
/**
* Analyze trend for a specific metric
*/
function analyzeTrend(dataPoints, metricKey) {
	const points = dataPoints.toSorted((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((d) => ({
		date: d.date,
		value: d[metricKey]
	}));
	const values = points.map((p) => p.value);
	if (values.length < 2) return {
		metric: metricKey,
		direction: "stable",
		velocity: 0,
		acceleration: 0,
		momentum: 50,
		forecast7Day: values[0] || 0,
		confidence: 0,
		seasonalityDetected: false,
		anomalies: []
	};
	const { slope, intercept, r2 } = linearRegression(values);
	const direction = slope > .01 ? "up" : slope < -.01 ? "down" : "stable";
	const firstHalf = values.slice(0, Math.floor(values.length / 2));
	const secondHalf = values.slice(Math.floor(values.length / 2));
	const firstSlope = linearRegression(firstHalf).slope;
	const acceleration = linearRegression(secondHalf).slope - firstSlope;
	const momentum = calculateMomentum(values);
	const forecast7Day = intercept + slope * (values.length + 7);
	const anomalies = detectAnomalies(points);
	const seasonalityDetected = detectSeasonality(points);
	return {
		metric: metricKey,
		direction,
		velocity: slope,
		acceleration,
		momentum,
		forecast7Day: Math.max(0, forecast7Day),
		confidence: Math.min(1, Math.max(0, r2)),
		seasonalityDetected,
		anomalies
	};
}
/**
* Analyze multiple metrics and return comprehensive trend data
*/
function analyzeAllTrends(dataPoints) {
	const metrics = [
		"spend",
		"revenue",
		"clicks",
		"conversions",
		"impressions"
	];
	const results = {};
	for (const metric of metrics) results[metric] = analyzeTrend(dataPoints, metric);
	if (dataPoints.length > 0) {
		const roasPoints = dataPoints.map((d) => ({
			date: d.date,
			value: d.spend > 0 ? d.revenue / d.spend : 0
		}));
		results["roas"] = {
			...analyzeTrend(dataPoints, "revenue"),
			metric: "roas",
			forecast7Day: roasPoints.length > 0 ? roasPoints[roasPoints.length - 1].value : 0
		};
	}
	return results;
}
/**
* Get trend chart data for visualization
*/
function getTrendChartData(dataPoints, metricKey) {
	const sorted = dataPoints.toSorted((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
	const values = sorted.map((d) => {
		if (metricKey === "roas") return d.spend > 0 ? d.revenue / d.spend : 0;
		return d[metricKey];
	});
	const { slope, intercept } = linearRegression(values);
	const ema = exponentialMovingAverage(values);
	return sorted.map((d, i) => {
		const actual = values[i] ?? 0;
		return {
			date: d.date,
			actual,
			trend: ema[i] ?? actual,
			forecast: i === sorted.length - 1 ? intercept + slope * (i + 7) : void 0
		};
	});
}
/**
* Build funnel analysis from metrics summary
*/
function analyzeFunnel(summary) {
	const { totalImpressions, totalClicks, totalConversions, totalSpend } = summary;
	const stageValues = [
		{
			name: "Impressions",
			value: totalImpressions
		},
		{
			name: "Clicks",
			value: totalClicks
		},
		{
			name: "Conversions",
			value: totalConversions
		}
	];
	const stages = stageValues.map((stage, index) => {
		const previousValue = index === 0 ? stage.value : stageValues[index - 1].value;
		const dropOffRate = previousValue > 0 ? 1 - stage.value / previousValue : 0;
		const costPerStage = stage.value > 0 ? totalSpend / stage.value : 0;
		return {
			name: stage.name,
			value: stage.value,
			percentage: totalImpressions > 0 ? stage.value / totalImpressions * 100 : 0,
			dropOffRate: dropOffRate * 100,
			costPerStage
		};
	});
	let bottleneckStage = null;
	let biggestDropOff = null;
	let maxDropOff = 0;
	for (let i = 1; i < stages.length; i++) if (stages[i].dropOffRate > maxDropOff) {
		maxDropOff = stages[i].dropOffRate;
		bottleneckStage = stages[i].name;
		biggestDropOff = {
			stage: stages[i].name,
			rate: stages[i].dropOffRate
		};
	}
	const overallConversionRate = totalImpressions > 0 ? totalConversions / totalImpressions * 100 : 0;
	const recommendations = generateFunnelRecommendations(stages, summary);
	return {
		stages,
		overallConversionRate,
		bottleneckStage,
		biggestDropOff,
		recommendations
	};
}
/**
* Generate actionable recommendations based on funnel analysis
*/
function generateFunnelRecommendations(stages, summary) {
	const recommendations = [];
	const ctr = summary.totalImpressions > 0 ? summary.totalClicks / summary.totalImpressions * 100 : 0;
	const convRate = summary.totalClicks > 0 ? summary.totalConversions / summary.totalClicks * 100 : 0;
	if (ctr < .5) recommendations.push("Your CTR is very low (<0.5%). Consider refreshing ad creatives, improving headlines, or refining audience targeting.");
	else if (ctr < 1) recommendations.push("CTR is below average. Test different ad formats, images, or copy variations to improve engagement.");
	if (convRate < 1 && summary.totalClicks > 100) recommendations.push("Conversion rate is low despite traffic. Audit your landing page for load speed, mobile responsiveness, and clear CTAs.");
	else if (convRate < 2 && summary.totalClicks > 500) recommendations.push("Consider A/B testing landing page elements like headlines, form length, and trust signals to improve conversions.");
	const cpa = summary.totalConversions > 0 ? summary.totalSpend / summary.totalConversions : 0;
	if (cpa > 100 && summary.totalConversions > 0) recommendations.push(`Your CPA ($${cpa.toFixed(2)}) is high. Consider narrowing audience targeting or implementing lookalike audiences.`);
	const clickStage = stages.find((s) => s.name === "Clicks");
	if (clickStage && clickStage.dropOffRate > 98) recommendations.push("Impressions to clicks drop-off is severe. Your ad creative may not be resonating with your audience.");
	const conversionStage = stages.find((s) => s.name === "Conversions");
	if (conversionStage && conversionStage.dropOffRate > 95) recommendations.push("High drop-off from clicks to conversions suggests a disconnect between ad promise and landing page experience.");
	if (recommendations.length === 0) recommendations.push("Your funnel is performing well. Focus on scaling spend while monitoring efficiency metrics.");
	return recommendations;
}
/**
* Get funnel chart data for visualization
*/
function getFunnelChartData(analysis) {
	const colors = [
		CHART_COLORS.primary[0],
		CHART_COLORS.primary[1],
		CHART_COLORS.primary[3]
	];
	return analysis.stages.map((stage, index) => ({
		name: stage.name,
		value: stage.value,
		fill: colors[index] || GRAYS[500],
		dropOff: stage.dropOffRate
	}));
}
/**
* Industry benchmarks by platform (based on 2024 industry averages)
* These can be customized per industry/vertical
*/
var PLATFORM_BENCHMARKS = {
	google: {
		providerId: "google",
		ctr: 3.17,
		cpc: 2.69,
		conversionRate: 4.4,
		cpa: 56.11,
		roas: 2,
		cpm: 3.12
	},
	facebook: {
		providerId: "facebook",
		ctr: .9,
		cpc: 1.72,
		conversionRate: 9.21,
		cpa: 18.68,
		roas: 2.5,
		cpm: 11.54
	},
	meta: {
		providerId: "meta",
		ctr: .9,
		cpc: 1.72,
		conversionRate: 9.21,
		cpa: 18.68,
		roas: 2.5,
		cpm: 11.54
	},
	linkedin: {
		providerId: "linkedin",
		ctr: .44,
		cpc: 5.58,
		conversionRate: 6.1,
		cpa: 91.52,
		roas: 1.5,
		cpm: 6.59
	},
	tiktok: {
		providerId: "tiktok",
		ctr: .84,
		cpc: 1,
		conversionRate: 7.5,
		cpa: 13.33,
		roas: 2,
		cpm: 10
	}
};
/**
* Default benchmark for unknown platforms
*/
var DEFAULT_BENCHMARK = {
	providerId: "default",
	ctr: 1,
	cpc: 2,
	conversionRate: 5,
	cpa: 40,
	roas: 2,
	cpm: 8
};
/**
* Get benchmark for a specific platform
*/
function getBenchmarkForPlatform(providerId) {
	return PLATFORM_BENCHMARKS[providerId.toLowerCase()] || DEFAULT_BENCHMARK;
}
/**
* Calculate percentile position (0-100)
*/
function calculatePercentile(value, benchmark, higherIsBetter = true) {
	if (benchmark === 0) return 50;
	const ratio = value / benchmark;
	if (higherIsBetter) {
		if (ratio < .5) return Math.round(ratio * 50);
		if (ratio < 1) return Math.round(25 + (ratio - .5) * 50);
		if (ratio < 2) return Math.round(50 + (ratio - 1) * 40);
		return Math.min(99, Math.round(90 + (ratio - 2) * 5));
	} else {
		if (ratio > 2) return Math.round(1 / ratio * 25);
		if (ratio > 1) return Math.round(25 + (2 - ratio) * 25);
		if (ratio > .5) return Math.round(50 + (1 - ratio) * 40);
		return Math.min(99, Math.round(90 + (.5 - ratio) * 20));
	}
}
/**
* Determine status based on percentile
*/
function getStatusFromPercentile(percentile) {
	if (percentile < 25) return "below";
	if (percentile < 50) return "average";
	if (percentile < 75) return "above";
	return "excellent";
}
/**
* Compare a single metric against benchmark
*/
function compareToBenchmark(metricName, value, benchmark, higherIsBetter = true) {
	const percentile = calculatePercentile(value, benchmark, higherIsBetter);
	const gap = value - benchmark;
	const gapPercent = benchmark !== 0 ? gap / benchmark * 100 : 0;
	return {
		metric: metricName,
		currentValue: value,
		benchmarkValue: benchmark,
		percentile,
		status: getStatusFromPercentile(percentile),
		gap: higherIsBetter ? gap : -gap,
		gapPercent: higherIsBetter ? gapPercent : -gapPercent
	};
}
/**
* Run comprehensive benchmark comparison for a provider
*/
function runBenchmarkAnalysis(summary) {
	const benchmark = getBenchmarkForPlatform(summary.providerId);
	const { totalSpend, totalClicks, totalConversions, totalImpressions, averageRoaS, averageCpc } = summary;
	const ctr = totalImpressions > 0 ? totalClicks / totalImpressions * 100 : 0;
	const convRate = totalClicks > 0 ? totalConversions / totalClicks * 100 : 0;
	const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
	const cpm = totalImpressions > 0 ? totalSpend / totalImpressions * 1e3 : 0;
	return [
		compareToBenchmark("ROAS", averageRoaS, benchmark.roas, true),
		compareToBenchmark("CTR", ctr, benchmark.ctr, true),
		compareToBenchmark("CPC", averageCpc, benchmark.cpc, false),
		compareToBenchmark("Conv Rate", convRate, benchmark.conversionRate, true),
		compareToBenchmark("CPA", cpa, benchmark.cpa, false),
		compareToBenchmark("CPM", cpm, benchmark.cpm, false)
	];
}
/**
* Get benchmark chart data for visualization
*/
function getBenchmarkChartData(comparisons) {
	return comparisons.map((c) => ({
		metric: c.metric,
		current: c.currentValue,
		benchmark: c.benchmarkValue,
		percentile: c.percentile
	}));
}
/**
* Calculate overall benchmark score
*/
function calculateBenchmarkScore(comparisons) {
	if (comparisons.length === 0) return 50;
	const avgPercentile = comparisons.reduce((sum, c) => sum + c.percentile, 0) / comparisons.length;
	return Math.round(avgPercentile);
}
/**
* Calculate optimal budget allocation across platforms
*/
function calculateOptimalAllocation(summaries, strategy = "balanced", totalBudget) {
	if (summaries.length === 0) return [];
	const enriched = summaries.map(enrichSummaryWithMetrics);
	const currentTotal = enriched.reduce((sum, s) => sum + s.totalSpend, 0);
	const budget = totalBudget ?? currentTotal;
	if (budget === 0) return [];
	const scored = enriched.map((summary) => {
		let score;
		switch (strategy) {
			case "maximize_roas":
				score = summary.averageRoaS * 100;
				break;
			case "maximize_volume":
				score = summary.cpa > 0 ? 100 / summary.cpa * 10 : 0;
				break;
			case "growth":
				score = summary.efficiencyScore * .5 + summary.growthPotential * .5;
				break;
			default:
				score = summary.efficiencyScore * .6 + summary.averageRoaS * 10 * .4;
				break;
		}
		return {
			summary,
			score
		};
	});
	const totalScore = scored.reduce((sum, s) => sum + Math.max(0, s.score), 0);
	if (totalScore === 0) {
		const equalShare = budget / summaries.length;
		return enriched.map((s) => ({
			providerId: s.providerId,
			currentSpend: s.totalSpend,
			recommendedSpend: equalShare,
			changePercent: s.totalSpend > 0 ? (equalShare - s.totalSpend) / s.totalSpend * 100 : 0,
			reason: "Equal distribution (insufficient data for optimization)",
			expectedRoasChange: 0
		}));
	}
	return scored.map(({ summary, score }) => {
		const recommendedSpend = budget * (score / totalScore);
		const change = recommendedSpend - summary.totalSpend;
		const changePercent = summary.totalSpend > 0 ? change / summary.totalSpend * 100 : 0;
		const expectedRoasChange = changePercent > 0 ? Math.max(-10, -changePercent * .1) : Math.min(15, -changePercent * .15);
		const reason = generateAllocationReason(summary, changePercent, strategy);
		return {
			providerId: summary.providerId,
			currentSpend: summary.totalSpend,
			recommendedSpend,
			changePercent,
			reason,
			expectedRoasChange
		};
	});
}
/**
* Generate human-readable reason for allocation change
*/
function generateAllocationReason(summary, changePercent, strategy) {
	const direction = changePercent > 5 ? "Increase" : changePercent < -5 ? "Decrease" : "Maintain";
	const platformName = formatProviderName(summary.providerId);
	if (direction === "Maintain") return `Current ${platformName} allocation is optimal.`;
	switch (strategy) {
		case "maximize_roas": return changePercent > 0 ? `${platformName} shows ${summary.averageRoaS.toFixed(1)}x ROAS - above average performance.` : `${platformName} ROAS (${summary.averageRoaS.toFixed(1)}x) underperforms - reallocate to higher performers.`;
		case "maximize_volume": return changePercent > 0 ? `${platformName} has efficient CPA ($${summary.cpa.toFixed(0)}) - good for volume scaling.` : `${platformName} CPA ($${summary.cpa.toFixed(0)}) too high for volume focus.`;
		case "growth": return changePercent > 0 ? `${platformName} shows ${summary.growthPotential}% growth potential.` : `${platformName} is near optimal - limited growth opportunity.`;
		default: return changePercent > 0 ? `${platformName} efficiency score (${summary.efficiencyScore}) justifies increased investment.` : `Reallocate from ${platformName} to better-performing channels.`;
	}
}
/**
* Format provider name for display
*/
function formatProviderName(providerId) {
	return {
		google: "Google Ads",
		facebook: "Meta Ads",
		meta: "Meta Ads",
		linkedin: "LinkedIn Ads",
		tiktok: "TikTok Ads"
	}[providerId.toLowerCase()] || providerId;
}
/**
* Generate budget-related insights
*/
function generateBudgetInsights(summaries) {
	if (summaries.length < 2) return [];
	const insights = [];
	const enriched = summaries.map(enrichSummaryWithMetrics);
	const sortedByRoas = enriched.toSorted((a, b) => b.averageRoaS - a.averageRoaS);
	const best = sortedByRoas[0];
	const worst = sortedByRoas[sortedByRoas.length - 1];
	if (best.averageRoaS > worst.averageRoaS * 1.5 && worst.totalSpend > 100) {
		const roasMultiple = (best.averageRoaS / worst.averageRoaS).toFixed(1);
		insights.push({
			id: "budget-reallocation-1",
			type: "budget",
			level: "info",
			category: "Cross-Platform Optimization",
			title: "Budget Reallocation Opportunity",
			message: `${formatProviderName(best.providerId)} outperforms ${formatProviderName(worst.providerId)} by ${roasMultiple}x in ROAS.`,
			suggestion: `Consider shifting 10-20% of budget from ${formatProviderName(worst.providerId)} to ${formatProviderName(best.providerId)}.`,
			impact: "high",
			effort: "low",
			metrics: {
				bestRoas: best.averageRoaS,
				worstRoas: worst.averageRoaS,
				potentialSavings: worst.totalSpend * .15
			},
			relatedProviders: [best.providerId, worst.providerId]
		});
	}
	const highEfficiency = enriched.filter((s) => s.efficiencyScore > 70);
	if (highEfficiency.length > 0) {
		const topPerformer = highEfficiency[0];
		insights.push({
			id: "budget-scale-1",
			type: "budget",
			level: "success",
			category: "Scaling Opportunity",
			title: "High-Efficiency Platform Detected",
			message: `${formatProviderName(topPerformer.providerId)} has an efficiency score of ${topPerformer.efficiencyScore}/100.`,
			suggestion: "This platform is a good candidate for budget scaling while monitoring efficiency metrics.",
			impact: "medium",
			effort: "low",
			metrics: {
				efficiencyScore: topPerformer.efficiencyScore,
				currentSpend: topPerformer.totalSpend
			},
			relatedProviders: [topPerformer.providerId]
		});
	}
	const highSpendLowRoas = enriched.filter((s) => s.totalSpend > 1e3 && s.averageRoaS < 1.5);
	for (const summary of highSpendLowRoas) insights.push({
		id: `budget-warning-${summary.providerId}`,
		type: "budget",
		level: "warning",
		category: "Efficiency Alert",
		title: "Potential Overspend Detected",
		message: `${formatProviderName(summary.providerId)} has $${summary.totalSpend.toFixed(0)} spend but only ${summary.averageRoaS.toFixed(1)}x ROAS.`,
		suggestion: "Consider reducing spend or pausing underperforming campaigns to improve efficiency.",
		impact: "high",
		effort: "medium",
		metrics: {
			spend: summary.totalSpend,
			roas: summary.averageRoaS,
			wastedSpend: summary.totalSpend * (1 - summary.averageRoaS)
		},
		relatedProviders: [summary.providerId]
	});
	return insights;
}
/**
* Calculate projected impact of budget changes
*/
function projectBudgetImpact(allocations, summaries) {
	let projectedRevenue = 0;
	let totalProjectedSpend = 0;
	const summariesByProviderId = new Map(summaries.map((summary) => [summary.providerId, summary]));
	for (const allocation of allocations) {
		const summary = summariesByProviderId.get(allocation.providerId);
		if (!summary) continue;
		const roasAdjustment = 1 + allocation.expectedRoasChange / 100;
		const adjustedRoas = summary.averageRoaS * roasAdjustment;
		projectedRevenue += allocation.recommendedSpend * adjustedRoas;
		totalProjectedSpend += allocation.recommendedSpend;
	}
	const currentRevenue = summaries.reduce((sum, s) => sum + s.totalRevenue, 0);
	const projectedRoas = totalProjectedSpend > 0 ? projectedRevenue / totalProjectedSpend : 0;
	return {
		projectedRevenue,
		projectedRoas,
		revenueChange: projectedRevenue - currentRevenue
	};
}
/**
* Build summary from metric data points
*/
function buildSummary(providerId, dataPoints, accountId) {
	const totals = dataPoints.reduce((acc, d) => ({
		spend: acc.spend + d.spend,
		revenue: acc.revenue + d.revenue,
		clicks: acc.clicks + d.clicks,
		conversions: acc.conversions + d.conversions,
		impressions: acc.impressions + d.impressions
	}), {
		spend: 0,
		revenue: 0,
		clicks: 0,
		conversions: 0,
		impressions: 0
	});
	const averageRoaS = totals.spend > 0 ? totals.revenue / totals.spend : 0;
	const averageCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
	const averageCtr = totals.impressions > 0 ? totals.clicks / totals.impressions * 100 : 0;
	const averageConvRate = totals.clicks > 0 ? totals.conversions / totals.clicks * 100 : 0;
	return {
		providerId,
		accountId,
		totalSpend: totals.spend,
		totalRevenue: totals.revenue,
		totalClicks: totals.clicks,
		totalConversions: totals.conversions,
		totalImpressions: totals.impressions,
		averageRoaS,
		averageCpc,
		averageCtr,
		averageConvRate,
		period: "analyzed",
		dayCount: new Set(dataPoints.map((d) => d.date)).size
	};
}
/**
* Main analysis function - analyzes all metrics and returns comprehensive results
*/
function analyzeAdPerformance(dataPoints) {
	const byProvider = /* @__PURE__ */ new Map();
	for (const point of dataPoints) {
		const existing = byProvider.get(point.providerId) || [];
		existing.push(point);
		byProvider.set(point.providerId, existing);
	}
	const summaries = Array.from(byProvider.keys()).map((providerId) => {
		return enrichSummaryWithMetrics(buildSummary(providerId, byProvider.get(providerId) || []));
	});
	const globalSummary = dataPoints.length > 0 ? enrichSummaryWithMetrics(buildSummary("all", dataPoints)) : null;
	const providerEfficiencyScores = {};
	for (const summary of summaries) providerEfficiencyScores[summary.providerId] = summary.efficiencyScore;
	const totalSpend = summaries.reduce((sum, s) => sum + s.totalSpend, 0);
	const globalEfficiencyScore = totalSpend > 0 ? Math.round(summaries.reduce((sum, s) => sum + s.efficiencyScore * s.totalSpend, 0) / totalSpend) : 0;
	const trends = {};
	for (const [providerId, points] of byProvider.entries()) trends[providerId] = analyzeAllTrends(points);
	const funnels = {};
	for (const summary of summaries) funnels[summary.providerId] = analyzeFunnel(summary);
	const benchmarks = {};
	const benchmarkScores = {};
	for (const summary of summaries) {
		benchmarks[summary.providerId] = runBenchmarkAnalysis(summary);
		benchmarkScores[summary.providerId] = calculateBenchmarkScore(benchmarks[summary.providerId]);
	}
	const allInsights = [];
	for (const summary of summaries) {
		allInsights.push(...generateEfficiencyInsights(summary));
		allInsights.push(...generateCreativeInsights(summary));
		allInsights.push(...generateAudienceInsights(summary));
		if (trends[summary.providerId]) allInsights.push(...generateTrendInsights(trends[summary.providerId], summary.providerId));
		if (funnels[summary.providerId]) allInsights.push(...generateFunnelInsights(funnels[summary.providerId], summary.providerId));
		if (benchmarks[summary.providerId]) allInsights.push(...generateBenchmarkInsights(benchmarks[summary.providerId], summary.providerId));
	}
	allInsights.push(...generateBudgetInsights(summaries));
	const insights = combineInsights(allInsights);
	const criticalInsightsCount = insights.filter((i) => i.level === "critical").length;
	const warningInsightsCount = insights.filter((i) => i.level === "warning").length;
	const budgetAllocations = calculateOptimalAllocation(summaries);
	const budgetProjection = projectBudgetImpact(budgetAllocations, summaries);
	const chartData = {
		providerComparison: buildProviderComparisonData(summaries),
		efficiencyBreakdown: {},
		trendCharts: {},
		funnelCharts: {},
		benchmarkCharts: {}
	};
	for (const summary of summaries) chartData.efficiencyBreakdown[summary.providerId] = getEfficiencyBreakdown(summary);
	for (const [providerId, points] of byProvider.entries()) chartData.trendCharts[providerId] = getTrendChartData(points, "spend");
	for (const [providerId, funnel] of Object.entries(funnels)) chartData.funnelCharts[providerId] = getFunnelChartData(funnel);
	for (const [providerId, comparison] of Object.entries(benchmarks)) chartData.benchmarkCharts[providerId] = getBenchmarkChartData(comparison);
	if (globalSummary) {
		const globalFunnel = analyzeFunnel(globalSummary);
		funnels.all = globalFunnel;
		chartData.funnelCharts.all = getFunnelChartData(globalFunnel);
		chartData.efficiencyBreakdown.all = getEfficiencyBreakdown(globalSummary);
		chartData.trendCharts.all = getTrendChartData(dataPoints, "spend");
		chartData.benchmarkCharts.all = getBenchmarkChartData(runBenchmarkAnalysis(globalSummary));
		benchmarks.all = runBenchmarkAnalysis(globalSummary);
		benchmarkScores.all = calculateBenchmarkScore(benchmarks.all);
		trends.all = analyzeAllTrends(dataPoints);
	}
	return {
		summaries,
		globalSummary,
		globalEfficiencyScore,
		providerEfficiencyScores,
		insights,
		criticalInsightsCount,
		warningInsightsCount,
		trends,
		funnels,
		benchmarks,
		benchmarkScores,
		budgetAllocations,
		budgetProjection,
		chartData
	};
}
/**
* Build provider comparison data for visualization
*/
function buildProviderComparisonData(summaries) {
	const colors = {
		google: PROVIDER_COLORS.google.DEFAULT,
		facebook: PROVIDER_COLORS.facebook,
		meta: PROVIDER_COLORS.meta,
		linkedin: PROVIDER_COLORS.linkedin,
		tiktok: GRAYS[900]
	};
	const names = {
		google: "Google Ads",
		facebook: "Meta Ads",
		meta: "Meta Ads",
		linkedin: "LinkedIn Ads",
		tiktok: "TikTok Ads"
	};
	return summaries.map((s) => ({
		providerId: s.providerId,
		displayName: names[s.providerId.toLowerCase()] || s.providerId,
		color: colors[s.providerId.toLowerCase()] || "hsl(var(--muted-foreground))",
		metrics: {
			spend: s.totalSpend,
			revenue: s.totalRevenue,
			roas: s.averageRoaS,
			ctr: s.averageCtr,
			cpc: s.averageCpc,
			conversionRate: s.averageConvRate,
			efficiencyScore: s.efficiencyScore
		}
	}));
}
//#endregion
export { normalizeTimeframe as _, TIMEFRAME_OPTIONS as a, describeTimeframe as c, getProviderIcon as d, getStatusBadgeVariant as f, normalizeFrequency as g, normalizeAdsProviderId as h, PROVIDER_ICON_MAP as i, formatDisplayDate as l, isCanonicalAdsProvider as m, ADS_WORKFLOW_STEPS as n, analyzeAdPerformance as o, getStatusLabel as p, FREQUENCY_OPTIONS as r, describeFrequency as s, ADS_PAGE_THEME as t, formatRelativeTimestamp as u, toAdsProviderId as v };
