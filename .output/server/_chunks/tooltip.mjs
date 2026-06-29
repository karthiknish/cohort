import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { a as Trigger, i as Root3, n as Portal, r as Provider, t as Content2 } from "../_libs/radix-ui__react-tooltip.mjs";
import { t as cn } from "./utils.mjs";
import { E as surfaceMotionClasses } from "./motion.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var TooltipProvider = Provider;
var Tooltip = Root3;
var TooltipTrigger = Trigger;
var TooltipContent = ({ className, sideOffset = 4, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-[100] overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md", surfaceMotionClasses.popoverContent, className),
	...props
}) });
TooltipContent.displayName = Content2.displayName;
//#endregion
export { TooltipTrigger as i, TooltipContent as n, TooltipProvider as r, Tooltip as t };
