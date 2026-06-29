import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { p as interactiveTransitionClass } from "./motion-Cf6ujF0h.mjs";
import { t as Image } from "./image-Dd8IQpGx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lazy-image-69k9UCD2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LazyImage({ src, alt = "", className, onLoad, onError, ...rest }) {
	const [loadedSrc, setLoadedSrc] = (0, import_react.useState)(null);
	const objectUrl = (() => {
		if (src instanceof Blob) return URL.createObjectURL(src);
		return null;
	})();
	(0, import_react.useEffect)(() => {
		return () => {
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [objectUrl]);
	const resolvedSrc = src instanceof Blob ? objectUrl : src;
	const isLoaded = typeof resolvedSrc === "string" && loadedSrc === resolvedSrc;
	const handleLoad = (event) => {
		if (typeof resolvedSrc === "string") setLoadedSrc(resolvedSrc);
		onLoad?.(event);
	};
	const handleError = (event) => {
		onError?.(event);
	};
	if (!resolvedSrc) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
		src: resolvedSrc,
		alt,
		fill: true,
		sizes: rest.sizes ?? "100vw",
		loading: "lazy",
		className: cn(interactiveTransitionClass, isLoaded ? "opacity-100" : "opacity-0", className),
		onLoad: handleLoad,
		onError: handleError,
		...rest
	});
}
//#endregion
export { LazyImage as t };
