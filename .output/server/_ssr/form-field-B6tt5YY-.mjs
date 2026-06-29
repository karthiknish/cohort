import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { a as FieldGroup, i as FieldError, n as FieldContent, o as FieldLabel, r as FieldDescription, s as FieldTitle, t as Field } from "./field-BTH9SS9b.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/form-field-B6tt5YY-.js
var import_jsx_runtime = require_jsx_runtime();
/** Standard label + description + error + control layout using Field primitives. */
function FormField({ id, label, description, error, labelPrefix, children, orientation = "vertical", className, labelVariant = "label" }) {
	const labelNode = labelVariant === "title" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldTitle, { children: label }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldLabel, {
		htmlFor: id,
		className: cn(labelPrefix && "flex items-center gap-2"),
		children: [labelPrefix, label]
	});
	if (orientation === "horizontal" || orientation === "responsive") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
		orientation,
		className: cn("items-center justify-between", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldContent, {
			className: "flex-1",
			children: [
				labelNode,
				description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldDescription, { children: description }) : null,
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldError, { children: error }) : null
			]
		}), children]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
		orientation,
		className,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldContent, { children: [
			labelNode,
			description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldDescription, { children: description }) : null,
			children,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldError, { children: error }) : null
		] })
	});
}
/** Section heading + description + controls (multi-select grids, etc.). */
function FieldSection({ title, description, error, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldGroup, {
		className,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldTitle, { children: title }),
			description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldDescription, { children: description }) : null,
			children,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldError, { children: error }) : null
		] }) })
	});
}
//#endregion
export { FormField as n, FieldSection as t };
