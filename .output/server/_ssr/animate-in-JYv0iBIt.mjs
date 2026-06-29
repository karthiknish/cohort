import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { r as motion_exports } from "./motion-DtlbbvFg.mjs";
import { _ as motionDurationSeconds, v as motionEasing } from "./motion-Cf6ujF0h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/animate-in-JYv0iBIt.js
var import_jsx_runtime = require_jsx_runtime();
var tagMap = {
	div: motion_exports.m.div,
	section: motion_exports.m.section,
	article: motion_exports.m.article,
	ul: motion_exports.m.ul,
	li: motion_exports.m.li,
	main: motion_exports.m.main,
	form: motion_exports.m.form
};
var defaultFadeInDuration = motionDurationSeconds.normal;
var defaultStaggerInterval = motionDurationSeconds.fast * .5;
var WHILE_IN_VIEW_FADE = { opacity: 1 };
var VIEWPORT_DEFAULT = {
	once: true,
	amount: .2
};
var HIDDEN_VARIANTS_STAGGER = {};
function FadeInStagger({ children, as, delay = 0, duration = defaultFadeInDuration, stagger = defaultStaggerInterval, ...props }) {
	const prefersReducedMotion = (0, motion_exports.useReducedMotion)();
	const Tag = as ? tagMap[as] : motion_exports.m.div;
	const variants = {
		hidden: HIDDEN_VARIANTS_STAGGER,
		visible: { transition: {
			staggerChildren: stagger,
			delayChildren: delay,
			duration
		} }
	};
	if (prefersReducedMotion) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
			initial: false,
			whileInView: WHILE_IN_VIEW_FADE,
			viewport: VIEWPORT_DEFAULT,
			...props,
			children
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
			initial: "hidden",
			whileInView: "visible",
			viewport: VIEWPORT_DEFAULT,
			variants,
			...props,
			children
		})
	});
}
function FadeInItem({ children, as, y = 18, duration = defaultFadeInDuration, initial, whileInView, viewport, ...props }) {
	const prefersReducedMotion = (0, motion_exports.useReducedMotion)();
	const Tag = as ? tagMap[as] : motion_exports.m.div;
	const resolvedViewport = viewport ?? VIEWPORT_DEFAULT;
	const variants = {
		hidden: {
			opacity: 0,
			y
		},
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration,
				ease: motionEasing.out
			}
		}
	};
	if (prefersReducedMotion) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
			initial: false,
			whileInView: WHILE_IN_VIEW_FADE,
			viewport: resolvedViewport,
			...props,
			children
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
			initial: initial ?? "hidden",
			whileInView: whileInView ?? "visible",
			viewport: resolvedViewport,
			variants,
			...props,
			children
		})
	});
}
function FadeIn({ children, as, delay = 0, duration = defaultFadeInDuration, y = 16, ...props }) {
	const prefersReducedMotion = (0, motion_exports.useReducedMotion)();
	const Tag = as ? tagMap[as] : motion_exports.m.div;
	const initial = {
		opacity: 0,
		y
	};
	const whileInViewFull = {
		opacity: 1,
		y: 0
	};
	const transition = {
		delay,
		duration,
		ease: motionEasing.out
	};
	if (prefersReducedMotion) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
			initial: false,
			whileInView: WHILE_IN_VIEW_FADE,
			viewport: VIEWPORT_DEFAULT,
			...props,
			children
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
			initial,
			whileInView: whileInViewFull,
			viewport: VIEWPORT_DEFAULT,
			transition,
			...props,
			children
		})
	});
}
//#endregion
export { FadeInItem as n, FadeInStagger as r, FadeIn as t };
