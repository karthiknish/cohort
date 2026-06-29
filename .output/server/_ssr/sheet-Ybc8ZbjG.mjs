import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { T as surfaceMotionClasses, p as interactiveTransitionClass } from "./motion-Cf6ujF0h.mjs";
import { d as Description, f as Overlay, g as Trigger, h as Title, l as Close, m as Root, p as Portal, u as Content } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as X } from "../_libs/lucide-react.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Sheet({ modal = true, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		"data-slot": "sheet",
		modal,
		...props
	});
}
function SheetTrigger({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		"data-slot": "sheet-trigger",
		...props
	});
}
function SheetClose({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Close, {
		"data-slot": "sheet-close",
		...props
	});
}
function SheetPortal({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, {
		"data-slot": "sheet-portal",
		...props
	});
}
function SheetOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay, {
		"data-slot": "sheet-overlay",
		className: cn("fixed inset-0 z-[1500] bg-black/50", surfaceMotionClasses.overlay, className),
		...props
	});
}
function SheetContent({ className, children, side = "right", showOverlay = true, overlayClassName, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [showOverlay ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, { className: overlayClassName }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Content, {
		"data-slot": "sheet-content",
		className: cn("bg-background fixed z-[1500] flex flex-col gap-4 shadow-lg", surfaceMotionClasses.sheetContent, side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm", side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm", side === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b", side === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Close, {
			className: cn("ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none", interactiveTransitionClass),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "sheet-header",
		className: cn("flex flex-col gap-1.5 p-4", className),
		...props
	});
}
function SheetTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {
		"data-slot": "sheet-title",
		className: cn("text-foreground font-semibold", className),
		...props
	});
}
function SheetDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description, {
		"data-slot": "sheet-description",
		className: cn("text-muted-foreground text-sm", className),
		...props
	});
}
//#endregion
export { SheetHeader as a, SheetDescription as i, SheetClose as n, SheetTitle as o, SheetContent as r, SheetTrigger as s, Sheet as t };
