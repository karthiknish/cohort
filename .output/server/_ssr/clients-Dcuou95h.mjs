import { o as __toESM } from "../_runtime.mjs";
import { x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/clients-Dcuou95h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function DashboardClientsRedirect() {
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		navigate({
			to: "/admin/clients",
			replace: true
		});
	}, [navigate]);
	return null;
}
//#endregion
export { DashboardClientsRedirect as component };
