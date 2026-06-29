import { o as __toESM } from "./_runtime.mjs";
import { S as require_jsx_runtime, s as useAction, x as require_react } from "./_libs/@convex-dev/better-auth+[...].mjs";
import { r as motion_exports } from "./_ssr/motion-DtlbbvFg.mjs";
import { d as useBlocker } from "./_libs/@tanstack/react-router+[...].mjs";
import { ot as normalizeCurrencyCode, rt as isoDaysAgo } from "./_ssr/preview-data-CXkRNfsX.mjs";
import { c as cn } from "./_ssr/utils-hh4sibN0.mjs";
import { O as transitions, S as slideInLeftVariants, c as easings, d as fadeInUpVariants, u as fadeInDownVariants, x as scaleVariants, y as motionLoopSeconds } from "./_ssr/motion-Cf6ujF0h.mjs";
import { t as Button } from "./_ssr/button-BHcJlp0q.mjs";
import { t as Badge } from "./_ssr/badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./_ssr/card-CDBnK3ba.mjs";
import { t as Skeleton } from "./_ssr/skeleton-CQ4LJS0E.mjs";
import { s as logError, t as asErrorMessage } from "./_ssr/convex-errors-sHK0JmZ7.mjs";
import { a as notifyInfo, c as reportConvexFailure, i as notifyFailure, o as notifySuccess } from "./_ssr/notifications-DQZKskhM.mjs";
import { t as useParams$1 } from "./_ssr/navigation-C1M-rNAu.mjs";
import { g as useAuth } from "./_ssr/auth-context-fSvbzOPB.mjs";
import { C as creativesCopyApi, s as adsCreativesApi, t as adsAdMetricsApi } from "./_ssr/convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./_ssr/client-context-BNynWehF.mjs";
import { An as FileText, E as ThumbsUp, F as Sparkles, In as Eye, Jr as Activity, Kn as Copy, M as Square, Pr as Bookmark, Rn as ExternalLink, Sn as GalleryHorizontal, U as Share, Ur as ArrowLeft, Vt as MessageCircle, W as Share2, Wt as Maximize2, X as Save, an as Layers, at as RectangleVertical, bt as PanelsTopLeft, dt as Play, en as Link, fn as Image, ft as Pin, gn as Heart, gr as Check, i as X, kt as MousePointer2, l as Video, lt as Plus, pr as ChevronRight, r as Zap, rt as RefreshCw, tn as Link2, vt as PenLine, w as Trash2, x as TrendingUp, xn as Globe, y as Type, yt as Pause, z as ShoppingBag, zn as Ellipsis } from "./_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-Cuo0TTXb.mjs";
import { i as DialogDescription, r as DialogContent, s as DialogTitle, t as Dialog } from "./_ssr/dialog-C8tBdgAy.mjs";
import { t as Input } from "./_ssr/input-DuOB9ezo.mjs";
import { a as TabsTrigger, i as TabsList, n as Tabs, r as TabsContent } from "./_ssr/tabs-BP_mm-cH.mjs";
import { t as SvglBrandLogo } from "./_ssr/svgl-brand-logo-rIFZzPiw.mjs";
import { a as calculateEfficiencyScore, i as calculateAlgorithmicInsights } from "./_ssr/insights-D9NfALlV.mjs";
import { t as ADS_PAGE_THEME, v as toAdsProviderId } from "./_ssr/ad-algorithms-CKFe3XXP.mjs";
import { t as Separator } from "./_ssr/separator-DGLaDYU_.mjs";
import { t as Textarea } from "./_ssr/textarea-C0M2IvQZ.mjs";
import { t as Image$1 } from "./_ssr/image-Dd8IQpGx.mjs";
import { i as TruncatedTextPreview } from "./_ssr/hover-preview-BP_Z2-hG.mjs";
import { f as formatMetaCallToActionLabel, g as resolveMetaSocialPermalink, m as normalizeMetaCallToActionType, n as META_CTA_LABELS, p as mergeMetaDestinationSpec } from "./_ssr/meta-ads-B-Zv4_78.mjs";
import { n as usePreview } from "./_ssr/preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./_ssr/page-skeleton-boundary-ZBP950Us.mjs";
import { t as Link$1 } from "./_ssr/link-D4Easb0H.mjs";
import { c as DropdownMenuSeparator, i as DropdownMenuItem, l as DropdownMenuTrigger, r as DropdownMenuContent, t as DropdownMenu } from "./_ssr/dropdown-menu-CJEJ0oqe.mjs";
import { t as ConfirmDialog } from "./_ssr/confirm-dialog-D0Fe9niR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_creativeId-CqaotAXN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getTypeIcon(type) {
	const t = type.toLowerCase();
	if (t.includes("lead")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-[10px] font-bold tracking-tight",
		children: "LG"
	});
	if (t.includes("carousel")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GalleryHorizontal, { className: "size-5" });
	if (t.includes("dynamic_product")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-5" });
	if (t.includes("dynamic_creative")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-5" });
	if (t.includes("boosted") || t.includes("page_post")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-5" });
	if (t.includes("video")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-5" });
	if (t.includes("image") || t.includes("display")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "size-5" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-5" });
}
function isDirectVideoUrl(url) {
	if (!url) return false;
	try {
		const pathname = new URL(url).pathname.toLowerCase();
		return pathname.endsWith(".mp4") || pathname.endsWith(".webm") || pathname.endsWith(".mov");
	} catch {
		const lower = url.toLowerCase();
		return lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov");
	}
}
/** Human-readable CTA for previews; accepts Meta enum or legacy stored strings. */
function formatCTALabel(cta) {
	if (!cta) return "";
	const label = formatMetaCallToActionLabel(cta);
	if (label) return label;
	const normalized = normalizeMetaCallToActionType(cta);
	if (normalized) return formatMetaCallToActionLabel(normalized) ?? normalized;
	return cta.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
}
/** Canonical Meta CTA enum for selects and API payloads. */
function normalizeCreativeCtaValue(cta) {
	return normalizeMetaCallToActionType(cta) ?? (typeof cta === "string" ? cta.trim() : "");
}
function normalizeStringList(items) {
	return items.flatMap((item) => {
		const trimmed = item.trim();
		return trimmed ? [trimmed] : [];
	});
}
function listsEqual(a, b) {
	const na = normalizeStringList(a);
	const nb = normalizeStringList(b);
	return na.length === nb.length && na.every((value, index) => value === nb[index]);
}
function creativeCopyIsDirty(creative, edited) {
	if (!listsEqual(edited.headlines, creative.headlines ?? [])) return true;
	if (!listsEqual(edited.descriptions, creative.descriptions ?? [])) return true;
	if (normalizeCreativeCtaValue(edited.cta) !== normalizeCreativeCtaValue(creative.callToAction)) return true;
	if (edited.landingPage.trim() !== (creative.landingPageUrl ?? "").trim()) return true;
	return false;
}
/** Merge edited copy into an existing Meta asset_feed_spec JSON string. */
function mergeMetaAssetFeedSpecForSave(existingSpec, headlines, descriptions, landingPageUrl) {
	if (!existingSpec?.trim()) return void 0;
	let spec;
	try {
		spec = JSON.parse(existingSpec);
	} catch {
		return;
	}
	const normalizedHeadlines = normalizeStringList(headlines);
	const normalizedDescriptions = normalizeStringList(descriptions);
	if (normalizedHeadlines.length > 0) spec.titles = normalizedHeadlines.map((text) => ({ text }));
	if (normalizedDescriptions.length > 0) spec.bodies = normalizedDescriptions.map((text) => ({ text }));
	const url = landingPageUrl.trim();
	if (url) {
		const linkUrls = Array.isArray(spec.link_urls) ? spec.link_urls : [];
		if (linkUrls.length > 0) spec.link_urls = linkUrls.map((entry, index) => index === 0 ? {
			...entry,
			website_url: url
		} : entry);
		else spec.link_urls = [{ website_url: url }];
	}
	return JSON.stringify(spec);
}
var META_CTA_OPTIONS = [
	"LEARN_MORE",
	"SHOP_NOW",
	"SIGN_UP",
	"BOOK_NOW",
	"BOOK_TRAVEL",
	"DOWNLOAD",
	"GET_OFFER",
	"APPLY_NOW",
	"CONTACT_US",
	"SEND_MESSAGE",
	"WATCH_MORE",
	"GET_QUOTE",
	"SUBSCRIBE",
	"ORDER_NOW",
	"GET_DIRECTIONS"
].map((value) => ({
	value,
	label: META_CTA_LABELS[value] ?? value
}));
function resolveRouteProviderId(value) {
	if (value === "google" || value === "tiktok" || value === "linkedin" || value === "facebook") return value;
	if (value === "meta") return "facebook";
	try {
		return toAdsProviderId(value);
	} catch {
		return null;
	}
}
function buildPreviewCreative(providerId, campaignId, creativeId, campaignName) {
	const baseCreative = {
		providerId,
		creativeId,
		campaignId,
		campaignName,
		status: providerId === "google" ? "ENABLED" : "ACTIVE"
	};
	switch (providerId) {
		case "linkedin": return {
			...baseCreative,
			name: "Executive Pipeline Narrative",
			type: "image",
			headlines: ["Turn paid media into qualified pipeline, not vanity clicks"],
			descriptions: ["Position your team as the clear category leader with proof-led creative, sharper ICP targeting, and landing pages designed for decision makers."],
			imageUrl: "https://placehold.co/1200x1200/png?text=LinkedIn+Creative",
			landingPageUrl: "https://techcorp.example/demo",
			callToAction: "LEARN_MORE",
			pageName: "Tech Corp",
			pageProfileImageUrl: "https://placehold.co/80x80/png?text=TC",
			metrics: {
				impressions: 48200,
				clicks: 912,
				spend: 1240,
				conversions: 38
			}
		};
		case "google": return {
			...baseCreative,
			name: "Brand Search Expansion",
			type: "search",
			headlines: ["Capture demand already looking for you"],
			descriptions: ["Tighten intent capture, lower wasted spend, and direct high-intent traffic into a conversion-first landing flow."],
			landingPageUrl: "https://startupxyz.example/waitlist",
			callToAction: "SIGN_UP",
			pageName: "StartupXYZ",
			metrics: {
				impressions: 36100,
				clicks: 1348,
				spend: 880,
				conversions: 71
			}
		};
		case "tiktok": return {
			...baseCreative,
			name: "Launch Momentum Cutdown",
			type: "video",
			headlines: ["Make launch week impossible to ignore"],
			descriptions: ["Fast-paced product proof, creator energy, and a simple CTA built for waitlist growth during launch week."],
			imageUrl: "https://placehold.co/1080x1920/png?text=TikTok+Preview",
			thumbnailUrl: "https://placehold.co/1080x1920/png?text=TikTok+Preview",
			landingPageUrl: "https://startupxyz.example/app",
			callToAction: "DOWNLOAD",
			pageName: "StartupXYZ",
			pageProfileImageUrl: "https://placehold.co/80x80/png?text=SX",
			metrics: {
				impressions: 112e3,
				clicks: 2840,
				spend: 940,
				conversions: 54
			}
		};
		default: return {
			...baseCreative,
			name: "Spring Collection Hero",
			type: "image",
			headlines: ["Make every scroll feel like a store visit"],
			descriptions: ["Showcase your spring collection with dynamic product storytelling, stronger urgency, and repeat-purchase messaging built for higher AOV."],
			imageUrl: "https://placehold.co/1200x1200/png?text=Meta+Creative",
			landingPageUrl: "https://retailstore.example/spring",
			callToAction: "SHOP_NOW",
			pageName: "Retail Store",
			pageProfileImageUrl: "https://placehold.co/80x80/png?text=RS",
			metrics: {
				impressions: 84600,
				clicks: 1834,
				spend: 640,
				conversions: 96
			}
		};
	}
}
function buildPreviewCreativeMetrics(providerId, creativeId, campaignId, days) {
	const dayCount = Math.max(1, Number.parseInt(days, 10) || 7);
	const base = {
		google: {
			impressions: 5200,
			clicks: 180,
			spend: 126,
			conversions: 9,
			revenue: 950
		},
		facebook: {
			impressions: 9800,
			clicks: 220,
			spend: 88,
			conversions: 11,
			revenue: 760
		},
		linkedin: {
			impressions: 2600,
			clicks: 52,
			spend: 178,
			conversions: 3,
			revenue: 1100
		},
		tiktok: {
			impressions: 13200,
			clicks: 320,
			spend: 104,
			conversions: 6,
			revenue: 620
		}
	}[providerId];
	return Array.from({ length: dayCount }, (_, index) => {
		const impressions = Math.round(base.impressions * (.88 + index * .03));
		const clicks = Math.round(base.clicks * (.9 + index * .025));
		const spend = Math.round(base.spend * (.92 + index * .02) * 100) / 100;
		const conversions = Math.round(base.conversions * (.86 + index * .04));
		const revenue = Math.round(base.revenue * (.9 + index * .03));
		return {
			providerId,
			adId: creativeId,
			campaignId,
			date: isoDaysAgo(dayCount - index - 1).split("T")[0] ?? isoDaysAgo(dayCount - index - 1),
			impressions,
			clicks,
			spend,
			conversions,
			revenue,
			ctr: impressions > 0 ? clicks / impressions * 100 : 0,
			cpc: clicks > 0 ? spend / clicks : 0,
			roas: spend > 0 ? revenue / spend : 0
		};
	});
}
function buildPreviewCopySuggestions(kind, creative, campaignName) {
	const baseName = creative.pageName || creative.campaignName || creative.name || campaignName;
	if (kind === "headlines") return [
		`${baseName} with clearer performance proof`,
		`The fastest route from impression to action for ${baseName}`,
		`Creative built to convert high-intent buyers, not just attract clicks`
	];
	return [
		`Give ${baseName} a stronger hook, sharper social proof, and a cleaner CTA so the ad does more than win attention. It should push people into the next step with less friction.`,
		`Use this version when you want the first sentence to establish urgency, the middle section to prove credibility, and the close to point directly at the offer.`,
		`This sample caption keeps the message concise while still covering the customer problem, the core promise, and the action worth taking right now.`
	];
}
function buildCreativePreviewCreative(creative, editedHeadlines, editedDescriptions, editedCta, editedLandingPage, previewHeadlineIndex, previewDescriptionIndex) {
	const headlines = normalizeStringList(editedHeadlines);
	const descriptions = normalizeStringList(editedDescriptions);
	const safeHeadlineIndex = Math.min(Math.max(0, previewHeadlineIndex), Math.max(0, headlines.length - 1));
	const safeDescriptionIndex = Math.min(Math.max(0, previewDescriptionIndex), Math.max(0, descriptions.length - 1));
	const orderedHeadlines = headlines.length > 0 ? [headlines[safeHeadlineIndex], ...headlines.filter((_, i) => i !== safeHeadlineIndex)] : creative.headlines;
	const orderedDescriptions = descriptions.length > 0 ? [descriptions[safeDescriptionIndex], ...descriptions.filter((_, i) => i !== safeDescriptionIndex)] : creative.descriptions;
	return {
		...creative,
		headlines: orderedHeadlines,
		descriptions: orderedDescriptions,
		callToAction: editedCta.trim() || creative.callToAction,
		landingPageUrl: editedLandingPage.trim() || creative.landingPageUrl
	};
}
function buildCreativePerformanceSummary(creativeMetrics, convexProviderId, days, currency) {
	if (!creativeMetrics || !convexProviderId) return null;
	const totals = creativeMetrics.reduce((acc, m) => {
		acc.impressions += m.impressions;
		acc.clicks += m.clicks;
		acc.spend += m.spend;
		acc.conversions += m.conversions;
		acc.revenue += m.revenue;
		return acc;
	}, {
		impressions: 0,
		clicks: 0,
		spend: 0,
		conversions: 0,
		revenue: 0
	});
	const averageRoaS = totals.spend > 0 ? totals.revenue / totals.spend : 0;
	const averageCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
	return {
		providerId: convexProviderId,
		totalSpend: totals.spend,
		totalRevenue: totals.revenue,
		totalClicks: totals.clicks,
		totalConversions: totals.conversions,
		totalImpressions: totals.impressions,
		averageRoaS,
		averageCpc,
		averageCtr: totals.impressions > 0 ? totals.clicks / totals.impressions * 100 : 0,
		averageConvRate: totals.clicks > 0 ? totals.conversions / totals.clicks * 100 : 0,
		period: `Last ${days} days`,
		dayCount: Number(days),
		ctr: totals.impressions > 0 ? totals.clicks / totals.impressions * 100 : 0,
		roas: averageRoaS,
		cpc: averageCpc,
		currency: currency ?? void 0
	};
}
function createInitialCreativeDetailPageState() {
	return {
		creative: null,
		loading: true,
		copiedField: null,
		isEditing: true,
		editedHeadlines: [],
		editedDescriptions: [],
		editedCta: "",
		editedLandingPage: "",
		previewHeadlineIndex: 0,
		previewDescriptionIndex: 0,
		isSaving: false,
		generatingHeadlines: false,
		generatingDescriptions: false,
		days: "7",
		creativeMetrics: null
	};
}
function creativeDetailPageReducer(state, action) {
	switch (action.type) {
		case "setCreative": return {
			...state,
			creative: action.value
		};
		case "patchCreative": return {
			...state,
			creative: action.updater(state.creative)
		};
		case "setLoading": return {
			...state,
			loading: action.value
		};
		case "setCopiedField": return {
			...state,
			copiedField: action.value
		};
		case "setIsEditing": return {
			...state,
			isEditing: action.value
		};
		case "setEditedHeadlines": return {
			...state,
			editedHeadlines: action.value
		};
		case "updateEditedHeadlines": return {
			...state,
			editedHeadlines: action.updater(state.editedHeadlines)
		};
		case "setEditedDescriptions": return {
			...state,
			editedDescriptions: action.value
		};
		case "updateEditedDescriptions": return {
			...state,
			editedDescriptions: action.updater(state.editedDescriptions)
		};
		case "setEditedCta": return {
			...state,
			editedCta: action.value
		};
		case "setEditedLandingPage": return {
			...state,
			editedLandingPage: action.value
		};
		case "setPreviewHeadlineIndex": return {
			...state,
			previewHeadlineIndex: action.value
		};
		case "updatePreviewHeadlineIndex": return {
			...state,
			previewHeadlineIndex: action.updater(state.previewHeadlineIndex)
		};
		case "setPreviewDescriptionIndex": return {
			...state,
			previewDescriptionIndex: action.value
		};
		case "updatePreviewDescriptionIndex": return {
			...state,
			previewDescriptionIndex: action.updater(state.previewDescriptionIndex)
		};
		case "setIsSaving": return {
			...state,
			isSaving: action.value
		};
		case "setGeneratingHeadlines": return {
			...state,
			generatingHeadlines: action.value
		};
		case "setGeneratingDescriptions": return {
			...state,
			generatingDescriptions: action.value
		};
		case "setDays": return {
			...state,
			days: action.value
		};
		case "setCreativeMetrics": return {
			...state,
			creativeMetrics: action.value
		};
		case "syncFromCreative": return {
			...state,
			editedHeadlines: action.creative.headlines ?? [],
			editedDescriptions: action.creative.descriptions ?? [],
			editedCta: normalizeCreativeCtaValue(action.creative.callToAction),
			editedLandingPage: action.creative.landingPageUrl ?? "",
			previewHeadlineIndex: 0,
			previewDescriptionIndex: 0,
			isEditing: true
		};
		default: return state;
	}
}
function CreativeImageViewer({ src, alt, className, variant = "preview", aspectClass = "aspect-[4/5] sm:aspect-square", showExpand = true, showOpenLink = true }) {
	const [failed, setFailed] = (0, import_react.useState)(false);
	const [lightboxOpen, setLightboxOpen] = (0, import_react.useState)(false);
	const handleError = () => setFailed(true);
	const handleOpenLightbox = () => setLightboxOpen(true);
	if (!src || failed) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn(ADS_PAGE_THEME.controlMapFrame, "flex flex-col items-center justify-center gap-2 bg-muted/20 py-12 text-center", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
				className: "size-8 text-muted-foreground/40",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-muted-foreground",
				children: "Image unavailable"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-xs text-[11px] text-muted-foreground/80",
				children: "The asset may have expired or the URL is not publicly reachable."
			})
		]
	});
	if (variant === "thumbnail") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-stretch gap-3 rounded-xl border border-border/60 bg-card p-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: showExpand ? handleOpenLightbox : void 0,
			className: cn("relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/50", showExpand && "cursor-zoom-in transition-opacity hover:opacity-90"),
			"aria-label": showExpand ? `View full image: ${alt}` : void 0,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
				src,
				alt,
				fill: true,
				unoptimized: true,
				sizes: "80px",
				className: "object-cover",
				onError: handleError
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col justify-center gap-2 py-1 pr-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: ADS_PAGE_THEME.controlSectionLabel,
					children: "Creative asset"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "line-clamp-2 text-xs text-muted-foreground break-all",
					children: src
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1.5",
					children: [showExpand ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						className: "h-7 gap-1 text-xs",
						onClick: handleOpenLightbox,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, {
							className: "size-3",
							"aria-hidden": true
						}), "View"]
					}) : null, showOpenLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						className: "h-7 gap-1 text-xs",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: src,
							target: "_blank",
							rel: "noopener noreferrer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
								className: "size-3",
								"aria-hidden": true
							}), "Open"]
						})
					}) : null]
				})
			]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageLightbox, {
		open: lightboxOpen,
		onOpenChange: setLightboxOpen,
		src,
		alt,
		onError: handleError
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn(ADS_PAGE_THEME.controlMapFrame, "group relative overflow-hidden bg-muted/30", aspectClass, className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
				src,
				alt,
				fill: true,
				unoptimized: true,
				sizes: "(max-width: 768px) 100vw, 560px",
				className: "object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.02]",
				onError: handleError
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:opacity-0" }),
			showExpand ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute bottom-3 right-3 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					variant: "secondary",
					className: "h-8 gap-1.5 bg-background/95 shadow-md",
					onClick: handleOpenLightbox,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, {
						className: "size-3.5",
						"aria-hidden": true
					}), "Expand"]
				}), showOpenLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "secondary",
					className: "h-8 bg-background/95 shadow-md",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: src,
						target: "_blank",
						rel: "noopener noreferrer",
						"aria-label": "Open image in new tab",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
							className: "size-3.5",
							"aria-hidden": true
						})
					})
				}) : null]
			}) : null
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageLightbox, {
		open: lightboxOpen,
		onOpenChange: setLightboxOpen,
		src,
		alt,
		onError: handleError
	})] });
}
function ImageLightbox({ open, onOpenChange, src, alt, onError }) {
	const handleClose = () => {
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-4xl gap-0 overflow-hidden border-border/60 p-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "sr-only",
					children: alt
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "sr-only",
					children: "Full-size creative image preview"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative max-h-[85vh] min-h-[240px] w-full bg-foreground/95",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
						src,
						alt,
						width: 1200,
						height: 1200,
						unoptimized: true,
						className: "mx-auto h-auto max-h-[85vh] w-full object-contain",
						onError
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						size: "icon",
						className: "absolute right-3 top-3 size-9 rounded-full bg-background/90 shadow-md",
						onClick: handleClose,
						"aria-label": "Close image preview",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "size-4",
							"aria-hidden": true
						})
					})]
				})
			]
		})
	});
}
function toStableStringItems(items) {
	const counts = /* @__PURE__ */ new Map();
	return items.map((value, index) => {
		const occurrence = (counts.get(value) ?? 0) + 1;
		counts.set(value, occurrence);
		return {
			value,
			index,
			key: `${value}::${occurrence}`
		};
	});
}
function HeadlineEditRow(props) {
	const { value, index, isPreviewing, onUpdate, onRemove, onSelectPreview } = props;
	const onHeadlineChange = (event) => {
		onUpdate(index, event.target.value);
	};
	const handleRemove = () => {
		onRemove(index);
	};
	const handleSelectPreview = () => {
		onSelectPreview(index);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("group flex items-start gap-2 rounded-xl border p-2 transition-colors", isPreviewing ? "border-primary/40 bg-primary/5" : "border-border/60 bg-background hover:border-border"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-2 w-5 shrink-0 text-center text-[10px] font-bold text-muted-foreground",
				children: index + 1
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value,
					onChange: onHeadlineChange,
					placeholder: "Headline variant…",
					className: "h-9 border-muted bg-background text-sm focus-visible:ring-primary/20"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[10px] text-muted-foreground",
					children: [value.trim().length, " characters"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-col gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: isPreviewing ? "default" : "ghost",
					size: "icon",
					className: "size-8",
					onClick: handleSelectPreview,
					title: "Show in preview",
					"aria-label": `Preview headline ${index + 1}`,
					children: isPreviewing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "size-3.5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon",
					className: "size-8 text-muted-foreground hover:text-destructive",
					onClick: handleRemove,
					"aria-label": `Remove headline ${index + 1}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
				})]
			})
		]
	});
}
function HeadlineDisplayRow(props) {
	const { value, index, copiedField, onCopy } = props;
	const handleCopy = () => {
		onCopy(value, `headline-${index}`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group flex items-start justify-between gap-3 p-3 rounded-xl border bg-background hover:border-accent/20 transition-colors",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 text-[10px] font-bold text-muted-foreground/50",
				children: index + 1
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: value
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: "size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
			onClick: handleCopy,
			"aria-label": `Copy headline ${index + 1}`,
			children: copiedField === `headline-${index}` ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" })
		})]
	});
}
function DescriptionEditRow(props) {
	const { value, index, isPreviewing, onUpdate, onRemove, onSelectPreview } = props;
	const onDescriptionChange = (event) => {
		onUpdate(index, event.target.value);
	};
	const handleRemove = () => {
		onRemove(index);
	};
	const handleSelectPreview = () => {
		onSelectPreview(index);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("group flex items-start gap-2 rounded-xl border p-2 transition-colors", isPreviewing ? "border-primary/40 bg-primary/5" : "border-border/60 bg-background hover:border-border"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-2 w-5 shrink-0 text-center text-[10px] font-bold text-muted-foreground",
				children: index + 1
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value,
					onChange: onDescriptionChange,
					placeholder: "Primary text variant…",
					className: "min-h-[88px] resize-y border-muted bg-background text-sm leading-relaxed focus-visible:ring-primary/20"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[10px] text-muted-foreground",
					children: [value.trim().length, " characters"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-col gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: isPreviewing ? "default" : "ghost",
					size: "icon",
					className: "size-8",
					onClick: handleSelectPreview,
					title: "Show in preview",
					"aria-label": `Preview primary text ${index + 1}`,
					children: isPreviewing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "size-3.5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon",
					className: "size-8 text-muted-foreground hover:text-destructive",
					onClick: handleRemove,
					"aria-label": `Remove primary text ${index + 1}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
				})]
			})
		]
	});
}
function DescriptionDisplayRow(props) {
	const { value, index, copiedField, onCopy } = props;
	const handleCopy = () => {
		onCopy(value, `desc-${index}`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group flex items-start justify-between gap-3 p-4 rounded-xl border bg-background hover:border-accent/20 transition-colors",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 text-[10px] font-bold text-muted-foreground/50",
				children: index + 1
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-relaxed",
				children: value
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: "size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
			onClick: handleCopy,
			"aria-label": `Copy primary text ${index + 1}`,
			children: copiedField === `desc-${index}` ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" })
		})]
	});
}
function CopyValueButton(props) {
	const { value, field, copiedField, onCopy, className, ariaLabel, iconClassName } = props;
	const handleCopy = () => {
		onCopy(value, field);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "icon",
		className,
		onClick: handleCopy,
		"aria-label": ariaLabel,
		children: copiedField === field ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: iconClassName }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: iconClassName })
	});
}
function InsightScoreBar(props) {
	const { score } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-full bg-primary",
		style: { width: `${score}%` }
	});
}
function CreativeEditorEditTab(props) {
	const { creative, copiedField, onCopy, isEditing, editedHeadlines, editedDescriptions, editedCta, editedLandingPage, previewHeadlineIndex, previewDescriptionIndex, onPreviewHeadlineIndexChange, onPreviewDescriptionIndexChange, onAddHeadline, onRemoveHeadline, onUpdateHeadline, onAddDescription, onRemoveDescription, onUpdateDescription, onChangeCta, onChangeLandingPage, generatingHeadlines, generatingDescriptions, onGenerateHeadlines, onGenerateDescriptions } = props;
	const handleLandingPageChange = (event) => {
		onChangeLandingPage(event.target.value);
	};
	const editableHeadlineItems = toStableStringItems(editedHeadlines);
	const headlineItems = toStableStringItems(creative.headlines ?? []);
	const editableDescriptionItems = toStableStringItems(editedDescriptions);
	const descriptionItems = toStableStringItems(creative.descriptions ?? []);
	const showEditableContent = isEditing;
	const noopSelectPreview = () => void 0;
	const handleSelectHeadlinePreview = onPreviewHeadlineIndexChange ?? noopSelectPreview;
	const handleSelectDescriptionPreview = onPreviewDescriptionIndexChange ?? noopSelectPreview;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border border-border/60 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-sm flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointer2, { className: "size-4 text-primary" }), "Call to action"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: showEditableContent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: editedCta || void 0,
					onValueChange: onChangeCta,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "h-9 bg-background",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select CTA" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: META_CTA_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: option.value,
						children: option.label
					}, option.value)) })]
				}) : creative.callToAction ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "secondary",
					className: "border-none bg-accent/10 px-3 py-1 text-primary hover:bg-accent/20",
					children: formatCTALabel(creative.callToAction)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm italic text-muted-foreground",
					children: "Not specified"
				}) })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border border-border/60 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-sm flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { className: "size-4 text-primary" }), "Landing page"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: showEditableContent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: editedLandingPage,
					onChange: handleLandingPageChange,
					placeholder: "https://example.com/landing",
					type: "url",
					className: "h-9 bg-background"
				}) : creative.landingPageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs font-medium text-primary underline underline-offset-4",
						children: creative.landingPageUrl
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyValueButton, {
						value: creative.landingPageUrl ?? "",
						field: "landing",
						copiedField,
						onCopy,
						className: "size-7 shrink-0",
						ariaLabel: "Copy landing page URL",
						iconClassName: "size-3"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm italic text-muted-foreground",
					children: "No link configured"
				}) })]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "border border-border/60 shadow-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "pb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-base flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Type, { className: "size-4 text-primary" }), "Headlines"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-xs",
						children: "Catch attention with short, punchy titles."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "text-[10px] font-bold",
							children: [editedHeadlines.filter((h) => h.trim()).length || creative.headlines?.length || 0, " variants"]
						}), showEditableContent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: onAddHeadline,
							className: "h-8 gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "Add"]
						}) : null]
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-2",
				children: [showEditableContent ? editedHeadlines.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-h-[320px] space-y-2 overflow-y-auto pr-1",
					children: editableHeadlineItems.map((headlineItem) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadlineEditRow, {
						value: headlineItem.value,
						index: headlineItem.index,
						isPreviewing: headlineItem.index === previewHeadlineIndex,
						onUpdate: onUpdateHeadline,
						onRemove: onRemoveHeadline,
						onSelectPreview: handleSelectHeadlinePreview
					}, headlineItem.key))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border-2 border-dashed p-6 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-sm text-muted-foreground",
						children: "No headlines yet."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: onAddHeadline,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Add headline"]
					})]
				}) : creative.headlines && creative.headlines.length > 0 ? headlineItems.map((headlineItem) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadlineDisplayRow, {
					value: headlineItem.value,
					index: headlineItem.index,
					copiedField,
					onCopy
				}, headlineItem.key)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-4 text-center text-sm text-muted-foreground",
					children: "No headlines available"
				}), showEditableContent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: onGenerateHeadlines,
					disabled: !onGenerateHeadlines || generatingHeadlines,
					className: "mt-2 h-8 gap-1.5 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5 text-primary" }), generatingHeadlines ? "Generating…" : "Generate AI headlines"]
				}) : null]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "border-none shadow-sm bg-background/50 backdrop-blur-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "pb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-base flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4 text-primary" }), "Primary Text"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-xs",
						children: "The main copy that appears above or below your media."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "text-[10px] font-bold",
							children: [editedDescriptions.filter((d) => d.trim()).length || creative.descriptions?.length || 0, " variants"]
						}), showEditableContent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: onAddDescription,
							className: "h-8 gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "Add"]
						}) : null]
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-2",
				children: [showEditableContent ? editedDescriptions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-h-[360px] space-y-2 overflow-y-auto pr-1",
					children: editableDescriptionItems.map((descriptionItem) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DescriptionEditRow, {
						value: descriptionItem.value,
						index: descriptionItem.index,
						isPreviewing: descriptionItem.index === previewDescriptionIndex,
						onUpdate: onUpdateDescription,
						onRemove: onRemoveDescription,
						onSelectPreview: handleSelectDescriptionPreview
					}, descriptionItem.key))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border-2 border-dashed p-6 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-sm text-muted-foreground",
						children: "No primary text yet."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: onAddDescription,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Add primary text"]
					})]
				}) : creative.descriptions && creative.descriptions.length > 0 ? descriptionItems.map((descriptionItem) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DescriptionDisplayRow, {
					value: descriptionItem.value,
					index: descriptionItem.index,
					copiedField,
					onCopy
				}, descriptionItem.key)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-4 text-center text-sm text-muted-foreground",
					children: "No primary text available"
				}), showEditableContent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: onGenerateDescriptions,
					disabled: !onGenerateDescriptions || generatingDescriptions,
					className: "mt-2 h-8 gap-1.5 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5 text-primary" }), generatingDescriptions ? "Generating…" : "Generate AI primary text"]
				}) : null]
			})]
		})
	] });
}
function CreativeEditorInsightsTab({ performanceSummary = null, onRefreshPerformance, algorithmicInsights }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "border-none shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-primary" }), "AI Creative Analysis"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
				className: "text-xs",
				children: "Algorithmic suggestions to improve your creative performance."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "space-y-4",
			children: !performanceSummary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-8 text-center border-2 border-dashed rounded-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-10 text-muted-foreground/30 mx-auto mb-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Load performance metrics to generate AI insights."
					}),
					onRefreshPerformance ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						className: "mt-4",
						onClick: onRefreshPerformance,
						children: "Fetch Data"
					}) : null
				]
			}) : algorithmicInsights.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-8 text-center border-2 border-dashed rounded-2xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No critical insights identified for this creative."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-1",
					children: "Keep monitoring performance as you scale spend."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-4",
				children: algorithmicInsights.map((insight) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "group relative p-5 rounded-2xl bg-gradient-to-br from-background to-muted/20 border border-muted shadow-sm hover:border-accent/20 motion-chromatic",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-4 mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-bold text-sm tracking-tight",
								children: insight.title
							}), typeof insight.score === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-1.5 w-12 bg-muted rounded-full overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightScoreBar, { score: insight.score })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[10px] font-bold",
									children: [Math.round(insight.score), "%"]
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "text-[10px] bg-accent/10 text-primary border-none",
								children: "TIP"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground leading-relaxed mb-4",
							children: insight.message
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 rounded-xl bg-accent/5 border border-accent/10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-3" }), " Recommendation"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium",
								children: insight.suggestion
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100",
							"aria-label": "Add recommendation to draft",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" })
						})
					]
				}, `${insight.title}-${insight.message}-${insight.suggestion}`))
			})
		})]
	});
}
function CreativeEditorDetailsTab({ creative, copiedField, onCopy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "border-none shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelsTopLeft, { className: "size-4 text-primary" }), "Technical Metadata"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3 rounded-xl bg-muted/30 border border-muted/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1",
						children: "Creative ID"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-mono truncate",
							children: creative.creativeId
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyValueButton, {
							value: creative.creativeId,
							field: "creativeId",
							copiedField,
							onCopy,
							className: "size-6",
							ariaLabel: "Copy creative ID",
							iconClassName: "size-3"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3 rounded-xl bg-muted/30 border border-muted/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1",
						children: "Campaign ID"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-mono truncate",
							children: creative.campaignId
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyValueButton, {
							value: creative.campaignId,
							field: "campaignId",
							copiedField,
							onCopy,
							className: "size-6",
							ariaLabel: "Copy campaign ID",
							iconClassName: "size-3"
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-6" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [creative.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeImageViewer, {
						src: creative.imageUrl,
						alt: creative.name || "Creative image",
						variant: "thumbnail"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyValueButton, {
							value: creative.imageUrl,
							field: "imageUrl",
							copiedField,
							onCopy,
							className: "size-8",
							ariaLabel: "Copy source image URL",
							iconClassName: "size-3.5"
						})
					})]
				}) : null, creative.videoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3 rounded-xl border bg-background flex items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-10 rounded bg-muted flex items-center justify-center shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-5 text-muted-foreground" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
								children: "Source Video"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs truncate text-primary",
								children: creative.videoUrl
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyValueButton, {
						value: creative.videoUrl ?? "",
						field: "videoUrl",
						copiedField,
						onCopy,
						className: "size-8",
						ariaLabel: "Copy source video URL",
						iconClassName: "size-3.5"
					})]
				})]
			})
		] })]
	});
}
function CreativeEditorTabs(props) {
	const { isDirty = false, previewHeadlineIndex = 0, previewDescriptionIndex = 0, ...rest } = props;
	const tabProps = {
		...rest,
		previewHeadlineIndex,
		previewDescriptionIndex
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "edit",
			className: "w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "h-10 bg-muted/40 p-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "edit",
								className: "gap-2 px-3 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "size-3.5" }), "Content"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "insights",
								className: "gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5 text-primary" }), "AI Insights"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "details",
								className: "gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelsTopLeft, { className: "size-3.5" }), "Technical"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: isDirty ? "You have unsaved edits." : "Edit copy below — preview updates live on the left."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "edit",
					className: "mt-0 space-y-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeEditorEditTab, { ...tabProps })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "insights",
					className: "mt-0 space-y-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeEditorInsightsTab, {
						performanceSummary: tabProps.performanceSummary,
						onRefreshPerformance: tabProps.onRefreshPerformance,
						algorithmicInsights: tabProps.algorithmicInsights
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "details",
					className: "mt-0 space-y-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeEditorDetailsTab, {
						creative: tabProps.creative,
						copiedField: tabProps.copiedField,
						onCopy: tabProps.onCopy
					})
				})
			]
		})
	});
}
function getStatusVariant(status) {
	const s = status.toLowerCase();
	if (s === "enabled" || s === "enable" || s === "active") return "bg-success/10 text-success border-success/20";
	if (s === "paused" || s === "disable") return "bg-warning/10 text-warning border-warning/20";
	if (s === "deleted" || s === "removed") return "bg-destructive/10 text-destructive border-destructive/20";
	return "bg-muted/50 text-muted-foreground border-muted";
}
function CreativeHeader(props) {
	const { creative, backUrl, displayName, isDirty, isSaving, onCancelEditing, onSave, onRefreshCreative, onRefreshPerformance } = props;
	const socialPermalink = creative.providerId === "facebook" ? resolveMetaSocialPermalink({
		instagramPermalinkUrl: creative.instagramPermalinkUrl,
		objectStoryId: creative.objectStoryId
	}) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion_exports.m.header, {
			initial: "hidden",
			animate: "visible",
			variants: fadeInDownVariants,
			transition: transitions.slow,
			className: cn(ADS_PAGE_THEME.innerHero, "mb-6"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: ADS_PAGE_THEME.innerHeroGlow,
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-start gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						href: backUrl,
						className: "group shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background/80 transition-colors group-hover:border-primary/25 group-hover:bg-primary/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
								className: "size-5 text-muted-foreground transition-colors group-hover:text-primary",
								"aria-hidden": true
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
												className: "size-3 text-primary",
												"aria-hidden": true
											}),
											"Creative",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
												className: "size-3 opacity-50",
												"aria-hidden": true
											}),
											creative.providerId
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: cn("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest", getStatusVariant(creative.status)),
										children: creative.status
									}),
									isDirty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "secondary",
										className: "h-5 gap-1 rounded-full px-2 text-[10px] font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "size-1.5 rounded-full bg-primary",
											"aria-hidden": true
										}), "Unsaved"]
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "flex flex-wrap items-center gap-2.5 text-xl font-semibold tracking-tight sm:text-2xl",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TruncatedTextPreview, {
										text: displayName,
										className: "min-w-0 max-w-[min(100%,20rem)]"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "shrink-0 rounded-lg border border-border/60 bg-muted/30 p-1.5",
										children: getTypeIcon(creative.type)
									}),
									socialPermalink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: socialPermalink,
										target: "_blank",
										rel: "noopener noreferrer",
										className: "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 text-muted-foreground hover:border-primary/30 hover:text-primary",
										title: "Open post on Instagram or Facebook",
										"aria-label": "Open social permalink",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
											className: "size-4",
											"aria-hidden": true
										})
									}) : null
								]
							}),
							creative.campaignName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted-foreground",
								children: ["Campaign: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-foreground",
									children: creative.campaignName
								})]
							}) : null
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 sm:justify-end",
					children: [isDirty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: onCancelEditing,
						disabled: isSaving,
						className: "h-10 rounded-xl border-border/70",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "mr-1.5 size-3.5",
							"aria-hidden": true
						}), "Discard"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						onClick: onSave,
						disabled: isSaving,
						className: "h-10 rounded-full px-5 text-sm font-semibold shadow-sm",
						children: [isSaving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
							className: "mr-1.5 size-3.5 animate-spin",
							"aria-hidden": true
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, {
							className: "mr-1.5 size-3.5",
							"aria-hidden": true
						}), isSaving ? "Saving…" : "Save changes"]
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden items-center gap-1.5 border-r border-border/50 pr-3 lg:flex",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							className: "h-10 rounded-xl border border-transparent px-3 text-xs font-medium text-muted-foreground hover:border-border/60 hover:bg-muted/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share, {
								className: "mr-2 size-4",
								"aria-hidden": true
							}), "Export"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "icon",
							className: "size-10 rounded-xl border-border/70",
							"aria-label": "Creative actions",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {
								className: "size-5",
								"aria-hidden": true
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						className: "w-60 rounded-2xl border-border/60 p-2 shadow-xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: onRefreshCreative,
								className: "cursor-pointer gap-3 rounded-xl py-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-8 items-center justify-center rounded-lg bg-muted/50",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
										className: "size-4 text-muted-foreground",
										"aria-hidden": true
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-semibold",
										children: "Sync from Meta"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground",
										children: "Refresh creative data"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: onRefreshPerformance,
								className: "cursor-pointer gap-3 rounded-xl py-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-8 items-center justify-center rounded-lg bg-muted/50",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, {
										className: "size-4 text-muted-foreground",
										"aria-hidden": true
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-semibold",
										children: "Update metrics"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground",
										children: "Reload performance stats"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, { className: "my-2" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								className: "cursor-pointer gap-3 rounded-xl py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-8 items-center justify-center rounded-lg bg-destructive/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
										className: "size-4 text-destructive",
										"aria-hidden": true
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-semibold",
									children: "Delete asset"
								})]
							})
						]
					})] })]
				})]
			})]
		})
	});
}
function CreativeSaveBar(props) {
	const { isDirty, isSaving, onSave, onDiscard, className } = props;
	if (!isDirty && !isSaving) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("sticky bottom-0 z-30 mt-4 rounded-2xl border border-border/60 bg-background/95 px-4 py-3 shadow-lg shadow-primary/5 backdrop-blur-md supports-backdrop-filter:bg-background/80", className),
		"aria-label": "Save creative changes",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold text-foreground",
					children: isSaving ? "Saving to Meta…" : "Unsaved changes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: isSaving ? "Publishing your copy updates to the ad platform." : "Press ⌘S to save, or use the buttons below."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: onDiscard,
					disabled: isSaving,
					className: "h-9",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1.5 size-3.5" }), "Discard"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					onClick: onSave,
					disabled: isSaving || !isDirty,
					className: "h-9 min-w-[140px] shadow-md shadow-primary/15",
					children: [isSaving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-1.5 size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-1.5 size-3.5" }), isSaving ? "Saving…" : "Save to Meta"]
				})]
			})]
		})
	});
}
/** Platform-accurate preview colors (not design tokens — ad network UI fidelity). */
var creativePlatformMockTheme = {
	avatarPlaceholderBg: "#e4e6eb",
	textPrimary: "#050505",
	textSecondary: "#65676b",
	textMuted: "#8e8e8e",
	link: "#00376b",
	borderLight: "#efefef",
	borderDefault: "#dadde1",
	surface: "#ffffff",
	surfaceMuted: "#f0f2f5",
	surfaceButton: "#e4e6eb",
	ctaInstagram: "#0095f6",
	instagramRingFrom: "#feda75",
	instagramRingVia: "#fa7e1e",
	instagramRingTo: "#d62976"
};
/** Module-level styles for platform mock (stable references for react-perf). */
var cpMockStyles = {
	avatarPlaceholder: {
		backgroundColor: creativePlatformMockTheme.avatarPlaceholderBg,
		color: creativePlatformMockTheme.textPrimary
	},
	igSurface: {
		backgroundColor: creativePlatformMockTheme.surface,
		color: creativePlatformMockTheme.textPrimary
	},
	igRing: { backgroundImage: `linear-gradient(to top right, ${creativePlatformMockTheme.instagramRingFrom}, ${creativePlatformMockTheme.instagramRingVia}, ${creativePlatformMockTheme.instagramRingTo})` },
	textMuted: { color: creativePlatformMockTheme.textMuted },
	textPrimary: { color: creativePlatformMockTheme.textPrimary },
	textSecondary: { color: creativePlatformMockTheme.textSecondary },
	link: { color: creativePlatformMockTheme.link },
	borderLightTop: { borderColor: creativePlatformMockTheme.borderLight },
	ctaInstagram: { backgroundColor: creativePlatformMockTheme.ctaInstagram },
	fbOuter: {
		backgroundColor: creativePlatformMockTheme.surfaceMuted,
		color: creativePlatformMockTheme.textPrimary
	},
	fbInner: { backgroundColor: creativePlatformMockTheme.surface },
	fbMediaBorder: { borderColor: `${creativePlatformMockTheme.borderDefault}cc` },
	fbLinkRow: {
		borderColor: creativePlatformMockTheme.borderDefault,
		backgroundColor: creativePlatformMockTheme.surfaceMuted
	},
	fbCta: {
		backgroundColor: creativePlatformMockTheme.surfaceButton,
		color: creativePlatformMockTheme.textPrimary
	},
	fbActionsBar: { borderColor: creativePlatformMockTheme.borderDefault }
};
var crispEdgesStyle$1 = { imageRendering: "crisp-edges" };
var whileHoverScale = { scale: 1.1 };
var whileTapScale = { scale: .9 };
function CreativePreviewMedia({ creative, displayName, mediaAspectClass, imageLoadFailed, imageLightboxOpen, isPlaying, videoRef, onPlay, onPause, onEnded, onImageLoadFailed, onOpenImageLightbox, onImageLightboxOpenChange, onTogglePlayPause }) {
	if (creative.videoUrl && isDirectVideoUrl(creative.videoUrl)) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative bg-foreground overflow-hidden group/video", mediaAspectClass),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
			ref: videoRef,
			src: creative.videoUrl,
			"aria-label": `${displayName} video preview`,
			className: "size-full object-cover",
			poster: creative.imageUrl || creative.thumbnailUrl,
			onPlay,
			onPause,
			onEnded,
			style: crispEdgesStyle$1,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("track", { kind: "captions" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onTogglePlayPause,
			className: "absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "size-14 rounded-full bg-background/40 backdrop-blur-xl border border-background/20 flex items-center justify-center shadow-2xl",
				children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-6 text-background" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-6 text-background ml-1" })
			})
		})]
	});
	if (creative.videoUrl) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative bg-foreground flex items-center justify-center overflow-hidden group", mediaAspectClass),
		children: [
			creative.imageUrl && !imageLoadFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
				src: creative.imageUrl,
				alt: displayName,
				fill: true,
				unoptimized: true,
				sizes: "(max-width: 768px) 100vw, 640px",
				className: "object-cover opacity-70 group-hover:scale-105 transition-transform duration-[var(--motion-duration-xslow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none",
				onError: onImageLoadFailed,
				style: crispEdgesStyle$1
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-muted-foreground flex flex-col items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-10 mb-2 opacity-20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] text-background/40 uppercase tracking-widest font-black",
					children: "Video Preview"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
					whileHover: whileHoverScale,
					whileTap: whileTapScale,
					variants: scaleVariants,
					className: "size-14 rounded-full bg-background/40 backdrop-blur-xl border border-background/20 flex items-center justify-center shadow-2xl cursor-pointer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-6 text-background" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute bottom-4 left-4 flex gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-md bg-foreground/60 backdrop-blur-md text-background px-2 py-0.5 text-[8px] font-black tracking-widest uppercase border border-background/10",
					children: "4K Stream"
				})
			})
		]
	});
	if (creative.imageUrl) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative overflow-hidden bg-muted/10 group", mediaAspectClass),
		children: [
			imageLoadFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center py-20 text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
					className: "mb-2 size-8 opacity-20",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] font-bold uppercase tracking-tighter",
					children: "Asset Unavailable"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "relative block size-full cursor-zoom-in",
				onClick: onOpenImageLightbox,
				"aria-label": `View full image for ${displayName}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
					src: creative.imageUrl,
					alt: displayName,
					fill: true,
					unoptimized: true,
					sizes: "(max-width: 768px) 100vw, 640px",
					className: "object-cover transition-transform duration-[var(--motion-duration-xslow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none group-hover:scale-110",
					onError: onImageLoadFailed,
					style: crispEdgesStyle$1
				})
			}),
			!imageLoadFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] group-hover:opacity-100 motion-reduce:opacity-0" }) : null,
			!imageLoadFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute bottom-3 right-3 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					variant: "secondary",
					className: "pointer-events-auto h-8 gap-1.5 bg-background/95 shadow-md",
					onClick: onOpenImageLightbox,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, {
						className: "size-3.5",
						"aria-hidden": true
					}), "Expand"]
				})
			}) : null
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: imageLightboxOpen,
		onOpenChange: onImageLightboxOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-4xl gap-0 overflow-hidden border-border/60 p-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "sr-only",
					children: displayName
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "sr-only",
					children: "Full-size creative preview"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative max-h-[85vh] min-h-[240px] w-full bg-foreground/95",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
						src: creative.imageUrl,
						alt: displayName,
						width: 1200,
						height: 1200,
						unoptimized: true,
						className: "mx-auto h-auto max-h-[85vh] w-full object-contain",
						onError: onImageLoadFailed
					})
				})
			]
		})
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/5 rounded-2xl border-2 border-dashed border-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-10 mb-2 opacity-10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] font-black uppercase tracking-widest text-muted-foreground/40",
			children: "No Asset Data"
		})]
	});
}
var crispEdgesStyle = { imageRendering: "crisp-edges" };
var exitSlideLeft = {
	opacity: 0,
	x: -20
};
function PreviewAvatar(props) {
	const { pageName, profileImageUrl, profileImageError, onProfileImageError, className, ringClassName } = props;
	const initial = pageName.slice(0, 1).toUpperCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("shrink-0 overflow-hidden rounded-full", ringClassName, className),
		children: profileImageUrl && !profileImageError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
			src: profileImageUrl,
			alt: "",
			width: 40,
			height: 40,
			unoptimized: true,
			className: "size-full object-cover",
			onError: onProfileImageError,
			style: crispEdgesStyle
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex size-full items-center justify-center text-sm font-semibold",
			style: cpMockStyles.avatarPlaceholder,
			children: initial
		})
	});
}
function CreativePlatformMock({ activePlatform, campaignName, creative, displayName, pageDisplayName, primaryText, headlineText, landingHostname, profileImageError, onProfileImageError, previewMediaProps }) {
	const previewMedia = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativePreviewMedia, { ...previewMediaProps });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.AnimatePresence, {
		mode: "wait",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion_exports.m.div, {
			initial: "hidden",
			animate: "visible",
			exit: exitSlideLeft,
			variants: slideInLeftVariants,
			transition: transitions.normal,
			className: "w-full",
			children: [
				activePlatform === "instagram" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overflow-hidden",
					style: cpMockStyles.igSurface,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-3 py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-center gap-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-full p-[2px]",
									style: cpMockStyles.igRing,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewAvatar, {
										pageName: pageDisplayName,
										profileImageUrl: creative.pageProfileImageUrl,
										profileImageError,
										onProfileImageError,
										className: "size-8"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-[13px] font-semibold leading-tight",
										children: pageDisplayName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] leading-tight",
										style: cpMockStyles.textMuted,
										children: "Sponsored"
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {
								className: "size-5 shrink-0",
								style: cpMockStyles.textPrimary,
								strokeWidth: 1.75
							})]
						}),
						primaryText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-3 pb-3 pt-0.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "whitespace-pre-wrap text-[14px] leading-[1.4]",
								style: cpMockStyles.textPrimary,
								children: primaryText
							})
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-full",
							children: previewMedia
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-3 py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
										className: "size-6",
										strokeWidth: 1.75
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
										className: "size-6",
										strokeWidth: 1.75
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {
										className: "size-6",
										strokeWidth: 1.75
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, {
								className: "size-6",
								strokeWidth: 1.75
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1 px-3 pb-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[13px] font-semibold",
									children: "11,492 likes"
								}),
								!primaryText ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[14px] leading-[1.4]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold",
											children: pageDisplayName
										}),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-normal",
											style: cpMockStyles.textPrimary,
											children: "See more"
										})
									]
								}) : null,
								headlineText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[13px] font-medium",
									style: cpMockStyles.link,
									children: headlineText
								}) : null
							]
						}),
						creative.callToAction ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-t px-3 py-2.5",
							style: cpMockStyles.borderLightTop,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "w-full rounded-lg py-2 text-center text-[14px] font-semibold text-white",
								style: cpMockStyles.ctaInstagram,
								children: formatCTALabel(creative.callToAction)
							})
						}) : null
					]
				}),
				activePlatform === "linkedin" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-background rounded-tr-[2.5rem] rounded-tl-[2.5rem] overflow-hidden text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-10 rounded-lg bg-info flex items-center justify-center text-info-foreground font-black text-lg overflow-hidden shrink-0",
								children: creative.pageProfileImageUrl && !profileImageError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
									src: creative.pageProfileImageUrl,
									alt: "",
									width: 40,
									height: 40,
									unoptimized: true,
									className: "size-full object-cover",
									onError: onProfileImageError,
									style: crispEdgesStyle
								}) : (creative.pageName || creative.campaignName || campaignName || "A").slice(0, 1).toUpperCase()
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[13px] font-bold leading-tight truncate",
									children: creative.pageName || creative.campaignName || campaignName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] opacity-60 leading-tight",
									children: "Promoted"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-4 pb-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs leading-relaxed line-clamp-2",
								children: creative.descriptions?.[0] || "No description available."
							})
						}),
						previewMedia,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 bg-muted/5 flex items-center justify-between border-y border-muted-foreground/10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 pr-4 space-y-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[13px] font-bold truncate tracking-tight",
									children: creative.headlines?.[0] || displayName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] opacity-50 truncate font-medium uppercase tracking-wider",
									children: new URL(creative.landingPageUrl || "https://learnmore.com").hostname
								})]
							}), creative.callToAction && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								className: "h-9 px-4 text-[11px] font-black uppercase tracking-widest border-info text-info hover:bg-info/10 shrink-0 rounded-full",
								children: formatCTALabel(creative.callToAction)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-3 flex items-center gap-6 opacity-60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[11px] font-bold flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4" }), " Like"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[11px] font-bold flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }), " Comment"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[11px] font-bold flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), " Repost"]
								})
							]
						})
					]
				}),
				activePlatform === "tiktok" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-background rounded-tr-[2.5rem] rounded-tl-[2.5rem] overflow-hidden text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-10 rounded-full bg-foreground text-background flex items-center justify-center font-black text-sm overflow-hidden shrink-0",
									children: creative.pageProfileImageUrl && !profileImageError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
										src: creative.pageProfileImageUrl,
										alt: "",
										width: 40,
										height: 40,
										unoptimized: true,
										className: "size-full object-cover",
										onError: onProfileImageError,
										style: crispEdgesStyle
									}) : (creative.pageName || creative.campaignName || campaignName || "A").slice(0, 1).toUpperCase()
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[13px] font-bold leading-tight truncate",
										children: creative.pageName || creative.campaignName || campaignName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] opacity-60 leading-tight",
										children: "Sponsored content"
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4 opacity-40" })]
						}),
						previewMedia,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-6 text-[11px] font-bold opacity-80",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4" }), " 12.4K"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }), " 418"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), " 109"]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[13px] font-bold truncate",
										children: creative.headlines?.[0] || displayName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs leading-relaxed line-clamp-3 text-foreground/80",
										children: creative.descriptions?.[0] || "No description available."
									})]
								}),
								creative.callToAction && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "w-full h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-[11px] font-black uppercase tracking-widest",
									children: formatCTALabel(creative.callToAction)
								})
							]
						})
					]
				}),
				activePlatform === "facebook" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative flex flex-col font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]",
					style: cpMockStyles.fbOuter,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col",
						style: cpMockStyles.fbInner,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 px-3 pb-1 pt-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewAvatar, {
										pageName: pageDisplayName,
										profileImageUrl: creative.pageProfileImageUrl,
										profileImageError,
										onProfileImageError,
										className: "size-10"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1 text-left",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-[15px] font-semibold leading-[1.2]",
											children: pageDisplayName
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "flex items-center gap-1 text-[13px] leading-[1.2]",
											style: cpMockStyles.textSecondary,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sponsored" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"aria-hidden": true,
													children: "·"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, {
													className: "size-3",
													"aria-hidden": true
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {
										className: "size-5 shrink-0",
										style: cpMockStyles.textSecondary,
										strokeWidth: 1.75
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-3 pb-3 pt-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "whitespace-pre-wrap text-[15px] font-normal leading-[1.3333]",
									style: cpMockStyles.textPrimary,
									children: primaryText || "No primary text available."
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full border-y",
								style: cpMockStyles.fbMediaBorder,
								children: previewMedia
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-stretch gap-3 border-b px-3 py-2.5",
								style: cpMockStyles.fbLinkRow,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1 py-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-[12px] uppercase",
										style: cpMockStyles.textSecondary,
										children: landingHostname
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 line-clamp-2 text-[16px] font-semibold leading-[1.2]",
										style: cpMockStyles.textPrimary,
										children: headlineText
									})]
								}), creative.callToAction ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "shrink-0 self-center rounded-md px-4 py-2 text-[15px] font-semibold",
									style: cpMockStyles.fbCta,
									children: formatCTALabel(creative.callToAction)
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-around border-b p-1",
								style: cpMockStyles.fbActionsBar,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[15px] font-semibold hover:bg-muted/40",
										style: cpMockStyles.textSecondary,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, {
											className: "size-[18px]",
											strokeWidth: 1.75
										}), "Like"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[15px] font-semibold hover:bg-muted/40",
										style: cpMockStyles.textSecondary,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
											className: "size-[18px]",
											strokeWidth: 1.75
										}), "Comment"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[15px] font-semibold hover:bg-muted/40",
										style: cpMockStyles.textSecondary,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {
											className: "size-[18px]",
											strokeWidth: 1.75
										}), "Share"]
									})
								]
							})
						]
					})
				})
			]
		}, activePlatform)
	});
}
function CreativeSocialPreviewVariantButton({ index, selected, onSelect }) {
	const onSelectPreview = () => onSelect(index);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: onSelectPreview,
		className: cn("h-6 min-w-6 rounded-md px-1.5 text-[10px] font-bold transition-colors", selected ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"),
		children: index + 1
	});
}
function CreativeSocialPreviewToolbar({ aspectRatio, activePlatform, availablePlatforms, onSetFeed, onSetReel, onPlatformChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between px-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] font-black text-primary tracking-[0.2em] uppercase mb-0.5",
				children: "Preview"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-lg tracking-tight",
				children: "Social Mockup"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-muted-foreground/10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onSetFeed,
					className: cn("size-8 rounded-md flex items-center justify-center motion-chromatic", aspectRatio === "feed" ? "bg-background shadow-sm" : "hover:bg-muted/50"),
					title: "Feed (1:1)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onSetReel,
					className: cn("size-8 rounded-md flex items-center justify-center motion-chromatic", aspectRatio === "reel" ? "bg-background shadow-sm" : "hover:bg-muted/50"),
					title: "Reel (9:16)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RectangleVertical, { className: "size-4" })
				})]
			}), availablePlatforms.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				value: activePlatform,
				onValueChange: onPlatformChange,
				className: "w-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "h-10 bg-muted/30 p-1 rounded-lg border border-muted-foreground/10",
					children: [
						availablePlatforms.includes("facebook") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "facebook",
							className: "size-8 p-0 rounded-md",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
								brand: "facebook",
								className: "size-4",
								labeled: false
							})
						}) : null,
						availablePlatforms.includes("instagram") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "instagram",
							className: "size-8 p-0 rounded-md",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
								brand: "instagram",
								className: "size-4",
								labeled: false
							})
						}) : null,
						availablePlatforms.includes("linkedin") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "linkedin",
							className: "size-8 p-0 rounded-md",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
								brand: "linkedin",
								className: "size-4",
								labeled: false
							})
						}) : null
					]
				})
			}) : null]
		})]
	});
}
var progressBarInitial = { width: 0 };
var progressBarTransition = {
	duration: motionLoopSeconds.shimmer,
	ease: easings.easeOut
};
function CreativeSocialPreviewScoreCard({ creative, performanceSummary, efficiencyScore }) {
	const scoreCardTransition = {
		...transitions.slow,
		delay: .2
	};
	const progressBarAnimate = { width: `${efficiencyScore}%` };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
			initial: "hidden",
			animate: "visible",
			variants: fadeInUpVariants,
			transition: scoreCardTransition,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border border-border/60 bg-card shadow-lg rounded-[2.5rem] overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-4 pt-8 px-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary/80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-6 rounded-lg bg-accent/10 flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-3.5 text-primary" })
						}), "The Alpha Score"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-8 px-8 pb-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-6xl font-black tracking-tighter text-primary",
										children: efficiencyScore
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-bold text-primary/40 leading-none",
										children: "/ 100"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60",
									children: performanceSummary.period
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 justify-end group",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold text-muted-foreground/40 group-hover:text-primary transition-colors",
										children: "ROAS"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-lg font-black tracking-tight",
										children: [performanceSummary.roas.toFixed(2), "x"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 justify-end group",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold text-muted-foreground/40 group-hover:text-primary transition-colors",
										children: "CTR"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-lg font-black tracking-tight",
										children: [performanceSummary.ctr.toFixed(2), "%"]
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-3 w-full rounded-full bg-accent/5 border border-accent/5 p-0.5 overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
									initial: progressBarInitial,
									animate: progressBarAnimate,
									transition: progressBarTransition,
									className: "h-full bg-info rounded-full shadow-sm"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-[9px] font-black uppercase tracking-widest opacity-30",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Underperforming" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Industry Leader" })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] leading-relaxed text-muted-foreground font-medium text-center bg-background/30 backdrop-blur-sm p-4 rounded-2xl border border-muted-foreground/5 italic",
							children: [
								"\"This creative's conversion profile exceeds ",
								Math.max(0, efficiencyScore - 10),
								"% of tested assets in the ",
								creative.providerId,
								"-network benchmarks.\""
							]
						})
					]
				})]
			})
		})
	});
}
function createInitialCreativeSocialPreviewState(defaultPlatform) {
	return {
		imageLoadFailed: false,
		imageLightboxOpen: false,
		profileImageError: false,
		aspectRatio: "feed",
		isPlaying: false,
		activePlatform: defaultPlatform
	};
}
function creativeSocialPreviewReducer(state, action) {
	switch (action.type) {
		case "setImageLoadFailed": return {
			...state,
			imageLoadFailed: action.value
		};
		case "setImageLightboxOpen": return {
			...state,
			imageLightboxOpen: action.value
		};
		case "setProfileImageError": return {
			...state,
			profileImageError: action.value
		};
		case "setAspectRatio": return {
			...state,
			aspectRatio: action.value
		};
		case "setIsPlaying": return {
			...state,
			isPlaying: action.value
		};
		case "setActivePlatform": return {
			...state,
			activePlatform: action.value
		};
		default: return state;
	}
}
function safeHostname(url, fallback) {
	if (!url) return fallback;
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return fallback;
	}
}
function CreativeSocialPreview(props) {
	const { creative, campaignName, displayName, performanceSummary, efficiencyScore, headlineVariantCount = 0, descriptionVariantCount = 0, previewHeadlineIndex = 0, previewDescriptionIndex = 0, onPreviewHeadlineIndexChange, onPreviewDescriptionIndexChange } = props;
	const availablePlatforms = creative.providerId === "linkedin" ? ["linkedin"] : creative.providerId === "tiktok" ? ["tiktok"] : ["facebook", "instagram"];
	const [previewState, dispatch] = (0, import_react.useReducer)(creativeSocialPreviewReducer, availablePlatforms[0] ?? "facebook", createInitialCreativeSocialPreviewState);
	const { imageLoadFailed, imageLightboxOpen, profileImageError, aspectRatio, isPlaying, activePlatform } = previewState;
	const videoRef = import_react.useRef(null);
	const mediaAspectClass = aspectRatio === "reel" ? "aspect-[9/16]" : "aspect-square";
	const handlePlay = () => dispatch({
		type: "setIsPlaying",
		value: true
	});
	const handlePause = () => dispatch({
		type: "setIsPlaying",
		value: false
	});
	const handleEnded = () => dispatch({
		type: "setIsPlaying",
		value: false
	});
	const handleImageLoadFailed = () => dispatch({
		type: "setImageLoadFailed",
		value: true
	});
	const handleOpenImageLightbox = () => dispatch({
		type: "setImageLightboxOpen",
		value: true
	});
	const handleProfileImageError = () => dispatch({
		type: "setProfileImageError",
		value: true
	});
	const handleSetFeed = () => dispatch({
		type: "setAspectRatio",
		value: "feed"
	});
	const handleSetReel = () => dispatch({
		type: "setAspectRatio",
		value: "reel"
	});
	const handleImageLightboxOpenChange = (value) => dispatch({
		type: "setImageLightboxOpen",
		value
	});
	const togglePlayPause = () => {
		if (videoRef.current) {
			if (isPlaying) videoRef.current.pause();
			else videoRef.current.play();
			dispatch({
				type: "setIsPlaying",
				value: !isPlaying
			});
		}
	};
	const pageDisplayName = creative.pageName || creative.campaignName || creative.name || campaignName;
	const handlePreviewHeadlineSelect = (index) => onPreviewHeadlineIndexChange?.(index);
	const handlePreviewDescriptionSelect = (index) => onPreviewDescriptionIndexChange?.(index);
	const primaryText = creative.descriptions?.[0] || "";
	const headlineText = creative.headlines?.[0] || displayName;
	const landingHostname = safeHostname(creative.landingPageUrl, pageDisplayName.replace(/\s+/g, "").toLowerCase() + ".com");
	const handlePlatformChange = (v) => dispatch({
		type: "setActivePlatform",
		value: v
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "lg:col-span-5 self-start space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeSocialPreviewToolbar, {
					aspectRatio,
					activePlatform,
					availablePlatforms,
					onSetFeed: handleSetFeed,
					onSetReel: handleSetReel,
					onPlatformChange: handlePlatformChange
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overflow-hidden rounded-2xl border border-border/60 bg-[#f0f2f5] p-3 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-hidden rounded-lg border border-[#dadde1] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativePlatformMock, {
							activePlatform,
							campaignName,
							creative,
							displayName,
							pageDisplayName,
							primaryText,
							headlineText,
							landingHostname,
							profileImageError,
							onProfileImageError: handleProfileImageError,
							previewMediaProps: {
								creative,
								displayName,
								mediaAspectClass,
								imageLoadFailed,
								imageLightboxOpen,
								isPlaying,
								videoRef,
								onPlay: handlePlay,
								onPause: handlePause,
								onEnded: handleEnded,
								onImageLoadFailed: handleImageLoadFailed,
								onOpenImageLightbox: handleOpenImageLightbox,
								onImageLightboxOpenChange: handleImageLightboxOpenChange,
								onTogglePlayPause: togglePlayPause
							}
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center justify-between text-[10px] text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium uppercase tracking-wider",
								children: aspectRatio === "reel" ? "9:16 Reel/Story" : "1:1 Feed Post"
							})
						}), (headlineVariantCount > 1 || descriptionVariantCount > 1) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [headlineVariantCount > 1 && onPreviewHeadlineIndexChange ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1 rounded-lg border border-border/60 bg-background px-2 py-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-semibold text-muted-foreground",
									children: "Headline"
								}), Array.from({ length: headlineVariantCount }, (_, variantIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeSocialPreviewVariantButton, {
									index: variantIndex,
									selected: previewHeadlineIndex === variantIndex,
									onSelect: handlePreviewHeadlineSelect
								}, `headline-preview-v${variantIndex}`))]
							}) : null, descriptionVariantCount > 1 && onPreviewDescriptionIndexChange ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1 rounded-lg border border-border/60 bg-background px-2 py-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-semibold text-muted-foreground",
									children: "Copy"
								}), Array.from({ length: descriptionVariantCount }, (_, variantIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeSocialPreviewVariantButton, {
									index: variantIndex,
									selected: previewDescriptionIndex === variantIndex,
									onSelect: handlePreviewDescriptionSelect
								}, `description-preview-v${variantIndex}`))]
							}) : null]
						})]
					})]
				})]
			}), performanceSummary && efficiencyScore !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeSocialPreviewScoreCard, {
				creative,
				performanceSummary,
				efficiencyScore
			}) : null]
		})
	});
}
function CreativeDetailPageContent({ creative, previewCreative, backUrl, campaignName, displayName, isDirty, isSaving, copiedField, isEditing, editedHeadlines, editedDescriptions, editedCta, editedLandingPage, previewHeadlineIndex, previewDescriptionIndex, generatingHeadlines, generatingDescriptions, performanceSummary, efficiencyScore, algorithmicInsights, onCopy, onCancelEditing, onSave, onRefreshCreative, onRefreshPerformance, onPreviewHeadlineIndexChange, onPreviewDescriptionIndexChange, onAddHeadline, onRemoveHeadline, onUpdateHeadline, onAddDescription, onRemoveDescription, onUpdateDescription, onChangeCta, onChangeLandingPage, onGenerateHeadlines, onGenerateDescriptions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: ADS_PAGE_THEME.innerContainer,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeHeader, {
			creative,
			backUrl,
			displayName,
			isDirty,
			isSaving,
			onCancelEditing,
			onSave,
			onRefreshCreative,
			onRefreshPerformance
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeSocialPreview, {
				creative: previewCreative,
				campaignName,
				displayName,
				performanceSummary,
				efficiencyScore,
				headlineVariantCount: normalizeStringList(editedHeadlines).length,
				descriptionVariantCount: normalizeStringList(editedDescriptions).length,
				previewHeadlineIndex,
				previewDescriptionIndex,
				onPreviewHeadlineIndexChange,
				onPreviewDescriptionIndexChange
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col lg:col-span-7",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeEditorTabs, {
					creative,
					copiedField,
					onCopy,
					isEditing,
					isDirty,
					editedHeadlines,
					editedDescriptions,
					editedCta,
					editedLandingPage,
					previewHeadlineIndex,
					previewDescriptionIndex,
					onPreviewHeadlineIndexChange,
					onPreviewDescriptionIndexChange,
					onAddHeadline,
					onRemoveHeadline,
					onUpdateHeadline,
					onAddDescription,
					onRemoveDescription,
					onUpdateDescription,
					onChangeCta,
					onChangeLandingPage,
					generatingHeadlines,
					generatingDescriptions,
					onGenerateHeadlines,
					onGenerateDescriptions,
					performanceSummary,
					onRefreshPerformance,
					algorithmicInsights
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeSaveBar, {
					isDirty,
					isSaving,
					onSave,
					onDiscard: onCancelEditing
				})]
			})]
		})]
	});
}
function CreativeDetailPageLoadingState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: ADS_PAGE_THEME.innerContainer,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn(ADS_PAGE_THEME.innerHero, "space-y-4"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-10 rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-64 max-w-full rounded-lg" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-8 lg:grid-cols-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:col-span-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-square rounded-3xl" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4 lg:col-span-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[400px] rounded-2xl" })
			})]
		})]
	});
}
function CreativeDetailPageNotFoundState({ backUrl }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: ADS_PAGE_THEME.innerContainer,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn(ADS_PAGE_THEME.emptyState, "mx-auto max-w-md py-16"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-lg font-semibold text-foreground",
					children: "Creative not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "This asset may have been removed on the ad platform."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					className: "mt-2 rounded-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						href: backUrl,
						children: "Back to campaign"
					})
				})
			]
		})
	});
}
function useCreativeDetailPageClient(props) {
	const { campaignName: initialCampaignName, currency, searchParamsString = "" } = props;
	const params = useParams$1();
	const { selectedClientId } = useClientContext();
	const { user } = useAuth();
	const { isPreviewMode } = usePreview();
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const listCreatives = useAction(adsCreativesApi.listCreatives);
	const updateCreative = useAction(adsCreativesApi.updateCreative);
	const listAdMetrics = useAction(adsAdMetricsApi.listAdMetrics);
	const generateCopyAction = useAction(creativesCopyApi.generateCopy);
	const [state, dispatch] = (0, import_react.useReducer)(creativeDetailPageReducer, void 0, createInitialCreativeDetailPageState);
	const { creative, loading, copiedField, isEditing, editedHeadlines, editedDescriptions, editedCta, editedLandingPage, previewHeadlineIndex, previewDescriptionIndex, isSaving, generatingHeadlines, generatingDescriptions, days, creativeMetrics } = state;
	const metricsLoadingRef = (0, import_react.useRef)(false);
	const metricsErrorRef = (0, import_react.useRef)(null);
	const setPreviewHeadlineIndex = (value) => {
		dispatch({
			type: "setPreviewHeadlineIndex",
			value
		});
	};
	const setPreviewDescriptionIndex = (value) => {
		dispatch({
			type: "setPreviewDescriptionIndex",
			value
		});
	};
	const setEditedCta = (value) => {
		dispatch({
			type: "setEditedCta",
			value
		});
	};
	const setEditedLandingPage = (value) => {
		dispatch({
			type: "setEditedLandingPage",
			value
		});
	};
	const campaignName = initialCampaignName || "Campaign";
	const displayCurrency = normalizeCurrencyCode(currency ?? void 0) ?? "USD";
	const convexProviderId = resolveRouteProviderId(params.providerId);
	const fetchCreative = (0, import_react.useCallback)(async () => {
		dispatch({
			type: "setLoading",
			value: true
		});
		if (!convexProviderId) {
			dispatch({
				type: "setLoading",
				value: false
			});
			notifyFailure({
				title: "Unsupported provider",
				message: "This provider is not supported in the creative detail view."
			});
			return;
		}
		if (isPreviewMode) {
			dispatch({
				type: "setCreative",
				value: buildPreviewCreative(convexProviderId, params.campaignId, params.creativeId, campaignName)
			});
			dispatch({
				type: "setLoading",
				value: false
			});
			return;
		}
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
			clientId: selectedClientId ?? null,
			campaignId: params.campaignId,
			includeMedia: convexProviderId === "facebook",
			maxMetaCreativePages: convexProviderId === "facebook" ? 40 : void 0,
			maxGoogleAdsSearchPages: convexProviderId === "google" ? 15 : void 0
		}).then((creatives) => {
			const match = (Array.isArray(creatives) ? creatives : []).find((c) => c.creativeId === params.creativeId || c.adId === params.creativeId || c.platformCreativeId === params.creativeId);
			if (!match) throw new Error("Creative not found");
			dispatch({
				type: "setCreative",
				value: match
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CreativeDetailPage:fetchCreative",
				title: "Error",
				fallbackMessage: "Error"
			});
		}).finally(() => {
			dispatch({
				type: "setLoading",
				value: false
			});
		});
	}, [
		dispatch,
		convexProviderId,
		isPreviewMode,
		params,
		campaignName,
		workspaceId,
		selectedClientId
	]);
	const fetchMetrics = (0, import_react.useCallback)(async () => {
		if (!convexProviderId) {
			dispatch({
				type: "setCreativeMetrics",
				value: null
			});
			metricsErrorRef.current = "Unsupported provider";
			metricsLoadingRef.current = false;
			return;
		}
		if (isPreviewMode) {
			metricsLoadingRef.current = true;
			metricsErrorRef.current = null;
			dispatch({
				type: "setCreativeMetrics",
				value: buildPreviewCreativeMetrics(convexProviderId, params.creativeId, params.campaignId, days)
			});
			metricsLoadingRef.current = false;
			return;
		}
		metricsLoadingRef.current = true;
		metricsErrorRef.current = null;
		if (!workspaceId) {
			dispatch({
				type: "setCreativeMetrics",
				value: null
			});
			metricsErrorRef.current = "Sign in required";
			metricsLoadingRef.current = false;
			return;
		}
		await listAdMetrics({
			workspaceId,
			providerId: convexProviderId,
			clientId: selectedClientId ?? null,
			campaignId: params.campaignId,
			adGroupId: creative?.adGroupId,
			days,
			level: convexProviderId === "linkedin" ? "creative" : "ad"
		}).then((response) => {
			const record = response && typeof response === "object" ? response : null;
			const allMetrics = Array.isArray(record?.metrics) ? record.metrics : [];
			const metricTargetId = creative?.adId ?? params.creativeId;
			dispatch({
				type: "setCreativeMetrics",
				value: allMetrics.filter((m) => m.adId === metricTargetId)
			});
		}).catch((error) => {
			logError(error, "CreativeDetailPage:fetchMetrics");
			dispatch({
				type: "setCreativeMetrics",
				value: null
			});
			metricsErrorRef.current = asErrorMessage(error);
		}).finally(() => {
			metricsLoadingRef.current = false;
		});
	}, [
		convexProviderId,
		isPreviewMode,
		params.creativeId,
		params.campaignId,
		days,
		workspaceId,
		selectedClientId,
		creative?.adGroupId,
		creative?.adId,
		listAdMetrics
	]);
	(0, import_react.useEffect)(() => {
		const frameId = requestAnimationFrame(() => {
			fetchCreative();
		});
		return () => {
			cancelAnimationFrame(frameId);
		};
	}, [
		params.campaignId,
		params.creativeId,
		convexProviderId,
		isPreviewMode,
		workspaceId,
		selectedClientId
	]);
	(0, import_react.useEffect)(() => {
		if (!creative) return;
		dispatch({
			type: "syncFromCreative",
			creative
		});
	}, [creative]);
	(0, import_react.useEffect)(() => {
		if (!creative) return;
		const frameId = requestAnimationFrame(() => {
			fetchMetrics();
		});
		return () => {
			cancelAnimationFrame(frameId);
		};
	}, [
		creative,
		days,
		convexProviderId,
		isPreviewMode,
		workspaceId,
		selectedClientId,
		params.campaignId,
		params.creativeId
	]);
	const handleCopy = (text, field) => {
		(typeof window !== "undefined" && typeof navigator !== "undefined" && typeof navigator.clipboard !== "undefined" && window.isSecureContext ? navigator.clipboard.writeText(text) : Promise.resolve().then(() => {
			const textArea = document.createElement("textarea");
			textArea.value = text;
			textArea.style.cssText = "position:fixed;left:-999999px;top:-999999px";
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			const copied = document.execCommand("copy");
			textArea.remove();
			if (!copied) throw new Error("Copy command failed");
		})).then(() => {
			dispatch({
				type: "setCopiedField",
				value: field
			});
			notifySuccess({
				title: "Copied to clipboard",
				message: "Text has been copied successfully."
			});
			setTimeout(() => dispatch({
				type: "setCopiedField",
				value: null
			}), 2e3);
		}).catch((err) => {
			reportConvexFailure({
				error: err,
				context: "CreativeDetailPage:copyField",
				title: "Copy failed",
				fallbackMessage: "Copy failed"
			});
		});
	};
	const isDirty = (() => {
		if (!creative) return false;
		return creativeCopyIsDirty(creative, {
			headlines: editedHeadlines,
			descriptions: editedDescriptions,
			cta: editedCta,
			landingPage: editedLandingPage
		});
	})();
	const previewCreative = (() => {
		if (!creative) return null;
		return buildCreativePreviewCreative(creative, editedHeadlines, editedDescriptions, editedCta, editedLandingPage, previewHeadlineIndex, previewDescriptionIndex);
	})();
	const cancelEditing = () => {
		if (!creative) return;
		dispatch({
			type: "syncFromCreative",
			creative
		});
	};
	const generateCopy = async (kind) => {
		if (!creative) return;
		const setGenerating = kind === "headlines" ? (value) => dispatch({
			type: "setGeneratingHeadlines",
			value
		}) : (value) => dispatch({
			type: "setGeneratingDescriptions",
			value
		});
		if (isPreviewMode) {
			setGenerating(true);
			const additions = buildPreviewCopySuggestions(kind, creative, campaignName);
			if (kind === "headlines") dispatch({
				type: "updateEditedHeadlines",
				updater: (prev) => {
					const base = prev.length > 0 ? prev : creative.headlines ?? [];
					const seen = new Set(base.flatMap((value) => {
						const v = value.trim().toLowerCase();
						return v ? [v] : [];
					}));
					const uniqueAdditions = additions.filter((value) => {
						const key = value.trim().toLowerCase();
						if (!key || seen.has(key)) return false;
						seen.add(key);
						return true;
					});
					return [...base, ...uniqueAdditions];
				}
			});
			else dispatch({
				type: "updateEditedDescriptions",
				updater: (prev) => {
					const base = prev.length > 0 ? prev : creative.descriptions ?? [];
					const seen = new Set(base.flatMap((value) => {
						const v = value.trim().toLowerCase();
						return v ? [v] : [];
					}));
					const uniqueAdditions = additions.filter((value) => {
						const key = value.trim().toLowerCase();
						if (!key || seen.has(key)) return false;
						seen.add(key);
						return true;
					});
					return [...base, ...uniqueAdditions];
				}
			});
			notifyInfo({
				title: kind === "headlines" ? "Sample headlines added" : "Sample captions added",
				message: "Preview mode generated local-only sample variants for this session."
			});
			setGenerating(false);
			return;
		}
		setGenerating(true);
		if (!convexProviderId) {
			setGenerating(false);
			notifyFailure({
				title: "Unsupported provider",
				message: "AI copy generation is not available for this ad platform."
			});
			return;
		}
		if (!workspaceId) {
			setGenerating(false);
			notifyFailure({
				title: "Sign in required",
				message: "You need to be signed in to generate AI copy."
			});
			return;
		}
		const ctaForPrompt = formatMetaCallToActionLabel(editedCta || creative.callToAction) || editedCta || creative.callToAction;
		await generateCopyAction({
			providerId: convexProviderId,
			clientId: selectedClientId ?? void 0,
			campaignId: params.campaignId,
			creativeId: params.creativeId,
			campaignName,
			creativeName: creative.name,
			landingPageUrl: editedLandingPage || creative.landingPageUrl,
			callToAction: ctaForPrompt,
			creativeType: creative.type,
			pageName: creative.pageName,
			existingHeadlines: (editedHeadlines.length ? editedHeadlines : creative.headlines ?? []).filter(Boolean),
			existingCaptions: (editedDescriptions.length ? editedDescriptions : creative.descriptions ?? []).filter(Boolean),
			kind: kind === "headlines" ? "headlines" : "captions",
			count: 5
		}).then((result) => {
			const headlines = result.headlines;
			const captions = result.captions;
			if (kind === "headlines") {
				if (headlines.length === 0) {
					notifySuccess({
						title: "No new headlines",
						message: "Try again with different inputs."
					});
					return;
				}
				dispatch({
					type: "updateEditedHeadlines",
					updater: (prev) => {
						const base = prev.length ? prev : [];
						const existing = new Set(base.flatMap((s) => {
							const v = s.trim().toLowerCase();
							return v ? [v] : [];
						}));
						const additions = headlines.filter((h) => {
							const key = h.trim().toLowerCase();
							if (!key) return false;
							if (existing.has(key)) return false;
							existing.add(key);
							return true;
						});
						return [...base, ...additions];
					}
				});
				notifySuccess({
					title: "Generated headlines",
					message: `Added ${headlines.length} new variant(s).`
				});
				return;
			}
			if (captions.length === 0) {
				notifySuccess({
					title: "No new captions",
					message: "Try again with different inputs."
				});
				return;
			}
			dispatch({
				type: "updateEditedDescriptions",
				updater: (prev) => {
					const base = prev.length ? prev : [];
					const existing = new Set(base.flatMap((s) => {
						const v = s.trim().toLowerCase();
						return v ? [v] : [];
					}));
					const additions = captions.filter((c) => {
						const key = c.trim().toLowerCase();
						if (!key) return false;
						if (existing.has(key)) return false;
						existing.add(key);
						return true;
					});
					return [...base, ...additions];
				}
			});
			notifySuccess({
				title: "Generated captions",
				message: `Added ${captions.length} new variant(s).`
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CreativeDetailPage:generateCopy",
				title: "AI generation error",
				fallbackMessage: "AI generation error"
			});
		}).finally(() => {
			setGenerating(false);
		});
	};
	const handleSave = async () => {
		if (isPreviewMode) {
			if (!creative) return;
			const normalizedHeadlines = editedHeadlines.flatMap((headline) => {
				const h = headline.trim();
				return h ? [h] : [];
			});
			const normalizedDescriptions = editedDescriptions.flatMap((description) => {
				const d = description.trim();
				return d ? [d] : [];
			});
			const normalizedCta = editedCta.trim();
			const normalizedLandingPage = editedLandingPage.trim();
			dispatch({
				type: "patchCreative",
				updater: (previousCreative) => {
					if (!previousCreative) return previousCreative;
					return {
						...previousCreative,
						headlines: normalizedHeadlines,
						descriptions: normalizedDescriptions,
						callToAction: normalizedCta,
						landingPageUrl: normalizedLandingPage
					};
				}
			});
			dispatch({
				type: "setIsEditing",
				value: false
			});
			notifyInfo({
				title: "Sample creative updated",
				message: "Preview mode applied your edits locally for this session only."
			});
			return;
		}
		if (!workspaceId) {
			notifyFailure({
				title: "Sign in required",
				message: "You need to be signed in to save creative updates."
			});
			return;
		}
		if (!creative) {
			notifyFailure({
				title: "Creative unavailable",
				message: "Creative details are not loaded yet."
			});
			return;
		}
		if (!convexProviderId) {
			notifyFailure({
				title: "Unsupported provider",
				message: "This provider is not supported for updates."
			});
			return;
		}
		dispatch({
			type: "setIsSaving",
			value: true
		});
		const normalizedHeadlines = normalizeStringList(editedHeadlines);
		const normalizedDescriptions = normalizeStringList(editedDescriptions);
		const normalizedCta = normalizeCreativeCtaValue(editedCta);
		const normalizedLandingPage = editedLandingPage.trim();
		const mergedAssetFeedSpec = convexProviderId === "facebook" ? mergeMetaAssetFeedSpecForSave(creative.assetFeedSpec, normalizedHeadlines, normalizedDescriptions, normalizedLandingPage) ?? creative.assetFeedSpec : creative.assetFeedSpec;
		await updateCreative({
			workspaceId,
			providerId: convexProviderId,
			clientId: selectedClientId ?? null,
			creativeId: creative.platformCreativeId ?? creative.creativeId,
			adId: creative.adId ?? creative.creativeId,
			name: creative.name,
			title: normalizedHeadlines[0],
			body: normalizedDescriptions[0],
			description: creative.objectType?.toUpperCase() === "VIDEO" || creative.videoId ? void 0 : normalizedDescriptions[1],
			callToActionType: normalizedCta || void 0,
			linkUrl: normalizedLandingPage || void 0,
			objectType: creative.objectType,
			imageUrl: creative.imageUrl || creative.thumbnailUrl,
			imageHash: creative.imageHash,
			videoId: creative.videoId,
			pageId: creative.pageId,
			assetFeedSpec: mergedAssetFeedSpec,
			destinationSpec: mergeMetaDestinationSpec(creative.destinationSpec, normalizedLandingPage || void 0)
		}).then((result) => {
			if (creative) dispatch({
				type: "patchCreative",
				updater: (previousCreative) => {
					if (!previousCreative) return previousCreative;
					return {
						...previousCreative,
						platformCreativeId: result?.creativeId ?? previousCreative.platformCreativeId,
						headlines: normalizedHeadlines,
						descriptions: normalizedDescriptions,
						callToAction: normalizedCta,
						landingPageUrl: normalizedLandingPage
					};
				}
			});
			fetchCreative();
			notifySuccess({
				title: "Changes saved",
				message: "Your creative has been updated successfully."
			});
			dispatch({
				type: "setIsEditing",
				value: false
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CreativeDetailPage:handleSave",
				title: "Error",
				fallbackMessage: "Error"
			});
		}).finally(() => {
			dispatch({
				type: "setIsSaving",
				value: false
			});
		});
	};
	const addHeadline = () => {
		dispatch({
			type: "updateEditedHeadlines",
			updater: (current) => [...current, ""]
		});
	};
	const removeHeadline = (index) => {
		dispatch({
			type: "updateEditedHeadlines",
			updater: (current) => current.filter((_, currentIndex) => currentIndex !== index)
		});
		dispatch({
			type: "updatePreviewHeadlineIndex",
			updater: (current) => {
				if (index < current) return current - 1;
				if (index === current) return Math.max(0, current - 1);
				return current;
			}
		});
	};
	const updateHeadline = (index, value) => {
		dispatch({
			type: "updateEditedHeadlines",
			updater: (current) => {
				const updated = [...current];
				updated[index] = value;
				return updated;
			}
		});
	};
	const addDescription = () => {
		dispatch({
			type: "updateEditedDescriptions",
			updater: (current) => [...current, ""]
		});
	};
	const removeDescription = (index) => {
		dispatch({
			type: "updateEditedDescriptions",
			updater: (current) => current.filter((_, currentIndex) => currentIndex !== index)
		});
		dispatch({
			type: "updatePreviewDescriptionIndex",
			updater: (current) => {
				if (index < current) return current - 1;
				if (index === current) return Math.max(0, current - 1);
				return current;
			}
		});
	};
	const updateDescription = (index, value) => {
		dispatch({
			type: "updateEditedDescriptions",
			updater: (current) => {
				const updated = [...current];
				updated[index] = value;
				return updated;
			}
		});
	};
	const handleGenerateHeadlines = () => {
		generateCopy("headlines");
	};
	const handleGenerateDescriptions = () => {
		generateCopy("captions");
	};
	const onSaveShortcut = (0, import_react.useEffectEvent)(() => {
		if (isDirty && !isSaving) handleSave();
	});
	(0, import_react.useEffect)(() => {
		const onKeyDown = (event) => {
			if ((event.metaKey || event.ctrlKey) && event.key === "s") {
				event.preventDefault();
				onSaveShortcut();
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);
	const backUrl = `/dashboard/ads/campaigns/${params.providerId}/${params.campaignId}${searchParamsString ? `?${searchParamsString}` : ""}`;
	const displayName = (() => {
		if (!creative) return params.creativeId;
		return creative.name || creative.headlines?.[0] || creative.creativeId;
	})();
	const performanceSummary = buildCreativePerformanceSummary(creativeMetrics, convexProviderId, days, displayCurrency);
	const efficiencyScore = (() => {
		if (!performanceSummary) return null;
		return calculateEfficiencyScore(performanceSummary);
	})();
	const algorithmicInsights = (() => {
		if (!performanceSummary) return [];
		return calculateAlgorithmicInsights(performanceSummary);
	})();
	const leaveBlocker = useBlocker({
		shouldBlockFn: () => isDirty && !isSaving,
		enableBeforeUnload: () => isDirty && !isSaving,
		withResolver: true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
		open: leaveBlocker.status === "blocked",
		onOpenChange: (open) => {
			if (!open) leaveBlocker.reset?.();
		},
		title: "Discard unsaved changes?",
		description: "You have unsaved creative edits. Leaving now will discard them.",
		confirmLabel: "Discard changes",
		cancelLabel: "Keep editing",
		variant: "warning",
		onConfirm: () => leaveBlocker.proceed?.(),
		onCancel: () => leaveBlocker.reset?.()
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeDetailPageLoadingState, {}),
		children: !creative && !loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeDetailPageNotFoundState, { backUrl }) : creative ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeDetailPageContent, {
			creative,
			previewCreative: previewCreative ?? creative,
			backUrl,
			campaignName,
			displayName,
			isDirty,
			isSaving,
			copiedField,
			isEditing,
			editedHeadlines,
			editedDescriptions,
			editedCta,
			editedLandingPage,
			previewHeadlineIndex,
			previewDescriptionIndex,
			generatingHeadlines,
			generatingDescriptions,
			performanceSummary,
			efficiencyScore,
			algorithmicInsights,
			onCopy: handleCopy,
			onCancelEditing: cancelEditing,
			onSave: handleSave,
			onRefreshCreative: fetchCreative,
			onRefreshPerformance: fetchMetrics,
			onPreviewHeadlineIndexChange: setPreviewHeadlineIndex,
			onPreviewDescriptionIndexChange: setPreviewDescriptionIndex,
			onAddHeadline: addHeadline,
			onRemoveHeadline: removeHeadline,
			onUpdateHeadline: updateHeadline,
			onAddDescription: addDescription,
			onRemoveDescription: removeDescription,
			onUpdateDescription: updateDescription,
			onChangeCta: setEditedCta,
			onChangeLandingPage: setEditedLandingPage,
			onGenerateHeadlines: handleGenerateHeadlines,
			onGenerateDescriptions: handleGenerateDescriptions
		}) : null
	})] });
}
function CreativeDetailPageClient(props) {
	return useCreativeDetailPageClient(props);
}
var CREATIVE_DETAIL_PAGE_FALLBACK = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeDetailPageFallback, {});
function getFirstSearchParam(value) {
	if (Array.isArray(value)) return value[0] ?? null;
	return typeof value === "string" ? value : null;
}
function toSearchParamsString(searchParams) {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(searchParams ?? {})) {
		if (Array.isArray(value)) {
			for (const item of value) params.append(key, item);
			continue;
		}
		if (typeof value === "string") params.set(key, value);
	}
	return params.toString();
}
async function CreativeDetailPage({ searchParams }) {
	const resolvedSearchParams = await searchParams;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: CREATIVE_DETAIL_PAGE_FALLBACK,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeDetailPageClient, {
			campaignName: getFirstSearchParam(resolvedSearchParams?.campaignName),
			currency: getFirstSearchParam(resolvedSearchParams?.currency),
			searchParamsString: toSearchParamsString(resolvedSearchParams)
		})
	});
}
function CreativeDetailPageFallback() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-64" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-96 w-full rounded-2xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[2fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full rounded-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full rounded-2xl" })]
			})
		]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreativeDetailPage, {});
//#endregion
export { SplitComponent as component };
