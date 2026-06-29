import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { p as interactiveTransitionClass } from "./motion-Cf6ujF0h.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = ({ className, checked, onCheckedChange, onChange, ref, ...props }) => {
	const onCheckboxChange = (e) => {
		onChange?.(e);
		onCheckedChange?.(e.target.checked);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref,
		type: "checkbox",
		checked,
		onChange: onCheckboxChange,
		className: cn("size-4 rounded border border-input bg-background text-primary shadow-sm focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", interactiveTransitionClass, className),
		...props
	});
};
Checkbox.displayName = "Checkbox";
//#endregion
export { Checkbox as t };
