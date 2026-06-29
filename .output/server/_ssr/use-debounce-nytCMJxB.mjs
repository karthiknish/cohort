import { o as __toESM } from "../_runtime.mjs";
import { x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-debounce-nytCMJxB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useDebouncedValue(value, delayMs) {
	const [debounced, setDebounced] = (0, import_react.useState)(value);
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => setDebounced(value), delayMs);
		return () => clearTimeout(timer);
	}, [value, delayMs]);
	return debounced;
}
//#endregion
export { useDebouncedValue as t };
