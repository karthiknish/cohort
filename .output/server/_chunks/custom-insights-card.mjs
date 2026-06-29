import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { D as Target, Dt as MousePointer, Hn as DollarSign, In as Eye, S as TrendingDown, b as TriangleAlert, r as Zap, x as TrendingUp } from "../_libs/lucide-react.mjs";
import { r as formatCurrency, t as cn } from "./utils.mjs";
import { u as listItemEnterClass } from "./motion.mjs";
import { t as Badge } from "./badge.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card.mjs";
import { t as Skeleton } from "./skeleton.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip.mjs";
import { t as calculateBenchmarks } from "./metrics.mjs";
import { a as resolveAdsDisplayCurrency } from "./insights-chart-utils.mjs";
//#region src/features/dashboard/ads/components/custom-insights-card-sections.tsx
var import_jsx_runtime = require_jsx_runtime();
function formatMoneyValue(value, currency) {
	if (!currency) return value.toLocaleString(void 0, { maximumFractionDigits: 2 });
	return formatCurrency(value, currency);
}
function formatValue(value, format, currency) {
	if (value === null || !Number.isFinite(value)) return "—";
	if (format === "currency") return formatMoneyValue(value, currency);
	if (format === "percent") return `${(value * 100).toFixed(2)}%`;
	if (format === "ratio") return value.toFixed(2);
	return value.toLocaleString(void 0, { maximumFractionDigits: 2 });
}
function getTrendStatus(trend, invertTrend) {
	if (trend === null || trend === void 0 || Math.abs(trend) < .01) return "neutral";
	const isPositive = trend > 0;
	return invertTrend ? isPositive ? "down" : "up" : isPositive ? "up" : "down";
}
function isAnomaly$1(value, benchmark, threshold = .5) {
	if (value === null || benchmark === void 0 || benchmark === null || benchmark === 0) return false;
	return Math.abs((value - benchmark) / benchmark) > threshold;
}
function KpiTile({ benchmark, currency, format, icon, invertTrend, label, trend, value }) {
	const trendStatus = getTrendStatus(trend ?? null, invertTrend);
	const hasAnomaly = isAnomaly$1(value, benchmark ?? null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-muted/60 bg-card p-5 motion-chromatic duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none hover:border-muted hover:shadow-md", hasAnomaly && "ring-2 ring-warning/50 ring-offset-2 ring-offset-background"),
		children: [
			hasAnomaly ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute right-3 top-3 z-10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-7 items-center justify-center rounded-full bg-warning/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3.5 text-warning" })
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This metric deviates significantly from benchmark" }) })] }) }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex items-center gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-9 items-center justify-center rounded-xl border border-muted/60 bg-muted/30 text-muted-foreground",
					children: icon
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground/80",
					children: label
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex items-end justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-3xl font-bold tracking-tight tabular-nums",
						children: formatValue(value, format, currency)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-1 text-xs text-muted-foreground/60",
						children: [
							format === "currency" && "Cost per acquisition",
							format === "percent" && "Rate percentage",
							format === "ratio" && "Return multiplier"
						]
					})]
				}), trend !== null && trend !== void 0 && Math.abs(trend) >= .01 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "secondary",
					className: cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", trendStatus === "up" && "border border-success/20 bg-success/10 text-success", trendStatus === "down" && "border border-destructive/20 bg-destructive/10 text-destructive"),
					children: [
						trendStatus === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-3.5" }),
						Math.abs(trend * 100).toFixed(1),
						"%"
					]
				}) : null]
			})
		]
	});
}
function CustomInsightsCardHeader({ anomalyCount }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
		className: "flex flex-col gap-4 pb-4 md:flex-row md:items-start md:justify-between",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-3 text-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-10 items-center justify-center rounded-xl border border-muted/60 bg-muted/30",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-5 text-foreground" })
					}),
					"Custom Insights",
					anomalyCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						className: "ml-2 border-warning/20 bg-warning/10 text-warning",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mr-1.5 size-3.5" }),
							anomalyCount,
							" anomal",
							anomalyCount === 1 ? "y" : "ies"
						]
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
				className: "text-sm",
				children: "Real-time calculated metrics and KPIs based on your ad performance"
			})]
		})
	});
}
function CustomInsightsLoadingState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
		className: "pt-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-5 md:grid-cols-2 lg:grid-cols-4",
			children: [
				0,
				1,
				2,
				3,
				4,
				5,
				6,
				7
			].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full rounded-xl" }, slot))
		})
	});
}
function CustomInsightsEmptyState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
		className: "pt-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted/60 bg-muted/20 p-12 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-12 items-center justify-center rounded-full bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-6 text-muted-foreground/50" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No metrics data available to calculate insights."
			})]
		})
	});
}
function CustomInsightsGrid({ currency, items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
		className: "pt-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-5 md:grid-cols-2 lg:grid-cols-4",
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: listItemEnterClass,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiTile, {
					currency,
					...item
				})
			}, item.label))
		})
	});
}
//#endregion
//#region src/features/dashboard/ads/components/custom-insights-card.tsx
function isAnomaly(value, benchmark, threshold = .5) {
	if (value === null || benchmark === void 0 || benchmark === null || benchmark === 0) return false;
	return Math.abs((value - benchmark) / benchmark) > threshold;
}
function CustomInsightsCard({ derivedMetrics, processedMetrics, currency, providerCurrencyMap, loading }) {
	const displayCurrency = resolveAdsDisplayCurrency(currency, processedMetrics ?? [], providerCurrencyMap ?? {});
	const computedBenchmarks = (() => {
		if (!derivedMetrics) return null;
		return calculateBenchmarks(Array.isArray(processedMetrics) ? processedMetrics.map((m) => ({
			providerId: m.providerId,
			adId: m.id,
			campaignId: "unknown",
			date: m.date,
			impressions: m.impressions,
			clicks: m.clicks,
			spend: m.spend,
			conversions: m.conversions,
			revenue: m.revenue ?? 0
		})) : []);
	})();
	const cpaBenchmark = computedBenchmarks?.benchmarks.find((b) => b.metric === "cpa")?.value ?? 50;
	const roasBenchmark = computedBenchmarks?.benchmarks.find((b) => b.metric === "roas")?.value ?? 3;
	const ctrBenchmark = computedBenchmarks?.benchmarks.find((b) => b.metric === "ctr")?.value ?? .02;
	const cpcBenchmark = computedBenchmarks?.benchmarks.find((b) => b.metric === "cpc")?.value ?? 2;
	const cpmBenchmark = computedBenchmarks?.benchmarks.find((b) => b.metric === "cpm")?.value ?? 10;
	const conversionRateBenchmark = computedBenchmarks?.benchmarks.find((b) => b.metric === "conversionRate")?.value ?? .03;
	const profitMarginBenchmark = computedBenchmarks?.benchmarks.find((b) => b.metric === "profitMargin")?.value ?? .2;
	const kpiData = (() => {
		if (!derivedMetrics) return null;
		const { kpis, growthWeekOverWeek } = derivedMetrics;
		return [
			{
				label: "CPA",
				value: kpis.cpa,
				format: "currency",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-4" }),
				trend: null,
				benchmark: cpaBenchmark,
				invertTrend: true,
				theme: "destructive"
			},
			{
				label: "ROAS",
				value: kpis.roas,
				format: "ratio",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4" }),
				trend: growthWeekOverWeek.revenue,
				benchmark: roasBenchmark,
				theme: "success"
			},
			{
				label: "CTR",
				value: kpis.ctr,
				format: "percent",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointer, { className: "size-4" }),
				trend: growthWeekOverWeek.clicks,
				benchmark: ctrBenchmark,
				theme: "accent"
			},
			{
				label: "CPC",
				value: kpis.cpc,
				format: "currency",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "size-4" }),
				trend: null,
				benchmark: cpcBenchmark,
				invertTrend: true,
				theme: "warning"
			},
			{
				label: "CPM",
				value: kpis.cpm,
				format: "currency",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }),
				trend: null,
				benchmark: cpmBenchmark,
				invertTrend: true,
				theme: "secondary"
			},
			{
				label: "Conv. Rate",
				value: kpis.conversionRate,
				format: "percent",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-4" }),
				trend: growthWeekOverWeek.conversions,
				benchmark: conversionRateBenchmark,
				theme: "accent"
			},
			{
				label: "Profit",
				value: kpis.profit,
				format: "currency",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4" }),
				trend: null,
				theme: "success"
			},
			{
				label: "Profit Margin",
				value: kpis.profitMargin,
				format: "percent",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4" }),
				trend: null,
				benchmark: profitMarginBenchmark,
				theme: "accent"
			}
		];
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "overflow-hidden border-muted/60 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomInsightsCardHeader, { anomalyCount: (() => {
			if (!kpiData) return 0;
			return kpiData.filter((kpi) => isAnomaly(kpi.value, kpi.benchmark)).length;
		})() }), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomInsightsLoadingState, {}) : !derivedMetrics || !kpiData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomInsightsEmptyState, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomInsightsGrid, {
			currency: displayCurrency,
			items: kpiData
		})]
	});
}
//#endregion
export { CustomInsightsCard };
