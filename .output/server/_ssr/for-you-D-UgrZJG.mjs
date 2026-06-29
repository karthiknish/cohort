import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { in as LayoutDashboard } from "../_libs/lucide-react.mjs";
import { i as getButtonClasses } from "./dashboard-theme-DM5oBGdY.mjs";
import { t as Image } from "./image-Dd8IQpGx.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { n as ProtectedRoute, r as WorkspaceProviders, t as AgentModeDynamic } from "./workspace-providers-BRcwzunN.mjs";
import { t as NavigationProvider } from "./navigation-context-BLXaFSSv.mjs";
import { t as Route } from "./for-you-BXzSOpc_.mjs";
import { n as PreviewDataBanner, t as ClientAccessGate } from "./preview-data-banner-rcsSBOc7.mjs";
import { t as NetworkStatusBanner } from "./network-status-banner-BsNzhz2R.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/for-you-D-UgrZJG.js
var import_jsx_runtime = require_jsx_runtime();
/** Agent overlay for For You routes (same workspace context as dashboard). */
function ForYouAgentMode() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentModeDynamic, {});
}
function ForYouShell() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 border-b border-border/40 bg-background/95 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
				href: "/for-you",
				className: "flex shrink-0 items-center transition-opacity hover:opacity-80",
				"aria-label": "Cohorts home",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
					src: "/logo.svg",
					alt: "",
					width: 80,
					height: 80,
					className: "size-14 sm:h-16 sm:w-16",
					priority: true
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				variant: "outline",
				className: cn("shadow-sm", getButtonClasses("outline")),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
					href: "/dashboard",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, {
						"aria-hidden": "true",
						className: "mr-2 size-4"
					}), "Go to Dashboard"]
				})
			})]
		})
	});
}
/* @__NO_SIDE_EFFECTS__ */
function createMock(name) {
	const fn = function() {};
	fn.prototype.name = name;
	const children = Object.create(null);
	const proxy = new Proxy(fn, {
		get(_target, prop) {
			if (prop === "__esModule") return true;
			if (prop === "default") return proxy;
			if (prop === "caller") return null;
			if (prop === "then") return (f) => Promise.resolve(f(proxy));
			if (prop === "catch") return () => Promise.resolve(proxy);
			if (prop === "finally") return (f) => {
				f();
				return Promise.resolve(proxy);
			};
			if (prop === Symbol.toPrimitive) return () => {
				return "[import-protection mock]";
			};
			if (prop === "toString" || prop === "valueOf" || prop === "toJSON") return () => {
				return "[import-protection mock]";
			};
			if (typeof prop === "symbol") return void 0;
			if (!(prop in children)) children[prop] = /* @__PURE__ */ createMock(name + "." + prop);
			return children[prop];
		},
		apply() {
			return /* @__PURE__ */ createMock(name + "()");
		},
		construct() {
			return /* @__PURE__ */ createMock("new " + name);
		}
	});
	return proxy;
}
var mock = /* @__PURE__ */ createMock("mock");
function ForYouRoute() {
	const { allowPreviewAccess } = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtectedRoute, {
		allowPreviewAccess,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceProviders, {
			enablePreview: true,
			enableProject: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-h-screen bg-gradient-to-b from-primary/[0.04] via-background to-background",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetworkStatusBanner, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForYouShell, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewDataBanner, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientAccessGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pb-12 pt-6 sm:pt-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(mock, {})
						}) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForYouAgentMode, {})
				]
			}) })
		})
	});
}
//#endregion
export { ForYouRoute as component };
