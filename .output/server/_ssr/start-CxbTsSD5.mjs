import { i as createStart, n as createMiddleware } from "./ssr.mjs";
import { $ as isPreviewRouteRequest, a as PREVIEW_ROUTE_REQUEST_HEADER } from "./preview-data-CXkRNfsX.mjs";
import { a as createRateLimitConfig, i as checkConvexRateLimit, r as buildRateLimitHeaders, t as RATE_LIMITS } from "./rate-limiter-convex-Dr72h9nD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/start-CxbTsSD5.js
/**
* Global TanStack Start instance — replaces `proxy.ts` (Next.js middleware).
*
* Responsibilities ported from proxy.ts + next.config.ts:
*  - Security headers on every response (CSP, X-Frame-Options, HSTS, ...)
*  - Blocked monitoring/crawler user-agents on /api/*
*  - PostHog /ingest/* rewrite (was next.config rewrites())
*  - Legacy redirect rules (was next.config redirects())
*  - x-pathname request header for downstream server code
*  - x-cohorts-preview-route header for preview-mode access (proxy.ts parity)
*
* Auth gating + account-status redirects live in the `_authed` layout route's
* `beforeLoad` (src/routes/_authed.tsx) where they have access to the typed
* router context, mirroring the Next.js matcher for protected routes.
*
* Rate limiting (Convex-backed) is wired in `apiRateLimitMiddleware`; see
* the migration guide for the remaining hardening follow-ups.
*/
var BLOCKED_USER_AGENTS = [
	"uptimerobot",
	"pingdom",
	"statuscake",
	"site24x7",
	"uptrends",
	"healthchecks",
	"check-host",
	"monitor-us",
	"googlebot",
	"bingbot",
	"semrush",
	"bot-",
	"crawler",
	"spider",
	"curl",
	"wget",
	"python-requests",
	"axios",
	"node-fetch",
	"httpie",
	"insomnia",
	"postman"
];
var API_RATE_LIMIT_MAX = parseInteger(process.env.API_RATE_LIMIT_MAX, RATE_LIMITS.standard.maxRequests);
var API_RATE_LIMIT_WINDOW_MS = parseInteger(process.env.API_RATE_LIMIT_WINDOW_MS, RATE_LIMITS.standard.windowMs);
function parseInteger(value, fallback) {
	if (typeof value !== "string") return fallback;
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
	return parsed;
}
function getClientIp(request) {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		const first = forwarded.split(",")[0]?.trim();
		if (first) return first;
	}
	const realIp = request.headers.get("x-real-ip");
	if (realIp) return realIp;
	return `anon:${request.headers.get("user-agent") ?? "unknown"}`;
}
var SECURITY_HEADERS = {
	"Content-Security-Policy": [
		"default-src 'self'",
		"base-uri 'self'",
		"frame-ancestors 'none'",
		"object-src 'none'",
		"form-action 'self'",
		[
			"script-src",
			"'self'",
			"'unsafe-inline'",
			...[],
			"https://us.i.posthog.com"
		].join(" "),
		"style-src 'self' 'unsafe-inline' https:",
		"img-src 'self' data: blob: https:",
		"font-src 'self' data: https:",
		"connect-src 'self' https: wss: blob:",
		"media-src 'self' blob: data: https:",
		[
			"frame-src",
			"'self'",
			"https://accounts.google.com",
			"https://*.google.com",
			"https://www.facebook.com",
			"https://*.facebook.com",
			"https://*.linkedin.com",
			"https://*.tiktok.com"
		].join(" "),
		"worker-src 'self' blob:",
		"upgrade-insecure-requests"
	].join("; "),
	"X-Frame-Options": "DENY",
	"X-Content-Type-Options": "nosniff",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy": "camera=(self), microphone=(self), geolocation=(self), fullscreen=(self)"
};
function applySecurityHeaders(response) {
	for (const [key, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(key, value);
	const forwardedProto = response.headers.get("x-forwarded-proto");
	if (response.url?.startsWith("https://") || forwardedProto === "https") response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
	return response;
}
/** TanStack request middleware `next()` returns ctx with `.response`, not a bare Response. */
function resolveMiddlewareResponse(result) {
	if (result instanceof Response) return result;
	return result.response;
}
function finalizeMiddlewareResult(result, pathname, extraHeaders) {
	const response = resolveMiddlewareResponse(result);
	response.headers.set("x-pathname", pathname);
	if (extraHeaders) for (const [key, value] of Object.entries(extraHeaders)) response.headers.set(key, value);
	applySecurityHeaders(response);
	return result;
}
/** Legacy redirect rules ported from next.config.ts `redirects()`. */
function legacyRedirect(pathname) {
	if (pathname === "/dashboard/activity") return "/for-you";
	if (pathname === "/dashboard/for-you") return "/for-you";
	return null;
}
/** PostHog ingest reverse-proxy ported from next.config.ts `rewrites()`. */
async function proxyPostHog(request) {
	const url = new URL(request.url);
	const target = new URL(`https://us.i.posthog.com${url.pathname.replace("/ingest", "")}${url.search}`);
	const headers = new Headers(request.headers);
	headers.set("host", target.host);
	const upstream = await fetch(target, {
		method: request.method,
		headers,
		body: request.method === "GET" || request.method === "HEAD" ? void 0 : request.body,
		duplex: "half"
	});
	return new Response(upstream.body, {
		status: upstream.status,
		statusText: upstream.statusText,
		headers: upstream.headers
	});
}
var securityMiddleware = createMiddleware().server(async ({ next, request }) => {
	const url = new URL(request.url);
	const { pathname } = url;
	if (pathname.startsWith("/ingest/")) return applySecurityHeaders(await proxyPostHog(request));
	const target = legacyRedirect(pathname);
	if (target) return applySecurityHeaders(Response.redirect(new URL(target, url.origin), 307));
	if (isPreviewRouteRequest(pathname, url.searchParams)) return finalizeMiddlewareResult(await next(), pathname, { [PREVIEW_ROUTE_REQUEST_HEADER]: "1" });
	if (pathname.startsWith("/api/")) {
		const userAgent = request.headers.get("user-agent")?.toLowerCase() ?? "";
		if (BLOCKED_USER_AGENTS.some((bot) => userAgent.includes(bot))) return applySecurityHeaders(Response.json({
			success: false,
			error: "Not allowed"
		}, { status: 403 }));
		const rateLimit = await checkConvexRateLimit(`api:${getClientIp(request)}`, createRateLimitConfig(API_RATE_LIMIT_MAX, API_RATE_LIMIT_WINDOW_MS));
		const rateLimitHeaders = buildRateLimitHeaders(rateLimit);
		if (!rateLimit.allowed) return applySecurityHeaders(Response.json({ error: "Too many requests. Please slow down." }, {
			status: 429,
			headers: rateLimitHeaders
		}));
		const finalized = finalizeMiddlewareResult(await next(), pathname);
		if (!(finalized instanceof Response)) rateLimitHeaders.forEach((value, key) => {
			finalized.response.headers.set(key, value);
		});
		return finalized;
	}
	return finalizeMiddlewareResult(await next(), pathname);
});
var startInstance = createStart(() => ({ requestMiddleware: [securityMiddleware] }));
//#endregion
export { startInstance };
