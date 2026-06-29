import { r as __exportAll } from "../_runtime.mjs";
import { D as formatDate, n as coerceNumber$1 } from "./utils.mjs";
import { c as sleep, t as DEFAULT_RETRY_CONFIG } from "./retry-utils.mjs";
import { i as metaAdsClient, o as META_API_BASE } from "./execute-integration-request.mjs";
//#region src/services/integrations/meta-ads/client.ts
function buildTimeRange(timeframeDays) {
	const today = /* @__PURE__ */ new Date();
	const since = new Date(today);
	since.setUTCDate(since.getUTCDate() - Math.max(timeframeDays - 1, 0));
	return {
		since: formatDate(since, "yyyy-MM-dd"),
		until: formatDate(today, "yyyy-MM-dd")
	};
}
var coerceNumber = (value) => coerceNumber$1(value) ?? 0;
async function computeHmacSha256(secret, data) {
	const encoder = new TextEncoder();
	const keyData = encoder.encode(secret);
	const messageData = encoder.encode(data);
	const key = await crypto.subtle.importKey("raw", keyData, {
		name: "HMAC",
		hash: "SHA-256"
	}, false, ["sign"]);
	const signature = await crypto.subtle.sign("HMAC", key, messageData);
	return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function appendMetaAuthParams(options) {
	const { params, accessToken, appSecret } = options;
	params.set("access_token", accessToken);
	if (!appSecret) return;
	try {
		const proof = await computeHmacSha256(appSecret, accessToken);
		params.set("appsecret_proof", proof);
	} catch (error) {
		console.error("[Meta API] Failed to compute appsecret_proof - API requests will proceed without proof", { error: error instanceof Error ? error.message : "Unknown error" });
	}
}
//#endregion
//#region src/services/integrations/meta-ads/async-insights.ts
var async_insights_exports = /* @__PURE__ */ __exportAll({ runMetaAccountInsightsReportToCompletion: () => runMetaAccountInsightsReportToCompletion });
function createMetaAsyncInsightsRequestState(accessToken) {
	return {
		accessToken,
		tokenRefreshAttempted: false
	};
}
async function executeMetaAsyncInsightsRequest(options) {
	const { url, operation, requestState, maxRetries, method, body, refreshAccessToken, onRateLimitHit, onTokenRefresh } = options;
	return metaAdsClient.executeRequest({
		url,
		operation,
		maxRetries,
		method,
		body,
		headers: body ? { "Content-Type": "application/x-www-form-urlencoded" } : void 0,
		onAuthError: async () => {
			if (refreshAccessToken && !requestState.tokenRefreshAttempted) {
				requestState.tokenRefreshAttempted = true;
				requestState.accessToken = await refreshAccessToken();
				onTokenRefresh?.();
				return {
					retry: true,
					newToken: requestState.accessToken
				};
			}
			return { retry: false };
		},
		onRateLimitHit
	});
}
function formatAdAccountId(adAccountId) {
	return adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;
}
function parseReportRunId(payload) {
	const fromField = payload?.report_run_id;
	if (typeof fromField === "string" && fromField.length > 0) return fromField;
	if (typeof fromField === "number" && Number.isFinite(fromField)) return String(fromField);
	const fromId = payload?.id;
	if (typeof fromId === "string" && fromId.length > 0) return fromId;
	if (typeof fromId === "number" && Number.isFinite(fromId)) return String(fromId);
	return null;
}
var INSIGHT_FIELDS = [
	"date_start",
	"date_stop",
	"campaign_id",
	"campaign_name",
	"impressions",
	"clicks",
	"spend",
	"actions",
	"action_values",
	"account_currency"
].join(",");
async function startMetaAccountInsightsReportInternal(options) {
	const { adAccountId, timeframeDays, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, requestState, refreshAccessToken, onRateLimitHit, onTokenRefresh } = options;
	const timeRange = buildTimeRange(timeframeDays);
	const params = new URLSearchParams({
		level: "campaign",
		fields: INSIGHT_FIELDS,
		time_range: JSON.stringify(timeRange),
		time_increment: "1",
		breakdowns: "publisher_platform",
		limit: "500"
	});
	await appendMetaAuthParams({
		params,
		accessToken: requestState.accessToken,
		appSecret: process.env.META_APP_SECRET
	});
	const { payload } = await executeMetaAsyncInsightsRequest({
		url: `${META_API_BASE}/${formatAdAccountId(adAccountId)}/insights`,
		method: "POST",
		body: params.toString(),
		operation: "startMetaAccountInsightsReport",
		maxRetries,
		requestState,
		refreshAccessToken,
		onRateLimitHit,
		onTokenRefresh
	});
	if (payload?.error) throw new Error(payload.error.message ?? "Meta async insights: failed to start report");
	const reportRunId = parseReportRunId(payload);
	if (!reportRunId) throw new Error("Meta async insights: missing report_run_id in start response");
	return { reportRunId };
}
async function getMetaAsyncInsightsReportStatusInternal(options) {
	const { reportRunId, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, requestState, refreshAccessToken, onRateLimitHit, onTokenRefresh } = options;
	const params = new URLSearchParams({ fields: "async_status,async_percent_completion,account_id" });
	await appendMetaAuthParams({
		params,
		accessToken: requestState.accessToken,
		appSecret: process.env.META_APP_SECRET
	});
	const { payload } = await executeMetaAsyncInsightsRequest({
		url: `${META_API_BASE}/${reportRunId}?${params.toString()}`,
		operation: "getMetaAsyncInsightsReportStatus",
		maxRetries,
		requestState,
		refreshAccessToken,
		onRateLimitHit,
		onTokenRefresh
	});
	if (payload?.error) throw new Error(payload.error.message ?? "Meta async insights: status request failed");
	return {
		status: payload?.async_status ?? "unknown",
		percentComplete: typeof payload?.async_percent_completion === "number" && Number.isFinite(payload.async_percent_completion) ? payload.async_percent_completion : 0
	};
}
async function fetchMetaAsyncInsightsReportRowsInternal(options) {
	const { reportRunId, maxPages = 25, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, requestState, refreshAccessToken, onRateLimitHit, onTokenRefresh } = options;
	const fetchPage = async (page, paging) => {
		const params = new URLSearchParams({ limit: "500" });
		await appendMetaAuthParams({
			params,
			accessToken: requestState.accessToken,
			appSecret: process.env.META_APP_SECRET
		});
		if (paging?.after) params.set("after", paging.after);
		const { payload } = await executeMetaAsyncInsightsRequest({
			url: `${META_API_BASE}/${reportRunId}/insights?${params.toString()}`,
			operation: `fetchMetaAsyncInsightsReportRows:page${page}`,
			maxRetries,
			requestState,
			refreshAccessToken,
			onRateLimitHit,
			onTokenRefresh
		});
		const batch = Array.isArray(payload?.data) ? payload.data : [];
		const nextCursor = payload?.paging?.cursors?.after ?? null;
		const nextLink = payload?.paging?.next ?? null;
		const nextPaging = nextCursor ? {
			after: nextCursor,
			next: nextLink ?? void 0
		} : void 0;
		if (!nextPaging?.after || page + 1 >= maxPages) return batch;
		const nextBatch = await fetchPage(page + 1, nextPaging);
		return [...batch, ...nextBatch];
	};
	return fetchPage(0);
}
async function waitForMetaAsyncInsightsReportInternal(options) {
	const { reportRunId, maxWaitMs = 18e4, pollIntervalMs = 2e3, maxRetries, requestState, refreshAccessToken, onRateLimitHit, onTokenRefresh } = options;
	const deadline = Date.now() + maxWaitMs;
	const pollStatus = async () => {
		const { status } = await getMetaAsyncInsightsReportStatusInternal({
			reportRunId,
			maxRetries,
			requestState,
			refreshAccessToken,
			onRateLimitHit,
			onTokenRefresh
		});
		if (status === "Job Completed") return { status };
		if (status === "Job Failed" || status === "Job Skipped") throw new Error(`Meta async insights job finished with status: ${status}`);
		if (Date.now() >= deadline) throw new Error("Meta async insights: timed out waiting for Job Completed");
		await sleep(pollIntervalMs);
		return pollStatus();
	};
	return pollStatus();
}
/**
* Convenience: start job, block until complete, return raw insight rows (same shape as sync insights).
* For production sync, prefer start + store reportRunId + poll from a worker instead of blocking.
*/
async function runMetaAccountInsightsReportToCompletion(options) {
	const requestState = createMetaAsyncInsightsRequestState(options.accessToken);
	const { reportRunId } = await startMetaAccountInsightsReportInternal({
		adAccountId: options.adAccountId,
		timeframeDays: options.timeframeDays,
		maxRetries: options.maxRetries,
		requestState,
		refreshAccessToken: options.refreshAccessToken,
		onRateLimitHit: options.onRateLimitHit,
		onTokenRefresh: options.onTokenRefresh
	});
	await waitForMetaAsyncInsightsReportInternal({
		reportRunId,
		maxWaitMs: options.maxWaitMs,
		pollIntervalMs: options.pollIntervalMs,
		maxRetries: options.maxRetries,
		requestState,
		refreshAccessToken: options.refreshAccessToken,
		onRateLimitHit: options.onRateLimitHit,
		onTokenRefresh: options.onTokenRefresh
	});
	return fetchMetaAsyncInsightsReportRowsInternal({
		reportRunId,
		maxPages: options.maxPages,
		maxRetries: options.maxRetries,
		requestState,
		refreshAccessToken: options.refreshAccessToken,
		onRateLimitHit: options.onRateLimitHit,
		onTokenRefresh: options.onTokenRefresh
	});
}
//#endregion
export { coerceNumber as i, appendMetaAuthParams as n, buildTimeRange as r, async_insights_exports as t };
