import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as asErrorMessage } from "./convex-errors-sHK0JmZ7.mjs";
import { c as reportConvexFailure } from "./notifications-DQZKskhM.mjs";
import { cr as CircleAlert } from "../_libs/lucide-react.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./alert-DYeH1Q3p.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-admin-action-error-uHYce7YY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Inline banner for the last failed admin mutation (dismissible).
*/
function AdminActionErrorAlert({ error, title = "Last action failed", onDismiss }) {
	if (!error) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
		variant: "destructive",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: title }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error }), onDismiss ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: onDismiss,
					children: "Dismiss"
				}) : null]
			})
		]
	});
}
var ADMIN_USER_ROLES = [
	"admin",
	"team",
	"client"
];
var ADMIN_USER_STATUSES = [
	"active",
	"invited",
	"pending",
	"disabled",
	"suspended"
];
function useAdminActionError() {
	const [actionError, setActionError] = (0, import_react.useState)(null);
	const clearActionError = () => {
		setActionError(null);
	};
	const reportActionFailure = (options) => {
		const message = asErrorMessage(options.error);
		setActionError(message);
		reportConvexFailure({
			error: options.error,
			context: options.context,
			title: options.title,
			fallbackMessage: options.fallbackMessage ?? message
		});
	};
	return {
		actionError,
		clearActionError,
		reportActionFailure,
		setActionError
	};
}
//#endregion
export { useAdminActionError as i, ADMIN_USER_STATUSES as n, AdminActionErrorAlert as r, ADMIN_USER_ROLES as t };
