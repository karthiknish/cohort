import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, r as useConvexAuth, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { H as getPreviewProposals, R as getPreviewMetrics, V as getPreviewProjects, Y as getPreviewTasks, at as mergeProposalForm } from "./preview-data-CXkRNfsX.mjs";
import { c as cn, d as formatDate, g as getWorkspaceId, n as DATE_FORMATS, r as EN_US_COMPACT_NUMBER_FORMATTER, u as formatCurrency, v as parseDate } from "./utils-hh4sibN0.mjs";
import { V as startOfDay, h as formatDistanceToNowStrict, j as differenceInDays } from "../_libs/date-fns.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { I as projectsApi, U as proposalsApi, f as adsMetricsApi, g as analyticsIntegrationsApi, q as tasksApi } from "./convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { $n as Clock3, $t as ListChecks, An as FileText, Br as ArrowUpRight, Dt as MousePointer, F as Sparkles, Hn as DollarSign, Jr as Activity, Mr as BriefcaseBusiness, P as SquareCheckBig, Rt as MessageSquare, Sr as ChartColumn, Ut as Megaphone, Vr as ArrowRight, Yt as LoaderCircle, Zt as ListTodo, in as LayoutDashboard, jr as Briefcase, lt as Plus, rt as RefreshCw, u as Users, un as Info, x as TrendingUp } from "../_libs/lucide-react.mjs";
import { n as FadeInItem, r as FadeInStagger, t as FadeIn } from "./animate-in-JYv0iBIt.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip-BwcfatA2.mjs";
import { t as ViewTransition } from "./view-transition-DFCVhmkH.mjs";
import { r as getBadgeClasses, t as DASHBOARD_THEME } from "./dashboard-theme-DM5oBGdY.mjs";
import { r as useConvexQueryError, t as mergeQueryErrors } from "./use-convex-query-error-P2IX7lhG.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./alert-DYeH1Q3p.mjs";
import { t as MotionCard } from "./motion-primitives-HmftJNmb.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as PerformanceChart } from "./performance-chart-DwDGn0rc.mjs";
import { t as PageMotionShell } from "./page-motion-shell-Ci2leIYf.mjs";
import { i as isFinancialComparable, n as financialTotalsHelper, r as formatAggregatedMoney, t as aggregateMetricFinancials } from "./aggregate-financials-Cj14Bj_Z.mjs";
import { t as DashboardPageHero } from "./dashboard-page-hero-BIWBoJtP.mjs";
import { i as can } from "./dashboard-access-q6oyjv-c.mjs";
import { t as DashboardSkeleton } from "./dashboard-skeleton-pDCnFdEC.mjs";
import { n as emitDashboardRefresh, r as onDashboardRefresh, t as PROJECT_STATUSES } from "./refresh-bus-dqOi1W-b.mjs";
import { t as TASK_STATUSES } from "./tasks-DllqW2rQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-BcYcgwat.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DAY_IN_MS = 1440 * 60 * 1e3;
var DEFAULT_TASK_SUMMARY = {
	total: 0,
	overdue: 0,
	dueSoon: 0,
	highPriority: 0
};
var ROLE_PRIORITY = {
	admin: [
		"net-margin",
		"roas",
		"total-revenue",
		"ad-spend",
		"ctr",
		"open-tasks",
		"conversions",
		"active-channels"
	],
	team: [
		"due-soon",
		"open-tasks",
		"ad-spend",
		"ctr",
		"roas",
		"conversions",
		"net-margin",
		"total-revenue"
	],
	client: [
		"ad-spend",
		"roas",
		"ctr",
		"open-tasks",
		"due-soon",
		"conversions",
		"active-channels",
		"total-revenue"
	],
	default: [
		"total-revenue",
		"net-margin",
		"roas",
		"ad-spend",
		"ctr",
		"open-tasks",
		"conversions",
		"due-soon"
	]
};
function isActiveTask(task) {
	if (!task || task.deletedAt) return false;
	const status = task.status;
	if (status === "completed" || status === "archived") return false;
	return TASK_STATUSES.includes(status);
}
function summarizeTasks(tasks) {
	if (!Array.isArray(tasks) || tasks.length === 0) return DEFAULT_TASK_SUMMARY;
	const openTasks = tasks.filter(isActiveTask);
	if (openTasks.length === 0) return DEFAULT_TASK_SUMMARY;
	const now = Date.now();
	const soonCutoff = now + 3 * DAY_IN_MS;
	let overdue = 0;
	let dueSoon = 0;
	let highPriority = 0;
	openTasks.forEach((task) => {
		if (task.priority === "high" || task.priority === "urgent") highPriority += 1;
		const dueTimestamp = task.dueDate ? Date.parse(task.dueDate) : NaN;
		if (Number.isNaN(dueTimestamp)) return;
		if (dueTimestamp < now) {
			overdue += 1;
			return;
		}
		if (dueTimestamp <= soonCutoff) dueSoon += 1;
	});
	return {
		total: openTasks.length,
		overdue,
		dueSoon,
		highPriority
	};
}
function selectTopStatsByRole(stats, role) {
	if (!Array.isArray(stats) || stats.length === 0) return {
		primary: [],
		secondary: []
	};
	const priorityOrder = ROLE_PRIORITY[role === "admin" || role === "team" || role === "client" ? role : "default"];
	const statMap = new Map(stats.map((stat) => [stat.id, stat]));
	const ordered = [];
	priorityOrder.forEach((id) => {
		const item = statMap.get(id);
		if (item && !ordered.some((stat) => stat.id === item.id)) ordered.push(item);
	});
	stats.forEach((stat) => {
		if (!ordered.some((item) => item.id === stat.id)) ordered.push(stat);
	});
	return {
		primary: ordered.slice(0, 4),
		secondary: ordered.slice(4)
	};
}
var NON_ADS_PROVIDER_IDS = new Set([
	"google-analytics",
	"google_analytics",
	"googleanalytics",
	"ga",
	"ga4"
]);
function filterPaidMediaMetrics(metrics) {
	return metrics.filter((metric) => !NON_ADS_PROVIDER_IDS.has(metric.providerId.toLowerCase()));
}
function buildDashboardStats(options) {
	const { metrics, taskSummary, userRole } = options;
	const paidMediaMetrics = filterPaidMediaMetrics(Array.isArray(metrics) ? metrics : []);
	const { deliveryTotals, financialTotals } = aggregateMetricFinancials(paidMediaMetrics);
	const totalRevenue = financialTotals.revenue;
	const totalAdSpend = financialTotals.spend;
	const netMargin = isFinancialComparable(financialTotals.comparability) && totalRevenue !== null && totalAdSpend !== null ? totalRevenue - totalAdSpend : null;
	const roas = isFinancialComparable(financialTotals.comparability) && totalAdSpend !== null && totalRevenue !== null && totalAdSpend > 0 && totalRevenue > 0 ? totalRevenue / totalAdSpend : null;
	const totalClicks = deliveryTotals.clicks;
	const totalImpressions = deliveryTotals.impressions;
	const providerCount = paidMediaMetrics.length > 0 ? new Set(paidMediaMetrics.map((record) => record.providerId)).size : 0;
	const ctr = totalImpressions > 0 ? totalClicks / totalImpressions * 100 : null;
	const totalConversions = deliveryTotals.conversions;
	const displayCurrency = financialTotals.primaryCurrency;
	const formatMoney = (amount) => formatAggregatedMoney(amount, financialTotals, formatCurrency);
	const revenueHelper = financialTotalsHelper(financialTotals, paidMediaMetrics.length > 0 ? `${paidMediaMetrics.length} synced metric ${paidMediaMetrics.length === 1 ? "record" : "records"}` : "Add revenue records to track income");
	const { primary, secondary } = selectTopStatsByRole([
		{
			id: "total-revenue",
			label: "Total Revenue",
			value: formatMoney(totalRevenue),
			helper: revenueHelper,
			icon: DollarSign,
			href: "/dashboard/analytics",
			featureLabel: "Open analytics",
			emphasis: totalRevenue !== null && totalRevenue > 0 ? "positive" : "neutral",
			urgency: totalRevenue === null || totalRevenue <= 0 ? "medium" : "low"
		},
		{
			id: "net-margin",
			label: "Net Margin",
			value: formatMoney(netMargin),
			helper: financialTotalsHelper(financialTotals, "Revenue minus ad spend for the selected window"),
			icon: TrendingUp,
			href: "/dashboard/analytics",
			featureLabel: "Open analytics",
			emphasis: netMargin !== null && netMargin > 0 ? "positive" : netMargin !== null && netMargin < 0 ? "negative" : "neutral",
			urgency: netMargin !== null && netMargin < 0 ? "high" : netMargin === null || netMargin === 0 ? "medium" : "low"
		},
		{
			id: "roas",
			label: "ROAS",
			value: roas ? `${roas.toFixed(2)}x` : "—",
			helper: roas ? "Shows revenue versus ad spend" : financialTotals.comparability === "mixed_currency" ? "ROAS requires a single currency" : "Need revenue and ad spend data",
			icon: ChartColumn,
			href: "/dashboard/analytics",
			featureLabel: "Open analytics",
			emphasis: roas && roas < 1 ? "negative" : roas && roas >= 1.5 ? "positive" : "neutral",
			urgency: roas && roas < 1 ? "high" : roas && roas < 1.5 ? "medium" : "low"
		},
		{
			id: "ad-spend",
			label: "Ad Spend",
			value: formatMoney(totalAdSpend),
			helper: financialTotalsHelper(financialTotals, providerCount > 0 ? `Data from ${providerCount} ad platforms` : "Connect ad accounts to see spend"),
			icon: Megaphone,
			href: "/dashboard/ads",
			featureLabel: "Open ads",
			emphasis: "neutral",
			urgency: providerCount === 0 ? "medium" : "low"
		},
		{
			id: "ctr",
			label: "CTR",
			value: ctr === null ? "—" : `${ctr.toFixed(2)}%`,
			helper: totalImpressions > 0 ? `${totalClicks.toLocaleString("en-US")} clicks from ads` : "Need impression data",
			icon: MousePointer,
			href: "/dashboard/ads",
			featureLabel: "Open ads",
			emphasis: ctr && ctr >= 1 ? "positive" : ctr && ctr > 0 ? "neutral" : "negative",
			urgency: ctr === null ? "medium" : ctr < .6 ? "high" : ctr < 1 ? "medium" : "low"
		},
		{
			id: "open-tasks",
			label: "Open tasks",
			value: taskSummary.total.toString(),
			helper: `${taskSummary.highPriority} high priority · ${taskSummary.overdue} overdue`,
			icon: ListChecks,
			href: "/dashboard/tasks",
			featureLabel: "Open tasks",
			emphasis: taskSummary.overdue > 0 ? "negative" : taskSummary.highPriority > 0 ? "neutral" : "positive",
			urgency: taskSummary.overdue > 0 ? "high" : taskSummary.dueSoon > 0 ? "medium" : "low"
		},
		{
			id: "due-soon",
			label: "Due soon (3d)",
			value: taskSummary.dueSoon.toString(),
			helper: taskSummary.dueSoon > 0 ? "Focus on short-term deliverables" : "No tasks due in the next 3 days",
			icon: Clock3,
			href: "/dashboard/tasks",
			featureLabel: "Open tasks",
			emphasis: taskSummary.dueSoon > 3 ? "negative" : taskSummary.dueSoon > 0 ? "neutral" : "positive",
			urgency: taskSummary.dueSoon > 3 ? "high" : taskSummary.dueSoon > 0 ? "medium" : "low"
		},
		{
			id: "conversions",
			label: "Conversions",
			value: totalConversions.toLocaleString("en-US"),
			helper: providerCount > 0 ? `From ${providerCount} channels` : "Connect ad platforms to track conversions",
			icon: TrendingUp,
			href: "/dashboard/analytics",
			featureLabel: "Open analytics",
			emphasis: totalConversions === 0 ? "neutral" : "positive",
			urgency: totalConversions === 0 ? "medium" : "low"
		},
		{
			id: "active-channels",
			label: "Active channels",
			value: providerCount.toString(),
			helper: providerCount > 0 ? "Ad platforms connected" : "Connect ad platforms to see spend",
			icon: Megaphone,
			href: "/dashboard/ads",
			featureLabel: providerCount > 0 ? "Open ads" : "Connect ads",
			emphasis: providerCount === 0 ? "negative" : "neutral",
			urgency: providerCount === 0 ? "medium" : "low"
		}
	], userRole);
	return {
		primaryStats: primary,
		secondaryStats: secondary,
		orderedStats: [...primary, ...secondary],
		displayCurrency,
		financialComparability: financialTotals.comparability
	};
}
function useDashboardStats({ metrics, taskSummary, userRole }) {
	return buildDashboardStats({
		metrics,
		taskSummary,
		userRole
	});
}
function buildChartData(metrics) {
	const paidMediaMetrics = filterPaidMediaMetrics(Array.isArray(metrics) ? metrics : []);
	const dailyMap = /* @__PURE__ */ new Map();
	if (paidMediaMetrics.length > 0) paidMediaMetrics.forEach((m) => {
		if (!m || typeof m.date !== "string") return;
		const date = m.date.split("T")[0];
		if (!date) return;
		const current = dailyMap.get(date) ?? {
			revenue: 0,
			spend: 0
		};
		dailyMap.set(date, {
			...current,
			spend: current.spend + (Number(m.spend) || 0),
			revenue: current.revenue + (Number(m.revenue) || 0)
		});
	});
	return Array.from(dailyMap.entries()).map(([date, vals]) => ({
		date,
		...vals
	})).sort((a, b) => a.date.localeCompare(b.date));
}
function mapTasksForDashboard(tasks) {
	if (!Array.isArray(tasks) || tasks.length === 0) return [];
	const withSortKey = tasks.flatMap((task) => {
		if (task.status === "completed") return [];
		const { label, timestamp } = deriveDueMetadata(task.dueDate);
		const rawTitle = typeof task.title === "string" ? task.title.trim() : "";
		const rawClient = typeof task.client === "string" ? task.client.trim() : "";
		return [{
			id: task.id,
			title: rawTitle.length > 0 ? rawTitle : "Untitled task",
			dueLabel: label,
			priority: normalizeTaskPriority(task.priority),
			clientName: rawClient.length > 0 ? rawClient : "Internal",
			sortValue: timestamp
		}];
	});
	withSortKey.sort((a, b) => a.sortValue - b.sortValue);
	return withSortKey.slice(0, 5).map((task) => {
		const { sortValue, ...taskWithoutSort } = task;
		return taskWithoutSort;
	});
}
function deriveDueMetadata(rawDue) {
	if (!rawDue) return {
		label: "No due date",
		timestamp: Number.MAX_SAFE_INTEGER
	};
	const dueDate = parseDate(rawDue);
	if (!dueDate) return {
		label: rawDue,
		timestamp: Number.MAX_SAFE_INTEGER
	};
	const dueStart = startOfDay(dueDate).getTime();
	const diffDays = differenceInDays(dueStart, startOfDay(/* @__PURE__ */ new Date()).getTime());
	if (diffDays === 0) return {
		label: "Today",
		timestamp: dueStart
	};
	if (diffDays === 1) return {
		label: "Tomorrow",
		timestamp: dueStart
	};
	if (diffDays === -1) return {
		label: "Yesterday",
		timestamp: dueStart
	};
	if (diffDays < -1) {
		const daysOverdue = Math.abs(diffDays);
		return {
			label: `${daysOverdue} ${daysOverdue === 1 ? "day overdue" : "days overdue"}`,
			timestamp: dueStart
		};
	}
	if (diffDays <= 7) return {
		label: `In ${diffDays} days`,
		timestamp: dueStart
	};
	return {
		label: formatDate(dueDate, DATE_FORMATS.SHORT),
		timestamp: dueStart
	};
}
function normalizeTaskPriority(value) {
	if (value === "low" || value === "medium" || value === "high" || value === "urgent") return value;
	return "medium";
}
function useDashboardData(options) {
	const { selectedClientId, preferPreviewData = false } = options;
	const { user } = useAuth();
	const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
	const workspaceId = getWorkspaceId(user);
	const { isPreviewMode } = usePreview();
	const usePreviewData = isPreviewMode || preferPreviewData;
	const canQueryConvex = isConvexAuthenticated && !isConvexLoading && !!user?.id && !!workspaceId;
	const [lastRefreshed, setLastRefreshed] = (0, import_react.useState)(/* @__PURE__ */ new Date());
	const proposalsArgs = usePreviewData || !workspaceId || !canQueryConvex ? "skip" : {
		workspaceId,
		clientId: selectedClientId ?? void 0,
		limit: user?.role === "client" ? 50 : 25
	};
	const convexProposals = useQuery(proposalsApi.list, proposalsArgs);
	const tasksArgs = (() => {
		if (usePreviewData || !workspaceId || !canQueryConvex || !user?.id) return "skip";
		if (selectedClientId) return {
			workspaceId,
			clientId: selectedClientId,
			limit: 200
		};
		return {
			workspaceId,
			userId: user.id
		};
	})();
	const convexTasks = useQuery(selectedClientId ? tasksApi.listByClient : tasksApi.listForUser, tasksArgs);
	const metricsArgs = usePreviewData || !workspaceId || !canQueryConvex ? "skip" : {
		workspaceId,
		clientId: selectedClientId ?? null,
		limit: 100
	};
	const metricsRealtime = useQuery(adsMetricsApi.listMetricsWithSummary, metricsArgs);
	const metricsSkipped = usePreviewData || !workspaceId || !canQueryConvex;
	const tasksSkipped = usePreviewData || !workspaceId || !canQueryConvex || !user?.id;
	const proposalsSkipped = usePreviewData || !workspaceId || !canQueryConvex;
	const metricsQueryError = useConvexQueryError({
		data: metricsRealtime,
		skipped: metricsSkipped,
		loading: !metricsSkipped && metricsRealtime === void 0,
		fallbackMessage: "Unable to load dashboard metrics."
	});
	const tasksQueryError = useConvexQueryError({
		data: convexTasks,
		skipped: tasksSkipped,
		loading: !tasksSkipped && convexTasks === void 0,
		fallbackMessage: "Unable to load dashboard tasks."
	});
	const proposalsQueryError = useConvexQueryError({
		data: convexProposals,
		skipped: proposalsSkipped,
		loading: !proposalsSkipped && convexProposals === void 0,
		fallbackMessage: "Unable to load proposals."
	});
	const triggerReload = (0, import_react.useEffectEvent)(() => {
		setLastRefreshed(/* @__PURE__ */ new Date());
	});
	const handleRefresh = () => {
		triggerReload();
		emitDashboardRefresh({
			reason: "manual-dashboard-refresh",
			clientId: selectedClientId
		});
	};
	(0, import_react.useEffect)(() => {
		if (usePreviewData) return;
		return onDashboardRefresh((evt) => {
			if (selectedClientId && evt.clientId && evt.clientId !== selectedClientId) return;
			triggerReload();
		});
	}, [selectedClientId, usePreviewData]);
	const metricsResult = (() => {
		if (usePreviewData) return {
			data: getPreviewMetrics(selectedClientId ?? null),
			error: null
		};
		if (!user?.id) return {
			data: [],
			error: null
		};
		if (metricsRealtime === void 0) return {
			data: [],
			error: null
		};
		try {
			if (!metricsRealtime || typeof metricsRealtime !== "object" || !Array.isArray(metricsRealtime.metrics)) throw new Error("Malformed metrics response");
			return {
				data: metricsRealtime.metrics.map((row) => ({
					id: String(row.id ?? ""),
					providerId: String(row.providerId ?? "unknown"),
					date: String(row.date ?? ""),
					clientId: typeof row.clientId === "string" ? row.clientId : null,
					createdAt: typeof row.createdAtMs === "number" ? new Date(row.createdAtMs).toISOString() : typeof row.createdAt === "string" ? row.createdAt : null,
					currency: typeof row.currency === "string" ? row.currency : null,
					spend: Number(row.spend ?? 0),
					impressions: Number(row.impressions ?? 0),
					clicks: Number(row.clicks ?? 0),
					conversions: Number(row.conversions ?? 0),
					revenue: row.revenue === null || row.revenue === void 0 ? null : Number(row.revenue)
				})),
				error: null
			};
		} catch (error) {
			return {
				data: [],
				error: error instanceof Error ? error.message : "Unable to load dashboard metrics"
			};
		}
	})();
	const metrics = metricsResult.data;
	const metricsLoading = (() => {
		if (usePreviewData) return false;
		if (!user?.id) return false;
		return metricsRealtime === void 0;
	})();
	const tasksResult = (() => {
		if (usePreviewData) return {
			data: getPreviewTasks(selectedClientId ?? null),
			error: null
		};
		if (!user?.id || convexTasks === void 0) return {
			data: [],
			error: null
		};
		try {
			return {
				data: (Array.isArray(convexTasks) ? convexTasks : Array.isArray(convexTasks?.items) ? convexTasks.items : []).map((raw) => {
					const row = raw ?? {};
					return {
						id: String(row.legacyId),
						title: String(row.title ?? ""),
						description: typeof row.description === "string" ? row.description : null,
						status: row.status,
						priority: row.priority,
						assignedTo: Array.isArray(row.assignedTo) ? row.assignedTo : [],
						clientId: typeof row.clientId === "string" ? row.clientId : null,
						client: typeof row.client === "string" ? row.client : null,
						projectId: typeof row.projectId === "string" ? row.projectId : null,
						projectName: typeof row.projectName === "string" ? row.projectName : null,
						dueDate: typeof row.dueDateMs === "number" ? new Date(row.dueDateMs).toISOString() : null,
						createdAt: typeof row.createdAtMs === "number" ? new Date(row.createdAtMs).toISOString() : null,
						updatedAt: typeof row.updatedAtMs === "number" ? new Date(row.updatedAtMs).toISOString() : null,
						deletedAt: typeof row.deletedAtMs === "number" ? new Date(row.deletedAtMs).toISOString() : null
					};
				}),
				error: null
			};
		} catch (error) {
			return {
				data: [],
				error: error instanceof Error ? error.message : "Unable to load dashboard tasks"
			};
		}
	})();
	const rawTasks = tasksResult.data;
	const taskItems = mapTasksForDashboard(rawTasks);
	const taskSummary = summarizeTasks(rawTasks);
	const tasksLoading = (() => {
		if (usePreviewData) return false;
		if (!user?.id) return false;
		return convexTasks === void 0;
	})();
	const proposalsResult = (() => {
		if (usePreviewData) return {
			data: getPreviewProposals(selectedClientId ?? null),
			error: null
		};
		const shouldLoad = user?.role === "client" || user?.role === "admin" || user?.role === "team";
		if (!user?.id || !shouldLoad || convexProposals === void 0) return {
			data: [],
			error: null
		};
		try {
			return {
				data: convexProposals.map((raw) => {
					const row = raw ?? {};
					const deck = row.presentationDeck ?? null;
					const pptUrl = typeof row.pptUrl === "string" ? row.pptUrl : null;
					return {
						id: String(row.legacyId),
						status: row.status ?? "draft",
						stepProgress: typeof row.stepProgress === "number" ? row.stepProgress : 0,
						formData: mergeProposalForm(row.formData ?? null),
						aiInsights: row.aiInsights ?? null,
						aiSuggestions: row.aiSuggestions ?? null,
						pdfUrl: row.pdfUrl ?? null,
						pptUrl,
						createdAt: typeof row.createdAtMs === "number" ? new Date(row.createdAtMs).toISOString() : null,
						updatedAt: typeof row.updatedAtMs === "number" ? new Date(row.updatedAtMs).toISOString() : null,
						lastAutosaveAt: typeof row.lastAutosaveAtMs === "number" ? new Date(row.lastAutosaveAtMs).toISOString() : null,
						clientId: typeof row.clientId === "string" ? row.clientId : null,
						clientName: typeof row.clientName === "string" ? row.clientName : null,
						presentationDeck: deck ? {
							...deck,
							storageUrl: deck.storageUrl ?? pptUrl
						} : null
					};
				}),
				error: null
			};
		} catch (error) {
			return {
				data: [],
				error: error instanceof Error ? error.message : "Unable to load proposals"
			};
		}
	})();
	const proposals = proposalsResult.data;
	const proposalsLoading = (() => {
		if (usePreviewData) return false;
		if (!user?.id) return false;
		return convexProposals === void 0;
	})();
	const isRefreshing = metricsLoading || tasksLoading || proposalsLoading;
	return {
		metrics,
		metricsLoading,
		metricsError: mergeQueryErrors(metricsResult.error, metricsQueryError),
		taskItems,
		rawTasks,
		taskSummary,
		tasksLoading,
		tasksError: mergeQueryErrors(tasksResult.error, tasksQueryError),
		lastRefreshed,
		handleRefresh,
		isRefreshing,
		proposals,
		proposalsLoading,
		proposalsError: mergeQueryErrors(proposalsResult.error, proposalsQueryError)
	};
}
var SNAPSHOT_LINKS = [
	{
		key: "tasks",
		href: "/dashboard/tasks",
		icon: ListTodo,
		accent: "border-l-primary from-primary/8"
	},
	{
		key: "projects",
		href: "/dashboard/projects",
		icon: BriefcaseBusiness,
		accent: "border-l-info from-info/8"
	},
	{
		key: "proposals",
		href: "/dashboard/proposals",
		icon: FileText,
		accent: "border-l-accent from-accent/8"
	}
];
function DashboardDailySnapshotCard({ openTasks, pendingProposals, activeProjects, loading }) {
	const values = {
		tasks: openTasks,
		projects: activeProjects,
		proposals: pendingProposals
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		id: "tour-stats-cards",
		className: cn("overflow-hidden ring-1 ring-muted/20", DASHBOARD_THEME.cards.base),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: cn(DASHBOARD_THEME.cards.header, "bg-muted/[0.02]"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, {
						className: "size-5",
						"aria-hidden": true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-lg tracking-tight",
						children: "Today's workload"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "max-w-xl text-pretty leading-relaxed",
						children: "Open tasks, active delivery, and proposals awaiting action for this workspace."
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "pt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FadeInStagger, {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnapshotMetric, {
						link: SNAPSHOT_LINKS[0],
						label: "Open tasks",
						value: values.tasks,
						loading,
						hint: "Todo · in progress · review"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnapshotMetric, {
						link: SNAPSHOT_LINKS[1],
						label: "Active projects",
						value: values.projects,
						loading,
						hint: "In motion"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnapshotMetric, {
						link: SNAPSHOT_LINKS[2],
						label: "Live proposals",
						value: values.proposals,
						loading,
						hint: "Draft through sent"
					})
				]
			})
		})]
	});
}
function SnapshotMetric({ link, label, value, loading, hint }) {
	const Icon = link.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionCard, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
		href: link.href,
		className: cn("group flex h-full flex-col rounded-xl border border-muted/50 border-l-[3px] bg-linear-to-br p-4 shadow-sm transition-[border-color,box-shadow] hover:border-accent/30 hover:shadow-md", link.accent),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-flex size-9 items-center justify-center rounded-lg bg-background text-primary ring-1 ring-border/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-4",
					"aria-hidden": true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80",
				children: label
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-8 w-16 rounded-md" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground md:text-3xl",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: hint
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
					className: "size-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary",
					"aria-hidden": true
				})]
			})
		]
	}) }) });
}
function DashboardEmptyPerformanceCard() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-hidden border-dashed border-muted/50 bg-linear-to-br from-muted/10 via-background to-primary/[0.03] shadow-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex flex-col items-center gap-6 px-6 py-14 text-center sm:px-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
						className: "size-7",
						"aria-hidden": true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-md space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight text-foreground",
						children: "No performance data yet"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted-foreground",
						children: "Connect ad platforms or Google Analytics to unlock spend trends, channel KPIs, and comparison charts for this view."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						asChild: true,
						className: "gap-2 shadow-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
							href: "/dashboard/ads",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, {
								className: "size-4",
								"aria-hidden": true
							}), "Connect ads"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						asChild: true,
						className: "gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
							href: "/dashboard/analytics",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {
								className: "size-4",
								"aria-hidden": true
							}), "Open analytics"]
						})
					})]
				})
			]
		})
	});
}
function DashboardSectionHeading({ eyebrow = "Overview", title, description, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-1 border-b border-muted/40 pb-3", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80",
				children: eyebrow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold tracking-tight text-foreground",
				children: title
			}),
			description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
				children: description
			}) : null
		]
	});
}
function DashboardOverviewErrorsAlert({ errors, isRefreshing, onRetry }) {
	if (errors.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, {
		variant: "destructive",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Some data could not be loaded" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: errors.join(" ") })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				size: "sm",
				className: "shrink-0 border-destructive/40 bg-background hover:bg-destructive/10",
				onClick: onRetry,
				disabled: isRefreshing,
				children: [isRefreshing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : null, "Try again"]
			})]
		})
	}) });
}
function getGreeting() {
	const hour = (/* @__PURE__ */ new Date()).getHours();
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}
function DashboardOverviewHeader({ clientName, isClientScoped, teamMembersCount, accountManager, hasLiveMetrics, isRefreshing, onRefresh }) {
	const greeting = getGreeting();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardPageHero, {
		innerClassName: "relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn(DASHBOARD_THEME.icons.container, "bg-primary/10 text-primary border-primary/20"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, {
					className: "size-6",
					"aria-hidden": true
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: DASHBOARD_THEME.sectionEyebrow,
						children: greeting
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-balance text-2xl tracking-tight text-foreground sm:text-3xl",
								children: clientName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: cn("font-normal normal-case tracking-normal", isClientScoped ? getBadgeClasses("primary") : getBadgeClasses("secondary")),
								children: isClientScoped ? "Client view" : "All clients"
							}),
							hasLiveMetrics ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: cn(getBadgeClasses("success"), "font-normal normal-case tracking-normal"),
								children: "Metrics synced"
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: DASHBOARD_THEME.sectionDescription,
						children: isClientScoped ? "Delivery, paid media, and site performance at a glance for this workspace." : "Workspace-wide pulse. Pick a client in the sidebar for a focused breakdown."
					}),
					isClientScoped ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground",
						children: [teamMembersCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
									className: "size-4 shrink-0",
									"aria-hidden": true
								}),
								teamMembersCount,
								" team ",
								teamMembersCount === 1 ? "member" : "members"
							]
						}) : null, accountManager ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Account manager · ", accountManager] }) : null]
					}) : null
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "outline",
			size: "sm",
			className: "shrink-0 gap-2 self-start border-muted/50 bg-background/80 shadow-sm backdrop-blur-sm",
			onClick: onRefresh,
			disabled: isRefreshing,
			children: [isRefreshing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				className: "size-4 animate-spin",
				"aria-hidden": true
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
				className: "size-4",
				"aria-hidden": true
			}), "Refresh data"]
		})]
	}) });
}
var ACCENT_STYLES = {
	primary: "border-l-[3px] border-l-primary bg-linear-to-br from-primary/8 via-primary/[0.02] to-background",
	info: "border-l-[3px] border-l-info bg-linear-to-br from-info/10 via-info/[0.02] to-background",
	success: "border-l-[3px] border-l-success bg-linear-to-br from-success/8 via-success/[0.02] to-background"
};
function DashboardSnapshotMetricGrid({ metrics, loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInStagger, {
		className: "grid gap-4 sm:grid-cols-3",
		children: metrics.map((metric, index) => {
			const accent = metric.accent ?? (index === 0 ? "primary" : index === 1 ? "info" : "success");
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: cn(DASHBOARD_THEME.stats.card, "overflow-hidden border-muted/50 shadow-sm transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0", ACCENT_STYLES[accent]),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80",
						children: metric.label
					}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-28 rounded-md" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-2xl font-bold tabular-nums tracking-tight md:text-3xl",
						children: metric.value
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-0",
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-40 rounded-md" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted-foreground",
						children: metric.helper
					})
				})]
			}) }, metric.label);
		})
	});
}
var adminQuickLinks = [
	{
		title: "Manage ad integrations",
		description: "Connect platforms, refresh syncs, and review campaign metrics in the Ads hub.",
		href: "/dashboard/ads",
		icon: Megaphone,
		badge: null,
		capability: "agency.ads"
	},
	{
		title: "Manage projects",
		description: "Review active projects, milestones, and delivery timelines in one place.",
		href: "/dashboard/projects",
		icon: Briefcase,
		badge: null
	},
	{
		title: "Deep-dive analytics",
		description: "Use advanced breakdowns and visualizations to compare channel performance.",
		href: "/dashboard/analytics",
		icon: ChartColumn,
		badge: null
	}
];
var clientQuickLinks = [
	{
		title: "View your projects",
		description: "Check project status, timelines, and deliverables.",
		href: "/dashboard/projects",
		icon: Briefcase,
		badge: null
	},
	{
		title: "Track your tasks",
		description: "See tasks assigned to you and their current status.",
		href: "/dashboard/tasks",
		icon: SquareCheckBig,
		badge: null
	},
	{
		title: "Team collaboration",
		description: "Message your team and stay updated on discussions.",
		href: "/dashboard/collaboration",
		icon: MessageSquare,
		badge: null
	}
];
var createActions = [
	{
		label: "New Proposal",
		href: "/dashboard/proposals",
		icon: FileText,
		description: "AI-powered",
		capability: "proposals.manage"
	},
	{
		label: "New Task",
		href: "/dashboard/tasks?action=create",
		icon: SquareCheckBig,
		description: "Add task"
	},
	{
		label: "Start Chat",
		href: "/dashboard/collaboration",
		icon: MessageSquare,
		description: "Team discussion"
	}
];
function QuickActions({ compact }) {
	const { user } = useAuth();
	const userRole = user?.role ?? "client";
	const { filteredQuickLinks, filteredCreateActions } = (() => {
		return {
			filteredQuickLinks: (userRole === "client" ? clientQuickLinks : adminQuickLinks).filter((link) => !link.capability || can(userRole, link.capability)),
			filteredCreateActions: createActions.filter((action) => !action.capability || can(userRole, action.capability))
		};
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-lg",
				children: "Quick actions"
			}), !compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Jump into the teams and workflows that need attention." })] }), !compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden sm:flex items-center gap-2",
				children: filteredCreateActions.map((action) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
							href: action.href,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), action.label]
						})
					}, action.href);
				})
			})]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:hidden mb-4",
			children: filteredCreateActions.map((action) => {
				const Icon = action.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					className: "justify-start gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
						href: action.href,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }),
							action.label,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-auto text-xs text-muted-foreground",
								children: action.description
							})
						]
					})
				}, action.href);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`,
			children: filteredQuickLinks.map((link) => {
				const Icon = link.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
					href: link.href,
					className: "group flex h-full flex-col justify-between rounded-lg border border-muted/60 bg-background p-4 transition hover:border-accent/80 hover:shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex size-9 items-center justify-center rounded-full bg-accent/10 text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
							}), link.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "text-xs",
								children: link.badge
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-foreground group-hover:text-primary",
							children: link.title
						}), !compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: link.description
						})] })]
					}), !compact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-4 inline-flex items-center text-xs font-medium text-primary",
						children: ["Go to ", link.title.split(" ")[0]]
					})]
				}, link.href);
			})
		})] })]
	});
}
function StatsCards({ stats, loading, primaryCount = 4, linkless = false }) {
	const [expanded, setExpanded] = (0, import_react.useState)(false);
	const handleToggleExpanded = () => {
		(0, import_react.startTransition)(() => {
			setExpanded((current) => !current);
		});
	};
	const { visibleStats, hiddenCount } = (() => {
		if (!stats || stats.length === 0) return {
			visibleStats: [],
			hiddenCount: 0
		};
		const clampedPrimary = Math.max(1, Math.min(primaryCount, stats.length));
		const hasHidden = stats.length > clampedPrimary;
		return {
			visibleStats: expanded || !hasHidden ? stats : stats.slice(0, clampedPrimary),
			hiddenCount: hasHidden ? stats.length - clampedPrimary : 0
		};
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInStagger, {
			className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
			children: visibleStats.map((stat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTransition, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsCard, {
				stat,
				loading,
				linkless
			}) }) }, stat.id))
		}), hiddenCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "sm",
				className: "text-primary",
				onClick: handleToggleExpanded,
				children: expanded ? "Show less" : `Show more (${hiddenCount})`
			})
		})]
	});
}
var StatsCard = function StatsCard({ stat, loading, linkless = false }) {
	const Icon = stat.icon;
	const valueClasses = cn("text-3xl font-bold tracking-tight", !loading && stat.emphasis === "positive" && "text-success", !loading && stat.emphasis === "negative" && "text-destructive");
	const cardBody = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: cn("shadow-sm transition-colors", !linkless && stat.href && "group-hover:border-accent/60 group-hover:shadow-md"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex items-center justify-between p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-xs font-medium uppercase text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [stat.urgency && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("size-2.5 rounded-full", getUrgencyDotClass(stat.urgency)),
								"aria-hidden": "true",
								title: `${stat.urgency} urgency`
							}), stat.label]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: valueClasses,
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-20" }) : stat.value
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-32" }) : stat.helper
					}),
					!loading && !linkless && stat.href && stat.featureLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-1 text-xs font-medium text-primary",
						children: [stat.featureLabel, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })]
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-full bg-info/10 p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-6 text-primary" })
			})]
		})
	});
	if (!linkless && stat.href) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
		href: stat.href,
		transitionTypes: ["nav-forward"],
		className: "group block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
		children: cardBody
	});
	return cardBody;
};
function getUrgencyDotClass(level) {
	switch (level) {
		case "high": return "bg-destructive ring-4 ring-destructive/12";
		case "medium": return "bg-warning ring-4 ring-warning/16";
		case "low": return "bg-success ring-4 ring-success/14";
		default: return "bg-muted-foreground";
	}
}
function DashboardOverviewSpendRevenueChart({ chartMetrics, metricsLoading, displayCurrency }) {
	if (chartMetrics.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, {
		id: "tour-performance-chart",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "overflow-hidden border-muted/40 bg-card shadow-sm ring-1 ring-muted/20",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "border-b border-muted/40 bg-muted/[0.02] pb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, {
										className: "size-4",
										"aria-hidden": true
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-lg tracking-tight",
									children: "Spend & revenue"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4 cursor-help text-muted-foreground" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
									className: "max-w-xs",
									children: "Daily ad spend and revenue from synced platforms for the current client."
								})] }) })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Trend over the synced reporting window" })]
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "h-[320px] pt-6 sm:h-[340px]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerformanceChart, {
					metrics: chartMetrics,
					loading: metricsLoading,
					currency: displayCurrency ?? void 0,
					dataSource: "ads",
					showDetailLink: false,
					hideHeader: true
				})
			})]
		})
	});
}
function DashboardOverviewSnapshotGrids({ hasAdsData, hasAnalyticsData, adsMetricsList, analyticsMetricsList, adsLoading, analyticsLoading }) {
	if (!hasAdsData && !hasAnalyticsData) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-8 lg:grid-cols-2",
		children: [hasAdsData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardSectionHeading, {
				eyebrow: "Paid media",
				title: "Ad platforms",
				description: "Spend, delivery, and conversions from synced channels."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardSnapshotMetricGrid, {
				metrics: adsMetricsList,
				loading: adsLoading
			})]
		}) }) : null, hasAnalyticsData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardSectionHeading, {
				eyebrow: "Site traffic",
				title: "Analytics",
				description: "Users, sessions, and conversion rate for the selected period."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardSnapshotMetricGrid, {
				metrics: analyticsMetricsList,
				loading: analyticsLoading
			})]
		}) }) : null]
	});
}
function DashboardOverviewPerformanceSection({ hasChartData, hasAdsData, hasAnalyticsData, metricsLoading, chartMetrics, displayCurrency, adsMetricsList, analyticsMetricsList, adsLoading, analyticsLoading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-5",
		"aria-label": "Performance metrics",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardOverviewSpendRevenueChart, {
				chartMetrics,
				metricsLoading,
				displayCurrency
			}),
			(hasAdsData || hasAnalyticsData) && !hasChartData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardOverviewSnapshotGrids, {
				hasAdsData,
				hasAnalyticsData,
				adsMetricsList,
				analyticsMetricsList,
				adsLoading,
				analyticsLoading
			}) : null,
			!hasChartData && !hasAdsData && !hasAnalyticsData && !metricsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardEmptyPerformanceCard, {}) }) : null
		]
	});
}
function DashboardOverviewSummarySection({ displayStats, statsLoading }) {
	if (displayStats.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-4",
		"aria-label": "Summary statistics",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardSectionHeading, {
			eyebrow: "Signals",
			title: "Summary",
			description: "Cross-channel KPIs rolled up for this workspace."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsCards, {
			stats: displayStats,
			loading: statsLoading,
			primaryCount: 4,
			linkless: true
		})]
	}) });
}
function isProjectStatus(value) {
	return typeof value === "string" && PROJECT_STATUSES.includes(value);
}
function normalizeTaskStatus(value) {
	if (typeof value !== "string") return null;
	return TASK_STATUSES.includes(value) ? value : null;
}
function formatCompactNumber(value) {
	return EN_US_COMPACT_NUMBER_FORMATTER.format(value);
}
function useDashboardOverviewPage() {
	const { user } = useAuth();
	const { selectedClient, selectedClientId } = useClientContext();
	const { isPreviewMode } = usePreview();
	const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
	const workspaceId = getWorkspaceId(user);
	const canQueryConvex = Boolean(workspaceId) && Boolean(user?.id) && isAuthenticated && !convexAuthLoading;
	const { metrics, metricsLoading, metricsError, rawTasks, taskSummary, tasksLoading, tasksError, proposals, proposalsLoading, proposalsError, handleRefresh, isRefreshing } = useDashboardData({ selectedClientId });
	const { orderedStats, displayCurrency } = useDashboardStats({
		metrics,
		taskSummary,
		userRole: user?.role ?? null
	});
	const analyticsStatus = useQuery(analyticsIntegrationsApi.getGoogleAnalyticsStatus, !isPreviewMode && canQueryConvex && workspaceId ? {
		workspaceId,
		clientId: selectedClientId ?? null
	} : "skip");
	const projectRows = useQuery(projectsApi.list, !isPreviewMode && canQueryConvex && workspaceId ? {
		workspaceId,
		...selectedClientId ? { clientId: selectedClientId } : {},
		limit: 200
	} : "skip");
	const dashboardErrors = [
		metricsError,
		tasksError,
		proposalsError
	].filter((value) => typeof value === "string" && value.trim().length > 0);
	const clientName = selectedClient?.name ?? "Workspace";
	const teamMembersCount = selectedClient?.teamMembers.length ?? 0;
	const accountManager = selectedClient?.accountManager?.trim() || null;
	const isClientScoped = Boolean(selectedClient);
	const chartMetrics = buildChartData(metrics);
	const analyticsMetrics = metrics.filter((metric) => metric.providerId === "google-analytics");
	const analyticsTotals = analyticsMetrics.reduce((accumulator, metric) => {
		accumulator.users += metric.impressions || 0;
		accumulator.sessions += metric.clicks || 0;
		accumulator.conversions += metric.conversions || 0;
		accumulator.revenue += metric.revenue || 0;
		return accumulator;
	}, {
		users: 0,
		sessions: 0,
		conversions: 0,
		revenue: 0
	});
	const analyticsConversionRate = analyticsTotals.sessions > 0 ? analyticsTotals.conversions / analyticsTotals.sessions * 100 : 0;
	const adMetrics = metrics.filter((metric) => metric.providerId !== "google-analytics");
	const adsFinancial = aggregateMetricFinancials(adMetrics);
	const adsSummary = (() => {
		const providerIds = new Set(adMetrics.map((metric) => metric.providerId));
		return {
			spend: adsFinancial.financialTotals.spend ?? 0,
			revenue: adsFinancial.financialTotals.revenue ?? 0,
			clicks: adsFinancial.deliveryTotals.clicks,
			impressions: adsFinancial.deliveryTotals.impressions,
			conversions: adsFinancial.deliveryTotals.conversions,
			providers: providerIds,
			financialTotals: adsFinancial.financialTotals
		};
	})();
	const projects = (() => {
		if (isPreviewMode) return getPreviewProjects(selectedClientId ?? null);
		return Array.isArray(projectRows) ? projectRows : [];
	})();
	const clientStats = (() => {
		return {
			activeProjects: projects.filter((project) => isProjectStatus(project.status) && project.status === "active").length,
			openTasks: rawTasks.filter((task) => {
				if (task.deletedAt) return false;
				const status = normalizeTaskStatus(task.status);
				return status === "todo" || status === "in-progress" || status === "review";
			}).length,
			pendingProposals: proposals.filter((proposal) => proposal.status === "draft" || proposal.status === "in_progress" || proposal.status === "ready" || proposal.status === "sent").length
		};
	})();
	const analyticsStatusDetail = (() => {
		if (isPreviewMode) return "Preview metrics";
		if (!analyticsStatus) return "Analytics not connected";
		if (analyticsStatus.lastSyncedAtMs) return `Synced ${formatDistanceToNowStrict(analyticsStatus.lastSyncedAtMs, { addSuffix: true })}`;
		return analyticsStatus.accountName ? `Connected to ${analyticsStatus.accountName}` : "Google Analytics connected";
	})();
	const adsMetricsList = (() => {
		const formatMoney = (amount) => formatAggregatedMoney(amount, adsSummary.financialTotals, formatCurrency);
		return [
			{
				label: "Ad spend",
				value: formatMoney(adsSummary.financialTotals.spend),
				helper: financialTotalsHelper(adsSummary.financialTotals, adsSummary.providers.size > 0 ? `${adsSummary.providers.size} active channels` : "No ad spend in this period"),
				accent: "primary"
			},
			{
				label: "Clicks",
				value: formatCompactNumber(adsSummary.clicks),
				helper: `${formatCompactNumber(adsSummary.impressions)} impressions`,
				accent: "info"
			},
			{
				label: "Conversions",
				value: formatCompactNumber(adsSummary.conversions),
				helper: adsSummary.financialTotals.revenue !== null && adsSummary.financialTotals.revenue > 0 ? `${formatMoney(adsSummary.financialTotals.revenue)} revenue` : "No attributed revenue",
				accent: "success"
			}
		];
	})();
	const analyticsMetricsList = [
		{
			label: "Users",
			value: formatCompactNumber(analyticsTotals.users),
			helper: analyticsStatusDetail,
			accent: "info"
		},
		{
			label: "Sessions",
			value: formatCompactNumber(analyticsTotals.sessions),
			helper: "Site visits in range",
			accent: "primary"
		},
		{
			label: "Conv. rate",
			value: `${analyticsConversionRate.toFixed(2)}%`,
			helper: `${formatCompactNumber(analyticsTotals.conversions)} conversions`,
			accent: "success"
		}
	];
	const statsLoading = metricsLoading || tasksLoading;
	const clientStatsLoading = tasksLoading || proposalsLoading || !isPreviewMode && canQueryConvex && projectRows === void 0;
	const analyticsLoading = metricsLoading && analyticsMetrics.length === 0;
	const adsLoading = metricsLoading && adMetrics.length === 0;
	const hasChartData = chartMetrics.length > 0;
	const hasAdsData = adMetrics.length > 0 || (adsSummary.financialTotals.spend ?? 0) > 0 || adsSummary.impressions > 0;
	const hasAnalyticsData = analyticsMetrics.length > 0 || analyticsTotals.sessions > 0;
	const hasLiveMetrics = hasChartData || hasAdsData || hasAnalyticsData;
	const isInitialLoading = !isPreviewMode && (convexAuthLoading || !!user?.id && !canQueryConvex || canQueryConvex && (metricsLoading || tasksLoading || proposalsLoading || clientStatsLoading));
	const displayStats = orderedStats.map((stat) => ({
		...stat,
		href: void 0,
		featureLabel: void 0
	}));
	const handleRefreshClick = () => {
		handleRefresh();
	};
	return {
		isInitialLoading,
		clientName,
		isClientScoped,
		teamMembersCount,
		accountManager,
		hasLiveMetrics,
		isRefreshing,
		handleRefreshClick,
		dashboardErrors,
		clientStats,
		clientStatsLoading,
		hasChartData,
		hasAdsData,
		hasAnalyticsData,
		metricsLoading,
		chartMetrics,
		displayCurrency,
		adsMetricsList,
		analyticsMetricsList,
		adsLoading,
		analyticsLoading,
		displayStats,
		statsLoading
	};
}
function DashboardOverviewPageView({ clientName, isClientScoped, teamMembersCount, accountManager, availability, loading, onRefresh, dashboardErrors, clientStats, chartMetrics, displayCurrency, adsMetricsList, analyticsMetricsList, displayStats }) {
	const { hasLiveMetrics, hasChartData, hasAdsData, hasAnalyticsData } = availability;
	const { isRefreshing, clientStatsLoading, metricsLoading, adsLoading, analyticsLoading, statsLoading } = loading;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardOverviewHeader, {
				clientName,
				isClientScoped,
				teamMembersCount,
				accountManager,
				hasLiveMetrics,
				isRefreshing,
				onRefresh
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardOverviewErrorsAlert, {
				errors: dashboardErrors,
				isRefreshing,
				onRetry: onRefresh
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardDailySnapshotCard, {
				openTasks: clientStats.openTasks,
				pendingProposals: clientStats.pendingProposals,
				activeProjects: clientStats.activeProjects,
				loading: clientStatsLoading
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardOverviewPerformanceSection, {
				hasChartData,
				hasAdsData,
				hasAnalyticsData,
				metricsLoading,
				chartMetrics,
				displayCurrency,
				adsMetricsList,
				analyticsMetricsList,
				adsLoading,
				analyticsLoading
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, {
				id: "tour-quick-actions",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickActions, { compact: true })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardOverviewSummarySection, {
				displayStats,
				statsLoading
			})
		]
	});
}
var dashboardOverviewLoadingContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardSkeleton, {});
function DashboardOverviewPage() {
	const { isInitialLoading, clientName, isClientScoped, teamMembersCount, accountManager, hasLiveMetrics, isRefreshing, handleRefreshClick, dashboardErrors, clientStats, clientStatsLoading, hasChartData, hasAdsData, hasAnalyticsData, metricsLoading, chartMetrics, displayCurrency, adsMetricsList, analyticsMetricsList, adsLoading, analyticsLoading, displayStats, statsLoading } = useDashboardOverviewPage();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionShell, {
		reveal: false,
		className: "mx-auto max-w-7xl pb-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
			loading: isInitialLoading,
			loadingContent: dashboardOverviewLoadingContent,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardOverviewPageView, {
				clientName,
				isClientScoped,
				teamMembersCount,
				accountManager,
				availability: {
					hasLiveMetrics,
					hasChartData,
					hasAdsData,
					hasAnalyticsData
				},
				loading: {
					isRefreshing,
					clientStatsLoading,
					metricsLoading,
					adsLoading,
					analyticsLoading,
					statsLoading
				},
				onRefresh: handleRefreshClick,
				dashboardErrors,
				clientStats,
				chartMetrics,
				displayCurrency,
				adsMetricsList,
				analyticsMetricsList,
				displayStats
			})
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardOverviewPage, {});
//#endregion
export { SplitComponent as component };
