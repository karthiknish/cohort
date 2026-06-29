import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { t as Root } from "../_libs/radix-ui__react-separator.mjs";
import { t as cn } from "./utils.mjs";
import { t as Label } from "./label.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Separator({ className, orientation = "horizontal", decorative = true, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		"data-slot": "separator",
		decorative,
		orientation,
		className: cn("bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px", className),
		...props
	});
}
//#endregion
//#region src/shared/ui/field.tsx
function FieldGroup({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "field-group",
		className: cn("flex w-full flex-col gap-4", className),
		...props
	});
}
function Field({ className, orientation = "vertical", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("fieldset", {
		"data-slot": "field",
		className: cn("m-0 min-w-0 border-0 p-0", "flex gap-3", orientation === "horizontal" && "flex-row items-center", orientation === "vertical" && "flex-col", orientation === "responsive" && "flex-col @container/field-group sm:flex-row sm:items-center", className),
		...props
	});
}
function FieldContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "field-content",
		className: cn("flex flex-1 flex-col gap-1", className),
		...props
	});
}
function FieldLabel({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
		"data-slot": "field-label",
		className: cn("font-medium", className),
		...props
	});
}
function FieldTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "field-title",
		className: cn("text-sm font-medium leading-none", className),
		...props
	});
}
function FieldDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		"data-slot": "field-description",
		className: cn("text-sm leading-relaxed text-muted-foreground", className),
		...props
	});
}
function FieldError({ className, children, errors, ...props }) {
	if (children) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "alert",
		"data-slot": "field-error",
		className: cn("text-sm font-medium text-destructive", className),
		...props,
		children
	});
	const messages = errors?.flatMap((error) => {
		const message = error?.message;
		return message ? [message] : [];
	}) ?? [];
	if (messages.length === 0) return null;
	const content = messages.length === 1 ? messages[0] : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "ml-4 list-disc space-y-1",
		children: messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: message }, message))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "alert",
		"data-slot": "field-error",
		className: cn("text-sm font-medium text-destructive", className),
		...props,
		children: content
	});
}
//#endregion
export { FieldGroup as a, Separator as c, FieldError as i, FieldContent as n, FieldLabel as o, FieldDescription as r, FieldTitle as s, Field as t };
