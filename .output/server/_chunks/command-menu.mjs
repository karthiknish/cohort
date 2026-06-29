import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { An as FileText, G as Settings, Jr as Activity, P as SquareCheckBig, Rt as MessageSquare, Sr as ChartColumn, Ut as Megaphone, W as Share2, Y as Search, jr as Briefcase, l as Video, lt as Plus, mn as House, on as Keyboard, rr as CircleQuestionMark, u as Users } from "../_libs/lucide-react.mjs";
import { i as useRouter } from "./navigation.mjs";
import { i as useAuth, n as useClientContext } from "./client-context.mjs";
import { I as projectsApi, U as proposalsApi, q as tasksApi, y as clientsApi } from "./convex-api.mjs";
import { l as capabilityForHref, n as useKeyboardShortcut, s as can, t as KeyboardShortcutBadge } from "./use-keyboard-shortcuts.mjs";
import { a as CommandInput, c as CommandSeparator, i as CommandGroup, l as CommandShortcut, n as CommandDialog, o as CommandItem, r as CommandEmpty, s as CommandList } from "./command.mjs";
//#region src/shared/layout/navigation/command-menu-types.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var COMMAND_MENU_STATUS_ID = "command-menu-status";
function includesQuery(value, query) {
	return typeof value === "string" && value.toLowerCase().includes(query);
}
function limitResults(items, limit = 4) {
	return items.slice(0, limit);
}
function itemAllowed(userRole, capability, href) {
	const resolved = capability ?? (href ? capabilityForHref(href) : null);
	if (!resolved) return true;
	return can(userRole, resolved);
}
//#endregion
//#region src/shared/layout/navigation/command-menu-items.tsx
var import_jsx_runtime = require_jsx_runtime();
function CommandMenuRouteItem({ description, href, icon: Icon, label, onNavigate }) {
	const handleSelect = () => {
		onNavigate(href);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
		onSelect: handleSelect,
		className: "gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: "size-4 shrink-0",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 truncate",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 max-w-[45%] truncate text-xs text-muted-foreground",
				children: description
			})
		]
	});
}
function CommandMenuActionItem({ children, icon: Icon, label, onSelect }) {
	const handleSelect = () => {
		onSelect();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
		onSelect: handleSelect,
		className: "gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: "size-4 shrink-0",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1",
				children: label
			}),
			children
		]
	});
}
//#endregion
//#region src/shared/layout/navigation/command-menu-sections.tsx
function CommandMenuTriggerButtons({ open, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		id: "tour-command-menu-mobile",
		onClick: onOpen,
		className: "inline-flex sm:hidden items-center justify-center rounded-md border border-input bg-background p-2 text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground",
		"aria-label": "Open quick navigation",
		"aria-expanded": open,
		"aria-haspopup": "dialog",
		type: "button",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
			className: "size-4 shrink-0",
			"aria-hidden": true
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		id: "tour-command-menu",
		onClick: onOpen,
		type: "button",
		"aria-label": "Search and quick navigation",
		"aria-expanded": open,
		"aria-haspopup": "dialog",
		className: "hidden sm:inline-flex w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
				className: "size-4 shrink-0",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex-1 text-left truncate",
				children: "Quick navigation…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardShortcutBadge, { combo: "mod+k" })
		]
	})] });
}
function CommandMenuDialog({ open, query, searchStatusMessage, isSearchLoading, groupedSearchResults, quickActionItems, navigationItems, onOpenChange, onQueryChange, onNavigate, onSettingsSelect, onHelpSelect, onKeyboardShortcutsSelect, showHelp }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandDialog, {
		open,
		onOpenChange,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("output", {
				id: COMMAND_MENU_STATUS_ID,
				className: "sr-only",
				"aria-live": "polite",
				"aria-atomic": "true",
				children: searchStatusMessage
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, {
				placeholder: "Search pages, actions, clients, tasks, projects, or proposals…",
				value: query,
				onValueChange: onQueryChange,
				"aria-label": "Search pages, actions, clients, tasks, projects, or proposals",
				"aria-describedby": COMMAND_MENU_STATUS_ID
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, {
				"aria-busy": isSearchLoading,
				"aria-label": "Quick navigation results",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "No results found." }),
					Object.entries(groupedSearchResults).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [Object.entries(groupedSearchResults).map(([group, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
						heading: group,
						children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandMenuRouteItem, {
							description: item.description,
							href: item.href,
							icon: item.icon,
							label: item.label,
							onNavigate
						}, item.id))
					}, group)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
						heading: "Quick Actions",
						children: quickActionItems.map((item) => {
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandMenuRouteItem, {
								description: item.description,
								href: item.action,
								icon: Icon,
								label: item.name,
								onNavigate
							}, item.name);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
						heading: "Navigation",
						children: navigationItems.map((item) => {
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandMenuRouteItem, {
								description: item.description,
								href: item.href,
								icon: Icon,
								label: item.name,
								onNavigate
							}, item.name);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandGroup, {
						heading: "Help",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandMenuActionItem, {
								icon: Settings,
								label: "Settings",
								onSelect: onSettingsSelect
							}),
							showHelp && onHelpSelect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandMenuActionItem, {
								icon: CircleQuestionMark,
								label: "Help & Shortcuts",
								onSelect: onHelpSelect,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandShortcut, { children: "?" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandMenuActionItem, {
								icon: Keyboard,
								label: "Keyboard shortcuts",
								onSelect: onKeyboardShortcutsSelect,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandShortcut, { children: "?" })
							})
						]
					})
				]
			})
		]
	});
}
//#endregion
//#region src/shared/layout/navigation/command-menu-data.ts
var navigationItemDefs = [
	{
		name: "Dashboard",
		href: "/dashboard",
		icon: House,
		description: "Overview and stats"
	},
	{
		name: "Clients",
		href: "/admin/clients",
		icon: Users,
		description: "Manage client workspaces",
		capability: "admin.directory"
	},
	{
		name: "For You",
		href: "/for-you",
		icon: Activity,
		description: "Personalized activity feed"
	},
	{
		name: "Analytics",
		href: "/dashboard/analytics",
		icon: ChartColumn,
		description: "Performance insights",
		capability: "analytics.view"
	},
	{
		name: "Ads",
		href: "/dashboard/ads",
		icon: Megaphone,
		description: "Ad platform integrations",
		capability: "agency.ads"
	},
	{
		name: "Socials",
		href: "/dashboard/socials",
		icon: Share2,
		description: "Meta social insights & AI suggestions",
		capability: "agency.socials"
	},
	{
		name: "Meetings",
		href: "/dashboard/meetings",
		icon: Video,
		description: "Schedule and run meetings"
	},
	{
		name: "Tasks",
		href: "/dashboard/tasks",
		icon: SquareCheckBig,
		description: "Task management"
	},
	{
		name: "Proposals",
		href: "/dashboard/proposals",
		icon: FileText,
		description: "View shared proposals and decks",
		capability: "proposals.view"
	},
	{
		name: "Collaboration",
		href: "/dashboard/collaboration",
		icon: MessageSquare,
		description: "Team chat"
	},
	{
		name: "Projects",
		href: "/dashboard/projects",
		icon: Briefcase,
		description: "Project management"
	}
];
var quickActions = [
	{
		name: "Create proposal",
		action: "/dashboard/proposals",
		icon: Plus,
		description: "Generate new proposal",
		capability: "proposals.manage"
	},
	{
		name: "Add task",
		action: "/dashboard/tasks?action=create",
		icon: Plus,
		description: "Create a new task"
	},
	{
		name: "Open projects",
		action: "/dashboard/projects",
		icon: Plus,
		description: "Jump to active projects"
	}
];
function getNavigationItemsForUserRole(userRole) {
	return navigationItemDefs.filter((item) => itemAllowed(userRole, item.capability, item.href));
}
function getQuickActionsForUserRole(userRole) {
	return quickActions.filter((item) => itemAllowed(userRole, item.capability, item.action));
}
//#endregion
//#region src/shared/layout/navigation/use-command-menu.ts
function useCommandMenu({ onOpenHelp, onOpenShortcuts }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const { push } = useRouter();
	const { user, authPhase } = useAuth();
	const { selectedClientId } = useClientContext();
	const workspaceId = user?.agencyId ?? null;
	const navigationItems = getNavigationItemsForUserRole(user?.role ?? null);
	const quickActionItems = getQuickActionsForUserRole(user?.role ?? null);
	const [query, setQuery] = (0, import_react.useState)("");
	const canQueryWorkspace = authPhase === "ready_active" && Boolean(workspaceId);
	const clientRows = useQuery(clientsApi.list, canQueryWorkspace ? {
		workspaceId,
		limit: 100,
		includeAllWorkspaces: user?.role === "admin"
	} : "skip");
	const taskRows = useQuery(selectedClientId ? tasksApi.listByClient : tasksApi.listForUser, canQueryWorkspace ? selectedClientId ? {
		workspaceId,
		clientId: selectedClientId,
		limit: 100
	} : user?.id ? {
		workspaceId,
		userId: user.id
	} : "skip" : "skip");
	const projectRows = useQuery(projectsApi.list, canQueryWorkspace ? {
		workspaceId,
		clientId: selectedClientId ?? void 0,
		limit: 100
	} : "skip");
	const proposalRows = useQuery(proposalsApi.list, canQueryWorkspace && selectedClientId ? {
		workspaceId,
		clientId: selectedClientId,
		limit: 100
	} : "skip");
	const normalizedQuery = query.trim().toLowerCase();
	const searchResults = (() => {
		if (normalizedQuery.length < 2) return [];
		const clientResults = limitResults((Array.isArray(clientRows) ? clientRows : []).flatMap((client) => includesQuery(client.name, normalizedQuery) ? [{
			id: `client-${client.legacyId}`,
			href: "/admin/clients",
			label: client.name,
			description: "Client workspace",
			icon: Users,
			group: "Clients"
		}] : []));
		const taskResults = limitResults((Array.isArray(taskRows) ? taskRows : []).flatMap((task) => includesQuery(task.title, normalizedQuery) || includesQuery(task.projectName, normalizedQuery) ? [{
			id: `task-${task.legacyId}`,
			href: task.projectName ? `/dashboard/tasks?projectName=${encodeURIComponent(task.projectName)}` : "/dashboard/tasks",
			label: task.title,
			description: task.projectName || task.status || "Task",
			icon: SquareCheckBig,
			group: "Tasks"
		}] : []));
		const projectResults = limitResults((Array.isArray(projectRows) ? projectRows : []).flatMap((project) => includesQuery(project.name, normalizedQuery) ? [{
			id: `project-${project.legacyId}`,
			href: `/dashboard/projects?projectId=${encodeURIComponent(project.legacyId)}&projectName=${encodeURIComponent(project.name)}`,
			label: project.name,
			description: project.status || "Project",
			icon: Briefcase,
			group: "Projects"
		}] : []));
		const proposalResults = limitResults((Array.isArray(proposalRows) ? proposalRows : []).flatMap((proposal) => includesQuery(proposal.clientName, normalizedQuery) || includesQuery(proposal.legacyId, normalizedQuery) ? [{
			id: `proposal-${proposal.legacyId}`,
			href: `/dashboard/proposals/${encodeURIComponent(proposal.legacyId)}/deck`,
			label: proposal.clientName || "Proposal deck",
			description: proposal.status || proposal.legacyId,
			icon: FileText,
			group: "Proposals"
		}] : []));
		return [
			...clientResults,
			...taskResults,
			...projectResults,
			...proposalResults
		];
	})();
	const groupedSearchResults = searchResults.reduce((accumulator, result) => {
		if (!accumulator[result.group]) accumulator[result.group] = [];
		accumulator[result.group].push(result);
		return accumulator;
	}, {});
	const isSearchLoading = (() => {
		if (normalizedQuery.length < 2 || !workspaceId) return false;
		if (clientRows === void 0 || taskRows === void 0 || projectRows === void 0) return true;
		if (selectedClientId && proposalRows === void 0) return true;
		return false;
	})();
	const searchStatusMessage = (() => {
		if (!open) return "";
		if (normalizedQuery.length === 0) return "Type at least 2 characters to search pages, actions, and records.";
		if (normalizedQuery.length === 1) return "Type 1 more character to start searching.";
		if (isSearchLoading) return `Searching for ${query.trim()}.`;
		if (searchResults.length === 0) return `No results found for ${query.trim()}.`;
		const groupCount = Object.keys(groupedSearchResults).length;
		return `${searchResults.length} results found for ${query.trim()} across ${groupCount} sections.`;
	})();
	useKeyboardShortcut({
		combo: "mod+k",
		callback: () => setOpen((prev) => !prev)
	});
	const handleOpen = () => {
		setOpen(true);
	};
	const handleNavigate = (href) => {
		setOpen(false);
		setQuery("");
		push(href);
	};
	const handleSettingsSelect = () => {
		handleNavigate("/settings");
	};
	const handleHelpSelect = () => {
		setOpen(false);
		onOpenHelp?.();
	};
	const handleKeyboardShortcutsSelect = () => {
		setOpen(false);
		onOpenShortcuts?.();
	};
	const handleOpenChange = (nextOpen) => {
		setOpen(nextOpen);
		if (!nextOpen) setQuery("");
	};
	return {
		open,
		query,
		setQuery,
		searchStatusMessage,
		isSearchLoading,
		groupedSearchResults,
		quickActionItems,
		navigationItems,
		handleOpen,
		handleOpenChange,
		handleNavigate,
		handleSettingsSelect,
		handleHelpSelect: onOpenHelp ? handleHelpSelect : void 0,
		handleKeyboardShortcutsSelect,
		showHelp: Boolean(onOpenHelp)
	};
}
//#endregion
//#region src/shared/layout/navigation/command-menu.tsx
function CommandMenu({ onOpenHelp, onOpenShortcuts }) {
	const { open, query, setQuery, searchStatusMessage, isSearchLoading, groupedSearchResults, quickActionItems, navigationItems, handleOpen, handleOpenChange, handleNavigate, handleSettingsSelect, handleHelpSelect, handleKeyboardShortcutsSelect, showHelp } = useCommandMenu({
		onOpenHelp,
		onOpenShortcuts
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandMenuTriggerButtons, {
		open,
		onOpen: handleOpen
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandMenuDialog, {
		open,
		query,
		searchStatusMessage,
		isSearchLoading,
		groupedSearchResults,
		quickActionItems,
		navigationItems,
		onOpenChange: handleOpenChange,
		onQueryChange: setQuery,
		onNavigate: handleNavigate,
		onSettingsSelect: handleSettingsSelect,
		onHelpSelect: handleHelpSelect,
		onKeyboardShortcutsSelect: handleKeyboardShortcutsSelect,
		showHelp
	})] });
}
//#endregion
export { CommandMenu };
