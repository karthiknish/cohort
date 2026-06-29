import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, l as useMutation, s as useAction, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { c as reportConvexFailure, i as notifyFailure, o as notifySuccess } from "./notifications-DQZKskhM.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { d as adsMetaToolsApi, u as adsMetaEventsApi, w as customFormulasApi } from "./convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { A as Store, J as Send, Yt as LoaderCircle, hr as ChevronDown, q as Server, r as Zap } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { t as Label } from "./label-B_FvRq1I.mjs";
import { a as TabsTrigger, i as TabsList, n as Tabs, t as MotionTabsContent } from "./tabs-BP_mm-cH.mjs";
import { h as getObjectiveConfig, n as META_CAPI_STANDARD_EVENTS, r as META_OFFLINE_ACTION_SOURCE, t as META_CAPI_ACTION_SOURCES } from "./insights-D9NfALlV.mjs";
import { t as ADS_PAGE_THEME } from "./ad-algorithms-CKFe3XXP.mjs";
import { r as useConvexQueryError } from "./use-convex-query-error-P2IX7lhG.mjs";
import { n as extractFormulaVariables, r as safeEvaluateFormula } from "./formula-engine-CImA3GkM.mjs";
import { t as Textarea } from "./textarea-C0M2IvQZ.mjs";
import { n as AlertDescription, t as Alert } from "./alert-DYeH1Q3p.mjs";
import { n as CollapsibleTrigger$1, r as Root, t as CollapsibleContent$1 } from "../_libs/radix-ui__react-collapsible.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-formula-editor-DJCWXM5p.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function normalizeMetaCampaignObjective(campaignObjective) {
	if (!campaignObjective) return null;
	return getObjectiveConfig(campaignObjective)?.objective ?? null;
}
function requiresMetaPageForAdSet(campaignObjective) {
	const normalized = normalizeMetaCampaignObjective(campaignObjective);
	return normalized === "OUTCOME_LEADS" || normalized === "OUTCOME_ENGAGEMENT";
}
function validateMetaAdSetObjective(campaignObjective, fields) {
	const normalized = normalizeMetaCampaignObjective(campaignObjective);
	const errors = [];
	if (normalized === "OUTCOME_LEADS" && !fields.pageId) errors.push("Select a Facebook Page for lead generation.");
	if (normalized === "OUTCOME_SALES") {
		if ((fields.salesOptimizationMode ?? (fields.productCatalogId ? "catalog" : "pixel")) === "catalog") {
			if (!fields.productCatalogId) errors.push("Select a product catalog for catalog sales.");
		} else if (!fields.pixelId) errors.push("Select a Facebook Pixel for conversion optimization.");
		else if (!fields.conversionEvent) errors.push("Select a conversion event for this sales ad set.");
	}
	if (normalized === "OUTCOME_ENGAGEMENT") {
		const engagementType = fields.engagementType ?? "PAGE_ENGAGEMENT";
		if ((engagementType === "PAGE_ENGAGEMENT" || engagementType === "EVENT_RESPONSES" || engagementType === "POST_ENGAGEMENT") && !fields.pageId) errors.push("Select a Facebook Page for this engagement ad set.");
		if (engagementType === "POST_ENGAGEMENT" && fields.pageId && !fields.postId) errors.push("Select a Page post to promote.");
		if (engagementType === "EVENT_RESPONSES" && fields.pageId && !fields.eventId) errors.push("Select a Page event to promote.");
	}
	return errors;
}
function resolveObjective(campaignObjective) {
	return normalizeMetaCampaignObjective(campaignObjective);
}
function resolveMetaCampaignUiVisibility(context = {}) {
	const objective = resolveObjective(context.campaignObjective);
	const isAccountScope = (context.scope ?? (objective ? "campaign" : "account")) === "account";
	const isSales = objective === "OUTCOME_SALES";
	const isLeads = objective === "OUTCOME_LEADS";
	const isTraffic = objective === "OUTCOME_TRAFFIC";
	const isEngagement = objective === "OUTCOME_ENGAGEMENT";
	const isAwareness = objective === "OUTCOME_AWARENESS";
	const isAppPromotion = objective === "OUTCOME_APP_PROMOTION";
	const showConversionEvents = !isAccountScope && (isSales || isLeads);
	const catalogSales = isSales && context.salesOptimizationMode === "catalog";
	let metaToolsDescription = "Account tools: batch API, pixels, Business Manager, Ad Library, and webhooks.";
	if (!isAccountScope && objective) {
		if (isSales) metaToolsDescription = "Conversion tracking (CAPI, offline), pixels, and account webhooks for this sales campaign.";
		else if (isLeads) metaToolsDescription = "Lead CAPI events, pixel health, and webhooks for this leads campaign.";
		else if (isEngagement) metaToolsDescription = "Batch requests, webhooks, and competitive Ad Library research.";
		else if (isAwareness) metaToolsDescription = "Ad Library research, webhooks, and batch utilities for awareness campaigns.";
		else if (isTraffic) metaToolsDescription = "Pixel stats, batch API, and webhooks for traffic campaigns.";
		else if (isAppPromotion) metaToolsDescription = "Batch API and webhook subscriptions for app promotion campaigns.";
	}
	return {
		objective,
		showCapi: showConversionEvents,
		showOfflineEvents: !isAccountScope && isSales,
		showBatchApi: true,
		showPixelInsights: isAccountScope || isSales || isLeads || isTraffic,
		showBusinessManager: true,
		showAdLibrary: isAccountScope || isAwareness || isTraffic || isEngagement,
		showWebhooks: true,
		showPlacementTargeting: !isAppPromotion,
		showCustomAudiences: !isAppPromotion,
		showDynamicCreativeFormat: catalogSales,
		defaultCapiEventName: isLeads ? "Lead" : isSales ? "Purchase" : "PageView",
		metaToolsDescription
	};
}
function hasMetaEventsTools(visibility) {
	return visibility.showCapi || visibility.showOfflineEvents || visibility.showBatchApi;
}
function hasMetaAdvancedTools(visibility) {
	return visibility.showPixelInsights || visibility.showBusinessManager || visibility.showAdLibrary || visibility.showWebhooks;
}
function hasAnyMetaCampaignTools(visibility) {
	return hasMetaEventsTools(visibility) || hasMetaAdvancedTools(visibility);
}
function getMetaCreativeObjectTypeOptions(campaignObjective, salesOptimizationMode) {
	const visibility = resolveMetaCampaignUiVisibility({
		campaignObjective,
		salesOptimizationMode,
		scope: "campaign"
	});
	const options = [
		"IMAGE",
		"VIDEO",
		"CAROUSEL"
	];
	if (visibility.showDynamicCreativeFormat) options.push("DYNAMIC");
	return options;
}
var Collapsible = Root;
var CollapsibleTrigger = CollapsibleTrigger$1;
var CollapsibleContent = ({ className, children, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent$1, {
	ref,
	className: cn("overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down", className),
	...props,
	children
});
CollapsibleContent.displayName = CollapsibleContent$1.displayName;
function MetaToolsPanelShell({ icon: Icon, title, description, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn(ADS_PAGE_THEME.controlFormPanel, "space-y-4"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: ADS_PAGE_THEME.controlHeaderIcon,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-5 text-primary",
					"aria-hidden": true
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold tracking-tight text-foreground",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-relaxed text-muted-foreground",
					children: description
				})]
			})]
		}), children]
	});
}
function MetaToolsFormSection({ title, description, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("space-y-3", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-0.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: ADS_PAGE_THEME.controlSectionLabel,
				children: title
			}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-relaxed text-muted-foreground",
				children: description
			}) : null]
		}), children]
	});
}
function MetaPixelPicker({ pixelId, pixels, onPixelIdChange }) {
	const [manualOpen, setManualOpen] = (0, import_react.useState)(false);
	const selected = pixels.rows.find((row) => row.id === pixelId);
	const hasList = pixels.rows.length > 0;
	const handlePixelIdInputChange = (event) => onPixelIdChange(event.target.value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "meta-pixel-select",
					className: "text-xs font-medium text-foreground",
					children: "Meta pixel"
				}), pixels.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					"aria-busy": "true",
					"aria-label": "Loading pixels",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-full rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-2/3" })]
				}) : hasList ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: pixelId || void 0,
					onValueChange: onPixelIdChange,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						id: "meta-pixel-select",
						className: "h-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a pixel from this ad account" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: pixels.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
						value: row.id,
						children: [row.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-1.5 font-mono text-[10px] text-muted-foreground",
							children: [
								"(",
								row.id,
								")"
							]
						})]
					}, row.id)) })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, {
					className: "border-border/60 bg-muted/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
						className: "text-xs leading-relaxed",
						children: [
							"No pixels were returned for this connection. Paste a pixel ID from",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-foreground",
								children: "Events Manager → Data sources"
							}),
							"."
						]
					})
				})]
			}),
			selected && !pixels.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: ADS_PAGE_THEME.controlStatChip,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: ADS_PAGE_THEME.controlStatChipLabel,
						children: "Selected"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: ADS_PAGE_THEME.controlStatChipValue,
						children: selected.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] text-muted-foreground",
						children: selected.id
					})
				]
			}) : null,
			hasList && !pixels.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Collapsible, {
				open: manualOpen,
				onOpenChange: setManualOpen,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						className: "h-8 gap-1 px-0 text-xs text-muted-foreground hover:text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
							className: cn("size-3.5 transition-transform", manualOpen && "rotate-180"),
							"aria-hidden": true
						}), manualOpen ? "Hide manual pixel ID" : "Use a different pixel ID"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent, {
					className: "pt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "meta-pixel-manual",
							className: "text-xs text-muted-foreground",
							children: "Pixel ID"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "meta-pixel-manual",
							value: pixelId,
							onChange: handlePixelIdInputChange,
							placeholder: "e.g. 123456789012345",
							className: "h-10 font-mono text-sm"
						})]
					})
				})]
			}) : !hasList && !pixels.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "meta-pixel-manual",
					className: "text-xs text-muted-foreground",
					children: "Pixel ID"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "meta-pixel-manual",
					value: pixelId,
					onChange: handlePixelIdInputChange,
					placeholder: "e.g. 123456789012345",
					className: "h-10 font-mono text-sm"
				})]
			}) : null
		]
	});
}
function MetaToolsActionBar({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap items-center gap-2 border-t border-border/50 pt-4",
		children
	});
}
function MetaJsonResultBlock({ title, content, emptyLabel = "No data yet." }) {
	if (!content.trim()) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(ADS_PAGE_THEME.emptyState, "py-6"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: emptyLabel
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: ADS_PAGE_THEME.controlSectionLabel,
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "max-h-40 overflow-auto rounded-xl border border-border/50 bg-muted/20 p-3 font-mono text-[11px] leading-relaxed text-foreground/90",
			children: content
		})]
	});
}
function defaultEventsTab(tabs) {
	if (tabs.includes("capi")) return "capi";
	if (tabs.includes("offline")) return "offline";
	return tabs[0] ?? "batch";
}
function MetaEventsToolsPanel({ workspaceId, clientId, adAccountId, campaignObjective, scope }) {
	const visibility = resolveMetaCampaignUiVisibility({
		campaignObjective,
		scope
	});
	const eventTabs = (() => {
		const tabs = [];
		if (visibility.showCapi) tabs.push("capi");
		if (visibility.showOfflineEvents) tabs.push("offline");
		if (visibility.showBatchApi) tabs.push("batch");
		return tabs;
	})();
	const [activeTab, setActiveTab] = (0, import_react.useState)(() => defaultEventsTab(eventTabs));
	const listAdPixels = useAction(adsMetaToolsApi.listAdPixels);
	const sendCapiEvents = useAction(adsMetaEventsApi.sendCapiEvents);
	const sendOfflineEvents = useAction(adsMetaEventsApi.sendOfflineEvents);
	const executeBatch = useAction(adsMetaEventsApi.executeBatch);
	const [pixels, dispatchPixels] = (0, import_react.useReducer)((_, value) => value, {
		rows: [],
		loading: false
	});
	const [pixelId, setPixelId] = (0, import_react.useState)("");
	const [actionSource, setActionSource] = (0, import_react.useState)("website");
	const [email, setEmail] = (0, import_react.useState)("");
	const [value, setValue] = (0, import_react.useState)("");
	const [currency, setCurrency] = (0, import_react.useState)("USD");
	const [orderId, setOrderId] = (0, import_react.useState)("");
	const [testEventCode, setTestEventCode] = (0, import_react.useState)("");
	const [sendingCapi, setSendingCapi] = (0, import_react.useState)(false);
	const [sendingOffline, setSendingOffline] = (0, import_react.useState)(false);
	const [batchJson, setBatchJson] = (0, import_react.useState)("");
	const [runningBatch, setRunningBatch] = (0, import_react.useState)(false);
	const [batchResult, setBatchResult] = (0, import_react.useState)("");
	const needsPixelList = visibility.showCapi || visibility.showOfflineEvents;
	const syncedActiveTab = eventTabs.includes(activeTab) ? activeTab : defaultEventsTab(eventTabs);
	const prevDefaultEventName = (0, import_react.useRef)(visibility.defaultCapiEventName);
	const [eventName, setEventName] = (0, import_react.useState)(visibility.defaultCapiEventName || "Purchase");
	(0, import_react.useEffect)(() => {
		if (prevDefaultEventName.current !== visibility.defaultCapiEventName) {
			prevDefaultEventName.current = visibility.defaultCapiEventName;
			setEventName(visibility.defaultCapiEventName);
		}
	}, [visibility.defaultCapiEventName]);
	(0, import_react.useEffect)(() => {
		if (!needsPixelList) {
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
			const onlyPixel = mapped.length === 1 ? mapped[0] : void 0;
			if (onlyPixel) setPixelId(onlyPixel.id);
		}).catch((error) => {
			if (cancelled) return;
			reportConvexFailure({
				error,
				context: "MetaEventsToolsPanel:listAdPixels",
				title: "Could not load pixels",
				fallbackMessage: "Could not load pixels"
			});
			dispatchPixels({
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
		needsPixelList,
		workspaceId
	]);
	const buildEventPayload = () => {
		const parsedValue = value.trim() ? Number(value) : void 0;
		return {
			eventName,
			actionSource,
			email: email.trim() || void 0,
			value: Number.isFinite(parsedValue) ? parsedValue : void 0,
			currency: currency.trim() || void 0,
			orderId: orderId.trim() || void 0
		};
	};
	const handleSendCapi = () => {
		if (!pixelId.trim()) {
			notifyFailure({ message: "Select a pixel" });
			return;
		}
		setSendingCapi(true);
		sendCapiEvents({
			workspaceId,
			clientId: clientId ?? null,
			pixelId: pixelId.trim(),
			events: [buildEventPayload()],
			testEventCode: testEventCode.trim() || void 0
		}).then((result) => {
			notifySuccess({
				title: "CAPI events sent",
				message: `Meta received ${result.eventsReceived ?? 1} event(s).`
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "MetaEventsToolsPanel:sendCapi",
				title: "CAPI send failed",
				fallbackMessage: "Check pixel permissions and event payload."
			});
		}).finally(() => setSendingCapi(false));
	};
	const handleSendOffline = () => {
		if (!pixelId.trim()) {
			notifyFailure({ message: "Select a pixel" });
			return;
		}
		setSendingOffline(true);
		sendOfflineEvents({
			workspaceId,
			clientId: clientId ?? null,
			pixelId: pixelId.trim(),
			events: [{
				...buildEventPayload(),
				actionSource: META_OFFLINE_ACTION_SOURCE
			}],
			testEventCode: testEventCode.trim() || void 0
		}).then((result) => {
			notifySuccess({
				title: "Offline events sent",
				message: `Meta received ${result.eventsReceived ?? 1} store event(s).`
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "MetaEventsToolsPanel:sendOffline",
				title: "Offline send failed",
				fallbackMessage: "Check pixel and offline event setup in Events Manager."
			});
		}).finally(() => setSendingOffline(false));
	};
	const handlePresetBatch = () => {
		if (!adAccountId?.trim()) return;
		const account = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;
		setBatchJson(JSON.stringify([{
			method: "GET",
			relativeUrl: `${account}/campaigns?fields=id,name,status&limit=5`,
			name: "campaigns"
		}, {
			method: "GET",
			relativeUrl: `${account}/adsets?fields=id,name,status&limit=5`,
			name: "adsets"
		}], null, 2));
	};
	const handleRunBatch = () => {
		let parsed;
		try {
			parsed = JSON.parse(batchJson);
		} catch {
			notifyFailure({
				title: "Invalid batch JSON",
				message: "Provide an array of { method, relativeUrl, body?, name? }."
			});
			return;
		}
		if (!Array.isArray(parsed)) {
			notifyFailure({
				title: "Invalid batch JSON",
				message: "Provide an array of { method, relativeUrl, body?, name? }."
			});
			return;
		}
		const requests = parsed;
		setRunningBatch(true);
		setBatchResult("");
		executeBatch({
			workspaceId,
			clientId: clientId ?? null,
			requests
		}).then((result) => {
			setBatchResult(JSON.stringify(result, null, 2));
			notifySuccess({
				title: result.success ? "Batch completed" : "Batch finished with errors",
				message: `${result.responses.length} response(s) returned.`
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "MetaEventsToolsPanel:executeBatch",
				title: "Batch failed",
				fallbackMessage: "Could not run Meta batch request."
			});
		}).finally(() => setRunningBatch(false));
	};
	const handleBatchJsonChange = (event) => {
		setBatchJson(event.target.value);
	};
	if (!hasMetaEventsTools(visibility) || eventTabs.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaToolsPanelShell, {
		icon: Server,
		title: "Conversions API & events",
		description: visibility.showCapi && visibility.showOfflineEvents ? "Send server-side conversion and offline store events, or run Graph API batch requests for debugging." : visibility.showCapi ? "Send server-side conversion events to Meta without relying on the browser pixel." : visibility.showOfflineEvents ? "Upload in-store or CRM conversions with a physical-store action source." : "Run grouped Graph API requests in a single call (max 50).",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: syncedActiveTab,
			onValueChange: setActiveTab,
			className: "w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "h-9 w-full flex-wrap justify-start gap-1 bg-muted/40 p-1",
					children: [
						visibility.showCapi ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "capi",
							className: "gap-1.5 text-xs sm:text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {
								className: "size-3.5 shrink-0",
								"aria-hidden": true
							}), "Conversions API"]
						}) : null,
						visibility.showOfflineEvents ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "offline",
							className: "gap-1.5 text-xs sm:text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, {
								className: "size-3.5 shrink-0",
								"aria-hidden": true
							}), "Offline"]
						}) : null,
						visibility.showBatchApi ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "batch",
							className: "gap-1.5 text-xs sm:text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
								className: "size-3.5 shrink-0",
								"aria-hidden": true
							}), "Batch API"]
						}) : null
					]
				}),
				visibility.showCapi ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionTabsContent, {
					activeTab,
					tabValue: "capi",
					className: "mt-4 space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaToolsFormSection, {
							title: "Pixel",
							description: "Events are attributed to this pixel in Events Manager.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaPixelPicker, {
								pixelId,
								pixels,
								onPixelIdChange: setPixelId
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaToolsFormSection, {
							title: "Event",
							description: "Standard event name and where the conversion happened.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventFields, {
								eventName,
								actionSource,
								email,
								value,
								currency,
								orderId,
								testEventCode,
								onEventNameChange: setEventName,
								onActionSourceChange: setActionSource,
								onEmailChange: setEmail,
								onValueChange: setValue,
								onCurrencyChange: setCurrency,
								onOrderIdChange: setOrderId,
								onTestEventCodeChange: setTestEventCode,
								showActionSource: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MetaToolsActionBar, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							disabled: sendingCapi || !pixelId.trim(),
							onClick: handleSendCapi,
							children: [sendingCapi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "mr-2 size-4 animate-spin",
								"aria-hidden": true
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {
								className: "mr-2 size-4",
								"aria-hidden": true
							}), "Send test event"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "PII is hashed server-side before it reaches Meta."
						})] })
					]
				}) : null,
				visibility.showOfflineEvents ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionTabsContent, {
					activeTab,
					tabValue: "offline",
					className: "mt-4 space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaToolsFormSection, {
							title: "Pixel",
							description: "Offline uploads use the same pixel dataset as your web events.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaPixelPicker, {
								pixelId,
								pixels,
								onPixelIdChange: setPixelId
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaToolsFormSection, {
							title: "Store event",
							description: "Sent with action_source physical_store for in-store or CRM conversions.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventFields, {
								eventName,
								actionSource: META_OFFLINE_ACTION_SOURCE,
								email,
								value,
								currency,
								orderId,
								testEventCode,
								onEventNameChange: setEventName,
								onActionSourceChange: setActionSource,
								onEmailChange: setEmail,
								onValueChange: setValue,
								onCurrencyChange: setCurrency,
								onOrderIdChange: setOrderId,
								onTestEventCodeChange: setTestEventCode,
								showActionSource: false
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaToolsActionBar, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							disabled: sendingOffline || !pixelId.trim(),
							onClick: handleSendOffline,
							children: [sendingOffline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "mr-2 size-4 animate-spin",
								"aria-hidden": true
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, {
								className: "mr-2 size-4",
								"aria-hidden": true
							}), "Send offline event"]
						}) })
					]
				}) : null,
				visibility.showBatchApi ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionTabsContent, {
					activeTab,
					tabValue: "batch",
					className: "mt-4 space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MetaToolsFormSection, {
							title: "Batch payload",
							description: "Array of { method, relativeUrl, body?, name? } objects. Useful for quick Graph API probes.",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									size: "sm",
									variant: "outline",
									disabled: !adAccountId,
									onClick: handlePresetBatch,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
										className: "mr-1.5 size-3.5",
										"aria-hidden": true
									}), "Load sample (campaigns + ad sets)"]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: batchJson,
								onChange: handleBatchJsonChange,
								rows: 8,
								className: "font-mono text-xs leading-relaxed",
								placeholder: "[\n  { \"method\": \"GET\", \"relativeUrl\": \"act_123/campaigns?fields=id,name\" }\n]",
								spellCheck: false
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaToolsActionBar, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							disabled: runningBatch || !batchJson.trim(),
							onClick: handleRunBatch,
							children: [runningBatch ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "mr-2 size-4 animate-spin",
								"aria-hidden": true
							}) : null, "Run batch (max 50)"]
						}) }),
						batchResult ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaJsonResultBlock, {
							title: "Response",
							content: batchResult
						}) : null
					]
				}) : null
			]
		})
	});
}
function EventFields({ eventName, actionSource, email, value, currency, orderId, testEventCode, onEventNameChange, onActionSourceChange, onEmailChange, onValueChange, onCurrencyChange, onOrderIdChange, onTestEventCodeChange, showActionSource }) {
	const handleEmailChange = (event) => onEmailChange(event.target.value);
	const handleOrderIdChange = (event) => onOrderIdChange(event.target.value);
	const handleValueChange = (event) => onValueChange(event.target.value);
	const handleCurrencyChange = (event) => onCurrencyChange(event.target.value);
	const handleTestEventCodeChange = (event) => onTestEventCodeChange(event.target.value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs font-medium",
						children: "Event name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: eventName,
						onValueChange: onEventNameChange,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: META_CAPI_STANDARD_EVENTS.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: event.value,
							children: event.label
						}, event.value)) })]
					})]
				}), showActionSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs font-medium",
						children: "Action source"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: actionSource,
						onValueChange: onActionSourceChange,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: META_CAPI_ACTION_SOURCES.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: source.value,
							children: source.label
						}, source.value)) })]
					})]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-medium",
								children: "Email"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: email,
								onChange: handleEmailChange,
								placeholder: "customer@example.com",
								className: "h-10",
								autoComplete: "off"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground",
								children: "Hashed on the server before send."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs font-medium",
							children: "Order ID"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: orderId,
							onChange: handleOrderIdChange,
							placeholder: "Optional deduplication key",
							className: "h-10"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs font-medium",
							children: "Value"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value,
							onChange: handleValueChange,
							placeholder: "0.00",
							inputMode: "decimal",
							className: "h-10 tabular-nums"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs font-medium",
							children: "Currency"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: currency,
							onChange: handleCurrencyChange,
							placeholder: "USD",
							className: "h-10 uppercase",
							maxLength: 3
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, {
				className: "border-info/20 bg-info/5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
					className: "space-y-2 text-xs leading-relaxed",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium text-foreground",
							children: "Test in Events Manager"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground",
							children: "Open Test events, copy your test code, and paste it below. Events with a test code appear in the debugger without affecting production reporting."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 pt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "meta-test-event-code",
								className: "text-xs text-muted-foreground",
								children: "Test event code (optional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "meta-test-event-code",
								value: testEventCode,
								onChange: handleTestEventCodeChange,
								placeholder: "TEST12345",
								className: "h-10 font-mono text-sm"
							})]
						})
					]
				})
			})
		]
	});
}
/**
* Extract variable names from a formula string
*/
function extractVariables(formula) {
	return extractFormulaVariables(formula);
}
/**
* Validate formula syntax
*/
function validateFormulaSyntax(formula) {
	if (!formula.trim()) return {
		valid: false,
		error: "Formula cannot be empty"
	};
	let parenCount = 0;
	for (const char of formula) {
		if (char === "(") parenCount++;
		if (char === ")") parenCount--;
		if (parenCount < 0) return {
			valid: false,
			error: "Unbalanced parentheses"
		};
	}
	if (parenCount !== 0) return {
		valid: false,
		error: "Unbalanced parentheses"
	};
	if (!/^[a-zA-Z0-9_+\-*/().\s]+$/.test(formula)) return {
		valid: false,
		error: "Formula contains invalid characters"
	};
	const inputs = extractVariables(formula);
	if (inputs.length === 0) return {
		valid: false,
		error: "Formula must contain at least one metric variable"
	};
	return {
		valid: true,
		inputs
	};
}
/**
* Safely execute a formula with given inputs
*/
function safeEvaluate(formula, inputs) {
	return safeEvaluateFormula(formula, inputs);
}
/**
* Hook for managing custom formula definitions
*/
function useFormulaEditor(options = {}) {
	const { isPreviewMode = false } = options;
	const { user } = useAuth();
	const { selectedClientId } = useClientContext();
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const formulasResult = useQuery(customFormulasApi.listByWorkspace, !isPreviewMode && selectedClientId ? { workspaceId: selectedClientId } : "skip");
	const formulasQueryError = useConvexQueryError({
		data: formulasResult,
		skipped: isPreviewMode || !selectedClientId,
		fallbackMessage: "Unable to load custom formulas."
	});
	const createFormulaMutation = useMutation(customFormulasApi.create);
	const updateFormulaMutation = useMutation(customFormulasApi.update);
	const removeFormulaMutation = useMutation(customFormulasApi.remove);
	const formulasFromQuery = (() => {
		if (!Array.isArray(formulasResult)) return [];
		return formulasResult.map((formula) => {
			const typedFormula = formula;
			const createdAtMs = typeof formula.createdAtMs === "number" ? formula.createdAtMs : void 0;
			const updatedAtMs = typeof formula.updatedAtMs === "number" ? formula.updatedAtMs : void 0;
			return {
				...typedFormula,
				createdAtMs,
				updatedAtMs,
				createdAt: createdAtMs ? new Date(createdAtMs).toISOString() : null,
				updatedAt: updatedAtMs ? new Date(updatedAtMs).toISOString() : null
			};
		});
	})();
	const loadFormulas = async () => {};
	const handleCreateFormula = async (input) => {
		if (!selectedClientId || !user?.id) {
			notifyFailure({
				title: "Error",
				message: "Not authenticated"
			});
			return null;
		}
		const validation = validateFormulaSyntax(input.formula);
		if (!validation.valid) {
			notifyFailure({
				title: "Invalid Formula",
				message: validation.error ?? "Invalid formula"
			});
			return null;
		}
		const legacyId = `formula_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		try {
			await createFormulaMutation({
				workspaceId: selectedClientId,
				legacyId,
				name: input.name,
				description: input.description ?? null,
				formula: input.formula,
				inputs: validation.inputs ?? input.inputs,
				outputMetric: input.outputMetric,
				createdBy: user.id
			});
			notifySuccess({
				title: "Formula Created",
				message: `"${input.name}" saved successfully`
			});
			return formulasFromQuery.find((f) => f.formulaId === legacyId) ?? null;
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useFormulaEditor:createFormula",
				title: "Failed to create formula",
				fallbackMessage: "Failed to create formula"
			});
			return null;
		}
	};
	const handleUpdateFormula = async (input) => {
		if (!selectedClientId) return;
		if (input.formula) {
			const validation = validateFormulaSyntax(input.formula);
			if (!validation.valid) {
				notifyFailure({
					title: "Invalid Formula",
					message: validation.error ?? "Invalid formula"
				});
				return;
			}
		}
		try {
			await updateFormulaMutation({
				workspaceId: selectedClientId,
				legacyId: input.formulaId,
				name: input.name,
				description: input.description,
				formula: input.formula,
				inputs: input.inputs,
				outputMetric: input.outputMetric,
				isActive: input.isActive
			});
			notifySuccess({ message: "Formula Updated" });
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useFormulaEditor:updateFormula",
				title: "Failed to update formula",
				fallbackMessage: "Failed to update formula"
			});
		}
	};
	const handleDeleteFormula = async (formulaId) => {
		if (!selectedClientId) return;
		try {
			await removeFormulaMutation({
				workspaceId: selectedClientId,
				legacyId: formulaId
			});
			notifySuccess({ message: "Formula Deleted" });
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useFormulaEditor:deleteFormula",
				title: "Failed to delete formula",
				fallbackMessage: "Failed to delete formula"
			});
		}
	};
	const validateFormula = (formula) => {
		return validateFormulaSyntax(formula);
	};
	const executeFormula = (formula, inputs) => {
		return safeEvaluate(formula, inputs);
	};
	return {
		formulas: formulasFromQuery,
		loading,
		error: error ?? formulasQueryError,
		loadFormulas,
		createFormula: handleCreateFormula,
		updateFormula: handleUpdateFormula,
		deleteFormula: handleDeleteFormula,
		validateFormula,
		executeFormula
	};
}
//#endregion
export { useFormulaEditor as _, MetaJsonResultBlock as a, MetaToolsFormSection as c, hasAnyMetaCampaignTools as d, hasMetaAdvancedTools as f, resolveMetaCampaignUiVisibility as g, requiresMetaPageForAdSet as h, MetaEventsToolsPanel as i, MetaToolsPanelShell as l, normalizeMetaCampaignObjective as m, CollapsibleContent as n, MetaPixelPicker as o, hasMetaEventsTools as p, CollapsibleTrigger as r, MetaToolsActionBar as s, Collapsible as t, getMetaCreativeObjectTypeOptions as u, validateMetaAdSetObjective as v };
