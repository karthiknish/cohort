import { g as anyApi, h as ConvexHttpClient } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { n as componentsGeneric } from "../_libs/convex.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rate-limiter-convex-Dr72h9nD.js
/**
* Generated `api` utility.
*
* THIS CODE IS AUTOMATICALLY GENERATED.
*
* To regenerate, run `npx convex dev`.
* @module
*/
/**
* A utility for referencing Convex functions in your app's API.
*
* Usage:
* ```js
* const myFunctionReference = api.myModule.myFunction;
* ```
*/
var api = anyApi;
var internal = anyApi;
componentsGeneric();
function createRateLimitConfig(maxRequests, windowMs) {
	return {
		maxRequests,
		windowMs
	};
}
var buckets = /* @__PURE__ */ new Map();
var CLEANUP_INTERVAL_MS = 300 * 1e3;
var BUCKET_EXPIRY_MS = 600 * 1e3;
var cleanupScheduled = false;
function scheduleCleanup() {
	if (cleanupScheduled) return;
	cleanupScheduled = true;
	if (typeof setInterval !== "undefined") setInterval(() => {
		const now = Date.now();
		for (const [key, bucket] of buckets.entries()) if (now - bucket.lastRefill > BUCKET_EXPIRY_MS) buckets.delete(key);
	}, CLEANUP_INTERVAL_MS);
}
/**
* Check if a request should be rate limited (In-Memory)
* @param key - Unique identifier for the rate limit (e.g., IP address, user ID)
* @param config - Rate limit configuration
* @returns Object with allowed status and remaining tokens
*/
function checkRateLimit(key, config) {
	scheduleCleanup();
	const now = Date.now();
	let bucket = buckets.get(key);
	if (!bucket) {
		bucket = {
			tokens: config.maxRequests - 1,
			lastRefill: now
		};
		buckets.set(key, bucket);
		return {
			allowed: true,
			limit: config.maxRequests,
			remaining: bucket.tokens,
			resetMs: config.windowMs,
			resetAt: now + config.windowMs
		};
	}
	const elapsed = now - bucket.lastRefill;
	const refillRate = config.maxRequests / config.windowMs;
	const tokensToAdd = Math.floor(elapsed * refillRate);
	if (tokensToAdd > 0) {
		bucket.tokens = Math.min(config.maxRequests, bucket.tokens + tokensToAdd);
		bucket.lastRefill = now;
	}
	if (bucket.tokens >= 1) {
		bucket.tokens -= 1;
		return {
			allowed: true,
			limit: config.maxRequests,
			remaining: Math.floor(bucket.tokens),
			resetMs: Math.ceil((1 - bucket.tokens % 1) / refillRate) || 0,
			resetAt: now + config.windowMs
		};
	}
	const timeUntilRefill = Math.ceil((1 - bucket.tokens) / refillRate);
	return {
		allowed: false,
		limit: config.maxRequests,
		remaining: 0,
		resetMs: timeUntilRefill,
		resetAt: now + timeUntilRefill
	};
}
/**
* Create a rate limit key from request context
*/
function createRateLimitKey(endpoint, identifier) {
	return `${endpoint}::${identifier || "anonymous"}`;
}
/**
* Get client identifier from request
*/
function getClientIdentifier(request) {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		const [first] = forwarded.split(",");
		if (first && first.trim().length > 0) return first.trim();
	}
	const realIp = request.headers.get("x-real-ip") || request.ip;
	if (realIp && realIp.length > 0) return realIp;
	return `anon:${request.headers.get("user-agent") ?? "unknown"}`;
}
/**
* Build standard rate limit headers
*/
function buildRateLimitHeaders(result) {
	const headers = new Headers();
	headers.set("X-RateLimit-Limit", String(result.limit));
	headers.set("X-RateLimit-Remaining", String(Math.max(0, result.remaining)));
	headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1e3)));
	const retryAfter = Math.max(0, Math.ceil(result.resetMs / 1e3));
	if (!result.allowed) headers.set("Retry-After", String(retryAfter));
	return headers;
}
/**
* Preset rate limit configurations for different operation types
*/
var RATE_LIMITS = {
	/** Standard API operations - generous limits */
	standard: {
		maxRequests: 100,
		windowMs: 6e4
	},
	/** Sensitive operations like login, password reset */
	sensitive: {
		maxRequests: 10,
		windowMs: 6e4
	},
	/** Very sensitive operations like account deletion */
	critical: {
		maxRequests: 3,
		windowMs: 6e4
	},
	/** Bulk operations */
	bulk: {
		maxRequests: 20,
		windowMs: 6e4
	}
};
RATE_LIMITS.standard.maxRequests, RATE_LIMITS.standard.windowMs, RATE_LIMITS.sensitive.maxRequests, RATE_LIMITS.sensitive.windowMs, RATE_LIMITS.critical.maxRequests, RATE_LIMITS.critical.windowMs, RATE_LIMITS.bulk.maxRequests, RATE_LIMITS.bulk.windowMs;
var systemClient = null;
/** Server-side Convex client for internal mutations (rate limits, alerts, etc.). */
function getSystemConvexClient() {
	if (systemClient) return systemClient;
	const url = process.env.CONVEX_URL ?? "https://grand-sparrow-698.convex.cloud";
	const deployKey = process.env.CONVEX_DEPLOY_KEY ?? process.env.CONVEX_DEV_DEPLOY_KEY ?? process.env.CONVEX_PROD_DEPLOY_KEY ?? process.env.CONVEX_ADMIN_KEY ?? process.env.CONVEX_ADMIN_TOKEN;
	if (!url || !deployKey) return null;
	systemClient = new ConvexHttpClient(url);
	systemClient.setAdminAuth?.(deployKey, {
		issuer: "system",
		subject: "server"
	});
	return systemClient;
}
async function checkConvexRateLimit(key, configOrPreset) {
	const config = typeof configOrPreset === "string" ? RATE_LIMITS[configOrPreset] : configOrPreset;
	const client = getSystemConvexClient();
	if (!client) return checkRateLimit(key, config);
	try {
		const name = typeof configOrPreset === "string" ? configOrPreset : `custom:${config.maxRequests}:${config.windowMs}`;
		const result = await client.mutation(internal.rateLimitApi.limit, {
			name,
			key,
			config: typeof configOrPreset === "string" ? void 0 : {
				kind: "fixed window",
				rate: config.maxRequests,
				period: config.windowMs
			}
		});
		if (result.ok) return {
			allowed: true,
			limit: config.maxRequests,
			remaining: 0,
			resetMs: config.windowMs,
			resetAt: Date.now() + config.windowMs
		};
		const retryAfterMs = typeof result.retryAfterMs === "number" ? result.retryAfterMs : config.windowMs;
		return {
			allowed: false,
			limit: config.maxRequests,
			remaining: 0,
			resetMs: retryAfterMs,
			resetAt: Date.now() + retryAfterMs
		};
	} catch (error) {
		console.warn("[rate-limiter] Convex rate limit failed, falling back to in-memory", error);
		return checkRateLimit(key, config);
	}
}
//#endregion
export { createRateLimitConfig as a, getSystemConvexClient as c, checkConvexRateLimit as i, internal as l, api as n, createRateLimitKey as o, buildRateLimitHeaders as r, getClientIdentifier as s, RATE_LIMITS as t };
