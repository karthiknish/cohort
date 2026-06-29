import { s as convexErrorMessage } from "./notifications.mjs";
//#region src/lib/hooks/use-convex-query-error.ts
/** Pure resolver used by useConvexQueryError (testable without React). */
function resolveConvexQueryErrorMessage(data, options = {}) {
	const { skipped = false, loading = false, fallbackMessage = "Unable to load data. Please try again." } = options;
	if (skipped) return null;
	if (loading || data === void 0) return null;
	if (data === null) return fallbackMessage;
	return null;
}
/**
* Surfaces Convex query failures as a stable error string for inline Alerts.
* Convex queries that throw surface as `null` once loading completes.
*/
function useConvexQueryError(options) {
	const { data, skipped = false, loading = false, fallbackMessage = "Unable to load data. Please try again." } = options;
	return resolveConvexQueryErrorMessage(data, {
		skipped,
		loading,
		fallbackMessage
	});
}
/**
* Merge shape-validation errors with Convex query transport errors.
*/
function mergeQueryErrors(...errors) {
	return errors.find((value) => typeof value === "string" && value.trim().length > 0) ?? null;
}
function queryErrorFromUnknown(error, fallback = "Unable to load data. Please try again.") {
	return convexErrorMessage(error, fallback);
}
//#endregion
export { queryErrorFromUnknown as n, useConvexQueryError as r, mergeQueryErrors as t };
