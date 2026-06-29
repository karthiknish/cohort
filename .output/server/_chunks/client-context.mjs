import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, l as useMutation, n as convexClient, r as useConvexAuth, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { At as object, Ct as array, Mt as record, Ot as looseObject, Pt as string, kt as number, xt as _enum } from "../_libs/@better-auth/core+[...].mjs";
import { t as createAuthClient } from "../_libs/better-auth+nanostores.mjs";
import { o as getWorkspaceId, s as isValidRedirectUrl } from "./utils.mjs";
import { a as isNotFoundAppError } from "./convex-errors.mjs";
import { c as reportConvexFailure } from "./notifications.mjs";
import { t as api } from "./api.mjs";
import { t as getPublicEnv } from "./public-env.mjs";
import { n as parseJsonBody, t as ResponseBodyParseError } from "./response-json.mjs";
import { i as isAbortError, l as sleepWithSignal, o as isTimeoutError, r as composeAbortSignal } from "./retry-utils.mjs";
import { t as UnifiedError } from "./unified-error.mjs";
import { n as DEFAULT_NOTIFICATION_PREFERENCES_V2 } from "./preferences.mjs";
import { y as clientsApi } from "./convex-api.mjs";
//#region src/lib/auth-client.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var authClient = createAuthClient({
	baseURL: getPublicEnv("NEXT_PUBLIC_SITE_URL") ?? getPublicEnv("NEXT_PUBLIC_APP_URL") ?? (typeof window !== "undefined" ? window.location.origin : void 0),
	sessionOptions: {
		refetchInterval: 0,
		refetchOnWindowFocus: true,
		refetchWhenOffline: false
	},
	plugins: [convexClient()]
});
//#endregion
//#region src/lib/cache/cache-manager.ts
function safeTtlMs(ttlMs) {
	const ttl = Number(ttlMs);
	if (!Number.isFinite(ttl) || ttl <= 0) return 0;
	return Math.floor(ttl);
}
var CacheManager = class {
	constructor(backend, opts = {}) {
		this.backend = backend;
		this.inFlight = /* @__PURE__ */ new Map();
		this.counters = {
			hits: 0,
			misses: 0,
			sets: 0,
			invalidations: 0,
			errors: 0
		};
		this.backendName = opts.backendName ?? "unknown";
		this.onEvent = opts.onEvent;
	}
	async get(key) {
		try {
			const raw = await this.backend.get(key);
			if (raw == null) {
				this.counters.misses += 1;
				this.onEvent?.({
					type: "miss",
					key,
					backend: this.backendName
				});
				return null;
			}
			this.counters.hits += 1;
			this.onEvent?.({
				type: "hit",
				key,
				backend: this.backendName
			});
			return JSON.parse(raw);
		} catch {
			this.counters.errors += 1;
			this.onEvent?.({
				type: "error",
				key,
				backend: this.backendName
			});
			return null;
		}
	}
	async set(key, value, ttlMs) {
		const ttl = safeTtlMs(ttlMs);
		if (ttl <= 0) {
			await this.backend.invalidate(key);
			this.counters.invalidations += 1;
			this.onEvent?.({
				type: "invalidate",
				pattern: key,
				backend: this.backendName
			});
			return;
		}
		const payload = JSON.stringify(value);
		await this.backend.set(key, payload, ttl);
		this.counters.sets += 1;
		this.onEvent?.({
			type: "set",
			key,
			backend: this.backendName
		});
	}
	async getOrFetch(key, fetcher, ttlMs) {
		const cached = await this.get(key);
		if (cached !== null) return cached;
		const existing = this.inFlight.get(key);
		if (existing) return existing;
		const promise = (async () => {
			const value = await fetcher();
			await this.set(key, value, ttlMs);
			return value;
		})().finally(() => {
			this.inFlight.delete(key);
		});
		this.inFlight.set(key, promise);
		return promise;
	}
	async invalidate(pattern) {
		await this.backend.invalidate(pattern);
		this.counters.invalidations += 1;
		this.onEvent?.({
			type: "invalidate",
			pattern,
			backend: this.backendName
		});
	}
	async invalidateWorkspace(workspaceId) {
		const prefix = `w:${encodeURIComponent(workspaceId)}:`;
		await this.invalidate(`${prefix}*`);
	}
	async clearAll() {
		await this.invalidate("*");
	}
	getStats() {
		return { ...this.counters };
	}
};
//#endregion
//#region src/lib/cache/memory-backend.ts
function safeMaxEntries(value) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) return 500;
	return Math.min(Math.floor(parsed), 5e3);
}
var MemoryCacheBackend = class {
	constructor(opts = {}) {
		this.store = /* @__PURE__ */ new Map();
		this.maxEntries = safeMaxEntries(opts.maxEntries);
	}
	async get(key) {
		const entry = this.store.get(key);
		if (!entry) return null;
		if (entry.expiresAt <= Date.now()) {
			this.store.delete(key);
			return null;
		}
		entry.touchedAt = Date.now();
		return entry.value;
	}
	async set(key, value, ttlMs) {
		const ttl = Number(ttlMs);
		if (!Number.isFinite(ttl) || ttl <= 0) {
			this.store.delete(key);
			return;
		}
		this.store.set(key, {
			value,
			expiresAt: Date.now() + ttl,
			touchedAt: Date.now()
		});
		this.evictIfNeeded();
	}
	async invalidate(pattern) {
		if (!pattern || pattern === "*") {
			this.store.clear();
			return;
		}
		if (pattern.endsWith("*")) {
			const prefix = pattern.slice(0, -1);
			for (const key of this.store.keys()) if (key.startsWith(prefix)) this.store.delete(key);
			return;
		}
		this.store.delete(pattern);
	}
	evictIfNeeded() {
		if (this.store.size <= this.maxEntries) return;
		const entries = Array.from(this.store.entries());
		entries.sort((a, b) => a[1].touchedAt - b[1].touchedAt);
		const excess = this.store.size - this.maxEntries;
		for (let i = 0; i < excess; i += 1) this.store.delete(entries[i][0]);
	}
};
//#endregion
//#region src/lib/preview-data/utils.ts
var PREVIEW_MODE_STORAGE_KEY = "cohorts.previewMode";
var PREVIEW_MODE_EVENT = "cohorts:previewModeChanged";
var PREVIEW_MODE_QUERY_PARAM = "preview";
var PREVIEW_ROUTE_REQUEST_HEADER = "x-cohorts-preview-route";
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
//#endregion
//#region src/lib/preview-data/clients.ts
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
//#endregion
//#region src/lib/preview-data/analytics.ts
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
//#endregion
//#region src/lib/preview-data/projects.ts
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
//#endregion
//#region src/lib/preview-data/activity.ts
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
//#endregion
//#region src/lib/preview-data/notifications.ts
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
//#endregion
//#region src/lib/preview-data/collaboration.ts
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
//#endregion
//#region src/lib/preview-data/ads.ts
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
//#endregion
//#region src/lib/preview-data/socials.ts
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
//#endregion
//#region src/lib/preview-data/settings.ts
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
//#endregion
//#region src/lib/preview-data/admin.ts
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
//#endregion
//#region src/features/dashboard/meetings/lib/preview-data.ts
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
//#endregion
//#region src/lib/preview-data/agent.ts
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
//#region src/lib/api-client.ts
var ApiClientError = class extends UnifiedError {
	constructor(message, options = {}) {
		super({
			message,
			status: options.status,
			code: options.code,
			details: options.details && typeof options.details === "object" && !Array.isArray(options.details) ? options.details : void 0,
			cause: options.cause
		});
		this.name = "ApiClientError";
	}
};
var inFlightRequests = /* @__PURE__ */ new Map();
var RESPONSE_CACHE_TTL_MS = 2e3;
var responseCache = new CacheManager(new MemoryCacheBackend({ maxEntries: 300 }), { backendName: "memory" });
function mapCodeFromStatus(value) {
	if (value === 401) return "UNAUTHORIZED";
	if (value === 403) return "FORBIDDEN";
	if (value === 404) return "NOT_FOUND";
	if (value === 429) return "RATE_LIMIT_EXCEEDED";
	if (value >= 500) return "INTERNAL_ERROR";
}
async function parseApiResponsePayload(response, context) {
	const status = response.status;
	try {
		return await parseJsonBody(response, {
			context,
			allowEmpty: status === 204 || status === 205
		});
	} catch (error) {
		if (error instanceof ResponseBodyParseError) {
			if (!response.ok) throw new ApiClientError(defaultStatusMessage(status), {
				status,
				code: mapCodeFromStatus(status) ?? "INVALID_RESPONSE",
				cause: error
			});
			throw new ApiClientError("The server returned an invalid response. Please try again.", {
				status,
				code: "INVALID_RESPONSE",
				cause: error
			});
		}
		throw error;
	}
}
function createNetworkApiClientError(error, timeoutMs) {
	if (isTimeoutError(error)) return new ApiClientError(`The request timed out${typeof timeoutMs === "number" && timeoutMs > 0 ? ` after ${Math.ceil(timeoutMs / 1e3)}s` : ""}. Please try again.`, {
		code: "REQUEST_TIMEOUT",
		cause: error
	});
	return new ApiClientError("Network error. Please check your connection and try again.", {
		code: "NETWORK_ERROR",
		cause: error
	});
}
async function apiFetch(input, init = {}) {
	const { timeoutMs, signal: requestSignal, ...requestInit } = init;
	const callerSignal = requestSignal ?? void 0;
	const method = requestInit.method || "GET";
	const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
	if (method.toUpperCase() === "GET" && typeof window !== "undefined" && isPreviewModeEnabled()) try {
		const resolved = new URL(url, window.location.origin);
		const path = resolved.pathname;
		const clientId = resolved.searchParams.get("clientId");
		if (path === "/api/clients") return {
			clients: getPreviewClients(),
			nextCursor: null
		};
		if (path === "/api/activity") {
			const activities = getPreviewActivity(clientId);
			return {
				activities,
				hasMore: false,
				total: activities.length
			};
		}
		if (path === "/api/notifications") return {
			notifications: getPreviewNotifications(),
			nextCursor: null
		};
	} catch {}
	const isDeduplicatable = method.toUpperCase() === "GET" && !callerSignal && !timeoutMs;
	const cacheKey = `${method}:${url}${typeof window !== "undefined" && isPreviewModeEnabled() ? ":preview" : ""}`;
	if (isDeduplicatable) {
		const cached = await responseCache.get(cacheKey);
		if (cached !== null) return cached;
	}
	if (isDeduplicatable && inFlightRequests.has(cacheKey)) return inFlightRequests.get(cacheKey);
	const requestPath = (() => {
		try {
			return url.startsWith("http") ? new URL(url).pathname : url;
		} catch {
			return url;
		}
	})();
	const isAuthSessionRequest = requestPath.startsWith("/api/auth/bootstrap") || requestPath.startsWith("/api/auth/session");
	const executeRequest = async (attempt = 0) => {
		try {
			if (typeof window !== "undefined" && !isAuthSessionRequest) await authService.waitForInitialAuth().catch(() => {});
			const headers = new Headers(requestInit.headers);
			if (!headers.has("Content-Type") && method.toUpperCase() !== "GET") headers.set("Content-Type", "application/json");
			const { signal, cleanup } = composeAbortSignal({
				signal: callerSignal,
				timeoutMs
			});
			let response;
			try {
				response = await fetch(input, {
					...requestInit,
					headers,
					credentials: requestInit.credentials ?? "same-origin",
					signal
				});
			} finally {
				cleanup();
			}
			const status = response.status;
			const payload = await parseApiResponsePayload(response, `apiFetch ${method.toUpperCase()} ${url}`);
			const payloadRecord = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : null;
			const isEnvelope = payloadRecord !== null && "success" in payloadRecord;
			if (!response.ok || isEnvelope && payloadRecord.success === false) {
				const code = typeof payloadRecord?.code === "string" ? payloadRecord.code : mapCodeFromStatus(status);
				throw new ApiClientError(typeof payloadRecord?.error === "string" ? payloadRecord.error : defaultStatusMessage(status), {
					status,
					code,
					details: payloadRecord?.details
				});
			}
			if (isEnvelope && "data" in payloadRecord) {
				const result = payloadRecord.data;
				if (isDeduplicatable) responseCache.set(cacheKey, result, RESPONSE_CACHE_TTL_MS);
				return result;
			}
			if (isDeduplicatable) responseCache.set(cacheKey, payload, RESPONSE_CACHE_TTL_MS);
			return payload;
		} catch (error) {
			if (isAbortError(error)) throw error;
			const normalizedError = error instanceof ApiClientError ? error : createNetworkApiClientError(error, timeoutMs);
			if (attempt < 2 && isDeduplicatable && (normalizedError.code === "NETWORK_ERROR" || normalizedError.code === "REQUEST_TIMEOUT")) {
				await sleepWithSignal((attempt + 1) * 1e3, callerSignal);
				return executeRequest(attempt + 1);
			}
			throw normalizedError;
		}
	};
	const promise = executeRequest().finally(() => {
		if (isDeduplicatable) inFlightRequests.delete(cacheKey);
	});
	if (isDeduplicatable) inFlightRequests.set(cacheKey, promise);
	return promise;
}
function defaultStatusMessage(status) {
	if (status === 401) return "Please sign in and try again.";
	if (status === 403) return "You don't have permission to do that.";
	if (status === 404) return "We could not find what you were looking for.";
	if (status === 429) return "Too many requests. Please wait and try again.";
	if (status >= 500) return "Something went wrong on our side. Please try again.";
	return "Request failed. Please try again.";
}
//#endregion
//#region src/features/auth/auth-utils.ts
/**
* Starts Better Auth Google OAuth (proxied to Convex via /api/auth).
* Redirects the browser; does not return on success.
*/
async function startGoogleOAuthSignIn(callbackURL) {
	await authClient.signIn.social({
		provider: "google",
		callbackURL
	});
}
function normalizeBootstrapRole(value) {
	if (value === "admin" || value === "team" || value === "client") return value;
	return "client";
}
function normalizeBootstrapStatus(value) {
	if (value === "active" || value === "pending" || value === "invited" || value === "disabled" || value === "suspended") return value;
	return "pending";
}
function unwrapBootstrapPayload(payload) {
	if (!payload || typeof payload !== "object") return {};
	const record = payload;
	if (record.data && typeof record.data === "object") return record.data;
	return record;
}
/**
* Single sign-in bootstrap: Convex profile upsert + cohorts_* session cookies (7-day TTL).
* No follow-up /api/auth/session round-trip — cookies are set on the bootstrap response.
*/
async function bootstrapAndSyncSession() {
	let bootstrapPayload;
	try {
		bootstrapPayload = await apiFetch("/api/auth/bootstrap", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
			credentials: "include"
		});
	} catch (error) {
		const message = error instanceof ApiClientError ? error.message : "Failed to bootstrap user";
		throw new Error(message);
	}
	const record = unwrapBootstrapPayload(bootstrapPayload);
	const legacyId = typeof record.legacyId === "string" && record.legacyId.length > 0 ? record.legacyId : null;
	const agencyId = typeof record.agencyId === "string" && record.agencyId.length > 0 ? record.agencyId : null;
	if (!legacyId) throw new Error("Bootstrap response missing user id");
	return {
		legacyId,
		role: normalizeBootstrapRole(record.role),
		status: normalizeBootstrapStatus(record.status),
		agencyId: agencyId ?? legacyId
	};
}
var bootstrapCache = null;
var bootstrapPromise = null;
/** Runs bootstrap once per page session (dedupes AuthService + useAuthSync). */
async function bootstrapAndSyncSessionOnce() {
	if (bootstrapCache) return bootstrapCache;
	if (!bootstrapPromise) bootstrapPromise = bootstrapAndSyncSession().then((profile) => {
		bootstrapCache = profile;
		return profile;
	}).catch((error) => {
		bootstrapCache = null;
		throw error;
	}).finally(() => {
		bootstrapPromise = null;
	});
	return bootstrapPromise;
}
function resetBootstrapSessionCache() {
	bootstrapCache = null;
	bootstrapPromise = null;
}
function calculatePasswordStrength(password) {
	const checks = {
		length: password.length >= 8,
		uppercase: /[A-Z]/.test(password),
		lowercase: /[a-z]/.test(password),
		number: /\d/.test(password),
		special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
	};
	const passedChecks = Object.values(checks).filter(Boolean).length;
	let score;
	let label;
	let color;
	if (password.length === 0) {
		score = 0;
		label = "";
		color = "bg-muted";
	} else if (passedChecks <= 1) {
		score = 1;
		label = "Weak";
		color = "bg-destructive";
	} else if (passedChecks === 2) {
		score = 2;
		label = "Fair";
		color = "bg-warning";
	} else if (passedChecks === 3) {
		score = 3;
		label = "Good";
		color = "bg-info";
	} else if (passedChecks === 4) {
		score = 3;
		label = "Strong";
		color = "bg-success";
	} else {
		score = 4;
		label = "Very Strong";
		color = "bg-success";
	}
	return {
		score,
		label,
		color,
		checks
	};
}
//#endregion
//#region src/lib/api-errors.ts
/**
* Base class for all API errors (legacy name)
*
* Backed by UnifiedError to keep one error system.
*/
var ApiError = class extends UnifiedError {
	constructor(message, status, code = "INTERNAL_ERROR", details) {
		super({
			message,
			status,
			code,
			details
		});
		this.name = new.target.name;
	}
};
/**
* 400 Bad Request - Validation or input errors
*/
var ValidationError = class extends ApiError {
	constructor(message = "Validation failed", details) {
		super(message, 400, "VALIDATION_ERROR", details);
	}
};
/**
* 400 Bad Request - Generic invalid request
*/
var BadRequestError = class extends ApiError {
	constructor(message = "Bad request") {
		super(message, 400, "BAD_REQUEST");
	}
};
/**
* 401 Unauthorized - Authentication required
*/
var UnauthorizedError = class extends ApiError {
	constructor(message = "Authentication required") {
		super(message, 401, "UNAUTHORIZED");
	}
};
/**
* 403 Forbidden - Permission denied
*/
var ForbiddenError = class extends ApiError {
	constructor(message = "Permission denied") {
		super(message, 403, "FORBIDDEN");
	}
};
/**
* 404 Not Found - Resource does not exist
*/
var NotFoundError = class extends ApiError {
	constructor(message, resourceType, resourceId) {
		let finalMessage = message || "Resource not found";
		if (!message && resourceType && resourceId) finalMessage = `${resourceType} with ID '${resourceId}' not found`;
		else if (!message && resourceType) finalMessage = `${resourceType} not found`;
		super(finalMessage, 404, "NOT_FOUND");
		this.resourceType = resourceType;
		this.resourceId = resourceId;
	}
};
/**
* 429 Too Many Requests - Rate limit exceeded
*/
var RateLimitError = class extends ApiError {
	constructor(message = "Too many requests") {
		super(message, 429, "RATE_LIMIT_EXCEEDED");
	}
};
/**
* 503 Service Unavailable - Downstream or temporary failure
*/
var ServiceUnavailableError = class extends ApiError {
	constructor(message = "Service temporarily unavailable") {
		super(message, 503, "SERVICE_UNAVAILABLE");
	}
};
/**
* 401 Session Expired - Session has timed out
*/
var SessionExpiredError = class extends ApiError {
	constructor(message = "Your session has expired. Please sign in again.") {
		super(message, 401, "SESSION_EXPIRED");
	}
};
/**
* 403 Account Disabled - User account has been disabled
*/
var AccountDisabledError = class extends ApiError {
	constructor(message = "Your account has been disabled. Please contact support.") {
		super(message, 403, "ACCOUNT_DISABLED");
	}
};
/**
* 403 Account Suspended - User account has been suspended
*/
var AccountSuspendedError = class extends ApiError {
	constructor(message = "Your account has been suspended. Please contact support.") {
		super(message, 403, "ACCOUNT_SUSPENDED");
	}
};
/**
* 403 Account Pending - User account is pending approval
*/
var AccountPendingError = class extends ApiError {
	constructor(message = "Your account is pending approval.") {
		super(message, 403, "ACCOUNT_PENDING");
	}
};
/**
* 400 Invalid Credentials - Wrong email or password
*/
var InvalidCredentialsError = class extends ApiError {
	constructor(message = "Invalid email or password") {
		super(message, 400, "INVALID_CREDENTIALS");
	}
};
/**
* 400 Weak Password - Password does not meet requirements
*/
var WeakPasswordError = class extends ApiError {
	constructor(message = "Password is too weak. Use at least 8 characters with letters and numbers.") {
		super(message, 400, "WEAK_PASSWORD");
	}
};
/**
* 409 Email Already Exists - Account with email already exists
*/
var EmailAlreadyExistsError = class extends ApiError {
	constructor(message = "An account with this email already exists.") {
		super(message, 409, "EMAIL_ALREADY_EXISTS");
	}
};
/**
* 400 Invalid Email - Email format is invalid
*/
var InvalidEmailError = class extends ApiError {
	constructor(message = "Please enter a valid email address.") {
		super(message, 400, "INVALID_EMAIL");
	}
};
/**
* 408 Network Timeout - Request timed out
*/
var NetworkTimeoutError = class extends ApiError {
	constructor(message = "Request timed out. Please check your connection and try again.") {
		super(message, 408, "NETWORK_TIMEOUT");
	}
};
/**
* 503 Network Error - Network connectivity issue
*/
var NetworkError = class extends ApiError {
	constructor(message = "Network error. Please check your internet connection.") {
		super(message, 503, "NETWORK_ERROR");
	}
};
/**
* 400 OAuth Error - OAuth flow failed
*/
var OAuthError = class extends ApiError {
	constructor(message = "OAuth authentication failed. Please try again.") {
		super(message, 400, "OAUTH_ERROR");
	}
};
/**
* 400 OAuth Cancelled - User cancelled OAuth flow
*/
var OAuthCancelledError = class extends ApiError {
	constructor(message = "Sign-in was cancelled.") {
		super(message, 400, "OAUTH_CANCELLED");
	}
};
/**
* 400 OAuth Popup Blocked - Browser blocked OAuth popup
*/
var OAuthPopupBlockedError = class extends ApiError {
	constructor(message = "Sign-in popup was blocked by your browser. Please allow popups for this site.") {
		super(message, 400, "OAUTH_POPUP_BLOCKED");
	}
};
//#endregion
//#region src/services/auth/error-utils.ts
/**
* Maps auth error codes to user-friendly messages.
* Handles Firebase, Better Auth, and generic error codes.
*/
var errorMap = {
	"auth/invalid-email": "Please enter a valid email address.",
	"auth/user-disabled": "This account has been disabled. Please contact support.",
	"auth/user-not-found": "No account found with this email.",
	"auth/wrong-password": "Incorrect password. Please try again.",
	"auth/invalid-credential": "Invalid email or password. Please try again.",
	"auth/too-many-requests": "Too many failed attempts. Please try again later.",
	"auth/operation-not-allowed": "This sign-in method is not enabled. Please contact support.",
	"auth/email-already-in-use": "An account with this email already exists.",
	"auth/weak-password": "Password is too weak. Use at least 8 characters with letters and numbers.",
	"auth/popup-closed-by-user": "Sign-in was cancelled.",
	"auth/popup-blocked": "Sign-in popup was blocked by your browser. Please allow popups for this site.",
	"auth/unauthorized-domain": "This domain is not authorized for sign-in.",
	"auth/account-exists-with-different-credential": "An account already exists using a different sign-in method.",
	"auth/cancelled-popup-request": "Only one sign-in window can be open at a time.",
	"auth/network-request-failed": "Network error. Please check your internet connection.",
	"auth/timeout": "Request timed out. Please try again.",
	"auth/requires-recent-login": "Please sign in again to perform this sensitive action.",
	"auth/session-expired": "Your session has expired. Please sign in again.",
	"auth/token-expired": "Your session has expired. Please sign in again.",
	"auth/internal-error": "An internal error occurred. Please try again later.",
	"auth/invalid-api-key": "Configuration error. Please contact support.",
	"auth/app-not-authorized": "This app is not authorized for authentication.",
	"INVALID_CREDENTIALS": "Invalid email or password.",
	"USER_NOT_FOUND": "No account found with this email.",
	"EMAIL_NOT_VERIFIED": "Please verify your email address to continue.",
	"ACCOUNT_DISABLED": "Your account has been disabled. Please contact support.",
	"ACCOUNT_SUSPENDED": "Your account has been suspended. Please contact support.",
	"account_disabled": "Your account has been disabled. Please contact support.",
	"account_suspended": "Your account has been suspended. Please contact support.",
	"ACCOUNT_PENDING": "Your account is pending approval.",
	"SESSION_EXPIRED": "Your session has expired. Please sign in again.",
	"INVALID_TOKEN": "Invalid authentication token. Please sign in again.",
	"WEAK_PASSWORD": "Password is too weak. Use at least 8 characters with letters and numbers.",
	"EMAIL_ALREADY_EXISTS": "An account with this email already exists.",
	"INVALID_EMAIL": "Please enter a valid email address.",
	"TOO_MANY_REQUESTS": "Too many requests. Please wait a moment and try again.",
	"NETWORK_ERROR": "Network error. Please check your internet connection.",
	"OAUTH_CANCELLED": "Sign-in was cancelled.",
	"OAUTH_POPUP_BLOCKED": "Sign-in popup was blocked by your browser. Please allow popups for this site.",
	"OAUTH_ERROR": "OAuth authentication failed. Please try again.",
	"invalid_code": "Google sign-in could not be completed. Try again, or confirm redirect URI http://localhost:3000/api/auth/callback/google is registered in Google Cloud Console.",
	"state_mismatch": "Sign-in session expired. Please try Google sign-in again.",
	"state_not_found": "Sign-in session expired. Please try Google sign-in again.",
	"unable_to_get_user_info": "Could not read your Google profile. Try again or use email sign-in.",
	"UNKNOWN": "Google sign-in failed. Please try again.",
	"UNAUTHORIZED": "Authentication required. Please sign in.",
	"FORBIDDEN": "You do not have permission to perform this action.",
	"SERVICE_UNAVAILABLE": "Service temporarily unavailable. Please try again later.",
	"AUTH_SERVICE_MISCONFIGURED": "Authentication service is misconfigured. Ensure Convex SITE_URL and BETTER_AUTH_SECRET match this deployment, then check server logs."
};
/** Better Auth generic 500 body when Convex init or CORS/origin checks fail. */
var BETTER_AUTH_GENERIC_500 = "your request couldn't be completed";
var AUTH_MISCONFIGURED_MESSAGE = errorMap.AUTH_SERVICE_MISCONFIGURED ?? "Authentication service is misconfigured. Ensure Convex SITE_URL and BETTER_AUTH_SECRET match this deployment, then check server logs.";
function isBetterAuthGenericFailureMessage(message) {
	const lower = message.toLowerCase();
	return lower.includes(BETTER_AUTH_GENERIC_500) || lower.includes("try again later") || lower.includes("[betterauth]") || lower.includes("better_auth_secret") || lower.includes("site_url");
}
/**
* Maps Firebase/Better Auth auth error codes to user-friendly messages.
* This ensures technical details are not exposed to the user.
*/
function getFriendlyAuthErrorMessage(error) {
	if (!error) return "An unexpected error occurred. Please try again.";
	if (typeof error === "string") {
		if (errorMap[error]) return errorMap[error];
		const normalized = error.toUpperCase().replace(/-/g, "_");
		if (errorMap[normalized]) return errorMap[normalized];
		if (isBetterAuthGenericFailureMessage(error)) return AUTH_MISCONFIGURED_MESSAGE;
		return error;
	}
	const fallbackMessage = "Authentication failed. Please try again.";
	if (typeof error !== "object" || error === null) return fallbackMessage;
	const errorCode = error.code;
	const errorMessage = error.message;
	const errorStatus = error.status;
	if (errorStatus) {
		if (errorStatus === 401) return "Authentication required. Please sign in.";
		if (errorStatus === 403) return "You do not have permission to perform this action.";
		if (errorStatus === 429) return "Too many requests. Please wait a moment and try again.";
		if (errorStatus === 503) return "Service temporarily unavailable. Please try again later.";
		if (errorStatus === 408) return "Request timed out. Please try again.";
		if (errorStatus === 500) return AUTH_MISCONFIGURED_MESSAGE;
	}
	if (errorCode && errorMap[errorCode]) return errorMap[errorCode];
	if (errorMessage && typeof errorMessage === "string") {
		if (isBetterAuthGenericFailureMessage(errorMessage)) return AUTH_MISCONFIGURED_MESSAGE;
		if (errorMessage.includes("redirect_uri_mismatch")) return "Google OAuth redirect URI mismatch. In Google Cloud Console, add http://localhost:3000/api/auth/callback/google (dev) or https://your-domain.com/api/auth/callback/google (prod), and set SITE_URL / BETTER_AUTH_URL to that same origin on your Convex deployment.";
		const clean = errorMessage.replace(/^Firebase:\s*/i, "").replace(/^BetterAuth:\s*/i, "").replace(/\s*\(auth\/[^)]+\)\.?$/i, "").replace(/\s*\([A-Z_]+\)\.?$/i, "").trim();
		if (clean.toLowerCase() === "error" || clean.toLowerCase() === "auth error" || clean.length === 0) return fallbackMessage;
		return clean;
	}
	return fallbackMessage;
}
/**
* Converts an unknown error into a typed API error based on error code/message
*/
function parseAuthError(error) {
	if (!error || typeof error !== "object") return new UnauthorizedError(getFriendlyAuthErrorMessage(error));
	const errorCode = error.code ?? "";
	const errorMessage = error.message ?? "";
	const errorStatus = error.status;
	const lowerMessage = errorMessage.toLowerCase();
	if (errorCode === "auth/network-request-failed" || errorCode === "NETWORK_ERROR" || lowerMessage.includes("network") || lowerMessage.includes("fetch failed") || lowerMessage.includes("failed to fetch")) return new NetworkError();
	if (errorCode === "auth/timeout" || lowerMessage.includes("timeout") || lowerMessage.includes("timed out") || errorStatus === 408) return new NetworkTimeoutError();
	if (errorCode === "auth/too-many-requests" || errorCode === "TOO_MANY_REQUESTS" || errorStatus === 429) return new RateLimitError();
	if (errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password" || errorCode === "auth/user-not-found" || errorCode === "INVALID_CREDENTIALS" || errorCode === "USER_NOT_FOUND" || lowerMessage.includes("invalid credentials") || lowerMessage.includes("invalid email or password")) return new InvalidCredentialsError();
	if (errorCode === "auth/invalid-email" || errorCode === "INVALID_EMAIL") return new InvalidEmailError();
	if (errorCode === "auth/weak-password" || errorCode === "WEAK_PASSWORD") return new WeakPasswordError();
	if (errorCode === "auth/email-already-in-use" || errorCode === "EMAIL_ALREADY_EXISTS") return new EmailAlreadyExistsError();
	if (errorCode === "auth/user-disabled" || errorCode === "ACCOUNT_DISABLED" || lowerMessage.includes("disabled")) return new AccountDisabledError();
	if (errorCode === "ACCOUNT_SUSPENDED" || lowerMessage.includes("suspended")) return new AccountSuspendedError();
	if (errorCode === "ACCOUNT_PENDING" || lowerMessage.includes("pending")) return new AccountPendingError();
	if (errorCode === "auth/session-expired" || errorCode === "auth/token-expired" || errorCode === "SESSION_EXPIRED" || errorCode === "INVALID_TOKEN" || lowerMessage.includes("session expired") || lowerMessage.includes("token expired")) return new SessionExpiredError();
	if (errorCode === "auth/popup-closed-by-user" || errorCode === "auth/cancelled-popup-request" || errorCode === "OAUTH_CANCELLED") return new OAuthCancelledError();
	if (errorCode === "auth/popup-blocked" || errorCode === "OAUTH_POPUP_BLOCKED") return new OAuthPopupBlockedError();
	if (errorCode === "auth/account-exists-with-different-credential" || errorCode === "auth/unauthorized-domain" || errorCode === "OAUTH_ERROR" || lowerMessage.includes("oauth")) return new OAuthError(getFriendlyAuthErrorMessage(error));
	if (errorCode === "auth/internal-error" || errorCode === "SERVICE_UNAVAILABLE" || errorStatus === 503) return new ServiceUnavailableError();
	if (errorStatus === 500 || errorMessage && isBetterAuthGenericFailureMessage(errorMessage)) return new ServiceUnavailableError(AUTH_MISCONFIGURED_MESSAGE);
	return new UnauthorizedError(getFriendlyAuthErrorMessage(error));
}
/**
* Checks if an error is a network-related error
*/
function isNetworkError(error) {
	if (!error || typeof error !== "object") return false;
	const errorCode = error.code ?? "";
	const lowerMessage = (error.message ?? "").toLowerCase();
	return errorCode === "auth/network-request-failed" || errorCode === "NETWORK_ERROR" || lowerMessage.includes("network") || lowerMessage.includes("fetch failed") || lowerMessage.includes("failed to fetch") || error instanceof NetworkError;
}
//#endregion
//#region src/services/auth/auth-service.ts
var OAUTH_START_TIMEOUT_MS = 15e3;
function normalizeRole(value) {
	return value === "admin" || value === "team" || value === "client" ? value : "client";
}
function normalizeStatus(value) {
	return value === "active" || value === "pending" || value === "invited" || value === "disabled" || value === "suspended" ? value : "pending";
}
function createOauthStartError(response, message) {
	if (response.status === 401) return new SessionExpiredError(message);
	if (response.status >= 500 || response.ok) return new ServiceUnavailableError(message);
	return new BadRequestError(message);
}
async function parseOauthStartPayload(response, context, message) {
	try {
		const payload = await parseJsonBody(response, { context });
		if (payload === null) throw new ResponseBodyParseError(context, "empty");
		return payload;
	} catch (error) {
		if (error instanceof ResponseBodyParseError) throw createOauthStartError(response, message);
		throw error;
	}
}
async function fetchWithTimeout(input, init) {
	const { signal, cleanup } = composeAbortSignal({
		signal: init.signal ?? void 0,
		timeoutMs: OAUTH_START_TIMEOUT_MS,
		timeoutMessage: "The authentication service took too long to respond."
	});
	try {
		return await fetch(input, {
			...init,
			signal
		});
	} catch (error) {
		if (isTimeoutError(error)) throw new NetworkTimeoutError("The authentication service took too long to respond. Please try again.");
		if (isNetworkError(error)) throw new NetworkError("Unable to reach the authentication service. Please check your connection and try again.");
		throw error;
	} finally {
		cleanup();
	}
}
var authService = class AuthService {
	extractSessionPayload(result) {
		if (!result || typeof result !== "object" || !("data" in result)) return null;
		const data = result.data;
		if (!data || typeof data !== "object") return null;
		return data;
	}
	setResolvedUser(user) {
		this.currentUser = user;
		this.notifyListeners(user);
	}
	async resolveSessionUser(options) {
		const sessionResult = await authClient.getSession({ query: options?.disableCookieCache ? { disableCookieCache: true } : void 0 }).catch((err) => {
			console.error("[AuthService] getSession error:", err);
			return null;
		});
		const session = this.extractSessionPayload(sessionResult);
		return session?.user ? this.mapBetterAuthUser(session.user) : null;
	}
	async ensureFreshSession() {
		const freshUser = await this.resolveSessionUser({ disableCookieCache: true });
		if (!freshUser) {
			this.setResolvedUser(null);
			throw new SessionExpiredError("Your session has expired. Please sign in again.");
		}
		this.setResolvedUser(freshUser);
		return freshUser;
	}
	readCsrfCookie() {
		if (typeof document === "undefined") return null;
		const csrfCookie = document.cookie.split("; ").find((row) => row.startsWith("cohorts_csrf="));
		if (!csrfCookie) return null;
		const [, value = ""] = csrfCookie.split("=", 2);
		const csrfToken = decodeURIComponent(value);
		return csrfToken.length > 0 ? csrfToken : null;
	}
	async resolveCsrfToken() {
		const existingToken = this.readCsrfCookie();
		if (existingToken) return existingToken;
		try {
			const response = await fetchWithTimeout("/api/auth/session", {
				method: "GET",
				headers: { Accept: "application/json" },
				credentials: "include"
			});
			if (!response.ok) return null;
			const payload = await parseJsonBody(response, { context: "AuthService resolveCsrfToken" });
			return typeof payload?.csrfToken === "string" && payload.csrfToken.length > 0 ? payload.csrfToken : this.readCsrfCookie();
		} catch (error) {
			console.warn("[AuthService] Failed to refresh CSRF token:", error);
			return null;
		}
	}
	async fetchGoogleWorkspaceOauthUrl(search) {
		return await fetchWithTimeout(`/api/integrations/google-workspace/oauth/url${search}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include"
		});
	}
	async fetchGoogleOauthUrl(search) {
		return await fetchWithTimeout(`/api/integrations/google/oauth/url${search}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include"
		});
	}
	constructor() {
		this.currentUser = null;
		this.authStateListeners = [];
		this.initialAuthResolved = false;
		this.initialAuthPromise = new Promise((resolve) => {
			this.resolveInitialAuth = resolve;
		});
		if (typeof window !== "undefined") this.initSession();
		else {
			this.initialAuthResolved = true;
			this.resolveInitialAuth();
		}
	}
	static getInstance() {
		if (!AuthService.instance) AuthService.instance = new AuthService();
		return AuthService.instance;
	}
	async initSession() {
		let nextUser = null;
		try {
			nextUser = await this.resolveSessionUser({ disableCookieCache: true });
			this.setResolvedUser(nextUser);
		} finally {
			if (!this.initialAuthResolved) {
				this.initialAuthResolved = true;
				this.resolveInitialAuth();
			}
		}
	}
	mapBetterAuthUser(user) {
		const id = typeof user.id === "string" ? user.id : "";
		const email = typeof user.email === "string" ? user.email : "";
		return {
			id,
			email,
			name: typeof user.name === "string" ? user.name : email,
			phoneNumber: null,
			photoURL: typeof user.image === "string" ? user.image : null,
			role: normalizeRole(user.role),
			status: normalizeStatus(user.status),
			agencyId: typeof user.agencyId === "string" ? String(user.agencyId) : "",
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	}
	getCurrentUser() {
		return this.currentUser;
	}
	onAuthStateChanged(callback) {
		this.authStateListeners.push(callback);
		if (this.initialAuthResolved) callback(this.currentUser);
		return () => {
			const index = this.authStateListeners.indexOf(callback);
			if (index > -1) this.authStateListeners.splice(index, 1);
		};
	}
	async waitForInitialAuth() {
		await this.initialAuthPromise;
	}
	notifyListeners(user) {
		this.authStateListeners.forEach((listener) => {
			listener(user);
		});
	}
	validateEmail(email) {
		if (!email || !email.trim()) throw new InvalidEmailError("Email is required");
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new InvalidEmailError("Please enter a valid email address");
	}
	validatePassword(password, isSignUp = false) {
		if (!password) throw new InvalidCredentialsError("Password is required");
		if (isSignUp && password.length < 8) throw new WeakPasswordError("Password must be at least 8 characters");
	}
	mergeBootstrapProfile(baseUser, profile) {
		return {
			...baseUser,
			role: profile.role,
			status: profile.status,
			agencyId: profile.agencyId
		};
	}
	/** Blocks disabled/suspended only — pending users are routed after sign-in. */
	assertSignInAllowed(user) {
		if (user.status === "disabled") throw new AccountDisabledError();
		if (user.status === "suspended") throw new AccountSuspendedError();
	}
	async completeSignInProfile(baseUser) {
		resetBootstrapSessionCache();
		const profile = await bootstrapAndSyncSessionOnce();
		const merged = this.mergeBootstrapProfile(baseUser, profile);
		this.assertSignInAllowed(merged);
		this.setResolvedUser(merged);
		return merged;
	}
	async signIn(email, password) {
		this.validateEmail(email);
		this.validatePassword(password);
		try {
			const result = await authClient.signIn.email({
				email: email.trim(),
				password
			});
			const data = result && typeof result === "object" && "data" in result ? result.data ?? null : null;
			const errorInResult = result && typeof result === "object" && "error" in result ? result.error ?? null : null;
			if (errorInResult) throw parseAuthError(errorInResult);
			if (!data?.user) throw new InvalidCredentialsError();
			const user = this.mapBetterAuthUser(data.user);
			return await this.completeSignInProfile(user);
		} catch (error) {
			if (error instanceof InvalidCredentialsError || error instanceof InvalidEmailError || error instanceof AccountDisabledError || error instanceof AccountSuspendedError || error instanceof AccountPendingError || error instanceof RateLimitError || error instanceof NetworkError || error instanceof NetworkTimeoutError || error instanceof SessionExpiredError) throw error;
			if (isNetworkError(error)) throw new NetworkError();
			throw parseAuthError(error);
		}
	}
	async signUp(signUpData) {
		this.validateEmail(signUpData.email);
		this.validatePassword(signUpData.password, true);
		try {
			const result = await authClient.signUp.email({
				email: signUpData.email.trim(),
				password: signUpData.password,
				name: signUpData.displayName ?? signUpData.email
			});
			const payload = result && typeof result === "object" && "data" in result ? result.data ?? null : null;
			const errorInResult = result && typeof result === "object" && "error" in result ? result.error ?? null : null;
			if (errorInResult) throw parseAuthError(errorInResult);
			if (!payload?.user) throw new BadRequestError("Sign-up failed. Please try again.");
			const user = this.mapBetterAuthUser(payload.user);
			return await this.completeSignInProfile(user);
		} catch (error) {
			if (error instanceof InvalidCredentialsError || error instanceof InvalidEmailError || error instanceof WeakPasswordError || error instanceof EmailAlreadyExistsError || error instanceof RateLimitError || error instanceof NetworkError || error instanceof NetworkTimeoutError || error instanceof BadRequestError) throw error;
			if (isNetworkError(error)) throw new NetworkError();
			throw parseAuthError(error);
		}
	}
	async signOut() {
		resetBootstrapSessionCache();
		try {
			await this.clearSessionCookies();
			await authClient.signOut();
			this.currentUser = null;
			this.notifyListeners(null);
		} catch (error) {
			if (isNetworkError(error)) throw new NetworkError("Failed to sign out. Please check your connection.");
			throw new ServiceUnavailableError("Failed to sign out. Please try again.");
		}
	}
	async clearSessionCookies() {
		try {
			const csrfToken = await this.resolveCsrfToken();
			const response = await fetch("/api/auth/session", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					"x-csrf-token": csrfToken ?? ""
				},
				credentials: "include"
			});
			if (!response.ok && response.status !== 401) console.warn("[AuthService] Session cookie clear failed:", response.status);
		} catch (error) {
			console.warn("[AuthService] Failed to clear session cookies:", error);
		}
	}
	async signInWithGoogle(callbackURL = "/dashboard") {
		await startGoogleOAuthSignIn(callbackURL);
	}
	async connectGoogleAdsAccount() {
		throw new ServiceUnavailableError("Popup integrations require Better Auth OAuth setup");
	}
	async connectGoogleAnalyticsAccount() {
		throw new ServiceUnavailableError("Popup integrations require Better Auth OAuth setup");
	}
	async connectFacebookAdsAccount() {
		throw new ServiceUnavailableError("Popup integrations require Better Auth OAuth setup");
	}
	async connectLinkedInAdsAccount() {
		throw new ServiceUnavailableError("Popup integrations require Better Auth OAuth setup");
	}
	async startGoogleOauth(redirect, clientId) {
		if (redirect && !isValidRedirectUrl(redirect)) throw new ValidationError("Invalid redirect URL");
		await this.ensureFreshSession();
		const params = new URLSearchParams();
		if (redirect) params.set("redirect", redirect);
		if (clientId) params.set("clientId", clientId);
		const search = params.toString() ? `?${params.toString()}` : "";
		let response = await this.fetchGoogleOauthUrl(search);
		if (response.status === 401) {
			await this.ensureFreshSession().catch(() => null);
			response = await this.fetchGoogleOauthUrl(search);
		}
		const payload = await parseOauthStartPayload(response, "Google OAuth start", "Failed to start Google OAuth");
		if (payload && typeof payload === "object" && "success" in payload) {
			const record = payload;
			if (!record.success) {
				const message = typeof record.error === "string" ? record.error : "Failed to start Google OAuth";
				if (response.status === 401) throw new SessionExpiredError(message);
				throw new BadRequestError(message);
			}
			const data = record.data;
			if (typeof data?.url === "string" && data.url.length > 0) return { url: data.url };
			throw new ServiceUnavailableError("Google OAuth did not return a URL");
		}
		if (!response.ok) {
			const record = payload;
			const message = typeof record?.error === "string" ? record.error : "Failed to start Google OAuth";
			if (response.status === 401) throw new SessionExpiredError(message);
			throw new BadRequestError(message);
		}
		const legacy = payload;
		if (typeof legacy?.url === "string" && legacy.url.length > 0) return { url: legacy.url };
		throw new ServiceUnavailableError("Google OAuth did not return a URL");
	}
	async startGoogleWorkspaceOauth(redirect) {
		if (redirect && !isValidRedirectUrl(redirect)) throw new ValidationError("Invalid redirect URL");
		const params = new URLSearchParams();
		if (redirect) params.set("redirect", redirect);
		const search = params.toString() ? `?${params.toString()}` : "";
		await this.ensureFreshSession();
		let response = await this.fetchGoogleWorkspaceOauthUrl(search);
		if (response.status === 401) {
			await this.ensureFreshSession().catch(() => null);
			response = await this.fetchGoogleWorkspaceOauthUrl(search);
		}
		const payload = await parseOauthStartPayload(response, "Google Workspace OAuth start", "Failed to start Google Workspace OAuth");
		if (payload && typeof payload === "object" && "success" in payload) {
			const record = payload;
			if (!record.success) {
				const message = typeof record.error === "string" ? record.error : "Failed to start Google Workspace OAuth";
				if (response.status === 401) throw new SessionExpiredError(message);
				throw new BadRequestError(message);
			}
			const data = record.data;
			if (typeof data?.url === "string" && data.url.length > 0) return { url: data.url };
			throw new ServiceUnavailableError("Google Workspace OAuth did not return a URL");
		}
		if (!response.ok) {
			const record = payload;
			const message = typeof record?.error === "string" ? record.error : "Failed to start Google Workspace OAuth";
			if (response.status === 401) throw new SessionExpiredError(message);
			throw new BadRequestError(message);
		}
		const legacy = payload;
		if (typeof legacy?.url === "string" && legacy.url.length > 0) return { url: legacy.url };
		throw new ServiceUnavailableError("Google Workspace OAuth did not return a URL");
	}
	async startMetaOauth(redirect, clientId, surface, entryPoint) {
		if (redirect && !isValidRedirectUrl(redirect)) throw new ValidationError("Invalid redirect URL");
		await this.ensureFreshSession();
		const params = new URLSearchParams();
		if (redirect) params.set("redirect", redirect);
		if (clientId) params.set("clientId", clientId);
		if (surface) params.set("surface", surface);
		if (entryPoint) params.set("entryPoint", entryPoint);
		const search = params.toString() ? `?${params.toString()}` : "";
		const fetchMetaOauthUrl = async () => await fetchWithTimeout(`/api/integrations/meta/oauth/url${search}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include"
		});
		let response = await fetchMetaOauthUrl();
		if (response.status === 401) {
			await this.ensureFreshSession().catch(() => null);
			response = await fetchMetaOauthUrl();
		}
		const payload = await parseOauthStartPayload(response, "Meta OAuth start", "Failed to start Meta OAuth");
		if (payload && typeof payload === "object" && "success" in payload) {
			const record = payload;
			if (!record.success) {
				const message = typeof record.error === "string" ? record.error : "Failed to start Meta OAuth";
				if (response.status === 401) throw new SessionExpiredError(message);
				throw new BadRequestError(message);
			}
			const data = record.data;
			if (typeof data?.url === "string" && data.url.length > 0) return { url: data.url };
			throw new ServiceUnavailableError("Meta OAuth did not return a URL");
		}
		if (!response.ok) {
			const record = payload;
			const message = typeof record?.error === "string" ? record.error : "Failed to start Meta OAuth";
			if (response.status === 401) throw new SessionExpiredError(message);
			throw new BadRequestError(message);
		}
		const legacy = payload;
		if (typeof legacy?.url === "string" && legacy.url.length > 0) return { url: legacy.url };
		throw new ServiceUnavailableError("Meta OAuth did not return a URL");
	}
	async startTikTokOauth(redirect, clientId) {
		if (redirect && !isValidRedirectUrl(redirect)) throw new ValidationError("Invalid redirect URL");
		const params = new URLSearchParams();
		if (redirect) params.set("redirect", redirect);
		if (clientId) params.set("clientId", clientId);
		const response = await fetchWithTimeout(`/api/integrations/tiktok/oauth/url${params.toString() ? `?${params.toString()}` : ""}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "same-origin"
		});
		const payload = await parseOauthStartPayload(response, "TikTok OAuth start", "Failed to start TikTok OAuth");
		if (payload && typeof payload === "object" && "success" in payload) {
			const record = payload;
			if (!record.success) throw new BadRequestError(typeof record.error === "string" ? record.error : "Failed to start TikTok OAuth");
			const data = record.data;
			if (typeof data?.url === "string" && data.url.length > 0) return { url: data.url };
			throw new ServiceUnavailableError("TikTok OAuth did not return a URL");
		}
		if (!response.ok) {
			const record = payload;
			throw new BadRequestError(typeof record?.error === "string" ? record.error : "Failed to start TikTok OAuth");
		}
		const legacy = payload;
		if (typeof legacy?.url === "string" && legacy.url.length > 0) return { url: legacy.url };
		throw new ServiceUnavailableError("TikTok OAuth did not return a URL");
	}
	async startLinkedInOauth(redirect, clientId) {
		if (redirect && !isValidRedirectUrl(redirect)) throw new ValidationError("Invalid redirect URL");
		await this.ensureFreshSession();
		const params = new URLSearchParams();
		if (redirect) params.set("redirect", redirect);
		if (clientId) params.set("clientId", clientId);
		const search = params.toString() ? `?${params.toString()}` : "";
		const fetchLinkedInOauthUrl = async () => await fetchWithTimeout(`/api/integrations/linkedin/oauth/url${search}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include"
		});
		let response = await fetchLinkedInOauthUrl();
		if (response.status === 401) {
			await this.ensureFreshSession().catch(() => null);
			response = await fetchLinkedInOauthUrl();
		}
		const payload = await parseOauthStartPayload(response, "LinkedIn OAuth start", "Failed to start LinkedIn OAuth");
		if (payload && typeof payload === "object" && "success" in payload) {
			const record = payload;
			if (!record.success) {
				const message = typeof record.error === "string" ? record.error : "Failed to start LinkedIn OAuth";
				if (response.status === 401) throw new SessionExpiredError(message);
				throw new BadRequestError(message);
			}
			const data = record.data;
			if (typeof data?.url === "string" && data.url.length > 0) return { url: data.url };
			throw new ServiceUnavailableError("LinkedIn OAuth did not return a URL");
		}
		if (!response.ok) {
			const record = payload;
			const message = typeof record?.error === "string" ? record.error : "Failed to start LinkedIn OAuth";
			if (response.status === 401) throw new SessionExpiredError(message);
			throw new BadRequestError(message);
		}
		const legacy = payload;
		if (typeof legacy?.url === "string" && legacy.url.length > 0) return { url: legacy.url };
		throw new ServiceUnavailableError("LinkedIn OAuth did not return a URL");
	}
	async resetPassword() {
		throw new ServiceUnavailableError("Password reset must be implemented with Better Auth");
	}
	async verifyPasswordResetCode() {
		throw new ServiceUnavailableError("Password reset must be implemented with Better Auth");
	}
	async confirmPasswordReset() {
		throw new ServiceUnavailableError("Password reset must be implemented with Better Auth");
	}
	async updateProfile(data) {
		if (!this.currentUser) throw new UnauthorizedError("No authenticated user");
		return {
			...this.currentUser,
			...data,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	}
	async changePassword() {
		throw new ServiceUnavailableError("Password change must be implemented with Better Auth");
	}
	async deleteAccount() {
		throw new ServiceUnavailableError("Account deletion must be implemented with Better Auth");
	}
	async disconnectProvider() {
		throw new ServiceUnavailableError("Provider disconnect must be implemented with Better Auth");
	}
}.getInstance();
//#endregion
//#region src/lib/jwt-utils.ts
/** Decode JWT `sub` without verifying signature (token already obtained from trusted auth route). */
function decodeJwtSubject(token) {
	const payloadPart = token.split(".")[1];
	if (!payloadPart) return null;
	try {
		const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
		const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
		return typeof payload.sub === "string" && payload.sub.length > 0 ? payload.sub : null;
	} catch {
		return null;
	}
}
//#endregion
//#region src/lib/auth-phase.ts
function isLoadingPhase(phase) {
	return phase === "initializing" || phase === "syncing" || phase === "profile_loading";
}
function deriveAuthPhase(input) {
	if (input.sessionPending && !input.hasSession) return "initializing";
	if (!input.hasSession) return "unauthenticated";
	if (input.syncState === "failed") return "sync_failed";
	if (input.syncState === "idle" || input.syncState === "running") return "syncing";
	if (!input.user) return "syncing";
	if (!input.isAuthenticated || input.convexAuthLoading) return "syncing";
	if (input.syncState === "success") {
		if (input.user.status === "active") return "ready_active";
		return "ready_pending";
	}
	if (input.profilePending) return "profile_loading";
	if (input.user.status === "active") return "ready_active";
	return "ready_pending";
}
function mergeConvexProfile(baseUser, convexUser) {
	if (!convexUser) return baseUser;
	return {
		...baseUser,
		id: convexUser.legacyId,
		role: convexUser.role || baseUser.role,
		status: convexUser.status || baseUser.status,
		agencyId: convexUser.agencyId || baseUser.agencyId || convexUser.legacyId
	};
}
//#endregion
//#region src/shared/hooks/use-auth-sync.ts
function createAuthError(code, message, details, retryable = false) {
	return {
		code,
		message,
		details,
		retryable
	};
}
var StaleSyncError = class extends Error {
	constructor() {
		super("Auth sync superseded by a newer run");
		this.name = "StaleSyncError";
	}
};
var SYNC_TIMEOUT_MS = 8e3;
var TOKEN_RETRY_DELAYS_MS = [
	0,
	400,
	900,
	1800
];
function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
function extractConvexToken(result) {
	if (typeof result === "string") {
		const trimmed = result.trim();
		return trimmed.length > 0 ? trimmed : null;
	}
	if (typeof result !== "object" || result === null) return null;
	if ("token" in result) {
		const direct = result.token;
		if (typeof direct === "string" && direct.trim().length > 0) return direct.trim();
	}
	if ("data" in result) return extractConvexToken(result.data);
	return null;
}
async function fetchConvexTokenOnce() {
	return extractConvexToken(await authClient.convex.token({ fetchOptions: { throw: false } }).catch(() => null));
}
async function fetchConvexTokenWithRetry(assertActive) {
	const token = await fetchConvexTokenOnce();
	if (token) return token;
	const retryWithDelays = async (delayIndex) => {
		const delay = TOKEN_RETRY_DELAYS_MS[delayIndex];
		if (delay === void 0) return null;
		if (delay > 0) await sleep(delay);
		assertActive();
		const nextToken = await fetchConvexTokenOnce();
		if (nextToken) return nextToken;
		return retryWithDelays(delayIndex + 1);
	};
	return retryWithDelays(0);
}
async function runAuthSyncPipeline(assertActive) {
	assertActive();
	const profile = await Promise.race([bootstrapAndSyncSessionOnce(), sleep(SYNC_TIMEOUT_MS).then(() => {
		throw new Error("Timed out while setting up your workspace. Please retry.");
	})]);
	assertActive();
	let resolvedToken = await fetchConvexTokenWithRetry(assertActive);
	if (!resolvedToken) resolvedToken = await fetchConvexTokenOnce();
	const subject = (resolvedToken ? decodeJwtSubject(resolvedToken) : null) ?? profile.legacyId;
	if (!subject) throw new Error("We could not finish securing your session. Try again or sign in once more.");
	return {
		subject,
		profile
	};
}
function applyBootstrapProfile(baseUser, profile) {
	if (!profile) return baseUser;
	return {
		...baseUser,
		role: profile.role,
		status: profile.status,
		agencyId: profile.agencyId
	};
}
function useAuthSync() {
	const [syncGeneration, setSyncGeneration] = (0, import_react.useState)(0);
	const syncGenerationRef = (0, import_react.useRef)(syncGeneration);
	(0, import_react.useEffect)(() => {
		syncGenerationRef.current = syncGeneration;
	}, [syncGeneration]);
	const [sessionSync, setSessionSync] = (0, import_react.useState)({
		syncState: "idle",
		authError: null,
		sessionUser: null,
		convexLegacyId: null,
		bootstrapProfile: null
	});
	const { syncState, authError, sessionUser, convexLegacyId, bootstrapProfile } = sessionSync;
	const { data: betterAuthSession, isPending: sessionPending } = authClient.useSession();
	const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
	const profileLegacyId = convexLegacyId ?? sessionUser?.id ?? null;
	const convexUser = useQuery(api.users.getByLegacyIdSafe, profileLegacyId && isAuthenticated ? { legacyId: profileLegacyId } : "skip");
	const profilePending = false;
	const profileMissing = Boolean(profileLegacyId) && isAuthenticated && !convexAuthLoading && convexUser === null && syncState === "success" && !bootstrapProfile;
	const user = (() => {
		if (!sessionUser) return null;
		let merged = applyBootstrapProfile(sessionUser, bootstrapProfile);
		if (convexUser) merged = mergeConvexProfile(merged, convexUser);
		if (convexLegacyId && merged.id !== convexLegacyId) merged = {
			...merged,
			id: convexLegacyId
		};
		return merged;
	})();
	const hasSession = Boolean(betterAuthSession?.user ?? sessionUser);
	const awaitingSession = sessionPending && !betterAuthSession?.user && !sessionUser;
	if (profileMissing && syncState === "success") setSessionSync((prev) => ({
		...prev,
		syncState: "failed",
		authError: createAuthError("SESSION_SYNC_FAILED", "Workspace profile not found. Your sign-in succeeded but the profile could not be loaded.", void 0, true)
	}));
	const mappedBetterAuthUser = (() => {
		const rawUser = betterAuthSession?.user;
		if (!rawUser) return null;
		return authService.mapBetterAuthUser(rawUser);
	})();
	if (mappedBetterAuthUser) {
		if (sessionUser?.id !== mappedBetterAuthUser.id) setSessionSync((prev) => ({
			...prev,
			sessionUser: mappedBetterAuthUser
		}));
	} else if (!awaitingSession && (sessionUser !== null || syncState !== "idle" || authError !== null || convexLegacyId !== null || bootstrapProfile !== null)) setSessionSync({
		syncState: "idle",
		authError: null,
		sessionUser: null,
		convexLegacyId: null,
		bootstrapProfile: null
	});
	const initialAuthHydratedRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (!hasSession || initialAuthHydratedRef.current) return;
		initialAuthHydratedRef.current = true;
		authService.waitForInitialAuth().then(() => {
			const cachedUser = authService.getCurrentUser();
			if (cachedUser) setSessionSync((prev) => ({
				...prev,
				sessionUser: prev.sessionUser ?? cachedUser
			}));
		});
	}, [hasSession]);
	const runSessionSync = (0, import_react.useEffectEvent)(async (runId) => {
		setSessionSync((prev) => ({
			...prev,
			syncState: "running",
			authError: null
		}));
		const assertActive = () => {
			if (syncGenerationRef.current !== runId) throw new StaleSyncError();
		};
		try {
			if (syncGenerationRef.current !== runId) return;
			const resultPromise = runAuthSyncPipeline(assertActive);
			if (syncGenerationRef.current !== runId) return;
			const result = await resultPromise;
			if (syncGenerationRef.current === runId) setSessionSync((prev) => ({
				...prev,
				convexLegacyId: result.subject,
				bootstrapProfile: result.profile,
				syncState: "success"
			}));
		} catch (error) {
			if (error instanceof StaleSyncError) return;
			if (syncGenerationRef.current !== runId) return;
			const message = error instanceof Error ? error.message : "Failed to sync your session";
			setSessionSync((prev) => ({
				...prev,
				syncState: "failed",
				authError: createAuthError("SESSION_SYNC_FAILED", message, void 0, true)
			}));
		}
	});
	(0, import_react.useEffect)(() => {
		if (awaitingSession || !hasSession) return;
		if (syncState === "failed") return;
		if (syncState === "running") return;
		if (syncState === "success" && bootstrapProfile && convexLegacyId) return;
		runSessionSync(syncGeneration);
	}, [
		awaitingSession,
		bootstrapProfile,
		convexLegacyId,
		hasSession,
		syncGeneration,
		syncState
	]);
	const phase = deriveAuthPhase({
		sessionPending: awaitingSession,
		hasSession,
		syncState,
		convexAuthLoading,
		isAuthenticated,
		profilePending,
		user
	});
	const retrySync = async () => {
		setSessionSync((prev) => ({
			...prev,
			authError: null,
			syncState: "idle"
		}));
		setSyncGeneration((value) => value + 1);
	};
	const clearAuthError = () => {
		setSessionSync((prev) => ({
			...prev,
			authError: null
		}));
	};
	const resetSession = () => {
		resetBootstrapSessionCache();
		setSessionSync({
			syncState: "idle",
			authError: null,
			sessionUser: null,
			convexLegacyId: null,
			bootstrapProfile: null
		});
	};
	const applySessionUser = (nextUser) => {
		if (nextUser) {
			if (nextUser.agencyId && nextUser.role && nextUser.status) {
				setSessionSync({
					syncState: "success",
					authError: null,
					sessionUser: nextUser,
					convexLegacyId: nextUser.id,
					bootstrapProfile: {
						legacyId: nextUser.id,
						role: nextUser.role,
						status: nextUser.status,
						agencyId: nextUser.agencyId
					}
				});
				return;
			}
			setSessionSync((prev) => ({
				...prev,
				sessionUser: nextUser
			}));
			setSyncGeneration((value) => value + 1);
		} else resetSession();
	};
	return {
		phase,
		user,
		authError,
		clearAuthError,
		retrySync,
		resetSession,
		applySessionUser,
		loading: isLoadingPhase(phase),
		isSyncing: syncState === "running"
	};
}
//#endregion
//#region src/shared/contexts/auth-context.tsx
var import_jsx_runtime = require_jsx_runtime();
var AuthContext = (0, import_react.createContext)(void 0);
function useAuth() {
	const context = (0, import_react.use)(AuthContext);
	if (context === void 0) throw new Error("useAuth must be used within an AuthProvider");
	return context;
}
function AuthProvider({ children }) {
	const { phase: authPhase, user, authError, clearAuthError, retrySync, resetSession, applySessionUser, loading, isSyncing } = useAuthSync();
	const signIn = (email, password) => {
		return authService.signIn(email, password).then((authUser) => {
			applySessionUser(authUser);
			return authUser;
		});
	};
	const signUp = (data) => {
		return authService.signUp(data).then((authUser) => {
			applySessionUser(authUser);
			return authUser;
		});
	};
	const signInWithGoogle = (callbackURL) => {
		return authService.signInWithGoogle(callbackURL);
	};
	const signOut = () => {
		return authService.signOut().then(() => {
			resetSession();
		}).catch((error) => {
			resetSession();
			throw error;
		});
	};
	const resetPassword = async (email) => {
		await authService.resetPassword();
	};
	const verifyPasswordResetCode = async (oobCode) => {
		return await authService.verifyPasswordResetCode();
	};
	const confirmPasswordReset = async (oobCode, newPassword) => {
		await authService.confirmPasswordReset();
	};
	const updateProfile = async (data) => {
		const authUser = await authService.updateProfile(data);
		applySessionUser(authUser);
		return authUser;
	};
	const changePassword = async (currentPassword, newPassword) => {
		await authService.changePassword();
	};
	const deleteAccount = () => {
		return authService.deleteAccount().then(() => {
			resetSession();
		});
	};
	const connectGoogleAdsAccount = async () => {
		await authService.connectGoogleAdsAccount();
	};
	const connectGoogleAnalyticsAccount = async () => {
		await authService.connectGoogleAnalyticsAccount();
	};
	const connectFacebookAdsAccount = async () => {
		await authService.connectFacebookAdsAccount();
	};
	const connectLinkedInAdsAccount = async () => {
		await authService.connectLinkedInAdsAccount();
	};
	const startGoogleOauth = async (redirect, clientId) => {
		return await authService.startGoogleOauth(redirect, clientId);
	};
	const startGoogleWorkspaceOauth = async (redirect) => {
		return await authService.startGoogleWorkspaceOauth(redirect);
	};
	const startMetaOauth = async (redirect, clientId, surface, entryPoint) => {
		return await authService.startMetaOauth(redirect, clientId, surface, entryPoint);
	};
	const startTikTokOauth = async (redirect, clientId) => {
		return await authService.startTikTokOauth(redirect, clientId);
	};
	const startLinkedInOauth = async (redirect, clientId) => {
		return await authService.startLinkedInOauth(redirect, clientId);
	};
	const disconnectProvider = async (providerId, clientId) => {
		await authService.disconnectProvider();
	};
	const getIdToken = async () => {
		if (typeof window === "undefined") return null;
		const result = await authClient.convex.token().catch(() => null);
		if (!result) return null;
		let payload = result;
		if (typeof result === "object" && result !== null && "data" in result) payload = result.data;
		if (typeof payload !== "object" || payload === null || !("token" in payload)) return null;
		const token = payload.token;
		return typeof token === "string" && token.trim().length > 0 ? token.trim() : null;
	};
	const value = {
		user,
		authPhase,
		loading,
		isSyncing,
		authError,
		clearAuthError,
		retrySync,
		signIn,
		signInWithGoogle,
		connectGoogleAdsAccount,
		connectGoogleAnalyticsAccount,
		connectFacebookAdsAccount,
		connectLinkedInAdsAccount,
		startGoogleOauth,
		startGoogleWorkspaceOauth,
		startMetaOauth,
		startTikTokOauth,
		startLinkedInOauth,
		disconnectProvider,
		getIdToken,
		signUp,
		signOut,
		resetPassword,
		verifyPasswordResetCode,
		confirmPasswordReset,
		updateProfile,
		changePassword,
		deleteAccount
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
//#endregion
//#region src/shared/contexts/client-context-types.ts
var STORAGE_KEY_SELECTED = "cohorts.dashboard.selectedClient";
function isConvexClientRow(value) {
	return typeof value === "object" && value !== null && typeof value.legacyId === "string" && typeof value.name === "string";
}
function mapClients(rows) {
	const list = rows.flatMap((row) => isConvexClientRow(row) ? [{
		id: row.legacyId,
		workspaceId: typeof row.workspaceId === "string" ? row.workspaceId : null,
		name: row.name,
		accountManager: typeof row.accountManager === "string" ? row.accountManager : "",
		teamMembers: Array.isArray(row.teamMembers) ? row.teamMembers : [],
		createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
		updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null
	}] : []);
	list.sort((a, b) => a.name.localeCompare(b.name));
	return list;
}
function extractRows(convexClients) {
	if (Array.isArray(convexClients)) return convexClients;
	if (convexClients && typeof convexClients === "object" && "items" in convexClients && Array.isArray(convexClients.items)) return convexClients.items;
	return [];
}
function resolveSelectedClientId(clients, currentSelection, storedSelection) {
	if (currentSelection && clients.some((client) => client.id === currentSelection)) return currentSelection;
	if (storedSelection && clients.some((client) => client.id === storedSelection)) return storedSelection;
	return clients[0]?.id ?? null;
}
function getInitialPreviewClientId() {
	return isPreviewModeEnabled() ? getPreviewClients()[0]?.id ?? null : null;
}
function createInitialClientProviderState() {
	return {
		selectedClientId: getInitialPreviewClientId(),
		loading: false,
		error: null
	};
}
function clientProviderReducer(state, action) {
	switch (action.type) {
		case "syncState": return {
			selectedClientId: action.selectedClientId,
			loading: action.loading,
			error: action.error
		};
		case "setSelectedClientId": return {
			...state,
			selectedClientId: action.selectedClientId
		};
		case "setError": return {
			...state,
			error: action.error
		};
		default: return state;
	}
}
//#endregion
//#region src/shared/contexts/use-client-provider.ts
function useClientProvider() {
	const { user, loading: authLoading, isSyncing, authPhase } = useAuth();
	const [{ selectedClientId, loading, error }, dispatch] = (0, import_react.useReducer)(clientProviderReducer, void 0, createInitialClientProviderState);
	const hasInitializedRef = (0, import_react.useRef)(false);
	const previewEnabled = (0, import_react.useSyncExternalStore)((onStoreChange) => {
		if (typeof window === "undefined") return () => void 0;
		const handlePreviewChange = () => {
			onStoreChange();
		};
		window.addEventListener("storage", handlePreviewChange);
		window.addEventListener(PREVIEW_MODE_EVENT, handlePreviewChange);
		return () => {
			window.removeEventListener("storage", handlePreviewChange);
			window.removeEventListener(PREVIEW_MODE_EVENT, handlePreviewChange);
		};
	}, () => isPreviewModeEnabled(), () => false);
	const selectionBeforePreviewRef = (0, import_react.useRef)(null);
	const previousPreviewEnabledRef = (0, import_react.useRef)(previewEnabled);
	const workspaceId = getWorkspaceId(user);
	const canQuery = authPhase === "ready_active" && !authLoading && !isSyncing && !!workspaceId;
	const isAdmin = user?.role === "admin";
	const convexClientsArgs = previewEnabled || !canQuery || !user?.agencyId ? "skip" : {
		workspaceId,
		limit: 100,
		includeAllWorkspaces: isAdmin
	};
	const convexClients = useQuery(clientsApi.list, convexClientsArgs);
	const convexCreateClient = useMutation(clientsApi.create);
	const convexSoftDeleteClient = useMutation(clientsApi.softDelete);
	const storageKey = workspaceId ? `${STORAGE_KEY_SELECTED}:${workspaceId}` : STORAGE_KEY_SELECTED;
	const selectedClientIdRef = (0, import_react.useRef)(selectedClientId);
	(0, import_react.useEffect)(() => {
		selectedClientIdRef.current = selectedClientId;
	}, [selectedClientId]);
	(0, import_react.useEffect)(() => {
		if (previousPreviewEnabledRef.current === previewEnabled) return;
		previousPreviewEnabledRef.current = previewEnabled;
		if (previewEnabled) {
			selectionBeforePreviewRef.current = selectedClientIdRef.current;
			dispatch({
				type: "syncState",
				selectedClientId: getPreviewClients()[0]?.id ?? null,
				loading: false,
				error: null
			});
		} else if (selectionBeforePreviewRef.current !== null) {
			dispatch({
				type: "setSelectedClientId",
				selectedClientId: selectionBeforePreviewRef.current
			});
			selectionBeforePreviewRef.current = null;
		}
	}, [previewEnabled]);
	const applyClientSelectionSync = (0, import_react.useEffectEvent)(() => {
		if (previewEnabled) {
			dispatch({
				type: "syncState",
				selectedClientId: selectedClientIdRef.current,
				loading: false,
				error: null
			});
			return;
		}
		if (authLoading || isSyncing) return;
		if (!workspaceId) {
			dispatch({
				type: "syncState",
				selectedClientId: null,
				loading: false,
				error: null
			});
			return;
		}
		if (convexClients === void 0) {
			dispatch({
				type: "syncState",
				selectedClientId: selectedClientIdRef.current,
				loading: true,
				error: null
			});
			return;
		}
		const rows = extractRows(convexClients);
		if (rows.length === 0) {
			dispatch({
				type: "syncState",
				selectedClientId: null,
				loading: false,
				error: "No clients found for this workspace"
			});
			return;
		}
		const clients = mapClients(rows);
		const currentSelection = selectedClientIdRef.current;
		const targetId = resolveSelectedClientId(clients, currentSelection, typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null);
		hasInitializedRef.current = true;
		dispatch({
			type: "syncState",
			selectedClientId: targetId,
			loading: false,
			error: null
		});
	});
	(0, import_react.useEffect)(() => {
		const frame = requestAnimationFrame(() => {
			applyClientSelectionSync();
		});
		return () => {
			cancelAnimationFrame(frame);
		};
	}, [
		authLoading,
		convexClients,
		isSyncing,
		previewEnabled,
		storageKey,
		workspaceId
	]);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		if (previewEnabled) return;
		if (!workspaceId) return;
		if (selectedClientId) try {
			window.localStorage.setItem(storageKey, selectedClientId);
		} catch (e) {
			console.warn("[ClientProvider] failed to persist client selection", e);
		}
		else if (hasInitializedRef.current) window.localStorage.removeItem(storageKey);
	}, [
		previewEnabled,
		selectedClientId,
		storageKey,
		workspaceId
	]);
	(0, import_react.useEffect)(() => {
		if (!window.location.search.includes("debug=true")) return;
		console.log("[ClientProvider] State:", {
			authLoading,
			isSyncing,
			workspaceId,
			canQuery,
			hasConvexResult: convexClients !== void 0
		});
	}, [
		authLoading,
		isSyncing,
		workspaceId,
		canQuery,
		convexClients
	]);
	const resolvedClients = (() => {
		if (previewEnabled) return getPreviewClients();
		if (!workspaceId || convexClients === void 0) return [];
		return mapClients(extractRows(convexClients));
	})();
	const clientsRef = (0, import_react.useRef)(resolvedClients);
	(0, import_react.useEffect)(() => {
		clientsRef.current = resolvedClients;
	}, [resolvedClients]);
	const refreshClients = async () => {
		return clientsRef.current;
	};
	const retryClients = () => {
		dispatch({
			type: "setError",
			error: null
		});
		requestAnimationFrame(() => {
			applyClientSelectionSync();
		});
	};
	const selectClient = (clientId) => {
		dispatch({
			type: "setSelectedClientId",
			selectedClientId: clientId
		});
	};
	const createClient = async (input) => {
		if (!workspaceId) throw new Error("Workspace is required to create a client");
		const name = input.name.trim();
		const accountManager = input.accountManager.trim();
		if (!name || !accountManager) throw new Error("Client name and account manager are required");
		const teamMembers = input.teamMembers.flatMap((member) => {
			const normalized = {
				name: member.name.trim(),
				role: typeof member.role === "string" ? member.role.trim() : ""
			};
			return normalized.name.length > 0 ? [normalized] : [];
		});
		if (!teamMembers.some((member) => member.name.toLowerCase() === accountManager.toLowerCase())) teamMembers.unshift({
			name: accountManager,
			role: "Account Manager"
		});
		try {
			const created = {
				id: (await convexCreateClient({
					workspaceId,
					name,
					accountManager,
					teamMembers,
					createdBy: user?.id ?? null
				})).legacyId,
				workspaceId,
				name,
				accountManager,
				teamMembers,
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			dispatch({
				type: "setSelectedClientId",
				selectedClientId: created.id
			});
			return created;
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useClientProvider:createClient",
				title: "Could not create client",
				fallbackMessage: "Unable to create the client. Please try again."
			});
			throw err;
		}
	};
	const removeClient = async (clientId) => {
		if (!workspaceId) throw new Error("Workspace is required to remove a client");
		const targetWorkspaceId = clientsRef.current.find((client) => client.id === clientId)?.workspaceId ?? workspaceId;
		const fallbackClientId = resolveSelectedClientId(clientsRef.current.filter((client) => client.id !== clientId), selectedClientIdRef.current, null);
		try {
			await convexSoftDeleteClient({
				workspaceId: targetWorkspaceId,
				legacyId: clientId,
				deletedAtMs: Date.now()
			});
		} catch (error) {
			if (!isNotFoundAppError(error)) throw error;
		}
		dispatch({
			type: "setSelectedClientId",
			selectedClientId: selectedClientIdRef.current === clientId ? fallbackClientId : selectedClientIdRef.current
		});
	};
	(0, import_react.useEffect)(() => {
		if (previewEnabled || loading) return;
		if (!selectedClientId) return;
		if (resolvedClients.some((client) => client.id === selectedClientId)) return;
		dispatch({
			type: "setSelectedClientId",
			selectedClientId: resolveSelectedClientId(resolvedClients, null, null)
		});
	}, [
		loading,
		previewEnabled,
		resolvedClients,
		selectedClientId
	]);
	return {
		workspaceId,
		clients: resolvedClients,
		selectedClientId,
		selectedClient: (() => {
			if (!selectedClientId) return null;
			return resolvedClients.find((client) => client.id === selectedClientId) ?? null;
		})(),
		loading,
		error,
		refreshClients,
		retryClients,
		selectClient,
		createClient,
		removeClient
	};
}
//#endregion
//#region src/shared/contexts/client-context.tsx
var ClientContext = (0, import_react.createContext)(void 0);
function ClientProvider({ children }) {
	const value = useClientProvider();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientContext.Provider, {
		value,
		children
	});
}
function useClientContext() {
	const context = (0, import_react.use)(ClientContext);
	if (!context) throw new Error("useClientContext must be used within a ClientProvider");
	return context;
}
//#endregion
export { createDefaultProposalForm as $, getPreviewAdminUsers as A, getPreviewCampaigns as B, getPreviewMeetings as C, getPreviewAdminHealthData as D, getPreviewAdminFeatures as E, getPreviewSocialConnectionStatus as F, getPreviewDirectAutoReply as G, getPreviewCollaborationMessages as H, getPreviewSocialOverview as I, getPreviewNotifications as J, getPreviewDirectConversations as K, getPreviewAdsIntegrationStatuses as L, getPreviewSettingsNotificationPreferences as M, getPreviewSettingsProfile as N, getPreviewAdminInvitations as O, getPreviewSettingsRegionalPreferences as P, getPreviewTasks as Q, getPreviewAdsMetrics as R, getPreviewMeetingWorkspaceMembers as S, getPreviewAdminDashboardData as T, getPreviewCollaborationParticipants as U, getPreviewCollaborationAutoReply as V, getPreviewCollaborationThreadReplies as W, getPreviewProjects as X, getPreviewProjectMilestones as Y, getPreviewProposals as Z, startGoogleOAuthSignIn as _, isLoadingPhase as a, PREVIEW_MODE_EVENT as at, getPreviewAgentModeResponse as b, ApiError as c, isPreviewModeEnabled as ct, NotFoundError as d, isoDaysAgo as dt, mergeProposalForm as et, RateLimitError as f, setPreviewModeEnabled as ft, calculatePasswordStrength as g, ValidationError as h, useAuth as i, getPreviewMetrics as it, getPreviewSettingsExportData as j, getPreviewAdminProblemReports as k, BadRequestError as l, isScreenRecordingAuthBypassEnabled as lt, UnauthorizedError as m, authClient as mt, useClientContext as n, getPreviewAnalyticsMetrics as nt, decodeJwtSubject as o, PREVIEW_MODE_STORAGE_KEY as ot, ServiceUnavailableError as p, withPreviewModeSearchParamIfEnabled as pt, getPreviewDirectMessages as q, AuthProvider as r, getPreviewClients as rt, getFriendlyAuthErrorMessage as s, PREVIEW_ROUTE_REQUEST_HEADER as st, ClientProvider as t, getPreviewAnalyticsInsights as tt, ForbiddenError as u, isScreenRecordingModeEnabled as ut, ApiClientError as v, getPreviewAdminClients as w, getPreviewGoogleWorkspaceStatus as x, apiFetch as y, getPreviewCampaignInsights as z };
