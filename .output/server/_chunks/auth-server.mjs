import { r as __exportAll } from "../_runtime.mjs";
import { d as convexBetterAuthReactStart } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { t as getPublicEnv } from "./public-env.mjs";
//#region src/lib/convex-env.ts
function requireEnv(name, value) {
	if (typeof value === "string" && value.length > 0) return value;
	throw new Error(`[convex-env] Missing required env var: ${name}`);
}
function getConvexUrl() {
	return requireEnv("NEXT_PUBLIC_CONVEX_URL", getPublicEnv("NEXT_PUBLIC_CONVEX_URL") ?? getPublicEnv("CONVEX_URL"));
}
function getConvexSiteUrl() {
	return requireEnv("NEXT_PUBLIC_CONVEX_SITE_URL (or NEXT_PUBLIC_CONVEX_HTTP_URL)", getPublicEnv("NEXT_PUBLIC_CONVEX_SITE_URL") ?? getPublicEnv("NEXT_PUBLIC_CONVEX_HTTP_URL"));
}
function getSiteUrl() {
	const raw = getPublicEnv("NEXT_PUBLIC_SITE_URL") ?? getPublicEnv("NEXT_PUBLIC_APP_URL");
	if (typeof raw === "string" && raw.trim().length > 0) return raw.trim().replace(/\/$/, "");
	throw new Error("[convex-env] NEXT_PUBLIC_SITE_URL (or NEXT_PUBLIC_APP_URL) is required in production");
}
//#endregion
//#region src/lib/auth-server.ts
/**
* Convex Better Auth utilities for the TanStack Start shell.
*
* Uses `convexBetterAuthReactStart` from `@convex-dev/better-auth/react-start`.
* OAuth URL rewriting (so browsers never navigate to *.convex.site) is
* preserved from the legacy Next.js proxy implementation.
*
* Env is resolved lazily so importing this module on the client does not throw
* at bundle evaluation time (only server handlers call into Convex auth).
*/
var auth_server_exports = /* @__PURE__ */ __exportAll({
	getToken: () => getToken,
	proxyAuthToConvex: () => proxyAuthToConvex
});
var authUtilities = null;
function getAuthUtilities() {
	if (!authUtilities) authUtilities = convexBetterAuthReactStart({
		convexUrl: getConvexUrl(),
		convexSiteUrl: getConvexSiteUrl()
	});
	return authUtilities;
}
function getConvexOrigin() {
	return new URL(getConvexSiteUrl()).origin;
}
function rewriteConvexAuthUrls(value) {
	return value.split(getConvexOrigin()).join(getSiteUrl());
}
async function rewriteConvexAuthResponse(response) {
	const headers = new Headers(response.headers);
	const location = headers.get("location");
	if (location) headers.set("location", rewriteConvexAuthUrls(location));
	if (!(headers.get("content-type") ?? "").includes("application/json")) return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
	const body = await response.text();
	return new Response(rewriteConvexAuthUrls(body), {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}
/** Proxy /api/auth/* to Convex with app-origin URL rewriting for OAuth. */
async function proxyAuthToConvex(request) {
	return rewriteConvexAuthResponse(await getAuthUtilities().handler(request));
}
function getToken(...args) {
	return getAuthUtilities().getToken(...args);
}
//#endregion
export { getToken as n, getConvexSiteUrl as r, auth_server_exports as t };
