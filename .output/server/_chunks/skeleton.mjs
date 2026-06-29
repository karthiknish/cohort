import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { t as cn } from "./utils.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Skeleton({ className, variant = "shimmer", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative overflow-hidden rounded-md bg-muted", variant === "shimmer" && "before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_var(--motion-duration-shimmer)_var(--motion-ease-in-out)_infinite] before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/20 before:to-transparent before:content-[\"\"] motion-reduce:before:animate-none", variant === "pulse" && "animate-pulse", className),
		...props
	});
}
function SkeletonCard({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-3 rounded-lg border p-4", className),
		...props,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-1/3" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-full" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-2/3" })]
			})
		]
	});
}
var SKELETON_SLOT_KEYS = [
	"slot-a",
	"slot-b",
	"slot-c",
	"slot-d",
	"slot-e",
	"slot-f",
	"slot-g",
	"slot-h",
	"slot-i",
	"slot-j",
	"slot-k",
	"slot-l"
];
function SkeletonTable({ rows = 5, columns = 4, showHeader = true, className, ...props }) {
	const headerKeys = SKELETON_SLOT_KEYS.slice(0, columns);
	const rowKeys = SKELETON_SLOT_KEYS.slice(0, rows);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-3", className),
		...props,
		children: [showHeader && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-4 border-b pb-2",
			children: headerKeys.map((headerKey) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 flex-1" }, headerKey))
		}), rowKeys.map((rowKey) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-4 py-2",
			children: headerKeys.map((columnKey) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 flex-1" }, `${rowKey}-${columnKey}`))
		}, rowKey))]
	});
}
function SkeletonList({ items = 5, showAvatar = true, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("space-y-4", className),
		...props,
		children: Array.from({ length: items }, (_, item) => `list-item-${item + 1}`).map((itemKey) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [showAvatar && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-10 shrink-0 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-3/4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-1/2" })]
			})]
		}, itemKey))
	});
}
function SkeletonDashboardCard({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-4 rounded-lg border bg-card p-6", className),
		...props,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-8 rounded-full" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-24" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-2 w-full" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-3 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-20" })]
			})
		]
	});
}
[
	45,
	70,
	30,
	85,
	55,
	40,
	75,
	60,
	35,
	80,
	50,
	65
].map((height, slot) => ({
	id: `chart-bar-${slot + 1}`,
	height
}));
//#endregion
export { SkeletonTable as a, SkeletonList as i, SkeletonCard as n, SkeletonDashboardCard as r, Skeleton as t };
