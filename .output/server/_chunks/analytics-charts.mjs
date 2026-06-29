import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { Nt as Minus, S as TrendingDown, un as Info, x as TrendingUp } from "../_libs/lucide-react.mjs";
import { a as XAxis, c as CartesianGrid, h as Tooltip, i as YAxis, l as Bar, o as Area, r as BarChart, t as AreaChart } from "../_libs/recharts+[...].mjs";
import { t as cn } from "./utils.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card.mjs";
import { t as Skeleton } from "./skeleton.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip$1 } from "./tooltip.mjs";
import { n as ChartLegend, r as ChartLegendContent, t as ChartContainer } from "./chart.mjs";
import { t as AnalyticsEmptyState } from "./analytics-empty-state.mjs";
//#region src/features/dashboard/analytics/components/analytics-chart-tooltips.tsx
var import_jsx_runtime = require_jsx_runtime();
function resolveChartPoint(payload) {
	if (!payload?.length) return null;
	for (const entry of payload) {
		const candidate = entry?.payload;
		if (candidate && typeof candidate === "object" && "date" in candidate) return candidate;
	}
	return null;
}
function formatTooltipDate(date) {
	const parsed = new Date(date);
	if (Number.isNaN(parsed.getTime())) return date;
	return parsed.toLocaleDateString(void 0, {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric"
	});
}
function dayOverDayPercent(chartData, date, key) {
	const index = chartData.findIndex((row) => row.date === date);
	if (index <= 0) return null;
	const previous = chartData[index - 1];
	const current = chartData[index];
	if (!previous || !current) return null;
	const prevValue = previous[key];
	const currValue = current[key];
	if (typeof prevValue !== "number" || typeof currValue !== "number" || prevValue === 0) return null;
	return (currValue - prevValue) / prevValue * 100;
}
function DayChange({ value }) {
	if (value == null || !Number.isFinite(value)) return null;
	const isUp = value > 0;
	const isDown = value < 0;
	const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1 text-[11px] font-medium", isUp && "text-success", isDown && "text-destructive", !isUp && !isDown && "text-muted-foreground"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: "size-3",
				"aria-hidden": true
			}),
			isUp ? "+" : "",
			value.toFixed(1),
			"% vs prior day"
		]
	});
}
function TooltipRow({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-6 text-xs",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-semibold tabular-nums text-foreground",
			children: value
		})]
	});
}
function TooltipTip({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 border-t border-border/60 pt-2 text-[11px] leading-relaxed text-muted-foreground",
		children
	});
}
function TooltipPanel({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-w-[12rem] gap-1.5 rounded-lg border border-border/60 bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold text-foreground",
			children: title
		}), children]
	});
}
function AnalyticsUsersSessionsTooltip({ active, payload, chartData }) {
	if (!active || !payload?.length) return null;
	const point = resolveChartPoint(payload);
	if (!point) return null;
	const sessionsPerUser = point.users > 0 ? point.sessions / point.users : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipPanel, {
		title: formatTooltipDate(point.date),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRow, {
						label: "Users",
						value: point.users.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRow, {
						label: "Sessions",
						value: point.sessions.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRow, {
						label: "Sessions / user",
						value: sessionsPerUser.toFixed(2)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayChange, { value: dayOverDayPercent(chartData, point.date, "users") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayChange, { value: dayOverDayPercent(chartData, point.date, "sessions") })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTip, { children: sessionsPerUser > 1.2 ? "Strong repeat visits this day — check campaigns and landing pages that drove returns." : "Daily users and sessions for the selected range." })
		]
	});
}
function AnalyticsRevenueTooltip({ active, payload, chartData, formatRevenue }) {
	if (!active || !payload?.length) return null;
	const point = resolveChartPoint(payload);
	if (!point) return null;
	const revenuePerSession = point.sessions > 0 ? point.revenue / point.sessions : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipPanel, {
		title: formatTooltipDate(point.date),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRow, {
						label: "Revenue",
						value: formatRevenue(point.revenue)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRow, {
						label: "Conversions",
						value: point.conversions.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRow, {
						label: "Revenue / session",
						value: formatRevenue(revenuePerSession)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRow, {
						label: "Conv. rate",
						value: `${point.conversionRate.toFixed(2)}%`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayChange, { value: dayOverDayPercent(chartData, point.date, "revenue") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTip, { children: point.revenue > 0 && point.conversions === 0 ? "Revenue without conversions — verify GA4 purchase events are mapped." : "Revenue synced from Google Analytics for this day." })
		]
	});
}
function AnalyticsConversionsTooltip({ active, payload, chartData, formatRevenue }) {
	if (!active || !payload?.length) return null;
	const point = resolveChartPoint(payload);
	if (!point) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipPanel, {
		title: formatTooltipDate(point.date),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRow, {
						label: "Conversions",
						value: point.conversions.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRow, {
						label: "Sessions",
						value: point.sessions.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRow, {
						label: "Conv. rate",
						value: `${point.conversionRate.toFixed(2)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRow, {
						label: "Revenue",
						value: formatRevenue(point.revenue)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayChange, { value: dayOverDayPercent(chartData, point.date, "conversions") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTip, { children: point.conversionRate >= 5 ? "Strong conversion day — compare traffic sources from this date." : "Conversion count based on sessions for this day." })
		]
	});
}
function AnalyticsConversionRateTooltip({ active, payload, chartData }) {
	if (!active || !payload?.length) return null;
	const point = resolveChartPoint(payload);
	if (!point) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipPanel, {
		title: formatTooltipDate(point.date),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRow, {
						label: "Conv. rate",
						value: `${point.conversionRate.toFixed(2)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRow, {
						label: "Conversions",
						value: point.conversions.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipRow, {
						label: "Sessions",
						value: point.sessions.toLocaleString()
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayChange, { value: dayOverDayPercent(chartData, point.date, "conversionRate") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTip, { children: point.sessions < 10 ? "Low session volume — daily rate can swing; interpret with caution." : "Conversion rate = conversions ÷ sessions for this day." })
		]
	});
}
//#endregion
//#region src/features/dashboard/analytics/components/analytics-chart-tooltips-constants.ts
var ANALYTICS_CHART_TOOLTIP_PROPS = {
	wrapperStyle: {
		zIndex: 60,
		outline: "none"
	},
	allowEscapeViewBox: {
		x: true,
		y: true
	},
	isAnimationActive: false
};
var ANALYTICS_CHART_CONTAINER_CLASS = "flex w-full aspect-auto h-[280px] min-h-[280px] flex-col [&_.recharts-responsive-container]:min-h-[280px]";
//#endregion
//#region src/features/dashboard/analytics/components/chart-configs.ts
/** Site theme chart palette (--chart-1 … --chart-5 in globals.css) */
var CHART_1 = "var(--chart-1)";
var CHART_2 = "var(--chart-2)";
var CHART_3 = "var(--chart-3)";
var CHART_4 = "var(--chart-4)";
var usersSessionsChartConfig = {
	users: {
		label: "Users",
		color: CHART_1
	},
	sessions: {
		label: "Sessions",
		color: CHART_2
	}
};
var revenueChartConfig = { revenue: {
	label: "Revenue",
	color: CHART_4
} };
var conversionsChartConfig = { conversions: {
	label: "Conversions",
	color: CHART_3
} };
var conversionRateChartConfig = { conversionRate: {
	label: "Conversion rate",
	color: CHART_2
} };
//#endregion
//#region src/features/dashboard/analytics/components/analytics-charts.tsx
var AXIS_TICK_STYLE = {
	fontSize: 11,
	fill: "var(--muted-foreground)"
};
var CHART_TOOLTIP_CURSOR = { strokeDasharray: "3 3" };
var CONVERSIONS_BAR_CURSOR = {
	fill: "hsl(var(--muted))",
	opacity: .2
};
var CHART_ACTIVE_DOT = {
	r: 5,
	strokeWidth: 0
};
var CHART_MARGIN = {
	top: 8,
	right: 12,
	left: 4,
	bottom: 4
};
var CHART_CARD_CLASS = "border border-border/60 bg-card shadow-sm";
var CHART_HEADER_CLASS = "border-b border-border/60 bg-muted/30 px-6 py-4";
function formatDateTick(value) {
	return new Date(value).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric"
	});
}
function formatNumberTick(value) {
	return Number(value).toLocaleString();
}
function formatPercentTick(value) {
	return `${Number(value).toFixed(1)}%`;
}
function ChartCardHeader({ title, description, tip }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
		className: CHART_HEADER_CLASS,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-sm font-semibold text-foreground",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
				className: "text-xs text-muted-foreground",
				children: description
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip$1, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipTrigger, {
				className: "rounded-md p-1 text-muted-foreground hover:text-primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					className: "size-4",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sr-only",
					children: "Chart tips"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
				side: "left",
				className: "max-w-xs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-relaxed",
					children: tip
				})
			})] }) })]
		})
	});
}
var LEGEND_CONTENT = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegendContent, { className: "pt-3 text-xs text-muted-foreground" });
function AnalyticsCharts({ chartData, formatRevenue, isMetricsLoading, initialMetricsLoading }) {
	const showChartSkeleton = initialMetricsLoading || isMetricsLoading && chartData.length === 0;
	const formatCurrencyTick = (value) => formatRevenue(Number(value));
	const usersSessionsTooltipContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsUsersSessionsTooltip, { chartData });
	const revenueTooltipContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsRevenueTooltip, {
		chartData,
		formatRevenue
	});
	const conversionsTooltipContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsConversionsTooltip, {
		chartData,
		formatRevenue
	});
	const conversionRateTooltipContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsConversionRateTooltip, { chartData });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: CHART_CARD_CLASS,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCardHeader, {
					title: "Users vs sessions",
					description: "Daily audience and visit volume",
					tip: "Hover the chart to see users, sessions, day-over-day change, and visit patterns."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-6",
					children: showChartSkeleton ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[280px] w-full rounded-lg" }) : chartData.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsEmptyState, {
						variant: "no-filters",
						title: "No performance data",
						description: "There is no performance data for the selected date range.",
						className: "h-[280px] py-6"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContainer, {
						config: usersSessionsChartConfig,
						className: ANALYTICS_CHART_CONTAINER_CLASS,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: chartData,
							margin: CHART_MARGIN,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
									id: "fillUsersAnalytics",
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "5%",
										stopColor: "var(--color-users)",
										stopOpacity: .22
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "95%",
										stopColor: "var(--color-users)",
										stopOpacity: .03
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
									id: "fillSessionsAnalytics",
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "5%",
										stopColor: "var(--color-sessions)",
										stopOpacity: .18
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "95%",
										stopColor: "var(--color-sessions)",
										stopOpacity: .02
									})]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									vertical: false,
									strokeDasharray: "3 3",
									opacity: .2
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "date",
									tickLine: false,
									axisLine: false,
									tickMargin: 10,
									style: AXIS_TICK_STYLE,
									tickFormatter: formatDateTick
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tickLine: false,
									axisLine: false,
									tickMargin: 10,
									style: AXIS_TICK_STYLE,
									tickFormatter: formatNumberTick
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									...ANALYTICS_CHART_TOOLTIP_PROPS,
									cursor: CHART_TOOLTIP_CURSOR,
									content: usersSessionsTooltipContent
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegend, { content: LEGEND_CONTENT }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "users",
									stroke: "var(--color-users)",
									strokeWidth: 2,
									fill: "url(#fillUsersAnalytics)",
									dot: false,
									activeDot: CHART_ACTIVE_DOT
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "sessions",
									stroke: "var(--color-sessions)",
									strokeWidth: 2,
									strokeDasharray: "5 4",
									fill: "url(#fillSessionsAnalytics)",
									dot: false,
									activeDot: CHART_ACTIVE_DOT
								})
							]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: CHART_CARD_CLASS,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCardHeader, {
					title: "Revenue trend",
					description: "Daily revenue from Google Analytics",
					tip: "Hover to compare revenue, conversions, and revenue per session for each day."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-6",
					children: showChartSkeleton ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[280px] w-full rounded-lg" }) : chartData.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsEmptyState, {
						variant: "no-filters",
						title: "No performance data",
						description: "There is no performance data for the selected date range.",
						className: "h-[280px] py-6"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContainer, {
						config: revenueChartConfig,
						className: ANALYTICS_CHART_CONTAINER_CLASS,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: chartData,
							margin: CHART_MARGIN,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
									id: "fillRevenueAnalytics",
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "5%",
										stopColor: "var(--color-revenue)",
										stopOpacity: .24
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "95%",
										stopColor: "var(--color-revenue)",
										stopOpacity: .04
									})]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									vertical: false,
									strokeDasharray: "3 3",
									opacity: .2
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "date",
									tickLine: false,
									axisLine: false,
									tickMargin: 10,
									style: AXIS_TICK_STYLE,
									tickFormatter: formatDateTick
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tickLine: false,
									axisLine: false,
									tickMargin: 10,
									style: AXIS_TICK_STYLE,
									tickFormatter: formatCurrencyTick
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									...ANALYTICS_CHART_TOOLTIP_PROPS,
									cursor: CHART_TOOLTIP_CURSOR,
									content: revenueTooltipContent
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegend, { content: LEGEND_CONTENT }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "revenue",
									stroke: "var(--color-revenue)",
									strokeWidth: 2,
									fill: "url(#fillRevenueAnalytics)",
									dot: false,
									activeDot: CHART_ACTIVE_DOT
								})
							]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: CHART_CARD_CLASS,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCardHeader, {
					title: "Conversions",
					description: "Daily conversion volume",
					tip: "Hover bars to see conversions with session context and day-over-day change."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-6",
					children: showChartSkeleton ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[280px] w-full rounded-lg" }) : chartData.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsEmptyState, {
						variant: "no-filters",
						title: "No performance data",
						description: "There is no performance data for the selected date range.",
						className: "h-[280px] py-6"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContainer, {
						config: conversionsChartConfig,
						className: ANALYTICS_CHART_CONTAINER_CLASS,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: chartData,
							margin: CHART_MARGIN,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
									id: "fillConversionsAnalytics",
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "0%",
										stopColor: "var(--color-conversions)",
										stopOpacity: .9
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "100%",
										stopColor: "var(--color-conversions)",
										stopOpacity: .4
									})]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									vertical: false,
									strokeDasharray: "3 3",
									opacity: .2
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "date",
									tickLine: false,
									axisLine: false,
									tickMargin: 10,
									style: AXIS_TICK_STYLE,
									tickFormatter: formatDateTick
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tickLine: false,
									axisLine: false,
									tickMargin: 10,
									style: AXIS_TICK_STYLE,
									tickFormatter: formatNumberTick
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									...ANALYTICS_CHART_TOOLTIP_PROPS,
									cursor: CONVERSIONS_BAR_CURSOR,
									content: conversionsTooltipContent
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegend, { content: LEGEND_CONTENT }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "conversions",
									fill: "url(#fillConversionsAnalytics)",
									radius: [
										4,
										4,
										0,
										0
									],
									barSize: 20
								})
							]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: CHART_CARD_CLASS,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCardHeader, {
					title: "Conversion rate",
					description: "Conversions divided by sessions, per day",
					tip: "Hover to inspect rate changes — low session days can exaggerate swings."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-6",
					children: showChartSkeleton ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[280px] w-full rounded-lg" }) : chartData.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsEmptyState, {
						variant: "no-filters",
						title: "No performance data",
						description: "There is no performance data for the selected date range.",
						className: "h-[280px] py-6"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContainer, {
						config: conversionRateChartConfig,
						className: ANALYTICS_CHART_CONTAINER_CLASS,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: chartData,
							margin: CHART_MARGIN,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
									id: "fillConversionRateAnalytics",
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "5%",
										stopColor: "var(--color-conversionRate)",
										stopOpacity: .2
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "95%",
										stopColor: "var(--color-conversionRate)",
										stopOpacity: .03
									})]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									vertical: false,
									strokeDasharray: "3 3",
									opacity: .2
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "date",
									tickLine: false,
									axisLine: false,
									tickMargin: 10,
									style: AXIS_TICK_STYLE,
									tickFormatter: formatDateTick
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tickLine: false,
									axisLine: false,
									tickMargin: 10,
									style: AXIS_TICK_STYLE,
									tickFormatter: formatPercentTick
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									...ANALYTICS_CHART_TOOLTIP_PROPS,
									cursor: CHART_TOOLTIP_CURSOR,
									content: conversionRateTooltipContent
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegend, { content: LEGEND_CONTENT }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "conversionRate",
									stroke: "var(--color-conversionRate)",
									strokeWidth: 2,
									fill: "url(#fillConversionRateAnalytics)",
									dot: false,
									activeDot: CHART_ACTIVE_DOT
								})
							]
						})
					})
				})]
			})
		]
	});
}
//#endregion
export { AnalyticsCharts };
