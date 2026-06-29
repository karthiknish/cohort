import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { it as kindToCategory } from "./preview-data-CXkRNfsX.mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { _ as format, i as isYesterday, r as parseISO, s as isToday } from "../_libs/date-fns.mjs";
import { h as listItemEnterClass } from "./motion-Cf6ujF0h.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { K as Settings2, Lr as BellOff, gr as Check, w as Trash2 } from "../_libs/lucide-react.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar-DghqGd0Q.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-notification-navigation-DQ0ePGDe.js
var import_jsx_runtime = require_jsx_runtime();
function parseNotificationDate(value) {
	if (!value) return null;
	const date = parseISO(value);
	return Number.isNaN(date.getTime()) ? null : date;
}
function getNotificationTimeGroup(createdAt) {
	const date = parseNotificationDate(createdAt);
	if (!date) return "earlier";
	if (isToday(date)) return "today";
	if (isYesterday(date)) return "yesterday";
	return "earlier";
}
var GROUP_LABELS = {
	today: "Today",
	yesterday: "Yesterday",
	earlier: "Earlier"
};
function groupNotificationsByDate(notifications) {
	const buckets = {
		today: [],
		yesterday: [],
		earlier: []
	};
	for (const notification of notifications) buckets[getNotificationTimeGroup(notification.createdAt)].push(notification);
	return [
		"today",
		"yesterday",
		"earlier"
	].flatMap((key) => buckets[key].length > 0 ? [{
		key,
		label: GROUP_LABELS[key],
		items: buckets[key]
	}] : []);
}
function formatNotificationTimestamp(createdAt) {
	const date = parseNotificationDate(createdAt);
	if (!date) return "Just now";
	if (isToday(date)) return format(date, "h:mm a");
	if (isYesterday(date)) return `Yesterday ${format(date, "h:mm a")}`;
	return format(date, "MMM d, h:mm a");
}
var CATEGORY_CHIP_LABEL = {
	tasks: "Task",
	collaboration: "Chat",
	ads: "Ads",
	digest: "Digest",
	projects: "Project",
	meetings: "Meeting"
};
var CATEGORY_ACCENT = {
	tasks: "border-l-primary bg-primary/[0.04]",
	collaboration: "border-l-info bg-info/[0.05]",
	ads: "border-l-warning bg-warning/[0.06]",
	digest: "border-l-muted-foreground bg-muted/20",
	projects: "border-l-primary/70 bg-primary/[0.03]",
	meetings: "border-l-info/80 bg-info/[0.04]"
};
var CATEGORY_BADGE = {
	tasks: "border-primary/20 bg-primary/10 text-primary",
	collaboration: "border-info/25 bg-info/10 text-info",
	ads: "border-warning/30 bg-warning/10 text-warning-foreground",
	digest: "border-border bg-muted text-muted-foreground",
	projects: "border-primary/15 bg-primary/8 text-primary",
	meetings: "border-info/20 bg-info/10 text-info"
};
function getInitials(name) {
	if (!name?.trim()) return "?";
	const parts = name.trim().split(/\s+/).filter((part) => part.length > 0);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return (parts[0] ?? "").slice(0, 2).toUpperCase();
	const first = parts[0] ?? "";
	const second = parts[1] ?? "";
	return `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase();
}
function NotificationItem({ notification, compact = false, selected = false, ackInFlight = false, onOpen, onDismiss, onMarkRead, onSelectToggle }) {
	const category = kindToCategory(notification.kind);
	const chipLabel = CATEGORY_CHIP_LABEL[category] ?? "Update";
	const accentClass = CATEGORY_ACCENT[category] ?? "border-l-border bg-muted/15";
	const badgeClass = CATEGORY_BADGE[category] ?? "border-border bg-muted text-muted-foreground";
	const onOpenNotification = () => {
		onOpen?.(notification);
	};
	const handleDismiss = (event) => {
		event.stopPropagation();
		onDismiss?.(notification.id, notification.title);
	};
	const handleMarkRead = (event) => {
		event.stopPropagation();
		onMarkRead?.(notification.id, notification.title);
	};
	const handleSelectChange = () => {
		onSelectToggle?.(notification.id);
	};
	const handleSelectClick = (event) => {
		event.stopPropagation();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onOpenNotification,
		className: cn("group relative flex w-full cursor-pointer gap-3 border-b border-border/50 border-l-[3px] text-left transition-[background-color,box-shadow]", listItemEnterClass, accentClass, compact ? "px-3.5 py-3" : "rounded-lg border p-4", !notification.read && "shadow-sm", selected && "ring-2 ring-primary/25 ring-inset", "hover:bg-muted/35"),
		children: [
			onSelectToggle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "checkbox",
				checked: selected,
				className: "mt-1 size-4 shrink-0 accent-primary",
				onChange: handleSelectChange,
				onClick: handleSelectClick,
				"aria-label": `Select ${notification.title}`
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
				className: cn("shrink-0 ring-1 ring-border/40", compact ? "size-9" : "size-10"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
					className: "bg-muted/40 text-xs font-semibold",
					children: getInitials(notification.actor.name)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start gap-1.5 pr-14",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("font-medium leading-snug text-foreground", compact ? "text-sm" : "text-[15px]"),
							children: notification.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: cn("h-5 shrink-0 px-1.5 text-[10px] font-semibold uppercase tracking-wide", badgeClass),
							children: chipLabel
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("line-clamp-2 leading-relaxed text-muted-foreground", compact ? "text-xs" : "text-sm"),
						children: notification.body
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] tabular-nums text-muted-foreground/80",
						children: [formatNotificationTimestamp(notification.createdAt), notification.actor.name ? ` · ${notification.actor.name}` : ""]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-2 top-2 flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
				children: [!notification.read && onMarkRead ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon",
					className: "size-7 rounded-md bg-background/80 shadow-sm",
					disabled: ackInFlight,
					onClick: handleMarkRead,
					"aria-label": "Mark as read",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" })
				}) : null, onDismiss ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon",
					className: "size-7 rounded-md bg-background/80 text-muted-foreground shadow-sm hover:text-destructive",
					disabled: ackInFlight,
					onClick: handleDismiss,
					"aria-label": "Dismiss notification",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
				}) : null]
			})
		]
	});
}
function NotificationEmptyState({ filterLabel, className }) {
	const title = filterLabel ? `No ${filterLabel} notifications` : "You’re all caught up";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col items-center justify-center gap-4 px-6 py-14 text-center", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-12 items-center justify-center rounded-xl border border-border/60 bg-muted/25 text-muted-foreground shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, {
					className: "size-6",
					"aria-hidden": true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-base font-medium text-foreground",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-sm text-sm text-muted-foreground",
					children: "When something needs your attention, it will show up here and in the bell menu."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "sm",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
					href: "/settings?tab=notifications",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
						className: "mr-2 size-4",
						"aria-hidden": true
					}), "Notification settings"]
				})
			})
		]
	});
}
function useNotificationNavigation(onNavigate) {
	const { push } = useRouter$1();
	return (notification) => {
		const target = typeof notification.navigationUrl === "string" ? notification.navigationUrl : null;
		if (!target) return;
		onNavigate?.();
		if (target.startsWith("/")) {
			push(target);
			return;
		}
		if (typeof window !== "undefined") window.location.assign(target);
	};
}
//#endregion
export { useNotificationNavigation as i, NotificationItem as n, groupNotificationsByDate as r, NotificationEmptyState as t };
