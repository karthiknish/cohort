import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { H as getPreviewProposals } from "./preview-data-CXkRNfsX.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { a as notifyInfo } from "./notifications-DQZKskhM.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { R as proposalAnalyticsApi } from "./convex-api-msEHRhRb.mjs";
import { An as FileText, J as Send, Sr as ChartColumn, Yt as LoaderCircle, Zn as Clock, b as TriangleAlert, nr as CircleX, or as CircleCheck, rt as RefreshCw, x as TrendingUp } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { t as PageMotionShell } from "./page-motion-shell-Ci2leIYf.mjs";
import { t as Progress } from "./progress-C-kxMCfG.mjs";
import { t as ClientFormattedDate } from "./client-formatted-date-CcMUTrKu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analytics-DrYgbmCQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SummaryStatCard({ iconKey, label, toneClassName, value }) {
	const icon = iconKey === "drafts" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-5 text-primary" }) : iconKey === "submitted" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-success" }) : iconKey === "sent" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-5 text-info" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-5 text-warning" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
		className: "pt-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `flex size-10 items-center justify-center rounded-full ${toneClassName}`,
				children: icon
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xl font-bold",
				children: value
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: label
			})] })]
		})
	}) });
}
function ProposalAnalyticsChartBar({ point, maxGenerations }) {
	const totalGenerations = point.aiGenerations + point.deckGenerations;
	const totalFailures = point.aiFailures + point.deckFailures;
	const height = totalGenerations / maxGenerations * 100;
	const failureHeight = totalFailures > 0 && totalGenerations > 0 ? Math.min(totalFailures / totalGenerations * height, height) : 0;
	const barStyle = { height: `${Math.max(height, 4)}%` };
	const failureStyle = { height: `${failureHeight}%` };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-1 flex-col justify-end",
		title: `${point.date}: ${totalGenerations} generations, ${totalFailures} failures`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative w-full rounded-t bg-accent/20 motion-chromatic hover:bg-accent/30",
			style: barStyle,
			children: failureHeight > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-0 bottom-0 rounded-t bg-destructive/50",
				style: failureStyle
			}) : null
		})
	});
}
function SuccessRateCard({ averageDuration, description, failedCount, succeededCount, title, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "pb-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-base",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: description })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-3xl font-bold text-primary",
					children: value
				}), failedCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "destructive",
					className: "gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3" }),
						failedCount,
						" failed"
					]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: Number.parseFloat(value),
				className: "h-2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3 text-success" }),
						succeededCount,
						" succeeded"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3" }),
						averageDuration,
						" avg"
					]
				})]
			})
		]
	})] });
}
function ProposalAnalyticsLoadingCard() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
		className: "flex items-center justify-center py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-muted-foreground" })
	}) });
}
function ProposalAnalyticsHeader({ loading, onRefresh, onTimeRangeChange, timeRange }) {
	const handleTimeRangeChange = (value) => {
		onTimeRangeChange(value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-xl font-semibold",
			children: "Proposal Analytics"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Track proposal generation success rates and performance"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: timeRange,
				onValueChange: handleTimeRangeChange,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "w-36",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "7d",
						children: "Last 7 days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "30d",
						children: "Last 30 days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "90d",
						children: "Last 90 days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "365d",
						children: "Last year"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "All time"
					})
				] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "icon",
				onClick: onRefresh,
				disabled: loading,
				"aria-label": "Refresh proposal analytics",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${loading ? "animate-spin" : ""}` })
			})]
		})]
	});
}
function ProposalAnalyticsSummaryGrid({ summary, formatDuration }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryStatCard, {
				iconKey: "drafts",
				label: "Drafts Created",
				toneClassName: "bg-accent/10",
				value: summary.totalDrafts
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryStatCard, {
				iconKey: "submitted",
				label: "Proposals Submitted",
				toneClassName: "bg-success/10",
				value: summary.totalSubmitted
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryStatCard, {
				iconKey: "sent",
				label: "Proposals Sent",
				toneClassName: "bg-info/10",
				value: summary.totalSent
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryStatCard, {
				iconKey: "average",
				label: "Avg. AI Generation",
				toneClassName: "bg-warning/10",
				value: formatDuration(summary.averageAiGenerationTime)
			})
		]
	});
}
function ProposalAnalyticsSuccessRates({ formatDuration, formatPercentage, summary }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuccessRateCard, {
			averageDuration: formatDuration(summary.averageAiGenerationTime),
			description: `${summary.aiGenerationsSucceeded} of ${summary.aiGenerationsAttempted} generations successful`,
			failedCount: summary.aiGenerationsFailed,
			succeededCount: summary.aiGenerationsSucceeded,
			title: "AI Generation Success Rate",
			value: formatPercentage(summary.successRate)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuccessRateCard, {
			averageDuration: formatDuration(summary.averageDeckGenerationTime),
			description: `${summary.deckGenerationsSucceeded} of ${summary.deckGenerationsAttempted} deck generations successful`,
			failedCount: summary.deckGenerationsFailed,
			succeededCount: summary.deckGenerationsSucceeded,
			title: "Deck Generation Success Rate",
			value: formatPercentage(summary.deckSuccessRate)
		})]
	});
}
function ProposalAnalyticsActivityChart({ chartData }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "pb-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "flex items-center gap-2 text-base",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4" }), "Generation Activity"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
			"AI and deck generations over the last ",
			chartData.points.length,
			" days"
		] })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-32 items-end gap-1",
			children: chartData.points.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalAnalyticsChartBar, {
				point,
				maxGenerations: chartData.maxGenerations
			}, point.date))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 flex items-center justify-between text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: chartData.points[0]?.date }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: chartData.points[chartData.points.length - 1]?.date })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex items-center justify-center gap-4 text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-accent/40" }),
					"Generations (",
					chartData.totalGenerations,
					")"
				]
			}), chartData.totalFailures > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-destructive/50" }),
					"Failures (",
					chartData.totalFailures,
					")"
				]
			}) : null]
		})
	] })] });
}
function ProposalAnalyticsByClientCard({ byClient }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "pb-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "flex items-center gap-2 text-base",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4" }), "Proposals by Client"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
			"Top ",
			Math.min(byClient.length, 10),
			" clients by proposal count"
		] })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: byClient.slice(0, 10).map((client) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between rounded-md border border-muted/40 px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: client.clientName
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"Last proposal:",
					" ",
					client.lastProposalAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientFormattedDate, {
						value: client.lastProposalAt,
						formatStr: "PPP",
						dateTime: client.lastProposalAt
					}) : "N/A"
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						children: [client.proposalCount, " drafts"]
					}),
					client.submittedCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "secondary",
						children: [client.submittedCount, " submitted"]
					}) : null,
					client.sentCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						className: "bg-success/10 text-success hover:bg-success/20",
						children: [client.sentCount, " sent"]
					}) : null
				]
			})]
		}, client.clientId))
	}) })] });
}
function ProposalAnalyticsEmptyState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "flex flex-col items-center justify-center py-12 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 rounded-full bg-muted/30 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-8 text-warning/60" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-lg font-semibold",
				children: "No Analytics Data"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-sm text-sm text-muted-foreground",
				children: "Start creating proposals to see analytics data here. Track AI generation success rates, deck creation performance, and more."
			})
		]
	}) });
}
function getDateRange(range) {
	if (range === "all") return void 0;
	const endDate = /* @__PURE__ */ new Date();
	const startDate = /* @__PURE__ */ new Date();
	switch (range) {
		case "7d":
			startDate.setDate(startDate.getDate() - 7);
			break;
		case "30d":
			startDate.setDate(startDate.getDate() - 30);
			break;
		case "90d":
			startDate.setDate(startDate.getDate() - 90);
			break;
		case "365d":
			startDate.setDate(startDate.getDate() - 365);
			break;
	}
	return {
		startDate: startDate.toISOString().split("T")[0] ?? startDate.toISOString(),
		endDate: endDate.toISOString().split("T")[0] ?? endDate.toISOString()
	};
}
function formatDuration(ms) {
	if (ms === null) return "N/A";
	if (ms < 1e3) return `${Math.round(ms)}ms`;
	if (ms < 6e4) return `${(ms / 1e3).toFixed(1)}s`;
	return `${(ms / 6e4).toFixed(1)}m`;
}
function formatPercentage(value) {
	return `${value.toFixed(1)}%`;
}
function ProposalAnalyticsCard() {
	const { user } = useAuth();
	const { isPreviewMode } = usePreview();
	const workspaceId = user?.agencyId ?? null;
	const [timeRange, setTimeRange] = (0, import_react.useState)("30d");
	const dateRange = getDateRange(timeRange);
	const startDateMs = (() => {
		if (!dateRange?.startDate) return void 0;
		const d = new Date(dateRange.startDate);
		return Number.isNaN(d.getTime()) ? void 0 : d.getTime();
	})();
	const endDateMs = (() => {
		if (!dateRange?.endDate) return void 0;
		const d = new Date(dateRange.endDate);
		if (Number.isNaN(d.getTime())) return void 0;
		d.setHours(23, 59, 59, 999);
		return d.getTime();
	})();
	const summaryRes = useQuery(proposalAnalyticsApi.summarize, !isPreviewMode && workspaceId ? {
		workspaceId,
		startDateMs,
		endDateMs,
		limit: 1e3
	} : "skip");
	const timeSeriesRes = useQuery(proposalAnalyticsApi.timeSeries, !isPreviewMode && workspaceId ? {
		workspaceId,
		startDateMs,
		endDateMs,
		limit: 1e3
	} : "skip");
	const byClientRes = useQuery(proposalAnalyticsApi.byClient, !isPreviewMode && workspaceId ? {
		workspaceId,
		startDateMs,
		endDateMs,
		limit: 1e3
	} : "skip");
	const previewProposals = getPreviewProposals(null);
	const previewSummary = {
		totalDrafts: previewProposals.length,
		totalSubmitted: previewProposals.filter((proposal) => proposal.status === "ready" || proposal.status === "sent").length,
		totalSent: previewProposals.filter((proposal) => proposal.status === "sent").length,
		aiGenerationsAttempted: 12,
		aiGenerationsSucceeded: 11,
		aiGenerationsFailed: 1,
		deckGenerationsAttempted: 9,
		deckGenerationsSucceeded: 8,
		deckGenerationsFailed: 1,
		averageAiGenerationTime: 24e3,
		averageDeckGenerationTime: 71e3,
		successRate: 11 / 12 * 100,
		deckSuccessRate: 8 / 9 * 100
	};
	const previewTimeSeries = (() => {
		const points = [];
		for (let offset = 13; offset >= 0; offset -= 1) {
			const date = isoDateDaysAgo(offset);
			const matching = previewProposals.filter((proposal) => (proposal.createdAt ?? "").startsWith(date));
			points.push({
				date,
				draftsCreated: matching.length,
				proposalsSubmitted: matching.filter((proposal) => proposal.status === "ready" || proposal.status === "sent").length,
				aiGenerations: matching.length > 0 ? matching.length + 1 : 0,
				aiFailures: offset === 6 ? 1 : 0,
				deckGenerations: matching.filter((proposal) => proposal.presentationDeck).length,
				deckFailures: offset === 4 ? 1 : 0
			});
		}
		return points;
	})();
	const previewByClient = (() => {
		const grouped = /* @__PURE__ */ new Map();
		previewProposals.forEach((proposal) => {
			const clientKey = proposal.clientId ?? "unknown-client";
			const current = grouped.get(clientKey);
			if (!current) {
				grouped.set(clientKey, {
					clientId: clientKey,
					clientName: proposal.clientName ?? "Unknown client",
					proposalCount: 1,
					submittedCount: proposal.status === "ready" || proposal.status === "sent" ? 1 : 0,
					sentCount: proposal.status === "sent" ? 1 : 0,
					lastProposalAt: proposal.updatedAt ?? proposal.createdAt ?? null
				});
				return;
			}
			current.proposalCount += 1;
			if (proposal.status === "ready" || proposal.status === "sent") current.submittedCount += 1;
			if (proposal.status === "sent") current.sentCount += 1;
			if (!current.lastProposalAt || proposal.updatedAt && proposal.updatedAt > current.lastProposalAt) current.lastProposalAt = proposal.updatedAt ?? proposal.createdAt ?? current.lastProposalAt;
		});
		return Array.from(grouped.values()).sort((left, right) => right.proposalCount - left.proposalCount);
	})();
	const summary = isPreviewMode ? previewSummary : summaryRes?.summary;
	const timeSeries = isPreviewMode ? previewTimeSeries : timeSeriesRes?.timeseries ?? [];
	const byClient = isPreviewMode ? previewByClient : byClientRes?.byClient ?? [];
	const loading = isPreviewMode ? false : summaryRes === void 0 || timeSeriesRes === void 0 || byClientRes === void 0;
	const handleRefresh = () => {
		notifyInfo({
			title: isPreviewMode ? "Preview data refreshed" : "Refreshing…",
			message: isPreviewMode ? "Showing sample proposal analytics." : "Analytics will update automatically."
		});
	};
	const chartData = (() => {
		if (timeSeries.length === 0) return null;
		return {
			maxGenerations: Math.max(...timeSeries.map((p) => p.aiGenerations + p.deckGenerations), 1),
			totalGenerations: timeSeries.reduce((sum, p) => sum + p.aiGenerations + p.deckGenerations, 0),
			totalFailures: timeSeries.reduce((sum, p) => sum + p.aiFailures + p.deckFailures, 0),
			points: timeSeries.slice(-14)
		};
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalAnalyticsLoadingCard, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalAnalyticsHeader, {
					loading,
					onRefresh: handleRefresh,
					onTimeRangeChange: setTimeRange,
					timeRange
				}),
				summary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalAnalyticsSummaryGrid, {
					summary,
					formatDuration
				}) : null,
				summary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalAnalyticsSuccessRates, {
					summary,
					formatDuration,
					formatPercentage
				}) : null,
				chartData && chartData.points.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalAnalyticsActivityChart, { chartData }) : null,
				byClient.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalAnalyticsByClientCard, { byClient }) : null,
				summary && summary.totalDrafts === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalAnalyticsEmptyState, {}) : null
			]
		})
	});
}
function isoDateDaysAgo(daysAgo) {
	const now = typeof window === "undefined" ? /* @__PURE__ */ new Date("2024-01-15T12:00:00.000Z") : /* @__PURE__ */ new Date();
	const date = new Date(now);
	date.setDate(date.getDate() - daysAgo);
	return date.toISOString().split("T")[0] ?? now.toISOString().split("T")[0] ?? now.toISOString();
}
function ProposalAnalyticsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionShell, {
		reveal: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "container mx-auto max-w-6xl py-6 px-4 sm:px-6 lg:px-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalAnalyticsCard, {})
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalAnalyticsPage, {});
//#endregion
export { SplitComponent as component };
