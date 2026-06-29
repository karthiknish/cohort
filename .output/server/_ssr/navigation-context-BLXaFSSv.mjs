import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { r as useUrlSearchParamsContext } from "./use-url-search-params-CvniTNfQ.mjs";
import { t as isFeatureEnabled } from "./features-DXQ1HU1z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/navigation-context-BLXaFSSv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STORAGE_PREFIX = "cohorts.nav";
var STORAGE_KEYS = {
	PROJECT_ID: `${STORAGE_PREFIX}.projectId`,
	PROJECT_NAME: `${STORAGE_PREFIX}.projectName`,
	LAST_VIEWED_TASK: `${STORAGE_PREFIX}.lastViewedTask`,
	LAST_VIEWED_CHANNEL: `${STORAGE_PREFIX}.lastViewedChannel`
};
var NavigationContext = (0, import_react.createContext)(void 0);
function getClientStorageKey(baseKey, clientId) {
	return clientId ? `${baseKey}.${clientId}` : baseKey;
}
function NavigationProvider({ children }) {
	const { selectedClientId } = useClientContext();
	const searchParams = useUrlSearchParamsContext();
	const mountedRef = (0, import_react.useRef)(false);
	const [navigationState, setNavigationState] = (0, import_react.useState)({
		projectId: null,
		projectName: null,
		lastViewedTask: null,
		lastViewedChannel: null
	});
	const cleanupOldData = (0, import_react.useCallback)(() => {
		if (typeof window === "undefined") return;
		try {
			const navKeys = Object.keys(localStorage).filter((key) => key.startsWith(STORAGE_PREFIX));
			const clientKeys = /* @__PURE__ */ new Set();
			navKeys.forEach((key) => {
				const parts = key.split(".");
				const clientId = parts[2];
				if (parts.length >= 3 && clientId) clientKeys.add(clientId);
			});
			if (clientKeys.size > 10) {
				const clientArray = Array.from(clientKeys);
				clientArray.slice(0, clientArray.length - 10).forEach((clientId) => {
					Object.values(STORAGE_KEYS).forEach((baseKey) => {
						const key = getClientStorageKey(baseKey, clientId);
						localStorage.removeItem(key);
					});
				});
			}
		} catch (error) {
			console.warn("[NavigationProvider] Failed to cleanup old data:", error);
		}
	}, []);
	const loadNavigationState = (0, import_react.useCallback)(() => {
		if (typeof window === "undefined") return;
		try {
			cleanupOldData();
			setNavigationState({
				projectId: localStorage.getItem(getClientStorageKey(STORAGE_KEYS.PROJECT_ID, selectedClientId)),
				projectName: localStorage.getItem(getClientStorageKey(STORAGE_KEYS.PROJECT_NAME, selectedClientId)),
				lastViewedTask: localStorage.getItem(getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_TASK, selectedClientId)),
				lastViewedChannel: localStorage.getItem(getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_CHANNEL, selectedClientId))
			});
		} catch (error) {
			console.warn("[NavigationProvider] Failed to load navigation state:", error);
		}
	}, [selectedClientId, cleanupOldData]);
	const saveNavigationState = (state) => {
		if (!isFeatureEnabled("NAVIGATION_PERSISTENCE") || typeof window === "undefined") return;
		const projectId = state.projectId ?? "";
		const projectName = state.projectName ?? "";
		const lastViewedTask = state.lastViewedTask ?? "";
		const lastViewedChannel = state.lastViewedChannel ?? "";
		try {
			localStorage.setItem(getClientStorageKey(STORAGE_KEYS.PROJECT_ID, selectedClientId), projectId);
			localStorage.setItem(getClientStorageKey(STORAGE_KEYS.PROJECT_NAME, selectedClientId), projectName);
			localStorage.setItem(getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_TASK, selectedClientId), lastViewedTask);
			localStorage.setItem(getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_CHANNEL, selectedClientId), lastViewedChannel);
		} catch (error) {
			console.warn("[NavigationProvider] Failed to save navigation state:", error);
		}
	};
	(0, import_react.useEffect)(() => {
		if (!isFeatureEnabled("NAVIGATION_PERSISTENCE")) return;
		if (mountedRef.current && typeof window !== "undefined") {
			const frameId = window.requestAnimationFrame(() => {
				loadNavigationState();
			});
			return () => {
				window.cancelAnimationFrame(frameId);
			};
		}
	}, [selectedClientId, loadNavigationState]);
	(0, import_react.useEffect)(() => {
		if (mountedRef.current) return;
		mountedRef.current = true;
		if (typeof window === "undefined") return;
		if (isFeatureEnabled("NAVIGATION_PERSISTENCE")) {
			const frameId = window.requestAnimationFrame(() => {
				loadNavigationState();
			});
			return () => {
				window.cancelAnimationFrame(frameId);
			};
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!isFeatureEnabled("NAVIGATION_PERSISTENCE")) return;
		const urlProjectId = searchParams.get("projectId");
		const urlProjectName = searchParams.get("projectName");
		if (urlProjectId || urlProjectName) {
			const frameId = requestAnimationFrame(() => {
				setNavigationState((prev) => ({
					...prev,
					projectId: urlProjectId,
					projectName: urlProjectName
				}));
			});
			return () => {
				cancelAnimationFrame(frameId);
			};
		}
	}, [searchParams]);
	const setProjectContext = (projectId, projectName) => {
		const newState = {
			...navigationState,
			projectId,
			projectName
		};
		setNavigationState(newState);
		saveNavigationState(newState);
	};
	const setLastViewedTask = (taskId) => {
		const newState = {
			...navigationState,
			lastViewedTask: taskId
		};
		setNavigationState(newState);
		saveNavigationState(newState);
	};
	const setLastViewedChannel = (channelId) => {
		const newState = {
			...navigationState,
			lastViewedChannel: channelId
		};
		setNavigationState(newState);
		saveNavigationState(newState);
	};
	const clearNavigationState = () => {
		setNavigationState({
			projectId: null,
			projectName: null,
			lastViewedTask: null,
			lastViewedChannel: null
		});
		if (isFeatureEnabled("NAVIGATION_PERSISTENCE") && typeof window !== "undefined") try {
			Object.values(STORAGE_KEYS).forEach((baseKey) => {
				const key = getClientStorageKey(baseKey, selectedClientId);
				localStorage.removeItem(key);
			});
		} catch (error) {
			console.warn("[NavigationProvider] Failed to clear navigation state:", error);
		}
	};
	const restoreNavigationState = () => {
		loadNavigationState();
	};
	const value = {
		navigationState,
		setProjectContext,
		setLastViewedTask,
		setLastViewedChannel,
		clearNavigationState,
		restoreNavigationState
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationContext.Provider, {
		value,
		children
	});
}
function useNavigationContext() {
	const context = (0, import_react.use)(NavigationContext);
	if (!context) throw new Error("useNavigationContext must be used within a NavigationProvider");
	return context;
}
//#endregion
export { useNavigationContext as n, NavigationProvider as t };
