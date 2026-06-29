import { y as ConvexError } from "../_libs/@convex-dev/better-auth+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/convex-errors-sHK0JmZ7.js
/**
* Logs an error to the console with rich context.
* Use this in catch blocks before displaying a toast to the user.
*/
function logError(error, context) {
	const code = extractErrorCode(error);
	const details = extractErrorDetails(error);
	const message = asErrorMessage(error);
	console.group(`[Error]${context ? ` ${context}` : ""}`);
	console.error("Message:", message);
	if (code) console.error("Code:", code);
	if (details) console.error("Details:", details);
	console.error("Raw Error:", error);
	console.groupEnd();
}
/**
* Extract a user-friendly error message from unknown error values,
* including standardized ConvexError objects.
*/
function asErrorMessage(error) {
	if (error instanceof ConvexError) return error.data?.message ?? "An error occurred";
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	return "An unexpected error occurred";
}
/**
* Extract the standardized error code from a ConvexError.
*/
function extractErrorCode(error) {
	if (error instanceof ConvexError) return error.data?.code ?? null;
	return null;
}
/**
* Extract the details from a ConvexError.
*/
function extractErrorDetails(error) {
	if (error instanceof ConvexError) return error.data?.details ?? null;
	return null;
}
/** Matches `ErrorCode.BASE.READ_LIMIT` from convex/errors.ts */
function isReadLimitAppError(error) {
	return extractErrorCode(error) === "READ_LIMIT";
}
/** Matches `ErrorCode.BASE.CONFLICT` from convex/errors.ts */
function isConflictAppError(error) {
	return extractErrorCode(error) === "CONFLICT";
}
/** Matches `ErrorCode.RESOURCE.NOT_FOUND` from convex/errors.ts */
function isNotFoundAppError(error) {
	return extractErrorCode(error) === "NOT_FOUND";
}
/** Matches `ErrorCode.INTEGRATION.INSUFFICIENT_SCOPE` from convex/errors.ts */
function isIntegrationScopeAppError(error) {
	return extractErrorCode(error) === "INTEGRATION_INSUFFICIENT_SCOPE";
}
/** Map ConvexError to HTTP status for API routes (createApiHandler). */
function resolveConvexApiErrorResponse(error) {
	if (!(error instanceof ConvexError)) return null;
	const data = error.data;
	const code = data?.code ?? "INTERNAL_ERROR";
	const message = data?.message ?? "An error occurred";
	return {
		status: {
			TOO_MANY_REQUESTS: 429,
			READ_LIMIT: 429,
			CONFLICT: 409,
			UNAUTHORIZED: 401,
			FORBIDDEN: 403,
			NOT_FOUND: 404,
			BAD_REQUEST: 400,
			INVALID_INPUT: 400,
			VALIDATION_ERROR: 400,
			INVALID_STATE: 400,
			WORKSPACE_ACCESS_DENIED: 403,
			ADMIN_REQUIRED: 403
		}[code] ?? 500,
		code,
		message
	};
}
function mapGoogleAnalyticsIntegrationError(error) {
	if (isIntegrationScopeAppError(error)) return "Google Analytics needs updated permissions. Disconnect the integration, then connect again and approve all requested access.";
	return asErrorMessage(error);
}
//#endregion
export { isNotFoundAppError as a, mapGoogleAnalyticsIntegrationError as c, isIntegrationScopeAppError as i, resolveConvexApiErrorResponse as l, extractErrorCode as n, isReadLimitAppError as o, isConflictAppError as r, logError as s, asErrorMessage as t };
