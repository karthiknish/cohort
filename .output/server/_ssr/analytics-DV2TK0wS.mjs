import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, l as useMutation, r as useConvexAuth, s as useAction, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { C as getPreviewAnalyticsInsights, w as getPreviewAnalyticsMetrics } from "./preview-data-CXkRNfsX.mjs";
import { c as cn, u as formatCurrency } from "./utils-hh4sibN0.mjs";
import { V as startOfDay, _ as format, a as subDays, j as differenceInDays, k as endOfDay } from "../_libs/date-fns.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { c as mapGoogleAnalyticsIntegrationError, i as isIntegrationScopeAppError, s as logError, t as asErrorMessage } from "./convex-errors-sHK0JmZ7.mjs";
import { a as notifyInfo, i as notifyFailure, o as notifySuccess } from "./notifications-DQZKskhM.mjs";
import { i as useSearchParams, n as usePathname, r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { d as apiFetch, g as useAuth, t as ApiClientError } from "./auth-context-fSvbzOPB.mjs";
import { g as analyticsIntegrationsApi, h as analyticsInsightsApi } from "./convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { Br as ArrowUpRight, Er as CalendarRange, F as Sparkles, Hn as DollarSign, Jr as Activity, Nt as Minus, S as TrendingDown, Sr as ChartColumn, Vn as Download, Vr as ArrowRight, W as Share2, Yt as LoaderCircle, Z as RotateCw, b as TriangleAlert, hr as ChevronDown, i as X, jt as Monitor, nn as Lightbulb, or as CircleCheck, ot as Radio, rt as RefreshCw, tn as Link2, u as Users, un as Info, v as Unlink, wr as Calendar, x as TrendingUp } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip-BwcfatA2.mjs";
import { n as SvglExcelIcon, t as SvglBrandLogo } from "./svgl-brand-logo-rIFZzPiw.mjs";
import { a as getIconContainerClasses, i as getButtonClasses, n as PAGE_TITLES, r as getBadgeClasses, t as DASHBOARD_THEME } from "./dashboard-theme-DM5oBGdY.mjs";
import { r as useConvexQueryError } from "./use-convex-query-error-P2IX7lhG.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./alert-DYeH1Q3p.mjs";
import { i as TruncatedTextPreview, r as MetricHint } from "./hover-preview-BP_Z2-hG.mjs";
import { t as dynamic } from "./dynamic-D6gKSsRx.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-BwHc7N7y.mjs";
import { t as Calendar$1 } from "./calendar-9B6zD0Is.mjs";
import { n as useMutation$1, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { i as DropdownMenuItem, l as DropdownMenuTrigger, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-CJEJ0oqe.mjs";
import { t as PageMotionShell } from "./page-motion-shell-Ci2leIYf.mjs";
import { n as useCurrency } from "./preferences-context-D6bi2pUb.mjs";
import { i as isFinancialComparable, r as formatAggregatedMoney, t as aggregateMetricFinancials } from "./aggregate-financials-Cj14Bj_Z.mjs";
import { r as buildAnalyticsExportCharts } from "./cohorts-spreadsheet-charts-C3_blKf3.mjs";
import { t as DashboardPageHero } from "./dashboard-page-hero-BIWBoJtP.mjs";
import { n as DisconnectDialog } from "./connection-dialog-CrKkZRgV.mjs";
import { n as NoInsightsData, r as NoIntegrationConnected } from "./analytics-empty-state-z7vsKXdJ.mjs";
import { t as useAccumulatedCursorPages } from "./use-accumulated-cursor-pages-6G2SM2av.mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
import { t as remarkGfm } from "../_libs/remark-gfm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analytics-DV2TK0wS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function toFinancialRows(metrics, integrationCurrency) {
	const fallback = typeof integrationCurrency === "string" && integrationCurrency.trim().length > 0 ? integrationCurrency.trim().toUpperCase() : null;
	return metrics.map((metric) => ({
		spend: Number(metric.spend ?? 0),
		revenue: metric.revenue ?? 0,
		currency: typeof metric.currency === "string" && metric.currency.trim().length > 0 ? metric.currency.trim().toUpperCase() : fallback,
		impressions: 0,
		clicks: 0,
		conversions: 0
	}));
}
/**
* Resolve display currency and safe revenue formatting for analytics metrics.
* Uses the same comparability rules as the dashboard and ads read model.
*/
function buildAnalyticsMoneyDisplay(metrics, options) {
	const preferenceCurrency = options?.preferenceCurrency ?? "USD";
	let { financialTotals } = aggregateMetricFinancials(toFinancialRows(metrics, options?.integrationCurrency));
	const integrationCurrency = typeof options?.integrationCurrency === "string" && options.integrationCurrency.trim().length > 0 ? options.integrationCurrency.trim().toUpperCase() : null;
	if (!isFinancialComparable(financialTotals.comparability) && financialTotals.comparability === "unknown_currency" && metrics.some((row) => (row.revenue ?? 0) > 0 || (row.spend ?? 0) > 0)) {
		const fallbackCurrency = integrationCurrency ?? preferenceCurrency;
		const preferenceTotals = aggregateMetricFinancials(metrics.map((row) => ({
			spend: Number(row.spend ?? 0),
			revenue: row.revenue ?? 0,
			currency: fallbackCurrency,
			impressions: 0,
			clicks: 0,
			conversions: 0
		})));
		if (isFinancialComparable(preferenceTotals.financialTotals.comparability)) financialTotals = preferenceTotals.financialTotals;
	}
	const formatRevenue = (amount) => formatAggregatedMoney(amount ?? null, financialTotals, formatCurrency);
	return {
		financialTotals,
		displayCurrency: financialTotals.primaryCurrency,
		formatRevenue,
		totalRevenue: financialTotals.revenue,
		revenueComparable: isFinancialComparable(financialTotals.comparability)
	};
}
function buildDelta(current, previous) {
	const currentValue = current ?? 0;
	const previousValue = previous ?? 0;
	if (current === null || previous === null) return {
		current: currentValue,
		previous: previousValue,
		deltaPercent: null,
		direction: "flat"
	};
	if (previousValue <= 0) return {
		current: currentValue,
		previous: previousValue,
		deltaPercent: null,
		direction: currentValue > 0 ? "new" : "flat"
	};
	const deltaPercent = (currentValue - previousValue) / previousValue * 100;
	if (Math.abs(deltaPercent) < 1) return {
		current: currentValue,
		previous: previousValue,
		deltaPercent,
		direction: "flat"
	};
	return {
		current: currentValue,
		previous: previousValue,
		deltaPercent,
		direction: deltaPercent > 0 ? "up" : "down"
	};
}
function pickTopDay(chartData, key) {
	if (chartData.length === 0) return null;
	return chartData.reduce((best, point) => {
		if (!best) return point;
		return point[key] > best[key] ? point : best;
	}, null);
}
function buildGoogleAnalyticsStory(params) {
	const { currentTotals, previousTotals, chartData, selectedRangeDays } = params;
	const deltas = {
		users: buildDelta(currentTotals.users, previousTotals.users),
		sessions: buildDelta(currentTotals.sessions, previousTotals.sessions),
		conversions: buildDelta(currentTotals.conversions, previousTotals.conversions),
		revenue: buildDelta(currentTotals.revenue, previousTotals.revenue)
	};
	const positiveSignals = Object.values(deltas).filter((delta) => delta.direction === "up" || delta.direction === "new").length;
	const negativeSignals = Object.values(deltas).filter((delta) => delta.direction === "down").length;
	return {
		activeDays: chartData.length,
		coverageRatio: selectedRangeDays > 0 ? chartData.length / selectedRangeDays : 0,
		momentum: positiveSignals > negativeSignals ? "up" : negativeSignals > positiveSignals ? "down" : "steady",
		deltas,
		topSessionsDay: pickTopDay(chartData, "sessions"),
		topConversionDay: pickTopDay(chartData, "conversions"),
		topRevenueDay: pickTopDay(chartData, "revenue")
	};
}
function buildProviderIdsKey(providerIds) {
	if (!providerIds || providerIds.length === 0) return "";
	return providerIds.toSorted().join("|");
}
function normalizeProviderIds(providerIds) {
	const key = buildProviderIdsKey(providerIds);
	return key ? key.split("|") : void 0;
}
function normalizeInsightMarkdown(text) {
	const trimmed = text.trim();
	if (!trimmed) return "";
	return trimmed.replace(/^```markdown\s*/i, "").replace(/^```md\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function mergeAnalyticsMetricPages(firstPage, olderPages) {
	const byId = /* @__PURE__ */ new Map();
	for (const metric of firstPage) byId.set(metric.id, metric);
	for (const metric of olderPages) if (!byId.has(metric.id)) byId.set(metric.id, metric);
	return Array.from(byId.values()).sort((left, right) => left.date < right.date ? 1 : left.date > right.date ? -1 : 0);
}
function parsePaginatedAnalyticsMetrics(value) {
	if (!value || typeof value !== "object") return null;
	const metrics = value.metrics;
	const breakdowns = value.breakdowns;
	if (!Array.isArray(metrics)) return null;
	const nextCursor = value.nextCursor;
	const parsedCursor = nextCursor && typeof nextCursor === "object" && typeof nextCursor.fieldValue === "string" && typeof nextCursor.legacyId === "string" ? nextCursor : null;
	return {
		metrics,
		breakdowns: Array.isArray(breakdowns) ? breakdowns : [],
		nextCursor: parsedCursor
	};
}
function matchesProvider(providerId, providerIds) {
	if (!providerIds || providerIds.length === 0) return true;
	return providerIds.includes(providerId);
}
function isGoogleAnalyticsOnly(providerIds) {
	return providerIds.length === 1 && providerIds[0] === "google-analytics";
}
function useAnalyticsData(_token, periodDays, clientId, isPreviewMode, workspaceId, options) {
	const includeInsights = options?.includeInsights ?? true;
	const providerIdsKey = buildProviderIdsKey(options?.providerIds);
	const providerIds = normalizeProviderIds(providerIdsKey ? providerIdsKey.split("|") : void 0) ?? [];
	const gaOnly = isGoogleAnalyticsOnly(providerIds);
	const startDate = options?.startDate;
	const endDate = options?.endDate;
	const [insights, setInsights] = (0, import_react.useState)([]);
	const [algorithmic, setAlgorithmic] = (0, import_react.useState)([]);
	const [insightsLoading, setInsightsLoading] = (0, import_react.useState)(false);
	const [insightsRefreshing, setInsightsRefreshing] = (0, import_react.useState)(false);
	const [insightsError, setInsightsError] = (0, import_react.useState)(void 0);
	const hasFetchedInsightsRef = (0, import_react.useRef)(false);
	const [metricsLoadCursor, setMetricsLoadCursor] = (0, import_react.useState)(null);
	const previewMetrics = (() => {
		if (!isPreviewMode) return null;
		return getPreviewAnalyticsMetrics();
	})();
	const previewInsights = (() => {
		if (!isPreviewMode) return null;
		return getPreviewAnalyticsInsights();
	})();
	const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
	const canQueryConvex = isConvexAuthenticated && !isConvexLoading;
	const metricsScopeKey = `${workspaceId ?? ""}|${clientId ?? ""}|${startDate ?? ""}|${endDate ?? ""}|${isPreviewMode ? "preview" : "live"}`;
	const metricsQueryEnabled = gaOnly && !isPreviewMode && Boolean(workspaceId) && canQueryConvex;
	const gaMetricsRealtime = useQuery(analyticsIntegrationsApi.listAnalyticsMetricsPaginated, gaOnly && !isPreviewMode && workspaceId && canQueryConvex ? {
		workspaceId,
		clientId: clientId ?? null,
		startDate,
		endDate,
		limit: 100,
		cursor: metricsLoadCursor
	} : "skip");
	const gaBreakdownsRealtime = useQuery(analyticsIntegrationsApi.listAnalyticsBreakdowns, gaOnly && !isPreviewMode && workspaceId && canQueryConvex ? {
		workspaceId,
		clientId: clientId ?? null,
		startDate,
		endDate
	} : "skip");
	const gaMetricsQueryError = useConvexQueryError({
		data: gaMetricsRealtime,
		skipped: isPreviewMode || !gaOnly || !workspaceId || !canQueryConvex,
		loading: isConvexLoading,
		fallbackMessage: "Unable to load analytics metrics."
	});
	const gaBreakdownsQueryError = useConvexQueryError({
		data: gaBreakdownsRealtime,
		skipped: isPreviewMode || !gaOnly || !workspaceId || !canQueryConvex,
		loading: isConvexLoading,
		fallbackMessage: "Unable to load analytics breakdowns."
	});
	const generateInsights = useAction(analyticsInsightsApi.generateInsights);
	const fetchInsights = (0, import_react.useEffectEvent)(async () => {
		if (isPreviewMode || !workspaceId || !includeInsights) return;
		if (!hasFetchedInsightsRef.current) setInsightsLoading(true);
		else setInsightsRefreshing(true);
		setInsightsError(void 0);
		try {
			const result = await generateInsights({
				workspaceId,
				clientId: clientId ?? void 0,
				periodDays,
				providerIds
			});
			setInsights(result.insights);
			setAlgorithmic(result.algorithmic);
			hasFetchedInsightsRef.current = true;
		} catch (error) {
			logError(error, "useAnalyticsData:fetchInsights");
			setInsightsError(error instanceof Error ? error : new Error(asErrorMessage(error)));
		} finally {
			setInsightsLoading(false);
			setInsightsRefreshing(false);
		}
	});
	const insightsFetchKey = !isPreviewMode && workspaceId && includeInsights ? `${workspaceId}|${clientId ?? ""}|${periodDays}|${providerIdsKey}` : null;
	(0, import_react.useEffect)(() => {
		if (!insightsFetchKey) return;
		fetchInsights();
	}, [insightsFetchKey]);
	const mutateInsights = async () => {
		await fetchInsights();
	};
	const metricsPagination = useAccumulatedCursorPages({
		scopeKey: metricsScopeKey,
		queryData: gaMetricsRealtime,
		loadCursor: metricsLoadCursor,
		setLoadCursor: setMetricsLoadCursor,
		enabled: metricsQueryEnabled,
		getItemKey: (metric) => metric.id,
		parsePage: (queryData) => {
			const paginated = parsePaginatedAnalyticsMetrics(queryData);
			if (!paginated) return {
				items: [],
				nextCursor: null
			};
			return {
				items: paginated.metrics.map((row) => ({
					id: row.id,
					providerId: row.providerId,
					date: row.date,
					currency: row.currency,
					spend: row.spend,
					impressions: row.impressions,
					clicks: row.clicks,
					conversions: row.conversions,
					revenue: row.revenue
				})),
				nextCursor: paginated.nextCursor
			};
		},
		mergePages: mergeAnalyticsMetricPages
	});
	const previewMappedMetrics = (previewMetrics ?? []).map((row) => {
		const record = row;
		return {
			...row,
			currency: typeof record.currency === "string" ? record.currency : null
		};
	});
	const mappedMetrics = isPreviewMode ? previewMappedMetrics : metricsPagination.mergedItems;
	const breakdowns = (() => {
		if (isPreviewMode) return [];
		if (!gaBreakdownsRealtime || typeof gaBreakdownsRealtime !== "object") return [];
		const rows = gaBreakdownsRealtime.breakdowns;
		if (!Array.isArray(rows)) return [];
		return rows.map((row) => {
			const entry = row;
			return {
				...entry,
				revenue: entry.revenue ?? null
			};
		});
	})();
	const metricsLoading = metricsQueryEnabled && metricsPagination.isInitialLoading;
	const loadMoreMetrics = () => {
		if (isPreviewMode || metricsLoading) return;
		try {
			metricsPagination.loadMore();
		} catch (error) {
			logError(error, "useAnalyticsData:loadMoreMetrics");
			notifyFailure({
				title: "Metrics pagination error",
				error
			});
		}
	};
	const resetMetricsPagination = () => {
		metricsPagination.reset();
	};
	if (isPreviewMode && previewMetrics && previewInsights) return {
		metricsData: mappedMetrics,
		breakdowns: [],
		metricsNextCursor: null,
		metricsLoadingMore: false,
		resetMetricsPagination: async () => void 0,
		metricsError: void 0,
		breakdownsError: void 0,
		metricsLoading: false,
		metricsRefreshing: false,
		loadMoreMetrics: () => void 0,
		mutateMetrics: async () => void 0,
		insights: previewInsights.insights.filter((entry) => matchesProvider(entry.providerId, providerIds)),
		algorithmic: previewInsights.algorithmic.filter((entry) => matchesProvider(entry.providerId, providerIds) || entry.providerId === "global"),
		insightsError: void 0,
		insightsLoading: false,
		insightsRefreshing: false,
		mutateInsights: async () => void 0
	};
	const metricsError = gaMetricsQueryError ? new Error(gaMetricsQueryError) : void 0;
	const breakdownsError = gaBreakdownsQueryError ? new Error(gaBreakdownsQueryError) : void 0;
	return {
		metricsData: mappedMetrics,
		breakdowns,
		metricsNextCursor: metricsPagination.nextCursor,
		metricsLoadingMore: metricsPagination.isLoadingMore,
		metricsError,
		breakdownsError,
		metricsLoading,
		metricsRefreshing: false,
		loadMoreMetrics,
		resetMetricsPagination,
		mutateMetrics: async () => {
			resetMetricsPagination();
		},
		insights,
		algorithmic,
		insightsError,
		insightsLoading,
		insightsRefreshing,
		mutateInsights
	};
}
/** GA import can be slow; still cap client wait so UI never spins forever. */
var GOOGLE_ANALYTICS_SYNC_CLIENT_TIMEOUT_MS = 18e4;
async function syncGoogleAnalytics(params) {
	const searchParams = new URLSearchParams({ days: String(params.periodDays) });
	if (params.clientId) searchParams.set("clientId", params.clientId);
	return await apiFetch(`/api/analytics/google-analytics/sync?${searchParams.toString()}`, {
		method: "POST",
		credentials: "same-origin",
		body: JSON.stringify({}),
		timeoutMs: GOOGLE_ANALYTICS_SYNC_CLIENT_TIMEOUT_MS
	});
}
/**
* Hook for syncing Google Analytics data using TanStack Query mutation
* Automatically invalidates analytics queries on success
*/
function useGoogleAnalyticsSync() {
	const queryClient = useQueryClient();
	return useMutation$1({
		mutationFn: syncGoogleAnalytics,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["analytics"] });
			queryClient.invalidateQueries({ queryKey: ["metrics"] });
		}
	});
}
/** OAuth start can wait on auth + cold API; keep above default fetch assumptions. */
var GOOGLE_ANALYTICS_OAUTH_TIMEOUT_MS = 6e4;
var PREVIEW_GA_ACCOUNT_LABEL = "Preview Google Analytics";
var PREVIEW_GA_PROPERTY_ID = "preview-google-analytics-property";
function getPreviewGoogleAnalyticsStatus() {
	const latestMetricDate = getPreviewAnalyticsMetrics().reduce((latest, metric) => {
		if (metric.providerId !== "google-analytics") return latest;
		const value = (/* @__PURE__ */ new Date(`${metric.date}T12:00:00Z`)).getTime();
		if (!Number.isFinite(value)) return latest;
		return latest === null || value > latest ? value : latest;
	}, null);
	return {
		accountLabel: PREVIEW_GA_ACCOUNT_LABEL,
		propertyId: PREVIEW_GA_PROPERTY_ID,
		lastSyncStatus: "success",
		lastSyncMessage: null,
		lastSyncedAtMs: latestMetricDate,
		lastSyncRequestedAtMs: latestMetricDate
	};
}
function formatRelativeSyncTime(valueMs) {
	if (!valueMs) return "Never";
	const deltaMs = Date.now() - valueMs;
	const minutes = Math.floor(deltaMs / (60 * 1e3));
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ago`;
	return new Date(valueMs).toLocaleDateString();
}
function mapOauthErrorToMessage(code, fallback) {
	if (fallback && fallback.trim().length > 0) return fallback;
	switch (code) {
		case "missing_code": return "Google did not return an authorization code. Please try connecting again.";
		case "invalid_state": return "The OAuth session expired or became invalid. Please retry the connection flow.";
		case "config_error": return "Google Analytics OAuth is not configured correctly. Please check environment variables.";
		case "oauth_failed": return "Google Analytics OAuth failed before setup could complete. Please try again.";
		case "google_analytics_error": return "Google returned an OAuth error. Please retry and grant all requested permissions.";
		default: return "Unable to connect Google Analytics. Please try again.";
	}
}
function useAnalyticsPageController() {
	const { selectedClientId } = useClientContext();
	const { isPreviewMode } = usePreview();
	const { user } = useAuth();
	const { replace } = useRouter$1();
	const pathname = usePathname();
	const urlSearchParams = useSearchParams();
	const preferenceCurrency = useCurrency();
	const previewGoogleAnalyticsStatus = getPreviewGoogleAnalyticsStatus();
	const [dateRange, setDateRange] = (0, import_react.useState)(() => {
		const end = endOfDay(/* @__PURE__ */ new Date());
		return {
			start: startOfDay(/* @__PURE__ */ new Date(Date.now() - 696 * 60 * 60 * 1e3)),
			end
		};
	});
	const [periodDays, setPeriodDays] = (0, import_react.useState)(30);
	const [gaConnected, setGaConnected] = (0, import_react.useState)(isPreviewMode);
	const [gaAccountLabel, setGaAccountLabel] = (0, import_react.useState)(isPreviewMode ? previewGoogleAnalyticsStatus.accountLabel : null);
	const [gaPropertyId, setGaPropertyId] = (0, import_react.useState)(isPreviewMode ? previewGoogleAnalyticsStatus.propertyId : null);
	const [gaLastSyncStatus, setGaLastSyncStatus] = (0, import_react.useState)(isPreviewMode ? previewGoogleAnalyticsStatus.lastSyncStatus : null);
	const [gaLastSyncMessage, setGaLastSyncMessage] = (0, import_react.useState)(null);
	const [gaLastSyncedAtMs, setGaLastSyncedAtMs] = (0, import_react.useState)(isPreviewMode ? previewGoogleAnalyticsStatus.lastSyncedAtMs : null);
	const [gaLastSyncRequestedAtMs, setGaLastSyncRequestedAtMs] = (0, import_react.useState)(isPreviewMode ? previewGoogleAnalyticsStatus.lastSyncRequestedAtMs : null);
	const [gaIntegrationCurrency, setGaIntegrationCurrency] = (0, import_react.useState)(isPreviewMode ? "GBP" : null);
	const [gaSetupFlow, setGaSetupFlow] = (0, import_react.useState)({
		loading: false,
		setupDialogOpen: false,
		setupMessage: null
	});
	const gaLoading = gaSetupFlow.loading;
	const gaSetupDialogOpen = gaSetupFlow.setupDialogOpen;
	const gaSetupMessage = gaSetupFlow.setupMessage;
	const setGaLoading = (loading) => {
		setGaSetupFlow((prev) => ({
			...prev,
			loading
		}));
	};
	const setGaSetupDialogOpen = (setupDialogOpen) => {
		setGaSetupFlow((prev) => ({
			...prev,
			setupDialogOpen
		}));
	};
	const setGaSetupMessage = (setupMessage) => {
		setGaSetupFlow((prev) => ({
			...prev,
			setupMessage
		}));
	};
	const [gaProperties, setGaProperties] = (0, import_react.useState)([]);
	const [gaSelectedPropertyId, setGaSelectedPropertyId] = (0, import_react.useState)("");
	const [gaLoadingProperties, setGaLoadingProperties] = (0, import_react.useState)(false);
	const [gaInitializingProperty, setGaInitializingProperty] = (0, import_react.useState)(false);
	const [gaDisconnectDialogOpen, setGaDisconnectDialogOpen] = (0, import_react.useState)(false);
	const [gaDisconnecting, setGaDisconnecting] = (0, import_react.useState)(false);
	const googleAnalyticsSyncMutation = useGoogleAnalyticsSync();
	const listGoogleAnalyticsProperties = useAction(analyticsIntegrationsApi.listGoogleAnalyticsProperties);
	const initializeGoogleAnalyticsProperty = useAction(analyticsIntegrationsApi.initializeGoogleAnalyticsProperty);
	const deleteGoogleAnalyticsIntegrationMutation = useMutation(analyticsIntegrationsApi.deleteGoogleAnalyticsIntegration);
	const deleteGoogleAnalyticsSyncJobsMutation = useMutation(analyticsIntegrationsApi.deleteGoogleAnalyticsSyncJobs);
	const deleteGoogleAnalyticsMetricsMutation = useMutation(analyticsIntegrationsApi.deleteGoogleAnalyticsMetrics);
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const googleAnalyticsStatus = useQuery(analyticsIntegrationsApi.getGoogleAnalyticsStatus, isPreviewMode || !workspaceId || !user?.id ? "skip" : {
		workspaceId,
		clientId: selectedClientId ?? null
	});
	const gaStatusQueryError = useConvexQueryError({
		data: googleAnalyticsStatus,
		skipped: isPreviewMode || !workspaceId || !user?.id,
		loading: false,
		fallbackMessage: "Unable to load Google Analytics connection status."
	});
	const handleDateRangeChange = (range, days) => {
		setDateRange(range);
		setPeriodDays(days ?? differenceInDays(range.end, range.start) + 1);
	};
	const refreshGoogleAnalyticsStatus = (0, import_react.useEffectEvent)(async () => {
		if (isPreviewMode) {
			setGaConnected(true);
			setGaAccountLabel(previewGoogleAnalyticsStatus.accountLabel);
			setGaPropertyId(previewGoogleAnalyticsStatus.propertyId);
			setGaLastSyncStatus(previewGoogleAnalyticsStatus.lastSyncStatus);
			setGaLastSyncMessage(previewGoogleAnalyticsStatus.lastSyncMessage);
			setGaLastSyncedAtMs(previewGoogleAnalyticsStatus.lastSyncedAtMs);
			setGaLastSyncRequestedAtMs(previewGoogleAnalyticsStatus.lastSyncRequestedAtMs);
			return;
		}
		const ga = googleAnalyticsStatus ?? null;
		const linkedAtMs = typeof ga?.linkedAtMs === "number" ? ga.linkedAtMs : null;
		const accountName = typeof ga?.accountName === "string" ? ga.accountName : null;
		const accountId = typeof ga?.accountId === "string" ? ga.accountId : null;
		const integrationCurrency = typeof ga?.currency === "string" ? ga.currency : null;
		const syncStatus = typeof ga?.lastSyncStatus === "string" ? ga.lastSyncStatus : null;
		const syncMessage = typeof ga?.lastSyncMessage === "string" ? ga.lastSyncMessage : null;
		const lastSynced = typeof ga?.lastSyncedAtMs === "number" ? ga.lastSyncedAtMs : null;
		const lastRequested = typeof ga?.lastSyncRequestedAtMs === "number" ? ga.lastSyncRequestedAtMs : null;
		setGaConnected(Boolean(linkedAtMs));
		setGaAccountLabel(accountName ?? accountId ?? null);
		setGaPropertyId(accountId);
		setGaIntegrationCurrency(integrationCurrency);
		setGaLastSyncStatus(syncStatus);
		setGaLastSyncMessage(syncMessage);
		setGaLastSyncedAtMs(lastSynced);
		setGaLastSyncRequestedAtMs(lastRequested);
	});
	(0, import_react.useEffect)(() => {
		const frame = requestAnimationFrame(() => {
			refreshGoogleAnalyticsStatus();
		});
		return () => cancelAnimationFrame(frame);
	}, [googleAnalyticsStatus, isPreviewMode]);
	const gaNeedsPropertySelection = gaConnected && !gaPropertyId;
	const loadGoogleAnalyticsPropertyOptions = (0, import_react.useEffectEvent)(async (clientIdOverride) => {
		if (!workspaceId) return Promise.reject(/* @__PURE__ */ new Error("Workspace context is required"));
		requestAnimationFrame(() => {
			setGaLoadingProperties(true);
		});
		return listGoogleAnalyticsProperties({
			workspaceId,
			clientId: clientIdOverride ?? selectedClientId ?? null
		}).then((payload) => {
			const options = Array.isArray(payload) ? payload : [];
			setGaProperties(options);
			setGaSelectedPropertyId((current) => {
				if (current && options.some((option) => option.id === current)) return current;
				return options[0]?.id ?? "";
			});
			return options;
		}).catch((error) => {
			setGaProperties([]);
			setGaSelectedPropertyId("");
			const mappedMessage = mapGoogleAnalyticsIntegrationError(error);
			if (isIntegrationScopeAppError(error)) setGaSetupMessage(mappedMessage);
			return Promise.reject(new Error(mappedMessage));
		}).finally(() => {
			setGaLoadingProperties(false);
		});
	});
	(0, import_react.useEffect)(() => {
		const oauthSuccess = urlSearchParams.get("oauth_success") === "true";
		const oauthError = urlSearchParams.get("oauth_error");
		const provider = urlSearchParams.get("provider");
		const message = urlSearchParams.get("message");
		if (!oauthSuccess && !oauthError) return;
		if (provider !== "google-analytics") return;
		const cleanedParams = new URLSearchParams(urlSearchParams.toString());
		cleanedParams.delete("oauth_success");
		cleanedParams.delete("oauth_error");
		cleanedParams.delete("provider");
		cleanedParams.delete("message");
		const nextQuery = cleanedParams.toString();
		replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
		requestAnimationFrame(() => {
			setGaSetupFlow((prev) => ({
				...prev,
				loading: false,
				setupMessage: oauthSuccess ? null : prev.setupMessage,
				setupDialogOpen: oauthSuccess ? true : prev.setupDialogOpen
			}));
		});
		if (oauthSuccess) {
			notifySuccess({
				title: "Google Analytics connected",
				message: "Select a property to finish setup."
			});
			loadGoogleAnalyticsPropertyOptions().catch((error) => {
				const mappedMessage = mapGoogleAnalyticsIntegrationError(error);
				requestAnimationFrame(() => {
					setGaSetupFlow((prev) => ({
						...prev,
						setupMessage: mappedMessage
					}));
				});
				notifyFailure({
					title: "Property load failed",
					message: mappedMessage
				});
			});
		} else notifyFailure({
			title: "Google Analytics connection failed",
			message: mapOauthErrorToMessage(oauthError, message)
		});
	}, [
		loadGoogleAnalyticsPropertyOptions,
		pathname,
		replace,
		urlSearchParams
	]);
	const gaPropertyAutoLoadRef = (0, import_react.useRef)(false);
	const autoLoadGoogleAnalyticsProperties = (0, import_react.useEffectEvent)(() => {
		if (!gaNeedsPropertySelection || isPreviewMode) {
			gaPropertyAutoLoadRef.current = false;
			return;
		}
		if (!gaSetupDialogOpen) setGaSetupFlow((prev) => ({
			...prev,
			setupDialogOpen: true
		}));
		if (gaLoadingProperties || gaProperties.length > 0 || gaPropertyAutoLoadRef.current) return;
		gaPropertyAutoLoadRef.current = true;
		loadGoogleAnalyticsPropertyOptions().catch((error) => {
			const message = mapGoogleAnalyticsIntegrationError(error);
			setGaSetupFlow((prev) => ({
				...prev,
				setupMessage: message
			}));
		});
	});
	(0, import_react.useEffect)(() => {
		autoLoadGoogleAnalyticsProperties();
	}, [
		gaLoadingProperties,
		gaNeedsPropertySelection,
		gaProperties.length,
		gaSetupDialogOpen,
		isPreviewMode
	]);
	const analyticsStartDate = format(dateRange.start, "yyyy-MM-dd");
	const analyticsEndDate = format(dateRange.end, "yyyy-MM-dd");
	const { metricsData, breakdowns, breakdownsError, metricsNextCursor, metricsLoadingMore, metricsError, metricsLoading, metricsRefreshing, loadMoreMetrics, resetMetricsPagination, mutateMetrics, insights, algorithmic, insightsError, insightsLoading, insightsRefreshing, mutateInsights } = useAnalyticsData(null, periodDays, selectedClientId ?? null, isPreviewMode, user?.agencyId, {
		providerIds: ["google-analytics"],
		includeInsights: true,
		startDate: analyticsStartDate,
		endDate: analyticsEndDate
	});
	const handleLoadMoreMetrics = () => {
		if (!metricsNextCursor) return;
		try {
			loadMoreMetrics();
		} catch (error) {
			logError(error, "AnalyticsPage:handleLoadMoreMetrics");
			notifyFailure({
				title: "Metrics pagination error",
				error
			});
		}
	};
	const metrics = metricsData;
	const selectedRangeDays = Math.max(differenceInDays(dateRange.end, dateRange.start) + 1, 1);
	const handleConnectGoogleAnalytics = async () => {
		if (isPreviewMode) {
			notifyInfo({
				title: "Preview mode",
				message: "Google Analytics connection is disabled in preview mode."
			});
			return;
		}
		if (typeof window === "undefined") return;
		setGaSetupMessage(null);
		setGaLoading(true);
		try {
			const search = new URLSearchParams({ redirect: `${window.location.pathname}${window.location.search}` });
			if (selectedClientId) search.set("clientId", selectedClientId);
			const payload = await apiFetch(search.toString().length > 0 ? `/api/integrations/google-analytics/oauth/start?${search.toString()}` : "/api/integrations/google-analytics/oauth/start", { timeoutMs: GOOGLE_ANALYTICS_OAUTH_TIMEOUT_MS });
			if (typeof payload?.url !== "string" || payload.url.length === 0) throw new Error("Google Analytics OAuth did not return a URL.");
			window.location.href = payload.url;
		} catch (error) {
			const isTimeout = error instanceof ApiClientError && error.code === "REQUEST_TIMEOUT";
			if (!isTimeout) logError(error, "AnalyticsPage:handleConnectGoogleAnalytics");
			notifyFailure({
				title: "Unable to connect Google Analytics",
				error,
				message: isTimeout ? "Request timed out while starting Google connection. Check your network and try again." : void 0
			});
			setGaLoading(false);
		}
	};
	const handleSyncGoogleAnalytics = () => {
		if (isPreviewMode) {
			notifyInfo({
				title: "Preview mode",
				message: "Google Analytics sync is disabled in preview mode."
			});
			return;
		}
		if (!gaConnected) {
			notifyFailure({
				title: "Not connected",
				message: "Connect Google Analytics before running a sync."
			});
			return;
		}
		if (gaNeedsPropertySelection) {
			setGaSetupDialogOpen(true);
			notifyFailure({
				title: "Property required",
				message: "Select a Google Analytics property before syncing."
			});
			return;
		}
		googleAnalyticsSyncMutation.mutateAsync({
			periodDays,
			clientId: selectedClientId
		}).then((result) => {
			const propertyName = result?.propertyName;
			const writtenDays = result?.written ?? 0;
			notifySuccess({
				title: "Google Analytics synced",
				message: propertyName ? `Imported ${writtenDays} day(s) from ${propertyName}.` : `Imported ${writtenDays} day(s).`
			});
			return refreshGoogleAnalyticsStatus();
		}).then(() => mutateMetrics()).catch((error) => {
			const isTimeout = error instanceof ApiClientError && error.code === "REQUEST_TIMEOUT";
			if (!isTimeout) logError(error, "AnalyticsPage:handleSyncGoogleAnalytics");
			notifyFailure({
				title: "Sync failed",
				error,
				message: isTimeout ? "Google Analytics sync timed out. Try a shorter date range or retry." : void 0
			});
		});
	};
	const handleOpenGoogleAnalyticsSetup = () => {
		setGaSetupDialogOpen(true);
		setGaSetupMessage(null);
		loadGoogleAnalyticsPropertyOptions().catch((error) => {
			const message = mapGoogleAnalyticsIntegrationError(error);
			setGaSetupMessage(message);
			notifyFailure({
				title: "Property load failed",
				message
			});
		});
	};
	const handleFinalizeGoogleAnalyticsSetup = () => {
		if (isPreviewMode) return;
		if (!workspaceId) {
			notifyFailure({
				title: "Setup failed",
				message: "Workspace context is required."
			});
			return;
		}
		if (!gaSelectedPropertyId) {
			setGaSetupMessage("Please select a Google Analytics property to continue.");
			return;
		}
		setGaInitializingProperty(true);
		setGaSetupMessage(null);
		initializeGoogleAnalyticsProperty({
			workspaceId,
			clientId: selectedClientId === void 0 ? null : selectedClientId,
			accountId: gaSelectedPropertyId
		}).then((rawPayload) => {
			const payload = rawPayload;
			notifySuccess({
				title: "Google Analytics setup complete",
				message: typeof payload.accountName === "string" && payload.accountName.length > 0 ? `Using property ${payload.accountName}.` : "Property linked successfully."
			});
			setGaSetupDialogOpen(false);
			return refreshGoogleAnalyticsStatus().then(() => mutateMetrics());
		}).catch((error) => {
			const message = mapGoogleAnalyticsIntegrationError(error);
			setGaSetupMessage(message);
			notifyFailure({
				title: "Setup failed",
				message
			});
		}).finally(() => {
			setGaInitializingProperty(false);
		});
	};
	const handleDisconnectGoogleAnalytics = (options) => {
		if (isPreviewMode) return Promise.resolve();
		if (!workspaceId) {
			notifyFailure({
				title: "Disconnect failed",
				message: "Workspace context is required."
			});
			return Promise.resolve();
		}
		setGaDisconnecting(true);
		const effectiveClientId = selectedClientId === void 0 ? null : selectedClientId;
		return (options.clearHistoricalData ? deleteGoogleAnalyticsMetricsMutation({
			workspaceId,
			clientId: effectiveClientId
		}).then((result) => {
			const typedResult = result;
			return typeof typedResult.deleted === "number" ? typedResult.deleted : 0;
		}) : Promise.resolve(0)).then((deletedMetrics) => {
			return Promise.all([deleteGoogleAnalyticsSyncJobsMutation({
				workspaceId,
				clientId: effectiveClientId
			}), deleteGoogleAnalyticsIntegrationMutation({
				workspaceId,
				clientId: effectiveClientId
			})]).then(() => deletedMetrics);
		}).then((deletedMetrics) => {
			setGaSetupDialogOpen(false);
			setGaProperties([]);
			setGaSelectedPropertyId("");
			return refreshGoogleAnalyticsStatus().then(() => deletedMetrics);
		}).then((deletedMetrics) => {
			notifySuccess({
				title: "Google Analytics disconnected",
				message: options.clearHistoricalData ? `Disconnected and removed ${deletedMetrics} historical metric row(s).` : "Disconnected. Historical metrics were kept."
			});
		}).catch((error) => {
			logError(error, "AnalyticsPage:handleDisconnectGoogleAnalytics");
			notifyFailure({
				title: "Disconnect failed",
				error
			});
		}).finally(() => {
			setGaDisconnecting(false);
		});
	};
	const initialMetricsLoading = metricsLoading && metrics.length === 0;
	const initialInsightsLoading = insightsLoading && insights.length === 0 && algorithmic.length === 0;
	const filteredMetrics = (() => {
		if (!metrics.length) return [];
		const startMs = dateRange.start.getTime();
		const endMs = dateRange.end.getTime();
		return metrics.filter((metric) => {
			if (metric.providerId !== "google-analytics") return false;
			const metricDate = new Date(metric.date).getTime();
			return metricDate >= startMs && metricDate <= endMs;
		});
	})();
	const filteredBreakdowns = (() => {
		if (!breakdowns.length) return [];
		const startMs = dateRange.start.getTime();
		const endMs = dateRange.end.getTime();
		return breakdowns.filter((row) => {
			const rowDate = new Date(row.date).getTime();
			return rowDate >= startMs && rowDate <= endMs;
		});
	})();
	const aggregatedByDate = (() => {
		const map = /* @__PURE__ */ new Map();
		filteredMetrics.forEach((metric) => {
			const key = metric.date;
			if (!map.has(key)) map.set(key, {
				date: key,
				users: 0,
				sessions: 0,
				conversions: 0,
				revenue: 0
			});
			const entry = map.get(key);
			if (!entry) return;
			entry.users += metric.impressions;
			entry.sessions += metric.clicks;
			entry.conversions += metric.conversions;
			entry.revenue += metric.revenue ?? 0;
		});
		return Array.from(map.values()).toSorted((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
	})();
	const deliveryTotals = filteredMetrics.reduce((acc, metric) => {
		acc.users += metric.impressions;
		acc.sessions += metric.clicks;
		acc.conversions += metric.conversions;
		return acc;
	}, {
		users: 0,
		sessions: 0,
		conversions: 0
	});
	const moneyDisplay = buildAnalyticsMoneyDisplay(filteredMetrics, {
		integrationCurrency: gaIntegrationCurrency,
		preferenceCurrency
	});
	const previousPeriodMetrics = (() => {
		if (!metrics.length) return [];
		const previousEndMs = dateRange.start.getTime() - 1;
		const previousStartMs = previousEndMs - selectedRangeDays * 24 * 60 * 60 * 1e3 + 1;
		return metrics.filter((metric) => {
			if (metric.providerId !== "google-analytics") return false;
			const metricDate = new Date(metric.date).getTime();
			return metricDate >= previousStartMs && metricDate <= previousEndMs;
		});
	})();
	const previousDeliveryTotals = previousPeriodMetrics.reduce((acc, metric) => {
		acc.users += metric.impressions;
		acc.sessions += metric.clicks;
		acc.conversions += metric.conversions;
		return acc;
	}, {
		users: 0,
		sessions: 0,
		conversions: 0
	});
	const previousMoneyDisplay = buildAnalyticsMoneyDisplay(previousPeriodMetrics, {
		integrationCurrency: gaIntegrationCurrency,
		preferenceCurrency
	});
	const totals = {
		users: deliveryTotals.users,
		sessions: deliveryTotals.sessions,
		conversions: deliveryTotals.conversions,
		revenue: moneyDisplay.totalRevenue
	};
	const previousTotals = {
		users: previousDeliveryTotals.users,
		sessions: previousDeliveryTotals.sessions,
		conversions: previousDeliveryTotals.conversions,
		revenue: previousMoneyDisplay.totalRevenue
	};
	const conversionRate = totals.sessions > 0 ? totals.conversions / totals.sessions * 100 : 0;
	const avgUsersPerDay = totals.users / selectedRangeDays;
	const avgSessionsPerDay = totals.sessions / selectedRangeDays;
	const revenuePerSession = moneyDisplay.revenueComparable && totals.sessions > 0 && moneyDisplay.totalRevenue !== null ? moneyDisplay.totalRevenue / totals.sessions : null;
	const sessionsPerUser = totals.users > 0 ? totals.sessions / totals.users : 0;
	const hasGaData = filteredMetrics.length > 0;
	const isGaSelectedWithoutData = gaConnected && !hasGaData && !initialMetricsLoading;
	const gaStatusLabel = (() => {
		if (isPreviewMode) return "Preview dataset";
		if (!gaConnected) return "Not connected";
		if (gaNeedsPropertySelection) return "Property setup required";
		if (gaLastSyncStatus === "error") return "Last sync failed";
		if (gaLastSyncStatus === "pending") return "Sync queued";
		if (gaLastSyncStatus === "success") return "Synced";
		return "Connected";
	})();
	const gaLastSyncedLabel = formatRelativeSyncTime(gaLastSyncedAtMs);
	const gaLastRequestedLabel = formatRelativeSyncTime(gaLastSyncRequestedAtMs);
	const chartData = aggregatedByDate.map((entry) => ({
		...entry,
		conversionRate: entry.sessions > 0 ? entry.conversions / entry.sessions * 100 : 0
	}));
	const story = buildGoogleAnalyticsStory({
		currentTotals: totals,
		previousTotals,
		chartData,
		selectedRangeDays
	});
	const handleRefreshMetrics = () => {
		resetMetricsPagination();
		mutateMetrics();
	};
	const handleRefreshInsights = () => {
		mutateInsights();
	};
	return {
		algorithmic,
		avgSessionsPerDay,
		avgUsersPerDay,
		breakdowns: filteredBreakdowns,
		chartData,
		conversionRate,
		dateRange,
		displayCurrency: moneyDisplay.displayCurrency,
		filteredMetrics,
		formatRevenue: moneyDisplay.formatRevenue,
		financialComparability: moneyDisplay.financialTotals.comparability,
		gaAccountLabel,
		gaConnected,
		gaDisconnectDialogOpen,
		gaDisconnecting,
		gaInitializingProperty,
		gaLastRequestedLabel,
		gaLastSyncMessage,
		gaLastSyncStatus,
		gaLastSyncedLabel,
		gaLoading,
		gaLoadingProperties,
		gaNeedsPropertySelection,
		gaProperties,
		gaSelectedPropertyId,
		gaSetupDialogOpen,
		gaSetupMessage,
		gaStatusLabel,
		breakdownsError,
		gaStatusError: gaStatusQueryError ? new Error(gaStatusQueryError) : void 0,
		handleConnectGoogleAnalytics,
		handleDateRangeChange,
		handleDisconnectGoogleAnalytics,
		handleFinalizeGoogleAnalyticsSetup,
		handleLoadMoreMetrics,
		handleOpenGoogleAnalyticsSetup,
		handleRefreshInsights,
		handleRefreshMetrics,
		handleSyncGoogleAnalytics,
		initialInsightsLoading,
		initialMetricsLoading,
		insights,
		insightsError,
		insightsLoading,
		insightsRefreshing,
		isGaSelectedWithoutData,
		isPreviewMode,
		isSyncPending: googleAnalyticsSyncMutation.isPending,
		loadGoogleAnalyticsPropertyOptions,
		metricsError,
		metricsLoading,
		metricsLoadingMore,
		metricsNextCursor,
		metricsRefreshing,
		revenueComparable: moneyDisplay.revenueComparable,
		revenuePerSession,
		sessionsPerUser,
		setGaDisconnectDialogOpen,
		setGaSelectedPropertyId,
		setGaSetupDialogOpen,
		story,
		totals
	};
}
var AnalyticsPageContext = (0, import_react.createContext)(null);
function AnalyticsPageProvider({ children }) {
	const controller = useAnalyticsPageController();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsPageContext.Provider, {
		value: controller,
		children
	});
}
function useAnalyticsPageContext() {
	const context = (0, import_react.use)(AnalyticsPageContext);
	if (!context) throw new Error("useAnalyticsPageContext must be used within an AnalyticsPageProvider");
	return context;
}
function AnalyticsPageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardPageHero, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-72 max-w-full" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-36" })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full rounded-xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: DASHBOARD_THEME.stats.container,
				children: [
					"s1",
					"s2",
					"s3",
					"s4"
				].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 rounded-xl" }, key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
				children: [
					"c1",
					"c2",
					"c3",
					"c4"
				].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[340px] rounded-xl" }, key))
			})
		]
	});
}
var DIMENSION_META = {
	channel: {
		title: "Channel",
		description: "Default channel grouping for sessions in range.",
		icon: Radio
	},
	source: {
		title: "Source",
		description: "Session source for traffic in range.",
		icon: Share2
	},
	device: {
		title: "Device",
		description: "Device category mix for sessions in range.",
		icon: Monitor
	}
};
function aggregateBreakdown(rows, dimension) {
	const totals = /* @__PURE__ */ new Map();
	for (const row of rows) {
		if (row.dimension !== dimension) continue;
		const key = row.dimensionValue;
		const existing = totals.get(key) ?? {
			label: key,
			sessions: 0,
			users: 0,
			conversions: 0
		};
		existing.sessions += row.sessions;
		existing.users += row.users;
		existing.conversions += row.conversions;
		totals.set(key, existing);
	}
	const totalSessions = Array.from(totals.values()).reduce((sum, entry) => sum + entry.sessions, 0);
	return Array.from(totals.values()).sort((a, b) => b.sessions - a.sessions).slice(0, 6).map((entry) => ({
		...entry,
		share: totalSessions > 0 ? entry.sessions / totalSessions * 100 : 0
	}));
}
function BreakdownShareBar({ share }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-1.5 overflow-hidden rounded-full bg-muted",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full rounded-full bg-primary/80",
			style: { width: `${Math.max(share, 2)}%` }
		})
	});
}
function BreakdownCard({ dimension, rows }) {
	const meta = DIMENSION_META[dimension];
	const entries = aggregateBreakdown(rows, dimension);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: DASHBOARD_THEME.cards.base,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: DASHBOARD_THEME.cards.header,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(meta.icon, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-sm font-semibold text-foreground",
					children: meta.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "mt-1 text-xs text-muted-foreground",
					children: meta.description
				})] })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "space-y-3 pt-2",
			children: entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No breakdown data for this range yet."
			}) : entries.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate font-medium text-foreground",
							children: entry.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shrink-0 text-muted-foreground",
							children: [entry.share.toFixed(1), "%"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreakdownShareBar, { share: entry.share }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							entry.sessions.toLocaleString(),
							" sessions · ",
							entry.users.toLocaleString(),
							" users"
						]
					})
				]
			}, entry.label))
		})]
	});
}
function AnalyticsBreakdownSection({ breakdowns }) {
	if (!breakdowns?.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-sm font-semibold text-foreground",
			children: "Acquisition breakdown"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: "Channel, source, and device mix from Google Analytics for the selected date range."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-6 lg:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreakdownCard, {
					dimension: "channel",
					rows: breakdowns
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreakdownCard, {
					dimension: "source",
					rows: breakdowns
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreakdownCard, {
					dimension: "device",
					rows: breakdowns
				})
			]
		})]
	});
}
var PERIOD_OPTIONS = [
	{
		value: "7d",
		label: "Last 7 days",
		days: 7
	},
	{
		value: "14d",
		label: "Last 14 days",
		days: 14
	},
	{
		value: "30d",
		label: "Last 30 days",
		days: 30
	},
	{
		value: "90d",
		label: "Last 90 days",
		days: 90
	},
	{
		value: "custom",
		label: "Custom range",
		days: 0
	}
];
function getPresetRange(days) {
	const end = endOfDay(/* @__PURE__ */ new Date());
	return {
		start: startOfDay(subDays(end, days - 1)),
		end
	};
}
function formatDateRange(range) {
	return `${format(range.start, "MMM d")} – ${format(range.end, "MMM d, yyyy")}`;
}
function QuickPresetButton({ onSelect, preset }) {
	const onSelectPreset = () => {
		onSelect(preset.days);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "sm",
		className: "justify-start font-normal",
		onClick: onSelectPreset,
		children: preset.label
	});
}
function AnalyticsDateRangePicker({ value, onChange, className }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const maxDisabledDate = /* @__PURE__ */ new Date();
	const minDisabledDate = /* @__PURE__ */ new Date(maxDisabledDate.getTime() - 365 * 24 * 60 * 60 * 1e3);
	const currentDays = differenceInDays(value.end, value.start) + 1;
	const currentPreset = (() => {
		if (currentDays === 7) return "7d";
		if (currentDays === 14) return "14d";
		if (currentDays === 30) return "30d";
		if (currentDays === 90) return "90d";
		return "custom";
	})();
	const dateRange = {
		from: value.start,
		to: value.end
	};
	const handleSelect = (range) => {
		if (range?.from && range?.to) {
			const newRange = {
				start: startOfDay(range.from),
				end: endOfDay(range.to)
			};
			onChange(newRange, differenceInDays(newRange.end, newRange.start) + 1);
		}
	};
	const handlePresetSelect = (period) => {
		if (period === "custom") return;
		const option = PERIOD_OPTIONS.find((opt) => opt.value === period);
		if (option) {
			onChange(getPresetRange(option.days), option.days);
			setOpen(false);
		}
	};
	const handleClearCustom = () => {
		onChange(getPresetRange(30), 30);
	};
	const handlePresetChange = (event) => {
		handlePresetSelect(event.target.value);
	};
	const handleClearClick = (event) => {
		event.stopPropagation();
		handleClearCustom();
	};
	const handleQuickPresetClick = (days) => {
		onChange(getPresetRange(days), days);
		setOpen(false);
	};
	const handleDisabledDate = (date) => date > maxDisabledDate || date < minDisabledDate;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-wrap items-center gap-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: currentPreset,
				onChange: handlePresetChange,
				"aria-label": "Analytics date range",
				className: cn(DASHBOARD_THEME.inputs.base, "h-9 min-w-[9.5rem] cursor-pointer appearance-none py-2 pr-9 text-sm font-medium text-foreground"),
				children: PERIOD_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: option.value,
					children: option.label
				}, option.value))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" })]
		}), currentPreset === "custom" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open,
			onOpenChange: setOpen,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					className: cn("h-9 justify-start text-left font-normal", !value && "text-muted-foreground"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "mr-2 size-4" }),
						formatDateRange(value),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "ml-2 size-3 opacity-50 hover:opacity-100",
							onClick: handleClearClick
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
				className: "w-auto p-0",
				align: "end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1 border-b p-3 sm:border-b-0 sm:border-r",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
							children: "Quick select"
						}), PERIOD_OPTIONS.flatMap((preset) => preset.value !== "custom" ? [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickPresetButton, {
							preset,
							onSelect: handleQuickPresetClick
						}, preset.days)] : [])]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
							initialFocus: true,
							mode: "range",
							defaultMonth: dateRange.from,
							selected: dateRange,
							onSelect: handleSelect,
							numberOfMonths: 2,
							disabled: handleDisabledDate
						})
					})]
				})
			})]
		}) : null]
	});
}
function formatDeltaLabel$1(deltaPercent, direction) {
	if (direction === "new") return "New in range";
	if (deltaPercent == null) return "No prior data";
	return `${deltaPercent > 0 ? "+" : ""}${deltaPercent.toFixed(1)}% vs previous`;
}
function formatDayLabel(value) {
	if (!value) return "Not enough data";
	return new Date(value).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric"
	});
}
var HIGHLIGHT_CARD = "rounded-lg border border-border/60 bg-muted/30 p-4";
var HIGHLIGHT_LABEL = "mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground";
function AnalyticsDeepDiveSection({ story, formatRevenue }) {
	const momentumVariant = story.momentum === "up" ? "success" : story.momentum === "down" ? "warning" : "secondary";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: DASHBOARD_THEME.cards.base,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: DASHBOARD_THEME.cards.header,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-semibold text-foreground",
						children: "Performance context"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "mt-1 text-sm text-muted-foreground",
						children: "How this property behaved over the selected range."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: momentumVariant,
						children: story.momentum === "up" ? "Momentum up" : story.momentum === "down" ? "Momentum mixed" : "Momentum steady"
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "grid gap-4 pt-2 md:grid-cols-2",
				children: [
					{
						key: "users",
						label: "Users",
						icon: Users,
						delta: story.deltas.users
					},
					{
						key: "sessions",
						label: "Sessions",
						icon: Activity,
						delta: story.deltas.sessions
					},
					{
						key: "conversions",
						label: "Conversions",
						icon: TrendingUp,
						delta: story.deltas.conversions
					},
					{
						key: "revenue",
						label: "Revenue",
						icon: DollarSign,
						delta: story.deltas.revenue
					}
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: HIGHLIGHT_CARD,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: HIGHLIGHT_LABEL,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-3.5" }), item.label]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-foreground",
							children: formatDeltaLabel$1(item.delta.deltaPercent, item.delta.direction)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: [
								"Previous range:",
								" ",
								item.key === "revenue" ? formatRevenue(item.delta.previous) : item.delta.previous.toLocaleString()
							]
						})
					]
				}, item.key))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: DASHBOARD_THEME.cards.base,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: DASHBOARD_THEME.cards.header,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-sm font-semibold text-foreground",
					children: "Highlights"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Best days and data coverage for this Google Analytics property."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: HIGHLIGHT_CARD,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: HIGHLIGHT_LABEL,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarRange, { className: "size-3.5" }), "Coverage"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-lg font-semibold text-foreground",
									children: [Math.round(story.coverageRatio * 100), "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [story.activeDays, " active day(s) in range"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: HIGHLIGHT_CARD,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: HIGHLIGHT_LABEL,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5" }), "Peak sessions"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-lg font-semibold text-foreground",
									children: story.topSessionsDay?.sessions.toLocaleString() ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: formatDayLabel(story.topSessionsDay?.date)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: HIGHLIGHT_CARD,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: HIGHLIGHT_LABEL,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), "Peak revenue"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-lg font-semibold text-foreground",
									children: story.topRevenueDay ? formatRevenue(story.topRevenueDay.revenue) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: formatDayLabel(story.topRevenueDay?.date)
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: HIGHLIGHT_CARD,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: HIGHLIGHT_LABEL,
							children: "Top conversion day"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-semibold text-foreground",
							children: [
								story.topConversionDay?.conversions.toLocaleString() ?? "—",
								" conversions on",
								" ",
								formatDayLabel(story.topConversionDay?.date)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: "Use this day as a reference when comparing landing pages, campaigns, or acquisition sources."
						})
					]
				})]
			})]
		})]
	});
}
function useAnalyticsExport(metrics) {
	const exportData = metrics.map((metric) => {
		const spend = metric.spend ?? 0;
		const revenue = metric.revenue ?? 0;
		const clicks = metric.clicks ?? 0;
		const impressions = metric.impressions ?? 0;
		const conversions = metric.conversions ?? 0;
		return {
			date: metric.date,
			platform: metric.providerId,
			spend,
			impressions,
			clicks,
			conversions,
			revenue,
			roas: spend > 0 ? revenue / spend : 0,
			cpc: clicks > 0 ? spend / clicks : 0,
			ctr: impressions > 0 ? clicks / impressions * 100 : 0,
			convRate: clicks > 0 ? conversions / clicks * 100 : 0
		};
	});
	const exportToSpreadsheet = async (filename) => {
		if (exportData.length === 0) throw new Error("No data to export");
		const headers = [
			"Date",
			"Platform",
			"Spend",
			"Impressions",
			"Clicks",
			"Conversions",
			"Revenue",
			"ROAS",
			"CPC",
			"CTR (%)",
			"Conv Rate (%)"
		];
		const rows = exportData.map((row) => [
			row.date,
			row.platform,
			row.spend.toFixed(2),
			row.impressions.toLocaleString(),
			row.clicks.toLocaleString(),
			row.conversions.toLocaleString(),
			row.revenue.toFixed(2),
			row.roas.toFixed(2),
			row.cpc.toFixed(2),
			row.ctr.toFixed(2),
			row.convRate.toFixed(2)
		]);
		await (async () => {
			const { exportCohortsSpreadsheetRows } = await import("./cohorts-spreadsheet-oHwGWk0s.mjs").then((n) => n.n);
			await exportCohortsSpreadsheetRows({
				filename: filename || `analytics-export-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`,
				title: "Analytics export",
				subtitle: `${exportData.length} metric row${exportData.length === 1 ? "" : "s"}`,
				sheetName: "Analytics",
				headers,
				rows,
				charts: buildAnalyticsExportCharts(exportData)
			});
		})();
	};
	const exportToJSON = (filename) => {
		if (exportData.length === 0) throw new Error("No data to export");
		const jsonContent = JSON.stringify(exportData, null, 2);
		const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", filename || `analytics-export-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`);
		link.style.display = "none";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};
	return {
		exportData,
		exportToSpreadsheet,
		/** @deprecated Use exportToSpreadsheet */
		exportToCSV: exportToSpreadsheet,
		exportToJSON,
		canExport: exportData.length > 0
	};
}
function AnalyticsExportButton({ metrics, disabled }) {
	const { exportToSpreadsheet, exportToJSON, canExport } = useAnalyticsExport(metrics);
	const [isExporting, setIsExporting] = (0, import_react.useState)(false);
	const exportTimeoutRef = (0, import_react.useRef)(void 0);
	const handleExport = async (format) => {
		if (!canExport || isExporting) return;
		setIsExporting(true);
		if (exportTimeoutRef.current) clearTimeout(exportTimeoutRef.current);
		try {
			if (format === "excel") await exportToSpreadsheet();
			else exportToJSON();
			notifySuccess({
				title: "Export successful",
				message: `Your data has been exported as ${format === "excel" ? "Excel" : "JSON"}.`
			});
			exportTimeoutRef.current = setTimeout(() => {
				setIsExporting(false);
			}, 1e3);
		} catch (error) {
			logError(error, "analytics-export-button:handleExport");
			setIsExporting(false);
			notifyFailure({
				title: "Export failed",
				error,
				fallbackMessage: "There was a problem exporting your data. Please try again."
			});
		}
	};
	const handleExportExcel = () => {
		handleExport("excel");
	};
	const handleExportJson = () => {
		handleExport("json");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			disabled: disabled || !canExport || isExporting,
			className: "gap-2",
			children: [isExporting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export"]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onClick: handleExportExcel,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglExcelIcon, { className: "mr-2 size-4" }), "Export as Excel"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onClick: handleExportJson,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 size-4" }), "Export as JSON"]
		})]
	})] });
}
var PROVIDER_LABELS = {
	google: "Google Ads",
	"google-analytics": "Google Analytics",
	facebook: "Meta Ads",
	linkedin: "LinkedIn Ads",
	tiktok: "TikTok Ads"
};
function formatInsightProviderLabel(providerId) {
	if (providerId === "global") return "Overall property";
	if (providerId === "google_vs_facebook") return "Cross-platform comparison";
	return PROVIDER_LABELS[providerId] ?? providerId;
}
var INSIGHT_MARKDOWN_COMPONENTS = {
	p: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "leading-relaxed",
		children
	}),
	ul: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "ml-5 list-disc space-y-1.5",
		children
	}),
	ol: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "ml-5 list-decimal space-y-1.5",
		children
	}),
	li: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
		className: "leading-relaxed",
		children
	}),
	strong: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
		className: "font-semibold text-foreground",
		children
	}),
	h1: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
		className: "text-sm font-semibold text-foreground",
		children
	}),
	h2: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
		className: "text-sm font-semibold text-foreground",
		children
	}),
	h3: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
		className: "text-sm font-semibold text-foreground",
		children
	}),
	code: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
		className: "rounded bg-muted px-1 py-0.5 text-[0.9em] text-foreground",
		children
	})
};
function InsightMarkdown({ content }) {
	const normalized = normalizeInsightMarkdown(content);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, {
		remarkPlugins: [remarkGfm],
		className: "space-y-3 text-sm text-muted-foreground",
		components: INSIGHT_MARKDOWN_COMPONENTS,
		skipHtml: true,
		children: normalized
	});
}
function suggestionLevelClasses(level) {
	if (level === "success") return "border-success/20 bg-success/5";
	if (level === "warning") return "border-warning/20 bg-warning/5";
	if (level === "critical") return "border-destructive/20 bg-destructive/5";
	return "border-border/60 bg-muted/30";
}
function suggestionIconClasses(level) {
	if (level === "success") return "bg-success/10 text-success";
	if (level === "warning") return "bg-warning/10 text-warning";
	if (level === "critical") return "bg-destructive/10 text-destructive";
	return "bg-accent/10 text-primary";
}
function AnalyticsInsightsSection({ insights, algorithmic, insightsError, insightsLoading, insightsRefreshing, initialInsightsLoading, onRefreshInsights }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: DASHBOARD_THEME.cards.base,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: DASHBOARD_THEME.cards.header,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: getIconContainerClasses("small"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-semibold text-foreground",
						children: "Recommended next actions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-sm text-muted-foreground",
						children: "Rule-based observations from your synced analytics performance."
					})] })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: initialInsightsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: ["algo-skeleton-1", "algo-skeleton-2"].map((slotKey) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full rounded-lg" }, slotKey))
			}) : algorithmic.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoInsightsData, { className: "rounded-lg border border-dashed border-border/60" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: algorithmic.flatMap((group) => group.suggestions.map((suggestion) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("rounded-lg border p-4 shadow-sm", suggestionLevelClasses(suggestion.level)),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: cn("flex size-7 items-center justify-center rounded-md", suggestionIconClasses(suggestion.level)),
										children: [
											suggestion.level === "success" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }),
											suggestion.level === "warning" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3.5" }),
											suggestion.level === "critical" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3.5" }),
											suggestion.level === "info" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-3.5" })
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-medium text-muted-foreground",
										children: formatInsightProviderLabel(group.providerId)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "text-sm font-semibold text-foreground",
									children: suggestion.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: suggestion.message
								})
							]
						}), suggestion.score ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex size-10 shrink-0 flex-col items-center justify-center rounded-lg border border-border/60 bg-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-primary leading-none",
								children: suggestion.score
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-muted-foreground",
								children: "Score"
							})]
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center gap-2 rounded-lg border border-border/60 bg-card/80 p-3 text-sm text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "line-clamp-2",
							children: suggestion.suggestion
						})]
					})]
				}, `${group.providerId}-${suggestion.level}-${suggestion.title}`)))
			}) })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: DASHBOARD_THEME.cards.base,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: DASHBOARD_THEME.cards.header,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-semibold text-foreground",
						children: "AI insight brief"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Narrative analysis from synced users, sessions, conversions, and revenue."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: onRefreshInsights,
						disabled: insightsLoading || insightsRefreshing,
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-3.5", insightsRefreshing && "animate-spin") }), "Refresh"]
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [insightsError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					variant: "destructive",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Insight generation failed" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: insightsError.message })
					]
				}) : null, initialInsightsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4",
					children: [
						"insight-skeleton-1",
						"insight-skeleton-2",
						"insight-skeleton-3"
					].map((slotKey) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border/60 bg-muted/30 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-24 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-4 h-16 w-full rounded-lg" })]
					}, slotKey))
				}) : insights.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoIntegrationConnected, {
					platform: "analytics property",
					className: "rounded-lg border border-dashed border-border/60"
				}) : insights.map((insight) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border/60 bg-muted/30 p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3.5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatInsightProviderLabel(insight.providerId) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: getBadgeClasses("secondary"),
								children: "Brief"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightMarkdown, { content: insight.summary })]
				}, insight.providerId))]
			})]
		})]
	});
}
function SecondaryMetric({ label, tooltip, value, isLoading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1 border-border/60 px-1 sm:border-l sm:px-4 first:sm:border-l-0 first:sm:pl-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: DASHBOARD_THEME.stats.label,
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricHint, {
				description: tooltip,
				label: `About ${label}`
			})]
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-16 rounded-md" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-lg font-semibold tracking-tight text-foreground",
			children: value
		})]
	});
}
function AnalyticsMetricCards({ avgUsersPerDay, avgSessionsPerDay, revenuePerSession, sessionsPerUser, formatRevenue, isLoading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "border border-border/60 bg-muted/20 shadow-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "grid grid-cols-2 gap-6 py-5 sm:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecondaryMetric, {
					label: "Avg users / day",
					tooltip: "Total users divided by the number of days in your selected range.",
					value: avgUsersPerDay.toFixed(1),
					isLoading
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecondaryMetric, {
					label: "Avg sessions / day",
					tooltip: "Total sessions divided by days in range — useful for spotting steady traffic vs spikes.",
					value: avgSessionsPerDay.toFixed(1),
					isLoading
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecondaryMetric, {
					label: "Revenue / session",
					tooltip: "Average revenue earned per session across the selected period.",
					value: revenuePerSession === null ? "—" : formatRevenue(revenuePerSession),
					isLoading
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecondaryMetric, {
					label: "Sessions / user",
					tooltip: "How often each user returned on average. Values above 1 indicate repeat visits.",
					value: `${sessionsPerUser.toFixed(2)}×`,
					isLoading
				})
			]
		})
	});
}
function formatDeltaLabel(delta) {
	if (delta.direction === "new") return "New in period";
	if (delta.deltaPercent == null) return null;
	return `${delta.deltaPercent > 0 ? "+" : ""}${delta.deltaPercent.toFixed(1)}%`;
}
function DeltaBadge({ delta }) {
	const label = formatDeltaLabel(delta);
	if (!label) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-muted-foreground",
		children: "vs previous period"
	});
	const isUp = delta.direction === "up" || delta.direction === "new";
	const isDown = delta.direction === "down";
	const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1 text-xs font-semibold", isUp && "text-success", isDown && "text-destructive", !isUp && !isDown && "text-muted-foreground"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: "size-3.5",
				"aria-hidden": true
			}),
			label,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-normal text-muted-foreground",
				children: "vs previous period"
			})
		]
	});
}
function SummaryStatCard({ label, tooltip, value, delta, icon: Icon, isLoading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: DASHBOARD_THEME.stats.card,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row items-start justify-between gap-y-0 pb-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: DASHBOARD_THEME.stats.label,
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-3.5 text-muted-foreground/60 transition-colors hover:text-primary" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
					className: "max-w-xs",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs",
						children: tooltip
					})
				})] }) })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn(getIconContainerClasses("small"), "size-9 rounded-lg"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "space-y-2",
			children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-24 rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-32 rounded-md" })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: DASHBOARD_THEME.stats.value,
				children: value
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeltaBadge, { delta })] })
		})]
	});
}
function AnalyticsSummaryCards({ totals, deltas, formatRevenue, isLoading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: DASHBOARD_THEME.stats.container,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryStatCard, {
				label: "Total users",
				tooltip: "Unique users in Google Analytics for the selected period, compared with the prior period of equal length.",
				value: totals.users.toLocaleString(),
				delta: deltas.users,
				icon: Users,
				isLoading
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryStatCard, {
				label: "Sessions",
				tooltip: "Total sessions in the selected range. Sessions can exceed users when people return multiple times.",
				value: totals.sessions.toLocaleString(),
				delta: deltas.sessions,
				icon: Activity,
				isLoading
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryStatCard, {
				label: "Conversions",
				tooltip: "Completed conversion events imported from your connected Google Analytics property.",
				value: totals.conversions.toLocaleString(),
				delta: deltas.conversions,
				icon: TrendingUp,
				isLoading
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryStatCard, {
				label: "Revenue",
				tooltip: "Revenue attributed in Google Analytics for the selected period.",
				value: formatRevenue(totals.revenue),
				delta: deltas.revenue,
				icon: DollarSign,
				isLoading
			})
		]
	});
}
function GoogleAnalyticsSetupDialog({ open, onOpenChange, setupMessage, properties, selectedPropertyId, onPropertySelectionChange, loadingProperties, initializing, onReloadProperties, onInitialize }) {
	const noProperties = !loadingProperties && properties.length === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn(getIconContainerClasses("small"), "flex size-10 items-center justify-center rounded-full"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
							brand: "google",
							className: "size-5",
							labeled: false
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Select Google Analytics property" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Pick the property that Cohorts should sync for reporting." })] })]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-2",
					children: [setupMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
						variant: "destructive",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Setup issue" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: setupMessage })
						]
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Property"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: selectedPropertyId || void 0,
								onValueChange: onPropertySelectionChange,
								disabled: loadingProperties || initializing || properties.length === 0,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "h-auto min-h-10 items-start py-3 text-left",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: loadingProperties ? "Loading properties..." : "Select Google Analytics property" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
									className: "max-h-[min(24rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)]",
									children: properties.map((property) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: property.id,
										className: "items-start py-2.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex min-w-0 flex-col gap-0.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TruncatedTextPreview, {
												text: property.name,
												className: "font-medium",
												detail: property.resourceName
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TruncatedTextPreview, {
												text: property.resourceName,
												className: "text-xs text-muted-foreground"
											})]
										})
									}, property.id))
								})]
							}),
							noProperties ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-warning",
								children: "No properties were found for this Google account. Verify Analytics access, then reload."
							}) : null
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2 sm:gap-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: onReloadProperties,
						disabled: loadingProperties || initializing,
						children: loadingProperties ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Loading…"] }) : "Reload properties"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						onClick: onInitialize,
						disabled: initializing || loadingProperties || !selectedPropertyId,
						children: initializing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Saving…"] }) : "Use property"
					})]
				})
			]
		})
	});
}
var ANALYTICS_CHART_SKELETON_KEYS = [
	"users-sessions",
	"revenue",
	"conversions",
	"conversion-rate"
];
var AnalyticsCharts = dynamic(() => import("./analytics-charts-DBE9RVax.mjs").then((mod) => ({ default: mod.AnalyticsCharts })), {
	ssr: false,
	loading: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
		children: ANALYTICS_CHART_SKELETON_KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[360px] w-full rounded-lg" }, key))
	})
});
function AnalyticsPageShell() {
	const { initialMetricsLoading } = useAnalyticsPageContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: initialMetricsLoading,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsPageSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: DASHBOARD_THEME.layout.container,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-8 pb-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsHeaderSection, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleAnalyticsConnectionSection, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsDialogs, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsErrorAlert, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsBodySection, {})
				]
			})
		})
	});
}
function AnalyticsHeaderSection() {
	const { dateRange, handleDateRangeChange } = useAnalyticsPageContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardPageHero, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-2 flex items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: getIconContainerClasses("medium"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-6" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: DASHBOARD_THEME.layout.title,
			children: PAGE_TITLES.analytics?.title ?? "Analytics"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn(DASHBOARD_THEME.layout.subtitle, "max-w-2xl text-sm"),
		children: PAGE_TITLES.analytics?.description ?? "Performance insights and data visualization for your connected properties."
	})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsDateRangePicker, {
		value: dateRange,
		onChange: handleDateRangeChange
	})] });
}
function GoogleAnalyticsConnectionSection() {
	const { gaAccountLabel, gaConnected, gaInitializingProperty, gaLastRequestedLabel, gaLastSyncMessage, gaLastSyncStatus, gaLastSyncedLabel, gaLoading, gaLoadingProperties, gaNeedsPropertySelection, gaStatusLabel, handleConnectGoogleAnalytics, handleOpenGoogleAnalyticsSetup, handleSyncGoogleAnalytics, isPreviewMode, isSyncPending, setGaDisconnectDialogOpen } = useAnalyticsPageContext();
	const handleConnectClick = () => {
		handleConnectGoogleAnalytics();
	};
	const handleDisconnectClick = () => {
		setGaDisconnectDialogOpen(true);
	};
	const handleSyncClick = () => {
		handleSyncGoogleAnalytics();
	};
	const statusBadgeClass = gaConnected ? gaLastSyncStatus === "error" ? getBadgeClasses("destructive") : gaNeedsPropertySelection ? getBadgeClasses("warning") : isPreviewMode ? getBadgeClasses("success") : getBadgeClasses("primary") : getBadgeClasses("destructive");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: DASHBOARD_THEME.cards.base,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn(getIconContainerClasses("small"), "flex size-10 shrink-0 items-center justify-center rounded-full"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
						brand: "google",
						className: "size-8",
						labeled: false
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold text-foreground",
					children: "Google Analytics"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Import users, sessions, and conversions into your dashboard."
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("inline-flex items-center", statusBadgeClass),
					children: gaConnected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-1 inline size-3.5" }),
						gaStatusLabel,
						gaAccountLabel ? ` · ${gaAccountLabel}` : ""
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "mr-1 inline size-3.5" }), "Not connected"] })
				}), isPreviewMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: getBadgeClasses("success"),
					children: "Read-only sample data"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: handleConnectClick,
						disabled: gaLoading,
						className: getButtonClasses("outline"),
						children: [gaLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "mr-2 size-4" }), gaConnected ? "Reconnect" : "Connect Google"]
					}),
					gaConnected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: handleOpenGoogleAnalyticsSetup,
						disabled: gaLoadingProperties || gaInitializingProperty,
						className: getButtonClasses("outline"),
						children: gaNeedsPropertySelection ? "Select property" : "Change property"
					}) : null,
					gaConnected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: handleDisconnectClick,
						className: cn(getButtonClasses("outline"), "text-destructive hover:text-destructive"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unlink, { className: "mr-2 size-4" }), "Disconnect"]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						onClick: handleSyncClick,
						disabled: isSyncPending || gaLoading || !gaConnected || gaNeedsPropertySelection,
						className: getButtonClasses("primary"),
						children: [isSyncPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, { className: "mr-2 size-4" }), "Sync data"]
					})
				] })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "border-t border-border/60 bg-muted/20 pt-4",
			children: isPreviewMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Showing read-only Google Analytics preview metrics and insights for demos and screen recordings."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1 text-sm text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Last successful sync: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: gaLastSyncedLabel
						}),
						" · ",
						"Last sync request: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: gaLastRequestedLabel
						})
					] }),
					gaNeedsPropertySelection ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-accent-foreground",
						children: "Property selection is required before sync can run."
					}) : null,
					gaLastSyncStatus === "error" && gaLastSyncMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-destructive",
						children: gaLastSyncMessage
					}) : null
				]
			})
		})]
	});
}
function AnalyticsDialogs() {
	const { gaDisconnectDialogOpen, gaDisconnecting, gaInitializingProperty, gaLoadingProperties, gaProperties, gaSelectedPropertyId, gaSetupDialogOpen, gaSetupMessage, handleDisconnectGoogleAnalytics, handleFinalizeGoogleAnalyticsSetup, loadGoogleAnalyticsPropertyOptions, setGaDisconnectDialogOpen, setGaSelectedPropertyId, setGaSetupDialogOpen } = useAnalyticsPageContext();
	const handleReloadProperties = () => {
		loadGoogleAnalyticsPropertyOptions().catch(() => {});
	};
	const handleInitialize = () => {
		handleFinalizeGoogleAnalyticsSetup();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleAnalyticsSetupDialog, {
		open: gaSetupDialogOpen,
		onOpenChange: setGaSetupDialogOpen,
		setupMessage: gaSetupMessage,
		properties: gaProperties,
		selectedPropertyId: gaSelectedPropertyId,
		onPropertySelectionChange: setGaSelectedPropertyId,
		loadingProperties: gaLoadingProperties,
		initializing: gaInitializingProperty,
		onReloadProperties: handleReloadProperties,
		onInitialize: handleInitialize
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisconnectDialog, {
		open: gaDisconnectDialogOpen,
		onOpenChange: setGaDisconnectDialogOpen,
		providerName: "Google Analytics",
		onConfirm: handleDisconnectGoogleAnalytics,
		isDisconnecting: gaDisconnecting
	})] });
}
function AnalyticsErrorAlert() {
	const { metricsError, breakdownsError, gaStatusError } = useAnalyticsPageContext();
	const errors = [
		metricsError,
		breakdownsError,
		gaStatusError
	].filter(Boolean);
	if (errors.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		children: errors.map((error) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
			variant: "destructive",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Unable to load analytics" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: asErrorMessage(error) })]
		}, error.message))
	});
}
function AnalyticsBodySection() {
	const { gaConnected, isGaSelectedWithoutData, isSyncPending } = useAnalyticsPageContext();
	if (!gaConnected || isGaSelectedWithoutData) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsEmptyState, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [isSyncPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsSyncingBanner, {}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsPerformanceSection, {})]
	});
}
function AnalyticsEmptyState() {
	const { gaConnected, gaLoading, gaNeedsPropertySelection, handleConnectGoogleAnalytics, handleOpenGoogleAnalyticsSetup, handleSyncGoogleAnalytics, isSyncPending } = useAnalyticsPageContext();
	const handleConnectClick = () => {
		handleConnectGoogleAnalytics();
	};
	const handleSyncClick = () => {
		handleSyncGoogleAnalytics();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: DASHBOARD_THEME.cards.base,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex flex-col items-center px-6 py-16 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn(getIconContainerClasses("large"), "mb-6 flex size-20 items-center justify-center rounded-full"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
						brand: "google",
						className: "size-10",
						labeled: false
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-2 text-base font-semibold text-foreground",
					children: "No analytics data yet"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-6 max-w-md text-sm text-muted-foreground",
					children: "Connect your Google Analytics property and sync your data to view users, sessions, conversions, and revenue trends."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-3 sm:flex-row",
					children: !gaConnected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: handleConnectClick,
						disabled: gaLoading,
						className: getButtonClasses("outline"),
						children: [gaLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "mr-2 size-4" }), "Link Google Analytics"]
					}) : gaNeedsPropertySelection ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						onClick: handleOpenGoogleAnalyticsSetup,
						className: getButtonClasses("primary"),
						children: "Select property"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						onClick: handleSyncClick,
						disabled: isSyncPending || gaLoading || !gaConnected,
						className: getButtonClasses("primary"),
						children: [isSyncPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, { className: "mr-2 size-4" }), "Sync data now"]
					})
				})
			]
		})
	});
}
function AnalyticsSyncingBanner() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
		className: "border-accent/40 bg-accent/5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-primary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, {
				className: "text-sm font-semibold",
				children: "Syncing analytics data"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
				className: "text-xs text-muted-foreground",
				children: "Importing the latest Google Analytics metrics. Charts below may update as new data arrives."
			})
		]
	});
}
function AnalyticsPerformanceSection() {
	const { algorithmic, avgSessionsPerDay, avgUsersPerDay, breakdowns, chartData, conversionRate, filteredMetrics, handleLoadMoreMetrics, handleRefreshInsights, handleRefreshMetrics, initialInsightsLoading, initialMetricsLoading, insights, insightsError, insightsLoading, insightsRefreshing, isPreviewMode, metricsLoading, metricsLoadingMore, metricsNextCursor, metricsRefreshing, formatRevenue, revenuePerSession, sessionsPerUser, story, totals } = useAnalyticsPageContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold text-foreground",
					children: "Property performance"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						metricsNextCursor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							onClick: handleLoadMoreMetrics,
							disabled: metricsLoadingMore,
							className: getButtonClasses("outline"),
							children: metricsLoadingMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-3.5 animate-spin" }), "Loading"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, { className: "mr-2 size-3.5" }), "Load older data"] })
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							onClick: handleRefreshMetrics,
							disabled: isPreviewMode || metricsLoading || metricsRefreshing,
							className: getButtonClasses("outline"),
							"aria-label": "Refresh metrics",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, { className: cn("mr-2 size-3.5", metricsRefreshing && "animate-spin") }), "Refresh"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsExportButton, {
							metrics: filteredMetrics,
							disabled: isPreviewMode
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsSummaryCards, {
				totals,
				deltas: story.deltas,
				formatRevenue,
				isLoading: initialMetricsLoading
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsMetricCards, {
				avgUsersPerDay,
				avgSessionsPerDay,
				revenuePerSession,
				sessionsPerUser,
				formatRevenue,
				isLoading: initialMetricsLoading
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsDeepDiveSection, {
				story,
				formatRevenue
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsBreakdownSection, { breakdowns }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsCharts, {
				chartData,
				formatRevenue,
				isMetricsLoading: metricsLoading,
				initialMetricsLoading
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsInsightsSection, {
				insights,
				algorithmic,
				insightsError,
				insightsLoading,
				insightsRefreshing,
				initialInsightsLoading,
				onRefreshInsights: handleRefreshInsights
			})
		]
	});
}
function AnalyticsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionShell, {
		reveal: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsPageProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsPageShell, {}) })
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsPage, {});
//#endregion
export { SplitComponent as component };
