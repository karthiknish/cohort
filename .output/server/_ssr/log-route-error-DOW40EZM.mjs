import { o as __toESM } from "../_runtime.mjs";
import { x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { s as logError } from "./convex-errors-sHK0JmZ7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/log-route-error-DOW40EZM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Log route segment errors from Next.js error boundaries (no toast).
*/
function logRouteError(error, segment) {
	logError(error, `RouteError:${segment}`);
	if (typeof error.digest === "string" && error.digest.length > 0) console.error(`[RouteError:${segment}] digest:`, error.digest);
}
/** Logs when `error` changes — use instead of an effect in the error page component. */
function RouteErrorLogger({ error, segment }) {
	const log = (0, import_react.useEffectEvent)(() => {
		logRouteError(error, segment);
		if (typeof error.componentStack === "string" && error.componentStack.length > 0) console.error(`[RouteError:${segment}] componentStack:`, error.componentStack);
	});
	(0, import_react.useEffect)(() => {
		log();
	}, [error, segment]);
	return null;
}
//#endregion
export { logRouteError as n, RouteErrorLogger as t };
