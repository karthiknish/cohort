import { r as __exportAll } from "../_runtime.mjs";
import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import "./navigation.mjs";
import { t as ViewTransition } from "./view-transition.mjs";
//#region src/shared/ui/page-transition.tsx
var page_transition_exports = /* @__PURE__ */ __exportAll({
	DirectionalPageTransition: () => DirectionalPageTransition,
	RevealTransition: () => RevealTransition,
	RevealTransitionFallback: () => RevealTransitionFallback
});
var import_jsx_runtime = require_jsx_runtime();
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
