import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, c as useConvex, l as useMutation, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { h as formatDistanceToNowStrict } from "../_libs/date-fns.mjs";
import { An as FileText, Fr as Bold, Gr as Archive, I as Smile, In as Eye, J as Send, Jn as Code, Kn as Copy, Qt as ListOrdered, Rr as AtSign, Xt as List, Yt as LoaderCircle, cn as Italic, et as Reply, fn as Image, g as Upload, gr as Check, gt as Pencil, i as X, ir as CirclePlay, or as CircleCheck, st as Quote, tr as Circle, w as Trash2, xt as Paperclip, zn as Ellipsis } from "../_libs/lucide-react.mjs";
import { i as Trigger, n as Portal, r as Root2, t as Content2 } from "../_libs/@radix-ui/react-popover+[...].mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
import { t as remarkGfm } from "../_libs/remark-gfm.mjs";
import { n as Theme, t as EmojiPicker$1 } from "../_libs/emoji-picker-react+flairup.mjs";
import { n as highlighter, t as one_light_default } from "../_libs/react-syntax-highlighter+[...].mjs";
import { D as formatDate$1, E as DATE_FORMATS, t as cn } from "./utils.mjs";
import { E as surfaceMotionClasses, u as listItemEnterClass } from "./motion.mjs";
import { t as Button } from "./button.mjs";
import { a as notifySuccess, c as reportConvexFailure } from "./notifications.mjs";
import { t as api } from "./api.mjs";
import { D as filesApi } from "./convex-api.mjs";
import { i as DropdownMenuItem, l as DropdownMenuTrigger, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog.mjs";
import { C as hasHighlightTerms, D as uploadStorageFile, E as LazyImage, b as CHAT_MARKDOWN_CLASS, o as ChatMediaGallery, r as Textarea, t as VoiceInputButton, w as highlightText, x as CHAT_MESSAGE_BODY_CLASS } from "./voice-input.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar.mjs";
//#region src/lib/convex-realtime.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function isConvexRealtimeEnabled() {
	return Boolean("https://grand-sparrow-698.convex.cloud") && process.env.NEXT_PUBLIC_USE_BETTER_AUTH !== "false";
}
//#endregion
//#region src/lib/mentions.ts
var MENTION_PROTOCOL = "mention://";
function buildMentionSlug(name) {
	return encodeURIComponent(name.trim().toLowerCase());
}
function buildMentionMarkup(name) {
	const trimmed = name.trim();
	return `[${trimmed.startsWith("@") ? trimmed : `@${trimmed}`}](${MENTION_PROTOCOL}${buildMentionSlug(trimmed)})`;
}
var MENTION_REGEX = /\[([^\]]+)\]\(mention:\/\/([^\)]+)\)/g;
function extractMentionsFromContent(content) {
	if (!content) return [];
	const mentions = [];
	const seen = /* @__PURE__ */ new Set();
	let match;
	while ((match = MENTION_REGEX.exec(content)) !== null) {
		const [, displayLabel, rawSlug] = match;
		if (!displayLabel || !rawSlug) continue;
		const normalizedSlug = rawSlug.trim();
		if (!normalizedSlug || seen.has(normalizedSlug)) continue;
		seen.add(normalizedSlug);
		const decoded = decodeURIComponent(normalizedSlug);
		const name = decoded && decoded.length > 0 ? decoded : displayLabel.replace(/^@/, "");
		mentions.push({
			slug: normalizedSlug,
			name
		});
	}
	return mentions;
}
//#endregion
//#region src/services/task-comment-attachments.ts
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
//#endregion
//#region src/features/dashboard/collaboration/components/message-attachments.tsx
var import_jsx_runtime = require_jsx_runtime();
function toChatMediaAttachments(attachments) {
	return attachments.map((attachment) => ({
		name: attachment.name,
		url: attachment.url,
		type: attachment.type,
		size: attachment.size
	}));
}
function MessageAttachments({ attachments, highlightTerms, compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatMediaGallery, {
		attachments: toChatMediaAttachments(attachments),
		highlightTerms,
		compact
	});
}
//#endregion
//#region src/shared/ui/emoji-picker.tsx
var emoji_picker_default = EmojiPicker$1;
//#endregion
//#region src/shared/ui/popover.tsx
function Popover({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2, {
		"data-slot": "popover",
		...props
	});
}
function PopoverTrigger({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		"data-slot": "popover-trigger",
		...props
	});
}
function PopoverContent({ className, align = "center", sideOffset = 4, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		"data-slot": "popover-content",
		align,
		sideOffset,
		className: cn("bg-popover text-popover-foreground z-[3000] w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden", surfaceMotionClasses.popoverContent, className),
		...props
	}) });
}
//#endregion
//#region src/features/dashboard/collaboration/components/rich-composer-sections.tsx
function ComposerButton({ icon: Icon, label, onClick, disabled }) {
	const onComposerAction = () => {
		if (disabled) return;
		onClick();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		size: "icon",
		variant: "ghost",
		onClick: onComposerAction,
		disabled,
		className: "size-7 hover:bg-background/50",
		"aria-label": label,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: label
		})]
	});
}
function RichComposerMentionOption({ isActive, mentionClick, mentionMouseDown, participant }) {
	const onMentionParticipant = () => {
		mentionClick(participant);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onMouseDown: mentionMouseDown,
		onClick: onMentionParticipant,
		className: cn("flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-sm transition", isActive ? "bg-accent/10 text-primary" : "hover:bg-muted"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: participant.name
		}), participant.role ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted-foreground",
			children: participant.role
		}) : null]
	}, participant.name);
}
function RichComposerToolbar({ disabled, emojiPickerOpen, hasAttachments, onAction, onAttachClick, onEmojiClick, onInsertMention, onOpenEmojiChange, onVoiceTranscript }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-0.5 rounded-t-lg border-b border-muted/40 bg-muted/10 px-2 py-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposerButton, {
				icon: Bold,
				label: "Bold",
				onClick: () => onAction("bold"),
				disabled
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposerButton, {
				icon: Italic,
				label: "Italic",
				onClick: () => onAction("italic"),
				disabled
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposerButton, {
				icon: Quote,
				label: "Quote",
				onClick: () => onAction("blockquote"),
				disabled
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposerButton, {
				icon: Code,
				label: "Code",
				onClick: () => onAction("code"),
				disabled
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposerButton, {
				icon: List,
				label: "Bulleted list",
				onClick: () => onAction("unordered-list"),
				disabled
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposerButton, {
				icon: ListOrdered,
				label: "Numbered list",
				onClick: () => onAction("ordered-list"),
				disabled
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposerButton, {
				icon: AtSign,
				label: "Mention",
				onClick: onInsertMention,
				disabled
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-1 h-4 w-px bg-muted/60" }),
			onAttachClick ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				size: "sm",
				variant: hasAttachments ? "secondary" : "ghost",
				onClick: onAttachClick,
				disabled,
				className: cn("h-7 gap-1.5 px-2 text-xs hover:bg-background/50", hasAttachments && "bg-accent/10 text-primary hover:bg-accent/20"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden sm:inline",
					children: "Attach"
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-1 h-4 w-px bg-muted/60" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
				open: emojiPickerOpen,
				onOpenChange: onOpenEmojiChange,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "icon",
						variant: "ghost",
						disabled,
						className: "size-7",
						"aria-label": "Open emoji picker",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smile, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sr-only",
							children: "Open emoji picker"
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
					className: "w-auto p-0",
					align: "end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(emoji_picker_default, {
						onEmojiClick,
						theme: Theme.LIGHT,
						width: 320,
						height: 400
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceInputButton, {
				onTranscript: onVoiceTranscript,
				disabled
			})
		]
	});
}
function RichComposerTextareaShell({ disabled, isDraggingOver, onBlur, onChange, onDragEnter, onDragLeave, onDragOver, onDrop, onFocus, onKeyDown, onPaste, placeholder, textareaRef, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
			ref: textareaRef,
			value,
			placeholder,
			onChange,
			onKeyDown,
			onBlur,
			onFocus,
			onDrop,
			onDragOver,
			onDragEnter,
			onDragLeave,
			onPaste,
			disabled,
			maxLength: 2e3,
			className: cn("min-h-[120px] resize-y rounded-b-lg rounded-t-none border-0 bg-transparent p-3 shadow-none focus-visible:ring-0", isDraggingOver && "bg-accent/5")
		}), isDraggingOver ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-0 flex items-center justify-center rounded-b-lg bg-accent/10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-2 text-primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-medium",
					children: "Drop files here to attach"
				})]
			})
		}) : null]
	});
}
function RichComposerMentionMenu({ highlightedMention, mentionQuery, mentionResults, onMentionClick, onMentionMouseDown }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
		className: "absolute bottom-2 left-2 z-20 w-64 list-none rounded-md border border-muted/60 bg-popover p-1 shadow-lg",
		"aria-label": "Mention teammate suggestions",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "list-none px-2 py-1 text-xs font-medium uppercase text-muted-foreground",
			children: "Mention teammate"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "list-none max-h-52 overflow-y-auto",
			children: mentionResults.length > 0 ? mentionResults.map((participant, index) => {
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "list-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichComposerMentionOption, {
						isActive: index === highlightedMention,
						mentionClick: onMentionClick,
						mentionMouseDown: onMentionMouseDown,
						participant
					})
				}, participant.name);
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-2 py-3 text-sm text-muted-foreground",
				"aria-live": "polite",
				children: [
					"No teammates match ",
					mentionQuery.trim() ? `“${mentionQuery.trim()}”` : "your search",
					"."
				]
			})
		})]
	});
}
//#endregion
//#region src/features/dashboard/collaboration/components/use-rich-composer.ts
var MAX_MENTION_RESULTS = 6;
var MENTION_TRIGGER_LOOKBACK = 40;
var MENTION_UPDATE_DELAY_MS = 150;
var DEFAULT_MENTION_STATE = {
	active: false,
	startIndex: -1,
	query: ""
};
function useRichComposer({ value, onChange, onSend, disabled = false, participants, onFocus, onBlur, onDrop, onDragOver }) {
	const textareaRef = (0, import_react.useRef)(null);
	const mentionStateRef = (0, import_react.useRef)(DEFAULT_MENTION_STATE);
	const [mentionState, setMentionState] = (0, import_react.useState)(DEFAULT_MENTION_STATE);
	const [highlightedMention, setHighlightedMention] = (0, import_react.useState)(0);
	const mentionTimeoutRef = (0, import_react.useRef)(null);
	const [isDraggingOver, setIsDraggingOver] = (0, import_react.useState)(false);
	const [emojiPickerOpen, setEmojiPickerOpen] = (0, import_react.useState)(false);
	const handleEmojiClick = (emojiData) => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		onChange(value.slice(0, start) + emojiData.emoji + value.slice(end));
		requestAnimationFrame(() => {
			const newCursor = start + emojiData.emoji.length;
			textarea.setSelectionRange(newCursor, newCursor);
			textarea.focus();
		});
	};
	const uniqueParticipants = (() => {
		const map = /* @__PURE__ */ new Map();
		participants.forEach((participant) => {
			const key = participant.name.trim().toLowerCase();
			if (!key) return;
			if (!map.has(key)) map.set(key, participant);
		});
		return Array.from(map.values()).sort((left, right) => left.name.localeCompare(right.name));
	})();
	const mentionResults = (() => {
		if (!mentionState.active) return [];
		const normalizedQuery = mentionState.query.trim().toLowerCase();
		if (!normalizedQuery) return uniqueParticipants.slice(0, MAX_MENTION_RESULTS);
		return uniqueParticipants.filter((participant) => {
			const role = participant.role?.toLowerCase() ?? "";
			return participant.name.toLowerCase().includes(normalizedQuery) || role.includes(normalizedQuery);
		}).slice(0, MAX_MENTION_RESULTS);
	})();
	const resetMentionState = () => {
		if (mentionTimeoutRef.current) {
			clearTimeout(mentionTimeoutRef.current);
			mentionTimeoutRef.current = null;
		}
		mentionStateRef.current = DEFAULT_MENTION_STATE;
		setMentionState(DEFAULT_MENTION_STATE);
		setHighlightedMention(0);
	};
	const applyTextUpdate = (updater) => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		const { selectionStart, selectionEnd } = textarea;
		const { nextValue, nextSelectionStart, nextSelectionEnd } = updater(value, selectionStart, selectionEnd);
		onChange(nextValue);
		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
		});
	};
	const handleFormattingAction = (action) => {
		applyTextUpdate((current, selectionStart, selectionEnd) => {
			const selectedText = current.slice(selectionStart, selectionEnd);
			const noSelection = selectionStart === selectionEnd;
			switch (action) {
				case "bold": {
					const placeholder = selectedText || "bold text";
					const wrapped = `**${placeholder}**`;
					const nextValue = current.slice(0, selectionStart) + wrapped + current.slice(selectionEnd);
					if (noSelection) {
						const startInside = selectionStart + 2;
						return {
							nextValue,
							nextSelectionStart: startInside,
							nextSelectionEnd: startInside + placeholder.length
						};
					}
					return {
						nextValue,
						nextSelectionStart: selectionStart,
						nextSelectionEnd: selectionStart + wrapped.length
					};
				}
				case "italic": {
					const placeholder = selectedText || "emphasis";
					const wrapped = `*${placeholder}*`;
					const nextValue = current.slice(0, selectionStart) + wrapped + current.slice(selectionEnd);
					if (noSelection) {
						const startInside = selectionStart + 1;
						return {
							nextValue,
							nextSelectionStart: startInside,
							nextSelectionEnd: startInside + placeholder.length
						};
					}
					return {
						nextValue,
						nextSelectionStart: selectionStart,
						nextSelectionEnd: selectionStart + wrapped.length
					};
				}
				case "blockquote": {
					const prefixed = (selectedText || "Quoted text").split("\n").map((line) => line ? `> ${line}` : "> ").join("\n");
					return {
						nextValue: current.slice(0, selectionStart) + prefixed + current.slice(selectionEnd),
						nextSelectionStart: selectionStart,
						nextSelectionEnd: selectionStart + prefixed.length
					};
				}
				case "code": {
					if (selectedText.includes("\n")) {
						const blockPlaceholder = selectedText || "code block";
						const wrapped = `\n\n\`\`\`\n${blockPlaceholder}\n\`\`\`\n`;
						const nextValue = current.slice(0, selectionStart) + wrapped + current.slice(selectionEnd);
						const anchor = selectionStart + wrapped.indexOf("\n") + 3;
						return {
							nextValue,
							nextSelectionStart: anchor,
							nextSelectionEnd: anchor + blockPlaceholder.length
						};
					}
					const inlinePlaceholder = selectedText || "inline code";
					const wrapped = `\`${inlinePlaceholder}\``;
					const nextValue = current.slice(0, selectionStart) + wrapped + current.slice(selectionEnd);
					if (noSelection) {
						const startInside = selectionStart + 1;
						return {
							nextValue,
							nextSelectionStart: startInside,
							nextSelectionEnd: startInside + inlinePlaceholder.length
						};
					}
					return {
						nextValue,
						nextSelectionStart: selectionStart,
						nextSelectionEnd: selectionStart + wrapped.length
					};
				}
				case "unordered-list": {
					const prefixed = (selectedText || "List item").split("\n").map((line) => line ? `- ${line}` : "- ").join("\n");
					return {
						nextValue: current.slice(0, selectionStart) + prefixed + current.slice(selectionEnd),
						nextSelectionStart: selectionStart,
						nextSelectionEnd: selectionStart + prefixed.length
					};
				}
				case "ordered-list": {
					const prefixed = (selectedText || "List item").split("\n").map((line, index) => `${index + 1}. ${line || "Item"}`).join("\n");
					return {
						nextValue: current.slice(0, selectionStart) + prefixed + current.slice(selectionEnd),
						nextSelectionStart: selectionStart,
						nextSelectionEnd: selectionStart + prefixed.length
					};
				}
				default: return {
					nextValue: current,
					nextSelectionStart: selectionStart,
					nextSelectionEnd: selectionEnd
				};
			}
		});
	};
	const detectMentionTrigger = (currentValue, caretPosition) => {
		if (caretPosition === 0) {
			resetMentionState();
			return;
		}
		const start = Math.max(0, caretPosition - MENTION_TRIGGER_LOOKBACK);
		for (let index = caretPosition - 1; index >= start; index -= 1) {
			const char = currentValue[index];
			if (char === "@") {
				if (!(index > 0 ? currentValue[index - 1] ?? " " : " ").match(/[\s([{]/)) break;
				const query = currentValue.slice(index + 1, caretPosition);
				if (query.includes(" ") || query.includes("\n")) break;
				const nextState = {
					active: true,
					startIndex: index,
					query
				};
				mentionStateRef.current = nextState;
				setMentionState(nextState);
				setHighlightedMention(0);
				return;
			}
			if (char === "\n" || char === " " || char === "	") break;
		}
		if (mentionStateRef.current.active) resetMentionState();
	};
	const handleInputChange = (event) => {
		const nextValue = event.target.value;
		onChange(nextValue);
		if (mentionTimeoutRef.current) clearTimeout(mentionTimeoutRef.current);
		const caret = event.target.selectionStart ?? nextValue.length;
		mentionTimeoutRef.current = setTimeout(() => {
			detectMentionTrigger(nextValue, caret);
		}, MENTION_UPDATE_DELAY_MS);
	};
	const insertMention = (name) => {
		const textarea = textareaRef.current;
		const state = mentionStateRef.current;
		if (!textarea || !state.active) return;
		const caretPosition = textarea.selectionStart;
		const markup = `${buildMentionMarkup(name)} `;
		const nextValue = value.slice(0, state.startIndex) + markup + value.slice(caretPosition);
		const nextCaret = state.startIndex + markup.length;
		onChange(nextValue);
		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(nextCaret, nextCaret);
		});
		resetMentionState();
	};
	const handleMentionClick = (participant) => {
		insertMention(participant.name);
	};
	const handleMentionMouseDown = (event) => {
		event.preventDefault();
	};
	const handleKeyDown = (event) => {
		if (mentionState.active && mentionResults.length > 0) {
			if (event.key === "ArrowDown") {
				event.preventDefault();
				setHighlightedMention((current) => (current + 1) % mentionResults.length);
				return;
			}
			if (event.key === "ArrowUp") {
				event.preventDefault();
				setHighlightedMention((current) => (current - 1 + mentionResults.length) % mentionResults.length);
				return;
			}
			if (event.key === "Enter" || event.key === "Tab") {
				event.preventDefault();
				const participant = mentionResults[highlightedMention] ?? mentionResults[0];
				if (participant) insertMention(participant.name);
				return;
			}
			if (event.key === "Escape") {
				event.preventDefault();
				resetMentionState();
				return;
			}
		}
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			onSend();
			resetMentionState();
		}
	};
	const onComposerBlur = () => {
		if (mentionTimeoutRef.current) {
			clearTimeout(mentionTimeoutRef.current);
			mentionTimeoutRef.current = null;
		}
		resetMentionState();
		setIsDraggingOver(false);
		onBlur?.();
	};
	const onComposerFocus = () => {
		onFocus?.();
	};
	const handleDragEnter = (event) => {
		event.preventDefault();
		if (!disabled && event.dataTransfer.types.includes("Files")) setIsDraggingOver(true);
	};
	const handleDragLeave = (event) => {
		event.preventDefault();
		const relatedTarget = event.relatedTarget;
		const target = event.currentTarget;
		if (!relatedTarget || !target.contains(relatedTarget)) setIsDraggingOver(false);
	};
	const handleDragOverInternal = (event) => {
		event.preventDefault();
		if (!disabled && event.dataTransfer.types.includes("Files")) {
			event.dataTransfer.dropEffect = "copy";
			setIsDraggingOver(true);
		} else event.dataTransfer.dropEffect = "none";
		onDragOver?.(event);
	};
	const handleDropInternal = (event) => {
		event.preventDefault();
		setIsDraggingOver(false);
		onDrop?.(event);
	};
	const handleInsertMention = () => {
		applyTextUpdate((current, selectionStart, selectionEnd) => {
			const insertionPoint = selectionStart === selectionEnd ? selectionStart : selectionEnd;
			const nextValue = `${current.slice(0, insertionPoint)}@${current.slice(insertionPoint)}`;
			const nextCaret = insertionPoint + 1;
			return {
				nextValue,
				nextSelectionStart: nextCaret,
				nextSelectionEnd: nextCaret
			};
		});
	};
	const handleVoiceTranscript = (transcript) => onChange(value + (value && !value.endsWith(" ") ? " " : "") + transcript);
	return {
		textareaRef,
		mentionState,
		highlightedMention,
		mentionResults,
		isDraggingOver,
		emojiPickerOpen,
		setEmojiPickerOpen,
		handleEmojiClick,
		handleFormattingAction,
		handleInputChange,
		handleKeyDown,
		onComposerBlur,
		onComposerFocus,
		handleDragEnter,
		handleDragLeave,
		handleDragOverInternal,
		handleDropInternal,
		handleInsertMention,
		handleVoiceTranscript,
		handleMentionClick,
		handleMentionMouseDown
	};
}
//#endregion
//#region src/features/dashboard/collaboration/components/rich-composer.tsx
function RichComposer({ value, onChange, onSend, disabled = false, placeholder = "Share an update…", participants, onFocus, onBlur, onDrop, onDragOver, onPaste, onAttachClick, hasAttachments = false }) {
	const composer = useRichComposer({
		value,
		onChange,
		onSend,
		disabled,
		participants,
		onFocus,
		onBlur,
		onDrop,
		onDragOver
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichComposerToolbar, {
				disabled,
				emojiPickerOpen: composer.emojiPickerOpen,
				hasAttachments,
				onAction: composer.handleFormattingAction,
				onAttachClick,
				onEmojiClick: composer.handleEmojiClick,
				onInsertMention: composer.handleInsertMention,
				onOpenEmojiChange: composer.setEmojiPickerOpen,
				onVoiceTranscript: composer.handleVoiceTranscript
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichComposerTextareaShell, {
				disabled,
				isDraggingOver: composer.isDraggingOver,
				onBlur: composer.onComposerBlur,
				onChange: composer.handleInputChange,
				onDragEnter: composer.handleDragEnter,
				onDragLeave: composer.handleDragLeave,
				onDragOver: composer.handleDragOverInternal,
				onDrop: composer.handleDropInternal,
				onFocus: composer.onComposerFocus,
				onKeyDown: composer.handleKeyDown,
				onPaste,
				placeholder,
				textareaRef: composer.textareaRef,
				value
			}),
			composer.mentionState.active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichComposerMentionMenu, {
				highlightedMention: composer.highlightedMention,
				mentionQuery: composer.mentionState.query,
				mentionResults: composer.mentionResults,
				onMentionClick: composer.handleMentionClick,
				onMentionMouseDown: composer.handleMentionMouseDown
			}) : null
		]
	});
}
//#endregion
//#region src/features/dashboard/collaboration/components/message-composer.tsx
function PendingAttachmentRow({ attachment, disabled, onRemove }) {
	const isImageType = attachment.mimeType.startsWith("image/");
	const handleRemove = () => {
		onRemove(attachment.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center justify-between gap-3 rounded-md border border-muted/50 bg-background p-2 text-sm", listItemEnterClass),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-2",
			children: [
				isImageType ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "size-4 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4 text-muted-foreground" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					title: attachment.name,
					children: attachment.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: attachment.sizeLabel
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "ghost",
			size: "icon",
			onClick: handleRemove,
			disabled,
			className: "size-7",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "sr-only",
				children: ["Remove ", attachment.name]
			})]
		})]
	}, attachment.id);
}
function PendingAttachmentsList({ attachments, uploading, disabled = false, onRemove }) {
	if (attachments.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2 rounded-md border border-dashed border-muted/60 bg-muted/20 p-3 listItemEnterClass",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				attachments.length,
				" attachment",
				attachments.length === 1 ? "" : "s",
				" ready to send"
			] }), uploading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }), " Uploading…"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: attachments.map((attachment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingAttachmentRow, {
				attachment,
				disabled,
				onRemove
			}, attachment.id))
		})]
	});
}
function ReplyIndicator({ message, onCancel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center justify-between rounded-t-lg border-b border-muted/40 bg-muted/20 px-3 py-2 text-xs", listItemEnterClass),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-5 items-center justify-center rounded-full bg-accent/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reply, { className: "size-3 text-primary" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: "Replying to thread"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-foreground",
						children: message.senderName
					})]
				}),
				message.content && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-2 max-w-[200px] truncate border-l border-muted pl-2 text-muted-foreground",
					children: [
						"\"",
						message.content.slice(0, 50),
						message.content.length > 50 ? "…" : "",
						"\""
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: "size-5 rounded-full hover:bg-muted/50",
			onClick: onCancel,
			"aria-label": "Cancel reply",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
				className: "size-3",
				"aria-hidden": true
			})
		})]
	});
}
//#endregion
//#region src/shared/ui/code-syntax-highlighter.tsx
var codeStyle = {
	margin: 0,
	padding: "1rem",
	background: "transparent",
	fontSize: "13px",
	lineHeight: "1.5"
};
var codeTagProps = { className: "font-mono" };
function CodeSyntaxHighlighter({ language, code }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(highlighter, {
		style: one_light_default,
		language,
		PreTag: "div",
		customStyle: codeStyle,
		codeTagProps,
		children: code
	});
}
//#endregion
//#region src/shared/ui/live-region.tsx
function LiveRegion({ message, id, politeness = "polite", atomic = true, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		id,
		className: cn("sr-only", className),
		role: politeness === "assertive" ? "alert" : "status",
		"aria-live": politeness,
		"aria-atomic": atomic,
		children: message ?? ""
	});
}
//#endregion
//#region src/features/dashboard/collaboration/components/message-content.tsx
function extractLanguage(className) {
	if (!className) return null;
	const match = className.match(/language-(\w+)/);
	return match ? match[1] ?? null : null;
}
var LANGUAGE_ALIASES = {
	js: "javascript",
	ts: "typescript",
	tsx: "tsx",
	jsx: "jsx",
	py: "python",
	rb: "ruby",
	yml: "yaml",
	sh: "bash",
	shell: "bash",
	zsh: "bash",
	dockerfile: "docker",
	md: "markdown"
};
function normalizeLanguage(lang) {
	if (!lang) return "text";
	const normalized = lang.toLowerCase();
	return LANGUAGE_ALIASES[normalized] || normalized;
}
function CopyButton({ code }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2e3);
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "MessageContent:CopyButton",
				title: "Copy failed",
				fallbackMessage: "Copy failed"
			});
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveRegion, { message: copied ? "Code block copied to clipboard." : "" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "icon",
		className: "absolute right-2 top-2 size-7 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background",
		onClick: handleCopy,
		title: copied ? "Copied!" : "Copy code",
		"aria-label": copied ? "Code copied" : "Copy code block to clipboard",
		children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
			className: "size-3.5 text-success",
			"aria-hidden": true
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
			className: "size-3.5",
			"aria-hidden": true
		})
	})] });
}
function highlightChildren(children, terms) {
	if (!hasHighlightTerms(terms)) return children;
	let textOffset = 0;
	return import_react.Children.map(children, (child) => {
		if (typeof child === "string") {
			const key = `fragment-${textOffset}`;
			textOffset += child.length;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: highlightText(child, terms) }, key);
		}
		return child;
	});
}
function createMarkdownComponents(highlightTerms) {
	return {
		p: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "leading-relaxed text-sm text-foreground [&:not(:first-child)]:mt-2",
			children: highlightChildren(children, highlightTerms)
		}),
		strong: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
			className: "font-semibold text-foreground",
			children: highlightChildren(children, highlightTerms)
		}),
		em: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
			className: "italic text-foreground",
			children: highlightChildren(children, highlightTerms)
		}),
		ul: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 list-disc space-y-1 pl-5 text-sm text-foreground",
			children
		}),
		ol: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "mt-2 list-decimal space-y-1 pl-5 text-sm text-foreground",
			children
		}),
		li: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: highlightChildren(children, highlightTerms) }),
		blockquote: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", {
			className: "rounded-md bg-gradient-to-r from-primary/5 to-muted/20 px-3 py-1.5 text-sm italic text-muted-foreground ring-1 ring-primary/10",
			children: highlightChildren(children, highlightTerms)
		}),
		code: ({ inline, className, children }) => {
			const normalizedLang = normalizeLanguage(extractLanguage(className));
			const codeString = String(children).replace(/\n$/, "");
			if (inline || !codeString.includes("\n")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
				className: cn("rounded bg-muted px-1.5 py-0.5 text-[13px] font-mono text-primary/90", className),
				children
			});
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "block group relative mt-3 max-w-full rounded-lg border border-muted/60 overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between bg-muted/40 px-3 py-1.5 border-b border-muted/40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-medium text-muted-foreground uppercase tracking-wide",
						children: normalizedLang
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, { code: codeString })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeSyntaxHighlighter, {
					language: normalizedLang,
					code: codeString
				})]
			});
		},
		a: ({ href, children }) => {
			if (!href) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children });
			if (href.startsWith("mention://")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium leading-none text-primary",
				children
			});
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href,
				target: "_blank",
				rel: "noreferrer noopener",
				className: "break-all text-sm font-medium text-primary hover:underline",
				children
			});
		},
		img: ({ src, alt }) => {
			if (!src) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyImage, {
				src,
				alt: alt ?? "Shared image",
				className: "my-3 block h-auto max-h-80 w-full max-w-full rounded-md border border-muted/50 object-contain"
			});
		},
		table: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 max-w-full overflow-x-auto rounded-md border border-muted/40",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
				className: "w-full max-w-full divide-y divide-muted/40 text-sm",
				children
			})
		}),
		thead: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
			className: "bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground",
			children
		}),
		tbody: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
			className: "divide-y divide-muted/40",
			children
		}),
		th: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
			className: "px-3 py-2 font-medium",
			children
		}),
		td: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			className: "px-3 py-2 align-top text-foreground",
			children
		}),
		hr: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { className: "my-4 border-muted/60" }),
		h1: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-4 mb-2 text-lg text-foreground",
			children
		}),
		h2: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-3 mb-2 text-base text-foreground",
			children
		}),
		h3: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "mt-3 mb-1 text-sm text-foreground",
			children
		}),
		h4: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
			className: "mt-2 mb-1 text-sm text-foreground",
			children
		}),
		h5: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
			className: "mt-2 mb-1 text-sm font-medium text-foreground",
			children
		}),
		h6: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h6", {
			className: "mt-2 mb-1 text-sm font-medium text-muted-foreground",
			children
		}),
		del: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("del", {
			className: "line-through text-muted-foreground",
			children
		})
	};
}
function RawMessageContent({ content, mentions, highlightTerms }) {
	const markdown = content?.trim() ?? "";
	const markdownComponents = createMarkdownComponents(highlightTerms);
	const mentionBadges = (() => {
		if (!Array.isArray(mentions)) return [];
		return mentions.flatMap((item) => item && typeof item.name === "string" && item.name.trim().length > 0 ? [{
			key: item.slug ?? item.name,
			name: item.name.trim(),
			role: item.role ?? null
		}] : []);
	})();
	if (!markdown) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn(CHAT_MESSAGE_BODY_CLASS, "space-y-2"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, {
			remarkPlugins: [remarkGfm],
			components: markdownComponents,
			className: CHAT_MARKDOWN_CLASS,
			skipHtml: true,
			children: markdown
		}), mentionBadges.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium text-foreground",
				children: "Mentions:"
			}), mentionBadges.map((mention) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground",
				children: [
					"@",
					mention.name,
					mention.role ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] uppercase text-muted-foreground",
						children: mention.role
					}) : null
				]
			}, mention.key))]
		})]
	});
}
var MessageContent = Object.assign(RawMessageContent, { displayName: "MessageContent" });
//#endregion
//#region src/features/dashboard/tasks/task-comments-sections.tsx
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
//#endregion
//#region src/features/dashboard/tasks/use-task-comments-panel.tsx
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
//#endregion
//#region src/features/dashboard/tasks/task-comments.tsx
function TaskCommentsPanel(props) {
	return useTaskCommentsPanel(props);
}
//#endregion
//#region src/lib/dashboard-workspace-theme.ts
/** Shared layout tokens for dashboard feature pages (tasks, projects, collaboration inbox). */
var DASHBOARD_WORKSPACE_THEME = {
	page: "mx-auto max-w-7xl space-y-6 pb-12",
	summaryStrip: "rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/20 p-4 shadow-sm sm:px-5",
	workspace: "overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-border/40",
	workspaceRail: "flex flex-col gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
	filterBar: "flex flex-col gap-3 border-b border-border/50 bg-background/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
	content: "relative min-h-[14rem]",
	contentList: "bg-muted/[0.18]",
	footer: "flex items-center justify-between border-t border-border/60 bg-muted/10 px-4 py-2.5 text-xs text-muted-foreground",
	emptyPanel: "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/10 px-6 py-16 text-center",
	segmentedList: "inline-flex h-9 shrink-0 items-center gap-0.5 rounded-lg border border-border/60 bg-background/80 p-0.5 shadow-sm",
	segmentedButton: (active) => cn("inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors", active ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"),
	tabList: "h-9 gap-0 rounded-lg border border-border/60 bg-background/80 p-0.5 shadow-sm",
	tabTrigger: "h-8 rounded-md px-3 text-xs font-medium data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none",
	projectPill: "inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs text-foreground"
};
//#endregion
//#region src/features/dashboard/tasks/tasks-theme.ts
/** Tasks workspace surfaces — extends shared dashboard workspace tokens. */
var TASKS_THEME = {
	...DASHBOARD_WORKSPACE_THEME,
	summaryCard: DASHBOARD_WORKSPACE_THEME.summaryStrip,
	rail: DASHBOARD_WORKSPACE_THEME.workspaceRail,
	segmented: DASHBOARD_WORKSPACE_THEME.segmentedList,
	sheet: {
		content: "flex size-full flex-col border-l border-border/70 bg-card p-0 shadow-xl sm:max-w-md",
		header: "shrink-0 space-y-1 border-b border-border/60 bg-gradient-to-br from-card via-card to-muted/25 p-5 pr-12",
		body: "flex-1 space-y-5 overflow-y-auto p-5",
		footer: "shrink-0 flex flex-col-reverse gap-2 border-t border-border/60 bg-muted/15 px-5 py-4 sm:flex-row sm:justify-end"
	},
	dialog: {
		content: "gap-0 overflow-hidden p-0 sm:max-w-[32rem]",
		header: "space-y-1 border-b border-border/60 bg-gradient-to-br from-card via-card to-muted/25 px-5 pb-4 pt-5 pr-12 text-left",
		body: "space-y-5 p-5",
		footer: "flex flex-col-reverse gap-2 border-t border-border/60 bg-muted/15 px-5 py-4 sm:flex-row sm:justify-end"
	},
	viewDialog: {
		shell: "flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl",
		header: "shrink-0 space-y-3 border-b border-border/60 bg-gradient-to-br from-card via-card to-muted/20 px-6 pb-4 pt-5 pr-14",
		tabsRail: "shrink-0 border-b border-border/50 bg-muted/10 px-6 py-3",
		tabList: "grid h-10 w-full grid-cols-2 gap-0.5",
		tabTrigger: "h-9 w-full gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border/50",
		body: "min-h-0 flex-1 overflow-hidden",
		scroll: "px-6 pb-5 pt-4",
		footer: "shrink-0 flex-col gap-3 border-t border-border/60 bg-muted/15 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
	},
	formSection: "space-y-3.5 rounded-xl border border-border/60 bg-muted/10 p-4 shadow-sm",
	formSectionTitle: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
	field: "space-y-1.5",
	label: "text-xs font-medium text-foreground",
	hint: "text-[11px] leading-relaxed text-muted-foreground",
	contextChip: "flex min-h-9 items-center rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground shadow-sm",
	input: "h-9 border-border/60 bg-background text-sm shadow-sm",
	textarea: "min-h-[5.5rem] resize-y border-border/60 bg-background text-sm shadow-sm",
	selectTrigger: "h-9 border-border/60 bg-background text-sm shadow-sm",
	error: "rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive",
	footerPrimary: "h-9 min-w-[7.5rem] font-medium"
};
//#endregion
//#region src/features/dashboard/tasks/task-types.ts
var RETRY_CONFIG = {
	maxRetries: 3,
	baseDelayMs: 1e3,
	maxDelayMs: 1e4
};
var SORT_OPTIONS = [
	{
		value: "updatedAt",
		label: "Last updated"
	},
	{
		value: "createdAt",
		label: "Created date"
	},
	{
		value: "title",
		label: "Title"
	},
	{
		value: "status",
		label: "Status"
	},
	{
		value: "priority",
		label: "Priority"
	},
	{
		value: "dueDate",
		label: "Due date"
	}
];
var statusLaneColors = {
	todo: "bg-muted-foreground",
	"in-progress": "bg-primary",
	review: "bg-accent-foreground",
	completed: "bg-primary",
	archived: "bg-muted-foreground/60"
};
var taskViewStatusPill = {
	todo: "border-primary/25 bg-primary/10 text-primary",
	"in-progress": "border-primary/25 bg-primary/10 text-primary",
	review: "border-accent/30 bg-accent/15 text-accent-foreground",
	completed: "border-primary/25 bg-primary/10 text-primary",
	archived: "border-border bg-muted text-muted-foreground"
};
var taskViewPriorityPill = {
	low: "border-border bg-muted text-muted-foreground",
	medium: "border-violet-300/80 bg-violet-100 text-violet-950 dark:border-violet-500/50 dark:bg-violet-950/80 dark:text-violet-100",
	high: "border-amber-300/80 bg-amber-50 text-amber-950 dark:border-amber-500/50 dark:bg-amber-950/80 dark:text-amber-100",
	urgent: "border-destructive/40 bg-destructive/15 text-destructive dark:bg-destructive/20 dark:text-destructive-foreground"
};
var priorityAccentColors = {
	urgent: "bg-destructive",
	high: "bg-warning",
	medium: "bg-primary",
	low: "bg-muted-foreground/35"
};
var taskPillColors = {
	count: "border-border bg-background text-foreground shadow-sm",
	client: "border-border bg-muted text-muted-foreground shadow-sm",
	project: "border-transparent bg-accent/10 text-primary shadow-sm",
	neutral: "border-border bg-muted text-muted-foreground shadow-sm",
	subtask: "border-transparent bg-secondary text-secondary-foreground shadow-sm",
	comments: "border-transparent bg-accent text-accent-foreground shadow-sm",
	attachments: "border-border bg-background text-muted-foreground shadow-sm",
	time: "border-transparent bg-accent/10 text-primary shadow-sm",
	recurring: "border-transparent bg-secondary text-secondary-foreground shadow-sm",
	shared: "border-transparent bg-accent/10 text-primary shadow-sm",
	tag: "border-border bg-background text-muted-foreground shadow-sm",
	dueSoon: "border-transparent bg-accent text-accent-foreground shadow-sm",
	overdue: "border-transparent bg-destructive/10 text-destructive shadow-sm"
};
var taskInfoPanelClasses = {
	base: "rounded-[1.15rem] border border-border bg-background px-3.5 py-3 shadow-sm",
	icon: "flex size-8 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground shadow-sm",
	label: "text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground",
	value: "text-sm font-semibold leading-tight text-foreground"
};
var STATUS_ICONS = {
	todo: Circle,
	"in-progress": CirclePlay,
	review: Eye,
	completed: CircleCheck,
	archived: Archive
};
var PRIORITY_ORDER = {
	urgent: 0,
	high: 1,
	medium: 2,
	low: 3
};
/** Compact status pills for data-table cells (no heavy border tokens). */
var statusTablePillClass = {
	todo: "bg-muted text-muted-foreground",
	"in-progress": "bg-info/15 text-info",
	review: "bg-warning/15 text-warning-foreground",
	completed: "bg-success/15 text-success",
	archived: "bg-muted/80 text-muted-foreground"
};
var buildInitialFormState = (client, project) => ({
	title: "",
	description: "",
	status: "todo",
	priority: "medium",
	assignedTo: "",
	clientId: client?.id ?? null,
	clientName: client?.name ?? "",
	projectId: project?.id ?? null,
	projectName: project?.name ?? "",
	dueDate: ""
});
function parseTaskDateValue(value) {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (match) {
		const year = Number(match[1]);
		const month = Number(match[2]) - 1;
		const day = Number(match[3]);
		const date = new Date(year, month, day);
		return Number.isNaN(date.getTime()) ? null : date;
	}
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}
function startOfLocalDay(date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function isFutureTaskDueDate(date, now = /* @__PURE__ */ new Date()) {
	return startOfLocalDay(date).getTime() >= startOfLocalDay(now).getTime();
}
function isTaskDueDateDisabled(date) {
	return !isFutureTaskDueDate(date);
}
function isFutureTaskDueDateValue(value, now = /* @__PURE__ */ new Date()) {
	if (!value) return true;
	const date = parseTaskDateValue(value);
	if (!date) return false;
	return isFutureTaskDueDate(date, now);
}
function assignableImportParticipants(participants) {
	return participants.filter((participant) => {
		const id = participant.id?.trim();
		return Boolean(id && !id.startsWith("member-"));
	});
}
function clientRosterAssigneeNames(client) {
	if (!client) return [];
	const names = [];
	const accountManager = client.accountManager?.trim();
	if (accountManager) names.push(accountManager);
	for (const member of client.teamMembers ?? []) {
		const name = member.name?.trim();
		if (name) names.push(name);
	}
	const seen = /* @__PURE__ */ new Set();
	return names.filter((name) => {
		const key = name.toLowerCase();
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
function teamMembersToMentionable(members) {
	return members.map((m, idx) => ({
		id: m.id ?? `member-${idx}`,
		name: m.name,
		role: m.role
	}));
}
function mergeTaskParticipants(sources) {
	const byName = /* @__PURE__ */ new Map();
	for (const members of sources) for (const member of members) {
		const key = member.name.trim().toLowerCase();
		if (!key) continue;
		const existing = byName.get(key);
		byName.set(key, {
			id: member.id ?? existing?.id,
			name: member.name,
			role: existing?.role ?? member.role,
			email: member.email ?? existing?.email
		});
	}
	return Array.from(byName.values()).toSorted((a, b) => a.name.localeCompare(b.name));
}
/**
* Extract plain user names from a MentionInput value string.
* Handles both `@[Name]` mention format and plain comma-separated names.
*/
function parseMentionNames(value) {
	const mentionRegex = /@\[([^\]]+)\]/g;
	const names = [];
	let match = mentionRegex.exec(value);
	while (match !== null) {
		const name = match[1]?.trim();
		if (name) names.push(name);
		match = mentionRegex.exec(value);
	}
	if (names.length > 0) return names;
	return [];
}
function formatAssigneeDraftFromUserIds(userIds, participants) {
	return userIds.flatMap((userId) => {
		const member = participants.find((participant) => participant.id === userId);
		return member?.name ? [`@[${member.name}]`] : [];
	}).join(" ");
}
function resolveAssigneeUserIds(value, participants) {
	const names = parseMentionNames(value);
	const participantsByName = new Map(participants.map((participant) => [participant.name.trim().toLowerCase(), participant]));
	const resolved = /* @__PURE__ */ new Set();
	for (const name of names) {
		const member = participantsByName.get(name.toLowerCase());
		if (member?.id) resolved.add(member.id);
	}
	return [...resolved];
}
function getAssigneeDraftIssue(value, participants) {
	const names = parseMentionNames(value);
	if (names.length === 0) return null;
	if (resolveAssigneeUserIds(value, participants).length === names.length) return null;
	return "Pick assignees from your teammate list — unrecognized names cannot be saved.";
}
function resolveAssigneeLabel(value, participants) {
	const byId = participants.find((participant) => participant.id === value);
	if (byId?.name) return byId.name;
	return participants.find((participant) => participant.name.trim().toLowerCase() === value.trim().toLowerCase())?.name ?? value;
}
function formatAssigneeList(assignees, participants) {
	if (assignees.length === 0) return "Unassigned";
	return assignees.map((assignee) => resolveAssigneeLabel(assignee, participants)).join(", ");
}
function formatDate(value) {
	if (!value) return "No due date";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	const now = /* @__PURE__ */ new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const diffTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Tomorrow";
	if (diffDays === -1) return "Yesterday";
	if (diffDays > 1 && diffDays < 7) return formatDate$1(value, "EEEE");
	return formatDate$1(value, DATE_FORMATS.SHORT, void 0, "") || value;
}
function formatStatusLabel(status) {
	switch (status) {
		case "in-progress": return "In Progress";
		case "todo": return "To Do";
		case "review": return "Review";
		case "completed": return "Completed";
		case "archived": return "Archived";
		default: return status;
	}
}
function formatPriorityLabel(priority) {
	return priority.charAt(0).toUpperCase() + priority.slice(1);
}
function isOverdue(task) {
	if (!task.dueDate || task.status === "completed" || task.status === "archived") return false;
	return new Date(task.dueDate) < /* @__PURE__ */ new Date();
}
function isDueSoon(task, daysThreshold = 3) {
	if (!task.dueDate || task.status === "completed" || task.status === "archived") return false;
	const dueDate = new Date(task.dueDate);
	const now = /* @__PURE__ */ new Date();
	const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
	return diffDays >= 0 && diffDays <= daysThreshold;
}
function formatTimeSpent(minutes) {
	if (!minutes || minutes === 0) return "No time logged";
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
	if (hours > 0) return `${hours}h`;
	return `${mins}m`;
}
//#endregion
export { TASKS_THEME as A, PopoverTrigger as B, statusLaneColors as C, taskViewPriorityPill as D, taskPillColors as E, PendingAttachmentsList as F, MessageAttachments as H, ReplyIndicator as I, RichComposer as L, TaskCommentsPanel as M, MessageContent as N, taskViewStatusPill as O, LiveRegion as P, Popover as R, resolveAssigneeUserIds as S, taskInfoPanelClasses as T, extractMentionsFromContent as U, emoji_picker_default as V, isOverdue as _, assignableImportParticipants as a, priorityAccentColors as b, formatAssigneeDraftFromUserIds as c, formatPriorityLabel as d, formatStatusLabel as f, isFutureTaskDueDateValue as g, isDueSoon as h, STATUS_ICONS as i, DASHBOARD_WORKSPACE_THEME as j, teamMembersToMentionable as k, formatAssigneeList as l, getAssigneeDraftIssue as m, RETRY_CONFIG as n, buildInitialFormState as o, formatTimeSpent as p, SORT_OPTIONS as r, clientRosterAssigneeNames as s, PRIORITY_ORDER as t, formatDate as u, isTaskDueDateDisabled as v, statusTablePillClass as w, resolveAssigneeLabel as x, mergeTaskParticipants as y, PopoverContent as z };
