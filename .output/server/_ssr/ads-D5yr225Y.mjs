import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, l as useMutation, r as useConvexAuth, s as useAction, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { b as getPreviewAdsIntegrationStatuses, x as getPreviewAdsMetrics } from "./preview-data-CXkRNfsX.mjs";
import { a as EN_US_NUMBER_FORMATTER, c as cn, u as formatCurrency } from "./utils-hh4sibN0.mjs";
import { V as startOfDay, _ as format, a as subDays, k as endOfDay, o as isWithinInterval } from "../_libs/date-fns.mjs";
import { h as listItemEnterClass } from "./motion-Cf6ujF0h.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { i as normalizeProviderId, n as PROVIDER_INFO, r as formatProviderName, t as PROVIDER_IDS } from "./themes-DBvmOGm7.mjs";
import { n as extractErrorCode, s as logError, t as asErrorMessage } from "./convex-errors-sHK0JmZ7.mjs";
import { c as reportConvexFailure, i as notifyFailure, o as notifySuccess, t as convexErrorMessage } from "./notifications-DQZKskhM.mjs";
import { i as useSearchParams, n as usePathname, r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { n as api } from "./rate-limiter-convex-Dr72h9nD.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { c as adsIntegrationsApi } from "./convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { Cn as Funnel, K as Settings2, Sr as ChartColumn, Ut as Megaphone, Vn as Download, Y as Search, Yt as LoaderCircle, Zn as Clock, b as TriangleAlert, br as ChartLine, cr as CircleAlert, gr as Check, i as X, or as CircleCheck, rt as RefreshCw, tn as Link2, un as Info, ut as PlugZap, v as Unlink } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { n as FadeInItem, r as FadeInStagger, t as FadeIn } from "./animate-in-JYv0iBIt.mjs";
import { a as TabsTrigger, i as TabsList, n as Tabs, r as TabsContent } from "./tabs-BP_mm-cH.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip-BwcfatA2.mjs";
import { n as SvglExcelIcon, t as SvglBrandLogo } from "./svgl-brand-logo-rIFZzPiw.mjs";
import { a as getIconContainerClasses, n as PAGE_TITLES, t as DASHBOARD_THEME } from "./dashboard-theme-DM5oBGdY.mjs";
import { _ as normalizeTimeframe, a as TIMEFRAME_OPTIONS, c as describeTimeframe, d as getProviderIcon, f as getStatusBadgeVariant$1, g as normalizeFrequency, h as normalizeAdsProviderId, i as PROVIDER_ICON_MAP, l as formatDisplayDate, m as isCanonicalAdsProvider, n as ADS_WORKFLOW_STEPS, o as analyzeAdPerformance, p as getStatusLabel$1, r as FREQUENCY_OPTIONS, s as describeFrequency, t as ADS_PAGE_THEME, u as formatRelativeTimestamp } from "./ad-algorithms-CKFe3XXP.mjs";
import { t as Separator } from "./separator-DGLaDYU_.mjs";
import { t as Checkbox } from "./checkbox-DP7YqpAp.mjs";
import { r as useConvexQueryError } from "./use-convex-query-error-P2IX7lhG.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./alert-DYeH1Q3p.mjs";
import { _ as useFormulaEditor, i as MetaEventsToolsPanel, n as CollapsibleContent, r as CollapsibleTrigger, t as Collapsible } from "./use-formula-editor-DJCWXM5p.mjs";
import { t as MotionCard } from "./motion-primitives-HmftJNmb.mjs";
import { r as MetricHint } from "./hover-preview-BP_Z2-hG.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { t as DateRangePicker } from "./date-range-picker-D_4D5yhU.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as PerformanceChart } from "./performance-chart-DwDGn0rc.mjs";
import { n as RevealTransition, r as RevealTransitionFallback } from "./page-transition-Ds_W2a1a.mjs";
import { a as DropdownMenuLabel, c as DropdownMenuSeparator, l as DropdownMenuTrigger, n as DropdownMenuCheckboxItem, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-CJEJ0oqe.mjs";
import { t as PageMotionShell } from "./page-motion-shell-Ci2leIYf.mjs";
import { n as DataTableColumnHeader, r as VirtualizedDataTable } from "./data-table-BrJwaBjP.mjs";
import { a as filterMetricsToConnected, f as resolveCurrencyFromProcessedMetrics, g as totalsHaveDeliveryActivity, h as totalsFromServerSummary, i as filterMetricsByProviders, l as providerSummariesToSyntheticMetrics, n as buildCrossChannelSummaryCards, r as buildProviderCurrencyMapFromMetrics, s as metricsForOverviewDisplay, t as buildCanonicalConnectedIds } from "./insights-chart-utils-C-DuAInF.mjs";
import { n as resolveAdsMetricsDisplayState, t as adsMetricsEmptyCopy } from "./ads-metrics-display-state-BkdDA6HD.mjs";
import { n as buildAdsMetricsCharts, o as filterMeaningfulCharts } from "./cohorts-spreadsheet-charts-C3_blKf3.mjs";
import { t as QueryErrorAlert } from "./query-error-alert-BQQBffRH.mjs";
import { t as DashboardPageHero } from "./dashboard-page-hero-BIWBoJtP.mjs";
import { t as Progress } from "./progress-C-kxMCfG.mjs";
import { a as TOAST_TITLES, i as SUCCESS_MESSAGES, n as DisconnectDialog, r as ERROR_MESSAGES, t as ConnectionDialog } from "./connection-dialog-CrKkZRgV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ads-D5yr225Y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdsSkeleton() {
	const insightSlots = [
		"insight-1",
		"insight-2",
		"insight-3"
	];
	const statSlots = [
		"stat-1",
		"stat-2",
		"stat-3",
		"stat-4"
	];
	const metricSlots = [
		"metric-1",
		"metric-2",
		"metric-3"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-48" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-72" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-muted/60 bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-36" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-64" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-36" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-3",
					children: insightSlots.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border-muted/60 bg-muted/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-3 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-32" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-40" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-28" })
							]
						})
					}, slot))
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
				children: statSlots.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-muted/60 bg-background",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3 p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-20" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-28" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-40" })
						]
					})
				}, slot))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-muted/60 bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-4 w-64" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "grid gap-4 md:grid-cols-3",
					children: metricSlots.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-muted/60 bg-muted/10 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-32" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-3 w-40" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 grid grid-cols-3 gap-2",
								children: metricSlots.map((metricSlot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-full" }, metricSlot))
							})
						]
					}, slot))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-muted/60 bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-lg",
						children: "Latest synced rows"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Recent normalized records across all connected ad platforms." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-36" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "space-y-2",
					children: [
						"row-1",
						"row-2",
						"row-3",
						"row-4",
						"row-5",
						"row-6"
					].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full rounded" }, slot))
				})]
			})
		]
	});
}
function AdsPageHeader({ dateRange, onDateRangeChange, onRefresh, onExport, refreshing = false, canExport = false, connectedCount = 0, totalProviders = 0, pendingSetupCount = 0 }) {
	const allConnected = totalProviders > 0 && connectedCount >= totalProviders && pendingSetupCount === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardPageHero, {
		innerClassName: "relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1 space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: ADS_PAGE_THEME.sectionEyebrow,
					children: "Paid media"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: getIconContainerClasses("medium"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, {
							className: "size-6 text-primary",
							"aria-hidden": true
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: DASHBOARD_THEME.layout.title,
						children: PAGE_TITLES.ads?.title ?? "Ads"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn(ADS_PAGE_THEME.sectionDescription, "text-pretty"),
					children: PAGE_TITLES.ads?.description ?? "Connect paid media accounts, sync campaign data, and review cross-channel performance in one command center."
				}),
				totalProviders > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full border border-border/60 bg-background/80 px-2.5 py-1 font-medium tabular-nums text-foreground",
						children: [
							connectedCount,
							" / ",
							totalProviders,
							" platforms linked"
						]
					}), pendingSetupCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 font-medium text-warning",
						children: [
							pendingSetupCount,
							" setup step",
							pendingSetupCount === 1 ? "" : "s",
							" pending"
						]
					}) : allConnected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full border border-success/25 bg-success/10 px-2.5 py-1 font-medium text-success",
						children: "Ready to sync"
					}) : null]
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateRangePicker, {
				value: dateRange,
				onChange: onDateRangeChange,
				className: "w-full sm:w-auto [&_button]:h-10 [&_button]:rounded-xl [&_button]:border-border/70 [&_button]:bg-background/90"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					className: "h-10 flex-1 gap-1.5 rounded-xl border-border/70 sm:flex-none",
					onClick: onRefresh,
					disabled: refreshing,
					"aria-busy": refreshing,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
							className: cn("size-4", refreshing && "animate-spin"),
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Refresh"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sm:hidden",
							children: "Sync"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					size: "icon",
					className: "size-10 shrink-0 rounded-xl border-border/70",
					onClick: onExport,
					disabled: !canExport,
					"aria-label": "Export metrics as Excel",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglExcelIcon, { className: "size-4" })
				})]
			})]
		})]
	});
}
function AdsPageLayout({ setup, analytics, advancedAnalytics, showSetup, connectedAccountCount, hasPendingSetup = false }) {
	const [mobileTab, setMobileTab] = (0, import_react.useState)(connectedAccountCount > 0 && !hasPendingSetup ? "performance" : "setup");
	const advancedAnalyticsBlock = advancedAnalytics ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsAdvancedAnalyticsCollapsible, { children: advancedAnalytics }) : null;
	if (!showSetup) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [analytics, advancedAnalyticsBlock]
	});
	const setupBlock = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsSetupSection, { children: setup });
	const analyticsBlock = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsAnalyticsSection, { children: analytics }), advancedAnalyticsBlock] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
		value: mobileTab,
		onValueChange: setMobileTab,
		className: "w-full lg:hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
				className: ADS_PAGE_THEME.mobileTabs,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
					value: "performance",
					className: ADS_PAGE_THEME.mobileTabTrigger,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLine, {
						className: "size-3.5 shrink-0",
						"aria-hidden": true
					}), "Performance"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
					value: "setup",
					className: ADS_PAGE_THEME.mobileTabTrigger,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, {
							className: "size-3.5 shrink-0",
							"aria-hidden": true
						}),
						"Accounts",
						connectedAccountCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-background px-1.5 py-0 text-[10px] font-semibold tabular-nums text-foreground shadow-sm",
							children: connectedAccountCount
						}) : null
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
				value: "performance",
				className: "mt-5 space-y-8 focus-visible:outline-none",
				children: [analytics, advancedAnalyticsBlock]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "setup",
				className: "mt-5 focus-visible:outline-none",
				children: setupBlock
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hidden space-y-10 lg:block",
		children: [setupBlock, analyticsBlock]
	})] });
}
function AdsSectionHeader({ eyebrow, title, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1 border-b border-border/50 pb-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: ADS_PAGE_THEME.sectionEyebrow,
				children: eyebrow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: ADS_PAGE_THEME.sectionTitle,
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: ADS_PAGE_THEME.sectionDescription,
				children: description
			})
		]
	});
}
function AdsSetupSection({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Ad platform setup",
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsSectionHeader, {
			eyebrow: "Workspace setup",
			title: "Accounts & campaigns",
			description: "Connect platforms, finish account selection, and manage per-provider campaigns for the date range in the header."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-6",
			children
		})]
	});
}
function AdsAnalyticsSection({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Ad performance",
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsSectionHeader, {
			eyebrow: "Reporting",
			title: "Cross-channel performance",
			description: "Aggregate KPIs, provider breakdowns, algorithmic insights, and trend charts from your latest successful sync."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-6",
			children
		})]
	});
}
function AdsAdvancedAnalyticsCollapsible({ children }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Collapsible, {
		open,
		onOpenChange: setOpen,
		className: ADS_PAGE_THEME.advancedPanel,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 p-4 sm:px-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold tracking-tight text-foreground",
					children: "Analytics tools"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-relaxed text-muted-foreground",
					children: "Sync automation, period comparisons, custom KPIs, formula builder, and raw metric rows."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					className: "shrink-0 gap-1.5 rounded-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
						className: "size-3.5",
						"aria-hidden": true
					}), open ? "Hide" : "Show"]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent, {
			className: cn("space-y-6 border-t border-border/50 px-4 py-5 sm:px-5"),
			children
		})]
	});
}
function GoogleSetupDialog({ open, onOpenChange, setupMessage, accountOptions, selectedAccountId, onAccountSelectionChange, loadingAccounts, initializing, onReloadAccounts, onInitialize }) {
	const noAccounts = !loadingAccounts && accountOptions.length === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-10 items-center justify-center rounded-full bg-info/10 text-info",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
							brand: "google",
							className: "size-5",
							labeled: false
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Complete Google Ads setup" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Choose which Google Ads account to sync into this workspace." })] })]
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
								children: "Google Ads account"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: selectedAccountId || void 0,
								onValueChange: onAccountSelectionChange,
								disabled: loadingAccounts || initializing || accountOptions.length === 0,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: loadingAccounts ? "Loading accounts…" : "Select Google Ads account" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: accountOptions.map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: account.id,
									children: [account.name, account.isManager ? " (Manager)" : ""]
								}, account.id)) })]
							}),
							noAccounts ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-warning",
								children: "No Google Ads accounts were found for this token. Verify account permissions, then reload."
							}) : null
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2 sm:gap-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: onReloadAccounts,
						disabled: loadingAccounts || initializing,
						children: loadingAccounts ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Loading…"] }) : "Reload accounts"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						onClick: onInitialize,
						disabled: initializing || loadingAccounts || !selectedAccountId,
						children: initializing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Finishing…"] }) : "Finish setup"
					})]
				})
			]
		})
	});
}
var EMPTY_INTEGRATION_STATUSES = {};
var EMPTY_SYNCING_PROVIDERS = {};
var STALE_SYNC_THRESHOLD_MS = 1800 * 1e3;
function isSyncStale(statusInfo) {
	if (statusInfo?.status !== "pending") return false;
	if (!statusInfo.accountId) return false;
	const requestedAt = statusInfo.lastSyncRequestedAt;
	if (!requestedAt) return false;
	return Date.now() - new Date(requestedAt).getTime() > STALE_SYNC_THRESHOLD_MS;
}
function needsAccountSetup(statusInfo, isConnected) {
	return isConnected && !statusInfo?.accountId && statusInfo?.status !== "success";
}
function formatLastSync(dateString) {
	if (!dateString) return "Never synced";
	const date = new Date(dateString);
	const diffMs = (/* @__PURE__ */ new Date()).getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / (1e3 * 60));
	const diffHours = Math.floor(diffMs / (1e3 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;
	return date.toLocaleDateString();
}
function getStatusBadgeVariant(status, isConnected, stale, setupRequired) {
	if (!isConnected) return "outline";
	if (setupRequired) return "outline";
	if (status === "error" || stale) return "destructive";
	if (status === "pending") return "secondary";
	return "default";
}
function getStatusLabel(status, isConnected, stale, setupRequired) {
	if (!isConnected) return "Not connected";
	if (setupRequired) return "Finish setup";
	if (status === "error") return "Sync failed";
	if (status === "pending") return stale ? "Sync stalled" : "Syncing...";
	if (status === "never") return "Finish setup";
	return "Connected";
}
function createInitialDialogState() {
	return {
		connectDialogOpen: false,
		disconnectDialogOpen: false,
		selectedProvider: null,
		connectionStep: "idle",
		isDisconnecting: false
	};
}
function adConnectionsDialogReducer(state, action) {
	switch (action.type) {
		case "openConnectDialog": return {
			...state,
			selectedProvider: action.provider,
			connectionStep: "idle",
			connectDialogOpen: true
		};
		case "openDisconnectDialog": return {
			...state,
			selectedProvider: action.provider,
			disconnectDialogOpen: true
		};
		case "setConnectDialogOpen": return {
			...state,
			connectDialogOpen: action.value
		};
		case "setDisconnectDialogOpen": return {
			...state,
			disconnectDialogOpen: action.value
		};
		case "setConnectionStep": return {
			...state,
			connectionStep: action.value
		};
		case "startDisconnect": return {
			...state,
			isDisconnecting: true
		};
		case "finishDisconnect": return {
			...state,
			isDisconnecting: false,
			disconnectDialogOpen: false,
			selectedProvider: null
		};
		default: return state;
	}
}
function AdConnectionsCard({ providers, connectedProviders, connectingProvider, connectionErrors, integrationStatuses = EMPTY_INTEGRATION_STATUSES, onConnect, onDisconnect, onOauthRedirect, onSyncNow, onRefresh, refreshing, syncingProviders = EMPTY_SYNCING_PROVIDERS, connectedCount, totalProviders, pendingSetupCount = 0 }) {
	const [dialogState, dispatch] = (0, import_react.useReducer)(adConnectionsDialogReducer, void 0, createInitialDialogState);
	const { connectDialogOpen, disconnectDialogOpen, selectedProvider, connectionStep, isDisconnecting } = dialogState;
	const providerStates = providers.map((provider) => ({
		provider,
		isConnecting: connectingProvider === provider.id,
		isConnected: Boolean(connectedProviders[provider.id]),
		error: connectionErrors[provider.id],
		statusInfo: integrationStatuses[provider.id],
		isSyncingNow: Boolean(syncingProviders[provider.id])
	}));
	const handleOpenConnectDialog = (provider) => {
		dispatch({
			type: "openConnectDialog",
			provider
		});
	};
	const handleDialogConnect = () => {
		if (!selectedProvider) return Promise.resolve();
		dispatch({
			type: "setConnectionStep",
			value: "redirecting"
		});
		if (selectedProvider.mode === "oauth") return Promise.resolve(onOauthRedirect?.(selectedProvider.id)).catch(() => {
			dispatch({
				type: "setConnectionStep",
				value: "error"
			});
		});
		if (!selectedProvider.connect) return Promise.resolve();
		dispatch({
			type: "setConnectionStep",
			value: "authenticating"
		});
		return Promise.resolve(onConnect(selectedProvider.id, selectedProvider.connect)).then(() => {
			dispatch({
				type: "setConnectionStep",
				value: "fetching"
			});
			return new Promise((resolve) => setTimeout(resolve, 500));
		}).then(() => {
			dispatch({
				type: "setConnectionStep",
				value: "complete"
			});
		}).catch(() => {
			dispatch({
				type: "setConnectionStep",
				value: "error"
			});
		});
	};
	const handleRetry = () => {
		dispatch({
			type: "setConnectionStep",
			value: "idle"
		});
	};
	const handleOpenDisconnectDialog = (provider) => {
		dispatch({
			type: "openDisconnectDialog",
			provider
		});
	};
	const handleConfirmDisconnect = (options) => {
		if (!selectedProvider) return Promise.resolve();
		dispatch({ type: "startDisconnect" });
		return Promise.resolve(onDisconnect(selectedProvider.id, options)).finally(() => {
			dispatch({ type: "finishDisconnect" });
		});
	};
	const handleConnectDialogOpenChange = (value) => {
		dispatch({
			type: "setConnectDialogOpen",
			value
		});
	};
	const handleDisconnectDialogOpenChange = (value) => {
		dispatch({
			type: "setDisconnectDialogOpen",
			value
		});
	};
	const handleQuickReconnect = (provider) => {
		if (provider.mode === "oauth") onOauthRedirect?.(provider.id);
		else if (provider.connect) onConnect(provider.id, provider.connect);
	};
	const handleSyncNow = (provider) => {
		onSyncNow?.(provider.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
			className: ADS_PAGE_THEME.surfaceCard,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-col gap-4 border-b border-border/50 pb-5 md:flex-row md:items-start md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: ADS_PAGE_THEME.sectionEyebrow,
							children: "Integrations"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-lg font-semibold tracking-tight",
							children: "Ad platform connections"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
							className: "max-w-xl text-pretty leading-relaxed",
							children: "OAuth into each network to import spend, conversions, and creative performance into this workspace."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: onRefresh,
					disabled: refreshing,
					className: "inline-flex h-10 items-center gap-2 rounded-xl border-border/70",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-4", refreshing && "animate-spin") }), "Refresh"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-6 pt-6",
				children: [
					typeof connectedCount === "number" && typeof totalProviders === "number" && totalProviders > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 ring-1 ring-primary/10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-sm font-medium text-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, {
										className: "size-4 text-primary",
										"aria-hidden": true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										connectedCount,
										" of ",
										totalProviders,
										" platforms connected"
									] }),
									pendingSetupCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "secondary",
										className: "font-normal",
										children: [pendingSetupCount, " need setup"]
									}) : connectedCount < totalProviders ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										className: "font-normal",
										children: [totalProviders - connectedCount, " available"]
									}) : null
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Secure OAuth redirect - pick accounts after you return."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
							value: Math.round(connectedCount / totalProviders * 100),
							className: "h-2",
							"aria-label": "Connected ad platforms"
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
						children: providerStates.map((state) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderCard, {
							state,
							onConnect: handleOpenConnectDialog,
							onReconnect: handleQuickReconnect,
							onDisconnect: handleOpenDisconnectDialog,
							onSyncNow: handleSyncNow
						}, state.provider.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "After connecting, we'll sync your last 90 days of performance data automatically. Future syncs happen daily to keep your data fresh." })]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionDialog, {
			open: connectDialogOpen,
			onOpenChange: handleConnectDialogOpenChange,
			providerId: selectedProvider?.id ?? null,
			providerIcon: selectedProvider?.icon,
			onConnect: handleDialogConnect,
			isConnecting: connectingProvider === selectedProvider?.id,
			connectionStep,
			error: selectedProvider ? connectionErrors[selectedProvider.id] ?? null : null,
			onRetry: handleRetry
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisconnectDialog, {
			open: disconnectDialogOpen,
			onOpenChange: handleDisconnectDialogOpenChange,
			providerName: selectedProvider?.name ?? "",
			onConfirm: handleConfirmDisconnect,
			isDisconnecting
		})
	] });
}
var ProviderCard = function ProviderCard({ state, onConnect, onReconnect, onDisconnect, onSyncNow }) {
	const { provider, isConnected, isConnecting, isSyncingNow = false, error, statusInfo } = state;
	const Icon = provider.icon;
	const providerInfo = PROVIDER_INFO[provider.id];
	const stale = isSyncStale(statusInfo);
	const setupRequired = needsAccountSetup(statusInfo, isConnected);
	const handleConnectClick = () => {
		onConnect(provider);
	};
	const handleReconnectClick = () => {
		onReconnect(provider);
	};
	const handleDisconnectClick = () => {
		onDisconnect(provider);
	};
	const handleSyncNowClick = () => {
		onSyncNow(provider);
	};
	const statusVariant = getStatusBadgeVariant(statusInfo?.status, isConnected, stale, setupRequired);
	const statusLabel = getStatusLabel(statusInfo?.status, isConnected, stale, setupRequired);
	const lastSyncLabel = formatLastSync(statusInfo?.lastSyncedAt);
	const accountLabel = typeof statusInfo?.accountName === "string" && statusInfo.accountName.length > 0 ? statusInfo.accountName : typeof statusInfo?.accountId === "string" && statusInfo.accountId.length > 0 ? statusInfo.accountId : null;
	const theme = providerInfo?.theme;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: cn(ADS_PAGE_THEME.providerTile, "motion-chromatic", isConnected && (theme?.border || "border-primary/25 ring-1 ring-primary/10"), error && "border-destructive/40", !isConnected && "opacity-95 hover:border-border hover:opacity-100"),
		children: [
			isConnected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("absolute left-0 top-0 h-1 w-full", setupRequired && "bg-primary", (statusInfo?.status === "error" || stale) && "bg-destructive", statusInfo?.status === "pending" && !stale && !setupRequired && "bg-warning", statusInfo?.status !== "error" && statusInfo?.status !== "pending" && !stale && !setupRequired && (theme?.indicator || "bg-primary")) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "space-y-3 pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("flex size-12 items-center justify-center rounded-xl motion-chromatic shadow-sm", theme?.bg || (isConnected ? "bg-accent/10" : "bg-muted"), theme?.color || (isConnected ? "text-primary" : "text-muted-foreground")),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-6" })
					}), isConnecting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-muted-foreground" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: provider.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "mt-1 line-clamp-2 text-xs",
					children: providerInfo?.description ?? provider.description
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3 pt-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: statusVariant,
							className: "rounded-full text-xs",
							children: [
								statusInfo?.status === "pending" && !stale && !setupRequired && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 size-3 animate-spin" }),
								(statusInfo?.status === "error" || stale) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mr-1 size-3" }),
								isConnected && statusInfo?.status !== "error" && statusInfo?.status !== "pending" && !stale && !setupRequired && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-3" }),
								statusLabel
							]
						}), isConnected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3" }), lastSyncLabel]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Last successful sync" }) })] }) })]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
						variant: "destructive",
						className: "py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
							className: "text-xs",
							children: error
						})]
					}),
					isConnected && accountLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-foreground/80",
								children: "Account:"
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: accountLabel
							})
						]
					}),
					statusInfo?.status === "error" && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
						variant: "destructive",
						className: "py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
							className: "text-xs",
							children: "Last sync failed. Click reconnect to retry."
						})]
					}),
					stale && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
						variant: "destructive",
						className: "py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
							className: "text-xs",
							children: "Sync is taking longer than expected."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2",
						children: !isConnected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							className: "flex-1",
							size: "sm",
							disabled: isConnecting,
							onClick: handleConnectClick,
							children: isConnecting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-3 animate-spin" }), "Connecting…"] }) : "Connect"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [stale || statusInfo?.status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							size: "sm",
							className: "flex-1",
							disabled: isSyncingNow,
							onClick: handleSyncNowClick,
							children: isSyncingNow ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-3 animate-spin" }), "Syncing…"] }) : "Sync now"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							className: "flex-1",
							disabled: isConnecting,
							onClick: handleReconnectClick,
							children: isConnecting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-3 animate-spin" }), "Connecting…"] }) : "Reconnect"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "ghost",
								size: "icon",
								className: "size-8 text-muted-foreground hover:text-destructive",
								disabled: isConnecting,
								onClick: handleDisconnectClick,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unlink, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sr-only",
									children: "Disconnect"
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Disconnect ", provider.name] }) })] }) })] })
					})
				]
			})
		]
	});
};
function ProviderIcon({ providerId, className }) {
	const Icon = getProviderIcon(providerId);
	if (!Icon) return null;
	return (0, import_react.createElement)(Icon, { className });
}
function ProviderFilterOption$1({ providerId, selectedProviders, onToggleProvider }) {
	const handleCheckedChange = () => {
		onToggleProvider(providerId);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuCheckboxItem, {
		checked: selectedProviders.includes(providerId),
		onCheckedChange: handleCheckedChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderIcon, {
				providerId,
				className: "size-4"
			}), formatProviderName(providerId)]
		})
	});
}
function SelectedProviderChip({ providerId, onToggleProvider }) {
	const handleRemove = () => {
		onToggleProvider(providerId);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: "secondary",
		className: "gap-1 rounded-full border border-border/50 px-2.5",
		children: [formatProviderName(providerId), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: handleRemove,
			className: "ml-0.5 rounded-full p-0.5 hover:bg-muted hover:text-foreground",
			"aria-label": `Remove ${formatProviderName(providerId)} filter`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
				className: "size-3",
				"aria-hidden": true
			})
		})]
	}, providerId);
}
function CrossChannelOverviewHeader({ availableProviders, dateRange, hasMetricData, hasProviderFilter, onDateRangeChange, onExport, onToggleProvider, selectedProviders, showDateAndExport = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "flex flex-col gap-3 border-b border-border/50 pb-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: ADS_PAGE_THEME.sectionEyebrow,
						children: "Overview"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-lg font-semibold tracking-tight",
						children: "Cross-channel KPIs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "max-w-xl text-pretty leading-relaxed",
						children: "Totals and trends from your latest successful sync - filter by platform without leaving this view."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [availableProviders.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "gap-2 rounded-xl border-border/70",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, {
								className: "size-4",
								"aria-hidden": true
							}),
							"Providers",
							hasProviderFilter ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "ml-1 px-1.5 py-0.5 text-xs",
								children: selectedProviders.length
							}) : null
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
					align: "end",
					className: "w-48",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, { children: "Filter by Provider" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
						availableProviders.map((providerId) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderFilterOption$1, {
							providerId,
							selectedProviders,
							onToggleProvider
						}, providerId))
					]
				})] }) : null, showDateAndExport ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateRangePicker, {
					value: dateRange,
					onChange: onDateRangeChange
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "icon",
					onClick: onExport,
					disabled: !hasMetricData,
					"aria-label": "Export metrics as Excel",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglExcelIcon, { className: "size-4" })
				})] }) : null]
			})]
		}), hasProviderFilter ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Showing:" }), selectedProviders.map((providerId) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectedProviderChip, {
				providerId,
				onToggleProvider
			}, providerId))]
		}) : null]
	});
}
function CrossChannelOverviewLoadingState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-6 pt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 md:grid-cols-2 lg:grid-cols-4",
			children: [
				0,
				1,
				2,
				3
			].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full rounded-2xl" }, slot))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[300px] w-full rounded-2xl" })]
	});
}
function CrossChannelOverviewEmptyState({ displayState = "needs_connection" }) {
	const copy = displayState === "needs_sync" || displayState === "synced_no_delivery" ? adsMetricsEmptyCopy(displayState) : adsMetricsEmptyCopy("needs_connection");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
		className: "pt-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: ADS_PAGE_THEME.emptyState,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-foreground",
					children: copy.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-sm text-sm leading-relaxed text-muted-foreground",
					children: copy.description
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					variant: "outline",
					className: "rounded-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						href: copy.actionHref,
						children: copy.actionLabel
					})
				})
			]
		})
	});
}
function CrossChannelOverviewStatusBanner({ displayState }) {
	if (displayState !== "synced_no_delivery" && displayState !== "needs_sync") return null;
	const copy = adsMetricsEmptyCopy(displayState);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-warning/20 bg-warning/5 px-4 py-3 text-sm text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium text-foreground",
			children: copy.title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 leading-relaxed",
			children: copy.description
		})]
	});
}
function SummaryCardTile({ card }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: ADS_PAGE_THEME.kpiTile,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: ADS_PAGE_THEME.kpiLabel,
					children: card.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					"aria-label": `Metric information: ${card.helper}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
						className: "size-3.5 text-muted-foreground/70",
						"aria-hidden": true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: card.helper }) })] }) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn(ADS_PAGE_THEME.kpiValue, "mt-2"),
				children: card.value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 line-clamp-2 text-xs text-muted-foreground",
				children: card.helper
			})
		]
	}) });
}
function CrossChannelOverviewContent({ currency, chartMetrics, metricsLoading, summaryCards, hasAggregateChartFallback = false, hasConnectedAds = false, displayState = "has_delivery" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-6 pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossChannelOverviewStatusBanner, { displayState }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInStagger, {
				className: "grid gap-3 md:grid-cols-2 lg:grid-cols-4",
				children: summaryCards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCardTile, { card }, card.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-[300px] w-full min-w-0 rounded-2xl border border-border/50 bg-muted/15 p-3 sm:p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerformanceChart, {
					metrics: chartMetrics,
					loading: metricsLoading,
					currency,
					dataSource: "ads",
					hasAggregateData: hasAggregateChartFallback,
					adsAccountConnected: hasConnectedAds,
					metricsDisplayState: displayState
				})
			})
		]
	});
}
var NON_ADS_PROVIDER_ALIASES = new Set([
	"google_analytics",
	"google-analytics",
	"googleanalytics",
	"ga",
	"ga4"
]);
function isAdsProviderId(providerId) {
	const raw = String(providerId ?? "").trim().toLowerCase();
	if (!raw || NON_ADS_PROVIDER_ALIASES.has(raw)) return false;
	return isCanonicalAdsProvider(raw);
}
function mapRealtimeMetricRow(row) {
	const normalizedProviderId = normalizeAdsProviderId(String(row.providerId ?? "unknown")) ?? String(row.providerId ?? "unknown");
	const accountId = typeof row.accountId === "string" ? row.accountId : null;
	const currency = typeof row.currency === "string" && row.currency.length > 0 ? row.currency : null;
	const currencySource = typeof row.currencySource === "string" ? row.currencySource : null;
	const surfaceId = typeof row.surfaceId === "string" && row.surfaceId.length > 0 ? row.surfaceId : null;
	const publisherPlatform = typeof row.publisherPlatform === "string" && row.publisherPlatform.length > 0 ? row.publisherPlatform : null;
	const campaignId = typeof row.campaignId === "string" && row.campaignId.length > 0 ? row.campaignId : null;
	const campaignName = typeof row.campaignName === "string" && row.campaignName.length > 0 ? row.campaignName : null;
	const createdAtMs = typeof row.createdAtMs === "number" ? row.createdAtMs : null;
	const date = String(row.date ?? "");
	return {
		id: `${normalizedProviderId}:${accountId ?? ""}:${surfaceId ?? publisherPlatform ?? ""}:${campaignId ?? ""}:${date}:${createdAtMs ?? ""}`,
		providerId: normalizedProviderId,
		accountId,
		currency,
		currencySource,
		surfaceId,
		publisherPlatform,
		campaignId,
		campaignName,
		date,
		spend: Number(row.spend ?? 0),
		impressions: Number(row.impressions ?? 0),
		clicks: Number(row.clicks ?? 0),
		conversions: Number(row.conversions ?? 0),
		revenue: row.revenue === null || row.revenue === void 0 ? null : Number(row.revenue),
		createdAt: createdAtMs === null ? null : new Date(createdAtMs).toISOString()
	};
}
/** Parse YYYY-MM-DD (and ISO prefixes) as a local calendar day — avoids UTC shift dropping rows. */
function parseMetricDate(dateStr) {
	if (!dateStr || dateStr === "unknown") return null;
	const datePart = dateStr.split("T")[0]?.trim() ?? "";
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
	if (match) {
		const year = Number(match[1]);
		const month = Number(match[2]);
		const day = Number(match[3]);
		if (year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) return startOfDay(new Date(year, month - 1, day));
	}
	const parsed = new Date(dateStr);
	if (Number.isNaN(parsed.getTime())) return null;
	return startOfDay(parsed);
}
/** Calendar YYYY-MM-DD in local time — avoids UTC shift from `toISOString().split('T')[0]`. */
function formatMetricQueryDate(date) {
	return format(date, "yyyy-MM-dd");
}
function summaryTotalsHaveActivity(totals) {
	return totals.spend > 0 || totals.impressions > 0 || totals.clicks > 0 || totals.conversions > 0;
}
/**
* Prefer daily metric rows for the table; fall back to server summary provider totals
* when the page has aggregate insights but no row slice (common after sync).
*/
function metricsForTableDisplay(dailyMetrics, summary) {
	if (dailyMetrics.length > 0) return dailyMetrics;
	const providers = summary?.providers;
	if (providers && Object.keys(providers).length > 0) return Object.entries(providers).flatMap(([providerId, totals], index) => {
		if (!summaryTotalsHaveActivity(totals)) return [];
		const normalizedProviderId = normalizeAdsProviderId(providerId) ?? providerId;
		return [{
			id: `summary-${normalizedProviderId}-${index}`,
			providerId: normalizedProviderId,
			date: "summary",
			spend: totals.spend,
			impressions: totals.impressions,
			clicks: totals.clicks,
			conversions: totals.conversions,
			revenue: totals.revenue
		}];
	});
	const totals = summary?.totals;
	if (totals && summaryTotalsHaveActivity(totals)) return [{
		id: "summary-total",
		providerId: "all",
		date: "summary",
		spend: totals.spend,
		impressions: totals.impressions,
		clicks: totals.clicks,
		conversions: totals.conversions,
		revenue: totals.revenue
	}];
	return [];
}
function isMetricDateInRange(dateStr, range) {
	const parsed = parseMetricDate(dateStr);
	if (!parsed) return false;
	return isWithinInterval(parsed, {
		start: startOfDay(range.start),
		end: endOfDay(range.end)
	});
}
function dedupeAndFilterMetrics(metrics, dateRange) {
	const uniqueMap = /* @__PURE__ */ new Map();
	metrics.forEach((m) => {
		const accountId = m.accountId ?? "";
		const platform = m.publisherPlatform ?? m.surfaceId ?? "";
		const campaign = m.campaignId ?? "";
		const key = `${m.providerId}|${accountId}|${platform}|${campaign}|${m.date}`;
		const existing = uniqueMap.get(key);
		if (!existing || m.createdAt && existing.createdAt && m.createdAt > existing.createdAt) uniqueMap.set(key, m);
		else if (!existing?.createdAt && m.createdAt) uniqueMap.set(key, m);
	});
	return Array.from(uniqueMap.values()).filter((m) => isMetricDateInRange(m.date, dateRange)).sort((a, b) => {
		const aDate = parseMetricDate(a.date)?.getTime() ?? 0;
		return (parseMetricDate(b.date)?.getTime() ?? 0) - aDate;
	});
}
function metricsSummaryFromV2Insights(summary) {
	if (!summary) return null;
	const providers = {};
	for (const provider of summary.providers) {
		const normalized = normalizeAdsProviderId(provider.providerId) ?? provider.providerId;
		const delivery = provider.deliveryTotals;
		const financial = provider.financialTotals;
		providers[normalized] = {
			spend: financial.comparability === "single_currency" ? Number(financial.spend ?? 0) : 0,
			impressions: delivery.impressions,
			clicks: delivery.clicks,
			conversions: delivery.conversions,
			revenue: financial.comparability === "single_currency" ? Number(financial.revenue ?? 0) : 0
		};
	}
	const delivery = summary.deliveryTotals;
	const financial = summary.financialTotals;
	return {
		totals: {
			spend: financial.comparability === "single_currency" ? Number(financial.spend ?? 0) : 0,
			impressions: delivery.impressions,
			clicks: delivery.clicks,
			conversions: delivery.conversions,
			revenue: financial.comparability === "single_currency" ? Number(financial.revenue ?? 0) : 0
		},
		providers,
		count: summary.count
	};
}
function hasAdsMetricActivity(processedMetrics, serverSideSummary, adsInsightsSummary) {
	if (processedMetrics.length > 0) return true;
	const legacy = serverSideSummary?.totals;
	if (legacy && (legacy.spend > 0 || legacy.impressions > 0 || legacy.clicks > 0)) return true;
	const v2 = adsInsightsSummary;
	if (!v2) return false;
	const delivery = v2.deliveryTotals;
	if (delivery.impressions > 0 || delivery.clicks > 0 || delivery.conversions > 0) return true;
	const financial = v2.financialTotals;
	return financial.comparability === "single_currency" && Number(financial.spend ?? 0) > 0;
}
function buildProviderSummariesFromServer(providers) {
	if (!providers) return {};
	return Object.entries(providers).reduce((acc, [providerId, totals]) => {
		if (!isAdsProviderId(providerId)) return acc;
		const normalizedProviderId = normalizeAdsProviderId(providerId) ?? providerId;
		const providerSummary = acc[normalizedProviderId] ?? {
			spend: 0,
			impressions: 0,
			clicks: 0,
			conversions: 0,
			revenue: 0
		};
		providerSummary.spend += Number(totals.spend ?? 0);
		providerSummary.impressions += Number(totals.impressions ?? 0);
		providerSummary.clicks += Number(totals.clicks ?? 0);
		providerSummary.conversions += Number(totals.conversions ?? 0);
		providerSummary.revenue += Number(totals.revenue ?? 0);
		acc[normalizedProviderId] = providerSummary;
		return acc;
	}, {});
}
var EMPTY_CONNECTED_PROVIDER_IDS = [];
function CrossChannelOverviewCard({ processedMetrics, serverSideSummary, currency, connectedProviderIds = EMPTY_CONNECTED_PROVIDER_IDS, hasMetricData, initialMetricsLoading, metricsLoading, dateRange, onDateRangeChange, onExport, showDateAndExport = true, connection }) {
	const { hasConnectedAds, hasSuccessfulSync } = connection;
	const [selectedProviders, setSelectedProviders] = (0, import_react.useState)([]);
	const canonicalConnected = buildCanonicalConnectedIds(connectedProviderIds);
	const scopedMetrics = filterMetricsToConnected(processedMetrics, canonicalConnected);
	const availableProviders = (() => {
		if (canonicalConnected.length > 0) return canonicalConnected;
		const fromMetrics = scopedMetrics.flatMap((metric) => metric.providerId ? [metric.providerId] : []);
		return [...new Set(fromMetrics)].toSorted();
	})();
	const filteredMetrics = filterMetricsByProviders(scopedMetrics, selectedProviders);
	const overviewMetrics = metricsForOverviewDisplay(filteredMetrics, serverSideSummary, canonicalConnected, selectedProviders, currency);
	const displayState = resolveAdsMetricsDisplayState({
		metricsLoading: initialMetricsLoading || metricsLoading,
		connectedAccountCount: hasConnectedAds ? 1 : 0,
		hasSuccessfulSync,
		hasMetricData
	});
	const { cards: summaryCards, chartCurrency } = buildCrossChannelSummaryCards(overviewMetrics, displayState);
	const displayCurrency = chartCurrency ?? currency;
	const chartMetrics = (() => {
		const dailyRows = filteredMetrics.filter((metric) => metric.date !== "summary" && parseMetricDate(metric.date) !== null);
		if (dailyRows.length > 0) return dailyRows;
		return overviewMetrics.filter((metric) => metric.date !== "summary" && parseMetricDate(metric.date) !== null);
	})();
	const toggleProvider = (providerId) => {
		setSelectedProviders((prev) => prev.includes(providerId) ? prev.filter((p) => p !== providerId) : [...prev, providerId]);
	};
	const hasProviderFilter = selectedProviders.length > 0;
	const hasAggregateChartFallback = (() => {
		if (filteredMetrics.length > 0) return false;
		const totals = totalsFromServerSummary(serverSideSummary, canonicalConnected, selectedProviders);
		return totals !== null && totalsHaveDeliveryActivity(totals);
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.surfaceCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossChannelOverviewHeader, {
			availableProviders,
			dateRange,
			hasMetricData,
			hasProviderFilter,
			onDateRangeChange,
			onExport,
			onToggleProvider: toggleProvider,
			selectedProviders,
			showDateAndExport
		}), initialMetricsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossChannelOverviewLoadingState, {}) : !hasMetricData && !hasConnectedAds ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossChannelOverviewEmptyState, { displayState: "needs_connection" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossChannelOverviewContent, {
			currency: displayCurrency,
			chartMetrics,
			metricsLoading,
			summaryCards,
			hasAggregateChartFallback,
			hasConnectedAds,
			displayState
		})]
	});
}
function ProviderFilterOption({ providerId, selectedProviders, toggleProvider }) {
	const ProviderIcon = PROVIDER_ICON_MAP[providerId];
	const handleCheckedChange = () => {
		toggleProvider(providerId);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuCheckboxItem, {
		checked: selectedProviders.includes(providerId),
		onCheckedChange: handleCheckedChange,
		className: "cursor-pointer",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-2",
			children: [ProviderIcon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderIcon, { className: "size-4" }) : null, formatProviderName(providerId)]
		})
	}, providerId);
}
function HeaderWithTooltip({ title, tooltip }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-1",
		children: [title, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricHint, {
			description: tooltip,
			label: `About ${title}`,
			className: "text-muted-foreground/70"
		})]
	});
}
function MetricsTableHeader({ description, metricsLoading, onRefresh, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-lg",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: description })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "outline",
			size: "sm",
			onClick: onRefresh,
			disabled: metricsLoading,
			className: "inline-flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-4", metricsLoading && "animate-spin") }), "Refresh rows"]
		})]
	});
}
function MetricsTableFilters({ availableProviders, hasActiveFilters, onClearFilters, onSearchChange, searchQuery, selectedProviders, toggleProvider }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6 flex flex-col gap-3 sm:flex-row sm:items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Search by provider…",
				value: searchQuery,
				onChange: onSearchChange,
				className: "h-10 pl-9"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "h-10 gap-2 px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-4" }),
						"Providers",
						selectedProviders.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: "ml-1 px-1.5 py-0.5 text-xs",
							children: selectedProviders.length
						}) : null
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				align: "end",
				className: "w-48",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, { children: "Filter by Provider" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
					availableProviders.map((providerId) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderFilterOption, {
						providerId,
						selectedProviders,
						toggleProvider
					}, providerId))
				]
			})] }), hasActiveFilters ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: onClearFilters,
				className: "h-10 gap-1.5 px-3 text-muted-foreground hover:bg-muted/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), "Clear"]
			}) : null]
		})]
	});
}
function MetricsTableBody({ columns, emptyCtaHref, emptyCtaLabel, emptyMessage, filteredMetrics, hasMetrics, hasActiveFilters, initialMetricsLoading, metricError, onClearFilters, processedMetrics }) {
	if (hasActiveFilters && hasMetrics) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mb-4 text-sm text-muted-foreground",
		children: [
			"Showing ",
			filteredMetrics.length,
			" of ",
			processedMetrics.length,
			" rows"
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricsTableState, {
		columns,
		emptyCtaHref,
		emptyCtaLabel,
		emptyMessage,
		filteredMetrics,
		hasMetrics,
		initialMetricsLoading,
		metricError,
		onClearFilters
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricsTableState, {
		columns,
		emptyCtaHref,
		emptyCtaLabel,
		emptyMessage,
		filteredMetrics,
		hasMetrics,
		initialMetricsLoading,
		metricError,
		onClearFilters
	});
}
function MetricsTableState({ columns, emptyCtaHref, emptyCtaLabel, emptyMessage, filteredMetrics, hasMetrics, initialMetricsLoading, metricError, onClearFilters }) {
	const getRowId = (row) => row.id;
	if (initialMetricsLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		children: [
			0,
			1,
			2,
			3,
			4,
			5
		].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full rounded" }, slot))
	});
	if (metricError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
		variant: "destructive",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Unable to load metrics" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: metricError })]
	});
	if (!hasMetrics) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: emptyMessage }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			size: "sm",
			variant: "outline",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
				href: emptyCtaHref,
				children: emptyCtaLabel
			})
		})]
	});
	if (filteredMetrics.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No rows match your filters." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "sm",
			variant: "outline",
			onClick: onClearFilters,
			children: "Clear filters"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VirtualizedDataTable, {
		columns,
		data: filteredMetrics,
		maxHeight: 320,
		stickyHeader: true,
		rowHeight: 44,
		getRowId
	});
}
function MetricsTableLoadMore({ hasMetrics, loadMoreError, loadingMore, nextCursor, onLoadMore }) {
	if (!(nextCursor && hasMetrics)) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 flex flex-col items-center gap-2",
		children: [loadMoreError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-destructive",
			children: loadMoreError
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "outline",
			size: "sm",
			onClick: onLoadMore,
			disabled: loadingMore,
			className: "inline-flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-4", loadingMore && "animate-spin") }), loadingMore ? "Loading rows..." : "Load more rows"]
		})]
	});
}
function formatMetricMoney(value, currency) {
	if (!currency) return value.toLocaleString(void 0, { maximumFractionDigits: 2 });
	return formatCurrency(value, currency);
}
function buildMetricsTableColumns(currency) {
	return [
		{
			accessorKey: "date",
			header: ({ column }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableColumnHeader, {
				column,
				title: "Date"
			}),
			cell: ({ row }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "whitespace-nowrap",
				children: formatDisplayDate(row.getValue("date"))
			})
		},
		{
			accessorKey: "providerId",
			header: ({ column }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableColumnHeader, {
				column,
				title: "Provider"
			}),
			cell: ({ row }) => {
				const providerId = row.getValue("providerId");
				const ProviderIcon = PROVIDER_ICON_MAP[providerId];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [ProviderIcon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderIcon, {
						className: "size-4 text-muted-foreground",
						"aria-hidden": "true"
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatProviderName(providerId) })]
				});
			},
			filterFn: (row, id, value) => value.length === 0 || value.includes(row.getValue(id))
		},
		{
			accessorKey: "spend",
			header: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderWithTooltip, {
				title: "Spend",
				tooltip: "Total amount spent on ads"
			}),
			cell: ({ row }) => formatMetricMoney(row.getValue("spend"), row.original.currency ?? currency)
		},
		{
			accessorKey: "impressions",
			header: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderWithTooltip, {
				title: "Impressions",
				tooltip: "Number of times your ads were shown"
			}),
			cell: ({ row }) => row.getValue("impressions").toLocaleString()
		},
		{
			accessorKey: "clicks",
			header: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderWithTooltip, {
				title: "Clicks",
				tooltip: "Number of times your ads were clicked"
			}),
			cell: ({ row }) => row.getValue("clicks").toLocaleString()
		},
		{
			accessorKey: "conversions",
			header: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderWithTooltip, {
				title: "Conversions",
				tooltip: "Number of desired actions taken (e.g. purchases, signups)"
			}),
			cell: ({ row }) => row.getValue("conversions").toLocaleString()
		},
		{
			accessorKey: "revenue",
			header: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderWithTooltip, {
				title: "Revenue",
				tooltip: "Total revenue generated from ads"
			}),
			cell: ({ row }) => {
				const revenue = row.getValue("revenue");
				return revenue != null ? formatMetricMoney(revenue, row.original.currency ?? currency) : "—";
			}
		}
	];
}
function MetricsTableCardComponent({ visibleMetrics, processedMetrics, currency, hasMetrics, initialMetricsLoading, metricsLoading, metricError, nextCursor, loadingMore, loadMoreError, onRefresh, onLoadMore, title = "Latest synced rows", description = "Recent normalized records across all connected ad platforms.", emptyMessage = "No data yet. Once a sync completes, your most recent rows will appear here.", emptyCtaLabel = "Start a sync", emptyCtaHref = "#connect-ad-platforms" }) {
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [selectedProviders, setSelectedProviders] = (0, import_react.useState)([]);
	const availableProviders = (() => {
		const providers = new Set(processedMetrics.map((m) => m.providerId));
		return Array.from(providers).sort();
	})();
	const filteredMetrics = visibleMetrics.filter((metric) => {
		const providerName = formatProviderName(metric.providerId).toLowerCase();
		const matchesSearch = !searchQuery || providerName.includes(searchQuery.toLowerCase());
		const matchesProvider = selectedProviders.length === 0 || selectedProviders.includes(metric.providerId);
		return matchesSearch && matchesProvider;
	});
	const toggleProvider = (providerId) => {
		setSelectedProviders((prev) => prev.includes(providerId) ? prev.filter((p) => p !== providerId) : [...prev, providerId]);
	};
	const clearFilters = () => {
		setSearchQuery("");
		setSelectedProviders([]);
	};
	const handleSearchChange = (event) => {
		setSearchQuery(event.target.value);
	};
	const hasActiveFilters = searchQuery.length > 0 || selectedProviders.length > 0;
	const columns = buildMetricsTableColumns(currency);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricsTableHeader, {
			description,
			metricsLoading,
			onRefresh,
			title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
			hasMetrics && !initialMetricsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricsTableFilters, {
				availableProviders,
				hasActiveFilters,
				onClearFilters: clearFilters,
				onSearchChange: handleSearchChange,
				searchQuery,
				selectedProviders,
				toggleProvider
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricsTableBody, {
				columns,
				emptyCtaHref,
				emptyCtaLabel,
				emptyMessage,
				filteredMetrics,
				hasMetrics,
				hasActiveFilters,
				initialMetricsLoading,
				metricError,
				onClearFilters: clearFilters,
				processedMetrics
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricsTableLoadMore, {
				hasMetrics,
				loadMoreError,
				loadingMore,
				nextCursor,
				onLoadMore
			})
		] })]
	});
}
var MetricsTableCard = MetricsTableCardComponent;
function formatNumber(value) {
	return EN_US_NUMBER_FORMATTER.format(value);
}
function PerformanceSummaryCard({ providerSummaries, currency = "USD", providerCurrencies, hasMetrics, initialMetricsLoading, metricsLoading, metricError, onRefresh, onExport, title = "Ad performance summary", description = "Aggregated spend, clicks, and conversions over the last synced period", emptyMessage = "No synced performance data yet. Connect an ad platform and run a sync to populate these insights.", emptyCtaLabel = "Run first sync", emptyCtaHref = "#connect-ad-platforms", showActions = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.surfaceCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-col gap-4 border-b border-border/50 pb-5 md:flex-row md:items-start md:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: ADS_PAGE_THEME.sectionEyebrow,
						children: "By platform"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "flex items-center gap-3 text-lg font-semibold tracking-tight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {
								className: "size-5 text-primary",
								"aria-hidden": true
							})
						}), title]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "max-w-xl text-pretty leading-relaxed",
						children: description
					})
				]
			}), showActions ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: onRefresh,
					disabled: metricsLoading,
					className: "h-10 px-4 inline-flex items-center gap-2 motion-chromatic hover:shadow-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-4", metricsLoading && "animate-spin") }), "Refresh"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: onExport,
					className: "h-10 px-4 inline-flex items-center gap-2 motion-chromatic hover:shadow-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export Excel"]
				})]
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "pt-6",
			children: initialMetricsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					"summary-skeleton-1",
					"summary-skeleton-2",
					"summary-skeleton-3"
				].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full rounded-2xl" }, key))
			}) : metricError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
				variant: "destructive",
				className: "rounded-2xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Unable to load metrics" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: metricError })]
			}) : !hasMetrics ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: ADS_PAGE_THEME.emptyState,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-12 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border/50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {
							className: "size-6 text-muted-foreground/60",
							"aria-hidden": true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-sm text-sm leading-relaxed text-muted-foreground",
						children: emptyMessage
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						variant: "outline",
						className: "rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
							href: emptyCtaHref,
							children: emptyCtaLabel
						})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
				children: Object.entries(providerSummaries).map(([providerId, summary], index) => {
					const providerCurrency = providerCurrencies?.[normalizeAdsProviderId(providerId) ?? providerId] ?? currency;
					const ctr = summary.impressions > 0 ? summary.clicks / summary.impressions * 100 : null;
					const cpc = summary.clicks > 0 ? summary.spend / summary.clicks : null;
					const cpa = summary.conversions > 0 ? summary.spend / summary.conversions : null;
					const roas = summary.spend > 0 && Number.isFinite(summary.revenue) ? summary.revenue / summary.spend : null;
					const ProviderIcon = getProviderIcon(providerId);
					const dynamicStats = [
						{
							id: "impressions",
							label: "Impressions",
							value: formatNumber(summary.impressions)
						},
						{
							id: "clicks",
							label: "Clicks",
							value: formatNumber(summary.clicks)
						},
						{
							id: "conversions",
							label: "Conversions",
							value: formatNumber(summary.conversions)
						},
						{
							id: "ctr",
							label: "CTR",
							value: ctr !== null ? `${ctr.toFixed(2)}%` : "—"
						},
						{
							id: "avg-cpc",
							label: "Avg CPC",
							value: cpc !== null ? formatCurrency(cpc, providerCurrency) : "—"
						},
						{
							id: "cpa",
							label: "CPA",
							value: cpa !== null ? formatCurrency(cpa, providerCurrency) : "—"
						},
						{
							id: "roas",
							label: "ROAS",
							value: roas !== null ? `${roas.toFixed(2)}x` : "—"
						}
					];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: listItemEnterClass,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: cn(ADS_PAGE_THEME.providerTile, "motion-chromatic-lg"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								className: "border-b border-border/40 pb-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex size-9 items-center justify-center rounded-xl border border-primary/15 bg-primary/10",
										children: ProviderIcon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderIcon, {
											className: "size-4 text-primary",
											"aria-hidden": true
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {
											className: "size-4 text-primary",
											"aria-hidden": true
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "text-base font-semibold",
										children: formatProviderName(providerId)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
										className: "text-xs",
										children: "Since last sync"
									})] })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-4 pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: ADS_PAGE_THEME.kpiLabel,
									children: "Total spend"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-3xl font-bold tracking-tight tabular-nums",
									children: formatCurrency(summary.spend, providerCurrency)
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
									children: dynamicStats.map((stat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border/50 bg-muted/20 px-2.5 py-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
											children: stat.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-0.5 text-sm font-semibold tabular-nums",
											children: stat.value
										})]
									}, stat.id))
								})]
							})]
						})
					}, providerId);
				})
			})
		})]
	});
}
function WorkflowCard({ connectedCount = 0, hasSuccessfulSync = false, hasPendingSetup = false }) {
	const stepDone = [
		connectedCount > 0 && !hasPendingSetup,
		hasSuccessfulSync,
		hasSuccessfulSync
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: ADS_PAGE_THEME.surfaceCardHighlight,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-col gap-4 border-b border-border/50 pb-4 sm:flex-row sm:items-start sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, {
						className: "size-4 text-primary",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base leading-tight",
						children: "Get paid media connected"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "max-w-xl text-pretty leading-relaxed",
					children: "OAuth into Google, Meta, LinkedIn, and TikTok - then finish account selection in the setup panel. First sync pulls roughly 90 days of history."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				variant: "outline",
				className: "shrink-0 rounded-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					href: "#connect-ad-platforms",
					children: "Connect platforms"
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "grid gap-3 pt-4 sm:grid-cols-3",
			children: ADS_WORKFLOW_STEPS.map((step, index) => {
				const done = stepDone[index] ?? false;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("space-y-2.5 rounded-2xl border p-4", done ? "border-success/30 bg-success/[0.06] ring-1 ring-success/15" : "border-border/60 bg-background/80"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: done ? "default" : "secondary",
							className: cn("rounded-full font-medium", done && "bg-success text-success-foreground"),
							children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
									className: "size-3",
									"aria-hidden": true
								}), "Done"]
							}) : `Step ${index + 1}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-foreground",
							children: step.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-relaxed text-muted-foreground",
							children: step.description
						})
					]
				}, step.title);
			})
		})]
	});
}
function SetupTaskRow({ children, done, title, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between", done ? "border-success/25 bg-success/5" : "border-primary/15 bg-primary/[0.03]"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", done ? "bg-success/15 text-success" : "bg-primary/10 text-primary"),
				"aria-hidden": true,
				children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold text-foreground",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-relaxed text-muted-foreground",
					children: description
				})]
			})]
		}), children ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 flex-wrap gap-2 sm:justify-end",
			children
		}) : null]
	});
}
function AdSetupPanel({ connectedCount, totalProviders, googleNeedsAccountSelection, googleSetupMessage, onOpenGoogleSetup, metaSetupMessage, metaNeedsAccountSelection, initializingMeta, onInitializeMeta, metaAccountOptions, selectedMetaAccountId, onMetaAccountSelectionChange, loadingMetaAccountOptions, onReloadMetaAccountOptions, tiktokSetupMessage, tiktokNeedsAccountSelection, initializingTikTok, onInitializeTikTok, initializingGoogle = false }) {
	const pendingTasks = [
		googleNeedsAccountSelection,
		metaNeedsAccountSelection,
		tiktokNeedsAccountSelection
	].filter(Boolean).length;
	if (!(pendingTasks > 0 || Boolean(googleSetupMessage) || Boolean(metaSetupMessage) || Boolean(tiktokSetupMessage) || initializingMeta || initializingTikTok || initializingGoogle) && connectedCount >= totalProviders) return null;
	const progressValue = totalProviders > 0 ? Math.round(connectedCount / totalProviders * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: ADS_PAGE_THEME.surfaceCardHighlight,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "space-y-4 pb-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlugZap, {
								className: "size-4 text-primary",
								"aria-hidden": true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: "Finish ad account setup"
							}),
							pendingTasks > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "secondary",
								className: "font-normal",
								children: [
									pendingTasks,
									" step",
									pendingTasks === 1 ? "" : "s",
									" left"
								]
							}) : null
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-pretty",
						children: connectedCount === 0 ? "Connect a platform below, then complete any account selection steps here." : `${connectedCount} of ${totalProviders} platforms linked. Complete remaining steps to start syncing.`
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-[10rem] space-y-1.5 sm:text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-medium text-muted-foreground",
						children: [
							connectedCount,
							" / ",
							totalProviders,
							" connected"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
						value: progressValue,
						className: "h-2",
						"aria-label": "Ad platforms connected"
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [
				(initializingMeta || initializingTikTok || initializingGoogle) && !googleNeedsAccountSelection && !metaNeedsAccountSelection && !tiktokNeedsAccountSelection ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					className: "border-accent/40 bg-accent/5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, {
							className: "text-sm font-semibold",
							children: "Completing setup…"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
							className: "text-xs text-muted-foreground",
							children: "Linking your ad account and queuing the first sync. This usually takes a few seconds."
						})
					]
				}) : null,
				googleSetupMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					variant: "destructive",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, {
							className: "text-sm",
							children: "Google Ads setup issue"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
							className: "text-xs",
							children: googleSetupMessage
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							className: "mt-2",
							onClick: onOpenGoogleSetup,
							children: "Open account picker"
						})
					]
				}) : null,
				googleNeedsAccountSelection && !googleSetupMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupTaskRow, {
					done: false,
					title: "Select your Google Ads account",
					description: "OAuth succeeded — pick which ads account to sync into this workspace.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: onOpenGoogleSetup,
						disabled: initializingGoogle,
						children: "Select account"
					})
				}) : null,
				metaSetupMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					variant: "destructive",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, {
							className: "text-sm",
							children: "Meta Ads setup issue"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
							className: "text-xs",
							children: metaSetupMessage
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							className: "mt-2",
							onClick: onInitializeMeta,
							children: "Try again"
						})
					]
				}) : null,
				metaNeedsAccountSelection && !metaSetupMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupTaskRow, {
					done: false,
					title: "Select your Meta ad account",
					description: PROVIDER_INFO[PROVIDER_IDS.FACEBOOK].name + " only — organic Facebook/Instagram pages use Socials, not this flow.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: selectedMetaAccountId || void 0,
							onValueChange: onMetaAccountSelectionChange,
							disabled: loadingMetaAccountOptions || initializingMeta || metaAccountOptions.length === 0,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "w-full min-w-[12rem] sm:max-w-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: loadingMetaAccountOptions ? "Loading accounts…" : "Meta ad account" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: metaAccountOptions.map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: account.id,
								children: account.name
							}, account.id)) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: onReloadMetaAccountOptions,
							disabled: loadingMetaAccountOptions || initializingMeta,
							children: "Reload"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: onInitializeMeta,
							disabled: initializingMeta || loadingMetaAccountOptions || !selectedMetaAccountId,
							children: initializingMeta ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-3 animate-spin" }), "Finishing…"] }) : "Finish setup"
						})
					] })
				}) : null,
				!loadingMetaAccountOptions && metaNeedsAccountSelection && metaAccountOptions.length === 0 && !metaSetupMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-warning",
					children: "No Meta ad accounts found. Confirm Business Manager access, then reload accounts."
				}) : null,
				tiktokSetupMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					variant: "destructive",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, {
							className: "text-sm",
							children: "TikTok Ads setup issue"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
							className: "text-xs",
							children: tiktokSetupMessage
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							className: "mt-2",
							onClick: onInitializeTikTok,
							children: "Try again"
						})
					]
				}) : null,
				tiktokNeedsAccountSelection && !tiktokSetupMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupTaskRow, {
					done: false,
					title: "Complete TikTok Ads setup",
					description: "Confirm your default TikTok ad account so we can queue the initial 90-day sync.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: onInitializeTikTok,
						disabled: initializingTikTok,
						children: initializingTikTok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-3 animate-spin" }), "Finishing…"] }) : "Finish setup"
					})
				}) : null,
				connectedCount === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Tip: connect Google, Meta, LinkedIn, and TikTok from the cards below. Each uses a secure redirect to the platform - you'll return here to finish setup."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"Organic social (Facebook/Instagram pages) lives on",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
							href: "/dashboard/socials",
							className: "font-medium text-primary underline-offset-4 hover:underline",
							children: "Socials"
						}),
						", separate from Meta Ads above."
					]
				})
			]
		})]
	});
}
var DEFAULT_AUTOMATION_DRAFT = {
	autoSyncEnabled: true,
	syncFrequencyMinutes: 360,
	scheduledTimeframeDays: 7
};
function AutomationControlsCard({ automationStatuses, automationDraft, savingSettings, settingsErrors, expandedProviders, syncingProvider, onUpdateDraft, onSaveAutomation, onToggleAdvanced, onRunManualSync }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-col gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-lg",
				children: "Automation controls"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Toggle automatic syncs and adjust frequency for each connected provider." })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "space-y-4",
			children: automationStatuses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col items-center justify-center rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Connect an ad platform to configure auto-sync preferences." })
			}) : automationStatuses.map((status) => {
				const draft = automationDraft[status.providerId] ?? DEFAULT_AUTOMATION_DRAFT;
				const saving = savingSettings[status.providerId] ?? false;
				const errorMessage = settingsErrors[status.providerId];
				const isExpanded = expandedProviders[status.providerId] ?? false;
				const frequencyLabel = describeFrequency(draft.syncFrequencyMinutes);
				const timeframeLabel = describeTimeframe(draft.scheduledTimeframeDays);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutomationProviderCard, {
					status,
					draft,
					saving,
					errorMessage,
					isExpanded,
					autoSyncSummary: draft.autoSyncEnabled ? `Auto-sync is on. Cohorts refresh ${frequencyLabel.toLowerCase()} covering the ${timeframeLabel.toLowerCase()}.` : "Auto-sync is off. Turn it on to keep metrics current automatically.",
					syncingProvider,
					onUpdateDraft,
					onSaveAutomation,
					onToggleAdvanced,
					onRunManualSync
				}, status.providerId);
			})
		})]
	});
}
function AutomationProviderCard({ status, draft, saving, errorMessage, isExpanded, autoSyncSummary, syncingProvider, onUpdateDraft, onSaveAutomation, onToggleAdvanced, onRunManualSync }) {
	const handleToggleAdvanced = () => {
		onToggleAdvanced(status.providerId);
	};
	const handleAutoSyncChange = (event) => {
		onUpdateDraft(status.providerId, { autoSyncEnabled: event.target.checked });
	};
	const handleFrequencyChange = (value) => {
		onUpdateDraft(status.providerId, { syncFrequencyMinutes: Number(value) });
	};
	const handleTimeframeChange = (value) => {
		onUpdateDraft(status.providerId, { scheduledTimeframeDays: Number(value) });
	};
	const handleSave = () => {
		onSaveAutomation(status.providerId);
	};
	const handleRunSync = () => {
		onRunManualSync(status.providerId);
	};
	const handleAsyncInsightsChange = (event) => {
		onUpdateDraft(status.providerId, { metaUseAsyncInsights: event.target.checked });
	};
	const isMeta = status.providerId === "facebook";
	const { user } = useAuth();
	const { selectedClientId } = useClientContext();
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 rounded-lg border border-muted/60 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-foreground",
								children: formatProviderName(status.providerId)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: getStatusBadgeVariant$1(status.status),
								children: getStatusLabel$1(status.status)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: autoSyncSummary
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"Last sync: ",
								formatRelativeTimestamp(status.lastSyncedAt),
								" · Last request: ",
								formatRelativeTimestamp(status.lastSyncRequestedAt)
							]
						}),
						status.message ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: ["Last message: ", status.message]
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2 self-start md:self-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						className: "text-xs",
						onClick: handleToggleAdvanced,
						disabled: saving,
						children: isExpanded ? "Hide advanced" : "Adjust cadence"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm font-medium text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
					id: `auto-sync-${status.providerId}`,
					checked: draft.autoSyncEnabled,
					onChange: handleAutoSyncChange,
					disabled: saving
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: `auto-sync-${status.providerId}`,
					className: "cursor-pointer",
					children: "Enable automatic sync"
				})]
			}),
			isMeta ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2 rounded-md border border-border/50 bg-muted/20 p-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
					id: `meta-async-${status.providerId}`,
					checked: draft.metaUseAsyncInsights === true,
					onChange: handleAsyncInsightsChange,
					disabled: saving
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					htmlFor: `meta-async-${status.providerId}`,
					className: "cursor-pointer space-y-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-foreground",
						children: "Async insights reports"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block text-xs text-muted-foreground",
						children: [
							"Use Meta async jobs for metric sync (recommended for large accounts). Falls back to env",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "text-[10px]",
								children: "META_ADS_USE_ASYNC_INSIGHTS"
							}),
							" when off."
						]
					})]
				})]
			}) : null,
			isMeta && isExpanded && workspaceId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaEventsToolsPanel, {
				workspaceId,
				clientId: selectedClientId,
				adAccountId: status.accountId,
				scope: "account"
			}) : null,
			isExpanded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-medium text-muted-foreground",
						children: "Cadence"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: String(draft.syncFrequencyMinutes),
						onValueChange: handleFrequencyChange,
						disabled: saving,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							disabled: saving,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select cadence" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: FREQUENCY_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: String(option.value),
							children: option.label
						}, option.value)) })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-medium text-muted-foreground",
						children: "Data window"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: String(draft.scheduledTimeframeDays),
						onValueChange: handleTimeframeChange,
						disabled: saving,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							disabled: saving,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select window" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TIMEFRAME_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: String(option.value),
							children: option.label
						}, option.value)) })]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 md:flex-row md:items-center md:justify-between",
				children: [errorMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-destructive",
					children: errorMessage
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Changes apply to future scheduled syncs for this provider."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						variant: "outline",
						className: "inline-flex items-center gap-2",
						onClick: handleSave,
						disabled: saving,
						children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), saving ? "Saving…" : "Save automation"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						className: "inline-flex items-center gap-2",
						onClick: handleRunSync,
						disabled: syncingProvider === status.providerId,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-4", syncingProvider === status.providerId && "animate-spin") }), syncingProvider === status.providerId ? "Syncing…" : "Run sync now"]
					})]
				})]
			})
		]
	});
}
function useAdsAutomation(options) {
	const { automationStatuses, onRefresh } = options;
	const { user } = useAuth();
	const updateAutomationSettings = useMutation(adsIntegrationsApi.updateAutomationSettings);
	const requestManualSync = useMutation(adsIntegrationsApi.requestManualSync);
	const [automationDraftEdits, setAutomationDraftEdits] = (0, import_react.useState)(null);
	const [savingSettings, setSavingSettings] = (0, import_react.useState)({});
	const [settingsErrors, setSettingsErrors] = (0, import_react.useState)({});
	const [expandedProviders, setExpandedProviders] = (0, import_react.useState)({});
	const [syncingProvider, setSyncingProvider] = (0, import_react.useState)(null);
	const automationStatusesKey = JSON.stringify(automationStatuses.map((s) => ({
		id: s.providerId,
		enabled: s.autoSyncEnabled,
		freq: s.syncFrequencyMinutes,
		days: s.scheduledTimeframeDays,
		async: s.metaUseAsyncInsights
	})));
	const automationDraftFromServer = (() => {
		if (automationStatuses.length === 0) return {};
		const nextDraft = {};
		automationStatuses.forEach((status) => {
			nextDraft[status.providerId] = {
				autoSyncEnabled: status.autoSyncEnabled !== false,
				syncFrequencyMinutes: normalizeFrequency(status.syncFrequencyMinutes ?? null),
				scheduledTimeframeDays: normalizeTimeframe(status.scheduledTimeframeDays ?? null),
				metaUseAsyncInsights: status.metaUseAsyncInsights === true
			};
		});
		return nextDraft;
	})();
	const automationDraft = (() => {
		if (automationDraftEdits?.key === automationStatusesKey) return automationDraftEdits.draft;
		return automationDraftFromServer;
	})();
	const updateAutomationDraft = (providerId, updates) => {
		setAutomationDraftEdits((prev) => {
			const base = prev?.key === automationStatusesKey ? prev.draft : automationDraftFromServer;
			const current = base[providerId] ?? {
				autoSyncEnabled: true,
				syncFrequencyMinutes: 360,
				scheduledTimeframeDays: 7
			};
			return {
				key: automationStatusesKey,
				draft: {
					...base,
					[providerId]: {
						...current,
						...updates
					}
				}
			};
		});
		setSettingsErrors((prev) => {
			if (!prev[providerId]) return prev;
			const next = { ...prev };
			delete next[providerId];
			return next;
		});
	};
	const handleSaveAutomation = async (providerId) => {
		const draft = automationDraft[providerId];
		if (!draft) {
			notifyFailure({ message: "Connect an integration before adjusting automation." });
			return;
		}
		if (!user?.id) {
			notifyFailure({ message: "Please sign in again to update your preferences." });
			return;
		}
		setSavingSettings((prev) => ({
			...prev,
			[providerId]: true
		}));
		setSettingsErrors((prev) => ({
			...prev,
			[providerId]: ""
		}));
		try {
			if (!user?.agencyId) throw new Error("Missing workspace id");
			await updateAutomationSettings({
				workspaceId: String(user.agencyId),
				providerId,
				clientId: null,
				autoSyncEnabled: draft.autoSyncEnabled,
				syncFrequencyMinutes: draft.syncFrequencyMinutes,
				scheduledTimeframeDays: draft.scheduledTimeframeDays,
				metaUseAsyncInsights: providerId === "facebook" ? draft.metaUseAsyncInsights === true : void 0
			});
			notifySuccess({
				title: TOAST_TITLES.AUTOMATION_UPDATED,
				message: SUCCESS_MESSAGES.AUTOMATION_UPDATED(formatProviderName(providerId))
			});
			onRefresh?.();
		} catch (error) {
			logError(error, "useAdsAutomation:handleSaveAutomation");
			const message = asErrorMessage(error);
			setSettingsErrors((prev) => ({
				...prev,
				[providerId]: message
			}));
			notifyFailure({
				title: TOAST_TITLES.AUTOMATION_UPDATED,
				message
			});
		} finally {
			setSavingSettings((prev) => ({
				...prev,
				[providerId]: false
			}));
		}
	};
	const toggleAdvanced = (providerId) => {
		setExpandedProviders((prev) => ({
			...prev,
			[providerId]: !prev[providerId]
		}));
	};
	const runManualSync = async (providerId) => {
		if (!user?.id) {
			notifyFailure({
				title: TOAST_TITLES.UNABLE_TO_SYNC,
				message: ERROR_MESSAGES.SIGN_IN_REQUIRED
			});
			return;
		}
		setSyncingProvider(providerId);
		try {
			if (!user?.agencyId) throw new Error("Missing workspace id");
			await requestManualSync({
				workspaceId: String(user.agencyId),
				providerId,
				clientId: null
			});
			const providerName = formatProviderName(providerId);
			const successMessage = SUCCESS_MESSAGES.SYNC_COMPLETE(providerName);
			notifySuccess({
				title: TOAST_TITLES.SYNC_COMPLETE,
				message: successMessage
			});
			onRefresh?.();
		} catch (error) {
			logError(error, "useAdsAutomation:runManualSync");
			const message = asErrorMessage(error);
			notifyFailure({
				title: TOAST_TITLES.UNABLE_TO_SYNC,
				message
			});
		} finally {
			setSyncingProvider(null);
		}
	};
	return {
		automationDraft,
		savingSettings,
		settingsErrors,
		expandedProviders,
		syncingProvider,
		updateAutomationDraft,
		handleSaveAutomation,
		toggleAdvanced,
		runManualSync
	};
}
var CampaignManagementCard = (0, import_react.lazy)(() => import("./campaign-management-card-CpPz-n97.mjs").then((m) => ({ default: m.CampaignManagementCard })));
var CustomInsightsCard = (0, import_react.lazy)(() => import("./custom-insights-card-DtEYxZHA.mjs").then((m) => ({ default: m.CustomInsightsCard })));
var ComparisonViewCard = (0, import_react.lazy)(() => import("./comparison-view-card-CCUeJqvZ.mjs").then((m) => ({ default: m.ComparisonViewCard })));
var FormulaBuilderCard = (0, import_react.lazy)(() => import("./formula-builder-card-DnRzyIwq.mjs").then((n) => n.n).then((m) => ({ default: m.FormulaBuilderCard })));
var AlgorithmicInsightsCard = (0, import_react.lazy)(() => import("./algorithmic-insights-card-BIXfbVVk.mjs").then((m) => ({ default: m.AlgorithmicInsightsCard })));
var InsightsChartsCard = (0, import_react.lazy)(() => import("./insights-charts-card-B_nBQVCI.mjs").then((m) => ({ default: m.InsightsChartsCard })));
var ADS_SKELETON_200 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[200px] w-full" });
var ADS_SKELETON_250 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[250px] w-full" });
var ADS_SKELETON_300 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[300px] w-full" });
function AdsSuspenseReveal({ children, fallback }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevealTransitionFallback, { children: fallback }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevealTransition, { children })
	});
}
function AdsPageSetupSection({ flags, connectedAccountCount, connections, metrics, dateRange, openGoogleCampaignSetup, handleInitializeMeta, handleInitializeTikTok }) {
	const { isPreviewMode, showWorkflow, hasSuccessfulSync, hasPendingSetup } = flags;
	const { adPlatforms, connectedProviders, connectingProvider, connectionErrors, integrationStatusMap, handleConnect, handleDisconnect, handleOauthRedirect, handleSyncNow, syncingProviders, googleNeedsAccountSelection, metaNeedsAccountSelection, tiktokNeedsAccountSelection, googleSetupMessage, metaSetupMessage, tiktokSetupMessage, initializingGoogle, initializingMeta, initializingTikTok, metaAccountOptions, selectedMetaAccountId, setSelectedMetaAccountId, loadingMetaAccountOptions, reloadMetaAccountOptions } = connections;
	const { handleManualRefresh } = metrics;
	const handleReloadMetaAccountOptions = () => {
		reloadMetaAccountOptions();
	};
	const pendingSetupCount = [
		googleNeedsAccountSelection,
		metaNeedsAccountSelection,
		tiktokNeedsAccountSelection
	].filter(Boolean).length;
	if (isPreviewMode) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		showWorkflow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkflowCard, {
			connectedCount: connectedAccountCount,
			hasSuccessfulSync,
			hasPendingSetup
		}) }) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			id: "connect-ad-platforms",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdConnectionsCard, {
				providers: adPlatforms,
				connectedProviders,
				connectingProvider,
				connectionErrors,
				integrationStatuses: integrationStatusMap,
				onConnect: handleConnect,
				onDisconnect: handleDisconnect,
				onOauthRedirect: handleOauthRedirect,
				onSyncNow: handleSyncNow,
				syncingProviders,
				onRefresh: handleManualRefresh,
				refreshing: metrics.metricsLoading,
				connectedCount: connectedAccountCount,
				totalProviders: adPlatforms.length,
				pendingSetupCount
			})
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSetupPanel, {
			connectedCount: connectedAccountCount,
			totalProviders: adPlatforms.length,
			googleNeedsAccountSelection,
			googleSetupMessage,
			onOpenGoogleSetup: openGoogleCampaignSetup,
			metaSetupMessage,
			metaNeedsAccountSelection,
			initializingMeta,
			onInitializeMeta: handleInitializeMeta,
			metaAccountOptions,
			selectedMetaAccountId,
			onMetaAccountSelectionChange: setSelectedMetaAccountId,
			loadingMetaAccountOptions,
			onReloadMetaAccountOptions: handleReloadMetaAccountOptions,
			tiktokSetupMessage,
			tiktokNeedsAccountSelection,
			initializingTikTok,
			onInitializeTikTok: handleInitializeTikTok,
			initializingGoogle
		}) }),
		connectedAccountCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 border-t border-border/50 pt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80",
						children: "Campaign management"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-semibold tracking-tight text-foreground",
						children: "Per-platform campaigns"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: "Drill into live campaigns for each linked account - filtered by the date range in the page header."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsSuspenseReveal, {
				fallback: ADS_SKELETON_200,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex w-full flex-col gap-4",
					children: adPlatforms.flatMap((platform) => connectedProviders[platform.id] ? [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignManagementCard, {
						providerId: platform.id,
						providerName: platform.name,
						isConnected: Boolean(connectedProviders[platform.id]),
						dateRange,
						onRefresh: handleManualRefresh,
						setupRequired: platform.id === "google" && googleNeedsAccountSelection || platform.id === "facebook" && metaNeedsAccountSelection || platform.id === "tiktok" && tiktokNeedsAccountSelection,
						setupTitle: platform.id === "google" ? "Select a Google Ads account" : platform.id === "facebook" ? "Select a Meta ad account" : platform.id === "tiktok" ? "Finish TikTok account setup" : void 0,
						setupDescription: platform.id === "google" ? "Choose the Google Ads account you want to manage before loading campaign data." : platform.id === "facebook" ? "Choose the Meta ad account you want to manage before loading campaign data." : platform.id === "tiktok" ? "Complete TikTok setup so the default ad account is assigned before loading campaign data." : void 0,
						setupActionLabel: platform.id === "google" ? "Select account" : "Finish setup",
						onSetupAction: platform.id === "google" ? openGoogleCampaignSetup : platform.id === "facebook" ? handleInitializeMeta : platform.id === "tiktok" ? handleInitializeTikTok : void 0
					}, platform.id)] : [])
				})
			})]
		}) }) : null
	] });
}
function AdsPageAnalyticsSection({ metrics, algorithmicInsights, activeCurrency, connectedProviderIds, connectedAccountCount, hasSuccessfulSync, suppressMetricsErrors, dateRange, providerCurrencyMap }) {
	const { processedMetrics, effectiveServerSummary, providerSummaries, hasMetricData, initialMetricsLoading, metricsLoading, metricError, setDateRange, handleExport, handleManualRefresh } = metrics;
	const metricsDisplayState = resolveAdsMetricsDisplayState({
		metricsLoading: initialMetricsLoading || metricsLoading,
		connectedAccountCount,
		hasSuccessfulSync,
		hasMetricData
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossChannelOverviewCard, {
			processedMetrics,
			serverSideSummary: effectiveServerSummary,
			currency: activeCurrency,
			connectedProviderIds,
			connection: {
				hasConnectedAds: connectedAccountCount > 0,
				hasSuccessfulSync
			},
			hasMetricData,
			initialMetricsLoading,
			metricsLoading,
			dateRange,
			onDateRangeChange: setDateRange,
			onExport: handleExport,
			showDateAndExport: false
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerformanceSummaryCard, {
			providerSummaries,
			currency: activeCurrency,
			providerCurrencies: providerCurrencyMap,
			hasMetrics: hasMetricData,
			initialMetricsLoading,
			metricsLoading,
			metricError: suppressMetricsErrors ? null : metricError,
			onRefresh: handleManualRefresh,
			onExport: handleExport,
			showActions: false,
			emptyMessage: metricsDisplayState === "synced_no_delivery" ? "This account synced successfully, but Meta returned no delivery metrics for the selected dates. Try widening the date range or confirm campaigns are active in Ads Manager." : metricsDisplayState === "needs_sync" ? "Your ad account is connected. Run a sync to populate spend, clicks, and conversions for this date range." : void 0,
			emptyCtaLabel: metricsDisplayState === "synced_no_delivery" ? "Adjust date range" : "Run first sync"
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsSuspenseReveal, {
			fallback: ADS_SKELETON_200,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlgorithmicInsightsCard, {
				insights: algorithmicInsights.insights,
				globalEfficiencyScore: algorithmicInsights.globalEfficiencyScore,
				providerEfficiencyScores: algorithmicInsights.providerEfficiencyScores,
				loading: metricsLoading || initialMetricsLoading
			})
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsSuspenseReveal, {
			fallback: ADS_SKELETON_300,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsChartsCard, {
				analysis: algorithmicInsights.analysis,
				currency: activeCurrency,
				providerCurrencies: providerCurrencyMap,
				loading: metricsLoading || initialMetricsLoading,
				hasConnections: connectedAccountCount > 0,
				metricsDisplayState
			})
		}) })
	] });
}
function AdsPageAdvancedAnalyticsSection({ metrics, derivedMetrics, formulaEditor, comparison, activeCurrency, suppressMetricsErrors, handleLoadMoreMetrics, providerCurrencyMap, automationStatuses, connectedAccountCount, showWorkflow }) {
	const { processedMetrics, tableMetrics, hasMetricData, initialMetricsLoading, metricsLoading, metricError, nextCursor, loadingMore, loadMoreError, handleManualRefresh } = metrics;
	const { periodComparison, providerComparison } = comparison;
	const automation = useAdsAutomation({
		automationStatuses,
		onRefresh: handleManualRefresh
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		connectedAccountCount > 0 && !showWorkflow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutomationControlsCard, {
			automationStatuses,
			automationDraft: automation.automationDraft,
			savingSettings: automation.savingSettings,
			settingsErrors: automation.settingsErrors,
			expandedProviders: automation.expandedProviders,
			syncingProvider: automation.syncingProvider,
			onUpdateDraft: automation.updateAutomationDraft,
			onSaveAutomation: automation.handleSaveAutomation,
			onToggleAdvanced: automation.toggleAdvanced,
			onRunManualSync: automation.runManualSync
		}) }) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsSuspenseReveal, {
			fallback: ADS_SKELETON_250,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComparisonViewCard, {
				periodComparison,
				providerComparison,
				currency: activeCurrency,
				providerCurrencies: providerCurrencyMap,
				loading: metricsLoading || initialMetricsLoading
			})
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsSuspenseReveal, {
			fallback: ADS_SKELETON_200,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomInsightsCard, {
				derivedMetrics: hasMetricData ? derivedMetrics : null,
				processedMetrics,
				currency: activeCurrency,
				providerCurrencyMap,
				loading: metricsLoading || initialMetricsLoading
			})
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsSuspenseReveal, {
			fallback: ADS_SKELETON_300,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormulaBuilderCard, {
				formulaEditor,
				metricTotals: hasMetricData ? derivedMetrics.totals : void 0,
				loading: metricsLoading || initialMetricsLoading
			})
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricsTableCard, {
			visibleMetrics: metrics.metrics,
			processedMetrics: tableMetrics,
			currency: activeCurrency,
			hasMetrics: hasMetricData,
			initialMetricsLoading,
			metricsLoading,
			metricError: suppressMetricsErrors ? null : metricError,
			nextCursor,
			loadingMore,
			loadMoreError: suppressMetricsErrors ? null : loadMoreError,
			onRefresh: handleManualRefresh,
			onLoadMore: handleLoadMoreMetrics
		}) })
	] });
}
function buildProviderSummaryTable(providerSummaries, formatProviderNameFn) {
	return {
		headers: [
			"Platform",
			"Spend",
			"Impressions",
			"Clicks",
			"Conversions",
			"Revenue",
			"CTR (%)",
			"CPC",
			"CPA",
			"ROAS"
		],
		rows: Object.entries(providerSummaries).map(([providerId, summary]) => {
			const ctr = summary.impressions > 0 ? summary.clicks / summary.impressions * 100 : 0;
			const cpc = summary.clicks > 0 ? summary.spend / summary.clicks : 0;
			const cpa = summary.conversions > 0 ? summary.spend / summary.conversions : 0;
			const roas = summary.spend > 0 && Number.isFinite(summary.revenue) ? summary.revenue / summary.spend : 0;
			return [
				formatProviderNameFn(normalizeAdsProviderId(providerId) ?? providerId),
				summary.spend.toFixed(2),
				summary.impressions,
				summary.clicks,
				summary.conversions,
				(summary.revenue || 0).toFixed(2),
				ctr.toFixed(2),
				cpc.toFixed(2),
				cpa.toFixed(2),
				roas.toFixed(2)
			];
		})
	};
}
async function exportMetricsToCsv(processedMetrics, options) {
	const formatProviderNameFn = options?.formatProviderNameFn ?? formatProviderName;
	const { exportCohortsSpreadsheetRows } = await import("./cohorts-spreadsheet-oHwGWk0s.mjs").then((n) => n.n);
	const headers = [
		"Date",
		"Provider",
		"Currency",
		"Spend",
		"Impressions",
		"Clicks",
		"Conversions",
		"Revenue"
	];
	const rows = processedMetrics.map((m) => [
		m.date,
		formatProviderNameFn(normalizeAdsProviderId(m.providerId) ?? m.providerId),
		m.currency ?? "",
		m.spend.toFixed(2),
		m.impressions,
		m.clicks,
		m.conversions,
		(m.revenue || 0).toFixed(2)
	]);
	const extraTables = options?.providerSummaries && Object.keys(options.providerSummaries).length > 0 ? [{
		title: "Summary by platform",
		...buildProviderSummaryTable(options.providerSummaries, formatProviderNameFn)
	}] : void 0;
	const totalSpend = processedMetrics.reduce((sum, metric) => sum + metric.spend, 0);
	const totalImpressions = processedMetrics.reduce((sum, metric) => sum + metric.impressions, 0);
	const totalClicks = processedMetrics.reduce((sum, metric) => sum + metric.clicks, 0);
	const totalConversions = processedMetrics.reduce((sum, metric) => sum + metric.conversions, 0);
	await exportCohortsSpreadsheetRows({
		filename: `ads-metrics-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`,
		title: "Ad platform metrics",
		subtitle: `${processedMetrics.length} daily row${processedMetrics.length === 1 ? "" : "s"}`,
		sheetName: "Ad Metrics",
		headers,
		rows,
		extraTables,
		metadata: {
			"Total spend": totalSpend.toFixed(2),
			Impressions: totalImpressions.toLocaleString("en-US"),
			Clicks: totalClicks.toLocaleString("en-US"),
			Conversions: totalConversions.toLocaleString("en-US")
		},
		charts: filterMeaningfulCharts(buildAdsMetricsCharts(processedMetrics.map((metric) => ({
			...metric,
			revenue: metric.revenue ?? void 0
		}))))
	});
}
function isAuthError$1(error) {
	const code = extractErrorCode(error);
	return code === "UNAUTHORIZED" || code === "FORBIDDEN";
}
function useAdsMetrics(options = {}) {
	const { refreshTick: externalRefreshTick = 0 } = options;
	const { user } = useAuth();
	const { selectedClientId } = useClientContext();
	const { isPreviewMode } = usePreview();
	const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
	const [visibleCount, setVisibleCount] = (0, import_react.useState)(100);
	const [persistedMetricError, setPersistedMetricError] = (0, import_react.useState)(null);
	const [loadMoreError, setLoadMoreError] = (0, import_react.useState)(null);
	const [loadingMore, setLoadingMore] = (0, import_react.useState)(false);
	const [internalRefreshTick, setInternalRefreshTick] = (0, import_react.useState)(0);
	const [dateRange, setDateRange] = (0, import_react.useState)(() => ({
		start: startOfDay(subDays(/* @__PURE__ */ new Date(), 89)),
		end: endOfDay(/* @__PURE__ */ new Date())
	}));
	internalRefreshTick + externalRefreshTick;
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const canQueryConvex = isAuthenticated && !convexAuthLoading && Boolean(user?.id);
	const metricsRealtime = useQuery(api.adsMetrics.listMetricsWithSummary, isPreviewMode || !workspaceId || !canQueryConvex ? "skip" : {
		workspaceId,
		clientId: selectedClientId ?? null,
		startDate: formatMetricQueryDate(dateRange.start),
		endDate: formatMetricQueryDate(dateRange.end),
		limit: 1e3,
		aggregate: true
	});
	const metricsRealtimeV2 = useQuery(api.adsMetrics.listMetricsWithSummaryV2, isPreviewMode || !workspaceId || !canQueryConvex ? "skip" : {
		workspaceId,
		clientId: selectedClientId ?? null,
		startDate: formatMetricQueryDate(dateRange.start),
		endDate: formatMetricQueryDate(dateRange.end),
		limit: 1e3,
		aggregate: true
	});
	const metricsQueryError = useConvexQueryError({
		data: metricsRealtime,
		skipped: isPreviewMode || !workspaceId || !canQueryConvex,
		loading: convexAuthLoading,
		fallbackMessage: "Unable to load ad metrics."
	});
	const metricsV2QueryError = useConvexQueryError({
		data: metricsRealtimeV2,
		skipped: isPreviewMode || !workspaceId || !canQueryConvex,
		loading: convexAuthLoading,
		fallbackMessage: "Unable to load ad metrics."
	});
	const metricsSource = (() => {
		if (isPreviewMode) return getPreviewAdsMetrics();
		if (!workspaceId || !canQueryConvex) return [];
		const v2Rows = Array.isArray(metricsRealtimeV2?.metrics) ? metricsRealtimeV2.metrics : null;
		const v1Rows = Array.isArray(metricsRealtime?.metrics) ? metricsRealtime.metrics : [];
		return (v2Rows ?? v1Rows).flatMap((row) => isAdsProviderId(row.providerId) ? [mapRealtimeMetricRow(row)] : []);
	})();
	const processedMetrics = dedupeAndFilterMetrics(metricsSource, dateRange);
	const effectiveServerSummary = (!isPreviewMode && metricsRealtime?.summary ? metricsRealtime.summary : null) ?? metricsSummaryFromV2Insights(!isPreviewMode && metricsRealtimeV2?.summary ? metricsRealtimeV2.summary : null);
	const tableMetrics = metricsForTableDisplay(processedMetrics, effectiveServerSummary);
	const isConvexLoading = !isPreviewMode && Boolean(workspaceId && canQueryConvex) && (metricsRealtime === void 0 || metricsRealtimeV2 === void 0);
	const { metrics, metricsLoading, nextCursor, serverSideSummary, adsInsightsSummary } = (() => {
		if (!isPreviewMode && workspaceId && !canQueryConvex) return {
			metricsLoading: false,
			metrics: [],
			nextCursor: null,
			serverSideSummary: null,
			adsInsightsSummary: null
		};
		if (isConvexLoading) return {
			metricsLoading: true,
			metrics: [],
			nextCursor: null,
			serverSideSummary: null,
			adsInsightsSummary: null
		};
		const summary = !isPreviewMode && metricsRealtime?.summary ? metricsRealtime.summary : null;
		const v2Summary = !isPreviewMode && metricsRealtimeV2?.summary ? metricsRealtimeV2.summary : null;
		return {
			metricsLoading: false,
			metrics: tableMetrics.slice(0, visibleCount),
			nextCursor: tableMetrics.length > visibleCount ? "more" : null,
			serverSideSummary: summary,
			adsInsightsSummary: v2Summary
		};
	})();
	const metricError = (() => {
		if (!isPreviewMode && workspaceId && !canQueryConvex && persistedMetricError) return ERROR_MESSAGES.SIGN_IN_REQUIRED;
		return persistedMetricError ?? metricsQueryError ?? metricsV2QueryError ?? null;
	})();
	const hasMetricData = hasAdsMetricActivity(processedMetrics, effectiveServerSummary, adsInsightsSummary);
	const resolvedServerSummary = serverSideSummary ?? effectiveServerSummary;
	const initialMetricsLoading = metricsLoading && !hasMetricData;
	const providerSummaries = (() => {
		if (resolvedServerSummary?.providers && metricsSource.length <= 100) return buildProviderSummariesFromServer(resolvedServerSummary.providers);
		const summary = {};
		processedMetrics.forEach((metric) => {
			const providerSummary = summary[metric.providerId] ?? {
				spend: 0,
				impressions: 0,
				clicks: 0,
				conversions: 0,
				revenue: 0
			};
			providerSummary.spend += metric.spend;
			providerSummary.impressions += metric.impressions;
			providerSummary.clicks += metric.clicks;
			providerSummary.conversions += metric.conversions;
			providerSummary.revenue += metric.revenue ?? 0;
			summary[metric.providerId] = providerSummary;
		});
		return summary;
	})();
	const handleManualRefresh = () => {
		if (metricsLoading) return;
		setVisibleCount(100);
		setPersistedMetricError(null);
		setLoadMoreError(null);
		setInternalRefreshTick((tick) => tick + 1);
	};
	const handleLoadMore = async () => {
		if (!nextCursor || loadingMore || metricsLoading) return;
		setLoadingMore(true);
		setLoadMoreError(null);
		try {
			setVisibleCount(visibleCount + 100);
		} catch (error) {
			logError(error, "useAdsMetrics:handleLoadMore");
			setLoadMoreError(isAuthError$1(error) ? ERROR_MESSAGES.SIGN_IN_REQUIRED : asErrorMessage(error));
		} finally {
			setLoadingMore(false);
		}
	};
	const handleExport = () => {
		exportMetricsToCsv(processedMetrics, { providerSummaries });
	};
	const triggerRefresh = () => {
		setVisibleCount(100);
		setPersistedMetricError(null);
		setLoadMoreError(null);
		setInternalRefreshTick((tick) => tick + 1);
	};
	return {
		metrics,
		processedMetrics,
		providerSummaries,
		serverSideSummary,
		effectiveServerSummary: resolvedServerSummary,
		tableMetrics,
		adsInsightsSummary,
		hasMetricData,
		chartMetrics: processedMetrics,
		metricsLoading,
		initialMetricsLoading,
		loadingMore,
		metricError,
		loadMoreError,
		nextCursor,
		dateRange,
		setDateRange,
		handleManualRefresh,
		handleLoadMore,
		handleExport,
		triggerRefresh
	};
}
var RAW_ADS_PROVIDER_IDS = new Set([
	"google",
	"facebook",
	"linkedin",
	"tiktok"
]);
function mapConvexIntegrationStatuses(args) {
	const { rows, isPreviewMode, workspaceId, canQueryConvex } = args;
	if (isPreviewMode) return { statuses: getPreviewAdsIntegrationStatuses() };
	if (!workspaceId || !canQueryConvex) return null;
	const seenProviders = /* @__PURE__ */ new Set();
	return { statuses: rows.flatMap((row) => {
		const rawProviderId = String(row.providerId).trim().toLowerCase();
		if (!RAW_ADS_PROVIDER_IDS.has(rawProviderId)) return [];
		const providerId = normalizeAdsProviderId(String(row.providerId)) ?? rawProviderId;
		if (!RAW_ADS_PROVIDER_IDS.has(providerId) || seenProviders.has(providerId)) return [];
		seenProviders.add(providerId);
		return [{
			providerId,
			status: String(row.lastSyncStatus ?? "never"),
			message: row.lastSyncMessage ?? null,
			lastSyncedAt: typeof row.lastSyncedAtMs === "number" ? new Date(row.lastSyncedAtMs).toISOString() : null,
			lastSyncRequestedAt: typeof row.lastSyncRequestedAtMs === "number" ? new Date(row.lastSyncRequestedAtMs).toISOString() : null,
			linkedAt: typeof row.linkedAtMs === "number" ? new Date(row.linkedAtMs).toISOString() : null,
			accountId: row.accountId ?? null,
			accountName: row.accountName ?? null,
			currency: row.currency ?? null,
			autoSyncEnabled: row.autoSyncEnabled ?? null,
			syncFrequencyMinutes: row.syncFrequencyMinutes ?? null,
			scheduledTimeframeDays: row.scheduledTimeframeDays ?? null,
			metaUseAsyncInsights: row.metaUseAsyncInsights ?? null
		}];
	}) };
}
function buildIntegrationStatusMap(statuses) {
	const map = {};
	for (const status of statuses) map[status.providerId] = {
		lastSyncedAt: status.lastSyncedAt,
		lastSyncRequestedAt: status.lastSyncRequestedAt,
		status: status.status,
		accountId: status.accountId,
		accountName: status.accountName,
		currency: status.currency
	};
	return map;
}
function deriveConnectedProviders(statuses) {
	if (!statuses) return {};
	const connected = {};
	for (const status of statuses) connected[status.providerId] = Boolean(status.linkedAt) || status.status === "success";
	return connected;
}
function providerNeedsAccountSelection(status) {
	return Boolean(status?.linkedAt && !status.accountId);
}
function buildAdPlatforms() {
	return [
		{
			id: PROVIDER_IDS.GOOGLE,
			name: "Google Ads",
			description: "Import campaign performance, budgets, and ROAS insights directly from Google Ads.",
			icon: PROVIDER_ICON_MAP.google,
			mode: "oauth"
		},
		{
			id: PROVIDER_IDS.FACEBOOK,
			name: "Meta Ads Manager",
			description: "Pull spend, results, and creative breakdowns from Meta and Instagram campaigns.",
			icon: PROVIDER_ICON_MAP.facebook,
			mode: "oauth"
		},
		{
			id: PROVIDER_IDS.LINKEDIN,
			name: "LinkedIn Ads",
			description: "Sync lead-gen form results and campaign analytics from LinkedIn.",
			icon: PROVIDER_ICON_MAP.linkedin,
			mode: "oauth"
		},
		{
			id: PROVIDER_IDS.TIKTOK,
			name: "TikTok Ads",
			description: "Bring in spend, engagement, and conversion insights from TikTok campaign flights.",
			icon: PROVIDER_ICON_MAP.tiktok,
			mode: "oauth"
		}
	];
}
function useAdsConnectionActions({ workspaceId, selectedClientId, convexAuthLoading, isAuthenticated, setConnectingProvider, setConnectionErrors, setConnectedProviderOverrides, setSyncingProviders, setGoogleSetupMessage, setMetaSetupMessage, setTiktokSetupMessage, triggerRefresh }) {
	const { user, startGoogleOauth, startMetaOauth, startTikTokOauth, startLinkedInOauth } = useAuth();
	const router = useRouter$1();
	const runManualSyncAction = useAction(adsIntegrationsApi.runManualSync);
	const deleteAdIntegrationMutation = useMutation(adsIntegrationsApi.deleteAdIntegration);
	const deleteSyncJobsMutation = useMutation(adsIntegrationsApi.deleteSyncJobs);
	const deleteProviderMetricsMutation = useMutation(adsIntegrationsApi.deleteProviderMetrics);
	const handleConnect = async (providerId, action) => {
		setConnectingProvider(providerId);
		setConnectionErrors((prev) => ({
			...prev,
			[providerId]: ""
		}));
		try {
			await action();
			setConnectedProviderOverrides((prev) => ({
				...prev,
				[providerId]: true
			}));
			triggerRefresh();
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useAdsConnections:handleConnect",
				title: TOAST_TITLES.CONNECTION_FAILED,
				fallbackMessage: "Connection failed."
			});
			setConnectionErrors((prev) => ({
				...prev,
				[providerId]: convexErrorMessage(error, "Connection failed.")
			}));
			setConnectedProviderOverrides((prev) => ({
				...prev,
				[providerId]: false
			}));
		} finally {
			setConnectingProvider(null);
		}
	};
	const handleOauthRedirect = async (providerId) => {
		if (typeof window === "undefined") return;
		if (providerId === PROVIDER_IDS.GOOGLE) setGoogleSetupMessage(null);
		if (providerId === PROVIDER_IDS.FACEBOOK) setMetaSetupMessage(null);
		if (providerId === PROVIDER_IDS.TIKTOK) setTiktokSetupMessage(null);
		if (convexAuthLoading || !isAuthenticated || !user) {
			const message = ERROR_MESSAGES.SIGN_IN_REQUIRED;
			setConnectionErrors((prev) => ({
				...prev,
				[providerId]: message
			}));
			notifyFailure({
				title: TOAST_TITLES.CONNECTION_FAILED,
				message
			});
			router.push("/");
			return;
		}
		setConnectingProvider(providerId);
		setConnectionErrors((prev) => ({
			...prev,
			[providerId]: ""
		}));
		try {
			const redirectTarget = `${window.location.pathname}${window.location.search}`;
			if (providerId === PROVIDER_IDS.FACEBOOK) {
				const { url } = await startMetaOauth(redirectTarget, selectedClientId ?? null);
				if (typeof url !== "string" || url.length === 0) throw new Error("Meta OAuth did not return a URL. Check server logs and environment variables.");
				window.location.href = url;
				return;
			}
			if (providerId === PROVIDER_IDS.TIKTOK) {
				const { url } = await startTikTokOauth(redirectTarget, selectedClientId ?? null);
				window.location.href = url;
				return;
			}
			if (providerId === PROVIDER_IDS.GOOGLE) {
				const { url } = await startGoogleOauth(redirectTarget, selectedClientId ?? null);
				window.location.href = url;
				return;
			}
			if (providerId === PROVIDER_IDS.LINKEDIN) {
				const { url } = await startLinkedInOauth(redirectTarget, selectedClientId ?? null);
				window.location.href = url;
				return;
			}
			throw new Error("This provider does not support OAuth yet.");
		} catch (error) {
			const rawMessage = error instanceof Error ? error.message : "";
			const isMetaConfigError = providerId === PROVIDER_IDS.FACEBOOK && /meta business login is not configured/i.test(rawMessage);
			const isTikTokConfigError = providerId === PROVIDER_IDS.TIKTOK && /tiktok oauth is not configured/i.test(rawMessage);
			const message = isMetaConfigError || isTikTokConfigError ? rawMessage : asErrorMessage(error);
			setConnectionErrors((prev) => ({
				...prev,
				[providerId]: message
			}));
			if (providerId === PROVIDER_IDS.FACEBOOK && (isMetaConfigError || message.toLowerCase().includes("meta business login is not configured"))) setMetaSetupMessage("Meta business login is not configured. Add META_APP_ID, META_BUSINESS_CONFIG_ID, and META_OAUTH_REDIRECT_URI environment variables.");
			if (providerId === PROVIDER_IDS.TIKTOK && (isTikTokConfigError || message.toLowerCase().includes("tiktok oauth is not configured"))) setTiktokSetupMessage("TikTok OAuth is not configured. Add TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, and TIKTOK_OAUTH_REDIRECT_URI environment variables.");
			reportConvexFailure({
				error,
				context: "useAdsConnections:handleOauthRedirect",
				title: TOAST_TITLES.CONNECTION_FAILED,
				message,
				fallbackMessage: "Connection failed."
			});
		} finally {
			setConnectingProvider(null);
		}
	};
	const handleDisconnect = async (providerId, options) => {
		const providerName = formatProviderName(providerId);
		if (!workspaceId) {
			notifyFailure({
				title: TOAST_TITLES.DISCONNECT_FAILED,
				message: ERROR_MESSAGES.SIGN_IN_REQUIRED
			});
			return;
		}
		setConnectingProvider(providerId);
		setConnectionErrors((prev) => ({
			...prev,
			[providerId]: ""
		}));
		try {
			let deletedMetrics = 0;
			if (options?.clearHistoricalData) {
				const result = await deleteProviderMetricsMutation({
					workspaceId,
					providerId,
					clientId: selectedClientId ?? null
				});
				deletedMetrics = typeof result?.deleted === "number" ? result.deleted : 0;
			}
			await deleteSyncJobsMutation({
				workspaceId,
				providerId,
				clientId: selectedClientId ?? null
			});
			await deleteAdIntegrationMutation({
				workspaceId,
				providerId,
				clientId: selectedClientId ?? null
			});
			setConnectedProviderOverrides((prev) => ({
				...prev,
				[providerId]: false
			}));
			notifySuccess({
				title: TOAST_TITLES.DISCONNECTED,
				message: options?.clearHistoricalData ? `${SUCCESS_MESSAGES.DISCONNECTED(providerName)} Cleared ${deletedMetrics} historical metric row(s).` : SUCCESS_MESSAGES.DISCONNECTED(providerName)
			});
			triggerRefresh();
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useAdsConnections:handleDisconnect",
				title: TOAST_TITLES.DISCONNECT_FAILED,
				fallbackMessage: "Disconnect failed."
			});
			setConnectionErrors((prev) => ({
				...prev,
				[providerId]: convexErrorMessage(error, "Disconnect failed.")
			}));
		} finally {
			setConnectingProvider(null);
		}
	};
	const handleSyncNow = async (providerId) => {
		if (!workspaceId) {
			notifyFailure({
				title: "Sync failed",
				message: ERROR_MESSAGES.SIGN_IN_REQUIRED
			});
			return;
		}
		setSyncingProviders((prev) => ({
			...prev,
			[providerId]: true
		}));
		try {
			await runManualSyncAction({
				workspaceId,
				providerId,
				clientId: selectedClientId ?? null
			});
			notifySuccess({
				title: "Sync complete",
				message: `${formatProviderName(providerId)} data has been refreshed.`
			});
			triggerRefresh();
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useAdsConnections:handleSyncNow",
				title: "Sync failed",
				fallbackMessage: "Unable to sync ad data."
			});
		} finally {
			setSyncingProviders((prev) => ({
				...prev,
				[providerId]: false
			}));
		}
	};
	return {
		handleConnect,
		handleOauthRedirect,
		handleDisconnect,
		handleSyncNow
	};
}
function useAdsOauthCallback({ googleNeedsAccountSelection, metaNeedsAccountSelection, googleAccountOptionsLength, metaAccountOptionsLength, loadingGoogleAccountOptions, loadingMetaAccountOptions, loadGoogleAdAccounts, loadMetaAdAccounts, initializeLinkedInIntegration, initializeTikTokIntegration, setGoogleSetupUi, setGoogleSetupMessage, setMetaSetupMessage, setConnectionErrors, triggerRefresh }) {
	const { replace } = useRouter$1();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const oauthProcessedRef = (0, import_react.useRef)({});
	const processOauthRedirect = (0, import_react.useEffectEvent)(({ oauthSuccess, oauthError, providerId, message, oauthClientId }) => {
		if (oauthSuccess) {
			if (providerId === PROVIDER_IDS.FACEBOOK) {
				setMetaSetupMessage(null);
				notifySuccess({
					title: SUCCESS_MESSAGES.META_CONNECTED,
					message: "Meta connected. Select an ad account to finish setup."
				});
				loadMetaAdAccounts(oauthClientId).then(() => {
					triggerRefresh();
				}).catch((error) => {
					reportConvexFailure({
						error,
						context: "useAdsConnections:oauthSuccess:facebook",
						title: TOAST_TITLES.META_SETUP_FAILED,
						fallbackMessage: "Unable to load Meta ad accounts."
					});
					setMetaSetupMessage(convexErrorMessage(error, "Unable to load Meta ad accounts."));
				});
				return;
			}
			if (providerId === PROVIDER_IDS.TIKTOK) {
				initializeTikTokIntegration(oauthClientId);
				return;
			}
			if (providerId === PROVIDER_IDS.GOOGLE) {
				setGoogleSetupUi({
					message: null,
					dialogOpen: true
				});
				notifySuccess({
					title: SUCCESS_MESSAGES.GOOGLE_CONNECTED,
					message: "Google connected. Select an ads account to finish setup."
				});
				loadGoogleAdAccounts(oauthClientId).then(() => {
					triggerRefresh();
				}).catch((error) => {
					reportConvexFailure({
						error,
						context: "useAdsConnections:oauthSuccess:google",
						title: TOAST_TITLES.CONNECTION_FAILED,
						fallbackMessage: "Unable to load Google ad accounts."
					});
					setGoogleSetupMessage(convexErrorMessage(error, "Unable to load Google ad accounts."));
				});
				return;
			}
			if (providerId === PROVIDER_IDS.LINKEDIN) {
				initializeLinkedInIntegration().then(async () => {
					notifySuccess({
						title: SUCCESS_MESSAGES.LINKEDIN_CONNECTED,
						message: "Syncing your ad data."
					});
					triggerRefresh();
				}).catch((err) => {
					reportConvexFailure({
						error: err,
						context: "useAdsConnections:oauthSuccess:linkedin",
						title: TOAST_TITLES.CONNECTION_FAILED,
						fallbackMessage: "Unable to connect LinkedIn Ads."
					});
				});
				return;
			}
			notifySuccess({
				title: "Connection successful",
				message: `${formatProviderName(providerId)} has been linked.`
			});
			triggerRefresh();
			return;
		}
		if (oauthError) {
			const displayProvider = formatProviderName(providerId);
			const errorMessage = message || "An unknown error occurred during authentication.";
			logError(new Error(errorMessage), `useAdsConnections:oauthError:${providerId}`);
			notifyFailure({
				title: `${displayProvider} connection failed`,
				message: errorMessage
			});
			setConnectionErrors((prev) => ({
				...prev,
				[providerId]: errorMessage
			}));
		}
	});
	(0, import_react.useEffect)(() => {
		const oauthSuccess = searchParams.get("oauth_success") === "true";
		const oauthError = searchParams.get("oauth_error");
		const providerId = searchParams.get("provider");
		const message = searchParams.get("message");
		const oauthClientId = searchParams.get("clientId");
		if (!oauthSuccess && !oauthError) return;
		if (!providerId) return;
		const processingKey = `${providerId}:${oauthSuccess ? "success" : "error"}`;
		if (oauthProcessedRef.current[processingKey]) return;
		oauthProcessedRef.current[processingKey] = true;
		const cleanedParams = new URLSearchParams(searchParams.toString());
		cleanedParams.delete("oauth_success");
		cleanedParams.delete("oauth_error");
		cleanedParams.delete("provider");
		cleanedParams.delete("message");
		cleanedParams.delete("clientId");
		const nextQuery = cleanedParams.toString();
		replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
		processOauthRedirect({
			oauthSuccess,
			oauthError: Boolean(oauthError),
			providerId,
			message,
			oauthClientId
		});
	}, [
		pathname,
		processOauthRedirect,
		replace,
		searchParams
	]);
	(0, import_react.useEffect)(() => {
		if (!googleNeedsAccountSelection) return;
		if (loadingGoogleAccountOptions || googleAccountOptionsLength > 0) return;
		loadGoogleAdAccounts().catch((error) => {
			logError(error, "useAdsConnections:autoLoadGoogleAccounts");
			setGoogleSetupMessage(asErrorMessage(error));
		});
	}, [
		googleAccountOptionsLength,
		googleNeedsAccountSelection,
		loadGoogleAdAccounts,
		loadingGoogleAccountOptions,
		setGoogleSetupMessage
	]);
	(0, import_react.useEffect)(() => {
		if (!metaNeedsAccountSelection) return;
		if (loadingMetaAccountOptions || metaAccountOptionsLength > 0) return;
		loadMetaAdAccounts().catch((error) => {
			logError(error, "useAdsConnections:autoLoadMetaAccounts");
			setMetaSetupMessage(asErrorMessage(error));
		});
	}, [
		loadMetaAdAccounts,
		loadingMetaAccountOptions,
		metaAccountOptionsLength,
		metaNeedsAccountSelection,
		setMetaSetupMessage
	]);
}
function useAdsProviderSetup({ workspaceId, selectedClientId, triggerRefresh }) {
	const initializeAdAccount = useAction(adsIntegrationsApi.initializeAdAccount);
	const listGoogleAdAccounts = useAction(adsIntegrationsApi.listGoogleAdAccounts);
	const listMetaAdAccounts = useAction(adsIntegrationsApi.listMetaAdAccounts);
	const [googleSetupUi, setGoogleSetupUi] = (0, import_react.useState)({
		message: null,
		dialogOpen: false
	});
	const googleSetupMessage = googleSetupUi.message;
	const setGoogleSetupMessage = (message) => {
		setGoogleSetupUi((prev) => ({
			...prev,
			message
		}));
	};
	const setGoogleSetupDialogOpen = (dialogOpen) => {
		setGoogleSetupUi((prev) => ({
			...prev,
			dialogOpen
		}));
	};
	const [metaSetupMessage, setMetaSetupMessage] = (0, import_react.useState)(null);
	const [tiktokSetupMessage, setTiktokSetupMessage] = (0, import_react.useState)(null);
	const [initializingGoogle, setInitializingGoogle] = (0, import_react.useState)(false);
	const [initializingMeta, setInitializingMeta] = (0, import_react.useState)(false);
	const [initializingTikTok, setInitializingTikTok] = (0, import_react.useState)(false);
	const [googleAccountOptions, setGoogleAccountOptions] = (0, import_react.useState)([]);
	const [selectedGoogleAccountId, setSelectedGoogleAccountId] = (0, import_react.useState)("");
	const [loadingGoogleAccountOptions, setLoadingGoogleAccountOptions] = (0, import_react.useState)(false);
	const [metaAccountOptions, setMetaAccountOptions] = (0, import_react.useState)([]);
	const [selectedMetaAccountId, setSelectedMetaAccountId] = (0, import_react.useState)("");
	const [loadingMetaAccountOptions, setLoadingMetaAccountOptions] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setGoogleAccountOptions([]);
		setSelectedGoogleAccountId("");
		setGoogleSetupDialogOpen(false);
		setMetaAccountOptions([]);
		setSelectedMetaAccountId("");
	}, [selectedClientId]);
	const loadGoogleAdAccounts = async (clientIdOverride) => {
		if (!workspaceId) throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
		setLoadingGoogleAccountOptions(true);
		try {
			const payload = await listGoogleAdAccounts({
				workspaceId,
				providerId: "google",
				clientId: clientIdOverride ?? selectedClientId ?? null
			});
			const options = Array.isArray(payload) ? payload : [];
			setGoogleAccountOptions(options);
			setSelectedGoogleAccountId((currentValue) => {
				if (currentValue && options.some((option) => option.id === currentValue)) return currentValue;
				return (options.find((option) => !option.isManager) ?? options[0])?.id ?? "";
			});
			return options;
		} catch (error) {
			setGoogleAccountOptions([]);
			setSelectedGoogleAccountId("");
			throw error;
		} finally {
			setLoadingGoogleAccountOptions(false);
		}
	};
	const loadMetaAdAccounts = async (clientIdOverride) => {
		if (!workspaceId) throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
		setLoadingMetaAccountOptions(true);
		try {
			const payload = await listMetaAdAccounts({
				workspaceId,
				providerId: "facebook",
				clientId: clientIdOverride ?? selectedClientId ?? null
			});
			const options = Array.isArray(payload) ? payload : [];
			setMetaAccountOptions(options);
			setSelectedMetaAccountId((currentValue) => {
				if (currentValue && options.some((option) => option.id === currentValue)) return currentValue;
				return (options.find((option) => option.isActive) ?? options[0])?.id ?? "";
			});
			return options;
		} catch (error) {
			setMetaAccountOptions([]);
			setSelectedMetaAccountId("");
			throw error;
		} finally {
			setLoadingMetaAccountOptions(false);
		}
	};
	const initializeGoogleIntegration = async (clientIdOverride, accountIdOverride) => {
		setGoogleSetupMessage(null);
		setInitializingGoogle(true);
		try {
			if (!workspaceId) throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
			const accountId = (accountIdOverride ?? selectedGoogleAccountId).trim();
			if (!accountId) throw new Error("Please select a Google Ads account to finish setup.");
			const payload = await initializeAdAccount({
				workspaceId,
				providerId: "google",
				clientId: clientIdOverride ?? selectedClientId ?? null,
				accountId
			});
			notifySuccess({
				title: SUCCESS_MESSAGES.GOOGLE_CONNECTED,
				message: payload?.accountName ? `Syncing data from ${payload.accountName}.` : "Google Ads account linked successfully."
			});
			setGoogleAccountOptions([]);
			setSelectedGoogleAccountId("");
			setGoogleSetupDialogOpen(false);
			triggerRefresh();
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useAdsConnections:initializeGoogleIntegration",
				title: TOAST_TITLES.CONNECTION_FAILED,
				fallbackMessage: "Unable to connect Google Ads."
			});
			setGoogleSetupMessage(convexErrorMessage(error, "Unable to connect Google Ads."));
		} finally {
			setInitializingGoogle(false);
		}
	};
	const initializeLinkedInIntegration = async () => {
		if (!workspaceId) throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
		return await initializeAdAccount({
			workspaceId,
			providerId: "linkedin",
			clientId: selectedClientId ?? null
		});
	};
	const initializeMetaIntegration = async (clientIdOverride, accountIdOverride) => {
		setMetaSetupMessage(null);
		setInitializingMeta(true);
		try {
			if (!workspaceId) throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
			let accountId = (accountIdOverride ?? selectedMetaAccountId).trim();
			if (!accountId) {
				const availableAccounts = await loadMetaAdAccounts(clientIdOverride);
				const defaultAccount = availableAccounts.find((option) => option.isActive) ?? availableAccounts[0];
				if (!defaultAccount) throw new Error("No Meta ad accounts are available for this integration token.");
				accountId = defaultAccount.id;
				setSelectedMetaAccountId(defaultAccount.id);
			}
			const payload = await initializeAdAccount({
				workspaceId,
				providerId: "facebook",
				clientId: clientIdOverride ?? selectedClientId ?? null,
				accountId
			});
			notifySuccess({
				title: SUCCESS_MESSAGES.META_CONNECTED,
				message: payload?.accountName ? `Syncing data from ${payload.accountName}.` : "Meta ad account linked successfully."
			});
			setMetaAccountOptions([]);
			setSelectedMetaAccountId("");
			triggerRefresh();
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useAdsConnections:initializeMetaIntegration",
				title: TOAST_TITLES.META_SETUP_FAILED,
				fallbackMessage: "Unable to connect Meta Ads."
			});
			setMetaSetupMessage(convexErrorMessage(error, "Unable to connect Meta Ads."));
		} finally {
			setInitializingMeta(false);
		}
	};
	const initializeTikTokIntegration = async (clientIdOverride) => {
		setTiktokSetupMessage(null);
		setInitializingTikTok(true);
		try {
			if (!workspaceId) throw new Error(ERROR_MESSAGES.SIGN_IN_REQUIRED);
			const payload = await initializeAdAccount({
				workspaceId,
				providerId: "tiktok",
				clientId: clientIdOverride ?? selectedClientId ?? null
			});
			notifySuccess({
				title: SUCCESS_MESSAGES.TIKTOK_CONNECTED,
				message: payload?.accountName ? `Syncing data from ${payload.accountName}.` : "Default ad account linked successfully."
			});
			triggerRefresh();
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useAdsConnections:initializeTikTokIntegration",
				title: TOAST_TITLES.TIKTOK_SETUP_FAILED,
				fallbackMessage: "Unable to connect TikTok Ads."
			});
			setTiktokSetupMessage(convexErrorMessage(error, "Unable to connect TikTok Ads."));
		} finally {
			setInitializingTikTok(false);
		}
	};
	return {
		googleSetupUi,
		setGoogleSetupUi,
		googleSetupMessage,
		setGoogleSetupMessage,
		setGoogleSetupDialogOpen,
		metaSetupMessage,
		setMetaSetupMessage,
		tiktokSetupMessage,
		setTiktokSetupMessage,
		initializingGoogle,
		initializingMeta,
		initializingTikTok,
		googleAccountOptions,
		selectedGoogleAccountId,
		setSelectedGoogleAccountId,
		loadingGoogleAccountOptions,
		metaAccountOptions,
		selectedMetaAccountId,
		setSelectedMetaAccountId,
		loadingMetaAccountOptions,
		loadGoogleAdAccounts,
		loadMetaAdAccounts,
		initializeGoogleIntegration,
		initializeLinkedInIntegration,
		initializeMetaIntegration,
		initializeTikTokIntegration
	};
}
function useAdsConnections(options = {}) {
	options.onRefresh;
	const { user } = useAuth();
	const { selectedClientId } = useClientContext();
	const { isPreviewMode } = usePreview();
	const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const canQueryConvex = isAuthenticated && !convexAuthLoading && Boolean(user?.id);
	const convexStatuses = useQuery(adsIntegrationsApi.listStatuses, isPreviewMode || !workspaceId || !canQueryConvex ? "skip" : {
		workspaceId,
		clientId: selectedClientId ?? null
	});
	const connectionsQueryError = useConvexQueryError({
		data: convexStatuses,
		skipped: isPreviewMode || !workspaceId || !canQueryConvex,
		loading: convexAuthLoading,
		fallbackMessage: "Unable to load ad integration statuses."
	});
	const mappedStatuses = mapConvexIntegrationStatuses({
		rows: Array.isArray(convexStatuses) ? convexStatuses : [],
		isPreviewMode,
		workspaceId,
		canQueryConvex
	});
	const [connectingProvider, setConnectingProvider] = (0, import_react.useState)(null);
	const [connectionErrors, setConnectionErrors] = (0, import_react.useState)({});
	const [connectedProviderOverrides, setConnectedProviderOverrides] = (0, import_react.useState)({});
	const [syncingProviders, setSyncingProviders] = (0, import_react.useState)({});
	const [refreshTick, setRefreshTick] = (0, import_react.useState)(0);
	const triggerRefresh = () => {
		setRefreshTick((tick) => tick + 1);
	};
	const setup = useAdsProviderSetup({
		workspaceId,
		selectedClientId: selectedClientId ?? null,
		triggerRefresh
	});
	const automationStatuses = mappedStatuses?.statuses ?? [];
	const integrationStatusMap = buildIntegrationStatusMap(automationStatuses);
	const metaStatus = automationStatuses.find((s) => s.providerId === PROVIDER_IDS.FACEBOOK);
	const googleStatus = automationStatuses.find((s) => s.providerId === PROVIDER_IDS.GOOGLE);
	const tiktokStatus = automationStatuses.find((s) => s.providerId === PROVIDER_IDS.TIKTOK);
	const metaNeedsAccountSelection = providerNeedsAccountSelection(metaStatus);
	const googleNeedsAccountSelection = providerNeedsAccountSelection(googleStatus);
	const tiktokNeedsAccountSelection = providerNeedsAccountSelection(tiktokStatus);
	const googleSetupDialogOpen = setup.googleSetupUi.dialogOpen || googleNeedsAccountSelection;
	const connectedProviders = {
		...deriveConnectedProviders(mappedStatuses?.statuses),
		...connectedProviderOverrides
	};
	const adPlatforms = buildAdPlatforms();
	useAdsOauthCallback({
		googleNeedsAccountSelection,
		metaNeedsAccountSelection,
		googleAccountOptionsLength: setup.googleAccountOptions.length,
		metaAccountOptionsLength: setup.metaAccountOptions.length,
		loadingGoogleAccountOptions: setup.loadingGoogleAccountOptions,
		loadingMetaAccountOptions: setup.loadingMetaAccountOptions,
		loadGoogleAdAccounts: setup.loadGoogleAdAccounts,
		loadMetaAdAccounts: setup.loadMetaAdAccounts,
		initializeLinkedInIntegration: setup.initializeLinkedInIntegration,
		initializeTikTokIntegration: setup.initializeTikTokIntegration,
		setGoogleSetupUi: setup.setGoogleSetupUi,
		setGoogleSetupMessage: setup.setGoogleSetupMessage,
		setMetaSetupMessage: setup.setMetaSetupMessage,
		setConnectionErrors,
		triggerRefresh
	});
	const actions = useAdsConnectionActions({
		workspaceId,
		selectedClientId: selectedClientId ?? null,
		convexAuthLoading,
		isAuthenticated,
		setConnectingProvider,
		setConnectionErrors,
		setConnectedProviderOverrides,
		setSyncingProviders,
		setGoogleSetupMessage: setup.setGoogleSetupMessage,
		setMetaSetupMessage: setup.setMetaSetupMessage,
		setTiktokSetupMessage: setup.setTiktokSetupMessage,
		triggerRefresh
	});
	return {
		connectedProviders,
		connectingProvider,
		connectionErrors,
		integrationStatuses: mappedStatuses,
		connectionsQueryError,
		integrationStatusMap,
		automationStatuses,
		syncingProviders,
		googleSetupMessage: setup.googleSetupMessage,
		metaSetupMessage: setup.metaSetupMessage,
		tiktokSetupMessage: setup.tiktokSetupMessage,
		initializingGoogle: setup.initializingGoogle,
		initializingMeta: setup.initializingMeta,
		initializingTikTok: setup.initializingTikTok,
		googleNeedsAccountSelection,
		metaNeedsAccountSelection,
		tiktokNeedsAccountSelection,
		googleAccountOptions: setup.googleAccountOptions,
		selectedGoogleAccountId: setup.selectedGoogleAccountId,
		setSelectedGoogleAccountId: setup.setSelectedGoogleAccountId,
		loadingGoogleAccountOptions: setup.loadingGoogleAccountOptions,
		googleSetupDialogOpen,
		setGoogleSetupDialogOpen: setup.setGoogleSetupDialogOpen,
		metaAccountOptions: setup.metaAccountOptions,
		selectedMetaAccountId: setup.selectedMetaAccountId,
		setSelectedMetaAccountId: setup.setSelectedMetaAccountId,
		loadingMetaAccountOptions: setup.loadingMetaAccountOptions,
		handleConnect: actions.handleConnect,
		handleDisconnect: actions.handleDisconnect,
		handleOauthRedirect: actions.handleOauthRedirect,
		handleSyncNow: actions.handleSyncNow,
		initializeGoogleIntegration: setup.initializeGoogleIntegration,
		initializeMetaIntegration: setup.initializeMetaIntegration,
		initializeTikTokIntegration: setup.initializeTikTokIntegration,
		reloadGoogleAccountOptions: setup.loadGoogleAdAccounts,
		reloadMetaAccountOptions: setup.loadMetaAdAccounts,
		adPlatforms,
		triggerRefresh,
		refreshTick
	};
}
function safeDiv$1(numerator, denominator) {
	if (denominator === 0 || !isFinite(denominator)) return null;
	const result = numerator / denominator;
	return isFinite(result) ? result : null;
}
function calculateTotals(metrics) {
	return metrics.reduce((acc, m) => ({
		spend: acc.spend + m.spend,
		impressions: acc.impressions + m.impressions,
		clicks: acc.clicks + m.clicks,
		conversions: acc.conversions + m.conversions,
		revenue: acc.revenue + (m.revenue ?? 0),
		days: acc.days + 1
	}), {
		spend: 0,
		impressions: 0,
		clicks: 0,
		conversions: 0,
		revenue: 0,
		days: 0
	});
}
function calculateMovingAverage(metrics, days) {
	const subset = metrics.toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, days);
	if (subset.length === 0) return {
		spend: null,
		impressions: null,
		clicks: null,
		conversions: null,
		revenue: null,
		ctr: null,
		cpc: null,
		roas: null
	};
	const totals = calculateTotals(subset);
	const count = subset.length;
	return {
		spend: totals.spend / count,
		impressions: totals.impressions / count,
		clicks: totals.clicks / count,
		conversions: totals.conversions / count,
		revenue: totals.revenue / count,
		ctr: safeDiv$1(totals.clicks, totals.impressions),
		cpc: safeDiv$1(totals.spend, totals.clicks),
		roas: safeDiv$1(totals.revenue, totals.spend)
	};
}
function calculateGrowthRate(current, previous) {
	return {
		spend: safeDiv$1(current.spend - previous.spend, previous.spend),
		impressions: safeDiv$1(current.impressions - previous.impressions, previous.impressions),
		clicks: safeDiv$1(current.clicks - previous.clicks, previous.clicks),
		conversions: safeDiv$1(current.conversions - previous.conversions, previous.conversions),
		revenue: safeDiv$1(current.revenue - previous.revenue, previous.revenue)
	};
}
function splitMetricsByPeriod(metrics, daysPerPeriod) {
	const sorted = metrics.toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	return {
		current: sorted.slice(0, daysPerPeriod),
		previous: sorted.slice(daysPerPeriod, daysPerPeriod * 2)
	};
}
function calculateKPIs(totals) {
	return {
		cpa: safeDiv$1(totals.spend, totals.conversions),
		roas: safeDiv$1(totals.revenue, totals.spend),
		ctr: safeDiv$1(totals.clicks, totals.impressions),
		cpc: safeDiv$1(totals.spend, totals.clicks),
		cpm: safeDiv$1(totals.spend * 1e3, totals.impressions),
		conversionRate: safeDiv$1(totals.conversions, totals.clicks),
		revenuePerClick: safeDiv$1(totals.revenue, totals.clicks),
		profit: totals.revenue - totals.spend,
		profitMargin: safeDiv$1(totals.revenue - totals.spend, totals.revenue)
	};
}
/**
* Hook for real-time derived metric calculations
* Uses memoization for performance with expensive calculations
*/
function useDerivedMetrics(options) {
	const { metrics, providerId } = options;
	const filteredMetrics = (() => {
		if (!providerId) return metrics;
		return metrics.filter((m) => m.providerId === providerId);
	})();
	const totals = calculateTotals(filteredMetrics);
	return {
		movingAverage7Day: calculateMovingAverage(filteredMetrics, 7),
		movingAverage30Day: calculateMovingAverage(filteredMetrics, 30),
		growthWeekOverWeek: (() => {
			const { current, previous } = splitMetricsByPeriod(filteredMetrics, 7);
			if (previous.length === 0) return {
				spend: null,
				impressions: null,
				clicks: null,
				conversions: null,
				revenue: null
			};
			return calculateGrowthRate(calculateTotals(current), calculateTotals(previous));
		})(),
		growthMonthOverMonth: (() => {
			const { current, previous } = splitMetricsByPeriod(filteredMetrics, 30);
			if (previous.length === 0) return {
				spend: null,
				impressions: null,
				clicks: null,
				conversions: null,
				revenue: null
			};
			return calculateGrowthRate(calculateTotals(current), calculateTotals(previous));
		})(),
		kpis: calculateKPIs(totals),
		totals
	};
}
function safeDiv(numerator, denominator) {
	if (denominator === 0 || !isFinite(denominator)) return null;
	const result = numerator / denominator;
	return isFinite(result) ? result : null;
}
function calculateDelta(current, previous) {
	return current - previous;
}
function calculateDeltaPercent(current, previous) {
	if (previous === 0) return null;
	return (current - previous) / previous * 100;
}
function filterMetricsByDateRange(metrics, range) {
	return metrics.filter((m) => {
		const date = parseMetricDate(m.date);
		return date !== null && date >= range.start && date <= range.end;
	});
}
function aggregateMetrics(metrics) {
	const totals = metrics.reduce((acc, m) => ({
		spend: acc.spend + m.spend,
		impressions: acc.impressions + m.impressions,
		clicks: acc.clicks + m.clicks,
		conversions: acc.conversions + m.conversions,
		revenue: acc.revenue + (m.revenue ?? 0)
	}), {
		spend: 0,
		impressions: 0,
		clicks: 0,
		conversions: 0,
		revenue: 0
	});
	return {
		...totals,
		ctr: safeDiv(totals.clicks, totals.impressions),
		cpc: safeDiv(totals.spend, totals.clicks),
		roas: safeDiv(totals.revenue, totals.spend),
		cpa: safeDiv(totals.spend, totals.conversions)
	};
}
function calculateMetricsDelta(current, previous) {
	return {
		spend: calculateDelta(current.spend, previous.spend),
		impressions: calculateDelta(current.impressions, previous.impressions),
		clicks: calculateDelta(current.clicks, previous.clicks),
		conversions: calculateDelta(current.conversions, previous.conversions),
		revenue: calculateDelta(current.revenue, previous.revenue),
		ctr: current.ctr !== null && previous.ctr !== null ? calculateDelta(current.ctr, previous.ctr) : null,
		cpc: current.cpc !== null && previous.cpc !== null ? calculateDelta(current.cpc, previous.cpc) : null,
		roas: current.roas !== null && previous.roas !== null ? calculateDelta(current.roas, previous.roas) : null,
		cpa: current.cpa !== null && previous.cpa !== null ? calculateDelta(current.cpa, previous.cpa) : null
	};
}
function calculateMetricsDeltaPercent(current, previous) {
	return {
		spend: calculateDeltaPercent(current.spend, previous.spend),
		impressions: calculateDeltaPercent(current.impressions, previous.impressions),
		clicks: calculateDeltaPercent(current.clicks, previous.clicks),
		conversions: calculateDeltaPercent(current.conversions, previous.conversions),
		revenue: calculateDeltaPercent(current.revenue, previous.revenue),
		ctr: current.ctr !== null && previous.ctr !== null ? calculateDeltaPercent(current.ctr, previous.ctr) : null,
		cpc: current.cpc !== null && previous.cpc !== null ? calculateDeltaPercent(current.cpc, previous.cpc) : null,
		roas: current.roas !== null && previous.roas !== null ? calculateDeltaPercent(current.roas, previous.roas) : null,
		cpa: current.cpa !== null && previous.cpa !== null ? calculateDeltaPercent(current.cpa, previous.cpa) : null
	};
}
function getPreviousDateRange(range) {
	const duration = range.end.getTime() - range.start.getTime();
	return {
		start: /* @__PURE__ */ new Date(range.start.getTime() - duration - 864e5),
		end: /* @__PURE__ */ new Date(range.start.getTime() - 864e5)
	};
}
/**
* Hook for comparing metrics across periods and providers
*/
function useMetricsComparison(options) {
	const { metrics, dateRange } = options;
	const periodComparison = (() => {
		const currentMetrics = filterMetricsByDateRange(metrics, dateRange);
		const previousMetrics = filterMetricsByDateRange(metrics, getPreviousDateRange(dateRange));
		if (currentMetrics.length === 0) return null;
		const current = aggregateMetrics(currentMetrics);
		const previous = aggregateMetrics(previousMetrics);
		return {
			current,
			previous,
			delta: calculateMetricsDelta(current, previous),
			deltaPercent: calculateMetricsDeltaPercent(current, previous)
		};
	})();
	const providerComparison = (() => {
		const currentMetrics = filterMetricsByDateRange(metrics, dateRange);
		const byProvider = /* @__PURE__ */ new Map();
		currentMetrics.forEach((m) => {
			const existing = byProvider.get(m.providerId) ?? [];
			existing.push(m);
			byProvider.set(m.providerId, existing);
		});
		return Array.from(byProvider.entries()).map(([providerId, provMetrics]) => ({
			providerId,
			metrics: aggregateMetrics(provMetrics)
		}));
	})();
	const getProviderMetrics = (providerId) => {
		return providerComparison.find((p) => p.providerId === providerId)?.metrics ?? null;
	};
	const compareDateRanges = (range1, range2) => {
		const metrics1 = filterMetricsByDateRange(metrics, range1);
		const metrics2 = filterMetricsByDateRange(metrics, range2);
		if (metrics1.length === 0 && metrics2.length === 0) return null;
		const agg1 = aggregateMetrics(metrics1);
		const agg2 = aggregateMetrics(metrics2);
		return {
			range1: agg1,
			range2: agg2,
			delta: calculateMetricsDelta(agg1, agg2),
			deltaPercent: calculateMetricsDeltaPercent(agg1, agg2)
		};
	};
	const compareProviders = (provider1, provider2) => {
		const m1 = providerComparison.find((p) => p.providerId === provider1)?.metrics;
		const m2 = providerComparison.find((p) => p.providerId === provider2)?.metrics;
		if (!m1 || !m2) return null;
		return {
			provider1: m1,
			provider2: m2,
			delta: calculateMetricsDelta(m1, m2)
		};
	};
	return {
		periodComparison,
		providerComparison,
		getProviderMetrics,
		compareDateRanges,
		compareProviders
	};
}
function convertToDataPoints(metrics) {
	return metrics.map((m) => ({
		date: m.date,
		providerId: normalizeProviderId(m.providerId),
		accountId: m.accountId,
		spend: m.spend,
		revenue: m.revenue ?? 0,
		clicks: m.clicks,
		conversions: m.conversions,
		impressions: m.impressions
	}));
}
/**
* Hook for calculating algorithmic insights from ad metrics
* Uses the modular ad-algorithms library to generate comprehensive performance analysis
*/
function useAlgorithmicInsights(options) {
	const { metrics, providerSummaries, loading } = options;
	const metricsForAnalysis = (() => {
		if (metrics.length > 0) return metrics;
		return providerSummariesToSyntheticMetrics(providerSummaries);
	})();
	const analysis = (() => {
		if (loading || metricsForAnalysis.length === 0) return null;
		return analyzeAdPerformance(convertToDataPoints(metricsForAnalysis));
	})();
	const insights = analysis?.insights || [];
	return {
		analysis,
		insights,
		providerInsights: (() => {
			if (!analysis) return {};
			const grouped = {};
			for (const insight of insights) {
				const providers = insight.relatedProviders || ["global"];
				for (const provider of providers) {
					if (!grouped[provider]) grouped[provider] = [];
					grouped[provider].push(insight);
				}
			}
			return grouped;
		})(),
		budgetSuggestions: insights.filter((i) => i.type === "budget"),
		globalEfficiencyScore: analysis?.globalEfficiencyScore || 0,
		providerEfficiencyScores: analysis?.providerEfficiencyScores || {},
		hasCriticalInsights: insights.some((i) => i.level === "critical"),
		hasWarningInsights: insights.some((i) => i.level === "warning"),
		insightCounts: (() => {
			const counts = {
				success: 0,
				warning: 0,
				info: 0,
				critical: 0
			};
			for (const insight of insights) if (insight.level in counts) counts[insight.level]++;
			return counts;
		})()
	};
}
function isAuthError(error) {
	const code = extractErrorCode(error);
	return code === "UNAUTHORIZED" || code === "FORBIDDEN";
}
function AdsPage() {
	const { isPreviewMode } = usePreview();
	const shownErrorsRef = (0, import_react.useRef)(null);
	if (shownErrorsRef.current === null) shownErrorsRef.current = /* @__PURE__ */ new Set();
	const connections = useAdsConnections();
	const metrics = useAdsMetrics({ refreshTick: connections.refreshTick });
	const derivedMetrics = useDerivedMetrics({ metrics: metrics.processedMetrics });
	const formulaEditor = useFormulaEditor({ isPreviewMode });
	const comparison = useMetricsComparison({
		metrics: metrics.processedMetrics,
		dateRange: metrics.dateRange
	});
	const algorithmicInsights = useAlgorithmicInsights({
		metrics: metrics.processedMetrics,
		providerSummaries: metrics.providerSummaries,
		loading: metrics.metricsLoading
	});
	const { displayCurrency, providerCurrencyMap } = (() => {
		const financialTotals = metrics.adsInsightsSummary?.financialTotals;
		const summaryCurrency = financialTotals?.comparability === "single_currency" ? financialTotals.primaryCurrency ?? null : null;
		const summaryMap = {};
		if (metrics.adsInsightsSummary?.providers) for (const p of metrics.adsInsightsSummary.providers) {
			const providerId = normalizeAdsProviderId(p.providerId) ?? p.providerId;
			const providerFinancial = p.financialTotals;
			if (providerFinancial.comparability === "single_currency" && providerFinancial.primaryCurrency) summaryMap[providerId] = providerFinancial.primaryCurrency;
		}
		const metricsMap = buildProviderCurrencyMapFromMetrics(metrics.processedMetrics);
		const metricsCurrency = resolveCurrencyFromProcessedMetrics(metrics.processedMetrics);
		return {
			displayCurrency: summaryCurrency ?? metricsCurrency,
			providerCurrencyMap: {
				...metricsMap,
				...summaryMap
			}
		};
	})();
	const hasAnyAdIntegration = !isPreviewMode && Boolean(connections.integrationStatuses?.statuses?.some((s) => s.status === "success" || Boolean(s.linkedAt)));
	const suppressMetricsErrors = !isPreviewMode && !hasAnyAdIntegration && !isAuthError(metrics.metricError) && !isAuthError(metrics.loadMoreError);
	const connectedAccountCount = connections.adPlatforms.filter((p) => connections.connectedProviders[p.id]).length;
	const connectedProviderIds = (() => {
		const fromPlatforms = connections.adPlatforms.flatMap((p) => connections.connectedProviders[p.id] ? [p.id] : []);
		const fromStatuses = Object.entries(connections.connectedProviders).flatMap(([providerId, connected]) => connected ? [providerId] : []);
		return [...new Set([...fromPlatforms, ...fromStatuses])];
	})();
	const pendingSetupCount = [
		connections.googleNeedsAccountSelection,
		connections.metaNeedsAccountSelection,
		connections.tiktokNeedsAccountSelection
	].filter(Boolean).length;
	const hasPendingSetup = pendingSetupCount > 0;
	const hasSuccessfulSync = connections.automationStatuses.some((s) => s.status === "success");
	const handleInitializeMeta = () => {
		connections.initializeMetaIntegration(void 0, connections.selectedMetaAccountId || null);
	};
	const handleInitializeTikTok = () => {
		connections.initializeTikTokIntegration();
	};
	const handleLoadMoreMetrics = () => {
		metrics.handleLoadMore();
	};
	const openGoogleCampaignSetup = () => {
		connections.setGoogleSetupDialogOpen(true);
		if (connections.loadingGoogleAccountOptions || connections.googleAccountOptions.length > 0) return;
		connections.reloadGoogleAccountOptions();
	};
	const handleReloadGoogleAccounts = () => {
		connections.reloadGoogleAccountOptions();
	};
	const handleInitializeGoogle = () => {
		connections.initializeGoogleIntegration(void 0, connections.selectedGoogleAccountId || null);
	};
	const activeCurrency = displayCurrency ?? void 0;
	const showWorkflow = !isPreviewMode && (!connections.integrationStatuses || connections.automationStatuses.length === 0 || connections.automationStatuses.every((s) => s.status !== "success"));
	const setupSection = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsPageSetupSection, {
		flags: {
			isPreviewMode,
			showWorkflow,
			hasSuccessfulSync,
			hasPendingSetup
		},
		connectedAccountCount,
		connections,
		metrics,
		dateRange: metrics.dateRange,
		openGoogleCampaignSetup,
		handleInitializeMeta,
		handleInitializeTikTok
	});
	const analyticsSection = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsPageAnalyticsSection, {
		metrics,
		algorithmicInsights,
		activeCurrency,
		connectedProviderIds,
		connectedAccountCount,
		hasSuccessfulSync,
		suppressMetricsErrors,
		dateRange: metrics.dateRange,
		providerCurrencyMap
	});
	const advancedAnalyticsSection = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsPageAdvancedAnalyticsSection, {
		metrics,
		derivedMetrics,
		formulaEditor,
		comparison,
		activeCurrency,
		suppressMetricsErrors,
		handleLoadMoreMetrics,
		providerCurrencyMap,
		automationStatuses: connections.automationStatuses,
		connectedAccountCount,
		showWorkflow
	});
	(0, import_react.useEffect)(() => {
		[...suppressMetricsErrors ? [] : [metrics.metricError ?? "", metrics.loadMoreError ?? ""], ...Object.values(connections.connectionErrors ?? {})].filter(Boolean).forEach((error) => {
			if (shownErrorsRef.current.has(error)) return;
			reportConvexFailure({
				error,
				context: "AdsPage:Effect"
			});
			shownErrorsRef.current.add(error);
		});
	}, [
		connections.connectionErrors,
		metrics.loadMoreError,
		metrics.metricError,
		suppressMetricsErrors
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionShell, {
		reveal: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageSkeletonBoundary, {
			loading: metrics.initialMetricsLoading && !connections.integrationStatuses,
			loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsSkeleton, {}),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: DASHBOARD_THEME.layout.container,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6 pb-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsPageHeader, {
							dateRange: metrics.dateRange,
							onDateRangeChange: metrics.setDateRange,
							onRefresh: metrics.handleManualRefresh,
							onExport: metrics.handleExport,
							refreshing: metrics.metricsLoading,
							canExport: metrics.hasMetricData,
							connectedCount: connectedAccountCount,
							totalProviders: connections.adPlatforms.length,
							pendingSetupCount
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorAlert, {
							error: connections.connectionsQueryError,
							title: "Unable to load ad connections"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsPageLayout, {
							setup: setupSection,
							analytics: analyticsSection,
							advancedAnalytics: advancedAnalyticsSection,
							showSetup: !isPreviewMode,
							connectedAccountCount,
							hasPendingSetup
						})
					]
				})
			}), !isPreviewMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleSetupDialog, {
				open: connections.googleSetupDialogOpen,
				onOpenChange: connections.setGoogleSetupDialogOpen,
				setupMessage: connections.googleSetupMessage,
				accountOptions: connections.googleAccountOptions,
				selectedAccountId: connections.selectedGoogleAccountId,
				onAccountSelectionChange: connections.setSelectedGoogleAccountId,
				loadingAccounts: connections.loadingGoogleAccountOptions,
				initializing: connections.initializingGoogle,
				onReloadAccounts: handleReloadGoogleAccounts,
				onInitialize: handleInitializeGoogle
			}) : null]
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsPage, {});
//#endregion
export { SplitComponent as component };
