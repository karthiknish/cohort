import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { g as createFileRoute, h as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-Dx6vkhkr.js
var import_jsx_runtime = require_jsx_runtime();
var FIELD_SLOTS = [
	"field-1",
	"field-2",
	"field-3"
];
function AuthPageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-muted/40 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-xl border border-border/60 bg-background p-6 shadow-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto flex size-16 items-center justify-center rounded-full bg-muted/60",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-8 rounded-full" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mx-auto h-7 w-40" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mx-auto h-4 w-64" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 space-y-4",
					children: FIELD_SLOTS.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-11 w-full rounded-md" })]
					}, slot))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-11 w-full rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-11 w-full rounded-md" })]
				})
			]
		})
	});
}
var $$splitComponentImporter = () => import("./reset-DZ0faIhI.mjs");
var Route = createFileRoute("/auth/reset")({
	validateSearch: (search) => ({ oobCode: typeof search.oobCode === "string" ? search.oobCode : void 0 }),
	head: () => ({ meta: [{ title: "Reset Password | Cohorts" }, {
		name: "description",
		content: "Set a new password for your Cohorts account using a secure reset link."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as n, AuthPageSkeleton as t };
