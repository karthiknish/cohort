import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { n as buttonVariants, t as Button } from "./button-BHcJlp0q.mjs";
import { hr as ChevronDown, mr as ChevronLeft, pr as ChevronRight } from "../_libs/lucide-react.mjs";
import { n as getDefaultClassNames, t as DayPicker } from "../_libs/react-day-picker.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
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
function Calendar$1({ className, classNames, showOutsideDays = true, captionLayout = "dropdown", buttonVariant = "ghost", fromYear, toYear, formatters, components, showWeekNumber = false, ...props }) {
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
export { Calendar$1 as t };
