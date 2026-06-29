import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { r as motion_exports } from "./motion-DtlbbvFg.mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { f as fadeVariants } from "./motion-Cf6ujF0h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/page-skeleton-boundary-ZBP950Us.js
var import_jsx_runtime = require_jsx_runtime();
function ContentRevealBoundary({ ready, className, children }) {
	if ((0, motion_exports.useReducedMotion)()) return ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className,
		children
	}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.AnimatePresence, {
		mode: "wait",
		children: ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
			features: motion_exports.domAnimation,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
				initial: "hidden",
				animate: "visible",
				exit: "exit",
				variants: fadeVariants,
				className: cn(className),
				children
			})
		}, "content-reveal") : null
	});
}
/**
* Shows layout-matched skeleton UI while loading, then reveals page content.
*/
function PageSkeletonBoundary({ loading, loadingContent, children, className }) {
	if (loading) return loadingContent ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentRevealBoundary, {
		ready: true,
		className,
		children
	});
}
//#endregion
export { PageSkeletonBoundary as t };
