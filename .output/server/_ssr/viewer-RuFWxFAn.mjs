import { g as createFileRoute, h as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/viewer-RuFWxFAn.js
var $$splitComponentImporter = () => import("./viewer-C4J8a4T3.mjs");
var Route = createFileRoute("/_authed/dashboard/proposals/viewer")({
	validateSearch: (search) => ({ src: typeof search.src === "string" ? search.src : void 0 }),
	head: () => ({ meta: [{ title: "Proposal Viewer | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
