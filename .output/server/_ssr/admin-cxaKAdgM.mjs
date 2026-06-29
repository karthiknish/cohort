import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { l as useLocation, m as Outlet, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { Jr as Activity, Ur as ArrowLeft, V as ShieldCheck, cr as CircleAlert, h as UserCheck, in as LayoutDashboard, nn as Lightbulb, pr as ChevronRight, u as Users } from "../_libs/lucide-react.mjs";
import { t as Route } from "./admin-CkvbzYqW.mjs";
import { n as ProtectedRoute, r as WorkspaceProviders, t as AgentModeDynamic } from "./workspace-providers-BRcwzunN.mjs";
import { t as NavigationProvider } from "./navigation-context-BLXaFSSv.mjs";
import { a as BreadcrumbPage, i as BreadcrumbList, n as BreadcrumbItem, o as BreadcrumbSeparator, r as BreadcrumbLink, t as Breadcrumb } from "./breadcrumb-BgxviZMU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-cxaKAdgM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var adminNavItems = [
	{
		title: "Overview",
		href: "/admin",
		icon: LayoutDashboard
	},
	{
		title: "Team",
		href: "/admin/team",
		icon: Users
	},
	{
		title: "Users",
		href: "/admin/users",
		icon: UserCheck
	},
	{
		title: "Clients",
		href: "/admin/clients",
		icon: ShieldCheck
	},
	{
		title: "Features",
		href: "/admin/features",
		icon: Lightbulb
	},
	{
		title: "Health",
		href: "/admin/health",
		icon: Activity
	},
	{
		title: "Issues",
		href: "/admin/issues",
		icon: CircleAlert
	}
];
function AdminNav() {
	const pathname = useLocation().pathname;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: "mx-auto flex w-full max-w-7xl flex-nowrap items-center gap-1 px-4 py-2 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "ghost",
				size: "sm",
				className: "shrink-0 gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/dashboard",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: "Dashboard"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-1 hidden h-6 w-px shrink-0 bg-border sm:block",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1 [&::-webkit-scrollbar]:hidden",
				children: adminNavItems.map((item) => {
					const isActive = pathname === item.href || item.href !== "/admin" && pathname.startsWith(item.href);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: isActive ? "secondary" : "ghost",
						size: "sm",
						className: cn("shrink-0 gap-2 rounded-md", isActive && "bg-accent/10 text-primary shadow-sm hover:bg-accent/15"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.href,
							className: "whitespace-nowrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.title })]
						})
					}, item.href);
				})
			})
		]
	});
}
function AdminBreadcrumb() {
	const segments = useLocation().pathname.split("/").filter(Boolean);
	const breadcrumbs = [];
	if (segments[0] === "_authed" && segments[1] === "admin") {
		breadcrumbs.push({
			title: "Admin",
			href: "/admin"
		});
		if (segments[2]) {
			const navItem = adminNavItems.find((item) => item.href === `/admin/${segments[2]}`);
			if (navItem) breadcrumbs.push({
				title: navItem.title,
				href: navItem.href
			});
		}
	}
	if (breadcrumbs.length <= 1) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumb, {
		className: "mx-auto max-w-7xl border-t border-border/40 px-4 py-2 text-sm sm:px-6 lg:px-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreadcrumbList, { children: breadcrumbs.map((crumb, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreadcrumbItem, { children: index < breadcrumbs.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreadcrumbLink, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: crumb.href,
				children: crumb.title
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreadcrumbPage, { children: crumb.title }) }), index < breadcrumbs.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreadcrumbSeparator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" }) })] }, crumb.href)) })
	});
}
function AdminLayoutRoute() {
	const { allowPreviewAccess } = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtectedRoute, {
		requiredRole: "admin",
		allowPreviewAccess,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceProviders, {
			enablePreview: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-h-dvh bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "min-h-dvh",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminNav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBreadcrumb, {})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentModeDynamic, {})]
			}) })
		})
	});
}
//#endregion
export { AdminLayoutRoute as component };
