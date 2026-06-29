import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { t as __exportAll } from "./motion-DtlbbvFg.mjs";
import "./navigation-C1M-rNAu.mjs";
import { t as ViewTransition } from "./view-transition-DFCVhmkH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/page-transition-Ds_W2a1a.js
var import_jsx_runtime = require_jsx_runtime();
var page_transition_exports = /* @__PURE__ */ __exportAll({
	DirectionalPageTransition: () => DirectionalPageTransition,
	RevealTransition: () => RevealTransition,
	RevealTransitionFallback: () => RevealTransitionFallback
});
var DIRECTIONAL_TRANSITIONS = {
	"nav-forward": "nav-forward",
	"nav-back": "nav-back",
	default: "none"
};
function DirectionalPageTransition({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTransition, {
		enter: DIRECTIONAL_TRANSITIONS,
		exit: DIRECTIONAL_TRANSITIONS,
		default: "none",
		children
	});
}
function RevealTransition({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTransition, {
		enter: "slide-up",
		default: "none",
		children
	});
}
function RevealTransitionFallback({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTransition, {
		exit: "slide-down",
		children
	});
}
//#endregion
export { page_transition_exports as i, RevealTransition as n, RevealTransitionFallback as r, DirectionalPageTransition as t };
