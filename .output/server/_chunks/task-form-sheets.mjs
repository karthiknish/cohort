import { o as __toESM, r as __exportAll } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { _ as format, r as parseISO } from "../_libs/date-fns.mjs";
import { Yt as LoaderCircle, Zt as ListTodo, f as User, gt as Pencil, hr as ChevronDown, i as X, mr as ChevronLeft, pr as ChevronRight, un as Info, wr as Calendar$1, xt as Paperclip } from "../_libs/lucide-react.mjs";
import { i as Trigger, n as Portal, r as Root2, t as Content2 } from "../_libs/radix-ui__react-hover-card.mjs";
import { n as getDefaultClassNames, t as DayPicker } from "../_libs/react-day-picker.mjs";
import { t as cn } from "./utils.mjs";
import { E as surfaceMotionClasses } from "./motion.mjs";
import { t as buttonVariants } from "./button-variants.mjs";
import { t as Button } from "./button.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select.mjs";
import { t as Input } from "./input.mjs";
import { t as Label } from "./label.mjs";
import { o as FieldLabel } from "./field.mjs";
import { a as getIconContainerClasses } from "./dashboard-theme.mjs";
import { a as useIsMobile, i as DrawerTrigger, n as DrawerClose, r as DrawerContent, t as Drawer } from "./drawer.mjs";
import { n as SheetClose, r as SheetContent, s as SheetTrigger, t as Sheet } from "./sheet.mjs";
import { A as TASKS_THEME, B as PopoverTrigger, F as PendingAttachmentsList, M as TaskCommentsPanel, P as LiveRegion, R as Popover, b as priorityAccentColors, d as formatPriorityLabel, f as formatStatusLabel, k as teamMembersToMentionable, v as isTaskDueDateDisabled, z as PopoverContent } from "./task-types.mjs";
import { r as Textarea } from "./voice-input.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar.mjs";
//#region src/shared/ui/responsive-form-sheet.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var ResponsiveFormSheetContext = (0, import_react.createContext)("sheet");
/**
* Right sheet on md+; bottom drawer on mobile (Vaul) for native-feeling forms.
*/
function ResponsiveFormSheet({ open, onOpenChange, children, trigger, contentClassName, sheetSide = "right" }) {
	const isMobile = useIsMobile();
	const contextValue = isMobile ? "drawer" : "sheet";
	if (isMobile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveFormSheetContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer, {
			open,
			onOpenChange,
			direction: "bottom",
			shouldScaleBackground: true,
			children: [trigger ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerTrigger, {
				asChild: true,
				children: trigger
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerContent, {
				className: cn("flex max-h-[92dvh] flex-col gap-0 p-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]", contentClassName),
				children
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveFormSheetContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
			open,
			onOpenChange,
			children: [trigger ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
				asChild: true,
				children: trigger
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
				side: sheetSide,
				className: contentClassName,
				children
			})]
		})
	});
}
/** Close control that works inside ResponsiveFormSheet (Sheet or Drawer). */
function FormSheetClose({ ...props }) {
	if ((0, import_react.use)(ResponsiveFormSheetContext) === "drawer") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerClose, { ...props });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetClose, { ...props });
}
//#endregion
//#region src/shared/ui/calendar.tsx
var CURRENT_YEAR = (/* @__PURE__ */ new Date()).getFullYear();
var DEFAULT_FROM_YEAR = CURRENT_YEAR - 10;
var DEFAULT_TO_YEAR = CURRENT_YEAR + 10;
var RTL_NEXT_ICON_CLASS = "rtl:**:[.rdp-button\\_next>svg]:rotate-180";
var RTL_PREVIOUS_ICON_CLASS = "rtl:**:[.rdp-button\\_previous>svg]:rotate-180";
function CalendarRoot({ className, rootRef, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "calendar",
		ref: rootRef,
		className: cn(className),
		...props
	});
}
function CalendarChevron({ className, orientation, ...props }) {
	if (orientation === "left") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
		className: cn("size-4", className),
		...props
	});
	if (orientation === "right") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
		className: cn("size-4", className),
		...props
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
		className: cn("size-4", className),
		...props
	});
}
function CalendarWeekNumber({ children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex size-(--cell-size) items-center justify-center text-center",
			children
		})
	});
}
function Calendar({ className, classNames, showOutsideDays = true, captionLayout = "dropdown", buttonVariant = "ghost", fromYear, toYear, formatters, components, showWeekNumber = false, ...props }) {
	const defaultClassNames = getDefaultClassNames();
	const resolvedFromYear = fromYear ?? DEFAULT_FROM_YEAR;
	const resolvedToYear = toYear ?? DEFAULT_TO_YEAR;
	const calendarFormatters = {
		formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
		...formatters
	};
	const calendarClassNames = {
		root: cn("w-fit", defaultClassNames.root),
		months: cn("flex gap-4 flex-col md:flex-row relative", defaultClassNames.months),
		month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
		nav: cn("flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between", defaultClassNames.nav),
		button_previous: cn(buttonVariants({ variant: buttonVariant }), "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none", defaultClassNames.button_previous),
		button_next: cn(buttonVariants({ variant: buttonVariant }), "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none", defaultClassNames.button_next),
		month_caption: cn("flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)", defaultClassNames.month_caption),
		dropdowns: cn("w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5", defaultClassNames.dropdowns),
		dropdown_root: cn("relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md", defaultClassNames.dropdown_root),
		dropdown: cn("absolute bg-popover inset-0 opacity-0", defaultClassNames.dropdown),
		caption_label: cn("select-none font-medium", captionLayout === "label" ? "text-sm" : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5", defaultClassNames.caption_label),
		table: "w-full border-collapse",
		weekdays: cn("flex", defaultClassNames.weekdays),
		weekday: cn("text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none", defaultClassNames.weekday),
		week: cn("flex w-full mt-2", defaultClassNames.week),
		week_number_header: cn("select-none w-(--cell-size)", defaultClassNames.week_number_header),
		week_number: cn("text-[0.8rem] select-none text-muted-foreground", defaultClassNames.week_number),
		day: cn("relative size-full p-0 text-center [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none", showWeekNumber ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md" : "[&:first-child[data-selected=true]_button]:rounded-l-md", defaultClassNames.day),
		range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
		range_middle: cn("rounded-none", defaultClassNames.range_middle),
		range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
		today: cn("bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none", defaultClassNames.today),
		outside: cn("text-muted-foreground aria-selected:text-muted-foreground", defaultClassNames.outside),
		disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
		hidden: cn("invisible", defaultClassNames.hidden),
		...classNames
	};
	const calendarComponents = {
		Root: CalendarRoot,
		Chevron: CalendarChevron,
		DayButton: CalendarDayButton,
		WeekNumber: CalendarWeekNumber,
		...components
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayPicker, {
		showOutsideDays,
		className: cn("bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent", RTL_NEXT_ICON_CLASS, RTL_PREVIOUS_ICON_CLASS, className),
		captionLayout,
		formatters: calendarFormatters,
		classNames: calendarClassNames,
		components: calendarComponents,
		fromYear: resolvedFromYear,
		toYear: resolvedToYear,
		...props
	});
}
function CalendarDayButton({ className, day, modifiers, ...props }) {
	const defaultClassNames = getDefaultClassNames();
	const focusDayButton = (node) => {
		if (modifiers.focused && node) node.focus();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		ref: focusDayButton,
		variant: "ghost",
		size: "icon",
		"data-day": day.date.toLocaleDateString(),
		"data-selected-single": modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle,
		"data-range-start": modifiers.range_start,
		"data-range-end": modifiers.range_end,
		"data-range-middle": modifiers.range_middle,
		className: cn("data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70", defaultClassNames.day, className),
		...props
	});
}
//#endregion
//#region src/shared/ui/hover-card-trigger.tsx
function HoverCardTrigger({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		"data-slot": "hover-card-trigger",
		...props
	});
}
//#endregion
//#region src/shared/ui/hover-card-content.tsx
function HoverCardContent({ className, align = "center", sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		"data-slot": "hover-card-content",
		align,
		sideOffset,
		className: cn("z-[1200] w-64 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none", surfaceMotionClasses.popoverContent, className),
		...props
	}) });
}
//#endregion
//#region src/shared/ui/hover-card.tsx
function HoverCard({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2, {
		"data-slot": "hover-card",
		openDelay: 200,
		closeDelay: 100,
		...props
	});
}
//#endregion
//#region src/shared/ui/hover-preview.tsx
function HoverPreview({ trigger, children, side = "top", align = "center", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HoverCard, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverCardTrigger, {
		asChild: true,
		children: trigger
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverCardContent, {
		side,
		align,
		className: cn("text-sm leading-relaxed", className),
		children
	})] });
}
function TruncatedTextPreviewTrigger({ text, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: cn("block min-w-0 truncate text-left", className),
		children: text
	});
}
/** Truncated inline text that expands in a hover card — no navigation. */
function TruncatedTextPreview({ text, className, detail }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HoverPreview, {
		trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TruncatedTextPreviewTrigger, {
			text,
			className
		}),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium text-foreground",
			children: text
		}), detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 text-xs text-muted-foreground",
			children: detail
		}) : null]
	});
}
function MetricHintTrigger({ description, label, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: cn("inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
		"aria-label": label ?? description,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
			className: "size-3",
			"aria-hidden": true
		})
	});
}
/** Info icon with metric/KPI explanation on hover (replaces tooltip-only hints). */
function MetricHint({ description, label, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverPreview, {
		trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricHintTrigger, {
			description,
			label,
			className
		}),
		className: "max-w-xs",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs leading-relaxed text-muted-foreground",
			children: description
		})
	});
}
function MetricCardPreviewTrigger({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "cursor-default",
		children
	});
}
/** Wraps a KPI/metric card so the full explanation appears on hover. */
function MetricCardPreview({ children, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverPreview, {
		trigger: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCardPreviewTrigger, { children }),
		className: "max-w-xs",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs leading-relaxed",
			children: description
		})
	});
}
//#endregion
//#region src/shared/ui/mention-input-helpers.tsx
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
//#endregion
//#region src/shared/ui/use-mention-input.tsx
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
//#endregion
//#region src/shared/ui/mention-input.tsx
function MentionInput(props) {
	return useMentionInput(props);
}
//#endregion
//#region src/features/dashboard/tasks/task-modal-primitives.tsx
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
//#endregion
//#region src/features/dashboard/tasks/task-form-sheet-sections.tsx
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, { className: "mr-2 size-4 shrink-0" }), formState.dueDate ? format(parseISO(formState.dueDate), "PPP") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pick a date" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			className: "w-auto p-0",
			align: "start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, {
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
//#endregion
//#region src/features/dashboard/tasks/task-form-sheets.tsx
var task_form_sheets_exports = /* @__PURE__ */ __exportAll({
	CreateTaskSheet: () => CreateTaskSheet,
	EditTaskSheet: () => EditTaskSheet
});
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
function CreateTaskSheet({ open, onOpenChange, formState, setFormState, creating, createError, onSubmit, participants, pendingAttachments, onAddAttachments, onRemoveAttachment }) {
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
function EditTaskSheet({ open, onOpenChange, taskId, formState, setFormState, updating, updateError, onSubmit, currentWorkspaceId, currentUserId, currentUserName, currentUserRole, participants }) {
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
//#endregion
export { TaskModalActions as a, MetricCardPreview as c, Calendar as d, FormSheetClose as f, TaskFormSection as i, MetricHint as l, TaskContextChip as n, TaskModalError as o, ResponsiveFormSheet as p, TaskFormField as r, MentionInput as s, task_form_sheets_exports as t, TruncatedTextPreview as u };
