import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-region-BmnQNfB0.js
var import_jsx_runtime = require_jsx_runtime();
function LiveRegion({ message, id, politeness = "polite", atomic = true, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		id,
		className: cn("sr-only", className),
		role: politeness === "assertive" ? "alert" : "status",
		"aria-live": politeness,
		"aria-atomic": atomic,
		children: message ?? ""
	});
}
//#endregion
export { LiveRegion as t };
