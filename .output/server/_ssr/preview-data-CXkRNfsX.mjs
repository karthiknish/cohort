import { At as object, Ct as array, Mt as record, Ot as looseObject, Pt as string, kt as number, xt as _enum } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/preview-data-CXkRNfsX.js
var MONEY_FORMATTER_CACHE = /* @__PURE__ */ new Map();
function moneyFormatterCacheKey(locale, currency, minimumFractionDigits, maximumFractionDigits) {
	return `${locale ?? "default"}|${currency}|${minimumFractionDigits}|${maximumFractionDigits}`;
}
function getMoneyFormatter(locale, currency, minimumFractionDigits, maximumFractionDigits) {
	const cacheKey = moneyFormatterCacheKey(locale, currency, minimumFractionDigits, maximumFractionDigits);
	const cachedFormatter = MONEY_FORMATTER_CACHE.get(cacheKey);
	if (cachedFormatter) return cachedFormatter;
	return MONEY_FORMATTER_CACHE.get(moneyFormatterCacheKey(void 0, "USD", 2, 2));
}
var SUPPORTED_CURRENCIES = {
	USD: {
		code: "USD",
		name: "US Dollar",
		symbol: "$",
		locale: "en-US",
		decimalDigits: 2,
		symbolPosition: "before"
	},
	EUR: {
		code: "EUR",
		name: "Euro",
		symbol: "€",
		locale: "de-DE",
		decimalDigits: 2,
		symbolPosition: "before"
	},
	GBP: {
		code: "GBP",
		name: "British Pound",
		symbol: "£",
		locale: "en-GB",
		decimalDigits: 2,
		symbolPosition: "before"
	},
	CAD: {
		code: "CAD",
		name: "Canadian Dollar",
		symbol: "CA$",
		locale: "en-CA",
		decimalDigits: 2,
		symbolPosition: "before"
	},
	AUD: {
		code: "AUD",
		name: "Australian Dollar",
		symbol: "A$",
		locale: "en-AU",
		decimalDigits: 2,
		symbolPosition: "before"
	},
	JPY: {
		code: "JPY",
		name: "Japanese Yen",
		symbol: "¥",
		locale: "ja-JP",
		decimalDigits: 0,
		symbolPosition: "before"
	},
	CHF: {
		code: "CHF",
		name: "Swiss Franc",
		symbol: "CHF",
		locale: "de-CH",
		decimalDigits: 2,
		symbolPosition: "before"
	},
	CNY: {
		code: "CNY",
		name: "Chinese Yuan",
		symbol: "¥",
		locale: "zh-CN",
		decimalDigits: 2,
		symbolPosition: "before"
	},
	INR: {
		code: "INR",
		name: "Indian Rupee",
		symbol: "₹",
		locale: "en-IN",
		decimalDigits: 2,
		symbolPosition: "before"
	},
	BRL: {
		code: "BRL",
		name: "Brazilian Real",
		symbol: "R$",
		locale: "pt-BR",
		decimalDigits: 2,
		symbolPosition: "before"
	},
	MXN: {
		code: "MXN",
		name: "Mexican Peso",
		symbol: "MX$",
		locale: "es-MX",
		decimalDigits: 2,
		symbolPosition: "before"
	},
	SGD: {
		code: "SGD",
		name: "Singapore Dollar",
		symbol: "S$",
		locale: "en-SG",
		decimalDigits: 2,
		symbolPosition: "before"
	},
	HKD: {
		code: "HKD",
		name: "Hong Kong Dollar",
		symbol: "HK$",
		locale: "en-HK",
		decimalDigits: 2,
		symbolPosition: "before"
	},
	NZD: {
		code: "NZD",
		name: "New Zealand Dollar",
		symbol: "NZ$",
		locale: "en-NZ",
		decimalDigits: 2,
		symbolPosition: "before"
	},
	SEK: {
		code: "SEK",
		name: "Swedish Krona",
		symbol: "kr",
		locale: "sv-SE",
		decimalDigits: 2,
		symbolPosition: "after"
	},
	NOK: {
		code: "NOK",
		name: "Norwegian Krone",
		symbol: "kr",
		locale: "nb-NO",
		decimalDigits: 2,
		symbolPosition: "after"
	},
	DKK: {
		code: "DKK",
		name: "Danish Krone",
		symbol: "kr",
		locale: "da-DK",
		decimalDigits: 2,
		symbolPosition: "after"
	},
	ZAR: {
		code: "ZAR",
		name: "South African Rand",
		symbol: "R",
		locale: "en-ZA",
		decimalDigits: 2,
		symbolPosition: "before"
	},
	AED: {
		code: "AED",
		name: "UAE Dirham",
		symbol: "AED",
		locale: "ar-AE",
		decimalDigits: 2,
		symbolPosition: "before"
	},
	KRW: {
		code: "KRW",
		name: "South Korean Won",
		symbol: "₩",
		locale: "ko-KR",
		decimalDigits: 0,
		symbolPosition: "before"
	}
};
var CURRENCY_CODES = Object.keys(SUPPORTED_CURRENCIES);
for (const code of CURRENCY_CODES) {
	const info = SUPPORTED_CURRENCIES[code];
	MONEY_FORMATTER_CACHE.set(moneyFormatterCacheKey(info.locale, code, info.decimalDigits, info.decimalDigits), new Intl.NumberFormat(info.locale, {
		style: "currency",
		currency: code,
		minimumFractionDigits: info.decimalDigits,
		maximumFractionDigits: info.decimalDigits
	}));
	MONEY_FORMATTER_CACHE.set(moneyFormatterCacheKey(void 0, code, 2, 2), new Intl.NumberFormat(void 0, {
		style: "currency",
		currency: code,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}));
}
MONEY_FORMATTER_CACHE.set(moneyFormatterCacheKey(void 0, "USD", 2, 2), new Intl.NumberFormat(void 0, {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
}));
/**
* Get currency info by code (case-insensitive)
*/
function getCurrencyInfo(code) {
	return SUPPORTED_CURRENCIES[code.toUpperCase()] ?? SUPPORTED_CURRENCIES["USD"];
}
/**
* Check if a currency code is supported
*/
function isSupportedCurrency(code) {
	return code.toUpperCase() in SUPPORTED_CURRENCIES;
}
/**
* Get a list of currencies for select dropdowns
*/
function getCurrencyOptions() {
	return CURRENCY_CODES.map((code) => ({
		value: code,
		label: `${code} - ${SUPPORTED_CURRENCIES[code].name}`,
		symbol: SUPPORTED_CURRENCIES[code].symbol
	}));
}
/**
* Popular currencies for quick selection (subset for common use)
*/
var POPULAR_CURRENCIES = [
	"USD",
	"EUR",
	"GBP",
	"CAD",
	"AUD",
	"INR",
	"JPY",
	"CHF"
];
/**
* Normalize a currency code to uppercase
*/
function normalizeCurrencyCode(value) {
	if (typeof value !== "string") return "USD";
	const trimmed = value.trim();
	return trimmed ? trimmed.toUpperCase() : "USD";
}
/**
* Format a monetary amount with proper currency formatting
* Uses Intl.NumberFormat for locale-aware formatting
*/
function formatMoney(amount, currency) {
	const code = normalizeCurrencyCode(currency);
	try {
		const info = getCurrencyInfo(code);
		return getMoneyFormatter(info.locale, code, info.decimalDigits, info.decimalDigits).format(amount);
	} catch {
		try {
			return getMoneyFormatter(void 0, code, 2, 2).format(amount);
		} catch {
			return getMoneyFormatter(void 0, "USD", 2, 2).format(amount);
		}
	}
}
var PREVIEW_MODE_STORAGE_KEY = "cohorts.previewMode";
var PREVIEW_MODE_EVENT = "cohorts:previewModeChanged";
var PREVIEW_MODE_QUERY_PARAM = "preview";
var PREVIEW_ROUTE_REQUEST_HEADER = "x-cohorts-preview-route";
var PREVIEW_ROUTE_PATTERNS = [
	/^\/dashboard\/proposals\/[^/]+\/deck$/,
	/^\/dashboard\/ads\/campaigns\/[^/]+\/[^/]+$/,
	/^\/dashboard\/ads\/campaigns\/[^/]+\/[^/]+\/creative\/[^/]+$/
];
function isEnabledPreviewValue(value) {
	if (!value) return false;
	return value === "1" || value.toLowerCase() === "true";
}
function isScreenRecordingModeEnabled() {
	return isEnabledPreviewValue("true");
}
/**
* When true, the Next.js proxy skips the session gate for `/dashboard/*` and `/for-you/*`.
* Never enable on production Vercel deployments — use preview deploys or `?preview=1` routes instead.
* @see docs/security-and-env.md
*/
function isScreenRecordingAuthBypassEnabled() {
	if (!isScreenRecordingModeEnabled()) return false;
	if (process.env.VERCEL_ENV === "production") return false;
	return isEnabledPreviewValue(process.env.SCREEN_RECORDING_ALLOW_AUTH_BYPASS ?? null);
}
function isPreviewModeQueryEnabled(searchParams) {
	return isEnabledPreviewValue(searchParams.get(PREVIEW_MODE_QUERY_PARAM));
}
function isPublicPreviewPath(pathname) {
	return PREVIEW_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}
