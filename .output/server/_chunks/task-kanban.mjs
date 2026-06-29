import { o as __toESM, r as __exportAll } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { Yt as LoaderCircle, Zt as ListTodo, b as TriangleAlert, rt as RefreshCw, yn as GripVertical } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils.mjs";
import { t as Badge } from "./badge.mjs";
import { t as Button } from "./button.mjs";
import { t as Skeleton } from "./skeleton.mjs";
import { C as statusLaneColors, E as taskPillColors, P as LiveRegion, f as formatStatusLabel } from "./task-types.mjs";
import { t as ScrollArea } from "./scroll-area.mjs";
import { n as TaskCard, o as TASK_STATUSES, t as TaskViewDialog } from "./task-view-dialog.mjs";
//#region src/features/dashboard/tasks/task-kanban.tsx
var task_kanban_exports = /* @__PURE__ */ __exportAll({ TaskKanban: () => TaskKanban });
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var INITIAL_TASK_KANBAN_STATE = {
	draggedTask: null,
	dragOverStatus: null,
	viewingTask: null,
	boardAnnouncement: ""
};
function taskKanbanReducer(state, action) {
	switch (action.type) {
		case "startDrag": return {
			...state,
			draggedTask: action.draggedTask
		};
		case "setDragOverStatus": return {
			...state,
			dragOverStatus: action.status
		};
		case "resetDragState": return {
			...state,
			draggedTask: null,
			dragOverStatus: null
		};
		case "setBoardAnnouncement": return {
			...state,
			boardAnnouncement: action.message
		};
		case "setViewingTask": return {
			...state,
			viewingTask: action.task
		};
		default: return state;
	}
}
var EMPTY_SELECTED_TASK_IDS = /* @__PURE__ */ new Set();
var EMPTY_TASK_PARTICIPANTS = [];
var KANBAN_STATUSES = TASK_STATUSES.filter((status) => status !== "archived");
function TaskKanban({ tasks, loading, initialLoading, error, pendingStatusUpdates, onEdit, onDelete, onQuickStatusChange, onRefresh, loadingMore, hasMore, onLoadMore, emptyStateMessage, showEmptyStateFiltered, onEmptyClearFilters, onEmptyCreateTask, onClone, onShare, searchQuery = "", selectedTaskIds = EMPTY_SELECTED_TASK_IDS, onToggleTaskSelection, bulkActive = false, workspaceId = null, userId = null, userName = null, userRole = null, participants = EMPTY_TASK_PARTICIPANTS }) {
	const [{ draggedTask, dragOverStatus, viewingTask, boardAnnouncement }, dispatch] = (0, import_react.useReducer)(taskKanbanReducer, INITIAL_TASK_KANBAN_STATE);
	const keyboardInstructionsId = (0, import_react.useId)();
	const columns = KANBAN_STATUSES.map((status) => ({
		status,
		label: formatStatusLabel(status),
		items: tasks.filter((task) => task.status === status)
	}));
	const handleDragStart = (e, task) => {
		if (bulkActive) return;
		dispatch({
			type: "startDrag",
			draggedTask: {
				id: task.id,
				sourceStatus: task.status
			}
		});
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", task.id);
	};
	const handleDragOver = (e, status) => {
		if (bulkActive) return;
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		dispatch({
			type: "setDragOverStatus",
			status
		});
	};
	const handleDragLeave = () => {
		dispatch({
			type: "setDragOverStatus",
			status: null
		});
	};
	const handleDrop = (e, targetStatus) => {
		e.preventDefault();
		dispatch({
			type: "setDragOverStatus",
			status: null
		});
		if (!draggedTask || bulkActive) return;
		const task = tasks.find((t) => t.id === draggedTask.id);
		if (task && draggedTask.sourceStatus !== targetStatus) {
			dispatch({
				type: "setBoardAnnouncement",
				message: `${task.title} moved to ${formatStatusLabel(targetStatus)}.`
			});
			onQuickStatusChange(task, targetStatus);
		}
		dispatch({ type: "resetDragState" });
	};
	const handleKeyboardMoveTask = (task, direction) => {
		if (bulkActive || pendingStatusUpdates.has(task.id)) return;
		const currentIndex = KANBAN_STATUSES.indexOf(task.status);
		const targetStatus = direction === "previous" ? KANBAN_STATUSES[currentIndex - 1] : KANBAN_STATUSES[currentIndex + 1];
		if (!targetStatus) {
			dispatch({
				type: "setBoardAnnouncement",
				message: `${task.title} is already in the ${formatStatusLabel(task.status)} column.`
			});
			return;
		}
		dispatch({
			type: "setBoardAnnouncement",
			message: `${task.title} moved to ${formatStatusLabel(targetStatus)}.`
		});
		onQuickStatusChange(task, targetStatus);
	};
	const handleDragEnd = () => {
		dispatch({ type: "resetDragState" });
	};
	const handleViewTask = (task) => {
		dispatch({
			type: "setViewingTask",
			task
		});
	};
	const handleViewingTaskDialogOpenChange = (open) => {
		if (!open) dispatch({
			type: "setViewingTask",
			task: null
		});
	};
	if (initialLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-4 overflow-hidden px-4 pb-4",
		children: [
			"todo",
			"in-progress",
			"review",
			"completed"
		].map((columnKey) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-[min(68vh,560px)] w-[280px] shrink-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-muted/15 p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mb-3 h-8 w-full rounded-lg" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mb-3 h-28 w-full rounded-xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full rounded-xl" })
			]
		}, columnKey))
	});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mx-auto size-12 text-destructive" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 text-lg font-semibold text-destructive",
				children: "Unable to load board"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-destructive/80",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				className: "mt-6 border-destructive/20 hover:bg-destructive/10",
				onClick: onRefresh,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 size-4" }), "Try Again"]
			})
		]
	});
	if (tasks.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-dashed border-border/70 bg-muted/20 p-10 text-center sm:p-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto flex size-16 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-border/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListTodo, {
					className: "size-8 text-muted-foreground",
					"aria-hidden": true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 text-xl font-semibold tracking-tight text-foreground",
				children: "No tasks on the board"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground",
				children: showEmptyStateFiltered ? "Nothing matches these filters. Clear them or switch to list view for bulk actions." : emptyStateMessage
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap items-center justify-center gap-2",
				children: [showEmptyStateFiltered && onEmptyClearFilters ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					onClick: onEmptyClearFilters,
					children: "Clear filters"
				}) : null, !showEmptyStateFiltered && onEmptyCreateTask ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					onClick: onEmptyCreateTask,
					children: "Create task"
				}) : null]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 px-4 pb-4 pt-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveRegion, { message: boardAnnouncement }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: keyboardInstructionsId,
				className: "sr-only",
				children: "Use Alt plus Left Arrow or Alt plus Right Arrow on a focused task card to move it between workflow columns. You can also drag and drop tasks with a pointer."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 px-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Drag tasks between columns to update status. Click a card to open details."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("shrink-0 rounded-full border px-3 py-1 text-xs font-semibold tabular-nums", taskPillColors.count),
					children: [
						tasks.length,
						" ",
						tasks.length === 1 ? "task" : "tasks"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex w-full gap-4 pb-4 pr-2 min-h-[min(72vh,640px)]",
					children: columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanColumn, {
						bulkActive,
						column,
						dragOverStatus,
						draggedTask,
						handleDragEnd,
						handleDragLeave,
						handleDragOver,
						handleDrop,
						handleDragStart,
						keyboardInstructionsId,
						onKeyboardMoveTask: handleKeyboardMoveTask,
						handleViewTask,
						onClone,
						onDelete,
						onEdit,
						onQuickStatusChange,
						onShare,
						onToggleTaskSelection,
						pendingStatusUpdates,
						searchQuery,
						selectedTaskIds
					}, column.status))
				})
			}),
			hasMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center pt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					className: "h-10 gap-2 rounded-xl px-6 font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground",
					onClick: onLoadMore,
					disabled: loadingMore || loading,
					children: [loadingMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-primary" }) : null, loadingMore ? "Loading more tasks…" : "Load more tasks"]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskViewDialog, {
				task: viewingTask,
				open: !!viewingTask,
				workspaceId,
				userId,
				userName,
				userRole,
				participants,
				onEdit,
				onDelete,
				onQuickStatusChange,
				onOpenChange: handleViewingTaskDialogOpenChange
			})
		]
	});
}
function KanbanColumn({ bulkActive, column, dragOverStatus, draggedTask, handleDragEnd, handleDragLeave, handleDragOver, handleDrop, handleDragStart, keyboardInstructionsId, onKeyboardMoveTask, handleViewTask, onClone, onDelete, onEdit, onQuickStatusChange, onShare, onToggleTaskSelection, pendingStatusUpdates, searchQuery, selectedTaskIds }) {
	const isDragTarget = dragOverStatus === column.status;
	const isDraggingFrom = draggedTask?.sourceStatus === column.status;
	const handleColumnDragOver = (event) => handleDragOver(event, column.status);
	const handleColumnDrop = (event) => handleDrop(event, column.status);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": `${column.label} task lane`,
		className: cn("flex min-h-[min(68vh,560px)] w-[min(100%,280px)] shrink-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-muted/15 shadow-sm transition-colors sm:w-[280px]", isDragTarget && "border-primary/30 bg-primary/5 ring-1 ring-primary/15", isDraggingFrom && !isDragTarget && "opacity-60"),
		onDragOver: handleColumnDragOver,
		onDragLeave: handleDragLeave,
		onDrop: handleColumnDrop,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2 border-b border-border/60 bg-card/80 px-3.5 py-3 backdrop-blur-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("size-2 shrink-0 rounded-full", statusLaneColors[column.status]),
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-sm font-semibold text-foreground",
					children: column.label
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "secondary",
				className: "h-6 shrink-0 rounded-full px-2 text-[11px] tabular-nums",
				children: column.items.length
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "min-h-0 flex-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "list-none space-y-3 p-3",
				children: column.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: cn("list-none flex min-h-[7.5rem] flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-card/60 p-4 text-center transition-colors", isDragTarget && "border-primary/35 bg-primary/5"),
					children: draggedTask ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, {
						className: "mb-1.5 size-5 text-muted-foreground",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium text-muted-foreground",
						children: "Drop to move here"
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "No tasks in this column"
					})
				}) : column.items.map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanTaskItem, {
					bulkActive,
					handleDragEnd,
					handleDragStart,
					handleViewTask,
					isDragging: draggedTask?.id === task.id,
					keyboardInstructionsId,
					onClone,
					onDelete,
					onEdit,
					onKeyboardMoveTask,
					onQuickStatusChange,
					onShare,
					onToggleTaskSelection,
					pending: pendingStatusUpdates.has(task.id),
					searchQuery,
					selected: selectedTaskIds.has(task.id),
					task
				}, task.id))
			})
		})]
	});
}
function KanbanTaskItem({ bulkActive, handleDragEnd, handleDragStart, handleViewTask, isDragging, keyboardInstructionsId, onClone, onDelete, onEdit, onKeyboardMoveTask, onQuickStatusChange, onShare, onToggleTaskSelection, pending, searchQuery, selected, task }) {
	const onGripDragStart = (event) => {
		handleDragStart(event, task);
	};
	const handleKeyDown = (event) => {
		if (!event.altKey) return;
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			onKeyboardMoveTask(task, "previous");
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			onKeyboardMoveTask(task, "next");
		}
	};
	const reorderEnabled = !bulkActive && !pending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: cn("list-none rounded-xl transition-opacity", isDragging && "opacity-40"),
		children: [reorderEnabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "sr-only",
			"aria-label": `Reorder ${task.title}`,
			"aria-describedby": keyboardInstructionsId,
			"aria-keyshortcuts": "Alt+ArrowLeft Alt+ArrowRight",
			"aria-grabbed": isDragging,
			draggable: true,
			onDragStart: onGripDragStart,
			onDragEnd: handleDragEnd,
			onKeyDown: handleKeyDown
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCard, {
			task,
			variant: "board",
			isPendingUpdate: pending,
			onOpen: handleViewTask,
			onEdit,
			onDelete,
			onQuickStatusChange,
			onClone,
			onShare,
			selected,
			onSelectToggle: onToggleTaskSelection,
			searchQuery
		})]
	});
}
//#endregion
export { task_kanban_exports as t };
