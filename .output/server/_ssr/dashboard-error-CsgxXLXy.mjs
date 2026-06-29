import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as RouteErrorLogger } from "./log-route-error-DOW40EZM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-error-CsgxXLXy.js
var import_jsx_runtime = require_jsx_runtime();
function DashboardError({ error, reset }) {
	const { replace, refresh } = useRouter$1();
	const handleRetry = () => {
		if (typeof reset === "function") {
			reset();
			return;
		}
		replace("/dashboard");
		refresh();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-[60vh] items-center justify-center bg-muted/30 p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteErrorLogger, {
			error,
			segment: "dashboard"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-xl rounded-2xl border border-border/60 bg-background p-6 shadow-sm",
			role: "alert",
			"aria-live": "assertive",
			"aria-atomic": "true",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold text-foreground",
						children: "Dashboard failed to load"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Try rendering the dashboard segment again. If the error persists, return home and reload the page."
					})]
				}),
				null,
				"digest" in error && error.digest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-center text-xs text-muted-foreground",
					children: ["Error reference: ", String(error.digest)]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleRetry,
						className: "inline-flex w-full items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						href: "/dashboard",
						className: "inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted",
						children: "Go to workspace home"
					})]
				})
			]
		})]
	});
}
//#endregion
export { DashboardError as t };
