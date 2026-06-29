import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, l as useMutation, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { v as getPreviewAdminProblemReports } from "./preview-data-CXkRNfsX.mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { _ as format } from "../_libs/date-fns.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, t as Card } from "./card-CDBnK3ba.mjs";
import { a as notifyInfo, c as reportConvexFailure, o as notifySuccess } from "./notifications-DQZKskhM.mjs";
import { n as api } from "./rate-limiter-convex-Dr72h9nD.mjs";
import { Y as Search, Yt as LoaderCircle, Zn as Clock, cr as CircleAlert, or as CircleCheck, rt as RefreshCw, w as Trash2 } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { a as TableHead, i as TableCell, n as TableBody, o as TableHeader, r as TableCaption, s as TableRow, t as Table } from "./table-DnyDXt-8.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { r as useConvexQueryError } from "./use-convex-query-error-P2IX7lhG.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { t as ConfirmDialog } from "./confirm-dialog-D0Fe9niR.mjs";
import { t as AdminPageShell } from "./admin-page-shell-DKKo3NPm.mjs";
import { t as AdminTablePageSkeleton } from "./admin-table-page-skeleton-THYDnWPV.mjs";
import { t as AdminQueryErrorAlert } from "./admin-query-error-alert-Clikw_eH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/issues-4I7246Hg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var HIGH_SEVERITY_CLASS_NAME = "bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20";
function getProblemReportSeverityDisplay(severity) {
	switch (severity) {
		case "critical": return {
			label: "Critical",
			variant: "destructive"
		};
		case "high": return {
			label: "High",
			variant: "default",
			className: HIGH_SEVERITY_CLASS_NAME
		};
		case "medium": return {
			label: "Medium",
			variant: "secondary"
		};
		case "low": return {
			label: "Low",
			variant: "outline"
		};
		default: return {
			label: severity,
			variant: "default"
		};
	}
}
function getProblemReportStatusDisplay(status) {
	switch (status) {
		case "resolved": return {
			icon: "resolved",
			className: "size-4 text-success"
		};
		case "in-progress": return {
			icon: "in-progress",
			className: "size-4 text-info"
		};
		case "open": return {
			icon: "open",
			className: "size-4 text-warning"
		};
		default: return { icon: null };
	}
}
function formatProblemReportDate(date, formatDate) {
	if (!date) return "N/A";
	return formatDate(new Date(date));
}
function filterProblemReports(reports, options) {
	const normalizedSearch = options.searchTerm.trim().toLowerCase();
	return reports.filter((report) => {
		if (options.statusFilter !== "all" && report.status !== options.statusFilter) return false;
		if (!normalizedSearch) return true;
		return report.title.toLowerCase().includes(normalizedSearch) || (report.userEmail ?? "").toLowerCase().includes(normalizedSearch) || (report.userName ?? "").toLowerCase().includes(normalizedSearch);
	});
}
function AdminIssuesToolbarActions({ loading, onRefresh }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		onClick: onRefresh,
		variant: "outline",
		size: "sm",
		disabled: loading,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
			className: cn("mr-2 size-4", loading && "animate-spin"),
			"aria-hidden": true
		}), "Refresh"]
	});
}
function SeverityBadge({ severity }) {
	const display = getProblemReportSeverityDisplay(severity);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: display.variant === "default" ? void 0 : display.variant,
		className: display.className,
		children: display.label
	});
}
function StatusIcon({ status }) {
	const display = getProblemReportStatusDisplay(status);
	switch (display.icon) {
		case "resolved": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: display.className });
		case "in-progress": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: display.className });
		case "open": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: display.className });
		default: return null;
	}
}
function ProblemReportRow({ deletingId, onDeleteTarget, onStatusUpdate, report, updatingId }) {
	const handleStatusChange = (value) => onStatusUpdate(report.id, value);
	const handleDeleteClick = () => {
		onDeleteTarget(report);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
			scope: "row",
			className: cn("max-w-75 p-4 text-left align-middle font-normal"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-medium",
				children: report.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "truncate text-xs text-muted-foreground",
				title: report.description,
				children: report.description
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm",
			children: report.userName
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted-foreground",
			children: report.userEmail
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeverityBadge, { severity: report.severity }) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIcon, { status: report.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: report.status,
				onValueChange: handleStatusChange,
				disabled: updatingId === report.id,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "h-8 w-32.5 border-none bg-transparent p-0 hover:bg-accent focus:ring-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "open",
						children: "Open"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "in-progress",
						children: "In Progress"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "resolved",
						children: "Resolved"
					})
				] })]
			})]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-sm whitespace-nowrap",
			children: formatProblemReportDate(report.createdAt, (value) => format(value, "MMM d, h:mm a"))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-right",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				onClick: handleDeleteClick,
				className: "size-8 text-destructive hover:bg-destructive/10 hover:text-destructive",
				disabled: deletingId === report.id,
				"aria-label": `Delete report ${report.title}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
					className: "size-4",
					"aria-hidden": true
				})
			})
		})
	] }, report.id);
}
function adminIssuesReducer(state, action) {
	switch (action.type) {
		case "setStatusFilter": return {
			...state,
			statusFilter: action.value
		};
		case "setSearchTerm": return {
			...state,
			searchTerm: action.value
		};
		case "setUpdatingId": return {
			...state,
			updatingId: action.value
		};
		case "setDeleteTarget": return {
			...state,
			deleteTarget: action.value
		};
		case "setDeletingId": return {
			...state,
			deletingId: action.value
		};
		case "updatePreviewReports": return {
			...state,
			previewReports: action.updater(state.previewReports)
		};
		default: return state;
	}
}
function AdminIssuesPage() {
	const { isPreviewMode } = usePreview();
	const [state, dispatch] = (0, import_react.useReducer)(adminIssuesReducer, {
		statusFilter: "all",
		searchTerm: "",
		updatingId: null,
		deleteTarget: null,
		deletingId: null,
		previewReports: getPreviewAdminProblemReports()
	});
	const { statusFilter, searchTerm, updatingId, deleteTarget, deletingId, previewReports } = state;
	const reports = useQuery(api.problemReports.list, isPreviewMode ? "skip" : {
		status: statusFilter === "all" ? null : statusFilter,
		limit: 200
	});
	const updateReport = useMutation(api.problemReports.update);
	const removeReport = useMutation(api.problemReports.remove);
	const resolvedReports = isPreviewMode ? previewReports : reports ?? [];
	const loading = isPreviewMode ? false : reports === void 0;
	const reportsQueryError = useConvexQueryError({
		data: reports,
		skipped: isPreviewMode,
		loading,
		fallbackMessage: "Unable to load problem reports."
	});
	const handleStatusUpdate = (id, newStatus) => {
		if (isPreviewMode) {
			dispatch({
				type: "updatePreviewReports",
				updater: (current) => current.map((report) => report.id === id ? {
					...report,
					status: newStatus,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				} : report)
			});
			notifyInfo({
				title: "Preview mode",
				message: `Sample issue marked as ${newStatus}.`
			});
			return;
		}
		dispatch({
			type: "setUpdatingId",
			value: id
		});
		updateReport({
			legacyId: id,
			status: newStatus
		}).then(() => {
			notifySuccess({
				title: "Status updated",
				message: `Report marked as ${newStatus}`
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "AdminIssuesPage:updateStatus",
				title: "Status update failed",
				fallbackMessage: "Unable to update report status."
			});
		}).finally(() => {
			dispatch({
				type: "setUpdatingId",
				value: null
			});
		});
	};
	const handleDelete = () => {
		if (!deleteTarget || deletingId === deleteTarget.id) return;
		if (isPreviewMode) {
			dispatch({
				type: "updatePreviewReports",
				updater: (current) => current.filter((report) => report.id !== deleteTarget.id)
			});
			dispatch({
				type: "setDeleteTarget",
				value: null
			});
			notifyInfo({
				title: "Preview mode",
				message: "Sample issue removed locally for this session."
			});
			return;
		}
		dispatch({
			type: "setDeletingId",
			value: deleteTarget.id
		});
		removeReport({ legacyId: deleteTarget.id }).then(() => {
			notifySuccess({
				title: "Report deleted",
				message: "The report has been removed."
			});
			dispatch({
				type: "setDeleteTarget",
				value: null
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "AdminIssuesPage:deleteReport",
				title: "Delete failed",
				fallbackMessage: "Unable to delete report."
			});
		}).finally(() => {
			dispatch({
				type: "setDeletingId",
				value: null
			});
		});
	};
	const handleRefresh = () => {
		if (isPreviewMode) {
			dispatch({
				type: "updatePreviewReports",
				updater: () => getPreviewAdminProblemReports()
			});
			notifyInfo({
				title: "Preview data refreshed",
				message: "Showing sample admin issue reports."
			});
		}
	};
	const handleSearchTermChange = (event) => {
		dispatch({
			type: "setSearchTerm",
			value: event.target.value
		});
	};
	const handleDeleteTargetChange = (report) => {
		dispatch({
			type: "setDeleteTarget",
			value: report
		});
	};
	const handleDeleteDialogOpenChange = (open) => {
		if (!open && deletingId !== deleteTarget?.id) dispatch({
			type: "setDeleteTarget",
			value: null
		});
	};
	const handleCancelDelete = () => {
		dispatch({
			type: "setDeleteTarget",
			value: null
		});
	};
	const handleStatusFilterChange = (value) => {
		dispatch({
			type: "setStatusFilter",
			value
		});
	};
	const filteredReports = filterProblemReports(resolvedReports, {
		searchTerm,
		statusFilter
	});
	const issuesToolbarActions = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminIssuesToolbarActions, {
		loading,
		onRefresh: handleRefresh
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: loading && resolvedReports.length === 0,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTablePageSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminPageShell, {
			title: "Reported issues",
			description: "Review, triage, and resolve user-submitted problem reports from across the product.",
			isPreviewMode,
			actions: issuesToolbarActions,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/80 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4 md:flex-row md:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Search by title, user, or email…",
								className: "pl-9",
								value: searchTerm,
								onChange: handleSearchTermChange
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: statusFilter,
							onValueChange: handleStatusFilterChange,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "w-full md:w-45",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Status Filter" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All Statuses"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "open",
									children: "Open"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "in-progress",
									children: "In Progress"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "resolved",
									children: "Resolved"
								})
							] })]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminQueryErrorAlert, {
						error: reportsQueryError,
						title: "Unable to load reports"
					}), loading && resolvedReports.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
						className: "flex flex-col items-center justify-center py-12 text-muted-foreground",
						"aria-live": "polite",
						"aria-busy": "true",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "mb-4 size-8 animate-spin",
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Loading reports…" })]
					}) : filteredReports.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg border-dashed",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mb-4 size-8 opacity-20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: reportsQueryError ? reportsQueryError : "No issues found matching your criteria." })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-md border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCaption, {
								className: "sr-only",
								children: "Problem reports from workspace users"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									scope: "col",
									children: "Issue"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									scope: "col",
									children: "User"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									scope: "col",
									children: "Severity"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									scope: "col",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									scope: "col",
									children: "Reported"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									scope: "col",
									className: "text-right",
									children: "Actions"
								})
							] }) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filteredReports.map((report) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProblemReportRow, {
								deletingId,
								onDeleteTarget: handleDeleteTargetChange,
								onStatusUpdate: handleStatusUpdate,
								report,
								updatingId
							}, report.id)) })
						] })
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(deleteTarget),
				onOpenChange: handleDeleteDialogOpenChange,
				title: "Delete reported issue",
				description: deleteTarget ? `Delete “${deleteTarget.title}”? This action cannot be undone.` : "This action cannot be undone.",
				confirmLabel: "Delete report",
				cancelLabel: "Cancel",
				variant: "destructive",
				isLoading: deletingId === deleteTarget?.id,
				onConfirm: handleDelete,
				onCancel: handleCancelDelete
			})]
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminIssuesPage, {});
//#endregion
export { SplitComponent as component };
