import { S as require_jsx_runtime } from "./_libs/@convex-dev/better-auth+[...].mjs";
import { t as Button } from "./_ssr/button-BHcJlp0q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authed-CeL9RPxI.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Pathless layout — auth gate for workspace routes (replaces proxy.ts
* matcher for /dashboard, /for-you, /admin, /settings).
*/
function AuthGateError({ error, reset }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col items-center justify-center gap-4 p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Something went wrong while loading this page."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: reset,
				variant: "outline",
				size: "sm",
				children: "Try again"
			}),
			false
		]
	});
}
//#endregion
export { AuthGateError as errorComponent };
