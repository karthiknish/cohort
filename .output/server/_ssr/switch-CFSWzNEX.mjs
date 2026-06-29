import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { E as switchMotionClass } from "./motion-Cf6ujF0h.mjs";
import { n as Thumb, t as Root } from "../_libs/radix-ui__react-switch.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var Switch = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	className: cn("focus-ring-subtle peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", switchMotionClass, className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thumb, { className: cn("pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0", switchMotionClass) })
});
Switch.displayName = Root.displayName;
//#endregion
export { Switch as t };
