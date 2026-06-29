import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { l as emptyStateEnterClass } from "./motion-Cf6ujF0h.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import "./navigation-C1M-rNAu.mjs";
import { dn as Inbox, lt as Plus } from "../_libs/lucide-react.mjs";
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
export { NoDataEmptyState as n, EmptyState as t };
