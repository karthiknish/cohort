import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { g as createFileRoute, h as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { a as CardHeader, n as CardContent, t as Card } from "./card-CDBnK3ba.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Cbx5Q3_U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-b3y4-9SV.js
var import_jsx_runtime = require_jsx_runtime();
function SettingsPageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-3xl space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-64" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-11 w-full rounded-xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-4 w-72" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [[
						"field-1",
						"field-2",
						"field-3",
						"field-4"
					].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-24" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full rounded-md" })]
					}, slot)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-32 rounded-md" })]
				})]
			})
		]
	});
}
function SettingsLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPageSkeleton, {});
}
var $$splitErrorComponentImporter = () => import("./settings-sLxA-7hw.mjs");
var $$splitComponentImporter = () => import("./settings-DOW6JyDR.mjs");
var loadSettingsShell = createServerFn({ method: "GET" }).handler(createSsrRpc("f134310557835fde2422dc37dc8de5763447ba5fdfed36f76cdd18aadb948c53"));
var Route = createFileRoute("/_authed/settings")({
	validateSearch: (search) => ({ tab: typeof search.tab === "string" ? search.tab : void 0 }),
	loader: () => loadSettingsShell(),
	head: () => ({ meta: [{ title: "Settings | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	pendingComponent: SettingsLoading
});
//#endregion
export { Route as t };
