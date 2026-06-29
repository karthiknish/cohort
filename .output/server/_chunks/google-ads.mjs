import { r as __exportAll } from "../_runtime.mjs";
import { r as parseJsonBodySafely } from "./response-json.mjs";
import { t as DEFAULT_RETRY_CONFIG } from "./retry-utils.mjs";
import { n as googleAdsClient, t as executeIntegrationRequest, u as GOOGLE_API_BASE } from "./execute-integration-request.mjs";
//#region src/services/integrations/google-ads/client.ts
function normalizeCost(costMicros) {
	if (costMicros == null) return 0;
	const value = typeof costMicros === "string" ? parseFloat(costMicros) : costMicros;
	return Number.isFinite(value) ? value / 1e6 : 0;
}
async function executeGoogleAdsApiRequest(options) {
	return executeIntegrationRequest(googleAdsClient, options);
}
async function googleAdsSearch(options) {
	const { accessToken, developerToken, customerId, query, loginCustomerId, pageSize = 1e3, maxPages = 1, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, onAuthError, onRateLimitHit } = options;
	let currentAccessToken = accessToken;
	const fetchPage = async (page, pageToken) => {
		const url = `${GOOGLE_API_BASE}/customers/${customerId}/googleAds:search`;
		const headers = {
			Authorization: `Bearer ${currentAccessToken}`,
			"developer-token": developerToken,
			"Content-Type": "application/json"
		};
		if (loginCustomerId) headers["login-customer-id"] = loginCustomerId;
		const { payload } = await executeGoogleAdsApiRequest({
			url,
			method: "POST",
			headers,
			body: JSON.stringify({
				query,
				pageSize,
				pageToken,
				returnTotalResultsCount: false
			}),
			operation: `search:page${page}`,
			maxRetries,
			onAuthError: async () => {
				if (onAuthError) {
					const result = await onAuthError();
					if (result.newToken) currentAccessToken = result.newToken;
					return result;
				}
				return { retry: false };
			},
			onRateLimitHit
		});
		const pageResults = Array.isArray(payload.results) ? payload.results : [];
		const nextPageToken = payload.nextPageToken ?? void 0;
		if (!nextPageToken || page + 1 >= maxPages) return pageResults;
		const nextPageResults = await fetchPage(page + 1, nextPageToken);
		return [...pageResults, ...nextPageResults];
	};
	return fetchPage(0);
}
//#endregion
//#region src/services/integrations/google-ads/metrics.ts
function buildGaqlQuery(timeframeDays) {
	return `
    SELECT
      segments.date,
      campaign.id,
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE segments.date DURING LAST_${timeframeDays > 0 ? timeframeDays : 7}_DAYS
  `.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}
