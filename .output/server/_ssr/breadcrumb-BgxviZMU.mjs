import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { i as Slot } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { m as linkMotionClass } from "./motion-Cf6ujF0h.mjs";
import { pr as ChevronRight } from "../_libs/lucide-react.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Breadcrumb({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": "breadcrumb",
		"data-slot": "breadcrumb",
		...props
	});
}
function BreadcrumbList({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		"data-slot": "breadcrumb-list",
		className: cn("text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5", className),
		...props
	});
}
function BreadcrumbItem({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
		"data-slot": "breadcrumb-item",
		className: cn("inline-flex items-center gap-1.5", className),
		...props
	});
}
function BreadcrumbLink({ asChild, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "a", {
		"data-slot": "breadcrumb-link",
		className: cn("hover:text-foreground", linkMotionClass, className),
		...props
	});
}
function BreadcrumbPage({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"data-slot": "breadcrumb-page",
		"aria-disabled": "true",
		"aria-current": "page",
		className: cn("text-foreground font-normal", className),
		...props
	});
}
function BreadcrumbSeparator({ children, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
		"data-slot": "breadcrumb-separator",
		role: "presentation",
		"aria-hidden": "true",
		className: cn("[&>svg]:size-3.5", className),
		...props,
		children: children ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {})
	});
}
//#endregion
export { BreadcrumbPage as a, BreadcrumbList as i, BreadcrumbItem as n, BreadcrumbSeparator as o, BreadcrumbLink as r, Breadcrumb as t };
