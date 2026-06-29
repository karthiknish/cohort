//#region src/lib/themes/index.ts
/**
* Centralized theme configuration for the application.
* This file consolidates all theme-related constants and utilities.
*
* Provider themes, color palettes, and UI themes are all defined here
* to ensure consistency across the application.
*/
var PROVIDER_IDS = {
	GOOGLE: "google",
	FACEBOOK: "facebook",
	META: "meta",
	LINKEDIN: "linkedin",
	TIKTOK: "tiktok"
};
var PROVIDER_ID_ALIASES = {
	google: PROVIDER_IDS.GOOGLE,
	google_ads: PROVIDER_IDS.GOOGLE,
	"google-ads": PROVIDER_IDS.GOOGLE,
	googleads: PROVIDER_IDS.GOOGLE,
	adwords: PROVIDER_IDS.GOOGLE,
	google_analytics: PROVIDER_IDS.GOOGLE,
	"google-analytics": PROVIDER_IDS.GOOGLE,
	googleanalytics: PROVIDER_IDS.GOOGLE,
	ga: PROVIDER_IDS.GOOGLE,
	ga4: PROVIDER_IDS.GOOGLE,
	facebook: PROVIDER_IDS.FACEBOOK,
	facebook_ads: PROVIDER_IDS.FACEBOOK,
	"facebook-ads": PROVIDER_IDS.FACEBOOK,
	meta: PROVIDER_IDS.FACEBOOK,
	meta_ads: PROVIDER_IDS.FACEBOOK,
	"meta-ads": PROVIDER_IDS.FACEBOOK,
	metaads: PROVIDER_IDS.FACEBOOK,
	linkedin: PROVIDER_IDS.LINKEDIN,
	linkedin_ads: PROVIDER_IDS.LINKEDIN,
	"linkedin-ads": PROVIDER_IDS.LINKEDIN,
	tiktok: PROVIDER_IDS.TIKTOK,
	tiktok_ads: PROVIDER_IDS.TIKTOK,
	"tiktok-ads": PROVIDER_IDS.TIKTOK
};
function normalizeProviderId(providerId) {
	const normalized = providerId.trim().toLowerCase();
	return PROVIDER_ID_ALIASES[normalized] ?? normalized;
}
function humanizeProviderId(providerId) {
	return providerId.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}
var PROVIDER_INFO = {
	[PROVIDER_IDS.GOOGLE]: {
		name: "Google Ads",
		shortName: "Google",
		description: "Import campaign performance, budgets, and ROAS insights directly from Google Ads.",
		benefits: [
			"Campaign spend and budget tracking",
			"Conversion and ROAS metrics",
			"Search, Display, and YouTube performance"
		],
		requirements: ["Active Google Ads account", "Admin or Standard access to the account"],
		loginMethod: "redirect",
		estimatedSetupTime: "30 seconds",
		theme: {
			color: "text-[rgb(var(--provider-google-rgb))]",
			bg: "bg-[rgb(var(--provider-google-rgb)/0.1)]",
			border: "border-[rgb(var(--provider-google-rgb)/0.2)]",
			indicator: "bg-[rgb(var(--provider-google-rgb))]"
		}
	},
	[PROVIDER_IDS.FACEBOOK]: {
		name: "Meta Ads Manager",
		shortName: "Meta",
		description: "Pull spend, results, and creative breakdowns from Meta and Instagram campaigns.",
		benefits: [
			"Facebook and Instagram ad performance",
			"Creative-level reporting",
			"Audience and placement insights"
		],
		requirements: ["Meta Business account", "Admin access to at least one ad account"],
		loginMethod: "redirect",
		estimatedSetupTime: "1 minute",
		theme: {
			color: "text-[rgb(var(--provider-facebook-rgb))]",
			bg: "bg-[rgb(var(--provider-facebook-rgb)/0.1)]",
			border: "border-[rgb(var(--provider-facebook-rgb)/0.2)]",
			indicator: "bg-[rgb(var(--provider-facebook-rgb))]"
		}
	},
	[PROVIDER_IDS.META]: {
		name: "Meta Ads Manager",
		shortName: "Meta",
		description: "Pull spend, results, and creative breakdowns from Meta and Instagram campaigns.",
		benefits: [
			"Facebook and Instagram ad performance",
			"Creative-level reporting",
			"Audience and placement insights"
		],
		requirements: ["Meta Business account", "Admin access to at least one ad account"],
		loginMethod: "redirect",
		estimatedSetupTime: "1 minute",
		theme: {
			color: "text-[rgb(var(--provider-meta-rgb))]",
			bg: "bg-[rgb(var(--provider-meta-rgb)/0.1)]",
			border: "border-[rgb(var(--provider-meta-rgb)/0.2)]",
			indicator: "bg-[rgb(var(--provider-meta-rgb))]"
		}
	},
	[PROVIDER_IDS.LINKEDIN]: {
		name: "LinkedIn Ads",
		shortName: "LinkedIn",
		description: "Sync lead-gen form results and campaign analytics from LinkedIn.",
		benefits: [
			"Sponsored content performance",
			"Lead generation metrics",
			"B2B audience insights"
		],
		requirements: ["LinkedIn Campaign Manager access", "Admin or Account Manager role"],
		loginMethod: "redirect",
		estimatedSetupTime: "30 seconds",
		theme: {
			color: "text-[rgb(var(--provider-linkedin-rgb))]",
			bg: "bg-[rgb(var(--provider-linkedin-rgb)/0.1)]",
			border: "border-[rgb(var(--provider-linkedin-rgb)/0.2)]",
			indicator: "bg-[rgb(var(--provider-linkedin-rgb))]"
		}
	},
	[PROVIDER_IDS.TIKTOK]: {
		name: "TikTok Ads",
		shortName: "TikTok",
		description: "Bring in spend, engagement, and conversion insights from TikTok campaign flights.",
		benefits: [
			"Campaign and ad group performance",
			"Video engagement metrics",
			"Conversion tracking"
		],
		requirements: ["TikTok Ads Manager account", "Advertiser access or higher"],
		loginMethod: "redirect",
		estimatedSetupTime: "1 minute",
		theme: {
			color: "text-[rgb(var(--provider-tiktok-rgb))]",
			bg: "bg-[rgb(var(--provider-tiktok-rgb)/0.1)]",
			border: "border-[rgb(var(--provider-tiktok-rgb)/0.2)]",
			indicator: "bg-[rgb(var(--provider-tiktok-rgb))]"
		}
	}
};
/**
* Format provider name for display.
*/
function formatProviderName(providerId) {
	const normalized = normalizeProviderId(providerId);
	if (normalized in PROVIDER_INFO) return PROVIDER_INFO[normalized].shortName;
	return humanizeProviderId(providerId);
}
//#endregion
export { normalizeProviderId as i, PROVIDER_INFO as n, formatProviderName as r, PROVIDER_IDS as t };
