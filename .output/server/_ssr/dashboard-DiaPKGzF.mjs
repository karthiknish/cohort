import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { m as Outlet } from "../_libs/@tanstack/react-router+[...].mjs";
import "./preview-data-CXkRNfsX.mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { n as usePathname } from "./navigation-C1M-rNAu.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { t as ScrollArea } from "./scroll-area-DnXuhDTw.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { n as ProtectedRoute, r as WorkspaceProviders, t as AgentModeDynamic } from "./workspace-providers-BRcwzunN.mjs";
import { t as NavigationProvider } from "./navigation-context-BLXaFSSv.mjs";
import { a as canAccessPath, c as normalizeAuthRole, i as can, n as accessDeniedContentForPath, r as agencyOnlyPrefixes, t as accessDeniedContentForCapability } from "./dashboard-access-q6oyjv-c.mjs";
import { n as Route } from "./dashboard-Db68lNqx.mjs";
import { a as useDashboardRoleAccent, i as Sidebar, n as Header, r as NavigationBreadcrumbs } from "./breadcrumbs-j0-fuXNN.mjs";
import { n as PreviewDataBanner, t as ClientAccessGate } from "./preview-data-banner-rcsSBOc7.mjs";
import { t as NetworkStatusBanner } from "./network-status-banner-BsNzhz2R.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-DiaPKGzF.js
var import_jsx_runtime = require_jsx_runtime();
function AccessDeniedPanel({ title, message, actionLabel, actionHref }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-12 text-center",
		"aria-live": "polite",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold text-foreground",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm text-muted-foreground",
				children: message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "default",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					href: actionHref,
					children: actionLabel
				})
			})
		]
	});
}
function RoleAccessLoadingState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
		className: "mx-auto block w-full max-w-3xl space-y-4 py-10",
		"aria-live": "polite",
		"aria-busy": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-lg" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full rounded-lg" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Checking access permissions…"
			})
		]
	});
}
function RoleAccessGate({ children, capability, pathnamePrefix, fallback }) {
	const pathname = usePathname();
	const { user, loading } = useAuth();
	if (!(!pathnamePrefix || pathname === pathnamePrefix || pathname.startsWith(`${pathnamePrefix}/`)) && !capability) return children;
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleAccessLoadingState, {});
	const role = normalizeAuthRole(user?.role);
	const deniedByPath = capability ? null : accessDeniedContentForPath(pathname, role);
	const denied = (capability && !can(role, capability) ? accessDeniedContentForCapability(capability, role) : null) ?? deniedByPath ?? (capability === void 0 && !canAccessPath(role, pathname) ? accessDeniedContentForPath(pathname, role) : null);
	if (denied) {
		if (fallback) return fallback;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessDeniedPanel, {
			title: denied.title,
			message: denied.message,
			actionLabel: denied.actionLabel,
			actionHref: denied.actionHref
		});
	}
	return children;
}
function isAgencyOnlyPath(pathname) {
	return agencyOnlyPrefixes().some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
/** Blocks client users from agency-only dashboard routes (Ads, Socials). */
function DashboardAgencyRoutesGate({ children }) {
	if (!isAgencyOnlyPath(usePathname())) return children;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleAccessGate, { children });
}
/**
* Wraps dashboard main scroll content with a subtle role-colored top treatment
* so pages feel visually anchored to the signed-in role (admin / team / client).
*/
function DashboardMainRoleFrame({ children }) {
	const accent = useDashboardRoleAccent();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mx-auto min-size-full max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8", accent.mainFrameClass),
		"data-dashboard-role": accent.key,
		children
	});
}
function WorkspaceLayoutInner({ children, allowPreviewAccess }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtectedRoute, {
		allowPreviewAccess,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceProviders, {
			enablePreview: true,
			enableProject: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex min-h-screen bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-0 w-full flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-0 flex-1 flex-col bg-muted/20",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetworkStatusBanner, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
								className: "min-h-0 flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "min-h-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardMainRoleFrame, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationBreadcrumbs, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewDataBanner, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientAccessGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardAgencyRoutesGate, { children }) })
									] })
								})
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentModeDynamic, {})]
			}) })
		})
	});
}
function DashboardLayoutRoute() {
	const { allowPreviewAccess } = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceLayoutInner, {
		allowPreviewAccess,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
//#endregion
export { DashboardLayoutRoute as component };