function resolveDeveloperToken(token) {
	const resolved = token ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
	if (!resolved) throw new Error("Google Ads developer token is required via integration data or GOOGLE_ADS_DEVELOPER_TOKEN env");
	return resolved;
}
async function fetchGoogleAdsMetrics(options) {
	const { accessToken, developerToken, customerId, loginCustomerId, managerCustomerId, timeframeDays, pageSize = 1e3, maxPages = 5, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, refreshAccessToken, onRateLimitHit, onTokenRefresh } = options;
	const resolvedDeveloperToken = resolveDeveloperToken(developerToken);
	const query = buildGaqlQuery(timeframeDays);
	const effectiveLoginCustomerId = loginCustomerId ?? managerCustomerId ?? null;
	let activeAccessToken = accessToken;
	let tokenRefreshAttempted = false;
	return (await googleAdsSearch({
		accessToken: activeAccessToken,
		developerToken: resolvedDeveloperToken,
		customerId,
		loginCustomerId: effectiveLoginCustomerId,
		query,
		pageSize,
		maxPages,
		maxRetries,
		onAuthError: async () => {
			if (refreshAccessToken && !tokenRefreshAttempted) {
				tokenRefreshAttempted = true;
				activeAccessToken = await refreshAccessToken();
				onTokenRefresh?.();
				return {
					retry: true,
					newToken: activeAccessToken
				};
			}
			return { retry: false };
		},
		onRateLimitHit
	})).map((row) => {
		const segments = row?.segments ?? {};
		const metricsBlock = row?.metrics ?? {};
		const campaign = row?.campaign;
		const date = segments?.date ?? "";
		const spend = normalizeCost(metricsBlock?.costMicros ?? metricsBlock?.cost_micros);
		const impressions = Number(metricsBlock?.impressions) || 0;
		const clicks = Number(metricsBlock?.clicks) || 0;
		const conversions = Number(metricsBlock?.conversions) || 0;
		const convValue = metricsBlock?.conversionsValue ?? metricsBlock?.conversions_value;
		const revenue = typeof convValue === "number" ? convValue : parseFloat(String(convValue)) || 0;
		return {
			providerId: "google",
			accountId: customerId,
			date,
			spend,
			impressions,
			clicks,
			conversions,
			revenue: revenue > 0 ? revenue : void 0,
			campaignId: typeof campaign?.id === "string" ? campaign.id : void 0,
			campaignName: typeof campaign?.name === "string" ? campaign.name : void 0,
			rawPayload: row
		};
	});
}
async function checkGoogleAdsIntegrationHealth(options) {
	const { accessToken, developerToken, customerId, loginCustomerId } = options;
	try {
		const resolvedDeveloperToken = resolveDeveloperToken(developerToken);
		const listUrl = `${GOOGLE_API_BASE}/customers:listAccessibleCustomers`;
		const listResponse = await fetch(listUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"developer-token": resolvedDeveloperToken
			}
		});
		if (!listResponse.ok) {
			const errorData = await parseJsonBodySafely(listResponse, {
				context: "Google Ads health accessible customers error",
				allowEmpty: true
			});
			const isDeveloperTokenError = listResponse.status === 401 && (errorData?.error?.message?.toLowerCase().includes("developer") ?? false);
			return {
				healthy: false,
				tokenValid: !isDeveloperTokenError,
				developerTokenValid: !isDeveloperTokenError,
				accountAccessible: false,
				error: errorData?.error?.message ?? "Token validation failed"
			};
		}
		if (customerId) {
			const query = "SELECT customer.id FROM customer LIMIT 1";
			const searchHeaders = {
				Authorization: `Bearer ${accessToken}`,
				"developer-token": resolvedDeveloperToken,
				"Content-Type": "application/json"
			};
			if (loginCustomerId) searchHeaders["login-customer-id"] = loginCustomerId;
			const searchUrl = `${GOOGLE_API_BASE}/customers/${customerId}/googleAds:search`;
			const searchResponse = await fetch(searchUrl, {
				method: "POST",
				headers: searchHeaders,
				body: JSON.stringify({
					query,
					pageSize: 1
				})
			});
			if (!searchResponse.ok) return {
				healthy: false,
				tokenValid: true,
				developerTokenValid: true,
				accountAccessible: false,
				error: (await parseJsonBodySafely(searchResponse, {
					context: "Google Ads health account search error",
					allowEmpty: true
				}))?.error?.message ?? "Account not accessible"
			};
		}
		return {
			healthy: true,
			tokenValid: true,
			developerTokenValid: true,
			accountAccessible: true
		};
	} catch (error) {
		return {
			healthy: false,
			tokenValid: false,
			developerTokenValid: false,
			accountAccessible: false,
			error: error instanceof Error ? error.message : "Health check failed"
		};
	}
}
//#endregion
//#region src/services/integrations/google-ads/index.ts
var google_ads_exports = /* @__PURE__ */ __exportAll({
	GOOGLE_API_BASE: () => GOOGLE_API_BASE,
	GOOGLE_API_VERSION: () => "v24",
	checkGoogleAdsIntegrationHealth: () => checkGoogleAdsIntegrationHealth
});
//#endregion
export { fetchGoogleAdsMetrics as n, google_ads_exports as t };
