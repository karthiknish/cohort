import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, l as useMutation, s as useAction, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { B as getPreviewProjectMilestones, Q as isPreviewModeEnabled, V as getPreviewProjects } from "./preview-data-CXkRNfsX.mjs";
import { c as cn, d as formatDate$1, n as DATE_FORMATS, s as GANTT_SHORT_DATE_FORMATTER } from "./utils-hh4sibN0.mjs";
import { N as isValid, _ as format, r as parseISO } from "../_libs/date-fns.mjs";
import { h as listItemEnterClass, s as clickableCardClass } from "./motion-Cf6ujF0h.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { n as CardContent, t as Card } from "./card-CDBnK3ba.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { s as logError, t as asErrorMessage } from "./convex-errors-sHK0JmZ7.mjs";
import { a as notifyInfo, c as reportConvexFailure, i as notifyFailure, o as notifySuccess, s as notifyWarning } from "./notifications-DQZKskhM.mjs";
import { n as usePathname, r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { D as filesApi, F as projectMilestonesApi, I as projectsApi, L as projectsDocumentImportApi, m as agentApi, q as tasksApi } from "./convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { $t as ListChecks, O as Tag, Rt as MessageSquare, Tn as FolderKanban, Wr as ArrowDown, Xt as List, Y as Search, Yt as LoaderCircle, b as TriangleAlert, cr as CircleAlert, gt as Pencil, i as X, jr as Briefcase, kn as FileUp, lt as Plus, nr as CircleX, or as CircleCheck, qn as Columns3, rn as LayoutGrid, rt as RefreshCw, u as Users, w as Trash2, wr as Calendar, xr as ChartGantt, yn as GripVertical, zn as Ellipsis, zr as ArrowUp } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { a as DialogFooter, c as DialogTrigger, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { t as Label } from "./label-B_FvRq1I.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip-BwcfatA2.mjs";
import { t as ViewTransition } from "./view-transition-DFCVhmkH.mjs";
import { a as SEMANTIC_COLORS } from "./colors-DH3BrJD1.mjs";
import { a as getIconContainerClasses, i as getButtonClasses, n as PAGE_TITLES, t as DASHBOARD_THEME } from "./dashboard-theme-DM5oBGdY.mjs";
import { t as Separator } from "./separator-DGLaDYU_.mjs";
import { t as Checkbox } from "./checkbox-DP7YqpAp.mjs";
import { r as useConvexQueryError } from "./use-convex-query-error-P2IX7lhG.mjs";
import { t as Textarea } from "./textarea-C0M2IvQZ.mjs";
import { n as AlertDescription, t as Alert } from "./alert-DYeH1Q3p.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Be-Tzxcj.mjs";
import { t as ScrollArea } from "./scroll-area-DnXuhDTw.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-BwHc7N7y.mjs";
import { t as Calendar$1 } from "./calendar-9B6zD0Is.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as useDebouncedValue } from "./use-debounce-nytCMJxB.mjs";
import { c as DropdownMenuSeparator, i as DropdownMenuItem, l as DropdownMenuTrigger, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-CJEJ0oqe.mjs";
import { t as ConfirmDialog } from "./confirm-dialog-D0Fe9niR.mjs";
import { t as PageMotionShell } from "./page-motion-shell-Ci2leIYf.mjs";
import { r as useUrlSearchParamsContext } from "./use-url-search-params-CvniTNfQ.mjs";
import { t as DashboardPageHero } from "./dashboard-page-hero-BIWBoJtP.mjs";
import { a as SheetHeader, i as SheetDescription, o as SheetTitle, r as SheetContent, t as Sheet } from "./sheet-Ybc8ZbjG.mjs";
import { f as formatRelativeTime } from "./utils-DWnHfwOl.mjs";
import { n as useKeyboardShortcut, t as KeyboardShortcutBadge } from "./use-keyboard-shortcuts-CjHWs-Qm.mjs";
import { a as getPdfUploadSizeError, l as readFileAsBase64 } from "./agent-attachments-Bv_PBE19.mjs";
import { t as useAccumulatedCursorPages } from "./use-accumulated-cursor-pages-6G2SM2av.mjs";
import { t as v4 } from "../_libs/uuid.mjs";
import { n as FormSheetClose, r as ResponsiveFormSheet, t as DASHBOARD_WORKSPACE_THEME } from "./dashboard-workspace-theme-Ckmkwu5P.mjs";
import { t as LiveRegion } from "./live-region-BmnQNfB0.mjs";
import { n as emitDashboardRefresh, t as PROJECT_STATUSES } from "./refresh-bus-dqOi1W-b.mjs";
import { a as combineExtractedDocumentText, c as prepareTaskImportDocument, i as buildTaskImportFileName, l as uploadTaskImportDocument, o as filterTasksDocumentFiles, r as buildProjectTasksRoute, s as isFileDragEvent, t as SiriOrb } from "./upload-import-document-BMFT4cyE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/projects-DQgnhepy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PROJECTS_VIEW_MODE_STORAGE_KEY = "cohorts_projects_view_mode";
[...PROJECT_STATUSES];
var STATUS_CLASSES = {
	planning: "bg-muted/50 text-muted-foreground border-muted/40",
	active: "bg-success/10 text-success border-success/20",
	on_hold: "bg-warning/10 text-warning border-warning/20",
	completed: "bg-info/10 text-info border-info/20"
};
var STATUS_ACCENT_COLORS = {
	planning: "hsl(var(--muted-foreground))",
	active: "hsl(var(--success))",
	on_hold: "hsl(var(--warning))",
	completed: "hsl(var(--info))"
};
var STATUS_DOT_STYLES = Object.fromEntries(PROJECT_STATUSES.map((status) => [status, { backgroundColor: STATUS_ACCENT_COLORS[status] }]));
var STATUS_ICONS = {
	planning: FolderKanban,
	active: CircleCheck,
	on_hold: TriangleAlert,
	completed: CircleCheck
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
		value: "name",
		label: "Name"
	},
	{
		value: "status",
		label: "Status"
	},
	{
		value: "taskCount",
		label: "Task count"
	}
];
function formatStatusLabel$1(status) {
	if (status === "all") return "All statuses";
	return status.replace("_", " ").split(" ").map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join(" ");
}
function formatTaskSummary(open, total) {
	if (total === 0) return "Create a task or import from a template";
	if (open === 0) return `${total} tasks • all closed`;
	return `${open} of ${total} open`;
}
function formatDate(value) {
	return formatDate$1(value, DATE_FORMATS.SHORT, void 0, "—");
}
function formatDateRange(start, end) {
	const startLabel = formatDate(start);
	const endLabel = formatDate(end);
	if (startLabel === "—" && endLabel === "—") return "Timeline TBA";
	if (startLabel !== "—" && endLabel === "—") return `Started ${startLabel}`;
	if (startLabel === "—" && endLabel !== "—") return `Due ${endLabel}`;
	return `${startLabel} – ${endLabel}`;
}
function loadStoredViewMode() {
	if (typeof window === "undefined") return "list";
	const stored = window.localStorage.getItem(PROJECTS_VIEW_MODE_STORAGE_KEY);
	if (stored === "list" || stored === "grid" || stored === "board" || stored === "gantt") return stored;
	return "list";
}
function mergeProjectTaskCounts(project, counts) {
	const stats = counts[project.id];
	if (!stats) return project;
	return {
		...project,
		taskCount: stats.taskCount,
		openTaskCount: stats.openTaskCount
	};
}
function isProjectOverdue(project) {
	if (project.status === "completed") return false;
	const end = parseDate(project.endDate);
	if (!end) return false;
	const today = /* @__PURE__ */ new Date();
	today.setHours(0, 0, 0, 0);
	return end.getTime() < today.getTime();
}
function projectMatchesContext(project, projectId, projectName) {
	if (!projectId && !projectName) return true;
	const normalizedProjectName = projectName?.trim().toLowerCase() ?? "";
	const matchesId = projectId ? project.id === projectId : false;
	const matchesName = normalizedProjectName ? project.name.trim().toLowerCase() === normalizedProjectName : false;
	return matchesId || matchesName;
}
function parseDate(value) {
	if (!value) return null;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return null;
	return parsed;
}
function addDays(date, days) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}
var SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en", {
	month: "short",
	day: "numeric"
});
function formatShortDate(date) {
	return SHORT_DATE_FORMATTER.format(date);
}
function milestoneStatusColor(status) {
	switch (status) {
		case "completed": return SEMANTIC_COLORS.status.success;
		case "in_progress": return SEMANTIC_COLORS.status.info;
		case "blocked": return SEMANTIC_COLORS.priority.high;
		default: return SEMANTIC_COLORS.status.pending;
	}
}
function computeTimelineRange(projects, milestones) {
	const dates = [];
	projects.forEach((project) => {
		const maybeStart = parseDate(project.startDate);
		const maybeEnd = parseDate(project.endDate);
		if (maybeStart) dates.push(maybeStart);
		if (maybeEnd) dates.push(maybeEnd);
	});
	milestones.forEach((milestone) => {
		const maybeStart = parseDate(milestone.startDate);
		const maybeEnd = parseDate(milestone.endDate);
		if (maybeStart) dates.push(maybeStart);
		if (maybeEnd) dates.push(maybeEnd);
	});
	const today = /* @__PURE__ */ new Date();
	const start = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : today;
	const end = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : addDays(today, 30);
	const paddedStart = addDays(start, -7);
	const paddedEnd = addDays(end, 7);
	if (paddedEnd <= paddedStart) return {
		start: paddedStart,
		end: addDays(paddedStart, 30)
	};
	return {
		start: paddedStart,
		end: paddedEnd
	};
}
var MILESTONE_STATUSES = [
	"planned",
	"in_progress",
	"blocked",
	"completed"
];
function isProjectStatus(value) {
	return typeof value === "string" && PROJECT_STATUSES.includes(value);
}
function isMilestoneStatus(value) {
	return typeof value === "string" && MILESTONE_STATUSES.includes(value);
}
function mapProjectRecord(row) {
	const record = row && typeof row === "object" ? row : null;
	const status = isProjectStatus(record?.status) ? record.status : "planning";
	const tags = Array.isArray(record?.tags) ? record.tags.filter((tag) => typeof tag === "string") : [];
	return {
		id: String(record?.legacyId ?? ""),
		name: String(record?.name ?? ""),
		description: typeof record?.description === "string" ? record.description : null,
		status,
		clientId: typeof record?.clientId === "string" ? record.clientId : null,
		clientName: typeof record?.clientName === "string" ? record.clientName : null,
		startDate: typeof record?.startDateMs === "number" ? new Date(record.startDateMs).toISOString() : null,
		endDate: typeof record?.endDateMs === "number" ? new Date(record.endDateMs).toISOString() : null,
		tags,
		ownerId: typeof record?.ownerId === "string" ? record.ownerId : null,
		createdAt: typeof record?.createdAtMs === "number" ? new Date(record.createdAtMs).toISOString() : null,
		updatedAt: typeof record?.updatedAtMs === "number" ? new Date(record.updatedAtMs).toISOString() : null,
		taskCount: 0,
		openTaskCount: 0,
		recentActivityAt: null,
		deletedAt: typeof record?.deletedAtMs === "number" ? new Date(record.deletedAtMs).toISOString() : null
	};
}
function mapMilestoneRecord(row) {
	const record = row && typeof row === "object" ? row : null;
	return {
		id: String(record?.legacyId ?? ""),
		projectId: String(record?.projectId ?? ""),
		title: String(record?.title ?? ""),
		description: typeof record?.description === "string" ? record.description : null,
		status: isMilestoneStatus(record?.status) ? record.status : "planned",
		startDate: typeof record?.startDateMs === "number" ? new Date(record.startDateMs).toISOString() : null,
		endDate: typeof record?.endDateMs === "number" ? new Date(record.endDateMs).toISOString() : null,
		ownerId: typeof record?.ownerId === "string" ? record.ownerId : null,
		order: typeof record?.order === "number" ? record.order : null,
		createdAt: typeof record?.createdAtMs === "number" ? new Date(record.createdAtMs).toISOString() : null,
		updatedAt: typeof record?.updatedAtMs === "number" ? new Date(record.updatedAtMs).toISOString() : null
	};
}
function sortProjectsByUpdatedAt(projects) {
	return projects.toSorted((left, right) => {
		const leftMs = left.updatedAt ? Date.parse(left.updatedAt) : 0;
		return (right.updatedAt ? Date.parse(right.updatedAt) : 0) - leftMs;
	});
}
function mergeProjectPages(firstPage, olderPages) {
	const byId = /* @__PURE__ */ new Map();
	for (const project of firstPage) byId.set(project.id, project);
	for (const project of olderPages) if (!byId.has(project.id)) byId.set(project.id, project);
	return sortProjectsByUpdatedAt(Array.from(byId.values()));
}
function parsePaginatedProjectsQuery(value) {
	if (!value || typeof value !== "object") return null;
	if (!Array.isArray(value.items)) return null;
	const nextCursor = value.nextCursor;
	const parsedCursor = nextCursor && typeof nextCursor === "object" && typeof nextCursor.fieldValue === "number" && typeof nextCursor.legacyId === "string" ? nextCursor : null;
	return {
		items: value.items,
		nextCursor: parsedCursor
	};
}
function useProjectsData({ workspaceId, userId, isPreviewMode, selectedClientId, statusFilter, debouncedSearchQuery }) {
	const [projects, setProjects] = (0, import_react.useState)([]);
	const [loadCursor, setLoadCursor] = (0, import_react.useState)(null);
	const searchQuery = debouncedSearchQuery.trim();
	const paginationScopeKey = [
		workspaceId ?? "",
		selectedClientId ?? "",
		statusFilter,
		searchQuery,
		isPreviewMode ? "preview" : "live"
	].join("|");
	const queryEnabled = !isPreviewMode && Boolean(workspaceId && userId);
	const listArgs = {
		workspaceId,
		limit: 50,
		cursor: loadCursor,
		clientId: selectedClientId ?? void 0,
		status: statusFilter !== "all" ? statusFilter : void 0,
		searchQuery: searchQuery || void 0
	};
	const projectsRealtime = useQuery(projectsApi.list, queryEnabled ? listArgs : "skip");
	const projectsQueryError = useConvexQueryError({
		data: projectsRealtime,
		skipped: !queryEnabled,
		fallbackMessage: "Unable to load projects."
	});
	const { mergedItems: paginatedProjects, nextCursor: projectsNextCursor, isInitialLoading: projectsInitialLoading, isLoadingMore: projectsLoadingMore, loadMore: loadMoreProjects, reset: resetProjectPagination } = useAccumulatedCursorPages({
		scopeKey: paginationScopeKey,
		queryData: projectsRealtime,
		loadCursor,
		setLoadCursor,
		enabled: queryEnabled,
		getItemKey: (project) => project.id,
		parsePage: (queryData) => {
			const paginated = parsePaginatedProjectsQuery(queryData);
			if (!paginated) return {
				items: [],
				nextCursor: null
			};
			return {
				items: paginated.items.map((row) => mapProjectRecord(row)),
				nextCursor: paginated.nextCursor
			};
		},
		mergePages: mergeProjectPages
	});
	const loadedProjectIds = paginatedProjects.map((project) => project.id);
	const taskCountsRealtime = useQuery(tasksApi.summarizeCountsByProject, queryEnabled && loadedProjectIds.length > 0 ? {
		workspaceId,
		clientId: selectedClientId ?? void 0,
		projectIds: loadedProjectIds
	} : "skip");
	const taskCountsQueryError = useConvexQueryError({
		data: taskCountsRealtime,
		skipped: !queryEnabled || loadedProjectIds.length === 0,
		fallbackMessage: "Unable to load task counts."
	});
	const projectsWithTaskCounts = (() => {
		if (isPreviewMode) {
			let previewProjects = getPreviewProjects(selectedClientId ?? null);
			if (statusFilter !== "all") previewProjects = previewProjects.filter((project) => project.status === statusFilter);
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				previewProjects = previewProjects.filter((project) => project.name.toLowerCase().includes(query) || project.description?.toLowerCase().includes(query) || project.clientName?.toLowerCase().includes(query));
			}
			return previewProjects;
		}
		const counts = taskCountsRealtime && typeof taskCountsRealtime === "object" ? taskCountsRealtime : {};
		return paginatedProjects.map((project) => mergeProjectTaskCounts(project, counts));
	})();
	(0, import_react.useEffect)(() => {
		setProjects(projectsWithTaskCounts);
	}, [projectsWithTaskCounts]);
	const loading = queryEnabled && projectsInitialLoading;
	const loadingMore = projectsLoadingMore;
	const error = projectsQueryError ?? taskCountsQueryError ?? null;
	const handleRefresh = () => {
		resetProjectPagination();
	};
	return {
		projects,
		setProjects,
		loading,
		loadingMore,
		error,
		hasMoreProjects: Boolean(projectsNextCursor),
		handleLoadMore: loadMoreProjects,
		handleRefresh,
		resetPagination: resetProjectPagination
	};
}
function reconcileMilestonePatches(patches, syncedMilestones, projectIds) {
	if (Object.keys(patches).length === 0) return patches;
	const projectIdSet = new Set(projectIds);
	const syncedIdsByProject = /* @__PURE__ */ new Map();
	for (const [projectId, milestones] of Object.entries(syncedMilestones)) syncedIdsByProject.set(projectId, new Set(milestones.map((milestone) => milestone.id)));
	const next = {};
	let changed = false;
	for (const [projectId, pending] of Object.entries(patches)) {
		if (!projectIdSet.has(projectId)) {
			changed = true;
			continue;
		}
		const syncedIds = syncedIdsByProject.get(projectId) ?? /* @__PURE__ */ new Set();
		const unresolved = pending.filter((milestone) => !syncedIds.has(milestone.id));
		if (unresolved.length > 0) next[projectId] = unresolved;
		if (unresolved.length !== pending.length) changed = true;
	}
	return changed ? next : patches;
}
function useProjectsMilestones({ workspaceId, userId, isPreviewMode, selectedClientId, viewMode, projects }) {
	const [milestonePatches, setMilestonePatches] = (0, import_react.useState)({});
	const [milestonesRefreshKey, setMilestonesRefreshKey] = (0, import_react.useState)(0);
	const projectIds = projects.map((project) => project.id);
	const milestonesQueryEnabled = !isPreviewMode && viewMode === "gantt" && Boolean(workspaceId && userId);
	const patchScopeKey = `${viewMode}:${selectedClientId ?? ""}:${projectIds.join(",")}`;
	const milestonesRealtime = useQuery(projectMilestonesApi.listByProjectIds, milestonesQueryEnabled && projectIds.length > 0 ? {
		workspaceId,
		projectIds,
		refreshKey: milestonesRefreshKey
	} : "skip");
	const milestonesQueryError = useConvexQueryError({
		data: milestonesRealtime,
		skipped: !milestonesQueryEnabled,
		fallbackMessage: "Unable to load milestones."
	});
	const syncedMilestones = (() => {
		if (viewMode !== "gantt") return {};
		if (isPreviewMode) return getPreviewProjectMilestones(selectedClientId ?? null, projectIds);
		if (!milestonesRealtime || typeof milestonesRealtime !== "object") return {};
		const mapped = {};
		const projectIdSet = new Set(projectIds);
		for (const [projectId, rows] of Object.entries(milestonesRealtime)) {
			if (projectIdSet.size > 0 && !projectIdSet.has(projectId)) continue;
			mapped[projectId] = (Array.isArray(rows) ? rows : []).map(mapMilestoneRecord);
		}
		return mapped;
	})();
	(0, import_react.useEffect)(() => {
		setMilestonePatches({});
	}, [patchScopeKey]);
	(0, import_react.useEffect)(() => {
		setMilestonePatches((previous) => reconcileMilestonePatches(previous, syncedMilestones, projectIds));
	}, [projectIds, syncedMilestones]);
	const milestonesByProject = (() => {
		if (viewMode !== "gantt") return {};
		const merged = { ...syncedMilestones };
		for (const [projectId, extras] of Object.entries(milestonePatches)) {
			const syncedIds = new Set((merged[projectId] ?? []).map((milestone) => milestone.id));
			const pending = extras.filter((milestone) => !syncedIds.has(milestone.id));
			if (pending.length > 0) merged[projectId] = [...merged[projectId] ?? [], ...pending];
		}
		return merged;
	})();
	const milestonesLoading = viewMode === "gantt" && milestonesQueryEnabled && milestonesRealtime === void 0;
	const milestonesError = viewMode === "gantt" ? milestonesQueryError : null;
	const loadMilestones = async (_targetProjectIds) => {
		if (viewMode !== "gantt") return;
		setMilestonePatches({});
		if (!isPreviewMode) setMilestonesRefreshKey((previous) => previous + 1);
	};
	const handleMilestoneCreated = (milestone) => {
		setMilestonePatches((previous) => {
			const existing = previous[milestone.projectId] ?? [];
			if (existing.some((entry) => entry.id === milestone.id)) return previous;
			return {
				...previous,
				[milestone.projectId]: [...existing, milestone]
			};
		});
	};
	return {
		milestonesByProject,
		milestonesLoading,
		milestonesError,
		loadMilestones,
		handleMilestoneCreated
	};
}
function useProjectsMutations({ workspaceId, userId, isPreviewMode, setProjects }) {
	const softDeleteProject = useMutation(projectsApi.softDelete);
	const updateProject = useMutation(projectsApi.update);
	const [deleteDialogOpen, setDeleteDialogOpen] = (0, import_react.useState)(false);
	const [projectToDelete, setProjectToDelete] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const [editDialogOpen, setEditDialogOpen] = (0, import_react.useState)(false);
	const [projectToEdit, setProjectToEdit] = (0, import_react.useState)(null);
	const [pendingStatusUpdates, setPendingStatusUpdates] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const handleProjectCreated = (project) => {
		setProjects((previous) => [project, ...previous]);
	};
	const handleProjectUpdated = (updatedProject) => {
		setProjects((previous) => previous.map((project) => project.id === updatedProject.id ? updatedProject : project));
	};
	const openEditDialog = (project) => {
		setProjectToEdit(project);
		setEditDialogOpen(true);
	};
	const openDeleteDialog = (project) => {
		setProjectToDelete(project);
		setDeleteDialogOpen(true);
	};
	const handleDeleteProject = async () => {
		if (!projectToDelete) return;
		if (isPreviewMode) {
			notifyInfo({
				title: "Preview mode",
				message: "Changes are not saved in preview mode. Exit preview to make real changes."
			});
			setDeleteDialogOpen(false);
			setProjectToDelete(null);
			return;
		}
		if (!userId || !workspaceId) return;
		setDeleting(true);
		try {
			await softDeleteProject({
				workspaceId,
				legacyId: projectToDelete.id,
				deletedAtMs: Date.now()
			});
			setProjects((previous) => previous.filter((project) => project.id !== projectToDelete.id));
			emitDashboardRefresh({
				reason: "project-mutated",
				clientId: projectToDelete.clientId ?? null
			});
			notifySuccess({
				title: "Project deleted",
				message: `"${projectToDelete.name}" has been permanently removed.`
			});
		} catch (mutationError) {
			reportConvexFailure({
				error: mutationError,
				context: "use-projects-mutations:handleDeleteProject",
				title: "Deletion failed",
				fallbackMessage: "Deletion failed"
			});
		} finally {
			setDeleting(false);
			setDeleteDialogOpen(false);
			setProjectToDelete(null);
		}
	};
	const handleUpdateStatus = async (project, newStatus) => {
		if (isPreviewMode) {
			setProjects((previous) => previous.map((current) => current.id === project.id ? {
				...current,
				status: newStatus
			} : current));
			notifyInfo({
				title: "Preview mode",
				message: `Status changed to ${formatStatusLabel$1(newStatus)} (not saved).`
			});
			return;
		}
		if (!userId || !workspaceId) return;
		if (pendingStatusUpdates.has(project.id)) return;
		const previousStatus = project.status;
		setPendingStatusUpdates((previous) => new Set(previous).add(project.id));
		setProjects((previous) => previous.map((current) => current.id === project.id ? {
			...current,
			status: newStatus
		} : current));
		try {
			await updateProject({
				workspaceId,
				legacyId: project.id,
				status: newStatus,
				updatedAtMs: Date.now()
			});
			emitDashboardRefresh({
				reason: "project-mutated",
				clientId: project.clientId ?? null
			});
			notifySuccess({
				title: "Status updated",
				message: `"${project.name}" is now ${formatStatusLabel$1(newStatus)}.`
			});
		} catch (mutationError) {
			setProjects((previous) => previous.map((current) => current.id === project.id ? {
				...current,
				status: previousStatus
			} : current));
			reportConvexFailure({
				error: mutationError,
				context: "use-projects-mutations:handleUpdateStatus",
				title: "Status update failed",
				fallbackMessage: "Status update failed"
			});
		} finally {
			setPendingStatusUpdates((previous) => {
				const next = new Set(previous);
				next.delete(project.id);
				return next;
			});
		}
	};
	return {
		deleteDialogOpen,
		setDeleteDialogOpen,
		projectToDelete,
		deleting,
		editDialogOpen,
		setEditDialogOpen,
		projectToEdit,
		pendingStatusUpdates,
		handleProjectCreated,
		handleProjectUpdated,
		handleDeleteProject,
		handleUpdateStatus,
		openDeleteDialog,
		openEditDialog
	};
}
function useProjectsPageController() {
	const searchParams = useUrlSearchParamsContext();
	const router = useRouter$1();
	const pathname = usePathname();
	const { user } = useAuth();
	const { selectedClient, selectedClientId } = useClientContext();
	const { isPreviewMode } = usePreview();
	const workspaceId = user?.agencyId ?? null;
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [searchInput, setSearchInput] = (0, import_react.useState)("");
	const [viewMode, setViewModeState] = (0, import_react.useState)(() => loadStoredViewMode());
	const [sortField, setSortField] = (0, import_react.useState)("updatedAt");
	const [sortDirection, setSortDirection] = (0, import_react.useState)("desc");
	const debouncedQuery = useDebouncedValue(searchInput, 350);
	const focusedProject = {
		id: searchParams.get("projectId"),
		name: searchParams.get("projectName")
	};
	const { projects, setProjects, loading, loadingMore, error, hasMoreProjects, handleLoadMore, handleRefresh: resetProjectsPagination } = useProjectsData({
		workspaceId,
		userId: user?.id,
		isPreviewMode,
		selectedClientId,
		statusFilter,
		debouncedSearchQuery: debouncedQuery
	});
	const { milestonesByProject, milestonesLoading, milestonesError, loadMilestones, handleMilestoneCreated } = useProjectsMilestones({
		workspaceId,
		userId: user?.id,
		isPreviewMode,
		selectedClientId,
		viewMode,
		projects
	});
	const mutations = useProjectsMutations({
		workspaceId,
		userId: user?.id,
		isPreviewMode,
		setProjects
	});
	const setViewMode = (mode) => {
		setViewModeState(mode);
		if (typeof window !== "undefined") window.localStorage.setItem(PROJECTS_VIEW_MODE_STORAGE_KEY, mode);
	};
	useKeyboardShortcut({
		combo: "mod+f",
		callback: () => {
			document.getElementById("project-search")?.focus();
		}
	});
	useKeyboardShortcut({
		combo: "mod+shift+n",
		callback: () => {
			document.getElementById("create-project-trigger")?.click();
		}
	});
	const focusedProjects = (() => {
		if (!focusedProject.id && !focusedProject.name) return projects;
		return projects.filter((project) => projectMatchesContext(project, focusedProject.id, focusedProject.name));
	})();
	const sortedProjects = (() => {
		const sorted = [...focusedProjects];
		sorted.sort((left, right) => {
			let comparison = 0;
			switch (sortField) {
				case "name":
					comparison = left.name.localeCompare(right.name);
					break;
				case "status":
					comparison = PROJECT_STATUSES.indexOf(left.status) - PROJECT_STATUSES.indexOf(right.status);
					break;
				case "taskCount":
					comparison = left.taskCount - right.taskCount;
					break;
				case "createdAt":
					comparison = new Date(left.createdAt ?? 0).getTime() - new Date(right.createdAt ?? 0).getTime();
					break;
				default:
					comparison = new Date(left.updatedAt ?? 0).getTime() - new Date(right.updatedAt ?? 0).getTime();
					break;
			}
			return sortDirection === "desc" ? -comparison : comparison;
		});
		return sorted;
	})();
	const statusCounts = projects.reduce((accumulator, project) => {
		accumulator[project.status] = (accumulator[project.status] ?? 0) + 1;
		return accumulator;
	}, {
		planning: 0,
		active: 0,
		on_hold: 0,
		completed: 0
	});
	const openTaskTotal = projects.reduce((total, project) => total + project.openTaskCount, 0);
	const taskTotal = projects.reduce((total, project) => total + project.taskCount, 0);
	const completionRate = (() => {
		if (projects.length === 0) return 0;
		return Math.round(statusCounts.completed / projects.length * 100);
	})();
	const initialLoading = loading && projects.length === 0;
	const hasActiveFilters = statusFilter !== "all" || debouncedQuery.trim().length > 0 || Boolean(focusedProject.id || focusedProject.name);
	const hasVisibleProjects = sortedProjects.length > 0;
	const focusedProjectRecord = projects.find((project) => projectMatchesContext(project, focusedProject.id, focusedProject.name)) ?? null;
	const focusedProjectTasksHref = focusedProjectRecord?.id ? buildProjectTasksRoute({
		projectId: focusedProjectRecord.id,
		projectName: focusedProjectRecord.name,
		clientId: focusedProjectRecord.clientId,
		clientName: focusedProjectRecord.clientName
	}) : focusedProject.id ? buildProjectTasksRoute({
		projectId: focusedProject.id,
		projectName: focusedProject.name
	}) : null;
	const portfolioLabel = selectedClient?.name ? `${selectedClient.name} workspace` : "all workspaces";
	const clearFocusedProject = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("projectId");
		params.delete("projectName");
		const next = params.toString();
		router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
	};
	const toggleSortDirection = () => {
		setSortDirection((previous) => previous === "asc" ? "desc" : "asc");
	};
	const clearAllFilters = () => {
		setSearchInput("");
		setStatusFilter("all");
		setSortField("updatedAt");
		setSortDirection("desc");
		clearFocusedProject();
	};
	const setStatusFilterAndReset = (value) => {
		setStatusFilter(value);
	};
	const activeFilterLabels = (() => {
		const labels = [];
		if (statusFilter !== "all") labels.push(formatStatusLabel$1(statusFilter));
		if (debouncedQuery.trim()) labels.push(`Search: “${debouncedQuery.trim()}”`);
		if (focusedProject.id || focusedProject.name) labels.push("Linked project");
		if (sortField !== "updatedAt" || sortDirection !== "desc") {
			const sortLabel = SORT_OPTIONS.find((option) => option.value === sortField)?.label ?? sortField;
			labels.push(`Sort: ${sortLabel} (${sortDirection === "asc" ? "asc" : "desc"})`);
		}
		return labels;
	})();
	const handleRefreshProjects = () => {
		resetProjectsPagination();
		notifySuccess({
			title: "Projects refreshed",
			message: "Fetching the latest project list."
		});
	};
	return {
		activeFilterLabels,
		clearAllFilters,
		clearFocusedProject,
		completionRate,
		debouncedSearchQuery: debouncedQuery,
		deleteDialogOpen: mutations.deleteDialogOpen,
		deleting: mutations.deleting,
		editDialogOpen: mutations.editDialogOpen,
		error,
		focusedProject,
		focusedProjectRecord,
		focusedProjectTasksHref,
		handleDeleteProject: mutations.handleDeleteProject,
		handleLoadMore,
		handleMilestoneCreated,
		handleProjectCreated: mutations.handleProjectCreated,
		handleProjectUpdated: mutations.handleProjectUpdated,
		handleRefreshProjects,
		handleUpdateStatus: mutations.handleUpdateStatus,
		hasActiveFilters,
		hasMoreProjects,
		hasVisibleProjects,
		initialLoading,
		loadMilestones,
		loading,
		loadingMore,
		milestonesByProject,
		milestonesError,
		milestonesLoading,
		openDeleteDialog: mutations.openDeleteDialog,
		openEditDialog: mutations.openEditDialog,
		openTaskTotal,
		pendingStatusUpdates: mutations.pendingStatusUpdates,
		portfolioLabel,
		projectToDelete: mutations.projectToDelete,
		projectToEdit: mutations.projectToEdit,
		projects,
		searchInput,
		setDeleteDialogOpen: mutations.setDeleteDialogOpen,
		setEditDialogOpen: mutations.setEditDialogOpen,
		setSearchInput,
		setSortField,
		setStatusFilter,
		setStatusFilterAndReset,
		setViewMode,
		sortDirection,
		sortField,
		sortedProjects,
		statusCounts,
		statusFilter,
		taskTotal,
		toggleSortDirection,
		viewMode
	};
}
var ProjectsPageContext = (0, import_react.createContext)(null);
function ProjectsPageProvider({ children }) {
	const controller = useProjectsPageController();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsPageContext.Provider, {
		value: controller,
		children
	});
}
function useProjectsPageContext() {
	const context = (0, import_react.use)(ProjectsPageContext);
	if (!context) throw new Error("useProjectsPageContext must be used within a ProjectsPageProvider");
	return context;
}
/** Projects portfolio surfaces — extends shared dashboard workspace tokens. */
var PROJECTS_THEME = {
	...DASHBOARD_WORKSPACE_THEME,
	summaryStrip: DASHBOARD_WORKSPACE_THEME.summaryStrip,
	workspaceRail: DASHBOARD_WORKSPACE_THEME.workspaceRail,
	toolbar: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
	content: "px-4 pb-4 pt-2",
	segmented: DASHBOARD_WORKSPACE_THEME.segmentedList,
	segmentedItem: DASHBOARD_WORKSPACE_THEME.segmentedButton,
	focusBanner: "rounded-xl border border-primary/15 bg-primary/5 px-4 py-3",
	sheet: {
		content: "flex size-full flex-col border-l border-border/70 bg-card p-0 shadow-xl sm:max-w-lg",
		header: "shrink-0 space-y-1 border-b border-border/60 bg-gradient-to-br from-card via-card to-muted/25 p-5 pr-12",
		body: "flex-1 space-y-5 overflow-y-auto overscroll-y-contain p-5",
		footer: "shrink-0 flex flex-col-reverse gap-2 border-t border-border/60 bg-muted/15 px-5 py-4 sm:flex-row sm:justify-end"
	}
};
var MIN_PROJECT_DATE = /* @__PURE__ */ new Date("1900-01-01");
function ProjectTagChip({ disabled, onRemove, tag }) {
	const handleRemoveClick = () => {
		onRemove(tag);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: "secondary",
		className: "gap-1 pr-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-3" }),
			tag,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: handleRemoveClick,
				className: "ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20",
				disabled,
				"aria-label": `Remove tag ${tag}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
			})
		]
	}, tag);
}
function ProjectDateField$1({ disabled, fieldId, label, onSelect, selected, disabledDate }) {
	const triggerId = `${fieldId}-trigger`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: triggerId,
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				id: triggerId,
				type: "button",
				variant: "outline",
				className: cn("w-full justify-start text-left font-normal", !selected && "text-muted-foreground"),
				disabled,
				"aria-label": `${label} — open calendar`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, {
					className: "mr-2 size-4",
					"aria-hidden": true
				}), selected ? format(selected, "PPP") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pick a date" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			className: "w-auto p-0",
			align: "start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
				mode: "single",
				selected,
				onSelect,
				initialFocus: true,
				disabled: disabledDate
			})
		})] })]
	});
}
function CreateProjectFormFields({ loading, clients, state, nameError = null, nameInputRef, onNameChange, onDescriptionChange, onStatusChange, onClientChange, onStartDateChange, onEndDateChange, onTagInputChange, onTagKeyDown, onAddTag, onRemoveTag, formatStatusLabel }) {
	const handleNameChange = (event) => onNameChange(event.target.value);
	const handleDescriptionChange = (event) => onDescriptionChange(event.target.value);
	const handleStatusChange = (value) => onStatusChange(value);
	const handleTagInputChange = (event) => onTagInputChange(event.target.value);
	const handleStartDateDisabled = (date) => date < MIN_PROJECT_DATE;
	const handleEndDateDisabled = (date) => (state.startDate ? date < state.startDate : false) || date < MIN_PROJECT_DATE;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "project-name",
						children: ["Project name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-destructive",
							children: "*"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						ref: nameInputRef,
						id: "project-name",
						placeholder: "e.g., Q1 Marketing Campaign",
						value: state.name,
						onChange: handleNameChange,
						disabled: loading,
						"aria-invalid": Boolean(nameError),
						"aria-describedby": nameError ? "project-name-error" : void 0
					}),
					nameError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						id: "project-name-error",
						className: "text-xs text-destructive",
						children: nameError
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "project-description",
					children: "Description"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "project-description",
					placeholder: "Brief overview of the project goals and scope…",
					value: state.description,
					onChange: handleDescriptionChange,
					disabled: loading,
					rows: 3
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "project-status",
						children: "Status"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: state.status,
						onValueChange: handleStatusChange,
						disabled: loading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "project-status",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select status" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PROJECT_STATUSES.map((statusValue) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: statusValue,
							children: formatStatusLabel(statusValue)
						}, statusValue)) })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "project-client",
						children: "Client / Workspace"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: state.clientId,
						onValueChange: onClientChange,
						disabled: loading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "project-client",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select client" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "none",
							children: "No client"
						}), clients.map((client) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: client.id,
							children: client.name
						}, client.id))] })]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectDateField$1, {
					disabled: loading,
					fieldId: "project-start-date",
					label: "Start date",
					onSelect: onStartDateChange,
					selected: state.startDate,
					disabledDate: handleStartDateDisabled
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectDateField$1, {
					disabled: loading,
					fieldId: "project-end-date",
					label: "End date",
					onSelect: onEndDateChange,
					selected: state.endDate,
					disabledDate: handleEndDateDisabled
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "project-tags",
						children: "Tags"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "project-tags",
							placeholder: "Add a tag…",
							value: state.tagInput,
							onChange: handleTagInputChange,
							onKeyDown: onTagKeyDown,
							disabled: loading || state.tags.length >= 10
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "icon",
							onClick: onAddTag,
							disabled: loading || !state.tagInput.trim() || state.tags.length >= 10,
							"aria-label": "Add tag",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
						})]
					}),
					state.tags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5 pt-2",
						children: state.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectTagChip, {
							disabled: loading,
							onRemove: onRemoveTag,
							tag
						}, tag))
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [state.tags.length, "/10 tags added. Press Enter or click + to add."]
					})
				]
			})
		]
	});
}
function createInitialFormState(selectedClientId) {
	return {
		name: "",
		description: "",
		status: "planning",
		clientId: selectedClientId ?? "",
		startDate: void 0,
		endDate: void 0,
		tags: [],
		tagInput: ""
	};
}
function projectFormReducer(state, action) {
	switch (action.type) {
		case "reset": return createInitialFormState(action.clientId);
		case "setName": return {
			...state,
			name: action.value
		};
		case "setDescription": return {
			...state,
			description: action.value
		};
		case "setStatus": return {
			...state,
			status: action.value
		};
		case "setClientId": return {
			...state,
			clientId: action.value
		};
		case "setStartDate": return {
			...state,
			startDate: action.value
		};
		case "setEndDate": return {
			...state,
			endDate: action.value
		};
		case "setTagInput": return {
			...state,
			tagInput: action.value
		};
		case "addTag": return {
			...state,
			tags: [...state.tags, action.value],
			tagInput: ""
		};
		case "removeTag": return {
			...state,
			tags: state.tags.filter((tag) => tag !== action.value)
		};
		default: return state;
	}
}
function formatStatusLabel(value) {
	return value.replace("_", " ").split(" ").map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join(" ");
}
function CreateProjectSheet({ onProjectCreated, trigger }) {
	const { user } = useAuth();
	const workspaceId = user?.agencyId ?? null;
	const createProject = useMutation(projectsApi.create);
	const { clients, selectedClientId } = useClientContext();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [nameError, setNameError] = (0, import_react.useState)(null);
	const nameInputRef = (0, import_react.useRef)(null);
	const [formState, dispatch] = (0, import_react.useReducer)(projectFormReducer, selectedClientId, createInitialFormState);
	const resetForm = () => {
		dispatch({
			type: "reset",
			clientId: selectedClientId ?? ""
		});
	};
	const handleOpenChange = (value) => {
		setOpen(value);
		if (value) {
			setNameError(null);
			resetForm();
		}
	};
	const handleAddTag = () => {
		const trimmed = formState.tagInput.trim();
		if (trimmed && !formState.tags.includes(trimmed) && formState.tags.length < 10) dispatch({
			type: "addTag",
			value: trimmed
		});
	};
	const handleRemoveTag = (tag) => {
		dispatch({
			type: "removeTag",
			value: tag
		});
	};
	const handleTagKeyDown = (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			handleAddTag();
		}
	};
	const handleSubmit = (event) => {
		event.preventDefault();
		if (!user?.id || !workspaceId) {
			notifyFailure({
				title: "Authentication required",
				message: "Please sign in to create a project."
			});
			return;
		}
		if (!formState.name.trim()) {
			setNameError("Give your project a name to get started.");
			nameInputRef.current?.focus();
			return;
		}
		setLoading(true);
		const selectedClientData = clients.find((c) => c.id === formState.clientId);
		const payload = {
			name: formState.name.trim(),
			description: formState.description.trim() || void 0,
			status: formState.status,
			clientId: formState.clientId && formState.clientId !== "none" ? formState.clientId : void 0,
			clientName: selectedClientData?.name || void 0,
			startDate: formState.startDate ? format(formState.startDate, "yyyy-MM-dd") : void 0,
			endDate: formState.endDate ? format(formState.endDate, "yyyy-MM-dd") : void 0,
			tags: formState.tags
		};
		const legacyId = v4();
		createProject({
			workspaceId,
			legacyId,
			name: payload.name,
			description: payload.description ?? null,
			status: payload.status,
			clientId: payload.clientId ?? null,
			clientName: payload.clientName ?? null,
			startDateMs: payload.startDate ? new Date(payload.startDate).getTime() : null,
			endDateMs: payload.endDate ? new Date(payload.endDate).getTime() : null,
			tags: payload.tags,
			ownerId: user?.id ?? null
		}).then(() => {
			const nowMs = Date.now();
			const createdProject = {
				id: legacyId,
				name: payload.name,
				description: payload.description ?? null,
				status: payload.status,
				clientId: payload.clientId ?? null,
				clientName: payload.clientName ?? null,
				startDate: payload.startDate ? new Date(payload.startDate).toISOString() : null,
				endDate: payload.endDate ? new Date(payload.endDate).toISOString() : null,
				tags: payload.tags,
				ownerId: user?.id ?? null,
				createdAt: new Date(nowMs).toISOString(),
				updatedAt: new Date(nowMs).toISOString(),
				taskCount: 0,
				openTaskCount: 0,
				recentActivityAt: null,
				deletedAt: null
			};
			notifySuccess({
				title: "Project created!",
				message: `"${createdProject.name}" is ready. Start adding tasks and collaborating.`
			});
			onProjectCreated?.(createdProject);
			emitDashboardRefresh({
				reason: "project-mutated",
				clientId: createdProject.clientId ?? null
			});
			setOpen(false);
			resetForm();
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CreateProjectSheet:handleSubmit",
				title: "Creation failed",
				fallbackMessage: "Creation failed"
			});
		}).finally(() => {
			setLoading(false);
		});
	};
	const handleNameChange = (value) => {
		setNameError(null);
		dispatch({
			type: "setName",
			value
		});
	};
	const handleDescriptionChange = (value) => {
		dispatch({
			type: "setDescription",
			value
		});
	};
	const handleStatusChange = (value) => {
		dispatch({
			type: "setStatus",
			value
		});
	};
	const handleClientChange = (value) => {
		dispatch({
			type: "setClientId",
			value
		});
	};
	const handleStartDateChange = (value) => {
		dispatch({
			type: "setStartDate",
			value
		});
	};
	const handleEndDateChange = (value) => {
		dispatch({
			type: "setEndDate",
			value
		});
	};
	const handleTagInputChange = (value) => {
		dispatch({
			type: "setTagInput",
			value
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveFormSheet, {
		open,
		onOpenChange: handleOpenChange,
		trigger: trigger ?? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			id: "create-project-trigger",
			type: "button",
			className: "gap-2 shadow-sm transition-shadow hover:shadow-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
				className: "size-4",
				"aria-hidden": true
			}), "New project"]
		}),
		contentClassName: PROJECTS_THEME.sheet.content,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex h-full min-h-0 flex-col",
			onSubmit: handleSubmit,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: PROJECTS_THEME.sheet.header,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn(getIconContainerClasses("medium"), "size-10 shrink-0"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, {
								className: "size-5",
								"aria-hidden": true
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold tracking-tight text-foreground",
								children: "Create new project"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Add a new project to track work, tasks, and team collaboration."
							})]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: PROJECTS_THEME.sheet.body,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateProjectFormFields, {
						loading,
						clients,
						state: formState,
						nameError,
						nameInputRef,
						onNameChange: handleNameChange,
						onDescriptionChange: handleDescriptionChange,
						onStatusChange: handleStatusChange,
						onClientChange: handleClientChange,
						onStartDateChange: handleStartDateChange,
						onEndDateChange: handleEndDateChange,
						onTagInputChange: handleTagInputChange,
						onTagKeyDown: handleTagKeyDown,
						onAddTag: handleAddTag,
						onRemoveTag: handleRemoveTag,
						formatStatusLabel
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: PROJECTS_THEME.sheet.footer,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: loading || !formState.name.trim(),
						className: "h-9 min-w-[7.5rem] font-medium",
						children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Create project"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormSheetClose, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							className: "h-9",
							disabled: loading,
							children: "Cancel"
						})
					})]
				})
			]
		})
	});
}
var MINIMUM_PROJECT_DATE = /* @__PURE__ */ new Date("1900-01-01");
function ProjectDateField({ disabled, fieldId, label, onSelect, selected, validationError, disabledDate }) {
	const triggerId = `${fieldId}-trigger`;
	const errorId = `${fieldId}-error`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: triggerId,
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					id: triggerId,
					type: "button",
					variant: "outline",
					className: cn("w-full justify-start text-left font-normal", !selected && "text-muted-foreground", validationError && "border-destructive text-destructive"),
					disabled,
					"aria-invalid": Boolean(validationError),
					"aria-describedby": validationError ? errorId : void 0,
					"aria-label": `${label} — open calendar`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, {
						className: "mr-2 size-4",
						"aria-hidden": true
					}), selected ? format(selected, "PPP") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pick a date" })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
				className: "w-auto p-0",
				align: "start",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
					mode: "single",
					selected,
					onSelect,
					initialFocus: true,
					disabled: disabledDate
				})
			})] }),
			validationError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: errorId,
				className: "text-xs text-destructive",
				children: validationError
			}) : null
		]
	});
}
function ProjectTagBadge({ loading, onRemove, tag }) {
	const handleRemove = () => onRemove(tag);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: "secondary",
		className: "gap-1 pr-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-3" }),
			tag,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: handleRemove,
				className: "ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20",
				disabled: loading,
				"aria-label": `Remove tag ${tag}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
			})
		]
	});
}
function EditProjectFormFields({ loading, name, description, status, clientId, startDate, endDate, tags, tagInput, validationErrors, clients, onDispatch, onAddTag, onRemoveTag, onTagKeyDown, formatStatusLabel }) {
	const handleNameChange = (event) => {
		onDispatch({
			type: "setName",
			value: event.target.value
		});
	};
	const handleDescriptionChange = (event) => {
		onDispatch({
			type: "setDescription",
			value: event.target.value
		});
	};
	const handleStatusChange = (value) => {
		onDispatch({
			type: "setStatus",
			value
		});
	};
	const handleClientChange = (value) => {
		onDispatch({
			type: "setClientId",
			value
		});
	};
	const handleStartDateSelect = (value) => {
		onDispatch({
			type: "setStartDate",
			value
		});
	};
	const handleEndDateSelect = (value) => {
		onDispatch({
			type: "setEndDate",
			value
		});
	};
	const handleTagInputChange = (event) => {
		onDispatch({
			type: "setTagInput",
			value: event.target.value
		});
	};
	const handleAddTagClick = () => {
		onAddTag();
	};
	const handleStartDateDisabled = (date) => date < MINIMUM_PROJECT_DATE;
	const handleEndDateDisabled = (date) => (startDate ? date < startDate : false) || date < MINIMUM_PROJECT_DATE;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "edit-project-name",
						children: ["Project name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-destructive",
							children: "*"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "edit-project-name",
						placeholder: "e.g., Q1 Marketing Campaign",
						value: name,
						onChange: handleNameChange,
						disabled: loading,
						"aria-invalid": !!validationErrors.name,
						"aria-describedby": validationErrors.name ? "name-error" : void 0
					}),
					validationErrors.name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						id: "name-error",
						className: "text-xs text-destructive",
						children: validationErrors.name
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "edit-project-description",
						children: ["Description", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-2 text-xs text-muted-foreground",
							children: [
								"(",
								description.length,
								"/2000)"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "edit-project-description",
						placeholder: "Brief overview of the project goals and scope…",
						value: description,
						onChange: handleDescriptionChange,
						disabled: loading,
						rows: 3,
						"aria-invalid": !!validationErrors.description,
						"aria-describedby": validationErrors.description ? "edit-project-description-error" : void 0
					}),
					validationErrors.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						id: "edit-project-description-error",
						className: "text-xs text-destructive",
						children: validationErrors.description
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "edit-project-status",
						children: "Status"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: status,
						onValueChange: handleStatusChange,
						disabled: loading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "edit-project-status",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select status" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PROJECT_STATUSES.map((optionStatus) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: optionStatus,
							children: formatStatusLabel(optionStatus)
						}, optionStatus)) })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "edit-project-client",
						children: "Client / Workspace"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: clientId,
						onValueChange: handleClientChange,
						disabled: loading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "edit-project-client",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select client" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "none",
							children: "No client"
						}), clients.map((client) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: client.id,
							children: client.name
						}, client.id))] })]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectDateField, {
					disabled: loading,
					fieldId: "edit-project-start-date",
					label: "Start date",
					onSelect: handleStartDateSelect,
					selected: startDate,
					disabledDate: handleStartDateDisabled
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectDateField, {
					disabled: loading,
					fieldId: "edit-project-end-date",
					label: "End date",
					onSelect: handleEndDateSelect,
					selected: endDate,
					validationError: validationErrors.endDate,
					disabledDate: handleEndDateDisabled
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "edit-project-tags",
						children: "Tags"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "edit-project-tags",
							placeholder: "Add a tag…",
							value: tagInput,
							onChange: handleTagInputChange,
							onKeyDown: onTagKeyDown,
							disabled: loading || tags.length >= 10
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "icon",
							onClick: handleAddTagClick,
							disabled: loading || !tagInput.trim() || tags.length >= 10,
							"aria-label": "Add tag",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
						})]
					}),
					tags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5 pt-2",
						children: tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectTagBadge, {
							loading,
							onRemove: onRemoveTag,
							tag
						}, tag))
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [tags.length, "/10 tags. Press Enter or click + to add."]
					})
				]
			})
		]
	});
}
var INITIAL_EDIT_PROJECT_STATE = {
	loading: false,
	error: null,
	name: "",
	description: "",
	status: "planning",
	clientId: "none",
	startDate: void 0,
	endDate: void 0,
	tags: [],
	tagInput: "",
	validationErrors: {}
};
function parseProjectDate(value) {
	if (!value) return void 0;
	const parsed = parseISO(value);
	return isValid(parsed) ? parsed : void 0;
}
function editProjectReducer(state, action) {
	switch (action.type) {
		case "initFromProject": return {
			...state,
			name: action.project.name,
			description: action.project.description ?? "",
			status: action.project.status,
			clientId: action.project.clientId ?? "none",
			startDate: parseProjectDate(action.project.startDate),
			endDate: parseProjectDate(action.project.endDate),
			tags: action.project.tags ?? [],
			tagInput: "",
			error: null,
			validationErrors: {}
		};
		case "setLoading": return {
			...state,
			loading: action.value
		};
		case "setError": return {
			...state,
			error: action.value
		};
		case "setName": return {
			...state,
			name: action.value
		};
		case "setDescription": return {
			...state,
			description: action.value
		};
		case "setStatus": return {
			...state,
			status: action.value
		};
		case "setClientId": return {
			...state,
			clientId: action.value
		};
		case "setStartDate": return {
			...state,
			startDate: action.value
		};
		case "setEndDate": return {
			...state,
			endDate: action.value
		};
		case "setTagInput": return {
			...state,
			tagInput: action.value
		};
		case "addTag": return {
			...state,
			tags: [...state.tags, action.value],
			tagInput: ""
		};
		case "removeTag": return {
			...state,
			tags: state.tags.filter((tag) => tag !== action.value)
		};
		case "setValidationErrors": return {
			...state,
			validationErrors: action.value
		};
		default: return state;
	}
}
function EditProjectDialog({ project, open, onOpenChange, onProjectUpdated }) {
	const { user } = useAuth();
	const workspaceId = user?.agencyId ?? null;
	const updateProject = useMutation(projectsApi.update);
	const { clients } = useClientContext();
	const [state, dispatch] = (0, import_react.useReducer)(editProjectReducer, INITIAL_EDIT_PROJECT_STATE);
	const [discardDialogOpen, setDiscardDialogOpen] = (0, import_react.useState)(false);
	const { loading, error, name, description, status, clientId, startDate, endDate, tags, tagInput, validationErrors } = state;
	(0, import_react.useEffect)(() => {
		if (!project || !open) return;
		const frame = requestAnimationFrame(() => {
			dispatch({
				type: "initFromProject",
				project
			});
		});
		return () => {
			cancelAnimationFrame(frame);
		};
	}, [project, open]);
	const hasChanges = (() => {
		if (!project) return false;
		return name !== project.name || description !== (project.description ?? "") || status !== project.status || clientId !== (project.clientId ?? "none") || (startDate ? format(startDate, "yyyy-MM-dd") : "") !== (project.startDate?.split("T")[0] ?? "") || (endDate ? format(endDate, "yyyy-MM-dd") : "") !== (project.endDate?.split("T")[0] ?? "") || JSON.stringify(tags) !== JSON.stringify(project.tags ?? []);
	})();
	const validate = () => {
		const errors = {};
		if (!name.trim()) errors.name = "Project name is required";
		else if (name.trim().length > 200) errors.name = "Project name must be 200 characters or less";
		if (description.length > 2e3) errors.description = "Description must be 2000 characters or less";
		if (startDate && endDate) {
			if (endDate < startDate) errors.endDate = "End date cannot be before start date";
		}
		dispatch({
			type: "setValidationErrors",
			value: errors
		});
		return Object.keys(errors).length === 0;
	};
	const handleAddTag = () => {
		const trimmed = tagInput.trim();
		if (trimmed && !tags.includes(trimmed) && tags.length < 10) dispatch({
			type: "addTag",
			value: trimmed
		});
	};
	const handleRemoveTag = (tag) => {
		dispatch({
			type: "removeTag",
			value: tag
		});
	};
	const handleTagKeyDown = (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			handleAddTag();
		}
	};
	const handleSubmit = (event) => {
		event.preventDefault();
		if (!user?.id || !workspaceId || !project) {
			notifyFailure({
				title: "Authentication required",
				message: "Please sign in to update the project."
			});
			return;
		}
		if (!validate()) return;
		if (!hasChanges) {
			onOpenChange(false);
			return;
		}
		dispatch({
			type: "setLoading",
			value: true
		});
		dispatch({
			type: "setError",
			value: null
		});
		const selectedClientData = clients.find((c) => c.id === clientId);
		const payload = {};
		if (name.trim() !== project.name) payload.name = name.trim();
		if (description.trim() !== (project.description ?? "")) payload.description = description.trim() || null;
		if (status !== project.status) payload.status = status;
		if (clientId !== (project.clientId ?? "none")) {
			payload.clientId = clientId && clientId !== "none" ? clientId : null;
			payload.clientName = selectedClientData?.name || null;
		}
		if ((startDate ? format(startDate, "yyyy-MM-dd") : "") !== (project.startDate?.split("T")[0] ?? "")) payload.startDate = startDate ? format(startDate, "yyyy-MM-dd") : null;
		if ((endDate ? format(endDate, "yyyy-MM-dd") : "") !== (project.endDate?.split("T")[0] ?? "")) payload.endDate = endDate ? format(endDate, "yyyy-MM-dd") : null;
		if (JSON.stringify(tags) !== JSON.stringify(project.tags ?? [])) payload.tags = tags;
		updateProject({
			workspaceId,
			legacyId: project.id,
			..."name" in payload ? { name: payload.name } : {},
			..."description" in payload ? { description: payload.description ?? null } : {},
			..."status" in payload ? { status: payload.status } : {},
			..."clientId" in payload ? { clientId: payload.clientId ?? null } : {},
			..."clientName" in payload ? { clientName: payload.clientName ?? null } : {},
			..."startDate" in payload ? { startDateMs: payload.startDate ? new Date(payload.startDate).getTime() : null } : {},
			..."endDate" in payload ? { endDateMs: payload.endDate ? new Date(payload.endDate).getTime() : null } : {},
			..."tags" in payload ? { tags: payload.tags ?? [] } : {},
			updatedAtMs: Date.now()
		}).then(() => {
			const updatedProject = {
				...project,
				..."name" in payload ? { name: payload.name ?? project.name } : {},
				..."description" in payload ? { description: payload.description ?? null } : {},
				..."status" in payload ? { status: payload.status ?? project.status } : {},
				..."clientId" in payload ? { clientId: payload.clientId ?? null } : {},
				..."clientName" in payload ? { clientName: payload.clientName ?? null } : {},
				..."startDate" in payload ? { startDate: payload.startDate ?? null } : {},
				..."endDate" in payload ? { endDate: payload.endDate ?? null } : {},
				..."tags" in payload ? { tags: payload.tags ?? [] } : {},
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			notifySuccess({
				title: "Project updated!",
				message: `"${updatedProject.name}" has been saved.`
			});
			onProjectUpdated?.(updatedProject);
			emitDashboardRefresh({
				reason: "project-mutated",
				clientId: updatedProject.clientId ?? null
			});
			onOpenChange(false);
		}).catch((err) => {
			logError(err, "edit-project-dialog:handleUpdateProject");
			const message = err instanceof Error ? err.message : "Failed to update project";
			dispatch({
				type: "setError",
				value: message
			});
			notifyFailure({
				title: "Update failed",
				message
			});
		}).finally(() => {
			dispatch({
				type: "setLoading",
				value: false
			});
		});
	};
	const formatStatusLabel = (value) => {
		return value.replace("_", " ").split(" ").map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join(" ");
	};
	const requestClose = () => {
		if (loading) return;
		if (hasChanges) {
			setDiscardDialogOpen(true);
			return;
		}
		onOpenChange(false);
	};
	const handleDialogOpenChange = (nextOpen) => {
		if (nextOpen) {
			onOpenChange(true);
			return;
		}
		requestClose();
	};
	const handleConfirmDiscard = () => {
		setDiscardDialogOpen(false);
		onOpenChange(false);
	};
	const handleCancelDiscard = () => {
		setDiscardDialogOpen(false);
	};
	if (!project) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: handleDialogOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			className: "sm:max-w-[540px]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Edit project" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Update project details. Changes will be saved when you click Save." })] }),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
						variant: "destructive",
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: error })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditProjectFormFields, {
						loading,
						name,
						description,
						status,
						clientId,
						startDate,
						endDate,
						tags,
						tagInput,
						validationErrors,
						clients,
						onDispatch: dispatch,
						onAddTag: handleAddTag,
						onRemoveTag: handleRemoveTag,
						onTagKeyDown: handleTagKeyDown,
						formatStatusLabel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
						className: "mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: requestClose,
							disabled: loading,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							disabled: loading || !name.trim() || !hasChanges,
							children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), hasChanges ? "Save changes" : "No changes"]
						})]
					})
				]
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
		open: open && discardDialogOpen,
		onOpenChange: setDiscardDialogOpen,
		title: "Discard unsaved changes?",
		description: "You have unsaved changes in this project. Closing now will discard them.",
		confirmLabel: "Discard changes",
		cancelLabel: "Keep editing",
		variant: "warning",
		onConfirm: handleConfirmDiscard,
		onCancel: handleCancelDiscard
	})] });
}
function phaseLabel(phase, statusMessage, errorMessage) {
	if (phase === "error") return errorMessage ?? "Import failed";
	if (statusMessage) return statusMessage;
	if (phase === "dragging") return "Drop PDF, Word, or image files to create projects from briefs and plans";
	return null;
}
function ProjectsDocumentImportOverlay({ phase, statusMessage, errorMessage, visible, onCancel }) {
	if (!visible) return null;
	const label = phaseLabel(phase, statusMessage, errorMessage);
	const showOrb = phase === "extracting" || phase === "analyzing" || phase === "creating";
	const canCancel = phase === "extracting" || phase === "analyzing" || phase === "error";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("fixed inset-0 z-50 flex items-center justify-center p-6", phase === "dragging" ? "pointer-events-none bg-primary/5 backdrop-blur-[2px]" : "pointer-events-auto bg-background/80 backdrop-blur-sm"),
		role: "presentation",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("motion-chromatic flex max-w-lg flex-col items-center gap-6 rounded-3xl border border-dashed px-8 py-10 text-center shadow-lg", phase === "dragging" ? "border-primary/50 bg-primary/5" : "border-border/70 bg-card/90", phase === "error" && "border-destructive/40"),
			children: [
				showOrb ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiriOrb, {
					size: "128px",
					animationDuration: 18
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-24 items-center justify-center rounded-full bg-primary/10 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, {
						className: "size-10",
						"aria-hidden": true
					})
				}),
				label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("max-w-md text-sm", phase === "error" ? "text-destructive" : "text-muted-foreground"),
					children: label
				}) : null,
				canCancel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					className: "gap-1.5",
					onClick: onCancel,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }), "Cancel"]
				}) : null
			]
		})
	});
}
function projectNeedsClientReview(project) {
	if (project.clientStatus === "resolved" || project.clientStatus === "preferred") return false;
	if (project.clientStatus === "ambiguous") return true;
	return project.clientStatus === "unassigned" && Boolean(project.documentClientName?.trim());
}
function projectNeedsStartDateReview(project) {
	return project.startDateStatus === "unclear";
}
function projectNeedsEndDateReview(project) {
	return project.endDateStatus === "unclear";
}
function projectNeedsImportReview(project) {
	return projectNeedsClientReview(project) || projectNeedsStartDateReview(project) || projectNeedsEndDateReview(project);
}
function needsProjectImportReview(projects) {
	return projects.some(projectNeedsImportReview);
}
function buildClientReviewPrompt(project) {
	const documentName = project.documentClientName?.trim();
	if (project.clientStatus === "ambiguous") {
		if (project.suggestions.length > 0) return documentName ? `The document ties this project to “${documentName}”, but that name matches multiple clients. Did you mean ${project.suggestions.join(", ")}?` : `The client is unclear — did you mean ${project.suggestions.join(", ")}?`;
		return documentName ? `The document ties this project to “${documentName}”, but we couldn't match that name confidently. Pick the right client below.` : "The client is unclear. Pick the right client below.";
	}
	if (documentName && project.suggestions.length > 0) return `The document names “${documentName}”. We found ${project.suggestions.join(", ")} but couldn't link them automatically — pick the matching client below.`;
	if (documentName) return `The document names “${documentName}”, but that client isn't linked in this workspace yet. Pick a client below or leave unassigned.`;
	return "Pick a workspace client for this project, or leave unassigned.";
}
function getProjectImportReviewBlocker(projects) {
	const selected = projects.filter((project) => project.include && project.name.trim());
	if (selected.length === 0) return "Select at least one project to create.";
	const clientReviewProjects = selected.filter((project) => projectNeedsClientReview(project));
	if (clientReviewProjects.length > 0) {
		const ambiguousCount = clientReviewProjects.filter((project) => project.clientStatus === "ambiguous").length;
		const unmatchedCount = clientReviewProjects.length - ambiguousCount;
		if (ambiguousCount > 0 && unmatchedCount > 0) return `Confirm clients for ${clientReviewProjects.length} projects — some names were unclear or couldn't be matched.`;
		if (ambiguousCount > 0) return `Confirm clients for ${ambiguousCount} project${ambiguousCount === 1 ? "" : "s"} — the document name matched multiple clients.`;
		return `Pick workspace clients for ${clientReviewProjects.length} project${clientReviewProjects.length === 1 ? "" : "s"}.`;
	}
	const unclearStartDates = selected.filter((project) => projectNeedsStartDateReview(project) && !project.startDate.trim());
	if (unclearStartDates.length > 0) return `Confirm start dates for ${unclearStartDates.length} project${unclearStartDates.length === 1 ? "" : "s"}.`;
	const unclearEndDates = selected.filter((project) => projectNeedsEndDateReview(project) && !project.endDate.trim());
	if (unclearEndDates.length > 0) return `Confirm end dates for ${unclearEndDates.length} project${unclearEndDates.length === 1 ? "" : "s"}.`;
	return null;
}
function buildProjectImportReviewDescription(documentSummary, projects, preferredClientName) {
	if (documentSummary) {
		if (preferredClientName && !projects.some(projectNeedsClientReview)) return `${documentSummary} Projects will be created under ${preferredClientName} unless you change them below.`;
		return documentSummary;
	}
	const needsClients = projects.some(projectNeedsClientReview);
	const needsDates = projects.some((project) => projectNeedsStartDateReview(project) || projectNeedsEndDateReview(project));
	if (preferredClientName && !needsClients) return `Review extracted projects before creating them under ${preferredClientName}.`;
	if (needsClients && needsDates) return "Some clients and dates need clarification. Confirm details below before creating projects.";
	if (needsDates) return "Some dates were unclear in the document. Confirm timelines before creating projects.";
	return "Some clients were unclear or could not be matched. Confirm who each project belongs to below.";
}
function ImportReviewProjectRow({ project, index, clients, preferredClientName, onUpdateProject }) {
	const needsClientReview = projectNeedsClientReview(project);
	const needsStartDateReview = projectNeedsStartDateReview(project);
	const needsEndDateReview = projectNeedsEndDateReview(project);
	const handleIncludeChange = (checked) => {
		onUpdateProject(project.localId, { include: checked === true });
	};
	const handleNameChange = (event) => {
		onUpdateProject(project.localId, { name: event.target.value });
	};
	const handleDescriptionChange = (event) => {
		onUpdateProject(project.localId, { description: event.target.value });
	};
	const handleStatusChange = (value) => {
		onUpdateProject(project.localId, { status: value });
	};
	const handleClientChange = (value) => {
		onUpdateProject(project.localId, {
			clientId: value === "none" ? "" : value,
			clientStatus: value === "none" ? "unassigned" : "resolved"
		});
	};
	const handleStartDateChange = (event) => {
		onUpdateProject(project.localId, {
			startDate: event.target.value,
			startDateStatus: event.target.value ? "resolved" : project.startDateStatus
		});
	};
	const handleEndDateChange = (event) => {
		onUpdateProject(project.localId, {
			endDate: event.target.value,
			endDateStatus: event.target.value ? "resolved" : project.endDateStatus
		});
	};
	const resolvedClientName = clients.find((client) => client.id === project.clientId)?.name ?? (project.clientStatus === "preferred" ? preferredClientName : null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
		className: cn("rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm", !project.include && "opacity-60"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
				id: `import-project-${project.localId}`,
				checked: project.include,
				onCheckedChange: handleIncludeChange,
				className: "mt-1"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: `import-project-${project.localId}`,
							className: "text-sm font-semibold",
							children: ["Project ", index + 1]
						}), project.clientStatus === "preferred" && resolvedClientName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: "text-[10px]",
							children: resolvedClientName
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: `import-project-name-${project.localId}`,
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: `import-project-name-${project.localId}`,
							value: project.name,
							onChange: handleNameChange
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: `import-project-description-${project.localId}`,
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: `import-project-description-${project.localId}`,
							value: project.description,
							onChange: handleDescriptionChange,
							rows: 2
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: project.status,
									onValueChange: handleStatusChange,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PROJECT_STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: status,
										children: formatStatusLabel$1(status)
									}, status)) })]
								})]
							}),
							needsClientReview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2 sm:col-span-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
											className: "mt-0.5 size-4 shrink-0",
											"aria-hidden": true
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: buildClientReviewPrompt(project) })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: `import-project-client-${project.localId}`,
										children: "Client"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: project.clientId || "none",
										onValueChange: handleClientChange,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											id: `import-project-client-${project.localId}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select client" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "none",
											children: "No client"
										}), clients.map((client) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: client.id,
											children: client.name
										}, client.id))] })]
									})
								]
							}) : resolvedClientName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1 sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Client" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: resolvedClientName
								})]
							}) : null,
							needsStartDateReview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: `import-project-start-${project.localId}`,
										children: "Start date"
									}),
									project.startDateHint ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: ["Document hint: ", project.startDateHint]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: `import-project-start-${project.localId}`,
										type: "date",
										value: project.startDate,
										onChange: handleStartDateChange
									})
								]
							}) : project.startDate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Start date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: format(new Date(project.startDate), "MMM d, yyyy")
								})]
							}) : null,
							needsEndDateReview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: `import-project-end-${project.localId}`,
										children: "End date"
									}),
									project.endDateHint ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: ["Document hint: ", project.endDateHint]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: `import-project-end-${project.localId}`,
										type: "date",
										value: project.endDate,
										onChange: handleEndDateChange
									})
								]
							}) : project.endDate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "End date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: format(new Date(project.endDate), "MMM d, yyyy")
								})]
							}) : null
						]
					}),
					project.tags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: project.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "text-[10px]",
							children: tag
						}, tag))
					}) : null,
					project.sourceExcerpt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs italic text-muted-foreground",
						children: [
							"“",
							project.sourceExcerpt,
							"”"
						]
					}) : null
				]
			})]
		})
	});
}
function ProjectsDocumentImportReviewSheet({ open, documentSummary, proposedProjects, clients, preferredClientName, onUpdateProject, onConfirm, onDiscard }) {
	const selectedCount = proposedProjects.filter((project) => project.include).length;
	const reviewBlocker = getProjectImportReviewBlocker(proposedProjects);
	const reviewDescription = buildProjectImportReviewDescription(documentSummary, proposedProjects, preferredClientName);
	const handleOpenChange = (next) => {
		if (!next) onDiscard();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange: handleOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "right",
			className: cn("overflow-y-auto sm:max-w-xl", PROJECTS_THEME.content),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
					className: "border-b border-border/60 pb-4 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Review imported projects" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: reviewDescription })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-1 flex-col gap-4 py-4",
					children: proposedProjects.map((project, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportReviewProjectRow, {
						project,
						index,
						clients,
						preferredClientName,
						onUpdateProject
					}, project.localId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sticky bottom-0 flex flex-col gap-2 border-t border-border/60 bg-background py-4",
					children: [
						reviewBlocker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-warning",
							children: reviewBlocker
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							onClick: onConfirm,
							disabled: selectedCount === 0 || Boolean(reviewBlocker),
							children: [
								"Create ",
								selectedCount,
								" project",
								selectedCount === 1 ? "" : "s"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: onDiscard,
							children: "Discard"
						})
					]
				})
			]
		})
	});
}
function formatDateInput(dateMs) {
	if (dateMs == null) return "";
	const date = new Date(dateMs);
	if (Number.isNaN(date.getTime())) return "";
	return format(date, "yyyy-MM-dd");
}
function mapServerProposal(project, index) {
	return {
		localId: `import-${index}-${crypto.randomUUID()}`,
		name: project.name,
		description: project.description ?? "",
		status: project.status,
		clientId: project.clientId ?? "",
		documentClientName: project.documentClientName,
		clientStatus: project.clientStatus,
		startDate: formatDateInput(project.startDateMs),
		endDate: formatDateInput(project.endDateMs),
		startDateStatus: project.startDateStatus,
		endDateStatus: project.endDateStatus,
		startDateHint: project.startDateHint,
		endDateHint: project.endDateHint,
		tags: project.tags,
		suggestions: project.suggestions,
		sourceExcerpt: project.sourceExcerpt,
		include: true
	};
}
function useProjectsDocumentImport({ workspaceId, ownerId, clients, preferredClientId, preferredClientName, disabledReason, isPreviewMode, onProjectCreated }) {
	const extractPdfTextAction = useAction(agentApi.extractPdfText);
	const extractProjectsFromDocument = useAction(projectsDocumentImportApi.extractProjectsFromDocument);
	const createProject = useMutation(projectsApi.create);
	const generateUploadUrl = useMutation(filesApi.generateUploadUrl);
	const syncMetadata = useMutation(filesApi.syncMetadata);
	const [phase, setPhase] = (0, import_react.useState)("idle");
	const [statusMessage, setStatusMessage] = (0, import_react.useState)(null);
	const [errorMessage, setErrorMessage] = (0, import_react.useState)(null);
	const [proposedProjects, setProposedProjects] = (0, import_react.useState)([]);
	const [documentSummary, setDocumentSummary] = (0, import_react.useState)(null);
	const dragDepthRef = (0, import_react.useRef)(0);
	const abortRef = (0, import_react.useRef)(false);
	const resetImport = (0, import_react.useCallback)(() => {
		abortRef.current = false;
		dragDepthRef.current = 0;
		setPhase("idle");
		setStatusMessage(null);
		setErrorMessage(null);
		setProposedProjects([]);
		setDocumentSummary(null);
	}, []);
	const extractPdfOnServer = async (file) => {
		if (!workspaceId || isPreviewModeEnabled()) return null;
		const sizeError = getPdfUploadSizeError(file);
		if (sizeError) return {
			extractionStatus: "failed",
			errorMessage: sizeError
		};
		try {
			const dataBase64 = await readFileAsBase64(file);
			return await extractPdfTextAction({
				workspaceId,
				fileName: file.name,
				dataBase64
			});
		} catch (error) {
			logError(error, "use-projects-document-import:extractPdfOnServer");
			return null;
		}
	};
	const uploadForVision = async (file) => {
		return await uploadTaskImportDocument({
			file,
			generateUploadUrl: () => generateUploadUrl({}),
			syncMetadata: (args) => syncMetadata(args)
		});
	};
	const createProjectsFromProposals = async (projects) => {
		if (!workspaceId || !ownerId) throw new Error("Sign in to import projects from a document.");
		const selected = projects.filter((project) => project.include && project.name.trim());
		const reviewBlocker = getProjectImportReviewBlocker(projects);
		if (reviewBlocker) throw new Error(reviewBlocker);
		if (selected.length === 0) throw new Error("Select at least one project to create.");
		setPhase("creating");
		setStatusMessage(`Creating ${selected.length} project${selected.length === 1 ? "" : "s"}…`);
		if (abortRef.current) {
			resetImport();
			return;
		}
		const clientsById = new Map(clients.map((client) => [client.id, client.name]));
		const createdCount = (await Promise.all(selected.map(async (project) => {
			if (abortRef.current) return false;
			const clientId = project.clientId || preferredClientId || void 0;
			const clientName = clientsById.get(clientId ?? "") ?? preferredClientName ?? void 0;
			const legacyId = v4();
			await createProject({
				workspaceId,
				legacyId,
				name: project.name.trim(),
				description: project.description.trim() || null,
				status: project.status,
				clientId: clientId ?? null,
				clientName: clientName ?? null,
				startDateMs: project.startDate ? new Date(project.startDate).getTime() : null,
				endDateMs: project.endDate ? new Date(project.endDate).getTime() : null,
				tags: project.tags,
				ownerId
			});
			const nowMs = Date.now();
			onProjectCreated({
				id: legacyId,
				name: project.name.trim(),
				description: project.description.trim() || null,
				status: project.status,
				clientId: clientId ?? null,
				clientName: clientName ?? null,
				startDate: project.startDate ? new Date(project.startDate).toISOString() : null,
				endDate: project.endDate ? new Date(project.endDate).toISOString() : null,
				tags: project.tags,
				ownerId,
				createdAt: new Date(nowMs).toISOString(),
				updatedAt: new Date(nowMs).toISOString(),
				taskCount: 0,
				openTaskCount: 0,
				recentActivityAt: null,
				deletedAt: null
			});
			emitDashboardRefresh({
				reason: "project-mutated",
				clientId: clientId ?? null
			});
			return true;
		}))).filter(Boolean).length;
		notifySuccess({
			title: "Projects imported",
			message: `Created ${createdCount} project${createdCount === 1 ? "" : "s"} from your document.`
		});
		resetImport();
	};
	const runDocumentImport = async (files) => {
		if (disabledReason) {
			notifyFailure({
				title: "Cannot import",
				message: disabledReason
			});
			return;
		}
		if (isPreviewMode || isPreviewModeEnabled()) {
			notifyFailure({
				title: "Preview mode",
				message: "Document import is unavailable in preview mode."
			});
			return;
		}
		if (!workspaceId) {
			notifyFailure({
				title: "Cannot import",
				message: "Sign in to import projects from documents."
			});
			return;
		}
		const documentFiles = filterTasksDocumentFiles(files);
		if (documentFiles.length === 0) {
			notifyFailure({
				title: "Unsupported file",
				message: "Drop a PDF, Word file, or image (including photos of handwritten notes)."
			});
			return;
		}
		abortRef.current = false;
		setErrorMessage(null);
		setPhase("extracting");
		setStatusMessage("Reading document…");
		try {
			if (abortRef.current) return;
			const preparedDocuments = await Promise.all(documentFiles.map((file) => prepareTaskImportDocument(file, {
				extractPdfOnServer,
				uploadForVision
			})));
			const textDocuments = preparedDocuments.flatMap((document) => document.kind === "text" ? [{
				fileName: document.fileName,
				text: document.text
			}] : []);
			const visualDocuments = preparedDocuments.flatMap((document) => document.kind === "vision" ? [{
				fileName: document.fileName,
				mimeType: document.mimeType,
				storageId: document.storageId
			}] : []);
			const combinedText = textDocuments.length > 0 ? combineExtractedDocumentText(textDocuments) : void 0;
			const primaryFileName = buildTaskImportFileName(documentFiles);
			const usesVision = visualDocuments.length > 0;
			setPhase("analyzing");
			setStatusMessage(usesVision ? "Reading handwriting and finding projects…" : preferredClientName ? `Finding projects for ${preferredClientName}…` : "Finding projects and timelines…");
			if (abortRef.current) return;
			const result = await extractProjectsFromDocument({
				workspaceId,
				fileName: primaryFileName,
				extractedText: combinedText,
				visualDocuments: visualDocuments.length > 0 ? visualDocuments : void 0,
				preferredClientId: preferredClientId ?? null
			});
			const mapped = result.proposedProjects.map((project, index) => mapServerProposal(project, index));
			setDocumentSummary(result.documentSummary ?? null);
			if (needsProjectImportReview(mapped)) {
				setProposedProjects(mapped);
				setPhase("review");
				setStatusMessage(null);
				const clientIssues = mapped.filter((project) => projectNeedsClientReview(project)).length;
				const dateIssues = mapped.filter((project) => projectNeedsStartDateReview(project) || projectNeedsEndDateReview(project)).length;
				if (clientIssues > 0 && dateIssues > 0) notifyWarning({
					title: "Review imported projects",
					message: `${clientIssues} project${clientIssues === 1 ? "" : "s"} need client confirmation and ${dateIssues} need dates before creating.`
				});
				else if (clientIssues > 0) notifyWarning({
					title: "Clients need confirmation",
					message: `${clientIssues} project${clientIssues === 1 ? "" : "s"} have unclear or unmatched clients. Pick clients in the review sheet.`
				});
				else if (dateIssues > 0) notifyWarning({
					title: "Dates need confirmation",
					message: `${dateIssues} project${dateIssues === 1 ? "" : "s"} have unclear timelines. Add dates in the review sheet.`
				});
				return;
			}
			await createProjectsFromProposals(mapped);
		} catch (error) {
			if (abortRef.current) return;
			const message = asErrorMessage(error);
			setErrorMessage(message);
			setPhase("error");
			setStatusMessage(null);
			reportConvexFailure({
				error,
				context: "useProjectsDocumentImport:runDocumentImport",
				title: "Import failed",
				fallbackMessage: message
			});
		}
	};
	const handleDragEnter = (event) => {
		if (!isFileDragEvent(event) || disabledReason) return;
		event.preventDefault();
		dragDepthRef.current += 1;
		if (phase === "idle" || phase === "dragging") setPhase("dragging");
	};
	const handleDragOver = (event) => {
		if (!isFileDragEvent(event) || disabledReason) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = "copy";
	};
	const handleDragLeave = (event) => {
		if (!isFileDragEvent(event)) return;
		dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
		if (dragDepthRef.current === 0 && (phase === "dragging" || phase === "idle")) setPhase("idle");
	};
	const handleDrop = (event) => {
		if (!isFileDragEvent(event)) return;
		event.preventDefault();
		dragDepthRef.current = 0;
		const files = event.dataTransfer.files;
		if (files.length === 0) return;
		runDocumentImport(Array.from(files));
	};
	const handleCancel = (0, import_react.useCallback)(() => {
		abortRef.current = true;
		resetImport();
	}, [resetImport]);
	const handleConfirmReview = () => {
		createProjectsFromProposals(proposedProjects);
	};
	const updateProposedProject = (localId, patch) => {
		setProposedProjects((current) => current.map((project) => project.localId === localId ? {
			...project,
			...patch
		} : project));
	};
	(0, import_react.useEffect)(() => {
		if (phase !== "extracting" && phase !== "analyzing") return;
		const onKeyDown = (event) => {
			if (event.key === "Escape") handleCancel();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [phase, handleCancel]);
	return {
		phase,
		statusMessage,
		errorMessage,
		proposedProjects,
		documentSummary,
		overlayVisible: phase === "dragging" || phase === "extracting" || phase === "analyzing" || phase === "creating" || phase === "error",
		reviewOpen: phase === "review",
		importDragHandlers: {
			onDragEnter: handleDragEnter,
			onDragOver: handleDragOver,
			onDragLeave: handleDragLeave,
			onDrop: handleDrop
		},
		handleCancel,
		handleConfirmReview,
		handleDismissReview: resetImport,
		updateProposedProject
	};
}
function ProjectsPageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: PROJECTS_THEME.page,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardPageHero, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-12 shrink-0 rounded-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-64" })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-48 rounded-lg" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-24" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-28" })
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: PROJECTS_THEME.summaryStrip,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
					children: [
						"sum-1",
						"sum-2",
						"sum-3",
						"sum-4"
					].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[5.5rem] rounded-xl" }, slot))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					"pill-1",
					"pill-2",
					"pill-3",
					"pill-4",
					"pill-5"
				].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-24 rounded-full" }, slot))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: PROJECTS_THEME.workspace,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: PROJECTS_THEME.workspaceRail,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-48" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-full max-w-xl gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 flex-1 rounded-md" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-36 rounded-md" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-9 rounded-md" })
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3 p-4",
					children: [
						"row-1",
						"row-2",
						"row-3",
						"row-4"
					].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full rounded-xl" }, slot))
				})]
			})
		]
	});
}
var MIN_CALENDAR_DATE = /* @__PURE__ */ new Date("1900-01-01");
var STATUS_LABELS = {
	planned: "Planned",
	in_progress: "In progress",
	blocked: "Blocked",
	completed: "Completed"
};
function createInitialMilestoneFormState(projectId) {
	return {
		projectId,
		title: "",
		status: "planned",
		startDate: void 0,
		endDate: void 0,
		description: ""
	};
}
function milestoneFormReducer(state, action) {
	switch (action.type) {
		case "reset": return createInitialMilestoneFormState(action.projectId);
		case "setProjectId": return {
			...state,
			projectId: action.value
		};
		case "setTitle": return {
			...state,
			title: action.value
		};
		case "setStatus": return {
			...state,
			status: action.value
		};
		case "setStartDate": return {
			...state,
			startDate: action.value
		};
		case "setEndDate": return {
			...state,
			endDate: action.value
		};
		case "setDescription": return {
			...state,
			description: action.value
		};
		default: return state;
	}
}
function CreateMilestoneDialog({ projects, trigger, defaultProjectId, onCreated }) {
	const { user } = useAuth();
	const createMilestone = useMutation(projectMilestonesApi.create);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [formState, dispatch] = (0, import_react.useReducer)(milestoneFormReducer, defaultProjectId ?? "", createInitialMilestoneFormState);
	const { projectId, title, status, startDate, endDate, description } = formState;
	const handleTitleChange = (event) => {
		dispatch({
			type: "setTitle",
			value: event.target.value
		});
	};
	const handleDescriptionChange = (event) => {
		dispatch({
			type: "setDescription",
			value: event.target.value
		});
	};
	const handleStatusChange = (value) => {
		dispatch({
			type: "setStatus",
			value
		});
	};
	const handleProjectChange = (value) => {
		dispatch({
			type: "setProjectId",
			value
		});
	};
	const handleStartDateSelect = (date) => {
		dispatch({
			type: "setStartDate",
			value: date
		});
	};
	const handleEndDateSelect = (date) => {
		dispatch({
			type: "setEndDate",
			value: date
		});
	};
	const handleStartDateDisabled = (date) => date < MIN_CALENDAR_DATE;
	const handleEndDateDisabled = (date) => (startDate ? date < startDate : false) || date < MIN_CALENDAR_DATE;
	const handleCancel = () => {
		setOpen(false);
	};
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const frame = requestAnimationFrame(() => {
			dispatch({
				type: "reset",
				projectId: defaultProjectId ?? ""
			});
		});
		return () => {
			cancelAnimationFrame(frame);
		};
	}, [open, defaultProjectId]);
	const sortedProjects = projects.toSorted((a, b) => a.name.localeCompare(b.name));
	const handleSubmit = (event) => {
		event.preventDefault();
		if (!user?.id) {
			notifyFailure({
				title: "Sign in required",
				message: "Please sign in to create milestones."
			});
			return;
		}
		if (!projectId) {
			notifyFailure({
				title: "Project required",
				message: "Choose a project for this milestone."
			});
			return;
		}
		if (!title.trim()) {
			notifyFailure({
				title: "Title required",
				message: "Give this milestone a name."
			});
			return;
		}
		setLoading(true);
		if (!user?.agencyId) {
			notifyFailure({
				title: "Could not create",
				message: "Missing workspace"
			});
			setLoading(false);
			return;
		}
		const legacyId = v4();
		createMilestone({
			workspaceId: user.agencyId,
			legacyId,
			projectId,
			title: title.trim(),
			status,
			description: description.trim() || null,
			startDateMs: startDate ? startDate.getTime() : null,
			endDateMs: endDate ? endDate.getTime() : null,
			ownerId: user.id,
			order: null
		}).then(() => {
			const milestone = {
				id: legacyId,
				projectId,
				title: title.trim(),
				description: description.trim() || null,
				status,
				startDate: startDate ? startDate.toISOString() : null,
				endDate: endDate ? endDate.toISOString() : null,
				ownerId: user.id,
				order: null,
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			onCreated?.(milestone);
			notifySuccess({
				title: "Milestone created",
				message: `“${milestone.title}” added to the timeline.`
			});
			setOpen(false);
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CreateMilestoneDialog:handleSubmit",
				title: "Could not create",
				fallbackMessage: "Could not create"
			});
		}).finally(() => {
			setLoading(false);
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: trigger ?? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: "gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add milestone"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			className: "sm:max-w-[520px]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add milestone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Plan key delivery points and keep teams aligned." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "milestone-project",
									children: "Project"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: projectId,
									onValueChange: handleProjectChange,
									disabled: loading,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "milestone-project",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select project" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: sortedProjects.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: project.id,
										children: project.name
									}, project.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "milestone-title",
									children: "Title"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "milestone-title",
									placeholder: "e.g., Launch beta cohort",
									value: title,
									onChange: handleTitleChange,
									disabled: loading,
									required: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Start" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											className: cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground"),
											disabled: loading,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "mr-2 size-4" }), startDate ? format(startDate, "PPP") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pick a date" })]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
										className: "w-auto p-0",
										align: "start",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
											mode: "single",
											selected: startDate,
											onSelect: handleStartDateSelect,
											initialFocus: true,
											disabled: handleStartDateDisabled
										})
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "End" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											className: cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground"),
											disabled: loading,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "mr-2 size-4" }), endDate ? format(endDate, "PPP") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pick a date" })]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
										className: "w-auto p-0",
										align: "start",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
											mode: "single",
											selected: endDate,
											onSelect: handleEndDateSelect,
											initialFocus: true,
											disabled: handleEndDateDisabled
										})
									})] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "milestone-status",
									children: "Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: status,
									onValueChange: handleStatusChange,
									disabled: loading,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "milestone-status",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select status" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: MILESTONE_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: s,
										children: STATUS_LABELS[s]
									}, s)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "milestone-description",
									children: "Notes"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "milestone-description",
									placeholder: "Optional context or acceptance criteria…",
									value: description,
									onChange: handleDescriptionChange,
									rows: 3,
									disabled: loading
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
						className: "mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: handleCancel,
							disabled: loading,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							disabled: loading || !projectId || !title.trim(),
							children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Add milestone"]
						})]
					})
				]
			})
		})]
	});
}
function GanttView({ projects, milestones, loading, error, onRefresh, onMilestoneCreated }) {
	const allMilestones = Object.values(milestones).flat();
	const { start, end } = computeTimelineRange(projects, allMilestones);
	const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) + 1);
	const dayWidth = 18;
	const timelineStyle = { width: Math.max(totalDays * dayWidth, 640) };
	const loadingSlots = [
		"loading-1",
		"loading-2",
		"loading-3",
		"loading-4",
		"loading-5"
	];
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: loadingSlots.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-48" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 flex-1" })]
		}, slot))
	});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-destructive/40 bg-destructive/10 p-6 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mx-auto size-10 text-destructive/60" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm font-medium text-destructive",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				className: "mt-4",
				onClick: onRefresh,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 size-4" }), "Refresh data"]
			})
		]
	});
	if (projects.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-dashed border-muted/60 bg-muted/10 p-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, { className: "mx-auto size-12 text-muted-foreground/40" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 text-lg font-medium text-foreground",
				children: "No projects to chart"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Create a project to see it on the timeline."
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				"Showing ",
				projects.length,
				" project",
				projects.length !== 1 ? "s" : "",
				" with ",
				allMilestones.length,
				" milestones"
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-2 text-xs",
				children: MILESTONE_STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inline-flex items-center gap-1 rounded-full border px-2 py-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MilestoneStatusIndicator, { status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "capitalize",
						children: status.replace("_", " ")
					})]
				}, status))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-[240px_1fr] items-start gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs font-medium uppercase text-muted-foreground",
					children: "Projects"
				}), projects.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectTimelineRow, {
					project,
					onMilestoneCreated
				}, project.id))]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-full overflow-hidden rounded-md border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-b bg-muted/50 px-4 py-2 text-xs font-medium uppercase text-muted-foreground",
						children: "Timeline"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative bg-background",
							style: timelineStyle,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelineGrid, {
									start,
									totalDays,
									dayWidth
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TodayMarker, {
									start,
									dayWidth
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "divide-y",
									children: projects.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "relative h-16",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectMilestones, {
											milestoneList: milestones[project.id] ?? [],
											start,
											dayWidth,
											totalDays
										})
									}, project.id))
								})
							]
						})
					})]
				})
			})]
		})]
	});
}
function ProjectMilestones({ milestoneList, start, dayWidth, totalDays }) {
	if (milestoneList.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full items-center justify-center text-xs text-muted-foreground",
		children: "No milestones yet"
	});
	return milestoneList.map((milestone) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MilestoneBar, {
		milestone,
		start,
		dayWidth,
		totalDays
	}, milestone.id));
}
function MilestoneStatusIndicator({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "size-2 rounded-full",
		style: { backgroundColor: milestoneStatusColor(status) }
	});
}
var ADD_MILESTONE_TRIGGER = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
	variant: "ghost",
	size: "icon",
	className: "size-8",
	"aria-label": "Add milestone",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
});
function ProjectTimelineRow({ project, onMilestoneCreated }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 truncate",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill$1, { status: project.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate",
				title: project.name,
				children: project.name
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateMilestoneDialog, {
			projects: [project],
			defaultProjectId: project.id,
			onCreated: onMilestoneCreated,
			trigger: ADD_MILESTONE_TRIGGER
		})]
	});
}
function MilestoneBar({ milestone, start, dayWidth, totalDays }) {
	const { left, width, startLabel, endLabel } = computeBarMetrics(milestone, start, dayWidth, totalDays);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute top-2 flex h-10 items-center rounded-md px-3 text-xs text-primary-foreground shadow-sm",
		style: {
			left,
			width,
			backgroundColor: milestoneStatusColor(milestone.status),
			minWidth: 64
		},
		title: `${milestone.title} • ${startLabel} → ${endLabel}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col truncate",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium truncate text-[13px]",
				children: milestone.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-[11px] opacity-80",
				children: [
					startLabel,
					" → ",
					endLabel
				]
			})]
		})
	});
}
function computeBarMetrics(milestone, chartStart, dayWidth, totalDays) {
	const startDate = parseDate(milestone.startDate) ?? chartStart;
	const endDate = parseDate(milestone.endDate) ?? startDate;
	const safeEnd = endDate < startDate ? startDate : endDate;
	const offsetDays = Math.max(0, Math.floor((startDate.getTime() - chartStart.getTime()) / (1e3 * 60 * 60 * 24)));
	const durationDays = Math.max(1, Math.floor((safeEnd.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24)) + 1);
	const clampedDuration = Math.min(durationDays, totalDays - offsetDays);
	return {
		left: offsetDays * dayWidth + 4,
		width: clampedDuration * dayWidth - 8,
		startLabel: formatShortDate(startDate),
		endLabel: formatShortDate(safeEnd)
	};
}
function TimelineGrid({ start, totalDays, dayWidth }) {
	const formatter = GANTT_SHORT_DATE_FORMATTER;
	const weeks = Math.ceil(totalDays / 7);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex border-b text-[11px] text-muted-foreground",
			children: Array.from({ length: weeks }, (_, index) => `week-${index + 1}`).map((slot, index) => {
				const weekStart = addDays(start, index * 7);
				const label = `${formatter.format(weekStart)}`;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelineWeekCell, {
					weekNumber: index + 1,
					label,
					width: Math.min(7, totalDays - index * 7) * dayWidth
				}, slot);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 pointer-events-none",
			children: Array.from({ length: totalDays }, (_, index) => `day-${index + 1}`).map((slot, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelineDayCell, {
				left: index * dayWidth,
				width: dayWidth
			}, slot))
		})]
	});
}
function TimelineWeekCell({ weekNumber, label, width }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-r px-2 py-1",
		style: { width },
		children: [
			"Week ",
			weekNumber,
			" • ",
			label
		]
	});
}
function TimelineDayCell({ left, width }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute top-0 h-full border-r last:border-r-0",
		style: {
			left,
			width
		}
	});
}
function TodayMarker({ start, dayWidth }) {
	const offsetDays = Math.floor(((/* @__PURE__ */ new Date()).getTime() - start.getTime()) / (1e3 * 60 * 60 * 24));
	const markerStyle = { left: offsetDays * dayWidth };
	if (offsetDays < 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-y-0",
		style: markerStyle,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-y-0 w-px bg-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute -top-6 -ml-8 rounded-md bg-warning px-2 py-1 text-[11px] font-medium text-warning-foreground shadow",
			children: "Today"
		})]
	});
}
function StatusPill$1({ status }) {
	const Icon = STATUS_ICONS[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium", STATUS_CLASSES[status]),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3" }), formatStatusLabel$1(status)]
	});
}
function ProjectActiveFilters({ labels, onClearAll }) {
	if (labels.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70",
				children: "Active filters"
			}),
			labels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "secondary",
				className: "font-normal",
				children: label
			}, label)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "ghost",
				size: "sm",
				className: "h-7 gap-1 px-2 text-xs",
				onClick: onClearAll,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
					className: "size-3",
					"aria-hidden": true
				}), "Clear all"]
			})
		]
	});
}
function ProjectFilters({ sortField, sortDirection, onSortFieldChange, onToggleSortDirection }) {
	const handleSortFieldChange = (value) => onSortFieldChange(value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex shrink-0 items-center gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
			value: sortField,
			onValueChange: handleSortFieldChange,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
				className: "h-9 w-[9.5rem] border-border/60 bg-background text-xs shadow-sm",
				"aria-label": "Sort by",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Sort" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SORT_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
				value: option.value,
				children: option.label
			}, option.value)) })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "icon",
				onClick: onToggleSortDirection,
				className: "size-9 shrink-0 border-border/60 shadow-sm",
				"aria-label": `Sort ${sortDirection === "asc" ? "descending" : "ascending"}`,
				children: sortDirection === "asc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-4" })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: sortDirection === "asc" ? "Sort descending" : "Sort ascending" })] })]
	});
}
function ProjectActionsMenu({ project, onEdit, onDelete, onUpdateStatus, triggerClassName, align = "end", showEditItem = true }) {
	const tasksHref = buildProjectTasksRoute({
		projectId: project.id,
		projectName: project.name,
		clientId: project.clientId,
		clientName: project.clientName
	});
	const createTaskHref = buildProjectTasksRoute({
		projectId: project.id,
		projectName: project.name,
		clientId: project.clientId,
		clientName: project.clientName,
		action: "create"
	});
	const collaborationHref = `/dashboard/collaboration?${new URLSearchParams({ projectId: project.id }).toString()}`;
	const handleEdit = () => onEdit(project);
	const handleDelete = () => onDelete(project);
	const statusAccentStyles = Object.fromEntries(Object.entries(STATUS_ACCENT_COLORS).map(([status, backgroundColor]) => [status, { backgroundColor }]));
	const statusUpdateHandlers = Object.fromEntries(PROJECT_STATUSES.flatMap((status) => status !== project.status ? [[status, () => onUpdateStatus(project, status)]] : []));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: cn("size-8 text-muted-foreground/60 hover:text-foreground", triggerClassName),
			"aria-label": `Actions for ${project.name}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align,
		className: "w-52",
		children: [
			showEditItem ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: handleEdit,
				className: "gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edit project" })]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				asChild: true,
				className: "gap-2 cursor-pointer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
					href: createTaskHref,
					prefetch: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Create task" })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				asChild: true,
				className: "gap-2 cursor-pointer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
					href: tasksHref,
					prefetch: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "View tasks" })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				asChild: true,
				className: "gap-2 cursor-pointer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
					href: collaborationHref,
					prefetch: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Open discussion" })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-2 py-1.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60",
					children: "Update status"
				})
			}),
			PROJECT_STATUSES.flatMap((status) => status !== project.status ? [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: statusUpdateHandlers[status],
				className: "gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-2 rounded-full",
					style: statusAccentStyles[status]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatStatusLabel$1(status) })]
			}, status)] : []),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				className: "gap-2 text-destructive focus:text-destructive",
				onClick: handleDelete,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delete project" })]
			})
		]
	})] });
}
function ProjectTaskProgress({ project, className }) {
	const total = project.taskCount;
	const open = project.openTaskCount;
	const closed = Math.max(total - open, 0);
	const progress = total > 0 ? Math.round(closed / total * 100) : 0;
	const progressStyle = { width: `${progress}%` };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-1.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: formatTaskSummary(open, total)
			}), total > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "tabular-nums text-[10px] font-semibold text-muted-foreground/70",
				children: [progress, "% done"]
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-1.5 w-full overflow-hidden rounded-full bg-muted/50 ring-1 ring-border/30",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full rounded-full bg-linear-to-r from-primary/70 to-primary motion-chromatic",
				style: progressStyle
			})
		})]
	});
}
function ProjectCardComponent({ project, onDelete, onEdit, onUpdateStatus, isPendingUpdate, compact = false, kanban = false }) {
	const tasksHref = buildProjectTasksRoute({
		projectId: project.id,
		projectName: project.name,
		clientId: project.clientId,
		clientName: project.clientName
	});
	const collaborationHref = `/dashboard/collaboration?${new URLSearchParams({ projectId: project.id }).toString()}`;
	const StatusIcon = STATUS_ICONS[project.status];
	const overdue = isProjectOverdue(project);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTransition, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm ring-1 ring-border/30", "transition-[border-color,box-shadow,transform] hover:border-primary/20 hover:shadow-md", listItemEnterClass, clickableCardClass, compact ? "p-3.5" : "p-5", isPendingUpdate && "pointer-events-none opacity-75"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("absolute bottom-0 left-0 top-0 w-1 rounded-l-xl", project.status === "active" ? "bg-success" : project.status === "planning" ? "bg-muted-foreground/50" : project.status === "on_hold" ? "bg-warning" : "bg-info"),
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1 space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: cn("font-semibold leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors", compact ? "text-sm" : "text-lg"),
									children: project.name
								}), overdue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "border-destructive/30 bg-destructive/10 text-destructive text-[10px]",
									children: "Overdue"
								}) : null]
							}), project.clientName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: project.clientId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
									href: `/dashboard/clients?clientId=${project.clientId}`,
									className: "font-medium hover:text-primary hover:underline",
									children: project.clientName
								}) : project.clientName
							}) : null]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: cn(STATUS_CLASSES[project.status], "h-6 gap-1 border px-2 py-0"),
									children: [isPendingUpdate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIcon, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold uppercase tracking-wider",
										children: formatStatusLabel$1(project.status)
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
								side: "bottom",
								children: isPendingUpdate ? "Updating status…" : kanban ? "Drag the grip to move columns, or use the menu" : "Use the menu to change status"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectActionsMenu, {
								project,
								onEdit,
								onDelete,
								onUpdateStatus
							})]
						})]
					}),
					!compact && project.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed min-h-[2.5rem]",
						children: project.description
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectTaskProgress, { project }),
					!compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5" }), formatDateRange(project.startDate, project.endDate)]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3.5" }), project.recentActivityAt ? formatRelativeTime(project.recentActivityAt) : "No recent chat"]
						})]
					}) : null,
					project.tags.length > 0 && !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-1.5",
						children: [project.tags.slice(0, 3).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "h-5 px-2 text-[10px] font-medium",
							children: ["#", tag]
						}, tag)), project.tags.length > 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[10px] text-muted-foreground",
							children: ["+", project.tags.length - 3]
						}) : null]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex items-center gap-2 border-t border-muted/30", compact ? "mt-3 pt-3" : "mt-4 pt-4"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						variant: "ghost",
						className: "h-8 flex-1 text-xs font-semibold",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
							href: tasksHref,
							prefetch: true,
							children: "Tasks"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {
						orientation: "vertical",
						className: "h-4 opacity-50"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						variant: "ghost",
						className: "h-8 flex-1 text-xs font-semibold",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
							href: collaborationHref,
							prefetch: true,
							children: "Discussion"
						})
					})
				]
			})
		]
	}) });
}
var ProjectCard = Object.assign(ProjectCardComponent, { displayName: "ProjectCard" });
var INITIAL_PROJECT_KANBAN_STATE = {
	draggedProject: null,
	dragOverStatus: null,
	boardAnnouncement: ""
};
function projectKanbanReducer(state, action) {
	switch (action.type) {
		case "startDrag": return {
			...state,
			draggedProject: action.draggedProject
		};
		case "setDragOverStatus": return {
			...state,
			dragOverStatus: action.status
		};
		case "resetDragState": return {
			...state,
			draggedProject: null,
			dragOverStatus: null
		};
		case "setBoardAnnouncement": return {
			...state,
			boardAnnouncement: action.message
		};
		default: return state;
	}
}
var KANBAN_STATUSES = [...PROJECT_STATUSES];
function resolveProjectKanbanMoveTarget(currentStatus, direction) {
	const currentIndex = KANBAN_STATUSES.indexOf(currentStatus);
	if (currentIndex < 0) return null;
	return direction === "previous" ? KANBAN_STATUSES[currentIndex - 1] ?? null : KANBAN_STATUSES[currentIndex + 1] ?? null;
}
function canDragProjectKanbanCard(project, pendingStatusUpdates) {
	return !pendingStatusUpdates.has(project.id) && project.deletedAt == null;
}
function ProjectKanban({ projects, pendingStatusUpdates, onUpdateStatus, onEdit, onDelete }) {
	const [{ draggedProject, dragOverStatus, boardAnnouncement }, dispatch] = (0, import_react.useReducer)(projectKanbanReducer, INITIAL_PROJECT_KANBAN_STATE);
	const keyboardInstructionsId = (0, import_react.useId)();
	const columns = PROJECT_STATUSES.map((status) => ({
		status,
		label: formatStatusLabel$1(status),
		items: projects.filter((project) => project.status === status)
	}));
	const handleDragStart = (event, project) => {
		if (!canDragProjectKanbanCard(project, pendingStatusUpdates)) return;
		dispatch({
			type: "startDrag",
			draggedProject: {
				id: project.id,
				sourceStatus: project.status
			}
		});
		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.setData("text/plain", project.id);
	};
	const handleDragOver = (event, status) => {
		if (!draggedProject) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
		dispatch({
			type: "setDragOverStatus",
			status
		});
	};
	const handleDragLeave = () => {
		dispatch({
			type: "setDragOverStatus",
			status: null
		});
	};
	const handleDrop = (event, targetStatus) => {
		event.preventDefault();
		dispatch({
			type: "setDragOverStatus",
			status: null
		});
		if (!draggedProject) return;
		const project = projects.find((entry) => entry.id === draggedProject.id);
		if (project && draggedProject.sourceStatus !== targetStatus && canDragProjectKanbanCard(project, pendingStatusUpdates)) {
			dispatch({
				type: "setBoardAnnouncement",
				message: `${project.name} moved to ${formatStatusLabel$1(targetStatus)}.`
			});
			onUpdateStatus(project, targetStatus);
		}
		dispatch({ type: "resetDragState" });
	};
	const handleKeyboardMoveProject = (project, direction) => {
		if (!canDragProjectKanbanCard(project, pendingStatusUpdates)) return;
		const targetStatus = resolveProjectKanbanMoveTarget(project.status, direction);
		if (!targetStatus) {
			dispatch({
				type: "setBoardAnnouncement",
				message: `${project.name} is already in the ${formatStatusLabel$1(project.status)} column.`
			});
			return;
		}
		dispatch({
			type: "setBoardAnnouncement",
			message: `${project.name} moved to ${formatStatusLabel$1(targetStatus)}.`
		});
		onUpdateStatus(project, targetStatus);
	};
	const handleDragEnd = () => {
		dispatch({ type: "resetDragState" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveRegion, { message: boardAnnouncement }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: keyboardInstructionsId,
				className: "sr-only",
				children: "Use Alt plus Left Arrow or Alt plus Right Arrow on a project card grip to move it between status columns. You can also drag projects by the grip handle. Status updates save when you drop a card in another column."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-1 text-xs text-muted-foreground",
				children: "Drag projects between columns to update status. Use the grip handle so card links and menus stay clickable."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex min-h-[28rem] w-full gap-4 pb-4 pr-2",
					children: columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectKanbanColumn, {
						column,
						dragOverStatus,
						draggedProject,
						handleDragEnd,
						handleDragLeave,
						handleDragOver,
						handleDrop,
						handleDragStart,
						keyboardInstructionsId,
						onDelete,
						onEdit,
						onKeyboardMoveProject: handleKeyboardMoveProject,
						onUpdateStatus,
						pendingStatusUpdates
					}, column.status))
				})
			})
		]
	});
}
function ProjectKanbanColumn({ column, dragOverStatus, draggedProject, handleDragEnd, handleDragLeave, handleDragOver, handleDrop, handleDragStart, keyboardInstructionsId, onDelete, onEdit, onKeyboardMoveProject, onUpdateStatus, pendingStatusUpdates }) {
	const isDragTarget = dragOverStatus === column.status;
	const isDraggingFrom = draggedProject?.sourceStatus === column.status;
	const handleColumnDragOver = (event) => handleDragOver(event, column.status);
	const handleColumnDrop = (event) => handleDrop(event, column.status);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": `${column.label} projects`,
		className: cn("flex min-w-[17.5rem] max-w-[22rem] flex-1 flex-col rounded-xl border border-border/60 bg-muted/15 shadow-sm transition-colors", isDragTarget && "border-primary/30 bg-primary/5 ring-1 ring-primary/15", isDraggingFrom && !isDragTarget && "opacity-60"),
		onDragOver: handleColumnDragOver,
		onDragLeave: handleDragLeave,
		onDrop: handleColumnDrop,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2 border-b border-border/50 px-3.5 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-2.5 rounded-full shadow-sm",
					style: STATUS_DOT_STYLES[column.status]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
					children: column.label
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "secondary",
				className: "h-5 px-1.5 text-[10px] font-semibold tabular-nums",
				children: column.items.length
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "min-h-0 flex-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "list-none space-y-3 p-3",
				children: column.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: cn("flex min-h-24 list-none flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-background/60 p-4 text-center", isDragTarget && "border-primary/35 bg-primary/5"),
					children: draggedProject ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, {
						className: "mb-1.5 size-5 text-muted-foreground",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium text-muted-foreground",
						children: "Drop to move here"
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium text-muted-foreground",
						children: "Empty column"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-[10px] text-muted-foreground/70",
						children: "Drag a project here or use the card menu"
					})] })
				}) : column.items.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanProjectItem, {
					draggedProject,
					handleDragEnd,
					handleDragStart,
					keyboardInstructionsId,
					onDelete,
					onEdit,
					onKeyboardMoveProject,
					onUpdateStatus,
					pending: pendingStatusUpdates.has(project.id),
					project,
					reorderEnabled: canDragProjectKanbanCard(project, pendingStatusUpdates)
				}, project.id))
			})
		})]
	});
}
function KanbanProjectItem({ draggedProject, handleDragEnd, handleDragStart, keyboardInstructionsId, onDelete, onEdit, onKeyboardMoveProject, onUpdateStatus, pending, project, reorderEnabled }) {
	const isDragging = draggedProject?.id === project.id;
	const onGripDragStart = (event) => {
		handleDragStart(event, project);
	};
	const handleKeyDown = (event) => {
		if (!event.altKey) return;
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			onKeyboardMoveProject(project, "previous");
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			onKeyboardMoveProject(project, "next");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
		className: cn("list-none", isDragging && "opacity-40"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-1.5",
			children: [reorderEnabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-1 flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md border border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/60 active:cursor-grabbing",
				"aria-label": `Move ${project.name} to another status column`,
				"aria-describedby": keyboardInstructionsId,
				"aria-keyshortcuts": "Alt+ArrowLeft Alt+ArrowRight",
				"aria-grabbed": isDragging,
				draggable: true,
				onDragStart: onGripDragStart,
				onDragEnd: handleDragEnd,
				onKeyDown: handleKeyDown,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, {
					className: "size-4",
					"aria-hidden": true
				})
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("min-w-0 flex-1 motion-chromatic", reorderEnabled && "active:scale-[0.99]"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectCard, {
					project,
					onDelete,
					onEdit,
					onUpdateStatus,
					isPendingUpdate: pending,
					compact: true,
					kanban: true
				})
			})]
		})
	});
}
function ProjectRowComponent({ project, onDelete, onEdit, onUpdateStatus, isPendingUpdate }) {
	const tasksHref = buildProjectTasksRoute({
		projectId: project.id,
		projectName: project.name,
		clientId: project.clientId,
		clientName: project.clientName
	});
	const StatusIcon = STATUS_ICONS[project.status];
	const overdue = isProjectOverdue(project);
	const handleEdit = () => onEdit(project);
	const statusAccentStyles = Object.fromEntries(Object.entries(STATUS_ACCENT_COLORS).map(([status, backgroundColor]) => [status, { backgroundColor }]));
	const statusUpdateHandlers = Object.fromEntries(PROJECT_STATUSES.flatMap((status) => status !== project.status ? [[status, () => onUpdateStatus(project, status)]] : []));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTransition, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-border/30 sm:p-6", listItemEnterClass, "transition-[border-color,box-shadow,background-color] hover:border-primary/20 hover:bg-muted/15 hover:shadow-md", isPendingUpdate && "pointer-events-none opacity-75"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("absolute bottom-0 left-0 top-0 w-1 rounded-l-xl", project.status === "active" ? "bg-success" : project.status === "planning" ? "bg-muted-foreground/50" : project.status === "on_hold" ? "bg-warning" : "bg-info"),
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors",
								children: project.name
							}),
							overdue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "border-destructive/30 bg-destructive/10 text-destructive text-[10px]",
								children: "Overdue"
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: cn(STATUS_CLASSES[project.status], "h-6 cursor-pointer gap-1.5 border px-2 py-0 hover:opacity-90"),
									children: [isPendingUpdate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIcon, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold uppercase tracking-wider leading-none",
										children: formatStatusLabel$1(project.status)
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "start",
								className: "w-48",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "px-2 py-1.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60",
										children: "Update status"
									})
								}), PROJECT_STATUSES.flatMap((status) => status !== project.status ? [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: statusUpdateHandlers[status],
									className: "gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "size-2 rounded-full",
										style: statusAccentStyles[status]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatStatusLabel$1(status) })]
								}, status)] : [])]
							})] }),
							project.clientName ? project.clientId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
								href: `/dashboard/clients?clientId=${project.clientId}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "h-6 text-[11px] font-medium hover:bg-muted",
									children: project.clientName
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "h-6 text-[11px] border-dashed font-medium",
								children: project.clientName
							}) : null
						]
					}),
					project.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-2xl text-sm text-muted-foreground line-clamp-2 leading-relaxed",
						children: project.description
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectTaskProgress, {
						project,
						className: "max-w-md"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5" }), formatDateRange(project.startDate, project.endDate)]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3.5" }), project.recentActivityAt ? `Active ${formatRelativeTime(project.recentActivityAt)}` : "No recent chat"]
						})]
					}),
					project.tags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: project.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "inline-flex h-5 items-center gap-1 px-2 text-[10px] font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-2.5" }), tag]
						}, tag))
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-col items-end gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right text-[11px] text-muted-foreground tabular-nums",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Created ", formatDate(project.createdAt)] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Updated ", formatDate(project.updatedAt)] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap justify-end gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							className: "h-8 gap-2 text-xs",
							onClick: handleEdit,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" }), "Edit"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: "default",
							className: "h-8 text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
								href: tasksHref,
								prefetch: true,
								children: "Open tasks"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectActionsMenu, {
							project,
							onEdit,
							onDelete,
							onUpdateStatus,
							showEditItem: false
						})
					]
				})]
			})]
		})]
	}) });
}
var ProjectRow = Object.assign(ProjectRowComponent, { displayName: "ProjectRow" });
function ProjectsListState({ error, hasActiveFilters, hasVisibleProjects, initialLoading, loading, onClearAllFilters, onDelete, onEdit, onRefresh, onSearchClear, onUpdateStatus, pendingStatusUpdates, projects, searchInput, sortedProjects, viewMode, onClearFocusAndFilters, hasMoreProjects, loadingMore, onLoadMore }) {
	const openCreateProject = () => {
		document.getElementById("create-project-trigger")?.click();
	};
	if (initialLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3 py-2",
		children: [
			"project-skeleton-1",
			"project-skeleton-2",
			"project-skeleton-3",
			"project-skeleton-4"
		].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full rounded-xl" }, key))
	});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-destructive/40 bg-destructive/10 p-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mx-auto size-10 text-destructive/60" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm font-medium text-destructive",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				className: "mt-4",
				onClick: onRefresh,
				disabled: loading,
				children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 size-4" }), "Try again"]
			})
		]
	});
	if (projects.length === 0 && !hasActiveFilters) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: PROJECTS_THEME.emptyPanel,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, { className: "size-12 text-muted-foreground/40" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 text-lg font-semibold tracking-tight text-foreground",
				children: "No projects yet"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground",
				children: "Create a project to group tasks, timelines, and collaboration. New projects use the client selected in the header."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				className: cn(getButtonClasses("primary"), "mt-6 gap-2"),
				onClick: openCreateProject,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
					className: "size-4",
					"aria-hidden": true
				}), "New project"]
			})
		]
	});
	if (!hasVisibleProjects && hasActiveFilters) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: PROJECTS_THEME.emptyPanel,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, { className: "size-12 text-muted-foreground/40" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 text-lg font-medium text-foreground",
				children: "No matching projects"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Try a different search or reset filters."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center justify-center gap-2",
				children: [searchInput ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: onSearchClear,
					children: "Clear search"
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					onClick: onClearAllFilters,
					children: "Reset filters"
				})]
			})
		]
	});
	if (!hasVisibleProjects) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: PROJECTS_THEME.emptyPanel,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, { className: "size-12 text-muted-foreground/40" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 text-lg font-semibold text-foreground",
				children: "Nothing in this view"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-2 max-w-md text-sm text-muted-foreground",
				children: "Filters, search, or a deep link may be hiding results."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: onClearFocusAndFilters,
					children: "Reset search & filters"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					onClick: openCreateProject,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "mr-2 size-4",
						"aria-hidden": true
					}), "New project"]
				})]
			})
		]
	});
	const loadMoreFooter = hasMoreProjects ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex justify-center border-t border-border/50 py-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "outline",
			size: "sm",
			onClick: onLoadMore,
			disabled: loadingMore || loading,
			children: [loadingMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : null, loadingMore ? "Loading more projects…" : "Load more projects"]
		})
	}) : null;
	if (viewMode === "list") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 py-2",
		children: [sortedProjects.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectRow, {
			project,
			onDelete,
			onEdit,
			onUpdateStatus,
			isPendingUpdate: pendingStatusUpdates.has(project.id)
		}, project.id)), loadMoreFooter]
	});
	if (viewMode === "grid") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
			children: sortedProjects.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectCard, {
				project,
				onDelete,
				onEdit,
				onUpdateStatus,
				isPendingUpdate: pendingStatusUpdates.has(project.id)
			}, project.id))
		}), loadMoreFooter]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectKanban, {
			projects: sortedProjects,
			pendingStatusUpdates,
			onUpdateStatus,
			onEdit,
			onDelete
		}), loadMoreFooter]
	});
}
function ProjectSearch({ value, onChange }) {
	const onSearchQueryChange = (event) => onChange(event.target.value);
	const handleClear = () => {
		onChange("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-w-0 flex-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: "project-search",
				placeholder: "Search by name, client, or tag…",
				value,
				onChange: onSearchQueryChange,
				className: "h-9 border-border/60 bg-background pl-9 pr-20 text-sm shadow-sm",
				"aria-label": "Search projects"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 sm:flex",
				children: value ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardShortcutBadge, {
					combo: "mod+f",
					className: "scale-90 opacity-70"
				})
			}),
			value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: handleClear,
				className: "absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
				"aria-label": "Clear search",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			}) : null
		]
	});
}
function ProjectStatusPills({ statusFilter, statusCounts, totalCount, onStatusChange }) {
	const handleSelectAll = () => {
		onStatusChange("all");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
		className: "m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0",
		"aria-label": "Filter projects by status",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
			label: "All",
			count: totalCount,
			active: statusFilter === "all",
			onClick: handleSelectAll
		}), PROJECT_STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectStatusOptionPill, {
			status,
			count: statusCounts[status] ?? 0,
			active: statusFilter === status,
			onStatusChange
		}, status))]
	});
}
function ProjectStatusOptionPill({ status, count, active, onStatusChange }) {
	const onSelectStatus = () => {
		onStatusChange(status);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
		label: formatStatusLabel$1(status),
		count,
		active,
		dotStyle: STATUS_DOT_STYLES[status],
		onClick: onSelectStatus
	});
}
function StatusPill({ label, count, active, onClick, dotStyle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		"aria-pressed": active,
		className: cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-[background-color,border-color,box-shadow]", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", active ? "border-primary/30 bg-primary/8 text-foreground shadow-sm ring-1 ring-primary/10" : "border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground"),
		children: [
			dotStyle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "size-2 shrink-0 rounded-full",
				style: dotStyle,
				"aria-hidden": true
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums", active ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"),
				children: count
			})
		]
	});
}
function SummaryCard({ label, value, icon: Icon, description, onClick, active }) {
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: cn("overflow-hidden border-border/60 bg-background/80 shadow-sm transition-all", onClick && "hover:border-primary/20 hover:bg-muted/20 hover:shadow-md", active && "border-primary/30 ring-2 ring-primary/15 ring-offset-2 ring-offset-card"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex items-center gap-4 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/30 text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-5",
					"aria-hidden": true
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
						children: label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground",
						children: value
					}),
					description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs text-muted-foreground",
						children: description
					}) : null
				]
			})]
		})
	});
	if (!onClick) return inner;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
		"aria-pressed": active,
		children: inner
	});
}
var VIEW_OPTIONS = [
	{
		mode: "list",
		label: "List",
		icon: List
	},
	{
		mode: "grid",
		label: "Grid",
		icon: LayoutGrid
	},
	{
		mode: "board",
		label: "Board",
		icon: Columns3
	},
	{
		mode: "gantt",
		label: "Timeline",
		icon: ChartGantt
	}
];
function ViewModeSelector({ viewMode, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("fieldset", {
		className: cn(PROJECTS_THEME.segmented, "m-0 min-w-0 border-0 p-0"),
		"aria-label": "Project view mode",
		children: VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewModeButton, {
			mode,
			active: viewMode === mode,
			label,
			icon: Icon,
			onChange
		}, mode))
	});
}
function ViewModeButton({ mode, active, label, icon: Icon, onChange }) {
	const onSelectViewMode = () => onChange(mode);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: PROJECTS_THEME.segmentedItem(active),
			onClick: onSelectViewMode,
			"aria-label": label,
			"aria-pressed": active,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: "size-3.5",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden sm:inline",
				children: label
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, { children: [label, " view"] })] });
}
function ProjectsPageShell() {
	const { initialLoading, handleProjectCreated } = useProjectsPageContext();
	const { user } = useAuth();
	const { clients, selectedClient, selectedClientId } = useClientContext();
	const { isPreviewMode } = usePreview();
	const documentImport = useProjectsDocumentImport({
		workspaceId: user?.agencyId ?? null,
		ownerId: user?.id,
		clients,
		preferredClientId: selectedClientId,
		preferredClientName: selectedClient?.name ?? null,
		disabledReason: isPreviewMode ? "Document import is unavailable in preview mode." : !user?.agencyId || !user?.id ? "Sign in to import projects from documents." : null,
		isPreviewMode,
		onProjectCreated: handleProjectCreated
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: initialLoading,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsPageSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn(DASHBOARD_THEME.layout.container, PROJECTS_THEME.page),
			...documentImport.importDragHandlers,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsDocumentImportOverlay, {
					phase: documentImport.phase,
					statusMessage: documentImport.statusMessage,
					errorMessage: documentImport.errorMessage,
					visible: documentImport.overlayVisible,
					onCancel: documentImport.handleCancel
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsDocumentImportReviewSheet, {
					open: documentImport.reviewOpen,
					documentSummary: documentImport.documentSummary,
					proposedProjects: documentImport.proposedProjects,
					clients,
					preferredClientName: selectedClient?.name ?? null,
					onUpdateProject: documentImport.updateProposedProject,
					onConfirm: documentImport.handleConfirmReview,
					onDiscard: documentImport.handleDismissReview
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsHeaderSection, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsDialogs, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsSummarySection, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsBacklogSection, {})
			]
		})
	}) });
}
function ProjectsHeaderSection() {
	const { handleProjectCreated, handleRefreshProjects, loading, portfolioLabel, projects, setViewMode, viewMode } = useProjectsPageContext();
	const handleRefreshProjectsClick = () => {
		handleRefreshProjects();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardPageHero, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: getIconContainerClasses("medium"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, {
					className: "size-6",
					"aria-hidden": true
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: DASHBOARD_THEME.layout.title,
					children: PAGE_TITLES.projects?.title ?? "Projects"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: cn(DASHBOARD_THEME.layout.subtitle, "mt-1 max-w-2xl text-sm leading-relaxed"),
					children: [
						"Portfolio for ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: portfolioLabel
						}),
						projects.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							" ",
							"· ",
							projects.length,
							" project",
							projects.length === 1 ? "" : "s"
						] }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs text-muted-foreground",
							children: "Drop a PDF, Word file, or image anywhere on this page to import projects with AI."
						})
					]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardShortcutBadge, {
						combo: "mod+f",
						className: "origin-left scale-90"
					}), "Search backlog"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground/40",
					"aria-hidden": true,
					children: "·"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardShortcutBadge, {
						combo: "mod+shift+n",
						className: "origin-left scale-90"
					}), "New project"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground/40",
					"aria-hidden": true,
					children: "·"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					href: "/dashboard/tasks",
					className: "font-medium text-primary underline-offset-4 hover:underline",
					children: "Open tasks"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground/40",
					"aria-hidden": true,
					children: "·"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Drop a PDF or image anywhere to import projects with AI" })
			]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex shrink-0 flex-wrap items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewModeSelector, {
				viewMode,
				onChange: setViewMode
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: handleRefreshProjectsClick,
					className: cn(getButtonClasses("outline"), "h-9 gap-1.5"),
					disabled: loading,
					"aria-label": "Refresh projects",
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: cn("size-4", DASHBOARD_THEME.animations.spin) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: "Refresh"
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Refresh projects list" })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateProjectSheet, { onProjectCreated: handleProjectCreated })
		]
	})] });
}
function ProjectsDialogs() {
	const { deleteDialogOpen, deleting, editDialogOpen, handleDeleteProject, handleProjectUpdated, projectToDelete, projectToEdit, setDeleteDialogOpen, setEditDialogOpen } = useProjectsPageContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditProjectDialog, {
		project: projectToEdit,
		open: editDialogOpen,
		onOpenChange: setEditDialogOpen,
		onProjectUpdated: handleProjectUpdated
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open: deleteDialogOpen,
		onOpenChange: setDeleteDialogOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-5 text-destructive" }), "Delete project?"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
			"Are you sure you want to delete \"",
			projectToDelete?.name,
			"\"? This action cannot be undone. All associated tasks and collaboration history will remain but will no longer be linked to this project."
		] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
			disabled: deleting,
			children: "Cancel"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogAction, {
			onClick: handleDeleteProject,
			disabled: deleting,
			className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			children: [deleting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : null, "Delete"]
		})] })] })
	})] });
}
function ProjectsSummarySection() {
	const { completionRate, openTaskTotal, projects, setStatusFilterAndReset, statusCounts, statusFilter, taskTotal } = useProjectsPageContext();
	const completionStyle = { width: `${completionRate}%` };
	const filterByStatus = (value) => setStatusFilterAndReset(value);
	const handleFilterAll = () => {
		filterByStatus("all");
	};
	const handleFilterActive = () => {
		filterByStatus("active");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-4",
		"aria-label": "Portfolio summary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: PROJECTS_THEME.summaryStrip,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
						label: "Total projects",
						icon: Briefcase,
						value: projects.length,
						description: statusCounts.completed > 0 ? `${statusCounts.completed} completed` : "All initiatives",
						onClick: handleFilterAll,
						active: statusFilter === "all"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
						label: "Active focus",
						icon: ListChecks,
						value: statusCounts.active,
						description: `${statusCounts.planning} in planning`,
						onClick: handleFilterActive,
						active: statusFilter === "active"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
						label: "Open tasks",
						icon: Users,
						value: openTaskTotal,
						description: taskTotal > 0 ? `${taskTotal - openTaskTotal} closed` : "Waiting for tasks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex min-w-0 items-center gap-4 rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-1.5 flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
										children: "Portfolio health"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm font-semibold tabular-nums text-info",
										children: [completionRate, "%"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "relative h-2 w-full overflow-hidden rounded-full bg-muted/60",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full bg-linear-to-r from-info to-primary motion-chromatic-slow",
										style: completionStyle
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-[11px] text-muted-foreground",
									children: "Share of projects marked completed"
								})
							]
						})
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectStatusPills, {
			statusFilter,
			statusCounts,
			totalCount: projects.length,
			onStatusChange: filterByStatus
		})]
	});
}
function ProjectsBacklogSection() {
	const { activeFilterLabels, clearFocusedProject, clearAllFilters, error, focusedProject, focusedProjectRecord, focusedProjectTasksHref, handleMilestoneCreated, handleLoadMore, handleRefreshProjects, handleUpdateStatus, hasActiveFilters, hasMoreProjects, hasVisibleProjects, debouncedSearchQuery, initialLoading, loadMilestones, loading, loadingMore, milestonesByProject, milestonesError, milestonesLoading, openDeleteDialog, openEditDialog, pendingStatusUpdates, projects, searchInput, setSearchInput, setSortField, sortDirection, sortField, sortedProjects, toggleSortDirection, viewMode } = useProjectsPageContext();
	const handleMilestoneRefresh = () => {
		loadMilestones(projects.map((project) => project.id));
	};
	const handleRefreshProjectsClick = () => {
		handleRefreshProjects();
	};
	const handleSearchClear = () => {
		setSearchInput("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: PROJECTS_THEME.workspace,
		"aria-label": "Project backlog",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: PROJECTS_THEME.workspaceRail,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 space-y-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold tracking-tight text-foreground",
						children: "Backlog"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: ["Search and sort update after you pause typing.", projects.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums",
							"aria-live": "polite",
							children: [
								" ",
								"·",
								" ",
								searchInput.trim() !== debouncedSearchQuery.trim() ? "Matching…" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									"Showing ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-foreground",
										children: sortedProjects.length
									}),
									" of",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-foreground",
										children: projects.length
									})
								] })
							]
						}) : null]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn(PROJECTS_THEME.toolbar, "w-full lg:max-w-2xl lg:justify-end"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectSearch, {
						value: searchInput,
						onChange: setSearchInput
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectFilters, {
						sortField,
						sortDirection,
						onSortFieldChange: setSortField,
						onToggleSortDirection: toggleSortDirection
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 border-b border-border/50 bg-background/90 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectActiveFilters, {
					labels: activeFilterLabels,
					onClearAll: clearAllFilters
				}), focusedProject.id || focusedProject.name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: PROJECTS_THEME.focusBanner,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-semibold text-foreground",
							children: ["Linked project", focusedProjectRecord?.name ? `: ${focusedProjectRecord.name}` : focusedProject.name ? `: ${focusedProject.name}` : ""]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Opened from a task or cross-link. Clear to see the full portfolio."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [focusedProjectTasksHref ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								type: "button",
								size: "sm",
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
									href: focusedProjectTasksHref,
									children: "Related tasks"
								})
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "ghost",
								onClick: clearFocusedProject,
								children: "Show all"
							})]
						})]
					})
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn(PROJECTS_THEME.content, viewMode === "list" && "bg-muted/[0.15]"),
				children: viewMode === "gantt" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GanttView, {
					projects: sortedProjects,
					milestones: milestonesByProject,
					loading: milestonesLoading,
					error: milestonesError,
					onRefresh: handleMilestoneRefresh,
					onMilestoneCreated: handleMilestoneCreated
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsListState, {
					error,
					hasActiveFilters,
					hasVisibleProjects,
					initialLoading,
					loading,
					onClearAllFilters: clearAllFilters,
					onDelete: openDeleteDialog,
					onEdit: openEditDialog,
					hasMoreProjects,
					loadingMore,
					onLoadMore: handleLoadMore,
					onRefresh: handleRefreshProjectsClick,
					onSearchClear: handleSearchClear,
					onUpdateStatus: handleUpdateStatus,
					pendingStatusUpdates,
					projects,
					searchInput,
					sortedProjects,
					viewMode,
					onClearFocusAndFilters: clearAllFilters
				})
			})
		]
	});
}
function ProjectsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionShell, {
		reveal: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsPageProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsPageShell, {}) })
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsPage, {});
//#endregion
export { SplitComponent as component };
