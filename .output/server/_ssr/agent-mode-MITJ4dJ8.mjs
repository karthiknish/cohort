import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, c as useConvex, l as useMutation, s as useAction, u as useQuery, x as require_react, y as ConvexError } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { r as motion_exports } from "./motion-DtlbbvFg.mjs";
import { Q as isPreviewModeEnabled, S as getPreviewAgentModeResponse } from "./preview-data-CXkRNfsX.mjs";
import { c as cn, f as formatEnUsCurrency, m as formatRelativeTime, t as AGENT_CHART_WHOLE_NUMBER_FORMATTER } from "./utils-hh4sibN0.mjs";
import { N as isValid, r as parseISO } from "../_libs/date-fns.mjs";
import { _ as motionDurationSeconds, o as chromaticTransitionNormalClass, v as motionEasing } from "./motion-Cf6ujF0h.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { r as formatProviderName } from "./themes-DBvmOGm7.mjs";
import { s as logError } from "./convex-errors-sHK0JmZ7.mjs";
import { c as reportConvexFailure, i as notifyFailure, o as notifySuccess, r as notifyError, t as convexErrorMessage } from "./notifications-DQZKskhM.mjs";
import { n as usePathname, r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { t as UnifiedError } from "./unified-error-C0L-fxgu.mjs";
import { D as filesApi, I as projectsApi, Y as usersApi, m as agentApi, q as tasksApi } from "./convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { Ar as Building2, F as Sparkles, Gr as Archive, J as Send, Kn as Copy, N as SquarePen, Sr as ChartColumn, St as PanelRight, Tn as FolderKanban, Tt as Navigation, Vn as Download, Vr as ArrowRight, Wr as ArrowDown, Wt as Maximize2, Y as Search, Yt as LoaderCircle, Zn as Clock, b as TriangleAlert, cr as CircleAlert, f as User, ft as Pin, gr as Check, gt as Pencil, hn as History, i as X, mt as PictureInPicture2, o as WifiOff, or as CircleCheck, pt as PinOff, r as Zap, rr as CircleQuestionMark, rt as RefreshCw, tn as Link2, u as Users, un as Info, w as Trash2, xt as Paperclip, zn as Ellipsis } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { n as FadeInItem, r as FadeInStagger } from "./animate-in-JYv0iBIt.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip-BwcfatA2.mjs";
import { o as getChartColor } from "./colors-DH3BrJD1.mjs";
import { t as Textarea } from "./textarea-C0M2IvQZ.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Be-Tzxcj.mjs";
import { t as ScrollArea } from "./scroll-area-DnXuhDTw.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { c as DropdownMenuSeparator, i as DropdownMenuItem, l as DropdownMenuTrigger, o as DropdownMenuRadioGroup, r as DropdownMenuContent, s as DropdownMenuRadioItem, t as DropdownMenu } from "./dropdown-menu-CJEJ0oqe.mjs";
import { r as useUrlSearchParamsContext } from "./use-url-search-params-CvniTNfQ.mjs";
import { n as useNavigationContext } from "./navigation-context-BLXaFSSv.mjs";
import { r as SheetContent, t as Sheet } from "./sheet-Ybc8ZbjG.mjs";
import { n as uploadStorageFileWithPublicUrl } from "./upload-storage-file-CUAnugSD.mjs";
import { i as getAttachmentKind, n as ChatMediaGallery, t as AttachmentKindIcon } from "./use-voice-input-CLPTluum.mjs";
import { n as VoiceInputButton, r as useClientNow, t as ChatTypingIndicator } from "./use-client-relative-time-BtAGXTYW.mjs";
import { o as workbookToXlsxBlob, r as ensureXlsxFilename, t as buildCohortsSpreadsheetWorkbook } from "./cohorts-spreadsheet-oHwGWk0s.mjs";
import { c as normalizeAuthRole, i as can } from "./dashboard-access-q6oyjv-c.mjs";
import { n as useKeyboardShortcut } from "./use-keyboard-shortcuts-CjHWs-Qm.mjs";
import { n as AgentMentionText, r as splitAgentTextWithMentions, t as AgentMentionPills } from "./mention-highlights-C5eBIzIc.mjs";
import { a as getPdfUploadSizeError, c as parseAgentAttachmentsFromStored, d as toAgentRequestAttachmentContext, i as createPendingAttachmentPlaceholder, l as readFileAsBase64, n as agentAttachmentsToChatMedia, o as hasUsableAttachmentContext, r as buildAgentAttachmentContext, s as hydrateAgentAttachmentUrls, t as AGENT_ATTACHMENT_ACCEPT, u as serializeAgentAttachmentsForStorage } from "./agent-attachments-Bv_PBE19.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agent-mode-MITJ4dJ8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AgentModeButton({ onClick, isOpen, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick,
			size: "icon",
			id: "agent-mode-launcher",
			className: cn("relative fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-lg ring-2 ring-background", chromaticTransitionNormalClass, "bg-gradient-to-br from-primary via-primary to-primary/85", "hover:scale-[1.04] hover:shadow-xl hover:ring-primary/20", !isOpen && "before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-primary/20 before:blur-md before:content-[\"\"]", isOpen && "rotate-45 bg-destructive hover:bg-destructive/90 hover:ring-destructive/30", className),
			"aria-label": isOpen ? "Close Agent Mode" : "Open Agent Mode",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: cn("size-6 transition-transform duration-200", isOpen && "-rotate-45") })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
		side: "left",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: isOpen ? "Close Agent Mode" : "Agent Mode — chat or speak to navigate (⌘⇧A)" })
	})] }) });
}
var MOTION_FADE_SLIDE_UP = {
	opacity: 0,
	y: -10
};
var MOTION_VISIBLE = {
	opacity: 1,
	y: 0
};
var MOTION_FADE_SLIDE_UP_EXIT = {
	opacity: 0,
	y: -10
};
var MOTION_FADE_IN = { opacity: 0 };
var MOTION_FADE_IN_VISIBLE = { opacity: 1 };
motionDurationSeconds.fast, motionEasing.out;
var AGENT_PANEL_SURFACE = "relative bg-background before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-24 before:bg-gradient-to-b before:from-primary/[0.04] before:to-transparent";
var AGENT_MESSAGE_THREAD = "relative min-h-full bg-[radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--foreground)_6%,transparent)_1px,transparent_0)] [background-size:20px_20px]";
function stopPropagation$1(event) {
	event.stopPropagation();
}
function startOfLocalDay$1(date) {
	const copy = new Date(date);
	copy.setHours(0, 0, 0, 0);
	return copy.getTime();
}
function formatMessageDayLabel(date, now) {
	const todayStart = startOfLocalDay$1(now);
	const messageStart = startOfLocalDay$1(date);
	const yesterdayStart = todayStart - 1440 * 60 * 1e3;
	if (messageStart === todayStart) return "Today";
	if (messageStart === yesterdayStart) return "Yesterday";
	return date.toLocaleDateString(void 0, {
		weekday: "long",
		month: "short",
		day: "numeric"
	});
}
function messageDayKey(timestamp) {
	return String(startOfLocalDay$1(timestamp));
}
function AgentMessageDayDivider({ label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 py-1",
		"aria-label": label,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", {
				className: "h-px flex-1 border-0 bg-border/60",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
				suppressHydrationWarning: true,
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", {
				className: "h-px flex-1 border-0 bg-border/60",
				"aria-hidden": true
			})
		]
	});
}
function AttachmentStatusBadge({ attachment }) {
	if (attachment.extractionStatus === "extracting") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			className: "size-3 animate-spin",
			"aria-hidden": true
		}), "Reading"]
	});
	if (attachment.extractionStatus === "ready") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success",
		children: "Ready"
	});
	if (attachment.extractionStatus === "limited") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning",
		children: "Limited"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive",
		children: "Needs Review"
	});
}
function AttachmentItem({ attachment, onRemoveAttachment }) {
	const handleRemove = () => {
		onRemoveAttachment(attachment.id);
	};
	const media = agentAttachmentsToChatMedia([attachment]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-xl border border-border/60 bg-card/80 p-3 shadow-sm backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg bg-primary/10 p-2 text-primary ring-1 ring-primary/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentKindIcon, {
							kind: getAttachmentKind({
								name: attachment.name,
								url: attachment.url ?? "#",
								type: attachment.mimeType
							}),
							className: "size-4"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-medium",
										children: attachment.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentStatusBadge, { attachment }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: attachment.sizeLabel
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs leading-5 text-muted-foreground",
								children: attachment.excerpt
							}),
							attachment.errorMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex items-center gap-1.5 text-[11px] font-medium text-warning",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: attachment.errorMessage })]
							}) : null
						]
					})]
				}), media.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatMediaGallery, {
					attachments: media,
					compact: true
				}) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "icon",
				className: "size-8 rounded-full",
				onClick: handleRemove,
				"aria-label": `Remove ${attachment.name}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			})]
		})
	}, attachment.id);
}
function AttachmentList({ attachments, onRemoveAttachment }) {
	if (attachments.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-3 space-y-2",
		children: attachments.map((attachment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentItem, {
			attachment,
			onRemoveAttachment
		}, attachment.id))
	});
}
function AgentMessageAttachmentChips({ attachments }) {
	if (attachments.length === 0) return null;
	const media = agentAttachmentsToChatMedia(attachments);
	const metadataOnly = attachments.filter((attachment) => !attachment.url?.trim() || attachment.url === "about:blank");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2.5 space-y-2",
		"aria-label": "Attached files",
		children: [media.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatMediaGallery, {
			attachments: media,
			compact: true,
			className: "[&_img]:ring-primary-foreground/20"
		}) : null, metadataOnly.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-2",
			children: metadataOnly.map((attachment) => {
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start gap-2.5 rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-2 text-left text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 ring-1 ring-primary-foreground/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentKindIcon, {
							kind: getAttachmentKind({
								name: attachment.name,
								url: "#",
								type: attachment.mimeType
							}),
							className: "size-4 opacity-90"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex flex-wrap items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate font-semibold",
									children: attachment.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentStatusBadge, { attachment }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] opacity-75",
									children: attachment.sizeLabel
								})
							]
						}), attachment.excerpt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 line-clamp-3 text-[11px] leading-relaxed opacity-85",
							children: attachment.excerpt
						}) : null]
					})]
				}, attachment.id);
			})
		}) : null]
	});
}
var AgentError = class extends UnifiedError {
	constructor(details) {
		super({
			message: details.message,
			status: details.type === "auth" ? 401 : details.type === "rate-limit" ? 429 : details.type === "server" ? 503 : 500,
			code: details.type.toUpperCase().replace("-", "_"),
			isRetryable: details.retryable,
			isAuthError: details.type === "auth",
			isRateLimitError: details.type === "rate-limit",
			retryAfterMs: details.retryAfter ? details.retryAfter * 1e3 : void 0,
			cause: details.originalError
		});
		this.name = "AgentError";
		this.type = details.type;
		this.originalError = details.originalError;
	}
	toJSON() {
		return {
			type: this.type,
			message: this.message,
			retryAfter: this.retryAfterMs ? this.retryAfterMs / 1e3 : void 0,
			retryable: this.isRetryable
		};
	}
};
/**
* Network connectivity error (offline, DNS failure, etc.)
*/
var AgentNetworkError = class extends AgentError {
	constructor(message = "Network error. Please check your connection.", originalError) {
		super({
			type: "network",
			message,
			retryable: true,
			originalError
		});
		this.name = "AgentNetworkError";
	}
};
/**
* Rate limit exceeded (429)
*/
var AgentRateLimitError = class extends AgentError {
	constructor(retryAfter = 60, originalError) {
		super({
			type: "rate-limit",
			message: `Too many requests. Please wait ${retryAfter} seconds.`,
			retryAfter,
			retryable: true,
			originalError
		});
		this.name = "AgentRateLimitError";
	}
};
/**
* Authentication error (401, expired token)
*/
var AgentAuthError = class extends AgentError {
	constructor(message = "Session expired. Please sign in again.", originalError) {
		super({
			type: "auth",
			message,
			retryable: false,
			originalError
		});
		this.name = "AgentAuthError";
	}
};
/**
* Server error (5xx)
*/
var AgentServerError = class extends AgentError {
	constructor(message = "Server error. Please try again in a moment.", originalError) {
		super({
			type: "server",
			message,
			retryable: true,
			originalError
		});
		this.name = "AgentServerError";
	}
};
/**
* Input validation error
*/
var AgentValidationError = class extends AgentError {
	constructor(message, originalError) {
		super({
			type: "validation",
			message,
			retryable: false,
			originalError
		});
		this.name = "AgentValidationError";
	}
};
/**
* Parse API response to determine error type
*/
function parseAgentError(error, response) {
	if (error instanceof ConvexError) {
		const data = error.data;
		const code = data?.code || "";
		const message = data?.message || "An error occurred";
		const authCodes = new Set([
			"UNAUTHORIZED",
			"FORBIDDEN",
			"USER_NOT_FOUND",
			"USER_DISABLED",
			"ADMIN_REQUIRED",
			"WORKSPACE_ACCESS_DENIED",
			"INVALID_TOKEN"
		]);
		const validationCodes = new Set([
			"INVALID_INPUT",
			"INVALID_STATE",
			"VALIDATION_ERROR"
		]);
		if (authCodes.has(code) || code.includes("AUTH")) return new AgentAuthError(message, error);
		if (code === "TOO_MANY_REQUESTS" || code.includes("RATE_LIMIT")) return new AgentRateLimitError(60, error);
		if (validationCodes.has(code) || code.includes("VALIDATION") || code.includes("INVALID")) return new AgentValidationError(message, error);
		return new AgentError({
			type: "unknown",
			message,
			retryable: true,
			originalError: error
		});
	}
	if (error instanceof TypeError && error.message.includes("fetch")) return new AgentNetworkError("Unable to connect. Check your internet connection.", error);
	if (response) {
		const status = response.status;
		const retryAfter = parseInt(response.headers.get("Retry-After") || "60", 10);
		if (status === 429) return new AgentRateLimitError(retryAfter, error);
		if (status === 401) return new AgentAuthError("Your session has expired. Please sign in again.", error);
		if (status === 403) return new AgentAuthError("Access denied. You may not have permission for this action.", error);
		if (status >= 500) return new AgentServerError("The server is temporarily unavailable. Please try again.", error);
		if (status >= 400) return new AgentValidationError(error instanceof Error ? error.message : "Invalid request", error);
	}
	return new AgentError({
		type: "unknown",
		message: error instanceof Error ? error.message : "An unexpected error occurred",
		retryable: true,
		originalError: error
	});
}
/**
* Human-friendly error messages for display
*/
var ERROR_DISPLAY_MESSAGES = {
	"network": "Connection lost. Tap retry when you're back online.",
	"rate-limit": "Slow down! Too many messages. Please wait a moment.",
	"auth": "Session expired. Please refresh the page to sign in.",
	"server": "Something went wrong on our end. We're on it!",
	"validation": "That message didn't work. Try rephrasing it.",
	"unknown": "Something went wrong. Please try again."
};
var EMPTY_CLIENTS = [];
var EMPTY_PROJECTS = [];
var EMPTY_TEAMS = [];
var EMPTY_USERS = [];
var MENTION_CATEGORIES = [
	{
		type: "client",
		label: "Clients",
		icon: Building2
	},
	{
		type: "project",
		label: "Projects",
		icon: FolderKanban
	},
	{
		type: "team",
		label: "Teams",
		icon: Users
	},
	{
		type: "user",
		label: "Users",
		icon: User
	}
];
var DROPDOWN_INITIAL = {
	opacity: 0,
	y: 8
};
var DROPDOWN_ANIMATE = {
	opacity: 1,
	y: 0
};
var DROPDOWN_EXIT = {
	opacity: 0,
	y: 8
};
var DROPDOWN_TRANSITION = {
	duration: motionDurationSeconds.fast,
	ease: motionEasing.out
};
function getTypeIcon(type) {
	switch (type) {
		case "client": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-3.5 text-info" });
		case "project": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, { className: "size-3.5 text-success" });
		case "team": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 text-warning" });
		case "user": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5 text-primary" });
	}
}
function getTypeColor(type) {
	switch (type) {
		case "client": return "bg-info/10 text-info border-info/20";
		case "project": return "bg-success/10 text-success border-success/20";
		case "team": return "bg-warning/10 text-warning border-warning/20";
		case "user": return "bg-accent/10 text-primary border-accent/20";
	}
}
function MentionCategoryButton({ activeCategory, type, icon: Icon, label, onSelect }) {
	const onSelectMentionCategory = () => {
		onSelect(type);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onSelectMentionCategory,
		className: cn("flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors", activeCategory === type ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3" }), label]
	});
}
function MentionResultButton({ clampedSelectedIndex, index, item, onSelect, showAmbiguousSubtitle }) {
	const onSelectMentionItem = () => {
		onSelect(item);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		id: `agent-mention-option-${item.type}-${item.id}`,
		role: "option",
		"aria-selected": index === clampedSelectedIndex,
		onClick: onSelectMentionItem,
		className: cn("flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors", index === clampedSelectedIndex ? "bg-muted text-foreground" : "hover:bg-muted hover:text-foreground"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("flex size-7 items-center justify-center rounded-md border", getTypeColor(item.type)),
				children: getTypeIcon(item.type)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm font-medium",
					children: item.name
				}), item.subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("truncate text-xs", showAmbiguousSubtitle ? "font-medium text-foreground" : "text-muted-foreground"),
					children: item.subtitle
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] uppercase tracking-wide text-muted-foreground",
				children: item.type
			})
		]
	});
}
function MentionDropdown({ ref, listboxId = "agent-mention-listbox", isOpen, onClose, onSelect, searchQuery, clients = EMPTY_CLIENTS, projects = EMPTY_PROJECTS, teams = EMPTY_TEAMS, users = EMPTY_USERS, isLoading = false }) {
	const [selectedIndex, setSelectedIndex] = (0, import_react.useState)(0);
	const [activeCategory, setActiveCategory] = (0, import_react.useState)(null);
	const dropdownRef = (0, import_react.useRef)(null);
	const filteredItems = (() => {
		const query = searchQuery.toLowerCase();
		const items = [];
		for (const c of clients) {
			if (!c.name.toLowerCase().includes(query)) continue;
			items.push({
				id: c.id,
				name: c.name,
				type: "client",
				subtitle: c.company
			});
		}
		for (const p of projects) {
			if (!p.name.toLowerCase().includes(query)) continue;
			items.push({
				id: p.id,
				name: p.name,
				type: "project",
				subtitle: p.status
			});
		}
		for (const t of teams) {
			if (!t.name.toLowerCase().includes(query)) continue;
			items.push({
				id: t.id,
				name: t.name,
				type: "team",
				subtitle: t.memberCount ? `${t.memberCount} members` : void 0
			});
		}
		for (const u of users) {
			if (!u.name.toLowerCase().includes(query) && !u.email?.toLowerCase().includes(query)) continue;
			items.push({
				id: u.id,
				name: u.name,
				type: "user",
				subtitle: u.role || u.email
			});
		}
		if (activeCategory) return items.filter((item) => item.type === activeCategory);
		return items;
	})();
	const clampedSelectedIndex = Math.min(selectedIndex, Math.max(filteredItems.length - 1, 0));
	const duplicateNameKeys = (() => {
		const counts = /* @__PURE__ */ new Map();
		for (const item of filteredItems) {
			const key = item.name.trim().toLowerCase();
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
		return new Set([...counts.entries()].flatMap(([name, count]) => count > 1 ? [name] : []));
	})();
	const onCloseRef = (0, import_react.useRef)(onClose);
	const onSelectRef = (0, import_react.useRef)(onSelect);
	(0, import_react.useEffect)(() => {
		onCloseRef.current = onClose;
		onSelectRef.current = onSelect;
	}, [onClose, onSelect]);
	const handleAllCategoryClick = () => {
		setActiveCategory(null);
	};
	const handleListKeyDown = (e) => {
		if (!isOpen) return false;
		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
				return true;
			case "ArrowUp":
				e.preventDefault();
				setSelectedIndex((prev) => Math.max(prev - 1, 0));
				return true;
			case "Enter": {
				e.preventDefault();
				const selectedItem = filteredItems[clampedSelectedIndex];
				if (selectedItem) onSelectRef.current(selectedItem);
				return true;
			}
			case "Escape":
				e.preventDefault();
				onCloseRef.current();
				return true;
			case "Tab": {
				e.preventDefault();
				const categoryOrder = [
					null,
					"client",
					"project",
					"team",
					"user"
				];
				const nextCategory = categoryOrder[(categoryOrder.indexOf(activeCategory) + 1) % categoryOrder.length];
				setActiveCategory(nextCategory ?? null);
				return true;
			}
			default: return false;
		}
	};
	const handleListKeyDownRef = (0, import_react.useRef)(handleListKeyDown);
	(0, import_react.useEffect)(() => {
		handleListKeyDownRef.current = handleListKeyDown;
	}, [handleListKeyDown]);
	(0, import_react.useImperativeHandle)(ref, () => ({ handleKeyDown: (event) => handleListKeyDownRef.current(event) }), []);
	(0, import_react.useEffect)(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onCloseRef.current();
		};
		if (isOpen) document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.AnimatePresence, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion_exports.m.div, {
			ref: dropdownRef,
			id: listboxId,
			role: "listbox",
			"aria-label": "Mention suggestions",
			"aria-activedescendant": filteredItems[clampedSelectedIndex] ? `agent-mention-option-${filteredItems[clampedSelectedIndex].type}-${filteredItems[clampedSelectedIndex].id}` : void 0,
			initial: DROPDOWN_INITIAL,
			animate: DROPDOWN_ANIMATE,
			exit: DROPDOWN_EXIT,
			transition: DROPDOWN_TRANSITION,
			className: "absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl border border-border/70 bg-background/95 shadow-xl backdrop-blur-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 border-b bg-muted/30 px-2 py-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleAllCategoryClick,
						className: cn("rounded-md px-2 py-1 text-xs font-medium transition-colors", activeCategory === null ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"),
						children: "All"
					}), MENTION_CATEGORIES.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MentionCategoryButton, {
						activeCategory,
						icon: cat.icon,
						label: cat.label,
						onSelect: setActiveCategory,
						type: cat.type
					}, cat.type))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "max-h-[280px] overflow-y-auto",
					children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center justify-center py-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-muted-foreground" })
					}) : filteredItems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-6 text-center text-sm text-muted-foreground",
						children: [
							"No results found for \"",
							searchQuery,
							"\""
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-1",
						children: filteredItems.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MentionResultButton, {
							clampedSelectedIndex,
							index,
							item,
							onSelect,
							showAmbiguousSubtitle: duplicateNameKeys.has(item.name.trim().toLowerCase())
						}, `${item.type}-${item.id}`))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t bg-muted/20 px-3 py-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[10px] text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
								className: "rounded bg-muted px-1 py-0.5 text-[9px]",
								children: "↑↓"
							}),
							" ",
							"Navigate",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
								className: "ml-1.5 rounded bg-muted px-1 py-0.5 text-[9px]",
								children: "Enter"
							}),
							" ",
							"Select",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
								className: "ml-1.5 rounded bg-muted px-1 py-0.5 text-[9px]",
								children: "Tab"
							}),
							" ",
							"Categories",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
								className: "ml-1.5 rounded bg-muted px-1 py-0.5 text-[9px]",
								children: "Esc"
							}),
							" ",
							"Close"
						]
					})
				})
			]
		}) })
	});
}
function ConnectionIndicator({ status }) {
	if (status === "connected") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.output, {
		"aria-live": "polite",
		initial: MOTION_FADE_SLIDE_UP,
		animate: MOTION_VISIBLE,
		exit: MOTION_FADE_SLIDE_UP_EXIT,
		className: cn("flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium", status === "retrying" && "bg-warning/10 text-warning", status === "disconnected" && "bg-destructive/10 text-destructive"),
		children: status === "retrying" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Reconnecting…" })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Offline" })] })
	});
}
function RateLimitBanner({ countdown, onDismiss }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion_exports.m.output, {
		"aria-live": "assertive",
		initial: MOTION_FADE_SLIDE_UP,
		animate: MOTION_VISIBLE,
		exit: MOTION_FADE_SLIDE_UP_EXIT,
		className: "flex items-center justify-between gap-3 border border-warning/20 bg-warning/10 px-4 py-2.5 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-warning",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				"Too many requests. Please wait ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [countdown, "s"] }),
				"…"
			] })]
		}), onDismiss ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			onClick: onDismiss,
			className: "h-7 px-2 text-warning hover:text-warning/80",
			"aria-label": "Dismiss rate limit notice",
			children: "Dismiss"
		}) : null]
	});
}
function AgentErrorBanner({ error, lastFailedMessage, onDismiss }) {
	if (lastFailedMessage) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "alert",
		"aria-live": "assertive",
		className: "flex items-center justify-between gap-3 border-b border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 flex-1",
			children: error.type === "validation" ? error.message : ERROR_DISPLAY_MESSAGES[error.type] ?? error.message
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "outline",
			size: "sm",
			className: "h-8 shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10",
			onClick: onDismiss,
			children: "Dismiss"
		})]
	});
}
function AgentComposerInput({ value, onChange, onKeyDown, inputRef, placeholder, disabled, mentionLabels, maxLength, mentionListboxId, showMentions }) {
	const activeMentions = (() => {
		const seen = /* @__PURE__ */ new Set();
		return splitAgentTextWithMentions(value, mentionLabels).flatMap((segment) => {
			if (!segment.isMention) return [];
			const key = segment.text.toLowerCase();
			if (seen.has(key)) return [];
			seen.add(key);
			return [segment.text];
		});
	})();
	const remaining = maxLength - value.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 flex-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				ref: inputRef,
				value,
				onChange,
				onKeyDown,
				placeholder,
				className: "min-h-[44px] max-h-[160px] resize-none border-0 bg-transparent px-0 py-2 text-sm leading-relaxed shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
				disabled,
				spellCheck: true,
				autoGrow: true,
				maxLength,
				rows: 1,
				role: "combobox",
				"aria-label": "Agent message",
				"aria-expanded": showMentions ?? false,
				"aria-controls": showMentions && mentionListboxId ? mentionListboxId : void 0,
				"aria-autocomplete": "list"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 border-t border-border/40 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[10px] text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "rounded-md border border-border/60 bg-muted/50 px-1 font-mono text-[10px]",
							children: "Enter"
						}),
						" send ·",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "rounded-md border border-border/60 bg-muted/50 px-1 font-mono text-[10px]",
							children: "⇧ Enter"
						}),
						" line"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("text-[10px] tabular-nums", remaining < 80 ? "font-medium text-warning" : "text-muted-foreground"),
					"aria-live": "polite",
					children: [
						value.length,
						"/",
						maxLength
					]
				})]
			}),
			activeMentions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-1.5",
				children: activeMentions.map((mention) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "secondary",
					className: "rounded-full bg-primary/10 text-primary hover:bg-primary/10",
					children: ["@", mention]
				}, mention))
			}) : null
		]
	});
}
var EMPTY_QUICK_SUGGESTIONS = [];
function SuggestionButton({ suggestion, disabled, onSuggestionClick }) {
	const onApplySuggestion = () => {
		onSuggestionClick(suggestion);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: onApplySuggestion,
		disabled,
		className: "group rounded-xl border border-border/60 bg-card/80 px-3 py-2 text-left text-xs font-medium shadow-sm transition-all hover:border-primary/25 hover:bg-primary/[0.04] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
		title: suggestion.prompt,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
				className: "size-3 text-primary/70 transition-colors group-hover:text-primary",
				"aria-hidden": true
			}), suggestion.label]
		})
	});
}
function AgentComposerSection({ layout, inputValue, inputRef, mentionLabels, showMentions, mentionQuery, clients, projects, teams, users, mentionsLoading, pendingAttachments, isExtractingAttachments, disabled, onInputChange, onKeyDown, onOpenFilePicker, onCloseMentions, onSelectMention, onVoiceTranscript, onVoiceInterim, onRemoveAttachment, onSubmit, quickSuggestions = EMPTY_QUICK_SUGGESTIONS, onSuggestionClick, maxMessageLength, mentionListboxId = "agent-mention-listbox", mentionDropdownRef }) {
	const isCentered = layout === "centered";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn(isCentered ? "p-1" : "relative border-t border-border/50 bg-muted/20 p-3", !isCentered && "pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentList, {
				attachments: pendingAttachments,
				onRemoveAttachment
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("relative", isCentered && "mx-auto max-w-xl"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MentionDropdown, {
					ref: mentionDropdownRef,
					listboxId: mentionListboxId,
					isOpen: showMentions,
					onClose: onCloseMentions,
					onSelect: onSelectMention,
					searchQuery: mentionQuery,
					clients,
					projects,
					teams,
					users,
					isLoading: mentionsLoading
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("rounded-2xl border border-border/70 bg-card p-3 shadow-sm transition-shadow", "focus-within:border-primary/30 focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/15", disabled && "opacity-60"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentComposerInput, {
						inputRef,
						value: inputValue,
						onChange: onInputChange,
						onKeyDown,
						placeholder: isCentered ? "Create projects, run analytics, send messages, or navigate…" : "Ask about tasks, projects, analytics, ads, or meetings…",
						disabled,
						mentionLabels,
						maxLength: maxMessageLength,
						mentionListboxId,
						showMentions
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center justify-end gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceInputButton, {
								variant: "standalone",
								showWaveform: false,
								onTranscript: onVoiceTranscript,
								onInterimTranscript: onVoiceInterim,
								disabled
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								size: "icon",
								onClick: onOpenFilePicker,
								disabled,
								className: "size-9 shrink-0 rounded-full text-muted-foreground hover:text-foreground",
								"aria-label": "Attach context files",
								title: "Attach context files (⌘⇧U)",
								children: isExtractingAttachments ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								onClick: onSubmit,
								disabled: !inputValue.trim() || disabled,
								className: "size-9 shrink-0 rounded-full bg-primary shadow-sm hover:bg-primary/90 disabled:opacity-40",
								"aria-label": "Send message",
								title: "Send message",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
							})
						]
					})]
				})]
			}),
			isCentered && quickSuggestions.length > 0 && onSuggestionClick ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mt-4 grid max-w-xl gap-2 sm:grid-cols-2",
				children: quickSuggestions.map((suggestion) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuggestionButton, {
					suggestion,
					disabled,
					onSuggestionClick
				}, suggestion.id))
			}) : null
		]
	});
}
var LAYOUT_KEY = "cohort-agent-panel-layout";
function isAgentPanelLayout(value) {
	return value === "compact" || value === "docked" || value === "fullscreen";
}
function readAgentPanelLayout() {
	if (typeof window === "undefined") return "fullscreen";
	const stored = window.localStorage.getItem(LAYOUT_KEY);
	if (isAgentPanelLayout(stored)) return stored;
	if (window.matchMedia("(max-width: 767px)").matches) return "fullscreen";
	return "fullscreen";
}
function writeAgentPanelLayout(layout) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(LAYOUT_KEY, layout);
}
/** Full-screen modal blocks the dashboard; docked/compact keep the page usable. */
function panelUsesModalFocusTrap(layout) {
	return layout === "fullscreen";
}
function shouldKeepAgentOpenOnNavigate(layout) {
	const resolved = layout ?? readAgentPanelLayout();
	return resolved === "compact" || resolved === "docked";
}
/** Docked/compact panels cover the FAB; fullscreen keeps it as the close control. */
function shouldHideAgentFab(isOpen, layout) {
	return isOpen && layout !== "fullscreen";
}
function layoutLabel(layout) {
	switch (layout) {
		case "compact": return "Compact";
		case "docked": return "Docked";
		case "fullscreen": return "Full screen";
	}
}
function AgentModeHeader({ connectionStatus, conversationId, activeConversationTitle, messagesCount, showHistory, panelLayout, onClose, onStartNewChat, onToggleHistory, onSetPanelLayout }) {
	const LayoutIcon = panelLayout === "fullscreen" ? Maximize2 : panelLayout === "compact" ? PictureInPicture2 : PanelRight;
	const handlePanelLayoutChange = (value) => {
		if (value === "compact" || value === "docked" || value === "fullscreen") onSetPanelLayout?.(value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/[0.06] via-background to-background px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
					className: "size-4 text-primary",
					"aria-hidden": true
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					id: "agent-mode-dialog-title",
					className: "block text-sm font-semibold tracking-tight",
					children: "Agent Mode"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate text-[11px] text-muted-foreground",
					children: activeConversationTitle?.trim() ? activeConversationTitle : conversationId ? "Active conversation" : "Workspace assistant"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 items-center gap-1.5",
			children: [
				conversationId || messagesCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: onStartNewChat,
					className: "h-8 gap-1.5 rounded-full px-3 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "size-3.5" }), "New"]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.AnimatePresence, { children: connectionStatus !== "connected" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionIndicator, { status: connectionStatus }) : null }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					onClick: onToggleHistory,
					className: cn("size-9 rounded-full focus-visible:ring-2 focus-visible:ring-ring", showHistory && "bg-muted"),
					"aria-label": "Toggle chat history",
					title: "Chat history (⌘⇧H)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4" })
				}),
				onSetPanelLayout && panelLayout ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-9 rounded-full focus-visible:ring-2 focus-visible:ring-ring",
						"aria-label": `Panel layout: ${layoutLabel(panelLayout)}`,
						title: `Layout: ${layoutLabel(panelLayout)}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutIcon, { className: "size-4" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
					align: "end",
					className: "w-44",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuRadioGroup, {
						value: panelLayout,
						onValueChange: handlePanelLayoutChange,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
								value: "compact",
								children: "Compact floating"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
								value: "docked",
								children: "Docked (keep dashboard visible)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
								value: "fullscreen",
								children: "Full screen"
							})
						]
					})
				})] }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					onClick: onClose,
					className: "size-9 rounded-full focus-visible:ring-2 focus-visible:ring-ring",
					"aria-label": "Close Agent Mode",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})
			]
		})]
	});
}
function AgentEmptyState({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8 sm:px-6", AGENT_PANEL_SURFACE),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mx-auto mb-5 flex size-16 items-center justify-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute inset-0 rounded-2xl bg-primary/15 blur-lg",
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent ring-1 ring-primary/25",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
								className: "size-8 text-primary",
								"aria-hidden": true
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xl font-semibold tracking-tight",
						children: "What can I help with?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-muted-foreground",
						children: [
							"Ask in plain language, attach files for context, or type",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
								className: "rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[11px]",
								children: "@"
							}),
							" to mention clients, projects, or teammates."
						]
					})
				]
			}), children]
		})
	});
}
function stopPropagation(event) {
	event.stopPropagation();
}
function AgentConversationItem({ conversation, conversationId, isConversationLoading, loadingConversationId, editingConversationId, editingTitle, setEditingTitle, onSelectConversation, onUpdateConversationTitle, onDeleteConversation, onClose, onStartEditing, onStopEditing, variant = "default", onPinConversation, onArchiveConversation, onDuplicateConversation, onExportConversation, onShareConversation }) {
	const isRail = variant === "rail";
	const isActive = conversation.id === conversationId;
	const isLoadingThis = isConversationLoading && conversation.id === loadingConversationId;
	const isEditing = editingConversationId === conversation.id;
	const handleChangeTitle = (event) => setEditingTitle(event.target.value);
	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			onUpdateConversationTitle(conversation.id, editingTitle);
			onStopEditing();
		}
		if (event.key === "Escape") {
			event.preventDefault();
			onStopEditing();
		}
	};
	const handleSelect = () => {
		if (isConversationLoading) return;
		onSelectConversation(conversation.id);
		onClose?.();
	};
	const handleSaveTitle = () => {
		onUpdateConversationTitle(conversation.id, editingTitle);
		onStopEditing();
	};
	const handleStartEditing = () => {
		onStartEditing(conversation.id, conversation.title || "");
	};
	const [confirmDeleteOpen, setConfirmDeleteOpen] = (0, import_react.useState)(false);
	const handleDelete = () => {
		setConfirmDeleteOpen(true);
	};
	const handleConfirmDelete = () => {
		onDeleteConversation(conversation.id);
		setConfirmDeleteOpen(false);
	};
	const handlePinConversation = () => {
		onPinConversation?.(conversation.id, !conversation.pinnedAt);
	};
	const handleDuplicateConversation = () => {
		onDuplicateConversation?.(conversation.id);
	};
	const handleExportConversation = () => {
		onExportConversation?.(conversation.id);
	};
	const handleShareConversation = () => {
		onShareConversation?.(conversation.id);
	};
	const handleArchiveConversation = () => {
		onArchiveConversation?.(conversation.id, !conversation.archivedAt);
	};
	const titleInputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!isEditing) return;
		titleInputRef.current?.focus();
	}, [isEditing]);
	const relativeTime = conversation.lastMessageAt && !Number.isNaN(new Date(conversation.lastMessageAt).getTime()) ? formatRelativeTime(new Date(conversation.lastMessageAt)) : null;
	const title = conversation.title?.trim() || "Untitled chat";
	const menu = isRail ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "icon",
			className: cn("size-8 shrink-0 rounded-full text-muted-foreground", "opacity-100 focus-visible:opacity-100", "md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100", isActive && "md:opacity-100"),
			"aria-label": `Actions for ${title}`,
			onClick: stopPropagation,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		className: "w-48",
		onClick: stopPropagation,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: handleStartEditing,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-2 size-4" }), "Rename"]
			}),
			onPinConversation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				onClick: handlePinConversation,
				children: conversation.pinnedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinOff, { className: "mr-2 size-4" }), "Unpin"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "mr-2 size-4" }), "Pin"] })
			}) : null,
			onDuplicateConversation ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: handleDuplicateConversation,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "mr-2 size-4" }), "Duplicate"]
			}) : null,
			onExportConversation ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: handleExportConversation,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 size-4" }), "Export"]
			}) : null,
			onShareConversation ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: handleShareConversation,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "mr-2 size-4" }), "Share link"]
			}) : null,
			onArchiveConversation ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: handleArchiveConversation,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "mr-2 size-4" }), conversation.archivedAt ? "Restore" : "Archive"]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				className: "text-destructive focus:text-destructive",
				onClick: handleDelete,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), "Delete"]
			})
		]
	})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex shrink-0 items-center gap-0.5",
		children: [isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: "size-8",
			onClick: handleSaveTitle,
			"aria-label": "Save title",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: "size-8",
			onClick: handleStartEditing,
			"aria-label": "Edit title",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: "size-8",
			onClick: handleDelete,
			"aria-label": "Delete chat",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("group relative w-full rounded-xl text-sm transition-colors", isRail ? "px-1.5 py-0.5" : "px-3 py-2.5", !isEditing && !isActive && "hover:bg-muted/60", isActive && "bg-primary/[0.07] ring-1 ring-primary/20", conversation.archivedAt && "opacity-80"),
		children: [isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 p-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				ref: titleInputRef,
				value: editingTitle,
				onChange: handleChangeTitle,
				onKeyDown: handleKeyDown,
				className: "h-8 flex-1",
				placeholder: "Chat title"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "size-8 shrink-0",
				onClick: handleSaveTitle,
				"aria-label": "Save title",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-stretch gap-1 px-1.5 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: handleSelect,
				disabled: isConversationLoading,
				className: cn("min-w-0 flex-1 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", isConversationLoading && "cursor-wait opacity-70"),
				"aria-current": isActive ? "true" : void 0,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2",
					children: [conversation.pinnedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, {
						className: "mt-0.5 size-3.5 shrink-0 text-primary",
						"aria-hidden": true
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("truncate font-medium leading-snug", isActive && "text-foreground"),
								children: title
							}), isLoadingThis ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "size-3.5 shrink-0 animate-spin text-muted-foreground",
								"aria-hidden": true
							}) : relativeTime ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 text-[10px] tabular-nums text-muted-foreground",
								suppressHydrationWarning: true,
								children: relativeTime
							}) : null]
						}), conversation.previewSnippet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground",
							children: conversation.previewSnippet
						}) : typeof conversation.messageCount === "number" && conversation.messageCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 text-xs text-muted-foreground",
							children: [
								conversation.messageCount,
								" message",
								conversation.messageCount === 1 ? "" : "s"
							]
						}) : null]
					})]
				})
			}), menu]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: confirmDeleteOpen,
			onOpenChange: setConfirmDeleteOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
				onClick: stopPropagation,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete this chat?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "This removes the conversation and its messages from your history. This cannot be undone." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: handleConfirmDelete,
					children: "Delete"
				})] })]
			})
		})]
	});
}
function startOfLocalDay(date) {
	const copy = new Date(date);
	copy.setHours(0, 0, 0, 0);
	return copy.getTime();
}
function getAgentHistoryGroup(lastMessageAt, pinnedAt) {
	if (pinnedAt) return "pinned";
	if (!lastMessageAt) return "older";
	const timestamp = new Date(lastMessageAt).getTime();
	if (Number.isNaN(timestamp)) return "older";
	const todayStart = startOfLocalDay(/* @__PURE__ */ new Date());
	const yesterdayStart = todayStart - 1440 * 60 * 1e3;
	const weekStart = todayStart - 8640 * 60 * 1e3;
	if (timestamp >= todayStart) return "today";
	if (timestamp >= yesterdayStart) return "yesterday";
	if (timestamp >= weekStart) return "this_week";
	return "older";
}
var GROUP_LABELS = {
	pinned: "Pinned",
	today: "Today",
	yesterday: "Yesterday",
	this_week: "This week",
	older: "Older"
};
var GROUP_ORDER = [
	"pinned",
	"today",
	"yesterday",
	"this_week",
	"older"
];
function groupAgentHistory(history, options) {
	const includeArchived = options?.includeArchived ?? false;
	const visible = history.filter((entry) => includeArchived || !entry.archivedAt);
	const buckets = /* @__PURE__ */ new Map();
	for (const group of GROUP_ORDER) buckets.set(group, []);
	for (const conversation of visible) {
		const group = getAgentHistoryGroup(conversation.lastMessageAt, conversation.pinnedAt ?? null);
		buckets.get(group)?.push(conversation);
	}
	return GROUP_ORDER.flatMap((group) => {
		const conversations = buckets.get(group) ?? [];
		return conversations.length > 0 ? [{
			group,
			label: GROUP_LABELS[group],
			conversations
		}] : [];
	});
}
function HistorySkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2 p-3",
		children: [
			"history-skeleton-1",
			"history-skeleton-2",
			"history-skeleton-3",
			"history-skeleton-4"
		].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "animate-pulse rounded-xl bg-muted/70 p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-2 h-3 w-2/3 rounded bg-muted-foreground/20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2.5 w-full rounded bg-muted-foreground/15" })]
		}, key))
	});
}
function AgentHistoryRail({ history, isHistoryLoading, historyError, historyHasMore, historySearch, onHistorySearchChange, showArchivedHistory, onShowArchivedHistoryChange, conversationId, messagesCount, isConversationLoading, loadingConversationId, editingConversationId, editingTitle, setEditingTitle, onSelectConversation, onUpdateConversationTitle, onDeleteConversation, onStartNewChat, onClose, onStartEditing, onStopEditing, onRetryHistory, onLoadMoreHistory, onPinConversation, onArchiveConversation, onDuplicateConversation, onExportConversation, onShareConversation, layout = "rail", className }) {
	const grouped = groupAgentHistory(history, { includeArchived: showArchivedHistory });
	const totalVisible = grouped.reduce((sum, section) => sum + section.conversations.length, 0);
	const handleHistorySearchChange = (event) => {
		onHistorySearchChange(event.target.value);
	};
	const handleToggleArchivedHistory = () => {
		onShowArchivedHistoryChange(!showArchivedHistory);
	};
	const handleSelectConversation = (id) => {
		onSelectConversation(id);
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: cn("flex h-full min-h-0 flex-col border-border bg-muted/20", layout === "rail" ? "w-[min(280px,36vw)] shrink-0 border-r max-md:shadow-xl" : "w-full border-b", className),
		"aria-label": "Chat history",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 border-b border-border/60 bg-background/90 px-3 py-2.5 backdrop-blur-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold tracking-tight",
						children: "Chats"
					}), totalVisible > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] text-muted-foreground",
						children: [
							totalVisible,
							" conversation",
							totalVisible === 1 ? "" : "s"
						]
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center gap-1",
					children: [
						isHistoryLoading && history.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "size-4 animate-spin text-muted-foreground",
							"aria-label": "Refreshing chats"
						}) : null,
						conversationId || messagesCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "h-8 gap-1.5 rounded-full px-2.5 text-xs",
							onClick: onStartNewChat,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "size-3.5" }), "New"]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "size-8 rounded-full",
							onClick: onClose,
							"aria-label": "Close history",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 border-b border-border/50 px-3 py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
						className: "pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: historySearch,
						onChange: handleHistorySearchChange,
						placeholder: "Search chats…",
						className: "h-9 rounded-full border-border/70 bg-background pl-8 text-sm",
						"aria-label": "Search chat history"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					variant: showArchivedHistory ? "secondary" : "outline",
					className: "h-7 gap-1.5 rounded-full px-3 text-xs",
					onClick: handleToggleArchivedHistory,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "size-3.5" }), showArchivedHistory ? "Showing archived" : "Archived"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "min-h-0 flex-1",
				children: historyError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "m-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2 text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: "Could not load chats"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: historyError
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						variant: "outline",
						className: "mt-3 gap-2 rounded-full",
						onClick: onRetryHistory,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), "Retry"]
					})]
				}) : isHistoryLoading && history.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistorySkeleton, {}) : grouped.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center justify-center gap-2 px-6 py-12 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-foreground",
						children: historySearch.trim() ? "No matches" : "No chats yet"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-relaxed text-muted-foreground",
						children: historySearch.trim() ? "Try a different title or snippet from a past message." : "Start a new conversation — your history will appear here."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 p-2 pb-4",
					children: [grouped.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "sticky top-0 z-[1] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90 backdrop-blur-sm",
						children: section.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-0.5",
						children: section.conversations.map((conversation) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentConversationItem, {
							variant: "rail",
							conversation,
							conversationId,
							isConversationLoading,
							loadingConversationId,
							editingConversationId,
							editingTitle,
							setEditingTitle,
							onSelectConversation: handleSelectConversation,
							onUpdateConversationTitle,
							onDeleteConversation,
							onStartEditing,
							onStopEditing,
							onPinConversation,
							onArchiveConversation,
							onDuplicateConversation,
							onExportConversation,
							onShareConversation
						}, conversation.id))
					})] }, section.group)), historyHasMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-2 pt-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							className: "w-full rounded-full",
							disabled: isHistoryLoading,
							onClick: onLoadMoreHistory,
							children: isHistoryLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-3.5 animate-spin" }), "Loading…"] }) : "Load more"
						})
					}) : null]
				})
			})
		]
	});
}
var AGENT_TYPING_ICON = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
	className: "size-4 text-primary",
	"aria-hidden": true
});
var EMPTY_AGENT_EXECUTION_STEPS = [];
function stepStatusIcon(status) {
	if (status === "completed") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
		className: "size-3.5 text-primary",
		"aria-hidden": true
	});
	if (status === "failed") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
		className: "size-3.5 text-destructive",
		"aria-hidden": true
	});
	if (status === "active") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
		className: "size-3.5 animate-spin text-primary",
		"aria-hidden": true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
		className: "size-3.5 text-muted-foreground",
		"aria-hidden": true
	});
}
function AgentExecutionTimeline({ steps = EMPTY_AGENT_EXECUTION_STEPS, label }) {
	if (steps.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatTypingIndicator, {
		label,
		variant: "bubble",
		icon: AGENT_TYPING_ICON
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
		className: "flex gap-3",
		"aria-live": "polite",
		"aria-atomic": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/15",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
				className: "size-4 text-primary",
				"aria-hidden": true
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border/60 bg-card/90 p-3 shadow-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-2 space-y-2",
				children: steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start gap-2 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 shrink-0",
						children: stepStatusIcon(step.status)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("font-medium", step.status === "failed" && "text-destructive", step.status === "active" && "text-foreground", step.status === "completed" && "text-foreground", step.status === "pending" && "text-muted-foreground"),
							children: step.label
						}), step.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block text-muted-foreground",
							children: step.detail
						}) : null]
					})]
				}, step.id))
			})]
		})]
	});
}
var AGENT_MESSAGE_WHOLE_NUMBER_FORMATTER = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
function asRecord$1(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function asString(value) {
	return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function asNumber(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function asRecordArray(value) {
	return Array.isArray(value) ? value.flatMap((item) => {
		const record = asRecord$1(item);
		return record !== null ? [record] : [];
	}) : [];
}
function compact(items) {
	return items.filter((item) => item !== null);
}
function resolveCurrencyCode(data) {
	const code = asString(data?.currencyCode) ?? asString(data?.currency);
	if (!code) return "USD";
	const normalized = code.toUpperCase();
	return /^[A-Z]{3}$/.test(normalized) ? normalized : "USD";
}
function formatCurrency(value, currencyCode = "USD") {
	return formatEnUsCurrency(value, currencyCode, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}
function formatWholeNumber(value) {
	return AGENT_MESSAGE_WHOLE_NUMBER_FORMATTER.format(value);
}
function formatPercent(value) {
	return `${value.toFixed(2)}%`;
}
function formatCtrPercent(clicks, impressions, ctr) {
	if (ctr === null) return null;
	if (impressions !== null && impressions > 0 && clicks !== null && clicks > impressions) return `${Math.min(100, Math.min(clicks, impressions) / impressions * 100).toFixed(2)}%`;
	return formatPercent(ctr);
}
function formatRatio(value) {
	return `${value.toFixed(2)}x`;
}
function formatLabel(value) {
	return value.split(/[-_\s]+/).flatMap((part) => part ? [part.charAt(0).toUpperCase() + part.slice(1)] : []).join(" ");
}
function formatTaskDueDate(value) {
	if (typeof value === "number" && Number.isFinite(value)) return new Date(value).toISOString().slice(0, 10);
	if (typeof value === "string" && value.trim().length > 0) return value.trim();
	return null;
}
function formatDateValue(value) {
	if (typeof value === "number" && Number.isFinite(value)) return new Date(value).toISOString().slice(0, 10);
	if (typeof value === "string" && value.trim().length > 0) return value.trim();
	return null;
}
function formatDeltaPercent(value, digits = 1) {
	if (value === null || !Number.isFinite(value) || Math.abs(value) < .01) return null;
	return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}
function getDeltaTone(value, invertTrend = false) {
	if (value === null || !Number.isFinite(value) || Math.abs(value) < .01) return "neutral";
	const positive = value > 0;
	if (invertTrend) return positive ? "negative" : "positive";
	return positive ? "positive" : "negative";
}
function buildMetricsFromAnalyticsTotals(totals, comparison, currencyCode = "USD") {
	if (!totals) return [];
	const users = asNumber(totals.users);
	const sessions = asNumber(totals.sessions);
	const conversions = asNumber(totals.conversions);
	const revenue = asNumber(totals.revenue);
	const conversionRate = asNumber(totals.conversionRate);
	const revenuePerSession = asNumber(totals.revenuePerSession);
	const sessionsPerUser = asNumber(totals.sessionsPerUser);
	const deltaPercent = asRecord$1(comparison?.deltaPercent);
	return compact([
		users !== null ? {
			label: "Users",
			value: formatWholeNumber(users),
			numericValue: users,
			emphasis: "primary",
			delta: formatDeltaPercent(asNumber(deltaPercent?.users)),
			deltaTone: getDeltaTone(asNumber(deltaPercent?.users))
		} : null,
		sessions !== null ? {
			label: "Sessions",
			value: formatWholeNumber(sessions),
			numericValue: sessions,
			emphasis: "primary",
			delta: formatDeltaPercent(asNumber(deltaPercent?.sessions)),
			deltaTone: getDeltaTone(asNumber(deltaPercent?.sessions))
		} : null,
		conversions !== null ? {
			label: "Conversions",
			value: formatWholeNumber(conversions),
			numericValue: conversions,
			delta: formatDeltaPercent(asNumber(deltaPercent?.conversions)),
			deltaTone: getDeltaTone(asNumber(deltaPercent?.conversions))
		} : null,
		revenue !== null ? {
			label: "Revenue",
			value: formatCurrency(revenue, currencyCode),
			numericValue: revenue,
			emphasis: "primary",
			delta: formatDeltaPercent(asNumber(deltaPercent?.revenue)),
			deltaTone: getDeltaTone(asNumber(deltaPercent?.revenue))
		} : null,
		conversionRate !== null ? {
			label: "Conversion Rate",
			value: formatPercent(conversionRate),
			numericValue: conversionRate,
			delta: formatDeltaPercent(asNumber(deltaPercent?.conversionRate)),
			deltaTone: getDeltaTone(asNumber(deltaPercent?.conversionRate))
		} : null,
		revenuePerSession !== null && sessions !== null && sessions > 0 ? {
			label: "Revenue / Session",
			value: formatCurrency(revenuePerSession, currencyCode),
			numericValue: revenuePerSession
		} : null,
		sessionsPerUser !== null && users !== null && users > 0 ? {
			label: "Sessions / User",
			value: sessionsPerUser.toFixed(2),
			numericValue: sessionsPerUser
		} : null
	]);
}
function buildMetricsFromTotals(totals, comparison, currencyCode = "USD") {
	if (!totals) return [];
	const spend = asNumber(totals.spend);
	const revenue = asNumber(totals.revenue);
	const roas = asNumber(totals.roas);
	const impressions = asNumber(totals.impressions);
	const clicks = asNumber(totals.clicks);
	const ctr = asNumber(totals.ctr);
	const cpc = asNumber(totals.cpc);
	const cpa = asNumber(totals.cpa);
	const conversions = asNumber(totals.conversions);
	const deltaPercent = asRecord$1(comparison?.deltaPercent);
	return compact([
		spend !== null ? {
			label: "Spend",
			value: formatCurrency(spend, currencyCode),
			numericValue: spend,
			emphasis: "primary",
			delta: formatDeltaPercent(asNumber(deltaPercent?.spend)),
			deltaTone: getDeltaTone(asNumber(deltaPercent?.spend), true)
		} : null,
		revenue !== null ? {
			label: "Revenue",
			value: formatCurrency(revenue, currencyCode),
			numericValue: revenue,
			emphasis: "primary",
			delta: formatDeltaPercent(asNumber(deltaPercent?.revenue)),
			deltaTone: getDeltaTone(asNumber(deltaPercent?.revenue))
		} : null,
		roas !== null ? {
			label: "ROAS",
			value: formatRatio(roas),
			numericValue: roas,
			emphasis: "primary",
			delta: formatDeltaPercent(asNumber(deltaPercent?.roas)),
			deltaTone: getDeltaTone(asNumber(deltaPercent?.roas))
		} : null,
		impressions !== null ? {
			label: "Impressions",
			value: formatWholeNumber(impressions),
			numericValue: impressions,
			delta: formatDeltaPercent(asNumber(deltaPercent?.impressions)),
			deltaTone: getDeltaTone(asNumber(deltaPercent?.impressions))
		} : null,
		clicks !== null ? {
			label: "Clicks",
			value: formatWholeNumber(clicks),
			numericValue: clicks,
			delta: formatDeltaPercent(asNumber(deltaPercent?.clicks)),
			deltaTone: getDeltaTone(asNumber(deltaPercent?.clicks))
		} : null,
		ctr !== null ? {
			label: "CTR",
			value: formatCtrPercent(clicks, impressions, ctr) ?? formatPercent(ctr),
			numericValue: ctr,
			delta: formatDeltaPercent(asNumber(deltaPercent?.ctr)),
			deltaTone: getDeltaTone(asNumber(deltaPercent?.ctr))
		} : null,
		cpc !== null && clicks !== null && clicks > 0 ? {
			label: "CPC",
			value: formatCurrency(cpc, currencyCode),
			numericValue: cpc
		} : clicks !== null && clicks > 0 ? {
			label: "CPC",
			value: "—"
		} : null,
		cpa !== null && conversions !== null && conversions > 0 ? {
			label: "CPA",
			value: formatCurrency(cpa, currencyCode),
			numericValue: cpa
		} : conversions !== null && conversions > 0 ? {
			label: "CPA",
			value: "—"
		} : null,
		conversions !== null ? {
			label: "Conversions",
			value: formatWholeNumber(conversions),
			numericValue: conversions,
			delta: formatDeltaPercent(asNumber(deltaPercent?.conversions)),
			deltaTone: getDeltaTone(asNumber(deltaPercent?.conversions))
		} : null
	]);
}
function resolveTotals(data) {
	const directTotals = asRecord$1(data.totals);
	if (directTotals) return directTotals;
	const metricsSummary = asRecord$1(data.metricsSummary);
	if (!metricsSummary) return null;
	return asRecord$1(metricsSummary.totals) ?? asRecord$1(asRecord$1(metricsSummary.summary)?.totals);
}
function resolveMetricsAvailable(data) {
	if (typeof data.metricsAvailable === "boolean") return data.metricsAvailable;
	const count = asNumber(asRecord$1(data.metricsSummary)?.count);
	return count !== null ? count > 0 : null;
}
function buildAgentMessageCharts(operation, data) {
	if (!data) return [];
	const charts = [];
	if (resolveMetricsAvailable(data) === false) return charts;
	const dataKind = asString(data.dataKind);
	const isAnalytics = operation === "summarizeAnalyticsPerformance" || dataKind === "analytics";
	const isSocial = operation === "summarizeSocialPerformance" || dataKind === "social";
	const deltaPercent = asRecord$1(asRecord$1(data.comparison)?.deltaPercent);
	const totals = isAnalytics ? asRecord$1(data.totals) : resolveTotals(data);
	const currencyCode = resolveCurrencyCode(data);
	if (totals && isAnalytics) {
		const users = asNumber(totals.users);
		const sessions = asNumber(totals.sessions);
		const conversions = asNumber(totals.conversions);
		const trafficPoints = compact([
			users !== null && users > 0 ? {
				name: "Users",
				value: users
			} : null,
			sessions !== null && sessions > 0 ? {
				name: "Sessions",
				value: sessions
			} : null,
			conversions !== null && conversions > 0 ? {
				name: "Conversions",
				value: conversions
			} : null
		]);
		if (trafficPoints.length >= 2) charts.push({
			id: "analytics-traffic",
			title: "Traffic volume",
			points: trafficPoints,
			valueFormat: "number",
			layout: "horizontal"
		});
	}
	if (totals && !isAnalytics) {
		const spend = asNumber(totals.spend);
		const revenue = asNumber(totals.revenue);
		const financialPoints = compact([spend !== null && spend > 0 ? {
			name: "Spend",
			value: spend
		} : null, revenue !== null && revenue > 0 ? {
			name: "Revenue",
			value: revenue
		} : null]);
		if (financialPoints.length >= 1) charts.push({
			id: "financial",
			title: financialPoints.length >= 2 ? "Spend vs revenue" : financialPoints[0]?.name ?? "Spend",
			subtitle: "Synced totals for this window",
			points: financialPoints,
			valueFormat: "currency",
			currencyCode,
			layout: "vertical"
		});
		const deliveryPoints = compact([
			asNumber(totals.impressions) !== null && (asNumber(totals.impressions) ?? 0) > 0 ? {
				name: "Impressions",
				value: asNumber(totals.impressions)
			} : null,
			asNumber(totals.clicks) !== null && (asNumber(totals.clicks) ?? 0) > 0 ? {
				name: "Clicks",
				value: asNumber(totals.clicks)
			} : null,
			asNumber(totals.conversions) !== null && (asNumber(totals.conversions) ?? 0) > 0 ? {
				name: "Conversions",
				value: asNumber(totals.conversions)
			} : null
		]);
		if (deliveryPoints.length >= 1) charts.push({
			id: "delivery",
			title: "Delivery volume",
			points: deliveryPoints,
			valueFormat: "number",
			layout: "horizontal"
		});
	}
	if (deltaPercent) {
		const filteredDeltaPoints = (isAnalytics ? compact([
			asNumber(deltaPercent.users) !== null ? {
				name: "Users",
				value: asNumber(deltaPercent.users)
			} : null,
			asNumber(deltaPercent.sessions) !== null ? {
				name: "Sessions",
				value: asNumber(deltaPercent.sessions)
			} : null,
			asNumber(deltaPercent.conversions) !== null ? {
				name: "Conversions",
				value: asNumber(deltaPercent.conversions)
			} : null,
			asNumber(deltaPercent.revenue) !== null ? {
				name: "Revenue",
				value: asNumber(deltaPercent.revenue)
			} : null
		]) : compact([
			asNumber(deltaPercent.spend) !== null ? {
				name: "Spend",
				value: asNumber(deltaPercent.spend)
			} : null,
			asNumber(deltaPercent.revenue) !== null ? {
				name: "Revenue",
				value: asNumber(deltaPercent.revenue)
			} : null,
			asNumber(deltaPercent.roas) !== null ? {
				name: "ROAS",
				value: asNumber(deltaPercent.roas)
			} : null,
			asNumber(deltaPercent.conversions) !== null ? {
				name: "Conversions",
				value: asNumber(deltaPercent.conversions)
			} : null
		])).filter((point) => Math.abs(point.value) >= .05 && Math.abs(point.value) <= 300);
		if (filteredDeltaPoints.length >= 2) charts.push({
			id: isAnalytics ? "analytics-period-delta" : "period-delta",
			title: "Period change",
			subtitle: "Percent vs previous window",
			points: filteredDeltaPoints,
			valueFormat: "percent",
			layout: "horizontal"
		});
	}
	const providerBreakdown = asRecordArray(data.providerBreakdown);
	if (providerBreakdown.length > 0) {
		const points = providerBreakdown.flatMap((provider) => {
			const spend = asNumber(asRecord$1(provider.totals)?.spend);
			if (spend === null || spend <= 0) return [];
			const providerId = asString(provider.providerId) ?? "unknown";
			return [{
				name: asString(provider.label) ?? formatProviderName(providerId),
				value: spend
			}];
		});
		if (points.length >= 1) charts.push({
			id: "providers",
			title: "Spend by platform",
			points,
			valueFormat: "currency",
			currencyCode,
			layout: "horizontal"
		});
	}
	const topCampaigns = asRecordArray(data.topCampaigns);
	if (topCampaigns.length > 0) {
		const points = compact(topCampaigns.map((campaign) => {
			const spend = asNumber(campaign.spend);
			if (spend === null || spend <= 0) return null;
			const name = asString(campaign.name) ?? "Campaign";
			return {
				name: name.length > 28 ? `${name.slice(0, 26)}…` : name,
				value: spend,
				href: asString(campaign.route) ?? void 0
			};
		}));
		if (points.length >= 1) charts.push({
			id: "top-campaigns",
			title: "Top campaigns by spend",
			points: points.slice(0, 5),
			valueFormat: "currency",
			currencyCode,
			layout: "horizontal"
		});
	}
	const currencyBreakdown = asRecordArray(data.currencyBreakdown);
	if (currencyBreakdown.length >= 1 && !isAnalytics && !isSocial) {
		const points = currencyBreakdown.flatMap((row) => {
			const spend = asNumber(row.spend);
			if (spend === null || spend <= 0) return [];
			return {
				name: asString(row.currency) ?? "USD",
				value: spend
			};
		});
		if (points.length >= 1) charts.push({
			id: "currency-breakdown",
			title: "Spend by currency",
			points,
			valueFormat: "currency",
			currencyCode,
			layout: "horizontal"
		});
	}
	if (isSocial) for (const surface of ["facebook", "instagram"]) {
		const surfaceData = asRecord$1(data[surface]);
		if (!surfaceData) continue;
		const engagementPoints = compact([
			asNumber(surfaceData.reach) !== null && (asNumber(surfaceData.reach) ?? 0) > 0 ? {
				name: "Reach",
				value: asNumber(surfaceData.reach)
			} : null,
			asNumber(surfaceData.impressions) !== null && (asNumber(surfaceData.impressions) ?? 0) > 0 ? {
				name: "Impressions",
				value: asNumber(surfaceData.impressions)
			} : null,
			asNumber(surfaceData.engagedUsers) !== null && (asNumber(surfaceData.engagedUsers) ?? 0) > 0 ? {
				name: "Engaged Users",
				value: asNumber(surfaceData.engagedUsers)
			} : null
		]);
		if (engagementPoints.length >= 2) charts.push({
			id: `social-${surface}`,
			title: `${formatLabel(surface)} reach & engagement`,
			points: engagementPoints,
			valueFormat: "number",
			layout: "horizontal"
		});
		const postPoints = compact(asRecordArray(asRecord$1(data.topContent)?.[surface]).map((post, index) => {
			const reach = asNumber(post.reach) ?? asNumber(post.engagedUsers);
			if (reach === null || reach <= 0) return null;
			const preview = asString(post.message);
			return {
				name: preview && preview.length > 0 ? preview.length > 24 ? `${preview.slice(0, 22)}…` : preview : `Post ${index + 1}`,
				value: reach
			};
		})).slice(0, 5);
		if (postPoints.length >= 2) charts.push({
			id: `social-top-${surface}`,
			title: `Top ${formatLabel(surface)} posts by reach`,
			points: postPoints,
			valueFormat: "number",
			layout: "horizontal"
		});
	}
	if (operation === "summarizeClientTasks" || operation === "summarizeMyTasks") {
		const statusPoints = asRecordArray(data.statusBreakdown).flatMap((entry) => {
			const count = asNumber(entry.count);
			if (count === null || count <= 0) return [];
			return [{
				name: formatLabel(asString(entry.status) ?? "unknown"),
				value: count
			}];
		});
		if (statusPoints.length >= 2) charts.push({
			id: "task-status",
			title: "Tasks by status",
			points: statusPoints,
			valueFormat: "number",
			layout: "horizontal"
		});
	}
	return charts;
}
function buildAgentDataSections(operation, data) {
	if (!data) return [];
	const sections = [];
	const details = [];
	const periodLabel = asString(data.periodLabel);
	const providerLabel = asString(data.providerLabel);
	const startDate = asString(data.startDate);
	const endDate = asString(data.endDate);
	const comparison = asRecord$1(data.comparison);
	const previousWindow = asRecord$1(comparison?.previousWindow) ?? asRecord$1(data.previousWindow);
	const campaignQuery = asString(data.campaignQuery);
	const matchedCampaignCount = asNumber(data.matchedCampaignCount);
	const metricsAvailable = resolveMetricsAvailable(data);
	const currencyCode = resolveCurrencyCode(data);
	const dataKind = asString(data.dataKind);
	const isAnalytics = operation === "summarizeAnalyticsPerformance" || dataKind === "analytics";
	const isSocial = operation === "summarizeSocialPerformance" || dataKind === "social";
	if (periodLabel) details.push({
		label: "Window",
		value: periodLabel
	});
	if (startDate || endDate) details.push({
		label: "Dates",
		value: startDate && endDate ? `${startDate} → ${endDate}` : startDate ?? endDate ?? ""
	});
	if (providerLabel) details.push({
		label: "Source",
		value: providerLabel
	});
	if (currencyCode && currencyCode !== "USD") details.push({
		label: "Currency",
		value: currencyCode
	});
	if (metricsAvailable === false) details.push({
		label: isAnalytics ? "Analytics Data" : isSocial ? "Social Data" : "Ads Data",
		value: isAnalytics ? "No synced Google Analytics traffic in this window" : isSocial ? "No synced organic social metrics in this window" : "No synced metrics in this window"
	});
	if (campaignQuery) details.push({
		label: "Campaign Filter",
		value: campaignQuery
	});
	if (matchedCampaignCount !== null) details.push({
		label: "Matches",
		value: formatWholeNumber(matchedCampaignCount)
	});
	if (previousWindow) {
		const prevStart = asString(previousWindow.startDate);
		const prevEnd = asString(previousWindow.endDate);
		if (prevStart || prevEnd) details.push({
			label: "Compared To",
			value: prevStart && prevEnd ? `${prevStart} → ${prevEnd}` : prevStart ?? prevEnd ?? ""
		});
	}
	const campaignCounts = asRecord$1(data.campaignCounts);
	if (campaignCounts && !isAnalytics) {
		const active = asNumber(campaignCounts.active);
		const paused = asNumber(campaignCounts.paused);
		const total = asNumber(campaignCounts.total);
		if (total !== null) details.push({
			label: "Campaigns",
			value: `${formatWholeNumber(total)} total`
		});
		if (active !== null) details.push({
			label: "Active",
			value: formatWholeNumber(active)
		});
		if (paused !== null) details.push({
			label: "Paused",
			value: formatWholeNumber(paused)
		});
	}
	const currentSituation = asString(data.currentSituation);
	if (currentSituation) sections.push({
		type: "metrics",
		title: "Insight",
		items: [{
			label: "Summary",
			value: currentSituation
		}]
	});
	if (details.length > 0) sections.push({
		type: "metrics",
		title: "Overview",
		items: details
	});
	const metricsScopeNote = asString(data.metricsScopeNote);
	const syncHint = asString(data.syncHint);
	const syncTimeframeDays = asNumber(data.syncTimeframeDays);
	const suggestedActionRoute = asString(data.suggestedActionRoute);
	const insightsWarnings = Array.isArray(data.insightsWarnings) ? data.insightsWarnings.flatMap((warning) => {
		const message = asString(warning);
		return message ? [message] : [];
	}) : [];
	const syncedDays = asNumber(data.syncedDays);
	if (metricsScopeNote) details.push({
		label: "Scope",
		value: metricsScopeNote
	});
	if (syncTimeframeDays !== null) details.push({
		label: "Sync Window",
		value: `Last ${formatWholeNumber(syncTimeframeDays)} days`
	});
	if (syncHint) details.push({
		label: "Sync",
		value: syncHint
	});
	if (suggestedActionRoute) details.push({
		label: "Open",
		value: suggestedActionRoute
	});
	if (syncedDays !== null && isAnalytics) details.push({
		label: "Synced Days",
		value: formatWholeNumber(syncedDays)
	});
	for (const warning of insightsWarnings.slice(0, 2)) details.push({
		label: "Note",
		value: warning
	});
	const totalsMetrics = isAnalytics ? buildMetricsFromAnalyticsTotals(asRecord$1(data.totals), comparison, currencyCode) : isSocial ? [] : buildMetricsFromTotals(resolveTotals(data), comparison, currencyCode);
	if (totalsMetrics.length > 0 && metricsAvailable !== false) sections.push({
		type: "metrics",
		title: isAnalytics ? "Traffic & Conversions" : "Performance",
		items: totalsMetrics
	});
	const providerBreakdown = asRecordArray(data.providerBreakdown);
	if (providerBreakdown.length > 0 && metricsAvailable !== false && !isAnalytics && !isSocial) sections.push({
		type: "list",
		title: "Platform Breakdown",
		items: providerBreakdown.slice(0, 4).map((provider) => {
			const providerId = asString(provider.providerId) ?? "unknown";
			const totals = asRecord$1(provider.totals);
			const deltaPercent = asRecord$1(provider.deltaPercent);
			const spend = asNumber(totals?.spend);
			const roas = asNumber(totals?.roas);
			const conversionsValue = asNumber(totals?.conversions);
			const deltaValue = asNumber(deltaPercent?.roas) ?? asNumber(deltaPercent?.revenue) ?? asNumber(deltaPercent?.spend);
			return {
				primary: asString(provider.label) ?? formatProviderName(providerId),
				secondary: [
					spend !== null ? formatCurrency(spend, currencyCode) : null,
					roas !== null ? `${formatRatio(roas)} ROAS` : null,
					conversionsValue !== null ? `${formatWholeNumber(conversionsValue)} conv` : null
				].filter((item) => Boolean(item)).join(" • ") || void 0,
				numericValue: spend ?? void 0,
				delta: formatDeltaPercent(deltaValue),
				deltaTone: getDeltaTone(deltaValue)
			};
		})
	});
	const activeCampaigns = asRecordArray(data.activeCampaigns);
	if (activeCampaigns.length > 0 && !isAnalytics && !isSocial) sections.push({
		type: "list",
		title: campaignQuery ? "Matching Campaigns" : "Active Campaigns",
		items: activeCampaigns.slice(0, 6).map((campaign) => ({
			primary: asString(campaign.name) ?? "Unnamed campaign",
			secondary: formatProviderName(asString(campaign.providerId) ?? "unknown"),
			href: asString(campaign.route)
		}))
	});
	const currencyBreakdown = asRecordArray(data.currencyBreakdown);
	if (currencyBreakdown.length > 0 && !isAnalytics && !isSocial) sections.push({
		type: "list",
		title: "Spend by currency",
		items: currencyBreakdown.map((row) => {
			const currency = asString(row.currency) ?? "USD";
			const spend = asNumber(row.spend);
			const revenue = asNumber(row.revenue);
			return {
				primary: currency,
				secondary: [spend !== null ? `${formatCurrency(spend, currency)} spend` : null, revenue !== null ? `${formatCurrency(revenue, currency)} revenue` : null].filter((item) => Boolean(item)).join(" • ") || void 0,
				numericValue: spend ?? void 0
			};
		})
	});
	const topCampaigns = asRecordArray(data.topCampaigns);
	if (topCampaigns.length > 0 && !isAnalytics && !isSocial) sections.push({
		type: "list",
		title: "Top Campaigns",
		items: topCampaigns.slice(0, 5).map((campaign) => {
			const spend = asNumber(campaign.spend);
			const roas = asNumber(campaign.roas);
			const conversions = asNumber(campaign.conversions);
			const pieces = [
				spend !== null ? formatCurrency(spend, currencyCode) : null,
				roas !== null ? `${formatRatio(roas)} ROAS` : null,
				conversions !== null ? `${formatWholeNumber(conversions)} conv` : null
			].filter((item) => Boolean(item));
			return {
				primary: asString(campaign.name) ?? "Unnamed campaign",
				secondary: pieces.join(" • ") || void 0,
				href: asString(campaign.route),
				numericValue: spend ?? void 0
			};
		})
	});
	if (operation === "summarizeSocialPerformance") {
		const connection = asRecord$1(data.connection);
		const connectionItems = compact([
			connection?.connected === true ? {
				label: "Meta",
				value: "Connected",
				emphasis: "primary"
			} : {
				label: "Meta",
				value: "Not connected"
			},
			asString(connection?.facebookPageName) ? {
				label: "Facebook Page",
				value: asString(connection?.facebookPageName)
			} : null,
			asString(connection?.instagramBusinessName) ? {
				label: "Instagram",
				value: asString(connection?.instagramBusinessName)
			} : null,
			asString(connection?.lastSyncStatus) ? {
				label: "Sync",
				value: formatLabel(asString(connection?.lastSyncStatus))
			} : null
		]);
		if (connectionItems.length > 0) sections.push({
			type: "metrics",
			title: "Connection",
			items: connectionItems
		});
		const appendSurfaceMetrics = (surface, title) => {
			if (!surface) return;
			const reach = asNumber(surface.reach);
			const engagedUsers = asNumber(surface.engagedUsers);
			const impressions = asNumber(surface.impressions);
			const engagementRate = asNumber(surface.engagementRate);
			const followerDelta = asNumber(surface.followerDeltaTotal);
			const items = compact([
				reach !== null ? {
					label: "Reach",
					value: formatWholeNumber(reach),
					numericValue: reach,
					emphasis: "primary"
				} : null,
				impressions !== null ? {
					label: "Impressions",
					value: formatWholeNumber(impressions),
					numericValue: impressions
				} : null,
				engagedUsers !== null ? {
					label: "Engaged Users",
					value: formatWholeNumber(engagedUsers),
					numericValue: engagedUsers
				} : null,
				engagementRate !== null ? {
					label: "Engagement Rate",
					value: formatPercent(engagementRate),
					numericValue: engagementRate
				} : null,
				followerDelta !== null && followerDelta !== 0 ? {
					label: "Follower Change",
					value: `${followerDelta > 0 ? "+" : ""}${formatWholeNumber(followerDelta)}`,
					numericValue: followerDelta
				} : null
			]);
			if (items.length > 0) sections.push({
				type: "metrics",
				title,
				items
			});
		};
		appendSurfaceMetrics(asRecord$1(data.facebook), "Facebook");
		appendSurfaceMetrics(asRecord$1(data.instagram), "Instagram");
		const topContent = asRecord$1(data.topContent);
		for (const surface of ["facebook", "instagram"]) {
			const posts = asRecordArray(topContent?.[surface]);
			if (posts.length === 0) continue;
			sections.push({
				type: "list",
				title: `Top ${formatLabel(surface)} Posts`,
				items: posts.map((post) => {
					const reach = asNumber(post.reach);
					const engaged = asNumber(post.engagedUsers);
					const preview = asString(post.message);
					return {
						primary: preview && preview.length > 0 ? preview.length > 72 ? `${preview.slice(0, 69)}…` : preview : "Post",
						secondary: [
							reach !== null ? `${formatWholeNumber(reach)} reach` : null,
							engaged !== null ? `${formatWholeNumber(engaged)} engaged` : null,
							asString(post.publishedAt) ? asString(post.publishedAt) : null
						].filter((item) => Boolean(item)).join(" • ") || void 0
					};
				})
			});
		}
	}
	if (operation === "requestSocialSync") {
		const jobId = asString(data.jobId);
		const timeframeDays = asNumber(data.timeframeDays);
		const surface = asString(data.surface);
		const syncItems = compact([
			jobId ? {
				label: "Sync Job",
				value: jobId
			} : null,
			timeframeDays !== null ? {
				label: "Window",
				value: `Last ${formatWholeNumber(timeframeDays)} days`
			} : null,
			surface ? {
				label: "Surfaces",
				value: formatLabel(surface)
			} : null
		]);
		if (syncItems.length > 0) sections.push({
			type: "metrics",
			title: "Sync Requested",
			items: syncItems
		});
	}
	const proposalSummary = asRecord$1(data.proposalSummary);
	const delivery = asRecord$1(data.delivery);
	const reportItems = [];
	const totalSubmitted = asNumber(proposalSummary?.totalSubmitted);
	const aiSuccessRate = asNumber(proposalSummary?.aiSuccessRate);
	const deliveredInApp = typeof delivery?.inApp === "boolean" ? delivery.inApp : null;
	if (metricsAvailable === false) reportItems.push({
		label: "Ads Data",
		value: "Awaiting synced metrics"
	});
	if (totalSubmitted !== null) reportItems.push({
		label: "Proposals",
		value: formatWholeNumber(totalSubmitted),
		numericValue: totalSubmitted
	});
	if (aiSuccessRate !== null) reportItems.push({
		label: "AI Success",
		value: formatPercent(aiSuccessRate),
		numericValue: aiSuccessRate
	});
	if (deliveredInApp !== null) reportItems.push({
		label: "In-app Delivery",
		value: deliveredInApp ? "Delivered" : "Not delivered"
	});
	if (operation === "generatePerformanceReport" && reportItems.length > 0) sections.push({
		type: "metrics",
		title: "Report Highlights",
		items: reportItems
	});
	const totalTasks = asNumber(data.totalTasks);
	const openTasks = asNumber(data.openTasks);
	const completedTasks = asNumber(data.completedTasks);
	const overdueTasks = asNumber(data.overdueTasks);
	const dueSoonTasks = asNumber(data.dueSoonTasks);
	const highPriorityTasks = asNumber(data.highPriorityTasks);
	const clientName = asString(data.clientName);
	if (operation === "summarizeClientTasks" || operation === "summarizeMyTasks") {
		const timeWindowLabel = asString(data.timeWindowLabel);
		const dueThisWeekTasks = asNumber(data.dueThisWeekTasks);
		const unscheduledOpen = asNumber(data.unscheduledOpen);
		const taskSummaryItems = compact([
			clientName ? {
				label: "Client",
				value: clientName
			} : null,
			timeWindowLabel ? {
				label: "Focus",
				value: timeWindowLabel
			} : null,
			totalTasks !== null ? {
				label: "Total Tasks",
				value: formatWholeNumber(totalTasks),
				numericValue: totalTasks,
				emphasis: "primary"
			} : null,
			openTasks !== null ? {
				label: "Open",
				value: formatWholeNumber(openTasks),
				numericValue: openTasks,
				emphasis: "primary"
			} : null,
			completedTasks !== null ? {
				label: "Completed",
				value: formatWholeNumber(completedTasks),
				numericValue: completedTasks
			} : null,
			overdueTasks !== null ? {
				label: "Overdue",
				value: formatWholeNumber(overdueTasks),
				numericValue: overdueTasks
			} : null,
			dueThisWeekTasks !== null ? {
				label: "Due This Week",
				value: formatWholeNumber(dueThisWeekTasks),
				numericValue: dueThisWeekTasks
			} : null,
			dueSoonTasks !== null ? {
				label: "Due Soon",
				value: formatWholeNumber(dueSoonTasks),
				numericValue: dueSoonTasks
			} : null,
			highPriorityTasks !== null ? {
				label: "High Priority",
				value: formatWholeNumber(highPriorityTasks),
				numericValue: highPriorityTasks
			} : null,
			unscheduledOpen !== null && unscheduledOpen > 0 ? {
				label: "No Due Date",
				value: formatWholeNumber(unscheduledOpen),
				numericValue: unscheduledOpen
			} : null
		]);
		if (taskSummaryItems.length > 0) sections.push({
			type: "metrics",
			title: "Task Summary",
			items: taskSummaryItems
		});
		const statusBreakdown = asRecordArray(data.statusBreakdown);
		if (statusBreakdown.length > 0) sections.push({
			type: "metrics",
			title: "Status Breakdown",
			items: statusBreakdown.slice(0, 5).map((entry) => ({
				label: formatLabel(asString(entry.status) ?? "unknown"),
				value: formatWholeNumber(asNumber(entry.count) ?? 0),
				numericValue: asNumber(entry.count) ?? 0
			}))
		});
		const mapTaskListItems = (tasks) => tasks.slice(0, 8).map((task) => {
			const status = asString(task.status);
			const priority = asString(task.priority);
			const dueDate = asString(task.dueLabel) ?? formatTaskDueDate(asNumber(task.dueDate) ?? asString(task.dueDate));
			const taskClientName = asString(task.clientName);
			const projectName = asString(task.projectName);
			const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo.filter((entry) => typeof entry === "string" && entry.trim().length > 0) : [];
			const secondary = [
				dueDate,
				status ? formatLabel(status) : null,
				priority ? formatLabel(priority) : null,
				taskClientName,
				projectName,
				assignedTo.length > 0 ? assignedTo.join(", ") : null
			].filter((item) => Boolean(item)).join(" • ");
			return {
				primary: asString(task.title) ?? "Untitled task",
				secondary: secondary || void 0
			};
		});
		const focusTasks = asRecordArray(data.focusTasks);
		const timeWindow = asString(data.timeWindow);
		if (focusTasks.length > 0 && timeWindow && timeWindow !== "all") sections.push({
			type: "list",
			title: timeWindowLabel ?? "Focused Tasks",
			items: mapTaskListItems(focusTasks)
		});
		const overdueTaskList = asRecordArray(data.overdueTaskList);
		if (overdueTaskList.length > 0 && timeWindow === "all") sections.push({
			type: "list",
			title: "Overdue",
			items: mapTaskListItems(overdueTaskList)
		});
		const dueThisWeekList = asRecordArray(data.dueThisWeekList);
		if (dueThisWeekList.length > 0 && timeWindow === "all") sections.push({
			type: "list",
			title: "Due This Week",
			items: mapTaskListItems(dueThisWeekList)
		});
		const dueSoonList = asRecordArray(data.dueSoonList);
		if (dueSoonList.length > 0) sections.push({
			type: "list",
			title: "Due Soon",
			items: mapTaskListItems(dueSoonList)
		});
		const highPriorityList = asRecordArray(data.highPriorityList);
		if (highPriorityList.length > 0) sections.push({
			type: "list",
			title: "High Priority",
			items: mapTaskListItems(highPriorityList)
		});
		const tasks = asRecordArray(data.tasks);
		if (tasks.length > 0 && (timeWindow === "all" || focusTasks.length === 0)) sections.push({
			type: "list",
			title: "Tasks",
			items: mapTaskListItems(tasks)
		});
	}
	if (operation === "listWorkspaceClients") {
		const total = asNumber(data.total);
		const clients = asRecordArray(data.clients);
		const clientOverview = compact([total !== null ? {
			label: "Clients",
			value: formatWholeNumber(total),
			numericValue: total,
			emphasis: "primary"
		} : null]);
		if (clientOverview.length > 0) sections.push({
			type: "metrics",
			title: "Clients",
			items: clientOverview
		});
		if (clients.length > 0) sections.push({
			type: "list",
			title: "Workspace Clients",
			items: clients.slice(0, 12).map((client) => ({
				primary: asString(client.name) ?? "Unnamed client",
				secondary: asString(client.clientId) ?? void 0
			}))
		});
	}
	if (operation === "listActiveProjects") {
		const total = asNumber(data.total);
		const projects = asRecordArray(data.projects);
		const projectOverview = compact([total !== null ? {
			label: "Active Projects",
			value: formatWholeNumber(total),
			numericValue: total,
			emphasis: "primary"
		} : null]);
		if (projectOverview.length > 0) sections.push({
			type: "metrics",
			title: "Projects",
			items: projectOverview
		});
		if (projects.length > 0) sections.push({
			type: "list",
			title: "Active Projects",
			items: projects.map((project) => ({
				primary: asString(project.name) ?? "Unnamed project",
				secondary: [asString(project.clientName), asString(project.status) ? formatLabel(asString(project.status)) : null].filter((item) => Boolean(item)).join(" • ") || void 0,
				href: asString(project.route)
			}))
		});
	}
	if (operation === "listProposals") {
		const total = asNumber(data.total);
		const proposals = asRecordArray(data.proposals);
		const proposalOverview = compact([total !== null ? {
			label: "Proposals",
			value: formatWholeNumber(total),
			numericValue: total,
			emphasis: "primary"
		} : null]);
		if (proposalOverview.length > 0) sections.push({
			type: "metrics",
			title: "Proposals",
			items: proposalOverview
		});
		if (proposals.length > 0) sections.push({
			type: "list",
			title: "Proposal Drafts",
			items: proposals.map((proposal) => ({
				primary: asString(proposal.title) ?? "Untitled proposal",
				secondary: [
					asString(proposal.clientName),
					asString(proposal.status) ? formatLabel(asString(proposal.status)) : null,
					asNumber(proposal.stepProgress) !== null ? `${formatWholeNumber(asNumber(proposal.stepProgress))}% complete` : null
				].filter((item) => Boolean(item)).join(" • ") || void 0,
				href: asString(proposal.route)
			}))
		});
	}
	if (operation === "summarizeMeetings") {
		const total = asNumber(data.total);
		const withNotes = asNumber(data.withNotes);
		const meetings = asRecordArray(data.meetings);
		const meetingOverview = compact([total !== null ? {
			label: "Meetings",
			value: formatWholeNumber(total),
			numericValue: total,
			emphasis: "primary"
		} : null, withNotes !== null ? {
			label: "With Notes",
			value: formatWholeNumber(withNotes),
			numericValue: withNotes
		} : null]);
		if (meetingOverview.length > 0) sections.push({
			type: "metrics",
			title: "Meetings",
			items: meetingOverview
		});
		if (meetings.length > 0) sections.push({
			type: "list",
			title: "Upcoming & Recent",
			items: meetings.map((meeting) => ({
				primary: asString(meeting.title) ?? "Untitled meeting",
				secondary: [
					asString(meeting.when),
					asString(meeting.status) ? formatLabel(asString(meeting.status)) : null,
					meeting.hasTranscript === true ? "Transcript available" : null
				].filter((item) => Boolean(item)).join(" • ") || void 0,
				href: asString(meeting.route)
			}))
		});
	}
	if (operation === "markAllNotificationsRead") {
		const marked = asNumber(data.marked);
		if (marked !== null) sections.push({
			type: "metrics",
			title: "Notifications",
			items: [{
				label: "Marked Read",
				value: formatWholeNumber(marked),
				numericValue: marked,
				emphasis: "primary"
			}]
		});
	}
	if (operation === "requestAdsSync" || operation === "requestAnalyticsSync" || operation === "requestSocialSync") {
		const syncItems = compact([
			asNumber(data.syncTimeframeDays) !== null ? {
				label: "Sync Window",
				value: `Last ${formatWholeNumber(asNumber(data.syncTimeframeDays))} days`
			} : null,
			asString(data.surface) ? {
				label: "Surface",
				value: formatLabel(asString(data.surface))
			} : null,
			asString(data.syncHint) ? {
				label: "Status",
				value: asString(data.syncHint)
			} : null,
			asString(data.jobId) ? {
				label: "Job",
				value: asString(data.jobId)
			} : null,
			asString(data.suggestedActionRoute) ? {
				label: "Open",
				value: asString(data.suggestedActionRoute)
			} : null
		]);
		if (syncItems.length > 0) sections.push({
			type: "metrics",
			title: "Sync",
			items: syncItems
		});
	}
	if (operation === "generatePerformanceReport") {
		const reportText = asString(data.reportText);
		if (reportText) {
			const preview = reportText.length > 480 ? `${reportText.slice(0, 477)}…` : reportText;
			sections.push({
				type: "metrics",
				title: "Report",
				items: [{
					label: "Summary",
					value: preview
				}]
			});
		}
	}
	if (operation === "createProject" || operation === "updateProject") {
		const projectName = asString(data.name);
		const projectId = asString(data.projectId);
		const projectStatus = asString(data.status);
		const projectClientName = asString(data.clientName);
		const startDateValue = formatDateValue(asNumber(data.startDateMs) ?? asString(data.startDate));
		const endDateValue = formatDateValue(asNumber(data.endDateMs) ?? asString(data.endDate));
		const tags = Array.isArray(data.tags) ? data.tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0) : [];
		const updatedFields = Array.isArray(data.updatedFields) ? data.updatedFields.filter((field) => typeof field === "string" && field.trim().length > 0) : [];
		const projectItems = compact([
			projectName ? {
				label: "Project",
				value: projectName
			} : null,
			projectId ? {
				label: "Project ID",
				value: projectId
			} : null,
			projectStatus ? {
				label: "Status",
				value: formatLabel(projectStatus)
			} : null,
			projectClientName ? {
				label: "Client",
				value: projectClientName
			} : null,
			startDateValue ? {
				label: "Start Date",
				value: startDateValue
			} : null,
			endDateValue ? {
				label: "End Date",
				value: endDateValue
			} : null,
			tags.length > 0 ? {
				label: "Tags",
				value: tags.join(", ")
			} : null
		]);
		if (projectItems.length > 0) sections.push({
			type: "metrics",
			title: "Project Details",
			items: projectItems
		});
		if (updatedFields.length > 0) sections.push({
			type: "list",
			title: "Updated Fields",
			items: updatedFields.map((field) => ({ primary: formatLabel(field) }))
		});
	}
	if (sections.length === 0 || operation === "createTask" || operation === "sendDirectMessage" || operation === "createClient" || operation === "addClientTeamMember" || operation === "updateTask" || operation === "createProposalDraft" || operation === "generateProposalFromDraft" || operation === "updateProposalDraft" || operation === "updateAdsCampaignStatus" || operation === "updateAdsCreativeStatus") {
		const title = asString(data.title) ?? asString(data.name);
		const taskId = asString(data.taskId);
		const projectId = asString(data.projectId);
		const clientId = asString(data.clientId);
		const proposalId = asString(data.proposalId);
		const campaignId = asString(data.campaignId);
		const creativeId = asString(data.creativeId);
		const providerId = asString(data.providerId);
		const recipientName = asString(data.recipientName);
		const preview = asString(data.preview);
		const status = asString(data.status);
		const action = asString(data.action);
		const role = asString(data.role);
		const route = asString(data.route);
		const stepProgress = asNumber(data.stepProgress);
		const updatedFields = Array.isArray(data.updatedFields) ? data.updatedFields.filter((field) => typeof field === "string" && field.trim().length > 0) : [];
		const genericItems = compact([
			title ? {
				label: "Title",
				value: title
			} : null,
			taskId ? {
				label: "Task ID",
				value: taskId
			} : null,
			projectId ? {
				label: "Project ID",
				value: projectId
			} : null,
			clientId ? {
				label: "Client ID",
				value: clientId
			} : null,
			proposalId ? {
				label: "Proposal ID",
				value: proposalId
			} : null,
			campaignId ? {
				label: "Campaign ID",
				value: campaignId
			} : null,
			creativeId ? {
				label: "Creative ID",
				value: creativeId
			} : null,
			providerId ? {
				label: "Platform",
				value: formatProviderName(providerId)
			} : null,
			recipientName ? {
				label: "Recipient",
				value: recipientName
			} : null,
			preview ? {
				label: "Message",
				value: preview
			} : null,
			role ? {
				label: "Role",
				value: role
			} : null,
			status ? {
				label: "Status",
				value: formatLabel(status)
			} : null,
			action ? {
				label: "Action",
				value: formatLabel(action)
			} : null,
			stepProgress !== null ? {
				label: "Progress",
				value: `${formatWholeNumber(stepProgress)}%`
			} : null,
			route ? {
				label: "Open",
				value: route
			} : null
		]);
		if (genericItems.length > 0) {
			if (!sections.some((section) => section.title === "Details")) sections.push({
				type: "metrics",
				title: "Details",
				items: genericItems
			});
		}
		if (updatedFields.length > 0 && !sections.some((section) => section.title === "Updated Fields")) sections.push({
			type: "list",
			title: "Updated Fields",
			items: updatedFields.map((field) => ({ primary: formatLabel(field) }))
		});
	}
	return sections;
}
function getAgentChartFill(index) {
	return getChartColor(index);
}
var AGENT_CHART_BAR_INITIAL = { width: 0 };
var AGENT_CHART_BAR_TRANSITION = {
	duration: motionDurationSeconds.slow,
	ease: motionEasing.out
};
function formatChartValue(value, format, currencyCode = "USD") {
	if (format === "currency") return formatEnUsCurrency(Math.abs(value), currencyCode, { maximumFractionDigits: 0 });
	if (format === "percent") return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
	return AGENT_CHART_WHOLE_NUMBER_FORMATTER.format(Math.abs(value));
}
function AgentChartBarFill({ width, fill }) {
	const prefersReducedMotion = (0, motion_exports.useReducedMotion)();
	const style = {
		width: `${width}%`,
		backgroundColor: fill
	};
	const animate = { width: `${width}%` };
	const barColorStyle = { backgroundColor: fill };
	if (prefersReducedMotion) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-full rounded-full",
		style
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
			className: "h-full rounded-full",
			initial: AGENT_CHART_BAR_INITIAL,
			animate,
			transition: AGENT_CHART_BAR_TRANSITION,
			style: barColorStyle
		})
	});
}
function AgentMessageBarChart({ series }) {
	const maxValue = Math.max(...series.points.map((point) => Math.abs(point.value)), 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border/50 bg-background/90 p-3 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-start gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {
				className: "mt-0.5 size-4 shrink-0 text-primary",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold text-foreground",
					children: series.title
				}), series.subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground",
					children: series.subtitle
				}) : null]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-2.5",
			"aria-label": series.title,
			children: series.points.map((point, index) => {
				const width = Math.max(Math.abs(point.value) / maxValue * 100, point.value !== 0 ? 8 : 0);
				const fill = getAgentChartFill(index);
				const label = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex items-center justify-between gap-2 text-[11px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate font-medium text-foreground",
						children: point.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "shrink-0 tabular-nums text-muted-foreground",
						children: formatChartValue(point.value, series.valueFormat, series.currencyCode)
					})]
				});
				const bar = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-2.5 overflow-hidden rounded-full bg-muted/50 ring-1 ring-border/40",
					role: "presentation",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentChartBarFill, {
						width,
						fill
					})
				});
				if (point.href) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
					href: point.href,
					className: "block rounded-lg border border-transparent px-1 py-0.5 transition-colors hover:border-border/60 hover:bg-muted/30",
					children: [label, bar]
				}) }, point.name);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [label, bar] }, point.name);
			})
		})]
	});
}
function DeltaPill({ delta, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums", tone === "positive" && "bg-success/12 text-success", tone === "negative" && "bg-destructive/12 text-destructive", tone === "neutral" && "bg-muted text-muted-foreground"),
		children: delta
	});
}
function AgentMetricTile({ item, emphasized = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-xl border border-border/50 bg-background px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md", emphasized && "border-primary/20 bg-linear-to-br from-primary/[0.06] to-background ring-1 ring-primary/10"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80",
				children: item.label
			}), item.delta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeltaPill, {
				delta: item.delta,
				tone: item.deltaTone
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-1 font-bold tabular-nums tracking-tight text-foreground", emphasized ? "text-xl" : "text-lg"),
			children: item.value
		})]
	});
}
function AgentOverviewChips({ items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-2",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "inline-flex min-w-[7rem] flex-col rounded-lg border border-border/50 bg-background/80 px-2.5 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
				children: item.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 text-sm font-medium text-foreground",
				children: item.value
			})]
		}, item.label))
	});
}
function AgentPerformanceMetricsGrid({ items }) {
	const hero = items.filter((item) => item.emphasis === "primary");
	const rest = items.filter((item) => item.emphasis !== "primary");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [hero.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2 sm:grid-cols-3",
			children: hero.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMetricTile, {
				item,
				emphasized: true
			}, item.label))
		}) : null, rest.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
			children: rest.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMetricTile, { item }, item.label))
		}) : null]
	});
}
function AgentMetricsSection({ section }) {
	if (section.title === "Insight") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm leading-relaxed text-foreground",
		children: section.items[0]?.value
	});
	if (section.title === "Overview") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentOverviewChips, { items: section.items });
	if (section.title === "Performance" || section.title === "Task Summary") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentPerformanceMetricsGrid, { items: section.items });
	if (section.title === "Status Breakdown") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
		children: section.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMetricTile, { item }, item.label))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-2 grid-cols-2 md:grid-cols-3",
		children: section.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMetricTile, { item }, item.label))
	});
}
function AgentListSection({ section, accentClass }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-2",
		children: section.items.map((item) => {
			const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm font-medium text-foreground",
						children: item.primary
					}), item.secondary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs text-muted-foreground",
						children: item.secondary
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 flex-col items-end gap-1",
					children: [item.delta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeltaPill, {
						delta: item.delta,
						tone: item.deltaTone
					}) : null, item.href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
						className: "size-3.5 text-muted-foreground",
						"aria-hidden": true
					}) : null]
				})]
			});
			if (item.href) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
				href: item.href,
				className: cn("block rounded-lg border border-border/50 bg-background px-3 py-2.5 shadow-sm transition-colors hover:border-accent/30 hover:bg-muted/30", accentClass),
				children: inner
			}) }, `${item.primary}-${item.secondary ?? ""}`);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: cn("rounded-lg border border-border/50 bg-background px-3 py-2.5 shadow-sm", accentClass),
				children: inner
			}, `${item.primary}-${item.secondary ?? ""}`);
		})
	});
}
function chartForSection(charts, sectionTitle) {
	switch (sectionTitle) {
		case "Performance": return charts.find((chart) => chart.id === "financial") ?? charts.find((chart) => chart.id === "delivery") ?? null;
		case "Traffic & Conversions": return charts.find((chart) => chart.id === "analytics-traffic") ?? charts.find((chart) => chart.id === "analytics-period-delta") ?? null;
		case "Platform Breakdown": return charts.find((chart) => chart.id === "providers") ?? null;
		case "Top Campaigns": return charts.find((chart) => chart.id === "top-campaigns") ?? null;
		case "Facebook": return charts.find((chart) => chart.id === "social-facebook") ?? null;
		case "Instagram": return charts.find((chart) => chart.id === "social-instagram") ?? null;
		case "Top Facebook Posts": return charts.find((chart) => chart.id === "social-top-facebook") ?? null;
		case "Top Instagram Posts": return charts.find((chart) => chart.id === "social-top-instagram") ?? null;
		case "Status Breakdown": return charts.find((chart) => chart.id === "task-status") ?? null;
		default: return null;
	}
}
function secondaryCharts(charts, primaryId) {
	if (!primaryId) return charts.filter((chart) => chart.id === "period-delta");
	return charts.filter((chart) => chart.id !== primaryId && chart.id === "period-delta");
}
function AgentDataSections({ sections, operation, data, accentClass }) {
	const charts = buildAgentMessageCharts(operation, data);
	if (sections.length === 0 && charts.length === 0) return null;
	const usedChartIds = /* @__PURE__ */ new Set();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FadeInStagger, {
		className: "mt-4 space-y-4",
		stagger: .06,
		children: [
			sections.length === 0 ? (() => {
				const standaloneDelta = charts.find((chart) => chart.id === "period-delta") ?? charts.find((chart) => chart.id === "analytics-period-delta");
				return standaloneDelta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, {
					y: 12,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMessageBarChart, { series: standaloneDelta })
				}) : null;
			})() : null,
			sections.map((section) => {
				const linkedChart = chartForSection(charts, section.title);
				if (linkedChart) usedChartIds.add(linkedChart.id);
				const extraCharts = section.title === "Performance" ? charts.filter((chart) => chart.id === "delivery" || chart.id === "period-delta") : section.title === "Traffic & Conversions" ? charts.filter((chart) => chart.id === "analytics-period-delta") : secondaryCharts(charts, linkedChart?.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FadeInItem, {
					y: 12,
					className: cn("rounded-xl border border-border/60 bg-background/85 p-3 shadow-sm", accentClass),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/80",
							children: section.title
						}),
						linkedChart ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMessageBarChart, { series: linkedChart })
						}) : null,
						section.type === "metrics" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: linkedChart ? "mt-1" : void 0,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMetricsSection, { section })
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentListSection, {
							section,
							accentClass
						}),
						extraCharts.flatMap((chart) => {
							if (usedChartIds.has(chart.id)) return [];
							usedChartIds.add(chart.id);
							return [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMessageBarChart, { series: chart })
							}, chart.id)];
						})
					]
				}, section.title);
			}),
			charts.flatMap((chart) => !usedChartIds.has(chart.id) ? [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, {
				y: 12,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMessageBarChart, { series: chart })
			}, chart.id)] : [])
		]
	});
}
function parsePlainAgentContent(text) {
	const lines = text.split("\n").map((line) => line.trimEnd());
	const blocks = [];
	let index = 0;
	while (index < lines.length) {
		const line = lines[index]?.trim() ?? "";
		if (!line) {
			index += 1;
			continue;
		}
		if (/^[-*•]\s+/.test(line)) {
			const items = [];
			while (index < lines.length) {
				const current = lines[index]?.trim() ?? "";
				if (!current) break;
				const match = current.match(/^[-*•]\s+(.+)$/);
				if (!match) break;
				items.push(match[1] ?? "");
				index += 1;
			}
			blocks.push({
				type: "list",
				items
			});
			continue;
		}
		if (line.match(/^([A-Za-z][A-Za-z0-9\s/&]+):\s+(.+)$/)) {
			const pairs = [];
			while (index < lines.length) {
				const match = (lines[index]?.trim() ?? "").match(/^([A-Za-z][A-Za-z0-9\s/&]+):\s+(.+)$/);
				if (!match) break;
				pairs.push({
					label: match[1] ?? "",
					value: match[2] ?? ""
				});
				index += 1;
			}
			if (pairs.length >= 2) {
				blocks.push({
					type: "metrics",
					pairs
				});
				continue;
			}
		}
		const paragraphLines = [line];
		index += 1;
		while (index < lines.length) {
			const next = lines[index]?.trim() ?? "";
			if (!next || /^[-*•]\s+/.test(next) || /^[A-Za-z][A-Za-z0-9\s/&]+:\s+/.test(next)) break;
			paragraphLines.push(next);
			index += 1;
		}
		blocks.push({
			type: "paragraph",
			lines: paragraphLines
		});
	}
	return blocks;
}
function AgentPlainText({ text, mentionLabels, mentionClassName }) {
	const blocks = parsePlainAgentContent(text);
	if (blocks.length <= 1 && blocks[0]?.type === "paragraph") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMentionText, {
		text,
		mentionLabels,
		mentionClassName
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3 text-sm leading-relaxed text-foreground",
		children: blocks.map((block) => {
			if (block.type === "list") {
				const listKey = `list-${block.items.join("\0")}`;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "ml-1 list-disc space-y-1 pl-4 text-foreground/95",
					children: block.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMentionText, {
						text: item,
						mentionLabels,
						mentionClassName
					}) }, item))
				}, listKey);
			}
			if (block.type === "metrics") {
				const metricsKey = `metrics-${block.pairs.map((pair) => `${pair.label}:${pair.value}`).join("\0")}`;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: block.pairs.map((pair) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border/50 bg-muted/20 px-2.5 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-bold uppercase tracking-wide text-muted-foreground",
							children: pair.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 font-medium tabular-nums text-foreground",
							children: pair.value
						})]
					}, pair.label))
				}, metricsKey);
			}
			const paragraphKey = `p-${block.lines.join("\0")}`;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-pretty",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMentionText, {
					text: block.lines.join(" "),
					mentionLabels,
					mentionClassName
				})
			}, paragraphKey);
		})
	});
}
function parseAgentSpreadsheetExport(data) {
	const raw = data?.spreadsheetExport;
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
	const record = raw;
	const filename = typeof record.filename === "string" ? record.filename.trim() : "";
	const title = typeof record.title === "string" ? record.title.trim() : "";
	const headers = Array.isArray(record.headers) ? record.headers.filter((value) => typeof value === "string") : [];
	const rows = Array.isArray(record.rows) ? record.rows.flatMap((row) => {
		if (!Array.isArray(row)) return [];
		return [row.map((cell) => cell === null || cell === void 0 ? "" : String(cell))];
	}) : [];
	if (!filename || !title || headers.length === 0) return null;
	const subtitle = typeof record.subtitle === "string" ? record.subtitle : void 0;
	const sheetName = typeof record.sheetName === "string" ? record.sheetName : void 0;
	const extraTables = Array.isArray(record.extraTables) ? record.extraTables.flatMap((table) => {
		if (!table || typeof table !== "object" || Array.isArray(table)) return [];
		const entry = table;
		const tableTitle = typeof entry.title === "string" ? entry.title : "";
		const tableHeaders = Array.isArray(entry.headers) ? entry.headers.filter((value) => typeof value === "string") : [];
		const tableRows = Array.isArray(entry.rows) ? entry.rows.flatMap((row) => {
			if (!Array.isArray(row)) return [];
			return [row.map((cell) => cell === null || cell === void 0 ? "" : String(cell))];
		}) : [];
		if (!tableTitle || tableHeaders.length === 0) return [];
		return [{
			title: tableTitle,
			headers: tableHeaders,
			rows: tableRows
		}];
	}) : void 0;
	const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? Object.fromEntries(Object.entries(record.metadata).flatMap(([key, value]) => {
		if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") return [];
		return [[key, String(value)]];
	})) : void 0;
	const charts = Array.isArray(record.charts) ? record.charts : void 0;
	return {
		filename: ensureXlsxFilename(filename),
		title,
		subtitle,
		sheetName,
		headers,
		rows,
		extraTables,
		metadata,
		charts
	};
}
function parseStoredSpreadsheetExport(data) {
	const raw = data?.storedExport;
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
	const record = raw;
	const id = typeof record.id === "string" ? record.id : null;
	const name = typeof record.name === "string" ? record.name : null;
	const storageId = typeof record.storageId === "string" ? record.storageId : null;
	if (!id || !name || !storageId) return null;
	return {
		id,
		name,
		mimeType: typeof record.mimeType === "string" ? record.mimeType : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		sizeLabel: typeof record.sizeLabel === "string" ? record.sizeLabel : "—",
		excerpt: typeof record.excerpt === "string" ? record.excerpt : "Excel export",
		extractionStatus: "ready",
		storageId,
		url: typeof record.url === "string" ? record.url : void 0
	};
}
async function buildSpreadsheetBlobFromPayload(payload) {
	return workbookToXlsxBlob(await buildCohortsSpreadsheetWorkbook({
		title: payload.title,
		subtitle: payload.subtitle,
		sheetName: payload.sheetName,
		headers: payload.headers,
		rows: payload.rows,
		extraTables: payload.extraTables,
		metadata: payload.metadata,
		charts: payload.charts
	}));
}
async function downloadAgentSpreadsheetExport(payload) {
	const blob = await buildSpreadsheetBlobFromPayload(payload);
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = ensureXlsxFilename(payload.filename);
	link.style.visibility = "hidden";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
async function persistAgentSpreadsheetExport(args) {
	const filename = ensureXlsxFilename(args.payload.filename);
	const blob = await buildSpreadsheetBlobFromPayload(args.payload);
	const file = new File([blob], filename, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
	const { storageId, url } = await uploadStorageFileWithPublicUrl({
		file,
		contentType: file.type,
		generateUploadUrl: args.generateUploadUrl,
		syncMetadata: args.syncMetadata,
		getPublicUrl: args.getPublicUrl
	});
	const sizeLabel = file.size >= 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
	return {
		id: `export-${Date.now()}`,
		name: filename,
		mimeType: file.type,
		sizeLabel,
		excerpt: args.payload.subtitle ?? args.payload.title,
		extractionStatus: "ready",
		storageId,
		url: url ?? void 0
	};
}
function AgentSpreadsheetDownload({ messageId, conversationId, workspaceId, data, attachments, onStored }) {
	const convex = useConvex();
	const attachSpreadsheetExport = useMutation(agentApi.attachSpreadsheetExport);
	const generateUploadUrl = useMutation(filesApi.generateUploadUrl);
	const syncMetadata = useMutation(filesApi.syncMetadata);
	const payload = parseAgentSpreadsheetExport(data);
	const alreadyStored = parseStoredSpreadsheetExport(data) !== null || (attachments?.some((attachment) => attachment.storageId && attachment.name.endsWith(".xlsx")) ?? false);
	const [isDownloading, setIsDownloading] = (0, import_react.useState)(false);
	const [isStoring, setIsStoring] = (0, import_react.useState)(false);
	const persistAttemptedRef = (0, import_react.useRef)(false);
	const getPublicUrl = (0, import_react.useCallback)((args) => {
		if (!workspaceId) throw new Error("Workspace context missing");
		return convex.query(filesApi.getPublicUrl, {
			workspaceId,
			storageId: args.storageId
		});
	}, [workspaceId, convex]);
	const storeExport = (0, import_react.useCallback)(async () => {
		if (!payload || !conversationId || !workspaceId || isPreviewModeEnabled() || alreadyStored) return null;
		setIsStoring(true);
		try {
			const attachment = await persistAgentSpreadsheetExport({
				payload,
				generateUploadUrl: () => generateUploadUrl({}),
				syncMetadata: (args) => syncMetadata(args),
				getPublicUrl
			});
			await attachSpreadsheetExport({
				workspaceId,
				conversationLegacyId: conversationId,
				legacyId: messageId,
				attachment: {
					id: attachment.id,
					name: attachment.name,
					mimeType: attachment.mimeType,
					sizeLabel: attachment.sizeLabel,
					excerpt: attachment.excerpt,
					extractionStatus: attachment.extractionStatus,
					storageId: attachment.storageId,
					url: attachment.url
				}
			});
			onStored?.(messageId, attachment);
			setIsStoring(false);
			return attachment;
		} catch (error) {
			setIsStoring(false);
			notifyFailure({
				title: "Could not save Excel file",
				message: error instanceof Error ? error.message : "Upload to storage failed."
			});
			return null;
		}
	}, [
		payload,
		conversationId,
		workspaceId,
		alreadyStored,
		messageId,
		persistAgentSpreadsheetExport,
		generateUploadUrl,
		syncMetadata,
		getPublicUrl,
		attachSpreadsheetExport,
		onStored
	]);
	(0, import_react.useEffect)(() => {
		if (!payload || alreadyStored || persistAttemptedRef.current) return;
		persistAttemptedRef.current = true;
		storeExport();
	}, [
		alreadyStored,
		conversationId,
		messageId,
		payload,
		workspaceId,
		storeExport
	]);
	const handleDownload = async () => {
		if (!payload || isDownloading) return;
		setIsDownloading(true);
		try {
			if (!alreadyStored) await storeExport();
			await downloadAgentSpreadsheetExport(payload);
		} catch (error) {
			notifyFailure({
				title: "Excel export failed",
				message: error instanceof Error ? error.message : "Could not build the spreadsheet."
			});
		}
		setIsDownloading(false);
	};
	const handleDownloadClick = () => {
		handleDownload();
	};
	if (!payload) return null;
	const busy = isDownloading || isStoring;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 rounded-lg border border-border/60 bg-background/70 px-3 py-2.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-foreground",
				children: payload.title
			}),
			payload.subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted-foreground",
				children: payload.subtitle
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: isStoring ? "Saving workbook to your workspace…" : alreadyStored ? "Saved in chat — download anytime." : "Download now or wait while it saves to chat."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				size: "sm",
				variant: "default",
				className: "mt-2 gap-2",
				disabled: busy,
				onClick: handleDownloadClick,
				children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "size-3.5 animate-spin",
					"aria-hidden": true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
					className: "size-3.5",
					"aria-hidden": true
				}), isDownloading ? "Building Excel…" : isStoring ? "Saving…" : `Download ${payload.filename}`]
			})
		]
	});
}
var AGENT_MESSAGE_INITIAL = {
	opacity: 0,
	y: 10
};
var AGENT_MESSAGE_ANIMATE = {
	opacity: 1,
	y: 0
};
var AGENT_MESSAGE_ENHANCED_INITIAL = {
	opacity: 0,
	y: 10,
	scale: .98
};
var AGENT_MESSAGE_ENHANCED_ANIMATE = {
	opacity: 1,
	y: 0,
	scale: 1
};
var AGENT_MESSAGE_TRANSITION = {
	duration: motionDurationSeconds.normal,
	ease: motionEasing.out
};
var EMPTY_MENTION_LABELS = [];
function AgentAvatar({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/15", className),
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-primary" })
	});
}
function getActionLabel(action, operation) {
	if (operation === "summarizeAdsPerformance") return "Ads Snapshot";
	if (operation === "summarizeAnalyticsPerformance") return "Analytics Snapshot";
	if (operation === "summarizeSocialPerformance") return "Social Insights";
	if (operation === "generatePerformanceReport") return "Report";
	if (operation === "summarizeMyTasks" || operation === "summarizeClientTasks") return "Task Summary";
	if (operation === "listWorkspaceClients") return "Clients";
	if (operation === "listActiveProjects") return "Projects";
	if (operation === "listProposals") return "Proposals";
	if (operation === "summarizeMeetings") return "Meetings";
	if (operation === "requestAdsSync") return "Ads Sync";
	if (operation === "requestAnalyticsSync") return "Analytics Sync";
	if (operation === "requestSocialSync") return "Social Sync";
	if (operation === "markAllNotificationsRead") return "Notifications";
	if (operation === "exportSpreadsheet") return "Excel Export";
	if (operation === "createProject" || operation === "updateProject") return "Project Action";
	switch (action) {
		case "navigate": return "Navigation";
		case "execute": return "Action Executed";
		case "clarify": return "Clarification";
		default: return "Response";
	}
}
function getActionIcon(action) {
	switch (action) {
		case "navigate": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "size-4" });
		case "execute": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4" });
		case "clarify": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "size-4" });
		default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" });
	}
}
function derivePresentationTone(message) {
	const { status, metadata } = message;
	if (status === "success") return "success";
	if (status === "error") return "error";
	if (status === "warning") return "warning";
	if (metadata?.action === "clarify") return "warning";
	return "info";
}
function usesStructuredAgentCard(message) {
	if (message.type !== "agent") return false;
	const { status, metadata } = message;
	const action = metadata?.action;
	if (metadata?.requiresConfirmation) return true;
	if (status === "error" || status === "warning") return true;
	if (status === "success" && action) return true;
	if (status === "info" && action) return true;
	return false;
}
function getPresentationHeading(tone, action, operation) {
	if (tone === "warning" && action !== "clarify" && action !== "execute" && action !== "navigate") return "Heads up";
	if (action === "clarify") return tone === "warning" ? "Need a bit more detail" : "Clarification";
	if (action === "navigate") {
		if (tone === "success") return "Navigation ready";
		if (tone === "error") return "Navigation failed";
		return "Navigation";
	}
	if (operation === "summarizeAdsPerformance") {
		if (tone === "success") return "Snapshot ready";
		if (tone === "error") return "Snapshot failed";
		return "Ads snapshot";
	}
	if (operation === "summarizeAnalyticsPerformance") {
		if (tone === "success") return "Analytics ready";
		if (tone === "error") return "Analytics failed";
		return "Analytics snapshot";
	}
	if (operation === "summarizeSocialPerformance") {
		if (tone === "success") return "Social insights ready";
		if (tone === "error") return "Social insights failed";
		return "Social insights";
	}
	if (operation === "generatePerformanceReport") {
		if (tone === "success") return "Report ready";
		if (tone === "error") return "Report failed";
		return "Report";
	}
	if (operation === "createProject") {
		if (tone === "success") return "Project created";
		if (tone === "error") return "Project action failed";
		return "Project";
	}
	if (operation === "updateProject") {
		if (tone === "success") return "Project updated";
		if (tone === "error") return "Project action failed";
		return "Project";
	}
	if (action === "execute") {
		if (tone === "success") return "Action complete";
		if (tone === "error") return "Action failed";
		return "Action";
	}
	if (tone === "error") return "Something went wrong";
	if (tone === "info") return "Reply";
	return "Update";
}
function toneSurfaceClasses(tone) {
	switch (tone) {
		case "success": return {
			shell: "border-accent/25 bg-accent/[0.07]",
			header: "border-accent/20 bg-accent/10"
		};
		case "error": return {
			shell: "border-destructive/25 bg-destructive/[0.08]",
			header: "border-destructive/20 bg-destructive/10"
		};
		case "warning": return {
			shell: "border-warning/30 bg-warning/[0.09]",
			header: "border-warning/25 bg-warning/10"
		};
		default: return {
			shell: "border-border/70 bg-muted/25",
			header: "border-border/60 bg-muted/40"
		};
	}
}
function toneAccentClasses(tone) {
	switch (tone) {
		case "success": return {
			icon: "text-primary",
			title: "text-primary",
			badge: "bg-background text-primary",
			mention: "bg-accent/15 text-primary ring-primary/20",
			section: "border-accent/20"
		};
		case "error": return {
			icon: "text-destructive",
			title: "text-destructive",
			badge: "bg-background text-destructive",
			mention: "bg-destructive/15 text-destructive ring-destructive/20",
			section: "border-destructive/20"
		};
		case "warning": return {
			icon: "text-warning",
			title: "text-warning",
			badge: "bg-background text-warning",
			mention: "bg-warning/15 text-warning ring-warning/25",
			section: "border-warning/25"
		};
		default: return {
			icon: "text-muted-foreground",
			title: "text-foreground",
			badge: "bg-background text-muted-foreground",
			mention: "bg-muted/80 text-foreground ring-border/40",
			section: "border-border/60"
		};
	}
}
function StatusGlyph({ tone }) {
	if (tone === "success") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
		className: "size-4 shrink-0 text-primary",
		"aria-hidden": true
	});
	if (tone === "error") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
		className: "size-4 shrink-0 text-destructive",
		"aria-hidden": true
	});
	if (tone === "warning") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
		className: "size-4 shrink-0 text-warning",
		"aria-hidden": true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
		className: "size-4 shrink-0 text-muted-foreground",
		"aria-hidden": true
	});
}
function isRetryableData(data) {
	return data?.retryable === true;
}
var STRUCTURED_DATA_OPERATIONS = new Set([
	"summarizeAdsPerformance",
	"summarizeAnalyticsPerformance",
	"summarizeSocialPerformance",
	"generatePerformanceReport",
	"summarizeMyTasks",
	"summarizeClientTasks",
	"listWorkspaceClients",
	"listActiveProjects",
	"listProposals",
	"summarizeMeetings",
	"requestAdsSync",
	"requestAnalyticsSync",
	"requestSocialSync",
	"markAllNotificationsRead",
	"exportSpreadsheet"
]);
function usesStructuredMetricsCard(operation) {
	return operation !== void 0 && STRUCTURED_DATA_OPERATIONS.has(operation);
}
function resolveAgentDisplayContent(content, operation, dataSections, data) {
	if (!usesStructuredMetricsCard(operation) || dataSections.length === 0) return content;
	const situation = typeof data?.currentSituation === "string" ? data.currentSituation.trim() : "";
	if (situation.length > 0) return situation;
	return content.split("\n").map((line) => line.trim()).find((line) => line.length > 0) ?? content.trim();
}
function routeLinkLabel(operation) {
	if (operation === "summarizeAdsPerformance" || operation === "requestAdsSync") return "Open ads dashboard";
	if (operation === "summarizeAnalyticsPerformance" || operation === "requestAnalyticsSync") return "Open analytics";
	if (operation === "summarizeSocialPerformance" || operation === "requestSocialSync") return "Open socials";
	if (operation === "generatePerformanceReport") return "Open analytics";
	return "Go to page";
}
function UserMessageStatus({ lifecycle, onResend }) {
	if (lifecycle === "sending") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "mt-1 flex items-center justify-end gap-1 text-[11px] text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			className: "size-3 animate-spin",
			"aria-hidden": true
		}), "Sending…"]
	});
	if (lifecycle === "failed" && onResend) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-1 flex items-center justify-end gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] text-destructive",
			children: "Failed to send"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "ghost",
			size: "sm",
			className: "h-7 px-2 text-xs",
			onClick: onResend,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-1 size-3" }), "Resend"]
		})]
	});
	return null;
}
function AgentConfirmationPanel({ message, isProcessing, onConfirmPending }) {
	const pending = message.metadata?.pendingConfirmation;
	const confirmation = message.metadata?.confirmation;
	const handleConfirm = () => {
		if (!pending) return;
		onConfirmPending?.(pending, "confirm");
	};
	const handleEdit = () => {
		if (!pending) return;
		onConfirmPending?.(pending, "edit");
	};
	const handleCancel = () => {
		if (!pending) return;
		onConfirmPending?.(pending, "cancel");
	};
	if (!message.metadata?.requiresConfirmation || !pending || !confirmation) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 rounded-lg border border-warning/35 bg-warning/5 p-3 text-xs",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium text-foreground",
				children: "Confirm before running"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 leading-relaxed text-muted-foreground",
				children: confirmation.summary
			}),
			confirmation.affectedRecords && confirmation.affectedRecords.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-1 text-muted-foreground",
				children: confirmation.affectedRecords.map((record) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["• ", record] }, record))
			}) : null,
			confirmation.fields && Object.keys(confirmation.fields).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-2 grid gap-1.5 rounded-md border border-border/50 bg-background/70 px-2.5 py-2",
				children: Object.entries(confirmation.fields).map(([key, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "shrink-0 font-medium text-foreground",
						children: key
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-muted-foreground",
						children: String(value)
					})]
				}, key))
			}) : null,
			confirmation.missingFields && confirmation.missingFields.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-warning",
				children: ["Still needed: ", confirmation.missingFields.join(", ")]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						disabled: isProcessing,
						onClick: handleConfirm,
						children: "Confirm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						variant: "outline",
						disabled: isProcessing,
						onClick: handleEdit,
						children: "Edit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						variant: "ghost",
						disabled: isProcessing,
						onClick: handleCancel,
						children: "Cancel"
					})
				]
			})
		]
	});
}
function AgentMessageCard({ message, mentionLabels = EMPTY_MENTION_LABELS, conversationId = null, workspaceId = null, onStoreSpreadsheetExport, onRetryLastUserTurn, onRetryUserMessage, onConfirmPending, onUndoAction, isProcessing }) {
	const { type, content, status, metadata, route, steps } = message;
	const handleResend = () => {
		onRetryUserMessage?.(message.clientId, message.content);
	};
	const handleUndo = () => {
		if (!metadata?.undoHint) return;
		onUndoAction?.(message.id, metadata.undoHint);
	};
	if (type === "user") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion_exports.m.div, {
			initial: AGENT_MESSAGE_INITIAL,
			animate: AGENT_MESSAGE_ANIMATE,
			className: "flex flex-col items-end gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("max-w-[min(85%,28rem)] rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm", message.lifecycle === "failed" ? "bg-destructive/90 ring-1 ring-destructive/30" : "bg-gradient-to-br from-primary to-primary/90 ring-1 ring-primary/20", message.lifecycle === "sending" && "opacity-75"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMentionText, {
						text: content,
						mentionLabels,
						mentionClassName: "bg-primary-foreground/15 text-primary-foreground ring-primary-foreground/20"
					}),
					message.mentions && message.mentions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMentionPills, { mentions: message.mentions }) : null,
					message.attachments && message.attachments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMessageAttachmentChips, { attachments: message.attachments }) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMessageStatus, {
				lifecycle: message.lifecycle,
				onResend: onRetryUserMessage ? handleResend : void 0
			})]
		})
	});
	const action = metadata?.action;
	const operation = metadata?.operation;
	const dataSections = buildAgentDataSections(operation, metadata?.data);
	const tone = derivePresentationTone(message);
	const surfaces = toneSurfaceClasses(tone);
	const accents = toneAccentClasses(tone);
	const liveRegion = tone === "error" || tone === "warning" ? "assertive" : "off";
	const usedContextNames = metadata?.usedContext?.attachmentNames ?? [];
	const executeSucceeded = metadata?.action === "execute" && metadata.success === true;
	const showRouteLink = Boolean(route) && (tone === "success" || executeSucceeded);
	const displayContent = resolveAgentDisplayContent(content, operation, dataSections, metadata?.data);
	const detailUserMessage = typeof metadata?.data?.userMessage === "string" && metadata.data.userMessage.trim().length > 0 ? metadata.data.userMessage.trim() : null;
	const showDetailLine = !usesStructuredMetricsCard(operation) && Boolean(detailUserMessage && detailUserMessage !== content.trim() && detailUserMessage !== displayContent.trim());
	const showRetryButton = Boolean(onRetryLastUserTurn) && isRetryableData(metadata?.data) && metadata?.action === "execute";
	if (usesStructuredAgentCard(message)) {
		const heading = getPresentationHeading(tone, action, operation);
		const statusLabel = tone === "success" ? "Success" : tone === "error" ? "Error" : tone === "warning" ? "Warning" : "Information";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
			features: motion_exports.domAnimation,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion_exports.m.div, {
				initial: AGENT_MESSAGE_ENHANCED_INITIAL,
				animate: AGENT_MESSAGE_ENHANCED_ANIMATE,
				transition: AGENT_MESSAGE_TRANSITION,
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentAvatar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
					"aria-live": liveRegion,
					className: cn("min-w-0 max-w-[min(90%,32rem)] flex-1 overflow-hidden rounded-2xl rounded-tl-md border shadow-sm", surfaces.shell),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("flex items-center gap-2 border-b px-4 py-2.5", surfaces.header),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusGlyph, { tone }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("min-w-0 flex-1 text-sm font-medium", accents.title),
								children: heading
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: statusLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: cn("ml-auto shrink-0 text-xs", accents.badge),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1",
									children: [getActionIcon(action), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getActionLabel(action, operation) })]
								})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed text-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMentionText, {
									text: displayContent,
									mentionLabels,
									mentionClassName: accents.mention
								})
							}),
							usedContextNames.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: ["Used context from: ", usedContextNames.join(", ")]
							}) : null,
							showDetailLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground",
								children: detailUserMessage
							}) : null,
							steps && steps.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "mt-3 space-y-1 border-t border-border/50 pt-3",
								children: steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 shrink-0 rounded-full", step.status === "completed" && "bg-primary", step.status === "failed" && "bg-destructive", step.status === "active" && "bg-primary animate-pulse", step.status === "pending" && "bg-muted-foreground/40") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: step.status === "failed" ? "text-destructive" : void 0,
										children: step.label
									})]
								}, step.id))
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentConfirmationPanel, {
								message,
								isProcessing,
								onConfirmPending
							}),
							metadata?.undoHint && onUndoAction ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									size: "sm",
									variant: "outline",
									className: "gap-2",
									onClick: handleUndo,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }),
										"Undo ",
										metadata.undoHint.label.toLowerCase()
									]
								})
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentDataSections, {
								sections: dataSections,
								operation,
								data: metadata?.data,
								accentClass: accents.section
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentSpreadsheetDownload, {
								messageId: message.id,
								conversationId: conversationId ?? null,
								workspaceId: workspaceId ?? null,
								data: metadata?.data,
								attachments: message.attachments,
								onStored: onStoreSpreadsheetExport
							}),
							message.attachments && message.attachments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMessageAttachmentChips, { attachments: message.attachments })
							}) : null,
							showRouteLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "sm",
									variant: "outline",
									className: "gap-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
										href: route,
										children: [routeLinkLabel(operation), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3" })]
									})
								})
							}) : null,
							showRetryButton ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									size: "sm",
									variant: "outline",
									className: "gap-2",
									onClick: onRetryLastUserTurn,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), "Try again"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Resends your last request."
								})]
							}) : null,
							operation && !usesStructuredMetricsCard(operation) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 text-xs text-muted-foreground",
								children: ["Operation: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "rounded bg-muted px-1 py-0.5",
									children: operation
								})]
							}) : null
						]
					})]
				})]
			})
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion_exports.m.div, {
			initial: AGENT_MESSAGE_INITIAL,
			animate: AGENT_MESSAGE_ANIMATE,
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentAvatar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-w-[min(90%,32rem)] rounded-2xl rounded-tl-md border border-border/50 bg-card px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentPlainText, {
					text: content,
					mentionLabels,
					mentionClassName: "bg-primary/10 text-primary ring-primary/15"
				})
			})]
		})
	});
}
function toMessageTimestamp(value) {
	if (value instanceof Date) return value;
	if (typeof value === "string") {
		const parsed = parseISO(value);
		if (isValid(parsed)) return parsed;
	}
	return new Date(value);
}
function AgentMessagesSection({ isConversationLoading, isProcessing, mentionLabels, messages, onRetryLastUserTurn, onRetryUserMessage, onConfirmPending, onUndoAction, processingSteps, processingLabel, scrollAreaRef, onMessagesScroll, showJumpToLatest, onJumpToLatest, conversationId, workspaceId, onStoreSpreadsheetExport }) {
	const now = useClientNow();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative flex-1 min-h-0", AGENT_PANEL_SURFACE),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("h-full overflow-y-auto px-4 py-5", AGENT_MESSAGE_THREAD),
			ref: scrollAreaRef,
			onScroll: onMessagesScroll,
			onWheel: stopPropagation$1,
			children: isConversationLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full min-h-[240px] items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-3 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-6 animate-spin text-primary",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Loading conversation…"
					})]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-3xl space-y-4 pb-2",
				children: [messages.map((message, index) => {
					const timestamp = toMessageTimestamp(message.timestamp);
					const dayKey = Number.isNaN(timestamp.getTime()) ? null : messageDayKey(timestamp);
					const previousMessage = index > 0 ? messages[index - 1] : null;
					const previousTimestamp = previousMessage ? toMessageTimestamp(previousMessage.timestamp) : null;
					const previousDayKey = previousTimestamp && !Number.isNaN(previousTimestamp.getTime()) ? messageDayKey(previousTimestamp) : null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [dayKey !== null && dayKey !== previousDayKey && now ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMessageDayDivider, { label: formatMessageDayLabel(timestamp, now) }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMessageCard, {
						message,
						mentionLabels,
						isProcessing,
						conversationId,
						workspaceId,
						onStoreSpreadsheetExport,
						onRetryLastUserTurn,
						onRetryUserMessage,
						onConfirmPending,
						onUndoAction
					})] }, message.clientId);
				}), isProcessing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
					initial: MOTION_FADE_IN,
					animate: MOTION_FADE_IN_VISIBLE,
					className: "flex justify-start pt-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentExecutionTimeline, {
						steps: processingSteps,
						label: processingLabel
					})
				}) : null]
			})
		}), showJumpToLatest ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-x-0 bottom-4 flex justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				size: "sm",
				variant: "outline",
				className: "pointer-events-auto h-8 gap-1.5 rounded-full border-border/60 bg-background/95 px-4 text-foreground shadow-lg backdrop-blur-sm hover:bg-muted/80",
				onClick: onJumpToLatest,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, {
					className: "size-3.5",
					"aria-hidden": true
				}), "Latest messages"]
			})
		}) : null]
	});
}
function FailedMessageBanner({ lastFailedMessage, onRetry }) {
	if (!lastFailedMessage) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "alert",
		"aria-live": "assertive",
		className: "flex items-center justify-between gap-3 border-t border-destructive/20 bg-destructive/[0.07] px-4 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-sm text-destructive",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, {
				className: "size-4 shrink-0",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: "Message failed to send"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			onClick: onRetry,
			className: "h-8 gap-1.5 rounded-full border-destructive/25 text-destructive hover:bg-destructive/10",
			"aria-label": "Retry sending failed message",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
				className: "size-3.5",
				"aria-hidden": true
			}), "Retry"]
		})]
	});
}
function AgentModePanelShell({ isOpen, onOpenChange, panelLayout = "docked", attachmentAccept, children, contextBanner, fileInputRef, headerProps, historyPanelProps, agentError, lastFailedMessage, onClearError, onDragLeave, onDragOver, onDrop, onFileSelection, rateLimitCountdown, composerInputRef, onRequestClose }) {
	const isFullscreen = panelLayout === "fullscreen";
	const isCompact = panelLayout === "compact";
	const isDocked = panelLayout === "docked";
	const usesModal = panelUsesModalFocusTrap(panelLayout);
	const handleOpenChange = (open) => {
		if (!open) {
			onRequestClose?.();
			return;
		}
		onOpenChange(true);
	};
	const handleOpenAutoFocus = (event) => {
		event.preventDefault();
		composerInputRef?.current?.focus();
	};
	const handleInteractOutside = (event) => {
		if (!usesModal) event.preventDefault();
	};
	const shellBody = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: fileInputRef,
			type: "file",
			accept: attachmentAccept,
			multiple: true,
			"aria-label": "Attach files to agent message",
			className: "hidden",
			onChange: onFileSelection
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentModeHeader, {
			...headerProps,
			panelLayout
		}),
		contextBanner,
		agentError && onClearError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentErrorBanner, {
			error: agentError,
			lastFailedMessage: lastFailedMessage ?? null,
			onDismiss: onClearError
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.AnimatePresence, { children: typeof rateLimitCountdown === "number" && rateLimitCountdown > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RateLimitBanner, {
			countdown: rateLimitCountdown,
			onDismiss: onClearError
		}) : null }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex min-h-0 flex-1 overflow-hidden",
			children: [historyPanelProps.showHistory ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "fixed inset-0 z-[10000] bg-black/45 backdrop-blur-[2px] md:hidden",
				"aria-label": "Close chat history",
				onClick: historyPanelProps.onClose
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentHistoryRail, {
				...historyPanelProps,
				layout: "rail",
				className: "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-[10001] max-md:border-r max-md:shadow-2xl"
			})] }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("flex min-h-0 min-w-0 flex-1 flex-col transition-[opacity,filter]", historyPanelProps.showHistory && "max-md:pointer-events-none max-md:opacity-40 max-md:blur-[1px]"),
				children
			})]
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: isOpen,
		onOpenChange: handleOpenChange,
		modal: usesModal,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
			side: "right",
			showOverlay: usesModal,
			overlayClassName: cn(usesModal && "bg-black/50", isDocked && "bg-black/15 pointer-events-none", isCompact && "bg-transparent pointer-events-none"),
			"aria-labelledby": "agent-mode-dialog-title",
			className: cn("z-[9999] flex flex-col gap-0 overflow-hidden p-0 [&>button]:hidden", isFullscreen && "inset-0 h-[100dvh] max-h-[100dvh] w-screen max-w-none border-0 sm:max-w-none", isDocked && "inset-y-0 right-0 left-auto h-full w-[min(480px,42vw)] max-w-[520px] border-l border-border/60 shadow-2xl max-md:inset-0 max-md:h-[100dvh] max-md:w-screen max-md:max-w-none", isCompact && "inset-auto bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] top-auto left-auto h-[min(560px,calc(100dvh-5rem-env(safe-area-inset-bottom)))] w-[min(400px,calc(100vw-2rem))] max-w-[400px] rounded-2xl border border-border/60 shadow-2xl ring-1 ring-black/5 max-md:inset-0 max-md:h-[100dvh] max-md:w-screen max-md:max-w-none max-md:rounded-none max-md:ring-0"),
			onOpenAutoFocus: handleOpenAutoFocus,
			onInteractOutside: handleInteractOutside,
			onDragOver,
			onDragLeave,
			onDrop,
			onWheel: stopPropagation$1,
			onTouchMove: stopPropagation$1,
			onScroll: stopPropagation$1,
			children: shellBody
		})
	});
}
function AgentModePanelContent({ dockComposerProps, emptyComposerProps, viewState, lastFailedMessage, mentionLabels, messages, onRetry, onRetryLastUserTurn, onRetryUserMessage, onConfirmPending, onUndoAction, processingSteps, processingLabel, scrollAreaRef, onMessagesScroll, onJumpToLatest, conversationId, workspaceId, onStoreSpreadsheetExport }) {
	const { conversationLoading: isConversationLoading, processing: isProcessing, showJumpToLatest, showEmptyState } = viewState;
	if (showEmptyState) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentEmptyState, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentComposerSection, { ...emptyComposerProps }) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMessagesSection, {
			isConversationLoading,
			isProcessing,
			mentionLabels,
			messages,
			onRetryLastUserTurn,
			onRetryUserMessage,
			onConfirmPending,
			onUndoAction,
			processingSteps,
			processingLabel,
			scrollAreaRef,
			onMessagesScroll,
			showJumpToLatest,
			onJumpToLatest,
			workspaceId,
			conversationId,
			onStoreSpreadsheetExport
		}),
		!isProcessing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FailedMessageBanner, {
			lastFailedMessage,
			onRetry
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentComposerSection, { ...dockComposerProps })
	] });
}
var EMPTY_TEAM_MEMBERS = [];
function useMentionData() {
	const { user } = useAuth();
	const { clients: contextClients } = useClientContext();
	const clients = contextClients.map((c) => ({
		id: c.id,
		name: c.name,
		company: c.name
	}));
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const projectsRealtime = useQuery(projectsApi.list, !workspaceId ? "skip" : {
		workspaceId,
		limit: 100
	});
	const projectsLoading = Boolean(workspaceId) && projectsRealtime === void 0;
	const teamMembers = useQuery(usersApi.listWorkspaceMembers, workspaceId ? {
		workspaceId,
		limit: 500
	} : "skip");
	const teamLoading = Boolean(workspaceId) && teamMembers === void 0;
	const allUsersRealtime = useQuery(usersApi.listAllUsers, workspaceId ? { limit: 500 } : "skip");
	const allUsersLoading = Boolean(workspaceId) && allUsersRealtime === void 0;
	const projects = (() => {
		return (Array.isArray(projectsRealtime) ? projectsRealtime : []).map((row) => ({
			id: String(row.legacyId),
			name: String(row.name ?? ""),
			status: typeof row.status === "string" ? row.status : void 0
		}));
	})();
	const users = (() => {
		const merged = /* @__PURE__ */ new Map();
		for (const member of teamMembers ?? EMPTY_TEAM_MEMBERS) {
			if (!member?.id) continue;
			merged.set(member.id, member);
		}
		for (const member of allUsersRealtime ?? EMPTY_TEAM_MEMBERS) {
			if (!member?.id) continue;
			if (!merged.has(member.id)) merged.set(member.id, member);
		}
		return Array.from(merged.values()).toSorted((a, b) => a.name.localeCompare(b.name));
	})();
	const teams = [];
	const isLoading = projectsLoading || teamLoading || allUsersLoading;
	return {
		clients,
		projects,
		teams,
		users,
		allItems: (() => {
			const items = [];
			clients.forEach((c) => items.push({
				id: c.id,
				name: c.name,
				type: "client",
				subtitle: c.company
			}));
			projects.forEach((p) => items.push({
				id: p.id,
				name: p.name,
				type: "project",
				subtitle: p.status
			}));
			teams.forEach((t) => items.push({
				id: t.id,
				name: t.name,
				type: "team",
				subtitle: t.memberCount ? `${t.memberCount} members` : void 0
			}));
			users.forEach((u) => items.push({
				id: u.id,
				name: u.name,
				type: "user",
				subtitle: u.role || u.email
			}));
			return items;
		})(),
		isLoading
	};
}
var CLIENT_READ_OPERATIONS = new Set([
	"summarizeMyTasks",
	"listActiveProjects",
	"listProposals",
	"summarizeMeetings",
	"generatePerformanceReport",
	"listWorkspaceClients",
	"summarizeAdsPerformance",
	"summarizeSocialPerformance",
	"requestSocialSync"
]);
var AGENCY_WRITE_OPERATIONS = new Set([
	"createProject",
	"createTask",
	"updateProject",
	"createProposalDraft",
	"markAllNotificationsRead",
	"summarizeAdsPerformance"
]);
function capabilityForOperation(operation) {
	if (operation === "createProposalDraft") return "proposals.manage";
	if (operation.includes("Ads") || operation === "summarizeAdsPerformance") return "agency.ads";
	if (operation === "listWorkspaceClients" || operation === "createClient") return "admin.directory";
	if (operation === "generatePerformanceReport") return "analytics.view";
	return null;
}
function isSuggestionAllowed(suggestion, role) {
	if (suggestion.capability === "navigate") return true;
	const operation = suggestion.operation;
	if (!operation) return true;
	const normalized = normalizeAuthRole(role);
	const requiredCapability = capabilityForOperation(operation);
	if (normalized === "client") {
		if (AGENCY_WRITE_OPERATIONS.has(operation)) return false;
		return CLIENT_READ_OPERATIONS.has(operation);
	}
	if (requiredCapability && !can(role, requiredCapability)) return false;
	if (normalized === "team" && operation === "createClient") return false;
	return true;
}
var DEFAULT_SUGGESTIONS = [
	{
		id: "tasks-due",
		label: "Tasks due this week",
		prompt: "Summarize my tasks due this week",
		capability: "execute",
		operation: "summarizeMyTasks"
	},
	{
		id: "ads-week",
		label: "Ads this week",
		prompt: "How are my ads performing this week?",
		capability: "execute",
		operation: "summarizeAdsPerformance"
	},
	{
		id: "nav-analytics",
		label: "Open analytics",
		prompt: "Open analytics",
		capability: "navigate"
	},
	{
		id: "create-project",
		label: "New project",
		prompt: "Create project Website Refresh",
		capability: "execute",
		operation: "createProject"
	}
];
var ROUTE_SUGGESTIONS = [
	{
		match: (path) => path.includes("/dashboard/tasks"),
		suggestions: [
			{
				id: "tasks-due-week",
				label: "Due this week",
				prompt: "Summarize my tasks due this week",
				capability: "execute",
				operation: "summarizeMyTasks"
			},
			{
				id: "create-task",
				label: "New task",
				prompt: "Create task Follow up with design team",
				capability: "execute",
				operation: "createTask"
			},
			{
				id: "mark-notifications",
				label: "Clear notifications",
				prompt: "Mark all notifications as read",
				capability: "execute",
				operation: "markAllNotificationsRead"
			},
			{
				id: "nav-tasks",
				label: "Open tasks",
				prompt: "Open tasks dashboard",
				capability: "navigate"
			}
		]
	},
	{
		match: (path) => path.includes("/dashboard/projects"),
		suggestions: [
			{
				id: "list-projects",
				label: "Active projects",
				prompt: "List active projects in this workspace",
				capability: "execute",
				operation: "listActiveProjects"
			},
			{
				id: "create-project-q2",
				label: "New project",
				prompt: "Create project Q2 Campaign",
				capability: "execute",
				operation: "createProject"
			},
			{
				id: "update-project",
				label: "Update status",
				prompt: "Update this project status to active",
				capability: "execute",
				operation: "updateProject"
			},
			{
				id: "nav-tasks-project",
				label: "Project tasks",
				prompt: "Open tasks for this project",
				capability: "navigate"
			}
		]
	},
	{
		match: (path) => path.includes("/dashboard/analytics"),
		suggestions: [
			{
				id: "ga-summary",
				label: "GA last 30 days",
				prompt: "Summarize Google Analytics for the last 30 days",
				capability: "clarify"
			},
			{
				id: "weekly-report",
				label: "Weekly report",
				prompt: "Generate weekly performance report",
				capability: "execute",
				operation: "generatePerformanceReport"
			},
			{
				id: "ads-performance",
				label: "Ads snapshot",
				prompt: "Summarize ads performance for this week",
				capability: "execute",
				operation: "summarizeAdsPerformance"
			},
			{
				id: "compare-revenue",
				label: "Compare revenue",
				prompt: "Compare ads revenue vs the previous period",
				capability: "execute",
				operation: "summarizeAdsPerformance"
			},
			{
				id: "nav-ads",
				label: "Open ads",
				prompt: "Open ads dashboard",
				capability: "navigate"
			}
		]
	},
	{
		match: (path) => path.includes("/dashboard/socials"),
		suggestions: [
			{
				id: "social-summary",
				label: "Social summary",
				prompt: "Summarize organic social performance for the last 30 days",
				capability: "execute",
				operation: "summarizeSocialPerformance"
			},
			{
				id: "instagram-insights",
				label: "Instagram insights",
				prompt: "How is Instagram performing this month?",
				capability: "execute",
				operation: "summarizeSocialPerformance"
			},
			{
				id: "sync-social",
				label: "Sync social",
				prompt: "Sync organic social metrics",
				capability: "execute",
				operation: "requestSocialSync"
			},
			{
				id: "connect-meta-social",
				label: "Connect Meta",
				prompt: "Open socials to connect Meta",
				capability: "navigate"
			},
			{
				id: "nav-ads-from-socials",
				label: "Paid ads",
				prompt: "Open ads dashboard",
				capability: "navigate"
			}
		]
	},
	{
		match: (path) => path.includes("/dashboard/ads"),
		suggestions: [
			{
				id: "meta-ads-week",
				label: "Meta ads this week",
				prompt: "How are my Meta ads doing this week?",
				capability: "execute",
				operation: "summarizeAdsPerformance"
			},
			{
				id: "ads-summary",
				label: "Ads summary",
				prompt: "Summarize ads performance",
				capability: "execute",
				operation: "summarizeAdsPerformance"
			},
			{
				id: "weekly-report-ads",
				label: "Weekly report",
				prompt: "Generate weekly performance report",
				capability: "execute",
				operation: "generatePerformanceReport"
			},
			{
				id: "active-campaigns",
				label: "Active campaigns",
				prompt: "What ads are active right now?",
				capability: "execute",
				operation: "summarizeAdsPerformance"
			}
		]
	},
	{
		match: (path) => path.includes("/dashboard/proposals"),
		suggestions: [
			{
				id: "list-proposals",
				label: "List proposals",
				prompt: "List proposals in this workspace",
				capability: "execute",
				operation: "listProposals"
			},
			{
				id: "proposal-draft",
				label: "New draft",
				prompt: "Create proposal draft for this client",
				capability: "execute",
				operation: "createProposalDraft"
			},
			{
				id: "proposal-advance",
				label: "Gather details",
				prompt: "Advance proposal conversation",
				capability: "execute",
				operation: "advanceProposalConversation"
			},
			{
				id: "proposal-generate",
				label: "Generate proposal",
				prompt: "Generate proposal from draft",
				capability: "execute",
				operation: "generateProposalFromDraft"
			},
			{
				id: "nav-proposals",
				label: "Open proposals",
				prompt: "Open proposals dashboard",
				capability: "navigate"
			}
		]
	},
	{
		match: (path) => path.includes("/dashboard/clients"),
		suggestions: [
			{
				id: "list-clients",
				label: "List clients",
				prompt: "List workspace clients",
				capability: "execute",
				operation: "listWorkspaceClients"
			},
			{
				id: "client-tasks",
				label: "Client tasks",
				prompt: "Summarize client tasks",
				capability: "execute",
				operation: "summarizeClientTasks"
			},
			{
				id: "create-client",
				label: "New client",
				prompt: "Create client Northwind Labs",
				capability: "execute",
				operation: "createClient"
			},
			{
				id: "add-member",
				label: "Add member",
				prompt: "Add team member to this client",
				capability: "execute",
				operation: "addClientTeamMember"
			}
		]
	},
	{
		match: (path) => path.includes("/dashboard/meetings"),
		suggestions: [
			{
				id: "meeting-summaries",
				label: "Meeting notes",
				prompt: "Summarize recent meetings with notes",
				capability: "execute",
				operation: "summarizeMeetings"
			},
			{
				id: "nav-meetings",
				label: "Open meetings",
				prompt: "Open meetings",
				capability: "navigate"
			},
			{
				id: "nav-collaboration",
				label: "Team chat",
				prompt: "Open collaboration",
				capability: "navigate"
			},
			{
				id: "create-task-meeting",
				label: "Follow-up task",
				prompt: "Create task Send meeting recap",
				capability: "execute",
				operation: "createTask"
			}
		]
	},
	{
		match: (path) => path.startsWith("/for-you"),
		suggestions: [
			{
				id: "nav-dashboard",
				label: "Dashboard",
				prompt: "Open dashboard overview",
				capability: "navigate"
			},
			{
				id: "tasks-today",
				label: "Tasks today",
				prompt: "Show my tasks for today",
				capability: "execute",
				operation: "summarizeMyTasks"
			},
			{
				id: "ads-week-fy",
				label: "Ads this week",
				prompt: "How are ads performing this week?",
				capability: "execute",
				operation: "summarizeAdsPerformance"
			},
			{
				id: "create-project-fy",
				label: "New project",
				prompt: "Create project Website Refresh",
				capability: "execute",
				operation: "createProject"
			}
		]
	}
];
function getAgentSuggestions(pathname, options) {
	const path = pathname ?? "";
	const match = ROUTE_SUGGESTIONS.find((entry) => entry.match(path));
	return (match ? [...match.suggestions] : [...DEFAULT_SUGGESTIONS]).filter((suggestion) => isSuggestionAllowed(suggestion, options?.role));
}
function trackAgentSuggestionClick(options) {
	if (typeof window === "undefined") return;
	import("./analytics-DVd_QQDX.mjs").then(({ logAnalyticsEvent }) => {
		logAnalyticsEvent("agent_suggestion_clicked", {
			suggestion_id: options.suggestionId,
			prompt: options.prompt.slice(0, 120),
			pathname: options.pathname ?? "",
			operation: options.operation ?? null
		});
	});
}
function deriveActiveContextFromPath(pathname) {
	if (!pathname) return {};
	const segments = pathname.split("/").filter(Boolean);
	const fromSection = (section) => {
		const sectionIndex = segments.indexOf(section);
		if (sectionIndex === -1) return void 0;
		const candidate = segments[sectionIndex + 1];
		if (!candidate) return void 0;
		if ([
			"new",
			"viewer",
			"deck"
		].includes(candidate)) return void 0;
		return candidate;
	};
	return {
		activeProposalId: fromSection("proposals"),
		activeProjectId: fromSection("projects"),
		activeClientId: fromSection("clients")
	};
}
function getAgentCloseBlockers(state) {
	const blockers = [];
	if (state.composerText.trim().length > 0) blockers.push("unsent-message");
	if (state.pendingAttachments.length > 0 || state.isExtractingAttachments) blockers.push("attachments");
	if (state.isProcessing) blockers.push("processing");
	if (state.messages.some((message) => message.metadata?.pendingConfirmation != null)) blockers.push("pending-confirmation");
	return blockers;
}
function shouldBlockAgentClose(state) {
	return getAgentCloseBlockers(state).length > 0;
}
function agentCloseBlockerMessage(blockers) {
	if (blockers.includes("processing")) return "Agent Mode is still working on your last request. Wait for it to finish or cancel before closing.";
	if (blockers.includes("pending-confirmation")) return "You have a pending action that needs confirmation. Confirm or cancel it before closing.";
	if (blockers.includes("attachments")) return "Attachments are still being read. Remove them or wait before closing.";
	if (blockers.includes("unsent-message")) return "You have an unsent message in the composer. Discard it and close?";
	return "Close Agent Mode and discard unsaved work?";
}
var AGENT_URL_PARAM_OPEN = "agent";
var AGENT_URL_PARAM_VIEW = "agentView";
var AGENT_URL_PARAM_CONVERSATION = "agentConversation";
function parseAgentPanelUrl(searchParams) {
	const agent = searchParams.get(AGENT_URL_PARAM_OPEN);
	return {
		open: agent === "open" || agent === "1" || agent === "true",
		view: searchParams.get("agentView") === "history" ? "history" : "chat",
		conversationId: searchParams.get("agentConversation")?.trim() || null
	};
}
function applyAgentPanelUrl(searchParams, patch) {
	const next = new URLSearchParams(searchParams.toString());
	const open = patch.open ?? parseAgentPanelUrl(next).open;
	const view = patch.view ?? parseAgentPanelUrl(next).view;
	const conversationId = open ? patch.conversationId !== void 0 ? patch.conversationId : parseAgentPanelUrl(next).conversationId : null;
	if (open) next.set(AGENT_URL_PARAM_OPEN, "open");
	else {
		next.delete(AGENT_URL_PARAM_OPEN);
		next.delete(AGENT_URL_PARAM_VIEW);
		next.delete(AGENT_URL_PARAM_CONVERSATION);
	}
	if (open && view === "history") next.set(AGENT_URL_PARAM_VIEW, "history");
	else next.delete(AGENT_URL_PARAM_VIEW);
	if (open && conversationId) next.set(AGENT_URL_PARAM_CONVERSATION, conversationId);
	else next.delete(AGENT_URL_PARAM_CONVERSATION);
	return next;
}
function agentPanelHref(pathname, searchParams, patch) {
	const query = applyAgentPanelUrl(searchParams, patch).toString();
	return query.length > 0 ? `${pathname}?${query}` : pathname;
}
function useAgentPanelUrl({ isOpen, setOpen, showHistory, setShowHistory, conversationId, onLoadConversation }) {
	const pathname = usePathname();
	const router = useRouter$1();
	const searchParams = useUrlSearchParamsContext();
	const hydratedFromUrlRef = (0, import_react.useRef)(false);
	const lastPushedRef = (0, import_react.useRef)(null);
	const replaceUrl = (0, import_react.useCallback)((patch) => {
		const href = agentPanelHref(pathname, searchParams, {
			open: patch.open ?? isOpen,
			view: patch.view ?? (showHistory ? "history" : "chat"),
			conversationId: patch.conversationId !== void 0 ? patch.conversationId : conversationId
		});
		if (lastPushedRef.current === href) return;
		lastPushedRef.current = href;
		router.replace(href, { scroll: false });
	}, [
		conversationId,
		isOpen,
		pathname,
		router,
		searchParams,
		showHistory
	]);
	const hydrateFromUrl = (0, import_react.useEffectEvent)(() => {
		const parsed = parseAgentPanelUrl(searchParams);
		if (parsed.open) setOpen(true);
		if (parsed.view === "history") setShowHistory(true);
		if (parsed.conversationId && onLoadConversation) onLoadConversation(parsed.conversationId);
		lastPushedRef.current = agentPanelHref(pathname, searchParams, {
			open: parsed.open || isOpen,
			view: parsed.view === "history" ? "history" : showHistory ? "history" : "chat",
			conversationId: parsed.conversationId ?? conversationId
		});
	});
	const urlSyncKeyRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (hydratedFromUrlRef.current) return;
		hydratedFromUrlRef.current = true;
		hydrateFromUrl();
	}, [searchParams]);
	const urlSyncKey = `${isOpen}|${showHistory ? "history" : "chat"}|${conversationId ?? ""}`;
	(0, import_react.useEffect)(() => {
		if (!hydratedFromUrlRef.current || urlSyncKeyRef.current === urlSyncKey) return;
		urlSyncKeyRef.current = urlSyncKey;
		replaceUrl({
			open: isOpen,
			view: showHistory ? "history" : "chat",
			conversationId
		});
	}, [
		conversationId,
		isOpen,
		replaceUrl,
		showHistory,
		urlSyncKey
	]);
	const openHistoryView = () => {
		setShowHistory(true);
		replaceUrl({
			open: true,
			view: "history"
		});
	};
	const closeHistoryView = () => {
		setShowHistory(false);
		replaceUrl({
			open: isOpen,
			view: "chat"
		});
	};
	return {
		openHistoryView,
		closeHistoryView,
		replaceUrl
	};
}
var MENTION_MARKUP_REGEX = /@\[([^\]]+)\]\((client|project|team|user):([^)]+)\)/g;
function formatAgentMentionMarkup(entity) {
	return `@[${entity.name}](${entity.type}:${entity.id})`;
}
function parseAgentMentionsFromText(text) {
	const mentions = [];
	const seen = /* @__PURE__ */ new Set();
	for (const match of text.matchAll(MENTION_MARKUP_REGEX)) {
		const name = match[1]?.trim();
		const type = match[2];
		const id = match[3]?.trim();
		if (!name || !type || !id) continue;
		const key = `${type}:${id}`;
		if (seen.has(key)) continue;
		seen.add(key);
		mentions.push({
			id,
			name,
			type
		});
	}
	return mentions;
}
function mergeAgentMentions(fromText, selected) {
	const map = /* @__PURE__ */ new Map();
	for (const mention of [...selected, ...fromText]) map.set(`${mention.type}:${mention.id}`, mention);
	return [...map.values()];
}
function parseAgentMentionsFromStored(value) {
	if (!Array.isArray(value)) return void 0;
	const mentions = [];
	for (const entry of value) {
		if (!entry || typeof entry !== "object") continue;
		const record = entry;
		const id = typeof record.id === "string" ? record.id : null;
		const name = typeof record.name === "string" ? record.name : null;
		const type = record.type;
		if (!id || !name) continue;
		if (type !== "client" && type !== "project" && type !== "team" && type !== "user") continue;
		mentions.push({
			id,
			name,
			type,
			subtitle: typeof record.subtitle === "string" ? record.subtitle : void 0
		});
	}
	return mentions.length > 0 ? mentions : void 0;
}
function useAgentPanelComposer({ isOpen, isProcessing, isExtractingAttachments, onSendMessage }) {
	const [inputValue, setInputValue] = (0, import_react.useState)("");
	const [composerMentions, setComposerMentions] = (0, import_react.useState)([]);
	const [showMentions, setShowMentions] = (0, import_react.useState)(false);
	const [mentionQuery, setMentionQuery] = (0, import_react.useState)("");
	const inputRef = (0, import_react.useRef)(null);
	const mentionDropdownRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!isOpen || !inputRef.current) return;
		const focusTimeoutId = window.setTimeout(() => inputRef.current?.focus(), 100);
		return () => {
			window.clearTimeout(focusTimeoutId);
		};
	}, [isOpen]);
	const handleVoiceTranscript = (text) => {
		if (text.trim()) {
			onSendMessage(text);
			setInputValue("");
		}
	};
	const handleVoiceInterim = (text) => {
		setInputValue(text);
	};
	const handleSubmit = () => {
		if (inputValue.trim() && !isProcessing && !isExtractingAttachments) {
			const mentions = mergeAgentMentions(parseAgentMentionsFromText(inputValue), composerMentions);
			onSendMessage(inputValue.trim(), { mentions });
			setInputValue("");
			setComposerMentions([]);
			setShowMentions(false);
		}
	};
	const handleInputChange = (e) => {
		const value = e.target.value;
		setInputValue(value);
		const cursorPos = e.target.selectionStart ?? value.length;
		const textBeforeCursor = value.slice(0, cursorPos);
		const atIndex = textBeforeCursor.lastIndexOf("@");
		if (atIndex !== -1) {
			if ((atIndex > 0 ? textBeforeCursor[atIndex - 1] : " ") === " " || atIndex === 0) {
				const query = textBeforeCursor.slice(atIndex + 1);
				if (!query.includes(" ")) {
					setMentionQuery(query);
					setShowMentions(true);
					return;
				}
			}
		}
		setShowMentions(false);
		setComposerMentions((prev) => mergeAgentMentions(parseAgentMentionsFromText(value), prev));
	};
	const handleMentionSelect = (item) => {
		const cursorPos = inputRef.current?.selectionStart ?? inputValue.length;
		const atIndex = inputValue.slice(0, cursorPos).lastIndexOf("@");
		if (atIndex !== -1) {
			const beforeMention = inputValue.slice(0, atIndex);
			const afterMention = inputValue.slice(cursorPos);
			const entity = {
				id: item.id,
				name: item.name,
				type: item.type,
				subtitle: item.subtitle
			};
			const insertedMention = `${formatAgentMentionMarkup(entity)} `;
			const newValue = `${beforeMention}${insertedMention}${afterMention}`;
			const nextCursorPos = beforeMention.length + insertedMention.length;
			setInputValue(newValue);
			setComposerMentions((prev) => mergeAgentMentions([entity], prev));
			requestAnimationFrame(() => {
				inputRef.current?.focus();
				inputRef.current?.setSelectionRange(nextCursorPos, nextCursorPos);
			});
		}
		setShowMentions(false);
	};
	const clearComposer = () => {
		setInputValue("");
		setComposerMentions([]);
		setShowMentions(false);
		setMentionQuery("");
	};
	const closeMentions = () => {
		setShowMentions(false);
	};
	return {
		inputValue,
		setInputValue,
		composerMentions,
		showMentions,
		mentionQuery,
		inputRef,
		mentionDropdownRef,
		handleVoiceTranscript,
		handleVoiceInterim,
		handleSubmit,
		handleInputChange,
		handleMentionSelect,
		clearComposer,
		closeMentions
	};
}
var noop = () => {};
var EMPTY_PROCESSING_STEPS = [];
function useAgentModePanel({ runtime, maxMessageLength, onClose, onOpenChange, requestCloseRef, onPanelLayoutChange, messages, onSendMessage, pendingAttachments, onAddAttachments, onRemoveAttachment, onClear, conversationId, history, historyLoad, loadingConversationId = null, onOpenHistory, onSelectConversation, onUpdateConversationTitle, onDeleteConversation, onDuplicateConversation, onExportConversation, onShareConversation, onClearError, lastFailedMessage, onRetry, onRetryLastUserTurn, onRetryUserMessage, onConfirmPending, onUndoAction, processingSteps = EMPTY_PROCESSING_STEPS, processingLabel = "Thinking…", scrollContainerRef: scrollContainerRefProp, onMessagesScroll, scrollBehavior, onJumpToLatest, connectionStatus = "connected", rateLimitCountdown, workspaceId = null, onStoreSpreadsheetExport, error = null, historyError = null, historyHasMore = false, historySearch = "", onHistorySearchChange, onShowArchivedHistoryChange, onLoadMoreHistory, onRetryHistory, onPinConversation, onArchiveConversation }) {
	const { open: isOpen, processing: isProcessing, extractingAttachments: isExtractingAttachments } = runtime;
	const { historyLoading: isHistoryLoading, conversationLoading: isConversationLoading = false, showArchived: showArchivedHistory = false } = historyLoad;
	const { pinnedToBottom: isPinnedToBottom = true } = scrollBehavior ?? {};
	const pathname = usePathname();
	const { user } = useAuth();
	const [panelLayout, setPanelLayout] = (0, import_react.useState)(() => typeof window === "undefined" ? "fullscreen" : readAgentPanelLayout());
	const [showHistory, setShowHistory] = (0, import_react.useState)(false);
	const [editingConversationId, setEditingConversationId] = (0, import_react.useState)(null);
	const [editingTitle, setEditingTitle] = (0, import_react.useState)("");
	const fileInputRef = (0, import_react.useRef)(null);
	const localScrollRef = (0, import_react.useRef)(null);
	const scrollAreaRef = scrollContainerRefProp ?? localScrollRef;
	const isDraggingFilesRef = (0, import_react.useRef)(false);
	const { clients, projects, teams, users, allItems, isLoading: mentionsLoading } = useMentionData();
	const mentionLabels = allItems.map((item) => item.name);
	const quickSuggestions = getAgentSuggestions(pathname, { role: user?.role });
	const { inputValue, showMentions, mentionQuery, inputRef, mentionDropdownRef, handleVoiceTranscript, handleVoiceInterim, handleSubmit, handleInputChange, handleMentionSelect, clearComposer, closeMentions } = useAgentPanelComposer({
		isOpen,
		isProcessing,
		isExtractingAttachments,
		onSendMessage
	});
	const handleRetryUserMessage = (clientId, content) => {
		onRetryUserMessage?.(clientId, content);
	};
	const handleSetPanelLayout = (layout) => {
		setPanelLayout(layout);
		writeAgentPanelLayout(layout);
		onPanelLayoutChange?.(layout);
	};
	const closeGuardState = {
		composerText: inputValue,
		pendingAttachments,
		isProcessing,
		isExtractingAttachments,
		messages
	};
	const requestClose = (0, import_react.useEffectEvent)(() => {
		if (shouldBlockAgentClose(closeGuardState)) {
			if (!window.confirm(agentCloseBlockerMessage(getAgentCloseBlockers(closeGuardState)))) return;
		}
		onClose();
	});
	(0, import_react.useEffect)(() => {
		if (!requestCloseRef) return;
		requestCloseRef.current = requestClose;
	}, [requestCloseRef]);
	(0, import_react.useEffect)(() => {
		if (!requestCloseRef) return;
		const closeRef = requestCloseRef;
		return () => {
			closeRef.current = null;
		};
	}, [requestCloseRef]);
	const { openHistoryView, closeHistoryView } = useAgentPanelUrl({
		isOpen,
		setOpen: (open) => {
			if (open) onOpenChange?.(true);
			else requestClose();
		},
		showHistory,
		setShowHistory,
		conversationId,
		onLoadConversation: (id) => {
			onSelectConversation(id);
		}
	});
	const handleKeyDown = (e) => {
		if (showMentions && mentionDropdownRef.current?.handleKeyDown(e)) return;
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
		if (e.key === "Escape") {
			e.preventDefault();
			if (showHistory && editingConversationId) {
				setEditingConversationId(null);
				return;
			}
			if (showHistory) {
				closeHistoryView();
				return;
			}
			requestClose();
		}
	};
	const handleSuggestionClick = (suggestion) => {
		trackAgentSuggestionClick({
			suggestionId: suggestion.id,
			prompt: suggestion.prompt,
			pathname,
			operation: suggestion.operation
		});
		onSendMessage(suggestion.prompt);
	};
	const handleCloseMentions = closeMentions;
	const handleOpenFilePicker = () => {
		fileInputRef.current?.click();
	};
	const handleFileSelection = async (event) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;
		await onAddAttachments(files);
		event.target.value = "";
	};
	const handleDragOver = (event) => {
		event.preventDefault();
		if (event.dataTransfer.types.includes("Files")) isDraggingFilesRef.current = true;
	};
	const handleDragLeave = (event) => {
		event.preventDefault();
		const nextTarget = event.relatedTarget;
		if (!nextTarget || !(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) isDraggingFilesRef.current = false;
	};
	const handleDrop = async (event) => {
		event.preventDefault();
		isDraggingFilesRef.current = false;
		if (event.dataTransfer.files.length === 0) return;
		await onAddAttachments(event.dataTransfer.files);
	};
	const handleRetry = () => {
		onClearError?.();
		onRetry?.();
	};
	const handleStartNewChat = () => {
		onClear();
		clearComposer();
		closeHistoryView();
		setEditingConversationId(null);
		setEditingTitle("");
		setTimeout(() => inputRef.current?.focus(), 0);
	};
	const handleToggleHistory = () => {
		if (showHistory) {
			closeHistoryView();
			return;
		}
		onOpenHistory();
		openHistoryView();
	};
	const handleCloseHistory = () => {
		closeHistoryView();
	};
	const handleDuplicateConversation = async (targetConversationId) => {
		const newId = await onDuplicateConversation?.(targetConversationId);
		if (newId) {
			notifySuccess({ message: "Chat duplicated" });
			await onSelectConversation(newId);
		}
	};
	const handleExportConversation = async (targetConversationId) => {
		const exported = await onExportConversation?.(targetConversationId, "markdown");
		if (!exported) return;
		const blob = new Blob([exported.content], { type: "text/markdown;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `${exported.title.replace(/[^\w.-]+/g, "-").slice(0, 48) || "agent-chat"}.md`;
		anchor.click();
		URL.revokeObjectURL(url);
		notifySuccess({ message: "Chat exported" });
	};
	const handleShareConversation = async (targetConversationId) => {
		const shared = await onShareConversation?.(targetConversationId);
		if (!shared) return;
		const payload = `${shared.markdown}\n\nOpen in Cohort: ${shared.deepLink}`;
		try {
			await navigator.clipboard.writeText(payload);
			notifySuccess({ message: "Share link copied to clipboard" });
		} catch {
			notifySuccess({ message: "Share text ready — copy from export if clipboard is blocked" });
		}
	};
	const handleStartNewChatShortcut = () => {
		if (!isOpen) return;
		handleStartNewChat();
	};
	const handleToggleHistoryShortcut = () => {
		if (!isOpen) return;
		handleToggleHistory();
	};
	const handleAttachShortcut = () => {
		if (!isOpen || isProcessing) return;
		handleOpenFilePicker();
	};
	const handleFocusComposerShortcut = () => {
		if (!isOpen) return;
		inputRef.current?.focus();
	};
	useKeyboardShortcut({
		combo: "mod+shift+n",
		callback: handleStartNewChatShortcut,
		enabled: isOpen
	});
	useKeyboardShortcut({
		combo: "mod+shift+h",
		callback: handleToggleHistoryShortcut,
		enabled: isOpen
	});
	useKeyboardShortcut({
		combo: "mod+shift+u",
		callback: handleAttachShortcut,
		enabled: isOpen
	});
	useKeyboardShortcut({
		combo: "mod+shift+l",
		callback: handleFocusComposerShortcut,
		enabled: isOpen
	});
	const handleStartEditingConversation = (conversationIdValue, title) => {
		setEditingConversationId(conversationIdValue);
		setEditingTitle(title);
	};
	const handleStopEditingConversation = () => {
		setEditingConversationId(null);
	};
	const handleDocumentEscape = (0, import_react.useEffectEvent)((e) => {
		if (e.key !== "Escape") return;
		if (showMentions) return;
		if (showHistory && editingConversationId) {
			e.preventDefault();
			e.stopPropagation();
			setEditingConversationId(null);
			return;
		}
		if (showHistory) {
			e.preventDefault();
			e.stopPropagation();
			closeHistoryView();
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		requestClose();
	});
	(0, import_react.useEffect)(() => {
		if (!isOpen) return;
		const onDocumentKeyDown = (e) => {
			handleDocumentEscape(e);
		};
		document.addEventListener("keydown", onDocumentKeyDown, true);
		return () => document.removeEventListener("keydown", onDocumentKeyDown, true);
	}, [isOpen]);
	const showEmptyState = messages.length === 0 && !isConversationLoading;
	const hasExtractingAttachments = pendingAttachments.some((attachment) => attachment.extractionStatus === "extracting");
	const isInputDisabled = isProcessing || isExtractingAttachments || hasExtractingAttachments || typeof rateLimitCountdown === "number" && rateLimitCountdown > 0;
	const sharedComposerProps = {
		inputValue,
		inputRef,
		mentionLabels,
		maxMessageLength,
		showMentions,
		mentionQuery,
		clients,
		projects,
		teams,
		users,
		mentionsLoading,
		pendingAttachments,
		isExtractingAttachments,
		onInputChange: handleInputChange,
		onKeyDown: handleKeyDown,
		onOpenFilePicker: handleOpenFilePicker,
		onCloseMentions: handleCloseMentions,
		onSelectMention: handleMentionSelect,
		onVoiceTranscript: handleVoiceTranscript,
		onVoiceInterim: handleVoiceInterim,
		onRemoveAttachment,
		onSubmit: handleSubmit,
		mentionDropdownRef
	};
	const emptyComposerProps = {
		...sharedComposerProps,
		layout: "centered",
		disabled: isInputDisabled,
		quickSuggestions,
		onSuggestionClick: handleSuggestionClick
	};
	const dockComposerProps = {
		...sharedComposerProps,
		layout: "dock",
		disabled: isInputDisabled || isConversationLoading
	};
	(0, import_react.useEffect)(() => {
		if (!showHistory || !onRetryHistory) return;
		const timeoutId = window.setTimeout(() => {
			onRetryHistory();
		}, 350);
		return () => window.clearTimeout(timeoutId);
	}, [
		historySearch,
		onRetryHistory,
		showArchivedHistory,
		showHistory
	]);
	const historyPanelProps = {
		showHistory,
		history,
		isHistoryLoading,
		historyError: historyError ?? null,
		historyHasMore: historyHasMore ?? false,
		historySearch: historySearch ?? "",
		onHistorySearchChange: onHistorySearchChange ?? (() => {}),
		showArchivedHistory: showArchivedHistory ?? false,
		onShowArchivedHistoryChange: onShowArchivedHistoryChange ?? (() => {}),
		conversationId,
		messagesCount: messages.length,
		isConversationLoading,
		loadingConversationId,
		editingConversationId,
		editingTitle,
		setEditingTitle,
		onSelectConversation,
		onUpdateConversationTitle,
		onDeleteConversation,
		onStartNewChat: handleStartNewChat,
		onClose: handleCloseHistory,
		onStartEditing: handleStartEditingConversation,
		onStopEditing: handleStopEditingConversation,
		onRetryHistory: onRetryHistory ?? (() => {}),
		onLoadMoreHistory: onLoadMoreHistory ?? (() => {}),
		onPinConversation: onPinConversation ?? (() => {}),
		onArchiveConversation: onArchiveConversation ?? (() => {}),
		onDuplicateConversation: handleDuplicateConversation,
		onExportConversation: handleExportConversation,
		onShareConversation: handleShareConversation
	};
	const headerProps = {
		connectionStatus,
		conversationId,
		activeConversationTitle: (() => {
			if (!conversationId) return null;
			return history.find((entry) => entry.id === conversationId)?.title?.trim() || null;
		})(),
		messagesCount: messages.length,
		showHistory,
		panelLayout,
		onClose: requestClose,
		onStartNewChat: handleStartNewChat,
		onToggleHistory: handleToggleHistory,
		onSetPanelLayout: handleSetPanelLayout
	};
	const handleShellOpenChange = (open) => {
		if (open) onOpenChange?.(true);
	};
	useKeyboardShortcut({
		combo: "mod+shift+a",
		callback: () => {
			if (isOpen) requestClose();
			else onOpenChange?.(true);
		}
	});
	return {
		isOpen,
		panelLayout,
		attachmentAccept: AGENT_ATTACHMENT_ACCEPT,
		fileInputRef,
		composerInputRef: inputRef,
		headerProps,
		historyPanelProps,
		agentError: error,
		lastFailedMessage: lastFailedMessage ?? null,
		onClearError,
		onDragLeave: handleDragLeave,
		onDragOver: handleDragOver,
		onDrop: handleDrop,
		onFileSelection: handleFileSelection,
		rateLimitCountdown,
		handleShellOpenChange,
		requestClose,
		dockComposerProps,
		emptyComposerProps,
		isConversationLoading,
		isProcessing,
		mentionLabels,
		messages,
		onRetry: handleRetry,
		onRetryLastUserTurn,
		onRetryUserMessage: handleRetryUserMessage,
		onConfirmPending,
		onUndoAction,
		processingSteps,
		processingLabel,
		scrollAreaRef,
		onMessagesScroll: onMessagesScroll ?? noop,
		showJumpToLatest: !isPinnedToBottom && messages.length > 0,
		onJumpToLatest: onJumpToLatest ?? noop,
		showEmptyState,
		workspaceId,
		onStoreSpreadsheetExport
	};
}
function AgentModePanel(props) {
	const { isOpen, panelLayout, attachmentAccept, fileInputRef, composerInputRef, headerProps, historyPanelProps, agentError, lastFailedMessage, onClearError, onDragLeave, onDragOver, onDrop, onFileSelection, rateLimitCountdown, handleShellOpenChange, requestClose, dockComposerProps, emptyComposerProps, isConversationLoading, isProcessing, mentionLabels, messages, onRetry, onRetryLastUserTurn, onRetryUserMessage, onConfirmPending, onUndoAction, processingSteps, processingLabel, scrollAreaRef, onMessagesScroll, showJumpToLatest, onJumpToLatest, showEmptyState, workspaceId, onStoreSpreadsheetExport } = useAgentModePanel(props);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentModePanelShell, {
		isOpen,
		onOpenChange: handleShellOpenChange,
		onRequestClose: requestClose,
		panelLayout,
		attachmentAccept,
		fileInputRef,
		composerInputRef,
		headerProps,
		historyPanelProps,
		agentError,
		lastFailedMessage,
		onClearError,
		onDragLeave,
		onDragOver,
		onDrop,
		onFileSelection,
		rateLimitCountdown,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentModePanelContent, {
			dockComposerProps,
			emptyComposerProps,
			viewState: {
				conversationLoading: isConversationLoading,
				processing: isProcessing,
				showJumpToLatest,
				showEmptyState
			},
			lastFailedMessage,
			mentionLabels,
			messages,
			onRetry,
			onRetryLastUserTurn,
			onRetryUserMessage,
			onConfirmPending,
			onUndoAction,
			processingSteps: processingSteps ?? [],
			processingLabel,
			scrollAreaRef,
			onMessagesScroll,
			onJumpToLatest,
			conversationId: props.conversationId,
			workspaceId,
			onStoreSpreadsheetExport
		})
	});
}
var OPERATION_LABELS = {
	createTask: "Creating task",
	updateTask: "Updating task",
	createProject: "Creating project",
	updateProject: "Updating project",
	createClient: "Creating client",
	updateClient: "Updating client",
	sendDirectMessage: "Sending message",
	createProposalDraft: "Drafting proposal",
	updateProposalDraft: "Updating proposal",
	generateProposalFromDraft: "Generating proposal",
	summarizeAdsPerformance: "Checking ads performance",
	exportSpreadsheet: "Building Excel export",
	generatePerformanceReport: "Building report",
	advanceProposalConversation: "Gathering proposal details"
};
function operationProcessingLabel(operation) {
	if (!operation) return "Preparing response…";
	return OPERATION_LABELS[operation] ?? `Running ${operation}…`;
}
function buildProcessingSteps(operation) {
	return [
		{
			id: "parse",
			label: "Parsed request",
			status: "active"
		},
		{
			id: "context",
			label: "Resolved context",
			status: "pending"
		},
		{
			id: "action",
			label: (operation ? operationProcessingLabel(operation) : "Running action…").replace(/…$/, ""),
			status: "pending"
		},
		{
			id: "done",
			label: "Done",
			status: "pending"
		}
	];
}
function buildCompletedStepsFromResponse(response) {
	const action = response.action ?? "response";
	const operation = response.operation ?? null;
	const executeFailed = response.executeResult?.success === false;
	return [
		{
			id: "parse",
			label: "Parsed request",
			status: "completed"
		},
		{
			id: "context",
			label: "Resolved context",
			status: "completed"
		},
		{
			id: "action",
			label: action === "navigate" ? "Navigation" : action === "execute" ? operationProcessingLabel(operation).replace(/…$/, "") : action === "clarify" ? "Clarification" : "Response",
			status: executeFailed ? "failed" : "completed",
			detail: executeFailed ? response.executeResult?.userMessage : void 0
		},
		{
			id: "done",
			label: executeFailed ? "Needs attention" : "Done",
			status: executeFailed ? "failed" : "completed"
		}
	];
}
function deriveAgentStatusFromResponse(response) {
	const metadata = {
		action: response.action,
		operation: response.operation ?? void 0,
		requiresConfirmation: response.requiresConfirmation,
		confirmation: response.confirmation,
		pendingConfirmation: response.pendingExecution ? {
			...response.pendingExecution,
			agentMessageId: response.agentMessageId
		} : void 0
	};
	if (response.requiresConfirmation) {
		metadata.success = false;
		return {
			status: "warning",
			metadata
		};
	}
	const undoHintRaw = response.executeResult?.data?.undoHint;
	if (undoHintRaw && typeof undoHintRaw === "object" && !Array.isArray(undoHintRaw)) {
		const hint = undoHintRaw;
		const resourceId = typeof hint.resourceId === "string" ? hint.resourceId : null;
		const type = hint.type;
		if (resourceId && (type === "task" || type === "project" || type === "message")) metadata.undoHint = {
			type,
			resourceId,
			label: typeof hint.label === "string" ? hint.label : "Created"
		};
	}
	if (response.action === "navigate" && response.route) {
		metadata.success = true;
		return {
			status: "success",
			metadata
		};
	}
	if (response.action === "execute" && response.executeResult) {
		const success = response.executeResult.success;
		const exec = response.executeResult;
		const mergedData = { ...exec.data && typeof exec.data === "object" && !Array.isArray(exec.data) ? exec.data : {} };
		if (typeof exec.retryable === "boolean") mergedData.retryable = exec.retryable;
		if (typeof exec.userMessage === "string" && exec.userMessage.trim()) mergedData.userMessage = exec.userMessage;
		metadata.success = success;
		metadata.data = Object.keys(mergedData).length > 0 ? mergedData : void 0;
		return {
			status: success ? "success" : "error",
			metadata
		};
	}
	metadata.success = true;
	return {
		status: "info",
		metadata
	};
}
/** Upsert by clientId — retries update the same bubble instead of appending. */
function upsertAgentMessage(messages, message) {
	const index = messages.findIndex((entry) => entry.clientId === message.clientId);
	if (index === -1) return [...messages, message];
	const next = [...messages];
	const existing = next[index];
	next[index] = {
		...existing,
		...message,
		id: message.id || existing?.id || message.clientId
	};
	return next;
}
/** Exclude in-flight / failed optimistic turns from server context payloads. */
function filterMessagesForAgentContext(messages, limit) {
	return messages.filter((entry) => entry.lifecycle !== "failed" && entry.lifecycle !== "sending").slice(-limit);
}
/** Count user rows per clientId — used to guard against duplicate optimistic bubbles. */
function parsePendingConfirmationFromStored(executeResult, params, agentMessageId) {
	const data = executeResult && typeof executeResult.data === "object" && !Array.isArray(executeResult.data) ? executeResult.data : executeResult;
	const pending = data && typeof data.pendingConfirmation === "object" && !Array.isArray(data.pendingConfirmation) ? data.pendingConfirmation : null;
	if (pending) {
		const operation = typeof pending.operation === "string" ? pending.operation : null;
		const confirmationId = typeof pending.confirmationId === "string" ? pending.confirmationId : null;
		if (operation && confirmationId) {
			let parsedParams = params ?? {};
			if (typeof pending.paramsJson === "string") try {
				parsedParams = JSON.parse(pending.paramsJson);
			} catch {
				parsedParams = params ?? {};
			}
			return {
				confirmationId,
				operation,
				params: parsedParams,
				agentMessageId
			};
		}
	}
	if (params?._pendingConfirmation === true) {
		const operation = typeof params._operation === "string" ? params._operation : typeof params.operation === "string" ? params.operation : null;
		if (operation) {
			const cleanParams = Object.fromEntries(Object.entries(params).filter(([key]) => !key.startsWith("_")));
			return {
				confirmationId: typeof params._confirmationId === "string" ? params._confirmationId : agentMessageId ?? operation,
				operation,
				params: cleanParams,
				agentMessageId
			};
		}
	}
	return null;
}
function useAgentAttachments(workspaceId) {
	const convex = useConvex();
	const extractPdfTextAction = useAction(agentApi.extractPdfText);
	const generateUploadUrl = useMutation(filesApi.generateUploadUrl);
	const syncMetadata = useMutation(filesApi.syncMetadata);
	const [pendingAttachments, setPendingAttachments] = (0, import_react.useState)([]);
	const [isExtractingAttachments, setIsExtractingAttachments] = (0, import_react.useState)(false);
	const getPublicUrl = (args) => {
		if (!workspaceId) throw new Error("Workspace context missing");
		return convex.query(filesApi.getPublicUrl, {
			workspaceId,
			storageId: args.storageId
		});
	};
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
		} catch (err) {
			logError(err, "useAgentMode:serverPdfExtraction");
			return null;
		}
	};
	const persistAttachmentFile = async (file, attachment) => {
		if (isPreviewModeEnabled() || !workspaceId) return attachment;
		try {
			const { storageId, url } = await uploadStorageFileWithPublicUrl({
				file,
				contentType: file.type || "application/octet-stream",
				generateUploadUrl: () => generateUploadUrl({}),
				syncMetadata: (args) => syncMetadata(args),
				getPublicUrl
			});
			return {
				...attachment,
				storageId,
				url
			};
		} catch (err) {
			logError(err, "useAgentMode:attachmentUpload");
			return {
				...attachment,
				errorMessage: attachment.errorMessage ?? "File was read but could not be saved to storage."
			};
		}
	};
	const addAttachments = async (files) => {
		const nextFiles = Array.from(files);
		if (nextFiles.length === 0) return;
		const placeholders = nextFiles.map((file) => createPendingAttachmentPlaceholder(file));
		setPendingAttachments((prev) => [...prev, ...placeholders]);
		setIsExtractingAttachments(true);
		try {
			await Promise.all(nextFiles.map(async (file, index) => {
				const placeholderId = placeholders[index]?.id;
				if (!file || !placeholderId) return;
				try {
					const withStorage = await persistAttachmentFile(file, await buildAgentAttachmentContext(file, { extractPdfOnServer }));
					setPendingAttachments((prev) => prev.map((attachment) => attachment.id === placeholderId ? withStorage : attachment));
				} catch (err) {
					logError(err, "useAgentMode:attachmentProcessing");
					setPendingAttachments((prev) => prev.map((attachment) => attachment.id === placeholderId ? {
						...attachment,
						extractionStatus: "failed",
						excerpt: "Could not read this file.",
						errorMessage: err instanceof Error ? err.message : "Could not process this attachment."
					} : attachment));
				}
			}));
		} finally {
			setIsExtractingAttachments(false);
		}
	};
	const removeAttachment = (attachmentId) => {
		setPendingAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId));
	};
	const clearAttachments = () => {
		setPendingAttachments([]);
	};
	return {
		pendingAttachments,
		setPendingAttachments,
		isExtractingAttachments,
		addAttachments,
		removeAttachment,
		clearAttachments
	};
}
function buildAgentConversationShareLink(conversationId) {
	if (typeof window === "undefined") return `/dashboard?agentConversation=${encodeURIComponent(conversationId)}`;
	const url = new URL(window.location.href);
	url.searchParams.set("agentConversation", conversationId);
	return url.toString();
}
var AGENT_MAX_MESSAGE_LENGTH = 4e3;
var MIN_MESSAGE_LENGTH = 1;
function asRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function parseStoredExecuteResultData(executeResult) {
	if (!executeResult) return void 0;
	let data = {};
	const directData = asRecord(executeResult.data);
	if (directData) data = { ...directData };
	else {
		const dataJson = typeof executeResult.dataJson === "string" ? executeResult.dataJson : null;
		if (dataJson) try {
			const parsed = asRecord(JSON.parse(dataJson));
			if (parsed) data = { ...parsed };
		} catch {}
	}
	if (typeof executeResult.retryable === "boolean") data = {
		...data,
		retryable: executeResult.retryable
	};
	if (typeof executeResult.userMessage === "string" && executeResult.userMessage.trim().length > 0) data = {
		...data,
		userMessage: executeResult.userMessage
	};
	return Object.keys(data).length > 0 ? data : void 0;
}
function generateId() {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
/**
* Validate user input before sending
*/
function validateInput(text) {
	const trimmed = text.trim();
	if (trimmed.length < MIN_MESSAGE_LENGTH) return "Message is too short";
	if (trimmed.length > 4e3) return `Message too long (max ${AGENT_MAX_MESSAGE_LENGTH} characters)`;
	return null;
}
function mapStoredMessagesToAgentMessages(stored) {
	return stored.map((msg) => {
		const type = msg.type === "user" ? "user" : "agent";
		const action = typeof msg.action === "string" ? msg.action : null;
		const operation = typeof msg.operation === "string" ? msg.operation : null;
		const executeResult = msg.executeResult && typeof msg.executeResult === "object" ? msg.executeResult : null;
		const executionSuccess = executeResult && typeof executeResult.success === "boolean" ? executeResult.success : null;
		const normalizedAction = action === "navigate" || action === "execute" || action === "clarify" ? action : action ? "response" : void 0;
		const status = normalizedAction === "execute" && executionSuccess !== null ? executionSuccess ? "success" : "error" : normalizedAction === "navigate" ? "success" : "info";
		const pendingConfirmation = type === "agent" ? parsePendingConfirmationFromStored(executeResult, msg.params, msg.id) : null;
		const storedData = parseStoredExecuteResultData(executeResult);
		const undoHintRaw = storedData?.undoHint;
		const undoHint = undoHintRaw && typeof undoHintRaw === "object" && !Array.isArray(undoHintRaw) && typeof undoHintRaw.resourceId === "string" && (undoHintRaw.type === "task" || undoHintRaw.type === "project" || undoHintRaw.type === "message") ? {
			type: undoHintRaw.type,
			resourceId: undoHintRaw.resourceId,
			label: typeof undoHintRaw.label === "string" ? undoHintRaw.label : "Created"
		} : void 0;
		const storedMentions = msg.params && typeof msg.params === "object" && !Array.isArray(msg.params) ? parseAgentMentionsFromStored(msg.params.mentions) : void 0;
		const storedAttachmentsFromParams = msg.params && typeof msg.params === "object" && !Array.isArray(msg.params) ? parseAgentAttachmentsFromStored(msg.params.attachments) : void 0;
		const storedExportAttachment = parseStoredSpreadsheetExport(storedData);
		const storedAttachments = storedAttachmentsFromParams || storedExportAttachment ? [...storedAttachmentsFromParams ?? [], ...storedExportAttachment && !storedAttachmentsFromParams?.some((item) => item.id === storedExportAttachment.id) ? [storedExportAttachment] : []] : void 0;
		return {
			id: msg.id,
			clientId: msg.id,
			type,
			content: msg.content,
			timestamp: new Date(msg.timestamp),
			route: msg.route,
			status: pendingConfirmation ? "warning" : status,
			lifecycle: "sent",
			mentions: storedMentions,
			attachments: storedAttachments,
			metadata: normalizedAction || operation || executeResult || pendingConfirmation ? {
				action: pendingConfirmation ? "clarify" : normalizedAction,
				operation: operation ?? void 0,
				success: executionSuccess ?? void 0,
				data: storedData,
				requiresConfirmation: pendingConfirmation ? true : void 0,
				pendingConfirmation: pendingConfirmation ?? void 0,
				undoHint
			} : void 0
		};
	});
}
function useAgentConversationHistory({ workspaceId, userId, conversationId, messages, setMessages, setConversationId, addMessage, handleError, setIsProcessing, clearError }) {
	const convex = useConvex();
	const listConversations = useAction(agentApi.listConversations);
	const getConversation = useAction(agentApi.getConversation);
	const duplicateConversationAction = useAction(agentApi.duplicateConversation);
	const exportConversationAction = useAction(agentApi.exportConversation);
	const shareConversationAction = useAction(agentApi.shareConversation);
	const updateTitle = useMutation(agentApi.updateConversationTitle);
	const deleteConversationMutation = useMutation(agentApi.deleteConversation);
	const setConversationFlags = useMutation(agentApi.setConversationFlags);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [isHistoryLoading, setIsHistoryLoading] = (0, import_react.useState)(false);
	const [historyError, setHistoryError] = (0, import_react.useState)(null);
	const [historyHasMore, setHistoryHasMore] = (0, import_react.useState)(false);
	const [historyCursor, setHistoryCursor] = (0, import_react.useState)(null);
	const [historySearch, setHistorySearch] = (0, import_react.useState)("");
	const [showArchivedHistory, setShowArchivedHistory] = (0, import_react.useState)(false);
	const [isConversationLoading, setIsConversationLoading] = (0, import_react.useState)(false);
	const [loadingConversationId, setLoadingConversationId] = (0, import_react.useState)(null);
	const fetchHistory = async (options) => {
		const reset = options?.reset ?? true;
		setIsHistoryLoading(true);
		setHistoryError(null);
		try {
			if (isPreviewModeEnabled()) {
				setHistory([{
					id: conversationId ?? "preview-agent-conversation",
					title: "Sample actions",
					startedAt: messages[0]?.timestamp.toISOString() ?? (/* @__PURE__ */ new Date()).toISOString(),
					lastMessageAt: messages[messages.length - 1]?.timestamp.toISOString() ?? (/* @__PURE__ */ new Date()).toISOString(),
					messageCount: messages.length,
					previewSnippet: messages[messages.length - 1]?.content.slice(0, 120) ?? null
				}]);
				setHistoryHasMore(false);
				setHistoryCursor(null);
				return;
			}
			if (!workspaceId) throw new Error("Workspace context is required");
			const result = await listConversations({
				workspaceId,
				limit: 30,
				cursor: reset ? null : historyCursor,
				search: historySearch.trim() || null,
				includeArchived: showArchivedHistory
			});
			setHistory((prev) => reset ? result.conversations : [...prev, ...result.conversations]);
			setHistoryHasMore(result.hasMore);
			setHistoryCursor(result.nextCursor);
		} catch (err) {
			logError(err, "useAgentMode:fetchHistory");
			setHistoryError(convexErrorMessage(err, "Failed to load conversation history."));
		} finally {
			setIsHistoryLoading(false);
		}
	};
	const loadMoreHistory = async () => {
		if (!historyHasMore || isHistoryLoading) return;
		await fetchHistory({ reset: false });
	};
	const setConversationPinned = async (targetConversationId, pinned) => {
		if (!workspaceId || !userId) return;
		try {
			await setConversationFlags({
				workspaceId,
				legacyId: targetConversationId,
				userId: String(userId),
				pinned
			});
			setHistory((prev) => prev.map((entry) => entry.id === targetConversationId ? {
				...entry,
				pinnedAt: pinned ? (/* @__PURE__ */ new Date()).toISOString() : null
			} : entry));
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useAgentConversationHistory:setConversationPinned",
				title: pinned ? "Could not pin chat" : "Could not unpin chat",
				fallbackMessage: "Sorry — we could not update that chat. Please try again."
			});
		}
	};
	const setConversationArchived = async (targetConversationId, archived) => {
		if (!workspaceId || !userId) return;
		try {
			await setConversationFlags({
				workspaceId,
				legacyId: targetConversationId,
				userId: String(userId),
				archived
			});
			setHistory((prev) => prev.map((entry) => entry.id === targetConversationId ? {
				...entry,
				archivedAt: archived ? (/* @__PURE__ */ new Date()).toISOString() : null,
				pinnedAt: archived ? null : entry.pinnedAt
			} : entry));
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useAgentConversationHistory:setConversationArchived",
				title: archived ? "Could not archive chat" : "Could not unarchive chat",
				fallbackMessage: "Sorry — we could not update that chat. Please try again."
			});
		}
	};
	const loadConversation = async (targetConversationId) => {
		if (!targetConversationId) return;
		if (isPreviewModeEnabled()) {
			setConversationId(targetConversationId);
			return;
		}
		setLoadingConversationId(targetConversationId);
		setIsConversationLoading(true);
		setIsProcessing(true);
		clearError();
		try {
			if (!workspaceId) throw new Error("Workspace context is required");
			const result = await getConversation({
				workspaceId,
				conversationId: targetConversationId,
				limit: 500
			});
			const mapped = mapStoredMessagesToAgentMessages(Array.isArray(result.messages) ? result.messages : []);
			setMessages(await Promise.all(mapped.map(async (message) => {
				if (!message.attachments?.length) return message;
				const attachments = await hydrateAgentAttachmentUrls(message.attachments, (args) => {
					if (!workspaceId) throw new Error("Workspace context missing");
					return convex.query(filesApi.getPublicUrl, {
						workspaceId,
						storageId: args.storageId
					});
				});
				return attachments ? {
					...message,
					attachments
				} : message;
			})));
			setConversationId(targetConversationId);
		} catch (err) {
			logError(err, "useAgentMode:loadConversation");
			handleError(parseAgentError(err, null));
		} finally {
			setLoadingConversationId(null);
			setIsConversationLoading(false);
			setIsProcessing(false);
		}
	};
	const updateConversationTitle = async (targetConversationId, title) => {
		const trimmed = title.trim();
		if (!targetConversationId || !trimmed) return;
		if (isPreviewModeEnabled()) {
			setHistory((prev) => prev.map((conversation) => conversation.id === targetConversationId ? {
				...conversation,
				title: trimmed
			} : conversation));
			return;
		}
		try {
			if (!workspaceId) throw new Error("Workspace context is required");
			await updateTitle({
				workspaceId,
				conversationId: targetConversationId,
				title: trimmed
			});
			setHistory((prev) => prev.map((c) => c.id === targetConversationId ? {
				...c,
				title: trimmed
			} : c));
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useAgentConversationHistory:updateTitle",
				title: "Could not update chat title",
				fallbackMessage: "Sorry — we could not update that chat title. Please try again."
			});
			addMessage("agent", "Sorry — I couldn't update that chat title. Please try again.");
		}
	};
	const deleteConversation = async (targetConversationId) => {
		if (!targetConversationId) return;
		if (isPreviewModeEnabled()) {
			setHistory((prev) => prev.filter((conversation) => conversation.id !== targetConversationId));
			if (conversationId === targetConversationId) {
				setMessages([]);
				setConversationId(null);
			}
			return;
		}
		try {
			if (!workspaceId) throw new Error("Workspace context is required");
			await deleteConversationMutation({
				workspaceId,
				conversationId: targetConversationId
			});
			setHistory((prev) => prev.filter((c) => c.id !== targetConversationId));
			if (conversationId === targetConversationId) {
				setMessages([]);
				setConversationId(null);
			}
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useAgentConversationHistory:deleteConversation",
				title: "Could not delete chat",
				fallbackMessage: "Sorry — we could not delete that chat. Please try again."
			});
			addMessage("agent", "Sorry — I couldn't delete that chat. Please try again.");
		}
	};
	const duplicateConversation = async (targetConversationId) => {
		if (!targetConversationId || !workspaceId || isPreviewModeEnabled()) return null;
		try {
			const result = await duplicateConversationAction({
				workspaceId,
				conversationId: targetConversationId
			});
			await fetchHistory({ reset: true });
			return result.conversationId;
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useAgentConversationHistory:duplicateConversation",
				title: "Could not duplicate chat",
				fallbackMessage: "Sorry — we could not duplicate that chat."
			});
			return null;
		}
	};
	const exportConversation = async (targetConversationId, format = "markdown") => {
		if (!targetConversationId || !workspaceId || isPreviewModeEnabled()) return null;
		try {
			return await exportConversationAction({
				workspaceId,
				conversationId: targetConversationId,
				format
			});
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useAgentConversationHistory:exportConversation",
				title: "Could not export chat",
				fallbackMessage: "Sorry — we could not export that chat."
			});
			return null;
		}
	};
	const shareConversation = async (targetConversationId) => {
		if (!targetConversationId || !workspaceId || isPreviewModeEnabled()) return null;
		try {
			const result = await shareConversationAction({
				workspaceId,
				conversationId: targetConversationId
			});
			const deepLink = buildAgentConversationShareLink(targetConversationId);
			return {
				markdown: result.markdown,
				deepLink
			};
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useAgentConversationHistory:shareConversation",
				title: "Could not share chat",
				fallbackMessage: "Sorry — we could not prepare a share link for that chat."
			});
			return null;
		}
	};
	return {
		history,
		isHistoryLoading,
		historyError,
		historyHasMore,
		historySearch,
		setHistorySearch,
		showArchivedHistory,
		setShowArchivedHistory,
		fetchHistory,
		loadMoreHistory,
		setConversationPinned,
		setConversationArchived,
		loadConversation,
		isConversationLoading,
		loadingConversationId,
		updateConversationTitle,
		deleteConversation,
		duplicateConversation,
		exportConversation,
		shareConversation
	};
}
function applyAgentResponse({ response, trimmedText, sentAttachments, conversationId, activeRequestClientId, addMessage, upsertMessage, setConversationId, setPendingAttachments, setLastFailedMessage, router, setOpen }) {
	const derived = deriveAgentStatusFromResponse(response);
	const steps = response.steps ?? buildCompletedStepsFromResponse(response);
	const attachmentNames = sentAttachments.map((attachment) => attachment.name);
	const usedContext = attachmentNames.length > 0 ? { attachmentNames } : void 0;
	if (response.action === "navigate" && response.route) {
		addMessage("agent", response.message || "Navigating...", response.route, derived.status, {
			...derived,
			usedContext
		}, {
			persistedId: response.agentMessageId,
			steps
		});
		setTimeout(() => {
			router.push(response.route);
			if (!shouldKeepAgentOpenOnNavigate(readAgentPanelLayout())) setOpen(false);
		}, 800);
	} else if (response.action === "execute" && response.executeResult) {
		const executeRoute = typeof response.route === "string" && response.route.length > 0 ? response.route : typeof response.executeResult.data?.route === "string" && response.executeResult.data.route.length > 0 ? response.executeResult.data.route : null;
		addMessage("agent", response.message || "Action completed", executeRoute, derived.status, {
			...derived,
			usedContext
		}, {
			persistedId: response.agentMessageId,
			steps
		});
		if (response.executeResult.success) setPendingAttachments([]);
	} else {
		addMessage("agent", response.message || "I didn't quite understand that.", response.route ?? null, derived.status, {
			...derived,
			usedContext
		}, {
			persistedId: response.agentMessageId,
			steps
		});
		if (!hasUsableAttachmentContext(sentAttachments)) setPendingAttachments([]);
	}
	if (response.conversationId && !conversationId) setConversationId(response.conversationId);
	if (response.userMessageId) upsertMessage({
		id: response.userMessageId,
		clientId: activeRequestClientId ?? response.userMessageId,
		type: "user",
		content: trimmedText,
		timestamp: /* @__PURE__ */ new Date(),
		lifecycle: "sent",
		attachments: sentAttachments.length > 0 ? sentAttachments : void 0
	});
	setLastFailedMessage(null);
}
function useAgentTaskUndo(workspaceId) {
	const softDeleteTask = useMutation(tasksApi.softDeleteTask);
	const undoTask = async (resourceId) => {
		if (!workspaceId) return;
		await softDeleteTask({
			workspaceId,
			legacyId: resourceId
		});
	};
	return { undoTask };
}
var DEBOUNCE_MS = 300;
var PREVIOUS_MESSAGES_LIMIT = 12;
function useAgentSend({ workspaceId, activeContext, messages, setMessages, conversationId, setConversationId, pendingAttachments, setPendingAttachments, clearAttachments, isExtractingAttachments, isPinnedToBottom, scrollToLatest, upsertMessage, addMessage, setOpen }) {
	const router = useRouter$1();
	const sendMessage = useAction(agentApi.sendMessage);
	const { undoTask } = useAgentTaskUndo(workspaceId);
	const [isProcessing, setIsProcessing] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [lastFailedMessage, setLastFailedMessage] = (0, import_react.useState)(null);
	const [connectionStatus, setConnectionStatus] = (0, import_react.useState)("connected");
	const [rateLimitCountdown, setRateLimitCountdown] = (0, import_react.useState)(null);
	const [processingSteps, setProcessingSteps] = (0, import_react.useState)([]);
	const [processingLabel, setProcessingLabel] = (0, import_react.useState)("Thinking…");
	const activeRequestRef = (0, import_react.useRef)(null);
	const lastSubmitTimeRef = (0, import_react.useRef)(0);
	const countdownIntervalRef = (0, import_react.useRef)(null);
	const clearError = () => {
		setError(null);
		setLastFailedMessage(null);
		setRateLimitCountdown(null);
		if (countdownIntervalRef.current) {
			clearInterval(countdownIntervalRef.current);
			countdownIntervalRef.current = null;
		}
	};
	const startRateLimitCountdown = (seconds) => {
		setRateLimitCountdown(seconds);
		if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
		countdownIntervalRef.current = setInterval(() => {
			setRateLimitCountdown((prev) => {
				if (prev === null || prev <= 1) {
					if (countdownIntervalRef.current) {
						clearInterval(countdownIntervalRef.current);
						countdownIntervalRef.current = null;
					}
					setError(null);
					setConnectionStatus("connected");
					return null;
				}
				return prev - 1;
			});
		}, 1e3);
	};
	const handleError = (err, failedMessage) => {
		setError(err);
		setConnectionStatus(err.type === "network" ? "disconnected" : "connected");
		if (failedMessage) setLastFailedMessage(failedMessage);
		const retryAfterSeconds = err.retryAfterMs ? err.retryAfterMs / 1e3 : void 0;
		if (err.type === "rate-limit" && retryAfterSeconds) startRateLimitCountdown(retryAfterSeconds);
		const displayMessage = ERROR_DISPLAY_MESSAGES[err.type] || err.message;
		addMessage("agent", displayMessage, null, "error", {
			action: "response",
			success: false
		});
		if (err.type !== "rate-limit") notifyError({ message: displayMessage });
	};
	const applyAgentResponse$1 = (response, trimmedText, sentAttachments) => {
		applyAgentResponse({
			response,
			trimmedText,
			sentAttachments,
			conversationId,
			activeRequestClientId: activeRequestRef.current,
			addMessage,
			upsertMessage,
			setConversationId,
			setPendingAttachments,
			setLastFailedMessage,
			router,
			setOpen
		});
	};
	const buildAgentRequestContext = (overrides) => ({
		previousMessages: filterMessagesForAgentContext(messages, PREVIOUS_MESSAGES_LIMIT).map((m) => ({
			type: m.type,
			content: m.content
		})),
		activeProposalId: activeContext.activeProposalId ?? null,
		activeProjectId: activeContext.activeProjectId ?? null,
		activeClientId: activeContext.activeClientId ?? null,
		confirmationDecision: overrides?.confirmationDecision ?? null,
		pendingConfirmation: overrides?.pendingConfirmation ? {
			confirmationId: overrides.pendingConfirmation.confirmationId,
			operation: overrides.pendingConfirmation.operation,
			params: overrides.pendingConfirmation.params
		} : null,
		mentions: overrides?.mentions && overrides.mentions.length > 0 ? overrides.mentions : void 0,
		attachmentContext: pendingAttachments.length > 0 ? toAgentRequestAttachmentContext(pendingAttachments) : void 0,
		attachments: pendingAttachments.length > 0 ? serializeAgentAttachmentsForStorage(pendingAttachments) : void 0
	});
	const processInput = async (text, options) => {
		const now = Date.now();
		if (now - lastSubmitTimeRef.current < DEBOUNCE_MS) return;
		lastSubmitTimeRef.current = now;
		const confirmationRequest = options?.confirmation;
		const trimmedText = confirmationRequest ? confirmationRequest.decision === "confirm" ? "Confirm" : confirmationRequest.decision === "cancel" ? "Cancel" : "Edit" : text.trim();
		const validationError = confirmationRequest ? null : validateInput(text);
		if (validationError) {
			setError(new AgentValidationError(validationError));
			addMessage("agent", validationError, null, "error", {
				action: "response",
				success: false
			});
			return;
		}
		const hasExtractingAttachments = pendingAttachments.some((attachment) => attachment.extractionStatus === "extracting");
		if (isExtractingAttachments || hasExtractingAttachments) {
			addMessage("agent", "I’m still reading the attached files. Send the message again in a moment.", null, "warning", {
				action: "response",
				success: false
			});
			return;
		}
		const retryClientId = options?.retryClientId;
		const resolvedMentions = mergeAgentMentions(parseAgentMentionsFromText(trimmedText), options?.mentions ?? []);
		const attachmentsForTurn = pendingAttachments.filter((attachment) => attachment.extractionStatus !== "extracting");
		const userClientId = retryClientId ?? generateId();
		activeRequestRef.current = userClientId;
		clearError();
		setIsProcessing(true);
		setConnectionStatus("connected");
		setProcessingSteps(buildProcessingSteps());
		setProcessingLabel("Understanding request…");
		upsertMessage({
			id: userClientId,
			clientId: userClientId,
			type: "user",
			content: trimmedText,
			timestamp: /* @__PURE__ */ new Date(),
			lifecycle: "sending",
			mentions: resolvedMentions.length > 0 ? resolvedMentions : void 0,
			attachments: attachmentsForTurn.length > 0 ? attachmentsForTurn : void 0
		});
		if (isPinnedToBottom) requestAnimationFrame(() => scrollToLatest());
		try {
			if (isPreviewModeEnabled()) {
				const previewResponse = getPreviewAgentModeResponse(trimmedText, activeContext);
				setProcessingSteps(buildProcessingSteps(previewResponse.operation));
				setProcessingLabel("Checking data…");
				applyAgentResponse$1({
					conversationId: conversationId ?? "preview-agent-conversation",
					userMessageId: userClientId,
					agentMessageId: generateId(),
					action: previewResponse.action,
					route: previewResponse.route,
					message: previewResponse.message,
					operation: previewResponse.operation,
					executeResult: previewResponse.action === "execute" ? {
						success: previewResponse.success !== false,
						data: previewResponse.data
					} : null
				}, trimmedText, attachmentsForTurn);
				upsertMessage({
					id: userClientId,
					clientId: userClientId,
					type: "user",
					content: trimmedText,
					timestamp: /* @__PURE__ */ new Date(),
					lifecycle: "sent",
					attachments: attachmentsForTurn.length > 0 ? attachmentsForTurn : void 0
				});
				return;
			}
			if (!workspaceId) throw new Error("Workspace context is required");
			setProcessingSteps((steps) => steps.map((step, index) => ({
				...step,
				status: index === 0 ? "completed" : index === 1 ? "active" : step.status
			})));
			setProcessingLabel("Checking data…");
			const responseData = await sendMessage({
				workspaceId,
				message: trimmedText,
				conversationId,
				context: buildAgentRequestContext(confirmationRequest ? {
					confirmationDecision: confirmationRequest.decision,
					pendingConfirmation: confirmationRequest.pending,
					mentions: resolvedMentions
				} : { mentions: resolvedMentions })
			});
			setConnectionStatus("connected");
			setProcessingSteps(buildCompletedStepsFromResponse(responseData));
			setProcessingLabel(operationProcessingLabel(responseData.operation));
			applyAgentResponse$1({
				...responseData,
				userMessageId: responseData.userMessageId ?? userClientId,
				steps: responseData.steps ?? buildCompletedStepsFromResponse(responseData)
			}, trimmedText, attachmentsForTurn);
		} catch (err) {
			logError(err, "useAgentMode:sendUnexpectedError");
			const agentError = parseAgentError(err, null);
			upsertMessage({
				id: userClientId,
				clientId: userClientId,
				type: "user",
				content: trimmedText,
				timestamp: /* @__PURE__ */ new Date(),
				lifecycle: "failed"
			});
			setProcessingSteps((steps) => steps.map((step) => step.id === "action" || step.id === "done" ? {
				...step,
				status: "failed"
			} : step));
			handleError(agentError, trimmedText);
		} finally {
			setIsProcessing(false);
			setProcessingSteps([]);
			setProcessingLabel("Thinking…");
			activeRequestRef.current = null;
			if (isPinnedToBottom) requestAnimationFrame(() => scrollToLatest());
		}
	};
	const confirmPendingAction = (pending, decision) => {
		processInput("", { confirmation: {
			pending,
			decision
		} });
	};
	const undoAgentAction = async (messageId, undoHint) => {
		if (!workspaceId) return;
		try {
			if (undoHint.type === "task") await undoTask(undoHint.resourceId);
			else {
				notifyFailure({
					title: "Undo not available",
					fallbackMessage: "Undo is only supported for newly created tasks right now."
				});
				return;
			}
			setMessages((prev) => prev.map((entry) => entry.id === messageId ? {
				...entry,
				metadata: entry.metadata ? {
					...entry.metadata,
					undoHint: void 0
				} : void 0
			} : entry));
			addMessage("agent", "Undid that action.", null, "info", {
				action: "response",
				success: true
			});
		} catch (err) {
			notifyFailure({
				title: "Could not undo",
				error: err,
				fallbackMessage: "Sorry — that action could not be undone."
			});
		}
	};
	const retryLastMessage = () => {
		if (!lastFailedMessage) return;
		const failedUser = [...messages].reverse().find((entry) => entry.type === "user" && entry.lifecycle === "failed");
		clearError();
		processInput(lastFailedMessage, { retryClientId: failedUser?.clientId });
	};
	const retryLastUserTurn = () => {
		for (let i = messages.length - 1; i >= 0; i -= 1) {
			const entry = messages[i];
			if (entry?.type === "user") {
				processInput(entry.content, { retryClientId: entry.clientId });
				return;
			}
		}
	};
	const editLastUserMessage = (text) => {
		const trimmed = text.trim();
		if (!trimmed) return;
		for (let i = messages.length - 1; i >= 0; i -= 1) {
			const entry = messages[i];
			if (entry?.type === "user") {
				processInput(trimmed, { retryClientId: entry.clientId });
				return;
			}
		}
		processInput(trimmed);
	};
	return {
		isProcessing,
		setIsProcessing,
		processInput,
		confirmPendingAction,
		undoAgentAction,
		editLastUserMessage,
		processingSteps,
		processingLabel,
		error,
		clearError,
		lastFailedMessage,
		retryLastMessage,
		retryLastUserTurn,
		connectionStatus,
		rateLimitCountdown,
		handleError,
		clearAttachmentsForReset: clearAttachments
	};
}
var AGENT_OPEN_STORAGE_KEY = "cohorts.agentMode.open";
function useAgentMode() {
	const pathname = usePathname();
	const { user } = useAuth();
	const { selectedClientId } = useClientContext();
	const { navigationState } = useNavigationContext();
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const activeContext = (() => {
		const pathContext = deriveActiveContextFromPath(pathname);
		return {
			activeProposalId: pathContext.activeProposalId,
			activeProjectId: pathContext.activeProjectId ?? navigationState.projectId ?? void 0,
			activeClientId: pathContext.activeClientId ?? selectedClientId ?? void 0
		};
	})();
	const [isOpen, setOpenState] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return false;
		return window.sessionStorage.getItem(AGENT_OPEN_STORAGE_KEY) === "1";
	});
	const setOpen = (open) => {
		setOpenState(open);
		if (typeof window !== "undefined") window.sessionStorage.setItem(AGENT_OPEN_STORAGE_KEY, open ? "1" : "0");
	};
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [conversationId, setConversationId] = (0, import_react.useState)(null);
	const [isPinnedToBottom, setIsPinnedToBottom] = (0, import_react.useState)(true);
	const scrollContainerRef = (0, import_react.useRef)(null);
	const { pendingAttachments, setPendingAttachments, isExtractingAttachments, addAttachments, removeAttachment, clearAttachments } = useAgentAttachments(workspaceId);
	const toggle = () => {
		setOpen(!isOpen);
	};
	const scrollToLatest = () => {
		const element = scrollContainerRef.current;
		if (element) element.scrollTop = element.scrollHeight;
		setIsPinnedToBottom(true);
	};
	const onMessagesScroll = () => {
		const element = scrollContainerRef.current;
		if (!element) return;
		setIsPinnedToBottom(element.scrollHeight - element.scrollTop - element.clientHeight < 80);
	};
	const upsertMessage = (message) => {
		setMessages((prev) => upsertAgentMessage(prev, message));
		return message;
	};
	const addMessage = (type, content, route, status, metadata, options) => {
		const safeContent = typeof content === "string" ? content : String(content ?? "");
		const clientId = options?.clientId ?? generateId();
		return upsertMessage({
			id: options?.persistedId ?? clientId,
			clientId,
			type,
			content: safeContent,
			timestamp: /* @__PURE__ */ new Date(),
			route,
			status,
			lifecycle: options?.lifecycle,
			metadata,
			steps: options?.steps
		});
	};
	const send = useAgentSend({
		workspaceId,
		activeContext,
		messages,
		setMessages,
		conversationId,
		setConversationId,
		pendingAttachments,
		setPendingAttachments,
		clearAttachments,
		isExtractingAttachments,
		isPinnedToBottom,
		scrollToLatest,
		upsertMessage,
		addMessage,
		setOpen
	});
	const historyApi = useAgentConversationHistory({
		workspaceId,
		userId: user?.id,
		conversationId,
		messages,
		setMessages,
		setConversationId,
		addMessage,
		handleError: send.handleError,
		setIsProcessing: send.setIsProcessing,
		clearError: send.clearError
	});
	const clearMessages = () => {
		setMessages([]);
		setConversationId(null);
		send.clearAttachmentsForReset();
		send.clearError();
	};
	const storeSpreadsheetExportForMessage = (messageId, attachment) => {
		setMessages((prev) => prev.map((message) => {
			if (message.id !== messageId) return message;
			const withoutDuplicate = (message.attachments ?? []).filter((item) => item.id !== attachment.id);
			return {
				...message,
				attachments: [...withoutDuplicate, attachment],
				metadata: message.metadata ? {
					...message.metadata,
					data: {
						...message.metadata.data ?? {},
						storedExport: attachment
					}
				} : message.metadata
			};
		}));
	};
	return {
		isOpen,
		setOpen,
		toggle,
		activeContext,
		maxMessageLength: AGENT_MAX_MESSAGE_LENGTH,
		messages,
		isProcessing: send.isProcessing,
		processInput: send.processInput,
		confirmPendingAction: send.confirmPendingAction,
		undoAgentAction: send.undoAgentAction,
		pendingAttachments,
		addAttachments,
		removeAttachment,
		isExtractingAttachments,
		clearMessages,
		conversationId,
		history: historyApi.history,
		isHistoryLoading: historyApi.isHistoryLoading,
		historyError: historyApi.historyError,
		historyHasMore: historyApi.historyHasMore,
		historySearch: historyApi.historySearch,
		setHistorySearch: historyApi.setHistorySearch,
		showArchivedHistory: historyApi.showArchivedHistory,
		setShowArchivedHistory: historyApi.setShowArchivedHistory,
		fetchHistory: historyApi.fetchHistory,
		loadMoreHistory: historyApi.loadMoreHistory,
		setConversationPinned: historyApi.setConversationPinned,
		setConversationArchived: historyApi.setConversationArchived,
		loadConversation: historyApi.loadConversation,
		isConversationLoading: historyApi.isConversationLoading,
		loadingConversationId: historyApi.loadingConversationId,
		updateConversationTitle: historyApi.updateConversationTitle,
		deleteConversation: historyApi.deleteConversation,
		duplicateConversation: historyApi.duplicateConversation,
		exportConversation: historyApi.exportConversation,
		shareConversation: historyApi.shareConversation,
		error: send.error,
		clearError: send.clearError,
		lastFailedMessage: send.lastFailedMessage,
		retryLastMessage: send.retryLastMessage,
		retryLastUserTurn: send.retryLastUserTurn,
		editLastUserMessage: send.editLastUserMessage,
		processingSteps: send.processingSteps,
		processingLabel: send.processingLabel,
		isPinnedToBottom,
		scrollToLatest,
		onMessagesScroll,
		scrollContainerRef,
		connectionStatus: send.connectionStatus,
		rateLimitCountdown: send.rateLimitCountdown,
		workspaceId,
		storeSpreadsheetExportForMessage
	};
}
/**
* Agent Mode Container
*
* Renders the floating action button and chat panel for Agent Mode.
* Add this component to the dashboard layout to enable Agent Mode globally.
*/
function AgentModeInner() {
	const { isOpen, setOpen, messages, isProcessing, processInput, pendingAttachments, addAttachments, removeAttachment, isExtractingAttachments, clearMessages, conversationId, history, isHistoryLoading, historyError, historyHasMore, historySearch, setHistorySearch, showArchivedHistory, setShowArchivedHistory, fetchHistory, loadMoreHistory, setConversationPinned, setConversationArchived, loadConversation, isConversationLoading, loadingConversationId, updateConversationTitle, deleteConversation, duplicateConversation, exportConversation, shareConversation, error, clearError, lastFailedMessage, retryLastMessage, retryLastUserTurn, editLastUserMessage, confirmPendingAction, undoAgentAction, processingSteps, processingLabel, isPinnedToBottom, scrollToLatest, onMessagesScroll, scrollContainerRef, connectionStatus, rateLimitCountdown, activeContext, maxMessageLength, workspaceId, storeSpreadsheetExportForMessage } = useAgentMode();
	const requestCloseRef = (0, import_react.useRef)(null);
	const [panelLayout, setPanelLayout] = (0, import_react.useState)(() => readAgentPanelLayout());
	const hideFab = shouldHideAgentFab(isOpen, panelLayout);
	const handleClose = () => {
		setOpen(false);
		requestAnimationFrame(() => {
			document.getElementById("agent-mode-launcher")?.focus();
		});
	};
	const handleLauncherClick = () => {
		if (isOpen) {
			if (requestCloseRef.current) requestCloseRef.current();
			else handleClose();
			return;
		}
		setOpen(true);
	};
	const handleSendMessage = (text, options) => {
		processInput(text, options);
	};
	const handleOpenHistory = () => {
		fetchHistory({ reset: true });
	};
	const handleRetryHistory = () => {
		fetchHistory({ reset: true });
	};
	const handleLoadMoreHistory = () => {
		loadMoreHistory();
	};
	const handlePinConversation = (id, pinned) => {
		setConversationPinned(id, pinned);
	};
	const handleArchiveConversation = (id, archived) => {
		setConversationArchived(id, archived);
	};
	const handleRetryUserMessage = (clientId, content) => {
		processInput(content, { retryClientId: clientId });
	};
	const handleUndoAction = (messageId, undoHint) => {
		if (!undoHint) return;
		undoAgentAction(messageId, undoHint);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [!hideFab ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentModeButton, {
		onClick: handleLauncherClick,
		isOpen
	}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentModePanel, {
		onPanelLayoutChange: setPanelLayout,
		runtime: {
			open: isOpen,
			processing: isProcessing,
			extractingAttachments: isExtractingAttachments
		},
		activeContext,
		maxMessageLength,
		onClose: handleClose,
		onOpenChange: setOpen,
		requestCloseRef,
		messages,
		onSendMessage: handleSendMessage,
		pendingAttachments,
		onAddAttachments: addAttachments,
		onRemoveAttachment: removeAttachment,
		onClear: clearMessages,
		conversationId,
		history,
		historyLoad: {
			historyLoading: isHistoryLoading,
			conversationLoading: isConversationLoading,
			showArchived: showArchivedHistory
		},
		historyError,
		historyHasMore,
		historySearch,
		onHistorySearchChange: setHistorySearch,
		onShowArchivedHistoryChange: setShowArchivedHistory,
		onOpenHistory: handleOpenHistory,
		onRetryHistory: handleRetryHistory,
		onLoadMoreHistory: handleLoadMoreHistory,
		onPinConversation: handlePinConversation,
		onArchiveConversation: handleArchiveConversation,
		onSelectConversation: loadConversation,
		loadingConversationId,
		onUpdateConversationTitle: updateConversationTitle,
		onDeleteConversation: deleteConversation,
		onDuplicateConversation: duplicateConversation,
		onExportConversation: exportConversation,
		onShareConversation: shareConversation,
		error,
		onClearError: clearError,
		lastFailedMessage,
		onRetry: retryLastMessage,
		onRetryLastUserTurn: retryLastUserTurn,
		onRetryUserMessage: handleRetryUserMessage,
		onConfirmPending: confirmPendingAction,
		onUndoAction: handleUndoAction,
		processingSteps,
		processingLabel,
		scrollContainerRef,
		onMessagesScroll,
		scrollBehavior: { pinnedToBottom: isPinnedToBottom },
		onJumpToLatest: scrollToLatest,
		connectionStatus,
		rateLimitCountdown,
		workspaceId,
		onStoreSpreadsheetExport: storeSpreadsheetExportForMessage
	})] });
}
function AgentMode() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentModeInner, {})
	});
}
//#endregion
export { AgentMode };
