import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { p as interactiveTransitionClass } from "./motion-Cf6ujF0h.mjs";
import { t as FadeIn } from "./animate-in-JYv0iBIt.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var TabsList = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className),
	...props
});
TabsList.displayName = List.displayName;
var TabsTrigger = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("focus-ring-subtle inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", interactiveTransitionClass, className),
	...props
});
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("focus-ring-subtle mt-4 ring-offset-background", className),
	...props
});
TabsContent.displayName = Content.displayName;
function MotionTabsContent({ activeTab, tabValue, children, className, y = 10, duration = .2, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
		value: tabValue,
		className,
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, {
			y,
			duration,
			children
		}, `${tabValue}-${activeTab}`)
	});
}
var Tabs = Root2;
//#endregion
export { TabsTrigger as a, TabsList as i, Tabs as n, TabsContent as r, MotionTabsContent as t };
