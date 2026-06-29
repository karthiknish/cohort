import { o as __toESM, r as __exportAll } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { Nt as Minus, Wr as ArrowDown, Yt as LoaderCircle, Zt as ListTodo, b as TriangleAlert, gt as Pencil, lt as Plus, rt as RefreshCw, w as Trash2, zn as Ellipsis, zr as ArrowUp } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils.mjs";
import { t as Button } from "./button.mjs";
import { t as Skeleton } from "./skeleton.mjs";
import { i as DataTable, n as DataTableColumnHeader, t as Checkbox } from "./checkbox.mjs";
import { c as DropdownMenuSeparator, i as DropdownMenuItem, l as DropdownMenuTrigger, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu.mjs";
import { A as TASKS_THEME, _ as isOverdue, d as formatPriorityLabel, f as formatStatusLabel, h as isDueSoon, i as STATUS_ICONS, t as PRIORITY_ORDER, u as formatDate, w as statusTablePillClass } from "./task-types.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar.mjs";
import { i as useTaskAssigneeLabel, n as TaskCard, o as TASK_STATUSES, t as TaskViewDialog } from "./task-view-dialog.mjs";
//#region src/features/dashboard/tasks/task-table.tsx
var import_jsx_runtime = require_jsx_runtime();
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** Display key for a task row (Jira-style). */
function formatTaskKey(taskId) {
	const compact = taskId.replace(/[^a-zA-Z0-9]/g, "");
	if (compact.length <= 6) return `TASK-${compact.toUpperCase() || "1"}`;
	const tail = compact.slice(-5).toUpperCase();
	return `TASK-${compact.slice(0, 2).toUpperCase()}${tail}`;
}
//#endregion
//#region src/features/dashboard/tasks/task-data-table.tsx
var TaskDataTableActionsContext = (0, import_react.createContext)(null);
function useTaskDataTableActions() {
	const context = (0, import_react.use)(TaskDataTableActionsContext);
	if (!context) throw new Error("TaskDataTableActionsContext is missing");
	return context;
}
function stopRowActivation(event) {
	event.stopPropagation();
}
function assigneeInitials(name) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	const first = parts[0];
	if (!first) return "?";
	if (parts.length === 1) return first.slice(0, 2).toUpperCase();
	const second = parts[1];
	return `${first[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase();
}
function PriorityIndicator({ priority }) {
	if (priority === "urgent") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 text-xs font-medium text-destructive",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {
			className: "size-3.5",
			"aria-hidden": true
		}), "Highest"]
	});
	if (priority === "high") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 text-xs font-medium text-warning",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {
			className: "size-3.5",
			"aria-hidden": true
		}), "High"]
	});
	if (priority === "low") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 text-xs font-medium text-info",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, {
			className: "size-3.5",
			"aria-hidden": true
		}), "Low"]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 text-xs font-medium text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
			className: "size-3.5",
			"aria-hidden": true
		}), formatPriorityLabel(priority)]
	});
}
function TaskSelectHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "sr-only",
		children: "Select"
	});
}
function TaskSelectCell({ row }) {
	const { onSelectToggle, selectedTaskIds } = useTaskDataTableActions();
	const task = row.original;
	const handleChange = (checked) => {
		onSelectToggle?.(task.id, checked);
	};
	if (!onSelectToggle) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex justify-center",
		onPointerDown: stopRowActivation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
			checked: selectedTaskIds?.has(task.id) ?? false,
			onCheckedChange: handleChange,
			"aria-label": `Select ${task.title}`,
			className: "size-4 rounded border-border"
		})
	});
}
function TaskKeyHeader({ column }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableColumnHeader, {
		column,
		title: "Key"
	});
}
function TaskKeyCell({ row }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "truncate font-mono text-xs text-muted-foreground",
		children: formatTaskKey(row.original.id)
	});
}
function TaskSummaryHeader({ column }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableColumnHeader, {
		column,
		title: "Summary"
	});
}
function TaskSummaryCell({ row }) {
	const { pendingStatusUpdates } = useTaskDataTableActions();
	const task = row.original;
	const isPending = pendingStatusUpdates.has(task.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("truncate font-medium text-foreground", task.status === "completed" && "text-muted-foreground line-through decoration-border"),
			children: task.title
		}), isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			className: "size-3.5 shrink-0 animate-spin text-muted-foreground",
			"aria-hidden": true
		}) : null]
	});
}
function TaskStatusHeader({ column }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableColumnHeader, {
		column,
		title: "Status"
	});
}
function TaskStatusCell({ row }) {
	const status = row.original.status;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex max-w-full items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", statusTablePillClass[status]),
		children: formatStatusLabel(status)
	});
}
function TaskAssigneeHeader({ column }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableColumnHeader, {
		column,
		title: "Assignee"
	});
}
function TaskAssigneeCell({ row }) {
	const rawAssignee = (row.original.assignedTo ?? [])[0] ?? null;
	const assignee = useTaskAssigneeLabel(rawAssignee ?? "");
	if (!rawAssignee) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-muted-foreground",
		children: "Unassigned"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
			className: "size-6 shrink-0 border border-border/60",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
				className: "bg-muted text-[10px] font-medium text-muted-foreground",
				children: assigneeInitials(assignee)
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate text-xs text-foreground",
			children: assignee
		})]
	});
}
function TaskDueDateHeader({ column }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableColumnHeader, {
		column,
		title: "Due date"
	});
}
function TaskDueDateCell({ row }) {
	const task = row.original;
	const overdue = isOverdue(task);
	const dueSoon = isDueSoon(task);
	const dueLabel = task.dueDate ? formatDate(task.dueDate) : "—";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("text-xs tabular-nums", overdue ? "font-medium text-destructive" : dueSoon ? "text-warning" : "text-muted-foreground"),
		children: dueLabel
	});
}
function TaskPriorityHeader({ column }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableColumnHeader, {
		column,
		title: "Priority"
	});
}
function TaskPriorityCell({ row }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriorityIndicator, { priority: row.original.priority });
}
function TaskActionsHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-right",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Actions"
		})
	});
}
function TaskStatusMenuItem({ task, status, onQuickStatusChange }) {
	const onQuickStatusSelect = () => {
		onQuickStatusChange(task, status);
	};
	const NextStatusIcon = STATUS_ICONS[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
		onClick: onQuickStatusSelect,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NextStatusIcon, { className: "mr-2 size-4" }), formatStatusLabel(status)]
	});
}
function TaskActionsCell({ row }) {
	const { onEdit, onDelete, onQuickStatusChange } = useTaskDataTableActions();
	const task = row.original;
	const handleEdit = () => {
		onEdit(task);
	};
	const handleDelete = () => {
		onDelete(task);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex justify-end",
		onPointerDown: stopRowActivation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "size-7 text-muted-foreground",
				"aria-label": `Actions for ${task.title}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
			align: "end",
			className: "w-48",
			children: [
				TASK_STATUSES.flatMap((status) => status !== task.status ? [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskStatusMenuItem, {
					task,
					status,
					onQuickStatusChange
				}, status)] : []),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					onClick: handleEdit,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-2 size-4" }), "Edit"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					onClick: handleDelete,
					className: "text-destructive focus:text-destructive",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), "Delete"]
				})
			]
		})] })
	});
}
function createTaskColumns(showSelection) {
	const columns = [];
	if (showSelection) columns.push({
		id: "select",
		header: TaskSelectHeader,
		cell: TaskSelectCell,
		enableSorting: false,
		enableHiding: false,
		size: 44
	});
	columns.push({
		id: "key",
		accessorFn: (task) => formatTaskKey(task.id),
		header: TaskKeyHeader,
		cell: TaskKeyCell,
		enableSorting: true,
		size: 96
	}, {
		accessorKey: "title",
		header: TaskSummaryHeader,
		cell: TaskSummaryCell,
		enableSorting: true,
		size: 280
	}, {
		accessorKey: "status",
		header: TaskStatusHeader,
		cell: TaskStatusCell,
		enableSorting: true,
		size: 120
	}, {
		id: "assignee",
		accessorFn: (task) => (task.assignedTo ?? [])[0] ?? "",
		header: TaskAssigneeHeader,
		cell: TaskAssigneeCell,
		enableSorting: true,
		size: 152
	}, {
		accessorKey: "dueDate",
		header: TaskDueDateHeader,
		cell: TaskDueDateCell,
		enableSorting: true,
		sortingFn: (rowA, rowB) => {
			const a = rowA.original.dueDate;
			const b = rowB.original.dueDate;
			if (!a && !b) return 0;
			if (!a) return 1;
			if (!b) return -1;
			return a.localeCompare(b);
		},
		size: 104
	}, {
		accessorKey: "priority",
		header: TaskPriorityHeader,
		cell: TaskPriorityCell,
		enableSorting: true,
		sortingFn: (rowA, rowB) => PRIORITY_ORDER[rowA.original.priority] - PRIORITY_ORDER[rowB.original.priority],
		size: 104
	}, {
		id: "actions",
		header: TaskActionsHeader,
		cell: TaskActionsCell,
		enableSorting: false,
		enableHiding: false,
		size: 56
	});
	return columns;
}
function TaskDataTable({ tasks, pendingStatusUpdates, onOpen, onEdit, onDelete, onQuickStatusChange, selectedTaskIds, onSelectToggle, loading = false, className }) {
	const columns = createTaskColumns(Boolean(onSelectToggle));
	const actions = {
		pendingStatusUpdates,
		selectedTaskIds,
		onOpen,
		onEdit,
		onDelete,
		onQuickStatusChange,
		onSelectToggle
	};
	const rowClassName = (task) => cn(pendingStatusUpdates.has(task.id) && "pointer-events-none opacity-60", selectedTaskIds?.has(task.id) && "bg-primary/4", task.status === "completed" && "opacity-90");
	const getRowId = (task) => task.id;
	const handleRowClick = (task) => {
		onOpen(task);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskDataTableActionsContext, {
		value: actions,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			className: cn("rounded-none border-0 shadow-none", className),
			columns,
			data: tasks,
			getRowId,
			loading,
			loadingRows: 5,
			onRowClick: handleRowClick,
			rowClassName,
			showPagination: false,
			stickyHeader: true
		})
	});
}
//#endregion
//#region src/features/dashboard/tasks/task-list-sections.tsx
var noop = () => {};
var EMPTY_PENDING_STATUS_UPDATES = /* @__PURE__ */ new Set();
function TaskListLoadingState({ viewMode }) {
	if (viewMode === "grid") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: [
		"task-skeleton-1",
		"task-skeleton-2",
		"task-skeleton-3",
		"task-skeleton-4",
		"task-skeleton-5",
		"task-skeleton-6"
	].map((skeletonKey) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-44 w-full rounded-2xl" }, skeletonKey)) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskDataTable, {
		tasks: [],
		loading: true,
		onOpen: noop,
		onEdit: noop,
		onDelete: noop,
		onQuickStatusChange: noop,
		pendingStatusUpdates: EMPTY_PENDING_STATUS_UPDATES
	});
}
function TaskListErrorState({ error, loading, onRefresh, viewMode }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: viewMode === "grid" ? "col-span-full" : "",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-4 my-8 px-4 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "mx-auto size-8 text-destructive",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-destructive",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "mt-4 h-8",
					onClick: onRefresh,
					disabled: loading,
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 size-4" }), "Try again"]
				})
			]
		})
	});
}
function TaskListEmptyState({ emptyStateMessage, showEmptyStateFiltered, viewMode, onClearFilters, onCreateTask }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: viewMode === "grid" ? "col-span-full p-4" : "p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: TASKS_THEME.emptyPanel,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4 flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-background shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListTodo, {
						className: "size-6 text-muted-foreground",
						"aria-hidden": true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-base font-semibold tracking-tight text-foreground",
					children: "No tasks here yet"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground",
					children: showEmptyStateFiltered ? "Nothing matches your filters. Try clearing search or status filters." : emptyStateMessage
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [showEmptyStateFiltered && onClearFilters ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						className: "h-9",
						onClick: onClearFilters,
						children: "Clear filters"
					}) : null, !showEmptyStateFiltered && onCreateTask ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						className: "h-9 gap-1.5",
						onClick: onCreateTask,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							className: "size-4",
							"aria-hidden": true
						}), "Create task"]
					}) : null]
				})
			]
		})
	});
}
function TaskListLoadMore({ loadingMore, onLoadMore, viewMode }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: viewMode === "grid" ? "col-span-full border-t border-border/80 px-4 py-3" : "border-t border-border/80 px-4 py-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			className: "h-8 w-full text-muted-foreground",
			onClick: onLoadMore,
			disabled: loadingMore,
			children: loadingMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Loading…"]
			}) : "Load more"
		})
	});
}
function TaskListItems({ onDelete, onEdit, onOpen, onQuickStatusChange, onSelectToggle, pendingStatusUpdates, selectedTaskIds, tasks, viewMode }) {
	if (viewMode === "grid") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: tasks.map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCard, {
			task,
			variant: "grid",
			isPendingUpdate: pendingStatusUpdates.has(task.id),
			onOpen,
			onEdit,
			onDelete,
			onQuickStatusChange,
			selected: selectedTaskIds?.has(task.id),
			onSelectToggle
		})
	}, task.id)) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskDataTable, {
		tasks,
		pendingStatusUpdates,
		onOpen,
		onEdit,
		onDelete,
		onQuickStatusChange,
		selectedTaskIds,
		onSelectToggle
	});
}
//#endregion
//#region src/features/dashboard/tasks/task-list.tsx
var task_list_exports = /* @__PURE__ */ __exportAll({ TaskList: () => TaskList });
var EMPTY_TASK_PARTICIPANTS = [];
function TaskList({ tasks, viewMode, loading, initialLoading, error, pendingStatusUpdates, onEdit, onDelete, onQuickStatusChange, onRefresh, loadingMore, hasMore, onLoadMore, emptyStateMessage, showEmptyStateFiltered, onEmptyClearFilters, onEmptyCreateTask, selectedTaskIds, onToggleTaskSelection, workspaceId = null, userId = null, userName = null, userRole = null, participants = EMPTY_TASK_PARTICIPANTS }) {
	"use no memo";
	const [viewingTask, setViewingTask] = (0, import_react.useState)(null);
	const openTask = (task) => {
		setViewingTask(task);
	};
	const handleTaskViewDialogOpenChange = (nextOpen) => {
		if (!nextOpen) setViewingTask(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: viewMode === "grid" ? "grid auto-rows-fr gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "min-h-[12rem] px-1 pb-1",
			children: [
				initialLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskListLoadingState, { viewMode }) : null,
				!loading && error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskListErrorState, {
					error,
					loading,
					onRefresh,
					viewMode
				}) : null,
				!loading && !error && tasks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskListEmptyState, {
					emptyStateMessage,
					showEmptyStateFiltered,
					viewMode,
					onClearFilters: onEmptyClearFilters,
					onCreateTask: onEmptyCreateTask
				}) : null,
				!loading && !error && tasks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskListItems, {
					tasks,
					viewMode,
					pendingStatusUpdates,
					onOpen: openTask,
					onEdit,
					onDelete,
					onQuickStatusChange,
					selectedTaskIds,
					onSelectToggle: onToggleTaskSelection
				}) : null
			]
		}),
		!initialLoading && !error && hasMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskListLoadMore, {
			loadingMore,
			onLoadMore,
			viewMode
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskViewDialog, {
			open: Boolean(viewingTask),
			onOpenChange: handleTaskViewDialogOpenChange,
			task: viewingTask,
			onEdit,
			onDelete,
			onQuickStatusChange,
			workspaceId,
			userId,
			userName,
			userRole,
			participants
		})
	] });
}
//#endregion
export { task_list_exports as t };
