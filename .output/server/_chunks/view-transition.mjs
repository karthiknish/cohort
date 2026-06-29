import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
//#region src/shared/ui/view-transition.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var ReactViewTransition = import_react.ViewTransition;
/**
* React View Transitions wrapper. Falls back to a fragment when the runtime
* does not export ViewTransition (stable React builds without the API).
*/
function ViewTransition({ children, ...props }) {
	if (typeof ReactViewTransition === "function") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReactViewTransition, {
		...props,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
//#endregion
export { ViewTransition as t };
