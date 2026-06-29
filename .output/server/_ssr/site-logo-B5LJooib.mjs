import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Image } from "./image-Dd8IQpGx.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-logo-B5LJooib.js
var import_jsx_runtime = require_jsx_runtime();
/** Wordmark SVG (~4:1). Use height + w-auto, not square boxes. */
var LOGO_SIZES = {
	wordmark: {
		className: "h-9 w-auto sm:h-11",
		width: 148,
		height: 40
	},
	wordmarkLg: {
		className: "h-11 w-auto sm:h-14",
		width: 188,
		height: 52
	},
	wordmarkXl: {
		className: "h-14 w-auto sm:h-16",
		width: 220,
		height: 64
	}
};
function SiteLogo({ size = "wordmark", className, href }) {
	const { className: sizeClass, width, height } = LOGO_SIZES[size];
	const image = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
		src: "/logo.svg",
		alt: "Cohorts",
		width,
		height,
		className: cn("shrink-0 object-contain object-left", sizeClass, className),
		priority: true
	});
	if (href === void 0 || href === null || href === "") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex shrink-0 items-center",
		children: image
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
		href,
		className: "inline-flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
		"aria-label": "Cohorts home",
		children: image
	});
}
//#endregion
export { SiteLogo as t };
