import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { g as createFileRoute, h as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Cbx5Q3_U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/for-you-BXzSOpc_.js
var import_jsx_runtime = require_jsx_runtime();
function ForYouPageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-56" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-28" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: [
						"c1",
						"c2",
						"c3",
						"c4"
					].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[7.5rem] w-[8.5rem] shrink-0 rounded-xl" }, key))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-24" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
					children: [
						"q1",
						"q2",
						"q3",
						"q4"
					].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-xl" }, key))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full rounded-xl" })]
			})
		]
	});
}
function ForYouLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForYouPageSkeleton, {});
}
var $$splitErrorComponentImporter = () => import("./for-you-DB5Xj1NE.mjs");
var $$splitComponentImporter = () => import("./for-you-D-UgrZJG.mjs");
var loadForYouShell = createServerFn({ method: "GET" }).handler(createSsrRpc("cb8400d153858d0c7c505ef2df068d6e4ac480e22d7719b110e057a063552f14"));
var Route = createFileRoute("/_authed/for-you")({
	loader: () => loadForYouShell(),
	head: () => ({ meta: [{ title: "For You | Cohorts" }, {
		name: "description",
		content: "Review your activity feed, client work, meeting momentum, and dashboard priorities in one place."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	pendingComponent: ForYouLoading
});
//#endregion
export { Route as t };
