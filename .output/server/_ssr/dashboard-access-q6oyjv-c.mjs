import { An as FileText, Ir as Bell, Mr as BriefcaseBusiness, P as SquareCheckBig, Rt as MessageSquare, Sr as ChartColumn, Ut as Megaphone, W as Share2, l as Video, mn as House } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-access-q6oyjv-c.js
function normalizeRole(value) {
	switch (value) {
		case "admin":
		case "team":
		case "client": return value;
		case "manager": return "team";
		case "member": return "client";
		default: return "client";
	}
}
var DASHBOARD_NAVIGATION_GROUPS = [{
	id: "core",
	label: "Workspace",
	items: [
		{
			name: "For You",
			href: "/for-you",
			icon: House,
			description: "Your day and priorities"
		},
		{
			name: "Projects",
			href: "/dashboard/projects",
			icon: BriefcaseBusiness,
			description: "Client delivery and milestones"
		},
		{
			name: "Tasks",
			href: "/dashboard/tasks",
			icon: SquareCheckBig,
			description: "Assignments and work tracking"
		},
		{
			name: "Collaboration",
			href: "/dashboard/collaboration",
			icon: MessageSquare,
			description: "Chat and shared context"
		},
		{
			name: "Meetings",
			href: "/dashboard/meetings",
			icon: Video,
			description: "Schedule and run meetings"
		},
		{
			name: "Notifications",
			href: "/dashboard/notifications",
			icon: Bell,
			description: "Mentions and system alerts"
		}
	]
}, {
	id: "agency-tools",
	label: "Agency tools",
	items: [
		{
			name: "Analytics",
			href: "/dashboard/analytics",
			icon: ChartColumn,
			description: "Traffic, funnels, and client performance",
			capability: "analytics.view"
		},
		{
			name: "Ads",
			href: "/dashboard/ads",
			icon: Megaphone,
			description: "Ad integrations and pacing",
			capability: "agency.ads",
			roles: ["admin", "team"]
		},
		{
			name: "Socials",
			href: "/dashboard/socials",
			icon: Share2,
			description: "Social and content sync",
			capability: "agency.socials",
			roles: ["admin", "team"]
		},
		{
			name: "Proposals",
			href: "/dashboard/proposals",
			icon: FileText,
			description: "Shared proposals and decks from your agency",
			capability: "proposals.view"
		}
	]
}];
var ALL_ROLES = [
	"admin",
	"team",
	"client"
];
var AGENCY_ROLES = ["admin", "team"];
var CAPABILITY_ROLES = {
	"analytics.view": ALL_ROLES,
	"proposals.view": ALL_ROLES,
	"proposals.manage": AGENCY_ROLES,
	"agency.ads": AGENCY_ROLES,
	"agency.socials": AGENCY_ROLES,
	"admin.directory": ["admin"]
};
/** Longest-prefix-first route guards (pathname must match or start with prefix + /). */
var ROUTE_ACCESS = [
	{
		prefix: "/admin/clients",
		capability: "admin.directory"
	},
	{
		prefix: "/dashboard/ads",
		capability: "agency.ads"
	},
	{
		prefix: "/dashboard/socials",
		capability: "agency.socials"
	},
	{
		prefix: "/dashboard/proposals",
		capability: "proposals.view"
	},
	{
		prefix: "/dashboard/analytics",
		capability: "analytics.view"
	}
];
var HREF_CAPABILITY = {
	"/dashboard/analytics": "analytics.view",
	"/dashboard/ads": "agency.ads",
	"/dashboard/socials": "agency.socials",
	"/dashboard/proposals": "proposals.view",
	"/admin/clients": "admin.directory"
};
function normalizeAuthRole(role) {
	return normalizeRole(role);
}
function can(role, capability) {
	const normalized = normalizeAuthRole(role);
	return CAPABILITY_ROLES[capability].includes(normalized);
}
function capabilityForHref(href) {
	return HREF_CAPABILITY[href] ?? null;
}
/** Prefixes that require agency-only capabilities (Ads + Socials). */
function agencyOnlyPrefixes() {
	return ROUTE_ACCESS.flatMap((entry) => entry.capability === "agency.ads" || entry.capability === "agency.socials" ? [entry.prefix] : []);
}
function matchesRoutePrefix(pathname, prefix) {
	return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
function canAccessPath(role, pathname) {
	for (const entry of ROUTE_ACCESS) if (matchesRoutePrefix(pathname, entry.prefix)) return can(role, entry.capability);
	return true;
}
function navItemsForRole(role, groups = DASHBOARD_NAVIGATION_GROUPS) {
	const normalized = normalizeAuthRole(role);
	return groups.flatMap((group) => {
		const items = group.items.filter((item) => {
			const capability = item.capability ?? capabilityForHref(item.href);
			if (!capability) return true;
			return CAPABILITY_ROLES[capability].includes(normalized);
		});
		return items.length > 0 ? [{
			...group,
			items
		}] : [];
	});
}
function accessDeniedContentForCapability(capability, role) {
	if (capability === "admin.directory") return {
		title: "Administrator access required",
		message: "Client directory and workspace administration are limited to administrators.",
		actionLabel: "Back to For You",
		actionHref: "/for-you"
	};
	if (capability === "agency.ads" || capability === "agency.socials") return {
		title: "Agency tools only",
		message: role === "client" ? "Paid media and social sync tools are managed by your agency team. You can still view Analytics and shared Proposals for your workspace." : "This area is for agency team members with the right permissions.",
		actionLabel: "Back to For You",
		actionHref: "/for-you"
	};
	return {
		title: "Access restricted",
		message: "You don't have permission to view this page with your current role.",
		actionLabel: "Back to For You",
		actionHref: "/for-you"
	};
}
function accessDeniedContentForPath(pathname, role) {
	const normalized = normalizeAuthRole(role);
	for (const entry of ROUTE_ACCESS) if (matchesRoutePrefix(pathname, entry.prefix) && !can(normalized, entry.capability)) return accessDeniedContentForCapability(entry.capability, normalized);
	return null;
}
//#endregion
export { canAccessPath as a, normalizeAuthRole as c, can as i, accessDeniedContentForPath as n, capabilityForHref as o, agencyOnlyPrefixes as r, navItemsForRole as s, accessDeniedContentForCapability as t };
