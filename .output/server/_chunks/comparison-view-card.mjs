import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { Nt as Minus, S as TrendingDown, Vr as ArrowRight, an as Layers, wr as Calendar, x as TrendingUp } from "../_libs/lucide-react.mjs";
import { r as formatCurrency, t as cn } from "./utils.mjs";
import { t as Badge } from "./badge.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card.mjs";
import { t as Skeleton } from "./skeleton.mjs";
import { r as formatProviderName } from "./themes.mjs";
import { a as TabsList, i as TabsTrigger, r as TabsContent, t as Tabs } from "./tabs.mjs";
import { f as PROVIDER_ICON_MAP } from "./utils2.mjs";
import { t as usePersistedTab } from "./use-persisted-tab.mjs";
//#region src/features/dashboard/ads/components/comparison-view-card-sections.tsx
var import_jsx_runtime = require_jsx_runtime();
function formatMoneyValue(value, currency) {
	if (!currency) return value.toLocaleString(void 0, { maximumFractionDigits: 2 });
	return formatCurrency(value, currency);
}
function formatValue(value, format, currency) {
	if (value === null || !Number.isFinite(value)) return "—";
	if (format === "currency") return formatMoneyValue(value, currency);
	if (format === "percent") return `${(value * 100).toFixed(2)}%`;
	return value.toLocaleString(void 0, { maximumFractionDigits: 0 });
}
function TrendIndicator({ delta, invertTrend }) {
	if (delta === null || Math.abs(delta) < 1e-4) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
		className: "size-4 text-muted-foreground",
		"aria-label": "No change"
	});
	const isPositive = delta > 0;
	const isGood = invertTrend ? !isPositive : isPositive;
	const label = isPositive ? `Trending up ${isGood ? "(improvement)" : "(concern)"}` : `Trending down ${isGood ? "(improvement)" : "(concern)"}`;
	return isPositive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, {
		className: cn("size-4", isGood ? "text-success" : "text-destructive"),
		"aria-label": label
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, {
		className: cn("size-4", isGood ? "text-success" : "text-destructive"),
		"aria-label": label
	});
}
function MetricRow({ current, currency, delta, deltaPercent, format, invertTrend, label, previous }) {
	const isPositive = delta !== null && delta > 0;
	const isGood = invertTrend ? !isPositive : isPositive;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between border-b border-muted/40 py-3 last:border-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm font-medium text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-muted-foreground",
						children: "Previous"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium",
						children: formatValue(previous, format, currency)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 text-muted-foreground" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-muted-foreground",
						children: "Current"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold",
						children: formatValue(current, format, currency)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-[100px] items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendIndicator, {
						delta,
						invertTrend
					}), deltaPercent !== null && Math.abs(deltaPercent) >= .01 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "secondary",
						className: cn("text-xs", isGood ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"),
						children: [
							deltaPercent > 0 ? "+" : "",
							deltaPercent.toFixed(1),
							"%"
						]
					}) : null]
				})
			]
		})]
	});
}
function PeriodComparisonView({ comparison, currency }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-1",
		children: [
			{
				label: "Spend",
				current: comparison.current.spend,
				previous: comparison.previous.spend,
				delta: comparison.delta.spend,
				deltaPercent: comparison.deltaPercent.spend,
				format: "currency",
				invertTrend: true
			},
			{
				label: "Impressions",
				current: comparison.current.impressions,
				previous: comparison.previous.impressions,
				delta: comparison.delta.impressions,
				deltaPercent: comparison.deltaPercent.impressions,
				format: "number"
			},
			{
				label: "Clicks",
				current: comparison.current.clicks,
				previous: comparison.previous.clicks,
				delta: comparison.delta.clicks,
				deltaPercent: comparison.deltaPercent.clicks,
				format: "number"
			},
			{
				label: "Conversions",
				current: comparison.current.conversions,
				previous: comparison.previous.conversions,
				delta: comparison.delta.conversions,
				deltaPercent: comparison.deltaPercent.conversions,
				format: "number"
			},
			{
				label: "Revenue",
				current: comparison.current.revenue,
				previous: comparison.previous.revenue,
				delta: comparison.delta.revenue,
				deltaPercent: comparison.deltaPercent.revenue,
				format: "currency"
			},
			{
				label: "CTR",
				current: comparison.current.ctr,
				previous: comparison.previous.ctr,
				delta: comparison.delta.ctr,
				deltaPercent: comparison.deltaPercent.ctr,
				format: "percent"
			},
			{
				label: "ROAS",
				current: comparison.current.roas,
				previous: comparison.previous.roas,
				delta: comparison.delta.roas,
				deltaPercent: comparison.deltaPercent.roas,
				format: "number"
			}
		].map((metric) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricRow, {
			currency,
			...metric
		}, metric.label))
	});
}
function ProviderComparisonView({ currency, providerCurrencies, providers }) {
	if (providers.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No provider data available for comparison." })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
		children: providers.map((provider) => {
			const ProviderIcon = PROVIDER_ICON_MAP[provider.providerId];
			const providerCurrency = providerCurrencies?.[provider.providerId] ?? currency;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-muted/60 bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "flex items-center gap-2 text-base",
						children: [ProviderIcon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderIcon, { className: "size-4" }) : null, formatProviderName(provider.providerId)]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-2xl font-semibold",
						children: formatMoneyValue(provider.metrics.spend, providerCurrency)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium text-muted-foreground",
								children: "CTR"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-foreground",
								children: provider.metrics.ctr !== null ? `${(provider.metrics.ctr * 100).toFixed(2)}%` : "—"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium text-muted-foreground",
								children: "ROAS"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-foreground",
								children: provider.metrics.roas !== null ? provider.metrics.roas.toFixed(2) : "—"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium text-muted-foreground",
								children: "CPA"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-foreground",
								children: provider.metrics.cpa !== null ? formatMoneyValue(provider.metrics.cpa, providerCurrency) : "—"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium text-muted-foreground",
								children: "Conversions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-foreground",
								children: provider.metrics.conversions.toLocaleString()
							})] })
						]
					})]
				})]
			}, provider.providerId);
		})
	});
}
function ComparisonViewLoadingCard() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "flex items-center gap-2 text-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-5" }), "Comparison View"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Compare performance across periods and platforms" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full" })]
		}) })]
	});
}
function ComparisonViewCardShell({ currency, onTabChange, periodComparison, providerComparison, providerCurrencies, selectedTab }) {
	const handleTabChange = (value) => {
		onTabChange(value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "flex items-center gap-2 text-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-5" }), "Comparison View"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Compare performance across periods and platforms" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: selectedTab,
			onValueChange: handleTabChange,
			className: "w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "grid w-full grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: "period",
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-4" }), "Period"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: "platform",
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-4" }), "Platform"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "period",
					className: "mt-4",
					children: periodComparison ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeriodComparisonView, {
						comparison: periodComparison,
						currency
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-8 opacity-50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Not enough data for period comparison. Need at least two periods of data." })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "platform",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderComparisonView, {
						currency,
						providerCurrencies,
						providers: providerComparison
					})
				})
			]
		}) })]
	});
}
//#endregion
//#region src/features/dashboard/ads/components/comparison-view-card.tsx
function ComparisonViewCard({ periodComparison, providerComparison, currency, providerCurrencies, loading }) {
	const viewTabs = usePersistedTab({
		defaultValue: "period",
		allowedValues: ["period", "platform"],
		storageNamespace: "dashboard:ads:comparison",
		param: "compareTab",
		syncToUrl: true
	});
	return loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComparisonViewLoadingCard, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComparisonViewCardShell, {
		currency,
		onTabChange: viewTabs.setValue,
		periodComparison,
		providerComparison,
		providerCurrencies,
		selectedTab: viewTabs.value
	});
}
//#endregion
export { ComparisonViewCard };
