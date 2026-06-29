import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { i as Slot } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as cn } from "./utils.mjs";
import { t as buttonVariants } from "./button-variants.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
//#endregion
export { Button as t };
