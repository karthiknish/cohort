import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc--phiu8Av.mjs";
import { et as isScreenRecordingAuthBypassEnabled } from "./preview-data-CXkRNfsX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-BECPJRa3.js
var loadAdminShell_createServerFn_handler = createServerRpc({
	id: "3042736b0ec3b33ca97edcebe0e7c3aace1488be966ea35bd8ab8526fc93b956",
	name: "loadAdminShell",
	filename: "src/routes/_authed/admin.tsx"
}, (opts) => loadAdminShell.__executeServer(opts));
var loadAdminShell = createServerFn({ method: "GET" }).handler(loadAdminShell_createServerFn_handler, async () => {
	const { getRequestHeader } = await import("./ssr.mjs").then((n) => n.s).then((n) => n.t);
	return { allowPreviewAccess: isScreenRecordingAuthBypassEnabled() || getRequestHeader("x-cohorts-preview-route") === "1" };
});
//#endregion
export { loadAdminShell_createServerFn_handler };
