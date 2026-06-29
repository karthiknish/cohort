import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc--phiu8Av.mjs";
import { et as isScreenRecordingAuthBypassEnabled } from "./preview-data-CXkRNfsX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-BiSwIPLt.js
var loadDashboardShell_createServerFn_handler = createServerRpc({
	id: "09cfe649edd1d2663dcebaf381321e2f79999ef707688eee001553f7a9a600e1",
	name: "loadDashboardShell",
	filename: "src/routes/_authed/dashboard.tsx"
}, (opts) => loadDashboardShell.__executeServer(opts));
var loadDashboardShell = createServerFn({ method: "GET" }).handler(loadDashboardShell_createServerFn_handler, async () => {
	const { getRequestHeader } = await import("./ssr.mjs").then((n) => n.s).then((n) => n.t);
	return { allowPreviewAccess: isScreenRecordingAuthBypassEnabled() || getRequestHeader("x-cohorts-preview-route") === "1" };
});
//#endregion
export { loadDashboardShell_createServerFn_handler };
