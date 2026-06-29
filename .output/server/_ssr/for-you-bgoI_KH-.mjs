import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc--phiu8Av.mjs";
import { et as isScreenRecordingAuthBypassEnabled } from "./preview-data-CXkRNfsX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/for-you-bgoI_KH-.js
var loadForYouShell_createServerFn_handler = createServerRpc({
	id: "cb8400d153858d0c7c505ef2df068d6e4ac480e22d7719b110e057a063552f14",
	name: "loadForYouShell",
	filename: "src/routes/_authed/for-you.tsx"
}, (opts) => loadForYouShell.__executeServer(opts));
var loadForYouShell = createServerFn({ method: "GET" }).handler(loadForYouShell_createServerFn_handler, async () => {
	const { getRequestHeader } = await import("./ssr.mjs").then((n) => n.s).then((n) => n.t);
	return { allowPreviewAccess: isScreenRecordingAuthBypassEnabled() || getRequestHeader("x-cohorts-preview-route") === "1" };
});
//#endregion
export { loadForYouShell_createServerFn_handler };
