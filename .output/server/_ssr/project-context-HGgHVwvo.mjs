import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { n as usePathname, r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { r as useUrlSearchParamsContext } from "./use-url-search-params-CvniTNfQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/project-context-HGgHVwvo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ProjectContext = (0, import_react.createContext)(void 0);
function ProjectProvider({ children }) {
	const { selectedClient } = useClientContext();
	const { user } = useAuth();
	const searchParams = useUrlSearchParamsContext();
	const { push } = useRouter$1();
	const pathname = usePathname();
	const [manualProjectId, setManualProjectId] = (0, import_react.useState)(null);
	const urlProjectId = selectedClient?.id ? searchParams.get("projectId") : null;
	const selectedProjectId = urlProjectId ?? manualProjectId;
	const isFromUrl = urlProjectId !== null;
	const selectedProject = (() => {
		if (!selectedProjectId || !selectedClient?.id) return null;
		const projectName = searchParams.get("projectName");
		const now = (/* @__PURE__ */ new Date()).toISOString();
		return {
			id: selectedProjectId,
			name: projectName || "Unknown Project",
			description: null,
			status: "active",
			clientId: selectedClient.id,
			clientName: selectedClient.name,
			startDate: null,
			endDate: null,
			tags: [],
			ownerId: user?.id || null,
			createdAt: now,
			updatedAt: now,
			taskCount: 0,
			openTaskCount: 0,
			recentActivityAt: now
		};
	})();
	const selectProject = (projectId) => {
		setManualProjectId(projectId);
		if (projectId && !searchParams.get("projectId")) {
			const newParams = new URLSearchParams(searchParams.toString());
			newParams.set("projectId", projectId);
			push(`${pathname}?${newParams.toString()}`);
		}
	};
	const clearProject = () => {
		setManualProjectId(null);
		const newParams = new URLSearchParams(searchParams.toString());
		newParams.delete("projectId");
		newParams.delete("projectName");
		push(`${pathname}?${newParams.toString()}`);
	};
	const value = {
		selectedProjectId,
		selectedProject,
		selectProject,
		clearProject,
		isFromUrl
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectContext.Provider, {
		value,
		children
	});
}
function useProjectContext() {
	const context = (0, import_react.use)(ProjectContext);
	if (context === void 0) throw new Error("useProjectContext must be used within a ProjectProvider");
	return context;
}
//#endregion
export { useProjectContext as n, ProjectProvider as t };
