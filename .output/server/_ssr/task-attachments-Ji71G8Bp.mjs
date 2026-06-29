import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn, d as formatDate$1, n as DATE_FORMATS } from "./utils-hh4sibN0.mjs";
import { h as listItemEnterClass } from "./motion-Cf6ujF0h.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { c as reportConvexFailure } from "./notifications-DQZKskhM.mjs";
import { An as FileText, Fr as Bold, Gr as Archive, I as Smile, In as Eye, Jn as Code, Kn as Copy, Qt as ListOrdered, Rr as AtSign, Xt as List, Yt as LoaderCircle, cn as Italic, et as Reply, fn as Image, g as Upload, gr as Check, i as X, ir as CirclePlay, or as CircleCheck, st as Quote, tr as Circle, xt as Paperclip } from "../_libs/lucide-react.mjs";
import { t as Label } from "./label-B_FvRq1I.mjs";
import { a as getIconContainerClasses } from "./dashboard-theme-DM5oBGdY.mjs";
import { t as Textarea } from "./textarea-C0M2IvQZ.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-BwHc7N7y.mjs";
import { t as uploadStorageFile } from "./upload-storage-file-CUAnugSD.mjs";
import { t as LazyImage } from "./lazy-image-69k9UCD2.mjs";
import { a as CHAT_MESSAGE_BODY_CLASS, i as CHAT_MARKDOWN_CLASS } from "./utils-DWnHfwOl.mjs";
import { a as hasHighlightTerms, n as ChatMediaGallery, o as highlightText } from "./use-voice-input-CLPTluum.mjs";
import { i as useClientRelativeTime, n as VoiceInputButton } from "./use-client-relative-time-BtAGXTYW.mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
import { t as remarkGfm } from "../_libs/remark-gfm.mjs";
import { t as DASHBOARD_WORKSPACE_THEME } from "./dashboard-workspace-theme-Ckmkwu5P.mjs";
import { t as LiveRegion } from "./live-region-BmnQNfB0.mjs";
import { n as Theme, t as EmojiPicker$1 } from "../_libs/emoji-picker-react+flairup.mjs";
import { n as highlighter, t as one_light_default } from "../_libs/react-syntax-highlighter+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/task-attachments-Ji71G8Bp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
var emoji_picker_default = EmojiPicker$1;
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
function TaskSheetHeader({ icon: Icon, title, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: TASKS_THEME.sheet.header,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn(getIconContainerClasses("medium"), "size-10 shrink-0"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-5",
					"aria-hidden": true
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold tracking-tight text-foreground",
					children: title
				}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: description
				}) : null]
			})]
		})
	});
}
function TaskFormSection({ title, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn(TASKS_THEME.formSection, className),
		"aria-labelledby": void 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: TASKS_THEME.formSectionTitle,
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3.5",
			children
		})]
	});
}
function TaskFormField({ id, label, hint, children, required }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: TASKS_THEME.field,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				htmlFor: id,
				className: TASKS_THEME.label,
				children: [label, required ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-destructive",
					children: " *"
				}) : null]
			}),
			children,
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: TASKS_THEME.hint,
				children: hint
			}) : null
		]
	});
}
function TaskContextChip({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: TASKS_THEME.contextChip,
		children
	});
}
function TaskModalError({ message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: TASKS_THEME.error,
		role: "alert",
		children: message
	});
}
function TaskModalActions({ onCancel, cancelLabel = "Cancel", submitLabel, loadingLabel, isLoading, submitDisabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "outline",
			className: "h-9",
			onClick: onCancel,
			disabled: isLoading,
			children: cancelLabel
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "submit",
			className: TASKS_THEME.footerPrimary,
			disabled: isLoading || submitDisabled,
			children: isLoading ? loadingLabel ?? "Saving…" : submitLabel
		})]
	});
}
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
function ClientRelativeTime({ value, className, children }) {
	const label = useClientRelativeTime(value);
	if (!label) return null;
	if (children) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: children(label) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(className),
		suppressHydrationWarning: true,
		children: label
	});
}
var ALLOWED_TASK_ATTACHMENT_MIME_TYPES = new Set([
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
var MAX_TASK_ATTACHMENT_BYTES = 15 * 1024 * 1024;
function formatFileSize(bytes) {
	if (!Number.isFinite(bytes) || bytes <= 0) return "1 KB";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function buildPendingTaskAttachments(files) {
	const now = Date.now();
	return Array.from(files).map((file, index) => ({
		id: `${now}-${index}-${file.name}`,
		file,
		name: file.name,
		mimeType: file.type || "application/octet-stream",
		sizeLabel: formatFileSize(file.size)
	}));
}
async function uploadTaskAttachment(args) {
	const { userId, file, generateUploadUrl, syncMetadata, getPublicUrl } = args;
	if (!userId) throw new Error("userId is required");
	if (!file) throw new Error("file is required");
	if (file.size > MAX_TASK_ATTACHMENT_BYTES) throw new Error("Attachment is too large (max 15MB)");
	const contentType = file.type || "application/octet-stream";
	if (!ALLOWED_TASK_ATTACHMENT_MIME_TYPES.has(contentType)) throw new Error("Unsupported attachment file type");
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
export { getAssigneeDraftIssue as A, statusTablePillClass as B, extractMentionsFromContent as C, formatPriorityLabel as D, formatDate as E, mergeTaskParticipants as F, teamMembersToMentionable as G, taskPillColors as H, priorityAccentColors as I, uploadTaskAttachment as K, resolveAssigneeLabel as L, isFutureTaskDueDateValue as M, isOverdue as N, formatStatusLabel as O, isTaskDueDateDisabled as P, resolveAssigneeUserIds as R, emoji_picker_default as S, formatAssigneeList as T, taskViewPriorityPill as U, taskInfoPanelClasses as V, taskViewStatusPill as W, TaskSheetHeader as _, PendingAttachmentsList as a, buildPendingTaskAttachments as b, RichComposer as c, TASKS_THEME as d, TaskContextChip as f, TaskModalError as g, TaskModalActions as h, PRIORITY_ORDER as i, isDueSoon as j, formatTimeSpent as k, SORT_OPTIONS as l, TaskFormSection as m, MessageAttachments as n, RETRY_CONFIG as o, TaskFormField as p, MessageContent as r, ReplyIndicator as s, ClientRelativeTime as t, STATUS_ICONS as u, assignableImportParticipants as v, formatAssigneeDraftFromUserIds as w, clientRosterAssigneeNames as x, buildInitialFormState as y, statusLaneColors as z };
