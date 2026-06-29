import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { T as surfaceMotionClasses, p as interactiveTransitionClass } from "./motion-Cf6ujF0h.mjs";
import { t as menuItemHighlightClass } from "./menu-highlight-VIj2_noi.mjs";
import { gr as Check, hr as ChevronDown } from "../_libs/lucide-react.mjs";
import { a as ItemText, c as Root2, d as Value, f as Viewport, i as ItemIndicator, l as Separator, n as Icon, o as Label, r as Item, s as Portal, t as Content2, u as Trigger } from "../_libs/@radix-ui/react-select+[...].mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var Select = Root2;
var SelectValue = Value;
var SelectTrigger = ({ className, children, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Trigger, {
	ref,
	className: cn("focus-ring flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", interactiveTransitionClass, className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 opacity-50" })
	})]
});
SelectTrigger.displayName = Trigger.displayName;
var SelectContent = ({ className, children, position = "popper", ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: cn("relative z-[3000] min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md", surfaceMotionClasses.popoverContent, position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
		className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
		children
	})
}) });
SelectContent.displayName = Content2.displayName;
var SelectLabel = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold text-muted-foreground", className),
	...props
});
SelectLabel.displayName = Label.displayName;
var SelectItem = ({ className, children, hideIndicator = false, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Item, {
	ref,
	className: cn(menuItemHighlightClass, "text-popover-foreground relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50", hideIndicator ? "pl-2" : "pl-8", className),
	...props,
	children: [!hideIndicator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex size-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemText, { children })]
});
SelectItem.displayName = Item.displayName;
var SelectSeparator = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
});
SelectSeparator.displayName = Separator.displayName;
//#endregion
export { SelectValue as a, SelectTrigger as i, SelectContent as n, SelectItem as r, Select as t };
