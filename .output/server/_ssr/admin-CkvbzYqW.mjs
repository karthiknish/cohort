import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { g as createFileRoute, h as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as AdminHomePageSkeleton } from "./admin-home-page-skeleton-CzbydecP.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Cbx5Q3_U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-CkvbzYqW.js
var import_jsx_runtime = require_jsx_runtime();
function AdminLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminHomePageSkeleton, {});
}
var $$splitErrorComponentImporter = () => import("./admin-DLx_N-OM.mjs");
var $$splitComponentImporter = () => import("./admin-cxaKAdgM.mjs");
var loadAdminShell = createServerFn({ method: "GET" }).handler(createSsrRpc("3042736b0ec3b33ca97edcebe0e7c3aace1488be966ea35bd8ab8526fc93b956"));
var Route = createFileRoute("/_authed/admin")({
	loader: () => loadAdminShell(),
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	pendingComponent: AdminLoading
});
//#endregion
export { Route as t };
