import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { i as m, n as useReducedMotion, o as LazyMotion, r as domAnimation } from "../_libs/framer-motion.mjs";
import { C as motionEasing, S as motionDurationSeconds } from "./motion.mjs";
//#region src/shared/ui/animate-in-shared.ts
var tagMap = {
	div: m.div,
	section: m.section,
	article: m.article,
	ul: m.ul,
	li: m.li,
	main: m.main,
	form: m.form
};
var defaultFadeInDuration = motionDurationSeconds.normal;
var defaultStaggerInterval = motionDurationSeconds.fast * .5;
var WHILE_IN_VIEW_FADE = { opacity: 1 };
var VIEWPORT_DEFAULT = {
	once: true,
	amount: .2
};
var HIDDEN_VARIANTS_STAGGER = {};
//#endregion
//#region src/shared/ui/fade-in-stagger.tsx
var import_jsx_runtime = require_jsx_runtime();
function FadeInStagger({ children, as, delay = 0, duration = defaultFadeInDuration, stagger = defaultStaggerInterval, ...props }) {
	const prefersReducedMotion = useReducedMotion();
	const Tag = as ? tagMap[as] : m.div;
	const variants = {
		hidden: HIDDEN_VARIANTS_STAGGER,
		visible: { transition: {
			staggerChildren: stagger,
			delayChildren: delay,
			duration
		} }
	};
	if (prefersReducedMotion) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyMotion, {
		features: domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
			initial: false,
			whileInView: WHILE_IN_VIEW_FADE,
			viewport: VIEWPORT_DEFAULT,
			...props,
			children
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyMotion, {
		features: domAnimation,
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
//#endregion
//#region src/shared/ui/fade-in-item.tsx
function FadeInItem({ children, as, y = 18, duration = defaultFadeInDuration, initial, whileInView, viewport, ...props }) {
	const prefersReducedMotion = useReducedMotion();
	const Tag = as ? tagMap[as] : m.div;
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
	if (prefersReducedMotion) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyMotion, {
		features: domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
			initial: false,
			whileInView: WHILE_IN_VIEW_FADE,
			viewport: resolvedViewport,
			...props,
			children
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyMotion, {
		features: domAnimation,
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
//#endregion
//#region src/shared/ui/animate-in.tsx
function FadeIn({ children, as, delay = 0, duration = defaultFadeInDuration, y = 16, ...props }) {
	const prefersReducedMotion = useReducedMotion();
	const Tag = as ? tagMap[as] : m.div;
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
	if (prefersReducedMotion) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyMotion, {
		features: domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
			initial: false,
			whileInView: WHILE_IN_VIEW_FADE,
			viewport: VIEWPORT_DEFAULT,
			...props,
			children
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyMotion, {
		features: domAnimation,
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
