import { r as __exportAll } from "../_runtime.mjs";
import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { Yt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog.mjs";
//#region src/features/dashboard/tasks/delete-task-dialog.tsx
var delete_task_dialog_exports = /* @__PURE__ */ __exportAll({ DeleteTaskDialog: () => DeleteTaskDialog });
var import_jsx_runtime = require_jsx_runtime();
function DeleteTaskDialog({ open, onOpenChange, task, deleting, onConfirm }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete task" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
			"Are you sure you want to delete \"",
			task?.title,
			"\"? This action cannot be undone."
		] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
			disabled: deleting,
			children: "Cancel"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
			onClick: onConfirm,
			disabled: deleting,
			className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			children: deleting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Deleting…"]
			}) : "Delete"
		})] })] })
	});
}
//#endregion
export { delete_task_dialog_exports as t };
