import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { $t as ListChecks, Kn as Copy, Qn as Clock4, Tn as FolderKanban, Tr as CalendarX2, Vn as Download, Vt as MessageCircle, Yt as LoaderCircle, Zt as ListTodo, f as User, fr as ChevronUp, gt as Pencil, or as CircleCheck, pr as ChevronRight, tn as Link2, tt as Repeat, w as Trash2, wr as Calendar, xt as Paperclip, zn as Ellipsis } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils.mjs";
import { a as clickableCardClass, u as listItemEnterClass } from "./motion.mjs";
import { t as Badge } from "./badge.mjs";
import { t as Button } from "./button.mjs";
import { c as DropdownMenuSeparator, i as DropdownMenuItem, l as DropdownMenuTrigger, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu.mjs";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog.mjs";
import { a as TabsList, i as TabsTrigger, r as TabsContent, t as Tabs } from "./tabs.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip.mjs";
import { t as ViewTransition } from "./view-transition.mjs";
import { t as Link } from "./link.mjs";
import { A as TASKS_THEME, D as taskViewPriorityPill, E as taskPillColors, M as TaskCommentsPanel, O as taskViewStatusPill, T as taskInfoPanelClasses, _ as isOverdue, b as priorityAccentColors, d as formatPriorityLabel, f as formatStatusLabel, h as isDueSoon, i as STATUS_ICONS, l as formatAssigneeList, p as formatTimeSpent, u as formatDate, x as resolveAssigneeLabel } from "./task-types.mjs";
import { t as ScrollArea } from "./scroll-area.mjs";
//#region src/types/tasks.ts
var import_jsx_runtime = require_jsx_runtime();
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var TASK_STATUSES = [
	"todo",
	"in-progress",
	"review",
	"completed",
	"archived"
];
//#endregion
//#region src/lib/project-routes.ts
function buildProjectRoute(projectId, projectName) {
	const params = new URLSearchParams({ projectId });
	if (projectName) params.set("projectName", projectName);
	return `/dashboard/projects?${params.toString()}`;
}
function buildProjectTasksRoute(options) {
	const params = new URLSearchParams({ projectId: options.projectId });
	if (options.projectName) params.set("projectName", options.projectName);
	if (options.clientId) params.set("clientId", options.clientId);
	if (options.clientName) params.set("clientName", options.clientName);
	if (options.action) params.set("action", options.action);
	return `/dashboard/tasks?${params.toString()}`;
}
//#endregion
//#region src/features/dashboard/tasks/task-participants-context.tsx
var TaskParticipantsContext = (0, import_react.createContext)([]);
function TaskParticipantsProvider({ participants, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskParticipantsContext.Provider, {
		value: participants,
		children
	});
}
function useTaskParticipants() {
	return (0, import_react.use)(TaskParticipantsContext);
}
function useTaskAssigneeLabel(value) {
	return resolveAssigneeLabel(value, useTaskParticipants());
}
function useTaskAssigneeList(assignees) {
	const participants = useTaskParticipants();
	return formatAssigneeList(assignees ?? [], participants);
}
//#endregion
//#region src/features/dashboard/tasks/task-card-sections.tsx
function TaskStatusMenuItem({ onQuickStatusChange, status, task }) {
	const NextStatusIcon = STATUS_ICONS[status];
	const onQuickStatusSelect = () => {
		onQuickStatusChange(task, status);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
		onClick: onQuickStatusSelect,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NextStatusIcon, { className: "mr-2 size-4" }),
			"Move to ",
			formatStatusLabel(status)
		]
	});
}
function TaskCardHeaderSection({ task, isPendingUpdate, onOpen, searchQuery, highlightMatch, onEdit, onDelete, onQuickStatusChange, onClone, onShare, visibility = {
	title: true,
	menu: true,
	contextPills: true,
	indicators: true,
	compactIndicators: false
}, titleClassName }) {
	const { title: showTitle, menu: showMenu, contextPills: showContextPills, indicators: showIndicators, compactIndicators } = visibility;
	const handleOpenTask = () => {
		onOpen?.(task);
	};
	const titleMarkup = onOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: handleOpenTask,
		className: "block min-w-0 rounded-md text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
		"aria-label": `View task ${task.title}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: cn("line-clamp-2 min-w-0 flex-1 font-semibold leading-tight text-foreground transition-colors group-hover:text-primary hover:text-primary", titleClassName ?? "text-[1.05rem]"),
				children: highlightMatch(task.title, searchQuery)
			}), isPendingUpdate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mt-0.5 size-4 shrink-0 animate-spin text-primary" }) : null]
		})
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: cn("line-clamp-2 min-w-0 flex-1 font-semibold leading-tight text-foreground transition-colors group-hover:text-primary", titleClassName ?? "text-[1.05rem]"),
			children: highlightMatch(task.title, searchQuery)
		}), isPendingUpdate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mt-0.5 size-4 shrink-0 animate-spin text-primary" }) : null]
	});
	if (!showTitle && !showContextPills && !showIndicators && showMenu) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCardActionsMenu, {
		task,
		onEdit,
		onDelete,
		onQuickStatusChange,
		onClone,
		onShare
	});
	if (!showTitle && !showMenu && showIndicators) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCardIndicators, {
		task,
		compact: compactIndicators
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1 space-y-1",
			children: [
				showTitle ? titleMarkup : null,
				showContextPills && (task.client || task.projectName) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCardContextPills, { task }) : null,
				showIndicators ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCardIndicators, {
					task,
					compact: compactIndicators
				}) : null
			]
		}), showMenu ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCardActionsMenu, {
			task,
			onEdit,
			onDelete,
			onQuickStatusChange,
			onClone,
			onShare
		}) : null]
	});
}
function TaskCardContextPills({ task }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-1.5 pt-0.5",
		children: [task.client && task.clientId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			href: `/dashboard/clients?clientId=${task.clientId}`,
			className: cn("inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors hover:border-accent/30 hover:text-primary", taskPillColors.client),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-current/55" }), task.client]
		}) : task.client ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: cn("inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold", taskPillColors.client),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-current/55" }), task.client]
		}) : null, task.projectId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			href: buildProjectRoute(task.projectId, task.projectName),
			className: cn("inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors hover:border-accent/30 hover:text-primary", taskPillColors.project),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, { className: "size-3" }), task.projectName ?? task.projectId]
		}) : task.projectName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: cn("inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold", taskPillColors.project),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, { className: "size-3" }), task.projectName]
		}) : null]
	});
}
function TaskCardIndicators({ task, compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-wrap items-center gap-1.5", compact ? "mt-0" : "mt-2 gap-2"),
		children: [
			task.parentId || (task.subtaskCount ?? 0) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: cn("h-6 rounded-full px-2.5 text-[10px] font-semibold", taskPillColors.subtask),
					children: [task.parentId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-2.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListTodo, { className: "size-2.5" }), task.parentId ? "Subtask" : task.subtaskCount]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: task.parentId ? "Subtask" : `${task.subtaskCount} subtask${task.subtaskCount !== 1 ? "s" : ""}` })] }) }) : null,
			(task.commentCount ?? 0) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: cn("h-6 rounded-full px-2.5 text-[10px] font-semibold", taskPillColors.comments),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-2.5" }), task.commentCount]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, { children: [
				task.commentCount,
				" comment",
				task.commentCount !== 1 ? "s" : ""
			] })] }) }) : null,
			(task.attachments ?? []).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: cn("h-6 rounded-full px-2.5 text-[10px] font-semibold", taskPillColors.attachments),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-2.5" }), task.attachments?.length]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, { children: [
				task.attachments?.length,
				" attachment",
				(task.attachments?.length ?? 0) !== 1 ? "s" : ""
			] })] }) }) : null,
			(task.timeSpentMinutes ?? 0) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: cn("h-6 rounded-full px-2.5 text-[10px] font-semibold", taskPillColors.time),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock4, { className: "size-2.5" }), formatTimeSpent(task.timeSpentMinutes)]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, { children: ["Time spent: ", formatTimeSpent(task.timeSpentMinutes)] })] }) }) : null,
			task.isRecurring && task.recurrenceRule && task.recurrenceRule !== "none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					className: cn("h-6 rounded-full px-2.5 text-[10px] font-semibold", taskPillColors.recurring),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "size-2.5" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, { children: ["Recurring: ", task.recurrenceRule] })] }) }) : null,
			(task.sharedWith ?? []).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: cn("h-6 rounded-full px-2.5 text-[10px] font-semibold", taskPillColors.shared),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-2.5" }), task.sharedWith?.length]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, { children: [
				"Shared with ",
				task.sharedWith?.length,
				" person",
				(task.sharedWith?.length ?? 0) !== 1 ? "s" : ""
			] })] }) }) : null
		]
	});
}
function TaskCardActionsMenu({ task, onEdit, onDelete, onQuickStatusChange, onClone, onShare }) {
	const handleEditClick = () => {
		onEdit(task);
	};
	const handleDeleteClick = () => {
		onDelete(task);
	};
	const handleCloneClick = () => {
		onClone?.(task);
	};
	const handleShareClick = () => {
		onShare?.(task);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "shrink-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "size-8 rounded-full border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground",
				"aria-label": "Task actions",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
			align: "end",
			children: [
				TASK_STATUSES.flatMap((status) => status !== task.status && status !== "archived" ? [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskStatusMenuItem, {
					onQuickStatusChange,
					status,
					task
				}, status)] : []),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					onClick: handleEditClick,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-2 size-4" }), "Edit task"]
				}),
				onClone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					onClick: handleCloneClick,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "mr-2 size-4" }), "Duplicate task"]
				}) : null,
				onShare ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					onClick: handleShareClick,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "mr-2 size-4" }), "Share task"]
				}) : null,
				onClone || onShare ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					onClick: handleDeleteClick,
					className: "text-destructive focus:text-destructive",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), "Delete task"]
				})
			]
		})] })
	});
}
function TaskCardStatusBadge({ status }) {
	const Icon = STATUS_ICONS[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: "outline",
		className: cn("gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", taskViewStatusPill[status]),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-3 shrink-0",
			"aria-hidden": true
		}), formatStatusLabel(status)]
	});
}
function TaskCardPriorityBadge({ priority }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: "outline",
		className: cn("gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", taskViewPriorityPill[priority]),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, {
			className: "size-3 shrink-0",
			"aria-hidden": true
		}), formatPriorityLabel(priority)]
	});
}
function TaskCardCompactMeta({ task, overdue, dueSoon, compact = false }) {
	const assignee = useTaskAssigneeList(task.assignedTo);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground", compact ? "pt-1" : "mt-auto border-t border-border/60 pt-3"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex min-w-0 max-w-full items-center gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, {
					className: "size-3.5 shrink-0 opacity-70",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate font-medium text-foreground",
					children: assignee
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: cn("inline-flex items-center gap-1.5", overdue && "font-medium text-destructive", dueSoon && !overdue && "font-medium text-warning"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, {
					className: "size-3.5 shrink-0 opacity-70",
					"aria-hidden": true
				}), task.dueDate ? formatDate(task.dueDate) : "No due date"]
			}),
			!compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock4, {
					className: "size-3.5 shrink-0 opacity-70",
					"aria-hidden": true
				}), formatTimeSpent(task.timeSpentMinutes)]
			}) : null
		]
	});
}
function TaskCardOverdueBanner() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute right-0 top-0 flex items-center gap-1 rounded-bl-lg rounded-tr-lg bg-destructive px-2 py-0.5 text-destructive-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarX2, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[9px] font-bold uppercase",
			children: "Overdue"
		})]
	});
}
//#endregion
//#region src/features/dashboard/tasks/task-card.tsx
var TASK_CARD_MENU_VISIBILITY = {
	title: false,
	menu: true,
	contextPills: true,
	indicators: true,
	compactIndicators: false
};
var TASK_CARD_TITLE_VISIBILITY = {
	title: true,
	menu: false,
	contextPills: true,
	indicators: true,
	compactIndicators: false
};
var TASK_CARD_BOARD_META_VISIBILITY = {
	title: false,
	menu: false,
	contextPills: true,
	indicators: true,
	compactIndicators: true
};
function highlightMatch(text, query) {
	if (!query) return text;
	const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
	const parts = text.split(regex);
	let cursor = 0;
	return parts.map((part) => {
		const key = `highlight-${cursor}`;
		const isMatch = part !== "" && regex.test(part);
		regex.lastIndex = 0;
		cursor += part.length;
		if (isMatch) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mark", {
			className: "rounded bg-accent px-0.5 text-accent-foreground",
			children: part
		}, key);
		return part;
	});
}
function TaskCardComponent({ task, variant = "grid", isPendingUpdate, onOpen, onEdit, onDelete, onQuickStatusChange, onClone, onShare, selected = false, searchQuery = "" }) {
	const overdue = isOverdue(task);
	const dueSoon = isDueSoon(task);
	const isBoard = variant === "board";
	const headerProps = {
		task,
		isPendingUpdate,
		onOpen,
		searchQuery,
		highlightMatch,
		onEdit,
		onDelete,
		onQuickStatusChange,
		onClone,
		onShare
	};
	const titleVisibility = {
		...TASK_CARD_TITLE_VISIBILITY,
		contextPills: !isBoard,
		indicators: !isBoard
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTransition, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("group relative flex h-full flex-col overflow-hidden border border-border/70 bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-[var(--motion-duration-fast)] hover:border-primary/25 hover:shadow-md", listItemEnterClass, clickableCardClass, isBoard ? "rounded-xl p-3.5" : "rounded-2xl p-4 sm:p-5", isPendingUpdate && "pointer-events-none opacity-75", selected && "border-primary/30 ring-2 ring-primary/15", overdue && "border-destructive/25", dueSoon && !overdue && "border-warning/25", task.parentId && !isBoard && "ml-4"),
		children: [
			!isBoard ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-[1.25rem] opacity-80", priorityAccentColors[task.priority]) }) : null,
			overdue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCardOverdueBanner, {}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex flex-1 flex-col", isBoard ? "gap-2.5" : "gap-3"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex min-w-0 flex-wrap items-center gap-1.5",
							children: isBoard ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCardPriorityBadge, { priority: task.priority }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCardStatusBadge, { status: task.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCardPriorityBadge, { priority: task.priority })] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCardHeaderSection, {
							...headerProps,
							visibility: TASK_CARD_MENU_VISIBILITY
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCardHeaderSection, {
						...headerProps,
						visibility: titleVisibility,
						titleClassName: isBoard ? "text-sm" : void 0
					}),
					!isBoard && task.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "line-clamp-2 text-sm leading-6 text-muted-foreground",
						children: highlightMatch(task.description, searchQuery)
					}) : null,
					isBoard ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCardHeaderSection, {
						...headerProps,
						visibility: TASK_CARD_BOARD_META_VISIBILITY
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCardCompactMeta, {
						task,
						overdue,
						dueSoon,
						compact: isBoard
					})
				]
			})
		]
	}) });
}
var TaskCard = Object.assign(TaskCardComponent, { displayName: "TaskCard" });
//#endregion
//#region src/features/dashboard/tasks/task-view-dialog-sections.tsx
function TaskStatusBadge({ status }) {
	const Icon = STATUS_ICONS[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: "outline",
		className: cn("gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold", taskViewStatusPill[status]),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-3 shrink-0",
			"aria-hidden": true
		}), formatStatusLabel(status)]
	});
}
function TaskQuickStatusMenuItem({ nextStatus, onQuickStatusChange }) {
	const onQuickStatusSelect = () => {
		onQuickStatusChange(nextStatus);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
		onClick: onQuickStatusSelect,
		children: ["Move to ", formatStatusLabel(nextStatus)]
	});
}
function TaskPriorityBadge({ priority }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: "outline",
		className: cn("gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold", taskViewPriorityPill[priority]),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, {
			className: "size-3 shrink-0",
			"aria-hidden": true
		}), formatPriorityLabel(priority)]
	});
}
function TaskViewDialogHeader({ title, status, priority, client, assignedTo, dueDate, timeSpentMinutes, onEdit, onDelete, onQuickStatusChange }) {
	const assignee = useTaskAssigneeList(assignedTo);
	const showMenu = Boolean(onEdit || onDelete || onQuickStatusChange);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
		className: TASKS_THEME.viewDialog.header,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskStatusBadge, { status }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskPriorityBadge, { priority }),
					client ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: cn("rounded-md px-2 py-0.5 text-[11px] font-medium", taskPillColors.client),
						children: client
					}) : null
				]
			}), showMenu ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon",
					className: "size-8 shrink-0 text-muted-foreground",
					"aria-label": "Task options",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				align: "end",
				className: "w-48",
				children: [
					onQuickStatusChange ? TASK_STATUSES.flatMap((s) => s !== status && s !== "archived" ? [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskQuickStatusMenuItem, {
						nextStatus: s,
						onQuickStatusChange
					}, s)] : []) : null,
					onQuickStatusChange && onEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}) : null,
					onEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						onClick: onEdit,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-2 size-4" }), "Edit task"]
					}) : null,
					onDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						onClick: onDelete,
						className: "text-destructive focus:text-destructive",
						children: "Delete task"
					})] }) : null
				]
			})] }) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "text-xl font-semibold leading-snug tracking-tight text-foreground",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, {
									className: "size-3.5 shrink-0 text-muted-foreground",
									"aria-hidden": true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "sr-only",
									children: "Assignee"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "truncate text-foreground",
									children: assignee
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, {
									className: "size-3.5 shrink-0 text-muted-foreground",
									"aria-hidden": true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "sr-only",
									children: "Due date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "truncate text-foreground",
									children: formatDate(dueDate)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock4, {
									className: "size-3.5 shrink-0 text-muted-foreground",
									"aria-hidden": true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "sr-only",
									children: "Time spent"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "truncate text-foreground",
									children: formatTimeSpent(timeSpentMinutes)
								})
							]
						})
					]
				})
			})]
		})]
	});
}
function TaskViewDialogTabsList({ commentCount }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
		className: cn(TASKS_THEME.tabList, TASKS_THEME.viewDialog.tabList),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
			value: "details",
			className: cn(TASKS_THEME.tabTrigger, TASKS_THEME.viewDialog.tabTrigger),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, {
				className: "size-3.5 shrink-0",
				"aria-hidden": true
			}), "Details"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
			value: "comments",
			className: cn(TASKS_THEME.tabTrigger, TASKS_THEME.viewDialog.tabTrigger, "gap-1.5"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
					className: "size-3.5 shrink-0",
					"aria-hidden": true
				}),
				"Comments",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("inline-flex min-w-[1.25rem] items-center justify-center rounded-md px-1 text-[10px] font-semibold tabular-nums", commentCount > 0 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"),
					children: commentCount
				})
			]
		})]
	});
}
function DetailBlock({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn(taskInfoPanelClasses.base, "space-y-2"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: taskInfoPanelClasses.label,
			children: label
		}), children]
	});
}
function TaskViewDetailsTab({ task }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
		value: "details",
		className: "mt-0 flex h-full min-h-0 flex-col overflow-hidden focus-visible:outline-none data-[state=inactive]:hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "h-full max-h-[min(52vh,32rem)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn(TASKS_THEME.viewDialog.scroll, "space-y-4"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailBlock, {
						label: "Description",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn(taskInfoPanelClasses.value, "font-normal leading-relaxed"),
							children: task.description?.trim() ? task.description : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "No description provided."
							})
						})
					}),
					task.projectId || task.projectName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailBlock, {
						label: "Project",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm",
							children: [task.projectName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5 font-medium text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, {
									className: "size-3.5 text-muted-foreground",
									"aria-hidden": true
								}), task.projectName]
							}) : null, task.projectId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								href: buildProjectRoute(task.projectId, task.projectName),
								className: "text-primary underline-offset-4 hover:underline",
								children: "Open project"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								href: buildProjectTasksRoute({
									projectId: task.projectId,
									projectName: task.projectName,
									clientId: task.clientId,
									clientName: task.client
								}),
								className: "text-primary underline-offset-4 hover:underline",
								children: "Related tasks"
							})] }) : null]
						})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailBlock, {
						label: "Attachments",
						children: (task.attachments ?? []).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-border text-sm",
							children: (task.attachments ?? []).map((attachment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: attachment.url,
									target: "_blank",
									rel: "noreferrer",
									className: "inline-flex min-w-0 items-center gap-2 font-medium text-foreground hover:text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-3.5 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: attachment.name
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: attachment.size ?? attachment.type ?? "File"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: attachment.url,
										download: attachment.name,
										className: "inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3" }), "Download"]
									})]
								})]
							}, `${attachment.url}-${attachment.name}`))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No attachments."
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "pt-1 text-[11px] text-muted-foreground",
						children: [
							"Created ",
							formatDate(task.createdAt),
							" · Updated ",
							formatDate(task.updatedAt)
						]
					})
				]
			})
		})
	});
}
function TaskViewCommentsTab({ onCommentCountChange, participants, taskId, userId, userName, userRole, workspaceId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
		value: "comments",
		className: "mt-0 flex h-full min-h-0 flex-col overflow-hidden focus-visible:outline-none data-[state=inactive]:hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "h-full max-h-[min(52vh,32rem)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn(TASKS_THEME.viewDialog.scroll, "space-y-4"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCommentsPanel, {
					taskId,
					workspaceId,
					userId,
					userName,
					userRole,
					participants,
					onCommentCountChange
				})
			})
		})
	});
}
function TaskViewDialogFooter({ onClose, onEdit, onMarkComplete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
		className: TASKS_THEME.viewDialog.footer,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "hidden text-xs text-muted-foreground sm:block",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
				className: "mr-1 rounded border border-border bg-muted px-1 font-mono text-[10px]",
				children: "Esc"
			}), "to close"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: onClose,
					children: "Close"
				}),
				onMarkComplete ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					onClick: onMarkComplete,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-2 size-4" }), "Mark complete"]
				}) : null,
				onEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: onEdit,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-2 size-4" }), "Edit task"]
				}) : null
			]
		})]
	});
}
//#endregion
//#region src/features/dashboard/tasks/task-view-dialog.tsx
var EMPTY_PARTICIPANTS = [];
function TaskViewDialog({ task, open, onOpenChange, onEdit, onDelete, onQuickStatusChange, initialTab = "details", workspaceId = null, userId = null, userName = null, userRole = null, participants = EMPTY_PARTICIPANTS }) {
	const [activeTab, setActiveTab] = (0, import_react.useState)("details");
	const [commentCountState, setCommentCountState] = (0, import_react.useState)(null);
	const taskId = task?.id ?? "";
	const sourceCommentCount = task?.commentCount ?? 0;
	const liveCommentCount = commentCountState?.taskId === taskId && commentCountState.sourceCount === sourceCommentCount ? commentCountState.count : sourceCommentCount;
	const handleDialogOpenChange = (nextOpen) => {
		if (nextOpen) setActiveTab(initialTab);
		else {
			setCommentCountState(null);
			setActiveTab("details");
		}
		onOpenChange(nextOpen);
	};
	const handleCommentCountChange = (count) => {
		setCommentCountState({
			taskId,
			sourceCount: sourceCommentCount,
			count
		});
	};
	const handleFooterClose = () => {
		onOpenChange(false);
	};
	const handleEdit = () => {
		if (!task || !onEdit) return;
		onOpenChange(false);
		onEdit(task);
	};
	const handleDelete = () => {
		if (!task || !onDelete) return;
		onOpenChange(false);
		onDelete(task);
	};
	const handleQuickStatusChange = (newStatus) => {
		if (!task || !onQuickStatusChange) return;
		onQuickStatusChange(task, newStatus);
	};
	const handleMarkComplete = () => {
		if (!task || !onQuickStatusChange) return;
		onQuickStatusChange(task, "completed");
	};
	const handleTabChange = (value) => {
		setActiveTab(value);
	};
	if (!task) return null;
	const canMarkComplete = task.status !== "completed" && task.status !== "archived";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: handleDialogOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: TASKS_THEME.viewDialog.shell,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskViewDialogHeader, {
					title: task.title,
					status: task.status,
					priority: task.priority,
					client: task.client,
					assignedTo: task.assignedTo,
					dueDate: task.dueDate,
					timeSpentMinutes: task.timeSpentMinutes,
					onEdit: onEdit ? handleEdit : void 0,
					onDelete: onDelete ? handleDelete : void 0,
					onQuickStatusChange: onQuickStatusChange ? handleQuickStatusChange : void 0
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					value: activeTab,
					onValueChange: handleTabChange,
					className: "flex min-h-0 flex-1 flex-col overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: TASKS_THEME.viewDialog.tabsRail,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskViewDialogTabsList, { commentCount: liveCommentCount })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: TASKS_THEME.viewDialog.body,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskViewDetailsTab, { task }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskViewCommentsTab, {
							onCommentCountChange: handleCommentCountChange,
							participants,
							taskId: task.id,
							userId,
							userName,
							userRole,
							workspaceId
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskViewDialogFooter, {
					onClose: handleFooterClose,
					onEdit: onEdit ? handleEdit : void 0,
					onMarkComplete: onQuickStatusChange && canMarkComplete ? handleMarkComplete : void 0
				})
			]
		})
	});
}
//#endregion
export { buildProjectTasksRoute as a, useTaskAssigneeLabel as i, TaskCard as n, TASK_STATUSES as o, TaskParticipantsProvider as r, TaskViewDialog as t };
