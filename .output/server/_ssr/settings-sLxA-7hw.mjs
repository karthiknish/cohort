import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { b as TriangleAlert, mn as House, rt as RefreshCw } from "../_libs/lucide-react.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as RouteErrorLogger } from "./log-route-error-DOW40EZM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-sLxA-7hw.js
var import_jsx_runtime = require_jsx_runtime();
function SettingsError({ error, reset }) {
	const handleRetry = () => {
		if (typeof reset === "function") reset();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-[60vh] items-center justify-center bg-muted/20 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteErrorLogger, {
			error,
			segment: "settings"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "max-w-lg border-muted/60",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-8 text-destructive" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-xl",
						children: "Settings failed to load"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "We could not render your settings right now. Try again to reload the segment." })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "w-full",
						onClick: handleRetry,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 size-4" }), "Try again"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						asChild: true,
						className: "w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
							href: "/",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "mr-2 size-4" }), "Go to home"]
						})
					}),
					"digest" in error && error.digest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "pt-2 text-center text-xs text-muted-foreground",
						children: ["Error ID: ", String(error.digest)]
					}) : null
				]
			})]
		})]
	});
}
var SplitErrorComponent = SettingsError;
//#endregion
export { SplitErrorComponent as errorComponent };
