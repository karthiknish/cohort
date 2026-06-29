import { S as require_jsx_runtime, u as useQuery } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { m as getPreviewAdminDashboardData } from "./preview-data-CXkRNfsX.mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as usePaginatedQuery } from "../_libs/convex.mjs";
import { n as api } from "./rate-limiter-convex-Dr72h9nD.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { Br as ArrowUpRight, Jr as Activity, V as ShieldCheck, cr as CircleAlert, h as UserCheck, nn as Lightbulb, pr as ChevronRight, u as Users } from "../_libs/lucide-react.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as AdminHomePageSkeleton } from "./admin-home-page-skeleton-CzbydecP.mjs";
import { t as AdminPageShell } from "./admin-page-shell-DKKo3NPm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-C2_-4viB.js
var import_jsx_runtime = require_jsx_runtime();
var adminLinks = [
	{
		title: "Team",
		href: "/admin/team",
		icon: Users,
		description: "Members and roles"
	},
	{
		title: "Users",
		href: "/admin/users",
		icon: UserCheck,
		description: "Approvals and access"
	},
	{
		title: "Clients",
		href: "/admin/clients",
		icon: ShieldCheck,
		description: "Workspaces"
	},
	{
		title: "Features",
		href: "/admin/features",
		icon: Lightbulb,
		description: "Roadmap board"
	},
	{
		title: "Health",
		href: "/admin/health",
		icon: Activity,
		description: "System status"
	},
	{
		title: "Issues",
		href: "/admin/issues",
		icon: CircleAlert,
		description: "User reports"
	}
];
var ADMIN_WORKSPACE_LINK_ACTION = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
	asChild: true,
	variant: "ghost",
	size: "sm",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
		href: "/dashboard",
		children: ["Workspace", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" })]
	})
});
function AdminPage() {
	const { user } = useAuth();
	const { isPreviewMode } = usePreview();
	const previewStats = getPreviewAdminDashboardData().stats;
	const workspaceContext = useQuery(api.users.getMyWorkspaceContext, !isPreviewMode && user ? {} : "skip");
	const workspaceId = workspaceContext?.workspaceId ?? null;
	const includeAllWorkspaces = workspaceContext?.role === "admin";
	const { results: usersPage } = usePaginatedQuery(api.adminUsers.listUsers, !isPreviewMode && workspaceId ? {
		workspaceId,
		includeAllWorkspaces
	} : "skip", { initialNumItems: 50 });
	const clientsRealtime = useQuery(api.clients.list, !isPreviewMode && workspaceId ? {
		workspaceId,
		limit: 100,
		includeAllWorkspaces
	} : "skip");
	const stats = (() => {
		if (isPreviewMode) return previewStats;
		const users = Array.isArray(usersPage) ? usersPage : [];
		const clients = Array.isArray(clientsRealtime?.items) ? clientsRealtime.items : [];
		return {
			totalUsers: users.length,
			activeUsers: users.filter((u) => u.status === "active").length,
			totalClients: clients.length
		};
	})();
	const statsLoading = !isPreviewMode && (usersPage === void 0 || clientsRealtime === void 0);
	if (!user && !isPreviewMode) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[50vh] items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Sign in with an admin account to continue."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					href: "/auth",
					children: "Sign in"
				})
			})]
		})
	});
	const firstName = (user?.name ?? "Admin").split(" ")[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: statsLoading,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminHomePageSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminPageShell, {
			title: "Admin",
			description: `${firstName}, pick a section below.`,
			isPreviewMode,
			actions: ADMIN_WORKSPACE_LINK_ACTION,
			className: "mx-auto max-w-lg space-y-6",
			headerClassName: "border-0 pb-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "sr-only",
					children: "Users"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-foreground",
						children: statsLoading ? "—" : stats.totalUsers
					}),
					" ",
					"users",
					!statsLoading && stats.totalUsers > stats.activeUsers ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground/80",
						children: [
							" ",
							"· ",
							stats.totalUsers - stats.activeUsers,
							" pending"
						]
					}) : null
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "sr-only",
					children: "Clients"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-foreground",
						children: statsLoading ? "—" : stats.totalClients
					}),
					" ",
					"clients"
				] })] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Admin sections",
				className: "divide-y divide-border rounded-lg border border-border",
				children: adminLinks.map(({ title, href, icon: Icon, description }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
					href,
					className: cn("flex items-center gap-4 px-4 py-3.5 transition-colors", "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-4 shrink-0 text-muted-foreground",
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-medium text-foreground",
								children: title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-xs text-muted-foreground",
								children: description
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
							className: "size-4 shrink-0 text-muted-foreground",
							"aria-hidden": true
						})
					]
				}, href))
			})]
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPage, {});
//#endregion
export { SplitComponent as component };
