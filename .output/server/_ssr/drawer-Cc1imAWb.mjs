import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { T as surfaceMotionClasses } from "./motion-Cf6ujF0h.mjs";
import { t as Drawer } from "../_libs/vaul.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/drawer-Cc1imAWb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Viewport width below `breakpoint` (default md / 768px). */
function useIsMobile(breakpoint = 768) {
	const [isMobile, setIsMobile] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [breakpoint]);
	return isMobile;
}
function Drawer$1({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Root, {
		"data-slot": "drawer",
		...props
	});
}
function DrawerTrigger({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Trigger, {
		"data-slot": "drawer-trigger",
		...props
	});
}
function DrawerPortal({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Portal, {
		"data-slot": "drawer-portal",
		...props
	});
}
function DrawerClose({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Close, {
		"data-slot": "drawer-close",
		...props
	});
}
function DrawerOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Overlay, {
		"data-slot": "drawer-overlay",
		className: cn("fixed inset-0 z-[1500] bg-black/50", surfaceMotionClasses.overlay, className),
		...props
	});
}
function DrawerContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Content, {
		"data-slot": "drawer-content",
		className: cn("group/drawer-content fixed z-[1500] flex h-auto flex-col bg-background", "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[90vh] data-[vaul-drawer-direction=top]:rounded-b-xl data-[vaul-drawer-direction=top]:border-b", "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[92dvh] data-[vaul-drawer-direction=bottom]:rounded-t-xl data-[vaul-drawer-direction=bottom]:border-t", "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-md", "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-md", surfaceMotionClasses.sheetContent, className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-3 hidden h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/25 group-data-[vaul-drawer-direction=bottom]/drawer-content:block group-data-[vaul-drawer-direction=top]/drawer-content:block" }), children]
	})] });
}
//#endregion
export { useIsMobile as a, DrawerTrigger as i, DrawerClose as n, DrawerContent as r, Drawer$1 as t };
