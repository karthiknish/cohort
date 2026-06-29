import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { r as FadeInStagger } from "./animate-in-JYv0iBIt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/page-motion-shell-Ci2leIYf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LazyRevealTransition = (0, import_react.lazy)(() => import("./page-transition-Ds_W2a1a.mjs").then((n) => n.i).then((module) => ({ default: module.RevealTransition })));
/**
* Standard page entrance: optional route reveal + staggered section fade-in.
* Use once at the feature page root.
*/
function PageMotionFadeIn({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInStagger, {
		className: className ?? "flex flex-col gap-6",
		children
	});
}
function PageMotionSuspenseFallback({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionFadeIn, {
		className,
		children
	});
}
function PageMotionRevealShell({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionSuspenseFallback, {
			className,
			children
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyRevealTransition, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionFadeIn, {
			className,
			children
		}) })
	});
}
function PageMotionShell({ children, className, reveal = true }) {
	if (!reveal) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionFadeIn, {
		className,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionRevealShell, {
		className,
		children
	});
}
//#endregion
export { PageMotionShell as t };
