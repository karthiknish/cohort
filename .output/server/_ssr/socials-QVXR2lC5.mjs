import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, l as useMutation, r as useConvexAuth, s as useAction, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { J as getPreviewSocialOverview, q as getPreviewSocialConnectionStatus } from "./preview-data-CXkRNfsX.mjs";
import { c as cn, i as EN_US_DATETIME_MEDIUM_FORMATTER } from "./utils-hh4sibN0.mjs";
import { V as startOfDay, a as subDays, k as endOfDay } from "../_libs/date-fns.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { s as logError, t as asErrorMessage } from "./convex-errors-sHK0JmZ7.mjs";
import { a as notifyInfo, c as reportConvexFailure, i as notifyFailure, o as notifySuccess } from "./notifications-DQZKskhM.mjs";
import { i as useSearchParams, n as usePathname, r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { G as socialMetricsApi, K as socialsIntegrationsApi } from "./convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { B as Shield, Bt as MessageSquareMore, Er as CalendarRange, F as Sparkles, Hr as ArrowRightLeft, In as Eye, Jr as Activity, K as Settings2, Rn as ExternalLink, W as Share2, Yt as LoaderCircle, _ as Unplug, ar as CircleDashed, b as TriangleAlert, br as ChartLine, cr as CircleAlert, d as UsersRound, ln as Instagram, nt as Repeat2, or as CircleCheck, p as UserPlus, rt as RefreshCw, tr as Circle, u as Users, ut as PlugZap, x as TrendingUp } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { n as FadeInItem, r as FadeInStagger, t as FadeIn } from "./animate-in-JYv0iBIt.mjs";
import { a as TabsTrigger, i as TabsList, n as Tabs, r as TabsContent } from "./tabs-BP_mm-cH.mjs";
import { r as createSvglBrandIcon, t as SvglBrandLogo } from "./svgl-brand-logo-rIFZzPiw.mjs";
import { i as getButtonClasses, n as PAGE_TITLES, r as getBadgeClasses, t as DASHBOARD_THEME } from "./dashboard-theme-DM5oBGdY.mjs";
import { r as useConvexQueryError, t as mergeQueryErrors } from "./use-convex-query-error-P2IX7lhG.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./alert-DYeH1Q3p.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { t as DateRangePicker } from "./date-range-picker-D_4D5yhU.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as PageMotionShell } from "./page-motion-shell-Ci2leIYf.mjs";
import { t as DashboardPageHero } from "./dashboard-page-hero-BIWBoJtP.mjs";
import { t as EmptyState } from "./empty-state-sOehX0F0.mjs";
import { t as usePersistedTab } from "./use-persisted-tab-DQyLv5Zj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/socials-QVXR2lC5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SocialsHeader({ selectedClientName, dateRange, onDateRangeChange, metricsReady = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardPageHero, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn(DASHBOARD_THEME.icons.container, "bg-info/10 text-info border-info/25"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {
					className: "size-6",
					"aria-hidden": true
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80",
							children: "Organic social"
						}), metricsReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							className: cn(getBadgeClasses("success"), "gap-1 normal-case tracking-normal"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
								className: "size-3",
								"aria-hidden": true
							}), "Metrics live"]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-balance text-3xl tracking-tight text-foreground md:text-4xl",
						children: PAGE_TITLES.socials?.title ?? "Socials"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-[15px]",
						children: PAGE_TITLES.socials?.description ?? "Organic reach and engagement from Meta Pages and Instagram — separate from paid ads."
					})
				]
			})]
		}), selectedClientName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			className: getBadgeClasses("primary"),
			children: ["Workspace · ", selectedClientName]
		}) : null]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			className: cn("w-fit", getBadgeClasses("secondary"), "hidden sm:inline-flex"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarRange, {
				className: "mr-1.5 size-3.5",
				"aria-hidden": true
			}), "Compare periods"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateRangePicker, {
			value: dateRange,
			onChange: onDateRangeChange
		})]
	})] }) });
}
var SETUP_STEPS = [
	{
		id: "connect",
		label: "Connect Meta"
	},
	{
		id: "page",
		label: "Pick a Page"
	},
	{
		id: "sync",
		label: "Sync metrics"
	}
];
function formatLastSync(ms) {
	if (!ms) return "No sync yet";
	return EN_US_DATETIME_MEDIUM_FORMATTER.format(new Date(ms));
}
function ConnectionStatusBadge({ connected, setupComplete, syncPending, lastSyncStatus }) {
	if (!connected) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		className: getBadgeClasses("secondary"),
		children: "Not connected"
	});
	if (syncPending || lastSyncStatus === "pending") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		className: getBadgeClasses("primary"),
		children: "Syncing…"
	});
	if (!setupComplete) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		className: getBadgeClasses("warning"),
		children: "Page setup required"
	});
	if (lastSyncStatus === "error") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		className: getBadgeClasses("destructive"),
		children: "Sync failed"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		className: getBadgeClasses("success"),
		children: "Connected"
	});
}
function SetupStepper({ connected, setupComplete, hasSynced }) {
	const activeIndex = !connected ? 0 : !setupComplete ? 1 : hasSynced ? 2 : 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "flex flex-wrap items-center gap-2 sm:gap-3",
		"aria-label": "Organic social setup steps",
		children: SETUP_STEPS.map((step, index) => {
			const complete = index < activeIndex || index === 2 && hasSynced;
			const current = index === activeIndex && !complete;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-2 sm:gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("flex size-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors", complete && "border-success/30 bg-success/10 text-success", current && "border-primary/30 bg-primary/10 text-primary", !complete && !current && "border-muted/60 bg-muted/30 text-muted-foreground"),
						"aria-hidden": true,
						children: complete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "size-2 fill-current" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("text-xs font-medium sm:text-sm", complete || current ? "text-foreground" : "text-muted-foreground"),
						children: step.label
					})]
				}), index < SETUP_STEPS.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden h-px w-6 bg-border sm:block",
					"aria-hidden": true
				}) : null]
			}, step.id);
		})
	});
}
function SocialsConnectionPanel({ panelId, selectedClientName, connected, setupComplete, accountName, lastSyncedAtMs, lastSyncStatus, oauthPending, syncPending, connectionError, onConnectMeta, onDisconnect, onRequestSync }) {
	const handleConnectMeta = () => {
		onConnectMeta();
	};
	const handleDisconnect = () => {
		onDisconnect();
	};
	const hasSynced = Boolean(lastSyncedAtMs);
	const syncLabel = (() => {
		if (syncPending || lastSyncStatus === "pending") return "Sync in progress…";
		return formatLastSync(lastSyncedAtMs);
	})();
	const canSync = connected && setupComplete && !oauthPending && !syncPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		id: panelId,
		className: "space-y-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: cn("overflow-hidden border-muted/50 shadow-sm ring-1 ring-muted/20", DASHBOARD_THEME.cards.base),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-5 p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex shrink-0 flex-col gap-1.5 rounded-2xl border border-muted/40 bg-linear-to-br from-info/5 via-background to-accent/5 p-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn(DASHBOARD_THEME.icons.container, "size-11 bg-info/10 text-info border-info/20"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
										brand: "facebook",
										className: "size-5",
										labeled: false
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn(DASHBOARD_THEME.icons.container, "size-11 bg-accent/10 text-accent border-accent/20"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
										brand: "instagram",
										className: "size-5",
										labeled: false
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-lg font-semibold tracking-tight text-foreground",
										children: "Organic social (Meta)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionStatusBadge, {
										connected,
										setupComplete,
										syncPending,
										lastSyncStatus
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground",
									children: [
										"Pull organic reach and engagement from Facebook Pages and linked Instagram profiles. This is separate from",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
											href: "/dashboard/ads",
											className: "font-medium text-primary underline-offset-4 hover:underline",
											children: "Meta Ads"
										}),
										" ",
										"in Ad Manager."
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							onClick: handleConnectMeta,
							disabled: oauthPending,
							className: cn(getButtonClasses("primary"), "w-full shrink-0 gap-2 shadow-sm lg:w-auto lg:min-w-[220px]"),
							children: [oauthPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "size-4 animate-spin",
								"aria-hidden": true
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
								className: "size-4",
								"aria-hidden": true
							}), connected ? "Reconnect with Meta" : "Connect with Meta"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupStepper, {
						connected,
						setupComplete,
						hasSynced
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							selectedClientName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: cn(DASHBOARD_THEME.badges.base, "font-normal"),
								children: ["Workspace · ", selectedClientName]
							}) : null,
							accountName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: cn(DASHBOARD_THEME.badges.base, "font-normal"),
								children: ["Authorized · ", accountName]
							}) : null,
							connected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: cn(DASHBOARD_THEME.badges.base, "font-normal tabular-nums"),
								children: syncLabel
							}) : null
						]
					}),
					connectionError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "alert",
						className: "flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							className: "mt-0.5 size-4 shrink-0",
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: connectionError })]
					}) : null,
					connected && !setupComplete ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2 rounded-xl border border-warning/20 bg-warning/5 px-3 py-2.5 text-sm text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							className: "mt-0.5 size-4 shrink-0 text-warning",
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Meta is connected. Choose a Facebook Page below to finish setup and unlock sync plus the Facebook and Instagram tabs." })]
					}) : null,
					connected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 border-t border-muted/40 pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "outline",
								size: "sm",
								onClick: onRequestSync,
								disabled: !canSync,
								className: getButtonClasses("outline"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
									className: cn("mr-2 size-4", syncPending && "animate-spin"),
									"aria-hidden": true
								}), "Sync now"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "outline",
								size: "sm",
								onClick: handleDisconnect,
								disabled: oauthPending,
								className: cn(getButtonClasses("outline"), "text-destructive hover:bg-destructive/5 hover:text-destructive"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unplug, {
									className: "mr-2 size-4",
									"aria-hidden": true
								}), "Disconnect"]
							}),
							!setupComplete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "w-full text-xs text-muted-foreground sm:w-auto sm:ml-auto",
								children: "Confirm a Page before syncing."
							}) : null
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "border-t border-muted/40 pt-4 text-xs text-muted-foreground",
						children: "Connect with Meta to authorize Pages and start syncing organic metrics."
					})
				]
			})
		})
	});
}
function getSurfaceStatusLabel(status, count) {
	if (status === "ready") return `${count} ready`;
	if (status === "loading") return "Loading…";
	if (status === "source_required") return "Source needed";
	if (status === "error") return "Retry needed";
	if (status === "disconnected") return "Not connected";
	return "Waiting";
}
function getSurfaceStatusVariant(status) {
	if (status === "ready") return "secondary";
	if (status === "loading") return "info";
	return "outline";
}
function SocialsMetaSetupCard(props) {
	const { setupState, selectedSourceLabel, sourceSelectionRequired, loadingSources, facebookStatus, instagramStatus, facebookCount, instagramCount, onReloadSources, onRetryDiscovery } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-muted/40 bg-muted/[0.03] p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: setupState.stage === "ready" ? "secondary" : setupState.stage === "discovering" ? "info" : "outline",
							className: DASHBOARD_THEME.badges.base,
							children: setupState.stage.replaceAll("_", " ")
						}), selectedSourceLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: DASHBOARD_THEME.badges.base,
							children: ["Source: ", selectedSourceLabel]
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-semibold text-foreground",
						children: setupState.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: setupState.description
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: onReloadSources,
						disabled: loadingSources,
						children: [loadingSources ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 size-4" }), "Reload sources"]
					}), !sourceSelectionRequired ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: onRetryDiscovery,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 size-4" }), "Retry discovery"]
					}) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-muted/50 bg-background p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: DASHBOARD_THEME.stats.label,
							children: "Meta source"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-center gap-2 text-sm text-foreground",
							children: [sourceSelectionRequired ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 text-warning" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: sourceSelectionRequired ? "Selection still required" : selectedSourceLabel ?? "Source selected" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-muted/50 bg-background p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: DASHBOARD_THEME.stats.label,
								children: "Facebook Pages"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: getSurfaceStatusVariant(facebookStatus),
								className: DASHBOARD_THEME.badges.base,
								children: getSurfaceStatusLabel(facebookStatus, facebookCount)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-foreground",
							children: facebookCount > 0 ? `${facebookCount} Pages discovered from the selected Meta source.` : sourceSelectionRequired ? "Choose a source before Pages can load." : "Pages have not surfaced yet from this source."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-muted/50 bg-background p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: DASHBOARD_THEME.stats.label,
								children: "Instagram Profiles"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: getSurfaceStatusVariant(instagramStatus),
								className: DASHBOARD_THEME.badges.base,
								children: getSurfaceStatusLabel(instagramStatus, instagramCount)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-foreground",
							children: instagramCount > 0 ? `${instagramCount} business profile${instagramCount === 1 ? "" : "s"} discovered from the selected Meta source.` : sourceSelectionRequired ? "Choose a source before Instagram can load." : "Instagram profiles have not surfaced yet from this source."
						})]
					})
				]
			}),
			setupState.switchSourceRecommended && setupState.switchSourceMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 rounded-2xl border border-warning/20 bg-warning/5 px-4 py-3 text-sm text-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "mt-0.5 size-4 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: "This may be the wrong Meta source for this workspace."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground",
							children: setupState.switchSourceMessage
						})]
					})]
				})
			}) : null
		]
	});
}
function SocialsPagePicker({ pages, selectedPageId, loading, confirming, error, setupComplete, instagramBusinessName, onSelectPage, onConfirm, onReload }) {
	const selected = pages.find((p) => p.id === selectedPageId);
	const linkedIg = selected?.instagramBusinessName ?? instagramBusinessName;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-dashed border-info/25 bg-info/[0.03] p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-sm font-semibold tracking-tight text-foreground",
						children: "Facebook Page"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-xl text-sm leading-relaxed text-muted-foreground",
						children: setupComplete ? `Reporting from ${selected?.name ?? "your selected Page"}. Switch below if this workspace should track a different Page.` : "Choose the Page for this workspace. When Meta links a business Instagram account, it appears on the Instagram tab automatically."
					})]
				}), linkedIg ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
						brand: "instagram",
						className: "size-4 shrink-0",
						labeled: false
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Linked IG · ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-medium",
						children: ["@", linkedIg]
					})] })]
				}) : null]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
				variant: "destructive",
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Could not load Pages" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: error })]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: selectedPageId,
					onValueChange: onSelectPage,
					disabled: loading || pages.length === 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: cn(DASHBOARD_THEME.inputs.base, "w-full sm:max-w-md"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: loading ? "Loading Pages…" : "Choose a Facebook Page" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: pages.map((page) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
						value: page.id,
						children: [page.name, page.instagramBusinessName ? ` · @${page.instagramBusinessName}` : ""]
					}, page.id)) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						onClick: onConfirm,
						disabled: confirming || !selectedPageId || loading,
						children: [confirming ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "mr-2 size-4 animate-spin",
							"aria-hidden": true
						}) : null, setupComplete ? "Update Page" : "Confirm Page"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: onReload,
						disabled: loading,
						children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "mr-2 size-4 animate-spin",
							"aria-hidden": true
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
							className: "mr-2 size-4",
							"aria-hidden": true
						}), "Reload Pages"]
					})]
				})]
			})
		]
	});
}
var KPI_ICONS = {
	reach: Eye,
	impressions: TrendingUp,
	engaged_users: Users,
	follower_growth: UserPlus
};
var KPI_ACCENT = {
	reach: "border-l-[3px] border-l-info bg-linear-to-br from-info/10 via-info/[0.02] to-background",
	impressions: "border-l-[3px] border-l-primary bg-linear-to-br from-primary/8 via-primary/[0.02] to-background",
	engaged_users: "border-l-[3px] border-l-success bg-linear-to-br from-success/8 via-success/[0.02] to-background",
	follower_growth: "border-l-[3px] border-l-accent bg-linear-to-br from-accent/10 via-accent/[0.02] to-background"
};
function SocialsKpiGrid({ items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInStagger, {
		as: "div",
		className: DASHBOARD_THEME.stats.container,
		children: items.map((item) => {
			const Icon = KPI_ICONS[item.id] ?? TrendingUp;
			const accent = KPI_ACCENT[item.id] ?? "border-l-[3px] border-l-muted-foreground/35 bg-linear-to-br from-muted/15 to-background";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: cn(DASHBOARD_THEME.stats.card, "overflow-hidden border-muted/50 shadow-sm transition-[box-shadow,border-color,transform] hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-md motion-reduce:hover:translate-y-0", accent),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "relative p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1 space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: DASHBOARD_THEME.stats.label,
								children: item.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-3xl font-bold tabular-nums tracking-tight text-foreground md:text-4xl",
								children: item.value
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn(DASHBOARD_THEME.icons.container, "size-11 shrink-0 shadow-sm"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								"aria-hidden": true
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-relaxed text-muted-foreground md:text-sm",
						children: item.detail
					})]
				})
			}) }, item.id);
		})
	});
}
var FacebookBrandIcon = createSvglBrandIcon("facebook");
var InstagramBrandIcon = createSvglBrandIcon("instagram");
var SURFACE_COPY = {
	facebook: {
		title: "Facebook",
		icon: FacebookBrandIcon,
		summaryTitle: "Facebook organic performance",
		summaryDescription: "Organic reach, engagement, and follower growth for Facebook Pages in this workspace.",
		emptyMessage: "Connect Meta and select a Facebook Page to sync organic metrics.",
		emptyCtaLabel: "Set up connection",
		setupMessage: "Select a Facebook Page in the connection card above.",
		noDataMessage: "Page is configured but no metrics yet. Run a sync to pull organic insights.",
		noDataCtaLabel: "Sync now"
	},
	instagram: {
		title: "Instagram",
		icon: InstagramBrandIcon,
		summaryTitle: "Instagram organic performance",
		summaryDescription: "Organic reach, engagement, and follower growth for Instagram business profiles in this workspace.",
		emptyMessage: "Connect Meta and link an Instagram business account to this Page in Meta.",
		emptyCtaLabel: "Set up connection",
		setupMessage: "Select a Facebook Page with a linked Instagram business account.",
		noIgMessage: "This Page has no linked Instagram business account. Metrics stay empty until you link one in Meta Business settings.",
		noDataMessage: "Instagram is configured but no metrics yet. Run a sync to pull organic insights.",
		noDataCtaLabel: "Sync now"
	}
};
function formatCompactNumber(value) {
	if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
	if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
	return value.toLocaleString();
}
function formatRate$1(value) {
	return `${value.toFixed(value >= 10 ? 1 : 2)}%`;
}
function formatSignedNumber(value) {
	if (value === 0) return "0";
	return `${value > 0 ? "+" : "-"}${formatCompactNumber(Math.abs(value))}`;
}
function SocialMetricBars({ metrics, labelledBy }) {
	const maxValue = Math.max(...metrics.map((metric) => metric.value), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "list-none space-y-5",
		"aria-labelledby": labelledBy,
		children: metrics.map((metric) => {
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "list-none space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-foreground",
							children: metric.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs leading-snug text-muted-foreground",
							children: metric.detail
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "shrink-0 text-sm font-bold tabular-nums text-foreground",
						children: metric.valueLabel
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("progress", {
					className: cn("h-3 w-full overflow-hidden rounded-full bg-muted/50 ring-1 ring-muted/30 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted/50 [&::-webkit-progress-value]:rounded-full", metric.colorClass),
					value: metric.value,
					max: maxValue > 0 ? maxValue : 100,
					"aria-label": `${metric.label}: ${metric.valueLabel}`
				})]
			}, metric.label);
		})
	});
}
function SocialInsightCards({ insights }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4 lg:grid-cols-3",
		children: insights.map((insight) => {
			const Icon = insight.icon;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: cn("overflow-hidden border-muted/50 bg-linear-to-b from-muted/20 to-background shadow-sm transition-shadow hover:shadow-md", DASHBOARD_THEME.cards.base),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: DASHBOARD_THEME.stats.label,
								children: insight.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-2xl font-bold tabular-nums tracking-tight text-foreground",
								children: insight.value
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn(DASHBOARD_THEME.icons.container, "size-10 shrink-0"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								"aria-hidden": true
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-relaxed text-muted-foreground md:text-sm",
						children: insight.detail
					})]
				})
			}, insight.title);
		})
	});
}
function SocialSurfacePanel({ surface, kpis, overview, overviewLoading, connected, setupComplete, hasInstagramBinding = true, hasData, onRequestSync }) {
	const copy = SURFACE_COPY[surface];
	const SurfaceIcon = copy.icon;
	const handleScrollToConnections = () => {
		document.getElementById("social-connections-panel")?.scrollIntoView({ behavior: "smooth" });
	};
	const showMetrics = connected && setupComplete && hasData && (surface !== "instagram" || hasInstagramBinding);
	const emptyState = (() => {
		if (!connected) return {
			title: `${copy.title} not connected`,
			description: copy.emptyMessage,
			action: {
				label: copy.emptyCtaLabel,
				onClick: handleScrollToConnections
			}
		};
		if (!setupComplete) return {
			title: "Finish setup",
			description: copy.setupMessage,
			action: {
				label: "Go to setup",
				onClick: handleScrollToConnections
			}
		};
		if (surface === "instagram" && !hasInstagramBinding) return {
			title: "No linked Instagram",
			description: SURFACE_COPY.instagram.noIgMessage,
			action: {
				label: "Link in Meta Business",
				onClick: () => {
					window.open("https://www.facebook.com/business/help/898752960195806", "_blank", "noopener,noreferrer");
				},
				icon: ExternalLink
			}
		};
		if (!hasData) return {
			title: "No organic data yet",
			description: copy.noDataMessage,
			action: {
				label: copy.noDataCtaLabel,
				onClick: onRequestSync
			}
		};
		return null;
	})();
	const performanceGraph = (() => {
		if (!overview) return [];
		return [
			{
				label: "Reach",
				value: overview.reach,
				valueLabel: formatCompactNumber(overview.reach),
				detail: "Unique people reached in the selected range",
				colorClass: "bg-primary"
			},
			{
				label: "Impressions",
				value: overview.impressions,
				valueLabel: formatCompactNumber(overview.impressions),
				detail: "Total content views delivered across the range",
				colorClass: "bg-info"
			},
			{
				label: "Engaged users",
				value: overview.engagedUsers,
				valueLabel: formatCompactNumber(overview.engagedUsers),
				detail: "People who reacted, commented, shared, or saved content",
				colorClass: "bg-success"
			}
		];
	})();
	const interactionGraph = (() => {
		if (!overview) return [];
		return [
			{
				label: "Reactions",
				value: overview.reactions,
				valueLabel: formatCompactNumber(overview.reactions),
				detail: "Lightweight approval and sentiment actions",
				colorClass: "bg-primary"
			},
			{
				label: "Comments",
				value: overview.comments,
				valueLabel: formatCompactNumber(overview.comments),
				detail: "Direct responses that signal conversation depth",
				colorClass: "bg-info"
			},
			{
				label: "Shares",
				value: overview.shares,
				valueLabel: formatCompactNumber(overview.shares),
				detail: "Content amplification from your audience",
				colorClass: "bg-accent"
			},
			...overview.saves > 0 ? [{
				label: "Saves",
				value: overview.saves,
				valueLabel: formatCompactNumber(overview.saves),
				detail: "Intent signals from people bookmarking posts",
				colorClass: "bg-warning"
			}] : []
		];
	})();
	const insightCards = (() => {
		if (!overview) return [];
		const engagementRate = overview.reach > 0 ? overview.engagedUsers / overview.reach * 100 : 0;
		const impressionFrequency = overview.reach > 0 ? overview.impressions / overview.reach : 0;
		const conversationActions = overview.comments + overview.shares + overview.saves;
		const conversationRate = overview.engagedUsers > 0 ? conversationActions / overview.engagedUsers * 100 : 0;
		return [
			{
				title: "Engagement rate",
				value: formatRate$1(engagementRate),
				detail: `${formatCompactNumber(overview.engagedUsers)} engaged users from ${formatCompactNumber(overview.reach)} reached accounts.`,
				icon: Activity
			},
			{
				title: "Repeat visibility",
				value: `${impressionFrequency.toFixed(2)}x`,
				detail: `${formatCompactNumber(overview.impressions)} impressions across ${overview.rowCount} synced days.`,
				icon: Repeat2
			},
			{
				title: "Community momentum",
				value: formatSignedNumber(overview.followerDeltaTotal),
				detail: overview.followerCountLatest !== null ? `${formatCompactNumber(overview.followerCountLatest)} total followers. ${formatRate$1(conversationRate)} of engaged users moved into comments, shares, or saves.` : `${formatRate$1(conversationRate)} of engaged users moved into comments, shares, or saves.`,
				icon: UsersRound
			}
		];
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: cn("overflow-hidden ring-1 ring-muted/20", DASHBOARD_THEME.cards.base),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: cn(DASHBOARD_THEME.cards.header, "bg-muted/[0.02]"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn(DASHBOARD_THEME.icons.container, "size-12 shadow-sm", surface === "facebook" ? "bg-info/10 text-info border-info/25" : "bg-accent/10 text-accent border-accent/25"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SurfaceIcon, {
								className: "size-6",
								"aria-hidden": true
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-w-2xl space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-balance text-xl md:text-2xl",
								children: copy.summaryTitle
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-pretty text-sm leading-relaxed md:text-[15px]",
								children: copy.summaryDescription
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: cn(DASHBOARD_THEME.badges.base, "w-fit shrink-0"),
						children: overviewLoading ? "Loading…" : connected ? "Organic data" : "Not connected"
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "p-6",
				children: overviewLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: DASHBOARD_THEME.stats.container,
					children: [
						0,
						1,
						2,
						3
					].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full rounded-2xl" }, slot))
				}) : showMetrics ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialsKpiGrid, { items: kpis }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 xl:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: cn("overflow-hidden border-muted/50 shadow-sm", DASHBOARD_THEME.cards.base),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "pb-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										id: `${surface}-audience-title`,
										className: "text-base",
										children: "Audience footprint"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
										className: "text-xs leading-relaxed sm:text-sm",
										children: "Relative mix of reach, impressions, and engaged users for the selected date range."
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
									className: "p-5 pt-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialMetricBars, {
										metrics: performanceGraph,
										labelledBy: `${surface}-audience-title`
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: cn("overflow-hidden border-muted/50 shadow-sm", DASHBOARD_THEME.cards.base),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "pb-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										id: `${surface}-interaction-title`,
										className: "text-base",
										children: "Interaction mix"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
										className: "text-xs leading-relaxed sm:text-sm",
										children: "Reactions, comments, shares, and saves, scaled so you can compare channel behavior at a glance."
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
									className: "p-5 pt-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialMetricBars, {
										metrics: interactionGraph,
										labelledBy: `${surface}-interaction-title`
									})
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 border-b border-muted/30 pb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareMore, {
									className: "size-4 text-primary",
									"aria-hidden": true
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-xs uppercase tracking-widest text-muted-foreground",
									children: "Derived signals"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialInsightCards, { insights: insightCards })]
						})
					]
				}) : emptyState ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: emptyState.title,
					description: emptyState.description,
					action: emptyState.action,
					variant: "card",
					className: "rounded-2xl"
				}) : null
			})]
		})
	});
}
function getSurfaceTabBadge(status) {
	switch (status) {
		case "ready": return {
			label: "Live",
			className: getBadgeClasses("success"),
			icon: CircleCheck
		};
		case "loading": return {
			label: "Loading",
			className: getBadgeClasses("primary"),
			icon: LoaderCircle
		};
		case "source_required": return {
			label: "Setup",
			className: getBadgeClasses("warning"),
			icon: CircleDashed
		};
		case "empty": return {
			label: "No IG link",
			className: getBadgeClasses("secondary"),
			icon: Instagram
		};
		case "error": return {
			label: "Error",
			className: getBadgeClasses("destructive"),
			icon: CircleAlert
		};
		case "disconnected": return {
			label: "Offline",
			className: getBadgeClasses("secondary"),
			icon: PlugZap
		};
		default: return {
			label: "Pending",
			className: getBadgeClasses("secondary"),
			icon: CircleDashed
		};
	}
}
function SurfaceTabStatusBadge({ status }) {
	const { label, className, icon: Icon } = getSurfaceTabBadge(status);
	const spinning = status === "loading";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: "outline",
		className: cn("ml-2 gap-1 border-0 px-2 py-0 text-[10px] font-semibold normal-case tracking-normal", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: cn("size-3", spinning && "animate-spin"),
			"aria-hidden": true
		}), label]
	});
}
function SocialsPageLayout({ showSetup, setupComplete, connected, setup, performance }) {
	const [mobileTab, setMobileTab] = (0, import_react.useState)(connected && setupComplete ? "performance" : "setup");
	const setupSection = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialsSetupSection, { children: setup });
	const performanceSection = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialsPerformanceSection, { children: performance });
	if (!showSetup) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: performanceSection
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
		value: mobileTab,
		onValueChange: setMobileTab,
		className: "w-full lg:hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
				className: "grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-muted/40 p-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
					value: "performance",
					className: "gap-1.5 rounded-lg text-xs sm:text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLine, {
						className: "size-3.5 shrink-0",
						"aria-hidden": true
					}), "Performance"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
					value: "setup",
					className: "gap-1.5 rounded-lg text-xs sm:text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
						className: "size-3.5 shrink-0",
						"aria-hidden": true
					}), "Connection"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "performance",
				className: "mt-5 space-y-6 focus-visible:outline-none",
				children: performanceSection
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "setup",
				className: "mt-5 focus-visible:outline-none",
				children: setupSection
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hidden space-y-10 lg:block",
		children: [setupSection, performanceSection]
	})] });
}
function SocialsSetupSection({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Meta connection and page setup",
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-1 border-b border-muted/40 pb-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80",
					children: "Workspace setup"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold tracking-tight text-foreground",
					children: "Connect & configure Meta"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
					children: "Authorize organic Pages and Instagram profiles. This path is separate from paid ads in Ad Manager."
				})
			]
		}), children]
	});
}
function SocialsPerformanceSection({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Organic social performance",
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-1 border-b border-muted/40 pb-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80",
					children: "Organic metrics"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold tracking-tight text-foreground",
					children: "Facebook & Instagram"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
					children: "Compare reach, engagement, and follower signals across surfaces for the selected date range."
				})
			]
		}), children]
	});
}
function SocialsSurfaceTabsList({ facebookStatus, instagramStatus }) {
	const tabClass = cn(DASHBOARD_THEME.tabs.trigger, "gap-2 px-4");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
		className: cn(DASHBOARD_THEME.tabs.list, "h-auto w-full justify-start gap-1 rounded-xl p-1 sm:w-auto"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
			value: "facebook",
			className: tabClass,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
					brand: "facebook",
					className: "size-4 shrink-0",
					labeled: false
				}),
				"Facebook",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SurfaceTabStatusBadge, { status: facebookStatus })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
			value: "instagram",
			className: tabClass,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
					brand: "instagram",
					className: "size-4 shrink-0",
					labeled: false
				}),
				"Instagram",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SurfaceTabStatusBadge, { status: instagramStatus })
			]
		})]
	});
}
var KPI_SLOTS = [
	"reach",
	"impressions",
	"engaged",
	"followers"
];
function SocialsPageLoadingFallback() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-10",
		"aria-busy": true,
		"aria-label": "Loading socials",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full rounded-2xl" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-64 rounded-xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: DASHBOARD_THEME.stats.container,
					children: KPI_SLOTS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full rounded-2xl" }, id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 xl:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-56 w-full rounded-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-56 w-full rounded-2xl" })]
				})
			]
		})]
	});
}
function useSocialsConnections() {
	const { user, startMetaOauth } = useAuth();
	const router = useRouter$1();
	const { replace } = router;
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { selectedClientId } = useClientContext();
	const { isPreviewMode } = usePreview();
	const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
	const requestManualSync = useMutation(socialsIntegrationsApi.requestManualSync);
	const disconnectIntegration = useMutation(socialsIntegrationsApi.disconnectIntegration);
	const [oauthPending, setOauthPending] = (0, import_react.useState)(false);
	const [connectionError, setConnectionError] = (0, import_react.useState)(null);
	const [syncPending, setSyncPending] = (0, import_react.useState)(false);
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const canQuery = !isPreviewMode && isAuthenticated && !convexAuthLoading && Boolean(workspaceId);
	const rawStatus = useQuery(socialsIntegrationsApi.getStatus, canQuery && workspaceId ? {
		workspaceId,
		clientId: selectedClientId ?? null
	} : "skip");
	const statusQueryError = useConvexQueryError({
		data: rawStatus,
		skipped: !canQuery,
		fallbackMessage: "Unable to load social connection status."
	});
	const statusLoading = canQuery && rawStatus === void 0;
	const status = isPreviewMode ? {
		...getPreviewSocialConnectionStatus(),
		facebookPageId: "preview-page",
		facebookPageName: "Preview Page",
		instagramBusinessId: "preview-ig",
		instagramBusinessName: "preview_brand",
		setupComplete: true
	} : rawStatus ? {
		connected: rawStatus.connected,
		accountId: rawStatus.accountId,
		accountName: rawStatus.accountName,
		facebookPageId: rawStatus.facebookPageId ?? null,
		facebookPageName: rawStatus.facebookPageName ?? null,
		instagramBusinessId: rawStatus.instagramBusinessId ?? null,
		instagramBusinessName: rawStatus.instagramBusinessName ?? null,
		setupComplete: rawStatus.setupComplete ?? Boolean(rawStatus.facebookPageId),
		lastSyncStatus: rawStatus.lastSyncStatus,
		lastSyncedAtMs: rawStatus.lastSyncedAtMs,
		linkedAtMs: rawStatus.linkedAtMs
	} : null;
	(0, import_react.useEffect)(() => {
		setSyncPending(status?.lastSyncStatus === "pending");
	}, [status?.lastSyncStatus]);
	const oauthProcessedRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (isPreviewMode) return;
		const oauthSuccess = searchParams.get("oauth_success") === "true";
		const oauthError = searchParams.get("oauth_error");
		const message = searchParams.get("message");
		if (!oauthSuccess && !oauthError) return;
		if (oauthProcessedRef.current) return;
		oauthProcessedRef.current = true;
		const cleanedParams = new URLSearchParams(searchParams.toString());
		cleanedParams.delete("oauth_success");
		cleanedParams.delete("oauth_error");
		cleanedParams.delete("provider");
		cleanedParams.delete("message");
		cleanedParams.delete("clientId");
		cleanedParams.delete("surface");
		const nextQuery = cleanedParams.toString();
		replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
		if (oauthSuccess) {
			notifySuccess({
				title: "Meta connected",
				message: "Select a Facebook Page to finish organic social setup."
			});
			setConnectionError(null);
		} else if (oauthError) {
			const errorMessage = message ?? "Meta authorization failed";
			setConnectionError(errorMessage);
			notifyFailure({
				title: "Connection failed",
				message: errorMessage
			});
		}
	}, [
		isPreviewMode,
		pathname,
		replace,
		searchParams
	]);
	const showPreviewModeToast = (description) => {
		notifyInfo({
			title: "Preview mode",
			message: description
		});
	};
	const handleConnectMeta = async () => {
		if (typeof window === "undefined") return;
		if (isPreviewMode) {
			showPreviewModeToast("Meta connection is disabled while sample social data is active.");
			return;
		}
		if (convexAuthLoading || !isAuthenticated || !user) {
			notifyFailure({
				title: "Sign in required",
				message: "You must be signed in to connect Meta."
			});
			router.push("/");
			return;
		}
		setOauthPending(true);
		setConnectionError(null);
		try {
			const { url } = await startMetaOauth(`${window.location.pathname}${window.location.search}`, selectedClientId ?? null, void 0, "socials");
			if (typeof url !== "string" || url.length === 0) throw new Error("Meta OAuth did not return a URL.");
			window.location.href = url;
		} catch (error) {
			logError(error, "useSocialsConnections:handleConnectMeta");
			const message = asErrorMessage(error);
			setConnectionError(message);
			notifyFailure({
				title: "Connection failed",
				message
			});
			setOauthPending(false);
		}
	};
	const handleDisconnect = async () => {
		if (isPreviewMode) {
			showPreviewModeToast("Social disconnection is disabled while sample social data is active.");
			return;
		}
		if (!workspaceId) return;
		try {
			await disconnectIntegration({
				workspaceId,
				clientId: selectedClientId ?? null
			});
			notifySuccess({
				title: "Disconnected",
				message: "Organic Meta social connection removed (Ads unchanged)."
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useSocialsConnections:handleDisconnect",
				title: "Disconnect failed",
				fallbackMessage: "Unable to disconnect Meta social integration."
			});
		}
	};
	const handleRequestSync = async () => {
		if (isPreviewMode) {
			showPreviewModeToast("Social sync is disabled while sample social data is active.");
			return;
		}
		if (!workspaceId) return;
		if (!status?.setupComplete) {
			notifyFailure({
				title: "Setup required",
				message: "Select a Facebook Page before syncing organic metrics."
			});
			return;
		}
		setSyncPending(true);
		try {
			await requestManualSync({
				workspaceId,
				clientId: selectedClientId ?? null,
				timeframeDays: 30
			});
			notifySuccess({
				title: "Sync requested",
				message: "Organic metrics will refresh shortly."
			});
		} catch (error) {
			setSyncPending(false);
			reportConvexFailure({
				error,
				context: "useSocialsConnections:handleRequestSync",
				title: "Sync failed",
				fallbackMessage: "Unable to start social sync."
			});
		}
	};
	return {
		status,
		statusLoading,
		statusQueryError,
		oauthPending,
		syncPending,
		connectionError,
		handleConnectMeta,
		handleDisconnect,
		handleRequestSync
	};
}
function useSocialsSetup(status) {
	const { user } = useAuth();
	const { selectedClientId } = useClientContext();
	const { isPreviewMode } = usePreview();
	const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
	const discoverPages = useAction(socialsIntegrationsApi.discoverPages);
	const confirmSurfaceBinding = useMutation(socialsIntegrationsApi.confirmSurfaceBinding);
	const [pages, setPages] = (0, import_react.useState)([]);
	const [pagesLoading, setPagesLoading] = (0, import_react.useState)(false);
	const [pagesError, setPagesError] = (0, import_react.useState)(null);
	const [selectedPageId, setSelectedPageId] = (0, import_react.useState)("");
	const [confirmingPage, setConfirmingPage] = (0, import_react.useState)(false);
	const loadPagesRequestIdRef = (0, import_react.useRef)(0);
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const canAct = !isPreviewMode && isAuthenticated && !convexAuthLoading && Boolean(workspaceId);
	const loadPages = (0, import_react.useEffectEvent)(async () => {
		if (!canAct || !workspaceId) return;
		const requestId = ++loadPagesRequestIdRef.current;
		setPagesLoading(true);
		setPagesError(null);
		try {
			const result = await discoverPages({
				workspaceId,
				clientId: selectedClientId ?? null
			});
			if (requestId !== loadPagesRequestIdRef.current) return;
			const options = result ?? [];
			setPages(options);
			if (status?.facebookPageId) setSelectedPageId(status.facebookPageId);
			else if (!selectedPageId && options.length === 1) {
				const only = options[0];
				if (only) setSelectedPageId(only.id);
			}
		} catch (error) {
			if (requestId !== loadPagesRequestIdRef.current) return;
			logError(error, "useSocialsSetup:loadPages");
			setPagesError(asErrorMessage(error));
			setPages([]);
		} finally {
			if (requestId === loadPagesRequestIdRef.current) setPagesLoading(false);
		}
	});
	const isConnected = Boolean(status?.connected);
	const [prevConnected, setPrevConnected] = (0, import_react.useState)(isConnected);
	if (isConnected !== prevConnected) {
		setPrevConnected(isConnected);
		if (!isConnected) {
			setPages([]);
			setSelectedPageId("");
		}
	}
	(0, import_react.useEffect)(() => {
		if (!isConnected) return;
		loadPages();
	}, [
		isConnected,
		selectedClientId,
		status?.facebookPageId,
		workspaceId
	]);
	const confirmSelectedPage = async () => {
		if (!canAct || !workspaceId || !selectedPageId) return;
		const page = pages.find((p) => p.id === selectedPageId);
		if (!page) return;
		setConfirmingPage(true);
		try {
			await confirmSurfaceBinding({
				workspaceId,
				clientId: selectedClientId ?? null,
				facebookPageId: page.id,
				facebookPageName: page.name,
				instagramBusinessId: page.instagramBusinessId,
				instagramBusinessName: page.instagramBusinessName
			});
		} catch (error) {
			logError(error, "useSocialsSetup:confirmSelectedPage");
			setPagesError(asErrorMessage(error));
			reportConvexFailure({
				error,
				context: "useSocialsSetup:confirmSelectedPage",
				title: "Page confirmation failed",
				fallbackMessage: "Unable to confirm the selected Facebook Page."
			});
		} finally {
			setConfirmingPage(false);
		}
	};
	const facebookCount = pages.length;
	const instagramCount = pages.filter((p) => p.instagramBusinessId).length;
	const setupComplete = Boolean(status?.facebookPageId);
	const hasInstagramBinding = Boolean(status?.instagramBusinessId);
	const facebookStatus = (() => {
		if (!status?.connected) return "disconnected";
		if (pagesLoading) return "loading";
		if (pagesError) return "error";
		if (!setupComplete) return "source_required";
		return "ready";
	})();
	const instagramStatus = (() => {
		if (!status?.connected) return "disconnected";
		if (!setupComplete) return "source_required";
		if (!hasInstagramBinding) return "empty";
		if (pagesLoading) return "loading";
		if (pagesError) return "error";
		return "ready";
	})();
	return {
		setupState: (() => {
			if (!status?.connected) return {
				stage: "disconnected",
				title: "Connect organic social (Meta)",
				description: "One Meta login covers Facebook Pages and linked Instagram business profiles — not Ad Manager.",
				switchSourceRecommended: false,
				switchSourceMessage: null
			};
			if (!setupComplete) return {
				stage: "source_selection",
				title: "Select a Facebook Page",
				description: "Choose the Page for this workspace. Linked Instagram loads automatically when available.",
				switchSourceRecommended: false,
				switchSourceMessage: null
			};
			if (pagesError) return {
				stage: "recovery",
				title: "Setup needs attention",
				description: pagesError,
				switchSourceRecommended: false,
				switchSourceMessage: null
			};
			if (!hasInstagramBinding) return {
				stage: "partial",
				title: "Facebook ready · Instagram pending",
				description: "This Page has no linked Instagram business account. Instagram metrics stay empty until you link one in Meta.",
				switchSourceRecommended: false,
				switchSourceMessage: null
			};
			return {
				stage: "ready",
				title: "Organic surfaces configured",
				description: "Facebook Page and Instagram business profile are bound. Run sync to refresh KPIs.",
				switchSourceRecommended: false,
				switchSourceMessage: null
			};
		})(),
		pages,
		pagesLoading,
		pagesError,
		selectedPageId,
		setSelectedPageId,
		confirmingPage,
		facebookStatus,
		instagramStatus,
		facebookCount,
		instagramCount,
		selectedPageLabel: pages.find((p) => p.id === selectedPageId)?.name ?? status?.facebookPageName ?? null,
		loadPages,
		confirmSelectedPage
	};
}
function defaultDateRange() {
	const now = /* @__PURE__ */ new Date();
	return {
		start: startOfDay(subDays(now, 29)),
		end: endOfDay(now)
	};
}
function useSocialsMetrics() {
	const { user } = useAuth();
	const { selectedClientId } = useClientContext();
	const { isPreviewMode } = usePreview();
	const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
	const [dateRange, setDateRange] = (0, import_react.useState)(defaultDateRange);
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const canQuery = !isPreviewMode && isAuthenticated && !convexAuthLoading && Boolean(workspaceId);
	const startDate = dateRange.start.toISOString().split("T")[0] ?? "";
	const endDate = dateRange.end.toISOString().split("T")[0] ?? "";
	const baseArgs = canQuery && workspaceId ? {
		workspaceId,
		clientId: selectedClientId ?? null,
		startDate,
		endDate
	} : "skip";
	const facebookRaw = useQuery(socialMetricsApi.listOverview, baseArgs === "skip" ? "skip" : {
		...baseArgs,
		surface: "facebook"
	});
	const instagramRaw = useQuery(socialMetricsApi.listOverview, baseArgs === "skip" ? "skip" : {
		...baseArgs,
		surface: "instagram"
	});
	const overviewError = mergeQueryErrors(useConvexQueryError({
		data: facebookRaw,
		skipped: !canQuery,
		fallbackMessage: "Unable to load Facebook metrics."
	}), useConvexQueryError({
		data: instagramRaw,
		skipped: !canQuery,
		fallbackMessage: "Unable to load Instagram metrics."
	}));
	const overviewLoading = canQuery && (facebookRaw === void 0 || instagramRaw === void 0);
	return {
		dateRange,
		setDateRange,
		facebookOverview: isPreviewMode ? getPreviewSocialOverview("facebook") : facebookRaw ? { ...facebookRaw } : null,
		instagramOverview: isPreviewMode ? getPreviewSocialOverview("instagram") : instagramRaw ? { ...instagramRaw } : null,
		overviewLoading,
		overviewError
	};
}
function formatNumber(value) {
	if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
	if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
	return value.toLocaleString();
}
function formatRate(value) {
	return `${value.toFixed(value >= 10 ? 1 : 2)}%`;
}
function useSocialInsights(overview) {
	return { kpis: (() => {
		const reach = overview?.reach ?? 0;
		const impressions = overview?.impressions ?? 0;
		const engagedUsers = overview?.engagedUsers ?? 0;
		const followerDelta = overview?.followerDeltaTotal ?? 0;
		const followerCount = overview?.followerCountLatest ?? null;
		const engagementRate = reach > 0 ? engagedUsers / reach * 100 : 0;
		const reachValue = formatNumber(reach);
		const impressionsValue = formatNumber(impressions);
		const followerDeltaDisplay = followerDelta >= 0 ? `+${formatNumber(followerDelta)}` : `-${formatNumber(Math.abs(followerDelta))}`;
		const followerDetail = followerCount !== null ? `${formatNumber(followerCount)} total followers this period` : followerDelta !== 0 ? `Net follower change this period` : "Connect and sync to track follower growth";
		return [
			{
				id: "reach",
				label: "Reach",
				value: reachValue,
				detail: reach > 0 ? `${impressionsValue} total impressions this period` : "Sync data to see reach metrics"
			},
			{
				id: "impressions",
				label: "Impressions",
				value: impressionsValue,
				detail: reach > 0 ? `Avg ${(impressions / Math.max(reach, 1)).toFixed(1)}x per person reached` : "Sync data to see impression metrics"
			},
			{
				id: "engaged_users",
				label: "Engaged Users",
				value: formatNumber(engagedUsers),
				detail: reach > 0 ? `${formatRate(engagementRate)} engagement rate` : "Sync data to see engagement metrics"
			},
			{
				id: "follower_growth",
				label: "Follower Growth",
				value: followerDelta !== 0 ? followerDeltaDisplay : "—",
				detail: followerDetail
			}
		];
	})() };
}
function useSocialsPageController() {
	const { selectedClient } = useClientContext();
	const connections = useSocialsConnections();
	const setup = useSocialsSetup(connections.status);
	const metrics = useSocialsMetrics();
	const { kpis: facebookKpis } = useSocialInsights(metrics.facebookOverview);
	const { kpis: instagramKpis } = useSocialInsights(metrics.instagramOverview);
	return {
		selectedClient,
		connections,
		setup,
		metrics,
		facebookKpis,
		instagramKpis,
		dateRange: metrics.dateRange,
		setDateRange: metrics.setDateRange
	};
}
function SocialsPage() {
	const { isPreviewMode } = usePreview();
	const { selectedClient, connections, setup, metrics, facebookKpis, instagramKpis, dateRange, setDateRange } = useSocialsPageController();
	const surfaceTab = usePersistedTab({
		defaultValue: "facebook",
		allowedValues: ["facebook", "instagram"],
		param: "surface",
		storageNamespace: "dashboard:socials",
		syncToUrl: true
	});
	const connected = connections.status?.connected ?? false;
	const setupComplete = connections.status?.setupComplete ?? false;
	const initialLoading = connections.statusLoading;
	const handleRequestSync = () => {
		connections.handleRequestSync();
	};
	const handleConfirmPage = () => {
		setup.confirmSelectedPage();
	};
	const handleReloadSources = () => {
		setup.loadPages();
	};
	const handleSurfaceChange = (value) => {
		if (value === "facebook" || value === "instagram") surfaceTab.setValue(value);
	};
	const facebookHasData = (metrics.facebookOverview?.rowCount ?? 0) > 0;
	const instagramHasData = (metrics.instagramOverview?.rowCount ?? 0) > 0;
	const setupSection = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialsConnectionPanel, {
			panelId: "social-connections-panel",
			selectedClientName: selectedClient?.name ?? null,
			connected,
			setupComplete,
			accountName: connections.status?.facebookPageName ?? connections.status?.accountName,
			lastSyncedAtMs: connections.status?.lastSyncedAtMs,
			lastSyncStatus: connections.status?.lastSyncStatus,
			oauthPending: connections.oauthPending,
			syncPending: connections.syncPending,
			connectionError: connections.connectionError,
			onConnectMeta: connections.handleConnectMeta,
			onDisconnect: connections.handleDisconnect,
			onRequestSync: handleRequestSync
		}), connected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("space-y-5", DASHBOARD_THEME.cards.base, "rounded-2xl border border-muted/50 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialsMetaSetupCard, {
				setupState: setup.setupState,
				selectedSourceLabel: setup.selectedPageLabel,
				sourceSelectionRequired: !setupComplete,
				loadingSources: setup.pagesLoading,
				facebookStatus: setup.facebookStatus,
				instagramStatus: setup.instagramStatus,
				facebookCount: setup.facebookCount,
				instagramCount: setup.instagramCount,
				onReloadSources: handleReloadSources,
				onRetryDiscovery: handleReloadSources
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialsPagePicker, {
				pages: setup.pages,
				selectedPageId: setup.selectedPageId,
				loading: setup.pagesLoading,
				confirming: setup.confirmingPage,
				error: setup.pagesError,
				setupComplete,
				instagramBusinessName: connections.status?.instagramBusinessName,
				onSelectPage: setup.setSelectedPageId,
				onConfirm: handleConfirmPage,
				onReload: handleReloadSources
			})]
		}) : null]
	}) });
	const performanceSection = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
		value: surfaceTab.value,
		onValueChange: handleSurfaceChange,
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sticky top-0 z-10 -mx-1 rounded-xl border border-muted/30 bg-card/90 px-1 py-2 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-card/75",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialsSurfaceTabsList, {
					facebookStatus: setup.facebookStatus,
					instagramStatus: setup.instagramStatus
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "facebook",
				className: "mt-0 focus-visible:outline-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialSurfacePanel, {
					surface: "facebook",
					kpis: facebookKpis,
					overview: metrics.facebookOverview,
					overviewLoading: metrics.overviewLoading,
					connected: connected || isPreviewMode,
					setupComplete: setupComplete || isPreviewMode,
					hasData: facebookHasData,
					onRequestSync: handleRequestSync
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "instagram",
				className: "mt-0 focus-visible:outline-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialSurfacePanel, {
					surface: "instagram",
					kpis: instagramKpis,
					overview: metrics.instagramOverview,
					overviewLoading: metrics.overviewLoading,
					connected: connected || isPreviewMode,
					setupComplete: setupComplete || isPreviewMode,
					hasInstagramBinding: Boolean(connections.status?.instagramBusinessId) || isPreviewMode,
					hasData: instagramHasData,
					onRequestSync: handleRequestSync
				})
			})
		]
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionShell, {
		reveal: false,
		className: cn(DASHBOARD_THEME.layout.container, "pb-10"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageSkeletonBoundary, {
			loading: initialLoading,
			loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialsPageLoadingFallback, {}),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialsHeader, {
				selectedClientName: selectedClient?.name ?? null,
				dateRange,
				onDateRangeChange: setDateRange,
				metricsReady: connected && setupComplete
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialsPageLayout, {
				showSetup: !isPreviewMode,
				connected,
				setupComplete,
				setup: setupSection,
				performance: performanceSection
			})]
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialsPage, {});
//#endregion
export { SplitComponent as component };
