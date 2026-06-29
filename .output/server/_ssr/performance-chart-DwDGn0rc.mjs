import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { p as formatEnUsCurrencyMaxFractionDigits } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { un as Info } from "../_libs/lucide-react.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip-BwcfatA2.mjs";
import { t as CHART_COLORS } from "./colors-DH3BrJD1.mjs";
import { a as XAxis, c as CartesianGrid, h as Tooltip$1, i as YAxis, o as Area, t as AreaChart } from "../_libs/recharts+[...].mjs";
import { i as ChartTooltipContent, n as ChartLegend, r as ChartLegendContent, t as ChartContainer } from "./chart-B6NHzkGo.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/performance-chart-DwDGn0rc.js
var import_jsx_runtime = require_jsx_runtime();
var EMPTY_STATE_COPY = {
	ads: {
		message: "Charts appear once your connected ad platforms are synced. Connect an account above, run a sync, and spend and revenue trends will populate here.",
		primaryHref: "#connect-ad-platforms",
		primaryLabel: "Connect ad account",
		detailHref: "#connect-ad-platforms",
		detailLabel: "Manage connections"
	},
	analytics: {
		message: "Charts appear once analytics data is connected. Until then, you can explore channel-level insights in the analytics workspace.",
		primaryHref: "/dashboard/analytics",
		primaryLabel: "Open analytics workspace",
		detailHref: "/dashboard/analytics",
		detailLabel: "View details"
	}
};
var ADS_SYNCED_NO_DAILY_COPY = {
	message: "Totals above reflect your latest sync. Daily spend and revenue trends need per-day metrics in this date range — widen the range or run sync again.",
	primaryHref: "#connect-ad-platforms",
	primaryLabel: "Run sync",
	detailHref: "#connect-ad-platforms",
	detailLabel: "Manage connections"
};
var ADS_CONNECTED_NO_METRICS_COPY = {
	message: "Your ad account is connected. Run a sync to pull spend, impressions, and clicks into this date range.",
	primaryHref: "#connect-ad-platforms",
	primaryLabel: "Run sync",
	detailHref: "#connect-ad-platforms",
	detailLabel: "Manage connections"
};
var ADS_SYNCED_NO_DELIVERY_COPY = {
	message: "This account synced successfully, but there is no daily spend or revenue in the selected date range. Widen the range in the page header or confirm campaigns were active in Ads Manager.",
	primaryHref: "#connect-ad-platforms",
	primaryLabel: "Adjust date range",
	detailHref: "#connect-ad-platforms",
	detailLabel: "Manage connections"
};
function formatCurrencyValue(value, currency = "USD") {
	return formatEnUsCurrencyMaxFractionDigits(value, currency, 0);
}
function formatCurrencyValueFull(value, currency = "USD") {
	return formatEnUsCurrencyMaxFractionDigits(value, currency, 2);
}
var chartConfig = {
	revenue: {
		label: "Revenue",
		color: CHART_COLORS.hsl.emerald
	},
	spend: {
		label: "Ad Spend",
		color: CHART_COLORS.hsl.red
	}
};
var PerformanceChart = function PerformanceChart({ metrics, loading, currency = "USD", dataSource = "analytics", hasAggregateData = false, adsAccountConnected = false, showDetailLink = true, hideHeader = false, metricsDisplayState }) {
	const copy = dataSource === "ads" ? metricsDisplayState === "synced_no_delivery" ? ADS_SYNCED_NO_DELIVERY_COPY : hasAggregateData ? ADS_SYNCED_NO_DAILY_COPY : adsAccountConnected ? ADS_CONNECTED_NO_METRICS_COPY : EMPTY_STATE_COPY.ads : EMPTY_STATE_COPY[dataSource];
	const detailLinkIsHash = copy.detailHref.startsWith("#");
	const chartData = (() => {
		if (!metrics || !metrics.length) return [];
		const map = /* @__PURE__ */ new Map();
		metrics.forEach((m) => {
			const key = m.date.split("T")[0] ?? m.date;
			if (!map.has(key)) map.set(key, {
				date: key,
				spend: 0,
				revenue: 0
			});
			const entry = map.get(key);
			entry.spend += m.spend;
			entry.revenue += m.revenue || 0;
		});
		return Array.from(map.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((item) => ({
			...item,
			dateFormatted: new Date(item.date).toLocaleDateString(void 0, {
				month: "short",
				day: "numeric"
			})
		}));
	})();
	const chartMargin = {
		top: 12,
		right: 12,
		left: 0,
		bottom: 28
	};
	const chartTickStyle = { fontSize: 12 };
	const activeDot = {
		r: 5,
		strokeWidth: 0
	};
	const tooltipCursor = { strokeDasharray: "3 3" };
	const tooltipFormatter = (value, name) => {
		const normalizedValue = Array.isArray(value) ? value[0] : value;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted-foreground",
				children: chartConfig[String(name)]?.label ?? String(name)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono font-medium",
				children: formatCurrencyValueFull(Number(normalizedValue), currency)
			})]
		});
	};
	const tooltipContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltipContent, { formatter: tooltipFormatter });
	const yTickFormatter = (value) => formatCurrencyValue(value, currency);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col gap-3",
		children: [!hideHeader ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-between",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium text-muted-foreground",
				children: "Performance Overview"
			})
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-full" })]
	});
	if (chartData.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col gap-3",
		children: [!hideHeader ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: "Performance Overview"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				size: "sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					href: copy.primaryHref,
					children: copy.primaryLabel
				})
			})]
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted/70 p-10 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm text-muted-foreground",
				children: copy.message
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				variant: "outline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					href: copy.primaryHref,
					children: copy.primaryLabel
				})
			})]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col gap-1",
		children: [!hideHeader ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between px-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-medium",
					children: "Performance Overview"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-3.5 cursor-help text-muted-foreground" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, {
					className: "max-w-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Revenue:" }), " Total income generated from campaign conversions."] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Ad Spend:" }), " Total amount invested in advertising. Compare with revenue to assess campaign profitability."]
					})]
				})] }) })]
			}), showDetailLink ? detailLinkIsHash ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				size: "sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: copy.detailHref,
					children: copy.detailLabel
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				size: "sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					href: copy.detailHref,
					children: copy.detailLabel
				})
			}) : null]
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContainer, {
				config: chartConfig,
				className: "size-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
					data: chartData,
					margin: chartMargin,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
							id: "fillRevenue",
							x1: "0",
							y1: "0",
							x2: "0",
							y2: "1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "5%",
								stopColor: "var(--color-revenue)",
								stopOpacity: .3
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "95%",
								stopColor: "var(--color-revenue)",
								stopOpacity: .05
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
							id: "fillSpend",
							x1: "0",
							y1: "0",
							x2: "0",
							y2: "1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "5%",
								stopColor: "var(--color-spend)",
								stopOpacity: .3
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "95%",
								stopColor: "var(--color-spend)",
								stopOpacity: .05
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							strokeDasharray: "3 3",
							vertical: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "dateFormatted",
							axisLine: false,
							tickLine: false,
							tickMargin: 12,
							height: 40,
							tick: chartTickStyle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							axisLine: false,
							tickLine: false,
							tickMargin: 8,
							tickFormatter: yTickFormatter,
							tick: chartTickStyle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip$1, {
							cursor: tooltipCursor,
							content: tooltipContent
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegend, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegendContent, {}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							type: "monotone",
							dataKey: "revenue",
							stroke: "var(--color-revenue)",
							strokeWidth: 2,
							fill: "url(#fillRevenue)",
							dot: false,
							activeDot
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							type: "monotone",
							dataKey: "spend",
							stroke: "var(--color-spend)",
							strokeWidth: 2,
							fill: "url(#fillSpend)",
							dot: false,
							activeDot
						})
					]
				})
			})
		})]
	});
};
//#endregion
export { PerformanceChart as t };
