import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { Ur as ArrowLeft } from "../_libs/lucide-react.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/back-link-CKMy253H.js
var import_jsx_runtime = require_jsx_runtime();
function BackLink({ label, href, onClick, className, transitionTypes }) {
	const sharedClasses = cn("-ml-2 gap-2 text-muted-foreground hover:text-foreground", className);
	if (href) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "sm",
		asChild: true,
		className: sharedClasses,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
			href,
			transitionTypes,
			onClick,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), label]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "ghost",
		size: "sm",
		type: "button",
		className: sharedClasses,
		onClick,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), label]
	});
}
//#endregion
export { BackLink as t };
