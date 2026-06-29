import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { T as surfaceMotionClasses } from "./motion-Cf6ujF0h.mjs";
import { un as Info } from "../_libs/lucide-react.mjs";
import { i as Trigger, n as Portal, r as Root2, t as Content2 } from "../_libs/radix-ui__react-hover-card.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function HoverCardTrigger({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		"data-slot": "hover-card-trigger",
		...props
	});
}
function HoverCardContent({ className, align = "center", sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		"data-slot": "hover-card-content",
		align,
		sideOffset,
		className: cn("z-[1200] w-64 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none", surfaceMotionClasses.popoverContent, className),
		...props
	}) });
}
function HoverCard({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2, {
		"data-slot": "hover-card",
		openDelay: 200,
		closeDelay: 100,
		...props
	});
}
function HoverPreview({ trigger, children, side = "top", align = "center", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HoverCard, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverCardTrigger, {
		asChild: true,
		children: trigger
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverCardContent, {
		side,
		align,
		className: cn("text-sm leading-relaxed", className),
		children
	})] });
}
function TruncatedTextPreviewTrigger({ text, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: cn("block min-w-0 truncate text-left", className),
		children: text
	});
}
/** Truncated inline text that expands in a hover card — no navigation. */
function TruncatedTextPreview({ text, className, detail }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HoverPreview, {
		trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TruncatedTextPreviewTrigger, {
			text,
			className
		}),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium text-foreground",
			children: text
		}), detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 text-xs text-muted-foreground",
			children: detail
		}) : null]
	});
}
function MetricHintTrigger({ description, label, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: cn("inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
		"aria-label": label ?? description,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
			className: "size-3",
			"aria-hidden": true
		})
	});
}
/** Info icon with metric/KPI explanation on hover (replaces tooltip-only hints). */
function MetricHint({ description, label, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverPreview, {
		trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricHintTrigger, {
			description,
			label,
			className
		}),
		className: "max-w-xs",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs leading-relaxed text-muted-foreground",
			children: description
		})
	});
}
function MetricCardPreviewTrigger({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "cursor-default",
		children
	});
}
/** Wraps a KPI/metric card so the full explanation appears on hover. */
function MetricCardPreview({ children, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverPreview, {
		trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCardPreviewTrigger, { children }),
		className: "max-w-xs",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs leading-relaxed",
			children: description
		})
	});
}
//#endregion
export { TruncatedTextPreview as i, MetricCardPreview as n, MetricHint as r, HoverPreview as t };
