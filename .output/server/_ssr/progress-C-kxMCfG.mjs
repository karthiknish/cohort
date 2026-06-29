import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { p as interactiveTransitionClass } from "./motion-Cf6ujF0h.mjs";
import { n as Root, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function getProgressTransformStyle(value) {
	return { transform: `translateX(-${100 - (value || 0)}%)` };
}
var Progress = ({ className, value, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
		className: cn("size-full flex-1 bg-primary", interactiveTransitionClass),
		style: getProgressTransformStyle(value)
	})
});
Progress.displayName = Root.displayName;
//#endregion
export { Progress as t };
