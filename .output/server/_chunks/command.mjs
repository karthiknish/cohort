import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { Y as Search } from "../_libs/lucide-react.mjs";
import { t as _e } from "../_libs/cmdk.mjs";
import { t as cn } from "./utils.mjs";
import { y as interactiveTransitionClass } from "./motion.mjs";
import { t as menuItemHighlightClass } from "./menu-highlight.mjs";
import { i as DialogDescription, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var Command = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e, {
	ref,
	className: cn("flex size-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", interactiveTransitionClass, className),
	...props
});
Command.displayName = _e.displayName;
var CommandDialog = ({ children, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "overflow-hidden p-0 shadow-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "sr-only",
					children: "Command Menu"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "sr-only",
					children: "Quickly search for pages, actions, and settings."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Command, {
					className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
					children
				})
			]
		})
	});
};
var CommandInput = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "flex items-center border-b px-3",
	"data-cmdk-input-wrapper": "",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
		className: "mr-2 size-4 shrink-0 opacity-50",
		"aria-hidden": true
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
		ref,
		className: cn("focus-ring-subtle flex h-11 w-full rounded-md bg-transparent py-3 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className),
		"aria-label": props["aria-label"] ?? "Command menu search",
		...props
	})]
});
CommandInput.displayName = _e.Input.displayName;
var CommandList = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.List, {
	ref,
	className: cn("max-h-[min(360px,55dvh)] overflow-y-auto overflow-x-hidden", className),
	...props
});
CommandList.displayName = _e.List.displayName;
var CommandEmpty = ({ ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Empty, {
	ref,
	className: "py-6 text-center text-sm",
	...props
});
CommandEmpty.displayName = _e.Empty.displayName;
var CommandGroup = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
	ref,
	className: cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className),
	...props
});
CommandGroup.displayName = _e.Group.displayName;
var CommandSeparator = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Separator, {
	ref,
	className: cn("-mx-1 h-px bg-border", className),
	...props
});
CommandSeparator.displayName = _e.Separator.displayName;
var CommandItem = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Item, {
	ref,
	className: cn(menuItemHighlightClass, "text-popover-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm data-[disabled=true]:pointer-events-none data-[selected=true]:bg-muted data-[selected=true]:text-foreground data-[disabled=true]:opacity-50", className),
	...props
});
CommandItem.displayName = _e.Item.displayName;
var CommandShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest text-muted-foreground", className),
		...props
	});
};
CommandShortcut.displayName = "CommandShortcut";
//#endregion
export { CommandInput as a, CommandSeparator as c, CommandGroup as i, CommandShortcut as l, CommandDialog as n, CommandItem as o, CommandEmpty as r, CommandList as s, Command as t };
