//#region src/domain/ads/provider.ts
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
//#endregion
export { normalizeAdsProviderId as n, isCanonicalAdsProvider as t };
