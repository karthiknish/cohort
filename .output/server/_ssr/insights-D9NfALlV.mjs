import { u as formatCurrency } from "./utils-hh4sibN0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/insights-D9NfALlV.js
var LEADS_OBJECTIVE_CONFIG = {
	objective: "OUTCOME_LEADS",
	displayName: "Leads",
	optimizationGoals: [
		"LEAD_GENERATION",
		"LINK_CLICKS",
		"REACH",
		"IMPRESSIONS"
	],
	billingEvents: ["IMPRESSIONS", "LINK_CLICKS"],
	supportedCreativeTypes: [
		"lead_generation",
		"link",
		"image",
		"video",
		"carousel"
	],
	defaultCallToAction: "SIGN_UP",
	supportsLeadGen: true,
	supportsDynamicCreative: true,
	supportedPlacements: [
		"facebook",
		"instagram",
		"messenger",
		"audience_network"
	]
};
var SALES_OBJECTIVE_CONFIG = {
	objective: "OUTCOME_SALES",
	displayName: "Sales",
	optimizationGoals: [
		"OFFSITE_CONVERSIONS",
		"CONVERSIONS",
		"LINK_CLICKS",
		"LANDING_PAGE_VIEWS",
		"REACH",
		"IMPRESSIONS"
	],
	billingEvents: ["IMPRESSIONS", "LINK_CLICKS"],
	supportedCreativeTypes: [
		"link",
		"image",
		"video",
		"carousel",
		"collection",
		"dynamic_ad"
	],
	defaultCallToAction: "SHOP_NOW",
	supportsDynamicCreative: true,
	supportedPlacements: [
		"facebook",
		"instagram",
		"messenger",
		"audience_network"
	]
};
var TRAFFIC_OBJECTIVE_CONFIG = {
	objective: "OUTCOME_TRAFFIC",
	displayName: "Traffic",
	optimizationGoals: [
		"LINK_CLICKS",
		"LANDING_PAGE_VIEWS",
		"REACH",
		"IMPRESSIONS"
	],
	billingEvents: ["IMPRESSIONS", "LINK_CLICKS"],
	supportedCreativeTypes: [
		"link",
		"image",
		"video",
		"carousel"
	],
	defaultCallToAction: "LEARN_MORE",
	supportsDynamicCreative: true,
	supportedPlacements: [
		"facebook",
		"instagram",
		"messenger",
		"audience_network"
	]
};
var ENGAGEMENT_OBJECTIVE_CONFIG = {
	objective: "OUTCOME_ENGAGEMENT",
	displayName: "Engagement",
	optimizationGoals: [
		"POST_ENGAGEMENT",
		"PAGE_ENGAGEMENT",
		"EVENT_RESPONSES",
		"LINK_CLICKS",
		"REACH",
		"IMPRESSIONS"
	],
	billingEvents: ["IMPRESSIONS", "POST_ENGAGEMENT"],
	supportedCreativeTypes: [
		"link",
		"image",
		"video",
		"carousel",
		"event",
		"offer"
	],
	defaultCallToAction: "LEARN_MORE",
	supportsDynamicCreative: true,
	supportedPlacements: [
		"facebook",
		"instagram",
		"messenger"
	]
};
var AWARENESS_OBJECTIVE_CONFIG = {
	objective: "OUTCOME_AWARENESS",
	displayName: "Awareness",
	optimizationGoals: [
		"AD_RECALL_LIFT",
		"REACH",
		"IMPRESSIONS"
	],
	billingEvents: ["IMPRESSIONS"],
	supportedCreativeTypes: [
		"link",
		"image",
		"video",
		"carousel"
	],
	defaultCallToAction: "LEARN_MORE",
	supportsDynamicCreative: true,
	supportedPlacements: [
		"facebook",
		"instagram",
		"messenger",
		"audience_network"
	]
};
var APP_PROMOTION_OBJECTIVE_CONFIG = {
	objective: "OUTCOME_APP_PROMOTION",
	displayName: "App Promotion",
	optimizationGoals: [
		"APP_INSTALLS",
		"APP_ENGAGEMENT",
		"LINK_CLICKS",
		"REACH",
		"IMPRESSIONS"
	],
	billingEvents: [
		"IMPRESSIONS",
		"APP_INSTALLS",
		"LINK_CLICKS"
	],
	supportedCreativeTypes: [
		"app_install",
		"image",
		"video",
		"carousel",
		"playable"
	],
	defaultCallToAction: "INSTALL_NOW",
	supportsDynamicCreative: true,
	supportedPlacements: [
		"facebook",
		"instagram",
		"audience_network",
		"messenger"
	]
};
var CAMPAIGN_OBJECTIVE_CONFIGS = {
	OUTCOME_LEADS: LEADS_OBJECTIVE_CONFIG,
	OUTCOME_SALES: SALES_OBJECTIVE_CONFIG,
	OUTCOME_TRAFFIC: TRAFFIC_OBJECTIVE_CONFIG,
	OUTCOME_ENGAGEMENT: ENGAGEMENT_OBJECTIVE_CONFIG,
	OUTCOME_AWARENESS: AWARENESS_OBJECTIVE_CONFIG,
	OUTCOME_APP_PROMOTION: APP_PROMOTION_OBJECTIVE_CONFIG,
	LEAD_GENERATION: LEADS_OBJECTIVE_CONFIG,
	CONVERSIONS: SALES_OBJECTIVE_CONFIG,
	LINK_CLICKS: TRAFFIC_OBJECTIVE_CONFIG,
	POST_ENGAGEMENT: ENGAGEMENT_OBJECTIVE_CONFIG,
	BRAND_AWARENESS: AWARENESS_OBJECTIVE_CONFIG,
	APP_INSTALLS: APP_PROMOTION_OBJECTIVE_CONFIG
};
/** API / ODAX labels not on `CAMPAIGN_OBJECTIVE_CONFIGS` → nearest supported module. */
var EXTENDED_OBJECTIVE_TO_CONFIG_KEY = {
	STORE_TRAFFIC: "OUTCOME_TRAFFIC",
	MESSAGES: "OUTCOME_ENGAGEMENT",
	VIDEO_VIEWS: "OUTCOME_ENGAGEMENT",
	REACH: "OUTCOME_AWARENESS",
	PRODUCT_CATALOG_SALES: "OUTCOME_SALES",
	OUTCOME_PAGE_LIKES: "OUTCOME_ENGAGEMENT",
	PAGE_LIKES: "OUTCOME_ENGAGEMENT",
	PAGE_ENGAGEMENT: "OUTCOME_ENGAGEMENT",
	EVENT_RESPONSES: "OUTCOME_ENGAGEMENT",
	OFFER_CLAIMS: "OUTCOME_SALES",
	SALES: "OUTCOME_SALES",
	LEADS: "OUTCOME_LEADS",
	TRAFFIC: "OUTCOME_TRAFFIC",
	ENGAGEMENT: "OUTCOME_ENGAGEMENT",
	AWARENESS: "OUTCOME_AWARENESS",
	APP_PROMOTION: "OUTCOME_APP_PROMOTION"
};
function getObjectiveConfig(objective) {
	const direct = CAMPAIGN_OBJECTIVE_CONFIGS[objective];
	if (direct) return direct;
	const mappedKey = EXTENDED_OBJECTIVE_TO_CONFIG_KEY[objective];
	if (mappedKey) return CAMPAIGN_OBJECTIVE_CONFIGS[mappedKey];
	return null;
}
/** Standard Meta CAPI `event_name` values (subset). */
var META_CAPI_STANDARD_EVENTS = [
	{
		value: "Purchase",
		label: "Purchase"
	},
	{
		value: "Lead",
		label: "Lead"
	},
	{
		value: "CompleteRegistration",
		label: "Complete registration"
	},
	{
		value: "AddToCart",
		label: "Add to cart"
	},
	{
		value: "InitiateCheckout",
		label: "Initiate checkout"
	},
	{
		value: "ViewContent",
		label: "View content"
	},
	{
		value: "PageView",
		label: "Page view"
	}
];
var META_CAPI_ACTION_SOURCES = [
	{
		value: "website",
		label: "Website"
	},
	{
		value: "app",
		label: "App"
	},
	{
		value: "phone_call",
		label: "Phone call"
	},
	{
		value: "chat",
		label: "Chat"
	},
	{
		value: "email",
		label: "Email"
	},
	{
		value: "physical_store",
		label: "Physical store (offline)"
	},
	{
		value: "system_generated",
		label: "System generated"
	},
	{
		value: "other",
		label: "Other"
	}
];
var META_OFFLINE_ACTION_SOURCE = "physical_store";
/**
* Efficiency score weights - customizable per business
*/
var EFFICIENCY_WEIGHTS = {
	roas: .35,
	conversionRate: .25,
	ctr: .15,
	cpc: .1,
	cpm: .1,
	momentum: .05
};
/**
* Benchmark targets for "perfect" scores
*/
var EFFICIENCY_BENCHMARKS = {
	roas: 5,
	conversionRate: 5,
	ctr: 3,
	cpc: 1,
	cpm: 5
};
/**
* Calculate the main efficiency score (0-100)
* This is a weighted composite of multiple performance dimensions
*/
function calculateEfficiencyScore(summary) {
	const { totalSpend, totalClicks, totalConversions, totalImpressions, averageRoaS, averageCpc } = summary;
	if (totalSpend === 0) return 0;
	const ctr = totalImpressions > 0 ? totalClicks / totalImpressions * 100 : 0;
	const convRate = totalClicks > 0 ? totalConversions / totalClicks * 100 : 0;
	const cpm = totalImpressions > 0 ? totalSpend / totalImpressions * 1e3 : 0;
	const nRoas = Math.min(averageRoaS / EFFICIENCY_BENCHMARKS.roas, 1);
	const nConvRate = Math.min(convRate / EFFICIENCY_BENCHMARKS.conversionRate, 1);
	const nCtr = Math.min(ctr / EFFICIENCY_BENCHMARKS.ctr, 1);
	const nCpc = Math.max(0, 1 - averageCpc / (EFFICIENCY_BENCHMARKS.cpc * 10));
	const nCpm = Math.max(0, 1 - cpm / (EFFICIENCY_BENCHMARKS.cpm * 10));
	const score = (nRoas * EFFICIENCY_WEIGHTS.roas + nConvRate * EFFICIENCY_WEIGHTS.conversionRate + nCtr * EFFICIENCY_WEIGHTS.ctr + nCpc * EFFICIENCY_WEIGHTS.cpc + nCpm * EFFICIENCY_WEIGHTS.cpm) * 100;
	return Math.round(Math.min(100, Math.max(0, score)));
}
/**
* Calculate growth potential score
* Identifies how much room for improvement exists
*/
function calculateGrowthPotential(summary) {
	const gaps = [];
	if (summary.averageRoaS < EFFICIENCY_BENCHMARKS.roas) gaps.push((EFFICIENCY_BENCHMARKS.roas - summary.averageRoaS) / EFFICIENCY_BENCHMARKS.roas);
	if (summary.averageConvRate < EFFICIENCY_BENCHMARKS.conversionRate) gaps.push((EFFICIENCY_BENCHMARKS.conversionRate - summary.averageConvRate) / EFFICIENCY_BENCHMARKS.conversionRate);
	if (summary.averageCtr < EFFICIENCY_BENCHMARKS.ctr) gaps.push((EFFICIENCY_BENCHMARKS.ctr - summary.averageCtr) / EFFICIENCY_BENCHMARKS.ctr);
	if (gaps.length === 0) return 0;
	const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
	return Math.round(Math.min(100, avgGap * 100));
}
/**
* Get detailed efficiency breakdown for visualization
*/
function getEfficiencyBreakdown(summary) {
	const { totalSpend, totalClicks, totalConversions, totalImpressions, averageRoaS, averageCpc } = summary;
	if (totalSpend === 0) return [];
	const ctr = totalImpressions > 0 ? totalClicks / totalImpressions * 100 : 0;
	const convRate = totalClicks > 0 ? totalConversions / totalClicks * 100 : 0;
	const cpm = totalImpressions > 0 ? totalSpend / totalImpressions * 1e3 : 0;
	return [
		{
			dimension: "ROAS",
			score: Math.min(100, averageRoaS / EFFICIENCY_BENCHMARKS.roas * 100),
			weight: EFFICIENCY_WEIGHTS.roas,
			benchmark: EFFICIENCY_BENCHMARKS.roas
		},
		{
			dimension: "Conv Rate",
			score: Math.min(100, convRate / EFFICIENCY_BENCHMARKS.conversionRate * 100),
			weight: EFFICIENCY_WEIGHTS.conversionRate,
			benchmark: EFFICIENCY_BENCHMARKS.conversionRate
		},
		{
			dimension: "CTR",
			score: Math.min(100, ctr / EFFICIENCY_BENCHMARKS.ctr * 100),
			weight: EFFICIENCY_WEIGHTS.ctr,
			benchmark: EFFICIENCY_BENCHMARKS.ctr
		},
		{
			dimension: "CPC",
			score: Math.max(0, (1 - averageCpc / (EFFICIENCY_BENCHMARKS.cpc * 10)) * 100),
			weight: EFFICIENCY_WEIGHTS.cpc,
			benchmark: EFFICIENCY_BENCHMARKS.cpc
		},
		{
			dimension: "CPM",
			score: Math.max(0, (1 - cpm / (EFFICIENCY_BENCHMARKS.cpm * 10)) * 100),
			weight: EFFICIENCY_WEIGHTS.cpm,
			benchmark: EFFICIENCY_BENCHMARKS.cpm
		}
	];
}
/**
* Enrich a summary with all calculated metrics
*/
function enrichSummaryWithMetrics(summary) {
	const { totalSpend, totalRevenue, totalClicks, totalConversions, totalImpressions } = summary;
	const aov = totalConversions > 0 ? totalRevenue / totalConversions : 0;
	const rpc = totalClicks > 0 ? totalRevenue / totalClicks : 0;
	const roi = totalSpend > 0 ? (totalRevenue - totalSpend) / totalSpend : 0;
	const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
	const cpm = totalImpressions > 0 ? totalSpend / totalImpressions * 1e3 : 0;
	const mer = totalSpend > 0 ? totalRevenue / totalSpend : 0;
	const efficiencyScore = calculateEfficiencyScore(summary);
	const enriched = {
		...summary,
		aov,
		rpc,
		roi,
		cpa,
		cpm,
		mer,
		efficiencyScore,
		healthScore: efficiencyScore,
		growthPotential: 0
	};
	enriched.growthPotential = calculateGrowthPotential(enriched);
	return enriched;
}
var insightIdCounter = 0;
function generateInsightId(type) {
	return `${type}-${++insightIdCounter}-${Date.now()}`;
}
/**
* Generate efficiency-related insights
*/
function generateEfficiencyInsights(summary) {
	const insights = [];
	const { totalSpend, totalRevenue, totalClicks, totalConversions, averageRoaS, efficiencyScore, roi } = enrichSummaryWithMetrics(summary);
	if (totalSpend === 0) return [];
	const convRate = totalClicks > 0 ? totalConversions / totalClicks * 100 : 0;
	const providerName = formatProviderName(summary.providerId);
	if (averageRoaS > 4) insights.push({
		id: generateInsightId("efficiency"),
		type: "efficiency",
		level: "success",
		category: "Performance Excellence",
		title: "Exceptional ROAS Performance",
		message: `${providerName} is delivering ${averageRoaS.toFixed(2)}x return on ad spend with ${roi > 0 ? "+" : ""}${(roi * 100).toFixed(0)}% ROI.`,
		suggestion: "This platform is a prime candidate for budget scaling. Consider increasing spend by 15-25% incrementally.",
		score: 90,
		impact: "high",
		effort: "low",
		metrics: {
			roas: averageRoaS,
			roi: roi * 100,
			spend: totalSpend,
			revenue: totalRevenue
		}
	});
	else if (averageRoaS < 1.5 && totalSpend > 100) insights.push({
		id: generateInsightId("efficiency"),
		type: "efficiency",
		level: "critical",
		category: "Efficiency Alert",
		title: "Below Break-Even Performance",
		message: `${providerName} ROAS is ${averageRoaS.toFixed(2)}x - you're losing ${formatCurrency(totalSpend - totalRevenue, "INR")} on this platform.`,
		suggestion: "Immediately audit campaign targeting and pause lowest-performing ad sets. Consider restructuring your funnel.",
		score: 25,
		impact: "high",
		effort: "medium",
		metrics: {
			roas: averageRoaS,
			loss: totalSpend - totalRevenue,
			spend: totalSpend
		}
	});
	else if (averageRoaS >= 1.5 && averageRoaS <= 2.5) insights.push({
		id: generateInsightId("efficiency"),
		type: "efficiency",
		level: "info",
		category: "Optimization Opportunity",
		title: "Moderate ROAS - Room for Improvement",
		message: `${providerName} is returning ${averageRoaS.toFixed(2)}x, which is profitable but could be optimized.`,
		suggestion: "Focus on improving conversion rate through landing page optimization and audience refinement.",
		score: 55,
		impact: "medium",
		effort: "medium",
		metrics: {
			roas: averageRoaS,
			convRate
		}
	});
	if (efficiencyScore < 40 && totalSpend > 200) insights.push({
		id: generateInsightId("efficiency"),
		type: "efficiency",
		level: "critical",
		category: "System Health",
		title: "Low Overall Efficiency Score",
		message: `${providerName} efficiency score is ${efficiencyScore}/100, indicating systemic performance issues.`,
		suggestion: "A comprehensive audit is recommended: review creative performance, audience targeting, and landing page experience.",
		score: efficiencyScore,
		impact: "high",
		effort: "high"
	});
	else if (efficiencyScore > 80) insights.push({
		id: generateInsightId("efficiency"),
		type: "efficiency",
		level: "success",
		category: "Top Performer",
		title: "Excellent Efficiency Score",
		message: `${providerName} is operating at ${efficiencyScore}/100 efficiency - top-tier performance.`,
		suggestion: "Maintain current strategies while exploring incremental scaling opportunities.",
		score: efficiencyScore,
		impact: "medium",
		effort: "low"
	});
	return insights;
}
/**
* Generate creative/ad quality insights
*/
function generateCreativeInsights(summary) {
	const insights = [];
	const { totalSpend, totalClicks, totalImpressions, averageCpc, providerId } = summary;
	if (totalSpend === 0 || totalImpressions === 0) return [];
	const ctr = totalClicks / totalImpressions * 100;
	const providerName = formatProviderName(providerId);
	if (averageCpc > 5 && ctr < 1) insights.push({
		id: generateInsightId("creative"),
		type: "creative",
		level: "warning",
		category: "Ad Quality",
		title: "High Cost, Low Engagement",
		message: `${providerName} ads have ${formatCurrency(averageCpc)} CPC but only ${ctr.toFixed(2)}% CTR.`,
		suggestion: "Test new creative variants with stronger hooks, clearer value propositions, and more compelling CTAs.",
		score: 40,
		impact: "high",
		effort: "medium",
		metrics: {
			cpc: averageCpc,
			ctr
		}
	});
	if (ctr < .3 && totalImpressions > 1e4) insights.push({
		id: generateInsightId("creative"),
		type: "creative",
		level: "critical",
		category: "Ad Relevance",
		title: "Critically Low Click-Through Rate",
		message: `${providerName} CTR is only ${ctr.toFixed(2)}% - your ads may not be resonating with the audience.`,
		suggestion: "Consider a complete creative refresh. Test different ad formats, messaging angles, and visual styles.",
		score: 20,
		impact: "high",
		effort: "high",
		metrics: {
			ctr,
			impressions: totalImpressions
		}
	});
	if (ctr > 2) insights.push({
		id: generateInsightId("creative"),
		type: "creative",
		level: "success",
		category: "Ad Engagement",
		title: "Strong Click-Through Rate",
		message: `${providerName} ads are achieving ${ctr.toFixed(2)}% CTR - above industry average.`,
		suggestion: "Your creative is working well. Focus on scaling reach while monitoring frequency.",
		score: 85,
		impact: "medium",
		effort: "low",
		metrics: { ctr }
	});
	return insights;
}
/**
* Generate audience/targeting insights
*/
function generateAudienceInsights(summary) {
	const insights = [];
	const { totalClicks, totalConversions, totalSpend, providerId } = summary;
	if (totalSpend === 0) return [];
	const convRate = totalClicks > 0 ? totalConversions / totalClicks * 100 : 0;
	const providerName = formatProviderName(providerId);
	if (totalClicks > 500 && convRate < .5) insights.push({
		id: generateInsightId("audience"),
		type: "audience",
		level: "warning",
		category: "Traffic Quality",
		title: "High Traffic, Low Conversion",
		message: `${providerName} drove ${totalClicks.toLocaleString()} clicks but only ${convRate.toFixed(2)}% converted.`,
		suggestion: "Your audience targeting may be too broad. Consider implementing lookalike audiences or interest-based refinement.",
		score: 35,
		impact: "high",
		effort: "medium",
		metrics: {
			clicks: totalClicks,
			convRate
		}
	});
	if (convRate > 5 && totalClicks > 100) insights.push({
		id: generateInsightId("audience"),
		type: "audience",
		level: "success",
		category: "Audience Quality",
		title: "High-Quality Traffic",
		message: `${providerName} traffic is converting at ${convRate.toFixed(2)}% - well above average.`,
		suggestion: "Your targeting is effective. Consider expanding to similar audience segments.",
		score: 90,
		impact: "medium",
		effort: "low",
		metrics: {
			convRate,
			conversions: totalConversions
		}
	});
	return insights;
}
/**
* Legacy compatibility wrapper - generates a standard set of insights for a single provider
*/
function calculateAlgorithmicInsights(summary) {
	const insights = [];
	insights.push(...generateEfficiencyInsights(summary));
	insights.push(...generateCreativeInsights(summary));
	insights.push(...generateAudienceInsights(summary));
	return combineInsights(insights);
}
/**
* Generate trend-based insights
*/
function generateTrendInsights(trends, providerId) {
	const insights = [];
	const providerName = formatProviderName(providerId);
	const roasTrend = trends["roas"];
	if (roasTrend) {
		if (roasTrend.direction === "down" && roasTrend.momentum < 40) insights.push({
			id: generateInsightId("trend"),
			type: "trend",
			level: "warning",
			category: "Performance Trend",
			title: "Declining ROAS Trend",
			message: `${providerName} ROAS has been declining with ${roasTrend.momentum}/100 momentum.`,
			suggestion: "Investigate recent changes in targeting, creative fatigue, or market conditions.",
			impact: "high",
			effort: "medium",
			metrics: {
				momentum: roasTrend.momentum,
				velocity: roasTrend.velocity
			}
		});
		else if (roasTrend.direction === "up" && roasTrend.momentum > 60) insights.push({
			id: generateInsightId("trend"),
			type: "trend",
			level: "success",
			category: "Performance Trend",
			title: "Improving ROAS Trend",
			message: `${providerName} ROAS is trending upward with strong momentum (${roasTrend.momentum}/100).`,
			suggestion: "Current optimizations are working. Consider accelerating successful strategies.",
			impact: "medium",
			effort: "low",
			metrics: { momentum: roasTrend.momentum }
		});
	}
	const spendTrend = trends["spend"];
	if (spendTrend && spendTrend.anomalies.length > 0) {
		const highSeverity = spendTrend.anomalies.filter((a) => a.severity === "high");
		if (highSeverity.length > 0) insights.push({
			id: generateInsightId("trend"),
			type: "trend",
			level: "info",
			category: "Spend Anomaly",
			title: "Unusual Spend Pattern Detected",
			message: `${providerName} had ${highSeverity.length} significant spend anomaly(s) in the period.`,
			suggestion: "Review these dates for campaign changes or platform issues.",
			impact: "low",
			effort: "low",
			metrics: { anomalyCount: highSeverity.length }
		});
	}
	return insights;
}
/**
* Generate funnel-based insights
*/
function generateFunnelInsights(analysis, providerId) {
	const insights = [];
	const providerName = formatProviderName(providerId);
	if (analysis.bottleneckStage && analysis.biggestDropOff) insights.push({
		id: generateInsightId("funnel"),
		type: "funnel",
		level: analysis.biggestDropOff.rate > 98 ? "critical" : "warning",
		category: "Funnel Optimization",
		title: `Bottleneck at ${analysis.bottleneckStage}`,
		message: `${providerName} loses ${analysis.biggestDropOff.rate.toFixed(1)}% of users at the ${analysis.bottleneckStage} stage.`,
		suggestion: analysis.recommendations[0] || "Focus optimization efforts on this funnel stage.",
		impact: "high",
		effort: "medium",
		metrics: { dropOffRate: analysis.biggestDropOff.rate }
	});
	return insights;
}
/**
* Generate benchmark-based insights
*/
function generateBenchmarkInsights(comparisons, providerId) {
	const insights = [];
	const providerName = formatProviderName(providerId);
	const belowAverage = comparisons.filter((c) => c.status === "below");
	const excellent = comparisons.filter((c) => c.status === "excellent");
	if (belowAverage.length >= 3) insights.push({
		id: generateInsightId("benchmark"),
		type: "benchmark",
		level: "warning",
		category: "Industry Comparison",
		title: "Multiple Metrics Below Benchmark",
		message: `${providerName} underperforms industry benchmarks in ${belowAverage.length} key metrics.`,
		suggestion: `Focus on improving: ${belowAverage.map((b) => b.metric).join(", ")}.`,
		impact: "high",
		effort: "high",
		metrics: { belowCount: belowAverage.length }
	});
	if (excellent.length >= 2) insights.push({
		id: generateInsightId("benchmark"),
		type: "benchmark",
		level: "success",
		category: "Industry Leader",
		title: "Above-Average Performance",
		message: `${providerName} excels in ${excellent.map((e) => e.metric).join(" and ")}.`,
		suggestion: "Leverage these strengths as competitive advantages.",
		impact: "medium",
		effort: "low",
		metrics: { excellentCount: excellent.length }
	});
	return insights;
}
/**
* Helper to format provider names
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
* Combine and prioritize all insights
*/
function combineInsights(allInsights) {
	const levelOrder = {
		critical: 0,
		warning: 1,
		info: 2,
		success: 3
	};
	const impactOrder = {
		high: 0,
		medium: 1,
		low: 2
	};
	return allInsights.sort((a, b) => {
		const levelDiff = levelOrder[a.level] - levelOrder[b.level];
		if (levelDiff !== 0) return levelDiff;
		return impactOrder[a.impact || "medium"] - impactOrder[b.impact || "medium"];
	});
}
//#endregion
export { calculateEfficiencyScore as a, generateAudienceInsights as c, generateEfficiencyInsights as d, generateFunnelInsights as f, getObjectiveConfig as h, calculateAlgorithmicInsights as i, generateBenchmarkInsights as l, getEfficiencyBreakdown as m, META_CAPI_STANDARD_EVENTS as n, combineInsights as o, generateTrendInsights as p, META_OFFLINE_ACTION_SOURCE as r, enrichSummaryWithMetrics as s, META_CAPI_ACTION_SOURCES as t, generateCreativeInsights as u };
