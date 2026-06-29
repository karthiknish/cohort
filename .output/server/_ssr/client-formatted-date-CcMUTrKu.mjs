import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn, v as parseDate } from "./utils-hh4sibN0.mjs";
import { _ as format } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-formatted-date-CcMUTrKu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function subscribeClientMounted(onStoreChange) {
	onStoreChange();
	return () => void 0;
}
function getClientMountedSnapshot() {
	return true;
}
function getServerMountedSnapshot() {
	return false;
}
function formatClientTime(value, formatStr) {
	if (value === null || value === void 0 || value === "") return null;
	const parsed = typeof value === "string" ? parseDate(value) ?? new Date(value) : new Date(value);
	if (Number.isNaN(parsed.getTime())) return null;
	return format(parsed, formatStr);
}
/**
* Formatted time string safe for SSR — empty until after mount.
*/
function useClientFormattedTime(value, formatStr) {
	if (!(0, import_react.useSyncExternalStore)(subscribeClientMounted, getClientMountedSnapshot, getServerMountedSnapshot)) return null;
	return formatClientTime(value, formatStr);
}
function ClientFormattedDate({ value, formatStr, className, fallback = null, dateTime }) {
	const label = useClientFormattedTime(value, formatStr);
	if (!label) return fallback ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(className),
		children: fallback
	}) : null;
	if (dateTime) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
		className: cn(className),
		dateTime,
		suppressHydrationWarning: true,
		children: label
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(className),
		suppressHydrationWarning: true,
		children: label
	});
}
//#endregion
export { ClientFormattedDate as t };
