import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { g as formatDistanceToNow } from "../_libs/date-fns.mjs";
import { t as cn } from "./utils.mjs";
import "./themes.mjs";
import { n as normalizeAdsProviderId } from "./provider.mjs";
//#region src/lib/public-assets.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var SVGL_PREFIX = "/svgl/";
function isExternalOAuthDocumentHost(hostname) {
	return hostname === "accounts.google.com" || hostname.endsWith(".facebook.com") || hostname.endsWith(".linkedin.com");
}
function getR2PublicBaseUrl() {
	const base = "https://pub-73e8454411cb40959b0a58764c49c894.r2.dev".replace(/\/$/, "");
	return base && base.length > 0 ? base : null;
}
/**
* App origin for static assets under `/public`.
* Relative paths break when `document.baseURI` is an OAuth provider (e.g. accounts.google.com).
*/
function getAppOrigin() {
	const envBase = "http://localhost:3000".replace(/\/$/, "");
	if (typeof window !== "undefined") {
		const { origin, hostname } = window.location;
		if (!isExternalOAuthDocumentHost(hostname)) return origin;
		if (envBase) return envBase;
		return origin;
	}
	return envBase ?? "http://localhost:3000";
}
/** Absolute URL for a file in `/public` (path must start with `/`). */
function getPublicAssetUrl(path) {
	const normalized = path.startsWith("/") ? path : `/${path}`;
	const r2Base = getR2PublicBaseUrl();
	if (r2Base && normalized.startsWith(SVGL_PREFIX)) return `${r2Base}${normalized}`;
	return `${getAppOrigin()}${normalized}`;
}
//#endregion
//#region src/shared/components/svgl-brand-logo.tsx
var import_jsx_runtime = require_jsx_runtime();
var BRAND_TITLES = {
	google: "Google",
	googleads: "Google Ads",
	meta: "Meta",
	facebook: "Facebook",
	instagram: "Instagram",
	linkedin: "LinkedIn",
	tiktok: "TikTok",
	twitter: "Twitter",
	x: "X",
	youtube: "YouTube",
	excel: "Microsoft Excel",
	pdf: "PDF"
};
var BRAND_SRC = {
	google: "/svgl/google.svg",
	googleads: "/svgl/google.svg",
	meta: "/svgl/meta.svg",
	facebook: "/svgl/facebook-icon.svg",
	instagram: "/svgl/instagram-icon.svg",
	linkedin: "/svgl/linkedin.svg",
	twitter: "/svgl/twitter.svg",
	youtube: "/svgl/youtube.svg",
	excel: "/svgl/microsoft-excel.svg",
	pdf: "/svgl/pdf.svg"
};
function BrandImage({ src, className, labeled, title }) {
	const resolvedSrc = getPublicAssetUrl(src);
	const [failed, setFailed] = (0, import_react.useState)(false);
	const handleError = () => {
		setFailed(true);
	};
	if (failed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold uppercase text-muted-foreground", className),
		"aria-hidden": labeled ? void 0 : true,
		role: labeled ? "img" : void 0,
		"aria-label": labeled ? title : void 0,
		title,
		children: title.charAt(0)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: resolvedSrc,
		alt: labeled ? title : "",
		width: 24,
		height: 24,
		loading: "lazy",
		decoding: "async",
		className: cn("inline-block size-6 shrink-0 object-contain", className),
		"aria-hidden": labeled ? void 0 : true,
		role: labeled ? "img" : void 0,
		"aria-label": labeled ? title : void 0,
		onError: handleError
	});
}
function ThemeBrandLogo({ brand, className, labeled, title }) {
	const lightSrc = brand === "tiktok" ? "/svgl/tiktok-light.svg" : "/svgl/x-light.svg";
	const darkSrc = brand === "tiktok" ? "/svgl/tiktok-dark.svg" : "/svgl/x-dark.svg";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandImage, {
		src: lightSrc,
		className: cn(className, "dark:hidden"),
		labeled,
		title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandImage, {
		src: darkSrc,
		className: cn(className, "hidden dark:block"),
		labeled,
		title
	})] });
}
function SvglBrandLogo({ brand, className, labeled = true }) {
	const title = BRAND_TITLES[brand];
	if (brand === "tiktok" || brand === "x") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeBrandLogo, {
		brand,
		className,
		labeled,
		title
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandImage, {
		src: BRAND_SRC[brand],
		className,
		labeled,
		title
	});
}
/** Lucide-compatible icon wrapper for provider maps and panels. */
function createSvglBrandIcon(brand) {
	function BrandIcon({ className }) {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
			brand,
			className,
			labeled: false
		});
	}
	BrandIcon.displayName = `SvglBrandIcon(${brand})`;
	return BrandIcon;
}
var SvglExcelIcon = createSvglBrandIcon("excel");
createSvglBrandIcon("pdf");
//#endregion
//#region src/features/dashboard/ads/constants.ts
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
//#endregion
//#region src/features/dashboard/ads/components/utils.ts
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
//#endregion
export { createSvglBrandIcon as _, getStatusBadgeVariant as a, normalizeTimeframe as c, FREQUENCY_OPTIONS as d, PROVIDER_ICON_MAP as f, SvglExcelIcon as g, SvglBrandLogo as h, formatRelativeTimestamp as i, toAdsProviderId as l, getProviderIcon as m, describeTimeframe as n, getStatusLabel as o, TIMEFRAME_OPTIONS as p, formatDisplayDate as r, normalizeFrequency as s, describeFrequency as t, ADS_WORKFLOW_STEPS as u };
