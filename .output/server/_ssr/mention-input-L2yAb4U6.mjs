import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { f as User, i as X } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { o as FieldLabel } from "./field-BTH9SS9b.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-DghqGd0Q.mjs";
import { t as HoverPreview } from "./hover-preview-BP_Z2-hG.mjs";
import { t as LiveRegion } from "./live-region-BmnQNfB0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mention-input-L2yAb4U6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MentionUserNameTrigger({ name }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "block truncate font-medium",
		children: name
	});
}
function MentionUserHoverPreview({ user }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverPreview, {
		trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MentionUserNameTrigger, { name: user.name }),
		className: "w-56",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
				className: "size-9 shrink-0",
				children: [user.avatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
					src: user.avatar,
					alt: "",
					className: "object-cover"
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
					className: "bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4 text-muted-foreground" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-0.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium text-foreground",
						children: user.name
					}),
					user.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: user.email
					}) : null,
					user.role ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: user.role
					}) : null
				]
			})]
		})
	});
}
var DEFAULT_MENTION_STATE = {
	active: false,
	startIndex: -1,
	query: ""
};
var MAX_MENTION_RESULTS = 50;
function useMentionInput({ value, onChange, users, placeholder = "Type @ to mention users...", disabled = false, className, inputClassName, label, maxMentions = 10, allowMultiple = true, singleSelect = false, ref }) {
	const inputId = (0, import_react.useId)();
	const containerRef = (0, import_react.useRef)(null);
	const inputRef = (0, import_react.useRef)(null);
	const [mentionState, setMentionState] = (0, import_react.useState)(DEFAULT_MENTION_STATE);
	const [highlightedIndex, setHighlightedIndex] = (0, import_react.useState)(0);
	const usersByName = new Map(users.map((user) => [user.name, user]));
	const effectiveAllowMultiple = allowMultiple && !singleSelect;
	const mentionLimit = Math.max(1, singleSelect ? 1 : maxMentions);
	const resolveMentionsFromValue = (nextValue) => {
		const mentionRegex = /@\[([^\]]+)\]/g;
		const mentions = [];
		const seenIds = /* @__PURE__ */ new Set();
		let match = mentionRegex.exec(nextValue);
		while (match !== null) {
			const name = match[1];
			if (!name) {
				match = mentionRegex.exec(nextValue);
				continue;
			}
			const user = usersByName.get(name);
			if (user && !seenIds.has(user.id)) {
				seenIds.add(user.id);
				mentions.push(user);
			}
			match = mentionRegex.exec(nextValue);
		}
		return mentions;
	};
	const selectedMentions = resolveMentionsFromValue(value);
	const mentionResults = (() => {
		if (!mentionState.active) return [];
		const normalizedQuery = mentionState.query.toLowerCase();
		const filtered = users.filter((user) => user.name.toLowerCase().includes(normalizedQuery) || user.email?.toLowerCase().includes(normalizedQuery));
		if (effectiveAllowMultiple) {
			if (selectedMentions.length >= mentionLimit) return [];
			const selectedIds = new Set(selectedMentions.map((m) => m.id));
			return filtered.filter((user) => !selectedIds.has(user.id)).slice(0, MAX_MENTION_RESULTS);
		}
		return filtered.slice(0, MAX_MENTION_RESULTS);
	})();
	const effectiveHighlightedIndex = (() => {
		if (mentionResults.length === 0) return 0;
		return highlightedIndex >= mentionResults.length ? 0 : highlightedIndex;
	})();
	const resetMentionState = () => {
		setMentionState(DEFAULT_MENTION_STATE);
		setHighlightedIndex(0);
	};
	const detectMentionTrigger = (currentValue, caretPosition) => {
		if (caretPosition < 0) {
			resetMentionState();
			return;
		}
		const textBeforeCaret = currentValue.slice(0, caretPosition);
		const lastAtIndex = textBeforeCaret.lastIndexOf("@");
		if (lastAtIndex === -1) {
			resetMentionState();
			return;
		}
		const charBeforeAt = lastAtIndex > 0 ? textBeforeCaret[lastAtIndex - 1] ?? "" : "";
		if (!(lastAtIndex === 0 || /\s/.test(charBeforeAt) || [
			"(",
			"[",
			"{",
			"\"",
			"'",
			"`"
		].includes(charBeforeAt))) {
			resetMentionState();
			return;
		}
		const textAfterAt = textBeforeCaret.slice(lastAtIndex + 1);
		if (/\s|@|\[|\]/.test(textAfterAt)) {
			resetMentionState();
			return;
		}
		setMentionState({
			active: true,
			startIndex: lastAtIndex,
			query: textAfterAt
		});
		setHighlightedIndex(0);
	};
	const insertMention = (user) => {
		const input = inputRef.current;
		if (!input || disabled) return;
		const currentValue = value;
		const selectionStart = input.selectionStart ?? currentValue.length;
		const mentionStartIndex = mentionState.startIndex >= 0 ? mentionState.startIndex : currentValue.slice(0, selectionStart).lastIndexOf("@");
		if (mentionStartIndex === -1) {
			resetMentionState();
			return;
		}
		const mentionText = `@[${user.name}]`;
		const alreadySelected = selectedMentions.some((mention) => mention.id === user.id);
		if (effectiveAllowMultiple && !alreadySelected && selectedMentions.length >= mentionLimit) {
			resetMentionState();
			return;
		}
		if (!effectiveAllowMultiple) {
			const newValue = `${mentionText} `;
			onChange(newValue, [user]);
			resetMentionState();
			requestAnimationFrame(() => {
				input.focus();
				input.setSelectionRange(newValue.length, newValue.length);
			});
			return;
		}
		const beforeMention = currentValue.slice(0, mentionStartIndex);
		const afterMention = currentValue.slice(selectionStart);
		const needsLeadingSpace = beforeMention.length > 0 && !/\s$/.test(beforeMention);
		const needsTrailingSpace = afterMention.length === 0 || !/^[\s,.!?;:)\]}]/.test(afterMention);
		const insertion = `${needsLeadingSpace ? " " : ""}${mentionText}${needsTrailingSpace ? " " : ""}`;
		const newValue = `${beforeMention}${insertion}${afterMention}`.replace(/[ \t]{2,}/g, " ");
		const newMentions = resolveMentionsFromValue(newValue);
		const nextCaretPosition = beforeMention.length + insertion.length;
		onChange(newValue, newMentions);
		resetMentionState();
		requestAnimationFrame(() => {
			input.focus();
			input.setSelectionRange(nextCaretPosition, nextCaretPosition);
		});
	};
	const removeMention = (userToRemove) => {
		if (disabled) return;
		const escapedName = userToRemove.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const mentionPattern = new RegExp(`@\\[${escapedName}\\]\\s*`, "g");
		const newValue = value.replace(mentionPattern, "").replace(/[ \t]{2,}/g, " ").trim();
		onChange(newValue, resolveMentionsFromValue(newValue));
	};
	const handleInputChange = (event) => {
		const newValue = event.target.value;
		const caretPosition = event.target.selectionStart || newValue.length;
		onChange(newValue, resolveMentionsFromValue(newValue));
		detectMentionTrigger(newValue, caretPosition);
	};
	const handleInputSelect = (event) => {
		const caretPosition = event.currentTarget.selectionStart ?? event.currentTarget.value.length;
		detectMentionTrigger(event.currentTarget.value, caretPosition);
	};
	const handleInputBlur = () => {
		requestAnimationFrame(() => {
			const activeElement = document.activeElement;
			if (!containerRef.current || !activeElement) {
				resetMentionState();
				return;
			}
			if (!containerRef.current.contains(activeElement)) resetMentionState();
		});
	};
	const handleInputFocus = () => {
		const input = inputRef.current;
		if (!input) return;
		detectMentionTrigger(value, input.selectionStart ?? value.length);
	};
	const handleDropdownMouseDown = (event) => {
		event.preventDefault();
	};
	const handleUserSelect = (user) => {
		insertMention(user);
	};
	const callbackRef = (node) => {
		inputRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	};
	const removeMentionHandlers = Object.fromEntries(selectedMentions.map((mention) => [mention.id, () => removeMention(mention)]));
	const mentionOptionHandlers = Object.fromEntries(mentionResults.map((user, index) => [user.id, {
		onClick: () => handleUserSelect(user),
		onMouseEnter: () => setHighlightedIndex(index)
	}]));
	const handleKeyDown = (event) => {
		if (!mentionState.active) return;
		if (event.key === "ArrowDown" && mentionResults.length > 0) {
			event.preventDefault();
			setHighlightedIndex((current) => (current + 1) % mentionResults.length);
		} else if (event.key === "ArrowUp" && mentionResults.length > 0) {
			event.preventDefault();
			setHighlightedIndex((current) => (current - 1 + mentionResults.length) % mentionResults.length);
		} else if (event.key === "Enter" || event.key === "Tab") {
			event.preventDefault();
			if (mentionResults.length > 0) {
				const user = mentionResults[effectiveHighlightedIndex];
				if (user) insertMention(user);
			} else resetMentionState();
		} else if (event.key === "Escape") {
			event.preventDefault();
			resetMentionState();
		}
	};
	const hasReachedMentionLimit = effectiveAllowMultiple && selectedMentions.length >= mentionLimit;
	const showDropdown = mentionState.active && !disabled;
	const activeDescendantId = showDropdown && mentionResults.length > 0 ? `${inputId}-option-${mentionResults[effectiveHighlightedIndex]?.id}` : void 0;
	const mentionStatusId = `${inputId}-mention-status`;
	const mentionInstructionsId = `${inputId}-mention-instructions`;
	const mentionAnnouncement = (() => {
		if (!showDropdown) return hasReachedMentionLimit ? `Mention limit reached. Maximum ${mentionLimit} mentions allowed.` : "";
		if (hasReachedMentionLimit) return "Mention limit reached. Remove a mention to add another user.";
		if (mentionResults.length === 0) return mentionState.query.length > 0 ? `No users found for ${mentionState.query}.` : "Start typing to search users to mention.";
		const activeUser = mentionResults[effectiveHighlightedIndex];
		return `${mentionResults.length} mention suggestions available.${activeUser ? ` ${activeUser.name} highlighted.` : ""}`;
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-2", className),
		children: [
			label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldLabel, {
				htmlFor: inputId,
				children: label
			}) : null,
			selectedMentions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: selectedMentions.map((mention) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inline-flex items-center gap-1.5 rounded-md border border-accent/20 bg-accent/10 px-2 py-1 text-sm text-primary",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: mention.name }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: removeMentionHandlers[mention.id],
							className: "rounded-full p-0.5 text-primary/80 transition-colors hover:text-destructive",
							disabled,
							"aria-label": `Remove ${mention.name}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
						})
					]
				}, mention.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: containerRef,
				className: "relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveRegion, {
						id: mentionStatusId,
						message: mentionAnnouncement
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						id: mentionInstructionsId,
						className: "sr-only",
						children: "Type the at symbol to open mention suggestions. Use the arrow keys to move through suggestions and press Enter to select."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						ref: callbackRef,
						id: inputId,
						type: "text",
						value,
						onChange: handleInputChange,
						onKeyDown: handleKeyDown,
						onSelect: handleInputSelect,
						onClick: handleInputSelect,
						onFocus: handleInputFocus,
						onBlur: handleInputBlur,
						placeholder,
						disabled,
						autoComplete: "off",
						"aria-autocomplete": "list",
						role: "combobox",
						"aria-expanded": showDropdown,
						"aria-controls": showDropdown ? `${inputId}-mentions` : void 0,
						"aria-activedescendant": activeDescendantId,
						"aria-describedby": `${mentionInstructionsId} ${mentionStatusId}`,
						className: cn("h-11 rounded-lg", inputClassName)
					}),
					showDropdown && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						role: "presentation",
						className: "absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-muted/60 bg-popover shadow-lg",
						onMouseDown: handleDropdownMouseDown,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							id: `${inputId}-mentions`,
							"aria-label": "Mention suggestions",
							tabIndex: -1,
							className: "list-none",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "border-b px-3 py-1.5 text-xs font-medium uppercase text-muted-foreground",
									children: hasReachedMentionLimit ? `Mention limit reached (${mentionLimit})` : mentionResults.length > 0 ? "Select user" : "No matches"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "max-h-52 overflow-y-auto list-none",
									children: mentionResults.length > 0 ? mentionResults.map((user, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										id: `${inputId}-option-${user.id}`,
										type: "button",
										role: "option",
										"aria-selected": index === effectiveHighlightedIndex,
										onMouseEnter: mentionOptionHandlers[user.id]?.onMouseEnter,
										onClick: mentionOptionHandlers[user.id]?.onClick,
										className: cn("flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors", index === effectiveHighlightedIndex ? "bg-accent/10 text-primary" : "hover:bg-muted"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
											className: "size-7 shrink-0",
											children: [user.avatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
												src: user.avatar,
												alt: user.name,
												className: "object-cover"
											}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
												className: "bg-muted",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4 text-muted-foreground" })
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MentionUserHoverPreview, { user }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-xs text-muted-foreground",
												children: user.role || user.email || "Team member"
											})]
										})]
									}, user.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "px-3 py-2 text-sm text-muted-foreground",
										children: hasReachedMentionLimit ? "Remove a mention to add another user." : mentionState.query.length > 0 ? `No users found for "${mentionState.query}".` : "Start typing to search users."
									})
								}),
								mentionResults.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "list-none border-t px-3 py-1.5 text-xs text-muted-foreground",
									children: "Use Up/Down to navigate, Enter to select, Esc to close."
								})
							]
						})
					})
				]
			}),
			hasReachedMentionLimit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"Maximum ",
					mentionLimit,
					" mentions allowed"
				]
			})
		]
	});
}
function MentionInput(props) {
	return useMentionInput(props);
}
//#endregion
export { MentionInput as t };
