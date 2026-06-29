import { r as createServerFn } from "./_ssr/ssr.mjs";
import { t as createServerRpc } from "./_ssr/createServerRpc--phiu8Av.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/__root-Bz2BzJOQ.js
var resolveInitialToken_createServerFn_handler = createServerRpc({
	id: "147e084cc4b3274e23b3e2724a7d12bfa1a7de0a4e43ecfe7441e753319cd616",
	name: "resolveInitialToken",
	filename: "src/routes/__root.tsx"
}, (opts) => resolveInitialToken.__executeServer(opts));
var resolveInitialToken = createServerFn({ method: "GET" }).handler(resolveInitialToken_createServerFn_handler, async () => {
	const { getRequestHeader } = await import("./_ssr/ssr.mjs").then((n) => n.s).then((n) => n.t);
	const pathname = getRequestHeader("x-pathname") ?? "";
	if (!(pathname.startsWith("/dashboard") || pathname.startsWith("/for-you") || pathname.startsWith("/admin") || pathname.startsWith("/settings"))) return null;
	const { getToken } = await import("./_ssr/auth-server-DbIghuG9.mjs").then((n) => n.t);
	return await getToken() ?? null;
});
//#endregion
export { resolveInitialToken_createServerFn_handler };
