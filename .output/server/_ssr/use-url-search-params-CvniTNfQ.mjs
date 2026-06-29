import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { i as useSearchParams } from "./navigation-C1M-rNAu.mjs";
import { Yt as LoaderCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-url-search-params-CvniTNfQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function UrlSearchParamsFallback() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-8 items-center justify-center",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			className: "size-4 animate-spin text-muted-foreground",
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Loading page state…"
		})]
	});
}
var UrlSearchParamsContext = (0, import_react.createContext)(null);
function UrlSearchParamsReader({ children }) {
	const searchParams = useSearchParams();
	const value = new URLSearchParams(searchParams.toString());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UrlSearchParamsContext.Provider, {
		value,
		children
	});
}
function UrlSearchParamsProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UrlSearchParamsFallback, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UrlSearchParamsReader, { children })
	});
}
function useUrlSearchParamsContext() {
	const value = (0, import_react.use)(UrlSearchParamsContext);
	if (!value) throw new Error("useUrlSearchParamsContext must be used within UrlSearchParamsProvider");
	return value;
}
//#endregion
export { UrlSearchParamsProvider as n, useUrlSearchParamsContext as r, UrlSearchParamsFallback as t };
