import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, c as useConvex, l as useMutation, s as useAction, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { Q as isPreviewModeEnabled, Y as getPreviewTasks } from "./preview-data-CXkRNfsX.mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { _ as format, h as formatDistanceToNowStrict, r as parseISO } from "../_libs/date-fns.mjs";
import { h as listItemEnterClass, s as clickableCardClass } from "./motion-Cf6ujF0h.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { n as CardContent, t as Card } from "./card-CDBnK3ba.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { s as logError, t as asErrorMessage } from "./convex-errors-sHK0JmZ7.mjs";
import { a as notifyInfo, c as reportConvexFailure, i as notifyFailure, o as notifySuccess, s as notifyWarning } from "./notifications-DQZKskhM.mjs";
import { n as usePathname, r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { n as api } from "./rate-limiter-convex-Dr72h9nD.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { D as filesApi, J as tasksDocumentImportApi, Y as usersApi, m as agentApi, q as tasksApi } from "./convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { $t as ListChecks, Cn as Funnel, J as Send, Kn as Copy, Mr as BriefcaseBusiness, Nt as Minus, P as SquareCheckBig, Qn as Clock4, R as SlidersHorizontal, Tn as FolderKanban, Tr as CalendarX2, Vn as Download, Vt as MessageCircle, Wr as ArrowDown, Xt as List, Y as Search, Yt as LoaderCircle, Zt as ListTodo, b as TriangleAlert, et as Reply, f as User, fr as ChevronUp, gt as Pencil, i as X, kn as FileUp, kr as CalendarClock, lt as Plus, or as CircleCheck, pr as ChevronRight, qn as Columns3, rn as LayoutGrid, rt as RefreshCw, tn as Link2, tt as Repeat, w as Trash2, wr as Calendar, xt as Paperclip, yn as GripVertical, zn as Ellipsis, zr as ArrowUp } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { t as Label } from "./label-B_FvRq1I.mjs";
import { a as TabsTrigger, i as TabsList, n as Tabs, r as TabsContent } from "./tabs-BP_mm-cH.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip-BwcfatA2.mjs";
import { t as ViewTransition } from "./view-transition-DFCVhmkH.mjs";
import { a as getIconContainerClasses, i as getButtonClasses, n as PAGE_TITLES, t as DASHBOARD_THEME } from "./dashboard-theme-DM5oBGdY.mjs";
import { t as Checkbox } from "./checkbox-DP7YqpAp.mjs";
import { r as useConvexQueryError, t as mergeQueryErrors } from "./use-convex-query-error-P2IX7lhG.mjs";
import { t as Textarea } from "./textarea-C0M2IvQZ.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Be-Tzxcj.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar-DghqGd0Q.mjs";
import { t as ScrollArea } from "./scroll-area-DnXuhDTw.mjs";
import { t as dynamic } from "./dynamic-D6gKSsRx.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-BwHc7N7y.mjs";
import { t as Calendar$1 } from "./calendar-9B6zD0Is.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as useDebouncedValue } from "./use-debounce-nytCMJxB.mjs";
import { c as DropdownMenuSeparator, i as DropdownMenuItem, l as DropdownMenuTrigger, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-CJEJ0oqe.mjs";
import { t as PageMotionShell } from "./page-motion-shell-Ci2leIYf.mjs";
import { t as isFeatureEnabled } from "./features-DXQ1HU1z.mjs";
import { n as useNavigationContext } from "./navigation-context-BLXaFSSv.mjs";
import { n as DataTableColumnHeader, t as DataTable } from "./data-table-BrJwaBjP.mjs";
import { i as buildCategoryCountChart } from "./cohorts-spreadsheet-charts-C3_blKf3.mjs";
import { t as DashboardPageHero } from "./dashboard-page-hero-BIWBoJtP.mjs";
import { t as Progress } from "./progress-C-kxMCfG.mjs";
import { a as SheetHeader, i as SheetDescription, o as SheetTitle, r as SheetContent, t as Sheet } from "./sheet-Ybc8ZbjG.mjs";
import { t as uploadStorageFile } from "./upload-storage-file-CUAnugSD.mjs";
import "./use-client-relative-time-BtAGXTYW.mjs";
import { i as exportCohortsSpreadsheet, r as ensureXlsxFilename } from "./cohorts-spreadsheet-oHwGWk0s.mjs";
import { n as useKeyboardShortcut, t as KeyboardShortcutBadge } from "./use-keyboard-shortcuts-CjHWs-Qm.mjs";
import { a as getPdfUploadSizeError, l as readFileAsBase64 } from "./agent-attachments-Bv_PBE19.mjs";
import { t as useAccumulatedCursorPages } from "./use-accumulated-cursor-pages-6G2SM2av.mjs";
import { t as Route } from "./tasks-DaMprSCd.mjs";
import "./client-formatted-date-CcMUTrKu.mjs";
import { n as FormSheetClose, r as ResponsiveFormSheet } from "./dashboard-workspace-theme-Ckmkwu5P.mjs";
import { t as LiveRegion } from "./live-region-BmnQNfB0.mjs";
import { A as getAssigneeDraftIssue, B as statusTablePillClass, C as extractMentionsFromContent, D as formatPriorityLabel, E as formatDate, F as mergeTaskParticipants, G as teamMembersToMentionable, H as taskPillColors, I as priorityAccentColors, K as uploadTaskAttachment, L as resolveAssigneeLabel, M as isFutureTaskDueDateValue, N as isOverdue, O as formatStatusLabel, P as isTaskDueDateDisabled, R as resolveAssigneeUserIds, T as formatAssigneeList, U as taskViewPriorityPill, V as taskInfoPanelClasses, W as taskViewStatusPill, _ as TaskSheetHeader, a as PendingAttachmentsList, b as buildPendingTaskAttachments, c as RichComposer, d as TASKS_THEME, f as TaskContextChip, g as TaskModalError, i as PRIORITY_ORDER, j as isDueSoon, k as formatTimeSpent, l as SORT_OPTIONS, m as TaskFormSection, n as MessageAttachments, o as RETRY_CONFIG, p as TaskFormField, r as MessageContent, u as STATUS_ICONS, v as assignableImportParticipants, w as formatAssigneeDraftFromUserIds, x as clientRosterAssigneeNames, y as buildInitialFormState, z as statusLaneColors } from "./task-attachments-Ji71G8Bp.mjs";
import { t as usePersistedTab } from "./use-persisted-tab-DQyLv5Zj.mjs";
import { t as TASK_STATUSES } from "./tasks-DllqW2rQ.mjs";
import { t as MentionInput } from "./mention-input-L2yAb4U6.mjs";
import "./network-status-banner-BsNzhz2R.mjs";
import { a as combineExtractedDocumentText, c as prepareTaskImportDocument, i as buildTaskImportFileName, l as uploadTaskImportDocument, n as buildProjectRoute, o as filterTasksDocumentFiles, r as buildProjectTasksRoute, s as isFileDragEvent, t as SiriOrb } from "./upload-import-document-BMFT4cyE.mjs";
import "../_libs/dompurify.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/task-comments-DzUuo2Fx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function isConvexRealtimeEnabled() {
	return Boolean("https://grand-sparrow-698.convex.cloud") && process.env.NEXT_PUBLIC_USE_BETTER_AUTH !== "false";
}
var ALLOWED_MIME_TYPES = new Set([
	"image/png",
	"image/jpeg",
	"image/jpg",
	"image/webp",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"text/plain",
	"text/csv",
	"text/markdown",
	"application/zip",
	"application/x-zip-compressed"
]);
var MAX_BYTES = 15 * 1024 * 1024;
function formatFileSize(bytes) {
	if (!Number.isFinite(bytes) || bytes <= 0) return "1 KB";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
async function uploadTaskCommentAttachment(args) {
	const { userId, taskId, file, generateUploadUrl, syncMetadata, getPublicUrl } = args;
	if (!userId) throw new Error("userId is required");
	if (!taskId) throw new Error("taskId is required");
	if (!file) throw new Error("file is required");
	if (file.size > MAX_BYTES) throw new Error("Attachment is too large (max 15MB)");
	const contentType = file.type || "application/octet-stream";
	if (!ALLOWED_MIME_TYPES.has(contentType)) throw new Error("Unsupported attachment file type");
	const publicUrl = await getPublicUrl({ storageId: await uploadStorageFile({
		file,
		contentType,
		generateUploadUrl,
		syncMetadata
	}) });
	if (!publicUrl?.url) throw new Error("Unable to resolve uploaded file URL");
	return {
		name: file.name,
		url: publicUrl.url,
		type: contentType,
		size: formatFileSize(file.size)
	};
}
function getInitials(name) {
	const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "TC";
	return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}
function formatCommentTimestamp(comment) {
	const source = comment.updatedAt ?? comment.createdAt;
	if (!source) return "";
	const relative = formatDistanceToNowStrict(new Date(source), { addSuffix: true });
	return comment.isEdited ? `${relative} · edited` : relative;
}
function sortCommentsChronologically(items) {
	return items.toSorted((a, b) => {
		return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
	});
}
function TaskCommentThreadItem({ comment, depth = 0, repliesByParent, replyToId, editingCommentId, deletingCommentId, canManageComment, onStartReply, onStartEdit, onRequestDelete }) {
	const replies = sortCommentsChronologically(repliesByParent.get(comment.id) ?? []);
	const isActiveReply = replyToId === comment.id;
	const isActiveEdit = editingCommentId === comment.id;
	const isBusy = deletingCommentId === comment.id;
	const isBeingEdited = isActiveEdit;
	const handleStartReplyClick = () => {
		onStartReply(comment);
	};
	const handleStartEditClick = () => {
		onStartEdit(comment);
	};
	const handleRequestDeleteClick = () => {
		onRequestDelete(comment);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("rounded-lg border border-border/70 p-3 transition-colors", depth > 0 && "bg-muted/20", isActiveReply && "border-primary/30 bg-primary/5", isBeingEdited && "border-primary/30 bg-primary/5 opacity-90"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					className: "mt-0.5 size-10 border border-border/60 bg-background shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
						className: "bg-muted text-[11px] font-semibold text-muted-foreground",
						children: getInitials(comment.authorName)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate text-sm font-semibold text-foreground",
										children: comment.authorName
									}), comment.authorRole ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full border border-border/60 bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground",
										children: comment.authorRole
									}) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: formatCommentTimestamp(comment)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [depth === 0 && replies.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground",
									children: [
										replies.length,
										" repl",
										replies.length === 1 ? "y" : "ies"
									]
								}) : null, canManageComment(comment) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										className: "size-8 rounded-full text-muted-foreground",
										"aria-label": "Comment actions",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
									align: "end",
									className: "w-44 rounded-xl",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: handleStartReplyClick,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reply, { className: "size-4" }), "Reply"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: handleStartEditClick,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), "Edit"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											variant: "destructive",
											onSelect: handleRequestDeleteClick,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Delete"]
										})
									]
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									className: "h-8 rounded-full px-3 text-muted-foreground",
									onClick: handleStartReplyClick,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reply, { className: "mr-1.5 size-3.5" }), "Reply"]
								})]
							})]
						}),
						isBeingEdited ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-primary",
							children: "Editing in the composer below…"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageContent, {
								content: comment.content,
								mentions: comment.mentions
							}), comment.attachments && comment.attachments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageAttachments, { attachments: comment.attachments }) : null]
						}),
						!isBeingEdited ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-1 pt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								className: "h-8 rounded-lg px-2.5 text-muted-foreground hover:text-foreground",
								onClick: handleStartReplyClick,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reply, { className: "mr-1.5 size-3.5" }), "Reply"]
							}), isBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }), "Updating…"]
							}) : null]
						}) : null
					]
				})]
			})
		}), replies.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("space-y-3 border-l border-dashed border-border pl-4 md:pl-6", depth === 0 && "ml-5"),
			children: replies.map((reply) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCommentThreadItem, {
				comment: reply,
				depth: depth + 1,
				repliesByParent,
				replyToId,
				editingCommentId,
				deletingCommentId,
				canManageComment,
				onStartReply,
				onStartEdit,
				onRequestDelete
			}, reply.id))
		}) : null]
	}, comment.id);
}
function TaskCommentsSummaryHeader({ commentsCount, replyCount, replyTo, editingCommentId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-sm font-semibold text-foreground",
			children: "Conversation"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-0.5 text-xs text-muted-foreground",
			children: [
				commentsCount,
				" comment",
				commentsCount === 1 ? "" : "s",
				replyCount > 0 ? ` · ${replyCount} repl${replyCount === 1 ? "y" : "ies"}` : ""
			]
		})] }), replyTo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary",
			children: "Replying"
		}) : editingCommentId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground",
			children: "Editing"
		}) : null]
	});
}
function TaskCommentsThreadList({ loading, roots, repliesByParent, replyToId, editingCommentId, deletingCommentId, canManageComment, onStartReply, onStartEdit, onRequestDelete }) {
	const sortedRoots = sortCommentsChronologically(roots);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-primary" }), "Loading conversation…"]
		}) : sortedRoots.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "py-6 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No comments yet."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: "Add context or @mention teammates below."
			})]
		}) : sortedRoots.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCommentThreadItem, {
			comment,
			repliesByParent,
			replyToId,
			editingCommentId,
			deletingCommentId,
			canManageComment,
			onStartReply,
			onStartEdit,
			onRequestDelete
		}, comment.id))
	});
}
function TaskCommentsComposerSection({ fileInputRef, replyTo, editingCommentId, composerTitle, composerDescription, composerPlaceholder, pendingAttachments, uploading, isSubmitting, composerValue, composerParticipants, onReset, onAddAttachments, onRemovePendingAttachment, onAttachClick, onComposerChange, onSubmit }) {
	const handleFileChange = (event) => {
		onAddAttachments(event.target.files);
		event.currentTarget.value = "";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold text-foreground",
						children: composerTitle
					}), replyTo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 line-clamp-2 text-xs italic text-muted-foreground",
						children: composerDescription
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs text-muted-foreground",
						children: composerDescription
					})]
				}), replyTo || editingCommentId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					className: "h-8 shrink-0 rounded-lg text-muted-foreground",
					onClick: onReset,
					"aria-label": "Cancel reply or edit",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1 size-3.5" }), "Cancel"]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileInputRef,
				type: "file",
				multiple: true,
				"aria-label": "Attach files to comment",
				className: "hidden",
				onChange: handleFileChange
			}),
			pendingAttachments.length > 0 && !editingCommentId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingAttachmentsList, {
					attachments: pendingAttachments,
					uploading,
					onRemove: onRemovePendingAttachment
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichComposer, {
						value: composerValue,
						onChange: onComposerChange,
						onSend: onSubmit,
						disabled: isSubmitting,
						placeholder: composerPlaceholder,
						participants: composerParticipants,
						onAttachClick: editingCommentId ? void 0 : onAttachClick,
						hasAttachments: !editingCommentId && pendingAttachments.length > 0
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						size: "icon",
						onClick: onAttachClick,
						disabled: isSubmitting || Boolean(editingCommentId),
						title: editingCommentId ? "Attachments cannot be changed while editing" : "Attach files",
						className: "size-10 rounded-2xl border-border/60 bg-background",
						"aria-label": editingCommentId ? "Attachments cannot be changed while editing" : "Attach files",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: editingCommentId ? "sm" : "icon",
						onClick: onSubmit,
						disabled: isSubmitting || composerValue.trim().length === 0,
						title: editingCommentId ? "Save changes" : "Post comment",
						className: cn(editingCommentId ? "h-10 rounded-lg px-4" : "size-10 rounded-xl"),
						"aria-label": editingCommentId ? "Save changes" : "Post comment",
						children: isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : editingCommentId ? "Save" : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
					})]
				})]
			})
		]
	});
}
function TaskCommentsDeleteDialog({ deleteTarget, deletingCommentId, onClose, onConfirm }) {
	const handleOpenChange = (open) => {
		if (!open) onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open: Boolean(deleteTarget),
		onOpenChange: handleOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete comment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "This will remove the comment from the task conversation. Replies stay in the thread only if they still have a visible parent." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
			disabled: Boolean(deletingCommentId),
			children: "Cancel"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
			onClick: onConfirm,
			disabled: Boolean(deletingCommentId),
			className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			children: deletingCommentId ? "Deleting…" : "Delete"
		})] })] })
	});
}
function formatBytes(bytes) {
	if (!Number.isFinite(bytes) || bytes <= 0) return "1 KB";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function buildPendingAttachments(files) {
	const now = Date.now();
	return Array.from(files).map((file, index) => ({
		id: `${now}-${index}-${file.name}`,
		file,
		name: file.name,
		mimeType: file.type || "application/octet-stream",
		sizeLabel: formatBytes(file.size)
	}));
}
function getPreviewText(content) {
	const normalized = String(content ?? "").replace(/\s+/g, " ").trim();
	if (normalized.length <= 72) return normalized;
	return `${normalized.slice(0, 69)}...`;
}
var INITIAL_TASK_COMMENTS_PANEL_STATE = {
	composerValue: "",
	sending: false,
	uploading: false,
	replyTo: null,
	editingCommentId: null,
	savingEdit: false,
	pendingAttachments: [],
	deleteTarget: null,
	deletingCommentId: null
};
function taskCommentsPanelReducer(state, action) {
	switch (action.type) {
		case "setComposerValue": return {
			...state,
			composerValue: action.composerValue
		};
		case "setSending": return {
			...state,
			sending: action.sending
		};
		case "setUploading": return {
			...state,
			uploading: action.uploading
		};
		case "setReplyTo": return {
			...state,
			replyTo: action.replyTo
		};
		case "setEditingCommentId": return {
			...state,
			editingCommentId: action.editingCommentId
		};
		case "setSavingEdit": return {
			...state,
			savingEdit: action.savingEdit
		};
		case "setPendingAttachments": return {
			...state,
			pendingAttachments: action.pendingAttachments
		};
		case "setDeleteTarget": return {
			...state,
			deleteTarget: action.deleteTarget
		};
		case "setDeletingCommentId": return {
			...state,
			deletingCommentId: action.deletingCommentId
		};
		case "resetComposer": return {
			...state,
			composerValue: "",
			replyTo: null,
			editingCommentId: null,
			pendingAttachments: []
		};
		case "startReply": return {
			...state,
			replyTo: action.comment,
			editingCommentId: null,
			composerValue: "",
			pendingAttachments: []
		};
		case "startEdit": return {
			...state,
			editingCommentId: action.comment.id,
			replyTo: null,
			composerValue: action.comment.content,
			pendingAttachments: []
		};
		case "startSending": return {
			...state,
			sending: true,
			uploading: true
		};
		default: return action;
	}
}
function useTaskCommentsPanel(props) {
	const { taskId, workspaceId, userId, userName, userRole, participants, onCommentCountChange } = props;
	const fileInputRef = (0, import_react.useRef)(null);
	const convex = useConvex();
	const convexEnabled = isConvexRealtimeEnabled() && Boolean(workspaceId);
	const convexRows = useQuery(api.taskComments.listForTask, convexEnabled ? {
		workspaceId: String(workspaceId),
		taskLegacyId: String(taskId),
		limit: 200
	} : "skip");
	const createComment = useMutation(api.taskComments.create);
	const updateComment = useMutation(api.taskComments.updateContent);
	const deleteComment = useMutation(api.taskComments.softDelete);
	const generateUploadUrlMutation = useMutation(filesApi.generateUploadUrl);
	const syncMetadataMutation = useMutation(filesApi.syncMetadata);
	const generateUploadUrl = () => generateUploadUrlMutation({});
	const syncMetadata = (args) => syncMetadataMutation(args);
	const getPublicUrl = (args) => convex.query(filesApi.getPublicUrl, {
		workspaceId: String(workspaceId),
		storageId: args.storageId
	});
	const [state, dispatch] = (0, import_react.useReducer)(taskCommentsPanelReducer, INITIAL_TASK_COMMENTS_PANEL_STATE);
	const { composerValue, sending, uploading, replyTo, editingCommentId, savingEdit, pendingAttachments, deleteTarget, deletingCommentId } = state;
	const sortedParticipants = (() => {
		const map = /* @__PURE__ */ new Map();
		for (const participant of participants) {
			const key = participant.name.trim().toLowerCase();
			if (!key) continue;
			if (!map.has(key)) map.set(key, participant);
		}
		if (userName) {
			const key = userName.trim().toLowerCase();
			if (key && !map.has(key)) map.set(key, {
				name: userName,
				role: userRole ?? "Team"
			});
		}
		return Array.from(map.values());
	})();
	const composerParticipants = sortedParticipants.map((participant) => ({
		name: participant.name,
		role: participant.role ?? "Team"
	}));
	const comments = (() => {
		if (!convexEnabled || !convexRows) return [];
		return convexRows.flatMap((row) => {
			const createdAt = typeof row?.createdAtMs === "number" ? new Date(row.createdAtMs).toISOString() : null;
			const updatedAt = typeof row?.updatedAtMs === "number" ? new Date(row.updatedAtMs).toISOString() : null;
			const deletedAt = typeof row?.deletedAtMs === "number" ? new Date(row.deletedAtMs).toISOString() : null;
			const isDeleted = Boolean(row?.deleted || deletedAt);
			const id = String(row?.legacyId ?? "");
			if (!id || isDeleted) return [];
			return [{
				id,
				taskId,
				content: typeof row?.content === "string" ? row.content : "",
				format: row?.format === "plaintext" ? "plaintext" : "markdown",
				authorId: typeof row?.authorId === "string" ? row.authorId : null,
				authorName: typeof row?.authorName === "string" && row.authorName.trim().length > 0 ? row.authorName : "Teammate",
				authorRole: typeof row?.authorRole === "string" ? row.authorRole : null,
				createdAt,
				updatedAt,
				isEdited: Boolean(updatedAt && (!createdAt || createdAt !== updatedAt) && !isDeleted),
				isDeleted,
				deletedAt,
				deletedBy: typeof row?.deletedBy === "string" ? row.deletedBy : null,
				attachments: Array.isArray(row?.attachments) ? row.attachments : void 0,
				mentions: Array.isArray(row?.mentions) ? row.mentions : void 0,
				parentCommentId: typeof row?.parentCommentId === "string" ? row.parentCommentId : null,
				threadRootId: typeof row?.threadRootId === "string" ? row.threadRootId : null
			}];
		});
	})();
	const loading = convexEnabled && convexRows === void 0;
	const previousCommentCountRef = (0, import_react.useRef)(comments.length);
	(0, import_react.useEffect)(() => {
		if (onCommentCountChange && previousCommentCountRef.current !== comments.length) {
			previousCommentCountRef.current = comments.length;
			onCommentCountChange(comments.length);
		}
	}, [comments.length, onCommentCountChange]);
	const activeReplyTo = (() => {
		if (!replyTo) return null;
		return comments.some((comment) => comment.id === replyTo.id) ? replyTo : null;
	})();
	const activeEditingCommentId = (() => {
		if (!editingCommentId) return null;
		return comments.some((comment) => comment.id === editingCommentId) ? editingCommentId : null;
	})();
	const resetComposer = () => {
		dispatch({ type: "resetComposer" });
	};
	const handleAddAttachments = (files) => {
		if (!files || files.length === 0) return;
		const next = buildPendingAttachments(files);
		dispatch({
			type: "setPendingAttachments",
			pendingAttachments: [...pendingAttachments, ...next].slice(0, 10)
		});
	};
	const handleRemovePendingAttachment = (attachmentId) => {
		dispatch({
			type: "setPendingAttachments",
			pendingAttachments: pendingAttachments.filter((item) => item.id !== attachmentId)
		});
	};
	const handleAttachClick = () => {
		if (activeEditingCommentId) return;
		fileInputRef.current?.click();
	};
	const handleStartReply = (comment) => {
		dispatch({
			type: "startReply",
			comment
		});
	};
	const handleStartEdit = (comment) => {
		dispatch({
			type: "startEdit",
			comment
		});
	};
	const handleSubmit = () => {
		const content = composerValue.trim();
		if (!content || !workspaceId) return;
		if (activeEditingCommentId) {
			dispatch({
				type: "setSavingEdit",
				savingEdit: true
			});
			updateComment({
				workspaceId: String(workspaceId),
				taskLegacyId: String(taskId),
				legacyId: activeEditingCommentId,
				content,
				updatedBy: ""
			}).then(() => {
				notifySuccess({ message: "Comment updated" });
				resetComposer();
			}).catch((error) => {
				reportConvexFailure({
					error,
					context: "TaskCommentsPanel:handleSaveEdit",
					title: "Failed to update comment",
					fallbackMessage: "Failed to update comment"
				});
			}).finally(() => {
				dispatch({
					type: "setSavingEdit",
					savingEdit: false
				});
			});
			return;
		}
		if (!userId) return;
		dispatch({ type: "startSending" });
		Promise.resolve().then(async () => {
			const uploadedAttachments = [];
			if (pendingAttachments.length > 0) {
				const uploads = await Promise.all(pendingAttachments.map((attachment) => uploadTaskCommentAttachment({
					userId,
					taskId,
					file: attachment.file,
					generateUploadUrl,
					syncMetadata,
					getPublicUrl
				})));
				uploadedAttachments.push(...uploads);
			}
			const mentionMetadata = extractMentionsFromContent(content).map((mention) => {
				const participant = sortedParticipants.find((member) => member.name.trim().toLowerCase() === mention.name.trim().toLowerCase());
				return {
					slug: mention.slug,
					name: participant?.name ?? mention.name,
					role: participant?.role ?? null
				};
			});
			const legacyId = `task-comment-${Date.now()}-${Math.random().toString(16).slice(2)}`;
			return createComment({
				workspaceId: String(workspaceId),
				taskLegacyId: String(taskId),
				legacyId,
				content,
				format: "markdown",
				authorId: null,
				authorName: userName,
				authorRole: userRole,
				attachments: uploadedAttachments.length > 0 ? uploadedAttachments : void 0,
				mentions: mentionMetadata.length > 0 ? mentionMetadata : void 0,
				parentCommentId: activeReplyTo?.id ?? void 0,
				threadRootId: activeReplyTo?.threadRootId ?? activeReplyTo?.id ?? void 0
			});
		}).then(() => {
			resetComposer();
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "TaskCommentsPanel:handleSend",
				title: "Failed to post comment",
				fallbackMessage: "Failed to post comment"
			});
		}).finally(() => {
			dispatch({
				type: "setUploading",
				uploading: false
			});
			dispatch({
				type: "setSending",
				sending: false
			});
		});
	};
	const handleConfirmDelete = () => {
		if (!workspaceId || !deleteTarget) return;
		dispatch({
			type: "setDeletingCommentId",
			deletingCommentId: deleteTarget.id
		});
		deleteComment({
			workspaceId: String(workspaceId),
			taskLegacyId: String(taskId),
			legacyId: deleteTarget.id,
			deletedBy: ""
		}).then(() => {
			notifySuccess({ message: "Comment deleted" });
			if (editingCommentId === deleteTarget.id) resetComposer();
			if (replyTo?.id === deleteTarget.id) dispatch({
				type: "setReplyTo",
				replyTo: null
			});
			dispatch({
				type: "setDeleteTarget",
				deleteTarget: null
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "TaskCommentsPanel:handleDeleteComment",
				title: "Failed to delete comment",
				fallbackMessage: "Failed to delete comment"
			});
		}).finally(() => {
			dispatch({
				type: "setDeletingCommentId",
				deletingCommentId: null
			});
		});
	};
	const threaded = (() => {
		const roots = [];
		const repliesByParent = /* @__PURE__ */ new Map();
		for (const comment of comments) {
			const parentId = comment.parentCommentId;
			if (!parentId) {
				roots.push(comment);
				continue;
			}
			const bucket = repliesByParent.get(parentId) ?? [];
			bucket.push(comment);
			repliesByParent.set(parentId, bucket);
		}
		return {
			roots,
			repliesByParent,
			replyCount: Math.max(0, comments.length - roots.length)
		};
	})();
	const isSubmitting = sending || uploading || savingEdit;
	const draftMode = activeEditingCommentId ? "edit" : activeReplyTo ? "reply" : "new";
	const composerTitle = draftMode === "edit" ? "Editing comment" : draftMode === "reply" ? `Replying to ${activeReplyTo?.authorName ?? "thread"}` : "New comment";
	const composerDescription = draftMode === "edit" ? "Update the message below. Attachments remain unchanged." : draftMode === "reply" ? getPreviewText(activeReplyTo?.content) : "Share context, decisions, or quick next steps.";
	const composerPlaceholder = draftMode === "edit" ? "Refine your comment..." : draftMode === "reply" ? `Reply to ${activeReplyTo?.authorName ?? "thread"}...` : "Write a comment...";
	const canManageComment = (comment) => {
		if (userRole === "admin") return true;
		if (!userName) return false;
		return comment.authorName.trim().toLowerCase() === userName.trim().toLowerCase();
	};
	const handleCloseDeleteDialog = () => {
		dispatch({
			type: "setDeleteTarget",
			deleteTarget: null
		});
	};
	const handleComposerChange = (value) => {
		dispatch({
			type: "setComposerValue",
			composerValue: value
		});
	};
	const handleRequestDelete = (comment) => {
		dispatch({
			type: "setDeleteTarget",
			deleteTarget: comment
		});
	};
	const threadList = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCommentsThreadList, {
		loading,
		roots: threaded.roots,
		repliesByParent: threaded.repliesByParent,
		replyToId: activeReplyTo?.id ?? null,
		editingCommentId: activeEditingCommentId,
		deletingCommentId,
		canManageComment,
		onStartReply: handleStartReply,
		onStartEdit: handleStartEdit,
		onRequestDelete: handleRequestDelete
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCommentsSummaryHeader, {
				commentsCount: comments.length,
				replyCount: threaded.replyCount,
				replyTo: activeReplyTo,
				editingCommentId: activeEditingCommentId
			}),
			threadList,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-border pt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCommentsComposerSection, {
					fileInputRef,
					replyTo: activeReplyTo,
					editingCommentId: activeEditingCommentId,
					composerTitle,
					composerDescription,
					composerPlaceholder,
					pendingAttachments,
					uploading,
					isSubmitting,
					composerValue,
					composerParticipants,
					onReset: resetComposer,
					onAddAttachments: handleAddAttachments,
					onRemovePendingAttachment: handleRemovePendingAttachment,
					onAttachClick: handleAttachClick,
					onComposerChange: handleComposerChange,
					onSubmit: handleSubmit
				})
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCommentsDeleteDialog, {
		deleteTarget,
		deletingCommentId,
		onClose: handleCloseDeleteDialog,
		onConfirm: handleConfirmDelete
	})] });
}
function TaskCommentsPanel(props) {
	return useTaskCommentsPanel(props);
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/task-view-dialog-C-cMPBdb.js
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
function TaskStatusMenuItem$1({ onQuickStatusChange, status, task }) {
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
		children: [task.client && task.clientId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
			href: `/dashboard/clients?clientId=${task.clientId}`,
			className: cn("inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors hover:border-accent/30 hover:text-primary", taskPillColors.client),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-current/55" }), task.client]
		}) : task.client ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: cn("inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold", taskPillColors.client),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-current/55" }), task.client]
		}) : null, task.projectId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
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
				TASK_STATUSES.flatMap((status) => status !== task.status && status !== "archived" ? [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskStatusMenuItem$1, {
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
							}) : null, task.projectId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
								href: buildProjectRoute(task.projectId, task.projectName),
								className: "text-primary underline-offset-4 hover:underline",
								children: "Open project"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
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
//#region node_modules/.nitro/vite/services/ssr/assets/tasks-DTtNKFkQ.js
function DeleteTaskDialog$1({ open, onOpenChange, task, deleting, onConfirm }) {
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
function PrioritySelectItem({ value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("size-2 shrink-0 rounded-full", priorityAccentColors[value]),
			"aria-hidden": true
		}), formatPriorityLabel(value)]
	});
}
function TaskSheetFields({ ids, formState, setFormState, disabled, mentionableUsers, titlePlaceholder, clientPlaceholder, projectPlaceholder, clientHelpText, projectHelpText, dueDateLayout = "full", showStatus = true }) {
	const handleDueDateSelect = (date) => {
		setFormState((prev) => ({
			...prev,
			dueDate: date ? format(date, "yyyy-MM-dd") : ""
		}));
	};
	const handleTitleChange = (event) => {
		setFormState((prev) => ({
			...prev,
			title: event.target.value
		}));
	};
	const handleDescriptionChange = (event) => {
		setFormState((prev) => ({
			...prev,
			description: event.target.value
		}));
	};
	const handleStatusChange = (value) => {
		setFormState((prev) => ({
			...prev,
			status: value
		}));
	};
	const handlePriorityChange = (value) => {
		setFormState((prev) => ({
			...prev,
			priority: value
		}));
	};
	const handleAssignedToChange = (value) => {
		setFormState((prev) => ({
			...prev,
			assignedTo: value
		}));
	};
	const dueDateField = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormField, {
		id: ids.dueDate,
		label: "Due date",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				id: ids.dueDate,
				type: "button",
				variant: "outline",
				className: cn(TASKS_THEME.selectTrigger, "w-full justify-start text-left font-normal", !formState.dueDate && "text-muted-foreground"),
				disabled,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "mr-2 size-4 shrink-0" }), formState.dueDate ? format(parseISO(formState.dueDate), "PPP") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pick a date" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			className: "w-auto p-0",
			align: "start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
				mode: "single",
				selected: formState.dueDate ? parseISO(formState.dueDate) : void 0,
				disabled: isTaskDueDateDisabled,
				onSelect: handleDueDateSelect,
				initialFocus: true
			})
		})] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TaskFormSection, {
			title: "Essentials",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormField, {
				id: ids.title,
				label: "Title",
				required: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: ids.title,
					value: formState.title,
					onChange: handleTitleChange,
					placeholder: titlePlaceholder,
					required: true,
					disabled,
					className: TASKS_THEME.input
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormField, {
				id: ids.description,
				label: "Description",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: ids.description,
					value: formState.description,
					onChange: handleDescriptionChange,
					placeholder: "Add context, goals, or next steps",
					rows: 4,
					disabled,
					className: TASKS_THEME.textarea
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TaskFormSection, {
			title: "Workflow",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3.5 sm:grid-cols-2",
					children: [showStatus ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormField, {
						id: ids.status,
						label: "Status",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: formState.status,
							onValueChange: handleStatusChange,
							disabled,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: ids.status,
								className: TASKS_THEME.selectTrigger,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select status" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "todo",
									children: formatStatusLabel("todo")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "in-progress",
									children: formatStatusLabel("in-progress")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "review",
									children: formatStatusLabel("review")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "completed",
									children: formatStatusLabel("completed")
								})
							] })]
						})
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormField, {
						id: ids.priority,
						label: "Priority",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: formState.priority,
							onValueChange: handlePriorityChange,
							disabled,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: ids.priority,
								className: TASKS_THEME.selectTrigger,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select priority" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "low",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrioritySelectItem, { value: "low" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "medium",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrioritySelectItem, { value: "medium" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "high",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrioritySelectItem, { value: "high" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "urgent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrioritySelectItem, { value: "urgent" })
								})
							] })]
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormField, {
					label: "Assigned to",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MentionInput, {
						value: formState.assignedTo,
						onChange: handleAssignedToChange,
						users: mentionableUsers,
						placeholder: "Type @ to assign teammates",
						disabled,
						allowMultiple: true
					})
				}),
				dueDateLayout === "compact" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3.5 sm:grid-cols-2",
					children: dueDateField
				}) : dueDateField
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormSection, {
			title: "Context",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3.5 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormField, {
					id: ids.client,
					label: "Client",
					hint: clientHelpText,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskContextChip, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn(!formState.clientName && "text-muted-foreground"),
						children: formState.clientName || clientPlaceholder
					}) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormField, {
					id: ids.project,
					label: "Project",
					hint: projectHelpText,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskContextChip, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn(!formState.projectName && "text-muted-foreground"),
						children: formState.projectName || projectPlaceholder
					}) })
				})]
			})
		})
	] });
}
function TaskSheetAttachmentsSection({ disabled, pendingAttachments, onAddAttachments, onRemoveAttachment, fileInputRef }) {
	const handleAttachFilesClick = () => {
		fileInputRef.current?.click();
	};
	const handleFileInputChange = (event) => {
		onAddAttachments(event.target.files);
		event.currentTarget.value = "";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TaskFormSection, {
		title: "Attachments",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: TASKS_THEME.hint,
					children: "Up to 10 files, 15MB each."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					className: "h-8 shrink-0 gap-1.5",
					onClick: handleAttachFilesClick,
					disabled,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-3.5" }), "Attach"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileInputRef,
				type: "file",
				multiple: true,
				"aria-label": "Attach files to task",
				className: "hidden",
				onChange: handleFileInputChange
			}),
			pendingAttachments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingAttachmentsList, {
				attachments: pendingAttachments,
				uploading: disabled,
				onRemove: onRemoveAttachment
			}) : null
		]
	});
}
var EDIT_TASK_FIELD_IDS = {
	title: "edit-task-title",
	description: "edit-task-description",
	status: "edit-task-status",
	priority: "edit-task-priority",
	client: "edit-task-client",
	project: "edit-task-project",
	dueDate: "edit-task-due-date"
};
var CREATE_TASK_FIELD_IDS = {
	title: "task-title",
	description: "task-description",
	status: "task-status",
	priority: "task-priority",
	client: "task-client",
	project: "task-project",
	dueDate: "task-due-date"
};
function CreateTaskSheet$1({ open, onOpenChange, formState, setFormState, creating, createError, onSubmit, participants, pendingAttachments, onAddAttachments, onRemoveAttachment }) {
	const fileInputRef = (0, import_react.useRef)(null);
	const mentionableUsers = teamMembersToMentionable(participants);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveFormSheet, {
		open,
		onOpenChange,
		contentClassName: TASKS_THEME.sheet.content,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex h-full min-h-0 flex-col",
			onSubmit,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskSheetHeader, {
					icon: ListTodo,
					title: "Create task",
					description: "Capture work, assign teammates, and set a due date."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: TASKS_THEME.sheet.body,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskSheetFields, {
							ids: CREATE_TASK_FIELD_IDS,
							formState,
							setFormState,
							disabled: creating,
							mentionableUsers,
							titlePlaceholder: "e.g. Prepare Q4 campaign brief",
							clientPlaceholder: "Select a client from the dashboard",
							projectPlaceholder: "Open tasks from a project to link automatically",
							clientHelpText: "Switch clients in the header to change assignment.",
							projectHelpText: "Start from a project view to attach tasks here.",
							dueDateLayout: "compact",
							showStatus: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskSheetAttachmentsSection, {
							disabled: creating,
							pendingAttachments,
							onAddAttachments,
							onRemoveAttachment,
							fileInputRef
						}),
						createError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskModalError, { message: createError }) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: TASKS_THEME.sheet.footer,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: creating,
						className: TASKS_THEME.footerPrimary,
						children: creating ? "Creating…" : "Create task"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormSheetClose, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							className: "h-9",
							disabled: creating,
							children: "Cancel"
						})
					})]
				})
			]
		})
	});
}
function EditTaskSheet$1({ open, onOpenChange, taskId, formState, setFormState, updating, updateError, onSubmit, currentWorkspaceId, currentUserId, currentUserName, currentUserRole, participants }) {
	const mentionableUsers = teamMembersToMentionable(participants);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveFormSheet, {
		open,
		onOpenChange,
		contentClassName: TASKS_THEME.sheet.content,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex h-full min-h-0 flex-col",
			onSubmit,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskSheetHeader, {
					icon: Pencil,
					title: "Edit task",
					description: "Update details, assignments, and scheduling."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: TASKS_THEME.sheet.body,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskSheetFields, {
							ids: EDIT_TASK_FIELD_IDS,
							formState,
							setFormState,
							disabled: updating,
							mentionableUsers,
							titlePlaceholder: "Task title",
							clientPlaceholder: "No client linked",
							projectPlaceholder: "No project linked"
						}),
						updateError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskModalError, { message: updateError }) : null,
						taskId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: TASKS_THEME.formSection,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: TASKS_THEME.formSectionTitle,
								children: "Discussion"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCommentsPanel, {
								taskId,
								workspaceId: currentWorkspaceId,
								userId: currentUserId,
								userName: currentUserName,
								userRole: currentUserRole,
								participants
							})]
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: TASKS_THEME.sheet.footer,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: updating,
						className: TASKS_THEME.footerPrimary,
						children: updating ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Saving…"]
						}) : "Save changes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormSheetClose, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							className: "h-9",
							disabled: updating,
							children: "Cancel"
						})
					})]
				})
			]
		})
	});
}
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
var EMPTY_TASK_PARTICIPANTS$1 = [];
var KANBAN_STATUSES = TASK_STATUSES.filter((status) => status !== "archived");
function TaskKanban$1({ tasks, loading, initialLoading, error, pendingStatusUpdates, onEdit, onDelete, onQuickStatusChange, onRefresh, loadingMore, hasMore, onLoadMore, emptyStateMessage, showEmptyStateFiltered, onEmptyClearFilters, onEmptyCreateTask, onClone, onShare, searchQuery = "", selectedTaskIds = EMPTY_SELECTED_TASK_IDS, onToggleTaskSelection, bulkActive = false, workspaceId = null, userId = null, userName = null, userRole = null, participants = EMPTY_TASK_PARTICIPANTS$1 }) {
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
/** Display key for a task row (Jira-style). */
function formatTaskKey(taskId) {
	const compact = taskId.replace(/[^a-zA-Z0-9]/g, "");
	if (compact.length <= 6) return `TASK-${compact.toUpperCase() || "1"}`;
	const tail = compact.slice(-5).toUpperCase();
	return `TASK-${compact.slice(0, 2).toUpperCase()}${tail}`;
}
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
var EMPTY_TASK_PARTICIPANTS = [];
function TaskList$1({ tasks, viewMode, loading, initialLoading, error, pendingStatusUpdates, onEdit, onDelete, onQuickStatusChange, onRefresh, loadingMore, hasMore, onLoadMore, emptyStateMessage, showEmptyStateFiltered, onEmptyClearFilters, onEmptyCreateTask, selectedTaskIds, onToggleTaskSelection, workspaceId = null, userId = null, userName = null, userRole = null, participants = EMPTY_TASK_PARTICIPANTS }) {
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
function ProjectFilterBanner({ projectId, projectName, onClear }) {
	if (!projectId && !projectName) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3 border-b border-border/40 px-4 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: TASKS_THEME.projectPill,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BriefcaseBusiness, {
				className: "size-3.5 shrink-0 text-primary",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "truncate",
				children: ["Project ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: projectName ?? "Selected"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "ghost",
			size: "sm",
			className: "h-7 shrink-0 gap-1 px-2 text-xs text-muted-foreground",
			onClick: onClear,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
				className: "size-3.5",
				"aria-hidden": true
			}), "Clear"]
		})]
	});
}
function parseAssignees(value) {
	return value.split(",").flatMap((entry) => {
		const trimmed = entry.trim();
		return trimmed.length > 0 ? [trimmed] : [];
	});
}
function TaskBulkToolbar({ selectedCount, totalVisible, hasSelection, bulkActive, bulkLabel, bulkProgress, onSelectAll, onClearSelection, onSelectHighPriority, onSelectDueSoon, onBulkStatusChange, onBulkAssign, onBulkDueDate, onBulkDelete }) {
	const [assignInput, setAssignInput] = (0, import_react.useState)("");
	const [dueDate, setDueDate] = (0, import_react.useState)(void 0);
	const masterRef = (0, import_react.useRef)(null);
	const selectAllLabel = (() => {
		if (selectedCount === totalVisible) return "All visible selected";
		return `Select all (${totalVisible})`;
	})();
	const masterChecked = hasSelection && selectedCount === totalVisible;
	const masterIndeterminate = hasSelection && selectedCount > 0 && selectedCount < totalVisible;
	const handleMasterChange = () => {
		if (hasSelection && selectedCount === totalVisible) onClearSelection();
		else onSelectAll();
	};
	const handleStatusChange = (value) => {
		onBulkStatusChange(value);
	};
	const handleAssignInputChange = (event) => {
		setAssignInput(event.target.value);
	};
	const handleAssignClick = () => {
		onBulkAssign(parseAssignees(assignInput));
	};
	const handleUpdateDueDate = () => {
		onBulkDueDate(dueDate ? format(dueDate, "yyyy-MM-dd") : null);
	};
	const handleClearDate = () => {
		setDueDate(void 0);
		onBulkDueDate(null);
	};
	(0, import_react.useEffect)(() => {
		if (masterRef.current) masterRef.current.indeterminate = masterIndeterminate;
	}, [masterIndeterminate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 border-b border-border/50 bg-primary/[0.03] px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2 shadow-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							ref: masterRef,
							checked: masterChecked,
							onChange: handleMasterChange,
							"aria-label": selectAllLabel
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-medium text-foreground",
							children: [selectedCount, " selected"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: ["of ", totalVisible]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: onSelectAll,
							disabled: bulkActive,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCheckBig, { className: "mr-2 size-4" }), selectAllLabel]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: onClearSelection,
							disabled: !hasSelection || bulkActive,
							children: "Clear"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							size: "sm",
							onClick: onSelectHighPriority,
							disabled: bulkActive,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "mr-2 size-4" }), " High priority"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							size: "sm",
							onClick: onSelectDueSoon,
							disabled: bulkActive,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "mr-2 size-4" }), " Due soon"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs text-muted-foreground",
							children: "Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							onValueChange: handleStatusChange,
							disabled: !hasSelection || bulkActive,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "w-[150px] h-9",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Change status" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TASK_STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: status,
								children: [
									status === "todo" && "To do",
									status === "in-progress" && "In progress",
									status === "review" && "Review",
									status === "completed" && "Completed"
								]
							}, status)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "bulk-assign",
								className: "text-xs text-muted-foreground",
								children: "Assign to"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "bulk-assign",
								value: assignInput,
								onChange: handleAssignInputChange,
								placeholder: "Comma-separated names",
								className: "h-9 w-[220px]",
								disabled: !hasSelection || bulkActive
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: handleAssignClick,
								disabled: !hasSelection || bulkActive,
								children: "Apply"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs text-muted-foreground whitespace-nowrap",
								children: "Due date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: cn("w-[160px] h-9 justify-start text-left font-normal", !dueDate && "text-muted-foreground"),
									disabled: !hasSelection || bulkActive,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "mr-2 size-4" }), dueDate ? format(dueDate, "PP") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pick a date" })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
								className: "w-auto p-0",
								align: "start",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
									mode: "single",
									selected: dueDate,
									disabled: isTaskDueDateDisabled,
									onSelect: setDueDate,
									initialFocus: true
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: handleUpdateDueDate,
								disabled: !hasSelection || bulkActive || !dueDate,
								children: "Update"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: handleClearDate,
								disabled: !hasSelection || bulkActive,
								children: "Clear date"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "destructive",
							onClick: onBulkDelete,
							disabled: !hasSelection || bulkActive,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), " Delete"]
						})
					})
				]
			}),
			bulkActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 rounded-md border border-muted/50 bg-background px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: bulkLabel }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-medium text-foreground",
						children: [Math.round(bulkProgress), "%"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
					value: bulkProgress,
					className: "h-2"
				})]
			})
		]
	});
}
function TaskFilters({ searchQuery, onSearchChange, selectedStatus, onStatusChange, selectedAssignee, onAssigneeChange, assigneeOptions, showAssigneeFilter, sortField, onSortFieldChange, sortDirection, onSortDirectionToggle, hasActiveFilters = false, onClearFilters }) {
	const [filtersOpen, setFiltersOpen] = (0, import_react.useState)(false);
	const handleSearchChange = (event) => {
		onSearchChange(event.target.value);
	};
	const handleSearchKeyDown = (event) => {
		if (event.key === "Escape") onSearchChange("");
	};
	const handleSortFieldChange = (value) => {
		onSortFieldChange(value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: TASKS_THEME.filterBar,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative min-w-0 flex-1 sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
					className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "task-search",
					value: searchQuery,
					onChange: handleSearchChange,
					onKeyDown: handleSearchKeyDown,
					placeholder: "Search by title, client, or assignee…",
					className: "h-9 border-border/60 bg-background pl-9 pr-20 text-sm shadow-sm",
					"aria-label": "Search tasks"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 sm:inline-flex",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardShortcutBadge, {
						combo: "mod+f",
						className: "scale-90 opacity-70"
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
				open: filtersOpen,
				onOpenChange: setFiltersOpen,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						className: "h-9 gap-1.5 border-border/60 bg-background font-normal shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, {
								className: "size-3.5",
								"aria-hidden": true
							}),
							"Filters",
							hasActiveFilters ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground",
								"aria-hidden": true,
								children: "•"
							}) : null
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
					align: "end",
					className: "w-72 space-y-3 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, {
								className: "size-3.5",
								"aria-hidden": true
							}), "Refine"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: selectedStatus,
							onValueChange: onStatusChange,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-9 w-full",
								"aria-label": "Filter by status",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Status" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "todo",
									children: "To do"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "in-progress",
									children: "In progress"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "review",
									children: "Review"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "completed",
									children: "Completed"
								})
							] })]
						}),
						showAssigneeFilter ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: selectedAssignee,
							onValueChange: onAssigneeChange,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-9 w-full",
								"aria-label": "Filter by assignee",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Assignee" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All assignees"
							}), assigneeOptions.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: name,
								children: name
							}, name))] })]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: sortField,
								onValueChange: handleSortFieldChange,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "h-9 flex-1",
									"aria-label": "Sort by",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Sort" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SORT_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: option.value,
									children: option.label
								}, option.value)) })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								size: "icon",
								className: "size-9 shrink-0",
								onClick: onSortDirectionToggle,
								"aria-label": sortDirection === "asc" ? "Sort descending" : "Sort ascending",
								children: sortDirection === "asc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-4" })
							})]
						}),
						hasActiveFilters && onClearFilters ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							className: "h-9 w-full",
							onClick: onClearFilters,
							children: "Clear filters"
						}) : null
					]
				})]
			})
		})]
	});
}
function TaskResultsCount({ sortedCount, totalCount, loading }) {
	if (totalCount === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: TASKS_THEME.footer,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
			"Showing ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium text-foreground",
				children: sortedCount
			}),
			" of",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium text-foreground",
				children: totalCount
			}),
			" task",
			totalCount !== 1 ? "s" : ""
		] }), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex items-center gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				className: "size-3 animate-spin",
				"aria-hidden": true
			}), "Updating…"]
		}) : null]
	});
}
var stripStatuses = [
	"todo",
	"in-progress",
	"review",
	"completed"
];
var stripStyles = {
	todo: {
		ring: "ring-muted-foreground/35",
		accent: "bg-muted-foreground/50",
		text: "text-muted-foreground",
		hover: "hover:bg-muted/60"
	},
	"in-progress": {
		ring: "ring-primary/40",
		accent: "bg-primary",
		text: "text-primary",
		hover: "hover:bg-primary/10"
	},
	review: {
		ring: "ring-warning/40",
		accent: "bg-warning",
		text: "text-warning",
		hover: "hover:bg-warning/10"
	},
	completed: {
		ring: "ring-success/40",
		accent: "bg-success",
		text: "text-success",
		hover: "hover:bg-success/10"
	},
	archived: {
		ring: "ring-muted-foreground/25",
		accent: "bg-muted-foreground/40",
		text: "text-muted-foreground",
		hover: "hover:bg-muted/40"
	}
};
var TaskSummaryCards = function TaskSummaryCards({ taskCounts, selectedStatus = "all", onStatusCardClick }) {
	const total = stripStatuses.reduce((sum, status) => sum + (taskCounts[status] ?? 0), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: TASKS_THEME.summaryCard,
		"aria-label": "Task counts by status",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-3xl font-semibold tabular-nums tracking-tight text-foreground",
					children: total
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pb-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-foreground",
						children: "Open workload"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [total === 1 ? "1 active task" : `${total} active tasks`, " across columns"]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("fieldset", {
				className: "m-0 grid min-w-0 grid-cols-2 gap-2 border-0 p-0 sm:flex sm:flex-wrap sm:justify-end",
				"aria-label": "Filter by status",
				children: stripStatuses.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, {
					status,
					count: taskCounts[status] ?? 0,
					isSelected: selectedStatus === status,
					onSelect: onStatusCardClick
				}, status))
			})]
		})
	});
};
function StatusChip({ status, count, isSelected, onSelect }) {
	const interactive = Boolean(onSelect);
	const Icon = STATUS_ICONS[status];
	const styles = stripStyles[status];
	const onSelectStatusSummary = () => {
		onSelect?.(status);
	};
	const handleKeyDown = (event) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onSelect?.(status);
		}
	};
	const className = cn("inline-flex min-w-0 items-center gap-2 rounded-xl border border-border/50 bg-background/70 px-3 py-2 text-left text-sm transition-all sm:min-w-[8.5rem]", styles.hover, interactive && "cursor-pointer", isSelected && cn("border-transparent ring-2 ring-offset-2 ring-offset-card", styles.ring));
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("h-1.5 w-8 shrink-0 rounded-full", styles.accent),
			"aria-hidden": true
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: cn("size-3.5 shrink-0", styles.text),
			"aria-hidden": true
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 flex-1 truncate font-medium text-foreground",
			children: formatStatusLabel(status)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("shrink-0 tabular-nums text-xs font-semibold", styles.text),
			children: count
		})
	] });
	if (!interactive) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className,
		children: content
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className,
		onClick: onSelectStatusSummary,
		onKeyDown: handleKeyDown,
		"aria-pressed": isSelected,
		"aria-label": `${formatStatusLabel(status)}: ${count} tasks`,
		children: content
	});
}
var VIEW_OPTIONS = [
	{
		mode: "list",
		label: "List",
		icon: List
	},
	{
		mode: "grid",
		label: "Grid",
		icon: LayoutGrid
	},
	{
		mode: "board",
		label: "Board",
		icon: Columns3
	}
];
function TaskViewControls({ viewMode, onViewModeChange, onExport, canExport }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fieldset", {
			className: cn(TASKS_THEME.segmented, "m-0 min-w-0 border-0 p-0"),
			"aria-label": "View mode",
			children: VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewToggleButton, {
				mode,
				active: viewMode === mode,
				label,
				icon: Icon,
				onViewModeChange
			}, mode))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "outline",
			size: "sm",
			className: "h-9 gap-1.5 border-border/60 bg-background/80 text-xs shadow-sm",
			onClick: onExport,
			disabled: !canExport,
			"aria-label": "Export tasks to Excel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
				className: "size-3.5",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden sm:inline",
				children: "Export"
			})]
		})]
	});
}
function ViewToggleButton({ mode, active, label, onViewModeChange, icon: Icon }) {
	const onSelectTaskViewMode = () => {
		onViewModeChange(mode);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: TASKS_THEME.segmentedButton(active),
		onClick: onSelectTaskViewMode,
		"aria-label": `${label} view`,
		"aria-pressed": active,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-3.5",
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden sm:inline",
			children: label
		})]
	});
}
function TasksHeader({ loading, retryCount, onRefresh, onNewTaskClick, scopeLabel, scopeHelper, newTaskDisabledReason = null }) {
	const title = PAGE_TITLES.tasks?.title ?? "Tasks";
	const description = PAGE_TITLES.tasks?.description ?? "Track and manage work items across projects.";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardPageHero, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: getIconContainerClasses("medium"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListTodo, {
						className: "size-6",
						"aria-hidden": true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: DASHBOARD_THEME.layout.title,
							children: title
						}), scopeLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "truncate text-sm font-medium text-muted-foreground",
							children: ["/ ", scopeLabel]
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn(DASHBOARD_THEME.layout.subtitle, "mt-1 max-w-2xl text-sm"),
						children: scopeHelper ?? description
					})]
				})]
			}),
			retryCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs font-medium text-warning",
				children: [
					"Retrying… ",
					retryCount,
					"/",
					RETRY_CONFIG.maxRetries
				]
			}) : null,
			newTaskDisabledReason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-2xl text-xs text-warning",
				children: newTaskDisabledReason
			}) : null
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex shrink-0 items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "outline",
			size: "sm",
			className: cn(getButtonClasses("outline"), "h-9 gap-1.5"),
			onClick: onRefresh,
			disabled: loading,
			"aria-busy": loading,
			children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				className: "size-4 animate-spin",
				"aria-hidden": true
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
				className: "size-4",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden sm:inline",
				children: "Refresh"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				size: "sm",
				className: cn(getButtonClasses("primary"), "h-9 gap-1.5 shadow-none"),
				onClick: onNewTaskClick,
				disabled: Boolean(newTaskDisabledReason),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
					className: "size-4",
					"aria-hidden": true
				}), "New task"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
			className: "max-w-xs text-balance",
			children: newTaskDisabledReason ? newTaskDisabledReason : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex flex-wrap items-center gap-2",
				children: ["Create a task", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardShortcutBadge, {
					combo: "mod+n",
					className: "scale-90"
				})]
			})
		})] })]
	})] });
}
function buildTaskListFilters(input) {
	const filters = {};
	let hasFilters = false;
	if (input.selectedStatus !== "all") {
		filters.status = input.selectedStatus;
		hasFilters = true;
	}
	const search = input.searchQuery.trim();
	if (search) {
		filters.searchQuery = search;
		hasFilters = true;
	}
	if (input.projectId) {
		filters.projectId = input.projectId;
		hasFilters = true;
	}
	if (input.activeTab === "my-tasks" && input.userId) {
		filters.assigneeUserId = input.userId;
		hasFilters = true;
	} else if (input.selectedAssignee !== "all") {
		filters.assigneeMatch = input.selectedAssignee;
		hasFilters = true;
	}
	return hasFilters ? filters : void 0;
}
function taskListFiltersScopeKey(filters) {
	if (!filters) return "";
	return [
		filters.status ?? "",
		filters.searchQuery ?? "",
		filters.assigneeUserId ?? "",
		filters.assigneeMatch ?? "",
		filters.projectId ?? ""
	].join("|");
}
function sortTasksByUpdatedAt(tasks) {
	return tasks.toSorted((left, right) => {
		const leftMs = left.updatedAt ? Date.parse(left.updatedAt) : 0;
		return (right.updatedAt ? Date.parse(right.updatedAt) : 0) - leftMs;
	});
}
function mergeTaskPages(firstPage, olderPages) {
	const byId = /* @__PURE__ */ new Map();
	for (const task of firstPage) byId.set(task.id, task);
	for (const task of olderPages) if (!byId.has(task.id)) byId.set(task.id, task);
	return sortTasksByUpdatedAt(Array.from(byId.values()));
}
function parsePaginatedTasksQuery(value) {
	if (!value || typeof value !== "object") return null;
	if (!Array.isArray(value.items)) return null;
	const nextCursor = value.nextCursor;
	const parsedCursor = nextCursor && typeof nextCursor === "object" && typeof nextCursor.fieldValue === "number" && typeof nextCursor.legacyId === "string" ? nextCursor : null;
	return {
		items: value.items,
		nextCursor: parsedCursor
	};
}
function msFromIsoDateString(input) {
	if (!input) return null;
	const ms = Date.parse(input);
	return Number.isNaN(ms) ? null : ms;
}
function toIsoDateString(input) {
	if (input == null) return null;
	const date = new Date(input);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
var INITIAL_USE_TASKS_STATE = {
	tasks: [],
	error: null,
	pendingStatusUpdates: /* @__PURE__ */ new Set()
};
function resolveStateUpdate(previous, updater) {
	return typeof updater === "function" ? updater(previous) : updater;
}
function tasksReducer(state, action) {
	switch (action.type) {
		case "syncData": return {
			...state,
			tasks: action.tasks,
			error: action.error
		};
		case "setTasks": return {
			...state,
			tasks: resolveStateUpdate(state.tasks, action.updater)
		};
		case "setError": return {
			...state,
			error: resolveStateUpdate(state.error, action.updater)
		};
		case "setPendingStatusUpdates": return {
			...state,
			pendingStatusUpdates: resolveStateUpdate(state.pendingStatusUpdates, action.updater)
		};
		default: return state;
	}
}
function mapConvexTaskToTaskRecord(row) {
	const attachments = Array.isArray(row.attachments) ? row.attachments.flatMap((item) => item && typeof item.name === "string" && typeof item.url === "string" ? [{
		name: item.name,
		url: item.url,
		type: typeof item.type === "string" ? item.type : null,
		size: typeof item.size === "string" ? item.size : null
	}] : []) : [];
	return {
		id: String(row.legacyId),
		title: row.title,
		description: row.description ?? null,
		status: row.status,
		priority: row.priority,
		assignedTo: Array.isArray(row.assignedTo) ? row.assignedTo : [],
		clientId: row.clientId ?? null,
		client: row.client ?? null,
		projectId: row.projectId ?? null,
		projectName: row.projectName ?? null,
		dueDate: toIsoDateString(row.dueDateMs ?? null),
		attachments,
		createdAt: toIsoDateString(row.createdAtMs ?? null),
		updatedAt: toIsoDateString(row.updatedAtMs ?? null),
		deletedAt: toIsoDateString(row.deletedAtMs ?? null)
	};
}
function useTasks({ userId, clientId, authLoading, isPreviewMode = false, workspaceId, listFilters }) {
	const [{ tasks, error, pendingStatusUpdates }, dispatch] = (0, import_react.useReducer)(tasksReducer, INITIAL_USE_TASKS_STATE);
	const setTasks = (updater) => {
		dispatch({
			type: "setTasks",
			updater
		});
	};
	const setError = (updater) => {
		dispatch({
			type: "setError",
			updater
		});
	};
	const setPendingStatusUpdates = (updater) => {
		dispatch({
			type: "setPendingStatusUpdates",
			updater
		});
	};
	const paginationScopeKey = `${workspaceId ?? ""}|${clientId ?? ""}|${taskListFiltersScopeKey(listFilters)}|${isPreviewMode ? "preview" : "live"}`;
	const tasksQueryEnabled = !isPreviewMode && !authLoading && Boolean(workspaceId);
	const [loadCursor, setLoadCursor] = (0, import_react.useState)(null);
	const convexListArgs = {
		workspaceId,
		limit: 50,
		cursor: loadCursor,
		...listFilters ?? {}
	};
	const convexAllTasksQuery = useQuery(tasksApi.list, tasksQueryEnabled && clientId === void 0 ? convexListArgs : "skip");
	const convexClientTasksQuery = useQuery(tasksApi.listByClient, tasksQueryEnabled && clientId !== void 0 ? {
		...convexListArgs,
		clientId
	} : "skip");
	const convexTasksQuery = clientId === void 0 ? convexAllTasksQuery : convexClientTasksQuery;
	const tasksQueryError = useConvexQueryError({
		data: convexTasksQuery,
		skipped: !tasksQueryEnabled,
		fallbackMessage: "Unable to load tasks."
	});
	const taskPagination = useAccumulatedCursorPages({
		scopeKey: paginationScopeKey,
		queryData: convexTasksQuery,
		loadCursor,
		setLoadCursor,
		enabled: tasksQueryEnabled,
		getItemKey: (task) => task.id,
		parsePage: (queryData) => {
			const paginated = parsePaginatedTasksQuery(queryData);
			if (!paginated) {
				if (queryData !== void 0) logError(queryData, "useTasks:unexpectedQueryShape");
				return {
					items: [],
					nextCursor: null
				};
			}
			return {
				items: paginated.items.map((row) => mapConvexTaskToTaskRecord(row)),
				nextCursor: paginated.nextCursor
			};
		},
		mergePages: mergeTaskPages
	});
	const createTask = useMutation(tasksApi.createTask);
	const patchTask = useMutation(tasksApi.patchTask);
	const bulkPatchTasks = useMutation(tasksApi.bulkPatchTasks);
	const softDeleteTask = useMutation(tasksApi.softDeleteTask);
	const bulkSoftDeleteTasks = useMutation(tasksApi.bulkSoftDeleteTasks);
	const loading = (() => {
		if (isPreviewMode) return false;
		if (authLoading) return true;
		if (!userId || !workspaceId) return false;
		return taskPagination.isInitialLoading;
	})();
	(0, import_react.useEffect)(() => {
		if (isPreviewMode) {
			dispatch({
				type: "syncData",
				tasks: getPreviewTasks(clientId ?? null),
				error: null
			});
			return;
		}
		if (!userId || !workspaceId || convexTasksQuery === void 0) return;
		dispatch({
			type: "syncData",
			tasks: taskPagination.mergedItems,
			error: tasksQueryError ?? null
		});
	}, [
		clientId,
		convexTasksQuery,
		isPreviewMode,
		taskPagination.mergedItems,
		userId,
		workspaceId,
		tasksQueryError
	]);
	const handleLoadMore = () => {
		if (isPreviewMode) return;
		taskPagination.loadMore();
	};
	const handleRefresh = async () => {
		taskPagination.reset();
		notifySuccess({
			title: "Up to date",
			message: "Tasks update in real time."
		});
	};
	const handleQuickStatusChange = async (task, newStatus) => {
		if (isPreviewMode) {
			setTasks((prev) => prev.map((t) => t.id === task.id ? {
				...t,
				status: newStatus
			} : t));
			notifyInfo({
				title: "Preview mode",
				message: `Status changed to "${formatStatusLabel(newStatus)}" (not saved).`
			});
			return;
		}
		if (!workspaceId) return;
		if (pendingStatusUpdates.has(task.id)) return;
		const previousStatus = task.status;
		setTasks((prev) => prev.map((t) => t.id === task.id ? {
			...t,
			status: newStatus
		} : t));
		setPendingStatusUpdates((prev) => new Set(prev).add(task.id));
		try {
			await patchTask({
				workspaceId,
				legacyId: task.id,
				update: { status: newStatus }
			});
			notifySuccess({
				title: "Status updated",
				message: `Task moved to "${formatStatusLabel(newStatus)}".`
			});
		} catch (err) {
			logError(err, "useTasks:handleQuickStatusChange");
			setTasks((prev) => prev.map((t) => t.id === task.id ? {
				...t,
				status: previousStatus
			} : t));
			reportConvexFailure({
				error: err,
				context: "use-tasks.ts:catch",
				title: "Status update failed",
				fallbackMessage: "Status update failed"
			});
		} finally {
			setPendingStatusUpdates((prev) => {
				const next = new Set(prev);
				next.delete(task.id);
				return next;
			});
		}
	};
	const handleDeleteTask = async (task) => {
		if (isPreviewMode) {
			notifyInfo({
				title: "Preview mode",
				message: "Changes are not saved in preview mode. Exit preview to make real changes."
			});
			return true;
		}
		if (!workspaceId) return false;
		try {
			await softDeleteTask({
				workspaceId,
				legacyId: task.id
			});
			notifySuccess({
				title: "Task deleted",
				message: `"${task.title}" has been removed.`
			});
			return true;
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useTasks:handleDeleteTask",
				title: "Deletion failed",
				fallbackMessage: "Deletion failed"
			});
			return false;
		}
	};
	const handleCreateTask = async (payload) => {
		if (isPreviewMode) {
			const fakeTask = {
				id: `preview-task-${Date.now()}`,
				title: payload.title,
				description: payload.description ?? null,
				status: payload.status,
				priority: payload.priority,
				assignedTo: payload.assignedTo,
				clientId: payload.clientId,
				client: payload.client ?? null,
				projectId: payload.projectId ?? null,
				projectName: payload.projectName ?? null,
				dueDate: payload.dueDate ?? null,
				attachments: payload.attachments ?? [],
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
				deletedAt: null
			};
			setTasks((prev) => [fakeTask, ...prev]);
			notifyInfo({
				title: "Preview mode",
				message: "Task created locally (not saved)."
			});
			return fakeTask;
		}
		if (!workspaceId) throw new Error("Workspace not available.");
		try {
			const result = await createTask({
				workspaceId,
				title: payload.title,
				description: payload.description ?? null,
				status: payload.status,
				priority: payload.priority,
				assignedTo: payload.assignedTo,
				clientId: payload.clientId,
				client: payload.client ?? null,
				projectId: payload.projectId ?? null,
				projectName: payload.projectName ?? null,
				dueDateMs: msFromIsoDateString(payload.dueDate),
				attachments: payload.attachments ?? []
			});
			const legacyId = typeof result === "string" ? result : typeof result?.legacyId === "string" ? result.legacyId : null;
			if (!legacyId) throw new Error("Task creation failed to return a task id.");
			notifySuccess({
				title: "Task created",
				message: `"${payload.title}" added.`
			});
			return {
				id: legacyId,
				title: payload.title,
				description: payload.description ?? null,
				status: payload.status,
				priority: payload.priority,
				assignedTo: payload.assignedTo,
				clientId: payload.clientId,
				client: payload.client ?? null,
				projectId: payload.projectId ?? null,
				projectName: payload.projectName ?? null,
				dueDate: payload.dueDate ?? null,
				attachments: payload.attachments ?? [],
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
				deletedAt: null
			};
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useTasks:handleCreateTask",
				title: "Creation failed",
				fallbackMessage: "Creation failed"
			});
			return null;
		}
	};
	const handleUpdateTask = async (taskId, payload) => {
		if (isPreviewMode) {
			setTasks((prev) => prev.map((t) => t.id === taskId ? {
				...t,
				title: payload.title ?? t.title,
				description: payload.description ?? t.description,
				status: payload.status ?? t.status,
				priority: payload.priority ?? t.priority,
				assignedTo: payload.assignedTo ?? t.assignedTo,
				dueDate: payload.dueDate ?? t.dueDate,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			} : t));
			notifyInfo({
				title: "Preview mode",
				message: "Task updated locally (not saved)."
			});
			return { id: taskId };
		}
		if (!workspaceId) {
			const message = "Workspace not available.";
			notifyFailure({
				title: "Update failed",
				message
			});
			throw new Error(message);
		}
		try {
			await patchTask({
				workspaceId,
				legacyId: taskId,
				update: {
					title: payload.title,
					description: payload.description ?? null,
					status: payload.status,
					priority: payload.priority,
					assignedTo: payload.assignedTo,
					dueDateMs: msFromIsoDateString(payload.dueDate)
				}
			});
			notifySuccess({
				title: "Task updated",
				message: "Changes saved."
			});
			return { id: taskId };
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useTasks:handleUpdateTask",
				title: "Update failed",
				fallbackMessage: "Update failed"
			});
			throw err;
		}
	};
	const handleBulkUpdate = async (ids, update) => {
		if (isPreviewMode) {
			const idSet = new Set(ids);
			setTasks((prev) => prev.map((t) => {
				if (!idSet.has(t.id)) return t;
				return {
					...t,
					status: update.status ?? t.status,
					priority: update.priority ?? t.priority,
					assignedTo: update.assignedTo ?? t.assignedTo,
					dueDate: update.dueDate ?? t.dueDate,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				};
			}));
			notifyInfo({
				title: "Preview mode",
				message: `${ids.length} task(s) updated locally (not saved).`
			});
			return true;
		}
		if (!workspaceId) return false;
		try {
			await bulkPatchTasks({
				workspaceId,
				ids,
				update: {
					status: update.status,
					priority: update.priority,
					assignedTo: update.assignedTo,
					dueDateMs: update.dueDate !== void 0 ? msFromIsoDateString(update.dueDate) : void 0
				}
			});
			notifySuccess({ message: "Bulk update complete" });
			return true;
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useTasks:handleBulkUpdate",
				title: "Bulk update failed",
				fallbackMessage: "Bulk update failed"
			});
			return false;
		}
	};
	const handleBulkDelete = async (ids) => {
		if (isPreviewMode) {
			notifyInfo({
				title: "Preview mode",
				message: "Changes are not saved in preview mode. Exit preview to make real changes."
			});
			return true;
		}
		if (!workspaceId) return false;
		try {
			await bulkSoftDeleteTasks({
				workspaceId,
				ids
			});
			notifySuccess({ message: "Bulk deletion complete" });
			return true;
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useTasks:handleBulkDelete",
				title: "Bulk deletion failed",
				fallbackMessage: "Bulk deletion failed"
			});
			return false;
		}
	};
	return {
		tasks,
		setTasks,
		nextCursor: taskPagination.nextCursor,
		loading,
		loadingMore: taskPagination.isLoadingMore,
		hasMoreTasks: Boolean(taskPagination.nextCursor),
		error,
		setError,
		retryCount: 0,
		pendingStatusUpdates,
		handleLoadMore,
		handleRefresh,
		handleQuickStatusChange,
		handleDeleteTask,
		handleCreateTask,
		handleUpdateTask,
		handleBulkUpdate,
		handleBulkDelete
	};
}
function useTaskForm({ selectedClient, selectedClientId, projectContext, userId, participants = [], initialCreateOpen = false, onCreateOpenChange, onCreateTask, onUpdateTask }) {
	const convex = useConvex();
	const { user } = useAuth();
	const [isCreateOpen, setIsCreateOpen] = (0, import_react.useState)(initialCreateOpen);
	const [formState, setFormState] = (0, import_react.useState)(() => buildInitialFormState(selectedClient ?? void 0, projectContext));
	const [createAttachments, setCreateAttachments] = (0, import_react.useState)([]);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [createError, setCreateError] = (0, import_react.useState)(null);
	const generateUploadUrl = useMutation(filesApi.generateUploadUrl);
	const syncMetadata = useMutation(filesApi.syncMetadata);
	const getPublicUrl = (args) => {
		const workspaceId = user?.agencyId;
		if (!workspaceId) throw new Error("Workspace context missing");
		return convex.query(filesApi.getPublicUrl, {
			workspaceId,
			storageId: args.storageId
		});
	};
	const [editingTask, setEditingTask] = (0, import_react.useState)(null);
	const [isEditOpen, setIsEditOpen] = (0, import_react.useState)(false);
	const [editFormState, setEditFormState] = (0, import_react.useState)(() => buildInitialFormState());
	const [updating, setUpdating] = (0, import_react.useState)(false);
	const [updateError, setUpdateError] = (0, import_react.useState)(null);
	const [deletingTask, setDeletingTask] = (0, import_react.useState)(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = (0, import_react.useState)(false);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const nextClientId = selectedClient?.id ?? null;
	const nextClientName = selectedClient?.name ?? "";
	const nextProjectId = projectContext?.id ?? null;
	const nextProjectName = projectContext?.name ?? "";
	if (formState.clientId !== nextClientId || formState.clientName !== nextClientName || formState.projectId !== nextProjectId || formState.projectName !== nextProjectName) setFormState((prev) => ({
		...prev,
		clientId: nextClientId,
		clientName: nextClientName,
		projectId: nextProjectId,
		projectName: nextProjectName
	}));
	const resetForm = () => {
		setFormState(buildInitialFormState(selectedClient ?? void 0, projectContext));
		setCreateAttachments([]);
		setCreateError(null);
	};
	const handleCreateAttachmentsAdd = (files) => {
		if (!files || files.length === 0) return;
		const next = buildPendingTaskAttachments(files);
		setCreateAttachments((prev) => [...prev, ...next].slice(0, 10));
	};
	const handleCreateAttachmentRemove = (attachmentId) => {
		setCreateAttachments((prev) => prev.filter((item) => item.id !== attachmentId));
	};
	const handleCreateOpenChange = (open) => {
		setIsCreateOpen(open);
		onCreateOpenChange?.(open);
		if (open) {
			setCreateError(null);
			setFormState((prev) => ({
				...prev,
				clientId: selectedClient?.id ?? null,
				clientName: selectedClient?.name ?? "",
				projectId: projectContext?.id ?? null,
				projectName: projectContext?.name ?? ""
			}));
		} else resetForm();
	};
	const handleCreateSubmit = async (event) => {
		event.preventDefault();
		if (!userId) {
			setCreateError("You must be signed in to create tasks.");
			return;
		}
		if (!selectedClientId) {
			setCreateError("Select a client from the dashboard before creating tasks.");
			return;
		}
		const trimmedTitle = formState.title.trim();
		if (!trimmedTitle) {
			setCreateError("Title is required.");
			return;
		}
		if (formState.dueDate && !isFutureTaskDueDateValue(formState.dueDate)) {
			setCreateError("Due date must be today or later.");
			return;
		}
		const assigneeIssue = getAssigneeDraftIssue(formState.assignedTo, participants);
		if (assigneeIssue) {
			setCreateError(assigneeIssue);
			return;
		}
		setCreating(true);
		setCreateError(null);
		const assignedMembers = resolveAssigneeUserIds(formState.assignedTo, participants);
		const normalizedClientName = (selectedClient?.name ?? formState.clientName).trim();
		const normalizedProjectName = formState.projectName.trim();
		const payload = {
			title: trimmedTitle,
			description: formState.description.trim() || void 0,
			status: formState.status,
			priority: formState.priority,
			assignedTo: assignedMembers,
			clientId: selectedClientId,
			client: normalizedClientName || void 0,
			projectId: formState.projectId ?? void 0,
			projectName: normalizedProjectName || void 0,
			dueDate: formState.dueDate || void 0,
			attachments: []
		};
		try {
			if (createAttachments.length > 0) payload.attachments = await Promise.all(createAttachments.map((attachment) => uploadTaskAttachment({
				userId,
				file: attachment.file,
				generateUploadUrl: () => generateUploadUrl({}),
				syncMetadata: (args) => syncMetadata(args),
				getPublicUrl
			})));
			if (await onCreateTask(payload)) handleCreateOpenChange(false);
		} catch (err) {
			setCreateError(asErrorMessage(err));
		} finally {
			setCreating(false);
		}
	};
	const handleEditOpen = (task) => {
		setEditingTask(task);
		setEditFormState({
			title: task.title,
			description: task.description || "",
			status: task.status,
			priority: task.priority,
			assignedTo: formatAssigneeDraftFromUserIds(task.assignedTo ?? [], participants),
			clientId: task.clientId || null,
			clientName: task.client || "",
			projectId: task.projectId || null,
			projectName: task.projectName || "",
			dueDate: task.dueDate || ""
		});
		setUpdateError(null);
		setIsEditOpen(true);
	};
	const handleEditClose = () => {
		setIsEditOpen(false);
		setEditingTask(null);
		setEditFormState(buildInitialFormState());
		setUpdateError(null);
	};
	const handleEditSubmit = async (event) => {
		event.preventDefault();
		if (!editingTask) return;
		const trimmedTitle = editFormState.title.trim();
		if (!trimmedTitle) {
			setUpdateError("Title is required.");
			return;
		}
		if (editFormState.dueDate && !isFutureTaskDueDateValue(editFormState.dueDate)) {
			setUpdateError("Due date must be today or later.");
			return;
		}
		const assigneeIssue = getAssigneeDraftIssue(editFormState.assignedTo, participants);
		if (assigneeIssue) {
			setUpdateError(assigneeIssue);
			return;
		}
		setUpdating(true);
		setUpdateError(null);
		const assignedMembers = resolveAssigneeUserIds(editFormState.assignedTo, participants);
		const payload = {
			title: trimmedTitle,
			description: editFormState.description.trim() || void 0,
			status: editFormState.status,
			priority: editFormState.priority,
			assignedTo: assignedMembers,
			dueDate: editFormState.dueDate || void 0
		};
		try {
			if (await onUpdateTask(editingTask.id, payload)) handleEditClose();
		} catch (err) {
			setUpdateError(asErrorMessage(err));
		} finally {
			setUpdating(false);
		}
	};
	const handleDeleteClick = (task) => {
		setDeletingTask(task);
		setIsDeleteDialogOpen(true);
	};
	const handleDeleteClose = () => {
		setIsDeleteDialogOpen(false);
		setDeletingTask(null);
	};
	return {
		isCreateOpen,
		formState,
		setFormState,
		creating,
		createError,
		handleCreateOpenChange,
		handleCreateSubmit,
		createAttachments,
		handleCreateAttachmentsAdd,
		handleCreateAttachmentRemove,
		isEditOpen,
		editingTask,
		editFormState,
		setEditFormState,
		updating,
		updateError,
		handleEditOpen,
		handleEditClose,
		handleEditSubmit,
		isDeleteDialogOpen,
		deletingTask,
		deleting,
		handleDeleteClick,
		handleDeleteClose,
		setDeleting
	};
}
var TASK_VIEW_MODE_STORAGE_KEY = "dashboard:tasks:view-mode";
function getInitialTaskViewMode() {
	if (typeof window === "undefined") return "list";
	const persisted = window.localStorage.getItem(TASK_VIEW_MODE_STORAGE_KEY);
	if (persisted === "list" || persisted === "grid" || persisted === "board") return persisted;
	return "list";
}
function useTaskFilters({ tasks, userId, userName, participants = [], selectedClient, selectedClientId, projectFilterId, projectFilterName, activeTab: controlledActiveTab, setActiveTab: controlledSetActiveTab, serverListFilters, selectedStatus: controlledSelectedStatus, setSelectedStatus: controlledSetSelectedStatus, searchQuery: controlledSearchQuery, setSearchQuery: controlledSetSearchQuery, selectedAssignee: controlledSelectedAssignee, setSelectedAssignee: controlledSetSelectedAssignee }) {
	const [selectedStatusInternal, setSelectedStatusInternal] = (0, import_react.useState)("all");
	const [searchQueryInternal, setSearchQueryInternal] = (0, import_react.useState)("");
	const [selectedAssigneeInternal, setSelectedAssigneeInternal] = (0, import_react.useState)("all");
	const selectedStatus = controlledSelectedStatus ?? selectedStatusInternal;
	const setSelectedStatus = controlledSetSelectedStatus ?? setSelectedStatusInternal;
	const searchQuery = controlledSearchQuery ?? searchQueryInternal;
	const setSearchQuery = controlledSetSearchQuery ?? setSearchQueryInternal;
	const selectedAssignee = controlledSelectedAssignee ?? selectedAssigneeInternal;
	const setSelectedAssignee = controlledSetSelectedAssignee ?? setSelectedAssigneeInternal;
	const [activeTabInternal, setActiveTabInternal] = (0, import_react.useState)("all-tasks");
	const [sortField, setSortField] = (0, import_react.useState)("updatedAt");
	const [sortDirection, setSortDirection] = (0, import_react.useState)("desc");
	const [viewMode, setViewMode] = (0, import_react.useState)(() => getInitialTaskViewMode());
	const activeTab = controlledActiveTab ?? activeTabInternal;
	const setActiveTab = controlledSetActiveTab ?? setActiveTabInternal;
	const toggleSortDirection = () => {
		setSortDirection((prev) => prev === "asc" ? "desc" : "asc");
	};
	const handleStatusChange = (value) => {
		setSelectedStatus(value);
	};
	const handleAssigneeChange = (value) => {
		setSelectedAssignee(value);
	};
	const hasActiveFilters = (() => {
		const hasSearch = searchQuery.trim().length > 0;
		return selectedStatus !== "all" || hasSearch || activeTab === "all-tasks" && selectedAssignee !== "all";
	})();
	const resetListFilters = () => {
		setSelectedStatus("all");
		setSearchQuery("");
		setSelectedAssignee("all");
	};
	const tasksForClient = (() => {
		if (!selectedClientId && !selectedClient) return tasks;
		const normalizedClientName = selectedClient?.name?.toLowerCase() ?? null;
		return tasks.filter((task) => {
			if (selectedClientId) {
				if (task.clientId) return task.clientId === selectedClientId;
				if (normalizedClientName && task.client) return task.client.toLowerCase() === normalizedClientName;
				return false;
			}
			if (normalizedClientName) return task.client?.toLowerCase() === normalizedClientName;
			return true;
		});
	})();
	const projectScopedTasks = (() => {
		if (serverListFilters?.projectId) return tasksForClient;
		if (!projectFilterId && !projectFilterName) return tasksForClient;
		const targetId = projectFilterId;
		const targetName = projectFilterName?.toLowerCase() ?? null;
		return tasksForClient.filter((task) => {
			if (targetId && task.projectId === targetId) return true;
			if (targetName && task.projectName && task.projectName.toLowerCase() === targetName) return true;
			return false;
		});
	})();
	const filteredTasks = (() => {
		if (serverListFilters) return projectScopedTasks;
		return projectScopedTasks.filter((task) => {
			const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
			const title = task.title.toLowerCase();
			const description = (task.description ?? "").toLowerCase();
			const query = searchQuery.toLowerCase();
			const matchesSearch = title.includes(query) || description.includes(query);
			let matchesAssignee = true;
			if (activeTab === "my-tasks") if (userName || userId) matchesAssignee = (task.assignedTo ?? []).some((assignee) => (userId ? assignee === userId : false) || (userName ? assignee.toLowerCase() === userName.toLowerCase() : false));
			else matchesAssignee = false;
			else matchesAssignee = selectedAssignee === "all" || (task.assignedTo ?? []).some((assignee) => {
				return resolveAssigneeLabel(assignee, participants).toLowerCase().includes(selectedAssignee.toLowerCase()) || assignee.toLowerCase().includes(selectedAssignee.toLowerCase());
			});
			return matchesStatus && matchesSearch && matchesAssignee;
		});
	})();
	const sortedTasks = (() => {
		const sorted = [...filteredTasks];
		sorted.sort((a, b) => {
			let comparison = 0;
			switch (sortField) {
				case "title":
					comparison = a.title.localeCompare(b.title);
					break;
				case "status":
					comparison = TASK_STATUSES.indexOf(a.status) - TASK_STATUSES.indexOf(b.status);
					break;
				case "priority":
					comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
					break;
				case "dueDate":
					comparison = (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) - (b.dueDate ? new Date(b.dueDate).getTime() : Infinity);
					break;
				case "createdAt":
					comparison = new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
					break;
				default:
					comparison = new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime();
					break;
			}
			return sortDirection === "desc" ? -comparison : comparison;
		});
		return sorted;
	})();
	const taskCounts = (() => {
		const counts = {
			todo: 0,
			"in-progress": 0,
			review: 0,
			completed: 0,
			archived: 0
		};
		projectScopedTasks.forEach((task) => {
			counts[task.status] = (counts[task.status] ?? 0) + 1;
		});
		return counts;
	})();
	const completionRate = (() => {
		const total = projectScopedTasks.length;
		if (total === 0) return 0;
		return Math.round(taskCounts.completed / total * 100);
	})();
	const assigneeOptions = (() => {
		const options = /* @__PURE__ */ new Set();
		projectScopedTasks.forEach((task) => {
			(task.assignedTo ?? []).forEach((member) => {
				const label = resolveAssigneeLabel(member, participants);
				if (label && label.trim().length > 0) options.add(label);
			});
		});
		return Array.from(options).toSorted((a, b) => a.localeCompare(b));
	})();
	(() => {
		if (selectedAssignee !== "all" && !assigneeOptions.includes(selectedAssignee)) return "all";
		return selectedAssignee;
	})();
	const setViewModePersisted = (mode) => {
		setViewMode((current) => {
			const resolved = typeof mode === "function" ? mode(current) : mode;
			if (typeof window !== "undefined") window.localStorage.setItem(TASK_VIEW_MODE_STORAGE_KEY, resolved);
			return resolved;
		});
	};
	return {
		selectedStatus,
		setSelectedStatus,
		searchQuery,
		setSearchQuery,
		selectedAssignee,
		setSelectedAssignee,
		activeTab,
		setActiveTab,
		sortField,
		setSortField,
		sortDirection,
		toggleSortDirection,
		viewMode,
		setViewMode: setViewModePersisted,
		tasksForClient,
		projectScopedTasks,
		filteredTasks,
		sortedTasks,
		taskCounts,
		completionRate,
		assigneeOptions,
		hasActiveFilters,
		resetListFilters,
		handleStatusChange,
		handleAssigneeChange
	};
}
function TasksPageSkeleton() {
	const taskCardSlots = [
		"task-1",
		"task-2",
		"task-3"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: TASKS_THEME.page,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-12 rounded-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-28" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-64 max-w-full" })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-24" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-28" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: cn(TASKS_THEME.summaryCard, "h-24") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: TASKS_THEME.workspace,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn(TASKS_THEME.rail, "gap-4"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-52" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-40" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: TASKS_THEME.filterBar,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-full max-w-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-24" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4",
						children: [
							"To Do",
							"In Progress",
							"Review",
							"Done"
						].map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-24" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-6 rounded-full" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-2",
								children: taskCardSlots.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 rounded-xl border border-border/50 bg-card p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-3/4" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between pt-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-6 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-14 rounded-full" })]
										})
									]
								}, slot))
							})]
						}, column))
					})
				]
			})
		]
	});
}
async function exportToCsv(data, filename, columns, options) {
	if (!data.length) return;
	await exportCohortsSpreadsheet({
		data,
		filename: ensureXlsxFilename(filename),
		columns,
		title: options?.title,
		subtitle: options?.subtitle,
		metadata: options?.metadata,
		charts: options?.charts
	});
}
function taskNeedsAssigneeReview(task) {
	if (task.assignmentStatus === "ambiguous") return true;
	if (task.documentAssigneeNames.length > 0) {
		if (task.assignmentStatus === "unassigned") return true;
		if (task.assignmentStatus === "resolved" && task.assignedToUserIds.length === 0) return true;
	}
	return task.assignmentStatus === "resolved" && task.assignedToUserIds.length === 0 && task.suggestions.length > 0;
}
function taskNeedsDueDateReview(task) {
	return task.dueDateStatus === "missing" || task.dueDateStatus === "unclear";
}
function taskNeedsImportReview(task) {
	return taskNeedsAssigneeReview(task) || taskNeedsDueDateReview(task);
}
function needsImportReview(tasks) {
	return tasks.some(taskNeedsImportReview);
}
function buildAssigneeReviewPrompt(task) {
	const documentNames = task.documentAssigneeNames.join(", ");
	if (task.assignmentStatus === "ambiguous") {
		if (task.suggestions.length > 0) return documentNames ? `The document assigns this to “${documentNames}”, but that name matches multiple teammates. Did you mean ${task.suggestions.join(", ")}?` : `The assignee is unclear — did you mean ${task.suggestions.join(", ")}?`;
		return documentNames ? `The document assigns this to “${documentNames}”, but we couldn't match that name confidently. Pick the right teammate below.` : "The assignee is unclear. Pick the right teammate below.";
	}
	if (task.documentAssigneeNames.length > 0) {
		if (task.suggestions.length > 0) return `The document assigns this to “${documentNames}”. We found ${task.suggestions.join(", ")} but couldn't link them to a workspace profile automatically — pick the matching admin or teammate below, or leave unassigned.`;
		return `The document assigns this to “${documentNames}”, but that name is not linked to a workspace profile yet. Pick a teammate below or leave unassigned.`;
	}
	if (task.suggestions.length > 0) return `Pick a workspace teammate — suggestions: ${task.suggestions.join(", ")}.`;
	return "Pick a workspace teammate from the list below.";
}
function getImportReviewBlocker(tasks) {
	const selected = tasks.filter((task) => task.include && task.title.trim());
	if (selected.length === 0) return "Select at least one task to create.";
	const assigneeReviewTasks = selected.filter((task) => taskNeedsAssigneeReview(task));
	if (assigneeReviewTasks.length > 0) {
		const ambiguousCount = assigneeReviewTasks.filter((task) => task.assignmentStatus === "ambiguous").length;
		const unmatchedCount = assigneeReviewTasks.length - ambiguousCount;
		if (ambiguousCount > 0 && unmatchedCount > 0) return `Confirm assignees for ${assigneeReviewTasks.length} tasks — some names were unclear or couldn't be matched.`;
		if (ambiguousCount > 0) return `Confirm assignees for ${ambiguousCount} task${ambiguousCount === 1 ? "" : "s"} — the document name matched multiple teammates.`;
		return `Pick workspace teammates for ${assigneeReviewTasks.length} task${assigneeReviewTasks.length === 1 ? "" : "s"}.`;
	}
	const invalidAssignee = selected.filter((task) => {
		const mentionCount = task.assignedTo.trim().length > 0 ? task.assignedTo.match(/@\[[^\]]+\]/g)?.length ?? 0 : 0;
		if (mentionCount === 0) return false;
		return task.assignedToUserIds.length !== mentionCount;
	});
	if (invalidAssignee.length > 0) return `Use the teammate picker for ${invalidAssignee.length} task${invalidAssignee.length === 1 ? "" : "s"} — free-text assignees are not allowed.`;
	const missingDueDate = selected.filter((task) => taskNeedsDueDateReview(task) && !task.dueDate.trim());
	if (missingDueDate.length > 0) return `Add due dates for ${missingDueDate.length} task${missingDueDate.length === 1 ? "" : "s"}.`;
	return null;
}
function buildImportReviewDescription(documentSummary, tasks) {
	if (documentSummary) return documentSummary;
	const needsAssignees = tasks.some(taskNeedsAssigneeReview);
	const needsDueDates = tasks.some(taskNeedsDueDateReview);
	if (needsAssignees && needsDueDates) return "Some assignees and due dates need clarification. Confirm teammates and deadlines below before creating tasks.";
	if (needsDueDates) return "Some due dates were missing or unclear in the document. Add deadlines before creating tasks.";
	return "Some assignees were unclear or could not be matched to workspace members. Confirm who each task belongs to below.";
}
function resolveImportAssigneeUserIds(value, participants) {
	return resolveAssigneeUserIds(value, participants);
}
function formatDueDateInput(dueDateMs) {
	if (dueDateMs == null) return "";
	const date = new Date(dueDateMs);
	if (Number.isNaN(date.getTime())) return "";
	return date.toISOString().slice(0, 10);
}
function mapServerProposal(task, index, participants) {
	return {
		localId: `import-${index}-${crypto.randomUUID()}`,
		title: task.title,
		description: task.description ?? "",
		priority: task.priority,
		assignedToUserIds: task.assignedToUserIds,
		assignedTo: formatAssigneeDraftFromUserIds(task.assignedToUserIds, participants),
		documentAssigneeNames: task.documentAssigneeNames,
		dueDate: formatDueDateInput(task.dueDateMs),
		assignmentStatus: task.assignmentStatus,
		dueDateStatus: task.dueDateStatus,
		dueDateHint: task.dueDateHint,
		suggestions: task.suggestions,
		sourceExcerpt: task.sourceExcerpt,
		include: true
	};
}
function useTasksDocumentImport({ workspaceId, userId, participants, clientId, clientName, projectId, projectName, disabledReason, isPreviewMode, onCreateTask }) {
	const convex = useConvex();
	const extractPdfTextAction = useAction(agentApi.extractPdfText);
	const extractTasksFromDocument = useAction(tasksDocumentImportApi.extractTasksFromDocument);
	const generateUploadUrl = useMutation(filesApi.generateUploadUrl);
	const syncMetadata = useMutation(filesApi.syncMetadata);
	const getPublicUrl = (args) => {
		if (!workspaceId) throw new Error("Workspace context missing");
		return convex.query(filesApi.getPublicUrl, {
			workspaceId,
			storageId: args.storageId
		});
	};
	const [phase, setPhase] = (0, import_react.useState)("idle");
	const [statusMessage, setStatusMessage] = (0, import_react.useState)(null);
	const [errorMessage, setErrorMessage] = (0, import_react.useState)(null);
	const [proposedTasks, setProposedTasks] = (0, import_react.useState)([]);
	const [documentSummary, setDocumentSummary] = (0, import_react.useState)(null);
	const [sourceFiles, setSourceFiles] = (0, import_react.useState)([]);
	const [attachSourceDocuments, setAttachSourceDocuments] = (0, import_react.useState)(true);
	const dragDepthRef = (0, import_react.useRef)(0);
	const abortRef = (0, import_react.useRef)(false);
	const resetImport = (0, import_react.useCallback)(() => {
		abortRef.current = false;
		dragDepthRef.current = 0;
		setPhase("idle");
		setStatusMessage(null);
		setErrorMessage(null);
		setProposedTasks([]);
		setDocumentSummary(null);
		setSourceFiles([]);
		setAttachSourceDocuments(true);
	}, []);
	const extractPdfOnServer = async (file) => {
		if (!workspaceId || isPreviewModeEnabled()) return null;
		const sizeError = getPdfUploadSizeError(file);
		if (sizeError) return {
			extractionStatus: "failed",
			errorMessage: sizeError
		};
		try {
			const dataBase64 = await readFileAsBase64(file);
			return await extractPdfTextAction({
				workspaceId,
				fileName: file.name,
				dataBase64
			});
		} catch (error) {
			logError(error, "use-tasks-document-import:extractPdfOnServer");
			return null;
		}
	};
	const uploadForVision = async (file) => {
		return await uploadTaskImportDocument({
			file,
			generateUploadUrl: () => generateUploadUrl({}),
			syncMetadata: (args) => syncMetadata(args)
		});
	};
	const uploadSourceAttachment = async (file) => {
		if (!userId) return null;
		try {
			return await uploadTaskAttachment({
				userId,
				file,
				generateUploadUrl: () => generateUploadUrl({}),
				syncMetadata: (args) => syncMetadata(args),
				getPublicUrl
			});
		} catch (error) {
			logError(error, "use-tasks-document-import:uploadSourceAttachment");
			return null;
		}
	};
	const createTasksFromProposals = async (tasks) => {
		if (!clientId) throw new Error("Select a client before importing tasks from a document.");
		const selected = tasks.filter((task) => task.include && task.title.trim());
		const reviewBlocker = getImportReviewBlocker(tasks);
		if (reviewBlocker) throw new Error(reviewBlocker);
		if (selected.length === 0) throw new Error("Select at least one task to create.");
		setPhase("creating");
		setStatusMessage(`Creating ${selected.length} task${selected.length === 1 ? "" : "s"}…`);
		if (abortRef.current) {
			resetImport();
			return;
		}
		let attachment;
		if (attachSourceDocuments && sourceFiles[0] && userId) {
			const uploaded = await uploadSourceAttachment(sourceFiles[0]);
			if (uploaded) attachment = uploaded;
		}
		if (abortRef.current) {
			resetImport();
			return;
		}
		const createdCount = (await Promise.all(selected.map(async (task) => {
			if (abortRef.current) return false;
			const created = await onCreateTask({
				title: task.title.trim(),
				description: task.description.trim() || void 0,
				status: "todo",
				priority: task.priority,
				assignedTo: task.assignedToUserIds,
				clientId,
				client: clientName,
				projectId: projectId ?? void 0,
				projectName: projectName ?? void 0,
				dueDate: task.dueDate || void 0,
				attachments: attachment ? [attachment] : void 0
			});
			return Boolean(created);
		}))).filter(Boolean).length;
		notifySuccess({
			title: "Tasks imported",
			message: createdCount === selected.length ? `Created ${createdCount} task${createdCount === 1 ? "" : "s"} from your document.` : `Created ${createdCount} of ${selected.length} tasks.`
		});
		resetImport();
	};
	const runDocumentImport = async (files) => {
		if (disabledReason) {
			notifyFailure({
				title: "Cannot import",
				message: disabledReason
			});
			return;
		}
		if (isPreviewMode || isPreviewModeEnabled()) {
			notifyFailure({
				title: "Preview mode",
				message: "Document import is unavailable in preview mode."
			});
			return;
		}
		if (!workspaceId) {
			notifyFailure({
				title: "Cannot import",
				message: "Sign in to import tasks from documents."
			});
			return;
		}
		const documentFiles = filterTasksDocumentFiles(files);
		if (documentFiles.length === 0) {
			notifyFailure({
				title: "Unsupported file",
				message: "Drop a PDF, Word file, or image (including photos of handwritten notes)."
			});
			return;
		}
		abortRef.current = false;
		setSourceFiles(documentFiles);
		setErrorMessage(null);
		setPhase("extracting");
		setStatusMessage("Reading document…");
		try {
			if (abortRef.current) return;
			const preparedDocuments = await Promise.all(documentFiles.map((file) => prepareTaskImportDocument(file, {
				extractPdfOnServer,
				uploadForVision
			})));
			const textDocuments = preparedDocuments.flatMap((document) => document.kind === "text" ? [{
				fileName: document.fileName,
				text: document.text
			}] : []);
			const visualDocuments = preparedDocuments.flatMap((document) => document.kind === "vision" ? [{
				fileName: document.fileName,
				mimeType: document.mimeType,
				storageId: document.storageId
			}] : []);
			const combinedText = textDocuments.length > 0 ? combineExtractedDocumentText(textDocuments) : void 0;
			const primaryFileName = buildTaskImportFileName(documentFiles);
			const usesVision = visualDocuments.length > 0;
			setPhase("analyzing");
			setStatusMessage(usesVision ? "Reading handwriting and finding action items…" : "Finding action items and assignees…");
			if (abortRef.current) return;
			const result = await extractTasksFromDocument({
				workspaceId,
				fileName: primaryFileName,
				extractedText: combinedText,
				visualDocuments: visualDocuments.length > 0 ? visualDocuments : void 0,
				clientId: clientId ?? null,
				projectId: projectId ?? null
			});
			const mapped = result.proposedTasks.map((task, index) => mapServerProposal(task, index, participants));
			setDocumentSummary(result.documentSummary ?? null);
			if (needsImportReview(mapped)) {
				setProposedTasks(mapped);
				setPhase("review");
				setStatusMessage(null);
				const assigneeIssues = mapped.filter((task) => taskNeedsAssigneeReview(task)).length;
				const dueDateIssues = mapped.filter((task) => taskNeedsDueDateReview(task)).length;
				if (assigneeIssues > 0 && dueDateIssues > 0) notifyWarning({
					title: "Review imported tasks",
					message: `${assigneeIssues} task${assigneeIssues === 1 ? "" : "s"} need assignee confirmation and ${dueDateIssues} need due dates before creating.`
				});
				else if (assigneeIssues > 0) notifyWarning({
					title: "Assignees need confirmation",
					message: `${assigneeIssues} task${assigneeIssues === 1 ? "" : "s"} have unclear or unmatched assignees. Pick teammates in the review sheet.`
				});
				else if (dueDateIssues > 0) notifyWarning({
					title: "Due dates need confirmation",
					message: `${dueDateIssues} task${dueDateIssues === 1 ? "" : "s"} have missing or unclear deadlines. Add dates in the review sheet.`
				});
				return;
			}
			await createTasksFromProposals(mapped);
		} catch (error) {
			if (abortRef.current) return;
			const message = asErrorMessage(error);
			setErrorMessage(message);
			setPhase("error");
			setStatusMessage(null);
			reportConvexFailure({
				error,
				context: "useTasksDocumentImport:runDocumentImport",
				title: "Import failed",
				fallbackMessage: message
			});
		}
	};
	const handleDragEnter = (event) => {
		if (!isFileDragEvent(event) || disabledReason) return;
		event.preventDefault();
		dragDepthRef.current += 1;
		if (phase === "idle" || phase === "dragging") setPhase("dragging");
	};
	const handleDragOver = (event) => {
		if (!isFileDragEvent(event) || disabledReason) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = "copy";
	};
	const handleDragLeave = (event) => {
		if (!isFileDragEvent(event)) return;
		dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
		if (dragDepthRef.current === 0 && (phase === "dragging" || phase === "idle")) setPhase("idle");
	};
	const handleDrop = (event) => {
		if (!isFileDragEvent(event)) return;
		event.preventDefault();
		dragDepthRef.current = 0;
		const files = event.dataTransfer.files;
		if (files.length === 0) return;
		runDocumentImport(Array.from(files));
	};
	const handleCancel = (0, import_react.useCallback)(() => {
		abortRef.current = true;
		resetImport();
	}, [resetImport]);
	const handleConfirmReview = () => {
		createTasksFromProposals(proposedTasks);
	};
	const updateProposedTask = (localId, patch) => {
		setProposedTasks((current) => current.map((task) => task.localId === localId ? {
			...task,
			...patch
		} : task));
	};
	(0, import_react.useEffect)(() => {
		if (phase !== "extracting" && phase !== "analyzing") return;
		const onKeyDown = (event) => {
			if (event.key === "Escape") handleCancel();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [phase, handleCancel]);
	return {
		phase,
		statusMessage,
		errorMessage,
		proposedTasks,
		documentSummary,
		attachSourceDocuments,
		setAttachSourceDocuments,
		overlayVisible: phase === "dragging" || phase === "extracting" || phase === "analyzing" || phase === "creating" || phase === "error",
		reviewOpen: phase === "review",
		importDragHandlers: {
			onDragEnter: handleDragEnter,
			onDragOver: handleDragOver,
			onDragLeave: handleDragLeave,
			onDrop: handleDrop
		},
		handleCancel,
		handleConfirmReview,
		handleDismissReview: resetImport,
		updateProposedTask
	};
}
function phaseLabel(phase, statusMessage, errorMessage) {
	if (phase === "error") return errorMessage ?? "Import failed";
	if (statusMessage) return statusMessage;
	if (phase === "dragging") return "Drop PDF, Word, or image files to create tasks from notes";
	return null;
}
function TasksDocumentImportOverlay({ phase, statusMessage, errorMessage, visible, onCancel }) {
	if (!visible) return null;
	const label = phaseLabel(phase, statusMessage, errorMessage);
	const showOrb = phase === "extracting" || phase === "analyzing" || phase === "creating";
	const canCancel = phase === "extracting" || phase === "analyzing" || phase === "error";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("fixed inset-0 z-50 flex items-center justify-center p-6", phase === "dragging" ? "pointer-events-none bg-primary/5 backdrop-blur-[2px]" : "pointer-events-auto bg-background/80 backdrop-blur-sm"),
		role: "presentation",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("flex max-w-lg flex-col items-center gap-6 rounded-3xl border border-dashed px-8 py-10 text-center shadow-lg", phase === "dragging" ? "border-primary/50 bg-primary/5" : "border-border/70 bg-card/90", phase === "error" && "border-destructive/40"),
			children: [
				showOrb ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiriOrb, {
					size: "128px",
					animationDuration: 18
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-24 items-center justify-center rounded-full bg-primary/10 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, {
						className: "size-10",
						"aria-hidden": true
					})
				}),
				label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("max-w-md text-sm", phase === "error" ? "text-destructive" : "text-muted-foreground"),
					children: label
				}) : null,
				canCancel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					className: "gap-1.5",
					onClick: onCancel,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }), "Cancel"]
				}) : null
			]
		})
	});
}
function ImportReviewTaskRow({ task, index, mentionableUsers, onUpdateTask }) {
	const handleIncludeChange = (checked) => {
		onUpdateTask(task.localId, { include: checked === true });
	};
	const handleTitleChange = (event) => {
		onUpdateTask(task.localId, { title: event.target.value });
	};
	const handleDescriptionChange = (event) => {
		onUpdateTask(task.localId, { description: event.target.value });
	};
	const handlePriorityChange = (event) => {
		onUpdateTask(task.localId, { priority: event.target.value });
	};
	const handleDueDateChange = (event) => {
		const value = event.target.value;
		onUpdateTask(task.localId, {
			dueDate: value,
			...value ? {
				dueDateStatus: "resolved",
				dueDateHint: null
			} : {}
		});
	};
	const handleAssigneesChange = (value) => {
		const assignedToUserIds = resolveImportAssigneeUserIds(value, mentionableUsers);
		onUpdateTask(task.localId, {
			assignedTo: value,
			assignedToUserIds,
			assignmentStatus: assignedToUserIds.length > 0 ? "resolved" : task.suggestions.length > 0 ? "unassigned" : task.assignmentStatus
		});
	};
	const handleConfirmAssignees = () => {
		onUpdateTask(task.localId, { assignmentStatus: "resolved" });
	};
	const needsAssigneeReview = taskNeedsAssigneeReview(task);
	const needsDueDateReview = taskNeedsDueDateReview(task);
	const needsReview = needsAssigneeReview || needsDueDateReview;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-3 rounded-2xl border p-4", needsReview ? "border-warning/50 bg-warning/5" : "border-border/60 bg-muted/20"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 text-sm font-medium",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: task.include,
							onCheckedChange: handleIncludeChange
						}),
						"Task ",
						index + 1
					]
				}), needsReview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-end gap-1",
					children: [needsAssigneeReview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 text-xs font-medium text-warning",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3.5" }), task.assignmentStatus === "ambiguous" ? "Assignee unclear" : "Pick a teammate"]
					}) : null, needsDueDateReview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 text-xs font-medium text-warning",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3.5" }), task.dueDateStatus === "missing" ? "Due date missing" : "Due date unclear"]
					}) : null]
				}) : null]
			}),
			needsAssigneeReview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-foreground",
				children: buildAssigneeReviewPrompt(task)
			}) : null,
			needsDueDateReview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: task.dueDateHint ? `The document says "${task.dueDateHint}" — pick the correct due date.` : "No clear deadline was found in the document. Add one before creating this task."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: `import-title-${task.localId}`,
					children: "Title"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: `import-title-${task.localId}`,
					value: task.title,
					onChange: handleTitleChange
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: `import-description-${task.localId}`,
					children: "Notes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: `import-description-${task.localId}`,
					value: task.description,
					rows: 3,
					onChange: handleDescriptionChange
				})]
			}),
			task.sourceExcerpt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs italic text-muted-foreground",
				children: [
					"“",
					task.sourceExcerpt,
					"”"
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: `import-priority-${task.localId}`,
						children: "Priority"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: `import-priority-${task.localId}`,
						className: "flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
						value: task.priority,
						onChange: handlePriorityChange,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "low",
								children: "Low"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "medium",
								children: "Medium"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "high",
								children: "High"
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: `import-due-${task.localId}`,
						children: "Due date"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: `import-due-${task.localId}`,
						type: "date",
						value: task.dueDate,
						onChange: handleDueDateChange,
						className: needsDueDateReview ? "border-warning/60 bg-warning/5" : void 0,
						"aria-invalid": needsDueDateReview
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MentionInput, {
				label: "Assignees",
				value: task.assignedTo,
				onChange: handleAssigneesChange,
				users: mentionableUsers,
				placeholder: "Pick teammates from the list",
				className: needsAssigneeReview ? "border-warning/60 bg-warning/5" : void 0
			}),
			needsAssigneeReview && task.assignedToUserIds.length > 0 && task.assignmentStatus === "ambiguous" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "sm",
				variant: "outline",
				onClick: handleConfirmAssignees,
				children: "Confirm these assignees"
			}) : null
		]
	});
}
function TasksDocumentImportReviewSheet({ open, documentSummary, proposedTasks, participants, attachSourceDocuments, onAttachSourceDocumentsChange, onUpdateTask, onConfirm, onDiscard }) {
	const mentionableUsers = teamMembersToMentionable(assignableImportParticipants(participants));
	const selectedCount = proposedTasks.filter((task) => task.include).length;
	const reviewBlocker = getImportReviewBlocker(proposedTasks);
	const reviewDescription = buildImportReviewDescription(documentSummary, proposedTasks);
	const handleOpenChange = (next) => {
		if (!next) onDiscard();
	};
	const handleAttachChange = (checked) => {
		onAttachSourceDocumentsChange(checked === true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange: handleOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "right",
			className: cn(TASKS_THEME.sheet.content, "overflow-y-auto"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
					className: "border-b border-border/60 pb-4 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Review imported tasks" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: reviewDescription })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-1 flex-col gap-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							id: "attach-source-documents",
							checked: attachSourceDocuments,
							onCheckedChange: handleAttachChange
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "attach-source-documents",
							className: "font-normal",
							children: "Attach source document to created tasks"
						})]
					}), proposedTasks.map((task, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportReviewTaskRow, {
						task,
						index,
						mentionableUsers,
						onUpdateTask
					}, task.localId))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: TASKS_THEME.sheet.footer,
					children: [
						reviewBlocker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-warning",
							children: reviewBlocker
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							onClick: onConfirm,
							disabled: selectedCount === 0 || Boolean(reviewBlocker),
							children: [
								"Create ",
								selectedCount,
								" task",
								selectedCount === 1 ? "" : "s"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: onDiscard,
							children: "Discard"
						})
					]
				})
			]
		})
	});
}
var TaskList = dynamic(() => import("./task-list-Dd_sE70S.mjs").then((mod) => mod.TaskList), { loading: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: "p-6 text-sm text-muted-foreground",
	children: "Loading tasks…"
}) });
var TaskKanban = dynamic(() => import("./task-kanban-Btemb7yK.mjs").then((mod) => mod.TaskKanban), {
	loading: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6 text-sm text-muted-foreground",
		children: "Loading board…"
	}),
	ssr: false
});
var CreateTaskSheet = dynamic(() => import("./task-form-sheets-BhUb4Ufd.mjs").then((mod) => mod.CreateTaskSheet), { ssr: false });
var EditTaskSheet = dynamic(() => import("./task-form-sheets-BhUb4Ufd.mjs").then((mod) => mod.EditTaskSheet), { ssr: false });
var DeleteTaskDialog = dynamic(() => import("./delete-task-dialog-DE0Cq940.mjs").then((mod) => mod.DeleteTaskDialog), { ssr: false });
function useTasksPageContent({ initialAction, initialClientId, initialClientName, initialProjectId, initialProjectName, initialSearchParamsString }) {
	const { replace } = useRouter$1();
	const pathname = usePathname();
	const { user, loading: authLoading } = useAuth();
	const { selectedClient, selectedClientId, clients } = useClientContext();
	const { setProjectContext } = useNavigationContext();
	const { isPreviewMode } = usePreview();
	const taskTabs = usePersistedTab({
		param: "tab",
		defaultValue: "all-tasks",
		allowedValues: ["all-tasks", "my-tasks"],
		storageNamespace: "dashboard:tasks",
		syncToUrl: true
	});
	const normalizedAction = initialAction ?? null;
	const normalizedClientId = initialClientId ?? null;
	const normalizedClientName = initialClientName ?? null;
	const normalizedProjectId = initialProjectId ?? null;
	const normalizedProjectName = initialProjectName ?? null;
	const normalizedSearchParamsString = initialSearchParamsString ?? "";
	const projectFilter = {
		id: normalizedProjectId,
		name: normalizedProjectName
	};
	const routeClientContext = (() => {
		if (!normalizedClientId && !normalizedClientName) return null;
		return {
			id: normalizedClientId,
			name: normalizedClientName
		};
	})();
	const effectiveTaskClient = (() => {
		if (selectedClient) return selectedClient;
		const routeId = routeClientContext?.id;
		if (!routeId) return null;
		return clients.find((client) => client.id === routeId) ?? null;
	})();
	const taskFormClient = effectiveTaskClient ?? routeClientContext;
	const taskFormClientId = effectiveTaskClient?.id ?? selectedClientId ?? routeClientContext?.id ?? void 0;
	const taskWorkspaceId = effectiveTaskClient?.workspaceId ?? user?.agencyId ?? null;
	const newTaskDisabledReason = (() => {
		if (authLoading) return null;
		if (!user?.id) return "Sign in to create tasks.";
		if (!taskFormClientId) return "Select a client from the workspace switcher, or open Tasks from a client record, before creating a task.";
		return null;
	})();
	const actionParam = normalizedAction;
	const searchParamsString = normalizedSearchParamsString;
	const projectContextKey = isFeatureEnabled("BIDIRECTIONAL_NAV") && projectFilter.id && projectFilter.name ? `${projectFilter.id}|${projectFilter.name}` : null;
	(0, import_react.useEffect)(() => {
		if (!projectContextKey || !projectFilter.id || !projectFilter.name) return;
		setProjectContext(projectFilter.id, projectFilter.name);
	}, [
		projectContextKey,
		projectFilter.id,
		projectFilter.name,
		setProjectContext
	]);
	const clearProjectFilter = () => {
		const params = new URLSearchParams(searchParamsString);
		params.delete("projectId");
		params.delete("projectName");
		const next = params.toString();
		replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
	};
	const [selectedStatus, setSelectedStatus] = (0, import_react.useState)("all");
	const [selectedAssignee, setSelectedAssignee] = (0, import_react.useState)("all");
	const [rawSearchQuery, setRawSearchQuery] = (0, import_react.useState)("");
	const debouncedQuery = useDebouncedValue(rawSearchQuery, 300);
	const listFilters = buildTaskListFilters({
		selectedStatus,
		searchQuery: debouncedQuery,
		activeTab: taskTabs.value,
		userId: user?.id,
		selectedAssignee,
		projectId: projectFilter.id
	});
	const { tasks, loading, loadingMore, error, retryCount, pendingStatusUpdates, nextCursor, handleLoadMore, handleRefresh, handleQuickStatusChange, handleDeleteTask, handleCreateTask, handleUpdateTask, handleBulkUpdate, handleBulkDelete } = useTasks({
		userId: user?.id,
		clientId: taskFormClientId ?? void 0,
		authLoading,
		isPreviewMode,
		workspaceId: taskWorkspaceId,
		listFilters
	});
	const workspaceMembers = useQuery(usersApi.listWorkspaceMembers, taskWorkspaceId && !isPreviewMode ? {
		workspaceId: taskWorkspaceId,
		limit: 500
	} : "skip");
	const clientRosterNames = clientRosterAssigneeNames(effectiveTaskClient ?? selectedClient);
	const rosterProfiles = useQuery(usersApi.resolveProfilesForNames, taskWorkspaceId && clientRosterNames.length > 0 && !isPreviewMode ? {
		workspaceId: taskWorkspaceId,
		names: clientRosterNames
	} : "skip");
	const displayError = mergeQueryErrors(error, mergeQueryErrors(useConvexQueryError({
		data: workspaceMembers,
		skipped: !taskWorkspaceId || isPreviewMode,
		fallbackMessage: "Unable to load workspace members."
	}), useConvexQueryError({
		data: rosterProfiles,
		skipped: !taskWorkspaceId || clientRosterNames.length === 0 || isPreviewMode,
		fallbackMessage: "Unable to load client assignees."
	})));
	const taskParticipants = (() => {
		const clientTeamMembers = (effectiveTaskClient?.teamMembers ?? selectedClient?.teamMembers ?? []).map((member) => ({
			name: member.name,
			role: member.role
		}));
		if (clientTeamMembers.length > 0 || (rosterProfiles?.length ?? 0) > 0) return mergeTaskParticipants([
			clientTeamMembers,
			workspaceMembers ?? [],
			rosterProfiles ?? []
		]);
		return mergeTaskParticipants([workspaceMembers ?? []]);
	})();
	const filters = useTaskFilters({
		tasks,
		userId: user?.id,
		userName: user?.name,
		participants: taskParticipants,
		selectedClient,
		selectedClientId: selectedClientId ?? void 0,
		projectFilterId: projectFilter.id,
		projectFilterName: projectFilter.name,
		activeTab: taskTabs.value,
		setActiveTab: (next) => taskTabs.setValue(next),
		serverListFilters: listFilters,
		selectedStatus,
		setSelectedStatus,
		searchQuery: debouncedQuery,
		setSearchQuery: setRawSearchQuery,
		selectedAssignee,
		setSelectedAssignee
	});
	const [rawSelectedTaskIds, setRawSelectedTaskIds] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [bulkState, setBulkState] = (0, import_react.useState)({
		active: false,
		label: "",
		progress: 0
	});
	const form = useTaskForm({
		selectedClient: taskFormClient,
		selectedClientId: taskFormClientId,
		projectContext: projectFilter,
		userId: user?.id,
		participants: taskParticipants,
		initialCreateOpen: actionParam === "create",
		onCreateOpenChange: (open) => {
			if (open || actionParam !== "create") return;
			const params = new URLSearchParams(searchParamsString);
			params.delete("action");
			const next = params.toString();
			replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
		},
		onCreateTask: handleCreateTask,
		onUpdateTask: handleUpdateTask
	});
	useKeyboardShortcut({
		combo: "mod+f",
		callback: () => {
			document.getElementById("task-search")?.focus();
		}
	});
	useKeyboardShortcut({
		combo: "mod+n",
		callback: () => {
			if (newTaskDisabledReason) return;
			form.handleCreateOpenChange(true);
		},
		enabled: !form.isCreateOpen && !newTaskDisabledReason
	});
	const handleExport = () => {
		if (filters.filteredTasks.length === 0) return;
		const exportRows = filters.filteredTasks.map((task) => ({
			Title: task.title,
			Status: task.status,
			Priority: task.priority,
			Client: task.client || "Internal",
			"Assigned To": formatAssigneeList(task.assignedTo ?? [], taskParticipants),
			"Due Date": task.dueDate ? formatDate(task.dueDate) : "No due date",
			Description: task.description || ""
		}));
		const charts = [buildCategoryCountChart(exportRows, "Status", "Tasks by status", "pie"), buildCategoryCountChart(exportRows, "Priority", "Tasks by priority", "bar")].filter((chart) => chart !== null);
		exportToCsv(exportRows, `tasks-export-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`, void 0, {
			title: "Tasks export",
			subtitle: `${filters.filteredTasks.length} task${filters.filteredTasks.length === 1 ? "" : "s"}`,
			charts
		});
	};
	const handleNewTaskClick = () => {
		form.handleCreateOpenChange(true);
	};
	const handleConfirmDelete = async () => {
		if (!form.deletingTask) return;
		form.setDeleting(true);
		const success = await handleDeleteTask(form.deletingTask);
		form.setDeleting(false);
		if (success) form.handleDeleteClose();
	};
	const handleEditDialogOpenChange = (open) => {
		if (!open) form.handleEditClose();
	};
	const handleDeleteDialogOpenChange = (open) => {
		if (!open) form.handleDeleteClose();
	};
	const visibleTasks = filters.sortedTasks;
	const selectedTaskIds = (() => {
		if (filters.viewMode === "board") return /* @__PURE__ */ new Set();
		if (rawSelectedTaskIds.size === 0) return rawSelectedTaskIds;
		const visibleIds = new Set(visibleTasks.map((task) => task.id));
		const next = /* @__PURE__ */ new Set();
		rawSelectedTaskIds.forEach((id) => {
			if (visibleIds.has(id)) next.add(id);
		});
		return next;
	})();
	const selectedTasks = (() => {
		if (selectedTaskIds.size === 0) return [];
		const selectedMap = new Set(selectedTaskIds);
		return visibleTasks.filter((task) => selectedMap.has(task.id));
	})();
	const hasSelection = selectedTasks.length > 0;
	const handleToggleTaskSelection = (taskId, checked) => {
		setRawSelectedTaskIds((current) => {
			const next = new Set(current);
			if (checked) next.add(taskId);
			else next.delete(taskId);
			return next;
		});
	};
	const handleSelectAllVisible = () => {
		setRawSelectedTaskIds(new Set(visibleTasks.map((task) => task.id)));
	};
	const handleClearSelection = () => {
		setRawSelectedTaskIds(/* @__PURE__ */ new Set());
	};
	const handleSelectHighPriority = () => {
		const filtered = visibleTasks.filter((task) => task.priority === "high" || task.priority === "urgent");
		setRawSelectedTaskIds(new Set(filtered.map((task) => task.id)));
	};
	const handleSelectDueSoon = () => {
		const now = Date.now();
		const cutoff = now + 10080 * 60 * 1e3;
		const filtered = visibleTasks.filter((task) => {
			if (!task.dueDate) return false;
			const ts = Date.parse(task.dueDate);
			if (Number.isNaN(ts)) return false;
			return ts >= now && ts <= cutoff;
		});
		setRawSelectedTaskIds(new Set(filtered.map((task) => task.id)));
	};
	const handleBulkStatusChange = async (status) => {
		if (!hasSelection) return;
		const ids = Array.from(selectedTaskIds);
		setBulkState({
			active: true,
			label: "Updating status",
			progress: 0
		});
		const ok = await handleBulkUpdate(ids, { status });
		setBulkState({
			active: false,
			label: "",
			progress: 0
		});
		if (ok) setRawSelectedTaskIds(/* @__PURE__ */ new Set());
	};
	const handleBulkAssign = async (assignees) => {
		if (!hasSelection) return;
		const normalized = assignees.flatMap((entry) => {
			const trimmed = entry.trim();
			if (trimmed.length === 0) return [];
			const byId = taskParticipants.find((participant) => participant.id === trimmed);
			if (byId?.id) return [byId.id];
			const byName = taskParticipants.find((participant) => participant.name.trim().toLowerCase() === trimmed.toLowerCase());
			if (byName?.id) return [byName.id];
			return resolveAssigneeUserIds(`@[${trimmed}]`, taskParticipants);
		});
		const ids = Array.from(selectedTaskIds);
		setBulkState({
			active: true,
			label: "Updating assignees",
			progress: 0
		});
		const ok = await handleBulkUpdate(ids, { assignedTo: normalized });
		setBulkState({
			active: false,
			label: "",
			progress: 0
		});
		if (ok) setRawSelectedTaskIds(/* @__PURE__ */ new Set());
	};
	const handleBulkDueDate = async (date) => {
		if (!hasSelection) return;
		const normalized = date && !Number.isNaN(Date.parse(date)) ? date : null;
		const ids = Array.from(selectedTaskIds);
		setBulkState({
			active: true,
			label: "Updating due dates",
			progress: 0
		});
		const ok = await handleBulkUpdate(ids, { dueDate: normalized ?? void 0 });
		setBulkState({
			active: false,
			label: "",
			progress: 0
		});
		if (ok) setRawSelectedTaskIds(/* @__PURE__ */ new Set());
	};
	const handleBulkDeleteAction = async () => {
		if (!hasSelection) return;
		const ids = Array.from(selectedTaskIds);
		setBulkState({
			active: true,
			label: "Deleting tasks",
			progress: 0
		});
		const ok = await handleBulkDelete(ids);
		setBulkState({
			active: false,
			label: "",
			progress: 0
		});
		if (ok) setRawSelectedTaskIds(/* @__PURE__ */ new Set());
	};
	const initialLoading = loading && tasks.length === 0;
	const scopeLabel = selectedClient?.name ?? (selectedClientId ? "Selected client" : null);
	const scopeHelper = selectedClient ? `Tasks for ${selectedClient.name}` : "All clients in this workspace";
	const emptyStateMessage = filters.activeTab === "my-tasks" ? "No tasks are assigned to you yet. Switch to All Tasks to see team-owned work." : "Get started by creating your first task.";
	const showFilteredEmpty = filters.selectedStatus !== "all" || debouncedQuery.trim().length > 0 || filters.activeTab === "all-tasks" && filters.selectedAssignee !== "all";
	const handleClearListFilters = () => {
		filters.resetListFilters();
		setRawSearchQuery("");
	};
	const handleSummaryStatusClick = (status) => {
		if (filters.selectedStatus === status) filters.handleStatusChange("all");
		else filters.handleStatusChange(status);
	};
	const documentImport = useTasksDocumentImport({
		workspaceId: taskWorkspaceId ? String(taskWorkspaceId) : null,
		userId: user?.id,
		participants: taskParticipants,
		clientId: taskFormClientId,
		clientName: taskFormClient?.name ?? void 0,
		projectId: projectFilter.id ?? void 0,
		projectName: projectFilter.name ?? void 0,
		disabledReason: newTaskDisabledReason,
		isPreviewMode,
		onCreateTask: handleCreateTask
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskParticipantsProvider, {
		participants: taskParticipants,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
			loading: initialLoading,
			loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TasksPageSkeleton, {}),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn(DASHBOARD_THEME.layout.container, TASKS_THEME.page, "relative"),
				...documentImport.importDragHandlers,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TasksDocumentImportOverlay, {
						phase: documentImport.phase,
						statusMessage: documentImport.statusMessage,
						errorMessage: documentImport.errorMessage,
						visible: documentImport.overlayVisible,
						onCancel: documentImport.handleCancel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TasksDocumentImportReviewSheet, {
						open: documentImport.reviewOpen,
						documentSummary: documentImport.documentSummary,
						proposedTasks: documentImport.proposedTasks,
						participants: taskParticipants,
						attachSourceDocuments: documentImport.attachSourceDocuments,
						onAttachSourceDocumentsChange: documentImport.setAttachSourceDocuments,
						onUpdateTask: documentImport.updateProposedTask,
						onConfirm: documentImport.handleConfirmReview,
						onDiscard: documentImport.handleDismissReview
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TasksHeader, {
						loading,
						retryCount,
						onRefresh: handleRefresh,
						onNewTaskClick: handleNewTaskClick,
						scopeLabel,
						scopeHelper,
						newTaskDisabledReason
					}),
					initialLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: cn(TASKS_THEME.summaryCard, "h-24") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskSummaryCards, {
						taskCounts: filters.taskCounts,
						selectedStatus: filters.selectedStatus,
						onStatusCardClick: handleSummaryStatusClick
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
						defaultValue: "all-tasks",
						value: filters.activeTab,
						onValueChange: filters.setActiveTab,
						className: "space-y-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: TASKS_THEME.workspace,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn(TASKS_THEME.rail, "sticky top-0 z-10 backdrop-blur-md"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
									className: TASKS_THEME.tabList,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "all-tasks",
										className: TASKS_THEME.tabTrigger,
										children: "All tasks"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "my-tasks",
										className: TASKS_THEME.tabTrigger,
										children: "My tasks"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskViewControls, {
									viewMode: filters.viewMode,
									onViewModeChange: filters.setViewMode,
									onExport: handleExport,
									canExport: filters.sortedTasks.length > 0
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFilters, {
									searchQuery: rawSearchQuery,
									onSearchChange: setRawSearchQuery,
									selectedStatus: filters.selectedStatus,
									onStatusChange: filters.handleStatusChange,
									selectedAssignee: filters.selectedAssignee,
									onAssigneeChange: filters.handleAssigneeChange,
									assigneeOptions: filters.assigneeOptions,
									showAssigneeFilter: filters.activeTab === "all-tasks",
									sortField: filters.sortField,
									onSortFieldChange: filters.setSortField,
									sortDirection: filters.sortDirection,
									onSortDirectionToggle: filters.toggleSortDirection,
									hasActiveFilters: filters.hasActiveFilters,
									onClearFilters: handleClearListFilters
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectFilterBanner, {
									projectId: projectFilter.id,
									projectName: projectFilter.name,
									onClear: clearProjectFilter
								}),
								filters.viewMode !== "board" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskBulkToolbar, {
									selectedCount: selectedTasks.length,
									totalVisible: visibleTasks.length,
									hasSelection,
									bulkActive: bulkState.active,
									bulkLabel: bulkState.label,
									bulkProgress: bulkState.progress,
									onSelectAll: handleSelectAllVisible,
									onClearSelection: handleClearSelection,
									onSelectHighPriority: handleSelectHighPriority,
									onSelectDueSoon: handleSelectDueSoon,
									onBulkStatusChange: handleBulkStatusChange,
									onBulkAssign: handleBulkAssign,
									onBulkDueDate: handleBulkDueDate,
									onBulkDelete: handleBulkDeleteAction
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn(TASKS_THEME.content, filters.viewMode === "list" && TASKS_THEME.contentList),
									children: filters.viewMode === "board" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskKanban, {
										tasks: filters.sortedTasks,
										loading,
										initialLoading,
										error: displayError,
										pendingStatusUpdates,
										onEdit: form.handleEditOpen,
										onDelete: form.handleDeleteClick,
										onQuickStatusChange: handleQuickStatusChange,
										onRefresh: handleRefresh,
										loadingMore,
										hasMore: Boolean(nextCursor),
										onLoadMore: handleLoadMore,
										emptyStateMessage,
										showEmptyStateFiltered: showFilteredEmpty,
										onEmptyClearFilters: handleClearListFilters,
										onEmptyCreateTask: handleNewTaskClick,
										workspaceId: user?.agencyId ?? null,
										userId: user?.id ?? null,
										userName: user?.name ?? null,
										userRole: user?.role ?? null,
										participants: taskParticipants
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskList, {
										tasks: filters.sortedTasks,
										viewMode: filters.viewMode,
										loading,
										initialLoading,
										error: displayError,
										pendingStatusUpdates,
										onEdit: form.handleEditOpen,
										onDelete: form.handleDeleteClick,
										onQuickStatusChange: handleQuickStatusChange,
										onRefresh: handleRefresh,
										loadingMore,
										hasMore: Boolean(nextCursor),
										onLoadMore: handleLoadMore,
										emptyStateMessage,
										showEmptyStateFiltered: showFilteredEmpty,
										onEmptyClearFilters: handleClearListFilters,
										onEmptyCreateTask: handleNewTaskClick,
										selectedTaskIds,
										onToggleTaskSelection: handleToggleTaskSelection,
										workspaceId: user?.agencyId ?? null,
										userId: user?.id ?? null,
										userName: user?.name ?? null,
										userRole: user?.role ?? null,
										participants: taskParticipants
									})
								}),
								!initialLoading && !displayError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskResultsCount, {
									sortedCount: filters.sortedTasks.length,
									totalCount: tasks.length,
									loading: loading && !loadingMore
								})
							] })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateTaskSheet, {
						open: form.isCreateOpen,
						onOpenChange: form.handleCreateOpenChange,
						formState: form.formState,
						setFormState: form.setFormState,
						creating: form.creating,
						createError: form.createError,
						onSubmit: form.handleCreateSubmit,
						participants: taskParticipants,
						pendingAttachments: form.createAttachments,
						onAddAttachments: form.handleCreateAttachmentsAdd,
						onRemoveAttachment: form.handleCreateAttachmentRemove
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditTaskSheet, {
						open: form.isEditOpen,
						onOpenChange: handleEditDialogOpenChange,
						taskId: form.editingTask?.id ?? null,
						formState: form.editFormState,
						setFormState: form.setEditFormState,
						updating: form.updating,
						updateError: form.updateError,
						onSubmit: form.handleEditSubmit,
						currentWorkspaceId: user?.agencyId ?? null,
						currentUserId: user?.id ?? null,
						currentUserName: user?.name ?? null,
						currentUserRole: user?.role ?? null,
						participants: taskParticipants
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteTaskDialog, {
						open: form.isDeleteDialogOpen,
						onOpenChange: handleDeleteDialogOpenChange,
						task: form.deletingTask,
						deleting: form.deleting,
						onConfirm: handleConfirmDelete
					})
				]
			})
		})
	}) });
}
function TasksPageFallback() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: DASHBOARD_THEME.layout.container,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: DASHBOARD_THEME.cards.base,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "flex items-center justify-center py-12 text-sm text-muted-foreground",
				children: "Loading tasks…"
			})
		})
	});
}
function TasksPageContent(props) {
	return useTasksPageContent(props);
}
var TASKS_PAGE_FALLBACK = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TasksPageFallback, {});
function TasksPageClient(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionShell, {
		reveal: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: TASKS_PAGE_FALLBACK,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TasksPageContent, { ...props })
		})
	});
}
function TasksRoute() {
	const search = Route.useSearch();
	const initialSearchParamsString = new URLSearchParams(Object.entries(search).flatMap(([key, value]) => value == null ? [] : [[key, value]])).toString();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TasksPageClient, {
		initialAction: search.action ?? null,
		initialClientId: search.clientId ?? null,
		initialClientName: search.clientName ?? null,
		initialProjectId: search.projectId ?? null,
		initialProjectName: search.projectName ?? null,
		initialSearchParamsString
	});
}
//#endregion
export { DeleteTaskDialog$1 as a, TasksRoute as component, EditTaskSheet$1 as i, TaskKanban$1 as n, CreateTaskSheet$1 as r, TaskList$1 as t };
