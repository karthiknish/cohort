import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, l as useMutation, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { D as getPreviewClients, Q as isPreviewModeEnabled, i as PREVIEW_MODE_EVENT } from "./preview-data-CXkRNfsX.mjs";
import { g as getWorkspaceId } from "./utils-hh4sibN0.mjs";
import { a as isNotFoundAppError } from "./convex-errors-sHK0JmZ7.mjs";
import { c as reportConvexFailure } from "./notifications-DQZKskhM.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { y as clientsApi } from "./convex-api-msEHRhRb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-context-BNynWehF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STORAGE_KEY_SELECTED = "cohorts.dashboard.selectedClient";
function isConvexClientRow(value) {
	return typeof value === "object" && value !== null && typeof value.legacyId === "string" && typeof value.name === "string";
}
function mapClients(rows) {
	const list = rows.flatMap((row) => isConvexClientRow(row) ? [{
		id: row.legacyId,
		workspaceId: typeof row.workspaceId === "string" ? row.workspaceId : null,
		name: row.name,
		accountManager: typeof row.accountManager === "string" ? row.accountManager : "",
		teamMembers: Array.isArray(row.teamMembers) ? row.teamMembers : [],
		createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
		updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null
	}] : []);
	list.sort((a, b) => a.name.localeCompare(b.name));
	return list;
}
function extractRows(convexClients) {
	if (Array.isArray(convexClients)) return convexClients;
	if (convexClients && typeof convexClients === "object" && "items" in convexClients && Array.isArray(convexClients.items)) return convexClients.items;
	return [];
}
function resolveSelectedClientId(clients, currentSelection, storedSelection) {
	if (currentSelection && clients.some((client) => client.id === currentSelection)) return currentSelection;
	if (storedSelection && clients.some((client) => client.id === storedSelection)) return storedSelection;
	return clients[0]?.id ?? null;
}
function getInitialPreviewClientId() {
	return isPreviewModeEnabled() ? getPreviewClients()[0]?.id ?? null : null;
}
function createInitialClientProviderState() {
	return {
		selectedClientId: getInitialPreviewClientId(),
		loading: false,
		error: null
	};
}
function clientProviderReducer(state, action) {
	switch (action.type) {
		case "syncState": return {
			selectedClientId: action.selectedClientId,
			loading: action.loading,
			error: action.error
		};
		case "setSelectedClientId": return {
			...state,
			selectedClientId: action.selectedClientId
		};
		case "setError": return {
			...state,
			error: action.error
		};
		default: return state;
	}
}
function useClientProvider() {
	const { user, loading: authLoading, isSyncing, authPhase } = useAuth();
	const [{ selectedClientId, loading, error }, dispatch] = (0, import_react.useReducer)(clientProviderReducer, void 0, createInitialClientProviderState);
	const hasInitializedRef = (0, import_react.useRef)(false);
	const previewEnabled = (0, import_react.useSyncExternalStore)((onStoreChange) => {
		if (typeof window === "undefined") return () => void 0;
		const handlePreviewChange = () => {
			onStoreChange();
		};
		window.addEventListener("storage", handlePreviewChange);
		window.addEventListener(PREVIEW_MODE_EVENT, handlePreviewChange);
		return () => {
			window.removeEventListener("storage", handlePreviewChange);
			window.removeEventListener(PREVIEW_MODE_EVENT, handlePreviewChange);
		};
	}, () => isPreviewModeEnabled(), () => false);
	const selectionBeforePreviewRef = (0, import_react.useRef)(null);
	const previousPreviewEnabledRef = (0, import_react.useRef)(previewEnabled);
	const workspaceId = getWorkspaceId(user);
	const canQuery = authPhase === "ready_active" && !authLoading && !isSyncing && !!workspaceId;
	const isAdmin = user?.role === "admin";
	const convexClientsArgs = previewEnabled || !canQuery || !user?.agencyId ? "skip" : {
		workspaceId,
		limit: 100,
		includeAllWorkspaces: isAdmin
	};
	const convexClients = useQuery(clientsApi.list, convexClientsArgs);
	const convexCreateClient = useMutation(clientsApi.create);
	const convexSoftDeleteClient = useMutation(clientsApi.softDelete);
	const storageKey = workspaceId ? `${STORAGE_KEY_SELECTED}:${workspaceId}` : STORAGE_KEY_SELECTED;
	const selectedClientIdRef = (0, import_react.useRef)(selectedClientId);
	(0, import_react.useEffect)(() => {
		selectedClientIdRef.current = selectedClientId;
	}, [selectedClientId]);
	(0, import_react.useEffect)(() => {
		if (previousPreviewEnabledRef.current === previewEnabled) return;
		previousPreviewEnabledRef.current = previewEnabled;
		if (previewEnabled) {
			selectionBeforePreviewRef.current = selectedClientIdRef.current;
			dispatch({
				type: "syncState",
				selectedClientId: getPreviewClients()[0]?.id ?? null,
				loading: false,
				error: null
			});
		} else if (selectionBeforePreviewRef.current !== null) {
			dispatch({
				type: "setSelectedClientId",
				selectedClientId: selectionBeforePreviewRef.current
			});
			selectionBeforePreviewRef.current = null;
		}
	}, [previewEnabled]);
	const applyClientSelectionSync = (0, import_react.useEffectEvent)(() => {
		if (previewEnabled) {
			dispatch({
				type: "syncState",
				selectedClientId: selectedClientIdRef.current,
				loading: false,
				error: null
			});
			return;
		}
		if (authLoading || isSyncing) return;
		if (!workspaceId) {
			dispatch({
				type: "syncState",
				selectedClientId: null,
				loading: false,
				error: null
			});
			return;
		}
		if (convexClients === void 0) {
			dispatch({
				type: "syncState",
				selectedClientId: selectedClientIdRef.current,
				loading: true,
				error: null
			});
			return;
		}
		const rows = extractRows(convexClients);
		if (rows.length === 0) {
			dispatch({
				type: "syncState",
				selectedClientId: null,
				loading: false,
				error: "No clients found for this workspace"
			});
			return;
		}
		const clients = mapClients(rows);
		const currentSelection = selectedClientIdRef.current;
		const targetId = resolveSelectedClientId(clients, currentSelection, typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null);
		hasInitializedRef.current = true;
		dispatch({
			type: "syncState",
			selectedClientId: targetId,
			loading: false,
			error: null
		});
	});
	(0, import_react.useEffect)(() => {
		const frame = requestAnimationFrame(() => {
			applyClientSelectionSync();
		});
		return () => {
			cancelAnimationFrame(frame);
		};
	}, [
		authLoading,
		convexClients,
		isSyncing,
		previewEnabled,
		storageKey,
		workspaceId
	]);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		if (previewEnabled) return;
		if (!workspaceId) return;
		if (selectedClientId) try {
			window.localStorage.setItem(storageKey, selectedClientId);
		} catch (e) {
			console.warn("[ClientProvider] failed to persist client selection", e);
		}
		else if (hasInitializedRef.current) window.localStorage.removeItem(storageKey);
	}, [
		previewEnabled,
		selectedClientId,
		storageKey,
		workspaceId
	]);
	(0, import_react.useEffect)(() => {
		if (!window.location.search.includes("debug=true")) return;
		console.log("[ClientProvider] State:", {
			authLoading,
			isSyncing,
			workspaceId,
			canQuery,
			hasConvexResult: convexClients !== void 0
		});
	}, [
		authLoading,
		isSyncing,
		workspaceId,
		canQuery,
		convexClients
	]);
	const resolvedClients = (() => {
		if (previewEnabled) return getPreviewClients();
		if (!workspaceId || convexClients === void 0) return [];
		return mapClients(extractRows(convexClients));
	})();
	const clientsRef = (0, import_react.useRef)(resolvedClients);
	(0, import_react.useEffect)(() => {
		clientsRef.current = resolvedClients;
	}, [resolvedClients]);
	const refreshClients = async () => {
		return clientsRef.current;
	};
	const retryClients = () => {
		dispatch({
			type: "setError",
			error: null
		});
		requestAnimationFrame(() => {
			applyClientSelectionSync();
		});
	};
	const selectClient = (clientId) => {
		dispatch({
			type: "setSelectedClientId",
			selectedClientId: clientId
		});
	};
	const createClient = async (input) => {
		if (!workspaceId) throw new Error("Workspace is required to create a client");
		const name = input.name.trim();
		const accountManager = input.accountManager.trim();
		if (!name || !accountManager) throw new Error("Client name and account manager are required");
		const teamMembers = input.teamMembers.flatMap((member) => {
			const normalized = {
				name: member.name.trim(),
				role: typeof member.role === "string" ? member.role.trim() : ""
			};
			return normalized.name.length > 0 ? [normalized] : [];
		});
		if (!teamMembers.some((member) => member.name.toLowerCase() === accountManager.toLowerCase())) teamMembers.unshift({
			name: accountManager,
			role: "Account Manager"
		});
		try {
			const created = {
				id: (await convexCreateClient({
					workspaceId,
					name,
					accountManager,
					teamMembers,
					createdBy: user?.id ?? null
				})).legacyId,
				workspaceId,
				name,
				accountManager,
				teamMembers,
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			dispatch({
				type: "setSelectedClientId",
				selectedClientId: created.id
			});
			return created;
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useClientProvider:createClient",
				title: "Could not create client",
				fallbackMessage: "Unable to create the client. Please try again."
			});
			throw err;
		}
	};
	const removeClient = async (clientId) => {
		if (!workspaceId) throw new Error("Workspace is required to remove a client");
		const targetWorkspaceId = clientsRef.current.find((client) => client.id === clientId)?.workspaceId ?? workspaceId;
		const fallbackClientId = resolveSelectedClientId(clientsRef.current.filter((client) => client.id !== clientId), selectedClientIdRef.current, null);
		try {
			await convexSoftDeleteClient({
				workspaceId: targetWorkspaceId,
				legacyId: clientId,
				deletedAtMs: Date.now()
			});
		} catch (error) {
			if (!isNotFoundAppError(error)) throw error;
		}
		dispatch({
			type: "setSelectedClientId",
			selectedClientId: selectedClientIdRef.current === clientId ? fallbackClientId : selectedClientIdRef.current
		});
	};
	(0, import_react.useEffect)(() => {
		if (previewEnabled || loading) return;
		if (!selectedClientId) return;
		if (resolvedClients.some((client) => client.id === selectedClientId)) return;
		dispatch({
			type: "setSelectedClientId",
			selectedClientId: resolveSelectedClientId(resolvedClients, null, null)
		});
	}, [
		loading,
		previewEnabled,
		resolvedClients,
		selectedClientId
	]);
	return {
		workspaceId,
		clients: resolvedClients,
		selectedClientId,
		selectedClient: (() => {
			if (!selectedClientId) return null;
			return resolvedClients.find((client) => client.id === selectedClientId) ?? null;
		})(),
		loading,
		error,
		refreshClients,
		retryClients,
		selectClient,
		createClient,
		removeClient
	};
}
var ClientContext = (0, import_react.createContext)(void 0);
function ClientProvider({ children }) {
	const value = useClientProvider();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientContext.Provider, {
		value,
		children
	});
}
function useClientContext() {
	const context = (0, import_react.use)(ClientContext);
	if (!context) throw new Error("useClientContext must be used within a ClientProvider");
	return context;
}
//#endregion
export { useClientContext as n, ClientProvider as t };
