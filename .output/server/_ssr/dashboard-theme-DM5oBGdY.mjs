import { c as cn } from "./utils-hh4sibN0.mjs";
import { a as SEMANTIC_COLORS, t as CHART_COLORS } from "./colors-DH3BrJD1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-theme-DM5oBGdY.js
var DASHBOARD_THEME = {
	layout: {
		container: "space-y-6",
		header: "flex flex-col justify-between gap-4 md:flex-row md:items-center",
		title: "text-3xl font-bold tracking-tight text-foreground",
		subtitle: "text-muted-foreground"
	},
	pageHero: cn("relative overflow-hidden rounded-2xl border border-border/50", "bg-linear-to-br from-primary/[0.07] via-card/80 to-info/[0.05]", "p-5 sm:px-6 sm:py-6", "shadow-sm ring-1 ring-border/40"),
	pageHeroGlow: "pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-primary/12 blur-3xl",
	pageHeroInner: "relative flex flex-col justify-between gap-4 md:flex-row md:items-center",
	sectionEyebrow: "text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80",
	sectionDescription: "max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[15px]",
	cards: {
		base: "border-muted/60 bg-background shadow-sm",
		header: "border-b border-muted/40 pb-4",
		content: "p-6"
	},
	badges: {
		base: "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
		primary: "bg-accent/10 text-primary border border-accent/20",
		secondary: "bg-muted/50 text-muted-foreground border-muted/40",
		success: "bg-success/10 text-success border border-success/20",
		warning: "bg-warning/10 text-warning border border-warning/20",
		destructive: "bg-destructive/10 text-destructive border-destructive/20"
	},
	buttons: {
		base: "rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-sm transition-[transform,box-shadow,background-color,color] active:scale-[0.98]",
		primary: "bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_88%,#0f172a_12%)]",
		outline: "border-muted/40 bg-background hover:bg-muted/5 hover:text-primary",
		ghost: "hover:bg-muted/5 hover:text-primary"
	},
	icons: {
		container: "flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-primary shadow-sm border border-accent/20",
		small: "size-6",
		medium: "size-8",
		large: "size-12"
	},
	inputs: { base: "rounded-xl border-muted/40 bg-background" },
	stats: {
		container: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
		card: "overflow-hidden border-muted/50 bg-background shadow-sm transition-[box-shadow,background-color,border-color] hover:shadow-md",
		label: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80",
		value: "text-2xl font-bold text-foreground",
		description: "text-xs text-muted-foreground"
	},
	tables: {
		header: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80",
		row: "hover:bg-muted/30 transition-colors",
		cell: "text-sm text-foreground"
	},
	tabs: {
		list: "bg-muted/50",
		trigger: "gap-1.5 data-[state=active]:bg-background"
	},
	skeletons: {
		card: "h-28 w-full",
		text: "h-4 w-32",
		avatar: "size-10 rounded-full"
	},
	animations: {
		fadeIn: "animate-in fade-in-50 slide-in-from-bottom-2 duration-500",
		pulse: "animate-pulse",
		spin: "animate-spin"
	},
	colors: SEMANTIC_COLORS,
	chartColors: CHART_COLORS
};
var PAGE_TITLES = {
	clients: {
		title: "Clients",
		description: "Manage client workspaces and team relationships."
	},
	projects: {
		title: "Projects",
		description: "Portfolio overview and project management."
	},
	tasks: {
		title: "Tasks",
		description: "Track and manage work items across projects."
	},
	analytics: {
		title: "Analytics",
		description: "Performance insights and data visualization."
	},
	ads: {
		title: "Ad Platforms",
		description: "Connect and manage advertising accounts."
	},
	socials: {
		title: "Socials",
		description: "Connect Meta business accounts to monitor Facebook and Instagram performance."
	},
	meetings: {
		title: "Meetings",
		description: "Run native meeting rooms, send Google Calendar invites, and keep AI notes synced."
	},
	collaboration: {
		title: "Team collaboration",
		description: "Coordinate with teammates and clients in dedicated workspaces tied to each account."
	},
	proposals: {
		title: "Proposals",
		description: "Create and manage business proposals."
	},
	notifications: {
		title: "Notifications",
		description: "Stay updated on important activities."
	},
	activity: {
		title: "Activity",
		description: "Recent actions and audit trail."
	}
};
function getBadgeClasses(variant = "secondary") {
	return cn(DASHBOARD_THEME.badges.base, DASHBOARD_THEME.badges[variant]);
}
function getButtonClasses(variant = "outline") {
	return cn(DASHBOARD_THEME.buttons.base, DASHBOARD_THEME.buttons[variant]);
}
function getIconContainerClasses(size = "medium") {
	return cn(DASHBOARD_THEME.icons.container, DASHBOARD_THEME.icons[size]);
}
//#endregion
export { getIconContainerClasses as a, getButtonClasses as i, PAGE_TITLES as n, getBadgeClasses as r, DASHBOARD_THEME as t };
