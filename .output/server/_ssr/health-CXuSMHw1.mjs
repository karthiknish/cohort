import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { g as getPreviewAdminHealthData } from "./preview-data-CXkRNfsX.mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { g as formatDistanceToNow } from "../_libs/date-fns.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { Ct as Package, G as Settings, Jr as Activity, Kt as Mail, Un as Database, Zn as Clock, cr as CircleAlert, fr as ChevronUp, hr as ChevronDown, nr as CircleX, or as CircleCheck, q as Server, r as Zap, rt as RefreshCw, vr as ChartPie, xn as Globe } from "../_libs/lucide-react.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { i as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as AdminPageShell } from "./admin-page-shell-DKKo3NPm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/health-CXuSMHw1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SERVICE_META = {
	convex: {
		label: "Convex",
		description: "Realtime database and backend functions"
	},
	betterauth: {
		label: "Better Auth",
		description: "Authentication and session plumbing"
	},
	gemini: {
		label: "Gemini",
		description: "AI summaries and admin intelligence"
	},
	posthog: {
		label: "PostHog",
		description: "Product analytics and event tracking"
	},
	brevo: {
		label: "Brevo",
		description: "Transactional email delivery"
	},
	googleads: {
		label: "Google Ads",
		description: "Ads OAuth and sync configuration"
	},
	googleanalytics: {
		label: "Google Analytics",
		description: "Analytics OAuth and property sync configuration"
	},
	metaads: {
		label: "Meta Ads",
		description: "Meta OAuth and ads sync configuration"
	},
	linkedinads: {
		label: "LinkedIn Ads",
		description: "LinkedIn OAuth and ads sync configuration"
	},
	tiktokads: {
		label: "TikTok Ads",
		description: "TikTok OAuth and ads sync configuration"
	},
	googleworkspace: {
		label: "Google Workspace",
		description: "Calendar and Meet integration"
	},
	livekit: {
		label: "LiveKit",
		description: "Meeting room and token infrastructure"
	},
	environment: {
		label: "Environment",
		description: "Base runtime configuration"
	}
};
async function fetchHealthData() {
	const json = await (await fetch("/api/health", {
		cache: "no-store",
		headers: { "Cache-Control": "no-cache" }
	})).json();
	if (json.data) return json.data;
	if (json.status) return json;
	throw new Error("Invalid health response format");
}
function formatUptime(seconds) {
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor(seconds % 86400 / 3600);
	const minutes = Math.floor(seconds % 3600 / 60);
	if (days > 0) return `${days}d ${hours}h ${minutes}m`;
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${minutes}m`;
}
function getStatusIcon(status) {
	switch (status) {
		case "ok":
		case "healthy": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
			className: "size-5 text-success",
			"aria-hidden": true
		});
		case "warning":
		case "degraded": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
			className: "size-5 text-warning",
			"aria-hidden": true
		});
		default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, {
			className: "size-5 text-destructive",
			"aria-hidden": true
		});
	}
}
function getStatusBadgeColor(status) {
	switch (status) {
		case "ok":
		case "healthy": return "bg-success/10 text-success";
		case "warning":
		case "degraded": return "bg-warning/10 text-warning";
		default: return "bg-destructive/10 text-destructive";
	}
}
function getServiceIcon(name) {
	switch (name.toLowerCase()) {
		case "convex": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, {
			className: "size-4",
			"aria-hidden": true
		});
		case "betterauth": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Server, {
			className: "size-4",
			"aria-hidden": true
		});
		case "gemini": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
			className: "size-4",
			"aria-hidden": true
		});
		case "brevo": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {
			className: "size-4",
			"aria-hidden": true
		});
		case "posthog": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPie, {
			className: "size-4",
			"aria-hidden": true
		});
		case "googleworkspace": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, {
			className: "size-4",
			"aria-hidden": true
		});
		case "livekit": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Server, {
			className: "size-4",
			"aria-hidden": true
		});
		case "environment": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {
			className: "size-4",
			"aria-hidden": true
		});
		default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, {
			className: "size-4",
			"aria-hidden": true
		});
	}
}
function getServiceDescription(name, check) {
	const key = name.toLowerCase();
	if (check.status === "warning" && check.message) return check.message;
	return SERVICE_META[key]?.description ?? (check.status === "ok" ? "Connected" : "Service issue");
}
function ServiceHealthCard({ name, check, isExpanded, onToggleExpand }) {
	const serviceMeta = SERVICE_META[name.toLowerCase()];
	const handleToggleExpand = () => {
		onToggleExpand(name);
	};
	const isWarning = check.status === "warning";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: cn("overflow-hidden border-border/80 bg-card shadow-sm transition-[border-color,box-shadow]", check.status === "error" && "border-destructive/40 bg-destructive/3", isWarning && "border-warning/35 bg-warning/6"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row items-start justify-between gap-3 pb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("flex size-10 shrink-0 items-center justify-center rounded-md", check.status === "ok" ? "bg-success/10 text-success" : isWarning ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"),
					children: getServiceIcon(name)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base font-semibold leading-tight tracking-tight",
						children: serviceMeta?.label ?? name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-pretty text-xs leading-relaxed",
						children: getServiceDescription(name, check)
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2",
				children: [check.responseTime !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: "font-mono text-[10px] tabular-nums",
					children: [check.responseTime, "ms"]
				}) : null, getStatusIcon(check.status)]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-3 pt-0",
			children: [check.message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("text-xs font-medium leading-relaxed", check.status === "error" ? "text-destructive" : check.status === "warning" ? "text-warning" : "text-muted-foreground"),
				children: check.message
			}) : null, check.metadata && Object.keys(check.metadata).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 border-t border-border/50 pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					className: "h-8 w-full justify-between px-2 text-xs text-muted-foreground hover:text-foreground",
					onClick: handleToggleExpand,
					"aria-expanded": isExpanded,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isExpanded ? "Hide details" : "Show details" }), isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, {
						className: "size-4 shrink-0",
						"aria-hidden": true
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
						className: "size-4 shrink-0",
						"aria-hidden": true
					})]
				}), isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-h-48 overflow-auto rounded-md border border-border/60 bg-muted/30 p-3 text-[11px] leading-relaxed",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "whitespace-pre-wrap break-all font-mono text-muted-foreground",
						children: JSON.stringify(check.metadata, null, 2)
					})
				}) : null]
			}) : null]
		})]
	});
}
function SectionLabel({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground",
		children
	});
}
function SystemHealthView() {
	const [expandedServices, setExpandedServices] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const { isPreviewMode } = usePreview();
	const previewData = getPreviewAdminHealthData();
	const { data, isLoading, error, isFetching, refetch } = useQuery({
		queryKey: ["system-health"],
		queryFn: fetchHealthData,
		enabled: !isPreviewMode,
		refetchInterval: 3e4,
		staleTime: 1e4
	});
	const resolvedData = isPreviewMode ? previewData : data;
	const loading = !isPreviewMode && isLoading;
	const refreshing = !isPreviewMode && isFetching;
	const resolvedError = isPreviewMode ? null : error;
	const toggleExpand = (service) => {
		setExpandedServices((prev) => {
			const next = new Set(prev);
			if (next.has(service)) next.delete(service);
			else next.add(service);
			return next;
		});
	};
	const handleRefetch = () => {
		if (isPreviewMode) return;
		refetch();
	};
	const lastCheckedLabel = (() => {
		if (!resolvedData?.timestamp) return null;
		try {
			return formatDistanceToNow(new Date(resolvedData.timestamp), { addSuffix: true });
		} catch {
			return null;
		}
	})();
	const okCount = resolvedData ? Object.values(resolvedData.checks).filter((c) => c.status === "ok").length : 0;
	const warningCount = resolvedData ? Object.values(resolvedData.checks).filter((c) => c.status === "warning").length : 0;
	const totalCount = resolvedData ? Object.keys(resolvedData.checks).length : 0;
	const healthLoadingContent = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 border-b border-border/60 pb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-28" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-12 shrink-0 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-48" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-72 max-w-full" })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-28 shrink-0" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mb-4 h-3 w-24" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					"m-a",
					"m-b",
					"m-c"
				].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 rounded-lg border border-border/60 bg-card/50 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-28" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-20" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-full" })
					]
				}, key))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mb-4 h-3 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
				children: [
					"c-a",
					"c-b",
					"c-c",
					"c-d",
					"c-e",
					"c-f"
				].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-36 w-full rounded-lg" }, key))
			})] })
		]
	});
	if (resolvedError && !resolvedData) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "border-destructive/30 bg-destructive/4 shadow-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex flex-col items-center justify-center gap-4 px-6 py-12 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-14 items-center justify-center rounded-2xl bg-destructive/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
						className: "size-7 text-destructive",
						"aria-hidden": true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-sm space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-semibold tracking-tight text-destructive",
						children: "Monitoring unavailable"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-pretty text-sm leading-relaxed text-muted-foreground",
						children: resolvedError instanceof Error ? resolvedError.message : "Failed to fetch health status."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: handleRefetch,
					children: "Try again"
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: loading && !resolvedData,
		loadingContent: healthLoadingContent,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-10",
			children: [
				isPreviewMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg border border-dashed border-border/80 bg-muted/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground",
					children: "Preview mode uses sample health data. Deployed checks load automatically when preview is off."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 border-b border-border/60 pb-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Live monitor" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-start gap-3 sm:items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("flex size-12 shrink-0 items-center justify-center rounded-xl", resolvedData?.status === "healthy" ? "bg-success/10" : resolvedData?.status === "degraded" ? "bg-warning/10" : "bg-destructive/10"),
								children: getStatusIcon(resolvedData?.status || "unhealthy")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-lg font-semibold tracking-tight text-foreground",
										children: "Aggregate status"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: cn("text-[10px] font-semibold uppercase tracking-wide", getStatusBadgeColor(resolvedData?.status || "unhealthy")),
										children: (resolvedData?.status ?? "unknown").replace(/-/g, " ")
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-pretty text-sm leading-relaxed text-muted-foreground",
									children: [
										okCount,
										" of ",
										totalCount,
										" checks passing",
										warningCount > 0 ? ` · ${warningCount} need attention` : "",
										lastCheckedLabel ? ` · Updated ${lastCheckedLabel}` : ""
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							className: "shrink-0 gap-2 self-start sm:self-center",
							onClick: handleRefetch,
							disabled: refreshing || isPreviewMode,
							title: isPreviewMode ? "Disabled in preview mode" : "Runs a fresh health request",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
								className: cn("size-4", refreshing && "animate-spin"),
								"aria-hidden": true
							}), refreshing ? "Checking…" : "Refresh"]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Overview" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "border-border/80 bg-card shadow-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "flex flex-row items-center justify-between gap-y-0 pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "text-sm font-medium text-muted-foreground",
										children: "Response time"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, {
										className: "size-4 text-muted-foreground",
										"aria-hidden": true
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-2xl font-semibold tabular-nums tracking-tight",
									children: [resolvedData?.responseTime ?? 0, "ms"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs leading-relaxed text-muted-foreground",
									children: "Full health check roundtrip"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "border-border/80 bg-card shadow-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "flex flex-row items-center justify-between gap-y-0 pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "text-sm font-medium text-muted-foreground",
										children: "Uptime"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
										className: "size-4 text-muted-foreground",
										"aria-hidden": true
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-2xl font-semibold tracking-tight",
									children: resolvedData ? formatUptime(resolvedData.uptime) : "0m"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs leading-relaxed text-muted-foreground",
									children: "Server process duration"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "border-border/80 bg-card shadow-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "flex flex-row items-center justify-between gap-y-0 pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "text-sm font-medium text-muted-foreground",
										children: "Version"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, {
										className: "size-4 text-muted-foreground",
										"aria-hidden": true
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-2xl font-semibold tracking-tight",
									children: ["v", resolvedData?.version ?? "0.0.0"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs leading-relaxed text-muted-foreground",
									children: "Production build"
								})] })]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "Integrations" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
						children: resolvedData ? Object.entries(resolvedData.checks).map(([name, check]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceHealthCard, {
							name,
							check,
							isExpanded: expandedServices.has(name),
							onToggleExpand: toggleExpand
						}, name)) : null
					})]
				}),
				resolvedError && resolvedData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-warning/35 bg-warning/6 shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex gap-3 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							className: "mt-0.5 size-5 shrink-0 text-warning",
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-pretty text-sm leading-relaxed text-warning",
							children: [
								"Last refresh failed: ",
								resolvedError instanceof Error ? resolvedError.message : "Unknown error",
								". Showing cached data."
							]
						})]
					})
				}) : null
			]
		})
	});
}
function SystemHealthPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageShell, {
		title: "System health",
		description: "Monitor real-time connectivity and performance of your core infrastructure and integrations.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SystemHealthView, {})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SystemHealthPage, {});
//#endregion
export { SplitComponent as component };
