import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { x as useRouter, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/link-D4Easb0H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* String-href `<Link>` backed by TanStack Router's `useNavigate`.
*
* Accepts the Next.js `href` ergonomics (plain strings, including dynamically
* interpolated paths) so call sites can migrate off `next/link` without a
* per-route type-safe `to`/`params` rewrite. Renders a real anchor for
* accessibility and middle-click/⌘-click support, intercepting only plain
* left-clicks for client-side navigation.
*/
function resolveHref(href) {
	if (typeof href === "string") return href;
	const search = href.search ?? (href.query ? `?${new URLSearchParams(href.query).toString()}` : "");
	return `${href.pathname}${search}${href.hash ?? ""}`;
}
function isModifiedEvent(e) {
	return e.metaKey || e.altKey || e.ctrlKey || e.shiftKey;
}
var Link$1 = (0, import_react.forwardRef)(function Link({ href, children, onClick, onMouseEnter, onPointerDown, replace, target, prefetch = true, scroll: _scroll, passHref: _passHref, legacyBehavior: _legacy, shallow: _shallow, locale: _locale, transitionTypes: _transitionTypes, ...rest }, ref) {
	const navigate = useNavigate();
	const router = useRouter();
	const to = resolveHref(href);
	const warmRoute = () => {
		if (prefetch === false) return;
		router.preloadRoute({ to });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		ref,
		href: to,
		target,
		onMouseEnter: (e) => {
			warmRoute();
			onMouseEnter?.(e);
		},
		onPointerDown: (e) => {
			warmRoute();
			onPointerDown?.(e);
		},
		onClick: (e) => {
			onClick?.(e);
			if (e.defaultPrevented) return;
			if (target === "_blank" || isModifiedEvent(e) || e.button !== 0) return;
			e.preventDefault();
			navigate({
				to,
				replace
			});
		},
		...rest,
		children
	});
});
//#endregion
export { Link$1 as t };
