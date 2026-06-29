import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/svgl-brand-logo-rIFZzPiw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
export { SvglExcelIcon as n, createSvglBrandIcon as r, SvglBrandLogo as t };
