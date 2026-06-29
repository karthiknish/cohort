import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { p as interactiveTransitionClass } from "./motion-Cf6ujF0h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/textarea-C0M2IvQZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = ({ className, autoGrow, onChange, ref, ...props }) => {
	const internalRef = import_react.useRef(null);
	const handleTextareaRef = (node) => {
		internalRef.current = node;
		if (typeof ref === "function") {
			ref(node);
			return;
		}
		if (ref) ref.current = node;
	};
	const onTextareaChange = (e) => {
		if (autoGrow && internalRef.current) {
			const textarea = internalRef.current;
			textarea.style.cssText = "height:auto";
			textarea.style.cssText = `height:${textarea.scrollHeight}px`;
		}
		onChange?.(e);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		ref: handleTextareaRef,
		className: cn("flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60", "focus-ring-subtle focus-visible:border-primary hover:border-muted-foreground/30", "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50", "resize-y", autoGrow && "resize-none overflow-hidden", interactiveTransitionClass, className),
		onChange: onTextareaChange,
		...props
	});
};
Textarea.displayName = "Textarea";
//#endregion
export { Textarea as t };
