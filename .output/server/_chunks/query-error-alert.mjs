import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { _ as format, i as isYesterday, r as parseISO, s as isToday } from "../_libs/date-fns.mjs";
import { K as Settings2, Lr as BellOff, cr as CircleAlert, gr as Check, w as Trash2 } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils.mjs";
import { u as listItemEnterClass, y as interactiveTransitionClass } from "./motion.mjs";
import { t as Badge } from "./badge.mjs";
import { t as Button } from "./button.mjs";
import { i as useRouter } from "./navigation.mjs";
import { s as kindToCategory } from "./preferences.mjs";
import { t as Link } from "./link.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function AlertTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "alert-title",
		className: cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className),
		...props
	});
}
//#endregion
//#region src/shared/ui/alert-description.tsx
function AlertDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "alert-description",
		className: cn("text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed", className),
		...props
	});
}
//#endregion
//#region src/shared/ui/alert.tsx
var alertVariants = cva(["relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current", interactiveTransitionClass].join(" "), {
	variants: { variant: {
		default: "bg-card text-card-foreground",
		destructive: "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90"
	} },
	defaultVariants: { variant: "default" }
});
function Alert({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "alert",
		role: "alert",
		className: cn(alertVariants({ variant }), className),
		...props
	});
}
//#endregion
//#region src/shared/layout/header-dropdown-theme.ts
/** Shared surfaces for header notification and profile menus. */
var HEADER_DROPDOWN_THEME = {
	triggerIcon: "relative size-9 shrink-0 rounded-lg border border-transparent text-muted-foreground transition-[color,background-color,border-color,box-shadow] hover:border-border/60 hover:bg-muted/40 hover:text-foreground data-[state=open]:border-border/60 data-[state=open]:bg-muted/50 data-[state=open]:text-foreground data-[state=open]:shadow-sm",
	triggerAvatar: "relative size-9 shrink-0 rounded-full border border-border/60 p-0 transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-sm data-[state=open]:border-primary/35 data-[state=open]:ring-2 data-[state=open]:ring-primary/15",
	badge: "absolute -right-0.5 -top-0.5 inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[9px] font-bold leading-none text-destructive-foreground shadow-sm",
	panel: "flex flex-col overflow-hidden rounded-xl border border-border/70 bg-popover p-0 shadow-lg ring-1 ring-border/40",
	panelNotifications: "w-[22rem] gap-1.5 p-2.5 sm:w-[26rem]",
	panelProfile: "w-72",
	header: "shrink-0 rounded-lg border border-border/60 bg-gradient-to-br from-card via-card to-muted/25 px-4 py-3.5",
	headerTitle: "text-sm font-semibold tracking-tight text-foreground",
	headerSubtitle: "text-xs text-muted-foreground",
	footer: "flex shrink-0 items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/15 px-3.5 py-2.5",
	inboxBody: "px-1.5 py-1",
	menuBody: "p-1.5",
	menuItem: "cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm text-popover-foreground focus:bg-muted/80 focus:text-foreground data-[highlighted]:bg-muted/80 data-[highlighted]:text-foreground data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:data-[highlighted]:bg-destructive/10",
	menuItemIcon: "flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/30 text-muted-foreground",
	menuItemIconDestructive: "border-destructive/20 bg-destructive/10 text-destructive",
	menuSeparator: "my-1 bg-border/60",
	profileIdentity: "flex items-center gap-3 px-1 py-0.5",
	profileAvatar: "size-10 shrink-0 ring-2 ring-border/50 ring-offset-2 ring-offset-popover",
	groupLabel: "px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
};
//#endregion
//#region src/features/notifications/lib/group-notifications.ts
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
//#endregion
//#region src/features/notifications/components/notification-item.tsx
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
//#endregion
//#region src/features/notifications/components/notification-empty-state.tsx
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
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
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
//#endregion
//#region src/lib/pagination.ts
function parsePageSize(raw, opts) {
	const parsed = typeof raw === "number" ? raw : Number(raw);
	const value = Number.isFinite(parsed) ? Math.floor(parsed) : opts.defaultValue;
	return Math.min(Math.max(value, 1), Math.max(1, Math.floor(opts.max)));
}
function encodeTimestampIdCursor(time, id) {
	return `${typeof time === "string" ? time : time instanceof Date ? time.toISOString() : time.toDate().toISOString()}|${id}`;
}
function decodeTimestampIdCursor(cursor) {
	if (!cursor) return null;
	const [cursorTime, cursorId] = cursor.split("|");
	if (!cursorTime || !cursorId) return null;
	const date = new Date(cursorTime);
	if (Number.isNaN(date.getTime())) return null;
	return {
		time: date,
		id: cursorId
	};
}
//#endregion
//#region src/features/notifications/hooks/use-notification-navigation.ts
function useNotificationNavigation(onNavigate) {
	const { push } = useRouter();
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
//#region src/shared/ui/query-error-alert.tsx
/** Inline banner for Convex query/load failures. */
function QueryErrorAlert({ error, title = "Unable to load data" }) {
	if (!error) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
		variant: "destructive",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: title }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: error })
		]
	});
}
//#endregion
export { parsePageSize as a, groupNotificationsByDate as c, AlertDescription as d, AlertTitle as f, encodeTimestampIdCursor as i, HEADER_DROPDOWN_THEME as l, useNotificationNavigation as n, NotificationEmptyState as o, decodeTimestampIdCursor as r, NotificationItem as s, QueryErrorAlert as t, Alert as u };
