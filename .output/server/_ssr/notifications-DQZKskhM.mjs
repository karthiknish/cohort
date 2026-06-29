import { n as extractErrorCode, o as isReadLimitAppError, r as isConflictAppError, s as logError, t as asErrorMessage } from "./convex-errors-sHK0JmZ7.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-DQZKskhM.js
/**
* Log a Convex/client error and show a normalized failure toast.
* Preferred catch helper for mutations and actions.
*/
function reportConvexFailure(options) {
	logError(options.error, options.context);
	return notifyFailure({
		title: options.title,
		error: options.error,
		message: options.message,
		fallbackMessage: options.fallbackMessage
	});
}
/**
* Extract a user-facing message without showing a toast (e.g. inline Alert state).
*/
function convexErrorMessage(error, fallback = "An unexpected error occurred") {
	const message = asErrorMessage(error).trim();
	if (message && message !== "An unexpected error occurred") return message;
	return fallback;
}
/**
* Centralized Notification System
*
* Provides a unified API for user-facing notifications using Sonner.
* This system complements the legacy toast() function with a more robust, type-safe API.
*
* Features:
* - Success, Error, Warning, Info, Loading toasts
* - Promise-based toasts that automatically handle loading/success/error states
* - Consistent theming and positioning
* - TypeScript type safety
* - Action buttons on toasts
* - Dismissal handling
*/
function resolveToastContent(options) {
	const title = options.title?.trim();
	if (!title) return {
		message: options.message,
		description: options.description
	};
	return {
		message: title,
		description: options.description ?? options.message
	};
}
function resolveFailureTitle(options) {
	const explicitTitle = options.title?.trim();
	if (explicitTitle) return explicitTitle;
	const error = options.error;
	if (!error) return;
	if (isReadLimitAppError(error)) return "Query too large";
	if (isConflictAppError(error)) return "Data changed";
	const code = extractErrorCode(error);
	if (!code) return;
	if (code === "TOO_MANY_REQUESTS") return "Rate limited";
	if (code.startsWith("INTEGRATION_") || code === "INTEGRATION_ERROR") return "Integration issue";
	if (code === "UNAUTHORIZED" || code === "FORBIDDEN") return "Access denied";
	if (code === "VALIDATION_ERROR" || code === "INVALID_INPUT" || code === "INVALID_STATE") return "Invalid input";
}
function resolveFailureMessage(options) {
	const explicitMessage = options.message?.trim();
	if (explicitMessage) return explicitMessage;
	const errorMessage = options.error ? asErrorMessage(options.error).trim() : "";
	if (errorMessage && errorMessage !== "An unexpected error occurred") return errorMessage;
	const fallbackMessage = options.fallbackMessage?.trim();
	if (fallbackMessage) return fallbackMessage;
	return errorMessage || "An unexpected error occurred";
}
/**
* Show a success notification
*/
function notifySuccess(options) {
	const content = resolveToastContent(options);
	return toast.success(content.message, {
		id: options.id,
		description: content.description,
		duration: options.duration ?? 4e3,
		position: options.position,
		icon: options.icon,
		onDismiss: options.onDismiss,
		onAutoClose: options.onAutoClose,
		action: options.action ? {
			label: options.action.label,
			onClick: options.action.onClick
		} : void 0
	});
}
/**
* Show an error notification
*/
function notifyError(options) {
	const content = resolveToastContent(options);
	return toast.error(content.message, {
		id: options.id,
		description: content.description,
		duration: options.duration ?? 6e3,
		position: options.position,
		icon: options.icon,
		onDismiss: options.onDismiss,
		onAutoClose: options.onAutoClose,
		action: options.action ? {
			label: options.action.label,
			onClick: options.action.onClick
		} : void 0
	});
}
/**
* Show a warning notification
*/
function notifyWarning(options) {
	const content = resolveToastContent(options);
	return toast.warning(content.message, {
		id: options.id,
		description: content.description,
		duration: options.duration ?? 5e3,
		position: options.position,
		icon: options.icon,
		onDismiss: options.onDismiss,
		onAutoClose: options.onAutoClose,
		action: options.action ? {
			label: options.action.label,
			onClick: options.action.onClick
		} : void 0
	});
}
/**
* Show an info notification
*/
function notifyInfo(options) {
	const content = resolveToastContent(options);
	return toast.info(content.message, {
		id: options.id,
		description: content.description,
		duration: options.duration ?? 4e3,
		position: options.position,
		icon: options.icon,
		onDismiss: options.onDismiss,
		onAutoClose: options.onAutoClose,
		action: options.action ? {
			label: options.action.label,
			onClick: options.action.onClick
		} : void 0
	});
}
/**
* Show a normalized failure toast for validation, network, and operation errors.
*/
function notifyFailure(options) {
	const title = resolveFailureTitle(options);
	return notifyError({
		...options,
		title,
		message: resolveFailureMessage(options)
	});
}
/**
* Dismiss a toast by ID
*/
function dismissToast(id) {
	toast.dismiss(id);
}
//#endregion
export { notifyInfo as a, reportConvexFailure as c, notifyFailure as i, dismissToast as n, notifySuccess as o, notifyError as r, notifyWarning as s, convexErrorMessage as t };
