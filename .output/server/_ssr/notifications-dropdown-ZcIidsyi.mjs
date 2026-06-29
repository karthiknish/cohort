import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, c as useConvex, l as useMutation, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { c as reportConvexFailure, o as notifySuccess } from "./notifications-DQZKskhM.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { j as notificationsApi } from "./convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { Ir as Bell, K as Settings2, Rn as ExternalLink, Yt as LoaderCircle, gr as Check } from "../_libs/lucide-react.mjs";
import { a as getIconContainerClasses } from "./dashboard-theme-DM5oBGdY.mjs";
import { n as queryErrorFromUnknown, r as useConvexQueryError, t as mergeQueryErrors } from "./use-convex-query-error-P2IX7lhG.mjs";
import { t as ScrollArea } from "./scroll-area-DnXuhDTw.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as useInfiniteQuery } from "../_libs/tanstack__react-query.mjs";
import { l as DropdownMenuTrigger, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-CJEJ0oqe.mjs";
import { t as QueryErrorAlert } from "./query-error-alert-BQQBffRH.mjs";
import { a as useIsMobile, r as DrawerContent, t as Drawer$1 } from "./drawer-Cc1imAWb.mjs";
import { r as parsePageSize } from "./pagination-DHcNSy7D.mjs";
import { t as HEADER_DROPDOWN_THEME } from "./breadcrumbs-j0-fuXNN.mjs";
import { i as useNotificationNavigation, n as NotificationItem, r as groupNotificationsByDate, t as NotificationEmptyState } from "./use-notification-navigation-DQ0ePGDe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-dropdown-ZcIidsyi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NotificationGroupList({ groups, compact = false, selectedIds, ackInFlight, onOpen, onDismiss, onMarkRead, onSelectToggle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col",
		children: groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "flex flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: compact ? "sticky top-0 z-10 border-b border-border/50 bg-popover/95 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm" : "px-1 pb-2 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
				children: group.label
			}), group.items.map((notification) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationItem, {
				notification,
				compact,
				selected: selectedIds?.has(notification.id),
				ackInFlight,
				onOpen,
				onDismiss,
				onMarkRead,
				onSelectToggle
			}, notification.id))]
		}, group.key))
	});
}
function NotificationsInboxPanel({ unreadCount, ackInFlight, isLoadingInitial, notifications, groupedNotifications, hasNextPage, isFetchingNextPage, onMarkAllRead, onLoadMore, onOpen, onDismiss, variant = "dropdown" }) {
	const scrollAreaStyle = { maxHeight: variant === "drawer" ? "min(28rem,calc(85dvh - 11rem))" : "min(22rem,68vh)" };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: HEADER_DROPDOWN_THEME.header,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-start gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn(getIconContainerClasses("medium"), "size-9 shrink-0"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
							className: "size-4",
							"aria-hidden": true
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: HEADER_DROPDOWN_THEME.headerTitle,
							children: "Notifications"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: HEADER_DROPDOWN_THEME.headerSubtitle,
							children: unreadCount > 0 ? `${unreadCount} unread · opens mark items read` : "You're caught up"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					className: "h-8 shrink-0 gap-1 border-border/60 text-xs shadow-sm",
					onClick: onMarkAllRead,
					disabled: unreadCount === 0 || ackInFlight,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						className: "size-3.5",
						"aria-hidden": true
					}), "Mark read"]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "min-h-0 flex-1",
			style: scrollAreaStyle,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: HEADER_DROPDOWN_THEME.inboxBody,
				children: isLoadingInitial ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-center gap-2 px-3 py-12 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-4 animate-spin",
						"aria-hidden": true
					}), "Loading…"]
				}) : notifications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationEmptyState, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationGroupList, {
					groups: groupedNotifications,
					compact: true,
					ackInFlight,
					onOpen,
					onDismiss
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: HEADER_DROPDOWN_THEME.footer,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				className: "h-8 text-xs text-muted-foreground hover:text-foreground",
				onClick: onLoadMore,
				disabled: isFetchingNextPage || !hasNextPage,
				children: [isFetchingNextPage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "mr-1.5 size-3.5 animate-spin",
					"aria-hidden": true
				}) : null, hasNextPage ? "Load more" : "End of list"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					className: "h-8 gap-1 text-xs",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
						href: "/settings?tab=notifications",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
							className: "size-3.5",
							"aria-hidden": true
						}), "Settings"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					className: "h-8 gap-1 text-xs",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
						href: "/dashboard/notifications",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
							className: "size-3.5",
							"aria-hidden": true
						}), "View all"]
					})
				})]
			})]
		})
	] });
}
function useNotificationInbox() {
	const { user } = useAuth();
	const { selectedClientId } = useClientContext();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [ackInFlight, setAckInFlight] = (0, import_react.useState)(false);
	const workspaceId = user?.agencyId;
	const convex = useConvex();
	const handleOpenNotification = useNotificationNavigation(() => setOpen(false));
	const unreadCountQuery = useQuery(notificationsApi.getUnreadCount, workspaceId ? {
		workspaceId,
		role: user?.role ?? void 0,
		clientId: user?.role === "client" ? selectedClientId ?? void 0 : void 0
	} : "skip");
	const unreadCountQueryError = useConvexQueryError({
		data: unreadCountQuery,
		skipped: !workspaceId,
		fallbackMessage: "Unable to load notification count."
	});
	const notificationsInfiniteQuery = useInfiniteQuery({
		queryKey: [
			"notifications",
			workspaceId,
			user?.role,
			selectedClientId
		],
		enabled: Boolean(open && workspaceId),
		initialPageParam: null,
		queryFn: async ({ pageParam }) => {
			if (!workspaceId) return {
				notifications: [],
				nextCursor: null
			};
			return await convex.query(notificationsApi.list, {
				workspaceId,
				pageSize: parsePageSize(20, {
					defaultValue: 20,
					max: 100
				}),
				role: user?.role ?? void 0,
				clientId: user?.role === "client" ? selectedClientId ?? void 0 : void 0,
				afterCreatedAtMs: pageParam?.createdAtMs,
				afterLegacyId: pageParam?.legacyId,
				scanCursor: pageParam?.scanCursor ?? void 0,
				overflowLegacyIds: pageParam?.overflowLegacyIds
			});
		},
		getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null
	});
	const notifications = notificationsInfiniteQuery.data?.pages.flatMap((page) => page.notifications ?? []) ?? [];
	const groupedNotifications = groupNotificationsByDate(notifications);
	const inboxQueryError = mergeQueryErrors(unreadCountQueryError, (() => {
		if (!open || !workspaceId) return null;
		if (!notificationsInfiniteQuery.isError) return null;
		return queryErrorFromUnknown(notificationsInfiniteQuery.error, "Unable to load notifications.");
	})());
	const unreadCount = unreadCountQuery?.unreadCount ?? notifications.filter((item) => !item.read).length;
	const ackNotifications = useMutation(notificationsApi.ack);
	const updateNotificationStatus = (ids, action, options = {}) => {
		if (!workspaceId || ids.length === 0) return Promise.resolve();
		setAckInFlight(true);
		return ackNotifications({
			workspaceId,
			ids,
			action,
			...user?.role === "client" && selectedClientId ? { clientId: selectedClientId } : {}
		}).then(() => notificationsInfiniteQuery.refetch()).then(() => {
			if (!options.silent) notifySuccess({ message: action === "dismiss" ? "Dismissed" : "Marked as read" });
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "useNotificationInbox:ack",
				title: "Update failed",
				fallbackMessage: "Notification update failed"
			});
		}).finally(() => {
			setAckInFlight(false);
		});
	};
	const handleOpenChange = (value) => {
		setOpen(value);
		if (value) notificationsInfiniteQuery.refetch();
	};
	const markUnreadNotificationsRead = (0, import_react.useEffectEvent)((ids) => {
		updateNotificationStatus(ids, "read", { silent: true });
	});
	const unreadNotificationIds = notifications.flatMap((item) => !item.read ? [item.id] : []).join("\0");
	(0, import_react.useEffect)(() => {
		if (!open || ackInFlight) return;
		const unreadIds = unreadNotificationIds.length > 0 ? unreadNotificationIds.split("\0") : [];
		if (unreadIds.length === 0) return;
		const frame = requestAnimationFrame(() => {
			markUnreadNotificationsRead(unreadIds);
		});
		return () => cancelAnimationFrame(frame);
	}, [
		ackInFlight,
		open,
		unreadNotificationIds
	]);
	const handleDismiss = (id) => {
		updateNotificationStatus([id], "dismiss");
	};
	const handleMarkAllRead = () => {
		const unreadIds = notifications.flatMap((item) => !item.read ? [item.id] : []);
		if (unreadIds.length === 0) return;
		updateNotificationStatus(unreadIds, "read");
	};
	const handleLoadMore = () => {
		if (!notificationsInfiniteQuery.hasNextPage || notificationsInfiniteQuery.isFetchingNextPage) return;
		notificationsInfiniteQuery.fetchNextPage();
	};
	const triggerDisabled = !user;
	const isLoadingInitial = notificationsInfiniteQuery.isLoading && notifications.length === 0;
	return {
		open,
		setOpen,
		handleOpenChange,
		handleOpenNotification,
		unreadCount,
		hasUnread: unreadCount > 0,
		ackInFlight,
		isLoadingInitial,
		notifications,
		groupedNotifications,
		triggerDisabled,
		handleDismiss,
		handleMarkAllRead,
		handleLoadMore,
		hasNextPage: notificationsInfiniteQuery.hasNextPage,
		isFetchingNextPage: notificationsInfiniteQuery.isFetchingNextPage,
		inboxQueryError
	};
}
function NotificationsDropdown() {
	const isMobile = useIsMobile();
	const { open, handleOpenChange, handleOpenNotification, unreadCount, hasUnread, ackInFlight, isLoadingInitial, notifications, groupedNotifications, triggerDisabled, handleDismiss, handleMarkAllRead, handleLoadMore, hasNextPage, isFetchingNextPage, inboxQueryError } = useNotificationInbox();
	const handleMobileOpen = () => {
		handleOpenChange(true);
	};
	const inboxPanel = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorAlert, {
		error: inboxQueryError,
		title: "Unable to load notifications"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsInboxPanel, {
		unreadCount,
		ackInFlight,
		isLoadingInitial,
		notifications,
		groupedNotifications,
		hasNextPage,
		isFetchingNextPage,
		onMarkAllRead: handleMarkAllRead,
		onLoadMore: handleLoadMore,
		onOpen: handleOpenNotification,
		onDismiss: handleDismiss,
		variant: isMobile ? "drawer" : "dropdown"
	})] });
	const triggerButton = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "ghost",
		size: "icon",
		className: cn(HEADER_DROPDOWN_THEME.triggerIcon, hasUnread && !open && "text-foreground"),
		disabled: triggerDisabled,
		"aria-label": hasUnread ? `${unreadCount} unread notifications` : "View notifications",
		onClick: isMobile ? handleMobileOpen : void 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: cn("size-[1.125rem]", hasUnread && "motion-safe:animate-pulse") }), hasUnread ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: HEADER_DROPDOWN_THEME.badge,
			"aria-hidden": true,
			children: unreadCount > 9 ? "9+" : unreadCount
		}) : null]
	});
	if (isMobile) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [triggerButton, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
		open,
		onOpenChange: handleOpenChange,
		direction: "bottom",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerContent, {
			className: "flex max-h-[85dvh] flex-col gap-1.5 overflow-hidden rounded-t-2xl p-3",
			children: inboxPanel
		})
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
		open,
		onOpenChange: handleOpenChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: triggerButton
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
			align: "end",
			sideOffset: 10,
			className: cn(HEADER_DROPDOWN_THEME.panel, HEADER_DROPDOWN_THEME.panelNotifications),
			children: inboxPanel
		})]
	});
}
//#endregion
export { NotificationsDropdown };
