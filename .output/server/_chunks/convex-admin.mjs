import { r as __exportAll } from "../_runtime.mjs";
import { h as ConvexHttpClient } from "../_libs/@convex-dev/better-auth+[...].mjs";
//#region src/lib/convex-admin.ts
var convex_admin_exports = /* @__PURE__ */ __exportAll({ createConvexAdminClient: () => createConvexAdminClient });
function getConvexDeploymentUrl() {
	return "https://grand-sparrow-698.convex.cloud";
}
function getConvexDeployKey() {
	return process.env.CONVEX_DEPLOY_KEY ?? process.env.CONVEX_DEV_DEPLOY_KEY ?? process.env.CONVEX_PROD_DEPLOY_KEY ?? process.env.CONVEX_ADMIN_KEY ?? process.env.CONVEX_ADMIN_TOKEN ?? null;
}
function createConvexAdminClient({ auth }) {
	const url = getConvexDeploymentUrl();
	const deployKey = getConvexDeployKey();
	if (!url || !deployKey) return null;
	const client = new ConvexHttpClient(url);
	const provider = typeof auth.claims?.provider === "string" ? auth.claims.provider : "better-auth";
	const issuer = provider === "better-auth" ? "better-auth" : provider;
	const subject = auth.uid ?? "anonymous";
	client.setAdminAuth(deployKey, {
		issuer,
		subject,
		email: auth.email ?? void 0,
		name: auth.name ?? void 0,
		...auth.claims ? auth.claims : {}
	});
	return client;
}
//#endregion
export { createConvexAdminClient as n, convex_admin_exports as t };
