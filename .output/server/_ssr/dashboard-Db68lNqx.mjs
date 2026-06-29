import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { g as createFileRoute, h as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as DASHBOARD_THEME } from "./dashboard-theme-DM5oBGdY.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Cbx5Q3_U.mjs";
import { t as DashboardSkeleton } from "./dashboard-skeleton-pDCnFdEC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-Db68lNqx.js
var import_jsx_runtime = require_jsx_runtime();
function DashboardLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: DASHBOARD_THEME.layout.container,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardSkeleton, {})
	});
}
var $$splitComponentImporter = () => import("./dashboard-DiaPKGzF.mjs");
var $$splitErrorComponentImporter = () => import("./dashboard-7VES_xxb.mjs");
var loadDashboardShell = createServerFn({ method: "GET" }).handler(createSsrRpc("09cfe649edd1d2663dcebaf381321e2f79999ef707688eee001553f7a9a600e1"));
var Route = createFileRoute("/_authed/dashboard")({
	loader: () => loadDashboardShell(),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	pendingComponent: DashboardLoading,
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as n, DashboardLoading as t };
