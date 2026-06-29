import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { r as motion_exports } from "./motion-DtlbbvFg.mjs";
import { i as cardHoverVariants, r as buttonPressVariants } from "./motion-Cf6ujF0h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/motion-primitives-HmftJNmb.js
var import_jsx_runtime = require_jsx_runtime();
function MotionPressable({ className, children, ...props }) {
	const prefersReducedMotion = (0, motion_exports.useReducedMotion)();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.button, {
		type: "button",
		initial: prefersReducedMotion ? false : "rest",
		animate: prefersReducedMotion ? void 0 : "rest",
		whileHover: prefersReducedMotion ? void 0 : "rest",
		whileTap: prefersReducedMotion ? void 0 : "tap",
		variants: prefersReducedMotion ? void 0 : buttonPressVariants,
		className,
		...props,
		children
	});
}
function MotionCard({ interactive = false, className, children, ...props }) {
	const prefersReducedMotion = (0, motion_exports.useReducedMotion)();
	const motionEnabled = interactive && !prefersReducedMotion;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
		initial: motionEnabled ? "rest" : false,
		animate: motionEnabled ? "rest" : void 0,
		whileHover: motionEnabled ? "hover" : void 0,
		variants: motionEnabled ? cardHoverVariants : void 0,
		className,
		...props,
		children
	});
}
//#endregion
export { MotionPressable as n, MotionCard as t };
