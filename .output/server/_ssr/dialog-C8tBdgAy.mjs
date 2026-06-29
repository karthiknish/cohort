import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { T as surfaceMotionClasses, p as interactiveTransitionClass } from "./motion-Cf6ujF0h.mjs";
import { d as Description, f as Overlay, g as Trigger, h as Title, l as Close, m as Root, p as Portal, u as Content } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as X } from "../_libs/lucide-react.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Root;
var DialogTrigger = Trigger;
var DialogPortal = Portal;
var DialogClose = Close;
var DialogOverlay = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay, {
	ref,
	className: cn("fixed inset-0 z-[1100] bg-background/80 backdrop-blur-sm", surfaceMotionClasses.overlay, className),
	...props
});
DialogOverlay.displayName = Overlay.displayName;
var DialogContent = ({ className, children, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Content, {
	ref,
	className: cn("focus-ring fixed left-1/2 top-1/2 z-[1100] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-border bg-background p-6 shadow-lg sm:rounded-xl max-h-[85vh] overflow-y-auto", surfaceMotionClasses.modalContent, className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Close, {
		className: cn("focus-ring absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100", interactiveTransitionClass),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] });
DialogContent.displayName = Content.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
});
DialogTitle.displayName = Title.displayName;
var DialogDescription = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
});
DialogDescription.displayName = Description.displayName;
//#endregion
export { DialogFooter as a, DialogTrigger as c, DialogDescription as i, DialogClose as n, DialogHeader as o, DialogContent as r, DialogTitle as s, Dialog as t };
