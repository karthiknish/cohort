import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { t as cn } from "./utils.mjs";
import { y as interactiveTransitionClass } from "./motion.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var Card = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-lg border bg-card text-card-foreground shadow-sm", interactiveTransitionClass, className),
	...props
});
Card.displayName = "Card";
var CardHeader = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col space-y-1.5 p-6", className),
	...props
});
CardHeader.displayName = "CardHeader";
var CardTitle = ({ className, children, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
	ref,
	className: cn("text-2xl font-semibold leading-none tracking-tight", className),
	...props,
	children: children ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "sr-only",
		children: props["aria-label"] ?? props.title ?? "Card title"
	})
});
CardTitle.displayName = "CardTitle";
var CardDescription = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
});
CardDescription.displayName = "CardDescription";
var CardContent = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-6", className),
	...props
});
CardContent.displayName = "CardContent";
var CardFooter = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex items-center gap-2 p-6 pt-0", className),
	...props
});
CardFooter.displayName = "CardFooter";
//#endregion
export { CardHeader as a, CardFooter as i, CardContent as n, CardTitle as o, CardDescription as r, Card as t };
