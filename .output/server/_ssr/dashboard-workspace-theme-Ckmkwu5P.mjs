import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { n as SheetClose, r as SheetContent, s as SheetTrigger, t as Sheet } from "./sheet-Ybc8ZbjG.mjs";
import { a as useIsMobile, i as DrawerTrigger, n as DrawerClose, r as DrawerContent, t as Drawer$1 } from "./drawer-Cc1imAWb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-workspace-theme-Ckmkwu5P.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ResponsiveFormSheetContext = (0, import_react.createContext)("sheet");
/**
* Right sheet on md+; bottom drawer on mobile (Vaul) for native-feeling forms.
*/
function ResponsiveFormSheet({ open, onOpenChange, children, trigger, contentClassName, sheetSide = "right" }) {
	const isMobile = useIsMobile();
	const contextValue = isMobile ? "drawer" : "sheet";
	if (isMobile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveFormSheetContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer$1, {
			open,
			onOpenChange,
			direction: "bottom",
			shouldScaleBackground: true,
			children: [trigger ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerTrigger, {
				asChild: true,
				children: trigger
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerContent, {
				className: cn("flex max-h-[92dvh] flex-col gap-0 p-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]", contentClassName),
				children
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveFormSheetContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
			open,
			onOpenChange,
			children: [trigger ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
				asChild: true,
				children: trigger
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
				side: sheetSide,
				className: contentClassName,
				children
			})]
		})
	});
}
/** Close control that works inside ResponsiveFormSheet (Sheet or Drawer). */
function FormSheetClose({ ...props }) {
	if ((0, import_react.use)(ResponsiveFormSheetContext) === "drawer") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerClose, { ...props });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetClose, { ...props });
}
/** Shared layout tokens for dashboard feature pages (tasks, projects, collaboration inbox). */
var DASHBOARD_WORKSPACE_THEME = {
	page: "mx-auto max-w-7xl space-y-6 pb-12",
	summaryStrip: "rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/20 p-4 shadow-sm sm:px-5",
	workspace: "overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-border/40",
	workspaceRail: "flex flex-col gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
	filterBar: "flex flex-col gap-3 border-b border-border/50 bg-background/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
	content: "relative min-h-[14rem]",
	contentList: "bg-muted/[0.18]",
	footer: "flex items-center justify-between border-t border-border/60 bg-muted/10 px-4 py-2.5 text-xs text-muted-foreground",
	emptyPanel: "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/10 px-6 py-16 text-center",
	segmentedList: "inline-flex h-9 shrink-0 items-center gap-0.5 rounded-lg border border-border/60 bg-background/80 p-0.5 shadow-sm",
	segmentedButton: (active) => cn("inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors", active ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"),
	tabList: "h-9 gap-0 rounded-lg border border-border/60 bg-background/80 p-0.5 shadow-sm",
	tabTrigger: "h-8 rounded-md px-3 text-xs font-medium data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none",
	projectPill: "inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs text-foreground"
};
//#endregion
export { FormSheetClose as n, ResponsiveFormSheet as r, DASHBOARD_WORKSPACE_THEME as t };
