import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { i as m, n as useReducedMotion } from "../_libs/framer-motion.mjs";
import { t as cn } from "./utils.mjs";
import { i as cardHoverVariants, r as buttonPressVariants } from "./motion.mjs";
import { t as DASHBOARD_THEME } from "./dashboard-theme.mjs";
//#region src/features/dashboard/ads/components/ads-page-theme.ts
/** Paid-media workspace — command-center surfaces aligned with dashboard tokens. */
var ADS_PAGE_THEME = {
	hero: DASHBOARD_THEME.pageHero,
	heroGlow: DASHBOARD_THEME.pageHeroGlow,
	sectionEyebrow: DASHBOARD_THEME.sectionEyebrow,
	sectionTitle: "text-lg font-semibold tracking-tight text-foreground",
	sectionDescription: DASHBOARD_THEME.sectionDescription,
	surfaceCard: cn(DASHBOARD_THEME.cards.base, "overflow-hidden border-border/60 shadow-sm ring-1 ring-border/30"),
	surfaceCardHighlight: cn("overflow-hidden rounded-2xl border border-primary/15", "bg-linear-to-br from-primary/[0.05] via-card to-background", "shadow-sm ring-1 ring-primary/10"),
	kpiTile: cn("rounded-2xl border border-border/60 bg-card/90 p-5", "shadow-sm transition-[border-color,box-shadow] hover:border-primary/20 hover:shadow-md", "motion-reduce:transition-none"),
	kpiLabel: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
	kpiValue: "text-2xl font-semibold tracking-tight tabular-nums text-foreground",
	providerTile: cn("relative overflow-hidden rounded-2xl border border-border/60 bg-card/95", "shadow-sm transition-[border-color,box-shadow,opacity]", "hover:shadow-md motion-reduce:transition-none"),
	emptyState: cn("flex flex-col items-center justify-center gap-4 rounded-2xl", "border border-dashed border-border/70 bg-muted/15 p-10 text-center"),
	mobileTabs: "inline-flex h-auto w-full flex-nowrap items-stretch gap-1 rounded-xl bg-muted/40 p-1",
	mobileTabTrigger: "min-w-0 flex-1 gap-1.5 rounded-lg px-2 text-xs sm:px-3 sm:text-sm data-[state=active]:shadow-sm",
	advancedPanel: cn("overflow-hidden rounded-2xl border border-border/60", "bg-card/50 shadow-sm ring-1 ring-border/30"),
	/** Campaign & creative detail routes */
	innerContainer: "mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-20 pt-2 sm:px-6",
	stickyTabBar: cn("sticky top-0 z-10 -mx-4 border-b border-border/50 bg-background/90 px-4 py-3", "backdrop-blur-md supports-backdrop-filter:bg-background/75 sm:-mx-6 sm:px-6"),
	innerHero: cn("relative overflow-hidden rounded-2xl border border-border/50", "bg-linear-to-br from-primary/[0.06] via-card/90 to-info/[0.04]", "p-5 sm:px-6 sm:py-6", "shadow-sm ring-1 ring-border/40"),
	innerHeroGlow: "pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-primary/10 blur-3xl",
	chartCard: cn("overflow-hidden rounded-2xl border border-border/60 bg-card/95", "shadow-sm ring-1 ring-border/30"),
	chartCardHeader: "border-b border-border/50 pb-4",
	sectionBlock: "space-y-5",
	sectionHeader: "space-y-1 border-b border-border/50 pb-4",
	/** Campaign budget / audience control panels */
	controlHeaderIcon: cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", "bg-linear-to-br from-primary/15 via-primary/8 to-transparent", "ring-1 ring-primary/20 shadow-sm"),
	controlPreviewBanner: cn("flex items-start gap-3 rounded-xl border border-warning/25", "bg-warning/6 px-4 py-3 text-sm text-muted-foreground"),
	controlHighlightTile: cn("relative overflow-hidden rounded-2xl border border-primary/15", "bg-linear-to-br from-primary/[0.08] via-card to-card/80", "px-5 py-4 shadow-sm ring-1 ring-primary/10"),
	controlFormPanel: cn("rounded-2xl border border-border/60 bg-muted/15 p-5", "ring-1 ring-border/30"),
	controlStatChip: cn("inline-flex min-w-0 flex-col gap-0.5 rounded-xl border border-border/50", "bg-card/80 px-3 py-2 shadow-sm"),
	controlStatChipLabel: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
	controlStatChipValue: "text-sm font-semibold tabular-nums text-foreground",
	controlMapFrame: cn("overflow-hidden rounded-2xl border border-border/60", "bg-linear-to-b from-muted/30 to-card shadow-inner ring-1 ring-border/40"),
	controlCollapsibleTrigger: cn("flex w-full items-center justify-between gap-3 rounded-xl border border-border/60", "bg-card/60 px-4 py-3 text-left shadow-sm transition-colors", "hover:border-primary/25 hover:bg-card", "motion-reduce:transition-none"),
	controlCollapsibleBody: cn("rounded-xl border border-border/50 bg-muted/10 p-4", "ring-1 ring-border/20"),
	controlSectionLabel: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"
};
//#endregion
//#region src/shared/ui/motion-primitives.tsx
var import_jsx_runtime = require_jsx_runtime();
function MotionPressable({ className, children, ...props }) {
	const prefersReducedMotion = useReducedMotion();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m.button, {
		type: "button",
		initial: prefersReducedMotion ? false : "rest",
		animate: prefersReducedMotion ? void 0 : "rest",
		whileHover: prefersReducedMotion ? void 0 : "rest",
		whileTap: prefersReducedMotion ? void 0 : "tap",
		variants: prefersReducedMotion ? void 0 : buttonPressVariants,
		className,
		...props,
		children
	});
}
function MotionCard({ interactive = false, className, children, ...props }) {
	const prefersReducedMotion = useReducedMotion();
	const motionEnabled = interactive && !prefersReducedMotion;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m.div, {
		initial: motionEnabled ? "rest" : false,
		animate: motionEnabled ? "rest" : void 0,
		whileHover: motionEnabled ? "hover" : void 0,
		variants: motionEnabled ? cardHoverVariants : void 0,
		className,
		...props,
		children
	});
}
//#endregion
//#region src/features/dashboard/ads/components/ads-metrics-display-state.ts
function resolveAdsMetricsDisplayState({ metricsLoading, connectedAccountCount, hasSuccessfulSync, hasMetricData }) {
	if (metricsLoading) return "loading";
	if (connectedAccountCount <= 0) return "needs_connection";
	if (hasMetricData) return "has_delivery";
	if (hasSuccessfulSync) return "synced_no_delivery";
	return "needs_sync";
}
var ADS_METRICS_EMPTY_COPY = {
	needs_connection: {
		title: "Connect an ad platform",
		description: "Link Google, Meta, LinkedIn, or TikTok above, then run a sync to populate spend, delivery, and conversion KPIs.",
		actionLabel: "Connect an account",
		actionHref: "#connect-ad-platforms"
	},
	needs_sync: {
		title: "Ready to sync",
		description: "Your ad account is connected. Run a sync to pull spend, impressions, and clicks for the date range in the header.",
		actionLabel: "Run sync",
		actionHref: "#connect-ad-platforms"
	},
	synced_no_delivery: {
		title: "No ad activity in this period",
		description: "This account synced successfully, but Meta returned no spend or delivery for the selected dates. The account may be paused, dormant, or had no live campaigns during this window. Try widening the date range or confirm campaigns are active in Ads Manager.",
		actionLabel: "Widen date range",
		actionHref: "#connect-ad-platforms"
	}
};
function adsMetricsEmptyCopy(state) {
	return ADS_METRICS_EMPTY_COPY[state];
}
//#endregion
export { ADS_PAGE_THEME as a, MotionPressable as i, resolveAdsMetricsDisplayState as n, MotionCard as r, adsMetricsEmptyCopy as t };
