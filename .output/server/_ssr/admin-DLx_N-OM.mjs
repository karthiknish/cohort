import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { H as ShieldAlert, Kn as Copy, Yn as CodeXml, mn as House, rt as RefreshCw } from "../_libs/lucide-react.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { n as logRouteError } from "./log-route-error-DOW40EZM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DLx_N-OM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminError({ error, reset }) {
	(0, import_react.useEffect)(() => {
		logRouteError(error, "admin");
	}, [error]);
	const isDev = false;
	const errorDigest = "digest" in error ? String(error.digest) : void 0;
	const componentName = "AdminError";
	const copyErrorDetails = () => {
		const details = [
			`Component: ${componentName}`,
			`Error: ${error.message}`,
			`Digest: ${errorDigest || "N/A"}`,
			error.stack ? `Stack:\n${error.stack}` : ""
		].filter(Boolean).join("\n\n");
		navigator.clipboard.writeText(details);
	};
	const handleRetry = () => {
		if (typeof reset === "function") reset();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center bg-muted/20 p-4 sm:p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "w-full max-w-md border-border/80 shadow-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "space-y-3 text-center sm:text-left",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 sm:mx-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-7 text-destructive" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-xl font-semibold tracking-tight",
						children: "Admin panel error"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-pretty",
						children: "We encountered an unexpected error while loading the admin panel. This has been logged."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-lg border border-muted/40 bg-muted/20 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeXml, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Component: ", componentName] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: copyErrorDetails,
							className: "h-7 px-2",
							title: "Copy error details",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3 mr-1" }), "Copy"]
						})]
					}),
					errorDigest && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-muted/40 bg-muted/20 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Error Reference"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "text-xs font-mono",
								children: errorDigest
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: "Please include this reference if you contact support."
						})]
					}),
					isDev,
					isDev,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: handleRetry,
							className: "w-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 size-4" }), "Try again"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							asChild: true,
							className: "w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
								href: "/dashboard",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "mr-2 size-4" }), "Back to dashboard"]
							})
						})]
					})
				]
			})]
		})
	});
}
var SplitErrorComponent = AdminError;
//#endregion
export { SplitErrorComponent as errorComponent };
