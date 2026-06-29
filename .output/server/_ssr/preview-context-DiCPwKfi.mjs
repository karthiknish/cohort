import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { Q as isPreviewModeEnabled, ct as setPreviewModeEnabled, i as PREVIEW_MODE_EVENT, tt as isScreenRecordingModeEnabled } from "./preview-data-CXkRNfsX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/preview-context-DiCPwKfi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PreviewContext = (0, import_react.createContext)(void 0);
var DEFAULT_PREVIEW_CONTEXT = {
	isPreviewMode: false,
	togglePreviewMode: () => {},
	setPreviewMode: () => {}
};
function PreviewProvider({ children }) {
	const [storedPreviewMode, setStoredPreviewMode] = (0, import_react.useState)(() => isPreviewModeEnabled());
	const isPreviewModeForced = isScreenRecordingModeEnabled();
	const isPreviewMode = isPreviewModeForced || storedPreviewMode;
	(0, import_react.useEffect)(() => {
		const syncFromStorage = () => {
			setStoredPreviewMode(isPreviewModeEnabled());
		};
		const onStorage = (event) => {
			if (event.key === "cohorts.previewMode") syncFromStorage();
		};
		const onPreviewEvent = () => {
			syncFromStorage();
		};
		window.addEventListener("storage", onStorage);
		window.addEventListener(PREVIEW_MODE_EVENT, onPreviewEvent);
		return () => {
			window.removeEventListener("storage", onStorage);
			window.removeEventListener(PREVIEW_MODE_EVENT, onPreviewEvent);
		};
	}, []);
	const updatePreviewMode = (enabled) => {
		if (isPreviewModeForced) return;
		setStoredPreviewMode(enabled);
		setPreviewModeEnabled(enabled);
	};
	const togglePreviewMode = () => {
		updatePreviewMode(!isPreviewMode);
	};
	const setPreviewMode = (enabled) => {
		updatePreviewMode(enabled);
	};
	const value = {
		isPreviewMode,
		togglePreviewMode,
		setPreviewMode
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewContext.Provider, {
		value,
		children
	});
}
function usePreview() {
	const context = (0, import_react.use)(PreviewContext);
	if (context === void 0) return DEFAULT_PREVIEW_CONTEXT;
	return context;
}
//#endregion
export { usePreview as n, PreviewProvider as t };
