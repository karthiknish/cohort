import { o as __toESM } from "../_runtime.mjs";
import { x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { d as formatDate } from "./utils-hh4sibN0.mjs";
import { n as DEFAULT_RETRY_CONFIG } from "./unified-error-C0L-fxgu.mjs";
import { i as coerceNumber, o as META_API_BASE, p as metaAdsClient, r as buildTimeRange, t as appendMetaAuthParams } from "./async-insights-B6eys-H6.mjs";
import "./logger-0qFO0GgU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/meta-ads-B-Zv4_78.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/** Parse `pageId` from Marketing API `object_story_id` (`{pageId}_{postId}`). */
function metaPageIdFromObjectStoryId(objectStoryId) {
	if (!objectStoryId || typeof objectStoryId !== "string") return void 0;
	const trimmed = objectStoryId.trim();
	const idx = trimmed.indexOf("_");
	if (idx <= 0 || idx >= trimmed.length - 1) return void 0;
	return trimmed.slice(0, idx);
}
/** Public permalink for a boosted Facebook page post. */
function facebookPostPermalinkFromObjectStoryId(objectStoryId) {
	if (!objectStoryId || typeof objectStoryId !== "string") return void 0;
	const trimmed = objectStoryId.trim();
	const pageId = metaPageIdFromObjectStoryId(trimmed);
	if (!pageId) return void 0;
	const postId = trimmed.slice(trimmed.indexOf("_") + 1);
	if (!postId) return void 0;
	return `https://www.facebook.com/${pageId}/posts/${postId}`;
}
/** Prefer Instagram permalink; else derive Facebook post URL from `object_story_id`. */
function resolveMetaSocialPermalink(options) {
	const ig = options.instagramPermalinkUrl?.trim();
	if (ig) return ig;
	return facebookPostPermalinkFromObjectStoryId(options.objectStoryId);
}
/** Map Meta Insights API rows to normalized metrics (shared by sync GET + async report run). */
function metaInsightRowsToNormalizedMetrics(adAccountId, rows) {
	const metrics = [];
	rows.forEach((row) => {
		const spend = coerceNumber(row?.spend);
		const impressions = coerceNumber(row?.impressions);
		const clicks = coerceNumber(row?.clicks);
		const conversions = (Array.isArray(row?.actions) ? row.actions : []).reduce((acc, action) => {
			if (action?.action_type === "offsite_conversion" || action?.action_type === "purchase") return acc + coerceNumber(action?.value);
			return acc;
		}, 0);
		const revenue = (Array.isArray(row?.action_values) ? row.action_values : []).reduce((acc, action) => {
			if (action?.action_type === "offsite_conversion.purchase" || action?.action_type === "omni_purchase") return acc + coerceNumber(action?.value);
			return acc;
		}, 0);
		const campaignId = typeof row?.campaign_id === "string" && row.campaign_id.length > 0 ? row.campaign_id : void 0;
		const campaignName = typeof row?.campaign_name === "string" && row.campaign_name.length > 0 ? row.campaign_name : void 0;
		const publisherPlatform = typeof row?.publisher_platform === "string" && row.publisher_platform.length > 0 ? row.publisher_platform.toLowerCase() : void 0;
		const currency = typeof row?.account_currency === "string" && row.account_currency.trim().length > 0 ? row.account_currency.trim().toUpperCase() : void 0;
		metrics.push({
			providerId: "facebook",
			accountId: adAccountId,
			currency,
			publisherPlatform,
			date: row?.date_start ?? row?.date_stop ?? formatDate(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
			spend,
			impressions,
			clicks,
			conversions,
			revenue,
			campaignId,
			campaignName,
			rawPayload: row
		});
	});
	return metrics;
}
function readEnvFlag(value) {
	if (!value) return false;
	const v = value.trim().toLowerCase();
	return v === "1" || v === "true" || v === "yes";
}
async function fetchMetaAdsMetricsInternal(options) {
	const { accessToken, adAccountId, timeframeDays, maxPages = 10, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, refreshAccessToken, onRateLimitHit, onTokenRefresh } = options;
	if (!accessToken) throw new Error("Missing Meta access token");
	if (!adAccountId) throw new Error("Missing Meta ad account ID on integration");
	if (options.useAsyncInsights === true || options.useAsyncInsights !== false && readEnvFlag(process.env.META_ADS_USE_ASYNC_INSIGHTS)) {
		const { runMetaAccountInsightsReportToCompletion } = await import("./async-insights-B6eys-H6.mjs").then((n) => n.n).then((n) => n.t);
		const maxWaitRaw = process.env.META_ADS_ASYNC_INSIGHTS_MAX_WAIT_MS;
		const pollRaw = process.env.META_ADS_ASYNC_INSIGHTS_POLL_MS;
		const maxWaitParsed = maxWaitRaw ? Number(maxWaitRaw) : NaN;
		const pollParsed = pollRaw ? Number(pollRaw) : NaN;
		return metaInsightRowsToNormalizedMetrics(adAccountId, await runMetaAccountInsightsReportToCompletion({
			accessToken,
			adAccountId,
			timeframeDays,
			maxPages,
			maxRetries,
			refreshAccessToken,
			onRateLimitHit,
			onTokenRefresh,
			maxWaitMs: Number.isFinite(maxWaitParsed) ? maxWaitParsed : void 0,
			pollIntervalMs: Number.isFinite(pollParsed) ? pollParsed : void 0
		}));
	}
	const timeRange = buildTimeRange(timeframeDays);
	let activeAccessToken = accessToken;
	let tokenRefreshAttempted = false;
	const appSecret = process.env.META_APP_SECRET;
	const fetchPage = async (page, paging) => {
		const params = new URLSearchParams({
			level: "campaign",
			fields: [
				"date_start",
				"date_stop",
				"campaign_id",
				"campaign_name",
				"impressions",
				"clicks",
				"spend",
				"actions",
				"action_values",
				"account_currency"
			].join(","),
			time_range: JSON.stringify(timeRange),
			time_increment: "1",
			breakdowns: "publisher_platform",
			limit: "500"
		});
		await appendMetaAuthParams({
			params,
			accessToken: activeAccessToken,
			appSecret
		});
		if (paging?.after) params.set("after", paging.after);
		const url = `${META_API_BASE}/${adAccountId}/insights?${params.toString()}`;
		const { payload } = await metaAdsClient.executeRequest({
			url,
			operation: `fetchInsights:page${page}`,
			maxRetries,
			onAuthError: async () => {
				if (refreshAccessToken && !tokenRefreshAttempted) {
					tokenRefreshAttempted = true;
					activeAccessToken = await refreshAccessToken();
					onTokenRefresh?.();
					return {
						retry: true,
						newToken: activeAccessToken
					};
				}
				return { retry: false };
			},
			onRateLimitHit
		});
		const pageMetrics = metaInsightRowsToNormalizedMetrics(adAccountId, Array.isArray(payload?.data) ? payload.data : []);
		const nextCursor = payload?.paging?.cursors?.after ?? null;
		const nextLink = payload?.paging?.next ?? null;
		const nextPaging = nextCursor ? {
			after: nextCursor,
			next: nextLink ?? void 0
		} : void 0;
		if (!nextPaging?.after || page + 1 >= maxPages) return pageMetrics;
		const nextPageMetrics = await fetchPage(page + 1, nextPaging);
		return [...pageMetrics, ...nextPageMetrics];
	};
	return fetchPage(0);
}
var fetchMetaAdsMetrics = (0, import_react.cache)(fetchMetaAdsMetricsInternal);
function asRecord(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return value;
}
function toMetaApiDestinationSpec(destinationSpec) {
	if (!destinationSpec || typeof destinationSpec !== "object") return;
	const websiteRecord = asRecord(destinationSpec.website);
	if (!websiteRecord) return;
	const optimizationRecord = asRecord(websiteRecord.optimization);
	const optimization = optimizationRecord ? {
		status: typeof optimizationRecord.status === "string" ? optimizationRecord.status : void 0,
		type: typeof optimizationRecord.type === "string" ? optimizationRecord.type : void 0
	} : void 0;
	return { website: { ...optimization?.status || optimization?.type ? { optimization } : {} } };
}
/** Landing page updates use `linkUrl` on object_story_spec — not `destination_spec.url`. */
function mergeMetaDestinationSpec(destinationSpec, _linkUrl) {
	return toMetaApiDestinationSpec(destinationSpec);
}
/**
* Meta ad CTA types — canonical enum values and human-readable labels.
* Always prefer API `type` over localized `name` (e.g. BOOK_NOW vs "Book Travel").
*/
var META_CTA_LABELS = {
	LEARN_MORE: "Learn More",
	SHOP_NOW: "Shop Now",
	BOOK_NOW: "Book Now",
	BOOK_TRAVEL: "Book Travel",
	SIGN_UP: "Sign Up",
	APPLY_NOW: "Apply Now",
	INSTALL_NOW: "Install Now",
	INSTALL_MOBILE_APP: "Install App",
	USE_APP: "Use App",
	GET_OFFER: "Get Offer",
	DOWNLOAD: "Download",
	WATCH_MORE: "Watch More",
	WATCH_VIDEO: "Watch Video",
	CONTACT_US: "Contact Us",
	SEND_MESSAGE: "Send Message",
	MESSAGE_PAGE: "Send Message",
	LISTEN_NOW: "Listen Now",
	SUBSCRIBE: "Subscribe",
	GET_QUOTE: "Get Quote",
	GET_SHOWTIMES: "Get Showtimes",
	REQUEST_TIME: "Request Time",
	SEE_MENU: "See Menu",
	ORDER_NOW: "Order Now",
	BUY_NOW: "Buy Now",
	DONATE_NOW: "Donate Now",
	GET_DIRECTIONS: "Get Directions",
	CALL_NOW: "Call Now",
	WHATSAPP_MESSAGE: "WhatsApp",
	NO_BUTTON: "No Button"
};
var META_CTA_TYPE_PATTERN = /^[A-Z][A-Z0-9_]*$/;
/** Extract canonical Meta CTA enum from API fields or stored strings. */
function normalizeMetaCallToActionType(raw) {
	if (typeof raw !== "string") return void 0;
	const trimmed = raw.trim();
	if (!trimmed) return void 0;
	const parenMatch = trimmed.match(/\(([A-Z][A-Z0-9_]+)\)\s*$/);
	if (parenMatch?.[1] && META_CTA_LABELS[parenMatch[1]]) return parenMatch[1];
	const upperSnake = trimmed.toUpperCase().replace(/[\s-]+/g, "_");
	if (META_CTA_TYPE_PATTERN.test(upperSnake) && META_CTA_LABELS[upperSnake]) return upperSnake;
	if (META_CTA_TYPE_PATTERN.test(trimmed) && META_CTA_LABELS[trimmed]) return trimmed;
}
function formatMetaCallToActionLabel(raw) {
	const type = normalizeMetaCallToActionType(raw);
	if (type) return META_CTA_LABELS[type] ?? type;
	if (typeof raw === "string" && raw.trim()) return raw.trim();
}
[
	"id",
	"message",
	"full_picture",
	"picture",
	"permalink_url",
	"attachments{media_type,media{image{src},video{source}}}"
].join(",");
/** Meta lookalike_spec.country — ISO 3166-1 alpha-2. */
var META_LOOKALIKE_COUNTRIES = [
	{
		code: "US",
		label: "United States"
	},
	{
		code: "GB",
		label: "United Kingdom"
	},
	{
		code: "CA",
		label: "Canada"
	},
	{
		code: "AU",
		label: "Australia"
	},
	{
		code: "DE",
		label: "Germany"
	},
	{
		code: "FR",
		label: "France"
	},
	{
		code: "IN",
		label: "India"
	},
	{
		code: "BR",
		label: "Brazil"
	},
	{
		code: "MX",
		label: "Mexico"
	},
	{
		code: "JP",
		label: "Japan"
	}
];
/** Preset audience sizes as fraction of country population (Meta `custom_ratio`). */
var META_LOOKALIKE_RATIO_PRESETS = [
	{
		ratio: .01,
		label: "1% (most similar)"
	},
	{
		ratio: .02,
		label: "2%"
	},
	{
		ratio: .05,
		label: "5%"
	},
	{
		ratio: .1,
		label: "10%"
	}
];
var META_FACEBOOK_POSITIONS = [
	{
		id: "feed",
		label: "Feed"
	},
	{
		id: "right_hand_column",
		label: "Right column"
	},
	{
		id: "marketplace",
		label: "Marketplace"
	},
	{
		id: "video_feeds",
		label: "Video feeds"
	},
	{
		id: "story",
		label: "Stories"
	},
	{
		id: "search",
		label: "Search"
	},
	{
		id: "instream_video",
		label: "In-stream video"
	}
];
var META_INSTAGRAM_POSITIONS = [
	{
		id: "stream",
		label: "Feed"
	},
	{
		id: "story",
		label: "Stories"
	},
	{
		id: "explore",
		label: "Explore"
	},
	{
		id: "reels",
		label: "Reels"
	},
	{
		id: "profile_feed",
		label: "Profile feed"
	}
];
var META_AUDIENCE_NETWORK_POSITIONS = [
	{
		id: "classic",
		label: "Native / banner"
	},
	{
		id: "rewarded_video",
		label: "Rewarded video"
	},
	{
		id: "instream_video",
		label: "In-stream video"
	}
];
var META_MESSENGER_POSITIONS = [
	{
		id: "messenger_home",
		label: "Inbox"
	},
	{
		id: "story",
		label: "Stories"
	},
	{
		id: "sponsored_messages",
		label: "Sponsored messages"
	}
];
var META_DEVICE_PLATFORMS = [{
	id: "mobile",
	label: "Mobile"
}, {
	id: "desktop",
	label: "Desktop"
}];
function buildPlacementDetailDraftFromSource(source) {
	return {
		facebookPositions: [...source.metaPlacements.facebook],
		instagramPositions: [...source.metaPlacements.instagram],
		audienceNetworkPositions: [...source.metaPlacements.audienceNetwork],
		messengerPositions: [...source.metaPlacements.messenger],
		devicePlatforms: [...source.devices]
	};
}
function togglePlacementDraftValue(values, id) {
	return values.includes(id) ? values.filter((item) => item !== id) : [...values, id];
}
/** Maps UI draft fields to Meta Graph `targeting` keys (only non-empty arrays). */
function placementDetailToMetaTargetingFields(detail) {
	const fields = {};
	if (detail.facebookPositions.length > 0) fields.facebook_positions = detail.facebookPositions;
	if (detail.instagramPositions.length > 0) fields.instagram_positions = detail.instagramPositions;
	if (detail.audienceNetworkPositions.length > 0) fields.audience_network_positions = detail.audienceNetworkPositions;
	if (detail.messengerPositions.length > 0) fields.messenger_positions = detail.messengerPositions;
	if (detail.devicePlatforms.length > 0) fields.device_platforms = detail.devicePlatforms;
	return fields;
}
function normalizeMetaGeoLocationType(metaType) {
	const normalized = metaType.toLowerCase();
	if (normalized.includes("country")) return "country";
	if (normalized.includes("region") || normalized.includes("state")) return "region";
	if (normalized.includes("zip") || normalized.includes("postal")) return "zip";
	if (normalized.includes("city")) return "city";
	return "country";
}
function parseAgeRange(range) {
	const match = range.match(/(\d+)\s*-\s*(\d+)/);
	if (match) return {
		min: Number(match[1]),
		max: Number(match[2])
	};
	const plus = range.match(/(\d+)\+/);
	if (plus) return {
		min: Number(plus[1]),
		max: 65
	};
	return {};
}
function buildMetaTargetingFromNormalized(source) {
	const geo_locations = {};
	const countries = [];
	const regions = [];
	const cities = [];
	const zips = [];
	for (const loc of source.locations.included) {
		const locType = normalizeMetaGeoLocationType(loc.type);
		if (locType === "country") countries.push(loc.id || loc.name);
		else if (locType === "region") regions.push({
			key: loc.id,
			name: loc.name
		});
		else if (locType === "city") cities.push({
			key: loc.id,
			name: loc.name
		});
		else if (locType === "zip") zips.push({ key: loc.id });
	}
	if (countries.length > 0) geo_locations.countries = countries;
	if (regions.length > 0) geo_locations.regions = regions;
	if (cities.length > 0) geo_locations.cities = cities;
	if (zips.length > 0) geo_locations.zips = zips;
	const excluded_geo_locations = {};
	const excludedCountries = source.locations.excluded.flatMap((loc) => loc.type === "country" ? [loc.id || loc.name] : []);
	if (excludedCountries.length > 0) excluded_geo_locations.countries = excludedCountries;
	const ages = source.demographics.ageRanges.flatMap((range) => {
		const parsed = parseAgeRange(range);
		return parsed.min !== void 0 ? [parsed] : [];
	});
	const ageMin = source.demographics.ageMin ?? (ages.length > 0 ? Math.min(...ages.map((a) => a.min ?? 18)) : void 0);
	const ageMax = source.demographics.ageMax ?? (ages.length > 0 ? Math.max(...ages.map((a) => a.max ?? 65)) : void 0);
	const genderMap = {
		male: 1,
		female: 2,
		all: 0
	};
	const genders = source.demographics.genders.flatMap((g) => {
		const value = genderMap[g.toLowerCase()];
		return typeof value === "number" && value > 0 ? [value] : [];
	});
	const targeting = {
		geo_locations,
		interests: source.interests.map((interest) => ({
			id: interest.id,
			name: interest.name
		}))
	};
	if (Object.keys(excluded_geo_locations).length > 0) targeting.excluded_geo_locations = excluded_geo_locations;
	if (ageMin !== void 0) targeting.age_min = ageMin;
	if (ageMax !== void 0) targeting.age_max = ageMax;
	if (genders.length > 0) targeting.genders = genders;
	const includedAudiences = source.audiences?.included ?? [];
	if (includedAudiences.length > 0) targeting.custom_audiences = includedAudiences.map((audience) => ({
		id: audience.id,
		name: audience.name
	}));
	const excludedAudiences = source.audiences?.excluded ?? [];
	if (excludedAudiences.length > 0) targeting.excluded_custom_audiences = excludedAudiences.map((audience) => ({
		id: audience.id,
		name: audience.name
	}));
	if (source.publisherPlatforms && source.publisherPlatforms.length > 0) targeting.publisher_platforms = source.publisherPlatforms;
	if (source.placementDetail) Object.assign(targeting, placementDetailToMetaTargetingFields(source.placementDetail));
	return targeting;
}
//#endregion
export { togglePlacementDraftValue as _, META_INSTAGRAM_POSITIONS as a, META_MESSENGER_POSITIONS as c, fetchMetaAdsMetrics as d, formatMetaCallToActionLabel as f, resolveMetaSocialPermalink as g, normalizeMetaGeoLocationType as h, META_FACEBOOK_POSITIONS as i, buildMetaTargetingFromNormalized as l, normalizeMetaCallToActionType as m, META_CTA_LABELS as n, META_LOOKALIKE_COUNTRIES as o, mergeMetaDestinationSpec as p, META_DEVICE_PLATFORMS as r, META_LOOKALIKE_RATIO_PRESETS as s, META_AUDIENCE_NETWORK_POSITIONS as t, buildPlacementDetailDraftFromSource as u };
