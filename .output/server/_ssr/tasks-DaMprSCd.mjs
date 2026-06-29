import { g as createFileRoute, h as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tasks-DaMprSCd.js
var $$splitComponentImporter = () => import("./tasks-DTtNKFkQ.mjs");
var Route = createFileRoute("/_authed/dashboard/tasks")({
	validateSearch: (search) => ({
		action: typeof search.action === "string" ? search.action : void 0,
		clientId: typeof search.clientId === "string" ? search.clientId : void 0,
		clientName: typeof search.clientName === "string" ? search.clientName : void 0,
		projectId: typeof search.projectId === "string" ? search.projectId : void 0,
		projectName: typeof search.projectName === "string" ? search.projectName : void 0
	}),
	head: () => ({ meta: [{ title: "Tasks | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
