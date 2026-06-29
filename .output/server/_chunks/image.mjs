import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
//#region src/shared/ui/image.tsx
var import_jsx_runtime = require_jsx_runtime();
function Image({ src, alt, width, height, fill, sizes, priority, quality: _quality, placeholder: _placeholder, blurDataURL: _blurDataURL, unoptimized: _unoptimized, loader: _loader, style, loading, ...rest }) {
	const computedStyle = fill ? {
		position: "absolute",
		inset: 0,
		width: "100%",
		height: "100%",
		objectFit: "cover",
		...style
	} : { ...style };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt,
		width: fill ? void 0 : width,
		height: fill ? void 0 : height,
		sizes,
		loading: priority ? "eager" : loading ?? "lazy",
		fetchpriority: priority ? "high" : void 0,
		style: computedStyle,
		...rest
	});
}
//#endregion
export { Image as t };
