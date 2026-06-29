import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { t as PageMotionShell } from "./page-motion-shell-Ci2leIYf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-page-shell-DKKo3NPm.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Shared admin page chrome: eyebrow, title, optional preview badge, description, actions, then main content.
*/
function AdminPageShell({ title, description, actions, children, className, headerClassName, isPreviewMode }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("w-full space-y-6", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: cn("flex flex-col gap-3 border-b border-border/60 pb-6 sm:flex-row sm:items-start sm:justify-between", headerClassName),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-balance text-2xl font-semibold tracking-tight text-foreground",
						children: title
					}), isPreviewMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "shrink-0 text-[10px] font-medium uppercase",
						children: "Preview"
					}) : null]
				}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-xl text-sm text-muted-foreground",
					children: description
				}) : null]
			}), actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex shrink-0 flex-wrap items-center gap-2 sm:justify-end",
				children: actions
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionShell, {
			reveal: false,
			className: "space-y-6",
			children
		})]
	});
}
//#endregion
export { AdminPageShell as t };
