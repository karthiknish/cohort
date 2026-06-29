import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc--phiu8Av.mjs";
import { et as isScreenRecordingAuthBypassEnabled } from "./preview-data-CXkRNfsX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-D_9e_BIu.js
var loadSettingsShell_createServerFn_handler = createServerRpc({
	id: "f134310557835fde2422dc37dc8de5763447ba5fdfed36f76cdd18aadb948c53",
	name: "loadSettingsShell",
	filename: "src/routes/_authed/settings.tsx"
}, (opts) => loadSettingsShell.__executeServer(opts));
var loadSettingsShell = createServerFn({ method: "GET" }).handler(loadSettingsShell_createServerFn_handler, async () => {
	const { getRequestHeader } = await import("./ssr.mjs").then((n) => n.s).then((n) => n.t);
	return { allowPreviewAccess: isScreenRecordingAuthBypassEnabled() || getRequestHeader("x-cohorts-preview-route") === "1" };
});
//#endregion
export { loadSettingsShell_createServerFn_handler };
