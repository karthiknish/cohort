import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { r as formatProviderName } from "./themes-DBvmOGm7.mjs";
import { Vr as ArrowRight, b as TriangleAlert, nn as Lightbulb, or as CircleCheck, r as Zap, un as Info, x as TrendingUp } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/algorithmic-insights-card-BIXfbVVk.js
var import_jsx_runtime = require_jsx_runtime();
function InsightLevelIcon({ level }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)({
		success: CircleCheck,
		info: Info,
		warning: TriangleAlert,
		critical: Zap
	}[level] || Info, { className: "size-4 shrink-0" });
}
function InsightLevelBadge({ level }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "outline",
		className: cn("text-[10px] font-semibold uppercase", {
			success: "bg-success/10 text-success border-success/20",
			info: "bg-info/10 text-info border-info/20",
			warning: "bg-warning/10 text-warning border-warning/20",
			critical: "bg-destructive/10 text-destructive border-destructive/20"
		}[level]),
		children: {
			success: "Performing Well",
			info: "Suggestion",
			warning: "Needs Attention",
			critical: "Critical"
		}[level]
	});
}
function InsightItem({ compact, insight }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-lg border border-l-4 bg-background p-4 transition-colors hover:bg-muted/50", {
			success: "border-l-success",
			info: "border-l-info",
			warning: "border-l-warning",
			critical: "border-l-destructive"
		}[insight.level]),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("mt-0.5 rounded-full p-1", insight.level === "success" && "bg-success/10 text-success", insight.level === "info" && "bg-info/10 text-info", insight.level === "warning" && "bg-warning/10 text-warning", insight.level === "critical" && "bg-destructive/10 text-destructive"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightLevelIcon, { level: insight.level })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 space-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "text-sm font-semibold",
								children: insight.title
							}), !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightLevelBadge, { level: insight.level }) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: insight.message
						}),
						!compact && insight.suggestion ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-start gap-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "mt-0.5 size-3.5 shrink-0 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: insight.suggestion })]
						}) : null
					]
				}),
				insight.score !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-lg font-bold",
						children: insight.score
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "/100"
					})]
				}) : null
			]
		})
	});
}
function getInsightKey(insight) {
	return insight.id || `${insight.type}-${insight.level}-${insight.title}-${insight.message}`;
}
function EfficiencyScoreRing({ score, size = "md" }) {
	const d = {
		sm: {
			container: "size-20",
			text: "text-xl",
			label: "text-[8px]",
			radius: 32,
			stroke: 6
		},
		md: {
			container: "size-28",
			text: "text-3xl",
			label: "text-[10px]",
			radius: 38,
			stroke: 7
		},
		lg: {
			container: "size-36",
			text: "text-4xl",
			label: "text-xs",
			radius: 42,
			stroke: 8
		}
	}[size];
	const circumference = 2 * Math.PI * d.radius;
	const offset = circumference * (1 - score / 100);
	const performanceLevel = score > 70 ? "good" : score > 40 ? "moderate" : "needs improvement";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: cn("relative flex items-center justify-center", d.container),
		"aria-label": `Efficiency Score: ${score} out of 100, performance is ${performanceLevel}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			className: "size-full",
			viewBox: "0 0 100 100",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				className: "stroke-muted/20",
				strokeWidth: d.stroke,
				fill: "transparent",
				r: d.radius,
				cx: "50",
				cy: "50"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				className: cn("motion-chromatic-xslow", score > 70 ? "stroke-success" : score > 40 ? "stroke-warning" : "stroke-destructive"),
				strokeWidth: d.stroke,
				strokeDasharray: circumference,
				strokeDashoffset: offset,
				strokeLinecap: "round",
				fill: "transparent",
				r: d.radius,
				cx: "50",
				cy: "50",
				transform: "rotate(-90 50 50)"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-0 flex flex-col items-center justify-center",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("font-black tracking-tighter", d.text),
				children: score
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("font-bold uppercase tracking-widest text-muted-foreground/60", d.label),
				children: "Score"
			})]
		})]
	});
}
function InsightsSkeleton({ compact }) {
	if (compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: [
			"a",
			"b",
			"c"
		].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-lg" }, slot))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full rounded-lg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3 lg:col-span-2",
			children: [
				"d",
				"e",
				"f"
			].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-lg" }, slot))
		})]
	});
}
function AlgorithmicInsightsLoadingCard({ compact, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-lg",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Analyzing your performance data…" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsSkeleton, { compact }) })]
	});
}
function AlgorithmicInsightsEmptyCard({ description, emptyMessage, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "flex items-center gap-2 text-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-5 text-warning" }), title]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: description })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-8 text-muted-foreground/50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: emptyMessage })]
		}) })]
	});
}
function AlgorithmicInsightsCompactCard({ criticalCount, displayedInsights, globalEfficiencyScore, hasMoreInsights, insightsCount, onViewAll, title, warningCount }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2 text-base",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-4 text-warning" }),
						title,
						criticalCount > 0 || warningCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "border-warning/50 text-xs text-warning",
							children: [
								criticalCount + warningCount,
								" action",
								criticalCount + warningCount !== 1 ? "s" : "",
								" needed"
							]
						}) : null
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EfficiencyScoreRing, {
						score: globalEfficiencyScore,
						size: "sm"
					})
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-2",
			children: [displayedInsights.map((insight) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightItem, {
				insight,
				compact: true
			}, getInsightKey(insight))), hasMoreInsights && onViewAll ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				className: "w-full",
				onClick: onViewAll,
				children: [
					"View all ",
					insightsCount,
					" insights",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1 size-3" })
				]
			}) : null]
		})]
	});
}
function AlgorithmicInsightsFullCard({ criticalCount, description, displayedInsights, globalEfficiencyScore, hasMoreInsights, onViewAll, providerEfficiencyScores, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2 text-lg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-5 text-warning" }),
					title,
					criticalCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "destructive",
						className: "text-xs",
						children: [criticalCount, " critical"]
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: description })] }), onViewAll && hasMoreInsights ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: onViewAll,
				children: ["View all insights", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1 size-3" })]
			}) : null]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center gap-y-4 rounded-lg border bg-muted/30 p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EfficiencyScoreRing, {
						score: globalEfficiencyScore,
						size: "lg"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Overall Efficiency"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: globalEfficiencyScore > 70 ? "Your campaigns are performing well" : globalEfficiencyScore > 40 ? "There is room for improvement" : "Immediate attention recommended"
						})]
					}),
					Object.keys(providerEfficiencyScores).length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap justify-center gap-2",
						children: Object.entries(providerEfficiencyScores).map(([provider, score]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "text-xs",
							children: [
								formatProviderName(provider),
								": ",
								score,
								"%"
							]
						}, provider))
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3 lg:col-span-2",
				children: displayedInsights.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-8 text-success" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: "All systems nominal"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No immediate actions required. Keep up the good work!"
						})
					]
				}) : displayedInsights.map((insight) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightItem, { insight }, getInsightKey(insight)))
			})]
		}) })]
	});
}
function AlgorithmicInsightsCard({ insights, globalEfficiencyScore, providerEfficiencyScores, loading = false, compact = false, maxInsights = 5, onViewAll, title = "AI-Powered Insights", description = "Algorithmic analysis of your cross-platform ad performance", emptyMessage = "Connect ad platforms and sync data to receive AI-powered insights." }) {
	const displayedInsights = (Array.isArray(insights) ? insights : []).slice(0, maxInsights);
	const hasMoreInsights = (Array.isArray(insights) ? insights : []).length > maxInsights;
	const criticalCount = (Array.isArray(insights) ? insights : []).filter((i) => i.level === "critical").length;
	const warningCount = (Array.isArray(insights) ? insights : []).filter((i) => i.level === "warning").length;
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlgorithmicInsightsLoadingCard, {
		title,
		compact
	});
	if (insights.length === 0 && globalEfficiencyScore === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlgorithmicInsightsEmptyCard, {
		title,
		description,
		emptyMessage
	});
	if (compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlgorithmicInsightsCompactCard, {
		criticalCount,
		displayedInsights,
		globalEfficiencyScore,
		hasMoreInsights,
		insightsCount: insights.length,
		onViewAll,
		title,
		warningCount
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlgorithmicInsightsFullCard, {
		criticalCount,
		description,
		displayedInsights,
		globalEfficiencyScore,
		hasMoreInsights,
		onViewAll,
		providerEfficiencyScores,
		title
	});
}
//#endregion
export { AlgorithmicInsightsCard };