function isPreviewRouteRequest(pathname, searchParams) {
	return isPublicPreviewPath(pathname) && isPreviewModeQueryEnabled(searchParams);
}
function withPreviewModeSearchParam(href) {
	const [hrefWithoutHash, hashFragment] = href.split("#", 2);
	const url = new URL(hrefWithoutHash ?? href, "https://preview.local");
	url.searchParams.set(PREVIEW_MODE_QUERY_PARAM, "1");
	return `${url.pathname}${url.search}${hashFragment ? `#${hashFragment}` : ""}`;
}
function withPreviewModeSearchParamIfEnabled(href, enabled) {
	return enabled ? withPreviewModeSearchParam(href) : href;
}
function isPreviewModeEnabled() {
	if (isScreenRecordingModeEnabled()) return true;
	if (typeof window === "undefined") return false;
	try {
		if (isPreviewModeQueryEnabled(new URLSearchParams(window.location.search))) return true;
	} catch {}
	try {
		return window.localStorage.getItem(PREVIEW_MODE_STORAGE_KEY) === "1";
	} catch {
		return false;
	}
}
function setPreviewModeEnabled(enabled) {
	if (typeof window === "undefined") return;
	if (isScreenRecordingModeEnabled()) return;
	try {
		window.localStorage.setItem(PREVIEW_MODE_STORAGE_KEY, enabled ? "1" : "0");
	} catch {}
	try {
		window.dispatchEvent(new CustomEvent(PREVIEW_MODE_EVENT, { detail: { enabled } }));
	} catch {}
}
/**
* Fixed base date for SSR to ensure consistent dates across server and client.
* Using a fixed date (2024-01-15) prevents hydration mismatches.
*/
var SSR_BASE_DATE = /* @__PURE__ */ new Date("2024-01-15T12:00:00.000Z");
/**
* Helper to generate ISO date strings for days in the past.
* Uses a fixed base date during SSR to prevent hydration mismatches.
*/
function isoDaysAgo(daysAgo) {
	if (typeof window === "undefined") {
		const d = new Date(SSR_BASE_DATE);
		d.setDate(d.getDate() - daysAgo);
		return d.toISOString();
	}
	const d = /* @__PURE__ */ new Date();
	d.setDate(d.getDate() - daysAgo);
	return d.toISOString();
}
function getPreviewClients() {
	const now = typeof window === "undefined" ? "2024-01-15T12:00:00.000Z" : (/* @__PURE__ */ new Date()).toISOString();
	return [
		{
			id: "preview-tech-corp",
			name: "Tech Corp",
			accountManager: "Alex Morgan",
			teamMembers: [
				{
					id: "preview-member-tech-1",
					name: "Alex Morgan",
					role: "Account Manager"
				},
				{
					id: "preview-member-tech-2",
					name: "Jordan Lee",
					role: "Strategist"
				},
				{
					id: "preview-member-tech-3",
					name: "Mia Thompson",
					role: "Creative Lead"
				}
			],
			createdAt: now,
			updatedAt: now
		},
		{
			id: "preview-startupxyz",
			name: "StartupXYZ",
			accountManager: "Priya Patel",
			teamMembers: [
				{
					id: "preview-member-startup-1",
					name: "Priya Patel",
					role: "Account Manager"
				},
				{
					id: "preview-member-startup-2",
					name: "Sam Chen",
					role: "Performance Marketer"
				},
				{
					id: "preview-member-startup-3",
					name: "Lena Ortiz",
					role: "Lifecycle Strategist"
				}
			],
			createdAt: now,
			updatedAt: now
		},
		{
			id: "preview-retail-store",
			name: "Retail Store",
			accountManager: "Taylor Kim",
			teamMembers: [
				{
					id: "preview-member-retail-1",
					name: "Taylor Kim",
					role: "Account Manager"
				},
				{
					id: "preview-member-retail-2",
					name: "Casey Rivera",
					role: "Creative"
				},
				{
					id: "preview-member-retail-3",
					name: "Noah Bennett",
					role: "Email Specialist"
				}
			],
			createdAt: now,
			updatedAt: now
		}
	];
}
function getPreviewMetrics(clientId) {
	const clients = getPreviewClients();
	const activeIds = clientId ? [clientId] : clients.map((c) => c.id);
	const base = [
		{
			spend: 220,
			impressions: 42e3,
			clicks: 820,
			conversions: 34,
			revenue: 3400
		},
		{
			spend: 260,
			impressions: 47e3,
			clicks: 880,
			conversions: 39,
			revenue: 3800
		},
		{
			spend: 240,
			impressions: 45e3,
			clicks: 860,
			conversions: 36,
			revenue: 3600
		},
		{
			spend: 310,
			impressions: 52e3,
			clicks: 990,
			conversions: 44,
			revenue: 4300
		},
		{
			spend: 280,
			impressions: 5e4,
			clicks: 940,
			conversions: 41,
			revenue: 4e3
		},
		{
			spend: 330,
			impressions: 56e3,
			clicks: 1040,
			conversions: 48,
			revenue: 4700
		},
		{
			spend: 300,
			impressions: 54e3,
			clicks: 1010,
			conversions: 46,
			revenue: 4550
		}
	];
	const records = [];
	activeIds.forEach((id, clientIndex) => {
		base.forEach((day, idx) => {
			const multiplier = 1 + clientIndex * .12;
			records.push({
				id: `preview-metric-${id}-${idx}`,
				providerId: "preview",
				clientId: id,
				currency: "USD",
				date: isoDaysAgo(6 - idx),
				createdAt: isoDaysAgo(6 - idx),
				spend: Math.round(day.spend * multiplier),
				impressions: Math.round(day.impressions * multiplier),
				clicks: Math.round(day.clicks * multiplier),
				conversions: Math.round(day.conversions * multiplier),
				revenue: Math.round(day.revenue * multiplier)
			});
		});
	});
	return records;
}
var PREVIEW_ANALYTICS_CURRENCY = "GBP";
function getPreviewAnalyticsMetrics() {
	const providers = [
		"google-analytics",
		"google",
		"facebook",
		"linkedin"
	];
	const baseData = {
		"google-analytics": [
			{
				spend: 0,
				impressions: 4200,
				clicks: 5100,
				conversions: 160,
				revenue: 8200
			},
			{
				spend: 0,
				impressions: 4550,
				clicks: 5450,
				conversions: 171,
				revenue: 8700
			},
			{
				spend: 0,
				impressions: 3980,
				clicks: 4760,
				conversions: 149,
				revenue: 7600
			},
			{
				spend: 0,
				impressions: 4820,
				clicks: 5900,
				conversions: 188,
				revenue: 9400
			},
			{
				spend: 0,
				impressions: 4680,
				clicks: 5620,
				conversions: 179,
				revenue: 9100
			},
			{
				spend: 0,
				impressions: 5060,
				clicks: 6180,
				conversions: 201,
				revenue: 10350
			},
			{
				spend: 0,
				impressions: 4910,
				clicks: 6010,
				conversions: 194,
				revenue: 9950
			}
		],
		google: [
			{
				spend: 850,
				impressions: 125e3,
				clicks: 2800,
				conversions: 95,
				revenue: 9500
			},
			{
				spend: 920,
				impressions: 132e3,
				clicks: 3100,
				conversions: 108,
				revenue: 10800
			},
			{
				spend: 780,
				impressions: 118e3,
				clicks: 2650,
				conversions: 88,
				revenue: 8800
			},
			{
				spend: 1050,
				impressions: 145e3,
				clicks: 3400,
				conversions: 125,
				revenue: 12500
			},
			{
				spend: 940,
				impressions: 138e3,
				clicks: 3200,
				conversions: 112,
				revenue: 11200
			},
			{
				spend: 1100,
				impressions: 152e3,
				clicks: 3600,
				conversions: 135,
				revenue: 13500
			},
			{
				spend: 980,
				impressions: 142e3,
				clicks: 3300,
				conversions: 118,
				revenue: 11800
			}
		],
		facebook: [
			{
				spend: 620,
				impressions: 185e3,
				clicks: 4200,
				conversions: 72,
				revenue: 7200
			},
			{
				spend: 680,
				impressions: 198e3,
				clicks: 4600,
				conversions: 82,
				revenue: 8200
			},
			{
				spend: 590,
				impressions: 175e3,
				clicks: 3900,
				conversions: 65,
				revenue: 6500
			},
			{
				spend: 750,
				impressions: 215e3,
				clicks: 5100,
				conversions: 95,
				revenue: 9500
			},
			{
				spend: 710,
				impressions: 205e3,
				clicks: 4800,
				conversions: 88,
				revenue: 8800
			},
			{
				spend: 820,
				impressions: 228e3,
				clicks: 5400,
				conversions: 105,
				revenue: 10500
			},
			{
				spend: 760,
				impressions: 218e3,
				clicks: 5200,
				conversions: 98,
				revenue: 9800
			}
		],
		linkedin: [
			{
				spend: 420,
				impressions: 32e3,
				clicks: 680,
				conversions: 28,
				revenue: 5600
			},
			{
				spend: 480,
				impressions: 36e3,
				clicks: 780,
				conversions: 35,
				revenue: 7e3
			},
			{
				spend: 380,
				impressions: 28e3,
				clicks: 590,
				conversions: 22,
				revenue: 4400
			},
			{
				spend: 520,
				impressions: 42e3,
				clicks: 890,
				conversions: 42,
				revenue: 8400
			},
			{
				spend: 460,
				impressions: 38e3,
				clicks: 820,
				conversions: 38,
				revenue: 7600
			},
			{
				spend: 550,
				impressions: 45e3,
				clicks: 950,
				conversions: 48,
				revenue: 9600
			},
			{
				spend: 500,
				impressions: 4e4,
				clicks: 860,
				conversions: 42,
				revenue: 8400
			}
		]
	};
	const records = [];
	providers.forEach((provider) => {
		const providerData = baseData[provider];
		if (!providerData) return;
		providerData.forEach((day, idx) => {
			const [date = isoDaysAgo(6 - idx)] = isoDaysAgo(6 - idx).split("T");
			const metric = {
				id: `preview-analytics-${provider}-${idx}`,
				providerId: provider,
				date,
				currency: PREVIEW_ANALYTICS_CURRENCY,
				spend: day.spend,
				impressions: day.impressions,
				clicks: day.clicks,
				conversions: day.conversions,
				revenue: day.revenue
			};
			if (provider === "facebook") metric.creatives = [
				{
					id: `creative-${provider}-${idx}-1`,
					name: "Summer Sale Banner",
					type: "image",
					spend: Math.round(day.spend * .4),
					impressions: Math.round(day.impressions * .4),
					clicks: Math.round(day.clicks * .4),
					conversions: Math.round(day.conversions * .4),
					revenue: Math.round(day.revenue * .4)
				},
				{
					id: `creative-${provider}-${idx}-2`,
					name: "Product Showcase Video",
					type: "video",
					spend: Math.round(day.spend * .35),
					impressions: Math.round(day.impressions * .35),
					clicks: Math.round(day.clicks * .35),
					conversions: Math.round(day.conversions * .35),
					revenue: Math.round(day.revenue * .35)
				},
				{
					id: `creative-${provider}-${idx}-3`,
					name: "Carousel Collection",
					type: "carousel",
					spend: Math.round(day.spend * .25),
					impressions: Math.round(day.impressions * .25),
					clicks: Math.round(day.clicks * .25),
					conversions: Math.round(day.conversions * .25),
					revenue: Math.round(day.revenue * .25)
				}
			];
			records.push(metric);
		});
	});
	return records;
}
function getPreviewAnalyticsInsights() {
	return {
		insights: [
			{
				providerId: "google-analytics",
				summary: "Google Analytics shows healthy acquisition quality this period: users are generating repeat sessions, conversion efficiency is stable, and revenue is concentrated on a few standout days. Review the traffic sources and landing pages tied to your peak session and revenue days to scale what is already working."
			},
			{
				providerId: "google",
				summary: "Google Ads is performing exceptionally well with a 12.5x ROAS. Your search campaigns are driving high-intent traffic with a 3.5% conversion rate. Consider increasing budget allocation to capture more market share during peak hours."
			},
			{
				providerId: "facebook",
				summary: "Meta Ads shows strong engagement metrics with video content outperforming static images by 45%. Your retargeting audiences are converting at 2.8x the rate of cold traffic. Lookalike audiences based on recent converters could expand reach efficiently."
			},
			{
				providerId: "linkedin",
				summary: "LinkedIn Ads delivers the highest quality leads with a $185 average deal value. B2B targeting is precise, though CPCs remain elevated. Consider testing Sponsored InMail for decision-maker outreach."
			}
		],
		algorithmic: [
			{
				providerId: "google-analytics",
				suggestions: [{
					type: "efficiency",
					level: "success",
					title: "Strong session quality",
					message: "Users are generating multiple sessions and sustaining a healthy conversion rate for the selected period.",
					suggestion: "Use your peak-conversion days as a benchmark when reviewing acquisition sources and landing pages.",
					score: 88
				}, {
					type: "audience",
					level: "info",
					title: "Revenue clusters on a few days",
					message: "Revenue is concentrated on a small number of standout days, suggesting a few high-value campaigns or pages are doing most of the work.",
					suggestion: "Identify the top-performing traffic sources and experiences behind those days and replicate them.",
					score: 80
				}]
			},
			{
				providerId: "google",
				suggestions: [{
					type: "efficiency",
					level: "success",
					title: "Strong ROAS Performance",
					message: "Your Google Ads campaigns are generating $12.50 for every $1 spent, well above the industry benchmark of $4.",
					suggestion: "Increase daily budget by 20% to capture additional high-converting traffic.",
					score: 92
				}, {
					type: "audience",
					level: "info",
					title: "Audience Expansion Opportunity",
					message: "Similar audiences to your top converters show 85% match rate.",
					suggestion: "Test expanding to in-market audiences for related product categories."
				}]
			},
			{
				providerId: "facebook",
				suggestions: [{
					type: "creative",
					level: "warning",
					title: "Creative Fatigue Detected",
					message: "Top performing creatives have been running for 14+ days with declining CTR.",
					suggestion: "Refresh ad creative with new variants to maintain engagement rates.",
					score: 68
				}, {
					type: "budget",
					level: "success",
					title: "Efficient Spend Allocation",
					message: "Your CPA of $8.43 is 32% below your target of $12.50.",
					suggestion: "Reallocate budget from underperforming ad sets to top performers.",
					score: 85
				}]
			},
			{
				providerId: "global",
				suggestions: [{
					type: "budget",
					level: "info",
					title: "Cross-Platform Optimization",
					message: "Google drives 48% of conversions with 35% of spend, while LinkedIn has highest CPL.",
					suggestion: "Shift 10% of LinkedIn budget to Google for better overall efficiency.",
					score: 78
				}]
			}
		]
	};
}
object({
	company: object({
		name: string().default(""),
		website: string().default(""),
		industry: string().default(""),
		size: string().default(""),
		locations: string().default("")
	}),
	marketing: object({
		budget: string().default(""),
		platforms: array(string()).default([]),
		adAccounts: _enum(["Yes", "No"]).default("No"),
		socialHandles: record(string(), string()).default({})
	}),
	goals: object({
		objectives: array(string()).default([]),
		audience: string().default(""),
		challenges: array(string()).default([]),
		customChallenge: string().default("")
	}),
	scope: object({
		services: array(string()).default([]),
		otherService: string().default("")
	}),
	timelines: object({
		startTime: string().default(""),
		upcomingEvents: string().default("")
	}),
	value: object({
		proposalSize: string().default(""),
		engagementType: string().default(""),
		additionalNotes: string().default(""),
		presentationTheme: string().default("")
	})
});
var proposalFormInputSchema = looseObject({}).transform((value) => value).catch({});
var DEFAULT_PROPOSAL_FORM = {
	company: {
		name: "",
		website: "",
		industry: "",
		size: "",
		locations: ""
	},
	marketing: {
		budget: "",
		platforms: [],
		adAccounts: "No",
		socialHandles: {}
	},
	goals: {
		objectives: [],
		audience: "",
		challenges: [],
		customChallenge: ""
	},
	scope: {
		services: [],
		otherService: ""
	},
	timelines: {
		startTime: "",
		upcomingEvents: ""
	},
	value: {
		proposalSize: "",
		engagementType: "",
		additionalNotes: "",
		presentationTheme: ""
	}
};
object({
	formData: proposalFormInputSchema.optional().default({}),
	stepProgress: number().int().min(0).max(10).default(0),
	status: _enum([
		"draft",
		"in_progress",
		"ready",
		"partial_success",
		"sent",
		"failed"
	]).default("draft"),
	clientId: string().trim().min(1).max(120).optional(),
	clientName: string().trim().min(1).max(200).optional()
});
object({
	formData: proposalFormInputSchema.optional(),
	stepProgress: number().int().min(0).max(10).optional(),
	status: _enum([
		"draft",
		"in_progress",
		"ready",
		"partial_success",
		"sent",
		"failed"
	]).optional(),
	clientId: string().trim().min(1).max(120).optional(),
	clientName: string().trim().min(1).max(200).optional()
});
function createDefaultProposalForm() {
	return {
		company: { ...DEFAULT_PROPOSAL_FORM.company },
		marketing: {
			...DEFAULT_PROPOSAL_FORM.marketing,
			platforms: [...DEFAULT_PROPOSAL_FORM.marketing.platforms],
			socialHandles: { ...DEFAULT_PROPOSAL_FORM.marketing.socialHandles }
		},
		goals: {
			...DEFAULT_PROPOSAL_FORM.goals,
			objectives: [...DEFAULT_PROPOSAL_FORM.goals.objectives],
			challenges: [...DEFAULT_PROPOSAL_FORM.goals.challenges]
		},
		scope: {
			...DEFAULT_PROPOSAL_FORM.scope,
			services: [...DEFAULT_PROPOSAL_FORM.scope.services]
		},
		timelines: { ...DEFAULT_PROPOSAL_FORM.timelines },
		value: { ...DEFAULT_PROPOSAL_FORM.value }
	};
}
function mergeProposalForm(partial) {
	const defaults = createDefaultProposalForm();
	if (!partial) return defaults;
	return {
		company: {
			...defaults.company,
			...partial.company
		},
		marketing: {
			...defaults.marketing,
			...partial.marketing,
			socialHandles: {
				...defaults.marketing.socialHandles,
				...partial.marketing?.socialHandles ?? {}
			}
		},
		goals: {
			...defaults.goals,
			...partial.goals
		},
		scope: {
			...defaults.scope,
			...partial.scope
		},
		timelines: {
			...defaults.timelines,
			...partial.timelines
		},
		value: {
			...defaults.value,
			...partial.value
		}
	};
}
function buildPreviewDeck(proposalId, instructions) {
	const previewRoute = withPreviewModeSearchParam(`/dashboard/proposals/${proposalId}/deck`);
	return {
		generationId: `preview-deck-${proposalId}`,
		status: "ready",
		instructions,
		webUrl: previewRoute,
		shareUrl: previewRoute,
		pptxUrl: previewRoute,
		pdfUrl: null,
		generatedFiles: [],
		storageUrl: previewRoute,
		pdfStorageUrl: null,
		warnings: null,
		error: null
	};
}
function getPreviewProjects(clientId) {
	const clients = getPreviewClients();
	const clientNameFromId = new Map(clients.map((c) => [c.id, c.name]));
	const projects = [
		{
			id: "preview-project-1",
			name: "Q1 Brand Refresh Campaign",
			description: "Complete brand identity overhaul including new visual guidelines, messaging framework, and asset library.",
			status: "active",
			clientId: "preview-tech-corp",
			clientName: clientNameFromId.get("preview-tech-corp") ?? "Tech Corp",
			startDate: isoDaysAgo(30),
			endDate: isoDaysAgo(-30),
			tags: [
				"branding",
				"design",
				"strategy"
			],
			ownerId: null,
			createdAt: isoDaysAgo(35),
			updatedAt: isoDaysAgo(1),
			taskCount: 12,
			openTaskCount: 4,
			recentActivityAt: isoDaysAgo(1)
		},
		{
			id: "preview-project-2",
			name: "Product Launch Marketing",
			description: "Multi-channel marketing campaign for new product line launch including paid media, content, and PR.",
			status: "planning",
			clientId: "preview-startupxyz",
			clientName: clientNameFromId.get("preview-startupxyz") ?? "StartupXYZ",
			startDate: isoDaysAgo(-7),
			endDate: isoDaysAgo(-60),
			tags: [
				"launch",
				"paid-media",
				"content"
			],
			ownerId: null,
			createdAt: isoDaysAgo(14),
			updatedAt: isoDaysAgo(2),
			taskCount: 8,
			openTaskCount: 8,
			recentActivityAt: isoDaysAgo(2)
		},
		{
			id: "preview-project-3",
			name: "Holiday Sales Campaign",
			description: "Seasonal promotional campaign targeting key shopping periods with special offers and creative.",
			status: "completed",
			clientId: "preview-retail-store",
			clientName: clientNameFromId.get("preview-retail-store") ?? "Retail Store",
			startDate: isoDaysAgo(90),
			endDate: isoDaysAgo(30),
			tags: [
				"seasonal",
				"promotions",
				"retail"
			],
			ownerId: null,
			createdAt: isoDaysAgo(95),
			updatedAt: isoDaysAgo(30),
			taskCount: 15,
			openTaskCount: 0,
			recentActivityAt: isoDaysAgo(30)
		},
		{
			id: "preview-project-4",
			name: "Social Media Management",
			description: "Ongoing social media strategy, content creation, and community management across platforms.",
			status: "active",
			clientId: "preview-tech-corp",
			clientName: clientNameFromId.get("preview-tech-corp") ?? "Tech Corp",
			startDate: isoDaysAgo(60),
			endDate: null,
			tags: [
				"social",
				"content",
				"ongoing"
			],
			ownerId: null,
			createdAt: isoDaysAgo(65),
			updatedAt: isoDaysAgo(0),
			taskCount: 20,
			openTaskCount: 6,
			recentActivityAt: isoDaysAgo(0)
		},
		{
			id: "preview-project-5",
			name: "SEO Optimization Sprint",
			description: "Technical SEO audit and implementation of recommendations to improve organic search visibility.",
			status: "on_hold",
			clientId: "preview-startupxyz",
			clientName: clientNameFromId.get("preview-startupxyz") ?? "StartupXYZ",
			startDate: isoDaysAgo(45),
			endDate: isoDaysAgo(-15),
			tags: [
				"seo",
				"technical",
				"optimization"
			],
			ownerId: null,
			createdAt: isoDaysAgo(50),
			updatedAt: isoDaysAgo(10),
			taskCount: 6,
			openTaskCount: 3,
			recentActivityAt: isoDaysAgo(10)
		}
	];
	if (!clientId) return projects;
	return projects.filter((p) => p.clientId === clientId);
}
function getPreviewProjectMilestones(clientId, projectIds) {
	const visibleProjectIds = new Set(getPreviewProjects(clientId).map((project) => project.id));
	const scopedProjectIds = Array.isArray(projectIds) && projectIds.length > 0 ? new Set(projectIds.filter((projectId) => visibleProjectIds.has(projectId))) : visibleProjectIds;
	return [
		{
			id: "preview-milestone-1",
			projectId: "preview-project-1",
			title: "Discovery workshop complete",
			description: "Stakeholder interviews, positioning review, and existing asset audit are wrapped.",
			status: "completed",
			startDate: isoDaysAgo(28),
			endDate: isoDaysAgo(24),
			ownerId: null,
			order: 1,
			createdAt: isoDaysAgo(30),
			updatedAt: isoDaysAgo(24)
		},
		{
			id: "preview-milestone-2",
			projectId: "preview-project-1",
			title: "Visual system approval",
			description: "Palette, typography, and layout system are queued for final client sign-off.",
			status: "in_progress",
			startDate: isoDaysAgo(12),
			endDate: isoDaysAgo(-2),
			ownerId: null,
			order: 2,
			createdAt: isoDaysAgo(15),
			updatedAt: isoDaysAgo(1)
		},
		{
			id: "preview-milestone-3",
			projectId: "preview-project-1",
			title: "Launch kit rollout",
			description: "Delivery pack for paid, lifecycle, and sales enablement assets.",
			status: "planned",
			startDate: isoDaysAgo(-4),
			endDate: isoDaysAgo(-18),
			ownerId: null,
			order: 3,
			createdAt: isoDaysAgo(8),
			updatedAt: isoDaysAgo(2)
		},
		{
			id: "preview-milestone-4",
			projectId: "preview-project-2",
			title: "Launch brief signed off",
			description: "Final campaign brief, audience angles, and success metrics are approved.",
			status: "completed",
			startDate: isoDaysAgo(10),
			endDate: isoDaysAgo(7),
			ownerId: null,
			order: 1,
			createdAt: isoDaysAgo(12),
			updatedAt: isoDaysAgo(7)
		},
		{
			id: "preview-milestone-5",
			projectId: "preview-project-2",
			title: "Creator shortlist finalization",
			description: "Shortlist, rate cards, and draft outreach notes are in review.",
			status: "in_progress",
			startDate: isoDaysAgo(3),
			endDate: isoDaysAgo(-5),
			ownerId: null,
			order: 2,
			createdAt: isoDaysAgo(4),
			updatedAt: isoDaysAgo(1)
		},
		{
			id: "preview-milestone-6",
			projectId: "preview-project-3",
			title: "Holiday recap delivered",
			description: "Final revenue recap, annotated learnings, and creative archive shared with the client.",
			status: "completed",
			startDate: isoDaysAgo(40),
			endDate: isoDaysAgo(30),
			ownerId: null,
			order: 1,
			createdAt: isoDaysAgo(42),
			updatedAt: isoDaysAgo(30)
		},
		{
			id: "preview-milestone-7",
			projectId: "preview-project-4",
			title: "Monthly content sprint",
			description: "April content calendar, edit queue, and approval stack are being assembled.",
			status: "in_progress",
			startDate: isoDaysAgo(2),
			endDate: isoDaysAgo(-12),
			ownerId: null,
			order: 1,
			createdAt: isoDaysAgo(5),
			updatedAt: isoDaysAgo(0)
		},
		{
			id: "preview-milestone-8",
			projectId: "preview-project-4",
			title: "Executive reporting template",
			description: "Board-facing summary with channel pacing and experiment notes.",
			status: "planned",
			startDate: isoDaysAgo(-7),
			endDate: isoDaysAgo(-21),
			ownerId: null,
			order: 2,
			createdAt: isoDaysAgo(1),
			updatedAt: isoDaysAgo(0)
		},
		{
			id: "preview-milestone-9",
			projectId: "preview-project-5",
			title: "Technical SEO audit",
			description: "Crawl, template review, and indexation diagnosis delivered to the client.",
			status: "completed",
			startDate: isoDaysAgo(38),
			endDate: isoDaysAgo(32),
			ownerId: null,
			order: 1,
			createdAt: isoDaysAgo(40),
			updatedAt: isoDaysAgo(32)
		},
		{
			id: "preview-milestone-10",
			projectId: "preview-project-5",
			title: "Redirect cleanup batch",
			description: "Remaining redirect and canonical fixes are waiting on engineering bandwidth.",
			status: "blocked",
			startDate: isoDaysAgo(15),
			endDate: isoDaysAgo(-4),
			ownerId: null,
			order: 2,
			createdAt: isoDaysAgo(18),
			updatedAt: isoDaysAgo(6)
		}
	].reduce((acc, milestone) => {
		if (!scopedProjectIds.has(milestone.projectId)) return acc;
		const existing = acc[milestone.projectId] ?? [];
		acc[milestone.projectId] = [...existing, milestone].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
		return acc;
	}, {});
}
function getPreviewTasks(clientId) {
	const clientNameFromId = new Map(getPreviewClients().map((c) => [c.id, c.name]));
	const now = typeof window === "undefined" ? /* @__PURE__ */ new Date("2024-01-15T12:00:00.000Z") : /* @__PURE__ */ new Date();
	const tasks = [
		{
			id: "preview-task-1",
			title: "Review Q3 performance report",
			description: "Summarize key wins, risks, and next actions.",
			status: "in-progress",
			priority: "high",
			assignedTo: ["Alex Morgan", "Jordan Lee"],
			clientId: "preview-tech-corp",
			client: clientNameFromId.get("preview-tech-corp") ?? "Tech Corp",
			projectId: "preview-project-4",
			projectName: "Social Media Management",
			dueDate: new Date(now.getTime() + 360 * 60 * 1e3).toISOString(),
			attachments: [{
				name: "q3-performance-recap.pdf",
				url: "#",
				type: "application/pdf",
				size: "1.8 MB"
			}],
			createdAt: isoDaysAgo(3),
			updatedAt: isoDaysAgo(1),
			deletedAt: null,
			subtaskCount: 2,
			commentCount: 4,
			timeSpentMinutes: 95,
			estimatedMinutes: 180,
			dependencies: [{
				taskId: "preview-task-4",
				type: "blocked-by"
			}],
			activities: [{
				id: "preview-task-1-activity-1",
				taskId: "preview-task-1",
				userId: "preview-user-1",
				userName: "Alex Morgan",
				userRole: "Account Manager",
				action: "updated",
				field: "description",
				oldValue: "Summarize report",
				newValue: "Summarize key wins, risks, and next actions.",
				timestamp: isoDaysAgo(1)
			}],
			timeEntries: [{
				id: "preview-task-1-entry-1",
				userId: "preview-user-2",
				userName: "Jordan Lee",
				startTime: isoDaysAgo(1),
				endTime: isoDaysAgo(1),
				duration: 55,
				note: "Reviewed pacing anomalies and narrative summary."
			}]
		},
		{
			id: "preview-task-2",
			title: "Create proposal for new client",
			description: "Draft scope, timeline, and success metrics.",
			status: "review",
			priority: "medium",
			assignedTo: ["Priya Patel", "Lena Ortiz"],
			clientId: "preview-startupxyz",
			client: clientNameFromId.get("preview-startupxyz") ?? "StartupXYZ",
			projectId: "preview-project-2",
			projectName: "Product Launch Marketing",
			dueDate: new Date(now.getTime() + 2160 * 60 * 1e3).toISOString(),
			commentCount: 6,
			subtaskCount: 3,
			timeSpentMinutes: 140,
			estimatedMinutes: 240,
			createdAt: isoDaysAgo(2),
			updatedAt: isoDaysAgo(2),
			deletedAt: null
		},
		{
			id: "preview-task-3",
			title: "Optimize Google Ads campaigns",
			description: "Improve ROAS by tightening targeting + creatives.",
			status: "todo",
			priority: "low",
			assignedTo: ["Sam Chen"],
			clientId: "preview-retail-store",
			client: clientNameFromId.get("preview-retail-store") ?? "Retail Store",
			projectId: "preview-project-3",
			projectName: "Holiday Sales Campaign",
			dueDate: new Date(now.getTime() + 7200 * 60 * 1e3).toISOString(),
			createdAt: isoDaysAgo(1),
			updatedAt: isoDaysAgo(1),
			deletedAt: null,
			commentCount: 1,
			estimatedMinutes: 90
		},
		{
			id: "preview-task-4",
			title: "Finalize board-ready KPI narrative",
			description: "Condense channel-level results into an executive summary with one clear action plan.",
			status: "completed",
			priority: "urgent",
			assignedTo: ["Alex Morgan"],
			clientId: "preview-tech-corp",
			client: clientNameFromId.get("preview-tech-corp") ?? "Tech Corp",
			projectId: "preview-project-1",
			projectName: "Q1 Brand Refresh Campaign",
			dueDate: (/* @__PURE__ */ new Date(now.getTime() - 720 * 60 * 1e3)).toISOString(),
			attachments: [{
				name: "executive-narrative-v4.docx",
				url: "#",
				type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				size: "640 KB"
			}],
			createdAt: isoDaysAgo(6),
			updatedAt: isoDaysAgo(0),
			deletedAt: null,
			commentCount: 8,
			timeSpentMinutes: 210,
			estimatedMinutes: 180,
			activities: [{
				id: "preview-task-4-activity-1",
				taskId: "preview-task-4",
				userId: "preview-user-1",
				userName: "Alex Morgan",
				userRole: "Account Manager",
				action: "status_changed",
				oldValue: "review",
				newValue: "completed",
				timestamp: isoDaysAgo(0)
			}]
		},
		{
			id: "preview-task-5",
			title: "Lock creator shortlist for launch week",
			description: "Confirm final shortlist, rate cards, and fallback options before approvals close.",
			status: "in-progress",
			priority: "high",
			assignedTo: ["Priya Patel", "Sam Chen"],
			clientId: "preview-startupxyz",
			client: clientNameFromId.get("preview-startupxyz") ?? "StartupXYZ",
			projectId: "preview-project-2",
			projectName: "Product Launch Marketing",
			dueDate: new Date(now.getTime() + 1080 * 60 * 1e3).toISOString(),
			createdAt: isoDaysAgo(4),
			updatedAt: isoDaysAgo(0),
			deletedAt: null,
			subtaskCount: 4,
			commentCount: 5,
			timeSpentMinutes: 125,
			estimatedMinutes: 240,
			sharedWith: ["launch@startupxyz.example"]
		},
		{
			id: "preview-task-6",
			title: "QA lifecycle email segmentation",
			description: "Validate spring promo segmentation rules and suppressions before send day.",
			status: "review",
			priority: "medium",
			assignedTo: ["Taylor Kim", "Noah Bennett"],
			clientId: "preview-retail-store",
			client: clientNameFromId.get("preview-retail-store") ?? "Retail Store",
			projectId: "preview-project-3",
			projectName: "Holiday Sales Campaign",
			dueDate: new Date(now.getTime() + 1680 * 60 * 1e3).toISOString(),
			createdAt: isoDaysAgo(5),
			updatedAt: isoDaysAgo(1),
			deletedAt: null,
			commentCount: 2,
			timeSpentMinutes: 70,
			estimatedMinutes: 120
		},
		{
			id: "preview-task-7",
			title: "Refresh paid social motion cutdowns",
			description: "Ship three revised motion variants for retargeting and prospecting audiences.",
			status: "todo",
			priority: "medium",
			assignedTo: ["Mia Thompson"],
			clientId: "preview-tech-corp",
			client: clientNameFromId.get("preview-tech-corp") ?? "Tech Corp",
			projectId: "preview-project-4",
			projectName: "Social Media Management",
			dueDate: new Date(now.getTime() + 4320 * 60 * 1e3).toISOString(),
			createdAt: isoDaysAgo(1),
			updatedAt: isoDaysAgo(0),
			deletedAt: null,
			subtaskCount: 3,
			estimatedMinutes: 150
		},
		{
			id: "preview-task-8",
			title: "Prepare post-campaign revenue recap",
			description: "Compile blended channel performance and summarize the revenue contribution by audience cohort.",
			status: "archived",
			priority: "low",
			assignedTo: ["Taylor Kim"],
			clientId: "preview-retail-store",
			client: clientNameFromId.get("preview-retail-store") ?? "Retail Store",
			projectId: "preview-project-3",
			projectName: "Holiday Sales Campaign",
			dueDate: (/* @__PURE__ */ new Date(now.getTime() - 14400 * 60 * 1e3)).toISOString(),
			createdAt: isoDaysAgo(18),
			updatedAt: isoDaysAgo(12),
			deletedAt: null,
			commentCount: 3,
			timeSpentMinutes: 160,
			estimatedMinutes: 150
		}
	];
	if (!clientId) return tasks;
	return tasks.filter((t) => t.clientId === clientId);
}
function getPreviewProposals(clientId) {
	const clients = getPreviewClients();
	const clientNameFromId = new Map(clients.map((c) => [c.id, c.name]));
	const proposals = [
		{
			id: "preview-proposal-1",
			clientId: "preview-tech-corp",
			clientName: clientNameFromId.get("preview-tech-corp") ?? "Tech Corp",
			status: "ready",
			stepProgress: 5,
			formData: mergeProposalForm({
				company: {
					name: "Tech Corp",
					website: "https://techcorp.example",
					industry: "B2B SaaS",
					size: "201-500",
					locations: "London, New York"
				},
				marketing: {
					budget: "$15k - $25k",
					platforms: ["linkedin", "google_ads"],
					adAccounts: "Yes",
					socialHandles: { linkedin: "techcorp" }
				},
				goals: {
					objectives: ["brand_awareness", "lead_generation"],
					audience: "Revenue leaders and demand generation teams at mid-market SaaS companies.",
					challenges: ["low_pipeline_quality", "limited_brand_recall"],
					customChallenge: "Need a stronger thought-leadership engine for enterprise buyers."
				},
				scope: {
					services: [
						"paid_media",
						"content_marketing",
						"landing_pages"
					],
					otherService: ""
				},
				timelines: {
					startTime: "Within 30 days",
					upcomingEvents: "Q2 product expansion and partner summit launch."
				},
				value: {
					proposalSize: "$25k - $50k",
					engagementType: "Retainer",
					additionalNotes: "Need executive-friendly reporting and strong creative testing cadence.",
					presentationTheme: "Executive growth board"
				}
			}),
			aiInsights: { summary: "Prioritize LinkedIn demand capture with executive-proof creative themes and use Google Search to harvest high-intent demand already in market." },
			aiSuggestions: "Based on your goals, we recommend focusing on LinkedIn and Google Ads for B2B lead generation, combined with thought leadership content to build brand authority.",
			presentationDeck: buildPreviewDeck("preview-proposal-1", "Slide 1: Executive Growth Snapshot * Position Cohorts as the paid growth partner for Tech Corp * Align around pipeline quality, brand recall, and faster sales cycles Slide 2: Market Opportunity * Capture high-intent demand on Google Search * Build category authority with LinkedIn thought leadership Slide 3: Campaign Architecture * Search for intent capture * LinkedIn for ICP education and retargeting * Landing pages tuned for demo conversion Slide 4: Creative Direction * Executive-proof messaging * Proof-led customer stories * Clear value framing by funnel stage Slide 5: Measurement Plan * Weekly pacing and creative diagnostics * Pipeline contribution dashboard * Monthly board-ready narrative recap"),
			pptUrl: withPreviewModeSearchParam("/dashboard/proposals/preview-proposal-1/deck"),
			pdfUrl: null,
			createdAt: isoDaysAgo(7),
			updatedAt: isoDaysAgo(5),
			lastAutosaveAt: isoDaysAgo(5)
		},
		{
			id: "preview-proposal-2",
			clientId: "preview-startupxyz",
			clientName: clientNameFromId.get("preview-startupxyz") ?? "StartupXYZ",
			status: "draft",
			stepProgress: 2,
			formData: mergeProposalForm({
				company: {
					name: "StartupXYZ",
					website: "https://startupxyz.example",
					industry: "Consumer App",
					size: "11-50",
					locations: "Berlin"
				},
				marketing: {
					budget: "$8k - $12k",
					platforms: ["tiktok", "instagram"],
					adAccounts: "Yes",
					socialHandles: {
						instagram: "startupxyz",
						tiktok: "@startupxyz"
					}
				},
				goals: {
					objectives: ["product_launch"],
					audience: "Gen Z and millennial early adopters interested in productivity tools.",
					challenges: ["low_awareness"],
					customChallenge: "Need launch buzz before App Store featuring window closes."
				},
				scope: {
					services: ["social_media", "influencer_marketing"],
					otherService: "Launch landing page polish"
				},
				timelines: {
					startTime: "Immediately",
					upcomingEvents: "Public launch in three weeks."
				},
				value: {
					proposalSize: "$10k - $25k",
					engagementType: "Project",
					additionalNotes: "Need launch-ready content calendar and creator shortlist.",
					presentationTheme: "Launch sprint"
				}
			}),
			aiInsights: { summary: "The strongest draft angle is a creator-led launch burst supported by short-form paid amplification and a tight conversion path to the app waitlist." },
			aiSuggestions: null,
			presentationDeck: null,
			pptUrl: null,
			pdfUrl: null,
			createdAt: isoDaysAgo(3),
			updatedAt: isoDaysAgo(1),
			lastAutosaveAt: isoDaysAgo(1)
		},
		{
			id: "preview-proposal-3",
			clientId: "preview-retail-store",
			clientName: clientNameFromId.get("preview-retail-store") ?? "Retail Store",
			status: "ready",
			stepProgress: 5,
			formData: mergeProposalForm({
				company: {
					name: "Retail Store",
					website: "https://retailstore.example",
					industry: "Retail",
					size: "51-200",
					locations: "Manchester, Leeds"
				},
				marketing: {
					budget: "$8k - $15k",
					platforms: ["meta_ads", "email"],
					adAccounts: "Yes",
					socialHandles: { instagram: "retailstore" }
				},
				goals: {
					objectives: ["sales_growth", "customer_retention"],
					audience: "Existing high-value shoppers and lapsed holiday purchasers.",
					challenges: ["repeat_purchase_rate"],
					customChallenge: "Need a post-holiday retention plan that keeps AOV high."
				},
				scope: {
					services: [
						"email_marketing",
						"paid_media",
						"loyalty_program"
					],
					otherService: ""
				},
				timelines: {
					startTime: "Next month",
					upcomingEvents: "Spring promotion calendar and loyalty relaunch."
				},
				value: {
					proposalSize: "$10k - $25k",
					engagementType: "Retainer",
					additionalNotes: "Retention work should pair lifecycle email with dynamic remarketing.",
					presentationTheme: "Retail retention engine"
				}
			}),
			aiInsights: { summary: "Retention gains will likely come from pairing dynamic remarketing with segmented lifecycle email flows for high-value customers and lapsed holiday buyers." },
			aiSuggestions: "For retail, we suggest a multi-touch approach combining retargeting ads, personalized email sequences, and a referral program to maximize customer lifetime value.",
			presentationDeck: buildPreviewDeck("preview-proposal-3", "Slide 1: Retention Growth Plan * Focus on repeat purchase rate and AOV expansion * Align promotions to lifecycle triggers Slide 2: Audience Segments * VIP loyalists * Recent one-time buyers * Lapsed holiday purchasers Slide 3: Channel Mix * Meta dynamic remarketing for product recall * Email journeys for replenishment and loyalty nudges * Referral loop for advocacy Slide 4: Offer Strategy * Tiered loyalty perks * Bundled spring promotions * Margin-safe win-back offers Slide 5: Measurement Plan * Repeat purchase rate by segment * Revenue per recipient * Incremental ROAS from remarketing cohorts"),
			pptUrl: withPreviewModeSearchParam("/dashboard/proposals/preview-proposal-3/deck"),
			pdfUrl: null,
			createdAt: isoDaysAgo(14),
			updatedAt: isoDaysAgo(10),
			lastAutosaveAt: isoDaysAgo(10)
		}
	];
	if (!clientId) return proposals;
	return proposals.filter((p) => p.clientId === clientId);
}
function getPreviewActivity(clientId) {
	const activities = [
		{
			id: "preview-activity-1",
			type: "task_activity",
			timestamp: isoDaysAgo(0),
			clientId: "preview-tech-corp",
			entityId: "preview-task-1",
			entityName: "Review Q3 performance report",
			description: "Task marked as completed by Alex Morgan",
			navigationUrl: "/dashboard/tasks?taskId=preview-task-1"
		},
		{
			id: "preview-activity-2",
			type: "message_posted",
			timestamp: isoDaysAgo(0),
			clientId: "preview-tech-corp",
			entityId: "preview-message-1",
			entityName: "Q1 Brand Refresh Campaign",
			description: "New comment on project discussion",
			navigationUrl: "/dashboard/collaboration?projectId=preview-project-1"
		},
		{
			id: "preview-activity-3",
			type: "project_updated",
			timestamp: isoDaysAgo(1),
			clientId: "preview-startupxyz",
			entityId: "preview-project-2",
			entityName: "Product Launch Marketing",
			description: "Project status changed to Planning",
			navigationUrl: "/dashboard/projects?projectId=preview-project-2"
		},
		{
			id: "preview-activity-4",
			type: "task_activity",
			timestamp: isoDaysAgo(1),
			clientId: "preview-retail-store",
			entityId: "preview-task-4",
			entityName: "Finalize holiday creative assets",
			description: "Task completed ahead of schedule",
			navigationUrl: "/dashboard/tasks?taskId=preview-task-4"
		},
		{
			id: "preview-activity-5",
			type: "message_posted",
			timestamp: isoDaysAgo(2),
			clientId: "preview-startupxyz",
			entityId: "preview-message-2",
			entityName: "SEO Optimization Sprint",
			description: "Priya Patel shared the technical audit results",
			navigationUrl: "/dashboard/collaboration?projectId=preview-project-5"
		},
		{
			id: "preview-activity-6",
			type: "project_updated",
			timestamp: isoDaysAgo(3),
			clientId: "preview-tech-corp",
			entityId: "preview-project-4",
			entityName: "Social Media Management",
			description: "New milestone added: Q2 Content Calendar",
			navigationUrl: "/dashboard/projects?projectId=preview-project-4"
		},
		{
			id: "preview-activity-7",
			type: "task_activity",
			timestamp: isoDaysAgo(4),
			clientId: "preview-tech-corp",
			entityId: "preview-task-5",
			entityName: "Set up analytics tracking",
			description: "Conversion tracking now live across all campaigns",
			navigationUrl: "/dashboard/tasks?taskId=preview-task-5"
		},
		{
			id: "preview-activity-8",
			type: "message_posted",
			timestamp: isoDaysAgo(5),
			clientId: "preview-retail-store",
			entityId: "preview-message-3",
			entityName: "Holiday Sales Campaign",
			description: "Final performance report shared with stakeholders",
			navigationUrl: "/dashboard/collaboration?projectId=preview-project-3"
		}
	];
	if (!clientId) return activities;
	return activities.filter((a) => a.clientId === clientId);
}
function getPreviewNotifications(clientId = null) {
	const notifications = [
		{
			id: "preview-notif-1",
			kind: "task.updated",
			title: "Task assigned to you",
			body: "You have been assigned to \"Review Q3 performance report\"",
			actor: {
				id: "preview-user-1",
				name: "Alex Morgan"
			},
			resource: {
				type: "task",
				id: "preview-task-1"
			},
			recipients: {
				roles: ["team"],
				clientId: "preview-tech-corp",
				clientIds: ["preview-tech-corp"]
			},
			navigationUrl: "/dashboard/tasks?taskId=preview-task-1",
			createdAt: isoDaysAgo(0),
			updatedAt: isoDaysAgo(0),
			read: false,
			acknowledged: false
		},
		{
			id: "preview-notif-2",
			kind: "collaboration.mention",
			title: "You were mentioned",
			body: "Priya Patel mentioned you in \"Product Launch Marketing\"",
			actor: {
				id: "preview-user-2",
				name: "Priya Patel"
			},
			resource: {
				type: "collaboration",
				id: "preview-message-1"
			},
			recipients: {
				roles: ["team"],
				clientId: "preview-startupxyz",
				clientIds: ["preview-startupxyz"]
			},
			navigationUrl: "/dashboard/collaboration?projectId=preview-project-2",
			createdAt: isoDaysAgo(1),
			updatedAt: isoDaysAgo(1),
			read: false,
			acknowledged: false
		},
		{
			id: "preview-notif-3",
			kind: "proposal.deck.ready",
			title: "Proposal deck ready",
			body: "Your presentation for Tech Corp is ready to download",
			actor: {
				id: null,
				name: "System"
			},
			resource: {
				type: "proposal",
				id: "preview-proposal-1"
			},
			recipients: {
				roles: ["team"],
				clientId: "preview-tech-corp",
				clientIds: ["preview-tech-corp"]
			},
			navigationUrl: withPreviewModeSearchParam("/dashboard/proposals/preview-proposal-1/deck"),
			createdAt: isoDaysAgo(2),
			updatedAt: isoDaysAgo(2),
			read: true,
			acknowledged: false
		},
		{
			id: "preview-notif-4",
			kind: "task.mention",
			title: "Mentioned in a task comment",
			body: "Jordan Lee asked for revised KPI targets on the growth sprint task.",
			actor: {
				id: "preview-user-3",
				name: "Jordan Lee"
			},
			resource: {
				type: "task",
				id: "preview-task-2"
			},
			recipients: {
				roles: ["team"],
				clientId: "preview-tech-corp",
				clientIds: ["preview-tech-corp"]
			},
			navigationUrl: "/dashboard/tasks?taskId=preview-task-2",
			createdAt: isoDaysAgo(3),
			updatedAt: isoDaysAgo(3),
			read: false,
			acknowledged: false
		},
		{
			id: "preview-notif-5",
			kind: "project.created",
			title: "New project created",
			body: "Social Media Management project has been set up for Tech Corp",
			actor: {
				id: "preview-user-1",
				name: "Alex Morgan"
			},
			resource: {
				type: "project",
				id: "preview-project-4"
			},
			recipients: {
				roles: ["team"],
				clientId: "preview-tech-corp",
				clientIds: ["preview-tech-corp"]
			},
			navigationUrl: "/dashboard/projects?projectId=preview-project-4",
			createdAt: isoDaysAgo(5),
			updatedAt: isoDaysAgo(5),
			read: true,
			acknowledged: true
		},
		{
			id: "preview-notif-6",
			kind: "task.comment",
			title: "New task comment",
			body: "Mia Thompson left feedback on the paid social motion cutdowns task.",
			actor: {
				id: "preview-user-7",
				name: "Mia Thompson"
			},
			resource: {
				type: "task",
				id: "preview-task-7"
			},
			recipients: {
				roles: ["team"],
				clientId: "preview-tech-corp",
				clientIds: ["preview-tech-corp"]
			},
			navigationUrl: "/dashboard/tasks?taskId=preview-task-7",
			createdAt: isoDaysAgo(0),
			updatedAt: isoDaysAgo(0),
			read: false,
			acknowledged: false
		},
		{
			id: "preview-notif-7",
			kind: "collaboration.message",
			title: "New client channel update",
			body: "Taylor Kim posted a holiday revenue recap in the Retail Store channel.",
			actor: {
				id: "preview-user-5",
				name: "Taylor Kim"
			},
			resource: {
				type: "collaboration",
				id: "preview-collab-client-3"
			},
			recipients: {
				roles: ["team"],
				clientId: "preview-retail-store",
				clientIds: ["preview-retail-store"]
			},
			navigationUrl: "/dashboard/collaboration?clientId=preview-retail-store",
			createdAt: isoDaysAgo(1),
			updatedAt: isoDaysAgo(1),
			read: true,
			acknowledged: false
		},
		{
			id: "preview-notif-8",
			kind: "task.created",
			title: "Task added to launch project",
			body: "A new launch QA task was created for StartupXYZ.",
			actor: {
				id: "preview-user-3",
				name: "Priya Patel"
			},
			resource: {
				type: "task",
				id: "preview-task-5"
			},
			recipients: {
				roles: ["team"],
				clientId: "preview-startupxyz",
				clientIds: ["preview-startupxyz"]
			},
			navigationUrl: "/dashboard/tasks?taskId=preview-task-5",
			createdAt: isoDaysAgo(2),
			updatedAt: isoDaysAgo(2),
			read: false,
			acknowledged: false
		},
		{
			id: "preview-notif-9",
			kind: "proposal.deck.ready",
			title: "Launch deck regenerated",
			body: "StartupXYZ presentation deck has been regenerated with updated launch messaging.",
			actor: {
				id: null,
				name: "System"
			},
			resource: {
				type: "proposal",
				id: "preview-proposal-2"
			},
			recipients: {
				roles: ["team"],
				clientId: "preview-startupxyz",
				clientIds: ["preview-startupxyz"]
			},
			navigationUrl: withPreviewModeSearchParam("/dashboard/proposals/preview-proposal-2/deck"),
			createdAt: isoDaysAgo(3),
			updatedAt: isoDaysAgo(3),
			read: true,
			acknowledged: false
		},
		{
			id: "preview-notif-10",
			kind: "collaboration.mention",
			title: "Mentioned in team ops",
			body: "Casey Rivera mentioned you in the morning ops thread about client approvals.",
			actor: {
				id: "preview-user-6",
				name: "Casey Rivera"
			},
			resource: {
				type: "collaboration",
				id: "preview-collab-team-1"
			},
			recipients: { roles: ["team"] },
			navigationUrl: "/dashboard/collaboration?channel=team",
			createdAt: isoDaysAgo(4),
			updatedAt: isoDaysAgo(4),
			read: false,
			acknowledged: false
		}
	];
	if (!clientId) return notifications;
	return notifications.filter((notification) => {
		const recipientIds = [notification.recipients.clientId ?? null, ...notification.recipients.clientIds ?? []].filter((value) => typeof value === "string" && value.length > 0);
		return recipientIds.length === 0 || recipientIds.includes(clientId);
	});
}
var PREVIEW_SELF_TOKEN = "__preview_self__";
var PREVIEW_PARTICIPANTS = [
	{
		id: "preview-user-1",
		name: "Alex Morgan",
		email: "alex.morgan@preview.cohort",
		role: "Account Manager"
	},
	{
		id: "preview-user-2",
		name: "Jordan Lee",
		email: "jordan.lee@preview.cohort",
		role: "Strategist"
	},
	{
		id: "preview-user-3",
		name: "Priya Patel",
		email: "priya.patel@preview.cohort",
		role: "Account Manager"
	},
	{
		id: "preview-user-4",
		name: "Sam Chen",
		email: "sam.chen@preview.cohort",
		role: "Performance Marketer"
	},
	{
		id: "preview-user-5",
		name: "Taylor Kim",
		email: "taylor.kim@preview.cohort",
		role: "Account Manager"
	},
	{
		id: "preview-user-6",
		name: "Casey Rivera",
		email: "casey.rivera@preview.cohort",
		role: "Creative"
	},
	{
		id: "preview-user-7",
		name: "Mia Thompson",
		email: "mia.thompson@preview.cohort",
		role: "Brand Designer"
	},
	{
		id: "preview-user-8",
		name: "Noah Bennett",
		email: "noah.bennett@preview.cohort",
		role: "Lifecycle Specialist"
	},
	{
		id: "preview-user-9",
		name: "Lena Ortiz",
		email: "lena.ortiz@preview.cohort",
		role: "Lifecycle Strategist"
	}
];
var PREVIEW_DIRECT_CONVERSATIONS = [
	{
		legacyId: "preview-dm-alex",
		otherParticipantId: "preview-user-1"
	},
	{
		legacyId: "preview-dm-sam",
		otherParticipantId: "preview-user-4"
	},
	{
		legacyId: "preview-dm-casey",
		otherParticipantId: "preview-user-6"
	},
	{
		legacyId: "preview-dm-priya",
		otherParticipantId: "preview-user-3"
	},
	{
		legacyId: "preview-dm-noah",
		otherParticipantId: "preview-user-8"
	}
];
var PREVIEW_DIRECT_MESSAGES = {
	"preview-dm-alex": [
		{
			id: "preview-dm-alex-1",
			senderId: "preview-user-1",
			content: "Can you sanity-check the client-ready recap before I send it out?",
			createdAtMs: Date.parse(isoDaysAgo(0)) - 300 * 60 * 1e3,
			readBy: [PREVIEW_SELF_TOKEN],
			deliveredTo: ["preview-user-1", PREVIEW_SELF_TOKEN],
			readAtMs: Date.parse(isoDaysAgo(0)) - 14400 * 1e3
		},
		{
			id: "preview-dm-alex-2",
			senderId: PREVIEW_SELF_TOKEN,
			content: "Yes. Tighten the scope paragraph a bit and it is ready to go.",
			createdAtMs: Date.parse(isoDaysAgo(0)) - 14400 * 1e3,
			readBy: [PREVIEW_SELF_TOKEN, "preview-user-1"],
			deliveredTo: ["preview-user-1", PREVIEW_SELF_TOKEN],
			readAtMs: Date.parse(isoDaysAgo(0)) - 14400 * 1e3
		},
		{
			id: "preview-dm-alex-3",
			senderId: "preview-user-1",
			content: "Perfect. I will send the final version after standup.",
			createdAtMs: Date.parse(isoDaysAgo(0)) - 10800 * 1e3,
			readBy: [PREVIEW_SELF_TOKEN],
			deliveredTo: ["preview-user-1", PREVIEW_SELF_TOKEN],
			readAtMs: Date.parse(isoDaysAgo(0)) - 7200 * 1e3
		},
		{
			id: "preview-dm-alex-4",
			senderId: PREVIEW_SELF_TOKEN,
			content: "Uploading the final board-ready deck and pacing chart now.",
			createdAtMs: Date.parse(isoDaysAgo(0)) - 5400 * 1e3,
			attachments: [{
				name: "board-deck-v5.pdf",
				url: "#",
				type: "application/pdf",
				size: "3.2 MB"
			}, {
				name: "pacing-chart.png",
				url: "#",
				type: "image/png",
				size: "420 KB"
			}],
			sharedTo: ["email"],
			readBy: [PREVIEW_SELF_TOKEN],
			deliveredTo: ["preview-user-1", PREVIEW_SELF_TOKEN]
		}
	],
	"preview-dm-sam": [
		{
			id: "preview-dm-sam-1",
			senderId: PREVIEW_SELF_TOKEN,
			content: "Did the SEO crawl finish cleanly after the redirect fixes?",
			createdAtMs: Date.parse(isoDaysAgo(1)) - 7200 * 1e3,
			readBy: [PREVIEW_SELF_TOKEN, "preview-user-4"],
			deliveredTo: ["preview-user-4", PREVIEW_SELF_TOKEN],
			readAtMs: Date.parse(isoDaysAgo(1)) - 7200 * 1e3
		},
		{
			id: "preview-dm-sam-2",
			senderId: "preview-user-4",
			content: "Yes. Only two canonical issues left and I have them queued for today.",
			createdAtMs: Date.parse(isoDaysAgo(1)) - 3600 * 1e3,
			readBy: [],
			deliveredTo: ["preview-user-4", PREVIEW_SELF_TOKEN],
			reactions: [{
				emoji: "✅",
				count: 1,
				userIds: ["preview-user-4"]
			}]
		},
		{
			id: "preview-dm-sam-3",
			senderId: PREVIEW_SELF_TOKEN,
			content: "Great. Drop the crawl screenshot in here when it is ready so I can include it in the recap.",
			createdAtMs: Date.parse(isoDaysAgo(1)) - 1800 * 1e3,
			edited: true,
			editedAtMs: Date.parse(isoDaysAgo(1)) - 1500 * 1e3,
			readBy: [PREVIEW_SELF_TOKEN],
			deliveredTo: ["preview-user-4", PREVIEW_SELF_TOKEN]
		}
	],
	"preview-dm-casey": [
		{
			id: "preview-dm-casey-1",
			senderId: "preview-user-6",
			content: "Dropped three revised holiday concepts into the asset folder.",
			createdAtMs: Date.parse(isoDaysAgo(2)) - 10800 * 1e3,
			readBy: [PREVIEW_SELF_TOKEN],
			deliveredTo: ["preview-user-6", PREVIEW_SELF_TOKEN]
		},
		{
			id: "preview-dm-casey-2",
			senderId: PREVIEW_SELF_TOKEN,
			content: "Nice. The second direction feels strongest for paid social.",
			createdAtMs: Date.parse(isoDaysAgo(2)) - 7200 * 1e3,
			readBy: [PREVIEW_SELF_TOKEN, "preview-user-6"],
			deliveredTo: ["preview-user-6", PREVIEW_SELF_TOKEN]
		},
		{
			id: "preview-dm-casey-3",
			senderId: "preview-user-6",
			content: "Agreed. I also left comments in the Figma file for the CTA hierarchy.",
			createdAtMs: Date.parse(isoDaysAgo(2)) - 4500 * 1e3,
			attachments: [{
				name: "social-header-directions.fig",
				url: "#",
				type: "application/octet-stream",
				size: "6.1 MB"
			}],
			readBy: [PREVIEW_SELF_TOKEN],
			deliveredTo: ["preview-user-6", PREVIEW_SELF_TOKEN],
			reactions: [{
				emoji: "🔥",
				count: 2,
				userIds: ["preview-user-6", PREVIEW_SELF_TOKEN]
			}]
		}
	],
	"preview-dm-priya": [{
		id: "preview-dm-priya-1",
		senderId: "preview-user-3",
		content: "Can you confirm the launch-week moderation coverage before I lock the client note?",
		createdAtMs: Date.parse(isoDaysAgo(0)) - 420 * 60 * 1e3,
		readBy: [],
		deliveredTo: ["preview-user-3", PREVIEW_SELF_TOKEN]
	}, {
		id: "preview-dm-priya-2",
		senderId: PREVIEW_SELF_TOKEN,
		content: "Yes. Noah has email coverage, Casey owns creative QA, and I will monitor the launch thread during the first hour.",
		createdAtMs: Date.parse(isoDaysAgo(0)) - 360 * 60 * 1e3,
		readBy: [PREVIEW_SELF_TOKEN, "preview-user-3"],
		deliveredTo: ["preview-user-3", PREVIEW_SELF_TOKEN]
	}],
	"preview-dm-noah": [{
		id: "preview-dm-noah-1",
		senderId: "preview-user-8",
		content: "I deleted the outdated resend policy note so the sample inbox matches the current retail workflow.",
		createdAtMs: Date.parse(isoDaysAgo(3)) - 7200 * 1e3,
		deleted: true,
		deletedAtMs: Date.parse(isoDaysAgo(3)) - 5400 * 1e3,
		deletedBy: "preview-user-8",
		readBy: [PREVIEW_SELF_TOKEN],
		deliveredTo: ["preview-user-8", PREVIEW_SELF_TOKEN]
	}, {
		id: "preview-dm-noah-2",
		senderId: PREVIEW_SELF_TOKEN,
		content: "Perfect. I only need the final resend window and the suppressed segment count for the recap.",
		createdAtMs: Date.parse(isoDaysAgo(3)) - 4200 * 1e3,
		readBy: [PREVIEW_SELF_TOKEN],
		deliveredTo: ["preview-user-8", PREVIEW_SELF_TOKEN]
	}]
};
var PREVIEW_CHANNEL_MESSAGES = [
	{
		id: "preview-collab-team-1",
		channelType: "team",
		clientId: null,
		projectId: null,
		content: "Morning ops note: the proposal preview rollout is live in staging. Please use preview mode when demoing flows to clients today.",
		senderId: "preview-user-1",
		senderName: "Alex Morgan",
		senderRole: "Account Manager",
		createdAt: isoDaysAgo(0),
		updatedAt: isoDaysAgo(0),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		format: "markdown",
		reactions: [{
			emoji: "👍",
			count: 3,
			userIds: [
				"preview-user-2",
				"preview-user-4",
				"preview-user-6"
			]
		}],
		readBy: [PREVIEW_SELF_TOKEN],
		deliveredTo: [
			PREVIEW_SELF_TOKEN,
			"preview-user-2",
			"preview-user-4",
			"preview-user-6"
		],
		threadReplyCount: 2,
		threadLastReplyAt: isoDaysAgo(0)
	},
	{
		id: "preview-collab-team-2",
		channelType: "team",
		clientId: null,
		projectId: null,
		content: "Reminder: keep all creative approvals in-channel so the shared files panel stays useful for handoffs.",
		senderId: "preview-user-5",
		senderName: "Taylor Kim",
		senderRole: "Account Manager",
		createdAt: isoDaysAgo(1),
		updatedAt: isoDaysAgo(1),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		format: "markdown",
		attachments: [{
			name: "approval-checklist.pdf",
			url: "#",
			type: "application/pdf",
			size: "420 KB"
		}],
		readBy: [PREVIEW_SELF_TOKEN],
		deliveredTo: [
			PREVIEW_SELF_TOKEN,
			"preview-user-1",
			"preview-user-6"
		],
		isPinned: true,
		pinnedAt: isoDaysAgo(1),
		pinnedBy: "preview-user-5"
	},
	{
		id: "preview-collab-team-3",
		channelType: "team",
		clientId: null,
		projectId: null,
		content: "Ops handoff: meeting preview coverage now includes completed, cancelled, and post-processing states for demos.",
		senderId: "preview-user-2",
		senderName: "Jordan Lee",
		senderRole: "Strategist",
		createdAt: isoDaysAgo(0),
		updatedAt: isoDaysAgo(0),
		isEdited: true,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		format: "markdown",
		reactions: [{
			emoji: "✅",
			count: 3,
			userIds: [
				"preview-user-1",
				"preview-user-4",
				"preview-user-6"
			]
		}, {
			emoji: "🚀",
			count: 2,
			userIds: ["preview-user-3", "preview-user-7"]
		}],
		readBy: [PREVIEW_SELF_TOKEN],
		deliveredTo: [
			PREVIEW_SELF_TOKEN,
			"preview-user-1",
			"preview-user-3",
			"preview-user-4",
			"preview-user-6",
			"preview-user-7"
		],
		sharedTo: ["email"]
	},
	{
		id: "preview-collab-client-1",
		channelType: "client",
		clientId: "preview-tech-corp",
		projectId: null,
		content: "Weekly client summary is ready. Main win: demo request volume climbed 18% week over week after the landing page revision.",
		senderId: "preview-user-2",
		senderName: "Jordan Lee",
		senderRole: "Strategist",
		createdAt: isoDaysAgo(0),
		updatedAt: isoDaysAgo(0),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		format: "markdown",
		mentions: [{
			slug: "alex-morgan",
			name: "Alex Morgan",
			role: "Account Manager"
		}],
		readBy: [],
		deliveredTo: [
			PREVIEW_SELF_TOKEN,
			"preview-user-1",
			"preview-user-2"
		],
		threadReplyCount: 3,
		threadLastReplyAt: isoDaysAgo(0)
	},
	{
		id: "preview-collab-project-1",
		channelType: "project",
		clientId: "preview-tech-corp",
		projectId: "preview-project-1",
		content: "Just uploaded the revised brand guidelines. Let me know if the color palette works for the digital assets.",
		senderId: "preview-user-1",
		senderName: "Alex Morgan",
		senderRole: "Account Manager",
		createdAt: isoDaysAgo(0),
		updatedAt: isoDaysAgo(0),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		attachments: [{
			name: "brand-guidelines-v2.pdf",
			url: "#",
			type: "application/pdf",
			size: "2.4 MB"
		}],
		format: "markdown",
		reactions: [{
			emoji: "👍",
			count: 2,
			userIds: ["preview-user-2", "preview-user-3"]
		}],
		readBy: [PREVIEW_SELF_TOKEN],
		deliveredTo: [
			PREVIEW_SELF_TOKEN,
			"preview-user-1",
			"preview-user-2"
		],
		threadReplyCount: 2,
		threadLastReplyAt: isoDaysAgo(0)
	},
	{
		id: "preview-collab-project-2",
		channelType: "project",
		clientId: "preview-tech-corp",
		projectId: "preview-project-1",
		content: "Looks great. The primary blue is perfect. Quick question: should we use the gradient version for social headers?",
		senderId: "preview-user-2",
		senderName: "Jordan Lee",
		senderRole: "Strategist",
		createdAt: isoDaysAgo(0),
		updatedAt: isoDaysAgo(0),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		format: "markdown",
		readBy: [],
		deliveredTo: [
			PREVIEW_SELF_TOKEN,
			"preview-user-1",
			"preview-user-2"
		]
	},
	{
		id: "preview-collab-client-2",
		channelType: "client",
		clientId: "preview-startupxyz",
		projectId: null,
		content: "Team sync: product launch is confirmed for March 15th. We need the influencer shortlist finalized by Friday.",
		senderId: "preview-user-3",
		senderName: "Priya Patel",
		senderRole: "Account Manager",
		createdAt: isoDaysAgo(1),
		updatedAt: isoDaysAgo(1),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		format: "markdown",
		mentions: [{
			slug: "sam-chen",
			name: "Sam Chen",
			role: "Performance Marketer"
		}],
		readBy: [],
		deliveredTo: [
			PREVIEW_SELF_TOKEN,
			"preview-user-3",
			"preview-user-4"
		]
	},
	{
		id: "preview-collab-project-3",
		channelType: "project",
		clientId: "preview-startupxyz",
		projectId: "preview-project-5",
		content: "SEO audit complete. Top issues are missing meta descriptions, slow page load times, and duplicate product copy. Full report attached.",
		senderId: "preview-user-4",
		senderName: "Sam Chen",
		senderRole: "Performance Marketer",
		createdAt: isoDaysAgo(2),
		updatedAt: isoDaysAgo(2),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		attachments: [{
			name: "seo-audit-report.xlsx",
			url: "#",
			type: "application/vnd.ms-excel",
			size: "1.1 MB"
		}],
		format: "markdown",
		reactions: [{
			emoji: "🔥",
			count: 1,
			userIds: ["preview-user-3"]
		}],
		readBy: [],
		deliveredTo: [
			PREVIEW_SELF_TOKEN,
			"preview-user-3",
			"preview-user-4"
		],
		sharedTo: ["email"]
	},
	{
		id: "preview-collab-client-3",
		channelType: "client",
		clientId: "preview-retail-store",
		projectId: null,
		content: "Holiday campaign wrap-up: 127% of revenue target achieved. Client is thrilled with the final reporting deck.",
		senderId: "preview-user-5",
		senderName: "Taylor Kim",
		senderRole: "Account Manager",
		createdAt: isoDaysAgo(5),
		updatedAt: isoDaysAgo(5),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		format: "markdown",
		reactions: [{
			emoji: "🎉",
			count: 3,
			userIds: [
				"preview-user-1",
				"preview-user-2",
				"preview-user-6"
			]
		}, {
			emoji: "💪",
			count: 2,
			userIds: ["preview-user-3", "preview-user-4"]
		}],
		readBy: [PREVIEW_SELF_TOKEN],
		deliveredTo: [
			PREVIEW_SELF_TOKEN,
			"preview-user-5",
			"preview-user-6"
		]
	},
	{
		id: "preview-collab-project-4",
		channelType: "project",
		clientId: "preview-tech-corp",
		projectId: "preview-project-4",
		content: "Queued three revised motion cutdowns for tomorrow's approvals. The CTA timing is cleaner, but the headline frame still needs one pass.",
		senderId: "preview-user-7",
		senderName: "Mia Thompson",
		senderRole: "Brand Designer",
		createdAt: isoDaysAgo(0),
		updatedAt: isoDaysAgo(0),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		attachments: [{
			name: "motion-cutdown-a.mp4",
			url: "#",
			type: "video/mp4",
			size: "14.2 MB"
		}, {
			name: "motion-cutdown-b.mp4",
			url: "#",
			type: "video/mp4",
			size: "13.8 MB"
		}],
		format: "markdown",
		reactions: [{
			emoji: "👀",
			count: 2,
			userIds: ["preview-user-1", "preview-user-2"]
		}],
		mentions: [{
			slug: "alex-morgan",
			name: "Alex Morgan",
			role: "Account Manager"
		}],
		readBy: [PREVIEW_SELF_TOKEN],
		deliveredTo: [
			PREVIEW_SELF_TOKEN,
			"preview-user-1",
			"preview-user-2",
			"preview-user-7"
		]
	},
	{
		id: "preview-collab-client-4",
		channelType: "client",
		clientId: "preview-startupxyz",
		projectId: null,
		content: "Client approved the creator shortlist. Please send the final launch-day moderation matrix and escalation contacts.",
		senderId: "preview-user-3",
		senderName: "Priya Patel",
		senderRole: "Account Manager",
		createdAt: isoDaysAgo(0),
		updatedAt: isoDaysAgo(0),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		format: "markdown",
		mentions: [{
			slug: "lena-ortiz",
			name: "Lena Ortiz",
			role: "Lifecycle Strategist"
		}],
		reactions: [{
			emoji: "✅",
			count: 1,
			userIds: ["preview-user-9"]
		}],
		readBy: [],
		deliveredTo: [
			PREVIEW_SELF_TOKEN,
			"preview-user-3",
			"preview-user-9"
		],
		threadReplyCount: 2,
		threadLastReplyAt: isoDaysAgo(0)
	}
];
var PREVIEW_THREAD_REPLIES = {
	"preview-collab-team-1": [{
		id: "preview-collab-team-1-reply-1",
		channelType: "team",
		clientId: null,
		projectId: null,
		content: "I used it in the analytics review this morning. The preview coverage is finally consistent enough for demos.",
		senderId: "preview-user-2",
		senderName: "Jordan Lee",
		senderRole: "Strategist",
		createdAt: isoDaysAgo(0),
		updatedAt: isoDaysAgo(0),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		format: "markdown",
		parentMessageId: "preview-collab-team-1",
		threadRootId: "preview-collab-team-1",
		readBy: [PREVIEW_SELF_TOKEN],
		deliveredTo: [PREVIEW_SELF_TOKEN, "preview-user-2"]
	}, {
		id: "preview-collab-team-1-reply-2",
		channelType: "team",
		clientId: null,
		projectId: null,
		content: "Good. I will use the collaboration route in the client walkthrough too.",
		senderId: "preview-user-6",
		senderName: "Casey Rivera",
		senderRole: "Creative",
		createdAt: isoDaysAgo(0),
		updatedAt: isoDaysAgo(0),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		format: "markdown",
		parentMessageId: "preview-collab-team-1",
		threadRootId: "preview-collab-team-1",
		readBy: [],
		deliveredTo: [PREVIEW_SELF_TOKEN, "preview-user-6"]
	}],
	"preview-collab-client-1": [
		{
			id: "preview-collab-client-1-reply-1",
			channelType: "client",
			clientId: "preview-tech-corp",
			projectId: null,
			content: "I also added the landing-page heatmap note so the client sees why demo-request quality improved.",
			senderId: "preview-user-1",
			senderName: "Alex Morgan",
			senderRole: "Account Manager",
			createdAt: isoDaysAgo(0),
			updatedAt: isoDaysAgo(0),
			isEdited: false,
			deletedAt: null,
			deletedBy: null,
			isDeleted: false,
			format: "markdown",
			parentMessageId: "preview-collab-client-1",
			threadRootId: "preview-collab-client-1",
			reactions: [{
				emoji: "👍",
				count: 1,
				userIds: ["preview-user-2"]
			}],
			readBy: [PREVIEW_SELF_TOKEN],
			deliveredTo: [
				PREVIEW_SELF_TOKEN,
				"preview-user-1",
				"preview-user-2"
			]
		},
		{
			id: "preview-collab-client-1-reply-2",
			channelType: "client",
			clientId: "preview-tech-corp",
			projectId: null,
			content: "Perfect. I will keep the summary client-safe and save the deeper pacing detail for the internal room.",
			senderId: "preview-user-2",
			senderName: "Jordan Lee",
			senderRole: "Strategist",
			createdAt: isoDaysAgo(0),
			updatedAt: isoDaysAgo(0),
			isEdited: false,
			deletedAt: null,
			deletedBy: null,
			isDeleted: false,
			format: "markdown",
			parentMessageId: "preview-collab-client-1",
			threadRootId: "preview-collab-client-1",
			readBy: [],
			deliveredTo: [
				PREVIEW_SELF_TOKEN,
				"preview-user-1",
				"preview-user-2"
			]
		},
		{
			id: "preview-collab-client-1-reply-3",
			channelType: "client",
			clientId: "preview-tech-corp",
			projectId: null,
			content: "Board note exported. Dropping the PDF here for reference in case the client asks for it live.",
			senderId: "preview-user-1",
			senderName: "Alex Morgan",
			senderRole: "Account Manager",
			createdAt: isoDaysAgo(0),
			updatedAt: isoDaysAgo(0),
			isEdited: false,
			deletedAt: null,
			deletedBy: null,
			isDeleted: false,
			format: "markdown",
			attachments: [{
				name: "board-note.pdf",
				url: "#",
				type: "application/pdf",
				size: "560 KB"
			}],
			parentMessageId: "preview-collab-client-1",
			threadRootId: "preview-collab-client-1",
			readBy: [PREVIEW_SELF_TOKEN],
			deliveredTo: [
				PREVIEW_SELF_TOKEN,
				"preview-user-1",
				"preview-user-2"
			]
		}
	],
	"preview-collab-project-1": [{
		id: "preview-collab-project-1-reply-1",
		channelType: "project",
		clientId: "preview-tech-corp",
		projectId: "preview-project-1",
		content: "Use the flat blue for sales one-pagers and keep the gradient only in social or keynote surfaces.",
		senderId: "preview-user-1",
		senderName: "Alex Morgan",
		senderRole: "Account Manager",
		createdAt: isoDaysAgo(0),
		updatedAt: isoDaysAgo(0),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		format: "markdown",
		parentMessageId: "preview-collab-project-1",
		threadRootId: "preview-collab-project-1",
		readBy: [PREVIEW_SELF_TOKEN],
		deliveredTo: [
			PREVIEW_SELF_TOKEN,
			"preview-user-1",
			"preview-user-2"
		]
	}, {
		id: "preview-collab-project-1-reply-2",
		channelType: "project",
		clientId: "preview-tech-corp",
		projectId: "preview-project-1",
		content: "I'll export both header options and label them clearly so the handoff stays clean.",
		senderId: "preview-user-7",
		senderName: "Mia Thompson",
		senderRole: "Brand Designer",
		createdAt: isoDaysAgo(0),
		updatedAt: isoDaysAgo(0),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		format: "markdown",
		parentMessageId: "preview-collab-project-1",
		threadRootId: "preview-collab-project-1",
		reactions: [{
			emoji: "👌",
			count: 1,
			userIds: ["preview-user-2"]
		}],
		readBy: [],
		deliveredTo: [
			PREVIEW_SELF_TOKEN,
			"preview-user-1",
			"preview-user-2",
			"preview-user-7"
		]
	}],
	"preview-collab-client-4": [{
		id: "preview-collab-client-4-reply-1",
		channelType: "client",
		clientId: "preview-startupxyz",
		projectId: null,
		content: "I'll send the moderation matrix and escalation contacts within the hour. Noah is finalizing the lifecycle fallback paths too.",
		senderId: "preview-user-9",
		senderName: "Lena Ortiz",
		senderRole: "Lifecycle Strategist",
		createdAt: isoDaysAgo(0),
		updatedAt: isoDaysAgo(0),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		format: "markdown",
		parentMessageId: "preview-collab-client-4",
		threadRootId: "preview-collab-client-4",
		readBy: [PREVIEW_SELF_TOKEN],
		deliveredTo: [
			PREVIEW_SELF_TOKEN,
			"preview-user-3",
			"preview-user-9"
		]
	}, {
		id: "preview-collab-client-4-reply-2",
		channelType: "client",
		clientId: "preview-startupxyz",
		projectId: null,
		content: "Excellent. I'll keep the client note concise and link the matrix instead of pasting it inline.",
		senderId: "preview-user-3",
		senderName: "Priya Patel",
		senderRole: "Account Manager",
		createdAt: isoDaysAgo(0),
		updatedAt: isoDaysAgo(0),
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		format: "markdown",
		parentMessageId: "preview-collab-client-4",
		threadRootId: "preview-collab-client-4",
		readBy: [],
		deliveredTo: [
			PREVIEW_SELF_TOKEN,
			"preview-user-3",
			"preview-user-9"
		]
	}]
};
function resolveSelfContext(self) {
	return {
		id: self?.id?.trim() || "preview-current-user",
		name: self?.name?.trim() || "You",
		role: self?.role ?? "Account Owner"
	};
}
function maybeReplaceSelfToken(value, self) {
	return value === PREVIEW_SELF_TOKEN ? self.id : value;
}
function mapDirectMessage(message, self) {
	const resolvedSelf = resolveSelfContext(self);
	const senderParticipant = message.senderId === PREVIEW_SELF_TOKEN ? {
		id: resolvedSelf.id,
		name: resolvedSelf.name,
		role: resolvedSelf.role
	} : PREVIEW_PARTICIPANTS.find((participant) => participant.id === message.senderId) ?? {
		id: message.senderId,
		name: "Unknown teammate",
		role: null
	};
	return {
		id: message.id,
		legacyId: message.id,
		senderId: senderParticipant.id,
		senderName: senderParticipant.name,
		senderRole: senderParticipant.role,
		content: message.content,
		edited: Boolean(message.edited),
		editedAtMs: message.editedAtMs ?? null,
		deleted: Boolean(message.deleted),
		deletedAtMs: message.deletedAtMs ?? null,
		deletedBy: message.deletedBy ?? null,
		attachments: message.attachments ?? null,
		reactions: message.reactions ?? null,
		readBy: (message.readBy ?? []).map((entry) => maybeReplaceSelfToken(entry, resolvedSelf)),
		deliveredTo: (message.deliveredTo ?? []).map((entry) => maybeReplaceSelfToken(entry, resolvedSelf)),
		readAtMs: message.readAtMs ?? null,
		sharedTo: message.sharedTo ?? null,
		createdAtMs: message.createdAtMs,
		updatedAtMs: message.updatedAtMs ?? message.createdAtMs
	};
}
function mapCollaborationMessage(message, viewerId) {
	const resolvedViewerId = viewerId?.trim() || "preview-current-user";
	return {
		...message,
		readBy: Array.isArray(message.readBy) ? message.readBy.map((entry) => entry === PREVIEW_SELF_TOKEN ? resolvedViewerId : entry) : void 0,
		deliveredTo: Array.isArray(message.deliveredTo) ? message.deliveredTo.map((entry) => entry === PREVIEW_SELF_TOKEN ? resolvedViewerId : entry) : void 0,
		reactions: Array.isArray(message.reactions) ? message.reactions.map((reaction) => ({
			...reaction,
			userIds: reaction.userIds.map((entry) => entry === PREVIEW_SELF_TOKEN ? resolvedViewerId : entry)
		})) : void 0
	};
}
function selectPreviewChannelResponder(channelType, clientId, projectId, viewerId) {
	const preferredParticipantId = channelType === "team" ? "preview-user-5" : channelType === "project" && projectId === "preview-project-1" ? "preview-user-2" : channelType === "project" && projectId === "preview-project-5" ? "preview-user-4" : channelType === "client" && clientId === "preview-startupxyz" ? "preview-user-3" : channelType === "client" && clientId === "preview-retail-store" ? "preview-user-5" : "preview-user-1";
	const preferred = PREVIEW_PARTICIPANTS.find((participant) => participant.id === preferredParticipantId);
	if (preferred && preferred.id !== viewerId) return preferred;
	return PREVIEW_PARTICIPANTS.find((participant) => participant.id !== viewerId) ?? PREVIEW_PARTICIPANTS[0];
}
function buildPreviewAutoReplyContent(content, responderName) {
	const normalized = content.trim().toLowerCase();
	if (normalized.includes("timeline") || normalized.includes("schedule") || normalized.includes("when")) return `${responderName}: for the sample timeline, kickoff stays on Monday, internal review lands mid-week, and the client-ready deck can go out Friday morning.`;
	if (normalized.includes("budget") || normalized.includes("spend") || normalized.includes("pacing")) return `${responderName}: sample pacing still looks healthy. I would hold spend flat for now and push the next budget move after the retargeting review.`;
	if (normalized.includes("launch") || normalized.includes("ship") || normalized.includes("publish")) return `${responderName}: for the demo flow, I would lock approvals today, QA tomorrow, and keep the post-launch recap draft ready before we publish.`;
	if (normalized.includes("approve") || normalized.includes("review") || normalized.includes("feedback")) return `${responderName}: looks solid from the sample side. I would mark this ready for review and add one short stakeholder summary before sharing.`;
	return `${responderName}: received. I added a sample follow-up so the conversation stays active during the demo.`;
}
function getPreviewCollaborationParticipants() {
	return PREVIEW_PARTICIPANTS.map((participant) => ({ ...participant }));
}
function getPreviewCollaborationMessages(channelType, clientId, projectId, viewerId) {
	return PREVIEW_CHANNEL_MESSAGES.flatMap((message) => {
		if (message.channelType !== channelType) return [];
		if (channelType === "client" && message.clientId !== clientId) return [];
		if (channelType === "project" && message.projectId !== projectId) return [];
		return [mapCollaborationMessage(message, viewerId)];
	}).sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
}
function getPreviewCollaborationThreadReplies(threadRootId, viewerId) {
	return (PREVIEW_THREAD_REPLIES[threadRootId] ?? []).map((message) => mapCollaborationMessage(message, viewerId)).sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
}
function getPreviewDirectConversations(self) {
	const resolvedSelf = resolveSelfContext(self);
	return PREVIEW_DIRECT_CONVERSATIONS.map((seed) => {
		const otherParticipant = PREVIEW_PARTICIPANTS.find((participant) => participant.id === seed.otherParticipantId);
		const messages = getPreviewDirectMessages(seed.legacyId, resolvedSelf);
		const lastMessage = messages.reduce((latest, message) => {
			if (latest === null || message.createdAtMs > latest.createdAtMs) return message;
			return latest;
		}, null);
		const isRead = !messages.some((message) => message.senderId !== resolvedSelf.id && !message.readBy.includes(resolvedSelf.id));
		return {
			id: seed.legacyId,
			legacyId: seed.legacyId,
			otherParticipantId: seed.otherParticipantId,
			otherParticipantName: otherParticipant?.name ?? "Unknown teammate",
			otherParticipantRole: otherParticipant?.role ?? null,
			lastMessageSnippet: lastMessage?.deleted ? "Message deleted" : lastMessage?.content ?? null,
			lastMessageAtMs: lastMessage?.createdAtMs ?? null,
			lastMessageSenderId: lastMessage?.senderId ?? null,
			isRead,
			isArchived: seed.legacyId === "preview-dm-casey",
			isMuted: seed.legacyId === "preview-dm-sam",
			createdAtMs: messages[0]?.createdAtMs ?? Date.now(),
			updatedAtMs: lastMessage?.createdAtMs ?? Date.now()
		};
	}).sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0));
}
function getPreviewDirectMessages(conversationLegacyId, self) {
	return (PREVIEW_DIRECT_MESSAGES[conversationLegacyId] ?? []).map((message) => mapDirectMessage(message, self)).sort((a, b) => b.createdAtMs - a.createdAtMs);
}
function getPreviewCollaborationAutoReply(params) {
	const responder = selectPreviewChannelResponder(params.channelType, params.clientId, params.projectId, params.viewerId);
	const timestamp = params.createdAt ?? /* @__PURE__ */ new Date();
	const createdAt = timestamp.toISOString();
	return {
		id: `preview-collab-reply-${timestamp.getTime()}`,
		channelType: params.channelType,
		clientId: params.clientId,
		projectId: params.projectId,
		content: buildPreviewAutoReplyContent(params.content, responder.name),
		senderId: responder.id,
		senderName: responder.name,
		senderRole: responder.role,
		createdAt,
		updatedAt: createdAt,
		isEdited: false,
		deletedAt: null,
		deletedBy: null,
		isDeleted: false,
		format: "markdown",
		reactions: [],
		readBy: params.viewerId ? [params.viewerId] : void 0,
		deliveredTo: params.viewerId ? [params.viewerId, responder.id] : [responder.id],
		parentMessageId: params.parentMessageId ?? null,
		threadRootId: params.threadRootId ?? null
	};
}
function getPreviewDirectAutoReply(params) {
	const timestamp = params.createdAt ?? Date.now();
	const responder = PREVIEW_PARTICIPANTS.find((participant) => participant.id === params.otherParticipantId);
	return {
		id: `preview-dm-auto-reply-${timestamp}`,
		legacyId: `preview-dm-auto-reply-${timestamp}`,
		senderId: params.otherParticipantId,
		senderName: responder?.name ?? params.otherParticipantName,
		senderRole: responder?.role ?? params.otherParticipantRole ?? null,
		content: buildPreviewAutoReplyContent(params.content, responder?.name ?? params.otherParticipantName),
		edited: false,
		editedAtMs: null,
		deleted: false,
		deletedAtMs: null,
		deletedBy: null,
		attachments: null,
		reactions: null,
		readBy: params.currentUserId ? [params.currentUserId] : [],
		deliveredTo: params.currentUserId ? [params.currentUserId, params.otherParticipantId] : [params.otherParticipantId],
		readAtMs: params.currentUserId ? timestamp : null,
		sharedTo: null,
		createdAtMs: timestamp,
		updatedAtMs: timestamp
	};
}
var PREVIEW_ADS_CURRENCY = "GBP";
function getPreviewCampaigns(providerId) {
	return {
		facebook: [
			{
				id: "preview-fb-campaign-1",
				name: "Summer Sale 2024",
				providerId: "facebook",
				status: "ACTIVE",
				budget: 5e3,
				budgetType: "daily",
				currency: PREVIEW_ADS_CURRENCY,
				objective: "CONVERSIONS",
				startTime: isoDaysAgo(30),
				stopTime: void 0
			},
			{
				id: "preview-fb-campaign-2",
				name: "Brand Awareness Q4",
				providerId: "facebook",
				status: "ACTIVE",
				budget: 15e3,
				budgetType: "lifetime",
				currency: PREVIEW_ADS_CURRENCY,
				objective: "BRAND_AWARENESS",
				startTime: isoDaysAgo(45),
				stopTime: isoDaysAgo(-15)
			},
			{
				id: "preview-fb-campaign-3",
				name: "Retargeting - Cart Abandoners",
				providerId: "facebook",
				status: "PAUSED",
				budget: 2500,
				budgetType: "daily",
				currency: PREVIEW_ADS_CURRENCY,
				objective: "CONVERSIONS",
				startTime: isoDaysAgo(60),
				stopTime: void 0
			}
		],
		google: [{
			id: "preview-google-campaign-1",
			name: "Search - Brand Terms",
			providerId: "google",
			status: "ENABLED",
			budget: 3e3,
			budgetType: "DAILY",
			currency: PREVIEW_ADS_CURRENCY,
			objective: "SEARCH",
			startTime: isoDaysAgo(90),
			stopTime: void 0
		}, {
			id: "preview-google-campaign-2",
			name: "Display - Remarketing",
			providerId: "google",
			status: "ENABLED",
			budget: 2e3,
			budgetType: "DAILY",
			currency: PREVIEW_ADS_CURRENCY,
			objective: "DISPLAY",
			startTime: isoDaysAgo(30),
			stopTime: void 0
		}],
		linkedin: [{
			id: "preview-linkedin-campaign-1",
			name: "B2B Lead Generation",
			providerId: "linkedin",
			status: "ACTIVE",
			budget: 5e3,
			budgetType: "daily",
			currency: PREVIEW_ADS_CURRENCY,
			objective: "LEAD_GENERATION",
			startTime: isoDaysAgo(20),
			stopTime: void 0
		}],
		tiktok: [{
			id: "preview-tiktok-campaign-1",
			name: "Viral Product Launch",
			providerId: "tiktok",
			status: "ENABLE",
			budget: 1e4,
			budgetType: "BUDGET_MODE_TOTAL",
			currency: PREVIEW_ADS_CURRENCY,
			objective: "TRAFFIC",
			startTime: isoDaysAgo(14),
			stopTime: isoDaysAgo(-7)
		}]
	}[providerId] || [];
}
function getPreviewCampaignInsights(providerId, campaignId, startDate, endDate) {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const days = Math.ceil((end.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
	const series = [];
	let totalSpend = 0;
	let totalImpressions = 0;
	let totalClicks = 0;
	let totalConversions = 0;
	let totalRevenue = 0;
	let maxReach = 0;
	for (let i = 0; i < days; i++) {
		const date = new Date(start);
		date.setDate(date.getDate() + i);
		const dateStr = date.toISOString().split("T")[0];
		const baseSpend = 150 + Math.random() * 100;
		const impressions = Math.round(baseSpend / .005 * (.8 + Math.random() * .4));
		const clicks = Math.round(impressions * .025 * (.8 + Math.random() * .4));
		const conversions = Math.round(clicks * .035 * (.7 + Math.random() * .6));
		const revenue = Math.round(baseSpend * 2.8 * (.8 + Math.random() * .4));
		const reach = Math.round(impressions * .7 * (.9 + Math.random() * .2));
		series.push({
			date: dateStr,
			spend: Math.round(baseSpend * 100) / 100,
			impressions,
			clicks,
			conversions,
			revenue,
			reach
		});
		totalSpend += baseSpend;
		totalImpressions += impressions;
		totalClicks += clicks;
		totalConversions += conversions;
		totalRevenue += revenue;
		maxReach = Math.max(maxReach, reach);
	}
	const ctr = totalImpressions > 0 ? totalClicks / totalImpressions * 100 : 0;
	const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
	const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
	const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
	return {
		providerId,
		campaignId,
		startDate,
		endDate,
		currency: PREVIEW_ADS_CURRENCY,
		totals: {
			spend: Math.round(totalSpend * 100) / 100,
			impressions: totalImpressions,
			clicks: totalClicks,
			conversions: totalConversions,
			revenue: totalRevenue,
			reach: maxReach
		},
		series,
		insights: {
			providerId,
			calculatedMetrics: {
				ctr,
				cpc,
				cpa,
				roas,
				conversionRate: totalClicks > 0 ? totalConversions / totalClicks * 100 : 0
			},
			insights: [{
				type: "performance",
				level: roas > 2.5 ? "success" : roas > 1.5 ? "info" : "warning",
				metric: "roas",
				value: roas,
				benchmark: 2.5,
				message: roas > 2.5 ? "ROAS is performing above benchmark" : "ROAS could be improved",
				recommendation: roas > 2.5 ? "Consider scaling budget to maximize returns" : "Review targeting and creative performance"
			}, {
				type: "efficiency",
				level: ctr > 2 ? "success" : ctr > 1 ? "info" : "warning",
				metric: "ctr",
				value: ctr,
				benchmark: 2,
				message: ctr > 2 ? "Click-through rate is strong" : "CTR has room for improvement",
				recommendation: ctr > 2 ? "Maintain current creative strategy" : "Test new ad creatives and copy variations"
			}],
			calculatedAt: (typeof window === "undefined" ? /* @__PURE__ */ new Date("2024-01-15T12:00:00.000Z") : /* @__PURE__ */ new Date()).toISOString()
		}
	};
}
function getPreviewAdsMetrics() {
	const providers = [
		"google",
		"facebook",
		"linkedin",
		"tiktok"
	];
	const metrics = [];
	const providerData = {
		google: {
			spendMultiplier: 1,
			ctr: .032,
			convRate: .045,
			roasMultiplier: 3.2
		},
		facebook: {
			spendMultiplier: .8,
			ctr: .018,
			convRate: .028,
			roasMultiplier: 2.8
		},
		linkedin: {
			spendMultiplier: .5,
			ctr: .008,
			convRate: .015,
			roasMultiplier: 4.1
		},
		tiktok: {
			spendMultiplier: .6,
			ctr: .022,
			convRate: .022,
			roasMultiplier: 2.4
		}
	};
	for (let day = 0; day < 30; day++) providers.forEach((providerId) => {
		const data = providerData[providerId];
		const baseSpend = (150 + Math.random() * 100) * data.spendMultiplier;
		const impressions = Math.round(baseSpend / .005 * (.8 + Math.random() * .4));
		const clicks = Math.round(impressions * data.ctr * (.8 + Math.random() * .4));
		const conversions = Math.round(clicks * data.convRate * (.7 + Math.random() * .6));
		const revenue = Math.round(baseSpend * data.roasMultiplier * (.8 + Math.random() * .4));
		metrics.push({
			id: `preview-ads-${providerId}-${day}`,
			providerId,
			date: isoDaysAgo(day),
			spend: Math.round(baseSpend * 100) / 100,
			impressions,
			clicks,
			conversions,
			revenue,
			createdAt: isoDaysAgo(day)
		});
	});
	return metrics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
function getPreviewAdsIntegrationStatuses() {
	return [
		{
			providerId: "google",
			status: "success",
			lastSyncedAt: isoDaysAgo(0),
			lastSyncRequestedAt: isoDaysAgo(0),
			message: null,
			linkedAt: isoDaysAgo(45),
			accountId: "preview-google-123",
			currency: PREVIEW_ADS_CURRENCY,
			autoSyncEnabled: true,
			syncFrequencyMinutes: 360,
			scheduledTimeframeDays: 30
		},
		{
			providerId: "facebook",
			status: "success",
			lastSyncedAt: isoDaysAgo(0),
			lastSyncRequestedAt: isoDaysAgo(0),
			message: null,
			linkedAt: isoDaysAgo(30),
			accountId: "preview-meta-456",
			currency: PREVIEW_ADS_CURRENCY,
			autoSyncEnabled: true,
			syncFrequencyMinutes: 360,
			scheduledTimeframeDays: 30
		},
		{
			providerId: "linkedin",
			status: "success",
			lastSyncedAt: isoDaysAgo(1),
			lastSyncRequestedAt: isoDaysAgo(1),
			message: null,
			linkedAt: isoDaysAgo(20),
			accountId: "preview-linkedin-789",
			currency: PREVIEW_ADS_CURRENCY,
			autoSyncEnabled: true,
			syncFrequencyMinutes: 720,
			scheduledTimeframeDays: 30
		},
		{
			providerId: "tiktok",
			status: "success",
			lastSyncedAt: isoDaysAgo(0),
			lastSyncRequestedAt: isoDaysAgo(0),
			message: null,
			linkedAt: isoDaysAgo(15),
			accountId: "preview-tiktok-012",
			currency: PREVIEW_ADS_CURRENCY,
			autoSyncEnabled: true,
			syncFrequencyMinutes: 360,
			scheduledTimeframeDays: 30
		}
	];
}
var PREVIEW_SOCIAL_OVERVIEWS = {
	facebook: {
		surface: "facebook",
		impressions: 184200,
		reach: 126400,
		engagedUsers: 8420,
		reactions: 5140,
		comments: 1086,
		shares: 684,
		saves: 0,
		followerCountLatest: 24890,
		followerDeltaTotal: 912,
		rowCount: 28
	},
	instagram: {
		surface: "instagram",
		impressions: 236800,
		reach: 154300,
		engagedUsers: 12940,
		reactions: 9018,
		comments: 1474,
		shares: 953,
		saves: 3126,
		followerCountLatest: 31840,
		followerDeltaTotal: 1286,
		rowCount: 28
	}
};
var PREVIEW_SOCIAL_CONNECTION_STATUS = {
	connected: true,
	accountId: "preview-meta-account",
	accountName: "Cohorts Demo Workspace",
	lastSyncStatus: "success",
	lastSyncedAtMs: Date.UTC(2026, 2, 30, 16, 45, 0),
	linkedAtMs: Date.UTC(2026, 2, 12, 10, 15, 0)
};
function getPreviewSocialOverview(surface) {
	return PREVIEW_SOCIAL_OVERVIEWS[surface];
}
function getPreviewSocialConnectionStatus() {
	return PREVIEW_SOCIAL_CONNECTION_STATUS;
}
var NOTIFICATION_CATEGORIES = [
	"tasks",
	"collaboration",
	"ads",
	"digest",
	"projects",
	"meetings"
];
var DEFAULT_CHANNEL_PREFS = {
	inApp: true,
	email: true
};
var DEFAULT_QUIET_HOURS = {
	enabled: false,
	start: "22:00",
	end: "08:00"
};
function createDefaultCategories(overrides) {
	const base = {
		tasks: { ...DEFAULT_CHANNEL_PREFS },
		collaboration: {
			inApp: true,
			email: false
		},
		ads: { ...DEFAULT_CHANNEL_PREFS },
		digest: { ...DEFAULT_CHANNEL_PREFS },
		projects: { ...DEFAULT_CHANNEL_PREFS },
		meetings: { ...DEFAULT_CHANNEL_PREFS }
	};
	if (!overrides) return base;
	for (const category of NOTIFICATION_CATEGORIES) {
		const patch = overrides[category];
		if (patch) base[category] = {
			...base[category],
			...patch
		};
	}
	return base;
}
var DEFAULT_NOTIFICATION_PREFERENCES_V2 = {
	version: 2,
	pauseAll: false,
	quietHours: DEFAULT_QUIET_HOURS,
	categories: createDefaultCategories()
};
function isNotificationPreferencesV2(prefs) {
	return prefs !== null && prefs !== void 0 && typeof prefs === "object" && "version" in prefs && prefs.version === 2;
}
function migrateLegacyPreferences(legacy) {
	return {
		version: 2,
		pauseAll: false,
		quietHours: { ...DEFAULT_QUIET_HOURS },
		categories: createDefaultCategories({
			tasks: { email: legacy?.emailTaskActivity !== false },
			collaboration: { email: legacy?.emailCollaboration === true },
			ads: { email: legacy?.emailAdAlerts !== false },
			digest: { email: legacy?.emailPerformanceDigest !== false },
			projects: {
				inApp: true,
				email: true
			},
			meetings: {
				inApp: true,
				email: true
			}
		})
	};
}
function normalizePreferences(prefs) {
	if (isNotificationPreferencesV2(prefs)) return {
		version: 2,
		pauseAll: prefs.pauseAll ?? false,
		quietHours: {
			enabled: prefs.quietHours?.enabled ?? false,
			start: prefs.quietHours?.start ?? DEFAULT_QUIET_HOURS.start,
			end: prefs.quietHours?.end ?? DEFAULT_QUIET_HOURS.end
		},
		categories: mergeCategories(prefs.categories)
	};
	return migrateLegacyPreferences(prefs);
}
function mergeCategories(input) {
	const defaults = createDefaultCategories();
	if (!input) return defaults;
	const merged = { ...defaults };
	for (const category of NOTIFICATION_CATEGORIES) {
		const patch = input[category];
		if (patch) merged[category] = {
			inApp: patch.inApp ?? defaults[category].inApp,
			email: patch.email ?? defaults[category].email
		};
	}
	return merged;
}
function kindToCategory(kind) {
	if (kind.startsWith("task.")) return "tasks";
	if (kind.startsWith("collaboration.")) return "collaboration";
	if (kind.startsWith("meeting.")) return "meetings";
	if (kind === "project.created" || kind === "proposal.deck.ready") return "projects";
	if (kind === "report.generated") return "ads";
	return "tasks";
}
/** Brevo / server email pref keys mapped to categories. */
var EMAIL_PREF_KEY_TO_CATEGORY = {
	adAlerts: "ads",
	performanceDigest: "digest",
	taskActivity: "tasks",
	collaboration: "collaboration",
	meetings: "meetings"
};
function parseTimeToMinutes(value) {
	const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
	if (!match) return null;
	const hoursPart = match[1];
	const minutesPart = match[2];
	if (hoursPart === void 0 || minutesPart === void 0) return null;
	const hours = Number.parseInt(hoursPart, 10);
	const minutes = Number.parseInt(minutesPart, 10);
	if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
	return hours * 60 + minutes;
}
function isWithinQuietHours(quietHours, now = /* @__PURE__ */ new Date()) {
	if (!quietHours.enabled) return false;
	const start = parseTimeToMinutes(quietHours.start);
	const end = parseTimeToMinutes(quietHours.end);
	if (start === null || end === null) return false;
	const current = now.getHours() * 60 + now.getMinutes();
	if (start === end) return true;
	if (start < end) return current >= start && current < end;
	return current >= start || current < end;
}
function isChannelEnabled(prefs, category, channel, options) {
	if (prefs.pauseAll) return false;
	const categoryPrefs = prefs.categories[category] ?? DEFAULT_CHANNEL_PREFS;
	if (!(channel === "inApp" ? categoryPrefs.inApp : categoryPrefs.email)) return false;
	if (channel === "email" && isWithinQuietHours(prefs.quietHours, options?.now)) return false;
	return true;
}
function isEmailPrefEnabled(prefs, prefKey, options) {
	const normalized = normalizePreferences(prefs);
	const category = EMAIL_PREF_KEY_TO_CATEGORY[prefKey];
	if (!category) return true;
	return isChannelEnabled(normalized, category, "email", options);
}
function applyPreferencesPatch(current, patch) {
	const base = normalizePreferences(current);
	return {
		version: 2,
		pauseAll: patch.pauseAll ?? base.pauseAll,
		quietHours: {
			enabled: patch.quietHours?.enabled ?? base.quietHours.enabled,
			start: patch.quietHours?.start ?? base.quietHours.start,
			end: patch.quietHours?.end ?? base.quietHours.end
		},
		categories: mergeCategories({
			...base.categories,
			...patch.categories
		})
	};
}
var CATEGORY_LABELS = {
	tasks: {
		title: "Tasks & activity",
		description: "Assignments, updates, comments, and mentions on tasks."
	},
	collaboration: {
		title: "Collaboration",
		description: "Channel messages, threads, and @mentions."
	},
	ads: {
		title: "Ads & alerts",
		description: "ROAS drops, spend spikes, and automated ad performance alerts."
	},
	digest: {
		title: "Weekly digest",
		description: "Summary of workspace performance across platforms."
	},
	projects: {
		title: "Projects",
		description: "New projects and proposal deck readiness."
	},
	meetings: {
		title: "Meetings",
		description: "Scheduled, rescheduled, and cancelled meeting updates."
	}
};
var PREVIEW_SETTINGS_PROFILE = {
	id: "preview-user-settings",
	legacyId: "preview-user-settings",
	name: "Avery Stone",
	email: "avery@cohorts.app",
	phoneNumber: "+1 415 555 0183",
	photoUrl: null
};
var PREVIEW_NOTIFICATION_PREFERENCES = { ...DEFAULT_NOTIFICATION_PREFERENCES_V2 };
var PREVIEW_REGIONAL_PREFERENCES = {
	currency: "USD",
	timezone: "America/Los_Angeles",
	locale: "en-US"
};
function getPreviewSettingsProfile() {
	return { ...PREVIEW_SETTINGS_PROFILE };
}
function getPreviewSettingsNotificationPreferences() {
	return structuredClone(PREVIEW_NOTIFICATION_PREFERENCES);
}
function getPreviewSettingsRegionalPreferences() {
	return { ...PREVIEW_REGIONAL_PREFERENCES };
}
function getPreviewSettingsExportData() {
	return {
		exportedAt: typeof window === "undefined" ? "2024-01-15T12:00:00.000Z" : (/* @__PURE__ */ new Date()).toISOString(),
		profile: getPreviewSettingsProfile(),
		notificationPreferences: getPreviewSettingsNotificationPreferences(),
		regionalPreferences: getPreviewSettingsRegionalPreferences(),
		summary: {
			clients: 3,
			activeProjects: 4,
			openTasks: 15,
			pendingProposals: 3,
			collaborationThreads: 8
		},
		note: "Preview mode export generated from sample workspace data."
	};
}
var PREVIEW_ADMIN_WORKSPACE_ID = "preview-agency";
var PREVIEW_ADMIN_USER_ID = "preview-admin-1";
function isoHoursAgo(hoursAgo) {
	const base = typeof window === "undefined" ? /* @__PURE__ */ new Date("2024-01-15T12:00:00.000Z") : /* @__PURE__ */ new Date();
	base.setHours(base.getHours() - hoursAgo);
	return base.toISOString();
}
function isoDateDaysAgo(daysAgo) {
	return isoDaysAgo(daysAgo).split("T")[0] ?? isoDaysAgo(daysAgo);
}
function clonePreviewClients() {
	return getPreviewClients().map((client) => ({
		...client,
		teamMembers: client.teamMembers.map((member) => ({ ...member }))
	}));
}
function getPreviewAdminUsers() {
	return [
		{
			id: PREVIEW_ADMIN_USER_ID,
			name: "Avery Stone",
			email: "avery@cohorts.app",
			role: "admin",
			status: "active",
			agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
			createdAt: isoDaysAgo(180),
			updatedAt: isoHoursAgo(2),
			lastLoginAt: isoHoursAgo(1)
		},
		{
			id: "preview-team-alex",
			name: "Alex Morgan",
			email: "alex@cohorts.app",
			role: "team",
			status: "active",
			agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
			createdAt: isoDaysAgo(120),
			updatedAt: isoHoursAgo(4),
			lastLoginAt: isoHoursAgo(5)
		},
		{
			id: "preview-team-jordan",
			name: "Jordan Lee",
			email: "jordan@cohorts.app",
			role: "team",
			status: "active",
			agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
			createdAt: isoDaysAgo(98),
			updatedAt: isoHoursAgo(6),
			lastLoginAt: isoHoursAgo(8)
		},
		{
			id: "preview-team-priya",
			name: "Priya Patel",
			email: "priya@cohorts.app",
			role: "team",
			status: "active",
			agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
			createdAt: isoDaysAgo(91),
			updatedAt: isoHoursAgo(3),
			lastLoginAt: isoHoursAgo(2)
		},
		{
			id: "preview-team-sam",
			name: "Sam Chen",
			email: "sam@cohorts.app",
			role: "team",
			status: "active",
			agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
			createdAt: isoDaysAgo(76),
			updatedAt: isoHoursAgo(12),
			lastLoginAt: isoHoursAgo(12)
		},
		{
			id: "preview-team-taylor",
			name: "Taylor Kim",
			email: "taylor@cohorts.app",
			role: "team",
			status: "active",
			agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
			createdAt: isoDaysAgo(64),
			updatedAt: isoHoursAgo(7),
			lastLoginAt: isoHoursAgo(9)
		},
		{
			id: "preview-team-casey",
			name: "Casey Rivera",
			email: "casey@cohorts.app",
			role: "team",
			status: "pending",
			agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
			createdAt: isoDaysAgo(12),
			updatedAt: isoHoursAgo(14),
			lastLoginAt: null
		},
		{
			id: "preview-client-mia",
			name: "Mia Lopez",
			email: "mia@techcorp.example",
			role: "client",
			status: "active",
			agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
			createdAt: isoDaysAgo(55),
			updatedAt: isoHoursAgo(18),
			lastLoginAt: isoDaysAgo(1)
		},
		{
			id: "preview-client-noah",
			name: "Noah Brooks",
			email: "noah@retailstore.example",
			role: "client",
			status: "invited",
			agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
			createdAt: isoDaysAgo(3),
			updatedAt: isoHoursAgo(22),
			lastLoginAt: null
		}
	];
}
function getPreviewAdminClients() {
	return clonePreviewClients();
}
function getPreviewAdminInvitations() {
	const nowMs = typeof window === "undefined" ? (/* @__PURE__ */ new Date("2024-01-15T12:00:00.000Z")).getTime() : Date.now();
	return [
		{
			id: "preview-invite-1",
			email: "logan@techcorp.example",
			role: "client",
			name: "Logan Price",
			message: "Client-side reporting access for the Q2 launch room.",
			status: "pending",
			effectiveStatus: "pending",
			invitedBy: PREVIEW_ADMIN_USER_ID,
			invitedByName: "Avery Stone",
			createdAtMs: nowMs - 7200 * 1e3,
			expiresAtMs: nowMs + 7200 * 60 * 1e3,
			acceptedAtMs: null
		},
		{
			id: "preview-invite-2",
			email: "nina@cohorts.app",
			role: "team",
			name: "Nina Hart",
			message: "Join the paid media pod this week.",
			status: "accepted",
			effectiveStatus: "accepted",
			invitedBy: PREVIEW_ADMIN_USER_ID,
			invitedByName: "Avery Stone",
			createdAtMs: nowMs - 8640 * 60 * 1e3,
			expiresAtMs: nowMs + 1440 * 60 * 1e3,
			acceptedAtMs: nowMs - 7200 * 60 * 1e3
		},
		{
			id: "preview-invite-3",
			email: "ops@retailstore.example",
			role: "client",
			name: null,
			message: null,
			status: "expired",
			effectiveStatus: "expired",
			invitedBy: PREVIEW_ADMIN_USER_ID,
			invitedByName: "Avery Stone",
			createdAtMs: nowMs - 288 * 60 * 60 * 1e3,
			expiresAtMs: nowMs - 7200 * 60 * 1e3,
			acceptedAtMs: null
		},
		{
			id: "preview-invite-4",
			email: "former@startupxyz.example",
			role: "client",
			name: "Former Contact",
			message: "Superseded by the new stakeholder invite.",
			status: "revoked",
			effectiveStatus: "revoked",
			invitedBy: PREVIEW_ADMIN_USER_ID,
			invitedByName: "Avery Stone",
			createdAtMs: nowMs - 11520 * 60 * 1e3,
			expiresAtMs: nowMs + 2880 * 60 * 1e3,
			acceptedAtMs: null
		}
	];
}
function getPreviewAdminProblemReports() {
	return [
		{
			id: "preview-report-1",
			userId: "preview-client-mia",
			userEmail: "mia@techcorp.example",
			userName: "Mia Lopez",
			workspaceId: PREVIEW_ADMIN_WORKSPACE_ID,
			title: "Proposal deck export stalled",
			description: "The deck viewer loaded, but the export button never returned a file on Safari.",
			severity: "high",
			status: "open",
			fixed: false,
			resolution: null,
			createdAt: isoHoursAgo(7),
			updatedAt: isoHoursAgo(6)
		},
		{
			id: "preview-report-2",
			userId: "preview-team-jordan",
			userEmail: "jordan@cohorts.app",
			userName: "Jordan Lee",
			workspaceId: PREVIEW_ADMIN_WORKSPACE_ID,
			title: "Meta reconnect flow needs clearer copy",
			description: "The reconnect button worked, but the OAuth status message looked like an error state.",
			severity: "medium",
			status: "in-progress",
			fixed: false,
			resolution: "Updated copy queued with the integrations refresh.",
			createdAt: isoHoursAgo(19),
			updatedAt: isoHoursAgo(4)
		},
		{
			id: "preview-report-3",
			userId: "preview-team-priya",
			userEmail: "priya@cohorts.app",
			userName: "Priya Patel",
			workspaceId: PREVIEW_ADMIN_WORKSPACE_ID,
			title: "Task board filter mismatch resolved",
			description: "Completed tasks stayed visible after switching clients until the query refreshed.",
			severity: "low",
			status: "resolved",
			fixed: true,
			resolution: "Patched list invalidation after client changes.",
			createdAt: isoDaysAgo(2),
			updatedAt: isoHoursAgo(10)
		}
	];
}
function buildFeature(id, title, status, priority, description) {
	return {
		id,
		title,
		description,
		status,
		priority,
		imageUrl: null,
		references: [{
			label: "Demo brief",
			url: "https://example.com/demo-brief"
		}],
		createdAt: isoDaysAgo(14),
		updatedAt: isoHoursAgo(5)
	};
}
function getPreviewAdminFeatures() {
	return [
		buildFeature("preview-feature-1", "Campaign pacing drill-down", "backlog", "high", "Add a top-level pacing anomaly strip to the ads overview."),
		buildFeature("preview-feature-2", "Workspace tour checkpoints", "planned", "medium", "Guide first-time users through integrations, tasks, and proposals in one flow."),
		buildFeature("preview-feature-3", "Meeting recap publishing", "in_progress", "high", "Turn meeting transcripts into a structured recap with action items and owners."),
		buildFeature("preview-feature-4", "Client-ready export themes", "completed", "medium", "Provide branded export themes for decks and PDF summaries.")
	];
}
function getPreviewAdminDashboardData() {
	const users = getPreviewAdminUsers();
	const clients = getPreviewAdminClients();
	return {
		stats: {
			totalUsers: users.length,
			activeUsers: users.filter((user) => user.status === "active").length,
			totalClients: clients.length,
			activeClients: clients.length,
			schedulerHealth: "warning",
			lastSyncTime: isoHoursAgo(1),
			recentErrors: 1
		},
		usageStats: {
			totalUsers: users.length,
			activeUsersToday: 6,
			activeUsersWeek: 7,
			activeUsersMonth: 9,
			newUsersToday: 1,
			newUsersWeek: 2,
			totalProjects: 11,
			projectsThisWeek: 3,
			totalTasks: 42,
			tasksCompletedThisWeek: 18,
			totalClients: clients.length,
			activeClientsWeek: clients.length,
			agentConversations: 24,
			agentActionsThisWeek: 61,
			dailyActiveUsers: [
				{
					date: isoDateDaysAgo(6),
					count: 3
				},
				{
					date: isoDateDaysAgo(5),
					count: 4
				},
				{
					date: isoDateDaysAgo(4),
					count: 6
				},
				{
					date: isoDateDaysAgo(3),
					count: 5
				},
				{
					date: isoDateDaysAgo(2),
					count: 7
				},
				{
					date: isoDateDaysAgo(1),
					count: 6
				},
				{
					date: isoDateDaysAgo(0),
					count: 6
				}
			],
			featureUsage: [
				{
					feature: "Proposals",
					count: 34,
					trend: 12
				},
				{
					feature: "Tasks",
					count: 29,
					trend: 8
				},
				{
					feature: "Meetings",
					count: 21,
					trend: 15
				},
				{
					feature: "Ads",
					count: 18,
					trend: -4
				},
				{
					feature: "Agent Mode",
					count: 14,
					trend: 19
				}
			]
		},
		activities: [
			{
				id: "preview-activity-1",
				type: "new_user_signup",
				title: "New strategist joined",
				description: "Nina Hart accepted her invite and opened the team workspace.",
				timestamp: isoHoursAgo(2)
			},
			{
				id: "preview-activity-2",
				type: "client_created",
				title: "Retail Store workspace refreshed",
				description: "The client roster and account owner were updated for the spring campaign cycle.",
				timestamp: isoHoursAgo(6)
			},
			{
				id: "preview-activity-3",
				type: "sync_completed",
				title: "Nightly sync completed",
				description: "Ads, analytics, and meeting integrations finished with one warning.",
				timestamp: isoHoursAgo(9)
			},
			{
				id: "preview-activity-4",
				type: "error",
				title: "One retry queued",
				description: "Meta OAuth refresh needs a second attempt for one workspace.",
				timestamp: isoHoursAgo(13)
			}
		]
	};
}
function getPreviewAdminHealthData() {
	return {
		status: "degraded",
		timestamp: isoHoursAgo(0),
		uptime: 453600,
		responseTime: 182,
		version: "preview-demo",
		checks: {
			convex: {
				status: "ok",
				responseTime: 42,
				metadata: {
					deployment: "preview",
					region: "local-demo"
				}
			},
			betterauth: {
				status: "ok",
				responseTime: 24
			},
			gemini: {
				status: "warning",
				message: "Preview mode is using simulated AI responses for demos.",
				responseTime: 88
			},
			posthog: {
				status: "ok",
				responseTime: 31
			},
			brevo: {
				status: "ok",
				responseTime: 36
			},
			googleads: {
				status: "ok",
				responseTime: 53
			},
			googleanalytics: {
				status: "ok",
				responseTime: 48
			},
			metaads: {
				status: "warning",
				message: "One workspace needs a token refresh before the next scheduled sync.",
				responseTime: 96,
				metadata: { workspacesAffected: 1 }
			},
			linkedinads: {
				status: "ok",
				responseTime: 44
			},
			tiktokads: {
				status: "ok",
				responseTime: 51
			},
			googleworkspace: {
				status: "ok",
				responseTime: 29
			},
			livekit: {
				status: "ok",
				responseTime: 33
			},
			environment: {
				status: "ok",
				metadata: {
					mode: "preview",
					nodeEnv: "development"
				}
			}
		}
	};
}
function getPreviewMeetingWorkspaceMembers() {
	return [
		{
			id: "preview-member-1",
			name: "Alex Morgan",
			email: "alex@cohorts.ai",
			role: "Account Manager"
		},
		{
			id: "preview-member-2",
			name: "Jordan Lee",
			email: "jordan@cohorts.ai",
			role: "Strategist"
		},
		{
			id: "preview-member-3",
			name: "Priya Patel",
			email: "priya@cohorts.ai",
			role: "Growth Lead"
		},
		{
			id: "preview-member-4",
			name: "Taylor Kim",
			email: "taylor@cohorts.ai",
			role: "Client Partner"
		},
		{
			id: "preview-member-5",
			name: "Sam Chen",
			email: "sam@cohorts.ai",
			role: "Performance Marketer"
		},
		{
			id: "preview-member-6",
			name: "Casey Rivera",
			email: "casey@cohorts.ai",
			role: "Creative Lead"
		},
		{
			id: "preview-member-7",
			name: "Mia Thompson",
			email: "mia@cohorts.ai",
			role: "Brand Designer"
		},
		{
			id: "preview-member-8",
			name: "Noah Bennett",
			email: "noah@cohorts.ai",
			role: "Lifecycle Specialist"
		}
	];
}
function getPreviewMeetings(clientId, timezone) {
	const now = typeof window === "undefined" ? /* @__PURE__ */ new Date("2024-01-15T12:00:00.000Z") : /* @__PURE__ */ new Date();
	const hour = 3600 * 1e3;
	const day = 24 * hour;
	return [
		{
			clientId: "preview-tech-corp",
			meeting: {
				legacyId: "preview-meeting-1",
				providerId: "livekit",
				title: "Weekly Growth Sync",
				description: "Review pacing, creative tests, SQL quality, and board-level highlights before the Q2 push.",
				startTimeMs: now.getTime() + 2 * hour,
				endTimeMs: now.getTime() + 2 * hour + 2700 * 1e3,
				timezone,
				calendarEventId: "preview-gcal-1",
				status: "scheduled",
				meetLink: "https://app.cohorts.app/dashboard/meetings?room=preview-growth-sync",
				roomName: "preview-growth-sync",
				attendeeEmails: [
					"alex@cohorts.ai",
					"jordan@cohorts.ai",
					"mia@cohorts.ai",
					"growth@techcorp.example"
				],
				notesSummary: null,
				transcriptText: null,
				transcriptUpdatedAtMs: null,
				transcriptSource: null,
				transcriptProcessingState: "idle",
				transcriptProcessingError: null,
				notesUpdatedAtMs: null,
				notesModel: null,
				notesProcessingState: "idle",
				notesProcessingError: null
			}
		},
		{
			clientId: "preview-startupxyz",
			meeting: {
				legacyId: "preview-meeting-2",
				providerId: "livekit",
				title: "Launch War Room",
				description: "Creator shortlist, teaser edits, and launch-week escalation plan.",
				startTimeMs: now.getTime() + day,
				endTimeMs: now.getTime() + day + 1800 * 1e3,
				timezone,
				calendarEventId: null,
				status: "in_progress",
				meetLink: "https://app.cohorts.app/dashboard/meetings?room=preview-launch-war-room",
				roomName: "preview-launch-war-room",
				attendeeEmails: [
					"priya@cohorts.ai",
					"sam@cohorts.ai",
					"launch@startupxyz.example"
				],
				notesSummary: "Key actions:\n- Lock creator roster by Friday\n- Approve 3 teaser cutdowns\n- QA waitlist onboarding flow before launch day",
				transcriptText: "We agreed to prioritize creator deliverables, finalize the teaser cutdowns, and tighten the waitlist onboarding experience before launch week.",
				transcriptUpdatedAtMs: now.getTime() - 720 * 1e3,
				transcriptSource: "livekit-live-capture",
				transcriptProcessingState: "processing",
				transcriptProcessingError: null,
				notesUpdatedAtMs: null,
				notesModel: "gemini-2.5-flash",
				notesProcessingState: "processing",
				notesProcessingError: null
			}
		},
		{
			clientId: "preview-retail-store",
			meeting: {
				legacyId: "preview-meeting-3",
				providerId: "livekit",
				title: "Retail Retention Review",
				description: "Audit repeat purchase rate, spring promo cadence, and lifecycle email segmentation.",
				startTimeMs: now.getTime() + 2 * day + 3 * hour,
				endTimeMs: now.getTime() + 2 * day + 4 * hour,
				timezone,
				calendarEventId: "preview-gcal-3",
				status: "scheduled",
				meetLink: "https://app.cohorts.app/dashboard/meetings?room=preview-retail-retention-review",
				roomName: "preview-retail-retention-review",
				attendeeEmails: [
					"taylor@cohorts.ai",
					"noah@cohorts.ai",
					"marketing@retailstore.example"
				],
				notesSummary: null,
				transcriptText: null,
				transcriptUpdatedAtMs: null,
				transcriptSource: null,
				transcriptProcessingState: "idle",
				transcriptProcessingError: null,
				notesUpdatedAtMs: null,
				notesModel: null,
				notesProcessingState: "idle",
				notesProcessingError: null
			}
		},
		{
			clientId: "preview-tech-corp",
			meeting: {
				legacyId: "preview-meeting-4",
				providerId: "livekit",
				title: "Executive KPI Debrief",
				description: "Walk through CAC, win-rate shifts, and the revised board narrative from this week's performance memo.",
				startTimeMs: now.getTime() - 20 * hour,
				endTimeMs: now.getTime() - 19 * hour - 900 * 1e3,
				timezone,
				calendarEventId: "preview-gcal-4",
				status: "completed",
				meetLink: "https://app.cohorts.app/dashboard/meetings?room=preview-executive-kpi-debrief",
				roomName: "preview-executive-kpi-debrief",
				attendeeEmails: [
					"alex@cohorts.ai",
					"jordan@cohorts.ai",
					"finance@techcorp.example"
				],
				notesSummary: "Summary:\n- Search efficiency improved after the landing-page revision\n- Executive team wants a simplified funnel view in next week's recap\n- Approved a 15% test-budget increase for branded demand capture",
				transcriptText: "Alex reviewed the weekly pipeline snapshot, Jordan highlighted the strongest paid-search segments, and the client approved a larger branded demand-capture test for the next cycle.",
				transcriptUpdatedAtMs: now.getTime() - 18 * hour,
				transcriptSource: "livekit",
				transcriptProcessingState: "idle",
				transcriptProcessingError: null,
				notesUpdatedAtMs: now.getTime() - 17 * hour,
				notesModel: "gemini-2.5-pro",
				notesProcessingState: "idle",
				notesProcessingError: null
			}
		},
		{
			clientId: "preview-startupxyz",
			meeting: {
				legacyId: "preview-meeting-5",
				providerId: "google-meet",
				title: "Creator Approval Handoff",
				description: "Final approval session for creator contracts and launch-week posting windows.",
				startTimeMs: now.getTime() + 3 * day,
				endTimeMs: now.getTime() + 3 * day + 2700 * 1e3,
				timezone,
				calendarEventId: "preview-gcal-5",
				status: "cancelled",
				meetLink: null,
				roomName: null,
				attendeeEmails: [
					"priya@cohorts.ai",
					"casey@cohorts.ai",
					"ops@startupxyz.example"
				],
				notesSummary: null,
				transcriptText: null,
				transcriptUpdatedAtMs: null,
				transcriptSource: null,
				transcriptProcessingState: "idle",
				transcriptProcessingError: null,
				notesUpdatedAtMs: null,
				notesModel: null,
				notesProcessingState: "idle",
				notesProcessingError: null
			}
		},
		{
			clientId: "preview-retail-store",
			meeting: {
				legacyId: "preview-meeting-6",
				providerId: "livekit",
				title: "Post-Campaign Revenue Readout",
				description: "Close out the spring promo retrospective and align on the next lifecycle-email test sequence.",
				startTimeMs: now.getTime() - 52 * hour,
				endTimeMs: now.getTime() - 51 * hour - 1200 * 1e3,
				timezone,
				calendarEventId: "preview-gcal-6",
				status: "completed",
				meetLink: "https://app.cohorts.app/dashboard/meetings?room=preview-retail-readout",
				roomName: "preview-retail-readout",
				attendeeEmails: [
					"taylor@cohorts.ai",
					"noah@cohorts.ai",
					"marketing@retailstore.example"
				],
				notesSummary: null,
				transcriptText: "Taylor recapped the lifecycle performance, Noah shared segmentation learnings, and the client asked for a cleaner resend policy before the next promo window.",
				transcriptUpdatedAtMs: now.getTime() - 50 * hour,
				transcriptSource: "livekit-upload",
				transcriptProcessingState: "idle",
				transcriptProcessingError: null,
				notesUpdatedAtMs: null,
				notesModel: "gemini-2.5-flash",
				notesProcessingState: "failed",
				notesProcessingError: "Preview summary generation timed out after two retries."
			}
		},
		{
			clientId: "preview-tech-corp",
			meeting: {
				legacyId: "preview-meeting-7",
				providerId: "livekit",
				title: "Creative QA Standup",
				description: "Review motion cutdowns, comment backlog, and asset handoff readiness for the next paid social batch.",
				startTimeMs: now.getTime() + 30 * hour,
				endTimeMs: now.getTime() + 30 * hour + 1500 * 1e3,
				timezone,
				calendarEventId: null,
				status: "scheduled",
				meetLink: "https://app.cohorts.app/dashboard/meetings?room=preview-creative-qa-standup",
				roomName: "preview-creative-qa-standup",
				attendeeEmails: [
					"mia@cohorts.ai",
					"alex@cohorts.ai",
					"design@techcorp.example"
				],
				notesSummary: null,
				transcriptText: null,
				transcriptUpdatedAtMs: null,
				transcriptSource: null,
				transcriptProcessingState: "idle",
				transcriptProcessingError: null,
				notesUpdatedAtMs: null,
				notesModel: null,
				notesProcessingState: "idle",
				notesProcessingError: null
			}
		}
	].flatMap((entry) => !clientId || entry.clientId === clientId ? [entry.meeting] : []);
}
function getPreviewGoogleWorkspaceStatus() {
	return {
		connected: true,
		linkedAtMs: (typeof window === "undefined" ? /* @__PURE__ */ new Date("2024-01-10T10:00:00.000Z") : /* @__PURE__ */ new Date(Date.now() - 336 * 60 * 60 * 1e3)).getTime(),
		scopes: [
			"calendar.events",
			"calendar.readonly",
			"meetings.space.created"
		]
	};
}
function buildProjectRoute(projectId, projectName) {
	return withPreviewModeSearchParam(`/dashboard/projects?projectId=${encodeURIComponent(projectId)}&projectName=${encodeURIComponent(projectName)}`);
}
function buildTasksRoute(taskId) {
	return withPreviewModeSearchParam(`/dashboard/tasks${taskId ? `?taskId=${encodeURIComponent(taskId)}` : ""}`);
}
function buildMeetingsRoute(meetingId) {
	return withPreviewModeSearchParam(`/dashboard/meetings${meetingId ? `?meetingId=${encodeURIComponent(meetingId)}` : ""}`);
}
function buildCollaborationRoute(conversationId) {
	return withPreviewModeSearchParam(`/dashboard/collaboration${conversationId ? `?conversationId=${encodeURIComponent(conversationId)}` : ""}`);
}
function buildAnalyticsRoute() {
	return withPreviewModeSearchParam("/dashboard/analytics");
}
function buildReportRoute() {
	return withPreviewModeSearchParam("/dashboard/ads");
}
function getFallbackClient(context) {
	return getPreviewClients().find((client) => client.id === context.activeClientId) ?? getPreviewClients()[0];
}
function extractNamedValue(input, prefixes) {
	const trimmed = input.trim();
	for (const prefix of prefixes) {
		if (!trimmed.toLowerCase().startsWith(prefix)) continue;
		const value = trimmed.slice(prefix.length).trim();
		return value.length > 0 ? value : null;
	}
	return null;
}
function capitalizeLabel(value) {
	return value.split(/\s+/).flatMap((part) => part ? [part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()] : []).join(" ");
}
function buildSampleProjectAction(context) {
	const fallbackProject = getPreviewProjects(context.activeClientId ?? null)[0];
	const fallbackClient = getFallbackClient(context);
	const projectName = "Launch Readiness Sprint";
	const projectId = "preview-project-sample-action";
	const clientName = fallbackClient?.name ?? fallbackProject?.clientName ?? "Tech Corp";
	return {
		action: "execute",
		operation: "createProject",
		success: true,
		route: buildProjectRoute(projectId, projectName),
		message: `Created a sample project card for ${clientName}. Opening the portfolio view so you can demo the result.`,
		data: {
			projectId,
			name: projectName,
			status: "planning",
			clientName,
			startDate: "2026-04-03",
			endDate: "2026-05-15",
			tags: [
				"sample",
				"launch",
				"recording"
			]
		}
	};
}
function buildProjectCreateAction(input, context) {
	const requestedName = extractNamedValue(input, ["create project ", "create a project "]);
	const fallbackClient = getFallbackClient(context);
	const projectName = requestedName ? capitalizeLabel(requestedName) : "Website Refresh";
	const projectId = `preview-project-${projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "new"}`;
	const clientName = fallbackClient?.name ?? "Tech Corp";
	return {
		action: "execute",
		operation: "createProject",
		success: true,
		route: buildProjectRoute(projectId, projectName),
		message: `Created a sample project named ${projectName} for ${clientName}. Opening the projects view so you can demo the result.`,
		data: {
			projectId,
			name: projectName,
			status: "planning",
			clientName,
			startDate: "2026-04-03",
			endDate: "2026-05-15",
			tags: [
				"sample",
				"agent",
				"preview"
			]
		}
	};
}
function buildProjectUpdateAction(input, context) {
	const previewProjects = getPreviewProjects(context.activeClientId ?? null);
	const activeProject = previewProjects.find((project) => project.id === context.activeProjectId) ?? previewProjects[0];
	const normalized = input.toLowerCase();
	const nextStatus = normalized.includes("complete") ? "completed" : normalized.includes("hold") ? "on_hold" : "active";
	return {
		action: "execute",
		operation: "updateProject",
		success: true,
		route: buildProjectRoute(activeProject?.id ?? "preview-project-1", activeProject?.name ?? "Website Refresh"),
		message: `Updated ${activeProject?.name ?? "the current project"} to ${nextStatus.replace("_", " ")} in preview mode.`,
		data: {
			projectId: activeProject?.id ?? "preview-project-1",
			name: activeProject?.name ?? "Website Refresh",
			clientName: activeProject?.clientName ?? getFallbackClient(context)?.name ?? "Tech Corp",
			status: nextStatus,
			tags: activeProject?.tags ?? ["sample", "preview"],
			updatedFields: ["status"]
		}
	};
}
function buildSampleTaskSummary(context) {
	const tasks = getPreviewTasks(context.activeClientId ?? null);
	const clientName = getFallbackClient(context)?.name ?? null;
	const totalTasks = tasks.length;
	const openTasks = tasks.filter((task) => task.status !== "completed" && task.status !== "archived").length;
	const completedTasks = tasks.filter((task) => task.status === "completed").length;
	const highPriorityTasks = tasks.filter((task) => task.priority === "high").length;
	return {
		action: "execute",
		operation: "summarizeClientTasks",
		success: true,
		message: "Here is a sample task summary for the current demo workspace.",
		data: {
			clientName,
			totalTasks,
			openTasks,
			completedTasks,
			overdueTasks: 0,
			dueSoonTasks: tasks.filter((task) => typeof task.dueDate === "string").length,
			highPriorityTasks,
			statusBreakdown: Array.from(tasks.reduce((map, task) => {
				const key = task.status ?? "unknown";
				map.set(key, (map.get(key) ?? 0) + 1);
				return map;
			}, /* @__PURE__ */ new Map()).entries()).map(([status, count]) => ({
				status,
				count
			})),
			tasks: tasks.map((task) => ({
				title: task.title,
				status: task.status,
				priority: task.priority,
				dueDate: task.dueDate,
				assignedTo: task.assignedTo
			}))
		}
	};
}
function buildTaskCreateAction(input, context) {
	const previewTasks = getPreviewTasks(context.activeClientId ?? null);
	const previewProjects = getPreviewProjects(context.activeClientId ?? null);
	const requestedTitle = extractNamedValue(input, [
		"create task ",
		"create a task ",
		"add task ",
		"add a task "
	]);
	const title = requestedTitle ? capitalizeLabel(requestedTitle) : "Follow up on launch approvals";
	const taskId = `preview-task-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "new"}`;
	const project = previewProjects.find((item) => item.id === context.activeProjectId) ?? previewProjects[0];
	const fallbackTask = previewTasks[0];
	return {
		action: "execute",
		operation: "createTask",
		success: true,
		route: buildTasksRoute(taskId),
		message: `Created a sample task called ${title} and queued it in the task list for preview.`,
		data: {
			title,
			taskId,
			projectId: project?.id ?? fallbackTask?.projectId ?? null,
			clientId: context.activeClientId ?? fallbackTask?.clientId ?? null,
			status: "todo",
			action: "Created in preview mode"
		}
	};
}
function buildMeetingScheduleAction(input, context) {
	const attendees = getPreviewMeetingWorkspaceMembers().slice(0, 3);
	const requestedTitle = extractNamedValue(input, [
		"schedule a meeting ",
		"schedule meeting ",
		"book a meeting ",
		"set up a meeting "
	]);
	const title = requestedTitle ? capitalizeLabel(requestedTitle) : "Strategy Sync";
	return {
		action: "execute",
		operation: "createMeeting",
		success: true,
		route: buildMeetingsRoute(`preview-meeting-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "new"}`),
		message: `Scheduled a sample meeting titled ${title}. Opening meetings so you can show the created event.`,
		data: {
			title,
			status: "scheduled",
			action: `Attendees: ${attendees.map((attendee) => attendee.name).join(", ")}`
		}
	};
}
function buildDirectMessageAction(input) {
	const participants = getPreviewCollaborationParticipants();
	const normalized = input.toLowerCase();
	const recipient = participants.find((participant) => normalized.includes(participant.name.toLowerCase().split(" ")[0] ?? "")) ?? participants[0];
	const preview = normalized.includes("about") ? input.slice(Math.max(input.toLowerCase().indexOf("about") + 5, 0)).trim() || "Quick update from preview mode." : "Quick update from preview mode.";
	return {
		action: "execute",
		operation: "sendDirectMessage",
		success: true,
		route: buildCollaborationRoute("preview-dm-alex"),
		message: `Queued a sample direct message to ${recipient?.name ?? "Alex Morgan"} in preview mode.`,
		data: {
			recipientName: recipient?.name ?? "Alex Morgan",
			preview
		}
	};
}
function summarizeProviderMetrics(providerId) {
	const metrics = getPreviewAdsMetrics().filter((metric) => metric.providerId === providerId).slice(0, 7);
	const totals = metrics.reduce((accumulator, metric) => {
		accumulator.spend += metric.spend;
		accumulator.revenue += metric.revenue ?? 0;
		accumulator.impressions += metric.impressions;
		accumulator.clicks += metric.clicks;
		accumulator.conversions += metric.conversions;
		return accumulator;
	}, {
		spend: 0,
		revenue: 0,
		impressions: 0,
		clicks: 0,
		conversions: 0
	});
	const ctr = totals.impressions > 0 ? totals.clicks / totals.impressions * 100 : 0;
	const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;
	return {
		totals: {
			...totals,
			ctr,
			roas
		},
		startDate: metrics.at(-1)?.date?.split("T")[0] ?? "2026-03-25",
		endDate: metrics[0]?.date?.split("T")[0] ?? "2026-03-31"
	};
}
function buildAdsSnapshotAction(input) {
	const normalized = input.toLowerCase();
	const providerId = normalized.includes("meta") || normalized.includes("facebook") ? "facebook" : normalized.includes("linkedin") ? "linkedin" : "google";
	const providerLabel = providerId === "facebook" ? "Meta Ads" : providerId === "linkedin" ? "LinkedIn Ads" : "Google Ads";
	const { totals, startDate, endDate } = summarizeProviderMetrics(providerId);
	const activeCampaigns = getPreviewCampaigns(providerId).slice(0, 3).map((campaign) => ({
		name: campaign.name,
		providerId,
		route: buildReportRoute()
	}));
	const topCampaigns = activeCampaigns.slice(0, 2).map((campaign, index) => ({
		name: campaign.name,
		spend: Number((totals.spend / Math.max(activeCampaigns.length, 1) * (1 + index * .08)).toFixed(2)),
		roas: Number((totals.roas + index * .2).toFixed(2)),
		conversions: Math.max(1, Math.round(totals.conversions / Math.max(activeCampaigns.length, 1) + index)),
		route: campaign.route
	}));
	return {
		action: "execute",
		operation: "summarizeAdsPerformance",
		success: true,
		route: buildAnalyticsRoute(),
		message: `Prepared a preview ${providerLabel} snapshot for the past week. Opening analytics so you can walk through it.`,
		data: {
			periodLabel: "Past 7 days",
			startDate,
			endDate,
			providerLabel,
			campaignCounts: {
				total: activeCampaigns.length,
				active: activeCampaigns.length,
				paused: 0
			},
			totals,
			activeCampaigns,
			topCampaigns,
			providerBreakdown: [{
				providerId,
				label: providerLabel,
				totals
			}]
		}
	};
}
function buildPerformanceReportAction() {
	const googleSnapshot = summarizeProviderMetrics("google");
	const metaSnapshot = summarizeProviderMetrics("facebook");
	const proposals = getPreviewProposals(null);
	return {
		action: "execute",
		operation: "generatePerformanceReport",
		success: true,
		route: buildReportRoute(),
		message: "Generated a sample weekly report using preview ads and proposal metrics. Opening the ads workspace for the handoff view.",
		data: {
			periodLabel: "Weekly",
			startDate: googleSnapshot.startDate,
			endDate: googleSnapshot.endDate,
			metricsSummary: { totals: googleSnapshot.totals },
			providerBreakdown: [{
				providerId: "google",
				label: "Google Ads",
				totals: googleSnapshot.totals
			}, {
				providerId: "facebook",
				label: "Meta Ads",
				totals: metaSnapshot.totals
			}],
			proposalSummary: {
				totalSubmitted: proposals.filter((proposal) => proposal.status === "ready" || proposal.status === "sent").length,
				aiSuccessRate: 92.4
			},
			delivery: { inApp: true }
		}
	};
}
function getPreviewAgentModeResponse(input, context) {
	const normalized = input.trim().toLowerCase();
	if (normalized.includes("create sample project") || normalized.includes("run sample project action")) return buildSampleProjectAction(context);
	if (normalized.includes("create project") || normalized.includes("create a project")) return buildProjectCreateAction(input, context);
	if (normalized.includes("update this project status") || normalized.includes("mark this project") || normalized.includes("set this project")) return buildProjectUpdateAction(input, context);
	if (normalized.includes("summarize sample tasks") || normalized.includes("show sample task summary") || normalized.includes("show my tasks") || normalized.includes("show tasks")) return buildSampleTaskSummary(context);
	if (normalized.includes("create task") || normalized.includes("create a task") || normalized.includes("add task") || normalized.includes("add a task")) return buildTaskCreateAction(input, context);
	if (normalized.includes("schedule a meeting") || normalized.includes("schedule meeting") || normalized.includes("book a meeting") || normalized.includes("set up a meeting")) return buildMeetingScheduleAction(input, context);
	if (normalized.includes("send message") || normalized.includes("send a message") || normalized.includes("dm ") || normalized.includes("message alex")) return buildDirectMessageAction(input);
	if (normalized.includes("meta ads") || normalized.includes("facebook ads") || normalized.includes("google ads") || normalized.includes("linkedin ads") || normalized.includes("ads doing")) return buildAdsSnapshotAction(input);
	if (normalized.includes("generate weekly report") || normalized.includes("weekly report") || normalized.includes("performance report")) return buildPerformanceReportAction();
	if (normalized.includes("open sample analytics")) return {
		action: "navigate",
		route: buildAnalyticsRoute(),
		message: "Opening the sample analytics workspace."
	};
	if (normalized.includes("open for you") || normalized.includes("my feed") || normalized.includes("personalized digest")) return {
		action: "navigate",
		route: "/for-you",
		message: "Opening For You."
	};
	if (normalized.includes("proposal analytics") || normalized.includes("proposal win rate")) return {
		action: "navigate",
		route: "/dashboard/proposals/analytics",
		message: "Opening Proposal analytics."
	};
	return {
		action: "response",
		message: "Sample agent mode is active. Try “Schedule a meeting”, “Create project Website Refresh”, “Update this project status to active”, “How are my Meta ads doing this week?”, “Generate weekly report”, “Show my Tasks”, “Open For You”, “Time off”, or “Proposal analytics”."
	};
}
//#endregion
export { isPreviewRouteRequest as $, getPreviewCollaborationParticipants as A, getPreviewProjectMilestones as B, getPreviewAnalyticsInsights as C, getPreviewClients as D, getPreviewCampaigns as E, getPreviewGoogleWorkspaceStatus as F, getPreviewSettingsProfile as G, getPreviewProposals as H, getPreviewMeetingWorkspaceMembers as I, getPreviewSocialOverview as J, getPreviewSettingsRegionalPreferences as K, getPreviewMeetings as L, getPreviewDirectAutoReply as M, getPreviewDirectConversations as N, getPreviewCollaborationAutoReply as O, getPreviewDirectMessages as P, isPreviewModeEnabled as Q, getPreviewMetrics as R, getPreviewAgentModeResponse as S, getPreviewCampaignInsights as T, getPreviewSettingsExportData as U, getPreviewProjects as V, getPreviewSettingsNotificationPreferences as W, isChannelEnabled as X, getPreviewTasks as Y, isEmailPrefEnabled as Z, getPreviewAdminInvitations as _, PREVIEW_ROUTE_REQUEST_HEADER as a, mergeProposalForm as at, getPreviewAdsIntegrationStatuses as b, createDefaultProposalForm as c, setPreviewModeEnabled as ct, getCurrencyOptions as d, isScreenRecordingAuthBypassEnabled as et, getPreviewActivity as f, getPreviewAdminHealthData as g, getPreviewAdminFeatures as h, PREVIEW_MODE_EVENT as i, kindToCategory as it, getPreviewCollaborationThreadReplies as j, getPreviewCollaborationMessages as k, formatMoney as l, withPreviewModeSearchParamIfEnabled as lt, getPreviewAdminDashboardData as m, NOTIFICATION_CATEGORIES as n, isSupportedCurrency as nt, SUPPORTED_CURRENCIES as o, normalizeCurrencyCode as ot, getPreviewAdminClients as p, getPreviewSocialConnectionStatus as q, POPULAR_CURRENCIES as r, isoDaysAgo as rt, applyPreferencesPatch as s, normalizePreferences as st, CATEGORY_LABELS as t, isScreenRecordingModeEnabled as tt, getCurrencyInfo as u, getPreviewAdminProblemReports as v, getPreviewAnalyticsMetrics as w, getPreviewAdsMetrics as x, getPreviewAdminUsers as y, getPreviewNotifications as z };
