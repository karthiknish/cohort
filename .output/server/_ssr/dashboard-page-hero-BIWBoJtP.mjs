import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as DASHBOARD_THEME } from "./dashboard-theme-DM5oBGdY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-page-hero-BIWBoJtP.js
var import_jsx_runtime = require_jsx_runtime();
function DashboardPageHero({ children, className, innerClassName, glowClassName, as: Component = "header" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Component, {
		className: cn(DASHBOARD_THEME.pageHero, className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn(DASHBOARD_THEME.pageHeroGlow, glowClassName),
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn(DASHBOARD_THEME.pageHeroInner, innerClassName),
			children
		})]
	});
}
//#endregion
export { DashboardPageHero as t };
