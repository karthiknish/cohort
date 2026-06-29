import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import "./utils-hh4sibN0.mjs";
import "./badge-SPDtcMeQ.mjs";
import { o as WifiOff } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/network-status-banner-BsNzhz2R.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function subscribeOnlineStatus(onStoreChange) {
	if (typeof window === "undefined") return () => {};
	window.addEventListener("online", onStoreChange);
	window.addEventListener("offline", onStoreChange);
	return () => {
		window.removeEventListener("online", onStoreChange);
		window.removeEventListener("offline", onStoreChange);
	};
}
function getOnlineSnapshot() {
	if (typeof navigator === "undefined") return true;
	return navigator.onLine;
}
function useOnlineStatus() {
	return (0, import_react.useSyncExternalStore)(subscribeOnlineStatus, getOnlineSnapshot, () => true);
}
function NetworkStatusBanner() {
	if (useOnlineStatus()) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-b border-warning/20 bg-warning/10 px-4 py-2 text-warning md:px-6 lg:px-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-7xl items-center gap-2 text-sm font-medium",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "You're offline. Changes will sync when your connection returns." })]
		})
	});
}
//#endregion
export { NetworkStatusBanner as t };
