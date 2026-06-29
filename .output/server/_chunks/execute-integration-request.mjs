import { a as isRetryableStatus, i as isAbortError, l as sleepWithSignal, n as calculateBackoffDelay, o as isTimeoutError, r as composeAbortSignal, s as parseRetryAfterMs, t as DEFAULT_RETRY_CONFIG } from "./retry-utils.mjs";
import { t as UnifiedError } from "./unified-error.mjs";
//#region src/lib/errors/integration-parser.ts
/**
* Integration Error Parser
* Unified error parsing for all ad platform APIs
*/
var META_AUTH_CODES = [
	190,
	102,
	2500
];
var META_RATE_LIMIT_CODES = [
	4,
	17,
	32,
	613
];
var META_RETRYABLE_CODES = [
	1,
	2,
	503
];
var GOOGLE_AUTH_ERRORS = ["AUTHENTICATION_ERROR", "AUTHORIZATION_ERROR"];
var GOOGLE_RATE_LIMIT_ERRORS = ["QUOTA_ERROR", "RATE_LIMIT_ERROR"];
var GOOGLE_RETRYABLE_ERRORS = ["INTERNAL_ERROR", "TRANSIENT_ERROR"];
var LINKEDIN_AUTH_CODES = [401, 403];
var LINKEDIN_RATE_LIMIT_CODES = [429];
var LINKEDIN_RETRYABLE_CODES = [
	500,
	502,
	503,
	504
];
var TIKTOK_AUTH_CODES = [
	40001,
	40002,
	40100
];
var TIKTOK_RATE_LIMIT_CODES = [40029];
var TIKTOK_RETRYABLE_CODES = [5e4, 50001];
function asRecord(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return value;
}
function asString(value) {
	return typeof value === "string" ? value : void 0;
}
function asNumber(value) {
	return typeof value === "number" ? value : void 0;
}
function asCode(value) {
	if (typeof value === "number" || typeof value === "string") return value;
}
function extractMetaPayload(payload) {
	if (payload == null) {
		console.error("[Meta Error Parser] Payload is null/undefined, raw response unavailable");
		return { message: "Meta API request failed - unable to parse error details" };
	}
	if (typeof payload === "string") {
		console.error("[Meta Error Parser] Payload is a string:", payload);
		return { message: payload.slice(0, 200) || "Meta API error" };
	}
	const data = asRecord(payload);
	if (!data) return { message: "Meta API error" };
	const error = asRecord(data.error);
	if (error) return {
		message: asString(error.error_user_msg) || asString(error.error_user_title) || asString(error.message) || "Meta API error",
		code: asCode(error.code),
		subcode: asNumber(error.error_subcode),
		type: asString(error.type),
		traceId: asString(error.fbtrace_id)
	};
	const errorCode = asCode(data.error_code);
	if (errorCode !== void 0) return {
		message: String(asString(data.error_msg) || asString(data.error_message) || "Meta API error"),
		code: errorCode
	};
	const responseCode = asCode(data.code);
	if (responseCode !== void 0 && responseCode !== 200 && responseCode !== "200") return {
		message: String(asString(data.message) || asString(data.error_description) || "Meta API request failed"),
		code: responseCode
	};
	if (data.message && typeof data.message === "string") return { message: data.message };
	const rawPayload = JSON.stringify(data).slice(0, 200);
	console.error("[Meta Error Parser] Unable to parse payload:", rawPayload);
	return { message: `Meta API error (Payload: ${rawPayload})` };
}
function extractGooglePayload(payload) {
	if (payload == null) return { message: "Google API error" };
	const error = payload?.error;
	if (error == null) return { message: "Google API error" };
	const legacy = error.errors?.[0];
	const detailReason = error.details?.find((d) => typeof d.reason === "string")?.reason;
	return {
		message: error.message ?? legacy?.message ?? "Google API error",
		code: detailReason ?? error.status ?? legacy?.reason ?? legacy?.domain
	};
}
function extractLinkedInPayload(payload) {
	if (payload == null) return { message: "LinkedIn API error" };
	const data = payload;
	return {
		message: data.message ?? "LinkedIn API error",
		code: data.code ?? data.status
	};
}
function extractTikTokPayload(payload) {
	if (payload == null) return { message: "TikTok API error" };
	const data = payload;
	return {
		message: data.message ?? "TikTok API error",
		code: data.code,
		traceId: data.request_id
	};
}
function classifyMetaError(code) {
	const numCode = typeof code === "number" ? code : parseInt(String(code), 10);
	const isAuthError = META_AUTH_CODES.includes(numCode);
	const isRateLimitError = META_RATE_LIMIT_CODES.includes(numCode);
	return {
		isAuthError,
		isRateLimitError,
		isRetryable: isRateLimitError || !isAuthError && META_RETRYABLE_CODES.includes(numCode)
	};
}
function classifyGoogleError(code) {
	const strCode = String(code ?? "").toUpperCase();
	const isAuthError = GOOGLE_AUTH_ERRORS.some((c) => strCode.includes(c)) || strCode.includes("ACCESS_TOKEN_SCOPE_INSUFFICIENT") || strCode.includes("PERMISSION_DENIED");
	const isRateLimitError = GOOGLE_RATE_LIMIT_ERRORS.some((c) => strCode.includes(c)) || strCode.includes("RESOURCE_EXHAUSTED") || strCode.includes("RATE_LIMIT");
	return {
		isAuthError,
		isRateLimitError,
		isRetryable: isRateLimitError || GOOGLE_RETRYABLE_ERRORS.some((c) => strCode.includes(c))
	};
}
function classifyLinkedInError(code, httpStatus) {
	const numCode = typeof code === "number" ? code : parseInt(String(code), 10) || httpStatus || 0;
	const isAuthError = LINKEDIN_AUTH_CODES.includes(numCode);
	const isRateLimitError = LINKEDIN_RATE_LIMIT_CODES.includes(numCode);
	return {
		isAuthError,
		isRateLimitError,
		isRetryable: isRateLimitError || LINKEDIN_RETRYABLE_CODES.includes(numCode)
	};
}
function classifyTikTokError(code) {
	const numCode = typeof code === "number" ? code : parseInt(String(code), 10);
	const isAuthError = TIKTOK_AUTH_CODES.includes(numCode);
	const isRateLimitError = TIKTOK_RATE_LIMIT_CODES.includes(numCode);
	return {
		isAuthError,
		isRateLimitError,
		isRetryable: isRateLimitError || TIKTOK_RETRYABLE_CODES.includes(numCode)
	};
}
/**
* Parse an integration API error into a UnifiedError
*/
function parseIntegrationError(response, payload, platform) {
	const httpStatus = response.status;
	if (payload == null) console.error(`[Error Parser] ${platform.toUpperCase()} error response has null payload`, {
		url: response.url,
		status: httpStatus,
		contentType: response.headers.get("content-type")
	});
	let parsed;
	let classification;
	switch (platform) {
		case "meta":
			parsed = extractMetaPayload(payload);
			classification = classifyMetaError(parsed.code);
			break;
		case "google":
			parsed = extractGooglePayload(payload);
			classification = classifyGoogleError(parsed.code);
			break;
		case "linkedin":
			parsed = extractLinkedInPayload(payload);
			classification = classifyLinkedInError(parsed.code, httpStatus);
			break;
		case "tiktok":
			parsed = extractTikTokPayload(payload);
			classification = classifyTikTokError(parsed.code);
			break;
		default:
			parsed = { message: "Unknown integration error" };
			classification = {
				isAuthError: false,
				isRateLimitError: false,
				isRetryable: false
			};
	}
	const retryAfterHeader = response.headers.get("retry-after");
	const retryAfterMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1e3 || void 0 : classification.isRateLimitError ? 6e4 : void 0;
	return new UnifiedError({
		message: parsed.message,
		status: httpStatus,
		code: `${platform.toUpperCase()}_API_ERROR`,
		platform,
		isRetryable: classification.isRetryable,
		isAuthError: classification.isAuthError,
		isRateLimitError: classification.isRateLimitError,
		retryAfterMs,
		details: parsed.traceId ? { traceId: [parsed.traceId] } : void 0
	});
}
var GOOGLE_API_BASE = `https://googleads.googleapis.com/v24`;
//#endregion
//#region src/services/integrations/meta-ads/constants.ts
var META_API_VERSION = "v25.0";
var META_GRAPH_API_ROOT = "https://graph.facebook.com";
var META_WEB_API_ROOT = "https://www.facebook.com";
var META_API_BASE = `${META_GRAPH_API_ROOT}/${META_API_VERSION}`;
var META_OAUTH_TOKEN_ENDPOINT = `${META_API_BASE}/oauth/access_token`;
var META_OAUTH_DIALOG_BASE = `${META_WEB_API_ROOT}/${META_API_VERSION}`;
//#endregion
//#region src/services/integrations/shared/base-client.ts
/**
* Generic Integration API Client
*
* Provides shared retry logic, backoff calculation, and logging for all
* integration platform clients (Meta, Google, TikTok, LinkedIn).
*/
var DEFAULT_INTEGRATION_REQUEST_TIMEOUT_MS = 45e3;
function logRequest(context) {
	const { platform, operation, url, attempt, maxRetries, duration, statusCode, error, extra } = context;
	const sanitizedUrl = url.replace(/access_token=[^&]+/, "access_token=***").replace(/token=[^&]+/, "token=***");
	const urlObj = new URL(sanitizedUrl);
	const logData = {
		url: `${urlObj.origin}${urlObj.pathname}`,
		attempt: `${attempt + 1}/${maxRetries}`,
		statusCode,
		duration: duration ? `${duration}ms` : void 0,
		...extra
	};
	if (error) console.error(`[${platform.toUpperCase()} API] ${operation} failed`, {
		...logData,
		error: "toJSON" in error && typeof error.toJSON === "function" ? error.toJSON() : { message: error.message }
	});
	else console.log(`[${platform.toUpperCase()} API] ${operation} completed`, logData);
}
var IntegrationApiClient = class {
	constructor(config) {
		this.platform = config.platform;
		this.baseUrl = config.baseUrl ?? "";
		this.defaultHeaders = config.defaultHeaders ?? {};
		this.maxRetries = config.maxRetries ?? DEFAULT_RETRY_CONFIG.maxRetries;
		this.defaultTimeoutMs = config.defaultTimeoutMs ?? DEFAULT_INTEGRATION_REQUEST_TIMEOUT_MS;
		this.isSuccess = config.isSuccess ?? ((response) => response.ok);
	}
	/**
	* Execute a request with automatic retry, backoff, and error handling
	*/
	async executeRequest(options) {
		const { url, method = "GET", headers: requestHeaders = {}, body, operation, maxRetries = this.maxRetries, timeoutMs = this.defaultTimeoutMs, signal, onAuthError, onRateLimitHit } = options;
		let currentUrl = url.startsWith("http") ? url : `${this.baseUrl}${url}`;
		let currentHeaders = {
			...this.defaultHeaders,
			...requestHeaders
		};
		let lastError = null;
		for (let attempt = 0; attempt < maxRetries; attempt++) {
			const startTime = Date.now();
			let response;
			const { signal: requestSignal, cleanup } = composeAbortSignal({
				signal,
				timeoutMs,
				timeoutMessage: `${this.platform} ${operation} timed out.`
			});
			try {
				response = await fetch(currentUrl, {
					method,
					headers: currentHeaders,
					signal: requestSignal,
					...body && { body: typeof body === "string" ? body : JSON.stringify(body) }
				});
			} catch (networkError) {
				if (isAbortError(networkError)) throw networkError;
				lastError = isTimeoutError(networkError) ? /* @__PURE__ */ new Error(`${this.platform} ${operation} timed out. Please try again.`) : networkError instanceof Error ? networkError : /* @__PURE__ */ new Error("Network request failed");
				logRequest({
					platform: this.platform,
					operation,
					url: currentUrl,
					attempt,
					maxRetries,
					duration: Date.now() - startTime,
					error: lastError
				});
				if (attempt < maxRetries - 1) {
					await sleepWithSignal(calculateBackoffDelay(attempt), signal);
					continue;
				}
				throw lastError ?? /* @__PURE__ */ new Error(`${this.platform} ${operation} failed after network errors.`);
			} finally {
				cleanup();
			}
			const duration = Date.now() - startTime;
			const platformLabel = this.platform.toUpperCase();
			let payload;
			let rawBody = null;
			try {
				const isJsonResponse = (response.headers.get("content-type") || "").split(";")[0]?.trim().toLowerCase() === "application/json";
				const responseClone = response.clone();
				if (isJsonResponse) {
					rawBody = await responseClone.text();
					const rawBodyPreview = rawBody?.slice(0, 500);
					console.log(`[${platformLabel} API] Raw response body:`, rawBodyPreview);
					payload = JSON.parse(rawBody);
				} else {
					rawBody = await responseClone.text();
					payload = rawBody;
				}
			} catch (parseError) {
				const rawBodyPreview = rawBody?.slice(0, 500);
				console.error(`[${platformLabel} API] Failed to parse response:`, parseError, "Raw body:", rawBodyPreview);
				payload = {
					error: "Failed to parse response",
					rawBody: rawBodyPreview
				};
			}
			if (this.isSuccess(response, payload)) {
				logRequest({
					platform: this.platform,
					operation,
					url: currentUrl,
					attempt,
					maxRetries,
					duration,
					statusCode: response.status
				});
				return {
					response,
					payload
				};
			}
			console.log(`[${platformLabel} API] Error response payload:`, payload);
			const error = parseIntegrationError(response, payload, this.platform);
			lastError = error;
			logRequest({
				platform: this.platform,
				operation,
				url: currentUrl,
				attempt,
				maxRetries,
				duration,
				statusCode: response.status,
				error
			});
			if (error.isAuthError && onAuthError) {
				const result = await onAuthError();
				if (result.retry && result.newToken) {
					currentHeaders = this.updateAuthHeader(currentHeaders, result.newToken);
					currentUrl = this.updateAuthInUrl(currentUrl, result.newToken);
					attempt = -1;
					continue;
				}
				throw error;
			}
			if (response.status === 429 || error.isRateLimitError) {
				const retryAfterMs = error.retryAfterMs ?? parseRetryAfterMs(response.headers) ?? calculateBackoffDelay(attempt) * 2;
				onRateLimitHit?.(retryAfterMs);
				if (attempt < maxRetries - 1) {
					console.warn(`[${platformLabel} API] Rate limited, waiting ${retryAfterMs}ms`);
					await sleepWithSignal(retryAfterMs, signal);
					continue;
				}
				throw error;
			}
			if ((error.isRetryable || isRetryableStatus(response.status)) && attempt < maxRetries - 1) {
				await sleepWithSignal(calculateBackoffDelay(attempt), signal);
				continue;
			}
			throw error;
		}
		throw lastError ?? /* @__PURE__ */ new Error(`${this.platform} API request failed after all retries`);
	}
	/**
	* Update auth header based on platform conventions
	*/
	updateAuthHeader(headers, newToken) {
		const updated = { ...headers };
		switch (this.platform) {
			case "meta":
			case "google":
				updated["Authorization"] = `Bearer ${newToken}`;
				break;
			case "tiktok":
				updated["Access-Token"] = newToken;
				break;
			case "linkedin":
				updated["Authorization"] = `Bearer ${newToken}`;
				break;
		}
		return updated;
	}
	/**
	* Update auth token embedded in URLs for platforms that use query param auth.
	*/
	updateAuthInUrl(url, newToken) {
		try {
			const urlObj = new URL(url);
			if (urlObj.searchParams.has("access_token")) urlObj.searchParams.set("access_token", newToken);
			if (urlObj.searchParams.has("token")) urlObj.searchParams.set("token", newToken);
			return urlObj.toString();
		} catch {
			return url;
		}
	}
	/**
	* Helper for GET requests
	*/
	async get(url, options) {
		return this.executeRequest({
			...options,
			url,
			method: "GET"
		});
	}
	/**
	* Helper for POST requests
	*/
	async post(url, options) {
		return this.executeRequest({
			...options,
			url,
			method: "POST"
		});
	}
};
var metaAdsClient = new IntegrationApiClient({
	platform: "meta",
	baseUrl: META_API_BASE,
	defaultTimeoutMs: DEFAULT_INTEGRATION_REQUEST_TIMEOUT_MS,
	isSuccess: (response, payload) => {
		if (!response.ok) return false;
		return !payload.error;
	}
});
var googleAdsClient = new IntegrationApiClient({
	platform: "google",
	baseUrl: GOOGLE_API_BASE,
	defaultTimeoutMs: DEFAULT_INTEGRATION_REQUEST_TIMEOUT_MS
});
var tiktokAdsClient = new IntegrationApiClient({
	platform: "tiktok",
	baseUrl: "https://business-api.tiktok.com/open_api/v1.3",
	defaultTimeoutMs: DEFAULT_INTEGRATION_REQUEST_TIMEOUT_MS,
	isSuccess: (response, payload) => {
		const data = payload;
		return response.ok && (!data.code || data.code === 0);
	}
});
var linkedinAdsClient = new IntegrationApiClient({
	platform: "linkedin",
	baseUrl: "https://api.linkedin.com/v2",
	defaultTimeoutMs: DEFAULT_INTEGRATION_REQUEST_TIMEOUT_MS
});
//#endregion
//#region src/services/integrations/shared/execute-integration-request.ts
async function executeIntegrationRequest(client, options, config) {
	const resolvedMethod = options.method ?? config?.defaultMethod;
	const resolvedOptions = resolvedMethod ? {
		...options,
		method: resolvedMethod
	} : options;
	return client.executeRequest(resolvedOptions);
}
//#endregion
export { tiktokAdsClient as a, META_OAUTH_DIALOG_BASE as c, metaAdsClient as i, META_OAUTH_TOKEN_ENDPOINT as l, googleAdsClient as n, META_API_BASE as o, linkedinAdsClient as r, META_API_VERSION as s, executeIntegrationRequest as t, GOOGLE_API_BASE as u };
