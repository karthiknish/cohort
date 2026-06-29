import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, l as useMutation, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import "./preview-data-CXkRNfsX.mjs";
import { s as logError, t as asErrorMessage } from "./convex-errors-sHK0JmZ7.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { W as settingsApi } from "./convex-api-msEHRhRb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/preferences-context-D6bi2pUb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_PREFERENCES = {
	currency: "USD",
	timezone: null,
	locale: null
};
var PreferencesContext = (0, import_react.createContext)(void 0);
function PreferencesProvider({ children }) {
	const { user } = useAuth();
	const [error, setError] = (0, import_react.useState)(null);
	const [optimisticPreferences, setOptimisticPreferences] = (0, import_react.useState)(null);
	const regional = useQuery(settingsApi.getMyRegionalPreferences);
	const updateRegional = useMutation(settingsApi.updateMyRegionalPreferences);
	const loading = Boolean(user && regional === void 0);
	const basePreferences = (() => {
		if (!user || regional === void 0 || regional === null) return DEFAULT_PREFERENCES;
		return {
			currency: regional.currency ?? "USD",
			timezone: regional.timezone ?? null,
			locale: regional.locale ?? null
		};
	})();
	const preferences = (() => {
		if (!user || !optimisticPreferences) return basePreferences;
		return {
			...basePreferences,
			...optimisticPreferences
		};
	})();
	const fetchPreferences = async () => {};
	const updatePreferences = async (updates) => {
		if (!user) throw new Error("Must be logged in to update preferences");
		try {
			setError(null);
			const optimisticUpdate = {};
			if (updates.currency !== void 0) optimisticUpdate.currency = updates.currency;
			if (updates.timezone !== void 0) optimisticUpdate.timezone = updates.timezone;
			if (updates.locale !== void 0) optimisticUpdate.locale = updates.locale;
			setOptimisticPreferences((current) => ({
				...current ?? {},
				...optimisticUpdate
			}));
			await updateRegional({
				currency: updates.currency,
				timezone: updates.timezone,
				locale: updates.locale
			});
		} catch (err) {
			logError(err, "preferences-context:updatePreferences");
			setOptimisticPreferences(null);
			setError(asErrorMessage(err));
			throw err;
		}
	};
	const updateCurrency = async (currency) => {
		await updatePreferences({ currency });
	};
	const refreshPreferences = async () => {
		await fetchPreferences();
	};
	const clearError = () => {
		setError(null);
	};
	const contextValue = {
		preferences,
		loading,
		error,
		clearError,
		updateCurrency,
		updatePreferences,
		refreshPreferences
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreferencesContext.Provider, {
		value: contextValue,
		children
	});
}
function usePreferences() {
	const context = (0, import_react.use)(PreferencesContext);
	if (context === void 0) throw new Error("usePreferences must be used within a PreferencesProvider");
	return context;
}
/**
* Hook to get just the currency for formatting
* Returns the user's preferred currency or USD as default
*/
function useCurrency() {
	return (0, import_react.use)(PreferencesContext)?.preferences.currency ?? "USD";
}
//#endregion
export { useCurrency as n, usePreferences as r, PreferencesProvider as t };
