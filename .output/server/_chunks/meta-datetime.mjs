import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { dn as Inbox, lt as Plus } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils.mjs";
import { v as emptyStateEnterClass } from "./motion.mjs";
import { t as Button } from "./button.mjs";
import "./navigation.mjs";
import { a as FieldGroup, i as FieldError, n as FieldContent, o as FieldLabel, r as FieldDescription, s as FieldTitle, t as Field } from "./field.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function EmptyState({ className, icon: Icon = Inbox, title, description, action, secondaryAction, variant = "default", ...props }) {
	const ActionIcon = action?.icon || Plus;
	if (variant === "inline") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4", className),
		...props,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-10 shrink-0 items-center justify-center rounded-full bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-muted-foreground" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-foreground",
					children: title
				}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-sm text-muted-foreground line-clamp-1",
					children: description
				})]
			}),
			action && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: action.onClick,
				size: "sm",
				variant: "outline",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionIcon, { className: "mr-1.5 size-3.5" }), action.label]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col items-center justify-center text-center", emptyStateEnterClass, variant === "card" && "rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10", variant === "default" ? "py-12 px-4" : "p-8", className),
		...props,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-14 items-center justify-center rounded-full bg-muted/80 ring-4 ring-muted/40 mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-7 text-muted-foreground" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-base font-semibold text-foreground",
				children: title
			}),
			description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed",
				children: description
			}),
			(action || secondaryAction) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex items-center gap-3",
				children: [action && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: action.onClick,
					size: "sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionIcon, { className: "mr-1.5 size-4" }), action.label]
				}), secondaryAction && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: secondaryAction.onClick,
					size: "sm",
					variant: "ghost",
					children: secondaryAction.label
				})]
			})
		]
	});
}
function NoDataEmptyState(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: Inbox,
		title: "No data available",
		description: "Data will appear here once it's been added.",
		...props
	});
}
//#endregion
//#region src/shared/ui/form-field.tsx
/** Standard label + description + error + control layout using Field primitives. */
function FormField({ id, label, description, error, labelPrefix, children, orientation = "vertical", className, labelVariant = "label" }) {
	const labelNode = labelVariant === "title" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldTitle, { children: label }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldLabel, {
		htmlFor: id,
		className: cn(labelPrefix && "flex items-center gap-2"),
		children: [labelPrefix, label]
	});
	if (orientation === "horizontal" || orientation === "responsive") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
		orientation,
		className: cn("items-center justify-between", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldContent, {
			className: "flex-1",
			children: [
				labelNode,
				description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldDescription, { children: description }) : null,
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldError, { children: error }) : null
			]
		}), children]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
		orientation,
		className,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldContent, { children: [
			labelNode,
			description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldDescription, { children: description }) : null,
			children,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldError, { children: error }) : null
		] })
	});
}
/** Section heading + description + controls (multi-select grids, etc.). */
function FieldSection({ title, description, error, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldGroup, {
		className,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldTitle, { children: title }),
			description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldDescription, { children: description }) : null,
			children,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldError, { children: error }) : null
		] }) })
	});
}
//#endregion
//#region src/lib/meta-datetime.ts
/** Convert a browser `datetime-local` value to Meta-compatible ISO 8601 UTC. */
function metaDatetimeLocalToIso(value) {
	const trimmed = value.trim();
	if (!trimmed) return void 0;
	const parsed = new Date(trimmed);
	if (Number.isNaN(parsed.getTime())) return void 0;
	return parsed.toISOString();
}
/** Convert Meta ISO timestamp to `datetime-local` input value (local timezone). */
function metaIsoToDatetimeLocal(value) {
	if (!value?.trim()) return "";
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return "";
	const pad = (n) => String(n).padStart(2, "0");
	return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}
//#endregion
export { EmptyState as a, FormField as i, metaIsoToDatetimeLocal as n, NoDataEmptyState as o, FieldSection as r, metaDatetimeLocalToIso as t };
