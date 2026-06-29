import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, l as useMutation, r as useConvexAuth, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { G as getPreviewSettingsProfile } from "./preview-data-CXkRNfsX.mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { a as chromaticTransitionClass, o as chromaticTransitionNormalClass } from "./motion-Cf6ujF0h.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { s as logError } from "./convex-errors-sHK0JmZ7.mjs";
import { c as reportConvexFailure, i as notifyFailure, o as notifySuccess } from "./notifications-DQZKskhM.mjs";
import { n as usePathname, r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { M as onboardingApi, P as problemReportsApi, U as proposalsApi } from "./convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { $ as Rocket, $t as ListChecks, An as FileText, B as Shield, F as Sparkles, G as Settings, Ht as Menu, Jr as Activity, P as SquareCheckBig, Rt as MessageSquare, Sr as ChartColumn, Ut as Megaphone, Vr as ArrowRight, Yt as LoaderCircle, cr as CircleAlert, jr as Briefcase, l as Video, mn as House, mr as ChevronLeft, on as Keyboard, pr as ChevronRight, qt as LogOut, rr as CircleQuestionMark, u as Users } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { t as Label } from "./label-B_FvRq1I.mjs";
import { a as TabsTrigger, i as TabsList, n as Tabs, r as TabsContent } from "./tabs-BP_mm-cH.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip-BwcfatA2.mjs";
import { t as Textarea } from "./textarea-C0M2IvQZ.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar-DghqGd0Q.mjs";
import { i as TruncatedTextPreview } from "./hover-preview-BP_Z2-hG.mjs";
import { t as ScrollArea } from "./scroll-area-DnXuhDTw.mjs";
import { t as dynamic } from "./dynamic-D6gKSsRx.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { a as DropdownMenuLabel, c as DropdownMenuSeparator, i as DropdownMenuItem, l as DropdownMenuTrigger, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-CJEJ0oqe.mjs";
import { r as useUrlSearchParamsContext } from "./use-url-search-params-CvniTNfQ.mjs";
import { t as SiteLogo } from "./site-logo-B5LJooib.mjs";
import { t as isFeatureEnabled } from "./features-DXQ1HU1z.mjs";
import { a as BreadcrumbPage, i as BreadcrumbList, n as BreadcrumbItem, o as BreadcrumbSeparator, r as BreadcrumbLink, t as Breadcrumb } from "./breadcrumb-BgxviZMU.mjs";
import { a as SheetHeader, o as SheetTitle, r as SheetContent, s as SheetTrigger, t as Sheet } from "./sheet-Ybc8ZbjG.mjs";
import { a as canAccessPath, i as can, s as navItemsForRole } from "./dashboard-access-q6oyjv-c.mjs";
import { r as useKeyboardShortcuts, t as KeyboardShortcutBadge } from "./use-keyboard-shortcuts-CjHWs-Qm.mjs";
import { t as ClientWorkspaceSelector } from "./client-workspace-selector-DqJuFpOn.mjs";
import { t as Ae } from "../_libs/driver.js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/breadcrumbs-j0-fuXNN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useDashboardRoleAccent() {
	const { user } = useAuth();
	const { isPreviewMode } = usePreview();
	return (() => {
		if (isPreviewMode) return {
			key: "preview",
			sidebarClass: "border-l-[3px] border-l-warning",
			headerStripClass: "h-[3px] w-full shrink-0 bg-linear-to-r from-warning via-warning/55 to-transparent",
			mainFrameClass: "border-t-2 border-t-warning/30 bg-linear-to-b from-warning/8 to-transparent",
			accountBadgeClass: "border border-warning/40 bg-warning/12 text-warning-foreground font-semibold",
			shellCaption: "Sample data · safe to explore · actions are read-only"
		};
		switch (user?.role ?? null) {
			case "admin": return {
				key: "admin",
				sidebarClass: "border-l-[3px] border-l-primary",
				headerStripClass: "h-[3px] w-full shrink-0 bg-linear-to-r from-primary via-primary/65 to-transparent",
				mainFrameClass: "border-t-2 border-t-primary/25 bg-linear-to-b from-primary/5 to-transparent",
				accountBadgeClass: "border border-accent/35 bg-accent/12 text-primary font-semibold shadow-sm",
				shellCaption: "Administrator · full workspace access"
			};
			case "team": return {
				key: "team",
				sidebarClass: "border-l-[3px] border-l-info",
				headerStripClass: "h-[3px] w-full shrink-0 bg-linear-to-r from-info via-info/55 to-transparent",
				mainFrameClass: "border-t-2 border-t-info/30 bg-linear-to-b from-info/6 to-transparent",
				accountBadgeClass: "border border-info/40 bg-info/10 text-info font-semibold",
				shellCaption: "Agency team · delivery & collaboration view"
			};
			case "client": return {
				key: "client",
				sidebarClass: "border-l-[3px] border-l-success",
				headerStripClass: "h-[3px] w-full shrink-0 bg-linear-to-r from-success via-success/55 to-transparent",
				mainFrameClass: "border-t-2 border-t-success/25 bg-linear-to-b from-success/5 to-transparent",
				accountBadgeClass: "border border-success/40 bg-success/10 text-success font-semibold",
				shellCaption: "Client workspace · your projects & approvals"
			};
			default: return {
				key: "unknown",
				sidebarClass: "border-l-[3px] border-l-muted-foreground/35",
				headerStripClass: "h-[3px] w-full shrink-0 bg-muted-foreground/35",
				mainFrameClass: "",
				accountBadgeClass: "border border-muted-foreground/25 bg-muted/40 font-medium",
				shellCaption: "Workspace"
			};
		}
	})();
}
/** Shared surfaces for header notification and profile menus. */
var HEADER_DROPDOWN_THEME = {
	triggerIcon: "relative size-9 shrink-0 rounded-lg border border-transparent text-muted-foreground transition-[color,background-color,border-color,box-shadow] hover:border-border/60 hover:bg-muted/40 hover:text-foreground data-[state=open]:border-border/60 data-[state=open]:bg-muted/50 data-[state=open]:text-foreground data-[state=open]:shadow-sm",
	triggerAvatar: "relative size-9 shrink-0 rounded-full border border-border/60 p-0 transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-sm data-[state=open]:border-primary/35 data-[state=open]:ring-2 data-[state=open]:ring-primary/15",
	badge: "absolute -right-0.5 -top-0.5 inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[9px] font-bold leading-none text-destructive-foreground shadow-sm",
	panel: "flex flex-col overflow-hidden rounded-xl border border-border/70 bg-popover p-0 shadow-lg ring-1 ring-border/40",
	panelNotifications: "w-[22rem] gap-1.5 p-2.5 sm:w-[26rem]",
	panelProfile: "w-72",
	header: "shrink-0 rounded-lg border border-border/60 bg-gradient-to-br from-card via-card to-muted/25 px-4 py-3.5",
	headerTitle: "text-sm font-semibold tracking-tight text-foreground",
	headerSubtitle: "text-xs text-muted-foreground",
	footer: "flex shrink-0 items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/15 px-3.5 py-2.5",
	inboxBody: "px-1.5 py-1",
	menuBody: "p-1.5",
	menuItem: "cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm text-popover-foreground focus:bg-muted/80 focus:text-foreground data-[highlighted]:bg-muted/80 data-[highlighted]:text-foreground data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:data-[highlighted]:bg-destructive/10",
	menuItemIcon: "flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/30 text-muted-foreground",
	menuItemIconDestructive: "border-destructive/20 bg-destructive/10 text-destructive",
	menuSeparator: "my-1 bg-border/60",
	profileIdentity: "flex items-center gap-3 px-1 py-0.5",
	profileAvatar: "size-10 shrink-0 ring-2 ring-border/50 ring-offset-2 ring-offset-popover",
	groupLabel: "px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
};
function ProfileMenuItem({ icon: Icon, label, destructive, onSelect, href, onNavigate }) {
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(HEADER_DROPDOWN_THEME.menuItemIcon, destructive && HEADER_DROPDOWN_THEME.menuItemIconDestructive),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-4",
			"aria-hidden": true
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "font-medium",
		children: label
	})] });
	if (href) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
		asChild: true,
		className: HEADER_DROPDOWN_THEME.menuItem,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
			href,
			onClick: onNavigate,
			className: "flex w-full items-center gap-2.5",
			children: content
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
		variant: destructive ? "destructive" : "default",
		onSelect,
		className: HEADER_DROPDOWN_THEME.menuItem,
		children: content
	});
}
function ProfileDropdown({ displayedName, displayedEmail, initials, isPreviewMode, roleLabel, isAdmin, onNavigate, onOpenHelp, onSignOut }) {
	const accent = useDashboardRoleAccent();
	const badgeLabel = isPreviewMode ? "Preview" : roleLabel;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: HEADER_DROPDOWN_THEME.triggerAvatar,
			"aria-label": `Open account menu for ${displayedName}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
				className: "size-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
					className: "bg-muted/50 text-xs font-semibold",
					children: initials
				})
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		sideOffset: 8,
		className: cn(HEADER_DROPDOWN_THEME.panel, HEADER_DROPDOWN_THEME.panelProfile),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: HEADER_DROPDOWN_THEME.header,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
				className: "p-0 font-normal",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: HEADER_DROPDOWN_THEME.profileIdentity,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
						className: HEADER_DROPDOWN_THEME.profileAvatar,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
							className: "bg-muted/50 text-sm font-semibold",
							children: initials
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 flex-wrap items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TruncatedTextPreview, {
								text: displayedName,
								className: "text-sm font-semibold text-foreground",
								detail: displayedEmail
							}), badgeLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: cn("h-5 shrink-0 px-1.5 text-[10px] font-semibold uppercase tracking-wide", accent.accountBadgeClass),
								children: badgeLabel
							}) : null]
						}), displayedEmail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: displayedEmail
						}) : null]
					})]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: HEADER_DROPDOWN_THEME.menuBody,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: HEADER_DROPDOWN_THEME.groupLabel,
					children: "Workspace"
				}),
				isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileMenuItem, {
					icon: Shield,
					label: "Admin panel",
					href: "/admin",
					onNavigate
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileMenuItem, {
					icon: Settings,
					label: "Settings",
					href: "/settings",
					onNavigate
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, { className: HEADER_DROPDOWN_THEME.menuSeparator }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: HEADER_DROPDOWN_THEME.groupLabel,
					children: "Support"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileMenuItem, {
					icon: CircleQuestionMark,
					label: "Help & navigation",
					onSelect: onOpenHelp
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, { className: HEADER_DROPDOWN_THEME.menuSeparator }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileMenuItem, {
					icon: LogOut,
					label: "Sign out",
					destructive: true,
					onSelect: onSignOut
				})
			]
		})]
	})] });
}
var TOUR_IDS = {
	workspace: "tour-workspace-selector",
	commandMenuDesktop: "tour-command-menu",
	commandMenuMobile: "tour-command-menu-mobile",
	stats: "tour-stats-cards",
	performance: "tour-performance-chart",
	quickActions: "tour-quick-actions",
	sidebar: "tour-sidebar",
	mobileNav: "tour-mobile-nav",
	help: "tour-help-trigger"
};
function isVisible(el) {
	const style = window.getComputedStyle(el);
	if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
	const rect = el.getBoundingClientRect();
	return rect.width > 0 && rect.height > 0;
}
function queryVisibleTourElement(selector) {
	const nodes = document.querySelectorAll(selector);
	for (const node of nodes) if (node instanceof HTMLElement && isVisible(node)) return node;
}
function resolveCommandMenuElement() {
	return queryVisibleTourElement(`#${TOUR_IDS.commandMenuDesktop}`) ?? queryVisibleTourElement(`#${TOUR_IDS.commandMenuMobile}`);
}
function resolveNavigationElement() {
	return queryVisibleTourElement(`#${TOUR_IDS.sidebar}`) ?? queryVisibleTourElement(`#${TOUR_IDS.mobileNav}`);
}
function stepHasVisibleTarget(step) {
	if (!step.requiresAny?.length) return true;
	return step.requiresAny.some((selector) => Boolean(queryVisibleTourElement(selector)));
}
function materializeTourSteps(definitions) {
	return definitions.flatMap((step) => {
		if (!stepHasVisibleTarget(step)) return [];
		const { requiresAny: _requiresAny, element, ...rest } = step;
		if (typeof element === "function") {
			const resolved = element();
			return [resolved ? {
				...rest,
				element: resolved
			} : { ...rest }];
		}
		if (typeof element === "string") {
			const resolved = queryVisibleTourElement(element);
			return [resolved ? {
				...rest,
				element: resolved
			} : { ...rest }];
		}
		return [{
			...rest,
			element
		}];
	});
}
var DASHBOARD_TOUR_ROUTE = "/dashboard";
function isDashboardPath(pathname) {
	return Boolean(pathname?.startsWith(DASHBOARD_TOUR_ROUTE));
}
function waitForTourTargets(selectors, { timeoutMs = 2400, intervalMs = 80 } = {}) {
	return new Promise((resolve) => {
		const started = Date.now();
		const tick = () => {
			if (selectors.some((selector) => Boolean(queryVisibleTourElement(selector))) || Date.now() - started >= timeoutMs) {
				resolve();
				return;
			}
			window.setTimeout(tick, intervalMs);
		};
		tick();
	});
}
function scrollTourTargetIntoView(element) {
	if (!(element instanceof HTMLElement)) return;
	element.scrollIntoView({
		block: "nearest",
		inline: "nearest",
		behavior: "smooth"
	});
}
function useOnboardingTour() {
	const { user } = useAuth();
	const pathname = usePathname();
	const router = useRouter$1();
	const upsertOnboarding = useMutation(onboardingApi.upsert);
	const tourStepDefinitions = [
		{ popover: {
			title: "Welcome to Cohorts",
			description: "A quick walkthrough of the dashboard — workspace switching, navigation, metrics, and where to get help.",
			side: "over"
		} },
		{
			element: `#${TOUR_IDS.workspace}`,
			requiresAny: [`#${TOUR_IDS.workspace}`],
			popover: {
				title: "Client workspaces",
				description: "Switch the active client here. Metrics, tasks, and proposals on the dashboard follow this selection.",
				side: "bottom"
			}
		},
		{
			element: () => resolveCommandMenuElement(),
			requiresAny: [`#${TOUR_IDS.commandMenuDesktop}`, `#${TOUR_IDS.commandMenuMobile}`],
			popover: {
				title: "Quick navigation",
				description: "Open search from here or press ⌘K (Ctrl+K on Windows) to jump to pages, clients, and actions.",
				side: "bottom"
			}
		},
		{
			element: `#${TOUR_IDS.stats}`,
			requiresAny: [`#${TOUR_IDS.stats}`],
			popover: {
				title: "Today's workload",
				description: "See open tasks, active projects, and live proposals for the workspace you have selected.",
				side: "bottom"
			}
		},
		{
			element: `#${TOUR_IDS.performance}`,
			requiresAny: [`#${TOUR_IDS.performance}`],
			popover: {
				title: "Spend & revenue",
				description: "Track daily ad spend and revenue once platforms are connected. Trends update as data syncs.",
				side: "top"
			}
		},
		{
			element: `#${TOUR_IDS.quickActions}`,
			requiresAny: [`#${TOUR_IDS.quickActions}`],
			popover: {
				title: "Quick actions",
				description: "Shortcuts to ads, analytics, collaboration, tasks, and proposals — the workflows you use most.",
				side: "top"
			}
		},
		{
			element: () => resolveNavigationElement(),
			requiresAny: [`#${TOUR_IDS.sidebar}`, `#${TOUR_IDS.mobileNav}`],
			popover: {
				title: "Main navigation",
				description: "Move between Clients, Ads, Analytics, Meetings, Tasks, Proposals, Collaboration, and Projects.",
				side: "right"
			}
		},
		{
			element: `#${TOUR_IDS.help}`,
			requiresAny: [`#${TOUR_IDS.help}`],
			popover: {
				title: "Help & tour",
				description: "Reopen this guided tour anytime from the rocket icon, or open the help panel for shortcuts and tips.",
				side: "left"
			}
		},
		{ popover: {
			title: "You're all set",
			description: "Connect ad platforms under Ads when you are ready, then assign tasks so your team can execute. Happy growing.",
			side: "over"
		} }
	];
	const persistTourCompleted = async () => {
		if (!user?.id) return;
		try {
			await upsertOnboarding({
				userId: user.id,
				onboardingTourCompleted: true,
				onboardingTourCompletedAtMs: Date.now()
			});
		} catch (error) {
			logError(error, "useOnboardingTour:persistTourCompleted");
			reportConvexFailure({
				error,
				context: "use-onboarding-tour.ts:persistTourCompleted",
				title: "Could not save tour progress",
				fallbackMessage: "Could not save tour progress"
			});
		}
	};
	const startTour = async (options) => {
		if ((options?.ensureDashboard ?? true) && !isDashboardPath(pathname)) {
			router.push(DASHBOARD_TOUR_ROUTE);
			await waitForTourTargets([
				`#${TOUR_IDS.workspace}`,
				`#${TOUR_IDS.stats}`,
				`#${TOUR_IDS.quickActions}`
			]);
		} else await waitForTourTargets([`#${TOUR_IDS.workspace}`], { timeoutMs: 1200 });
		const steps = materializeTourSteps(tourStepDefinitions);
		if (steps.length === 0) return;
		Ae({
			showProgress: true,
			animate: true,
			smoothScroll: true,
			allowClose: true,
			overlayClickBehavior: "close",
			stagePadding: 8,
			stageRadius: 12,
			popoverClass: "cohorts-tour-popover",
			progressText: "{{current}} of {{total}}",
			nextBtnText: "Next",
			prevBtnText: "Back",
			doneBtnText: "Done",
			steps,
			onHighlightStarted: (element) => {
				scrollTourTargetIntoView(element);
			},
			onDestroyed: () => {
				persistTourCompleted();
			}
		}).drive();
	};
	return { startTour };
}
/** Defer date-fns + infinite query bundle off header critical path. */
var NotificationsDropdownDynamic = dynamic(() => import("./notifications-dropdown-ZcIidsyi.mjs").then((m) => m.NotificationsDropdown), {
	ssr: false,
	loading: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-muted/20",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-4 rounded-md bg-muted/60 motion-safe:animate-pulse" })
	})
});
function CommandMenuLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-center p-8",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			className: "size-5 animate-spin text-muted-foreground",
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Loading command menu…"
		})]
	});
}
/** Defer cmdk + command palette chunk until after shell paint. */
var CommandMenuDynamic = dynamic(() => import("./command-menu-ZLZtphGI.mjs").then((m) => m.CommandMenu), {
	ssr: false,
	loading: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandMenuLoading, {})
});
var globalShortcuts = [
	{
		combo: "mod+k",
		description: "Open quick navigation",
		group: "Panels",
		context: "global"
	},
	{
		combo: "shift+?",
		description: "Show keyboard shortcuts",
		group: "Panels",
		context: "global"
	},
	{
		combo: "g d",
		description: "Go to dashboard",
		group: "Navigation",
		context: "global"
	},
	{
		combo: "g t",
		description: "Go to tasks",
		group: "Navigation",
		context: "global"
	},
	{
		combo: "g m",
		description: "Go to meetings",
		group: "Navigation",
		context: "global"
	},
	{
		combo: "g a",
		description: "Go to ads",
		group: "Navigation",
		context: "global",
		capability: "agency.ads"
	},
	{
		combo: "g p",
		description: "Go to proposals",
		group: "Navigation",
		context: "global",
		capability: "proposals.view"
	},
	{
		combo: "g s",
		description: "Go to settings",
		group: "Navigation",
		context: "global"
	},
	{
		combo: "n t",
		description: "Create a task",
		group: "Actions",
		context: "global"
	},
	{
		combo: "n p",
		description: "Create a proposal",
		group: "Actions",
		context: "global",
		capability: "proposals.manage"
	}
];
var proposalBuilderShortcuts = [
	{
		combo: "mod+s",
		description: "Save draft now",
		group: "Proposal Builder",
		context: "proposal-builder"
	},
	{
		combo: "mod+z",
		description: "Undo last proposal edit",
		group: "Proposal Builder",
		context: "proposal-builder"
	},
	{
		combo: "mod+shift+z",
		description: "Redo proposal edit",
		group: "Proposal Builder",
		context: "proposal-builder"
	},
	{
		combo: "escape",
		description: "Close the proposal builder",
		group: "Proposal Builder",
		context: "proposal-builder"
	}
];
var DASHBOARD_SHORTCUTS = [...globalShortcuts, ...proposalBuilderShortcuts];
function getShortcutsForRole(userRole, context) {
	return DASHBOARD_SHORTCUTS.filter((shortcut) => {
		if (context && shortcut.context !== context) return false;
		if (shortcut.capability) return can(userRole, shortcut.capability);
		if (!shortcut.roles) return true;
		const role = userRole ?? "client";
		return shortcut.roles.includes(role);
	});
}
function HelpStepActionLink({ href, label, onClose }) {
	const onCloseHelpModal = () => {
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		size: "sm",
		variant: "ghost",
		className: "shrink-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
			href,
			onClick: onCloseHelpModal,
			children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1 size-3" })]
		})
	});
}
function HelpNavigationLink({ href, icon: Icon, item, onClose }) {
	const onCloseHelpModal = () => {
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
		href,
		onClick: onCloseHelpModal,
		className: "group flex items-start gap-3 rounded-lg border border-muted/60 p-3 transition hover:border-accent/40 hover:bg-muted/30",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-primary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 space-y-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "font-medium text-foreground group-hover:text-primary",
					children: item.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3 text-muted-foreground opacity-0 transition group-hover:opacity-100" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: item.description
			})]
		})]
	});
}
var navigationGuide = [
	{
		name: "Dashboard",
		href: "/dashboard",
		icon: House,
		description: "Your home base with key metrics, workspace comparison, quick actions, and recent activity.",
		tips: ["Use the client selector to filter by workspace", "Compare multiple clients if you are an admin"]
	},
	{
		name: "Clients",
		href: "/admin/clients",
		icon: Users,
		description: "Manage your client workspaces, add new clients, and configure workspace settings from the admin area.",
		tips: ["Click a client to see detailed information", "Use the search to quickly find clients"]
	},
	{
		name: "Analytics",
		href: "/dashboard/analytics",
		icon: ChartColumn,
		description: "Deep dive into performance data across all your connected ad platforms.",
		tips: ["Filter by platform and date range", "Check AI-generated insights for quick recommendations"]
	},
	{
		name: "Ads",
		href: "/dashboard/ads",
		icon: Megaphone,
		description: "Connect and manage your ad platform integrations (Google, Meta, LinkedIn, TikTok).",
		tips: ["Connect platforms to sync metrics automatically", "Monitor sync status and refresh data"]
	},
	{
		name: "Meetings",
		href: "/dashboard/meetings",
		icon: Video,
		description: "Schedule native meeting rooms, invite attendees through Calendar, and review transcript-driven notes.",
		tips: ["Connect Google Workspace first", "Client users can join and review notes in read-only mode"]
	},
	{
		name: "Tasks",
		href: "/dashboard/tasks",
		icon: SquareCheckBig,
		description: "Track and manage tasks for you and your team across all client projects.",
		tips: ["Assign tasks to team members", "Set priorities and due dates"]
	},
	{
		name: "Proposals",
		href: "/dashboard/proposals",
		icon: FileText,
		description: "Create AI-powered proposals and pitch decks for new and existing clients.",
		tips: ["Use templates to speed up creation", "Generate professional slide decks instantly"]
	},
	{
		name: "Collaboration",
		href: "/dashboard/collaboration",
		icon: MessageSquare,
		description: "Team chat with project channels, file sharing, and message threading.",
		tips: ["Use markdown and code blocks in messages", "React to messages and create threads"]
	},
	{
		name: "Projects",
		href: "/dashboard/projects",
		icon: Briefcase,
		description: "Organize work into projects linked to clients for better tracking.",
		tips: ["Link tasks and messages to projects", "Track project progress and deadlines"]
	}
];
function helpNavigationForRole(role) {
	return navigationGuide.filter((item) => canAccessPath(role, item.href));
}
function gettingStartedStepsForRole(role) {
	const r = role ?? "client";
	const steps = [...gettingStartedSteps];
	if (r !== "admin") steps[0] = {
		...steps[0],
		title: "Select your client workspace",
		description: "Use the workspace switcher in the header to focus on a client, or start from the dashboard home.",
		action: {
			label: "Open dashboard",
			href: "/dashboard"
		}
	};
	if (r === "client") return steps.filter((s) => canAccessPath("client", s.action.href));
	return steps;
}
var gettingStartedSteps = [
	{
		title: "Select or create a client workspace",
		description: "Use the dropdown in the header to switch between client workspaces or create a new one.",
		action: {
			label: "Go to Clients",
			href: "/admin/clients"
		}
	},
	{
		title: "Connect your ad platforms",
		description: "Link Google Ads, Meta, LinkedIn, or TikTok to automatically sync campaign performance.",
		action: {
			label: "Setup Integrations",
			href: "/dashboard/ads"
		}
	},
	{
		title: "Create your first task",
		description: "Capture an immediate priority and assign ownership so your team can execute quickly.",
		action: {
			label: "Open Tasks",
			href: "/dashboard/tasks?action=create"
		}
	},
	{
		title: "Create a proposal",
		description: "Use AI to generate professional proposals and pitch decks in minutes.",
		action: {
			label: "Create Proposal",
			href: "/dashboard/proposals"
		}
	}
];
function HelpModal({ open, onOpenChange, showWelcome = false }) {
	const { user } = useAuth();
	const defaultTab = showWelcome ? "welcome" : "navigation";
	const { startTour } = useOnboardingTour();
	const navigationForUser = helpNavigationForRole(user?.role ?? null);
	const gettingStartedForUser = gettingStartedStepsForRole(user?.role ?? null);
	const keyboardShortcuts = getShortcutsForRole(user?.role, "global").map(({ combo, description }) => ({
		combo,
		description
	}));
	const handleLaunchTour = () => {
		onOpenChange(false);
		startTour({ ensureDashboard: true });
	};
	const handleSkipWelcome = () => {
		localStorage.setItem("cohorts_welcome_seen", "true");
		onOpenChange(false);
	};
	const handleClose = () => {
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-[600px] max-h-[85vh] overflow-hidden p-0 z-[1100]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
				className: "px-6 pt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "size-5 text-primary" }), showWelcome ? "Welcome to Cohorts" : "Help & Navigation"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: showWelcome ? "Get started with your agency workspace in a few simple steps." : "Learn how to navigate and make the most of your workspace." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: defaultTab,
				className: "flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "grid w-full grid-cols-3",
						children: [
							showWelcome && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "welcome",
								children: "Get Started"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "navigation",
								children: "Navigation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "shortcuts",
								children: "Shortcuts"
							}),
							!showWelcome && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "tips",
								children: "Tips"
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
					className: "h-[400px] px-6 pb-6",
					children: [
						showWelcome && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "welcome",
							className: "mt-4 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pt-2 flex flex-col gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										onClick: handleLaunchTour,
										className: "w-full bg-gradient-to-r from-primary to-primary/80",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 size-4" }), "Launch Interactive Tour"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										onClick: handleSkipWelcome,
										className: "w-full text-muted-foreground",
										children: "Skip to dashboard"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-lg border border-accent/20 bg-accent/5 p-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex size-8 items-center justify-center rounded-full bg-accent/20 text-primary",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "font-semibold text-foreground",
											children: "Quick tip"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm text-muted-foreground flex items-center gap-1.5",
											children: [
												"Press ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardShortcutBadge, { combo: "mod+k" }),
												" to quickly navigate across pages."
											]
										})] })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-3",
									children: gettingStartedForUser.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "group flex items-start gap-4 rounded-lg border border-muted/60 p-4 transition hover:border-accent/40 hover:bg-muted/30",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "secondary",
												className: "shrink-0",
												children: index + 1
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1 space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
													className: "font-medium text-foreground",
													children: step.title
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm text-muted-foreground",
													children: step.description
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpStepActionLink, {
												href: step.action.href,
												label: step.action.label,
												onClose: handleClose
											})
										]
									}, step.title))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "navigation",
							className: "mt-4 space-y-3",
							children: navigationForUser.map((item) => {
								const Icon = item.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpNavigationLink, {
									href: item.href,
									icon: Icon,
									item,
									onClose: handleClose
								}, item.name);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "shortcuts",
							className: "mt-4 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-muted/60 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-sm font-medium text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "size-4" }), "Keyboard Shortcuts"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Use these shortcuts to navigate faster."
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-2",
								children: keyboardShortcuts.map((shortcut) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between rounded-lg border border-muted/40 px-4 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm text-foreground",
										children: shortcut.description
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardShortcutBadge, { combo: shortcut.combo })]
								}, shortcut.description))
							})]
						}),
						!showWelcome && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "tips",
							className: "mt-4 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-accent/20 bg-accent/5 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "font-semibold text-foreground",
									children: "Pro tips for power users"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Get more done with these helpful features."
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-muted/60 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
											className: "font-medium text-foreground",
											children: "Client Comparison"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted-foreground",
											children: "Admin users can compare multiple clients side-by-side on the dashboard. Select multiple workspaces from the filter bar."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-muted/60 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
											className: "font-medium text-foreground",
											children: "AI-Powered Features"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted-foreground",
											children: "Use AI to generate proposals, get performance insights, and create professional pitch decks automatically."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-muted/60 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
											className: "font-medium text-foreground",
											children: "Markdown in Chat"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted-foreground",
											children: "Use markdown formatting in collaboration messages including code blocks with syntax highlighting."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-muted/60 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
											className: "font-medium text-foreground",
											children: "Quick Search"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted-foreground",
											children: "The search bar in the header searches across clients, tasks, and campaigns. Use it to quickly find what you need."
										})]
									})
								]
							})]
						})
					]
				})]
			}, defaultTab)]
		})
	});
}
function useHelpModal() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [showWelcome, setShowWelcome] = (0, import_react.useState)(false);
	const { user } = useAuth();
	const userId = user?.id;
	const userCreatedAt = user?.createdAt;
	const { isAuthenticated: isConvexAuthenticated } = useConvexAuth();
	const onboardingState = useQuery(onboardingApi.getByUserId, userId && isConvexAuthenticated ? { userId } : "skip");
	const upsertOnboarding = useMutation(onboardingApi.upsert);
	(0, import_react.useEffect)(() => {
		if (!userId) return;
		const uid = userId;
		const createdAt = userCreatedAt;
		let cancelled = false;
		async function run() {
			if (onboardingState === void 0) return;
			const hasSeenWelcomeLocal = typeof window !== "undefined" ? window.localStorage.getItem("cohorts_welcome_seen") : null;
			let hasSeenWelcomeRemote = Boolean(onboardingState?.welcomeSeen || onboardingState?.welcomeSeenAtMs);
			const onboardingTourCompleted = Boolean(onboardingState?.onboardingTourCompleted);
			const onboardingTourCompletedAtMs = onboardingState?.onboardingTourCompletedAtMs ?? null;
			const persistWelcomeSeen = async () => {
				return upsertOnboarding({
					userId: uid,
					onboardingTourCompleted,
					onboardingTourCompletedAtMs,
					welcomeSeen: true,
					welcomeSeenAtMs: Date.now()
				}).then(() => true).catch((error) => {
					logError(error, "useHelpModal:persistWelcomeSeen");
					return false;
				});
			};
			if (hasSeenWelcomeLocal && !hasSeenWelcomeRemote) {
				if (await persistWelcomeSeen()) hasSeenWelcomeRemote = true;
			}
			const created = createdAt ? new Date(createdAt) : /* @__PURE__ */ new Date();
			const isNewUser = (/* @__PURE__ */ new Date()).getTime() - created.getTime() < 1440 * 60 * 1e3;
			const shouldShowWelcome = !hasSeenWelcomeRemote && !hasSeenWelcomeLocal && isNewUser;
			if (!cancelled && shouldShowWelcome) {
				setShowWelcome(true);
				setOpen(true);
			}
			if (!cancelled && !shouldShowWelcome && hasSeenWelcomeLocal && !hasSeenWelcomeRemote) await persistWelcomeSeen();
		}
		run();
		return () => {
			cancelled = true;
		};
	}, [
		userId,
		userCreatedAt,
		onboardingState,
		upsertOnboarding
	]);
	const markWelcomeSeen = async () => {
		try {
			if (typeof window !== "undefined") window.localStorage.setItem("cohorts_welcome_seen", "1");
		} catch {}
		if (!userId) return;
		await upsertOnboarding({
			userId,
			onboardingTourCompleted: Boolean(onboardingState?.onboardingTourCompleted),
			onboardingTourCompletedAtMs: onboardingState?.onboardingTourCompletedAtMs ?? null,
			welcomeSeen: true,
			welcomeSeenAtMs: Date.now()
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "useHelpModal:markWelcomeSeen",
				title: "Could not save welcome state",
				fallbackMessage: "Could not save welcome state"
			});
		});
	};
	const onOpenChange = (nextOpen) => {
		setOpen(nextOpen);
		if (!nextOpen && showWelcome && userId) {
			setShowWelcome(false);
			markWelcomeSeen();
		}
	};
	return {
		open,
		setOpen,
		onOpenChange,
		showWelcome,
		setShowWelcome
	};
}
function ProblemReportModal({ open, onOpenChange }) {
	const { user } = useAuth();
	const { selectedClientId } = useClientContext();
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [severity, setSeverity] = (0, import_react.useState)("medium");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const createProblemReport = useMutation(problemReportsApi.create);
	const handleTitleChange = (event) => {
		setTitle(event.target.value);
	};
	const handleDescriptionChange = (event) => {
		setDescription(event.target.value);
	};
	const handleSeverityChange = (value) => {
		if (value === "low" || value === "medium" || value === "high" || value === "critical") setSeverity(value);
	};
	const handleClose = () => {
		onOpenChange(false);
	};
	const handleSubmit = (event) => {
		event.preventDefault();
		if (!user) return;
		setSubmitting(true);
		createProblemReport({
			legacyId: `pr_${Date.now()}_${user.id ?? "anon"}`,
			userId: user.id ?? null,
			userEmail: user.email ?? null,
			userName: user.name ?? null,
			workspaceId: selectedClientId || null,
			title,
			description,
			severity,
			status: "open",
			createdAtMs: Date.now(),
			updatedAtMs: Date.now()
		}).then(() => {
			notifySuccess({
				title: "Report submitted",
				message: "Thank you for your feedback. We'll look into it as soon as possible."
			});
			onOpenChange(false);
			setTitle("");
			setDescription("");
			setSeverity("medium");
		}).catch((error) => {
			console.error("Error submitting problem report:", error);
			reportConvexFailure({
				error,
				context: "problem-report-modal.tsx:catch",
				title: "Could not submit report",
				fallbackMessage: "Could not submit report"
			});
		}).finally(() => {
			setSubmitting(false);
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-[500px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
					className: "size-5 text-primary",
					"aria-hidden": true
				}), "Report a Problem"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Found a bug or having trouble? Let us know and we'll fix it." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "title",
							children: "Issue Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "title",
							placeholder: "Brief summary of the problem",
							value: title,
							onChange: handleTitleChange,
							required: true,
							disabled: submitting
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "severity",
							children: "Severity Level"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: severity,
							onValueChange: handleSeverityChange,
							disabled: submitting,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "severity",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select severity" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "low",
									children: "Low - Minor annoyance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "medium",
									children: "Medium - Important but usable"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "high",
									children: "High - Limits functionality"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "critical",
									children: "Critical - System broken / Data loss"
								})
							] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "description",
							children: "Detailed Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "description",
							placeholder: "What happened? What did you expect to happen?",
							value: description,
							onChange: handleDescriptionChange,
							className: "min-h-[120px]",
							required: true,
							disabled: submitting
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-3 pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: handleClose,
							disabled: submitting,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: submitting,
							children: submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Submitting…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "mr-2 size-4" }), "Submit Report"] })
						})]
					})
				]
			})]
		})
	});
}
function KeyboardShortcutsOverlay({ open, onOpenChange, includeContexts = ["global", "proposal-builder"] }) {
	const { user } = useAuth();
	const groupedShortcuts = includeContexts.flatMap((context) => getShortcutsForRole(user?.role, context)).reduce((accumulator, shortcut) => {
		if (!accumulator[shortcut.group]) accumulator[shortcut.group] = [];
		accumulator[shortcut.group].push(shortcut);
		return accumulator;
	}, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-2xl overflow-hidden p-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
				className: "border-b border-muted/40 px-6 py-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 text-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "size-5 text-primary" }), "Keyboard Shortcuts"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Use global navigation shortcuts anywhere in the dashboard, with extra commands available inside the proposal builder." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "max-h-[70vh] px-6 py-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-6",
					children: Object.entries(groupedShortcuts).map(([group, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground",
								children: group
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-px flex-1 bg-border/60",
								"aria-hidden": true
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-2",
							children: items.map((shortcut) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-4 rounded-xl border border-muted/40 bg-muted/10 px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-foreground",
										children: shortcut.description
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: shortcut.context === "proposal-builder" ? "Proposal builder only" : "Available globally"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardShortcutBadge, {
									combo: shortcut.combo,
									className: "shrink-0"
								})]
							}, `${shortcut.context}-${shortcut.combo}-${shortcut.description}`))
						})]
					}, group))
				})
			})]
		})
	});
}
var DASHBOARD_SIDEBAR_TRANSITION_STYLE = { viewTransitionName: "dashboard-sidebar" };
var DASHBOARD_HEADER_TRANSITION_STYLE = { viewTransitionName: "dashboard-header" };
function NavItemLink({ item, linkClasses, onNavigate, prefetchRoute, collapsed, isActive = false, ref, onClick, onMouseEnter, ...linkProps }) {
	const handleMouseEnter = (event) => {
		onMouseEnter?.(event);
		prefetchRoute(item.href);
	};
	const handlePointerDown = () => {
		prefetchRoute(item.href);
	};
	const onNavItemClick = (event) => {
		onClick?.(event);
		if (!event.defaultPrevented) onNavigate?.();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
		ref,
		href: item.href,
		prefetch: true,
		onClick: onNavItemClick,
		onMouseEnter: handleMouseEnter,
		onPointerDown: handlePointerDown,
		className: linkClasses,
		"aria-label": collapsed ? item.name : void 0,
		"aria-current": isActive ? "page" : void 0,
		title: collapsed ? item.name : void 0,
		...linkProps,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4 shrink-0" }), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: item.name
		})]
	});
}
function NavigationList({ onNavigate, collapsed = false }) {
	const pathname = usePathname();
	const { prefetch } = useRouter$1();
	const { user } = useAuth();
	const prefetchedRef = (0, import_react.useRef)(null);
	if (prefetchedRef.current === null) prefetchedRef.current = /* @__PURE__ */ new Set();
	const prefetchRoute = (href) => {
		if (!href) return;
		const target = href.split("?")[0];
		if (target && target !== pathname && !prefetchedRef.current.has(target)) {
			prefetchedRef.current.add(target);
			try {
				prefetch(href);
			} catch {}
		}
	};
	const prefetchAdmin = () => prefetchRoute("/admin");
	const prefetchSettings = () => prefetchRoute("/settings");
	(0, import_react.useEffect)(() => {
		if (pathname.startsWith("/dashboard") || pathname.startsWith("/for-you")) localStorage.setItem("cohorts_last_tab", pathname);
	}, [pathname]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
		delayDuration: 300,
		skipDelayDuration: 100,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "flex flex-1 flex-col gap-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4 px-1",
					children: navItemsForRole(user?.role ?? null).map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [!collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/65",
							children: group.label
						}) : null, group.items.map((item) => {
							const isActive = item.href === "/dashboard" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
							const navLink = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItemLink, {
								item,
								linkClasses: cn("flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors", collapsed ? "justify-center px-0" : "justify-start", isActive ? "bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_88%,#0f172a_12%)] shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/80"),
								onNavigate,
								prefetchRoute,
								collapsed,
								isActive
							}, item.name);
							if (collapsed) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
								asChild: true,
								children: navLink
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, {
								side: "right",
								className: "flex flex-col gap-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: item.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: item.description
								})]
							})] }, item.name);
							return navLink;
						})]
					}, group.id))
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 border-t pt-4 px-1",
				children: [user?.role === "admin" && (collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						href: "/admin",
						onClick: onNavigate,
						onMouseEnter: prefetchAdmin,
						className: "flex h-9 w-full items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
					side: "right",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: "Admin Panel"
					})
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
					href: "/admin",
					onClick: onNavigate,
					onMouseEnter: prefetchAdmin,
					className: "flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Admin Panel" })]
				})), collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						href: "/settings",
						onClick: onNavigate,
						onMouseEnter: prefetchSettings,
						className: "flex h-9 w-full items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
					side: "right",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: "Settings"
					})
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
					href: "/settings",
					onClick: onNavigate,
					onMouseEnter: prefetchSettings,
					className: "flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/80",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Settings" })]
				})]
			})]
		})
	});
}
function Sidebar() {
	const [collapsed, setCollapsed] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return true;
		try {
			const stored = localStorage.getItem("cohorts.sidebar.collapsed");
			if (stored === "true") return true;
			if (stored === "false") return false;
		} catch {}
		return true;
	});
	const toggleCollapsed = () => {
		setCollapsed((prev) => {
			const next = !prev;
			try {
				if (typeof window !== "undefined") localStorage.setItem("cohorts.sidebar.collapsed", String(next));
			} catch {}
			return next;
		});
	};
	const accent = useDashboardRoleAccent();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		id: "tour-sidebar",
		className: cn("hidden min-h-0 h-full shrink-0 border-r bg-background/60 backdrop-blur-sm lg:flex", chromaticTransitionNormalClass, collapsed ? "w-16 flex-col items-center p-3" : "w-64 flex-col p-4", accent.sidebarClass),
		"data-dashboard-role": accent.key,
		style: DASHBOARD_SIDEBAR_TRANSITION_STYLE,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": collapsed ? "Expand sidebar" : "Collapse sidebar",
			className: cn("mb-6 inline-flex size-9 items-center justify-center rounded-md border border-muted/60 text-muted-foreground hover:border-accent/40 hover:text-primary hover:bg-muted/50", chromaticTransitionClass, collapsed && "mt-2"),
			onClick: toggleCollapsed,
			children: collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 transition-transform" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4 transition-transform" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("min-h-0 flex-1", collapsed ? "w-full" : ""),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationList, { collapsed })
		})]
	});
}
function Header() {
	const { push } = useRouter$1();
	const { user, signOut } = useAuth();
	const { isPreviewMode } = usePreview();
	const accent = useDashboardRoleAccent();
	const [open, setOpen] = (0, import_react.useState)(false);
	const { open: helpOpen, onOpenChange: onHelpOpenChange, showWelcome, setShowWelcome } = useHelpModal();
	const { startTour } = useOnboardingTour();
	const [problemReportOpen, setProblemReportOpen] = (0, import_react.useState)(false);
	const [shortcutsOpen, setShortcutsOpen] = (0, import_react.useState)(false);
	const previewProfile = getPreviewSettingsProfile();
	const displayedName = isPreviewMode ? previewProfile.name : user?.name ?? "Account";
	const displayedEmail = isPreviewMode ? previewProfile.email : user?.email ?? "user@example.com";
	const initialsSource = displayedName;
	const initials = initialsSource ? initialsSource.split(" ").map((n) => n[0]).join("").toUpperCase() : "US";
	const handleNavigate = () => setOpen(false);
	const handleSignOut = () => {
		setOpen(false);
		signOut().catch((err) => {
			notifyFailure({
				title: "Sign out incomplete",
				message: err instanceof Error ? err.message : "Sign out failed. You were signed out locally; try again or clear cookies if issues persist.",
				fallbackMessage: "Sign out failed. You were signed out locally; try again or clear cookies if issues persist."
			});
		});
	};
	const handleShowOnboarding = () => {
		startTour({ ensureDashboard: true });
	};
	const handleOpenHelp = () => {
		setShortcutsOpen(false);
		setShowWelcome(false);
		onHelpOpenChange(true);
	};
	const handleOpenShortcuts = () => {
		setShowWelcome(false);
		onHelpOpenChange(false);
		setShortcutsOpen(true);
	};
	const handleOpenProblemReport = () => setProblemReportOpen(true);
	const roleLabel = (() => {
		switch (user?.role) {
			case "admin": return "Admin";
			case "team": return "Team";
			case "client": return "Client";
			default: return null;
		}
	})();
	useKeyboardShortcuts((() => {
		return getShortcutsForRole(user?.role, "global").reduce((accumulator, shortcut) => {
			switch (shortcut.combo) {
				case "shift+?":
					accumulator.push({
						combo: shortcut.combo,
						description: shortcut.description,
						callback: handleOpenShortcuts
					});
					break;
				case "g d":
					accumulator.push({
						combo: shortcut.combo,
						description: shortcut.description,
						callback: () => push("/dashboard")
					});
					break;
				case "g t":
					accumulator.push({
						combo: shortcut.combo,
						description: shortcut.description,
						callback: () => push("/dashboard/tasks")
					});
					break;
				case "g m":
					accumulator.push({
						combo: shortcut.combo,
						description: shortcut.description,
						callback: () => push("/dashboard/meetings")
					});
					break;
				case "g a":
					accumulator.push({
						combo: shortcut.combo,
						description: shortcut.description,
						callback: () => push("/dashboard/ads")
					});
					break;
				case "g p":
					accumulator.push({
						combo: shortcut.combo,
						description: shortcut.description,
						callback: () => push("/dashboard/proposals")
					});
					break;
				case "g s":
					accumulator.push({
						combo: shortcut.combo,
						description: shortcut.description,
						callback: () => push("/settings")
					});
					break;
				case "n t":
					accumulator.push({
						combo: shortcut.combo,
						description: shortcut.description,
						callback: () => push("/dashboard/tasks?action=create")
					});
					break;
				case "n p":
					accumulator.push({
						combo: shortcut.combo,
						description: shortcut.description,
						callback: () => push("/dashboard/proposals")
					});
					break;
				default: break;
			}
			return accumulator;
		}, []);
	})(), { enabled: !helpOpen && !shortcutsOpen });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "sticky top-0 z-1000 flex flex-col border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-backdrop-filter:bg-background/60",
			"data-dashboard-role": accent.key,
			style: DASHBOARD_HEADER_TRANSITION_STYLE,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-16 items-center justify-between gap-2 px-3 sm:h-[4.25rem] sm:gap-3 sm:px-6 lg:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
							open,
							onOpenChange: setOpen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									id: "tour-mobile-nav",
									variant: "ghost",
									size: "icon",
									className: "shrink-0",
									"aria-label": "Open navigation menu",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
								side: "left",
								className: "w-70 p-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
									className: "border-b px-4 py-3 text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
										className: "text-base font-semibold",
										children: "Workspace"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1.5 text-xs leading-snug text-muted-foreground",
										children: accent.shellCaption
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationList, { onNavigate: handleNavigate }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "ghost",
										className: "mt-6 w-full justify-start gap-2 text-sm font-medium",
										onClick: handleSignOut,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4 shrink-0" }), "Sign Out"]
									})]
								})]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:flex-none sm:overflow-visible sm:gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLogo, {
							size: "wordmarkLg",
							href: "/for-you",
							className: "h-12 sm:h-14 lg:h-16"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientWorkspaceSelector, { className: "min-w-0 w-[9rem] sm:w-auto" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden min-w-0 flex-1 basis-0 pl-2 sm:flex sm:max-w-md sm:pl-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandMenuDynamic, {
							onOpenHelp: handleOpenHelp,
							onOpenShortcuts: handleOpenShortcuts
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex shrink-0 items-center gap-1 sm:gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sm:hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandMenuDynamic, {
									onOpenHelp: handleOpenHelp,
									onOpenShortcuts: handleOpenShortcuts
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									onClick: handleOpenShortcuts,
									className: "hidden sm:inline-flex",
									"aria-label": "Show keyboard shortcuts",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "size-4" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Keyboard shortcuts" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardShortcutBadge, { combo: "shift+?" })]
							}) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									onClick: handleOpenProblemReport,
									className: "hidden sm:inline-flex",
									"aria-label": "Report a problem",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Report a problem" }) })] })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									id: "tour-help-trigger",
									variant: "ghost",
									size: "icon",
									onClick: handleShowOnboarding,
									className: "inline-flex",
									"aria-label": "Show onboarding tour",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "size-4" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Onboarding" }) })] }) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsDropdownDynamic, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileDropdown, {
								displayedName,
								displayedEmail,
								initials,
								isPreviewMode,
								roleLabel,
								isAdmin: user?.role === "admin",
								onNavigate: handleNavigate,
								onOpenHelp: handleOpenHelp,
								onSignOut: handleSignOut
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn(accent.headerStripClass),
				"aria-hidden": true
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpModal, {
			open: helpOpen,
			onOpenChange: onHelpOpenChange,
			showWelcome
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardShortcutsOverlay, {
			open: shortcutsOpen,
			onOpenChange: setShortcutsOpen
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProblemReportModal, {
			open: problemReportOpen,
			onOpenChange: setProblemReportOpen
		})
	] });
}
function NavigationBreadcrumbs() {
	const pathname = usePathname();
	const searchParams = useUrlSearchParamsContext();
	const { selectedClient } = useClientContext();
	const { user } = useAuth();
	const [isDropdownOpen, setIsDropdownOpen] = (0, import_react.useState)(false);
	const pathSegments = pathname.replace("/dashboard/", "").split("/").filter(Boolean);
	const proposalId = pathSegments[0] === "proposals" && pathSegments[1] && pathSegments[1] !== "analytics" && pathSegments[1] !== "viewer" ? pathSegments[1] : null;
	const workspaceId = user?.agencyId ?? null;
	const proposalRow = useQuery(proposalsApi.getByLegacyId, workspaceId && proposalId ? {
		workspaceId,
		legacyId: proposalId
	} : "skip");
	if (!isFeatureEnabled("BREADCRUMBS") || !pathname.startsWith("/dashboard") && !pathname.startsWith("/for-you")) return null;
	const items = generateBreadcrumbItems(pathname, searchParams, {
		id: selectedClient?.id ?? null,
		name: selectedClient?.name ?? null
	}, { proposalTitle: proposalRow?.clientName ?? proposalRow?.legacyId ?? null });
	if (items.length <= 1) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumb, {
			"aria-label": "Breadcrumb",
			className: "hidden md:flex",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreadcrumbList, { children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreadcrumbItem, { children: item.href && !item.isCurrent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreadcrumbLink, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
						prefetch: true,
						href: item.href,
						className: "flex items-center gap-1 text-sm",
						children: [item.icon && (() => {
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" });
						})(), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate max-w-[120px]",
							children: item.label
						})]
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BreadcrumbPage, {
					className: "flex items-center gap-1 text-sm",
					children: [item.icon && (() => {
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" });
					})(), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate max-w-[120px]",
						children: item.label
					})]
				}) }), index < items.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreadcrumbSeparator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" }) })]
			}, `${item.label}-${item.href ?? "current"}`)) })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "md:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
				open: isDropdownOpen,
				onOpenChange: setIsDropdownOpen,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						className: "h-8 px-2",
						"aria-label": "Open breadcrumb trail",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1",
							children: [
								items[items.length - 2]?.icon && (() => {
									const secondToLastItem = items[items.length - 2];
									if (secondToLastItem?.icon) {
										const Icon = secondToLastItem.icon;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" });
									}
									return null;
								})(),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3" }),
								items[items.length - 1]?.icon && (() => {
									const lastItem = items[items.length - 1];
									if (lastItem?.icon) {
										const Icon = lastItem.icon;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" });
									}
									return null;
								})(),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: items[items.length - 1]?.label
								})
							]
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
					align: "start",
					className: "w-56",
					children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						asChild: true,
						children: item.href && !item.isCurrent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
							prefetch: true,
							href: item.href,
							className: "flex items-center gap-2",
							children: [item.icon && (() => {
								const Icon = item.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" });
							})(), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("truncate", item.isCurrent && "font-medium"),
								children: item.label
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [item.icon && (() => {
								const Icon = item.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" });
							})(), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate font-medium",
								children: item.label
							})]
						})
					}, `${item.label}-${item.href ?? "current"}`))
				})]
			})
		})]
	});
}
function generateBreadcrumbItems(pathname, searchParams, selectedClient, dynamicLabels) {
	const items = [];
	if (pathname === "/for-you" || pathname.startsWith("/for-you/")) {
		items.push({
			label: "For You",
			href: "/for-you",
			icon: Activity,
			isCurrent: pathname === "/for-you"
		});
		return items;
	}
	items.push({
		label: "Dashboard",
		href: "/dashboard",
		icon: House
	});
	if (selectedClient?.id && selectedClient?.name) items.push({
		label: selectedClient.name,
		href: `/dashboard?clientId=${selectedClient.id}`
	});
	const pathSegments = pathname.replace("/dashboard/", "").split("/");
	const currentSection = pathSegments[0];
	switch (currentSection) {
		case "projects": {
			items.push({
				label: "Projects",
				href: "/dashboard/projects",
				icon: Briefcase
			});
			const projectId = searchParams.get("projectId");
			const projectName = searchParams.get("projectName");
			if (projectId || projectName) items.push({
				label: projectName || "Project Details",
				href: `/dashboard/projects?projectId=${projectId}&projectName=${projectName}`
			});
			break;
		}
		case "tasks": {
			items.push({
				label: "Tasks",
				href: "/dashboard/tasks",
				icon: ListChecks
			});
			const taskProjectId = searchParams.get("projectId");
			const taskProjectName = searchParams.get("projectName");
			if (taskProjectId || taskProjectName) items.push({
				label: taskProjectName || "Project Tasks",
				href: `/dashboard/tasks?projectId=${taskProjectId}&projectName=${taskProjectName}`
			});
			break;
		}
		case "collaboration": {
			items.push({
				label: "Collaboration",
				href: "/dashboard/collaboration",
				icon: MessageSquare
			});
			const collabProjectId = searchParams.get("projectId");
			const collabProjectName = searchParams.get("projectName");
			if (collabProjectId || collabProjectName) items.push({
				label: collabProjectName || "Project Discussion",
				href: `/dashboard/collaboration?projectId=${collabProjectId}&projectName=${collabProjectName}`
			});
			break;
		}
		case "analytics":
			items.push({
				label: "Analytics",
				href: "/dashboard/analytics",
				icon: ChartColumn
			});
			break;
		case "proposals":
			items.push({
				label: "Proposals",
				href: "/dashboard/proposals",
				icon: FileText
			});
			if (pathSegments[1] === "analytics") items.push({
				label: "Analytics",
				isCurrent: true
			});
			else if (pathSegments[1] === "viewer") items.push({
				label: "Viewer",
				isCurrent: true
			});
			else if (pathSegments[1]) {
				const proposalTitle = searchParams.get("proposalName") || dynamicLabels.proposalTitle || "Proposal";
				items.push({
					label: proposalTitle,
					href: `/dashboard/proposals/${pathSegments[1]}`
				});
				if (pathSegments[2] === "deck") items.push({
					label: "Deck",
					isCurrent: true
				});
			}
			break;
		case "ads":
			items.push({
				label: "Ads",
				href: "/dashboard/ads",
				icon: Megaphone
			});
			if (pathSegments[1] === "campaigns" && pathSegments[2]) {
				const providerId = pathSegments[2];
				const campaignId = pathSegments[3];
				const campaignName = searchParams.get("campaignName");
				items.push({
					label: {
						"facebook": "Meta",
						"google": "Google Ads",
						"linkedin": "LinkedIn",
						"tiktok": "TikTok"
					}[providerId] || providerId,
					href: `/dashboard/ads?provider=${providerId}`
				});
				if (campaignId) {
					const isCreativePath = pathSegments[4] === "creative" && pathSegments[5];
					const campaignLabel = campaignName || "Campaign details";
					items.push({
						label: campaignLabel,
						href: isCreativePath ? `/dashboard/ads/campaigns/${providerId}/${campaignId}?${searchParams.toString()}` : void 0,
						isCurrent: !isCreativePath
					});
					if (isCreativePath) {
						const creativeName = searchParams.get("creativeName");
						items.push({
							label: creativeName || "Creative detail",
							isCurrent: true
						});
					}
				}
			}
			break;
		case "for-you":
			items.push({
				label: "For You",
				href: "/for-you",
				icon: Activity
			});
			break;
		case "activity":
			items.push({
				label: "For You",
				href: "/for-you",
				icon: Activity
			});
			break;
		case "clients":
			items.push({
				label: "Clients",
				href: "/dashboard/clients",
				icon: Users
			});
			break;
		case "meetings":
			items.push({
				label: "Meetings",
				href: "/dashboard/meetings",
				icon: Video
			});
			break;
		default:
			if (currentSection) items.push({
				label: currentSection.charAt(0).toUpperCase() + currentSection.slice(1),
				isCurrent: true
			});
			break;
	}
	if (items.length > 0) {
		const lastItem = items[items.length - 1];
		if (lastItem) {
			lastItem.isCurrent = true;
			delete lastItem.href;
		}
	}
	return items;
}
//#endregion
export { useDashboardRoleAccent as a, Sidebar as i, Header as n, NavigationBreadcrumbs as r, HEADER_DROPDOWN_THEME as t };
