import { d as convexBetterAuthReactStart } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { t as __exportAll } from "./motion-DtlbbvFg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-server-DbIghuG9.js
/**
* Read public env vars from Vite (`import.meta.env`) with `process.env` fallback.
* Vite inlines `NEXT_PUBLIC_*` at build time when `envPrefix` / `define` are set.
*/
function getPublicEnv(name) {
	try {
		const fromMeta = {
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"NEXT_PUBLIC_APP_URL": "http://localhost:3000",
			"NEXT_PUBLIC_CONVEX_HTTP_URL": "https://grand-sparrow-698.convex.site",
			"NEXT_PUBLIC_CONVEX_SITE_URL": "https://grand-sparrow-698.convex.site",
			"NEXT_PUBLIC_CONVEX_URL": "https://grand-sparrow-698.convex.cloud",
			"NEXT_PUBLIC_ENABLE_AGENTATION": "true",
			"NEXT_PUBLIC_FIREBASE_API_KEY": "AIzaSyCpdMvfzWwbaBTp5KQZpCOTDhzqwd9yR4I",
			"NEXT_PUBLIC_FIREBASE_APP_ID": "1:535339091424:web:b32839c43550f3df05d785",
			"NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "cohorts-6daa6.firebaseapp.com",
			"NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID": "G-H27KC420Q1",
			"NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "535339091424",
			"NEXT_PUBLIC_FIREBASE_PROJECT_ID": "cohorts-6daa6",
			"NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": "cohorts-6daa6.firebasestorage.app",
			"NEXT_PUBLIC_POSTHOG_HOST": "/ingest",
			"NEXT_PUBLIC_POSTHOG_KEY": "phc_Bfc54JpHYkzbyCpvNzxFIwawD6qLgrKsaCrqZD2MDTz",
			"NEXT_PUBLIC_R2_PUBLIC_BASE_URL": "https://pub-73e8454411cb40959b0a58764c49c894.r2.dev",
			"NEXT_PUBLIC_SCREEN_RECORDING_ENABLED": "true",
			"NEXT_PUBLIC_SITE_URL": "http://localhost:3000",
			"PROD": true,
			"SSR": true,
			"TSS_DEV_SERVER": "false",
			"TSS_DEV_SSR_STYLES_BASEPATH": "/",
			"TSS_DEV_SSR_STYLES_ENABLED": "true",
			"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
			"TSS_INLINE_CSS_ENABLED": "false",
			"TSS_ROUTER_BASEPATH": "",
			"TSS_SERVER_FN_BASE": "/_serverFn/",
			"VITE_USER_NODE_ENV": "development"
		}[name];
		if (typeof fromMeta === "string" && fromMeta.length > 0) return fromMeta;
	} catch {}
	const fromProcess = typeof process !== "undefined" ? process.env[name] : void 0;
	if (typeof fromProcess === "string" && fromProcess.length > 0) return fromProcess;
}
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
export { getPublicEnv as i, getToken as n, getConvexSiteUrl as r, auth_server_exports as t };
