import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { p as interactiveTransitionClass } from "./motion-Cf6ujF0h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-DuOB9ezo.js
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		"data-slot": "input",
		className: cn("file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground border border-input bg-background h-9 w-full min-w-0 rounded-md px-3 py-1 text-base shadow-xs outline outline-1 outline-transparent file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50 md:text-sm", "focus-ring-subtle focus-visible:border-primary hover:border-muted-foreground/30", "aria-invalid:ring-destructive/20 aria-invalid:border-destructive aria-invalid:outline-destructive/50", interactiveTransitionClass, className),
		...props
	});
}
//#endregion
export { Input as t };
