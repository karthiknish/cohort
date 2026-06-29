import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, c as useConvex, l as useMutation, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { z as getPreviewNotifications } from "./preview-data-CXkRNfsX.mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { s as logError, t as asErrorMessage } from "./convex-errors-sHK0JmZ7.mjs";
import { a as notifyInfo, i as notifyFailure, o as notifySuccess } from "./notifications-DQZKskhM.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { j as notificationsApi } from "./convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { Cn as Funnel, K as Settings2, Rt as MessageSquare, Yt as LoaderCircle, _r as CheckCheck, w as Trash2 } from "../_libs/lucide-react.mjs";
import { t as FadeIn } from "./animate-in-JYv0iBIt.mjs";
import { a as TabsTrigger, i as TabsList, n as Tabs, r as TabsContent } from "./tabs-BP_mm-cH.mjs";
import { i as getButtonClasses, n as PAGE_TITLES, t as DASHBOARD_THEME } from "./dashboard-theme-DM5oBGdY.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./alert-DYeH1Q3p.mjs";
import { t as ScrollArea } from "./scroll-area-DnXuhDTw.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { n as RevealTransition, r as RevealTransitionFallback } from "./page-transition-Ds_W2a1a.mjs";
import { t as useInfiniteQuery } from "../_libs/tanstack__react-query.mjs";
import { t as PageMotionShell } from "./page-motion-shell-Ci2leIYf.mjs";
import { t as useVirtualizer } from "../_libs/@tanstack/react-virtual+[...].mjs";
import { t as DashboardPageHero } from "./dashboard-page-hero-BIWBoJtP.mjs";
import { t as LiveRegion } from "./live-region-BmnQNfB0.mjs";
import { r as parsePageSize } from "./pagination-DHcNSy7D.mjs";
import { t as usePersistedTab } from "./use-persisted-tab-DQyLv5Zj.mjs";
import { i as useNotificationNavigation, n as NotificationItem, t as NotificationEmptyState } from "./use-notification-navigation-DQ0ePGDe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-CzLoK-ay.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FILTER_VALUES = [
	"all",
	"unread",
	"mentions",
	"tasks",
	"collaboration",
	"system"
];
var FILTER_EMPTY_LABELS = {
	unread: "unread",
	mentions: "mention",
	tasks: "task",
	collaboration: "collaboration",
	system: "system"
};
function useNotificationsPage() {
	"use no memo";
	const { user } = useAuth();
	const { selectedClientId } = useClientContext();
	const { isPreviewMode } = usePreview();
	const filterTabs = usePersistedTab({
		param: "tab",
		defaultValue: "all",
		allowedValues: FILTER_VALUES,
		storageNamespace: "dashboard:notifications",
		syncToUrl: true
	});
	const activeFilter = filterTabs.value;
	const setActiveFilter = filterTabs.setValue;
	const [ackInFlight, setAckInFlight] = (0, import_react.useState)(false);
	const [selectedIds, setSelectedIds] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	const [notificationAnnouncement, setNotificationAnnouncement] = (0, import_react.useState)("");
	const handleOpenNotification = useNotificationNavigation();
	const [previewNotificationState, setPreviewNotificationState] = (0, import_react.useState)(null);
	const previewSourceKey = `preview:${selectedClientId ?? "all"}`;
	const basePreviewNotifications = getPreviewNotifications(selectedClientId ?? null);
	const previewNotifications = (() => {
		if (previewNotificationState?.sourceKey === previewSourceKey) return previewNotificationState.notifications;
		return basePreviewNotifications;
	})();
	const convex = useConvex();
	const workspaceId = user?.agencyId;
	const { data: notificationsData, isLoading: isLoadingNotifications, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
		queryKey: [
			"notificationsPage",
			workspaceId,
			user?.role,
			selectedClientId,
			activeFilter
		],
		enabled: !isPreviewMode && Boolean(workspaceId),
		initialPageParam: null,
		maxPages: 10,
		queryFn: async ({ pageParam }) => {
			if (!workspaceId) return {
				notifications: [],
				nextCursor: null
			};
			return convex.query(notificationsApi.list, {
				workspaceId,
				pageSize: parsePageSize(20, {
					defaultValue: 20,
					max: 100
				}),
				role: user?.role ?? void 0,
				clientId: user?.role === "client" ? selectedClientId ?? void 0 : void 0,
				unread: activeFilter === "unread" ? true : void 0,
				afterCreatedAtMs: pageParam?.createdAtMs,
				afterLegacyId: pageParam?.legacyId,
				scanCursor: pageParam?.scanCursor ?? void 0,
				overflowLegacyIds: pageParam?.overflowLegacyIds
			});
		},
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? null
	});
	const refetchNotifications = (0, import_react.useCallback)(() => {
		fetchNextPage();
	}, [fetchNextPage]);
	const liveNotifications = notificationsData?.pages.flatMap((page) => page.notifications ?? []) ?? [];
	const notifications = (() => {
		let items = isPreviewMode ? previewNotifications : liveNotifications;
		if (activeFilter === "mentions") items = items.filter((n) => n.kind === "collaboration.mention" || n.kind === "task.mention");
		else if (activeFilter === "tasks") items = items.filter((n) => n.kind.startsWith("task."));
		else if (activeFilter === "collaboration") items = items.filter((n) => n.kind.startsWith("collaboration."));
		else if (activeFilter === "system") items = items.filter((n) => n.kind === "proposal.deck.ready" || n.kind === "report.generated" || n.kind === "project.created");
		return items;
	})();
	const ackNotifications = useMutation(notificationsApi.ack);
	const loading = isPreviewMode ? false : isLoadingNotifications;
	const loadingMore = isPreviewMode ? false : isFetchingNextPage;
	const error = isPreviewMode ? null : null;
	const nextCursor = isPreviewMode ? false : hasNextPage;
	const updateNotificationStatus = (ids, action, label) => {
		if (isPreviewMode) {
			if (ids.length === 0) return Promise.resolve();
			const announcementLabel = label ?? `${ids.length} notification${ids.length > 1 ? "s" : ""}`;
			setNotificationAnnouncement(action === "dismiss" ? `Dismissing ${announcementLabel}.` : `Marking ${announcementLabel} as read.`);
			setPreviewNotificationState((current) => {
				const currentNotifications = current?.sourceKey === previewSourceKey ? current.notifications : basePreviewNotifications;
				if (action === "dismiss") return {
					sourceKey: previewSourceKey,
					notifications: currentNotifications.filter((notification) => !ids.includes(notification.id))
				};
				return {
					sourceKey: previewSourceKey,
					notifications: currentNotifications.map((notification) => ids.includes(notification.id) ? {
						...notification,
						read: true,
						acknowledged: true
					} : notification)
				};
			});
			notifySuccess({
				title: action === "dismiss" ? "Notifications cleared" : "Marked as read",
				message: `${ids.length} notification${ids.length > 1 ? "s" : ""} ${action === "dismiss" ? "removed" : "updated"} successfully.`
			});
			setNotificationAnnouncement(action === "dismiss" ? `${announcementLabel} dismissed.` : `${announcementLabel} marked as read.`);
			return Promise.resolve();
		}
		if (!workspaceId || ids.length === 0) return Promise.resolve();
		const announcementLabel = label ?? `${ids.length} notification${ids.length > 1 ? "s" : ""}`;
		setNotificationAnnouncement(action === "dismiss" ? `Dismissing ${announcementLabel}.` : `Marking ${announcementLabel} as read.`);
		setAckInFlight(true);
		return ackNotifications({
			workspaceId,
			ids,
			action,
			...user?.role === "client" && selectedClientId ? { clientId: selectedClientId } : {}
		}).then(() => refetchNotifications()).then(() => {
			notifySuccess({
				title: action === "dismiss" ? "Notifications cleared" : "Marked as read",
				message: `${ids.length} notification${ids.length > 1 ? "s" : ""} ${action === "dismiss" ? "removed" : "updated"} successfully.`
			});
			setNotificationAnnouncement(action === "dismiss" ? `${announcementLabel} dismissed.` : `${announcementLabel} marked as read.`);
		}).catch((updateError) => {
			logError(updateError, "Notifications:updateStatus");
			const message = asErrorMessage(updateError);
			notifyFailure({
				title: "Notification error",
				message
			});
			setNotificationAnnouncement(`Could not update ${announcementLabel}. ${message}`);
		}).finally(() => {
			setAckInFlight(false);
		});
	};
	const handleRefresh = () => {
		if (isPreviewMode) {
			setPreviewNotificationState({
				sourceKey: previewSourceKey,
				notifications: basePreviewNotifications
			});
			notifyInfo({
				title: "Preview data refreshed",
				message: "Showing sample notifications."
			});
			return;
		}
		refetchNotifications();
	};
	const handleRetryNotificationsQuery = () => {
		refetchNotifications();
	};
	const handleLoadMore = () => {
		if (isPreviewMode) return;
		if (!hasNextPage || isFetchingNextPage) return;
		fetchNextPage();
	};
	const handleDismiss = (id, title) => {
		updateNotificationStatus([id], "dismiss", title ? `${title} notification` : "notification");
	};
	const handleMarkAsRead = (id, title) => {
		updateNotificationStatus([id], "read", title ? `${title} notification` : "notification");
	};
	const handleMarkAllRead = () => {
		const unreadIds = notifications.flatMap((item) => !item.read ? [item.id] : []);
		if (unreadIds.length === 0) {
			notifySuccess({
				title: "All caught up!",
				message: "You have no unread notifications."
			});
			return;
		}
		updateNotificationStatus(unreadIds, "read", `${unreadIds.length} notifications`);
	};
	const handleActiveFilterChange = (value) => {
		setActiveFilter(value);
	};
	const handleClearAll = () => {
		const allIds = notifications.map((item) => item.id);
		if (allIds.length === 0) {
			notifySuccess({
				title: "Inbox empty",
				message: "There are no notifications to clear."
			});
			return;
		}
		updateNotificationStatus(allIds, "dismiss", `${allIds.length} notifications`);
	};
	const unreadCount = notifications.filter((item) => !item.read).length;
	const handleSelectToggle = (id) => {
		setSelectedIds((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};
	const handleBulkMarkRead = () => {
		const ids = [...selectedIds];
		if (ids.length === 0) return;
		updateNotificationStatus(ids, "read").then(() => setSelectedIds(/* @__PURE__ */ new Set()));
	};
	const handleBulkDismiss = () => {
		const ids = [...selectedIds];
		if (ids.length === 0) return;
		updateNotificationStatus(ids, "dismiss").then(() => setSelectedIds(/* @__PURE__ */ new Set()));
	};
	const notificationScrollRef = (0, import_react.useRef)(null);
	const shouldVirtualizeNotifications = notifications.length > 24;
	const notificationVirtualizer = useVirtualizer({
		count: shouldVirtualizeNotifications ? notifications.length : 0,
		getScrollElement: () => notificationScrollRef.current,
		estimateSize: () => 128,
		overscan: 6
	});
	(0, import_react.useEffect)(() => {
		if (!shouldVirtualizeNotifications) return;
		notificationVirtualizer.measure();
	}, [
		notificationVirtualizer,
		shouldVirtualizeNotifications,
		notifications.length
	]);
	const virtualContainerStyle = { height: notificationVirtualizer.getTotalSize() };
	const handleClearSelection = () => {
		setSelectedIds(/* @__PURE__ */ new Set());
	};
	return {
		activeFilter,
		ackInFlight,
		error,
		handleActiveFilterChange,
		handleBulkDismiss,
		handleBulkMarkRead,
		handleClearAll,
		handleClearSelection,
		handleDismiss,
		handleLoadMore,
		handleMarkAllRead,
		handleMarkAsRead,
		handleOpenNotification,
		handleRefresh,
		handleRetryNotificationsQuery,
		handleSelectToggle,
		isPreviewMode,
		loading,
		loadingMore,
		nextCursor,
		notificationAnnouncement,
		notificationScrollRef,
		notifications,
		notificationVirtualizer,
		selectedIds,
		shouldVirtualizeNotifications,
		unreadCount,
		virtualContainerStyle
	};
}
function NotificationVirtualRow({ start, dataIndex, measureRef, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-index": dataIndex,
		ref: measureRef,
		className: "absolute left-0 top-0 w-full pb-2",
		style: { transform: `translateY(${start}px)` },
		children
	});
}
function NotificationsLoadingSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("output", {
		className: "block space-y-3 py-2",
		"aria-live": "polite",
		"aria-busy": "true",
		"aria-label": "Loading notifications",
		children: [
			"n-sk-1",
			"n-sk-2",
			"n-sk-3",
			"n-sk-4",
			"n-sk-5"
		].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-4 rounded-lg border p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-12 shrink-0 rounded-lg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full max-w-[240px]" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-full max-w-[320px]" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-24" })
				]
			})]
		}, key))
	});
}
function NotificationsPageFallback() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevealTransition, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: DASHBOARD_THEME.layout.container,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "pt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsLoadingSkeleton, {})
		}) })
	}) });
}
function NotificationsPageHeader({ onRefresh, onMarkAllRead, onClearAll, refreshing, unreadCount, notificationsCount, ackInFlight }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardPageHero, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: DASHBOARD_THEME.layout.title,
		children: PAGE_TITLES.notifications?.title ?? "Notifications"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: DASHBOARD_THEME.layout.subtitle,
		children: PAGE_TITLES.notifications?.description ?? "Stay updated on what matters most"
	})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "sm",
				asChild: true,
				className: getButtonClasses("outline"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
					href: "/settings?tab=notifications",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
						className: "mr-2 size-4",
						"aria-hidden": true
					}), "Settings"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: onRefresh,
				disabled: refreshing,
				className: getButtonClasses("outline"),
				children: [refreshing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: cn("mr-2 size-4", DASHBOARD_THEME.animations.spin) }) : null, "Refresh"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: onMarkAllRead,
				disabled: unreadCount === 0 || ackInFlight,
				className: getButtonClasses("outline"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "mr-2 size-4" }), "Mark all read"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: onClearAll,
				disabled: notificationsCount === 0 || ackInFlight,
				className: getButtonClasses("outline"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), "Clear all"]
			})
		]
	})] });
}
function NotificationsPreviewAlert() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Preview mode" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: "Notifications on this page use sample data. Read and dismiss actions update the local preview only." })] });
}
function NotificationsErrorAlert({ error, isPreviewMode, retrying, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
		variant: "destructive",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Failed to load notifications" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
			className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1",
				children: error
			}), !isPreviewMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				size: "sm",
				className: "shrink-0 border-destructive/40",
				onClick: onRetry,
				disabled: retrying,
				children: [retrying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: cn("mr-2 size-4", DASHBOARD_THEME.animations.spin) }) : null, "Try again"]
			}) : null]
		})]
	});
}
function NotificationsFilterTabsList({ activeFilter, notificationsCount, unreadCount }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
		className: "grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
				value: "all",
				className: "relative",
				children: ["All", activeFilter === "all" && notificationsCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "secondary",
					className: "ml-2",
					children: notificationsCount
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
				value: "unread",
				className: "relative",
				children: ["Unread", unreadCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "default",
					className: "ml-2",
					children: unreadCount
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
				value: "mentions",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "mr-2 size-4" }), "Mentions"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
				value: "tasks",
				children: "Tasks"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
				value: "collaboration",
				children: "Chat"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
				value: "system",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, {
					className: "mr-1 size-4",
					"aria-hidden": true
				}), "System"]
			})
		]
	});
}
function getFilterCardTitle(activeFilter) {
	switch (activeFilter) {
		case "all": return "All notifications";
		case "unread": return "Unread notifications";
		case "mentions": return "Mentions";
		case "tasks": return "Task notifications";
		case "collaboration": return "Collaboration notifications";
		case "system": return "System notifications";
		default: return "Notifications";
	}
}
function getFilterCardDescription(activeFilter) {
	switch (activeFilter) {
		case "all": return "Everything that happened in your workspace";
		case "unread": return "Notifications you haven't read yet";
		case "mentions": return "Times you were mentioned in conversations";
		case "tasks": return "Updates on tasks assigned to you or your team";
		case "collaboration": return "Channel messages, threads, and collaboration activity";
		case "system": return "Automated updates about generated proposal decks";
		default: return "";
	}
}
function NotificationsBulkSelectionBar({ selectedCount, ackInFlight, onBulkMarkRead, onBulkDismiss, onClearSelection }) {
	if (selectedCount === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-sm text-muted-foreground",
			children: [selectedCount, " selected"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: onBulkMarkRead,
					disabled: ackInFlight,
					children: "Mark read"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: onBulkDismiss,
					disabled: ackInFlight,
					children: "Dismiss"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: onClearSelection,
					children: "Clear"
				})
			]
		})]
	});
}
function NotificationsFeedList({ page }) {
	const { ackInFlight, activeFilter, error, handleDismiss, handleLoadMore, handleMarkAsRead, handleOpenNotification, handleSelectToggle, loading, loadingMore, nextCursor, notificationScrollRef, notifications, notificationVirtualizer, selectedIds, shouldVirtualizeNotifications, virtualContainerStyle } = page;
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsLoadingSkeleton, {});
	if (notifications.length === 0 && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationEmptyState, { filterLabel: FILTER_EMPTY_LABELS[activeFilter] });
	if (notifications.length === 0) return null;
	if (shouldVirtualizeNotifications) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: notificationScrollRef,
		className: "h-[calc(100vh-24rem)] overflow-y-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative w-full",
			style: virtualContainerStyle,
			children: notificationVirtualizer.getVirtualItems().map((vi) => {
				const notification = notifications[vi.index];
				if (!notification) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationVirtualRow, {
					start: vi.start,
					dataIndex: vi.index,
					measureRef: notificationVirtualizer.measureElement,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationItem, {
						notification,
						ackInFlight,
						selected: selectedIds.has(notification.id),
						onOpen: handleOpenNotification,
						onDismiss: handleDismiss,
						onMarkRead: handleMarkAsRead,
						onSelectToggle: handleSelectToggle
					})
				}, notification.id);
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsFeedFooter, {
		loading,
		loadingMore,
		nextCursor: Boolean(nextCursor),
		notificationsCount: notifications.length,
		onLoadMore: handleLoadMore
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
		className: "h-[calc(100vh-24rem)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: notifications.map((notification) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationItem, {
				notification,
				ackInFlight,
				selected: selectedIds.has(notification.id),
				onOpen: handleOpenNotification,
				onDismiss: handleDismiss,
				onMarkRead: handleMarkAsRead,
				onSelectToggle: handleSelectToggle
			}, notification.id))
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsFeedFooter, {
		loading,
		loadingMore,
		nextCursor: Boolean(nextCursor),
		notificationsCount: notifications.length,
		onLoadMore: handleLoadMore
	})] });
}
function NotificationsFeedFooter({ loading, loadingMore, nextCursor, notificationsCount, onLoadMore }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [!loading && notificationsCount > 0 && nextCursor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 flex justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			onClick: onLoadMore,
			disabled: loadingMore,
			children: [loadingMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : null, "Load more"]
		})
	}) : null, !loading && notificationsCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 text-center text-xs text-muted-foreground",
		children: [
			"Showing ",
			notificationsCount,
			" notification",
			notificationsCount !== 1 ? "s" : ""
		]
	}) : null] });
}
function NotificationsPageContent() {
	const page = useNotificationsPage();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: page.loading,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsLoadingSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: DASHBOARD_THEME.layout.container,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveRegion, { message: page.notificationAnnouncement }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FadeIn, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsPageHeader, {
					onRefresh: page.handleRefresh,
					onMarkAllRead: page.handleMarkAllRead,
					onClearAll: page.handleClearAll,
					refreshing: !page.isPreviewMode && page.loading,
					unreadCount: page.unreadCount,
					notificationsCount: page.notifications.length,
					ackInFlight: page.ackInFlight
				}),
				page.isPreviewMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsPreviewAlert, {}) : null,
				page.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsErrorAlert, {
					error: page.error,
					isPreviewMode: page.isPreviewMode,
					retrying: page.loading,
					onRetry: page.handleRetryNotificationsQuery
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					value: page.activeFilter,
					onValueChange: page.handleActiveFilterChange,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsFilterTabsList, {
						activeFilter: page.activeFilter,
						notificationsCount: page.notifications.length,
						unreadCount: page.unreadCount
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: page.activeFilter,
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsFilterPanel, { page })
					})]
				})
			] })]
		})
	});
}
function NotificationsFilterPanel({ page }) {
	const { activeFilter, selectedIds, unreadCount, notifications } = page;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-lg",
			children: getFilterCardTitle(activeFilter)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: getFilterCardDescription(activeFilter) })] }), unreadCount > 0 && activeFilter !== "unread" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "destructive",
			children: [unreadCount, " unread"]
		}) : null]
	}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsBulkSelectionBar, {
		selectedCount: selectedIds.size,
		ackInFlight: page.ackInFlight,
		onBulkMarkRead: page.handleBulkMarkRead,
		onBulkDismiss: page.handleBulkDismiss,
		onClearSelection: page.handleClearSelection
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsFeedList, { page })] })] });
}
var NOTIFICATIONS_PAGE_FALLBACK = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevealTransitionFallback, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsPageFallback, {}) });
function NotificationsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionShell, {
		reveal: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: NOTIFICATIONS_PAGE_FALLBACK,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsPageContent, {})
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsPage, {});
//#endregion
export { SplitComponent as component };
