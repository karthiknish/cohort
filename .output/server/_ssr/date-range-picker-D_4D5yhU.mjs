import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { V as startOfDay, _ as format, a as subDays, k as endOfDay } from "../_libs/date-fns.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { hr as ChevronDown, wr as Calendar } from "../_libs/lucide-react.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-BwHc7N7y.mjs";
import { t as Calendar$1 } from "./calendar-9B6zD0Is.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/date-range-picker-D_4D5yhU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PRESETS = [
	{
		label: "Last 7 days",
		days: 7
	},
	{
		label: "Last 14 days",
		days: 14
	},
	{
		label: "Last 30 days",
		days: 30
	},
	{
		label: "Last 90 days",
		days: 90
	}
];
function getPresetRange(days) {
	const end = endOfDay(/* @__PURE__ */ new Date());
	return {
		start: startOfDay(subDays(end, days - 1)),
		end
	};
}
function formatDateRange(range) {
	return `${format(range.start, "MMM d")} – ${format(range.end, "MMM d, yyyy")}`;
}
function DateRangePicker({ value, onChange, className, lifetimeRange }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const dateRange = {
		from: value.start,
		to: value.end
	};
	const handleSelect = (range) => {
		if (range?.from && range?.to) onChange({
			start: startOfDay(range.from),
			end: endOfDay(range.to)
		});
	};
	const handlePresetSelect = (days) => {
		onChange(getPresetRange(days));
		setOpen(false);
	};
	const handleLifetimeSelect = () => {
		if (!lifetimeRange) return;
		onChange(lifetimeRange);
		setOpen(false);
	};
	const handleDisabledDate = (date) => date > /* @__PURE__ */ new Date();
	const presetHandlers = {
		7: () => handlePresetSelect(7),
		14: () => handlePresetSelect(14),
		30: () => handlePresetSelect(30),
		90: () => handlePresetSelect(90)
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("grid gap-2", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open,
			onOpenChange: setOpen,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					id: "date",
					variant: "outline",
					className: cn("w-fit justify-start text-left font-normal", !value && "text-muted-foreground"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "mr-2 size-4" }),
						formatDateRange(value),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "ml-2 size-4 opacity-50" })
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
				className: "w-auto p-0",
				align: "end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1 border-b p-3 sm:border-b-0 sm:border-r",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mb-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide",
								children: "Presets"
							}),
							lifetimeRange ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								className: "justify-start font-normal",
								onClick: handleLifetimeSelect,
								children: "Lifetime"
							}) : null,
							PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								className: "justify-start font-normal",
								onClick: presetHandlers[preset.days],
								children: preset.label
							}, preset.days))
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
							initialFocus: true,
							mode: "range",
							defaultMonth: dateRange.from,
							selected: dateRange,
							onSelect: handleSelect,
							numberOfMonths: 2,
							disabled: handleDisabledDate
						})
					})]
				})
			})]
		})
	});
}
//#endregion
export { DateRangePicker as t };
