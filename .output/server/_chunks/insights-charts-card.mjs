import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { Sr as ChartColumn, Wr as ArrowDown, nn as Lightbulb } from "../_libs/lucide-react.mjs";
import { a as XAxis, c as CartesianGrid, d as PolarAngleAxis, f as PolarRadiusAxis, h as Tooltip, i as YAxis, l as Bar, n as RadarChart, o as Area, p as PolarGrid, r as BarChart, s as Line, t as AreaChart, u as Radar } from "../_libs/recharts+[...].mjs";
import { t as cn, x as formatMoney } from "./utils.mjs";
import { t as Button } from "./button.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription } from "./card.mjs";
import { t as Skeleton } from "./skeleton.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select.mjs";
import { a as TabsList, i as TabsTrigger, r as TabsContent, t as Tabs } from "./tabs.mjs";
import { c as resolveInsightsChartCurrency, l as tabHasChartData, n as getProviderDisplayName, o as resolveChartProviderKey, r as pickDefaultInsightsTab } from "./insights-chart-utils.mjs";
import { a as ADS_PAGE_THEME, r as MotionCard, t as adsMetricsEmptyCopy } from "./ads-metrics-display-state.mjs";
import { i as ChartTooltipContent, n as ChartLegend, r as ChartLegendContent, t as ChartContainer } from "./chart.mjs";
import { t as Link } from "./link.mjs";
//#region src/features/dashboard/ads/components/ads-chart-configs.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** Site theme palette (--chart-1 … --chart-5 in globals.css) */
var C1 = "var(--chart-1)";
var C2 = "var(--chart-2)";
var C3 = "var(--chart-3)";
var C4 = "var(--chart-4)";
var C5 = "var(--chart-5)";
var providerComparisonChartConfig = {
	spend: {
		label: "Spend",
		color: C1
	},
	revenue: {
		label: "Revenue",
		color: C4
	}
};
var spendTrendChartConfig = {
	actual: {
		label: "Actual spend",
		color: C1
	},
	trend: {
		label: "Trend (EMA)",
		color: C2
	}
};
var efficiencyRadarChartConfig = { score: {
	label: "Efficiency score",
	color: C3
} };
var benchmarkChartConfig = {
	percentile: {
		label: "Your performance",
		color: C3
	},
	benchmark: {
		label: "Industry average",
		color: C5
	}
};
/** Resolved hex fills for SVG trapezoids (CSS variables are unreliable inside Recharts paths). */
var FUNNEL_STAGE_HEX_FILLS = [
	"#2563eb",
	"#0ea5e9",
	"#3b82f6"
];
function funnelStageHexFill(index) {
	return FUNNEL_STAGE_HEX_FILLS[index] ?? FUNNEL_STAGE_HEX_FILLS[0];
}
//#endregion
//#region src/features/dashboard/ads/components/insights-proportional-funnel-utils.ts
var MIN_VISUAL_WIDTH_PCT$1 = 20;
var MAX_VISUAL_WIDTH_PCT = 100;
/**
* Log-scaled widths so 19k impressions → few conversions still forms a readable funnel
* (raw linear widths collapse the bottom into a needle).
*/
function computeFunnelVisualWidths(values) {
	const top = values[0] ?? 0;
	if (top <= 0) return values.map(() => 0);
	return values.map((value, index) => {
		if (index === 0) return MAX_VISUAL_WIDTH_PCT;
		if (value <= 0) return MIN_VISUAL_WIDTH_PCT$1;
		const scaled = Math.log10(value + 1) / Math.log10(top + 1) * MAX_VISUAL_WIDTH_PCT;
		return Math.max(MIN_VISUAL_WIDTH_PCT$1, Math.min(MAX_VISUAL_WIDTH_PCT, scaled));
	});
}
//#endregion
//#region src/features/dashboard/ads/components/insights-proportional-funnel.tsx
var import_jsx_runtime = require_jsx_runtime();
var MIN_VISUAL_WIDTH_PCT = 20;
function buildLayoutStages(stages) {
	const values = stages.map((s) => s.value);
	const visualWidths = computeFunnelVisualWidths(values);
	const top = values[0] ?? 1;
	return stages.map((stage, index) => ({
		...stage,
		visualWidthPct: visualWidths[index] ?? 0,
		fill: funnelStageHexFill(index),
		shareOfTopPct: top > 0 ? stage.value / top * 100 : 0
	}));
}
function TrapezoidSegment({ stage, nextWidthPct, segmentHeight }) {
	const top = stage.visualWidthPct;
	const bottom = nextWidthPct;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative flex w-full justify-center",
		style: { height: segmentHeight },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			className: "size-full max-w-md",
			viewBox: "0 0 100 100",
			preserveAspectRatio: "none",
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: `${50 - top / 2},0 ${50 + top / 2},0 ${50 + bottom / 2},100 ${50 - bottom / 2},100`,
				fill: stage.fill,
				stroke: "hsl(var(--border))",
				strokeWidth: .6,
				vectorEffect: "non-scaling-stroke"
			})
		})
	});
}
function StageMetrics({ stage, isLast }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium text-foreground",
			children: stage.name
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-baseline gap-2 tabular-nums text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono font-semibold text-foreground",
					children: stage.value.toLocaleString()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [stage.shareOfTopPct.toFixed(2), "% of top"] }),
				!isLast && stage.dropOff > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-amber-600 dark:text-amber-500",
					children: [
						"−",
						stage.dropOff.toFixed(1),
						"% step drop"
					]
				}) : null
			]
		})]
	});
}
function InsightsProportionalFunnel({ stages, className }) {
	const layoutStages = buildLayoutStages(stages);
	const segmentHeight = Math.max(56, Math.floor(220 / Math.max(layoutStages.length, 1)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-4", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] text-muted-foreground",
			children: "Bar widths use a log scale for readability; counts and percentages show actual sync data."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", {
			className: "mx-auto flex w-full max-w-lg flex-col gap-1",
			"aria-label": "Conversion funnel chart",
			children: layoutStages.map((stage, index) => {
				const nextWidth = index < layoutStages.length - 1 ? layoutStages[index + 1]?.visualWidthPct ?? MIN_VISUAL_WIDTH_PCT : Math.max(MIN_VISUAL_WIDTH_PCT, stage.visualWidthPct * .72);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageMetrics, {
							stage,
							isLast: index === layoutStages.length - 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrapezoidSegment, {
							stage,
							nextWidthPct: nextWidth,
							segmentHeight
						}),
						index < layoutStages.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, {
							className: "mx-auto size-3.5 text-muted-foreground/35",
							"aria-hidden": true
						}) : null
					]
				}, stage.name);
			})
		})]
	});
}
//#endregion
//#region src/features/dashboard/ads/components/ads-chart-primitives-constants.ts
var ADS_CHART_CONTAINER_CLASSNAME = "aspect-auto h-[280px] min-h-[280px] w-full";
var ADS_AXIS_TICK_STYLE = {
	fontSize: 11,
	fill: "var(--muted-foreground)"
};
var ADS_CHART_MARGIN = {
	top: 8,
	right: 12,
	left: 4,
	bottom: 4
};
var ADS_CHART_MARGIN_CATEGORY_Y = {
	top: 8,
	right: 16,
	left: 8,
	bottom: 8
};
var ADS_CHART_TOOLTIP_PROPS = {
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
var ADS_TOOLTIP_CURSOR = { strokeDasharray: "3 3" };
var ADS_ACTIVE_DOT = {
	r: 4,
	strokeWidth: 0
};
//#endregion
//#region src/features/dashboard/ads/components/ads-chart-primitives-legend.tsx
var ADS_CHART_LEGEND = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegendContent, { className: "pt-3 text-xs text-muted-foreground" });
//#endregion
//#region src/features/dashboard/ads/components/ads-chart-primitives.tsx
function AdsChartShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "w-full min-w-0 rounded-xl border border-border/60 bg-card/40 p-2 sm:p-3",
		children
	});
}
//#endregion
//#region src/features/dashboard/ads/components/insights-charts-card-sections.tsx
var TAB_LABELS = {
	comparison: "Comparison",
	efficiency: "Efficiency",
	trends: "Trends",
	funnel: "Funnel",
	benchmarks: "Benchmarks"
};
function ChartSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[280px] w-full rounded-lg" });
}
function InsightsPanelEmpty({ title, description, actionHref, actionLabel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsChartShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-[240px] flex-col items-center justify-center gap-3 px-4 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {
				className: "size-8 text-muted-foreground/40",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-foreground",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-sm text-xs text-muted-foreground",
					children: description
				})]
			}),
			actionHref && actionLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				variant: "outline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					href: actionHref,
					children: actionLabel
				})
			}) : null
		]
	}) });
}
function InsightsChartPanel({ children, description, title, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
		value,
		className: "mt-4 focus-visible:outline-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "text-sm font-medium text-foreground",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: description
			})] }), children]
		})
	});
}
function InsightsChartsLoadingState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.surfaceCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "border-b border-border/50 pb-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-48 rounded-lg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-4 w-64 rounded-lg" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4 pt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, {})]
		})]
	});
}
function InsightsChartsEmptyState({ hasConnections = false, metricsDisplayState }) {
	const dormant = metricsDisplayState === "synced_no_delivery" ? adsMetricsEmptyCopy("synced_no_delivery") : null;
	const needsSync = metricsDisplayState === "needs_sync" ? adsMetricsEmptyCopy("needs_sync") : null;
	const title = dormant ? "No chartable activity in this period" : needsSync ? needsSync.title : hasConnections ? "Waiting for synced metrics" : "Connect ad platforms first";
	const description = dormant ? dormant.description : needsSync ? needsSync.description : hasConnections ? "Your accounts are linked. Run a sync for the selected date range, then charts and funnel analysis will appear here." : "Connect Google, Meta, LinkedIn, or TikTok above, then sync to unlock comparison, funnel, and benchmark charts.";
	const actionLabel = dormant ? dormant.actionLabel : needsSync ? needsSync.actionLabel : hasConnections ? "Run sync" : "Connect account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.surfaceCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "border-b border-border/50 pb-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: ADS_PAGE_THEME.sectionEyebrow,
					children: "Visual analysis"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-lg font-semibold tracking-tight",
					children: "Performance insights"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "max-w-xl text-pretty leading-relaxed",
					children: "Comparison, funnel, and benchmark charts from synced delivery data."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "pt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsPanelEmpty, {
				title,
				description,
				actionHref: "#connect-ad-platforms",
				actionLabel
			})
		})]
	});
}
function InsightsChartsHeader({ onSelectedProviderChange, providers, providersCount, selectedProvider }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
		className: "border-b border-border/50 pb-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: ADS_PAGE_THEME.sectionEyebrow,
						children: "Visual analysis"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-lg font-semibold tracking-tight",
						children: "Performance insights"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
						className: "max-w-xl text-pretty leading-relaxed",
						children: [
							"Charts across ",
							providersCount,
							" platform",
							providersCount !== 1 ? "s" : "",
							" - switch tabs for comparison, efficiency, trends, funnel, and benchmarks."
						]
					})
				]
			}), providers.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: selectedProvider,
				onValueChange: onSelectedProviderChange,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "w-full rounded-xl border-border/70 sm:w-45",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select provider" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "all",
					children: "All platforms"
				}), providers.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: provider.id,
					children: provider.name
				}, provider.id))] })]
			}) : null]
		})
	});
}
function InsightsChartsTabs({ activeTab, onTabChange, tabAvailability, children }) {
	const tabs = Object.keys(TAB_LABELS);
	const handleTabChange = (value) => onTabChange(value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
		className: "pt-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: activeTab,
			onValueChange: handleTabChange,
			className: "w-full",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
				className: "flex h-auto w-full flex-wrap gap-1 rounded-xl bg-muted/40 p-1 sm:grid sm:grid-cols-5",
				children: tabs.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: tab,
					className: cn("min-w-[4.5rem] flex-1 rounded-lg text-xs sm:text-sm data-[state=active]:shadow-sm", !tabAvailability[tab] && "opacity-70"),
					children: TAB_LABELS[tab]
				}, tab))
			}), children]
		})
	});
}
//#endregion
//#region src/features/dashboard/ads/components/insights-funnel-panel.tsx
var funnelMetricPillClass = "inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs tabular-nums text-muted-foreground shadow-sm";
var funnelBottleneckPillClass = "inline-flex items-center rounded-full border border-warning/45 bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning";
function FunnelMetricPill({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: funnelMetricPillClass,
		children: [
			label,
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
				className: "font-semibold text-foreground",
				children: value
			})
		]
	});
}
function FunnelRecommendations({ analysis }) {
	if (!analysis?.recommendations.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border/60 bg-muted/25 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex items-center gap-2 text-xs font-medium text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, {
				className: "size-3.5 text-amber-600",
				"aria-hidden": true
			}), "Recommendations"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-1.5 text-xs leading-relaxed text-muted-foreground",
			children: analysis.recommendations.slice(0, 2).map((tip) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: tip }, tip))
		})]
	});
}
function InsightsFunnelPanel({ stages, analysis, providerLabel }) {
	const funnelStages = (stages ?? []).map((s) => ({
		name: s.name,
		value: s.value,
		dropOff: s.dropOff
	}));
	const hasVolume = funnelStages.some((s) => s.value > 0);
	const ctr = (() => {
		if (funnelStages.length < 2) return null;
		const impressions = funnelStages[0]?.value ?? 0;
		const clicks = funnelStages[1]?.value ?? 0;
		if (impressions <= 0) return null;
		return clicks / impressions * 100;
	})();
	const convRate = (() => {
		if (funnelStages.length < 3) return null;
		const clicks = funnelStages[1]?.value ?? 0;
		const conversions = funnelStages[2]?.value ?? 0;
		if (clicks <= 0) return null;
		return conversions / clicks * 100;
	})();
	if (!funnelStages.length || !hasVolume) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsPanelEmpty, {
		title: "No funnel data for this range",
		description: `Sync ${providerLabel} and ensure impressions, clicks, or conversions are reported for the selected dates.`,
		actionHref: "#connect-ad-platforms",
		actionLabel: "Run sync"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					ctr !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FunnelMetricPill, {
						label: "CTR",
						value: `${ctr.toFixed(2)}%`
					}) : null,
					convRate !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FunnelMetricPill, {
						label: "Conv. rate",
						value: `${convRate.toFixed(2)}%`
					}) : null,
					analysis?.overallConversionRate !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FunnelMetricPill, {
						label: "End-to-end",
						value: `${analysis.overallConversionRate.toFixed(3)}%`
					}) : null,
					analysis?.bottleneckStage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: funnelBottleneckPillClass,
						children: ["Bottleneck: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: analysis.bottleneckStage
						})]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsChartShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsProportionalFunnel, { stages: funnelStages }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FunnelRecommendations, { analysis })
		]
	});
}
//#endregion
//#region src/features/dashboard/ads/components/insights-themed-charts.tsx
var DOMAIN_0_100 = [0, 100];
var DATE_TICK_OPTIONS = {
	month: "short",
	day: "numeric"
};
var RADAR_TOOLTIP_CONTENT = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltipContent, { hideLabel: true });
function formatDateTick(value) {
	return new Date(value).toLocaleDateString("en-US", DATE_TICK_OPTIONS);
}
function ProviderComparisonChart({ currency = "USD", data }) {
	const chartData = data.map((d) => ({
		name: d.displayName,
		spend: d.metrics.spend,
		revenue: d.metrics.revenue
	}));
	const hasData = chartData.some((d) => d.spend > 0 || d.revenue > 0);
	const spendFormatter = (value, name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: providerComparisonChartConfig[name]?.label ?? String(name)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-sm font-medium tabular-nums",
			children: name === "spend" || name === "revenue" ? formatMoney(Number(value), currency) : Number(value).toLocaleString()
		})]
	});
	const formatXAxis = (v) => formatMoney(v, currency);
	if (!hasData) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsPanelEmpty, {
		title: "No spend or revenue to compare",
		description: "Sync at least one platform with financial metrics in this date range.",
		actionHref: "#connect-ad-platforms",
		actionLabel: "Run sync"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderComparisonChartPlot, {
		chartData,
		formatXAxis,
		spendFormatter
	});
}
function ProviderComparisonChartPlot({ chartData, formatXAxis, spendFormatter }) {
	const tooltipContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltipContent, { formatter: spendFormatter });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsChartShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContainer, {
		config: providerComparisonChartConfig,
		className: ADS_CHART_CONTAINER_CLASSNAME,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
			data: chartData,
			layout: "vertical",
			margin: ADS_CHART_MARGIN_CATEGORY_Y,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					horizontal: true,
					vertical: false,
					strokeDasharray: "3 3",
					opacity: .2
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					type: "number",
					tickLine: false,
					axisLine: false,
					tickMargin: 8,
					style: ADS_AXIS_TICK_STYLE,
					tickFormatter: formatXAxis
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					type: "category",
					dataKey: "name",
					width: 88,
					tickLine: false,
					axisLine: false,
					tickMargin: 8,
					style: ADS_AXIS_TICK_STYLE
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					...ADS_CHART_TOOLTIP_PROPS,
					cursor: ADS_TOOLTIP_CURSOR,
					content: tooltipContent
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegend, { content: ADS_CHART_LEGEND }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "spend",
					fill: "var(--color-spend)",
					radius: [
						0,
						6,
						6,
						0
					],
					maxBarSize: 28
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "revenue",
					fill: "var(--color-revenue)",
					radius: [
						0,
						6,
						6,
						0
					],
					maxBarSize: 28
				})
			]
		})
	}) });
}
function EfficiencyRadarChart({ data, providerId, providerLabel }) {
	const chartData = (data[providerId] ?? []).map((b) => ({
		metric: b.dimension,
		score: Math.round(b.score)
	}));
	if (!chartData.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsPanelEmpty, {
		title: "No efficiency breakdown",
		description: `Need more synced metrics for ${providerLabel} to score delivery, cost, and conversion dimensions.`
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsChartShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContainer, {
		config: efficiencyRadarChartConfig,
		className: ADS_CHART_CONTAINER_CLASSNAME,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadarChart, {
			data: chartData,
			cx: "50%",
			cy: "50%",
			outerRadius: "72%",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarGrid, {
					stroke: "var(--border)",
					strokeOpacity: .6
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarAngleAxis, {
					dataKey: "metric",
					tick: ADS_AXIS_TICK_STYLE
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarRadiusAxis, {
					angle: 90,
					domain: DOMAIN_0_100,
					tick: ADS_AXIS_TICK_STYLE,
					tickCount: 4
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
					name: "Score",
					dataKey: "score",
					stroke: "var(--color-score)",
					fill: "var(--color-score)",
					fillOpacity: .35,
					strokeWidth: 2
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					...ADS_CHART_TOOLTIP_PROPS,
					content: RADAR_TOOLTIP_CONTENT
				})
			]
		})
	}) });
}
function SpendTrendChart({ currency = "USD", data, providerId, providerLabel }) {
	const trendData = data[providerId];
	if (!trendData || trendData.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsPanelEmpty, {
		title: "Not enough daily data for trends",
		description: `Trend lines need multiple days of spend for ${providerLabel}. Widen the date range or run another sync.`,
		actionHref: "#connect-ad-platforms",
		actionLabel: "Run sync"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpendTrendChartPlot, {
		currency,
		trendData
	});
}
function SpendTrendChartPlot({ currency, trendData }) {
	const currencyFormatter = (value, name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: spendTrendChartConfig[name]?.label ?? String(name)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-sm font-medium tabular-nums",
			children: formatMoney(Number(value), currency)
		})]
	});
	const formatYAxis = (v) => formatMoney(v, currency);
	const tooltipContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltipContent, {
		labelFormatter: formatDateTick,
		formatter: currencyFormatter
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsChartShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContainer, {
		config: spendTrendChartConfig,
		className: ADS_CHART_CONTAINER_CLASSNAME,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
			data: trendData,
			margin: ADS_CHART_MARGIN,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "fillSpendActualInsights",
					x1: "0",
					y1: "0",
					x2: "0",
					y2: "1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "5%",
						stopColor: "var(--color-actual)",
						stopOpacity: .28
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "95%",
						stopColor: "var(--color-actual)",
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
					style: ADS_AXIS_TICK_STYLE,
					tickFormatter: formatDateTick
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					tickLine: false,
					axisLine: false,
					tickMargin: 10,
					style: ADS_AXIS_TICK_STYLE,
					tickFormatter: formatYAxis
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					...ADS_CHART_TOOLTIP_PROPS,
					cursor: ADS_TOOLTIP_CURSOR,
					content: tooltipContent
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegend, { content: ADS_CHART_LEGEND }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					type: "monotone",
					dataKey: "actual",
					stroke: "var(--color-actual)",
					strokeWidth: 2,
					fill: "url(#fillSpendActualInsights)",
					dot: false,
					activeDot: ADS_ACTIVE_DOT
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
					type: "monotone",
					dataKey: "trend",
					stroke: "var(--color-trend)",
					strokeWidth: 2,
					strokeDasharray: "6 4",
					dot: false,
					activeDot: ADS_ACTIVE_DOT
				})
			]
		})
	}) });
}
function BenchmarkComparisonChart({ data, providerId, providerLabel }) {
	const chartData = (data[providerId] ?? []).map((b) => ({
		metric: b.metric,
		percentile: b.percentile,
		benchmark: 50
	}));
	if (!chartData.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsPanelEmpty, {
		title: "No benchmark comparison",
		description: `Industry benchmarks for ${providerLabel} need CTR, CPC, and conversion signals from your sync.`
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BenchmarkComparisonChartPlot, { chartData });
}
function BenchmarkComparisonChartPlot({ chartData }) {
	const percentileFormatter = (value, name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: benchmarkChartConfig[name]?.label ?? String(name)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "font-mono text-sm font-medium tabular-nums",
			children: [name === "benchmark" ? "50th" : `${Number(value)}th`, " percentile"]
		})]
	});
	const formatPercentTick = (value) => `${value}%`;
	const tooltipContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltipContent, { formatter: percentileFormatter });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsChartShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContainer, {
		config: benchmarkChartConfig,
		className: ADS_CHART_CONTAINER_CLASSNAME,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
			data: chartData,
			margin: ADS_CHART_MARGIN,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					vertical: false,
					strokeDasharray: "3 3",
					opacity: .2
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "metric",
					tickLine: false,
					axisLine: false,
					tickMargin: 10,
					style: ADS_AXIS_TICK_STYLE
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					domain: DOMAIN_0_100,
					tickLine: false,
					axisLine: false,
					tickMargin: 10,
					style: ADS_AXIS_TICK_STYLE,
					tickFormatter: formatPercentTick
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					...ADS_CHART_TOOLTIP_PROPS,
					cursor: ADS_TOOLTIP_CURSOR,
					content: tooltipContent
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegend, { content: ADS_CHART_LEGEND }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "benchmark",
					fill: "var(--color-benchmark)",
					fillOpacity: .35,
					radius: [
						6,
						6,
						0,
						0
					],
					maxBarSize: 36
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "percentile",
					fill: "var(--color-percentile)",
					radius: [
						6,
						6,
						0,
						0
					],
					maxBarSize: 36
				})
			]
		})
	}) });
}
//#endregion
//#region src/features/dashboard/ads/components/insights-charts-card.tsx
function InsightsChartsCard({ analysis, currency, providerCurrencies, loading = false, hasConnections = false, metricsDisplayState }) {
	const [selectedProvider, setSelectedProvider] = (0, import_react.useState)("all");
	const [tabSelection, setTabSelection] = (0, import_react.useState)(null);
	const analysisKey = (() => {
		if (!analysis) return "empty";
		return analysis.summaries.map((summary) => summary.providerId).join("|");
	})();
	const defaultActiveTab = analysis ? pickDefaultInsightsTab(analysis.chartData) : "comparison";
	const activeTab = tabSelection?.analysisKey === analysisKey ? tabSelection.tab : defaultActiveTab;
	const setActiveTab = (tab) => {
		setTabSelection({
			analysisKey,
			tab
		});
	};
	const providers = (() => {
		if (!analysis) return [];
		return analysis.summaries.map((s) => ({
			id: s.providerId,
			name: getProviderDisplayName(s.providerId)
		}));
	})();
	const activeProvider = resolveChartProviderKey(selectedProvider, analysis ? Object.keys(analysis.chartData.funnelCharts) : []);
	const chartCurrency = resolveInsightsChartCurrency(selectedProvider, currency, providerCurrencies ?? {});
	const providerLabel = getProviderDisplayName(activeProvider);
	const tabAvailability = (() => {
		if (!analysis) return {
			comparison: false,
			efficiency: false,
			trends: false,
			funnel: false,
			benchmarks: false
		};
		const chartData = analysis.chartData;
		return {
			comparison: tabHasChartData("comparison", chartData, activeProvider),
			efficiency: tabHasChartData("efficiency", chartData, activeProvider),
			trends: tabHasChartData("trends", chartData, activeProvider),
			funnel: tabHasChartData("funnel", chartData, activeProvider),
			benchmarks: tabHasChartData("benchmarks", chartData, activeProvider)
		};
	})();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsChartsLoadingState, {});
	if (!analysis || analysis.summaries.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsChartsEmptyState, {
		hasConnections,
		metricsDisplayState
	});
	const funnelStages = analysis.chartData.funnelCharts[activeProvider];
	const funnelAnalysis = analysis.funnels[activeProvider] ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.surfaceCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsChartsHeader, {
			onSelectedProviderChange: setSelectedProvider,
			providers,
			providersCount: providers.length,
			selectedProvider
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InsightsChartsTabs, {
			activeTab,
			onTabChange: setActiveTab,
			tabAvailability,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsChartPanel, {
					value: "comparison",
					title: "Spend vs Revenue by Platform",
					description: "Compare financial performance across connected platforms",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderComparisonChart, {
						currency: chartCurrency,
						data: analysis.chartData.providerComparison
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsChartPanel, {
					value: "efficiency",
					title: "Efficiency Breakdown",
					description: "Multi-dimensional performance analysis",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EfficiencyRadarChart, {
						data: analysis.chartData.efficiencyBreakdown,
						providerId: activeProvider,
						providerLabel
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsChartPanel, {
					value: "trends",
					title: "Spend Trend Analysis",
					description: "Historical spend with trend line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpendTrendChart, {
						currency: chartCurrency,
						data: analysis.chartData.trendCharts,
						providerId: activeProvider,
						providerLabel
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsChartPanel, {
					value: "funnel",
					title: "Conversion Funnel",
					description: "Impressions → Clicks → Conversions drop-off analysis",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsFunnelPanel, {
						stages: funnelStages,
						analysis: funnelAnalysis,
						providerLabel
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsChartPanel, {
					value: "benchmarks",
					title: "Industry Benchmarks",
					description: "How you compare to industry averages",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BenchmarkComparisonChart, {
						data: analysis.chartData.benchmarkCharts,
						providerId: activeProvider,
						providerLabel
					})
				})
			]
		})]
	});
}
//#endregion
export { InsightsChartsCard };
