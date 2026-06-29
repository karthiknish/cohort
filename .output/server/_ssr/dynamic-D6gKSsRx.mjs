import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dynamic-D6gKSsRx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* `dynamic()` — lazy component loader replacing `next/dynamic`.
*
* Mirrors the Next.js API shape used in this codebase:
* `dynamic(loader, { ssr?, loading? })`. Built on React `lazy` + `Suspense`.
*
* Loaders resolve to one of:
*   - a component directly:   `.then((m) => m.CommandMenu)`
*   - a `{ default }` object:  `.then((m) => ({ default: m.AgentMode }))`
* Both are handled.
*
* `ssr: false` renders the fallback on the server and hydrates the real
* component on the client (matches Next.js client-only dynamic behavior).
*
* Like `next/dynamic`, this is intentionally loose about props typing: the
* returned component accepts the props of the loaded component.
*/
function toDefaultComponent(mod) {
	if (typeof mod === "function") return mod;
	if (mod && typeof mod === "object") {
		if ("default" in mod && mod.default) return mod.default;
		const first = Object.values(mod)[0];
		if (first) return first;
	}
	throw new Error("[dynamic] loader did not return a component");
}
/**
* Wrap a `lazy` component so that when `ssr: false` it renders the fallback
* on the server and only mounts the real component after hydration.
*/
function withSsrGuard(Lazy, loading) {
	const Fallback = loading ?? (() => null);
	return function DynamicSsrFalse(props) {
		if (typeof window === "undefined") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: Fallback() });
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: Fallback() }),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lazy, { ...props })
		});
	};
}
function dynamic(loader, options = {}) {
	const { ssr = true, loading } = options;
	const Lazy = (0, import_react.lazy)(async () => ({ default: toDefaultComponent(await loader()) }));
	if (!ssr) return withSsrGuard(Lazy, loading);
	const Fallback = loading ?? (() => null);
	return (function Dynamic(props) {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: Fallback() }),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lazy, { ...props })
		});
	});
}
//#endregion
export { dynamic as t };
