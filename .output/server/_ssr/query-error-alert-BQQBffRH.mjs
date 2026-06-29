import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { cr as CircleAlert } from "../_libs/lucide-react.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./alert-DYeH1Q3p.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/query-error-alert-BQQBffRH.js
var import_jsx_runtime = require_jsx_runtime();
/** Inline banner for Convex query/load failures. */
function QueryErrorAlert({ error, title = "Unable to load data" }) {
	if (!error) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
		variant: "destructive",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: title }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: error })
		]
	});
}
//#endregion
export { QueryErrorAlert as t };
