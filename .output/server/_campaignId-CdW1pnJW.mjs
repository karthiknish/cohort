import { o as __toESM } from "./_runtime.mjs";
import { S as require_jsx_runtime, s as useAction, x as require_react } from "./_libs/@convex-dev/better-auth+[...].mjs";
import { E as getPreviewCampaigns, Q as isPreviewModeEnabled, T as getPreviewCampaignInsights, l as formatMoney, lt as withPreviewModeSearchParamIfEnabled, ot as normalizeCurrencyCode } from "./_ssr/preview-data-CXkRNfsX.mjs";
import { c as cn, d as formatDate, n as DATE_FORMATS, o as EN_US_NUMBER_MAX_2_FORMATTER, p as formatEnUsCurrencyMaxFractionDigits, r as EN_US_COMPACT_NUMBER_FORMATTER, u as formatCurrency$1 } from "./_ssr/utils-hh4sibN0.mjs";
import { b as pressableScaleClass, p as interactiveTransitionClass } from "./_ssr/motion-Cf6ujF0h.mjs";
import { t as Button } from "./_ssr/button-BHcJlp0q.mjs";
import { t as Badge } from "./_ssr/badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./_ssr/card-CDBnK3ba.mjs";
import { t as Skeleton } from "./_ssr/skeleton-CQ4LJS0E.mjs";
import { r as formatProviderName } from "./_ssr/themes-DBvmOGm7.mjs";
import { s as logError, t as asErrorMessage } from "./_ssr/convex-errors-sHK0JmZ7.mjs";
import { c as reportConvexFailure, i as notifyFailure, o as notifySuccess } from "./_ssr/notifications-DQZKskhM.mjs";
import { r as useRouter$1, t as useParams$1 } from "./_ssr/navigation-C1M-rNAu.mjs";
import { g as useAuth } from "./_ssr/auth-context-fSvbzOPB.mjs";
import { a as adsCampaignInsightsApi, d as adsMetaToolsApi, l as adsMetaCampaignsApi, n as adsAdSetsApi, o as adsCampaignsApi, p as adsTargetingApi, r as adsAudiencesApi, s as adsCreativesApi, t as adsAdMetricsApi } from "./_ssr/convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./_ssr/client-context-BNynWehF.mjs";
import { A as Store, An as FileText, Cn as Funnel, D as Target, E as ThumbsUp, F as Sparkles, Gt as MapPin, Hn as DollarSign, In as Eye, Jr as Activity, K as Settings2, L as Smartphone, O as Tag, Ot as MousePointerClick, Rn as ExternalLink, Rt as MessageSquare, Sr as ChartColumn, Ut as Megaphone, Vt as MessageCircle, Wn as CreditCard, X as Save, Xt as List, Y as Search, Yt as LoaderCircle, _t as Pen, a as Wrench, an as Layers, b as TriangleAlert, bn as Grid3x3, c as Wallet, cr as CircleAlert, dt as Play, fn as Image, g as Upload, gn as Heart, gt as Pencil, h as UserCheck, hr as ChevronDown, ht as Percent, i as X, jr as Briefcase, kr as CalendarClock, l as Video, lt as Plus, nn as Lightbulb, or as CircleCheck, ot as Radio, pr as ChevronRight, qr as AppWindow, r as Zap, rt as RefreshCw, s as Webhook, sr as CircleCheckBig, tn as Link2, u as Users, un as Info, w as Trash2, wr as Calendar, x as TrendingUp, xn as Globe, yt as Pause, z as ShoppingBag } from "./_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-Cuo0TTXb.mjs";
import { a as TableHead, i as TableCell, n as TableBody, o as TableHeader, s as TableRow, t as Table } from "./_ssr/table-DnyDXt-8.mjs";
import { a as DialogFooter, c as DialogTrigger, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./_ssr/dialog-C8tBdgAy.mjs";
import { t as Input } from "./_ssr/input-DuOB9ezo.mjs";
import { t as Label } from "./_ssr/label-B_FvRq1I.mjs";
import { r as FadeInStagger } from "./_ssr/animate-in-JYv0iBIt.mjs";
import { a as TabsTrigger, i as TabsList, n as Tabs, r as TabsContent, t as MotionTabsContent } from "./_ssr/tabs-BP_mm-cH.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./_ssr/tooltip-BwcfatA2.mjs";
import { t as ViewTransition } from "./_ssr/view-transition-DFCVhmkH.mjs";
import { r as createSvglBrandIcon, t as SvglBrandLogo } from "./_ssr/svgl-brand-logo-rIFZzPiw.mjs";
import { t as CHART_COLORS } from "./_ssr/colors-DH3BrJD1.mjs";
import { a as getIconContainerClasses, t as DASHBOARD_THEME } from "./_ssr/dashboard-theme-DM5oBGdY.mjs";
import { a as calculateEfficiencyScore, i as calculateAlgorithmicInsights } from "./_ssr/insights-D9NfALlV.mjs";
import { t as ADS_PAGE_THEME, v as toAdsProviderId } from "./_ssr/ad-algorithms-CKFe3XXP.mjs";
import { n as FormField } from "./_ssr/form-field-B6tt5YY-.mjs";
import { n as metaIsoToDatetimeLocal, t as metaDatetimeLocalToIso } from "./_ssr/meta-datetime-S4MKjvYm.mjs";
import { t as Checkbox } from "./_ssr/checkbox-DP7YqpAp.mjs";
import { t as Textarea } from "./_ssr/textarea-C0M2IvQZ.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./_ssr/alert-DYeH1Q3p.mjs";
import { _ as useFormulaEditor, a as MetaJsonResultBlock, c as MetaToolsFormSection, d as hasAnyMetaCampaignTools, f as hasMetaAdvancedTools, g as resolveMetaCampaignUiVisibility, h as requiresMetaPageForAdSet, i as MetaEventsToolsPanel, l as MetaToolsPanelShell, m as normalizeMetaCampaignObjective, n as CollapsibleContent, o as MetaPixelPicker, p as hasMetaEventsTools, r as CollapsibleTrigger, s as MetaToolsActionBar, t as Collapsible, u as getMetaCreativeObjectTypeOptions, v as validateMetaAdSetObjective } from "./_ssr/use-formula-editor-DJCWXM5p.mjs";
import { t as FormulaBuilderCard } from "./_ssr/formula-builder-card-DnRzyIwq.mjs";
import { t as MotionCard } from "./_ssr/motion-primitives-HmftJNmb.mjs";
import { a as XAxis, c as CartesianGrid, h as Tooltip$1, i as YAxis, l as Bar, o as Area, r as BarChart, t as AreaChart } from "./_libs/recharts+[...].mjs";
import { i as ChartTooltipContent, n as ChartLegend, r as ChartLegendContent, t as ChartContainer } from "./_ssr/chart-B6NHzkGo.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./_ssr/alert-dialog-Be-Tzxcj.mjs";
import { t as Image$1 } from "./_ssr/image-Dd8IQpGx.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./_ssr/avatar-DghqGd0Q.mjs";
import { n as MetricCardPreview } from "./_ssr/hover-preview-BP_Z2-hG.mjs";
import { t as ScrollArea } from "./_ssr/scroll-area-DnXuhDTw.mjs";
import { _ as togglePlacementDraftValue, a as META_INSTAGRAM_POSITIONS, c as META_MESSENGER_POSITIONS, g as resolveMetaSocialPermalink, h as normalizeMetaGeoLocationType, i as META_FACEBOOK_POSITIONS, l as buildMetaTargetingFromNormalized, o as META_LOOKALIKE_COUNTRIES, r as META_DEVICE_PLATFORMS, s as META_LOOKALIKE_RATIO_PRESETS, t as META_AUDIENCE_NETWORK_POSITIONS, u as buildPlacementDetailDraftFromSource } from "./_ssr/meta-ads-B-Zv4_78.mjs";
import { t as dynamic } from "./_ssr/dynamic-D6gKSsRx.mjs";
import { n as usePreview } from "./_ssr/preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./_ssr/page-skeleton-boundary-ZBP950Us.mjs";
import { t as DateRangePicker } from "./_ssr/date-range-picker-D_4D5yhU.mjs";
import { t as BackLink } from "./_ssr/back-link-CKMy253H.mjs";
import { t as useDebouncedValue } from "./_ssr/use-debounce-nytCMJxB.mjs";
import { t as Switch } from "./_ssr/switch-CFSWzNEX.mjs";
import { t as PerformanceChart } from "./_ssr/performance-chart-DwDGn0rc.mjs";
import { n as RevealTransition, r as RevealTransitionFallback, t as DirectionalPageTransition } from "./_ssr/page-transition-Ds_W2a1a.mjs";
import { i as useQuery } from "./_libs/tanstack__react-query.mjs";
import { i as Track, n as Root, r as Thumb, t as Range } from "./_libs/radix-ui__react-slider.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_campaignId-CdW1pnJW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CampaignInsightsPageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-56" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-72" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-44 rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-28 rounded-md" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					"metric-1",
					"metric-2",
					"metric-3",
					"metric-4"
				].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-muted/60 bg-background",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3 p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-20" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-24" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-32" })
						]
					})
				}, slot))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-6 lg:grid-cols-2",
				children: ["chart-1", "chart-2"].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-muted/60 bg-background",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-4 w-56" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-56 w-full rounded-lg" }) })]
				}, slot))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-muted/60 bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-36" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "space-y-2",
					children: [
						"row-1",
						"row-2",
						"row-3",
						"row-4"
					].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-lg" }, slot))
				})]
			})
		]
	});
}
function EditMetaCampaignFormBody({ campaignId, initialName, initialStartTime, initialStopTime, workspaceId, selectedClientId, onClose, onUpdated }) {
	const updateCampaign = useAction(adsMetaCampaignsApi.updateMetaCampaign);
	const [name, setName] = (0, import_react.useState)(initialName);
	const [startTime, setStartTime] = (0, import_react.useState)(() => metaIsoToDatetimeLocal(initialStartTime));
	const [stopTime, setStopTime] = (0, import_react.useState)(() => metaIsoToDatetimeLocal(initialStopTime));
	const [loading, setLoading] = (0, import_react.useState)(false);
	const handleSubmit = async () => {
		if (!workspaceId || !name.trim()) return;
		setLoading(true);
		try {
			await updateCampaign({
				workspaceId,
				providerId: "facebook",
				clientId: selectedClientId,
				campaignId,
				name: name.trim(),
				startTime: metaDatetimeLocalToIso(startTime),
				stopTime: metaDatetimeLocalToIso(stopTime)
			});
			notifySuccess({
				title: "Campaign updated",
				message: "Changes are live in Meta."
			});
			onClose();
			onUpdated?.();
		} catch (error) {
			reportConvexFailure({
				error,
				context: "EditMetaCampaignDialog",
				title: "Could not update campaign",
				fallbackMessage: asErrorMessage(error)
			});
		}
		setLoading(false);
	};
	const handleNameChange = (event) => {
		setName(event.target.value);
	};
	const handleStartTimeChange = (event) => {
		setStartTime(event.target.value);
	};
	const handleStopTimeChange = (event) => {
		setStopTime(event.target.value);
	};
	const handleSubmitClick = () => {
		handleSubmit();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "campaign-edit-name",
				label: "Campaign name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "campaign-edit-name",
					value: name,
					onChange: handleNameChange
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "campaign-edit-start",
				label: "Start (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "campaign-edit-start",
					type: "datetime-local",
					value: startTime,
					onChange: handleStartTimeChange
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "campaign-edit-stop",
				label: "End (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "campaign-edit-stop",
					type: "datetime-local",
					value: stopTime,
					onChange: handleStopTimeChange
				})
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "outline",
		onClick: onClose,
		disabled: loading,
		children: "Cancel"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		onClick: handleSubmitClick,
		disabled: loading || !name.trim(),
		children: loading ? "Saving…" : "Save"
	})] })] });
}
function EditMetaCampaignDialog({ campaignId, initialName, initialStartTime, initialStopTime, onUpdated }) {
	const { user } = useAuth();
	const { selectedClientId } = useClientContext();
	const [open, setOpen] = (0, import_react.useState)(false);
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const formResetKey = `${campaignId}-${initialName}-${initialStartTime ?? ""}-${initialStopTime ?? ""}`;
	const handleClose = () => {
		setOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				className: "gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
					className: "size-3.5",
					"aria-hidden": true
				}), "Edit"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Edit campaign" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Update name and schedule in Meta." })] }), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditMetaCampaignFormBody, {
				campaignId,
				initialName,
				initialStartTime,
				initialStopTime,
				workspaceId,
				selectedClientId,
				onClose: handleClose,
				onUpdated
			}, formResetKey) : null]
		})]
	});
}
function formatObjectiveLabel(objective) {
	if (!objective?.trim()) return null;
	return objective.toLowerCase().replace(/^outcome_/, "").replace(/_/g, " ");
}
function formatCampaignDateRange(startTime, stopTime) {
	const start = startTime ? new Date(startTime) : null;
	const stop = stopTime ? new Date(stopTime) : null;
	const hasStart = Boolean(start && !Number.isNaN(start.getTime()));
	const hasStop = Boolean(stop && !Number.isNaN(stop.getTime()));
	if (!hasStart && !hasStop) return "Schedule not available";
	if (hasStart && !hasStop) return `Started ${formatDate(start, DATE_FORMATS.SHORT)}`;
	if (!hasStart && hasStop) return `Ends ${formatDate(stop, DATE_FORMATS.SHORT)}`;
	return `${formatDate(start, DATE_FORMATS.SHORT)} — ${formatDate(stop, DATE_FORMATS.SHORT)}`;
}
function getCampaignLifetimeRange(startTime, stopTime) {
	const now = /* @__PURE__ */ new Date();
	const start = startTime ? new Date(startTime) : null;
	const stop = stopTime ? new Date(stopTime) : null;
	const hasStart = Boolean(start && !Number.isNaN(start.getTime()));
	const hasStop = Boolean(stop && !Number.isNaN(stop.getTime()));
	if (!hasStart && !hasStop) return null;
	const end = hasStop && stop !== null && stop <= now ? stop : now;
	return {
		start: hasStart && start !== null ? start : new Date(new Date(end).setDate(end.getDate() - 30)),
		end
	};
}
function CampaignHeader({ campaign, loading, dateRange, onDateRangeChange, onRefresh, refreshing, onCampaignUpdated }) {
	const providerDisplay = formatProviderName(campaign?.providerId ?? "");
	const sharedCampaignKey = campaign ? `${campaign.providerId}-${campaign.id}` : null;
	const campaignName = campaign?.name ?? "";
	const campaignStatus = campaign?.status ?? "";
	const campaignLifetimeRange = getCampaignLifetimeRange(campaign?.startTime, campaign?.stopTime);
	const getProviderIcon = () => {
		if (!campaign?.providerId) return null;
		const svglBrand = campaign.providerId === "facebook" || campaign.providerId === "meta" ? "meta" : campaign.providerId === "google" ? "google" : campaign.providerId === "tiktok" ? "tiktok" : campaign.providerId === "linkedin" ? "linkedin" : null;
		if (!svglBrand) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
			brand: svglBrand,
			className: "size-3",
			labeled: false
		});
	};
	const objectiveLabel = formatObjectiveLabel(campaign?.objective);
	const isActive = campaignStatus === "ACTIVE";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: ADS_PAGE_THEME.innerHero,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: ADS_PAGE_THEME.innerHeroGlow,
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative space-y-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackLink, {
				label: "Back to ads",
				href: "/dashboard/ads",
				transitionTypes: ["nav-back"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 flex-1 space-y-3",
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-10 rounded-xl" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-72 max-w-full rounded-lg" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-48 rounded-lg" })
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: getIconContainerClasses("medium"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, {
										className: "size-6 text-primary",
										"aria-hidden": true
									})
								}),
								campaign?.accountLogoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
									className: "size-8 ring-1 ring-border/60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
										src: campaign.accountLogoUrl,
										alt: campaign.accountName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
										className: "text-[10px]",
										children: campaign.accountName?.[0] || "?"
									})]
								}) : null,
								campaign?.accountName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-medium text-muted-foreground",
									children: campaign.accountName
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize",
									children: [getProviderIcon(), providerDisplay]
								}),
								objectiveLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "rounded-full text-[10px] font-medium capitalize",
									children: objectiveLabel
								}) : null,
								sharedCampaignKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTransition, {
									name: `campaign-status-${sharedCampaignKey}`,
									share: "morph",
									default: "none",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: cn("rounded-full text-[10px] font-semibold uppercase tracking-wide", isActive ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning"),
										children: campaignStatus
									})
								}) : null
							]
						}),
						sharedCampaignKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTransition, {
							name: `campaign-title-${sharedCampaignKey}`,
							share: "text-morph",
							default: "none",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: cn(DASHBOARD_THEME.layout.title, "text-balance"),
								children: campaignName
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: cn(DASHBOARD_THEME.layout.title, "text-balance"),
							children: campaign?.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: formatCampaignDateRange(campaign?.startTime, campaign?.stopTime)
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end",
					children: [
						!loading && campaign && (campaign.providerId === "facebook" || campaign.providerId === "meta") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditMetaCampaignDialog, {
							campaignId: campaign.id,
							initialName: campaign.name,
							initialStartTime: campaign.startTime,
							initialStopTime: campaign.stopTime,
							onUpdated: onCampaignUpdated
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateRangePicker, {
							value: dateRange,
							onChange: onDateRangeChange,
							lifetimeRange: campaignLifetimeRange,
							className: "w-full sm:w-auto [&_button]:h-10 [&_button]:rounded-xl [&_button]:border-border/70 [&_button]:bg-background/90"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							className: "h-10 gap-1.5 rounded-xl border-border/70",
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
									children: refreshing ? "Refreshing…" : "Refresh metrics"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sm:hidden",
									children: refreshing ? "…" : "Refresh"
								})
							]
						})
					]
				})]
			})]
		})]
	});
}
function InsightBadge({ level }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-tight", {
			success: "bg-success/10 text-success border-success/20",
			info: "bg-info/10 text-info border-info/20",
			warning: "bg-warning/10 text-warning border-warning/20",
			critical: "bg-destructive/10 text-destructive border-destructive/20",
			error: "bg-destructive/10 text-destructive border-destructive/20"
		}[level]),
		children: level === "critical" ? "High Alert" : level === "info" ? "Suggestion" : level
	});
}
function AlgorithmicInsightsSection({ insights, loading, efficiencyScore }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 gap-6 lg:grid-cols-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
			className: ADS_PAGE_THEME.surfaceCard,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "border-b border-border/50 pb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: ADS_PAGE_THEME.sectionEyebrow,
						children: "Health"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-lg font-semibold tracking-tight",
						children: "Efficiency score"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Overall performance health rating" })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "flex flex-col items-center justify-center gap-y-4 py-6",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-32 rounded-full" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex size-36 items-center justify-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						className: "size-full",
						viewBox: "0 0 100 100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							className: "stroke-muted/20",
							strokeWidth: "8",
							fill: "transparent",
							r: "42",
							cx: "50",
							cy: "50"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							className: cn("motion-chromatic-xslow", efficiencyScore > 80 ? "stroke-success" : efficiencyScore > 60 ? "stroke-warning" : "stroke-destructive"),
							strokeWidth: "8",
							strokeDasharray: `${2 * Math.PI * 42}`,
							strokeDashoffset: `${2 * Math.PI * 42 * (1 - efficiencyScore / 100)}`,
							strokeLinecap: "round",
							fill: "transparent",
							r: "42",
							cx: "50",
							cy: "50",
							transform: "rotate(-90 50 50)"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 flex flex-col items-center justify-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-4xl font-black tracking-tighter",
							children: [efficiencyScore, "%"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60",
							children: "Rating"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-bold",
						children: efficiencyScore > 80 ? "Optimal Performance" : efficiencyScore > 60 ? "Good Stability" : "Requires Attention"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "max-w-[180px] text-xs font-medium text-muted-foreground/70",
						children: [
							"Your campaign is performing better than ",
							Math.round(efficiencyScore * .85),
							"% of similar industry segments."
						]
					})]
				})] })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
			className: cn(ADS_PAGE_THEME.surfaceCard, "lg:col-span-2"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "flex flex-row items-center justify-between gap-y-0 border-b border-border/50 pb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: ADS_PAGE_THEME.sectionEyebrow,
							children: "Recommendations"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-lg font-semibold tracking-tight",
							children: "Algorithm analysis"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "AI-generated performance suggestions" })
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "pt-6",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4",
					children: [
						1,
						2,
						3
					].map((skeletonId) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-10 shrink-0 rounded-lg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-full space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-1/4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full" })]
						})]
					}, `insight-skeleton-${skeletonId}`))
				}) : insights.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn(ADS_PAGE_THEME.emptyState, "min-h-[200px] py-8"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl bg-muted/30 p-4 ring-1 ring-border/50",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
								className: "size-8 text-muted-foreground/50",
								"aria-hidden": true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold",
							children: "Everything looks great!"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-[280px] text-xs font-medium text-muted-foreground/60",
							children: "The algorithm hasn't detected immediate optimizations needed for this period."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-6",
					children: insights.map((insight) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "group relative flex gap-4 motion-chromatic",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("flex size-10 shrink-0 items-center justify-center rounded-xl", insight.level === "success" ? "bg-success/10 text-success" : insight.level === "info" ? "bg-info/10 text-info" : insight.level === "warning" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"),
							children: insight.type === "efficiency" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-5" }) : insight.type === "budget" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 pb-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-black tracking-tight uppercase",
										children: insight.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightBadge, { level: insight.level })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-bold text-foreground/90 leading-snug",
									children: insight.message
								}),
								insight.suggestion && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "rounded-lg bg-muted/30 p-2.5 text-xs font-medium text-muted-foreground/80 border border-muted/20",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-primary mr-1",
										children: "Recommendation:"
									}), insight.suggestion]
								})
							]
						})]
					}, `${insight.type}-${insight.title}`))
				})
			})]
		})]
	});
}
var AudienceControlHeaderActionsSlot = function AudienceControlHeaderActionsSlot({ loading, onOpenBuilder, onRefresh }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceControlHeaderActions, {
		loading,
		onOpenBuilder,
		onRefresh
	});
};
var AudienceControlInterestSectionSlot = function AudienceControlInterestSectionSlot({ aggregatedData, expandedSections, toggleSection, editingSection, onToggleEditing, canEditMetaTargeting, workspaceId, clientId, onAddInterest, onRemoveInterest, onSaveTargeting, savingTargeting }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceControlInterestEditorSection, {
		aggregatedData,
		expandedSections,
		toggleSection,
		editingSection,
		onToggleEditing,
		canEditMetaTargeting,
		workspaceId,
		clientId,
		onAddInterest,
		onRemoveInterest,
		onSaveTargeting,
		savingTargeting
	});
};
function isLookalikeSubtype(subtype) {
	return (subtype ?? "").toUpperCase() === "LOOKALIKE";
}
function AudienceDeleteButton({ audience, deletingId, onRequestDelete }) {
	const handleRequestDelete = () => {
		onRequestDelete(audience);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "ghost",
		size: "icon",
		className: "size-7 text-destructive hover:text-destructive",
		disabled: deletingId === audience.id,
		onClick: handleRequestDelete,
		"aria-label": `Delete ${audience.name}`,
		children: deletingId === audience.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			className: "size-3.5 animate-spin",
			"aria-hidden": true
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
			className: "size-3.5",
			"aria-hidden": true
		})
	});
}
function MetaAudiencesPanel({ workspaceId, clientId }) {
	const listAudiences = useAction(adsAudiencesApi.listAudiences);
	const createLookalikeAudience = useAction(adsAudiencesApi.createLookalikeAudience);
	const deleteAudience = useAction(adsAudiencesApi.deleteAudience);
	const [audiences, setAudiences] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [deletingId, setDeletingId] = (0, import_react.useState)(null);
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)(null);
	const [lookalikeName, setLookalikeName] = (0, import_react.useState)("");
	const [originAudienceId, setOriginAudienceId] = (0, import_react.useState)("");
	const [lookalikeCountry, setLookalikeCountry] = (0, import_react.useState)(META_LOOKALIKE_COUNTRIES[0].code);
	const [lookalikeRatio, setLookalikeRatio] = (0, import_react.useState)(String(META_LOOKALIKE_RATIO_PRESETS[0].ratio));
	const [creatingLookalike, setCreatingLookalike] = (0, import_react.useState)(false);
	const loadAudiences = (0, import_react.useCallback)(() => {
		setLoading(true);
		return listAudiences({
			workspaceId,
			providerId: "facebook",
			clientId: clientId ?? null
		}).then((rows) => {
			setAudiences(Array.isArray(rows) ? rows : []);
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "MetaAudiencesPanel:listAudiences",
				title: "Could not load audiences",
				fallbackMessage: "Could not load audiences"
			});
		}).finally(() => {
			setLoading(false);
		});
	}, [
		listAudiences,
		workspaceId,
		clientId
	]);
	(0, import_react.useEffect)(() => {
		queueMicrotask(() => {
			loadAudiences();
		});
	}, [
		clientId,
		workspaceId,
		loadAudiences
	]);
	const sourceAudiences = audiences.filter((row) => !isLookalikeSubtype(row.subtype));
	const handleRefresh = () => {
		loadAudiences();
	};
	const handleConfirmDelete = async () => {
		if (!pendingDelete) return;
		setDeletingId(pendingDelete.id);
		try {
			await deleteAudience({
				workspaceId,
				providerId: "facebook",
				clientId: clientId ?? null,
				audienceId: pendingDelete.id
			});
			setAudiences((current) => current.filter((row) => row.id !== pendingDelete.id));
			notifySuccess({
				title: "Audience deleted",
				message: `"${pendingDelete.name}" was removed from Meta.`
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "MetaAudiencesPanel:deleteAudience",
				title: "Could not delete audience",
				fallbackMessage: "Check Meta permissions and try again."
			});
		}
		setDeletingId(null);
		setPendingDelete(null);
	};
	const handleDeleteDialogOpenChange = (open) => {
		if (!open) setPendingDelete(null);
	};
	const handleLookalikeNameChange = (event) => {
		setLookalikeName(event.target.value);
	};
	const handleRequestDelete = (audience) => {
		setPendingDelete(audience);
	};
	const handleConfirmDeleteClick = () => {
		handleConfirmDelete();
	};
	const handleCreateLookalike = () => {
		const name = lookalikeName.trim();
		if (!name || !originAudienceId) {
			notifySuccess({
				title: "Missing fields",
				message: "Enter a name and select a source custom audience."
			});
			return;
		}
		const ratio = Number(lookalikeRatio);
		setCreatingLookalike(true);
		createLookalikeAudience({
			workspaceId,
			providerId: "facebook",
			clientId: clientId ?? null,
			name,
			originAudienceId,
			country: lookalikeCountry,
			ratio
		}).then((result) => {
			notifySuccess({
				title: "Lookalike created",
				message: `Meta is building "${name}". It may take a few hours before targeting is available.`
			});
			setLookalikeName("");
			setOriginAudienceId("");
			if (result.id) setAudiences((current) => [...current, {
				id: result.id,
				name,
				subtype: "LOOKALIKE"
			}]);
			loadAudiences();
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "MetaAudiencesPanel:createLookalike",
				title: "Could not create lookalike",
				fallbackMessage: "Meta requires a populated source audience (often 100+ people in the selected country)."
			});
		}).finally(() => {
			setCreatingLookalike(false);
		});
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 py-4 text-sm text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			className: "size-4 animate-spin",
			"aria-hidden": true
		}), "Loading Meta custom audiences…"]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 rounded-lg border border-dashed border-border/60 p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
						className: "size-4 text-muted-foreground",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium text-foreground",
						children: "Create lookalike audience"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground",
					children: "Build a similar audience from an existing custom audience. Upload customer emails first if the source list is empty."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "meta-lookalike-name",
								className: "text-xs",
								children: "Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "meta-lookalike-name",
								value: lookalikeName,
								onChange: handleLookalikeNameChange,
								placeholder: "Lookalike — VIP customers",
								className: "h-9",
								disabled: creatingLookalike
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "meta-lookalike-source",
								className: "text-xs",
								children: "Source audience"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: originAudienceId,
								onValueChange: setOriginAudienceId,
								disabled: creatingLookalike || sourceAudiences.length === 0,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "meta-lookalike-source",
									className: "h-9",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select custom audience…" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: sourceAudiences.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: row.id,
									children: row.name
								}, row.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "meta-lookalike-country",
								className: "text-xs",
								children: "Country"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: lookalikeCountry,
								onValueChange: setLookalikeCountry,
								disabled: creatingLookalike,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "meta-lookalike-country",
									className: "h-9",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: META_LOOKALIKE_COUNTRIES.map((country) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: country.code,
									children: country.label
								}, country.code)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "meta-lookalike-ratio",
								className: "text-xs",
								children: "Audience size"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: lookalikeRatio,
								onValueChange: setLookalikeRatio,
								disabled: creatingLookalike,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "meta-lookalike-ratio",
									className: "h-9",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: META_LOOKALIKE_RATIO_PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: String(preset.ratio),
									children: preset.label
								}, preset.ratio)) })]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					disabled: creatingLookalike || sourceAudiences.length === 0,
					onClick: handleCreateLookalike,
					children: creatingLookalike ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "mr-2 size-4 animate-spin",
						"aria-hidden": true
					}), "Creating…"] }) : "Create lookalike"
				})
			]
		}),
		audiences.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-2 text-xs text-muted-foreground",
			children: "No audiences yet. Create an empty custom audience with the form below, upload emails on a campaign ad set, then build a lookalike here."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium text-muted-foreground",
					children: "Existing audiences"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					className: "h-7 text-xs",
					onClick: handleRefresh,
					children: "Refresh"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "max-h-40 space-y-1.5 overflow-auto",
				children: audiences.map((audience) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/10 px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
							className: "size-4 shrink-0 text-muted-foreground",
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium",
								children: audience.name
							}), audience.approximateCount != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[10px] text-muted-foreground",
								children: [
									"~",
									audience.approximateCount.toLocaleString(),
									" people"
								]
							}) : null]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-1",
						children: [
							isLookalikeSubtype(audience.subtype) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "text-[10px]",
								children: "Lookalike"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "text-[10px]",
								children: "Custom"
							}),
							audience.status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "text-[10px]",
								children: audience.status
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceDeleteButton, {
								audience,
								deletingId,
								onRequestDelete: handleRequestDelete
							})
						]
					})]
				}, audience.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: pendingDelete !== null,
			onOpenChange: handleDeleteDialogOpenChange,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete custom audience?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: pendingDelete ? `"${pendingDelete.name}" will be removed from Meta. Ads using this audience may stop delivering.` : "This audience will be removed from Meta." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
				onClick: handleConfirmDeleteClick,
				children: "Delete"
			})] })] })
		})
	] });
}
/** Meta Marketing API `subscribed_fields` for ad account webhooks. */
var META_AD_ACCOUNT_WEBHOOK_FIELDS = [
	"adaccount",
	"campaigns",
	"adsets",
	"ads",
	"creatives"
];
function WebhookFieldCheckbox({ field, checked, onToggleField }) {
	const handleToggle = () => {
		onToggleField(field);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-card/80 px-2.5 py-1.5 text-xs transition-colors hover:border-primary/25",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
			checked,
			onChange: handleToggle
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			variant: "outline",
			className: "border-0 bg-transparent px-0 text-[10px] capitalize",
			children: field
		})]
	});
}
function MetaAdvancedToolsPanel({ workspaceId, clientId, campaignObjective, scope }) {
	const visibility = resolveMetaCampaignUiVisibility({
		campaignObjective,
		scope
	});
	const advancedTabs = (() => {
		const tabs = [];
		if (visibility.showPixelInsights) tabs.push("pixel");
		if (visibility.showBusinessManager) tabs.push("business");
		if (visibility.showAdLibrary) tabs.push("adlibrary");
		if (visibility.showWebhooks) tabs.push("webhooks");
		return tabs;
	})();
	const [activeTab, setActiveTab] = (0, import_react.useState)("pixel");
	const listAdPixels = useAction(adsMetaToolsApi.listAdPixels);
	const getPixelStats = useAction(adsMetaToolsApi.getPixelStats);
	const getPixelDetails = useAction(adsMetaToolsApi.getPixelDetails);
	const listBusinesses = useAction(adsMetaToolsApi.listBusinesses);
	const listBusinessAdAccounts = useAction(adsMetaToolsApi.listBusinessAdAccounts);
	const searchAdLibrary = useAction(adsMetaToolsApi.searchAdLibrary);
	const listAdAccountWebhooks = useAction(adsMetaToolsApi.listAdAccountWebhooks);
	const updateAdAccountWebhooks = useAction(adsMetaToolsApi.updateAdAccountWebhooks);
	const clearAdAccountWebhooks = useAction(adsMetaToolsApi.clearAdAccountWebhooks);
	const [pixels, dispatchPixels] = (0, import_react.useReducer)((_, value) => value, {
		rows: [],
		loading: false
	});
	const [pixelId, setPixelId] = (0, import_react.useState)("");
	const [pixelDetails, setPixelDetails] = (0, import_react.useState)("");
	const [pixelStats, setPixelStats] = (0, import_react.useState)("");
	const [loadingPixel, setLoadingPixel] = (0, import_react.useState)(false);
	const [businesses, setBusinesses] = (0, import_react.useState)([]);
	const [businessId, setBusinessId] = (0, import_react.useState)("");
	const [businessAccounts, setBusinessAccounts] = (0, import_react.useState)("");
	const [loadingBusiness, setLoadingBusiness] = (0, import_react.useState)(false);
	const [adLibraryQuery, setAdLibraryQuery] = (0, import_react.useState)("");
	const [adLibraryCountry, setAdLibraryCountry] = (0, import_react.useState)("US");
	const [adLibraryRows, setAdLibraryRows] = (0, import_react.useState)([]);
	const [loadingAdLibrary, setLoadingAdLibrary] = (0, import_react.useState)(false);
	const [webhookFields, setWebhookFields] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [loadingWebhooks, setLoadingWebhooks] = (0, import_react.useState)(false);
	const [savingWebhooks, setSavingWebhooks] = (0, import_react.useState)(false);
	const syncedActiveTab = advancedTabs.length > 0 && advancedTabs.includes(activeTab) ? activeTab : advancedTabs[0] ?? activeTab;
	(0, import_react.useEffect)(() => {
		if (!visibility.showPixelInsights) {
			dispatchPixels({
				rows: [],
				loading: false
			});
			return;
		}
		let cancelled = false;
		dispatchPixels({
			rows: [],
			loading: true
		});
		listAdPixels({
			workspaceId,
			clientId: clientId ?? null
		}).then((rows) => {
			if (cancelled) return;
			const mapped = Array.isArray(rows) ? rows.map((row) => ({
				id: String(row.id),
				name: String(row.name)
			})) : [];
			dispatchPixels({
				rows: mapped,
				loading: false
			});
			const only = mapped.length === 1 ? mapped[0] : void 0;
			if (only) setPixelId(only.id);
		}).catch(() => {
			if (!cancelled) dispatchPixels({
				rows: [],
				loading: false
			});
		});
		return () => {
			cancelled = true;
		};
	}, [
		clientId,
		listAdPixels,
		visibility.showPixelInsights,
		workspaceId
	]);
	const handleLoadPixelInsights = () => {
		if (!pixelId.trim()) return;
		setLoadingPixel(true);
		setPixelDetails("");
		setPixelStats("");
		Promise.all([getPixelDetails({
			workspaceId,
			clientId: clientId ?? null,
			pixelId: pixelId.trim()
		}), getPixelStats({
			workspaceId,
			clientId: clientId ?? null,
			pixelId: pixelId.trim(),
			days: 7
		})]).then(([details, stats]) => {
			setPixelDetails(details ? JSON.stringify(details, null, 2) : "No pixel details returned.");
			setPixelStats(Array.isArray(stats) && stats.length > 0 ? JSON.stringify(stats, null, 2) : "No stats for the last 7 days.");
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "MetaAdvancedToolsPanel:pixelInsights",
				title: "Could not load pixel data",
				fallbackMessage: "Check pixel permissions."
			});
		}).finally(() => setLoadingPixel(false));
	};
	const handleLoadBusinesses = () => {
		setLoadingBusiness(true);
		listBusinesses({
			workspaceId,
			clientId: clientId ?? null
		}).then((rows) => {
			setBusinesses(Array.isArray(rows) ? rows : []);
			const first = rows?.[0];
			if (first && typeof first === "object" && "id" in first) setBusinessId(String(first.id));
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "MetaAdvancedToolsPanel:listBusinesses",
				title: "Could not load businesses",
				fallbackMessage: "Requires business_management permission."
			});
		}).finally(() => setLoadingBusiness(false));
	};
	const handleLoadBusinessAccounts = () => {
		if (!businessId) return;
		setLoadingBusiness(true);
		listBusinessAdAccounts({
			workspaceId,
			clientId: clientId ?? null,
			businessId
		}).then((rows) => {
			setBusinessAccounts(JSON.stringify(rows, null, 2));
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "MetaAdvancedToolsPanel:listBusinessAdAccounts",
				title: "Could not load ad accounts",
				fallbackMessage: "Check Business Manager access."
			});
		}).finally(() => setLoadingBusiness(false));
	};
	const handleSearchAdLibrary = () => {
		if (!adLibraryQuery.trim()) return;
		setLoadingAdLibrary(true);
		searchAdLibrary({
			workspaceId,
			clientId: clientId ?? null,
			searchTerms: adLibraryQuery.trim(),
			adReachedCountries: [adLibraryCountry],
			limit: 15
		}).then((rows) => {
			setAdLibraryRows(Array.isArray(rows) ? rows : []);
			notifySuccess({
				title: "Ad Library search complete",
				message: `Found ${Array.isArray(rows) ? rows.length : 0} ads.`
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "MetaAdvancedToolsPanel:searchAdLibrary",
				title: "Ad Library search failed",
				fallbackMessage: "Requires Ad Library API access on your Meta app."
			});
		}).finally(() => setLoadingAdLibrary(false));
	};
	const handleLoadWebhooks = () => {
		setLoadingWebhooks(true);
		listAdAccountWebhooks({
			workspaceId,
			clientId: clientId ?? null
		}).then((result) => {
			const fields = Array.isArray(result?.subscribedFields) ? result.subscribedFields : [];
			setWebhookFields(new Set(fields.map(String)));
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "MetaAdvancedToolsPanel:listWebhooks",
				title: "Could not load webhooks",
				fallbackMessage: "Check ad account permissions."
			});
		}).finally(() => setLoadingWebhooks(false));
	};
	const handleToggleWebhookField = (field) => {
		setWebhookFields((prev) => {
			const next = new Set(prev);
			if (next.has(field)) next.delete(field);
			else next.add(field);
			return next;
		});
	};
	const handleAdLibraryQueryChange = (event) => {
		setAdLibraryQuery(event.target.value);
	};
	const handleAdLibraryCountryChange = (event) => {
		setAdLibraryCountry(event.target.value.toUpperCase());
	};
	const handleSaveWebhooks = () => {
		setSavingWebhooks(true);
		updateAdAccountWebhooks({
			workspaceId,
			clientId: clientId ?? null,
			subscribedFields: [...webhookFields]
		}).then(() => {
			notifySuccess({ message: "Webhook subscriptions updated" });
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "MetaAdvancedToolsPanel:updateWebhooks",
				title: "Could not update webhooks",
				fallbackMessage: "Ensure your Meta app is subscribed at the app level first."
			});
		}).finally(() => setSavingWebhooks(false));
	};
	const handleClearWebhooks = () => {
		setSavingWebhooks(true);
		clearAdAccountWebhooks({
			workspaceId,
			clientId: clientId ?? null
		}).then(() => {
			setWebhookFields(/* @__PURE__ */ new Set());
			notifySuccess({ message: "Webhook subscriptions cleared" });
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "MetaAdvancedToolsPanel:clearWebhooks",
				title: "Could not clear webhooks"
			});
		}).finally(() => setSavingWebhooks(false));
	};
	if (!hasMetaAdvancedTools(visibility) || advancedTabs.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaToolsPanelShell, {
		icon: Activity,
		title: "Pixel insights & integrations",
		description: visibility.showPixelInsights && visibility.showAdLibrary ? "Inspect pixel health, browse public Ad Library ads, manage Business Manager accounts, and tune webhook subscriptions." : visibility.showPixelInsights ? "Inspect pixel configuration, recent event volume, Business Manager access, and ad account webhooks." : visibility.showAdLibrary ? "Search the public Ad Library and manage Business Manager and webhook settings." : "Business Manager and ad account webhook tools for your connected Meta app.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: syncedActiveTab,
			onValueChange: setActiveTab,
			className: "w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "h-9 w-full flex-wrap justify-start gap-1 bg-muted/40 p-1",
					children: [
						visibility.showPixelInsights ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "pixel",
							className: "gap-1.5 text-xs sm:text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, {
								className: "size-3.5 shrink-0",
								"aria-hidden": true
							}), "Pixel"]
						}) : null,
						visibility.showBusinessManager ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "business",
							className: "text-xs sm:text-sm",
							children: "Business"
						}) : null,
						visibility.showAdLibrary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "adlibrary",
							className: "text-xs sm:text-sm",
							children: "Ad Library"
						}) : null,
						visibility.showWebhooks ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "webhooks",
							className: "gap-1.5 text-xs sm:text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Webhook, {
								className: "size-3.5 shrink-0",
								"aria-hidden": true
							}), "Webhooks"]
						}) : null
					]
				}),
				visibility.showPixelInsights ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionTabsContent, {
					activeTab,
					tabValue: "pixel",
					className: "mt-4 space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaToolsFormSection, {
							title: "Pixel",
							description: "Load configuration and a 7-day event summary from Meta.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaPixelPicker, {
								pixelId,
								pixels,
								onPixelIdChange: setPixelId
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaToolsActionBar, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							disabled: loadingPixel || !pixelId.trim(),
							onClick: handleLoadPixelInsights,
							children: [loadingPixel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "mr-2 size-4 animate-spin",
								"aria-hidden": true
							}) : null, "Load pixel details & stats"]
						}) }),
						loadingPixel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Fetching from Meta…"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 lg:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaJsonResultBlock, {
								title: "Configuration",
								content: pixelDetails,
								emptyLabel: "Load a pixel to see its configuration."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaJsonResultBlock, {
								title: "Last 7 days",
								content: pixelStats,
								emptyLabel: "Load a pixel to see recent event stats."
							})]
						})
					]
				}) : null,
				visibility.showBusinessManager ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionTabsContent, {
					activeTab,
					tabValue: "business",
					className: "mt-3 space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							size: "sm",
							variant: "outline",
							disabled: loadingBusiness,
							onClick: handleLoadBusinesses,
							children: [loadingBusiness ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "mr-2 size-4 animate-spin",
								"aria-hidden": true
							}) : null, "Load businesses"]
						}),
						businesses.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: businessId,
							onValueChange: setBusinessId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-9",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select business" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: businesses.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: row.id,
								children: row.name
							}, row.id)) })]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							disabled: loadingBusiness || !businessId,
							onClick: handleLoadBusinessAccounts,
							children: "List ad accounts"
						}),
						businessAccounts ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "max-h-36 overflow-auto rounded-md bg-muted/30 p-2 text-[10px]",
							children: businessAccounts
						}) : null
					]
				}) : null,
				visibility.showAdLibrary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionTabsContent, {
					activeTab,
					tabValue: "adlibrary",
					className: "mt-3 space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: "Requires Ad Library API permission on your Meta app. Results are public ads only."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 sm:grid-cols-[1fr_5rem]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: adLibraryQuery,
								onChange: handleAdLibraryQueryChange,
								placeholder: "Search terms",
								className: "h-9"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: adLibraryCountry,
								onChange: handleAdLibraryCountryChange,
								placeholder: "US",
								className: "h-9"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							size: "sm",
							disabled: loadingAdLibrary,
							onClick: handleSearchAdLibrary,
							children: [loadingAdLibrary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "mr-2 size-4 animate-spin",
								"aria-hidden": true
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
								className: "mr-2 size-4",
								"aria-hidden": true
							}), "Search Ad Library"]
						}),
						adLibraryRows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "max-h-40 space-y-2 overflow-auto",
							children: adLibraryRows.map((ad) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md border border-border/50 p-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: ad.pageName ?? ad.id
									}),
									ad.adCreativeBodies?.[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "line-clamp-2 text-muted-foreground",
										children: ad.adCreativeBodies[0]
									}) : null,
									ad.adSnapshotUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: ad.adSnapshotUrl,
										target: "_blank",
										rel: "noopener noreferrer",
										className: "mt-1 inline-flex items-center gap-1 text-primary",
										children: ["View snapshot ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
											className: "size-3",
											"aria-hidden": true
										})]
									}) : null
								]
							}, ad.id))
						}) : null
					]
				}) : null,
				visibility.showWebhooks ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionTabsContent, {
					activeTab,
					tabValue: "webhooks",
					className: "mt-4 space-y-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MetaToolsFormSection, {
						title: "Ad account subscriptions",
						description: "Subscribes your linked Meta app to change notifications. Set the callback URL in Meta Developer settings first.",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							disabled: loadingWebhooks,
							onClick: handleLoadWebhooks,
							children: [loadingWebhooks ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "mr-2 size-4 animate-spin",
								"aria-hidden": true
							}) : null, "Load current subscriptions"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2 pt-2",
							children: META_AD_ACCOUNT_WEBHOOK_FIELDS.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WebhookFieldCheckbox, {
								field,
								checked: webhookFields.has(field),
								onToggleField: handleToggleWebhookField
							}, field))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MetaToolsActionBar, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						disabled: savingWebhooks,
						onClick: handleSaveWebhooks,
						children: "Save subscriptions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						disabled: savingWebhooks,
						onClick: handleClearWebhooks,
						children: "Clear all"
					})] })]
				}) : null
			]
		})
	});
}
async function searchLocations(query) {
	if (!query || query.length < 2) return [];
	const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
	if (!response.ok) throw new Error("Failed to search locations");
	return response.json();
}
async function resolveCoordinates(name) {
	if (!name) return null;
	const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}&limit=1`);
	if (!response.ok) throw new Error("Failed to resolve coordinates");
	const data = await response.json();
	if (data && data[0]) return {
		lat: parseFloat(data[0].lat),
		lng: parseFloat(data[0].lon)
	};
	return null;
}
/**
* Hook for searching locations using the Nominatim geocoding API
* Includes automatic debouncing to avoid excessive API calls
*/
function useGeocodeSearch(query, options) {
	const { debounceMs = 300, enabled = true } = options ?? {};
	const debouncedQuery = useDebouncedValue(query, debounceMs);
	return useQuery({
		queryKey: [
			"geocode",
			"search",
			debouncedQuery
		],
		queryFn: () => searchLocations(debouncedQuery),
		enabled: enabled && debouncedQuery.length >= 2,
		staleTime: 300 * 1e3,
		gcTime: 1800 * 1e3,
		retry: 2,
		retryDelay: 1e3
	});
}
/**
* Hook for resolving multiple location names to coordinates in batch.
* Returns coordinates plus `failedNames` for locations that could not be resolved.
*/
function useGeocodeResolveBatch(names, options) {
	const { enabled = true } = options ?? {};
	return useQuery({
		queryKey: [
			"geocode",
			"resolve-batch",
			names.sort().join(",")
		],
		queryFn: async () => {
			const coordinates = {};
			const failedNames = [];
			const geocodeNext = async (index) => {
				const name = names[index];
				if (!name) {
					if (index + 1 < names.length) return geocodeNext(index + 1);
					return;
				}
				try {
					const coords = await resolveCoordinates(name);
					if (coords) coordinates[name.toLowerCase().trim()] = coords;
					else failedNames.push(name);
				} catch (e) {
					console.error(`Failed to geocode location: ${name}`, e);
					failedNames.push(name);
				}
				if (index + 1 < names.length) {
					await new Promise((resolve) => setTimeout(resolve, 100));
					return geocodeNext(index + 1);
				}
			};
			await geocodeNext(0);
			return {
				coordinates,
				failedNames
			};
		},
		enabled: enabled && names.length > 0,
		staleTime: 3600 * 1e3,
		gcTime: 1440 * 60 * 1e3,
		retry: 1
	});
}
var EMPTY_LOCATIONS = [];
var EMPTY_GEOCODE_RESULTS = [];
var LeafletMap = dynamic(() => import("./_ssr/leaflet-map-NiWoqry4.mjs").then((mod) => mod.LeafletMap), {
	ssr: false,
	loading: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center justify-center bg-muted/30 rounded-lg size-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-2 text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm",
				children: "Loading map…"
			})]
		})
	})
});
function LocationMap({ locations = EMPTY_LOCATIONS, selectedLocations = EMPTY_LOCATIONS, onLocationSelect, onLocationRemove, interactive = false, height = "300px", className, showSearch = false, showSelectedList = false }) {
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const mapContainerStyle = { height };
	const handleSearchQueryChange = (event) => {
		setSearchQuery(event.target.value);
	};
	const { data: searchResults = EMPTY_GEOCODE_RESULTS, isFetching: searching } = useGeocodeSearch(searchQuery, { enabled: showSearch });
	const allLocations = [...locations, ...selectedLocations];
	const handleResultSelect = (result) => {
		const location = {
			id: `loc-${result.place_id}`,
			name: result.display_name.split(",")[0] || result.display_name,
			lat: parseFloat(result.lat),
			lng: parseFloat(result.lon),
			type: result.type
		};
		setSearchQuery("");
		if (onLocationSelect) onLocationSelect(location);
	};
	const searchResultHandlers = Object.fromEntries(searchResults.map((result) => [result.place_id, () => handleResultSelect(result)]));
	const removeHandlers = onLocationRemove ? Object.fromEntries(selectedLocations.map((location) => [location.id, () => onLocationRemove(location.id)])) : {};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-3", className),
		children: [
			showSearch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Search for a city, country, or region…",
							value: searchQuery,
							onChange: handleSearchQueryChange,
							className: "pl-9 pr-9"
						}),
						searching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" })
					]
				}), searchResults.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute z-[1000] mt-1 w-full rounded-md border bg-popover p-1 shadow-lg",
					children: searchResults.map((result) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
						onClick: searchResultHandlers[result.place_id],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: result.display_name
						})]
					}, result.place_id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative rounded-lg overflow-hidden border",
				style: mapContainerStyle,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeafletMap, {
					locations: allLocations,
					interactive,
					onMarkerClick: interactive ? onLocationSelect : void 0
				})
			}),
			showSelectedList && selectedLocations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs font-medium text-muted-foreground",
					children: [
						"Selected Locations (",
						selectedLocations.length,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: selectedLocations.map((loc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "secondary",
						className: "gap-1 pr-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3" }),
							loc.name,
							onLocationRemove && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: removeHandlers[loc.id],
								className: "ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
							})
						]
					}, loc.id))
				})]
			})
		]
	});
}
var SUGGESTED_INTERESTS = [
	"Technology",
	"Fashion",
	"Sports",
	"Travel",
	"Food & Dining",
	"Health & Fitness",
	"Business",
	"Entertainment",
	"Education",
	"Finance"
];
var AGE_PRESETS = [
	{
		label: "18-24",
		min: 18,
		max: 24
	},
	{
		label: "25-34",
		min: 25,
		max: 34
	},
	{
		label: "35-44",
		min: 35,
		max: 44
	},
	{
		label: "45-54",
		min: 45,
		max: 54
	},
	{
		label: "55-64",
		min: 55,
		max: 64
	},
	{
		label: "65+",
		min: 65,
		max: 100
	}
];
function AudienceStepButton({ activeTab, index, onSelectStep, step, totalSteps }) {
	const onSelectAudienceStep = () => {
		onSelectStep(step.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onSelectAudienceStep,
			className: cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors", activeTab === step.id ? "bg-primary text-primary-foreground" : step.complete ? "bg-accent/10 text-primary" : "bg-muted text-muted-foreground"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("flex size-4 items-center justify-center rounded-full text-[10px]", step.complete ? "bg-accent/20" : "bg-muted-foreground/20"),
				children: index + 1
			}), step.label]
		}), index < totalSteps - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "mx-1 size-4 text-muted-foreground" }) : null]
	});
}
function AudienceInput({ className, id, onEnter, onValueChange, placeholder, value }) {
	const onAudienceInputChange = (event) => {
		onValueChange(event.target.value);
	};
	const handleKeyDown = (event) => {
		if (event.key === "Enter" && onEnter) {
			event.preventDefault();
			onEnter();
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		id,
		placeholder,
		value,
		onChange: onAudienceInputChange,
		onKeyDown: onEnter ? handleKeyDown : void 0,
		className
	});
}
function AudienceTextarea({ id, onValueChange, placeholder, rows, value }) {
	const onAudienceTextareaChange = (event) => {
		onValueChange(event.target.value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
		id,
		placeholder,
		value,
		onChange: onAudienceTextareaChange,
		rows
	});
}
function SegmentBadge({ segment, index, onRemoveSegment }) {
	const handleRemove = () => {
		onRemoveSegment(index);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: "secondary",
		className: "gap-1 rounded-lg",
		children: [segment, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: handleRemove,
			className: "ml-0.5 hover:text-destructive",
			"aria-label": `Remove segment: ${segment}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
		})]
	}, segment);
}
function InterestBadge({ interest, onAddInterest }) {
	const onAddSuggestedInterest = () => {
		onAddInterest(interest);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "outline",
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onAddSuggestedInterest,
			className: "cursor-pointer rounded-lg transition-colors hover:border-primary hover:bg-accent/10",
			"aria-label": `Add interest: ${interest}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
				className: "mr-1 size-3",
				"aria-hidden": true
			}), interest]
		})
	});
}
function SelectedInterestBadge({ interest, onRemoveInterest }) {
	const handleRemove = () => {
		onRemoveInterest(interest);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		className: "gap-1 rounded-lg",
		children: [interest, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: handleRemove,
			className: "ml-0.5 hover:text-destructive",
			"aria-label": `Remove interest: ${interest}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
		})]
	});
}
function AgePresetButton({ active, onAgePreset, preset }) {
	const onSelectAgePreset = () => {
		onAgePreset(preset.min, preset.max);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: onSelectAgePreset,
		className: cn("rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"),
		"aria-label": `Select age range: ${preset.label}`,
		"aria-pressed": active,
		children: preset.label
	});
}
function GenderButton({ formData, gender, onGenderToggle, onResetGenders }) {
	const onSelectGender = () => {
		if (gender === "All") onResetGenders();
		else onGenderToggle(gender.toLowerCase());
	};
	const isSelected = gender === "All" ? formData.genders.length === 0 : formData.genders.includes(gender.toLowerCase());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: onSelectGender,
		className: cn("flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", gender === "All" && formData.genders.length === 0 ? "border-primary bg-primary text-primary-foreground" : isSelected ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"),
		"aria-label": `Select gender: ${gender}`,
		"aria-pressed": isSelected,
		children: gender
	});
}
function AudienceBuilderDialogHeader({ activeTab, completionSteps, onSelectStep, providerId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
		className: "border-b bg-gradient-to-r from-primary/5 to-transparent p-6 pb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-11 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-primary/20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-5 text-primary" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "text-lg",
				children: "Build New Audience"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: providerId === "meta" || providerId === "facebook" ? "Creates an empty Meta custom audience container (name + description). Targeting is set on ad sets, not here." : `Create a custom audience for ${providerId} campaigns` })] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex items-center gap-2",
			children: completionSteps.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceStepButton, {
				activeTab,
				index,
				onSelectStep,
				step,
				totalSteps: completionSteps.length
			}, step.id))
		})]
	});
}
function AudienceBuilderDialogTabs({ activeTab, formData, newInterest, newSegment, onAddInterest, onAddSegment, onAgePreset, onDescriptionChange, onGenderToggle, onInterestInputChange, onLocationRemove, onLocationSelect, onNameChange, onRemoveInterest, onRemoveSegment, onResetGenders, onSegmentInputChange, providerId, setActiveTab }) {
	const handleAddInterest = () => {
		onAddInterest(newInterest);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
		className: "max-h-[50vh] flex-1",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: activeTab,
			onValueChange: setActiveTab,
			className: "w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "basics",
					className: "m-0 space-y-4 p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
						id: "aud-name",
						label: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Audience Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-destructive",
							children: "*"
						})] }),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceInput, {
							id: "aud-name",
							placeholder: "e.g. Website Visitors - Last 30 Days",
							value: formData.name,
							onValueChange: onNameChange,
							className: "h-11"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
						id: "aud-desc",
						label: "Description",
						description: "Describe your target audience and campaign goals.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceTextarea, {
							id: "aud-desc",
							placeholder: "Describe your target audience and campaign goals…",
							value: formData.description,
							onValueChange: onDescriptionChange,
							rows: 3
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "locations",
					className: "m-0 space-y-4 p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-4" }), "Target Locations"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Search and select locations to target with your audience"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationMap, {
						selectedLocations: formData.locations,
						onLocationSelect,
						onLocationRemove,
						height: "280px",
						interactive: true,
						showSearch: true,
						showSelectedList: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "targeting",
					className: "m-0 space-y-6 p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-4" }), "Custom Segments"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceInput, {
										placeholder: providerId === "linkedin" ? "Enter job title or skill" : "Enter interest or keyword",
										value: newSegment,
										onValueChange: onSegmentInputChange,
										onEnter: onAddSegment,
										className: "h-10"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										size: "sm",
										onClick: onAddSegment,
										className: "h-10 px-4",
										"aria-label": "Add segment",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex min-h-[32px] flex-wrap gap-1.5",
									children: formData.segments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "py-1 text-xs italic text-muted-foreground",
										children: "No segments added yet"
									}) : formData.segments.map((segment, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SegmentBadge, {
										segment,
										index,
										onRemoveSegment
									}, segment))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4" }), "Interests"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceInput, {
										placeholder: "Add custom interest…",
										value: newInterest,
										onValueChange: onInterestInputChange,
										onEnter: handleAddInterest,
										className: "h-10"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										size: "sm",
										onClick: handleAddInterest,
										disabled: !newInterest.trim(),
										className: "h-10 px-4",
										"aria-label": "Add interest",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-1 text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3" }), "Suggested interests"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-1.5",
										children: SUGGESTED_INTERESTS.flatMap((interest) => !formData.interests.includes(interest) ? [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InterestBadge, {
											interest,
											onAddInterest
										}, interest)] : [])
									})]
								}),
								formData.interests.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-1.5 rounded-lg border bg-muted/30 p-3",
									children: formData.interests.map((interest) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectedInterestBadge, {
										interest,
										onRemoveInterest
									}, interest))
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }), "Age Range"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: AGE_PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgePresetButton, {
										preset,
										active: formData.ageMin === preset.min && formData.ageMax === preset.max,
										onAgePreset
									}, preset.label))
								}),
								formData.ageMin || formData.ageMax ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [
										"Selected: ",
										formData.ageMin,
										"-",
										formData.ageMax === 100 ? "65+" : formData.ageMax,
										" years old"
									]
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Gender" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-2",
								children: [
									"Male",
									"Female",
									"All"
								].map((gender) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GenderButton, {
									gender,
									formData,
									onGenderToggle,
									onResetGenders
								}, gender))
							})]
						})
					]
				})
			]
		})
	});
}
function AudienceBuilderDialogFooter({ completedCount, loading, onCancel, onCreate, totalSteps }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {
		className: "border-t bg-muted/30 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("flex size-6 items-center justify-center rounded-full text-xs font-medium", completedCount >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"),
					children: completedCount
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"of ",
					totalSteps,
					" sections completed"
				] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: onCancel,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onCreate,
					disabled: loading,
					children: loading ? "Creating…" : "Create Audience"
				})]
			})]
		})
	});
}
function createInitialAudienceBuilderState() {
	return {
		activeTab: "basics",
		loading: false,
		formData: {
			name: "",
			description: "",
			segments: [],
			locations: [],
			interests: [],
			genders: []
		},
		newSegment: "",
		newInterest: ""
	};
}
function audienceBuilderReducer(state, action) {
	switch (action.type) {
		case "setActiveTab": return {
			...state,
			activeTab: action.value
		};
		case "setLoading": return {
			...state,
			loading: action.value
		};
		case "setFormData": return {
			...state,
			formData: typeof action.value === "function" ? action.value(state.formData) : action.value
		};
		case "setNewSegment": return {
			...state,
			newSegment: action.value
		};
		case "setNewInterest": return {
			...state,
			newInterest: action.value
		};
		case "resetForm": return createInitialAudienceBuilderState();
		default: return state;
	}
}
function AudienceBuilderDialog({ isOpen, onOpenChange, providerId }) {
	const { user } = useAuth();
	const { selectedClientId } = useClientContext();
	const createAudience = useAction(adsAudiencesApi.createAudience);
	const [state, dispatch] = (0, import_react.useReducer)(audienceBuilderReducer, void 0, createInitialAudienceBuilderState);
	const { activeTab, loading, formData, newSegment, newInterest } = state;
	const handleAddSegment = () => {
		if (!newSegment.trim()) return;
		dispatch({
			type: "setFormData",
			value: (prev) => ({
				...prev,
				segments: [...prev.segments, newSegment.trim()]
			})
		});
		dispatch({
			type: "setNewSegment",
			value: ""
		});
	};
	const handleRemoveSegment = (index) => {
		dispatch({
			type: "setFormData",
			value: (prev) => ({
				...prev,
				segments: prev.segments.filter((_, i) => i !== index)
			})
		});
	};
	const handleAddInterest = (interest) => {
		if (formData.interests.includes(interest)) return;
		dispatch({
			type: "setFormData",
			value: (prev) => ({
				...prev,
				interests: [...prev.interests, interest]
			})
		});
		dispatch({
			type: "setNewInterest",
			value: ""
		});
	};
	const handleRemoveInterest = (interest) => {
		dispatch({
			type: "setFormData",
			value: (prev) => ({
				...prev,
				interests: prev.interests.filter((i) => i !== interest)
			})
		});
	};
	const handleLocationSelect = (location) => {
		dispatch({
			type: "setFormData",
			value: (prev) => {
				if (prev.locations.some((l) => l.id === location.id)) return prev;
				return {
					...prev,
					locations: [...prev.locations, location]
				};
			}
		});
	};
	const handleLocationRemove = (locationId) => {
		dispatch({
			type: "setFormData",
			value: (prev) => ({
				...prev,
				locations: prev.locations.filter((l) => l.id !== locationId)
			})
		});
	};
	const handleGenderToggle = (gender) => {
		dispatch({
			type: "setFormData",
			value: (prev) => ({
				...prev,
				genders: prev.genders.includes(gender) ? prev.genders.filter((g) => g !== gender) : [...prev.genders, gender]
			})
		});
	};
	const handleAgePreset = (min, max) => {
		dispatch({
			type: "setFormData",
			value: (prev) => ({
				...prev,
				ageMin: min,
				ageMax: max
			})
		});
	};
	const resetForm = () => {
		dispatch({ type: "resetForm" });
	};
	const convexProviderId = toAdsProviderId(providerId);
	const isMetaAudience = convexProviderId === "facebook";
	const handleCreate = () => {
		if (!formData.name) {
			notifyFailure({
				title: "Missing information",
				message: "Please provide an audience name."
			});
			return;
		}
		if (!isMetaAudience && formData.segments.length === 0 && formData.locations.length === 0 && formData.interests.length === 0) {
			notifyFailure({
				title: "Missing targeting",
				message: "Please add at least one segment, location, or interest."
			});
			return;
		}
		dispatch({
			type: "setLoading",
			value: true
		});
		const workspaceId = user?.agencyId ? String(user.agencyId) : null;
		if (!workspaceId) {
			notifyFailure({
				title: "Error",
				message: "Failed to create audience."
			});
			dispatch({
				type: "setLoading",
				value: false
			});
			return;
		}
		createAudience({
			workspaceId,
			providerId: convexProviderId,
			clientId: selectedClientId ?? null,
			name: formData.name,
			description: formData.description,
			segments: isMetaAudience ? [] : formData.segments,
			locations: isMetaAudience ? [] : formData.locations.map((l) => ({
				id: l.id,
				name: l.name,
				lat: l.lat,
				lng: l.lng
			})),
			interests: isMetaAudience ? [] : formData.interests,
			demographics: isMetaAudience ? void 0 : {
				ageMin: formData.ageMin,
				ageMax: formData.ageMax,
				genders: formData.genders
			}
		}).then((result) => {
			notifySuccess({
				title: "Success",
				message: isMetaAudience ? `Empty custom audience "${formData.name}" created. Upload customer lists in Meta Events Manager, then attach to ad set targeting.` : result.message || `Audience "${formData.name}" created successfully.`
			});
			onOpenChange(false);
			resetForm();
		}).catch((err) => {
			reportConvexFailure({
				error: err,
				context: "audience-builder-dialog.tsx:catch",
				title: "Could not create audience",
				fallbackMessage: "Could not create audience"
			});
		}).finally(() => {
			dispatch({
				type: "setLoading",
				value: false
			});
		});
	};
	const handleDialogOpenChange = (open) => {
		onOpenChange(open);
		if (!open) resetForm();
	};
	const handleCancel = () => {
		onOpenChange(false);
	};
	const handleDescriptionChange = (value) => {
		dispatch({
			type: "setFormData",
			value: (prev) => ({
				...prev,
				description: value
			})
		});
	};
	const handleNameChange = (value) => {
		dispatch({
			type: "setFormData",
			value: (prev) => ({
				...prev,
				name: value
			})
		});
	};
	const handleResetGenders = () => {
		dispatch({
			type: "setFormData",
			value: (prev) => ({
				...prev,
				genders: []
			})
		});
	};
	const handleSelectStep = (step) => {
		dispatch({
			type: "setActiveTab",
			value: step
		});
	};
	const handleSegmentInputChange = (value) => {
		dispatch({
			type: "setNewSegment",
			value
		});
	};
	const handleInterestInputChange = (value) => {
		dispatch({
			type: "setNewInterest",
			value
		});
	};
	const completionSteps = [
		{
			id: "basics",
			label: "Basics",
			complete: Boolean(formData.name)
		},
		{
			id: "locations",
			label: "Locations",
			complete: formData.locations.length > 0
		},
		{
			id: "targeting",
			label: "Targeting",
			complete: formData.segments.length > 0 || formData.interests.length > 0
		},
		{
			id: "demographics",
			label: "Demographics",
			complete: Boolean(formData.ageMin || formData.genders.length > 0)
		}
	];
	const completedCount = completionSteps.filter((s) => s.complete).length;
	const accountMetaUi = resolveMetaCampaignUiVisibility({ scope: "account" });
	const showAccountEventsTools = hasMetaEventsTools(accountMetaUi);
	const showAccountAdvancedTools = hasMetaAdvancedTools(accountMetaUi);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: isOpen,
		onOpenChange: handleDialogOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceBuilderDialogHeader, {
					activeTab,
					completionSteps,
					onSelectStep: handleSelectStep,
					providerId
				}),
				isMetaAudience && user?.agencyId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 px-6 pb-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
							className: "text-xs",
							children: "Meta custom audiences start empty. Segments, map pins, and interests in this dialog are not sent to Meta - configure targeting on each ad set instead."
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaAudiencesPanel, {
							workspaceId: String(user.agencyId),
							clientId: selectedClientId
						}),
						showAccountEventsTools ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaEventsToolsPanel, {
							workspaceId: String(user.agencyId),
							clientId: selectedClientId,
							scope: "account"
						}) : null,
						showAccountAdvancedTools ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaAdvancedToolsPanel, {
							workspaceId: String(user.agencyId),
							clientId: selectedClientId,
							scope: "account"
						}) : null
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceBuilderDialogTabs, {
					activeTab,
					formData,
					newInterest,
					newSegment,
					onAddInterest: handleAddInterest,
					onAddSegment: handleAddSegment,
					onAgePreset: handleAgePreset,
					onDescriptionChange: handleDescriptionChange,
					onGenderToggle: handleGenderToggle,
					onInterestInputChange: handleInterestInputChange,
					onLocationRemove: handleLocationRemove,
					onLocationSelect: handleLocationSelect,
					onNameChange: handleNameChange,
					onRemoveInterest: handleRemoveInterest,
					onRemoveSegment: handleRemoveSegment,
					onResetGenders: handleResetGenders,
					onSegmentInputChange: handleSegmentInputChange,
					providerId,
					setActiveTab: handleSelectStep
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceBuilderDialogFooter, {
					completedCount,
					loading,
					onCancel: handleCancel,
					onCreate: handleCreate,
					totalSteps: completionSteps.length
				})
			]
		})
	});
}
function TargetingCollapsiblePanel({ sectionId, icon: Icon, title, count, expanded, onToggle, headerActions, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Collapsible, {
		open: expanded,
		onOpenChange: onToggle,
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn(ADS_PAGE_THEME.controlCollapsibleTrigger, expanded && "border-primary/20 bg-card"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex min-w-0 flex-1 items-center gap-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg",
					"aria-expanded": expanded,
					"aria-controls": `targeting-panel-${sectionId}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 ring-1 ring-border/50",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-4 text-muted-foreground",
								"aria-hidden": true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium text-foreground",
							children: title
						}),
						typeof count === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: "text-xs tabular-nums",
							children: count
						}) : null
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-1",
				children: [headerActions, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
						"aria-label": `${expanded ? "Collapse" : "Expand"} ${title}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
							className: cn("size-4 transition-transform duration-200", expanded && "rotate-180"),
							"aria-hidden": true
						})
					})
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent, {
			id: `targeting-panel-${sectionId}`,
			className: "pt-2 motion-reduce:transition-none",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: ADS_PAGE_THEME.controlCollapsibleBody,
				children
			})
		})]
	});
}
var FacebookBrandIcon = createSvglBrandIcon("facebook");
var InstagramBrandIcon = createSvglBrandIcon("instagram");
function AudienceDisplaySection({ aggregatedData, expandedSections, toggleSection, customAudiencesSection, interestSection, hidePlacements }) {
	const sectionToggleHandlers = {
		audiences: () => toggleSection("audiences"),
		keywords: () => toggleSection("keywords"),
		devices: () => toggleSection("devices"),
		placements: () => toggleSection("placements"),
		professional: () => toggleSection("professional")
	};
	const otherPlacements = aggregatedData.placements.filter((placement) => ![
		"facebook",
		"instagram",
		"audience_network",
		"messenger"
	].includes(placement.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		customAudiencesSection ? customAudiencesSection : aggregatedData.audiences.included.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TargetingCollapsiblePanel, {
			sectionId: "audiences",
			icon: UserCheck,
			title: "Custom audiences",
			count: aggregatedData.audiences.included.length,
			expanded: expandedSections.has("audiences"),
			onToggle: sectionToggleHandlers.audiences,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: aggregatedData.audiences.included.map((audience) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "secondary",
					className: "text-xs",
					children: audience.name
				}, audience.id))
			})
		}) : null,
		interestSection,
		aggregatedData.keywords.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TargetingCollapsiblePanel, {
			sectionId: "keywords",
			icon: Tag,
			title: "Keywords",
			count: aggregatedData.keywords.length,
			expanded: expandedSections.has("keywords"),
			onToggle: sectionToggleHandlers.keywords,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: aggregatedData.keywords.map((keyword) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "secondary",
					className: "text-xs",
					children: [keyword.text, keyword.matchType ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-1 opacity-60",
						children: [
							"(",
							keyword.matchType,
							")"
						]
					}) : null]
				}, `${keyword.text}-${keyword.matchType ?? "default"}`))
			})
		}) : null,
		aggregatedData.devices.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TargetingCollapsiblePanel, {
			sectionId: "devices",
			icon: Smartphone,
			title: "Devices",
			count: aggregatedData.devices.length,
			expanded: expandedSections.has("devices"),
			onToggle: sectionToggleHandlers.devices,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: aggregatedData.devices.map((device) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					className: "text-xs capitalize",
					children: device.toLowerCase()
				}, device))
			})
		}) : null,
		!hidePlacements && aggregatedData.placements.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TargetingCollapsiblePanel, {
			sectionId: "placements",
			icon: Globe,
			title: "Placements & platforms",
			count: aggregatedData.placements.length,
			expanded: expandedSections.has("placements"),
			onToggle: sectionToggleHandlers.placements,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					aggregatedData.metaPlacements.facebook.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlacementGroup, {
						icon: FacebookBrandIcon,
						label: "Facebook",
						toneClass: "text-info",
						placements: aggregatedData.metaPlacements.facebook,
						keyPrefix: "facebook"
					}) : null,
					aggregatedData.metaPlacements.instagram.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlacementGroup, {
						icon: InstagramBrandIcon,
						label: "Instagram",
						toneClass: "text-accent",
						placements: aggregatedData.metaPlacements.instagram,
						keyPrefix: "instagram"
					}) : null,
					aggregatedData.metaPlacements.messenger.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlacementGroup, {
						icon: MessageCircle,
						label: "Messenger",
						toneClass: "text-info",
						placements: aggregatedData.metaPlacements.messenger,
						keyPrefix: "messenger"
					}) : null,
					aggregatedData.metaPlacements.audienceNetwork.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlacementGroup, {
						icon: Zap,
						label: "Audience Network",
						toneClass: "text-muted-foreground",
						placements: aggregatedData.metaPlacements.audienceNetwork,
						keyPrefix: "audience-network"
					}) : null,
					otherPlacements.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlacementGroup, {
						icon: Globe,
						label: "Other platforms",
						toneClass: "text-muted-foreground",
						placements: otherPlacements,
						keyPrefix: "other"
					}) : null
				]
			})
		}) : null,
		aggregatedData.professional.industries.length > 0 || aggregatedData.professional.jobTitles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TargetingCollapsiblePanel, {
			sectionId: "professional",
			icon: Briefcase,
			title: "Professional",
			count: aggregatedData.professional.industries.length + aggregatedData.professional.jobTitles.length,
			expanded: expandedSections.has("professional"),
			onToggle: sectionToggleHandlers.professional,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [aggregatedData.professional.industries.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1.5 text-xs font-medium text-muted-foreground",
					children: "Industries"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: aggregatedData.professional.industries.map((industry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "text-xs",
						children: industry.name
					}, industry.id))
				})] }) : null, aggregatedData.professional.jobTitles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1.5 text-xs font-medium text-muted-foreground",
					children: "Job titles"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: aggregatedData.professional.jobTitles.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "text-xs",
						children: job.name
					}, job.id))
				})] }) : null]
			})
		}) : null
	] });
}
function PlacementGroup({ icon: Icon, label, toneClass, placements, keyPrefix }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("flex items-center gap-2", toneClass),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: "size-4",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-semibold uppercase tracking-wider",
				children: label
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-1.5 pl-1",
			children: placements.map((placement) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "outline",
				className: "bg-background/50 px-2 py-0.5 text-[10px] capitalize",
				children: placement.replace(/_/g, " ")
			}, `${keyPrefix}-${placement}`))
		})]
	});
}
function useMetaTargetingSearch({ workspaceId, clientId, mode, enabled = true, debounceMs = 300 }) {
	const searchInterests = useAction(adsMetaToolsApi.searchTargetingInterests);
	const searchGeolocations = useAction(adsMetaToolsApi.searchTargetingGeolocations);
	const [query, setQuery] = (0, import_react.useState)("");
	const [results, setResults] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const requestIdRef = (0, import_react.useRef)(0);
	const runSearch = (0, import_react.useEffectEvent)(async (searchQuery) => {
		const trimmed = searchQuery.trim();
		if (!enabled || !workspaceId || trimmed.length < 2) {
			setResults([]);
			setError(null);
			setLoading(false);
			return;
		}
		const requestId = ++requestIdRef.current;
		setLoading(true);
		setError(null);
		try {
			const rowsPromise = mode === "interests" ? searchInterests({
				workspaceId,
				clientId: clientId ?? null,
				query: trimmed,
				limit: 20
			}) : searchGeolocations({
				workspaceId,
				clientId: clientId ?? null,
				query: trimmed,
				limit: 20
			});
			if (requestId !== requestIdRef.current) return;
			const rows = await rowsPromise;
			if (requestId === requestIdRef.current) setResults(Array.isArray(rows) ? rows : []);
		} catch (err) {
			if (requestId === requestIdRef.current) {
				setResults([]);
				setError(err instanceof Error ? err.message : "Search failed");
			}
		} finally {
			if (requestId === requestIdRef.current) setLoading(false);
		}
	});
	(0, import_react.useEffect)(() => {
		if (!enabled || !workspaceId) return;
		const handle = window.setTimeout(() => {
			runSearch(query);
		}, debounceMs);
		return () => window.clearTimeout(handle);
	}, [
		clientId,
		debounceMs,
		enabled,
		mode,
		query,
		workspaceId
	]);
	return {
		query,
		setQuery,
		results: !enabled || !workspaceId ? [] : results,
		loading,
		error,
		clear: () => {
			setQuery("");
			setResults([]);
			setError(null);
		}
	};
}
function MetaTargetingSearchCombobox({ workspaceId, clientId, mode, placeholder, disabled, onSelect, className }) {
	const listId = (0, import_react.useId)();
	const [open, setOpen] = (0, import_react.useState)(false);
	const { query, setQuery, results, loading, error, clear } = useMetaTargetingSearch({
		workspaceId,
		clientId,
		mode,
		enabled: !disabled
	});
	const handleSelect = (item) => {
		onSelect(item);
		clear();
		setOpen(false);
	};
	const onComboboxOpen = () => setOpen(true);
	const onComboboxClose = () => {
		window.setTimeout(() => setOpen(false), 150);
	};
	const handleQueryChange = (event) => {
		setQuery(event.target.value);
		setOpen(true);
	};
	const handleResultMouseDown = (event) => {
		event.preventDefault();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
					className: "pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: handleQueryChange,
					onFocus: onComboboxOpen,
					onBlur: onComboboxClose,
					disabled: disabled || !workspaceId,
					placeholder: placeholder ?? (mode === "interests" ? "Search Meta interests…" : "Search countries, regions, cities…"),
					className: "h-9 pl-9 text-sm",
					role: "combobox",
					"aria-expanded": open,
					"aria-controls": listId,
					autoComplete: "off"
				}),
				loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground",
					"aria-hidden": true
				}) : null
			]
		}), open && (results.length > 0 || error || query.trim().length >= 2 && !loading) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			id: listId,
			className: "absolute z-50 mt-1 max-h-48 w-full list-none overflow-auto rounded-lg border border-border bg-popover py-1 shadow-md",
			children: [
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-2 text-xs text-destructive",
					role: "status",
					children: error
				}) }) : null,
				results.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaTargetingResultOption, {
					item,
					onMouseDown: handleResultMouseDown,
					onSelect: handleSelect
				}) }, `${item.type}-${item.id}`)),
				!error && results.length === 0 && query.trim().length >= 2 && !loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-2 text-xs text-muted-foreground",
					children: "No matches - try a different term"
				}) }) : null
			]
		}) : null]
	});
}
function MetaTargetingResultOption({ item, onMouseDown, onSelect }) {
	const selectTargetingResult = () => {
		onSelect(item);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		role: "option",
		"aria-selected": false,
		variant: "ghost",
		className: "h-auto w-full justify-start rounded-none px-3 py-2 text-left font-normal",
		onMouseDown,
		onClick: selectTargetingResult,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-sm font-medium",
				children: item.name
			}),
			item.path?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-[10px] text-muted-foreground",
				children: item.path.join(" › ")
			}) : null,
			item.audienceSize ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "block text-[10px] text-muted-foreground",
				children: [
					"~",
					item.audienceSize.toLocaleString(),
					" people"
				]
			}) : null
		]
	});
}
function AudienceEditorSection({ aggregatedData, expandedSections, toggleSection, editingSection, onToggleEditing, canEditTargeting, workspaceId, clientId, onAddInterest, onRemoveInterest, onSaveTargeting, savingTargeting }) {
	const [newInterest, setNewInterest] = (0, import_react.useState)("");
	const isEditing = editingSection === "interests";
	const handleToggleInterests = () => {
		toggleSection("interests");
	};
	const handleEditInterests = (event) => {
		event.stopPropagation();
		onToggleEditing("interests");
	};
	const handleNewInterestChange = (event) => {
		setNewInterest(event.target.value);
	};
	const handleAddInterest = () => {
		if (!newInterest.trim()) return;
		if (onAddInterest) {
			onAddInterest({
				id: newInterest.trim(),
				name: newInterest.trim()
			});
			setNewInterest("");
			return;
		}
		notifySuccess({
			title: "Interest would be added",
			message: `"${newInterest}" — editing is only available for Meta ad sets.`
		});
		setNewInterest("");
	};
	const handleRemoveInterest = (interestName) => {
		if (onRemoveInterest) {
			onRemoveInterest(interestName);
			return;
		}
		notifySuccess({
			title: "Interest would be removed",
			message: `"${interestName}" removal requires API integration`
		});
	};
	const handleMetaInterestSelect = (item) => {
		if (onAddInterest) onAddInterest({
			id: item.id,
			name: item.name
		});
	};
	const handleSaveTargetingClick = () => {
		onSaveTargeting?.();
	};
	const editButton = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: isEditing ? "default" : "ghost",
			size: "icon",
			className: "size-8",
			onClick: handleEditInterests,
			"aria-pressed": isEditing,
			"aria-label": "Edit interests",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, {
				className: "size-3.5",
				"aria-hidden": true
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: isEditing ? "Exit interest editing" : "Edit interests" })] }) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TargetingCollapsiblePanel, {
		sectionId: "interests",
		icon: Heart,
		title: "Interests",
		count: aggregatedData.interests.length,
		expanded: expandedSections.has("interests"),
		onToggle: handleToggleInterests,
		headerActions: editButton,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [
				isEditing ? canEditTargeting && workspaceId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaTargetingSearchCombobox, {
					workspaceId,
					clientId,
					mode: "interests",
					disabled: savingTargeting,
					onSelect: handleMetaInterestSelect
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Add interest (ID or name)…",
						value: newInterest,
						onChange: handleNewInterestChange,
						className: "h-9 flex-1 text-sm"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "h-9 shrink-0 px-3",
						onClick: handleAddInterest,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							className: "size-4",
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sr-only",
							children: "Add interest"
						})]
					})]
				}) : null,
				aggregatedData.interests.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InterestGroups, {
					interests: aggregatedData.interests,
					removable: isEditing,
					onRemove: handleRemoveInterest
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "py-2 text-center text-xs text-muted-foreground",
					children: ["No interests configured.", isEditing ? " Add one above." : ""]
				}),
				isEditing && onSaveTargeting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2 border-t border-border/60 pt-3",
					children: [canEditTargeting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Search Meta interests above, then save to the selected ad set."
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						className: "w-full sm:w-auto",
						disabled: savingTargeting,
						onClick: handleSaveTargetingClick,
						children: savingTargeting ? "Saving…" : "Save to ad set"
					})]
				}) : null
			]
		})
	});
}
function InterestGroups({ interests, removable, onRemove }) {
	const categorized = interests.reduce((acc, interest) => {
		const category = interest.category || "General";
		if (!acc[category]) acc[category] = [];
		acc[category].push(interest);
		return acc;
	}, {});
	const categories = Object.keys(categorized).sort((a, b) => {
		if (a === "interest") return -1;
		if (b === "interest") return 1;
		if (a === "behavior") return -1;
		if (b === "behavior") return 1;
		return a.localeCompare(b);
	});
	if (categories.length === 1 && (categories[0] === "General" || categories[0] === "interest")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-1.5",
		children: interests.map((interest) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceInterestBadge, {
			name: interest.name,
			removable,
			onRemove
		}, interest.id))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: categories.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1.5 text-xs font-medium text-muted-foreground",
			children: category
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-1.5",
			children: categorized[category].map((interest) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceInterestBadge, {
				name: interest.name,
				removable,
				onRemove
			}, interest.id))
		})] }, category))
	});
}
function AudienceInterestBadge({ name, removable, onRemove }) {
	const handleRemove = () => {
		onRemove(name);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: "outline",
		className: "group text-xs",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
				className: "mr-1 size-3 text-accent",
				"aria-hidden": true
			}),
			name,
			removable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: handleRemove,
				className: "ml-1 rounded-sm opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100",
				"aria-label": `Remove ${name}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
					className: "size-3",
					"aria-hidden": true
				})
			}) : null
		]
	});
}
function CampaignControlHeader({ icon: Icon, eyebrow = "Campaign settings", title, description, actions, stats, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
		className: cn("border-b border-border/50 pb-5", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-start gap-3.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: ADS_PAGE_THEME.controlHeaderIcon,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-5 text-primary",
							"aria-hidden": true
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 space-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: ADS_PAGE_THEME.sectionEyebrow,
								children: eyebrow
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-lg font-semibold tracking-tight",
								children: title
							}),
							description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-sm leading-relaxed",
								children: description
							}) : null
						]
					})]
				}), actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex shrink-0 flex-wrap items-center gap-2",
					children: actions
				}) : null]
			}), stats && stats.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2 sm:gap-3",
				children: stats.map((stat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: ADS_PAGE_THEME.controlStatChip,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: ADS_PAGE_THEME.controlStatChipLabel,
						children: stat.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: ADS_PAGE_THEME.controlStatChipValue,
						children: stat.value
					})]
				}, stat.label))
			}) : null]
		})
	});
}
function formatAgeRange(range) {
	return range.replace(/_/g, "-").replace("AGE", "").replace("RANGE", "").trim();
}
var GENDER_OPTIONS = [
	{
		value: "all",
		label: "All"
	},
	{
		value: "male",
		label: "Men"
	},
	{
		value: "female",
		label: "Women"
	}
];
function GenderOptionButton({ label, selected, value, onSelect }) {
	const handleSelect = () => {
		onSelect(value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		size: "sm",
		variant: selected ? "default" : "outline",
		className: "h-8",
		onClick: handleSelect,
		children: label
	});
}
function DemographicSection({ aggregatedData, expandedSections, toggleSection, editingSection, onToggleEditing, canEdit, draftDemographics, onDraftChange, onSaveDemographics, savingTargeting }) {
	const isEditing = editingSection === "demographics";
	const ageCount = aggregatedData.demographics.ageRanges.length;
	const genderCount = aggregatedData.demographics.genders.length;
	const langCount = aggregatedData.demographics.languages.length;
	const totalCount = ageCount + genderCount + langCount;
	const showPanel = totalCount > 0 || Boolean(canEdit);
	const handleToggleDemographics = () => {
		toggleSection("demographics");
	};
	const handleEditDemographics = (event) => {
		event.stopPropagation();
		onToggleEditing?.("demographics");
	};
	const handleSaveClick = () => {
		onSaveDemographics?.();
	};
	const handleAgeMinChange = (event) => {
		const value = Number(event.target.value);
		if (!onDraftChange || !draftDemographics) return;
		onDraftChange((prev) => ({
			...prev,
			ageMin: Number.isFinite(value) ? value : prev.ageMin
		}));
	};
	const handleAgeMaxChange = (event) => {
		const value = Number(event.target.value);
		if (!onDraftChange || !draftDemographics) return;
		onDraftChange((prev) => ({
			...prev,
			ageMax: Number.isFinite(value) ? value : prev.ageMax
		}));
	};
	const handleGenderSelect = (value) => {
		if (!onDraftChange || !draftDemographics) return;
		onDraftChange((prev) => ({
			...prev,
			genders: value === "all" ? [] : [value]
		}));
	};
	if (!showPanel) return null;
	const selectedGender = draftDemographics && draftDemographics.genders.length === 1 ? draftDemographics.genders[0] : "all";
	const editButton = canEdit && onToggleEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: isEditing ? "default" : "ghost",
			size: "icon",
			className: "size-8",
			onClick: handleEditDemographics,
			"aria-pressed": isEditing,
			"aria-label": "Edit demographics",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, {
				className: "size-3.5",
				"aria-hidden": true
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: isEditing ? "Exit demographic editing" : "Edit demographics" })] }) }) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TargetingCollapsiblePanel, {
		sectionId: "demographics",
		icon: Users,
		title: "Demographics",
		count: isEditing ? void 0 : totalCount,
		expanded: expandedSections.has("demographics"),
		onToggle: handleToggleDemographics,
		headerActions: editButton,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: isEditing && draftDemographics && onDraftChange ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "meta-age-min",
							className: "text-xs",
							children: "Min age"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "meta-age-min",
							type: "number",
							min: 13,
							max: 65,
							value: draftDemographics.ageMin,
							onChange: handleAgeMinChange,
							className: "h-9"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "meta-age-max",
							className: "text-xs",
							children: "Max age"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "meta-age-max",
							type: "number",
							min: 13,
							max: 65,
							value: draftDemographics.ageMax,
							onChange: handleAgeMaxChange,
							className: "h-9"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium text-muted-foreground",
						children: "Gender"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: GENDER_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GenderOptionButton, {
							label: option.label,
							value: option.value,
							selected: selectedGender === option.value,
							onSelect: handleGenderSelect
						}, option.value))
					})]
				}),
				onSaveDemographics ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					className: "w-full sm:w-auto",
					disabled: savingTargeting,
					onClick: handleSaveClick,
					children: savingTargeting ? "Saving…" : "Save to ad set"
				}) : null
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				ageCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1.5 text-xs font-medium text-muted-foreground",
					children: "Age ranges"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: aggregatedData.demographics.ageRanges.map((age) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "text-xs tabular-nums",
						children: formatAgeRange(age)
					}, `age-${age}`))
				})] }) : null,
				genderCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1.5 text-xs font-medium text-muted-foreground",
					children: "Gender"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: aggregatedData.demographics.genders.map((gender) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "text-xs capitalize",
						children: gender.toLowerCase()
					}, `gender-${gender}`))
				})] }) : null,
				langCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1.5 text-xs font-medium text-muted-foreground",
					children: "Languages"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: aggregatedData.demographics.languages.map((lang) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "text-xs",
						children: lang
					}, `lang-${lang}`))
				})] }) : null,
				totalCount === 0 && canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-xs text-muted-foreground",
					children: "No age or gender set. Use Edit to configure Meta demographics."
				}) : null
			] })
		})
	});
}
/** Meta `targeting.publisher_platforms` values. */
var META_PUBLISHER_PLATFORMS = [
	{
		id: "facebook",
		label: "Facebook"
	},
	{
		id: "instagram",
		label: "Instagram"
	},
	{
		id: "audience_network",
		label: "Audience Network"
	},
	{
		id: "messenger",
		label: "Messenger"
	}
];
var DEFAULT_META_PUBLISHER_PLATFORMS = [
	"facebook",
	"instagram",
	"audience_network",
	"messenger"
];
function PositionOptionButton({ option, active, onToggle }) {
	const handleToggle = () => {
		onToggle(option.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		size: "sm",
		variant: active ? "default" : "outline",
		className: "h-7 text-xs",
		onClick: handleToggle,
		children: option.label
	});
}
function PositionToggleGroup({ label, options, selected, onToggle }) {
	if (options.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PositionOptionButton, {
					option,
					active: selected.includes(option.id),
					onToggle
				}, option.id))
			}),
			selected.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-muted-foreground",
				children: "No restriction: Meta uses all positions for this surface."
			}) : null
		]
	});
}
function PublisherPlatformButton({ platform, active, onTogglePlatform }) {
	const handleToggle = () => {
		onTogglePlatform(platform.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		size: "sm",
		variant: active ? "default" : "outline",
		className: "h-8",
		onClick: handleToggle,
		children: platform.label
	});
}
function PlacementTargetingSection({ aggregatedData, expandedSections, toggleSection, editingSection, onToggleEditing, canEdit, draftPublisherPlatforms, draftPlacementDetail, onTogglePlatform, onTogglePlacementPosition, onSavePlacements, savingTargeting }) {
	const isEditing = editingSection === "placements";
	const displayPlatforms = draftPublisherPlatforms ?? (aggregatedData.placements.length > 0 ? aggregatedData.placements : []);
	const displayDetail = draftPlacementDetail ?? {
		facebookPositions: aggregatedData.metaPlacements.facebook,
		instagramPositions: aggregatedData.metaPlacements.instagram,
		audienceNetworkPositions: aggregatedData.metaPlacements.audienceNetwork,
		messengerPositions: aggregatedData.metaPlacements.messenger,
		devicePlatforms: aggregatedData.devices
	};
	const positionCount = displayDetail.facebookPositions.length + displayDetail.instagramPositions.length + displayDetail.audienceNetworkPositions.length + displayDetail.messengerPositions.length + displayDetail.devicePlatforms.length;
	const handleToggle = () => {
		toggleSection("placements");
	};
	const handleEdit = (event) => {
		event.stopPropagation();
		onToggleEditing?.("placements");
	};
	const handleSaveClick = () => {
		onSavePlacements?.();
	};
	const handleToggleFacebookPosition = (id) => onTogglePlacementPosition?.("facebookPositions", id);
	const handleToggleInstagramPosition = (id) => onTogglePlacementPosition?.("instagramPositions", id);
	const handleToggleAudienceNetworkPosition = (id) => onTogglePlacementPosition?.("audienceNetworkPositions", id);
	const handleToggleMessengerPosition = (id) => onTogglePlacementPosition?.("messengerPositions", id);
	const handleToggleDevicePlatform = (id) => onTogglePlacementPosition?.("devicePlatforms", id);
	if (!(displayPlatforms.length > 0 || positionCount > 0 || Boolean(canEdit))) return null;
	const editButton = canEdit && onToggleEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: isEditing ? "default" : "ghost",
			size: "icon",
			className: "size-8",
			onClick: handleEdit,
			"aria-pressed": isEditing,
			"aria-label": "Edit placements",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, {
				className: "size-3.5",
				"aria-hidden": true
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: isEditing ? "Exit placement editing" : "Edit placements" })] }) }) : null;
	const showFacebook = displayPlatforms.includes("facebook");
	const showInstagram = displayPlatforms.includes("instagram");
	const showAudienceNetwork = displayPlatforms.includes("audience_network");
	const showMessenger = displayPlatforms.includes("messenger");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TargetingCollapsiblePanel, {
		sectionId: "placements",
		icon: Globe,
		title: "Placements",
		count: isEditing ? void 0 : displayPlatforms.length + (positionCount > 0 ? positionCount : 0),
		expanded: expandedSections.has("placements"),
		onToggle: handleToggle,
		headerActions: editButton,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: isEditing && onTogglePlatform ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Choose publisher platforms, optional positions per surface, and device types. At least one platform is required."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium text-foreground",
						children: "Publisher platforms"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: META_PUBLISHER_PLATFORMS.map((platform) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublisherPlatformButton, {
							platform,
							active: displayPlatforms.includes(platform.id),
							onTogglePlatform
						}, platform.id))
					})]
				}),
				onTogglePlacementPosition ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 border-t border-border/60 pt-3",
					children: [
						showFacebook ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PositionToggleGroup, {
							label: "Facebook positions",
							options: META_FACEBOOK_POSITIONS,
							selected: displayDetail.facebookPositions,
							onToggle: handleToggleFacebookPosition
						}) : null,
						showInstagram ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PositionToggleGroup, {
							label: "Instagram positions",
							options: META_INSTAGRAM_POSITIONS,
							selected: displayDetail.instagramPositions,
							onToggle: handleToggleInstagramPosition
						}) : null,
						showAudienceNetwork ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PositionToggleGroup, {
							label: "Audience Network positions",
							options: META_AUDIENCE_NETWORK_POSITIONS,
							selected: displayDetail.audienceNetworkPositions,
							onToggle: handleToggleAudienceNetworkPosition
						}) : null,
						showMessenger ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PositionToggleGroup, {
							label: "Messenger positions",
							options: META_MESSENGER_POSITIONS,
							selected: displayDetail.messengerPositions,
							onToggle: handleToggleMessengerPosition
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PositionToggleGroup, {
							label: "Devices",
							options: META_DEVICE_PLATFORMS,
							selected: displayDetail.devicePlatforms,
							onToggle: handleToggleDevicePlatform
						})
					]
				}) : null,
				onSavePlacements ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					className: "w-full sm:w-auto",
					disabled: savingTargeting || displayPlatforms.length === 0,
					onClick: handleSaveClick,
					children: savingTargeting ? "Saving…" : "Save to ad set"
				}) : null
			] }) : displayPlatforms.length > 0 || positionCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					displayPlatforms.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: displayPlatforms.map((placement) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: "text-xs capitalize",
							children: placement.replace(/_/g, " ")
						}, placement))
					}) : null,
					displayDetail.facebookPositions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: ["Facebook: ", displayDetail.facebookPositions.join(", ")]
					}) : null,
					displayDetail.instagramPositions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: ["Instagram: ", displayDetail.instagramPositions.join(", ")]
					}) : null,
					displayDetail.devicePlatforms.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: ["Devices: ", displayDetail.devicePlatforms.join(", ")]
					}) : null
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: cn("text-center text-xs text-muted-foreground"),
				children: ["No placements configured.", canEdit ? " Use Edit to select platforms." : ""]
			})
		})
	});
}
function LocationTargetingSection({ targeting, aggregatedData, locationMarkers, selectedTargetingId, onTargetingChange, editingSection, onToggleEditing, workspaceId, clientId, canSearchGeo, onAddLocation, onRemoveLocation, onSaveLocations, savingTargeting }) {
	const [selectedLocation, setSelectedLocation] = (0, import_react.useState)(null);
	const isEditing = editingSection === "locations";
	const canEditLocations = Boolean(onAddLocation && onRemoveLocation);
	const handleToggleEditing = () => {
		onToggleEditing("locations");
	};
	const handleLocationSelect = (loc) => {
		setSelectedLocation(loc);
	};
	const handleGeoSelect = (item) => {
		if (!onAddLocation) {
			notifySuccess({
				title: "Geo target found",
				message: `${item.name} (${item.id}) — enable editing to add locations.`
			});
			return;
		}
		onAddLocation(item);
	};
	const locationSelectHandlers = Object.fromEntries(aggregatedData.locations.included.map((loc) => [loc.id, () => {
		const marker = locationMarkers.find((item) => item.id === loc.id);
		if (marker) setSelectedLocation(marker);
	}]));
	const locationRemoveHandlers = Object.fromEntries(aggregatedData.locations.included.map((loc) => [loc.id, (event) => {
		event.stopPropagation();
		if (isEditing && onRemoveLocation) {
			onRemoveLocation(loc.id);
			return;
		}
		notifySuccess({
			title: "Read-only geography",
			message: "Click Edit to remove locations from this ad set."
		});
	}]));
	const handleSaveLocationsClick = () => {
		onSaveLocations?.();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-1 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-8 shrink-0 items-center justify-center rounded-lg bg-info/10 ring-1 ring-info/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, {
								className: "size-4 text-info",
								"aria-hidden": true
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold tracking-tight text-foreground",
								children: "Geography"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									aggregatedData.locations.included.length,
									" included",
									aggregatedData.locations.excluded.length > 0 ? ` · ${aggregatedData.locations.excluded.length} excluded` : ""
								]
							})]
						})]
					}),
					targeting.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: selectedTargetingId,
						onValueChange: onTargetingChange,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-9 w-full min-w-[200px] max-w-[240px] sm:w-[220px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select ad set" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "All ad sets"
						}), targeting.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: item.entityId,
							children: item.entityName ?? item.entityId
						}, item.entityId))] })]
					}) : null,
					canEditLocations ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: isEditing ? "default" : "outline",
							size: "sm",
							className: "h-9 gap-1.5",
							onClick: handleToggleEditing,
							"aria-pressed": isEditing,
							"aria-label": "Edit locations",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, {
								className: "size-3.5",
								"aria-hidden": true
							}), isEditing ? "Done" : "Edit"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: isEditing ? "Exit location editing" : "Search and save geo targets to Meta" })] }) }) : null
				]
			}),
			isEditing && canSearchGeo && workspaceId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaTargetingSearchCombobox, {
				workspaceId,
				clientId,
				mode: "geolocations",
				placeholder: "Search countries, regions, cities…",
				disabled: savingTargeting,
				onSelect: handleGeoSelect
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: ADS_PAGE_THEME.controlMapFrame,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationMap, {
					locations: locationMarkers,
					height: "300px",
					interactive: isEditing,
					showSearch: isEditing,
					onLocationSelect: handleLocationSelect
				})
			}),
			aggregatedData.locations.included.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: aggregatedData.locations.included.map((loc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: selectedLocation?.id === loc.id ? "default" : "outline",
					className: cn("cursor-pointer text-xs transition-[box-shadow,opacity]", selectedLocation?.id === loc.id && "ring-2 ring-primary ring-offset-1"),
					onClick: locationSelectHandlers[loc.id],
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
							className: "mr-1 size-3 shrink-0",
							"aria-hidden": true
						}),
						loc.name,
						isEditing && onRemoveLocation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: locationRemoveHandlers[loc.id],
							className: "ml-1 rounded-sm p-0.5 hover:bg-destructive/15 hover:text-destructive",
							"aria-label": `Remove ${loc.name}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
								className: "size-3",
								"aria-hidden": true
							})
						}) : null
					]
				}, loc.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-center text-xs text-muted-foreground",
				children: isEditing ? "Search above to add countries, regions, or cities, then save to Meta." : "No location targeting configured for this view."
			}),
			isEditing && onSaveLocations ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end border-t border-border/60 pt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: handleSaveLocationsClick,
					disabled: savingTargeting,
					children: savingTargeting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "mr-2 size-4 animate-spin",
						"aria-hidden": true
					}), "Saving…"] }) : "Save locations to Meta"
				})
			}) : null
		]
	});
}
var EMAIL_LINE_PATTERN = /^[^\s@]+@[^\s@]+/;
function parseEmailLines(raw) {
	const seen = /* @__PURE__ */ new Set();
	const emails = [];
	for (const line of raw.split(/\r?\n/)) {
		const value = line.trim().toLowerCase();
		if (!value || !EMAIL_LINE_PATTERN.test(value)) continue;
		if (seen.has(value)) continue;
		seen.add(value);
		emails.push(value);
	}
	return emails;
}
function AudienceRemoveButton({ audienceId, audienceName, onRemove }) {
	const handleRemove = () => {
		onRemove(audienceId);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "ml-0.5 rounded-sm hover:text-destructive",
		"aria-label": `Remove ${audienceName}`,
		onClick: handleRemove,
		children: "×"
	});
}
function CustomAudiencesTargetingSection({ aggregatedData, expandedSections, toggleSection, editingSection, onToggleEditing, canEdit, workspaceId, clientId, onAddAudience, onRemoveAudience, onSaveTargeting, savingTargeting }) {
	const [catalog, dispatchCatalog] = (0, import_react.useReducer)((state, action) => action.value, {
		catalog: [],
		loading: false
	});
	const listAudiences = useAction(adsAudiencesApi.listAudiences);
	const uploadAudienceUsers = useAction(adsAudiencesApi.uploadAudienceUsers);
	const [uploadAudienceId, setUploadAudienceId] = (0, import_react.useState)("");
	const [uploadEmailsRaw, setUploadEmailsRaw] = (0, import_react.useState)("");
	const [uploadingUsers, setUploadingUsers] = (0, import_react.useState)(false);
	const isEditing = editingSection === "audiences";
	const included = aggregatedData.audiences.included;
	const handleToggle = () => toggleSection("audiences");
	const handleEdit = (event) => {
		event.stopPropagation();
		onToggleEditing("audiences");
	};
	(0, import_react.useEffect)(() => {
		if (!canEdit || !workspaceId || !isEditing) return;
		let cancelled = false;
		dispatchCatalog({
			type: "set",
			value: {
				catalog: [],
				loading: true
			}
		});
		listAudiences({
			workspaceId,
			providerId: "facebook",
			clientId: clientId ?? null
		}).then((rows) => {
			if (cancelled) return;
			dispatchCatalog({
				type: "set",
				value: {
					catalog: Array.isArray(rows) ? rows.map((row) => ({
						id: String(row.id),
						name: String(row.name)
					})) : [],
					loading: false
				}
			});
		}).catch((error) => {
			if (cancelled) return;
			reportConvexFailure({
				error,
				context: "CustomAudiencesTargetingSection:listAudiences",
				title: "Could not load custom audiences",
				fallbackMessage: "Could not load custom audiences"
			});
			dispatchCatalog({
				type: "set",
				value: {
					catalog: [],
					loading: false
				}
			});
		});
		return () => {
			cancelled = true;
		};
	}, [
		canEdit,
		clientId,
		isEditing,
		listAudiences,
		workspaceId
	]);
	const availableToAdd = catalog.catalog.filter((row) => !included.some((item) => item.id === row.id));
	const handleUploadEmailsChange = (event) => {
		setUploadEmailsRaw(event.target.value);
	};
	const handleUploadUsers = () => {
		if (!workspaceId || !uploadAudienceId) return;
		const emails = parseEmailLines(uploadEmailsRaw);
		if (emails.length === 0) {
			notifySuccess({
				title: "No valid emails",
				message: "Enter one email address per line."
			});
			return;
		}
		setUploadingUsers(true);
		uploadAudienceUsers({
			workspaceId,
			providerId: "facebook",
			clientId: clientId ?? null,
			audienceId: uploadAudienceId,
			emails
		}).then((result) => {
			notifySuccess({
				title: "Audience updated",
				message: `Meta received ${result.numReceived ?? emails.length} hashed email${emails.length === 1 ? "" : "s"}.`
			});
			setUploadEmailsRaw("");
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CustomAudiencesTargetingSection:uploadUsers",
				title: "Upload failed",
				fallbackMessage: "Could not upload emails to Meta."
			});
		}).finally(() => {
			setUploadingUsers(false);
		});
	};
	const handleAddAudienceSelect = (id) => {
		const row = catalog.catalog.find((item) => item.id === id);
		if (row) onAddAudience?.(row);
	};
	const handleSaveTargetingClick = () => {
		onSaveTargeting?.();
	};
	const editButton = canEdit && onAddAudience ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: "size-7",
			onClick: handleEdit,
			"aria-label": "Edit custom audiences",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, {
				className: "size-3.5",
				"aria-hidden": true
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: isEditing ? "Exit audience editing" : "Edit custom audiences" })] }) }) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TargetingCollapsiblePanel, {
		sectionId: "audiences",
		icon: UserCheck,
		title: "Custom audiences",
		count: included.length,
		expanded: expandedSections.has("audiences"),
		onToggle: handleToggle,
		headerActions: editButton,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [
				isEditing && canEdit && workspaceId ? catalog.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-4 animate-spin",
						"aria-hidden": true
					}), "Loading audiences…"]
				}) : availableToAdd.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					onValueChange: handleAddAudienceSelect,
					disabled: savingTargeting,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "h-9",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Add custom audience…" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: availableToAdd.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: row.id,
						children: row.name
					}, row.id)) })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: catalog.catalog.length === 0 ? "No custom audiences in this ad account. Create one with Create audience." : "All available audiences are already included."
				}) : null,
				included.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: included.map((audience) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "secondary",
						className: "gap-1 text-xs",
						children: [audience.name, isEditing && onRemoveAudience ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceRemoveButton, {
							audienceId: audience.id,
							audienceName: audience.name,
							onRemove: onRemoveAudience
						}) : null]
					}, audience.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: isEditing ? "Add custom audiences above, then save to Meta." : "No custom audiences on this ad set."
				}),
				isEditing && canEdit && workspaceId && catalog.catalog.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 rounded-lg border border-dashed border-border/60 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted-foreground",
							children: "Upload customer emails (hashed server-side)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "meta-upload-audience",
								className: "text-xs",
								children: "Audience"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: uploadAudienceId,
								onValueChange: setUploadAudienceId,
								disabled: uploadingUsers,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "meta-upload-audience",
									className: "h-9",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select audience to fill…" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: catalog.catalog.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: row.id,
									children: row.name
								}, row.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: uploadEmailsRaw,
							onChange: handleUploadEmailsChange,
							placeholder: "user@example.com\nanother@example.com",
							rows: 4,
							className: "text-sm",
							disabled: uploadingUsers
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: "secondary",
							disabled: uploadingUsers || !uploadAudienceId || !uploadEmailsRaw.trim(),
							onClick: handleUploadUsers,
							children: uploadingUsers ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "mr-2 size-4 animate-spin",
								"aria-hidden": true
							}), "Uploading…"] }) : "Upload emails to Meta"
						})
					]
				}) : null,
				isEditing && onSaveTargeting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end border-t border-border/60 pt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: handleSaveTargetingClick,
						disabled: savingTargeting,
						children: savingTargeting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "mr-2 size-4 animate-spin",
							"aria-hidden": true
						}), "Saving…"] }) : "Save audiences to Meta"
					})
				}) : null
			]
		})
	});
}
function AudienceControlHeaderActions({ loading, onOpenBuilder, onRefresh }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "outline",
		size: "sm",
		className: "gap-1.5",
		onClick: onOpenBuilder,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
			className: "size-4",
			"aria-hidden": true
		}), "Create audience"]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "icon",
		className: "size-9",
		onClick: onRefresh,
		disabled: loading,
		"aria-label": "Refresh audience targeting",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
			className: cn("size-4", loading && "animate-spin"),
			"aria-hidden": true
		})
	})] });
}
function AudienceControlLoadingCard() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.surfaceCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignControlHeader, {
			icon: Target,
			title: "Audience targeting",
			description: "Loading targeting from the ad platform…"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "pt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-5 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: cn(ADS_PAGE_THEME.controlMapFrame, "h-[300px]") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 rounded-xl" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 rounded-xl" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 rounded-xl" })
					]
				})]
			})
		})]
	});
}
function AudienceControlPreviewCard() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.surfaceCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignControlHeader, {
			icon: Target,
			title: "Audience targeting"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "pt-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn(ADS_PAGE_THEME.emptyState, "py-14"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: ADS_PAGE_THEME.controlHeaderIcon,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
							className: "size-5 text-muted-foreground",
							"aria-hidden": true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Preview mode"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-sm text-xs text-muted-foreground",
						children: "Enable live mode to load geography, demographics, and audiences from your ad account."
					})
				]
			})
		})]
	});
}
function AudienceControlEmptyCard({ builderOpen, headerActionsProps, onBuilderOpenChange, providerId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.surfaceCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignControlHeader, {
			icon: Target,
			title: "Audience targeting",
			description: "No targeting data returned for this campaign yet.",
			actions: (0, import_react.createElement)(AudienceControlHeaderActionsSlot, headerActionsProps)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "pt-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn(ADS_PAGE_THEME.emptyState, "py-14"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: ADS_PAGE_THEME.controlHeaderIcon,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
							className: "size-5 text-primary",
							"aria-hidden": true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "No targeting configured"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-sm text-xs text-muted-foreground",
						children: "Create a custom audience or confirm ad sets have location and interest criteria on the platform."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceBuilderDialog, {
				isOpen: builderOpen,
				onOpenChange: onBuilderOpenChange,
				providerId
			})]
		})]
	});
}
function AudienceControlExcludedLocations({ excludedLocations }) {
	if (excludedLocations.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-destructive/20 bg-destructive/[0.04] px-5 py-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
					className: "size-4 text-destructive",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-medium text-foreground",
					children: "Excluded locations"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					className: "border-destructive/30 text-xs text-destructive",
					children: excludedLocations.length
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-1.5",
			children: excludedLocations.map((loc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "destructive",
				className: "text-xs",
				children: loc.name
			}, loc.id))
		})]
	});
}
function AudienceControlMainCard({ targeting, insights, aggregatedData, locationMarkers, selectedTargetingId, expandedSections, geocodeFailedNames, audienceStats, headerActionsProps, interestSectionProps, customAudiencesSectionProps, builderOpen, providerId, workspaceId, clientId, canEditMetaTargeting, editingSection, onTargetingChange, onToggleEditing, onToggleSection, onBuilderOpenChange, onAddLocation, onRemoveLocation, onSaveLocations, onSaveDemographics, onDraftDemographicsChange, draftDemographics, draftPlacements, draftPlacementDetail, onSavePlacements, onTogglePlatform, onTogglePlacementPosition, savingTargeting, campaignObjective }) {
	const entityCount = insights?.totalEntities ?? targeting.length;
	const metaUi = resolveMetaCampaignUiVisibility({
		campaignObjective,
		scope: "campaign"
	});
	const showPlacementSection = canEditMetaTargeting && metaUi.showPlacementTargeting;
	const showCustomAudiences = canEditMetaTargeting && metaUi.showCustomAudiences;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.surfaceCard,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignControlHeader, {
				icon: Target,
				title: "Audience targeting",
				description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					entityCount,
					" configuration",
					entityCount === 1 ? "" : "s",
					" across ad sets - map, demographics, and segments in one view."
				] }),
				actions: (0, import_react.createElement)(AudienceControlHeaderActionsSlot, headerActionsProps),
				stats: audienceStats
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-6 pt-6",
				children: [
					geocodeFailedNames.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
						variant: "default",
						className: "border-warning/40 bg-warning/10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 text-warning" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Some locations could not be placed on the map" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, { children: [
								"The map may be incomplete for: ",
								geocodeFailedNames.join(", "),
								". Check spelling or try a broader place name."
							] })
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn(ADS_PAGE_THEME.controlFormPanel, "p-5"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationTargetingSection, {
								targeting,
								aggregatedData,
								locationMarkers,
								selectedTargetingId,
								onTargetingChange,
								editingSection,
								onToggleEditing,
								workspaceId,
								clientId,
								canSearchGeo: canEditMetaTargeting,
								onAddLocation,
								onRemoveLocation,
								onSaveLocations: canEditMetaTargeting && editingSection === "locations" ? onSaveLocations : void 0,
								savingTargeting
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: cn(ADS_PAGE_THEME.controlSectionLabel, "px-0.5"),
									children: "Segments & criteria"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemographicSection, {
									aggregatedData,
									expandedSections,
									toggleSection: onToggleSection,
									editingSection,
									onToggleEditing,
									canEdit: canEditMetaTargeting,
									draftDemographics,
									onDraftChange: canEditMetaTargeting ? onDraftDemographicsChange : void 0,
									onSaveDemographics: canEditMetaTargeting && editingSection === "demographics" ? onSaveDemographics : void 0,
									savingTargeting
								}),
								showPlacementSection ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlacementTargetingSection, {
									aggregatedData,
									expandedSections,
									toggleSection: onToggleSection,
									editingSection,
									onToggleEditing,
									canEdit: canEditMetaTargeting,
									draftPublisherPlatforms: draftPlacements,
									draftPlacementDetail,
									onTogglePlatform,
									onTogglePlacementPosition,
									onSavePlacements: editingSection === "placements" ? onSavePlacements : void 0,
									savingTargeting
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceDisplaySection, {
									aggregatedData,
									expandedSections,
									toggleSection: onToggleSection,
									hidePlacements: showPlacementSection,
									customAudiencesSection: showCustomAudiences ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomAudiencesTargetingSection, { ...customAudiencesSectionProps }) : void 0,
									interestSection: (0, import_react.createElement)(AudienceControlInterestSectionSlot, interestSectionProps)
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceControlExcludedLocations, { excludedLocations: aggregatedData.locations.excluded })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceBuilderDialog, {
				isOpen: builderOpen,
				onOpenChange: onBuilderOpenChange,
				providerId
			})
		]
	});
}
function AudienceControlInterestEditorSection({ aggregatedData, expandedSections, toggleSection, editingSection, onToggleEditing, canEditMetaTargeting, workspaceId, clientId, onAddInterest, onRemoveInterest, onSaveTargeting, savingTargeting }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceEditorSection, {
		aggregatedData,
		expandedSections,
		toggleSection,
		editingSection,
		onToggleEditing,
		canEditTargeting: canEditMetaTargeting,
		workspaceId,
		clientId,
		onAddInterest,
		onRemoveInterest,
		onSaveTargeting,
		savingTargeting
	});
}
function aggregateAudienceTargetingData(visibleTargeting) {
	const demographics = {
		ageRanges: /* @__PURE__ */ new Set(),
		genders: /* @__PURE__ */ new Set(),
		languages: /* @__PURE__ */ new Set()
	};
	const audiences = {
		included: /* @__PURE__ */ new Map(),
		excluded: /* @__PURE__ */ new Map()
	};
	const locations = {
		included: /* @__PURE__ */ new Map(),
		excluded: /* @__PURE__ */ new Map()
	};
	const interests = /* @__PURE__ */ new Map();
	const keywords = /* @__PURE__ */ new Map();
	const devices = /* @__PURE__ */ new Set();
	const placements = /* @__PURE__ */ new Set();
	const metaPlacements = {
		facebook: /* @__PURE__ */ new Set(),
		instagram: /* @__PURE__ */ new Set(),
		audienceNetwork: /* @__PURE__ */ new Set(),
		messenger: /* @__PURE__ */ new Set()
	};
	const professional = {
		industries: /* @__PURE__ */ new Map(),
		jobTitles: /* @__PURE__ */ new Map()
	};
	visibleTargeting.forEach((t) => {
		t.demographics.ageRanges.forEach((a) => demographics.ageRanges.add(a));
		t.demographics.genders.forEach((g) => demographics.genders.add(g));
		t.demographics.languages.forEach((l) => demographics.languages.add(l));
		t.audiences.included.forEach((a) => audiences.included.set(a.id, a));
		t.audiences.excluded.forEach((a) => audiences.excluded.set(a.id, a));
		t.locations.included.forEach((l) => locations.included.set(l.id, l));
		t.locations.excluded.forEach((l) => locations.excluded.set(l.id, l));
		t.interests.forEach((i) => interests.set(i.id, i));
		t.keywords.forEach((k) => keywords.set(k.text, k));
		t.devices.forEach((d) => devices.add(d));
		t.placements.forEach((p) => placements.add(p));
		if (t.metaPlacements) {
			t.metaPlacements.facebook?.forEach((p) => metaPlacements.facebook.add(p));
			t.metaPlacements.instagram?.forEach((p) => metaPlacements.instagram.add(p));
			t.metaPlacements.audienceNetwork?.forEach((p) => metaPlacements.audienceNetwork.add(p));
			t.metaPlacements.messenger?.forEach((p) => metaPlacements.messenger.add(p));
		}
		if (t.professional) {
			t.professional.industries.forEach((i) => professional.industries.set(i.id, i));
			t.professional.jobTitles.forEach((j) => professional.jobTitles.set(j.id, j));
		}
	});
	return {
		demographics: {
			ageRanges: Array.from(demographics.ageRanges),
			genders: Array.from(demographics.genders),
			languages: Array.from(demographics.languages)
		},
		audiences: {
			included: Array.from(audiences.included.values()),
			excluded: Array.from(audiences.excluded.values())
		},
		locations: {
			included: Array.from(locations.included.values()),
			excluded: Array.from(locations.excluded.values())
		},
		interests: Array.from(interests.values()),
		keywords: Array.from(keywords.values()),
		devices: Array.from(devices),
		placements: Array.from(placements),
		metaPlacements: {
			facebook: Array.from(metaPlacements.facebook),
			instagram: Array.from(metaPlacements.instagram),
			audienceNetwork: Array.from(metaPlacements.audienceNetwork),
			messenger: Array.from(metaPlacements.messenger)
		},
		professional: {
			industries: Array.from(professional.industries.values()),
			jobTitles: Array.from(professional.jobTitles.values())
		}
	};
}
var LOCATION_COORDINATES = {
	"united states": {
		lat: 39.8283,
		lng: -98.5795
	},
	"usa": {
		lat: 39.8283,
		lng: -98.5795
	},
	"us": {
		lat: 39.8283,
		lng: -98.5795
	},
	"united kingdom": {
		lat: 55.3781,
		lng: -3.436
	},
	"uk": {
		lat: 55.3781,
		lng: -3.436
	},
	"great britain": {
		lat: 55.3781,
		lng: -3.436
	},
	"canada": {
		lat: 56.1304,
		lng: -106.3468
	},
	"australia": {
		lat: -25.2744,
		lng: 133.7751
	},
	"germany": {
		lat: 51.1657,
		lng: 10.4515
	},
	"france": {
		lat: 46.2276,
		lng: 2.2137
	},
	"spain": {
		lat: 40.4637,
		lng: -3.7492
	},
	"italy": {
		lat: 41.8719,
		lng: 12.5674
	},
	"india": {
		lat: 20.5937,
		lng: 78.9629
	},
	"japan": {
		lat: 36.2048,
		lng: 138.2529
	},
	"brazil": {
		lat: -14.235,
		lng: -51.9253
	},
	"mexico": {
		lat: 23.6345,
		lng: -102.5528
	},
	"china": {
		lat: 35.8617,
		lng: 104.1954
	},
	"new york": {
		lat: 40.7128,
		lng: -74.006
	},
	"los angeles": {
		lat: 34.0522,
		lng: -118.2437
	},
	"london": {
		lat: 51.5074,
		lng: -.1278
	},
	"paris": {
		lat: 48.8566,
		lng: 2.3522
	},
	"tokyo": {
		lat: 35.6762,
		lng: 139.6503
	},
	"sydney": {
		lat: -33.8688,
		lng: 151.2093
	},
	"berlin": {
		lat: 52.52,
		lng: 13.405
	},
	"singapore": {
		lat: 1.3521,
		lng: 103.8198
	},
	"dubai": {
		lat: 25.2048,
		lng: 55.2708
	},
	"hong kong": {
		lat: 22.3193,
		lng: 114.1694
	},
	"netherlands": {
		lat: 52.1326,
		lng: 5.2913
	},
	"beijing": {
		lat: 39.9042,
		lng: 116.4074
	},
	"sweden": {
		lat: 60.1282,
		lng: 18.6435
	},
	"belgium": {
		lat: 50.5039,
		lng: 4.4699
	},
	"austria": {
		lat: 47.5162,
		lng: 14.5501
	},
	"denmark": {
		lat: 56.2639,
		lng: 9.5018
	},
	"finland": {
		lat: 61.9241,
		lng: 25.7482
	},
	"norway": {
		lat: 60.472,
		lng: 8.4689
	},
	"portugal": {
		lat: 39.3999,
		lng: -8.2245
	},
	"greece": {
		lat: 39.0742,
		lng: 21.8243
	},
	"mexico city": {
		lat: 19.4326,
		lng: -99.1332
	},
	"sao paulo": {
		lat: -23.5505,
		lng: -46.6333
	},
	"buenos aires": {
		lat: -34.6037,
		lng: -58.3816
	},
	"bangkok": {
		lat: 13.7563,
		lng: 100.5018
	},
	"jakarta": {
		lat: -6.2088,
		lng: 106.8456
	},
	"manila": {
		lat: 14.5995,
		lng: 120.9842
	},
	"uae": {
		lat: 23.4241,
		lng: 53.8478
	},
	"vietnam": {
		lat: 14.0583,
		lng: 108.2772
	},
	"nigeria": {
		lat: 9.082,
		lng: 8.6753
	},
	"egypt": {
		lat: 26.8206,
		lng: 30.8025
	},
	"saudi arabia": {
		lat: 23.8859,
		lng: 45.0792
	},
	"south africa": {
		lat: -30.5595,
		lng: 22.9375
	},
	"russia": {
		lat: 61.524,
		lng: 105.3188
	},
	"south korea": {
		lat: 35.9078,
		lng: 127.7669
	},
	"turkey": {
		lat: 38.9637,
		lng: 35.2433
	},
	"colombia": {
		lat: 4.5709,
		lng: -74.2973
	},
	"thailand": {
		lat: 15.87,
		lng: 100.9925
	},
	"malaysia": {
		lat: 4.2105,
		lng: 101.9758
	},
	"new zealand": {
		lat: -40.9006,
		lng: 174.886
	},
	"liverpool": {
		lat: 53.4084,
		lng: -2.9916
	},
	"manchester": {
		lat: 53.4808,
		lng: -2.2426
	},
	"birmingham": {
		lat: 52.4862,
		lng: -1.8904
	}
};
var LOCATION_KEYS_BY_LENGTH = Object.keys(LOCATION_COORDINATES).sort((a, b) => b.length - a.length);
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function containsLocationTerm(text, term) {
	return new RegExp(escapeRegExp(term)).test(text);
}
function findFuzzyLocationCoordinates(normalizedName) {
	for (const key of LOCATION_KEYS_BY_LENGTH) {
		if (!containsLocationTerm(normalizedName, key)) continue;
		const coords = LOCATION_COORDINATES[key];
		if (coords) return coords;
	}
	for (const key of LOCATION_KEYS_BY_LENGTH) {
		if (!containsLocationTerm(key, normalizedName)) continue;
		const coords = LOCATION_COORDINATES[key];
		if (coords) return coords;
	}
	return null;
}
function findLocationCoordinates(name) {
	const normalizedName = name.toLowerCase().trim();
	if (LOCATION_COORDINATES[normalizedName]) return LOCATION_COORDINATES[normalizedName];
	const mapped = {
		emirates: "uae",
		"united arab emirates": "uae",
		"kingdom of saudi arabia": "saudi arabia",
		"republic of korea": "south korea",
		"korea, south": "south korea",
		british: "united kingdom",
		england: "united kingdom"
	}[normalizedName];
	if (mapped && LOCATION_COORDINATES[mapped]) return LOCATION_COORDINATES[mapped];
	return findFuzzyLocationCoordinates(normalizedName);
}
function buildAudienceLocationMarkers(visibleTargeting, resolvedCoordinates) {
	const markers = [];
	visibleTargeting.forEach((t) => {
		t.locations.included.forEach((loc) => {
			const nameKey = loc.name.toLowerCase().trim();
			const coords = loc.lat && loc.lng ? {
				lat: loc.lat,
				lng: loc.lng
			} : LOCATION_COORDINATES[nameKey] || resolvedCoordinates[nameKey] || findLocationCoordinates(loc.name);
			if (coords) markers.push({
				id: loc.id,
				name: loc.name,
				lat: coords.lat,
				lng: coords.lng,
				type: loc.type
			});
		});
	});
	return markers;
}
var DEFAULT_EXPANDED_SECTIONS = new Set([
	"demographics",
	"locations",
	"interests",
	"placements"
]);
function createInitialAudienceControlSectionState() {
	return {
		targeting: [],
		insights: null,
		loading: true,
		expandedSections: DEFAULT_EXPANDED_SECTIONS,
		builderOpen: false,
		hasLoaded: false,
		editingSection: null,
		selectedTargetingId: "all",
		draftInterests: null,
		draftLocations: null,
		draftAudiences: null,
		draftDemographics: null,
		draftPlacements: null,
		draftPlacementDetail: null,
		savingTargeting: false
	};
}
function audienceControlSectionReducer(state, action) {
	switch (action.type) {
		case "setTargeting": return {
			...state,
			targeting: action.value
		};
		case "setInsights": return {
			...state,
			insights: action.value
		};
		case "setLoading": return {
			...state,
			loading: action.value
		};
		case "setExpandedSections": return {
			...state,
			expandedSections: action.value
		};
		case "toggleSection": {
			const next = new Set(state.expandedSections);
			if (next.has(action.section)) next.delete(action.section);
			else next.add(action.section);
			return {
				...state,
				expandedSections: next
			};
		}
		case "setBuilderOpen": return {
			...state,
			builderOpen: action.value
		};
		case "setHasLoaded": return {
			...state,
			hasLoaded: action.value
		};
		case "setEditingSection": return {
			...state,
			editingSection: action.value
		};
		case "toggleEditing": return {
			...state,
			editingSection: state.editingSection === action.section ? null : action.section
		};
		case "setSelectedTargetingId": return {
			...state,
			selectedTargetingId: action.value
		};
		case "setDraftInterests": return {
			...state,
			draftInterests: action.value
		};
		case "updateDraftInterests": return {
			...state,
			draftInterests: action.updater(state.draftInterests)
		};
		case "setDraftLocations": return {
			...state,
			draftLocations: action.value
		};
		case "updateDraftLocations": return {
			...state,
			draftLocations: action.updater(state.draftLocations)
		};
		case "setDraftAudiences": return {
			...state,
			draftAudiences: action.value
		};
		case "updateDraftAudiences": return {
			...state,
			draftAudiences: action.updater(state.draftAudiences)
		};
		case "setDraftDemographics": return {
			...state,
			draftDemographics: action.value
		};
		case "updateDraftDemographics": return {
			...state,
			draftDemographics: action.updater(state.draftDemographics)
		};
		case "setDraftPlacements": return {
			...state,
			draftPlacements: action.value
		};
		case "updateDraftPlacements": return {
			...state,
			draftPlacements: action.updater(state.draftPlacements)
		};
		case "setDraftPlacementDetail": return {
			...state,
			draftPlacementDetail: action.value
		};
		case "updateDraftPlacementDetail": return {
			...state,
			draftPlacementDetail: action.updater(state.draftPlacementDetail)
		};
		case "setSavingTargeting": return {
			...state,
			savingTargeting: action.value
		};
		case "applyTargetingFetch": {
			const nextTargeting = action.targeting;
			let selectedTargetingId = state.selectedTargetingId;
			if (nextTargeting.length <= 1) selectedTargetingId = "all";
			else if (selectedTargetingId === "all") selectedTargetingId = (typeof nextTargeting[0]?.entityId === "string" ? nextTargeting[0].entityId : null) ?? selectedTargetingId;
			return {
				...state,
				targeting: nextTargeting,
				insights: action.insights,
				hasLoaded: true,
				selectedTargetingId
			};
		}
		default: return state;
	}
}
function mapMetaExcludedLocations(excluded) {
	return excluded.map((loc) => ({
		id: loc.id,
		name: loc.name,
		type: "country"
	}));
}
function buildBaseMetaTargetingPayload(aggregatedData, audiences) {
	return {
		demographics: aggregatedData.demographics,
		locations: {
			included: aggregatedData.locations.included,
			excluded: mapMetaExcludedLocations(aggregatedData.locations.excluded)
		},
		interests: aggregatedData.interests,
		audiences
	};
}
async function persistAdSetTargeting({ canEditMetaTargeting, workspaceId, activeAdSetId, clientId, updateAdSetTargeting, fetchTargeting, dispatch, selectAdSetDescription, successDescription, logContext, targeting, clearDrafts }) {
	if (!canEditMetaTargeting || !workspaceId || !activeAdSetId) {
		notifySuccess({
			title: "Select an ad set",
			message: selectAdSetDescription
		});
		return false;
	}
	dispatch({
		type: "setSavingTargeting",
		value: true
	});
	try {
		await updateAdSetTargeting({
			workspaceId,
			providerId: "facebook",
			clientId: clientId ?? null,
			adSetId: activeAdSetId,
			targeting
		});
		notifySuccess({
			title: "Targeting saved",
			message: successDescription
		});
		clearDrafts();
		dispatch({
			type: "setEditingSection",
			value: null
		});
		await fetchTargeting();
		return true;
	} catch (error) {
		logError(error, logContext);
		notifyFailure({
			title: "Could not save targeting",
			message: "Check Meta permissions and try again."
		});
		return false;
	} finally {
		dispatch({
			type: "setSavingTargeting",
			value: false
		});
	}
}
function useAudienceControlTargetingHandlers({ dispatch, aggregatedData, drafts: { draftInterests, draftLocations, draftAudiences, draftDemographics, draftPlacements, draftPlacementDetail, editingSection }, canEditMetaTargeting, workspaceId, activeAdSetId, clientId, updateAdSetTargeting, fetchTargeting }) {
	const audiencesForPayload = draftAudiences ?? aggregatedData.audiences;
	const handleToggleEditing = (section) => {
		if (section === "demographics" && editingSection !== "demographics" && !draftDemographics) dispatch({
			type: "setDraftDemographics",
			value: {
				ageMin: 18,
				ageMax: 65,
				genders: aggregatedData.demographics.genders.map((gender) => gender.toLowerCase())
			}
		});
		if (section === "placements" && editingSection !== "placements" && !draftPlacements) dispatch({
			type: "setDraftPlacements",
			value: aggregatedData.placements.length > 0 ? [...aggregatedData.placements] : [...DEFAULT_META_PUBLISHER_PLATFORMS]
		});
		if (section === "placements" && editingSection !== "placements" && !draftPlacementDetail) dispatch({
			type: "setDraftPlacementDetail",
			value: buildPlacementDetailDraftFromSource(aggregatedData)
		});
		dispatch({
			type: "toggleEditing",
			section
		});
	};
	const handlePersistInterests = async () => {
		await persistAdSetTargeting({
			canEditMetaTargeting,
			workspaceId,
			activeAdSetId,
			clientId,
			updateAdSetTargeting,
			fetchTargeting,
			dispatch,
			selectAdSetDescription: "Choose a single ad set before saving interest targeting.",
			successDescription: "Interests updated on the ad set in Meta.",
			logContext: "AudienceControlSection:saveTargeting",
			targeting: buildMetaTargetingFromNormalized({
				...buildBaseMetaTargetingPayload(aggregatedData, audiencesForPayload),
				interests: draftInterests ?? aggregatedData.interests
			}),
			clearDrafts: () => {
				dispatch({
					type: "setDraftInterests",
					value: null
				});
			}
		});
	};
	const handleAddInterestDraft = (interest) => {
		dispatch({
			type: "updateDraftInterests",
			updater: (prev) => {
				const base = prev ?? aggregatedData.interests;
				if (base.some((item) => item.id === interest.id || item.name === interest.name)) return base;
				return [...base, interest];
			}
		});
	};
	const handleRemoveInterestDraft = (interestName) => {
		dispatch({
			type: "updateDraftInterests",
			updater: (prev) => {
				return (prev ?? aggregatedData.interests).filter((item) => item.name !== interestName);
			}
		});
	};
	const handleAddLocationDraft = (item) => {
		dispatch({
			type: "updateDraftLocations",
			updater: (prev) => {
				const base = prev ?? {
					included: aggregatedData.locations.included,
					excluded: aggregatedData.locations.excluded
				};
				if (base.included.some((loc) => loc.id === item.id)) return base;
				return {
					...base,
					included: [...base.included, {
						id: item.id,
						name: item.name,
						type: normalizeMetaGeoLocationType(item.type)
					}]
				};
			}
		});
	};
	const handleRemoveLocationDraft = (locationId) => {
		dispatch({
			type: "updateDraftLocations",
			updater: (prev) => {
				const base = prev ?? {
					included: aggregatedData.locations.included,
					excluded: aggregatedData.locations.excluded
				};
				return {
					...base,
					included: base.included.filter((loc) => loc.id !== locationId)
				};
			}
		});
	};
	const handlePersistLocations = async () => {
		const nextLocations = draftLocations ?? aggregatedData.locations;
		await persistAdSetTargeting({
			canEditMetaTargeting,
			workspaceId,
			activeAdSetId,
			clientId,
			updateAdSetTargeting,
			fetchTargeting,
			dispatch,
			selectAdSetDescription: "Choose a single ad set before saving location targeting.",
			successDescription: "Locations updated on the ad set in Meta.",
			logContext: "AudienceControlSection:saveLocations",
			targeting: buildMetaTargetingFromNormalized({
				...buildBaseMetaTargetingPayload(aggregatedData, audiencesForPayload),
				locations: {
					included: nextLocations.included,
					excluded: nextLocations.excluded.map((loc) => ({
						id: loc.id,
						name: loc.name,
						type: "country"
					}))
				}
			}),
			clearDrafts: () => {
				dispatch({
					type: "setDraftLocations",
					value: null
				});
			}
		});
	};
	const handleAddAudienceDraft = (audience) => {
		dispatch({
			type: "updateDraftAudiences",
			updater: (prev) => {
				const base = prev ?? aggregatedData.audiences;
				if (base.included.some((item) => item.id === audience.id)) return base;
				return {
					...base,
					included: [...base.included, {
						...audience,
						type: "custom"
					}]
				};
			}
		});
	};
	const handleRemoveAudienceDraft = (audienceId) => {
		dispatch({
			type: "updateDraftAudiences",
			updater: (prev) => {
				const base = prev ?? aggregatedData.audiences;
				return {
					...base,
					included: base.included.filter((item) => item.id !== audienceId)
				};
			}
		});
	};
	const handlePersistAudiences = async () => {
		await persistAdSetTargeting({
			canEditMetaTargeting,
			workspaceId,
			activeAdSetId,
			clientId,
			updateAdSetTargeting,
			fetchTargeting,
			dispatch,
			selectAdSetDescription: "Choose a single ad set before saving custom audiences.",
			successDescription: "Custom audiences updated on the ad set in Meta.",
			logContext: "AudienceControlSection:saveAudiences",
			targeting: buildMetaTargetingFromNormalized({ ...buildBaseMetaTargetingPayload(aggregatedData, draftAudiences ?? aggregatedData.audiences) }),
			clearDrafts: () => {
				dispatch({
					type: "setDraftAudiences",
					value: null
				});
			}
		});
	};
	const handlePersistDemographics = async () => {
		const next = draftDemographics ?? {
			ageMin: 18,
			ageMax: 65,
			genders: aggregatedData.demographics.genders.map((gender) => gender.toLowerCase())
		};
		await persistAdSetTargeting({
			canEditMetaTargeting,
			workspaceId,
			activeAdSetId,
			clientId,
			updateAdSetTargeting,
			fetchTargeting,
			dispatch,
			selectAdSetDescription: "Choose a single ad set before saving demographic targeting.",
			successDescription: "Demographics updated on the ad set in Meta.",
			logContext: "AudienceControlSection:saveDemographics",
			targeting: buildMetaTargetingFromNormalized({
				...buildBaseMetaTargetingPayload(aggregatedData, audiencesForPayload),
				demographics: {
					ageRanges: aggregatedData.demographics.ageRanges,
					genders: next.genders,
					ageMin: Math.min(next.ageMin, next.ageMax),
					ageMax: Math.max(next.ageMin, next.ageMax)
				}
			}),
			clearDrafts: () => {
				dispatch({
					type: "setDraftDemographics",
					value: null
				});
			}
		});
	};
	const handlePersistPlacements = async () => {
		const nextPlatforms = draftPlacements ?? (aggregatedData.placements.length > 0 ? aggregatedData.placements : [...DEFAULT_META_PUBLISHER_PLATFORMS]);
		const nextPlacementDetail = draftPlacementDetail ?? buildPlacementDetailDraftFromSource(aggregatedData);
		if (nextPlatforms.length === 0) {
			notifyFailure({
				title: "Select at least one platform",
				message: "Meta requires one publisher platform."
			});
			return;
		}
		await persistAdSetTargeting({
			canEditMetaTargeting,
			workspaceId,
			activeAdSetId,
			clientId,
			updateAdSetTargeting,
			fetchTargeting,
			dispatch,
			selectAdSetDescription: "Choose a single ad set before saving placement targeting.",
			successDescription: "Placements updated on the ad set in Meta.",
			logContext: "AudienceControlSection:savePlacements",
			targeting: buildMetaTargetingFromNormalized({
				...buildBaseMetaTargetingPayload(aggregatedData, audiencesForPayload),
				demographics: {
					ageRanges: aggregatedData.demographics.ageRanges,
					genders: aggregatedData.demographics.genders
				},
				publisherPlatforms: nextPlatforms,
				placementDetail: nextPlacementDetail
			}),
			clearDrafts: () => {
				dispatch({
					type: "setDraftPlacements",
					value: null
				});
				dispatch({
					type: "setDraftPlacementDetail",
					value: null
				});
			}
		});
	};
	const handleTogglePlatformDraft = (platformId) => {
		dispatch({
			type: "updateDraftPlacements",
			updater: (prev) => {
				const base = prev ?? (aggregatedData.placements.length > 0 ? aggregatedData.placements : [...DEFAULT_META_PUBLISHER_PLATFORMS]);
				const next = base.includes(platformId) ? base.filter((item) => item !== platformId) : [...base, platformId];
				return next.length > 0 ? next : base;
			}
		});
	};
	const handleTogglePlacementPositionDraft = (field, positionId) => {
		dispatch({
			type: "updateDraftPlacementDetail",
			updater: (prev) => {
				const base = prev ?? buildPlacementDetailDraftFromSource(aggregatedData);
				return {
					...base,
					[field]: togglePlacementDraftValue(base[field], positionId)
				};
			}
		});
	};
	const handleDraftDemographicsChange = (updater) => {
		dispatch({
			type: "updateDraftDemographics",
			updater: (prev) => {
				return updater(prev ?? {
					ageMin: 18,
					ageMax: 65,
					genders: aggregatedData.demographics.genders.map((gender) => gender.toLowerCase())
				});
			}
		});
	};
	return {
		handleToggleEditing,
		handlePersistInterests,
		handleAddInterestDraft,
		handleRemoveInterestDraft,
		handleAddLocationDraft,
		handleRemoveLocationDraft,
		handlePersistLocations,
		handleAddAudienceDraft,
		handleRemoveAudienceDraft,
		handlePersistAudiences,
		handlePersistDemographics,
		handlePersistPlacements,
		handleTogglePlatformDraft,
		handleTogglePlacementPositionDraft,
		handleDraftDemographicsChange
	};
}
function useAudienceControlSection({ providerId, campaignId, clientId, isPreviewMode }) {
	const { user } = useAuth();
	const getTargeting = useAction(adsTargetingApi.getTargeting);
	const updateAdSetTargeting = useAction(adsAdSetsApi.updateAdSetTargeting);
	const canEditMetaTargeting = toAdsProviderId(providerId) === "facebook" && !isPreviewMode;
	const [state, dispatch] = (0, import_react.useReducer)(audienceControlSectionReducer, void 0, createInitialAudienceControlSectionState);
	const { targeting, insights, loading, expandedSections, builderOpen, hasLoaded, editingSection, selectedTargetingId, draftInterests, draftLocations, draftAudiences, draftDemographics, draftPlacements, draftPlacementDetail, savingTargeting } = state;
	const canLoad = !isPreviewMode;
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const unknownLocationNames = (() => {
		const unknowns = [];
		targeting.forEach((t) => {
			t.locations.included.forEach((loc) => {
				if (!LOCATION_COORDINATES[loc.name.toLowerCase().trim()] && !findLocationCoordinates(loc.name) && !(loc.lat && loc.lng)) unknowns.push(loc.name);
			});
		});
		return [...new Set(unknowns)];
	})();
	const { data: geocodeBatch } = useGeocodeResolveBatch(unknownLocationNames, { enabled: unknownLocationNames.length > 0 && hasLoaded });
	const resolvedCoordinates = geocodeBatch?.coordinates ?? {};
	const geocodeFailedNames = geocodeBatch?.failedNames ?? [];
	const fetchTargeting = (0, import_react.useEffectEvent)(async () => {
		if (!canLoad) {
			dispatch({
				type: "setLoading",
				value: false
			});
			return;
		}
		if (!workspaceId) {
			notifyFailure({
				title: "Error",
				message: "Missing workspace id"
			});
			dispatch({
				type: "setLoading",
				value: false
			});
			return;
		}
		dispatch({
			type: "setLoading",
			value: true
		});
		getTargeting({
			workspaceId,
			providerId: toAdsProviderId(providerId),
			clientId: clientId ?? null,
			campaignId
		}).then((data) => {
			const payload = data;
			const nextTargetingRaw = payload?.targeting;
			dispatch({
				type: "applyTargetingFetch",
				targeting: Array.isArray(nextTargetingRaw) ? nextTargetingRaw : [],
				insights: payload?.insights ?? null
			});
		}).catch((error) => {
			const message = error instanceof Error ? error.message : "Failed to load audience targeting";
			if (message.includes("Unknown Meta API error") || message.includes("INTERNAL_ERROR")) logError(new Error(message), "AudienceControl:fetchTargeting:suppressedMeta");
			else notifyFailure({
				title: "Error",
				message
			});
		}).finally(() => {
			dispatch({
				type: "setLoading",
				value: false
			});
		});
	});
	(0, import_react.useEffect)(() => {
		const frame = requestAnimationFrame(() => {
			fetchTargeting();
		});
		return () => {
			cancelAnimationFrame(frame);
		};
	}, [
		canLoad,
		campaignId,
		clientId,
		providerId,
		workspaceId
	]);
	const toggleSection = (section) => {
		dispatch({
			type: "toggleSection",
			section
		});
	};
	const handleOpenBuilder = () => {
		dispatch({
			type: "setBuilderOpen",
			value: true
		});
	};
	const handleBuilderOpenChange = (value) => {
		dispatch({
			type: "setBuilderOpen",
			value
		});
	};
	const handleSelectedTargetingIdChange = (value) => {
		dispatch({
			type: "setSelectedTargetingId",
			value
		});
	};
	const visibleTargeting = (() => {
		if (targeting.length <= 1) return targeting;
		if (selectedTargetingId === "all") return targeting;
		return targeting.filter((t) => t.entityId === selectedTargetingId);
	})();
	const locationMarkers = buildAudienceLocationMarkers(visibleTargeting, resolvedCoordinates);
	const aggregatedData = aggregateAudienceTargetingData(visibleTargeting);
	const activeAdSetId = (() => {
		if (selectedTargetingId !== "all") return selectedTargetingId;
		return targeting[0]?.entityId;
	})();
	const { handleToggleEditing, handlePersistInterests, handleAddInterestDraft, handleRemoveInterestDraft, handleAddLocationDraft, handleRemoveLocationDraft, handlePersistLocations, handleAddAudienceDraft, handleRemoveAudienceDraft, handlePersistAudiences, handlePersistDemographics, handlePersistPlacements, handleTogglePlatformDraft, handleTogglePlacementPositionDraft, handleDraftDemographicsChange } = useAudienceControlTargetingHandlers({
		dispatch,
		aggregatedData,
		drafts: {
			draftInterests,
			draftLocations,
			draftAudiences,
			draftDemographics,
			draftPlacements,
			draftPlacementDetail,
			editingSection
		},
		canEditMetaTargeting,
		workspaceId,
		activeAdSetId,
		clientId,
		updateAdSetTargeting,
		fetchTargeting
	});
	const displayInterests = draftInterests ?? aggregatedData.interests;
	const displayLocations = draftLocations ?? aggregatedData.locations;
	const displayAudiences = draftAudiences ?? aggregatedData.audiences;
	const editorAggregatedData = {
		...aggregatedData,
		interests: displayInterests,
		locations: displayLocations,
		audiences: displayAudiences
	};
	return {
		providerId,
		canLoad,
		loading,
		hasLoaded,
		targeting,
		insights,
		builderOpen,
		expandedSections,
		selectedTargetingId,
		editingSection,
		canEditMetaTargeting,
		workspaceId,
		clientId,
		aggregatedData: editorAggregatedData,
		locationMarkers,
		geocodeFailedNames,
		audienceStats: [
			{
				label: "Configs",
				value: insights?.totalEntities ?? targeting.length
			},
			{
				label: "Locations",
				value: aggregatedData.locations.included.length
			},
			{
				label: "Interests",
				value: aggregatedData.interests.length
			},
			{
				label: "Audiences",
				value: aggregatedData.audiences.included.length
			}
		],
		headerActionsProps: {
			loading,
			onOpenBuilder: handleOpenBuilder,
			onRefresh: fetchTargeting
		},
		interestSectionProps: {
			aggregatedData: editorAggregatedData,
			expandedSections,
			toggleSection,
			editingSection,
			onToggleEditing: handleToggleEditing,
			canEditMetaTargeting,
			workspaceId,
			clientId,
			onAddInterest: canEditMetaTargeting ? handleAddInterestDraft : void 0,
			onRemoveInterest: canEditMetaTargeting ? handleRemoveInterestDraft : void 0,
			onSaveTargeting: canEditMetaTargeting && editingSection === "interests" ? handlePersistInterests : void 0,
			savingTargeting
		},
		customAudiencesSectionProps: {
			aggregatedData: editorAggregatedData,
			expandedSections,
			toggleSection,
			editingSection,
			onToggleEditing: handleToggleEditing,
			canEdit: canEditMetaTargeting,
			workspaceId,
			clientId,
			onAddAudience: canEditMetaTargeting ? handleAddAudienceDraft : void 0,
			onRemoveAudience: canEditMetaTargeting ? handleRemoveAudienceDraft : void 0,
			onSaveTargeting: canEditMetaTargeting && editingSection === "audiences" ? handlePersistAudiences : void 0,
			savingTargeting
		},
		handleBuilderOpenChange,
		handleSelectedTargetingIdChange,
		handleToggleEditing,
		toggleSection,
		handleAddLocationDraft,
		handleRemoveLocationDraft,
		handlePersistLocations,
		handlePersistDemographics,
		handleDraftDemographicsChange,
		draftDemographics,
		handlePersistPlacements,
		handleTogglePlatformDraft,
		handleTogglePlacementPositionDraft,
		draftPlacements,
		draftPlacementDetail,
		savingTargeting
	};
}
function AudienceControlSection({ providerId, campaignId, clientId, isPreviewMode, campaignObjective }) {
	const view = useAudienceControlSection({
		providerId,
		campaignId,
		clientId,
		isPreviewMode
	});
	if (view.loading && !view.hasLoaded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceControlLoadingCard, {});
	if (!view.canLoad) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceControlPreviewCard, {});
	if (view.targeting.length === 0 && view.hasLoaded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceControlEmptyCard, {
		builderOpen: view.builderOpen,
		headerActionsProps: view.headerActionsProps,
		onBuilderOpenChange: view.handleBuilderOpenChange,
		providerId: view.providerId
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceControlMainCard, {
		targeting: view.targeting,
		insights: view.insights,
		aggregatedData: view.aggregatedData,
		locationMarkers: view.locationMarkers,
		selectedTargetingId: view.selectedTargetingId,
		expandedSections: view.expandedSections,
		geocodeFailedNames: view.geocodeFailedNames,
		audienceStats: view.audienceStats,
		headerActionsProps: view.headerActionsProps,
		interestSectionProps: view.interestSectionProps,
		customAudiencesSectionProps: view.customAudiencesSectionProps,
		builderOpen: view.builderOpen,
		providerId: view.providerId,
		workspaceId: view.workspaceId,
		clientId: view.clientId,
		canEditMetaTargeting: view.canEditMetaTargeting,
		editingSection: view.editingSection,
		onTargetingChange: view.handleSelectedTargetingIdChange,
		onToggleEditing: view.handleToggleEditing,
		onToggleSection: view.toggleSection,
		onBuilderOpenChange: view.handleBuilderOpenChange,
		onAddLocation: view.handleAddLocationDraft,
		onRemoveLocation: view.handleRemoveLocationDraft,
		onSaveLocations: view.handlePersistLocations,
		onSaveDemographics: view.handlePersistDemographics,
		onDraftDemographicsChange: view.handleDraftDemographicsChange,
		draftDemographics: view.draftDemographics,
		draftPlacements: view.draftPlacements,
		draftPlacementDetail: view.draftPlacementDetail,
		onSavePlacements: view.handlePersistPlacements,
		onTogglePlatform: view.handleTogglePlatformDraft,
		onTogglePlacementPosition: view.handleTogglePlacementPositionDraft,
		savingTargeting: view.savingTargeting,
		campaignObjective
	});
}
function parseBudgetMode(providerId, budgetType) {
	const raw = typeof budgetType === "string" ? budgetType.trim().toLowerCase() : "";
	if (providerId === "tiktok") {
		if (raw === "budget_mode_day") return "daily";
		if (raw === "budget_mode_total") return "total";
	}
	if (raw === "daily") return "daily";
	if (raw === "lifetime") return "lifetime";
	if (raw === "total") return "total";
	return null;
}
function getBudgetModeOptions(providerId) {
	if (providerId === "facebook") return [{
		value: "daily",
		label: "Daily",
		hint: "Resets each day"
	}, {
		value: "lifetime",
		label: "Lifetime",
		hint: "Fixed for the campaign"
	}];
	if (providerId === "linkedin" || providerId === "tiktok") return [{
		value: "daily",
		label: "Daily",
		hint: "Resets each day"
	}, {
		value: "total",
		label: "Total",
		hint: "Campaign cap"
	}];
	return [];
}
function toApiBudgetMode(providerId, mode) {
	if (!mode) return void 0;
	if (providerId === "tiktok") return mode === "daily" ? "BUDGET_MODE_DAY" : "BUDGET_MODE_TOTAL";
	return mode;
}
function BudgetModeOption({ opt, selected, disabled, onSelect }) {
	const selectBudgetModeValue = () => {
		onSelect(opt.value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		role: "radio",
		"aria-checked": selected,
		disabled,
		onClick: selectBudgetModeValue,
		className: cn("flex flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition-[border-color,box-shadow,background-color]", selected ? "border-primary/40 bg-primary/[0.06] shadow-sm ring-1 ring-primary/20" : "border-border/60 bg-card/50 hover:border-primary/25 hover:bg-card", disabled && "pointer-events-none opacity-60", "motion-reduce:transition-none"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm font-medium text-foreground",
			children: opt.label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted-foreground",
			children: opt.hint
		})]
	});
}
function formatModeLabel(providerId, mode) {
	if (!mode) return "Not set";
	return getBudgetModeOptions(providerId).find((o) => o.value === mode)?.label ?? mode;
}
function BudgetControlSection({ providerId, campaignId, clientId, isPreviewMode, currency, budget, budgetType, onReloadCampaign }) {
	const canEdit = !isPreviewMode;
	const currencyCode = normalizeCurrencyCode(currency ?? void 0);
	const modeOptions = getBudgetModeOptions(providerId);
	const initialMode = parseBudgetMode(providerId, budgetType) ?? modeOptions[0]?.value ?? null;
	const [amount, setAmount] = (0, import_react.useState)(() => typeof budget === "number" && Number.isFinite(budget) ? String(budget) : "");
	const { user } = useAuth();
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const updateCampaign = useAction(adsCampaignsApi.updateCampaign);
	const [mode, setMode] = (0, import_react.useState)(() => initialMode);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const parsedDraft = Number.parseFloat(amount);
	const hasValidDraft = Number.isFinite(parsedDraft) && parsedDraft > 0;
	const currentBudgetLabel = (() => {
		if (typeof budget !== "number" || !Number.isFinite(budget)) return "Not set";
		return formatMoney(budget, currencyCode);
	})();
	const draftBudgetLabel = (() => {
		if (!hasValidDraft) return null;
		return formatMoney(parsedDraft, currencyCode);
	})();
	const hasUnsavedChanges = (() => {
		return hasValidDraft && (typeof budget !== "number" || Math.abs(parsedDraft - budget) > .001) || mode !== initialMode;
	})();
	const handleSave = () => {
		if (!canEdit) return;
		if (!hasValidDraft) {
			notifyFailure({
				title: "Invalid budget",
				message: "Enter a valid budget amount greater than 0."
			});
			return;
		}
		setSaving(true);
		const apiMode = toApiBudgetMode(providerId, mode);
		if (!workspaceId) {
			setSaving(false);
			return;
		}
		updateCampaign({
			workspaceId,
			providerId: toAdsProviderId(providerId),
			clientId: clientId ?? null,
			campaignId,
			action: "updateBudget",
			budget: parsedDraft,
			budgetMode: apiMode
		}).then(() => {
			notifySuccess({
				title: "Budget updated",
				message: "Changes will reflect after refresh."
			});
			return onReloadCampaign?.();
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "BudgetControlSection:handleSave",
				title: "Error",
				fallbackMessage: "Error"
			});
		}).finally(() => {
			setSaving(false);
		});
	};
	const handleRefresh = () => {
		if (!onReloadCampaign) return;
		Promise.resolve(onReloadCampaign()).catch((error) => {
			logError(error, "BudgetControlSection:handleRefresh");
		});
	};
	const handleModeSelect = (value) => {
		setMode(value);
	};
	const handleAmountChange = (event) => {
		setAmount(event.target.value);
	};
	const headerActions = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "icon",
		className: "size-9",
		onClick: handleRefresh,
		disabled: saving,
		"aria-label": "Refresh campaign budget",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
			className: cn("size-4", saving && "animate-spin"),
			"aria-hidden": true
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		onClick: handleSave,
		disabled: !canEdit || saving || !hasUnsavedChanges,
		className: "gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, {
			className: "size-4",
			"aria-hidden": true
		}), saving ? "Saving…" : "Save changes"]
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.surfaceCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignControlHeader, {
			icon: DollarSign,
			title: "Budget control",
			description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				"Platform budget for this campaign. Changes sync to",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium text-foreground capitalize",
					children: providerId
				}),
				" on save."
			] }),
			actions: headerActions,
			stats: [
				{
					label: "Live budget",
					value: currentBudgetLabel
				},
				{
					label: "Schedule",
					value: formatModeLabel(providerId, mode)
				},
				{
					label: "Currency",
					value: currencyCode.toUpperCase()
				}
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-5 pt-6",
			children: [!canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
				className: cn(ADS_PAGE_THEME.controlPreviewBanner, "block"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
					className: "mt-0.5 size-4 shrink-0 text-warning",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium text-foreground",
					children: "Preview mode"
				}), " - switch to live mode to edit budgets on the ad platform."] })]
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: ADS_PAGE_THEME.controlHighlightTile,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: ADS_PAGE_THEME.controlSectionLabel,
							children: "Current allocation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-3xl font-semibold tracking-tight tabular-nums text-foreground sm:text-4xl",
							children: currentBudgetLabel
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 flex items-center gap-1.5 text-sm text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, {
									className: "size-3.5 shrink-0",
									"aria-hidden": true
								}),
								formatModeLabel(providerId, mode),
								" budget"
							]
						}),
						hasUnsavedChanges && draftBudgetLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground",
							children: [
								"Draft after save:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground",
									children: draftBudgetLabel
								})
							]
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn(ADS_PAGE_THEME.controlFormPanel, "space-y-5"),
					children: [modeOptions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: ADS_PAGE_THEME.controlSectionLabel,
							children: "Budget type"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-2 sm:grid-cols-2",
							role: "radiogroup",
							"aria-label": "Budget type",
							children: modeOptions.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetModeOption, {
								opt,
								selected: mode === opt.value,
								disabled: !canEdit || saving,
								onSelect: handleModeSelect
							}, opt.value))
						})]
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "budget-amount",
								className: ADS_PAGE_THEME.controlSectionLabel,
								children: [
									"Amount (",
									currencyCode.toUpperCase(),
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground",
									"aria-hidden": true,
									children: "$"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "budget-amount",
									inputMode: "decimal",
									placeholder: "50.00",
									value: amount,
									onChange: handleAmountChange,
									disabled: !canEdit || saving,
									className: "h-11 pl-7 text-base tabular-nums"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs leading-relaxed text-muted-foreground",
								children: "Platforms may enforce minimum spends. Invalid values are rejected by the ad network."
							})
						]
					})]
				})]
			})]
		})]
	});
}
CHART_COLORS.primary[1], CHART_COLORS.primary[0], CHART_COLORS.primary[2], CHART_COLORS.primary[4], CHART_COLORS.primary[3], CHART_COLORS.primary[5];
var CONVERSION_EVENTS = [
	{
		value: "PURCHASE",
		label: "Purchases",
		description: "Complete purchase"
	},
	{
		value: "INITIATE_CHECKOUT",
		label: "Initiate Checkout",
		description: "Start checkout process"
	},
	{
		value: "ADD_TO_CART",
		label: "Add to Cart",
		description: "Add item to cart"
	},
	{
		value: "ADD_PAYMENT_INFO",
		label: "Add Payment Info",
		description: "Enter payment details"
	},
	{
		value: "ADD_TO_WISHLIST",
		label: "Add to Wishlist",
		description: "Add item to wishlist"
	},
	{
		value: "COMPLETE_REGISTRATION",
		label: "Complete Registration",
		description: "Finish signup"
	},
	{
		value: "CONTENT_VIEW",
		label: "Content View",
		description: "View key content"
	}
];
var APP_EVENT_TYPES = [
	{
		value: "MOBILE_APP_INSTALL",
		label: "App Installs",
		description: "Install your app"
	},
	{
		value: "MOBILE_APP_ENGAGEMENT",
		label: "App Engagement",
		description: "Engage with your app"
	},
	{
		value: "MOBILE_APP_RETENTION",
		label: "App Retention",
		description: "Return to your app"
	}
];
var ENGAGEMENT_TYPES = [
	{
		value: "POST_ENGAGEMENT",
		label: "Post Engagement",
		description: "Engage with posts"
	},
	{
		value: "PAGE_ENGAGEMENT",
		label: "Page Engagement",
		description: "Engage with page"
	},
	{
		value: "EVENT_RESPONSES",
		label: "Event Responses",
		description: "Respond to events"
	},
	{
		value: "OFFER_CLAIMS",
		label: "Offer Claims",
		description: "Claim offers"
	}
];
var DESTINATION_TYPES = [
	{
		value: "WEBSITE",
		label: "Website",
		description: "Send traffic to your website"
	},
	{
		value: "APP",
		label: "App",
		description: "Open your mobile app"
	},
	{
		value: "MESSENGER",
		label: "Messenger",
		description: "Start Messenger conversation"
	}
];
function SalesObjectiveSection({ formData, onChange, disabled, metaContext }) {
	const salesMode = formData.salesOptimizationMode ?? "pixel";
	const [pixelState, dispatchPixels] = (0, import_react.useReducer)((_, value) => value, {
		pixels: [],
		loading: false
	});
	const [catalogState, dispatchCatalogs] = (0, import_react.useReducer)((_, value) => value, {
		catalogs: [],
		loading: false
	});
	const [setState, dispatchSets] = (0, import_react.useReducer)((_, value) => value, {
		sets: [],
		loading: false
	});
	const listAdPixels = useAction(adsMetaToolsApi.listAdPixels);
	const listProductCatalogs = useAction(adsMetaToolsApi.listProductCatalogs);
	const listProductSets = useAction(adsMetaToolsApi.listProductSets);
	const canLoadMeta = Boolean(metaContext?.workspaceId);
	(0, import_react.useEffect)(() => {
		if (!canLoadMeta || !metaContext?.workspaceId) {
			dispatchPixels({
				pixels: [],
				loading: false
			});
			return;
		}
		let cancelled = false;
		dispatchPixels({
			pixels: [],
			loading: true
		});
		listAdPixels({
			workspaceId: metaContext.workspaceId,
			clientId: metaContext.clientId ?? null
		}).then((rows) => {
			if (cancelled) return;
			dispatchPixels({
				pixels: Array.isArray(rows) ? rows.map((row) => ({
					id: String(row.id),
					name: String(row.name)
				})) : [],
				loading: false
			});
		}).catch((error) => {
			if (cancelled) return;
			reportConvexFailure({
				error,
				context: "SalesObjectiveSection:listAdPixels",
				title: "Could not load pixels",
				fallbackMessage: "Could not load pixels"
			});
			dispatchPixels({
				pixels: [],
				loading: false
			});
		});
		return () => {
			cancelled = true;
		};
	}, [
		canLoadMeta,
		listAdPixels,
		metaContext?.clientId,
		metaContext?.workspaceId
	]);
	(0, import_react.useEffect)(() => {
		if (!canLoadMeta || !metaContext?.workspaceId || salesMode !== "catalog") {
			dispatchCatalogs({
				catalogs: [],
				loading: false
			});
			return;
		}
		let cancelled = false;
		dispatchCatalogs({
			catalogs: [],
			loading: true
		});
		listProductCatalogs({
			workspaceId: metaContext.workspaceId,
			clientId: metaContext.clientId ?? null
		}).then((rows) => {
			if (cancelled) return;
			dispatchCatalogs({
				catalogs: Array.isArray(rows) ? rows.map((row) => ({
					id: String(row.id),
					name: String(row.name),
					productCount: typeof row.productCount === "number" ? row.productCount : void 0
				})) : [],
				loading: false
			});
		}).catch((error) => {
			if (cancelled) return;
			reportConvexFailure({
				error,
				context: "SalesObjectiveSection:listProductCatalogs",
				title: "Could not load catalogs",
				fallbackMessage: "Could not load product catalogs"
			});
			dispatchCatalogs({
				catalogs: [],
				loading: false
			});
		});
		return () => {
			cancelled = true;
		};
	}, [
		canLoadMeta,
		listProductCatalogs,
		metaContext?.clientId,
		metaContext?.workspaceId,
		salesMode
	]);
	(0, import_react.useEffect)(() => {
		if (!canLoadMeta || !metaContext?.workspaceId || salesMode !== "catalog" || !formData.productCatalogId) {
			dispatchSets({
				sets: [],
				loading: false
			});
			return;
		}
		let cancelled = false;
		dispatchSets({
			sets: [],
			loading: true
		});
		listProductSets({
			workspaceId: metaContext.workspaceId,
			clientId: metaContext.clientId ?? null,
			catalogId: formData.productCatalogId
		}).then((rows) => {
			if (cancelled) return;
			dispatchSets({
				sets: Array.isArray(rows) ? rows.map((row) => ({
					id: String(row.id),
					name: String(row.name),
					productCount: typeof row.productCount === "number" ? row.productCount : void 0
				})) : [],
				loading: false
			});
		}).catch((error) => {
			if (cancelled) return;
			reportConvexFailure({
				error,
				context: "SalesObjectiveSection:listProductSets",
				title: "Could not load product sets",
				fallbackMessage: "Could not load product sets"
			});
			dispatchSets({
				sets: [],
				loading: false
			});
		});
		return () => {
			cancelled = true;
		};
	}, [
		canLoadMeta,
		formData.productCatalogId,
		listProductSets,
		metaContext?.clientId,
		metaContext?.workspaceId,
		salesMode
	]);
	const handleSalesModeChange = (value) => {
		const mode = value === "catalog" ? "catalog" : "pixel";
		onChange({
			salesOptimizationMode: mode,
			productCatalogId: mode === "catalog" ? formData.productCatalogId : void 0,
			productSetId: mode === "catalog" ? formData.productSetId : void 0,
			pixelId: mode === "pixel" ? formData.pixelId : void 0,
			conversionEvent: mode === "pixel" ? formData.conversionEvent : void 0
		});
	};
	const handleConversionEventChange = (value) => onChange({ conversionEvent: value });
	const handlePixelChange = (value) => onChange({ pixelId: value });
	const handleManualPixelChange = (event) => onChange({ pixelId: event.target.value });
	const handleCatalogChange = (value) => onChange({
		productCatalogId: value,
		productSetId: void 0
	});
	const handleProductSetChange = (value) => onChange({ productSetId: value === "__all__" ? void 0 : value });
	const handleManualCatalogChange = (event) => onChange({
		productCatalogId: event.target.value,
		productSetId: void 0
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "pb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2 text-base",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4 text-success" }), "Sales optimization"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Optimize for website conversions (pixel) or dynamic product ads from a catalog." })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "sales-optimization-mode",
					children: "Optimization type"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: salesMode,
					onValueChange: handleSalesModeChange,
					disabled,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "sales-optimization-mode",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "pixel",
						children: "Website conversions (pixel)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "catalog",
						children: "Product catalog (DPA)"
					})] })]
				})]
			}), salesMode === "pixel" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "conversion-event",
					children: "Optimization event"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: formData.conversionEvent,
					onValueChange: handleConversionEventChange,
					disabled,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "conversion-event",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select conversion event" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CONVERSION_EVENTS.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: event.value,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: event.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: event.description
							})]
						})
					}, event.value)) })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "pixel-id",
						children: "Facebook Pixel"
					}),
					canLoadMeta ? pixelState.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "size-4 animate-spin",
							"aria-hidden": true
						}), "Loading pixels…"]
					}) : pixelState.pixels.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: formData.pixelId || void 0,
						onValueChange: handlePixelChange,
						disabled,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "pixel-id",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a pixel" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: pixelState.pixels.map((pixel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: pixel.id,
							children: pixel.name
						}, pixel.id)) })]
					}) : null : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "pixel-id-manual",
						placeholder: "Or enter pixel ID manually",
						value: formData.pixelId || "",
						onChange: handleManualPixelChange,
						disabled
					})
				]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "product-catalog-id",
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, {
							className: "size-3.5",
							"aria-hidden": true
						}), "Product catalog"]
					}),
					canLoadMeta ? catalogState.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "size-4 animate-spin",
							"aria-hidden": true
						}), "Loading catalogs…"]
					}) : catalogState.catalogs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: formData.productCatalogId || void 0,
						onValueChange: handleCatalogChange,
						disabled,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "product-catalog-id",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a catalog" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: catalogState.catalogs.map((catalog) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
							value: catalog.id,
							children: [catalog.name, catalog.productCount != null ? ` (${catalog.productCount.toLocaleString()} products)` : ""]
						}, catalog.id)) })]
					}) : null : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "product-catalog-id-manual",
						placeholder: "Or enter catalog ID manually",
						value: formData.productCatalogId || "",
						onChange: handleManualCatalogChange,
						disabled
					})
				]
			}), formData.productCatalogId && canLoadMeta ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "product-set-id",
					children: "Product set (optional)"
				}), setState.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-4 animate-spin",
						"aria-hidden": true
					}), "Loading product sets…"]
				}) : setState.sets.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: formData.productSetId ?? "__all__",
					onValueChange: handleProductSetChange,
					disabled,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "product-set-id",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All catalog products" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "__all__",
						children: "All catalog products"
					}), setState.sets.map((set) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
						value: set.id,
						children: [set.name, set.productCount != null ? ` (${set.productCount.toLocaleString()} products)` : ""]
					}, set.id))] })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "No product sets found. Meta will use the full catalog."
				})]
			}) : null] })]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "border-warning/20 bg-warning/5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "pt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-5 text-warning flex-shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "font-medium text-sm",
							children: "Sales campaign tips"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "text-sm text-muted-foreground space-y-1 list-disc list-inside",
							children: [salesMode === "pixel" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Ensure the pixel fires on your site before launching" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Use retargeting audiences for cart abandoners" })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Sync products to the catalog in Meta Commerce Manager first" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Use dynamic creative or catalog templates when creating ads" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Monitor ROAS and adjust budget on the Budget tab" })]
						})]
					})]
				})
			})
		})]
	});
}
function createInitialLeadsObjectiveState() {
	return {
		showCreateForm: false,
		newFormName: "",
		privacyPolicyUrl: "",
		forms: [],
		loadingForms: false,
		creatingForm: false
	};
}
function leadsObjectiveReducer(state, action) {
	switch (action.type) {
		case "setShowCreateForm": return {
			...state,
			showCreateForm: typeof action.value === "function" ? action.value(state.showCreateForm) : action.value
		};
		case "setNewFormName": return {
			...state,
			newFormName: action.value
		};
		case "setPrivacyPolicyUrl": return {
			...state,
			privacyPolicyUrl: action.value
		};
		case "setFormsState": return {
			...state,
			forms: action.value.forms,
			loadingForms: action.value.loading
		};
		case "setFormsLoading": return {
			...state,
			loadingForms: action.value
		};
		case "prependForm": return {
			...state,
			forms: [action.value, ...state.forms]
		};
		case "setCreatingForm": return {
			...state,
			creatingForm: action.value
		};
		case "resetCreateForm": return {
			...state,
			showCreateForm: false,
			newFormName: "",
			privacyPolicyUrl: ""
		};
		default: return state;
	}
}
function LeadsObjectiveSection({ formData, onChange, disabled, providerId, metaContext }) {
	const [state, dispatch] = (0, import_react.useReducer)(leadsObjectiveReducer, void 0, createInitialLeadsObjectiveState);
	const { showCreateForm, newFormName, privacyPolicyUrl, forms, loadingForms, creatingForm } = state;
	const listLeadgenForms = useAction(adsMetaToolsApi.listLeadgenForms);
	const createLeadgenForm = useAction(adsMetaToolsApi.createLeadgenForm);
	const isMeta = toAdsProviderId(providerId) === "facebook";
	const canUseMetaApi = Boolean(isMeta && metaContext?.workspaceId && metaContext.pageId);
	(0, import_react.useEffect)(() => {
		if (!canUseMetaApi || !metaContext?.workspaceId || !metaContext?.pageId) {
			dispatch({
				type: "setFormsState",
				value: {
					forms: [],
					loading: false
				}
			});
			return;
		}
		let cancelled = false;
		dispatch({
			type: "setFormsLoading",
			value: true
		});
		listLeadgenForms({
			workspaceId: metaContext.workspaceId,
			clientId: metaContext.clientId ?? null,
			pageId: metaContext.pageId
		}).then((rows) => {
			if (cancelled) return;
			dispatch({
				type: "setFormsState",
				value: {
					forms: Array.isArray(rows) ? rows.map((row) => ({
						id: String(row.id),
						name: String(row.name),
						status: row.status,
						leadsCount: row.leadsCount
					})) : [],
					loading: false
				}
			});
		}).catch((error) => {
			if (cancelled) return;
			reportConvexFailure({
				error,
				context: "LeadsObjectiveSection:listLeadgenForms",
				title: "Could not load lead forms",
				fallbackMessage: "Could not load lead forms"
			});
			dispatch({
				type: "setFormsLoading",
				value: false
			});
		});
		return () => {
			cancelled = true;
		};
	}, [
		canUseMetaApi,
		listLeadgenForms,
		metaContext?.clientId,
		metaContext?.pageId,
		metaContext?.workspaceId
	]);
	const handleInstantFormToggle = (checked) => onChange({ instantFormEnabled: checked === true });
	const handleLeadFormSelect = (leadFormId) => onChange({ leadFormId });
	const handleCreateForm = async () => {
		if (!canUseMetaApi || !metaContext?.workspaceId || !metaContext.pageId) return;
		if (!newFormName.trim() || !privacyPolicyUrl.trim()) {
			notifySuccess({
				title: "Missing fields",
				message: "Form name and privacy policy URL are required."
			});
			return;
		}
		dispatch({
			type: "setCreatingForm",
			value: true
		});
		try {
			const result = await createLeadgenForm({
				workspaceId: metaContext.workspaceId,
				clientId: metaContext.clientId ?? null,
				pageId: metaContext.pageId,
				name: newFormName.trim(),
				privacyPolicyUrl: privacyPolicyUrl.trim()
			});
			if (result.formId) {
				onChange({ leadFormId: result.formId });
				dispatch({
					type: "prependForm",
					value: {
						id: result.formId,
						name: newFormName.trim(),
						status: "ACTIVE"
					}
				});
				notifySuccess({
					title: "Lead form created",
					message: `"${newFormName.trim()}" is ready to use.`
				});
			}
			dispatch({ type: "resetCreateForm" });
		} catch (error) {
			reportConvexFailure({
				error,
				context: "LeadsObjectiveSection:createLeadgenForm",
				title: "Could not create lead form",
				fallbackMessage: "Could not create lead form"
			});
		}
		dispatch({
			type: "setCreatingForm",
			value: false
		});
	};
	const handleToggleCreateForm = () => {
		dispatch({
			type: "setShowCreateForm",
			value: (value) => !value
		});
	};
	const handleCancelCreateForm = () => {
		dispatch({
			type: "setShowCreateForm",
			value: false
		});
	};
	const handleNewFormNameChange = (event) => {
		dispatch({
			type: "setNewFormName",
			value: event.target.value
		});
	};
	const handlePrivacyPolicyUrlChange = (event) => {
		dispatch({
			type: "setPrivacyPolicyUrl",
			value: event.target.value
		});
	};
	const handleCreateFormClick = () => {
		handleCreateForm();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "pb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2 text-base",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
					className: "size-4 text-info",
					"aria-hidden": true
				}), "Lead Form"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Select an instant form from your connected Facebook Page, or create a new one." })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [
				!isMeta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
					className: "text-xs",
					children: "Lead forms are only available for Meta (Facebook/Instagram) campaigns."
				}) }) : !canUseMetaApi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
					className: "text-xs",
					children: "Connect a Facebook Page with a Page ID to load and create instant lead forms. Until then, configure lead forms in Meta Ads Manager."
				}) }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "instant-form",
							children: "Use Instant Forms"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "People submit without leaving Facebook or Instagram"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						id: "instant-form",
						checked: Boolean(formData.instantFormEnabled),
						onCheckedChange: handleInstantFormToggle,
						disabled: disabled || !isMeta
					})]
				}),
				formData.instantFormEnabled && isMeta ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 border-t pt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Select form" }),
						loadingForms ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "size-4 animate-spin",
								"aria-hidden": true
							}), "Loading forms…"]
						}) : forms.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-2",
							children: forms.map((form) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeadFormOptionButton, {
								disabled: Boolean(disabled),
								form,
								isSelected: formData.leadFormId === form.id,
								onSelect: handleLeadFormSelect
							}, form.id))
						}) : canUseMetaApi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "No lead forms on this page yet - create one below."
						}) : null,
						canUseMetaApi ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							className: "w-full",
							onClick: handleToggleCreateForm,
							disabled,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
								className: "mr-2 size-4",
								"aria-hidden": true
							}), "Create new form"]
						}) : null
					]
				}), showCreateForm && canUseMetaApi ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 rounded-lg border bg-muted/50 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "font-medium text-sm",
							children: "Create lead form"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "form-name",
								children: "Form name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "form-name",
								value: newFormName,
								onChange: handleNewFormNameChange,
								placeholder: "Free consultation",
								disabled: disabled || creatingForm
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "privacy-url",
								children: "Privacy policy URL"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "privacy-url",
								type: "url",
								value: privacyPolicyUrl,
								onChange: handlePrivacyPolicyUrlChange,
								placeholder: "https://yoursite.com/privacy",
								disabled: disabled || creatingForm
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								size: "sm",
								onClick: handleCreateFormClick,
								disabled: disabled || creatingForm || !newFormName.trim() || !privacyPolicyUrl.trim(),
								children: [creatingForm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : null, "Create form"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "ghost",
								onClick: handleCancelCreateForm,
								children: "Cancel"
							})]
						})
					]
				}) : null] }) : null
			]
		})] })
	});
}
function LeadFormOptionButton({ form, disabled, isSelected, onSelect }) {
	const handleSelect = () => {
		onSelect(form.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: handleSelect,
		disabled,
		className: `flex items-center justify-between rounded-lg border p-3 text-left motion-chromatic ${isSelected ? "border-info/20 bg-info/10" : "border-border hover:border-info/50"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
				className: "size-5 text-muted-foreground",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: form.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [form.status ?? "unknown", form.leadsCount != null ? ` · ${form.leadsCount} leads` : ""]
			})] })]
		}), isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, {
			className: "size-5 text-info",
			"aria-hidden": true
		}) : null]
	});
}
function TrafficObjectiveSection({ formData, onChange, disabled }) {
	const handleDestinationTypeChange = (value) => onChange({ destinationType: value });
	const handleDestinationUrlChange = (event) => onChange({ destinationUrl: event.target.value });
	const handleOptimizationGoalChange = (value) => onChange({ optimizationGoal: value });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2 text-base",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4 text-warning" }), "Traffic Destination"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Choose where you want to send people when they click your ad." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "destination-type",
						children: "Destination Type"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: formData.destinationType,
						onValueChange: handleDestinationTypeChange,
						disabled,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "destination-type",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select destination type" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: DESTINATION_TYPES.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: type.value,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									type.value === "WEBSITE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-4" }),
									type.value === "MESSENGER" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col items-start",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: type.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: type.description
										})]
									})
								]
							})
						}, type.value)) })]
					})]
				}), (formData.destinationType === "WEBSITE" || formData.destinationType === "APP") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "destination-url",
							children: formData.destinationType === "APP" ? "App Deep Link" : "Website URL"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "destination-url",
							type: "url",
							placeholder: formData.destinationType === "APP" ? "e.g., myapp://product/123" : "https://example.com/landing-page",
							value: formData.destinationUrl || "",
							onChange: handleDestinationUrlChange,
							disabled
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: formData.destinationType === "APP" ? "Deep link that opens your app to a specific screen" : "Use a dedicated landing page for best results"
						})
					]
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Optimization Settings"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Choose how you want to optimize your traffic campaign." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "optimization-goal",
					children: "Optimization Goal"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: formData.optimizationGoal,
					onValueChange: handleOptimizationGoalChange,
					disabled,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "optimization-goal",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select optimization goal" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "LINK_CLICKS",
							children: "Link Clicks (Most traffic)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "LANDING_PAGE_VIEWS",
							children: "Landing Page Views (Higher quality)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "REACH",
							children: "Reach (Unique users)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "IMPRESSIONS",
							children: "Impressions (Most impressions)"
						})
					] })]
				})]
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-warning/20 bg-warning/5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-5 text-warning flex-shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "font-medium text-sm",
								children: "Traffic Campaign Tips"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "text-sm text-muted-foreground space-y-1 list-disc list-inside",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Use landing pages that match your ad messaging" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Ensure your website loads quickly (under 3 seconds)" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Set up the Meta Pixel to track visitor behavior" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Use UTM parameters to track traffic sources" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Test different audiences to find the most engaged visitors" })
								]
							})]
						})]
					})
				})
			})
		]
	});
}
function createInitialEngagementResourcesState() {
	return {
		posts: [],
		events: [],
		loadingPosts: false,
		loadingEvents: false
	};
}
function engagementResourcesReducer(state, action) {
	switch (action.type) {
		case "setPosts": return {
			...state,
			posts: action.value.posts,
			loadingPosts: action.value.loading
		};
		case "setEvents": return {
			...state,
			events: action.value.events,
			loadingEvents: action.value.loading
		};
		case "setLoadingPosts": return {
			...state,
			loadingPosts: action.value
		};
		case "setLoadingEvents": return {
			...state,
			loadingEvents: action.value
		};
		default: return state;
	}
}
function formatPostPreview(post) {
	const text = post.message?.trim();
	if (text) return text.length > 120 ? `${text.slice(0, 117)}…` : text;
	if (post.createdTime) try {
		return `Post · ${new Date(post.createdTime).toLocaleDateString()}`;
	} catch {
		return `Post ${post.id}`;
	}
	return `Post ${post.id}`;
}
function formatEventWhen(startTime) {
	if (!startTime) return null;
	try {
		return new Date(startTime).toLocaleString();
	} catch {
		return startTime;
	}
}
function EngagementObjectiveSection({ formData, onChange, disabled, metaContext }) {
	const [resources, dispatch] = (0, import_react.useReducer)(engagementResourcesReducer, void 0, createInitialEngagementResourcesState);
	const listPagePosts = useAction(adsMetaToolsApi.listPagePosts);
	const listPageEvents = useAction(adsMetaToolsApi.listPageEvents);
	const canUseMetaApi = Boolean(metaContext?.workspaceId && metaContext.pageId);
	const handleEngagementTypeChange = (value) => {
		onChange({
			engagementType: value,
			postId: void 0,
			eventId: void 0
		});
	};
	const handlePostSelect = (postId) => onChange({ postId });
	const handleEventSelect = (eventId) => onChange({ eventId });
	(0, import_react.useEffect)(() => {
		if (!canUseMetaApi || formData.engagementType !== "POST_ENGAGEMENT" || !metaContext?.pageId) {
			dispatch({
				type: "setPosts",
				value: {
					posts: [],
					loading: false
				}
			});
			return;
		}
		let cancelled = false;
		dispatch({
			type: "setLoadingPosts",
			value: true
		});
		listPagePosts({
			workspaceId: metaContext.workspaceId,
			clientId: metaContext.clientId ?? null,
			pageId: metaContext.pageId
		}).then((rows) => {
			if (cancelled) return;
			dispatch({
				type: "setPosts",
				value: {
					posts: Array.isArray(rows) ? rows.map((row) => ({
						id: String(row.id),
						message: row.message,
						createdTime: row.createdTime
					})) : [],
					loading: false
				}
			});
		}).catch((error) => {
			if (cancelled) return;
			reportConvexFailure({
				error,
				context: "EngagementObjectiveSection:listPagePosts",
				title: "Could not load Page posts",
				fallbackMessage: "Could not load Page posts"
			});
			dispatch({
				type: "setLoadingPosts",
				value: false
			});
		});
		return () => {
			cancelled = true;
		};
	}, [
		canUseMetaApi,
		formData.engagementType,
		listPagePosts,
		metaContext?.clientId,
		metaContext?.pageId,
		metaContext?.workspaceId
	]);
	(0, import_react.useEffect)(() => {
		if (!canUseMetaApi || formData.engagementType !== "EVENT_RESPONSES" || !metaContext?.pageId) {
			dispatch({
				type: "setEvents",
				value: {
					events: [],
					loading: false
				}
			});
			return;
		}
		let cancelled = false;
		dispatch({
			type: "setLoadingEvents",
			value: true
		});
		listPageEvents({
			workspaceId: metaContext.workspaceId,
			clientId: metaContext.clientId ?? null,
			pageId: metaContext.pageId
		}).then((rows) => {
			if (cancelled) return;
			dispatch({
				type: "setEvents",
				value: {
					events: Array.isArray(rows) ? rows.map((row) => ({
						id: String(row.id),
						name: String(row.name),
						startTime: row.startTime
					})) : [],
					loading: false
				}
			});
		}).catch((error) => {
			if (cancelled) return;
			reportConvexFailure({
				error,
				context: "EngagementObjectiveSection:listPageEvents",
				title: "Could not load Page events",
				fallbackMessage: "Could not load Page events"
			});
			dispatch({
				type: "setLoadingEvents",
				value: false
			});
		});
		return () => {
			cancelled = true;
		};
	}, [
		canUseMetaApi,
		formData.engagementType,
		listPageEvents,
		metaContext?.clientId,
		metaContext?.pageId,
		metaContext?.workspaceId
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2 text-base",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4 text-primary" }), "Engagement Type"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Choose what type of engagement you want to drive." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "engagement-type",
						children: "Engagement Goal"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: formData.engagementType,
						onValueChange: handleEngagementTypeChange,
						disabled,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "engagement-type",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select engagement type" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ENGAGEMENT_TYPES.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: type.value,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-start",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: type.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: type.description
								})]
							})
						}, type.value)) })]
					})]
				})
			})] }),
			formData.engagementType === "POST_ENGAGEMENT" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2 text-base",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-4 text-primary" }), "Page Post"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Select a published post from your Facebook Page." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-3",
				children: !canUseMetaApi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
					className: "text-xs",
					children: "Select a Facebook Page above to load posts."
				}) }) : resources.loadingPosts ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-4 animate-spin",
						"aria-hidden": true
					}), "Loading posts…"]
				}) : resources.posts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 max-h-48 overflow-y-auto",
					children: resources.posts.map((post) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResourceOptionButton, {
						disabled: Boolean(disabled),
						isSelected: formData.postId === post.id,
						onSelectResource: handlePostSelect,
						resourceId: post.id,
						title: formatPostPreview(post),
						subtitle: post.id
					}, post.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "No published posts found for this Page. Publish a post on Facebook first."
				})
			})] }) : null,
			formData.engagementType === "EVENT_RESPONSES" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2 text-base",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-4 text-primary" }), "Page Event"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Select an event hosted on your Facebook Page." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-3",
				children: !canUseMetaApi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
					className: "text-xs",
					children: "Select a Facebook Page above to load events."
				}) }) : resources.loadingEvents ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-4 animate-spin",
						"aria-hidden": true
					}), "Loading events…"]
				}) : resources.events.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 max-h-48 overflow-y-auto",
					children: resources.events.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResourceOptionButton, {
						disabled: Boolean(disabled),
						isSelected: formData.eventId === event.id,
						onSelectResource: handleEventSelect,
						resourceId: event.id,
						title: event.name,
						subtitle: formatEventWhen(event.startTime) ?? event.id
					}, event.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "No upcoming events found. Create an event on your Facebook Page first."
				})
			})] }) : null,
			formData.engagementType === "PAGE_ENGAGEMENT" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "pt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: "size-5 text-primary mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "font-medium text-sm",
						children: "Page Engagement"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mt-1",
						children: "Promotes your Facebook Page for likes, follows, and overall engagement."
					})] })]
				})
			}) }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-accent/20 bg-accent/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-5 text-primary flex-shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "font-medium text-sm",
								children: "Engagement Campaign Tips"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "text-sm text-muted-foreground space-y-1 list-disc list-inside",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Use eye-catching visuals and videos" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Ask questions to encourage comments" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Post during peak engagement hours" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Respond to comments quickly" })
								]
							})]
						})]
					})
				})
			})
		]
	});
}
function ResourceOptionButton({ title, subtitle, disabled, isSelected, resourceId, onSelectResource }) {
	const handleSelectResource = () => {
		onSelectResource(resourceId);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: handleSelectResource,
		disabled,
		className: `flex items-center justify-between rounded-lg border p-3 text-left motion-chromatic ${isSelected ? "border-primary/30 bg-primary/10" : "border-border hover:border-primary/50"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 pr-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium truncate",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground truncate",
				children: subtitle
			})]
		}), isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, {
			className: "size-5 shrink-0 text-primary",
			"aria-hidden": true
		}) : null]
	});
}
function Slider({ className, defaultValue, value, min = 0, max = 100, ...props }) {
	const _values = Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
		"data-slot": "slider",
		defaultValue,
		value,
		min,
		max,
		className: cn("relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col", interactiveTransitionClass, className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Track, {
			"data-slot": "slider-track",
			className: cn("bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Range, {
				"data-slot": "slider-range",
				className: cn("bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full")
			})
		}), Array.from({ length: _values.length }, (_, index) => `slider-thumb-${index}`).map((thumbKey) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thumb, {
			"data-slot": "slider-thumb",
			className: "border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-background shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
		}, thumbKey))]
	});
}
function AwarenessObjectiveSection({ formData, onChange, disabled }) {
	const handleReachClick = () => onChange({ optimizationGoal: "REACH" });
	const handleImpressionsClick = () => onChange({ optimizationGoal: "IMPRESSIONS" });
	const handleAdRecallLiftClick = () => onChange({ optimizationGoal: "AD_RECALL_LIFT" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2 text-base",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4 text-info" }), "Awareness Strategy"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Configure how you want to build brand awareness." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "awareness-goal",
						children: "Optimization Goal"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 gap-2",
						children: [
							{
								value: "REACH",
								label: "Reach",
								desc: "Maximize unique users who see your ad",
								icon: Target,
								onClick: handleReachClick
							},
							{
								value: "IMPRESSIONS",
								label: "Impressions",
								desc: "Maximize total ad views (may reach same users multiple times)",
								icon: Eye,
								onClick: handleImpressionsClick
							},
							{
								value: "AD_RECALL_LIFT",
								label: "Ad Recall Lift",
								desc: "Optimize for people likely to remember your ad (requires larger budget)",
								icon: Zap,
								onClick: handleAdRecallLiftClick
							}
						].map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptimizationGoalButton, {
							active: formData.optimizationGoal === option.value,
							disabled: Boolean(disabled),
							icon: option.icon,
							label: option.label,
							description: option.desc,
							onClick: option.onClick
						}, option.value))
					})]
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Frequency Cap"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Limit how often the same person sees your ad." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "frequency-cap",
							children: "Enable Frequency Cap"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Prevent ad fatigue by limiting impressions per user"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						id: "frequency-cap",
						defaultChecked: true,
						disabled
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Impressions per user per week" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: "3"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							defaultValue: [3],
							min: 1,
							max: 10,
							step: 1,
							disabled
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Recommended: 2-4 impressions per week for awareness campaigns"
						})
					]
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Brand Lift Study"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Measure the impact of your ads on brand awareness." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "brand-lift",
						children: "Enable Brand Lift Study"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Requires minimum $30,000 spend over 30 days"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					id: "brand-lift",
					disabled
				})]
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-info/20 bg-info/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-5 text-info flex-shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "font-medium text-sm",
								children: "Awareness Campaign Tips"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "text-sm text-muted-foreground space-y-1 list-disc list-inside",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Use memorable visuals that represent your brand" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Keep messaging simple and clear" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Target broadly to reach new audiences" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Use video to increase recall" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Measure brand lift with surveys" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Run campaigns for at least 2-4 weeks for impact" })
								]
							})]
						})]
					})
				})
			})
		]
	});
}
function OptimizationGoalButton({ active, disabled, icon: Icon, label, description, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		disabled,
		className: `flex items-start gap-3 rounded-lg border p-3 text-left motion-chromatic ${active ? "border-info/20 bg-info/10" : "border-border hover:border-info/50"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mt-0.5 size-5 text-info" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: description
		})] })]
	});
}
function AppPromotionSection({ formData, onChange, disabled }) {
	const handleDestinationTypeChange = (value) => {
		onChange({ destinationType: value });
	};
	const handleAppIdChange = (event) => {
		onChange({ appId: event.target.value });
	};
	const handleAppStoreUrlChange = (event) => {
		onChange({ appStoreUrl: event.target.value });
	};
	const handleDestinationUrlChange = (event) => {
		onChange({ destinationUrl: event.target.value });
	};
	const handleAppEventTypeChange = (value) => {
		onChange({ appEventType: value });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2 text-base",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppWindow, { className: "size-4 text-secondary" }), "App Configuration"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Configure your app for install or engagement campaigns." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "app-store",
							children: "App Store"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: formData.destinationType,
							onValueChange: handleDestinationTypeChange,
							disabled,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "app-store",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select app store" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "APP_STORE",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Apple App Store" })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "GOOGLE_PLAY",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Google Play Store" })]
								})
							})] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "app-id",
								children: "App ID"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "app-id",
								placeholder: "e.g., 1234567890",
								value: formData.appId || "",
								onChange: handleAppIdChange,
								disabled
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Your app ID from the App Store or Google Play Console"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "app-url",
							children: "App Store URL"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "app-url",
							type: "url",
							placeholder: "https://apps.apple.com/app/your-app",
							value: formData.appStoreUrl || "",
							onChange: handleAppStoreUrlChange,
							disabled
						})]
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Optimization Settings"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Choose what app event to optimize for." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "app-event",
						children: "App Event"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: formData.appEventType,
						onValueChange: handleAppEventTypeChange,
						disabled,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "app-event",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select app event" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: APP_EVENT_TYPES.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: event.value,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-start",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: event.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: event.description
								})]
							})
						}, event.value)) })]
					})]
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Deep Linking (Optional)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Send users to specific content within your app." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "deep-link",
						children: "Deep Link URL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "deep-link",
						placeholder: "e.g., myapp://product/123",
						value: formData.destinationUrl || "",
						onChange: handleDestinationUrlChange,
						disabled
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "If the app is installed, users will go directly to this screen"
					})
				]
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-secondary/20 bg-secondary/5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-5 text-secondary flex-shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "font-medium text-sm",
								children: "App Promotion Tips"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "text-sm text-muted-foreground space-y-1 list-disc list-inside",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Implement the Facebook SDK for accurate tracking" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Use app event optimization for quality users" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Create compelling app store listings" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Use playable ads to let users try before installing" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Set up deep linking for better user experience" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Retarget users who installed but have not opened the app" })
								]
							})]
						})]
					})
				})
			})
		]
	});
}
function ObjectiveRenderer({ objective, formData, onChange, disabled, metaContext }) {
	switch (objective) {
		case "OUTCOME_SALES": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SalesObjectiveSection, {
			formData,
			onChange,
			disabled,
			providerId: formData.providerId || "facebook",
			metaContext
		});
		case "OUTCOME_LEADS": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeadsObjectiveSection, {
			formData,
			onChange,
			disabled,
			providerId: formData.providerId || "facebook",
			metaContext
		});
		case "OUTCOME_TRAFFIC": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrafficObjectiveSection, {
			formData,
			onChange,
			disabled,
			providerId: formData.providerId || "facebook"
		});
		case "OUTCOME_ENGAGEMENT": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EngagementObjectiveSection, {
			formData,
			onChange,
			disabled,
			providerId: formData.providerId || "facebook",
			metaContext
		});
		case "OUTCOME_AWARENESS": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AwarenessObjectiveSection, {
			formData,
			onChange,
			disabled,
			providerId: formData.providerId || "facebook"
		});
		case "OUTCOME_APP_PROMOTION": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppPromotionSection, {
			formData,
			onChange,
			disabled,
			providerId: formData.providerId || "facebook"
		});
		default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-8 text-center border-2 border-dashed rounded-lg",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Select a campaign objective to see objective-specific settings"
			})
		});
	}
}
function createInitialObjectiveForm(campaignObjective) {
	const normalized = normalizeMetaCampaignObjective(campaignObjective);
	return {
		name: "",
		objective: normalized ?? "OUTCOME_TRAFFIC",
		status: "PAUSED",
		providerId: "facebook",
		engagementType: "PAGE_ENGAGEMENT",
		instantFormEnabled: true,
		conversionEvent: normalized === "OUTCOME_SALES" ? "PURCHASE" : void 0,
		salesOptimizationMode: "pixel"
	};
}
function CreateMetaAdSetDialog({ open, onOpenChange, campaignId, campaignObjective, onCreated }) {
	const { user } = useAuth();
	const { selectedClientId } = useClientContext();
	const createAdSet = useAction(adsAdSetsApi.createAdSet);
	const listMetaPageActors = useAction(adsCreativesApi.listMetaPageActors);
	const [name, setName] = (0, import_react.useState)("");
	const [dailyBudget, setDailyBudget] = (0, import_react.useState)("");
	const [pageId, setPageId] = (0, import_react.useState)("");
	const [objectiveForm, setObjectiveForm] = (0, import_react.useState)(() => createInitialObjectiveForm(campaignObjective));
	const [metaPageActors, setMetaPageActors] = (0, import_react.useState)([]);
	const [loadingPageActors, setLoadingPageActors] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const normalizedObjective = normalizeMetaCampaignObjective(campaignObjective);
	const showObjectiveFlow = normalizedObjective === "OUTCOME_LEADS" || normalizedObjective === "OUTCOME_ENGAGEMENT" || normalizedObjective === "OUTCOME_SALES";
	const needsPage = requiresMetaPageForAdSet(campaignObjective);
	const metaContext = workspaceId ? {
		workspaceId,
		clientId: selectedClientId ?? null,
		pageId: pageId || void 0
	} : void 0;
	(0, import_react.useEffect)(() => {
		if (!open || !workspaceId) return;
		let cancelled = false;
		queueMicrotask(() => {
			if (cancelled) return;
			setLoadingPageActors(true);
		});
		listMetaPageActors({
			workspaceId,
			providerId: "facebook",
			clientId: selectedClientId ?? null
		}).then((actors) => {
			if (cancelled) return;
			setMetaPageActors(Array.isArray(actors) ? actors : []);
		}).catch((error) => {
			if (cancelled) return;
			logError(error, "CreateMetaAdSetDialog:loadMetaPageActors");
			setMetaPageActors([]);
			reportConvexFailure({
				error,
				context: "CreateMetaAdSetDialog:loadMetaPageActors",
				title: "Failed to load Meta pages",
				fallbackMessage: "Failed to load Meta pages"
			});
		}).finally(() => {
			if (!cancelled) setLoadingPageActors(false);
		});
		return () => {
			cancelled = true;
		};
	}, [
		listMetaPageActors,
		open,
		selectedClientId,
		workspaceId
	]);
	const handleObjectiveChange = (updates) => {
		setObjectiveForm((prev) => ({
			...prev,
			...updates
		}));
	};
	const handleSubmit = async () => {
		if (!workspaceId || !name.trim()) return;
		const validationErrors = validateMetaAdSetObjective(campaignObjective, {
			pageId: pageId || void 0,
			engagementType: objectiveForm.engagementType,
			postId: objectiveForm.postId,
			eventId: objectiveForm.eventId,
			pixelId: objectiveForm.pixelId,
			conversionEvent: objectiveForm.conversionEvent,
			salesOptimizationMode: objectiveForm.salesOptimizationMode,
			productCatalogId: objectiveForm.productCatalogId,
			productSetId: objectiveForm.productSetId
		});
		if (validationErrors.length > 0) {
			notifyFailure({
				title: "Missing campaign settings",
				message: validationErrors.join(" ")
			});
			return;
		}
		setLoading(true);
		try {
			await createAdSet({
				workspaceId,
				providerId: "facebook",
				clientId: selectedClientId,
				campaignId,
				campaignObjective: campaignObjective ?? null,
				name: name.trim(),
				status: "PAUSED",
				dailyBudget: dailyBudget ? Number.isFinite(Number(dailyBudget)) ? Number(dailyBudget) : void 0 : void 0,
				pageId: pageId || void 0,
				engagementType: objectiveForm.engagementType,
				postId: objectiveForm.postId,
				eventId: objectiveForm.eventId,
				leadFormId: objectiveForm.leadFormId,
				pixelId: objectiveForm.pixelId,
				conversionEvent: objectiveForm.conversionEvent,
				salesOptimizationMode: objectiveForm.salesOptimizationMode,
				productCatalogId: objectiveForm.productCatalogId,
				productSetId: objectiveForm.productSetId
			});
			notifySuccess({
				title: "Ad set created",
				message: `"${name.trim()}" is ready for ads.`
			});
			onOpenChange(false);
			onCreated?.();
		} catch (error) {
			reportConvexFailure({
				error,
				context: "CreateMetaAdSetDialog",
				title: "Could not create ad set",
				fallbackMessage: asErrorMessage(error)
			});
		}
		setLoading(false);
	};
	const handleNameChange = (event) => {
		setName(event.target.value);
	};
	const handleDailyBudgetChange = (event) => {
		setDailyBudget(event.target.value);
	};
	const handleCancel = () => {
		onOpenChange(false);
	};
	const handleSubmitClick = () => {
		handleSubmit();
	};
	const submitDisabled = loading || !name.trim() || needsPage && !pageId || normalizedObjective === "OUTCOME_SALES" && (objectiveForm.salesOptimizationMode ?? "pixel") === "pixel" && (!objectiveForm.pixelId || !objectiveForm.conversionEvent) || normalizedObjective === "OUTCOME_SALES" && objectiveForm.salesOptimizationMode === "catalog" && !objectiveForm.productCatalogId;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg max-h-[90vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create ad set" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Adds a paused ad set to this campaign. Refine targeting on the Audience tab after creation." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
							id: "meta-adset-name",
							label: "Ad set name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "meta-adset-name",
								value: name,
								onChange: handleNameChange,
								placeholder: "US — Broad"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
							id: "meta-adset-budget",
							label: "Daily budget (optional)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "meta-adset-budget",
								type: "number",
								min: 1,
								value: dailyBudget,
								onChange: handleDailyBudgetChange
							})
						}),
						needsPage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
							id: "meta-adset-page",
							label: "Facebook Page",
							description: !loadingPageActors && metaPageActors.length === 0 ? "No Facebook Pages found for this integration token." : void 0,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: pageId || void 0,
								onValueChange: setPageId,
								disabled: loading || loadingPageActors,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "meta-adset-page",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: loadingPageActors ? "Loading pages…" : "Select a Facebook Page" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: metaPageActors.map((actor) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: actor.id,
									children: actor.name
								}, actor.id)) })]
							})
						}) : null,
						showObjectiveFlow && normalizedObjective ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectiveRenderer, {
							objective: normalizedObjective,
							formData: objectiveForm,
							onChange: handleObjectiveChange,
							disabled: loading,
							providerId: "facebook",
							metaContext
						}, `objective-${pageId}`) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: handleCancel,
					disabled: loading,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleSubmitClick,
					disabled: submitDisabled,
					children: loading ? "Creating…" : "Create ad set"
				})] })
			]
		}, `adset-${open}-${campaignObjective}`)
	});
}
function isAdSetActive(status) {
	const normalized = status.toUpperCase();
	return normalized === "ACTIVE" || normalized === "ENABLED";
}
function MetaAdSetsStrip({ adSets, togglingId, onToggleStatus }) {
	const handleToggle = (adSet) => () => {
		onToggleStatus(adSet);
	};
	if (adSets.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-b border-border/50 px-6 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
			children: "Ad sets"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-wrap gap-2",
			children: adSets.map((adSet) => {
				const active = isAdSetActive(adSet.status);
				const busy = togglingId === adSet.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 rounded-lg border border-border/60 bg-muted/15 px-2.5 py-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "max-w-[12rem] truncate text-sm font-medium",
							children: adSet.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: active ? "default" : "secondary",
							className: "text-[10px] capitalize",
							children: adSet.status.toLowerCase()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							className: cn("size-7 shrink-0", busy && "pointer-events-none opacity-60"),
							disabled: busy,
							onClick: handleToggle(adSet),
							"aria-label": active ? `Pause ${adSet.name}` : `Activate ${adSet.name}`,
							children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "size-3.5 animate-spin",
								"aria-hidden": true
							}) : active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {
								className: "size-3.5",
								"aria-hidden": true
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
								className: "size-3.5",
								"aria-hidden": true
							})
						})
					]
				}, adSet.id);
			})
		})]
	});
}
function deriveCreativeMetrics(raw) {
	if (!raw) return null;
	const spend = raw.spend ?? 0;
	const impressions = raw.impressions ?? 0;
	const clicks = raw.clicks ?? 0;
	const conversions = raw.conversions ?? 0;
	const revenue = raw.revenue ?? 0;
	return {
		spend,
		impressions,
		clicks,
		conversions,
		revenue,
		ctr: impressions > 0 ? clicks / impressions * 100 : 0,
		cpc: clicks > 0 ? spend / clicks : 0,
		cpa: conversions > 0 ? spend / conversions : 0,
		roas: spend > 0 ? revenue / spend : 0
	};
}
function getMetricsForAd(ad, adMetrics) {
	return adMetrics[ad.creativeId] ?? deriveCreativeMetrics(ad.metrics) ?? null;
}
function computeCreativeTotals(ads, adMetrics) {
	const empty = {
		spend: 0,
		impressions: 0,
		clicks: 0,
		conversions: 0,
		revenue: 0,
		ctr: 0,
		cpc: 0,
		cpa: 0,
		roas: 0,
		activeAds: ads.length,
		adsWithSpend: 0
	};
	let adsWithSpend = 0;
	const totals = ads.reduce((acc, ad) => {
		const metrics = getMetricsForAd(ad, adMetrics);
		if (!metrics || metrics.spend <= 0) return acc;
		adsWithSpend += 1;
		acc.spend += metrics.spend;
		acc.impressions += metrics.impressions;
		acc.clicks += metrics.clicks;
		acc.conversions += metrics.conversions;
		acc.revenue += metrics.revenue;
		return acc;
	}, empty);
	totals.adsWithSpend = adsWithSpend;
	totals.ctr = totals.impressions > 0 ? totals.clicks / totals.impressions * 100 : 0;
	totals.cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
	totals.cpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
	totals.roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;
	return totals;
}
function sortCreativesByMetric(ads, adMetrics, sortKey) {
	const sorted = [...ads];
	sorted.sort((a, b) => {
		if (sortKey === "name") {
			const nameA = (a.name || a.headlines?.[0] || a.creativeId).toLowerCase();
			const nameB = (b.name || b.headlines?.[0] || b.creativeId).toLowerCase();
			return nameA.localeCompare(nameB);
		}
		const metricsA = getMetricsForAd(a, adMetrics);
		const metricsB = getMetricsForAd(b, adMetrics);
		const valueA = metricsA?.[sortKey] ?? -1;
		const valueB = metricsB?.[sortKey] ?? -1;
		if (valueB !== valueA) return valueB - valueA;
		return (metricsB?.spend ?? 0) - (metricsA?.spend ?? 0);
	});
	return sorted;
}
function resolveCreativeInsights(ads, adMetrics) {
	const insights = /* @__PURE__ */ new Map();
	const withMetrics = ads.flatMap((ad) => {
		const metrics = getMetricsForAd(ad, adMetrics);
		return metrics ? [{
			ad,
			metrics
		}] : [];
	});
	if (withMetrics.length === 0) return insights;
	const avgCtr = computeCreativeTotals(ads, adMetrics).ctr;
	let topSpendId = null;
	let topSpend = -1;
	let bestRoasId = null;
	let bestRoas = -1;
	let highCtrId = null;
	let highCtr = -1;
	for (const { ad, metrics } of withMetrics) {
		if (metrics.spend > topSpend) {
			topSpend = metrics.spend;
			topSpendId = ad.creativeId;
		}
		if (metrics.spend >= 5 && metrics.roas > bestRoas) {
			bestRoas = metrics.roas;
			bestRoasId = ad.creativeId;
		}
		if (metrics.impressions >= 500 && metrics.ctr > highCtr) {
			highCtr = metrics.ctr;
			highCtrId = ad.creativeId;
		}
		if (metrics.spend >= 25 && (metrics.conversions === 0 || avgCtr > 0 && metrics.ctr < avgCtr * .5)) insights.set(ad.creativeId, "needs-review");
	}
	if (topSpendId) insights.set(topSpendId, "top-spend");
	if (bestRoasId && bestRoasId !== topSpendId) insights.set(bestRoasId, "best-roas");
	if (highCtrId && !insights.has(highCtrId)) insights.set(highCtrId, "high-ctr");
	return insights;
}
var CREATIVE_INSIGHT_LABELS = {
	"top-spend": {
		label: "Top spend",
		className: "border-primary/25 bg-primary/10 text-primary"
	},
	"best-roas": {
		label: "Best ROAS",
		className: "border-success/25 bg-success/10 text-success"
	},
	"high-ctr": {
		label: "High CTR",
		className: "border-info/25 bg-info/10 text-info"
	},
	"needs-review": {
		label: "Review",
		className: "border-warning/25 bg-warning/10 text-warning"
	}
};
var SORT_OPTIONS = [
	{
		value: "spend",
		label: "Spend (high → low)"
	},
	{
		value: "conversions",
		label: "Conversions"
	},
	{
		value: "ctr",
		label: "CTR"
	},
	{
		value: "roas",
		label: "ROAS"
	},
	{
		value: "name",
		label: "Name (A → Z)"
	}
];
var PERIOD_OPTIONS = [
	{
		value: "7",
		label: "Last 7 days"
	},
	{
		value: "30",
		label: "Last 30 days"
	},
	{
		value: "90",
		label: "Last 90 days"
	}
];
function formatPercent$2(value) {
	return `${value.toFixed(2)}%`;
}
function formatCompactNumber(value) {
	return EN_US_COMPACT_NUMBER_FORMATTER.format(value);
}
function KpiTile({ label, value, subValue, icon: Icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-[7.5rem] flex-1 flex-col gap-1 rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 shadow-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-3 shrink-0",
					"aria-hidden": true
				}), label]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold tabular-nums tracking-tight text-foreground",
				children: value
			}),
			subValue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[10px] text-muted-foreground",
				children: subValue
			}) : null
		]
	});
}
function CampaignCreativesPerformanceStrip({ totals, currency, periodDays, onPeriodChange, sortKey, onSortChange, metricsLoading, isMeta }) {
	const handleSortValueChange = (value) => onSortChange(value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-3 rounded-2xl border border-border/60 bg-gradient-to-br from-muted/25 via-card to-card p-4",
		"aria-label": "Creative performance summary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {
						className: "size-4 text-primary",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-semibold text-foreground",
						children: isMeta ? "Meta ad performance" : "Ad performance"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "max-w-xl text-xs text-muted-foreground",
					children: [
						"Spend and delivery metrics are attributed per ad (Meta ad id). Last ",
						periodDays,
						" days - compare creatives to spot budget drainers and winners."
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: periodDays,
					onValueChange: onPeriodChange,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "h-8 w-[9.5rem] border-border/60 bg-background text-xs shadow-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PERIOD_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: option.value,
						children: option.label
					}, option.value)) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: sortKey,
					onValueChange: handleSortValueChange,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "h-8 w-[11rem] border-border/60 bg-background text-xs shadow-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Sort" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SORT_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: option.value,
						children: option.label
					}, option.value)) })]
				})]
			})]
		}), metricsLoading && !totals ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6",
			children: [
				"kpi-1",
				"kpi-2",
				"kpi-3",
				"kpi-4",
				"kpi-5",
				"kpi-6"
			].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-xl" }, id))
		}) : totals ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiTile, {
					label: "Spend",
					value: formatCurrency$1(totals.spend, currency, {
						minimumFractionDigits: 0,
						maximumFractionDigits: 0
					}),
					subValue: `${totals.adsWithSpend} ads with spend`,
					icon: Wallet
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiTile, {
					label: "Impressions",
					value: formatCompactNumber(totals.impressions),
					icon: Target
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiTile, {
					label: "Clicks",
					value: formatCompactNumber(totals.clicks),
					icon: MousePointerClick
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiTile, {
					label: "Conversions",
					value: formatCompactNumber(totals.conversions),
					subValue: totals.cpa > 0 ? `CPA ${formatCurrency$1(totals.cpa, currency)}` : void 0,
					icon: TrendingUp
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiTile, {
					label: "CTR",
					value: formatPercent$2(totals.ctr),
					subValue: `CPC ${formatCurrency$1(totals.cpc, currency)}`,
					icon: Percent
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiTile, {
					label: "ROAS",
					value: totals.roas > 0 ? `${totals.roas.toFixed(2)}×` : "—",
					subValue: totals.revenue > 0 ? formatCurrency$1(totals.revenue, currency, { maximumFractionDigits: 0 }) : "No revenue tracked",
					icon: Sparkles
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground",
			children: "No spend data for this period yet. Sync metrics or widen the date range."
		})]
	});
}
function CreativeInsightBadge({ kind }) {
	const config = CREATIVE_INSIGHT_LABELS[kind];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "outline",
		className: cn("h-5 px-1.5 text-[9px] font-semibold uppercase tracking-wide", config.className),
		children: config.label
	});
}
function CreativeSpendShareBar({ share }) {
	const widthStyle = { width: `${Math.min(Math.max(share, 4), 100)}%` };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between text-[9px] uppercase tracking-wide text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Spend share" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "tabular-nums",
				children: [share.toFixed(0), "%"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-1 overflow-hidden rounded-full bg-muted",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full rounded-full bg-primary/80 transition-all",
				style: widthStyle
			})
		})]
	});
}
function CreativeMetricsGrid({ metrics, currency, compact = false }) {
	const cells = [
		{
			label: "Spend",
			value: formatCurrency$1(metrics.spend, currency)
		},
		{
			label: "Impr.",
			value: formatCompactNumber(metrics.impressions)
		},
		{
			label: "CTR",
			value: formatPercent$2(metrics.ctr)
		},
		{
			label: "Conv.",
			value: metrics.conversions.toLocaleString()
		},
		{
			label: "ROAS",
			value: metrics.roas > 0 ? `${metrics.roas.toFixed(2)}×` : "—"
		},
		{
			label: "CPC",
			value: metrics.clicks > 0 ? formatCurrency$1(metrics.cpc, currency) : "—"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("grid gap-x-2 gap-y-1 border-t border-border/50 pt-2", compact ? "grid-cols-2" : "grid-cols-3 sm:grid-cols-6"),
		children: cells.map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[9px] font-medium uppercase tracking-wide text-muted-foreground",
				children: cell.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] font-semibold tabular-nums text-foreground",
				children: cell.value
			})]
		}, cell.label))
	});
}
var IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
var VIDEO_ACCEPT = "video/mp4,video/quicktime,video/x-msvideo";
var MAX_MB = 30;
function CreativeMediaField({ mode = "image", previewSrc, imageUrl, imageHash, videoId, uploading = false, disabled = false, onImageUrlChange, onFileSelect, onClear }) {
	const isVideo = mode === "video";
	const accept = isVideo ? VIDEO_ACCEPT : IMAGE_ACCEPT;
	const ready = isVideo ? Boolean(videoId) : Boolean(imageHash);
	const inputRef = (0, import_react.useRef)(null);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [showUrlField, setShowUrlField] = (0, import_react.useState)(Boolean(imageUrl && !previewSrc));
	const [previewError, setPreviewError] = (0, import_react.useState)(false);
	const hasPreview = Boolean(previewSrc && !previewError);
	const openFilePicker = () => {
		if (!disabled && !uploading) inputRef.current?.click();
	};
	const handleDragOver = (event) => {
		event.preventDefault();
		setDragging(true);
	};
	const handleDragLeave = (event) => {
		event.preventDefault();
		setDragging(false);
	};
	const handleDrop = (event) => {
		event.preventDefault();
		setDragging(false);
		if (disabled || uploading) return;
		const file = event.dataTransfer.files?.[0];
		if (!file || !inputRef.current) return;
		const dt = new DataTransfer();
		dt.items.add(file);
		inputRef.current.files = dt.files;
		onFileSelect({ target: inputRef.current });
	};
	const handleUrlToggle = () => {
		setShowUrlField((value) => !value);
	};
	const handlePreviewError = () => {
		setPreviewError(true);
	};
	const handleImageUrlChange = (event) => {
		onImageUrlChange(event.target.value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: inputRef,
				type: "file",
				accept,
				"aria-label": "Upload creative media",
				className: "sr-only",
				disabled: disabled || uploading,
				onChange: onFileSelect
			}),
			hasPreview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-2xl border border-border/60 bg-muted/20 ring-1 ring-border/40",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative aspect-[1.91/1] max-h-[220px] w-full bg-muted/40 sm:aspect-video",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
						src: previewSrc,
						alt: "Uploaded creative preview",
						fill: true,
						unoptimized: true,
						sizes: "(max-width: 640px) 100vw, 480px",
						className: "object-cover",
						onError: handlePreviewError
					}), uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/75 backdrop-blur-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "size-7 animate-spin text-primary",
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-foreground",
							children: isVideo ? "Uploading video to Meta…" : "Uploading to Meta…"
						})]
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2 border-t border-border/50 bg-card/80 px-3 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2 text-xs",
						children: ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
							className: "size-4 text-success",
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: "Ready for ad creation"
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Preview only - upload to attach to Meta"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							className: "h-8",
							onClick: openFilePicker,
							disabled: disabled || uploading,
							children: "Replace"
						}), onClear ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							className: "size-8 text-muted-foreground hover:text-destructive",
							onClick: onClear,
							disabled: disabled || uploading,
							"aria-label": "Remove image",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
								className: "size-4",
								"aria-hidden": true
							})
						}) : null]
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: openFilePicker,
				onDragOver: handleDragOver,
				onDragLeave: handleDragLeave,
				onDrop: handleDrop,
				disabled: disabled || uploading,
				className: cn(ADS_PAGE_THEME.controlMapFrame, "flex w-full flex-col items-center justify-center gap-3 px-6 py-10 text-center transition-colors", "border-2 border-dashed", dragging ? "border-primary bg-primary/5" : "border-border/70 bg-muted/15 hover:border-primary/35 hover:bg-muted/25", (disabled || uploading) && "cursor-not-allowed opacity-60"),
				children: [uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "size-9 animate-spin text-primary",
					"aria-hidden": true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
						className: "size-6 text-primary",
						"aria-hidden": true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold text-foreground",
						children: uploading ? "Uploading…" : isVideo ? "Drop video here or click to browse" : "Drop image here or click to browse"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: isVideo ? `MP4 or MOV · up to ${MAX_MB}MB` : `JPG, PNG, or WebP · up to ${MAX_MB}MB · recommended 1080×1080 or 1200×628`
					})]
				})]
			}),
			!isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						className: "h-8 px-2 text-xs text-muted-foreground",
						onClick: handleUrlToggle,
						children: showUrlField ? "Hide URL option" : "Use image URL instead"
					}),
					imageHash ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-[10px] text-muted-foreground truncate max-w-[180px]",
						title: imageHash,
						children: ["hash …", imageHash.slice(-8)]
					}) : null,
					videoId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-[10px] text-muted-foreground truncate max-w-[180px]",
						title: videoId,
						children: ["video …", videoId.slice(-8)]
					}) : null
				]
			}) : null,
			showUrlField && !isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5 rounded-xl border border-border/50 bg-muted/10 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "creative-image-url",
						className: "text-xs text-muted-foreground",
						children: "Image URL (optional if you upload a file)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "creative-image-url",
						type: "url",
						placeholder: "https://cdn.example.com/hero.jpg",
						value: imageUrl,
						onChange: handleImageUrlChange,
						disabled: disabled || uploading
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground",
						children: "Meta still requires an uploaded hash for most image ads - URL alone may not be enough."
					})
				]
			}) : null
		]
	});
}
function leadFormPickerReducer(state, action) {
	switch (action.type) {
		case "setForms": return {
			forms: action.value.forms,
			loading: action.value.loading
		};
		case "setLoading": return {
			...state,
			loading: action.value
		};
		default: return state;
	}
}
function CreateCreativeLeadFormSection({ workspaceId, clientId, campaignObjective, pageId, leadFormId, disabled, onLeadFormIdChange }) {
	const [state, dispatch] = (0, import_react.useReducer)(leadFormPickerReducer, {
		forms: [],
		loading: false
	});
	const listLeadgenForms = useAction(adsMetaToolsApi.listLeadgenForms);
	const isLeadsCampaign = normalizeMetaCampaignObjective(campaignObjective) === "OUTCOME_LEADS";
	const canLoad = Boolean(isLeadsCampaign && workspaceId && pageId);
	(0, import_react.useEffect)(() => {
		if (!canLoad) {
			dispatch({
				type: "setForms",
				value: {
					forms: [],
					loading: false
				}
			});
			return;
		}
		let cancelled = false;
		dispatch({
			type: "setLoading",
			value: true
		});
		listLeadgenForms({
			workspaceId,
			clientId: clientId ?? null,
			pageId
		}).then((rows) => {
			if (cancelled) return;
			dispatch({
				type: "setForms",
				value: {
					forms: Array.isArray(rows) ? rows.map((row) => ({
						id: String(row.id),
						name: String(row.name)
					})) : [],
					loading: false
				}
			});
		}).catch((error) => {
			if (cancelled) return;
			reportConvexFailure({
				error,
				context: "CreateCreativeLeadFormSection:listLeadgenForms",
				title: "Could not load lead forms",
				fallbackMessage: "Could not load lead forms"
			});
			dispatch({
				type: "setLoading",
				value: false
			});
		});
		return () => {
			cancelled = true;
		};
	}, [
		canLoad,
		clientId,
		listLeadgenForms,
		pageId,
		workspaceId
	]);
	const handleSelect = (formId) => {
		onLeadFormIdChange(formId);
	};
	if (!isLeadsCampaign) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Instant lead form" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground mt-1",
			children: "Required for lead ads, attached to the creative call-to-action in Meta."
		})] }), !pageId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
			className: "text-xs",
			children: "Select a Facebook Page to load lead forms."
		}) }) : state.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				className: "size-4 animate-spin",
				"aria-hidden": true
			}), "Loading forms…"]
		}) : state.forms.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2 max-h-40 overflow-y-auto",
			children: state.forms.map((form) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeadFormOption, {
				form,
				disabled: Boolean(disabled),
				isSelected: leadFormId === form.id,
				onSelect: handleSelect
			}, form.id))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: "No forms on this page. Create one when setting up the ad set, then return here."
		})]
	});
}
function LeadFormOption({ form, disabled, isSelected, onSelect }) {
	const handleSelectLeadForm = () => {
		onSelect(form.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: handleSelectLeadForm,
		disabled,
		className: `flex items-center justify-between rounded-lg border p-3 text-left text-sm motion-chromatic ${isSelected ? "border-info/30 bg-info/10" : "border-border hover:border-info/50"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-2 min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
				className: "size-4 shrink-0 text-muted-foreground",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate font-medium",
				children: form.name
			})]
		}), isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, {
			className: "size-4 shrink-0 text-info",
			"aria-hidden": true
		}) : null]
	});
}
var CTA_OPTIONS = [
	{
		value: "LEARN_MORE",
		label: "Learn More"
	},
	{
		value: "SHOP_NOW",
		label: "Shop Now"
	},
	{
		value: "SIGN_UP",
		label: "Sign Up"
	},
	{
		value: "CONTACT_US",
		label: "Contact Us"
	},
	{
		value: "GET_QUOTE",
		label: "Get Quote"
	},
	{
		value: "DOWNLOAD",
		label: "Download"
	},
	{
		value: "BOOK_NOW",
		label: "Book Now"
	},
	{
		value: "GET_OFFER",
		label: "Get Offer"
	},
	{
		value: "SEE_MORE",
		label: "See More"
	},
	{
		value: "BUY_NOW",
		label: "Buy Now"
	},
	{
		value: "DONATE_NOW",
		label: "Donate Now"
	},
	{
		value: "APPLY_NOW",
		label: "Apply Now"
	},
	{
		value: "GET_DIRECTIONS",
		label: "Get Directions"
	},
	{
		value: "LIKE_PAGE",
		label: "Like Page"
	},
	{
		value: "WATCH_MORE",
		label: "Watch More"
	},
	{
		value: "LISTEN_NOW",
		label: "Listen Now"
	},
	{
		value: "UPDATE_APP",
		label: "Update App"
	}
];
function createTextChangeHandler(onChange) {
	return (event) => {
		onChange(event.target.value);
	};
}
function noopImageUrlChange(_value) {}
function createSelectChangeHandler(onChange) {
	return (value) => {
		onChange(value);
	};
}
function CreateCreativeDialogHeader({ providerId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create New Ad Creative" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
		"Create a new ad creative for your ",
		providerId === "facebook" ? "Meta" : providerId,
		" campaign."
	] })] });
}
function CreateCreativeDialogForm({ availableAdSets, body, callToActionType, description, imageHash, imagePreviewSrc, imageUrl, onClearImage, instagramActorId, instagramActorOptions, isMeta, linkUrl, loading, loadingPageActors, metaPageActors, name, objectType, onBodyChange, onCallToActionTypeChange, onClose, onDescriptionChange, onImageUpload, onVideoUpload, onImageUrlChange, onClearVideo, videoPreviewSrc, videoId, uploadingVideo, onInstagramActorIdChange, onLinkUrlChange, onNameChange, onObjectTypeChange, onPageIdChange, onSelectedAdSetIdChange, onStatusChange, onSubmit, onTitleChange, onVideoIdChange, pageId, selectedAdSetId, selectedPage, status, title, uploadingImage, workspaceId, clientId, campaignObjective, leadFormId, onLeadFormIdChange }) {
	const allowedObjectTypes = getMetaCreativeObjectTypeOptions(campaignObjective);
	const objectTypeLabels = {
		IMAGE: "Image Ad",
		VIDEO: "Video Ad",
		CAROUSEL: "Carousel Ad",
		DYNAMIC: "Dynamic Ad (catalog)"
	};
	const handleInstagramActorIdChange = (value) => {
		onInstagramActorIdChange(value === "__none__" ? "" : value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit,
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "name",
				label: "Creative Name *",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "name",
					placeholder: "Summer Sale Ad - Variant A",
					value: name,
					onChange: createTextChangeHandler(onNameChange),
					disabled: loading
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormField, {
				id: "objectType",
				label: "Ad Format",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: objectType,
					onValueChange: createSelectChangeHandler(onObjectTypeChange),
					disabled: loading,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "objectType",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: allowedObjectTypes.map((format) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: format,
						children: objectTypeLabels[format]
					}, format)) })]
				}), objectType === "DYNAMIC" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Use with a catalog-backed ad set (product catalog ID on the ad set). Meta serves product cards from the catalog; link URL is optional when the catalog drives the destination."
				}) : null]
			}),
			availableAdSets?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "adSet",
				label: "Ad Set",
				description: "The ad will be created in the selected ad set.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: selectedAdSetId,
					onValueChange: onSelectedAdSetIdChange,
					disabled: loading,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "adSet",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select an ad set" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: availableAdSets.map((adSet) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: adSet.id,
						children: adSet.name || adSet.id
					}, adSet.id)) })]
				})
			}) : null,
			isMeta && !selectedAdSetId && !availableAdSets?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2 rounded-md border border-warning/20 bg-warning/10 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
					className: "mt-0.5 size-4 text-warning",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-warning",
						children: "No Ad Set Available"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-warning/80",
						children: "You need to create an ad set before creating ads. Please create an ad set first."
					})]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "body",
				label: "Primary Text",
				description: `${body.length}/2200 characters`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "body",
					placeholder: "Enter your main ad copy here…",
					value: body,
					onChange: createTextChangeHandler(onBodyChange),
					disabled: loading,
					rows: 3,
					maxLength: 2200
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "title",
				label: "Headline",
				description: `${title.length}/40 characters`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "title",
					placeholder: "50% Off Everything",
					value: title,
					onChange: createTextChangeHandler(onTitleChange),
					disabled: loading,
					maxLength: 40
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "description",
				label: "Description",
				description: `${description.length}/30 characters`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "description",
					placeholder: "Limited time offer",
					value: description,
					onChange: createTextChangeHandler(onDescriptionChange),
					disabled: loading,
					maxLength: 30
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "cta",
				label: "Call to Action",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: callToActionType,
					onValueChange: onCallToActionTypeChange,
					disabled: loading,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "cta",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a call to action" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CTA_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: option.value,
						children: option.label
					}, option.value)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "linkUrl",
				label: "Destination URL",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "linkUrl",
					type: "url",
					placeholder: "https://yourwebsite.com/offer",
					value: linkUrl,
					onChange: createTextChangeHandler(onLinkUrlChange),
					disabled: loading
				})
			}),
			objectType === "IMAGE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "image",
				label: "Creative Image",
				description: imageHash ? "Uploaded to Meta — safe to create your ad." : "Upload the image Meta will serve in the feed.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeMediaField, {
					previewSrc: imagePreviewSrc,
					imageUrl,
					imageHash,
					uploading: uploadingImage,
					disabled: loading,
					onImageUrlChange,
					onFileSelect: onImageUpload,
					onClear: onClearImage
				})
			}) : null,
			objectType === "VIDEO" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormField, {
				id: "video",
				label: "Creative Video",
				description: videoId ? "Uploaded to Meta — safe to create your ad." : "Upload the video Meta will serve in the feed.",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeMediaField, {
					mode: "video",
					previewSrc: videoPreviewSrc,
					imageUrl: "",
					videoId,
					uploading: uploadingVideo,
					disabled: loading,
					onImageUrlChange: noopImageUrlChange,
					onFileSelect: onVideoUpload,
					onClear: onClearVideo
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "videoId",
						className: "text-xs text-muted-foreground",
						children: "Or paste Meta video ID"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "videoId",
						placeholder: "Meta video ID",
						value: videoId,
						onChange: createTextChangeHandler(onVideoIdChange),
						disabled: loading || uploadingVideo
					})]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "pageId",
				label: "Facebook Page *",
				description: !loadingPageActors && metaPageActors.length === 0 ? "No Facebook Pages found for this integration token." : void 0,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: pageId || void 0,
					onValueChange: onPageIdChange,
					disabled: loading || loadingPageActors,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "pageId",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: loadingPageActors ? "Loading pages..." : "Select a Facebook Page" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: metaPageActors.map((actor) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: actor.id,
						children: actor.name
					}, actor.id)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateCreativeLeadFormSection, {
				workspaceId,
				clientId,
				campaignObjective,
				pageId,
				leadFormId,
				disabled: loading,
				onLeadFormIdChange
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "instagramActorId",
				label: "Instagram Business Account",
				description: selectedPage?.instagramBusinessAccountId ? "Linked Instagram account for selected page is preselected." : "Selected page has no linked Instagram business account.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: instagramActorId || "__none__",
					onValueChange: handleInstagramActorIdChange,
					disabled: loading || loadingPageActors || instagramActorOptions.length === 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "instagramActorId",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "No linked Instagram account" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "__none__",
						children: "No Instagram account"
					}), instagramActorOptions.map((actor) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: actor.id,
						children: actor.label
					}, actor.id))] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "status",
				label: "Initial Status",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: status,
					onValueChange: createSelectChangeHandler(onStatusChange),
					disabled: loading,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "status",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "PAUSED",
						children: "Paused (recommended for review)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "ACTIVE",
						children: "Active"
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				onClick: onClose,
				disabled: loading,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				disabled: loading || !name.trim(),
				children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : null, loading ? "Creating…" : "Create Ad"]
			})] })
		]
	});
}
function toMetaCreativeObjectType(objectType) {
	switch (objectType) {
		case "CAROUSEL": return "CAROUSEL_IMAGE";
		case "DYNAMIC": return "DYNAMIC_CAROUSEL";
		default: return objectType;
	}
}
function parseImageHashFromCreativeSpec(spec) {
	const trimmed = spec.trim();
	if (!trimmed) return null;
	if (!trimmed.startsWith("{")) return trimmed;
	try {
		return JSON.parse(trimmed).image_hash ?? null;
	} catch {
		return null;
	}
}
function revokeBlobPreview(url) {
	if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}
function generateCreativeIdempotencyKey() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return `creative_${crypto.randomUUID()}`;
	return `creative_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function createInitialCreateCreativeDialogState(selectedAdSetId) {
	return {
		open: false,
		loading: false,
		uploadingImage: false,
		uploadingVideo: false,
		videoPreviewUrl: null,
		loadingPageActors: false,
		metaPageActors: [],
		selectedAdSetId,
		name: "",
		objectType: "IMAGE",
		title: "",
		body: "",
		description: "",
		callToActionType: "",
		linkUrl: "",
		imageUrl: "",
		imageHash: "",
		imagePreviewUrl: null,
		videoId: "",
		pageId: "",
		instagramActorId: "",
		leadFormId: "",
		status: "PAUSED"
	};
}
function createCreativeDialogReducer(state, action) {
	switch (action.type) {
		case "setOpen": return {
			...state,
			open: action.value
		};
		case "setLoading": return {
			...state,
			loading: action.value
		};
		case "setUploadingImage": return {
			...state,
			uploadingImage: action.value
		};
		case "setUploadingVideo": return {
			...state,
			uploadingVideo: action.value
		};
		case "setVideoPreviewUrl": return {
			...state,
			videoPreviewUrl: action.value
		};
		case "setLoadingPageActors": return {
			...state,
			loadingPageActors: action.value
		};
		case "setMetaPageActors": return {
			...state,
			metaPageActors: action.value
		};
		case "setSelectedAdSetId": return {
			...state,
			selectedAdSetId: action.value
		};
		case "setName": return {
			...state,
			name: action.value
		};
		case "setObjectType": return {
			...state,
			objectType: action.value
		};
		case "setTitle": return {
			...state,
			title: action.value
		};
		case "setBody": return {
			...state,
			body: action.value
		};
		case "setDescription": return {
			...state,
			description: action.value
		};
		case "setCallToActionType": return {
			...state,
			callToActionType: action.value
		};
		case "setLinkUrl": return {
			...state,
			linkUrl: action.value
		};
		case "setImageUrl": return {
			...state,
			imageUrl: action.value
		};
		case "setImageHash": return {
			...state,
			imageHash: action.value
		};
		case "setImagePreviewUrl": return {
			...state,
			imagePreviewUrl: action.value
		};
		case "setVideoId": return {
			...state,
			videoId: action.value
		};
		case "setPageId": return {
			...state,
			pageId: action.value
		};
		case "setInstagramActorId": return {
			...state,
			instagramActorId: action.value
		};
		case "setLeadFormId": return {
			...state,
			leadFormId: action.value
		};
		case "setStatus": return {
			...state,
			status: action.value
		};
		case "selectPage": return {
			...state,
			pageId: action.pageId,
			instagramActorId: action.instagramActorId,
			leadFormId: ""
		};
		case "clearImage": return {
			...state,
			imagePreviewUrl: null,
			imageUrl: "",
			imageHash: ""
		};
		case "clearVideo": return {
			...state,
			videoPreviewUrl: null,
			videoId: ""
		};
		case "reset": return createInitialCreateCreativeDialogState(action.selectedAdSetId);
		case "applyMetaPageActors": {
			const normalizedActors = action.actors;
			const currentPageId = state.pageId;
			const nextPageId = currentPageId && normalizedActors.some((actor) => actor.id === currentPageId) ? currentPageId : normalizedActors[0]?.id ?? "";
			if (!nextPageId) return {
				...state,
				metaPageActors: normalizedActors,
				pageId: "",
				instagramActorId: ""
			};
			const pageActor = normalizedActors.find((actor) => actor.id === nextPageId);
			return {
				...state,
				metaPageActors: normalizedActors,
				pageId: nextPageId,
				instagramActorId: pageActor?.instagramBusinessAccountId ?? ""
			};
		}
		case "clearMetaPageActorsOnError": return {
			...state,
			metaPageActors: [],
			pageId: "",
			instagramActorId: ""
		};
		default: return state;
	}
}
function useCreateCreativeDialogMedia({ dispatch, workspaceId, clientId, isMeta, imagePreviewRef, videoPreviewRef }) {
	const uploadMedia = useAction(adsCreativesApi.uploadMedia);
	const handleClearImage = () => {
		revokeBlobPreview(imagePreviewRef.current);
		imagePreviewRef.current = null;
		dispatch({ type: "clearImage" });
	};
	const handleClearVideo = () => {
		revokeBlobPreview(videoPreviewRef.current);
		videoPreviewRef.current = null;
		dispatch({ type: "clearVideo" });
	};
	const handleImageUpload = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;
		if (!isMeta) {
			notifySuccess({
				title: "Platform not supported",
				message: "Image upload is currently only supported for Meta (Facebook/Instagram) ads."
			});
			return;
		}
		if (!workspaceId) {
			notifySuccess({
				title: "Upload failed",
				message: "Sign in required"
			});
			return;
		}
		dispatch({
			type: "setUploadingImage",
			value: true
		});
		const blobUrl = URL.createObjectURL(file);
		revokeBlobPreview(imagePreviewRef.current);
		imagePreviewRef.current = blobUrl;
		dispatch({
			type: "setImagePreviewUrl",
			value: blobUrl
		});
		dispatch({
			type: "setImageUrl",
			value: ""
		});
		try {
			const fileData = await file.arrayBuffer();
			const result = await uploadMedia({
				workspaceId,
				providerId: "facebook",
				clientId: clientId ?? null,
				fileName: file.name,
				fileData,
				mimeType: file.type || void 0
			});
			if (!result.success) throw new Error("Failed to upload media");
			const spec = typeof result.creativeSpec === "string" ? result.creativeSpec : result.creativeSpec ? JSON.stringify(result.creativeSpec) : "";
			const hash = spec ? parseImageHashFromCreativeSpec(spec) : null;
			if (hash) {
				dispatch({
					type: "setImageHash",
					value: hash
				});
				notifySuccess({
					title: "Image uploaded",
					message: "Your image has been uploaded successfully."
				});
			}
		} catch (error) {
			logError(error, "CreateCreativeDialog:handleImageUpload");
			revokeBlobPreview(imagePreviewRef.current);
			imagePreviewRef.current = null;
			dispatch({ type: "clearImage" });
			notifySuccess({
				title: "Upload failed",
				message: asErrorMessage(error)
			});
		} finally {
			dispatch({
				type: "setUploadingImage",
				value: false
			});
			event.target.value = "";
		}
	};
	const handleVideoUpload = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;
		if (!isMeta) {
			notifySuccess({
				title: "Platform not supported",
				message: "Video upload is currently only supported for Meta (Facebook/Instagram) ads."
			});
			return;
		}
		if (!workspaceId) {
			notifySuccess({
				title: "Upload failed",
				message: "Sign in required"
			});
			return;
		}
		dispatch({
			type: "setUploadingVideo",
			value: true
		});
		const blobUrl = URL.createObjectURL(file);
		revokeBlobPreview(videoPreviewRef.current);
		videoPreviewRef.current = blobUrl;
		dispatch({
			type: "setVideoPreviewUrl",
			value: blobUrl
		});
		try {
			const fileData = await file.arrayBuffer();
			const result = await uploadMedia({
				workspaceId,
				providerId: "facebook",
				clientId: clientId ?? null,
				fileName: file.name,
				fileData,
				mimeType: file.type || void 0
			});
			if (!result.success) throw new Error("Failed to upload media");
			if (result.videoId) {
				dispatch({
					type: "setVideoId",
					value: result.videoId
				});
				notifySuccess({
					title: "Video uploaded",
					message: "Your video has been uploaded successfully."
				});
			}
		} catch (error) {
			logError(error, "CreateCreativeDialog:handleVideoUpload");
			revokeBlobPreview(videoPreviewRef.current);
			videoPreviewRef.current = null;
			dispatch({ type: "clearVideo" });
			notifySuccess({
				title: "Upload failed",
				message: asErrorMessage(error)
			});
		} finally {
			dispatch({
				type: "setUploadingVideo",
				value: false
			});
			event.target.value = "";
		}
	};
	return {
		handleClearImage,
		handleClearVideo,
		handleImageUpload,
		handleVideoUpload
	};
}
function useCreateCreativeDialog({ workspaceId, providerId, campaignId, campaignObjective, clientId, adSetId: propAdSetId, availableAdSets: _availableAdSets, onSuccess }) {
	const isLeadsCampaign = normalizeMetaCampaignObjective(campaignObjective) === "OUTCOME_LEADS";
	const isMeta = providerId === "facebook";
	const allowedObjectTypes = (() => {
		if (!isMeta) return [
			"IMAGE",
			"VIDEO",
			"CAROUSEL"
		];
		return getMetaCreativeObjectTypeOptions(campaignObjective);
	})();
	const [state, dispatch] = (0, import_react.useReducer)(createCreativeDialogReducer, propAdSetId, createInitialCreateCreativeDialogState);
	const { open, loading, uploadingImage, uploadingVideo, videoPreviewUrl, loadingPageActors, metaPageActors, selectedAdSetId, name, objectType, title, body, description, callToActionType, linkUrl, imageUrl, imageHash, imagePreviewUrl, videoId, pageId, instagramActorId, leadFormId, status } = state;
	(0, import_react.useEffect)(() => {
		if (objectType === "DYNAMIC" && !allowedObjectTypes.includes("DYNAMIC")) dispatch({
			type: "setObjectType",
			value: "IMAGE"
		});
	}, [allowedObjectTypes, objectType]);
	const videoPreviewRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		dispatch({
			type: "setSelectedAdSetId",
			value: propAdSetId
		});
	}, [propAdSetId]);
	const listMetaPageActors = useAction(adsCreativesApi.listMetaPageActors);
	const createCreative = useAction(adsCreativesApi.createCreative);
	const imagePreviewRef = (0, import_react.useRef)(null);
	const submissionRef = (0, import_react.useRef)(null);
	const resetForm = () => {
		revokeBlobPreview(imagePreviewRef.current);
		imagePreviewRef.current = null;
		revokeBlobPreview(videoPreviewRef.current);
		videoPreviewRef.current = null;
		dispatch({
			type: "reset",
			selectedAdSetId: propAdSetId
		});
		submissionRef.current = null;
	};
	const formFingerprint = JSON.stringify({
		name,
		objectType,
		title,
		body,
		description,
		callToActionType,
		linkUrl,
		imageUrl,
		imageHash,
		videoId,
		pageId,
		instagramActorId,
		leadFormId,
		status,
		selectedAdSetId: selectedAdSetId ?? null
	});
	const selectedPage = metaPageActors.find((actor) => actor.id === pageId) ?? null;
	const instagramActorOptions = (() => {
		const seen = /* @__PURE__ */ new Set();
		const options = [];
		for (const actor of metaPageActors) {
			const instagramId = actor.instagramBusinessAccountId;
			if (!instagramId || seen.has(instagramId)) continue;
			seen.add(instagramId);
			const accountLabel = actor.instagramBusinessAccountName || actor.instagramUsername || instagramId;
			options.push({
				id: instagramId,
				label: accountLabel
			});
		}
		return options;
	})();
	const handleSelectPage = (nextPageId) => {
		dispatch({
			type: "selectPage",
			pageId: nextPageId,
			instagramActorId: metaPageActors.find((row) => row.id === nextPageId)?.instagramBusinessAccountId ?? ""
		});
	};
	const handleOpenChange = (value) => {
		dispatch({
			type: "setOpen",
			value
		});
	};
	const setBody = (value) => dispatch({
		type: "setBody",
		value
	});
	const setCallToActionType = (value) => dispatch({
		type: "setCallToActionType",
		value
	});
	const setDescription = (value) => dispatch({
		type: "setDescription",
		value
	});
	const setImageUrl = (value) => dispatch({
		type: "setImageUrl",
		value
	});
	const setInstagramActorId = (value) => dispatch({
		type: "setInstagramActorId",
		value
	});
	const setLeadFormId = (value) => dispatch({
		type: "setLeadFormId",
		value
	});
	const setLinkUrl = (value) => dispatch({
		type: "setLinkUrl",
		value
	});
	const setName = (value) => dispatch({
		type: "setName",
		value
	});
	const setObjectType = (value) => dispatch({
		type: "setObjectType",
		value
	});
	const setSelectedAdSetId = (value) => dispatch({
		type: "setSelectedAdSetId",
		value
	});
	const setStatus = (value) => dispatch({
		type: "setStatus",
		value
	});
	const setTitle = (value) => dispatch({
		type: "setTitle",
		value
	});
	const setVideoId = (value) => dispatch({
		type: "setVideoId",
		value
	});
	(0, import_react.useEffect)(() => {
		if (!open || !isMeta || !workspaceId) return;
		let cancelled = false;
		dispatch({
			type: "setLoadingPageActors",
			value: true
		});
		listMetaPageActors({
			workspaceId,
			providerId: "facebook",
			clientId: clientId ?? null
		}).then((actors) => {
			if (cancelled) return;
			dispatch({
				type: "applyMetaPageActors",
				actors: Array.isArray(actors) ? actors : []
			});
		}).catch((error) => {
			if (cancelled) return;
			logError(error, "CreateCreativeDialog:loadMetaPageActors");
			dispatch({ type: "clearMetaPageActorsOnError" });
			reportConvexFailure({
				error,
				context: "create-creative-dialog.tsx:catch",
				title: "Failed to load Meta pages",
				fallbackMessage: "Failed to load Meta pages"
			});
		}).finally(() => {
			if (!cancelled) dispatch({
				type: "setLoadingPageActors",
				value: false
			});
		});
		return () => {
			cancelled = true;
		};
	}, [
		clientId,
		isMeta,
		listMetaPageActors,
		open,
		workspaceId
	]);
	const { handleClearImage, handleClearVideo, handleImageUpload, handleVideoUpload } = useCreateCreativeDialogMedia({
		dispatch,
		workspaceId: workspaceId ?? void 0,
		clientId,
		isMeta,
		imagePreviewRef,
		videoPreviewRef
	});
	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!workspaceId) {
			notifyFailure({
				title: "Error",
				message: "Sign in required"
			});
			return;
		}
		if (!name.trim()) {
			notifyFailure({
				title: "Validation error",
				message: "Creative name is required"
			});
			return;
		}
		if (!isMeta) {
			notifyFailure({
				title: "Platform not supported",
				message: "Creating creatives is currently only supported for Meta (Facebook/Instagram) ads."
			});
			return;
		}
		if (!selectedAdSetId) {
			notifyFailure({
				title: "Ad Set required",
				message: "Please select an ad set to create the ad."
			});
			return;
		}
		if (!pageId) {
			notifyFailure({
				title: "Facebook Page required",
				message: "Select a Facebook Page before creating a Meta creative."
			});
			return;
		}
		if (!metaPageActors.some((actor) => actor.id === pageId)) {
			notifyFailure({
				title: "Invalid Facebook Page",
				message: "The selected page is no longer available. Reload the page list and try again."
			});
			return;
		}
		if (isLeadsCampaign && !leadFormId) {
			notifyFailure({
				title: "Lead form required",
				message: "Select an instant lead form for this leads campaign creative."
			});
			return;
		}
		const currentSubmission = submissionRef.current;
		const effectiveIdempotencyKey = currentSubmission && currentSubmission.fingerprint === formFingerprint ? currentSubmission.key : generateCreativeIdempotencyKey();
		submissionRef.current = {
			fingerprint: formFingerprint,
			key: effectiveIdempotencyKey
		};
		dispatch({
			type: "setLoading",
			value: true
		});
		try {
			await createCreative({
				workspaceId,
				providerId: "facebook",
				clientId: clientId ?? null,
				idempotencyKey: effectiveIdempotencyKey,
				campaignId,
				adSetId: selectedAdSetId,
				name: name.trim(),
				objectType: toMetaCreativeObjectType(objectType),
				title: title.trim() || void 0,
				body: body.trim() || void 0,
				description: description.trim() || void 0,
				callToActionType: callToActionType || void 0,
				linkUrl: linkUrl.trim() || void 0,
				imageUrl: imageUrl.trim() || void 0,
				imageHash: imageHash || void 0,
				videoId: videoId || void 0,
				pageId,
				instagramActorId: instagramActorId || void 0,
				leadgenFormId: leadFormId || void 0,
				status
			});
			notifySuccess({
				title: "Creative created",
				message: `Your ad creative "${name}" has been created successfully.`
			});
			dispatch({
				type: "setOpen",
				value: false
			});
			resetForm();
			onSuccess?.();
		} catch (error) {
			logError(error, "CreateCreativeDialog:handleSubmit");
			notifyFailure({
				title: "Creation failed",
				error,
				fallbackMessage: asErrorMessage(error)
			});
		} finally {
			dispatch({
				type: "setLoading",
				value: false
			});
		}
	};
	const handleClose = () => {
		dispatch({
			type: "setOpen",
			value: false
		});
	};
	return {
		open,
		loading,
		uploadingImage,
		uploadingVideo,
		videoPreviewSrc: videoPreviewUrl,
		imagePreviewSrc: imagePreviewUrl,
		loadingPageActors,
		metaPageActors,
		selectedAdSetId,
		name,
		objectType,
		title,
		body,
		description,
		callToActionType,
		linkUrl,
		imageUrl,
		imageHash,
		videoId,
		pageId,
		instagramActorId,
		leadFormId,
		campaignObjective,
		status,
		isMeta,
		isLeadsCampaign,
		selectedPage,
		instagramActorOptions,
		handleOpenChange,
		setBody,
		setCallToActionType,
		setDescription,
		setImageUrl,
		setInstagramActorId,
		setLeadFormId,
		setLinkUrl,
		setName,
		setObjectType,
		setSelectedAdSetId,
		setStatus,
		setTitle,
		setVideoId,
		handleSelectPage,
		handleClearImage,
		handleClearVideo,
		handleImageUpload,
		handleVideoUpload,
		handleSubmit,
		handleClose
	};
}
function CreateCreativeDialog(props) {
	const { open, loading, uploadingImage, uploadingVideo, videoPreviewSrc, imagePreviewSrc, loadingPageActors, metaPageActors, selectedAdSetId, name, objectType, title, body, description, callToActionType, linkUrl, imageUrl, imageHash, videoId, pageId, instagramActorId, status, isMeta, selectedPage, instagramActorOptions, handleOpenChange, setBody, setCallToActionType, setDescription, setImageUrl, setInstagramActorId, setLinkUrl, setName, setObjectType, setSelectedAdSetId, setStatus, setTitle, setVideoId, handleSelectPage, handleClearImage, handleClearVideo, handleImageUpload, handleVideoUpload, handleSubmit, handleClose, leadFormId, campaignObjective, setLeadFormId } = useCreateCreativeDialog(props);
	const { providerId, availableAdSets, workspaceId, clientId } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: handleOpenChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: cn(pressableScaleClass),
				disabled: !isMeta || !selectedAdSetId,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), "Create Ad"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl max-h-[90vh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateCreativeDialogHeader, { providerId }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInStagger, {
				className: "space-y-4",
				stagger: .05,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateCreativeDialogForm, {
					availableAdSets,
					body,
					callToActionType,
					description,
					imageHash,
					imagePreviewSrc,
					imageUrl,
					onClearImage: handleClearImage,
					instagramActorId,
					instagramActorOptions,
					isMeta,
					linkUrl,
					loading,
					loadingPageActors,
					metaPageActors,
					name,
					objectType,
					onBodyChange: setBody,
					onCallToActionTypeChange: setCallToActionType,
					onClose: handleClose,
					onDescriptionChange: setDescription,
					onImageUpload: handleImageUpload,
					onVideoUpload: handleVideoUpload,
					onImageUrlChange: setImageUrl,
					onClearVideo: handleClearVideo,
					videoPreviewSrc,
					videoId,
					uploadingVideo,
					onInstagramActorIdChange: setInstagramActorId,
					onLinkUrlChange: setLinkUrl,
					onNameChange: setName,
					onObjectTypeChange: setObjectType,
					onPageIdChange: handleSelectPage,
					onSelectedAdSetIdChange: setSelectedAdSetId,
					onStatusChange: setStatus,
					onSubmit: handleSubmit,
					onTitleChange: setTitle,
					onVideoIdChange: setVideoId,
					pageId,
					selectedAdSetId,
					selectedPage,
					status,
					title,
					uploadingImage,
					workspaceId,
					clientId,
					campaignObjective,
					leadFormId,
					onLeadFormIdChange: setLeadFormId
				})
			})]
		})]
	});
}
function isAdEnabled(status) {
	const normalizedStatus = status.toUpperCase();
	return normalizedStatus === "ACTIVE" || normalizedStatus === "ENABLED" || normalizedStatus === "ENABLE";
}
function getCreativeTypeIcon(type, className) {
	const lowerType = type.toLowerCase();
	if (lowerType.includes("boosted") || lowerType.includes("page_post")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: className || "size-4" });
	if (lowerType.includes("video_responsive")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: className || "size-4" });
	if (lowerType.includes("shopping")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: className || "size-4" });
	if (lowerType.includes("carousel") || lowerType.includes("product_ad")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: className || "size-4" });
	if (lowerType.includes("video")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: className || "size-4" });
	if (lowerType.includes("image") || lowerType.includes("photo") || lowerType.includes("sponsored_status_update")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: className || "size-4" });
	if (lowerType.includes("text") || lowerType.includes("search")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: className || "size-4" });
	if (lowerType.includes("app") || lowerType.includes("call") || lowerType.includes("sponsored_inmails")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: className || "size-4" });
	if (lowerType.includes("hotel")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: className || "size-4" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: className || "size-4 text-muted-foreground/50" });
}
function getStatusVariant(status) {
	const s = status.toLowerCase();
	if (s === "enabled" || s === "enable" || s === "active") return "default";
	if (s === "paused" || s === "disable") return "secondary";
	if (s === "deleted" || s === "removed") return "destructive";
	return "outline";
}
function getNextAdStatus(providerId, checked) {
	if (providerId === "google") return checked ? "ENABLED" : "PAUSED";
	if (providerId === "tiktok") return checked ? "ENABLE" : "DISABLE";
	return checked ? "ACTIVE" : "PAUSED";
}
function stopNestedClickPropagation(event) {
	event.stopPropagation();
}
function CreativeStatusToggle({ providerId, status, onChange, showLabel = false, className, disabled }) {
	const handleCheckedChange = (checked) => {
		if (disabled) return;
		onChange(getNextAdStatus(providerId, checked));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked: isAdEnabled(status),
			onCheckedChange: handleCheckedChange,
			disabled,
			className: showLabel ? void 0 : "h-3.5 w-7"
		}), showLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "w-14 text-xs font-medium capitalize",
			children: status.toLowerCase()
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] font-medium uppercase tracking-wider text-viewer-chrome",
			children: status.toLowerCase()
		})]
	});
}
function CampaignAdsHeader({ availableAdSets, campaignId, campaignObjective, canLoad, clientId, convexProviderId, fetchAds, firstAdSetId, isMeta, isPreviewMode, loading, onCreateAdSet, setViewMode, summaryStats, viewMode, workspaceId }) {
	const handleSetGridView = () => setViewMode("grid");
	const handleSetListView = () => setViewMode("list");
	const handleRefresh = () => {
		fetchAds();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
		className: "border-b border-border/50 pb-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, {
						className: "size-5 text-primary",
						"aria-hidden": true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-0.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: ADS_PAGE_THEME.sectionEyebrow,
							children: "Creative library"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-lg font-semibold tracking-tight",
							children: "Ad creatives"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: isPreviewMode ? "Ads list is not available in preview mode." : loading ? "Loading creatives..." : summaryStats ? `${summaryStats.total} creatives` : "No creatives found" })
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					isMeta && canLoad ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: onCreateAdSet,
						children: "New ad set"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateCreativeDialog, {
						workspaceId,
						providerId: convexProviderId,
						campaignId,
						campaignObjective,
						clientId,
						adSetId: firstAdSetId,
						availableAdSets,
						onSuccess: fetchAds
					}, `creative-${campaignId}-${firstAdSetId ?? "none"}`),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center rounded-lg border p-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: viewMode === "grid" ? "secondary" : "ghost",
							size: "icon",
							className: "size-7",
							onClick: handleSetGridView,
							"aria-label": "Grid view",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid3x3, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: viewMode === "list" ? "secondary" : "ghost",
							size: "icon",
							className: "size-7",
							onClick: handleSetListView,
							"aria-label": "List view",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "size-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: handleRefresh,
						disabled: !canLoad || loading,
						"aria-label": "Refresh creatives",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-4", loading && "animate-spin") })
					})
				]
			})]
		})
	});
}
function CampaignAdsFilters({ searchQuery, setSearchQuery, statusFilter, setStatusFilter, typeFilter, setTypeFilter, uniqueStatuses, uniqueTypes }) {
	const handleSearchChange = (event) => {
		setSearchQuery(event.target.value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2 sm:flex-row",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search creatives…",
					value: searchQuery,
					onChange: handleSearchChange,
					className: "pl-9"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: typeFilter,
				onValueChange: setTypeFilter,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
					className: "w-full sm:w-[140px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "mr-2 size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Type" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "all",
					children: "All Types"
				}), uniqueTypes.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: type,
					className: "capitalize",
					children: type.toLowerCase().replace(/_/g, " ")
				}, type))] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: statusFilter,
				onValueChange: setStatusFilter,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "w-full sm:w-[140px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Status" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "all",
					children: "All Status"
				}), uniqueStatuses.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: status,
					className: "capitalize",
					children: status.toLowerCase()
				}, status))] })]
			})
		]
	});
}
function AdGridItem({ ad, adMetrics, currency, insightKind, maxSpend, onCreativeClick, onToggleStatus, providerId, togglingAdId }) {
	const onOpenCreative = () => onCreativeClick(ad);
	const handleToggleStatus = (nextStatus) => onToggleStatus(ad, nextStatus);
	const metrics = getMetricsForAd(ad, adMetrics);
	const spendShare = metrics && maxSpend > 0 ? metrics.spend / maxSpend * 100 : 0;
	const [imageFailed, setImageFailed] = (0, import_react.useState)(false);
	const handleImageError = () => setImageFailed(true);
	const previewImageUrl = ad.thumbnailUrl || ad.imageUrl;
	const socialPermalink = resolveMetaSocialPermalink(ad);
	const isBoostedPost = ad.type.toLowerCase().includes("boosted");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group relative overflow-hidden rounded-lg border bg-card text-left motion-chromatic hover:border-accent/50 hover:shadow-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onOpenCreative,
			className: "w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-square overflow-hidden bg-muted",
				children: [
					previewImageUrl && !imageFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
						src: previewImageUrl,
						alt: ad.name || "Creative preview",
						fill: true,
						unoptimized: true,
						sizes: "(max-width: 1024px) 50vw, 240px",
						className: "object-cover transition-transform group-hover:scale-105",
						onError: handleImageError
					}) : previewImageUrl && imageFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-full flex-col items-center justify-center gap-1.5 px-3 text-center text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
							className: "size-8 opacity-40",
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-medium",
							children: "Preview unavailable"
						})]
					}) : ad.videoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full items-center justify-center bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col items-center gap-1 text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-10" })
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-10 text-muted-foreground/30" })
					}),
					ad.videoUrl && previewImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 flex items-center justify-center bg-black/35",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-12 items-center justify-center rounded-full bg-card/95 shadow-sm ring-1 ring-border/50",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-6 text-foreground" })
						})
					}) : null,
					isBoostedPost ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute left-2 top-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "h-5 gap-1 bg-card/95 px-1.5 text-[9px] font-semibold shadow-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, {
								className: "size-3",
								"aria-hidden": true
							}), "Boosted post"]
						})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/15 group-hover:opacity-100",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground shadow-sm",
							children: "View Details"
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1.5 border-t bg-card p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "max-w-[60%] truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
							children: isBoostedPost ? "Boosted post" : ad.type
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1",
							children: [socialPermalink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: socialPermalink,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
								onClick: stopNestedClickPropagation,
								"aria-label": "Open on Facebook or Instagram",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: getStatusVariant(ad.status),
								className: "h-4 px-1 text-[8px] font-bold",
								children: ad.status
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "line-clamp-1 flex-1 text-xs font-semibold",
							children: ad.name || ad.headlines?.[0] || "Ad"
						}), insightKind ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeInsightBadge, { kind: insightKind }) : null]
					}),
					metrics ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeMetricsGrid, {
						metrics,
						currency,
						compact: true
					}), metrics.spend > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeSpendShareBar, { share: spendShare }) : null] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[10px] text-muted-foreground",
						children: "No spend in selected period"
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute right-2 top-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-1.5 rounded-full border border-viewer-chrome/20 bg-black/40 px-2 py-1 backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeStatusToggle, {
					providerId,
					status: ad.status,
					onChange: handleToggleStatus,
					disabled: togglingAdId === ad.creativeId
				})
			})
		})]
	});
}
function CampaignAdsGrid({ adMetrics, ads, creativeInsights, currency, maxSpend, onCreativeClick, onToggleStatus, providerId, togglingAdId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4",
		children: ads.map((ad) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdGridItem, {
			ad,
			adMetrics,
			currency,
			insightKind: creativeInsights.get(ad.creativeId),
			maxSpend,
			onCreativeClick,
			onToggleStatus,
			providerId,
			togglingAdId
		}, ad.creativeId))
	});
}
function formatPercent$1(value) {
	return `${value.toFixed(2)}%`;
}
function AdListRow({ ad, adMetrics, currency, insightKind, onCreativeClick, onToggleStatus, providerId, togglingAdId }) {
	const [listImageFailed, setListImageFailed] = (0, import_react.useState)(false);
	const onOpenCreative = () => onCreativeClick(ad);
	const handleToggleStatus = (nextStatus) => onToggleStatus(ad, nextStatus);
	const handleListImageError = () => setListImageFailed(true);
	const metrics = getMetricsForAd(ad, adMetrics);
	const permalink = providerId === "facebook" ? resolveMetaSocialPermalink({
		instagramPermalinkUrl: ad.instagramPermalinkUrl,
		objectStoryId: ad.objectStoryId
	}) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
		className: "cursor-pointer hover:bg-muted/50",
		onClick: onOpenCreative,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative flex size-14 items-center justify-center overflow-hidden rounded-lg border bg-muted",
				children: ad.imageUrl && !listImageFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
					src: ad.imageUrl,
					alt: "",
					fill: true,
					unoptimized: true,
					sizes: "56px",
					className: "object-cover",
					onError: handleListImageError
				}) : ad.imageUrl && listImageFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
					className: "size-5 text-muted-foreground/50",
					"aria-hidden": true
				}) : ad.videoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-5 text-muted-foreground" }) : getCreativeTypeIcon(ad.type, "size-5 text-muted-foreground")
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-[220px] truncate font-medium",
						children: ad.name || ad.headlines?.[0] || ad.descriptions?.[0] || ad.creativeId
					}), insightKind ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeInsightBadge, { kind: insightKind }) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[9px] font-bold uppercase text-muted-foreground",
						children: ad.type
					}), ad.pageName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[9px] text-muted-foreground",
						children: "•"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[9px] font-medium text-muted-foreground",
						children: ad.pageName
					})] }) : null]
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				onClick: stopNestedClickPropagation,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeStatusToggle, {
						providerId,
						status: ad.status,
						showLabel: true,
						onChange: handleToggleStatus,
						disabled: togglingAdId === ad.creativeId
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-right font-mono text-xs tabular-nums",
				children: metrics ? formatCurrency$1(metrics.spend, currency) : "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-right font-mono text-xs tabular-nums hidden md:table-cell",
				children: metrics ? metrics.impressions.toLocaleString() : "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-right font-mono text-xs tabular-nums",
				children: metrics ? metrics.clicks.toLocaleString() : "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-right font-mono text-xs tabular-nums hidden lg:table-cell",
				children: metrics ? formatPercent$1(metrics.ctr) : "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-right font-mono text-xs tabular-nums",
				children: metrics ? metrics.conversions.toLocaleString() : "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-right font-mono text-xs tabular-nums hidden lg:table-cell",
				children: metrics && metrics.roas > 0 ? `${metrics.roas.toFixed(2)}×` : "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "hidden xl:table-cell",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-[180px] truncate text-sm text-muted-foreground",
					children: ad.headlines?.[0] || ad.descriptions?.[0] || "—"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				onClick: stopNestedClickPropagation,
				children: permalink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: permalink,
					target: "_blank",
					rel: "noopener noreferrer",
					className: "inline-flex text-primary hover:opacity-90",
					title: "Open Instagram or Facebook post",
					"aria-label": "Open social permalink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Unavailable"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground" }) })
		]
	});
}
function CampaignAdsList({ adMetrics, ads, creativeInsights, currency, onCreativeClick, onToggleStatus, providerId, togglingAdId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-hidden rounded-xl border border-border/60",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
			className: "bg-muted/30 hover:bg-muted/30",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "w-16",
					children: "Preview"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Creative" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Spend"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right hidden md:table-cell",
					children: "Impr."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Clicks"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right hidden lg:table-cell",
					children: "CTR"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Conv."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right hidden lg:table-cell",
					children: "ROAS"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "hidden xl:table-cell",
					children: "Copy"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "w-10 text-center",
					children: "Link"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-10" })
			]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: ads.map((ad) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdListRow, {
			ad,
			adMetrics,
			currency,
			insightKind: creativeInsights.get(ad.creativeId),
			onCreativeClick,
			onToggleStatus,
			providerId,
			togglingAdId
		}, ad.creativeId)) })] })
	});
}
function campaignAdsSectionReducer(state, action) {
	switch (action.type) {
		case "setAdSets": return {
			...state,
			adSets: action.value
		};
		case "setAdSetDialogOpen": return {
			...state,
			adSetDialogOpen: action.value
		};
		case "setAds": return {
			...state,
			ads: action.value
		};
		case "setLoading": return {
			...state,
			loading: action.value
		};
		case "setSummary": return {
			...state,
			summary: action.value
		};
		case "setSearchQuery": return {
			...state,
			searchQuery: action.value
		};
		case "setTypeFilter": return {
			...state,
			typeFilter: action.value
		};
		case "setStatusFilter": return {
			...state,
			statusFilter: action.value
		};
		case "setHasLoaded": return {
			...state,
			hasLoaded: action.value
		};
		case "setViewMode": return {
			...state,
			viewMode: action.value
		};
		case "setAdMetrics": return {
			...state,
			adMetrics: action.value
		};
		case "setMetricsLoading": return {
			...state,
			metricsLoading: action.value
		};
		case "setPeriodDays": return {
			...state,
			periodDays: action.value
		};
		case "setSortKey": return {
			...state,
			sortKey: action.value
		};
		case "clearFilters": return {
			...state,
			searchQuery: "",
			typeFilter: "all",
			statusFilter: "all"
		};
		case "setTogglingAdSetId": return {
			...state,
			togglingAdSetId: action.value
		};
		case "setTogglingAdId": return {
			...state,
			togglingAdId: action.value
		};
		default: return state;
	}
}
function createInitialCampaignAdsSectionState() {
	return {
		adSets: [],
		adSetDialogOpen: false,
		ads: [],
		loading: true,
		summary: null,
		searchQuery: "",
		typeFilter: "all",
		statusFilter: "all",
		hasLoaded: false,
		viewMode: "grid",
		adMetrics: {},
		metricsLoading: false,
		periodDays: "30",
		sortKey: "spend",
		togglingAdSetId: null,
		togglingAdId: null
	};
}
function useCampaignAdsSection({ providerId, campaignId, clientId, isPreviewMode, currency }) {
	const { push } = useRouter$1();
	const { user } = useAuth();
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const displayCurrency = normalizeCurrencyCode(currency);
	const convexProviderId = toAdsProviderId(providerId);
	const isMeta = convexProviderId === "facebook";
	const listCreatives = useAction(adsCreativesApi.listCreatives);
	const listAdSets = useAction(adsAdSetsApi.listAdSets);
	const updateAdSetStatus = useAction(adsAdSetsApi.updateAdSetStatus);
	const updateCreativeStatus = useAction(adsCreativesApi.updateCreativeStatus);
	const listAdMetrics = useAction(adsAdMetricsApi.listAdMetrics);
	const [state, dispatch] = (0, import_react.useReducer)(campaignAdsSectionReducer, void 0, createInitialCampaignAdsSectionState);
	const { adSets, adSetDialogOpen, ads, loading, summary, searchQuery, typeFilter, statusFilter, hasLoaded, viewMode, adMetrics, metricsLoading, periodDays, sortKey, togglingAdSetId, togglingAdId } = state;
	const setViewMode = (value) => {
		dispatch({
			type: "setViewMode",
			value
		});
	};
	const setSearchQuery = (value) => {
		dispatch({
			type: "setSearchQuery",
			value
		});
	};
	const setStatusFilter = (value) => {
		dispatch({
			type: "setStatusFilter",
			value
		});
	};
	const setTypeFilter = (value) => {
		dispatch({
			type: "setTypeFilter",
			value
		});
	};
	const setPeriodDays = (value) => {
		dispatch({
			type: "setPeriodDays",
			value
		});
	};
	const setSortKey = (value) => {
		dispatch({
			type: "setSortKey",
			value
		});
	};
	const handleAdSetDialogOpenChange = (value) => {
		dispatch({
			type: "setAdSetDialogOpen",
			value
		});
	};
	const canLoad = !isPreviewMode;
	const fetchAds = (0, import_react.useEffectEvent)(async () => {
		if (!canLoad) {
			dispatch({
				type: "setLoading",
				value: false
			});
			return;
		}
		dispatch({
			type: "setAds",
			value: []
		});
		dispatch({
			type: "setHasLoaded",
			value: false
		});
		dispatch({
			type: "setLoading",
			value: true
		});
		if (!workspaceId) {
			dispatch({
				type: "setLoading",
				value: false
			});
			return;
		}
		await listCreatives({
			workspaceId,
			providerId: convexProviderId,
			clientId: clientId ?? null,
			campaignId,
			maxMetaCreativePages: convexProviderId === "facebook" ? 50 : void 0,
			maxGoogleAdsSearchPages: convexProviderId === "google" ? 20 : void 0
		}).then((creatives) => {
			const mapped = creatives;
			dispatch({
				type: "setAds",
				value: Array.isArray(mapped) ? mapped : []
			});
			dispatch({
				type: "setSummary",
				value: null
			});
			dispatch({
				type: "setHasLoaded",
				value: true
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CampaignAdsSection:fetchAds",
				title: "Error",
				fallbackMessage: "Error"
			});
		}).finally(() => {
			dispatch({
				type: "setLoading",
				value: false
			});
		});
	});
	const fetchAdSets = (0, import_react.useEffectEvent)(async () => {
		if (!canLoad || !workspaceId || !isMeta) return;
		await listAdSets({
			workspaceId,
			providerId: "facebook",
			clientId: clientId ?? null,
			campaignId
		}).then((rows) => {
			dispatch({
				type: "setAdSets",
				value: Array.isArray(rows) ? rows.map((row) => ({
					id: row.id,
					name: row.name || row.id,
					status: row.status ?? "PAUSED"
				})) : []
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CampaignAdsSection:fetchAdSets",
				title: "Failed to load ad sets",
				fallbackMessage: "Could not load ad sets for this campaign."
			});
		});
	});
	const fetchMetrics = (0, import_react.useEffectEvent)(async () => {
		if (!canLoad) return;
		dispatch({
			type: "setMetricsLoading",
			value: true
		});
		if (!workspaceId) {
			dispatch({
				type: "setMetricsLoading",
				value: false
			});
			return;
		}
		await listAdMetrics({
			workspaceId,
			providerId: convexProviderId,
			clientId: clientId ?? null,
			campaignId,
			days: periodDays
		}).then((data) => {
			const metrics = Array.isArray(data?.metrics) ? data.metrics ?? [] : [];
			const aggregated = {};
			metrics.forEach((m) => {
				if (!m.adId) return;
				const current = aggregated[m.adId] ?? {
					spend: 0,
					impressions: 0,
					clicks: 0,
					conversions: 0,
					revenue: 0,
					ctr: 0,
					cpc: 0,
					cpa: 0,
					roas: 0
				};
				current.spend += m.spend ?? 0;
				current.impressions += m.impressions ?? 0;
				current.clicks += m.clicks ?? 0;
				current.conversions += m.conversions ?? 0;
				current.revenue += m.revenue ?? 0;
				aggregated[m.adId] = deriveCreativeMetrics(current) ?? current;
			});
			dispatch({
				type: "setAdMetrics",
				value: aggregated
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CampaignAdsSection:fetchMetrics",
				title: "Failed to load ad metrics",
				fallbackMessage: "Could not load performance metrics for this campaign."
			});
		}).finally(() => {
			dispatch({
				type: "setMetricsLoading",
				value: false
			});
		});
	});
	(0, import_react.useEffect)(() => {
		if (!canLoad || !workspaceId) return;
		fetchAds();
		fetchAdSets();
	}, [
		canLoad,
		campaignId,
		clientId,
		convexProviderId,
		workspaceId
	]);
	(0, import_react.useEffect)(() => {
		if (!hasLoaded) return;
		fetchMetrics();
	}, [hasLoaded, periodDays]);
	const uniqueTypes = (() => {
		const types = new Set(ads.map((ad) => ad.type || "Unknown"));
		return Array.from(types);
	})();
	const uniqueStatuses = (() => {
		const statuses = new Set(ads.map((ad) => ad.status || "Unknown"));
		return Array.from(statuses);
	})();
	const availableAdSets = (() => {
		if (adSets.length > 0) return adSets;
		const adSetMap = /* @__PURE__ */ new Map();
		ads.forEach((ad) => {
			if (ad.adGroupId && !adSetMap.has(ad.adGroupId)) adSetMap.set(ad.adGroupId, ad.adGroupId);
		});
		return Array.from(adSetMap.values()).map((id) => ({
			id,
			name: `Ad Set ${id.slice(-6)}`
		}));
	})();
	const firstAdSetId = availableAdSets[0]?.id;
	const filteredAds = ads.filter((ad) => {
		const matchesSearch = !searchQuery || ad.name?.toLowerCase().includes(searchQuery.toLowerCase()) || ad.headlines?.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
		const matchesType = typeFilter === "all" || ad.type === typeFilter;
		const matchesStatus = statusFilter === "all" || ad.status === statusFilter;
		return matchesSearch && matchesType && matchesStatus;
	});
	const sortedFilteredAds = sortCreativesByMetric(filteredAds, adMetrics, sortKey);
	const performanceTotals = filteredAds.length > 0 ? computeCreativeTotals(filteredAds, adMetrics) : null;
	const creativeInsights = resolveCreativeInsights(sortedFilteredAds, adMetrics);
	const maxSpend = (() => {
		let max = 0;
		for (const ad of sortedFilteredAds) {
			const spend = getMetricsForAd(ad, adMetrics)?.spend ?? 0;
			if (spend > max) max = spend;
		}
		return max;
	})();
	const handleCreativeClick = (creative) => {
		const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
		const cName = creative.name || creative.headlines?.[0] || creative.creativeId;
		params.set("creativeName", cName);
		params.set("currency", displayCurrency);
		push(withPreviewModeSearchParamIfEnabled(`/dashboard/ads/campaigns/${providerId}/${campaignId}/creative/${creative.creativeId}?${params.toString()}`, isPreviewModeEnabled()));
	};
	const toggleAdStatus = (ad, newStatus) => {
		if (togglingAdId) return;
		const previousAds = [...ads];
		dispatch({
			type: "setAds",
			value: ads.map((a) => a.creativeId === ad.creativeId ? {
				...a,
				status: newStatus
			} : a)
		});
		if (!workspaceId) {
			dispatch({
				type: "setAds",
				value: previousAds
			});
			notifyFailure({
				title: "Error",
				message: "Sign in required"
			});
			return;
		}
		dispatch({
			type: "setTogglingAdId",
			value: ad.creativeId
		});
		updateCreativeStatus({
			workspaceId,
			providerId: convexProviderId,
			clientId: clientId ?? null,
			creativeId: ad.creativeId,
			adGroupId: ad.adGroupId,
			status: newStatus
		}).then(() => {
			notifySuccess({
				title: "Status Updated",
				message: `Ad is now ${newStatus.toLowerCase()}`
			});
		}).catch((error) => {
			dispatch({
				type: "setAds",
				value: previousAds
			});
			reportConvexFailure({
				error,
				context: "CampaignAdsSection:toggleAdStatus",
				title: "Error",
				fallbackMessage: "Error"
			});
		}).finally(() => {
			dispatch({
				type: "setTogglingAdId",
				value: null
			});
		});
	};
	const handleToggleAdStatus = (ad, nextStatus) => {
		toggleAdStatus(ad, nextStatus);
	};
	const summaryStats = (() => {
		if (!hasLoaded && ads.length === 0) return null;
		return {
			total: summary?.total ?? ads.length,
			totalTypes: summary ? Object.keys(summary.byType).length : new Set(ads.map((ad) => ad.type)).size,
			activeCount: summary?.byStatus?.ACTIVE ?? summary?.byStatus?.ENABLED ?? ads.filter((ad) => isAdEnabled(ad.status)).length
		};
	})();
	const handleClearFilters = () => {
		dispatch({ type: "clearFilters" });
	};
	const handleRefreshAll = async () => {
		await Promise.all([
			fetchAds(),
			fetchMetrics(),
			fetchAdSets()
		]);
	};
	const handleAdSetCreated = () => {
		fetchAdSets();
	};
	const handleOpenAdSetDialog = () => {
		dispatch({
			type: "setAdSetDialogOpen",
			value: true
		});
	};
	const handleToggleAdSetStatus = (adSet) => {
		if (!workspaceId || isPreviewMode) return;
		const nextStatus = adSet.status.toUpperCase() === "ACTIVE" ? "PAUSED" : "ACTIVE";
		const previous = adSets;
		dispatch({
			type: "setAdSets",
			value: adSets.map((row) => row.id === adSet.id ? {
				...row,
				status: nextStatus
			} : row)
		});
		dispatch({
			type: "setTogglingAdSetId",
			value: adSet.id
		});
		updateAdSetStatus({
			workspaceId,
			providerId: "facebook",
			clientId: clientId ?? null,
			adSetId: adSet.id,
			status: nextStatus
		}).then(() => {
			notifySuccess({
				title: "Ad set updated",
				message: `${adSet.name} is now ${nextStatus.toLowerCase()}.`
			});
		}).catch((error) => {
			dispatch({
				type: "setAdSets",
				value: previous
			});
			reportConvexFailure({
				error,
				context: "CampaignAdsSection:toggleAdSetStatus",
				title: "Could not update ad set",
				fallbackMessage: "Check Meta permissions and try again."
			});
		}).finally(() => {
			dispatch({
				type: "setTogglingAdSetId",
				value: null
			});
		});
	};
	return {
		state,
		dispatch,
		workspaceId,
		displayCurrency,
		convexProviderId,
		isMeta,
		canLoad,
		setViewMode,
		setSearchQuery,
		setStatusFilter,
		setTypeFilter,
		setPeriodDays,
		setSortKey,
		handleAdSetDialogOpenChange,
		uniqueTypes,
		uniqueStatuses,
		availableAdSets,
		firstAdSetId,
		filteredAds,
		sortedFilteredAds,
		performanceTotals,
		creativeInsights,
		maxSpend,
		handleCreativeClick,
		handleToggleAdStatus,
		summaryStats,
		handleClearFilters,
		handleRefreshAll,
		handleAdSetCreated,
		handleOpenAdSetDialog,
		loading,
		hasLoaded,
		viewMode,
		adMetrics,
		metricsLoading,
		periodDays,
		sortKey,
		searchQuery,
		statusFilter,
		typeFilter,
		adSetDialogOpen,
		togglingAdSetId,
		togglingAdId,
		handleToggleAdSetStatus
	};
}
function CampaignAdsSection({ providerId, campaignId, campaignObjective, clientId, isPreviewMode, currency }) {
	const { workspaceId, displayCurrency, convexProviderId, isMeta, canLoad, setViewMode, setSearchQuery, setStatusFilter, setTypeFilter, setPeriodDays, setSortKey, handleAdSetDialogOpenChange, uniqueTypes, uniqueStatuses, availableAdSets, firstAdSetId, sortedFilteredAds, filteredAds, performanceTotals, creativeInsights, maxSpend, handleCreativeClick, handleToggleAdStatus, summaryStats, handleClearFilters, handleRefreshAll, handleAdSetCreated, handleOpenAdSetDialog, handleToggleAdSetStatus, togglingAdSetId, togglingAdId, loading, hasLoaded, viewMode, adMetrics, metricsLoading, periodDays, sortKey, searchQuery, statusFilter, typeFilter, adSetDialogOpen, state } = useCampaignAdsSection({
		providerId,
		campaignId,
		clientId,
		isPreviewMode,
		currency
	});
	const ads = state.ads;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.surfaceCard,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignAdsHeader, {
				availableAdSets,
				campaignId,
				campaignObjective,
				canLoad,
				clientId,
				convexProviderId,
				fetchAds: handleRefreshAll,
				firstAdSetId,
				isMeta,
				isPreviewMode,
				loading,
				onCreateAdSet: handleOpenAdSetDialog,
				setViewMode,
				summaryStats,
				viewMode,
				workspaceId
			}),
			isMeta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateMetaAdSetDialog, {
				open: adSetDialogOpen,
				onOpenChange: handleAdSetDialogOpenChange,
				campaignId,
				campaignObjective,
				onCreated: handleAdSetCreated
			}) : null,
			isMeta && state.adSets.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaAdSetsStrip, {
				adSets: state.adSets,
				togglingId: togglingAdSetId,
				onToggleStatus: handleToggleAdSetStatus
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-4 pt-6",
				children: loading && !hasLoaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 flex-1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-32" })]
					}), viewMode === "grid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4",
						children: [
							"skeleton-a",
							"skeleton-b",
							"skeleton-c",
							"skeleton-d"
						].map((skeletonId) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-square rounded-lg" }, skeletonId))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64" })]
				}) : !canLoad ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center justify-center py-10 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-3 flex size-12 items-center justify-center rounded-full bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-6 text-muted-foreground" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Preview Mode"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: "Enable live mode to view ad creatives"
						})
					]
				}) : ads.length === 0 && hasLoaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center justify-center py-10 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-3 flex size-12 items-center justify-center rounded-full bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-6 text-muted-foreground" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "No Creatives Found"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: "This campaign doesn't have ad creatives yet"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignCreativesPerformanceStrip, {
						totals: performanceTotals,
						currency: displayCurrency,
						periodDays,
						onPeriodChange: setPeriodDays,
						sortKey,
						onSortChange: setSortKey,
						metricsLoading,
						isMeta
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignAdsFilters, {
						searchQuery,
						setSearchQuery,
						statusFilter,
						setStatusFilter,
						typeFilter,
						setTypeFilter,
						uniqueStatuses,
						uniqueTypes
					}),
					filteredAds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center py-8 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No creatives match your filters"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "link",
							size: "sm",
							onClick: handleClearFilters,
							children: "Clear filters"
						})]
					}) : viewMode === "grid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignAdsGrid, {
						adMetrics,
						ads: sortedFilteredAds,
						creativeInsights,
						currency: displayCurrency,
						maxSpend,
						onCreativeClick: handleCreativeClick,
						onToggleStatus: handleToggleAdStatus,
						providerId: convexProviderId,
						togglingAdId
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignAdsList, {
						adMetrics,
						ads: sortedFilteredAds,
						creativeInsights,
						currency: displayCurrency,
						onCreativeClick: handleCreativeClick,
						onToggleStatus: handleToggleAdStatus,
						providerId: convexProviderId,
						togglingAdId
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Showing ",
							sortedFilteredAds.length,
							" of ",
							ads.length,
							" creatives",
							metricsLoading ? " · refreshing metrics…" : ""
						] }), isMeta ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Metrics are per Meta ad (last ",
							periodDays,
							" days)"
						] }) : null]
					})
				] })
			})
		]
	});
}
function CampaignMetaToolsSection({ clientId, isPreviewMode, campaignObjective }) {
	const { user } = useAuth();
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const [metaToolsTab, setMetaToolsTab] = (0, import_react.useState)("events");
	const visibility = resolveMetaCampaignUiVisibility({
		campaignObjective,
		scope: "campaign"
	});
	const showEvents = hasMetaEventsTools(visibility);
	const showAdvanced = hasMetaAdvancedTools(visibility);
	if (isPreviewMode || !workspaceId || !hasAnyMetaCampaignTools(visibility)) return null;
	const panelProps = {
		workspaceId,
		clientId,
		campaignObjective,
		scope: "campaign"
	};
	if (showEvents && !showAdvanced) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.surfaceCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignControlHeader, {
			icon: Wrench,
			title: "Meta tools",
			description: visibility.metaToolsDescription
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "pt-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaEventsToolsPanel, { ...panelProps })
		})]
	});
	if (!showEvents && showAdvanced) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.surfaceCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignControlHeader, {
			icon: Wrench,
			title: "Meta tools",
			description: visibility.metaToolsDescription
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "pt-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaAdvancedToolsPanel, { ...panelProps })
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.surfaceCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignControlHeader, {
			icon: Wrench,
			title: "Meta tools",
			description: visibility.metaToolsDescription
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "pt-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: metaToolsTab,
				onValueChange: setMetaToolsTab,
				className: "w-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "mb-4 grid h-auto w-full grid-cols-2 gap-1 bg-muted/40 p-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "events",
							className: "gap-1.5 text-xs sm:text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, {
								className: "size-3.5 shrink-0",
								"aria-hidden": true
							}), "Conversions API"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "advanced",
							className: "gap-1.5 text-xs sm:text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Webhook, {
								className: "size-3.5 shrink-0",
								"aria-hidden": true
							}), "Pixel & webhooks"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionTabsContent, {
						activeTab: metaToolsTab,
						tabValue: "events",
						className: "mt-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaEventsToolsPanel, { ...panelProps })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionTabsContent, {
						activeTab: metaToolsTab,
						tabValue: "advanced",
						className: "mt-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaAdvancedToolsPanel, { ...panelProps })
					})
				]
			})
		})]
	});
}
function CampaignInsightsError({ message, onRetry, retrying = false, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn(ADS_PAGE_THEME.emptyState, "px-6 py-14", className),
		role: "alert",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
					className: "size-6",
					"aria-hidden": true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-md space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold text-foreground",
					children: "Could not load performance data"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground text-pretty",
					children: message
				})]
			}),
			onRetry ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				size: "sm",
				className: "gap-1.5 rounded-full",
				onClick: onRetry,
				disabled: retrying,
				"aria-busy": retrying,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
					className: cn("size-4", retrying && "animate-spin"),
					"aria-hidden": true
				}), retrying ? "Retrying…" : "Try again"]
			}) : null
		]
	});
}
function CampaignSection({ title, description, eyebrow, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn(ADS_PAGE_THEME.sectionBlock, className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: ADS_PAGE_THEME.sectionHeader,
			children: [
				eyebrow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: ADS_PAGE_THEME.sectionEyebrow,
					children: eyebrow
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: ADS_PAGE_THEME.sectionTitle,
					children: title
				}),
				description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn(ADS_PAGE_THEME.sectionDescription, "text-pretty"),
					children: description
				}) : null
			]
		}), children]
	});
}
function CampaignAdvancedCollapsible({ children }) {
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
					children: "Advanced tools"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-relaxed text-muted-foreground",
					children: "Custom formulas, Meta events and batch tools, pixels, and webhooks for this campaign."
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
function CampaignPageLayout({ performance, controls, creatives, advanced, creativesCount }) {
	const [tab, setTab] = (0, import_react.useState)("performance");
	const performanceBlock = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [performance, advanced ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignAdvancedCollapsible, { children: advanced }) : null]
	});
	const controlsBlock = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: controls
	});
	const creativesBlock = creatives;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
		value: tab,
		onValueChange: setTab,
		className: "w-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: ADS_PAGE_THEME.stickyTabBar,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: ADS_PAGE_THEME.mobileTabs,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "performance",
							className: ADS_PAGE_THEME.mobileTabTrigger,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {
								className: "size-3.5 shrink-0",
								"aria-hidden": true
							}), "Performance"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "controls",
							className: ADS_PAGE_THEME.mobileTabTrigger,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
								className: "size-3.5 shrink-0",
								"aria-hidden": true
							}), "Settings"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "creatives",
							className: ADS_PAGE_THEME.mobileTabTrigger,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, {
									className: "size-3.5 shrink-0",
									"aria-hidden": true
								}),
								"Creatives",
								typeof creativesCount === "number" && creativesCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-background px-1.5 py-0 text-[10px] font-semibold tabular-nums text-foreground shadow-sm",
									children: creativesCount
								}) : null
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "performance",
				className: "mt-6 space-y-8 focus-visible:outline-none",
				children: performanceBlock
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "controls",
				className: "mt-6 focus-visible:outline-none",
				children: controlsBlock
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "creatives",
				className: "mt-6 focus-visible:outline-none",
				children: creativesBlock
			})
		]
	});
}
var CHART_MARGIN = {
	left: 12,
	right: 12,
	top: 8,
	bottom: 8
};
var TICK_STYLE = { fontSize: 12 };
var AREA_CURSOR = { strokeDasharray: "3 3" };
var AREA_ACTIVE_DOT = {
	r: 5,
	strokeWidth: 0
};
var BAR_REACH_CURSOR = {
	fill: "var(--color-reach)",
	opacity: .1
};
var engagementChartConfig = {
	clicks: {
		label: "Clicks",
		color: CHART_COLORS.hsl.blue
	},
	ctr: {
		label: "CTR",
		color: CHART_COLORS.hsl.emerald
	}
};
var conversionsChartConfig = {
	conversions: {
		label: "Conversions",
		color: CHART_COLORS.hsl.emerald
	},
	revenue: {
		label: "Revenue",
		color: CHART_COLORS.hsl.indigo
	}
};
var costChartConfig = {
	cpc: {
		label: "CPC",
		color: CHART_COLORS.hsl.amber
	},
	cpa: {
		label: "CPA",
		color: CHART_COLORS.hsl.red
	}
};
var reachChartConfig = {
	reach: {
		label: "Reach",
		color: CHART_COLORS.hsl.blue
	},
	impressions: {
		label: "Impressions",
		color: CHART_COLORS.hsl.blue
	}
};
function useInsightsChartsFormatters(displayCurrency) {
	const engagementFormatter = (value, name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: engagementChartConfig[name]?.label ?? name
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono font-medium",
			children: name === "ctr" ? `${Number(value).toFixed(2)}%` : Number(value).toLocaleString("en-US")
		})]
	});
	const engagementTooltipContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltipContent, { formatter: engagementFormatter });
	const chartLegendContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegendContent, {});
	const conversionsTickFormatter = (value) => `${Number(value).toLocaleString("en-US")}`;
	const conversionsFormatter = (value, name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: conversionsChartConfig[name]?.label ?? name
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono font-medium",
			children: name === "revenue" ? formatMoney(Number(value), displayCurrency) : Number(value).toLocaleString("en-US")
		})]
	});
	const conversionsTooltipContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltipContent, { formatter: conversionsFormatter });
	const costTickFormatter = (value) => formatMoney(Number(value), displayCurrency);
	const costFormatter = (value, name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: costChartConfig[name]?.label ?? name
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono font-medium",
			children: formatMoney(Number(value), displayCurrency)
		})]
	});
	const costTooltipContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltipContent, { formatter: costFormatter });
	const reachTickFormatter = (value) => Number(value) >= 1e3 ? `${(Number(value) / 1e3).toFixed(1)}k` : String(value);
	const reachFormatter = (value, name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: reachChartConfig[name]?.label ?? name
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono font-medium",
			children: Number(value).toLocaleString("en-US")
		})]
	});
	return {
		engagementTooltipContent,
		chartLegendContent,
		conversionsTickFormatter,
		conversionsTooltipContent,
		costTickFormatter,
		costTooltipContent,
		reachTickFormatter,
		reachTooltipContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltipContent, { formatter: reachFormatter })
	};
}
function PerformanceOverviewChartSection({ chartMetrics, insightsLoading, displayCurrency }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.chartCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: ADS_PAGE_THEME.chartCardHeader,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold tracking-tight sm:text-lg",
					children: "Performance Overview"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4 cursor-help text-muted-foreground" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, {
					className: "max-w-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Revenue:" }), " Total income generated from campaign conversions."] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Ad Spend:" }), " Total amount invested in advertising for this campaign."]
					})]
				})] }) })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Spend and revenue over time" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "h-[300px] pt-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerformanceChart, {
				metrics: chartMetrics,
				loading: insightsLoading,
				currency: displayCurrency,
				dataSource: "ads",
				showDetailLink: false,
				hideHeader: true
			})
		})]
	});
}
function EngagementTrendsChartSection({ engagementChartData, insightsLoading, formatters }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.chartCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: ADS_PAGE_THEME.chartCardHeader,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold tracking-tight sm:text-lg",
					children: "Engagement Trends"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4 text-muted-foreground cursor-help" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, {
					className: "max-w-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Clicks:" }), " Total number of times users clicked on your ad."] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "CTR (Click-Through Rate):" }), " Percentage of impressions that resulted in a click. Higher CTR indicates more engaging ad content."]
					})]
				})] }) })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Clicks & CTR over time" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "h-[300px] pt-2",
			children: insightsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-full" }) : engagementChartData.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full items-center justify-center text-sm text-muted-foreground",
				children: "No engagement data available"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContainer, {
				config: engagementChartConfig,
				className: "size-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
					data: engagementChartData,
					margin: CHART_MARGIN,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
							id: "fillClicks",
							x1: "0",
							y1: "0",
							x2: "0",
							y2: "1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "5%",
								stopColor: "var(--color-clicks)",
								stopOpacity: .3
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "95%",
								stopColor: "var(--color-clicks)",
								stopOpacity: .05
							})]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							strokeDasharray: "3 3",
							vertical: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "dateFormatted",
							axisLine: false,
							tickLine: false,
							tickMargin: 10,
							tick: TICK_STYLE
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							axisLine: false,
							tickLine: false,
							tickMargin: 8,
							tick: TICK_STYLE
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip$1, {
							cursor: AREA_CURSOR,
							content: formatters.engagementTooltipContent
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegend, { content: formatters.chartLegendContent }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							type: "monotone",
							dataKey: "clicks",
							stroke: "var(--color-clicks)",
							strokeWidth: 2,
							fill: "url(#fillClicks)",
							dot: false,
							activeDot: AREA_ACTIVE_DOT
						})
					]
				})
			})
		})]
	});
}
function ConversionsChartSection({ conversionsChartData, insightsLoading, formatters }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.chartCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: ADS_PAGE_THEME.chartCardHeader,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold tracking-tight sm:text-lg",
					children: "Conversions Over Time"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4 text-muted-foreground cursor-help" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, {
					className: "max-w-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Conversions:" }), " Number of desired actions completed (purchases, sign-ups, etc.) attributed to your campaign."] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Revenue:" }), " Total monetary value generated from conversions."]
					})]
				})] }) })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Daily conversion performance" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "h-[300px] pt-2",
			children: insightsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-full" }) : conversionsChartData.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full items-center justify-center text-sm text-muted-foreground",
				children: "No conversion data available"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContainer, {
				config: conversionsChartConfig,
				className: "size-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
					data: conversionsChartData,
					margin: CHART_MARGIN,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
							id: "fillConversions",
							x1: "0",
							y1: "0",
							x2: "0",
							y2: "1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "5%",
								stopColor: "var(--color-conversions)",
								stopOpacity: .3
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "95%",
								stopColor: "var(--color-conversions)",
								stopOpacity: .05
							})]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							strokeDasharray: "3 3",
							vertical: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "dateFormatted",
							axisLine: false,
							tickLine: false,
							tickMargin: 10,
							tick: TICK_STYLE
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							axisLine: false,
							tickLine: false,
							tickMargin: 8,
							tick: TICK_STYLE,
							tickFormatter: formatters.conversionsTickFormatter
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip$1, {
							cursor: AREA_CURSOR,
							content: formatters.conversionsTooltipContent
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegend, { content: formatters.chartLegendContent }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							type: "monotone",
							dataKey: "conversions",
							stroke: "var(--color-conversions)",
							strokeWidth: 2,
							fill: "url(#fillConversions)",
							dot: false,
							activeDot: AREA_ACTIVE_DOT
						})
					]
				})
			})
		})]
	});
}
function CostEfficiencyChartSection({ conversionsChartData, insightsLoading, formatters }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: ADS_PAGE_THEME.chartCard,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: ADS_PAGE_THEME.chartCardHeader,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold tracking-tight sm:text-lg",
					children: "Cost Efficiency"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4 text-muted-foreground cursor-help" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, {
					className: "max-w-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "CPC (Cost Per Click):" }), " Average amount spent for each click. Lower CPC means more efficient ad spend."] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "CPA (Cost Per Acquisition):" }), " Average cost to acquire one conversion. Lower CPA indicates better campaign efficiency."]
					})]
				})] }) })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "CPC & CPA trends" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "h-[300px] pt-2",
			children: insightsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-full" }) : conversionsChartData.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full items-center justify-center text-sm text-muted-foreground",
				children: "No cost efficiency data available"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContainer, {
				config: costChartConfig,
				className: "size-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
					data: conversionsChartData,
					margin: CHART_MARGIN,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							strokeDasharray: "3 3",
							vertical: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "dateFormatted",
							axisLine: false,
							tickLine: false,
							tickMargin: 10,
							tick: TICK_STYLE
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							axisLine: false,
							tickLine: false,
							tickMargin: 8,
							tick: TICK_STYLE,
							tickFormatter: formatters.costTickFormatter
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip$1, {
							cursor: false,
							content: formatters.costTooltipContent
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegend, { content: formatters.chartLegendContent }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							dataKey: "cpc",
							fill: "var(--color-cpc)",
							radius: [
								4,
								4,
								0,
								0
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							dataKey: "cpa",
							fill: "var(--color-cpa)",
							radius: [
								4,
								4,
								0,
								0
							]
						})
					]
				})
			})
		})]
	});
}
function ReachVsImpressionsChartSection({ reachChartData, formatters }) {
	if (reachChartData.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: cn(ADS_PAGE_THEME.chartCard, "lg:col-span-2"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: ADS_PAGE_THEME.chartCardHeader,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold tracking-tight sm:text-lg",
					children: "Reach vs Impressions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4 text-muted-foreground cursor-help" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, {
					className: "max-w-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Reach:" }), " The number of unique people who saw your ads at least once."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Impressions:" }), " The number of times your ads were on screen."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Frequency:" }), " Average number of times each person saw your ad (Impressions / Reach)."]
						})
					]
				})] }) })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Unique reach compared to total impressions" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "h-[350px]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContainer, {
				config: reachChartConfig,
				className: "size-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
					data: reachChartData,
					margin: CHART_MARGIN,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							strokeDasharray: "3 3",
							vertical: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "dateFormatted",
							axisLine: false,
							tickLine: false,
							tickMargin: 10,
							tick: TICK_STYLE
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							axisLine: false,
							tickLine: false,
							tickMargin: 8,
							tick: TICK_STYLE,
							tickFormatter: formatters.reachTickFormatter
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip$1, {
							cursor: BAR_REACH_CURSOR,
							content: formatters.reachTooltipContent
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLegend, { content: formatters.chartLegendContent }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							dataKey: "impressions",
							fill: "var(--color-impressions)",
							radius: [
								4,
								4,
								0,
								0
							],
							maxBarSize: 40
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							dataKey: "reach",
							fill: "var(--color-reach)",
							radius: [
								4,
								4,
								0,
								0
							],
							maxBarSize: 40
						})
					]
				})
			})
		})]
	});
}
function InsightsChartsSection({ chartMetrics, engagementChartData, conversionsChartData, reachChartData, insightsLoading, currency = "USD" }) {
	const displayCurrency = normalizeCurrencyCode(currency);
	const formatters = useInsightsChartsFormatters(displayCurrency);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerformanceOverviewChartSection, {
				chartMetrics,
				insightsLoading,
				displayCurrency
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EngagementTrendsChartSection, {
				engagementChartData,
				insightsLoading,
				formatters
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversionsChartSection, {
				conversionsChartData,
				insightsLoading,
				formatters
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CostEfficiencyChartSection, {
				conversionsChartData,
				insightsLoading,
				formatters
			}),
			reachChartData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReachVsImpressionsChartSection, {
				reachChartData,
				formatters
			}) : null
		]
	});
}
function formatCurrency(value, currency = "USD") {
	return formatEnUsCurrencyMaxFractionDigits(value, currency, 2);
}
function formatNumber(value) {
	return EN_US_NUMBER_MAX_2_FORMATTER.format(value);
}
function formatPercent(value) {
	return `${value.toFixed(2)}%`;
}
function MetricCard({ label, value, subValue, icon: Icon, trend, loading, description, featured = false }) {
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(ADS_PAGE_THEME.kpiTile, "group", featured && "border-primary/20 bg-linear-to-br from-primary/[0.04] via-card to-muted/15 ring-1 ring-primary/10"),
		children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-20 rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-28 rounded-md" })]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: ADS_PAGE_THEME.kpiLabel,
						children: label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn(ADS_PAGE_THEME.kpiValue, featured && "text-3xl"),
						children: value
					}),
					subValue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium text-muted-foreground",
						children: subValue
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("rounded-xl p-2.5 ring-1", trend === "up" ? "bg-success/10 text-success ring-success/15" : trend === "down" ? "bg-destructive/10 text-destructive ring-destructive/15" : "bg-primary/10 text-primary ring-primary/15"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-5",
					"aria-hidden": true
				})
			})]
		})
	});
	if (!description) return content;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCardPreview, {
		description,
		children: content
	});
}
function MetricCardsSection({ metrics, loading, currency, efficiencyScore, defaultMoreMetricsOpen = false }) {
	const [hasUserToggled, setHasUserToggled] = (0, import_react.useState)(false);
	const [moreOpen, setMoreOpen] = (0, import_react.useState)(false);
	const effectiveMoreOpen = hasUserToggled ? moreOpen : defaultMoreMetricsOpen;
	const handleMoreOpenChange = (next) => {
		setHasUserToggled(true);
		setMoreOpen(next);
	};
	const displayCurrency = normalizeCurrencyCode(currency);
	const displayEfficiencyScore = typeof efficiencyScore === "number" && Number.isFinite(efficiencyScore) ? Math.max(0, Math.min(100, Math.round(efficiencyScore))) : null;
	const secondaryMetrics = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
			label: "Impressions",
			value: metrics ? formatNumber(metrics.impressions) : "—",
			icon: Eye,
			loading,
			description: "Number of times your ad was shown to potential customers"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
			label: "Conv. Rate",
			value: metrics ? formatPercent(metrics.convRate) : "—",
			subValue: metrics ? `${formatNumber(metrics.conversions)} conv.` : void 0,
			icon: TrendingUp,
			loading,
			description: "Conversion Rate - percentage of clicks that resulted in a conversion"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
			label: "Avg. CPC",
			value: metrics ? formatCurrency(metrics.cpc, displayCurrency) : "—",
			icon: CreditCard,
			loading,
			description: "Average Cost Per Click - average cost each time someone clicks your ad"
		}),
		metrics?.reach !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
			label: "Total Reach",
			value: formatNumber(metrics.reach),
			icon: Users,
			loading,
			subValue: metrics ? `${(metrics.reach / metrics.impressions * 100).toFixed(1)}% of impressions` : void 0,
			description: "Number of unique people who saw your ad at least once"
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
			label: "Efficiency Score",
			value: displayEfficiencyScore !== null ? `${displayEfficiencyScore}%` : "—",
			icon: TrendingUp,
			loading,
			description: "Overall performance health rating combining spend, revenue, conversions, and other metrics"
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "Total Spend",
					value: metrics ? formatCurrency(metrics.spend, displayCurrency) : "—",
					icon: CreditCard,
					loading,
					featured: true,
					description: "Total amount spent on advertising during the selected time period"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "ROAS",
					value: metrics ? `${metrics.roas.toFixed(2)}x` : "—",
					trend: metrics && metrics.roas > 2 ? "up" : "neutral",
					icon: TrendingUp,
					loading,
					featured: true,
					description: "Return on Ad Spend - revenue generated per dollar spent. Higher is better."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "CTR",
					value: metrics ? formatPercent(metrics.ctr) : "—",
					subValue: metrics ? `${formatNumber(metrics.clicks)} clicks` : void 0,
					icon: MousePointerClick,
					loading,
					featured: true,
					description: "Click-Through Rate - percentage of people who clicked after seeing your ad"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "CPA",
					value: metrics ? formatCurrency(metrics.cpa, displayCurrency) : "—",
					trend: metrics && metrics.cpa < 20 ? "up" : "down",
					icon: Target,
					loading,
					featured: true,
					description: "Cost Per Acquisition - average cost to get one conversion. Lower is better."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Collapsible, {
			open: effectiveMoreOpen,
			onOpenChange: handleMoreOpenChange,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					className: "w-full gap-1.5 rounded-xl text-muted-foreground hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
						className: cn("size-4 transition-transform", effectiveMoreOpen && "rotate-180"),
						"aria-hidden": true
					}), effectiveMoreOpen ? "Hide additional metrics" : "Show additional metrics"]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent, {
				className: "pt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
					children: secondaryMetrics
				})
			})]
		})]
	});
}
function toIsoDateOnly(date) {
	return date.toISOString().split("T")[0];
}
function parseIsoDateOnly(value) {
	if (!value) return null;
	const d = /* @__PURE__ */ new Date(`${value}T00:00:00.000Z`);
	if (Number.isNaN(d.getTime())) return null;
	return d;
}
function parseIsoDateTime(value) {
	if (!value) return null;
	let normalizedValue = value;
	if (/[+-]\d{4}$/.test(value)) normalizedValue = value.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
	const d = new Date(normalizedValue);
	if (Number.isNaN(d.getTime())) return null;
	return d;
}
function clampDateRange(range) {
	const end = range.end;
	return {
		start: range.start.getTime() > end.getTime() ? end : range.start,
		end
	};
}
function createCampaignLifetimeDateRange(campaignStart, campaignStop) {
	if (!campaignStart && !campaignStop) return null;
	const now = /* @__PURE__ */ new Date();
	const end = campaignStop && campaignStop <= now ? campaignStop : now;
	return clampDateRange({
		start: campaignStart ?? new Date(new Date(end).setDate(end.getDate() - 30)),
		end
	});
}
function isProviderId(value) {
	return value === "google" || value === "tiktok" || value === "linkedin" || value === "facebook";
}
function campaignInsightsPageReducer(state, action) {
	switch (action.type) {
		case "setDateRange": return {
			...state,
			dateRange: action.value
		};
		case "setCampaignLoading": return {
			...state,
			campaignLoading: action.value
		};
		case "setCampaignError": return {
			...state,
			campaignError: action.value
		};
		case "setCampaign": return {
			...state,
			campaign: action.value
		};
		case "patchCampaign": return {
			...state,
			campaign: action.updater(state.campaign)
		};
		case "setInsightsLoading": return {
			...state,
			insightsLoading: action.value
		};
		case "setInsightsError": return {
			...state,
			insightsError: action.value
		};
		case "setInsights": return {
			...state,
			insights: action.value
		};
		default: return state;
	}
}
function createInitialDateRange(searchParams, campaignStartFromUrl, campaignStopFromUrl, initialStart, initialEnd) {
	const lifetimeRange = createCampaignLifetimeDateRange(campaignStartFromUrl, campaignStopFromUrl);
	if (lifetimeRange) return lifetimeRange;
	if (initialStart || initialEnd) {
		const end = initialEnd ?? (initialStart ? new Date(new Date(initialStart).setDate(initialStart.getDate() + 6)) : /* @__PURE__ */ new Date());
		return clampDateRange({
			start: initialStart ?? new Date(new Date(end).setDate(end.getDate() - 6)),
			end
		});
	}
	const end = /* @__PURE__ */ new Date();
	return {
		start: new Date(new Date(end).setDate(end.getDate() - 30)),
		end
	};
}
function createInitialCampaign(searchParams, campaignId, providerId) {
	const name = searchParams.get("campaignName");
	if (!name) return null;
	return {
		id: campaignId,
		providerId,
		name,
		status: "UNKNOWN",
		startTime: searchParams.get("campaignStartTime") ?? void 0,
		stopTime: searchParams.get("campaignStopTime") ?? void 0
	};
}
function useCampaignInsightsPage() {
	const params = useParams$1();
	const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
	const { selectedClientId } = useClientContext();
	const { isPreviewMode } = usePreview();
	const { user } = useAuth();
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const listCampaigns = useAction(adsCampaignsApi.listCampaigns);
	const getCampaignInsights = useAction(adsCampaignInsightsApi.getCampaignInsights);
	const providerId = params.providerId;
	const campaignId = params.campaignId;
	const initialStart = parseIsoDateOnly(searchParams.get("startDate"));
	const initialEnd = parseIsoDateOnly(searchParams.get("endDate"));
	const campaignStartFromUrl = parseIsoDateTime(searchParams.get("campaignStartTime"));
	const campaignStopFromUrl = parseIsoDateTime(searchParams.get("campaignStopTime"));
	const dateRangeTouchedRef = (0, import_react.useRef)(false);
	const [state, dispatch] = (0, import_react.useReducer)(campaignInsightsPageReducer, {
		dateRange: createInitialDateRange(searchParams, campaignStartFromUrl, campaignStopFromUrl, initialStart, initialEnd),
		campaignLoading: false,
		campaignError: null,
		campaign: createInitialCampaign(searchParams, campaignId, providerId),
		insightsLoading: false,
		insightsError: null,
		insights: null
	});
	const { dateRange, campaignLoading, campaignError, campaign, insightsLoading, insightsError, insights } = state;
	const handleDateRangeChange = (next) => {
		dateRangeTouchedRef.current = true;
		dispatch({
			type: "setDateRange",
			value: next
		});
	};
	const formulaEditor = useFormulaEditor({ isPreviewMode });
	(0, import_react.useEffect)(() => {
		if (dateRangeTouchedRef.current) return;
		const lifetimeRange = createCampaignLifetimeDateRange(parseIsoDateTime(campaign?.startTime ?? null), parseIsoDateTime(campaign?.stopTime ?? null));
		if (!lifetimeRange) return;
		const frameId = requestAnimationFrame(() => {
			dispatch({
				type: "setDateRange",
				value: lifetimeRange
			});
		});
		return () => {
			cancelAnimationFrame(frameId);
		};
	}, [campaign?.startTime, campaign?.stopTime]);
	const loadCampaign = (0, import_react.useCallback)(async () => {
		dispatch({
			type: "setCampaignLoading",
			value: true
		});
		dispatch({
			type: "setCampaignError",
			value: null
		});
		if (isPreviewMode) {
			const previewCampaigns = getPreviewCampaigns(providerId);
			const match = previewCampaigns.find((c) => c.id === campaignId) ?? previewCampaigns[0] ?? null;
			if (!match) {
				dispatch({
					type: "setCampaignError",
					value: "Campaign not found"
				});
				dispatch({
					type: "setCampaignLoading",
					value: false
				});
				return;
			}
			dispatch({
				type: "setCampaign",
				value: match
			});
			dispatch({
				type: "setCampaignLoading",
				value: false
			});
			return;
		}
		if (!workspaceId) {
			dispatch({
				type: "setCampaignLoading",
				value: false
			});
			return;
		}
		if (!isProviderId(providerId)) {
			dispatch({
				type: "setCampaignError",
				value: "Unsupported provider"
			});
			dispatch({
				type: "setCampaignLoading",
				value: false
			});
			return;
		}
		await listCampaigns({
			workspaceId,
			providerId,
			clientId: selectedClientId ?? null
		}).then((campaigns) => {
			const match = (Array.isArray(campaigns) ? campaigns : []).find((c) => c.id === campaignId) ?? null;
			if (!match) throw new Error("Campaign not found");
			dispatch({
				type: "setCampaign",
				value: match
			});
		}).catch((err) => {
			logError(err, "CampaignInsights:loadCampaign");
			dispatch({
				type: "setCampaignError",
				value: asErrorMessage(err)
			});
		}).finally(() => {
			dispatch({
				type: "setCampaignLoading",
				value: false
			});
		});
	}, [
		campaignId,
		isPreviewMode,
		listCampaigns,
		providerId,
		selectedClientId,
		workspaceId
	]);
	const loadInsights = (0, import_react.useCallback)(async () => {
		if (!isPreviewMode && providerId !== "facebook") {
			dispatch({
				type: "setInsightsError",
				value: "Detailed insights are currently only supported for Meta (facebook)."
			});
			dispatch({
				type: "setInsights",
				value: null
			});
			return;
		}
		dispatch({
			type: "setInsightsLoading",
			value: true
		});
		dispatch({
			type: "setInsightsError",
			value: null
		});
		const startDate = toIsoDateOnly(dateRange.start);
		const endDate = toIsoDateOnly(dateRange.end);
		if (isPreviewMode) {
			dispatch({
				type: "setInsights",
				value: getPreviewCampaignInsights(providerId, campaignId, startDate, endDate)
			});
			dispatch({
				type: "setInsightsLoading",
				value: false
			});
			return;
		}
		if (!workspaceId) {
			dispatch({
				type: "setInsightsLoading",
				value: false
			});
			return;
		}
		if (!isProviderId(providerId)) {
			dispatch({
				type: "setInsightsError",
				value: "Unsupported provider"
			});
			dispatch({
				type: "setInsightsLoading",
				value: false
			});
			return;
		}
		await getCampaignInsights({
			workspaceId,
			providerId,
			campaignId,
			clientId: selectedClientId ?? null,
			startDate,
			endDate
		}).then((rawData) => {
			const data = rawData;
			dispatch({
				type: "setInsights",
				value: data
			});
			if (data.currency) dispatch({
				type: "patchCampaign",
				updater: (prev) => {
					if (!prev || prev.currency && prev.currency !== "USD") return prev;
					return {
						...prev,
						currency: data.currency
					};
				}
			});
		}).catch((err) => {
			logError(err, "CampaignInsights:loadInsights");
			dispatch({
				type: "setInsightsError",
				value: asErrorMessage(err)
			});
			dispatch({
				type: "setInsights",
				value: null
			});
		}).finally(() => {
			dispatch({
				type: "setInsightsLoading",
				value: false
			});
		});
	}, [
		campaignId,
		dateRange.end,
		dateRange.start,
		getCampaignInsights,
		isPreviewMode,
		providerId,
		selectedClientId,
		workspaceId
	]);
	(0, import_react.useEffect)(() => {
		const frameId = requestAnimationFrame(() => {
			loadCampaign();
		});
		return () => {
			cancelAnimationFrame(frameId);
		};
	}, [loadCampaign]);
	(0, import_react.useEffect)(() => {
		const frameId = requestAnimationFrame(() => {
			loadInsights();
		});
		return () => {
			cancelAnimationFrame(frameId);
		};
	}, [loadInsights]);
	const chartMetrics = (() => {
		return (insights?.series ?? []).map((row) => ({
			date: row.date,
			spend: row.spend,
			revenue: row.revenue
		}));
	})();
	const calculatedMetrics = (() => {
		const totals = insights?.totals;
		if (!totals) return null;
		const { spend, impressions, clicks, conversions, revenue } = totals;
		return {
			spend,
			impressions,
			clicks,
			conversions,
			revenue,
			ctr: impressions > 0 ? clicks / impressions * 100 : 0,
			cpc: clicks > 0 ? spend / clicks : 0,
			cpa: conversions > 0 ? spend / conversions : 0,
			roas: spend > 0 ? revenue / spend : 0,
			convRate: clicks > 0 ? conversions / clicks * 100 : 0,
			reach: insights?.totals?.reach ?? void 0,
			days: insights?.series.length || 0
		};
	})();
	const engagementChartData = (() => {
		return (insights?.series ?? []).map((row) => {
			const ctr = row.impressions > 0 ? row.clicks / row.impressions * 100 : 0;
			return {
				date: row.date,
				dateFormatted: new Date(row.date).toLocaleDateString(void 0, {
					month: "short",
					day: "numeric"
				}),
				clicks: row.clicks,
				impressions: row.impressions,
				ctr
			};
		});
	})();
	const conversionsChartData = (() => {
		return (insights?.series ?? []).map((row) => ({
			date: row.date,
			dateFormatted: new Date(row.date).toLocaleDateString(void 0, {
				month: "short",
				day: "numeric"
			}),
			conversions: row.conversions,
			revenue: row.revenue,
			cpc: row.clicks > 0 ? row.spend / row.clicks : 0,
			cpa: row.conversions > 0 ? row.spend / row.conversions : 0
		}));
	})();
	const reachChartData = (() => {
		const series = insights?.series ?? [];
		if (!series.some((row) => row.reach !== null && row.reach !== void 0)) return void 0;
		return series.map((row) => ({
			date: row.date,
			dateFormatted: new Date(row.date).toLocaleDateString(void 0, {
				month: "short",
				day: "numeric"
			}),
			reach: row.reach || 0,
			impressions: row.impressions
		}));
	})();
	const efficiencyScore = (() => {
		if (!calculatedMetrics) return null;
		return calculateEfficiencyScore({
			providerId: campaign?.providerId || "unknown",
			totalSpend: calculatedMetrics.spend,
			totalRevenue: calculatedMetrics.revenue,
			totalClicks: calculatedMetrics.clicks,
			totalConversions: calculatedMetrics.conversions,
			totalImpressions: calculatedMetrics.impressions,
			averageRoaS: calculatedMetrics.roas,
			averageCpc: calculatedMetrics.cpc,
			averageCtr: calculatedMetrics.ctr || 0,
			averageConvRate: calculatedMetrics.convRate || (calculatedMetrics.clicks > 0 ? calculatedMetrics.conversions / calculatedMetrics.clicks * 100 : 0),
			period: "current",
			dayCount: insights?.series?.length || 0
		});
	})();
	const algorithmicInsightsList = (() => {
		if (!calculatedMetrics) return [];
		return calculateAlgorithmicInsights({
			providerId: campaign?.providerId || "unknown",
			totalSpend: calculatedMetrics.spend,
			totalRevenue: calculatedMetrics.revenue,
			totalClicks: calculatedMetrics.clicks,
			totalConversions: calculatedMetrics.conversions,
			totalImpressions: calculatedMetrics.impressions,
			averageRoaS: calculatedMetrics.roas,
			averageCpc: calculatedMetrics.cpc,
			averageCtr: calculatedMetrics.ctr || 0,
			averageConvRate: calculatedMetrics.convRate || (calculatedMetrics.clicks > 0 ? calculatedMetrics.conversions / calculatedMetrics.clicks * 100 : 0),
			period: "current",
			dayCount: insights?.series?.length || 0
		});
	})();
	const displayCurrency = normalizeCurrencyCode(insights?.currency ?? campaign?.currency);
	const handleRetryCampaign = () => {
		loadCampaign();
	};
	const handleRetryInsights = () => {
		loadInsights();
	};
	return {
		providerId,
		campaignId,
		isPreviewMode,
		selectedClientId,
		dateRange,
		campaignLoading,
		campaignError,
		campaign,
		insightsLoading,
		insightsError,
		formulaEditor,
		calculatedMetrics,
		chartMetrics,
		engagementChartData,
		conversionsChartData,
		reachChartData,
		efficiencyScore,
		algorithmicInsightsList,
		displayCurrency,
		handleDateRangeChange,
		loadInsights,
		loadCampaign,
		handleRetryCampaign,
		handleRetryInsights
	};
}
function CampaignInsightsErrorBanner({ message, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionCard, {
		className: "overflow-hidden rounded-2xl border border-destructive/25 bg-destructive/5 ring-1 ring-destructive/15",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex flex-wrap items-center gap-3 p-4 text-sm text-destructive",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: message
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				size: "sm",
				className: "rounded-xl",
				onClick: onRetry,
				children: "Retry"
			})]
		})
	});
}
function CampaignInsightsPerformanceSection({ calculatedMetrics, insightsLoading, displayCurrency, efficiencyScore, insightsError, chartMetrics, engagementChartData, conversionsChartData, reachChartData, algorithmicInsightsList, onRetryInsights }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignSection, {
			eyebrow: "Snapshot",
			title: "Key metrics",
			description: "Totals for the selected date range. Expand for reach, efficiency, and cost breakdowns.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCardsSection, {
				metrics: calculatedMetrics,
				loading: insightsLoading,
				currency: displayCurrency,
				efficiencyScore
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignSection, {
			eyebrow: "Charts",
			title: "Trends",
			description: "Spend, engagement, conversions, and reach over time.",
			children: insightsError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignInsightsError, {
				message: insightsError,
				onRetry: onRetryInsights,
				retrying: insightsLoading
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsChartsSection, {
				chartMetrics,
				engagementChartData,
				conversionsChartData,
				reachChartData,
				insightsLoading,
				currency: displayCurrency
			})
		}),
		!insightsLoading && !insightsError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlgorithmicInsightsSection, {
			insights: algorithmicInsightsList,
			loading: insightsLoading,
			efficiencyScore: efficiencyScore ?? 0
		}) : null
	] });
}
function CampaignInsightsControlsSection({ providerId, campaignId, selectedClientId, isPreviewMode, displayCurrency, campaign, onReloadCampaign }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetControlSection, {
		providerId,
		campaignId,
		clientId: selectedClientId,
		isPreviewMode,
		currency: displayCurrency,
		budget: campaign?.budget,
		budgetType: campaign?.budgetType,
		onReloadCampaign
	}, `budget-${providerId}-${campaignId}-${campaign?.budgetType ?? "none"}-${campaign?.budget ?? "none"}`), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceControlSection, {
		providerId,
		campaignId,
		clientId: selectedClientId,
		isPreviewMode,
		campaignObjective: campaign?.objective
	})] });
}
function CampaignInsightsCreativesSection({ providerId, campaignId, selectedClientId, isPreviewMode, displayCurrency, campaign }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignAdsSection, {
		providerId,
		campaignId,
		campaignObjective: campaign?.objective,
		clientId: selectedClientId,
		isPreviewMode,
		currency: displayCurrency
	});
}
function CampaignInsightsAdvancedSection({ providerId, selectedClientId, isPreviewMode, campaign, formulaEditor, calculatedMetrics, insightsLoading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormulaBuilderCard, {
			formulaEditor,
			metricTotals: calculatedMetrics ?? void 0,
			loading: insightsLoading
		}), providerId === "facebook" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignMetaToolsSection, {
			clientId: selectedClientId,
			isPreviewMode,
			campaignObjective: campaign?.objective
		}) : null]
	});
}
function CampaignInsightsPageBody({ page }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignPageLayout, {
		performance: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignInsightsPerformanceSection, {
			calculatedMetrics: page.calculatedMetrics,
			insightsLoading: page.insightsLoading,
			displayCurrency: page.displayCurrency,
			efficiencyScore: page.efficiencyScore,
			insightsError: page.insightsError,
			chartMetrics: page.chartMetrics,
			engagementChartData: page.engagementChartData,
			conversionsChartData: page.conversionsChartData,
			reachChartData: page.reachChartData,
			algorithmicInsightsList: page.algorithmicInsightsList,
			onRetryInsights: page.handleRetryInsights
		}),
		controls: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignInsightsControlsSection, {
			providerId: page.providerId,
			campaignId: page.campaignId,
			selectedClientId: page.selectedClientId,
			isPreviewMode: page.isPreviewMode,
			displayCurrency: page.displayCurrency,
			campaign: page.campaign,
			onReloadCampaign: page.loadCampaign
		}),
		creatives: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignInsightsCreativesSection, {
			providerId: page.providerId,
			campaignId: page.campaignId,
			selectedClientId: page.selectedClientId,
			isPreviewMode: page.isPreviewMode,
			displayCurrency: page.displayCurrency,
			campaign: page.campaign
		}),
		advanced: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignInsightsAdvancedSection, {
			providerId: page.providerId,
			selectedClientId: page.selectedClientId,
			isPreviewMode: page.isPreviewMode,
			campaign: page.campaign,
			formulaEditor: page.formulaEditor,
			calculatedMetrics: page.calculatedMetrics,
			insightsLoading: page.insightsLoading
		})
	});
}
function CampaignInsightsPageContent() {
	const page = useCampaignInsightsPage();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: page.campaignLoading,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignInsightsPageSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: ADS_PAGE_THEME.innerContainer,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignHeader, {
					campaign: page.campaign,
					loading: page.campaignLoading,
					dateRange: page.dateRange,
					onDateRangeChange: page.handleDateRangeChange,
					onRefresh: page.loadInsights,
					refreshing: page.insightsLoading,
					onCampaignUpdated: page.loadCampaign
				}),
				page.campaignError && !page.isPreviewMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignInsightsErrorBanner, {
					message: page.campaignError,
					onRetry: page.handleRetryCampaign
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignInsightsPageBody, { page })
			]
		})
	});
}
var campaignInsightsRevealFallback = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevealTransitionFallback, { children: (0, import_react.createElement)("div", {
	className: "min-h-[320px] rounded-xl border border-muted/50 bg-muted/20",
	"aria-busy": "true"
}) });
function CampaignInsightsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DirectionalPageTransition, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: campaignInsightsRevealFallback,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevealTransition, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignInsightsPageContent, {}) })
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignInsightsPage, {});
//#endregion
export { SplitComponent as component };
