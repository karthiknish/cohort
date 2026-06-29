import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { Yt as LoaderCircle, b as TriangleAlert, or as CircleCheck, w as Trash2 } from "../_libs/lucide-react.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Be-Tzxcj.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var variantConfig = {
	default: {
		icon: CircleCheck,
		iconClass: "text-primary",
		bgClass: "bg-accent/10",
		buttonVariant: "default"
	},
	destructive: {
		icon: Trash2,
		iconClass: "text-destructive",
		bgClass: "bg-destructive/10",
		buttonVariant: "destructive"
	},
	warning: {
		icon: TriangleAlert,
		iconClass: "text-warning",
		bgClass: "bg-warning/10",
		buttonVariant: "default"
	}
};
function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", variant = "default", isLoading = false, onConfirm, onCancel }) {
	const config = variantConfig[variant];
	const Icon = config.icon;
	const handleConfirm = async () => {
		await onConfirm();
	};
	const handleCancel = () => {
		onCancel?.();
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
			className: "max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("flex size-12 shrink-0 items-center justify-center rounded-full", config.bgClass),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-6", config.iconClass) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, {
						className: "text-lg",
						children: title
					}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, {
						className: "text-sm leading-relaxed",
						children: description
					})]
				})]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, {
				className: "mt-4 gap-2 sm:gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
					onClick: handleCancel,
					disabled: isLoading,
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: isLoading,
						children: cancelLabel
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: config.buttonVariant,
						onClick: handleConfirm,
						disabled: isLoading,
						children: [isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), confirmLabel]
					})
				})]
			})]
		})
	});
}
//#endregion
export { ConfirmDialog as t };
